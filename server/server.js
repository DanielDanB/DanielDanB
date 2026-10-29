/* Evidence zakázek — server pro společnou práci více lidí (bez závislostí, stačí Node.js).
   • podává aplikaci na adrese http://<počítač>:<port> (port si server vybere sám)
   • drží data na jednom místě (server/data/state.json) a denně je zálohuje
   • změny se ukládají okamžitě po zakázkách a hned se rozešlou ostatním (Server-Sent Events)
   • zakázka, kterou má někdo otevřenou, je zamčená pro ostatní, dokud ji nezavře */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'zalohy');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const APP_FILE = process.env.APP_FILE || path.join(__dirname, '..', 'prehled-zakazek.html');
const LOCK_GRACE_MS = 15000;          // po ztrátě spojení se zámky uvolní až po této době (výpadek wifi, obnovení stránky)
const KEEP_BACKUPS = 60;

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const log = (...a) => console.log(new Date().toLocaleTimeString('cs-CZ'), ...a);
/* Bezpečnost: slovníky podle jmen jsou bez prototypu a klíče __proto__ / constructor / prototype se odmítají,
   aby se přes podvržené jméno nebo cestu v číselníku nedalo změnit chování serveru (prototype pollution). */
const NP = o => Object.assign(Object.create(null), o || {});
const BADKEY = k => k === '__proto__' || k === 'constructor' || k === 'prototype';
function cleanName(n) { const v = String(n == null ? '' : n).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40); return BADKEY(v) ? '' : v; }

/* ---------------------------------------------------------------- data */
let dict = null, initialized = false, rev = 0;
const orders = new Map();             // id -> zakázka (zachovává pořadí)

function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    (s.orders || []).forEach(o => orders.set(String(o.id), o));
    dict = s.dict || null; rev = s.rev || 0; initialized = !!s.initialized;
    log('Data načtena:', orders.size, 'zakázek, verze', rev);
  } catch (e) {
    if (e.code !== 'ENOENT') log('POZOR: data se nepodařilo načíst:', e.message);
  }
}
let persistTimer = null, lastBackupDay = '';
function persistSoon() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 700);
}
function persistNow() {
  persistTimer = null;
  const json = JSON.stringify({ initialized, rev, dict, orders: Array.from(orders.values()) });
  const tmp = STATE_FILE + '.tmp';
  try {
    fs.writeFileSync(tmp, json);
    fs.renameSync(tmp, STATE_FILE);
  } catch (e) { log('POZOR: uložení dat selhalo:', e.message); }
}
function setPath(root, p, v, del) {
  if (!p.every(k => (typeof k === 'string' || typeof k === 'number') && !BADKEY(String(k)))) return false;
  let o = root;
  for (let i = 0; i < p.length - 1; i++) {
    if (o[p[i]] == null || typeof o[p[i]] !== 'object') o[p[i]] = {};
    o = o[p[i]];
  }
  if (del) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = v;
  return true;
}

/* ---------------------------------------------------------------- chat (společný i soukromé zprávy, ukládá se do server/data/chat.json) */
const CHAT_FILE = path.join(DATA_DIR, 'chat.json');
const chat = { seq: 0, epoch: 0, names: [], msgs: [], cleared: NP(), reads: NP() };   // reads: { jméno: { klíč konverzace: čas poslední přečtené zprávy } } — pro „přečteno“   // cleared: { jméno: { konverzace: čas } } — „smazat chat“ platí jen pro toho, kdo ho smazal       // msgs: { id, seq, ts, from, to ('' = všichni), text, edited, del }
(function loadChat() {
  try { const c = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8')); chat.seq = c.seq || 0; chat.epoch = c.epoch || 0; chat.cleared = NP(c.cleared); chat.reads = NP(c.reads); Object.keys(chat.cleared).forEach(k => { chat.cleared[k] = NP(chat.cleared[k]); }); Object.keys(chat.reads).forEach(k => { chat.reads[k] = NP(chat.reads[k]); }); chat.names = c.names || []; chat.msgs = c.msgs || []; log('Chat načten:', chat.msgs.length, 'zpráv'); }
  catch (e) { if (e.code !== 'ENOENT') log('POZOR: chat se nepodařilo načíst:', e.message); }
})();
let chatTimer = null, readRev = 1;
function chatSoon() { clearTimeout(chatTimer); chatTimer = setTimeout(chatSave, 500); }
function chatSave() {
  chatTimer = null;
  try {
    const json = JSON.stringify(chat), tmp = CHAT_FILE + '.tmp';
    fs.writeFileSync(tmp, json); fs.renameSync(tmp, CHAT_FILE);
    const day = new Date().toISOString().slice(0, 10), bf = path.join(BACKUP_DIR, 'chat-' + day + '.json');
    if (!fs.existsSync(bf)) {
      fs.writeFileSync(bf, json);
      const old = fs.readdirSync(BACKUP_DIR).filter(f => /^chat-.*\.json$/.test(f)).sort();
      while (old.length > KEEP_BACKUPS) fs.unlinkSync(path.join(BACKUP_DIR, old.shift()));
    }
  } catch (e) { log('POZOR: uložení chatu selhalo:', e.message); }
}
function chatSeen(name) { if (name && !chat.names.includes(name)) { chat.names.push(name); chatSoon(); } }
const chatVisible = (m, name) => m.order || (m.rcpt && m.rcpt.length ? m.from === name || m.rcpt.includes(name) : (!m.to || m.from === name || m.to === name));   // rcpt = zpráva ve společné místnosti jen pro vybrané
const chatConvOf = (m, viewer) => m.order ? 'o:' + m.order : m.to ? (m.from === viewer ? m.to : m.from) : '';          // do které konverzace zpráva patří z pohledu daného uživatele
const chatHidden = (m, name) => { const c = chat.cleared[name]; return !!(c && c[chatConvOf(m, name)] >= m.ts); };     // uživatel si chat smazal (jen u sebe)
const chatSees = (m, name) => chatVisible(m, name) && !chatHidden(m, name);
function chatPush(m) { clients.forEach(c => { if (!c.closedAt && chatSees(m, c.name)) send(c.res, 'chat', { msg: m }); }); }
function chatPurge() {                                         // zprávy, které si smazali všichni, kdo je mohli vidět, se smažou i z disku
  const viewers = m => m.order || (!m.to && !(m.rcpt && m.rcpt.length)) ? chat.names : m.rcpt && m.rcpt.length ? [m.from].concat(m.rcpt) : [m.from, m.to];
  const before = chat.msgs.length;
  chat.msgs = chat.msgs.filter(m => !viewers(m).every(v => chatHidden(m, v)));
  return before - chat.msgs.length;
}

/* ---------------------------------------------------------------- automatické zálohy dat zakázek
   Každých N hodin (výchozí 24) se do server/data/zalohy uloží celý stav (state-RRRR-MM-DD_HHMMSS.json); drží se posledních M záloh.
   Nastavení je v server/data/zalohy-nastaveni.json a mění se v aplikaci (Číselníky → Server a data). Zálohy jde stáhnout i obnovit. */
const BK_SET_FILE = path.join(DATA_DIR, 'zalohy-nastaveni.json');
const bkSet = { hours: 24, keep: 30 };
(function () { try { const c = JSON.parse(fs.readFileSync(BK_SET_FILE, 'utf8')); if (c.hours > 0) bkSet.hours = c.hours; if (c.keep > 0) bkSet.keep = c.keep; } catch (e) {} })();
const bkName = d => 'state-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0') + '.json';
function bkList() {
  return fs.readdirSync(BACKUP_DIR).filter(f => /^state-[\w.-]+\.json$/.test(f)).map(f => {
    const st = fs.statSync(path.join(BACKUP_DIR, f)); return { name: f, size: st.size, time: st.mtimeMs };
  }).sort((a, b) => b.time - a.time);
}
function bkMake(why) {
  if (!initialized) return null;
  const f = bkName(new Date());
  fs.writeFileSync(path.join(BACKUP_DIR, f), JSON.stringify({ initialized, rev, dict, orders: Array.from(orders.values()) }));
  const all = bkList(); while (all.length > bkSet.keep) { try { fs.unlinkSync(path.join(BACKUP_DIR, all.pop().name)); } catch (e) { break; } }
  log('Záloha dat:', f, '(' + why + ')');
  return f;
}
function bkDue() { try { const l = bkList(); if (!l.length || Date.now() - l[0].time >= bkSet.hours * 3600e3) bkMake('plánovaná'); } catch (e) { log('POZOR: záloha selhala:', e.message); } }
setInterval(bkDue, 5 * 60 * 1000); setTimeout(bkDue, 15000);

