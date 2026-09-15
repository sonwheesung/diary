import { create } from 'zustand';

import { createReport, type CreateResult } from '@/features/ai/api/report-service';
import type { ReportKind } from '@/features/ai/types';

export interface GenerationJob {
  kind: ReportKind;
  periodKey: string;
}

export interface GenerationDone extends GenerationJob {
  result: CreateResult;
}

interface GenerationState {
  /** 지금 만드는 중인 것. 없으면 null */
  job: GenerationJob | null;
  /** 끝났는데 아직 아무도 사용자에게 알리지 않은 결과 */
  done: GenerationDone | null;
  /** 시작했으면 true. 이미 하나가 돌고 있으면 false 이고 아무것도 보내지 않는다 */
  start: (kind: ReportKind, periodKey: string) => boolean;
  /** 알릴 결과를 꺼내고 비운다. 두 곳이 같은 결과를 두 번 알리지 않게 한다 */
  take: () => GenerationDone | null;
}

/**
 * 리포트 생성을 **화면이 아니라 모듈이** 들고 있는다(`docs/AI_REPORT_SYSTEM.md` §11.8, 2026-09-15).
 *
 * 🔴 전에는 리포트 화면의 `useState` 가 들고 덮개(`CreatingOverlay`)로 이탈을 막았다.
 *   막은 이유는 *"서버 응답 뒤 로컬 저장이라 그 사이 죽으면 기간을 잃는다"* 였는데, 서버가 응답 전에
 *   저장하고(§5.2) 리포트 화면이 열릴 때마다 되살리므로(§5.6) 그 이유가 사라졌다. 생성은 20~60초다.
 *
 * ⚠ **하나만 돈다.** 둘을 동시에 보내면 서버 캡이 읽기와 쓰기 사이에 둘 다 통과할 수 있다(§5.4).
 * ⚠ **메모리에만 둔다.** 앱이 죽으면 진행 표시도 사라지고, 그때는 서버 동기화가 결과를 가져온다.
 */
export const useGenerationStore = create<GenerationState>((set, get) => ({
  job: null,
  done: null,
  start: (kind, periodKey) => {
    if (get().job !== null) {
      return false;
    }
    set({ job: { kind, periodKey }, done: null });
    void createReport(kind, periodKey)
      // 던지면 알 수 없는 실패로 알린다. 진행 표시가 영영 안 꺼지는 것이 가장 나쁘다
      .catch((): CreateResult => ({ ok: false, reason: 'error' }))
      .then((result) => set({ job: null, done: { kind, periodKey, result } }));
    return true;
  },
  take: () => {
    const done = get().done;
    if (done !== null) {
      set({ done: null });
    }
    return done;
  },
}));
