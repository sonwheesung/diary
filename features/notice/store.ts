import { create } from 'zustand';

import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { commonServer, deviceServer } from '@/lib/common-server/client';
import type { AnnouncementItem, Bootstrap } from '@/lib/common-server/types';

/**
 * 공통 서버 부팅 조회 — 앱 실행당 **단 1회**.
 *
 * 점검·버전·공지를 한 번에 받아 두 소비자(설정의 공지 배지 / 공지 목록 화면)에게 나눠준다.
 * 화면을 열 때마다 다시 부르지 않으려고 스토어에 둔다.
 *
 * **실패해도 아무것도 하지 않는다.** `boot`은 null로 남고 공지 목록은 빈 상태로 보인다 —
 * 서버가 죽어도 일기는 그대로 써져야 한다(기둥 1·3). 조각은 로컬 우선 앱이라
 * 서버 응답이 앱 사용의 전제가 되는 지점을 만들지 않는다.
 *
 * ⚠ **점검(maintenance)으로 앱을 막지 않는다.** bootstrap 응답에 점검 필드가 오지만 쓰지 않는다 —
 * 일기는 기기에 있고 서버 없이도 완전히 동작하므로, 서버 점검을 이유로 사용자를 자기 일기에서
 * 잠그는 것은 정당화되지 않는다. 버전 게이트도 같은 이유로 두지 않는다.
 */

interface NoticeState {
  /** 조회 성공 시에만 채워진다. 실패·미설정이면 null */
  boot: Bootstrap | null;
  /** 조회 시도가 끝났는지(성공·실패 무관) — 빈 목록과 "아직 안 불러옴"을 구별해야 한다 */
  loaded: boolean;
  announcements: AnnouncementItem[];
  /** 읽음으로 기록된 공지 id */
  readIds: string[];
  unreadCount: number;
  load: () => Promise<void>;
  /** 공지 화면에 들어온 시점에 호출 — 목록 전체를 읽음으로 기록한다 */
  markAllRead: () => void;
}

function countUnread(announcements: AnnouncementItem[], readIds: string[]): number {
  if (announcements.length === 0) {
    return 0;
  }
  const read = new Set(readIds);
  return announcements.filter((item) => !read.has(item.id)).length;
}

/** 저장소 오류·깨진 값은 "아무것도 안 읽음"으로 본다 — 배지가 더 뜰 뿐 잃는 게 없다. */
async function loadReadIds(): Promise<string[]> {
  try {
    const raw = await getSetting(SETTING_KEYS.noticeReadIds);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * 살아 있는 공지 id만 남겨 저장한다.
 *
 * 서버가 안 내려주는 id를 계속 들고 있으면 만료·삭제된 공지의 흔적이 영원히 쌓인다.
 * 공지 id는 서버에서 재사용하지 않으므로 지워도 안전하다.
 */
async function saveReadIds(readIds: string[], serverIds: string[]): Promise<void> {
  const alive = new Set(serverIds);
  const next = [...new Set(readIds)].filter((id) => alive.has(id));
  try {
    await setSetting(SETTING_KEYS.noticeReadIds, JSON.stringify(next));
  } catch {
    // 저장에 실패해도 화면 상태는 갱신한다 — 다음 실행에 안읽음으로 되돌아갈 뿐이다.
  }
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  boot: null,
  loaded: false,
  announcements: [],
  readIds: [],
  unreadCount: 0,

  load: async () => {
    if (get().loaded) {
      return; // 실행당 1회. 화면을 오갈 때마다 서버를 두드리지 않는다.
    }
    /*
     * 어느 인스턴스로 부를지 — **로그인했으면 구글 세션, 아니면 기기 세션**
     * (`docs/SUPPORT_SYSTEM.md` §3.1).
     *
     * `fetchBootstrap()` 이 세션을 실어 보내고 서버가 그걸로 활성 일자를 기록한다. 조각은
     * 로그인이 **선택**이라 구글 세션만 쓰면 비로그인 사용자가 한 명도 안 잡힌다 — 그래서
     * 세션이 없을 때는 기기 인스턴스로 묻는다. 공지 응답은 어느 쪽이든 같다.
     *
     * ⚠ **`ensureDeviceSession()` 과 병렬이다.** 서버가 `devices` 와 `bootstrap` 양쪽에서
     *   찍고 `(app, subject, day)` PK 가 멱등이라 순서를 맞춰 얻을 게 없고 부팅만 느려진다.
     *   첫 실행엔 bootstrap 에 토큰이 없어도 `devices` 가 그날을 살린다.
     */
    const signedIn = await commonServer.isSignedIn();
    const server = signedIn ? commonServer : deviceServer;

    // 저장소와 서버는 서로 기다릴 이유가 없다.
    const [result, readIds] = await Promise.all([server.fetchBootstrap(), loadReadIds()]);
    const announcements = result.ok ? result.data.announcements : [];

    set({
      boot: result.ok ? result.data : null,
      loaded: true,
      announcements,
      readIds,
      unreadCount: countUnread(announcements, readIds),
    });
  },

  markAllRead: () => {
    const { announcements } = get();
    if (announcements.length === 0) {
      return;
    }
    const serverIds = announcements.map((item) => item.id);
    // 화면을 먼저 갱신하고 저장은 뒤따라간다 — 배지가 손가락을 따라오지 않으면 고장 난 것처럼 보인다.
    set({ readIds: serverIds, unreadCount: 0 });
    void saveReadIds(serverIds, serverIds);
  },
}));
