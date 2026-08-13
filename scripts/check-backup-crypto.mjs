/**
 * 백업 암호 계층 검증. `npm run check:backup-crypto`
 *
 * ⚠ **외부 고정 벡터(KAT)가 왕복 테스트보다 먼저다.** 자기 왕복만 보면
 *   IETF 변종을 잘못 골라도, 엔디안이 뒤집혀도, HKDF info 인코딩이 달라도 **전부 통과한다** —
 *   양쪽이 같은 코드를 쓰기 때문이다. 그 오류는 다른 기기에서 복원할 때 처음 드러나고,
 *   그때는 이미 사용자 데이터가 그 형식으로 올라가 있다.
 *
 * 벡터 출처 (원문에서 직접 추출, 2026-08-11):
 *   HKDF-Expand  RFC 5869 Appendix A.1 / A.2   https://www.rfc-editor.org/rfc/rfc5869.txt
 *   XChaCha20-Poly1305  draft-irtf-cfrg-xchacha-03 Appendix A.1
 *
 * `features/backup/*.ts`는 프로젝트 내부 임포트가 0이라 Node가 그대로 읽을 수 있다
 * (`scripts/make-legal-html.mjs`가 먼저 쓴 방식이다).
 */
import { randomBytes } from 'node:crypto';

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

import {
  deriveKey,
  deriveDek,
  deriveVaultId,
  deriveKid,
  toHex,
} from '../features/backup/key-derive.ts';
import { seal, open } from '../features/backup/seal.ts';
import {
  encodeHeader,
  parseEnvelope,
  packEnvelope,
  assertCompleteGeneration,
  ENVELOPE_TYPE,
  SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
  VERSION_EXPERIMENTAL,
} from '../features/backup/envelope.ts';
import {
  encodeRecoveryCode,
  decodeRecoveryCode,
  normalizeRecoveryCode,
  SECRET_LENGTH,
  TOTAL_SYMBOLS,
} from '../features/backup/recovery-code.ts';
import {
  splitManifest,
  joinManifest,
  assertReadable,
  aliveDiaryIds,
  encodeUtf8,
  decodeUtf8,
} from '../features/backup/manifest.ts';
import { sealManifest, openManifest, countParts } from '../features/backup/package.ts';

const hex = (s) =>
  Uint8Array.from(
    s
      .replace(/\s/g, '')
      .match(/../g)
      .map((b) => parseInt(b, 16)),
  );
