import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import { setEntitlementProbe, useEntitlementStore } from '@/features/entitlement/store';
import { trialTerms } from '@/features/subscription/trial';
import type { TrialTerms } from '@/features/subscription/trial';

/**
 * RevenueCat 연결 — 결제의 유일한 접점.
 *
 * ⚠ **엔타이틀먼트의 진실은 우리 서버다**(`docs/MONETIZATION_SYSTEM.md` §4).
 *   여기서 얻는 `customerInfo`는 결제 직후 **화면을 즉시 갱신**하는 데만 쓰고,
 *   최종 판정은 `/api/v1/entitlements`가 한다. 둘이 갈리면 "구독했는데 백업이 안 된다"가 된다
 *   (백업 서버가 introspect하는 것은 우리 서버 쪽이다).
 *
 * ⚠ **네이티브 모듈이라 Expo Go에서 못 돈다.** Expo Go에서는 SDK가 "Preview API Mode"로
 *   JS 목을 돌려주므로 앱은 뜨지만 실제 결제는 안 된다 — dev build에서만 확인된다.
 */

/** 공개 API 키. 비밀이 아니다 — 번들에 어차피 박히는 값이다 */
const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

/** 엔타이틀먼트 키. **하나뿐이다** — `remove_ads`로 쪼개지 않는다(CLAUDE.md §7.2) */
export const ENTITLEMENT_ID = 'pro';

let configured = false;

/** SDK가 쓸 수 있는 상태인가. 키가 없으면 결제 화면을 아예 열지 않는다 */
export function purchasesConfigured(): boolean {
  return API_KEY.length > 0;
}

/**
 * SDK를 켠다. **여러 번 불러도 한 번만 실행된다.**
 *
 * ⚠ 여기서 `logIn`을 부르지 않는다 — 로그인 여부를 모르는 시점이다.
 *   익명 상태로 결제되면 그 구독은 subject와 **영영 매칭되지 않는다**(§7.2 함정 #1).
 */
export function initializePurchases(): void {
  if (configured || !purchasesConfigured()) {
    return;
  }
  configured = true;
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
  }
  Purchases.configure({ apiKey: API_KEY });
  /*
   * 🔴 서버가 "구독 없음"이라 답할 때 되물을 곳을 심는다(§6.1.7 A1 완화).
   *   웹훅이 유실되면 우리 서버는 영영 모르는데, 스토어는 알고 있다.
   */
  setEntitlementProbe(async () => {
    const info = await Purchases.getCustomerInfo();
    return hasPro(info);
  });
}

/**
 * 로그인한 사용자를 RC에 알린다. **결제 화면을 열기 전에 반드시 부른다.**
 *
 * ⚠ 이걸 빠뜨리면 RC가 익명 appUserID를 만들고, **돈은 나갔는데 `pro`가 안 붙는다.**
 *   웹훅 이력에 `anonymous-app-user-id`가 보이면 이 호출이 빠진 것이다.
 *
 * `created`가 false면 RC가 이 subject를 이미 알고 있다는 뜻 — 다른 기기에서 구독했을 수 있다.
 */
export async function identifyForPurchase(
  subjectId: string,
): Promise<{ ok: true; created: boolean } | { ok: false }> {
  if (!purchasesConfigured()) {
    return { ok: false };
  }
  initializePurchases();
  try {
    const result = await Purchases.logIn(subjectId);
    return { ok: true, created: result.created };
  } catch {
    return { ok: false };
  }
}

/** 로그아웃. RC를 익명으로 되돌린다 — 다음 사람이 남의 구독을 물려받으면 안 된다 */
export async function forgetPurchaseIdentity(): Promise<void> {
  if (!purchasesConfigured()) {
    return;
  }
  try {
    await Purchases.logOut();
  } catch {
    // 이미 익명이면 SDK가 던진다. 목적은 달성됐으므로 삼킨다.
  }
}

export interface Plans {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
  /** 원본. 화면이 다른 표현을 쓰고 싶을 때 */
  offering: PurchasesOffering | null;
}

/**
 * 살 수 있는 것을 가져온다.
 *
 * ⚠ **상품이 비어 있을 수 있다.** RC에서 엔타이틀먼트에 상품 attach를 빠뜨리면
 *   `availablePackages`가 빈 배열로 온다(§7.2 함정 #2). 화면은 그 경우를
 *   "일시적 오류"가 아니라 **"지금은 구독할 수 없습니다"** 로 다뤄야 한다.
 */
