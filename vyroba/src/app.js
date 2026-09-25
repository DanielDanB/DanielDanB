/* Přehled zakázek — provozní evidence zakázek (Obrobna / Svařovna)
   Datový model i logika barev vychází z původního sešitu PREHLED_ZAKAZEK_NOVY.xlsx */
(function () {
'use strict';

// ---------------------------------------------------------------- číselníky
var DEFAULT_DICT = {
  statuses: ['Design', 'Schvalování', 'Příprava výroby', 'Výroba', 'Hotovo'],
  centers: ['Obrobna', 'Svařovna', 'Správa'],
  owners: ['Holub M.', 'Škvor M.', 'Bartoň D.', 'Bartoň V.', 'Bachman J.'],
  // předčíslí = zkratka zákazníka; význam si doplňuje obsluha v číselnících
  prefixes: [{ code: 'DE' }, { code: 'BU' }, { code: 'BE' }, { code: 'TI' }, { code: 'MG' }, { code: 'MT' },
             { code: 'NP' }, { code: 'KH' }, { code: 'CD' }, { code: 'PK' }, { code: 'SO' }, { code: 'OS' },
             { code: 'PE' }, { code: 'WE' }, { code: 'GA' }, { code: 'MA' }, { code: 'HA' }],
  priorities: [1, 2, 3, 4],
  customers: [],
  company: { name: '', ico: '', dic: '', street: '', city: '', zip: '', phone: '', email: '' }
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
  planTab: 'board', boardZoom: 'den', boardStart: null, pbFocus: null,
  doneFilter: 'all',
  server: { url: '', token: '', ares: '' }, rev: null, polling: false
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
      migrateDict(); recalc(); return;
    } catch (e) {}
  }
  S.orders = seed.slice(); S.dict = JSON.parse(JSON.stringify(DEFAULT_DICT)); migrateDict(); recalc();
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
  pushToServer(false);
}

function pushToServer(force) {
  var btn = $('#saveBtn'); btn.disabled = true; btn.textContent = 'Ukládám…';
  var url = S.server.url + (force ? (S.server.url.indexOf('?') < 0 ? '?' : '&') + 'prepsat=1' : '');
  fetch(url, {
    method: 'PUT',
    headers: authHead({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ orders: S.orders, dict: S.dict, rev: S.rev })
  })
    .then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; });
    })
    .then(function (x) {
      if (x.r.status === 409) return conflict(x.d);
      if (!x.r.ok) throw new Error(x.d.chyba || ('server odpověděl ' + x.r.status));
      S.rev = x.d.rev;
      S.dirty = false; S.savedAt = new Date(); markSave();
      toast('Uloženo na server.');
    })
    .catch(function (e) {
      markSave();
      toast('Uložení na server se nezdařilo: ' + e.message + ' — data zůstala v prohlížeči.');
    })
    .then(function () { btn.disabled = false; markSave(); });
}

/* Někdo uložil dřív než my. Rozhodnutí patří obsluze, ne aplikaci. */
function conflict() {
  markSave();
  modal({
    title: 'Mezitím ukládal někdo jiný',
    text: 'Od chvíle, kdy jste data načetl, uložil na server změny další počítač. ' +
          'Můžete převzít jeho verzi — vaše neuložené úpravy se ztratí — nebo ji svou verzí přepsat.',
    ok: 'Převzít jejich verzi',
    cancel: 'Přepsat mou verzí'
  }).then(function (v) {
    if (v === true) pullFromServer(true);
    else if (v === null) pushToServer(true);
  });
}

function pullFromServer(quiet) {
  return fetch(S.server.url, { headers: authHead() })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !Array.isArray(d.orders)) return false;
      S.orders = d.orders;
      if (d.dict) S.dict = d.dict;
      S.rev = d.rev == null ? null : d.rev;
      S.dirty = false;
      migrateDict(); recalc(); cache(); render();
      if (!quiet) toast('Data načtena ze serveru.');
      else toast('Změny od kolegy načteny.');
      return true;
    }, function () { return false; });
}

/* Otevřené prohlížeče se každých pár vteřin ptají jen na číslo verze.
   Změnu převezmou samy, pokud zrovna nemají rozdělanou práci. */
function startPolling() {
  if (S.polling || !S.server.url) return;
  S.polling = true;
  setInterval(function () {
    if (!S.server.url || document.hidden) return;
    if ($('#overlay').firstChild) return;          // otevřené okno nerušíme
    fetch(apiBase() + '/zakazky/verze', { headers: authHead() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || d.rev == null || d.rev === S.rev) return;
        if (S.dirty) { markSave(); return; }        // vlastní změny nepřepisujeme
        pullFromServer(true);
      })
      .catch(function () {});
  }, 15000);
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

/* Okno, do kterého se rozpočítávají odhadované hodiny: od plánu začátku výroby
   (není-li, od objednávky) do potvrzeného termínu dodání. Zakázka, která se
   v termínu neuzavře, si okno den po dni prodlužuje — dokud není skutečně
   dodaná, roste až do dneška. */
function hoursWindow(o) {
  var start = o.planProd || o.dateOrder;
  if (!start) return null;
  var planEnd = o.dateRequired || null;
  var actualEnd = o.dateDelivered || (o.open ? TODAY : null);
  var end = planEnd;
  if (planEnd) {
    if (actualEnd && actualEnd > planEnd) end = actualEnd;   // termín uplynul, hodiny se přelévají dál
  } else {
    end = actualEnd;
  }
  if (!end || end < start) return null;
  return { start: start, end: end };
}
/* Pracovní dny toho okna jako pole dat RRRR-MM-DD; s pojistkou proti
   nekonečné smyčce, kdyby v datech chybělo něco, co by okno neúměrně natáhlo. */
function hoursWorkDays(o) {
  var w = hoursWindow(o);
  if (!w) return [];
  var days = [], d = w.start, guard = 0;
  while (d <= w.end && guard < 1100) {
    if (!isWeekend(d)) days.push(d);
    d = addDays(d, 1);
    guard++;
  }
  return days;
}
/* Odhad hodin všech zakázek rozpočítaný na pracovní dny a sečtený po měsících
   (klíč RRRR-MM) — pro měsíční ukazatele a graf kapacity na přehledu. */
function hoursByMonth(orders) {
  var map = {};
  orders.forEach(function (o) {
    if (!o.hours) return;
    var days = hoursWorkDays(o);
    if (!days.length) return;
    var po = hOb(o) / days.length, ps = hSv(o) / days.length;
    days.forEach(function (ds) {
      var key = ds.slice(0, 7);
      var m = map[key] || (map[key] = { ob: 0, sv: 0, orders: {} });
      m.ob += po; m.sv += ps; m.orders[o.id] = true;
    });
  });
  return map;
}

/* Starší uložená data mohla mít předčíslí jako pole řetězců. */
function migrateDict() {
  var d = S.dict;
  d.prefixes = (d.prefixes || []).map(function (p) { return typeof p === 'string' ? { code: p } : p; });
  d.customers = d.customers || [];
  d.company = d.company || { name: '', ico: '', dic: '', street: '', city: '', zip: '', phone: '', email: '' };
  d.shift = d.shift || { start: 6, hours: 8 };
  d.fund = d.fund || { 'Obrobna': '', 'Svařovna': '' };
  d.resources = d.resources || { 'Obrobna': [], 'Svařovna': [] };
  sortCustomers();
}
function sortCustomers() {
  S.dict.customers.sort(function (a, b) { return (a.name || '').localeCompare(b.name || '', 'cs'); });
}
function pfxCodes() { return S.dict.prefixes.map(function (p) { return p.code; }); }
function pfxLabel(code) {
  var p = S.dict.prefixes.filter(function (x) { return x.code === code; })[0];
  return p && p.label ? p.label : '';
}
function customerByIco(ico) {
  return S.dict.customers.filter(function (c) { return c.ico === ico; })[0] || null;
}

/* Když ARES selže, nabídneme rovnou obě cesty ven — ruční zadání i nastavení mezikroku. */
function aresFailed(err, ico, onAdded) {
  var offerHop = !!err.allFailed && !err.blocked && !S.server.ares;
  modal({
    title: err.notFound ? 'IČO nenalezeno' : 'ARES neodpověděl',
    text: err.message + (offerHop ? ' Zkuste to za chvíli znovu, nebo firmu zadejte ručně. Trvá-li to, jde nastavit záložní mezikrok na vašem serveru.' : ''),
    ok: offerHop ? 'Nastavit záložní mezikrok' : 'Zavřít',
    cancel: 'Zadat ručně'
  }).then(function (v) {
    if (v === true && offerHop) {
      S.view = 'dict'; render();
      setTimeout(function () { var f = $('#aresField'); if (f) { f.focus(); f.scrollIntoView({ block: 'center' }); } }, 60);
    } else if (v === null) {
      editCustomer({ ico: String(ico || '').replace(/\D/g, '') }, true, onAdded);
    }
  });
}

/* ARES — registr ekonomických subjektů.
   Zkouší se postupně tři cesty, první úspěšná vyhrává:
     1. mezikrok na vlastním serveru, je-li nastavený (nejspolehlivější),
     2. ARES napřímo z prohlížeče,
     3. veřejný mezikrok r.jina.ai, který doplní hlavičky CORS.
   Třetí cesta posílá IČO přes cizí službu; jde o veřejný údaj z registru. */
var ARES_PATH = 'ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/';


/* ARES vrací adresu v několika podobách — bereme, co je k dispozici. */
function aresMap(d, ico) {
  if (d && d.ekonomickeSubjekty && d.ekonomickeSubjekty.length) d = d.ekonomickeSubjekty[0];
  d = d || {};
  var s = d.sidlo || d.adresa || d.adresaDorucovaci || {};
  var ulice = s.nazevUlice || s.nazevCastiObce || '';
  var cisla = [s.cisloDomovni, s.cisloOrientacni].filter(function (x) { return x; }).join('/');
  var psc = s.psc == null ? '' : String(s.psc).replace(/^(\d{3})(\d{2})$/, '$1 $2');
  var street = (ulice + ' ' + cisla).trim();
  if (!street && s.textovaAdresa) street = s.textovaAdresa;
  return {
    ico: d.ico || ico,
    dic: d.dic || '',
    name: d.obchodniJmeno || d.obchodniJmenoZkracene || d.nazev || '',
    street: street,
    city: s.nazevObce || '',
    zip: psc,
    country: s.nazevStatu || 'Česká republika'
  };
}

/* Časový limit, který se nedotýká samotného dotazu — jen po vypršení
   přestaneme čekat. Žádné AbortController, aby se volání chovalo úplně
   stejně jako v aplikaci, ze které je tenhle postup převzatý. */
function withTimeout(promise, ms) {
  return new Promise(function (res, rej) {
    var done = false;
    var t = setTimeout(function () {
      if (!done) { done = true; rej(new Error('zdroj neodpověděl do ' + Math.round(ms / 1000) + ' s')); }
    }, ms);
    promise.then(function (v) { if (!done) { done = true; clearTimeout(t); res(v); } },
                 function (e) { if (!done) { done = true; clearTimeout(t); rej(e); } });
  });
}

/* Je stránka ve vloženém zobrazení? Tam bývají síťové dotazy zakázané
   a žádné nastavení v aplikaci to nespraví. */
function embedded() {
  try { return window.top !== window.self || !!window.claude; } catch (e) { return true; }
}

/* Načtení firmy z ARES — stejný postup jako v aplikaci SONAD:
   nejdřív registr napřímo, a když to selže z jakéhokoli důvodu,
   přes r.jina.ai, které doplní chybějící hlavičky CORS a odpověď
   občas zabalí do markdownového bloku. */
function aresLookup(icoRaw) {
  var ico = String(icoRaw || '').replace(/\D/g, '');
  if (ico.length !== 8) return Promise.reject(new Error('IČO musí mít 8 číslic.'));

  var direct = 'https://' + ARES_PATH + ico;
  var viaJina = 'https://r.jina.ai/http://' + ARES_PATH + ico;
  var notes = [];

  function tryDirect() {
    return withTimeout(fetch(direct, { headers: { Accept: 'application/json' } }), 9000)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { return { data: d, source: 'ARES přímo' }; });
  }
  function tryJina() {
    return withTimeout(fetch(viaJina), 12000)
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var t = String(txt).replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
        var d;
        try { d = JSON.parse(t); }
        catch (e) {
          var i = t.indexOf('{'), j = t.lastIndexOf('}');
          if (i < 0 || j <= i) throw new Error('odpověď nebyla ve formátu JSON');
          d = JSON.parse(t.slice(i, j + 1));
        }
        return { data: d, source: 'veřejný mezikrok' };
      });
  }
  function tryServer() {
    var url = S.server.ares.replace(/\/+$/, '') + '/' + ico;
    return withTimeout(fetch(url, { headers: { Accept: 'application/json' } }), 9000)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { return { data: d, source: 'váš server' }; });
  }

  function finish(res) {
    var c = aresMap(res.data, ico);
    if (!c.name) throw new Error('odpověď neobsahovala název firmy');
    c.source = res.source;
    return c;
  }
  function note(label, e) { notes.push(label + ' (' + (e && e.message ? e.message : 'chyba') + ')'); }

  return tryDirect().then(finish, function (e1) {
    note('ARES přímo', e1);
    return tryJina().then(finish, function (e2) {
      note('veřejný mezikrok', e2);
      if (!S.server.ares) throw aresError(notes, ico);
      return tryServer().then(finish, function (e3) {
        note('váš server', e3);
        throw aresError(notes, ico);
      });
    });
  });
}
function aresError(notes, ico) {
  var all404 = notes.length && notes.every(function (n) { return /HTTP 404/.test(n); });
  var e;
  if (all404) {
    e = new Error('IČO ' + ico + ' nebylo v ARES nalezeno.');
    e.notFound = true;
    return e;
  }
  e = new Error(embedded()
    ? 'Toto sdílené zobrazení nepouští stránku na internet, takže ARES odsud volat nelze. Otevřete si aplikaci jako soubor u sebe v počítači — tam načítání funguje.'
    : 'ARES se nepodařilo zavolat. Zkoušeno: ' + notes.join(', ') + '.');
  e.allFailed = true;
  e.blocked = embedded();
  return e;
}

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
    z: S.zoom, gg: S.ganttGroup, gl: S.ganttLoad, hm: S.hMonth, df: S.doneFilter,
    pt: S.planTab, bz: S.boardZoom, bs: S.boardStart });
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
  S.planTab = st.pt || 'board'; S.boardZoom = st.bz || 'den'; S.boardStart = st.bs || null; pbScrollMemo = null;
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
/* Server obsluhuje data i přílohy na stejném základu:
   .../api/zakazky  ->  .../api/soubory */
