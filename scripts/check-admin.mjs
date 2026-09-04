/**
 * 운영 콘솔 인가 검사 — `node scripts/check-admin.mjs`
 *
 * 🔴 **여기서 보는 것은 `fail-closed`다.** 배구가 `BACKEND_SYSTEM` §13.15에 남긴 교훈이
 *   그대로 적용된다: 크론의 fail-open("시크릿 미설정 시 통과")을 관리자 인증에 복제하면
 *   **env 누락 = 콘솔이 전 세계에 열림**이다.
 *
 * `isAdmin()`은 내부 임포트가 0이라(`node:crypto`뿐) 서버 없이 Node에서 직접 부를 수 있다.
 * 서버를 띄우고 HTTP로 재는 것보다 이쪽이 결정적이고, **미설정 상태를 실제로 만들 수 있다** —
 * 뜬 서버에서는 그 상태를 재현할 수 없다.
 *
 * `scripts/check-ai.mjs`와 같은 규약.
 */
import { readFileSync } from 'node:fs';

import { isAdmin } from '../server/lib/admin.ts';
import { windowStart, windowLabel } from '../server/lib/admin-window.ts';
import { estimateUsd, priceOf } from '../server/lib/admin-pricing.ts';

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
    console.log(`  FAIL ${name}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function eq(actual, expected, what) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  assert(a === b, `${what}: 기대 ${b}, 실제 ${a}`);
}

/** Authorization 헤더만 있는 최소 Request */
function req(authorization) {
  return new Request('https://example.test/api/admin/overview', {
    headers: authorization === null ? {} : { authorization },
  });
}

const GOOD = 'x'.repeat(32);

// ── ① fail-closed — 여기가 전부다 ────────────────────────────────────────────
console.log('\nfail-closed');

check('🔴 ADMIN_TOKEN 미설정이면 올바른 형식이어도 거부', () => {
  delete process.env.ADMIN_TOKEN;
  assert(!isAdmin(req(`Bearer ${GOOD}`)), '미설정인데 통과했다 — 콘솔이 전 세계에 열린다');
});

check('🔴 ADMIN_TOKEN이 빈 문자열이면 거부', () => {
  process.env.ADMIN_TOKEN = '';
  assert(!isAdmin(req('Bearer ')), '빈 토큰이 통과했다');
});

check('🔴 16자 미만은 설정된 것으로 치지 않는다', () => {
  process.env.ADMIN_TOKEN = 'short';
  assert(!isAdmin(req('Bearer short')), '약한 토큰이 통과했다 — 없는 토큰과 같아야 한다');
});

check('경계: 15자 거부 · 16자 허용', () => {
  process.env.ADMIN_TOKEN = 'y'.repeat(15);
  assert(!isAdmin(req(`Bearer ${'y'.repeat(15)}`)), '15자가 통과했다');
  process.env.ADMIN_TOKEN = 'y'.repeat(16);
  assert(isAdmin(req(`Bearer ${'y'.repeat(16)}`)), '16자가 거부됐다');
});

// ── ② 정상·비정상 헤더 ───────────────────────────────────────────────────────
console.log('\n헤더 판정');

check('올바른 토큰은 통과', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(isAdmin(req(`Bearer ${GOOD}`)), '올바른 토큰이 거부됐다');
});

check('헤더가 없으면 거부', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(!isAdmin(req(null)), '헤더 없이 통과했다');
});

check('Bearer 없이 토큰만 보내면 거부', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(!isAdmin(req(GOOD)), 'Bearer 없이 통과했다');
});

check('토큰이 다르면 거부 (길이 같음)', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(!isAdmin(req(`Bearer ${'z'.repeat(32)}`)), '틀린 토큰이 통과했다');
});

check('길이가 다르면 거부 — timingSafeEqual이 던지지 않는다', () => {
  process.env.ADMIN_TOKEN = GOOD;
  // 던지면 라우트가 500을 주고, 그건 401과 구별돼 토큰 길이를 알려준다
  assert(!isAdmin(req(`Bearer ${'x'.repeat(31)}`)), '짧은 토큰이 통과했다');
  assert(!isAdmin(req(`Bearer ${'x'.repeat(33)}`)), '긴 토큰이 통과했다');
});

check('접두사가 대소문자 무관 (bearer)', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(isAdmin(req(`bearer ${GOOD}`)), '소문자 bearer가 거부됐다');
});

check('토큰의 앞부분만 맞아도 거부', () => {
  process.env.ADMIN_TOKEN = GOOD;
  assert(!isAdmin(req(`Bearer ${'x'.repeat(31)}!`)), '접두사 일치로 통과했다');
});

// ── ③ 집계 창 — 주 월요일 / 월 1일 / 연 1월 1일 (KST) ────────────────────────
console.log('\n집계 창 (KST)');

/** KST 벽시계로 읽기 — UTC 순간을 9시간 밀어 UTC 게터로 본다 */
function kstIso(d) {
  const s = new Date(d.getTime() + 9 * 3600_000);
  const p = (n) => String(n).padStart(2, '0');
  return `${s.getUTCFullYear()}-${p(s.getUTCMonth() + 1)}-${p(s.getUTCDate())} ${p(s.getUTCHours())}:${p(s.getUTCMinutes())}`;
}

check('주 = 그 주 월요일 00:00 KST', () => {
  // 2026-08-13(목) 15:00 KST = 2026-08-13T06:00Z → 그 주 월요일은 8월 10일
  eq(kstIso(windowStart('week', new Date('2026-08-13T06:00:00Z'))), '2026-08-10 00:00', '목요일');
});

check('주 — 월요일 당일이면 그날 00:00 (한 주 뒤로 밀지 않는다)', () => {
  eq(kstIso(windowStart('week', new Date('2026-08-10T01:00:00Z'))), '2026-08-10 00:00', '월요일 10:00 KST');
});

check('🔴 주 — 일요일은 그 주에 남는다 (다음 주로 넘어가지 않는다)', () => {
  // 2026-08-16(일) 23:00 KST = 14:00Z. ISO에서 일요일은 그 주의 마지막 날이다
  eq(kstIso(windowStart('week', new Date('2026-08-16T14:00:00Z'))), '2026-08-10 00:00', '일요일');
});

check('🔴 주 — 월 경계를 넘어가도 맞는다', () => {
  // 2026-09-01(화) → 그 주 월요일은 8월 31일
  eq(kstIso(windowStart('week', new Date('2026-09-01T03:00:00Z'))), '2026-08-31 00:00', '9/1 화요일');
});

check('월 = 그 달 1일 00:00 KST', () => {
  eq(kstIso(windowStart('month', new Date('2026-08-13T06:00:00Z'))), '2026-08-01 00:00', '8월');
});

check('연 = 1월 1일 00:00 KST', () => {
  eq(kstIso(windowStart('year', new Date('2026-08-13T06:00:00Z'))), '2026-01-01 00:00', '2026년');
});

check('🔴 KST 경계 — UTC로 짜면 9시간 밀린다', () => {
  /*
   * 2026-08-01 02:00 KST = 2026-07-31T17:00Z.
   * UTC 기준이면 "7월"로 잡혀 **8월 1일 새벽 호출이 지난달로 집계된다.**
   * 배구가 실측으로 겪은 밀림이 정확히 이것이다.
   */
  eq(kstIso(windowStart('month', new Date('2026-07-31T17:00:00Z'))), '2026-08-01 00:00', '8/1 새벽 2시 KST');
});

check('windowLabel은 시작일만 준다 (끝은 항상 지금)', () => {
  eq(windowLabel('month', new Date('2026-08-13T06:00:00Z')), '2026-08-01', '월 라벨');
  eq(windowLabel('week', new Date('2026-08-13T06:00:00Z')), '2026-08-10', '주 라벨');
});

// ── ④ 원가 추정 ──────────────────────────────────────────────────────────────
console.log('\n원가 추정');

check('등록된 모델은 단가로 계산한다', () => {
  // 1M 입력 + 1M 출력 = $0.20 + $1.20
  const usd = estimateUsd('gpt-5.6-luna', 1_000_000, 1_000_000);
  assert(Math.abs(usd - 1.4) < 1e-9, `기대 1.4, 실제 ${usd}`);
});

check('🔴 단가 미등록 모델은 0이 아니라 null', () => {
  // 0을 주면 화면에 "공짜"로 읽혀 원가를 과소 보고한다
  eq(estimateUsd('some-unknown-model', 1_000_000, 1_000_000), null, '미등록 모델');
  eq(priceOf('some-unknown-model'), null, 'priceOf');
});

check('model이 null이어도 던지지 않는다', () => {
  eq(estimateUsd(null, 100, 100), null, 'null 모델');
});

check('토큰이 0이면 원가도 0 (null이 아니다)', () => {
  eq(estimateUsd('gpt-5.6-luna', 0, 0), 0, '0 토큰');
});

/* ── ⑤ subject 는 **입력으로만** 쓴다 (2026-09-04, ADMIN_SYSTEM §3) ───────────
 *
 * 🔴 이 다섯은 **소스를 읽는다.** 여기서 지키려는 것이 런타임 값이 아니라 *"응답에 무엇이
 *   들어 있는가"* 라서다 — subject_id 가 응답에 한 번 실리면 화면이 목록을 만들 수 있고,
 *   그 목록을 common_server 의 이메일과 맞추면 §3 이 막으려던 것이 그대로 생긴다.
 *
 * ⚠ *"리포트가 별로예요"* 문의를 여는 것은 막지 않는다. 그건 문의가 입구이고
 *   그 사람이 스스로 연 문이다. 막는 것은 **훑어보기**뿐이다.
 */
{
  const ROUTE = readFileSync(
    new URL('../server/app/api/admin/reports/route.ts', import.meta.url),
    'utf8',
  );
  const CONSOLE = readFileSync(
    new URL('../server/app/ops-7c1d94/page.tsx', import.meta.url),
    'utf8',
  );

  check('🔴 응답 select 에 subjectId 가 없다 — 있으면 화면이 목록을 만들 수 있다', () => {
    const select = ROUTE.slice(ROUTE.indexOf('.select({'), ROUTE.indexOf('.from(aiReports)'));
    assert(
      !/subjectId\s*:/.test(select),
      'select 에 subjectId 가 들어갔다 — 훑어보기가 가능해진다(ADMIN_SYSTEM §3)',
    );
  });

  check('🔴 subject 는 조회 조건으로는 쓴다 — 문의로 찾아온 사람을 못 열면 CS 가 막힌다', () => {
    assert(/params\.get\('subject'\)/.test(ROUTE), 'subject 파라미터를 읽지 않는다');
    assert(/eq\(aiReports\.subjectId,\s*subject\)/.test(ROUTE), 'subject 로 좁히지 않는다');
  });

  check('🔴 빈 subject 는 안 준 것과 같다 — `?subject=` 로 전체가 열리면 안 된다', () => {
    assert(
      /subject\.length > 0 \? eq\(/.test(ROUTE),
      '빈 문자열을 걸러내지 않는다 — 실수로 비면 조건이 어떻게 되는지 불명확해진다',
    );
  });

  check('집계도 같은 subject 범위로 좁힌다 — 두 숫자가 다른 것을 세면 안 된다', () => {
    const tail = ROUTE.slice(ROUTE.indexOf('const [counts]'));
    assert(/\.where\(bySubject\)/.test(tail), 'counts 가 전체를 센다');
  });

  check('🔴 화면은 좁혀졌다는 사실만 안다 — id 를 되돌려받지 않는다', () => {
    assert(/scoped:\s*bySubject !== undefined/.test(ROUTE), 'scoped 불리언이 없다');
    assert(
      !/data\.subjectId|r\.subjectId|\.subject_id/.test(CONSOLE),
      '콘솔이 응답에서 subject 를 읽으려 한다 — 라우트가 안 주므로 undefined 를 그린다',
    );
  });
}

// ── 결과 ─────────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`\n관리자 콘솔 FAIL — ${failures.length}개\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`\n관리자 콘솔 ok — ${passed}개 검사 통과 (fail-closed 4 + 헤더 7 + 집계 창 8 + 원가 4 + subject 경계 5)`);
