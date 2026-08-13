/**
 * 매니페스트 ↔ 봉투 묶음. 암호 계층과 스키마 계층을 잇는다.
 *
 * ⚠ **프로젝트 내부 임포트 0** — 난수를 **주입**받아 순수하게 유지한다(`seal`이 nonce를
 *   주입받는 것과 같은 규칙). 그래서 전체 경로(매니페스트 → 봉인 → 개봉 → 매니페스트)를
 *   Node에서 그대로 검증할 수 있다. 기기 난수를 붙이는 얇은 층은 `api/package.ts`다.
 */
import {
  ENVELOPE_TYPE,
  SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
  assertCompleteGeneration,
  encodeHeader,
  packEnvelope,
  parseEnvelope,
} from './envelope.ts';
import type { ManifestContext } from './envelope.ts';
import type { Manifest } from './manifest.ts';
import { joinManifest, splitManifest } from './manifest.ts';
import { open, seal } from './seal.ts';

/**
 * 파트 하나의 목표 크기.
 *
 * 파트가 작아야 저사양 기기에서 **평문+암호문+파싱 결과가 동시에 힙에 올라가는 정점**이
 * 낮아진다 — 나누는 진짜 이유가 그것이다(Vercel 본문 한도는 서명 URL로 우회한다).
 *
 * ⚠ 실기기 측정 전까지는 추정치다.
 */
export const TARGET_PART_BYTES = 512 * 1024;

/**
 * 봉인하면 파트가 몇 개 나오는가. **nonce를 미리 만들어야 해서** 필요하다 —
 * 안 그러면 세는 것과 봉인하는 것을 두 번 돌려 CPU를 두 배 쓴다.
 */
export function countParts(manifest: Manifest, targetPartBytes = TARGET_PART_BYTES): number {
  return splitManifest(manifest, targetPartBytes).length;
}

/** 봉인에 필요한 키 재료. `api/key-store`의 `BackupKeys`가 이 모양을 만족한다 */
export interface SealingKeys {
  readonly dek: Uint8Array;
  readonly kid: Uint8Array;
}

export interface SealOptions {
  readonly seq: number;
  /** 이 세대를 묶는 8바이트. 세대당 하나 */
  readonly genId: Uint8Array;
  /** 봉투 버전. 사용자 릴리스는 `VERSION_MIN_RELEASE` 이상이어야 한다 */
  readonly version: number;
  /** 파트마다 새 nonce를 돌려준다. **재사용하면 Poly1305 키가 드러난다** */
  readonly nonceFor: (part: number) => Uint8Array;
  readonly targetPartBytes?: number;
}

/**
 * 매니페스트를 봉투 묶음으로.
 *
 * 세대 하나 = 파트 N개. **`genId`가 세대를 묶는다** — 같은 `seq`로 재시도하는 동안
 * 서버에 옛 파트와 새 파트가 함께 남을 수 있고, `seq`와 `partCount`만으로는 구별할 수 없다.
 */
export function sealManifest(
  manifest: Manifest,
  keys: SealingKeys,
  options: SealOptions,
): Uint8Array[] {
  const payloads = splitManifest(manifest, options.targetPartBytes ?? TARGET_PART_BYTES);
  const envelopes: Uint8Array[] = [];

  for (let part = 0; part < payloads.length; part += 1) {
    const nonce = options.nonceFor(part);
    const header = encodeHeader({
      version: options.version,
      suite: SUITE_XCHACHA20_POLY1305_HKDF_SHA256,
      flags: 0,
      kid: keys.kid,
      context: {
        type: ENVELOPE_TYPE.manifest,
        seq: options.seq,
        genId: options.genId,
        part,
        partCount: payloads.length,
      },
      nonce,
    });
    envelopes.push(
      packEnvelope(header, seal({ plaintext: payloads[part], key: keys.dek, nonce, aad: header })),
    );
  }
  return envelopes;
}

export interface OpenedManifest {
  readonly manifest: Manifest;
  readonly seq: number;
}

/**
 * 봉투 묶음을 매니페스트로.
 *
 * **순서를 신경 쓰지 않아도 된다** — `part` 번호로 정렬한다. 다만 하나라도 빠지거나
 * 중복이거나 다른 세대의 것이 섞이면 **전체를 거부한다.** 반쪽 매니페스트로 복원하면
 * 그만큼이 조용히 사라지고, 스크래치 DB 구조라 중단 비용은 0이다.
 */
export function openManifest(envelopes: readonly Uint8Array[], keys: SealingKeys): OpenedManifest {
  const parsed = envelopes.map((bytes) => parseEnvelope(bytes));

  const contexts: ManifestContext[] = [];
  for (const item of parsed) {
    if (item.header.context.type !== ENVELOPE_TYPE.manifest) {
      throw new Error('JGKB-E13: 매니페스트가 아닌 봉투가 섞였다');
    }
    contexts.push(item.header.context);
  }
  assertCompleteGeneration(contexts);

  const ordered = parsed
    .map((item, index) => ({ item, part: contexts[index].part }))
    .sort((a, b) => a.part - b.part);

  const payloads = ordered.map(({ item }) =>
    open({ sealed: item.sealed, key: keys.dek, nonce: item.header.nonce, aad: item.aad }),
  );

  return { manifest: joinManifest(payloads), seq: contexts[0].seq };
}
