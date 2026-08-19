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
  /**
   * 결제 직후 낙관 구간의 끝(epoch ms). `null`이면 낙관 구간이 아니다.
   *
   * 🔴 **메모리에만 둔다 — 캐시에 쓰지 않는다.** 캐시에 쓰면 서버가 끝내 확정하지 않아도
   *   RC가 준 만료일(한 달 뒤)까지 무료 이용이 되고, 그건 fail-closed 원칙을 뒤집는다.
   *   앱을 다시 켜면 낙관은 사라지고 서버 판정만 남는다 — 안전한 쪽으로 잃는다.
   */
  optimisticUntil: number | null;
  /** 캐시에서 즉시 판정. 앱 시작 시 1회 */
  hydrate: () => Promise<void>;
  /** 서버 조회 후 캐시 갱신. 실패하면 캐시를 **건드리지 않는다** */
  refresh: () => Promise<void>;
  /**
   * 결제·복원 직후 — 서버가 확정할 때까지 **로컬로 켜둔다.**
   *
   * 스토어가 결제를 승인하고 RC가 `pro`를 실어왔다는 것은 근거로 충분하다.
   * 다만 우리 서버는 RC **웹훅**으로만 그 사실을 알게 되므로 몇 초의 공백이 있고,
   * 그 창에서 `refresh()`가 `pro=false`를 써버리면 화면이 거짓말을 한다
   * (실제로 겪음 — 2026-08-19, `docs/MONETIZATION_SYSTEM.md` §6.1.6).
   */
  grantPending: () => void;
  /** 로그아웃·탈퇴 시. 권한은 계정에 붙어 있다 */
  clear: () => Promise<void>;
}

/**
 * 결제 직후 서버 확정을 기다려주는 시간.
 *
 * ⚠ 무한이 아니다. 웹훅이 끝내 안 오면(라이선스 테스트의 SANDBOX 결제가 그렇다)
 *   창이 닫히면서 화면이 정직하게 `이용 안 함`으로 돌아가야 한다.
 */
const OPTIMISTIC_WINDOW_MS = 3 * 60 * 1000;

const NEVER = 'never';

/** ISO 문자열(또는 `'never'`)이 아직 유효한가 */
function stillValid(until: string | null): boolean {
  if (until === null) return false;
  if (until === NEVER) return true;
  const at = Date.parse(until);
  return Number.isFinite(at) && at > Date.now();
}

export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  pro: false,
  hydrated: false,
  inGracePeriod: false,
  proUntil: null,
  optimisticUntil: null,

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
      /*
       * 🔴 결제 직후 낙관 구간이면 되돌리지 않는다.
       *
       * 스토어는 결제를 승인했는데 우리 서버는 아직 RC **웹훅**을 못 받은 상태다.
       * 여기서 `false`를 쓰면 *"구독이 시작됐어요"* 를 띄운 직후 화면이
       * `이용 안 함`으로 돌아가고 광고도 그대로 남는다 — 사용자가 보는 건
       * "돈 냈는데 안 됐다"이고, 그게 환불·문의로 직행하는 자리다.
       *
       * ⚠ 캐시(`pro_until`)도 건드리지 않는다. 지워버리면 앱을 껐다 켰을 때
       *   낙관도 캐시도 없어 확실히 무료가 된다.
       */
      const optimisticUntil = get().optimisticUntil;
      if (optimisticUntil !== null && Date.now() < optimisticUntil) {
        set({ hydrated: true });
        return;
      }
      await setSetting(SETTING_KEYS.proUntil, '');
      set({
        pro: false,
        inGracePeriod: false,
        proUntil: null,
        optimisticUntil: null,
        hydrated: true,
      });
      return;
    }
    const until = pro.expiresAt ?? NEVER;
    await setSetting(SETTING_KEYS.proUntil, until);
    // 서버가 확정했다 — 낙관 구간은 역할을 다했다
    set({
      pro: true,
      inGracePeriod: pro.inGracePeriod,
      proUntil: until,
      optimisticUntil: null,
      hydrated: true,
    });
  },

  grantPending: () => {
    set({ pro: true, optimisticUntil: Date.now() + OPTIMISTIC_WINDOW_MS, hydrated: true });
  },

  clear: async () => {
    await setSetting(SETTING_KEYS.proUntil, '').catch(() => undefined);
    set({
      pro: false,
      inGracePeriod: false,
      proUntil: null,
      optimisticUntil: null,
      hydrated: true,
    });
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
