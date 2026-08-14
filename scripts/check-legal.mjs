/**
 * 처리방침 번역 구조 검사 — `npm run check:legal`
 *
 * 🔴 **조항 하나가 조용히 빠지는 것**이 이 문서에서 유일하게 중요한 사고다.
 *   법정 고지 사항(§28-8의 이전 항목, §15의 수집 근거 같은 것)이 한 언어에서만 사라지면
 *   그 언어 사용자에게는 **고지를 안 한 것**이 되는데, 15개 언어를 눈으로 대조할 방법이 없다.
 *
 * 그래서 내용이 아니라 **구조**를 본다:
 *   · 절(section) 수가 한국어와 같은가
 *   · 각 절의 줄 수가 같은가
 *   · 개정 예고 수와 그 안의 절·줄 수가 같은가
 *
 * ⚠ **번역 품질은 검사하지 못한다.** 이건 "빠뜨리지 않았다"까지만 보증하는 그물이다.
 *   원어민 검수를 대신하지 않는다(`docs/I18N_SYSTEM.md`).
 *
 * ⚠ 줄 수를 맞추라는 제약은 번역가에게 불편하다(한 문장을 둘로 쪼개고 싶을 때가 있다).
 *   그래도 유지한다 — 그 불편이 조항 누락을 잡아주는 유일한 신호다.
 */
