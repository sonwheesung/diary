import { DEV_SESSION_TOKEN } from '@/features/support/dev-auth';
import { BACKUP_SERVER_URL } from '@/features/backup/api/client';
import { readSessionToken } from '@/lib/common-server/client';
import type { ReportKind } from '@/features/ai/types';

/**
 * 조각 서버 AI 프록시 클라이언트.
 *
 * 🔴 **여기를 지나는 것은 평문이다.** 백업 클라이언트와 정반대다 —
 *   백업은 암호문을 Storage에 직접 올려 서버 함수를 지나가지 않지만, AI는 본문이
 *   우리 서버 메모리를 **반드시** 지나간다. 그래서 고지도 정반대다:
 *   AI = *"저장하지 않습니다"* / 백업 = *"우리는 읽지 못합니다"*(CLAUDE.md §5.1).
 *   두 클라이언트를 한 파일에 합치지 않는 이유가 이것이다.
 *
 * ⚠ **실패를 throw하지 않는다** — 백업 클라이언트와 같은 규약이다. 화면은 사유만 보고 갈린다.
 *
 * ⚠ 서버 URL은 백업과 **같은 조각 서버**를 쓴다. 라우트만 `/api/v1/ai/*`로 다르다 —
 *   서버를 하나 더 세울 이유가 없고, 신원 검증(`identify()`)도 같은 것을 재사용한다.
 */

/**
 * 실패 사유. 서버의 `FailCode`와 짝을 맞춘다.
 *
 * ⚠ `refused`가 **정상 경로에 있다.** 감정 일기는 안전 분류기가 오탐할 만한 내용을 담으므로
 *   거부는 예외가 아니라 예상되는 응답이다(`docs/AI_REPORT_SYSTEM.md` §3).
 *   그리고 거부는 **캡을 소모하지 않는다** — 우리 잘못으로 그 주 리포트를 잃게 두지 않는다.
 */
export type AiFail =
  | 'not-configured' // 서버 URL이 빌드에 안 박혔다
  | 'offline'
  | 'unauthorized'
  | 'not-subscribed'
  | 'cap-exceeded' // 이번 주 몫을 이미 썼다
  | 'refused' // 모델이 거부했다. 캡은 그대로다
  | 'empty' // 요약할 내용이 없다
  /**
   * 백필 지평(작년 1월 1일) 밖이거나 **아직 안 끝난** 기간이다(§6.4).
   *
   * ⚠ 앱이 먼저 막으므로 정상 앱에서는 오지 않는다. 오면 낡은 버전이거나 시계가 어긋난 것이다.
   */
  | 'out-of-range'
  | 'in-progress' // 같은 reportId가 이미 처리 중이다(멱등 키)
  /**
   * 직전 호출이 모델을 부르고 실패해 **1시간 잠겼다**(`docs/AI_REPORT_SYSTEM.md` §5.1).
   *
   * ⚠ `rate-limited`·`cap-exceeded`와 다르다 — 이건 **우리 쪽 실패** 때문이고
   *   사용자 잘못이 아니다. 문구도 그렇게 쓴다. 기간 캡은 그대로라 한 시간 뒤 만들 수 있다.
   */
  | 'cooling-down'
  | 'rate-limited'
  | 'upstream'
  | 'error';

export interface AiReportResponse {
  summary: string;
  concern: boolean;
  model: string;
  promptVer: number;
}

/**
 * ⚠ `retryAt`은 **`cooling-down`에만** 실려 온다(epoch ms). 없으면 화면이 뭉뚱그린 문장으로
 *   떨어진다 — 서버가 보내주는데도 버려서 *"한 시간 뒤"* 라고만 말하던 것을 고쳤다(2026-08-17).
 */
export type AiResult<T> =
  | ({ ok: true } & T)
  | { ok: false; reason: AiFail; retryAt?: number };

/**
 * 리포트 생성은 LLM 왕복이라 백업 호출보다 훨씬 느리다.
 *
 * 🔴 **서버(`maxDuration = 300`)보다 반드시 길어야 한다.** 앱이 먼저 끊으면
 *   **서버는 성공해 캡을 쓰는데 앱은 실패로 본다** — 주간 캡이 1이라 그 기간 리포트를
 *   영영 잃는다. 반대로 서버가 먼저 끊기면 `ai_usage` 쓰기에 도달하지 못해 캡이 안 나간다.
 *   즉 **긴 쪽이 앱이어야 안전한 실패**가 된다.
 *
 * ⚠ 한때 180초였다(서버 300초). 그 120초 창이 정확히 위 사고를 만들고 있었다.
 * ⚠ 서버는 논스트리밍(`openai.responses.create()`)이라 이 시간 내내 아무것도 오지 않는다.
 *   화면은 부정 진행 표시로 버틴다 — 정상은 20~60초이고 이 값은 꼬리를 위한 것이다.
 */
