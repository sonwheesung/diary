/**
 * 운영 알림 — Discord 웹훅 (`docs/AI_REPORT_SYSTEM.md` §5.1).
 *
 * 앱은 원격 관측이 0이라, 이게 없으면 **사용자가 문의를 보내야 실패를 안다.**
 * AI 호출 실패는 대체로 우리 잘못(키 만료·벤더 장애·프롬프트 문제)이므로 우리가 먼저 알아야 한다.
 *
 * 🔴 **본문을 절대 보내지 않는다.** §5.1의 무저장 약속이 여기서 깨지면 아무 의미가 없다.
 *   `observability.ts`의 `reportError`와 같은 규약이다 — 이 파일은 **인자로 문자열을 받지 않고**
 *   구조화된 필드만 받는다. 실수로 본문을 넘길 자리를 아예 만들지 않는 것이 목적이다.
 *
 * ⚠ **fire-and-forget.** 절대 `await`하지 않는다 — Discord가 죽었다고 사용자의 요청이
 *   실패하면 안 된다. 던지지도 않는다.
 */

/** 웹훅이 설정되지 않았으면 조용히 아무것도 하지 않는다 — 로컬 개발에서 소음이 되면 안 된다 */
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL ?? '';

export interface AiFailureNotice {
  /** `refused` · `upstream` · `not-configured` 등. **자유 문자열이 아니라 코드다** */
  reason: string;
  kind: string;
  periodKey: string;
  /**
   * subject 식별자의 **해시 앞 8자**.
   *
   * ⚠ 원본을 보내지 않는 이유는 `ADMIN_SYSTEM` §3과 같다 — 앞자리만으로
   *   *"같은 사람이 반복 실패하는가"* 는 알 수 있고 신원은 만들 수 없다.
   */
  subjectRef: string;
  /** 잠금이 걸렸는가 */
  cooled: boolean;
}

/**
 * AI 호출 실패를 알린다. **호출부는 `void`로 버린다.**
 *
 * ⚠ 여기서 던지면 라우트의 catch가 삼켜 500이 될 수 있다 — 그래서 내부에서 전부 잡는다.
 */
export function notifyAiFailure(notice: AiFailureNotice): void {
  if (WEBHOOK.length === 0) {
    return;
  }
  /*
   * 문자열을 **여기서 조립한다.** 호출부가 메시지를 만들어 넘기게 하면
   * 언젠가 누군가 거기에 일기 한 줄을 붙인다.
   */
  const lines = [
    `🔴 **조각 AI 리포트 실패** — \`${notice.reason}\``,
    `· 종류: \`${notice.kind}\` · 기간: \`${notice.periodKey}\``,
    `· subject: \`${notice.subjectRef}\``,
    notice.cooled ? '· ⏸ 1시간 잠금이 걸렸습니다' : '· 잠금 없음 (모델을 부르지 않은 실패)',
  ];

  void fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n') }),
  }).catch(() => {
    /*
     * 삼킨다. 알림이 안 갔다고 사용자 요청을 실패시키지 않는다.
     * ⚠ 여기서 reportError를 부르지 않는다 — 웹훅이 죽었을 때 로그가 폭주한다.
     */
  });
}

/**
 * 🔴 **서버가 아픈 것을 사람에게 알린다** (2026-09-04).
 *
 * 이게 없어서 **2026-08-28 ~ 09-02, 백업·AI 가 5일간 죽어 있는데 아무도 몰랐다.**
 * `/api/health` 는 물어보면 답했지만 **아무도 안 물어봤고**, `reportError` 는
 * `console.error` 뿐이라 Vercel 로그에만 쌓였다. 사용자가 *"리포트 결과 좀 보자"* 고
 * 물어서야 드러났다 — 안 물어봤으면 더 갔다.
 *
 * → 크론이 매일 도는 김에 **상태를 보고 나쁠 때만** 부른다.
 *
 * ⚠ **나쁠 때만 보낸다.** 매일 "정상입니다"가 오면 사람이 곧 안 읽고, 그러면
 *   진짜 알림도 같이 안 읽힌다. 조용한 것이 정상 신호다.
 * ⚠ 본문·식별자를 보내지 않는다 — 위 `notifyAiFailure` 와 같은 규약이다.
 */
export interface OpsAlert {
  /** `db-down` · `storage-unset` 등. **자유 문장이 아니라 코드다** */
  reason: string;
  /** 어디서 났나 — `cron/reap` 처럼 경로만 */
  where: string;
  /** 사람이 바로 할 일 한 줄. 코드가 정한 문구만 쓴다 */
  hint?: string;
}

export function notifyOps(alert: OpsAlert): void {
  if (WEBHOOK.length === 0) {
    return;
  }
  const lines = [
    `🔴 **조각 서버 이상** — \`${alert.reason}\``,
    `· 위치: \`${alert.where}\``,
    ...(alert.hint === undefined ? [] : [`· ${alert.hint}`]),
  ];
  void fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n') }),
  }).catch(() => {
    /* 삼킨다 — 알림 실패가 크론을 실패시키지 않는다 */
  });
}
