"""Sonda do skutecnych odpovedi ARESu.

Existuje proto, ze vyvojove prostredi na ceske statni servery nedosahne.
Stranka /diagnostika pusti nekolik variant dotazu primo z uzivatelova
pocitace a vypise, co presne prislo zpatky - vcetne nazvu klicu. Z jednoho
vypisu se tak da opravit to, co se nepodarilo uhodnout.
"""
from __future__ import annotations

import json
from typing import Any, Iterator

import httpx

from app.config import ARES_BASE, ARES_DELAY_S, HTTP_TIMEOUT_S, USER_AGENT
from app.net import _pockej


def _klient() -> httpx.Client:
    return httpx.Client(headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT_S,
                        follow_redirects=True)


def cesty(uzel: Any, prefix: str = "", hloubka: int = 0) -> Iterator[str]:
    """Vypise cesty ke vsem klicum ve strukture, vcetne ukazky hodnoty."""
    if hloubka > 5:
        return
    if isinstance(uzel, dict):
        for klic, hodnota in uzel.items():
            cesta = f"{prefix}.{klic}" if prefix else klic
            if isinstance(hodnota, (dict, list)):
                yield from cesty(hodnota, cesta, hloubka + 1)
            else:
                ukazka = str(hodnota)
                yield f"{cesta} = {ukazka[:60]}"
    elif isinstance(uzel, list):
        yield f"{prefix}[] ({len(uzel)} položek)"
        if uzel:
            yield from cesty(uzel[0], f"{prefix}[0]", hloubka + 1)


def _hledej(c: httpx.Client, popis: str, telo: dict[str, Any]) -> dict[str, Any]:
    """Posle jeden vyhledavaci dotaz a shrne, co prislo zpatky."""
    vysledek: dict[str, Any] = {"popis": popis, "telo": json.dumps(telo, ensure_ascii=False)}
    try:
        _pockej("ares.gov.cz", ARES_DELAY_S)
        odpoved = c.post(f"{ARES_BASE}/ekonomicke-subjekty/vyhledat", json=telo)
        vysledek["stav"] = str(odpoved.status_code)
        if odpoved.status_code >= 400:
            vysledek["shrnuti"] = odpoved.text[:400]
            return vysledek
        data = odpoved.json()
        klice = list(data.keys()) if isinstance(data, dict) else ["(odpověď není objekt)"]
        seznamy = {k: len(v) for k, v in data.items() if isinstance(v, list)} if isinstance(data, dict) else {}
        vysledek["shrnuti"] = (
            f"klíče: {', '.join(klice)}\n"
            f"seznamy: {seznamy or 'žádné'}\n"
            f"pocetCelkem: {data.get('pocetCelkem') if isinstance(data, dict) else '?'}"
        )
        for hodnota in (data.values() if isinstance(data, dict) else []):
            if isinstance(hodnota, list) and hodnota and isinstance(hodnota[0], dict):
                prvni = hodnota[0]
                vysledek["shrnuti"] += (
                    f"\nprvní záznam: ico={prvni.get('ico')} "
                    f"jméno={str(prvni.get('obchodniJmeno'))[:40]!r} "
                    f"czNace={prvni.get('czNace')}"
                )
                break
    except Exception as chyba:
        vysledek["stav"] = "výjimka"
        vysledek["shrnuti"] = f"{type(chyba).__name__}: {chyba}"
    return vysledek


def sber() -> dict[str, Any]:
    """Pusti vsechny sondy a vrati vysledky k zobrazeni."""
    sondy: list[dict[str, Any]] = []
    res_cesty: list[str] = []
    vr_ukazka: list[str] = []

    with _klient() as c:
        # Od nejsirsiho dotazu k nejuzsimu - ukaze, ktery filtr vysledky vynuluje.
        sondy.append(_hledej(c, "bez filtru (kontrolní)", {"start": 0, "pocet": 3}))
        sondy.append(_hledej(c, "podle názvu", {"start": 0, "pocet": 3,
                                                "obchodniJmeno": "Ministerstvo financí"}))
        sondy.append(_hledej(c, "podle kraje", {"start": 0, "pocet": 3,
                                                "sidlo": {"kodKraje": 19}}))
        sondy.append(_hledej(c, "NACE čtyřmístná", {"start": 0, "pocet": 3, "czNace": ["4649"]}))
        sondy.append(_hledej(c, "NACE pětimístná", {"start": 0, "pocet": 3, "czNace": ["46490"]}))
        sondy.append(_hledej(c, "NACE dvoumístná", {"start": 0, "pocet": 3, "czNace": ["46"]}))
        sondy.append(_hledej(c, "NACE jako text", {"start": 0, "pocet": 3, "czNace": "4649"}))

        try:
            _pockej("ares.gov.cz", ARES_DELAY_S)
            odpoved = c.get(f"{ARES_BASE}/ekonomicke-subjekty-res/00006947")
            if odpoved.status_code == 200:
                res_cesty = list(cesty(odpoved.json()))[:80]
            else:
                res_cesty = [f"(RES vrátil {odpoved.status_code})"]
        except Exception as chyba:
            res_cesty = [f"(výjimka {type(chyba).__name__}: {chyba})"]

        try:
            from app.sources import vr
            data = vr.stahni_vr("26185610", klient_=c)
            if data:
                lide = vr.osoby(data, "26185610")
                vr_ukazka = [f"celkem nalezeno: {len(lide)}"] + [
                    f"{o['jmeno']} | funkce={o['funkce']} | orgán={o['organ']}" for o in lide[:15]]
            else:
                vr_ukazka = ["(VR nevrátil data)"]
        except Exception as chyba:
            vr_ukazka = [f"(výjimka {type(chyba).__name__}: {chyba})"]

    return {"sondy": sondy, "res_cesty": res_cesty, "vr_ukazka": vr_ukazka}


def jako_text(data: dict[str, Any]) -> str:
    """Jeden blok textu ke zkopirovani."""
    radky = ["=== VYHLEDÁVÁNÍ ==="]
    for s in data["sondy"]:
        radky += [f"\n--- {s['popis']} ---", f"dotaz: {s['telo']}",
                  f"stav: {s.get('stav')}", s.get("shrnuti", "")]
    radky += ["\n=== RES (počty pracovníků) ==="] + data["res_cesty"]
    radky += ["\n=== VR (statutáři) ==="] + data["vr_ukazka"]
    return "\n".join(radky)
