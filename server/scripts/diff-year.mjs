/**
 * 두 실행을 나란히 놓는다 — `node --experimental-strip-types server/scripts/diff-year.mjs <a> <b> [키…]`
 *
 * ```bash
 * node --experimental-strip-types server/scripts/diff-year.mjs year-2025.v2 year-2025 2025 2025-07 2025-11
 * ```
 *
 * 모델을 부르지 않는다 — 과금 없음. `RESULTS.md`를 쓸 때 **같은 기간을 위아래로** 보기 위한 것이다.
 * 프롬프트를 고쳤을 때 좋아졌는지는 숫자로 안 나온다. 눈으로 봐야 한다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const base = dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const [aName, bName, ...keys] = process.argv.slice(2);

if (aName === undefined || bName === undefined) {
  console.error('\n쓰기: diff-year.mjs <이전> <이후> [기간키…]\n예:   diff-year.mjs year-2025.v2 year-2025 2025 2025-07\n');
  process.exit(1);
}

const load = (n) => {
  const f = join(base, `.cache/${n}.json`);
  if (!existsSync(f)) {
    console.error(`\n${f} 가 없다.\n`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(f, 'utf8'));
};

const A = load(aName);
const B = load(bName);

/** 키를 안 주면 월간+연간 전부 */
const targets =
  keys.length > 0
    ? keys
    : Object.keys(B)
        .filter((k) => B[k].kind !== 'weekly')
        .sort();

/** 상투어가 줄었는가 — 문체는 눈으로 보지만 이건 셀 수 있다 */
const CLICHE = ['적혀 있', '놓여 있', '장면', '남아 있', '기록에서', '옮겨가'];
function cliches(store) {
  const all = Object.values(store).map((v) => v.summary).join(' ');
  return CLICHE.map((w) => `${w} ${(all.match(new RegExp(w, 'g')) ?? []).length}`).join(' · ');
}
const avg = (s, kind) => {
  const r = Object.values(s).filter((v) => v.kind === kind);
  return r.length === 0 ? 0 : Math.round(r.reduce((n, v) => n + v.summary.length, 0) / r.length);
};

console.log(`\n${aName}  →  ${bName}`);
console.log(`상투어  이전: ${cliches(A)}`);
console.log(`        이후: ${cliches(B)}`);
console.log(
  `평균 길이  주간 ${avg(A, 'weekly')}→${avg(B, 'weekly')} · ` +
    `월간 ${avg(A, 'monthly')}→${avg(B, 'monthly')} · 연간 ${avg(A, 'yearly')}→${avg(B, 'yearly')}자`,
);

for (const k of targets) {
  console.log(`\n${'═'.repeat(72)}\n■ ${k}\n${'═'.repeat(72)}`);
  console.log(`\n── 이전 (${aName})\n`);
  console.log(A[k]?.summary ?? '(없음)');
  console.log(`\n── 이후 (${bName})\n`);
  console.log(B[k]?.summary ?? '(없음)');
}
console.log('');
