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

const RECENT_LIMIT = 6;

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
        error: error instanceof Error ? error.message : '조각을 불러오지 못했습니다.',
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
