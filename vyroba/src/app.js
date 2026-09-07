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
var MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];

// V publikovaném zobrazení stahuje soubory hostitel; v lokálním souboru běžný odkaz.
var DL = null;
if (window.claude && typeof window.claude.use === 'function') {
  try { window.claude.use('downloads').then(function (d) { DL = d; }, function () {}); } catch (e) {}
}
function saveFile(name, text, mime) {
  if (DL) {
    return DL.save({ filename: name, data: new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' }) })
      .then(function () { toast('Soubor ' + name + ' uložen.'); },
            function (err) { if (err && err.code === 'declined') return; toast('Uložení se nezdařilo — zkopírujte text níže.'); });
  }
  try {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } catch (e) { toast('Stahování zde není povolené — zkopírujte text.'); }
}

// ---------------------------------------------------------------- stav
var seed = JSON.parse($('#seed').textContent);
var S = {
  orders: [], dict: null, view: 'dash', q: '', year: 0,
  f: { status: '', center: '', owner: '', requester: '', flag: '' },
  sort: { key: 'code', dir: -1 },
  ganttMonth: new Date().getMonth() + 1, ganttYear: new Date().getFullYear(),
  ganttOnlyOpen: true, sel: null, dirty: false, savedAt: null,
  hMonth: (new Date()).getMonth() + 1,
  zoom: 'den', ganttGroup: false, ganttLoad: true,
  doneFilter: 'all',
  server: { url: '', token: '' }
};

function load() {
  var raw = null;
  try { raw = localStorage.getItem(STORE); } catch (e) {}
  if (raw) {
    try {
      var st = JSON.parse(raw);
      S.orders = st.orders; S.dict = st.dict || DEFAULT_DICT;
      S.server = st.server || S.server;
      if (st.saved) S.savedAt = new Date(st.saved);
      recalc(); return;
    } catch (e) {}
  }
  S.orders = seed.slice(); S.dict = JSON.parse(JSON.stringify(DEFAULT_DICT)); recalc();
}
/* Zápis do prohlížeče probíhá po každé úpravě jako pojistka.
   Tlačítko Uložit provede trvalé uložení — na server, je-li nastaven. */
var cacheWarned = false;
function cache() {
  try {
    localStorage.setItem(STORE, JSON.stringify({ orders: S.orders, dict: S.dict, server: S.server, saved: new Date().toISOString() }));
    return true;
  } catch (e) {
    if (!cacheWarned) {
      cacheWarned = true;
      toast(e.name === 'SecurityError'
        ? 'Toto zobrazení nedovoluje ukládání — změny platí jen do zavření okna.'
        : 'Data se nevešla do úložiště prohlížeče — uložte je na server nebo si stáhněte zálohu.');
    }
    return false;
  }
}
function save() { cache(); S.dirty = true; markSave(); }

function saveNow() {
  cache();
  if (!S.server.url) {
    S.dirty = false; S.savedAt = new Date(); markSave();
    toast('Uloženo do tohoto prohlížeče.');
    return;
  }
  var btn = $('#saveBtn'); btn.disabled = true; btn.textContent = 'Ukládám…';
  var h = { 'Content-Type': 'application/json' };
  if (S.server.token) h.Authorization = 'Bearer ' + S.server.token;
  fetch(S.server.url, { method: 'PUT', headers: h, body: JSON.stringify({ orders: S.orders, dict: S.dict }) })
    .then(function (r) {
      if (!r.ok) throw new Error('server odpověděl ' + r.status);
      S.dirty = false; S.savedAt = new Date(); markSave();
      toast('Uloženo na server.');
    })
    .catch(function (e) {
      markSave();
      toast('Uložení na server se nezdařilo: ' + e.message + ' — data zůstala v prohlížeči.');
    })
    .then(function () { btn.disabled = false; });
}
function markSave() {
  var b = $('#saveBtn'); if (!b) return;
  b.innerHTML = S.dirty ? '<span class="savedot"></span> Uložit'
    : 'Uloženo' + (S.savedAt ? ' ' + pad(S.savedAt.getHours()) + ':' + pad(S.savedAt.getMinutes()) : '');
  b.className = 'btn' + (S.dirty ? ' primary' : '');
  b.title = S.server.url ? 'Uložit na ' + S.server.url + ' (Ctrl+S)' : 'Uložit do prohlížeče (Ctrl+S) — server zatím není nastaven';
}
/* Odhadované hodiny se plánují do měsíce požadovaného termínu; není-li,
   použije se plán výroby, jinak datum objednávky. */
function hoursMonth(o) {
  var d = o.dateRequired || o.planProd || o.dateOrder;
  return d ? d.slice(0, 7) : '';
}
function hOb(o) { return +o.hoursObrobna || 0; }
function hSv(o) { return +o.hoursSvarovna || 0; }
function hTot(o) { return hOb(o) + hSv(o); }
function fmtH(n) { return (Math.round(n * 10) / 10).toLocaleString('cs') + ' h'; }

function recalc() {
  S.orders.forEach(function (o) {
    o.status = o.status || 'Nezadáno';
    o.delivered = !!o.dateDelivered;
    o.late = !!(o.dateDelivered && o.dateRequired && o.dateDelivered > o.dateRequired);
    o.overdue = !o.dateDelivered && CLOSED.indexOf(o.status) < 0 && !!o.dateRequired && o.dateRequired < TODAY;
    o.open = CLOSED.indexOf(o.status) < 0;
    o.lead = days(o.dateOrder, o.dateDelivered);
    if (o.invoiced === undefined) o.invoiced = !!o.invoice;   // historické zakázky s číslem faktury
    o.hours = hTot(o);
    o.hmonth = hoursMonth(o);
  });
  var ys = {}; S.orders.forEach(function (o) { ys[o.year] = 1; });
  S.years = Object.keys(ys).map(Number).sort(function (a, b) { return b - a; });
  if (!S.year || S.years.indexOf(S.year) < 0) S.year = S.years[0];
}

// ---------------------------------------------------------------- historie pohledů
var HIST = [], HP = -1, HLOCK = false;
function snapshot() {
  return JSON.stringify({ view: S.view, year: S.year, q: S.q, f: S.f, sort: S.sort,
    gm: S.ganttMonth, gy: S.ganttYear, go: S.ganttOnlyOpen,
    z: S.zoom, gg: S.ganttGroup, gl: S.ganttLoad, hm: S.hMonth, df: S.doneFilter });
}
function pushHist() {
  if (HLOCK) return;
  var snap = snapshot();
  if (HIST[HP] === snap) return;
  HIST = HIST.slice(0, HP + 1);
  HIST.push(snap);
  if (HIST.length > 120) HIST.shift();
  HP = HIST.length - 1;
}
function goHist(step) {
  var n = HP + step;
  if (n < 0 || n >= HIST.length) return;
  HP = n;
  var st = JSON.parse(HIST[HP]);
  S.view = st.view; S.year = st.year; S.q = st.q; S.f = st.f; S.sort = st.sort;
  S.ganttMonth = st.gm; S.ganttYear = st.gy; S.ganttOnlyOpen = st.go;
  S.zoom = st.z; S.ganttGroup = st.gg; S.ganttLoad = st.gl; S.hMonth = st.hm; S.doneFilter = st.df;
  $('#q').value = S.q; $('#yearSel').value = S.year;
  HLOCK = true; render(); HLOCK = false;
}

// ---------------------------------------------------------------- filtrování
function inYear(o) { return !S.year || o.year === S.year; }
function isDone(o) { return o.status === 'Hotovo'; }
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
function activeOrders() { return S.orders.filter(function (o) { return matches(o) && !isDone(o); }); }
function doneOrders() { return S.orders.filter(function (o) { return matches(o) && isDone(o); }); }
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

// ---------------------------------------------------------------- přílohy
/* Soubory (skeny faktur a objednávek) se ukládají do IndexedDB prohlížeče —
   localStorage by na ně kapacitou nestačil. U zakázky zůstává jen popis souboru. */
var FDB = null;
var MEM = {};          // fid -> Blob, drží soubor po dobu relace i tam, kde úložiště chybí
var STORAGE_OK = null; // null = nezjištěno, false = prohlížeč úložiště odmítl
function fdb() {
  return new Promise(function (res, rej) {
    if (FDB) return res(FDB);
    if (!window.indexedDB) return rej(new Error('prohlížeč neumí IndexedDB'));
    var rq = indexedDB.open('prehled-zakazek-soubory', 1);
    rq.onupgradeneeded = function () { rq.result.createObjectStore('files', { keyPath: 'fid' }); };
    rq.onsuccess = function () { FDB = rq.result; res(FDB); };
    rq.onerror = function () { rej(rq.error); };
  });
}
function fdbTx(mode, fn) {
  return fdb().then(function (db) {
    return new Promise(function (res, rej) {
      var tx = db.transaction('files', mode), st = tx.objectStore('files'), out;
      var rq = fn(st);
      if (rq) rq.onsuccess = function () { out = rq.result; };
      tx.oncomplete = function () { res(out); };
      tx.onerror = function () { rej(tx.error); };
    });
  });
}
function fileMark(o, kind) {
  var n = (o.files || []).filter(function (f) { return f.kind === kind; }).length;
  return n ? ' <span class="clip" title="' + n + ' příloha/y">📎' + (n > 1 ? n : '') + '</span>' : '';
}
function fmtSize(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' kB' : (b / 1048576).toFixed(1) + ' MB'; }
var MAX_FILE = 25 * 1024 * 1024;

function attachFiles(order, kind, fileList, done) {
  var files = Array.prototype.slice.call(fileList || []);
  var queue = files.filter(function (f) {
    if (f.size > MAX_FILE) { toast('Soubor ' + f.name + ' je větší než 25 MB.'); return false; }
    return true;
  });
  if (!queue.length) return;

  // soubor je k dispozici okamžitě; trvalé uložení se dohání na pozadí
  queue.forEach(function (f) {
    var fid = 'f' + Date.now() + Math.random().toString(36).slice(2, 8);
    MEM[fid] = f;
    order.files = order.files || [];
    var meta = { fid: fid, kind: kind, name: f.name, size: f.size, type: f.type, added: TODAY };
    order.files.push(meta);
    fdbTx('readwrite', function (st) { st.put({ fid: fid, blob: f, name: f.name, type: f.type }); })
      .then(function () { STORAGE_OK = true; })
      .catch(function () { STORAGE_OK = false; meta.temp = true; done(); });
  });
  save(); done();
  toast(queue.length === 1 ? 'Soubor ' + queue[0].name + ' připojen.' : queue.length + ' souborů připojeno.');
}
function getBlob(f) {
  if (MEM[f.fid]) return Promise.resolve(MEM[f.fid]);
  return fdbTx('readonly', function (st) { return st.get(f.fid); })
    .then(function (rec) { return rec ? rec.blob : null; }, function () { return null; });
}
/* Náhled se vykresluje přímo ve stránce — nový panel bývá v prohlížeči blokovaný. */
function previewInto(box, f) {
  box.innerHTML = '';
  getBlob(f).then(function (blob) {
    if (!blob) {
      box.appendChild(el('p', 'note', 'Soubor už není k dispozici — po zavření prohlížeče zůstává jen jeho název. Nahrajte jej prosím znovu.'));
      return;
    }
    var url = URL.createObjectURL(blob);
    var v;
    if (/^image\//.test(f.type)) {
      v = el('img'); v.src = url; v.alt = f.name;
      v.style.cssText = 'max-width:100%;border:1px solid var(--line);border-radius:4px;display:block';
    } else if (f.type === 'application/pdf') {
      v = el('iframe'); v.src = url; v.title = f.name;
      v.style.cssText = 'width:100%;height:60vh;border:1px solid var(--line);border-radius:4px;background:#fff';
    } else {
      v = el('p', 'note', 'Náhled tohoto typu souboru prohlížeč neumí — použijte tlačítko pro stažení.');
    }
    box.appendChild(v);
  });
}
function openInWindow(f) {
  getBlob(f).then(function (blob) {
    if (!blob) return toast('Soubor se v úložišti nenašel.');
    var url = URL.createObjectURL(blob);
    var w = window.open(url, '_blank', 'noopener');
    if (!w) toast('Prohlížeč nové okno zablokoval — povolte vyskakovací okna, nebo použijte náhled.');
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  });
}
function downloadAttachment(f) {
  getBlob(f).then(function (blob) {
    if (blob) saveBlob(f.name, blob); else toast('Soubor se v úložišti nenašel.');
  });
}
function saveBlob(name, blob) {
  if (DL) {
    DL.save({ filename: name, data: blob }).then(function () { toast('Uloženo.'); }, function () {});
    return;
  }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function removeAttachment(order, f, done) {
  delete MEM[f.fid];
  fdbTx('readwrite', function (st) { st.delete(f.fid); }).catch(function () {}).then(function () {
    order.files = (order.files || []).filter(function (x) { return x.fid !== f.fid; });
    save(); done();
  });
}
/* Blok pro jeden druh přílohy — výběr souboru i přetažení. */
function dropSection(order, kind, title, redraw) {
  var wrap = el('div');
  wrap.appendChild(el('div', 'eyebrow', title));
  var zone = el('div', 'drop-zone', 'Přetáhněte sem soubor nebo <u>vyberte z počítače</u>');
  var inp = el('input'); inp.type = 'file'; inp.multiple = true; inp.hidden = true;
  inp.onchange = function () { attachFiles(order, kind, inp.files, redraw); inp.value = ''; };
  zone.onclick = function () { inp.click(); };
  zone.ondragover = function (e) { e.preventDefault(); zone.classList.add('over'); };
  zone.ondragleave = function () { zone.classList.remove('over'); };
  zone.ondrop = function (e) {
    e.preventDefault(); zone.classList.remove('over');
    attachFiles(order, kind, e.dataTransfer.files, redraw);
  };
  wrap.appendChild(zone); wrap.appendChild(inp);
  var list = el('div', 'files');
  var mine = (order.files || []).filter(function (f) { return f.kind === kind; });
  mine.forEach(function (f) {
    var item = el('div');
    var row = el('div', 'file', '<span class="fn">' + esc(f.name) +
      (f.temp ? ' <span class="fs" style="color:var(--warn)">jen v této relaci</span>' : '') +
      '</span><span class="fs">' + fmtSize(f.size) + '</span>');
    var box = el('div'); box.style.cssText = 'margin:6px 0 2px';
    var op = el('button', '', 'Náhled'); op.title = 'Zobrazit soubor';
    var shown = false;
    op.onclick = function () {
      shown = !shown;
      op.textContent = shown ? 'Skrýt' : 'Náhled';
      if (shown) previewInto(box, f); else box.innerHTML = '';
    };
    var nw = el('button', '', '↗'); nw.title = 'Otevřít v novém okně'; nw.onclick = function () { openInWindow(f); };
    var dw = el('button', '', '⤓'); dw.title = 'Stáhnout'; dw.onclick = function () { downloadAttachment(f); };
    var rm = el('button', 'rm', '✕'); rm.title = 'Odebrat';
    rm.onclick = function () { if (confirm('Odebrat soubor ' + f.name + '?')) removeAttachment(order, f, redraw); };
    row.appendChild(op); row.appendChild(nw); row.appendChild(dw); row.appendChild(rm);
    item.appendChild(row); item.appendChild(box);
    list.appendChild(item);
    if (mine.length === 1 && !shown) { shown = true; op.textContent = 'Skrýt'; previewInto(box, f); }
  });
  wrap.appendChild(list);
  if (STORAGE_OK === false && mine.length) {
    wrap.appendChild(el('p', 'note', 'Tento prohlížeč aplikaci nedovolil ukládat soubory (sdílené webové zobrazení). ' +
      'Přílohy jsou vidět jen do zavření okna — trvale se uloží po instalaci u vás v počítači nebo na serveru.'));
  }
  return wrap;
}

// ---------------------------------------------------------------- pohledy
var VIEWS = [
  { id: 'dash', label: 'Přehled', icon: 'M3 12h4l2-7 3 14 2-7h5' },
  { id: 'orders', label: 'Zakázky', icon: 'M4 5h16M4 12h16M4 19h10' },
  { id: 'gantt', label: 'Plán výroby', icon: 'M4 6h9M4 12h14M4 18h6' },
  { id: 'board', label: 'Kanban', icon: 'M4 4h5v16H4zM11 4h5v10h-5zM18 4h2v7h-2z' },
  { id: 'done', label: 'Hotové zakázky', icon: 'M20 7 9.5 17.5 4 12' },
  { id: 'stats', label: 'Analýza', icon: 'M4 20V9M10 20V4M16 20v-7M22 20H2' },
  { id: 'dict', label: 'Číselníky', icon: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3' }
];

function renderNav() {
  var n = $('#nav'); n.innerHTML = '';
  var openCnt = S.orders.filter(function (o) { return o.open && inYear(o); }).length;
  var odCnt = S.orders.filter(function (o) { return o.overdue && inYear(o); }).length;
  var unbilled = S.orders.filter(function (o) { return inYear(o) && o.status === 'Hotovo' && !o.invoiced; }).length;
  VIEWS.forEach(function (v) {
    var b = el('button', '', '<svg class="ico" viewBox="0 0 24 24"><path d="' + v.icon + '"/></svg>' + v.label +
      (v.id === 'orders' ? '<span class="cnt">' + openCnt + '</span>' : '') +
      (v.id === 'board' && odCnt ? '<span class="cnt" style="color:var(--bad)">' + odCnt + '</span>' : '') +
      (v.id === 'done' && unbilled ? '<span class="cnt" style="color:var(--warn)">' + unbilled + '</span>' : ''));
    b.setAttribute('aria-current', String(S.view === v.id));
    b.onclick = function () { S.view = v.id; render(); };
    n.appendChild(b);
  });
}

function render() {
  pushHist();
  $('#backBtn').disabled = HP <= 0;
  $('#fwdBtn').disabled = HP >= HIST.length - 1;
  markSave();
  renderNav();
  var v = VIEWS.filter(function (x) { return x.id === S.view; })[0];
  $('#viewTitle').textContent = v.label;
  var c = $('#content'); c.innerHTML = '';
  ({ dash: viewDash, orders: viewOrders, gantt: viewGantt, board: viewBoard, done: viewDone, stats: viewStats, dict: viewDict })[S.view](c);
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

  var mKey = S.year + '-' + pad(S.hMonth);
  var inMonth = all.filter(function (o) { return o.hmonth === mKey; });
  var mOb = inMonth.reduce(function (a, o) { return a + hOb(o); }, 0);
  var mSv = inMonth.reduce(function (a, o) { return a + hSv(o); }, 0);
  var missing = inMonth.filter(function (o) { return !o.hours && o.open; }).length;

  root.appendChild(k);

  var hk = el('div', 'kpis');
  hk.appendChild(kpi(fmtH(mOb + mSv), 'Hodiny — ' + MONTHS[S.hMonth - 1],
    inMonth.length + ' zakázek s termínem v měsíci' + (missing ? ' · ' + missing + ' bez odhadu' : ''),
    missing ? 'is-warn' : ''));
  hk.appendChild(kpi(fmtH(mOb), 'Z toho obrobna', pctOf(mOb, mOb + mSv), ''));
  hk.appendChild(kpi(fmtH(mSv), 'Z toho svařovna', pctOf(mSv, mOb + mSv), ''));
  root.appendChild(hk);

  root.appendChild(hoursPanel(all));

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
function pctOf(part, total) { return total ? Math.round(part / total * 100) + ' % měsíce' : 'zatím bez odhadu'; }

/* Kapacita v hodinách po měsících — plánované hodiny podle střediska. */
function hoursPanel(all) {
  var months = [];
  for (var m = 1; m <= 12; m++) {
    var key = S.year + '-' + pad(m);
    var rows = all.filter(function (o) { return o.hmonth === key; });
    months.push({ m: m, ob: rows.reduce(function (a, o) { return a + hOb(o); }, 0),
                  sv: rows.reduce(function (a, o) { return a + hSv(o); }, 0), n: rows.length });
  }
  var max = Math.max.apply(null, months.map(function (x) { return x.ob + x.sv; }).concat([1]));
  var total = months.reduce(function (a, x) { return a + x.ob + x.sv; }, 0);
  var p = panel('Kapacita v hodinách — ' + S.year, total ? fmtH(total) + ' naplánováno' : 'odhady hodin zatím nejsou vyplněné');
  var msel = el('select');
  MONTHS.forEach(function (n, i) { var op = el('option', '', n); op.value = i + 1; if (i + 1 === S.hMonth) op.selected = true; msel.appendChild(op); });
  msel.onchange = function () { S.hMonth = +msel.value; render(); };
  msel.title = 'Měsíc zobrazený v ukazatelích nahoře';
  var head = $('.panel-head', p.panel);
  head.appendChild(el('span', 'spacer'));
  head.appendChild(msel);
  var w = el('div', 'bars');
  months.forEach(function (x) {
    var sum = x.ob + x.sv;
    var r = el('div', 'bar-row');
    r.style.cursor = 'pointer';
    var lb = el('div', 'lb', MONTHS[x.m - 1] + (x.m === S.hMonth ? ' <b>•</b>' : ''));
    var track = el('div', 'bar-track');
    var inner = el('div');
    inner.style.cssText = 'display:flex;height:100%;width:' + (sum / max * 100) + '%';
    var a = el('div'); a.style.cssText = 'background:var(--accent);width:' + (sum ? x.ob / sum * 100 : 0) + '%'; a.title = 'Obrobna ' + fmtH(x.ob);
    var b = el('div'); b.style.cssText = 'background:var(--bad);width:' + (sum ? x.sv / sum * 100 : 0) + '%'; b.title = 'Svařovna ' + fmtH(x.sv);
    inner.appendChild(a); inner.appendChild(b); track.appendChild(inner);
    var vl = el('div', 'vl', sum ? fmtH(sum) : '—');
    r.appendChild(lb); r.appendChild(track); r.appendChild(vl);
    r.onclick = function () { S.hMonth = x.m; render(); };
    w.appendChild(r);
  });
  p.body.appendChild(w);
  var lg = el('div', 'legend'); lg.style.cssText = 'border:0;padding:10px 0 0';
  lg.appendChild(el('span', '', '<i style="background:var(--accent)"></i>Obrobna'));
  lg.appendChild(el('span', '', '<i style="background:var(--bad)"></i>Svařovna'));
  lg.appendChild(el('span', '', 'Hodiny se počítají do měsíce požadovaného termínu.'));
  p.body.appendChild(lg);
  return p.panel;
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
  order: { t: 'Objednávka', cls: 'mono', v: function (o) { return esc(o.order) + fileMark(o, 'order'); } },
  dateOrder: { t: 'Datum obj.', cls: 'mono', v: function (o) { return fmtDate(o.dateOrder); } },
  dateRequired: { t: 'Požad. datum', cls: 'mono', v: function (o) { return o.overdue ? '<span class="late">' + fmtDate(o.dateRequired) + '</span>' : fmtDate(o.dateRequired); } },
  dateDelivered: { t: 'Dodáno', cls: 'mono', v: deliveredCell },
  priority: { t: 'Pri.', v: function (o) { return prioTag(o.priority); } },
  invoice: { t: 'Faktura', cls: 'mono', v: function (o) { return esc(o.invoice) + fileMark(o, 'invoice'); } },
  hours: { t: 'Hodiny', cls: 'mono', v: function (o) {
      if (!o.hours) return '<span style="color:var(--muted)">—</span>';
      var parts = [];
      if (hOb(o)) parts.push('O ' + hOb(o));
      if (hSv(o)) parts.push('S ' + hSv(o));
      return '<b>' + o.hours + '</b> <span class="fs" style="color:var(--muted);font-size:11px">' + parts.join(' · ') + '</span>';
    } },
  rest: { t: 'Zbývá', cls: 'mono', v: function (o) {
      var d = days(TODAY, o.dateRequired); if (d == null) return '';
      return d < 0 ? '<span class="late">' + (-d) + ' dní po</span>' : '<span style="color:' + (d < 7 ? 'var(--warn)' : 'var(--muted)') + '">' + d + ' dní</span>';
    } }
};
function rowClass(o) {
  if (o.overdue) return 'st-po';
  if (o.status === 'Hotovo') return 'st-hotovo';
  if (o.status === 'Výroba') return 'st-vyroba';
  if (o.status === 'Zrušeno') return 'st-zruseno';
  return 'st-ceka';
}
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
  var prevCode = null;
  rows.forEach(function (o) {
    var r = el('tr', rowClass(o) + (prevCode !== null && o.code !== prevCode ? ' newgroup' : ''));
    prevCode = o.code;
    cols.forEach(function (c) { r.appendChild(el('td', COLS[c].cls || '', COLS[c].v(o))); });
    r.onclick = function () { openDrawer(o); };
    tb.appendChild(r);
  });
  t.appendChild(tb); wrap.appendChild(t);
  return wrap;
}

function viewOrders(root) {
  var rows = sorted(activeOrders());
  var doneCnt = S.orders.filter(function (o) { return inYear(o) && isDone(o); }).length;
  $('#viewSub').textContent = rows.length + ' rozpracovaných · ' + doneCnt + ' hotových je ve složce Hotové zakázky';
  var f = el('div', 'filters');
  f.appendChild(sel('Stav', S.f.status, [''].concat(S.dict.statuses.filter(function (x) { return x !== 'Hotovo'; }), ['Zrušeno', 'Ostatní', 'Nezadáno']), function (v) { S.f.status = v; render(); }));
  f.appendChild(sel('Středisko', S.f.center, [''].concat(S.dict.centers), function (v) { S.f.center = v; render(); }));
  f.appendChild(sel('Zodpovídá', S.f.owner, [''].concat(uniq('owner')), function (v) { S.f.owner = v; render(); }));
  f.appendChild(sel('Požaduje', S.f.requester, [''].concat(uniq('requester')), function (v) { S.f.requester = v; render(); }));
  var flags = [['', 'Vše'], ['overdue', 'Po termínu'], ['undelivered', 'Nedodané']];
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

  var cols = S.year >= 2026 ? ['code', 'name', 'qty', 'status', 'center', 'hours', 'owner', 'requester', 'order', 'dateOrder', 'dateRequired', 'priority', 'rest']
    : S.year >= 2021 ? ['code', 'name', 'qty', 'status', 'center', 'requester', 'order', 'dateOrder', 'dateRequired', 'rest']
    : ['code', 'name', 'qty', 'status', 'requester', 'order', 'dateOrder', 'dateRequired', 'rest'];
  var p = panel('Rozpracované zakázky', 'kliknutím na řádek otevřete detail · záhlaví řadí');
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

// ---------------------------------------------------------------- 3) Plán výroby
var PHASES = ['dateOrder', 'planDesign', 'planProd', 'planAssembly', 'planTuning', 'dateRequired'];
var PHASE_NAMES = ['objednávka', 'design', 'výroba', 'montáž', 'ladění', 'termín'];
var ZOOM = { den: 24, tyden: 8, mesic: 3 };

function dayIdx(ds, from) { return Math.round((parseISO(ds) - parseISO(from)) / 864e5); }
function addDays(ds, n) { var d = parseISO(ds); d.setDate(d.getDate() + n); return iso(d); }
function isWeekend(ds) { var w = parseISO(ds).getDay(); return w === 0 || w === 6; }

function viewGantt(root) {
  var y = S.ganttYear;
  var from = y + '-01-01', to = y + '-12-31';
  var total = dayIdx(to, from) + 1;
  var ppd = ZOOM[S.zoom] || ZOOM.den;
  var W = total * ppd;
  $('#viewSub').textContent = 'rok ' + y;

  // ---- ovládání
  var bar = el('div', 'filters');
  var yw = el('div', 'field', '<label>Rok</label>');
  var ys = el('select');
  for (var i = S.years[S.years.length - 1]; i <= S.years[0] + 1; i++) { var o = el('option', '', i); o.value = i; if (i === y) o.selected = true; ys.appendChild(o); }
  ys.onchange = function () { S.ganttYear = +ys.value; render(); }; yw.appendChild(ys); bar.appendChild(yw);

  var zw = el('div', 'field', '<label>Měřítko</label>');
  var zg = el('div'); zg.style.cssText = 'display:flex;gap:4px';
  [['den', 'Dny'], ['tyden', 'Týdny'], ['mesic', 'Měsíce']].forEach(function (z) {
    var b2 = el('button', 'btn', z[1]); b2.setAttribute('aria-pressed', String(S.zoom === z[0]));
    b2.onclick = function () { S.zoom = z[0]; render(); }; zg.appendChild(b2);
  });
  zw.appendChild(zg); bar.appendChild(zw);

  var fw = el('div', 'field', '<label>Zobrazit</label>');
  var fg = el('div'); fg.style.cssText = 'display:flex;gap:4px';
  var ob = el('button', 'btn', 'Jen rozpracované'); ob.setAttribute('aria-pressed', String(S.ganttOnlyOpen));
  ob.onclick = function () { S.ganttOnlyOpen = !S.ganttOnlyOpen; render(); };
  var gb = el('button', 'btn', 'Podle střediska'); gb.setAttribute('aria-pressed', String(S.ganttGroup));
  gb.onclick = function () { S.ganttGroup = !S.ganttGroup; render(); };
  var lb = el('button', 'btn', 'Vytížení'); lb.setAttribute('aria-pressed', String(S.ganttLoad));
  lb.onclick = function () { S.ganttLoad = !S.ganttLoad; render(); };
  fg.appendChild(ob); fg.appendChild(gb); fg.appendChild(lb); fw.appendChild(fg); bar.appendChild(fw);

  bar.appendChild(el('span', 'spacer'));
  var tdy = el('button', 'btn', 'Skočit na dnešek');
  bar.appendChild(tdy);
  root.appendChild(bar);

  // ---- data
  var rows = S.orders.filter(function (o) {
    if (o.year !== y) return false;
    if (S.ganttOnlyOpen && !o.open) return false;
    if (S.q && !matchesQ(o)) return false;
    return !!(o.dateOrder || o.dateRequired);
  });
  rows.sort(function (a, b) {
    return (a.dateRequired || a.dateOrder || '9999').localeCompare(b.dateRequired || b.dateOrder || '9999');
  });

  var groups = [];
  if (S.ganttGroup) {
    var byC = {};
    rows.forEach(function (o) { var c = o.center || 'Bez střediska'; (byC[c] = byC[c] || []).push(o); });
    Object.keys(byC).sort().forEach(function (c) { groups.push({ name: c, rows: byC[c] }); });
  } else groups.push({ name: null, rows: rows });

  var p = panel('Harmonogram výroby ' + y, rows.length + ' zakázek · plán nahoře, skutečnost pod ním');
  p.body.style.padding = '0';

  var wrap = el('div', 'tl-wrap');
  var side = el('div', 'tl-side');
  var scroll = el('div', 'tl-scroll');
  scroll.style.width = W + 'px';

  // ---- záhlaví
  var sh = el('div', 'tl-head');
  sh.appendChild(el('div', 'tl-sidehead', 'Zakázka'));
  side.appendChild(sh);

  var th = el('div', 'tl-head');
  var months = el('div', 'tl-months');
  for (var m = 1; m <= 12; m++) {
    var dim = new Date(y, m, 0).getDate();
    var mo = el('div', 'tl-month', ppd * dim > 46 ? MONTHS[m - 1] : MONTHS[m - 1].slice(0, 3));
    mo.style.width = dim * ppd + 'px'; mo.style.flex = '0 0 auto';
    months.appendChild(mo);
  }
  th.appendChild(months);
  var ticks = el('div', 'tl-ticks');
  if (S.zoom === 'den') {
    for (var d = 0; d < total; d++) {
      var ds = addDays(from, d);
      var t = el('div', 'tl-tick' + (isWeekend(ds) ? ' wk' : '') + (ds === TODAY ? ' tdy' : ''), parseISO(ds).getDate());
      t.style.width = ppd + 'px'; ticks.appendChild(t);
    }
  } else {
    var step = S.zoom === 'tyden' ? 7 : 0;
    if (step) {
      var cur = from;
      while (parseISO(cur).getDay() !== 1 && dayIdx(cur, from) < 7) cur = addDays(cur, 1);
      if (dayIdx(cur, from) > 0) { var pre = el('div', 'tl-tick', ''); pre.style.width = dayIdx(cur, from) * ppd + 'px'; ticks.appendChild(pre); }
      while (dayIdx(cur, from) < total) {
        var wk = el('div', 'tl-tick', ppd * 7 > 26 ? weekNo(cur) : '');
        wk.style.width = Math.min(7, total - dayIdx(cur, from)) * ppd + 'px';
        wk.title = 'týden ' + weekNo(cur) + ' · ' + fmtDate(cur);
        ticks.appendChild(wk); cur = addDays(cur, 7);
      }
    } else {
      for (var m2 = 1; m2 <= 12; m2++) {
        var dim2 = new Date(y, m2, 0).getDate();
        var mt = el('div', 'tl-tick', dim2 + ' dní'); mt.style.width = dim2 * ppd + 'px'; ticks.appendChild(mt);
      }
    }
  }
  th.appendChild(ticks);
  scroll.appendChild(th);

  // ---- mřížka na pozadí
  function backdrop(h) {
    var g = el('div', 'tl-grid');
    if (S.zoom === 'den') {
      for (var d = 0; d < total; d++) {
        var ds = addDays(from, d);
        if (isWeekend(ds)) { var w = el('div', 'tl-wknd'); w.style.cssText += 'left:' + d * ppd + 'px;width:' + ppd + 'px'; g.appendChild(w); }
      }
    }
    var acc = 0;
    for (var m3 = 1; m3 <= 12; m3++) {
      var l = el('div', 'tl-gl mo'); l.style.left = acc * ppd + 'px'; g.appendChild(l);
      acc += new Date(y, m3, 0).getDate();
    }
    return g;
  }

  var body = el('div'); body.style.position = 'relative';
  body.appendChild(backdrop());

  groups.forEach(function (grp) {
    if (grp.name) {
      side.appendChild(el('div', 'tl-group', esc(grp.name) + ' <span style="font-weight:400;color:var(--muted)">' + grp.rows.length + '</span>'));
      body.appendChild(el('div', 'tl-grouprow'));
    }
    grp.rows.forEach(function (o) {
      var lbl = el('div', 'tl-lbl',
        '<span class="c">' + esc(o.code) + '</span><span class="n">' + esc(o.name) + '</span>' +
        (o.hours ? '<span class="h">' + o.hours + ' h</span>' : ''));
      lbl.title = o.name + ' — ' + o.status;
      lbl.onclick = function () { openDrawer(o); };
      var row = el('div', 'tl-row');
      lbl.onmouseenter = row.onmouseenter = function () { lbl.classList.add('hot'); row.classList.add('hot'); };
      lbl.onmouseleave = row.onmouseleave = function () { lbl.classList.remove('hot'); row.classList.remove('hot'); };
      drawBars(row, o, from, total, ppd);
      side.appendChild(lbl);
      body.appendChild(row);
    });
  });
  if (!rows.length) body.appendChild(el('div', 'empty', 'Pro rok ' + y + ' nejsou zakázky s termíny.'));
  scroll.appendChild(body);

  // ---- dnešní čára
  var ti = dayIdx(TODAY, from);
  if (ti >= 0 && ti < total) {
    var line = el('div', 'tl-today');
    line.style.left = (ti * ppd + ppd / 2) + 'px';
    line.title = 'dnes ' + fmtDate(TODAY);
    scroll.appendChild(line);
  }

  // ---- vytížení středisek
  if (S.ganttLoad) scroll.appendChild(loadChart(rows, from, total, ppd, side));

  wrap.appendChild(side); wrap.appendChild(scroll);
  p.body.appendChild(wrap);

  var lg = el('div', 'legend');
  lg.appendChild(el('span', '', '<i style="background:var(--g2)"></i><i style="background:var(--g4)"></i><i style="background:var(--g5)"></i> fáze plánu'));
  lg.appendChild(el('span', '', '<i class="dia" style="background:var(--g7)"></i> požadovaný termín'));
  lg.appendChild(el('span', '', '<i class="dia" style="background:var(--bad)"></i> termín překročen'));
  lg.appendChild(el('span', '', '<i style="background:var(--a-fill);border-color:var(--a-end)"></i> skutečný průběh'));
  lg.appendChild(el('span', '', '<i style="background:var(--a-late)"></i> zpoždění'));
  p.panel.appendChild(lg);
  root.appendChild(p.panel);

  // po vykreslení odscrollovat na dnešek
  function jump() { wrap.scrollLeft = Math.max(0, ti * ppd - wrap.clientWidth / 3); }
  tdy.onclick = jump;
  setTimeout(jump, 0);
}
function weekNo(ds) {
  var d = parseISO(ds); d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 864e5 + 1) / 7);
}

/* Pruh plánu (fáze mezi milníky), kosočtverec termínu a pod nimi skutečný průběh. */
function drawBars(row, o, from, total, ppd) {
  function x(ds) { return Math.max(0, Math.min(total, dayIdx(ds, from))) * ppd; }
  function inRange(ds) { return ds && dayIdx(ds, from) >= -400 && dayIdx(ds, from) <= total + 400; }

  var pts = [], idx = [];
  PHASES.forEach(function (k, i) { if (o[k]) { pts.push(o[k]); idx.push(i); } });
  if (pts.length >= 2) {
    var s0 = pts[0], s1 = pts[pts.length - 1];
    var bar = el('div', 'tl-bar');
    bar.style.left = x(s0) + 'px';
    bar.style.width = Math.max(3, x(addDays(s1, 1)) - x(s0)) + 'px';
    var span = Math.max(1, dayIdx(s1, s0) + 1);
    var nseg = pts.length - 1;
    for (var i = 0; i < nseg; i++) {
      var w = (dayIdx(pts[i + 1], pts[i]) / span) * 100;
      var seg = el('div', 'tl-seg');
      // jediný úsek by v nejsvětlejším odstínu zanikl — použije se výrazná střední zeleň
      var tone = nseg === 1 ? 4 : Math.min(6, 2 + idx[i]);
      seg.style.cssText = 'width:' + w + '%;background:var(--g' + tone + ')';
      seg.title = PHASE_NAMES[idx[i]] + ' → ' + PHASE_NAMES[idx[i + 1]] + ': ' + fmtDate(pts[i]) + ' – ' + fmtDate(pts[i + 1]);
      bar.appendChild(seg);
    }
    bar.title = o.code + ' · ' + o.name + '\nplán ' + fmtDate(s0) + ' – ' + fmtDate(s1) +
      (o.hours ? '\nodhad ' + o.hours + ' h' : '') + '\nstav: ' + o.status;
    bar.onclick = function () { openDrawer(o); };
    row.appendChild(bar);
  }

  if (o.dateRequired && inRange(o.dateRequired)) {
    var dot = el('div', 'tl-dot' + (o.overdue || o.late ? ' miss' : ''));
    dot.style.left = (x(o.dateRequired) + ppd / 2 - 4.5) + 'px';
    dot.title = 'požadovaný termín ' + fmtDate(o.dateRequired) + (o.overdue ? ' — překročen' : '');
    row.appendChild(dot);
  }

  var end = o.dateDelivered || (o.open ? TODAY : null);
  if (o.dateOrder && end && end >= o.dateOrder) {
    var act = el('div', 'tl-act');
    act.style.left = x(o.dateOrder) + 'px';
    act.style.width = Math.max(3, x(addDays(end, 1)) - x(o.dateOrder)) + 'px';
    if (o.dateRequired && end > o.dateRequired) {
      var ov = el('div', 'over');
      var lateFrom = x(addDays(o.dateRequired, 1)) - x(o.dateOrder);
      ov.style.cssText += 'left:' + Math.max(0, lateFrom) + 'px;right:0';
      act.appendChild(ov);
    }
    act.title = 'skutečnost: ' + fmtDate(o.dateOrder) + ' – ' +
      (o.dateDelivered ? 'dodáno ' + fmtDate(o.dateDelivered) : 'probíhá');
    row.appendChild(act);
  }
  if (o.dateDelivered && inRange(o.dateDelivered)) {
    var e = el('div', 'tl-end');
    e.style.left = (x(o.dateDelivered) + ppd / 2 - 4.5) + 'px';
    e.title = 'dodáno ' + fmtDate(o.dateDelivered);
    row.appendChild(e);
  }
}

/* Vytížení — odhadované hodiny rozpočítané na pracovní dny plánovaného okna. */
function loadChart(rows, from, total, ppd, side) {
  var ob = new Array(total).fill(0), sv = new Array(total).fill(0);
  rows.forEach(function (o) {
    var a = o.planProd || o.dateOrder, b = o.dateRequired || o.dateDelivered;
    if (!a || !b || !o.hours || b < a) return;
    var wd = [];
    for (var d = dayIdx(a, from); d <= dayIdx(b, from); d++) {
      if (d < 0 || d >= total) continue;
      if (!isWeekend(addDays(from, d))) wd.push(d);
    }
    if (!wd.length) return;
    var po = hOb(o) / wd.length, ps = hSv(o) / wd.length;
    wd.forEach(function (d) { ob[d] += po; sv[d] += ps; });
  });
  var max = 0;
  for (var i = 0; i < total; i++) max = Math.max(max, ob[i] + sv[i]);

  var box = el('div', 'tl-load');
  var head = el('div', 'tl-loadrow');
  head.style.position = 'relative';
  if (max > 0) {
    for (var d2 = 0; d2 < total; d2++) {
      var sum = ob[d2] + sv[d2];
      if (sum <= 0) continue;
      var b2 = el('div', 'tl-loadbar');
      b2.style.cssText += 'left:' + d2 * ppd + 'px;width:' + Math.max(1, ppd - 1) + 'px;height:' + (sum / max * 66) + 'px';
      var o1 = el('i'); o1.style.cssText = 'background:var(--accent);height:' + (ob[d2] / sum * 100) + '%';
      var s1 = el('i'); s1.style.cssText = 'background:var(--bad);height:' + (sv[d2] / sum * 100) + '%';
      b2.appendChild(o1); b2.appendChild(s1);
      b2.title = fmtDate(addDays(from, d2)) + ' — obrobna ' + fmtH(ob[d2]) + ', svařovna ' + fmtH(sv[d2]);
      head.appendChild(b2);
    }
  }
  box.appendChild(head);
  side.appendChild(el('div', 'tl-load', '<div class="tl-loadrow" style="padding:6px 10px"><span class="eyebrow">Vytížení / den</span>' +
    '<div class="num" style="font-size:11px;color:var(--muted);margin-top:4px">' +
    (max > 0 ? 'špička ' + fmtH(max) : 'bez odhadů hodin') + '</div></div>'));
  return box;
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
        recalc(); save(); render();
        toast(st === 'Hotovo' ? o.code + ' → přesunuto do Hotových zakázek' : o.code + ' → ' + st);
      }
    };
    col.appendChild(stack); board.appendChild(col);
  });
  root.appendChild(board);
}