const TIMEOUT_MS = 310_000;

function mapStatus(status: number): AiFail {
  if (status === 401) return 'unauthorized';
  if (status === 402 || status === 403) return 'not-subscribed';
  if (status === 409) return 'in-progress';
  if (status === 422) return 'refused';
  if (status === 429) return 'cap-exceeded';
  if (status === 503) return 'upstream';
  return 'error';
}

/** 점검용 토큰 — 로컬 스텁 서버에서만 통한다. 세션이 있으면 세션이 이긴다 */
const DEVICE_CHECK_TOKEN = process.env.EXPO_PUBLIC_DEVICE_CHECK === '1' ? DEV_SESSION_TOKEN : null;

export interface CreateReportRequest {
  /** 앱이 만든 UUID. **멱등 키다** — 재시도가 두 번 과금되지 않게 한다 */
  reportId: string;
  kind: ReportKind;
  /** `2026-W33` · `2026-08` · `2026` */
  periodKey: string;
  /** 출력 언어 코드. 앱 언어 또는 사용자가 따로 고른 값(§6) */
  lang: string;
  /** 주간이면 조각 원문. 월간·연간이면 비어 있다 */
  entries: { date: string; emotion: string | null; title: string | null; text: string }[];
  /** 월간이면 그 달의 주간 요약, 연간이면 그 해의 월간 요약. 주간이면 비어 있다 */
  subReports: { periodKey: string; summary: string }[];
}

export async function requestReport(
  body: CreateReportRequest,
): Promise<AiResult<AiReportResponse>> {
  if (BACKUP_SERVER_URL.length === 0) {
    return { ok: false, reason: 'not-configured' };
  }
  const token = (await readSessionToken()) ?? DEVICE_CHECK_TOKEN;
  if (token === null) {
    return { ok: false, reason: 'unauthorized' };
  }

  const controller = new AbortController();
  // ⚠ `AbortSignal.timeout()`은 Hermes에 없다. 백업 클라이언트가 이걸로 한 번 크게 넘어졌다.
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BACKUP_SERVER_URL}/api/v1/ai/report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    /*
     * 🔴 **에러 객체를 로깅하지 않는다.** fetch 실패 객체에는 요청 본문이 실려 오는
     *   런타임이 있고, 그 본문은 일기 평문이다. 백업 클라이언트는 점검 모드에서
     *   `console.log`를 남기지만 **여기서는 그것조차 하지 않는다**(CLAUDE.md §5.1-5).
     */
    return { ok: false, reason: 'offline' };
  } finally {
    clearTimeout(timer);
  }

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: res.ok ? 'error' : mapStatus(res.status) };
  }

  if (!res.ok) {
    const reason = typeof json.reason === 'string' ? json.reason : null;
    /*
     * ⚠ 서버가 ISO 문자열로 준다. 파싱 실패는 **없는 것으로 본다** — 시각을 못 읽었다고
     *   실패 안내 자체를 막을 이유가 없고, 화면은 시각 없는 문장으로 떨어지면 된다.
     */
    const parsed = typeof json.retryAt === 'string' ? Date.parse(json.retryAt) : Number.NaN;
    return {
      ok: false,
      // 서버가 사유를 명시했으면 그것을 믿는다 — 상태 코드보다 구체적이다
      reason: (reason as AiFail | null) ?? mapStatus(res.status),
      ...(Number.isNaN(parsed) ? {} : { retryAt: parsed }),
    };
  }

  const summary = typeof json.summary === 'string' ? json.summary : null;
  if (summary === null || summary.trim().length === 0) {
    // 200인데 본문이 비어 오는 것은 거부의 전형적인 모양이다. 캡을 소모한 것으로 보지 않는다.
    return { ok: false, reason: 'refused' };
  }

  return {
    ok: true,
    summary,
    concern: json.concern === true,
    model: typeof json.model === 'string' ? json.model : 'unknown',
    promptVer: typeof json.promptVer === 'number' ? json.promptVer : 0,
  };
}
