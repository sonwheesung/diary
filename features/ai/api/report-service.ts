import * as Crypto from 'expo-crypto';

import { listDiariesBetween } from '@/features/diary/api/diary-repository';
import { findByPeriod, listReports, saveReport } from '@/features/ai/api/report-repository';
import { requestReport, type AiFail } from '@/features/ai/api/client';
import {
  keyRange,
  lastMonthKey,
  lastWeekKey,
  lastYearKey,
  missingDays,
  monthKeyRange,
  yearKeyRange,
} from '@/features/ai/period';
import { hasBody } from '@/features/ai/prompt';
import type { ReportKind } from '@/features/ai/types';
import { SETTING_KEYS, getSetting } from '@/features/settings/api/settings-store';
import { i18next } from '@/lib/i18n';

/**
 * 리포트 생성 — 기간 정하기 · 입력 모으기 · 서버 호출 · 로컬 저장.
 *
 * **계층 요약이다**(2026-08-12 사용자 재확인): 월간은 그 달의 **주간 리포트만**, 연간은 그 해의
 * **월간 리포트만** 입력으로 받는다. 원본을 통째로 재투입하지 않는다 — 비용과 품질 둘 다에서 진다.
 * 그래서 입력이 없으면 만들지 않고 *"먼저 주간 리포트를 만들어 주세요"* 로 돌려준다.
 *
 * 🔴 **여기서 흐르는 것은 일기 평문이다.** 어떤 실패 경로에서도 `entries`를 로그·에러 객체에
 *   싣지 않는다(CLAUDE.md §5.1-5). 이 파일에 `console.*`이 하나도 없는 것은 실수가 아니다.
 */

/** 생성 실패 사유 — 서버 사유에 앱에서만 나는 두 가지를 더한다 */
export type CreateFail = AiFail | 'exists' | 'need-weekly' | 'need-monthly';

export type CreateResult =
  | { ok: true; reportId: string }
  | { ok: false; reason: CreateFail; retryAt?: number };

/** 그 종류가 지금 겨냥하는 기간. **항상 닫힌 기간이다** — 진행 중인 주·달·해는 요약하지 않는다 */
export function targetPeriodKey(kind: ReportKind, now: Date = new Date()): string {
  if (kind === 'weekly') return lastWeekKey(now);
  if (kind === 'monthly') return lastMonthKey(now);
  return lastYearKey(now);
}

/** 사용자가 따로 고른 리포트 언어. 없으면 앱 언어를 따른다(§6.2) */
async function reportLanguage(): Promise<string> {
  const chosen = await getSetting(SETTING_KEYS.aiReportLanguage).catch(() => null);
  /*
   * ⚠ 빈 문자열도 "안 고름"이다. `setSetting(key, '')`이 이 저장소의 삭제 관용구라
   *   `null`만 보면 한 번 골랐다가 되돌린 사람이 영영 빈 언어로 요청하게 된다.
   */
  // 화면에 실제로 걸린 언어를 쓴다. 설정값(`system`)이 아니라 **해석된 결과**여야 한다
  return chosen === null || chosen.length === 0 ? i18next.language : chosen;
}

/** 그 달에 속하는 주간 리포트들. 주가 달을 넘으면 **월요일이 든 달**에 센다 */
function weeksInMonth(
  weekly: { periodKey: string; summary: string }[],
  monthKeyValue: string,
): { periodKey: string; summary: string }[] {
  return weekly.filter((report) => {
    const range = keyRange(report.periodKey);
    return range !== null && range.from.startsWith(monthKeyValue);
  });
}

