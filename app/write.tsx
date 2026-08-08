import { router, useLocalSearchParams } from 'expo-router';

import { DiaryEditor } from '@/features/diary/components/DiaryEditor';
import { isValidEntryDate } from '@/lib/date';

/**
 * 새 조각 작성 — 아래에서 올라오는 모달.
 *
 * 편집기 자체는 `DiaryEditor`가 갖고 있다. 기존 조각 수정은 이 화면을 거치지 않고
 * 상세 화면이 제자리에서 같은 편집기를 끼운다(DIARY_SYSTEM §8).
 */
export default function WriteScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  // 캘린더에서 특정 날을 눌러 들어오는 경로. 이상한 값이 들어오면 무시하고 오늘로 간다.
  const initialDate =
    typeof params.date === 'string' && isValidEntryDate(params.date) ? params.date : undefined;

  return (
    <DiaryEditor
      diaryId={null}
      initialDate={initialDate}
      onSaved={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