function apiBase() {
  if (!S.server.url) return '';
  return S.server.url.replace(/\/+$/, '').replace(/\/[^\/]*$/, '');
}
function fileUrl(fid) { return apiBase() + '/soubory' + (fid ? '/' + fid : ''); }
function authHead(extra) {
  var h = extra || {};
  if (S.server.token) h.Authorization = 'Bearer ' + S.server.token;
  return h;
}

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
function fileMark(o, kind, icon) {
  var n = (o.files || []).filter(function (f) { return f.kind === kind; }).length;
  return n ? ' <span class="clip" title="' + n + ' příloha/y">' + (icon || '📎') + (n > 1 ? n : '') + '</span>' : '';
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

    if (S.server.url) {
      // na serveru je příloha dostupná i kolegům
      fetch(fileUrl('') + '?name=' + encodeURIComponent(f.name) + '&type=' + encodeURIComponent(f.type || ''),
        { method: 'POST', headers: authHead(), body: f })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (rec) {
          MEM[rec.fid] = MEM[fid]; delete MEM[fid];
          meta.fid = rec.fid; meta.remote = true; delete meta.temp;
          save(); done();
        })
        .catch(function (e) {
          meta.temp = true; STORAGE_OK = false;
          toast('Přílohu se nepodařilo uložit na server: ' + e.message);
          done();
        });
      return;
    }
    fdbTx('readwrite', function (st) { st.put({ fid: fid, blob: f, name: f.name, type: f.type }); })
      .then(function () { STORAGE_OK = true; })
      .catch(function () { STORAGE_OK = false; meta.temp = true; done(); });
  });
  save(); done();
  toast(queue.length === 1 ? 'Soubor ' + queue[0].name + ' připojen.' : queue.length + ' souborů připojeno.');
}
function getBlob(f) {
  if (MEM[f.fid]) return Promise.resolve(MEM[f.fid]);
  if (f.remote && S.server.url) {
    return fetch(fileUrl(f.fid), { headers: authHead() })
      .then(function (r) { return r.ok ? r.blob() : null; }, function () { return null; });
  }
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
  function drop() {
    order.files = (order.files || []).filter(function (x) { return x.fid !== f.fid; });
    save(); done();
  }
  if (f.remote && S.server.url) {
    fetch(fileUrl(f.fid), { method: 'DELETE', headers: authHead() }).catch(function () {}).then(drop);
    return;
  }
  fdbTx('readwrite', function (st) { st.delete(f.fid); }).catch(function () {}).then(drop);
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
    rm.onclick = function () {
      askConfirm('Odebrat soubor', f.name + ' bude smazán.', 'Odebrat').then(function (y) {
        if (y) removeAttachment(order, f, redraw);
      });
    };
    row.appendChild(op); row.appendChild(nw); row.appendChild(dw); row.appendChild(rm);
    item.appendChild(row); item.appendChild(box);
    list.appendChild(item);
    if (mine.length === 1 && !shown) { shown = true; op.textContent = 'Skrýt'; previewInto(box, f); }
  });
  wrap.appendChild(list);
  if (STORAGE_OK === false && mine.length && !S.server.url) {
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
  ({ dash: viewDash, orders: viewOrders, gantt: viewPlan, board: viewBoard, done: viewDone, stats: viewStats, dict: viewDict })[S.view](c);
  $('#srcInfo').textContent = S.orders.length.toLocaleString('cs') + ' zakázek · ' +
    S.years[S.years.length - 1] + '–' + S.years[0] +
    (S.server.url ? ' · sdíleno se serverem' : '') + (S.dirty ? ' · upraveno' : '');
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

  var byMonth = hoursByMonth(all);
  var mKey = S.year + '-' + pad(S.hMonth);
  var bucket = byMonth[mKey] || { ob: 0, sv: 0, orders: {} };
  var mOb = bucket.ob, mSv = bucket.sv;
  var atWork = Object.keys(bucket.orders).length;
  // připomínka zvlášť: kolik otevřených zakázek má v tomto měsíci termín, ale bez odhadu hodin
  var missing = all.filter(function (o) { return o.open && o.hmonth === mKey && !o.hours; }).length;

  root.appendChild(k);

  var hk = el('div', 'kpis');
  hk.appendChild(kpi(fmtH(mOb + mSv), 'Hodiny — ' + MONTHS[S.hMonth - 1],
    atWork + ' zakázek s prací v měsíci' + (missing ? ' · ' + missing + ' bez odhadu' : ''),
    missing ? 'is-warn' : ''));
  hk.appendChild(kpi(fmtH(mOb), 'Z toho obrobna', pctOf(mOb, mOb + mSv), ''));
  hk.appendChild(kpi(fmtH(mSv), 'Z toho svařovna', pctOf(mSv, mOb + mSv), ''));
  root.appendChild(hk);

  root.appendChild(hoursPanel(all, byMonth));

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
  p3.body.appendChild(table(crit, ['code', 'name', 'center', 'customer', 'owner', 'status', 'dateRequired', 'rest']));
  root.appendChild(p3.panel);
}
function pctOf(part, total) { return total ? Math.round(part / total * 100) + ' % měsíce' : 'zatím bez odhadu'; }

