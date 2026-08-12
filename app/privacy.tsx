import { router } from 'expo-router';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
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
 */
export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  // 언어를 바꾸면 다시 고른다 — 화면이 열린 채 언어가 바뀌는 경로가 있다
  const { doc: PRIVACY, translated } = resolvePrivacy(i18n.language);
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
        {t('legal.effectiveUpdated', { effective: PRIVACY.effective, updated: PRIVACY.updated })}
      </Text>

      {/*
        🔴 **번역본에는 우선순위를 반드시 띄운다.** 이 한 줄이 "어느 쪽이 효력인가"를
          정리하고, 그래서 번역을 안 하던 이유가 사라진다. 안 띄우면 번역본이
          독립된 약속처럼 읽힌다.
      */}
      {translated && <Text style={styles.precedence}>{t('legal.koreanGoverns')}</Text>}
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
      {/*
          ⚠ `pending`은 **배열**이다(2026-08-12 정정). 시행일이 다른 예고를 각각 그린다 —
            백업 예고와 AI 예고는 30일 시계가 따로 흐르므로 한 덩어리로 합칠 수 없다.
            각 예고를 별도 박스로 그려야 "어느 것이 언제부터인지"가 읽힌다.
      */}
      {(PRIVACY.pending ?? []).map((amendment) => (
        <View key={amendment.appliesFrom} style={styles.pending}>
          <Text style={styles.pendingTitle}>{t('legal.pendingTitle')}</Text>
          <Text style={styles.pendingWhen}>{t('legal.appliesFrom', { when: amendment.appliesFrom })}</Text>
          <Text style={styles.line}>{amendment.summary}</Text>
          {amendment.sections.map((section) => (
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
      ))}
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
    precedence: {
      ...typography.caption,
      color: colors.textMuted,
      fontStyle: 'italic',
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
