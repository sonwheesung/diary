/**
 * 구독 순수 계층 검사 — `node scripts/check-subscription.mjs`
 *
 * 여기서 보는 것은 **법적 고지의 근거가 되는 계산**이다(전자상거래법 §13⑥).
 * 날짜가 하루만 어긋나도 "언제 결제되는지"를 잘못 고지하는 것이고,
 * 그건 화면을 눈으로 봐서는 알 수 없다.
 */
import { GRACE_DAYS, GRACE_MS, daysUntil, purgeAtFrom } from '../features/backup/policy.ts';
import { GRACE_MS as SERVER_GRACE_MS } from '../server/lib/policy.ts';
import { trialTerms } from '../features/subscription/trial.ts';
import {
  awaitingConfirm,
  cacheStillValid,
  decideEntitlement,
} from '../features/entitlement/decide.ts';

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

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_786_000_000_000;
const free = (unit, units, cycles = 1) => ({
  price: 0,
  periodUnit: unit,
  periodNumberOfUnits: units,
  cycles,
});

check('7일 체험 → 7일 뒤 청구', () => {
  const terms = trialTerms(free('DAY', 7), '₩3,900', NOW);
  assert(terms?.days === 7, `days=${terms?.days}`);
  assert(terms.chargesAt === NOW + 7 * DAY, `chargesAt=${terms.chargesAt}`);
  assert(terms.priceAfter === '₩3,900', terms.priceAfter);
});

check('주 단위도 일로 환산한다 (Play는 P1W로 준다)', () => {
  assert(trialTerms(free('WEEK', 1), 'x', NOW)?.days === 7, '1주 = 7일');
  assert(trialTerms(free('MONTH', 1), 'x', NOW)?.days === 30, '1개월 = 30일');
});

check('소문자 단위도 받는다 (플랫폼마다 표기가 다르다)', () => {
  assert(trialTerms(free('day', 14), 'x', NOW)?.days === 14, '소문자 day');
});

check('여러 주기 체험은 곱한다', () => {
  assert(trialTerms(free('WEEK', 1, 2), 'x', NOW)?.days === 14, '1주 × 2회');
});

check('🔴 할인가는 체험이 아니다 — §13⑥ 대상이 아니므로 동의를 만들지 않는다', () => {
  const discounted = { price: 1900, periodUnit: 'MONTH', periodNumberOfUnits: 1, cycles: 1 };
  assert(trialTerms(discounted, 'x', NOW) === null, '유료 도입가에 체험 화면을 세우면 안 된다');
});

check('도입가가 없으면 체험도 없다', () => {
  assert(trialTerms(null, 'x', NOW) === null, 'null');
});

check('🔴 모르는 단위는 기간을 지어내지 않는다', () => {
  const weird = { price: 0, periodUnit: 'FORTNIGHT', periodNumberOfUnits: 1, cycles: 1 };
  assert(trialTerms(weird, 'x', NOW) === null, '틀린 날짜를 고지하느니 동의를 안 받는다');
});

check('cycles가 0으로 와도 기간이 0이 되지 않는다', () => {
  // 0을 그대로 곱하면 "오늘 결제된다"고 고지하게 된다.
  assert(trialTerms(free('DAY', 7, 0), 'x', NOW)?.days === 7, 'cycles=0');
});

/*
 * ── 유예 시계 ────────────────────────────────────────────────────────────────
 * 구독이 끝난 결과라 여기서 함께 본다. 이 계산이 틀리면 **일기가 예고보다 일찍 지워지거나,
 * 지워진 뒤에도 "아직 남아 있다"고 말한다.** 서버(`server/lib/policy.ts`)와 같은 값이어야 한다.
 */
check('유예는 만료 시각 + 90일', () => {
  const expired = new Date(NOW).toISOString();
  const purgeAt = purgeAtFrom(expired);
  assert(purgeAt === NOW + GRACE_DAYS * DAY, `purgeAt=${purgeAt}`);
});

check("구독 중('never')이면 유예가 아니다 — 삭제 경고를 띄우지 않는다", () => {
  assert(purgeAtFrom('never') === null, 'never');
  assert(purgeAtFrom(null) === null, 'null');
  assert(purgeAtFrom('') === null, '빈 문자열');
});

check('🔴 알 수 없는 만료 값에 삭제일을 지어내지 않는다', () => {
  assert(purgeAtFrom('언젠가') === null, '파싱 실패');
});

check('🔴 앱과 서버의 유예가 같은 값인가 — 어긋나면 되돌릴 수 없다', () => {
  // 화면에는 90일이라 적혀 있는데 서버가 60일에 지우면 사과할 방법이 없다.
  assert(GRACE_MS === SERVER_GRACE_MS, `앱 ${GRACE_MS} ≠ 서버 ${SERVER_GRACE_MS}`);
  assert(GRACE_DAYS * DAY === GRACE_MS, '일수 표기와 실제 값이 다르다');
});

check('남은 일수는 올림한다 — 반나절 남았는데 0일이라고 하지 않는다', () => {
  assert(daysUntil(NOW + DAY / 2, NOW) === 1, '반나절');
  assert(daysUntil(NOW + 7 * DAY, NOW) === 7, '7일');
});

check('이미 지났으면 0 — 음수가 화면에 나오지 않는다', () => {
  assert(daysUntil(NOW - 5 * DAY, NOW) === 0, '지난 뒤');
});

