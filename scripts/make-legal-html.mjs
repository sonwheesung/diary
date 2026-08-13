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
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// TS 파일을 그대로 읽을 수 없으므로 tsx 없이 정규식으로 뽑지 않고, esbuild 없이
// 간단히 JSON으로 덤프하도록 tsc 대신 node --experimental-strip-types 를 쓴다.
const json = execFileSync(
  process.execPath,
  [
    '--experimental-strip-types',
    '--no-warnings',
    '-e',
    "import('./features/legal/legal-text.ts').then(m => console.log(JSON.stringify({ privacy: m.PRIVACY, deleteAccount: m.DELETE_ACCOUNT, operator: m.OPERATOR })))",
  ],
  { encoding: 'utf8', cwd: process.cwd() },
);
const { privacy, deleteAccount, operator } = JSON.parse(json);

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

const render = (doc) => {
  /*
   * ⚠ **개정 예고는 반드시 함께 게시한다.** 이게 빠지면 30일 사전 고지가 실제로는
   *   일어난 적이 없게 되고(정본 파일에만 적혀 있다), 릴리스 직전에 30일이 통째로
   *   크리티컬 패스가 된다 — 예고본을 만든 이유 전체가 무효가 된다. 실제로 빠져 있었다.
   */
  /*
   * ⚠ `pending`은 **배열**이다(2026-08-12 정정). 시행일이 다른 예고를 각각 담는다 —
   *   합치면 예고를 수정한 것이 되어 30일이 다시 흐르고 앞선 릴리스가 밀린다.
   *   단수 시절 코드가 `doc.pending.sections`를 직접 읽었으므로, 여기를 안 고치면
   *   `undefined.map`으로 **생성이 통째로 죽는다.**
   */
  const pending = (doc.pending ?? [])
    .map(
      (p) => `    <section class="pending">
      <h2>개정 예고</h2>
      <p class="pending-when">적용 시점: ${esc(p.appliesFrom)}</p>
      <p>${linkify(p.summary)}</p>
${p.sections
  .map(
    (s) => `      <h3>${esc(s.h)}</h3>
${s.body.map((line) => `      <p>${linkify(line)}</p>`).join(NL)}`,
  )
  .join(NL)}
    </section>`,
    )
    .join(NL);

  const sections = doc.sections
    .map(
      (s) => `    <section>
      <h2>${esc(s.h)}</h2>
${s.body.map((line) => `      <p>${linkify(line)}</p>`).join('\n')}
    </section>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(doc.title)}</title>
<meta name="description" content="조각 개인정보처리방침 — 수집 항목·목적·보유기간·위탁·국외이전·파기·안전성 조치·이용자 권리">
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
</style>
</head>
<body>
  <h1>${esc(doc.title)}</h1>
  <p class="meta">시행일 ${esc(doc.effective)} · 최종 수정일 ${esc(doc.updated)}</p>
  <p class="intro">${esc(doc.intro)}</p>
${sections}
${pending}
  <footer>
    ${esc(operator.name)} (${esc(operator.brand)}) · 대표 ${esc(operator.representative)}<br>
    문의 <a href="mailto:${esc(operator.contactEmail)}">${esc(operator.contactEmail)}</a>
  </footer>
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
for (const [file, doc] of [
  ['privacy.html', privacy],
  ['delete-account.html', deleteAccount],
]) {
  const out = render(doc);
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
console.log('      https://sonwheesung.github.io/diary/delete-account.html  (push하면 반영)');
