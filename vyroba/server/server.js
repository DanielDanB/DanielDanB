#!/usr/bin/env node
/*
 * Přehled zakázek — server pro provoz ve firmě.
 *
 * Obsluhuje čtyři věci naráz:
 *   1. samotnou aplikaci        GET  /
 *   2. sdílená data zakázek     GET  /api/zakazky        PUT /api/zakazky
 *   3. přílohy (faktury, obj.)  POST /api/soubory        GET|DELETE /api/soubory/{id}
 *   4. mezikrok na ARES         GET  /api/ares/{ico}
 *
 * Spuštění:   node server.js
 * Nastavení přes proměnné prostředí:
 *   PORT          port, výchozí 8080
 *   DATA_DIR      kam se ukládají data a přílohy, výchozí ./data
 *   TOKEN         vyžadovat Authorization: Bearer <token> u /api/*
 *   ALLOW_ORIGIN  odkud smí volat cizí stránka, výchozí '*'
 *
 * Bez závislostí, stačí Node 18 a novější.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = Number(process.env.PORT || 8080);
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'prehled-zakazek.html');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const FILES_DIR = path.join(DATA_DIR, 'soubory');
const DB = path.join(DATA_DIR, 'zakazky.json');
const BACKUPS = path.join(DATA_DIR, 'zalohy');
const TOKEN = process.env.TOKEN || '';
const ORIGIN = process.env.ALLOW_ORIGIN || '*';
const ARES = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/';
const MAX_UPLOAD = 25 * 1024 * 1024;
const KEEP_BACKUPS = 30;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8', '.zip': 'application/zip',
  '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

for (const d of [DATA_DIR, FILES_DIR, BACKUPS]) fs.mkdirSync(d, { recursive: true });

function log(...a) { console.log(new Date().toISOString().slice(0, 19).replace('T', ' '), ...a); }

/* Při prvním spuštění se data převezmou z aplikace, aby server i prohlížeč
   začínaly na stejném stavu. */
