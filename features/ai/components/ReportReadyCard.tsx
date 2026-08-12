import { router, useFocusEffect } from 'expo-router';
import Sparkles from 'lucide-react-native/icons/sparkles';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { canCreate, targetPeriodKey } from '@/features/ai/api/report-service';
import { keyRange } from '@/features/ai/period';
import { useEntitlementStore } from '@/features/entitlement/store';
import { formatDateRange } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 홈 카드 — *"지난주 리포트가 준비됐어요"*.
 *
 * 리포트는 **서버가 만들어 밀어줄 수 없다**(서버에 본문이 없다, CLAUDE.md §5.1). 앱이 트리거해야
 * 하는데, 탭에 들어가야만 알 수 있으면 대부분 한 번도 안 만든다. 그래서 홈에서 한 번 알린다.
 *
 * **안 그릴 때가 더 많은 컴포넌트다.** 다음 셋 중 하나라도 아니면 아무것도 그리지 않는다:
 *   ① 구독자다 ② 지난주 리포트가 아직 없다 ③ 지난주에 쓴 조각이 있다
 *
 * ⚠ ③이 없으면 **빈 주에도 카드가 뜬다.** 일기를 한 줄도 안 쓴 주에 "리포트가 준비됐어요"는
 *   거짓말이고, 눌러봐야 "이 기간에 남긴 조각이 없어요"를 만난다.
 */
export function ReportReadyCard() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const pro = useEntitlementStore((state) => state.pro);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (!pro) {
        setReady(false);
        return;
      }
      void canCreate('weekly')
        .then((verdict) => {
          if (alive) setReady(verdict.ok);
        })
        // 판정을 못 하면 안 그린다. 잘못 뜬 카드가 안 뜬 카드보다 나쁘다
        .catch(() => {
          if (alive) setReady(false);
        });
      return () => {
        alive = false;
      };
    }, [pro]),
  );

  if (!ready) {
    return null;
  }

  const range = keyRange(targetPeriodKey('weekly'));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/report')}
      style={styles.card}
    >
      <Sparkles size={20} color={colors.accent} />
      <View style={styles.body}>
        <Text style={styles.title}>{t('report.homeCardTitle')}</Text>
        {range !== null && (
          <Text style={styles.period}>{formatDateRange(range.from, range.to)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    title: {
      ...typography.label,
      color: colors.text,
    },
    period: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
