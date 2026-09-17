"""Sestaveni SQL dotazu z filtru. Jedine misto, kde se sklada WHERE."""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Filtr:
    nace: list[str] = field(default_factory=list)      # prefixy, napr. ["46", "2farma"]
    kraje: list[str] = field(default_factory=list)     # NUTS kody
    zamestnanci_min: int | None = None
    zamestnanci_max: int | None = None
    platce_dph: bool = False
    vyloucit_nespolehlive: bool = True
    jen_s_webem: bool = False
    jen_s_kontaktem: bool = False
    nazev: str = ""
    jen_aktivni: bool = True
    razeni: str = "nazev"
    limit: int = 500
    offset: int = 0


RAZENI = {
    "nazev": "f.nazev COLLATE NOCASE ASC",
    "velikost": "COALESCE(f.velikost_min, -1) DESC, f.nazev COLLATE NOCASE",
    "kraj": "f.kraj, f.nazev COLLATE NOCASE",
    "kontakty": "pocet_kontaktu DESC, f.nazev COLLATE NOCASE",
}

ZAKLAD = """
SELECT f.*,
       w.url AS web_url, w.overeno_ico AS web_overeno,
       (SELECT COUNT(*) FROM kontakt k WHERE k.ico = f.ico) AS pocet_kontaktu,
       (SELECT COUNT(*) FROM osoba o WHERE o.ico = f.ico) AS pocet_osob,
       (SELECT hodnota FROM priznak p WHERE p.ico = f.ico AND p.klic='platce_dph')
           AS platce_dph,
       (SELECT hodnota FROM priznak p WHERE p.ico = f.ico AND p.klic='nespolehlivy_platce')
           AS nespolehlivy
FROM firma f
LEFT JOIN web w ON w.ico = f.ico
"""


def _podminky(filtr: Filtr) -> tuple[list[str], list[Any]]:
    kde: list[str] = []
    param: list[Any] = []

    if filtr.jen_aktivni:
        kde.append("f.aktivni = 1")
    if filtr.nace:
        casti = []
        for prefix in filtr.nace:
            ocisteny = prefix.strip()
            if not ocisteny:
                continue
            # Shoda na hlavni NACE i na kterykoliv z vedlejsich (ulozeny jako JSON pole)
            casti.append("(f.nace_hlavni LIKE ? OR f.nace_vse LIKE ?)")
            param.extend([f"{ocisteny}%", f'%"{ocisteny}%'])
        if casti:
            kde.append("(" + " OR ".join(casti) + ")")
    if filtr.kraje:
        kde.append(f"f.kraj_kod IN ({','.join('?' * len(filtr.kraje))})")
        param.extend(filtr.kraje)
    if filtr.zamestnanci_min is not None:
        # Pasmo se pocita jako vyhovujici, kdyz do nej pozadovany rozsah zasahuje.
        kde.append("f.velikost_max IS NOT NULL AND f.velikost_max >= ?")
        param.append(filtr.zamestnanci_min)
    if filtr.zamestnanci_max is not None:
        kde.append("f.velikost_min IS NOT NULL AND f.velikost_min <= ?")
        param.append(filtr.zamestnanci_max)
    if filtr.platce_dph:
        kde.append("EXISTS (SELECT 1 FROM priznak p WHERE p.ico=f.ico "
                   "AND p.klic='platce_dph' AND p.hodnota='ano')")
    if filtr.vyloucit_nespolehlive:
        kde.append("NOT EXISTS (SELECT 1 FROM priznak p WHERE p.ico=f.ico "
                   "AND p.klic='nespolehlivy_platce' AND p.hodnota='ano')")
    if filtr.jen_s_webem:
        kde.append("w.url IS NOT NULL")
    if filtr.jen_s_kontaktem:
        kde.append("EXISTS (SELECT 1 FROM kontakt k WHERE k.ico = f.ico)")
    if filtr.nazev.strip():
        kde.append("(f.nazev LIKE ? OR f.ico LIKE ?)")
        param.extend([f"%{filtr.nazev.strip()}%", f"{filtr.nazev.strip()}%"])
    # Firmy na blacklistu se nezobrazuji vubec
    kde.append("NOT EXISTS (SELECT 1 FROM blacklist b WHERE b.hodnota = f.ico)")
    return kde, param


def hledej(conn: sqlite3.Connection, filtr: Filtr) -> list[dict[str, Any]]:
    kde, param = _podminky(filtr)
    sql = ZAKLAD + ("WHERE " + " AND ".join(kde) if kde else "")
    sql += f" ORDER BY {RAZENI.get(filtr.razeni, RAZENI['nazev'])} LIMIT ? OFFSET ?"
    return [dict(r) for r in conn.execute(sql, (*param, filtr.limit, filtr.offset))]


def spocitej(conn: sqlite3.Connection, filtr: Filtr) -> int:
    kde, param = _podminky(filtr)
    sql = "SELECT COUNT(*) FROM firma f LEFT JOIN web w ON w.ico = f.ico"
    sql += (" WHERE " + " AND ".join(kde)) if kde else ""
    return int(conn.execute(sql, param).fetchone()[0])