/* ---------------------------------------------------------------- profily uživatelů (hesla, správci, přihlášení)
   server/data/profily.json: users[jméno] = { salt, hash, admin, pwAt }, sessions[sha256(token)] = { name, ts }.
   Heslo je povinné: bez přihlášení jménem a heslem server nevydá žádná data. Při prvním přihlášení si uživatel heslo nastaví sám. Heslo se ukládá jen jako scrypt hash.
   Po přihlášení heslem dostane počítač token (pamatuje se v prohlížeči), takže se heslo nezadává při každém spuštění.
   Heslo si nastavuje jen sám uživatel. Správce (musí mít heslo) smí ostatním odebrat zapomenuté heslo, určovat správce a mazat uživatele; dokud žádný správce není, smí to kdokoliv.
   Zapomenuté heslo správce: smazat soubor server/data/profily.json a server restartovat (hesla se tím všem zruší). */
const PROF_FILE = path.join(DATA_DIR, 'profily.json');
const prof = { users: NP(), sessions: NP() };
(function loadProf() {
  try { const c = JSON.parse(fs.readFileSync(PROF_FILE, 'utf8')); prof.users = NP(c.users); prof.sessions = NP(c.sessions); Object.keys(prof.users).forEach(k => { if (BADKEY(k)) delete prof.users[k]; }); }
  catch (e) { if (e.code !== 'ENOENT') log('POZOR: profily se nepodařilo načíst:', e.message); }
})();
let profTimer = null;
function profSoon() { clearTimeout(profTimer); profTimer = setTimeout(profSave, 300); }
function profSave() {
  profTimer = null;
  try { const tmp = PROF_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(prof)); fs.renameSync(tmp, PROF_FILE); }
  catch (e) { log('POZOR: uložení profilů selhalo:', e.message); }
}
const sha = x => crypto.createHash('sha256').update(String(x)).digest('hex');
const pwHash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const hasPw = n => !!(prof.users[n] && prof.users[n].hash);
function pwOk(n, pw) {
  const u = prof.users[n]; if (!u || !u.hash) return true;
  try { return crypto.timingSafeEqual(Buffer.from(pwHash(pw || '', u.salt), 'hex'), Buffer.from(u.hash, 'hex')); } catch (e) { return false; }
}
function newSession(n) { const t = crypto.randomBytes(24).toString('hex'); prof.sessions[sha(t)] = { name: n, ts: Date.now() }; profSoon(); return t; }
function dropSessions(n) { Object.keys(prof.sessions).forEach(k => { if (prof.sessions[k].name === n) delete prof.sessions[k]; }); profSoon(); }
const SESS_MAX_IDLE = 30 * 24 * 3600e3;                         // přihlášení na počítači vyprší po 30 dnech nečinnosti
function sessName(t) {                                           // jméno přihlášeného uživatele podle tokenu (nebo '')
  if (!t) return '';
  const k = sha(t), s = prof.sessions[k];
  if (!s || !hasPw(s.name)) return '';
  if (Date.now() - (s.ts || 0) > SESS_MAX_IDLE) { delete prof.sessions[k]; profSoon(); return ''; }
  if (Date.now() - (s.ts || 0) > 3600e3) { s.ts = Date.now(); profSoon(); }
  return s.name;
}
function sessOk(n, t) { const w = sessName(t); return !!w && w === n; }   // heslo je povinné — bez platného přihlášení nic
const findUser = n => { const l = String(n || '').trim().toLowerCase(); return Object.keys(prof.users).concat(chat.names).find(x => x.toLowerCase() === l) || ''; };
const elev = new Map();                                          // odemčení „Server a data“ heslem správce: sha(token) -> { name, until }
function elevOk(t) { if (!t) return ''; const k = sha(t), e = elev.get(k); if (!e || e.until < Date.now() || !isAdmin(e.name)) { elev.delete(k); return ''; } e.until = Date.now() + 30 * 60e3; return e.name; }
const isAdmin = n => !!(n && prof.users[n] && prof.users[n].admin && hasPw(n));   // „Server a data“ (zálohy) jen pro správce
const adminExists = () => Object.keys(prof.users).some(n => prof.users[n].admin && hasPw(n));
function adminAllowed(n, t) { return !adminExists() || (!!(prof.users[n] && prof.users[n].admin) && hasPw(n) && sessOk(n, t)); }
function setPw(n, pw) {
  const u = prof.users[n] = prof.users[n] || {};
  if (!pw) { delete u.salt; delete u.hash; delete u.pwAt; u.admin = false; u.invited = true; }          // odebrané heslo: uživatel si při příštím přihlášení nastaví nové
  else { u.salt = crypto.randomBytes(16).toString('hex'); u.hash = pwHash(pw, u.salt); u.pwAt = Date.now(); delete u.invited; }
  dropSessions(n); profSoon();
}
const fails = NP();                                              // jméno -> { n, until } — po 5 chybných heslech minutová pauza
function failLocked(n) { const f = fails[n]; return !!(f && f.until > Date.now()); }
function failHit(n) { const f = fails[n] = fails[n] || { n: 0, until: 0 }; if (++f.n >= 5) { f.n = 0; f.until = Date.now() + 60000; } }
/* Nový účet si může založit (nastavit první heslo) jen uživatel, kterého přidal správce. Dokud žádný správce není, smí kdokoliv (první spuštění). */
const canSetup = n => !adminExists() || !!(prof.users[n] && prof.users[n].invited);
/* Omezení pokusů podle počítače (IP): po 20 chybách za 15 minut se z něj 15 minut nedá přihlašovat — proti hádání hesel. */
const ipFails = new Map();
const ipOf = req => String((req.socket && req.socket.remoteAddress) || '').replace(/^::ffff:/, '');
function ipLocked(ip) { const f = ipFails.get(ip); if (!f) return false; if (f.until && f.until > Date.now()) return true; if (f.since < Date.now() - 15 * 60e3) ipFails.delete(ip); return false; }
function ipHit(ip) { let f = ipFails.get(ip); if (!f || f.since < Date.now() - 15 * 60e3) { f = { n: 0, since: Date.now(), until: 0 }; ipFails.set(ip, f); } if (++f.n >= 20) { f.until = Date.now() + 15 * 60e3; log('POZOR: z počítače', ip, 'přišlo příliš mnoho chybných hesel — přihlašování z něj je na 15 minut zablokované.'); } }
function profList() {
  const online = new Set(); clients.forEach(c => { if (!c.closedAt) online.add(c.name); });
  const names = Array.from(new Set(chat.names.concat(Object.keys(prof.users)))).sort((a, b) => a.localeCompare(b, 'cs'));
  return names.map(n => ({ name: n, online: online.has(n), pw: hasPw(n), invited: !hasPw(n) && !!(prof.users[n] && prof.users[n].invited), admin: !!(prof.users[n] && prof.users[n].admin && hasPw(n)) }));
}

