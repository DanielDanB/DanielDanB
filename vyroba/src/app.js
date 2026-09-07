/* Přehled zakázek — provozní evidence zakázek (Obrobna / Svařovna)
   Datový model i logika barev vychází z původního sešitu PREHLED_ZAKAZEK_NOVY.xlsx */
(function () {
'use strict';

// ---------------------------------------------------------------- číselníky
var DEFAULT_DICT = {
  statuses: ['Design', 'Schvalování', 'Příprava výroby', 'Výroba', 'Hotovo'],
  centers: ['Obrobna', 'Svařovna', 'Správa'],
  owners: ['Holub M.', 'Škvor M.', 'Bartoň D.', 'Bartoň V.', 'Bachman J.'],
  prefixes: ['DE', 'BU', 'BE', 'TI', 'MG', 'MT', 'NP', 'KH', 'CD', 'PK', 'SO', 'OS', 'PE', 'WE', 'GA', 'MA', 'HA'],
  priorities: [1, 2, 3, 4]
};
var CLOSED = ['Hotovo', 'Zrušeno'];
var STORE = 'prehled-zakazek/v1';

// ---------------------------------------------------------------- utility
var $ = function (s, r) { return (r || document).querySelector(s); };
var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
function todayISO() { var d = new Date(); return iso(d); }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function parseISO(s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function fmtDate(s) { if (!s) return ''; var p = s.split('-'); return +p[2] + '.' + (+p[1]) + '.' + p[0]; }
function days(a, b) { var A = parseISO(a), B = parseISO(b); if (!A || !B) return null; return Math.round((B - A) / 864e5); }
function norm(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
var TODAY = todayISO();

// ---------------------------------------------------------------- stav
var seed = JSON.parse($('#seed').textContent);
var S = {
  orders: [], dict: null, view: 'dash', q: '', year: 0,
  f: { status: '', center: '', owner: '', requester: '', flag: '' },
  sort: { key: 'code', dir: -1 },
  ganttMonth: new Date().getMonth() + 1, ganttYear: new Date().getFullYear(),
  ganttOnlyOpen: true, sel: null, dirty: false
};

function load() {
  var raw = null;
  try { raw = localStorage.getItem(STORE); } catch (e) {}
  if (raw) {
    try {
      var st = JSON.parse(raw);
      S.orders = st.orders; S.dict = st.dict || DEFAULT_DICT;
      recalc(); return;
    } catch (e) {}
  }
  S.orders = seed.slice(); S.dict = JSON.parse(JSON.stringify(DEFAULT_DICT)); recalc();
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify({ orders: S.orders, dict: S.dict, saved: new Date().toISOString() })); }
  catch (e) { toast('Data se nepodařilo uložit do prohlížeče (limit úložiště).'); }
}
function recalc() {
  S.orders.forEach(function (o) {
    o.status = o.status || 'Nezadáno';
    o.delivered = !!o.dateDelivered;
    o.late = !!(o.dateDelivered && o.dateRequired && o.dateDelivered > o.dateRequired);
    o.overdue = !o.dateDelivered && CLOSED.indexOf(o.status) < 0 && !!o.dateRequired && o.dateRequired < TODAY;
    o.open = CLOSED.indexOf(o.status) < 0;
    o.lead = days(o.dateOrder, o.dateDelivered);
  });
  var ys = {}; S.orders.forEach(function (o) { ys[o.year] = 1; });
  S.years = Object.keys(ys).map(Number).sort(function (a, b) { return b - a; });
  if (!S.year || S.years.indexOf(S.year) < 0) S.year = S.years[0];
}

// ---------------------------------------------------------------- filtrování
function inYear(o) { return !S.year || o.year === S.year; }
function matches(o) {
  if (!inYear(o)) return false;
  var f = S.f;
  if (f.status && o.status !== f.status) return false;
  if (f.center && (o.center || '') !== f.center) return false;
  if (f.owner && (o.owner || '') !== f.owner) return false;
  if (f.requester && (o.requester || '') !== f.requester) return false;
  if (f.flag === 'open' && !o.open) return false;
  if (f.flag === 'overdue' && !o.overdue) return false;
  if (f.flag === 'late' && !o.late) return false;
  if (f.flag === 'undelivered' && o.delivered) return false;
  if (S.q) {
    var q = norm(S.q);
    var hay = norm([o.name, o.code, o.order, o.requester, o.owner, o.invoice, o.center, o.qty].join(' '));
    if (hay.indexOf(q) < 0) return false;
  }
  return true;
}
function filtered() { return S.orders.filter(matches); }
function sorted(rows) {
  var k = S.sort.key, d = S.sort.dir;
  return rows.slice().sort(function (a, b) {
    var x = a[k], y = b[k];
    if (k === 'code') { x = codeSort(a); y = codeSort(b); }
    if (x == null || x === '') return 1; if (y == null || y === '') return -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * d;
    return String(x).localeCompare(String(y), 'cs') * d;
  });
}
function codeSort(o) { var m = /(\d+)\s*\/\s*(\d+)/.exec(o.code || ''); return o.year * 1000 + (m ? +m[1] : 0); }

// ---------------------------------------------------------------- vzhled hodnot
function statusPill(s) {
  var cls = 's-' + (s === 'Příprava výroby' ? 'Příprava' : s);
  return '<span class="pill ' + cls + '"><span class="dot"></span>' + esc(s) + '</span>';
}
function centerTag(c) {
  if (!c) return '';
  var k = norm(c) === 'obrobna' ? 'obrobna' : norm(c) === 'svarovna' ? 'svarovna' : '';
  return '<span class="tag ' + k + '">' + esc(c) + '</span>';
}
function prioTag(p) { return p ? '<span class="prio p' + p + '">' + p + '</span>' : ''; }
function deliveredCell(o) {
  if (!o.dateDelivered) return o.overdue ? '<span class="late">po termínu</span>' : '<span style="color:var(--muted)">—</span>';
  return '<span class="' + (o.late ? 'late' : 'ontime') + '">' + fmtDate(o.dateDelivered) + '</span>';
}

// ---------------------------------------------------------------- pohledy
var VIEWS = [
  { id: 'dash', label: 'Přehled', icon: 'M3 12h4l2-7 3 14 2-7h5' },
  { id: 'orders', label: 'Zakázky', icon: 'M4 5h16M4 12h16M4 19h10' },
  { id: 'gantt', label: 'Plán výroby', icon: 'M4 6h9M4 12h14M4 18h6' },
  { id: 'board', label: 'Kanban', icon: 'M4 4h5v16H4zM11 4h5v10h-5zM18 4h2v7h-2z' },
  { id: 'stats', label: 'Analýza', icon: 'M4 20V9M10 20V4M16 20v-7M22 20H2' },
  { id: 'dict', label: 'Číselníky', icon: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3' }
];

function renderNav() {
  var n = $('#nav'); n.innerHTML = '';
  var openCnt = S.orders.filter(function (o) { return o.open && inYear(o); }).length;
  var odCnt = S.orders.filter(function (o) { return o.overdue && inYear(o); }).length;
  VIEWS.forEach(function (v) {
    var b = el('button', '', '<svg class="ico" viewBox="0 0 24 24"><path d="' + v.icon + '"/></svg>' + v.label +
      (v.id === 'orders' ? '<span class="cnt">' + openCnt + '</span>' : '') +
      (v.id === 'board' && odCnt ? '<span class="cnt" style="color:var(--bad)">' + odCnt + '</span>' : ''));
    b.setAttribute('aria-current', String(S.view === v.id));
    b.onclick = function () { S.view = v.id; render(); };
    n.appendChild(b);
  });
}

function render() {
  renderNav();
  var v = VIEWS.filter(function (x) { return x.id === S.view; })[0];
  $('#viewTitle').textContent = v.label;
  var c = $('#content'); c.innerHTML = '';
  ({ dash: viewDash, orders: viewOrders, gantt: viewGantt, board: viewBoard, stats: viewStats, dict: viewDict })[S.view](c);
  $('#srcInfo').textContent = S.orders.length.toLocaleString('cs') + ' zakázek · ' + S.years[S.years.length - 1] + '–' + S.years[0] + (S.dirty ? ' · upraveno' : '');
}

// ---------------------------------------------------------------- 1) Přehled
function viewDash(root) {
  var all = S.orders.filter(inYear);
  var open = all.filter(function (o) { return o.open; });
  var overdue = all.filter(function (o) { return o.overdue; });
  var done = all.filter(function (o) { return o.delivered; });
  var onTime = done.filter(function (o) { return !o.late; });
  var pct = done.length ? Math.round(onTime.length / done.length * 100) : 0;
  var leads = done.map(function (o) { return o.lead; }).filter(function (x) { return x != null && x >= 0 && x < 900; });
  var avg = leads.length ? Math.round(leads.reduce(function (a, b) { return a + b; }, 0) / leads.length) : 0;
  $('#viewSub').textContent = 'rok ' + S.year;

  var k = el('div', 'kpis');
  k.appendChild(kpi(all.length, 'Zakázek v roce', done.length + ' dodáno', ''));
  k.appendChild(kpi(open.length, 'Rozpracováno', 'napříč středisky', open.length ? 'is-warn' : 'is-ok'));
  k.appendChild(kpi(overdue.length, 'Po termínu', overdue.length ? 'vyžaduje reakci' : 'vše v termínu', overdue.length ? 'is-bad' : 'is-ok'));
  k.appendChild(kpi(pct + ' %', 'Dodáno v termínu', onTime.length + ' z ' + done.length, pct >= 85 ? 'is-ok' : pct >= 70 ? 'is-warn' : 'is-bad'));
  k.appendChild(kpi(avg + ' dní', 'Průměrná průběžná doba', 'objednávka → dodání', ''));
  root.appendChild(k);

  // rozdělení stavů
  var p1 = panel('Rozpracovanost podle stavu', 'kliknutím filtrujete seznam zakázek');
  var counts = {}; S.dict.statuses.concat(['Zrušeno', 'Ostatní', 'Nezadáno']).forEach(function (s) { counts[s] = 0; });
  all.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
  var b = el('div', 'bars');
  var max = Math.max.apply(null, Object.keys(counts).map(function (s) { return counts[s]; }).concat([1]));
  Object.keys(counts).forEach(function (s) {
    if (!counts[s]) return;
    var r = el('div', 'bar-row', '<div class="lb">' + statusPill(s) + '</div><div class="bar-track"><div class="bar-fill" style="width:' +
      (counts[s] / max * 100) + '%;background:' + statusColor(s) + '"></div></div><div class="vl">' + counts[s] + '</div>');
    r.style.cursor = 'pointer';
    r.onclick = function () { S.f.status = s; S.view = 'orders'; render(); };
    b.appendChild(r);
  });
  p1.body.appendChild(b);

  // střediska
  var p2 = panel('Vytížení středisek', 'rozpracované zakázky');
  var cc = {}; open.forEach(function (o) { var c = o.center || 'Neurčeno'; cc[c] = (cc[c] || 0) + 1; });
  var tot = open.length || 1;
  var sb = el('div', 'stackbar');
  var pal = { Obrobna: 'var(--accent)', Svařovna: 'var(--bad)', Správa: 'var(--info)', Neurčeno: 'var(--muted)' };
  Object.keys(cc).sort(function (a, c) { return cc[c] - cc[a]; }).forEach(function (c) {
    var d = el('div', '', cc[c] > 0 && cc[c] / tot > .07 ? cc[c] : '');
    d.style.cssText = 'width:' + (cc[c] / tot * 100) + '%;background:' + (pal[c] || 'var(--muted)');
    d.title = c + ': ' + cc[c]; sb.appendChild(d);
  });
  p2.body.appendChild(sb);
  var lg = el('div', 'legend'); lg.style.border = '0'; lg.style.padding = '10px 0 0';
  Object.keys(cc).forEach(function (c) { lg.appendChild(el('span', '', '<i style="background:' + (pal[c] || 'var(--muted)') + '"></i>' + esc(c) + ' <b class="num">' + cc[c] + '</b>')); });
  p2.body.appendChild(lg);

  var row = el('div', 'charts'); row.appendChild(p1.panel); row.appendChild(p2.panel);
  root.appendChild(row);

  // kritické zakázky
  var crit = all.filter(function (o) { return o.open && o.dateRequired; })
    .sort(function (a, b) { return a.dateRequired.localeCompare(b.dateRequired); }).slice(0, 40);
  var p3 = panel('Nejbližší a překročené termíny', crit.length + ' otevřených zakázek s termínem');
  p3.body.style.padding = '0';
  p3.body.appendChild(table(crit, ['code', 'name', 'center', 'owner', 'status', 'dateRequired', 'rest']));
  root.appendChild(p3.panel);
}
function statusColor(s) {
  return s === 'Hotovo' ? 'var(--ok)' : s === 'Výroba' ? 'var(--info)' :
    s === 'Zrušeno' ? 'var(--muted)' : (s === 'Design' || s === 'Schvalování' || s === 'Příprava výroby') ? 'var(--warn)' : 'var(--steel-300)';
}
function kpi(v, k, d, cls) {
  return el('div', 'kpi ' + (cls || ''), '<span class="v">' + esc(v) + '</span><span class="k">' + esc(k) + '</span><span class="d">' + esc(d) + '</span>');
}
function panel(title, hint) {
  var p = el('div', 'panel');
  p.appendChild(el('div', 'panel-head', '<h2>' + esc(title) + '</h2><span class="hint">' + esc(hint || '') + '</span>'));
  var body = el('div', 'panel-body'); p.appendChild(body);
  return { panel: p, body: body };
}

// ---------------------------------------------------------------- 2) Zakázky
var COLS = {
  code: { t: 'Č. zakázky', cls: 'mono', v: function (o) { return esc(o.code); } },
  name: { t: 'Název zakázky', cls: 'nm', v: function (o) { return esc(o.name); } },
  qty: { t: 'Množ.', cls: 'mono', v: function (o) { return esc(o.qty); } },
  status: { t: 'Stav', v: function (o) { return statusPill(o.status); } },
  center: { t: 'Středisko', v: function (o) { return centerTag(o.center); } },
  owner: { t: 'Zodpovídá', v: function (o) { return esc(o.owner); } },
  requester: { t: 'Požaduje', v: function (o) { return esc(o.requester); } },
  order: { t: 'Objednávka', cls: 'mono', v: function (o) { return esc(o.order); } },
  dateOrder: { t: 'Datum obj.', cls: 'mono', v: function (o) { return fmtDate(o.dateOrder); } },
  dateRequired: { t: 'Požad. datum', cls: 'mono', v: function (o) { return o.overdue ? '<span class="late">' + fmtDate(o.dateRequired) + '</span>' : fmtDate(o.dateRequired); } },
  dateDelivered: { t: 'Dodáno', cls: 'mono', v: deliveredCell },
  priority: { t: 'Pri.', v: function (o) { return prioTag(o.priority); } },
  invoice: { t: 'Faktura', cls: 'mono', v: function (o) { return esc(o.invoice); } },
  rest: { t: 'Zbývá', cls: 'mono', v: function (o) {
      var d = days(TODAY, o.dateRequired); if (d == null) return '';
      return d < 0 ? '<span class="late">' + (-d) + ' dní po</span>' : '<span style="color:' + (d < 7 ? 'var(--warn)' : 'var(--muted)') + '">' + d + ' dní</span>';
    } }
};
function table(rows, cols) {
  var wrap = el('div', 'tablewrap');
  if (!rows.length) { wrap.appendChild(el('div', 'empty', 'Žádná zakázka neodpovídá zvolenému filtru.')); return wrap; }
  var t = el('table', 'grid');
  var thead = el('thead'), tr = el('tr');
  cols.forEach(function (c) {
    var th = el('th', COLS[c].cls === 'mono' ? 'mono' : '', esc(COLS[c].t) + (S.sort.key === c ? ' <span class="arr">' + (S.sort.dir > 0 ? '▲' : '▼') + '</span>' : ''));
    th.onclick = function () { if (S.sort.key === c) S.sort.dir *= -1; else { S.sort.key = c; S.sort.dir = 1; } render(); };
    tr.appendChild(th);
  });
  thead.appendChild(tr); t.appendChild(thead);
  var tb = el('tbody');
  rows.forEach(function (o) {
    var r = el('tr');
    cols.forEach(function (c) { r.appendChild(el('td', COLS[c].cls || '', COLS[c].v(o))); });
    r.onclick = function () { openDrawer(o); };
    tb.appendChild(r);
  });
  t.appendChild(tb); wrap.appendChild(t);
  return wrap;
}

function viewOrders(root) {
  var rows = sorted(filtered());
  $('#viewSub').textContent = rows.length + ' z ' + S.orders.filter(inYear).length + ' zakázek';
  var f = el('div', 'filters');
  f.appendChild(sel('Stav', S.f.status, [''].concat(S.dict.statuses, ['Zrušeno', 'Ostatní', 'Nezadáno']), function (v) { S.f.status = v; render(); }));
  f.appendChild(sel('Středisko', S.f.center, [''].concat(S.dict.centers), function (v) { S.f.center = v; render(); }));
  f.appendChild(sel('Zodpovídá', S.f.owner, [''].concat(uniq('owner')), function (v) { S.f.owner = v; render(); }));
  f.appendChild(sel('Požaduje', S.f.requester, [''].concat(uniq('requester')), function (v) { S.f.requester = v; render(); }));
  var flags = [['', 'Vše'], ['open', 'Rozpracované'], ['overdue', 'Po termínu'], ['late', 'Dodáno pozdě'], ['undelivered', 'Nedodané']];
  var fw = el('div', 'field', '<label>Rychlý filtr</label>');
  var g = el('div', '', ''); g.style.cssText = 'display:flex;gap:4px';
  flags.forEach(function (x) {
    var b = el('button', 'btn', x[1]); b.setAttribute('aria-pressed', String(S.f.flag === x[0]));
    b.onclick = function () { S.f.flag = x[0]; render(); }; g.appendChild(b);
  });
  fw.appendChild(g); f.appendChild(fw);
  f.appendChild(el('span', 'spacer'));
  var exp = el('button', 'btn', '⤓ Export CSV'); exp.onclick = function () { exportCSV(rows); };
  var clr = el('button', 'btn ghost', 'Zrušit filtry'); clr.onclick = function () { S.f = { status: '', center: '', owner: '', requester: '', flag: '' }; S.q = ''; $('#q').value = ''; render(); };
  f.appendChild(clr); f.appendChild(exp);
  root.appendChild(f);

  var cols = S.year >= 2026 ? ['code', 'name', 'qty', 'status', 'center', 'owner', 'requester', 'order', 'dateOrder', 'dateRequired', 'dateDelivered', 'priority', 'invoice']
    : S.year >= 2021 ? ['code', 'name', 'qty', 'status', 'center', 'requester', 'order', 'dateOrder', 'dateRequired', 'dateDelivered', 'invoice']
    : ['code', 'name', 'qty', 'status', 'requester', 'order', 'dateOrder', 'dateRequired', 'dateDelivered', 'invoice'];
  var p = panel('Seznam zakázek', 'kliknutím na řádek otevřete detail · záhlaví řadí');
  p.body.style.padding = '0'; p.body.appendChild(table(rows, cols));
  root.appendChild(p.panel);
}
function uniq(k) {
  var m = {}; S.orders.forEach(function (o) { if (o[k]) m[o[k]] = 1; });
  return Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'cs'); });
}
function sel(label, val, opts, on) {
  var w = el('div', 'field', '<label>' + esc(label) + '</label>');
  var s = el('select');
  opts.forEach(function (o) {
    var op = el('option', '', esc(o === '' ? '— vše —' : o)); op.value = o;
    if (String(o) === String(val)) op.selected = true; s.appendChild(op);
  });
  s.onchange = function () { on(s.value); };
  w.appendChild(s); return w;
}

