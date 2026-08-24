/**
 * Play 서비스 계정이 어느 앱에 닿는가 — `npm run check:play-access`
 *
 * 🔴 **RevenueCat이 "Credentials need attention"만 말하고 이유를 안 알려줄 때 쓴다.**
 *   대시보드는 세 줄이 빨강이라고만 하고, 그게 키 문제인지·API 미활성인지·앱 권한인지
 *   구분해주지 않는다. 여기서 **구글에게 직접 물으면** 한 번에 갈린다.
 *
 * 2026-08-17에 이 스크립트가 실제로 원인을 잡았다. 같은 토큰으로 두 패키지를 부르니
 * `com.son0925.jogak`은 200, `com.son0925.jogak.stg`는 403이었다 —
 * **같은 키가 한쪽만 실패한다면 키·API·프로젝트 문제일 수 없다.** 앱 인가 문제다.
 * 대조군이 있으면 추측이 사실이 된다.
 *
 * ## 두 가지를 따로 본다 — 요구하는 권한 층위가 다르다
 *
 * | 검사 | 필요한 권한 | 어디서 주나 |
 * |---|---|---|
 * | 구독 카탈로그 조회 | 앱 정보 보기(읽기 전용) | **앱 권한**으로 충분 |
 * | 구매 검증 | 재무 데이터·주문 및 구독 관리 | 🔴 **계정 권한**이어야 한다 |
 *
 * 앱 권한만 주면 카탈로그는 초록인데 구매 검증만 빨강으로 남는다 — 실제로 겪었다.
 * RevenueCat 팁 문구가 부르는 이름(*"View financial data, orders, and cancellation
 * survey response"*)이 정확히 **계정 권한** 라벨이다.
 *
 * 🔴 **이 검사는 "출시 권한"을 못 본다 — 조각에서는 거짓 초록이 나온다**(2026-08-24).
 *
 *   여기서 보는 두 가지는 `앱 정보 보기`·`재무 데이터` 권한이다. **AAB 업로드에 필요한
 *   `앱을 테스트 트랙으로 출시`는 별개**이고, 그게 꺼져 있어도 이 표는 전부 초록이다.
 *
 *   다른 앱(LinkMemo·아이디어 저장소)은 권한을 끄면 카탈로그가 403으로 떨어져 구분이 된다.
 *   그런데 **조각의 이 서비스 계정은 RevenueCat용이라 읽기 권한이 상시로 켜져 있어서**
 *   그 신호가 안 나온다 — 초록인데 `eas submit`은 실패한다.
 *
 *   ⚠ 실제로 속았다: `edits.insert` 200 · `tracks.get` 200 · `bundles.upload` 500(403이 아님)을
 *   보고 "권한 있음"으로 단정했는데, **403이 아니라는 것은 권한이 있다는 증거가 아니다.**
 *   업로드가 *"The service account is missing the necessary permissions"* 로 실패하면
 *   이 표를 믿지 말고 `C:/project/common/PLAY_RELEASE_AUTOMATION.md` §4의 켰다 끄기를 한다.
 *
 * ⚠ 키·토큰을 절대 출력하지 않는다. 인쇄하는 것은 HTTP 상태와 구글이 준 메시지뿐이다.
 * ⚠ 키 파일은 저장소 **밖**에 둔다(`C:\project\secrets\`). git에 들어가면 이 스크립트가
 *   편해지는 대신 폭발 반경이 저장소 전체가 된다.
 */
import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const KEY_PATH = process.env.PLAY_SA_KEY ?? 'C:/project/secrets/play-service-account.json';

/**
 * 확인할 패키지. **대조군이 이 표의 값**이므로 잘 되는 앱을 반드시 함께 둔다 —
 * 전부 실패하면 키 문제이고, 일부만 실패하면 인가 문제다. 하나만 보면 그 구분이 안 된다.
 */
const PACKAGES = [
  ['조각 운영', 'com.son0925.jogak'],
  ['조각 stg', 'com.son0925.jogak.stg'],
  ['배구명가', 'com.son0925.volleyball'],
  ['My Word', 'com.myword.front'],
  ['책담', 'com.chaekdam.app'],
  ['LinkMemo', 'com.vivacegames.linkmemo'],
];

const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

