"""Kontrola zivych zdroju: `python -m app.overit`.

Aplikace byla vyvinuta v prostredi bez pristupu na ceske statni servery, takze
tvar odpovedi ARESu a ADISu vychazi z dokumentace, ne z odzkousene odpovedi.
Tenhle prikaz to overi na vasem stroji a rekne presne, co sedi a co ne.
"""
from __future__ import annotations

import sys

from app.net import klient
from app.sources import ares, dph, vr

# Skutecne existujici firmy z ruznych kraju - kontrola ciselniku kraju.
VZORKY = [
    ("00006947", "Ministerstvo financí", "CZ010"),
    ("26185610", None, None),
]
ZELENA, CERVENA, ZLUTA, KONEC = "\033[32m", "\033[31m", "\033[33m", "\033[0m"


def _z(stav: str, popis: str, detail: str = "") -> dict[str, str]:
    return {"stav": stav, "popis": popis, "detail": detail}


def zkontroluj() -> list[dict[str, str]]:
    """Projde zive zdroje a vrati vysledek kazde kontroly jako data.

    Pouziva to jak prikazova radka, tak stranka /overit v aplikaci.
    """
    vysledky: list[dict[str, str]] = []

    with klient() as c:
        zaznam = ares.detail("00006947", klient_=c)
        if not zaznam:
            vysledky.append(_z("chyba", "ARES – detail subjektu",
                               "ARES neodpověděl. Zkontrolujte připojení k internetu."))
        else:
            vysledky.append(_z("ok", "ARES – detail subjektu",
                               f"Vrácen název: {zaznam.get('obchodniJmeno')}"))
            sidlo = zaznam.get("sidlo") or {}
            kod = sidlo.get("kodKraje")
            ocekavany = ares.KRAJE_ARES.get(int(kod))[1] if kod in ares.KRAJE_ARES else None
            if ocekavany is not None and ocekavany == sidlo.get("nazevKraje"):
                vysledky.append(_z("ok", "Číselník krajů",
                                   f"Kód {kod} odpovídá kraji {sidlo.get('nazevKraje')}."))
            else:
                vysledky.append(_z("chyba", "Číselník krajů",
                                   f"Kód {kod} vrací {sidlo.get('nazevKraje')!r}, čekal jsem "
                                   f"{ocekavany!r}. Je potřeba opravit tabulku KRAJE_ARES "
                                   "v souboru app/sources/ares.py."))

        res = ares.res_detail("00006947", klient_=c)
        if not res:
            vysledky.append(_z("chyba", "ARES – počty zaměstnanců (RES)",
                               "Endpoint neodpověděl. Filtr podle počtu zaměstnanců nebude fungovat."))
        else:
            klice = [k for k in res if "racovni" in k or "ategorie" in k]
            vysledky.append(_z("ok" if klice else "chyba", "ARES – počty zaměstnanců (RES)",
                               f"Nalezené klíče: {', '.join(klice)}" if klice
                               else "Kategorie počtu pracovníků v odpovědi není. Je potřeba "
                                    "upravit funkci na_firmu v app/sources/ares.py."))

        try:
            nalezene = list(ares.vyhledat(nace=["4649"], limit=3, klient_=c))
            vysledky.append(_z("ok" if nalezene else "chyba", "ARES – vyhledávání podle oboru",
                               f"Zkušební dotaz vrátil {len(nalezene)} firem."))
        except Exception as chyba:
            vysledky.append(_z("chyba", "ARES – vyhledávání podle oboru", str(chyba)))

        data = vr.stahni_vr("26185610", klient_=c)
        if not data:
            vysledky.append(_z("nejiste", "Obchodní rejstřík – statutáři",
                               "Zkušební firma nevrátila data. Nemusí jít o chybu — ověří se "
                               "při prvním skutečném obohacení."))
        else:
            lide = vr.osoby(data, "26185610")
            vysledky.append(_z("ok" if lide else "nejiste", "Obchodní rejstřík – statutáři",
                               f"Nalezeno {len(lide)} osob." if lide
                               else "Odpověď přišla, ale žádná osoba se z ní nevyčetla."))

    stav = dph.zjisti("00006947")
    if stav.get("poznamka"):
        vysledky.append(_z("chyba", "Registr plátců DPH", stav["poznamka"]))
    else:
        vysledky.append(_z("ok", "Registr plátců DPH",
                           f"Odpověď: plátce = {stav.get('platce_dph')}, "
                           f"nespolehlivý = {stav.get('nespolehlivy_platce')}."))
    return vysledky


def _vysledek(uspech: bool | None, popis: str, detail: str = "") -> bool:
    znak = {True: f"{ZELENA}OK {KONEC}", False: f"{CERVENA}CHYBA{KONEC}",
            None: f"{ZLUTA}????{KONEC}"}[uspech]
    print(f"  {znak}  {popis}" + (f"\n        {detail}" if detail else ""))
    return uspech is not False


def main() -> int:
    print("\nOvěřuji dostupnost a tvar dat ze živých zdrojů.\n")
    vse_ok = True
    for kontrola in zkontroluj():
        znak = {"ok": f"{ZELENA}OK   {KONEC}", "chyba": f"{CERVENA}CHYBA{KONEC}",
                "nejiste": f"{ZLUTA}???? {KONEC}"}[kontrola["stav"]]
        print(f"  {znak}  {kontrola['popis']}")
        if kontrola["detail"]:
            print(f"          {kontrola['detail']}")
        vse_ok &= kontrola["stav"] != "chyba"

    print("\n" + ("Vše sedí – aplikaci můžete používat." if vse_ok
                  else "Něco nesedí. Výše je uvedeno, co opravit."))
    return 0 if vse_ok else 1


if __name__ == "__main__":
    sys.exit(main())
