import OpenAI from 'openai';

import { MAX_OUTPUT_TOKENS } from './ai-policy';
import { reportError } from './observability';

/**
 * LLM 경계 — **벤더가 갇히는 유일한 파일이다.**
 *
 * 모델을 바꾸는 것과 벤더를 바꾸는 것은 다른 일이다(`docs/AI_REPORT_SYSTEM.md` §4.2).
 * 모델은 환경변수 한 줄이지만 벤더는 SDK·거부 처리·구조화 출력 문법이 전부 다르다.
 * 그 차이를 여기서 흡수해 라우트는 `{summary, concern}`만 알게 한다.
 *
 * 🔴 **본문이 이 함수를 평문으로 지나간다.** 백업과 정반대다 —
 *   백업은 암호문이 Storage로 직행해 우리 함수를 안 지나가지만, AI는 반드시 지나간다.
 *   그래서 고지도 정반대다: *"저장하지 않습니다"(O) / "볼 수 없습니다"(X)*(CLAUDE.md §5.1).
 *
 * 🔴 **어떤 경로에서도 프롬프트를 로그에 남기지 않는다.** `reportError`에 넘기는 것은
 *   에러와 짧은 문맥 문자열뿐이고, 그 문맥에 본문 조각을 넣지 않는다. 관측 도구에
 *   본문이 섞여 들어가는 것이 가장 흔한 유출 경로다(§5.1-5).
 */

/**
 * 채택 모델 — **GPT-5.6 Luna**(2026-08-12 사용자 결정).
 *
 * ⚠ 이 id는 추측이 아니라 설치된 SDK의 `ChatModel` 유니온에서 확인했다
 *   (`openai@7.4.0` → `resources/shared.d.ts`). 모델 id를 기억으로 적으면 400을 받는다.
 */
const DEFAULT_MODEL = 'gpt-5.6-luna';

/**
 * 추론 강도.
 *
 * ⏭ **P1 실측 전까지 `low`다.** 리포트는 긴 추론이 필요한 과제가 아니고(읽고 요약한다),
 *   원가는 추론 토큰에서 가장 크게 벌어진다. 실측 후 확정한다(§4).
 */
const DEFAULT_EFFORT = 'low';

export interface GenerateArgs {
  system: string;
  user: string;
  /** 앱의 `REPORT_SCHEMA`를 그대로 받는다 — 스키마가 두 벌이 되면 반드시 어긋난다 */
  schema: Record<string, unknown>;
}

export interface GenerateOk {
  ok: true;
  summary: string;
  concern: boolean;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * 실패 종류.
 *
 * ⚠ `refused`와 `error`를 나누는 이유는 **캡 때문**이다. 거부는 우리 잘못도 사용자 잘못도
 *   아니므로 그 주의 몫을 소모시키지 않는다(§5). 뭉뚱그리면 가장 힘든 주에 리포트를 잃는다.
 */
export type GenerateFail =
  | 'not-configured' // API 키가 없다
  | 'refused' // 안전 분류기가 거부했다. **예상 경로다**
  | 'truncated' // 출력 상한에 걸려 잘렸다
  | 'malformed' // 구조화 출력을 켰는데도 파싱이 안 된다
  | 'upstream'; // 벤더가 죽었거나 느리다

export type GenerateResult = GenerateOk | { ok: false; reason: GenerateFail };

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (key === undefined || key.length === 0) {
    return null;
  }
  // ⚠ 키를 로그·에러 메시지에 절대 넣지 않는다. 여기서 한 번 읽고 클라이언트에 묻는다.
  client ??= new OpenAI({ apiKey: key });
  return client;
}

/** 구조화 출력이 강제되므로 여기 오는 문자열은 스키마를 만족한다. 그래도 믿지 않고 확인한다 */
function parseOutput(raw: string): { summary: string; concern: boolean } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  const summary = obj.summary;
  const concern = obj.concern;
  if (typeof summary !== 'string' || summary.trim().length === 0) return null;
  if (typeof concern !== 'boolean') return null;
  return { summary, concern };
}

/**
 * 모델이 명시적으로 거부했는가.
 *
 * 🔴 **`output_text`를 읽기 전에 확인한다.** 거부는 HTTP 200으로 오고 본문이 비어 있다 —
 *   무조건 텍스트를 읽는 코드는 "빈 요약"을 저장하고 조용히 성공한 척한다.
 *   감정 일기는 안전 분류기가 오탐할 만한 내용을 담으므로 **예외가 아니라 예상 경로다**(§4.3).
 */
function isRefusal(output: { type: string; content?: unknown }[]): boolean {
  return output.some((item) => {
    if (item.type !== 'message') return false;
    const content = item.content;
    if (!Array.isArray(content)) return false;
    return content.some((part) => (part as { type?: string }).type === 'refusal');
  });
}

export async function generateReport(args: GenerateArgs): Promise<GenerateResult> {
  const openai = getClient();
  if (openai === null) {
    return { ok: false, reason: 'not-configured' };
  }

  const model = process.env.AI_MODEL ?? DEFAULT_MODEL;
  const effort = (process.env.AI_EFFORT ?? DEFAULT_EFFORT) as 'low' | 'medium' | 'high';

  let response;
  try {
    response = await openai.responses.create({
      model,
      instructions: args.system,
      input: args.user,
      /*
       * 🔴 **`store: false`.** 기본값으로 두면 벤더가 응답을 조회 가능한 형태로 보관하고,
       *   그러면 처리방침의 "운영자는 저장하지 않습니다"는 지켜도 **사용자 입장에서
       *   남는 사본이 하나 더 생긴다.** 남용 감시 30일과는 별개의 저장이다(§9.2).
       */
      store: false,
      reasoning: { effort },
      max_output_tokens: MAX_OUTPUT_TOKENS,
      /*
       * ⚠ Responses API의 json_schema는 **평평하다**(`{type, name, schema, strict}`).
       *   Chat Completions의 중첩형(`json_schema: {...}`)과 다르다 — 설치된 SDK의
       *   `ResponseFormatTextJSONSchemaConfig`에서 확인했다. 기억으로 쓰면 400이다.
       */
      text: {
        format: {
          type: 'json_schema',
          name: 'jogak_report',
          schema: args.schema,
          strict: true,
        },
      },
    });
  } catch (error) {
    // ⚠ 에러만 넘긴다. 프롬프트도 입력도 넘기지 않는다 — 그게 곧 일기다.
    reportError(error, 'ai.generate');
    return { ok: false, reason: 'upstream' };
  }

  if (isRefusal(response.output as { type: string; content?: unknown }[])) {
    return { ok: false, reason: 'refused' };
  }
  if (response.status === 'incomplete') {
    return { ok: false, reason: 'truncated' };
  }
  if (response.status !== 'completed') {
    return { ok: false, reason: 'upstream' };
  }

  const parsed = parseOutput(response.output_text);
  if (parsed === null) {
    /*
     * 구조화 출력을 켰는데 여기 오면 스키마가 거절됐거나 모델이 빈 응답을 준 것이다.
     * ⚠ 거부의 또 다른 모양일 수 있으므로 **캡을 소모시키지 않는 쪽**으로 분류한다.
     */
    return { ok: false, reason: 'malformed' };
  }

  return {
    ok: true,
    summary: parsed.summary,
    concern: parsed.concern,
    model: typeof response.model === 'string' ? response.model : model,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
