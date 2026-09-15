#!/bin/bash
# 로컬 릴리스 AAB — `docs/MONETIZATION_SYSTEM.md` §6.1.4
#
# 🔴 **한 셸에서 전부 돈다.** `check:release-env` 는 자기가 도는 셸만 보므로
#    게이트와 gradle 을 나누면 v9·v12 사고가 그대로 재현된다.
set -e
ROOT=/c/project/diary
cd "$ROOT"

# 🔴 트랩은 **절대경로**만 쓴다 — 아래에서 `cd android` 를 하므로 트랩은 다른 CWD 에서 돈다.
#    상대경로로 뒀다가 복원이 조용히 안 됐고, `[ -f x ] && cmd` 가 거짓일 때 1을 반환해
#    **BUILD SUCCESSFUL 인데 스크립트가 exit 1** 로 끝났다(2026-09-01).
BUILDING="$ROOT/.env.local.building"
restore() {
  if [ -f "$BUILDING" ]; then
    mv -f "$BUILDING" "$ROOT/.env.local"
    echo "[.env.local 복원]"
  fi
}
trap restore EXIT

# .env.local 은 굽는 내내 없어야 한다 — gradle 의 createBundleRelease 가 metro 를 부르고
# 거기서 읽힌다(2026-08-18). 개발용 값이 번들에 문자열로 박히면 올린 뒤엔 못 고친다.
[ -f "$ROOT/.env.local" ] && mv "$ROOT/.env.local" "$BUILDING"

eval "$(node scripts/release-env.mjs production)" >/dev/null
set -a; . /c/project/secrets/jogak-prod-keystore.env; set +a
export JOGAK_UPLOAD_STORE_FILE="$KEYSTORE_PATH" \
       JOGAK_UPLOAD_STORE_PASSWORD="$STORE_PASSWORD" \
       JOGAK_UPLOAD_KEY_ALIAS="$KEY_ALIAS" \
       JOGAK_UPLOAD_KEY_PASSWORD="$KEY_PASSWORD"
unset EXPO_PUBLIC_DEVICE_CHECK EXPO_PUBLIC_DEV_LOGIN

# prebuild 가 android/ 를 다시 만들고 local.properties 는 커밋 대상이 아니라 같이 사라진다.
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

echo "=== ① 릴리스 env 게이트 (굽는 셸에서) ==="
npm run --silent check:release-env

echo; echo "=== ② prebuild — android/ 를 app.json 으로 다시 만든다 ==="
npx expo prebuild --platform android --no-install 2>&1 | tail -8
test "${PIPESTATUS[0]}" -eq 0

echo; echo "=== ③ gradle 이 보는 값 ==="
grep -n "versionCode\|versionName" android/app/build.gradle | head -4
echo "서명 앵커 $(grep -c JOGAK_UPLOAD_STORE_FILE android/app/build.gradle) 건"
test "$(grep -c JOGAK_UPLOAD_STORE_FILE android/app/build.gradle)" -gt 0
test -d "$ANDROID_HOME/platform-tools"

echo; echo "=== ③-2 R8 권장 두 줄 (common/R8_OBFUSCATION.md §6.1·§6.2 · 2026-09-15) ==="
# expo-build-properties 로는 못 넣는다. prebuild 가 매번 android/ 를 새로 만들므로 여기서 매번 고친다.
# ① 기본판 proguard-android.txt 에는 -dontoptimize 가 있어 콘솔이 "최적화가 사용 설정되지 않음" 을 띄운다
sed -i 's/getDefaultProguardFile("proguard-android.txt")/getDefaultProguardFile("proguard-android-optimize.txt")/' android/app/build.gradle
test "$(grep -c 'proguard-android-optimize.txt' android/app/build.gradle)" -gt 0
# ② 🔴 AGP 8.11 의 이름이다. 8.13 부터는 android.r8.optimizedResourceShrinking 이고,
#    AGP 는 모르는 android.* 속성을 오류 없이 무시한다. 그래서 AGP 버전을 같이 못박는다.
if ! grep -q '^android.r8.optimizedShrinking=true' android/gradle.properties; then
  printf '\nandroid.r8.optimizedShrinking=true\n' >> android/gradle.properties
fi
grep -q '^android.r8.optimizedShrinking=true' android/gradle.properties
AGP=$(grep -E '^agp' node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "AGP $AGP · optimize.txt 적용 · optimizedShrinking 켬"
test "$AGP" = "8.11.0"   # 🔴 바뀌면 속성 이름을 다시 재고 이 줄을 고친다

# 🔴 gradle 은 JS 번들을 up-to-date 로 보고 다시 안 만든다 — env 를 바꿔도 옛 번들이 실린다.
echo; echo "=== ④ 낡은 번들·매니페스트 산출물 제거 ==="
# 🔴 **매니페스트 산출물도 함께 지운다**(2026-09-10, common/OTA_RULES.md §3.1).
#    `createReleaseUpdatesResources` 가 UP-TO-DATE 로 건너뛰면 **옛 commitTime 이 그대로
#    패키징**되고, 기기는 임베드와 서버 OTA 중 새 쪽을 실행하므로 **새 빌드를 깔아도
#    옛 OTA 로 돈다.** 배구명가가 이걸로 versionCode 하나를 버렸다(INC-007).
rm -rf android/app/build/generated/assets/createBundleReleaseJsAndAssets \
       android/app/build/generated/assets/createReleaseUpdatesResources \
       android/app/build/intermediates/intermediary_bundle \
       android/app/build/outputs/bundle/release \
       android/app/build/outputs/apk/release 2>/dev/null || true

# WITH_APK=1 이면 E2E 용 릴리스 APK 도 같은 gradle 한 번에 굽는다.
# R8(minify)이 두 산출물에 공유되므로 따로 굽는 것보다 훨씬 짧다. R8 설정을 바꾼 릴리스는 이걸로 E2E 를 돈다.
TASKS="bundleRelease"
if [ "${WITH_APK:-0}" = "1" ]; then TASKS="bundleRelease assembleRelease"; fi

echo; echo "=== ⑤ $TASKS ==="
cd android
# 🔴 `| tail` 은 gradle 의 종료코드를 먹는다(2026-08-31 에 실패가 exit 0 으로 보고됐다).
./gradlew $TASKS --no-daemon 2>&1 | tail -30
rc=${PIPESTATUS[0]}
echo "gradle exit=$rc"
test "$rc" -eq 0

cd "$ROOT"
echo; echo "=== ⑥ 🔴 임베드 매니페스트가 서버 최신 OTA 보다 새로운가 ==="
# 업로드 **전에** 본다 — versionCode 는 한 번 올리면 영구 소모다.
npm run --silent check:embedded-manifest
