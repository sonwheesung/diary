import type { EmotionCode } from './emotions';

/**
 * 글쓴이가 고를 수 있는 본문 글자색. **값이 아니라 역할 이름**이다.
 *
 * 🔴 목록이 `theme/`이 아니라 여기 있는 이유: **무엇을 고를 수 있는가는 도메인**이고,
 *   그 이름이 어떤 픽셀이 되는가만 테마의 몫이다. `theme/palettes.ts`가 이 타입을 받아
 *   팔레트마다 실제 색을 채운다 — 스킨이 늘어도 고를 수 있는 색 목록은 흔들리지 않는다.
 *
 * 8개로 묶어둔다. 참고한 일기장들은 9~12색을 늘어놓는데, 색이 많을수록 고르는 데 시간이 들고
 * 기둥 2("화면이 조용해야 글이 보인다")에서 멀어진다.
 * `default`는 **테마의 본문색 그대로**라는 뜻이고, 저장할 때는 필드를 아예 쓰지 않는다.
 */
export const INK_COLORS = [
  'default',
  'muted',
  'red',
  'rose',
  'amber',
  'green',
  'blue',
  'violet',
] as const;

export type InkColor = (typeof INK_COLORS)[number];

/**
 * 본문은 평문이 아니라 **텍스트/이미지 블록의 순서 있는 배열**이다(DIARY_SYSTEM §1.1).
 * 마크다운·HTML이 아닌 이유: RN에서 인라인 리치 편집은 제약이 크고,
 * 블록이면 AI 요약에 텍스트만 뽑기 쉽고 백업 암호화도 단순해진다.
 */
/** 문단 정렬. 없으면 `left`. */
export type TextAlign = 'left' | 'center' | 'right';

/** 문단 크기. 없으면 `body`. `theme/typography.ts`의 토큰으로 풀린다. */
export type TextSize = 'h1' | 'h2' | 'h3' | 'h4' | 'body';

/**
 * 글쓴이가 문단에 건 서식 (DIARY_SYSTEM §1.1 텍스트 서식).
 *
 * 🔴 **전부 선택이고, 기본값이면 필드를 아예 쓰지 않는다.** 그래야 서식을 한 번도
 *   건드리지 않은 조각의 JSON이 이 기능이 생기기 전과 **바이트 단위로 같다** —
 *   옛 조각이 이유 없이 커지지 않고 백업 diff도 튀지 않는다.
 *
 * ⚠ `color`는 **hex가 아니라 코드**다. 이유는 `theme/palettes.ts`의 `ink` 주석.
 */
export interface TextFormat {
  align?: TextAlign;
  size?: TextSize;
  bold?: boolean;
  color?: InkColor;
}

export type DiaryBlock =
  | ({ type: 'text'; value: string } & TextFormat)
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
  /**
   * 백업 상태. `'missing'`은 **행은 복원됐는데 파일이 이 기기에 없다**는 뜻이다.
   *
   * ⚠ 화면이 이 값을 봐야 한다. 안 보면 깨진 URI로 **빈 자리**만 그려져
   *   "일시적 로드 실패"와 구별되지 않고, 사용자는 기다리면 나올 줄 안다.
   */
  blobState: 'backed_up' | 'missing' | null;
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
  blob_state: string | null;
}
