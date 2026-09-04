/**
 * 침묵 실패 스캔 — **사용자가 시작한 동작이 실패했는데 아무 말도 안 하는 자리**를 찾는다.
 *
 * 화면 파일(`app/`·`features/**\/components`)의 catch 블록과 실패 분기를 뽑는다.
 *
 * ⚠ **뜬다고 전부 결함은 아니다.** 일부러 삼키는 것이 맞는 자리가 있다(지원 안 하는 환경의
 *   선택 기능 · 이미 다른 곳이 말해주는 실패 · 되돌리기로 대신 말하는 토글).
 *   이 스캐너는 **후보를 모아줄 뿐** 판정은 사람이 한다.
 *
 * ## 기준선 **0건** (2026-09-04)
 *
 * 처음 돌렸을 때 8건이 나왔고 **둘이 진짜였다**(아래 표). 나머지 여섯은 말하는 수단이
 * 있는데 정규식이 못 본 것이라 창을 넓히고 패턴을 고쳤다 — 그래서 지금은 0이다.
 * 🔴 **새로 뜨는 것은 전부 봐야 한다.**
 *
 * | 자리 | 판정 |
 * |---|---|
 * | `backup-restore.tsx:82` | ✅ `setCodeError()`로 말한다(정규식이 못 본다) |
 * | `backup-restore.tsx:95` | ✅ `setCodeError(t('backup.fail.*'))` |
 * | `backup-restore.tsx:109` | ✅ `Alert.alert` — 창 밖이라 정규식이 못 본다 |
 * | `backup-restore.tsx:155` | ✅ **고쳤다**(2026-09-04) — `photosFailed`로 올려 문구를 바꾼다 |
 * | `search.tsx:91` | ✅ **고쳤다**(2026-09-04) — `setFailed(true)`. 전에는 실패가 "결과 없음"이었다 |
 * | `RecoveryCodeView.tsx:129` | ✅ `null`을 돌려주고 **호출부가 대조 실패로 말한다** |
 * | `DiaryEditor.tsx:182` | ✅ `setLoadError()` |
 * | `LockGate.tsx:60` | ✅ 화면 가림 플래그 — 지원 안 하는 환경에서 앱이 죽으면 안 된다 |
 *
 * ⚠ **새로 뜬 자리는 이 표에 넣지 말고 판정한다.** 삼키는 것이 맞으면 그 이유를
 *   **코드 주석에** 적고, 아니면 말을 붙인다.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'features'];
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e.name)) files.push(p.replace(/\\/g, '/'));
  }
})('.');

/** 사용자에게 말하는 수단 */
const FEEDBACK = /Alert\.alert|set\w*(Error|Failed)\b|Toast|showError|setNotice|setBanner/;

let total = 0;
for (const f of files) {
  if (!ROOTS.some((r) => f.startsWith(`./${r}/`))) continue;
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((line, i) => {
    if (/catch\s*(\([^)]*\))?\s*\{\s*$/.test(line)) {
      // 블록이 닫힐 때까지(최대 12줄) 본다 — 주석이 길어 8줄로는 짧다
      const inner = lines.slice(i + 1, i + 13).join('\n').split('\n    }')[0];
      if (!FEEDBACK.test(inner)) hits.push([i + 1, 'catch', line.trim()]);
    }
    if (/if\s*\(!\s*\w+\.ok\b|!result\.ok/.test(line)) {
      const near = lines.slice(Math.max(0, i - 2), i + 12).join('\n');
      if (!FEEDBACK.test(near)) hits.push([i + 1, 'fail-branch', line.trim().slice(0, 70)]);
    }
  });
  total += hits.length;
  if (hits.length > 0) {
    console.log(`\n${f}`);
    for (const [n, kind, text] of hits) {
      console.log(`  ${String(n).padStart(4)}  ${kind.padEnd(12)} ${text}`);
    }
  }
}
console.log(`\n후보 ${total}건 — 기준선 0건. 뜨면 전부 판정한다(파일 상단 표 참조)`);
