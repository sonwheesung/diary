/**
 * GET /api/admin/vaults — 백업 금고 집계 + 리퍼가 다음에 치울 것 (`docs/ADMIN_SYSTEM.md` §2).
 *
 * 🔴 **`vault_id`도 `subject_id`도 select하지 않는다**(§3). 전부 count·sum이다.
 *   금고 목록을 만드는 순간 운영자가 개인을 특정할 수 있게 된다.
 *
 * ⚠ 저장 용량은 `bytes` 합이다 — **커밋된 것만** 센다. 예약(reserved) 상태는 Storage에
 *   올라갔을 수도 아닐 수도 있어서(그래서 리퍼가 치운다) 합계에 넣으면 실제보다 커진다.
 */
import { and, eq, isNotNull, isNull, lt, sql } from 'drizzle-orm';

import { db } from '../../../../db';
import { generationParts, generations, vaultBlobs, vaults } from '../../../../db/schema';
import { isAdmin } from '../../../../lib/admin';
import { BLOB_ORPHAN_MS, GRACE_MS, RESERVED_TTL_MS, TOMBSTONE_TTL_MS } from '../../../../lib/policy';
import { reportError } from '../../../../lib/observability';
import { fail, ok } from '../../../../lib/respond';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  if (!isAdmin(req)) {
    return fail('unauthorized');
  }
  try {
    const now = Date.now();

    const [vaultRow] = await db
      .select({
        total: sql<number>`count(*)::int`,
        /** 살아 있는 금고 — 툼스톤 제외 */
        alive: sql<number>`count(*) filter (where ${vaults.purgedAt} is null)::int`,
        purged: sql<number>`count(*) filter (where ${vaults.purgedAt} is not null)::int`,
        /** 구독이 끝나 유예를 세고 있는 금고. 여기가 늘면 이탈이 늘고 있는 것이다 */
        inGrace: sql<number>`count(*) filter (
          where ${vaults.purgedAt} is null and ${vaults.proExpiresAt} is not null
        )::int`,
      })
      .from(vaults);

    const [genRow] = await db
      .select({
        total: sql<number>`count(*)::int`,
        committed: sql<number>`count(*) filter (where ${generations.committedAt} is not null)::int`,
      })
      .from(generations);

    const [partRow] = await db
      .select({
        committed: sql<number>`count(*) filter (where ${generationParts.state} = 'committed')::int`,
        reserved: sql<number>`count(*) filter (where ${generationParts.state} = 'reserved')::int`,
        bytes: sql<number>`coalesce(sum(${generationParts.bytes}) filter (
          where ${generationParts.state} = 'committed'
        ), 0)::bigint`,
      })
      .from(generationParts);

    const [blobRow] = await db
      .select({
        committed: sql<number>`count(*) filter (where ${vaultBlobs.state} = 'committed')::int`,
        reserved: sql<number>`count(*) filter (where ${vaultBlobs.state} = 'reserved')::int`,
        bytes: sql<number>`coalesce(sum(${vaultBlobs.bytes}) filter (
          where ${vaultBlobs.state} = 'committed'
        ), 0)::bigint`,
      })
      .from(vaultBlobs);

    /*
     * ── 리퍼 백로그 ────────────────────────────────────────────────────────
     * 조각 서버에는 **리퍼 실행 로그 테이블이 없다.** 그래서 "리퍼가 돌았나"를 직접 알 수 없다.
     * 대신 **지금 치울 것이 얼마나 쌓여 있나**를 본다 — 크론이 정상이면 0 근처에 머물고,
     * 계속 늘면 크론이 안 도는 것이다. 간접 신호지만 정직하고, 있는 데이터로 만들 수 있다.
     */
    const [staleParts] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(generationParts)
      .where(
        and(
          eq(generationParts.state, 'reserved'),
          lt(generationParts.reservedAt, new Date(now - RESERVED_TTL_MS)),
        ),
      );

    const [orphanBlobs] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(vaultBlobs)
      .where(lt(vaultBlobs.referencedAt, new Date(now - BLOB_ORPHAN_MS)));

    /** 유예가 끝났는데 아직 파기되지 않은 금고. 0이 아니면 리퍼가 밀려 있다 */
    const [expiredVaults] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(vaults)
      .where(
        and(
          isNull(vaults.purgedAt),
          isNotNull(vaults.proExpiresAt),
          lt(vaults.proExpiresAt, new Date(now - GRACE_MS)),
        ),
      );

    /** 보관 기간이 지난 툼스톤 */
    const [staleTombstones] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(vaults)
      .where(and(isNotNull(vaults.purgedAt), lt(vaults.purgedAt, new Date(now - TOMBSTONE_TTL_MS))));

    return ok({
      vaults: vaultRow ?? { total: 0, alive: 0, purged: 0, inGrace: 0 },
      generations: genRow ?? { total: 0, committed: 0 },
      parts: partRow ?? { committed: 0, reserved: 0, bytes: 0 },
      blobs: blobRow ?? { committed: 0, reserved: 0, bytes: 0 },
      backlog: {
        staleParts: staleParts?.n ?? 0,
        orphanBlobs: orphanBlobs?.n ?? 0,
        expiredVaults: expiredVaults?.n ?? 0,
        staleTombstones: staleTombstones?.n ?? 0,
      },
      /** 화면이 "왜 이 값이 백로그인가"를 설명할 수 있게 정책 상수를 함께 내린다(§5) */
      policy: {
        reservedTtlHours: RESERVED_TTL_MS / 3_600_000,
        blobOrphanDays: BLOB_ORPHAN_MS / 86_400_000,
        graceDays: GRACE_MS / 86_400_000,
        tombstoneDays: TOMBSTONE_TTL_MS / 86_400_000,
      },
    });
  } catch (error) {
    reportError(error, 'admin/vaults');
    return fail('error');
  }
}
