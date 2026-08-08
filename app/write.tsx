import { router } from 'expo-router';

import { DiaryEditor } from '@/features/diary/components/DiaryEditor';

/**
 * 새 조각 작성 — 아래에서 올라오는 모달.
 *
 * 편집기 자체는 `DiaryEditor`가 갖고 있다. 기존 조각 수정은 이 화면을 거치지 않고
 * 상세 화면이 제자리에서 같은 편집기를 끼운다(DIARY_SYSTEM §8).
 */
export default function WriteScreen() {
  return (
    <DiaryEditor diaryId={null} onSaved={() => router.back()} onCancel={() => router.back()} />
  );
}
