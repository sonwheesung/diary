import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface PatternGridProps {
  /** 손을 떼면 지나온 점들을 순서대로 넘긴다. 예: '0-4-8' */
  onComplete: (pattern: string) => void;
  disabled?: boolean;
}

const SIZE = 3;
const DOT_COUNT = SIZE * SIZE;
const GRID = 280;
const HIT_RADIUS = 34;

/**
 * 3×3 패턴 입력 (CLAUDE.md §7.1).
 *
 * 지나간 점을 순서대로 모아 문자열로 만든다. 같은 점은 다시 세지 않는다 —
 * 되돌아오는 동작까지 기록하면 사용자가 자기가 그린 패턴을 재현하지 못한다.
 *
 * 선을 그리지는 않는다. 지나온 점만 채워서 보여준다 — 화면에 남는 궤적은
 * 어깨너머로 보는 사람에게 그대로 노출된다.
 */
export function PatternGrid({ onComplete, disabled = false }: PatternGridProps) {
  const [touched, setTouched] = useState<number[]>([]);
  const touchedRef = useRef<number[]>([]);

  const centers = useMemo(() => {
    const step = GRID / SIZE;
    return Array.from({ length: DOT_COUNT }, (_, index) => ({
      x: (index % SIZE) * step + step / 2,
      y: Math.floor(index / SIZE) * step + step / 2,
    }));
  }, []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          touchedRef.current = [];
          setTouched([]);
          hit(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          hit(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderRelease: () => {
          const pattern = touchedRef.current;
          touchedRef.current = [];
          setTouched([]);
          if (pattern.length > 0) {
            onComplete(pattern.join('-'));
          }
        },
      }),
    // hit/centers는 이 컴포넌트 생애 동안 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, onComplete],
  );

  const hit = (x: number, y: number) => {
    for (let index = 0; index < DOT_COUNT; index += 1) {
      const center = centers[index];
      if (center === undefined || touchedRef.current.includes(index)) {
        continue;
      }
      const dx = x - center.x;
      const dy = y - center.y;
      if (Math.sqrt(dx * dx + dy * dy) <= HIT_RADIUS) {
        touchedRef.current = [...touchedRef.current, index];
        setTouched(touchedRef.current);
        return;
      }
    }
  };

  return (
    <View style={styles.grid} {...responder.panHandlers}>
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <View key={index} style={styles.cell} pointerEvents="none">
          <View style={[styles.dot, touched.includes(index) && styles.dotOn]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: GRID,
    height: GRID,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: GRID / SIZE,
    height: GRID / SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accentMuted,
    backgroundColor: 'transparent',
  },
  dotOn: {
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  spacer: {
    height: spacing.md,
  },
});
