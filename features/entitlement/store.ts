import { create } from 'zustand';

import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { commonServer } from '@/lib/common-server/client';

/**
 * 구독 권한(`pro`) — 광고 제거 · 백업/복원 · AI 리포트의 단일 게이트.
 *
 * **엔타이틀먼트 키는 `pro` 하나다**(CLAUDE.md §7.2). `remove_ads`로 쪼개지 않는다 —
 * 제일 싼 상품이 제일 비싼 상품을 잡아먹기 때문이다.
 *
 * ## 오프라인이 기본이다
 *
 * 서버 응답을 **기다리지 않는다.** 조각은 로컬 우선 앱이라 서버가 죽어도 화면이 그려져야 하고,
 * 광고 표시 여부는 렌더 중에 동기로 답해야 한다. 그래서:
 *
 *   1. 앱 시작 시 `app_settings`의 캐시(`pro_until`)를 읽어 즉시 판정한다
 *   2. 그 뒤에 서버를 조회해 캐시를 갱신한다 (실패해도 아무 일도 안 일어난다)
 *
 * 캐시의 유효기한은 서버가 준 `expiresAt`이다 — 앱이 만료를 **다시 판정하지 않는다.**
 * 유예(`inGracePeriod`) 중이면 서버가 유예 종료 시각을 담아 보내므로 그대로 존중된다.
 *
 * ⚠ **판정이 흔들리는 쪽을 정한다.** 모르면 `pro = false`(광고 표시)다.
 *   반대로 두면 서버 장애가 곧 전원 무료 이용이 되고, 되돌릴 때 이미 광고를 안 본 사람들이
 *   "왜 갑자기 광고가 나오냐"고 묻는다. 다만 **한 번 확인된 구독은 만료 전까지 오프라인에서도
 *   유지**되므로, 실제 구독자가 이 보수적 기본값에 걸리는 경우는 없다.
 */

interface EntitlementState {
  /** 구독 권한이 살아 있는가. 캐시를 읽기 전에는 false */
  pro: boolean;
  /** 캐시를 읽어봤는지(성공·실패 무관) — "아직 모름"과 "무료 사용자"를 구별해야 한다 */
  hydrated: boolean;
  /** 결제 실패 유예 중. 활성이지만 곧 끊긴다는 안내를 띄울 수 있다 */
  inGracePeriod: boolean;
  /**
   * 캐시된 만료 시각(ISO 또는 `'never'`). **백업 파기 예정일의 유일한 근거다** —
   * 만료는 이벤트로 오지 않으므로 이 값에서 앱이 직접 센다.
   */
  proUntil: string | null;
  /** 캐시에서 즉시 판정. 앱 시작 시 1회 */
  hydrate: () => Promise<void>;
  /** 서버 조회 후 캐시 갱신. 실패하면 캐시를 **건드리지 않는다** */
  refresh: () => Promise<void>;
  /** 로그아웃·탈퇴 시. 권한은 계정에 붙어 있다 */
  clear: () => Promise<void>;
}

const NEVER = 'never';

/** ISO 문자열(또는 `'never'`)이 아직 유효한가 */
function stillValid(until: string | null): boolean {
  if (until === null) return false;
  if (until === NEVER) return true;
  const at = Date.parse(until);
  return Number.isFinite(at) && at > Date.now();
}

export const useEntitlementStore = create<EntitlementState>((set) => ({
  pro: false,
  hydrated: false,
  inGracePeriod: false,
  proUntil: null,

  hydrate: async () => {
    try {
      const until = await getSetting(SETTING_KEYS.proUntil);
      set({ pro: stillValid(until), proUntil: until, hydrated: true });
    } catch {
      // 캐시를 못 읽으면 무료로 본다. 곧 이어지는 refresh가 바로잡는다.
      set({ hydrated: true });
    }
  },

  refresh: async () => {
    const result = await commonServer.fetchEntitlements();
    if (!result.ok) {
      /*
       * ⚠ 실패에 캐시를 지우지 않는다. 네트워크가 끊겼거나 서버가 잠깐 죽은 것뿐인데
       *   지우면 **구독자에게 광고가 뜬다.** 캐시는 만료 시각이 지날 때만 자연히 죽는다.
       */
      return;
    }
    const pro = result.entitlements.pro;
    if (pro === undefined || !pro.active) {
      await setSetting(SETTING_KEYS.proUntil, '');
      set({ pro: false, inGracePeriod: false, proUntil: null, hydrated: true });
      return;
    }
    const until = pro.expiresAt ?? NEVER;
    await setSetting(SETTING_KEYS.proUntil, until);
    set({ pro: true, inGracePeriod: pro.inGracePeriod, proUntil: until, hydrated: true });
  },

  clear: async () => {
    await setSetting(SETTING_KEYS.proUntil, '').catch(() => undefined);
    set({ pro: false, inGracePeriod: false, proUntil: null, hydrated: true });
  },
}));

/**
 * React 밖에서 쓰는 동기 판정. 렌더 중에 광고를 그릴지 정해야 해서 필요하다.
 *
 * ⚠ `hydrate()` 전에는 항상 `false`다 — 앱 시작 직후 아주 짧은 창에서 구독자에게
 *   배너 자리가 잠깐 보일 수 있다. `AdBanner`가 로드 실패 시 자리를 차지하지 않으므로
 *   실제로는 깜빡임도 거의 없다.
 */
export function isPro(): boolean {
  return useEntitlementStore.getState().pro;
}
