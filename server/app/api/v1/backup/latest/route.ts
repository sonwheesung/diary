import { and, desc, eq, isNotNull } from 'drizzle-orm';

import { db } from '@/db';
import { generationParts, generations } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { signDownload, storageConfigured } from '@/lib/storage';
import { ensureGrant, findVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 복원 — 가장 최근에 **완성된** 세대의 다운로드 URL을 준다.
 *
 * ⚠ **읽기에는 구독을 요구하지 않는다.** 이미 확정된 결정이다(90일 유예 중 복원 가능).
 *   가장 나쁜 현실 조합이 이렇다: 폰 분실 → 결제 수단이 그 폰에 묶여 갱신 실패 → 해지 →
 *   새 폰에서 복원 시도. 여기서 막으면 **폰을 잃은 사람을 위한 기능이 폰을 잃으면 잠긴다.**
 *
 * ⚠ `vaultId`를 **쿼리스트링에 받지 않는다.** 액세스 로그에 남는다 — POST 본문으로 받는다.
 *   (그래서 조회인데 POST다. REST 형식보다 로그에 안 남는 쪽이 낫다.)
 */

interface Body {
  vaultId?: unknown;
  /** 특정 세대를 지정할 수 있다. 없으면 최신 */
  seq?: unknown;
}

export async function POST(req: Request) {
  if (!storageConfigured()) {
    return fail('upstream', { detail: 'storage-unset' });
  }

  const identity = await identify(req);
  if (identity === 'unauthenticated') return fail('unauthorized');
  if (identity === 'upstream') return fail('upstream');
  // 구독 검사 없음 — 위 주석 참조.

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error', { detail: 'bad-json' });
  }

  const vaultId = typeof body.vaultId === 'string' ? body.vaultId : '';
  if (!/^[0-9a-f]{32}$/.test(vaultId)) {
    return fail('error', { detail: 'bad-vault-id' });
  }
  const wantSeq = typeof body.seq === 'number' && Number.isInteger(body.seq) ? body.seq : null;

  try {
    const vault = await findVault(vaultId);
    if (vault === null) return fail('no-vault');
    if (vault.purgedAt !== null) {
      // 410이어야 한다. 404를 주면 사용자는 자기 일기가 지워졌다는 걸 영원히 모른다.
      return fail('vault-purged', { purgedAt: vault.purgedAt.toISOString() });
    }

    /*
     * 읽기도 grant를 확인한다 — 다만 **비어 있으면 잡는다.**
     * 새 폰이 복구 코드로 처음 붙는 경로가 이것이다(최초 grant = 선착순, lib/vault.ts).
     * 남이 잡고 있으면 되찾기를 안내한다.
     */
    const grant = await ensureGrant(vaultId, identity);
    if (grant.kind === 'taken') {
      return fail('no-grant', { reboundAt: grant.reboundAt?.toISOString() ?? null });
    }

    const [generation] = await db
      .select()
      .from(generations)
      .where(
        wantSeq === null
          ? and(eq(generations.vaultId, vaultId), isNotNull(generations.committedAt))
          : and(
              eq(generations.vaultId, vaultId),
              eq(generations.seq, wantSeq),
              isNotNull(generations.committedAt),
            ),
      )
      .orderBy(desc(generations.seq))
      .limit(1);

    if (generation === undefined) {
      // 금고는 있는데 완성된 세대가 없다 — 첫 백업이 실패한 상태다.
      return fail('no-vault', { detail: 'no-committed-generation' });
    }

    const parts = await db
      .select()
      .from(generationParts)
      .where(
        and(
          eq(generationParts.vaultId, vaultId),
          eq(generationParts.seq, generation.seq),
          eq(generationParts.state, 'committed'),
        ),
      )
      .orderBy(generationParts.part);

    /*
     * ⚠ 여기서도 개수를 센다. 커밋 때 확인했지만, 그 뒤에 리퍼나 파기가 건드렸을 수 있다.
     *   모자란 채로 URL을 주면 앱이 받아서 복호화까지 마친 뒤에야 깨진 걸 안다.
     */
    if (parts.length !== generation.partCount) {
      return fail('error', {
        detail: 'parts-incomplete',
        have: parts.length,
        want: generation.partCount,
      });
    }

    const downloads: { part: number; url: string }[] = [];
    for (const part of parts) {
      const url = await signDownload(part.objectPath);
      if (url === null) {
        return fail('upstream', { detail: 'sign-failed' });
      }
      downloads.push({ part: part.part, url });
    }

    return ok({
      seq: generation.seq,
      genId: generation.genId,
      partCount: generation.partCount,
      totalBytes: generation.totalBytes,
      committedAt: generation.committedAt?.toISOString() ?? null,
      downloads,
    });
  } catch (error) {
    reportError(error, 'backup/latest');
    return fail('error');
  }
}
