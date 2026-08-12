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
import { PRIVACY } from '../features/legal/legal-text.ts';
import { PRIVACY_EN } from '../features/legal/translations/en.ts';
import { PRIVACY_JA } from '../features/legal/translations/ja.ts';
import { PRIVACY_ZH_HANS } from '../features/legal/translations/zh-Hans.ts';
import { PRIVACY_ZH_HANT } from '../features/legal/translations/zh-Hant.ts';
import { PRIVACY_ES } from '../features/legal/translations/es.ts';
import { PRIVACY_PT_BR } from '../features/legal/translations/pt-BR.ts';
import { PRIVACY_FR } from '../features/legal/translations/fr.ts';
import { PRIVACY_DE } from '../features/legal/translations/de.ts';
import { PRIVACY_IT } from '../features/legal/translations/it.ts';
import { PRIVACY_RU } from '../features/legal/translations/ru.ts';

const TRANSLATIONS = {
  en: PRIVACY_EN,
  ja: PRIVACY_JA,
  'zh-Hans': PRIVACY_ZH_HANS,
  'zh-Hant': PRIVACY_ZH_HANT,
  es: PRIVACY_ES,
  'pt-BR': PRIVACY_PT_BR,
  fr: PRIVACY_FR,
  de: PRIVACY_DE,
  it: PRIVACY_IT,
  ru: PRIVACY_RU,
};

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

const base = shape(PRIVACY);

console.log('\n처리방침 번역 구조');

for (const [lang, doc] of Object.entries(TRANSLATIONS)) {
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
        `${i + 1}번째 절의 줄 수: ko=${base.sections[i]} ${lang}=${got.sections[i]} — "${PRIVACY.sections[i].h}"`,
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
    assert(doc.effective === PRIVACY.effective, `시행일: ko=${PRIVACY.effective} ${lang}=${doc.effective}`);
    assert(doc.updated === PRIVACY.updated, `수정일: ko=${PRIVACY.updated} ${lang}=${doc.updated}`);
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

console.log('');
const missing = 15 - 1 - Object.keys(TRANSLATIONS).length;
if (missing > 0) {
  console.log(`  ⏭ 아직 한국어 원문을 보여주는 언어가 ${missing}개 남았다 (번역이 없으면 원문이다)`);
}

if (failures.length > 0) {
  console.error(`\n처리방침 번역 — ${failures.length}개 실패\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`처리방침 번역 ok — ${passed}개 검사 통과\n`);