// ---------------------------------------------------------------- Hotové zakázky
function viewDone(root) {
  var all = doneOrders();
  var unbilled = all.filter(function (o) { return !o.invoiced; });
  var rows = S.doneFilter === 'unbilled' ? unbilled
    : S.doneFilter === 'billed' ? all.filter(function (o) { return o.invoiced; }) : all;
  rows = sorted(rows);
  $('#viewSub').textContent = all.length + ' hotových · ' + unbilled.length + ' čeká na fakturaci';

  var k = el('div', 'kpis');
  k.appendChild(kpi(all.length, 'Hotových zakázek', 'rok ' + S.year, 'is-ok'));
  k.appendChild(kpi(unbilled.length, 'Nevyfakturováno', unbilled.length ? 'doplňte číslo faktury' : 'vše vyfakturováno', unbilled.length ? 'is-warn' : 'is-ok'));
  var h = all.reduce(function (a, o) { return a + o.hours; }, 0);
  k.appendChild(kpi(fmtH(h), 'Odhad hodin celkem', 'součet u hotových zakázek', ''));
  root.appendChild(k);

  var f = el('div', 'filters');
  var g = el('div'); g.style.cssText = 'display:flex;gap:4px';
  [['all', 'Vše'], ['unbilled', 'Nevyfakturované'], ['billed', 'Vyfakturované']].forEach(function (x) {
    var b = el('button', 'btn', x[1]); b.setAttribute('aria-pressed', String(S.doneFilter === x[0]));
    b.onclick = function () { S.doneFilter = x[0]; render(); }; g.appendChild(b);
  });
  var fw = el('div', 'field', '<label>Fakturace</label>'); fw.appendChild(g); f.appendChild(fw);
  f.appendChild(sel('Středisko', S.f.center, [''].concat(S.dict.centers), function (v) { S.f.center = v; render(); }));
  f.appendChild(el('span', 'spacer'));
  var exp = el('button', 'btn', '⤓ Export CSV'); exp.onclick = function () { exportCSV(rows); };
  f.appendChild(exp);
  root.appendChild(f);

  var p = panel('Hotové zakázky', 'fakturu i její sken doplníte přímo zde');
  p.body.style.padding = '0';
  var wrap = el('div', 'tablewrap');
  if (!rows.length) { wrap.appendChild(el('div', 'empty', 'Žádná zakázka neodpovídá filtru.')); }
  else {
    var t = el('table', 'grid');
    var heads = ['Č. zakázky', 'Název zakázky', 'Středisko', 'Hodiny', 'Dodáno', 'Číslo faktury', 'Vyfakturováno', 'Sken'];
    var tr = el('tr'); heads.forEach(function (hd) { tr.appendChild(el('th', '', esc(hd))); });
    var thead = el('thead'); thead.appendChild(tr); t.appendChild(thead);
    var tb = el('tbody');
    rows.forEach(function (o) {
      var r = el('tr', o.invoiced ? 'st-hotovo' : 'unbilled');
      r.appendChild(el('td', 'mono', esc(o.code)));
      var nm = el('td', 'nm', esc(o.name)); nm.style.cursor = 'pointer';
      nm.onclick = function () { openDrawer(o); };
      r.appendChild(nm);
      r.appendChild(el('td', '', centerTag(o.center)));
      r.appendChild(el('td', 'mono', o.hours ? o.hours + ' h' : '—'));
      r.appendChild(el('td', 'mono', o.dateDelivered ? '<span class="' + (o.late ? 'late' : 'ontime') + '">' + fmtDate(o.dateDelivered) + '</span>' : '—'));

      var tdInv = el('td');
      var inv = el('input', 'inv-in'); inv.value = o.invoice || ''; inv.placeholder = 'číslo faktury / datum';
      inv.onchange = function () { o.invoice = inv.value.trim(); if (o.invoice && !o.invoiced) { o.invoiced = true; } save(); render(); };
      tdInv.appendChild(inv); r.appendChild(tdInv);

      var tdCh = el('td');
      var lab = el('label', 'chk');
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = !!o.invoiced;
      cb.onchange = function () { o.invoiced = cb.checked; if (!cb.checked) {} save(); render(); };
      lab.appendChild(cb); lab.appendChild(el('span', '', o.invoiced ? 'ano' : 'ne'));
      tdCh.appendChild(lab); r.appendChild(tdCh);

      var tdF = el('td');
      var nf = (o.files || []).filter(function (x) { return x.kind === 'invoice'; }).length;
      var fb = el('button', 'btn ghost', nf ? '📎 ' + nf : '+ přidat');
      fb.style.cssText = 'padding:2px 8px;font-size:11px';
      fb.onclick = function () { openDrawer(o); };
      tdF.appendChild(fb); r.appendChild(tdF);
      tb.appendChild(r);
    });
    t.appendChild(tb); wrap.appendChild(t);
  }
  p.body.appendChild(wrap);
  root.appendChild(p.panel);
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

  var sp = panel('Uložení na server', 'zatím nepovinné — bez adresy se ukládá jen do prohlížeče');
  var sf = el('div', 'formgrid');
  var uw = el('div', 'field full', '<label>Adresa API</label>');
  var ui = el('input'); ui.type = 'url'; ui.placeholder = 'https://server.firma.cz/api/zakazky'; ui.value = S.server.url;
  ui.onchange = function () { S.server.url = ui.value.trim(); cache(); markSave(); };
  uw.appendChild(ui); sf.appendChild(uw);
  var tw = el('div', 'field full', '<label>Přístupový token (nepovinný)</label>');
  var ti = el('input'); ti.type = 'password'; ti.value = S.server.token;
  ti.onchange = function () { S.server.token = ti.value; cache(); };
  tw.appendChild(ti); sf.appendChild(tw);
  sp.body.appendChild(sf);
  var sb = el('div'); sb.style.cssText = 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap';
  var test = el('button', 'btn', 'Ověřit spojení');
  test.onclick = function () {
    if (!S.server.url) return toast('Nejdřív vyplňte adresu API.');
    var h = {}; if (S.server.token) h.Authorization = 'Bearer ' + S.server.token;
    fetch(S.server.url, { headers: h })
      .then(function (r) { toast(r.ok ? 'Server odpovídá (' + r.status + ').' : 'Server odpověděl ' + r.status + '.'); })
      .catch(function (e) { toast('Spojení se nezdařilo: ' + e.message); });
  };
  var pull = el('button', 'btn', '⤒ Načíst data ze serveru');
  pull.onclick = function () {
    if (!S.server.url) return toast('Nejdřív vyplňte adresu API.');
    if (!confirm('Nahradit současná data daty ze serveru?')) return;
    var h = {}; if (S.server.token) h.Authorization = 'Bearer ' + S.server.token;
    fetch(S.server.url, { headers: h }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.orders) throw new Error('odpověď neobsahuje pole orders');
        S.orders = d.orders; S.dict = d.dict || S.dict;
        S.dirty = false; recalc(); cache(); render(); toast('Data načtena ze serveru.');
      })
      .catch(function (e) { toast('Načtení se nezdařilo: ' + e.message); });
  };
  sb.appendChild(test); sb.appendChild(pull); sp.body.appendChild(sb);
  sp.body.appendChild(el('p', 'note', 'Aplikace očekává dvě operace na stejné adrese: <b>GET</b> vrátí <code>{ "orders": [...], "dict": {...} }</code>, ' +
    '<b>PUT</b> tentýž objekt uloží. Token se posílá v hlavičce <code>Authorization: Bearer …</code>. Přílohy zůstávají zatím v prohlížeči.'));
  root.appendChild(sp.panel);

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
  if (isNew && !o.id) { o.id = 'new-' + Date.now(); S.orders.push(o); }
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
    inp.onchange = function () {
      d[key] = inp.value;
      if (key === 'status') {
        if (inp.value === 'Hotovo' && !d.dateDelivered) d.dateDelivered = TODAY;
        var t2 = S.orders.filter(function (r) { return r.id === o.id; })[0];
        if (t2) Object.keys(d).forEach(function (kk) { if (kk !== 'files') t2[kk] = d[kk]; });
        recalc(); save(); ov.innerHTML = ''; document.removeEventListener('keydown', onKey);
        render(); openDrawer(t2 || d, false);
      }
    };
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
  var hoRow = el('div', 'field full', '<label>Odhad hodin podle střediska</label>');
  var hoBox = el('div'); hoBox.style.cssText = 'display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end';
  function hourInput(key, label) {
    var w = el('div', 'field', '<label style="text-transform:none;letter-spacing:0">' + label + '</label>');
    var i = el('input'); i.type = 'number'; i.min = '0'; i.step = '0.5'; i.placeholder = '0';
    i.value = d[key] == null || d[key] === '' ? '' : d[key];
    i.oninput = function () { d[key] = i.value === '' ? '' : +i.value; sumH(); };
    w.appendChild(i); return w;
  }
  var totBox = el('div', 'field', '<label style="text-transform:none;letter-spacing:0">Celkem</label>');
  var totVal = el('div', 'num'); totVal.style.cssText = 'padding:7px 10px;font-weight:600;white-space:nowrap';
  totBox.appendChild(totVal);
  function sumH() { totVal.textContent = fmtH((+d.hoursObrobna || 0) + (+d.hoursSvarovna || 0)); }
  hoBox.appendChild(hourInput('hoursObrobna', 'Obrobna'));
  hoBox.appendChild(hourInput('hoursSvarovna', 'Svařovna'));
  hoBox.appendChild(totBox);
  hoRow.appendChild(hoBox);
  hoRow.appendChild(el('p', 'note', 'Hodiny se počítají do měsíce požadovaného termínu.'));
  form.appendChild(hoRow);
  fld('dateOrder', 'Datum objednávky', 'date');
  fld('dateRequired', 'Požadovaný termín', 'date');
  fld('planDesign', 'Plán — design', 'date');
  fld('planProd', 'Plán — výroba', 'date');
  fld('planAssembly', 'Plán — montáž', 'date');
  fld('planTuning', 'Plán — ladění', 'date');
  fld('dateDelivered', 'Datum dodání', 'date');
  if (!isNew && d.status === 'Hotovo') {
    fld('invoice', 'Číslo faktury', 'text', null, true);
    var bw = el('div', 'field full');
    var blab = el('label', 'chk');
    var bcb = el('input'); bcb.type = 'checkbox'; bcb.checked = !!d.invoiced;
    bcb.onchange = function () { d.invoiced = bcb.checked; };
    blab.appendChild(bcb); blab.appendChild(el('span', '', 'Vyfakturováno'));
    bw.appendChild(blab); form.appendChild(bw);
  }
  body.appendChild(form);

  // přílohy se ukládají rovnou k zakázce, ne až s formulářem
  var live = S.orders.filter(function (r) { return r.id === o.id; })[0] || o;
  var att = el('div');
  att.style.cssText = 'display:flex;flex-direction:column;gap:14px';
  function redrawAtt() {
    att.innerHTML = '';
    att.appendChild(dropSection(live, 'order', 'Objednávka — přiložené soubory', redrawAtt));
    if (!isNew && d.status === 'Hotovo') att.appendChild(dropSection(live, 'invoice', 'Faktura — přiložené soubory', redrawAtt));
  }
  redrawAtt();
  body.appendChild(att);

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
    if (isNew) d.year = +(d.dateOrder || TODAY).slice(0, 4);
    var t = S.orders.filter(function (r) { return r.id === o.id; })[0];
    if (t) Object.keys(d).forEach(function (k) { if (k !== 'files') t[k] = d[k]; });
    recalc(); save(); close(true); render(); toast(isNew ? 'Zakázka založena.' : 'Změny uloženy.');
  };
  var del = el('button', 'btn danger', 'Smazat');
  del.onclick = function () {
    if (!confirm('Smazat zakázku ' + (o.code || '') + '?')) return;
    S.orders = S.orders.filter(function (r) { return r.id !== o.id; });
    recalc(); save(); close(true); render(); toast('Zakázka smazána.');
  };
  ft.appendChild(ok); ft.appendChild(el('span', 'spacer'));
  if (!isNew) ft.appendChild(del);
  dr.appendChild(ft);

  scrim.appendChild(dr);
  scrim.onclick = function (e) { if (e.target === scrim) close(); };
  ov.appendChild(scrim);
  document.addEventListener('keydown', onKey);
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close(saved) {
    if (isNew && !saved) S.orders = S.orders.filter(function (r) { return r.id !== o.id; });
    ov.innerHTML = ''; document.removeEventListener('keydown', onKey);
  }
}

