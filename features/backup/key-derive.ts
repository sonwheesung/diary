/**
 * 복구 코드에서 키를 유도한다 — HKDF-SHA256 (RFC 5869), **Extract + Expand**.
 *
 * ⚠ **프로젝트 내부 임포트 0.** 새 기기가 복구 코드만으로 `vault_id`를 계산해 조회하는 것이
 *   부트스트랩의 전제라 이 층이 순수해야 하고, KAT를 Node에서 돌려야 한다.
 *
 * ⚠⚠ **한때 "Expand only로 간다"고 정했는데 성립하지 않는다.** RFC 5869 §2.3이
 *    *"PRK: a pseudorandom key of **at least HashLen** octets"* 를 요구하므로 16바이트
 *    복구 코드는 PRK 자리에 올 수 없다(noble도 거부한다 — KAT가 이걸 잡았다).
 *    "입력이 이미 균일하니 Extract가 불필요하다"는 **엔트로피** 얘기였고, 길이 요건은 별개다.
 *    Extract가 정확히 이 일(짧은 IKM → HashLen PRK)을 하라고 있는 단계다. salt는 비운다.
 *
 * ⚠ 그리고 "자체 Expand 구현으로 못박는다"도 틀렸었다 — `@noble/hashes/hkdf.js`가
 *   `hkdf()`·`extract()`·`expand()`를 전부 export한다. 감사받은 암호 코드를 손으로
 *   다시 쓸 이유가 없다.
 */
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

/** XChaCha20-Poly1305 키 길이 */
export const DEK_LENGTH = 32;
export const VAULT_ID_LENGTH = 16;
export const KID_LENGTH = 4;

/*
 * ⚠ info 문자열은 **US-ASCII 바이트 그대로**다. NUL 종단도, 길이 접두도 없다.
 *   여기가 어긋나면 키가 통째로 달라지는데 **자기 왕복 테스트로는 100% 통과한다**
 *   (양쪽이 같은 코드를 쓰니까). 그래서 KAT에 고정 벡터로 박아둔다.
 *
 * ⚠ 출력 길이 L은 **필요한 바이트 수와 정확히 같다.** 긴 걸 뽑아 잘라 쓰지 않는다 —
 *   SHA-256에서는 우연히 같은 값이 나와 규칙이 없다는 걸 아무도 못 깨닫다가,
 *   해시를 바꾸는 날 전부 깨진다.
 */
const INFO_DEK = asciiBytes('jogak/dek/v1');
const INFO_VAULT_ID = asciiBytes('jogak/vault-id/v1');
const INFO_KID = asciiBytes('jogak/kid/v1');
const INFO_AUTH = asciiBytes('jogak/auth/v1');
const INFO_BLOB = asciiBytes('jogak/blob/v1');

/** `TextEncoder`를 쓰지 않는다 — RN과 Node 양쪽에서 임포트 0으로 돌아야 한다 */
function asciiBytes(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`info는 ASCII여야 한다: ${text}`);
    }
    out[i] = code;
  }
  return out;
}

/**
 * RFC 5869 HKDF-SHA256. **salt는 비운다**(RFC 규정대로 HashLen 길이의 0으로 대체된다) —
 * 복구 코드는 CSPRNG 출력이라 salt가 더할 것이 없고, 새 기기가 코드만으로 같은 값을
 * 재현해야 하므로 salt를 둘 곳도 없다.
 */
export function deriveKey(secret: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  return hkdf(sha256, secret, undefined, info, length);
}

/** 실제 암·복호에 쓰는 256비트 키 */
export function deriveDek(secret: Uint8Array): Uint8Array {
  return deriveKey(secret, INFO_DEK, DEK_LENGTH);
}

/**
 * 서버에서 내 금고를 찾는 이름.
 *
 * ⚠ **자격증명이 아니다.** 서버 DB와 로그에 평문으로 존재한다 — 이걸 아는 것만으로
 *   읽거나 지울 수 있게 만들면 안 된다(인가는 별도).
 */
export function deriveVaultId(secret: Uint8Array): Uint8Array {
  return deriveKey(secret, INFO_VAULT_ID, VAULT_ID_LENGTH);
}

/** 봉투 헤더에 실리는 키 식별자. 어떤 코드로 잠갔는지 대조하는 용도 */
export function deriveKid(secret: Uint8Array): Uint8Array {
  return deriveKey(secret, INFO_KID, KID_LENGTH);
}

/**
 * 되찾기·삭제를 인가하는 값.
 *
 * ⚠ **서버는 이걸 `sha256`으로만 저장한다.** 그래서 서버 DB가 통째로 새도 되찾기 권한은
 *   안 샌다. 대칭 비밀이라 요청 중에는 평문으로 전송되지만 **절대 로그에 남기지 않는다.**
 *
 * ⚠ `vault_id`와 **다른 값이어야 한다.** vault_id는 서버 DB·로그에 평문으로 있으므로,
 *   같은 값을 인가에 쓰면 "이름을 아는 사람이 곧 주인"이 된다.
 */
export function deriveAuthKey(secret: Uint8Array): string {
  return toHex(deriveKey(secret, INFO_AUTH, 32));
}

/**
 * 사진 blob이 서버에서 놓일 자리.
 *
 * ⚠ **콘텐츠 주소가 아니다.** `sha256(암호문)`은 nonce가 랜덤이라 같은 사진도 매번 달라져
 *   재시도가 중복을 쌓고, `sha256(평문)`은 **서버가 "이 사용자가 이 사진을 갖고 있는가"를
 *   확인할 수 있게 된다**(알려진 이미지 해시와 대조). 둘 다 안 된다.
 *
 * 이미지 하나 = blob 하나이고, **재업로드가 같은 경로를 덮는다**(멱등).
 * 중복 제거는 하지 않는다 — 축소된 사진이 장당 ~300KB라 그 낭비가 개인정보 위험보다 싸다.
 */
export function deriveBlobKey(secret: Uint8Array, imageId: string): string {
  const id = new Uint8Array(imageId.length);
  for (let i = 0; i < imageId.length; i += 1) {
    const code = imageId.charCodeAt(i);
    // image_id는 UUID(ASCII)다. 아니면 유도가 기기마다 갈릴 수 있으므로 막는다.
    if (code > 0x7f) {
      throw new Error('image_id는 ASCII여야 한다');
    }
    id[i] = code;
  }
  const info = new Uint8Array(INFO_BLOB.length + id.length);
  info.set(INFO_BLOB, 0);
  info.set(id, INFO_BLOB.length);
  return toHex(deriveKey(secret, info, 32));
}

/**
 * `vault_id`의 **정본 표현은 소문자 hex 32자다.** DB 컬럼·서명 URL 경로·오류 코드가
 * 전부 이 표현을 쓴다 — 한 곳이라도 다르면 이미 올린 백업을 못 찾고, 되돌리려면
 * 전 사용자가 다시 올려야 한다.
 */
export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, '0');
  }
  return out;
}
