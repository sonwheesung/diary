/**
 * 번역 키 점검.
 *
 * 두 가지를 잡는다.
 *  ① 코드가 부르는 `t('...')` 키가 로케일 파일에 없는 경우 — 화면에 키 문자열이 그대로 뜬다.
 *  ② 언어끼리 키가 어긋난 경우 — 한쪽에만 있는 키는 그 언어에서만 조용히 폴백된다.
 *
 * 리터럴 키만 본다(`t(변수)`는 못 잡는다). 완벽한 검사가 아니라 **가장 흔한 사고**를 막는 그물이다.
 * 실행: `npm run check:i18n`
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['app', 'components', 'features', 'lib', 'hooks', 'db', 'store', 'theme'];
const LOCALE_DIR = 'locales';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (['.ts', '.tsx'].includes(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function flatten(value, prefix = '', out = new Set()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      flatten(child, path, out);
    } else {
      out.add(path);
    }
  }
  return out;
}

const locales = {};
for (const file of readdirSync(LOCALE_DIR)) {
  if (extname(file) !== '.json') continue;
  const code = file.replace('.json', '');
  locales[code] = flatten(JSON.parse(readFileSync(join(LOCALE_DIR, file), 'utf8')));
}

const codes = Object.keys(locales);
if (codes.length === 0) {
  console.error('locales/ 가 비어 있습니다.');
  process.exit(1);
}

let failed = false;

// ① 코드가 부르는 키
const CALL = /\b(?:t|translate)\(\s*'([a-zA-Z0-9_.]+)'/g;
const used = new Map();
for (const root of ROOTS) {
  let files;
  try {
    files = walk(root);
  } catch {
    continue; // 없는 폴더는 건너뛴다
  }
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(CALL)) {
      if (!used.has(match[1])) used.set(match[1], file);
    }
  }
}

const base = codes.includes('en') ? 'en' : codes[0];
for (const [key, file] of used) {
  for (const code of codes) {
    if (!locales[code].has(key)) {
      console.error(`missing  [${code}]  ${key}   (${file})`);
      failed = true;
    }
  }
}

// ② 언어끼리의 어긋남
for (const code of codes) {
  if (code === base) continue;
  for (const key of locales[base]) {
    if (!locales[code].has(key)) {
      console.error(`only in ${base}, not ${code}:  ${key}`);
      failed = true;
    }
  }
  for (const key of locales[code]) {
    if (!locales[base].has(key)) {
      console.error(`only in ${code}, not ${base}:  ${key}`);
      failed = true;
    }
  }
}

/*
 * ③ 🔴 다른 언어에 한글이 남아 있는가.
 *
 * **키가 다 있어도 값이 한국어면 검사는 통과하던 자리다.** 2026-08-12에 실제로 잡혔다 —
 * `report.seeSubscription`이 14개 언어에서 `조각 Pro`였고, 독일어 사용자에게 한글이 떴다.
 * 다른 언어에서 상품명은 `Jogak Pro`가 규약이다(`subscribe.title`이 그렇게 되어 있다).
 *
 * ⚠ 반대 방향(영어가 남아 있는가)은 검사하지 않는다 — `Backup`·`Update`처럼 그 언어에서
 *   그대로 쓰는 외래어가 많아 오탐이 너무 잦다. 한글은 그런 경우가 없다.
 */
const HANGUL = /[가-힣]/;
function collectValues(value, prefix = '', out = []) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      collectValues(child, path, out);
    } else if (typeof child === 'string') {
      out.push([path, child]);
    } else if (Array.isArray(child)) {
      child.forEach((v, i) => typeof v === 'string' && out.push([`${path}[${i}]`, v]));
    }
  }
  return out;
}
for (const file of readdirSync(LOCALE_DIR)) {
  if (extname(file) !== '.json' || file === 'ko.json') continue;
  const code = file.replace('.json', '');
  const raw = JSON.parse(readFileSync(join(LOCALE_DIR, file), 'utf8'));
  for (const [path, text] of collectValues(raw)) {
    if (HANGUL.test(text)) {
      console.error(`한글이 남아 있다:  ${code}  ${path}  =  ${text}`);
      failed = true;
    }
  }
}

