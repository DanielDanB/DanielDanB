"""ARES REST API - vyhledavani firem a detail vcetne RES casti.

Dve veci stoji za pozornost:

1. Kraje se v ARESu adresuji ciselnikem RUIAN (Praha=19, Stredocesky=27, ...),
   ne kody NUTS. Tabulka nize je proto k dispozici i pro zpetny preklad a
   prikaz `overit-kraje` ji umi proti zivemu API zkontrolovat.
2. Pocet zamestnancu neni v zakladnim detailu - je az v RES casti na vlastnim
   endpointu. Tahame ho zvlast a jen kdyz je potreba.
"""
from __future__ import annotations

import re
from typing import Any, Callable, Iterator

import httpx

from app.config import ARES_BASE, ARES_DELAY_S
from app.db import VELIKOSTNI_KATEGORIE
from app.net import klient, stahni

# RUIAN kod kraje -> (NUTS kod, nazev). Poradi odpovida uredni posloupnosti kraju.
KRAJE_ARES: dict[int, tuple[str, str]] = {
    19: ("CZ010", "Hlavní město Praha"),
    27: ("CZ020", "Středočeský kraj"),
    35: ("CZ031", "Jihočeský kraj"),
    43: ("CZ032", "Plzeňský kraj"),
    51: ("CZ041", "Karlovarský kraj"),
    60: ("CZ042", "Ústecký kraj"),
    78: ("CZ051", "Liberecký kraj"),
    86: ("CZ052", "Královéhradecký kraj"),
    94: ("CZ053", "Pardubický kraj"),
    108: ("CZ063", "Kraj Vysočina"),
    116: ("CZ064", "Jihomoravský kraj"),
    124: ("CZ071", "Olomoucký kraj"),
    132: ("CZ072", "Zlínský kraj"),
    140: ("CZ080", "Moravskoslezský kraj"),
}
NUTS_NA_ARES: dict[str, int] = {nuts: kod for kod, (nuts, _) in KRAJE_ARES.items()}


class AresChyba(RuntimeError):
    pass


def _post(cesta: str, telo: dict[str, Any], klient_: httpx.Client) -> dict[str, Any]:
    from app.net import _pockej

    _pockej("ares.gov.cz", ARES_DELAY_S)
    odpoved = klient_.post(f"{ARES_BASE}{cesta}", json=telo)
    if odpoved.status_code >= 400:
        # ARES posila srozumitelny popis chyby; pouzijeme ho misto syroveho tela.
        popis = odpoved.text[:300]
        try:
            telo_chyby = odpoved.json()
            popis = telo_chyby.get("popis") or popis
        except ValueError:
            pass
        raise AresChyba(f"ARES odmítl dotaz ({odpoved.status_code}): {popis}")
    return odpoved.json()


# ARES prijima NACE jen jako PRESNE PETIMISTNE kody (formát CZ-NACE 2025).
# Ctyrmistny kod vrati prazdny vysledek bez jakekoliv chyby - presne na tom
# vyhledavani drive tise selhavalo. Rozbaleni z oboru na petimistne kody
# resi app/sources/ciselniky.py.
NACE_DELKA = 5
NACE_DAVKA = 50  # kolik kodu posleme v jednom dotazu


