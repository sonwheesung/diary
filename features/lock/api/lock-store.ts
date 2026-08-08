import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import {
  SETTING_KEYS,
  getNumberSetting,
  getSetting,
  setNumberSetting,
  setSetting,
} from '@/features/settings/api/settings-store';

/**
 * 앱 잠금 (CLAUDE.md §7.1).
 *
 * ⚠ **잠금은 암호화가 아니다.** PIN·패턴은 UI 게이트일 뿐이고, 로컬 DB 파일 자체는 평문이다.
 * 루팅·탈옥 기기나 기기 백업 추출로는 잠금을 우회해 읽을 수 있다. 사용자에게 "암호화된다"고
 * 표기하지 않는다 — 막는 위협은 "폰을 잠깐 남에게 보여줄 때"다.
 *
 * 비밀(해시·솔트)은 SecureStore에, 비밀이 아닌 설정(대기 시간·실패 횟수)은 app_settings에 둔다.
 */

const KEY_METHOD = 'jogak.lock.method';
const KEY_SALT = 'jogak.lock.salt';
const KEY_HASH = 'jogak.lock.hash';
const KEY_BIOMETRIC = 'jogak.lock.biometric';
const KEY_HINT_QUESTION = 'jogak.lock.hint.question';
const KEY_HINT_SALT = 'jogak.lock.hint.salt';
const KEY_HINT_HASH = 'jogak.lock.hint.hash';
const KEY_HINT_CIPHER = 'jogak.lock.hint.cipher';

export type LockMethod = 'pin' | 'pattern';
export type LockDelay = 'immediate' | '1m' | '5m';

export const LOCK_DELAY_MS: Record<LockDelay, number> = {
  immediate: 0,
  '1m': 60_000,
  '5m': 300_000,
};

export const PIN_LENGTH = 4;
/** 패턴은 PIN보다 추측 공간이 좁고 화면 얼룩에 약하다 — 최소 길이를 강제한다(§7.1) */
export const PATTERN_MIN_POINTS = 4;

/**
 * 해시 반복 횟수.
 *
 * ⚠ 이건 **KDF가 아니다.** 4자리 PIN은 반복을 아무리 늘려도 오프라인 전수 대입에 버티지 못한다.
 * 해시를 쓰는 이유는 "평문을 저장하지 않는다"이지 "무차별 대입을 막는다"가 아니다(§7.1).
 * 반복은 기기에서 체감되지 않는 선(수백 ms)까지만 올린다.
 */
const HASH_ROUNDS = 600;

export interface LockConfig {
  enabled: boolean;
  method: LockMethod | null;
  /** 생체인증 사용 여부. **단독 수단이 될 수 없다** — 항상 PIN/패턴이 함께 설정돼 있다 */
  biometric: boolean;
  delay: LockDelay;
}

async function hashSecret(secret: string, salt: string): Promise<string> {
  let digest = `${salt}:${secret}`;
  for (let round = 0; round < HASH_ROUNDS; round += 1) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, digest);
  }
  return digest;
}

function isLockMethod(value: string | null): value is LockMethod {
  return value === 'pin' || value === 'pattern';
}

function isLockDelay(value: string | null): value is LockDelay {
  return value === 'immediate' || value === '1m' || value === '5m';
}

export async function getLockConfig(): Promise<LockConfig> {
  const [method, hash, biometric, delay] = await Promise.all([
    SecureStore.getItemAsync(KEY_METHOD),
    SecureStore.getItemAsync(KEY_HASH),
    SecureStore.getItemAsync(KEY_BIOMETRIC),
    getSetting(SETTING_KEYS.lockDelay),
  ]);

  return {
    // 해시가 없으면 잠금이 걸려 있다고 볼 수 없다 — 열 방법이 없는 잠금은 사고다.
    enabled: isLockMethod(method) && hash !== null,
    method: isLockMethod(method) ? method : null,
    biometric: biometric === 'true',
    delay: isLockDelay(delay) ? delay : 'immediate',
  };
}

/** 잠금을 켜거나 비밀을 바꾼다. 평문은 어디에도 남기지 않는다. */
export async function setLockSecret(method: LockMethod, secret: string): Promise<void> {
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const hash = await hashSecret(secret, salt);

  await SecureStore.setItemAsync(KEY_SALT, salt);
  await SecureStore.setItemAsync(KEY_HASH, hash);
  await SecureStore.setItemAsync(KEY_METHOD, method);
  await resetFailures();
}

export async function verifySecret(secret: string): Promise<boolean> {
  const [salt, hash] = await Promise.all([
    SecureStore.getItemAsync(KEY_SALT),
    SecureStore.getItemAsync(KEY_HASH),
  ]);
  if (salt === null || hash === null) {
    return false;
  }
  return (await hashSecret(secret, salt)) === hash;
}

export async function disableLock(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_METHOD);
  await SecureStore.deleteItemAsync(KEY_SALT);
  await SecureStore.deleteItemAsync(KEY_HASH);
  await SecureStore.deleteItemAsync(KEY_BIOMETRIC);
  await SecureStore.deleteItemAsync(KEY_HINT_QUESTION);
  await SecureStore.deleteItemAsync(KEY_HINT_SALT);
  await SecureStore.deleteItemAsync(KEY_HINT_HASH);
  await SecureStore.deleteItemAsync(KEY_HINT_CIPHER);
  await resetFailures();
}

