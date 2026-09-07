#!/bin/bash
# Instalace Přehledu zakázek jako služby na Linuxu.
#
#   sudo ./nainstalovat-linux.sh          # port 8080
#   sudo ./nainstalovat-linux.sh 80       # jiný port
#
set -euo pipefail

PORT="${1:-8080}"
CIL=/opt/vyroba
DATA=/var/lib/vyroba
UZIVATEL=vyroba
ZDROJ="$(cd "$(dirname "$0")/.." && pwd)"

echo
echo "  Přehled zakázek — instalace služby"
echo "  =================================="
echo

[ "$(id -u)" -eq 0 ] || { echo "  [!] Spusťte přes sudo."; exit 1; }

if ! command -v node >/dev/null 2>&1; then
  echo "  [!] Node.js není nainstalovaný. Na Debianu/Ubuntu:"
  echo "        sudo apt install nodejs"
  echo "      Potřebná je verze 18 nebo novější."
  exit 1
fi
VER=$(node -p "process.versions.node.split('.')[0]")
if [ "$VER" -lt 18 ]; then
  echo "  [!] Node.js $VER je příliš starý, potřeba je 18 nebo novější."
  exit 1
fi
echo "  Node.js $(node --version) nalezen."

id -u "$UZIVATEL" >/dev/null 2>&1 || {
  echo "  Zakládám systémového uživatele $UZIVATEL ..."
  useradd --system --no-create-home --shell /usr/sbin/nologin "$UZIVATEL"
}

echo "  Kopíruji do $CIL ..."
mkdir -p "$CIL" "$DATA"
cp -r "$ZDROJ/prehled-zakazek.html" "$CIL/"
mkdir -p "$CIL/server"
cp "$ZDROJ/server/server.js" "$CIL/server/"
cp "$ZDROJ/server/README.md" "$CIL/server/" 2>/dev/null || true
chown -R "$UZIVATEL:$UZIVATEL" "$CIL" "$DATA"

echo "  Zakládám službu ..."
cat > /etc/systemd/system/vyroba.service <<UNIT
[Unit]
Description=Přehled zakázek — evidence zakázek obrobny a svařovny
After=network.target

[Service]
Type=simple
WorkingDirectory=$CIL/server
ExecStart=$(command -v node) $CIL/server/server.js
Environment=PORT=$PORT
Environment=DATA_DIR=$DATA
Restart=always
RestartSec=5
User=$UZIVATEL
Group=$UZIVATEL
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable vyroba >/dev/null
systemctl restart vyroba

echo "  Ověřuji ..."
OK=0
for i in $(seq 1 15); do
  sleep 1
  if curl -fsS "http://localhost:$PORT/api/zakazky/verze" >/dev/null 2>&1; then OK=1; break; fi
done

echo
if [ "$OK" -eq 1 ]; then
  echo "  =================================================="
  echo "   HOTOVO — služba běží a startuje sama po zapnutí."
  echo "  =================================================="
  echo
  echo "   Adresy pro kolegy:"
  for ip in $(hostname -I 2>/dev/null || true); do echo "     http://$ip:$PORT"; done
  echo
  echo "   Data:   $DATA"
  echo "   Stav:   systemctl status vyroba"
  echo "   Log:    journalctl -u vyroba -f"
  echo
  if command -v ufw >/dev/null 2>&1; then
    echo "   Firewall: sudo ufw allow $PORT/tcp"
  fi
else
  echo "  [!] Služba byla založena, ale na portu $PORT neodpovídá."
  echo "      Podívejte se na:  journalctl -u vyroba -n 50"
  exit 1
fi
