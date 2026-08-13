'use client';
// 조각 운영 콘솔 (docs/ADMIN_SYSTEM.md) — 로그인 게이트 + 4탭(대시보드·AI·금고·정리).
// URL이 /admin이 아닌 건 추측 차단용이고, **실제 보안은 ADMIN_TOKEN**(isAdmin fail-closed).
// 배구명가 /ops-9f3a2c 구조를 승계한다. 외부 스크립트·스타일 0 — 인라인 <style> 하나뿐(XSS 표면 최소).
//
// 🔴 이 화면은 **읽기 전용**이고 **개인을 특정하지 않는다**(ADMIN_SYSTEM §3~§4).
//    subject_id·vault_id를 그리는 코드를 여기 추가하지 않는다 — 라우트가 애초에 안 내려준다.
import { useCallback, useEffect, useRef, useState } from 'react';

type Json = Record<string, unknown>;
type Tab = 'overview' | 'ai' | 'vaults' | 'reap';
type Granularity = 'week' | 'month' | 'year';

/**
 * fetch 자체 실패(서버 다운·오프라인)를 `status: 0`으로 정규화한다.
 *
 * ⚠ 안 잡으면 throw가 호출부의 `setBusy(false)`를 건너뛰어 **버튼이 영구 로딩에 갇힌다.**
 *   배구가 남긴 교훈이라 그대로 가져온다.
 */
async function apiCall(path: string, token: string): Promise<{ status: number; body: Json }> {
  let res: Response;
  try {
    res = await fetch(path, { headers: { authorization: `Bearer ${token}` } });
  } catch {
    return { status: 0, body: { ok: false, reason: 'network' } };
  }
  let body: Json = {};
  try {
    body = (await res.json()) as Json;
  } catch {
    // 빈 200·비JSON도 침묵하지 않는다 — 아래에서 HTTP 상태로 판정한다
  }
  if (body.ok === undefined) {
    body.ok = res.ok;
  }
  return { status: res.status, body };
}

const REASON_KO: Record<string, string> = {
  unauthorized: '권한이 없습니다 — 토큰이 만료되었을 수 있으니 다시 로그인하세요',
  error: '서버 오류가 발생했습니다',
  network: '서버에 연결하지 못했습니다 — 네트워크·서버 상태를 확인하세요',
};

function errMsg(r: { status: number; body: Json }): string {
  const raw = r.body?.reason;
  const reason = typeof raw === 'string' ? raw : '';
  return `${REASON_KO[reason] ?? reason ?? '요청을 처리하지 못했습니다'} (${r.status})`;
}

/**
 * ⚠ **`bigint` 합계는 문자열로 온다.** postgres 드라이버가 `sum(...)::bigint`를
 *   정밀도 손실을 피하려고 문자열로 준다(`"6297823"`) — 숫자만 받으면 용량이 전부
 *   `0 B`로 보인다. 실제로 그렇게 나왔다(2026-08-13 실측).
 */
const num = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};
const fmt = (v: unknown): string => num(v).toLocaleString('ko-KR');

