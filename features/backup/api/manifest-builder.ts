import { getDatabase } from '@/db/client';
import { LATEST_DB_VERSION } from '@/db/migrations';
import type {
  DiaryRow,
  DiaryTagRow,
  ImageRow,
  Manifest,
  ReportRow,
  TagRow,
} from '@/features/backup/manifest';

/**
 * 로컬 DB → 매니페스트.
 *
 * ⚠ **저장소 계층(`diary-repository`)을 거치지 않는다.** 그쪽은 뷰를 만든다 —
 *   `deleted_at IS NULL`로 묘비를 걸러내고, 블록을 파싱하고, 태그를 조인한다.
 *   백업이 그걸 쓰면 지운 조각·모르는 블록 타입·태그 순서가 조용히 사라진다.
 *   여기서는 `SELECT *`에 가까운 **원본 행**을 읽는다.
 *
 * ⚠ 그래서 이 파일은 스키마 변경에 **직접 노출된다.** 컬럼을 추가하면 여기도 고쳐야 하고,
 *   안 고치면 그 컬럼이 백업에서 빠진다(타입은 이걸 안 잡아준다 — 조용한 유실이다).
 *   `db/migrations.ts`를 건드리는 사람이 이 파일을 같이 보게 주석으로 묶어둔다.
 */

/**
 * 백업에 실을 전부를 읽는다.
 *
 * **묘비를 포함한다.** 전체 교체 복원에서도 필요하다 — 안 실으면 나중에 병합을 다시
 * 넣을 때 구조가 깨지고, 옛 세대를 복원했을 때 지운 조각이 되살아난다.
 * 대신 묘비의 본문은 비운다(`content`·`content_blocks`) — 지운 글을 서버에 남길 이유가 없다.
 *
 * ⚠ `content`·`created_at`·`updated_at`은 **NOT NULL이라 묘비에도 값이 있어야 한다.**
 *   "id·날짜·deleted_at만 싣는다"로 만들면 복원의 INSERT가 통째로 실패한다.
 */
export async function buildManifest(): Promise<Manifest> {
  const db = await getDatabase();

  const diaries = await db.getAllAsync<DiaryRow>(
    `SELECT id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at
       FROM diaries
      ORDER BY created_at ASC`,
  );

  const images = await db.getAllAsync<ImageRow>(
    `SELECT id, diary_id, file_name, width, height, created_at, deleted_at
       FROM diary_images
      ORDER BY created_at ASC`,
  );

  // ⚠ created_at이 태그 표시 순서의 유일한 출처다(`ORDER BY t.created_at ASC`).
  const tags = await db.getAllAsync<TagRow>(
    `SELECT id, name, created_at FROM tags ORDER BY created_at ASC`,
  );

  const diaryTags = await db.getAllAsync<DiaryTagRow>(`SELECT diary_id, tag_id FROM diary_tags`);

  /*
   * AI 리포트도 싣는다. 본문이 로컬에만 있어서 기기를 잃으면 그대로 사라지고,
   * 같은 일기로 다시 만들어도 결과가 달라 복구가 아니다.
   *
   * ⚠ 요약에는 일기 내용이 녹아 있으므로 당연히 암호화되어 나간다. 서버는 못 읽는다.
   */
  const reports = await db.getAllAsync<ReportRow>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver,
            metrics, created_at, deleted_at
       FROM ai_reports
      ORDER BY created_at ASC`,
  );

  return {
    dbVersion: LATEST_DB_VERSION,
    diaries: diaries.map(emptyBodyIfDeleted),
    images,
    tags,
    diaryTags,
    reports,
  };
}

/** 지운 조각의 본문은 서버로 보내지 않는다. 되살릴 대상이 아니라 "지웠다"는 사실만 필요하다 */
function emptyBodyIfDeleted(row: DiaryRow): DiaryRow {
  if (row.deleted_at === null) {
    return row;
  }
  return { ...row, title: null, content: '', content_blocks: null };
}

/** 복원 확인 화면용 — 이 기기에 살아 있는 조각 id */
export async function localAliveDiaryIds(): Promise<Set<string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM diaries WHERE deleted_at IS NULL',
  );
  return new Set(rows.map((row) => row.id));
}

/** 확인 화면에 날짜 목록을 보여주기 위해. 사라질 조각이 무엇인지 숫자만으로는 와닿지 않는다 */
export async function diaryDatesFor(ids: readonly string[]): Promise<string[]> {
  if (ids.length === 0) {
    return [];
  }
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const rows = await db.getAllAsync<{ entry_date: string }>(
    `SELECT entry_date FROM diaries WHERE id IN (${placeholders}) ORDER BY entry_date DESC`,
    ...ids,
  );
  return rows.map((row) => row.entry_date);
}
