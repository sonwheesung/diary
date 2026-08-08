import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import { softDeleteImagesForDiary } from '@/features/diary/api/image-store';
import {
  getTagsForDiaries,
  getTagsForDiary,
  normalizeTagNames,
  replaceDiaryTags,
} from '@/features/diary/api/tag-repository';
import {
  extractPlainText,
  hasContent,
  normalizeBlocks,
  parseBlocks,
  serializeBlocks,
} from '@/features/diary/blocks';
import { isEmotionCode } from '@/features/diary/emotions';
import type { Diary, DiaryDraft, DiaryPatch, DiaryRow } from '@/features/diary/types';
import { addDays, today } from '@/lib/date';

// 살아있는 조각만 본다 — 소프트 삭제(DIARY_SYSTEM §7). 모든 조회에 붙는다.
const ALIVE = 'deleted_at IS NULL';

function toDiary(row: DiaryRow, tags: string[]): Diary {
  return {
    id: row.id,
    entryDate: row.entry_date,
    title: row.title,
    blocks: parseBlocks(row.content_blocks, row.content),
    plainText: row.content,
    // 모르는 감정 코드(앱 다운그레이드 등)는 없음으로 낮춘다 — 조각 자체는 살린다.
    emotion: isEmotionCode(row.emotion) ? row.emotion : null,
    tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 목록용 — 태그를 한 번의 쿼리로 붙인다(N+1 방지). */
async function toDiaries(rows: DiaryRow[]): Promise<Diary[]> {
  if (rows.length === 0) {
    return [];
  }
  const tagMap = await getTagsForDiaries(rows.map((row) => row.id));
  return rows.map((row) => toDiary(row, tagMap.get(row.id) ?? []));
}

/**
 * 하루에 조각은 하나다 (DIARY_SYSTEM §2, 2026-08-08 사용자 결정).
 *
 * DB UNIQUE 제약이 아니라 여기서 막는다. 제약을 걸면 나중에 다른 기기의 백업을 복원할 때
 * 같은 날짜가 부딪혀 **복원 전체가 실패**한다 — 그때는 사람이 고를 문제이지 INSERT가 죽을 문제가 아니다.
 */
async function findDiaryIdOnDate(
  db: Awaited<ReturnType<typeof getDatabase>>,
  entryDate: string,
  exceptId?: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM diaries WHERE entry_date = ? AND ${ALIVE} AND id IS NOT ? LIMIT 1`,
    entryDate,
    exceptId ?? null,
  );
  return row?.id ?? null;
}

/** 그날 이미 쓴 조각의 id. 없으면 null — 작성 진입 전에 "이어쓰기"로 보낼지 판단할 때 쓴다. */
export async function getDiaryIdOnDate(entryDate: string): Promise<string | null> {
  const db = await getDatabase();
  return findDiaryIdOnDate(db, entryDate);
}

function normalizeTitle(title: string | null | undefined): string | null {
  if (title === null || title === undefined) {
    return null;
  }
  const trimmed = title.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createDiary(draft: DiaryDraft): Promise<Diary> {
  const blocks = normalizeBlocks(draft.blocks);
  if (!hasContent(blocks)) {
    throw new Error('내용이 비어 있는 조각은 저장할 수 없습니다.');
  }

  const db = await getDatabase();
  const now = Date.now();
  // 작성 화면이 이미지보다 먼저 id를 만들어 두는 경우가 있다(DiaryDraft.id 주석 참고).
  const id = draft.id ?? Crypto.randomUUID();
  const tags = normalizeTagNames(draft.tags ?? []);
  const entryDate = draft.entryDate ?? today();

  // 본문 정본(blocks)과 검색용 파생 평문(content)을 같은 트랜잭션에서 쓴다 —
  // 어긋나면 검색이 조용히 틀린다(DIARY_SYSTEM §1.1).
  await db.withTransactionAsync(async () => {
    // 트랜잭션 안에서 확인한다 — 밖에서 보면 확인과 INSERT 사이에 끼어들 틈이 생긴다.
    if ((await findDiaryIdOnDate(db, entryDate)) !== null) {
      throw new Error('그날의 조각이 이미 있어요. 하루에 하나만 쓸 수 있어요.');
    }
    await db.runAsync(
      `INSERT INTO diaries
         (id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      id,
      entryDate,
      normalizeTitle(draft.title),
      extractPlainText(blocks),
      serializeBlocks(blocks),
      draft.emotion ?? null,
      now,
      now,
    );
    await replaceDiaryTags(db, id, tags);
  });

  const created = await getDiaryById(id);
  if (created === null) {
    throw new Error('조각을 저장했지만 다시 읽지 못했습니다.');
  }
  return created;
}

