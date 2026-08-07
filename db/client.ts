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

  await migrate(db);
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
