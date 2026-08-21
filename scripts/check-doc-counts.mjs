/**
 * 문서에 박힌 검사 개수가 실제와 같은지 대조한다.
 *
 * `npm run check:doc-counts`
 *
 * **왜**: 검사 개수가 **스크립트와 문서 두 곳에** 산다. 검사를 늘리면 문서가 조용히 낡고,
 * 낡은 숫자는 "이만큼 검사한다"는 **거짓 안심**을 준다. 2026-08-20에 7군데가 어긋나 있었다
 * (`check:legal` 112→378 · `check:subscription` 14→31 · `check:ai` 47→79).
 *
 * ⚠ **커밋 게이트가 아니다.** 검사 6개를 실제로 돌려서 2~3분 걸린다.
 *    릴리스 전이나 검사를 늘린 커밋에서만 돌린다(`docs/README.md` §3).
 *
 * 두 가지를 본다:
 *   ① 정본  — `docs/README.md` §3 코드블록의 `npm run <검사>   # N개`
 *   ② 중복  — 다른 문서가 같은 숫자를 또 적었으면 그것도 맞는지
 *
 * ②에서 걸리는데 **고칠 게 아니면**(과거 기록·우연한 숫자) `ALLOW`에 이유와 함께 넣는다.
 * 이유를 적게 하는 것이 목적이다 — 조용히 무시되는 예외를 만들지 않는다.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

/** 개수를 출력하는 검사들. 전부 `N개 검사 통과`로 끝난다 — 그 문구가 이 스크립트의 앵커다 */
const COUNTED = [
  'check:legal',
  'check:backup-crypto',
  'check:i18n-roundtrip',
  'check:subscription',
  'check:notification',
  'check:ai',
  'check:admin',
];

/** ②에서 걸리지만 고칠 게 아닌 줄. 부분 문자열로 찾는다 — 줄이 옮겨져도 따라간다 */
const ALLOW = [
  {
    file: 'docs/MONETIZATION_SYSTEM.md',
    contains: '`check:subscription` 14개는 전부 체험 기간 계산',
    why: '과거 기록 — §6.1.7 "왜 못 찾았나"의 진단 시점 사실이다. 고치면 그 절이 거짓이 된다',
  },
];

/** 문서를 뒤질 곳 */
const DOCS = [
  'CLAUDE.md',
  ...execSync('git ls-files docs/*.md', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
];

const fail = [];
const note = [];

/* ── 실제 개수를 잰다 ─────────────────────────────────────────── */

const actual = new Map();
for (const script of COUNTED) {
  process.stdout.write(`  재는 중  ${script} … `);
  let out;
  try {
    out = execSync(`npm run --silent ${script}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    // 검사가 실패해도 개수는 읽어 둔다 — 개수 대조와 검사 통과는 별개 문제다
    out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    note.push(`${script} 자체가 실패했다 — 개수만 읽었다. 그 검사를 먼저 고친다`);
  }
  const hits = [...out.matchAll(/(\d+)개 검사 통과/g)];
  if (hits.length === 0) {
    fail.push(`${script}: 출력에서 "N개 검사 통과"를 못 찾았다. 문구를 바꿨다면 이 스크립트도 고친다`);
    console.log('?');
    continue;
  }
  const n = Number(hits.at(-1)[1]);
  actual.set(script, n);
  console.log(`${n}개`);
}

/* ── ① 정본: docs/README.md §3 ───────────────────────────────── */

const readme = readFileSync(join(ROOT, 'docs/README.md'), 'utf8');
for (const [script, n] of actual) {
  const re = new RegExp(`npm run ${script.replace(':', ':')}\\s+#\\s*(\\d+)개`);
  const m = readme.match(re);
  if (!m) {
    fail.push(`정본 누락 — docs/README.md §3에 \`npm run ${script}   # ${n}개\` 줄이 없다`);
    continue;
  }
  if (Number(m[1]) !== n) {
    fail.push(`정본 어긋남 — docs/README.md §3: ${script} 문서 ${m[1]}개 ≠ 실제 ${n}개`);
  }
}

/* ── ② 중복: 다른 곳이 또 적은 숫자 ──────────────────────────── */

const allowed = (file, line) =>
  ALLOW.some((a) => a.file === file && line.includes(a.contains));

let dupChecked = 0;
for (const file of DOCS) {
  const lines = readFileSync(join(ROOT, file), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [script, n] of actual) {
      if (!line.includes(script)) continue;
      // 정본 블록은 ①이 이미 봤다
      if (file === 'docs/README.md' && /npm run \S+\s+#\s*\d+개/.test(line)) continue;
      // "15개 언어"는 검사 개수가 아니다. 예외로 하나씩 넣지 않고 규칙으로 뺀다
      const nums = [...line.replace(/\d+개 언어/g, '').matchAll(/(\d+)개/g)].map((m) =>
        Number(m[1]),
      );
      if (nums.length === 0) continue; // 개수 주장이 없는 언급 — 통과
      if (allowed(file, line)) continue;
      dupChecked += 1;
      if (!nums.includes(n)) {
        fail.push(
          `중복 어긋남 — ${file}:${i + 1}\n` +
            `    ${line.trim().slice(0, 110)}\n` +
            `    ${script}의 실제는 ${n}개인데 이 줄의 숫자는 ${nums.join('·')}개다.\n` +
            `    고칠 게 아니면(과거 기록 등) scripts/check-doc-counts.mjs의 ALLOW에 이유와 함께 넣는다`,
        );
      }
    }
  });
}

/* ── 보고 ─────────────────────────────────────────────────────── */

console.log('');
for (const n of note) console.log(`  ⚠  ${n}`);

if (fail.length > 0) {
  console.log('');
  for (const f of fail) console.log(`  🔴 ${f}`);
  console.log(`\n문서 개수 대조 실패 — ${fail.length}건\n`);
  process.exit(1);
}

console.log(
  `문서 개수 대조 ok — 정본 ${actual.size}개 · 중복 ${dupChecked}개 · 예외 ${ALLOW.length}개\n`,
);
