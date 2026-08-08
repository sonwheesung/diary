import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { PALETTES, isThemeMode } from '@/theme/palettes';
import type { Palette, PaletteId, ThemeMode } from '@/theme/palettes';

interface ThemeValue {
  colors: Palette;
  /** 사용자가 고른 값 (`system` 포함) */
  mode: ThemeMode;
  /** 실제로 적용된 팔레트 */
  paletteId: PaletteId;
  setMode: (next: ThemeMode) => void;
}

/**
 * 기본값은 라이트다. Provider가 붙기 전에 그려지는 순간이 있어도
 * 색이 비어 앱이 깨지는 것보다 낫다.
 */
const ThemeContext = createContext<ThemeValue>({
  colors: PALETTES.light,
  mode: 'system',
  paletteId: 'light',
  setMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // 저장된 선택을 읽어온다. 못 읽으면 시스템을 따른다 — 설정 하나 때문에 앱이 죽지 않는다.
  useEffect(() => {
    let alive = true;
    void getSetting(SETTING_KEYS.themeMode)
      .then((value) => {
        if (alive && isThemeMode(value)) {
          setModeState(value);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    // 화면을 먼저 바꾸고 저장한다. 색이 손가락을 따라오지 않으면 고장 난 것처럼 느껴진다.
    setModeState(next);
    void setSetting(SETTING_KEYS.themeMode, next).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const paletteId: PaletteId = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return { colors: PALETTES[paletteId], mode, paletteId, setMode };
  }, [mode, system, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** 색만 필요할 때 */
export function useColors(): Palette {
  return useContext(ThemeContext).colors;
}

/** 테마를 고르는 화면에서 */
export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
