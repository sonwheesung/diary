/**
 * AI 리포트 저장소.
 *
 * 🔴 **구독 상태를 여기서 보지 않는다.** 만료가 기록을 뺏는 경로를 만들지 않기 위해서다 —
 *   목록·상세·삭제는 구독과 무관하고, 게이팅은 **생성 버튼 하나에만** 걸린다
 *   (`docs/AI_REPORT_SYSTEM.md` §11.3). 저장소가 구독을 알면 그 규칙이 두 곳으로 갈라진다.
 */
import { getDatabase } from '@/db/client';
import type { MetricValue, ReportKind, TopicValue } from '@/features/ai/types';

/**
 * 🔴 **묘비를 뺀다** (`docs/AI_REPORT_SYSTEM.md` §11.9). `diaries`의 `ALIVE`와 같은 규약.
 *
 * 삭제는 행을 지우지 않고 `summary`를 비운 뒤 `deleted_at`을 찍는다. 그래야 서버의
 * `uq_ai_usage_period`(기간을 영구히 센다)와 로컬이 어긋나지 않는다 — 어긋나면 지운 기간을
 * 다시 고를 수 있게 보이고, 서버가 막고, 화면은 *"이미 있어요"* 라고 거짓말한다.
 *
 * ⚠ **어디에 붙이고 어디에 안 붙이는지가 이 파일의 전부다:**
 *   · 붙인다 — 목록·상세·개수. 그리고 **월간·연간의 입력**(본문이 없으니 당연하다)
 *   · 안 붙인다 — `findByPeriod`. *"이 기간을 썼는가"* 는 묘비도 참이어야 한다
 */
const ALIVE = 'deleted_at IS NULL';

export interface Report {
  id: string;
  kind: ReportKind;
  /** `2026-W33` · `2026-08` · `2026`. 표기는 화면이 날짜 범위로 바꾼다 */
  periodKey: string;
  lang: string;
  summary: string;
  /** 위기 신호. 상세 상단 배너의 유일한 조건 */
  concern: boolean;
  /** 요약에 들어간 조각(또는 하위 리포트) 수 */
  sourceCount: number;
  model: string | null;
  promptVer: number | null;
  /**
   * 지표·주제. **`null`이 정상값이다** — 프롬프트 v8 이전 리포트에는 없고,
   * 캡이 평생 1번이라 **영원히 안 생긴다**(§8.4). 화면은 그때 지표 블록을 안 그린다.
   */
  metrics: ReportMetrics | null;
  createdAt: number;
}

/** `ai_reports.metrics` 안의 모양. 컬럼 하나에 JSON으로 들어간다(DB v7) */
export interface ReportMetrics {
  metrics: MetricValue[];
  topics: TopicValue[];
}

interface Row {
  id: string;
  kind: string;
  period_key: string;
  lang: string;
  summary: string;
  concern: number;
  source_count: number;
  model: string | null;
  prompt_ver: number | null;
  metrics: string | null;
  created_at: number;
}

/**
 * 지표 JSON을 읽는다. **깨져 있으면 `null`로 떨어진다** — 리포트 본문은 그것과 무관하게 온전하고,
 * 화면은 지표 블록만 안 그린다. 지표 하나 때문에 리포트를 못 열게 만들지 않는다.
 */
function parseMetrics(raw: string | null): ReportMetrics | null {
  if (raw === null || raw.length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const box = parsed as { metrics?: unknown; topics?: unknown };
    return {
      metrics: Array.isArray(box.metrics) ? (box.metrics as MetricValue[]) : [],
      topics: Array.isArray(box.topics) ? (box.topics as TopicValue[]) : [],
    };
  } catch {
    return null;
  }
}

const toReport = (r: Row): Report => ({
  id: r.id,
  kind: r.kind as ReportKind,
  periodKey: r.period_key,
  lang: r.lang,
  summary: r.summary,
  // SQLite에는 boolean이 없다. 0|1을 여기서 한 번만 바꾼다
  concern: r.concern === 1,
  sourceCount: r.source_count,
  model: r.model,
  promptVer: r.prompt_ver,
  metrics: parseMetrics(r.metrics),
  createdAt: r.created_at,
});

