import { VERSION_EXPERIMENTAL, VERSION_MIN_RELEASE } from '@/features/backup/envelope';
import type { Manifest } from '@/features/backup/manifest';
import { countParts, openManifest, sealManifest as sealPure } from '@/features/backup/package';
import type { OpenedManifest, SealingKeys } from '@/features/backup/package';
import { newGenId, newNonce } from '@/features/backup/api/key-store';

/**
 * 순수 봉인 계층에 **기기 난수를 붙이는 얇은 층**.
 *
 * 난수만 여기서 만들고 나머지 판단은 전부 `features/backup/package.ts`에 있다 —
 * 그래야 전체 경로가 Node에서 검증된다.
 */

export { openManifest };
export type { OpenedManifest };

/**
 * 릴리스 빌드가 쓸 봉투 버전.
 *
 * ⚠ **`0x00~0x0F`는 실험 구간이라 사용자 빌드에 나가면 안 된다.** 내부 테스트도
 *   사용자 릴리스다 — 테스터는 자기 진짜 일기를 쓴다. 실험 버전으로 백업한 사람의
 *   데이터는 동결 시점에 못 읽는 데이터가 되고, 폰을 잃은 뒤라면 영구 손실이다.
 *   **백업 UI를 사용자에게 여는 릴리스에서 이 값을 `VERSION_MIN_RELEASE`로 바꾼다.**
 */
export const ENVELOPE_VERSION: number = VERSION_EXPERIMENTAL;

/** 백업 UI를 노출해도 되는 빌드인가. 릴리스 체크리스트가 이걸 본다 */
export function isReleaseEnvelopeVersion(): boolean {
  return ENVELOPE_VERSION >= VERSION_MIN_RELEASE;
}

/** 매니페스트를 봉투 묶음으로. 파트마다 새 nonce를 만든다 */
export async function sealManifest(
  manifest: Manifest,
  keys: SealingKeys,
  seq: number,
): Promise<Uint8Array[]> {
  const genId = await newGenId();

  // nonce는 동기로 넘겨야 해서 미리 만든다. 세는 것과 봉인하는 것을 두 번 돌리지 않으려고
  // `countParts`를 따로 둔다 — 같은 목표 크기를 쓰므로 개수가 어긋나지 않는다.
  const nonces: Uint8Array[] = [];
  for (let part = 0; part < countParts(manifest); part += 1) {
    nonces.push(await newNonce());
  }

  return sealPure(manifest, keys, {
    seq,
    genId,
    version: ENVELOPE_VERSION,
    nonceFor: (part) => {
      const nonce = nonces[part];
      if (nonce === undefined) {
        throw new Error('JGKB-E14: nonce가 모자란다 — countParts와 splitManifest가 어긋났다');
      }
      return nonce;
    },
  });
}