function newOrder() {
  var y = S.year, n = 1;
  S.orders.filter(function (o) { return o.year === y; }).forEach(function (o) {
    var m = /(\d+)\s*\/\s*(\d+)/.exec(o.code || ''); if (m && +m[1] >= n) n = +m[1] + 1;
  });
  var code = 'OS-' + pad(n).padStart(3, '0') + '/' + String(y).slice(2);
  openDrawer({ id: '', name: '', code: code, status: 'Design', center: 'Obrobna', dateOrder: TODAY, year: y, files: [] }, true);
}

// ---------------------------------------------------------------- export
var CSV_COLS = ['code', 'name', 'qty', 'status', 'center', 'owner', 'requester', 'order', 'dateOrder',
  'planDesign', 'planProd', 'planAssembly', 'planTuning', 'dateRequired', 'dateDelivered', 'priority', 'hoursObrobna', 'hoursSvarovna', 'invoice', 'invoiced', 'year'];
var CSV_HEAD = ['Č.ZAKÁZKY', 'NÁZEV ZAKÁZKY', 'MNOŽSTVÍ', 'STATUS', 'STŘEDISKO', 'ZODPOVÍDÁ', 'POŽADUJE', 'OBJEDNÁVKA', 'DATUM OBJ.',
  'PLÁN DESIGN', 'PLÁN VÝROBA', 'PLÁN MONTÁŽ', 'PLÁN LADĚNÍ', 'POŽAD. DATUM', 'DATUM DODÁNÍ', 'PRIORITA', 'HODINY OBROBNA', 'HODINY SVAŘOVNA', 'FAKTURA', 'VYFAKTUROVÁNO', 'ROK'];
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
  b.appendChild(el('p', 'note', 'Soubor uložte tlačítkem níže, nebo text zkopírujte a vložte do Excelu — oddělovačem je středník.'));
  var ta = el('textarea'); ta.value = text; ta.style.cssText = 'width:100%;height:50vh;font-family:"IBM Plex Mono",monospace;font-size:12px';
  b.appendChild(ta); dr.appendChild(b);
  var ft = el('footer');
  var dl = el('button', 'btn primary', '\u2913 Stáhnout ' + name);
  dl.onclick = function () { saveFile(name, text, mime); };
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
$('#backBtn').onclick = function () { goHist(-1); };
$('#fwdBtn').onclick = function () { goHist(1); };
$('#saveBtn').onclick = saveNow;
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveNow(); return; }
  if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); goHist(-1); }
  if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); goHist(1); }
});
window.addEventListener('beforeunload', function (e) {
  if (S.dirty && S.server.url) { e.preventDefault(); e.returnValue = ''; }
});
$('#themeBtn').onclick = function () {
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : cur === 'light' ? '' : 'dark';
  if (next) document.documentElement.setAttribute('data-theme', next);
  else document.documentElement.removeAttribute('data-theme');
};
render();
})();
