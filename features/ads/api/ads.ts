import mobileAds, { MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

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
 * ⚠ **지금은 Google 공식 테스트 광고 단위다.** 출시 전에 실제 단위로 바꾼다.
 * 개발 중 실제 단위를 쓰면 무효 트래픽으로 계정이 정지될 수 있다 —
 * 그래서 개발 빌드에서는 테스트 단위를 강제한다.
 */
export const AD_UNITS = {
  banner: __DEV__ ? TestIds.BANNER : TestIds.BANNER,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : TestIds.INTERSTITIAL,
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
 * ⏭ 구독이 붙기 전까지는 항상 true다. 엔타이틀먼트가 생기면 **이 함수만** 바꾸면 되도록
 * 호출부는 전부 여기를 거치게 한다.
 */
export function adsEnabled(): boolean {
  return true;
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
