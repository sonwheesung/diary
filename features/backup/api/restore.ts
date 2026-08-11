import { File } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import { getDatabase } from '@/db/client';
import { LATEST_DB_VERSION, migrate } from '@/db/migrations';
import { adoptRestoredGeneration } from '@/features/backup/api/backup-state';
import { resolveImageUri } from '@/features/diary/api/image-store';
import { localAliveDiaryIds } from '@/features/backup/api/manifest-builder';
import { clearSentinel, readSentinel, writeSentinel } from '@/features/backup/api/sentinel';
import { aliveDiaryIds } from '@/features/backup/manifest';
import type { Manifest } from '@/features/backup/manifest';

/**
 * 복원 — **전체 교체**, 스크래치 DB에 만들고 **한 번에 스왑**한다.
 *
 * 병합하지 않는다. 주 시나리오(기기 분실 → 새 폰)에서는 로컬이 비어 있어 교체가 곧
 * 정답이고, 병합 하나를 들이면 `rev`·`origin`·충돌 화면·15개 언어 문구가 전부 따라온다.
 *
 * ## 왜 라이브 DB에 직접 쓰지 않는가
 *
 * 직접 쓰면 **반쯤 교체된 상태가 실재한다** — 청크 3/7에서 앱이 죽으면 절반만 갈린 DB가
 * 남고, 사용자는 그걸 보고 "일부가 안 왔네"라고 생각한 뒤 백업을 눌러 **오염본을 새 정본**으로
 * 만든다.
 *
 * 스크래치에 전부 만들고 마지막에 한 번 스왑하면 그 상태가 **원리적으로 존재하지 않는다.**
 * 실기기에서 스왑이 **8ms**로 확인됐다(`docs/BACKUP_SYSTEM.md` §8) — 되돌리기가 필요한
 * 창이 30초에서 8ms로 줄어든다.
 */

/** 교체되는 테이블 */
const REPLACED = ['diary_tags', 'diary_images', 'tags', 'diaries'] as const;

/**
 * 복원이 **건드리지 않는** 테이블.
 *
 * ⚠ **"보존"은 분류가 아니라 동작이다.** 스크래치는 `migrate()`로 만든 **빈** 테이블을
 *   갖고 있고, 스왑에는 테이블 단위 개념이 없다 — 라이브에서 스크래치로 **복사하지 않으면
 *   통째로 날아간다.**
 *   `app_settings`가 날아가면 테마와 **언어**가 리셋되어, 복원 직후 안내를
 *   **못 읽는 언어로** 만난다. `backup_state`가 날아가면 커서를 잃는다.
 */
const PRESERVED = ['app_settings', 'backup_state'] as const;

const SCRATCH_DB = 'jogak-restore-scratch.db';
const SNAPSHOT_DB = 'jogak-pre-restore.db';

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
 *   B 기기에서 "백업에 있음"으로 판정돼 **경고 없이 사라진다.**
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

/**
 * 매니페스트를 반영한다.
 *
 * ⚠ 저장소 계층(`diary-repository`)을 거치지 않는다. 그쪽은 정규화·검증을 하는데,
 *   복원은 **원본 행을 그대로** 넣어야 한다 — 모르는 블록 타입이 걸러지면 안 된다.
 */
