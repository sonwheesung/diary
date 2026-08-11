import { createClient } from '@supabase/supabase-js';

import { reportError } from './observability';

/**
 * Supabase Storage — 암호문 객체가 사는 곳.
 *
 * ⚠ **암호문이 조각 서버 함수를 통과하지 않는다.** 앱이 서명 URL로 Storage에 직접 올리고
 *   직접 받는다. 이건 규율이 아니라 **구조**가 보장하는 것이라, 다음 사람이 실수로
 *   본문을 로깅할 방법 자체가 없다. (부수 효과로 Vercel 함수 본문 4.5MB 한도도 우회한다.)
 *
 * ⚠ 서비스 롤 키를 쓰므로 **RLS가 우회된다.** 격리는 RLS가 아니라 아래 `objectPath` 하나가
 *   한다 — 경로를 서버가 조립하고 앱이 보낸 문자열을 절대 쓰지 않는다. 그래도 버킷에는
 *   deny-all RLS를 켠다(사고가 났을 때 등급이 한 단계 낮아진다).
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
export const BUCKET = 'backups';

/** 설정이 없으면 라우트가 503으로 답할 수 있게 알려준다. 모듈 로드 시 throw하지 않는다 */
export function storageConfigured(): boolean {
  return SERVICE_ROLE_KEY.length > 0;
}

const g = globalThis as unknown as { __sb?: ReturnType<typeof createClient> };
const supabase = (g.__sb ??= createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
}));

/**
 * 객체 경로를 **서버가 조립한다.**
 *
 * ⚠ 앱이 보낸 문자열을 경로에 넣으면 `../`로 남의 금고에 쓸 수 있다.
 *   `vaultId`는 hex, 나머지는 정수라 여기서 조립하면 순회가 원천 차단된다.
 */
export function manifestPath(vaultId: string, seq: number, part: number): string {
  assertHex32(vaultId);
  assertIndex(seq);
  assertIndex(part);
  return `${vaultId}/manifests/${seq}/${part}`;
}

function assertHex32(vaultId: string): void {
  if (!/^[0-9a-f]{32}$/.test(vaultId)) {
    throw new Error('vaultId는 소문자 hex 32자여야 한다');
  }
}

function assertIndex(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
    throw new Error(`경로에 쓸 수 없는 값: ${value}`);
  }
}

export interface SignedUpload {
  path: string;
  token: string;
  signedUrl: string;
}

/**
 * 업로드용 서명 URL.
 *
 * ⚠ TTL은 **2시간 고정**이다 — `createSignedUploadUrl`에 옵션이 없다.
 *   그리고 **크기 제한 파라미터도 없다.** 그래서 커밋 때 서버가 실제 크기를 조회해
 *   대조한다(아래 `objectSize`). 앱이 보낸 숫자를 믿지 않는다.
 */
export async function signUpload(path: string): Promise<SignedUpload | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path, {
    upsert: true, // 같은 파트를 재시도할 수 있다. 경로가 결정적이라 남의 것을 덮지 않는다
  });
  if (error !== null || data === null) {
    reportError(error, 'signUpload');
    return null;
  }
  return data;
}

/** 다운로드용 서명 URL. 복원이 이걸로 직접 받는다 */
export async function signDownload(path: string, expiresInSeconds = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error !== null || data === null) {
    reportError(error, 'signDownload');
    return null;
  }
  return data.signedUrl;
}

/**
 * 객체의 실제 크기. **커밋의 근거다.**
 *
 * 앱이 "3MB 올렸어요"라고 말하는 것과 실제로 올라간 것은 다르다 —
 * 쿼터를 앱이 보낸 숫자로 세면 그 숫자를 조작해 무한히 쓸 수 있다.
 */
export async function objectSize(path: string): Promise<number | null> {
  const slash = path.lastIndexOf('/');
  const { data, error } = await supabase.storage.from(BUCKET).list(path.slice(0, slash), {
    search: path.slice(slash + 1),
    limit: 1,
  });
  if (error !== null || data === null || data.length === 0) {
    return null;
  }
  const size = (data[0].metadata as { size?: number } | null)?.size;
  return typeof size === 'number' ? size : null;
}

/** 리퍼와 파기가 쓴다 */
export async function removeObjects(paths: readonly string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove([...paths]);
  if (error !== null) {
    reportError(error, 'removeObjects');
  }
}
