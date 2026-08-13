import { getDatabase } from '@/db/client';

/**
 * 백업 커서 (`backup_state`, DB v4).
 *
 * ⚠ **복원이 갈아끼우는 테이블 밖에 있다.** 안에 두면 복원이 자기 커서를 지우거나
 *   복원 전 기기의 커서를 남긴다 — 어느 쪽이든 다음 백업이 서버 세대와 어긋난다.
 *
 * ⚠ `settings-store`를 재사용하지 않는다. 그쪽은 교체 대상이고 값이 전부 TEXT라
 *   `seq` 비교가 문자열 비교(`'9' > '10'`)가 된다.
 */

export interface BackupState {
  readonly enabled: boolean;
  /** 소문자 hex 32자. 켠 적 없으면 `null` */
  readonly vaultId: string | null;
  /** 서버에 커밋된 마지막 세대. 다음 업로드는 `seq + 1` */
  readonly seq: number;
  readonly lastBackupAt: number | null;
  /** `null`이면 복구 코드 보관이 확인되지 않았다 — 설정에 배지를 띄운다 */
  readonly codeConfirmedAt: number | null;
}

interface Row {
  backup_enabled: number;
  vault_id: string | null;
  seq: number;
  last_backup_at: number | null;
  code_confirmed_at: number | null;
}

const EMPTY: BackupState = {
  enabled: false,
  vaultId: null,
  seq: 0,
  lastBackupAt: null,
  codeConfirmedAt: null,
};

function toState(row: Row): BackupState {
  return {
    enabled: row.backup_enabled === 1,
    vaultId: row.vault_id,
    seq: row.seq,
    lastBackupAt: row.last_backup_at,
    codeConfirmedAt: row.code_confirmed_at,
  };
}

async function read(): Promise<BackupState> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    'SELECT backup_enabled, vault_id, seq, last_backup_at, code_confirmed_at FROM backup_state WHERE id = 1',
  );
  return row === null ? EMPTY : toState(row);
}

/**
 * 커서를 읽는다.
 *
 * `currentVaultId`를 넘기면 캐시와 대조한다. **다르면 커서를 초기화한다** —
 * 사용자가 다른 복구 코드로 갈아탔다는 뜻이라, 옛 `seq`로 올리면 남의 금고에
 * 붙거나 존재하지 않는 세대를 이어 쓰게 된다.
 */
export async function getBackupState(currentVaultId?: string): Promise<BackupState> {
  const state = await read();
  if (currentVaultId === undefined || state.vaultId === null || state.vaultId === currentVaultId) {
    return state;
  }
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE backup_state SET vault_id = ?, seq = 0, last_backup_at = NULL WHERE id = 1',
    currentVaultId,
  );
  // 코드 확인 여부와 켬/끔은 금고가 바뀌어도 사용자의 선택이라 유지한다.
  return { ...state, vaultId: currentVaultId, seq: 0, lastBackupAt: null };
}

/** 백업을 켠다. `vaultId`는 비밀에서 유도한 값 */
export async function enableBackup(vaultId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE backup_state SET backup_enabled = 1, vault_id = ? WHERE id = 1',
    vaultId,
  );
}

/**
 * 백업을 끈다. **커서는 지우지 않는다** — 서버의 세대는 그대로 남아 있고,
 * 다시 켰을 때 `seq=1`로 되돌아가면 그 세대와 충돌한다.
 */
export async function disableBackup(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE backup_state SET backup_enabled = 0 WHERE id = 1');
}

/**
 * 업로드가 **커밋까지** 성공했을 때만 부른다. 올리는 중에 부르면 실패한 세대를
 * 성공으로 기록해, 다음 백업이 서버에 없는 세대를 이어 쓴다.
 */
export async function markBackupCommitted(seq: number, at: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE backup_state SET seq = ?, last_backup_at = ? WHERE id = 1', seq, at);
}

/**
 * 복원이 끝났을 때 커서를 **복원한 세대**로 맞춘다.
 * 이걸 빠뜨리면 복원 직후 첫 백업이 이미 있는 seq를 다시 올린다.
 */
export async function adoptRestoredGeneration(
  vaultId: string,
  seq: number,
  at: number,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE backup_state SET backup_enabled = 1, vault_id = ?, seq = ?, last_backup_at = ? WHERE id = 1',
    vaultId,
    seq,
    at,
  );
}

/** 복구 코드 보관을 되받아 확인했다 */
export async function markCodeConfirmed(at: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE backup_state SET code_confirmed_at = ? WHERE id = 1', at);
}

/** 비밀을 새로 만들면 확인 상태도 리셋된다 — 옛 코드를 확인한 사실은 새 코드와 무관하다 */
export async function resetCodeConfirmation(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE backup_state SET code_confirmed_at = NULL WHERE id = 1');
}
