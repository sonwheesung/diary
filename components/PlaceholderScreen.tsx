import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 아직 만들지 않은 화면의 자리. 라우팅 뼈대를 먼저 세우기 위한 것이며,
 * 화면이 완성되면 이 컴포넌트를 쓰는 파일부터 사라진다.
 */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  return (
    <Screen scroll={false} contentStyle={styles.center}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{note ?? t('common.comingSoon')}</Text>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    center: {
      justifyContent: 'center',
    },
    body: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      ...typography.title,
      color: colors.text,
    },
    note: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
