import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/db/client';
import { adoptRestoredGeneration } from '@/features/backup/api/backup-state';
import { localAliveDiaryIds } from '@/features/backup/api/manifest-builder';
import { aliveDiaryIds } from '@/features/backup/manifest';
import type { Manifest } from '@/features/backup/manifest';

/**
 * 복원 — **전체 교체**.
 *
 * 병합하지 않는다. 주 시나리오(기기 분실 → 새 폰)에서는 로컬이 비어 있어 교체가 곧
 * 정답이고, 병합 하나를 들이면 `rev`·`origin`·충돌 화면·15개 언어 문구·"백업 차단"
 * 상태기계가 전부 따라온다.
 *
 * ⚠ **그 대가로 잃는 것이 있다.** 로컬에만 있는 조각은 사라진다.
 *   그래서 `diffAgainstLocal()`이 선택이 아니라 필수 조건이다 — 부르는 쪽은 반드시
 *   차집합을 보여주고 동의를 받은 뒤에 `applyRestore()`를 부른다.
 */

/** 교체되는 테이블. 이 목록 밖은 건드리지 않는다 */
const REPLACED = ['diary_tags', 'diary_images', 'tags', 'diaries'] as const;

export interface RestoreDiff {
  /** 백업에 없어서 **사라질** 로컬 조각 id */
  losing: string[];
  /** 복원 후 남을 조각 수(묘비 제외) */
  incoming: number;
}

/**
 * 이 복원이 무엇을 지우는지 센다.
 *
 * ⚠ **매니페스트 쪽은 살아 있는 id만** 쓴다. 묘비 id를 포함하면 "A 기기에서 지운 조각"이
 *   B 기기에서 "백업에 있음"으로 판정돼 **경고 없이 사라진다** — 이 화면이 막으려던
 *   바로 그 손실이다.
 *
 * ⚠ 진짜 다수 케이스는 "두 기기 병행 작성"이 아니라 **"로컬이 비어 있지 않은데 복원"** 이다.
 *   백업이 수동 버튼인 한 스테일은 기본값이고, 3주 전 백업 + 그 뒤 20개 작성 상태에서
 *   복원을 누르면 20개가 사라진다.
 */
export async function diffAgainstLocal(manifest: Manifest): Promise<RestoreDiff> {
  const local = await localAliveDiaryIds();
  const remote = aliveDiaryIds(manifest);

  const losing: string[] = [];
  for (const id of local) {
    if (!remote.has(id)) {
      losing.push(id);
    }
  }
  return { losing, incoming: remote.size };
}

/** 한 트랜잭션에 넣는 행 수. 큰 배열을 한 번에 바인딩하면 SQLite 변수 한도에 걸린다 */
const CHUNK = 200;

async function chunked<T>(rows: readonly T[], run: (slice: readonly T[]) => Promise<void>) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await run(rows.slice(i, i + CHUNK));
  }
}

/**
 * 매니페스트를 DB에 반영한다.
 *
 * ⚠ **`app_settings`와 `backup_state`는 건드리지 않는다.** 테마·언어·잠금 backoff·
 *   백업 커서가 거기 있다. 특히 언어가 날아가면 복원 직후 안내를 **못 읽는 언어로** 만난다.
 *
 * ⚠ 저장소 계층(`diary-repository`)을 거치지 않는다. 그쪽은 정규화·검증을 하는데,
 *   복원은 **원본 행을 그대로** 넣어야 한다 — 모르는 블록 타입이 걸러지면 안 된다.
 *
 * ⏭ 지금은 라이브 DB에 직접 쓴다. 스크래치 DB에 만들고 한 번에 스왑하는 구조가 더 안전하나
 *    (`backupDatabaseAsync`), 그건 실기기에서 동작을 확인한 뒤에 바꾼다 —
 *    열린 커넥션을 목적지로 받을 수 있는지가 아직 미검증이다.
 */
export async function applyRestore(manifest: Manifest, vaultId: string, seq: number): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const table of REPLACED) {
      await db.execAsync(`DELETE FROM ${table}`);
    }
  });

  await chunked(manifest.diaries, async (rows) => {
    await db.withTransactionAsync(async () => {
      for (const row of rows) {
        await insertDiary(db, row);
      }
    });
  });

  // ⚠ 태그가 조각보다 **먼저** 들어가야 diary_tags가 가리킬 대상이 있다.
  //   (FK를 안 걸었지만 순서를 지키는 편이 나중에 켤 때 안전하다.)
  await chunked(manifest.tags, async (rows) => {
    await db.withTransactionAsync(async () => {
      for (const row of rows) {
        await db.runAsync(
          'INSERT OR REPLACE INTO tags (id, name, created_at) VALUES (?, ?, ?)',
          row.id,
          row.name,
          row.created_at,
        );
      }
    });
  });

  await chunked(manifest.diaryTags, async (rows) => {
    await db.withTransactionAsync(async () => {
      for (const row of rows) {
        await db.runAsync(
          'INSERT OR REPLACE INTO diary_tags (diary_id, tag_id) VALUES (?, ?)',
          row.diary_id,
          row.tag_id,
        );
      }
    });
  });

  await chunked(manifest.images, async (rows) => {
    await db.withTransactionAsync(async () => {
      for (const row of rows) {
        /*
         * ⚠ `blob_state`를 매니페스트 값이 아니라 **'missing'으로 강제한다.**
         *   1차는 사진 파일을 가져오지 않으므로, 원본 기기의 'present'를 그대로 쓰면
         *   "파일이 있다"고 주장하는 행이 생긴다 — `missing`을 1급 상태로 만든 목적이
         *   바로 그걸 막는 것이었다.
         */
        await db.runAsync(
          `INSERT OR REPLACE INTO diary_images
             (id, diary_id, file_name, width, height, created_at, deleted_at, blob_state)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'missing')`,
          row.id,
          row.diary_id,
          row.file_name,
          row.width,
          row.height,
          row.created_at,
          row.deleted_at,
        );
      }
    });
  });

  /*
   * ⚠ **마지막에** 커서를 복원한 세대로 맞춘다. 빠뜨리면 복원 직후 첫 백업이
   *   이미 서버에 있는 seq를 다시 올리려다 409를 받는다.
   */
  await adoptRestoredGeneration(vaultId, seq, Date.now());
}

async function insertDiary(db: SQLiteDatabase, row: Manifest['diaries'][number]): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO diaries
       (id, entry_date, title, content, content_blocks, emotion, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    row.id,
    row.entry_date,
    row.title,
    row.content,
    row.content_blocks,
    row.emotion,
    row.created_at,
    row.updated_at,
    row.deleted_at,
  );
}
