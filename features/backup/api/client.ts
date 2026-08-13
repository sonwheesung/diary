import { DEV_SESSION_TOKEN } from '@/features/support/dev-auth';
import { readSessionToken } from '@/lib/common-server/client';

/**
 * 조각 서버 클라이언트 — 백업 금고.
 *
 * common_server SDK의 규약을 따른다: **throw하지 않는다.** 네트워크가 끊겨 있든 서버가
 * 없든 화면은 조용히 안내만 하면 되므로 실패를 타입으로 돌려준다.
 *
 * ⚠ **암호문이 우리 서버 함수를 지나가지 않는다.** 여기서 하는 일은 서명 URL을 받아
 *   Storage에 **직접** 올리고 받는 것뿐이다. 구조가 그걸 보장하므로, 실수로 본문을
 *   로깅할 방법 자체가 없다.
 */

/** 서버 URL. `EXPO_PUBLIC_*`는 빌드 시점에 번들로 인라인된다 — 비밀을 넣지 않는다 */
export const BACKUP_SERVER_URL = (process.env.EXPO_PUBLIC_BACKUP_SERVER_URL ?? '').replace(
  /\/$/,
  '',
);

/**
 * 실패 사유. 서버의 `FailCode`와 짝을 맞춘다.
 *
 * ⚠ `upstream`(503)과 `unauthorized`(401)를 구분한다. 상류 장애를 401로 다루면
 *   SDK가 세션을 폐기해 **사용자가 로그아웃된다.**
 */
export type BackupFail =
  | 'not-configured' // 서버 URL이 빌드에 안 박혔다
  | 'offline' // 네트워크 불가 / 타임아웃
  | 'unauthorized' // 로그인이 필요하다
  | 'not-subscribed' // 구독이 필요하다(쓰기에만)
  | 'no-grant' // 다른 기기가 라이터다 → 되찾기 안내
  | 'quota-exceeded'
  | 'no-vault' // 백업이 없다
  | 'seq-conflict' // 서버 세대와 어긋났다
  | 'vault-purged' // 유예 만료로 파기됐다
  | 'too-large'
  | 'rate-limited'
  | 'upstream' // 서버가 잠깐 죽었다. **세션을 버리면 안 된다**
  | 'error';

/** 성공에 실릴 것이 없으면 `BackupResult<Empty>` */
export type Empty = Record<never, never>;

export type BackupResult<T> =
  | ({ ok: true } & T)
  | {
      ok: false;
      reason: BackupFail;
      detail?: unknown;
      /**
       * `seq-conflict`일 때 서버가 알려주는 마지막 세대.
       *
       * 앱이 커서를 잃으면(재설치·데이터 삭제) 영원히 1번을 올리려 해서 **백업이 영구히
       * 막힌다.** 서버가 진실을 알고 있으므로 그 값으로 맞추고 한 번 더 시도한다.
       */
      serverSeq?: number;
    };

const TIMEOUT_MS = 20_000;

/**
 * 시간 제한이 걸린 `fetch`.
 *
 * ⚠ **`AbortSignal.timeout()`을 쓰지 않는다 — Hermes에 없다.**
 *   *(`TypeError: AbortSignal.timeout is not a function`)*. 이걸로 서버 호출이 **전부**
 *   즉시 던졌고, `catch`가 그걸 `offline`으로 바꿔서 **네트워크가 멀쩡한데 "오프라인"** 이
 *   떴다. Node에는 있어서 서버 e2e는 전부 통과했다 — 기기에서만 드러나는 종류다.
 *
 * ⚠ 타이머는 `finally`로 반드시 끈다. 안 끄면 20초짜리 타이머가 요청마다 쌓인다.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function mapStatus(status: number): BackupFail {
  if (status === 401) return 'unauthorized';
  if (status === 404) return 'no-vault';
  if (status === 409) return 'seq-conflict';
  if (status === 410) return 'vault-purged';
  if (status === 413) return 'too-large';
  if (status === 429) return 'rate-limited';
  if (status === 503) return 'upstream';
  return 'error';
}

/**
 * 점검용 토큰 — **로컬 스텁 서버(`AUTH_STUB=1`)에서만 의미가 있다.**
 *
 * 기기 점검은 구글 로그인 없이 돌아야 한다(에뮬레이터에 로그인 세션이 없다).
 * 진짜 서버는 이 문자열을 introspect에서 거부하므로 **릴리스에서 권한이 되지 않는다** —
 * 이 값이 통하는 유일한 서버는 내 컴퓨터의 스텁이다.
 *
 * ⚠ 그래도 세션이 있으면 **세션이 이긴다.** 반대로 두면 점검 플래그가 켜진 기기에서
 *   진짜 사용자의 백업이 스텁 신원으로 올라간다.
 */
