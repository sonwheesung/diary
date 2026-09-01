/**
 * 연령 게이트 회귀 가드 — `npm run check:age-gate`
 *
 * 순수 계층(`features/auth/age-gate.ts`)만 컴파일해 **지역 × 출생연도 경계값을 전수로** 잰다.
 * 화면을 띄워야만 확인되는 규칙은 결국 확인되지 않는다(docs/AUTH_SYSTEM.md §1.7).
 *
 * 🔴 이 가드가 실제로 막는 것 두 가지:
 *   ① 판정식이 관대식으로 되돌아가는 것 — 기준 미달자를 들여보내면 **위법**이다.
 *   ② 지역표에서 나라가 빠지는 것 — EEA 한 나라가 빠지면 그 나라만 16 대신 13이 된다.
 *      눈으로는 32개 문자열을 못 센다.
 */
import {
  AGE_GATE_VERSION,
  FALLBACK_THRESHOLD,
  birthYearRange,
  blockActive,
  decideBootGate,
  makeBlockRecord,
  makeRecord,
  parseBlockRecord,
  parseRecord,
  passes,
  recordValid,
  serializeBlockRecord,
  serializeRecord,
  thresholdFor,
} from '../features/auth/age-gate.ts';
import {
  DEVICE_SESSION_PREFIX,
  SESSION_PREFIX,
  toDeviceSessionKey,
} from '../lib/common-server/session-keys.ts';

let pass = 0;
const fails = [];
const ok = (cond, what) => (cond ? pass++ : fails.push(what));

// ── ① 지역 → 기준 ───────────────────────────────────────────────────────────
const EEA_PLUS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', 'GB', 'CH',
];
ok(EEA_PLUS.length === 32, `EEA 목록이 32개가 아니다 (${EEA_PLUS.length})`);
for (const r of EEA_PLUS) ok(thresholdFor(r) === 16, `${r} 는 16 이어야 한다 (실제 ${thresholdFor(r)})`);

ok(thresholdFor('KR') === 14, '한국은 14');
ok(thresholdFor('US') === 13, '미국은 13');
for (const r of ['JP', 'CN', 'BR', 'IN', 'AU', 'CA', 'MX', 'TH', 'VN', 'ID', 'TR', 'RU']) {
  ok(thresholdFor(r) === 13, `${r} 는 보수적 기본값 13`);
}

// 대소문자·공백은 정규화된다 — 로케일이 어떻게 오든 같은 판정이어야 한다
for (const v of ['kr', ' KR ', 'Kr']) ok(thresholdFor(v) === 14, `'${v}' 도 한국으로 읽어야 한다`);
for (const v of ['de', ' fr']) ok(thresholdFor(v) === 16, `'${v}' 도 EEA 로 읽어야 한다`);

// 🔴 판정 불가는 **최보수**로 떨어져야 한다. 여기가 느슨해지면 게이트가 무의미해진다
for (const v of [null, undefined, '', '   ', 'K', 'KOR', '12', 'K1', '한국', 'ZZZ']) {
  ok(thresholdFor(v) === FALLBACK_THRESHOLD, `판정 불가(${JSON.stringify(v)})는 ${FALLBACK_THRESHOLD}`);
}
ok(FALLBACK_THRESHOLD === 16, '판정 불가 기본값이 16 이어야 한다 — 13 으로 내리면 실패가 게이트를 연다');

// ── ② 판정식 — 전수 + 경계 ──────────────────────────────────────────────────
const THIS_YEAR = 2026;
const REGIONS = [...EEA_PLUS, 'KR', 'US', 'JP', 'BR', null, 'ZZZ'];
let swept = 0;
for (const region of REGIONS) {
  const th = thresholdFor(region);
  const { min, max } = birthYearRange(THIS_YEAR);
  for (let y = min - 2; y <= max + 2; y++) {
    swept++;
    const expected = y >= min && y <= max && THIS_YEAR - y >= th + 1;
    if (passes(y, THIS_YEAR, th) !== expected) {
      fails.push(`전수 불일치: region=${region} year=${y} th=${th}`);
      y = max + 3; // 같은 지역에서 쏟아지지 않게 끊는다
    }
  }
}
ok(fails.length === 0, '전수 판정이 어긋났다');
ok(swept === REGIONS.length * 125, `전수 조합 수가 예상과 다르다 (${swept})`);

// 🔴 보수식인지 **직접** 확인한다 — 관대식으로 되돌아가면 여기서 죽는다.
//   2026년 · 기준 14 → 2012년생은 실나이가 13 또는 14다. 관대식은 통과시키고 보수식은 막는다.
ok(passes(2012, 2026, 14) === false, '관대식으로 되돌아갔다: 2026년 2012년생이 기준 14 를 통과했다');
ok(passes(2011, 2026, 14) === true, '보수식이 과하게 막는다: 2026년 2011년생은 기준 14 통과여야 한다');
ok(passes(2010, 2026, 16) === false, '기준 16: 2010년생은 막혀야 한다');
ok(passes(2009, 2026, 16) === true, '기준 16: 2009년생은 통과해야 한다');
ok(passes(2013, 2026, 13) === false, '기준 13: 2013년생은 막혀야 한다');
ok(passes(2012, 2026, 13) === true, '기준 13: 2012년생은 통과해야 한다');

