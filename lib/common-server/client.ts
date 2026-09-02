import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { createCommonServer } from './index';
import { toDeviceSessionKey } from './session-keys';
import type { SessionStorage } from './types';

/**
 * 공통 서버 클라이언트 — 앱 전역에서 이 인스턴스 하나만 쓴다.
 *
 * SDK 자체(`./index`, `./types`)는 common_server에서 **복사한 것이라 손대지 않는다.**
 * 조각에 맞춘 값 주입은 이 파일이 담당한다 — 여기가 SDK와 앱을 잇는 유일한 접점이다.
 *
 * 담당 범위는 **공지 · 문의 · 신원 · 엔타이틀먼트**까지다. 일기 본문과 AI 리포트는
 * 여기로 보내지 않는다(CLAUDE.md §5) — 그건 조각 서버가 따로 맡는다.
 */

/**
 * 서버 `apps` 테이블에 등록된 코드. 없으면 모든 호출이 404(`not-found`)로 떨어진다.
 * 등록: `node --env-file=.env.local tools/seed.ts jogak "조각"` (common_server에서 실행)
 */
export const APP_CODE = 'jogak';

/**
 * `EXPO_PUBLIC_*`는 **빌드 시점에 번들로 인라인된다.**
 * ① 값을 바꾸면 dev 서버를 다시 띄워야 반영된다. ② 번들에 박히므로 비밀을 넣지 않는다.
 */
export const SERVER_URL = (process.env.EXPO_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '');

/** 진단·버전 비교용. app.json의 version을 그대로 따라간다 — 손으로 맞추면 반드시 어긋난다. */
export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

/**
 * 세션 토큰 저장소.
 *
 * SDK는 의존성 0을 지키려고 저장소를 주입받는다. 조각은 **SecureStore**를 준다 —
 * 세션 토큰은 그걸 쥔 사람이 곧 그 계정이 되는 **자격증명**이라, PIN 해시·암호화 키와
 * 같은 급으로 다뤄야 한다(CLAUDE.md §7.1). `app_settings`(평문 SQLite)에 두지 않는다.
 *
 * SDK가 저장 실패를 삼키도록 설계돼 있어(메모리 토큰으로 계속 동작) 여기서 throw해도
 * 로그인 자체가 깨지지는 않지만, 조용히 넘기는 편이 호출부에 군더더기를 안 남긴다.
 */
function makeSessionStorage(mapKey: (key: string) => string): SessionStorage {
  return {
    async getItem(key) {
      try {
        return await SecureStore.getItemAsync(mapKey(key));
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        await SecureStore.setItemAsync(mapKey(key), value);
      } catch {
        // 저장 실패 = 이번 실행 동안만 로그인 유지. 다음 실행에 다시 로그인하면 된다.
      }
    },
    async removeItem(key) {
      try {
        await SecureStore.deleteItemAsync(mapKey(key));
      } catch {
        // 지우기 실패는 로그아웃을 막지 않는다 — 메모리 토큰은 이미 버려졌다.
      }
    },
  };
}

const sessionStorage = makeSessionStorage((key) => key);