/* Kapacita v hodinách po měsících — plánované hodiny podle střediska. */
function hoursPanel(all, byMonth) {
  byMonth = byMonth || hoursByMonth(all);
  var months = [];
  for (var m = 1; m <= 12; m++) {
    var key = S.year + '-' + pad(m);
    var b = byMonth[key] || { ob: 0, sv: 0, orders: {} };
    months.push({ m: m, ob: b.ob, sv: b.sv, n: Object.keys(b.orders).length });
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
  name: { t: 'Název zakázky', cls: 'nm', v: function (o) { return esc(o.name) + fileMark(o, 'drawing', '📐'); } },
  qty: { t: 'Množ.', cls: 'mono', v: function (o) { return esc(o.qty); } },
  status: { t: 'Stav', v: function (o) { return statusPill(o.status); } },
  center: { t: 'Středisko', v: function (o) { return centerTag(o.center); } },
  owner: { t: 'Zodpovídá', v: function (o) { return esc(o.owner); } },
  requester: { t: 'Požaduje', v: function (o) { return esc(o.requester); } },
  order: { t: 'Objednávka', cls: 'mono', v: function (o) { return esc(o.order) + fileMark(o, 'order'); } },
  customer: { t: 'Zákazník', v: function (o) { return o.customerName ? esc(o.customerName) : '<span style="color:var(--muted)">—</span>'; } },
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

  var cols = S.year >= 2026 ? ['code', 'name', 'qty', 'status', 'center', 'customer', 'hours', 'owner', 'requester', 'order', 'dateOrder', 'dateRequired', 'priority', 'rest']
    : S.year >= 2021 ? ['code', 'name', 'qty', 'status', 'center', 'customer', 'requester', 'order', 'dateOrder', 'dateRequired', 'rest']
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
    if (!o.hours) return;
    var days = hoursWorkDays(o);        // od plánu výroby po (prodloužený) termín dodání
    if (!days.length) return;
    var po = hOb(o) / days.length, ps = hSv(o) / days.length;
    days.forEach(function (ds) {
      var d = dayIdx(ds, from);
      if (d < 0 || d >= total) return;
      ob[d] += po; sv[d] += ps;
    });
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

// ---------------------------------------------------------------- 3b) Kapacitní plán
/* Zakázka se do výroby plánuje jako buňky (sloty) na ose pracovních hodin.
   Jeden slot = { id, center, start: 'RRRR-MM-DD', hour: 0..délka směny-1, hours }.
   Osa vynechává víkendy; den má tolik hodin, kolik je nastaveno ve směně.
   Buňky se smějí překrývat — v pásu se pak srovnají pod sebe a denní pruh
   vytížení ukáže přetížení. */
var LANES = [
  { c: 'Obrobna', key: 'hoursObrobna', col: 'var(--accent)', soft: 'var(--accent-soft)' },
  { c: 'Svařovna', key: 'hoursSvarovna', col: 'var(--bad)', soft: 'var(--bad-soft)' }
];
var PB_ZOOM = { hod: 18, den: 7, tyd: 3 };      // px na pracovní hodinu
var PB_DAYS = 60;                                  // pracovních dní na tabuli (12 týdnů)
var PB_ROW = 50, PB_LOAD = 20, PB_LBL = 158;
var WD_EPOCH = '2000-01-03';                       // pondělí
var DOW = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
var pbScrollMemo = null;

function matchesQ(o) {
  var q = norm(S.q);
  return norm([o.name, o.code, o.order, o.requester, o.owner, o.customerName].join(' ')).indexOf(q) >= 0;
}
function shiftH() { return Math.max(1, +(S.dict.shift && S.dict.shift.hours) || 8); }
function shiftStart() { var v = S.dict.shift && S.dict.shift.start; return v == null ? 6 : +v; }
function clock(h) {                                 // hodina od začátku směny -> '6:00'
  var t = shiftStart() + h, hh = Math.floor(t), mm = Math.round((t - hh) * 60);
  return hh + ':' + pad(mm);
}
/* pořadí pracovního dne od epochy; sobota i neděle padnou na následující pondělí */
function wdIndex(ds) {
  var d = dayIdx(ds, WD_EPOCH), w = Math.floor(d / 7), r = d - w * 7;
  return w * 5 + Math.min(r, 5);
}
function wdDate(i) { var w = Math.floor(i / 5); return addDays(WD_EPOCH, w * 7 + (i - w * 5)); }
function mondayOf(ds) { return addDays(ds, -((parseISO(ds).getDay() + 6) % 7)); }
function fmtDay(ds) { var d = parseISO(ds); return DOW[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; }

function slotA(sl) { return wdIndex(sl.start) * shiftH() + Math.min(+sl.hour || 0, shiftH() - 1); }
function setSlotA(sl, A) { var H = shiftH(), i = Math.floor(A / H); sl.start = wdDate(i); sl.hour = A - i * H; }
/* Fond hodin: kolik práce středisko udělá za měsíc. Denní kapacita = fond ÷ počet
   pracovních dnů v daném měsíci. Nevyplněný fond = jedna směna denně.
   Poloha na ose se měří v hodinách směny; práce na buňce běží rychlostí
   denní kapacita ÷ délka směny — větší fond, kratší buňka. */
var WD_MONTH = {};
function workdaysIn(ym) {
  if (WD_MONTH[ym]) return WD_MONTH[ym];
  var y = +ym.slice(0, 4), m = +ym.slice(5, 7), last = new Date(y, m, 0).getDate(), n = 0;
  for (var d = 1; d <= last; d++) { var w = new Date(y, m - 1, d).getDay(); if (w !== 0 && w !== 6) n++; }
  return (WD_MONTH[ym] = n);
}
/* Stroje a pracovníci: každé středisko může mít vlastní seznam s měsíčním fondem.
   Buňka přiřazená stroji/pracovníkovi běží jeho tempem; nepřiřazená buňka počítá
   s kapacitou celého střediska (součet všech jeho strojů a pracovníků). */
function resList(c) { return (S.dict.resources && S.dict.resources[c]) || []; }
function resOf(c, id) { return id ? resList(c).filter(function (r) { return r.id === id; })[0] || null : null; }
function slotRes(sl) { var r = resOf(sl.center, sl.res); return r ? r.id : ''; }
function resCap(r, ym) { var f = +r.fund; return f > 0 ? f / workdaysIn(ym) : shiftH(); }
function resFundSum(c) { return resList(c).reduce(function (a, r) { return a + (+r.fund > 0 ? +r.fund : 0); }, 0); }
function fundOf(c) {                                             // fond střediska za měsíc (0 = nevyplněno)
  if (resList(c).length) return resFundSum(c);
  var v = +(S.dict.fund && S.dict.fund[c]); return v > 0 ? v : 0;
}
function dayCap(c, ds, rid) {                                    // kolik hodin práce se udělá za den
  var ym = ds.slice(0, 7), rs = resList(c), r = resOf(c, rid);
  if (r) return resCap(r, ym);
  if (rs.length) return rs.reduce(function (a, x) { return a + resCap(x, ym); }, 0);
  var f = fundOf(c); return f ? f / workdaysIn(ym) : shiftH();
}
function capAt(c, i, rid) { return dayCap(c, wdDate(i), rid); }  // i = pořadí pracovního dne
function slotEndP(sl) {                                          // konec buňky na ose (hodiny směny)
  var H = shiftH(), P = slotA(sl), rem = +sl.hours || 0, g = 0, rid = slotRes(sl);
  while (rem > 1e-9 && g++ < 3000) {
    var i = Math.floor(P / H), dayEnd = (i + 1) * H, rate = capAt(sl.center, i, rid) / H;
    var avail = (dayEnd - P) * rate;
    if (avail >= rem - 1e-9) return P + rem / rate;
    rem -= avail; P = dayEnd;
  }
  return P;
}
function workBetween(c, P1, P2, rid) {                           // kolik práce se vejde mezi dvě polohy
  var H = shiftH(), w = 0, P = P1, g = 0;
  while (P < P2 - 1e-9 && g++ < 3000) {
    var i = Math.floor(P / H), e = Math.min(P2, (i + 1) * H);
    w += (e - P) * capAt(c, i, rid) / H; P = e;
  }
  return w;
}
function slotEnd(sl) {                                           // poslední den a hodina konce
  var H = shiftH(), e = slotEndP(sl), i = Math.floor((e - 1e-9) / H);
  return { date: wdDate(i), hour: e - i * H };
}
function slotWhen(sl) {
  var e = slotEnd(sl);
  return fmtDay(sl.start) + ' ' + clock(Math.min(+sl.hour || 0, shiftH() - 1)) + ' → ' + fmtDay(e.date) + ' ' + clock(e.hour);
}
function laneOf(c) { return LANES.filter(function (l) { return l.c === c; })[0]; }
function plannedH(o, c) {
  return (o.slots || []).filter(function (s) { return s.center === c; })
    .reduce(function (a, s) { return a + (+s.hours || 0); }, 0);
}
function remainingH(o, c) { return Math.max(0, (+o[laneOf(c).key] || 0) - plannedH(o, c)); }
function needsPlan(o) {
  if (!o.open) return false;
  if (o.hours > 0) return LANES.some(function (l) { return remainingH(o, l.c) > 0; });
  return String(o.id).indexOf('new-') === 0 && !(o.slots || []).length;   // nová zakázka bez odhadu
}

function generateSlot(o, c) {
  var rem = remainingH(o, c);
  if (rem <= 0) return;
  var from = o.planProd && o.planProd > TODAY ? o.planProd : TODAY;
  var sl = { id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
             center: c, start: wdDate(wdIndex(from)), hour: 0, hours: rem };
  o.slots = (o.slots || []).concat([sl]);
  var ms = mondayOf(sl.start);
  if (sl.start < S.boardStart || sl.start >= wdDate(wdIndex(S.boardStart) + PB_DAYS)) S.boardStart = addDays(ms, -7);
  S.pbFocus = sl.id; pbScrollMemo = null;
  save(); render();
  toast('Buňka ' + c + ' · ' + fmtH(rem) + ' je v plánu — přetáhněte ji, kam patří.');
}

function viewPlan(root) {
  var tabs = el('div', 'plan-tabs');
  [['board', 'Kapacitní plán'], ['gantt', 'Harmonogram']].forEach(function (t) {
    var b = el('button', '', t[1]); b.setAttribute('aria-pressed', String(S.planTab === t[0]));
    b.onclick = function () { S.planTab = t[0]; render(); };
    tabs.appendChild(b);
  });
  root.appendChild(tabs);
  if (S.planTab === 'gantt') return viewGantt(root);
  viewCapacity(root);
}

function viewCapacity(root) {
  if (!S.boardStart) S.boardStart = addDays(mondayOf(TODAY), -7);
  var H = shiftH(), ppH = PB_ZOOM[S.boardZoom] || PB_ZOOM.den;
  var startI = wdIndex(S.boardStart), rangeA = startI * H, W = PB_DAYS * H * ppH;
  var dayW = H * ppH;
  $('#viewSub').textContent = 'kapacitní plán · směna ' + clock(0) + '–' + clock(H);

  // ---- ovládání
  var bar = el('div', 'filters');
  var nav = el('div', 'field', '<label>Období</label>');
  var ng = el('div'); ng.style.cssText = 'display:flex;gap:4px';
  var pv = el('button', 'btn', '‹ 4 týdny'); pv.onclick = function () { S.boardStart = addDays(S.boardStart, -28); pbScrollMemo = null; render(); };
  var td = el('button', 'btn', 'Dnes'); td.onclick = function () { S.boardStart = addDays(mondayOf(TODAY), -7); pbScrollMemo = null; render(); };
  var nx = el('button', 'btn', '4 týdny ›'); nx.onclick = function () { S.boardStart = addDays(S.boardStart, 28); pbScrollMemo = null; render(); };
  ng.appendChild(pv); ng.appendChild(td); ng.appendChild(nx); nav.appendChild(ng); bar.appendChild(nav);

  var zw = el('div', 'field', '<label>Měřítko</label>');
  var zg = el('div'); zg.style.cssText = 'display:flex;gap:4px';
  [['hod', 'Hodiny'], ['den', 'Dny'], ['tyd', 'Týdny']].forEach(function (z) {
    var b = el('button', 'btn', z[1]); b.setAttribute('aria-pressed', String(S.boardZoom === z[0]));
    b.onclick = function () { S.boardZoom = z[0]; pbScrollMemo = null; render(); };
    zg.appendChild(b);
  });
  zw.appendChild(zg); bar.appendChild(zw);

  var sw = el('div', 'field', '<label>Směna</label>');
  var sg = el('div'); sg.style.cssText = 'display:flex;gap:4px;align-items:center';
  var ss = el('select'); for (var h0 = 4; h0 <= 14; h0++) { var o0 = el('option', '', 'od ' + h0 + ':00'); o0.value = h0; if (h0 === shiftStart()) o0.selected = true; ss.appendChild(o0); }
  var sl = el('select'); [6, 7, 7.5, 8, 8.5, 10, 12, 16, 24].forEach(function (v) { var o1 = el('option', '', v.toLocaleString('cs') + ' h / den'); o1.value = v; if (v === H) o1.selected = true; sl.appendChild(o1); });
  ss.onchange = function () { S.dict.shift = { start: +ss.value, hours: H }; save(); render(); };
  sl.onchange = function () { S.dict.shift = { start: shiftStart(), hours: +sl.value }; save(); render(); };
  sg.appendChild(ss); sg.appendChild(sl); sw.appendChild(sg); bar.appendChild(sw);
  root.appendChild(bar);

  var grid = el('div', 'pb');

  // ---- fronta: co čeká na naplánování
  var queue = S.orders.filter(function (o) { return needsPlan(o) && (!S.q || matchesQ(o)); })
    .sort(function (a, b) {
      if (a.id === S.pbFocus) return -1; if (b.id === S.pbFocus) return 1;
      return (a.dateRequired || '9999').localeCompare(b.dateRequired || '9999');
    });
  var qp = panel('Čeká na naplánování', queue.length ? queue.length + ' zakázek' : 'vše naplánováno');
  qp.panel.classList.add('pb-queue');
  var ql = el('div', 'pb-qlist');
  qp.body.replaceWith(ql);
  if (!queue.length) ql.appendChild(el('div', 'pb-empty', 'Žádná rozpracovaná zakázka nečeká. Nová zakázka se sem dostane sama po založení.'));
  queue.forEach(function (o) {
    var card = el('div', 'pb-q' + (o.id === S.pbFocus ? ' focus' : ''));
    card.style.setProperty('--q', o.overdue ? 'var(--bad)' : o.status === 'Výroba' ? 'var(--info)' : 'var(--warn)');
    var dd = o.dateRequired ? days(TODAY, o.dateRequired) : null;
    card.innerHTML = '<div class="top"><b>' + esc(o.code || '—') + '</b>' + statusPill(o.status) + '</div>' +
      '<div class="nm">' + esc(o.name) + '</div>' +
      (o.customerName ? '<div class="cu">' + esc(o.customerName) + '</div>' : '') +
      '<div class="due" style="color:' + (dd != null && dd < 0 ? 'var(--bad)' : dd != null && dd < 7 ? 'var(--warn)' : 'var(--muted)') + '">' +
      (o.dateRequired ? 'termín ' + fmtDate(o.dateRequired) + (dd < 0 ? ' · ' + (-dd) + ' dní po' : dd === 0 ? ' · dnes' : ' · za ' + dd + ' dní') : 'bez termínu') + '</div>';
    var gen = el('div', 'gen');
    if (o.hours > 0) {
      LANES.forEach(function (l) {
        var rem = remainingH(o, l.c);
        if (rem <= 0) return;
        var b = el('button', 'pb-gen', '+ ' + l.c + ' · <span class="num">' + fmtH(rem) + '</span>');
        b.style.setProperty('--lane', l.col); b.style.setProperty('--lane-soft', l.soft);
        b.title = 'Vygenerovat buňku ' + fmtH(rem) + ' a vložit ji do plánu';
        b.onclick = function (e) { e.stopPropagation(); generateSlot(o, l.c); };
        gen.appendChild(b);
      });
      card.appendChild(gen);
      var tot = o.hours, done = LANES.reduce(function (a, l) { return a + Math.min(plannedH(o, l.c), +o[l.key] || 0); }, 0);
      card.appendChild(el('div', 'prog', '<i style="width:' + (tot ? done / tot * 100 : 0) + '%"></i>'));
    } else {
      card.appendChild(el('div', 'miss', 'Chybí odhad hodin — klepněte a doplňte ho, pak půjde buňka vygenerovat.'));
    }
    card.onclick = function () { openDrawer(o); };
    ql.appendChild(card);
  });
  // rozpracované zakázky bez odhadu (hlavně převzaté z Excelu) — sbalené, ať nezahlcují frontu
  var noEst = S.orders.filter(function (o) {
    return o.open && !(o.hours > 0) && String(o.id).indexOf('new-') !== 0 && o.year >= new Date().getFullYear() - 1 &&
      (!S.q || matchesQ(o));
  });
  if (noEst.length) {
    var det = el('details', 'pb-more');
    det.appendChild(el('summary', '', noEst.length + ' rozpracovaných bez odhadu hodin'));
    var ul = el('ul');
    noEst.slice(0, 200).forEach(function (o) {
      var li = el('li', '', '<span title="' + esc(o.name) + '"><b class="num">' + esc(o.code) + '</b> ' + esc(o.name) + '</span>');
      var b = el('button', 'btn ghost', 'Doplnit'); b.style.cssText = 'padding:1px 7px;font-size:11px';
      b.onclick = function () { S.pbFocus = o.id; openDrawer(o); };
      li.appendChild(b); ul.appendChild(li);
    });
    det.appendChild(ul); qp.panel.appendChild(det);
  }
  grid.appendChild(qp.panel);

  // ---- tabule
  var main = el('div', 'panel pb-main');
  var slots = [];
  S.orders.forEach(function (o) {
    (o.slots || []).forEach(function (s) { if (laneOf(s.center)) slots.push({ o: o, s: s, A: slotA(s), E: slotEndP(s) }); });
  });
  var inRange = slots.filter(function (x) { return x.A < rangeA + PB_DAYS * H && x.E > rangeA; });
  var hh = el('div', 'panel-head', '<h2>Plán výroby</h2><span class="hint">' + fmtDay(S.boardStart) + ' – ' +
    fmtDay(wdDate(startI + PB_DAYS - 1)) + ' · ' + inRange.length + ' buněk · táhněte myší, za pravý okraj měňte délku, klepnutím detail</span>');
  main.appendChild(hh);
  var scroll = el('div', 'pb-scroll');
  var canvas = el('div', 'pb-canvas'); canvas.style.width = (PB_LBL + W) + 'px';

  // záhlaví: týdny, dny, případně hodiny
  var headH = S.boardZoom === 'hod' ? 60 : 44;
  var head = el('div', 'pb-head'); head.style.height = headH + 'px';
  var corner = el('div', 'pb-corner', '<span class="eyebrow">Středisko</span>'); corner.style.width = PB_LBL + 'px';
  var dayRow = el('div', 'pb-days'); dayRow.style.cssText = 'width:' + W + 'px;height:' + headH + 'px';
  for (var d = 0; d < PB_DAYS; d++) {
    var ds = wdDate(startI + d), x = d * dayW, dt = parseISO(ds);
    if (d === 0 || dt.getDay() === 1) {
      var left = Math.min(5, PB_DAYS - d);
      var wk = el('div', 'pb-wk', dayW * 5 > 120 ? 'Týden ' + weekNo(ds) + ' · ' + dt.getDate() + '.' + (dt.getMonth() + 1) + '.' : weekNo(ds));
      wk.style.cssText = 'left:' + x + 'px;width:' + left * dayW + 'px';
      dayRow.appendChild(wk);
    }
    var dy = el('div', 'pb-dy' + (dt.getDay() === 1 ? ' mon' : '') + (ds === TODAY ? ' tdy' : ''),
      dayW >= 52 ? fmtDay(ds) : dayW >= 20 ? String(dt.getDate()) : '');
    dy.style.cssText = 'left:' + x + 'px;width:' + dayW + 'px';
    dy.title = fmtDay(ds) + dt.getFullYear();
    dayRow.appendChild(dy);
    if (S.boardZoom === 'hod') {
      for (var h = 0; h < H; h++) {
        var hr = el('div', 'pb-hr', String(Math.floor(shiftStart() + h)));
        hr.style.cssText = 'left:' + (x + h * ppH) + 'px;width:' + ppH + 'px';
        dayRow.appendChild(hr);
      }
    }
  }
  head.appendChild(corner); head.appendChild(dayRow); canvas.appendChild(head);

  // pásy středisek — bez strojů jeden řádek; se stroji souhrn střediska + řádek pro každý stroj/pracovníka
  var r1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString('cs'); };
  function overTxt(n) { return n + ' ' + (n === 1 ? 'den přetížen' : n < 5 ? 'dny přetížené' : 'dní přetížených'); }
  // vytížení po dnech: buňka po dobu svého běhu čerpá celou denní kapacitu toho, kdo ji dělá,
  // takže dvě překrývající se buňky na jednom stroji = přetížení
  function loadOf(items, c) {
    var load = new Array(PB_DAYS).fill(0);
    items.forEach(function (x) {
      var a = x.A - rangeA, b = x.E - rangeA, rid = slotRes(x.s);
      for (var d2 = Math.max(0, Math.floor(a / H)); d2 < PB_DAYS && d2 * H < b; d2++) {
        load[d2] += Math.max(0, Math.min(b, (d2 + 1) * H) - Math.max(a, d2 * H)) * capAt(c, startI + d2, rid) / H;
      }
    });
    return load;
  }
  function gridInto(trk) {
    for (var d3 = 0; d3 < PB_DAYS; d3++) {
      var col = el('div', 'pb-col' + (parseISO(wdDate(startI + d3)).getDay() === 1 ? ' mon' : ''));
      col.style.left = d3 * dayW + 'px';
      trk.appendChild(col);
      if (S.boardZoom === 'hod') {
        for (var h3 = 1; h3 < H; h3++) {
          var hc = el('div', 'pb-col hr'); hc.style.left = (d3 * dayW + h3 * ppH) + 'px'; trk.appendChild(hc);
        }
      }
    }
  }
  function loadInto(trk, load, cap, who) {
    for (var d3 = 0; d3 < PB_DAYS; d3++) {
      if (!(load[d3] > 0)) continue;
      var c3 = cap[d3], ds3 = wdDate(startI + d3);
      var lc = el('div', 'pb-load' + (load[d3] > c3 + 1e-6 ? ' over' : load[d3] >= c3 - 1e-6 ? ' full' : ''),
        dayW >= 34 ? r1(load[d3]) + (dayW >= 60 ? ' / ' + r1(c3) + ' h' : '') : '');
      lc.style.cssText = 'left:' + d3 * dayW + 'px;width:' + dayW + 'px';
      lc.title = fmtDay(ds3) + ' — ' + who + ' ' + fmtH(load[d3]) + ' z ' + fmtH(c3) + ' denní kapacity';
      lc.appendChild(el('i')).style.width = Math.min(100, load[d3] / c3 * 100) + '%';
      trk.appendChild(lc);
    }
  }
  function overCount(load, cap) { return load.filter(function (v, i) { return v > cap[i] + 1e-6; }).length; }

  LANES.forEach(function (l) {
    var all = inRange.filter(function (x) { return x.s.center === l.c; }).sort(function (a, b) { return a.A - b.A; });
    var rs = resList(l.c), fund = fundOf(l.c);
    var ccap = []; for (var dc = 0; dc < PB_DAYS; dc++) ccap[dc] = capAt(l.c, startI + dc, '');
    var cload = loadOf(all, l.c);
    var total = cload.reduce(function (a, b) { return a + b; }, 0), cover = overCount(cload, ccap);

    function row(cls, lblHtml, items, rid, cap, who) {
      // překrývající se buňky do řádků pod sebe
      var ends = [];
      items.forEach(function (x) {
        var r = 0; while (r < ends.length && ends[r] > x.A) r++;
        ends[r] = x.E; x.row = r;
      });
      var lane = el('div', 'pb-lane' + cls);
      lane.style.setProperty('--lane', l.col); lane.style.setProperty('--lane-soft', l.soft);
      var lbl = el('div', 'pb-lbl', lblHtml); lbl.style.width = PB_LBL + 'px';
      var trk = el('div', 'pb-trk');
      trk.style.cssText = 'width:' + W + 'px;height:' + (PB_LOAD + 6 + Math.max(1, ends.length) * PB_ROW) + 'px';
      trk.dataset.center = l.c; trk.dataset.res = rid;
      gridInto(trk);
      loadInto(trk, loadOf(items, l.c), cap, who);
      items.forEach(function (x) { trk.appendChild(slotEl(x, l, rangeA, ppH)); });
      lane.appendChild(lbl); lane.appendChild(trk);
      canvas.appendChild(lane);
    }

    var head = '<b>' + l.c + '</b><span>' + all.length + ' buněk · ' + fmtH(total) + '</span>';
    if (!rs.length) {
      row('', head + '<span>' + (fund ? 'fond ' + fmtH(fund) + ' / měsíc' : 'fond nevyplněn — 1 směna') + '</span>' +
        (cover ? '<span class="pb-ov">' + overTxt(cover) + '</span>' : ''), all, '', ccap, l.c);
      return;
    }
    // souhrn střediska: celkové vytížení proti součtu kapacit všech strojů a pracovníků
    var nS = rs.filter(function (r) { return r.kind !== 'pracovnik'; }).length, nP = rs.length - nS;
    var sum = el('div', 'pb-lane pb-sum');
    sum.style.setProperty('--lane', l.col); sum.style.setProperty('--lane-soft', l.soft);
    var sl = el('div', 'pb-lbl', head.replace('</span>', ' · ' + (nS ? nS + ' ' + (nS === 1 ? 'stroj' : nS < 5 ? 'stroje' : 'strojů') : '') +
      (nS && nP ? ', ' : '') + (nP ? nP + ' ' + (nP === 1 ? 'pracovník' : nP < 5 ? 'pracovníci' : 'pracovníků') : '') + '</span>') +
      '<span>fond ' + (fund ? fmtH(fund) : '—') + ' / měsíc' + (cover ? ' · <b class="pb-ov">' + overTxt(cover) + '</b>' : '') + '</span>');
    sl.style.width = PB_LBL + 'px';
    var st = el('div', 'pb-trk'); st.style.cssText = 'width:' + W + 'px;min-height:' + (PB_LOAD + 2) + 'px';
    gridInto(st); loadInto(st, cload, ccap, l.c + ' celkem');
    sum.appendChild(sl); sum.appendChild(st); canvas.appendChild(sum);

    rs.forEach(function (r) {
      var mine = all.filter(function (x) { return slotRes(x.s) === r.id; });
      var cap = []; for (var dc2 = 0; dc2 < PB_DAYS; dc2++) cap[dc2] = capAt(l.c, startI + dc2, r.id);
      var ov = overCount(loadOf(mine, l.c), cap);
      var hrs = mine.reduce(function (a, x) { return a + (+x.s.hours || 0); }, 0);
      row(' pb-res', '<b title="' + esc(r.name) + '">' + esc(r.name || 'bez názvu') + '</b>' +
        '<span>' + (r.kind === 'pracovnik' ? 'pracovník' : 'stroj') + ' · ' + (+r.fund > 0 ? fmtH(+r.fund) + ' / měs.' : '1 směna') + '</span>' +
        '<span>' + mine.length + ' buněk · ' + fmtH(hrs) + '</span>' +
        (ov ? '<span class="pb-ov">' + overTxt(ov) + '</span>' : ''), mine, r.id, cap, r.name);
    });
    var un = all.filter(function (x) { return !slotRes(x.s); });
    if (un.length) {
      row(' pb-res pb-un', '<b>Nepřiřazeno</b><span>' + un.length + ' buněk · přetáhněte je na stroj nebo pracovníka</span>',
        un, '', ccap, l.c + ' (nepřiřazeno)');
    }
  });

  // čára „teď“
  var tI = wdIndex(TODAY) - startI;
  if (tI >= 0 && tI < PB_DAYS && wdDate(wdIndex(TODAY)) === TODAY) {
    var now = new Date(), frac = Math.max(0, Math.min(H, now.getHours() + now.getMinutes() / 60 - shiftStart()));
    var nl = el('div', 'pb-now'); nl.style.left = (PB_LBL + (tI * H + frac) * ppH) + 'px';
    nl.title = 'teď'; canvas.appendChild(nl);
  }
  if (!inRange.length) {
    canvas.appendChild(el('div', 'pb-hint', slots.length
      ? 'V tomto období nic naplánováno není. Tlačítky ‹ › nahoře se posunete jinam.'
      : 'Plán je zatím prázdný. U zakázky vlevo klepněte na „+ Obrobna“ nebo „+ Svařovna“ — buňka se objeví tady a pak ji přetáhnete, kam patří.')).style.top = (headH + 30) + 'px';
  }
  scroll.appendChild(canvas);
  main.appendChild(scroll);

  var lg = el('div', 'pb-legend');
  lg.innerHTML = '<span><i style="background:var(--accent-soft);border-left:4px solid var(--accent)"></i>Obrobna</span>' +
    '<span><i style="background:var(--bad-soft);border-left:4px solid var(--bad)"></i>Svařovna</span>' +
    '<span><i style="outline:2px dashed var(--bad);outline-offset:-2px"></i>končí po termínu</span>' +
    '<span><i style="background:var(--bad-soft)"></i>den přetížen</span>' +
    '<span><i style="background:var(--warn);width:2px"></i>teď</span>' +
    '<span>Šipky ← → posunou vybranou buňku o hodinu, se Shiftem mění délku.</span>';
  main.appendChild(lg);
  grid.appendChild(main);
  root.appendChild(grid);

  // posun: na zvýrazněnou buňku, jinak zpět tam, kde uživatel byl, jinak na dnešek
  scroll.addEventListener('scroll', function () { pbScrollMemo = { l: scroll.scrollLeft, t: scroll.scrollTop }; });
  setTimeout(function () {
    var f = S.pbFocus && canvas.querySelector('[data-slot="' + S.pbFocus + '"]');
    var qf = ql.querySelector('.pb-q.focus');
    if (f) {
      scroll.scrollLeft = Math.max(0, f.offsetLeft - scroll.clientWidth / 3);
      scroll.scrollTop = Math.max(0, f.offsetTop - 80);
      f.classList.add('flash'); f.focus({ preventScroll: true });
    } else if (pbScrollMemo) {
      scroll.scrollLeft = pbScrollMemo.l; scroll.scrollTop = pbScrollMemo.t;
    } else {
      scroll.scrollLeft = Math.max(0, (tI - 2) * dayW);
    }
    if (qf) qf.scrollIntoView({ block: 'nearest' });
    S.pbFocus = null;             // zvýraznění jen jednou, při dalším překreslení už ne
  }, 0);
}

/* Jedna buňka na tabuli — tažení, změna délky, klávesy, detail. */
function slotEl(x, l, rangeA, ppH) {
  var o = x.o, sl = x.s;
  var end = slotEnd(sl);
  var late = !!(o.dateRequired && end.date > o.dateRequired);
  var cls = 'pb-blk' + (late && o.open ? ' late' : '') + (!o.open ? ' done' : '') + (S.q && !matchesQ(o) ? ' dim' : '');
  var b = el('div', cls);
  b.dataset.slot = sl.id;
  b.tabIndex = 0;
  var w = (x.E - x.A) * ppH;
  b.style.cssText = 'left:' + ((x.A - rangeA) * ppH + 1) + 'px;width:' + Math.max(8, w - 2) + 'px;top:' +
    (PB_LOAD + 4 + x.row * PB_ROW) + 'px;height:' + (PB_ROW - 6) + 'px';
  var hrs = fmtH(+sl.hours || 0);
  b.innerHTML = w >= 110
      ? '<div class="r1"><span class="c">' + esc(o.code || '') + '</span><span class="w">' + hrs + '</span></div>' +
        '<span class="n">' + esc(o.name) + (w >= 200 && o.customerName ? ' · ' + esc(o.customerName) : '') + '</span>'
      : w >= 64
        ? '<span class="c">' + esc(o.code || '') + '</span><span class="w">' + hrs + '</span>'
        : '<span class="w">' + hrs + '</span>';
  b.appendChild(el('span', 'pb-rs')).title = 'Táhněte pro změnu délky';
  var rr = resOf(sl.center, sl.res);
  b.title = (o.code ? o.code + ' — ' : '') + o.name + '\n' + l.c + (rr ? ' · ' + rr.name : '') + ' · ' + hrs + '\n' + slotWhen(sl) +
    (o.customerName ? '\n' + o.customerName : '') +
    (o.dateRequired ? '\ntermín ' + fmtDate(o.dateRequired) + (late ? ' — buňka končí po termínu!' : '') : '');

  b.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    e.preventDefault();
    var resize = e.target.classList.contains('pb-rs');
    var x0 = e.clientX, y0 = e.clientY, A0 = x.A, E0 = x.E, dh = 0, nh = +sl.hours || 1;
    var rid0 = slotRes(sl), tgt = null;
    // řádky, na které lze buňku přesunout: stroje / pracovníci téhož střediska
    var rows = resize ? [] : Array.prototype.slice.call(document.querySelectorAll('.pb-trk[data-res]'))
      .filter(function (t) { return t.dataset.center === sl.center; });
    b.setPointerCapture(e.pointerId);
    b.classList.add('drag');
    var wEl = b.querySelector('.w');
    function rowAt(y) {
      for (var i = 0; i < rows.length; i++) { var r = rows[i].getBoundingClientRect(); if (y >= r.top && y < r.bottom) return rows[i]; }
      return null;
    }
    function mv(ev) {
      dh = Math.round((ev.clientX - x0) / ppH);
      if (resize) {
        // konec táhneme po hodinách směny, délku v hodinách práce dopočte fond
        var endP = Math.max(A0 + 0.25, E0 + dh);
        nh = Math.max(1, Math.round(workBetween(sl.center, A0, endP, rid0)));
        b.style.width = Math.max(8, (endP - A0) * ppH - 2) + 'px';
        if (wEl) wEl.textContent = fmtH(nh);
      } else {
        b.style.left = ((A0 + dh - rangeA) * ppH + 1) + 'px';
        if (rows.length > 1) {
          b.style.transform = 'translateY(' + (ev.clientY - y0) + 'px)';
          var t = rowAt(ev.clientY);
          if (t !== tgt) {
            if (tgt) tgt.classList.remove('pb-drop');
            tgt = t && t.dataset.res !== rid0 ? t : null;
            if (tgt) tgt.classList.add('pb-drop');
          }
        }
        var tmp = { start: sl.start, hour: sl.hour, hours: sl.hours }; setSlotA(tmp, A0 + dh);
        if (wEl) wEl.textContent = fmtDay(tmp.start) + ' ' + clock(tmp.hour);
      }
    }
    function up() {
      b.removeEventListener('pointermove', mv);
      b.removeEventListener('pointerup', up);
      b.removeEventListener('pointercancel', up);
      b.classList.remove('drag');
      if (tgt) tgt.classList.remove('pb-drop');
      if (!dh && !tgt) { b.style.transform = ''; openSlot(o, sl); return; }
      if (resize) sl.hours = nh; else setSlotA(sl, A0 + dh);
      if (tgt) {
        if (tgt.dataset.res) sl.res = tgt.dataset.res; else delete sl.res;
        var r = resOf(sl.center, sl.res);
        toast(r ? 'Buňku dělá ' + r.name + ' — délka přepočtena podle jeho fondu.' : 'Buňka je nepřiřazená — počítá s kapacitou celého střediska.');
      }
      S.pbFocus = tgt ? sl.id : null; save(); render();
    }
    b.addEventListener('pointermove', mv);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
  });
  b.addEventListener('keydown', function (e) {
    var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (e.key === 'Enter') { e.preventDefault(); openSlot(o, sl); return; }
    if (!step) return;
    e.preventDefault();
    if (e.shiftKey) sl.hours = Math.max(1, (+sl.hours || 1) + step); else setSlotA(sl, slotA(sl) + step);
    S.pbFocus = sl.id; save(); render();
  });
  return b;
}

