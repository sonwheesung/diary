import { INK_COLORS } from './types.ts';
import type { DiaryBlock, TextAlign, TextFormat, TextSize } from './types.ts';

/**
 * 텍스트 서식 — **저장 형태의 규칙**만 갖는 순수 계층 (DIARY_SYSTEM §1.1).
 *
 * 화면 스타일로 푸는 것은 `text-style.ts`다. 여기에 `@/theme`나 `react-native`를 value로
 * 들이면 `npm run check:diary-format`이 Node에서 못 돈다 — 그래서 나눠 뒀다.
 *
 * 🔴 **기본값은 저장하지 않는다.** `align: 'left'`처럼 기본값을 써두면 서식을 한 번도
 *   건드리지 않은 조각과 "건드렸다가 되돌린" 조각의 JSON이 달라진다 — 백업 diff가 튀고,
 *   `normalizeBlocks`의 병합 판정도 두 가지 표현을 알아야 한다.
 *   그래서 **들어오는 순간 기본값을 지운다**(`cleanFormat`).
 */

export const TEXT_ALIGNS = ['left', 'center', 'right'] as const;

/** 화면에 늘어놓는 순서. `body`가 기본이라 맨 앞에 둔다 */
export const TEXT_SIZES = ['body', 'h4', 'h3', 'h2', 'h1'] as const;

export const DEFAULT_ALIGN: TextAlign = 'left';
export const DEFAULT_SIZE: TextSize = 'body';

/**
 * 크기별 실제 값.
 *
 * `theme/typography.ts`의 토큰을 그대로 쓰지 않는 이유: 저 토큰들은 **UI 부품**(제목·라벨)의
 * 것이라 본문 문단 위계와 목적이 다르다. 여기서 UI 토큰을 재사용하면 나중에 버튼 글자를
 * 키우는 순간 **옛 일기의 문단 크기가 같이 바뀐다** — 글쓴이가 고른 것이 우리 손에 흔들리면 안 된다.
 *
 * 행간은 크기의 약 1.4배다. 한글은 라틴보다 세로 밀도가 높아 넉넉히 준다(typography.ts와 같은 이유).
 */
export const SIZE_METRICS: Record<TextSize, { fontSize: number; lineHeight: number }> = {
  h1: { fontSize: 28, lineHeight: 38 },
  h2: { fontSize: 24, lineHeight: 34 },
  h3: { fontSize: 20, lineHeight: 30 },
  h4: { fontSize: 18, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 28 },
};

/** 텍스트 블록만 서식을 갖는다. 나머지는 빈 서식으로 본다 */
export function readFormat(block: DiaryBlock): TextFormat {
  if (block.type !== 'text') {
    return {};
  }
  return { align: block.align, size: block.size, bold: block.bold, color: block.color };
}

/**
 * 기본값인 항목을 지우고 **모르는 값은 버린다**. 결과가 `{}`면 서식이 없는 것이다.
 *
 * ⚠ 검증을 여기서 하는 이유: 이걸 `isDiaryBlock`에서 하면 서식 필드 하나가 이상할 때
 *   **블록째 걸러져 본문이 사라진다.** 서식은 잃어도 되지만 글은 잃으면 안 된다.
 *   그래서 블록은 통과시키고 서식만 씻는다.
 */
export function cleanFormat(format: TextFormat): TextFormat {
  const result: TextFormat = {};
  if (format.align !== undefined && format.align !== DEFAULT_ALIGN && has(TEXT_ALIGNS, format.align)) {
    result.align = format.align;
  }
  if (format.size !== undefined && format.size !== DEFAULT_SIZE && has(TEXT_SIZES, format.size)) {
    result.size = format.size;
  }
  if (format.bold === true) {
    result.bold = true;
  }
  if (format.color !== undefined && format.color !== 'default' && has(INK_COLORS, format.color)) {
    result.color = format.color;
  }
  return result;
}

function has<T extends string>(allowed: readonly T[], value: string): value is T {
  return (allowed as readonly string[]).includes(value);
}

