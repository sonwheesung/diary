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

  // v4 — 백업 커서 (BACKUP_SYSTEM)
  //
  // ⚠ **이 테이블은 복원의 교체 대상이 아니다.** 복원은 diaries·diary_images·tags·diary_tags를
  //   통째로 갈아끼우는데, 커서가 그 안에 있으면 두 갈래로 깨진다:
  //     지워지면  → 앱이 "백업한 적 없음"으로 seq=1을 올려 서버 세대와 충돌한다
  //     남아 있으면 → 그건 **복원 전 기기의 커서**라 역시 어긋난다
  //   그래서 별도 테이블로 빼고, 복원의 마지막 단계가 이 값을 복원한 세대로 맞춘다.
  //
  // ⚠ app_settings(키-값)를 재사용하지 않는 이유는 두 가지다 — 교체 대상이라는 것이 첫째고,
  //   값이 전부 TEXT라 seq 비교가 문자열 비교('9' > '10')가 되는 것이 둘째다.
  `
  CREATE TABLE IF NOT EXISTS backup_state (
    id                INTEGER PRIMARY KEY CHECK (id = 1),
    -- 켜기 전에는 NULL. vault_id 유무로 대신하지 않는다 — "켠 적 없음"과 "껐음"은 다르다
    backup_enabled    INTEGER NOT NULL DEFAULT 0,
    -- 소문자 hex 32자. 비밀에서 유도 가능하지만 **캐시**로 둔다.
    -- 읽을 때마다 deriveVaultId와 대조해 다르면 커서를 초기화한다(다른 코드로 갈아탄 것이다)
    vault_id          TEXT,
    -- 서버에 성공적으로 커밋된 **마지막** 세대. 다음 업로드는 seq+1. 미백업은 0
    seq               INTEGER NOT NULL DEFAULT 0,
    -- epoch ms. 미백업 상기 주기의 유일한 입력이다
    last_backup_at    INTEGER,
    -- 복구 코드를 실제로 보관했는지 되받아 확인한 시각.
    -- NULL이면 설정에 배지를 띄운다 — 코드를 가진 유일한 순간은 발급 직후뿐이고,
    -- 그때 확인을 안 받으면 "백업은 도는데 아무도 못 여는" 사용자를 만들어놓고 알지 못한다
    code_confirmed_at INTEGER
  );
  INSERT OR IGNORE INTO backup_state (id) VALUES (1);

  -- 사진 파일의 소재. 1차(텍스트 백업)는 diary_images **행**만 복원하고 파일은 안 가져오므로,
  -- 복원 직후 '행은 있는데 파일이 없는' 상태가 정상적으로 생긴다. 그걸 1급 상태로 만든다.
  -- NULL = 이 기기에서 만든 로컬 파일 / 'backed_up' = 서버에 올라감 / 'missing' = 파일 없음
  ALTER TABLE diary_images ADD COLUMN blob_state TEXT;
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
