import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { LegalDocView } from '@/features/legal/components/LegalDocView';
import { resolvePrivacy } from '@/features/legal/resolve';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 개인정보처리방침 — 앱 내 표시.
 *
 * 원문을 앱에 **정적으로** 담는다. 법적 고지는 오프라인에서도 열려야 하고,
 * 조각은 서버 없이 완전히 동작하는 앱이라 더욱 그렇다(웹 링크로만 두면 비행기에서 못 본다).
 *
 * ~~번역하지 않는다~~ → **번역한다**(2026-08-12 사용자 결정).
 *
 * 옛 근거는 *"번역본이 원문과 어긋나면 어느 쪽이 효력인지 다툼이 생긴다"* 였다. 걱정은 옳지만
 * 답이 틀렸다 — 다툼은 **"한국어본이 우선한다"** 한 줄로 막히고, 그 줄을 안 쓴 대가는
 * **자기 정보가 어떻게 처리되는지 못 읽는 사용자**다. 읽을 수 없는 고지는 고지가 아니다.
 *
 * 어긋남은 문구가 아니라 **구조**로 막는다 — `npm run check:legal`이 절 수와 줄 수를
 * 한국어와 대조한다. 번역이 없는 언어는 한국어 원문을 그대로 보여준다(반쪽 번역을 만들지 않는다).
 *
 * ⚠ 본문 렌더링은 `LegalDocView`가 갖는다 — 이용약관과 **같은 뷰**다(2026-08-17).
 */
export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  // 언어를 바꾸면 다시 고른다 — 화면이 열린 채 언어가 바뀌는 경로가 있다
  const resolved = resolvePrivacy(i18n.language);
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
      <Text style={styles.headerTitle}>{t('settings.privacy')}</Text>
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
