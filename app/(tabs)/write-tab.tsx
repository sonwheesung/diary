import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

/**
 * 가운데 + 버튼 전용 자리.
 *
 * 탭으로 머무는 화면이 아니라 작성 화면을 **모달로 띄우는 동작**이다.
 * 포커스를 받는 순간 이전 탭으로 되돌리고 작성 화면을 연다 —
 * 그래야 작성을 닫았을 때 빈 탭이 남지 않는다.
 *
 * ⚠ 오늘 조각이 있어도 **여기는 상세로 보내지 않는다**(2026-08-08).
 * 보내버리면 지난 날짜로 쓰러 들어갈 문이 사라진다 — 이 버튼은 '새 조각'의 입구다.
 * 오늘이 막혀 있으면 작성 화면이 날짜 시트를 먼저 열어 다른 날을 고르게 한다.
 */
export default function WriteTab() {
  useFocusEffect(
    useCallback(() => {
      router.back();
      router.push('/write');
    }, []),
  );

  return <View />;
}
