"""Zapis a cteni nad SQLite. Vsechny upserty na jednom miste."""
from __future__ import annotations

import sqlite3
from typing import Any, Iterable

from app.db import jdumps, jloads, now


def uloz_firmu(conn: sqlite3.Connection, firma: dict[str, Any]) -> None:
    data = dict(firma)
    data["nace_vse"] = jdumps(data.get("nace_vse") or [])
    data["aktualizovano"] = now()
    sloupce = [
        "ico", "nazev", "pravni_forma", "pravni_forma_kod", "adresa", "obec", "psc",
        "okres", "kraj_kod", "kraj", "nace_hlavni", "nace_vse", "velikost_kod",
        "velikost_text", "velikost_min", "velikost_max", "datum_vzniku",
        "datum_zaniku", "aktivni", "zdroj", "aktualizovano",
    ]
    hodnoty = [data.get(s) for s in sloupce]
    # COALESCE: nove prazdne hodnoty nesmi prepsat drive zjistene udaje
    aktualizace = ", ".join(
        f"{s}=COALESCE(excluded.{s}, firma.{s})" for s in sloupce if s != "ico"
    )
    conn.execute(
        f"INSERT INTO firma ({','.join(sloupce)}) VALUES ({','.join('?' * len(sloupce))}) "
        f"ON CONFLICT(ico) DO UPDATE SET {aktualizace}",
        hodnoty,
    )


def uloz_priznak(conn: sqlite3.Connection, ico: str, klic: str, hodnota: str,
                 zdroj: str, source_url: str | None = None) -> None:
    conn.execute(
        "INSERT INTO priznak (ico, klic, hodnota, zdroj, source_url, zjisteno) "
        "VALUES (?,?,?,?,?,?) ON CONFLICT(ico, klic) DO UPDATE SET "
        "hodnota=excluded.hodnota, zdroj=excluded.zdroj, "
        "source_url=excluded.source_url, zjisteno=excluded.zjisteno",
        (ico, klic, hodnota, zdroj, source_url, now()),
    )


def uloz_osoby(conn: sqlite3.Connection, osoby: Iterable[dict[str, Any]]) -> int:
    pocet = 0
    for osoba in osoby:
        kurzor = conn.execute(
            "INSERT OR IGNORE INTO osoba (ico, jmeno, funkce, organ, od, zdroj, "
            "source_url, fetched_at) VALUES (?,?,?,?,?,?,?,?)",
            (osoba["ico"], osoba["jmeno"], osoba.get("funkce"), osoba.get("organ"),
             osoba.get("od"), osoba.get("zdroj"), osoba.get("source_url"),
             osoba.get("fetched_at") or now()),
        )
        pocet += kurzor.rowcount or 0
    return pocet


def uloz_web(conn: sqlite3.Connection, web: dict[str, Any]) -> None:
    conn.execute(
        "INSERT INTO web (ico, url, domena, overeno_ico, metoda, fetched_at) "
        "VALUES (?,?,?,?,?,?) ON CONFLICT(ico) DO UPDATE SET url=excluded.url, "
        "domena=excluded.domena, overeno_ico=excluded.overeno_ico, "
        "metoda=excluded.metoda, fetched_at=excluded.fetched_at",
        (web["ico"], web.get("url"), web.get("domena"), web.get("overeno_ico", 0),
         web.get("metoda"), web.get("fetched_at") or now()),
    )


def uloz_kontakty(conn: sqlite3.Connection, kontakty: Iterable[dict[str, Any]]) -> int:
    pocet = 0
    for kontakt in kontakty:
        if je_na_blacklistu(conn, kontakt["hodnota"]) or je_na_blacklistu(conn, kontakt["ico"]):
            continue
        kurzor = conn.execute(
            "INSERT OR IGNORE INTO kontakt (ico, typ, hodnota, role, zdroj, source_url, "
            "fetched_at) VALUES (?,?,?,?,?,?,?)",
            (kontakt["ico"], kontakt["typ"], kontakt["hodnota"], kontakt.get("role"),
             kontakt.get("zdroj"), kontakt.get("source_url"),
             kontakt.get("fetched_at") or now()),
        )
        pocet += kurzor.rowcount or 0
    return pocet


def je_na_blacklistu(conn: sqlite3.Connection, hodnota: str) -> bool:
    if not hodnota:
        return False
    radek = conn.execute(
        "SELECT 1 FROM blacklist WHERE hodnota = ? LIMIT 1", (hodnota.lower(),)
    ).fetchone()
    if radek:
        return True
    if "@" in hodnota:  # blokovana cela domena blokuje i adresy pod ni
        domena = hodnota.split("@", 1)[1].lower()
        return bool(conn.execute(
            "SELECT 1 FROM blacklist WHERE hodnota = ? LIMIT 1", (domena,)
        ).fetchone())
    return False


def pridej_na_blacklist(conn: sqlite3.Connection, hodnota: str, druh: str, duvod: str) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO blacklist (hodnota, druh, duvod, vlozeno) VALUES (?,?,?,?)",
        (hodnota.strip().lower(), druh, duvod, now()),
    )
    # Opt-out musi zabrat zpetne, ne az pri pristim stahovani.
    conn.execute("DELETE FROM kontakt WHERE lower(hodnota) = ?", (hodnota.strip().lower(),))
    conn.execute("DELETE FROM kontakt WHERE ico = ?", (hodnota.strip(),))


def firma(conn: sqlite3.Connection, ico: str) -> dict[str, Any] | None:
    radek = conn.execute("SELECT * FROM firma WHERE ico = ?", (ico,)).fetchone()
    if not radek:
        return None
    data = dict(radek)
    data["nace_vse"] = jloads(data.get("nace_vse"))
    data["osoby"] = [dict(r) for r in conn.execute(
        "SELECT * FROM osoba WHERE ico = ? ORDER BY organ, jmeno", (ico,))]
    data["kontakty"] = [dict(r) for r in conn.execute(
        "SELECT * FROM kontakt WHERE ico = ? ORDER BY typ, role, hodnota", (ico,))]
    web = conn.execute("SELECT * FROM web WHERE ico = ?", (ico,)).fetchone()
    data["web"] = dict(web) if web else None
    data["priznaky"] = {r["klic"]: dict(r) for r in conn.execute(
        "SELECT * FROM priznak WHERE ico = ?", (ico,))}
    return data