/*
 * ─── 힌트로 되찾기 ─────────────────────────────────────────────────────────
 *
 * 잠금을 잊었을 때 **힌트 질문에 답하면 PIN·패턴을 다시 보여준다.**
 *
 * 그러려면 비밀을 되돌릴 수 있어야 하는데, **평문으로 두지는 않는다**(§7.1).
 * 힌트 답에서 유도한 키스트림으로 비밀을 XOR해 보관하고, 답이 맞을 때만 되돌린다.
 * 답을 모르면 상자를 열 수 없다.
 *
 * ⚠ 정직하게: 이 문은 **힌트 답의 강도만큼만 강하다.** 답이 짐작하기 쉬우면 잠금도 그만큼 약하다.
 * 그래서 설정 화면에서 "남이 못 맞힐 답"을 요구하고, 시도에는 잠금과 같은 지연을 건다.
 */

/** 답은 띄어쓰기·대소문자로 틀리는 일이 없게 다듬는다 — 되찾기 문턱을 오타로 만들지 않는다. */
function normalizeAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function keystream(answer: string, salt: string, length: number): Promise<number[]> {
  const bytes: number[] = [];
  let block = 0;
  while (bytes.length < length) {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${salt}:${answer}:${block}`,
    );
    for (let index = 0; index + 1 < digest.length && bytes.length < length; index += 2) {
      bytes.push(Number.parseInt(digest.slice(index, index + 2), 16));
    }
    block += 1;
  }
  return bytes;
}

async function sealSecret(secret: string, answer: string, salt: string): Promise<string> {
  const codes = Array.from(secret, (char) => char.charCodeAt(0));
  const stream = await keystream(answer, salt, codes.length);
  return codes
    .map((code, index) => (code ^ (stream[index] ?? 0)).toString(16).padStart(4, '0'))
    .join('');
}

async function openSecret(cipher: string, answer: string, salt: string): Promise<string> {
  const codes: number[] = [];
  for (let index = 0; index + 3 < cipher.length; index += 4) {
    codes.push(Number.parseInt(cipher.slice(index, index + 4), 16));
  }
  const stream = await keystream(answer, salt, codes.length);
  return codes.map((code, index) => String.fromCharCode(code ^ (stream[index] ?? 0))).join('');
}

export async function setLockHint(question: string, answer: string, secret: string): Promise<void> {
  const normalized = normalizeAnswer(answer);
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  await SecureStore.setItemAsync(KEY_HINT_QUESTION, question.trim());
  await SecureStore.setItemAsync(KEY_HINT_SALT, salt);
  await SecureStore.setItemAsync(KEY_HINT_HASH, await hashSecret(normalized, salt));
  await SecureStore.setItemAsync(KEY_HINT_CIPHER, await sealSecret(secret, normalized, salt));
}

export async function getLockHintQuestion(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_HINT_QUESTION);
}

/** 답이 맞으면 원래 PIN·패턴을 돌려준다. 틀리면 null — 무엇이 틀렸는지는 알려주지 않는다. */
export async function revealSecretWithHint(answer: string): Promise<string | null> {
  const [salt, hash, cipher] = await Promise.all([
    SecureStore.getItemAsync(KEY_HINT_SALT),
    SecureStore.getItemAsync(KEY_HINT_HASH),
    SecureStore.getItemAsync(KEY_HINT_CIPHER),
  ]);
  if (salt === null || hash === null || cipher === null) {
    return null;
  }
  const normalized = normalizeAnswer(answer);
  if ((await hashSecret(normalized, salt)) !== hash) {
    return null;
  }
  return openSecret(cipher, normalized, salt);
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEY_BIOMETRIC, enabled ? 'true' : 'false');
}

export async function setLockDelay(delay: LockDelay): Promise<void> {
  await setSetting(SETTING_KEYS.lockDelay, delay);
}

/** 기기가 생체인증을 지원하고 실제로 등록돼 있는가. 둘 다여야 켤 수 있다. */
export async function isBiometricAvailable(): Promise<boolean> {
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hardware && enrolled;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '조각 잠금 해제',
    // 생체가 실패했을 때 기기 암호로 넘어가면 우리 PIN/패턴을 우회하는 셈이 된다.
    disableDeviceFallback: true,
    cancelLabel: 'PIN·패턴으로 열기',
  });
  return result.success;
}

/*
 * 실패 처리는 **지연(backoff)** 이다.
 * 🚫 "N회 실패 시 데이터 삭제"는 하지 않는다 — 오작동 한 번에 일기가 사라진다(§7.1).
 */
const BACKOFF_AFTER = 5;
const BACKOFF_STEP_MS = 30_000;
const BACKOFF_MAX_MS = 300_000;

export interface FailureState {
  count: number;
  /** 이 시각까지 시도 불가. 지금 열 수 있으면 0 */
  blockedUntil: number;
}

export async function getFailureState(): Promise<FailureState> {
  const [count, blockedUntil] = await Promise.all([
    getNumberSetting(SETTING_KEYS.lockFailCount, 0),
    getNumberSetting(SETTING_KEYS.lockBlockedUntil, 0),
  ]);
  return { count, blockedUntil };
}

export async function recordFailure(): Promise<FailureState> {
  const { count } = await getFailureState();
  const next = count + 1;
  await setNumberSetting(SETTING_KEYS.lockFailCount, next);

  if (next < BACKOFF_AFTER) {
    return { count: next, blockedUntil: 0 };
  }
  const wait = Math.min((next - BACKOFF_AFTER + 1) * BACKOFF_STEP_MS, BACKOFF_MAX_MS);
  const blockedUntil = Date.now() + wait;
  await setNumberSetting(SETTING_KEYS.lockBlockedUntil, blockedUntil);
  return { count: next, blockedUntil };
}

export async function resetFailures(): Promise<void> {
  await setNumberSetting(SETTING_KEYS.lockFailCount, 0);
  await setNumberSetting(SETTING_KEYS.lockBlockedUntil, 0);
}
