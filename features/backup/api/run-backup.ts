import { openManifest, sealManifest } from '@/features/backup/api/package';
import { buildManifest } from '@/features/backup/api/manifest-builder';
import { uploadPhotos } from '@/features/backup/api/photos';
import type { PhotoProgress } from '@/features/backup/api/photos';
import { deleteBackupSecret, loadBackupKeys } from '@/features/backup/api/key-store';
import type { BackupKeys } from '@/features/backup/api/key-store';
import { getBackupState, markBackupCommitted } from '@/features/backup/api/backup-state';
import type { BackupFail } from '@/features/backup/api/client';
import {
  commit,
  deleteVault,
  downloadPart,
  latest,
  rebind,
  reserve,
  uploadPart,
} from '@/features/backup/api/client';
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
  phase: 'building' | 'photos' | 'sealing' | 'uploading' | 'committing';
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

  /*
   * ⚠ **사진을 매니페스트보다 먼저** 올린다. 반대로 하면 커밋된 세대가 **없는 사진을
   *   가리킨다** — 복원한 사람은 행은 받았는데 파일이 영원히 안 오고, 화면에서 "손상"과
   *   구별되지 않는다.
   */
  onProgress?.({ ratio: 0, phase: 'photos' });
  const photos = await uploadPhotos(keys, ({ done, total }: PhotoProgress) =>
    onProgress?.({ ratio: total === 0 ? 0 : (done / total) * 0.5, phase: 'photos' }),
  );
  if (!photos.ok) {
    return photos;
  }

  onProgress?.({ ratio: 0.5, phase: 'building' });
  const manifest = await buildManifest();

  // 저장된 커서를 읽는다. vault_id가 다르면(= 다른 복구 코드로 갈아탐) 여기서 0으로 리셋된다.
  const state = await getBackupState(keys.vaultId);

  /*
   * ⚠ 커서가 서버보다 뒤처져 있으면 **영원히 같은 번호를 올리려 한다.** 재설치하거나
   *   앱 데이터를 지우면 커서만 사라지고 복구 코드는 남으므로 실제로 일어난다 —
   *   그때 백업 버튼이 영구히 실패하면 사용자가 할 수 있는 일이 없다.
   *
   *   서버가 `serverSeq`로 진실을 알려주므로 **한 번만** 맞춰서 다시 건다.
   *   `seq`는 봉투의 AAD에 들어가므로 **다시 봉인해야 한다** — 번호만 바꿔 보내면 열리지 않는다.
   */
  const sealAt = async (at: number) => {
    onProgress?.({ ratio: 0.55, phase: 'sealing' });
    return await sealManifest(manifest, keys, at);
  };

  let seq = state.seq + 1;
  let sealed = await sealAt(seq);
  let reserved = await reserve(
    keys.vaultId,
    seq,
    sealed.genId,
    sealed.envelopes.length,
    keys.authKey,
  );

  if (
    !reserved.ok &&
    reserved.reason === 'seq-conflict' &&
    typeof reserved.serverSeq === 'number'
  ) {
    seq = reserved.serverSeq + 1;
    sealed = await sealAt(seq);
    reserved = await reserve(
      keys.vaultId,
      seq,
      sealed.genId,
      sealed.envelopes.length,
      keys.authKey,
    );
  }
  if (!reserved.ok) {
    return reserved;
  }
  const { genId, envelopes } = sealed;

  onProgress?.({ ratio: 0.6, phase: 'uploading' });
  for (const slot of reserved.uploads) {
    const uploaded = await uploadPart(slot.signedUrl, envelopes[slot.part]);
    if (!uploaded.ok) {
      return uploaded;
    }
    // 업로드가 전체의 85%를 차지한다고 본다 — 봉인·커밋은 순식간이다.
    onProgress?.({
      ratio: 0.6 + (0.35 * (slot.part + 1)) / reserved.uploads.length,
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

/**
 * 다른 기기가 라이터일 때 이 기기로 가져온다.
 *
 * ⚠ **덮어쓰기 버튼은 만들지 않는다.** 순진한 덮어쓰기가 상대 기기의 조각을 지운다.
 *   가져온 뒤에는 **복원해서 서버 내용에 맞춘 다음** 이어 쓰는 것이 정해진 순서다.
 */
export async function takeOverWriter(): Promise<
  { ok: true } | { ok: false; reason: BackupFailure }
> {
  const keys = await loadBackupKeys();
  if (keys === null) {
    return { ok: false, reason: 'no-keys' };
  }
  const result = await rebind(keys.vaultId, keys.authKey);
  return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

/**
 * 서버의 백업을 지운다. **탈퇴 직전에 부른다.**
 *
 * 백업을 켠 적이 없으면(`no-keys`) 지울 것도 없으므로 **성공으로 답한다** —
 * 여기서 막으면 백업을 안 쓰는 사람이 탈퇴를 못 한다.
 */
export async function purgeBackup(): Promise<{ ok: true } | { ok: false; reason: BackupFailure }> {
  const keys = await loadBackupKeys();
  if (keys === null) {
    return { ok: true };
  }
  const result = await deleteVault(keys.vaultId, keys.authKey);
  if (result.ok) {
    // 서버에서 지웠으면 기기의 비밀도 지운다 — 남겨두면 없는 금고를 계속 조회한다.
    await deleteBackupSecret();
    return { ok: true };
  }
  /*
   * ⚠ 서버 URL이 안 박힌 빌드에서는 지울 금고 자체가 없다. 그걸 실패로 보면
   *   백업을 쓴 적 없는 사용자의 탈퇴가 막힌다.
   */
  if (result.reason === 'not-configured') {
    return { ok: true };
  }
  return { ok: false, reason: result.reason };
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
