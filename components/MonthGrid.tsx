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
  /** 이 날짜 이후는 누를 수 없다 */
  maxDate?: string;
}

/**
 * 한 달 날짜 격자. 작성 화면의 날짜 변경과 캘린더 탭이 같은 격자를 쓴다 —
 * 두 벌을 만들면 '오늘 표시'나 첫 요일 규칙이 어느 순간 서로 어긋난다.
 */
export function MonthGrid({ month, selected, onSelect, markedDates, maxDate }: MonthGridProps) {
  const first = startOfMonth(month);
  const leading = weekdayIndex(first);
  const total = daysInMonth(month);
  const prefix = `${first.slice(0, 8)}`;
  const todayValue = today();

  return (
    <View>
      <View style={styles.week}>
        {WEEKDAYS.map((label) => (
          <View key={label} style={styles.cell}>
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
          const disabled = maxDate !== undefined && date > maxDate;

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
                style={[styles.day, isToday && styles.dayToday, isSelected && styles.daySelected]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelSelected,
                    disabled && styles.dayLabelDisabled,
                  ]}
                >
                  {day}
                </Text>
              </View>
              {/* 선택된 날은 배경이 진해서 같은 색 점이 묻힌다 — 밝은 색으로 뒤집는다 */}
              <View
                style={[
                  styles.dot,
                  markedDates?.has(date) === true &&
                    (isSelected ? styles.dotOnSelected : styles.dotVisible),
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** 7칸을 정확히 나눈 값. 100/7을 계산해 넣으면 타입이 string으로 넓어져 style에 못 들어간다 */
const CELL = '14.2857%';

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekday: {
    ...typography.caption,
    color: colors.textMuted,
    paddingVertical: spacing.xs,
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
