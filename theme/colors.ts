// 조각 컬러 토큰 — 차분한 크림 + 하늘 + 베이지(디자인 원칙: Glass 금지·과한 Gradient 금지·Shadow 최소).
// 다크모드 팔레트는 Settings 다크모드 구현 시 colorsDark로 추가한다(현재 라이트만).

export const colors = {
  background: '#FAF7F2', // 크림
  surface: '#FFFFFF',
  surfaceMuted: '#F2EDE5', // 베이지
  border: '#E7E0D6',

  text: '#2E2A25',
  textMuted: '#8A8378',

  accent: '#8FB8D9', // 하늘
  accentSoft: '#DCEAF5',
} as const;

export type ColorToken = keyof typeof colors;
