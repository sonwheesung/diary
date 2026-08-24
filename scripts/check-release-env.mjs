/**
 * 릴리스 빌드 직전 환경 게이트 — `npm run check:release-env`
 *
 * ## 왜 필요한가 (2026-08-18에 겪은 것)
 *
 * EAS 빌드는 **깨끗한 컨테이너**에서 돈다. `.env.local`이 없다. 그래서 이 문제가
 * 존재한 적이 없었다. 그런데 EAS 무료 빌드 쿼터가 떨어져 **로컬에서 릴리스 AAB를
 * 굽자마자** 드러났다 — `expo prebuild`가 출력한 첫 줄이 이것이다:
 *
 * ```
 * env: load .env.local .env
 * env: export EXPO_PUBLIC_SERVER_URL … EXPO_PUBLIC_DEVICE_CHECK EXPO_PUBLIC_DEV_LOGIN …
 * ```
 *
 * `.env.local`에 들어 있던 값:
 *
 * | 변수 | 개발용 값 | 릴리스에 박히면 |
 * |---|---|---|
 * | `EXPO_PUBLIC_BACKUP_SERVER_URL` | `http://10.0.2.2:3200` | 백업·AI가 **에뮬레이터 localhost**를 본다 |
 * | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | 다른 키 | 검증하려던 결제가 **엉뚱한 앱**에 붙는다 |
 * | `EXPO_PUBLIC_DEVICE_CHECK` | `1` | 매 실행마다 **5MB 업로드 + DB 스왑**(`app/_layout.tsx` 주석이 경고하는 바로 그것) |
 *
 * 🔴 **`EXPO_PUBLIC_*`는 빌드 시점에 번들에 문자열로 박힌다.** 나중에 못 고친다 —
 *   앱을 다시 구워 다시 올리는 것 말고는 방법이 없다.
 *
 * ## 왜 `__DEV__` 가드로 풀지 않는가
 *
 * `EXPO_PUBLIC_DEV_LOGIN`은 이미 `__DEV__ && …`로 접힌다(`features/support/dev-auth.ts`).
 * 그런데 `EXPO_PUBLIC_DEVICE_CHECK`에 같은 걸 붙이면 **기능이 죽는다** —
 * 그 점검의 목적이 *"릴리스 번들에서 암호 처리량을 재는 것"* 이라 `__DEV__`로 막으면
 * 잴 수가 없다(dev 번들은 Hermes가 lazy 컴파일이라 수치가 틀린다).
 * `app/_layout.tsx`가 그 이유를 적어놨다. **그래서 소스가 아니라 여기서 막는다.**
 *
 * ⚠ 이 검사는 *"플래그가 있는가"* 만 본다. **값이 맞는지는 못 본다** —
 *   `EXPO_PUBLIC_BACKUP_SERVER_URL`이 운영을 가리키는지 stg를 가리키는지는
 *   사람이 정하는 것이라 여기서 판정하지 않는다. 그건 `eas.json` 프로필의 일이다.
 */
import { existsSync, readFileSync } from 'node:fs';

/**
 * 릴리스 번들에 절대 실리면 안 되는 플래그.
 *
 * ⚠ **`process.env[name]`으로 동적 접근하지 않는다.** `expo/no-dynamic-env-var`가 막는다 —
 *   Expo가 `EXPO_PUBLIC_*`를 **정적 치환**하기 때문에 동적 인덱싱은 앱 코드에서 조용히
 *   `undefined`가 된다. 이 파일은 Node 스크립트라 실제로는 동작하지만, **규칙을 끄지 않는다**:
 *   같은 습관이 앱 코드로 새면 그때는 진짜로 깨진다.
 */
const FORBIDDEN = [
  [
    'EXPO_PUBLIC_DEVICE_CHECK',
    process.env.EXPO_PUBLIC_DEVICE_CHECK,
    '매 실행마다 5MB를 올리고 DB를 스왑한다 (app/_layout.tsx)',
  ],
  [
    'EXPO_PUBLIC_DEV_LOGIN',
    process.env.EXPO_PUBLIC_DEV_LOGIN,
    '가짜 로그인. __DEV__가 접어주지만 번들에 문자열은 남는다',
  ],
];

/**
 * 릴리스 빌드에서 **읽히면 안 되는** env 파일들.
 *
 * ⚠ `.env`는 뺀다 — 거기에는 앱 어디서나 같은 값(공용 서버 URL·OAuth 클라이언트)만
 *   들어 있고 커밋돼 있다. 문제가 되는 것은 **기기·사람마다 다른** `.local` 쪽이다.
 */
const LOCAL_ENV_FILES = ['.env.local', '.env.production.local', '.env.development.local'];

