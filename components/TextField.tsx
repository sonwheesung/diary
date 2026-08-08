import { forwardRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Variant = 'plain' | 'boxed';

interface TextFieldProps extends TextInputProps {
  variant?: Variant;
  /** 타이포 토큰 이름. 제목은 title, 본문은 body */
  tone?: 'title' | 'body' | 'label';
}

/**
 * 입력창. 글쓰기 화면이 조용해야 하므로 기본은 테두리 없는 plain이다.
 * placeholderTextColor를 지정하지 않으면 플랫폼마다 회색이 달라 톤이 깨진다.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { variant = 'plain', tone = 'body', style, ...rest },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.accent}
      style={[styles.base, typography[tone], styles[variant], style]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    // RN 기본 padding이 플랫폼마다 달라 줄 간격이 어긋난다. 0으로 맞추고 variant에서 준다.
    padding: 0,
  },
  plain: {
    backgroundColor: 'transparent',
  },
  boxed: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
