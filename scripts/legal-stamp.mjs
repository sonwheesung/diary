/**
 * 번역본에 정본 지문을 찍는다 — `npm run legal:stamp`
 *
 * 🔴 **이 명령을 돌리기 전에 해당 언어를 다시 읽어야 한다.**
 *   지문은 "번역이 최신이다"라는 **선언**이지 검증이 아니다. 읽지 않고 찍으면
 *   낡은 번역에 최신 도장을 찍는 것이고, 그건 아무 장치도 없는 것보다 나쁘다
 *   (있다고 믿게 되니까).
 *
 * 그래서 **언어를 반드시 지정**하게 했다. `--all`은 일부러 만들지 않았다 —
 * 한 번에 14개를 찍는 명령이 있으면 결국 읽지 않고 찍는다.
 *
 * 🔴 **세 문서를 전부 찍는다**(2026-08-23 수정).
 *
 *   전에는 `fingerprint(PRIVACY)` 하나로 `/sourceFingerprint: '...'/`를 **non-global**
 *   치환했다 — 파일의 **첫 번째** 지문, 즉 `PRIVACY_<LANG>`만 바뀌고
 *   `DELETE_ACCOUNT_<LANG>`·`TERMS_<LANG>`은 영영 낡은 채로 남았다.
 *   그런데 `check:legal`은 **세 문서의 지문을 각각** 대조한다 — 도구가 만들 수 없는 상태를
 *   검사가 요구하고 있었던 셈이다.
 *
 *   처리방침 승격(2026-08-23)에서 드러났다. 번역을 맡은 세 에이전트가 **각자** 같은 곳에 걸려
 *   delete-account 지문을 손으로 넣었다. 손으로 넣는다는 것은 곧 언젠가 **틀린 값을 넣는다**는
 *   뜻이고, 지문이 틀리면 낡은 번역이 최신으로 보인다 — 아무 장치도 없는 것보다 나쁘다.
 *
 * 사용법:
 *   node scripts/legal-stamp.mjs en        한국어를 다시 읽고 en을 고친 뒤
 *   node scripts/legal-stamp.mjs --check   지금 어긋난 것만 보여준다(쓰지 않는다)
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { fingerprint } from '../features/legal/fingerprint.ts';
import { DELETE_ACCOUNT, PRIVACY, TERMS } from '../features/legal/legal-text.ts';
import {
  DELETE_ACCOUNT_TRANSLATIONS,
  TERMS_TRANSLATIONS,
  TRANSLATIONS,
} from '../features/legal/registry.ts';

/** ⚠ 문서마다 지문이 다르다. 한 값으로 셋을 덮으면 안 된다. */
const DOCS = [
  { key: 'privacy', prefix: 'PRIVACY_', source: PRIVACY, translations: TRANSLATIONS },
  {
    key: 'delete-account',
    prefix: 'DELETE_ACCOUNT_',
    source: DELETE_ACCOUNT,
    translations: DELETE_ACCOUNT_TRANSLATIONS,
  },
  { key: 'terms', prefix: 'TERMS_', source: TERMS, translations: TERMS_TRANSLATIONS },
];

/**
 * `export const <PREFIX><LANG>: LegalDoc = {` **선언 블록 안의 첫 지문**만 바꾼다.
 *
 * ⚠ 파일 안의 등장 순서에 기대지 않는다 — 순서로 찾으면 문서를 재배치하는 순간
 *   조용히 엉뚱한 문서에 도장을 찍고, 그건 검사를 통과하면서 틀린 상태다.
 */
const stampDoc = (src, prefix, value) => {
  const at = src.search(new RegExp(`export const ${prefix}[A-Za-z_]+: LegalDoc = \\{`));
  if (at === -1) return null;
  const hit = /sourceFingerprint: '[0-9a-f]{8}'/.exec(src.slice(at));
  if (hit === null) return null;
  const from = at + hit.index;
  return src.slice(0, from) + `sourceFingerprint: '${value}'` + src.slice(from + hit[0].length);
};

const arg = process.argv[2];

if (arg === undefined || arg === '--help') {
  console.log('\n현재 정본 지문');
  for (const d of DOCS) console.log(`  ${d.key.padEnd(15)} ${fingerprint(d.source)}`);
  console.log('\n사용법: node scripts/legal-stamp.mjs <lang>   (예: en, ja, zh-Hans)');
  console.log('        node scripts/legal-stamp.mjs --check\n');
  process.exit(1);
}

const stale = DOCS.flatMap((d) => {
  const want = fingerprint(d.source);
  return Object.entries(d.translations)
    .filter(([, doc]) => doc.sourceFingerprint !== want)
    .map(([lang, doc]) => ({ doc: d.key, lang, has: doc.sourceFingerprint, want }));
});

if (arg === '--check') {
  if (stale.length === 0) {
    console.log('\n모든 번역이 현재 정본을 보고 있다.\n');
    process.exit(0);
  }
  console.log(`\n⚠ 어긋난 것 ${stale.length}개 — 한국어를 다시 읽고 고친 뒤 각각 stamp 한다:\n`);
  for (const s of stale) {
    console.log(`  ${s.doc.padEnd(15)} ${s.lang.padEnd(9)} ${s.has} → ${s.want}`);
  }
  console.log('');
  process.exit(1);
}

if (TRANSLATIONS[arg] === undefined) {
  console.error(`\n모르는 언어: ${arg}\n있는 것: ${Object.keys(TRANSLATIONS).join(', ')}\n`);
  process.exit(1);
}

const file = `features/legal/translations/${arg}.ts`;
let src = readFileSync(file, 'utf8');
const done = [];

for (const d of DOCS) {
  const value = fingerprint(d.source);
  const next = stampDoc(src, d.prefix, value);
  if (next === null) {
    console.error(`\n${file}에서 ${d.prefix}<LANG>의 sourceFingerprint를 찾지 못했다.\n`);
    process.exit(1);
  }
  src = next;
  done.push(`${d.key.padEnd(15)} ${value}`);
}

writeFileSync(file, src, 'utf8');
console.log(`\n${arg} 에 찍었다:`);
for (const line of done) console.log(`  ${line}`);
console.log('\n⚠ 정말 다시 읽고 고쳤는지 확인한다. 이 도장은 선언이지 검증이 아니다.\n');
