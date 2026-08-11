import mobileAds, { MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

import { isPro } from '@/features/entitlement/store';
import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { today } from '@/lib/date';

/**
 * 광고 (CLAUDE.md §7).
 *
 * | 지면 | 어디에 | 언제 |
 * |---|---|---|
 * | 전면 | — | 조각 **등록(저장)이 완료된 순간**, 하루 1회 |
 * | 배너 | 홈·캘린더·검색·설정 | 상시 |
 * | 없음 | 작성·상세 | — |
 *
 * 작성 화면 **진입 시점에는 띄우지 않는다.** 기둥 1·4 위반이자 AdMob 정책 위반 소지다 —
 * "사용자가 양식 작성에 집중해 있을 때 갑자기 뜨는 인터스티셜"은 금지 대상이다.
 */

/**
 * 실제 광고 단위 (2026-08-09 AdMob 발급).
 *
 * AdMob 앱: 조각 / Android — `ca-app-pub-2731473780180274~6800808068`
 * 앱 ID는 여기가 아니라 `app.json`의 config plugin이 갖는다(네이티브 매니페스트에 박혀야 한다).
 *
 * 개발 빌드에서는 **항상 테스트 단위를 쓴다** — 실제 단위로 개발하면 내가 만든 노출·클릭이
 * 무효 트래픽으로 잡혀 계정이 정지될 수 있다. 그래서 `__DEV__` 분기를 남겨둔다.
 *
 * ⚠ 지금 이 앱은 AdMob에서 **'검토 필요 · 광고 게재 제한'** 상태다. 스토어에 올라간 뒤
 * AdMob에서 스토어를 연결하고 승인을 받아야 실제 광고가 나간다. 그전까지는 릴리스 빌드로
 * 돌려도 노출이 0이다 — 코드가 잘못된 게 아니다.
 */
const RELEASE_AD_UNITS: { banner: string | null; interstitial: string | null } = {
  banner: 'ca-app-pub-2731473780180274/4105647957',
  interstitial: 'ca-app-pub-2731473780180274/5718112528',
};

/**
 * 실제 광고를 쓸 빌드인가.
 *
 * `__DEV__`만으로는 부족하다 — **내부 테스트 빌드도 릴리스 빌드**라 `__DEV__`가 false다.
 * 그대로 두면 우리가 테스트하면서 만든 노출·클릭이 실제 광고에 잡히고, 그건 Google이
 * 명시적으로 금지하는 **무효 트래픽**이다(계정 정지 사유).
 *
 * 그래서 `EXPO_PUBLIC_ADS_REAL=1`이 **명시적으로** 켜져 있을 때만 실제 단위를 쓴다.
 * 기본값이 안전한 쪽(테스트 광고)이어야 한다 — 실수로 빠뜨렸을 때 잃는 것이
 * "수익 며칠"과 "계정"으로 크게 다르기 때문이다.
 *
 * 프로덕션 출시 빌드에서만 `eas.json`의 production 프로필이 이 값을 켠다.
 */
const USE_REAL_ADS = !__DEV__ && process.env.EXPO_PUBLIC_ADS_REAL === '1';

export const AD_UNITS = {
  banner: USE_REAL_ADS ? (RELEASE_AD_UNITS.banner ?? TestIds.BANNER) : TestIds.BANNER,
  interstitial: USE_REAL_ADS
    ? (RELEASE_AD_UNITS.interstitial ?? TestIds.INTERSTITIAL)
    : TestIds.INTERSTITIAL,
} as const;

let initialized = false;

/**
 * SDK 초기화. **실패해도 앱 사용을 막지 않는다**(§7) — 광고는 부가물이지 전제가 아니다.
 * 여러 번 불러도 한 번만 실행된다.
 */
export async function initializeAds(): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;
  try {
    await mobileAds().setRequestConfiguration({
      // 일기 앱이다. 성인 등급 광고가 붙을 이유가 없다.
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
  } catch {
    // 초기화 실패는 조용히 넘어간다. 광고가 안 뜰 뿐 앱은 그대로 쓴다.
  }
}

/**
 * 구독자는 광고를 보지 않는다(§7).
 *
 * 호출부를 전부 여기로 모아둔 덕에 엔타이틀먼트가 생겼을 때 **이 함수만** 바뀌었다
 * (2026-08-11). 앞으로도 광고 표시 여부를 판단하는 곳은 여기 하나다.
 *
 * ⚠ **동기여야 한다** — 렌더 중에 배너를 그릴지 정한다. 그래서 스토어의 현재 값을 읽는다.
 *   앱 시작 직후 `hydrate()` 전에는 `pro=false`라 구독자에게 배너 자리가 아주 잠깐
 *   보일 수 있지만, `AdBanner`가 로드 실패 시 자리를 차지하지 않으므로 실제 깜빡임은 없다.
 */
export function adsEnabled(): boolean {
  return !isPro();
}

/** 오늘 이미 띄웠는지. 하루 1회 캡이라 쿨다운은 따로 두지 않는다 */
export async function canShowInterstitial(): Promise<boolean> {
  if (!adsEnabled()) {
    return false;
  }
  try {
    return (await getSetting(SETTING_KEYS.adsInterstitialDate)) !== today();
  } catch {
    // 캡을 못 읽으면 **띄우지 않는다.** 모르는 채로 띄우면 하루 여러 번이 될 수 있다.
    return false;
  }
}

export async function markInterstitialShown(): Promise<void> {
  try {
    await setSetting(SETTING_KEYS.adsInterstitialDate, today());
  } catch {
    // 기록에 실패하면 다음 저장에서 한 번 더 뜰 수 있다. 앱을 멈출 일은 아니다.
  }
}
