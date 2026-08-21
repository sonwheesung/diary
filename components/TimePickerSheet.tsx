import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import type { ReminderTime } from '@/features/notification/reminder-schedule';
import { formatTimeOfDay } from '@/lib/format';
import type { Palette } from '@/theme/palettes';
import { radius, spacing } from '@/theme/spacing';
import { useStyles } from '@/theme/use-styles';
import { typography } from '@/theme/typography';

interface TimePickerSheetProps {
  visible: boolean;
  value: ReminderTime;
  onSelect: (time: ReminderTime) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
/** 5분 단위. 1분 단위면 60줄이 되고, 일기 알림에 1분 정밀도가 필요하지 않다 */
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

/** 세로 목록 한 줄의 높이. 열었을 때 고른 값으로 스크롤을 맞추는 데 쓴다 */
const ROW_HEIGHT = 44;

/**
 * 시각을 고르는 시트.
 *
 * ⚠ 날짜 시트(`DatePickerSheet`)와 달리 **확인 버튼이 있다.** 값이 둘(시·분)이라
 *   하나를 누른 순간 닫으면 나머지를 못 고른다. 눈에 보이는 버튼을 기본 경로로 둔다(CLAUDE.md §10).
 * ⚠ 가로가 아니라 **세로 스크롤**이다 — 옆으로 밀어야 보이는 항목은 사실상 안 고른다(§10).
 */
export function TimePickerSheet({ visible, value, onSelect, onClose }: TimePickerSheetProps) {
  const { t } = useTranslation();
  const styles = useStyles(createStyles);
  const [hour, setHour] = useState(value.hour);
  const [minute, setMinute] = useState(value.minute);

  // 닫았다 다시 열면 저장된 값에서 시작한다. 고르다 만 값이 남으면 헷갈린다.
  useEffect(() => {
    if (visible) {
      setHour(value.hour);
      // 5분 단위 목록에 없는 값이 저장돼 있어도 가장 가까운 칸을 고른 것으로 보여준다
      setMinute(MINUTES.includes(value.minute) ? value.minute : Math.round(value.minute / 5) * 5);
    }
  }, [visible, value]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('settings.reminderTime')}>
      <Text style={styles.preview}>{formatTimeOfDay(hour, minute)}</Text>

      <View style={styles.columns}>
        <Column
          label={t('settings.reminderHour')}
          values={HOURS}
          selected={hour}
          onSelect={setHour}
        />
        <Column
          label={t('settings.reminderMinute')}
          values={MINUTES}
          selected={minute}
          onSelect={setMinute}
        />
      </View>

      <Button label={t('common.confirm')} onPress={() => onSelect({ hour, minute })} />
    </BottomSheet>
  );
}

function Column({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: readonly number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const styles = useStyles(createStyles);
  const ref = useRef<ScrollView>(null);

  /*
   * 열었을 때 고른 값이 보이게 맞춘다.
   *
   * ⚠ `ScrollView`의 `contentOffset` prop은 **iOS 전용**이다. 안드로이드에서는 조용히 무시돼
   *   목록이 늘 맨 위(00시)에서 시작한다 — 21:00을 쓰는 사람이 매번 아래로 밀어야 한다.
   *   그래서 ref로 직접 스크롤한다. `animated: false`인 이유는 열자마자 움직이면 어지러워서다.
   */
  useEffect(() => {
    const y = Math.max(0, values.indexOf(selected) - 1) * ROW_HEIGHT;
    // 레이아웃이 잡힌 뒤라야 먹는다. 마운트와 같은 프레임에 부르면 무시된다.
    const timer = setTimeout(() => ref.current?.scrollTo({ y, animated: false }), 0);
    return () => clearTimeout(timer);
    // 고를 때마다 튀지 않게 **열릴 때 한 번만** 맞춘다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <ScrollView ref={ref} style={styles.list} showsVerticalScrollIndicator={false}>
        {values.map((v) => {
          const active = v === selected;
          return (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(v)}
              // 뒤쪽에서 배경만 바꿀 때 borderRadius를 함께 다시 적는다 —
              // 안드로이드에서 앞 스타일의 반지름이 먹지 않는 경우가 있다(CLAUDE.md §10).
              style={[styles.cell, active && styles.cellActive]}
            >
              <Text style={[styles.cellLabel, active && styles.cellLabelActive]}>
                {String(v).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    preview: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    columns: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    column: {
      flex: 1,
    },
    columnLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    list: {
      height: ROW_HEIGHT * 4,
    },
    cell: {
      height: ROW_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
    },
    cellActive: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
    },
    cellLabel: {
      ...typography.body,
      color: colors.text,
    },
    cellLabelActive: {
      color: colors.textOnAccent,
    },
  });
