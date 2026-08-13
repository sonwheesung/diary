import { File } from 'expo-file-system';

import { getDatabase } from '@/db/client';
import { newNonce } from '@/features/backup/api/key-store';
import type { BackupKeys } from '@/features/backup/api/key-store';
import { ENVELOPE_VERSION } from '@/features/backup/api/package';
import type { BackupFail } from '@/features/backup/api/client';
import { blobs, downloadPart, uploadPart } from '@/features/backup/api/client';
import {
  ENVELOPE_TYPE,
  SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
  encodeHeader,
  packEnvelope,
  parseEnvelope,
} from '@/features/backup/envelope';
import { deriveBlobKey } from '@/features/backup/key-derive';
import { open, seal } from '@/features/backup/seal';
import { resolveImageUri } from '@/features/diary/api/image-store';

/**
 * 사진 백업 (2차) — 이미지 하나 = blob 하나.
 *
 * **매니페스트와 완전히 다른 물건이다.** 매니페스트는 세대마다 통째로 다시 올리지만
 * 사진은 **한 번 올리면 끝**이고 세대와 무관하게 산다 — 조각 500개짜리 사용자가
 * 한 줄 고쳤다고 사진 300장을 다시 올릴 수는 없다.
 */

export interface PhotoProgress {
  done: number;
  total: number;
}

interface ImageRow {
  id: string;
  file_name: string;
  blob_state: string | null;
}

/** 한 번에 다루는 개수. 서버 상한(200)과 맞춘다 */
const BATCH = 100;

/**
 * 아직 서버에 없는 사진을 올린다.
 *
 * ⚠ **매니페스트보다 먼저 부른다.** 반대로 하면 커밋된 세대가 **없는 사진을 가리킨다** —
 *   복원한 사람은 행은 받았는데 파일이 영원히 안 오고, 화면에서 "손상"과 구별되지 않는다.
 */
export async function uploadPhotos(
  keys: BackupKeys,
  onProgress?: (progress: PhotoProgress) => void,
): Promise<{ ok: true; uploaded: number } | { ok: false; reason: BackupFail }> {
  const db = await getDatabase();
  /*
   * ⚠ 살아 있는 행만 올린다. 묘비의 사진은 되살릴 대상이 아니고, 올리면 쿼터만 먹는다.
   * ⚠ `blob_state='backed_up'`은 건너뛴다 — **이게 증분의 전부다.**
   */
  const rows = await db.getAllAsync<ImageRow>(
    `SELECT id, file_name, blob_state FROM diary_images
      WHERE deleted_at IS NULL AND (blob_state IS NULL OR blob_state != 'backed_up')`,
  );
  if (rows.length === 0) {
    return { ok: true, uploaded: 0 };
  }

  let uploaded = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const keyOf = new Map<string, ImageRow>();
    for (const row of slice) {
      keyOf.set(deriveBlobKey(keys.secret, row.id), row);
    }

    // 서버가 이미 가진 것을 빼고 나머지만 올린다.
    const planned = await blobs.plan(keys.vaultId, keys.authKey, [...keyOf.keys()]);
    if (!planned.ok) return planned;

    // 서버에 이미 있으면 올리지 않고 표시만 맞춘다(다른 기기에서 올렸을 수 있다).
    await markBackedUp(planned.have.map((key) => keyOf.get(key)?.id).filter(isString));

    if (planned.missing.length > 0) {
      const reserved = await blobs.reserve(keys.vaultId, keys.authKey, planned.missing);
      if (!reserved.ok) return reserved;

      const sent: string[] = [];
      for (const slot of reserved.uploads) {
        const row = keyOf.get(slot.blobKey);
        if (row === undefined) continue;

        const sealed = await sealPhoto(keys, slot.blobKey, row.file_name);
        if (sealed === null) {
          /*
           * 파일이 없다. 행은 있는데 파일이 사라진 경우다(복원 직후이거나 사고).
           * **실패로 만들지 않는다** — 나머지 사진의 백업까지 막을 이유가 없다.
           */
          await markMissing(row.id);
          continue;
        }
        const put = await uploadPart(slot.signedUrl, sealed);
        if (!put.ok) return put;
        sent.push(slot.blobKey);
        /*
         * ⚠ 증가를 `onProgress?.(...)` **인자 안에 두지 않는다.** 옵셔널 체이닝은 호출을
         *   통째로 건너뛰므로 콜백이 없으면 카운터가 영영 0이다(겪음 — 복원이 됐는데
         *   "0장 복원"으로 보였다).
         */
        uploaded += 1;
        onProgress?.({ done: uploaded, total: rows.length });
      }

      if (sent.length > 0) {
        const committed = await blobs.commit(keys.vaultId, keys.authKey, sent);
        if (!committed.ok) return committed;
        /*
         * ⚠ **커밋 성공 후에야** 표시한다. 앞에 두면 커밋이 실패했을 때 다음 백업이
         *   그 사진들을 "이미 올렸다"고 건너뛴다 — 서버엔 없는데 앱은 있다고 믿는다.
         */
        await markBackedUp(committed.committed.map((key) => keyOf.get(key)?.id).filter(isString));
      }
    }
  }
  return { ok: true, uploaded };
}