export async function createReport(
  kind: ReportKind,
  now: Date = new Date(),
): Promise<CreateResult> {
  const periodKey = targetPeriodKey(kind, now);

  // 1차 방어. 서버 캡에 도달하기 전에 앱이 먼저 막는다 — 있는 걸 또 만들 이유가 없다
  if ((await findByPeriod(kind, periodKey)) !== null) {
    return { ok: false, reason: 'exists' };
  }

  const lang = await reportLanguage();
  let entries: { date: string; emotion: string | null; title: string | null; text: string }[] = [];
  let subReports: { periodKey: string; summary: string }[] = [];

  if (kind === 'weekly') {
    const range = keyRange(periodKey);
    if (range === null) return { ok: false, reason: 'error' };
    const diaries = await listDiariesBetween(range.from, range.to);
    /*
     * 🔴 **본문이 없는 조각은 아예 보내지 않는다**(§10.2). 사진만·제목만 있는 조각은
     *   프롬프트에 날짜 헤더만 남겨 모델이 없는 일을 지어내게 만든다.
     *   `withBody`가 서버에서도 같은 필터를 걸지만, 여기서 거르면 **평문이 애초에
     *   기기를 안 떠난다** — 나갈 이유가 없는 것은 안 내보낸다(CLAUDE.md §5.1-3).
     */
    entries = diaries
      .filter((diary) => hasBody(diary.plainText))
      .map((diary) => ({
        date: diary.entryDate,
        emotion: diary.emotion,
        title: diary.title,
        // 블록 JSON이 아니라 파생 평문을 보낸다 — JSON을 보내면 구조 문자열이 요약에 섞인다
        text: diary.plainText,
      }));
    if (entries.length === 0) return { ok: false, reason: 'empty' };
  } else if (kind === 'monthly') {
    const weekly = await listReports('weekly');
    subReports = weeksInMonth(weekly, periodKey);
    if (subReports.length === 0) return { ok: false, reason: 'need-weekly' };
  } else {
    const monthly = await listReports('monthly');
    subReports = monthly.filter((report) => report.periodKey.startsWith(`${periodKey}-`));
    if (subReports.length === 0) return { ok: false, reason: 'need-monthly' };
  }

  /*
   * 멱등 키를 **호출 전에** 만든다. 서버가 진행 중인 키를 기억해 **동시 중복 요청**을 막는다.
   *
   * ⚠ **재시도까지 막지는 못한다.** 이 함수가 불릴 때마다 새 UUID가 나오고 요청 전에
   *   저장하지 않으므로, 같은 키가 두 번 가는 일이 없다 — 한때 주석이 그렇게 주장했는데
   *   사실이 아니었다(2026-08-17 정정).
   * ⏭ 진짜 재시도 멱등·응답 회수를 하려면 **여기서 키를 먼저 로컬에 남겨야** 한다.
   *   서버는 이미 `ai_reports`에 90일 보관하므로 남은 것은 앱의 pending 저장과 조회 라우트다.
   */
  const reportId = Crypto.randomUUID();
  const response = await requestReport({
    reportId,
    kind,
    periodKey,
    lang,
    entries,
    subReports: subReports.map((r) => ({ periodKey: r.periodKey, summary: r.summary })),
  });

  if (!response.ok) {
    // `retryAt`은 `cooling-down`에만 실려 온다. 그대로 흘려보낸다 — 화면이 시각을 말한다
    return { ok: false, reason: response.reason, ...(response.retryAt !== undefined && { retryAt: response.retryAt }) };
  }

  await saveReport({
    id: reportId,
    kind,
    periodKey,
    lang,
    summary: response.summary,
    concern: response.concern,
    // 무엇을 보고 쓴 요약인지. 목록의 부제로 쓰고, 문의가 왔을 때 재현의 단서가 된다
    sourceCount: kind === 'weekly' ? entries.length : subReports.length,
    model: response.model,
    promptVer: response.promptVer,
    createdAt: Date.now(),
  });

  return { ok: true, reportId };
}

/**
 * 이 종류를 지금 만들 수 있는가 — **버튼을 누르기 전에** 답한다.
 *
 * 누른 뒤에 *"주간 리포트가 먼저 필요해요"* 를 알게 하지 않는다(§6.3). 서버를 부르지 않으므로
 * 화면이 열릴 때마다 불러도 공짜다.
 */
export async function canCreate(
  kind: ReportKind,
  now: Date = new Date(),
): Promise<{ ok: true } | { ok: false; reason: CreateFail }> {
  const periodKey = targetPeriodKey(kind, now);
  if ((await findByPeriod(kind, periodKey)) !== null) {
    return { ok: false, reason: 'exists' };
  }
  if (kind === 'weekly') {
    const range = keyRange(periodKey);
    if (range === null) return { ok: false, reason: 'error' };
    const diaries = await listDiariesBetween(range.from, range.to);
    // ⚠ 개수가 아니라 본문을 센다 — `createReport`와 같은 규칙이어야 버튼과 결과가 안 어긋난다
    return diaries.some((diary) => hasBody(diary.plainText))
      ? { ok: true }
      : { ok: false, reason: 'empty' };
  }
  if (kind === 'monthly') {
    const weekly = await listReports('weekly');
    return weeksInMonth(weekly, periodKey).length === 0
      ? { ok: false, reason: 'need-weekly' }
      : { ok: true };
  }
  const monthly = await listReports('monthly');
  return monthly.some((r) => r.periodKey.startsWith(`${periodKey}-`))
    ? { ok: true }
    : { ok: false, reason: 'need-monthly' };
}

/**
 * 지난주에서 **조각이 없는 날들** (`YYYY-MM-DD`, 월→일 순).
 *
 * 주간은 주 1회 캡이고 재생성이 없다(§5). 그래서 *"1개뿐인 줄 모르고 눌렀다"* 가 그 주를
 * 통째로 잃는 것이 된다 — 만들기 전에 이 목록을 보여주고 한 번 묻는다(§10.1).
 *
 * ⚠ **주간에만 쓴다.** 월간·연간은 하위 리포트를 입력으로 받으므로 "빠진 날"이라는 개념이
 *   없고, 빠진 입력은 `need-weekly`·`need-monthly`가 이미 막는다.
 *
 * ⚠ 빈 배열은 두 가지 뜻이다 — 7일 다 썼거나, 키가 깨졌거나. 후자는 `canCreate`가
 *   `error`로 이미 막으므로 여기서는 "묻지 않는다"로 수렴해도 안전하다.
 */
export async function weeklyGaps(now: Date = new Date()): Promise<string[]> {
  const range = keyRange(targetPeriodKey('weekly', now));
  if (range === null) return [];
  const diaries = await listDiariesBetween(range.from, range.to);
  // ⚠ **본문이 있는 날만 "쓴 날"이다**(§10.2). 사진만·제목만 있는 날은 빠진 날에 들어간다
  return missingDays(
    range,
    diaries.filter((diary) => hasBody(diary.plainText)).map((diary) => diary.entryDate),
  );
}

/** 기간 키를 화면이 쓸 범위로. 세 종류를 한 곳에서 편다 */
export function periodRange(kind: ReportKind, periodKey: string) {
  if (kind === 'monthly') return monthKeyRange(periodKey);
  if (kind === 'yearly') return yearKeyRange(periodKey);
  return keyRange(periodKey);
}