export function isDefaultFormat(format: TextFormat): boolean {
  return Object.keys(cleanFormat(format)).length === 0;
}

/**
 * 두 문단의 서식이 같은가. `normalizeBlocks`가 **합쳐도 되는지** 판단하는 데 쓴다.
 *
 * ⚠ 기본값을 지운 뒤에 비교한다. `{}`와 `{ align: 'left' }`는 같은 뜻인데
 *   그대로 비교하면 다르다고 나와 **합쳐야 할 문단이 영영 갈라진 채 남는다.**
 */
export function sameFormat(a: TextFormat, b: TextFormat): boolean {
  const x = cleanFormat(a);
  const y = cleanFormat(b);
  return x.align === y.align && x.size === y.size && x.bold === y.bold && x.color === y.color;
}

/** 서식을 블록에 입힌다. 기본값은 필드째 사라진다 */
export function withFormat(
  block: Extract<DiaryBlock, { type: 'text' }>,
  format: TextFormat,
): Extract<DiaryBlock, { type: 'text' }> {
  return { type: 'text', value: block.value, ...cleanFormat(format) };
}

export interface SplitResult {
  blocks: DiaryBlock[];
  /** 서식을 걸 대상 블록의 새 인덱스 */
  index: number;
  /** 그 블록 안에서의 커서 위치. 나누기 전 좌표를 그대로 쓰면 엉뚱한 자리를 가리킨다 */
  caret: number;
}

/**
 * 커서가 놓인 **문단만** 떼어내 자기 블록으로 만든다.
 *
 * 🔴 이건 취향이 아니라 **강제다.** 텍스트 블록 하나가 `TextInput` 하나이고, RN의
 *   `TextInput`은 한 입력창 안에서 문단마다 다른 크기를 그리지 못한다. 그래서
 *   "세 번째 문단만 H1"을 편집 중에 보여줄 방법이 블록 분할 말고는 없다.
 *
 * ```
 * 적용 전  [text "가 ⏎ 나 ⏎ 다"]                 커서가 두 번째 문단에 있음
 * 적용 후  [text "가"] [text "나"] [text "다"]   ← 가운데에만 서식을 건다
 * ```
 *
 * ⚠ 항상 문단마다 블록을 만들지는 **않는다.** 그러면 백스페이스 병합·커서 점프를 전부
 *   다시 짜야 하고, 거기가 RN 편집기에서 가장 잘 깨지는 자리다. 분할은 **서식을 거는
 *   순간에만** 일어나고, 서식을 되돌리면 `normalizeBlocks`가 저장할 때 다시 합친다.
 */
export function splitParagraph(
  blocks: DiaryBlock[],
  blockIndex: number,
  caret: number,
): SplitResult {
  const target = blocks[blockIndex];
  if (target === undefined || target.type !== 'text') {
    return { blocks, index: blockIndex, caret };
  }

  const paragraphs = target.value.split('\n');
  if (paragraphs.length <= 1) {
    return { blocks, index: blockIndex, caret };
  }

  // 커서가 몇 번째 문단에 있나. 문단 끝(= 개행 바로 앞)은 그 문단으로 친다.
  let hitStart = 0;
  let hit = paragraphs.length - 1;
  {
    let consumed = 0;
    for (let i = 0; i < paragraphs.length; i += 1) {
      const end = consumed + (paragraphs[i] ?? '').length;
      if (caret <= end) {
        hit = i;
        hitStart = consumed;
        break;
      }
      consumed = end + 1; // 개행 한 칸
      hitStart = consumed;
    }
  }

  const format = readFormat(target);
  const before = paragraphs.slice(0, hit).join('\n');
  const after = paragraphs.slice(hit + 1).join('\n');

  const pieces: DiaryBlock[] = [];
  if (before.length > 0) {
    pieces.push({ type: 'text', value: before, ...cleanFormat(format) });
  }
  const index = blockIndex + pieces.length;
  pieces.push({ type: 'text', value: paragraphs[hit] ?? '', ...cleanFormat(format) });
  if (after.length > 0) {
    pieces.push({ type: 'text', value: after, ...cleanFormat(format) });
  }

  const next = [...blocks];
  next.splice(blockIndex, 1, ...pieces);
  /*
   * 커서를 **떼어낸 문단 안의 같은 자리**로 옮긴다. 블록이 갈라지면 좌표계가 바뀌는데
   * 이걸 안 옮기면 서식을 거는 순간 커서가 엉뚱한 데로 튀고, 바로 이어서 사진을 넣으면
   * 그 사진이 다른 문단에 들어간다(`removeBlock`이 같은 이유로 커서를 옮긴다).
   */
  const local = Math.max(0, Math.min(caret - hitStart, (paragraphs[hit] ?? '').length));
  return { blocks: next, index, caret: local };
}

