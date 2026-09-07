# Mezikrok na ARES

Prohlížeč nedovolí stránce volat `ares.gov.cz` napřímo — je to jiná doména a registr
takové volání nepovoluje (CORS). Dotaz proto musí projít přes váš server.
Tenhle mezikrok nic neukládá ani nemění, jen přepošle odpověď ARESu.

## Node (doporučeno)

```bash
node ares-proxy.js          # port 871
PORT=9000 node ares-proxy.js
```

Jako služba na Linuxu:

```ini
# /etc/systemd/system/ares-proxy.service
[Unit]
Description=Mezikrok na ARES
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/vyroba/server/ares-proxy.js
Environment=PORT=871
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now ares-proxy
```

## PHP

Nahrajte `ares-proxy.php` jako `/api/ares/index.php`. Bez přepisu adres volejte
`…/api/ares/?ico=12345678` — aplikace i tuto podobu zvládne, pokud do pole zadáte
`https://vas-server.cz/api/ares/?ico=`.

## Nastavení v aplikaci

*Číselníky → Zákazníci → Mezikrok na ARES*:

```
http://adresa-serveru:871/api/ares
```

Ověření z příkazové řádky:

```bash
curl http://localhost:871/api/ares/25596641
```

Vrátí JSON s poli `obchodniJmeno`, `dic` a blokem `sidlo`.

## Poznámky

- `ALLOW_ORIGIN` omezí, odkud smí aplikace volat. Je-li server dostupný z internetu,
  nastavte konkrétní adresu místo `*`.
- `RATE_LIMIT` (Node) omezuje počet dotazů na IP za minutu, výchozí 60.
- Provoz běží přes HTTPS na ARES; váš server postavte také za HTTPS, jinak jej
  stránka načtená přes HTTPS nebude smět zavolat.
