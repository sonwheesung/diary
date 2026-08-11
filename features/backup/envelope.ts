/**
 * 봉투 v1 — 암호문을 감싸는 바이트 레이아웃 (BACKUP 설계).
 *
 * ⚠ **프로젝트 내부 임포트 0을 유지한다.** `@/` 별칭은 Node 단독 실행에서 해상되지 않으므로
 *   하나만 들어와도 `scripts/check-backup-crypto.mjs`가 통째로 죽는다.
 *   유도값(`kid`)·난수(`nonce`)·해시(`blobHash`)는 전부 **주입**받는다 — 이 층의 일이 아니다.
 *
 * ```
 * magic "JGKB" 4 | version 1 | suite 1 | flags 1 | kid 4 | type 1 | ctxLen 1 | context N | nonce 24
 * 암호문 ‖ tag(16)
 * ```
 *
 * **헤더 전체가 그대로 AAD다.** 목적은 적대적 운영자가 아니라 **내 업로드 코드가 파일을
 * 뒤바꾸는 사고를 소리 나게 만드는 것**이다. 그렇게 적어두지 않으면 다음 사람이 서명 체인·
 * 투명성 로그로 확장한다.
 */

/** "JGKB" */
const MAGIC = Uint8Array.of(0x4a, 0x47, 0x4b, 0x42);

export const NONCE_LENGTH = 24;
export const TAG_LENGTH = 16;
export const KID_LENGTH = 4;
export const BLOB_KEY_LENGTH = 32;
/** 세대 식별자 — 같은 seq 안에서 옛 파트와 새 파트가 섞이는 것을 막는다 */
export const GEN_ID_LENGTH = 8;

/**
 * ⚠ **`0x00~0x0F`는 실험 구간이다.** 사용자 릴리스에 절대 나가지 않는다 —
 * 백업 UI가 실린 빌드는 반드시 `0x10` 이상이어야 한다(내부 테스트도 사용자 릴리스다.
 * 테스터는 자기 진짜 일기를 쓴다). "초안"을 문서 표현이 아니라 **바이트로 강제**하는 장치다.
 */
export const VERSION_EXPERIMENTAL = 0x01;
export const VERSION_MIN_RELEASE = 0x10;

/** `0x01` = XChaCha20-Poly1305(nonce 24B, tag 16B) + HKDF-Expand-SHA256. `0x00`은 예약이라 거부한다. */
export const SUITE_XCHACHA20_POLY1305_HKDF_SHA256 = 0x01;

/** bit0 = 키가 래핑됨(KEK/DEK). **예약만 해둔다** — 켜는 순간 Play E2EE 면제가 사라진다(§법). */
export const FLAG_KEY_WRAPPED = 0b0000_0001;

export const ENVELOPE_TYPE = { manifest: 0, blob: 1, aiReport: 2 } as const;
export type EnvelopeType = (typeof ENVELOPE_TYPE)[keyof typeof ENVELOPE_TYPE];

export interface ManifestContext {
  readonly type: typeof ENVELOPE_TYPE.manifest;
  /**
   * 세대 번호. **u32다** — u64로 두면 `DataView.getBigUint64`가 BigInt를 돌려주고,
   * BigInt는 `JSON.stringify`가 throw한다. seq가 오류 코드 문자열이나 매니페스트 JSON으로
   * 흐르는 순간 터진다. 42억 세대면 하루 한 번 백업해도 1100만 년이다.
   */
  readonly seq: number;
  /**
   * 이 세대 고유의 랜덤 8B. **파트 사이의 찢어짐(torn generation)을 막는 유일한 장치다.**
   * 파트별로 독립 봉투이고 매니페스트에는 commit 단계가 없어서, 재시도 중에 서버에
   * `구 part1 + 신 part0`이 남을 수 있다. seq도 partCount도 같으니 AEAD가 전부 통과한다.
   */
  readonly genId: Uint8Array;
  readonly part: number;
  readonly partCount: number;
}

export interface BlobContext {
  readonly type: typeof ENVELOPE_TYPE.blob;
  /**
   * 이 blob이 놓일 자리(`HKDF(DEK, "jogak/blob/v1" ‖ image_id)`), 32바이트.
   *
   * ⚠ ~~`sha256(암호문)`~~ 에서 바꿨다(2026-08-11). nonce가 랜덤이라 콘텐츠 주소가
   *   성립하지 않고, 평문 해시는 서버에 "이 사진을 갖고 있는가"를 알려준다.
   *
   * 헤더 전체가 AAD이므로 **봉투가 자기 자리에 묶인다** — 다른 경로에 올려두면 개봉이 실패한다.
   */
  readonly blobKey: Uint8Array;
}

export type EnvelopeContext = ManifestContext | BlobContext;

