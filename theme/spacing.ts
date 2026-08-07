// 여백 스케일 4px 배수. 디자인 원칙상 여백을 넉넉히 쓰므로 lg 이상을 기본으로 삼는다.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// 부드러운 Radius.
export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;
