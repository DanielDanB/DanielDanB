"""Statutarni organy z casti ARESu, ktera zprostredkovava verejny rejstrik.

Odpoved VR je hluboce zanorena a jeji tvar se muze menit. Misto toho, abychom
se vazali na konkretni cestu v JSONu, prochazime strom rekurzivne a sbirame
uzly, ktere vypadaji jako fyzicka osoba. Funkci bereme z nejblizsiho nadrazeneho
kontextu. Je to odolnejsi vuci zmenam schematu nez pevne zanoreni.
"""
from __future__ import annotations

from typing import Any, Iterator

import httpx

from app.config import ARES_BASE, ARES_DELAY_S
from app.db import now
from app.net import stahni

KLICE_JMENO = ("jmeno", "firstName")
KLICE_PRIJMENI = ("prijmeni", "lastName")
KLICE_FUNKCE = ("nazevFunkce", "funkce")
KLICE_ORGAN = ("nazevOrganu", "typOrganu")

# Uzly, ktere maji vlastni jmeno organu a stoji za to je predavat do hloubky.
ORGANOVE_KLICE = ("statutarniOrgany", "statutarniOrgan", "organy", "ostatniOrgany")


def stahni_vr(ico: str, klient_: httpx.Client | None = None) -> dict[str, Any] | None:
    odpoved = stahni(
        f"{ARES_BASE}/ekonomicke-subjekty-vr/{ico}",
        klient_=klient_,
        prodleva=ARES_DELAY_S,
        respektuj_robots=False,
    )
    if odpoved is None or odpoved.status_code != 200:
        return None
    try:
        return odpoved.json()
    except ValueError:
        return None


def _text(uzel: dict[str, Any], klice: tuple[str, ...]) -> str | None:
    for klic in klice:
        hodnota = uzel.get(klic)
        if isinstance(hodnota, str) and hodnota.strip():
            return hodnota.strip()
        if isinstance(hodnota, dict):
            vnoreny = _text(hodnota, ("nazev", "hodnota", "text"))
            if vnoreny:
                return vnoreny
    return None


def _najdi_funkci(uzel: Any, hloubka: int = 2) -> str | None:
    """Melka hledani funkce v okoli uzlu.

    Do `clenoveOrganu` zamerne nesestupujeme - jinak by se funkce prvniho clena
    rozlila na vsechny ostatni ve stejnem organu.
    """
    if not isinstance(uzel, dict) or hloubka < 0:
        return None
    nalez = _text(uzel, KLICE_FUNKCE)
    if nalez:
        return nalez
    for klic, hodnota in uzel.items():
        if klic in ("clenoveOrganu", "fyzickaOsoba", "pravnickaOsoba"):
            continue
        if isinstance(hodnota, dict):
            nalez = _najdi_funkci(hodnota, hloubka - 1)
            if nalez:
                return nalez
    return None


def _projdi(uzel: Any, organ: str | None, funkce: str | None) -> Iterator[dict[str, str | None]]:
    if isinstance(uzel, list):
        for polozka in uzel:
            yield from _projdi(polozka, organ, funkce)
        return
    if not isinstance(uzel, dict):
        return

    # Kontext si urcime z tohoto uzlu drive, nez sestoupime k osobam pod nim.
    organ_zde = _text(uzel, KLICE_ORGAN) or organ
    funkce_zde = _najdi_funkci(uzel) or funkce

    jmeno = _text(uzel, KLICE_JMENO)
    prijmeni = _text(uzel, KLICE_PRIJMENI)
    if prijmeni:
        yield {
            "jmeno": f"{jmeno} {prijmeni}".strip() if jmeno else prijmeni,
            "funkce": funkce_zde,
            "organ": organ_zde,
            "od": _text(uzel, ("datumVzniku", "datumZapisu", "od")),
        }
        return

    for hodnota in uzel.values():
        yield from _projdi(hodnota, organ_zde, funkce_zde)


def osoby(vr: dict[str, Any], ico: str) -> list[dict[str, Any]]:
    """Vytahne unikatni seznam osob ze zaznamu VR."""
    videne: dict[tuple[str, str | None], dict[str, Any]] = {}
    url = f"{ARES_BASE}/ekonomicke-subjekty-vr/{ico}"
    for osoba in _projdi(vr, None, None):
        jmeno = (osoba.get("jmeno") or "").strip()
        if not jmeno or len(jmeno) < 3:
            continue
        klic = (jmeno, osoba.get("funkce"))
        videne.setdefault(klic, {
            "ico": ico,
            "jmeno": jmeno,
            "funkce": osoba.get("funkce"),
            "organ": osoba.get("organ"),
            "od": osoba.get("od"),
            "zdroj": "ARES/VR (obchodní rejstřík)",
            "source_url": url,
            "fetched_at": now(),
        })
    return list(videne.values())
