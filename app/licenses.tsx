import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { FONT_NOTICES } from '@/features/legal/licenses';
import { OSS_PACKAGES } from '@/features/legal/oss-packages';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 오пп소스 라이선스 고지 — 설정 → 정보.
 *
 * 🔴 **이 화면이 있어야 고지가 성립한다.** OFL 1.1 §2 와 MIT 는 둘 다 *"저작권 고지와 라이선스를
 *   동봉하라"* 를 조건으로 단다 — *"폰트: Pretendard"* 같은 이름 한 줄로는 부족하다.
 *   근거와 실측은 [`docs/OPEN_SOURCE_NOTICE.md`](../docs/OPEN_SOURCE_NOTICE.md).
 *
 * 🚫 **저작권자·라이선스명·패키지명을 번역하지 않는다.** 고유명사이고 원문 유지가 요건이다.
 *   `t()` 로 꺼내는 것은 **화면 제목과 절 제목뿐**이다(§9.1 규칙 1의 의도적 예외).
 *
 * ⚠ 패키지 목록은 **생성 파일**이다(`npm run licenses:build`). 손으로 고치면
 *   `npm run check:licenses` 가 잡는다 — 목록이 조용히 낡는 것이 이 고지의 유일한 실패 방식이다.
 */
export default function LicensesScreen() {
  const { t } = useTranslation();
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
      <Text style={styles.headerTitle}>{t('settings.licenses')}</Text>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.intro}>{t('licenses.intro')}</Text>

      <Text style={styles.sectionTitle}>{t('licenses.fonts')}</Text>
      {FONT_NOTICES.map((font) => (
        <View key={font.name} style={styles.card}>
          <Text style={styles.itemName}>
            {font.name} {font.version}
          </Text>
          <Text style={styles.itemBody}>{font.copyright}</Text>
          <Text style={styles.itemBody}>with Reserved Font Name {font.reservedFontName}.</Text>
          <Text style={styles.itemBody}>Licensed under the {font.license}.</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              // 열리지 않아도 고지 자체는 이미 위에 적혀 있다 — 링크는 편의다.
              void Linking.openURL(font.licenseUrl);
            }}
            hitSlop={8}
          >
            <Text style={styles.link}>{font.licenseUrl}</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t('licenses.packages')}</Text>
      <View style={styles.card}>
        {OSS_PACKAGES.map((pkg, index) => (
          <View key={pkg.name} style={index === 0 ? styles.pkgFirst : styles.pkg}>
            <Text style={styles.itemName}>
              {pkg.name} {pkg.version}
            </Text>
            <Text style={styles.itemBody}>{pkg.license}</Text>
            {/* 저작권 줄이 없는 패키지가 있다(LICENSE 파일 미동봉). 지어내지 않고 비운다 */}
            {pkg.copyright.length > 0 ? <Text style={styles.itemBody}>{pkg.copyright}</Text> : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      ...typography.title,
      color: colors.text,
      flexShrink: 1,
    },
    intro: {
      ...typography.body,
      color: colors.textMuted,
      paddingBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.textMuted,
      paddingBottom: spacing.sm,
      paddingTop: spacing.md,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    pkgFirst: {
      gap: 2,
    },
    pkg: {
      gap: 2,
      paddingTop: spacing.md,
      marginTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    itemName: {
      ...typography.label,
      color: colors.text,
      flexShrink: 1,
    },
    itemBody: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    link: {
      ...typography.caption,
      color: colors.accent,
      flexShrink: 1,
    },
  });
