/**
 * OTA 번들 검사 — `npm run check:ota-bundle`
 *
 * 🔴 **`check:release-bundle` 이 못 보는 자리다.** 그건 AAB 를 열고, OTA 는 **별도 metro export** 라
 *   그 검사를 안 지난다. 2026-09-09 에 첫 발행 번들에 `http://10.0.2.2:3200`(개발 백업 서버)이
 *   박힌 채 나갔고, 프로덕션 주소는 **0건**이었다. 발행 자체는 성공했다 — 조용한 실패다.
 *
 * ☠ OTA 는 스토어보다 되돌리기가 비싸다. 스토어는 심사 전에 멈추지만 OTA 는 기기로 바로 간다.
 *
 * 🔴 **Hermes 번들에 `strings` 를 쓰지 않는다.** 문자열 테이블을 못 읽어 **대조군까지 0** 이 나온다
 *   (2026-09-09 에 실제로 그렇게 읽고 "깨끗하다"고 잘못 판정했다). 바이트로 직접 찾고,
 *   비ASCII 는 UTF-16LE 도 함께 본다(2026-09-02 Hermes 교훈과 같은 축이다).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const DIR = 'dist/_expo/static/js/android';
if (!existsSync(DIR)) {
  console.error(`OTA 번들이 없다: ${DIR}\n  먼저 발행하거나 export 한다.`);
  process.exit(1);
}
const file = readdirSync(DIR).find((f) => f.endsWith('.hbc'));
if (file === undefined) {
  console.error(`${DIR} 에 .hbc 가 없다`);
  process.exit(1);
}
const buf = readFileSync(`${DIR}/${file}`);

/** ASCII 와 UTF-16LE 양쪽으로 센다 */
function count(needle) {
  let total = 0;
  for (const enc of ['latin1', 'utf16le']) {
    const nb = Buffer.from(needle, enc);
    let i = 0;
    while ((i = buf.indexOf(nb, i)) >= 0) {
      total += 1;
      i += nb.length;
    }
  }
  return total;
}

/**
 * 🔴 **대조군을 먼저 센다.** 여기가 0 이면 세는 방법이 틀린 것이지 번들이 빈 것이 아니다.
 *   이 줄이 없었으면 2026-09-09 의 오판이 그대로 통과했다.
 */
const CONTROL = [
  ['조각', '앱 이름(비ASCII — UTF-16LE 경로를 함께 검증한다)'],
  ['common-server.vercel.app', '공통 서버 주소'],
];
/** 들어가야 하는 것 */
const REQUIRED = [['jogak-stg.vercel.app', '백업·AI 서버(프로덕션)']];
/** 들어가면 안 되는 것 */
const FORBIDDEN = [
  ['10.0.2.2', '에뮬레이터 호스트 루프백(.env.local)'],
  ['192.168.', '사설망 주소'],
  ['127.0.0.1', '로컬 루프백'],
  ['.ts.net', 'tailnet 주소(던전가이드 실측 사례)'],
  ['ngrok', '터널 주소'],
  ['exp://', '개발 서버 스킴'],
  ['goog_JsZRpuPPSFoiqKjXHqbjoMlgwwU', 'stg RevenueCat 키'],
];

const fails = [];
console.log(`OTA 번들 ${file} (${buf.length} B)\n`);

console.log('  대조군 — 여기가 0 이면 세는 방법을 의심한다');
for (const [s, why] of CONTROL) {
  const n = count(s);
  console.log(`    ${n > 0 ? 'ok  ' : '🔴  '} ${s.padEnd(28)} ${n}  ${why}`);
  if (n === 0) fails.push(`대조군 "${s}" 이 0 — 세는 방법이 틀렸다. 이 결과 전체를 믿지 않는다`);
}

console.log('\n  들어가야 하는 것');
for (const [s, why] of REQUIRED) {
  const n = count(s);
  console.log(`    ${n > 0 ? 'ok  ' : '🔴  '} ${s.padEnd(28)} ${n}  ${why}`);
  if (n === 0) fails.push(`"${s}" 이 번들에 없다 — ${why}`);
}

console.log('\n  들어가면 안 되는 것');
for (const [s, why] of FORBIDDEN) {
  const n = count(s);
  console.log(`    ${n === 0 ? 'ok  ' : '🔴  '} ${s.padEnd(28)} ${n}  ${why}`);
  if (n > 0) fails.push(`"${s}" 이 번들에 박혔다 — ${why}`);
}

if (fails.length > 0) {
  console.error(`\nOTA 번들 검사 실패 ${fails.length}건\n`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  console.error('\n🔴 이미 발행했다면 `eas update:delete <groupId>` 로 지운다. 기기로 바로 간다.');
  process.exit(1);
}
console.log(`\nOTA 번들 ok — ${CONTROL.length + REQUIRED.length + FORBIDDEN.length}개 검사 통과`);
