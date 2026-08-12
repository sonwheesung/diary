/**
 * 매니페스트 — 백업에 실리는 것의 정본 스키마.
 *
 * ⚠ **프로젝트 내부 임포트 0.** Node에서 그대로 검증한다.
 *
 * ## 앱의 `Diary` 타입을 쓰지 않는다
 *
 * 그건 **뷰**다 — 블록이 파싱돼 있고, 태그가 조인돼 있고, 묘비가 빠져 있다.
 * 백업은 **원본 행**이어야 한다. 뷰를 실으면 세 가지가 조용히 사라진다:
 *   ① 모르는 블록 타입 (`filter(isDiaryBlock)`이 걸러낸다)
 *   ② 지운 조각의 묘비
 *   ③ 태그의 원래 순서 (`tags.created_at`)
 *
 * ## 왜 파트마다 완결된 JSON인가
 *
 * 큰 JSON 하나를 바이트로 잘라 나누면 **읽는 쪽이 전부 이어붙인 뒤에야 파싱**할 수 있어
 * 힙 정점이 그대로다 — 나누는 이유(저사양 기기 OOM)가 사라진다. 그래서 파트마다
 * 행을 나눠 담은 **독립 문서**로 만든다. 읽는 쪽은 배열을 이어붙이기만 하면 된다.
 */

/**
 * 매니페스트 페이로드 형식 버전. 봉투의 `version`(암호 형식)과 **다른 축**이다.
 *
 * ~~1~~ → **2**(2026-08-12): `reports`를 추가했다.
 *
 * ⚠ 옛 앱이 v2 매니페스트를 복원하면 `reports`를 모르고 버린다. 그건 `dbVersion`이
 *   알려주므로 **조용한 손실이 아니다** — 매니페스트 규약이 그렇게 설계돼 있다.
 *   반대로 새 앱이 v1을 복원하면 `reports`가 없을 뿐이고, 그때는 빈 배열로 읽는다.
 */
export const MANIFEST_FORMAT = 2;

/** `diaries` 원본 행. 컬럼 이름을 그대로 쓴다 — 매핑 층을 하나 없앤다 */
export interface DiaryRow {
  id: string;
  entry_date: string;
  title: string | null;
  /**
   * 파생 평문. **파생인데도 싣는다** — `content_blocks`가 깨졌을 때의 유일한 중복성이다.
   * 안 실으면 `parseBlocks`가 빈 배열을 돌려주고 `content`가 ''이 되어,
   * 날짜만 있고 본문이 없는 조각이 남는다(사용자에게는 사라진 것과 구별되지 않는다).
   */
  content: string;
  /**
   * 블록 JSON **문자열 그대로**. 파싱하거나 정규화하지 않는다 —
   * 이 앱이 모르는 블록 타입이 있어도 다음 버전이 읽을 수 있어야 한다.
   */
  content_blocks: string | null;
  emotion: string | null;
  created_at: number;
  updated_at: number;
  /** 묘비. `null`이 아니면 지워진 조각이다 */
  deleted_at: number | null;
}

export interface ImageRow {
  id: string;
  diary_id: string;
  file_name: string;
  width: number | null;
  height: number | null;
  created_at: number;
  deleted_at: number | null;
}

export interface TagRow {
  id: string;
  name: string;
  /**
   * ⚠ **태그 표시 순서의 유일한 출처다** (`ORDER BY t.created_at ASC`).
   * 안 실으면 복원 후 모든 조각의 태그 순서가 조용히 뒤바뀐다.
   */
  created_at: number;
}

export interface DiaryTagRow {
  diary_id: string;
  tag_id: string;
}

/**
 * `ai_reports` 원본 행.
 *
 * 🔴 **리포트를 백업에 싣는 이유**: 본문이 로컬에만 있어서, 기기를 잃으면 그대로 사라진다.
 *   조각과 똑같이 사용자의 기록이고 다시 만들 수 없다 — 같은 입력으로도 생성 결과가 다르다.
 *
 * ⚠ 요약에는 일기 내용이 녹아 있으므로 **당연히 암호화되어 나간다.** 서버는 못 읽는다.
 *   그래서 매니페스트에 함께 싣는 것으로 충분하고, `ENVELOPE_TYPE.aiReport = 2`는
 *   예약으로 남겨둔다(별도 객체로 뺄 이유가 없다).
 */
