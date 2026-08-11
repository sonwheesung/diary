/**
 * 보관 정책 — **앱 쪽 정본**.
 *
 * ⚠ 서버에도 같은 값이 있다(`server/lib/policy.ts`). **두 값이 같아야 한다** —
 *   화면에는 90일이라 적혀 있는데 60일에 지워지면 되돌릴 수 없는 사고다.
 *   근거는 `docs/BACKUP_SYSTEM.md` §5.
 *
 * ⚠ **프로젝트 내부 임포트 0** — 순수 계층 규약을 따른다.
 */

/** 구독이 끊긴 뒤 백업을 파기하기까지의 유예 */
export const GRACE_MS = 90 * 24 * 60 * 60 * 1000;
export const GRACE_DAYS = 90;

/**
 * 구독 만료 시각에서 파기 예정일을 계산한다.
 *
 * ⚠ **만료는 이벤트로 오지 않는다.** 서버가 `active`를 저장하지 않고 읽을 때 계산하므로
 *   만료 순간에 아무도 알려주지 않는다 — 앱이 캐시해둔 만료 시각에서 직접 센다.
 *
 * `null`이면 유예 상태가 아니다(구독 중이거나 만료 시각을 모른다).
 */
export function purgeAtFrom(proUntil: string | null): number | null {
  if (proUntil === null || proUntil === 'never' || proUntil.length === 0) {
    return null;
  }
  const at = Date.parse(proUntil);
  return Number.isFinite(at) ? at + GRACE_MS : null;
}

/** 파기까지 남은 일수. 이미 지났으면 0 */
export function daysUntil(purgeAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((purgeAt - now) / (24 * 60 * 60 * 1000)));
}
