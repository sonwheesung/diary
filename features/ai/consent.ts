import {
  bothGiven,
  parseConsent,
  serializeConsent,
  type AiConsent,
} from '@/features/ai/consent-rules';
import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';

/**
 * AI 리포트 동의 — 저장소 계층.
 *
 * 🔴 **두 개다. 하나로 묶지 않는다.** 근거가 다른 별개의 동의라서다:
 *   · 민감정보 처리   「개인정보 보호법」 §23  — 일기에 건강·심리 상태가 담긴다
 *   · 국외 이전       「개인정보 보호법」 §28-8 — AI 사업자가 국외에 있다
 *
 * 묶어서 받으면 **둘 다 무효**가 될 수 있다. 법이 "별도 동의"라고 할 때의 별도는
 * 다른 것과 구분해서라는 뜻이고, 여기서는 서로에 대해서도 그렇다
 * (`features/legal/legal-text.ts` AI 예고 나·다목).
 *
 * ⚠ **거부할 수 있어야 한다.** 거부하면 AI 리포트만 못 쓰고 나머지는 그대로다 —
 *   그게 성립해야 동의가 자유로운 것이 된다. 그래서 게이트를 [만들기] 하나에만 건다.
 *
 * 판정 규칙 자체는 `consent-rules.ts`(순수 계층)가 갖는다 — 검사가 돌 수 있어야 한다.
 */

export type { AiConsent };
export { bothGiven };

export async function readConsent(): Promise<AiConsent> {
  const [sensitive, transfer] = await Promise.all([
    getSetting(SETTING_KEYS.aiConsentSensitive).catch(() => null),
    getSetting(SETTING_KEYS.aiConsentTransfer).catch(() => null),
  ]);
  return { sensitiveAt: parseConsent(sensitive), transferAt: parseConsent(transfer) };
}

export async function hasAiConsent(): Promise<boolean> {
  return bothGiven(await readConsent());
}

/**
 * 동의를 기록한다.
 *
 * ⚠ **각각 따로 저장한다.** 한 키에 담으면 "둘 다 동의" 외의 상태를 표현할 수 없고,
 *   사용자가 하나만 철회하는 것도 불가능해진다.
 */
export async function saveConsent(which: 'sensitive' | 'transfer', given: boolean): Promise<void> {
  const key =
    which === 'sensitive' ? SETTING_KEYS.aiConsentSensitive : SETTING_KEYS.aiConsentTransfer;
  // 빈 문자열이 이 저장소의 삭제 관용구다 — 철회는 값을 지우는 것이다
  await setSetting(key, given ? serializeConsent(Date.now()) : '');
}
