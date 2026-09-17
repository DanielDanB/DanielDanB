#!/usr/bin/env bash
# Spusti aplikaci a otevre ji v prohlizeci. Ukoncite klavesami Ctrl+C.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8000}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python nenalezen. Nainstalujte ho z https://www.python.org/downloads/ a spustte znovu."
  exit 1
fi

if [ ! -d .venv ]; then
  echo "Pripravuji prostredi (jen pri prvnim spusteni)..."
  python3 -m venv .venv
fi
.venv/bin/python -m pip install -q --disable-pip-version-check -r requirements.txt

# Prohlizec otevreme az chvili po startu serveru, aby nenarazil na prazdno.
( sleep 2
  if command -v open >/dev/null 2>&1; then open "http://127.0.0.1:$PORT"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://127.0.0.1:$PORT"
  fi ) >/dev/null 2>&1 &

echo
echo "  Aplikace bezi na http://127.0.0.1:$PORT"
echo "  Ukoncite ji klavesami Ctrl+C."
echo
exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
