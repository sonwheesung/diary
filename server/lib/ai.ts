import OpenAI from 'openai';
import { DEFAULT_EFFORT, DEFAULT_MODEL } from '@/lib/ai-policy';

import { METRIC_CODES, TOPIC_CODES, pickHeadlineFrom } from '@shared/ai/types';
import type { MetricCode, MetricValue, TopicCode, TopicValue } from '@shared/ai/types';

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

/*
 * 🔴 모델·effort 기본값은 **`ai-policy.ts`가 유일한 집**이다(2026-09-04).
 *   전에는 여기와 운영 콘솔이 각자 적어놨고 콘솔 쪽이 `low`로 낡아 있었다.
 */

export interface GenerateArgs {
  system: string;
  user: string;
  /** 앱의 `REPORT_SCHEMA`를 그대로 받는다 — 스키마가 두 벌이 되면 반드시 어긋난다 */
  schema: Record<string, unknown>;
  /**
   * 프롬프트에 **실제로 넣어준 자료의 키**(§8.2.1). 주간이면 날짜, 상위면 하위 기간 키.
   *
   * 🔴 `headlineFrom` 검증에만 쓴다. 라우트가 계산해 넘긴다 — 이 파일은 벤더 경계라
   *   일기 구조를 몰라야 하고, 그래서 목록을 받아 대조만 한다.
   */
  allowed: readonly string[];
}

export interface GenerateOk {
  ok: true;
  /**
   * 핵심 한 줄(§8.2).
   *
   * 🔴 **`undefined`가 정상이다.** `summary`·`concern`과 판정을 다르게 하는 이유는
   *   `metrics`와 같다 — 한 줄이 없다고 그 기간을 영영 잃게 만들지 않는다(캡이 평생 1번).
   */
  headline?: string;
  /**
   * 한 줄이 기댄 자료의 키(§8.2.1). **여기서 이미 걸러진 것**이다 —
   * 모델이 지어낸 키는 `pickHeadlineFrom`이 버린다. 앱은 그대로 쓴다.
   */
  headlineFrom?: string[];
  summary: string;
  concern: boolean;
  /**
   * 지표 넷과 그 밖의 주제 (§8.4).
   *
   * ⚠ **빈 배열일 수 있다.** 모델이 안 냈거나 코드가 우리가 아는 목록 밖이면 버린다 —
   *   요약은 온전하므로 실패로 만들지 않는다. 캡이 평생 1번이라 재시도가 없어서다.
   */
  metrics: MetricValue[];
  topics: TopicValue[];
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

/**
 * 구조화 출력이 강제되므로 여기 오는 문자열은 스키마를 만족한다. 그래도 믿지 않고 확인한다.
 *
 * 🔴 **요약과 지표의 판정을 다르게 한다** (§8.4).
 *   `summary`·`concern`이 없으면 리포트가 성립하지 않으니 `null`(실패)이다.
 *   반면 `metrics`·`topics`가 없거나 깨져 있으면 **빈 배열로 떨어뜨린다** — 지표 하나 때문에
 *   사용자가 그 기간을 영영 잃게 만들지 않는다(캡이 평생 1번이라 재시도가 없다).
 */
function parseOutput(
  raw: string,
  /** 프롬프트에 실제로 넣어준 자료의 키. `headlineFrom` 검증에 쓴다(§8.2.1) */
  allowed: readonly string[],
): {
  headline?: string;
  headlineFrom?: string[];
  summary: string;
  concern: boolean;
  metrics: MetricValue[];
  topics: TopicValue[];
} | null {
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
  /* ⚠ 없거나 빈 문자열이면 **없는 것으로** 떨어뜨린다 — 실패로 만들지 않는다(§8.2) */
  const headline = obj.headline;
  /*
   * 🔴 **모델이 지어낸 키를 여기서 버린다**(§8.2.1). 눌렀는데 아무것도 없으면
   *   그 순간 *"AI가 아무 말이나 한다"* 가 되고, 이 기능이 만들려던 신뢰가 반대로 무너진다.
   */
  const from = pickHeadlineFrom(obj.headlineFrom, allowed);
  return {
    ...(typeof headline === 'string' && headline.trim().length > 0 ? { headline } : {}),
    ...(from.length === 0 ? {} : { headlineFrom: from }),
    summary,
    concern,
    metrics: pickMetrics(obj.metrics),
    topics: pickTopics(obj.topics),
  };
}

/** 아는 코드만, 순서를 고정해서. 모르는 코드는 조용히 버린다 — 화면이 그릴 수 없는 값이다 */
function pickMetrics(value: unknown): MetricValue[] {
  if (!Array.isArray(value)) return [];
  const byCode = new Map<string, MetricValue>();
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    const code = row.code;
    if (typeof code !== 'string' || !METRIC_CODES.includes(code as MetricCode)) continue;
    if (typeof row.value !== 'number' || !Number.isFinite(row.value)) continue;
    byCode.set(code, {
      code: code as MetricCode,
      value: Math.max(0, Math.min(100, Math.round(row.value))),
      /*
       * 🔴 `stress`·`happiness`는 **날로 셀 수 없다.** 모델이 숫자를 넣어 와도 버린다 —
       *   화면이 `—`로 그려야 하는 자리이고, 안 버리면 *"행복한 날 3일"* 이 뜬다(§8.4).
       */
      days:
        code === 'stress' || code === 'happiness'
          ? null
          : typeof row.days === 'number' && Number.isFinite(row.days)
            ? Math.max(0, Math.round(row.days))
            : null,
      basis: typeof row.basis === 'string' ? row.basis : '',
    });
  }
  return METRIC_CODES.map((code) => byCode.get(code)).filter(
    (m): m is MetricValue => m !== undefined,
  );
}

function pickTopics(value: unknown): TopicValue[] {
  if (!Array.isArray(value)) return [];
  const out: TopicValue[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    const code = row.code;
    if (typeof code !== 'string' || !TOPIC_CODES.includes(code as TopicCode)) continue;
    if (seen.has(code)) continue;
    if (typeof row.days !== 'number' || !Number.isFinite(row.days) || row.days <= 0) continue;
    seen.add(code);
    out.push({
      code: code as TopicCode,
      days: Math.round(row.days),
      note: typeof row.note === 'string' ? row.note : '',
    });
  }
  return out;
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

  const parsed = parseOutput(response.output_text, args.allowed);
  if (parsed === null) {
    /*
     * 구조화 출력을 켰는데 여기 오면 스키마가 거절됐거나 모델이 빈 응답을 준 것이다.
     * ⚠ 거부의 또 다른 모양일 수 있으므로 **캡을 소모시키지 않는 쪽**으로 분류한다.
     */
    return { ok: false, reason: 'malformed' };
  }

  return {
    ok: true,
    ...(parsed.headline === undefined ? {} : { headline: parsed.headline }),
    ...(parsed.headlineFrom === undefined ? {} : { headlineFrom: parsed.headlineFrom }),
    summary: parsed.summary,
    concern: parsed.concern,
    metrics: parsed.metrics,
    topics: parsed.topics,
    model: typeof response.model === 'string' ? response.model : model,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
