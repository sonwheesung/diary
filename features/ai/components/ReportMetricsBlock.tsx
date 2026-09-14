import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { ReportMetrics } from '@/features/ai/api/report-repository';
import { METRIC_CODES, TOPIC_CODES } from '@/features/ai/types';
import type { CountFact, MetricCode, TopicCode } from '@/features/ai/types';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * "이 기간의 모습" — 지표 넷 · 셀 수 있는 사실 · 그 밖의 주제 (`docs/AI_REPORT_SYSTEM.md` §8.4 · §8.5).
 *
 * 🔴 ~~0~100 게이지 + 지난 기간 옅은 눈금~~ → **숫자 없는 문장**(2026-09-14, §8.5 결정 4).
 *   세 번의 외부 평가가 모두 *"왜 46인가"* 에 답하지 못했고 성적표로 읽혔다.
 *   값은 계속 저장된다 — 월간 합산(§8.4.1)이 그걸 쓴다. **화면만** 문장으로 바뀐다.
 *
 * ⚠ 문장은 `verdict`(v15) → 없으면 `basis`(v8~v14)로 떨어진다. 둘 다 없으면 그 줄을 안 그린다 —
 *   상위 리포트의 합산 지표는 근거 문장이 없어 **주제만 남는다.** 숫자만 그리던 자리를 없앤 결과다.
 *
 * 🔴 **셀 수 있는 사실만 숫자로 남는다** — 무엇을 셌는지가 라벨에 들어 있어서다(§8.5 결정 5).
 *   외부 평가자도 기준이 안 보이는 숫자를 틀렸다고 읽었다.
 *
 * 🚫 **화살표·빨강/초록을 쓰지 않는다.** 낮은 기간은 대개 힘들었던 기간이다(기둥 2·§3).
 */
export function ReportMetricsBlock({
  data,
  counts = [],
}: {
  data: ReportMetrics;
  /** v15 셀 수 있는 사실. 옛 리포트·위기 리포트는 빈 배열이다 */
  counts?: CountFact[];
}) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  /*
   * 순서를 `METRIC_CODES`로 **고정한다.** 서버가 준 순서를 그대로 쓰면 기간마다 줄이 바뀌어
   * 지난 리포트와 눈으로 비교가 안 된다.
   */
  const sentences = METRIC_CODES.map((code) => data.metrics.find((m) => m.code === code))
    .filter((m): m is NonNullable<typeof m> => m !== undefined)
    .map((m) => ({ code: m.code, text: (m.verdict ?? '').trim() || m.basis.trim() }))
    .filter((row) => row.text.length > 0);

  const topics = TOPIC_CODES.map((code) => data.topics.find((x) => x.code === code)).filter(
    (x): x is NonNullable<typeof x> => x !== undefined && x.days > 0,
  );

  if (sentences.length === 0 && counts.length === 0 && topics.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {(sentences.length > 0 || counts.length > 0) && (
        <>
          <Text style={styles.label}>
            {data.from === undefined
              ? t('report.metricsTitle')
              : t('report.metricsFrom', { count: String(data.from) })}
          </Text>
          <View style={styles.list}>
            {sentences.map((row) => (
              <View key={row.code} style={styles.row}>
                <Text style={styles.name}>{t(`metric.${row.code as MetricCode}`)}</Text>
                <Text style={styles.sentence}>{row.text}</Text>
              </View>
            ))}
            {counts.map((c, index) => (
              <View key={`count-${index}`} style={styles.countRow}>
                <Text style={styles.countLabel}>{c.label}</Text>
                <Text style={styles.countValue}>
                  {c.value}
                  {c.unit}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {topics.length > 0 && (
        <>
          <Text style={styles.label}>{t('report.topicsTitle')}</Text>
          <View style={styles.list}>
            {topics.map((x) => (
              <View key={x.code} style={styles.topicRow}>
                <Text style={styles.topicName}>
                  {t(`topic.${x.code as TopicCode}`)} · {t('report.days', { count: String(x.days) })}
                </Text>
                {/* 무엇으로 나타났는지(§8.5 결정 8). 위기 리포트는 서버가 비워 둔다 */}
                {x.note.trim().length > 0 && <Text style={styles.topicNote}>{x.note}</Text>}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
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
    list: { gap: spacing.sm },
    row: { gap: 2 },
    name: {
      ...typography.caption,
      color: colors.text,
      flexShrink: 1,
    },
    sentence: {
      ...typography.body,
      color: colors.text,
      lineHeight: 24,
      flexShrink: 1,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
    },
    /* ⚠ 행 안의 Text 는 flexShrink 를 준다 — 없으면 마지막 단어가 안 그려진다(CLAUDE.md §10) */
    countLabel: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      flexShrink: 1,
    },
    countValue: {
      ...typography.body,
      color: colors.text,
      flexShrink: 0,
    },
    topicRow: { gap: 2 },
    topicName: {
      ...typography.caption,
      color: colors.text,
      flexShrink: 1,
    },
    topicNote: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
  });