// ---------------------------------------------------------------- 3) Plán výroby (Gantt)
var MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
var PHASES = ['dateOrder', 'planDesign', 'planProd', 'planAssembly', 'planTuning', 'dateRequired'];

function viewGantt(root) {
  var y = S.ganttYear, m = S.ganttMonth;
  $('#viewSub').textContent = MONTHS[m - 1] + ' ' + y;
  var bar = el('div', 'filters');
  var prev = el('button', 'btn', '‹'); prev.onclick = function () { shiftMonth(-1); };
  var next = el('button', 'btn', '›'); next.onclick = function () { shiftMonth(1); };
  var mw = el('div', 'field', '<label>Měsíc</label>');
  var ms = el('select'); MONTHS.forEach(function (n, i) { var o = el('option', '', n); o.value = i + 1; if (i + 1 === m) o.selected = true; ms.appendChild(o); });
  ms.onchange = function () { S.ganttMonth = +ms.value; render(); }; mw.appendChild(ms);
  var yw = el('div', 'field', '<label>Rok</label>');
  var ys = el('select'); for (var i = S.years[S.years.length - 1]; i <= S.years[0] + 1; i++) { var o = el('option', '', i); o.value = i; if (i === y) o.selected = true; ys.appendChild(o); }
  ys.onchange = function () { S.ganttYear = +ys.value; render(); }; yw.appendChild(ys);
  var ob = el('button', 'btn', 'Jen rozpracované'); ob.setAttribute('aria-pressed', String(S.ganttOnlyOpen));
  ob.onclick = function () { S.ganttOnlyOpen = !S.ganttOnlyOpen; render(); };
  var tb = el('button', 'btn', 'Dnes'); tb.onclick = function () { var d = new Date(); S.ganttMonth = d.getMonth() + 1; S.ganttYear = d.getFullYear(); render(); };
  bar.appendChild(prev); bar.appendChild(mw); bar.appendChild(yw); bar.appendChild(next); bar.appendChild(tb);
  bar.appendChild(el('span', 'spacer')); bar.appendChild(ob);
  root.appendChild(bar);

  var dim = new Date(y, m, 0).getDate();
  var first = y + '-' + pad(m) + '-01', last = y + '-' + pad(m) + '-' + pad(dim);
  var rows = S.orders.filter(function (o) {
    if (o.year !== S.ganttYear) return false;          // list Plan pracuje vždy s jedním rokem
    if (S.ganttOnlyOpen && !o.open) return false;
    if (S.q && !matchesQ(o)) return false;
    var a = o.dateOrder || o.dateRequired, b = o.dateDelivered || o.dateRequired || o.dateOrder;
    if (!a || !b) return false;
    var lo = a < b ? a : b, hi = a < b ? b : a;
    if (!o.dateDelivered && o.open && hi < TODAY) hi = TODAY;   // běžící zakázka se protahuje do dneška
    return lo <= last && hi >= first;
  }).sort(function (a, b) { return (a.dateRequired || '9999').localeCompare(b.dateRequired || '9999'); });

  var p = panel('Harmonogram — plán vs. skutečnost', rows.length + ' zakázek v tomto měsíci');
  p.body.style.padding = '0';
  var wrap = el('div', 'gantt');
  var t = el('table', 'gantt-t');
  var thead = el('thead');
  var r1 = el('tr');
  r1.appendChild(th('head-lbl', 'Zakázka', 'left:0;min-width:300px;max-width:300px'));
  r1.appendChild(th('head-lbl', 'Číslo', 'left:300px;min-width:104px'));
  r1.appendChild(th('head-lbl', '', 'left:404px;min-width:64px'));
  for (var d = 1; d <= dim; d++) {
    var ds = y + '-' + pad(m) + '-' + pad(d);
    var wd = new Date(y, m - 1, d).getDay();
    var h = th('day' + (wd === 0 || wd === 6 ? ' wknd' : '') + (ds === TODAY ? ' today' : ''), d);
    r1.appendChild(h);
  }
  thead.appendChild(r1); t.appendChild(thead);
  var tb2 = el('tbody');
  rows.forEach(function (o) {
    ['Plán', 'Skut.'].forEach(function (kind, ki) {
      var tr = el('tr');
      if (ki === 0) {
        var c1 = el('td', 'gc-lbl', esc(o.name)); c1.rowSpan = 2; c1.title = o.name; c1.style.cursor = 'pointer';
        c1.onclick = function () { openDrawer(o); };
        var c2 = el('td', 'gc-code', esc(o.code)); c2.rowSpan = 2;
        tr.appendChild(c1); tr.appendChild(c2);
      }
      tr.appendChild(el('td', 'gc-row', kind));
      for (var d = 1; d <= dim; d++) {
        var ds = y + '-' + pad(m) + '-' + pad(d);
        var wd = new Date(y, m - 1, d).getDay();
        var cls = 'day' + (wd === 0 || wd === 6 ? ' wknd' : '') + (ds === TODAY ? ' today' : '');
        cls += ' ' + (ki === 0 ? planClass(o, ds) : actualClass(o, ds));
        var td = el('td', cls);
        tr.appendChild(td);
      }
      tb2.appendChild(tr);
    });
  });
  t.appendChild(tb2); wrap.appendChild(t);
  if (!rows.length) wrap.appendChild(el('div', 'empty', 'V tomto měsíci neprobíhá žádná zakázka.'));
  p.body.appendChild(wrap);
  var lg = el('div', 'legend');
  [['--g1', 'objednávka → design'], ['--g2', 'design → výroba'], ['--g3', 'výroba → montáž'], ['--g4', 'montáž → ladění'],
   ['--g5', 'ladění → termín'], ['--g6', 'milník plánu'], ['--g7', 'požadovaný termín'],
   ['--a-fill', 'skutečný průběh'], ['--a-end', 'dodáno'], ['--a-late', 'zpoždění']].forEach(function (x) {
    lg.appendChild(el('span', '', '<i style="background:var(' + x[0] + ')"></i>' + x[1]));
  });
  p.panel.appendChild(lg);
  root.appendChild(p.panel);
}
function th(cls, txt, style) { var e = el('th', cls, esc(txt)); if (style) e.style.cssText += style; if (cls.indexOf('head-lbl') >= 0) e.style.position = 'sticky'; return e; }
function matchesQ(o) { var q = norm(S.q); return norm([o.name, o.code, o.order, o.requester, o.owner].join(' ')).indexOf(q) >= 0; }

