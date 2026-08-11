/**
 * 번역 적용기 — `node scripts/apply-translations.mjs <파일>`
 *
 * 번역 표를 JSON으로 받아 `locales/*.json`에 꽂는다. 손으로 15개 파일을 고치면
 * 반드시 한 언어를 빠뜨리고, 그 빠짐은 `check:i18n`이 아니라 **사용자가** 발견한다.
 *
 * ⚠ 자리표시자(`{{count}}` 등)를 원문과 대조해 다르면 **거부한다.**
 *   번역이 자리표시자를 빠뜨리면 화면에 숫자가 사라지는데, 눈으로는 잘 안 보인다.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const tablePath = process.argv[2];
if (!tablePath) {
  console.error('사용법: node scripts/apply-translations.mjs <번역표.json>');
  process.exit(1);
}

const tables = JSON.parse(readFileSync(tablePath, 'utf8'));
const en = JSON.parse(readFileSync('locales/en.json', 'utf8'));

const PLACEHOLDER = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;
const placeholders = (s) => [...s.matchAll(PLACEHOLDER)].map((m) => m[1]).sort().join(',');

const get = (obj, key) => key.split('.').reduce((o, k) => (o === undefined ? o : o[k]), obj);

let failures = 0;
for (const [lang, table] of Object.entries(tables)) {
  const path = `locales/${lang}.json`;
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  let applied = 0;

  for (const [key, value] of Object.entries(table)) {
    const source = get(en, key);
    if (typeof source !== 'string') {
      console.error(`  ✗ ${lang} ${key} — en.json에 없는 키`);
      failures += 1;
      continue;
    }
    if (placeholders(source) !== placeholders(value)) {
      console.error(`  ✗ ${lang} ${key} — 자리표시자 불일치 (원문 ${placeholders(source) || '없음'})`);
      failures += 1;
      continue;
    }
    const parts = key.split('.');
    let node = doc;
    for (const seg of parts.slice(0, -1)) node = node[seg];
    node[parts.at(-1)] = value;
    applied += 1;
  }

  // 키 순서를 알파벳으로 유지 — diff가 읽히게
  for (const section of ['backup', 'subscribe']) {
    if (doc[section] === undefined) continue;
    doc[section] = Object.fromEntries(Object.entries(doc[section]).sort(([a], [b]) => a.localeCompare(b)));
  }
  writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  console.log(`  ${lang}: ${applied}개 적용`);
}

if (failures > 0) {
  console.error(`\n${failures}개 실패 — 위 항목을 고친다.`);
  process.exit(1);
}
