import type { LegalDoc } from './legal-text.ts';
import { PRIVACY_DE } from './translations/de.ts';
import { PRIVACY_EN } from './translations/en.ts';
import { PRIVACY_ES } from './translations/es.ts';
import { PRIVACY_FR } from './translations/fr.ts';
import { PRIVACY_ID } from './translations/id.ts';
import { PRIVACY_IT } from './translations/it.ts';
import { PRIVACY_JA } from './translations/ja.ts';
import { PRIVACY_PT_BR } from './translations/pt-BR.ts';
import { PRIVACY_RU } from './translations/ru.ts';
import { PRIVACY_TH } from './translations/th.ts';
import { PRIVACY_TR } from './translations/tr.ts';
import { PRIVACY_VI } from './translations/vi.ts';
import { PRIVACY_ZH_HANS } from './translations/zh-Hans.ts';
import { PRIVACY_ZH_HANT } from './translations/zh-Hant.ts';

/**
 * 번역본 목록 — **한 곳에서만 정의한다.**
 *
 * 🔴 전에는 이 목록이 `resolve.ts`(앱)와 `check-legal.mjs`(검사) **두 곳에** 있었다.
 *   그 상태로는 한쪽에만 언어를 추가해도 아무도 모른다 — 검사에만 넣으면 앱이 그 언어에서
 *   한국어를 보여주고, 앱에만 넣으면 그 번역은 아무 검사도 받지 않는다.
 *   **번역 누락을 잡으려고 만든 검사가 자기 목록을 놓치는** 모양이라 합쳤다.
 *
 * ⚠ 임포트에 `.ts` 확장자를 쓴다. Node의 타입 스트리핑(`--experimental-strip-types`)이
 *   ESM 규칙상 확장자를 요구하고, 그래야 `check-legal.mjs`가 이 파일을 그대로 읽는다.
 *   앱 쪽은 `moduleResolution: bundler`라 확장자가 있어도 그대로 해석한다.
 */
export const TRANSLATIONS: Record<string, LegalDoc> = {
  en: PRIVACY_EN,
  ja: PRIVACY_JA,
  'zh-Hans': PRIVACY_ZH_HANS,
  'zh-Hant': PRIVACY_ZH_HANT,
  es: PRIVACY_ES,
  'pt-BR': PRIVACY_PT_BR,
  fr: PRIVACY_FR,
  de: PRIVACY_DE,
  it: PRIVACY_IT,
  ru: PRIVACY_RU,
  id: PRIVACY_ID,
  vi: PRIVACY_VI,
  th: PRIVACY_TH,
  tr: PRIVACY_TR,
};

/** 한국어를 뺀 지원 언어 수. 하나라도 비면 그 언어 사용자는 처리방침을 못 읽는다 */
export const EXPECTED_TRANSLATIONS = 14;
