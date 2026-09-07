/**
 * 🔴 **이 스크립트가 어느 DB를 향하는지 먼저 말하고, 운영이면 멈춘다** (2026-09-07).
 *
 * ## 왜 있나
 *
 * `server/.env.local` 의 `DATABASE_URL` 이 **운영 DB를 가리킨다**(2026-09-04 신설 검증 때
 * 그쪽을 향해 두고 안 되돌렸다). 그런데 이 파일을 읽는 것들이 이렇다:
 *
 * | | |
 * |---|---|
 * | `npm run db:push` | **운영 스키마를 직접 바꾼다** |
 * | `npm run e2e` · `e2e:ai` · `verify:regenerate` · `verify:hierarchy` | 운영 DB에 쓰고 지운다 |
 *
 * `docs/README.md` §3 은 *"`npx supabase start` → `db:push` → `e2e`"* 로 **로컬을 전제**해
 * 적혀 있다. 문서와 실제 기본값이 반대인 상태이고, 다음 사람은 그냥 `npm run db:push` 를 친다.
 *
 * ⚠ 이미 한 번 적어둔 사람이 있었다 — `verify-hierarchy.mjs` 가
 *   *"`DATABASE_URL` 이 원격을 가리켜서 이 스크립트가 만든 행은 **테스터가 쓰는 DB** 에 남는다"*
 *   고 주석으로 경고한다. **아는데 막지는 않고 있었다.**
 *
 * ## 규율
 *
 * - 원격이면 **`ALLOW_REMOTE_DB=1` 없이는 죽는다.** 되돌릴 수 없는 일에 한 번 더 손이 가게 한다.
 * - 🚫 로컬로 **폴백하지 않는다.** `drizzle.config.ts` 가 남긴 교훈이다 —
 *   엉뚱한 DB를 보고 *"변경 없음"* 이라고 말하는 것이 가장 나쁜 실패다.
 * - 비밀번호는 **찍지 않는다.** 호스트와 포트만 말한다.
 */
const LOCAL = new Set(['127.0.0.1', 'localhost', '::1']);

export function assertDbTarget(what = '이 스크립트') {
  const raw = process.env.DATABASE_URL ?? '';
  if (raw.length === 0) {
    console.error('DATABASE_URL이 없다 — server/.env.local을 확인한다.');
    process.exit(1);
  }

  let host;
  let port;
  try {
    const u = new URL(raw);
    host = u.hostname;
    port = u.port || '5432';
  } catch {
    console.error('DATABASE_URL을 URL로 못 읽는다.');
    process.exit(1);
  }

  const local = LOCAL.has(host);
  console.log(`[db] 대상: ${host}:${port}${local ? ' (로컬)' : ' 🔴 원격'}`);
  if (local || process.env.ALLOW_REMOTE_DB === '1') return { host, port, local };

  console.error(
    `\n🔴 ${what}가 **원격 DB**를 향하고 있다 — ${host}\n` +
      `   운영이면 이 스크립트가 만든 행이 사용자가 쓰는 DB에 남는다.\n\n` +
      `   로컬로 돌리려면:  DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54422/postgres" npm run ...\n` +
      `   정말 원격이면:    ALLOW_REMOTE_DB=1 npm run ...\n`,
  );
  process.exit(1);
}
