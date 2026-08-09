import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { createCommonServer } from './index';
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
const sessionStorage: SessionStorage = {
  async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // 저장 실패 = 이번 실행 동안만 로그인 유지. 다음 실행에 다시 로그인하면 된다.
    }
  },
  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // 지우기 실패는 로그아웃을 막지 않는다 — 메모리 토큰은 이미 버려졌다.
    }
  },
};

export const commonServer = createCommonServer({
  baseUrl: SERVER_URL,
  appCode: APP_CODE,
  appVersion: APP_VERSION,
  platform: Platform.OS,
  storage: sessionStorage,
});
