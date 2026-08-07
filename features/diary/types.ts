import type { EmotionCode } from './emotions';

/** 조각 하나. DB row를 camelCase로 옮긴 형태. */
export interface Diary {
  id: string;
  /** 'YYYY-MM-DD' — 기기 로컬 타임존 기준 (DIARY_SYSTEM §3) */
  entryDate: string;
  /** 선택 — 없으면 null */
  title: string | null;
  content: string;
  /** 선택 — 고르지 않으면 null */
  emotion: EmotionCode | null;
  /** epoch ms */
  createdAt: number;
  /** epoch ms — 백업이 최신본을 고르는 기준 */
  updatedAt: number;
}

/** 새 조각 입력. content만 필수 (DIARY_SYSTEM §1). */
export interface DiaryDraft {
  content: string;
  title?: string | null;
  emotion?: EmotionCode | null;
  /** 생략하면 오늘 */
  entryDate?: string;
}

/** 수정 입력. 넘긴 필드만 바뀐다. */
export interface DiaryPatch {
  content?: string;
  title?: string | null;
  emotion?: EmotionCode | null;
  entryDate?: string;
}

/** DB에서 읽은 원본 row 형태 (snake_case). 매핑 함수 밖으로 새지 않게 한다. */
export interface DiaryRow {
  id: string;
  entry_date: string;
  title: string | null;
  content: string;
  emotion: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
