/**
 * 연타 가드 검사 — `npm run check:tap-guard`
 *
 * 🔴 **순수 계층으로는 원리적으로 못 잡는다.** 두 번째 탭이 언제 닿는지는 RN 이벤트 타이밍이고,
 *   화면은 두 경우 모두 *"만드는 중"* 으로 똑같이 보인다. 그래서 **소스를 읽는다**
 *   (`check:age-gate` §⑥ · `check:backup-crypto` 배선 가드와 같은 수법).
 *
 * 🔴 **왜 `disabled` 로 충분하지 않은가**: 핸들러 첫 줄이 `await`(SQLite 조회·권한 확인)이면
 *   `setBusy(true)` 까지 버튼이 **살아 있다.** 2026-09-10 실측 — `report.tsx` 의 `onCreate` 가
 *   `hasAiConsent()` 를 기다린 뒤에야 상태를 올려서, 그 창에 두 번 누르면 리포트 요청이 둘 나가고
 *   서버는 캡을 *읽고 나서* 모델을 부르므로 **둘 다 통과해 돈이 두 번** 나간다.
 *
 * 여기 적힌 핸들러는 **되돌릴 수 없거나 돈이 나가는 것**들이다. 새로 그런 버튼을 만들면 이 목록에 더한다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (rel) => readFileSync(join(HERE, rel), 'utf8').split('\r\n').join('\n');

let passed = 0;
const failures = [];
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
    console.log(`  🔴   ${name}`);
  }
}
function assert(cond, message) {
  if (!cond) throw new Error(message);
}

/** [파일, 핸들러, 왜 위험한가] */
const GUARDED = [
  ['app/(tabs)/report.tsx', 'onCreate', '모델을 부른다 — 두 번 나가면 돈이 두 번이고 캡은 평생 1회다'],
  ['app/backup.tsx', 'enable', '백업 비밀을 만든다 — 두 번이면 금고가 갈린다'],
  ['app/backup.tsx', 'backupNow', '세대를 올린다 — 두 번이면 seq 가 충돌한다'],
  ['app/backup-restore.tsx', 'restoreFromThisDevice', '로컬을 통째로 교체한다'],
  ['app/backup-restore.tsx', 'submitCode', '복구 코드로 금고를 연다'],
  ['app/backup-restore.tsx', 'apply', '로컬을 통째로 교체한다'],
  ['app/subscribe.tsx', 'buy', '🔴 결제다'],
  ['app/subscribe.tsx', 'doRestore', '구매 복원 — 스토어 왕복'],
  ['app/support.tsx', 'submit', '문의가 두 건 등록된다'],
  ['app/support.tsx', 'handleSignIn', '구글 로그인 창이 두 번 뜬다'],
];

console.log('연타 가드 — 되돌릴 수 없거나 돈이 나가는 버튼\n');

check('🔴 훅이 ref 로 잠근다 — state 로는 못 막는다 (대조군)', () => {
  const hook = read('hooks/use-once.ts');
  assert(hook.includes('useRef'), '`use-once.ts` 가 ref 를 안 쓴다 — 상태로는 같은 틱을 못 막는다');
  /*
   * ⚠ **호출 형태로 센다**(`useState(`). 그냥 `useState` 로 세면 *이 훅이 왜 state 를 안 쓰는지*
   *   설명하는 **주석에 걸린다** — 실제로 처음 돌렸을 때 그렇게 빨개졌다. 오늘만 두 번째다
   *   (`check:ai` 도 주석 속 `return ok({` 를 블록으로 셌다). **산문이 소스 검사를 이긴다.**
   */
  assert(!/useState\(/.test(hook), '`use-once.ts` 가 useState 를 쓴다 — 잠금이 한 틱 늦어진다');
  assert(hook.includes('finally'), '`finally` 로 안 풀면 던진 뒤 그 버튼이 영영 안 눌린다');
});

for (const [file, handler, why] of GUARDED) {
  check(`🔴 \`${file}\` 의 \`${handler}\` 가 잠긴다 — ${why}`, () => {
    assert(existsSync(join(HERE, file)), `${file} 이 없다 — 목록이 낡았다`);
    const src = read(file);
    /*
     * 🔴 **대조군을 먼저 센다.** 핸들러 이름이 바뀌면 아래 정규식이 0을 만나는데, 그때
     *   *"가드가 없다"* 가 아니라 **"이 검사가 대상을 잃었다"** 로 읽어야 한다.
     *   이 줄이 없으면 이름만 바꿔도 검사가 조용히 무의미해진다.
     */
    assert(src.includes(handler), `${file} 에 \`${handler}\` 가 없다 — 이름이 바뀌었나. 목록을 고친다`);
    assert(
      new RegExp(`const ${handler} = useOnce\\(`).test(src),
      `\`${handler}\` 가 \`useOnce(\` 로 안 감싸였다 — ${why}. ` +
        '`disabled`·`loading` 은 첫 await 앞의 창을 못 덮는다(hooks/use-once.ts 주석)',
    );
  });
}

console.log('');
if (failures.length > 0) {
  console.error(`연타 가드 실패 ${failures.length}건\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`연타 가드 ok — ${passed}개 검사 통과`);
