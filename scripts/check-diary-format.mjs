/**
 * 텍스트 서식 규칙 검사 — `npm run check:diary-format`
 *
 * 여기서 보는 것은 **저장 형태 하나**다 (DIARY_SYSTEM §1.1 텍스트 서식).
 * 화면으로는 알 수 없다 — 이 계층이 틀리면 **화면에서는 멀쩡히 보이다가 저장하고
 * 다시 열었을 때** 서식이 사라진다. 그때는 이미 사용자 조각이 상해 있다.
 *
 * 특히 지키는 것 둘:
 *   ① 서식이 다른 문단을 `normalizeBlocks`가 **합치지 않는다** (합치면 서식이 통째로 증발)
 *   ② 서식을 한 번도 안 건드린 조각의 JSON이 **이 기능 이전과 바이트 단위로 같다**
 */
import {
  cleanFormat,
  isDefaultFormat,
  readFormat,
  sameFormat,
  splitParagraph,
  withFormat,
} from '../features/diary/format.ts';
import { normalizeBlocks, parseBlocks, serializeBlocks } from '../features/diary/blocks.ts';

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}\n    ${error.message}`);
  }
}

function eq(actual, expected, what) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`${what ?? ''} 기대 ${b} / 실제 ${a}`);
  }
}

// ── cleanFormat — 기본값과 모르는 값은 저장하지 않는다 ────────────────────────

check('기본값은 전부 지워진다', () => {
  eq(cleanFormat({ align: 'left', size: 'body', bold: false, color: 'default' }), {});
});

check('모르는 값은 버린다 (블록은 살리고 서식만 씻는다)', () => {
  eq(cleanFormat({ align: 'justify', size: 'h9', color: 'neon' }), {});
});

check('고른 값만 남는다', () => {
  eq(cleanFormat({ align: 'center', size: 'h2', bold: true, color: 'rose' }), {
    align: 'center',
    size: 'h2',
    bold: true,
    color: 'rose',
  });
});

check('isDefaultFormat', () => {
  if (!isDefaultFormat({ align: 'left' })) throw new Error('left는 기본값이다');
  if (isDefaultFormat({ align: 'center' })) throw new Error('center는 기본값이 아니다');
});

check('sameFormat은 기본값 표기 차이를 같다고 본다', () => {
  if (!sameFormat({}, { align: 'left', size: 'body' })) {
    throw new Error('{} 와 {align:left,size:body} 는 같은 뜻이다');
  }
  if (sameFormat({ color: 'rose' }, { color: 'blue' })) {
    throw new Error('다른 색을 같다고 하면 안 된다');
  }
});

// ── 🔴 저장 형태가 예전과 같은가 ──────────────────────────────────────────────

check('서식을 안 건드린 조각의 JSON은 예전과 똑같다', () => {
  const blocks = normalizeBlocks([
    { type: 'text', value: '오늘은 하늘이 예뻤다.' },
    { type: 'image', imageId: 'img-1' },
    { type: 'text', value: '커피를 마셨다.' },
  ]);
  eq(
    JSON.parse(serializeBlocks(blocks)),
    [
      { type: 'text', value: '오늘은 하늘이 예뻤다.' },
      { type: 'image', imageId: 'img-1' },
      { type: 'text', value: '커피를 마셨다.' },
    ],
    '서식 필드가 하나라도 새로 끼면 안 된다',
  );
});

// ── 🔴 병합 규칙 — 이 검사가 서식 증발을 막는다 ───────────────────────────────

check('서식이 같은 이웃은 합친다', () => {
  const out = normalizeBlocks([
    { type: 'text', value: '가' },
    { type: 'text', value: '나' },
  ]);
  eq(out, [{ type: 'text', value: '가\n나' }]);
});

check('🔴 서식이 다른 이웃은 합치지 않는다', () => {
  const out = normalizeBlocks([
    { type: 'text', value: '제목', size: 'h1' },
    { type: 'text', value: '본문' },
  ]);
  if (out.length !== 2) {
    throw new Error(`합쳐버렸다 — 서식이 통째로 사라진다. 결과: ${JSON.stringify(out)}`);
  }
  eq(out, [
    { type: 'text', value: '제목', size: 'h1' },
    { type: 'text', value: '본문' },
  ]);
});

check('색만 달라도 합치지 않는다', () => {
  const out = normalizeBlocks([
    { type: 'text', value: '가', color: 'rose' },
    { type: 'text', value: '나', color: 'blue' },
  ]);
  if (out.length !== 2) throw new Error('색이 다른데 합쳤다');
});

check('서식을 기본값으로 되돌리면 다시 합쳐진다', () => {
  const out = normalizeBlocks([
    { type: 'text', value: '가', align: 'left', size: 'body' },
    { type: 'text', value: '나' },
  ]);
  eq(out, [{ type: 'text', value: '가\n나' }], '되돌린 서식은 없는 것과 같아야 한다');
});

// ── 문단 분할 ────────────────────────────────────────────────────────────────

check('한 문단짜리는 나누지 않는다', () => {
  const blocks = [{ type: 'text', value: '한 줄' }];
  const out = splitParagraph(blocks, 0, 1);
  eq(out.blocks, blocks);
  if (out.index !== 0) throw new Error('인덱스가 틀렸다');
});

check('가운데 문단을 떼어낸다', () => {
  const out = splitParagraph([{ type: 'text', value: '가\n나\n다' }], 0, 2);
  eq(out.blocks, [
    { type: 'text', value: '가' },
    { type: 'text', value: '나' },
    { type: 'text', value: '다' },
  ]);
  if (out.index !== 1) throw new Error(`가운데를 가리켜야 한다 — index ${out.index}`);
});

check('첫 문단이면 앞 조각이 안 생긴다', () => {
  const out = splitParagraph([{ type: 'text', value: '가\n나' }], 0, 0);
  eq(out.blocks, [
    { type: 'text', value: '가' },
    { type: 'text', value: '나' },
  ]);
  if (out.index !== 0) throw new Error(`첫 조각이어야 한다 — index ${out.index}`);
});

check('마지막 문단이면 뒤 조각이 안 생긴다', () => {
  const out = splitParagraph([{ type: 'text', value: '가\n나' }], 0, 3);
  if (out.index !== 1) throw new Error(`마지막을 가리켜야 한다 — index ${out.index}`);
});

check('문단 끝에 커서가 있으면 그 문단으로 친다', () => {
  // '가\n나' 에서 caret 1 = '가'의 끝. 다음 문단으로 넘어가면 안 된다.
  const out = splitParagraph([{ type: 'text', value: '가\n나' }], 0, 1);
  if (out.index !== 0) throw new Error(`'가'를 가리켜야 한다 — index ${out.index}`);
});

check('커서를 떼어낸 문단 안 같은 자리로 옮긴다', () => {
  // '가나' + 개행 + '다라' 에서 caret 4 = 둘째 문단의 '다' 다음. 나눈 뒤에는 1이어야 한다.
  const out = splitParagraph([{ type: 'text', value: '가나\n다라' }], 0, 4);
  if (out.index !== 1) throw new Error(`둘째 블록이어야 한다 — index ${out.index}`);
  if (out.caret !== 1) throw new Error(`문단 안 위치가 1이어야 한다 — caret ${out.caret}`);
});

check('나눠도 원래 서식이 세 조각에 그대로 간다', () => {
  const out = splitParagraph([{ type: 'text', value: '가\n나\n다', color: 'rose' }], 0, 2);
  for (const block of out.blocks) {
    if (block.color !== 'rose') throw new Error('서식을 흘렸다');
  }
});

// ── 읽기 경로 ────────────────────────────────────────────────────────────────

check('DB에서 읽을 때 모르는 서식은 씻긴다 (본문은 살아남는다)', () => {
  const raw = JSON.stringify([{ type: 'text', value: '살아야 한다', color: 'neon', size: 'h9' }]);
  const out = parseBlocks(raw, '살아야 한다');
  eq(out, [{ type: 'text', value: '살아야 한다' }]);
});

check('서식이 든 블록은 그대로 읽힌다', () => {
  const raw = JSON.stringify([{ type: 'text', value: '제목', size: 'h1', color: 'blue' }]);
  eq(parseBlocks(raw, '제목'), [{ type: 'text', value: '제목', size: 'h1', color: 'blue' }]);
});

check('readFormat은 텍스트가 아닌 블록에 빈 서식을 준다', () => {
  eq(readFormat({ type: 'image', imageId: 'x' }), {});
});

check('withFormat은 값을 보존하고 서식만 갈아끼운다', () => {
  eq(withFormat({ type: 'text', value: '가', size: 'h1' }, { align: 'center' }), {
    type: 'text',
    value: '가',
    align: 'center',
  });
});

// ── 결과 ─────────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\n서식 검사 실패 ${failures.length}건:\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}\n`);
  process.exit(1);
}
// ⚠ 문구를 바꾸지 마라 — `check:doc-counts`가 `N개 검사 통과`를 앵커로 개수를 읽는다.
console.log(`\n서식 ${passed}개 검사 통과 (저장 형태 · 병합 규칙 · 문단 분할 · 읽기 세척)\n`);
