"""Export vyberu do CSV a XLSX.

Kazdy kontakt si s sebou nese zdroj a datum ziskani. Neni to kosmetika: pri
dotazu, odkud adresu mate, je to jedina vec, ktera se da ukazat.
"""
from __future__ import annotations

import csv
import io
import sqlite3
from typing import Any

from openpyxl import Workbook

from app.filters import Filtr, hledej

HLAVICKA_FIRMY = [
    "IČO", "Název", "Kraj", "Okres", "Obec", "Adresa", "NACE", "Zaměstnanci (pásmo)",
    "Plátce DPH", "Web", "Web ověřen podle IČO", "Statutární orgán",
    "E-mail nákup", "E-mail obchod", "E-mail vedení", "E-mail recepce",
    "E-mail obecný", "Telefon",
]
HLAVICKA_KONTAKTY = ["IČO", "Firma", "Typ", "Hodnota", "Role", "Zdroj", "URL zdroje", "Získáno"]


def _detaily(conn: sqlite3.Connection, icos: list[str]) -> dict[str, dict[str, Any]]:
    if not icos:
        return {}
    otazniky = ",".join("?" * len(icos))
    mapa: dict[str, dict[str, Any]] = {ico: {"kontakty": [], "osoby": []} for ico in icos}
    for radek in conn.execute(f"SELECT * FROM kontakt WHERE ico IN ({otazniky})", icos):
        mapa[radek["ico"]]["kontakty"].append(dict(radek))
    for radek in conn.execute(f"SELECT * FROM osoba WHERE ico IN ({otazniky})", icos):
        mapa[radek["ico"]]["osoby"].append(dict(radek))
    return mapa


def _radek_firmy(firma: dict[str, Any], detail: dict[str, Any]) -> list[Any]:
    def emaily(role: str) -> str:
        return ", ".join(k["hodnota"] for k in detail["kontakty"]
                         if k["typ"] == "email" and k["role"] == role)

    telefony = ", ".join(k["hodnota"] for k in detail["kontakty"] if k["typ"] == "telefon")
    statutari = "; ".join(
        f"{o['jmeno']}" + (f" ({o['funkce']})" if o.get("funkce") else "")
        for o in detail["osoby"]
    )
    return [
        firma["ico"], firma["nazev"], firma.get("kraj"), firma.get("okres"),
        firma.get("obec"), firma.get("adresa"), firma.get("nace_hlavni"),
        firma.get("velikost_text"), firma.get("platce_dph"), firma.get("web_url"),
        "ano" if firma.get("web_overeno") else "ne", statutari,
        emaily("nakup"), emaily("obchod"), emaily("vedeni"), emaily("recepce"),
        emaily("obecny"), telefony,
    ]


def do_csv(conn: sqlite3.Connection, filtr: Filtr) -> str:
    firmy = hledej(conn, filtr)
    detaily = _detaily(conn, [f["ico"] for f in firmy])
    vystup = io.StringIO()
    zapisovac = csv.writer(vystup, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    zapisovac.writerow(HLAVICKA_FIRMY)
    for firma in firmy:
        zapisovac.writerow(_radek_firmy(firma, detaily[firma["ico"]]))
    # BOM, aby Excel v cestine spravne precetl diakritiku
    return "﻿" + vystup.getvalue()


def do_xlsx(conn: sqlite3.Connection, filtr: Filtr) -> bytes:
    firmy = hledej(conn, filtr)
    detaily = _detaily(conn, [f["ico"] for f in firmy])

    sesit = Workbook()
    list_firmy = sesit.active
    list_firmy.title = "Firmy"
    list_firmy.append(HLAVICKA_FIRMY)
    for firma in firmy:
        list_firmy.append(_radek_firmy(firma, detaily[firma["ico"]]))

    list_kontakty = sesit.create_sheet("Kontakty a zdroje")
    list_kontakty.append(HLAVICKA_KONTAKTY)
    for firma in firmy:
        for kontakt in detaily[firma["ico"]]["kontakty"]:
            list_kontakty.append([
                firma["ico"], firma["nazev"], kontakt["typ"], kontakt["hodnota"],
                kontakt.get("role"), kontakt.get("zdroj"), kontakt.get("source_url"),
                kontakt.get("fetched_at"),
            ])

    for list_ in (list_firmy, list_kontakty):
        list_.freeze_panes = "A2"
        for sloupec in list_.columns:
            sirka = max((len(str(b.value or "")) for b in sloupec[:200]), default=10)
            list_.column_dimensions[sloupec[0].column_letter].width = min(max(sirka + 2, 10), 55)

    buf = io.BytesIO()
    sesit.save(buf)
    return buf.getvalue()
