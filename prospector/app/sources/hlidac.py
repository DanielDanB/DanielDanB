"""Hlidac statu - volitelne obohaceni o smlouvy se statem.

Neni to firmograficky udaj, ale nakupni signal: kdyz firma pravidelne uzavira
smlouvy se statem, vite, ze nakupuje, v jakych objemech a casto i co.
Vyzaduje bezplatny token (promenna HLIDAC_TOKEN). Bez nej se cela vrstva
jen preskoci - neni povinna.
"""
from __future__ import annotations

from typing import Any

import httpx

from app.config import HLIDAC_BASE, HLIDAC_TOKEN, HTTP_TIMEOUT_S, USER_AGENT
from app.db import now


def je_zapnuty() -> bool:
    return bool(HLIDAC_TOKEN)


def _cislo(hodnota: Any) -> float:
    try:
        return float(hodnota)
    except (TypeError, ValueError):
        return 0.0


def smlouvy_souhrn(ico: str, klient_: httpx.Client | None = None) -> dict[str, Any] | None:
    """Pocet a objem smluv firmy v registru smluv. None = vrstva je vypnuta."""
    if not je_zapnuty():
        return None
    vlastni = klient_ is None
    c = klient_ or httpx.Client(timeout=HTTP_TIMEOUT_S)
    try:
        odpoved = c.get(
            f"{HLIDAC_BASE}/smlouvy/hledat",
            params={"dotaz": f"ico:{ico}", "strana": 1, "razeni": 0},
            headers={"Authorization": f"Token {HLIDAC_TOKEN}", "User-Agent": USER_AGENT},
        )
        if odpoved.status_code != 200:
            return {"stav": f"HTTP {odpoved.status_code}", "zjisteno": now()}
        data = odpoved.json()
        polozky = data.get("Results") or data.get("results") or []
        celkem = data.get("Total") or data.get("total") or len(polozky)
        objem = sum(_cislo(p.get("hodnotaBezDph") or p.get("hodnotaVcetneDph")) for p in polozky)
        return {
            "smluv_celkem": int(celkem),
            "objem_vzorku_kc": round(objem),
            "zjisteno": now(),
            "source_url": f"https://www.hlidacstatu.cz/subjekt/{ico}",
        }
    except Exception as chyba:
        return {"stav": f"nedostupne: {type(chyba).__name__}", "zjisteno": now()}
    finally:
        if vlastni:
            c.close()
