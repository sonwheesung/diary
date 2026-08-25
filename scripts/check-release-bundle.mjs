/**
 * 구운 AAB **안을** 검사한다 — `npm run check:release-bundle -- <프로필> [aab경로]`
 *
 * ## 🔴 왜 있나 — `check:release-env`는 **자기가 도는 셸**만 본다
 *
 * 2026-08-25에 v12를 굽다가 이렇게 됐다:
 *
 * ```
 * 셸 A   eval "$(node scripts/release-env.mjs production)"   →  check:release-env 통과 ✅
 * 셸 B   (키스토어만 다시 넣고) gradlew bundleRelease         →  EXPO_PUBLIC_* 이 없다
 * ```
 *
 * 결과: 번들에 **서버 URL도, RevenueCat 키도, 실제 광고 단위도 없었다.** 테스트 광고 단위만
 * 들어갔고, `keytool`로 서명은 맞았다. 그대로 올렸으면 v9와 **똑같은 사고**다
 * (`MONETIZATION_SYSTEM.md` §6.1.4 — *"v8·v9가 필수 값 3개를 빠뜨린 채 나갔다"*).
 *
 * 🔴 **환경을 검사하면 이 구멍이 남는다.** 검사한 셸과 구운 셸이 같다는 보장이 없기 때문이다.
 *   그래서 여기서는 **산출물을 연다.** 번들에 그 값이 실제로 박혔는지가 유일하게 확실한 증거다.
 *
 * ⚠ 이 검사가 통과해도 `check:release-env`는 여전히 필요하다 — 그쪽은 **들어가면 안 되는 것**
 *   (`.env.local`·개발 플래그)을 본다. 둘은 반대 방향을 지킨다.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const profileName = process.argv[2] ?? 'production';
const aabPath =
  process.argv[3] ?? join(ROOT, 'android/app/build/outputs/bundle/release/app-release.aab');

if (!existsSync(aabPath)) {
  console.error(`\nAAB가 없다: ${aabPath}\n`);
  process.exit(1);
}

const eas = JSON.parse(readFileSync(join(ROOT, 'eas.json'), 'utf8'));
const env = eas.build?.[profileName]?.env;
if (env === undefined) {
  console.error(`\neas.json에 '${profileName}' 프로필의 env가 없다\n`);
  process.exit(1);
}

/* ── 번들을 꺼낸다 ───────────────────────────────────────────── */

const work = mkdtempSync(join(tmpdir(), 'jogak-aab-'));
let bundle;
try {
  execFileSync('unzip', ['-q', '-o', aabPath, 'base/assets/index.android.bundle', '-d', work], {
    stdio: 'pipe',
  });
  bundle = readFileSync(join(work, 'base/assets/index.android.bundle'), 'latin1');
} catch (error) {
  console.error(`\n번들을 못 꺼냈다 — ${error.message}`);
  console.error('unzip 이 필요하다(Git Bash 에 들어 있다).\n');
  process.exit(1);
} finally {
  // 아래에서 문자열만 쓰므로 바로 치운다
  try {
    rmSync(work, { recursive: true, force: true });
  } catch {
    /* 지우기 실패는 검사 결과와 무관하다 */
  }
}

const fail = [];
const ok = [];

/**
 * 값이 **번들에 문자열로 박혔는가.**
 *
 * ⚠ `latin1`로 읽는다 — URL·키·광고 단위는 전부 ASCII라 이걸로 충분하고, UTF-8로 읽으면
 *   큰 파일에서 느리고 한글이 이스케이프돼 있어 어차피 그대로는 안 잡힌다.
 */
function mustContain(label, value) {
  if (bundle.includes(value)) ok.push(label);
  else fail.push(`${label} — 번들에 없다: ${redact(value)}`);
}

function mustNotContain(label, value) {
  if (bundle.includes(value)) fail.push(`${label} — 번들에 있으면 안 된다: ${redact(value)}`);
  else ok.push(label);
}

/** 키를 통째로 찍지 않는다. 있는지 없는지만 말하면 된다 */
function redact(value) {
  return value.length > 24 ? `${value.slice(0, 12)}…${value.slice(-6)}` : value;
}

