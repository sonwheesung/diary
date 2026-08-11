import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { deriveAuthKey, deriveDek, deriveKid, deriveVaultId, toHex } from '@/features/backup/key-derive';
import { SECRET_LENGTH, encodeRecoveryCode } from '@/features/backup/recovery-code';

/**
 * 백업 비밀(= 복구 코드의 원본 바이트)의 보관소.
 *
 * **서버는 이 값을 갖지 않는다.** 그래서 서버가 백업을 복호화할 수 없고, 동시에
 * **이 값을 잃으면 우리도 되살릴 방법이 없다.** 그 비대칭이 백업 UX 전체를 규정한다.
 *
 * ⚠ 저장하는 것은 **비밀 16바이트 하나뿐**이다. DEK·`vault_id`·`kid`는 저장하지 않고
 *   매번 유도한다 — 두 벌을 두면 어긋날 수 있고, 어긋나는 순간 남의 금고를 조회하거나
 *   못 여는 금고가 생긴다. 단일 진실을 하나로 둔다.
 */

/** ⚠ 이 이름은 **바꿀 수 없다.** SecureStore에는 마이그레이션이 없어, 바꾸면 기존 기기의 비밀을 잃는다 */
const KEY_SECRET = 'jogak.backup.secret';

/**
 * ⚠ **iOS 키체인 동기화를 끈다.** 기본값(`WHEN_UNLOCKED`)이면 이 비밀이 iCloud 키체인으로
 *   올라갈 수 있고, 그러면 "서버는 키를 갖지 않는다"는 E2EE의 근거가 흔들린다
 *   — 애플이 갖는 것은 우리가 갖는 것과 다르지만, 사용자에게 한 약속의 의미는 달라진다.
 *
 * ⚠ `requireAuthentication`은 **쓰지 않는다.** 켜면 `expo-secure-store`가 끌어오는
 *   `androidx.biometric`이 살아나 `USE_BIOMETRIC`·`USE_FINGERPRINT` 권한이 매니페스트에
 *   되돌아온다 — CLAUDE.md §7.1이 명시적으로 걷어낸 권한이다.
 */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** 백업 키 재료 한 벌. 전부 비밀 하나에서 유도된다 */
export interface BackupKeys {
  /** 복구 코드의 원본 바이트. 화면에 보여줄 때 말고는 들고 다니지 않는다 */
  readonly secret: Uint8Array;
  /** XChaCha20-Poly1305 키 */
  readonly dek: Uint8Array;
  /** 서버에서 금고를 찾는 이름. 소문자 hex 32자 */
  readonly vaultId: string;
  /** 봉투 헤더에 실리는 키 식별자 */
  readonly kid: Uint8Array;
  /**
   * 되찾기·삭제 인가값. hex 64자.
   * ⚠ 서버는 `sha256`으로만 저장한다 — 절대 로그에 남기지 않는다.
   */
  readonly authKey: string;
}

function keysFrom(secret: Uint8Array): BackupKeys {
  return {
    secret,
    dek: deriveDek(secret),
    vaultId: toHex(deriveVaultId(secret)),
    kid: deriveKid(secret),
    authKey: deriveAuthKey(secret),
  };
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * 새 백업 비밀을 만들어 저장한다. **이미 있으면 덮어쓰지 않는다** —
 * 덮어쓰는 순간 서버에 올라간 백업이 통째로 열 수 없는 데이터가 된다.
 */
export async function createBackupSecret(): Promise<BackupKeys> {
  const existing = await loadBackupKeys();
  if (existing !== null) {
    return existing;
  }
  // expo-crypto의 네이티브 CSPRNG. Math.random이나 noble의 randomBytes를 쓰지 않는다
  // (후자는 RN에 없는 globalThis.crypto를 요구한다).
  const secret = await Crypto.getRandomBytesAsync(SECRET_LENGTH);
  await SecureStore.setItemAsync(KEY_SECRET, toHex(secret), OPTIONS);
  return keysFrom(secret);
}

/** 저장된 비밀로 키 한 벌을 만든다. 백업을 켠 적이 없으면 `null` */
export async function loadBackupKeys(): Promise<BackupKeys | null> {
  const stored = await SecureStore.getItemAsync(KEY_SECRET, OPTIONS);
  if (stored === null || stored.length !== SECRET_LENGTH * 2) {
    return null;
  }
  return keysFrom(fromHex(stored));
}

/**
 * 다른 기기에서 온 복구 코드로 이 기기를 잇는다.
 *
 * ⚠ 호출자가 `decodeRecoveryCode()`로 검증한 바이트를 넘긴다 — 이 층은 형식을 모른다.
 */
export async function adoptBackupSecret(secret: Uint8Array): Promise<BackupKeys> {
  if (secret.length !== SECRET_LENGTH) {
    throw new Error(`백업 비밀은 ${SECRET_LENGTH}바이트여야 한다`);
  }
  await SecureStore.setItemAsync(KEY_SECRET, toHex(secret), OPTIONS);
  return keysFrom(secret);
}

/**
 * 이 기기에서 백업 비밀을 지운다.
 *
 * ⚠ **서버의 백업은 그대로 남는다.** 복구 코드를 보관한 사람만 다시 열 수 있다 —
 *   보관본이 없으면 그 금고는 아무도 못 여는 데이터가 된다. 부르는 쪽이 그 사실을
 *   화면에 그대로 적고, DB·파일 삭제가 **모두 성공한 뒤 마지막에** 부른다.
 */
export async function deleteBackupSecret(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_SECRET, OPTIONS);
}

/** 화면에 보여줄 복구 코드 문자열. 저장된 비밀이 없으면 `null` */
export async function readRecoveryCode(): Promise<string | null> {
  const keys = await loadBackupKeys();
  return keys === null ? null : encodeRecoveryCode(keys.secret);
}

/** 봉투마다 새로 만든다. **재사용하면 Poly1305 키가 드러난다** */
export async function newNonce(): Promise<Uint8Array> {
  return Crypto.getRandomBytesAsync(24);
}

/** 세대 하나를 식별하는 8바이트. 파트가 섞이는 것을 막는다 */
export async function newGenId(): Promise<Uint8Array> {
  return Crypto.getRandomBytesAsync(8);
}
