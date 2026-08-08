import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { createCommonServer } from './index';

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
 * `EXPO_PUBLIC_*`는 **빌드 시점에 번들로 인라인된다.** 값을 바꾸면 반드시 재빌드해야 반영된다.
 * 비어 있으면 서버 연동 기능 전체가 조용히 비활성으로 동작한다 — 앱 사용에는 지장이 없다.
 */
export const SERVER_URL = (process.env.EXPO_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '');

/** 진단·버전 비교용. app.json의 version을 그대로 따라간다 — 손으로 맞추면 반드시 어긋난다. */
export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

export const commonServer = createCommonServer({
  baseUrl: SERVER_URL,
  appCode: APP_CODE,
  appVersion: APP_VERSION,
  platform: Platform.OS,
});
