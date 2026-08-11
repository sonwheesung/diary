/**
 * 다국어 백업/복원 왕복 검증.
 *
 * `features/backup/manifest.ts`의 UTF-8 인코더는 **손으로 짠 것**이다(순수 계층이라
 * TextEncoder를 못 쓴다). 손으로 짠 UTF-8은 정확히 다음에서 깨진다:
 *   서러게이트 쌍 · 결합 문자 · ZWJ 이모지 · 국기(지역 표시 문자) · 이형자 선택자
 * 그래서 스크립트별로 실제 문장을 넣어 **바이트 단위로** 대조한다.
 */
import { decodeUtf8, encodeUtf8 } from '../features/backup/manifest.ts';
import { openManifest, sealManifest } from '../features/backup/package.ts';

const SAMPLES = {
  '한국어': '오늘은 비가 왔다. 우산을 안 가져와서 흠뻑 젖었지만, 이상하게 기분은 좋았어.',
  '한국어(옛한글)': 'ᄒᆞᄂᆞᆯ 아래 첫 걸음, ᄡᅳ고 ᄉᆡᆼ각ᄒᆞ다',
  '한국어(자모분리)': '각난', // 조합형 각난
  '日本語': '今日は雨が降った。傘を持ってこなかったので、びしょ濡れになった。でも不思議と気分は良かった。',
  '日本語(かな)': 'ひらがな・カタカナ・半角ｶﾀｶﾅ、そして絵文字😊',
  '简体中文': '今天下雨了。没带伞，淋得浑身湿透，但心情却出奇地好。',
  '繁體中文': '今天下雨了。沒帶傘，淋得渾身濕透，但心情卻出奇地好。',
  '中文(生僻字)': '龘䶵𠮷𡃁 — 확장 한자면(U+20000 이상)',
  'ไทย': 'วันนี้ฝนตก ฉันไม่ได้เอาร่มมา เปียกไปทั้งตัว แต่กลับรู้สึกดีอย่างประหลาด',
  'ไทย(결합)': 'เ ก ษ ต ร ์ ที่ ำ ํ ๊ ๋ ็',
  'Русский': 'Сегодня шёл дождь. Я не взял зонт и промок насквозь, но настроение было странно хорошим.',
  'Tiếng Việt': 'Hôm nay trời mưa. Tôi không mang ô nên ướt sũng, nhưng lại thấy vui một cách kỳ lạ.',
  'العربية(RTL)': 'اليوم أمطرت السماء. لم أحضر مظلة فابتللت تمامًا.',
  'עברית(RTL)': 'היום ירד גשם. לא הבאתי מטרייה ונרטבתי לגמרי.',
  'Deutsch': 'Heute hat es geregnet. Straßenbahnhaltestelle, Fußgängerübergang, Grüße!',
  'Français': 'Il a plu aujourd’hui. J’étais trempé — mais bizarrement heureux. Œuf, cœur, naïve.',
  'emoji-ZWJ': '가족 👨‍👩‍👧‍👦 그리고 👩🏽‍💻 오늘',
  'emoji-국기': '🇰🇷 🇯🇵 🇨🇳 🇺🇸 🇹🇭 🇻🇳',
  'emoji-피부톤': '👍🏻👍🏼👍🏽👍🏾👍🏿',
  '결합문자(NFD)': 'égalé — 조합된 e+´ (NFC의 é와 다른 바이트다)',
  '결합문자(NFC)': 'égalé — 완성형 é',
  '이형자선택자': '󠄀葛󠄀 · ⌚︎ · ✔️',
  '수학기호': '𝔘𝔫𝔦𝔠𝔬𝔡𝔢 ∑∫√∞ ℝℕℤ',
  '제어문자': '줄바꿈\n탭\t그리고 널 아닌 것들',
  '혼합': '오늘 会議 で meeting 했다 🇰🇷 — mixed script 混在 ผสม',
};

let passed = 0;
const failures = [];

const bytesEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const codepoints = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join(' ');

