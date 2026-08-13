import { and, eq, lt, sql } from 'drizzle-orm';

import { db } from '@/db';
import { aiCooldowns, aiReports, generationParts, generations, vaultBlobs, vaults } from '@/db/schema';
import { COOLDOWN_TTL_MS, REPORT_RETENTION_MS } from '@/lib/ai-policy';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { removeObjects, storageConfigured } from '@/lib/storage';
import { purgeVault } from '@/lib/vault';
import {
  ABANDONED_MS,
  BLOB_ORPHAN_MS,
  GRACE_MS,
  KEEP_GENERATIONS,
  RESERVED_TTL_MS,
  TOMBSTONE_TTL_MS,
} from '@/lib/policy';


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

    // ── 5.5 고아 blob ─────────────────────────────────────────────────────────
    /*
     * ⚠ **서버는 매니페스트를 읽을 수 없다**(암호문이다). 그래서 "이 blob이 참조되는가"를
     *   혼자 판정할 수 없고, 앱이 백업할 때마다 `plan`으로 알려주는 `referencedAt`이
     *   유일한 근거다.
     *
     * ⚠ 그래서 **유예를 넉넉히 둔다.** "현재 매니페스트에 없으면 즉시 삭제"로 만들면,
     *   백업이 며칠 실패한 사이에 멀쩡한 사진이 지워진다. 7일이면 사람이 알아챌 시간이 된다.
     */
    let reapedBlobs = 0;
    const orphanBlobs = await db
      .select()
      .from(vaultBlobs)
      .where(lt(vaultBlobs.referencedAt, new Date(now - BLOB_ORPHAN_MS)))
      .limit(500);
    if (orphanBlobs.length > 0) {
      await removeObjects(orphanBlobs.map((blob) => blob.objectPath));
      for (const blob of orphanBlobs) {
        await db
          .delete(vaultBlobs)
          .where(and(eq(vaultBlobs.vaultId, blob.vaultId), eq(vaultBlobs.blobKey, blob.blobKey)));
      }
      reapedBlobs = orphanBlobs.length;
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

    /*
     * ── 7. AI ────────────────────────────────────────────────────────────────
     * 🔴 **처리방침에 "90일 뒤 파기"를 적었으면 실제로 지워야 한다**(§5.2).
     *   적어두고 안 지우면 그 진술이 거짓이 되고, 그건 §5.1을 뒤집으며 이미 한 번 겪은 종류다.
     *
     * ⚠ 백업 정리가 실패해도 이건 돌아야 하고 반대도 마찬가지다 — 서로의 사정이 다르다.
     *   그래서 각각 try로 감싼다(위 단계들과 달리 여기서 던지면 전부 잃는다).
     */
    let reapedReports = 0;
    let reapedCooldowns = 0;
    try {
      const oldReports = await db
        .delete(aiReports)
        .where(lt(aiReports.createdAt, new Date(now - REPORT_RETENTION_MS)))
        .returning({ id: aiReports.id });
      reapedReports = oldReports.length;

      const oldCooldowns = await db
        .delete(aiCooldowns)
        .where(lt(aiCooldowns.until, new Date(now - COOLDOWN_TTL_MS)))
        .returning({ subjectId: aiCooldowns.subjectId });
      reapedCooldowns = oldCooldowns.length;
    } catch (error) {
      reportError(error, 'cron/reap.ai');
    }

    return ok({
      reapedParts,
      reapedGenerations,
      reapedBlobs,
      purgedExpired,
      purgedAbandoned,
      reapedTombstones,
      reapedReports,
      reapedCooldowns,
    });
  } catch (error) {
    reportError(error, 'cron/reap');
    return fail('error');
  }
}

/** 로컬에서 눈으로 확인할 때. 동작은 POST와 같다 */
export const GET = POST;
