/**
 * 법적 고지 정본(`features/legal/legal-text.ts`) → 게시용 정적 HTML.
 *
 * ★ 왜 생성인가: 배구명가에서 **웹 페이지가 앱 내 정본에서 드리프트해 필수 항목이 누락된 사고**가
 *   있었다(server/app/privacy/page.tsx 주석). 손으로 두 곳을 맞추는 방식은 반드시 어긋난다.
 *   여기서는 한쪽만 정본으로 두고 나머지를 **뽑아낸다** — 어긋날 수가 없다.
 *
 * 실행: npm run legal:html
 * 결과: docs/privacy.html · docs/delete-account.html
 *       (어디에 올려도 되는 의존성 0의 정적 파일)
 *
 * 계정 삭제 안내가 여기 함께 있는 이유: Play 데이터 보안 선언이 **웹 삭제 URL**을 요구한다.
 * 앱 안의 탈퇴만으로는 부족하다 — 앱을 이미 지운 사람이 요청할 길이 있어야 한다.
 * 사업자 정보가 두 문서에서 어긋나지 않도록 **같은 정본에서 함께** 뽑는다.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// TS 파일을 그대로 읽을 수 없으므로 tsx 없이 정규식으로 뽑지 않고, esbuild 없이
// 간단히 JSON으로 덤프하도록 tsc 대신 node --experimental-strip-types 를 쓴다.
const json = execFileSync(
  process.execPath,
  [
    '--experimental-strip-types',
    '--no-warnings',
    '-e',
    "Promise.all([import('./features/legal/legal-text.ts'), import('./features/legal/registry.ts')]).then(([m, r]) => console.log(JSON.stringify({ privacy: m.PRIVACY, deleteAccount: m.DELETE_ACCOUNT, terms: m.TERMS, operator: m.OPERATOR, translations: r.TRANSLATIONS, deleteTranslations: r.DELETE_ACCOUNT_TRANSLATIONS, termsTranslations: r.TERMS_TRANSLATIONS })))",
  ],
  { encoding: 'utf8', cwd: process.cwd() },
);
const { privacy, deleteAccount, terms, operator, translations, deleteTranslations, termsTranslations } =
  JSON.parse(json);

/**
 * 🔴 **게시본도 다국어여야 한다** (2026-08-14).
 *
 * 번역 15개는 **앱 안에서만** 보이고, GitHub Pages로 게시된 URL은 `<html lang="ko">`
 * 한국어뿐이었다. 그런데 그 URL이 바로 **Play 심사자와 국외 이용자가 클릭하는 주소**다 —
 * 읽을 수 없는 고지는 고지가 아니라는 `resolve.ts`의 근거가 여기서 무너져 있었다.
 *
 * ⚠ **파일을 언어별로 쪼개지 않는다.** Play 데이터 보안 선언에 등록된 URL이 바뀌면
 *   선언을 다시 제출해야 한다. 한 파일 안에 모든 언어를 넣고 전환기를 단다 — 주소는 그대로다.
 */
const UI = Object.fromEntries(
  ['ko', ...Object.keys(translations)].map((lang) => [
    lang,
    JSON.parse(readFileSync(`locales/${lang}.json`, 'utf8')).legal,
  ]),
);

/** 언어 이름은 **그 언어로** 적는다(`I18N_SYSTEM` §4.3) — 'Korean'이면 자기 언어를 못 찾는다 */
const LABELS = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  tr: 'Türkçe',
};

/** 템플릿 리터럴 안에서 개행을 넣으려면 상수로 빼는 편이 읽기 쉽다 */
const NL = String.fromCharCode(10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * 본문 줄을 HTML로. URL은 링크로, `**강조**`는 굵게.
 *
 * ⚠ 정본(`legal-text.ts`)은 마크다운 강조를 쓰는데 생성기가 그걸 그대로 흘려보내고 있었다 —
 *   게시된 법적 문서에 `**`가 26개 노출돼 있었다(2026-08-12 발견). 앱 화면은 Text라
 *   어차피 평문이지만, HTML은 렌더할 수 있으니 렌더한다.
 *
 * 순서: esc → 강조 → 링크. `*`는 esc 대상이 아니고 URL에 `**`가 들어갈 일이 없어 서로 간섭하지 않는다.
 */
const linkify = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" rel="noopener">$1</a>');

/** `{{key}}` 자리를 채운다 — 로케일 문구가 i18next 형식이라 그대로 쓴다 */
const fill = (tpl, vars) =>
  String(tpl).replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : `{{${k}}}`));

