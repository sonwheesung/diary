import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { storageConfigured } from '@/lib/storage';
import { authKeyMatches, ensureGrant, findVault, purgeVault } from '@/lib/vault';

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