/**
 * 🔴 **없으면 기능이 통째로 죽는 값들** (2026-08-24 추가).
 *
 * ## 왜 늦게 생겼나 — v8·v9가 이 구멍으로 나갔다
 *
 * 이 파일은 원래 **금지 목록만** 갖고 있었다. "개발용 값이 새어 들어가는가"만 보고
 * "있어야 할 값이 빠졌는가"는 아무도 안 봤다. 그 결과 클로즈드 테스트 43명이 받은
 * versionCode 9 번들에서 **세 개가 통째로 빠졌다**(설치된 APK를 뜯어 실측):
 *
 * | 빠진 값 | 결과 |
 * |---|---|
 * | `EXPO_PUBLIC_BACKUP_SERVER_URL` | 백업·**AI 리포트**가 `not-configured`로 죽는다 |
 * | `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | `purchasesConfigured()`가 false — **결제 화면이 안 열린다** |
 * | `EXPO_PUBLIC_ADS_REAL` | 실제 단위 0건 · 구글 테스트 단위만 |
 *
 * 즉 **조각 Pro의 세 기둥이 전부 죽은 빌드**가 나갔다. 화면에는 정상적인 미구현처럼
 * 보여서(*"백업 서버가 설정되지 않았어요"*, 버튼이 조용히 안 열림) 아무도 못 알아챘다.
 *
 * 두 갈래가 **같은 구멍**으로 빠진다:
 *   ① 로컬 릴리스 — `.env.local`을 옆으로 치우면 그 파일이 혼자 들고 있던 값이 같이 사라진다
 *   ② EAS `production` 프로필 — `eas.json`에 `BACKUP_SERVER_URL`이 아예 없었다
 *
 * 이 파일의 옛 주석은 *"값이 맞는지는 못 본다 … 그건 `eas.json` 프로필의 일이다"* 라고
 * 넘겼는데, **넘긴 그쪽도 안 들고 있었다.** 그래서 여기서 둘 다 본다.
 */
const REQUIRED = [
  ['EXPO_PUBLIC_SERVER_URL', '공지·문의·로그인·엔타이틀먼트가 전부 죽는다'],
  ['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', 'idToken audience가 없어 로그인이 전부 unauthorized가 된다'],
  ['EXPO_PUBLIC_BACKUP_SERVER_URL', '백업과 AI 리포트가 not-configured로 죽는다'],
  ['EXPO_PUBLIC_REVENUECAT_ANDROID_KEY', 'purchasesConfigured()가 false — 결제 화면이 안 열린다'],
];

/**
 * 광고는 **막지 않고 보고만 한다**(2026-08-24 사용자 결정).
 *
 * `EXPO_PUBLIC_ADS_REAL`이 없으면 구글 테스트 단위가 나간다. 그런데 이 앱은 AdMob에서
 * **"검토 필요 · 광고 게재가 제한됨"** 상태라(CLAUDE.md §7) 실제 단위를 박아도 노출이 0이다.
 * 없는 수익을 이유로 릴리스를 막으면 **가짜 블로커**가 된다 — 대신 어느 쪽으로 나가는지
 * 매번 눈에 보이게 적는다.
 */
const REPORTED = [['EXPO_PUBLIC_ADS_REAL', '실제 AdMob 단위', '구글 테스트 단위']];

/**
 * 🔴 **업로드 서명 키** — 없으면 `plugins/with-upload-signing.js`가 **디버그 키로 조용히 떨어진다**.
 *
 * 그 플러그인 주석이 *"릴리스는 반드시 `check:release-env`를 먼저 통과시킨다"* 고 넘기는데,
 * **넘긴 이쪽이 안 보고 있었다**(2026-08-24 발견). 필수 env를 더하며 같이 잡았다 —
 * `production` 프로필에 `BACKUP_SERVER_URL`이 없던 것과 **정확히 같은 종류**의 구멍이다.
 *
 * 디버그 키로 서명된 AAB는 Play가 받아주지 않고 **이유도 안 알려준다.**
 * 20분을 태운 뒤에 업로드 단계에서야 드러난다.
 *
 * ⚠ 값은 절대 찍지 않는다 — 있는지만 본다.
 * ⚠ 운영 키와 stg 키가 다르다(`B9:A7:29…` vs `3A:47:42…`). 어느 앱을 굽는지는 여기서
 *   판정하지 못한다 — 그건 사람이 고르는 것이고, 서명 지문은 빌드 뒤에 대조한다.
 */
const SIGNING = [
  'JOGAK_UPLOAD_STORE_FILE',
  'JOGAK_UPLOAD_STORE_PASSWORD',
  'JOGAK_UPLOAD_KEY_ALIAS',
  'JOGAK_UPLOAD_KEY_PASSWORD',
];

/** `.env`를 Expo와 같은 방식으로 읽는다 — 로컬 릴리스가 실제로 보게 될 값이다 */
function readEnvFile(file) {
  const found = {};
  if (!existsSync(file)) return found;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const value = line.slice(eq + 1).trim();
    if (value.length > 0) found[line.slice(0, eq).trim()] = value;
  }
  return found;
}

