import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { generationParts, generations } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { objectSize, storageConfigured } from '@/lib/storage';
import { advanceSeq, ensureGrant, findVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 업로드 3단 중 **3단 — 커밋**.
 *
 * 앱이 전 파트를 Storage에 올린 뒤 부른다. 서버는 **실제로 올라갔는지 직접 확인하고**
 * 세대를 완성 처리한다.
 *
 * ⚠ **앱이 보낸 크기를 믿지 않는다.** Storage에 물어본다 —
 *   앱이 보낸 숫자로 쿼터를 세면 그 숫자를 조작해 무한히 쓸 수 있다.
 *
 * ⚠ **전부 있어야 커밋된다.** 하나라도 없으면 미완성으로 남기고 거부한다.
 *   반쪽 세대를 커밋하면 복원이 그만큼 조용히 잃는다.
 */

/** 금고 하나가 쓸 수 있는 총량. ⏭ 구독 티어가 생기면 여기서 갈린다 */
const QUOTA_BYTES = 2 * 1024 * 1024 * 1024;

interface Body {
  vaultId?: unknown;
  seq?: unknown;
  genId?: unknown;
}

export async function POST(req: Request) {
  if (!storageConfigured()) {
    return fail('upstream', { detail: 'storage-unset' });
  }

  const identity = await identify(req);
  if (identity === 'unauthenticated') return fail('unauthorized');
  if (identity === 'upstream') return fail('upstream');
  if (!identity.pro) return fail('not-subscribed');

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error', { detail: 'bad-json' });
  }

  const vaultId = typeof body.vaultId === 'string' ? body.vaultId : '';
  const genId = typeof body.genId === 'string' ? body.genId : '';
  const seq = typeof body.seq === 'number' ? body.seq : NaN;

  if (!/^[0-9a-f]{32}$/.test(vaultId) || !/^[0-9a-f]{16}$/.test(genId) || !Number.isInteger(seq)) {
    return fail('error', { detail: 'bad-ids' });
  }

  try {
    const vault = await findVault(vaultId);
    if (vault === null) return fail('no-vault');
    if (vault.purgedAt !== null) {
      return fail('vault-purged', { purgedAt: vault.purgedAt.toISOString() });
    }

    const grant = await ensureGrant(vaultId, identity, false);
    if (grant.kind === 'taken') {
      return fail('no-grant', { reboundAt: grant.reboundAt?.toISOString() ?? null });
    }

    const [generation] = await db
      .select()
      .from(generations)
      .where(and(eq(generations.vaultId, vaultId), eq(generations.seq, seq)))
      .limit(1);

    if (generation === undefined) return fail('no-vault', { detail: 'no-generation' });
    if (generation.genId !== genId) {
      // 앱이 커밋하려는 세대와 서버가 예약해둔 세대가 다르다 — 중간에 재시도가 끼었다.
      return fail('seq-conflict', { serverSeq: vault.seq, detail: 'gen-mismatch' });
    }
    if (generation.committedAt !== null) {
      // 이미 커밋됐다. 응답이 유실돼 재시도한 경우이므로 **성공으로 답한다**(멱등).
      return ok({ seq, alreadyCommitted: true, totalBytes: generation.totalBytes });
    }

    const parts = await db
      .select()
      .from(generationParts)
      .where(and(eq(generationParts.vaultId, vaultId), eq(generationParts.seq, seq)));

    if (parts.length !== generation.partCount) {
      return fail('error', { detail: 'part-rows-missing', have: parts.length, want: generation.partCount });
    }

    // Storage에 **직접 물어본다.** 여기가 이 라우트의 존재 이유다.
    let totalBytes = 0;
    const missing: number[] = [];
    for (const part of parts) {
      const size = await objectSize(part.objectPath);
      if (size === null || size === 0) {
        missing.push(part.part);
        continue;
      }
      totalBytes += size;
      await db
        .update(generationParts)
        .set({ state: 'committed', bytes: size, committedAt: new Date() })
        .where(
          and(
            eq(generationParts.vaultId, vaultId),
            eq(generationParts.seq, seq),
            eq(generationParts.part, part.part),
          ),
        );
    }

    if (missing.length > 0) {
      // 미완성으로 남긴다 — 앱이 빠진 파트만 다시 올리고 커밋을 재시도할 수 있다.
      return fail('error', { detail: 'objects-missing', parts: missing });
    }

    if (totalBytes > QUOTA_BYTES) {
      return fail('quota-exceeded', { totalBytes, quota: QUOTA_BYTES });
    }

    /*
     * seq를 조건부로 올린다. 두 요청이 같은 세대를 커밋하려 하면 하나만 이긴다.
     * ⚠ 진 쪽에게 409를 주되, 세대 자체는 이미 완성됐을 수 있으므로 다시 읽어 판단한다.
     */
    const advanced = await advanceSeq(vaultId, seq - 1);
    if (!advanced) {
      const fresh = await findVault(vaultId);
      if (fresh !== null && fresh.seq >= seq) {
        return ok({ seq, alreadyCommitted: true, totalBytes });
      }
      return fail('seq-conflict', { serverSeq: fresh?.seq ?? vault.seq });
    }

    await db
      .update(generations)
      .set({ committedAt: new Date(), totalBytes })
      .where(and(eq(generations.vaultId, vaultId), eq(generations.seq, seq)));

    return ok({ seq, totalBytes });
  } catch (error) {
    reportError(error, 'backup/commit');
    return fail('error');
  }
}
