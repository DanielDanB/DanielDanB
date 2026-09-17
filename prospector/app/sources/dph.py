"""Registr platcu DPH (webova sluzba Financni spravy, ADIS).

Pouzivame ho jako bezplatnou nahradu obratu: registrace k DPH je povinna pri
prekroceni zakonneho obratoveho prahu, takze "platce DPH" je hruby, ale funkcni
signal velikosti. Zaroven odtud bereme priznak nespolehliveho platce, kterym se
daji rovnou vyradit rizikove firmy.

Pozor na jedno zjednoduseni: DIC odvozujeme jako "CZ" + ICO. U pravnickych osob
to plati temer vzdy, u podnikajicich fyzickych osob nikoliv. Pokud sluzba vrati
NENALEZEN, zapisujeme "neznamo", ne "neni platce".
"""
from __future__ import annotations

import re
from xml.etree import ElementTree

import httpx

from app.config import DPH_WSDL_ENDPOINT, HTTP_TIMEOUT_S, USER_AGENT
from app.db import now

NS = "http://adis.mfcr.cz/rozhraniCRPDPH/"

SABLONA = """<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:v1="{ns}">
  <soapenv:Body>
    <v1:StatusNespolehlivyPlatceRequest>
      <v1:dic>{dic}</v1:dic>
    </v1:StatusNespolehlivyPlatceRequest>
  </soapenv:Body>
</soapenv:Envelope>"""


def dic_z_ico(ico: str) -> str:
    return "CZ" + re.sub(r"\D", "", ico or "").zfill(8)


def _lokalni_nazev(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _najdi(koren: ElementTree.Element, nazev: str) -> ElementTree.Element | None:
    for prvek in koren.iter():
        if _lokalni_nazev(prvek.tag) == nazev:
            return prvek
    return None


def rozeber_odpoved(xml: str) -> dict[str, str]:
    """Vytahne z odpovedi status platce. Tolerantni k namespace i k poradi prvku."""
    try:
        koren = ElementTree.fromstring(xml)
    except ElementTree.ParseError:
        return {"platce_dph": "neznamo", "nespolehlivy_platce": "neznamo"}

    status = _najdi(koren, "statusPlatceDPH")
    if status is None:
        chyba = _najdi(koren, "status")
        kod = (chyba.get("statusCode") if chyba is not None else None) or ""
        return {
            "platce_dph": "neznamo",
            "nespolehlivy_platce": "neznamo",
            "poznamka": f"sluzba nevratila status (kod {kod})" if kod else "sluzba nevratila status",
        }

    nespolehlivy = (status.get("nespolehlivyPlatce") or "").upper()
    if nespolehlivy == "NENALEZEN":
        return {"platce_dph": "ne_nebo_neznamo", "nespolehlivy_platce": "neznamo"}
    return {
        "platce_dph": "ano",
        "nespolehlivy_platce": "ano" if nespolehlivy == "ANO" else "ne",
        "cislo_fu": status.get("cisloFu") or "",
    }


def zjisti(ico: str, klient_: httpx.Client | None = None) -> dict[str, str]:
    dic = dic_z_ico(ico)
    telo = SABLONA.format(ns=NS, dic=dic)
    hlavicky = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "",
        "User-Agent": USER_AGENT,
    }
    vlastni = klient_ is None
    c = klient_ or httpx.Client(timeout=HTTP_TIMEOUT_S)
    try:
        odpoved = c.post(DPH_WSDL_ENDPOINT, content=telo.encode("utf-8"), headers=hlavicky)
        if odpoved.status_code != 200:
            return {"platce_dph": "neznamo", "nespolehlivy_platce": "neznamo",
                    "poznamka": f"HTTP {odpoved.status_code}"}
        vysledek = rozeber_odpoved(odpoved.text)
    except Exception as chyba:  # sit, timeout, DNS
        vysledek = {"platce_dph": "neznamo", "nespolehlivy_platce": "neznamo",
                    "poznamka": f"nedostupne: {type(chyba).__name__}"}
    finally:
        if vlastni:
            c.close()
    vysledek["zjisteno"] = now()
    vysledek["source_url"] = DPH_WSDL_ENDPOINT
    return vysledek
