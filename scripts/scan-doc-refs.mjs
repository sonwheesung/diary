/**
 * 문서 → 파일 참조 무결성 스캔.
 *
 * 문서가 백틱으로 인용한 **확장자 있는 경로**가 레포에 실재하는지 본다.
 *
 * 🔴 **깨짐이 0이 되는 것이 목표가 아니다.** 의도적으로 실재하지 않는 대상이 있다
 *   (레포 밖 공용 문서 · 타 프로젝트 · CNG 산출물 · ❌ 미작성으로 등재된 문서 · 이전 이력 인용).
 *   유형별 분류와 기준선은 `.claude/skills/doc-consistency/SKILL.md` 의 "기지 오탐" 표에 있다 —
 *   **거기 8유형에 안 들어가면 진짜 드리프트다.**
 *
 * ⚠ `../CLAUDE.md` 같은 상대경로는 풀지 않는다. 그건 스캐너의 한계이지 드리프트가 아니다.
 *
 * 기준선(2026-09-04): 문서 36개 · 인용 511건(고유 191) · 깨짐 27건 — **전부 정당**.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.git', 'android', 'ios', '.expo', 'dist', '.next']);

/** 레포 안 모든 파일의 상대경로 집합 */
const files = new Set();
(function walk(dir, rel = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r);
    else files.add(r);
  }
})(ROOT);

const docs = [];
(function collect(dir, rel = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) collect(path.join(dir, e.name), r);
    else if (e.name.endsWith('.md')) docs.push(r);
  }
})(ROOT);

// 파일처럼 보이는 인용: 백틱 안, 확장자 있는 경로
const RE = /`([A-Za-z0-9_./@()[\]-]+\.(?:ts|tsx|js|jsx|mjs|json|md|sql|html|py|sh|jks|gradle|yml|yaml))`/g;

const broken = new Map(); // ref -> [문서:줄]
let total = 0;
const seen = new Set();

for (const d of docs) {
  if (d.startsWith('.claude/')) continue;
  const lines = fs.readFileSync(path.join(ROOT, d), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(RE)) {
      const ref = m[1];
      seen.add(ref);
      total++;
      // 존재 판정: 정확 일치 또는 어떤 파일의 접미사
      const ok =
        files.has(ref) ||
        [...files].some((f) => f === ref || f.endsWith('/' + ref) || f.endsWith(ref));
      if (!ok) {
        if (!broken.has(ref)) broken.set(ref, []);
        broken.get(ref).push(`${d}:${i + 1}`);
      }
    }
  });
}

console.log(`문서 ${docs.filter((d) => !d.startsWith('.claude/')).length}개 · 인용 ${total}건 · 고유 ${seen.size}개`);
console.log(`깨짐 ${broken.size}개\n`);
for (const [ref, at] of [...broken].sort()) {
  console.log(`${ref}\n    ${at.slice(0, 3).join(' , ')}${at.length > 3 ? ` (+${at.length - 3})` : ''}`);
}
