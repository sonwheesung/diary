/**
 * 법적 고지 번역 **하나만** 대조한다 — `node scripts/check-legal-one.mjs delete-account ja`
 *
 * `check:legal`은 레지스트리에 등록된 번역만 본다. 그래서 15개를 다 채우기 전에는
 * **방금 쓴 번역을 확인할 방법이 없었다** — 등록하면 나머지가 없다고 실패하고,
 * 등록을 안 하면 아무 검사도 안 받는다. 번역을 나눠서 채울 때 그 틈이 계속 걸린다.
 *
 * ⚠ 이건 `check:legal`을 대신하지 않는다. 지문·시행일·한글 잔존까지 보지만,
 *   "빠진 언어가 없는가"는 여전히 `check:legal`만 안다.
 */
import { DELETE_ACCOUNT, PRIVACY, TERMS } from '../features/legal/legal-text.ts';
import { fingerprint } from '../features/legal/fingerprint.ts';

const [doc, lang] = process.argv.slice(2);
if (doc === undefined || lang === undefined) {
  console.error('사용법: node scripts/check-legal-one.mjs <privacy|delete-account|terms> <lang>');
  process.exit(1);
}

const SOURCE = { privacy: PRIVACY, 'delete-account': DELETE_ACCOUNT, terms: TERMS }[doc];
if (SOURCE === undefined) {
  console.error(`문서가 'privacy', 'delete-account' 또는 'terms'여야 한다 — 받은 값: ${doc}`);
  process.exit(1);
}

/** `zh-Hans` → `ZH_HANS`. 번역 파일의 export 이름 규약 */
const suffix = lang.toUpperCase().replace(/-/g, '_');
const exportName = `${doc.toUpperCase().replace(/-/g, '_')}_${suffix}`;

const mod = await import(`../features/legal/translations/${lang}.ts`);
const target = mod[exportName];
if (target === undefined) {
  console.error(`${lang}.ts에 ${exportName}이 없다.`);
  process.exit(1);
}

const shape = (d) => ({
  sections: d.sections.map((s) => s.body.length),
  pending: (d.pending ?? []).map((p) => p.sections.map((s) => s.body.length)),
});

const problems = [];
const base = shape(SOURCE);
const got = shape(target);

if (JSON.stringify(base.sections) !== JSON.stringify(got.sections)) {
  problems.push(`절·줄 수: ko=${JSON.stringify(base.sections)} ${lang}=${JSON.stringify(got.sections)}`);
}
if (JSON.stringify(base.pending) !== JSON.stringify(got.pending)) {
  problems.push(`개정 예고: ko=${JSON.stringify(base.pending)} ${lang}=${JSON.stringify(got.pending)}`);
}

const current = fingerprint(SOURCE);
if (target.sourceFingerprint !== current) {
  problems.push(`지문: ${target.sourceFingerprint} ≠ ${current} (한국어를 다시 읽고 고칠 것)`);
}
if (target.effective !== SOURCE.effective || target.updated !== SOURCE.updated) {
  problems.push(
    `시행일·수정일: ko=${SOURCE.effective}/${SOURCE.updated} ${lang}=${target.effective}/${target.updated}`,
  );
}

const all = [
  target.title,
  target.intro,
  ...target.sections.flatMap((s) => [s.h, ...s.body]),
  ...(target.pending ?? []).flatMap((p) => [
    p.appliesFrom,
    p.summary,
    ...p.sections.flatMap((s) => [s.h, ...s.body]),
  ]),
];
const empty = all.filter((v) => typeof v !== 'string' || v.trim().length === 0);
if (empty.length > 0) problems.push(`빈 값 ${empty.length}개`);

if (lang !== 'ko') {
  const left = all.filter((v) => typeof v === 'string' && /[가-힣]/.test(v));
  if (left.length > 0) {
    problems.push(`번역 안 된 줄 ${left.length}개 — 첫 줄: ${left[0].slice(0, 50)}`);
  }
}

if (problems.length > 0) {
  console.error(`\n${doc} / ${lang} — ${problems.length}개 문제\n`);
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log(`${doc} / ${lang} ok — 절 ${got.sections.length}개, 개정 예고 ${got.pending.length}개`);
