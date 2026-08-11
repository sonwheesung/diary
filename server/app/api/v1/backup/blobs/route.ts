import { and, eq, inArray, sql } from 'drizzle-orm';

import { db } from '@/db';
import { vaultBlobs } from '@/db/schema';
import { identify } from '@/lib/auth';
import { reportError } from '@/lib/observability';
import { fail, ok } from '@/lib/respond';
import { blobPath, objectSize, signDownload, signUpload, storageConfigured } from '@/lib/storage';
import { ensureGrant, ensureVault, findVault, touchVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

/**
 * 사진 blob — 이미지 하나 = blob 하나. **세대와 무관하게 산다.**
 *
 * 매니페스트는 세대마다 통째로 다시 올리지만 사진은 한 번 올리면 끝이다 —
 * 조각 500개짜리 사용자가 한 줄 고쳤다고 사진 300장을 다시 올릴 수는 없다.
 *
 * ```
 * action: 'plan'      어느 것이 이미 있는가 → 앱이 **없는 것만** 올린다 (증분의 전부)
 * action: 'reserve'   서명 URL 발급
 * action: 'commit'    서버가 실제 크기를 물어 대조 + 쿼터 검사
 * action: 'download'  복원용 서명 URL
 * ```
 *
 * ⚠ 한 라우트에 action을 모은 이유: 넷 다 인가·금고 조회가 같고, 파일을 넷으로 쪼개면
 *   그 공통부가 네 벌이 된다. 각각이 하는 일은 아래에서 명확히 갈린다.
 */

/** 금고 하나가 쓸 수 있는 총량(사진 포함). ⏭ 티어가 생기면 여기서 갈린다 */
const QUOTA_BYTES = 2 * 1024 * 1024 * 1024;

/** 한 번에 다룰 수 있는 blob 수. 사진 300장짜리도 몇 번에 나눠 처리한다 */
const MAX_KEYS = 200;

interface Body {
  action?: unknown;
  vaultId?: unknown;
  blobKeys?: unknown;
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

  const action = typeof body.action === 'string' ? body.action : '';
  const vaultId = typeof body.vaultId === 'string' ? body.vaultId : '';
  const blobKeys = Array.isArray(body.blobKeys)
    ? body.blobKeys.filter((k): k is string => typeof k === 'string' && /^[0-9a-f]{64}$/.test(k))
    : [];

  if (!/^[0-9a-f]{32}$/.test(vaultId)) {
    return fail('error', { detail: 'bad-vault-id' });
  }
  if (blobKeys.length > MAX_KEYS) {
    return fail('error', { detail: 'too-many-keys', max: MAX_KEYS });
  }
  const authKey =
    typeof body.authKey === 'string' && /^[0-9a-f]{64}$/.test(body.authKey)
      ? body.authKey
      : undefined;

  try {
    /*
     * ⚠ **쓰기 갈래는 금고를 만든다.** 사진은 매니페스트보다 **먼저** 올라가야 하는데
     *   (안 그러면 커밋된 세대가 없는 사진을 가리킨다) 금고를 매니페스트 예약만
     *   만들게 두면 **첫 백업이 no-vault로 영원히 막힌다.** 실제로 그렇게 막혔다.
     *
     *   `download`는 만들지 않는다 — 읽기가 빈 금고를 만들면 리퍼가 치울 껍데기만 는다.
     */
    const vault = action === 'download' ? await findVault(vaultId) : await ensureVault(vaultId, authKey);
    if (vault === null) return fail('no-vault');
    if (vault.purgedAt !== null) {
      return fail('vault-purged', { purgedAt: vault.purgedAt.toISOString() });
    }
    await touchVault(vaultId, identity.proExpiresAt);

    /*
     * ⚠ **다운로드는 구독도 grant도 요구하지 않는다.** 복원 경로이고,
     *   읽기는 암호가 이미 지킨다(§5). 나머지 셋은 쓰기라 둘 다 필요하다.
     */
    if (action !== 'download') {
      if (!identity.pro) return fail('not-subscribed');
      const grant = await ensureGrant(vaultId, identity);
      if (grant.kind === 'taken') {
        return fail('no-grant', { reboundAt: grant.reboundAt?.toISOString() ?? null });
      }
    }

    if (action === 'plan') return await plan(vaultId, blobKeys);
    if (action === 'reserve') return await reserve(vaultId, blobKeys);
    if (action === 'commit') return await commit(vaultId, blobKeys);
    if (action === 'download') return await download(vaultId, blobKeys);
    return fail('error', { detail: 'bad-action' });
  } catch (error) {
    reportError(error, `backup/blobs:${action}`);
    return fail('error');
  }
}

/**
 * 어느 것이 이미 올라가 있는가.
 *
 * **증분의 전부가 여기다.** 앱은 `missing`만 올린다 — 사진이 바뀌는 일은 드물고,
 * 매번 전량을 올리면 300장짜리 사용자는 백업을 한 번도 끝내지 못한다.
 *
 * 참조 시각도 여기서 갱신한다 — 서버는 매니페스트를 읽을 수 없어서
 * **앱이 알려주지 않으면 무엇이 살아 있는지 모른다.**
 */
async function plan(vaultId: string, blobKeys: string[]) {
  if (blobKeys.length === 0) {
    return ok({ have: [], missing: [] });
  }
  const rows = await db
    .select({ blobKey: vaultBlobs.blobKey })
    .from(vaultBlobs)
    .where(
      and(
        eq(vaultBlobs.vaultId, vaultId),
        eq(vaultBlobs.state, 'committed'),
        inArray(vaultBlobs.blobKey, blobKeys),
      ),
    );

  const have = new Set(rows.map((row) => row.blobKey));
  if (have.size > 0) {
    // 살아 있다고 알려준다. 이게 없으면 리퍼가 멀쩡한 blob을 고아로 본다.
    await db
      .update(vaultBlobs)
      .set({ referencedAt: new Date() })
      .where(and(eq(vaultBlobs.vaultId, vaultId), inArray(vaultBlobs.blobKey, [...have])));
  }
  return ok({
    have: [...have],
    missing: blobKeys.filter((key) => !have.has(key)),
  });
}

async function reserve(vaultId: string, blobKeys: string[]) {
  const uploads: { blobKey: string; signedUrl: string }[] = [];
  for (const blobKey of blobKeys) {
    const path = blobPath(vaultId, blobKey);
    const signed = await signUpload(path);
    if (signed === null) {
      return fail('upstream', { detail: 'sign-failed' });
    }
    await db
      .insert(vaultBlobs)
      .values({ vaultId, blobKey, objectPath: path })
      // 재시도면 경로는 같고 상태만 되돌린다 — 실패한 업로드를 다시 올리는 경우다.
      .onConflictDoUpdate({
        target: [vaultBlobs.vaultId, vaultBlobs.blobKey],
        set: { reservedAt: new Date(), referencedAt: new Date() },
      });
    uploads.push({ blobKey, signedUrl: signed.signedUrl });
  }
  return ok({ uploads });
}

/**
 * 올라간 것을 확정한다.
 *
 * ⚠ **앱이 보낸 크기를 믿지 않는다.** Storage에 물어본다 — 앱 숫자로 쿼터를 세면
 *   조작해서 무한히 쓸 수 있다.
 */
async function commit(vaultId: string, blobKeys: string[]) {
  const committed: string[] = [];
  const missing: string[] = [];

  for (const blobKey of blobKeys) {
    const path = blobPath(vaultId, blobKey);
    const size = await objectSize(path);
    if (size === null || size === 0) {
      missing.push(blobKey);
      continue;
    }
    await db
      .update(vaultBlobs)
      .set({ state: 'committed', bytes: size, committedAt: new Date(), referencedAt: new Date() })
      .where(and(eq(vaultBlobs.vaultId, vaultId), eq(vaultBlobs.blobKey, blobKey)));
    committed.push(blobKey);
  }

  const [total] = await db
    .select({ sum: sql<number>`coalesce(sum(${vaultBlobs.bytes}), 0)` })
    .from(vaultBlobs)
    .where(and(eq(vaultBlobs.vaultId, vaultId), eq(vaultBlobs.state, 'committed')));

  const usedBytes = Number(total?.sum ?? 0);
  if (usedBytes > QUOTA_BYTES) {
    // ⚠ 이미 올라간 것을 지우지는 않는다 — 다음 업로드를 막을 뿐이다.
    return fail('quota-exceeded', { usedBytes, quota: QUOTA_BYTES, committed });
  }
  return ok({ committed, missing, usedBytes, quota: QUOTA_BYTES });
}

async function download(vaultId: string, blobKeys: string[]) {
  const rows = await db
    .select({ blobKey: vaultBlobs.blobKey, objectPath: vaultBlobs.objectPath })
    .from(vaultBlobs)
    .where(
      and(
        eq(vaultBlobs.vaultId, vaultId),
        eq(vaultBlobs.state, 'committed'),
        inArray(vaultBlobs.blobKey, blobKeys.length > 0 ? blobKeys : ['']),
      ),
    );

  const downloads: { blobKey: string; url: string }[] = [];
  for (const row of rows) {
    const url = await signDownload(row.objectPath);
    if (url === null) {
      return fail('upstream', { detail: 'sign-failed' });
    }
    downloads.push({ blobKey: row.blobKey, url });
  }
  /*
   * 요청했는데 없는 것도 알려준다 — 앱이 `missing`으로 남겨 **"이 사진은 이 기기에 없어요"**
   * 를 띄울 수 있어야 한다. 조용히 빠뜨리면 "아직 로딩 중"과 구별되지 않는다.
   */
  const found = new Set(downloads.map((item) => item.blobKey));
  return ok({ downloads, absent: blobKeys.filter((key) => !found.has(key)) });
}
