#!/bin/bash
# OTA 발행 — `docs/README.md` §3
#
# 🔴 **`eas update` 는 `.env.local` 을 치우지 않는다.** 릴리스 AAB 스크립트와 다른 점이고,
#    그래서 2026-09-09 에 첫 발행 번들에 `http://10.0.2.2:3200`(개발 백업 서버)이 박혔다.
#    프로덕션 주소 `jogak-stg.vercel.app` 은 **0건**이었다. 그 업데이트는 지우고 이 스크립트를 만들었다.
#
# ☠ OTA 는 되돌리기가 스토어보다 비싸다. 스토어는 심사 전에 멈출 수 있지만 OTA 는 기기로 바로 간다.
set -e
ROOT=/c/project/diary
cd "$ROOT"

MSG="${1:?발행 메시지를 주세요:  bash scripts/release/publish-ota.sh \"무엇을 고쳤나\"}"

BUILDING="$ROOT/.env.local.building"
restore() {
  if [ -f "$BUILDING" ]; then
    mv -f "$BUILDING" "$ROOT/.env.local"
    echo "[.env.local 복원]"
  fi
}
trap restore EXIT
[ -f "$ROOT/.env.local" ] && mv "$ROOT/.env.local" "$BUILDING"

eval "$(node scripts/release-env.mjs production)" >/dev/null
# ⚠ OTA 는 서명이 필요 없지만 check:release-env 가 서명 키를 함께 본다.
#   그 검사를 OTA 용으로 따로 만들지 않고 키를 넣어 통과시킨다 — 검사가 하나뿐인 편이 낫다.
set -a; . /c/project/secrets/jogak-prod-keystore.env; set +a
export JOGAK_UPLOAD_STORE_FILE="$KEYSTORE_PATH"
export JOGAK_UPLOAD_STORE_PASSWORD="$STORE_PASSWORD"
export JOGAK_UPLOAD_KEY_ALIAS="$KEY_ALIAS"
export JOGAK_UPLOAD_KEY_PASSWORD="$KEY_PASSWORD"
unset EXPO_PUBLIC_DEVICE_CHECK EXPO_PUBLIC_DEV_LOGIN

echo "=== ① 셸 게이트 ==="
npm run --silent check:release-env

# 🔴 캐시가 옛 변환을 들고 있으면 파일을 치워도 안 사라진다(던전가이드 실측).
echo; echo "=== ② 변환 캐시·옛 export 제거 ==="
rm -rf dist .expo/cache 2>/dev/null || true

echo; echo "=== ③ 발행 ==="
# 🔴 --platform android: 기본값 all 은 web 번들링에서 죽는다(AdMob 이 네이티브 전용이다).
npx eas-cli update --branch production --platform android --message "$MSG" --non-interactive
rc=$?

echo; echo "=== ④ 🔴 구운 번들 안을 연다 — 발행은 됐지만 내용이 틀릴 수 있다 ==="
node scripts/check-ota-bundle.mjs
exit $rc
