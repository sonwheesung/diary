import { getDatabase } from '@/db/client';

/**
 * 앱 설정 키-값 저장소.
 *
 * 조각이 아닌 값(알림 토글·다크모드·잠금 대기시간)이 여기 모인다.
 * **비밀은 여기 두지 않는다** — PIN 해시·암호화 키는 SecureStore가 맡는다(CLAUDE.md §7.1).
 * 섞어두면 무엇이 비밀인지 흐려지고, 백업에 실어도 되는지 판단할 수 없게 된다.
 */
export const SETTING_KEYS = {
  /** 알림 토글. 지금은 화면만 있고 실제 발송은 하지 않는다(CLAUDE.md §3, §9) */
  notificationsEnabled: 'notifications_enabled',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export async function getSetting(key: SettingKey): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    value,
    Date.now(),
  );
}

/** 저장된 적이 없으면 `fallback`. 값이 깨져 있어도 던지지 않는다 — 설정 하나 때문에 화면이 죽으면 안 된다. */
export async function getBoolSetting(key: SettingKey, fallback: boolean): Promise<boolean> {
  const value = await getSetting(key);
  if (value === null) {
    return fallback;
  }
  return value === 'true';
}

export async function setBoolSetting(key: SettingKey, value: boolean): Promise<void> {
  await setSetting(key, value ? 'true' : 'false');
}