/* Detail buňky: přesný začátek, délka, rozdělení, odebrání. */
function openSlot(o, sl) {
  var H = shiftH(), l = laneOf(sl.center);
  var layer = openLayer(function () {});
  var scrim = layer.scrim; scrim.style.alignItems = 'center'; scrim.style.justifyContent = 'center';
  var box = el('div', 'panel'); box.style.cssText = 'width:min(470px,94vw);max-height:92vh;overflow:auto;border-top:4px solid ' + l.col;
  var head = el('div', 'panel-head', '<h2 style="flex:1">' + esc(o.code || '') + ' · ' + esc(o.name) + '</h2>');
  var x = el('button', 'btn ghost', '✕'); x.title = 'Zavřít'; x.onclick = function () { layer.close(); }; head.appendChild(x);
  box.appendChild(head);
  var body = el('div', 'panel-body'); body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  var est = +o[l.key] || 0, planned = plannedH(o, l.c);
  body.appendChild(el('p', 'note', '<b>' + l.c + '</b> · odhad ' + fmtH(est) + ', naplánováno ' + fmtH(planned) +
    (planned > est ? ' — <b style="color:var(--bad)">o ' + fmtH(planned - est) + ' víc než odhad</b>' : planned < est ? ' — zbývá ' + fmtH(est - planned) : '') +
    (o.dateRequired ? '<br>Termín dodání ' + fmtDate(o.dateRequired) : '')));
  var capNote = el('p', 'note'); capNote.style.marginTop = '-6px'; body.appendChild(capNote);
  var fg = el('div', 'formgrid');
  var rs = resList(l.c), rsel = null;
  if (rs.length) {
    var rw = el('div', 'field', '<label>Stroj / pracovník</label>'); rw.style.gridColumn = '1 / -1';
    rsel = el('select');
    rsel.appendChild(el('option', '', 'Nepřiřazeno — celé středisko')).value = '';
    rs.forEach(function (r) {
      var op = el('option', '', esc(r.name || 'bez názvu') + ' (' + (r.kind === 'pracovnik' ? 'pracovník' : 'stroj') + ')');
      op.value = r.id; if (r.id === slotRes(sl)) op.selected = true; rsel.appendChild(op);
    });
    rw.appendChild(rsel); fg.appendChild(rw);
  }
  var dw = el('div', 'field', '<label>Začátek — den</label>');
  var di = el('input'); di.type = 'date'; di.value = sl.start; dw.appendChild(di); fg.appendChild(dw);
  var hw = el('div', 'field', '<label>Začátek — hodina</label>');
  var hs = el('select');
  for (var h = 0; h < H; h++) { var op = el('option', '', clock(h)); op.value = h; if (h === Math.min(+sl.hour || 0, H - 1)) op.selected = true; hs.appendChild(op); }
  hw.appendChild(hs); fg.appendChild(hw);
  var lw = el('div', 'field', '<label>Délka (h)</label>');
  var li = el('input'); li.type = 'number'; li.min = '0.5'; li.step = '0.5'; li.value = sl.hours; lw.appendChild(li); fg.appendChild(lw);
  var when = el('div', 'field', '<label>Běží</label>');
  var wv = el('div', 'num'); wv.style.cssText = 'padding:7px 0;font-size:12px'; when.appendChild(wv); fg.appendChild(when);
  function preview() {
    var rid = rsel ? rsel.value : '';
    var t = { center: sl.center, res: rid, start: di.value || sl.start, hour: +hs.value, hours: Math.max(0.5, +li.value || 0.5) };
    t.start = wdDate(wdIndex(t.start));
    wv.textContent = slotWhen(t);
    var r = resOf(l.c, rid), f = r ? +r.fund : fundOf(l.c);
    capNote.innerHTML = (r ? '<b>' + esc(r.name) + '</b>' : l.c + (rs.length ? ' (všichni dohromady)' : '')) + ' zvládne ' +
      (f > 0 ? '≈ ' + fmtH(dayCap(l.c, t.start, rid)) + ' denně (fond ' + fmtH(f) + ' / měsíc)'
             : fmtH(dayCap(l.c, t.start, rid)) + ' denně — fond hodin není vyplněný');
  }
  di.oninput = hs.onchange = li.oninput = preview; if (rsel) rsel.onchange = preview; preview();
  body.appendChild(fg);
  box.appendChild(body);

  var ft = el('div', 'panel-body'); ft.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line-soft)';
  var ok = el('button', 'btn primary', 'Uložit');
  ok.onclick = function () {
    sl.start = wdDate(wdIndex(di.value || sl.start)); sl.hour = +hs.value; sl.hours = Math.max(0.5, +li.value || 0.5);
    if (rsel) { if (rsel.value) sl.res = rsel.value; else delete sl.res; }
    S.pbFocus = sl.id; save(); layer.close(); render();
  };
  var sp = el('button', 'btn', 'Rozdělit na dvě');
  sp.title = 'Rozdělí buňku na dvě poloviny; druhou pak můžete přetáhnout jinam';
  sp.onclick = function () {
    var total = +sl.hours || 0;
    if (total < 1) return toast('Buňku kratší než hodinu nejde dělit.');
    var h1 = Math.round(total) / 2, h2 = total - h1;      // půlky zaokrouhlené na půl hodiny
    var nw = { id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), center: sl.center, start: sl.start, hour: sl.hour, hours: h2 };
    if (slotRes(sl)) nw.res = sl.res;
    sl.hours = h1; setSlotA(nw, slotEndP(sl));
    o.slots.push(nw);
    S.pbFocus = nw.id; save(); layer.close(); render();
    toast('Rozděleno na ' + fmtH(h1) + ' a ' + fmtH(h2) + '.');
  };
  var sr = null;
  if (rs.length >= 2) {
    sr = el('button', 'btn', 'Rozdělit mezi stroje / pracovníky');
    sr.title = 'Práci na buňce rozdělí mezi více strojů nebo pracovníků, kteří na ní pracují souběžně';
    sr.onclick = function () {
      openSplitRes(o, sl, { start: wdDate(wdIndex(di.value || sl.start)), hour: +hs.value, hours: Math.max(0.5, +li.value || 0.5) },
                   function () { layer.close(); });
    };
  }
  var od = el('button', 'btn', 'Otevřít zakázku');
  od.onclick = function () { layer.close(); openDrawer(o); };
  var rm = el('button', 'btn danger', 'Odebrat z plánu');
  rm.onclick = function () {
    askConfirm('Odebrat buňku z plánu', fmtH(+sl.hours || 0) + ' se vrátí do fronty „Čeká na naplánování“. Zakázka zůstává.', 'Odebrat')
      .then(function (y) {
        if (!y) return;
        o.slots = (o.slots || []).filter(function (s) { return s.id !== sl.id; });
        if (needsPlan(o)) S.pbFocus = o.id;
        save(); layer.close(); render();
      });
  };
  var cl = el('button', 'btn', 'Storno'); cl.onclick = function () { layer.close(); };
  ft.appendChild(ok); ft.appendChild(sp); if (sr) ft.appendChild(sr); ft.appendChild(od); ft.appendChild(el('span', 'spacer')); ft.appendChild(rm); ft.appendChild(cl);
  box.appendChild(ft);
  scrim.appendChild(box);
  setTimeout(function () { li.focus(); }, 30);
}

