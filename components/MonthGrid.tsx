import { Pressable, StyleSheet, Text, View } from 'react-native';

import { daysInMonth, startOfMonth, today, weekdayIndex } from '@/lib/date';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface MonthGridProps {
  /** 그릴 달. 그 달 안의 아무 날짜나 넘기면 된다 */
  month: string;
  selected?: string | null;
  onSelect: (entryDate: string) => void;
  /** 점을 찍을 날짜들. 캘린더 탭에서 '조각을 쓴 날' 표시에 쓴다 */
  markedDates?: ReadonlySet<string>;
  /**
   * 누를 수 없는 날짜들. `markedDates`와 겹치면 **점 찍힌 채로 비활성**이 된다 —
   * 작성 화면에서 "이미 쓴 날"을 그렇게 표시한다. 아직 안 온 날(`maxDate` 밖)과 구분되어야 해서
   * 흐리게 죽이는 색을 다르게 쓴다.
   */
  disabledDates?: ReadonlySet<string>;
  /** 이 날짜 이후는 누를 수 없다 */
  maxDate?: string;
}

/**
 * 한 달 날짜 격자. 작성 화면의 날짜 변경과 캘린더 탭이 같은 격자를 쓴다 —
 * 두 벌을 만들면 '오늘 표시'나 첫 요일 규칙이 어느 순간 서로 어긋난다.
 */
export function MonthGrid({
  month,
  selected,
  onSelect,
  markedDates,
  disabledDates,
  maxDate,
}: MonthGridProps) {
  const first = startOfMonth(month);
  const leading = weekdayIndex(first);
  const total = daysInMonth(month);
  const prefix = `${first.slice(0, 8)}`;
  const todayValue = today();

  return (
    <View>
      <View style={styles.week}>
        {WEEKDAYS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <Text style={styles.weekday}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.week}>
        {/* 1일이 무슨 요일인지에 맞춰 앞을 비운다 */}
        {Array.from({ length: leading }, (_, index) => (
          <View key={`blank-${index}`} style={styles.cell} />
        ))}

        {Array.from({ length: total }, (_, index) => {
          const day = index + 1;
          const date = `${prefix}${String(day).padStart(2, '0')}`;
          const isSelected = date === selected;
          const isToday = date === todayValue;
          const marked = markedDates?.has(date) === true;
          const taken = disabledDates?.has(date) === true;
          const outOfRange = maxDate !== undefined && date > maxDate;
          const disabled = taken || outOfRange;

          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={`${day}일`}
              disabled={disabled}
              onPress={() => onSelect(date)}
              style={styles.cell}
            >
              <View
                style={[
                  styles.day,
                  isToday && styles.dayToday,
                  // 이미 쓴 날은 눌리지 않지만 '있다'는 건 보여야 한다 — 옅은 배경으로 남긴다.
                  taken && styles.dayTaken,
                  isSelected && styles.daySelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                    taken && styles.dayLabelTaken,
                    outOfRange && styles.dayLabelDisabled,
                  ]}
                >
                  {day}
                </Text>
              </View>
              {/* 선택된 날은 배경이 진해서 같은 색 점이 묻힌다 — 밝은 색으로 뒤집는다 */}
              <View
                style={[
                  styles.dot,
                  marked && (isSelected ? styles.dotOnSelected : styles.dotVisible),
                ]}
              />
            </Pressable>
          );
        })}

        {/*
          뒤를 빈 칸으로 채워 **항상 6주**를 그린다.
          달마다 주 수가 4~6으로 달라지면 시트 높이가 매번 바뀌어, 날짜를 고를 때마다
          화면이 위아래로 튄다(2026-08-08).
        */}
        {Array.from({ length: WEEKS * 7 - leading - total }, (_, index) => (
          <View key={`tail-${index}`} style={styles.cell} />
        ))}
      </View>
    </View>
  );
}

/** 7칸을 정확히 나눈 값. 100/7을 계산해 넣으면 타입이 string으로 넓어져 style에 못 들어간다 */
const CELL = '14.2857%';
/** 날짜 원(36) + 점(6) + 위아래 여백 */
const CELL_HEIGHT = 50;
/** 어떤 달이든 6주로 그린다 — 4·5·6주가 섞이면 시트 높이가 매번 달라진다 */
const WEEKS = 6;

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCell: {
    width: CELL,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekday: {
    ...typography.caption,
    color: colors.textMuted,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: colors.accentSoft,
  },
  dayTaken: {
    backgroundColor: colors.surfaceMuted,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayLabel: {
    ...typography.label,
    color: colors.text,
  },
  dayLabelSelected: {
    color: colors.textOnAccent,
  },
  // 이미 쓴 날 — 아직 안 온 날과 같은 회색으로 죽이면 둘을 구분할 수 없다.
  dayLabelTaken: {
    color: colors.accentMuted,
  },
  dayLabelDisabled: {
    color: colors.border,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  dotVisible: {
    backgroundColor: colors.accentMuted,
  },
  dotOnSelected: {
    backgroundColor: colors.accentSoft,
  },
});
