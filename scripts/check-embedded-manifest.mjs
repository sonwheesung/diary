/**
 * 임베드 매니페스트 검사 — `npm run check:embedded-manifest`
 *
 * 🔴 **바이너리 안에도 매니페스트가 있고, 기기는 둘 중 `commitTime` 이 새 쪽을 실행한다.**
 *   AAB 의 `app.manifest`(expo-updates 가 빌드 때 만든다)와 서버의 최신 OTA 를 견줘서,
 *   임베드가 낡았으면 **새 빌드를 깔아도 옛 OTA 로 돈다.** 설치는 되는데 코드가 안 바뀐다.
 *
 * 왜 낡을 수 있나: `createReleaseUpdatesResources` 태스크가 **`UP-TO-DATE` 로 건너뛰면**
 * 몇 달 전 `commitTime` 이 그대로 패키징된다. `commitTime` 은 그 태스크가 돌 때
 * `new Date().getTime()` 으로 찍히므로(`expo-updates/utils/build/createManifestForBuildAsync.js`),
 * **태스크가 돌기만 하면 항상 최신**이다. 문제는 안 도는 경우다.
 *
 * 정본: `C:/project/common/OTA_RULES.md` §3.1. 배구명가가 이 함정으로 versionCode 를
 * 하나 버렸다(INC-007: 임베드 7-11 vs 서버 8-30 → 깨끗한 기기가 8/30 번들로 돌았다).
 *
 * ⚠ **업로드 전에 돌린다.** versionCode 는 한 번 올리면 영구 소모다.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const BUNDLE_DIR = join(ROOT, 'android/app/build/outputs/bundle/release');

function die(message) {
  console.error(`\n🔴 임베드 매니페스트 검사 실패\n\n  ${message}\n`);
  process.exit(1);
}

/* ── ① AAB 를 찾는다 ─────────────────────────────────────────────────── */
if (!existsSync(BUNDLE_DIR)) {
  die(`AAB 가 없다: ${BUNDLE_DIR}\n  먼저 bash scripts/release/build-release-aab.sh 로 굽는다.`);
}
const aabs = readdirSync(BUNDLE_DIR)
  .filter((f) => f.endsWith('.aab'))
  .map((f) => ({ f, at: statSync(join(BUNDLE_DIR, f)).mtimeMs }))
  .sort((a, b) => b.at - a.at);
if (aabs.length === 0) {
  die(`${BUNDLE_DIR} 에 .aab 가 없다`);
}
const aab = join(BUNDLE_DIR, aabs[0].f);
console.log(`AAB  ${aabs[0].f}`);

/* ── ② 그 안의 app.manifest 를 읽는다 ────────────────────────────────── */
/*
 * 🔴 **경로를 글자로 고정하지 않는다.** 목록에서 찾는다 — AGP 가 자산 경로를 바꾸는 날
 *   `base/assets/app.manifest` 로 못 박아뒀으면 **"없다"가 아니라 "검사가 죽었다"** 인데
 *   그 둘이 같은 실패로 보인다. 그래서 **몇 개를 찾았는지** 먼저 센다.
 */
let listing;
try {
  listing = execFileSync('unzip', ['-Z1', aab], { encoding: 'utf8' });
} catch (error) {
  die(`AAB 를 못 열었다: ${error.message}`);
}
const entries = listing.split('\n').filter((line) => line.trim().endsWith('app.manifest'));
if (entries.length !== 1) {
  die(
    `AAB 안의 app.manifest 가 ${entries.length}개다(1개를 기대했다).\n` +
      `  0개면 expo-updates 가 자산을 안 넣은 것이고, 2개 이상이면 이 검사를 다시 봐야 한다.\n` +
      `  찾은 것: ${entries.join(' · ') || '(없음)'}`,
  );
}
let manifest;
try {
  manifest = JSON.parse(execFileSync('unzip', ['-p', aab, entries[0]], { encoding: 'utf8' }));
} catch (error) {
  die(`app.manifest 를 못 읽었다: ${error.message}`);
}
const commitTime = manifest.commitTime;
if (typeof commitTime !== 'number') {
  die(`app.manifest 에 commitTime 이 숫자로 없다: ${JSON.stringify(commitTime)}`);
}
console.log(`임베드 commitTime  ${new Date(commitTime).toISOString()}`);

/* ── ③ 서버의 최신 OTA 와 견준다 ────────────────────────────────────── */
function eas(args) {
  const out = execFileSync('npx', ['eas-cli', ...args], {
    encoding: 'utf8',
    cwd: ROOT,
    shell: true,
  });
  /*
   * ⚠ **먼저 오는 쪽을 고른다.** `update:list` 는 객체를, `update:view` 는 **배열**을 준다 —
   *   `{` 를 우선하면 배열 응답에서 **원소 안쪽부터** 잘라 뒤에 `]` 가 남아 파싱이 깨진다
   *   (2026-09-10 에 실제로 그렇게 죽었다). eas-cli 는 앞에 배너를 한 줄 붙인다.
   */
  const starts = ['{', '['].map((c) => out.indexOf(c)).filter((i) => i >= 0);
  if (starts.length === 0) {
    die(`eas-cli 출력에서 JSON 을 못 찾았다: ${out.slice(-200)}`);
  }
  return JSON.parse(out.slice(Math.min(...starts)));
}

const list = eas(['update:list', '--branch', 'production', '--json', '--non-interactive']);
const newest = list.currentPage?.[0];
if (newest === undefined) {
  console.log('\n발행된 OTA 가 없다 — 임베드가 항상 이긴다. ok');
  process.exit(0);
}
/* `update:list` 는 시각을 안 준다. 그룹으로 한 번 더 물어야 `createdAt` 이 나온다 */
const [detail] = eas(['update:view', newest.group, '--json']);
const otaAt = Date.parse(detail.createdAt);
if (Number.isNaN(otaAt)) {
  die(`최신 OTA 의 createdAt 을 못 읽었다: ${detail.createdAt}`);
}
console.log(`최신 OTA          ${detail.createdAt}  "${detail.message}"`);

if (commitTime <= otaAt) {
  die(
    `임베드가 최신 OTA 보다 낡았다(차이 ${Math.round((otaAt - commitTime) / 1000)}초).\n` +
      `  이 AAB 를 올리면 깨끗한 기기가 **부팅 즉시 옛 OTA 를 받아 그것으로 돈다** —\n` +
      `  이 빌드에 담은 JS 수정이 한 명에게도 안 간다(common/OTA_RULES.md §3.1).\n` +
      `  → createReleaseUpdatesResources 산출물을 지우고 다시 굽는다.\n` +
      `     rm -rf android/app/build/generated/assets/createReleaseUpdatesResources`,
  );
}

console.log(`\n임베드 매니페스트 ok — OTA 보다 ${Math.round((commitTime - otaAt) / 1000)}초 새롭다`);