/* Rozdělení buňky mezi více strojů / pracovníků: každý dostane svou buňku se svým
   dílem hodin, všechny začínají ve stejnou chvíli a běží souběžně, každá tempem svého fondu. */
function openSplitRes(o, sl, base, closeParent) {
  var l = laneOf(sl.center), rs = resList(l.c), total = base.hours;
  var layer = openLayer(function () {});
  var scrim = layer.scrim; scrim.style.alignItems = 'center'; scrim.style.justifyContent = 'center';
  var box = el('div', 'panel'); box.style.cssText = 'width:min(560px,95vw);max-height:92vh;overflow:auto;border-top:4px solid ' + l.col;
  var head = el('div', 'panel-head', '<h2 style="flex:1">Rozdělit mezi stroje / pracovníky</h2>');
  var x = el('button', 'btn ghost', '✕'); x.title = 'Zavřít'; x.onclick = function () { layer.close(); }; head.appendChild(x);
  box.appendChild(head);
  var body = el('div', 'panel-body'); body.style.cssText = 'display:flex;flex-direction:column;gap:12px';
  body.appendChild(el('p', 'note', '<b>' + esc(o.code || '') + ' · ' + esc(o.name) + '</b> — ' + l.c + ' ' + fmtH(total) +
    ', start ' + fmtDay(base.start) + ' ' + clock(base.hour) + '. Zaškrtněte, kdo na buňce pracuje, a kolik hodin každý udělá. ' +
    'Všichni začnou současně; každá část pak běží tempem fondu toho, kdo ji dělá.'));
  var cur = slotRes(sl), rows = [];
  var list = el('div', 'sr-list');
  rs.forEach(function (r) {
    var row = el('label', 'sr-row');
    var cb = el('input'); cb.type = 'checkbox'; cb.checked = !cur || r.id === cur;
    var nm = el('span', 'sr-n', '<b>' + esc(r.name || 'bez názvu') + '</b><small>' + (r.kind === 'pracovnik' ? 'pracovník' : 'stroj') +
      ' · ≈ ' + fmtH(dayCap(l.c, base.start, r.id)) + ' denně</small>');
    var hi = el('input'); hi.type = 'number'; hi.min = '0'; hi.step = '0.5'; hi.setAttribute('aria-label', 'Hodin pro ' + (r.name || 'položku'));
    var en = el('span', 'sr-e num');
    row.appendChild(cb); row.appendChild(nm); row.appendChild(hi); row.appendChild(el('span', 'sr-h', 'h')); row.appendChild(en);
    list.appendChild(row);
    var it = { r: r, cb: cb, hi: hi, en: en };
    cb.onchange = function () { if (cb.checked && !(+hi.value > 0)) hi.value = ''; distribute(mode); };
    hi.oninput = function () { if (+hi.value > 0) cb.checked = true; upd(); };
    rows.push(it);
  });
  body.appendChild(list);
  var tools = el('div', 'sr-tools');
  var eq = el('button', 'btn', 'Rovným dílem'), byf = el('button', 'btn', 'Podle fondu — skončí zároveň');
  var mode = 'eq';
  eq.onclick = function () { distribute('eq'); };
  byf.onclick = function () { distribute('fund'); };
  tools.appendChild(eq); tools.appendChild(byf);
  var sum = el('span', 'sr-sum'); tools.appendChild(sum);
  body.appendChild(tools);
  box.appendChild(body);

  function on() { return rows.filter(function (it) { return it.cb.checked; }); }
  function distribute(m) {
    mode = m;
    var sel = on(); if (!sel.length) { rows.forEach(function (it) { it.hi.value = ''; }); return upd(); }
    var w = sel.map(function (it) { return m === 'fund' ? dayCap(l.c, base.start, it.r.id) : 1; });
    var ws = w.reduce(function (a, b) { return a + b; }, 0), left = total;
    sel.forEach(function (it, i) {
      var h = i === sel.length - 1 ? left : Math.round(total * w[i] / ws * 2) / 2;
      h = Math.max(0, Math.round(h * 2) / 2); left -= h; it.hi.value = h;
    });
    rows.forEach(function (it) { if (!it.cb.checked) it.hi.value = ''; });
    upd();
  }
  function upd() {
    var t = 0;
    rows.forEach(function (it) {
      var h = it.cb.checked ? +it.hi.value || 0 : 0; t += h;
      it.en.textContent = h > 0 ? '→ ' + slotWhen({ center: l.c, res: it.r.id, start: base.start, hour: base.hour, hours: h }).split(' → ')[1] : '';
      it.hi.disabled = !it.cb.checked;
    });
    var d = Math.round((t - total) * 10) / 10;
    sum.innerHTML = 'Celkem <b>' + fmtH(t) + '</b> z ' + fmtH(total) +
      (d > 0 ? ' — <b style="color:var(--bad)">o ' + fmtH(d) + ' víc</b>' : d < 0 ? ' — ' + fmtH(-d) + ' se vrátí do fronty' : '');
    ok.disabled = on().filter(function (it) { return +it.hi.value > 0; }).length < 1;
  }

  var ft = el('div', 'panel-body'); ft.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line-soft)';
  var ok = el('button', 'btn primary', 'Rozdělit');
  ok.onclick = function () {
    var parts = on().filter(function (it) { return +it.hi.value > 0; });
    if (!parts.length) return;
    var first = true, made = [];
    parts.forEach(function (it) {
      var t = first ? sl : { id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), center: sl.center };
      t.start = base.start; t.hour = base.hour; t.hours = Math.round(+it.hi.value * 2) / 2; t.res = it.r.id;
      if (!first) o.slots.push(t);
      first = false; made.push(it.r.name || 'bez názvu');
    });
    S.pbFocus = sl.id; save(); layer.close(); closeParent(); render();
    toast('Rozděleno: ' + made.join(', ') + '.');
  };
  var cl = el('button', 'btn', 'Storno'); cl.onclick = function () { layer.close(); };
  ft.appendChild(ok); ft.appendChild(el('span', 'spacer')); ft.appendChild(cl);
  box.appendChild(ft);
  scrim.appendChild(box);
  distribute('eq');
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
  root.appendChild(fundPanel());
  root.appendChild(prefixPanel());
  root.appendChild(customerPanel());
  root.appendChild(companyPanel());

  var sp = panel('Uložení na server', 'zatím nepovinné — bez adresy se ukládá jen do prohlížeče');
  var sf = el('div', 'formgrid');
  var uw = el('div', 'field full', '<label>Adresa API</label>');
  var ui = el('input'); ui.type = 'url'; ui.placeholder = 'https://server.firma.cz/api/zakazky'; ui.value = S.server.url;
  ui.onchange = function () { S.server.url = ui.value.trim(); cache(); markSave(); startPolling(); };
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
    askConfirm('Načíst ze serveru', 'Současná data v prohlížeči budou nahrazena daty ze serveru.', 'Načíst')
      .then(function (y) {
        if (!y) return;
        pullFromServer(false).then(function (ok) {
          if (ok) startPolling(); else toast('Načtení se nezdařilo.');
        });
      });
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
    askConfirm('Vrátit původní data', 'Všechny úpravy, číselníky i zákazníci se zahodí a načtou se data z původního sešitu.', 'Zahodit a obnovit')
      .then(function (y) {
        if (!y) return;
        S.orders = JSON.parse(JSON.stringify(seed)); S.dict = JSON.parse(JSON.stringify(DEFAULT_DICT));
        migrateDict(); S.dirty = false; recalc(); save(); render(); toast('Obnoveno z původního sešitu.');
      });
  };
  [e1, e2, imp, rst].forEach(function (x) { b.appendChild(x); });
  p.body.appendChild(b);
  p.body.appendChild(el('p', 'note', 'Aplikace pracuje s ' + S.orders.length.toLocaleString('cs') + ' zakázkami z let ' +
    S.years[S.years.length - 1] + '–' + S.years[0] + ', převzatými ze sešitu <b>PREHLED_ZAKAZEK_NOVY.xlsx</b> (listy jednotlivých roků, list Plan a číselníky z listu Support). ' +
    'Úpravy zůstávají v tomto prohlížeči — pro sdílení mezi lidmi je dalším krokem společné úložiště.'));
  root.appendChild(p.panel);
}