/**
 * 복원 뒤 사진을 받아온다.
 *
 * ⚠ **DB 스왑이 끝난 뒤에 부른다.** 복원은 행을 `'missing'`으로 넣으므로, 여기서 받아
 *   파일을 쓰고 `'backed_up'`으로 바꾼다. 서버에도 없는 사진은 **`'missing'`으로 남겨**
 *   화면이 *"이 사진은 이 기기에 없어요"* 를 띄울 수 있게 한다.
 */
export async function downloadPhotos(
  keys: BackupKeys,
  onProgress?: (progress: PhotoProgress) => void,
): Promise<{ ok: true; restored: number; absent: number } | { ok: false; reason: BackupFail }> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ImageRow>(
    `SELECT id, file_name, blob_state FROM diary_images
      WHERE deleted_at IS NULL AND blob_state = 'missing'`,
  );
  if (rows.length === 0) {
    return { ok: true, restored: 0, absent: 0 };
  }

  let restored = 0;
  let absent = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const keyOf = new Map<string, ImageRow>();
    for (const row of slice) {
      keyOf.set(deriveBlobKey(keys.secret, row.id), row);
    }

    const listed = await blobs.download(keys.vaultId, [...keyOf.keys()]);
    if (!listed.ok) return listed;
    absent += listed.absent.length;

    for (const item of listed.downloads) {
      const row = keyOf.get(item.blobKey);
      if (row === undefined) continue;

      const got = await downloadPart(item.url);
      if (!got.ok) return got;

      const plain = openPhoto(keys, item.blobKey, got.bytes);
      if (plain === null) {
        // 열리지 않는다 = 다른 코드로 잠긴 것이다. 남겨두고 넘어간다.
        continue;
      }
      const file = new File(resolveImageUri(row.file_name));
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(plain);
      await markBackedUp([row.id]);
      restored += 1;
      onProgress?.({ done: restored, total: rows.length });
    }
  }
  return { ok: true, restored, absent };
}

/** 사진 하나를 봉인한다. 파일이 없으면 `null` */
async function sealPhoto(
  keys: BackupKeys,
  blobKey: string,
  fileName: string,
): Promise<Uint8Array | null> {
  const file = new File(resolveImageUri(fileName));
  if (!file.exists) {
    return null;
  }
  // ⚠ `bytes()`는 **비동기**다. `write()`는 동기인데 짝이 안 맞아 헷갈리기 쉽다.
  const plaintext = await file.bytes();
  const nonce = await newNonce();
  const header = encodeHeader({
    version: ENVELOPE_VERSION,
    suite: SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
    flags: 0,
    kid: keys.kid,
    // ⚠ 헤더가 AAD이므로 **봉투가 자기 자리에 묶인다** — 다른 경로에 올려두면 개봉이 실패한다.
    context: { type: ENVELOPE_TYPE.blob, blobKey: fromHex(blobKey) },
    nonce,
  });
  return packEnvelope(header, seal({ plaintext, key: keys.dek, nonce, aad: header }));
}

function openPhoto(keys: BackupKeys, blobKey: string, envelope: Uint8Array): Uint8Array | null {
  try {
    const parsed = parseEnvelope(envelope);
    if (parsed.header.context.type !== ENVELOPE_TYPE.blob) {
      return null;
    }
    // 자리와 봉투가 맞는지 — AAD가 이미 보장하지만 오류 메시지를 명확히 하려고 먼저 본다.
    if (toHex(parsed.header.context.blobKey) !== blobKey) {
      return null;
    }
    return open({
      sealed: parsed.sealed,
      key: keys.dek,
      nonce: parsed.header.nonce,
      aad: parsed.aad,
    });
  } catch {
    return null;
  }
}

async function markBackedUp(imageIds: readonly string[]): Promise<void> {
  if (imageIds.length === 0) return;
  const db = await getDatabase();
  const placeholders = imageIds.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE diary_images SET blob_state = 'backed_up' WHERE id IN (${placeholders})`,
    ...imageIds,
  );
}

async function markMissing(imageId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE diary_images SET blob_state = 'missing' WHERE id = ?", imageId);
}

const isString = (value: string | undefined): value is string => typeof value === 'string';

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, '0');
  }
  return out;
}
