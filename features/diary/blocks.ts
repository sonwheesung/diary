import type { DiaryBlock } from './types';

/**
 * 본문 블록 직렬화와 평문 추출 (DIARY_SYSTEM §1.1).
 *
 * 정본은 블록 배열이고, 평문(`plainText`)은 **항상 여기서 재생성**되는 파생 데이터다.
 * 둘을 따로 편집하면 검색이 조용히 틀린다.
 */

export function serializeBlocks(blocks: DiaryBlock[]): string {
  return JSON.stringify(blocks);
}

/** 텍스트 블록만 이어붙인 검색용 평문. */
export function extractPlainText(blocks: DiaryBlock[]): string {
  return blocks
    .filter((block): block is Extract<DiaryBlock, { type: 'text' }> => block.type === 'text')
    .map((block) => block.value.trim())
    .filter((value) => value.length > 0)
    .join('\n');
}

function isDiaryBlock(value: unknown): value is DiaryBlock {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.type === 'text') {
    return typeof candidate.value === 'string';
  }
  if (candidate.type === 'list') {
    return (
      Array.isArray(candidate.items) && candidate.items.every((item) => typeof item === 'string')
    );
  }
  if (candidate.type === 'image') {
    return typeof candidate.imageId === 'string';
  }
  return false;
}

/**
 * DB에서 읽은 블록 JSON을 되살린다.
 *
 * `content_blocks`가 없으면(v1 시절 조각) 평문을 텍스트 블록 하나로 간주한다 — Expand-only
 * 마이그레이션이라 옛 데이터에는 이 컬럼이 비어 있다.
 * 깨진 JSON이면 평문으로 폴백한다. **본문을 못 읽게 만드는 것이 최악**이므로 절대 throw하지 않는다.
 */
export function parseBlocks(contentBlocks: string | null, plainText: string): DiaryBlock[] {
  if (contentBlocks === null || contentBlocks.length === 0) {
    return plainText.length > 0 ? [{ type: 'text', value: plainText }] : [];
  }

  try {
    const parsed: unknown = JSON.parse(contentBlocks);
    if (!Array.isArray(parsed)) {
      throw new Error('블록 배열이 아님');
    }
    const blocks = parsed.filter(isDiaryBlock);
    // 전부 걸러졌는데 원본은 비어있지 않았다면 형식이 바뀐 것 — 평문으로라도 보여준다.
    if (blocks.length === 0 && parsed.length > 0) {
      return plainText.length > 0 ? [{ type: 'text', value: plainText }] : [];
    }
    return blocks;
  } catch {
    return plainText.length > 0 ? [{ type: 'text', value: plainText }] : [];
  }
}

/** 저장할 내용이 있는지. 글이 없어도 이미지가 있으면 성립한다(DIARY_SYSTEM §1). */
export function hasContent(blocks: DiaryBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === 'image') {
      return true;
    }
    if (block.type === 'list') {
      return block.items.some((item) => item.trim().length > 0);
    }
    return block.value.trim().length > 0;
  });
}

/** 빈 텍스트 블록을 제거하고 연속된 텍스트 블록을 합친다. 저장 직전에 한 번 돌린다. */
export function normalizeBlocks(blocks: DiaryBlock[]): DiaryBlock[] {
  const result: DiaryBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'image') {
      result.push(block);
      continue;
    }

    if (block.type === 'list') {
      // 빈 항목은 버린다. 전부 비었으면 목록 자체를 버린다 — 눌러만 보고 안 쓴 경우다.
      const items = block.items.map((item) => item.trim()).filter((item) => item.length > 0);
      if (items.length > 0) {
        result.push({ type: 'list', items });
      }
      continue;
    }

    const value = block.value.trim();
    if (value.length === 0) {
      continue;
    }

    const previous = result[result.length - 1];
    if (previous !== undefined && previous.type === 'text') {
      result[result.length - 1] = { type: 'text', value: `${previous.value}\n${value}` };
    } else {
      result.push({ type: 'text', value });
    }
  }

  return result;
}

/** 본문에 실제로 쓰인 이미지 id들. 삭제된 이미지 파일 정리에 쓴다. */
export function usedImageIds(blocks: DiaryBlock[]): string[] {
  return blocks
    .filter((block): block is Extract<DiaryBlock, { type: 'image' }> => block.type === 'image')
    .map((block) => block.imageId);
}
