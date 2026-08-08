import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { emotions } from '@/features/diary/emotions';
import type { EmotionCode } from '@/features/diary/emotions';
import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface EmotionPickerProps {
  value: EmotionCode | null;
  onChange: (value: EmotionCode | null) => void;
}

/**
 * 감정은 선택이다. 이미 고른 것을 다시 누르면 해제된다 — 잘못 누르고 되돌릴 길이 있어야 한다.
 *
 * 가로 스크롤로 두지 않고 **줄바꿈**한다. 옆으로 밀어야 보이는 감정은 사실상 안 고르게 되고,
 * 8개는 두 줄이면 다 보인다(2026-08-08).
 */
export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  const styles = useStyles(createStyles);
  // 라벨은 언어를 탄다. 훅을 구독해야 언어를 바꾼 순간 다시 그려진다.
  useTranslation();
  return (
    <View style={styles.row}>
      {emotions().map((emotion) => {
        const selected = emotion.code === value;
        return (
          <Pressable
            key={emotion.code}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? null : emotion.code)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{emotion.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceMuted,
    },
    chipSelected: {
      backgroundColor: colors.accent,
    },
    label: {
      ...typography.label,
      color: colors.textMuted,
    },
    labelSelected: {
      color: colors.textOnAccent,
    },
  });
