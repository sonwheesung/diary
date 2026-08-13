import { create } from 'zustand';

import { SETTING_KEYS, getSetting, setSetting } from '@/features/settings/api/settings-store';
import { commonServer } from '@/lib/common-server/client';
import type { FailReason, MyInquiry } from '@/lib/common-server/types';

/**
 * 내 문의와 답변 (`docs/SUPPORT_SYSTEM.md` §5.5).
 *
 * 공지 스토어(`features/notice/store.ts`)와 **같은 규약**이다 — 읽음은 기기에만 쌓고
 * 서버에 보내지 않으며, 실패는 조용히 넘긴다. 다른 점은 셋이다:
 *
 * 1. `bootstrap`에 실을 수 없다 — 인증이 필요하다. 그래서 별도 조회다.
 * 2. 앱 실행당 1회가 아니라 **부를 때마다 다시 읽는다.** 답변은 언제든 도착하고,
 *    낡은 목록을 보여줄 바에는 왕복 한 번이 싸다.
 * 3. 읽음 키가 id가 아니라 `id:repliedAt`이다 — 아래 참조.
 */

interface InquiryState {
  /** 조회 시도가 한 번이라도 끝났는지(성공·실패 무관). 빈 목록과 "아직 안 불러옴"의 구별 */
  loaded: boolean;
  loading: boolean;
  /**
   * 마지막 조회가 세션을 찾았는가. **설정의 '내 문의' 행을 보일지 판정하는 값이다.**
   *
   * ⚠ 설정 화면이 `useSupportAuth()`를 부르지 않는 이유가 이것이다 — 그 훅은 마운트할 때마다
   *   `restoreSession()`으로 **서버 왕복**을 한다. 문의 화면이 이미 그걸 하는데 설정 탭에서
   *   한 번 더 돌 이유가 없다. 여기 판정은 토큰 유무(로컬 읽기)라 왕복이 없다.
   */
  signedIn: boolean;
  /**
   * 마지막 조회가 실패한 사유. 성공하면 `null`로 지운다.
   *
   * 🔴 이게 없으면 **오프라인에서 "보낸 문의가 없어요"가 뜬다** — 방금 보낸 문의가
   *   사라진 것처럼 보인다. 빈 목록과 못 불러온 것은 화면에서 반드시 갈라야 한다.
   */
  lastError: FailReason | null;
  inquiries: MyInquiry[];
  /** 읽음 처리된 답변 키(`id:repliedAt`) */
  readKeys: string[];
  /** 읽지 않은 **답변** 수. 내가 보낸 문의는 세지 않는다 — 알릴 것은 답변뿐이다 */
  unreadCount: number;
  refresh: () => Promise<void>;
  /** 목록 화면에 들어온 시점에 호출 — 지금 있는 답변을 전부 읽음으로 기록한다 */
  markAllRead: () => void;
  /** 로그아웃·탈퇴 시 호출. **부르지 않으면 다음 사람에게 앞사람의 배지가 남는다** */
  clear: () => Promise<void>;
}

/**
 * 읽음 키 — **`id`만으로는 부족하다.**
 *
 * 답변은 운영자가 고쳐 쓸 수 있다. id만 기억하면 정정된 답변이 이미 읽은 것으로 남아
 * 사용자에게 **영영 안 보인다.** `repliedAt`을 키에 넣으면 답변이 갱신될 때 자동으로
 * 새 키가 되어 다시 점이 뜬다 — 비교 로직을 따로 두지 않아도 된다.
 *
 * 답변이 없는 문의는 `null`을 준다(알릴 것이 없다).
 */
export function replyKey(item: MyInquiry): string | null {
  if (item.reply === null || item.reply.trim().length === 0) {
    return null;
  }
  // repliedAt이 비어 오는 경우에도 키는 안정적이어야 한다 — 그때는 id만으로 굳는다.
  return `${item.id}:${item.repliedAt ?? ''}`;
}

function countUnread(inquiries: MyInquiry[], readKeys: string[]): number {
  if (inquiries.length === 0) {
    return 0;
  }
  const read = new Set(readKeys);
  return inquiries.filter((item) => {
    const key = replyKey(item);
    return key !== null && !read.has(key);
  }).length;
}