const renderBody = (doc, lang) => {
  const ui = UI[lang] ?? UI.ko;
  /*
   * ⚠ **개정 예고는 반드시 함께 게시한다.** 이게 빠지면 30일 사전 고지가 실제로는
   *   일어난 적이 없게 된다(정본 파일에만 적혀 있다). 실제로 빠져 있었다.
   * ⚠ `pending`은 **배열**이다 — 시행일이 다른 예고를 각각 담는다.
   */
  const pending = (doc.pending ?? [])
    .map(
      (p) => `      <section class="pending">
        <h2>${esc(ui.pendingTitle)}</h2>
        <p class="pending-when">${esc(fill(ui.appliesFrom, { when: p.appliesFrom }))}</p>
        <p>${linkify(p.summary)}</p>
${p.sections
  .map(
    (s) => `        <h3>${esc(s.h)}</h3>
${s.body.map((line) => `        <p>${linkify(line)}</p>`).join(NL)}`,
  )
  .join(NL)}
      </section>`,
    )
    .join(NL);

  const sections = doc.sections
    .map(
      (s) => `      <section>
        <h2>${esc(s.h)}</h2>
${s.body.map((line) => `        <p>${linkify(line)}</p>`).join(NL)}
      </section>`,
    )
    .join(NL);

  /* 🔴 번역본에는 **한국어본이 우선한다**를 반드시 띄운다(`resolve.ts` 규약 1) */
  const governs =
    lang === 'ko' ? '' : `      <p class="governs">${esc(ui.koreanGoverns)}</p>${NL}`;

  return `    <article class="doc" data-lang="${lang}" lang="${lang}"${lang === 'ko' ? '' : ' hidden'}>
      <h1>${esc(doc.title)}</h1>
      <p class="meta">${esc(fill(ui.effectiveUpdated, { effective: doc.effective, updated: doc.updated }))}</p>
${governs}      <p class="intro">${esc(doc.intro)}</p>
${sections}
${pending}
    </article>`;
};

/**
 * 문서 하나를 **모든 언어가 든 한 파일**로 만든다.
 *
 * ⚠ 스위처는 순수 HTML+JS다. 외부 의존성이 0이어야 어디에 올려도 그대로 뜨고,
 *   법적 고지가 CDN 장애로 안 보이는 일이 없다.
 * ⚠ 기본은 **한국어**(정본)다. JS가 죽어도 한국어는 보인다 — `hidden`이 나머지에만 붙는다.
 */
