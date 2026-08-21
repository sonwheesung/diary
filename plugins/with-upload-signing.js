const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

/**
 * 릴리스 AAB를 **업로드 키**로 서명하도록 `android/`에 배선한다.
 *
 * 🔴 **왜 플러그인인가 — `prebuild`가 손으로 넣은 것을 지운다.**
 *   v8을 구울 때 `android/app/build.gradle`과 `android/gradle.properties`를 직접 고쳤는데,
 *   `android/`는 CNG 산출물이라(CLAUDE.md §7) 네이티브 모듈이 하나만 늘어도 `prebuild`가
 *   다시 만들며 **그 두 곳을 함께 날린다.** 그러면 다음 릴리스가 디버그 키로 서명되거나
 *   설정이 없어 깨지는데, **둘 다 20분을 태운 뒤에야 드러난다.**
 *
 * 값은 저장소에 두지 않는다 — `process.env`로 받는다(`C:/project/secrets/jogak-prod-keystore.env`).
 *
 *   set -a; . /c/project/secrets/jogak-prod-keystore.env; set +a
 *   JOGAK_UPLOAD_STORE_FILE="$KEYSTORE_PATH" \
 *   JOGAK_UPLOAD_STORE_PASSWORD="$STORE_PASSWORD" \
 *   JOGAK_UPLOAD_KEY_ALIAS="$KEY_ALIAS" \
 *   JOGAK_UPLOAD_KEY_PASSWORD="$KEY_PASSWORD" \
 *   npx expo prebuild --platform android
 *
 * ⚠ **운영 키와 stg 키가 다르다**(`B9:A7:29…` vs `3A:47:42…`). 섞으면 Play가 업로드를
 *   거부한다(2026-08-19에 실제로 당했다). 어느 앱을 굽는지 먼저 확인한다.
 *
 * ⚠ 값이 없으면 **디버그 키로 떨어진다.** `assembleDebug`가 비밀 없이도 돌아야 하기 때문인데,
 *   그래서 릴리스는 반드시 `npm run check:release-env`를 먼저 통과시킨다(CLAUDE.md §11) —
 *   조용히 디버그 키로 서명된 AAB는 Play가 받아주지 않고, 이유도 안 알려준다.
 */

const KEYS = [
  'JOGAK_UPLOAD_STORE_FILE',
  'JOGAK_UPLOAD_STORE_PASSWORD',
  'JOGAK_UPLOAD_KEY_ALIAS',
  'JOGAK_UPLOAD_KEY_PASSWORD',
];

/**
 * `findProperty`로 읽고 없으면 디버그 키로 떨어진다.
 * gradle 설정 단계에서 던지면 `assembleDebug`까지 함께 죽는다 — 그러면 개발이 막힌다.
 */
const SIGNING_BLOCK = `
        upload {
            storeFile file(findProperty('JOGAK_UPLOAD_STORE_FILE') ?: 'debug.keystore')
            storePassword findProperty('JOGAK_UPLOAD_STORE_PASSWORD') ?: 'android'
            keyAlias findProperty('JOGAK_UPLOAD_KEY_ALIAS') ?: 'androiddebugkey'
            keyPassword findProperty('JOGAK_UPLOAD_KEY_PASSWORD') ?: 'android'
        }
`;

function patchBuildGradle(contents) {
  if (contents.includes('JOGAK_UPLOAD_STORE_FILE')) {
    return contents; // 이미 적용됨 — prebuild를 두 번 돌려도 중복되지 않는다
  }

  /*
   * `signingConfigs {` 바로 뒤에 끼워 넣는다. gradle은 블록 안 순서를 따지지 않으므로
   * debug 블록의 끝을 정확히 찾을 필요가 없다 — **앵커가 짧을수록 템플릿 변화에 덜 깨진다.**
   *
   * ⚠ **줄바꿈이 CRLF다.** `\{\n`으로 잡으면 사이의 `\r` 때문에 조용히 안 맞는다(실제로 겪었다).
   */
  const anchor = /(signingConfigs\s*\{[\r\n]+)/;
  if (!anchor.test(contents)) {
    throw new Error(
      'with-upload-signing: build.gradle에서 signingConfigs.debug를 못 찾았다. ' +
        'RN 템플릿이 바뀌었을 수 있다 — 이 플러그인을 먼저 고친다.',
    );
  }
  let next = contents.replace(anchor, `$1${SIGNING_BLOCK}`);

  // release가 debug 키로 서명되던 기본값을 upload로 바꾼다
  const releaseSigning = /(release\s*\{\s*signingConfig\s+)signingConfigs\.debug/;
  if (!releaseSigning.test(next)) {
    throw new Error(
      'with-upload-signing: release의 signingConfig를 못 찾았다. 서명이 안 바뀌면 ' +
        'Play가 업로드를 거부한다 — 조용히 넘어가지 않는다.',
    );
  }
  next = next.replace(releaseSigning, '$1signingConfigs.upload');
  return next;
}

module.exports = function withUploadSigning(config) {
  config = withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('with-upload-signing: build.gradle이 groovy가 아니다');
    }
    cfg.modResults.contents = patchBuildGradle(cfg.modResults.contents);
    return cfg;
  });

  config = withGradleProperties(config, (cfg) => {
    /*
     * ⚠ `process.env[key]`로 돌리지 않는다. `expo/no-dynamic-env-var`가 막는데,
     *   그 규칙의 이유(번들 시점 치환)는 여기에 해당하지 않지만 **예외를 만드는 것보다
     *   네 줄을 적는 편이 싸다.** 키를 늘릴 때 여기도 고쳐야 한다는 것이 오히려 안전장치다.
     */
    const env = {
      JOGAK_UPLOAD_STORE_FILE: process.env.JOGAK_UPLOAD_STORE_FILE,
      JOGAK_UPLOAD_STORE_PASSWORD: process.env.JOGAK_UPLOAD_STORE_PASSWORD,
      JOGAK_UPLOAD_KEY_ALIAS: process.env.JOGAK_UPLOAD_KEY_ALIAS,
      JOGAK_UPLOAD_KEY_PASSWORD: process.env.JOGAK_UPLOAD_KEY_PASSWORD,
    };
    for (const key of KEYS) {
      const value = env[key];
      if (value === undefined || value === '') continue;
      const existing = cfg.modResults.find((item) => item.type === 'property' && item.key === key);
      if (existing !== undefined) {
        existing.value = value;
      } else {
        cfg.modResults.push({ type: 'property', key, value });
      }
    }
    return cfg;
  });

  return config;
};
