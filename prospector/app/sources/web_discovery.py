"""Dohledani webu firmy bez placeneho vyhledavace.

Postup: z nazvu firmy vygenerujeme kandidatni domeny, zkusime je stahnout a
u kazde overime, jestli se na strance vyskytuje IC teto firmy. Skoro kazdy
cesky firemni web ma IC v paticce, takze overeni ma vysokou presnost - a to je
dulezitejsi nez pokryti. Neovereny nalez se ulozi jen jako navrh a v UI je
oznaceny, aby ho clovek potvrdil.
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

import httpx

from app.compliance import bez_diakritiky
from app.db import now
from app.net import stahni

PRAVNI_FORMY_RE = re.compile(
    r"\b(s\s*\.?\s*r\s*\.?\s*o|spol\s*\.?\s*s\s*r\s*\.?\s*o|a\s*\.?\s*s|v\s*\.?\s*o\s*\.?\s*s"
    r"|k\s*\.?\s*s|z\s*\.?\s*s|z\s*\.?\s*u|o\s*\.?\s*p\s*\.?\s*s|se|SE)\b\.?",
    re.IGNORECASE,
)
SLOVA_K_VYPUSTENI = {"a", "the", "cz", "czech", "ceska", "cesky", "group", "holding"}
TLD = ("cz", "com", "eu")


def kandidatni_domeny(nazev: str, max_kandidatu: int = 12) -> list[str]:
    """Vygeneruje pravdepodobne domeny z obchodniho jmena."""
    ocisteny = PRAVNI_FORMY_RE.sub(" ", nazev or "")
    ocisteny = bez_diakritiky(ocisteny).lower()
    tokeny = [t for t in re.split(r"[^a-z0-9]+", ocisteny) if t and t not in SLOVA_K_VYPUSTENI]
    if not tokeny:
        return []

    zaklady: list[str] = []

    def pridej(zaklad: str) -> None:
        if 3 <= len(zaklad) <= 40 and zaklad not in zaklady:
            zaklady.append(zaklad)

    pridej("".join(tokeny))
    if len(tokeny) > 1:
        pridej("-".join(tokeny))
        pridej("".join(tokeny[:2]))
        pridej("-".join(tokeny[:2]))
    pridej(tokeny[0])

    domeny: list[str] = []
    for zaklad in zaklady:
        for tld in TLD:
            domena = f"{zaklad}.{tld}"
            if domena not in domeny:
                domeny.append(domena)
            if len(domeny) >= max_kandidatu:
                return domeny
    return domeny


def ico_regex(ico: str) -> re.Pattern[str]:
    """IC byva na webu psane s mezerami (270 74 358), regex to musi snest."""
    cislice = re.sub(r"\D", "", ico or "")
    if not cislice:
        return re.compile(r"(?!x)x")
    return re.compile(r"[\s ]*".join(cislice))


def obsahuje_ico(text: str, ico: str) -> bool:
    return bool(ico_regex(ico).search(text or ""))


def najdi_web(
    ico: str, nazev: str, klient_: httpx.Client | None = None
) -> dict[str, object] | None:
    """Vrati nejlepsi nalezeny web. `overeno_ico=1` znamena potvrzenou shodu."""
    navrh: dict[str, object] | None = None
    for domena in kandidatni_domeny(nazev):
        for zaklad in (f"https://{domena}", f"https://www.{domena}"):
            odpoved = stahni(zaklad, klient_=klient_)
            if odpoved is None or odpoved.status_code != 200:
                continue
            if "text/html" not in odpoved.headers.get("content-type", ""):
                continue
            finalni = str(odpoved.url)
            if obsahuje_ico(odpoved.text, ico):
                return _zaznam(ico, finalni, "odhad domény + ověření IČO", overeno=True)
            # IC nemusi byt na titulni strance - zkusime kontaktni podstranku
            from app.sources.contacts import kontaktni_odkazy

            for odkaz in kontaktni_odkazy(odpoved.text, finalni)[:2]:
                podstranka = stahni(odkaz, klient_=klient_)
                if podstranka is not None and obsahuje_ico(podstranka.text, ico):
                    return _zaznam(ico, finalni, "odhad domény + ověření IČO na kontaktech", True)
            navrh = navrh or _zaznam(ico, finalni, "odhad domény (NEOVĚŘENO)", overeno=False)
            break
    return navrh


def _zaznam(ico: str, url: str, metoda: str, overeno: bool) -> dict[str, object]:
    return {
        "ico": ico,
        "url": url,
        "domena": urlparse(url).netloc.removeprefix("www."),
        "overeno_ico": 1 if overeno else 0,
        "metoda": metoda,
        "fetched_at": now(),
    }