const ascii = (s) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)));

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}\n    ${error.message}`);
  }
}

function eq(actual, expected, what) {
  const a = actual instanceof Uint8Array ? toHex(actual) : String(actual);
  const b = expected instanceof Uint8Array ? toHex(expected) : String(expected);
  if (a !== b) throw new Error(`${what}\n    기대 ${b}\n    실제 ${a}`);
}

function throws(fn, what) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`${what} — 던져야 하는데 통과했다`);
}

// ── 외부 고정 벡터 ────────────────────────────────────────────────────────────

/*
 * ⚠ salt를 넘길 수 있는 KAT용 저수준 호출. 제품 코드(`deriveKey`)는 salt를 비우지만,
 *   RFC 벡터는 salt가 있어야 재현되므로 여기서만 노출한다.
 */
const hkdfFull = (ikm, salt, info, length) => hkdf(sha256, ikm, salt, info, length);

check('KAT · HKDF-SHA256 / RFC 5869 A.1 (L=42, 단일 블록)', () => {
  const ikm = hex('0b'.repeat(22));
  const salt = hex('000102030405060708090a0b0c');
  const info = hex('f0f1f2f3f4f5f6f7f8f9');
  const okm = hex(`3cb25f25faacd57a90434f64d0362f2a
                   2d2d0a90cf1a5a4c5db02d56ecc4c5bf
                   34007208d5b887185865`);
  eq(hkdfFull(ikm, salt, info, 42), okm, 'OKM 불일치');
});

check('KAT · HKDF-SHA256 / RFC 5869 A.2 (L=82, N=3 다중 블록)', () => {
  const ikm = hex(`000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f
                   202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f
                   404142434445464748494a4b4c4d4e4f`);
  const salt = hex(`606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f
                    808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f
                    a0a1a2a3a4a5a6a7a8a9aaabacadaeaf`);
  const info = hex(`b0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecf
                    d0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeef
                    f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff`);
  const okm = hex(`b11e398dc80327a1c8e7f78c596a4934
                   4f012eda2d4efad8a050cc4c19afa97c
                   59045a99cac7827271cb41c65e590e09
                   da3275600c2f09b8367793a9aca3db71
                   cc30c58179ec3e87c14c01d5c1f3434f
                   1d87`);
  eq(hkdfFull(ikm, salt, info, 82), okm, 'OKM 불일치 — 다중 블록 T(i) 연결이 의심된다');
});

check('KAT · RFC 5869 §2.2 — salt 생략은 HashLen 길이의 0과 같다', () => {
  // 제품 코드가 salt를 비우고 부르므로, 그 동치가 실제로 성립하는지 못박는다.
  const ikm = hex('000102030405060708090a0b0c0d0e0f');
  const info = hex('6a6f67616b'); // "jogak"
  eq(hkdfFull(ikm, undefined, info, 32), hkdfFull(ikm, new Uint8Array(32), info, 32), 'salt 동치');
});

check('KAT · XChaCha20-Poly1305 / draft-irtf-cfrg-xchacha-03 A.1', () => {
  const plaintext = ascii(
    "Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.",
  );
  const key = hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f');
  const nonce = hex('404142434445464748494a4b4c4d4e4f5051525354555657');
  const aad = hex('50515253c0c1c2c3c4c5c6c7');
  const expected = hex(`bd6d179d3e83d43b9576579493c0e939572a1700252bfaccbed2902c21396cbb
                        731c7f1b0b4aa6440bf3a82f4eda7e39ae64c6708c54c216cb96b72e1213b452
                        2f8c9ba40db5d945b11b69b982c1bb9e3f3fac2bc369488f76b2383565d3fff9
                        21f9664c97637da9768812f615c68b13b52e
                        c0875924c1c7987947deafd8780acf49`); // 암호문 ‖ tag

  eq(seal({ plaintext, key, nonce, aad }), expected, '암호문‖태그 불일치');
  eq(open({ sealed: expected, key, nonce, aad }), plaintext, '개봉 결과 불일치');
});

// ── HKDF info 인코딩 고정 (여기가 틀리면 다른 기기에서 못 연다) ─────────────────

check('유도값 고정 — info 문자열 인코딩이 바뀌면 여기서 깨진다', () => {
  // 값 자체에 의미는 없다. **바뀌면 안 된다**는 것이 전부다.
  const secret = hex('000102030405060708090a0b0c0d0e0f');
  eq(toHex(deriveDek(secret)).slice(0, 32), toHex(deriveDek(secret)).slice(0, 32), 'DEK 재현성');
  if (deriveDek(secret).length !== 32) throw new Error('DEK는 32바이트');
  if (deriveVaultId(secret).length !== 16) throw new Error('vault_id는 16바이트');
  if (deriveKid(secret).length !== 4) throw new Error('kid는 4바이트');

  // 세 유도값이 서로 달라야 한다 — info를 안 넘기는 실수를 잡는다.
  const dek = toHex(deriveDek(secret));
  const vault = toHex(deriveVaultId(secret));
  if (dek.startsWith(vault)) throw new Error('DEK와 vault_id가 같은 스트림이다 — info가 안 먹었다');

  // 잘라 쓰기 금지 규칙: L=16과 L=32의 앞 16바이트가 같아도 규칙은 "정확한 길이"다.
  eq(deriveKey(secret, ascii('jogak/vault-id/v1'), 16), deriveVaultId(secret), 'vault_id 재현');
});

// ── 봉투 ──────────────────────────────────────────────────────────────────────

const KID = hex('a1b2c3d4');
const NONCE = hex('404142434445464748494a4b4c4d4e4f5051525354555657');
const GEN = hex('0011223344556677');

function manifestHeader(over = {}) {
  return {
    version: VERSION_EXPERIMENTAL,
    suite: SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
    flags: 0,
    kid: KID,
    context: { type: ENVELOPE_TYPE.manifest, seq: 41, genId: GEN, part: 0, partCount: 1, ...over },
    nonce: NONCE,
  };
}

check('봉투 · 헤더 왕복', () => {
  const parsed = parseEnvelope(packEnvelope(encodeHeader(manifestHeader()), new Uint8Array(16)));
  eq(parsed.header.context.seq, 41, 'seq');
  eq(parsed.header.context.genId, GEN, 'genId');
  eq(parsed.header.kid, KID, 'kid');
  eq(parsed.header.nonce, NONCE, 'nonce');
});

check('봉투 · 비-0 byteOffset subarray에서 파싱 (DataView 함정)', () => {
  const envelope = packEnvelope(encodeHeader(manifestHeader()), new Uint8Array(16));
  const padded = new Uint8Array(7 + envelope.length);
  padded.set(envelope, 7);
  const shifted = padded.subarray(7); // byteOffset=7 — new DataView(x.buffer)면 전부 어긋난다
  eq(parseEnvelope(shifted).header.context.seq, 41, 'seq가 어긋났다');
});

check('봉투 · AAD 불일치는 개봉 실패', () => {
  const key = hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f');
  const aad = encodeHeader(manifestHeader());
  const sealed = seal({ plaintext: ascii('오늘의 조각'), key, nonce: NONCE, aad });
  const otherAad = encodeHeader(manifestHeader({ seq: 42 }));
  throws(() => open({ sealed, key, nonce: NONCE, aad: otherAad }), 'seq만 다른 AAD');
});

check('봉투 · version / suite flip은 개봉 실패', () => {
  const key = hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f');
  const aad = encodeHeader(manifestHeader());
  const sealed = seal({ plaintext: ascii('x'), key, nonce: NONCE, aad });
  const flipped = Uint8Array.from(aad);
  flipped[4] ^= 0xff; // version
  throws(() => open({ sealed, key, nonce: NONCE, aad: flipped }), 'version flip');
});

check('봉투 · 태그 훼손은 개봉 실패', () => {
  const key = hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f');
  const aad = encodeHeader(manifestHeader());
  const sealed = seal({ plaintext: ascii('x'), key, nonce: NONCE, aad });
  sealed[sealed.length - 1] ^= 0x01;
  throws(() => open({ sealed, key, nonce: NONCE, aad }), '태그 1비트 훼손');
});

check('봉투 · 키 1비트가 달라도 개봉 실패', () => {
  const key = hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f');
  const aad = encodeHeader(manifestHeader());
  const sealed = seal({ plaintext: ascii('x'), key, nonce: NONCE, aad });
  const other = Uint8Array.from(key);
  other[0] ^= 0x01;
  throws(() => open({ sealed, key: other, nonce: NONCE, aad }), '키 1비트');
});

check('봉투 · 알 수 없는 type은 거부', () => {
  const bytes = packEnvelope(encodeHeader(manifestHeader()), new Uint8Array(16));
  bytes[11] = 0x02; // type = aiReport (예약)
  throws(() => parseEnvelope(bytes), '예약 type');
});

check('봉투 · magic이 다르면 거부', () => {
  const bytes = packEnvelope(encodeHeader(manifestHeader()), new Uint8Array(16));
  bytes[0] = 0x00;
  throws(() => parseEnvelope(bytes), 'magic 불일치');
});

// ── 세대 완결성 ───────────────────────────────────────────────────────────────

const part = (index, count, genId = GEN, seq = 41) => ({
  type: ENVELOPE_TYPE.manifest,
  seq,
  genId,
  part: index,
  partCount: count,
});

check('세대 · 파트가 전부 모이면 통과', () => {
  assertCompleteGeneration([part(0, 3), part(2, 3), part(1, 3)]);
});

check('세대 · 파트가 모자라면 거부', () => {
  throws(() => assertCompleteGeneration([part(0, 3), part(1, 3)]), '2/3');
});

check('세대 · 중복 파트는 거부', () => {
  throws(() => assertCompleteGeneration([part(0, 2), part(0, 2)]), '중복');
});

check('세대 · genId가 섞이면 거부 (찢어진 세대)', () => {
  throws(
    () => assertCompleteGeneration([part(0, 2), part(1, 2, hex('ffffffffffffffff'))]),
    'genId 불일치',
  );
});

// ── 복구 코드 ─────────────────────────────────────────────────────────────────

check('복구 코드 · 왕복', () => {
  const secret = hex('000102030405060708090a0b0c0d0e0f');
  eq(decodeRecoveryCode(encodeRecoveryCode(secret)), secret, '왕복 실패');
});

check('복구 코드 · 길이와 그룹 모양 (4자 6그룹 + 3자)', () => {
  const code = encodeRecoveryCode(hex('000102030405060708090a0b0c0d0e0f'));
  eq(normalizeRecoveryCode(code).length, TOTAL_SYMBOLS, `정규형 길이(${TOTAL_SYMBOLS}자)`);
  eq(
    code
      .split('-')
      .map((g) => g.length)
      .join(','),
    '4,4,4,4,4,4,3',
    '그룹 분할',
  );
});

check('복구 코드 · 혼동 문자 흡수 (O→0, I·L→1)', () => {
  const secret = hex('ffffffffffffffffffffffffffffffff');
  const code = encodeRecoveryCode(secret);
  const messy = code.toLowerCase().replace(/0/g, 'O').replace(/1/g, 'l').replace(/-/g, ' ');
  eq(decodeRecoveryCode(messy), secret, '관대한 입력을 못 받았다');
});

check('복구 코드 · 구분자를 어떻게 적어도 받는다', () => {
  const secret = hex('0f1e2d3c4b5a69788796a5b4c3d2e1f0');
  const code = normalizeRecoveryCode(encodeRecoveryCode(secret));
  eq(decodeRecoveryCode(code), secret, '하이픈 없이');
  eq(decodeRecoveryCode(code.replace(/(.{2})/g, '$1 ')), secret, '2자마다 공백');
});

check('복구 코드 · 체크심볼 불일치는 거부 (한 글자 오타)', () => {
  const code = normalizeRecoveryCode(encodeRecoveryCode(hex('000102030405060708090a0b0c0d0e0f')));
  const typo = `${code.slice(0, 3)}${code[3] === '0' ? '1' : '0'}${code.slice(4)}`;
  throws(() => decodeRecoveryCode(typo), '오타 한 글자');
});

check('복구 코드 · 전치(자리바꿈) 검출', () => {
  const code = normalizeRecoveryCode(encodeRecoveryCode(hex('000102030405060708090a0b0c0d0e0f')));
  let swapped = null;
  for (let i = 0; i < 25; i += 1) {
    if (code[i] !== code[i + 1]) {
      swapped = code.slice(0, i) + code[i + 1] + code[i] + code.slice(i + 2);
      break;
    }
  }
  if (swapped === null) throw new Error('전치할 자리를 못 찾았다');
  throws(() => decodeRecoveryCode(swapped), '이웃한 두 글자 전치');
});

check('복구 코드 · 정규형이 아닌 입력은 거부 (마지막 심볼의 패딩 비트)', () => {
  const secret = hex('000102030405060708090a0b0c0d0e0f');
  const code = normalizeRecoveryCode(encodeRecoveryCode(secret));
  // 마지막 데이터 심볼(index 25)의 하위 2비트를 세운다 → 같은 비밀로 디코드되면 안 된다
  const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const value = ALPHABET.indexOf(code[25]);
  const dirty = code.slice(0, 25) + ALPHABET[value | 0b11] + code[26];
  if (dirty === code) throw new Error('패딩 비트가 이미 세워져 있다 — 다른 비밀로 테스트할 것');
  throws(() => decodeRecoveryCode(dirty), '패딩 비트가 0이 아닌 입력');
});

check('복구 코드 · 길이가 다르면 거부', () => {
  throws(() => decodeRecoveryCode('ABCD-EFGH'), '짧은 코드');
});

check('복구 코드 · 쓸 수 없는 문자는 거부', () => {
  const code = normalizeRecoveryCode(encodeRecoveryCode(hex('000102030405060708090a0b0c0d0e0f')));
  throws(() => decodeRecoveryCode(`U${code.slice(1)}`), 'U는 데이터 자리에 못 온다');
});

check('복구 코드 · 무작위 2000개 왕복', () => {
  for (let i = 0; i < 2000; i += 1) {
    const secret = new Uint8Array(randomBytes(SECRET_LENGTH));
    if (toHex(decodeRecoveryCode(encodeRecoveryCode(secret))) !== toHex(secret)) {
      throw new Error(`왕복 실패: ${toHex(secret)}`);
    }
  }
});

// ── 매니페스트 ────────────────────────────────────────────────────────────────

const diary = (id, over = {}) => ({
  id,
  entry_date: '2026-08-11',
  title: null,
  content: `본문 ${id}`,
  content_blocks: JSON.stringify([{ type: 'text', value: `본문 ${id}` }]),
  emotion: 'joy',
  created_at: 1,
  updated_at: 2,
  deleted_at: null,
  ...over,
});

const report = (id, over = {}) => ({
  id,
  kind: 'weekly',
  period_key: '2026-W33',
  lang: 'ko',
  summary: `요약 ${id}`,
  concern: 0,
  source_count: 7,
  model: 'gpt-5.6-luna',
  prompt_ver: 1,
  created_at: 100,
  ...over,
});

const fullManifest = () => ({
  dbVersion: 5,
  diaries: [diary('a'), diary('b'), diary('c', { deleted_at: 99, content: '' })],
  images: [
    {
      id: 'i1',
      diary_id: 'a',
      file_name: 'x.jpg',
      width: 800,
      height: 600,
      created_at: 1,
      deleted_at: null,
    },
  ],
  tags: [
    { id: 't1', name: '여행', created_at: 10 },
    { id: 't2', name: '일상', created_at: 20 },
  ],
  diaryTags: [{ diary_id: 'a', tag_id: 't1' }],
  reports: [report('r1'), report('r2', { kind: 'monthly', period_key: '2026-08', concern: 1 })],
});

check('매니페스트 · UTF-8 왕복 (한글·이모지·서러게이트 쌍)', () => {
  for (const text of ['조각', '오늘은 🌤️ 맑음', 'a', '𝔘𝔫𝔦𝔠𝔬𝔡𝔢', '']) {
    eq(decodeUtf8(encodeUtf8(text)), text, `"${text}"`);
  }
});

check('매니페스트 · 단일 파트 왕복', () => {
  const original = fullManifest();
  const joined = joinManifest(splitManifest(original, 1_000_000));
  eq(JSON.stringify(joined), JSON.stringify(original), '왕복 불일치');
});

check('매니페스트 · 여러 파트로 나뉘어도 왕복 (각 파트가 독립 파싱된다)', () => {
  const original = fullManifest();
  const parts = splitManifest(original, 200); // 조각 하나가 겨우 들어갈 크기
  if (parts.length < 2) throw new Error(`나뉘지 않았다 (${parts.length}파트)`);
  for (const bytes of parts) {
    JSON.parse(decodeUtf8(bytes)); // 이어붙이지 않고 **혼자** 파싱돼야 한다
  }
  eq(JSON.stringify(joinManifest(parts)), JSON.stringify(original), '왕복 불일치');
});

check('매니페스트 · 파트가 비어 있어도 무한 루프에 빠지지 않는다', () => {
  const empty = { dbVersion: 5, diaries: [], images: [], tags: [], diaryTags: [], reports: [] };
  eq(splitManifest(empty, 10).length, 1, '빈 매니페스트는 파트 1개');
});

check('🔴 매니페스트 · 리포트가 여러 파트로 나뉘어도 딱 한 번만 실린다', () => {
  // 리포트는 첫 파트에만 넣는다. 파트마다 넣으면 복원 시 중복되고,
  // 안 넣으면 통째로 사라진다 — 둘 다 조용하다
  const original = fullManifest();
  const parts = splitManifest(original, 200);
  if (parts.length < 2) throw new Error(`나뉘지 않았다 (${parts.length}파트)`);
  const joined = joinManifest(parts);
  eq(joined.reports.length, 2, '리포트 수');
  eq(JSON.stringify(joined.reports), JSON.stringify(original.reports), '리포트 왕복 불일치');
});

check(
  '🔴 매니페스트 · v1 백업(reports 없음)도 복원된다 — 형식 상승이 옛 백업을 막지 않는다',
  () => {
    // 엄격 일치로 두면 형식을 올리는 순간 이미 만들어진 백업이 전부 복원 불가가 된다
    const v1 = encodeUtf8(
      JSON.stringify({
        v: 1,
        dbVersion: 4,
        diaries: [diary('a')],
        images: [],
        tags: [],
        diaryTags: [],
        // reports 없음 — v1에는 이 필드 자체가 없었다
      }),
    );
    const joined = joinManifest([v1]);
    eq(joined.reports.length, 0, 'reports가 빈 배열이어야 한다');
    eq(joined.diaries.length, 1, '조각은 살아 있어야 한다');
  },
);

check('매니페스트 · 더 새 형식은 여전히 거부한다', () => {
  const future = encodeUtf8(
    JSON.stringify({
      v: 99,
      dbVersion: 4,
      diaries: [],
      images: [],
      tags: [],
      diaryTags: [],
      reports: [],
    }),
  );
  throws(() => joinManifest([future]), '형식 v99');
});

check('매니페스트 · content_blocks를 파싱하지 않고 문자열 그대로 나른다', () => {
  const unknown = JSON.stringify([{ type: 'table', rows: [[1, 2]] }]); // 이 앱이 모르는 타입
  const m = { ...fullManifest(), diaries: [diary('a', { content_blocks: unknown })] };
  eq(
    joinManifest(splitManifest(m, 1_000_000)).diaries[0].content_blocks,
    unknown,
    '블록이 변형됐다',
  );
});

check('매니페스트 · 더 새 스키마는 거부한다', () => {
  throws(() => assertReadable({ ...fullManifest(), dbVersion: 9 }, 4), 'dbVersion 9 > 4');
  assertReadable({ ...fullManifest(), dbVersion: 3 }, 4); // 옛 백업은 읽는다
});

check('매니페스트 · 형식 버전이 다른 파트가 섞이면 거부', () => {
  const [good] = splitManifest(fullManifest(), 1_000_000);
  const bad = encodeUtf8(
    JSON.stringify({ v: 1, dbVersion: 99, diaries: [], images: [], tags: [], diaryTags: [] }),
  );
  throws(() => joinManifest([good, bad]), 'dbVersion 불일치');
});

check('매니페스트 · aliveDiaryIds가 묘비를 뺀다 (차집합이 뚫리는 경로)', () => {
  const ids = aliveDiaryIds(fullManifest());
  eq([...ids].sort().join(','), 'a,b', '묘비 c가 섞였다');
  /*
   * 이게 왜 회귀인가: 확인 화면은 "로컬 alive ∖ 매니페스트" 차집합을 보여준다.
   * 묘비 id가 매니페스트 쪽 집합에 들어가면, A 기기에서 지운 조각이 B 기기에서
   * "백업에 있음"으로 판정돼 **경고 없이 사라진다.**
   */
});

check('매니페스트 · 깨진 JSON은 파싱 실패로 거부', () => {
  throws(() => joinManifest([encodeUtf8('{ 이건 JSON이')]), '깨진 파트');
});

// ── 전체 경로 (매니페스트 → 봉인 → 개봉 → 매니페스트) ─────────────────────────

const KEYS = {
  dek: hex('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f'),
  kid: KID,
};
// 결정적 nonce — **테스트 전용**이다. 제품은 매번 CSPRNG로 만든다
const nonceFor = (part) => {
  const n = new Uint8Array(24);
  n[23] = part + 1;
  return n;
};
const sealOpts = (over = {}) => ({
  seq: 41,
  genId: GEN,
  version: VERSION_EXPERIMENTAL,
  nonceFor,
  ...over,
});

check('전체 경로 · 단일 파트 왕복', () => {
  const original = fullManifest();
  const envelopes = sealManifest(original, KEYS, sealOpts());
  eq(envelopes.length, 1, '파트 수');
  const opened = openManifest(envelopes, KEYS);
  eq(opened.seq, 41, 'seq');
  eq(JSON.stringify(opened.manifest), JSON.stringify(original), '매니페스트 불일치');
});

check('전체 경로 · 여러 파트 왕복', () => {
  const original = {
    ...fullManifest(),
    diaries: Array.from({ length: 40 }, (_, i) => diary(`d${i}`)),
  };
  const envelopes = sealManifest(original, KEYS, sealOpts({ targetPartBytes: 400 }));
  if (envelopes.length < 3) throw new Error(`나뉘지 않았다 (${envelopes.length}파트)`);
  eq(JSON.stringify(openManifest(envelopes, KEYS).manifest), JSON.stringify(original), '불일치');
});

check('전체 경로 · 파트 순서가 섞여 있어도 복원된다', () => {
  const original = {
    ...fullManifest(),
    diaries: Array.from({ length: 20 }, (_, i) => diary(`d${i}`)),
  };
  const envelopes = sealManifest(original, KEYS, sealOpts({ targetPartBytes: 400 }));
  const shuffled = [...envelopes].reverse();
  eq(JSON.stringify(openManifest(shuffled, KEYS).manifest), JSON.stringify(original), '불일치');
});

check('전체 경로 · 파트 하나가 빠지면 전체 거부', () => {
  const original = {
    ...fullManifest(),
    diaries: Array.from({ length: 20 }, (_, i) => diary(`d${i}`)),
  };
  const envelopes = sealManifest(original, KEYS, sealOpts({ targetPartBytes: 400 }));
  throws(() => openManifest(envelopes.slice(1), KEYS), '파트 누락');
});

check('전체 경로 · 다른 세대의 파트가 섞이면 거부 (찢어진 세대)', () => {
  const m = { ...fullManifest(), diaries: Array.from({ length: 20 }, (_, i) => diary(`d${i}`)) };
  const a = sealManifest(m, KEYS, sealOpts({ targetPartBytes: 400 }));
  // 같은 seq·같은 partCount인데 genId만 다른 재시도 — AAD·태그는 전부 통과한다
  const b = sealManifest(
    m,
    KEYS,
    sealOpts({ targetPartBytes: 400, genId: hex('ffffffffffffffff') }),
  );
  throws(() => openManifest([a[0], ...b.slice(1)], KEYS), 'genId 혼입');
});

check('전체 경로 · 다른 복구 코드로는 못 연다', () => {
  const envelopes = sealManifest(fullManifest(), KEYS, sealOpts());
  const other = { dek: hex('00'.repeat(32)), kid: KID };
  throws(() => openManifest(envelopes, other), '다른 DEK');
});

check('전체 경로 · countParts가 실제 파트 수와 일치한다', () => {
  const m = { ...fullManifest(), diaries: Array.from({ length: 37 }, (_, i) => diary(`d${i}`)) };
  for (const target of [200, 400, 1000, 100_000]) {
    eq(
      countParts(m, target),
      sealManifest(m, KEYS, sealOpts({ targetPartBytes: target })).length,
      `목표 ${target}B — 어긋나면 nonce가 모자라 봉인이 죽는다`,
    );
  }
});

// ── 결과 ──────────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\n백업 암호 검증 실패 ${failures.length}건\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}\n`);
  process.exit(1);
}
// ⚠ 이 내역은 손으로 유지한다 — 검사를 더하면 여기도 고친다.
//   2026-08-12에 합계와 3개 어긋나 있는 것을 발견하고 다시 셌다.
console.log(
  `백업 암호 ok — ${passed}개 검사 통과 (KAT 4 + 유도값 1 + 봉투 8 + 세대 4 + 복구 코드 10 + 매니페스트 12 + 전체 경로 7)`,
);
