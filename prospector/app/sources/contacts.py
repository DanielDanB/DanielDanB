"""Stazeni obecnych firemnich kontaktu z webu firmy.

Stahujeme jen malo stranek (titulni + par kontaktnich), respektujeme robots.txt
a vsechny nalezene emaily prohaneme whitelistem z app/compliance.py. Jmenne
adresy se nikdy neukladaji - zahodi se uz tady.
"""
from __future__ import annotations

import re
from urllib.parse import urldefrag, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from app.compliance import najdi_emaily, najdi_telefony
from app.config import MAX_PAGES_PER_SITE
from app.db import now
from app.net import stahni

KONTAKTNI_VZOR = re.compile(
    r"kontakt|contact|spojeni|napiste|o-nas|o_nas|about|impressum|firma|pobock|prodejn"
    r"|nakup|purchas|procurement|dodavatel|supplier|vedeni|management|tym|team",
    re.IGNORECASE,
)


def kontaktni_odkazy(html: str, zaklad: str) -> list[str]:
    """Odkazy na strankach, kde se daji cekat kontakty. Jen tataz domena."""
    polevka = BeautifulSoup(html or "", "lxml")
    domaci = urlparse(zaklad).netloc
    nalezene: list[str] = []
    for kotva in polevka.find_all("a", href=True):
        href = kotva["href"].strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        popis = f"{href} {kotva.get_text(' ', strip=True)}"
        if not KONTAKTNI_VZOR.search(popis):
            continue
        plna = urldefrag(urljoin(zaklad, href))[0]
        if urlparse(plna).netloc != domaci or plna in nalezene or plna == zaklad:
            continue
        nalezene.append(plna)
    return nalezene


def _z_html(html: str) -> tuple[list[tuple[str, str]], list[str]]:
    polevka = BeautifulSoup(html or "", "lxml")
    for znacka in polevka(["script", "style", "noscript"]):
        znacka.decompose()
    text = polevka.get_text(" ", strip=True)
    # mailto: a tel: odkazy nesou kontakty, ktere v textu videt nejsou
    for kotva in polevka.find_all("a", href=True):
        href = kotva["href"].strip()
        if href.lower().startswith(("mailto:", "tel:")):
            text += " " + href.split(":", 1)[1]
    return najdi_emaily(text), najdi_telefony(text)


def stahni_kontakty(
    ico: str, web_url: str, klient_: httpx.Client | None = None
) -> list[dict[str, object]]:
    """Projde titulni stranku a nekolik kontaktnich podstranek."""
    uvod = stahni(web_url, klient_=klient_)
    if uvod is None or uvod.status_code != 200:
        return []

    stranky = [(web_url, uvod.text)]
    for odkaz in kontaktni_odkazy(uvod.text, str(uvod.url))[: MAX_PAGES_PER_SITE - 1]:
        podstranka = stahni(odkaz, klient_=klient_)
        if podstranka is not None and podstranka.status_code == 200:
            stranky.append((odkaz, podstranka.text))

    kontakty: dict[tuple[str, str], dict[str, object]] = {}
    for url, html in stranky:
        emaily, telefony = _z_html(html)
        for email, role in emaily:
            kontakty.setdefault(("email", email), {
                "ico": ico, "typ": "email", "hodnota": email, "role": role,
                "zdroj": "web firmy", "source_url": url, "fetched_at": now(),
            })
        for telefon in telefony:
            kontakty.setdefault(("telefon", telefon), {
                "ico": ico, "typ": "telefon", "hodnota": telefon, "role": "obecny",
                "zdroj": "web firmy", "source_url": url, "fetched_at": now(),
            })
    return list(kontakty.values())
