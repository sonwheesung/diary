import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** 라벨 왼쪽 아이콘 */
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const isBlocked = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      onPress={onPress}
      disabled={isBlocked}
      // Shadow 최소 원칙이라 눌림 표현은 그림자가 아니라 투명도로 한다.
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isBlocked && styles.blocked,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textOnAccent : colors.accent} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    fullWidth: {
      alignSelf: 'stretch',
    },
    pressed: {
      opacity: 0.7,
    },
    blocked: {
      opacity: 0.4,
    },
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    label: {
      ...typography.subtitle,
      /*
       * 🔴 **`flexShrink`가 없으면 마지막 단어가 안 그려진다.** 아이콘과 나란한 행 안에서
       *   Fabric이 **측정과 페인트에 다른 폭**을 준다 — 상자는 `New entry` 폭(196px)으로
       *   잡히는데 내부 텍스트 레이아웃은 더 좁은 폭으로 줄바꿈해, 2행이 1행 높이 밖으로
       *   밀려나 사라진다. 화면에는 `New`만 남는다(2026-08-23 영어 홈에서 실측).
       * ⚠ 한국어에서는 안 보인다 — `조각 쓰기`가 짧아 줄바꿈 지점에 닿지 않는다.
       *   **영어는 14개 언어의 폴백**이라 여기가 가장 넓게 새는 자리였다.
       * ⚠ `numberOfLines={1}`로 막지 않는다 — 그건 잘린 라벨을 *의도적으로* 만드는 것이고
       *   §9.1 규칙 5가 금지한다. 폭을 확정해 두 패스가 같은 값을 보게 하는 것이 답이다.
       */
      flexShrink: 1,
    },
    primaryLabel: {
      color: colors.textOnAccent,
    },
    secondaryLabel: {
      color: colors.text,
    },
    ghostLabel: {
      color: colors.accent,
    },
  });
