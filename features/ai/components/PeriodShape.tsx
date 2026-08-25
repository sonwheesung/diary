import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { EMOTION_CODES_ORDER, type EmotionCode } from '@/features/diary/emotions';
import type { BucketCell, Shape } from '@/features/ai/stats';
import { weekKeyRange } from '@/features/ai/period';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Kind = 'weekly' | 'monthly' | 'yearly';

/**
 * "그 기간의 모양" — 리포트 상세의 마지막 블록.
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §8.3
 *
 * 🔴 **모델을 부르지 않는다.** 전부 로컬 조각에서 센 값이라 **옛 리포트에도 붙는다** —
 *   모델이 만드는 지표는 기간 캡이 평생 1번이라 소급이 영원히 불가능하다.
 *
 * 🔴 **차트 라이브러리를 안 쓴다.** 격자와 막대는 flex로 그려진다. 45MB 번들에 더 얹지 않고,
 *   기둥 2(조용한 화면)와도 맞는다.
 *
 * ⚠ **글 아래에 둔다.** 리포트 상세는 읽는 자리다 — 그림이 위로 올라오면 요약문이 밀린다.
 */
export function PeriodShape({
  shape,
  prev,
  kind,
}: {
  shape: Shape;
  /**
   * 바로 앞 기간. **없으면 비교를 안 그린다.**
   *
   * 🔴 **리포트가 아니라 조각이 있으면 된다.** 이 층은 모델과 무관해서, 지난 기간 리포트를
   *   안 만들었어도 그때 쓴 조각만 있으면 비교가 선다 — 화면 시안에서는 이걸 *"지난주 리포트
   *   없음"* 으로 잘못 적었었다(2026-08-25 정정).
   */
  prev: Shape | null;
  kind: Kind;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const emotionColor = (code: string | null): string =>
    code !== null && isEmotionCode(code) ? colors.emotion[code] : colors.border;

  /** 그 기간에 실제로 나온 감정. 순서를 `EMOTION_CODES_ORDER`로 고정한다 — 등장 순서면 매번 튄다 */
  const present = EMOTION_CODES_ORDER.filter((code) =>
    shape.days !== null
      ? shape.days.some((d) => d.emotion === code)
      : (shape.buckets ?? []).some((b) => (b.byEmotion[code] ?? 0) > 0),
  );

  /*
   * 막대 높이의 기준. **0으로 나누지 않는다** — 한 조각도 없는 기간에서도 화면은 그려져야 한다.
   * 그 기간의 최대값으로 정규화한다(고정 상한을 두면 조용한 주가 전부 납작해진다).
   */
  /*
   * 🔴 **지난 기간도 같은 축에 올린다.** 각자의 최대값으로 정규화하면 두 막대가 늘 비슷해 보여
   *   비교가 거짓이 된다 — 절반만 쓴 주도 "비슷했다"로 읽힌다.
   */
  const peak = Math.max(
    1,
    ...(shape.days ?? []).map((d) => d.chars),
    ...(shape.buckets ?? []).map((b) => b.chars),
    ...(prev?.days ?? []).map((d) => d.chars),
    ...(prev?.buckets ?? []).map((b) => b.chars),
  );

  /* 주간만 요일이 정렬되므로 짝 막대를 그린다 — 월간·연간은 아래 요약 줄로만 비교한다 */
  const prevDays = kind === 'weekly' ? (prev?.days ?? null) : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('report.shapeTitle')}</Text>

      {/*
        🔴 **막대는 조용한 단색이고 감정은 점에만 있다** (2026-08-25 에뮬레이터에서 고침).
          처음엔 막대를 감정색으로 칠했는데, 그 주가 `angry` 6일이라 **화면이 빨간 벽**이 됐다.
          감정이 한쪽으로 쏠리는 것은 정상이고(힘든 주가 그렇다), 그때마다 리포트가 소리치면
          기둥 2가 무너진다. 색은 점 하나면 충분하다 — 크기가 아니라 **위치**로 읽힌다.
      */}

      {shape.days !== null && (
        <View style={styles.grid}>
          {shape.days.map((day) => (
            <View key={day.date} style={styles.col}>
              {/*
                ⚠ `date.weekdays`는 **일요일 시작**(`["일","월",…]`)인데 이 격자는 **월요일 시작**이다
                  (§6.1 — 주는 월요일 고정). 그래서 한 칸 밀어 읽는다. 요일 이름을 두 벌로 두면
                  언젠가 한쪽만 고치게 되므로 키를 새로 만들지 않는다.
              */}
              <Text style={styles.dayName}>{t(`date.weekdays.${(day.weekday + 1) % 7}`)}</Text>
              {/*
                안 쓴 날은 **빈 동그라미**다. 색을 채우면 감정을 지어내는 셈이고,
                아무것도 안 그리면 줄이 어긋난다.
              */}
              <View
                style={[
                  styles.dot,
                  day.written ? { backgroundColor: emotionColor(day.emotion) } : styles.dotEmpty,
                ]}
              />
              {/*
                ⚠ 비교가 있으면 **같은 요일끼리 나란히** 둔다. 지난 줄은 더 옅게 —
                  지금이 주인공이라는 것을 색으로 말한다. 🚫 화살표나 빨강·초록은 쓰지 않는다:
                  점수가 내려간 주는 대개 **힘들었던 주**라 그 자리에서 성적표가 된다.
              */}
              <View style={styles.barTrack}>
                {day.chars > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.barPlain,
                      // 최소 높이 — 한 글자만 쓴 날도 "썼다"는 것이 보여야 한다
                      { height: `${Math.max(4, (day.chars / peak) * 100)}%` },
                    ]}
                  />
                )}
                {prevDays !== null && (prevDays[day.weekday]?.chars ?? 0) > 0 && (
                  <View
                    style={[
                      styles.bar,
                      styles.barPast,
                      { height: `${Math.max(4, ((prevDays[day.weekday]?.chars ?? 0) / peak) * 100)}%` },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.barNum}>{day.chars > 0 ? day.chars : '—'}</Text>
            </View>
          ))}
        </View>
      )}

      {shape.buckets !== null && (
        <View style={styles.grid}>
          {shape.buckets.map((bucket) => (
            <View key={bucket.periodKey} style={styles.col}>
              <View style={styles.barTrack}>
                {bucket.count > 0 && (
                  <StackedBar bucket={bucket} peak={peak} emotionColor={emotionColor} />
                )}
              </View>
              <Text style={styles.barNum}>{bucketLabel(bucket.periodKey, kind)}</Text>
            </View>
          ))}
        </View>
      )}

      {/*
        ⚠ 색 점만 있고 이름이 없으면 **아무 뜻도 없는 장식**이 된다. 다만 여덟을 다 늘어놓지 않고
          **그 기간에 실제로 나온 감정만** 보인다 — 대개 서넛이라 한 줄에 들어간다.
      */}
      {present.length > 0 && (
        <View style={styles.legend}>
          {present.map((code) => (
            <View key={code} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.emotion[code] }]} />
              <Text style={styles.legendLabel}>{t(`emotion.${code}`)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.summary}>
        {t('report.shapeSummary', {
          written: String(shape.writtenDays),
          total: String(shape.totalDays),
          count: String(shape.count),
        })}
      </Text>

      {/*
        월간·연간은 **짝 막대를 안 그린다.** 칸 수가 달라(4주인 달과 5주인 달) W32와 W28을
        나란히 놓는 것이 뜻이 없다. 총계만 한 줄로 비교한다.
      */}
      {prev !== null && prev.count > 0 && (
        <Text style={styles.summaryPast}>
          {t('report.shapePrevious', {
            label: t(`report.prevLabel.${kind}`),
            written: String(prev.writtenDays),
            total: String(prev.totalDays),
            count: String(prev.count),
          })}
        </Text>
      )}
    </View>
  );
}

/**
 * 월간·연간의 한 칸. 높이는 글자 수, **안쪽 칸은 감정 비율**이다.
 *
 * ⚠ 여기서는 감정색을 쓴다 — 주간과 달리 칸이 얇고 여러 감정이 섞여서 벽이 되지 않는다.
 *   ⚠ 순서를 `EMOTION_CODES_ORDER`로 고정한다. 등장 순서로 쌓으면 기간마다 색이 위아래로 튀어
 *     옆 막대와 비교가 안 된다.
 */
function StackedBar({
  bucket,
  peak,
  emotionColor,
}: {
  bucket: BucketCell;
  peak: number;
  emotionColor: (code: string | null) => string;
}) {
  const styles = useStyles(createStyles);
  const total = Object.values(bucket.byEmotion).reduce((a, n) => a + n, 0);
  const height = Math.max(4, (bucket.chars / peak) * 100);

  // 감정을 하나도 안 고른 기간이면 한 덩어리로 그린다
  if (total === 0) {
    return <View style={[styles.bar, styles.barPlain, { height: `${height}%` }]} />;
  }

  return (
    <View style={[styles.bar, { height: `${height}%` }]}>
      {EMOTION_CODES_ORDER.filter((code) => (bucket.byEmotion[code] ?? 0) > 0).map((code) => (
        <View
          key={code}
          style={{ flexGrow: bucket.byEmotion[code] ?? 0, backgroundColor: emotionColor(code) }}
        />
      ))}
    </View>
  );
}

function isEmotionCode(value: string): value is EmotionCode {
  return (EMOTION_CODES_ORDER as readonly string[]).includes(value);
}

/**
 * 막대 아래 축 라벨. **숫자 하나로 줄인다** — 연간이면 달(1~12), 월간이면 그 주가 시작하는 날(3·10·17…).
 *
 * 🔴 처음엔 월간에 `formatWeekNumber`를 썼는데 **`2026년 32주`가 다섯 칸에 들어가지 않았다**
 *   (2026-08-25 에뮬레이터). 리포트가 이미 *"2026년 8월"* 이라 연도와 "주"는 되풀이다.
 *
 * ⚠ *"8월 둘째 주"* 류의 **서수는 쓰지 않는다** — 세는 규칙이 언어마다 다르다
 *   (`CLAUDE.md` §12 2026-08-12). 시작일은 달력 사실이라 그 문제가 없다.
 *
 * ⚠ `weekKeysInMonth`는 **월요일이 그 달에 있는 주만** 주므로 시작일은 언제나 그 달 안이다.
 */
function bucketLabel(periodKey: string, kind: Kind): string {
  if (kind === 'yearly') {
    const month = /^\d{4}-(\d{2})$/.exec(periodKey)?.[1];
    return month === undefined ? periodKey : String(Number(month));
  }
  const from = weekKeyRange(periodKey)?.from;
  return from === undefined ? periodKey : String(Number(from.slice(8, 10)));
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
    grid: {
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'flex-end',
    },
    col: {
      // 🔴 flexGrow만으로는 좁은 기기에서 넘친다. basis 0 이 있어야 균등하게 줄어든다
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      alignItems: 'center',
      gap: 2,
    },
    dayName: {
      ...typography.caption,
      color: colors.textMuted,
      // ⚠ 행 안의 Text 는 flexShrink 를 준다 — 없으면 마지막 글자가 안 그려진다(CLAUDE.md §10)
      flexShrink: 1,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    dotEmpty: {
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    barTrack: {
      height: 56,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 1,
    },
    bar: {
      // 행 안에서 나눠 쓴다 — 비교가 없으면 혼자 전폭, 있으면 반씩
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      // 토큰에 이만큼 작은 값이 없다. `.dot`의 3과 같은 규약으로 리터럴을 쓴다
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      overflow: 'hidden',
    },
    barPlain: {
      backgroundColor: colors.accentMuted,
    },
    /** 지난 기간. 같은 폭이되 **더 옅다** — 지금이 주인공이라는 것을 색으로 말한다 */
    barPast: {
      backgroundColor: colors.border,
    },
    summaryPast: {
      ...typography.caption,
      color: colors.textMuted,
      opacity: 0.75,
      marginTop: -4,
      flexShrink: 1,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendLabel: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
    barNum: {
      ...typography.caption,
      fontSize: 10,
      color: colors.textMuted,
      flexShrink: 1,
    },
    summary: {
      ...typography.caption,
      color: colors.textMuted,
      flexShrink: 1,
    },
  });
