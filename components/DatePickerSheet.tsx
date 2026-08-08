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
}

/** 날짜를 고르는 시트. 고르는 즉시 닫힌다 — 확인 버튼을 한 번 더 누르게 하지 않는다. */
export function DatePickerSheet({
  visible,
  value,
  onSelect,
  onClose,
  maxDate,
}: DatePickerSheetProps) {
  const [month, setMonth] = useState(value);

  // 닫았다 다시 열면 고른 날짜가 있는 달에서 시작한다. 지난달을 보다 닫았다고 그 달이 남으면 헷갈린다.
  useEffect(() => {
    if (visible) {
      setMonth(value);
    }
  }, [visible, value]);

  const nextMonth = addMonths(month, 1);
  const canGoNext = maxDate === undefined || startOfMonth(nextMonth) <= maxDate;

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

      <MonthGrid month={month} selected={value} onSelect={onSelect} maxDate={maxDate} />

      <Pressable
        accessibilityRole="button"
        onPress={() => onSelect(today())}
        style={styles.todayButton}
      >
        <Text style={styles.todayLabel}>오늘로</Text>
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
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  todayLabel: {
    ...typography.label,
    color: colors.accent,
  },
});
