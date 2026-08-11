import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { authKeyMatches, findVault, rebindGrant } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 되찾기 — 이 계정을 금고의 라이터로 만든다.
 *
 * 다른 기기가 grant를 쥐고 있어 `reserve`가 403(`no-grant`)을 준 뒤에 부른다.
 *
 * ⚠ **구독을 요구하지 않는다(읽기 등급).** 쓰기로 분류하면 구독이 끊긴 분실자가
 *   되찾기부터 막혀서, "복원은 구독과 무관하다"는 결정이 한 층 아래에서 무효가 된다.
 *   되찾기 자체는 아무것도 쓰지 않는다 — 실제 업로드는 여전히 구독을 요구한다.
 *
 * ⚠ **`auth_key`를 요구한다.** Bearer만으로 열면 `vault_id`를 아는 사람이 라이터를 뺏어
 *   주인의 백업을 멈추고 쓰레기 세대를 올릴 수 있다. 읽지는 못해도 실질적 피해다.
 *   서버는 `sha256(auth_key)`만 갖고 있어 **DB가 통째로 새도 이 권한은 안 샌다.**
 *
 * ⚠ `auth_key`는 **절대 로그에 남기지 않는다.** 대칭 비밀이라 요청 중에는 평문이다.
 */

interface Body {
  vaultId?: unknown;
  authKey?: unknown;
}

export async function POST(req: Request) {
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
    if (vault === null) return fail('no-vault');
    if (vault.purgedAt !== null) {
      return fail('vault-purged', { purgedAt: vault.purgedAt.toISOString() });
    }

    if (!authKeyMatches(vault, authKey)) {
      /*
       * ⚠ 실패 사유를 나누지 않는다. "해시가 없는 금고"와 "키가 틀렸다"를 구분해 주면
       *   공격자가 어느 금고에 인가가 안 걸려 있는지 알아낼 수 있다.
       */
      return fail('no-grant', { detail: 'auth-required' });
    }

    await rebindGrant(vaultId, identity);
    return ok({ vaultId });
  } catch (error) {
    reportError(error, 'backup/rebind');
    return fail('error');
  }
}
