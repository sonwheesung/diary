/**
 * 번들 크기 게이트. `npm run check:bundle`
 *
 * ⚠ **상시 게이트가 아니다.** 콜드 실행이 수 분 걸리므로 `typecheck`·`lint`처럼 매번 돌리지 않는다.
 *   돌려야 하는 때는 둘뿐이다:
 *     ① 새 런타임 의존성이 앱 그래프에 처음 들어가는 커밋
 *     ② 릴리스 AAB를 굽기 직전
 *
 * 기준선을 두는 이유: lucide 배럴 임포트가 아이콘 3000여 개를 통째로 끌어와 번들을 부풀렸던
 * 사고가 있었고(docs/README.md), 그런 건 **누가 재보기 전까지 아무도 모른다.**
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * 안드로이드 Hermes 바이트코드 상한.
 *
 * 실측 이력:
 *   2026-08-11  **3.67MB**  lucide 개별 경로 임포트 + `@noble/*` 2종
 *   2026-08-11  **4.88MB**  `react-native-purchases` 추가 (**+1.21MB**)
 *
 * ⚠ RevenueCat SDK 하나가 번들의 4분의 1이다. `@revenuecat/purchases-typescript-internal`과
 *   `purchases-js-hybrid-mappings`를 통째로 끌어오기 때문이다 — 서브패스 임포트로 줄일
 *   방법이 없다(단일 진입점 패키지다).
 *
 * 상한을 6MB로 올린다. **여유가 아니라 관측을 위한 값**이다 — 배럴 임포트 같은 사고는
 * 한 번에 3~4MB를 더하므로 이 정도 상한으로도 잡힌다.
 */
const LIMIT_BYTES = 6 * 1024 * 1024;

const outDir = mkdtempSync(join(tmpdir(), 'jogak-bundle-'));
try {
  console.log('번들 만드는 중… (콜드 실행은 수 분 걸린다)');
  // ⚠ Windows에서 `.cmd`는 실행 파일이 아니라 셸이 해석하는 스크립트다 —
  //   `shell: true` 없이 spawn하면 EINVAL로 죽는다.
  execFileSync('npx', ['expo', 'export', '--platform', 'android', '--output-dir', outDir], {
    stdio: ['ignore', 'ignore', 'inherit'],
    shell: true,
  });

  const jsDir = join(outDir, '_expo', 'static', 'js', 'android');
  const bundles = readdirSync(jsDir).filter(
    (name) => name.endsWith('.hbc') || name.endsWith('.js'),
  );
  if (bundles.length === 0) {
    throw new Error(`번들을 못 찾았다: ${jsDir}`);
  }

  let total = 0;
  for (const name of bundles) {
    const size = statSync(join(jsDir, name)).size;
    total += size;
    console.log(`  ${name}  ${(size / 1024 / 1024).toFixed(2)} MB`);
  }

  const mb = (total / 1024 / 1024).toFixed(2);
  if (total > LIMIT_BYTES) {
    console.error(
      `\n번들이 상한을 넘었다 — ${mb} MB > ${(LIMIT_BYTES / 1024 / 1024).toFixed(2)} MB\n` +
        '방금 추가한 의존성이 배럴 임포트로 들어오지 않았는지 먼저 확인할 것.\n',
    );
    process.exit(1);
  }
  console.log(`\n번들 ok — ${mb} MB (상한 ${(LIMIT_BYTES / 1024 / 1024).toFixed(2)} MB)`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
