/**
 * 조각 팔레트.
 *
 * **팔레트를 여러 벌 둘 수 있는 구조로 만든다.** 라이트/다크 둘만 상정하면
 * 나중에 테마 스킨(광고 보상·구독으로 여는 유료 스킨)을 붙일 때 갈아엎게 된다.
 * 스킨은 여기에 팔레트를 하나 더 추가하는 일이 되어야 한다.
 *
 * 원칙: Glass 금지 · 과한 Gradient 금지 · Shadow 최소.
 */

export interface Palette {
  /** 화면 바탕 */
  background: string;
  /** 카드·시트 */
  surface: string;
  /** 한 단계 눌린 면(입력창·비활성 칩) */
  surfaceMuted: string;
  border: string;

  text: string;
  textMuted: string;
  /** 강조 버튼 **위에** 올라가는 글자색. 팔레트마다 밝기가 뒤집힐 수 있다 */
  textOnAccent: string;

  /** 주 강조 — 조각 쓰기 버튼·FAB·선택 상태 */
  accent: string;
  /** 보조 강조 — 아이콘·포인트 도형 */
  accentMuted: string;
  /** 강조 배경 — 선택된 칩·오늘 날짜. 이 위의 글자는 `accent`를 쓴다 */
  accentSoft: string;

  /** 종이 조각 표현 전용. 넓은 면에 쓰지 않는다 */
  paper: string;

  danger: string;
}

/** 디자인 시안(2026-08-07 수령)의 팔레트가 정본이다 */
const light: Palette = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF1F6',
  border: '#E2E8F0',

  text: '#1F2A44',
  textMuted: '#7A8699',
  textOnAccent: '#FFFFFF',

  accent: '#2C4A7C',
  accentMuted: '#7B9BC4',
  accentSoft: '#DCE6F2',

  paper: '#EFE7DA',

  danger: '#C0564B',
};

/**
 * 다크 (2026-08-08).
 *
 * 시안에 다크가 없어 라이트에서 유도했다. 남색 정체성은 유지하되 **강조색의 명암을 뒤집었다** —
 * 어두운 바탕에서 진한 남색은 버튼으로도 글자로도 읽히지 않는다.
 * 그래서 `accent`를 밝게 올리고 `textOnAccent`를 어둡게 내렸다.
 */
const dark: Palette = {
  background: '#12161F',
  surface: '#1A2030',
  surfaceMuted: '#232B3D',
  border: '#2E3852',

  text: '#E8ECF4',
  textMuted: '#8E9AB3',
  textOnAccent: '#0F1420',

  accent: '#8AB0E8',
  accentMuted: '#5E7BA6',
  accentSoft: '#1E2A3E',

  paper: '#3A3222',

  danger: '#E88A7D',
};

export const PALETTES = { light, dark } as const;

export type PaletteId = keyof typeof PALETTES;

/**
 * 사용자가 고르는 값. `system`은 기기 설정을 따른다.
 * ⏭ 스킨이 생기면 여기에 스킨 id가 더해진다.
 */
export type ThemeMode = 'system' | PaletteId;

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}
