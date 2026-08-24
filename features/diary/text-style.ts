import type { TextStyle } from 'react-native';

import type { Palette } from '@/theme/palettes';
import { fonts } from '@/theme/typography';

import { DEFAULT_ALIGN, DEFAULT_SIZE, SIZE_METRICS } from './format';
import type { TextFormat } from './types';

/**
 * 저장된 서식 → 화면 스타일 (DIARY_SYSTEM §1.1 텍스트 서식).
 *
 * **화면은 이 파일 말고 다른 경로로 서식을 해석하지 않는다.** 편집기와 상세 화면이 각자
 * 스타일을 조립하면 언젠가 갈라지고, 그러면 *"쓸 때랑 읽을 때 글자가 다르게 보인다"* 가 된다.
 *
 * ⚠ `format.ts`와 나눠 둔 이유는 취향이 아니다. `format.ts`는 `npm run check:diary-format`이
 *   Node에서 직접 돌리는 **순수 계층**이라 `@/theme`·`react-native`를 value로 import하면
 *   그 순간 검사가 못 돈다(`check:notification`이 순수 모듈만 부르는 것과 같은 규약).
 */
export function textStyleFor(format: TextFormat, colors: Palette): TextStyle {
  const size = format.size ?? DEFAULT_SIZE;
  const metrics = SIZE_METRICS[size];
  const heading = size !== DEFAULT_SIZE;

  return {
    fontSize: metrics.fontSize,
    lineHeight: metrics.lineHeight,
    /*
     * 제목 크기는 기본 굵기를 한 단계 올린다 — 28px을 Regular로 그리면 크기만 크고
     * 위계가 안 읽힌다. 굵기 토글은 거기서 한 단계 더 올리는 것이다.
     */
    fontFamily: format.bold === true ? fonts.semibold : heading ? fonts.medium : fonts.regular,
    letterSpacing: heading ? -0.4 : -0.2,
    textAlign: format.align ?? DEFAULT_ALIGN,
    color: inkColor(format.color, colors),
  };
}

/**
 * 색 코드 → 이 테마에서의 실제 색.
 *
 * ⚠ 모르는 코드는 **기본 본문색으로 떨군다.** 옛 백업이나 나중 버전이 만든 코드가 들어와도
 *   글자가 사라지면 안 된다 — 색을 잃는 것보다 글이 안 보이는 것이 훨씬 나쁘다.
 */
export function inkColor(color: string | undefined, colors: Palette): string {
  if (color === undefined) {
    return colors.ink.default;
  }
  const known: Record<string, string> = colors.ink;
  return known[color] ?? colors.ink.default;
}
