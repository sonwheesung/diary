import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * PRAGMA user_version 기반 수동 마이그레이션 (DATABASE.md §4).
 *
 * 규약:
 * 1. 적용된 마이그레이션은 절대 수정하지 않는다 — 이미 그 버전을 지난 기기엔 다시 실행되지 않는다.
 *    잘못됐으면 새 버전을 추가해서 고친다.
 * 2. Expand-only — 컬럼을 지우거나 이름을 바꾸지 않는다. 추가만 한다.
 * 3. 모든 DDL은 멱등하게(IF NOT EXISTS) — 중간에 실패한 기기가 재시도해도 깨지지 않게.
 */
const MIGRATIONS: readonly string[] = [
  // v1 — diaries 테이블 + 조회 경로 3종 인덱스
  `
  CREATE TABLE IF NOT EXISTS diaries (
    id          TEXT    PRIMARY KEY NOT NULL,
    entry_date  TEXT    NOT NULL,
    title       TEXT,
    content     TEXT    NOT NULL,
    emotion     TEXT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    deleted_at  INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_diaries_entry_date ON diaries (entry_date);
  CREATE INDEX IF NOT EXISTS idx_diaries_updated_at ON diaries (updated_at);
  CREATE INDEX IF NOT EXISTS idx_diaries_deleted_at ON diaries (deleted_at);
  `,

  // v2 — 본문 블록 · 이미지 · 태그 (DATABASE.md §4 v2)
  // content는 지우지 않고 '검색용 파생 평문'으로 역할만 바꾼다(Expand-only).
  `
  ALTER TABLE diaries ADD COLUMN content_blocks TEXT;

  CREATE TABLE IF NOT EXISTS diary_images (
    id          TEXT    PRIMARY KEY NOT NULL,
    diary_id    TEXT    NOT NULL,
    file_name   TEXT    NOT NULL,
    width       INTEGER,
    height      INTEGER,
    created_at  INTEGER NOT NULL,
    deleted_at  INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_diary_images_diary ON diary_images (diary_id);

  CREATE TABLE IF NOT EXISTS tags (
    id          TEXT    PRIMARY KEY NOT NULL,
    name        TEXT    NOT NULL COLLATE NOCASE,
    created_at  INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags (name COLLATE NOCASE);

  CREATE TABLE IF NOT EXISTS diary_tags (
    diary_id  TEXT NOT NULL,
    tag_id    TEXT NOT NULL,
    PRIMARY KEY (diary_id, tag_id)
  );
  CREATE INDEX IF NOT EXISTS idx_diary_tags_tag ON diary_tags (tag_id);
  `,

  // v3 — 앱 설정 키-값 (DATABASE.md §4 v3)
  // 알림 토글·다크모드·잠금 대기시간처럼 '조각이 아닌' 값들이 갈 곳.
  // SecureStore는 비밀(PIN 해시·암호화 키) 전용으로 남긴다 — 설정을 섞으면 무엇이 비밀인지 흐려진다.
  `
  CREATE TABLE IF NOT EXISTS app_settings (
    key         TEXT    PRIMARY KEY NOT NULL,
    value       TEXT    NOT NULL,
    updated_at  INTEGER NOT NULL
  );
  `,
];

export const LATEST_DB_VERSION = MIGRATIONS.length;

/** 부족한 마이그레이션을 순서대로 적용한다. 앱 시작 시 1회, 다른 쿼리보다 먼저 끝나야 한다. */
export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  if (current >= LATEST_DB_VERSION) {
    return;
  }

  for (let version = current; version < LATEST_DB_VERSION; version += 1) {
    // 각 단계를 트랜잭션으로 묶는다 — 중간에 죽어도 반쪽 스키마가 남지 않는다.
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      // PRAGMA는 바인딩 파라미터를 받지 않는다. version+1은 코드가 만든 정수라 주입 위험이 없다.
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
