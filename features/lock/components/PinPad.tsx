import { Delete } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PIN_LENGTH } from '@/features/lock/api/lock-store';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/**
 * PIN 입력.
 *
 * 화면 키보드를 쓰지 않고 자체 키패드를 그린다 — 숫자 키보드는 자동완성·클립보드 제안이 붙고,
 * 잠금 화면에서 그런 게 뜨면 안 된다. 입력한 자리는 점으로만 보여준다.
 */
export function PinPad({ value, onChange, disabled = false }: PinPadProps) {
  const press = (key: string) => {
    if (disabled) {
      return;
    }
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= PIN_LENGTH) {
      return;
    }
    onChange(value + key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }, (_, index) => (
          <View key={index} style={[styles.dot, index < value.length && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.pad}>
        {KEYS.map((key, index) =>
          key === '' ? (
            <View key={`blank-${index}`} style={styles.key} />
          ) : (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key === 'del' ? '지우기' : key}
              onPress={() => press(key)}
              disabled={disabled}
              style={({ pressed }) => [styles.key, pressed && !disabled && styles.keyPressed]}
            >
              {key === 'del' ? (
                <Delete size={22} color={colors.text} />
              ) : (
                <Text style={styles.keyLabel}>{key}</Text>
              )}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.accentMuted,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderRadius: 7,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    gap: spacing.md,
  },
  key: {
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  keyPressed: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  keyLabel: {
    ...typography.title,
    color: colors.text,
  },
});