export async function applyRestore(
  manifest: Manifest,
  vaultId: string,
  seq: number,
): Promise<void> {
  const live = await getDatabase();

  /*
   * ⚠ 같은 세션에서 복원을 재시도하면 expo가 **캐시된 커넥션을 돌려준다**
   *   (같은 경로·같은 옵션이면 refcount만 올린다). 직전 시도의 행이 그대로 남아 있어
   *   PK 충돌로 죽거나 두 세대가 섞인 스크래치가 된다. 시작할 때 반드시 지운다.
   * ⚠ `deleteDatabaseAsync`는 **열린 커넥션이 있으면 throw**한다 — 그래서 `finally`에서
   *   반드시 닫는다.
   */
  await SQLite.deleteDatabaseAsync(SCRATCH_DB).catch(() => undefined);
  await SQLite.deleteDatabaseAsync(SNAPSHOT_DB).catch(() => undefined);

  let scratch: SQLite.SQLiteDatabase | null = null;
  let snapshot: SQLite.SQLiteDatabase | null = null;

  try {
    writeSentinel({ phase: 'preparing', seq, vaultId, startedAt: Date.now() });

    // ── 1. 스크래치를 라이브와 **같은 조건으로** 연다 ─────────────────────────
    scratch = await SQLite.openDatabaseAsync(SCRATCH_DB);
    /*
     * ⚠ `page_size`를 **절대 건드리지 않는다.** 목적지가 WAL인데 페이지 크기가 다르면
     *   `backupDatabaseAsync`가 `SQLITE_READONLY`로 죽고, 그 오류는 원인 추적이 거의 불가능하다.
     */
    await scratch.execAsync('PRAGMA journal_mode = WAL');
    await scratch.execAsync('PRAGMA foreign_keys = ON');
    await scratch.execAsync('PRAGMA busy_timeout = 5000');
    await migrate(scratch);

    // ── 2. 매니페스트 반영 (라이브에는 락이 걸리지 않는다) ────────────────────
    await replaceInto(scratch, manifest);

    // ── 3. 보존 대상을 라이브 → 스크래치로 **복사** ───────────────────────────
    await copyPreserved(live, scratch);

    // ── 4. 검증 ───────────────────────────────────────────────────────────────
    await verify(scratch, manifest);

    // ── 5. 스냅샷 (되돌릴 근거) ───────────────────────────────────────────────
    snapshot = await SQLite.openDatabaseAsync(SNAPSHOT_DB);
    await SQLite.backupDatabaseAsync({ sourceDatabase: live, destDatabase: snapshot });
    /*
     * ⚠ **검증한 뒤에 마커를 올린다.** 순서를 뒤집으면 "마커는 있는데 스냅샷은 비어 있는"
     *   구간이 생기고, 부팅 게이트가 **멀쩡한 라이브를 빈 DB로 되돌린다.**
     *   빈 DB도 `integrity_check`는 통과하므로 이걸로는 못 거른다.
     */
    await assertUsable(snapshot, '스냅샷');
    writeSentinel({ phase: 'snapshotted', seq, vaultId, startedAt: Date.now() });

    // ── 6. 스왑 — 유일한 락 구간(실기기 8ms) ──────────────────────────────────
    await SQLite.backupDatabaseAsync({ sourceDatabase: scratch, destDatabase: live });
    /*
     * ⚠ `backup_step`의 반환값을 JS에서 볼 수 없으므로(네이티브가 버린다)
     *   **사후 검증이 성공 판정이다.** 소스가 0페이지면 "0페이지 복사 + 성공"이 될 수 있다.
     */
    await assertUsable(live, '스왑 결과');
    writeSentinel({ phase: 'swapped', seq, vaultId, startedAt: Date.now() });

    // ── 7. 커서를 복원한 세대로 ───────────────────────────────────────────────
    await adoptRestoredGeneration(vaultId, seq, Date.now());
    clearSentinel();
  } finally {
    // ⚠ 닫지 않으면 다음 시도의 `deleteDatabaseAsync`가 throw한다.
    await scratch?.closeAsync().catch(() => undefined);
    await snapshot?.closeAsync().catch(() => undefined);
    await SQLite.deleteDatabaseAsync(SCRATCH_DB).catch(() => undefined);
  }
}

async function chunked<T>(rows: readonly T[], run: (slice: readonly T[]) => Promise<void>) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await run(rows.slice(i, i + CHUNK));
  }
}

async function replaceInto(db: SQLite.SQLiteDatabase, manifest: Manifest): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of REPLACED) {
      await db.execAsync(`DELETE FROM ${table}`);
    }
  });

  await chunked(manifest.diaries, async (rows) => {
    await db.withTransactionAsync(async () => {
      for (const row of rows) {
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
    });
  });

  // ⚠ 태그가 조각·연결보다 **먼저** 들어가야 참조 대상이 있다.
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
         * ⚠ `blob_state`는 매니페스트 값을 쓰지 않는다 — 그건 **원본 기기의 사정**이다.
         *   이 기기에 파일이 실제로 있는지로 정한다:
         *
         *   - 파일 있음 → `null`  같은 기기에서 복원했거나 사진 백업 이전 세대다.
         *                        서버에 있는지는 모르므로 다음 백업이 확인해서 올린다.
         *   - 파일 없음 → `'missing'`  `downloadPhotos()`가 받아올 대상.
         *
         *   ⚠ 파일이 있는데도 `'missing'`을 박으면 **네트워크가 없거나 사진 백업 이전
         *     세대일 때 멀쩡히 있는 사진이 "이 기기에 없어요"로 표시된다.**
         */
        const present = new File(resolveImageUri(row.file_name)).exists;
        await db.runAsync(
          `INSERT OR REPLACE INTO diary_images
             (id, diary_id, file_name, width, height, created_at, deleted_at, blob_state)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          row.id,
          row.diary_id,
          row.file_name,
          row.width,
          row.height,
          row.created_at,
          row.deleted_at,
          present ? null : 'missing',
        );
      }
    });
  });
}

/**
 * 보존 대상을 라이브에서 스크래치로 옮긴다.
 *
 * ⚠ 이게 빠지면 **테마·언어·잠금 backoff·백업 커서가 통째로 날아간다.**
 *   스크래치는 `migrate()`가 만든 빈 테이블을 갖고 있고 스왑은 파일을 통째로 덮는다.
 */
async function copyPreserved(
  live: SQLite.SQLiteDatabase,
  scratch: SQLite.SQLiteDatabase,
): Promise<void> {
  for (const table of PRESERVED) {
    const rows = await live.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table}`);
    if (rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(',');
    await scratch.withTransactionAsync(async () => {
      await scratch.execAsync(`DELETE FROM ${table}`);
      for (const row of rows) {
        await scratch.runAsync(
          `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`,
          ...columns.map((column) => row[column] as SQLite.SQLiteBindValue),
        );
      }
    });
  }
}