export interface EnvelopeHeader {
  readonly version: number;
  readonly suite: number;
  readonly flags: number;
  readonly kid: Uint8Array;
  readonly context: EnvelopeContext;
  readonly nonce: Uint8Array;
}

/** 봉투 파싱·구성 실패. 화면에 띄울 오류 코드를 들고 있다(문자열은 i18n이 갖는다). */
export class EnvelopeError extends Error {
  /** ⚠ parameter property(`constructor(readonly code: ...)`)를 쓰지 않는다 — Node 타입 스트리핑이 못 지운다 */
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'EnvelopeError';
    this.code = code;
  }
}

const MANIFEST_CONTEXT_LENGTH = 4 + GEN_ID_LENGTH + 2 + 2; // seq · genId · part · partCount
const FIXED_PREFIX_LENGTH = 4 + 1 + 1 + 1 + KID_LENGTH + 1 + 1; // magic..ctxLen

function contextLength(type: number): number {
  if (type === ENVELOPE_TYPE.manifest) return MANIFEST_CONTEXT_LENGTH;
  if (type === ENVELOPE_TYPE.blob) return BLOB_KEY_LENGTH;
  throw new EnvelopeError('JGKB-E01', `알 수 없는 봉투 type ${type}`);
}

/**
 * ⚠ `new DataView(bytes.buffer)`는 **`byteOffset`을 무시한다.** 다운로드한 봉투에서
 * `subarray`로 헤더를 떼면 `.buffer`가 원본 전체를 가리켜 오프셋이 전부 어긋난다.
 * 0 오프셋 왕복 테스트로는 절대 안 잡히므로 항상 이 헬퍼를 쓴다.
 */
function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function requireLength(bytes: Uint8Array, expected: number, what: string): void {
  if (bytes.length !== expected) {
    throw new EnvelopeError('JGKB-E02', `${what}는 ${expected}바이트여야 한다 (받은 값 ${bytes.length})`);
  }
}

/** 헤더를 평문 바이트로. **이 바이트열이 그대로 AAD다.** */
export function encodeHeader(header: EnvelopeHeader): Uint8Array {
  requireLength(header.kid, KID_LENGTH, 'kid');
  requireLength(header.nonce, NONCE_LENGTH, 'nonce');

  const ctxLen = contextLength(header.context.type);
  const out = new Uint8Array(FIXED_PREFIX_LENGTH + ctxLen + NONCE_LENGTH);
  const view = viewOf(out);
  let p = 0;

  out.set(MAGIC, p);
  p += MAGIC.length;
  out[p++] = header.version;
  out[p++] = header.suite;
  out[p++] = header.flags;
  out.set(header.kid, p);
  p += KID_LENGTH;
  out[p++] = header.context.type;
  out[p++] = ctxLen;

  if (header.context.type === ENVELOPE_TYPE.manifest) {
    const { seq, genId, part, partCount } = header.context;
    if (!Number.isInteger(seq) || seq < 0 || seq > 0xffff_ffff) {
      throw new EnvelopeError('JGKB-E03', `seq가 u32 범위를 벗어났다 (${seq})`);
    }
    if (partCount < 1 || part >= partCount || part < 0 || partCount > 0xffff) {
      throw new EnvelopeError('JGKB-E04', `part ${part}/${partCount}가 올바르지 않다`);
    }
    requireLength(genId, GEN_ID_LENGTH, 'genId');
    view.setUint32(p, seq, false);
    p += 4;
    out.set(genId, p);
    p += GEN_ID_LENGTH;
    view.setUint16(p, part, false);
    p += 2;
    view.setUint16(p, partCount, false);
    p += 2;
  } else {
    requireLength(header.context.blobKey, BLOB_KEY_LENGTH, 'blobKey');
    out.set(header.context.blobKey, p);
    p += BLOB_KEY_LENGTH;
  }

  out.set(header.nonce, p);
  return out;
}

export interface ParsedEnvelope {
  readonly header: EnvelopeHeader;
  /**
   * 잘라낸 **원본** 헤더 바이트. 재인코딩본을 AAD로 쓰면 인코더 버그가 조용히
   * 자기 자신과 일치해버린다 — 받은 바이트를 그대로 쓴다.
   */
  readonly aad: Uint8Array;
  /** 암호문 ‖ tag(16B) */
  readonly sealed: Uint8Array;
}

/**
 * 봉투를 연다. **복호화는 하지 않는다** — 헤더를 읽고 AAD와 본문을 잘라줄 뿐이다.
 *
 * ⚠ 알 수 없는 `type`은 **거부한다.** `ctxLen`이 있어 건너뛸 수는 있지만, 모르는 타입을
 *   조용히 넘기면 "읽었는데 아무것도 없다"가 된다. `type=2`(AI 리포트)를 켜는 것은
 *   `version`을 올리는 변경이다.
 */