/* Barvy plánu — přesně podle podmíněného formátování listu "Plan":
   postupně tmavší zelená mezi milníky, milník tmavě zelený, požadovaný termín nejtmavší. */
function planClass(o, ds) {
  var pts = PHASES.map(function (k) { return o[k] || ''; });
  var req = o.dateRequired || '';
  if (req && ds === req) return 'fin';
  for (var i = 1; i < 5; i++) { if (pts[i] && ds === pts[i]) return 'mst'; }
  var seq = [], idx = [];
  for (var j = 0; j < pts.length; j++) if (pts[j]) { seq.push(pts[j]); idx.push(j); }
  for (var s = 0; s < seq.length - 1; s++) {
    if (ds >= seq[s] && ds < seq[s + 1]) return 'ph' + Math.min(5, idx[s] + 1);
  }
  return '';
}
/* Skutečnost — modrý průběh od objednávky po dodání, tmavý den dodání,
   červená za překročeným termínem (i u dosud nedodaných). */
function actualClass(o, ds) {
  var from = o.dateOrder, del = o.dateDelivered, req = o.dateRequired;
  if (!from) return '';
  if (del) {
    if (ds === del) return 'actend';
    if (req && del > req && ds > req && ds < del) return 'actlate';
    if (ds >= from && ds < del) return 'act';
    return '';
  }
  if (!o.open) return '';
  if (ds > TODAY) return '';
  if (req && ds > req) return 'actlate';
  if (ds >= from) return 'act';
  return '';
}
function shiftMonth(d) {
  var m = S.ganttMonth + d, y = S.ganttYear;
  if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
  S.ganttMonth = m; S.ganttYear = y; render();
}

