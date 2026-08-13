/**
 * 관리자 인증 — **fail-closed** (`docs/ADMIN_SYSTEM.md` §2).
 *
 * 배구명가 `server/lib/admin.ts`를 그대로 승계한다. 거기 주석이 남긴 교훈이 핵심이다:
 * 크론의 fail-open("시크릿 미설정 시 통과")을 여기 복제하면 **env 누락 = 콘솔이 전 세계에 열림**이다.
 *
 * → `ADMIN_TOKEN`이 없거나 짧으면(<16자) 무조건 거부한다.
 *
 * Bearer 헤더 방식이라 CSRF 내성이 있다(쿠키 인증을 도입하지 않는다).
 */
import { timingSafeEqual } from 'node:crypto';

/** 이보다 짧은 토큰은 설정된 것으로 치지 않는다 — 약한 토큰은 없는 토큰과 같다. */
const MIN_TOKEN_LEN = 16;

/**
 * `Authorization: Bearer <ADMIN_TOKEN>`을 **상수시간**으로 검증한다.
 *
 * ⚠ `timingSafeEqual`은 길이가 같아야 한다 — 다르면 던진다. 그래서 길이를 먼저 본다.
 *   길이 노출은 감수한다(토큰 길이를 비밀로 지킬 수 있는 설계가 아니다).
 */
export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN ?? '';
  if (token.length < MIN_TOKEN_LEN) {
    return false; // 미설정·약한 토큰이면 관리자 기능 전면 차단
  }
  const auth = req.headers.get('authorization') ?? '';
  const matched = /^Bearer\s+(.+)$/i.exec(auth);
  if (matched === null) {
    return false;
  }
  const given = Buffer.from(matched[1]);
  const expected = Buffer.from(token);
  if (given.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(given, expected);
}