/**
 * 블록 하나를 걷어내고 **앞뒤 텍스트를 다시 한 문단으로 붙인다** — `splitParagraph`의 짝.
 *
 * 🔴 왜 필요한가(DIARY_SYSTEM §1.1, 2026-08-27 실기기 신고):
 *   목록이나 사진을 사이에 끼우면 뒤에 **빈 텍스트 블록**이 생긴다(이어 쓸 자리라 의도된 것이다).
 *   그런데 그 목록·사진을 도로 지우면 빈 블록만 남고, **화면에서 지울 손동작이 없다** —
 *   빈 칸에서는 백스페이스를 눌러도 `onChangeText`가 안 불리기 때문이다.
 *   `normalizeBlocks`가 저장할 때 버리긴 하지만, 그때까지 **화면과 저장 결과가 갈린다.**
 *   → 걷어내는 쪽이 그 자리에서 뒷정리를 한다.
 *
 * 붙이는 규칙은 `normalizeBlocks`와 **같다**: 서식이 다르면 붙이지 않는다(붙이면 한쪽 서식이 죽는다).
 * ⚠ 다만 한쪽이 비어 있으면 `\n`으로 잇지 않고 **채워진 쪽만 남긴다** —
 *   `"본문" + "" `을 `"본문\n"`으로 만들면 지우려던 그 빈 줄이 문단 안으로 옮겨갈 뿐이다.
 *
 * 커서는 **붙인 자리**에 둔다. 안 옮기면 다음 사진이 엉뚱한 문단에 들어간다(§1.1 커서 잠금).
 */
export function removeBlockAt(blocks: DiaryBlock[], removeIndex: number): SplitResult {
  if (removeIndex < 0 || removeIndex >= blocks.length) {
    return { blocks, index: Math.max(0, removeIndex - 1), caret: 0 };
  }

  const next = blocks.filter((_, i) => i !== removeIndex);

  /*
   * 전부 사라지면 빈 텍스트 블록 하나를 남긴다. 블록이 0개면 그릴 `TextInput`이 없어
   * **글을 쓸 자리 자체가 없어진다** — 사진 하나만 있던 조각에서 그 사진을 지우면 바로 이 상태다.
   */
  if (next.length === 0) {
    return { blocks: [{ type: 'text', value: '' }], index: 0, caret: 0 };
  }

  const left = next[removeIndex - 1];
  const right = next[removeIndex];
  if (
    left === undefined ||
    right === undefined ||
    left.type !== 'text' ||
    right.type !== 'text' ||
    !sameFormat(readFormat(left), readFormat(right))
  ) {
    // 못 붙이는 경우엔 앞 블록 끝에 커서를 둔다 — 기존 `removeBlock`이 하던 그대로다.
    const fallback = Math.max(0, removeIndex - 1);
    const at = next[fallback];
    return {
      blocks: next,
      index: fallback,
      caret: at !== undefined && at.type === 'text' ? at.value.length : 0,
    };
  }

  const format = cleanFormat(readFormat(left));
  const joined =
    left.value.length === 0 || right.value.length === 0
      ? `${left.value}${right.value}`
      : `${left.value}\n${right.value}`;

  next.splice(removeIndex - 1, 2, { type: 'text', value: joined, ...format });
  return { blocks: next, index: removeIndex - 1, caret: left.value.length };
}
