/**
 * 복구 코드 — Crockford Base32.
 *
 * ⚠ **프로젝트 내부 임포트 0.** Node 단독 검증을 위해서다(`envelope.ts`와 같은 규칙).
 *
 * ⚠⚠ **이 파일의 형식은 한 번 발급하면 되돌릴 수 없다.** 사용자가 종이에 적어둔 값이
 *    앱과 달라지면 그 사람은 백업을 영원히 못 연다. 아래 네 가지가 그 지점이다:
 *      ① 128비트(26심볼) ② MSB-first + 하위 2비트 0 패딩
 *      ③ 체크심볼 = **128비트 정수** mod 37 (패딩 포함 130비트 값이 아니다)
 *      ④ 표시는 4자씩 6그룹 + 3자
 *
 * **왜 256비트가 아니라 128비트인가.** 256비트면 53자, 128비트면 27자다. 128비트는 무차별
 * 대입으로 깨지지 않으므로(2^128) 실질 보안은 같고, 이 기능의 실제 실패 모드는 해독이 아니라
 * **오타와 분실**이다. 손으로 옮겨 적는 글자 수를 절반으로 줄이는 쪽이 훨씬 크게 이긴다.
 * DEK(256비트)는 이 코드에서 HKDF로 유도한다(`key-derive.ts`).
 */

/** Crockford Base32 — 혼동을 낳는 I·L·O·U를 뺀 32심볼 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
/** 체크심볼은 37진법이다 — 위 32개 + 5개. `U`는 **체크 자리에서만** 유효하다 */
const CHECK_ALPHABET = `${ALPHABET}*~$=U`;

/** 복구 코드가 담는 비밀의 크기. DEK가 아니라 **DEK를 유도하는 씨앗**이다 */
export const SECRET_LENGTH = 16;
/** 16바이트 → ceil(128/5) */
export const DATA_SYMBOLS = 26;
/** 데이터 + 체크심볼 1 */
export const TOTAL_SYMBOLS = DATA_SYMBOLS + 1;
const GROUP_SIZE = 4;

export class RecoveryCodeError extends Error {
  /** ⚠ parameter property는 Node 타입 스트리핑이 못 지운다(`erasableSyntaxOnly`가 잡는다) */
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'RecoveryCodeError';
    this.code = code;
  }
}

/** 128비트 빅엔디안 정수를 37로 나눈 나머지. BigInt 없이 바이트를 훑는다 */
function checkValue(secret: Uint8Array): number {
  let acc = 0;
  for (const byte of secret) {
    acc = (acc * 256 + byte) % 37;
  }
  return acc;
}

/**
 * 표시용 문자열로. 그룹 구분은 **보기 좋으라고** 넣는 것이고 디코드는 전부 무시한다.
 * `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXX`
 */
export function encodeRecoveryCode(secret: Uint8Array): string {
  if (secret.length !== SECRET_LENGTH) {
    throw new RecoveryCodeError('JGKB-C01', `비밀은 ${SECRET_LENGTH}바이트여야 한다 (받은 값 ${secret.length})`);
  }

  // MSB-first 비트스트림. 마지막 심볼의 남는 하위 2비트는 0으로 채운다.
  let symbols = '';
  let acc = 0;
  let bits = 0;
  for (const byte of secret) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      symbols += ALPHABET[(acc >>> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    symbols += ALPHABET[(acc << (5 - bits)) & 0x1f];
  }
  symbols += CHECK_ALPHABET[checkValue(secret)];

  const groups: string[] = [];
  for (let i = 0; i < symbols.length; i += GROUP_SIZE) {
    groups.push(symbols.slice(i, i + GROUP_SIZE));
  }
  return groups.join('-');
}

/**
 * 입력을 정규형으로. **관대하게 받는다** — 사용자가 어떤 모양으로 적어뒀든 통과해야 한다.
 * 공백·하이픈·대소문자를 무시하고, Crockford 규약대로 혼동 문자를 흡수한다(O→0, I·L→1).
 * ⚠ O·I·L은 두 알파벳 어디에도 없으므로 체크 자리에 적용해도 안전하다.
 */
export function normalizeRecoveryCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^0-9A-Z*~$=]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
}

/**
 * 코드를 비밀 바이트로. 실패는 **왜 실패했는지 구분해서** 던진다 —
 * "코드가 틀렸어요" 하나로 뭉치면 오타 한 글자와 남의 코드를 구별할 수 없다.
 */
export function decodeRecoveryCode(input: string): Uint8Array {
  const normalized = normalizeRecoveryCode(input);
  if (normalized.length !== TOTAL_SYMBOLS) {
    throw new RecoveryCodeError(
      'JGKB-C02',
      `코드는 ${TOTAL_SYMBOLS}자여야 한다 (받은 값 ${normalized.length}자)`,
    );
  }

  const data = normalized.slice(0, DATA_SYMBOLS);
  const check = normalized.slice(DATA_SYMBOLS);

  const secret = new Uint8Array(SECRET_LENGTH);
  let acc = 0;
  let bits = 0;
  let written = 0;
  for (const symbol of data) {
    const value = ALPHABET.indexOf(symbol);
    if (value < 0) {
      throw new RecoveryCodeError('JGKB-C03', `코드에 쓸 수 없는 문자가 있다 (${symbol})`);
    }
    acc = (acc << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      secret[written++] = (acc >>> bits) & 0xff;
    }
  }
  /*
   * 남은 2비트는 패딩이라 반드시 0이다. 0이 아니면 **정규형이 아닌 입력**이고,
   * 이걸 통과시키면 서로 다른 코드 문자열이 같은 비밀로 디코드된다.
   */
  if (bits > 0 && (acc & ((1 << bits) - 1)) !== 0) {
    throw new RecoveryCodeError('JGKB-C04', '코드의 마지막 글자가 올바르지 않다');
  }

  const expected = CHECK_ALPHABET[checkValue(secret)];
  if (check !== expected) {
    throw new RecoveryCodeError('JGKB-C05', '코드를 다시 확인해 주세요 (검사 문자 불일치)');
  }
  return secret;
}

/**
 * 대조 확인용 — 지정한 그룹만 맞는지 본다.
 *
 * 발급 직후 "몇 그룹을 되받아" 보관 여부를 확인하는 데 쓴다. **코드를 가진 유일한 순간이
 * 그때**이고, 그 뒤로는 보관본이 없는 사람에게 앱이 해줄 수 있는 일이 없다.
 */
export function matchesGroup(input: string, secret: Uint8Array, groupIndex: number): boolean {
  const full = normalizeRecoveryCode(encodeRecoveryCode(secret));
  const start = groupIndex * GROUP_SIZE;
  if (start >= full.length) return false;
  return normalizeRecoveryCode(input) === full.slice(start, start + GROUP_SIZE);
}

/** 대조 확인에 쓸 수 있는 그룹 수 */
export function groupCount(): number {
  return Math.ceil(TOTAL_SYMBOLS / GROUP_SIZE);
}
