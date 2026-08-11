import { and, eq, lt, sql } from 'drizzle-orm';

import { db } from '@/db';
import { generationParts, generations, vaults } from '@/db/schema';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { removeObjects, storageConfigured } from '@/lib/storage';
import { purgeVault } from '@/app/api/v1/backup/delete/route';

export const dynamic = 'force-dynamic';

/**
 * 리퍼 — 실패한 업로드와 오래된 세대를 치운다.
 *
 * ⚠ **인증이 없으면 아무나 부를 수 있다.** 파괴적인 작업이므로 `CRON_SECRET`을 요구한다.
 *   Vercel Cron은 `Authorization: Bearer <CRON_SECRET>`을 붙여준다.
 *
 * ⚠ 이 라우트가 **조용히 죽으면 아무도 모른다** — 이 프로젝트에는 원격 관측이 0이다.
 *   그래서 응답에 처리 건수를 담는다. 수동 호출로 확인할 수 있어야 한다.
 */

/**
 * `reserved`인 채 방치된 파트를 치우는 기준.
 *
 * 서명 URL TTL이 2시간이라 그 뒤엔 못 올린다. 그래도 24시간을 두는 건
 * **느린 재시도를 죽이지 않기 위해서**다 — `reserve`는 멱등이라 URL을 재발급받아 이어갈 수 있다.
 */
const RESERVED_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 보관하는 세대 수.
 *
 * ⚠ 잘못된 복원을 되돌릴 여지를 남긴다. 1개만 두면 "복원했더니 아니었다"에 답이 없다.
 */
const KEEP_GENERATIONS = 3;

/** 툼스톤(파기 기록)을 남겨두는 기간. 이걸 지나면 행도 지운다 */
const TOMBSTONE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * 구독이 끊긴 뒤 백업을 지우기까지의 유예.
 *
 * ⚠ **시계의 출처는 `vaults.pro_expires_at` 스냅샷이다.** 만료는 이벤트로 오지 않는다 —
 *   common_server가 `active`를 저장하지 않고 읽을 때 계산하므로 만료 순간에 DB를 쓰는
 *   주체가 없다. 그래서 introspect로 받아둔 값을 우리가 센다.
 */
const GRACE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * 접근이 끊긴 금고를 정리하는 기준.
 *
 * ⚠ **탈퇴 없이 앱만 지운 사용자의 금고는 아무도 지워주지 않는다.**
 *   `common_server`가 수정 금지라 아웃박스를 못 만들어서, 이게 유일한 안전망이다.
 *   처리방침에 이 기간을 명시한다.
 */
