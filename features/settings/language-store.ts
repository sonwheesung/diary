import { create } from 'zustand';

import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { isLanguageMode, resolveLanguage, setLanguage } from '@/lib/i18n';
import type { LanguageCode, LanguageMode } from '@/lib/i18n';

interface LanguageState {
  mode: LanguageMode;
  /** 실제로 적용된 언어 */
  code: LanguageCode;
  load: () => Promise<void>;
  setMode: (next: LanguageMode) => void;
}

/**
 * 언어 선택. 테마와 같은 구조다 — 고른 값은 `app_settings`에 남고 `system`이면 기기를 따른다.
 *
 * 스토어를 쓰는 이유: 설정 화면과 앱 시작 코드가 **같은 출처**를 봐야 한다.
 * 잠금 설정에서 각자 읽다가 어긋난 적이 있다(CLAUDE.md §7.1).
 */
export const useLanguageStore = create<LanguageState>((set) => ({
  mode: 'system',
  code: resolveLanguage('system'),
  load: async () => {
    try {
      const stored = await getSetting(SETTING_KEYS.language);
      if (isLanguageMode(stored)) {
        setLanguage(stored);
        set({ mode: stored, code: resolveLanguage(stored) });
      }
    } catch {
      // 못 읽으면 기기 언어 그대로 간다. 설정 하나 때문에 앱이 죽지 않는다.
    }
  },
  setMode: (next) => {
    // 화면을 먼저 바꾸고 저장한다 — 언어가 손가락을 따라오지 않으면 고장 난 것처럼 느껴진다.
    setLanguage(next);
    set({ mode: next, code: resolveLanguage(next) });
    void setSetting(SETTING_KEYS.language, next).catch(() => undefined);
  },
}));
