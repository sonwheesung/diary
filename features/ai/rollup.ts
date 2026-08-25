/**
 * 상위 리포트의 지표를 **하위에서 합산한다** — 순수 계층. 내부 임포트는 `./types.ts` 하나.
 *
 * 설계 정본: `docs/AI_REPORT_SYSTEM.md` §8.4.1
 *
 * ## 🔴 왜 모델에게 다시 묻지 않나
 *
 * 계층 요약은 하위 **요약문만** 받고 원본 일기를 다시 안 읽는다(§6.3). 그리고 프롬프트가
 * *"숫자를 요약문에 옮겨 적지 마라"* 고 시키므로 그 요약문에는 **점수도 날 수도 없다.**
 * 즉 상위에서 모델이 매기는 지표는 **근거가 없다.**
 *
 * 실측으로 드러났다(2026-08-25 `verify:hierarchy`):
 *
 * ```
 * 주간 exercise days   W28 0 · W29 1 · W30 1 · W31 0   → 합 2일
 * 월간 exercise days   1일                              ← 모델이 매긴 값. 어긋난다
 * ```
 *
 * → **점수는 평균, 날 수는 합.** 앱이 로컬 리포트에서 낸다.
 *
 * ⚠ 이건 §8.3.1("그 기간의 모양"의 상위 비교)에서 이미 내린 결론과 같은 규약이다 —
 *   상위는 하위에서 나오고, 모델은 **글만** 쓴다.
 */
import { METRIC_CODES, TOPIC_CODES } from './types.ts';
import type { MetricValue, TopicValue } from './types.ts';

export interface RolledUp {
  metrics: MetricValue[];
  topics: TopicValue[];
  /**
   * 몇 개의 하위 리포트에서 나왔나.
   *
   * 🔴 **반드시 함께 보여준다.** 주간 2개만 만든 달의 "평균"은 그 달의 평균이 아니다 —
   *   §6.5가 상위 생성을 막는 것과 같은 문제이고, 막지 못한 경우(이미 만든 리포트)에는
   *   **숫자 옆에 몇 개짜리인지 적는 것**이 유일하게 정직한 처리다.
   */
  from: number;
}

/**
 * 하위 리포트들의 지표를 합친다.
 *
 * @param children 하위 리포트의 지표. **지표가 없는 하위(v8 이전)는 넣지 않는다** — 부르는 쪽이 거른다.
 * @returns 하나도 없으면 `null`. 그때 상위 리포트는 지표 없이 저장된다.
 */
export function rollupMetrics(
  children: readonly { metrics: MetricValue[]; topics: TopicValue[] }[],
): RolledUp | null {
  if (children.length === 0) return null;

  const metrics: MetricValue[] = [];
  for (const code of METRIC_CODES) {
    const rows = children
      .map((c) => c.metrics.find((m) => m.code === code))
      .filter((m): m is MetricValue => m !== undefined);
    if (rows.length === 0) continue;

    /*
     * ⚠ **점수는 단순 평균이다.** 조각 수로 가중하지 않는다 — 지표는 "그 기간이 어땠나"이지
     *   "몇 번 썼나"가 아니라서, 많이 쓴 주가 그 달의 감정을 대표한다는 근거가 없다.
     */
    const value = Math.round(rows.reduce((a, m) => a + m.value, 0) / rows.length);

    /*
     * 🔴 **날 수는 합이다.** 평균이 아니다 — `운동 1일`짜리 주가 넷이면 그 달은 **4일**이지
     *   1일이 아니다. 셀 수 없는 지표(`stress`·`happiness`)는 하위도 `null`이라 `null`로 남는다.
     */
    const counted = rows.filter((m) => m.days !== null);
    const days =
      counted.length === 0 ? null : counted.reduce((a, m) => a + (m.days ?? 0), 0);

    /*
     * ⚠ `basis`를 **비운다.** 하위 넷의 근거를 이어 붙이면 문단이 되고, 하나만 고르면
     *   나머지 셋이 거짓이 된다. 대신 화면이 `from`으로 *"주간 4개에서"* 를 적는다.
     */
    metrics.push({ code, value: clamp(value), days, basis: '' });
  }

  const topics: TopicValue[] = [];
  for (const code of TOPIC_CODES) {
    const rows = children.flatMap((c) => c.topics.filter((t) => t.code === code));
    if (rows.length === 0) continue;
    topics.push({ code, days: rows.reduce((a, t) => a + t.days, 0), note: '' });
  }

  if (metrics.length === 0 && topics.length === 0) return null;
  return { metrics, topics, from: children.length };
}

/** 하위가 이상한 값을 갖고 있어도 화면이 깨지지 않게. 화면도 한 번 더 자른다(방어는 겹쳐도 된다) */
function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
