import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { PRIVACY } from '@/features/legal/legal-text';
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
 * ⚠ 번역하지 않는다. 법적 문서라 번역본이 원문과 어긋나면 어느 쪽이 효력인지 다툼이 생긴다.
 * 15개 언어 중 어떤 언어로 앱을 쓰든 이 화면은 한국어 원문을 보여준다 —
 * 국문 사업자가 국내법(PIPA)에 따라 작성한 문서이기 때문이다.
 */
export default function PrivacyScreen() {
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
      <Text style={styles.headerTitle}>{t('settings.privacy')}</Text>
    </View>
  );

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} header={header}>
      <Text style={styles.docTitle}>{PRIVACY.title}</Text>
      <Text style={styles.meta}>
        시행일 {PRIVACY.effective} · 최종 수정일 {PRIVACY.updated}
      </Text>
      <Text style={styles.intro}>{PRIVACY.intro}</Text>

      {PRIVACY.sections.map((section) => (
        <View key={section.h} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.h}</Text>
          {section.body.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))}
        </View>
      ))}

      {/*
        ⚠ **개정 예고.** §13이 "불리한 변경은 30일 전 고지"를 스스로 걸어놨는데,
          예고를 어디에도 띄우지 않으면 그 30일은 시작된 적이 없다 — 정본 파일에만
          적혀 있는 것은 고지가 아니다. 웹 페이지(`npm run legal:html`)와 이 화면 둘 다
          보여줘야 앱만 쓰는 사람에게도 닿는다.

          본문과 **눈으로 구분되어야** 한다. 아직 시행되지 않은 내용이 본문처럼 보이면
          "이미 서버에 백업이 올라가고 있다"는 오해를 만든다.
      */}
      {PRIVACY.pending !== undefined && (
        <View style={styles.pending}>
          <Text style={styles.pendingTitle}>개정 예고</Text>
          <Text style={styles.pendingWhen}>적용 시점: {PRIVACY.pending.appliesFrom}</Text>
          <Text style={styles.line}>{PRIVACY.pending.summary}</Text>
          {PRIVACY.pending.sections.map((section) => (
            <View key={section.h} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.h}</Text>
              {section.body.map((line, index) => (
                <Text key={index} style={styles.line}>
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
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
    },
    docTitle: {
      ...typography.subtitle,
      color: colors.text,
    },
    meta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: -spacing.sm,
    },
    intro: {
      ...typography.caption,
      color: colors.text,
      lineHeight: 21,
    },
    section: {
      gap: spacing.xs,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.text,
    },
    line: {
      ...typography.caption,
      color: colors.textMuted,
      lineHeight: 21,
    },
    pending: {
      gap: spacing.md,
      marginTop: spacing.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 12,
    },
    pendingTitle: {
      ...typography.label,
      color: colors.danger,
    },
    pendingWhen: {
      ...typography.caption,
      color: colors.text,
      marginTop: -spacing.sm,
    },
  });
