import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { MonthGrid } from '@/components/MonthGrid';
import { addMonths, startOfMonth, today } from '@/lib/date';
import { formatMonthLabel } from '@/lib/format';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DatePickerSheetProps {
  visible: boolean;
  value: string;
  onSelect: (entryDate: string) => void;
  onClose: () => void;
  /** 이 날짜 이후는 고를 수 없다 */
  maxDate?: string;
  /** 이미 차지된 날짜 — 점이 찍힌 채로 눌리지 않는다 */
  takenDates?: ReadonlySet<string>;
  /** 보고 있는 달이 바뀔 때. 그 달의 `takenDates`를 불러오라는 신호다 */
  onMonthChange?: (month: string) => void;
}

/** 날짜를 고르는 시트. 고르는 즉시 닫힌다 — 확인 버튼을 한 번 더 누르게 하지 않는다. */
export function DatePickerSheet({
  visible,
  value,
  onSelect,
  onClose,
  maxDate,
  takenDates,
  onMonthChange,
}: DatePickerSheetProps) {
  const [month, setMonth] = useState(value);

  // 닫았다 다시 열면 고른 날짜가 있는 달에서 시작한다. 지난달을 보다 닫았다고 그 달이 남으면 헷갈린다.
  useEffect(() => {
    if (visible) {
      setMonth(value);
    }
  }, [visible, value]);

  useEffect(() => {
    if (visible) {
      onMonthChange?.(month);
    }
  }, [visible, month, onMonthChange]);

  const nextMonth = addMonths(month, 1);
  const canGoNext = maxDate === undefined || startOfMonth(nextMonth) <= maxDate;
  // 오늘 이미 썼다면 '오늘로'도 막아야 한다 — 눌러서 못 고를 날로 보내면 안 된다.
  const todayTaken = takenDates?.has(today()) === true;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          onPress={() => setMonth(addMonths(month, -1))}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          accessibilityState={{ disabled: !canGoNext }}
          disabled={!canGoNext}
          onPress={() => setMonth(nextMonth)}
          hitSlop={12}
        >
          <ChevronRight size={22} color={canGoNext ? colors.text : colors.border} />
        </Pressable>
      </View>

      <MonthGrid
        month={month}
        selected={value}
        onSelect={onSelect}
        markedDates={takenDates}
        disabledDates={takenDates}
        maxDate={maxDate}
      />

      {takenDates !== undefined && takenDates.size > 0 && (
        <Text style={styles.hint}>점이 찍힌 날은 이미 조각을 썼어요</Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: todayTaken }}
        disabled={todayTaken}
        onPress={() => onSelect(today())}
        style={[styles.todayButton, todayTaken && styles.todayButtonDisabled]}
      >
        <Text style={[styles.todayLabel, todayTaken && styles.todayLabelDisabled]}>오늘로</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    ...typography.subtitle,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  todayButtonDisabled: {
    opacity: 0.5,
  },
  todayLabel: {
    ...typography.label,
    color: colors.accent,
  },
  todayLabelDisabled: {
    color: colors.textMuted,
  },
});
