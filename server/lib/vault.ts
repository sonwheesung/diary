import { createHash } from 'node:crypto';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { vaultGrants, vaults } from '@/db/schema';
import type { Identity } from './auth';

/**
 * 금고 소유권.
 *
 * ## 최초 grant는 **선착순**이다
 *
 * 설계 초안에는 되찾기(rebind)만 있고 *"새 폰이 처음 이 금고를 잡는" 경로*가 없었다.
 * 그대로 두면 주 시나리오(기기 분실 → 새 폰)가 계약상 불가능하다 —
 * 읽기에 grant가 필요한데 grant를 만드는 길이 rebind뿐이고, rebind는 복원 뒤에 오므로 순환이다.
 *
 * 그래서: **grant가 없는 금고는 요청한 계정이 그대로 가진다.**
 *
 * ⚠ 이게 안전한 이유는 `vaultId`가 **복구 코드에서 유도**되기 때문이다. 남의 금고를 잡으려면
 *   그 사람의 복구 코드를 알아야 하고, 알면 어차피 오프라인에서 복호화할 수 있다.
 *   즉 이 문이 새로 여는 것은 없다.
 *
 * ⚠ 반대로 **`vaultId`만으로 인가하지는 않는다.** 그 값은 서버 DB와 로그에 평문으로 있다.
 *   읽기·쓰기 모두 Bearer로 신원을 먼저 확인하고, 그 신원이 grant와 맞아야 한다.
 */

export type GrantOutcome =
  | { kind: 'ok'; created: boolean }
  /** 다른 계정이 라이터다. 앱은 "되찾기" 버튼을 보여준다 */
  | { kind: 'taken'; reboundAt: Date | null };

/**
 * 이 신원이 금고의 라이터인지 확인하고, 비어 있으면 잡는다.
 *
 * `allowClaim: false`로 부르면 잡지 않고 확인만 한다 — 읽기 전용 경로가 쓴다.
 */
export async function ensureGrant(
  vaultId: string,
  identity: Identity,
  allowClaim = true,
): Promise<GrantOutcome> {
  const [existing] = await db
    .select()
    .from(vaultGrants)
    .where(eq(vaultGrants.vaultId, vaultId))
    .limit(1);

  if (existing !== undefined) {
    return existing.subjectId === identity.subjectId
      ? { kind: 'ok', created: false }
      : { kind: 'taken', reboundAt: existing.reboundAt };
  }
  if (!allowClaim) {
    return { kind: 'taken', reboundAt: null };
  }

  /*
   * 경합은 UNIQUE가 막는다 — 두 기기가 동시에 잡으면 하나만 INSERT되고,
   * 진 쪽은 `onConflictDoNothing` 뒤 다시 읽어 자기 것인지 확인한다.
   */
  await db
    .insert(vaultGrants)
    .values({ vaultId, subjectId: identity.subjectId })
    .onConflictDoNothing();

  const [after] = await db
    .select()
    .from(vaultGrants)
    .where(eq(vaultGrants.vaultId, vaultId))
    .limit(1);

  if (after?.subjectId === identity.subjectId) {
    return { kind: 'ok', created: true };
  }
  return { kind: 'taken', reboundAt: after?.reboundAt ?? null };
}

/**
 * 되찾기 — 이 기기를 라이터로 만든다.
 *
 * ⚠ **읽기 등급이다.** 쓰기로 분류하면 구독이 끊긴 분실자가 rebind부터 막혀서,
 *   "읽기(복원)는 구독과 무관하다"는 결정이 한 층 아래에서 무효가 된다.
 *
 * ⚠ 뺏긴 기기는 다음 접속 때 403을 받는데, `reboundAt`이 없으면 **왜인지 모른다.**
 *   화면에 "다른 기기에서 되찾았어요"를 띄우려면 이 시각이 필요하다.
 */
export async function rebindGrant(vaultId: string, identity: Identity): Promise<void> {
  await db
    .insert(vaultGrants)
    .values({ vaultId, subjectId: identity.subjectId, reboundAt: new Date() })
    .onConflictDoUpdate({
      target: vaultGrants.vaultId,
      set: { subjectId: identity.subjectId, reboundAt: new Date() },
    });
}

export interface VaultRow {
  id: string;
  seq: number;
  purgedAt: Date | null;
  authHash: string | null;
}

/** `auth_key`(hex 64자)의 저장 형태 */
export function hashAuthKey(authKey: string): string {
  return createHash('sha256').update(authKey, 'utf8').digest('hex');
}

/**
 * 제시한 `auth_key`가 이 금고의 것인가.
 *
 * ⚠ 해시가 **없는** 금고(auth_key가 붙기 전에 만들어진 것)는 통과시키지 않는다 —
 *   "해시가 없으면 아무나 통과"는 인가를 통째로 무력화한다.
 */
export function authKeyMatches(vault: VaultRow, authKey: string | null): boolean {
  if (vault.authHash === null || authKey === null || authKey.length === 0) {
    return false;
  }
  return vault.authHash === hashAuthKey(authKey);
}

/** 금고를 읽는다. 없으면 `null`, 파기됐으면 행은 있고 `purgedAt`이 찍혀 있다 */
export async function findVault(vaultId: string): Promise<VaultRow | null> {
  const [row] = await db
    .select({ id: vaults.id, seq: vaults.seq, purgedAt: vaults.purgedAt, authHash: vaults.authHash })
    .from(vaults)
    .where(eq(vaults.id, vaultId))
    .limit(1);
  return row ?? null;
}

/**
 * 없으면 만든다. 첫 백업이 곧 금고 생성이다.
 *
 * `authKey`는 **금고를 처음 만들 때만** 해시로 박힌다. 이미 있는 금고의 해시를 덮어쓰면
 * 코드를 아는 사람이 남의 금고 인가를 갈아치울 수 있다.
 */
export async function ensureVault(vaultId: string, authKey?: string): Promise<VaultRow> {
  await db
    .insert(vaults)
    .values({ id: vaultId, authHash: authKey === undefined ? null : hashAuthKey(authKey) })
    .onConflictDoNothing();
  const row = await findVault(vaultId);
  if (row === null) {
    throw new Error('금고를 만들지 못했다');
  }
  return row;
}

/**
 * 세대 커밋 후 금고의 `seq`를 올린다.
 *
 * **조건부 UPDATE다** — 기대한 seq일 때만 올라간다. 두 요청이 같은 세대를 커밋하려 하면
 * 하나만 성공하고, 진 쪽은 409를 받는다.
 */
export async function advanceSeq(vaultId: string, fromSeq: number): Promise<boolean> {
  const result = await db
    .update(vaults)
    .set({ seq: fromSeq + 1, updatedAt: new Date() })
    .where(and(eq(vaults.id, vaultId), eq(vaults.seq, fromSeq)))
    .returning({ id: vaults.id });
  return result.length > 0;
}