const problems = [];

for (const [name, value, why] of FORBIDDEN) {
  if (value !== undefined && value !== '' && value !== '0') {
    problems.push(`셸 환경에 ${name}=${value} 가 있다 — ${why}`);
  }
}

for (const file of LOCAL_ENV_FILES) {
  if (!existsSync(file)) continue;
  /*
   * 존재만으로 막는다. "안에 뭐가 있는지 보고 판단"하면 내일 새 변수가 하나 늘었을 때
   * 이 검사가 조용히 통과한다 — Expo는 파일 전체를 로드하지 우리가 아는 키만 읽지 않는다.
   */
  const publicKeys = readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('EXPO_PUBLIC_'))
    .map((line) => line.split('=')[0]);
  if (publicKeys.length > 0) {
    problems.push(
      `${file} 이 EXPO_PUBLIC_* ${publicKeys.length}개를 갖고 있다 — 릴리스 번들에 박힌다\n` +
        `      ${publicKeys.join(', ')}`,
    );
  }
}

/*
 * ① 로컬 릴리스 경로 — `.env` + 셸. (`.env.local`은 위에서 이미 막았으므로 여기 없다)
 */
const localEnv = { ...readEnvFile('.env'), ...process.env };
for (const [name, why] of REQUIRED) {
  const value = localEnv[name];
  if (value === undefined || value === '') {
    problems.push(`${name} 이 없다 — ${why}
      (.env 에도 셸에도 없다. 로컬 릴리스를 구우면 빈 문자열이 번들에 박힌다)`);
  }
}

/*
 * 서명 키 — 셸에만 있어야 한다(저장소에 두지 않는다). 하나라도 없으면 디버그 키로 떨어진다.
 */
const missingSigning = SIGNING.filter(
  (name) => process.env[name] === undefined || process.env[name] === '',
);
if (missingSigning.length > 0) {
  const all = missingSigning.length === SIGNING.length;
  problems.push(
    [
      all
        ? '업로드 서명 키가 하나도 없다 — AAB가 **디버그 키로 조용히 서명되고** Play가 이유 없이 거부한다'
        : `업로드 서명 키가 ${missingSigning.length}개 비었다 — 일부만 있어도 디버그 키로 떨어진다`,
      `      없는 것: ${missingSigning.join(', ')}`,
      '      set -a; . /c/project/secrets/jogak-prod-keystore.env; set +a',
      '      export JOGAK_UPLOAD_STORE_FILE="$KEYSTORE_PATH" \\',
      '             JOGAK_UPLOAD_STORE_PASSWORD="$STORE_PASSWORD" \\',
      '             JOGAK_UPLOAD_KEY_ALIAS="$KEY_ALIAS" \\',
      '             JOGAK_UPLOAD_KEY_PASSWORD="$KEY_PASSWORD"',
    ].join('\n'),
  );
}

/*
 * ② EAS 경로 — `distribution: 'store'` 프로필은 전부 REQUIRED를 선언해야 한다.
 *   ⚠ 여기가 v9를 놓친 자리다. `production`에 `BACKUP_SERVER_URL`이 없었다.
 */
try {
  const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
  for (const [profile, config] of Object.entries(eas.build ?? {})) {
    if (config.distribution !== 'store') continue;
    const declared = config.env ?? {};
    const missing = REQUIRED.map(([name]) => name).filter(
      (name) => declared[name] === undefined || declared[name] === '',
    );
    if (missing.length > 0) {
      problems.push(
        `eas.json 의 '${profile}' 프로필(store)에 ${missing.length}개가 없다 — 그 빌드에서 기능이 죽는다\n` +
          `      ${missing.join(', ')}`,
      );
    }
  }
} catch (error) {
  problems.push(`eas.json 을 읽지 못했다 — ${error instanceof Error ? error.message : error}`);
}

if (problems.length > 0) {
  console.error('\n🔴 릴리스 빌드를 하면 안 되는 상태다:\n');
  for (const p of problems) console.error(`  · ${p}`);
  console.error('\n  고치는 법:');
  console.error('    · env 파일은 잠시 옆으로 치운다   mv .env.local .env.local.aside');
  console.error('    · 셸 플래그는 지운다              unset EXPO_PUBLIC_DEVICE_CHECK');
  console.error('    · 릴리스 값은 eas.json 프로필에서 셸로 명시적으로 넣는다');
  console.error('\n  ⚠ EXPO_PUBLIC_*는 번들에 문자열로 박혀 나중에 못 고친다.\n');
  process.exit(1);
}

console.log('릴리스 환경 ok — 개발용 플래그 없음 · 로컬 env 파일 없음 · 필수 값 전부 있음');
for (const [name, onLabel, offLabel] of REPORTED) {
  const on = localEnv[name] === '1';
  console.log(`  광고 — ${on ? onLabel : offLabel} (${name}=${localEnv[name] ?? '없음'})`);
}
console.log('');
