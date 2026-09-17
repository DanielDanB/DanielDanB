"""SQLite vrstva. Zamerne bez ORM - schema je male a citelnejsi takhle."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from app.config import DB_PATH

SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS firma (
    ico                  TEXT PRIMARY KEY,
    nazev                TEXT NOT NULL,
    pravni_forma         TEXT,
    pravni_forma_kod     TEXT,
    adresa               TEXT,
    obec                 TEXT,
    psc                  TEXT,
    okres                TEXT,
    kraj_kod             TEXT,
    kraj                 TEXT,
    nace_hlavni          TEXT,
    nace_vse             TEXT,          -- JSON pole kodu
    velikost_kod         TEXT,          -- kod kategorie poctu pracovniku
    velikost_text        TEXT,          -- citelne pasmo, napr. "25 - 49"
    velikost_min         INTEGER,       -- rozsah pasma, pro filtrovani
    velikost_max         INTEGER,
    datum_vzniku         TEXT,
    datum_zaniku         TEXT,
    aktivni              INTEGER DEFAULT 1,
    zdroj                TEXT,
    aktualizovano        TEXT
);
CREATE INDEX IF NOT EXISTS ix_firma_kraj ON firma(kraj_kod);
CREATE INDEX IF NOT EXISTS ix_firma_nace ON firma(nace_hlavni);
CREATE INDEX IF NOT EXISTS ix_firma_velikost ON firma(velikost_min);

-- Priznaky z externich registru (DPH, insolvence, ...). Jeden radek = jedno zjisteni.
CREATE TABLE IF NOT EXISTS priznak (
    ico        TEXT NOT NULL REFERENCES firma(ico) ON DELETE CASCADE,
    klic       TEXT NOT NULL,
    hodnota    TEXT,
    zdroj      TEXT,
    source_url TEXT,
    zjisteno   TEXT,
    PRIMARY KEY (ico, klic)
);

-- Statutari z obchodniho rejstriku. Verejny udaj, ale porad osobni udaj -
-- proto stejne jako u kontaktu drzime zdroj a datum.
CREATE TABLE IF NOT EXISTS osoba (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ico        TEXT NOT NULL REFERENCES firma(ico) ON DELETE CASCADE,
    jmeno      TEXT NOT NULL,
    funkce     TEXT,
    organ      TEXT,
    od         TEXT,
    zdroj      TEXT,
    source_url TEXT,
    fetched_at TEXT,
    UNIQUE (ico, jmeno, funkce)
);

CREATE TABLE IF NOT EXISTS web (
    ico          TEXT PRIMARY KEY REFERENCES firma(ico) ON DELETE CASCADE,
    url          TEXT,
    domena       TEXT,
    overeno_ico  INTEGER DEFAULT 0,   -- 1 = na strankach bylo nalezeno IC firmy
    metoda       TEXT,                -- jak jsme web nasli
    fetched_at   TEXT
);

-- Kontakty. Ukladame VYHRADNE obecne firemni adresy (info@, nakup@, ...).
-- Jmenne adresy se zahazuji uz pri extrakci, viz app/compliance.py.
CREATE TABLE IF NOT EXISTS kontakt (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ico        TEXT NOT NULL REFERENCES firma(ico) ON DELETE CASCADE,
    typ        TEXT NOT NULL,         -- email | telefon
    hodnota    TEXT NOT NULL,
    role       TEXT,                  -- nakup | vedeni | recepce | obecny
    zdroj      TEXT,
    source_url TEXT,
    fetched_at TEXT,
    UNIQUE (ico, typ, hodnota)
);
CREATE INDEX IF NOT EXISTS ix_kontakt_ico ON kontakt(ico);

-- Opt-out. Kontroluje se pri exportu i pri zapisu kontaktu.
CREATE TABLE IF NOT EXISTS blacklist (
    hodnota  TEXT PRIMARY KEY,        -- ICO, domena nebo emailova adresa
    druh     TEXT NOT NULL,
    duvod    TEXT,
    vlozeno  TEXT
);

CREATE TABLE IF NOT EXISTS uloha (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    druh      TEXT NOT NULL,
    stav      TEXT NOT NULL,          -- ceka | bezi | hotovo | chyba | zruseno
    parametry TEXT,
    hotovo    INTEGER DEFAULT 0,
    celkem    INTEGER DEFAULT 0,
    log       TEXT DEFAULT '',
    zalozeno  TEXT,
    ukonceno  TEXT
);
"""

KRAJE = [
    ("CZ010", "Hlavní město Praha"),
    ("CZ020", "Středočeský kraj"),
    ("CZ031", "Jihočeský kraj"),
    ("CZ032", "Plzeňský kraj"),
    ("CZ041", "Karlovarský kraj"),
    ("CZ042", "Ústecký kraj"),
    ("CZ051", "Liberecký kraj"),
    ("CZ052", "Královéhradecký kraj"),
    ("CZ053", "Pardubický kraj"),
    ("CZ063", "Kraj Vysočina"),
    ("CZ064", "Jihomoravský kraj"),
    ("CZ071", "Olomoucký kraj"),
    ("CZ072", "Zlínský kraj"),
    ("CZ080", "Moravskoslezský kraj"),
]

# Kategorie poctu pracovniku podle ciselniku RES. Rozsah drzime zvlast,
# aby se dalo filtrovat "aspon 10 zamestnancu" napric kategoriemi.
VELIKOSTNI_KATEGORIE = {
    "110": ("neuvedeno", None, None),
    "210": ("bez zaměstnanců", 0, 0),
    "310": ("1 - 5", 1, 5),
    "320": ("6 - 9", 6, 9),
    "410": ("10 - 19", 10, 19),
    "420": ("20 - 24", 20, 24),
    "430": ("25 - 49", 25, 49),
    "510": ("50 - 99", 50, 99),
    "520": ("100 - 199", 100, 199),
    "530": ("200 - 249", 200, 249),
    "610": ("250 - 499", 250, 499),
    "620": ("500 - 999", 500, 999),
    "630": ("1000 - 1499", 1000, 1499),
    "640": ("1500 - 1999", 1500, 1999),
    "650": ("2000 - 2499", 2000, 2499),
    "660": ("2500 - 2999", 2500, 2999),
    "670": ("3000 - 3999", 3000, 3999),
    "680": ("4000 - 4999", 4000, 4999),
    "690": ("5000 - 9999", 5000, 9999),
    "710": ("10000 a více", 10000, None),
}


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect(path: Path | str | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path or DB_PATH), timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(path: Path | str | None = None) -> None:
    with connect(path) as conn:
        conn.executescript(SCHEMA)


@contextmanager
def session(path: Path | str | None = None) -> Iterator[sqlite3.Connection]:
    conn = connect(path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def jdumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def jloads(value: str | None) -> Any:
    if not value:
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return []