/* ---------------------------------------------------------------- klienti a zámky */
const clients = new Map();            // clientId -> { res, name, closedAt }
const locks = new Map();              // orderId  -> { client, name, since }

function usersList() {
  const out = [];
  clients.forEach((c, id) => { if (!c.closedAt) out.push({ client: id, name: c.name }); });
  return out;
}
function locksObj() { const o = {}; locks.forEach((l, id) => { o[id] = { client: l.client, by: l.name, since: l.since }; }); return o; }
function send(res, event, data) { try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); } catch (e) {} }
function broadcast(event, data) { clients.forEach(c => { if (!c.closedAt) send(c.res, event, data); }); }
function broadcastPresence() { broadcast('users', { users: usersList() }); }
function releaseClientLocks(clientId) {
  let changed = false;
  locks.forEach((l, id) => { if (l.client === clientId) { locks.delete(id); changed = true; } });
  if (changed) broadcast('locks', { locks: locksObj() });
}

function applyOps(clientId, body) {
  const c = clients.get(clientId);
  const name = (c && c.name) || String(body.me || body.name || '?');
  const acc = { orders: {}, deleted: [], dict: [] }, rejected = [];
  Object.keys(body.orders || {}).forEach(id => {
    const l = locks.get(id);
    if (l && l.client !== clientId) { rejected.push({ id, by: l.name, order: orders.get(id) || null }); return; }
    const o = body.orders[id]; o.id = o.id == null ? id : o.id;
    orders.set(id, o); acc.orders[id] = o;
  });
  (body.deleted || []).forEach(id => {
    id = String(id);
    const l = locks.get(id);
    if (l && l.client !== clientId) { rejected.push({ id, by: l.name, order: orders.get(id) || null }); return; }
    if (orders.delete(id)) acc.deleted.push(id);
  });
  if ((body.dict || []).length) {
    if (!dict) dict = {};
    body.dict.forEach(op => { if (op && Array.isArray(op.p) && op.p.length && setPath(dict, op.p, op.v, !!op.del)) acc.dict.push(op); });
  }
  if (Object.keys(acc.orders).length || acc.deleted.length || acc.dict.length) {
    rev++;
    persistSoon();
    broadcast('ops', Object.assign({ rev, client: clientId, by: name }, acc));
  }
  return { rev, rejected };
}