/**
 * 넘긴 필드만 바꾼다. updated_at은 항상 갱신한다 —
 * 백업 동기화가 이 값으로 최신본을 판단하므로 빠뜨리면 안 된다(DIARY_SYSTEM §8).
 */
export async function updateDiary(id: string, patch: DiaryPatch): Promise<Diary | null> {
  const db = await getDatabase();
  const columns: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.blocks !== undefined) {
    const blocks = normalizeBlocks(patch.blocks);
    if (!hasContent(blocks)) {
      throw new Error('내용이 비어 있는 조각은 저장할 수 없습니다.');
    }
    columns.push('content = ?', 'content_blocks = ?');
    values.push(extractPlainText(blocks), serializeBlocks(blocks));
  }
  if (patch.title !== undefined) {
    columns.push('title = ?');
    values.push(normalizeTitle(patch.title));
  }
  if (patch.emotion !== undefined) {
    columns.push('emotion = ?');
    values.push(patch.emotion);
  }
  if (patch.entryDate !== undefined) {
    columns.push('entry_date = ?');
    values.push(patch.entryDate);
  }

  const touchesTags = patch.tags !== undefined;

  // 바꿀 게 없으면 updated_at을 흔들지 않고 그대로 돌려준다.
  if (columns.length === 0 && !touchesTags) {
    return getDiaryById(id);
  }

  columns.push('updated_at = ?');
  values.push(Date.now(), id);

  await db.withTransactionAsync(async () => {
    // 날짜를 옮기는 수정도 하루 하나 규칙을 지켜야 한다. 자기 자신은 제외한다.
    if (patch.entryDate !== undefined) {
      if ((await findDiaryIdOnDate(db, patch.entryDate, id)) !== null) {
        throw new Error('그날의 조각이 이미 있어요. 하루에 하나만 쓸 수 있어요.');
      }
    }
    await db.runAsync(
      `UPDATE diaries SET ${columns.join(', ')} WHERE id = ? AND ${ALIVE}`,
      ...values,
    );
    if (patch.tags !== undefined) {
      await replaceDiaryTags(db, id, patch.tags);
    }
  });

  return getDiaryById(id);
}

/** 소프트 삭제. 사용자에게는 즉시 사라진 것으로 보인다. 이미지도 함께 묻는다. */
export async function deleteDiary(id: string): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `UPDATE diaries SET deleted_at = ?, updated_at = ? WHERE id = ? AND ${ALIVE}`,
    now,
    now,
    id,
  );
  await softDeleteImagesForDiary(id);
}

export async function getDiaryById(id: string): Promise<Diary | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE id = ? AND ${ALIVE}`,
    id,
  );
  if (!row) {
    return null;
  }
  return toDiary(row, await getTagsForDiary(id));
}

/** 홈·타임라인용. 최신 날짜 우선, 같은 날이면 나중에 쓴 것 우선. */
export async function listRecentDiaries(limit = 20, offset = 0): Promise<Diary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE ${ALIVE}
     ORDER BY entry_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    limit,
    offset,
  );
  return toDiaries(rows);
}

/** 특정 날짜의 조각들. 하루 여러 개가 가능하다(DIARY_SYSTEM §2). */
export async function listDiariesByDate(entryDate: string): Promise<Diary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE entry_date = ? AND ${ALIVE} ORDER BY created_at ASC`,
    entryDate,
  );
  return toDiaries(rows);
}