// 해가 바뀌면 경계도 한 칸 움직인다 — 상수로 굳어 있지 않은지
ok(passes(2012, 2027, 14) === true, '2027년이 되면 2012년생은 기준 14 를 통과해야 한다');

// 쓰레기 입력은 통과가 아니라 불통과다
for (const bad of [NaN, Infinity, 1.5, -1, 0]) {
  ok(passes(bad, THIS_YEAR, 14) === false, `비정상 입력(${bad})이 통과됐다`);
}
ok(passes(2000, 1.5, 14) === false, 'thisYear 가 비정수면 불통과');
ok(passes(THIS_YEAR + 1, THIS_YEAR, 13) === false, '미래 출생연도는 불통과');

// ── ③ 기록 — 생년이 새지 않는가 ─────────────────────────────────────────────
const rec = makeRecord(14, 1_700_000_000_000);
ok(Object.keys(rec).sort().join(',') === 'passedAt,threshold,version', `기록 키가 셋이 아니다: ${Object.keys(rec)}`);
// 🔴 저장되는 어떤 값에도 출생연도가 들어가면 안 된다(§3.3)
ok(!('birthYear' in rec), '기록에 birthYear 가 들어갔다');
ok(!serializeRecord(rec).includes('birth'), '직렬화 결과에 birth 가 보인다');
ok(rec.version === AGE_GATE_VERSION, '기록 버전이 현재 규칙 버전과 같아야 한다');
ok(makeRecord.length === 2, 'makeRecord 는 인자를 둘만 받아야 한다 — 생년이 낄 자리를 만들지 않는다');

ok(recordValid(rec) === true, '방금 만든 기록은 유효해야 한다');
ok(recordValid({ ...rec, version: AGE_GATE_VERSION + 1 }) === false, '버전이 오르면 무효(= 재확인)');
ok(recordValid({ ...rec, version: AGE_GATE_VERSION - 1 }) === false, '옛 버전 기록은 무효');
for (const bad of [null, undefined, {}, { passedAt: 'x', threshold: 1, version: 1 }]) {
  ok(recordValid(bad) === false, `깨진 기록(${JSON.stringify(bad)})이 유효로 읽혔다`);
}

ok(parseRecord(serializeRecord(rec))?.threshold === 14, '왕복이 깨졌다');
ok(recordValid(parseRecord(serializeRecord(rec))) === true, '왕복한 기록이 유효해야 한다');
for (const bad of [null, '', 'null', '{', '[]', '{"passedAt":1}', '"문자열"']) {
  ok(parseRecord(bad) === null, `쓰레기 입력(${JSON.stringify(bad)})이 기록으로 읽혔다`);
}

// ── ④ 미달 유예와 부팅 판정 (2026-09-01, 게이트가 부팅으로 올라가며 생김) ──────
const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000;
const blk = makeBlockRecord(14, T0);

ok(Object.keys(blk).sort().join(',') === 'blockedAt,threshold,version', `미달 기록 키가 셋이 아니다: ${Object.keys(blk)}`);
// 🔴 통과 기록과 **같은 규율** — 미달 쪽으로 생년이 새는 경로를 따로 막는다
ok(!('birthYear' in blk), '미달 기록에 birthYear 가 들어갔다');
ok(!serializeBlockRecord(blk).includes('birth'), '미달 직렬화에 birth 가 보인다');
ok(makeBlockRecord.length === 2, 'makeBlockRecord 도 인자를 둘만 받아야 한다');
ok(parseBlockRecord(serializeBlockRecord(blk))?.threshold === 14, '미달 기록 왕복이 깨졌다');
for (const bad of [null, '', 'null', '{', '{"blockedAt":1}', '{"passedAt":1,"threshold":1,"version":1}']) {
  ok(parseBlockRecord(bad) === null, `쓰레기 입력(${JSON.stringify(bad)})이 미달 기록으로 읽혔다`);
}

// 유예 경계 — 365일 미만은 살아 있고, 딱 365일이면 다시 묻는다
ok(blockActive(blk, 14, T0) === true, '방금 막힌 기록이 유예 밖으로 읽혔다');
ok(blockActive(blk, 14, T0 + 364 * DAY) === true, '364일째는 유예 안이어야 한다');
ok(blockActive(blk, 14, T0 + 365 * DAY - 1) === true, '365일 직전은 유예 안이어야 한다');
ok(blockActive(blk, 14, T0 + 365 * DAY) === false, '365일이 되면 다시 물어야 한다');
ok(blockActive(blk, 14, T0 + 800 * DAY) === false, '유예가 한참 지났는데 아직 막고 있다');
// 🔴 기기 시계를 되돌려도 유예가 늘어나면 안 된다
ok(blockActive(blk, 14, T0 - DAY) === false, '미래 시각 기록이 유예로 읽혔다');
// 기준·버전이 다르면 유예를 무시한다 — 다른 기준으로 막힌 기록은 지금 기준에 대해 아무 말도 못 한다
ok(blockActive(blk, 16, T0) === false, '기준이 달라졌는데 옛 유예가 살아 있다');
ok(blockActive({ ...blk, version: AGE_GATE_VERSION + 1 }, 14, T0) === false, '규칙 버전이 올랐는데 유예가 살아 있다');
for (const bad of [null, undefined, {}, { blockedAt: 'x', threshold: 14, version: AGE_GATE_VERSION }]) {
  ok(blockActive(bad, 14, T0) === false, `깨진 미달 기록(${JSON.stringify(bad)})이 유예로 읽혔다`);
}

