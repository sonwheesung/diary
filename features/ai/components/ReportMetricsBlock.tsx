import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { ReportMetrics } from '@/features/ai/api/report-repository';
import { METRIC_CODES, TOPIC_CODES } from '@/features/ai/types';
import type { MetricCode, TopicCode } from '@/features/ai/types';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/**
 * 지표 넷과 그 밖의 주제 — 모델이 만든 층 (`docs/AI_REPORT_SYSTEM.md` §8.4).
 *
 * 🔴 **없으면 블록 자체를 안 그린다.** 프롬프트 v8 이전 리포트에는 지표가 없고, 기간 캡이
 *   평생 1번이라 **영원히 안 생긴다.** 빈 게이지를 그리면 고장으로 보이고, *"만들어 보세요"*
 *   같은 안내는 만들 수 없는 것을 권하는 거짓말이 된다.
 *
 * ⚠ **글 아래·"그 기간의 모양" 위**에 둔다. 순서는 **글 → 지표 → 그 밖에 → 모양**이다 —
 *   모델이 읽고 쓴 것이 먼저고, 앱이 센 것이 그다음이다.
 *
 * 🚫 **화살표·빨강/초록을 쓰지 않는다.** 낮은 점수는 대개 **힘들었던 기간**에 나온다.
 *   그 자리에서 성적표가 되면 일기를 쓰는 일이 채점이 된다(기둥 2·§3).
 */
export function ReportMetricsBlock({ data }: { data: ReportMetrics }) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);

  /*
   * 순서를 `METRIC_CODES`로 **고정한다.** 서버가 준 순서를 그대로 쓰면 기간마다 줄이 바뀌어
   * 지난 리포트와 눈으로 비교가 안 된다.
   */
  const metrics = METRIC_CODES.map((code) =>
    data.metrics.find((m) => m.code === code),
  ).filter((m): m is NonNullable<typeof m> => m !== undefined);

  const topics = TOPIC_CODES.map((code) => data.topics.find((x) => x.code === code)).filter(
    (x): x is NonNullable<typeof x> => x !== undefined && x.days > 0,
  );

  if (metrics.length === 0 && topics.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {metrics.length > 0 && (
        <>
          <Text style={styles.label}>
            {data.from === undefined
              ? t('report.metricsTitle')
              : t('report.metricsFrom', { count: String(data.from) })}
          </Text>
          <View style={styles.list}>
            {metrics.map((m) => (
              <View key={m.code} style={styles.row}>
                <View style={styles.top}>
                  <Text style={styles.name}>{t(`metric.${m.code as MetricCode}`)}</Text>
                  {/*
                    🔴 셀 수 없는 지표(`stress`·`happiness`)는 `days`가 `null`이다.
                      빈칸이 아니라 `—`로 두어 **"못 센 것"이 아니라 "셀 수 없는 것"** 임을 보인다.
                  */}
                  <Text style={styles.days}>
                    {m.days === null ? t('report.noDays') : t('report.days', { count: String(m.days) })}
                  </Text>
                  <Text style={styles.value}>{clamp(m.value)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${clamp(m.value)}%` }]} />
                </View>
                {m.basis.length > 0 && <Text style={styles.basis}>{m.basis}</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      {topics.length > 0 && (
        <>
          <Text style={styles.label}>{t('report.topicsTitle')}</Text>
          <View style={styles.chips}>
            {topics.map((x) => (
              <View key={x.code} style={styles.chip}>
                <Text style={styles.chipName}>{t(`topic.${x.code as TopicCode}`)}</Text>
                <Text style={styles.chipDays}>{t('report.days', { count: String(x.days) })}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

/**
 * 0~100 밖의 값을 잘라낸다.
 *
 * ⚠ 모델이 스키마를 지켜도 **범위까지 지킨다는 보장은 없다.** 120이 오면 막대가 칸 밖으로
 *   나가고, 음수가 오면 RN이 그 자리에서 던진다. 화면이 데이터를 믿지 않는 것이 규약이다.
 */
function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
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
    row: { gap: 4 },
    top: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
    },
    name: {
      ...typography.body,
      // ⚠ 행 안의 Text 는 flexShrink 를 준다 — 없으면 마지막 글자가 안 그려진다(CLAUDE.md §10).
      //   독일어 `Zufriedenheit`가 가장 길다
      flex: 1,
      flexShrink: 1,
      color: colors.text,
    },
    days: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    value: {
      ...typography.caption,
      color: colors.text,
      minWidth: 26,
      textAlign: 'right',
      flexShrink: 0,
    },
    track: {
      height: 5,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 999,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    basis: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    chipName: {
      ...typography.caption,
      color: colors.text,
      flexShrink: 1,
    },
    chipDays: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
  });