import { PRIVACY, DELETE_ACCOUNT } from '../features/legal/legal-text.ts';
import { fingerprint } from '../features/legal/fingerprint.ts';
import {
  EXPECTED_TRANSLATIONS,
  TRANSLATIONS,
  DELETE_ACCOUNT_TRANSLATIONS,
} from '../features/legal/registry.ts';

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
    console.log(`  FAIL ${name}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function shape(doc) {
  return {
    sections: doc.sections.map((s) => s.body.length),
    pending: (doc.pending ?? []).map((p) => p.sections.map((s) => s.body.length)),
  };
}

/**
 * 문서 하나의 번역본 전부를 검사한다.
 *
 * ⚠ **문서마다 따로 돈다.** 처리방침과 계정 삭제 안내는 번역 진행 속도가 달라서
 *   한 목록으로 묶으면 "처리방침은 있는데 삭제 안내는 없는 언어"를 표현할 수 없다.
 */
function checkDoc(label, source, translations) {
  const base = shape(source);
  const currentFingerprint = fingerprint(source);

  console.log(`\n${label} 번역 구조 — 번역 ${Object.keys(translations).length}개`);

  for (const [lang, doc] of Object.entries(translations)) {
    const got = shape(doc);

    check(`${lang} — 절 수가 한국어와 같다`, () => {
      assert(
        got.sections.length === base.sections.length,
        `절 수: ko=${base.sections.length} ${lang}=${got.sections.length}`,
      );
    });

    check(`${lang} — 각 절의 줄 수가 같다 (조항 누락 방어)`, () => {
      for (let i = 0; i < base.sections.length; i += 1) {
        assert(
          got.sections[i] === base.sections[i],
          `${i + 1}번째 절의 줄 수: ko=${base.sections[i]} ${lang}=${got.sections[i]} — "${source.sections[i].h}"`,
        );
      }
    });

    check(`${lang} — 개정 예고 수가 같다`, () => {
      assert(
        got.pending.length === base.pending.length,
        `예고 수: ko=${base.pending.length} ${lang}=${got.pending.length}`,
      );
    });

    check(`${lang} — 개정 예고의 절·줄 수가 같다`, () => {
      for (let p = 0; p < base.pending.length; p += 1) {
        assert(
          got.pending[p].length === base.pending[p].length,
          `예고 ${p + 1}의 절 수: ko=${base.pending[p].length} ${lang}=${got.pending[p].length}`,
        );
        for (let i = 0; i < base.pending[p].length; i += 1) {
          assert(
            got.pending[p][i] === base.pending[p][i],
            `예고 ${p + 1}의 ${i + 1}번째 절 줄 수: ko=${base.pending[p][i]} ${lang}=${got.pending[p][i]}`,
          );
        }
      }
    });

    check(`${lang} — 시행일·수정일이 한국어와 같다`, () => {
      assert(
        doc.effective === source.effective,
        `시행일: ko=${source.effective} ${lang}=${doc.effective}`,
      );
      assert(doc.updated === source.updated, `수정일: ko=${source.updated} ${lang}=${doc.updated}`);
    });

    check(`${lang} — 빈 문자열이 없다`, () => {
      const all = [
        doc.title,
        doc.intro,
        ...doc.sections.flatMap((s) => [s.h, ...s.body]),
        ...(doc.pending ?? []).flatMap((p) => [
          p.appliesFrom,
          p.summary,
          ...p.sections.flatMap((s) => [s.h, ...s.body]),
        ]),
      ];
      const empty = all.filter((v) => typeof v !== 'string' || v.trim().length === 0);
      assert(empty.length === 0, `빈 값 ${empty.length}개`);
    });

    /*
     * 🔴 **구조가 같아도 문구가 낡을 수 있다.** 절 수·줄 수만 보면 한국어의 단어만 바꾼 변경을
     *   못 잡는다 — 실제로 시험했다(보유기간 3년 → 5년, 98개 전부 통과). 그게 드리프트다.
     *   그래서 번역본이 **자기가 보고 번역한 한국어의 지문**을 들고 있고, 여기서 대조한다.
     */
    check(`🔴 ${lang} — 현재 정본을 보고 만든 번역인가 (지문 대조)`, () => {
      assert(
        doc.sourceFingerprint === currentFingerprint,
        `한국어가 바뀌었는데 ${lang}이 따라오지 않았다: ${doc.sourceFingerprint} ≠ ${currentFingerprint}
  ` + `       → 한국어를 다시 읽고 ${lang}을 고친 뒤  node scripts/legal-stamp.mjs ${lang}`,
      );
    });

    check(`🔴 ${lang} — 한글이 남아 있지 않다`, () => {
      const all = [
        doc.title,
        doc.intro,
        ...doc.sections.flatMap((s) => [s.h, ...s.body]),
        ...(doc.pending ?? []).flatMap((p) => [
          p.appliesFrom,
          p.summary,
          ...p.sections.flatMap((s) => [s.h, ...s.body]),
        ]),
      ];
      const left = all.filter((v) => /[가-힣]/.test(v));
      assert(left.length === 0, `번역 안 된 줄 ${left.length}개: ${left[0]?.slice(0, 40)}`);
    });
  }
}


checkDoc('처리방침', PRIVACY, TRANSLATIONS);
checkDoc('계정 삭제 안내', DELETE_ACCOUNT, DELETE_ACCOUNT_TRANSLATIONS);

console.log('');
/*
 * ⚠ **15개 언어가 전부 채워졌다**(2026-08-12). 이 검사가 앞으로 지켜야 할 것은
 *   "빠진 언어가 없는가"이지 "몇 개 남았는가"가 아니다 — 언어를 추가하면 여기도 늘린다.
 */
if (Object.keys(TRANSLATIONS).length !== EXPECTED_TRANSLATIONS) {
  console.error(`
번역된 언어가 ${Object.keys(TRANSLATIONS).length}개다 — ${EXPECTED_TRANSLATIONS}개여야 한다.`);
  console.error(
    '번역이 없는 언어는 한국어 원문을 보여주므로 화면은 깨지지 않지만, 그 언어 사용자는 못 읽는다.',
  );
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`\n처리방침 번역 — ${failures.length}개 실패\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(
  `법적 고지 번역 ok — ${passed}개 검사 통과 ` +
    `(처리방침 ${Object.keys(TRANSLATIONS).length}개 언어 · ` +
    `계정 삭제 안내 ${Object.keys(DELETE_ACCOUNT_TRANSLATIONS).length}개 언어)\n`,
);
/*
 * ⏭ 계정 삭제 안내는 아직 영어 하나다. Play 심사가 여는 URL이라 영어를 먼저 넣었고,
 *   나머지 13개는 이어서 채운다 — 다 차면 `DELETE_ACCOUNT_TRANSLATIONS`도
 *   `EXPECTED_TRANSLATIONS`처럼 개수 검사를 붙인다.
 */