const render = (docs) => {
  const langs = Object.keys(docs);
  const nav =
    langs.length < 2
      ? ''
      : `  <nav class="langs" aria-label="Language">
${langs
  .map(
    (l) =>
      `    <button type="button" data-go="${l}" lang="${l}"${l === 'ko' ? ' aria-current="true"' : ''}>${esc(LABELS[l] ?? l)}</button>`,
  )
  .join(NL)}
  </nav>`;

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(docs.ko.title)}</title>
<meta name="description" content="${esc(docs.ko.intro).slice(0, 150)}">
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0 auto; max-width: 760px; padding: 32px 20px 80px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
    line-height: 1.85; color: #1F2A44; background: #F5F7FA;
    word-break: keep-all; overflow-wrap: anywhere;
  }
  h1 { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
  .meta { color: #7A8699; font-size: 13px; margin: 0 0 24px; }
  .intro { color: #1F2A44; }
  section {
    background: #FFFFFF; border: 1px solid #E3E9F2; border-radius: 14px;
    padding: 20px; margin-top: 16px;
  }
  h2 { font-size: 17px; font-weight: 700; margin: 0 0 10px; }
  p { color: #48566E; margin: 6px 0; }
  a { color: #2C4A7C; }
  footer { color: #7A8699; font-size: 13px; margin-top: 28px; }
  @media (prefers-color-scheme: dark) {
    body { color: #E8ECF4; background: #12161F; }
    .intro { color: #E8ECF4; }
    section { background: #1A2030; border-color: #2A3244; }
    p { color: #AEB8C9; }
    a { color: #8AB0E8; }
  }
  /* 예고는 아직 시행되지 않은 내용이다 — 본문과 눈으로 구분돼야 오해가 없다 */
  .pending {
    margin-top: 48px; padding: 20px; border: 1px solid #C0564B; border-radius: 12px;
  }
  .pending h2 { color: #C0564B; margin-top: 0; }
  .pending-when { font-weight: 600; }
  /* 언어 전환기 — 자기 언어를 찾는 사람이 스크롤하지 않아도 되게 맨 위에 둔다 */
  .langs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 24px; }
  .langs button {
    font: inherit; font-size: 13px; padding: 5px 11px; cursor: pointer;
    color: #48566E; background: #FFFFFF;
    border: 1px solid #E3E9F2; border-radius: 999px;
  }
  .langs button[aria-current] { color: #FFFFFF; background: #2C4A7C; border-color: #2C4A7C; }
  /* 🔴 번역본이라는 사실과 정본이 무엇인지를 본문보다 먼저 알린다 */
  .governs {
    margin: 0 0 20px; padding: 10px 14px; font-size: 13px;
    color: #7A6A2C; background: #FDF7E3; border: 1px solid #E8DCA8; border-radius: 10px;
  }
  @media (prefers-color-scheme: dark) {
    .langs button { color: #AEB8C9; background: #1A2030; border-color: #2A3244; }
    .langs button[aria-current] { color: #12161F; background: #8AB0E8; border-color: #8AB0E8; }
    .governs { color: #E0CE8E; background: #241F10; border-color: #4A3F1C; }
  }
</style>
</head>
<body>
${nav}
${langs.map((l) => renderBody(docs[l], l)).join(NL)}
  <footer>
    ${esc(operator.name)} (${esc(operator.brand)}) · ${esc(operator.representative)}<br>
    <a href="mailto:${esc(operator.contactEmail)}">${esc(operator.contactEmail)}</a>
  </footer>
<script>
(function () {
  var docs = [].slice.call(document.querySelectorAll('.doc'));
  var btns = [].slice.call(document.querySelectorAll('[data-go]'));
  function show(lang) {
    /*
     * 🔴 **먼저 있는지 보고, 있을 때만 바꾼다.** 반대로 하면(다 숨긴 뒤 확인)
     *   지원하지 않는 언어에서 전부 숨겨진 채 false가 나와 **페이지가 백지가 된다** —
     *   폴백이 가장 필요한 사용자가 정확히 그 경우다.
     */
    var found = false;
    docs.forEach(function (d) {
      if (d.getAttribute('data-lang') === lang) found = true;
    });
    if (!found) return false;
    docs.forEach(function (d) {
      d.hidden = d.getAttribute('data-lang') !== lang;
    });
    document.documentElement.lang = lang;
    btns.forEach(function (b) {
      if (b.getAttribute('data-go') === lang) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    return true;
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-go');
      show(l);
      try { history.replaceState(null, '', '#' + l); } catch (e) {}
    });
  });
  /* 우선순위: URL 해시 → 브라우저 언어 → 한국어(정본). 지역 꼬리표는 잘라서 한 번 더 본다 */
  var want = (location.hash || '').replace('#', '') || navigator.language || '';
  if (!show(want)) show(want.split('-')[0]);
})();
</script>
</body>
</html>
`;
};

/*
 * `docs/privacy.html` — GitHub Pages(`docs/` 소스)로 게시된다.
 * my_word가 같은 구조다(docs/privacy-policy.html → sonwheesung.github.io/my_word/...).
 *
 * 출력이 한 곳뿐인 것이 중요하다. 손으로 복사하는 단계를 남겨두면 반드시 잊고,
 * 그 순간 게시본이 정본에서 드리프트한다 — 배구명가에서 정확히 그렇게 법정 필수 항목이 누락됐다.
 */
mkdirSync('docs', { recursive: true });
for (const [file, byLang] of [
  /*
   * ⚠ 처리방침은 번역 14개가 **이미 있다** — 앱에서만 쓰이던 것을 게시본에도 흘려보낸다.
   * ⏭ 계정 삭제 안내는 **영어부터** 넣었다(2026-08-14). Play 심사자가 여는 URL이라
   *    영어 하나만 있어도 심사는 지난다. 나머지 13개는 이어서 채운다 —
   *    `render`가 언어 수로 판단하므로 넣기만 하면 스위처가 저절로 늘어난다.
   */
  ['privacy.html', { ko: privacy, ...translations }],
  ['delete-account.html', { ko: deleteAccount, ...deleteTranslations }],
  /*
   * ⚠ 약관은 **전자상거래법 §13②9호가 "그 약관의 내용을 확인할 수 있는 방법"까지** 요구한다.
   *   그 방법이 이 URL이고, 약관 제4조가 이 주소를 문서 안에 적어놨다 —
   *   파일명을 바꾸면 약관이 자기 자신을 잘못 가리키게 된다.
   */
  ['terms.html', { ko: terms, ...termsTranslations }],
]) {
  const doc = byLang.ko;
  const out = render(byLang);
  writeFileSync(`docs/${file}`, out, 'utf8');
  // 예고가 몇 개이고 각각 몇 절인지 눈으로 확인한다 — 조용히 0개가 되는 것이 이 파일의 사고 유형이다
  const pendings = doc.pending ?? [];
  const extra =
    pendings.length === 0
      ? ''
      : ` + 개정 예고 ${pendings.length}건(${pendings.map((p) => `${p.sections.length}절`).join(' · ')})`;
  console.log(
    `docs/${file} 생성 — ${doc.sections.length}개 섹션${extra}, ${(out.length / 1024).toFixed(1)}KB`,
  );
}
console.log('게시: https://sonwheesung.github.io/diary/privacy.html');
console.log('      https://sonwheesung.github.io/diary/delete-account.html');
console.log('      https://sonwheesung.github.io/diary/terms.html  (push하면 반영)');
