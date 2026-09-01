import { getDatabase } from '@/db/client';

/**
 * 앱 설정 키-값 저장소.
 *
 * 조각이 아닌 값(알림 토글·다크모드·잠금 실패 횟수)이 여기 모인다.
 * **비밀은 여기 두지 않는다** — PIN 해시·암호화 키는 SecureStore가 맡는다(CLAUDE.md §7.1).
 * 섞어두면 무엇이 비밀인지 흐려지고, 백업에 실어도 되는지 판단할 수 없게 된다.
 */
export const SETTING_KEYS = {
  /** 기록 리마인더 토글(`'true'`/`'false'`). 로컬 알림만 — `docs/NOTIFICATION_SYSTEM.md` */
  notificationsEnabled: 'notifications_enabled',
  /**
   * 리마인더 시각 `"HH:mm"`(기기 로컬). 비어 있으면 기본값 21:00.
   *
   * ⚠ 시각을 바꾸면 **예약을 전부 다시 건다.** 이미 걸린 알림은 옛 시각을 들고 있고
   *   OS 안에 있어서 우리가 고칠 수 없다(`NOTIFICATION_SYSTEM.md` §6).
   */
  reminderTime: 'reminder_time',
  /*
   * ⚠ 예전에 있던 `lock_delay`는 없앴다(2026-08-10) — 잠금은 나가면 즉시다.
   * 이미 저장된 행은 아무도 읽지 않으니 그대로 둔다. 마이그레이션으로 지울 값이 아니다.
   */
  /** 연속 실패 횟수. 지연(backoff) 계산에 쓴다 */
  lockFailCount: 'lock_fail_count',
  /** 이 시각(ms)까지는 시도를 막는다 */
  lockBlockedUntil: 'lock_blocked_until',
  /** 테마: 'system' | 'light' | 'dark' (⏭ 스킨이 생기면 스킨 id도 여기 들어온다) */
  themeMode: 'theme_mode',
  /** 전면광고를 마지막으로 띄운 날짜(YYYY-MM-DD). 하루 1회 캡의 근거(CLAUDE.md §7) */
  adsInterstitialDate: 'ads_interstitial_date',
  /** 언어: 'system' | 지원 언어 코드 */
  language: 'language',
  /**
   * AI 리포트를 **어떤 언어로 쓸지**. 비어 있으면 앱 언어를 따른다.
   *
   * ⚠ `language`와 합치지 않는다. 앱은 한국어로 쓰면서 리포트는 영어로 받고 싶은 사람이 있고,
   *   무엇보다 **"앱 언어와 같음"과 "우연히 한국어를 골랐음"은 다르다** — 합치면 앱 언어를
   *   바꿨을 때 리포트 언어가 따라갈지 말지를 판단할 근거가 사라진다
   *   (`docs/AI_REPORT_SYSTEM.md` §6.2).
   */
  aiReportLanguage: 'ai_report_language',
  /**
   * AI 리포트 동의 — **두 키다. 합치지 않는다.**
   *
   * 🔴 근거 법조문이 다르다(§23 민감정보 / §28-8 국외이전). 한 키에 담으면 "둘 다 동의"
   *   외의 상태를 표현할 수 없고, 하나만 철회하는 것도 불가능해진다
   *   (`features/ai/consent.ts`).
   *
   * 값은 `"<동의버전>|<epoch ms>"` — **언제 어느 문안에 동의했는지** 증명할 수 있어야 한다.
   */
  aiConsentSensitive: 'ai_consent_sensitive',
  aiConsentTransfer: 'ai_consent_transfer',
  /**
   * 읽은 공지 id 목록(JSON 배열).
   *
   * **서버에 읽음을 보내지 않는다** — 익명 접수라 서버가 "누가 읽었는지"를 알 방법이 없고,
   * 알 수 있게 만들면 익명성이 깨진다(NOTICE_SYSTEM). 그래서 기기에만 쌓는다.
   */
  noticeReadIds: 'notice_read_ids',
  /**
   * 읽은 **답변** 키 목록(JSON 배열). 공지와 같은 규약 — 서버에 읽음을 보내지 않는다.
   *
   * ⚠ 키가 문의 id가 아니라 **`<id>:<repliedAt>`** 이다. 답변은 고쳐 쓸 수 있어서
   *   id만 기억하면 운영자가 정정한 답변이 **영영 안 보인다**(`docs/SUPPORT_SYSTEM.md` §5.5).
   *
   * ⚠ 로그아웃·탈퇴 때 **반드시 비운다.** 안 비우면 다음 사람에게 앞사람의 배지가 남는다.
   */
  inquiryReadKeys: 'inquiry_read_keys',
  /**
   * `pro` 엔타이틀먼트가 유효한 시각(ISO). **오프라인 캐시**다.
   *
   * 서버가 내려준 `expiresAt`을 그대로 담는다 — 앱이 만료를 다시 판정하지 않는다.
   * 이게 없으면 비행기 모드로 앱을 연 구독자에게 광고가 뜬다.
   * `'never'`는 만료 없음(서버가 `expiresAt: null`을 준 경우).
   */
  proUntil: 'pro_until',
  /**
   * 연령 게이트 통과 기록 — `{ passedAt, threshold, version }` JSON.
   *
   * 🔴 **생년은 들어 있지 않다.** 받아서 판정하고 버린다(`docs/AUTH_SYSTEM.md` §1.4).
   *
   * ⚠ **로그아웃·탈퇴로 지우지 않는다.** 연령은 사람의 속성이지 계정의 속성이 아니고,
   *   지우면 **탈퇴가 게이트 재시도 경로**가 된다.
   * ⚠ 반대로 **앱 초기화로는 지워진다**(`reset-app.ts`가 `app_settings`를 비운다) — 그게 맞다.
   *   초기화는 재설치와 성격이 같고, 무엇보다 초기화 문구가 *"전부 지운다"* 고 약속했다.
   */
  agePass: 'age_pass',
  /**
   * 연령 미달 판정 기록 — **365일 유예**(`docs/AUTH_SYSTEM.md` §1.2).
   *
   * 🔴 통과 기록(`age_pass`)과 **다른 칸**이다. 한 칸에 두면 어느 쪽인지 파싱으로 갈라야 하고,
   *   그 판정이 틀리는 날 증상이 "미달자가 통과한다"다.
   * ⚠ 답하지 않고 **닫은 것은 여기 안 들어간다** — "모른다"를 "미달"로 굳히면 자격자를 1년 막는다.
   */
  ageBlock: 'age_block',
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

/** 숫자 설정. 값이 깨져 있으면 `fallback` — 설정 하나 때문에 잠금이 열리거나 잠기면 안 된다. */
export async function getNumberSetting(key: SettingKey, fallback: number): Promise<number> {
  const value = await getSetting(key);
  if (value === null) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function setNumberSetting(key: SettingKey, value: number): Promise<void> {
  await setSetting(key, String(value));
}
