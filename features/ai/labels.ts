import { periodRange } from '@/features/ai/api/report-service';
import type { ReportKind } from '@/features/ai/types';
import { formatDateRange, formatPeriodMonth, formatPeriodYear } from '@/lib/format';

/**
 * 기간 키 → 사람이 읽는 표기. **목록·상세·생성 안내가 같은 함수를 쓴다.**
 *
 * 각자 만들면 같은 리포트가 화면마다 다르게 불린다 — 목록에서 `8월 10일 – 16일`인데
 * 상세에서 `2026년 33주`면 같은 것인지 확신할 수 없다.
 *
 * ⚠ **종류마다 표기가 다르다.** 월간을 날짜 범위로 쓰면 `8월 1일 – 31일`이 되는데,
 *   그건 "8월"이라고 쓰면 될 것을 길게 쓴 것이다. 연간은 더 심하다.
 */
export function periodLabel(kind: ReportKind, periodKey: string): string {
  if (kind === 'monthly') return formatPeriodMonth(periodKey);
  if (kind === 'yearly') return formatPeriodYear(periodKey);
  const range = periodRange(kind, periodKey);
  // 키가 깨졌으면 키를 그대로 보여준다. 빈칸을 두면 고장 난 줄 모른다
  return range === null ? periodKey : formatDateRange(range.from, range.to);
}
