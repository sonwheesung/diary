/**
 * 회사원 1년 코퍼스 — **마크다운을 그대로 읽는다.**
 *
 * 다른 픽스처(`../office.mjs` 등)는 `.mjs` 안에 문자열로 들고 있는데, 이쪽은 12개월치라
 * 손으로 옮기면 반드시 어딘가 빠진다. 원본 `.md` 를 읽어 파싱한다 — **옮겨 적는 단계를 없앤다.**
 *
 * 파일 형식(생성 시 지정한 것):
 * ```
 * ## 2026-01-05 (월)
 * 본문 한 문단.
 * ```
 *
 * ⚠ `emotion` 은 **전부 `null`** 이다. 앱에서 감정은 필수가 아니고(`DiaryEditor` 의 `canSave` 에
 *   없다), 이 코퍼스는 글만 받았다. 없는 감정을 지어 넣으면 리포트에 **우리 판단이 섞인다**
 *   (`weekday.mjs` 와 같은 규약).
 *
 * ⚠ 실제 사용자의 일기가 아니다. 전부 생성된 더미다.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HERE = dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');

/** `## 2026-01-05 (월)` 다음 줄부터 다음 `##` 전까지가 본문 */
function parse(md) {
  const out = [];
  for (const chunk of md.split(/^## /m).slice(1)) {
    const nl = chunk.indexOf('\n');
    const head = chunk.slice(0, nl).trim();
    const date = head.slice(0, 10);
    const text = chunk.slice(nl + 1).trim();
    if (!/^2026-\d\d-\d\d$/.test(date) || text.length === 0) continue;
    out.push({ date, emotion: null, title: '', text });
  }
  return out;
}

/** 지금까지 받은 달만 읽는다. 12개가 다 없어도 돈다 */
export function loadEntries() {
  const files = readdirSync(HERE)
    .filter((f) => /^2026-\d\d\.md$/.test(f))
    .sort();
  const entries = files.flatMap((f) => parse(readFileSync(join(HERE, f), 'utf8')));
  entries.sort((a, b) => a.date.localeCompare(b.date));
  return { files, entries };
}
