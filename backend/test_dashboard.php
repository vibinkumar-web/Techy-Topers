<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Taxi API Test Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #0d1117;
    --surface: #161b22;
    --border:  #21262d;
    --pass:    #238636;
    --pass-bg: #0d2818;
    --pass-t:  #3fb950;
    --fail:    #da3633;
    --fail-bg: #2d0809;
    --fail-t:  #f85149;
    --muted:   #8b949e;
    --text:    #e6edf3;
    --accent:  #388bfd;
    --accent2: #a371f7;
    --yellow:  #d29922;
  }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding-bottom: 60px;
  }

  /* ── Header ── */
  .header {
    background: #161b22;
    border-bottom: 1px solid var(--border);
    padding: 22px 32px;
    position: sticky; top: 0; z-index: 100;
  }
  .header-inner {
    max-width: 1240px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .brand-title { font-size: 1.25rem; font-weight: 700; }
  .brand-sub { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

  .header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    font-size: 0.80rem; font-weight: 600;
    border: 1px solid transparent;
  }
  .pill-pass  { background: var(--pass-bg); color: var(--pass-t); border-color: var(--pass); }
  .pill-fail  { background: var(--fail-bg); color: var(--fail-t); border-color: var(--fail); }
  .pill-total { background: #1c2128; color: var(--muted); border-color: var(--border); }
  .pill-time  { background: #1a1f2b; color: #79c0ff; border-color: #1f3047; }

  .run-btn {
    padding: 8px 20px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #fff; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: opacity 0.2s; font-family: 'Inter', sans-serif;
  }
  .run-btn:hover { opacity: 0.85; }
  .run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Progress ── */
  .progress-wrap {
    max-width: 1240px; margin: 16px auto; padding: 0 32px;
  }
  .progress-bar { height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; }
  .progress-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--pass-t), #56d364);
    transition: width 0.4s ease;
    width: 0%;
  }
  .progress-label {
    font-size: 0.70rem; color: var(--muted);
    text-align: right; margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Main ── */
  .main { max-width: 1240px; margin: 0 auto; padding: 24px 32px; }

  /* ── Status banner ── */
  #status-banner {
    border-radius: 12px; padding: 16px 22px;
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 22px; border: 1px solid var(--border);
    background: var(--surface);
  }
  #status-banner.running { border-color: #1f3047; background: #1a1f2b; }
  #status-banner.pass    { border-color: var(--pass); background: var(--pass-bg); }
  #status-banner.fail    { border-color: var(--fail); background: var(--fail-bg); }
  .banner-icon { font-size: 1.8rem; }
  .banner-title { font-weight: 600; font-size: 0.95rem; }
  .banner-sub   { font-size: 0.78rem; color: var(--muted); margin-top: 3px; }

  /* ── Stats grid ── */
  .stats-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 14px; margin-bottom: 24px;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px 20px;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.pass::before  { background: linear-gradient(90deg, var(--pass), #56d364); }
  .stat-card.fail::before  { background: linear-gradient(90deg, var(--fail), #f85149); }
  .stat-card.total::before { background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .stat-card.time::before  { background: linear-gradient(90deg, #79c0ff, #58a6ff); }
  .stat-card.groups::before{ background: linear-gradient(90deg, var(--yellow), #e3b341); }
  .stat-value {
    font-size: 2rem; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; line-height: 1;
  }
  .stat-card.pass  .stat-value { color: var(--pass-t); }
  .stat-card.fail  .stat-value { color: var(--fail-t); }
  .stat-card.total .stat-value { color: var(--accent); }
  .stat-card.time  .stat-value { color: #79c0ff; font-size: 1.5rem; }
  .stat-card.groups .stat-value{ color: var(--yellow); }
  .stat-label {
    font-size: 0.72rem; color: var(--muted);
    margin-top: 5px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .stat-icon { font-size: 1.4rem; position: absolute; right: 16px; top: 16px; opacity: 0.25; }

  /* ── Group grid ── */
  .group-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 14px;
  }
  .group-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    animation: fadeUp 0.3s ease backwards;
  }
  .group-card.has-fail { border-color: rgba(218,54,51,0.45); }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:none; }
  }

  .group-header {
    padding: 12px 16px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: rgba(22,27,34,0.5);
  }
  .group-name { font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
  .group-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-pass   { background: var(--pass-t); box-shadow: 0 0 5px var(--pass-t); }
  .dot-fail   { background: var(--fail-t); box-shadow: 0 0 5px var(--fail-t); }
  .dot-wait   { background: var(--muted); }

  .group-badge {
    font-size: 0.70rem; font-weight: 600;
    padding: 3px 9px; border-radius: 20px;
  }
  .badge-pass { background: var(--pass-bg); color: var(--pass-t); }
  .badge-fail { background: var(--fail-bg); color: var(--fail-t); }
  .badge-wait { background: #1c2128; color: var(--muted); }

  .group-tests { padding: 4px 0; }
  .test-row {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 5px 14px;
    border-bottom: 1px solid rgba(33,38,45,0.5);
    font-size: 0.78rem; line-height: 1.4;
  }
  .test-row:last-child { border-bottom: none; }
  .test-row.pending { opacity: 0.4; }
  .test-icon { flex-shrink: 0; font-size: 0.85rem; margin-top: 1px; }
  .test-msg  { flex: 1; }
  .test-detail {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem; color: var(--fail-t);
    margin-top: 3px; padding: 3px 7px;
    background: rgba(248,81,73,0.08);
    border-left: 2px solid var(--fail);
    border-radius: 0 4px 4px 0;
    white-space: pre-wrap; word-break: break-all;
  }

  /* ── Spinner ── */
  .spin {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(56,139,253,0.3);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
    flex-shrink: 0; margin-top: 2px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Footer ── */
  footer {
    max-width: 1240px; margin: 28px auto 0; padding: 16px 32px 0;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between;
    font-size: 0.72rem; color: var(--muted); flex-wrap: wrap; gap: 6px;
  }
  footer span { font-family: 'JetBrains Mono', monospace; }
</style>
</head>
<body>

<!-- Header -->
<header class="header">
  <div class="header-inner">
    <div class="brand">
      <div class="brand-icon">🚕</div>
      <div>
        <div class="brand-title">API Test Dashboard</div>
        <div class="brand-sub">Taxi Trip Management System — Backend Suite</div>
      </div>
    </div>
    <div class="header-right">
      <div class="pill pill-pass"  id="pill-pass">✅ 0 Passed</div>
      <div class="pill pill-fail"  id="pill-fail" style="display:none">❌ 0 Failed</div>
      <div class="pill pill-total" id="pill-total">📋 0 / 0</div>
      <div class="pill pill-time"  id="pill-time">⏱ 0.0s</div>
      <button class="run-btn" id="run-btn" onclick="runAll()">▶ Run Tests</button>
    </div>
  </div>
</header>

<!-- Progress -->
<div class="progress-wrap">
  <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
  <div class="progress-label" id="progress-label">Ready to run — click "Run Tests"</div>
</div>

<div class="main">
  <!-- Status banner -->
  <div id="status-banner">
    <div class="banner-icon">🧪</div>
    <div>
      <div class="banner-title" id="banner-title">Click "Run Tests" to begin</div>
      <div class="banner-sub" id="banner-sub">Tests are run directly from your browser against the local API server</div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card pass">
      <div class="stat-icon">✅</div>
      <div class="stat-value" id="stat-passed">—</div>
      <div class="stat-label">Tests Passed</div>
    </div>
    <div class="stat-card fail">
      <div class="stat-icon">❌</div>
      <div class="stat-value" id="stat-failed">—</div>
      <div class="stat-label">Tests Failed</div>
    </div>
    <div class="stat-card total">
      <div class="stat-icon">📋</div>
      <div class="stat-value" id="stat-total">—</div>
      <div class="stat-label">Total Assertions</div>
    </div>
    <div class="stat-card time">
      <div class="stat-icon">⏱</div>
      <div class="stat-value" id="stat-time">—</div>
      <div class="stat-label">Execution Time</div>
    </div>
    <div class="stat-card groups">
      <div class="stat-icon">📁</div>
      <div class="stat-value" id="stat-groups">54</div>
      <div class="stat-label">API Endpoints</div>
    </div>
  </div>

  <!-- Group cards rendered here -->
  <div class="group-grid" id="group-grid"></div>
</div>

<footer>
  <div>Taxi Trip Management System — API Test Dashboard</div>
  <span id="footer-time"></span>
</footer>

<script>
const BASE = 'http://localhost:8080/backend/api';

// ── Counters ──
let passed = 0, failed = 0, total = 0;
let startTime = 0;
let timerInterval = null;

// ── Test definitions ──
// Each group: { name, tests: [ {label, fn} ] }
// fn() returns a Promise that resolves to {ok, detail}

function groups() {
  const T = (label, fn) => ({ label, fn });
  const $d = new Date().toISOString().slice(0, 10);

  async function api(path, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };
    if (body !== null) opts.body = JSON.stringify(body);
    try {
      const r = await fetch(BASE + path, opts);
      let json = null;
      try { json = await r.json(); } catch {}
      return { status: r.status, body: json };
    } catch (e) {
      return { status: 0, body: null, error: String(e) };
    }
  }

  // Assertion helpers
  const ok   = (msg) => ({ ok: true,  detail: '' });
  const fail = (msg, detail) => ({ ok: false, detail });

  function expectStatus(expected, r, msg) {
    if (r.status === expected) return ok();
    return fail(msg, `Expected HTTP ${expected}, got ${r.status}`);
  }
  function expectKey(key, r, msg) {
    if (r.body && Object.prototype.hasOwnProperty.call(r.body, key)) return ok();
    return fail(msg, `Key '${key}' not in body: ${JSON.stringify(r.body)}`);
  }
  function expectArray(r, msg) {
    if (Array.isArray(r.body)) return ok();
    return fail(msg, `Body is not an array: ${JSON.stringify(r.body)}`);
  }
  function expectNotZeroStatus(r, msg) {
    if (r.status !== 0) return ok();
    return fail(msg, 'Got status 0 (connection failed)');
  }
  function expectContains(key, val, r, msg) {
    if (r.body && r.body[key] === val) return ok();
    return fail(msg, `body.${key} expected ${JSON.stringify(val)}, got ${JSON.stringify(r.body?.[key])}`);
  }

  return [
    { name: 'Authentication – Login', tests: [
      T('Login with empty body → 400',                  async () => expectStatus(400, await api('/login.php','POST',{}), '')),
      T('Login error has "message" key',                async () => expectKey('message', await api('/login.php','POST',{}), '')),
      T('Login with invalid credentials → 401',         async () => expectStatus(401, await api('/login.php','POST',{username:'bad',password:'bad'}), '')),
      T('Login with only username → 400',               async () => expectStatus(400, await api('/login.php','POST',{username:'admin'}), '')),
    ]},
    { name: 'Authentication – Register', tests: [
      T('Register with only name → 400',                async () => expectStatus(400, await api('/register.php','POST',{name:'Test'}), '')),
      T('Register error has "message" key',             async () => expectKey('message', await api('/register.php','POST',{name:'T'}), '')),
      T('Register missing mobile → 400',                async () => expectStatus(400, await api('/register.php','POST',{name:'T',email:'x@x.com',password:'123'}), '')),
      T('Register empty body → 400',                    async () => expectStatus(400, await api('/register.php','POST',{}), '')),
    ]},
    { name: 'Authentication – Admin Login', tests: [
      T('Admin login endpoint is reachable',            async () => expectNotZeroStatus(await api('/admin_login.php','POST',{username:'NoAdmin99',password:'wrong'}), '')),
      T('Admin login returns "message" key',            async () => expectKey('message', await api('/admin_login.php','POST',{username:'NoAdmin99',password:'wrong'}), '')),
      T('Admin login with empty body → 400',            async () => expectStatus(400, await api('/admin_login.php','POST',{}), '')),
    ]},
    { name: 'Authentication – Staff Login', tests: [
      T('Staff login endpoint is reachable',            async () => expectNotZeroStatus(await api('/staff_login.php','POST',{username:'no_staff_xyz',password:'wrong'}), '')),
      T('Staff login has "message" key',                async () => expectKey('message', await api('/staff_login.php','POST',{username:'no_staff_xyz',password:'wrong'}), '')),
      T('Staff login empty body → 400',                 async () => expectStatus(400, await api('/staff_login.php','POST',{}), '')),
    ]},
    { name: 'Logout', tests: [
      T('Logout endpoint is reachable',                 async () => expectNotZeroStatus(await api('/logout.php','POST',{}), '')),
    ]},
    { name: 'Dashboard', tests: [
      T('GET dashboard.php → 200',                      async () => expectStatus(200, await api('/dashboard.php'), '')),
      T('Dashboard has "stats" key',                    async () => expectKey('stats', await api('/dashboard.php'), '')),
      T('Stats has total_bookings',                     async () => { const r=await api('/dashboard.php'); return r.body?.stats && 'total_bookings' in r.body.stats ? ok() : fail('','missing total_bookings'); }),
      T('Stats has total_customers',                    async () => { const r=await api('/dashboard.php'); return r.body?.stats && 'total_customers' in r.body.stats ? ok() : fail('','missing total_customers'); }),
      T('Stats has total_drivers',                      async () => { const r=await api('/dashboard.php'); return r.body?.stats && 'total_drivers' in r.body.stats ? ok() : fail('','missing total_drivers'); }),
      T('Stats has on_trip',                            async () => { const r=await api('/dashboard.php'); return r.body?.stats && 'on_trip' in r.body.stats ? ok() : fail('','missing on_trip'); }),
      T('Stats has pending_assignments',                async () => { const r=await api('/dashboard.php'); return r.body?.stats && 'pending_assignments' in r.body.stats ? ok() : fail('','missing pending_assignments'); }),
    ]},
    { name: 'Vehicles CRUD', tests: [
      T('GET vehicles.php → 200',                       async () => expectStatus(200, await api('/vehicles.php'), '')),
      T('GET vehicles.php returns array',               async () => expectArray(await api('/vehicles.php'), '')),
      T('GET non-existent vehicle → 200',               async () => expectStatus(200, await api('/vehicles.php?v_id=NONEXISTENT_9999'), '')),
      T('POST vehicle without v_id ≠ 200',              async () => { const r=await api('/vehicles.php','POST',{v_no:''}); return r.status!==200?ok():fail('','Expected non-200'); }),
      T('DELETE vehicle without v_id → 400',             async () => expectStatus(400, await api('/vehicles.php','DELETE',{}), '')),
    ]},
    { name: 'Staff CRUD', tests: [
      T('GET staff.php → 200',                          async () => expectStatus(200, await api('/staff.php'), '')),
      T('GET staff.php returns array',                  async () => expectArray(await api('/staff.php'), '')),
    ]},
    { name: 'Bookings', tests: [
      T('GET bookings.php → 200',                       async () => expectStatus(200, await api('/bookings.php'), '')),
      T('GET bookings.php returns array',               async () => expectArray(await api('/bookings.php'), '')),
      T('POST booking empty body → 400',                async () => expectStatus(400, await api('/bookings.php','POST',{}), '')),
      T('POST booking error has "message" key',         async () => expectKey('message', await api('/bookings.php','POST',{}), '')),
      T('POST booking only pickup → 400',               async () => expectStatus(400, await api('/bookings.php','POST',{pickup:'Airport'}), '')),
    ]},
    { name: 'Customers', tests: [
      T('GET customers.php → 200',                      async () => expectStatus(200, await api('/customers.php'), '')),
      T('GET customers.php returns array',              async () => expectArray(await api('/customers.php'), '')),
      T('GET unknown mobile → 200',                     async () => expectStatus(200, await api('/customers.php?mobile=0000000000'), '')),
      T('Unknown mobile returns found=false',           async () => expectContains('found', false, await api('/customers.php?mobile=0000000000'), '')),
      T('POST customer missing b_name → 400',           async () => expectStatus(400, await api('/customers.php','POST',{m_no:'9876543210'}), '')),
      T('POST customer missing m_no → 400',             async () => expectStatus(400, await api('/customers.php','POST',{b_name:'Test'}), '')),
    ]},
    { name: 'Tariff', tests: [
      T('GET tariff without v_id → 400',                async () => expectStatus(400, await api('/tariff.php'), '')),
      T('GET tariff error has "message"',               async () => expectKey('message', await api('/tariff.php'), '')),
      T('GET tariff?v_id=list → 200',                   async () => expectStatus(200, await api('/tariff.php?v_id=list'), '')),
      T('GET tariff?v_id=list returns array',           async () => expectArray(await api('/tariff.php?v_id=list'), '')),
      T('GET tariff non-existent v_id is reachable',   async () => expectNotZeroStatus(await api('/tariff.php?v_id=NONEXISTENT'), '')),
      T('POST tariff without v_id → 400',               async () => expectStatus(400, await api('/tariff.php','POST',{}), '')),
    ]},
    { name: 'Staff Attendance', tests: [
      T('GET attendance.php → 200',                     async () => expectStatus(200, await api('/attendance.php'), '')),
      T('GET attendance returns array',                 async () => expectArray(await api('/attendance.php'), '')),
      T('POST attendance login without id_emp → 400',   async () => expectStatus(400, await api('/attendance.php','POST',{action:'login'}), '')),
      T('POST attendance invalid action → 400',         async () => expectStatus(400, await api('/attendance.php','POST',{action:'bad',id_emp:'1'}), '')),
    ]},
    { name: 'Assign Booking', tests: [
      T('GET assign.php → 200',                         async () => expectStatus(200, await api('/assign.php'), '')),
      T('GET assign.php returns array',                 async () => expectArray(await api('/assign.php'), '')),
      T('POST assign missing b_id → 400',               async () => expectStatus(400, await api('/assign.php','POST',{v_id:'V001'}), '')),
      T('POST assign missing v_id → 400',               async () => expectStatus(400, await api('/assign.php','POST',{b_id:'123'}), '')),
      T('POST assign non-existent booking → 404',       async () => expectStatus(404, await api('/assign.php','POST',{b_id:'NOEXIST_99',v_id:'NOEXIST_99'}), '')),
    ]},
    { name: 'Trip Closing', tests: [
      T('GET closing.php → 200',                        async () => expectStatus(200, await api('/closing.php'), '')),
      T('GET closing.php returns array',                async () => expectArray(await api('/closing.php'), '')),
      T('GET closing non-existent b_id → 404',          async () => expectStatus(404, await api('/closing.php?b_id=NONEXISTENT'), '')),
      T('GET closing 404 has "message"',                async () => expectKey('message', await api('/closing.php?b_id=NONEXISTENT'), '')),
      T('POST closing missing b_id → 400',              async () => expectStatus(400, await api('/closing.php','POST',{closing_km:100}), '')),
      T('POST closing missing closing_km → 400',        async () => expectStatus(400, await api('/closing.php','POST',{b_id:'123'}), '')),
      T('POST closing empty body → 400',                async () => expectStatus(400, await api('/closing.php','POST',{}), '')),
    ]},
    { name: 'Cancel Booking', tests: [
      T('POST cancel empty body → 400',                 async () => expectStatus(400, await api('/cancel.php','POST',{}), '')),
      T('POST cancel error has "message"',              async () => expectKey('message', await api('/cancel.php','POST',{}), '')),
      T('POST cancel missing reason → 400',             async () => expectStatus(400, await api('/cancel.php','POST',{b_id:'123'}), '')),
      T('POST cancel missing b_id → 400',               async () => expectStatus(400, await api('/cancel.php','POST',{reason:'Test'}), '')),
      T('POST cancel non-existent b_id → 404',          async () => expectStatus(404, await api('/cancel.php','POST',{b_id:'NOEXIST_99',reason:'Test'}), '')),
    ]},
    { name: 'Finance & Ledger', tests: [
      T('GET finance?action=summary is reachable',      async () => expectNotZeroStatus(await api('/finance.php?action=summary'), '')),
      T('Finance summary has "data" key',               async () => expectKey('data', await api('/finance.php?action=summary'), '')),
      T('GET finance?action=ledger is reachable',       async () => expectNotZeroStatus(await api('/finance.php?action=ledger'), '')),
      T('GET finance?action=driver_balances reachable', async () => expectNotZeroStatus(await api('/finance.php?action=driver_balances'), '')),
      T('POST finance invalid action → 400',            async () => expectStatus(400, await api('/finance.php','POST',{action:'invalid_action'}), '')),
    ]},
    { name: 'Reports', tests: [
      T('GET reports without type → 400',               async () => expectStatus(400, await api('/reports.php'), '')),
      T('GET reports?type=booking → 200',               async () => expectStatus(200, await api('/reports.php?type=booking'), '')),
      T('GET reports?type=customer → 200',              async () => expectStatus(200, await api('/reports.php?type=customer'), '')),
      T('GET reports?type=vehicle → 200',               async () => expectStatus(200, await api('/reports.php?type=vehicle'), '')),
      T('GET reports?type=company → 200',               async () => expectStatus(200, await api('/reports.php?type=company'), '')),
      T('GET reports?type=customers_list → 200',        async () => expectStatus(200, await api('/reports.php?type=customers_list'), '')),
      T('GET reports?type=vehicles_list → 200',         async () => expectStatus(200, await api('/reports.php?type=vehicles_list'), '')),
      T('GET reports invalid type → 400',               async () => expectStatus(400, await api('/reports.php?type=invalid_type_xyz'), '')),
    ]},
    { name: 'Staff / Cancel / KM Reports', tests: [
      T('GET staff_report.php → 200',                   async () => expectStatus(200, await api('/staff_report.php'), '')),
      T('Staff report returns array',                   async () => expectArray(await api('/staff_report.php'), '')),
      T('GET cancel_report.php → 200',                  async () => expectStatus(200, await api('/cancel_report.php'), '')),
      T('GET running_km_report.php → 200',              async () => expectStatus(200, await api('/running_km_report.php'), '')),
      T('GET shortage_km_report.php → 200',             async () => expectStatus(200, await api('/shortage_km_report.php'), '')),
    ]},
    { name: 'Available Vehicles / On-Trip / Enquiry', tests: [
      T('GET available_vehicles.php → 200',             async () => expectStatus(200, await api('/available_vehicles.php'), '')),
      T('Available vehicles returns array',             async () => expectArray(await api('/available_vehicles.php'), '')),
      T('GET ontrip.php → 200',                         async () => expectStatus(200, await api('/ontrip.php'), '')),
      T('GET enquiry_report.php → 200',                 async () => expectStatus(200, await api('/enquiry_report.php'), '')),
      T('GET vehicle_attendance.php is reachable',      async () => expectNotZeroStatus(await api('/vehicle_attendance.php'), '')),
    ]},
    { name: 'Customer Search', tests: [
      T('GET customer_search.php is reachable',         async () => expectNotZeroStatus(await api('/customer_search.php'), '')),
      T('GET ?search=99 returns array',                 async () => expectArray(await api('/customer_search.php?search=99'), '')),
      T('GET ?trips_for=... returns array',             async () => expectArray(await api('/customer_search.php?trips_for=9999999999'), '')),
    ]},
    { name: 'Settings', tests: [
      T('GET settings.php → 200',                       async () => expectStatus(200, await api('/settings.php'), '')),
      T('Settings has "smsoption" key',                 async () => expectKey('smsoption', await api('/settings.php'), '')),
    ]},
    { name: 'User Rights', tests: [
      T('GET user_rights.php → 200',                    async () => expectStatus(200, await api('/user_rights.php'), '')),
      T('User rights returns array',                    async () => expectArray(await api('/user_rights.php'), '')),
    ]},
    { name: 'Advance Bookings', tests: [
      T('GET advance_bookings.php → 200',               async () => expectStatus(200, await api('/advance_bookings.php'), '')),
      T('Advance bookings returns array',               async () => expectArray(await api('/advance_bookings.php'), '')),
      T('GET advance_booking.php (single) → 200',       async () => expectStatus(200, await api('/advance_booking.php'), '')),
      T('POST advance_booking → 405',                   async () => expectStatus(405, await api('/advance_booking.php','POST',{}), '')),
    ]},
    { name: 'Booking Edit & Booking Counts', tests: [
      T('PUT booking_edit.php is reachable',            async () => expectNotZeroStatus(await api('/booking_edit.php','PUT',{b_id:'NOEXIST'}), '')),
      T('GET booking_counts without dates → 200',       async () => expectStatus(200, await api('/booking_counts.php'), '')),
      T('Booking counts no dates has "message"',        async () => expectKey('message', await api('/booking_counts.php'), '')),
      T('GET booking_counts with dates → 200',          async () => expectStatus(200, await api(`/booking_counts.php?from_date=${$d}&to_date=${$d}`), '')),
      T('Booking counts has "total" key',               async () => expectKey('total', await api(`/booking_counts.php?from_date=${$d}&to_date=${$d}`), '')),
    ]},
    { name: 'Admin Register / Staff Register', tests: [
      T('POST admin_register empty → 400',              async () => expectStatus(400, await api('/admin_register.php','POST',{}), '')),
      T('Admin register response has "message"',        async () => expectKey('message', await api('/admin_register.php','POST',{}), '')),
      T('POST staff_register empty → 400',              async () => expectStatus(400, await api('/staff_register.php','POST',{}), '')),
      T('Staff register response has "message"',        async () => expectKey('message', await api('/staff_register.php','POST',{}), '')),
    ]},
    { name: 'Assign Later / Attached Vehicles', tests: [
      T('GET assign_later.php → 200',                   async () => expectStatus(200, await api('/assign_later.php'), '')),
      T('Assign later returns array',                   async () => expectArray(await api('/assign_later.php'), '')),
      T('GET assign_later?action=drivers → 200',        async () => expectStatus(200, await api('/assign_later.php?action=drivers'), '')),
      T('POST assign_later empty → 400',                async () => expectStatus(400, await api('/assign_later.php','POST',{}), '')),
      T('GET attached_vehicles.php → 200',              async () => expectStatus(200, await api('/attached_vehicles.php'), '')),
      T('Attached vehicles returns array',              async () => expectArray(await api('/attached_vehicles.php'), '')),
    ]},
    { name: 'Company / Customer / Day-Wise Reports', tests: [
      T('GET company_report without dates → 200',       async () => expectStatus(200, await api('/company_report.php'), '')),
      T('Company report returns array (no dates)',      async () => expectArray(await api('/company_report.php'), '')),
      T('GET company_report with dates is reachable',   async () => expectNotZeroStatus(await api(`/company_report.php?from_date=${$d}&to_date=${$d}`), '')),
      T('GET customer_report without dates → 200',      async () => expectStatus(200, await api('/customer_report.php'), '')),
      T('Customer report without dates has "message"',  async () => expectKey('message', await api('/customer_report.php'), '')),
      T('GET customer_report with dates → 200',         async () => expectStatus(200, await api(`/customer_report.php?from_date=${$d}&to_date=${$d}`), '')),
      T('GET day_wise_report without dates → 200',      async () => expectStatus(200, await api('/day_wise_report.php'), '')),
      T('Day-wise report returns array (no dates)',     async () => expectArray(await api('/day_wise_report.php'), '')),
    ]},
    { name: 'Edit Closed Trip / Enquiry Tariff', tests: [
      T('GET edit_closed_trip without b_id → 400',      async () => expectStatus(400, await api('/edit_closed_trip.php'), '')),
      T('GET edit_closed_trip non-existent → 404',      async () => expectStatus(404, await api('/edit_closed_trip.php?b_id=999999'), '')),
      T('POST edit_closed_trip no b_id → 400',          async () => expectStatus(400, await api('/edit_closed_trip.php','POST',{}), '')),
      T('GET enquery_tariff.php → 200',                 async () => expectStatus(200, await api('/enquery_tariff.php'), '')),
      T('Enquiry tariff returns array',                 async () => expectArray(await api('/enquery_tariff.php'), '')),
      T('GET enquery_tariff?km=150 → 200',              async () => expectStatus(200, await api('/enquery_tariff.php?km=150'), '')),
    ]},
    { name: 'Distance Suggestions / Local Trip', tests: [
      T('GET get_distance_suggestions → 200',           async () => expectStatus(200, await api('/get_distance_suggestions.php'), '')),
      T('Distance suggestions has "staff" key',         async () => expectKey('staff', await api('/get_distance_suggestions.php'), '')),
      T('GET get_distance_suggestions?km=100 → 200',    async () => expectStatus(200, await api('/get_distance_suggestions.php?km=100'), '')),
      T('Distance suggestions staff is array',          async () => { const r=await api('/get_distance_suggestions.php?km=100'); return Array.isArray(r.body?.staff)?ok():fail('','staff is not array'); }),
      T('GET localtrip without v_id → 400',             async () => expectStatus(400, await api('/localtrip.php'), '')),
      T('GET localtrip non-existent v_id → 404',        async () => expectStatus(404, await api('/localtrip.php?v_id=NONEXISTENT_9999'), '')),
    ]},
    { name: 'Local Trip Closing / Refusal Report', tests: [
      T('GET local_trip_closing → 200',                 async () => expectStatus(200, await api('/local_trip_closing.php'), '')),
      T('GET local_trip_closing?action=tariffs → 200',  async () => expectStatus(200, await api('/local_trip_closing.php?action=tariffs'), '')),
      T('GET refusal_report without dates → 200',       async () => expectStatus(200, await api('/refusal_report.php'), '')),
      T('Refusal report returns array (no dates)',      async () => expectArray(await api('/refusal_report.php'), '')),
      T('GET refusal_report?list=1 → 200',              async () => expectStatus(200, await api('/refusal_report.php?list=1'), '')),
    ]},
    { name: 'Staff Login Logs / Tariff Upload', tests: [
      T('GET staff_login_logs → 200',                   async () => expectStatus(200, await api('/staff_login_logs.php'), '')),
      T('Staff login logs has "logs" key',              async () => expectKey('logs', await api('/staff_login_logs.php'), '')),
      T('POST tariff_upload without file → 400',        async () => expectStatus(400, await api('/tariff_upload.php','POST',{}), '')),
      T('Tariff upload error has "message"',            async () => expectKey('message', await api('/tariff_upload.php','POST',{}), '')),
    ]},
    { name: 'Trip Edit / Trip Refusal', tests: [
      T('PUT trip_edit without b_id → 400',             async () => expectStatus(400, await api('/trip_edit.php','PUT',{}), '')),
      T('Trip edit missing b_id has "message"',         async () => expectKey('message', await api('/trip_edit.php','PUT',{}), '')),
      T('PUT trip_edit with b_id is reachable',         async () => expectNotZeroStatus(await api('/trip_edit.php','PUT',{b_id:'999999',net_total:500,paid_amount:500}), '')),
      T('POST trip_refusal empty → 400',                async () => expectStatus(400, await api('/trip_refusal.php','POST',{}), '')),
      T('POST trip_refusal missing reason → 400',       async () => expectStatus(400, await api('/trip_refusal.php','POST',{b_id:'1',v_id:'V001'}), '')),
    ]},
    { name: 'User Activity / Customer Upload', tests: [
      T('GET user_activity_report without params → 200',async () => expectStatus(200, await api('/user_activity_report.php'), '')),
      T('User activity without params has "message"',   async () => expectKey('message', await api('/user_activity_report.php'), '')),
      T('GET user_activity_report with params → 200',   async () => expectStatus(200, await api(`/user_activity_report.php?user_id=1&from_date=${$d}&to_date=${$d}`), '')),
      T('User activity has "booking_count"',            async () => expectKey('booking_count', await api(`/user_activity_report.php?user_id=1&from_date=${$d}&to_date=${$d}`), '')),
      T('POST customer_upload without file → 400',      async () => expectStatus(400, await api('/customer_upload.php','POST',{}), '')),
    ]},
    { name: 'Vehicle In/Out / Pricing / Separate', tests: [
      T('GET vehicle_in_out → 200',                     async () => expectStatus(200, await api('/vehicle_in_out.php'), '')),
      T('Vehicle in/out returns array',                 async () => expectArray(await api('/vehicle_in_out.php'), '')),
      T('POST vehicle_in_out invalid action → 400',     async () => expectStatus(400, await api('/vehicle_in_out.php','POST',{action:'bad_action'}), '')),
      T('POST logout_single without v_id → 400',        async () => expectStatus(400, await api('/vehicle_in_out.php','POST',{action:'logout_single'}), '')),
      T('POST logout_single non-existent v_id → 404',   async () => expectStatus(404, await api('/vehicle_in_out.php','POST',{action:'logout_single',v_id:'VNONEXIST99'}), '')),
      T('GET vehicle_pricing → 200',                    async () => expectStatus(200, await api('/vehicle_pricing.php'), '')),
      T('Vehicle pricing returns array',                async () => expectArray(await api('/vehicle_pricing.php'), '')),
      T('POST vehicle_pricing empty → 400',             async () => expectStatus(400, await api('/vehicle_pricing.php','POST',{}), '')),
      T('GET vehicle_separate_report no params → 200',  async () => expectStatus(200, await api('/vehicle_separate_report.php'), '')),
      T('Vehicle separate report has "message"',        async () => expectKey('message', await api('/vehicle_separate_report.php'), '')),
    ]},
  ];
}

// ── UI helpers ──
function updateHeader() {
  const tot = passed + failed;
  document.getElementById('pill-pass').textContent  = `✅ ${passed} Passed`;
  document.getElementById('pill-fail').textContent  = `❌ ${failed} Failed`;
  document.getElementById('pill-fail').style.display = failed > 0 ? '' : 'none';
  document.getElementById('pill-total').textContent = `📋 ${tot > 0 ? passed + '/' + tot : '0 / 0'}`;
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  document.getElementById('pill-time').textContent  = `⏱ ${elapsed}s`;
  document.getElementById('stat-passed').textContent = passed;
  document.getElementById('stat-failed').textContent = failed;
  document.getElementById('stat-total').textContent  = tot;
  document.getElementById('stat-time').textContent   = elapsed + 's';
  const pct = tot > 0 ? Math.round((passed / tot) * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    `${pct}% passing • ${tot} assertions run`;
}

function renderGroups(allGroups) {
  const grid = document.getElementById('group-grid');
  grid.innerHTML = '';
  allGroups.forEach((g, gi) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.id = 'group-' + gi;
    card.style.animationDelay = (gi * 0.025) + 's';
    card.innerHTML = `
      <div class="group-header">
        <div class="group-name">
          <div class="group-dot dot-wait" id="dot-${gi}"></div>
          ${g.name}
        </div>
        <div class="group-badge badge-wait" id="badge-${gi}">pending</div>
      </div>
      <div class="group-tests" id="tests-${gi}">
        ${g.tests.map((t, ti) => `
          <div class="test-row pending" id="test-${gi}-${ti}">
            <div class="test-icon" id="icon-${gi}-${ti}">○</div>
            <div class="test-msg">${escHtml(t.label)}</div>
          </div>
        `).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function markTest(gi, ti, result) {
  const row  = document.getElementById(`test-${gi}-${ti}`);
  const icon = document.getElementById(`icon-${gi}-${ti}`);
  if (!row || !icon) return;
  row.classList.remove('pending');
  if (result.ok) {
    icon.textContent = '✅';
  } else {
    icon.textContent = '❌';
    if (result.detail) {
      const detail = document.createElement('div');
      detail.className = 'test-detail';
      detail.textContent = result.detail;
      row.querySelector('.test-msg').appendChild(detail);
    }
  }
}

function markGroup(gi, gPassed, gFailed) {
  const card  = document.getElementById(`group-${gi}`);
  const dot   = document.getElementById(`dot-${gi}`);
  const badge = document.getElementById(`badge-${gi}`);
  if (gFailed > 0) {
    card.classList.add('has-fail');
    dot.className   = 'group-dot dot-fail';
    badge.className = 'group-badge badge-fail';
    badge.textContent = `${gFailed} fail`;
  } else {
    dot.className   = 'group-dot dot-pass';
    badge.className = 'group-badge badge-pass';
    badge.textContent = `${gPassed}/${gPassed}`;
  }
}

function showRunningIcon(gi, ti) {
  const icon = document.getElementById(`icon-${gi}-${ti}`);
  if (icon) {
    const spin = document.createElement('div');
    spin.className = 'spin';
    spin.id = 'spin-' + gi + '-' + ti;
    icon.replaceWith(spin);
  }
}
function removeRunningIcon(gi, ti) {
  const spin = document.getElementById(`spin-${gi}-${ti}`);
  if (spin) {
    const icon = document.createElement('div');
    icon.className = 'test-icon';
    icon.id = `icon-${gi}-${ti}`;
    spin.replaceWith(icon);
  }
}

async function runAll() {
  passed = 0; failed = 0; total = 0;
  startTime = performance.now();

  document.getElementById('run-btn').disabled = true;
  document.getElementById('run-btn').textContent = '⏳ Running…';

  const statusBanner = document.getElementById('status-banner');
  statusBanner.className = 'running';
  document.getElementById('banner-title').textContent = 'Running tests…';
  document.getElementById('banner-sub').textContent   = 'Please wait while all API endpoints are tested';
  document.getElementById('banner-icon').textContent  = '⏳';

  const allGroups = groups();
  renderGroups(allGroups);

  timerInterval = setInterval(updateHeader, 200);

  for (let gi = 0; gi < allGroups.length; gi++) {
    const g = allGroups[gi];
    let gPassed = 0, gFailed = 0;
    // Show spinner on first test
    showRunningIcon(gi, 0);
    for (let ti = 0; ti < g.tests.length; ti++) {
      if (ti > 0) showRunningIcon(gi, ti);
      removeRunningIcon(gi, ti - 1);
      const result = await g.tests[ti].fn();
      const row = document.getElementById(`test-${gi}-${ti}`);
      const icon = document.getElementById(`icon-${gi}-${ti}`);
      if (icon) icon.textContent = ''; // clear before markTest
      markTest(gi, ti, result);
      if (result.ok) { passed++; gPassed++; }
      else           { failed++; gFailed++; }
      total++;
    }
    removeRunningIcon(gi, g.tests.length - 1);
    markGroup(gi, gPassed, gFailed);
    // scroll the card into view
    document.getElementById('group-' + gi)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  clearInterval(timerInterval);
  updateHeader();

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  document.getElementById('pill-time').textContent = `⏱ ${elapsed}s`;
  document.getElementById('stat-time').textContent = elapsed + 's';

  if (failed === 0) {
    statusBanner.className = 'pass';
    document.getElementById('banner-icon').textContent  = '🎉';
    document.getElementById('banner-title').textContent = `All ${passed} tests passed!`;
    document.getElementById('banner-sub').textContent   = `Backend API is fully operational — ${elapsed}s — ${total} assertions across ${allGroups.length} endpoint groups`;
  } else {
    statusBanner.className = 'fail';
    document.getElementById('banner-icon').textContent  = '⚠️';
    document.getElementById('banner-title').textContent = `${failed} test${failed !== 1 ? 's' : ''} failed`;
    document.getElementById('banner-sub').textContent   = `${passed} passed, ${failed} failed — ${elapsed}s`;
  }

  document.getElementById('run-btn').textContent = '↺ Re-run All';
  document.getElementById('run-btn').disabled    = false;
  document.getElementById('footer-time').textContent = new Date().toLocaleString();
}

// Set current time in footer
document.getElementById('footer-time').textContent = new Date().toLocaleString();

// Auto-run on load
window.addEventListener('load', () => setTimeout(runAll, 400));
</script>
</body>
</html>