// ---------------------------------------------------------------- 4) Kanban
function viewBoard(root) {
  var rows = filtered().filter(function (o) { return o.open || o.status === 'Hotovo'; });
  $('#viewSub').textContent = 'přetažením karty změníte stav';
  var cols = S.dict.statuses;
  var board = el('div', 'board');
  cols.forEach(function (st) {
    var items = rows.filter(function (o) { return o.status === st; })
      .sort(function (a, b) { return (a.priority || 9) - (b.priority || 9) || (a.dateRequired || '9999').localeCompare(b.dateRequired || '9999'); });
    var col = el('div', 'col');
    col.appendChild(el('header', '', statusPill(st) + '<span class="n">' + items.length + '</span>'));
    var stack = el('div', 'stack');
    items.slice(0, 200).forEach(function (o) {
      var card = el('div', 'card' + (o.overdue ? ' od' : ''));
      card.draggable = true;
      card.innerHTML = '<span class="t">' + esc(o.name) + '</span><span class="m">' + esc(o.code) +
        (o.center ? ' · ' + esc(o.center) : '') + (o.dateRequired ? ' · ' + (o.overdue ? '<b class="late">' : '') + fmtDate(o.dateRequired) + (o.overdue ? '</b>' : '') : '') +
        (o.priority ? ' ' + prioTag(o.priority) : '') + '</span>';
      card.ondragstart = function (e) { e.dataTransfer.setData('text/plain', o.id); card.classList.add('dragging'); };
      card.ondragend = function () { card.classList.remove('dragging'); };
      card.onclick = function () { openDrawer(o); };
      stack.appendChild(card);
    });
    col.ondragover = function (e) { e.preventDefault(); col.classList.add('drop'); };
    col.ondragleave = function () { col.classList.remove('drop'); };
    col.ondrop = function (e) {
      e.preventDefault(); col.classList.remove('drop');
      var id = e.dataTransfer.getData('text/plain');
      var o = S.orders.filter(function (x) { return x.id === id; })[0];
      if (o && o.status !== st) {
        o.status = st;
        if (st === 'Hotovo' && !o.dateDelivered) o.dateDelivered = TODAY;
        S.dirty = true; recalc(); save(); render(); toast(o.code + ' → ' + st);
      }
    };
    col.appendChild(stack); board.appendChild(col);
  });
  root.appendChild(board);
}