/* Stroje, pracovníci a fond hodin — každé středisko může mít stroje / pracovníky
   s vlastním měsíčním fondem. Bez nich platí jeden fond za celé středisko.
   Z fondu kapacitní plán počítá, jak dlouho buňka na tabuli trvá. */
function fundPanel() {
  var p = panel('Stroje, pracovníci a fond hodin', 'kdo ve středisku pracuje a kolik hodin za měsíc zvládne — podle toho se v kapacitním plánu počítají délky buněk');
  var months = [], ym = TODAY.slice(0, 7);
  for (var k = 0; k < 4; k++) {
    var dt = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + k, 1);
    months.push(dt.getFullYear() + '-' + pad(dt.getMonth() + 1));
  }
  function monthHint(perDay) {
    return months.map(function (m) {
      return '<b>' + MONTHS[+m.slice(5, 7) - 1] + '</b> ' + workdaysIn(m) + ' prac. dní → ' + fmtH(perDay(m)) + ' denně';
    }).join('<br>');
  }
  var grid = el('div', 'res-grid');
  LANES.forEach(function (l) {
    var box = el('div', 'res-box');
    box.style.setProperty('--lane', l.col);
    grid.appendChild(box);
    function draw() {
      box.innerHTML = '';
      var rs = resList(l.c);
      box.appendChild(el('h3', '', l.c));
      var hint = el('p', 'note');
      function upd() {
        var f = fundOf(l.c), list = resList(l.c);
        if (list.length) {
          var empty = list.filter(function (r) { return !(+r.fund > 0); }).length;
          hint.innerHTML = 'Fond střediska <b>' + fmtH(f) + ' / měsíc</b> (součet)' +
            (empty ? ' + ' + empty + '× jedna směna u nevyplněných' : '') + '<br>' +
            monthHint(function (m) { return dayCap(l.c, m + '-01', ''); });
        } else {
          hint.innerHTML = f > 0 ? monthHint(function (m) { return f / workdaysIn(m); })
                                 : 'Nevyplněno — počítá se jedna směna, ' + fmtH(shiftH()) + ' denně.';
        }
      }
      if (rs.length) {
        var tbl = el('div', 'res-list');
        tbl.appendChild(el('div', 'res-row res-hd', '<span>Druh</span><span>Název / jméno</span><span>Fond h / měs.</span><span></span>'));
        rs.forEach(function (r) {
          var row = el('div', 'res-row');
          var ks = el('select');
          [['stroj', 'Stroj'], ['pracovnik', 'Pracovník']].forEach(function (o) {
            var op = el('option', '', o[1]); op.value = o[0]; if ((r.kind || 'stroj') === o[0]) op.selected = true; ks.appendChild(op);
          });
          ks.setAttribute('aria-label', 'Druh');
          ks.onchange = function () { r.kind = ks.value; save(); };
          var ni = el('input'); ni.value = r.name || ''; ni.placeholder = r.kind === 'pracovnik' ? 'jméno pracovníka' : 'název stroje';
          ni.setAttribute('aria-label', 'Název');
          ni.onchange = function () { r.name = ni.value.trim(); save(); };
          var fi = el('input'); fi.type = 'number'; fi.min = '0'; fi.step = '1'; fi.inputMode = 'numeric';
          fi.value = +r.fund > 0 ? r.fund : ''; fi.placeholder = '1 směna';
          fi.setAttribute('aria-label', 'Fond hodin za měsíc');
          fi.onchange = function () {
            r.fund = +fi.value > 0 ? +fi.value : '';
            save(); upd();
            toast((r.name || 'Fond') + ': ' + (r.fund ? fmtH(r.fund) + ' / měsíc' : 'jedna směna') + ' — kapacitní plán se přepočítal.');
          };
          var del = el('button', 'btn ghost', '✕'); del.title = 'Odebrat';
          del.onclick = function () {
            var used = [];
            S.orders.forEach(function (o) { (o.slots || []).forEach(function (sl) { if (sl.center === l.c && sl.res === r.id) used.push(sl); }); });
            (used.length ? askConfirm('Odebrat ' + (r.name || 'položku'),
                used.length + ' ' + (used.length === 1 ? 'buňka' : used.length < 5 ? 'buňky' : 'buněk') + ' v plánu se přesune do řádku „Nepřiřazeno“.', 'Odebrat')
              : Promise.resolve(true)).then(function (y) {
              if (!y) return;
              used.forEach(function (sl) { delete sl.res; });
              S.dict.resources[l.c] = resList(l.c).filter(function (x) { return x !== r; });
              save(); draw();
            });
          };
          row.appendChild(ks); row.appendChild(ni); row.appendChild(fi); row.appendChild(del);
          tbl.appendChild(row);
        });
        box.appendChild(tbl);
      } else {
        var w = el('div', 'field', '<label>Fond celého střediska — hodin za měsíc</label>');
        var i = el('input'); i.type = 'number'; i.min = '0'; i.step = '1'; i.inputMode = 'numeric';
        i.placeholder = 'nevyplněno = 1 směna (' + fmtH(shiftH()) + ' denně)';
        i.value = fundOf(l.c) || '';
        i.onchange = function () {
          S.dict.fund = S.dict.fund || {};
          S.dict.fund[l.c] = +i.value > 0 ? +i.value : '';
          save(); upd();
          toast('Fond ' + l.c + (S.dict.fund[l.c] ? ' ' + fmtH(S.dict.fund[l.c]) + ' / měsíc' : ' zrušen') + ' — kapacitní plán se přepočítal.');
        };
        w.appendChild(i); box.appendChild(w);
      }
      var acts = el('div', 'res-acts');
      [['stroj', '+ Přidat stroj'], ['pracovnik', '+ Přidat pracovníka']].forEach(function (t) {
        var b = el('button', 'btn', t[1]);
        b.onclick = function () {
          S.dict.resources = S.dict.resources || {};
          var list = resList(l.c).slice();
          // první stroj/pracovník převezme dosavadní fond střediska, ať se plán nerozhodí
          var first = !list.length && fundOf(l.c) > 0;
          list.push({ id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: t[0], name: '',
                      fund: first ? fundOf(l.c) : '' });
          S.dict.resources[l.c] = list;
          save(); draw();
          var ins = box.querySelectorAll('.res-row input:not([type=number])');
          if (ins.length) ins[ins.length - 1].focus();
        };
        acts.appendChild(b);
      });
      box.appendChild(acts);
      upd(); box.appendChild(hint);
    }
    draw();
  });
  p.body.appendChild(grid);
  p.body.appendChild(el('p', 'note', 'Buňka v kapacitním plánu trvá tak dlouho, kolik hodin práce má, děleno denní kapacitou toho, kdo ji dělá. ' +
    'Denní kapacita = fond ÷ počet pracovních dnů v měsíci (bez víkendů, státní svátky se zatím neodečítají); nevyplněný fond = jedna směna. ' +
    'Buňku přiřadíte stroji nebo pracovníkovi přetažením na jeho řádek v plánu, případně v detailu buňky. ' +
    'Nepřiřazená buňka počítá s kapacitou celého střediska (součet všech strojů a pracovníků).'));
  return p.panel;
}

/* Legenda předčíslí — ke které firmě která zkratka patří. */
function prefixPanel() {
  var p = panel('Předčíslí zakázek', 'zkratka v čísle zakázky a firma, které patří');
  p.body.style.padding = '0';
  var wrap = el('div', 'tablewrap'); wrap.style.maxHeight = '340px';
  var t = el('table', 'grid');
  t.innerHTML = '<thead><tr><th style="width:90px">Zkratka</th><th>Význam — firma nebo účel</th><th style="width:40px"></th></tr></thead>';
  var tb = el('tbody');
  S.dict.prefixes.forEach(function (pf, i) {
    var r = el('tr'); r.style.cursor = 'default';
    r.appendChild(el('td', 'mono', '<b>' + esc(pf.code) + '</b>'));
    var td = el('td');
    var inp = el('input', 'inv-in'); inp.value = pf.label || ''; inp.placeholder = 'doplňte, komu předčíslí patří';
    inp.style.fontFamily = 'inherit'; inp.style.fontSize = 'var(--fs-sm)';
    inp.onchange = function () { pf.label = inp.value.trim(); save(); };
    td.appendChild(inp); r.appendChild(td);
    var tdx = el('td');
    var x = el('button', 'btn ghost', '✕'); x.style.cssText = 'padding:2px 6px';
    x.title = 'Odebrat předčíslí';
    x.onclick = function () {
      askConfirm('Odebrat předčíslí', 'Předčíslí ' + pf.code + ' zmizí z nabídky. Zakázky, které ho už mají, zůstanou beze změny.', 'Odebrat')
        .then(function (y) { if (y) { S.dict.prefixes.splice(i, 1); save(); render(); } });
    };
    tdx.appendChild(x); r.appendChild(tdx);
    tb.appendChild(r);
  });
  t.appendChild(tb); wrap.appendChild(t); p.body.appendChild(wrap);

  var add = el('form'); add.style.cssText = 'display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--line-soft)';
  add.innerHTML = '<input name="c" placeholder="Zkratka" maxlength="4" style="width:90px;text-transform:uppercase">' +
    '<input name="l" placeholder="Např. Continental Jičín — přípravky" style="flex:1">' +
    '<button class="btn" type="submit">Přidat</button>';
  add.onsubmit = function (e) {
    e.preventDefault();
    var c = add.c.value.trim().toUpperCase(), l = add.l.value.trim();
    if (!c) return;
    if (pfxCodes().indexOf(c) >= 0) return toast('Předčíslí ' + c + ' už existuje.');
    S.dict.prefixes.push({ code: c, label: l }); save(); render();
  };
  p.body.appendChild(add);
  return p.panel;
}