// 부팅 판정 — 세 값
ok(decideBootGate(null, null, 14, T0) === 'ask', '기록이 없으면 물어야 한다');
ok(decideBootGate(rec, null, 14, T0) === 'verified', '통과 기록이 있으면 통과다');
ok(decideBootGate(null, blk, 14, T0) === 'blocked', '유예 안의 미달을 다시 묻고 있다');
ok(decideBootGate(null, blk, 14, T0 + 365 * DAY) === 'ask', '유예가 끝났으면 다시 물어야 한다');
// 🔴 통과가 미달보다 우선이다 — 옛 미달 기록이 남아 있어도 통과했으면 통과다
ok(decideBootGate(rec, blk, 14, T0) === 'verified', '통과했는데 옛 미달 기록이 이겼다');
// 깨진 통과 기록은 통과가 아니다(버전이 오른 경우 포함)
ok(decideBootGate({ ...rec, version: AGE_GATE_VERSION + 1 }, null, 14, T0) === 'ask', '무효한 통과 기록이 통과로 읽혔다');

// ── ⑤ 세션 칸 분리 — 게이트가 뚫리는 **다른 한 경로** ────────────────────────
//
// 여기 있는 이유: 이 매퍼가 틀리면 기기 토큰이 로그인 칸에 들어가고, 그러면 `/auth/me` 가
// 200 을 주며 로그인으로 판정돼 **연령 게이트가 우회된다**. 즉 실패 증상이 위 ①~④ 와 같다.
// (`lib/common-server/session-keys.ts` · docs/SUPPORT_SYSTEM.md §3.1)

ok(toDeviceSessionKey('cs_session_jogak') === 'cs_devsession_jogak', '기기 칸으로 안 옮겨졌다');
// 🔴 두 칸이 절대 같아지면 안 된다 — 같아지는 순간 신원이 하나로 합쳐진다
ok(toDeviceSessionKey('cs_session_jogak') !== 'cs_session_jogak', '기기 키가 로그인 키와 같다');
ok(SESSION_PREFIX !== DEVICE_SESSION_PREFIX, '두 접두사가 같다');
ok(!DEVICE_SESSION_PREFIX.startsWith(SESSION_PREFIX), '기기 접두사가 로그인 접두사로 시작하면 두 번 매핑될 수 있다');

// 접두사가 붙은 파생 키가 생겨도 **같이** 격리돼야 한다
ok(toDeviceSessionKey('cs_session_meta_jogak') === 'cs_devsession_meta_jogak', '파생 키가 격리되지 않았다');

// 🔴 접두사가 없는 키는 손대지 않는다 — 그런 키가 생기면 두 인스턴스가 조용히 공유하게 되므로
//    "그대로 통과"가 맞는 동작이고, 공유가 문제라면 SDK 쪽에서 드러나야 한다
for (const k of ['jogak_device_id', 'cs_expiry_jogak', '', 'session_jogak']) {
  ok(toDeviceSessionKey(k) === k, `접두사 없는 키(${JSON.stringify(k)})를 건드렸다`);
}
// ⚠ `replace` 였다면 통과하지 못할 입력 — 접두사가 아닌 자리의 같은 문자열
ok(toDeviceSessionKey('x_cs_session_jogak') === 'x_cs_session_jogak', '접두사가 아닌 자리를 바꿨다(replace 를 쓰고 있다)');

// 멱등이 아니어야 한다 — 두 번 적용해도 로그인 칸으로 돌아오면 안 된다
ok(toDeviceSessionKey(toDeviceSessionKey('cs_session_jogak')) === 'cs_devsession_jogak', '두 번 매핑하면 값이 달라진다');

// ── 결과 ────────────────────────────────────────────────────────────────────
if (fails.length > 0) {
  console.error('\n연령 게이트 검사 실패:\n');
  for (const f of fails.slice(0, 20)) console.error(`  · ${f}`);
  if (fails.length > 20) console.error(`  … 외 ${fails.length - 20}건`);
  process.exit(1);
}
console.log(
  `연령 게이트 ok — ${pass}개 검사 통과 ` +
    `(지역 ${REGIONS.length}종 × 출생연도 125년 = ${swept}조합 전수 + 경계·기록)`,
);
