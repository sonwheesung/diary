/**
 * 구독 순수 계층 검사 — `node scripts/check-subscription.mjs`
 *
 * 여기서 보는 것은 **법적 고지의 근거가 되는 계산**이다(전자상거래법 §13⑥).
 * 날짜가 하루만 어긋나도 "언제 결제되는지"를 잘못 고지하는 것이고,
 * 그건 화면을 눈으로 봐서는 알 수 없다.
 */
import { trialTerms } from '../features/subscription/trial.ts';

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

console.log(
  failures.length === 0
    ? `\n구독 순수 계층 ok — ${passed}개 검사 통과\n`
    : `\n${failures.length}개 실패:\n${failures.join('\n')}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
