import * as Crypto from 'expo-crypto';

import { listDiariesBetween, listEntryTexts } from '@/features/diary/api/diary-repository';
import {
  findByPeriod,
  listReports,
  listUsedPeriodKeys,
  saveReport,
} from '@/features/ai/api/report-repository';
import { requestReport, type AiFail } from '@/features/ai/api/client';
import {
  creatableMonthKeys,
  creatableWeekKeys,
  creatableYearKeys,
  isClosed,
  isCreatablePeriod,
  keyRange,
  lastMonthKey,
  lastWeekKey,
  lastYearKey,
  missingDays,
  monthKeyRange,
  monthKeysInYear,
  opensOn,
  weekKeyForYmd,
  weekKeysInMonth,
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

/**
 * 생성 실패 사유 — 서버 사유에 **앱에서만 나는 것들**을 더한다.
 *
 * `too-early`·`out-of-range`는 백필(§6.4)과 함께 들어왔다. 둘 다 서버에 갈 이유가 없다 —
 * 기간이 열려 있는지는 달력만 보면 아는 것이라 앱이 먼저 답한다.
 */
export type CreateFail =
  | AiFail
  | 'exists'
  | 'need-weekly'
  | 'need-monthly'
  /** 하위 기간이 아직 안 끝났다 — 지금 만들면 그 기간이 빠진 채로 굳는다(§6.5) */
  | 'too-early';

export type CreateResult =
  | { ok: true; reportId: string }
  | { ok: false; reason: CreateFail; retryAt?: number };

/**
 * 그 종류의 **기본 선택 기간**. 항상 닫힌 기간이다 — 진행 중인 주·달·해는 요약하지 않는다.
 *
 * ⚠ 백필이 생긴 뒤로 이건 *"만들 수 있는 유일한 기간"* 이 아니라 **기본값**이다(§6.4).
 *   화면은 이 값으로 열리고, 사용자가 고르면 그 값이 대신 들어간다 — 1탭 경로는 그대로다.
 */
export function targetPeriodKey(kind: ReportKind, now: Date = new Date()): string {
  if (kind === 'weekly') return lastWeekKey(now);
  if (kind === 'monthly') return lastMonthKey(now);
  return lastYearKey(now);
}

/**
 * 만들 수 있는 기간들 — **최신 순.** 기간 선택 시트가 이걸 그대로 그린다(§6.4).
 *
 * 바닥은 `backfillFloor()`(작년 1월 1일)이고 위는 마지막으로 **끝난** 기간이다.
 * 첫 항목이 곧 `targetPeriodKey()`이므로 시트의 기본 선택은 언제나 목록의 맨 위다.
 */
export function creatablePeriods(kind: ReportKind, now: Date = new Date()): string[] {
  if (kind === 'weekly') return creatableWeekKeys(now);
  if (kind === 'monthly') return creatableMonthKeys(now);
  return creatableYearKeys(now);
}

/**
 * 그 기간의 **하위 기간 키들** — 월간은 그 달의 주, 연간은 그 해의 달.
 *
 * 🔴 `weeksInMonth()`가 실제 입력을 고를 때 쓰는 규칙(월요일이 든 달)과 **같아야 한다.**
 *   어긋나면 *"5개 중 2개"* 라고 경고해 놓고 3개를 넣는 식이 된다.
 */
function subPeriodKeys(kind: ReportKind, periodKey: string): string[] {
  if (kind === 'monthly') return weekKeysInMonth(periodKey);
  if (kind === 'yearly') return monthKeysInYear(periodKey);
  return [];
}

export interface SubGaps {
  /** 리포트가 없는 하위 기간들 (최신 순이 아니라 **시간 순**이다 — 화면이 정렬하지 않는다) */
  missing: string[];
  /** `missing` 중 **아직 만들 수조차 없는** 것 — 끝나지 않은 기간 */
  pending: string[];
  /** 하위 기간 총 개수. *"5개 중 2개"* 의 분모 */
  total: number;
}

/**
 * 🔴 **하위가 다 모였는가** (§6.5).
 *
 * 월간·연간은 `(kind, period_key)` UNIQUE이고 **재생성이 없다.** 그래서 덜 모인 채로 만들면
 * 빠진 기간이 영구히 빠진 채로 굳고, 화면 어디에도 무엇이 빠졌는지 안 나온다.
 *
 * `missing`과 `pending`을 **나눠서 돌려주는 이유**는 할 수 있는 일이 다르기 때문이다:
 *   · `pending`  아직 끝나지도 않은 기간이다 → 사용자가 지금 할 수 있는 게 없다 → **차단**
 *   · 나머지     끝났는데 안 만들었다 → 백필로 지금 만들 수 있다 → **확인 후 진행**
 *
 * ⚠ 주간은 하위가 없어 항상 빈 결과다. 주간의 대응물은 `weeklyGaps()`(빠진 **날**)다.
 */
export async function subGaps(
  kind: ReportKind,
  periodKey: string,
  now: Date = new Date(),
): Promise<SubGaps> {
  const keys = subPeriodKeys(kind, periodKey);
  if (keys.length === 0) return { missing: [], pending: [], total: 0 };
  const childKind: ReportKind = kind === 'yearly' ? 'monthly' : 'weekly';
  const have = new Set((await listReports(childKind)).map((report) => report.periodKey));
  const missing = keys.filter((key) => !have.has(key));
  return { missing, pending: missing.filter((key) => !isClosed(key, now)), total: keys.length };
}

/**
 * 이 기간을 겨냥해도 되는가 — 지평 안이고 이미 끝났는가(§6.4).
 *
 * ⚠ 목록에 있는지로 판정한다. 조건을 따로 다시 쓰면 지평을 바꿀 때 한쪽만 고치게 된다.
 */
function inHorizon(kind: ReportKind, periodKey: string, now: Date): boolean {
  return isCreatablePeriod(kind, periodKey, now);
}

/**
 * 이 기간의 **하위가 전부 끝나는 다음 날** (`YYYY-MM-DD`) — `too-early` 문구의 날짜(§6.5).
 *
 * 하위 목록의 **마지막**이 가장 늦게 끝난다. 예: 8월의 마지막 주는 8/31~9/6이라 9/7이다 —
 * 8월 월간은 9/1부터 열리지만 온전해지는 것은 그날이다.
 */
export function subPeriodsOpenOn(kind: ReportKind, periodKey: string): string | null {
  const keys = subPeriodKeys(kind, periodKey);
  const last = keys[keys.length - 1];
  return last === undefined ? null : opensOn(last);
}

/** 기간 시트 한 줄 */
export interface PeriodOption {
  /** `2026-W33` · `2026-08` · `2026` */
  key: string;
  /**
   * 지금 이 기간을 만들 수 없는 사유. `null`이면 고를 수 있다.
   *
   * ⚠ 고를 수 없는 줄도 **지우지 않고 사유와 함께 보여준다.** 목록에서 사라지면
   *   *"그 주가 왜 없지"* 가 되고, 사람은 없는 것보다 이유 있는 것을 더 잘 받아들인다.
   */
  blocked: CreateFail | null;
  /** 주간이면 **본문 있는 조각 수**, 월간·연간이면 **모인 하위 리포트 수** */
  count: number;
  /** 월간·연간의 하위 기간 총 개수. 주간은 0 — *"5개 중 2개"* 의 분모다 */
  total: number;
}

/**
 * 기간 시트가 그리는 목록 — **최신 순**(§6.4).
 *
 * 🔴 **`canCreate()`를 기간마다 부르지 않는다.** 주간은 지평이 최대 105개라 그러면
 *   쿼리가 210번 나간다. 여기서는 **한 번씩 통째로 읽고 메모리에서 가른다.**
 *
 * ⚠ 그래서 판정이 `canCreate()`와 **같아야 한다.** 다르면 시트에서 고를 수 있던 줄이
 *   누르는 순간 실패한다 — 아래 사유 순서는 `canCreate()`와 일부러 같은 순서다.
 */
export async function listPeriodOptions(
  kind: ReportKind,
  now: Date = new Date(),
): Promise<PeriodOption[]> {
  const keys = creatablePeriods(kind, now);
  if (keys.length === 0) return [];
  /*
   * 🔴 **묘비를 포함해서 센다**(§11.9). `listReports()`는 묘비를 빼므로 지운 기간이
   *   다시 고를 수 있게 보이고, 눌러야 서버가 `cap-exceeded`로 막는다.
   */
  const made = new Set(await listUsedPeriodKeys(kind));

  if (kind === 'weekly') {
    /*
     * 지평 전체를 **한 번에** 읽는다. `keys`는 최신 순이라 마지막이 가장 오래된 주다.
     * 범위가 비어 있으면(키가 깨졌으면) 조각 0으로 떨어지고, 그건 `empty`로 표시된다.
     */
    const newest = keyRange(keys[0] ?? '');
    const oldest = keyRange(keys[keys.length - 1] ?? '');
    const rows =
      newest === null || oldest === null ? [] : await listEntryTexts(oldest.from, newest.to);
    const perWeek = new Map<string, number>();
    for (const row of rows) {
      // ⚠ 본문 판정은 `hasBody` 하나뿐이다(§10.2). SQL로 세지 않는 이유가 이것이다
      if (!hasBody(row.plainText)) continue;
      const key = weekKeyForYmd(row.entryDate);
      if (key !== null) perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
    }
    return keys.map((key) => {
      const count = perWeek.get(key) ?? 0;
      return {
        key,
        count,
        total: 0,
        blocked: made.has(key) ? 'exists' : count === 0 ? 'empty' : null,
      };
    });
  }

  const childKind: ReportKind = kind === 'yearly' ? 'monthly' : 'weekly';
  /*
   * ⚠ **하위는 반대로 묘비를 뺀다.** 본문이 없는 리포트는 상위 요약의 입력이 못 된다 —
   *   `weeksInMonth()`가 `listReports()`로 실제 입력을 고르는 것과 같은 집합이어야 한다.
   *   위의 `made`와 여기가 다른 것은 실수가 아니라 **묻는 질문이 다르기** 때문이다:
   *   위는 *"이 기간을 썼는가"*, 여기는 *"이 기간의 내용이 있는가"*.
   */
  const childMade = new Set((await listReports(childKind)).map((report) => report.periodKey));
  const needFail: CreateFail = kind === 'yearly' ? 'need-monthly' : 'need-weekly';

  return keys.map((key) => {
    const subs = subPeriodKeys(kind, key);
    const have = subs.filter((sub) => childMade.has(sub)).length;
    // 아직 안 끝난 하위가 하나라도 있으면 지금 만들면 안 된다(§6.5)
    const pending = subs.some((sub) => !childMade.has(sub) && !isClosed(sub, now));
    return {
      key,
      count: have,
      total: subs.length,
      blocked: made.has(key)
        ? 'exists'
        : have === 0
          ? needFail
          : pending
            ? 'too-early'
            : null,
    };
  });
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
  chosenPeriodKey?: string,
  now: Date = new Date(),
): Promise<CreateResult> {
  // 안 고르면 기본값(지난주·지난달·작년). 1탭 경로가 그대로인 이유다(§6.4)
  const periodKey = chosenPeriodKey ?? targetPeriodKey(kind, now);

  // 1차 방어. 서버 캡에 도달하기 전에 앱이 먼저 막는다 — 있는 걸 또 만들 이유가 없다
  if ((await findByPeriod(kind, periodKey)) !== null) {
    return { ok: false, reason: 'exists' };
  }
  /*
   * ⚠ **고른 기간이 지평 안인지 본다.** 화면이 목록에서만 고르게 하지만, 여기가 진실이다 —
   *   화면은 여러 개고 낡은 화면이 남는다. 서버도 같은 것을 다시 본다(§6.4).
   */
  if (!inHorizon(kind, periodKey, now)) {
    return { ok: false, reason: 'out-of-range' };
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
   * 🔴 **아직 끝나지도 않은 하위 기간이 있으면 만들지 않는다** (§6.5).
   *
   * 예: 8/31~9/6 주는 **8월 주**인데(월요일이 든 달) 9/7에야 만들 수 있다. 그런데 8월 월간은
   *   9/1부터 열린다 — 그 6일 사이에 누르면 그 주가 **존재할 수조차 없어서** 반드시 빠지고,
   *   재생성이 없으니 영구히 굳는다.
   *
   * ⚠ 여기서 막는 것은 `pending`뿐이다. *"끝났는데 안 만든"* 하위는 그의 선택이라 막지 않고
   *   화면이 확인만 받는다 — §10.1과 같은 규약이다.
   */
  if (kind !== 'weekly' && (await subGaps(kind, periodKey, now)).pending.length > 0) {
    return { ok: false, reason: 'too-early' };
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
    /*
     * 지표·주제 (§8.4). **둘 다 오지 않으면 `null`** — 낡은 서버이거나 스키마가 어긋난 것이고,
     * 그때 리포트는 지표 없이 저장된다. 본문은 온전하므로 실패로 만들지 않는다.
     */
    metrics:
      response.metrics === undefined && response.topics === undefined
        ? null
        : { metrics: response.metrics ?? [], topics: response.topics ?? [] },
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
  chosenPeriodKey?: string,
  now: Date = new Date(),
): Promise<{ ok: true } | { ok: false; reason: CreateFail }> {
  const periodKey = chosenPeriodKey ?? targetPeriodKey(kind, now);
  if ((await findByPeriod(kind, periodKey)) !== null) {
    return { ok: false, reason: 'exists' };
  }
  if (!inHorizon(kind, periodKey, now)) {
    return { ok: false, reason: 'out-of-range' };
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
    if (weeksInMonth(weekly, periodKey).length === 0) {
      // ⚠ `need-weekly`가 `too-early`보다 앞이다. 하나도 없는 사람에게 날짜부터 말하면
      //    무엇을 해야 하는지가 안 보인다 — 백필로 지금 만들 수 있는 주가 이미 있다
      return { ok: false, reason: 'need-weekly' };
    }
  } else {
    const monthly = await listReports('monthly');
    if (!monthly.some((r) => r.periodKey.startsWith(`${periodKey}-`))) {
      return { ok: false, reason: 'need-monthly' };
    }
  }
  // 🔴 하위가 아직 안 끝났으면 막는다(§6.5). `createReport`와 같은 판정이어야 한다
  return (await subGaps(kind, periodKey, now)).pending.length > 0
    ? { ok: false, reason: 'too-early' }
    : { ok: true };
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
export async function weeklyGaps(
  chosenPeriodKey?: string,
  now: Date = new Date(),
): Promise<string[]> {
  const range = keyRange(chosenPeriodKey ?? targetPeriodKey('weekly', now));
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