/** 바이트를 사람이 읽는 단위로. 0은 '0 B'로 — 빈칸이면 고장으로 보인다 */
function bytes(v: unknown): string {
  const n = num(v);
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

const CSS = `
:root{--bg:#0a0e16;--panel:#0f1420;--card:#141b29;--card2:#0f1622;--bd:#232d3f;--bd2:#1a2334;--tx:#e7edf6;--mut:#8a97ab;--ac:#5b9bff;--gd:#2bd17e;--dg:#ff6b5a;--wn:#f2a93b;}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--tx);font-family:system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;}
.oc-login{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 600px at 50% -10%,#16243a 0%,var(--bg) 60%);padding:24px;}
.oc-login-card{width:100%;max-width:400px;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:34px 30px;box-shadow:0 24px 60px rgba(0,0,0,.5);}
.oc-logo{font-size:24px;font-weight:900;letter-spacing:-.5px;display:flex;align-items:center;gap:10px;}
.oc-sub{color:var(--mut);font-size:13px;margin:8px 0 24px;line-height:1.6;}
.oc-label{font-size:12px;font-weight:700;color:var(--mut);margin-bottom:7px;display:block;letter-spacing:.4px;}
.oc-input{width:100%;background:var(--card2);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;color:var(--tx);font-size:14px;outline:none;}
.oc-input:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(91,155,255,.16);}
.oc-btn{border:none;border-radius:10px;padding:11px 17px;font-size:14px;font-weight:800;cursor:pointer;background:var(--ac);color:#04121e;}
.oc-btn:hover{filter:brightness(1.08);} .oc-btn:disabled{opacity:.5;cursor:not-allowed;}
.oc-btn.ghost{background:transparent;border:1px solid var(--bd);color:var(--tx);}
.oc-btn.sm{padding:7px 12px;font-size:12.5px;border-radius:8px;}
.oc-btn.on{background:var(--ac);color:#04121e;}
.oc-err{color:var(--dg);font-size:13px;margin-top:12px;}
.oc-shell{display:grid;grid-template-columns:220px 1fr;min-height:100vh;}
.oc-side{background:var(--panel);border-right:1px solid var(--bd2);padding:20px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;}
.oc-nav{display:flex;flex-direction:column;gap:4px;margin-top:22px;flex:1;}
.oc-navitem{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:10px;color:var(--mut);font-size:14px;font-weight:600;cursor:pointer;border:none;background:transparent;text-align:left;width:100%;}
.oc-navitem:hover{background:var(--bd2);color:var(--tx);}
.oc-navitem.on{background:rgba(91,155,255,.14);color:var(--ac);font-weight:800;}
.oc-navitem .ic{width:18px;text-align:center;font-size:15px;}
.oc-navitem .bdg{margin-left:auto;background:var(--wn);color:#1a1200;font-size:11px;font-weight:800;border-radius:999px;padding:1px 7px;}
.oc-main{padding:26px 34px;min-width:0;max-width:1100px;margin:0 auto;width:100%;}
.oc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;gap:12px;flex-wrap:wrap;}
.oc-h1{font-size:22px;font-weight:900;letter-spacing:-.3px;}
.oc-crumb{color:var(--mut);font-size:13px;margin-top:3px;}
.oc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:22px;}
.oc-stat{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;}
.oc-stat .k{color:var(--mut);font-size:12.5px;font-weight:700;}
.oc-stat .v{font-size:26px;font-weight:900;margin-top:8px;letter-spacing:-.5px;}
.oc-stat .s{color:var(--mut);font-size:12px;margin-top:4px;line-height:1.5;}
.oc-stat.warn{border-color:rgba(242,169,59,.5);}
.oc-stat.warn .v{color:var(--wn);}
.oc-card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:20px;margin-bottom:18px;}
.oc-card h3{font-size:15px;font-weight:800;margin:0 0 6px;}
.oc-card .hint{color:var(--mut);font-size:12.5px;margin:0 0 14px;line-height:1.6;}
.oc-table{width:100%;border-collapse:collapse;font-size:13px;}
.oc-table th{text-align:left;color:var(--mut);font-weight:700;font-size:12px;padding:9px 10px;border-bottom:1px solid var(--bd);}
.oc-table td{padding:10px;border-bottom:1px solid var(--bd2);}
.oc-table tr:last-child td{border-bottom:none;}
.oc-table td.n,.oc-table th.n{text-align:right;font-variant-numeric:tabular-nums;}
.oc-empty{color:var(--mut);font-size:13px;padding:22px 0;text-align:center;}
.oc-note{color:var(--mut);font-size:12.5px;line-height:1.7;background:var(--card2);border:1px solid var(--bd2);border-radius:10px;padding:12px 14px;margin-top:14px;}
.oc-seg{display:inline-flex;gap:6px;}
.oc-bars{display:flex;align-items:flex-end;gap:3px;height:110px;margin-top:10px;}
.oc-bars .b{flex:1;background:var(--ac);border-radius:3px 3px 0 0;min-height:2px;opacity:.85;}
.oc-bars .b:hover{opacity:1;}
.oc-barx{display:flex;justify-content:space-between;color:var(--mut);font-size:11px;margin-top:6px;}
.oc-spin{width:30px;height:30px;border:3px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:ocspin .7s linear infinite;margin:60px auto;}
@keyframes ocspin{to{transform:rotate(360deg);}}
@media (max-width:820px){
  .oc-shell{grid-template-columns:1fr;}
  .oc-side{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;}
  .oc-nav{flex-direction:row;flex-wrap:wrap;margin-top:0;}
  .oc-main{padding:20px 16px;}
}
`;

const NAV: { id: Tab; ic: string; label: string }[] = [
  { id: 'overview', ic: '📊', label: '대시보드' },
  { id: 'ai', ic: '✨', label: 'AI 사용량' },
  { id: 'vaults', ic: '🔐', label: '백업 금고' },
  { id: 'reap', ic: '🧹', label: '정리' },
];
const TITLES: Record<Tab, string> = {
  overview: '대시보드',
  ai: 'AI 사용량 · 추정 원가',
  vaults: '백업 금고',
  reap: '정리 (리퍼 백로그)',
};

export default function OpsConsole() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState<boolean | null>(null); // null=확인중

  useEffect(() => {
    const saved = localStorage.getItem('jogakAdminToken') ?? '';
    if (!saved) {
      setAuthed(false);
      return;
    }
    setToken(saved);
    void apiCall('/api/admin/overview', saved).then((r) => setAuthed(r.status !== 401));
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {authed === null ? (
        <div className="oc-login">
          <div className="oc-sub">확인 중…</div>
        </div>
      ) : authed ? (
        <Dashboard
          token={token}
          onLogout={() => {
            localStorage.removeItem('jogakAdminToken');
            setToken('');
            setAuthed(false);
          }}
        />
      ) : (
        <Login
          initial={token}
          onLogin={(t) => {
            setToken(t);
            localStorage.setItem('jogakAdminToken', t);
            setAuthed(true);
          }}
        />
      )}
    </>
  );
}

function Login({ initial, onLogin }: { initial: string; onLogin: (t: string) => void }) {
  const [value, setValue] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    setErr('');
    const r = await apiCall('/api/admin/overview', value.trim());
    setBusy(false);
    if (r.status === 401) {
      /*
       * ⚠ "토큰이 틀렸다"와 "서버에 ADMIN_TOKEN이 없다"를 구별해 말하지 않는다.
       *   구별해주면 미설정 상태를 밖에서 알아낼 수 있다.
       */
      setErr('토큰이 올바르지 않습니다.');
      return;
    }
    if (!r.body.ok) {
      setErr(errMsg(r));
      return;
    }
    onLogin(value.trim());
  };

  return (
    <div className="oc-login">
      <div className="oc-login-card">
        <div className="oc-logo">🧩 조각 운영 콘솔</div>
        <div className="oc-sub">조각 서버 관리자 전용 · ADMIN_TOKEN으로 로그인</div>
        <label className="oc-label" htmlFor="tok">
          ADMIN TOKEN
        </label>
        <input
          id="tok"
          className="oc-input"
          type="password"
          placeholder="관리자 토큰 입력"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void submit()}
          autoFocus
        />
        <button
          className="oc-btn"
          style={{ width: '100%', marginTop: 18 }}
          onClick={() => void submit()}
          disabled={busy || !value.trim()}
        >
          {busy ? '확인 중…' : '로그인'}
        </button>
        {err ? <div className="oc-err">{err}</div> : null}
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [overview, setOverview] = useState<Json | null>(null);
  const [ai, setAi] = useState<Json | null>(null);
  const [vaults, setVaults] = useState<Json | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [o, a, v] = await Promise.all([
      apiCall('/api/admin/overview', token),
      apiCall(`/api/admin/ai?window=${granularity}`, token),
      apiCall('/api/admin/vaults', token),
    ]);
    const failed = [o, a, v].find((r) => !r.body.ok);
    setErr(failed === undefined ? '' : errMsg(failed));
    setOverview(o.body.ok ? o.body : null);
    setAi(a.body.ok ? a.body : null);
    setVaults(v.body.ok ? v.body : null);
    setBusy(false);
  }, [token, granularity]);

  // granularity가 바뀌면 다시 부른다. 최초 1회도 여기서 걸린다.
  const first = useRef(true);
  useEffect(() => {
    void load();
    first.current = false;
  }, [load]);

  const backlog = (vaults?.backlog as Json | undefined) ?? {};
  const backlogTotal =
    num(backlog.staleParts) +
    num(backlog.orphanBlobs) +
    num(backlog.expiredVaults) +
    num(backlog.staleTombstones);

  return (
    <div className="oc-shell">
      <aside className="oc-side">
        <div className="oc-logo" style={{ fontSize: 18, paddingLeft: 6 }}>
          🧩 조각 콘솔
        </div>
        <nav className="oc-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`oc-navitem${tab === n.id ? ' on' : ''}`}
              onClick={() => setTab(n.id)}
            >
              <span className="ic">{n.ic}</span>
              {n.label}
              {n.id === 'reap' && backlogTotal > 0 ? <span className="bdg">{backlogTotal}</span> : null}
            </button>
          ))}
        </nav>
        <button className="oc-btn ghost sm" onClick={onLogout}>
          로그아웃
        </button>
      </aside>

      <main className="oc-main">
        <div className="oc-top">
          <div>
            <div className="oc-h1">{TITLES[tab]}</div>
            <div className="oc-crumb">조각 서버 · 읽기 전용</div>
          </div>
          <button className="oc-btn ghost sm" onClick={() => void load()} disabled={busy}>
            {busy ? '불러오는 중…' : '새로고침'}
          </button>
        </div>

        {err ? <div className="oc-err" style={{ marginBottom: 14 }}>{err}</div> : null}
        {busy && overview === null ? (
          <div className="oc-spin" />
        ) : (
          <>
            {tab === 'overview' && <OverviewTab overview={overview} vaults={vaults} />}
            {tab === 'ai' && (
              <AiTab data={ai} granularity={granularity} onGranularity={setGranularity} />
            )}
            {tab === 'vaults' && <VaultsTab data={vaults} />}
            {tab === 'reap' && <ReapTab data={vaults} />}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  k,
  v,
  s,
  warn,
}: {
  k: string;
  v: string;
  s?: string;
  warn?: boolean;
}) {
  return (
    <div className={`oc-stat${warn ? ' warn' : ''}`}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {s ? <div className="s">{s}</div> : null}
    </div>
  );
}

