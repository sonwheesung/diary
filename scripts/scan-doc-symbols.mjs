/**
 * 문서가 백틱으로 인용한 **식별자**가 코드에 실재하는지 본다.
 *
 * 🔴 **0이 목표가 아니다.** 타 프로젝트 심볼(common_server 의 `RC_SANDBOX_GRANT` 등)·
 *   외부 라이브러리·SQL 예약어가 정당하게 걸린다. 유형 분류는
 *   `.claude/skills/doc-consistency/SKILL.md` 의 "기지 오탐"과 같은 규약으로 다룬다.
 *
 * ⚠ 코드 전체를 **한 번만** 읽어 인덱스를 만든다. 심볼마다 grep 하면 문서 하나에 2분이 넘는다.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', '.git', 'android', 'ios', '.expo', 'dist', '.next', '.cache']);
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|json|sql)$/;

/** 코드에 등장하는 모든 낱말 */
const words = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (CODE.test(e.name)) {
      for (const m of fs.readFileSync(p, 'utf8').matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) {
        words.add(m[0]);
      }
    }
  }
})(ROOT);

const docs = process.argv.slice(2);
if (docs.length === 0) {
  const dir = path.join(ROOT, 'docs');
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) docs.push(`docs/${f}`);
  docs.push('CLAUDE.md');
}

let total = 0;
for (const d of docs) {
  const text = fs.readFileSync(path.join(ROOT, d), 'utf8');
  const seen = new Set();
  for (const m of text.matchAll(/`([A-Za-z_][A-Za-z0-9_]{3,})`/g)) seen.add(m[1]);
  const missing = [...seen].filter((s) => !words.has(s)).sort();
  total += missing.length;
  console.log(`${d.padEnd(34)} ${missing.length === 0 ? '(전부 실재)' : missing.join(' ')}`);
}
console.log(`\n코드 낱말 ${words.size}개 · 문서 ${docs.length}개 · 미존재 인용 ${total}건`);