/* ---------------------------------------------------------------- HTTP */
function reqToken(req, url, b) { return String(req.headers['x-token'] || url.searchParams.get('token') || (b && b.token) || ''); }
function deny(res) { return json(res, 401, { ok: false, auth: true, chyba: 'Přihlášení vypršelo — obnovte stránku (F5) a přihlaste se.' }); }
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > limit) { reject(new Error('příliš velký požadavek')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
/* Bezpečnostní hlavičky: stránku nejde vložit do cizího webu, prohlížeč neodešle adresu jinam a aplikace smí posílat data
   jen na tento server (a do veřejného registru ARES) — ani případný podvržený kód by data nemohl odeslat ven. */
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer' };
const CSP = ["default-src 'self'", "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:", "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' data: https://fonts.gstatic.com", "img-src 'self' data: blob:",
  "media-src 'self' data: blob:", "connect-src 'self' data: blob: https://ares.gov.cz https://r.jina.ai", "frame-src 'self' blob: data:",
  "object-src 'self' blob: data:", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"].join('; ');
function json(res, code, obj) {
  const b = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, SEC_HEADERS));
  res.end(b);
}

/* Stránka aplikace: původní data z Excelu vložená v HTML se po prvním spuštění serveru už neposílají
   (data jsou na serveru a vydají se jen přihlášenému uživateli). */
let htmlCache = { mtime: 0, init: null, body: null };
function appHtml() {
  const st = fs.statSync(APP_FILE);
  if (htmlCache.body && htmlCache.mtime === +st.mtimeMs && htmlCache.init === initialized) return htmlCache.body;
  let h = fs.readFileSync(APP_FILE, 'utf8');
  if (initialized) h = h.replace(/(<script id="seed" type="application\/json">)[\s\S]*?(<\/script>)/, '$1[]$2');
  htmlCache = { mtime: +st.mtimeMs, init: initialized, body: Buffer.from(h, 'utf8') };
  return htmlCache.body;
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html' || p === '/prehled-zakazek.html')) {
      let html;
      try { html = appHtml(); } catch (e) { res.writeHead(500); return res.end('Soubor aplikace nenalezen: ' + APP_FILE); }
      res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': CSP }, SEC_HEADERS));
      return res.end(html);
    }
    // všechna data a změny jen pro přihlášené (heslem); veřejná je jen stránka, knihovny /vendor a přihlášení
    const PUBLIC = p === '/api/live/profiles' || p.startsWith('/api/live/auth/') || p === '/api/live/unlock';
    let ME = '';
    if (p.startsWith('/api/live/') && !PUBLIC) { ME = sessName(reqToken(req, url)); if (!ME) return deny(res); }
    if (req.method === 'GET' && p === '/api/live/state') {
      return json(res, 200, { initialized, rev, dict, orders: Array.from(orders.values()), locks: locksObj(), users: usersList() });
    }
    if (req.method === 'POST' && p === '/api/live/init') {
      const b = await readBody(req, 300 * 1024 * 1024);
      if (!initialized && Array.isArray(b.orders)) {                 // první spuštění: data nahraje první klient
        orders.clear(); b.orders.forEach(o => orders.set(String(o.id), o));
        dict = b.dict || null; initialized = true; rev++; persistNow();
        log('Server inicializován:', orders.size, 'zakázek');
      }
      return json(res, 200, { ok: true, initialized, rev });
    }
    if (req.method === 'POST' && p === '/api/live/ops') {
      const b = await readBody(req, 300 * 1024 * 1024);
      b.me = ME; return json(res, 200, applyOps(String(b.client || ''), b));
    }
    if (req.method === 'POST' && (p === '/api/live/lock' || p === '/api/live/unlock')) {
      const b = await readBody(req, 1024 * 1024);
      if (!ME) { ME = sessName(reqToken(req, url, b)); if (!ME) return deny(res); }
      const id = String(b.id), client = String(b.client || ''), c = clients.get(client);
      const cur = locks.get(id);
      if (p === '/api/live/lock') {
        if (cur && cur.client !== client) {
          const holder = clients.get(cur.client);
          if (holder) return json(res, 409, { ok: false, by: cur.name });
          locks.delete(id);
        }
        locks.set(id, { client, name: (c && c.name) || ME, since: Date.now() });
        broadcast('locks', { locks: locksObj() });
        return json(res, 200, { ok: true });
      }
      if (cur && cur.client === client) { locks.delete(id); broadcast('locks', { locks: locksObj() }); }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'GET' && p.startsWith('/vendor/')) {                         // knihovny pro čtení PDF (pdf.js, tesseract.js) — lokálně, bez internetu
      const rel = decodeURIComponent(p.slice(8));
      const fp = path.resolve(path.join(__dirname, 'vendor', rel));
      if (!fp.startsWith(path.join(__dirname, 'vendor') + path.sep) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) { res.writeHead(404); return res.end('Nenalezeno'); }
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, { 'Content-Type': ext === '.js' ? 'text/javascript; charset=utf-8' : ext === '.wasm' ? 'application/wasm' : 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' });
      return fs.createReadStream(fp).pipe(res);
    }
    if (p.startsWith('/api/live/backups')) {
      const act = p.slice('/api/live/backups'.length).replace(/^\//, '');
      const ADM = elevOk(String(req.headers['x-admin'] || url.searchParams.get('admin') || ''));
      if (!ADM) return json(res, 403, { ok: false, locked: true, chyba: adminExists() ? 'Tato část je chráněná heslem správce.' : 'Nejdřív je potřeba určit správce (Profil → Správa uživatelů).' });
      if (req.method === 'GET' && act === '') {
        let list = []; try { list = bkList(); } catch (e) {}
        return json(res, 200, { ok: true, settings: bkSet, list, admin: adminExists(), next: list.length ? list[0].time + bkSet.hours * 3600e3 : Date.now() });
      }
      if (req.method === 'GET' && act === 'download') {
        const f = String(url.searchParams.get('name') || '');
        if (!/^state-[\w.-]+\.json$/.test(f) || !fs.existsSync(path.join(BACKUP_DIR, f))) { res.writeHead(404); return res.end('Nenalezeno'); }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="' + f + '"' });
        return fs.createReadStream(path.join(BACKUP_DIR, f)).pipe(res);
      }
      if (req.method === 'POST') {
        const b = await readBody(req, 64 * 1024), me = ME + (ADM !== ME ? ' (heslem správce ' + ADM + ')' : '');

        if (act === 'settings') {
          const h = +b.hours, k = +b.keep;
          if (!(h >= 1 && h <= 24 * 30) || !(k >= 3 && k <= 365)) return json(res, 400, { ok: false, chyba: 'Neplatné nastavení.' });
          bkSet.hours = h; bkSet.keep = k; try { fs.writeFileSync(BK_SET_FILE, JSON.stringify(bkSet)); } catch (e) {}
          log('Zálohy:', me, 'nastavil každých', h, 'h, držet', k);
          return json(res, 200, { ok: true, settings: bkSet });
        }
        if (act === 'now') { const f = bkMake('ručně — ' + me); return json(res, f ? 200 : 400, f ? { ok: true, name: f } : { ok: false, chyba: 'Server ještě nemá data.' }); }
        if (act === 'restore') {
          const f = String(b.file || '');
          if (!/^state-[\w.-]+\.json$/.test(f) || !fs.existsSync(path.join(BACKUP_DIR, f))) return json(res, 404, { ok: false, chyba: 'Záloha nenalezena.' });
          let d; try { d = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, f), 'utf8')); } catch (e) { return json(res, 400, { ok: false, chyba: 'Záloha je poškozená.' }); }
          if (!Array.isArray(d.orders)) return json(res, 400, { ok: false, chyba: 'Záloha nemá zakázky.' });
          bkMake('před obnovou ze ' + f);                                      // pojistka: současný stav se uloží, kdyby obnova nebyla ta pravá
          orders.clear(); d.orders.forEach(o => orders.set(String(o.id), o)); dict = d.dict || dict; rev += 1; locks.clear();
          persistNow(); log('Obnova dat ze zálohy', f, 'provedl', me, '(' + orders.size + ' zakázek)');
          broadcast('reload', { why: 'restore', by: me });
          return json(res, 200, { ok: true, count: orders.size });
        }
      }
      return json(res, 404, { ok: false, chyba: 'neznámá akce' });
    }
    if (req.method === 'GET' && p === '/api/live/profiles') {
      if (!sessName(reqToken(req, url))) return json(res, 200, { ok: true, admin: adminExists(), users: [] });   // seznam uživatelů jen přihlášeným
      return json(res, 200, { ok: true, admin: adminExists(), users: profList() });
    }
    if (req.method === 'POST' && p.startsWith('/api/live/auth/')) {
      const b = await readBody(req, 64 * 1024), name = cleanName(b.name), act = p.slice('/api/live/auth/'.length), ip = ipOf(req);
      if (!name) return json(res, 400, { ok: false, chyba: 'chybí jméno' });
      const NOACC = n => json(res, 200, { ok: false, chyba: 'Uživatel „' + n + '“ zatím nemá přístup. Požádejte správce, aby vás přidal (Profil → Správa uživatelů → Přidat uživatele).' });
      if ((act === 'login' || act === 'setup' || act === 'elevate' || act === 'password') && ipLocked(ip)) return json(res, 429, { ok: false, chyba: 'Příliš mnoho chybných pokusů z tohoto počítače. Zkuste to za 15 minut.' });
      if (act === 'login') {
        const real = findUser(name) || name;
        if (!hasPw(real)) {                                                                           // první přihlášení: heslo si nastaví jen uživatel přidaný správcem
          if (!canSetup(real)) { ipHit(ip); log('Přihlášení: neznámý uživatel', real, 'z', ip); return NOACC(real); }
          return json(res, 200, { ok: false, needSetup: true, name: real });
        }
        if (failLocked(real)) return json(res, 429, { ok: false, chyba: 'Příliš mnoho pokusů. Zkuste to za minutu.' });
        if (!pwOk(real, String(b.password || ''))) { failHit(real); ipHit(ip); log('Přihlášení: chybné heslo pro', real, 'z', ip); return json(res, 200, { ok: false, chyba: 'Nesprávné jméno nebo heslo.' }); }
        delete fails[real]; log('Přihlášení:', real, 'z', ip);
        return json(res, 200, { ok: true, name: real, token: newSession(real), admin: !!prof.users[real].admin });
      }
      if (act === 'setup') {                                                             // první přihlášení: nastavení hesla (jen pro uživatele, který ho ještě nemá)
        const real = findUser(name) || name, pw = String(b.password || '');
        if (hasPw(real)) return json(res, 403, { ok: false, chyba: 'Tento uživatel už heslo má — přihlaste se jím.' });
        if (!canSetup(real)) { ipHit(ip); return NOACC(real); }
        if (pw.length < 6) return json(res, 400, { ok: false, chyba: 'Heslo musí mít aspoň 6 znaků.' });
        setPw(real, pw); log('Profil:', real, 'si při prvním přihlášení nastavil heslo (z', ip + ')');
        return json(res, 200, { ok: true, name: real, token: newSession(real), admin: false });
      }
      if (act === 'elevate') {                                                           // odemknout „Server a data“: jméno a heslo správce (přihlášený uživatel)
        if (!sessName(String(b.token || ''))) return json(res, 401, { ok: false, chyba: 'Nejste přihlášen.' });
        if (!adminExists()) return json(res, 400, { ok: false, chyba: 'Zatím není určen žádný správce (Profil → Správa uživatelů).' });
        const an = findUser(String(b.admin || '')) || String(b.admin || '');
        if (failLocked('adm:' + an)) return json(res, 429, { ok: false, chyba: 'Příliš mnoho pokusů. Zkuste to za minutu.' });
        if (!isAdmin(an) || !pwOk(an, String(b.password || ''))) { failHit('adm:' + an); ipHit(ip); log('Server a data: neúspěšné odemčení —', name, 'zkusil správce', an); return json(res, 200, { ok: false, chyba: 'Nesprávné jméno nebo heslo správce.' }); }
        delete fails['adm:' + an];
        const t = crypto.randomBytes(24).toString('hex'); elev.set(sha(t), { name: an, until: Date.now() + 30 * 60e3 });
        log('Server a data: odemčeno heslem správce', an, '(uživatel', name + ')');
        return json(res, 200, { ok: true, adminToken: t, admin: an });
      }
      if (act === 'logout') { const t = String(b.token || ''); if (t) { delete prof.sessions[sha(t)]; profSoon(); } return json(res, 200, { ok: true }); }
      if (act === 'check') { const w = sessName(String(b.token || '')); return json(res, 200, { ok: !!w, name: w }); }
      if (act === 'password') {                                                          // jen sám sobě: nastavit / změnit / odebrat (prázdné heslo)
        const pw = String(b.password || '');
        if (sessName(String(b.token || '')) !== name) return json(res, 403, { ok: false, chyba: 'Heslo si může změnit jen přihlášený uživatel sám sobě.' });
        if (pw.length < 6) return json(res, 400, { ok: false, chyba: 'Heslo musí mít aspoň 6 znaků (bez hesla se přihlásit nejde).' });
        if (hasPw(name)) {
          if (failLocked(name)) return json(res, 429, { ok: false, chyba: 'Příliš mnoho pokusů. Zkuste to za minutu.' });
          if (!pwOk(name, String(b.current || ''))) { failHit(name); ipHit(ip); return json(res, 200, { ok: false, chyba: 'Současné heslo není správné.' }); }
        }
        const wasAdmin = !!(prof.users[name] && prof.users[name].admin);
        setPw(name, pw);
        if (pw && wasAdmin) prof.users[name].admin = true;                               // změna hesla roli správce nemění
        log('Profil:', name, pw ? 'nastavil/změnil heslo' : 'odebral heslo');
        return json(res, 200, { ok: true, token: pw ? newSession(name) : '' });
      }
      if (act === 'admin') {                                                             // správa ostatních uživatelů (heslo jim nastavit nejde — jen odebrat zapomenuté, určit správce)
        if (!adminAllowed(name, String(b.token || ''))) return json(res, 403, { ok: false, chyba: 'Tuto volbu mohou použít jen správci.' });
        const target = cleanName(b.target), what = String(b.action || '');
        if (!target) return json(res, 400, { ok: false, chyba: 'chybí uživatel' });
        if (what === 'adduser') {                                                        // povolit první přihlášení (uživatel si pak sám nastaví heslo)
          const real = findUser(target) || target;
          if (hasPw(real)) return json(res, 400, { ok: false, chyba: 'Uživatel „' + real + '“ už přístup má.' });
          (prof.users[real] = prof.users[real] || {}).invited = true; profSoon();
          log('Profil:', name, 'přidal uživatele', real);
        } else if (what === 'rmpw') {
          setPw(target, ''); log('Profil:', name, 'odebral heslo uživateli', target);
        } else if (what === 'setadmin') {
          if (b.admin && !hasPw(target)) return json(res, 400, { ok: false, chyba: 'Správce musí mít heslo.' });
          if (!b.admin && target === name && adminExists() && Object.keys(prof.users).filter(n => prof.users[n].admin && hasPw(n)).length <= 1) return json(res, 400, { ok: false, chyba: 'Poslední správce roli odebrat nemůže.' });
          (prof.users[target] = prof.users[target] || {}).admin = !!b.admin; profSoon();
          log('Profil:', name, b.admin ? 'určil správcem' : 'odebral roli správce', target);
        } else return json(res, 400, { ok: false, chyba: 'neznámá akce' });
        return json(res, 200, { ok: true, users: profList(), admin: adminExists() });
      }
      return json(res, 404, { ok: false, chyba: 'neznámá akce' });
    }
    if (req.method === 'GET' && p === '/api/live/chat') {
      const name = ME, since = +url.searchParams.get('since') || 0;
      const online = new Set(usersList().map(u => u.name));
      return json(res, 200, { seq: chat.seq, epoch: chat.epoch, readRev, reads: (+url.searchParams.get('rr') === readRev ? undefined : chat.reads), people: chat.names.map(n => ({ name: n, online: online.has(n) })),
        msgs: chat.msgs.filter(m => m.seq > since && chatSees(m, name)) });
    }
    if (req.method === 'POST' && p === '/api/live/chat/read') {
      const b = await readBody(req, 1024 * 1024);
      const me = ME, key = String(b.key || '').slice(0, 200), ts = +b.ts || 0;
      if (!me || !ts) return json(res, 400, { ok: false, chyba: 'chybí údaje' });
      const r = chat.reads[me] = chat.reads[me] || NP();
      if (!(r[key] >= ts)) { r[key] = ts; readRev++; chatSoon(); broadcast('chatread', { name: me, key, ts, readRev }); }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/live/chat/clear') {
      const b = await readBody(req, 1024 * 1024);
      const conv = String(b.conv || ''), me = cleanName(b.name);
      if (!me) return json(res, 400, { ok: false, chyba: 'neznámý uživatel' });
      if (!sessOk(me, String(b.token || ''))) return json(res, 401, { ok: false, chyba: 'Přihlášení vypršelo — obnovte stránku (F5).' });
      // smazání platí jen pro toho, kdo ho provedl: ostatním konverzace zůstává a každý si ji maže zvlášť
      const n = chat.msgs.filter(m => chatSees(m, me) && chatConvOf(m, me) === conv).length;
      const now = Date.now();
      (chat.cleared[me] = chat.cleared[me] || NP())[conv] = now;
      const purged = chatPurge();
      chatSoon();
      log('Chat: ' + me + ' si smazal konverzaci', conv ? '„' + conv + '“' : 'Všichni', '(jeho zpráv skryto:', n + (purged ? ', z disku smazáno ' + purged : '') + ')');
      return json(res, 200, { ok: true, removed: n });
    }
    if (req.method === 'POST' && p === '/api/live/chat/user-delete') {
      const b = await readBody(req, 1024 * 1024);
      const target = cleanName(b.target), me = cleanName(b.name);
      if (!target || (!chat.names.includes(target) && !prof.users[target])) return json(res, 404, { ok: false, chyba: 'uživatel v seznamu není' });
      if (target === me) return json(res, 400, { ok: false, chyba: 'sám sebe odebrat nelze' });
      if (!adminAllowed(me, String(b.token || ''))) return json(res, 403, { ok: false, chyba: 'Uživatele mohou odebírat jen správci.' });
      if (usersList().some(u => u.name === target)) return json(res, 409, { ok: false, chyba: 'uživatel je právě online' });
      const before = chat.msgs.length;
      chat.msgs = chat.msgs.filter(m => m.order || !m.to || (m.from !== target && m.to !== target));   // soukromé zprávy s ním se smažou, společné a u zakázek zůstanou
      chat.names = chat.names.filter(n => n !== target); delete chat.reads[target]; readRev++; delete prof.users[target]; dropSessions(target);
      chat.epoch++; chat.seq++; chatSoon();
      log('Chat: odebrán uživatel', target, '(smazáno soukromých zpráv:', before - chat.msgs.length + ')');
      broadcast('chatreset', { epoch: chat.epoch });
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && (p === '/api/live/chat/send' || p === '/api/live/chat/edit' || p === '/api/live/chat/delete')) {
      const b = await readBody(req, 1024 * 1024);
      const c = clients.get(String(b.client || '')), name = cleanName((c && c.name) || b.name);
      if (!name) return json(res, 400, { ok: false, chyba: 'neznámý uživatel' });
      if (!sessOk(name, String(b.token || ''))) return json(res, 401, { ok: false, chyba: 'Přihlášení vypršelo — obnovte stránku (F5) a přihlaste se heslem.' });
      chatSeen(name);
      if (p === '/api/live/chat/send') {
        const text = String(b.text || '').trim().slice(0, 4000);
        if (!text) return json(res, 400, { ok: false, chyba: 'prázdná zpráva' });
        const order = String(b.order || '').slice(0, 80), to = cleanName(b.to);   // u chatu zakázky je „to" jen adresát (zprávu vidí všichni)
        if (to) chatSeen(to);
        let rcpt = [];
        if (!to && Array.isArray(b.rcpt)) rcpt = Array.from(new Set(b.rcpt.map(cleanName).filter(x => x && x !== name))).slice(0, 60);
        rcpt.forEach(chatSeen);
        const m = { order, id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), seq: ++chat.seq, ts: Date.now(), from: name, to, text, edited: 0, del: 0 };
        if (rcpt.length) m.rcpt = rcpt;
        chat.msgs.push(m); chatSoon(); chatPush(m);
        return json(res, 200, { ok: true, msg: m });
      }
      const m = chat.msgs.find(x => x.id === String(b.id));
      if (!m || m.from !== name) return json(res, 403, { ok: false, chyba: 'zprávu může měnit jen autor' });
      if (p === '/api/live/chat/edit') {
        const text = String(b.text || '').trim().slice(0, 4000);
        if (!text) return json(res, 400, { ok: false, chyba: 'prázdná zpráva' });
        m.text = text; m.edited = Date.now();
      } else { m.text = ''; m.del = 1; }
      m.seq = ++chat.seq; chatSoon(); chatPush(m);
      return json(res, 200, { ok: true, msg: m });
    }
    if (req.method === 'GET' && p === '/api/live/events') {
      const client = String(url.searchParams.get('client') || ''), name = ME;
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write('retry: 2000\n\n');
      const prev = clients.get(client);
      if (prev && !prev.closedAt) { try { prev.res.end(); } catch (e) {} }
      const c = { res, name, closedAt: 0, timer: null };
      clients.set(client, c);
      chatSeen(name);
      send(res, 'hello', { rev, locks: locksObj(), users: usersList() });
      broadcastPresence();
      log('Připojen:', name, '(online', usersList().length + ')');
      req.on('close', () => {
        if (clients.get(client) !== c) return;
        c.closedAt = Date.now();
        broadcastPresence();
        c.timer = setTimeout(() => {
          if (clients.get(client) === c && c.closedAt) { clients.delete(client); releaseClientLocks(client); broadcastPresence(); log('Odpojen:', name); }
        }, LOCK_GRACE_MS);
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nenalezeno');
  } catch (e) {
    log('Chyba požadavku', req.method, p, e.message);
    try { json(res, 400, { ok: false, chyba: e.message }); } catch (x) {}
  }
});
setInterval(() => broadcast('ping', { t: Date.now() }), 15000);      // drží spojení při životě