export async function fetchPlans(): Promise<Plans | null> {
  if (!purchasesConfigured()) {
    return null;
  }
  initializePurchases();
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (current === null || current.availablePackages.length === 0) {
      return { monthly: null, annual: null, offering: null };
    }
    return {
      monthly: current.monthly ?? null,
      annual: current.annual ?? null,
      offering: current,
    };
  } catch {
    return null;
  }
}

/**
 * 이 상품에 무료 체험이 붙어 있는가. 계산은 순수 계층이 한다(`features/subscription/trial.ts`).
 *
 * 여기서는 SDK 모양을 순수 계층의 모양으로 옮기는 일만 한다 —
 * 그래야 법적 고지의 근거가 되는 계산을 Node에서 검사할 수 있다.
 */
export function trialTermsOf(pkg: PurchasesPackage, now: number): TrialTerms | null {
  const intro = pkg.product.introPrice;
  return trialTerms(
    intro === null
      ? null
      : {
          price: intro.price,
          periodUnit: intro.periodUnit,
          periodNumberOfUnits: intro.periodNumberOfUnits,
          cycles: intro.cycles,
        },
    pkg.product.priceString,
    now,
  );
}

export type PurchaseOutcome =
  | { kind: 'ok' }
  /** 사용자가 창을 닫았다 — **오류가 아니다.** 문구를 띄우지 않는다 */
  | { kind: 'cancelled' }
  /** 결제는 됐는데 권한이 안 붙었다 — RC 상품 attach를 의심한다 */
  | { kind: 'no-entitlement' }
  | { kind: 'error' };

/**
 * 구독한다.
 *
 * ⚠ **`purchasePackage`에 인자를 하나만 넘긴다.** 2·3번째 인자(`upgradeInfo`·
 *   `productChangeInfo`)는 상품을 갈아탈 때 쓰는데, 조각은 **단일 상품이라 전환이 없다**
 *   (월↔연도 하지 않는다 — Play 구독 관리에서 직접 한다).
 */
/**
 * 서버가 `pro`를 확정할 때까지 백오프로 다시 묻는다.
 *
 * RC 웹훅은 보통 몇 초 안에 도착하지만 보장이 없다. 한 번만 물어보고 끝내면
 * 아무도 다시 확인하지 않아, 이미 붙은 권한을 화면이 뒤늦게 되돌린다.
 *
 * 🔴 **3분이 아니라 25분을 기다린다.** 처음엔 웹훅 지연(5~60초)만 생각해 3분으로 잡았는데,
 *   실결제 실측에서 **Play 확정에 17분**이 걸렸다(2026-08-19):
 *
 *     14:06:21  결제
 *     14:07:00  INITIAL_PURCHASE → 만료 14:07:51   ← Play가 준 **90초짜리** 기간
 *     14:24:19  RENEWAL          → 만료 2026-09-19 ✅
 *
 *   3분짜리 백오프는 이 구간을 **못 넘긴다.** 그러면 돈 낸 사람이 화면에서 미구독자로
 *   남고, 다음 포그라운드 복귀까지 아무도 다시 묻지 않는다.
 *
 * ⚠ 서버가 이 상태(*"갱신 예정인데 만료됨"*)를 **10분 쿨다운**으로 재확인하므로,
 *   뒤쪽 간격을 2~5분으로 벌려도 놓치지 않는다. 촘촘히 때릴 이유가 없다.
 * ⚠ 실패해도 조용히 끝낸다 — 사용자는 이미 성공 화면을 봤고, 앱을 다시 열 때
 *   `hydrate` → `refresh`가, 포그라운드 복귀에도 `refresh`가 한 번 더 확인한다.
 */
const CONFIRM_BACKOFF_MS = [
  1_000, 2_000, 4_000, 8_000, 15_000, 30_000, 60_000,
  // 여기부터는 **Play 확정을 기다리는 구간**이다. 합이 약 25분 — 아래 주석 참조.
  120_000, 120_000, 180_000, 180_000, 240_000, 240_000, 300_000,
];

