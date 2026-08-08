import { getLocales } from 'expo-localization';
// `use`를 그대로 쓰면 ESLint가 React 훅으로 오해한다 — 이름을 바꿔 받는다.
import i18next, { changeLanguage, t, use as registerPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

/**
 * 다국어 (2026-08-09).
 *
 * **문자열을 화면에 직접 쓰지 않는다.** 전부 `locales/*.json`에 두고 `t()`로 꺼낸다 —
 * 언어를 하나 더 얹는 일이 "JSON 파일 하나 추가"가 되어야 한다.
 *
 * 기본값은 **기기 언어**다. 지원하지 않는 언어면 영어로 떨어진다(`fallbackLng`) —
 * 한국어를 기본 폴백으로 두면 전 세계 사용자 대부분이 못 읽는 화면을 본다.
 */

export const LANGUAGES = { ko, en } as const;

export type LanguageCode = keyof typeof LANGUAGES;
/** 사용자가 고르는 값. `system`은 기기 설정을 따른다 */
export type LanguageMode = 'system' | LanguageCode;

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  // 언어 이름은 **그 언어로** 적는다. 영어로만 적으면 그 언어 사용자가 자기 언어를 못 찾는다.
  ko: '한국어',
  en: 'English',
};

/** `LANGUAGES`에서 파생시킨다 — 여기만 하드코딩으로 남으면 언어를 늘렸을 때 저장된 선택이 조용히 무시된다. */
export function isLanguageMode(value: string | null): value is LanguageMode {
  return value !== null && (value === 'system' || value in LANGUAGES);
}

/** 기기 언어 중 우리가 가진 첫 번째. 없으면 영어 */
export function deviceLanguage(): LanguageCode {
  for (const locale of getLocales()) {
    const code = locale.languageCode;
    if (code !== null && code in LANGUAGES) {
      return code as LanguageCode;
    }
  }
  return 'en';
}

export function resolveLanguage(mode: LanguageMode): LanguageCode {
  return mode === 'system' ? deviceLanguage() : mode;
}

/**
 * 앱 시작 시 1회. 저장된 선택을 읽기 전이라 일단 기기 언어로 켠다 —
 * 그래야 설정을 읽는 동안에도 빈 화면이나 키 문자열이 보이지 않는다.
 */
export function initI18n(): void {
  if (i18next.isInitialized) {
    return;
  }
  void registerPlugin(initReactI18next).init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: deviceLanguage(),
    fallbackLng: 'en',
    // 배열(요일 목록)을 통째로 꺼내 쓴다
    returnObjects: true,
    interpolation: {
      // RN에는 XSS가 없다. 이스케이프를 켜두면 한글·따옴표가 엔티티로 깨진다.
      escapeValue: false,
    },
  });
}

export function setLanguage(mode: LanguageMode): void {
  void changeLanguage(resolveLanguage(mode));
}

/** 컴포넌트 밖(저장소·유틸)에서 문자열이 필요할 때 */
export function translate(key: string, options?: Record<string, unknown>): string {
  return t(key, options ?? {}) as string;
}

export { i18next };
