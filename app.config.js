/**
 * 동적 앱 설정 — **stg와 운영을 가르는 유일한 곳**
 * (`docs/MONETIZATION_SYSTEM.md` §6.1.2).
 *
 * `app.json`이 정본이고 이 파일은 **`APP_VARIANT=stg`일 때만** 몇 칸을 갈아끼운다.
 * 변수가 없으면 `app.json`을 그대로 돌려주므로 `npx expo run:android` 로컬 개발과
 * 운영 빌드는 이 파일이 생기기 전과 **완전히 같다.**
 *
 * 🔴 **패키지명은 Play에 한 번 올라가면 재사용할 수 없다.** 여기 값을 바꾸는 것은
 *   앱을 새로 만드는 것과 같다.
 *
 * ⚠ 여기서 바뀌는 값은 전부 **네이티브 매니페스트에 박힌다.** JS 리로드로 반영되지 않고
 *   `prebuild` + 재빌드가 필요하다(CLAUDE.md §7).
 */

/** Google 공식 **테스트** AdMob 앱 ID (Android). 2026-08-14 공식 문서에서 확인했다 */
const TEST_ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

const STG_PACKAGE = 'com.son0925.jogak.stg';

/**
 * 실제 AdMob 앱 ID를 stg에 박지 않는 이유:
 * ① AdMob 앱은 스토어의 **한 앱**에 연결된다 — 다른 패키지가 같은 ID를 쓰면 그 연결이 꼬인다
 * ② 내부 테스트를 돌리며 만든 노출이 실제 앱에 잡히면 **무효 트래픽**이다(계정 정지 사유)
 *
 * ⚠ 플러그인을 통째로 빼지는 않는다. 네이티브 모듈이 사라지면 `features/ads`가 런타임에
 *   깨져서, 광고와 무관한 화면을 테스트하다가 앱이 죽는다.
 */
function withTestAds(plugins) {
  return plugins.map((plugin) => {
    if (!Array.isArray(plugin) || plugin[0] !== 'react-native-google-mobile-ads') {
      return plugin;
    }
    return [plugin[0], { ...plugin[1], androidAppId: TEST_ADMOB_ANDROID_APP_ID }];
  });
}

module.exports = ({ config }) => {
  if (process.env.APP_VARIANT !== 'stg') {
    return config;
  }

  return {
    ...config,
    // 기기에 운영 앱과 나란히 깔리므로 런처에서 구별돼야 한다
    name: '조각 stg',
    ios: { ...config.ios, bundleIdentifier: STG_PACKAGE },
    android: { ...config.android, package: STG_PACKAGE },
    plugins: withTestAds(config.plugins),
  };
};