/** 쓸 수 있는 DB인가. **빈 DB도 `integrity_check`는 통과**하므로 스키마도 함께 본다 */
async function assertUsable(db: SQLite.SQLiteDatabase, what: string): Promise<void> {
  const integrity = await db.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check');
  if (integrity?.integrity_check !== 'ok') {
    throw new Error(`${what}이(가) 손상됐다: ${integrity?.integrity_check ?? '알 수 없음'}`);
  }
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((version?.user_version ?? 0) !== LATEST_DB_VERSION) {
    throw new Error(
      `${what}의 스키마 버전이 다르다 (${version?.user_version ?? 0} ≠ ${LATEST_DB_VERSION})`,
    );
  }
  const tables = await db.getFirstAsync<{ n: number }>(
    "SELECT count(*) as n FROM sqlite_master WHERE type='table'",
  );
  if ((tables?.n ?? 0) === 0) {
    throw new Error(`${what}이(가) 비어 있다`);
  }
}

/** 스크래치에 들어간 행 수가 매니페스트와 맞는가 */
async function verify(db: SQLite.SQLiteDatabase, manifest: Manifest): Promise<void> {
  await assertUsable(db, '복원본');
  const counted = await db.getFirstAsync<{ n: number }>('SELECT count(*) as n FROM diaries');
  if ((counted?.n ?? -1) !== manifest.diaries.length) {
    throw new Error(`조각 수가 다르다 (${counted?.n ?? -1} ≠ ${manifest.diaries.length})`);
  }
}

/**
 * 부팅 시 중단된 복원을 마무리한다. **DB를 쓰는 무엇보다 먼저 불려야 한다** —
 * 그래서 `db/client.ts`의 `open()`이 부른다(`_layout.tsx`는 늦다: `ThemeProvider`·언어·
 * 공지·광고가 `void`로 게이트를 앞지른다).
 */
export async function recoverInterruptedRestore(live: SQLite.SQLiteDatabase): Promise<void> {
  const sentinel = readSentinel();
  if (sentinel === null) {
    return;
  }

  try {
    if (sentinel.phase === 'swapped') {
      /*
       * 스왑은 끝났다 — **되돌리면 성공한 복원을 날린다.** 커서만 마무리한다.
       * 안 하면 다음 백업이 이미 있는 seq를 올려 409를 받는다.
       */
      await adoptRestoredGeneration(sentinel.vaultId, sentinel.seq, Date.now());
    } else if (sentinel.phase === 'snapshotted') {
      // 스냅샷은 검증까지 끝났다. 스왑 도중 죽었을 수 있으니 되돌린다.
      const snapshot = await SQLite.openDatabaseAsync(SNAPSHOT_DB);
      try {
        await assertUsable(snapshot, '스냅샷');
        await SQLite.backupDatabaseAsync({ sourceDatabase: snapshot, destDatabase: live });
      } finally {
        await snapshot.closeAsync().catch(() => undefined);
      }
    }
    // 'preparing'은 라이브를 건드린 적이 없다 — 마커만 지우면 된다.
  } catch {
    /*
     * 복구에 실패해도 앱은 열려야 한다. 라이브는 스왑이 원자적이라 무손상이거나
     * 완전히 교체된 상태 둘 중 하나다 — 반쪽은 원리적으로 없다.
     */
  } finally {
    clearSentinel();
    await SQLite.deleteDatabaseAsync(SCRATCH_DB).catch(() => undefined);
  }
}
