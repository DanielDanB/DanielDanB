#!/usr/bin/env bash
# Spusti aplikaci a otevre ji v prohlizeci. Ukoncite klavesami Ctrl+C.
set -uo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-8000}"

if ! command -v python3 >/dev/null 2>&1; then
  echo
  echo "  Python nenalezen. Nainstalujte ho z https://www.python.org/downloads/"
  echo "  a spustte tenhle soubor znovu."
  echo
  read -r -p "Stisknete Enter pro zavreni." _
  exit 1
fi

pripravit() {
  [ -d .venv ] || { echo "Pripravuji prostredi (jen pri prvnim spusteni, muze to trvat i dve minuty)..."; python3 -m venv .venv; }
  .venv/bin/python -m pip install -q --disable-pip-version-check -r requirements.txt
}

if ! pripravit; then
  # Casto za to muze rozdelana slozka .venv z drivejska - zahodime ji a zkusime znovu.
  echo
  echo "Prvni pokus nevysel, zkousim prostredi postavit znovu od zacatku..."
  rm -rf .venv
  if ! pripravit; then
    echo
    echo "  Nepodarilo se pripravit prostredi. Vypis je cely vyse."
    echo
    echo "  Nejcastejsi priciny: vypadek internetu, blokovany pristup na pypi.org,"
    echo "  nebo balicek bez hotove verze pro vasi verzi Pythonu."
    echo
    echo "  Vyfotte tohle okno a poslete mi to - podle vypisu se to da opravit."
    echo
    read -r -p "Stisknete Enter pro zavreni." _
    exit 1
  fi
fi

# Prohlizec otevreme az chvili po startu serveru, aby nenarazil na prazdno.
( sleep 2
  if command -v open >/dev/null 2>&1; then open "http://127.0.0.1:$PORT"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://127.0.0.1:$PORT"
  fi ) >/dev/null 2>&1 &

echo
echo "  Aplikace bezi na http://127.0.0.1:$PORT"
echo "  Ukoncite ji klavesami Ctrl+C nebo zavrenim tohoto okna."
echo
exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
