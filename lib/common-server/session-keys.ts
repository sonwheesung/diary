/**
 * 세션 저장 키 분리 — 순수 계층 (`docs/SUPPORT_SYSTEM.md` §3.1 · `docs/AUTH_SYSTEM.md` §1.2)
 *
 * ⚠ 이 파일은 RN·expo·저장소를 import 하지 않는다. `features/auth/age-gate.ts` 와 같은 이유다 —
 *   가드(`npm run check:age-gate` §⑤)가 이 파일만 그대로 컴파일해 매퍼를 잰다.
 *
 * 🔴 **조각의 신원 격리 전체가 아래 한 함수에 걸려 있다.** 조각은 로그인이 **선택**인 유일한
 *   앱이라(형제 3개는 로그인이 없어 기기 세션이 곧 유일한 신원이다) 기기 토큰이 로그인 칸에
 *   들어가면 `/auth/me` 가 200 을 주며 **로그인으로 판정**되고, 그러면 문의 로그인 필수가 뚫리고
 *   **연령 게이트가 우회되고** RevenueCat 이 기기 subject 에 붙어 나중에 구독을 잃는다.
 */

/** SDK 가 쓰는 접두사. `cs_session_${appCode}` — config 로 바꿀 수 없어 어댑터가 떠안는다. */
export const SESSION_PREFIX = 'cs_session_';

/** 활성 하트비트 전용 칸. 이 칸은 `isSignedIn()`·`restoreSession()`·`readSessionToken()` 이 안 본다. */
export const DEVICE_SESSION_PREFIX = 'cs_devsession_';

/**
 * 로그인 칸의 키 → 기기 칸의 키.
 *
 * ⚠ **`startsWith` 로 앵커를 건다.** `replace` 는 첫 등장을 바꾸는 것이라 접두사가 아닌 자리에
 *   같은 문자열이 있으면 엉뚱한 곳을 고치고, 접두사가 아닌 키가 생기는 날에는 무동작이 되어
 *   **두 인스턴스가 그 키를 조용히 공유**한다. 조용한 공유가 이 설계에서 가장 나쁜 결과다.
 *
 * 접두사가 없는 키는 **그대로 돌려준다.** 지금 SDK 에는 그런 키가 없지만(2026-09-01 확인:
 * `storage.*Item` 호출 네 곳이 전부 같은 상수를 쓴다), 생기면 가드가 잡도록 남겨 둔다.
 */
export function toDeviceSessionKey(key: string): string {
  if (!key.startsWith(SESSION_PREFIX)) return key;
  return `${DEVICE_SESSION_PREFIX}${key.slice(SESSION_PREFIX.length)}`;
}