function seedFromApp() {
  if (fs.existsSync(DB)) return;
  try {
    const html = fs.readFileSync(APP, 'utf8');
    const m = html.match(/<script id="seed" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m) throw new Error('v aplikaci nejsou data');
    const orders = JSON.parse(m[1].replace(/<\\\//g, '</'));
    fs.writeFileSync(DB, JSON.stringify({ orders, dict: null, rev: 1 }), 'utf8');
    log('založena databáze z aplikace:', orders.length, 'zakázek →', DB);
  } catch (e) {
    fs.writeFileSync(DB, JSON.stringify({ orders: [], dict: null, rev: 1 }), 'utf8');
    log('založena prázdná databáze (' + e.message + ')');
  }
}

function currentRev() {
  try { return Number(JSON.parse(fs.readFileSync(DB, 'utf8')).rev) || 0; } catch (e) { return 0; }
}

function writeDb(text) {
  const tmp = DB + '.tmp';
  fs.writeFileSync(tmp, text, 'utf8');
  if (fs.existsSync(DB)) {
    // víc uložení v jedné vteřině si nesmí přepsat zálohu
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 23);
    fs.copyFileSync(DB, path.join(BACKUPS, 'zakazky-' + stamp + '.json'));
    const old = fs.readdirSync(BACKUPS).filter(f => f.endsWith('.json')).sort();
    for (const f of old.slice(0, Math.max(0, old.length - KEEP_BACKUPS))) {
      fs.unlinkSync(path.join(BACKUPS, f));
    }
  }
  fs.renameSync(tmp, DB);
}

function head(extra) {
  return Object.assign({
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  }, extra || {});
}
function json(res, code, obj) {
  res.writeHead(code, head({ 'Content-Type': 'application/json; charset=utf-8' }));
  res.end(JSON.stringify(obj));
}
function authorized(req) {
  if (!TOKEN) return true;
  const h = req.headers.authorization || '';
  return h === 'Bearer ' + TOKEN;
}
function body(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('příliš velké tělo požadavku')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function api(req, res, url) {
  if (!authorized(req)) return json(res, 401, { chyba: 'Chybí nebo nesouhlasí přístupový token.' });
  const parts = url.pathname.split('/').filter(Boolean);   // ['api', ...]
  const area = parts[1];
  const rest = parts.slice(2);

  // ---- data zakázek
  if (area === 'zakazky') {
    // jen číslo verze — na tohle se ptají otevřené prohlížeče každých pár vteřin
    if (req.method === 'GET' && rest[0] === 'verze') {
      return json(res, 200, { rev: currentRev() });
    }
    if (req.method === 'GET') {
      res.writeHead(200, head({ 'Content-Type': 'application/json; charset=utf-8' }));
      return fs.createReadStream(DB).pipe(res);
    }
    if (req.method === 'PUT') {
      const buf = await body(req, 200 * 1024 * 1024);
      let parsed;
      try { parsed = JSON.parse(buf.toString('utf8')); }
      catch (e) { return json(res, 400, { chyba: 'Tělo požadavku není platný JSON.' }); }
      if (!parsed || !Array.isArray(parsed.orders)) {
        return json(res, 400, { chyba: 'Očekává se objekt s polem orders.' });
      }
      // kdo vychází ze starší verze, nesmí přepsat práci kolegy
      const rev = currentRev();
      const sent = parsed.rev === undefined ? null : Number(parsed.rev);
      if (sent !== null && sent !== rev && !url.searchParams.get('prepsat')) {
        log('odmítnuto uložení ze starší verze', sent, '(server má', rev + ')');
        return json(res, 409, {
          chyba: 'Mezitím uložil změny někdo jiný.', rev: rev, vase: sent
        });
      }
      parsed.rev = rev + 1;
      writeDb(JSON.stringify(parsed));
      log('uloženo', parsed.orders.length, 'zakázek, verze', parsed.rev);
      return json(res, 200, { ok: true, pocet: parsed.orders.length, rev: parsed.rev });
    }
    return json(res, 405, { chyba: 'Povoleno je GET nebo PUT.' });
  }

  // ---- přílohy
  if (area === 'soubory') {
    if (req.method === 'POST') {
      const name = (url.searchParams.get('name') || 'soubor').replace(/[\/\\]/g, '_').slice(0, 200);
      const type = url.searchParams.get('type') || 'application/octet-stream';
      let buf;
      try { buf = await body(req, MAX_UPLOAD); }
      catch (e) { return json(res, 413, { chyba: 'Soubor je větší než 25 MB.' }); }
      if (!buf.length) return json(res, 400, { chyba: 'Prázdný soubor.' });
      const fid = crypto.randomBytes(12).toString('hex');
      fs.writeFileSync(path.join(FILES_DIR, fid), buf);
      fs.writeFileSync(path.join(FILES_DIR, fid + '.json'),
        JSON.stringify({ fid, name, type, size: buf.length, ulozeno: new Date().toISOString() }), 'utf8');
      log('příloha', name, '(' + buf.length + ' B) →', fid);
      return json(res, 200, { fid, name, type, size: buf.length });
    }
    const fid = (rest[0] || '').replace(/[^0-9a-f]/g, '');
    if (!fid) return json(res, 400, { chyba: 'Chybí identifikátor souboru.' });
    const file = path.join(FILES_DIR, fid);
    if (!fs.existsSync(file)) return json(res, 404, { chyba: 'Soubor nenalezen.' });
    if (req.method === 'DELETE') {
      fs.unlinkSync(file);
      if (fs.existsSync(file + '.json')) fs.unlinkSync(file + '.json');
      log('příloha smazána', fid);
      return json(res, 200, { ok: true });
    }
    if (req.method === 'GET') {
      let meta = {};
      try { meta = JSON.parse(fs.readFileSync(file + '.json', 'utf8')); } catch (e) {}
      res.writeHead(200, head({
        'Content-Type': meta.type || 'application/octet-stream',
        'Content-Disposition': 'inline; filename="' + encodeURIComponent(meta.name || fid) + '"'
      }));
      return fs.createReadStream(file).pipe(res);
    }
    return json(res, 405, { chyba: 'Povoleno je GET, POST nebo DELETE.' });
  }

  // ---- mezikrok na ARES
  if (area === 'ares') {
    const ico = (rest[0] || url.searchParams.get('ico') || '').replace(/\D/g, '');
    if (ico.length !== 8) return json(res, 400, { chyba: 'IČO musí mít 8 číslic.' });
    try {
      const r = await fetch(ARES + ico, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
      const text = await r.text();
      log('ares', ico, r.status);
      if (r.status === 404) return json(res, 404, { chyba: 'IČO ' + ico + ' nebylo v ARES nalezeno.' });
      res.writeHead(r.status, head({ 'Content-Type': 'application/json; charset=utf-8' }));
      return res.end(text);
    } catch (e) {
      log('ares', ico, 'chyba', e.message);
      return json(res, 502, { chyba: 'ARES neodpověděl: ' + e.message });
    }
  }

  return json(res, 404, { chyba: 'Neznámý koncový bod.' });
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, 'http://' + (req.headers.host || 'localhost')); }
  catch (e) { return json(res, 400, { chyba: 'Špatná adresa.' }); }

  if (req.method === 'OPTIONS') { res.writeHead(204, head()); return res.end(); }

  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);

    // aplikace a statické soubory vedle ní
    let rel = url.pathname === '/' ? 'prehled-zakazek.html' : url.pathname.replace(/^\/+/, '');
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) && file !== APP) {
      return json(res, 403, { chyba: 'Mimo povolený adresář.' });
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, head({ 'Content-Type': 'text/plain; charset=utf-8' }));
      return res.end('Nenalezeno');
    }
    res.writeHead(200, head({
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    }));
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    log('chyba požadavku', req.method, url.pathname, e.message);
    json(res, 500, { chyba: e.message });
  }
});

seedFromApp();
server.listen(PORT, () => {
  log('Přehled zakázek běží na http://localhost:' + PORT);
  log('data:', DB);
  log('přílohy:', FILES_DIR);
  if (TOKEN) log('přístup chráněn tokenem');
  console.log('');
  console.log('  Otevřete v prohlížeči na tomto počítači:');
  console.log('    http://localhost:' + PORT);
  const lan = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const a of ifaces[name] || []) {
      if (a.family === 'IPv4' && !a.internal) lan.push(a.address);
    }
  }
  if (lan.length) {
    console.log('');
    console.log('  Kolegové v síti použijí:');
    for (const ip of lan) console.log('    http://' + ip + ':' + PORT);
    console.log('');
    console.log('  (Nejde-li to k nim, povolte port ' + PORT + ' v bráně firewall.)');
  }
  console.log('');
});
