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
    if (req.method === 'POST' && p === '/api/live/request-close') {
      const b = await readBody(req, 1024 * 1024);
      const id = String(b.id), client = String(b.client || ''), c = clients.get(client);
      const cur = locks.get(id), holder = cur && clients.get(cur.client);
      if (!cur || cur.client === client || !holder || holder.closedAt) { log('Žádost o uzavření nedoručena (zámek už není / kolega offline), zakázka', id); return json(res, 200, { ok: false }); }
      log('Žádost o uzavření:', (c && c.name) || '?', '->', cur.name, '(zakázka', id + ')');
      send(holder.res, 'closeask', { id, by: (c && c.name) || String(b.name || 'Kolega').slice(0, 40), code: String(b.code || '').slice(0, 80) });
      return json(res, 200, { ok: true, to: cur.name });
    }
    if (req.method === 'GET' && p === '/api/live/events') {
      const client = String(url.searchParams.get('client') || ''), name = String(url.searchParams.get('name') || 'Uživatel').slice(0, 40);
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write('retry: 2000\n\n');
      const prev = clients.get(client);
      if (prev && !prev.closedAt) { try { prev.res.end(); } catch (e) {} }
      const c = { res, name, closedAt: 0, timer: null };
      clients.set(client, c);
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
function candidatePorts() {
  if (process.env.PORT) return [+process.env.PORT];
  const list = [8090, 8080, 8888, 5050, 4040, 3001, 9090, 8123, 3000];
  try { const last = +fs.readFileSync(PORT_FILE, 'utf8').trim(); if (last) list.unshift(last); } catch (e) {}
  return Array.from(new Set(list));
}
function started(port) {
  const ips = [];
  Object.values(os.networkInterfaces()).forEach(l => (l || []).forEach(i => { if (i.family === 'IPv4' && !i.internal) ips.push(i.address); }));
  try { fs.writeFileSync(PORT_FILE, String(port)); } catch (e) {}
  const urlName = 'http://' + os.hostname() + ':' + port + '/';
  try { fs.writeFileSync(path.join(__dirname, '..', 'Evidence zakazek.url'), '[InternetShortcut]\r\nURL=' + urlName + '\r\n'); } catch (e) {}
  log('Evidence zakázek běží.');
  log('  na tomto počítači:  http://localhost:' + port + '/');
  log('  kolegové v síti:    ' + urlName + (ips.length ? '   nebo   http://' + ips[0] + ':' + port + '/' : ''));
  log('  ikona pro kolegy:   "Evidence zakazek.url" (vytvořena vedle aplikace, zkopírujte ji na S:)');
  log('  data: ' + DATA_DIR);
}
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
const bye = () => { if (persistTimer) persistNow(); process.exit(0); };
process.on('SIGINT', bye); process.on('SIGTERM', bye);
