import type { EmotionCode } from './emotions';

/**
 * 본문은 평문이 아니라 **텍스트/이미지 블록의 순서 있는 배열**이다(DIARY_SYSTEM §1.1).
 * 마크다운·HTML이 아닌 이유: RN에서 인라인 리치 편집은 제약이 크고,
 * 블록이면 AI 요약에 텍스트만 뽑기 쉽고 백업 암호화도 단순해진다.
 */
export type DiaryBlock =
  | { type: 'text'; value: string }
  /**
   * 목록. 항목 문자열만 갖는다 — **불릿 모양은 저장하지 않는다.**
   * 모양은 표시 문제라 나중에 스킨(§9)에서 갈아끼울 수 있어야 하고, 저장해두면
   * 스킨을 바꿔도 옛 조각만 옛 모양으로 남는다(감정 라벨을 코드로 저장한 것과 같은 이유).
   */
  | { type: 'list'; items: string[] }
  | { type: 'image'; imageId: string };

export interface DiaryImage {
  id: string;
  diaryId: string;
  /** 앱 이미지 디렉터리 기준 **상대 경로**. 절대 경로를 저장하면 앱 재설치 때 전부 깨진다 */
  fileName: string;
  width: number | null;
  height: number | null;
  createdAt: number;
}

/** 조각 하나. */
export interface Diary {
  id: string;
  /** 'YYYY-MM-DD' — 기기 로컬 타임존 기준 (DIARY_SYSTEM §3) */
  entryDate: string;
  /** 선택 — 없으면 null */
  title: string | null;
  /** 본문 정본 */
  blocks: DiaryBlock[];
  /** 블록에서 뽑아낸 검색용 평문. **파생 데이터** — 직접 수정하지 않는다 */
  plainText: string;
  /** 선택 — 고르지 않으면 null */
  emotion: EmotionCode | null;
  /** 태그 이름들 (저장 순서) */
  tags: string[];
  /** epoch ms */
  createdAt: number;
  /** epoch ms — 백업이 최신본을 고르는 기준 */
  updatedAt: number;
}

/** 새 조각 입력. 본문(blocks)만 필수 (DIARY_SYSTEM §1). */
export interface DiaryDraft {
  /**
   * 작성 화면이 미리 만들어 둔 id. 이미지는 조각이 저장되기 **전에** 삽입되므로
   * 그 시점에 붙일 diary_id가 먼저 있어야 한다. 생략하면 새로 만든다.
   */
  id?: string;
  blocks: DiaryBlock[];
  title?: string | null;
  emotion?: EmotionCode | null;
  tags?: string[];
  /** 생략하면 오늘 */
  entryDate?: string;
}

/** 수정 입력. 넘긴 필드만 바뀐다. */
export interface DiaryPatch {
  blocks?: DiaryBlock[];
  title?: string | null;
  emotion?: EmotionCode | null;
  tags?: string[];
  entryDate?: string;
}

/** DB row 원본 (snake_case). 매핑 함수 밖으로 새지 않게 한다. */
export interface DiaryRow {
  id: string;
  entry_date: string;
  title: string | null;
  content: string;
  content_blocks: string | null;
  emotion: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface DiaryImageRow {
  id: string;
  diary_id: string;
  file_name: string;
  width: number | null;
  height: number | null;
  created_at: number;
  deleted_at: number | null;
}
