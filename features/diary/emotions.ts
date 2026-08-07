/**
 * 감정 목록 (DIARY_SYSTEM §4).
 *
 * Expand-only — 코드를 **추가만** 한다. 기존 코드의 의미를 바꾸거나 지우면
 * 이미 저장된 조각이 의미를 잃는다.
 *
 * ⚠ 표시 라벨은 디자인 시안에 맞춰 조정될 수 있다. 코드 값(영문)은 고정이다.
 */
export const EMOTIONS = [
  { code: 'joy', label: '기쁨' },
  { code: 'excited', label: '설렘' },
  { code: 'calm', label: '평온' },
  { code: 'proud', label: '뿌듯' },
  { code: 'neutral', label: '그저그럼' },
  { code: 'tired', label: '지침' },
  { code: 'sad', label: '슬픔' },
  { code: 'angry', label: '화남' },
] as const;

export type EmotionCode = (typeof EMOTIONS)[number]['code'];

const EMOTION_CODES: ReadonlySet<string> = new Set(EMOTIONS.map((emotion) => emotion.code));

/**
 * DB에서 읽은 문자열이 아는 감정 코드인지 확인한다.
 * 앱을 다운그레이드하면 모르는 코드가 들어올 수 있다 — 그때는 감정 없음으로 취급하고
 * 조각 자체는 정상적으로 보여준다(내용을 못 읽게 만드는 것이 더 나쁘다).
 */
export function isEmotionCode(value: string | null): value is EmotionCode {
  return value !== null && EMOTION_CODES.has(value);
}

export function findEmotion(code: EmotionCode) {
  return EMOTIONS.find((emotion) => emotion.code === code);
}
