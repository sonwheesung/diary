import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

import { AD_UNITS, canShowInterstitial, markInterstitialShown } from '@/features/ads/api/ads';

/**
 * 저장 완료 후 전면광고 (CLAUDE.md §7).
 *
 * **저장은 광고와 무관하게 이미 끝나 있다.** 여기서 무슨 일이 나도 조각은 저장된 상태다 —
 * 광고 로드 실패·오프라인·타임아웃 어느 경우에도 조용히 넘어간다.
 *
 * 미리 불러두는 이유: 저장 직후에 로드를 시작하면 몇 초를 기다리게 되고,
 * 그 사이 사용자는 이미 다른 화면을 보고 있다. 늦게 뜨는 전면광고가 가장 짜증난다.
 */

let ad: InterstitialAd | null = null;
let loaded = false;

/** 작성 화면에 들어올 때 미리 부른다. 캡에 걸려 있으면 아예 부르지 않는다(트래픽 낭비) */
export async function prepareInterstitial(): Promise<void> {
  if (ad !== null || !(await canShowInterstitial())) {
    return;
  }
  const next = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
  next.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  next.addAdEventListener(AdEventType.ERROR, () => {
    // 못 받으면 그만이다. 다음 기회에 다시 부른다.
    ad = null;
    loaded = false;
  });
  next.addAdEventListener(AdEventType.CLOSED, () => {
    ad = null;
    loaded = false;
  });
  ad = next;
  try {
    next.load();
  } catch {
    ad = null;
  }
}

/**
 * 준비돼 있으면 띄운다. 아니면 **아무 일도 하지 않는다** — 기다리게 하지 않는다.
 * 실제로 띄운 경우에만 캡을 소모한다.
 */
export async function showInterstitialIfReady(): Promise<void> {
  if (ad === null || !loaded || !(await canShowInterstitial())) {
    return;
  }
  try {
    ad.show();
    await markInterstitialShown();
  } catch {
    ad = null;
    loaded = false;
  }
}