loadState();

/* Port: Windows některé porty rezervuje (Hyper-V, WSL, jiné programy) a pak je "EACCES / permission denied".
   Server proto zkouší postupně několik portů, naposledy použitý port si pamatuje (server/port.txt), aby adresa zůstala stejná. */
const PORT_FILE = path.join(__dirname, 'port.txt');
/* Vlastní, neobvyklé porty — ať si server nebere porty, které běžně používají jiné aplikace (8080, 3000, 8090 …).
   Dosavadní port z server\port.txt se zkouší jako první, takže stávající instalace a ikony kolegů zůstanou beze změny. */
let lastPort = 0;
function candidatePorts() {
  if (process.env.PORT) return [+process.env.PORT];
  const list = [8765, 8766, 8767, 8768, 8769, 8770, 0];     // 0 = poslední záchrana: port přidělí systém
  try { lastPort = +fs.readFileSync(PORT_FILE, 'utf8').trim() || 0; if (lastPort) list.unshift(lastPort); } catch (e) {}
  return Array.from(new Set(list));
}
function started(port) {
  if (!port) port = server.address().port;
  const ips = [];
  Object.values(os.networkInterfaces()).forEach(l => (l || []).forEach(i => { if (i.family === 'IPv4' && !i.internal) ips.push(i.address); }));
  try { fs.writeFileSync(PORT_FILE, String(port)); } catch (e) {}
  const urlName = 'http://' + os.hostname() + ':' + port + '/';
  try { fs.writeFileSync(path.join(__dirname, '..', 'Evidence zakazek.url'), '[InternetShortcut]\r\nURL=' + urlName + '\r\n'); } catch (e) {}
  if (lastPort && port !== lastPort) log('POZOR: dosavadní port ' + lastPort + ' je obsazený jiným programem — server běží na novém portu ' + port + '. Kolegové musí použít novou adresu (nová ikona "Evidence zakazek.url" a znovu Nainstalovat-aplikaci-na-pocitac.cmd).');
  log('Evidence zakázek běží.');
  log('  na tomto počítači:  http://localhost:' + port + '/');
  log('  kolegové v síti:    ' + urlName + (ips.length ? '   nebo   http://' + ips[0] + ':' + port + '/' : ''));
  log('  ikona pro kolegy:   "Evidence zakazek.url" (vytvořena vedle aplikace, zkopírujte ji na S:)');
  log('  data: ' + DATA_DIR);
  log('  čtení PDF faktur: ' + (fs.existsSync(path.join(__dirname, 'vendor', 'pdfjs', 'pdf.min.js')) && fs.existsSync(path.join(__dirname, 'vendor', 'tesseract', 'lang', 'ces.traineddata.gz')) ? 'knihovny nalezeny' : 'CHYBÍ složka ' + path.join(__dirname, 'vendor') + ' (rozbalte vendor.zip do složky server)'));
}
/* Jedna kopie serveru na jedna data: druhé spuštění nad stejnou složkou dat by si se zakázkami přepisovalo navzájem data.
   Zámek drží pojmenovaná roura (Windows) / soket (jinde); systém ho uvolní sám, jakmile server skončí, takže po pádu nic nezůstane zamčené. */