/**
 * 🔴 **기기 세션은 다른 칸에 넣는다** (`docs/SUPPORT_SYSTEM.md` §3.1).
 *
 * SDK 의 `storageKey` 는 `cs_session_${appCode}` 로 고정이고 config 로 못 바꾼다.
 * 그래서 **어댑터에서 키를 바꿔치기**한다 — SDK 는 주입된 storage 만 쓰므로
 * 이 함수를 통과하지 않는 경로가 없다(2026-09-01 common_server 확인: `storage.*Item`
 * 호출은 네 곳이고 넷 다 같은 상수를 쓴다. 파생 키·메타 키 없음. 만료 판정은 토큰 payload 의
 * `iat` 를 읽으므로 별도 저장이 없다).
 *
 * 왜 나누나 — 조각은 **로그인이 선택**인 유일한 앱이다(형제 3개는 로그인이 없어 기기 세션이
 * 곧 유일한 신원이다). 기기 토큰이 `cs_session_jogak` 에 들어가면:
 *   · `/auth/me` 가 기기 subject 에도 200 을 주므로 `restoreSession()` 이 성공 → **로그인으로 판정**
 *   · 그러면 문의 로그인 필수가 뚫리고, **연령 게이트가 우회되고**(게이트는 `signIn()` 도 지킨다),
 *     RevenueCat 이 기기 subject 에 붙어 나중에 구글 로그인하면 **구독을 잃는다**(§7.2 함정 #1)
 *
 * 🚫 `provider === 'device'` 로 가르지 않는다. 그건 **온라인일 때만** 성립하는 판정이고,
 *    오프라인 폴백(`isSignedIn()`)에서 오인되면 연령 게이트가 뚫린다 — 실패 비용이 비대칭이라
 *    "대체로 맞는 판정"으로 두면 안 된다. 키가 다르면 **어떤 코드 경로도 둘을 혼동할 수 없다.**
 *
 * ⚠ `startsWith` 로 앵커를 건다. `replace` 는 첫 등장을 바꾸는 것이라, 접두사가 아닌 키가
 *   생기는 날 **두 인스턴스가 그 키를 조용히 공유**한다.
 */
const deviceSessionStorage = makeSessionStorage(toDeviceSessionKey);

export const commonServer = createCommonServer({
  baseUrl: SERVER_URL,
  appCode: APP_CODE,
  appVersion: APP_VERSION,
  platform: Platform.OS,
  storage: sessionStorage,
});

/**
 * 세션 토큰을 꺼낸다 — **조각 서버**에 붙을 때 쓴다.
 *
 * 조각 서버는 이 토큰을 common_server에 물어(introspect) 신원을 확인한다. 같은 토큰이
 * 두 서버에 쓰이는 것이 맞다 — 신원의 단일 진실은 common_server 하나다(CLAUDE.md §5).
 *
 * ⚠ SDK가 토큰을 노출하지 않아 **저장 키를 여기서 재구성한다.** SDK는 복사본이라
 *   손대지 않는 것이 규약이므로, 앱이 소유한 이 파일이 그 결합을 떠안는다.
 *   SDK를 재복사할 때 `storageKey` 형식(`cs_session_<appCode>`)이 그대로인지 확인할 것 —
 *   바뀌면 조각 서버 호출이 전부 401이 되고, 원인이 로그인 쪽으로 보인다.
 */
export async function readSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(`cs_session_${APP_CODE}`);
  } catch {
    return null;
  }
}

/**
 * 활성 하트비트 전용 인스턴스 — **로그인과 완전히 분리돼 있다**.
 *
 * `commonServer` 와 `appCode` 는 같지만 세션이 `cs_devsession_jogak` 에 들어가므로
 * `isSignedIn()` · `restoreSession()` · `readSessionToken()` 이 이 토큰을 **절대 보지 않는다**.
 *
 * 🚫 여기로 문의를 보내거나 엔타이틀먼트를 묻지 않는다. 이 인스턴스가 하는 일은
 *    `registerDevice()` 와 `fetchBootstrap()` 둘뿐이다.
 */
export const deviceServer = createCommonServer({
  baseUrl: SERVER_URL,
  appCode: APP_CODE,
  appVersion: APP_VERSION,
  platform: Platform.OS,
  storage: deviceSessionStorage,
});

/**
 * 활성 신호를 실을 인스턴스 — **로그인했으면 구글 세션, 아니면 기기 세션**.
 *
 * 부팅 조회(`features/notice/store.ts`)와 포그라운드 하트비트가 **같은 규칙을 쓴다.**
 * 두 곳이 서로 다른 인스턴스를 고르면 로그인한 사람이 같은 날 **subject 두 행**을 찍는다 —
 * `docs/SUPPORT_SYSTEM.md` §3.1 이 2중 계상을 감수한 근거가 *"사용자당 평생 1회"* 였는데
 * 그게 **매일**이 되고, 그것도 가장 열심히 쓰는 사람에게 그렇게 된다.
 * 그래서 규칙을 두 곳에 적지 않고 이 함수 하나로 둔다.
 *
 * ⚠ `isSignedIn()` 은 **로컬 판정**이다(SecureStore 읽기 + 토큰 payload 파싱). 네트워크를
 *   안 타므로 포그라운드마다 불러도 된다.
 */
