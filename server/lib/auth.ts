/**
 * 신원 확인 — common_server에 **물어본다**(introspect).
 *
 * 조각 서버는 토큰을 검증하지 않는다. 서명 키를 공유하면 그 키가 두 곳에 생기고,
 * 그건 우리가 스스로 만든 위협이다. common_server에 이미 배포된
 * `/api/v1/auth/me`가 `deletedAt`까지 확인하므로 그대로 쓴다.
 *
 * ⚠ **호출이 두 개다.** `/entitlements`는 `{ok, entitlements, checkedAt}`만 돌려주고
 *   `subjectId`가 없다. 신원은 `/auth/me`가, 권한은 `/entitlements`가 준다.
 *   ⏭ common_server의 `/entitlements` 응답에 `subjectId` 한 줄을 더하면 호출이 하나로 준다.
 */
import { reportError } from './observability';

const COMMON_SERVER_URL = process.env.COMMON_SERVER_URL ?? 'http://127.0.0.1:3100';
const APP_CODE = process.env.APP_CODE ?? 'jogak';

/** introspect 결과를 잠깐 들고 있는다. 매 요청 왕복하면 지연이 그대로 얹힌다 */
const CACHE_TTL_MS = 60_000;

export interface Identity {
  subjectId: string;
  pro: boolean;
  /** 권한 만료 시각(ISO). `null`이면 만료 없음 */
  proExpiresAt: string | null;
}

/**
 * 인가 실패의 종류.
 *
 * ⚠ **`upstream`을 401로 내리지 않는다.** 조각 앱의 SDK는 401을 받으면
 *   `setSession(null, null)`로 세션을 폐기한다(`lib/common-server/index.ts:149`).
 *   즉 common_server가 잠깐 느린 것만으로 **사용자가 로그아웃된다.**
 *   상류 장애는 503이다 — 그게 사실이기도 하다.
 */
export type AuthFailure = 'unauthenticated' | 'upstream';

interface CacheEntry {
  identity: Identity;
  at: number;
}

const g = globalThis as unknown as { __authCache?: Map<string, CacheEntry> };
/*
 * ⚠ 모듈 스코프 캐시는 **람다 인스턴스마다 따로**다. 저트래픽이면 대부분 콜드라
 *   사실상 매번 왕복한다. 로컬 개발과 소규모에는 충분하고, 트래픽이 붙으면
 *   공유 캐시로 옮긴다 — 그때 "탈퇴한 subject가 TTL 동안 유효"라는 결정이 따라온다.
 */
const cache = (g.__authCache ??= new Map<string, CacheEntry>());

async function callUpstream<T>(path: string, token: string): Promise<T | 'upstream' | 'unauthenticated'> {
  try {
    const res = await fetch(`${COMMON_SERVER_URL}${path}`, {
      headers: { authorization: `Bearer ${token}`, 'x-app-code': APP_CODE },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401) {
      return 'unauthenticated';
    }
    if (!res.ok) {
      return 'upstream';
    }
    return (await res.json()) as T;
  } catch (error) {
    reportError(error, `introspect ${path}`);
    return 'upstream';
  }
}

/**
 * `Authorization: Bearer` 헤더로 신원과 권한을 얻는다.
 *
 * 두 상류 호출을 **병렬로** 한다 — 순차로 하면 지연이 두 배다.
 */
export async function identify(req: Request): Promise<Identity | AuthFailure> {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (token === null || token.length === 0) {
    return 'unauthenticated';
  }

  const hit = cache.get(token);
  if (hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.identity;
  }

  const [me, ent] = await Promise.all([
    callUpstream<{ ok: boolean; subject?: { id: string } }>('/api/v1/auth/me', token),
    callUpstream<{ ok: boolean; entitlements?: Record<string, EntitlementView> }>(
      '/api/v1/entitlements',
      token,
    ),
  ]);

  if (me === 'unauthenticated' || ent === 'unauthenticated') {
    cache.delete(token);
    return 'unauthenticated';
  }
  if (me === 'upstream' || ent === 'upstream') {
    /*
     * 상류가 죽었다. **캐시가 있으면 만료됐어도 그걸 쓴다** — 읽기(복원)를 막지 않기 위해서다.
     * 백업은 폰을 잃은 사람을 위한 기능인데, 우리 상류가 느리다고 복원이 막히면 존재 이유가 없다.
     */
    if (hit !== undefined) {
      return hit.identity;
    }
    return 'upstream';
  }

  const subjectId = me.subject?.id;
  if (typeof subjectId !== 'string' || subjectId.length === 0) {
    return 'unauthenticated';
  }

  const pro = ent.entitlements?.pro;
  const identity: Identity = {
    subjectId,
    pro: pro?.active === true,
    proExpiresAt: pro?.expiresAt ?? null,
  };
  cache.set(token, { identity, at: Date.now() });
  return identity;
}

interface EntitlementView {
  active: boolean;
  expiresAt: string | null;
  willRenew: boolean;
  inGracePeriod: boolean;
}

/** 캐시를 비운다. 테스트와 로컬 개발용 */
export function clearAuthCache(): void {
  cache.clear();
}
