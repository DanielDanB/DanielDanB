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


def _vysledek(uspech: bool | None, popis: str, detail: str = "") -> bool:
    znak = {True: f"{ZELENA}OK {KONEC}", False: f"{CERVENA}CHYBA{KONEC}",
            None: f"{ZLUTA}????{KONEC}"}[uspech]
    print(f"  {znak}  {popis}" + (f"\n        {detail}" if detail else ""))
    return uspech is not False


def main() -> int:
    vse_ok = True
    print("\nOvěřuji dostupnost a tvar dat ze živých zdrojů.\n")

    with klient() as c:
        print("ARES – detail subjektu")
        zaznam = ares.detail("00006947", klient_=c)
        if not zaznam:
            vse_ok &= _vysledek(False, "ARES nedostupný nebo vrátil chybu")
        else:
            vse_ok &= _vysledek(bool(zaznam.get("obchodniJmeno")),
                                f"název: {zaznam.get('obchodniJmeno')!r}")
            sidlo = zaznam.get("sidlo") or {}
            kod = sidlo.get("kodKraje")
            ocekavany = ares.KRAJE_ARES.get(int(kod))[1] if kod in ares.KRAJE_ARES else None
            sedi = ocekavany is not None and ocekavany == sidlo.get("nazevKraje")
            vse_ok &= _vysledek(
                sedi, f"číselník krajů: kód {kod} → {sidlo.get('nazevKraje')!r}",
                "" if sedi else "Tabulka KRAJE_ARES v app/sources/ares.py neodpovídá – oprav ji.")

        print("\nARES – RES část (počet zaměstnanců)")
        res = ares.res_detail("00006947", klient_=c)
        if not res:
            vse_ok &= _vysledek(False, "RES endpoint nedostupný")
        else:
            klice = [k for k in res if "racovni" in k or "ategorie" in k]
            vse_ok &= _vysledek(
                bool(klice), f"nalezené klíče s kategorií: {klice or 'ŽÁDNÉ'}",
                "" if klice else "Uprav _prvni(...) v ares.na_firmu podle skutečných klíčů.")

        print("\nARES – vyhledávání podle NACE")
        try:
            nalezene = list(ares.vyhledat(nace=["4649"], limit=3, klient_=c))
            vse_ok &= _vysledek(bool(nalezene), f"vráceno {len(nalezene)} firem")
        except Exception as chyba:
            vse_ok &= _vysledek(False, f"vyhledávání selhalo: {chyba}")

        print("\nARES – veřejný rejstřík (statutáři)")
        data = vr.stahni_vr("26185610", klient_=c)
        if not data:
            vse_ok &= _vysledek(None, "VR endpoint nevrátil data (firma nemusí existovat)")
        else:
            lide = vr.osoby(data, "26185610")
            vse_ok &= _vysledek(
                bool(lide), f"nalezeno {len(lide)} osob"
                + (f", např. {lide[0]['jmeno']} ({lide[0]['funkce']})" if lide else ""))

    print("\nRegistr plátců DPH (ADIS)")
    stav = dph.zjisti("00006947")
    vse_ok &= _vysledek(
        stav.get("platce_dph") != "neznamo" or "poznamka" not in stav,
        f"odpověď: {stav.get('platce_dph')} / nespolehlivý: {stav.get('nespolehlivy_platce')}",
        stav.get("poznamka", ""))

    print("\n" + ("Vše sedí – můžete spustit run.sh." if vse_ok else
                  "Něco nesedí. Výše je uvedeno, co opravit."))
    return 0 if vse_ok else 1


if __name__ == "__main__":
    sys.exit(main())