const DEVICE_CHECK_TOKEN = process.env.EXPO_PUBLIC_DEVICE_CHECK === '1' ? DEV_SESSION_TOKEN : null;

async function post<T>(path: string, body: unknown): Promise<BackupResult<T>> {
  if (BACKUP_SERVER_URL.length === 0) {
    return { ok: false, reason: 'not-configured' };
  }
  const token = (await readSessionToken()) ?? DEVICE_CHECK_TOKEN;
  if (token === null) {
    return { ok: false, reason: 'unauthorized' };
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${BACKUP_SERVER_URL}/api/v1/backup/${path}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      },
      TIMEOUT_MS,
    );
  } catch (error) {
    // 점검 중에만 원인을 남긴다. 평상시엔 화면이 '오프라인'만 알면 된다.
    if (DEVICE_CHECK_TOKEN !== null) {
      console.log(`[jogak-check] post ${path} threw: ${String(error)}`);
    }
    return { ok: false, reason: 'offline' };
  }

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: res.ok ? 'error' : mapStatus(res.status) };
  }

  if (!res.ok || json.ok !== true) {
    // 서버가 준 사유를 우선한다 — 403이 세 가지(구독·grant·쿼터)라 상태코드만으로는 못 가른다.
    const reason =
      typeof json.reason === 'string' ? (json.reason as BackupFail) : mapStatus(res.status);
    return {
      ok: false,
      reason,
      detail: json.detail,
      serverSeq: typeof json.serverSeq === 'number' ? json.serverSeq : undefined,
    };
  }
  return json as unknown as BackupResult<T>;
}

export interface ReserveSlot {
  part: number;
  path: string;
  signedUrl: string;
  token: string;
}

/**
 * 1단 — 자리 예약. 멱등하므로 재시도해도 된다(URL이 재발급된다).
 *
 * `authKey`는 **금고를 처음 만들 때만** 쓰인다. 서버는 `sha256`으로만 저장하고,
 * 이미 있는 금고의 값은 무시한다 — 안 그러면 코드를 아는 사람이 인가를 갈아치울 수 있다.
 */
export function reserve(
  vaultId: string,
  seq: number,
  genId: string,
  partCount: number,
  authKey: string,
): Promise<BackupResult<{ seq: number; genId: string; uploads: ReserveSlot[] }>> {
  return post('reserve', { vaultId, seq, genId, partCount, authKey });
}

/**
 * 되찾기 — 이 계정을 라이터로 만든다. `no-grant`를 받은 뒤에 부른다.
 *
 * ⚠ 구독을 요구하지 않는다(읽기 등급). 쓰기로 분류하면 구독이 끊긴 분실자가
 *   되찾기부터 막혀서 "복원은 구독과 무관하다"가 한 층 아래에서 무효가 된다.
 */
export function rebind(vaultId: string, authKey: string): Promise<BackupResult<Empty>> {
  return post('rebind', { vaultId, authKey });
}

/**
 * 2단 — Storage에 **직접** 올린다.
 *
 * ⚠ 여기가 React Native에서 검증되지 않은 유일한 지점이다. RN의 fetch는 요청 바디
 *   변환 계층이 따로 있어, 큰 `Uint8Array`를 Node와 다르게 다룰 수 있다.
 *   로컬 스택 왕복(Node)은 5MB까지 통과했지만 **그게 실기기 통과를 뜻하지 않는다.**
 *   실기기에서 실패하면 파트 크기를 줄이거나 `expo-file-system`의 업로드 경로로 바꾼다.
 */
export async function uploadPart(
  signedUrl: string,
  bytes: Uint8Array,
): Promise<BackupResult<Empty>> {
  try {
    const res = await fetchWithTimeout(
      signedUrl,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/octet-stream' },
        // ⚠ ArrayBuffer로 넘긴다 — Uint8Array를 그대로 주면 RN이 base64로 바꿔
        //   1.33배로 부풀고 서버가 받은 바이트가 달라진다.
        body: bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer,
      },
      TIMEOUT_MS * 3,
    );
    if (!res.ok) {
      return { ok: false, reason: res.status === 413 ? 'too-large' : mapStatus(res.status) };
    }
    return { ok: true };
  } catch (error) {
    if (DEVICE_CHECK_TOKEN !== null) {
      console.log(`[jogak-check] uploadPart threw: ${String(error)}`);
    }
    return { ok: false, reason: 'offline' };
  }
}

