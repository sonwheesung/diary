import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { getDiaryIdOnDate } from '@/features/diary/api/diary-repository';
import { today } from '@/lib/date';

/**
 * 가운데 + 버튼 전용 자리.
 *
 * 탭으로 머무는 화면이 아니라 작성 화면을 **모달로 띄우는 동작**이다.
 * 포커스를 받는 순간 이전 탭으로 되돌리고 작성 화면을 연다 —
 * 그래야 작성을 닫았을 때 빈 탭이 남지 않는다.
 *
 * 오늘 조각이 이미 있으면 상세로 보낸다(DIARY_SYSTEM §2) — 홈 버튼과 같은 규칙이다.
 * 저장할 수 없는 작성 화면에 데려다 놓지 않는다.
 */
export default function WriteTab() {
  useFocusEffect(
    useCallback(() => {
      router.back();
      void getDiaryIdOnDate(today())
        .then((id) => router.push(id === null ? '/write' : `/diary/${id}`))
        // 확인에 실패하면 쓰러 보낸다. 작성 화면이 한 번 더 막아준다.
        .catch(() => router.push('/write'));
    }, []),
  );

  return <View />;
}
