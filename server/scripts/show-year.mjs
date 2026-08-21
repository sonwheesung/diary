/**
 * 1년 연쇄 생성 결과 읽기 — `node --experimental-strip-types server/scripts/show-year.mjs [연도] [--weekly]`
 *
 * `run-year.mjs`가 남긴 캐시를 사람이 읽을 수 있게 편다. **모델을 부르지 않는다** — 과금 없음.
 *
 * 기본은 **월간·연간만** 보여준다. 주간 52개까지 다 펴면 화면이 넘쳐서
 * 정작 봐야 할 연간이 안 보인다. 주간은 `--weekly`로 연다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const year = process.argv.find((a) => /^\d{4}$/.test(a)) ?? '2025';
const showWeekly = process.argv.includes('--weekly');

const base = dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const file = join(base, `.cache/year-${year}.json`);

if (!existsSync(file)) {
  console.error(`\n${file} 이 없다. 먼저 run-year.mjs를 돌린다.\n`);
  process.exit(1);
}

const store = JSON.parse(readFileSync(file, 'utf8'));
const of = (kind) =>
  Object.entries(store)
    .filter(([, v]) => v.kind === kind)
    .sort(([a], [b]) => (a < b ? -1 : 1));

const weekly = of('weekly');
const monthly = of('monthly');
const yearly = of('yearly');

const sum = (rows, k) => rows.reduce((n, [, v]) => n + (v.usage?.[k] ?? 0), 0);
const chars = (rows) => rows.reduce((n, [, v]) => n + v.summary.length, 0);

console.log(`\n${year} — 주간 ${weekly.length} · 월간 ${monthly.length} · 연간 ${yearly.length}`);
console.log(
  `토큰 입력 ${sum([...weekly, ...monthly, ...yearly], 'in').toLocaleString()} · ` +
    `출력 ${sum([...weekly, ...monthly, ...yearly], 'out').toLocaleString()}`,
);

const concerns = Object.entries(store).filter(([, v]) => v.concern);
console.log(
  concerns.length === 0
    ? 'concern=true: 없음'
    : `🔴 concern=true: ${concerns.map(([k]) => k).join(' ')}`,
);

/** 길이는 품질이 아니지만 **계층이 압축되고 있는지**는 보여준다 */
const avg = (rows) => (rows.length === 0 ? 0 : Math.round(chars(rows) / rows.length));
console.log(`평균 길이 — 주간 ${avg(weekly)}자 · 월간 ${avg(monthly)}자 · 연간 ${avg(yearly)}자`);

function show(rows, title) {
  if (rows.length === 0) return;
  console.log(`\n${'═'.repeat(70)}\n■ ${title}\n${'═'.repeat(70)}`);
  for (const [key, v] of rows) {
    console.log(`\n── ${key}${v.concern ? '  🔴 concern' : ''}  (${v.summary.length}자 · ${v.ms}ms)\n`);
    console.log(v.summary);
  }
}

if (showWeekly) show(weekly, '주간');
show(monthly, '월간');
show(yearly, '연간');
console.log('');