export function parseEnvelope(bytes: Uint8Array): ParsedEnvelope {
  if (bytes.length < FIXED_PREFIX_LENGTH) {
    throw new EnvelopeError('JGKB-E05', '봉투가 헤더보다 짧다');
  }
  for (let i = 0; i < MAGIC.length; i += 1) {
    if (bytes[i] !== MAGIC[i]) {
      throw new EnvelopeError('JGKB-E06', '조각 백업 파일이 아니다');
    }
  }

  const version = bytes[4];
  const suite = bytes[5];
  const flags = bytes[6];
  const kid = bytes.subarray(7, 7 + KID_LENGTH);
  const type = bytes[7 + KID_LENGTH];
  const declaredCtxLen = bytes[8 + KID_LENGTH];

  if (suite !== SUITE_XCHACHA20_POLY1305_HKDF_SHA256) {
    throw new EnvelopeError('JGKB-E07', `지원하지 않는 suite 0x${suite.toString(16)}`);
  }
  // type 검사가 곧 ctxLen 검사다 — 선언값과 다르면 만든 쪽과 읽는 쪽의 규약이 어긋난 것이다.
  const ctxLen = contextLength(type);
  if (declaredCtxLen !== ctxLen) {
    throw new EnvelopeError('JGKB-E08', `type ${type}의 context 길이가 ${declaredCtxLen}로 선언됐다 (기대 ${ctxLen})`);
  }

  const headerLength = FIXED_PREFIX_LENGTH + ctxLen + NONCE_LENGTH;
  if (bytes.length < headerLength + TAG_LENGTH) {
    throw new EnvelopeError('JGKB-E05', '봉투가 헤더+태그보다 짧다');
  }

  const view = viewOf(bytes);
  let p = FIXED_PREFIX_LENGTH;
  let context: EnvelopeContext;

  if (type === ENVELOPE_TYPE.manifest) {
    const seq = view.getUint32(p, false);
    const genId = bytes.subarray(p + 4, p + 4 + GEN_ID_LENGTH);
    const part = view.getUint16(p + 4 + GEN_ID_LENGTH, false);
    const partCount = view.getUint16(p + 6 + GEN_ID_LENGTH, false);
    if (partCount < 1 || part >= partCount) {
      throw new EnvelopeError('JGKB-E04', `part ${part}/${partCount}가 올바르지 않다`);
    }
    context = { type: ENVELOPE_TYPE.manifest, seq, genId, part, partCount };
  } else {
    context = { type: ENVELOPE_TYPE.blob, blobKey: bytes.subarray(p, p + BLOB_KEY_LENGTH) };
  }
  p += ctxLen;

  return {
    header: { version, suite, flags, kid, context, nonce: bytes.subarray(p, p + NONCE_LENGTH) },
    aad: bytes.subarray(0, headerLength),
    sealed: bytes.subarray(headerLength),
  };
}

/** 헤더 바이트와 봉인된 본문을 하나로 붙인다. */
export function packEnvelope(headerBytes: Uint8Array, sealed: Uint8Array): Uint8Array {
  const out = new Uint8Array(headerBytes.length + sealed.length);
  out.set(headerBytes, 0);
  out.set(sealed, headerBytes.length);
  return out;
}

/**
 * 같은 세대의 파트가 빠짐없이 정확히 한 번씩 모였는지 확인한다.
 *
 * 서버가 주는 목록은 **인증되지 않은 메타데이터**다. 파트가 하나라도 모자라거나 중복이거나
 * `genId`가 섞였으면 **세대 전체를 거부한다** — 반쪽 매니페스트로 복원하면 그만큼이
 * 조용히 사라진다. 스크래치 DB 구조라 중단 비용은 0이다.
 */
export function assertCompleteGeneration(headers: readonly ManifestContext[]): void {
  if (headers.length === 0) {
    throw new EnvelopeError('JGKB-E09', '매니페스트 파트가 없다');
  }
  const [first] = headers;
  const seen = new Set<number>();
  for (const context of headers) {
    if (context.seq !== first.seq || context.partCount !== first.partCount) {
      throw new EnvelopeError('JGKB-E10', '서로 다른 세대의 파트가 섞였다');
    }
    for (let i = 0; i < GEN_ID_LENGTH; i += 1) {
      if (context.genId[i] !== first.genId[i]) {
        throw new EnvelopeError('JGKB-E10', '서로 다른 세대의 파트가 섞였다 (genId 불일치)');
      }
    }
    if (seen.has(context.part)) {
      throw new EnvelopeError('JGKB-E11', `파트 ${context.part}가 중복됐다`);
    }
    seen.add(context.part);
  }
  if (seen.size !== first.partCount) {
    throw new EnvelopeError('JGKB-E12', `파트가 모자란다 (${seen.size}/${first.partCount})`);
  }
}
