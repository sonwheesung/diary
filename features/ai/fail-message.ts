import { periodLabel } from '@/features/ai/labels';
import { subPeriodsOpenOn, type CreateFail } from '@/features/ai/api/report-service';
import type { ReportKind } from '@/features/ai/types';
import { isAwaitingEntitlementConfirm } from '@/features/entitlement/store';
import { formatDateTime, formatFullDate } from '@/lib/format';

/*
 * 리포트 탭에서 옮겼다(2026-09-15). 생성이 끝났을 때 **다른 화면에서도** 같은 문장으로 알려야 해서다
 * (`features/ai/components/GenerationNotice.tsx`, `docs/AI_REPORT_SYSTEM.md` §11.8).
 */
/**
 * 실패 사유 → 사람이 읽는 문장.
 *
 * 사유마다 **다음에 할 일**이 다르므로 뭉뚱그리지 않는다. 서버가 준 사유는
 * `report.fail.*`에 코드 그대로 들어 있고(백업의 `backup.fail.*`과 같은 규약),
 * 앱에서만 나는 네 가지는 이미 화면에 쓰는 안내 문구를 재사용한다.
 */
export function failMessage(
  reason: CreateFail,
  kind: ReportKind,
  periodKey: string,
  t: (key: string, opts?: Record<string, string>) => string,
  retryAt?: number,
): string {
  const period = periodLabel(kind, periodKey);
  /*
   * 🔴 결제 직후 낙관 구간이면 서버만 아직 모르는 상태다. 앱은 `pro`로 보이는데
   *   서버가 `not-subscribed`를 준 것이므로, *"구독하면 이용할 수 있어요"* 는
   *   **방금 결제한 사람에게 하는 거짓말**이다(2026-08-19 실기기 재현).
   */
  if (reason === 'not-subscribed' && isAwaitingEntitlementConfirm()) {
    return t('subscribe.confirming');
  }
  switch (reason) {
    /*
     * ⚠ 서버가 정확한 시각을 준다(`retryAt`). *"한 시간 뒤"* 는 잠금이 걸린 시점 기준이라
     *   5분 뒤에 다시 눌러본 사람에게 **틀린 안내**가 된다 — 실제로는 55분 남았다.
     *   시각을 못 받았을 때만 뭉뚱그린 문장으로 떨어진다.
     */
    case 'cooling-down':
      return retryAt === undefined
        ? t('report.fail.cooling-down')
        : t('report.fail.coolingDownAt', { time: formatDateTime(retryAt) });
    /*
     * 🔴 **하루 캡이다. *"잠시 뒤"* 가 아니다**(2026-09-10 사용자 지적).
     *   그 문구가 오래 살아 있었던 이유는 캡이 30 이라 **아무도 못 채웠기 때문**이다 —
     *   10 으로 낮추면서 비로소 보이는 문구가 됐다.
     *
     * ⚠ **"내일" 이라고도 못 쓴다.** 기준이 UTC 날짜라 한국은 오전 9시, 미주는 같은 날
     *   오후에 풀린다. 서버가 다음 UTC 자정을 주고 여기서 **기기 시간대로** 그린다.
     */
    case 'rate-limited':
      return retryAt === undefined
        ? t('report.fail.rate-limited')
        : t('report.fail.rateLimitedAt', { time: formatDateTime(retryAt) });
    /*
     * 🔴 거부도 **1시간 잠긴다**(`AI_REPORT_SYSTEM` §4.3). 옛 문구는 *"횟수에 포함되지 않아요"* 만
     *   말해서 바로 다시 누른 사람이 `cooling-down` 을 만났다. 서버가 잠근 시각을 준다(2026-09-14).
     */
    case 'refused':
      return retryAt === undefined
        ? t('report.fail.refused')
        : t('report.fail.refusedAt', { time: formatDateTime(retryAt) });
    // ⚠ "주에 한 번"으로 뭉치지 않는다 — 월간 탭에서 그 문장은 거짓이다.
    //   무엇이 이미 있는지를 기간으로 말해야 다음에 할 일이 분명해진다
    case 'exists':
    case 'cap-exceeded':
      return t('report.alreadyExists', { period });
    case 'empty':
      return t('report.noEntries');
    /*
     * ⚠ **기간을 반드시 넣는다.** 처음엔 "이 달의 주간 리포트를 먼저"라고 썼는데,
     *   월간이 겨냥하는 것은 **지난달**이라 그 문장이 틀렸다. 연간은 작년이라 더 틀렸다.
     *   화면에서 눈으로 보고 잡았다 — 코드만 봐서는 맞는 것처럼 읽힌다.
     */
    case 'need-weekly':
      return t('report.needWeekly', { period });
    case 'need-monthly':
      return t('report.needMonthly', { period });
    /*
     * 🔴 **언제부터 되는지를 말한다**(§6.5). *"나중에 다시 오세요"* 로 끝내면 사람은
     *   매일 눌러본다. 마지막 하위 기간이 끝나는 날 다음이 그 날짜다.
     *
     * ⚠ 날짜를 못 구하면(키가 깨졌으면) 날짜 없는 문장으로 떨어진다 —
     *   `cooling-down`이 `retryAt` 없이 떨어지는 것과 같은 규약이다.
     */
    case 'too-early': {
      const opens = subPeriodsOpenOn(kind, periodKey);
      return opens === null
        ? t('report.fail.too-early')
        : t('report.tooEarlyAt', { date: formatFullDate(opens) });
    }
    default:
      return t(`report.fail.${reason}`);
  }
}