// ---------------------------------------------------------------- 5) Analýza
function viewStats(root) {
  $('#viewSub').textContent = 'všechny roky';
  var byYear = {};
  S.orders.forEach(function (o) {
    var y = byYear[o.year] || (byYear[o.year] = { n: 0, del: 0, ontime: 0, lead: [] });
    y.n++; if (o.delivered) { y.del++; if (!o.late) y.ontime++; if (o.lead != null && o.lead >= 0 && o.lead < 900) y.lead.push(o.lead); }
  });
  var years = Object.keys(byYear).map(Number).sort();

  var p1 = panel('Počet zakázek podle roku', 'celkem ' + S.orders.length.toLocaleString('cs'));
  p1.body.appendChild(barChart(years.map(function (y) {
    return { label: String(y), value: byYear[y].n, note: byYear[y].n + ' zak.' };
  })));
  var p2 = panel('Dodržení termínů', 'podíl dodávek v požadovaném termínu');
  p2.body.appendChild(barChart(years.map(function (y) {
    var d = byYear[y], pct = d.del ? Math.round(d.ontime / d.del * 100) : 0;
    return { label: String(y), value: pct, max: 100, note: pct + ' %', color: pct >= 85 ? 'var(--ok)' : pct >= 70 ? 'var(--warn)' : 'var(--bad)' };
  })));
  var p3 = panel('Průměrná průběžná doba', 'objednávka → dodání, ve dnech');
  p3.body.appendChild(barChart(years.map(function (y) {
    var l = byYear[y].lead, a = l.length ? Math.round(l.reduce(function (x, z) { return x + z; }, 0) / l.length) : 0;
    return { label: String(y), value: a, note: a + ' dní' };
  })));
  var top = {}; S.orders.forEach(function (o) { if (o.requester) top[o.requester] = (top[o.requester] || 0) + 1; });
  var tk = Object.keys(top).sort(function (a, b) { return top[b] - top[a]; }).slice(0, 12);
  var p4 = panel('Nejčastější zadavatelé', 'napříč všemi roky');
  p4.body.appendChild(barChart(tk.map(function (k) { return { label: k, value: top[k], note: String(top[k]) }; })));

  var g = el('div', 'charts');
  [p1, p2, p3, p4].forEach(function (p) { g.appendChild(p.panel); });
  root.appendChild(g);
}
function barChart(items) {
  var max = Math.max.apply(null, items.map(function (i) { return i.max || i.value; }).concat([1]));
  var w = el('div', 'bars');
  items.forEach(function (i) {
    w.appendChild(el('div', 'bar-row', '<div class="lb">' + esc(i.label) + '</div><div class="bar-track"><div class="bar-fill" style="width:' +
      Math.max(1, i.value / (i.max || max) * 100) + '%;background:' + (i.color || 'var(--accent)') + '"></div></div><div class="vl">' + esc(i.note) + '</div>'));
  });
  return w;
}

