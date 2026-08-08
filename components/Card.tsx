import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Palette } from '@/theme/palettes';
import { useStyles } from '@/theme/use-styles';
import { radius, spacing } from '@/theme/spacing';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** 내부 여백 없이 쓰고 싶을 때(이미지가 카드 끝까지 차는 경우) */
  flush?: boolean;
}

export function Card({ children, onPress, style, flush = false }: CardProps) {
  const styles = useStyles(createStyles);
  const content = [styles.base, flush ? styles.flush : styles.padded, style];

  if (onPress === undefined) {
    return <View style={content}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [...content, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      // Shadow 최소 — 경계는 그림자가 아니라 아주 옅은 테두리로 만든다.
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    padded: {
      padding: spacing.md,
    },
    flush: {
      padding: 0,
    },
    pressed: {
      opacity: 0.75,
    },
  });
