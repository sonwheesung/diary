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

if (failed) {
  process.exit(1);
}
console.log(`i18n ok — ${used.size} keys used, ${codes.join(' / ')}`);
