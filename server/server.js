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

const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'zalohy');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const APP_FILE = process.env.APP_FILE || path.join(__dirname, '..', 'prehled-zakazek.html');
const LOCK_GRACE_MS = 15000;          // po ztrátě spojení se zámky uvolní až po této době (výpadek wifi, obnovení stránky)
const KEEP_BACKUPS = 60;

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const log = (...a) => console.log(new Date().toLocaleTimeString('cs-CZ'), ...a);

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
    const day = new Date().toISOString().slice(0, 10);
    if (day !== lastBackupDay) {                    // první uložení dne = záloha
      lastBackupDay = day;
      fs.writeFileSync(path.join(BACKUP_DIR, 'state-' + day + '.json'), json);
      const old = fs.readdirSync(BACKUP_DIR).filter(f => /^state-.*\.json$/.test(f)).sort();
      while (old.length > KEEP_BACKUPS) fs.unlinkSync(path.join(BACKUP_DIR, old.shift()));
    }
  } catch (e) { log('POZOR: uložení dat selhalo:', e.message); }
}
function setPath(root, p, v, del) {
  let o = root;
  for (let i = 0; i < p.length - 1; i++) {
    if (o[p[i]] == null || typeof o[p[i]] !== 'object') o[p[i]] = {};
    o = o[p[i]];
  }
  if (del) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = v;
}

