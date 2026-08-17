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
import { PRIVACY, DELETE_ACCOUNT, OPERATOR } from '../features/legal/legal-text.ts';
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

    /*
     * 🔴 **연락처는 한국어에서만 상수다.** 정본은 `${OPERATOR.contactEmail}`로 보간하는데
     *   번역본은 그 상수를 임포트할 수 없어 **문자열을 그대로 박는다**(en이 그렇게 했고
     *   13개가 따라갔다). 그래서 주소를 바꾸면 정본만 따라오고 14개가 옛 주소로 남는다 —
     *   그리고 이 문서는 **계정 삭제를 요청하는 유일한 경로**라, 닿지 않는 주소가 남는 것이
     *   구조 누락보다 나쁘다. 구조 검사로는 절대 안 잡히므로 여기서 본다.
     */
    check(`🔴 ${lang} — 연락처가 현재 값과 같다`, () => {
      const joined = [
        doc.intro,
        ...doc.sections.flatMap((s) => s.body),
        ...(doc.pending ?? []).flatMap((p) => [p.summary, ...p.sections.flatMap((s) => s.body)]),
      ].join('\n');
      const sourceJoined = [
        source.intro,
        ...source.sections.flatMap((s) => s.body),
        ...(source.pending ?? []).flatMap((p) => [
          p.summary,
          ...p.sections.flatMap((s) => s.body),
        ]),
      ].join('\n');
      // 정본이 연락처를 안 쓰는 문서라면 번역본에도 요구하지 않는다
      if (!sourceJoined.includes(OPERATOR.contactEmail)) return;
      assert(
        joined.includes(OPERATOR.contactEmail),
        `${OPERATOR.contactEmail}이 없다 — 주소를 바꿨다면 번역본 14개를 함께 고쳐야 한다`,
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

/*
 * ⚠ 계정 삭제 안내도 **처리방침과 같은 14개**여야 한다(2026-08-17에 채웠다).
 *   같은 상수를 쓰는 이유: 두 문서 모두 앱이 지원하는 15개 언어를 겨냥하고,
 *   한쪽만 비면 그 언어 사용자는 **삭제 방법을 못 읽는다.**
 */
if (Object.keys(DELETE_ACCOUNT_TRANSLATIONS).length !== EXPECTED_TRANSLATIONS) {
  console.error(`
계정 삭제 안내 번역이 ${Object.keys(DELETE_ACCOUNT_TRANSLATIONS).length}개다 — ${EXPECTED_TRANSLATIONS}개여야 한다.`);
  console.error('이 문서의 URL은 Play 데이터 보안 선언에 등록된 주소다 — 심사자가 직접 연다.');
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
 * ⏭ 이 검사가 **못 보는 것** — 다음에 그물을 넓힌다면 여기부터다:
 *   ① 번역 품질. 원어민 검수를 대신하지 않는다(`docs/I18N_SYSTEM.md`).
 *   ② 삭제 안내 §1의 `[설정]`·`[문의하기]`·`[탈퇴]` 대괄호 라벨은 `locales/*.json`의
 *      실제 앱 문자열을 보고 옮긴 것이다. 그 키를 바꾸면 **법적 문서가 조용히 어긋난다** —
 *      구조도 지문도 안 바뀌므로 아무도 모른다. Play 심사자가 따라가는 클릭 경로라 아프다.
 */