export async function activeServer(): Promise<ReturnType<typeof createCommonServer>> {
  return (await commonServer.isSignedIn()) ? commonServer : deviceServer;
}

/**
 * 웜 스타트 하트비트 — `AppState` 가 `active` 로 돌아올 때 부른다(SDK `2026-09-02`).
 *
 * 그전에는 활성 신호가 `fetchBootstrap()` 에만 얹혀 있었는데 그건 **JS 프로세스당 1회**다.
 * 안드로이드는 홈 버튼으로 프로세스를 안 죽이므로 **앱을 안 죽이는(= 자주 쓰는) 사용자일수록
 * 덜 잡히는**, 방향이 거꾸로인 오차였다.
 *
 * 🔴 **호출부는 `.catch()` 를 붙이지 않는다.** SDK 의 `heartbeat()` 는 계약상 절대 reject 하지
 *   않는다(네트워크·타임아웃·세션 없음·쿨다운·파싱 실패를 전부 삼킨다). 아래 `try` 가 감싸는 것은
 *   `heartbeat()` 가 아니라 **`activeServer()` 와 그 사이의 조립**이다 — 리스너 콜백은 동기라
 *   여기서 샌 rejection 이 곧 오류 UI가 되고, 포그라운드 복귀는 부팅보다 훨씬 잦다.
 *
 * 🔴 **세션을 만들지 않는다.** 세션이 없으면(연령 미달·게이트를 닫음) 아무 일도 안 하고 끝난다 —
 *   여기서 `ensureDeviceSession()` 을 부르면 *"미달자의 식별자를 받기 전에 돌려보낸다"* 의
 *   경계가 무너진다(`docs/AUTH_SYSTEM.md` §1.2).
 *
 * ⏭ 쿨다운 5분은 **SDK 안**이다. 앱에서 다시 만들지 않는다.
 */
export async function beat(): Promise<void> {
  try {
    const server = await activeServer();
    await server.heartbeat();
  } catch {
    // 관측이 사용자 눈에 보이면 설계가 틀린 것이다. 활성 지표는 조용히 실패한다.
  }
}

/**
 * 기기 식별자 — **SDK 밖이다.** 어댑터를 지나지 않으므로 `cs_session_*` 계열에 얹지 않는다.
 *
 * 이 값이 곧 열쇠라(서버가 UUID 형식을 강제한다) 자격증명 급으로 SecureStore 에 둔다.
 */
const DEVICE_ID_KEY = 'jogak_device_id';

/**
 * 기기 세션 확보 — 부팅에서 부른다. 멱등이라 여러 번 불러도 안전하다.
 *
 * 🔴 **연령 게이트를 통과한 뒤에만 부른다.** 이 함수가 UUID 를 만들고 서버에 `subjects` 행을
 *   만드는 지점이라, 여기가 *"미달자의 식별자를 받기 전에 돌려보낸다"* 의 경계다
 *   (`docs/AUTH_SYSTEM.md` §1.2). 호출부가 게이트를 확인한다.
 *
 * ⚠ 실패해도 아무 일도 일어나지 않는다 — 오프라인·서버 다운에서 오류를 띄우지 않고,
 *   결과를 화면에 쓰지 않는다. 다음 부팅에 다시 시도할 뿐이다.
 * ⚠ `isSignedIn()` 가드가 재등록 폭주를 막는다(서버 device 레이트리밋 IP당 10회/600초).
 *   2026-09-01.2 부터 이 판정이 **만료까지 본다** — 기기 토큰이 180일 뒤 죽어도 같은
 *   `deviceId` 로 재등록되어 **같은 subject** 를 돌려받으므로 이력이 안 끊긴다.
 */
export async function ensureDeviceSession(): Promise<boolean> {
  try {
    if (await deviceServer.isSignedIn()) return true;
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (deviceId === null) {
      deviceId = randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    const r = await deviceServer.registerDevice(deviceId);
    return r.ok;
  } catch {
    return false;
  }
}
