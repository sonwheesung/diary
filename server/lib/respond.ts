import { NextResponse } from 'next/server';

/**
 * 응답 규약 — 앱의 `FailReason`과 짝을 맞춘다.
 *
 * ⚠ **상류 장애에 401을 쓰지 않는다.** 앱 SDK가 401을 받으면 세션을 폐기한다.
 *   common_server가 잠깐 느린 것으로 사용자가 로그아웃되면 안 된다 → 503.
 */
export type FailCode =
  | 'unauthorized'      // 401 — 토큰이 없거나 죽었다. 앱이 세션을 버려도 되는 유일한 경우
  | 'not-subscribed'    // 403 — 구독이 없다. ⚠ **쓰기에만** 쓴다(§읽기는 구독 무관)
  | 'no-grant'          // 403 — 이 계정은 이 금고의 라이터가 아니다. 되찾기 안내
  | 'quota-exceeded'    // 403
  | 'no-vault'          // 404 — 금고가 없다
  | 'seq-conflict'      // 409 — 기대한 세대가 아니다
  | 'vault-purged'      // 410 — 유예 만료로 파기됐다. **404를 주면 영원히 모른다**
  | 'too-large'         // 413
  | 'rate-limited'      // 429
  | 'upstream'          // 503 — common_server가 죽었다. 401이 아니다
  | 'error'             // 500
  /* ── AI 리포트 (docs/AI_REPORT_SYSTEM.md §7) ───────────────────────────── */
  | 'cap-exceeded'      // 429 — 이 기간 몫을 이미 썼다. rate-limited와 뜻이 다르다
  | 'refused'           // 422 — 모델이 거부했다. **캡을 소모하지 않았다**
  | 'empty'             // 422 — 요약할 내용이 없다
  | 'in-progress'       // 409 — 같은 멱등 키가 처리 중이다
  | 'cooling-down'      // 429 — 직전 호출이 모델을 부르고 실패했다. 1시간 뒤 다시(§5.1)
  | 'not-configured';   // 503 — API 키가 없다. 배포 문제이지 사용자 문제가 아니다

const STATUS: Record<FailCode, number> = {
  unauthorized: 401,
  'not-subscribed': 403,
  'no-grant': 403,
  'quota-exceeded': 403,
  'no-vault': 404,
  'seq-conflict': 409,
  'vault-purged': 410,
  'too-large': 413,
  'rate-limited': 429,
  upstream: 503,
  error: 500,
  /*
   * ⚠ `refused`·`empty`가 4xx인 이유: 서버는 정상 동작했고 요청이 처리될 수 없었을 뿐이다.
   *   500으로 주면 앱이 재시도하는데, 재시도해도 결과가 같다.
   * ⚠ `cap-exceeded`는 429지만 `rate-limited`와 **뜻이 다르다** — 전자는 이번 기간 몫을
   *   다 쓴 것이라 기다려도 안 열리고, 후자는 잠시 뒤 열린다. 앱이 다른 문구를 띄운다.
   */
  'cap-exceeded': 429,
  refused: 422,
  empty: 422,
  'in-progress': 409,
  /*
   * ⚠ `rate-limited`·`cap-exceeded`와 같은 429지만 셋 다 뜻이 다르다:
   *   rate-limited  잠시 뒤 열린다        cap-exceeded  이번 기간 몫을 다 썼다(안 열린다)
   *   cooling-down  **한 시간 뒤 열린다** — 우리 쪽 실패 때문이라 사용자 잘못이 아니다
   */
  'cooling-down': 429,
  'not-configured': 503,
};

export function ok<T extends object>(body: T): NextResponse {
  return NextResponse.json({ ok: true, ...body });
}

export function fail(reason: FailCode, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: false, reason, ...extra }, { status: STATUS[reason] });
}