/* Zákazníci — pro potvrzení objednávky; doplňují se z ARES nebo ručně. */
function customerPanel() {
  sortCustomers();
  var p = panel('Zákazníci', S.dict.customers.length + ' firem · řazeno abecedně, nabízí se při zakládání zakázky');
  var form = el('form'); form.style.cssText = 'display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px';
  var iw = el('div', 'field', '<label>IČO</label>');
  var ii = el('input'); ii.placeholder = '8 číslic'; ii.style.width = '130px'; ii.inputMode = 'numeric';
  iw.appendChild(ii); form.appendChild(iw);
  var go = el('button', 'btn primary', 'Načíst z ARES'); go.type = 'submit'; form.appendChild(go);
  var src = el('span', '');
  src.style.cssText = 'font-size:var(--fs-xs);color:var(--muted);align-self:center';
  src.textContent = 'ARES přímo, při selhání přes r.jina.ai'
    + (S.server.ares ? ', pak váš server' : '');
  form.appendChild(src);
  var man = el('button', 'btn', 'Zadat ručně'); man.type = 'button';
  man.onclick = function () { editCustomer({ ico: ii.value.replace(/\D/g, '') }, true); };
  form.appendChild(man);
  form.onsubmit = function (e) {
    e.preventDefault();
    go.disabled = true; go.textContent = 'Hledám…';
    aresLookup(ii.value).then(function (c) {
      go.disabled = false; go.textContent = 'Načíst z ARES';
      if (customerByIco(c.ico)) return toast('Firma s IČO ' + c.ico + ' už v číselníku je.');
      toast('Načteno — ' + c.source + '.');
      editCustomer(c, true);
    }, function (err) {
      go.disabled = false; go.textContent = 'Načíst z ARES';
      aresFailed(err, ii.value);
    });
  };
  p.body.appendChild(form);

  // mezikrok na ARES — prohlížeč zpravidla nedovolí volat ARES napřímo
  var aw = el('div', 'field full');
  aw.style.marginBottom = '12px';
  aw.appendChild(el('label', '', 'Mezikrok na ARES — adresa na vašem serveru'));
  var ai = el('input'); ai.id = 'aresField'; ai.type = 'url';
  ai.placeholder = 'https://server.firma.cz/api/ares';
  ai.value = S.server.ares || '';
  ai.onchange = function () { S.server.ares = ai.value.trim(); cache(); render(); };
  aw.appendChild(ai);
  aw.appendChild(el('p', 'note', 'Nepovinné — nechte prázdné, pokud nevíte. Načítání funguje i bez něj: ' +
    'zkusí se ARES napřímo a pak veřejný mezikrok r.jina.ai. Tohle pole je až třetí záloha ' +
    'pro sítě, kde ani jedna cesta neprojde; server musí na <code>GET &lt;adresa&gt;/{IČO}</code> ' +
    'vrátit odpověď ARESu (hotový je ve složce <b>server/</b> v repozitáři).'));
  p.body.appendChild(aw);

  if (!S.dict.customers.length) {
    p.body.appendChild(el('p', 'note', 'Zatím žádná firma. Zadejte IČO a načtěte ji z ARES, nebo ji vyplňte ručně — pak se bude nabízet v seznamu u nové zakázky.'));
  } else {
    var wrap = el('div', 'tablewrap'); wrap.style.maxHeight = '360px';
    var t = el('table', 'grid');
    t.innerHTML = '<thead><tr><th>Firma</th><th>IČO</th><th>DIČ</th><th>Sídlo</th><th style="width:80px"></th></tr></thead>';
    var tb = el('tbody');
    S.dict.customers.forEach(function (c, i) {
      var r = el('tr');
      r.appendChild(el('td', 'nm', esc(c.name)));
      r.appendChild(el('td', 'mono', esc(c.ico)));
      r.appendChild(el('td', 'mono', esc(c.dic)));
      r.appendChild(el('td', '', esc([c.street, [c.zip, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', '))));
      var tdx = el('td');
      var ed = el('button', 'btn ghost', 'Upravit'); ed.style.cssText = 'padding:2px 6px;font-size:11px';
      ed.onclick = function (e) { e.stopPropagation(); editCustomer(c, false); };
      var x = el('button', 'btn ghost', '✕'); x.style.cssText = 'padding:2px 6px';
      x.onclick = function (e) {
        e.stopPropagation();
        askConfirm('Odebrat firmu', c.name + ' zmizí z číselníku zákazníků.', 'Odebrat')
          .then(function (y) { if (y) { S.dict.customers.splice(i, 1); save(); render(); } });
      };
      tdx.appendChild(ed); tdx.appendChild(x); r.appendChild(tdx);
      r.onclick = function () { editCustomer(c, false); };
      tb.appendChild(r);
    });
    t.appendChild(tb); wrap.appendChild(t);
    p.body.style.paddingBottom = '0';
    p.body.appendChild(wrap);
  }
  return p.panel;
}

var CUST_FIELDS = [['name', 'Název firmy', true], ['ico', 'IČO'], ['dic', 'DIČ'],
  ['street', 'Ulice a číslo', true], ['zip', 'PSČ'], ['city', 'Obec'],
  ['contact', 'Kontaktní osoba'], ['email', 'E-mail'], ['phone', 'Telefon']];

function editCustomer(src, isNew, onSaved) {
  var d = JSON.parse(JSON.stringify(src || {}));
  // okno se zavírá jen křížkem nebo tlačítkem Storno — klik vedle i Esc jsou schválně bez účinku
  var layer = openLayer(function () {});
  var scrim = layer.scrim;
  var dr = el('div', 'drawer');
  var head = el('header', '', '<div style="flex:1"><span class="eyebrow">Zákazník</span><h2>' +
    esc(d.name || 'Nová firma') + '</h2></div>');
  var hx = el('button', 'btn ghost', '✕'); hx.title = 'Zavřít'; hx.onclick = function () { layer.close(); }; head.appendChild(hx);
  dr.appendChild(head);
  var body = el('div', 'body');
  var form = el('div', 'formgrid');
  CUST_FIELDS.forEach(function (f) {
    var w = el('div', 'field' + (f[2] ? ' full' : ''), '<label>' + esc(f[1]) + '</label>');
    var i = el('input'); i.value = d[f[0]] || '';
    i.oninput = function () { d[f[0]] = i.value; };
    w.appendChild(i); form.appendChild(w);
  });
  body.appendChild(form);
  var ar = el('button', 'btn', '↻ Doplnit z ARES podle IČO');
  ar.onclick = function () {
    ar.disabled = true; ar.textContent = 'Hledám…';
    aresLookup(d.ico).then(function (c) {
      Object.keys(c).forEach(function (k) { if (c[k]) d[k] = c[k]; });
      layer.close(); editCustomer(d, isNew);
    }, function (e) { ar.disabled = false; ar.textContent = '↻ Doplnit z ARES podle IČO'; toast(e.message); });

  };
  body.appendChild(ar);
  dr.appendChild(body);
  var ft = el('footer');
  var ok = el('button', 'btn primary', isNew ? 'Přidat firmu' : 'Uložit');
  ok.onclick = function () {
    if (!d.name) return toast('Vyplňte název firmy.');
    var saved = d;
    if (isNew) S.dict.customers.push(d);
    else { Object.keys(d).forEach(function (k) { src[k] = d[k]; }); saved = src; }
    sortCustomers(); save(); layer.close();
    // formulář zakázky pod tímto oknem si musí seznam znovu naplnit sám
    if (onSaved) onSaved(saved); else render();
    toast(isNew ? 'Firma přidána.' : 'Firma uložena.');
  };
  var cl = el('button', 'btn', 'Storno'); cl.onclick = function () { layer.close(); };
  ft.appendChild(ok); ft.appendChild(el('span', 'spacer')); ft.appendChild(cl);
  dr.appendChild(ft);
  scrim.appendChild(dr);
}

/* Naše údaje — hlavička potvrzení objednávky. */
function companyPanel() {
  var p = panel('Naše firma', 'vypisuje se v hlavičce potvrzení objednávky');
  var form = el('div', 'formgrid');
  [['name', 'Název', true], ['ico', 'IČO'], ['dic', 'DIČ'], ['street', 'Ulice a číslo', true],
   ['zip', 'PSČ'], ['city', 'Obec'], ['phone', 'Telefon'], ['email', 'E-mail']].forEach(function (f) {
    var w = el('div', 'field' + (f[2] ? ' full' : ''), '<label>' + esc(f[1]) + '</label>');
    var i = el('input'); i.value = S.dict.company[f[0]] || '';
    i.onchange = function () { S.dict.company[f[0]] = i.value.trim(); save(); };
    w.appendChild(i); form.appendChild(w);
  });
  p.body.appendChild(form);
  return p.panel;
}

// ---------------------------------------------------------------- detail / editace
function openDrawer(o, isNew) {
  if (isNew && !o.id) { o.id = 'new-' + Date.now(); S.orders.push(o); }
  // okno se zavírá jen křížkem nebo tlačítkem Storno — klik vedle i Esc jsou schválně bez účinku,
  // ať se rozdělaná zakázka neztratí omylem
  var layer = openLayer(function () {});
  var scrim = layer.scrim;
  var dr = el('div', 'drawer');
  var d = JSON.parse(JSON.stringify(o));
  var live = S.orders.filter(function (r) { return r.id === o.id; })[0] || o;
  var head = el('header');
  head.innerHTML = '<div style="flex:1"><span class="eyebrow">' + esc(d.code || 'nová zakázka') + '</span><h2>' + esc(d.name || 'Nová zakázka') + '</h2></div>';
  var x = el('button', 'btn ghost', '✕'); x.title = 'Zavřít'; x.onclick = function () { close(); }; head.appendChild(x);
  dr.appendChild(head);

  var body = el('div', 'body');

  // hlavní výkres sestavy — nahoře, ať je hned vidět, o jakou zakázku jde
  var drawBox = el('div');
  function redrawDrawing() {
    drawBox.innerHTML = '';
    var sec = dropSection(live, 'drawing', 'Hlavní výkres sestavy', redrawDrawing);
    if (!(live.files || []).filter(function (f) { return f.kind === 'drawing'; }).length) {
      sec.appendChild(el('p', 'note', 'Stačí jeden hlavní výkres — ať je na první pohled jasné, o jakou zakázku jde.'));
    }
    drawBox.appendChild(sec);
  }
  redrawDrawing();
  body.appendChild(drawBox);

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
        if (t2) Object.keys(d).forEach(function (kk) { if (kk !== 'files' && kk !== 'slots') t2[kk] = d[kk]; });
        recalc(); save(); layer.close();
        render(); openDrawer(t2 || d, false);
      }
    };
    inp.oninput = function () { d[key] = inp.value; };
    w.appendChild(inp); form.appendChild(w); return inp;
  }
  fld('name', 'Název zakázky', 'text', null, true);

  // číslo zakázky = předčíslí ze seznamu + pořadové číslo
  var parsed = /^\s*([A-Za-zÁ-Žá-ž]{1,4})\s*-\s*(.*)$/.exec(d.code || '');
  var curPfx = parsed ? parsed[1].toUpperCase() : '';
  var curNum = parsed ? parsed[2].trim() : (d.code || '');
  var cw = el('div', 'field', '<label>Číslo zakázky</label>');
  var cb = el('div'); cb.style.cssText = 'display:flex;gap:6px';
  var ps = el('select'); ps.style.flex = '0 0 118px';
  var none = el('option', '', '—'); none.value = ''; ps.appendChild(none);
  if (curPfx && pfxCodes().indexOf(curPfx) < 0) {
    var extra = el('option', '', curPfx + ' (mimo číselník)'); extra.value = curPfx; ps.appendChild(extra);
  }
  S.dict.prefixes.forEach(function (pf) {
    var op = el('option', '', pf.code + (pf.label ? ' — ' + pf.label : ''));
    op.value = pf.code;
    if (pf.code === curPfx) op.selected = true;
    ps.appendChild(op);
  });
  if (curPfx) ps.value = curPfx;
  var ni = el('input'); ni.value = curNum; ni.placeholder = '001/26'; ni.style.flex = '1';
  function syncCode() { d.code = ps.value ? ps.value + '-' + ni.value.trim() : ni.value.trim(); }
  ps.onchange = function () { syncCode(); ps.title = pfxLabel(ps.value); };
  ni.oninput = syncCode;
  ps.title = pfxLabel(curPfx);
  cb.appendChild(ps); cb.appendChild(ni); cw.appendChild(cb); form.appendChild(cw);

  fld('qty', 'Množství', 'text');
  fld('status', 'Stav', null, S.dict.statuses.concat(['Zrušeno']));
  fld('center', 'Středisko', null, S.dict.centers);
  fld('owner', 'Zodpovídá', null, S.dict.owners);
  fld('requester', 'Požaduje', 'text');
  fld('order', 'Objednávka', 'text');

  // zákazník ze seznamu (abecedně), případně rovnou z ARES
  var kw = el('div', 'field full', '<label>Zákazník</label>');
  var kb = el('div'); kb.style.cssText = 'display:flex;gap:6px';
  var ks = el('select'); ks.style.flex = '1';
  function fillCustomers() {
    sortCustomers();
    ks.innerHTML = '';
    var n0 = el('option', '', '— nevybrán —'); n0.value = ''; ks.appendChild(n0);
    S.dict.customers.forEach(function (c) {
      var op = el('option', '', c.name + (c.city ? ', ' + c.city : ''));
      op.value = c.ico || c.name;
      if ((d.customerIco || '') === op.value) op.selected = true;
      ks.appendChild(op);
    });
  }
  fillCustomers();
  ks.onchange = function () {
    d.customerIco = ks.value;
    var c = customerByIco(ks.value);
    d.customerName = c ? c.name : '';
  };
  var kadd = el('button', 'btn', '+ ARES'); kadd.type = 'button'; kadd.title = 'Přidat firmu podle IČO';
  function useCustomer(c) {
    d.customerIco = c.ico || c.name;
    d.customerName = c.name;
    fillCustomers();
    ks.value = d.customerIco;
  }
  kadd.onclick = function () {
    askText('Přidat zákazníka z ARES', 'IČO', '', { placeholder: '8 číslic', inputMode: 'numeric', ok: 'Načíst z ARES' })
      .then(function (ico) {
        if (!ico) return;
        toast('Hledám v ARES…');
        return aresLookup(ico).then(function (c) {
          if (!customerByIco(c.ico)) { S.dict.customers.push(c); sortCustomers(); save(); }
          useCustomer(c);
          toast(c.name + ' přidán (' + c.source + ').');
        }, function (e) { aresFailed(e, ico, useCustomer); });
      });
  };
  // ruční přidání firmy rovnou od zakázky, bez oklikou přes číselníky
  var kman = el('button', 'btn', '+ ručně'); kman.type = 'button'; kman.title = 'Zadat firmu ručně';
  kman.onclick = function () { editCustomer({}, true, useCustomer); };
  kb.appendChild(ks); kb.appendChild(kadd); kb.appendChild(kman);
  kw.appendChild(kb); form.appendChild(kw);
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
  if (!isNew && (o.hours > 0 || (o.slots || []).length)) {
    var pr = el('div', 'field full');
    var parts = LANES.filter(function (l) { return (+o[l.key] || 0) > 0 || plannedH(o, l.c) > 0; }).map(function (l) {
      var pl = plannedH(o, l.c), est = +o[l.key] || 0;
      return '<b>' + l.c + '</b> ' + fmtH(pl) + ' z ' + fmtH(est) +
        (pl < est ? ' <span style="color:var(--warn)">· zbývá ' + fmtH(est - pl) + '</span>' : ' <span style="color:var(--ok)">✓</span>');
    });
    var pline = el('div', 'note', 'V plánu výroby: ' + parts.join(' &nbsp;·&nbsp; '));
    var pgo = el('button', 'btn', o.open ? 'Uložit a otevřít v plánu' : 'Otevřít v plánu');
    pgo.type = 'button'; pgo.style.marginTop = '6px';
    pgo.onclick = function () {
      if (o.open) return saveOrder(true);
      close(true); S.view = 'gantt'; S.planTab = 'board'; render();
    };
    pr.appendChild(pline); pr.appendChild(pgo); form.appendChild(pr);
  }
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

  var noteRow = el('div', 'field full', '<label>Poznámky</label>');
  var noteTa = el('textarea'); noteTa.rows = 4; noteTa.value = d.notes || '';
  noteTa.placeholder = 'Cokoli k zakázce, co se nehodí do žádného pole výše…';
  noteTa.style.cssText = 'resize:vertical;min-height:80px';
  noteTa.oninput = function () { d.notes = noteTa.value; };
  noteRow.appendChild(noteTa); form.appendChild(noteRow);

  body.appendChild(form);

  // přílohy se ukládají rovnou k zakázce, ne až s formulářem
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
  function saveOrder(toPlan) {
    if (!d.name) { toast('Vyplňte název zakázky.'); return; }
    if (isNew) d.year = +(d.dateOrder || TODAY).slice(0, 4);
    var t = S.orders.filter(function (r) { return r.id === o.id; })[0];
    // přílohy i buňky plánu se spravují jinde, kopie z okna je nesmí přepsat
    if (t) Object.keys(d).forEach(function (k) { if (k !== 'files' && k !== 'slots') t[k] = d[k]; });
    recalc(); save(); close(true);
    // nová zakázka jde rovnou do plánu výroby, kde se jí vygeneruje buňka
    if ((isNew || toPlan) && t && t.open) {
      S.view = 'gantt'; S.planTab = 'board'; S.pbFocus = t.id; pbScrollMemo = null;
      render();
      toast(isNew ? (t.hours > 0 ? 'Zakázka založena — v plánu výroby čeká na vygenerování buňky.'
                                 : 'Zakázka založena. Doplňte odhad hodin, pak ji půjde naplánovat.')
                  : 'Uloženo.');
      return;
    }
    render(); toast(isNew ? 'Zakázka založena.' : 'Změny uloženy.');
  }
  ok.onclick = function () { saveOrder(false); };
  var del = el('button', 'btn danger', 'Smazat');
  del.onclick = function () {
    askConfirm('Smazat zakázku', (o.code ? o.code + ' — ' : '') + (o.name || '') + ' bude nenávratně smazána.', 'Smazat')
      .then(function (y) {
        if (!y) return;
        S.orders = S.orders.filter(function (r) { return r.id !== o.id; });
        recalc(); save(); close(true); render(); toast('Zakázka smazána.');
      });
  };
  var conf = el('button', 'btn', '🖨 Potvrzení objednávky');
  conf.onclick = function () { orderConfirmation(d); };
  var cancel = el('button', 'btn', 'Storno');
  cancel.onclick = function () { close(); };
  ft.appendChild(ok); ft.appendChild(conf); ft.appendChild(cancel); ft.appendChild(el('span', 'spacer'));
  if (!isNew) ft.appendChild(del);
  dr.appendChild(ft);

  scrim.appendChild(dr);
  function close(saved) {
    if (isNew && !saved) S.orders = S.orders.filter(function (r) { return r.id !== o.id; });
    layer.close();
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

// ---------------------------------------------------------------- potvrzení objednávky
/* Tiskový dokument pro zákazníka — otevře se ve vlastním okně připravený k tisku
   nebo uložení do PDF přes tiskový dialog. */
function orderConfirmation(o) {
  var c = customerByIco(o.customerIco) || {};
  var f = S.dict.company || {};
  if (!f.name) toast('Doplňte údaje v Číselníky → Naše firma, budou v hlavičce.');

  function adr(x) {
    return [x.street, [x.zip, x.city].filter(Boolean).join(' ')].filter(Boolean).join('<br>');
  }
  function line(label, val) {
    return val ? '<tr><th>' + esc(label) + '</th><td>' + esc(val) + '</td></tr>' : '';
  }
  var num = o.code || '—';
  var html = '<!doctype html><html lang="cs"><head><meta charset="utf-8">' +
    '<title>Potvrzení objednávky ' + esc(num) + '</title><style>' +
    '@page{size:A4;margin:18mm 16mm}' +
    'body{font:12pt/1.5 "Segoe UI",Arial,sans-serif;color:#14191c;margin:0}' +
    '.sheet{max-width:180mm;margin:0 auto;padding:10mm}' +
    '.top{display:flex;justify-content:space-between;align-items:flex-start;gap:20mm;border-bottom:2px solid #0f4c5c;padding-bottom:6mm}' +
    '.top h1{font-size:19pt;margin:0 0 2mm;letter-spacing:-.01em;color:#0f4c5c}' +
    '.top .meta{font-size:10pt;color:#5d6672}' +
    '.who{font-size:10pt;line-height:1.45}.who b{display:block;font-size:11pt;color:#14191c}' +
    '.parties{display:flex;gap:12mm;margin:8mm 0}' +
    '.party{flex:1;border:1px solid #d7dee1;border-radius:3px;padding:4mm}' +
    '.party .lbl{font-size:8.5pt;letter-spacing:.09em;text-transform:uppercase;color:#6b7a82;margin-bottom:2mm}' +
    'table.d{width:100%;border-collapse:collapse;margin:6mm 0}' +
    'table.d th{text-align:left;width:46mm;padding:2.2mm 0;font-size:10pt;color:#5d6672;font-weight:600;vertical-align:top;border-bottom:1px solid #e6ebed}' +
    'table.d td{padding:2.2mm 0;border-bottom:1px solid #e6ebed;vertical-align:top}' +
    '.term{background:#dceaef;border-left:3px solid #0f4c5c;padding:4mm;margin:6mm 0;font-size:12pt}' +
    '.term b{font-size:14pt}' +
    '.sign{display:flex;justify-content:space-between;margin-top:16mm;font-size:10pt;color:#5d6672}' +
    '.sign div{width:60mm;border-top:1px solid #b9c1c7;padding-top:2mm;text-align:center}' +
    '.foot{margin-top:10mm;font-size:8.5pt;color:#6b7a82;border-top:1px solid #e6ebed;padding-top:3mm}' +
    '.bar{position:fixed;top:0;left:0;right:0;background:#0f4c5c;color:#fff;padding:8px 14px;font:14px/1 "Segoe UI",Arial,sans-serif;display:flex;gap:10px;align-items:center}' +
    '.bar button{font:inherit;padding:5px 12px;border:0;border-radius:4px;background:#fff;color:#0f4c5c;font-weight:600;cursor:pointer}' +
    '.bar+.sheet{margin-top:44px}' +
    '@media print{.bar{display:none}.bar+.sheet{margin-top:0}.sheet{padding:0}}' +
    '</style></head><body>' +
    '<div class="bar"><button onclick="window.print()">Vytisknout / uložit do PDF</button>' +
    '<span>Potvrzení objednávky ' + esc(num) + '</span></div>' +
    '<div class="sheet">' +
    '<div class="top"><div><h1>Potvrzení objednávky</h1>' +
    '<div class="meta">Číslo zakázky <b>' + esc(num) + '</b>' +
    (o.order ? ' &middot; vaše objednávka ' + esc(o.order) : '') +
    ' &middot; vystaveno ' + fmtDate(TODAY) + '</div></div>' +
    '<div class="who"><b>' + esc(f.name || 'Doplňte název firmy') + '</b>' + adr(f) +
    (f.ico ? '<br>IČO ' + esc(f.ico) : '') + (f.dic ? ' &middot; DIČ ' + esc(f.dic) : '') +
    (f.phone ? '<br>' + esc(f.phone) : '') + (f.email ? '<br>' + esc(f.email) : '') + '</div></div>' +

    '<div class="parties"><div class="party"><div class="lbl">Odběratel</div>' +
    (c.name ? '<b>' + esc(c.name) + '</b><br>' + adr(c) +
      (c.ico ? '<br>IČO ' + esc(c.ico) : '') + (c.dic ? ' &middot; DIČ ' + esc(c.dic) : '') +
      (c.contact ? '<br>' + esc(c.contact) : '') + (c.email ? '<br>' + esc(c.email) : '')
      : '<i>zákazník nebyl vybrán</i>') + '</div>' +
    '<div class="party"><div class="lbl">Kontakt u nás</div>' +
    (o.owner ? '<b>' + esc(o.owner) + '</b>' : '') +
    (o.requester ? '<br>požaduje: ' + esc(o.requester) : '') +
    (o.center ? '<br>středisko: ' + esc(o.center) : '') + '</div></div>' +

    '<table class="d">' +
    line('Předmět zakázky', o.name) +
    line('Množství', o.qty) +
    line('Číslo objednávky', o.order) +
    (o.dateOrder ? line('Datum objednávky', fmtDate(o.dateOrder)) : '') +
    (hTot(o) ? line('Předpokládaná pracnost', fmtH(hTot(o)) +
      (hOb(o) && hSv(o) ? ' (obrobna ' + hOb(o) + ' h, svařovna ' + hSv(o) + ' h)' : '')) : '') +
    (o.planDesign ? line('Plán — design', fmtDate(o.planDesign)) : '') +
    (o.planProd ? line('Plán — výroba', fmtDate(o.planProd)) : '') +
    (o.planAssembly ? line('Plán — montáž', fmtDate(o.planAssembly)) : '') +
    (o.planTuning ? line('Plán — ladění', fmtDate(o.planTuning)) : '') +
    '</table>' +

    '<div class="term">Potvrzený termín dodání: <b>' +
    (o.dateRequired ? fmtDate(o.dateRequired) : 'bude upřesněn') + '</b></div>' +

    '<p>Děkujeme za vaši objednávku. Tímto potvrzujeme její přijetí a výše uvedený termín dodání. ' +
    'Případné změny vám oznámíme bez zbytečného odkladu.</p>' +

    '<div class="sign"><div>Za odběratele</div><div>Za dodavatele</div></div>' +
    '<div class="foot">Vystaveno ' + fmtDate(TODAY) + ' z evidence zakázek' +
    (f.name ? ' &middot; ' + esc(f.name) : '') + '</div>' +
    '</div></body></html>';

  var w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); return; }
  var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  if (DL) {
    DL.save({ filename: 'potvrzeni-objednavky-' + (o.code || 'zakazka').replace(/[^\w-]/g, '_') + '.html', data: blob })
      .then(function () { toast('Potvrzení uloženo.'); }, function () {});
  } else {
    toast('Prohlížeč zablokoval nové okno — povolte vyskakovací okna.');
  }
}