const ABANDONED_MS = 3 * 365 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  const header = req.headers.get('authorization');
  if (secret.length === 0 || header !== `Bearer ${secret}`) {
    return fail('unauthorized');
  }
  if (!storageConfigured()) {
    return fail('upstream', { detail: 'storage-unset' });
  }

  try {
    const now = Date.now();
    let reapedParts = 0;
    let reapedGenerations = 0;
    let reapedTombstones = 0;

    // ── 1. 만료된 예약 ────────────────────────────────────────────────────────
    const stale = await db
      .select()
      .from(generationParts)
      .where(
        and(
          eq(generationParts.state, 'reserved'),
          lt(generationParts.reservedAt, new Date(now - RESERVED_TTL_MS)),
        ),
      )
      .limit(1000);

    if (stale.length > 0) {
      // 객체를 먼저 지운다. 행을 먼저 지우면 **경로를 잃어 객체가 영원히 남는다.**
      await removeObjects(stale.map((part) => part.objectPath));
      for (const part of stale) {
        await db
          .delete(generationParts)
          .where(
            and(
              eq(generationParts.vaultId, part.vaultId),
              eq(generationParts.seq, part.seq),
              eq(generationParts.part, part.part),
            ),
          );
      }
      reapedParts = stale.length;
    }

    // ── 2. 파트가 하나도 안 남은 미완성 세대 ──────────────────────────────────
    const orphans = await db
      .select({ vaultId: generations.vaultId, seq: generations.seq })
      .from(generations)
      .where(
        and(
          sql`${generations.committedAt} is null`,
          sql`not exists (
            select 1 from ${generationParts} p
             where p.vault_id = ${generations.vaultId} and p.seq = ${generations.seq}
          )`,
        ),
      )
      .limit(500);

    for (const orphan of orphans) {
      await db
        .delete(generations)
        .where(and(eq(generations.vaultId, orphan.vaultId), eq(generations.seq, orphan.seq)));
      reapedGenerations += 1;
    }

    // ── 3. 보관 개수를 넘긴 옛 세대 ───────────────────────────────────────────
    /*
     * ⚠ 커밋된 세대만 센다. 미완성은 위 2에서 다룬다.
     * ⚠ 금고마다 최근 KEEP_GENERATIONS개를 남기고 그 아래를 지운다.
     */
    const vaultRows = await db.select({ id: vaults.id }).from(vaults).limit(5000);
    for (const vault of vaultRows) {
      const kept = await db
        .select({ seq: generations.seq })
        .from(generations)
        .where(and(eq(generations.vaultId, vault.id), sql`${generations.committedAt} is not null`))
        .orderBy(sql`${generations.seq} desc`)
        .limit(KEEP_GENERATIONS);

      if (kept.length < KEEP_GENERATIONS) continue;
      const floor = kept[kept.length - 1].seq;

      const old = await db
        .select()
        .from(generationParts)
        .where(and(eq(generationParts.vaultId, vault.id), lt(generationParts.seq, floor)));

      if (old.length === 0) continue;
      await removeObjects(old.map((part) => part.objectPath));
      await db
        .delete(generationParts)
        .where(and(eq(generationParts.vaultId, vault.id), lt(generationParts.seq, floor)));
      const removed = await db
        .delete(generations)
        .where(and(eq(generations.vaultId, vault.id), lt(generations.seq, floor)))
        .returning({ seq: generations.seq });
      reapedGenerations += removed.length;
    }

    // ── 4. 구독 만료 후 유예가 지난 금고 ──────────────────────────────────────
    let purgedExpired = 0;
    const lapsed = await db
      .select({ id: vaults.id })
      .from(vaults)
      .where(
        and(
          sql`${vaults.purgedAt} is null`,
          sql`${vaults.proExpiresAt} is not null`,
          lt(vaults.proExpiresAt, new Date(now - GRACE_MS)),
        ),
      )
      .limit(200);
    for (const vault of lapsed) {
      await purgeVault(vault.id);
      purgedExpired += 1;
    }

    // ── 5. 3년 무접근 금고 (탈퇴 없이 앱만 지운 경우) ─────────────────────────
    let purgedAbandoned = 0;
    const abandoned = await db
      .select({ id: vaults.id })
      .from(vaults)
      .where(and(sql`${vaults.purgedAt} is null`, lt(vaults.updatedAt, new Date(now - ABANDONED_MS))))
      .limit(200);
    for (const vault of abandoned) {
      await purgeVault(vault.id);
      purgedAbandoned += 1;
    }

    // ── 6. 보관 기간이 지난 툼스톤 ────────────────────────────────────────────
    const expired = await db
      .delete(vaults)
      .where(
        and(
          sql`${vaults.purgedAt} is not null`,
          lt(vaults.purgedAt, new Date(now - TOMBSTONE_TTL_MS)),
        ),
      )
      .returning({ id: vaults.id });
    reapedTombstones = expired.length;

    return ok({ reapedParts, reapedGenerations, purgedExpired, purgedAbandoned, reapedTombstones });
  } catch (error) {
    reportError(error, 'cron/reap');
    return fail('error');
  }
}

/** 로컬에서 눈으로 확인할 때. 동작은 POST와 같다 */
export const GET = POST;
