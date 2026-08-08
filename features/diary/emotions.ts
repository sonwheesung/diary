import { translate } from '@/lib/i18n';

/**
 * 감정 목록 (DIARY_SYSTEM §4).
 *
 * Expand-only — 코드를 **추가만** 한다. 기존 코드의 의미를 바꾸거나 지우면
 * 이미 저장된 조각이 의미를 잃는다.
 *
 * **DB에는 코드만 저장한다.** 라벨은 언어마다 다르므로 `locales/*.json`의 `emotion.*`에서 꺼낸다 —
 * 라벨을 저장했다면 언어를 바꾼 순간 옛 조각의 감정이 다른 언어로 남았을 것이다.
 */
export const EMOTION_CODES_ORDER = [
  'joy',
  'excited',
  'calm',
  'proud',
  'neutral',
  'tired',
  'sad',
  'angry',
] as const;

export type EmotionCode = (typeof EMOTION_CODES_ORDER)[number];

export interface Emotion {
  code: EmotionCode;
  label: string;
}

const EMOTION_CODE_SET: ReadonlySet<string> = new Set(EMOTION_CODES_ORDER);

/** 현재 언어의 라벨이 붙은 목록. 언어가 바뀌면 다시 부른다 */
export function emotions(): Emotion[] {
  return EMOTION_CODES_ORDER.map((code) => ({ code, label: translate(`emotion.${code}`) }));
}

/**
 * DB에서 읽은 문자열이 아는 감정 코드인지 확인한다.
 * 앱을 다운그레이드하면 모르는 코드가 들어올 수 있다 — 그때는 감정 없음으로 취급하고
 * 조각 자체는 정상적으로 보여준다(내용을 못 읽게 만드는 것이 더 나쁘다).
 */
export function isEmotionCode(value: string | null): value is EmotionCode {
  return value !== null && EMOTION_CODE_SET.has(value);
}

export function emotionLabel(code: EmotionCode): string {
  return translate(`emotion.${code}`);
}