// ---------------------------------------------------------------- 6) Číselníky
function viewDict(root) {
  $('#viewSub').textContent = 'nastavení evidence';
  var defs = [
    ['statuses', 'Stavy zakázky', 'pořadí určuje sloupce v kanbanu'],
    ['centers', 'Střediska', ''],
    ['owners', 'Zodpovědné osoby', ''],
    ['prefixes', 'Předčíslí zakázek', 'např. DE, OS, NP'],
    ['priorities', 'Priority', '1 = nejvyšší']
  ];
  var g = el('div', 'charts');
  defs.forEach(function (d) {
    var p = panel(d[1], d[2]);
    var list = el('div', 'dictlist');
    S.dict[d[0]].forEach(function (v, i) {
      var c = el('span', 'chip', esc(v) + ' <button title="Odebrat">✕</button>');
      $('button', c).onclick = function () { S.dict[d[0]].splice(i, 1); save(); render(); };
      list.appendChild(c);
    });
    var add = el('form'); add.style.cssText = 'display:flex;gap:6px;margin-top:10px';
    add.innerHTML = '<input placeholder="Přidat…" style="flex:1"><button class="btn" type="submit">Přidat</button>';
    add.onsubmit = function (e) {
      e.preventDefault(); var v = $('input', add).value.trim(); if (!v) return;
      S.dict[d[0]].push(d[0] === 'priorities' ? +v : v); save(); render();
    };
    p.body.appendChild(list); p.body.appendChild(add);
    g.appendChild(p.panel);
  });
  root.appendChild(g);

  var p = panel('Data a zálohy', 'evidence se ukládá v tomto prohlížeči');
  var b = el('div'); b.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
  var e1 = el('button', 'btn', '⤓ Export všech dat (CSV)'); e1.onclick = function () { exportCSV(S.orders); };
  var e2 = el('button', 'btn', '⤓ Záloha (JSON)'); e2.onclick = function () { download('prehled-zakazek-zaloha.json', JSON.stringify({ orders: S.orders, dict: S.dict }, null, 1), 'application/json'); };
  var imp = el('label', 'btn', '⤒ Obnovit ze zálohy<input type="file" accept=".json" hidden>');
  $('input', imp).onchange = function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try { var d = JSON.parse(r.result); S.orders = d.orders; S.dict = d.dict || S.dict; recalc(); save(); render(); toast('Data obnovena.'); }
      catch (e) { toast('Soubor se nepodařilo načíst.'); }
    };
    r.readAsText(f);
  };
  var rst = el('button', 'btn danger', '↺ Vrátit na původní data z Excelu');
  rst.onclick = function () {
    if (!confirm('Opravdu zahodit všechny úpravy a načíst data z původního sešitu?')) return;
    S.orders = JSON.parse(JSON.stringify(seed)); S.dict = JSON.parse(JSON.stringify(DEFAULT_DICT));
    S.dirty = false; recalc(); save(); render(); toast('Obnoveno z původního sešitu.');
  };
  [e1, e2, imp, rst].forEach(function (x) { b.appendChild(x); });
  p.body.appendChild(b);
  p.body.appendChild(el('p', 'note', 'Aplikace pracuje s ' + S.orders.length.toLocaleString('cs') + ' zakázkami z let ' +
    S.years[S.years.length - 1] + '–' + S.years[0] + ', převzatými ze sešitu <b>PREHLED_ZAKAZEK_NOVY.xlsx</b> (listy jednotlivých roků, list Plan a číselníky z listu Support). ' +
    'Úpravy zůstávají v tomto prohlížeči — pro sdílení mezi lidmi je dalším krokem společné úložiště.'));
  root.appendChild(p.panel);
}

