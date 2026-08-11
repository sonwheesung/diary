import * as SQLite from 'expo-sqlite';

import { migrate } from './migrations';

const DB_NAME = 'jogak.db';

// 커넥션은 앱 전체에서 하나만 쓴다. 화면마다 열면 마이그레이션이 경쟁하고 락이 걸린다.
// 진행 중인 초기화 Promise를 캐시해 동시 호출이 하나로 합쳐지게 한다.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // WAL — 읽기와 쓰기가 서로를 막지 않는다. 목록을 그리는 중에 저장해도 끊기지 않게.
  await db.execAsync('PRAGMA journal_mode = WAL');
  // 외래키는 지금 스키마엔 없지만, 나중에 추가될 때 기본으로 켜져 있도록 미리 켠다.
  await db.execAsync('PRAGMA foreign_keys = ON');
  /*
   * ⚠ 기본값은 0이다 — 락이 잡혀 있으면 **기다리지 않고 즉시 `database is locked`로 실패**한다.
   * WAL이라 읽기·쓰기는 안 부딪히지만 쓰기끼리는 여전히 부딪히고, 그 순간 실패하는 쪽이
   * 잠금 해제(`resetFailures`)처럼 실패하면 안 되는 경로일 수 있다.
   * 5초를 기다려 주면 사람이 만드는 정도의 경합은 전부 흡수된다.
   */
  await db.execAsync('PRAGMA busy_timeout = 5000');

  await migrate(db);

  /*
   * ⚠ **중단된 복원을 여기서 마무리한다.** 복원은 스크래치 DB에 만들고 한 번에 스왑하는데,
   *   그 사이에 앱이 죽으면 마커(`restore-pending.json`)가 남는다.
   *
   * ⚠ **`app/_layout.tsx`에 두면 늦다.** `ThemeProvider`가 `LockGate` 바깥에서
   *   `getSetting`으로 DB를 열고, 언어·공지·광고가 `void`로 게이트를 앞지른다.
   *   `getDatabase()`가 **모든 DB 접근이 반드시 지나는 유일한 지점**이라 여기가 맞다.
   *
   * ⚠ 실패해도 앱은 열려야 한다 — 스왑이 원자적이라 라이브는 무손상이거나 완전히
   *   교체된 상태 둘 중 하나이고, 반쪽은 원리적으로 없다.
   */
  try {
    const { recoverInterruptedRestore } = await import('@/features/backup/api/restore');
    await recoverInterruptedRestore(db);
  } catch {
    // 복구 모듈을 못 불러와도 DB는 쓸 수 있어야 한다.
  }

  return db;
}

/** DB 핸들을 얻는다. 최초 호출에서 열기 + 마이그레이션이 끝난 뒤 반환된다. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbPromise === null) {
    dbPromise = open().catch((error: unknown) => {
      // 실패한 Promise를 캐시에 남기면 이후 호출이 영원히 같은 에러를 받는다. 다음 시도에 다시 열게 비운다.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/** 테스트·기기 초기화용. 캐시된 커넥션을 버린다. */
export function resetDatabaseHandle(): void {
  dbPromise = null;
}
