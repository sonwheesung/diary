import { getLocales } from 'expo-localization';

import { getSetting, setSetting, SETTING_KEYS } from '@/features/settings/api/settings-store';

import {
  type AgeBlockRecord,
  type AgePassRecord,
  type BootGateDecision,
  decideBootGate,
  makeBlockRecord,
  makeRecord,
  parseBlockRecord,
  parseRecord,
  recordValid,
  serializeBlockRecord,
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

/**
 * 통과를 기록한다. **판정에 성공했을 때만** 부른다.
 *
 * 🔴 생년을 인자로 받지 않는다 — `makeRecord`가 애초에 자리를 안 만든다.
 */
export async function saveAgePass(threshold: number): Promise<void> {
  await setSetting(SETTING_KEYS.agePass, serializeRecord(makeRecord(threshold, Date.now())));
}

/** 저장된 미달 기록. 모양이 깨졌으면 `null`(= 유예 없음). 유효기간 판정은 `blockActive`가 한다. */
export async function loadAgeBlock(): Promise<AgeBlockRecord | null> {
  return parseBlockRecord(await getSetting(SETTING_KEYS.ageBlock));
}

/**
 * 미달을 기록한다. **연도를 입력해 기준 미달로 판정됐을 때만** 부른다.
 *
 * 🚫 사용자가 답하지 않고 닫았을 때는 부르지 않는다 — 그건 "모른다"이지 "미달"이 아니고,
 *    굳히면 자격자를 1년간 막는다(`docs/AUTH_SYSTEM.md` §1.2).
 */
export async function saveAgeBlock(threshold: number): Promise<void> {
  await setSetting(
    SETTING_KEYS.ageBlock,
    serializeBlockRecord(makeBlockRecord(threshold, Date.now())),
  );
}

/**
 * 부팅 게이트 판정 — 화면을 띄울지, 기기 세션을 발급할지의 유일한 질문.
 *
 * 판정식은 순수 계층(`decideBootGate`)이 갖는다. 여기는 저장소에서 꺼내 넘기기만 한다 —
 * 가드(`npm run check:age-gate`)가 경계값을 전수로 재려면 판정이 RN 밖에 있어야 한다.
 */
export async function bootGateDecision(): Promise<BootGateDecision> {
  const threshold = deviceThreshold();
  const [pass, block] = await Promise.all([loadAgePass(), loadAgeBlock()]);
  return decideBootGate(pass, block, threshold, Date.now());
}
