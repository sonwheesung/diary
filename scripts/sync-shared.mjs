/**
 * 앱의 **순수 계층**을 조각 서버 안으로 복사한다 — `npm run sync:shared`
 * 어긋났는지만 보려면 `npm run check:shared` (`--check`).
 *
 * ## 왜 복사인가 — tsconfig paths로는 **배포가 안 됐다** (2026-08-18 실측)
 *
 * `server/tsconfig.json`이 `@shared/*` → `../features/*`로 잡혀 있어 로컬 빌드와
 * 로컬 e2e는 전부 통과했다. 그런데 **Vercel CLI는 `.vercel`이 있는 디렉터리(`server/`)만
 * 업로드**한다. `../features`는 업로드 범위 밖이라 그곳에 존재하지 않는다:
 *
 * ```
 * Module not found: Can't resolve '@shared/ai/period'
 * ```
 *
 * 그래서 **AI 라우트는 만든 이래 한 번도 배포된 적이 없었다.** 배포본에서 `POST
 * /api/v1/ai/report`가 404였고, 그 사실이 7일 동안 아무에게도 안 보였다 —
 * 로컬만 보면 전부 초록이기 때문이다.
 *
 * ## 왜 레포 루트에서 배포하지 않나
 *
 * 루트 배포는 대시보드 설정 두 개(Root Directory + *Include source files outside*)에
 * 의존하고, **Expo 앱 소스 전체가 매 배포마다 올라가며**, 프레임워크 탐지가 루트
 * `package.json`(Expo)을 볼 위험이 있다. 설정이 코드 밖에 있어 다음 사람이 못 본다.
 *
 * ## 이 복사가 "두 벌"이 아닌 이유
 *
 * 라우트의 🔴 주석이 막으려던 것은 *"두 벌이 되는 순간 규약이 **조용히** 갈라진다"* 였다.
 * 여기서 갈라짐은 조용하지 않다:
 *   · 파일 첫 줄에 **생성물이라고 박혀 있다** — 손으로 고치면 다음 sync가 덮는다
 *   · `check:shared`가 한 바이트라도 다르면 **실패한다.** 검증 목록에 들어 있다
 *   · `CLAUDE.md` §8이 이미 정한 규약이다 (*"복사해서 쓴다 … 복사 시점을 주석으로 남긴다"*)
 *
 * ⚠ **원본만 고친다.** `features/ai/*.ts`를 고치고 `npm run sync:shared`를 돌린다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * 복사 대상 — **순수 계층만**(프로젝트 내부 임포트 0).
 *
 * ⚠ 여기에 RN·Expo를 들이는 파일을 넣으면 서버 빌드가 그 자리에서 깨진다.
 *   그게 이 목록이 짧아야 하는 이유이고, 원본들이 *"프로젝트 내부 임포트 0"* 을
 *   규약으로 들고 있는 이유이기도 하다.
 */
const FILES = ['ai/types.ts', 'ai/prompt.ts', 'ai/period.ts'];

const SRC = 'features';
const DEST = 'server/shared';

const BANNER = (from) =>
  [
    '/* eslint-disable */',
    '// ─────────────────────────────────────────────────────────────────────────',
    `// 🔴 생성된 파일이다. 고치지 마라 — 원본은 \`${from}\`.`,
    '//',
    '// `npm run sync:shared`가 만든다. 여기를 고치면 다음 sync가 말없이 덮는다.',
    '// 왜 심볼릭 링크나 tsconfig paths가 아닌지는 `scripts/sync-shared.mjs` 참조',
    '// (요약: Vercel CLI가 `server/`만 업로드해서 `../features`가 배포본에 없었다).',
    '// ─────────────────────────────────────────────────────────────────────────',
    '',
  ].join('\n');

/** 줄바꿈만 다른 것은 드리프트가 아니다 — 위 비교 주석 참조 */
const eol = (t) => (t === null ? null : t.split('\r\n').join('\n'));

const check = process.argv.includes('--check');
const drifted = [];

for (const rel of FILES) {
  const from = join(SRC, rel);
  const to = join(DEST, rel);
  const want = BANNER(from.replace(/\\/g, '/')) + readFileSync(from, 'utf8');

  if (check) {
    // ⚠ 없는 것도 어긋난 것이다 — "파일이 없으면 통과"로 두면 검사가 무의미해진다
    const have = existsSync(to) ? readFileSync(to, 'utf8') : null;
    // 🔴 줄바꿈은 정규화하고 비교한다(2026-08-27).
    //   BANNER는 LF로 잇는데 git이 체크아웃하며 디스크 파일을 CRLF로 바꾼다 →
    //   내용이 바이트로 같아도 **브랜치를 바꾸거나 새로 클론한 직후 항상 실패**했다.
    //   상시 빨간 가드는 진짜 드리프트와 구분이 안 되고, 그러면 결국 무시하게 된다.
    //   이 가드가 지키려는 것은 **내용**이지 줄바꿈이 아니다.
    if (eol(have) !== eol(want)) drifted.push(rel);
    continue;
  }

  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, want);
  console.log(`  ${from}  →  ${to}`);
}

if (!check) {
  console.log(`\n순수 계층 복사 ok — ${FILES.length}개`);
  process.exit(0);
}

if (drifted.length > 0) {
  console.error('\n서버의 복사본이 원본과 어긋났다:\n');
  for (const rel of drifted) console.error(`  · ${rel}`);
  console.error('\n  npm run sync:shared 를 돌리고 함께 커밋한다.');
  console.error('  ⚠ 서버가 쓰는 프롬프트·기간 규약이 앱과 다르다는 뜻이다 — 배포하면 갈라진다.');
  process.exit(1);
}

console.log(`공유 계층 ok — ${FILES.length}개가 원본과 같다`);
