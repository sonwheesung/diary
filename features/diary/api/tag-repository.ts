import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/db/client';

/**
 * 태그 (DIARY_SYSTEM §1.3).
 * 이름은 대소문자를 구분하지 않고 유일하다 — DB의 COLLATE NOCASE 유일 인덱스가 강제한다.
 */

/** 앞뒤 공백과 앞의 '#'을 제거한다. 빈 값이면 null. */
export function normalizeTagName(raw: string): string | null {
  const trimmed = raw.trim().replace(/^#+/, '').trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** 입력 배열을 정리한다 — 공백 제거, 빈 값 제거, 대소문자 무시 중복 제거(입력 순서 유지). */
export function normalizeTagNames(rawTags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawTags) {
    const name = normalizeTagName(raw);
    if (name === null) {
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(name);
  }

  return result;
}

/** 이름으로 태그를 찾거나 만든다. 같은 트랜잭션 안에서 쓰도록 db를 받는다. */
async function upsertTag(db: SQLiteDatabase, name: string): Promise<string> {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM tags WHERE name = ? COLLATE NOCASE',
    name,
  );
  if (existing) {
    return existing.id;
  }

  const id = Crypto.randomUUID();
  await db.runAsync(
    'INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)',
    id,
    name,
    Date.now(),
  );
  return id;
}

/** 조각의 태그 연결을 통째로 교체한다. 호출부가 트랜잭션을 연 상태에서 부른다. */
export async function replaceDiaryTags(
  db: SQLiteDatabase,
  diaryId: string,
  tagNames: string[],
): Promise<void> {
  await db.runAsync('DELETE FROM diary_tags WHERE diary_id = ?', diaryId);

  for (const name of normalizeTagNames(tagNames)) {
    const tagId = await upsertTag(db, name);
    await db.runAsync(
      'INSERT OR IGNORE INTO diary_tags (diary_id, tag_id) VALUES (?, ?)',
      diaryId,
      tagId,
    );
  }
  // 아무도 안 쓰게 된 태그는 지우지 않는다 — 자동완성 후보로 여전히 쓸모가 있다(DIARY_SYSTEM §1.3).
}

export async function getTagsForDiary(diaryId: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT t.name FROM diary_tags dt
     JOIN tags t ON t.id = dt.tag_id
     WHERE dt.diary_id = ?
     ORDER BY t.created_at ASC`,
    diaryId,
  );
  return rows.map((row) => row.name);
}

/** 여러 조각의 태그를 한 번에. 목록 화면에서 N+1 쿼리를 피한다. */
export async function getTagsForDiaries(diaryIds: string[]): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (diaryIds.length === 0) {
    return result;
  }

  const db = await getDatabase();
  const placeholders = diaryIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ diary_id: string; name: string }>(
    `SELECT dt.diary_id, t.name FROM diary_tags dt
     JOIN tags t ON t.id = dt.tag_id
     WHERE dt.diary_id IN (${placeholders})
     ORDER BY t.created_at ASC`,
    ...diaryIds,
  );

  for (const row of rows) {
    const names = result.get(row.diary_id);
    if (names) {
      names.push(row.name);
    } else {
      result.set(row.diary_id, [row.name]);
    }
  }
  return result;
}

/** 자동완성·태그 목록용. 많이 쓴 순. 삭제된 조각은 세지 않는다. */
export async function listTagsByUsage(limit = 30): Promise<{ name: string; count: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync<{ name: string; count: number }>(
    `SELECT t.name AS name, COUNT(dt.diary_id) AS count
     FROM tags t
     JOIN diary_tags dt ON dt.tag_id = t.id
     JOIN diaries d ON d.id = dt.diary_id AND d.deleted_at IS NULL
     GROUP BY t.id
     ORDER BY count DESC, t.name ASC
     LIMIT ?`,
    limit,
  );
}
