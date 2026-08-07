/**
 * 조각 컬러 토큰.
 *
 * 디자인 시안(2026-08-07 수령)의 팔레트를 정본으로 삼는다 — 옅은 블루그레이 바탕에
 * 진한 네이비 강조, 종이 조각 표현에만 크림/베이지.
 * 원칙: Glass 금지 · 과한 Gradient 금지 · Shadow 최소.
 *
 * 다크모드 팔레트(colorsDark)는 Settings 다크모드 구현 시 추가한다. 시안에 다크가 없어
 * 지금 지어내면 나중에 두 번 고치게 된다.
 */
export const colors = {
  /** 화면 바탕 — 흰색이 아니라 아주 옅은 블루그레이 */
  background: '#F5F7FA',
  /** 카드·시트 */
  surface: '#FFFFFF',
  /** 한 단계 눌린 면(입력창·비활성 칩) */
  surfaceMuted: '#EDF1F6',
  border: '#E2E8F0',

  text: '#1F2A44',
  textMuted: '#7A8699',
  /** 흰 글자 — 강조 버튼 위 */
  textOnAccent: '#FFFFFF',

  /** 주 강조 — 일기 쓰기 버튼·FAB·선택 상태 */
  accent: '#2C4A7C',
  /** 보조 강조 — 아이콘·포인트 도형 */
  accentMuted: '#7B9BC4',
  /** 강조 배경 — 선택된 칩·오늘 날짜 */
  accentSoft: '#DCE6F2',

  /** 종이 조각 표현 전용. 넓은 면에 쓰지 않는다 */
  paper: '#EFE7DA',

  danger: '#C0564B',
} as const;

export type ColorToken = keyof typeof colors;
