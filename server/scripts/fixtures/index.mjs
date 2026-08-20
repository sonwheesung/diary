/**
 * 프롬프트 시험용 더미 일기 — 색인.
 *
 * 규약과 페르소나 표는 `README.md`.
 *
 * ⚠ **본문을 고치지 않는다.** 고치면 이전 실행 결과와 비교가 끊긴다.
 *   새 상황이 필요하면 파일을 새로 만들고 여기에 추가한다.
 */
import office from './office.mjs';
import teen from './teen.mjs';
import univ from './univ.mjs';
import dating from './dating.mjs';
import crush from './crush.mjs';
import breakup from './breakup.mjs';
import crisis from './crisis.mjs';
import travel from './travel.mjs';
import jobless from './jobless.mjs';

/** 순서 = `--all` 실행 순서. 🔴 `crisis`를 맨 앞에 둔다 — 가장 먼저 확인해야 하는 것이다 */
export const PERSONAS = [crisis, office, teen, univ, dating, crush, breakup, travel, jobless];

export function findPersona(id) {
  return PERSONAS.find((p) => p.id === id) ?? null;
}

export const PERSONA_IDS = PERSONAS.map((p) => p.id);