function OverviewTab({ overview, vaults }: { overview: Json | null; vaults: Json | null }) {
  if (overview === null) {
    return <div className="oc-empty">불러오지 못했습니다.</div>;
  }
  const v = (overview.vaults as Json | undefined) ?? {};
  const ai = (overview.aiThisMonth as Json | undefined) ?? {};
  const p = (overview.policy as Json | undefined) ?? {};
  const parts = (vaults?.parts as Json | undefined) ?? {};
  const blobs = (vaults?.blobs as Json | undefined) ?? {};
  const stored = num(parts.bytes) + num(blobs.bytes);

  return (
    <>
      <div className="oc-grid">
        <Stat k="살아 있는 금고" v={fmt(v.alive)} s={`파기됨 ${fmt(v.purged)}`} />
        <Stat k="저장 용량" v={bytes(stored)} s="커밋된 것만" />
        <Stat
          k="이번 달 AI 호출"
          v={fmt(ai.calls)}
          s={num(ai.unpricedCalls) > 0 ? `⚠ 단가 미등록 ${fmt(ai.unpricedCalls)}건` : undefined}
        />
        <Stat k="이번 달 추정 원가" v={`₩${fmt(ai.krw)}`} s="청구서가 아니다 · 추세용" />
      </div>

      <div className="oc-card">
        <h3>배포된 정책</h3>
        <p className="hint">
          콘솔은 <strong>보여주기만</strong> 한다. 바꾸려면 커밋해야 한다 — 화면에서 바꾸면 앱
          문구(&ldquo;주에 한 번&rdquo;)와의 짝이 배포 없이 깨진다.
        </p>
        <table className="oc-table">
          <tbody>
            <tr>
              <td>리포트 캡</td>
              <td className="n">
                주 {fmt(p.weeklyPerWeek)} · 월 {fmt(p.monthlyPerMonth)} · 연 {fmt(p.yearlyPerYear)}
              </td>
            </tr>
            <tr>
              <td>일일 호출 상한 (폭주 방어)</td>
              <td className="n">{fmt(p.dailyCallCap)}</td>
            </tr>
            <tr>
              <td>입력 상한</td>
              <td className="n">{fmt(p.maxInputChars)}자</td>
            </tr>
            <tr>
              <td>보관 세대 · 구독 만료 유예</td>
              <td className="n">
                {fmt(p.keepGenerations)}세대 · {fmt(p.graceDays)}일
              </td>
            </tr>
            <tr>
              <td>AI 모델 · effort</td>
              <td className="n">
                {String(p.aiModel ?? '—')} · {String(p.aiEffort ?? '—')}
              </td>
            </tr>
            <tr>
              <td>OPENAI_API_KEY</td>
              <td className="n">
                {p.aiKeyConfigured === true ? '설정됨' : '⚠ 미설정 — 리포트 생성이 실패한다'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function AiTab({
  data,
  granularity,
  onGranularity,
}: {
  data: Json | null;
  granularity: Granularity;
  onGranularity: (g: Granularity) => void;
}) {
  if (data === null) {
    return <div className="oc-empty">불러오지 못했습니다.</div>;
  }
  const w = (data.window as Json | undefined) ?? {};
  const t = (data.totals as Json | undefined) ?? {};
  const models = (data.models as Json[] | undefined) ?? [];
  const kinds = (data.kinds as Json[] | undefined) ?? [];
  const trend = (data.trend as Json[] | undefined) ?? [];
  const peak = trend.reduce((m, row) => Math.max(m, num(row.calls)), 0);

  return (
    <>
      <div className="oc-top" style={{ marginBottom: 14 }}>
        <div className="oc-seg">
          {(['week', 'month', 'year'] as Granularity[]).map((g) => (
            <button
              key={g}
              className={`oc-btn sm ${granularity === g ? 'on' : 'ghost'}`}
              onClick={() => onGranularity(g)}
            >
              {g === 'week' ? '이번 주' : g === 'month' ? '이번 달' : '올해'}
            </button>
          ))}
        </div>
        <div className="oc-crumb">
          {String(w.since ?? '')} ~ 지금 · {String(w.timezone ?? '')}
        </div>
      </div>

      <div className="oc-grid">
        <Stat k="호출" v={fmt(t.calls)} />
        <Stat k="사용자" v={fmt(t.users)} s="중복 제외" />
        <Stat k="토큰 (입력 / 출력)" v={`${fmt(t.inputTokens)} / ${fmt(t.outputTokens)}`} />
        <Stat
          k="추정 원가"
          v={`₩${fmt(t.krw)}`}
          s={num(t.unpricedCalls) > 0 ? `⚠ 단가 미등록 ${fmt(t.unpricedCalls)}건 제외 — 과소 집계` : '청구서가 아니다'}
          warn={num(t.unpricedCalls) > 0}
        />
      </div>

      <div className="oc-card">
        <h3>일별 추이 (최근 30일)</h3>
        <p className="hint">KST 날짜 기준. UTC로 묶으면 한국 오전 9시가 경계가 되어 하루가 쪼개진다.</p>
        {/* 서버가 빈 날을 0으로 채워 항상 30칸이다 — 그래서 '비었나'는 길이가 아니라 peak로 본다 */}
        {peak === 0 ? (
          <div className="oc-empty">아직 호출이 없습니다.</div>
        ) : (
          <>
            <div className="oc-bars">
              {trend.map((row) => (
                <div
                  key={String(row.day)}
                  className="b"
                  style={{ height: `${peak === 0 ? 0 : (num(row.calls) / peak) * 100}%` }}
                  title={`${String(row.day)} · ${fmt(row.calls)}회`}
                />
              ))}
            </div>
            <div className="oc-barx">
              <span>{String(trend[0]?.day ?? '')}</span>
              <span>{String(trend[trend.length - 1]?.day ?? '')}</span>
            </div>
          </>
        )}
      </div>

      <div className="oc-card">
        <h3>모델별</h3>
        <p className="hint">모델마다 단가가 달라 합계 토큰에 단가 하나를 곱하면 조용히 틀린다.</p>
        {models.length === 0 ? (
          <div className="oc-empty">아직 호출이 없습니다.</div>
        ) : (
          <table className="oc-table">
            <thead>
              <tr>
                <th>모델</th>
                <th className="n">호출</th>
                <th className="n">입력</th>
                <th className="n">출력</th>
                <th className="n">추정 원가</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={String(m.model)}>
                  <td>{String(m.model)}</td>
                  <td className="n">{fmt(m.calls)}</td>
                  <td className="n">{fmt(m.inputTokens)}</td>
                  <td className="n">{fmt(m.outputTokens)}</td>
                  <td className="n">
                    {m.usd === null ? '단가 미등록' : `$${num(m.usd).toFixed(4)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="oc-card">
        <h3>리포트 종류별</h3>
        <p className="hint">주간이 대부분이어야 정상이다 — 월간·연간은 기간당 1회다.</p>
        {kinds.length === 0 ? (
          <div className="oc-empty">아직 호출이 없습니다.</div>
        ) : (
          <table className="oc-table">
            <tbody>
              {kinds.map((k) => (
                <tr key={String(k.kind)}>
                  <td>{String(k.kind)}</td>
                  <td className="n">{fmt(k.calls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="oc-note">
        🔴 <strong>원가는 추정치다.</strong> 캐시·배치 할인과 단가 개정이 반영되지 않고, 실패한
        호출은 애초에 기록되지 않는다(성공만 기록한다). 벤더 대시보드가 정본이고 이 숫자는 추세를
        보는 용도다.
      </div>
    </>
  );
}

function VaultsTab({ data }: { data: Json | null }) {
  if (data === null) {
    return <div className="oc-empty">불러오지 못했습니다.</div>;
  }
  const v = (data.vaults as Json | undefined) ?? {};
  const g = (data.generations as Json | undefined) ?? {};
  const p = (data.parts as Json | undefined) ?? {};
  const b = (data.blobs as Json | undefined) ?? {};

  return (
    <>
      <div className="oc-grid">
        <Stat k="살아 있는 금고" v={fmt(v.alive)} />
        <Stat k="유예 중" v={fmt(v.inGrace)} s="구독이 끝나 유예를 세는 중" />
        <Stat k="파기됨 (툼스톤)" v={fmt(v.purged)} s="행은 남긴다 — 410을 주려면 필요하다" />
        <Stat k="총 저장" v={bytes(num(p.bytes) + num(b.bytes))} s="커밋된 것만" />
      </div>

      <div className="oc-card">
        <h3>세대 · 파트 · blob</h3>
        <p className="hint">
          예약(reserved)은 Storage에 올라갔을 수도 아닐 수도 있어 용량 합계에 넣지 않는다 — 그래서
          리퍼가 치운다.
        </p>
        <table className="oc-table">
          <thead>
            <tr>
              <th>항목</th>
              <th className="n">커밋됨</th>
              <th className="n">예약</th>
              <th className="n">용량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>세대</td>
              <td className="n">{fmt(g.committed)}</td>
              <td className="n">{fmt(num(g.total) - num(g.committed))}</td>
              <td className="n">—</td>
            </tr>
            <tr>
              <td>매니페스트 파트</td>
              <td className="n">{fmt(p.committed)}</td>
              <td className="n">{fmt(p.reserved)}</td>
              <td className="n">{bytes(p.bytes)}</td>
            </tr>
            <tr>
              <td>사진 blob</td>
              <td className="n">{fmt(b.committed)}</td>
              <td className="n">{fmt(b.reserved)}</td>
              <td className="n">{bytes(b.bytes)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="oc-note">
        이 화면에는 <strong>금고 목록이 없다.</strong> 조각은 E2EE 제품이라 콘솔이 개인을 특정할 수
        있게 만들지 않는다 — <code>vault_id</code>·<code>subject_id</code>는 라우트가 아예 내려주지
        않는다.
      </div>
    </>
  );
}

function ReapTab({ data }: { data: Json | null }) {
  if (data === null) {
    return <div className="oc-empty">불러오지 못했습니다.</div>;
  }
  const b = (data.backlog as Json | undefined) ?? {};
  const p = (data.policy as Json | undefined) ?? {};
  const rows: { k: string; v: unknown; s: string }[] = [
    {
      k: '만료된 예약 파트',
      v: b.staleParts,
      s: `${fmt(p.reservedTtlHours)}시간이 지나도 커밋되지 않은 것`,
    },
    { k: '고아 blob', v: b.orphanBlobs, s: `${fmt(p.blobOrphanDays)}일간 어느 백업도 참조하지 않음` },
    {
      k: '유예 만료 금고',
      v: b.expiredVaults,
      s: `구독 만료 후 ${fmt(p.graceDays)}일이 지났는데 아직 파기 안 됨`,
    },
    {
      k: '보관 만료 툼스톤',
      v: b.staleTombstones,
      s: `파기 후 ${fmt(p.tombstoneDays)}일이 지난 흔적`,
    },
  ];

  return (
    <>
      <div className="oc-grid">
        {rows.map((r) => (
          <Stat key={r.k} k={r.k} v={fmt(r.v)} s={r.s} warn={num(r.v) > 0} />
        ))}
      </div>

      <div className="oc-note">
        조각 서버에는 <strong>리퍼 실행 로그가 없다.</strong> 그래서 &ldquo;리퍼가 돌았나&rdquo;를
        직접 알 수 없고, 대신 <strong>지금 치울 것이 얼마나 쌓여 있나</strong>를 본다. 크론
        (<code>0 18 * * *</code>)이 정상이면 이 값들은 0 근처에 머문다 — 계속 늘면 크론이 안 도는
        것이다. 간접 신호지만 있는 데이터로 만들 수 있고, 정직하다.
      </div>
    </>
  );
}