/* ---------------------------------------------------------------- chat (společný i soukromé zprávy, ukládá se do server/data/chat.json) */
const CHAT_FILE = path.join(DATA_DIR, 'chat.json');
const chat = { seq: 0, epoch: 0, names: [], msgs: [], cleared: {}, reads: {} };   // reads: { jméno: { klíč konverzace: čas poslední přečtené zprávy } } — pro „přečteno“   // cleared: { jméno: { konverzace: čas } } — „smazat chat“ platí jen pro toho, kdo ho smazal       // msgs: { id, seq, ts, from, to ('' = všichni), text, edited, del }
(function loadChat() {
  try { const c = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8')); chat.seq = c.seq || 0; chat.epoch = c.epoch || 0; chat.cleared = c.cleared || {}; chat.reads = c.reads || {}; chat.names = c.names || []; chat.msgs = c.msgs || []; log('Chat načten:', chat.msgs.length, 'zpráv'); }
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
  const name = (c && c.name) || String(body.name || '?');
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
    body.dict.forEach(op => { if (Array.isArray(op.p) && op.p.length) { setPath(dict, op.p, op.v, !!op.del); acc.dict.push(op); } });
  }
  if (Object.keys(acc.orders).length || acc.deleted.length || acc.dict.length) {
    rev++;
    persistSoon();
    broadcast('ops', Object.assign({ rev, client: clientId, by: name }, acc));
  }
  return { rev, rejected };
}

/* ---------------------------------------------------------------- HTTP */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > limit) { reject(new Error('příliš velký požadavek')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
function json(res, code, obj) {
  const b = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(b);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html' || p === '/prehled-zakazek.html')) {
      let html;
      try { html = fs.readFileSync(APP_FILE); } catch (e) { res.writeHead(500); return res.end('Soubor aplikace nenalezen: ' + APP_FILE); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(html);
    }
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
      return json(res, 200, applyOps(String(b.client || ''), b));
    }
    if (req.method === 'POST' && (p === '/api/live/lock' || p === '/api/live/unlock')) {
      const b = await readBody(req, 1024 * 1024);
      const id = String(b.id), client = String(b.client || ''), c = clients.get(client);
      const cur = locks.get(id);
      if (p === '/api/live/lock') {
        if (cur && cur.client !== client) {
          const holder = clients.get(cur.client);
          if (holder) return json(res, 409, { ok: false, by: cur.name });
          locks.delete(id);
        }
        locks.set(id, { client, name: (c && c.name) || String(b.name || '?'), since: Date.now() });
        broadcast('locks', { locks: locksObj() });
        return json(res, 200, { ok: true });
      }
      if (cur && cur.client === client) { locks.delete(id); broadcast('locks', { locks: locksObj() }); }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'GET' && p === '/api/live/chat') {
      const name = String(url.searchParams.get('name') || ''), since = +url.searchParams.get('since') || 0;
      const online = new Set(usersList().map(u => u.name));
      return json(res, 200, { seq: chat.seq, epoch: chat.epoch, readRev, reads: (+url.searchParams.get('rr') === readRev ? undefined : chat.reads), people: chat.names.map(n => ({ name: n, online: online.has(n) })),
        msgs: chat.msgs.filter(m => m.seq > since && chatSees(m, name)) });
    }
    if (req.method === 'POST' && p === '/api/live/chat/read') {
      const b = await readBody(req, 1024 * 1024);
      const me = String(b.name || '').slice(0, 40), key = String(b.key || '').slice(0, 200), ts = +b.ts || 0;
      if (!me || !ts) return json(res, 400, { ok: false, chyba: 'chybí údaje' });
      const r = chat.reads[me] = chat.reads[me] || {};
      if (!(r[key] >= ts)) { r[key] = ts; readRev++; chatSoon(); broadcast('chatread', { name: me, key, ts, readRev }); }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && p === '/api/live/chat/clear') {
      const b = await readBody(req, 1024 * 1024);
      const conv = String(b.conv || ''), me = String(b.name || '');
      if (!me) return json(res, 400, { ok: false, chyba: 'neznámý uživatel' });
      // smazání platí jen pro toho, kdo ho provedl: ostatním konverzace zůstává a každý si ji maže zvlášť
      const n = chat.msgs.filter(m => chatSees(m, me) && chatConvOf(m, me) === conv).length;
      const now = Date.now();
      (chat.cleared[me] = chat.cleared[me] || {})[conv] = now;
      const purged = chatPurge();
      chatSoon();
      log('Chat: ' + me + ' si smazal konverzaci', conv ? '„' + conv + '“' : 'Všichni', '(jeho zpráv skryto:', n + (purged ? ', z disku smazáno ' + purged : '') + ')');
      return json(res, 200, { ok: true, removed: n });
    }
    if (req.method === 'POST' && p === '/api/live/chat/user-delete') {
      const b = await readBody(req, 1024 * 1024);
      const target = String(b.target || '').slice(0, 40), me = String(b.name || '');
      if (!target || !chat.names.includes(target)) return json(res, 404, { ok: false, chyba: 'uživatel v seznamu není' });
      if (target === me) return json(res, 400, { ok: false, chyba: 'sám sebe odebrat nelze' });
      if (usersList().some(u => u.name === target)) return json(res, 409, { ok: false, chyba: 'uživatel je právě online' });
      const before = chat.msgs.length;
      chat.msgs = chat.msgs.filter(m => m.order || !m.to || (m.from !== target && m.to !== target));   // soukromé zprávy s ním se smažou, společné a u zakázek zůstanou
      chat.names = chat.names.filter(n => n !== target); delete chat.reads[target]; readRev++;
      chat.epoch++; chat.seq++; chatSoon();
      log('Chat: odebrán uživatel', target, '(smazáno soukromých zpráv:', before - chat.msgs.length + ')');
      broadcast('chatreset', { epoch: chat.epoch });
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && (p === '/api/live/chat/send' || p === '/api/live/chat/edit' || p === '/api/live/chat/delete')) {
      const b = await readBody(req, 1024 * 1024);
      const c = clients.get(String(b.client || '')), name = ((c && c.name) || String(b.name || '')).slice(0, 40);
      if (!name) return json(res, 400, { ok: false, chyba: 'neznámý uživatel' });
      chatSeen(name);
      if (p === '/api/live/chat/send') {
        const text = String(b.text || '').trim().slice(0, 4000);
        if (!text) return json(res, 400, { ok: false, chyba: 'prázdná zpráva' });
        const order = String(b.order || '').slice(0, 80), to = String(b.to || '').slice(0, 40);   // u chatu zakázky je „to" jen adresát (zprávu vidí všichni)
        if (to) chatSeen(to);
        let rcpt = [];
        if (!order && !to && Array.isArray(b.rcpt)) rcpt = Array.from(new Set(b.rcpt.map(x => String(x).slice(0, 40)).filter(x => x && x !== name))).slice(0, 60);
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
      const client = String(url.searchParams.get('client') || ''), name = String(url.searchParams.get('name') || 'Uživatel').slice(0, 40);
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
}
/* Jedna kopie serveru na jedna data: druhé spuštění nad stejnou složkou dat by si se zakázkami přepisovalo navzájem data.
   Zámek drží pojmenovaná roura (Windows) / soket (jinde); systém ho uvolní sám, jakmile server skončí, takže po pádu nic nezůstane zamčené. */
const crypto = require('crypto'), net = require('net');
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