const net = require('net');
const PID_FILE = path.join(__dirname, 'server.pid');
function acquireLock(next) {
  const id = crypto.createHash('md5').update(path.resolve(DATA_DIR).toLowerCase()).digest('hex').slice(0, 12);
  const name = process.platform === 'win32' ? '\\\\.\\pipe\\evidence-zakazek-' + id : path.join(os.tmpdir(), 'evidence-zakazek-' + id + '.sock');
  let retried = false;
  const lockSrv = net.createServer(c => c.end());
  const taken = () => {
    log('CHYBA: server nad těmito daty už běží (složka dat: ' + DATA_DIR + ').');
    log('       Dvě kopie najednou by si přepisovaly zakázky. Tuto kopii zavřete; běžící server nechte být.');
    log('       Chcete-li ho restartovat, použijte Restartovat-server.cmd (jako správce).');
    process.exit(1);
  };
  lockSrv.on('error', e => {
    if (e.code !== 'EADDRINUSE') { log('POZOR: zámek serveru se nepodařilo vytvořit (' + e.message + ') — pokračuji bez něj.'); return next(); }
    if (process.platform !== 'win32' && !retried) {                 // zbytek po pádu: soket existuje, ale nikdo na něm neposlouchá
      retried = true;
      const t = net.connect(name);
      t.on('connect', () => { t.destroy(); taken(); });
      t.on('error', () => { try { fs.unlinkSync(name); } catch (x) {} lockSrv.listen(name); });
      return;
    }
    taken();
  });
  lockSrv.once('listening', () => {
    try { fs.writeFileSync(PID_FILE, String(process.pid)); } catch (e) {}
    next();
  });
  lockSrv.listen(name);
}
const dropPid = () => { try { if (fs.readFileSync(PID_FILE, 'utf8').trim() === String(process.pid)) fs.unlinkSync(PID_FILE); } catch (e) {} };
acquireLock(() => {
(function listen(ports, i) {
  if (i >= ports.length) { log('CHYBA: nepodařilo se otevřít žádný port (' + ports.join(', ') + '). Zavřete program, který je používá, nebo nastavte PORT.'); process.exit(1); }
  const onListening = () => { server.removeListener('error', onError); started(ports[i]); };
  const onError = e => {
    server.removeListener('listening', onListening);
    if (e.code === 'EACCES' || e.code === 'EADDRINUSE') { log('Port ' + ports[i] + ' nejde použít (' + e.code + ') — zkouším další…'); listen(ports, i + 1); }
    else { log('CHYBA serveru:', e.message); process.exit(1); }
  };
  server.once('listening', onListening);
  server.once('error', onError);
  server.listen(ports[i], HOST);
})(candidatePorts(), 0);
});
const bye = () => { if (persistTimer) persistNow(); if (chatTimer) chatSave(); dropPid(); process.exit(0); };
process.on('SIGINT', bye); process.on('SIGTERM', bye);