/* ── ① 프로필이 말한 값이 실제로 박혔나 ─────────────────────── */

for (const [key, value] of Object.entries(env)) {
  /*
   * `1`·`true` 같은 플래그는 문자열로 찾을 수 없다 — 번들 어디에나 있는 값이라 찾아봐야
   * 아무것도 증명하지 못한다. 그런 것은 **효과**로 확인한다(아래 광고 단위).
   */
  if (value.length < 8) continue;
  /*
   * ⚠ **거짓 초록이 하나 있다.** `EXPO_PUBLIC_SERVER_URL`은 코드의 **기본값과 같은 문자열**이라
   *   env가 안 들어가도 번들에 있다. 그래서 이 키의 ok는 아무것도 증명하지 못한다 —
   *   실제로 v12 첫 빌드에서 이 줄만 통과하고 나머지가 다 실패했다.
   *   기본값이 다른 키(`BACKUP_SERVER_URL`·`REVENUECAT_ANDROID_KEY`)가 진짜 신호다.
   */
  mustContain(key, value);
}

/* ── ② 광고 — 플래그가 아니라 **효과**를 본다 ───────────────── */

const REAL_AD_PREFIX = 'ca-app-pub-2731473780180274/';
const TEST_AD_PREFIX = 'ca-app-pub-3940256099942544/';

if (env.EXPO_PUBLIC_ADS_REAL === '1') {
  mustContain('광고 — 실제 단위', REAL_AD_PREFIX);
  /*
   * ⚠ 테스트 단위가 **남아 있는 것 자체는 정상이다.** `ads.ts`가 `__DEV__` 분기로 둘 다 들고
   *   있어서다. 실제 단위가 있느냐가 판정이고, 없으면 릴리스가 테스트 광고로 나간다.
   */
  if (bundle.includes(TEST_AD_PREFIX)) {
    ok.push('광고 — 테스트 단위도 들어 있다(분기라 정상)');
  }
}

/* ── ③ 들어가면 안 되는 것 ──────────────────────────────────── */

mustNotContain('개발 서버 주소', '10.0.2.2');

/*
 * ⚠ ~~`dev-emulator` 토큰이 있으면 안 된다~~ → **있는 것이 정상이다**(2026-08-25 정정).
 *   `DEV_SESSION_TOKEN`은 `dev-auth.ts`에 상수로 있어 릴리스 번들에도 들어간다. 막는 것은
 *   문자열이 아니라 **플래그**(`EXPO_PUBLIC_DEV_LOGIN`)이고, 토큰 자체는 **fail-closed**다 —
 *   배포된 서버가 401로 거절한다(`server/lib/auth.ts`, `AUTH_STUB`은 non-production 전용).
 *   §12 2026-08-18이 *"소스가 아니라 빌드 게이트가 맞는 자리"* 라고 적어둔 그 판단이다.
 *
 * 🔴 플래그가 켜졌는지는 **번들에서 알 수 없다** — 값이 `1`이라 문자열로 못 찾는다.
 *   그건 `check:release-env`가 셸에서 본다. 두 검사가 반대 방향을 지키는 이유가 이것이다.
 */

/* ── 보고 ────────────────────────────────────────────────────── */

console.log('');
console.log(`  AAB   ${aabPath}`);
console.log(`  프로필 ${profileName}`);
console.log('');
for (const line of ok) console.log(`  ok   ${line}`);

if (fail.length > 0) {
  console.log('');
  for (const f of fail) console.error(`  🔴 ${f}`);
  console.error('\n🔴 이 AAB를 올리면 안 된다 — 프로필 값이 번들에 안 들어갔다.');
  console.error('   빌드 셸에서 env를 넣고 **같은 셸에서** 다시 굽는다:');
  console.error('     eval "$(node scripts/release-env.mjs production)"');
  console.error('     set -a; . /c/project/secrets/jogak-prod-keystore.env; set +a');
  console.error('     export JOGAK_UPLOAD_STORE_FILE="$KEYSTORE_PATH" …');
  console.error('     (android/) ./gradlew bundleRelease …\n');
  process.exit(1);
}
console.log(`\n릴리스 번들 ok — ${ok.length}개 검사 통과\n`);
