import { useMemo } from 'react';

import type { Palette } from '@/theme/palettes';
import { useColors } from '@/theme/theme';

/**
 * 팔레트가 바뀌면 스타일을 다시 만든다.
 *
 * `StyleSheet.create`를 모듈 최상단에 두면 색이 앱 시작 시점에 굳어 테마를 못 바꾼다.
 * 그래서 스타일을 **팔레트를 받는 함수**로 바꾸고 여기서 호출한다.
 *
 * `factory`는 모듈 최상단에 선언해 참조가 고정돼야 한다 — 컴포넌트 안에서 만들면
 * 매 렌더마다 새 함수가 되어 memo가 무의미해진다.
 */
export function useStyles<T>(factory: (colors: Palette) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [factory, colors]);
}
