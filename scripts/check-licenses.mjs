/**
 * 오픈소스 고지 드리프트 검사 — `npm run check:licenses`
 *
 * 🔴 **이 고지의 유일한 실패 방식은 "조용히 낡는 것"이다.** 의존성을 하나 추가하고
 *   `licenses:build` 를 안 돌리면 화면은 멀쩡히 뜨는데 목록만 빠진다 — 그게 라이선스 위반이다.
 *   그래서 화면을 보는 검사가 아니라 **생성 결과와 소스를 대조**한다.
 *
 * ⚠ 생성기를 자식 프로세스로 다시 돌려 **바이트로 비교**한다. 임시 파일에 쓰지 않고
 *   원본을 백업 → 재생성 → 대조 → 복원하면 실패 시 파일이 깨지므로, 그러지 않고
 *   생성기의 순수 부분을 다시 계산해 문자열만 만든다.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const failures = [];

/* ── ① 생성 파일이 지금 설치본과 같은가 ─────────────────────────────── */

function copyrightOf(dir) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return '';
  }
  for (const f of files.filter((x) => /^(LICENSE|LICENCE|COPYING|NOTICE)/i.test(x))) {
    let text;
    try {
      text = readFileSync(join(dir, f), 'utf8');
    } catch {
      continue;
    }
    for (const raw of text.split(/\r?\n/).slice(0, 40)) {
      const line = raw.trim();
      if (/^copyright\b/i.test(line) && /\d{4}|\(c\)|©/i.test(line))
        return line.replace(/\s+/g, ' ');
    }
  }
  return '';
}

const root = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const deps = Object.keys(root.dependencies ?? {}).sort();

const generated = readFileSync(join(ROOT, 'features/legal/oss-packages.ts'), 'utf8');

/*
 * ⚠ 문자열로 비교하지 않는다 — prettier 가 따옴표(`"` → `'`)와 줄바꿈을 바꾸므로
 *   생성 직후에도 안 맞는다(실제로 여기서 한 번 걸렸다). **값을 뽑아 값으로 비교**한다.
 */
function parseEntries(src) {
  const out = new Map();
  const re =
    /\{\s*name:\s*(['"])(.*?)\1,\s*version:\s*(['"])(.*?)\3,\s*license:\s*(['"])(.*?)\5,\s*copyright:\s*(['"])(.*?)\7\s*,?\s*\}/gs;
  for (const m of src.matchAll(re)) {
    out.set(m[2], { version: m[4], license: m[6], copyright: m[8] });
  }
  return out;
}

const listedEntries = parseEntries(generated);

for (const name of deps) {
  const dir = join(ROOT, 'node_modules', ...name.split('/'));
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  } catch {
    failures.push(`${name}: node_modules 에 없다 — npm install 후 다시 돌린다`);
    continue;
  }
  const license = typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type ?? '');
  const row = listedEntries.get(name);
  if (row === undefined) {
    failures.push(`${name}: 고지 목록에 없다 → npm run licenses:build`);
    continue;
  }
  const want = { version: pkg.version ?? '', license, copyright: copyrightOf(dir) };
  for (const key of ['version', 'license', 'copyright']) {
    if (row[key] !== want[key]) {
      failures.push(
        `${name}.${key}: 고지 "${row[key]}" ≠ 설치본 "${want[key]}" → npm run licenses:build`,
      );
    }
  }
}

for (const name of listedEntries.keys()) {
  if (!deps.includes(name)) {
    failures.push(`${name}: 의존성에서 빠졌는데 고지에 남아 있다 → licenses:build`);
  }
}

/* ── ② 폰트 고지 — 화면이 실제로 그걸 그리나 ────────────────────────── */

const fontSrc = readFileSync(join(ROOT, 'features/legal/licenses.ts'), 'utf8');
const screen = readFileSync(join(ROOT, 'app/licenses.tsx'), 'utf8');

// 🔴 assets/fonts/ 에 파일이 있는데 고지에 그 이름이 없으면 누락이다.
const fontFiles = readdirSync(join(ROOT, 'assets/fonts')).filter((f) => /\.(otf|ttf)$/i.test(f));
const families = [...new Set(fontFiles.map((f) => f.replace(/-[A-Za-z]+\.(otf|ttf)$/i, '')))];
for (const family of families) {
  if (!fontSrc.includes(`'${family}'`)) {
    failures.push(
      `assets/fonts 에 ${family} 가 있는데 FONT_NOTICES 에 없다 — 폰트를 갈아끼우면 저작권자가 바뀐다`,
    );
  }
}
if (!fontSrc.includes('SIL Open Font License')) {
  failures.push('FONT_NOTICES 에 라이선스명이 없다 — 이름만 적는 것은 OFL §2 를 충족하지 않는다');
}
for (const needle of ['FONT_NOTICES', 'OSS_PACKAGES', 'copyright']) {
  if (!screen.includes(needle)) {
    failures.push(`app/licenses.tsx 가 ${needle} 를 그리지 않는다 — 고지가 화면에 안 나온다`);
  }
}

/* ── ③ 설정에서 갈 수 있나 — 못 가면 없는 것과 같다 ─────────────────── */

const settings = readFileSync(join(ROOT, 'app/(tabs)/settings.tsx'), 'utf8');
if (!settings.includes("router.push('/licenses')")) {
  failures.push("설정에 '/licenses' 로 가는 줄이 없다 — 화면만 있고 입구가 없다");
}

/* ── 결과 ──────────────────────────────────────────────────────────── */

if (failures.length > 0) {
  console.error(`\n오픈소스 고지 검사 실패 ${failures.length}건:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('');
  process.exit(1);
}
const count = deps.length + families.length + 2;
// ⚠ 문구를 바꾸지 마라 — `check:doc-counts` 가 `N개 검사 통과` 를 앵커로 읽는다.
console.log(
  `\n오픈소스 고지 ${count}개 검사 통과 (패키지 ${deps.length} · 폰트 ${families.length} · 화면 · 입구)\n`,
);