if (!existsSync(KEY_PATH)) {
  console.error(`서비스 계정 키가 없다: ${KEY_PATH}`);
  console.error('PLAY_SA_KEY 환경변수로 경로를 넘길 수 있다.');
  process.exit(1);
}

const sa = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const claim =
  b64({ alg: 'RS256', typ: 'JWT' }) +
  '.' +
  b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
const signature = createSign('RSA-SHA256').update(claim).end().sign(sa.private_key, 'base64url');

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: `${claim}.${signature}`,
  }),
});
const token = await tokenRes.json();
if (!token.access_token) {
  console.error(`토큰 발급 실패: ${token.error} — ${token.error_description}`);
  console.error('키 자체가 죽었거나 Cloud 프로젝트에서 서비스 계정이 지워진 경우다.');
  process.exit(1);
}

console.log(`\n서비스 계정  ${sa.client_email}`);
console.log(`Cloud 프로젝트 ${sa.project_id}\n`);
console.log(`${'앱'.padEnd(11)}${'패키지'.padEnd(30)}${'카탈로그'.padEnd(12)}구매 검증`);
console.log('─'.repeat(78));

async function call(url) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token.access_token}` } });
  const raw = await res.text();
  let json = {};
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    /* 204는 본문이 없다 — 오류가 아니다 */
  }
  return { status: res.status, ok: res.ok, message: json.error?.message ?? '' };
}

let denied = 0;
for (const [name, pkg] of PACKAGES) {
  // ① 카탈로그 — 앱 권한으로 충분하다. 204는 "상품이 0개"일 뿐 권한은 있다는 뜻이다
  const catalog = await call(`${API}/${pkg}/subscriptions`);
  /*
   * ② 구매 검증 — **존재하지 않는 토큰으로 부른다.**
   *   권한이 있으면 400(Invalid Value), 없으면 401/403이 온다. 그 차이로 인가만 가린다.
   *   실제 구매 토큰이 필요 없어서 아무 때나 돌릴 수 있는 것이 이 방법의 값이다.
   */
  const verify = await call(
    `${API}/${pkg}/purchases/subscriptionsv2/tokens/PROBE_NOT_A_REAL_TOKEN`,
  );
  const canVerify = !(verify.status === 401 || verify.status === 403);
  if (!catalog.ok || !canVerify) denied += 1;

  console.log(
    name.padEnd(11) +
      pkg.padEnd(30) +
      `${catalog.ok ? '✅' : '❌'} ${catalog.status}`.padEnd(12) +
      `${canVerify ? '✅' : '❌'} ${verify.status}`,
  );
}

console.log('');
if (denied > 0) {
  console.log(`⚠ ${denied}개 앱이 막혀 있다. 의도한 것이면 정상이다 — 권한을 안 준 앱도 여기 나온다.`);
  console.log('  뚫으려면: Play Console → 사용자 및 권한 → 그 서비스 계정');
  console.log('    · 카탈로그만 막힘  → 앱 권한에 그 앱 추가 + 앱 정보 보기(읽기 전용)');
  console.log('    · 구매 검증만 막힘 → 🔴 **계정 권한** 탭의 재무 데이터 + 주문 및 구독 관리');
  console.log('  ⚠ 권한 반영에 시간이 걸린다. 저장 직후 실패해도 잠시 뒤 다시 돌려본다.');
}

/*
 * 실패했든 아니든 **항상** 찍는다. 이 경고는 "막힌 앱이 있을 때"의 문제가 아니라
 * "전부 초록일 때" 속는 문제라, 초록인 실행에서 안 보이면 아무 값이 없다.
 */
console.log('\n🔴 이 표가 전부 초록이어도 AAB 업로드는 막힐 수 있다.');
console.log('   `앱을 테스트 트랙으로 출시`는 여기서 안 보이는 **별개 권한**이다.');
console.log('   조각의 이 계정은 RevenueCat용 읽기 권한이 상시라 그 신호가 안 나온다 —');
console.log('   다른 앱은 권한을 끄면 카탈로그가 403으로 떨어지지만 조각은 200을 유지한다.');
console.log("   업로드가 'missing the necessary permissions'로 실패하면 표를 믿지 말고");
console.log('   C:/project/common/PLAY_RELEASE_AUTOMATION.md §4 (켰다 끄기)를 따른다.');