// ---------------------------------------------------------------- detail / editace
function openDrawer(o, isNew) {
  var ov = $('#overlay');
  var scrim = el('div', 'scrim');
  var dr = el('div', 'drawer');
  var d = JSON.parse(JSON.stringify(o));
  var head = el('header');
  head.innerHTML = '<div style="flex:1"><span class="eyebrow">' + esc(d.code || 'nová zakázka') + '</span><h2>' + esc(d.name || 'Nová zakázka') + '</h2></div>';
  var x = el('button', 'btn ghost', '✕'); x.onclick = close; head.appendChild(x);
  dr.appendChild(head);

  var body = el('div', 'body');
  var form = el('div', 'formgrid');
  function fld(key, label, type, opts, full) {
    var w = el('div', 'field' + (full ? ' full' : ''), '<label>' + esc(label) + '</label>');
    var inp;
    if (opts) {
      inp = el('select');
      [''].concat(opts).forEach(function (v) { var op = el('option', '', v === '' ? '—' : v); op.value = v; if (String(v) === String(d[key] || '')) op.selected = true; inp.appendChild(op); });
    } else { inp = el('input'); inp.type = type || 'text'; inp.value = d[key] || ''; }
    inp.onchange = function () { d[key] = inp.value; };
    inp.oninput = function () { d[key] = inp.value; };
    w.appendChild(inp); form.appendChild(w); return inp;
  }
  fld('name', 'Název zakázky', 'text', null, true);
  fld('code', 'Číslo zakázky', 'text');
  fld('qty', 'Množství', 'text');
  fld('status', 'Stav', null, S.dict.statuses.concat(['Zrušeno']));
  fld('center', 'Středisko', null, S.dict.centers);
  fld('owner', 'Zodpovídá', null, S.dict.owners);
  fld('requester', 'Požaduje', 'text');
  fld('order', 'Objednávka', 'text');
  fld('priority', 'Priorita', null, S.dict.priorities);
  fld('dateOrder', 'Datum objednávky', 'date');
  fld('dateRequired', 'Požadovaný termín', 'date');
  fld('planDesign', 'Plán — design', 'date');
  fld('planProd', 'Plán — výroba', 'date');
  fld('planAssembly', 'Plán — montáž', 'date');
  fld('planTuning', 'Plán — ladění', 'date');
  fld('dateDelivered', 'Datum dodání', 'date');
  fld('invoice', 'Faktura', 'text', null, true);
  body.appendChild(form);

  if (!isNew) {
    var tl = el('div', 'timeline');
    [['dateOrder', 'Objednávka'], ['planDesign', 'Design'], ['planProd', 'Výroba'], ['planAssembly', 'Montáž'],
     ['planTuning', 'Ladění'], ['dateRequired', 'Požadovaný termín'], ['dateDelivered', 'Dodáno']].forEach(function (p) {
      if (!o[p[0]]) return;
      tl.appendChild(el('div', 'tl done', '<span class="lb">' + p[1] + '</span><span class="dt">' + fmtDate(o[p[0]]) + '</span>'));
    });
    var info = [];
    if (o.lead != null && o.lead >= 0) info.push('průběžná doba ' + o.lead + ' dní');
    if (o.late) info.push('dodáno ' + days(o.dateRequired, o.dateDelivered) + ' dní po termínu');
    if (o.overdue) info.push('termín překročen o ' + (-days(TODAY, o.dateRequired)) + ' dní');
    var sec = el('div');
    sec.appendChild(el('div', 'eyebrow', 'Průběh zakázky'));
    sec.appendChild(tl);
    if (info.length) sec.appendChild(el('p', 'note', esc(info.join(' · '))));
    body.appendChild(sec);
  }
  dr.appendChild(body);

  var ft = el('footer');
  var ok = el('button', 'btn primary', isNew ? 'Založit zakázku' : 'Uložit změny');
  ok.onclick = function () {
    if (!d.name) { toast('Vyplňte název zakázky.'); return; }
    if (isNew) { d.id = 'new-' + Date.now(); d.year = +(d.dateOrder || TODAY).slice(0, 4); S.orders.push(d); }
    else { var t = S.orders.filter(function (r) { return r.id === o.id; })[0]; if (t) Object.keys(d).forEach(function (k) { t[k] = d[k]; }); }
    S.dirty = true; recalc(); save(); close(); render(); toast(isNew ? 'Zakázka založena.' : 'Změny uloženy.');
  };
  var del = el('button', 'btn danger', 'Smazat');
  del.onclick = function () {
    if (!confirm('Smazat zakázku ' + (o.code || '') + '?')) return;
    S.orders = S.orders.filter(function (r) { return r.id !== o.id; });
    S.dirty = true; recalc(); save(); close(); render(); toast('Zakázka smazána.');
  };
  ft.appendChild(ok); ft.appendChild(el('span', 'spacer'));
  if (!isNew) ft.appendChild(del);
  dr.appendChild(ft);

  scrim.appendChild(dr);
  scrim.onclick = function (e) { if (e.target === scrim) close(); };
  ov.appendChild(scrim);
  document.addEventListener('keydown', onKey);
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { ov.innerHTML = ''; document.removeEventListener('keydown', onKey); }
}

