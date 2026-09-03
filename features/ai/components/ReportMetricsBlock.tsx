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
export function ReportMetricsBlock({
  data,
  prev,
}: {
  data: ReportMetrics;
  /**
   * 지난 기간의 지표(§8.3.2). 게이지 위에 **옅은 눈금 하나**로만 얹는다.
   *
   * 🔴 `null`이 흔한 값이다 — 요일 격자는 조각만 있으면 비교가 섰지만(§8.3.1), 지표는
   *   **지난 기간 리포트가 있고 거기 지표가 있어야** 한다. 모델이 만든 층이라 조각에서
   *   유도할 수 없다. 없으면 눈금을 안 그리고 **안내도 띄우지 않는다** — 캡이 평생 1번이라
   *   *"지난주 리포트를 만들어 보세요"* 가 못 만드는 것을 권하는 말이 될 수 있다.
   */
  prev?: ReportMetrics | null;
}) {
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
                  {/*
                    지난 기간의 자리(§8.3.2). **눈금 하나뿐이다.**

                    🚫 화살표·증감 수치·"높은 편" 같은 판정을 붙이지 않는다 — §8.3.1이
                      같은 화면의 같은 질문에 대해 이미 정했다. 낮은 점수는 대개 **힘들었던
                      기간**에 나오고, 그 자리에서 성적표가 되면 일기를 쓰는 일이 채점이 된다.
                    ⚠ 뺄셈은 **하고 싶은 사람만** 한다. 우리는 "거기 있었다"까지만 말한다.
                  */}
                  {prevOf(prev, m.code) !== null && (
                    <View
                      style={[styles.prevTick, { left: `${clamp(prevOf(prev, m.code) ?? 0)}%` }]}
                    />
                  )}
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
 * 지난 기간의 같은 지표 값. 없으면 `null`.
 *
 * ⚠ **코드로 찾는다.** 순서로 맞추면 지난 기간에 지표 하나가 빠졌을 때 **엉뚱한 지표와
 *   비교**한다 — 그림은 그럴듯하고 뜻은 틀린다.
 */
function prevOf(prev: ReportMetrics | null | undefined, code: string): number | null {
  if (prev === null || prev === undefined) return null;
  const found = prev.metrics.find((m) => m.code === code);
  return found === undefined ? null : found.value;
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
      /*
       * ⚠ **`hidden`을 풀었다.** 지난 기간 눈금이 게이지보다 조금 높아 위아래로 삐져나온다 —
       *   트랙 안에 가두면 5px 안에서 안 보인다. 대신 `fill`이 스스로 둥근 모서리를 갖는다.
       */
      position: 'relative',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    /*
     * 지난 기간의 자리 — **눈금 하나**(§8.3.2).
     *
     * ⚠ `accentMuted`를 쓴다. 짝 막대의 옅은 쪽과 같은 색이라 화면 안에서 **같은 뜻으로 읽힌다** —
     *   새 색을 쓰면 사용자가 그것이 무엇인지 따로 배워야 한다.
     * ⚠ `marginLeft`로 제 폭의 절반을 당긴다. 안 하면 눈금이 값보다 오른쪽에 선다.
     */
    prevTick: {
      position: 'absolute',
      top: -2,
      width: 2,
      height: 9,
      marginLeft: -1,
      borderRadius: 1,
      backgroundColor: colors.accentMuted,
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
