import type { TextStyle } from 'react-native';

// RN은 커스텀 폰트의 굵기를 합성해주지 않는다 — fontWeight가 아니라 굵기별 fontFamily를 직접 지정해야 한다.
// 그래서 스타일 토큰이 fontFamily를 들고 있고, 화면에서는 fontWeight를 쓰지 않는다.
export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
} as const;

// useFonts에 넘길 맵. 키가 곧 위 fontFamily 문자열이다.
export const fontAssets = {
  'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
} as const;

// 한글은 라틴보다 세로 밀도가 높아 lineHeight를 넉넉히 준다(감성·가독 — 디자인 원칙 "여백을 많이").
// letterSpacing 음수는 Pretendard의 큰 글자에서 과한 벌어짐을 잡기 위한 것.
export const typography = {
  display: {
    fontFamily: fonts.semibold,
    fontSize: 34,
    lineHeight: 44,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  // 일기 본문 — 읽는 시간이 가장 긴 스타일이라 행간을 가장 크게 잡는다.
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
