/**
 * 연령 게이트 — 순수 판정 (docs/AUTH_SYSTEM.md §1)
 *
 * ⚠ 이 파일은 RN·expo·저장소·네트워크를 import 하지 않는다.
 *   기기 계층은 `api/age-store.ts`, 화면은 `components/AgeGateScreen.tsx`가 갖는다.
 *   순수하게 두는 이유는 `features/ai/`와 같다 — 가드(`npm run check:age-gate`)가 이 파일만
 *   그대로 컴파일해 **지역 × 출생연도 경계값을 전수로** 잰다. 화면을 띄워야만 확인되는 규칙은
 *   결국 확인되지 않는다.
 *
 * 근거(1차 출처는 common/GLOBAL_DATA_COMPLIANCE.md §2·§3):
 *   - GDPR §8      EEA 는 회원국이 13~16 에서 정한다 → 16 이면 어느 회원국에서도 안전
 *   - 개인정보보호법 §22조의2   만 14세 미만은 법정대리인 동의
 *   - COPPA        13세. 질문 자체는 의무가 아니지만 **중립적으로** 물으면 세이프하버가 생긴다
 */

/**
 * 규칙 버전. **기준 연령이나 판정식을 바꾸면 반드시 올린다** — 올리면 전원이 다시 확인한다.
 * 기록이 기기에 영구히 남는 만큼 이 숫자가 유일한 갱신 수단이다.
 *
 * 1 = 2026-08-27 최초(지역별 16/14/13 + 판정 불가 16 + 보수 판정식).
 */
export const AGE_GATE_VERSION = 1;

/** EEA(27) + 아이슬란드·리히텐슈타인·노르웨이 + 영국 + 스위스. GDPR·UK GDPR 적용권. */
const EEA_PLUS = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', 'GB', 'CH',
]);

/**
 * 지역을 못 읽었을 때 적용할 기준 — **가장 보수적인 값**.
 *
 * 🔴 공용 문서의 일반 기본값(13)에서 **의도적으로 이탈한다.** 로케일 읽기는 실패할 수 있는데
 * 실패가 **가장 느슨한 기준**으로 떨어지면 게이트가 무의미해진다. 실패는 안전한 쪽으로 넘어져야 한다.
 * 대가는 13~15세 일부가 막히는 것뿐이다.
 */
export const FALLBACK_THRESHOLD = 16;

/**
 * 지역 코드(ISO 3166-1 alpha-2) → 기준 연령.
 *
 * ⚠ 조각은 EEA 배포를 뺐지만(CLAUDE.md §9.1) **EEA 기준을 넣는다.** 로케일은 배포 국가와
 * 무관하게 EEA 로 읽히고(해외 거주자·기기 설정), 게이트가 배포 설정에 의존하면 국가를 넓히는 날
 * 조용히 뚫린다.
 */
export function thresholdFor(region: string | null | undefined): number {
  const r = (region ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(r)) return FALLBACK_THRESHOLD; // 판정 불가 → 최보수
  if (EEA_PLUS.has(r)) return 16;
  if (r === 'KR') return 14;
  if (r === 'US') return 13;
  return 13; // 그 외 — 보수적 기본값
}

/** 중립 입력 UI 가 그릴 출생연도 목록의 범위. 상한 = 올해, 하한 = 올해 − 120. */
export function birthYearRange(thisYear: number): { min: number; max: number } {
  return { min: thisYear - 120, max: thisYear };
}

/**
 * 통과 판정 — **보수적으로** 센다.
 *
 * 출생 **연도만** 받으므로 실나이는 최대 12개월 흔들린다(2026년의 2012년생 = 13 또는 14).
 *   관대식 `올해 − 출생연도 >= 기준`      → 기준 미달자를 들여보낸다 = **위법**
 *   보수식 `올해 − 출생연도 >= 기준 + 1`  → 자격자가 최대 11개월 늦게 들어온다 = 불편
 * 후자를 택한다. 월·일을 더 묻는 것은 *수집 항목을 늘리는 쪽*이라 해법이 아니다.
 *
 * 범위 밖·비정수는 **불통과**다 — 오작동으로 통과시키지 않는다.
 */
export function passes(birthYear: number, thisYear: number, threshold: number): boolean {
  if (!Number.isInteger(birthYear) || !Number.isInteger(thisYear)) return false;
  const { min, max } = birthYearRange(thisYear);
  if (birthYear < min || birthYear > max) return false;
  return thisYear - birthYear >= threshold + 1;
}

/** 저장되는 통과 기록 — **생년은 없다.** 받아서 판정하고 버린다. */
export interface AgePassRecord {
  /** 언제 통과했는지 (epoch ms) */
  passedAt: number;
  /** 어느 기준으로 통과했는지 — 사후 감사용 */
  threshold: number;
  /** 어느 규칙 버전으로 통과했는지 */
  version: number;
}

/** 저장된 기록이 지금도 유효한가. 규칙 버전이 오르면 무효(= 재확인), 모양이 깨진 값도 무효. */
export function recordValid(rec: AgePassRecord | null | undefined): boolean {
  if (!rec || typeof rec !== 'object') return false;
  if (!Number.isFinite(rec.passedAt) || !Number.isFinite(rec.threshold)) return false;
  return rec.version === AGE_GATE_VERSION;
}

/**
 * 통과 기록 생성(판정에 성공했을 때만 부른다).
 *
 * 🔴 **생년을 인자로도 받지 않는다.** "실수로 같이 저장"하는 경로를 타입 수준에서 없애는 편이
 * 주석으로 금지하는 것보다 강하다.
 */
export function makeRecord(threshold: number, now: number): AgePassRecord {
  return { passedAt: now, threshold, version: AGE_GATE_VERSION };
}

/** 기록을 `app_settings` 에 넣을 때 쓰는 직렬화. 깨진 값은 읽는 쪽에서 무효 처리된다. */
export function serializeRecord(rec: AgePassRecord): string {
  return JSON.stringify(rec);
}

/** 저장된 문자열 → 기록. 파싱 실패·모양 불일치는 `null`(= 다시 묻는다). */
export function parseRecord(raw: string | null | undefined): AgePassRecord | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return null;
    const o = v as Record<string, unknown>;
    if (typeof o.passedAt !== 'number') return null;
    if (typeof o.threshold !== 'number') return null;
    if (typeof o.version !== 'number') return null;
    return { passedAt: o.passedAt, threshold: o.threshold, version: o.version };
  } catch {
    return null;
  }
}
