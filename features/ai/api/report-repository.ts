/**
 * AI 리포트 저장소 — **서버가 진실이다**(2026-09-15 · `docs/AI_REPORT_SYSTEM.md` §5.7).
 *
 * ~~기기 SQLite `ai_reports` 가 리포트의 진실이고 서버는 사본~~ → **리포트는 서버에만 있다.**
 *   로컬과 서버에 둘 다 두니 앱에서 지워도 재설치하면 되살아났고, 되찾기 동기화·묘비·백업 포함 같은
 *   맞추기 장치가 계속 늘었다. 사용자가 **완전히 서버만**(캐시도 기기에 안 남긴다)을 골랐다.
 *
 * 그래서 이 파일은 SQLite 를 열지 않는다. 받은 목록은 **메모리에만** 들고 있다가 앱이 꺼지면 사라진다.
 * ⚠ 기기의 옛 로컬 리포트 표는 옮기지도 지우지도 않고 **읽지 않는다**(Expand-only).
 *
 * 🔴 **구독 상태를 여기서 보지 않는다.** 조회 라우트는 로그인만 본다. 구독이 끝나도 만든 리포트는
 *   계속 본다(§11.3). 게이팅은 생성 버튼 하나에만 걸린다.
 *
 * 🔴 **대가**: 인터넷이 없거나 로그인이 풀리면 리포트를 못 본다. 화면은 그때 `status` 로 그 사실을 말한다.
 */
import { create } from 'zustand';

import { deleteServerReport, fetchServerReports } from '@/features/ai/api/client';
import { monthKeysInYear, weekKeysInMonth } from '@/features/ai/period';
import { rollupMetrics } from '@/features/ai/rollup';
import type { MetricValue, ReportInsights, ReportKind, TopicValue } from '@/features/ai/types';

export interface Report {
  /** `${kind}:${periodKey}`. 서버 행 id 가 아니다 — 기간마다 최신본 하나를 보여주므로 기간이 곧 이름이다 */
  id: string;
  kind: ReportKind;
  /** `2026-W33` · `2026-08` · `2026`. 표기는 화면이 날짜 범위로 바꾼다 */
  periodKey: string;
  lang: string;
  /** 이 기간에서 가장 눈에 띈 것 한 문장(§8.2). `null` 이 정상값이다(v12 이전) */
  headline: string | null;
  /** 한 줄이 기댄 자료의 키(§8.2.1). 빈 배열이 정상값이다 */
  headlineFrom: string[];
  summary: string;
  /** 위기 신호. 상세 상단 배너의 유일한 조건 */
  concern: boolean;
  /** 요약에 들어간 조각(또는 하위 리포트) 수 */
  sourceCount: number;
  model: string | null;
  promptVer: number | null;
  /**
   * 지표·주제. **`null` 이 정상값이다**(v8 이전).
   * 🔴 월간·연간은 서버에 지표가 없어 **여기서 하위에서 합산한다**(§8.4.1). 전에는 만들 때 합산해 로컬에 저장했다.
   */
  metrics: ReportMetrics | null;
  /** v15 칸(§8.5 · §3.1). `null` 이 정상값이다(v14 이전) */
  insights: ReportInsights | null;
  createdAt: number;
}

/** 지표·주제 묶음 */
export interface ReportMetrics {
  metrics: MetricValue[];
  topics: TopicValue[];
  /** 상위 리포트일 때 **몇 개의 하위에서 합산했나**(§8.4.1). 화면이 반드시 함께 보여준다 */
  from?: number;
}

/** 목록을 받았는가. 화면이 *"왜 비었나"* 를 말할 때 쓴다 */
export type ReportsStatus = 'idle' | 'loading' | 'ready' | 'offline' | 'signed-out';

interface ReportsStoreState {
  status: ReportsStatus;
}

/** 화면이 구독하는 상태. 목록 자체는 아래 모듈 변수에 두고, 화면은 `listReports` 로 꺼낸다 */
export const useReportsStore = create<ReportsStoreState>(() => ({ status: 'idle' }));

interface Cache {
  reports: Report[];
  /** `${kind}:${periodKey}`. 서버 이용 기록 기준이라 **지운 기간도 들어 있다** */
  used: Set<string>;
  dailyLeft: number;
}

let cache: Cache | null = null;
let inflight: Promise<RefreshResult> | null = null;

export type RefreshResult =
  | { ok: true; dailyLeft: number }
  | { ok: false; reason: 'offline' | 'signed-out' };

export function reportIdFor(kind: ReportKind, periodKey: string): string {
  return `${kind}:${periodKey}`;
}

/**
 * 서버에서 목록을 다시 받는다.
 *
 * ⚠ 동시에 여러 화면이 불러도 **요청은 하나**다. 리포트 탭과 홈 카드가 같은 순간에 부른다.
 * ⚠ 실패하면 **이전 목록을 지우지 않는다.** 방금까지 보이던 리포트가 잠깐 끊긴 연결로 사라지면 고장으로 보인다.
 *   처음부터 못 받았으면 빈 목록이고, 화면은 `status` 로 이유를 말한다.
 */
