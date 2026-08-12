/**
 * AI 리포트 저장소.
 *
 * 🔴 **구독 상태를 여기서 보지 않는다.** 만료가 기록을 뺏는 경로를 만들지 않기 위해서다 —
 *   목록·상세·삭제는 구독과 무관하고, 게이팅은 **생성 버튼 하나에만** 걸린다
 *   (`docs/AI_REPORT_SYSTEM.md` §11.3). 저장소가 구독을 알면 그 규칙이 두 곳으로 갈라진다.
 */
import { getDatabase } from '@/db/client';
import type { ReportKind } from '@/features/ai/types';

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
  createdAt: number;
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
  created_at: number;
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
  createdAt: r.created_at,
});

/** 종류별 목록. 최신순 */
export async function listReports(kind: ReportKind): Promise<Report[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, created_at
       FROM ai_reports
      WHERE kind = ?
      ORDER BY period_key DESC`,
    kind,
  );
  return rows.map(toReport);
}

export async function getReport(id: string): Promise<Report | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, created_at
       FROM ai_reports WHERE id = ?`,
    id,
  );
  return row === null ? null : toReport(row);
}

/** 이 기간의 리포트가 이미 있는가. 생성 버튼의 1차 방어 */
export async function findByPeriod(kind: ReportKind, periodKey: string): Promise<Report | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, created_at
       FROM ai_reports WHERE kind = ? AND period_key = ?`,
    kind,
    periodKey,
  );
  return row === null ? null : toReport(row);
}

/** 리포트가 하나라도 있는가. 무료 사용자에게 예시를 보일지 목록을 보일지의 기준(§11.3) */
export async function hasAnyReport(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ n: number }>('SELECT count(*) as n FROM ai_reports');
  return (row?.n ?? 0) > 0;
}

export async function saveReport(report: Report): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO ai_reports
       (id, kind, period_key, lang, summary, concern, source_count, model, prompt_ver, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    report.id,
    report.kind,
    report.periodKey,
    report.lang,
    report.summary,
    report.concern ? 1 : 0,
    report.sourceCount,
    report.model,
    report.promptVer,
    report.createdAt,
  );
}

/** 삭제는 **사용자만** 한다. 구독 만료로 부르는 경로를 만들지 않는다 */
export async function deleteReport(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM ai_reports WHERE id = ?', id);
}