/*
 * ─────────────────────────────────────────────────────────────────────────
 * 엔타이틀먼트 상태 전이 (2026-08-19 신설)
 *
 * 🔴 **이 블록이 없어서 버그가 두 번 나갔다.** 전수조사(§6.1.7)의 지적이 정확히
 *   *"스토어 상태 전이를 검사하는 것이 0개"* 였다 — 위의 14개는 전부 기간 계산이었다.
 *   결제는 실기기가 필요해 자동화가 어렵지만, **"서버가 이렇게 답하면 무엇을 하나"는
 *   순수 함수**라 여기서 잡을 수 있었다.
 * ─────────────────────────────────────────────────────────────────────────
 */

const NO_WINDOW = { optimisticUntil: null, canProbe: false };

check(
  '서버를 못 물어봤으면 아무것도 하지 않는다 — 장애에 캐시를 지우면 구독자에게 광고가 뜬다',
  () => {
    const d = decideEntitlement({ kind: 'unreachable' }, NO_WINDOW, NOW);
    assert(d.kind === 'keep', `keep이어야 하는데 ${d.kind}`);
  },
);

check('🔴 장애는 낙관 구간이 없어도 revoke가 아니다 — "모름"과 "없음"은 다르다', () => {
  const d = decideEntitlement(
    { kind: 'unreachable' },
    { optimisticUntil: null, canProbe: true },
    NOW,
  );
  assert(d.kind === 'keep', `keep이어야 하는데 ${d.kind}`);
});

check('구독이 있으면 켜고 만료 시각을 캐시에 쓴다', () => {
  const d = decideEntitlement(
    { kind: 'active', expiresAt: '2026-09-19T00:00:00Z', inGracePeriod: false },
    NO_WINDOW,
    NOW,
  );
  assert(d.kind === 'grant' && d.until === '2026-09-19T00:00:00Z', JSON.stringify(d));
});

check('기한 없는 구독은 never로 캐시한다 — 앱이 만료를 지어내지 않는다', () => {
  const d = decideEntitlement(
    { kind: 'active', expiresAt: null, inGracePeriod: false },
    NO_WINDOW,
    NOW,
  );
  assert(d.kind === 'grant' && d.until === 'never', JSON.stringify(d));
});

check('유예 중이라는 사실이 그대로 전달된다', () => {
  const d = decideEntitlement(
    { kind: 'active', expiresAt: 'x', inGracePeriod: true },
    NO_WINDOW,
    NOW,
  );
  assert(d.kind === 'grant' && d.inGracePeriod === true, JSON.stringify(d));
});

check('🔴 결제 직후 낙관 구간에는 서버의 "없음"으로 되돌리지 않는다 (§6.1.6)', () => {
  // 이 한 줄이 없어서 "구독이 시작됐어요" 직후 화면이 `이용 안 함`으로 돌아갔다.
  const d = decideEntitlement(
    { kind: 'none' },
    { optimisticUntil: NOW + 60_000, canProbe: false },
    NOW,
  );
  assert(d.kind === 'hold', `hold여야 하는데 ${d.kind}`);
});

check('🔴 낙관 구간은 반드시 닫힌다 — 무한 낙관은 거짓말의 다른 형태다', () => {
  const d = decideEntitlement({ kind: 'none' }, { optimisticUntil: NOW - 1, canProbe: false }, NOW);
  assert(d.kind === 'revoke', `창이 지났으면 revoke여야 하는데 ${d.kind}`);
});

check('🔴 낙관 구간이 되묻기보다 먼저다 — 더 강한 근거가 있으니 왕복을 아낀다', () => {
  const d = decideEntitlement(
    { kind: 'none' },
    { optimisticUntil: NOW + 60_000, canProbe: true },
    NOW,
  );
  assert(d.kind === 'hold', `hold여야 하는데 ${d.kind}`);
});

check('🔴 서버가 "없다"고 해도 되물을 수단이 있으면 되묻는다 (§6.1.7 A1 완화)', () => {
  // 웹훅은 유실될 수 있다(5회 재시도 후 포기). 그때 돈 낸 사람에게 광고가 나온다.
  const d = decideEntitlement({ kind: 'none' }, { optimisticUntil: null, canProbe: true }, NOW);
  assert(d.kind === 'probe', `probe여야 하는데 ${d.kind}`);
});

check('되물을 수단이 없으면 끈다 — 근거가 하나도 없으면 fail-closed다', () => {
  const d = decideEntitlement({ kind: 'none' }, NO_WINDOW, NOW);
  assert(d.kind === 'revoke', `revoke여야 하는데 ${d.kind}`);
});

check('캐시 유효성 — never는 영원, 빈 값·null은 무효', () => {
  assert(cacheStillValid('never', NOW) === true, 'never');
  assert(cacheStillValid(null, NOW) === false, 'null');
  assert(cacheStillValid('', NOW) === false, '빈 문자열');
});

check('🔴 캐시가 만료됐으면 무효다 — 앱이 서버 없이도 만료를 존중한다', () => {
  assert(cacheStillValid(new Date(NOW - DAY).toISOString(), NOW) === false, '지난 시각');
  assert(cacheStillValid(new Date(NOW + DAY).toISOString(), NOW) === true, '남은 시각');
});

check('🔴 알 수 없는 캐시 값은 유효로 보지 않는다', () => {
  assert(cacheStillValid('언젠가', NOW) === false, '파싱 실패');
});

check('"확인 중" 판정은 낙관 구간과 정확히 같은 구간이다', () => {
  assert(awaitingConfirm(NOW + 1, NOW) === true, '창 안');
  assert(awaitingConfirm(NOW - 1, NOW) === false, '창 밖');
  assert(awaitingConfirm(null, NOW) === false, '창 없음');
});

console.log(
  failures.length === 0
    ? `\n구독 순수 계층 ok — ${passed}개 검사 통과\n`
    : `\n${failures.length}개 실패:\n${failures.join('\n')}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
