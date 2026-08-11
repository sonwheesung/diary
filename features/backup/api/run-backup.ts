import { openManifest, sealManifest } from '@/features/backup/api/package';
import { buildManifest } from '@/features/backup/api/manifest-builder';
import { loadBackupKeys } from '@/features/backup/api/key-store';
import type { BackupKeys } from '@/features/backup/api/key-store';
import {
  getBackupState,
  markBackupCommitted,
} from '@/features/backup/api/backup-state';
import type { BackupFail } from '@/features/backup/api/client';
import { commit, downloadPart, latest, reserve, uploadPart } from '@/features/backup/api/client';
import { assertReadable } from '@/features/backup/manifest';
import type { Manifest } from '@/features/backup/manifest';
import { LATEST_DB_VERSION } from '@/db/migrations';

/**
 * 백업 한 번 = 매니페스트 만들기 → 봉인 → 3단 업로드.
 *
 * ⚠ **커밋이 끝나야 성공이다.** 올리는 중에 커서를 옮기면, 다음 백업이 서버에 없는
 *   세대를 이어 쓰려다 영원히 409를 받는다.
 */

export type BackupFailure = BackupFail | 'no-keys';

export interface BackupProgress {
  /** 0..1. 파트 업로드가 대부분을 차지한다 */
  ratio: number;
  phase: 'building' | 'sealing' | 'uploading' | 'committing';
}

export type BackupOutcome =
  | { ok: true; seq: number; totalBytes: number; partCount: number }
  | { ok: false; reason: BackupFailure; detail?: unknown };

export async function runBackup(
  onProgress?: (progress: BackupProgress) => void,
): Promise<BackupOutcome> {
  const keys = await loadBackupKeys();
  if (keys === null) {
    return { ok: false, reason: 'no-keys' };
  }

  onProgress?.({ ratio: 0, phase: 'building' });
  const manifest = await buildManifest();

  // 저장된 커서를 읽는다. vault_id가 다르면(= 다른 복구 코드로 갈아탐) 여기서 0으로 리셋된다.
  const state = await getBackupState(keys.vaultId);
  const seq = state.seq + 1;

  onProgress?.({ ratio: 0.05, phase: 'sealing' });
  const { genId, envelopes } = await sealManifest(manifest, keys, seq);

  const reserved = await reserve(keys.vaultId, seq, genId, envelopes.length);
  if (!reserved.ok) {
    return reserved;
  }

  onProgress?.({ ratio: 0.1, phase: 'uploading' });
  for (const slot of reserved.uploads) {
    const uploaded = await uploadPart(slot.signedUrl, envelopes[slot.part]);
    if (!uploaded.ok) {
      return uploaded;
    }
    // 업로드가 전체의 85%를 차지한다고 본다 — 봉인·커밋은 순식간이다.
    onProgress?.({
      ratio: 0.1 + (0.85 * (slot.part + 1)) / reserved.uploads.length,
      phase: 'uploading',
    });
  }

  onProgress?.({ ratio: 0.95, phase: 'committing' });
  const committed = await commit(keys.vaultId, seq, genId);
  if (!committed.ok) {
    return committed;
  }

  // ⚠ **여기서야** 커서를 옮긴다.
  await markBackupCommitted(committed.seq, Date.now());
  onProgress?.({ ratio: 1, phase: 'committing' });

  return {
    ok: true,
    seq: committed.seq,
    totalBytes: committed.totalBytes,
    partCount: envelopes.length,
  };
}

export type RestoreOutcome =
  | { ok: true; manifest: Manifest; seq: number }
  | { ok: false; reason: BackupFailure | 'unreadable'; detail?: unknown };

/**
 * 서버에서 매니페스트를 받아 연다. **DB에는 아직 쓰지 않는다** —
 * 확인 화면이 차집합을 보여주고 사용자가 동의한 뒤에 반영한다.
 */
export async function fetchRestorable(
  keys: BackupKeys,
  onProgress?: (ratio: number) => void,
): Promise<RestoreOutcome> {
  const head = await latest(keys.vaultId);
  if (!head.ok) {
    return head;
  }

  const parts: Uint8Array[] = [];
  for (const slot of head.downloads) {
    const got = await downloadPart(slot.url);
    if (!got.ok) {
      return got;
    }
    parts.push(got.bytes);
    onProgress?.((parts.length / head.downloads.length) * 0.9);
  }

  try {
    const opened = openManifest(parts, keys);
    /*
     * ⚠ **더 새 스키마는 거부한다.** 조용히 컬럼을 버리면 사용자는 복원이 성공했다고 믿고,
     *   그 상태로 다음 백업을 눌러 잘린 데이터를 새 정본으로 만든다.
     */
    assertReadable(opened.manifest, LATEST_DB_VERSION);
    onProgress?.(1);
    return { ok: true, manifest: opened.manifest, seq: opened.seq };
  } catch (error) {
    return {
      ok: false,
      reason: 'unreadable',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