export function refreshReports(): Promise<RefreshResult> {
  if (inflight !== null) return inflight;
  useReportsStore.setState({ status: 'loading' });
  inflight = (async (): Promise<RefreshResult> => {
    const result = await fetchServerReports();
    if (!result.ok) {
      useReportsStore.setState({ status: result.reason });
      return result;
    }
    const weekly: Report[] = [];
    const monthly: Report[] = [];
    const yearly: Report[] = [];
    for (const row of result.list.reports) {
      const created = Date.parse(row.createdAt);
      const report: Report = {
        id: reportIdFor(row.kind, row.periodKey),
        kind: row.kind,
        periodKey: row.periodKey,
        lang: row.lang,
        headline: row.headline ?? null,
        headlineFrom: row.headlineFrom ?? [],
        summary: row.summary,
        concern: row.concern,
        sourceCount: row.sourceCount,
        model: row.model,
        promptVer: row.promptVer,
        metrics:
          row.metrics === undefined && row.topics === undefined
            ? null
            : { metrics: row.metrics ?? [], topics: row.topics ?? [] },
        insights: row.insights ?? null,
        createdAt: Number.isNaN(created) ? 0 : created,
      };
      if (row.kind === 'weekly') weekly.push(report);
      else if (row.kind === 'monthly') monthly.push(report);
      else yearly.push(report);
    }
    // 🔴 상위 지표는 하위에서 합산한다(§8.4.1). 월간을 먼저 채워야 연간이 그 값을 쓴다
    for (const report of monthly) {
      report.metrics = rolledUp(weekly, weekKeysInMonth(report.periodKey)) ?? report.metrics;
    }
    for (const report of yearly) {
      report.metrics = rolledUp(monthly, monthKeysInYear(report.periodKey)) ?? report.metrics;
    }
    const byNewest = (a: Report, b: Report) =>
      a.periodKey < b.periodKey ? 1 : a.periodKey > b.periodKey ? -1 : 0;
    const dailyLeft = Math.max(0, result.list.dailyCap - result.list.dailyUsed);
    cache = {
      reports: [...weekly.sort(byNewest), ...monthly.sort(byNewest), ...yearly.sort(byNewest)],
      used: new Set(result.list.usedPeriods.map((p) => reportIdFor(p.kind, p.periodKey))),
      dailyLeft,
    };
    useReportsStore.setState({ status: 'ready' });
    return { ok: true as const, dailyLeft };
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

function rolledUp(children: Report[], keys: string[]): ReportMetrics | null {
  const wanted = new Set(keys);
  const rows = children
    .filter((child) => wanted.has(child.periodKey))
    .map((child) => child.metrics)
    .filter((metrics): metrics is ReportMetrics => metrics !== null);
  const result = rollupMetrics(rows);
  return result === null ? null : { metrics: result.metrics, topics: result.topics, from: result.from };
}

/** 목록이 한 번도 없으면 받아 온다. 실패해도 던지지 않는다(빈 목록) */
async function ensureLoaded(): Promise<Cache> {
  if (cache === null) {
    await refreshReports();
  }
  return cache ?? { reports: [], used: new Set<string>(), dailyLeft: 0 };
}

/** 종류별 목록. 최신 기간순. ⚠ 월간·연간의 입력이기도 하다 */
export async function listReports(kind: ReportKind): Promise<Report[]> {
  return (await ensureLoaded()).reports.filter((report) => report.kind === kind);
}

/**
 * 이 기간을 **이미 썼는가**. 지운 기간도 참이다(서버 이용 기록 기준).
 * 🔴 *"리포트가 있는가"* 와 다르다 — 지운 기간을 다시 고르게 하면 서버 캡이 막고 화면이 거짓말을 한다(§11.9).
 */
export async function isPeriodUsed(kind: ReportKind, periodKey: string): Promise<boolean> {
  return (await ensureLoaded()).used.has(reportIdFor(kind, periodKey));
}

export async function listUsedPeriodKeys(kind: ReportKind): Promise<string[]> {
  const prefix = `${kind}:`;
  return [...(await ensureLoaded()).used]
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
}

export async function getReport(id: string): Promise<Report | null> {
  const found = (await ensureLoaded()).reports.find((report) => report.id === id);
  if (found !== undefined) return found;
  // 방금 만든 것이 아직 목록에 없을 수 있다. 한 번만 다시 받는다
  await refreshReports();
  return cache?.reports.find((report) => report.id === id) ?? null;
}

/** 살아 있는 리포트만 찾는다. *"썼는가"* 는 `isPeriodUsed` 가 답한다 */
export async function findByPeriod(kind: ReportKind, periodKey: string): Promise<Report | null> {
  return getReport(reportIdFor(kind, periodKey));
}

export async function hasAnyReport(): Promise<boolean> {
  return (await ensureLoaded()).reports.length > 0;
}

/**
 * 서버에서 지운다. 성공하면 목록에서도 뺀다.
 * ⚠ 쓴 기간 표시(`used`)는 남긴다 — 서버의 이용 기록이 남기 때문이다.
 * @returns 지웠으면 true. 연결이 없으면 false 이고 화면이 그 사실을 말한다
 */
export async function deleteReport(id: string): Promise<boolean> {
  const at = id.indexOf(':');
  if (at < 0) return false;
  const kind = id.slice(0, at) as ReportKind;
  const periodKey = id.slice(at + 1);
  const done = await deleteServerReport(kind, periodKey);
  if (done && cache !== null) {
    cache = { ...cache, reports: cache.reports.filter((report) => report.id !== id) };
  }
  return done;
}
