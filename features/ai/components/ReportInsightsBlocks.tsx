import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Achievement, Discovery, Suggestion } from '@/features/ai/types';
import { formatShortDate } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * v15 리포트 칸 — 발견 카드 · 해낸 것 · 권유 (`docs/AI_REPORT_SYSTEM.md` §8.5).
 *
 * 🔴 **없으면 블록 자체를 안 그린다.** v14 이전 리포트·위기 리포트는 이 칸들이 비어 있다 —
 *   빈 제목만 남으면 고장으로 보이고, 위기 리포트에서 *"해낸 것"* 제목이 뜨는 것은 그 자체로 틀렸다.
 *
 * ⚠ 서버가 이미 걸러서 준다(그날 일기에 없는 인용 · 한 날짜짜리 권유 · 체중·식단 권유는 버렸다).
 *   화면은 모양만 믿고 그린다.
 */

const joinDates = (dates: string[]): string => dates.map((d) => formatShortDate(d)).join(' · ');

/**
 * 발견 카드 — 한 줄 아래, 본문 위.
 *
 * 🔴 **원문 근거를 함께 보여준다.** 발견은 *"어느 한 날에도 적혀 있지 않은 문장"* 이라
 *   근거가 안 보이면 지어낸 말로 읽힌다. 날짜를 누르면 그날 조각으로 내려간다(§8.2.1 칩과 같은 문).
 */
export function DiscoveryCards({
  items,
  onOpenDate,
}: {
  items: Discovery[];
  onOpenDate: (date: string) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{t('report.discoveriesTitle')}</Text>
      {items.map((item, index) => (
        <View key={`${item.shape}-${index}`} style={styles.card}>
          <Text style={styles.shape}>{t(`report.shape.${item.shape}`)}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.evidenceList}>
            {item.evidence.map((ev, i) => (
              <Pressable
                key={`${ev.date}-${i}`}
                accessibilityRole="button"
                onPress={() => onOpenDate(ev.date)}
                style={({ pressed }) => [styles.evidence, pressed && styles.evidencePressed]}
              >
                <Text style={styles.evidenceMeta}>
                  {ev.role.length > 0 ? `${formatShortDate(ev.date)} · ${ev.role}` : formatShortDate(ev.date)}
                </Text>
                <Text style={styles.quote}>“{ev.quote}”</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * 해낸 것 — 본문 아래.
 *
 * ⚠ 본문은 여전히 판정하지 않는다. 해낸 것은 **이 칸에서만** 말한다(§8.5 결정 2).
 */
export function AchievementsBlock({ items }: { items: Achievement[] }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{t('report.achievementsTitle')}</Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.bullet}>·</Text>
            <View style={styles.rowBody}>
              <Text style={styles.item}>{item.text}</Text>
              {item.dates.length > 0 && <Text style={styles.dates}>{joinDates(item.dates)}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * 권유 — *"해보면 어떨까요"*.
 *
 * 🔴 **반복된 패턴과 날짜를 먼저 보여준다.** 근거가 안 보이는 권유는 뜬금없는 조언으로 읽힌다 —
 *   외부 평가에서 *"날짜와 반복 근거를 붙인 구조"* 가 조언 느낌을 줄였다고 했다.
 */
export function SuggestionsBlock({ items }: { items: Suggestion[] }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{t('report.suggestionsTitle')}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.suggestion}>
          <Text style={styles.item}>{item.text}</Text>
          <Text style={styles.dates}>
            {t('report.suggestionFrom', { pattern: item.pattern, dates: joinDates(item.dates) })}
          </Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    section: {
      gap: spacing.sm,
      paddingTop: spacing.lg,
      marginTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    label: {
      ...typography.caption,
      color: colors.textMuted,
    },
    /* 카드 — 그림자 없이 테두리만(기둥 2). 발견이 여러 개라 한 덩어리씩 읽히게 가른다 */
    card: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    shape: {
      ...typography.caption,
      color: colors.accent,
    },
    title: {
      ...typography.body,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
      lineHeight: 24,
    },
    evidenceList: {
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    evidence: {
      gap: 2,
      paddingVertical: 4,
      paddingLeft: spacing.sm,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    evidencePressed: {
      backgroundColor: colors.surfaceMuted,
    },
    evidenceMeta: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    quote: {
      ...typography.caption,
      color: colors.text,
      flexShrink: 1,
    },
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    bullet: {
      ...typography.body,
      color: colors.textMuted,
    },
    /* ⚠ 행 안의 Text 는 폭이 확정된 상자 안에 둔다(CLAUDE.md §10) — `flex: 1` 이 그 일을 한다 */
    rowBody: {
      flex: 1,
      gap: 2,
    },
    item: {
      ...typography.body,
      color: colors.text,
      lineHeight: 24,
      flexShrink: 1,
    },
    dates: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    suggestion: {
      gap: 4,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
    },
  });
