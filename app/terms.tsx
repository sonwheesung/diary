import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { LegalDocView } from '@/features/legal/components/LegalDocView';
import { resolveTerms } from '@/features/legal/resolve';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 이용약관 — 앱 내 표시.
 *
 * 🔴 **이 화면이 있어야 약관이 성립한다.** 전자상거래법 §13②9호는 *"거래에 관한 약관
 *   (그 약관의 내용을 **확인할 수 있는 방법**을 포함한다)"* 을 계약 체결 전 고지 사항으로
 *   열거한다 — 문서를 써놓고 볼 곳을 안 주면 9호를 충족하지 못한다.
 *   웹 URL(약관 제4조)과 이 화면이 그 "방법" 두 가지다.
 *
 * ⚠ 처리방침과 같은 이유로 **앱에 정적으로** 담는다. 결제 직전에 약관을 확인하려는데
 *   인터넷이 없어서 못 여는 상황을 만들지 않는다.
 *
 * ⚠ 본문 렌더링은 `LegalDocView`가 갖는다 — 처리방침과 **같은 뷰**다.
 */
export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  const resolved = resolveTerms(i18n.language);
  const colors = useColors();
  const styles = useStyles(createStyles);

  const header = (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <ChevronLeft size={26} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>{t('settings.terms')}</Text>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <LegalDocView {...resolved} />
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      ...typography.subtitle,
      color: colors.text,
      flexShrink: 1,
    },
  });