/**
 * 종류별 목록. 최신순.
 *
 * ⚠ **월간·연간의 입력이기도 하다**(`report-service`의 `weeksInMonth`). 그래서 묘비가
 *   여기서 빠지는 것이 곧 *"본문 없는 리포트는 상위 요약에 안 들어간다"* 가 된다.
 */
export async function listReports(kind: ReportKind): Promise<Report[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, metrics, created_at
       FROM ai_reports
      WHERE kind = ? AND ${ALIVE}
      ORDER BY period_key DESC`,
    kind,
  );
  return rows.map(toReport);
}

/**
 * 🔴 **이 종류로 이미 써버린 기간 키들** — 묘비를 **포함한다**(§11.9).
 *
 * 기간 시트의 *"이미 만들었어요"* 가 이걸 본다. `listReports()`를 쓰면 지운 기간이
 * 다시 고를 수 있게 보이고, 눌러야 서버가 막는다 — 실패를 설명하는 대신 없애는 것이 규약이다.
 */
export async function listUsedPeriodKeys(kind: ReportKind): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ period_key: string }>(
    'SELECT period_key FROM ai_reports WHERE kind = ?',
    kind,
  );
  return rows.map((row) => row.period_key);
}

export async function getReport(id: string): Promise<Report | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, metrics, created_at
       FROM ai_reports WHERE id = ? AND ${ALIVE}`,
    id,
  );
  return row === null ? null : toReport(row);
}

/**
 * 이 기간의 리포트가 이미 있는가. 생성 버튼의 1차 방어.
 *
 * 🔴 **`ALIVE`를 붙이지 않는다**(§11.9). 지운 리포트도 서버 캡을 이미 소모했으므로
 *   *"있다"* 가 맞다. 붙이면 지운 뒤 다시 만들 수 있는 것처럼 보이고 서버에서 실패한다.
 */
export async function findByPeriod(kind: ReportKind, periodKey: string): Promise<Report | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, metrics, created_at
       FROM ai_reports WHERE kind = ? AND period_key = ?`,
    kind,
    periodKey,
  );
  return row === null ? null : toReport(row);
}

/** 리포트가 하나라도 있는가. 무료 사용자에게 예시를 보일지 목록을 보일지의 기준(§11.3) */
export async function hasAnyReport(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT count(*) as n FROM ai_reports WHERE ${ALIVE}`,
  );
  return (row?.n ?? 0) > 0;
}

export async function saveReport(report: Report): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO ai_reports
       (id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, metrics, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    report.id,
    report.kind,
    report.periodKey,
    report.lang,
    report.summary,
    report.concern ? 1 : 0,
    report.sourceCount,
    report.model,
    report.promptVer,
    // 지표가 없는 리포트가 정상이다(v8 이전). 그때는 컬럼이 NULL로 남는다
    report.metrics === null ? null : JSON.stringify(report.metrics),
    report.createdAt,
  );
}

/**
 * 삭제 — **묘비를 남긴다**(§11.9). 삭제는 **사용자만** 한다(구독 만료로 부르는 경로는 없다).
 *
 * 🔴 `summary`를 **반드시 함께 비운다.** `deleted_at`만 찍으면 사용자가 지우려던 글이
 *   기기에 그대로 남는다 — 감정 일기에서 그건 삭제가 아니다. 화면에서 안 보이는 것과
 *   기기에서 없는 것은 다르다.
 *
 * ⚠ `concern`도 내린다. 위기 배너의 유일한 조건이라, 본문 없는 묘비가 어딘가에서
 *   배너를 켜는 경로를 남기지 않는다.
 */
export async function deleteReport(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    /*
     * 🔴 `metrics`도 **함께 비운다.** `summary`만 지우면 지운 리포트의 지표 그림이 남는다 —
     *   지표는 일기에서 뽑은 것이라 그것도 사용자가 지우려던 것이다(§8.4).
     */
    `UPDATE ai_reports SET summary = '', concern = 0, metrics = NULL, deleted_at = ? WHERE id = ?`,
    Date.now(),
    id,
  );
}