def vyhledat(
    nace: list[str] | None = None,
    kraje_nuts: list[str] | None = None,
    pravni_formy: list[str] | None = None,
    jen_aktivni: bool = True,
    limit: int = 500,
    klient_: httpx.Client | None = None,
    log: Callable[[str], None] | None = None,
) -> Iterator[dict[str, Any]]:
    """Strankovane vyhledavani. Yielduje syrove zaznamy ekonomickych subjektu.

    ARES filtruje jen na jeden kraj naraz a NACE bere po davkach, takze dotaz
    rozpadneme na kombinace a vysledky spojime. Limit plati na celek.
    `log` dostava prubezne hlasky - at je videt, co se poslalo a co prislo.
    """
    rekni = log or (lambda _: None)
    vlastni = klient_ is None
    c = klient_ or klient()
    try:
        kody_nace = [k for k in (nace or []) if re.fullmatch(r"\d{5}", k)]
        zahozene = [k for k in (nace or []) if k not in kody_nace]
        if zahozene:
            rekni(f"Přeskakuji kódy, které nemají pět číslic: {', '.join(zahozene)}")
        if nace and not kody_nace:
            rekni("Žádný použitelný NACE kód – ARES přijímá jen pětimístné. "
                  "Nechte si stáhnout číselník oborů.")
            return

        zaklad: dict[str, Any] = {}
        if pravni_formy:
            zaklad["pravniForma"] = pravni_formy

        davky = [kody_nace[i:i + NACE_DAVKA] for i in range(0, len(kody_nace), NACE_DAVKA)] \
            or [None]
        kody_kraju = [NUTS_NA_ARES[k] for k in (kraje_nuts or []) if k in NUTS_NA_ARES] or [None]

        varianty: list[dict[str, Any]] = []
        for kod_kraje in kody_kraju:
            for davka in davky:
                telo = dict(zaklad)
                if davka:
                    telo["czNace"] = davka
                if kod_kraje:
                    telo["sidlo"] = {"kodKraje": kod_kraje}
                if telo:
                    varianty.append(telo)

        # ARES prazdny dotaz odmita chybou 400, takze ho ani neposilame.
        if not varianty:
            rekni("Nezadali jste, co hledat. Vyberte obor podnikání nebo aspoň kraj.")
            return

        videna: set[str] = set()
        zbyva = limit
        for poradi, telo in enumerate(varianty, start=1):
            if zbyva <= 0:
                return
            popis = []
            if telo.get("czNace"):
                popis.append(f"{len(telo['czNace'])} kódů NACE ({telo['czNace'][0]}…)")
            if telo.get("sidlo"):
                popis.append(f"kraj {telo['sidlo']['kodKraje']}")
            pred = zbyva
            for zaznam in _stranka(c, telo, zbyva, jen_aktivni):
                ico = str(zaznam.get("ico") or "")
                if ico in videna:
                    continue
                videna.add(ico)
                yield zaznam
                zbyva -= 1
                if zbyva <= 0:
                    break
            rekni(f"  dotaz {poradi}/{len(varianty)} ({', '.join(popis) or 'bez filtru'}): "
                  f"{pred - zbyva} firem")
    finally:
        if vlastni:
            c.close()