/** 3단 — 커밋. 서버가 Storage에 실제 크기를 물어 대조한다 */
export function commit(
  vaultId: string,
  seq: number,
  genId: string,
): Promise<BackupResult<{ seq: number; totalBytes: number; alreadyCommitted?: boolean }>> {
  return post('commit', { vaultId, seq, genId });
}

export interface DownloadSlot {
  part: number;
  url: string;
}

/**
 * 복원 — 가장 최근에 완성된 세대.
 *
 * ⚠ **구독이 없어도 부를 수 있다.** 폰을 잃고 갱신이 실패한 사람이 복원조차 못 하면
 *   이 기능의 존재 이유가 사라진다.
 */
export function latest(
  vaultId: string,
  seq?: number,
): Promise<
  BackupResult<{
    seq: number;
    genId: string;
    partCount: number;
    totalBytes: number;
    committedAt: string | null;
    downloads: DownloadSlot[];
  }>
> {
  return post('latest', seq === undefined ? { vaultId } : { vaultId, seq });
}

/**
 * 금고를 지운다. **탈퇴 흐름이 이걸 먼저 부른다.**
 *
 * `common_server`가 수정 금지라 `subject_events` 아웃박스를 만들 수 없다 —
 * 그래서 앱이 탈퇴 직전에 직접 지우고, **실패하면 탈퇴를 진행하지 않는다.**
 * 새 실패 모드가 아니다: `deleteAccount()` 자체가 네트워크 작업이라
 * 오프라인이면 어차피 탈퇴가 안 된다.
 */
export function deleteVault(
  vaultId: string,
  authKey: string,
): Promise<BackupResult<{ alreadyGone?: boolean }>> {
  return post('delete', { vaultId, authKey });
}

/**
 * 사진 blob — 이미지 하나 = blob 하나. **세대와 무관하게 산다.**
 *
 * `plan`이 증분의 전부다: 서버가 이미 가진 것을 빼고 **없는 것만** 올린다.
 * 매번 전량을 올리면 사진 300장짜리 사용자는 백업을 한 번도 끝내지 못한다.
 */
export const blobs = {
  /**
   * 어느 것이 이미 있는가. 참조 시각도 여기서 갱신된다(서버는 매니페스트를 못 읽는다).
   *
   * ⚠ 쓰기 갈래는 **`authKey`를 함께 보낸다.** 사진이 매니페스트보다 먼저 가므로
   *   금고를 여기서 처음 만들 수 있는데, 키 없이 만들면 되찾기·삭제가 막힌 금고가 남는다.
   */
  plan(
    vaultId: string,
    authKey: string,
    blobKeys: string[],
  ): Promise<BackupResult<{ have: string[]; missing: string[] }>> {
    return post('blobs', { action: 'plan', vaultId, authKey, blobKeys });
  },
  reserve(
    vaultId: string,
    authKey: string,
    blobKeys: string[],
  ): Promise<BackupResult<{ uploads: { blobKey: string; signedUrl: string }[] }>> {
    return post('blobs', { action: 'reserve', vaultId, authKey, blobKeys });
  },
  /** 서버가 실제 크기를 물어 대조하고 쿼터를 센다 */
  commit(
    vaultId: string,
    authKey: string,
    blobKeys: string[],
  ): Promise<
    BackupResult<{ committed: string[]; missing: string[]; usedBytes: number; quota: number }>
  > {
    return post('blobs', { action: 'commit', vaultId, authKey, blobKeys });
  },
  /**
   * 복원용. ⚠ **구독을 요구하지 않는다** — 복원 경로이고 읽기는 암호가 지킨다.
   * `absent`는 서버에도 없는 것 — 앱이 `'missing'`으로 남겨 화면에 밝혀야 한다.
   */
  download(
    vaultId: string,
    blobKeys: string[],
  ): Promise<BackupResult<{ downloads: { blobKey: string; url: string }[]; absent: string[] }>> {
    return post('blobs', { action: 'download', vaultId, blobKeys });
  },
};

/** Storage에서 파트를 받는다. 서명 URL이라 인증 헤더가 없다 */
export async function downloadPart(url: string): Promise<BackupResult<{ bytes: Uint8Array }>> {
  try {
    const res = await fetchWithTimeout(url, {}, TIMEOUT_MS * 3);
    if (!res.ok) {
      return { ok: false, reason: mapStatus(res.status) };
    }
    return { ok: true, bytes: new Uint8Array(await res.arrayBuffer()) };
  } catch {
    return { ok: false, reason: 'offline' };
  }
}
