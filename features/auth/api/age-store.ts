import { getLocales } from 'expo-localization';

import { getSetting, setSetting, SETTING_KEYS } from '@/features/settings/api/settings-store';

import {
  type AgePassRecord,
  makeRecord,
  parseRecord,
  recordValid,
  serializeRecord,
  thresholdFor,
} from '../age-gate';

/**
 * 연령 게이트 — 기기 계층 (docs/AUTH_SYSTEM.md §1)
 *
 * 순수 판정은 `../age-gate.ts`가 갖는다. 여기는 **지역을 읽고 기록을 넣고 뺀다**.
 */

/**
 * 기기 지역(ISO 3166-1 alpha-2). 못 읽으면 `null` — 판정이 최보수(16)로 떨어진다.
 *
 * ⚠ IP 지오로케이션을 쓰지 않는다. 정확도와 프라이버시 양쪽에서 나쁘다.
 */
export function deviceRegion(): string | null {
  try {
    return getLocales()[0]?.regionCode ?? null;
  } catch {
    // 로케일 읽기가 던져도 앱이 죽으면 안 된다. null 이면 최보수로 판정된다.
    return null;
  }
}

/** 이 기기에 적용할 기준 연령. */
export function deviceThreshold(): number {
  return thresholdFor(deviceRegion());
}

/** 저장된 통과 기록. 없거나 규칙 버전이 올랐으면 `null`(= 다시 물어야 한다). */
export async function loadAgePass(): Promise<AgePassRecord | null> {
  const rec = parseRecord(await getSetting(SETTING_KEYS.agePass));
  return recordValid(rec) ? rec : null;
}

/** 이미 통과했는가. 화면을 띄울지 판단하는 유일한 질문이다. */
export async function ageAlreadyVerified(): Promise<boolean> {
  return (await loadAgePass()) !== null;
}

/**
 * 통과를 기록한다. **판정에 성공했을 때만** 부른다.
 *
 * 🔴 생년을 인자로 받지 않는다 — `makeRecord`가 애초에 자리를 안 만든다.
 */
export async function saveAgePass(threshold: number): Promise<void> {
  await setSetting(SETTING_KEYS.agePass, serializeRecord(makeRecord(threshold, Date.now())));
}