def _seznam_subjektu(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Vytahne z odpovedi seznam subjektu i kdyz se klic jmenuje jinak.

    Nazev klice se mezi endpointy lisi, tak nejdriv zkusime znamy a pak
    kterykoliv seznam, jehoz polozky vypadaji jako ekonomicky subjekt.
    """
    for klic in ("ekonomickeSubjekty", "ekonomickeSubjektyRes", "zaznamy", "polozky"):
        hodnota = data.get(klic)
        if isinstance(hodnota, list):
            return hodnota
    for hodnota in data.values():
        if isinstance(hodnota, list) and hodnota and isinstance(hodnota[0], dict) \
                and "ico" in hodnota[0]:
            return hodnota
    return []


def _stranka(
    c: httpx.Client, telo: dict[str, Any], limit: int, jen_aktivni: bool = True
) -> Iterator[dict[str, Any]]:
    """Projde strankovani jednoho dotazu az do limitu nebo do konce vysledku."""
    krok = min(200, max(limit, 1))
    start = vraceno = 0
    while vraceno < limit:
        data = _post("/ekonomicke-subjekty/vyhledat", {**telo, "start": start, "pocet": krok}, c)
        davka = _seznam_subjektu(data)
        if not davka:
            return
        for zaznam in davka:
            if jen_aktivni and zaznam.get("datumZaniku"):
                continue
            yield zaznam
            vraceno += 1
            if vraceno >= limit:
                return
        start += krok
        if start >= int(data.get("pocetCelkem") or 0):
            return


def detail(ico: str, klient_: httpx.Client | None = None) -> dict[str, Any] | None:
    odpoved = stahni(
        f"{ARES_BASE}/ekonomicke-subjekty/{ico}",
        klient_=klient_,
        prodleva=ARES_DELAY_S,
        respektuj_robots=False,  # verejne API, ne web ke crawlovani
    )
    if odpoved is None or odpoved.status_code != 200:
        return None
    return odpoved.json()


def res_detail(ico: str, klient_: httpx.Client | None = None) -> dict[str, Any] | None:
    """RES cast ARESu - odtud se bere kategorie poctu pracovniku."""
    odpoved = stahni(
        f"{ARES_BASE}/ekonomicke-subjekty-res/{ico}",
        klient_=klient_,
        prodleva=ARES_DELAY_S,
        respektuj_robots=False,
    )
    if odpoved is None or odpoved.status_code != 200:
        return None
    return odpoved.json()


def _prvni(zdroj: dict[str, Any], *klice: str) -> Any:
    for klic in klice:
        hodnota = zdroj.get(klic)
        if hodnota not in (None, "", []):
            return hodnota
    return None


def najdi_kategorii_pracovniku(uzel: Any, hloubka: int = 0) -> str | None:
    """Najde kod kategorie poctu pracovniku kdekoliv ve strukture RES.

    Odpoved RES je zanorena a jeji tvar se lisi podle endpointu, tak misto
    pevne cesty prohledame strom a vezmeme prvni klic, ktery o poctu
    pracovniku mluvi. Hodnota muze byt retezec, cislo i objekt s klicem 'kod'.
    """
    if hloubka > 6:
        return None
    if isinstance(uzel, list):
        for polozka in uzel:
            nalez = najdi_kategorii_pracovniku(polozka, hloubka + 1)
            if nalez:
                return nalez
        return None
    if not isinstance(uzel, dict):
        return None

    for klic, hodnota in uzel.items():
        srovnatelny = klic.lower().replace("_", "")
        if "poctupracovniku" in srovnatelny or "kategoriepoctu" in srovnatelny:
            if isinstance(hodnota, dict):
                hodnota = _prvni(hodnota, "kod", "hodnota", "id")
            if hodnota not in (None, "", []):
                return str(hodnota)
    for hodnota in uzel.values():
        nalez = najdi_kategorii_pracovniku(hodnota, hloubka + 1)
        if nalez:
            return nalez
    return None


def na_firmu(zaznam: dict[str, Any], res: dict[str, Any] | None = None) -> dict[str, Any]:
    """Prevede odpoved ARESu na radek tabulky `firma`."""
    sidlo = zaznam.get("sidlo") or {}
    kod_kraje = sidlo.get("kodKraje")
    nuts, nazev_kraje = KRAJE_ARES.get(int(kod_kraje), ("", "")) if kod_kraje else ("", "")
    nace = zaznam.get("czNace") or []
    if isinstance(nace, str):
        nace = [nace]

    velikost_kod = najdi_kategorii_pracovniku(res) if res else None
    text, vmin, vmax = VELIKOSTNI_KATEGORIE.get(velikost_kod or "", (None, None, None))

    return {
        "ico": str(zaznam.get("ico") or "").zfill(8),
        "nazev": zaznam.get("obchodniJmeno") or "",
        "pravni_forma_kod": str(zaznam.get("pravniForma") or "") or None,
        "pravni_forma": None,
        "adresa": sidlo.get("textovaAdresa"),
        "obec": _prvni(sidlo, "nazevObce", "nazevMestskeCastiObvodu"),
        "psc": str(sidlo.get("psc")) if sidlo.get("psc") else None,
        "okres": sidlo.get("nazevOkresu"),
        "kraj_kod": nuts or None,
        "kraj": sidlo.get("nazevKraje") or nazev_kraje or None,
        "nace_hlavni": nace[0] if nace else None,
        "nace_vse": nace,
        "velikost_kod": velikost_kod,
        "velikost_text": text,
        "velikost_min": vmin,
        "velikost_max": vmax,
        "datum_vzniku": zaznam.get("datumVzniku"),
        "datum_zaniku": zaznam.get("datumZaniku"),
        "aktivni": 0 if zaznam.get("datumZaniku") else 1,
        "zdroj": "ARES",
    }