function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}\n       ${error.message}`);
  }
}

// ── 1. UTF-8 인코더 자체 — Node의 Buffer와 **바이트가 같아야** 한다 ────────────
console.log('\n[1] UTF-8 인코딩이 표준과 일치하는가 (Node Buffer 대조)\n');
for (const [label, text] of Object.entries(SAMPLES)) {
  check(`인코딩 ${label}`, () => {
    const mine = encodeUtf8(text);
    const std = new Uint8Array(Buffer.from(text, 'utf8'));
    if (!bytesEqual(mine, std)) {
      throw new Error(
        `바이트 불일치\n       내 것 ${mine.length}B: ${[...mine.slice(0, 24)].map((b) => b.toString(16)).join(' ')}…\n` +
          `       표준 ${std.length}B: ${[...std.slice(0, 24)].map((b) => b.toString(16)).join(' ')}…`,
      );
    }
  });
  check(`디코딩 ${label}`, () => {
    const back = decodeUtf8(new Uint8Array(Buffer.from(text, 'utf8')));
    if (back !== text) {
      throw new Error(`문자열 불일치\n       기대 ${codepoints(text).slice(0, 120)}\n       실제 ${codepoints(back).slice(0, 120)}`);
    }
  });
}

// ── 2. 전체 경로 — 실제 일기처럼 매니페스트에 담아 봉인·개봉 ───────────────────
console.log('[2] 매니페스트 → 봉인 → 개봉 → 매니페스트\n');

const KEYS = {
  dek: new Uint8Array(32).fill(7),
  kid: Uint8Array.of(1, 2, 3, 4),
};
const nonceFor = (part) => { const n = new Uint8Array(24); n[23] = part + 1; return n; };

const diaries = Object.entries(SAMPLES).map(([label, text], i) => ({
  id: `d${i}`,
  entry_date: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`,
  title: label,
  content: text,
  content_blocks: JSON.stringify([{ type: 'text', value: text }]),
  emotion: 'joy',
  created_at: 1000 + i,
  updated_at: 2000 + i,
  deleted_at: null,
}));

const manifest = {
  dbVersion: 4,
  diaries,
  images: [],
  tags: Object.keys(SAMPLES).map((name, i) => ({ id: `t${i}`, name, created_at: i })),
  diaryTags: diaries.map((d, i) => ({ diary_id: d.id, tag_id: `t${i}` })),
};

check('전체 경로 — 단일 파트', () => {
  const sealed = sealManifest(manifest, KEYS, { seq: 1, genId: new Uint8Array(8), version: 1, nonceFor });
  const opened = openManifest(sealed, KEYS);
  compare(manifest, opened.manifest);
});

check('전체 경로 — 여러 파트로 쪼개도 (파트 경계가 문자를 자르지 않는가)', () => {
  const sealed = sealManifest(manifest, KEYS, {
    seq: 2, genId: new Uint8Array(8), version: 1, nonceFor, targetPartBytes: 300,
  });
  if (sealed.length < 5) throw new Error(`나뉘지 않았다 (${sealed.length}파트)`);
  const opened = openManifest(sealed, KEYS);
  compare(manifest, opened.manifest);
});

function compare(want, got) {
  for (let i = 0; i < want.diaries.length; i += 1) {
    const a = want.diaries[i];
    const b = got.diaries[i];
    if (b === undefined) throw new Error(`조각 ${i}(${a.title})가 없다`);
    for (const key of ['title', 'content', 'content_blocks']) {
      if (a[key] !== b[key]) {
        throw new Error(
          `${a.title} · ${key} 불일치\n       기대 ${codepoints(String(a[key])).slice(0, 100)}\n       실제 ${codepoints(String(b[key])).slice(0, 100)}`,
        );
      }
    }
  }
  for (let i = 0; i < want.tags.length; i += 1) {
    if (want.tags[i].name !== got.tags[i]?.name) {
      throw new Error(`태그 ${i} 불일치: ${want.tags[i].name} != ${got.tags[i]?.name}`);
    }
  }
}

// ── 3. 정규화가 일어나지 않는가 (NFC/NFD를 건드리면 안 된다) ──────────────────
console.log('[3] 정규화 사고 — 입력 형태를 그대로 보존하는가\n');
check('NFD를 NFC로 바꾸지 않는다', () => {
  const nfd = 'é';
  const nfc = 'é';
  if (nfd.normalize('NFC') !== nfc) throw new Error('테스트 전제가 틀렸다');
  const back = decodeUtf8(encodeUtf8(nfd));
  if (back !== nfd) throw new Error(`NFD가 ${codepoints(back)}로 바뀌었다 — 조각이 다른 글자가 된다`);
  if (back === nfc) throw new Error('NFC로 정규화됐다');
});

// ── 4. 깨진 입력에 죽지 않는가 ────────────────────────────────────────────────
console.log('[4] 잘못된 입력에 앱이 죽지 않는가\n');
check('짝 없는 서러게이트가 있어도 throw하지 않는다', () => {
  const lone = '앞\uD83D뒤'; // high surrogate 단독
  const out = encodeUtf8(lone);
  if (!(out instanceof Uint8Array)) throw new Error('Uint8Array가 아니다');
  decodeUtf8(out); // 죽지만 않으면 된다
});

// ── 결과 ──────────────────────────────────────────────────────────────────────
console.log('');
if (failures.length > 0) {
  console.error(`다국어 왕복 실패 ${failures.length}건\n`);
  for (const f of failures) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`다국어 왕복 ok — ${passed}개 검사 통과 (스크립트 ${Object.keys(SAMPLES).length}종)\n`);