function newOrder() {
  var y = S.year, n = 1;
  S.orders.filter(function (o) { return o.year === y; }).forEach(function (o) {
    var m = /(\d+)\s*\/\s*(\d+)/.exec(o.code || ''); if (m && +m[1] >= n) n = +m[1] + 1;
  });
  var code = 'OS-' + pad(n).padStart(3, '0') + '/' + String(y).slice(2);
  openDrawer({ id: '', name: '', code: code, status: 'Design', center: 'Obrobna', dateOrder: TODAY, year: y }, true);
}

// ---------------------------------------------------------------- export
var CSV_COLS = ['code', 'name', 'qty', 'status', 'center', 'owner', 'requester', 'order', 'dateOrder',
  'planDesign', 'planProd', 'planAssembly', 'planTuning', 'dateRequired', 'dateDelivered', 'priority', 'invoice', 'year'];
var CSV_HEAD = ['Č.ZAKÁZKY', 'NÁZEV ZAKÁZKY', 'MNOŽSTVÍ', 'STATUS', 'STŘEDISKO', 'ZODPOVÍDÁ', 'POŽADUJE', 'OBJEDNÁVKA', 'DATUM OBJ.',
  'PLÁN DESIGN', 'PLÁN VÝROBA', 'PLÁN MONTÁŽ', 'PLÁN LADĚNÍ', 'POŽAD. DATUM', 'DATUM DODÁNÍ', 'PRIORITA', 'FAKTURA', 'ROK'];
function exportCSV(rows) {
  var out = [CSV_HEAD.join(';')];
  rows.forEach(function (o) {
    out.push(CSV_COLS.map(function (k) {
      var v = o[k] == null ? '' : String(o[k]);
      return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(';'));
  });
  download('prehled-zakazek.csv', '﻿' + out.join('\r\n'), 'text/csv');
}
function download(name, text, mime) {
  showText(name, text, mime);
}
function showText(name, text, mime) {
  var ov = $('#overlay');
  var scrim = el('div', 'scrim');
  var dr = el('div', 'drawer');
  dr.innerHTML = '<header><div style="flex:1"><span class="eyebrow">Export</span><h2>' + esc(name) + '</h2></div></header>';
  var b = el('div', 'body');
  b.appendChild(el('p', 'note', 'Soubor stáhněte tlačítkem níže. Pokud je stahování v tomto zobrazení blokované, text zkopírujte a vložte do Excelu — oddělovačem je středník.'));
  var ta = el('textarea'); ta.value = text; ta.style.cssText = 'width:100%;height:50vh;font-family:"IBM Plex Mono",monospace;font-size:12px';
  b.appendChild(ta); dr.appendChild(b);
  var ft = el('footer');
  var dl = el('button', 'btn primary', '\u2913 Stáhnout ' + name);
  dl.onclick = function () {
    try {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' }));
      a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    } catch (e) { toast('Stahování není v tomto zobrazení povolené — zkopírujte text.'); }
  };
  var cp = el('button', 'btn', 'Kopírovat vše');
  cp.onclick = function () { ta.select(); try { document.execCommand('copy'); toast('Zkopírováno.'); } catch (e) {} };
  var cl = el('button', 'btn', 'Zavřít'); cl.onclick = function () { ov.innerHTML = ''; };
  ft.appendChild(dl); ft.appendChild(cp); ft.appendChild(el('span', 'spacer')); ft.appendChild(cl); dr.appendChild(ft);
  scrim.appendChild(dr); scrim.onclick = function (e) { if (e.target === scrim) ov.innerHTML = ''; };
  ov.innerHTML = ''; ov.appendChild(scrim);
}
function toast(msg) {
  var t = el('div', 'toast', esc(msg));
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2600);
}

// ---------------------------------------------------------------- start
load();
var ysel = $('#yearSel');
S.years.forEach(function (y) { var o = el('option', '', y); o.value = y; if (y === S.year) o.selected = true; ysel.appendChild(o); });
ysel.onchange = function () { S.year = +ysel.value; S.ganttYear = S.year; render(); };
$('#q').oninput = function () { S.q = $('#q').value.trim(); render(); };
$('#newBtn').onclick = newOrder;
$('#themeBtn').onclick = function () {
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : cur === 'light' ? '' : 'dark';
  if (next) document.documentElement.setAttribute('data-theme', next);
  else document.documentElement.removeAttribute('data-theme');
};
render();
})();
