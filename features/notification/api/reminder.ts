import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getWrittenDates } from '@/features/diary/api/diary-repository';
import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { today } from '@/lib/date';
import { translate } from '@/lib/i18n';

import {
  DEFAULT_REMINDER_TIME,
  REMINDER_WINDOW_DAYS,
  entryDateFromReminderId,
  parseReminderTime,
  planReminderDates,
  reminderIdFor,
  shiftEntryDate,
} from '../reminder-schedule';
import type { ReminderTime } from '../reminder-schedule';

/**
 * 기록 리마인더 — **로컬 알림만**. 서버는 아무것도 보내지 않는다.
 *
 * 설계·근거는 [`docs/NOTIFICATION_SYSTEM.md`](../../../docs/NOTIFICATION_SYSTEM.md).
 * 계산은 `../reminder-schedule.ts`(순수 계층)가 갖고, 이 파일은 **OS와 말하는 부분만** 맡는다.
 *
 * 🔴 이 모듈의 유일한 공개 진입점은 사실상 `syncReminders()` 하나다.
 *   켜기·끄기·시각 변경·조각 저장·언어 변경이 전부 "다시 맞춰라"로 수렴한다 —
 *   상태를 각자 조금씩 고치면 반드시 어긋난다(잠금이 설정을 두 곳에서 읽어 겪었던 사고와 같은 종류).
 */

const CHANNEL_ID = 'reminder';

/**
 * 앱이 떠 있는 동안에는 **띄우지 않는다.**
 *
 * 이미 앱을 보고 있는 사람에게 *"오늘 조각을 남겨보세요"* 는 소음이다.
 * 핸들러를 아예 안 주면 라이브러리가 경고를 내므로, 안 띄우겠다는 뜻을 명시한다.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: translate('notification.channelName'),
    /*
     * `DEFAULT`는 소리·진동은 나되 화면을 덮지 않는다(`HIGH`가 헤드업 배너다).
     * 일기 리마인더가 보던 화면을 가로막으면 과하고, 반대로 무음이면 아무도 못 본다 —
     * 기본값을 그대로 쓰는 것이 맞다. 소리·진동을 손으로 지정하지 않는 이유도 같다.
     */
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getReminderEnabled(): Promise<boolean> {
  return (await getSetting(SETTING_KEYS.notificationsEnabled)) === 'true';
}

export async function getReminderTime(): Promise<ReminderTime> {
  const stored = await getSetting(SETTING_KEYS.reminderTime);
  return parseReminderTime(stored) ?? parseReminderTime(DEFAULT_REMINDER_TIME)!;
}

/**
 * 권한을 묻는다. **토글을 켤 때만 부른다** — 앱 시작 시 묻지 않는다(기둥 1).
 *
 * ⚠ 이미 거부한 뒤에는 OS가 다시 묻지 않고 곧바로 `denied`를 준다. 그래서 부르는 쪽은
 *   `false`를 "사용자가 방금 거부함"이 아니라 **"지금은 못 쓴다"** 로 다뤄야 한다.
 */
export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function hasPermission(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** 우리가 건 것만 지운다. 다른 출처의 예약을 건드리지 않는다 */
async function cancelOurs(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => entryDateFromReminderId(n.identifier) !== null)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * 예약을 현재 상태에 맞춘다. **전부 지우고 다시 건다.**
 *
 * 차이만 반영하지 않는 이유는 두 가지다:
 *   ① 7건뿐이라 통째로 다시 거는 비용이 없다.
 *   ② 🔴 **예약된 알림은 예약 시점의 언어로 굳는다**(§6). OS가 문자열을 들고 있어서
 *      우리 DB 규칙(코드/id만 저장, §9.1 규칙 2)을 적용할 수 없다. 통째로 다시 걸면
 *      언어 변경·시각 변경이 **따로 처리할 것 없이** 자동으로 반영된다.
 *
 * 안전하게 여러 번 불러도 된다 — 앱 시작·포그라운드 복귀·조각 저장·설정 변경에서 부른다.
 */
export async function syncReminders(): Promise<void> {
  try {
    if (!(await getReminderEnabled())) {
      await cancelOurs();
      return;
    }
    // 권한이 없으면 예약해도 조용히 버려진다. 켜진 채 안 오는 상태를 만들지 않는다.
    if (!(await hasPermission())) {
      await cancelOurs();
      return;
    }

    const time = await getReminderTime();
    const from = today();
    // 조회 범위도 순수 계층의 덧셈을 쓴다 — 두 구현이 갈리면 창 끝날이 조용히 어긋난다
    const to = shiftEntryDate(from, REMINDER_WINDOW_DAYS - 1);
    const written = await getWrittenDates(from, to);

    const now = new Date();
    const dates = planReminderDates({
      today: from,
      nowMinutes: now.getHours() * 60 + now.getMinutes(),
      time,
      writtenDates: written,
    });

    await ensureChannel();
    await cancelOurs();

    // ⚠ 본문에 일기를 넣지 않는다(§4). 잠금화면에 한 줄이라도 새면 잠금이 무의미하다.
    const title = translate('notification.reminderTitle');
    const body = translate('notification.reminderBody');

    for (const date of dates) {
      const [y, m, d] = date.split('-').map(Number);
      const at = new Date(y, m - 1, d, time.hour, time.minute, 0, 0);
      await Notifications.scheduleNotificationAsync({
        identifier: reminderIdFor(date),
        content: { title, body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch {
    /*
     * 알림은 **앱을 막을 이유가 없다**(광고 SDK 초기화 실패와 같은 규약, CLAUDE.md §7).
     * 여기서 던지면 앱 시작·조각 저장이 함께 넘어진다 — 알림 하나 못 걸었다고 일기를 못 쓰면 안 된다.
     */
  }
}

/** 토글. 켤 때만 권한을 묻는다. 권한을 못 받으면 **켜지지 않는다**(false를 돌려준다) */
export async function setReminderEnabled(enabled: boolean): Promise<boolean> {
  if (enabled && !(await requestReminderPermission())) {
    await setSetting(SETTING_KEYS.notificationsEnabled, 'false');
    await syncReminders();
    return false;
  }
  await setSetting(SETTING_KEYS.notificationsEnabled, enabled ? 'true' : 'false');
  await syncReminders();
  return enabled;
}

export async function setReminderTime(time: ReminderTime): Promise<void> {
  await setSetting(
    SETTING_KEYS.reminderTime,
    `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`,
  );
  await syncReminders();
}
