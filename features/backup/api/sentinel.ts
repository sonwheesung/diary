import { File, Paths } from 'expo-file-system';

/**
 * 복원 진행 표시 — **DB 밖의 파일**이다.
 *
 * ⚠ **DB 안에 두면 안 된다.** 복원은 테이블을 통째로 갈아끼우므로, 진행 마커를
 *   `app_settings`에 두면 **되돌리기가 마커를 함께 지운다.** 교체 대상 안에
 *   "교체 중"을 기록할 수 없다.
 *
 * ⚠ **`File.write()`는 동기지만 내구성은 아니다**(fsync가 아니다). 전원이 갑자기
 *   나가면 마커가 날아갈 수 있다. 라이브 DB가 스왑 한 번으로 원자적이라 치명적이진
 *   않지만, "마커가 없으니 정상"이라고 단정하지 않는다.
 */

const SENTINEL = 'restore-pending.json';

/**
 * 복원이 어디까지 갔는가.
 *
 * ⚠ **불리언으로는 부족하다.** 게이트가 "되돌릴지 / 마무리할지"를 판단해야 하는데,
 *   `snapshotted`(스냅샷은 떴지만 스왑 전)와 `swapped`(스왑은 끝났고 커서만 남음)를
 *   구별하지 못하면 **성공한 복원을 되돌리거나** 스퓨리어스 409를 만든다.
 */
export type RestorePhase =
  /** 스크래치를 만드는 중. 라이브는 무손상 — 되돌릴 것이 없다 */
  | 'preparing'
  /** 스냅샷을 떴고 **검증까지 끝났다.** 이제부터 되돌리기가 의미를 갖는다 */
  | 'snapshotted'
  /** 스왑이 끝났다. 커서 세팅만 남았으므로 **되돌리면 안 된다** */
  | 'swapped';

export interface RestoreSentinel {
  phase: RestorePhase;
  /** 복원한 세대. `swapped`에서 게이트가 커서를 마무리할 때 쓴다 */
  seq: number;
  vaultId: string;
  startedAt: number;
}

function sentinelFile(): File {
  return new File(Paths.document, SENTINEL);
}

export function readSentinel(): RestoreSentinel | null {
  try {
    const file = sentinelFile();
    if (!file.exists) {
      return null;
    }
    const parsed = JSON.parse(file.textSync()) as Partial<RestoreSentinel>;
    if (typeof parsed.phase !== 'string' || typeof parsed.seq !== 'number') {
      return null;
    }
    return parsed as RestoreSentinel;
  } catch {
    // 깨진 마커는 없는 것으로 본다 — 있는 것으로 보면 멀쩡한 DB를 되돌린다.
    return null;
  }
}

export function writeSentinel(sentinel: RestoreSentinel): void {
  const file = sentinelFile();
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(JSON.stringify(sentinel));
}

export function clearSentinel(): void {
  try {
    const file = sentinelFile();
    if (file.exists) {
      file.delete();
    }
  } catch {
    // 못 지워도 다음 부팅에서 게이트가 한 번 더 돌 뿐이다. 멱등하다.
  }
}
