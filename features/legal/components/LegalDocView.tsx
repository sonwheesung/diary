import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LegalDoc } from '@/features/legal/legal-text';
import type { ResolvedLegal } from '@/features/legal/resolve';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 법적 고지 한 편을 그린다 — 처리방침·이용약관이 **같은 뷰를 쓴다.**
 *
 * 🔴 뽑아낸 이유: 약관을 붙이면서 처리방침 화면을 복사할 뻔했다. 같은 날
 *   목록 카드가 네 화면에 복제돼 있던 것을 고쳤는데(홈·모든 조각·검색·캘린더),
 *   **법적 문서에서 같은 실수를 하면 훨씬 비싸다** — 한쪽에만 우선순위 문구를 고치거나
 *   한쪽만 개정 예고를 그리면 그 문서는 고지를 안 한 것이 된다.
 *
 * ⚠ 화면 자체(`app/privacy.tsx`·`app/terms.tsx`)는 헤더와 제목만 갖는다.
 *   본문 렌더링 규칙은 전부 여기 있다.
 */
export function LegalDocView({ doc, translated }: ResolvedLegal) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  return (
    <>
      <Text style={styles.docTitle}>{doc.title}</Text>
      <Text style={styles.meta}>
        {t('legal.effectiveUpdated', { effective: doc.effective, updated: doc.updated })}
      </Text>

      {/*
        🔴 **번역본에는 우선순위를 반드시 띄운다.** 이 한 줄이 "어느 쪽이 효력인가"를
          정리하고, 그래서 번역을 안 하던 이유가 사라진다. 안 띄우면 번역본이
          독립된 약속처럼 읽힌다.
      */}
      {translated && <Text style={styles.precedence}>{t('legal.koreanGoverns')}</Text>}
      <Text style={styles.intro}>{doc.intro}</Text>

      {doc.sections.map((section) => (
        <Section key={section.h} h={section.h} body={section.body} styles={styles} />
      ))}

      {/*
        ⚠ **개정 예고.** §13이 "불리한 변경은 30일 전 고지"를 스스로 걸어놨는데,
          예고를 어디에도 띄우지 않으면 그 30일은 시작된 적이 없다 — 정본 파일에만
          적혀 있는 것은 고지가 아니다. 웹 페이지(`npm run legal:html`)와 이 화면 둘 다
          보여줘야 앱만 쓰는 사람에게도 닿는다.

          본문과 **눈으로 구분되어야** 한다. 아직 시행되지 않은 내용이 본문처럼 보이면
          "이미 서버에 백업이 올라가고 있다"는 오해를 만든다.

        ⚠ `pending`은 **배열**이다(2026-08-12 정정). 시행일이 다른 예고를 각각 그린다 —
          백업 예고와 AI 예고는 30일 시계가 따로 흐르므로 한 덩어리로 합칠 수 없다.
      */}
      {(doc.pending ?? []).map((amendment) => (
        <View key={amendment.appliesFrom} style={styles.pending}>
          <Text style={styles.pendingTitle}>{t('legal.pendingTitle')}</Text>
          <Text style={styles.pendingWhen}>
            {t('legal.appliesFrom', { when: amendment.appliesFrom })}
          </Text>
          <Text style={styles.line}>{amendment.summary}</Text>
          {amendment.sections.map((section) => (
            <Section key={section.h} h={section.h} body={section.body} styles={styles} />
          ))}
        </View>
      ))}
    </>
  );
}

type Styles = ReturnType<typeof createStyles>;

function Section({ h, body, styles }: LegalDoc['sections'][number] & { styles: Styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{h}</Text>
      {body.map((line, index) => (
        <Text key={index} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
