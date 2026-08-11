import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { generationParts, generations } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { manifestPath, signUpload, storageConfigured } from '@/lib/storage';
import { ensureGrant, ensureVault, touchVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 업로드 3단 중 **1단 — 자리 예약**.
 *
 * ```
 * reserve  →  앱이 서명 URL로 Storage에 직접 PUT  →  commit
 * ```
 *
 * 여기서 서명 URL을 발급하고 `reserved` 행을 만든다. **암호문은 이 함수를 지나가지 않는다.**
 *
 * ⚠ 멱등하다. 같은 (vault, seq, genId)로 다시 부르면 **URL을 재발급**한다 —
 *   TTL이 2시간 고정이라 느린 업로드가 만료될 수 있고, 그때 처음부터 다시 하게 만들면
 *   느린 네트워크의 사용자는 영원히 백업을 못 한다.
 */

const MAX_PART_COUNT = 4096;

interface Body {
  vaultId?: unknown;
  seq?: unknown;
  genId?: unknown;
  partCount?: unknown;
  /** 금고를 **처음 만들 때만** 쓰인다. 이후 요청의 값은 무시된다 */
  authKey?: unknown;
}

export async function POST(req: Request) {
  if (!storageConfigured()) {
    return fail('upstream', { detail: 'storage-unset' });
  }

  const identity = await identify(req);
  if (identity === 'unauthenticated') {
    return fail('unauthorized');
  }
  if (identity === 'upstream') {
    return fail('upstream');
  }
  // ⚠ 쓰기에만 구독을 요구한다. 읽기(복원)는 구독과 무관하다 — 폰을 잃고 갱신이
  //   실패한 사람이 복원조차 못 하면 이 기능의 존재 이유가 사라진다.
  if (!identity.pro) {
    return fail('not-subscribed');
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error', { detail: 'bad-json' });
  }

  const vaultId = typeof body.vaultId === 'string' ? body.vaultId : '';
  const genId = typeof body.genId === 'string' ? body.genId : '';
  const authKey = typeof body.authKey === 'string' ? body.authKey : undefined;
  const seq = typeof body.seq === 'number' ? body.seq : NaN;
  const partCount = typeof body.partCount === 'number' ? body.partCount : NaN;

  if (!/^[0-9a-f]{32}$/.test(vaultId) || !/^[0-9a-f]{16}$/.test(genId)) {
    return fail('error', { detail: 'bad-ids' });
  }
  if (!Number.isInteger(seq) || seq < 1) {
    return fail('error', { detail: 'bad-seq' });
  }
  if (!Number.isInteger(partCount) || partCount < 1 || partCount > MAX_PART_COUNT) {
    return fail('error', { detail: 'bad-part-count' });
  }

  try {
    const vault = await ensureVault(vaultId, authKey);
    if (vault.purgedAt !== null) {
      return fail('vault-purged', { purgedAt: vault.purgedAt.toISOString() });
    }

    // 접근 시각과 구독 만료 스냅샷을 남긴다 — 유예·방치 정리의 유일한 근거다.
    await touchVault(vaultId, identity.proExpiresAt);

    const grant = await ensureGrant(vaultId, identity);
    if (grant.kind === 'taken') {
      // 앱은 여기서 "되찾기" 버튼을 보여준다. 덮어쓰기 버튼은 만들지 않는다 —
      // 순진한 덮어쓰기가 상대 기기의 조각을 지운다.
      return fail('no-grant', { reboundAt: grant.reboundAt?.toISOString() ?? null });
    }

    /*
     * ⚠ 다음 세대는 정확히 `seq + 1`이다. 앞서가면 구멍이 생기고, 같거나 뒤면
     *   이미 있는 세대를 덮는다. 어긋나면 앱이 서버 값을 보고 커서를 맞춘다.
     */
    if (seq !== vault.seq + 1) {
      return fail('seq-conflict', { serverSeq: vault.seq });
    }

    const [existing] = await db
      .select()
      .from(generations)
      .where(and(eq(generations.vaultId, vaultId), eq(generations.seq, seq)))
      .limit(1);

    if (existing !== undefined && existing.genId !== genId) {
      /*
       * 같은 seq를 **다른 genId로** 다시 올리려 한다 = 앞선 시도를 버리고 새로 하는 것이다.
       * 옛 파트를 남겨두면 나중에 섞여 찢어진 세대가 된다 — 지우고 새로 시작한다.
       */
      await db
        .delete(generationParts)
        .where(and(eq(generationParts.vaultId, vaultId), eq(generationParts.seq, seq)));
      await db
        .delete(generations)
        .where(and(eq(generations.vaultId, vaultId), eq(generations.seq, seq)));
    }

    await db
      .insert(generations)
      .values({ vaultId, seq, genId, partCount })
      .onConflictDoNothing();

    // 파트마다 서명 URL. 재호출이면 같은 경로로 새 URL이 나온다(멱등).
    const uploads: { part: number; path: string; signedUrl: string; token: string }[] = [];
    for (let part = 0; part < partCount; part += 1) {
      const path = manifestPath(vaultId, seq, part);
      const signed = await signUpload(path);
      if (signed === null) {
        return fail('upstream', { detail: 'sign-failed' });
      }
      await db
        .insert(generationParts)
        .values({ vaultId, seq, part, objectPath: path })
        .onConflictDoNothing();
      uploads.push({ part, path, signedUrl: signed.signedUrl, token: signed.token });
    }

    return ok({ seq, genId, uploads });
  } catch (error) {
    reportError(error, 'backup/reserve');
    return fail('error');
  }
}