// ---------------------------------------------------------------- export
var CSV_COLS = ['code', 'name', 'qty', 'status', 'center', 'owner', 'requester', 'order', 'dateOrder',
  'planDesign', 'planProd', 'planAssembly', 'planTuning', 'dateRequired', 'dateDelivered', 'priority', 'hoursObrobna', 'hoursSvarovna', 'customerName', 'customerIco', 'invoice', 'invoiced', 'notes', 'year'];
var CSV_HEAD = ['Č.ZAKÁZKY', 'NÁZEV ZAKÁZKY', 'MNOŽSTVÍ', 'STATUS', 'STŘEDISKO', 'ZODPOVÍDÁ', 'POŽADUJE', 'OBJEDNÁVKA', 'DATUM OBJ.',
  'PLÁN DESIGN', 'PLÁN VÝROBA', 'PLÁN MONTÁŽ', 'PLÁN LADĚNÍ', 'POŽAD. DATUM', 'DATUM DODÁNÍ', 'PRIORITA', 'HODINY OBROBNA', 'HODINY SVAŘOVNA', 'ZÁKAZNÍK', 'IČO', 'FAKTURA', 'VYFAKTUROVÁNO', 'POZNÁMKY', 'ROK'];
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
  var layer = openLayer(function () { layer.close(); });
  var scrim = layer.scrim;
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
  var cl = el('button', 'btn', 'Zavřít'); cl.onclick = function () { layer.close(); };
  ft.appendChild(dl); ft.appendChild(cp); ft.appendChild(el('span', 'spacer')); ft.appendChild(cl); dr.appendChild(ft);
  scrim.appendChild(dr);
  scrim.onclick = function (e) { if (e.target === scrim) layer.close(); };
}
/* Prohlížeč umí window.confirm i window.prompt umlčet (vložená stránka bez povolených
   dialogů) — a tlačítko pak tiše nic neudělá. Používáme proto vlastní okna. */
/* Okna se vrství: každé si drží vlastní scrim a při zavření odebere jen ten svůj.
   Přepisovat #overlay přes innerHTML nelze — okno pod ním by se překreslilo
   bez posluchačů a zůstalo viset. */
function openLayer(onEsc) {
  var ov = $('#overlay');
  var scrim = el('div', 'scrim');
  ov.appendChild(scrim);
  function key(e) {
    if (e.key !== 'Escape') return;
    if (scrim !== ov.lastElementChild) return;   // Esc patří vrchnímu oknu
    e.stopImmediatePropagation();
    e.preventDefault();
    onEsc();
  }
  document.addEventListener('keydown', key, true);
  return {
    scrim: scrim,
    close: function () {
      document.removeEventListener('keydown', key, true);
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
    }
  };
}

function modal(opts) {
  return new Promise(function (resolve) {
    var layer = openLayer(function () { done(null); });
    var scrim = layer.scrim;
    scrim.style.alignItems = 'center';
    scrim.style.justifyContent = 'center';
    var box = el('div', 'panel');
    box.style.cssText = 'width:min(460px,92vw);max-height:90vh;overflow:auto';
    box.appendChild(el('div', 'panel-head', '<h2>' + esc(opts.title) + '</h2>'));
    var body = el('div', 'panel-body');
    if (opts.text) body.appendChild(el('p', 'note', esc(opts.text)));
    var inp = null;
    if (opts.input) {
      var w = el('div', 'field', '<label>' + esc(opts.label || '') + '</label>');
      inp = el('input'); inp.value = opts.value || '';
      if (opts.placeholder) inp.placeholder = opts.placeholder;
      if (opts.inputMode) inp.inputMode = opts.inputMode;
      inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); done(inp.value); } };
      w.appendChild(inp); body.appendChild(w);
    }
    box.appendChild(body);
    var ft = el('div', 'panel-body');
    ft.style.cssText = 'display:flex;gap:8px;border-top:1px solid var(--line-soft)';
    var ok = el('button', 'btn primary', opts.ok || 'Potvrdit');
    ok.onclick = function () { done(opts.input ? (inp ? inp.value : '') : true); };
    var no = el('button', 'btn', opts.cancel || 'Zrušit');
    no.onclick = function () { done(null); };
    ft.appendChild(ok); ft.appendChild(el('span', 'spacer')); ft.appendChild(no);
    box.appendChild(ft);
    scrim.appendChild(box);
    scrim.onclick = function (e) { if (e.target === scrim) done(null); };
    var settled = false;
    function done(v) {
      if (settled) return;
      settled = true;
      layer.close();
      resolve(v);
    }
    if (inp) setTimeout(function () { inp.focus(); inp.select(); }, 30);
  });
}
function askConfirm(title, text, ok) {
  return modal({ title: title, text: text, ok: ok || 'Potvrdit' }).then(function (v) { return v === true; });
}
function askText(title, label, value, opts) {
  return modal(Object.assign({ title: title, label: label, value: value || '', input: true, ok: 'Pokračovat' }, opts || {}))
    .then(function (v) { return v == null ? null : String(v).trim(); });
}

function toast(msg) {
  Array.prototype.forEach.call(document.querySelectorAll('.toast'), function (x) { x.remove(); });
  var t = el('div', 'toast', esc(msg));
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 3200);
}

// ---------------------------------------------------------------- start
load();
/* Aplikace naservírovaná vlastním serverem si adresu API nastaví sama. */
(function autoServer() {
  if (S.server.url) return;
  if (!/^https?:$/.test(location.protocol)) return;
  var api = location.origin + '/api/zakazky';
  fetch(api, { method: 'GET' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !Array.isArray(d.orders)) return;
      S.server.url = api;
      S.server.ares = S.server.ares || (location.origin + '/api/ares');
      S.orders = d.orders;
      if (d.dict) S.dict = d.dict;
      S.rev = d.rev == null ? null : d.rev;
      migrateDict(); recalc(); cache(); render(); startPolling();
      toast('Připojeno k serveru — ' + d.orders.length.toLocaleString('cs') + ' zakázek.');
    })
    .catch(function () {});
})();

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
