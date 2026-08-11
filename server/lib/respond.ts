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
  | 'error';            // 500

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
};

export function ok<T extends object>(body: T): NextResponse {
  return NextResponse.json({ ok: true, ...body });
}

export function fail(reason: FailCode, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: false, reason, ...extra }, { status: STATUS[reason] });
}