/**
 * 제목·본문 평문·태그 부분 문자열 검색 (DIARY_SYSTEM §6).
 * 본문은 블록 JSON이 아니라 파생 평문 컬럼(content)을 본다 — JSON을 긁으면 "type" 같은
 * 구조 문자열이 걸린다.
 * LIKE 와일드카드(% _ \)를 이스케이프하지 않으면 사용자가 친 '%'가 전체 일치가 된다.
 */
export async function searchDiaries(keyword: string, limit = 50): Promise<Diary[]> {
  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const pattern = `%${trimmed.replace(/([\\%_])/g, '\\$1')}%`;

  const db = await getDatabase();
  // 태그 조인이 같은 조각을 여러 번 만들 수 있으므로 EXISTS로 거른다(DISTINCT보다 의도가 분명하다).
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries d
     WHERE d.${ALIVE}
       AND (
         d.content LIKE ? ESCAPE '\\'
         OR d.title LIKE ? ESCAPE '\\'
         OR EXISTS (
           SELECT 1 FROM diary_tags dt
           JOIN tags t ON t.id = dt.tag_id
           WHERE dt.diary_id = d.id AND t.name LIKE ? ESCAPE '\\'
         )
       )
     ORDER BY d.entry_date DESC, d.created_at DESC
     LIMIT ?`,
    pattern,
    pattern,
    pattern,
    limit,
  );
  return toDiaries(rows);
}

/** 특정 태그가 붙은 조각들. */
export async function listDiariesByTag(tagName: string, limit = 50): Promise<Diary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT d.* FROM diaries d
     JOIN diary_tags dt ON dt.diary_id = d.id
     JOIN tags t ON t.id = dt.tag_id
     WHERE d.${ALIVE} AND t.name = ? COLLATE NOCASE
     ORDER BY d.entry_date DESC, d.created_at DESC
     LIMIT ?`,
    tagName,
    limit,
  );
  return toDiaries(rows);
}

/** 캘린더용 — 해당 범위에서 조각이 있는 날짜들. 'YYYY-MM-DD'는 사전순 = 날짜순이라 범위 비교가 그대로 된다. */
export async function getWrittenDates(fromDate: string, toDate: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ entry_date: string }>(
    `SELECT DISTINCT entry_date FROM diaries
     WHERE ${ALIVE} AND entry_date >= ? AND entry_date <= ?
     ORDER BY entry_date ASC`,
    fromDate,
    toDate,
  );
  return rows.map((row) => row.entry_date);
}

/** 캘린더 점 색깔용 — 날짜별 대표 감정. 하루에 여러 개면 가장 먼저 쓴 조각의 감정을 쓴다. */
export async function getEmotionsByDate(
  fromDate: string,
  toDate: string,
): Promise<Map<string, string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ entry_date: string; emotion: string | null }>(
    `SELECT entry_date, emotion FROM diaries
     WHERE ${ALIVE} AND entry_date >= ? AND entry_date <= ?
     ORDER BY entry_date ASC, created_at ASC`,
    fromDate,
    toDate,
  );

  const result = new Map<string, string>();
  for (const row of rows) {
    if (row.emotion !== null && !result.has(row.entry_date)) {
      result.set(row.entry_date, row.emotion);
    }
  }
  return result;
}

/**
 * 연속 작성일 (DIARY_SYSTEM §5).
 * 오늘 아직 안 썼으면 어제까지의 연속 일수를 유지한다 — 아침에 "0일"을 보여주면
 * 이어온 기록이 사라진 것처럼 느껴지고, 오늘은 아직 끝나지 않았다.
 */
export async function getStreak(fromDate: string = today()): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ entry_date: string }>(
    `SELECT DISTINCT entry_date FROM diaries
     WHERE ${ALIVE} AND entry_date <= ?
     ORDER BY entry_date DESC`,
    fromDate,
  );

  if (rows.length === 0) {
    return 0;
  }

  const written = new Set(rows.map((row) => row.entry_date));
  const yesterday = addDays(fromDate, -1);

  // 시작점: 오늘 썼으면 오늘부터, 아니면 어제부터. 어제도 안 썼으면 끊긴 것.
  let cursor: string;
  if (written.has(fromDate)) {
    cursor = fromDate;
  } else if (written.has(yesterday)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (written.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
