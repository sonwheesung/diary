import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { AD_UNITS } from '@/features/ads/api/ads';
import { useEntitlementStore } from '@/features/entitlement/store';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';

/**
 * 하단 배너 (CLAUDE.md §7).
 *
 * **탭 화면에만** 붙는다. 작성 화면은 하단이 툴바 자리이고 키보드와 자리 싸움이 나며,
 * 상세 화면은 일기를 읽는 자리라 본문 아래 광고가 붙으면 기둥 2가 무너진다.
 *
 * 광고를 못 받으면 **자리를 차지하지 않는다.** 빈 회색 띠가 남으면 앱이 고장 난 것처럼 보인다.
 */
export function AdBanner() {
  const styles = useStyles(createStyles);
  const [failed, setFailed] = useState(false);
  /*
   * ⚠ `adsEnabled()`를 부르지 않고 스토어를 **구독**한다. 함수 호출은 렌더 시점의 값만
   *   읽어서, 구독을 막 결제한 사용자의 화면에서 배너가 그대로 남는다 — 돈을 낸 직후가
   *   광고가 사라지는 걸 가장 확실히 보여줘야 하는 순간이다.
   */
  const pro = useEntitlementStore((state) => state.pro);

  if (pro || failed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNITS.banner}
        // 화면 폭에 맞춰 높이를 정하는 적응형 배너. 고정 크기는 기기마다 남거나 넘친다.
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      // 본문과 광고 사이에 선을 하나 둔다 — 콘텐츠로 오해하지 않게(AdMob 정책상도 안전하다).
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
  });
