import { getLocales } from 'expo-localization';
// `use`를 그대로 쓰면 ESLint가 React 훅으로 오해한다 — 이름을 바꿔 받는다.
import i18next, { changeLanguage, t, use as registerPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from '@/locales/de.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import id from '@/locales/id.json';
import it from '@/locales/it.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import ptBR from '@/locales/pt-BR.json';
import ru from '@/locales/ru.json';
import th from '@/locales/th.json';
import tr from '@/locales/tr.json';
import vi from '@/locales/vi.json';
import zhHans from '@/locales/zh-Hans.json';
import zhHant from '@/locales/zh-Hant.json';

/**
 * 다국어 (2026-08-09).
 *
 * **문자열을 화면에 직접 쓰지 않는다.** 전부 `locales/*.json`에 두고 `t()`로 꺼낸다 —
 * 언어를 하나 더 얹는 일이 "JSON 파일 하나 추가 + 아래 두 곳 등록"이 되어야 한다.
 *
 * 기본값은 **기기 언어**다. 지원하지 않는 언어면 영어로 떨어진다(`fallbackLng`) —
 * 한국어를 기본 폴백으로 두면 전 세계 사용자 대부분이 못 읽는 화면을 본다.
 *
 * ⚠ 아랍어·히브리어(RTL)는 없다. JSON만으로 되지 않고 `I18nManager`와 레이아웃 반전이
 * 함께 필요하다 — 반쯤 지원하면 글자만 아랍어인 뒤집히지 않은 화면이 되어 더 나쁘다.
 */

export const LANGUAGES = {
  ko,
  en,
  ja,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  es,
  'pt-BR': ptBR,
  fr,
  de,
  it,
  ru,
  id,
  vi,
  th,
  tr,
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
/** 사용자가 고르는 값. `system`은 기기 설정을 따른다 */
export type LanguageMode = 'system' | LanguageCode;

/**
 * 언어 이름은 **그 언어로** 적는다. 영어로만 적으면 그 언어 사용자가 자기 언어를 못 찾는다 —
 * 영어를 못 읽는 사람이 목록에서 'Korean'을 찾을 수는 없다.
 */
export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  tr: 'Türkçe',
};

/**
 * 목록에 보일 순서. 사용 인구가 아니라 **찾기 쉬움**으로 정렬한다 —
 * 자기 언어를 찾는 사람은 라틴 알파벳 순서를 기대하지 않으므로, 문자 체계별로 묶는다.
 */
export const LANGUAGE_ORDER: LanguageCode[] = [
  'ko',
  'en',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'es',
  'pt-BR',
  'fr',
  'de',
  'it',
  'ru',
  'id',
  'vi',
  'th',
  'tr',
];

/**
 * 스크립트·지역을 안 가진 코드가 왔을 때 어디로 보낼지.
 *
 * 우리는 `zh-Hans`·`pt-BR`만 갖고 있는데 기기는 그냥 `zh`·`pt`로 올 수 있다.
 * 매핑이 없으면 중국어 기기가 영어로 떨어진다 — 있는 번역을 두고 폴백하는 건 사고다.
 */
const BASE_LANGUAGE_FALLBACK: Record<string, LanguageCode> = {
  zh: 'zh-Hans',
  pt: 'pt-BR',
};

function isLanguageCode(value: string): value is LanguageCode {
  return value in LANGUAGES;
}

/** `LANGUAGES`에서 파생시킨다 — 여기만 하드코딩으로 남으면 언어를 늘렸을 때 저장된 선택이 조용히 무시된다. */
export function isLanguageMode(value: string | null): value is LanguageMode {
  return value !== null && (value === 'system' || value in LANGUAGES);
}

/**
 * 기기 언어 중 우리가 가진 첫 번째. 없으면 영어.
 *
 * 좁은 것부터 넓은 순으로 본다 — `zh-Hant-TW` → `zh-Hant` → `zh`.
 * `languageCode`만 보면 번체 사용자가 간체를 받는다. 읽히긴 하지만 대만·홍콩 사용자에게는
 * 명백히 틀린 화면이다.
 */
export function deviceLanguage(): LanguageCode {
  for (const locale of getLocales()) {
    const base = locale.languageCode;
    const candidates = [
      locale.languageTag,
      base !== null && locale.languageScriptCode !== null
        ? `${base}-${locale.languageScriptCode}`
        : null,
      base !== null && locale.regionCode !== null ? `${base}-${locale.regionCode}` : null,
      base,
    ];

    for (const candidate of candidates) {
      if (candidate !== null && isLanguageCode(candidate)) {
        return candidate;
      }
    }
    // 스크립트·지역이 안 붙어 온 경우(`zh`, `pt`)의 기본 갈래
    if (base !== null && base in BASE_LANGUAGE_FALLBACK) {
      return BASE_LANGUAGE_FALLBACK[base] as LanguageCode;
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
  const resources = Object.fromEntries(
    Object.entries(LANGUAGES).map(([code, translation]) => [code, { translation }]),
  );

  void registerPlugin(initReactI18next).init({
    resources,
    lng: deviceLanguage(),
    fallbackLng: 'en',
    // `zh-Hans`처럼 하이픈이 든 코드를 i18next가 `zh`로 잘라 찾지 않게 한다.
    // 끄지 않으면 zh-Hans 리소스를 두고도 없는 `zh`를 찾다가 영어로 떨어진다.
    load: 'currentOnly',
    nonExplicitSupportedLngs: false,
    supportedLngs: Object.keys(LANGUAGES),
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
