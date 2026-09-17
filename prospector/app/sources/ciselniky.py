"""Ciselnik CZ-NACE z ARESu.

Duvod, proc tenhle modul existuje: vyhledavaci endpoint ARESu prijima NACE
jen jako PRESNE PETIMISTNE kody. Kdyz uzivatel napise "46" (velkoobchod),
musime to rozbalit na vsechny petimistne kody, ktere pod nej spadaji - a k tomu
potrebujeme oficialni seznam. Stahneme ho jednou a ulozime; meni se zridka.

Nazev ciselniku v API neni zdokumentovany, tak zkousime nekolik variant a
odpoved parsujeme rekurzivne, at nezalezi na tvaru obalky.
"""
from __future__ import annotations

import re
import sqlite3
from typing import Any, Iterator

import httpx

from app.config import ARES_BASE, ARES_DELAY_S
from app.db import now
from app.net import _pockej

# Poradi, v jakem zkousime pojmenovani ciselniku.
NAZVY_CISELNIKU = ("CzNace", "CZ-NACE", "CZNACE", "NACE", "CzNace2025")

KOD_KLICE = ("kod", "code", "id", "kodCiselniku")
NAZEV_KLICE = ("nazev", "name", "text", "popis", "zkracenyNazev")


def _dvojice(uzel: Any, hloubka: int = 0) -> Iterator[tuple[str, str]]:
    """Rekurzivne posbira dvojice (kod, nazev) at jsou zabalene jakkoliv."""
    if hloubka > 6:
        return
    if isinstance(uzel, list):
        for polozka in uzel:
            yield from _dvojice(polozka, hloubka + 1)
        return
    if not isinstance(uzel, dict):
        return

    kod = next((str(uzel[k]) for k in KOD_KLICE if isinstance(uzel.get(k), (str, int))), None)
    nazev = next((uzel[k] for k in NAZEV_KLICE if isinstance(uzel.get(k), str)), None)
    if kod and nazev:
        yield kod.strip(), nazev.strip()
    for hodnota in uzel.values():
        yield from _dvojice(hodnota, hloubka + 1)


def stahni_nace(klient_: httpx.Client) -> list[tuple[str, str]]:
    """Zkusi ciselnik stahnout. Vrati [(kod, nazev)] nebo prazdny seznam."""
    for nazev_ciselniku in NAZVY_CISELNIKU:
        try:
            _pockej("ares.gov.cz", ARES_DELAY_S)
            odpoved = klient_.post(
                f"{ARES_BASE}/ciselniky-nazevniky/vyhledat",
                json={"kodCiselniku": nazev_ciselniku, "pocet": 5000, "start": 0},
            )
            if odpoved.status_code != 200:
                continue
            nalezene = dict(_dvojice(odpoved.json()))
            # Ciselnik poznáme podle toho, ze obsahuje petimistne kody.
            petimistne = {k: v for k, v in nalezene.items() if re.fullmatch(r"\d{5}", k)}
            if len(petimistne) >= 50:
                return sorted(nalezene.items())
        except Exception:
            continue
    return []


def uloz_nace(conn: sqlite3.Connection, polozky: list[tuple[str, str]]) -> int:
    conn.execute("""CREATE TABLE IF NOT EXISTS ciselnik_nace (
        kod TEXT PRIMARY KEY, nazev TEXT NOT NULL, aktualizovano TEXT)""")
    ted = now()
    conn.executemany(
        "INSERT INTO ciselnik_nace (kod, nazev, aktualizovano) VALUES (?,?,?) "
        "ON CONFLICT(kod) DO UPDATE SET nazev=excluded.nazev, "
        "aktualizovano=excluded.aktualizovano",
        [(k, n, ted) for k, n in polozky],
    )
    return len(polozky)


def mam_ciselnik(conn: sqlite3.Connection) -> int:
    conn.execute("""CREATE TABLE IF NOT EXISTS ciselnik_nace (
        kod TEXT PRIMARY KEY, nazev TEXT NOT NULL, aktualizovano TEXT)""")
    return int(conn.execute(
        "SELECT COUNT(*) FROM ciselnik_nace WHERE length(kod) = 5").fetchone()[0])


def rozbal(conn: sqlite3.Connection, zadani: list[str]) -> list[str]:
    """Prevede to, co uzivatel zadal, na presne petimistne kody pro ARES.

    Zvlada oboji, co uzivatel muze napsat:
      "46"            -> vsechny petimistne kody zacinajici 46
      "46490"         -> projde beze zmeny
      "velkoobchod"   -> kody, v jejichz nazvu se to slovo vyskytuje

    Slovni zadani je tu proto, ze uzivatel prirozene pise slova. Drive se
    takove zadani tise zahodilo a do ARESu odesel prazdny dotaz.
    """
    vysledek: list[str] = []
    videne: set[str] = set()

    for syrovy in zadani:
        text = (syrovy or "").strip()
        if not text:
            continue
        prefix = re.sub(r"\D", "", text)
        if not prefix:
            kandidati = [r[0] for r in conn.execute(
                "SELECT kod FROM ciselnik_nace WHERE length(kod) = 5 AND nazev LIKE ? "
                "ORDER BY kod", (f"%{text}%",))]
        elif len(prefix) == 5:
            kandidati = [prefix]
        else:
            kandidati = [r[0] for r in conn.execute(
                "SELECT kod FROM ciselnik_nace WHERE length(kod) = 5 AND kod LIKE ? "
                "ORDER BY kod", (prefix + "%",))]
            if not kandidati and len(prefix) == 4:
                # Bez ciselniku: petimistny kod byva ctyrmistny plus jedna cislice.
                kandidati = [f"{prefix}{i}" for i in range(10)]
        for kod in kandidati:
            if kod not in videne:
                videne.add(kod)
                vysledek.append(kod)
    return vysledek


def naseptavac(conn: sqlite3.Connection, dotaz: str, limit: int = 40) -> list[dict[str, str]]:
    """Polozky ciselniku pro vyber v UI - hleda v kodu i v nazvu."""
    if mam_ciselnik(conn) == 0:
        return []
    dotaz = (dotaz or "").strip()
    if not dotaz:
        radky = conn.execute(
            "SELECT kod, nazev FROM ciselnik_nace WHERE length(kod) = 2 ORDER BY kod LIMIT ?",
            (limit,))
    else:
        radky = conn.execute(
            "SELECT kod, nazev FROM ciselnik_nace WHERE kod LIKE ? OR nazev LIKE ? "
            "ORDER BY length(kod), kod LIMIT ?",
            (f"{re.sub(r'[^0-9]', '', dotaz)}%" if dotaz[0].isdigit() else "\x00",
             f"%{dotaz}%", limit))
    return [{"kod": r[0], "nazev": r[1]} for r in radky]
