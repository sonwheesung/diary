import * as SecureStore from 'expo-secure-store';

import { APP_CODE } from '@/lib/common-server/client';
import type { Subject } from '@/lib/common-server/types';
import { SETTING_KEYS, setSetting } from '@/features/settings/api/settings-store';

/**
 * 개발용 임의 로그인 — **구글 로그인 없이 로그인 상태를 만든다.**
 *
 * 실제 로그인은 AAB를 올려 확인하고, 개발 중에는 그 뒤에 있는 화면들(백업·구독·문의)을
 * 눌러볼 수 있어야 한다. `docs/SUPPORT_SYSTEM.md` 참조.
 *
 * ⚠ **`__DEV__`가 1차 게이트다.** `EXPO_PUBLIC_*`는 릴리스 번들에도 인라인되므로
 *   플래그만 쓰면 한 줄 실수로 릴리스에 가짜 로그인이 실린다. `__DEV__`는 릴리스에서
 *   `false`로 접혀 **이 코드가 통째로 사라진다** — 남아 있어도 실행될 수 없다.
 *
 * ⚠ 이 세션은 **조각 서버의 `AUTH_STUB=1`(로컬 전용)에서만 통한다.**
 *   배포된 stg는 401로 거절한다 — 그게 맞는 동작이다.
 */

/** `__DEV__` 밖에서는 항상 false다. 번들러가 이 상수를 보고 아래 호출부를 지운다 */
export const DEV_LOGIN_ENABLED = __DEV__ && process.env.EXPO_PUBLIC_DEV_LOGIN === '1';

/**
 * ⚠ SDK가 쓰는 저장 키와 **같아야 한다**(`lib/common-server/client.ts`의 주석 참조).
 *   어긋나면 `readSessionToken()`이 못 읽어 조각 서버 호출이 전부 401이 되고,
 *   원인이 로그인 쪽으로 보인다.
 */
const SESSION_KEY = `cs_session_${APP_CODE}`;

/**
 * 개발용 세션 토큰. 사람이 알아볼 수 있게 적는다 — 서버 이력에 보이면 개발용임이 바로 드러나야 한다.
 *
 * ⚠ **기기 점검(`device-check`)도 이 값을 쓴다.** 서버 스텁은 `stub:<토큰>`을 subject로
 *   삼으므로, 값이 다르면 **같은 기기가 두 신원**이 되어 뒤에 온 쪽이 `no-grant`로 막힌다
 *   (단일 라이터 설계가 옳게 동작한 것이지만, 개발에는 불필요한 마찰이다 — 실제로 겪음).
 */
export const DEV_SESSION_TOKEN = 'dev-emulator';

export const DEV_SUBJECT: Subject = {
  id: 'dev-emulator',
  email: 'dev@jogak.invalid', // ⚠ .invalid — 실존하지 않음이 보장된 TLD(RFC 2606)
  provider: 'dev',
};

/** 가짜 세션을 세운다. 실패해도 던지지 않는다 — 개발 편의 기능이 앱을 막으면 안 된다 */
export async function devSignIn(): Promise<Subject | null> {
  if (!DEV_LOGIN_ENABLED) {
    return null;
  }
  try {
    await SecureStore.setItemAsync(SESSION_KEY, DEV_SESSION_TOKEN);
    /*
     * ⚠ 권한도 함께 켠다. 안 켜면 구독 게이트에 막혀 백업 화면을 못 본다 —
     *   서버(`AUTH_STUB`)는 pro를 주는데 앱이 자기 캐시만 보고 막는다.
     */
    await setSetting(SETTING_KEYS.proUntil, 'never');
    return DEV_SUBJECT;
  } catch {
    return null;
  }
}

/** 기기에 개발용 세션이 있는가. 앱 시작 시 복구에 쓴다 */
export async function devSessionExists(): Promise<boolean> {
  if (!DEV_LOGIN_ENABLED) {
    return false;
  }
  try {
    return (await SecureStore.getItemAsync(SESSION_KEY)) === DEV_SESSION_TOKEN;
  } catch {
    return false;
  }
}

export async function devSignOut(): Promise<void> {
  if (!DEV_LOGIN_ENABLED) {
    return;
  }
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // 지우기 실패가 로그아웃을 막지 않는다
  }
}
