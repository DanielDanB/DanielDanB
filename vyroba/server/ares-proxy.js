#!/usr/bin/env node
/*
 * Mezikrok na ARES pro aplikaci Přehled zakázek.
 *
 * Prohlížeč nedovolí volat ares.gov.cz přímo z jiné stránky (CORS), proto se
 * dotaz posílá přes tento server. Nic neukládá, jen přeposílá odpověď registru.
 *
 *   node ares-proxy.js            # naslouchá na portu 871
 *   PORT=9000 node ares-proxy.js  # jiný port
 *
 * V aplikaci pak v Číselníky → Zákazníci vyplňte:
 *   http://adresa-serveru:871/api/ares
 *
 * Bez závislostí, stačí Node 18 a novější.
 */
'use strict';
const http = require('http');

const PORT = Number(process.env.PORT || 871);
const ARES = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/';
// Odkud smí aplikace volat. '*' stačí, pokud server není veřejně dostupný;
// jinak sem dejte adresu, ze které se aplikace otevírá.
const ORIGIN = process.env.ALLOW_ORIGIN || '*';

// jednoduchá ochrana proti zahlcení registru
const HITS = new Map();
const LIMIT = Number(process.env.RATE_LIMIT || 60);   // dotazů za minutu a IP
function tooMany(ip) {
  const now = Date.now();
  const rec = HITS.get(ip) || { n: 0, until: now + 60000 };
  if (now > rec.until) { rec.n = 0; rec.until = now + 60000; }
  rec.n++; HITS.set(ip, rec);
  return rec.n > LIMIT;
}

function send(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Accept, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'public, max-age=86400'
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.method !== 'GET') return send(res, 405, JSON.stringify({ chyba: 'Povolen je jen GET.' }));

  const ico = (req.url.split('?')[0].split('/').pop() || '').replace(/\D/g, '');
  if (ico.length !== 8) {
    return send(res, 400, JSON.stringify({ chyba: 'IČO musí mít 8 číslic.' }));
  }
  const ip = req.socket.remoteAddress || '?';
  if (tooMany(ip)) {
    return send(res, 429, JSON.stringify({ chyba: 'Příliš mnoho dotazů, zkuste to za chvíli.' }));
  }

  try {
    const r = await fetch(ARES + ico, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000)
    });
    const text = await r.text();
    if (r.status === 404) {
      console.log(new Date().toISOString(), ico, '404 nenalezeno');
      return send(res, 404, JSON.stringify({ chyba: 'IČO ' + ico + ' nebylo v ARES nalezeno.' }));
    }
    console.log(new Date().toISOString(), ico, r.status);
    send(res, r.status, text);
  } catch (e) {
    console.error(new Date().toISOString(), ico, 'chyba:', e.message);
    send(res, 502, JSON.stringify({ chyba: 'ARES neodpověděl: ' + e.message }));
  }
});

server.listen(PORT, () => {
  console.log('Mezikrok na ARES naslouchá na portu ' + PORT);
  console.log('V aplikaci vyplňte:  http://<adresa-serveru>:' + PORT + '/api/ares');
});
