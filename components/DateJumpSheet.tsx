import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { MonthGrid } from '@/components/MonthGrid';
import { addMonths, daysInMonth, startOfMonth } from '@/lib/date';
import { formatMonthLabel } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DateJumpSheetProps {
  visible: boolean;
  /** 보고 있는 달. 그 달 안의 아무 날짜나 주면 된다 */
  month: string;
  onMonthChange: (month: string) => void;
  /** 조각이 있는 날. **여기만 누를 수 있다** */
  writtenDates: ReadonlySet<string>;
  onSelect: (entryDate: string) => void;
  onClose: () => void;
}

/**
 * 날짜로 건너뛰는 시트 — 목록(`app/diaries.tsx`)에서 특정 날의 조각으로 바로 간다.
 *
 * 🔴 **`DatePickerSheet` 와 합치지 않는다. 뜻이 정반대다.**
 * 저쪽은 *쓸 날* 을 고르므로 **조각이 있는 날이 막히고**, 여기는 *볼 날* 을 고르므로
 * **조각이 있는 날만 열린다.** 한 컴포넌트가 둘을 겸하면 어느 쪽이 기본인지 흐려지고,
 * 작성 화면 쪽은 *"고르는 순간 그 날짜는 반드시 비어 있다"*(`DIARY_SYSTEM.md` §2)라는
 * 계약을 지고 있어 잘못 건드리면 다 쓰고 나서 막히는 일이 생긴다.
 * 2026-09-10 에 `styles.link` 하나가 두 배치를 겸하다 어긋난 것과 같은 종류다.
 *
 * ⚠ 대신 **격자는 하나다**(`MonthGrid`). 두 벌이 되면 '오늘 표시'나 첫 요일 규칙이
 * 언젠가 서로 달라진다 — 그 규칙은 저쪽 주석이 이미 적어놨다.
 *
 * 🚫 `오늘로` 버튼을 두지 않는다. 오늘 조각이 없으면 눌러도 갈 곳이 없고,
 * 있으면 목록 맨 위가 이미 오늘이다.
 */
export function DateJumpSheet({
  visible,
  month,
  onMonthChange,
  writtenDates,
  onSelect,
  onClose,
}: DateJumpSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useStyles(createStyles);

  // 열릴 때마다 그 달을 다시 읽으라고 알린다 — 닫아둔 사이에 지웠을 수 있다.
  useEffect(() => {
    if (visible) {
      onMonthChange(month);
    }
  }, [visible, month, onMonthChange]);

  /*
   * 🔴 **못 누르는 날을 명시적으로 만든다.** `MonthGrid` 는 금지 목록만 받으므로
   *   "쓴 날만 누를 수 있다"를 그리려면 그 달의 나머지를 직접 세어 넘겨야 한다.
   *   빈 날을 살려두고 눌렀을 때 아무 일도 안 하는 쪽이 더 싸 보이지만, 그건
   *   *"탭이 눌리는데 내용이 안 따라오는"* 상태다(§12 2026-09-04).
   */
  const first = startOfMonth(month);
  const prefix = first.slice(0, 8);
  const blocked = new Set<string>();
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    const entryDate = `${prefix}${String(day).padStart(2, '0')}`;
    if (!writtenDates.has(entryDate)) {
      blocked.add(entryDate);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.prevMonth')}
          onPress={() => onMonthChange(addMonths(month, -1))}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
        {/*
          ⚠ 다음 달을 막지 않는다. 여기서 달을 넘기는 건 '쓰겠다'가 아니라 '찾겠다'라서
            앞으로 못 가면 지나온 달로 돌아오는 길만 남는다(캘린더 탭과 같은 판단).
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.nextMonth')}
          onPress={() => onMonthChange(addMonths(month, 1))}
          hitSlop={12}
        >
          <ChevronRight size={22} color={colors.text} />
        </Pressable>
      </View>

      {/*
        🔴 `flat` — 여기서는 **채운 원을 그리지 않는다**(2026-09-10 사용자 요청).
          이 시트는 쓴 날을 강조하고 안 쓴 날을 죽이느라 **거의 모든 칸이 칠해진다.**
          전부 칠하면 아무것도 강조되지 않는다 — 점 하나와 글자 색이면 읽힌다.
      */}
      <MonthGrid
        month={month}
        selected={null}
        onSelect={onSelect}
        markedDates={writtenDates}
        disabledDates={blocked}
        flat
      />

      <Text style={styles.hint}>{t('diaries.byDateHint')}</Text>
    </BottomSheet>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    monthLabel: {
      ...typography.subtitle,
      color: colors.text,
      flexShrink: 1,
    },
    hint: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
