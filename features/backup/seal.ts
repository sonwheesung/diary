/**
 * 봉인·개봉 — XChaCha20-Poly1305.
 *
 * ⚠ **프로젝트 내부 임포트 0.**
 *
 * nonce가 192비트라 랜덤 생성이 안전하다(재사용 확률이 무시할 수준). 그래서 키 유도 없이
 * 매번 새 nonce를 쓸 수 있고, 그 대가로 **스트리밍이 안 된다** — 태그가 끝에 한 번 붙어서
 * 부분 복호화·재개가 원리적으로 불가능하다. 큰 매니페스트를 나누려면 봉투 파트를 쓴다.
 */
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';

export const KEY_LENGTH = 32;
export const NONCE_LENGTH = 24;
export const TAG_LENGTH = 16;

export interface SealInput {
  /** 봉인할 평문 */
  readonly plaintext: Uint8Array;
  readonly key: Uint8Array;
  /** 24바이트. **매번 새로 만든다** — 같은 키에 nonce를 재사용하면 Poly1305 키가 드러난다 */
  readonly nonce: Uint8Array;
  /** 봉투 헤더 바이트 전체 */
  readonly aad: Uint8Array;
}

export interface OpenInput {
  /** 암호문 ‖ tag(16B) */
  readonly sealed: Uint8Array;
  readonly key: Uint8Array;
  readonly nonce: Uint8Array;
  readonly aad: Uint8Array;
}

/*
 * ⚠ 인자를 **객체로 받는다.** `seal(bytes, key, nonce, aad)`처럼 위치 인자 4개가 전부
 *   `Uint8Array`면 순서를 바꿔 넣어도 `tsc`가 통과한다. key·nonce는 길이 검증에 걸려
 *   터지지만 **plaintext와 aad를 맞바꾸면 조용히 돌아가고 왕복 테스트도 통과한다** —
 *   그리고 서버에 올라간 데이터가 영구히 안 열린다.
 */

/** 반환값 = 암호문 ‖ tag(16B) */
export function seal({ plaintext, key, nonce, aad }: SealInput): Uint8Array {
  return xchacha20poly1305(key, nonce, aad).encrypt(plaintext);
}

/**
 * 태그·AAD가 어긋나면 noble이 던진다. **삼키지 않는다** —
 * 조용히 빈 값을 돌려주는 것이 이 계층에서 가장 비싼 실패다.
 */
export function open({ sealed, key, nonce, aad }: OpenInput): Uint8Array {
  return xchacha20poly1305(key, nonce, aad).decrypt(sealed);
}
