import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import { isEmotionCode } from '@/features/diary/emotions';
import type { Diary, DiaryDraft, DiaryPatch, DiaryRow } from '@/features/diary/types';
import { addDays, today } from '@/lib/date';

// 살아있는 조각만 본다 — 소프트 삭제(DIARY_SYSTEM §7). 모든 조회에 붙는다.
const ALIVE = 'deleted_at IS NULL';

function toDiary(row: DiaryRow): Diary {
  return {
    id: row.id,
    entryDate: row.entry_date,
    title: row.title,
    content: row.content,
    // 모르는 감정 코드(앱 다운그레이드 등)는 없음으로 낮춘다 — 조각 자체는 살린다.
    emotion: isEmotionCode(row.emotion) ? row.emotion : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 내용이 실제로 있는지. 공백만 있는 것은 빈 것으로 본다(DIARY_SYSTEM §1). */
function normalizeContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Error('내용이 비어 있는 조각은 저장할 수 없습니다.');
  }
  return trimmed;
}

function normalizeTitle(title: string | null | undefined): string | null {
  if (title === null || title === undefined) {
    return null;
  }
  const trimmed = title.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createDiary(draft: DiaryDraft): Promise<Diary> {
  const db = await getDatabase();
  const now = Date.now();
  const diary: Diary = {
    id: Crypto.randomUUID(),
    entryDate: draft.entryDate ?? today(),
    title: normalizeTitle(draft.title),
    content: normalizeContent(draft.content),
    emotion: draft.emotion ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO diaries (id, entry_date, title, content, emotion, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    diary.id,
    diary.entryDate,
    diary.title,
    diary.content,
    diary.emotion,
    diary.createdAt,
    diary.updatedAt,
  );

  return diary;
}

/**
 * 넘긴 필드만 바꾼다. updated_at은 항상 갱신한다 —
 * 백업 동기화가 이 값으로 최신본을 판단하므로 빠뜨리면 안 된다(DIARY_SYSTEM §8).
 */
export async function updateDiary(id: string, patch: DiaryPatch): Promise<Diary | null> {
  const db = await getDatabase();
  const columns: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.content !== undefined) {
    columns.push('content = ?');
    values.push(normalizeContent(patch.content));
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

  // 바꿀 게 없으면 updated_at만 흔들지 않고 그대로 돌려준다.
  if (columns.length === 0) {
    return getDiaryById(id);
  }

  columns.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await db.runAsync(
    `UPDATE diaries SET ${columns.join(', ')} WHERE id = ? AND ${ALIVE}`,
    ...values,
  );

  return getDiaryById(id);
}

/** 소프트 삭제. 사용자에게는 즉시 사라진 것으로 보인다. */
export async function deleteDiary(id: string): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `UPDATE diaries SET deleted_at = ?, updated_at = ? WHERE id = ? AND ${ALIVE}`,
    now,
    now,
    id,
  );
}

export async function getDiaryById(id: string): Promise<Diary | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE id = ? AND ${ALIVE}`,
    id,
  );
  return row ? toDiary(row) : null;
}

/** 홈·목록용. 최신 날짜 우선, 같은 날이면 나중에 쓴 것 우선. */
export async function listRecentDiaries(limit = 20, offset = 0): Promise<Diary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE ${ALIVE}
     ORDER BY entry_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    limit,
    offset,
  );
  return rows.map(toDiary);
}

/** 특정 날짜의 조각들. 하루 여러 개가 가능하다(DIARY_SYSTEM §2). */
export async function listDiariesByDate(entryDate: string): Promise<Diary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries WHERE entry_date = ? AND ${ALIVE} ORDER BY created_at ASC`,
    entryDate,
  );
  return rows.map(toDiary);
}

/**
 * 제목·내용 부분 문자열 검색. FTS5를 쓰지 않는 이유는 DIARY_SYSTEM §6.
 * LIKE 와일드카드(% _)와 이스케이프 문자를 그대로 두면 사용자가 친 '%'가 전체 일치가 된다.
 */
export async function searchDiaries(keyword: string, limit = 50): Promise<Diary[]> {
  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const escaped = trimmed.replace(/([\\%_])/g, '\\$1');
  const pattern = `%${escaped}%`;

  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryRow>(
    `SELECT * FROM diaries
     WHERE ${ALIVE} AND (content LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\')
     ORDER BY entry_date DESC, created_at DESC
     LIMIT ?`,
    pattern,
    pattern,
    limit,
  );
  return rows.map(toDiary);
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
