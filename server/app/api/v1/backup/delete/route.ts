import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { generationParts, generations, vaultGrants, vaults } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { removeObjects, storageConfigured } from '@/lib/storage';
import { authKeyMatches, ensureGrant, findVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 금고를 지운다.
 *
 * **탈퇴 흐름이 이 라우트를 먼저 부른다.** `common_server`가 수정 금지라
 * `subject_events` 아웃박스를 만들 수 없어서, 앱이 탈퇴 직전에 직접 지운다
 * (`docs/BACKUP_SYSTEM.md` §5). 실패하면 앱이 탈퇴를 진행하지 않는다.
 *
 * ## 인가 — grant **또는** auth_key
 *
 * 둘 중 하나면 된다. 이유가 서로 다르다:
 *   - **grant**: 복구 코드를 잃어도 자기 계정의 백업은 지울 수 있어야 한다.
 *     Play 데이터 보안의 "삭제 요청 가능"이 이걸 전제한다.
 *   - **auth_key**: 계정을 바꿨거나 재가입해서 `subject_id`가 달라진 사람도 지울 수 있어야 한다.
 *     (탈퇴 후 재가입하면 `subject_id`가 바뀐다 — `CLAUDE.md` §7.2)
 *
 * ⚠ **구독을 요구하지 않는다.** 지우는 것을 막을 이유가 없다.
 *
 * ## 즉시 파기다 (유예 없음)
 *
 * 유예 90일은 **구독이 끊겼을 때**의 규칙이지, 사용자가 직접 지울 때가 아니다.
 * PIPA §21·§36은 삭제 요청에 **지체 없는 파기**를 요구한다.
 */

interface Body {
  vaultId?: unknown;
  authKey?: unknown;
}

export async function POST(req: Request) {
  if (!storageConfigured()) {
    return fail('upstream', { detail: 'storage-unset' });
  }

  const identity = await identify(req);
  if (identity === 'unauthenticated') return fail('unauthorized');
  if (identity === 'upstream') return fail('upstream');

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail('error', { detail: 'bad-json' });
  }

  const vaultId = typeof body.vaultId === 'string' ? body.vaultId : '';
  const authKey = typeof body.authKey === 'string' ? body.authKey : null;
  if (!/^[0-9a-f]{32}$/.test(vaultId)) {
    return fail('error', { detail: 'bad-vault-id' });
  }

  try {
    const vault = await findVault(vaultId);
    if (vault === null) {
      // 이미 없다 = 목적 달성. 탈퇴 흐름이 여기서 막히면 안 된다.
      return ok({ vaultId, alreadyGone: true });
    }
    if (vault.purgedAt !== null) {
      return ok({ vaultId, alreadyGone: true });
    }

    const grant = await ensureGrant(vaultId, identity, false);
    const allowed = grant.kind === 'ok' || authKeyMatches(vault, authKey);
    if (!allowed) {
      return fail('no-grant', { detail: 'auth-required' });
    }

    await purgeVault(vaultId);
    return ok({ vaultId });
  } catch (error) {
    reportError(error, 'backup/delete');
    return fail('error');
  }
}

/**
 * 객체와 행을 지우고 **툼스톤을 남긴다.**
 *
 * ⚠ 행까지 지우면 404밖에 못 준다. 404를 받은 사용자는 자기 일기가 지워졌다는 사실을
 *   **영원히 모른다** — "서버가 이상한가 보다"로 읽는다. 410을 주려면 이 행이 필요하다.
 * ⚠ 툼스톤에 `subject_id`를 남기지 않는다(`vault_grants`를 함께 지운다) —
 *   탈퇴자의 식별자가 남으면 "지체 없이 파기"와 충돌한다.
 */
export async function purgeVault(vaultId: string): Promise<void> {
  const parts = await db
    .select({ objectPath: generationParts.objectPath })
    .from(generationParts)
    .where(eq(generationParts.vaultId, vaultId));

  // 객체를 먼저 지운다 — 행을 먼저 지우면 **경로를 잃어 객체가 영원히 남는다.**
  await removeObjects(parts.map((part) => part.objectPath));

  await db.delete(generationParts).where(eq(generationParts.vaultId, vaultId));
  await db.delete(generations).where(eq(generations.vaultId, vaultId));
  await db.delete(vaultGrants).where(eq(vaultGrants.vaultId, vaultId));
  await db
    .update(vaults)
    .set({ purgedAt: new Date(), proExpiresAt: null })
    .where(and(eq(vaults.id, vaultId)));
}