export interface ReportRow {
  id: string;
  kind: string;
  period_key: string;
  lang: string;
  summary: string;
  /** SQLite에는 boolean이 없다. 0 | 1 */
  concern: number;
  source_count: number;
  model: string | null;
  prompt_ver: number | null;
  created_at: number;
}

/** 파트 하나 = 완결된 JSON 문서 */
export interface ManifestPart {
  /** 페이로드 형식 */
  v: number;
  /**
   * 이 백업을 만든 기기의 `PRAGMA user_version`.
   *
   * ⚠ 봉투의 `version`은 **암호 형식**이라 스키마를 말해주지 않는다. 이게 없으면
   *   새 앱이 만든 백업을 옛 앱이 복원할 때 모르는 컬럼을 조용히 버리거나,
   *   없는 컬럼에 INSERT하다 raw SQL 오류로 죽는다 — 그것도 전부 받아 복호화한 뒤에.
   */
  dbVersion: number;
  diaries: DiaryRow[];
  images: ImageRow[];
  tags: TagRow[];
  diaryTags: DiaryTagRow[];
  /** ⚠ v1 매니페스트에는 없다. 읽을 때 `?? []`로 받는다 */
  reports: ReportRow[];
}

/** 여러 파트를 합친 결과 */
export interface Manifest {
  dbVersion: number;
  diaries: DiaryRow[];
  images: ImageRow[];
  tags: TagRow[];
  diaryTags: DiaryTagRow[];
  /** ⚠ v1 매니페스트에는 없다. 읽을 때 `?? []`로 받는다 */
  reports: ReportRow[];
}

export class ManifestError extends Error {
  /** ⚠ parameter property는 Node 타입 스트리핑이 못 지운다 */
  readonly code: string;

  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'ManifestError';
    this.code = code;
  }
}

/** UTF-8 인코딩. `TextEncoder`를 쓰지 않는다 — 순수 계층은 임포트 0을 지킨다 */
export function encodeUtf8(text: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i);
    // 서러게이트 쌍을 코드포인트로 되돌린다(이모지·일부 한자)
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return Uint8Array.from(out);
}

/** UTF-8 디코딩 */
export function decodeUtf8(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    let code: number;
    if (b < 0x80) {
      code = b;
      i += 1;
    } else if ((b & 0xe0) === 0xc0) {
      code = ((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
      i += 2;
    } else if ((b & 0xf0) === 0xe0) {
      code = ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f);
      i += 3;
    } else {
      code =
        ((b & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      i += 4;
    }
    if (code > 0xffff) {
      const c = code - 0x10000;
      out += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 0x3ff));
    } else {
      out += String.fromCharCode(code);
    }
  }
  return out;
}

/**
 * 행 전체를 파트로 나눈다. 각 파트는 **독립 파싱 가능한** JSON 바이트다.
 *
 * `maxBytes`는 목표치이지 상한이 아니다 — 조각 하나가 그보다 크면 그 파트는 넘친다.
 * 한 행을 두 파트에 걸치게 나누지 않는다(그러면 독립 파싱이 깨진다).
 */
export function splitManifest(manifest: Manifest, maxBytes: number): Uint8Array[] {
  const parts: Uint8Array[] = [];
  const meta = { v: MANIFEST_FORMAT, dbVersion: manifest.dbVersion };

  // 조각을 기준으로 페이징하고, 나머지 테이블은 첫 파트에 싣는다.
  // 조각 수가 압도적으로 많고 나머지는 작다 — 태그 수천 개짜리 사용자는 없다.
  let index = 0;
  let first = true;
  while (index < manifest.diaries.length || first) {
    const part: ManifestPart = {
      ...meta,
      diaries: [],
      images: first ? manifest.images : [],
      tags: first ? manifest.tags : [],
      diaryTags: first ? manifest.diaryTags : [],
      // 리포트도 첫 파트에 싣는다 — 주당 하나라 1년 써야 52개다. 페이징할 크기가 아니다
      reports: first ? manifest.reports : [],
    };
    let bytes = encodeUtf8(JSON.stringify(part)).length;

    while (index < manifest.diaries.length) {
      const row = manifest.diaries[index];
      const rowBytes = encodeUtf8(JSON.stringify(row)).length + 1;
      // 파트가 비어 있으면 크기와 무관하게 하나는 넣는다 — 안 그러면 무한 루프다
      if (part.diaries.length > 0 && bytes + rowBytes > maxBytes) {
        break;
      }
      part.diaries.push(row);
      bytes += rowBytes;
      index += 1;
    }

    parts.push(encodeUtf8(JSON.stringify(part)));
    first = false;
  }
  return parts;
}