/*
 * ④ 🔴 수(數) 일치를 요구하는 문장인가 (`docs/I18N_SYSTEM.md` §4.5).
 *
 * **2026-08-14에 실기기 화면에서 `1 entries`를 보고 잡았다.** 고치려고 훑어보니 같은 모양이
 * **50개**였고, 그중 `home.streak`는 **신규 사용자가 첫날 전원 보는 자리**였다("1 Tage in Folge").
 * ①~③은 전부 통과했다 — 키도 값도 멀쩡했고 틀린 것은 **문법**이다.
 *
 * 서명: 굴절 언어에서 `{{변수}}` **바로 뒤에 공백 + 낱말**이 오면 그 낱말이 수에 따라
 * 변해야 하는 자리다(`{{count}} entries` → `1 entries`). 안전한 모양은 셋이다:
 *   · 라벨형   `Entries: {{count}}`
 *   · 괄호형   `... ({{count}}) will be deleted`   ← ru가 원래 쓰던 방식
 *   · 붙임표·단위  `{{days}}-day streak` · `{{seconds}}s`
 *
 * ⚠ 굴절이 없는 언어(ko·ja·zh·th·vi·id·tr)는 보지 않는다 — 전부 오탐이 된다.
 */
const INFLECTED = ['en', 'de', 'fr', 'es', 'pt-BR', 'it', 'ru'];

/**
 * **세는 변수만 본다.** 날짜 조각(`day`·`year`·`week`·`monthName`…)은 뒤에 전치사가 붙는
 * 날짜 틀이라 수 일치와 무관하고, `period`·`vendor` 같은 문자열 변수도 마찬가지다.
 * 좁히지 않으면 **오탐이 참탐을 덮는다** — 처음 짰을 때 25건 중 대부분이 오탐이었다.
 */
const COUNTING = ['count', 'days', 'total', 'max', 'digits', 'dots', 'min', 'seconds', 'index'];
/** `{{세는변수}}` 바로 뒤에 공백(또는 NBSP) + 낱말이 오면 그 낱말이 수에 따라 변해야 한다 */
const AGREEMENT = new RegExp(
  String.raw`\{\{(?:` + COUNTING.join('|') + String.raw`)\}\}[\u0020\u00a0]+\p{L}`,
  'u',
);

/**
 * 면제 — **왜 안전한지를 키마다 적는다.** 근거 없는 면제는 구멍이다.
 *
 * ⚠ 추가할 때는 **호출부를 열어 확인**한다. "지금은 1이 안 나온다"가 아니라
 *   "구조상 못 나온다" 또는 "뒤 낱말이 불변화사다"여야 한다.
 */
const EXEMPT = new Map([
  /* ── 상수만 들어간다 (1이 될 수 없다) ─────────────────────────── */
  ['backup.offGraceNotice', 'GRACE_DAYS = 90 (features/backup/policy.ts)'],
  ['subscribe.consentWhen', '무료 체험 7일'],
  ['tags.max', '태그 상한'],
  ['lock.setup.pinNote', 'PIN_LENGTH = 4 (features/lock/api/lock-store.ts)'],
  ['lock.patternTooShort', '패턴 최소 4점'],
  ['lock.setup.patternNote', '패턴 최소 4점'],
  ['support.tooShort', '문의 최소 길이'],
  [
    'ageGate.blockedBody',
    // thresholdFor()가 16·14·13 **만** 돌려준다 — 1이 될 수 있는 분기가 없다.
    // 그 세 값을 check:age-gate가 지역 38종 × 출생연도 125년 전수로 확인한다.
    '연령 기준은 16·14·13 뿐이다 (features/auth/age-gate.ts thresholdFor)',
  ],
  /* ── 뒤 낱말이 수에 따라 변하지 않는다 ────────────────────────── */
  ['lock.blockedCountdown', '뒤가 단위 약어다 (s · с)'],
  ['backup.restoreLosingMore', '뒤가 불변화사다 (more · de plus · más · mais)'],
  ['backup.confirmCodeBody', '뒤가 분리동사 접두사다 (de: Gruppe 1 ein)'],
]);

for (const file of readdirSync(LOCALE_DIR)) {
  if (extname(file) !== '.json') continue;
  const code = file.replace('.json', '');
  if (!INFLECTED.includes(code)) continue;
  const raw = JSON.parse(readFileSync(join(LOCALE_DIR, file), 'utf8'));
  for (const [path, text] of collectValues(raw)) {
    if (EXEMPT.has(path)) continue;
    if (!AGREEMENT.test(text)) continue;
    console.error(`수 일치가 깨질 수 있다(§4.5):  ${code}  ${path}  =  ${text}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log(`i18n ok — ${used.size} keys used, ${codes.join(' / ')}`);
