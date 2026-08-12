import { PRIVACY } from '@/features/legal/legal-text';
import type { LegalDoc } from '@/features/legal/legal-text';
import { PRIVACY_EN } from '@/features/legal/translations/en';
import { PRIVACY_JA } from '@/features/legal/translations/ja';
import { i18next } from '@/lib/i18n';

/**
 * 처리방침의 언어를 고른다.
 *
 * ~~"번역하지 않는다"(2026-08-09)~~ → **번역한다**(2026-08-12 사용자 결정).
 *
 * 원래 결정의 근거는 *"번역본이 원문과 어긋나면 어느 쪽이 효력인지 다툼이 생긴다"* 였다.
 * 그 걱정은 옳지만 **답이 틀렸다** — 다툼은 `한국어본이 우선한다`는 한 줄로 막을 수 있고,
 * 그걸 안 쓴 대가는 **독일어 사용자가 자기 정보가 어떻게 처리되는지 못 읽는 것**이다.
 * 읽을 수 없는 고지는 고지가 아니다.
 *
 * ## 지키는 것
 *
 * 1. **한국어가 정본이다.** 번역본에는 우선순위 문구를 반드시 띄운다(`privacyTranslated`).
 * 2. **구조가 어긋나면 검사가 잡는다.** `npm run check:legal`이 절 수와 각 절의 줄 수를
 *    한국어와 대조한다 — 조항 하나가 조용히 빠지는 것이 이 문서에서 가장 위험한 사고다.
 * 3. **번역이 없으면 한국어를 보여준다.** 반쪽짜리 번역을 만들지 않는다.
 *
 * ⚠ **일부 조항은 번역해도 한국 전용이다.** §12의 분쟁조정기관은 한국 기관이고 전화번호도
 *   국내번호다. 지우지 않고 그대로 옮긴다 — 한국 이용자에게는 실제 구제 경로이고,
 *   국외 이용자에게는 "이 사업자는 한국법을 따른다"는 사실 자체가 정보다.
 */

/** 번역이 있는 언어. 없으면 한국어 원문을 보여준다 */
const TRANSLATIONS: Record<string, LegalDoc> = {
  en: PRIVACY_EN,
  ja: PRIVACY_JA,
};

export interface ResolvedLegal {
  doc: LegalDoc;
  /** 번역본인가. `true`면 화면이 "한국어본이 우선" 문구를 띄운다 */
  translated: boolean;
}

export function resolvePrivacy(lang: string = i18next.language): ResolvedLegal {
  if (lang.startsWith('ko')) {
    return { doc: PRIVACY, translated: false };
  }
  const hit = TRANSLATIONS[lang] ?? TRANSLATIONS[lang.split('-')[0] ?? ''];
  /*
   * ⚠ 번역이 없으면 **한국어**다. 영어로 떨어뜨리지 않는다 —
   *   영어도 못 읽는 사람에게는 같은 상황이고, 정본이 무엇인지가 흐려진다.
   */
  return hit === undefined ? { doc: PRIVACY, translated: false } : { doc: hit, translated: true };
}

/** 번역이 준비된 언어 코드. `check:legal`이 이 목록을 돈다 */
export const TRANSLATED_LANGS = Object.keys(TRANSLATIONS);
