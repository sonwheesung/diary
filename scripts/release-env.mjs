/**
 * `eas.json` 프로필의 env를 셸 export 문으로 뽑는다 — `node scripts/release-env.mjs <profile>`
 *
 * ## 왜 필요한가 (2026-08-24)
 *
 * EAS로 구우면 프로필의 `env`가 자동으로 들어간다. 그런데 **로컬로 구우면 아무도 안 넣어준다** —
 * `expo prebuild`는 `.env.local`·`.env`만 읽는다. 그래서 EAS 쿼터가 떨어져 로컬로 굽기
 * 시작한 순간, 프로필에만 있던 값들이 **통째로 빠진 채** 번들에 박혔다.
 *
 * versionCode 9가 그렇게 나갔다 — 백업·AI·결제가 전부 죽은 빌드가 클로즈드 테스트 43명에게
 * 갔고, 화면에는 정상적인 미구현처럼 보여서 아무도 못 알아챘다.
 *
 * 손으로 export하는 것으로는 못 막는다. **손으로 한다는 건 언젠가 하나를 빠뜨린다는 뜻**이고,
 * 빠뜨려도 빌드는 조용히 성공한다.
 *
 * ## 쓰는 법
 *
 * ```bash
 * eval "$(node scripts/release-env.mjs production)"
 * npm run check:release-env      # 이제 이 검사가 실제 빌드 값을 본다
 * npx expo prebuild --platform android --clean
 * cd android && ./gradlew bundleRelease
 * ```
 *
 * ⚠ `eval` 없이 그냥 실행하면 **아무 일도 일어나지 않는다**(출력만 된다).
 *   그게 의도다 — 이 스크립트가 셸을 조용히 바꾸지 않는다.
 */
import { readFileSync } from 'node:fs';

const profile = process.argv[2];

if (profile === undefined || profile === '--help') {
  const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
  console.error('\n사용법: node scripts/release-env.mjs <profile>');
  console.error(`있는 프로필: ${Object.keys(eas.build ?? {}).join(', ')}`);
  console.error('\n셸에 넣으려면: eval "$(node scripts/release-env.mjs production)"\n');
  process.exit(1);
}

const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
const config = eas.build?.[profile];

if (config === undefined) {
  console.error(`\n모르는 프로필: ${profile}`);
  console.error(`있는 것: ${Object.keys(eas.build ?? {}).join(', ')}\n`);
  process.exit(1);
}

const env = config.env ?? {};
const names = Object.keys(env);

if (names.length === 0) {
  console.error(`\n'${profile}' 프로필에 env가 없다 — 내보낼 것이 없다\n`);
  process.exit(1);
}

/*
 * 값은 작은따옴표로 감싼다. 안에 작은따옴표가 있으면 `'\''` 로 끊어 이어붙인다 —
 * URL·키에는 없겠지만, 있을 때 조용히 잘리는 것이 가장 나쁘다.
 */
for (const name of names) {
  const value = String(env[name]).replaceAll("'", `'\\''`);
  console.log(`export ${name}='${value}'`);
}

// stderr로 보낸다 — stdout은 eval이 먹으므로 여기에 사람 말을 섞으면 셸이 깨진다
console.error(`\n'${profile}' 프로필의 EXPO_PUBLIC_* ${names.length}개를 내보냈다:`);
for (const name of names) console.error(`  ${name}`);
console.error('');