async function confirmWithServer(): Promise<void> {
  const store = useEntitlementStore.getState();
  for (const wait of CONFIRM_BACKOFF_MS) {
    await new Promise((resolve) => setTimeout(resolve, wait));
    /*
     * `fresh: true` — 서버가 구독을 모르면 **RC에 직접 되물어보게** 한다.
     * 이게 없으면 서버는 웹훅만 기다리고, 웹훅은 유실될 수 있다(5회 재시도 후 포기).
     * ⚠ 서버 쿨다운이 60초라 8회를 다 붙여도 실제 RC 호출은 2~3회로 수렴한다.
     */
    await store.refresh({ fresh: true }).catch(() => undefined);
    // 서버가 확정하면 `refresh`가 낙관 구간을 닫는다 — 그게 멈출 신호다
    if (useEntitlementStore.getState().optimisticUntil === null) return;
  }
}

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (!hasPro(customerInfo)) {
      return { kind: 'no-entitlement' };
    }
    /*
     * 화면을 즉시 켜고, 서버가 확정할 때까지 뒤에서 조른다.
     *
     * 🔴 예전에는 여기서 `refresh()` 하나만 불렀는데, 그건 **낙관이 아니었다** —
     *   `refresh()`는 서버를 읽고 서버는 RC 웹훅이 도착해야 `pro`를 안다.
     *   그래서 결제 직후에는 거의 항상 `false`가 돌아오고, *"구독이 시작됐어요"* 를
     *   띄운 화면이 `이용 안 함` + 광고 그대로가 됐다(2026-08-19 실측).
     */
    useEntitlementStore.getState().grantPending();
    void confirmWithServer();
    return { kind: 'ok' };
  } catch (error) {
    if (isCancelled(error)) {
      return { kind: 'cancelled' };
    }
    return { kind: 'error' };
  }
}

/**
 * 스토어의 구독을 이 계정에 다시 붙인다.
 *
 * ⚠ **탈퇴 후 재가입하면 `subject_id`가 바뀐다** — RC의 새 appUserID에는 아무것도 없어서
 *   **돈은 나가는데 `pro`가 아니다.** 로그인 후 서버가 `pro=false`면 이걸 부른다.
 */
export async function restore(): Promise<PurchaseOutcome> {
  if (!purchasesConfigured()) {
    return { kind: 'error' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (!hasPro(customerInfo)) {
      void useEntitlementStore.getState().refresh();
      return { kind: 'no-entitlement' };
    }
    // 복원도 같은 경주를 한다 — 서버는 `TRANSFER` 웹훅이 와야 안다(CLAUDE.md §7.2)
    useEntitlementStore.getState().grantPending();
    void confirmWithServer();
    return { kind: 'ok' };
  } catch {
    return { kind: 'error' };
  }
}

/**
 * 로그인 직후 **구독을 이 계정에 다시 붙인다.**
 *
 * ⚠ 탈퇴 후 재가입하면 `subject_id`가 바뀐다(`softDeleteSubject()`가 `provider_id`를
 *   가명화한다). RC의 새 appUserID에는 아무것도 없어서 **돈은 나가는데 `pro`가 아니다.**
 *   사용자는 "구매 내역 복원"이라는 버튼이 자기 문제의 답인 줄 모른다 — 그래서 앱이 대신 부른다.
 *
 * 순서가 중요하다: **`logIn` → 권한 조회 → 없으면 그때만 `restore`.**
 * 구독이 없는 대다수에게 스토어 왕복을 한 번 더 시키는 대신, 서버가 이미 `pro`라고
 * 답하면 아무것도 하지 않는다.
 *
 * 조용히 돈다 — 성공해도 알림을 띄우지 않는다. 사용자가 기대한 것은 "로그인"이지
 * "복원"이 아니고, 잘 되면 그냥 광고가 사라진다.
 */
export async function reattachSubscription(subjectId: string): Promise<void> {
  const store = useEntitlementStore.getState();
  if (!purchasesConfigured()) {
    await store.refresh();
    return;
  }
  const identified = await identifyForPurchase(subjectId);
  await store.refresh();
  if (!identified.ok || useEntitlementStore.getState().pro) {
    return;
  }
  await restore();
}

function hasPro(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

/** 취소는 오류가 아니다. SDK가 주는 코드로 판정한다 */
function isCancelled(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}