/**
 * 파트들을 하나로 합친다. 파트 **순서대로** 넘겨야 한다
 * (봉투의 `part` 번호로 정렬한 뒤 부른다 — 완결성 검사는 `assertCompleteGeneration`이 한다).
 */
export function joinManifest(parts: readonly Uint8Array[]): Manifest {
  if (parts.length === 0) {
    throw new ManifestError('JGKB-M01', '매니페스트 파트가 없다');
  }

  const merged: Manifest = {
    dbVersion: 0,
    diaries: [],
    images: [],
    tags: [],
    diaryTags: [],
    reports: [],
  };
  let formatSeen: number | null = null;

  for (const bytes of parts) {
    let part: ManifestPart;
    try {
      part = JSON.parse(decodeUtf8(bytes)) as ManifestPart;
    } catch {
      throw new ManifestError('JGKB-M02', '매니페스트를 읽을 수 없다 (JSON 파싱 실패)');
    }
    if (formatSeen === null) {
      formatSeen = part.v;
      merged.dbVersion = part.dbVersion;
    } else if (part.v !== formatSeen || part.dbVersion !== merged.dbVersion) {
      throw new ManifestError('JGKB-M03', '파트마다 형식·스키마 버전이 다르다');
    }
    merged.diaries.push(...(part.diaries ?? []));
    merged.images.push(...(part.images ?? []));
    merged.tags.push(...(part.tags ?? []));
    merged.diaryTags.push(...(part.diaryTags ?? []));
    // ⚠ v1에는 없는 필드다. `?? []`가 그 호환을 담당한다
    merged.reports.push(...(part.reports ?? []));
  }

  /*
   * ⚠ **옛 형식은 받고, 새 형식만 거부한다.**
   *
   * ~~`formatSeen !== MANIFEST_FORMAT`~~ → `formatSeen > MANIFEST_FORMAT` (2026-08-12 정정).
   *
   * 🔴 엄격 일치로 두면 형식을 올리는 순간 **이미 만들어진 백업이 전부 복원 불가**가 된다.
   *   v1 → v2는 `reports`를 더한 것뿐이라 옛 백업을 읽는 데 아무 문제가 없다 — 없는 필드는
   *   위에서 빈 배열로 받는다. 형식 상승은 앞으로도 이렇게 **덧붙이기만** 한다.
   *
   * 반대로 **더 새 형식은 여전히 거부한다.** 조용히 모르는 필드를 버리면 사용자는 복원이
   * 성공했다고 믿고, 그 상태로 다음 백업을 눌러 잘린 데이터를 새 정본으로 만든다.
   */
  if (formatSeen === null || formatSeen > MANIFEST_FORMAT) {
    throw new ManifestError('JGKB-M04', `모르는 매니페스트 형식 v${formatSeen}`);
  }
  return merged;
}

/**
 * 이 앱이 읽을 수 있는 백업인가.
 *
 * ⚠ **더 새 스키마는 거부한다.** 조용히 컬럼을 버리면 사용자는 복원이 성공했다고 믿고,
 *   그 상태로 다음 백업을 눌러 **잘린 데이터를 새 정본으로 만든다.**
 *   "앱을 업데이트하세요"가 반쯤 복원하는 것보다 낫다.
 */
export function assertReadable(manifest: Manifest, localDbVersion: number): void {
  if (manifest.dbVersion > localDbVersion) {
    throw new ManifestError(
      'JGKB-M05',
      `더 새 버전의 앱에서 만든 백업이다 (백업 v${manifest.dbVersion} > 이 앱 v${localDbVersion})`,
    );
  }
}

/**
 * 살아 있는 조각 id 집합. **복원 확인 화면의 차집합 계산에 쓴다.**
 *
 * ⚠ 묘비를 빼는 것이 핵심이다. 묘비 id를 포함하면 "A 기기에서 지운 조각"이
 *   B 기기에서 "백업에 있음"으로 판정돼 **경고 없이 사라진다** —
 *   확인 화면이 막으려던 바로 그 손실이다.
 */
export function aliveDiaryIds(manifest: Manifest): Set<string> {
  const ids = new Set<string>();
  for (const row of manifest.diaries) {
    if (row.deleted_at === null) {
      ids.add(row.id);
    }
  }
  return ids;
}
