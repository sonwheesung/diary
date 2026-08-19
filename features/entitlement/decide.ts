/**
 * 엔타이틀먼트 상태 전이 — **순수 계층**(프로젝트 내부 임포트 0).
 *
 * ## 왜 빼냈나 (2026-08-19)
 *
 * 구독 전수조사에서 나온 가장 아픈 지적이 *"스토어 상태 전이를 검사하는 것이 0개"* 였다
 * (`docs/MONETIZATION_SYSTEM.md` §6.1.7). `check:subscription` 14개는 전부 체험 기간 계산과
 * 유예 산술이었고, **결제 직후 `refresh()`가 `pro=false`를 쓰는 것**을 아무도 안 봤다.
 *
 * 결제 자체는 실기기·실스토어가 있어야 해서 자동화가 어렵다. 그런데 **"서버가 이렇게
 * 답했을 때 무엇을 할 것인가"는 순수 함수다.** 거기까지는 Node에서 검사할 수 있었고,
 * 검사가 있었으면 §6.1.6도 §6.1.7 B1도 코드가 아니라 테스트에서 걸렸다.
 *
 * ⚠ 이 파일에 RN·Expo·zustand를 들이지 마라. 들어오는 순간 검사가 안 돌고,
 *   검사가 안 돌면 이 파일을 뺀 이유가 사라진다.
 */

/** 서버(`/api/v1/entitlements`)가 준 답 */
export type ServerAnswer =
  /** 못 물어봤다 — 네트워크·서버 장애. **모름이지 없음이 아니다** */
  | { kind: 'unreachable' }
  /** 구독 없음 */
  | { kind: 'none' }
  /** 구독 있음. `expiresAt`이 `null`이면 기한 없음 */
  | { kind: 'active'; expiresAt: string | null; inGracePeriod: boolean };

/** 지금 앱이 들고 있는 것 중 판단에 필요한 것만 */
export interface EntitlementContext {
  /** 결제 직후 낙관 구간의 끝(epoch ms). `null`이면 낙관 구간이 아니다 */
  optimisticUntil: number | null;
  /** RC에 되물을 수단이 있는가(키 없음·Expo Go면 없다) */
  canProbe: boolean;
}

/** 무엇을 할 것인가 */
export type EntitlementDecision =
  /** 아무것도 하지 않는다. 캐시도 상태도 그대로 */
  | { kind: 'keep' }
  /** 켜고 캐시에 쓴다 */
  | { kind: 'grant'; until: string; inGracePeriod: boolean }
  /** 낙관 구간이라 되돌리지 않는다. **캐시도 건드리지 않는다** */
  | { kind: 'hold' }
  /** RC에 되묻는다. 결과에 따라 `probeGranted`/`revoke`로 간다 */
  | { kind: 'probe' }
  /** 캐시를 지우고 끈다 */
  | { kind: 'revoke' };

/** 기한 없음을 뜻하는 캐시 값 */
export const NEVER = 'never';

/**
 * 서버 답 → 할 일.
 *
 * 순서가 곧 규칙이다:
 *
 *   1. **못 물어봤으면 아무것도 안 한다** — 장애에 캐시를 지우면 구독자에게 광고가 뜬다
 *   2. **있다면 켠다**
 *   3. 없다는데 **낙관 구간**이면 되돌리지 않는다 (§6.1.6)
 *   4. 없다는데 **되물을 수단이 있으면** 되묻는다 (§6.1.7 A1 완화)
 *   5. 그 외에는 끈다
 *
 * ⚠ 3번이 4번보다 **먼저**다. 낙관 구간에는 스토어가 방금 승인했다는 더 강한 근거가 있어
 *   왕복을 한 번 아낀다.
 */
export function decideEntitlement(
  answer: ServerAnswer,
  ctx: EntitlementContext,
  now: number,
): EntitlementDecision {
  if (answer.kind === 'unreachable') {
    return { kind: 'keep' };
  }
  if (answer.kind === 'active') {
    return {
      kind: 'grant',
      until: answer.expiresAt ?? NEVER,
      inGracePeriod: answer.inGracePeriod,
    };
  }
  if (ctx.optimisticUntil !== null && now < ctx.optimisticUntil) {
    return { kind: 'hold' };
  }
  if (ctx.canProbe) {
    return { kind: 'probe' };
  }
  return { kind: 'revoke' };
}

/**
 * 캐시된 만료 시각이 아직 유효한가.
 *
 * ⚠ **앱이 만료를 다시 판정하지 않는다.** 서버가 준 시각을 그대로 믿는다 —
 *   유예(`inGracePeriod`) 중이면 서버가 유예 종료 시각을 담아 보내므로 그게 존중된다.
 */
export function cacheStillValid(until: string | null, now: number): boolean {
  if (until === null || until === '') return false;
  if (until === NEVER) return true;
  const at = Date.parse(until);
  return Number.isFinite(at) && at > now;
}

/**
 * 결제 직후 **서버 확정을 기다리는 중**인가.
 *
 * 이 창에서는 앱과 서버의 답이 다르다 — 서버가 게이트를 쥔 기능(AI 생성·백업 업로드)이
 * `not-subscribed`로 실패한다. 그때 *"구독하면 이용할 수 있어요"* 를 그대로 보여주면
 * **방금 결제한 사람에게 하는 거짓말**이 된다.
 *
 * 🔴 **권한을 주는 창과 다른 창이다.** 둘을 하나로 두면 어느 한쪽이 반드시 틀린다:
 *
 * | | 창 | 왜 |
 * |---|---|---|
 * | 권한(`pro=true`) | **짧다**(3분) | 근거 없이 오래 열어두면 fail-closed가 무너진다 |
 * | 안내("처리 중") | **길다**(30분) | 실측에서 Play 확정까지 **17분**이 걸렸다 |
 *
 * ⚠ 그 17분은 버그가 아니다. Play는 첫 결제를 확정하기 전에 **90초짜리 기간**을 발급하고,
 *   확정된 뒤 `RENEWAL`로 한 달을 준다(2026-08-19 실결제 실측). 그 사이에는
 *   **Play·RC·우리 서버가 모두 "만료"라고 답하는 것이 정상**이다.
 *   그래서 이 구간에는 권한을 줄 수 없고, **말만 바꿀 수 있다.**
 */
export function awaitingConfirm(purchasePendingUntil: number | null, now: number): boolean {
  return purchasePendingUntil !== null && now < purchasePendingUntil;
}
