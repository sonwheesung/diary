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

console.log('릴리스 환경 ok — 개발용 플래그도, 로컬 env 파일도 없다');
