import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  getDiaryIdOnDate,
  getStreak,
  listRecentDiaries,
} from '@/features/diary/api/diary-repository';
import { getImagesForDiaries } from '@/features/diary/api/image-store';
import type { Diary, DiaryImage } from '@/features/diary/types';
import { today } from '@/lib/date';
import { translate } from '@/lib/i18n';

interface HomeData {
  recent: Diary[];
  /** 조각 id → 첫 이미지(썸네일). 없으면 항목 자체가 없다 */
  thumbnails: Map<string, DiaryImage>;
  streak: number;
  /**
   * 오늘 이미 쓴 조각의 id. 하루에 하나이므로(DIARY_SYSTEM §2) 이게 있으면
   * 홈의 주 동선은 *쓰기*가 아니라 *보기*다 — 못 쓸 화면으로 보내지 않는다.
   */
  todayDiaryId: string | null;
  loading: boolean;
  error: string | null;
}

/*
 * 홈에 몇 개를 보일까 — ~~6개~~ → **3개**(2026-09-10 사용자 결정).
 *
 * 홈은 목록을 훑는 자리가 아니라 **오늘 쓰러 오는 자리**다(기둥 1). 여섯 개가 깔리면
 * 화면이 목록으로 읽히고 `조각 쓰기` 버튼이 위로 밀려난다. 더 보고 싶은 사람에게는
 * 바로 아래 **더 보기**가 있고, 거기가 목록의 자리다(`app/diaries.tsx`).
 */
const RECENT_LIMIT = 3;

/**
 * 홈 화면 데이터. 화면에 **돌아올 때마다** 다시 읽는다 —
 * 작성·수정·삭제 후 돌아왔을 때 낡은 목록이 보이면 안 된다.
 */
export function useHomeData(): HomeData & { reload: () => void } {
  const [state, setState] = useState<HomeData>({
    recent: [],
    thumbnails: new Map(),
    streak: 0,
    todayDiaryId: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    try {
      const [recent, streak, todayDiaryId] = await Promise.all([
        listRecentDiaries(RECENT_LIMIT),
        getStreak(),
        getDiaryIdOnDate(today()),
      ]);
      const imageMap = await getImagesForDiaries(recent.map((diary) => diary.id));

      const thumbnails = new Map<string, DiaryImage>();
      for (const [diaryId, images] of imageMap) {
        const first = images[0];
        if (first !== undefined) {
          thumbnails.set(diaryId, first);
        }
      }

      setState({ recent, thumbnails, streak, todayDiaryId, loading: false, error: null });
    } catch (error) {
      // DB를 못 읽어도 화면은 뜬다. 빈 화면 대신 무엇이 잘못됐는지 보여준다.
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : translate('home.loadError'),
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { ...state, reload: () => void load() };
}