/** 저장소 오류·깨진 값은 "아무것도 안 읽음"으로 본다 — 배지가 더 뜰 뿐 잃는 게 없다. */
async function loadReadKeys(): Promise<string[]> {
  try {
    const raw = await getSetting(SETTING_KEYS.inquiryReadKeys);
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
 * 살아 있는 답변 키만 남겨 저장한다.
 *
 * 서버가 50건에서 자르므로 오래된 문의는 목록에서 사라진다. 그 키를 계속 들고 있으면
 * 흔적이 무한히 쌓인다 — 공지와 같은 이유로 정리한다.
 */
async function saveReadKeys(readKeys: string[], aliveKeys: string[]): Promise<void> {
  const alive = new Set(aliveKeys);
  const next = [...new Set(readKeys)].filter((key) => alive.has(key));
  try {
    await setSetting(SETTING_KEYS.inquiryReadKeys, JSON.stringify(next));
  } catch {
    // 저장에 실패해도 화면 상태는 갱신한다 — 다음 실행에 안읽음으로 되돌아갈 뿐이다.
  }
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  loaded: false,
  loading: false,
  signedIn: false,
  lastError: null,
  inquiries: [],
  readKeys: [],
  unreadCount: 0,

  refresh: async () => {
    if (get().loading) {
      return; // 화면 진입과 배지 갱신이 겹칠 수 있다. 왕복을 두 번 돌 이유가 없다.
    }
    set({ loading: true });
    try {
      /*
       * 🔴 **토큰 유무를 먼저 반영한다**(2026-08-13 기기에서 발견).
       *
       * 조회 성공에서만 `signedIn`을 켜면, 로그인한 사람이 **오프라인일 때 영영 안 켜진다** —
       * 초기값이 false이고 `offline`은 값을 안 바꾸므로 true에 도달할 길이 없다.
       * 그러면 비행기 모드로 앱을 연 사람에게 설정의 '내 문의' 행이 아예 사라진다.
       *
       * `isSignedIn()`은 **로컬 토큰 읽기**라 왕복이 없다 — 설정 탭에 왕복을 더하지 않는다는
       * 원래 이유(`docs/SUPPORT_SYSTEM.md` §5.5)와 어긋나지 않는다.
       */
      const [hasToken, result, readKeys] = await Promise.all([
        commonServer.isSignedIn(),
        commonServer.fetchMyInquiries(),
        loadReadKeys(),
      ]);

      if (!result.ok) {
        /*
         * 세션이 **확실히 없을 때만** 로그인 안 됨으로 내린다. `offline`·`error`는
         * "지금 못 물어봤다"이지 "로그인 안 했다"가 아니다 — 그걸로 행을 숨기면
         * 비행기 모드에서 내 문의가 사라진다.
         */
        const noSession = result.reason === 'not-signed-in' || result.reason === 'unauthorized';
        /*
         * 🔴 **`not-signed-in`과 `unauthorized`를 오류 표시에서 갈라야 한다**(2026-08-13 기기에서 발견).
         *
         * 둘 다 "세션 없음"이지만 사용자가 처한 상황이 정반대다:
         *   · `not-signed-in` — 토큰이 애초에 없다. 그 사람은 **이 화면에 오지도 못한다**(입구가 안 보인다).
         *     오류로 세우면 로그인 안 한 사람에게 "불러오지 못했어요"가 뜬다.
         *   · `unauthorized` — 토큰이 있었는데 서버가 거절했고 **SDK가 방금 세션을 버렸다.**
         *     그 사람은 지금 이 화면을 보고 있다. 여기서 조용히 빈 목록을 그리면
         *     **"문의가 없어요"가 거짓말이 된다** — 있는지 없는지 우리도 모른다.
         */
        const neverSignedIn = result.reason === 'not-signed-in';
        /*
         * ⚠ **실패에 목록을 비우지 않는다.** 엔타이틀먼트 캐시와 같은 규율이다 —
         *   잠깐 끊긴 것 때문에 이미 받아둔 답변이 화면에서 사라지면 고장으로 보인다.
         *   단 세션이 없어진 것이라면 남의 답변이 남으면 안 되므로 비운다.
         */
        const inquiries = noSession ? [] : get().inquiries;
        set({
          loaded: true,
          loading: false,
          /*
           * 세션이 확실히 없으면 false. 그 밖(오프라인·서버 오류)은 **토큰 유무**로 판정한다 —
           * 못 물어본 것을 "로그인 안 함"으로 읽으면 행이 사라진다.
           */
          signedIn: noSession ? false : hasToken,
          lastError: neverSignedIn ? null : result.reason,
          inquiries,
          readKeys,
          unreadCount: countUnread(inquiries, readKeys),
        });
        return;
      }

      set({
        loaded: true,
        loading: false,
        signedIn: true,
        lastError: null,
        inquiries: result.inquiries,
        readKeys,
        unreadCount: countUnread(result.inquiries, readKeys),
      });
    } catch {
      // SDK는 throw하지 않지만, 그래도 로딩에 갇히지 않게 감싼다.
      set({ loaded: true, loading: false, lastError: 'error' });
    }
  },

  markAllRead: () => {
    const { inquiries, readKeys } = get();
    const aliveKeys = inquiries.map(replyKey).filter((key): key is string => key !== null);
    if (aliveKeys.length === 0) {
      return;
    }
    const next = [...new Set([...readKeys, ...aliveKeys])];
    // 화면을 먼저 갱신하고 저장은 뒤따라간다 — 배지가 손가락을 따라오지 않으면 고장으로 보인다.
    set({ readKeys: next, unreadCount: 0 });
    void saveReadKeys(next, aliveKeys);
  },

  clear: async () => {
    set({
      loaded: false,
      loading: false,
      signedIn: false,
      lastError: null,
      inquiries: [],
      readKeys: [],
      unreadCount: 0,
    });
    try {
      // 빈 문자열이 이 저장소의 삭제 관용구다(설정 화면들과 같은 규약).
      await setSetting(SETTING_KEYS.inquiryReadKeys, '');
    } catch {
      // 못 지워도 목록이 비었으므로 배지는 뜨지 않는다. 다음 로그인에서 정리된다.
    }
  },
}));
