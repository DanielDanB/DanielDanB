"""HTTP klient: jedno misto, kde se resi rate limiting, robots.txt a timeouty.

Vsechno stahovani jde pres tohle. Diky tomu nemuze zadny modul omylem zacit
mlatit cizi server bez brzdy.
"""
from __future__ import annotations

import threading
import time
import urllib.robotparser
from urllib.parse import urlparse

import httpx

from app.config import (HTTP_TIMEOUT_S, MAX_PAGE_BYTES, USER_AGENT, WEB_DELAY_S)

_zamek = threading.Lock()
_posledni_pristup: dict[str, float] = {}
_robots_cache: dict[str, urllib.robotparser.RobotFileParser | None] = {}


def _pockej(host: str, prodleva: float) -> None:
    """Drzi minimalni rozestup mezi dotazy na tentyz host."""
    with _zamek:
        posledni = _posledni_pristup.get(host, 0.0)
        ted = time.monotonic()
        spanek = prodleva - (ted - posledni)
        _posledni_pristup[host] = ted + max(spanek, 0.0)
    if spanek > 0:
        time.sleep(spanek)


def klient() -> httpx.Client:
    return httpx.Client(
        headers={"User-Agent": USER_AGENT, "Accept-Language": "cs,en;q=0.8"},
        timeout=HTTP_TIMEOUT_S,
        follow_redirects=True,
    )


def robots_povoluje(url: str, klient_: httpx.Client | None = None) -> bool:
    """True, kdyz robots.txt stahovani nezakazuje. Chybejici robots.txt = povoleno."""
    rozbor = urlparse(url)
    if not rozbor.scheme or not rozbor.netloc:
        return False
    zaklad = f"{rozbor.scheme}://{rozbor.netloc}"
    if zaklad not in _robots_cache:
        parser: urllib.robotparser.RobotFileParser | None = None
        vlastni = klient_ is None
        c = klient_ or klient()
        try:
            _pockej(rozbor.netloc, WEB_DELAY_S)
            odpoved = c.get(f"{zaklad}/robots.txt")
            if odpoved.status_code == 200 and len(odpoved.content) < 500_000:
                parser = urllib.robotparser.RobotFileParser()
                parser.parse(odpoved.text.splitlines())
        except Exception:
            parser = None
        finally:
            if vlastni:
                c.close()
        _robots_cache[zaklad] = parser
    parser = _robots_cache[zaklad]
    return True if parser is None else parser.can_fetch(USER_AGENT, url)


def stahni(
    url: str,
    klient_: httpx.Client | None = None,
    prodleva: float = WEB_DELAY_S,
    respektuj_robots: bool = True,
) -> httpx.Response | None:
    """Stahne stranku. Vrati None, kdyz to robots.txt zakazuje nebo to spadne."""
    if respektuj_robots and not robots_povoluje(url, klient_):
        return None
    vlastni = klient_ is None
    c = klient_ or klient()
    try:
        _pockej(urlparse(url).netloc, prodleva)
        odpoved = c.get(url)
        if len(odpoved.content) > MAX_PAGE_BYTES:
            return None
        return odpoved
    except Exception:
        return None
    finally:
        if vlastni:
            c.close()
