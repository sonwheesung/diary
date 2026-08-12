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
 * 사용법:
 *   node scripts/legal-stamp.mjs en        한국어를 다시 읽고 en을 고친 뒤
 *   node scripts/legal-stamp.mjs --check   지금 어긋난 언어만 보여준다(쓰지 않는다)
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { PRIVACY } from '../features/legal/legal-text.ts';
import { fingerprint } from '../features/legal/fingerprint.ts';
import { TRANSLATIONS } from '../features/legal/registry.ts';

const current = fingerprint(PRIVACY);
const arg = process.argv[2];

if (arg === undefined || arg === '--help') {
  console.log(`\n현재 정본 지문: ${current}\n`);
  console.log('사용법: node scripts/legal-stamp.mjs <lang>   (예: en, ja, zh-Hans)');
  console.log('        node scripts/legal-stamp.mjs --check\n');
  process.exit(1);
}

const stale = Object.entries(TRANSLATIONS).filter(([, doc]) => doc.sourceFingerprint !== current);

if (arg === '--check') {
  console.log(`\n정본 지문: ${current}`);
  if (stale.length === 0) {
    console.log('모든 번역이 현재 정본을 보고 있다.\n');
    process.exit(0);
  }
  console.log(`\n⚠ 어긋난 언어 ${stale.length}개 — 한국어를 다시 읽고 고친 뒤 각각 stamp 한다:\n`);
  for (const [lang, doc] of stale) {
    console.log(`  ${lang.padEnd(9)} ${doc.sourceFingerprint} → ${current}`);
  }
  console.log('');
  process.exit(1);
}

const doc = TRANSLATIONS[arg];
if (doc === undefined) {
  console.error(`\n모르는 언어: ${arg}\n있는 것: ${Object.keys(TRANSLATIONS).join(', ')}\n`);
  process.exit(1);
}

const file = `features/legal/translations/${arg}.ts`;
const src = readFileSync(file, 'utf8');
const pattern = /sourceFingerprint: '[0-9a-f]{8}'/;
if (!pattern.test(src)) {
  console.error(`\n${file}에 sourceFingerprint 줄이 없다. 먼저 추가한다.\n`);
  process.exit(1);
}
writeFileSync(file, src.replace(pattern, `sourceFingerprint: '${current}'`), 'utf8');
console.log(`\n${arg} → ${current} 로 찍었다.`);
console.log('⚠ 정말 다시 읽고 고쳤는지 확인한다. 이 도장은 선언이지 검증이 아니다.\n');
