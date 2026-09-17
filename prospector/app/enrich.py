"""Davkove ulohy na pozadi: vyhledani firem a jejich obohaceni.

Jednoduchy fronta + jedno vlakno. Zamerne se nic neparalelizuje - obohacovani
sahá na cizi weby a jeden pomaly, slusny prubeh je lepsi nez rychly, ktery si
vyslouzi ban.
"""
from __future__ import annotations

import json
import queue
import threading
import traceback
from typing import Any, Callable

from app.db import jdumps, now, session
from app.net import klient
from app.sources import ares, ciselniky, contacts, dph, hlidac, vr, web_discovery
from app.storage import (uloz_firmu, uloz_kontakty, uloz_osoby, uloz_priznak, uloz_web)

KROKY = ("statutari", "dph", "web", "kontakty", "hlidac")

_fronta: "queue.Queue[int]" = queue.Queue()
_vlakno: threading.Thread | None = None
_zamek = threading.Lock()


def zaloz_ulohu(druh: str, parametry: dict[str, Any]) -> int:
    with session() as conn:
        kurzor = conn.execute(
            "INSERT INTO uloha (druh, stav, parametry, zalozeno) VALUES (?,?,?,?)",
            (druh, "ceka", jdumps(parametry), now()),
        )
        id_ulohy = int(kurzor.lastrowid)
    _fronta.put(id_ulohy)
    _nastartuj()
    return id_ulohy


def _nastartuj() -> None:
    global _vlakno
    with _zamek:
        if _vlakno is None or not _vlakno.is_alive():
            _vlakno = threading.Thread(target=_smycka, daemon=True, name="prospector-worker")
            _vlakno.start()


def _smycka() -> None:
    while True:
        try:
            id_ulohy = _fronta.get(timeout=5)
        except queue.Empty:
            return
        try:
            _zpracuj(id_ulohy)
        except Exception:
            _uprav(id_ulohy, stav="chyba", log=traceback.format_exc()[-3000:])
        finally:
            _fronta.task_done()


def _uprav(id_ulohy: int, **pole: Any) -> None:
    if not pole:
        return
    if "log" in pole:
        with session() as conn:
            stary = conn.execute("SELECT log FROM uloha WHERE id=?", (id_ulohy,)).fetchone()
            pole["log"] = ((stary["log"] if stary else "") + pole["log"] + "\n")[-20000:]
    sada = ", ".join(f"{k}=?" for k in pole)
    with session() as conn:
        conn.execute(f"UPDATE uloha SET {sada} WHERE id=?", (*pole.values(), id_ulohy))


def _zpracuj(id_ulohy: int) -> None:
    with session() as conn:
        radek = conn.execute("SELECT * FROM uloha WHERE id=?", (id_ulohy,)).fetchone()
    if radek is None or radek["stav"] == "zruseno":
        return
    parametry = json.loads(radek["parametry"] or "{}")
    _uprav(id_ulohy, stav="bezi")
    beh: Callable[[int, dict[str, Any]], None] = {
        "vyhledat": _uloha_vyhledat,
        "obohatit": _uloha_obohatit,
        "ciselnik": _uloha_ciselnik,
    }[radek["druh"]]
    beh(id_ulohy, parametry)
    _uprav(id_ulohy, stav="hotovo", ukonceno=now())


def zajisti_ciselnik(c: Any, rekni: Callable[[str], None]) -> int:
    """Postara se o to, aby byl ciselnik NACE v databazi. Vrati pocet kodu."""
    with session() as conn:
        pocet = ciselniky.mam_ciselnik(conn)
    if pocet:
        return pocet
    rekni("Stahuji číselník oborů z ARESu (jednorázově)...")
    polozky = ciselniky.stahni_nace(c)
    if not polozky:
        rekni("Číselník se stáhnout nepodařilo. Obory proto zadávejte rovnou "
              "pětimístným kódem, např. 46490.")
        return 0
    with session() as conn:
        ciselniky.uloz_nace(conn, polozky)
        pocet = ciselniky.mam_ciselnik(conn)
    rekni(f"Číselník uložen: {pocet} pětimístných kódů.")
    return pocet


def _uloha_ciselnik(id_ulohy: int, _: dict[str, Any]) -> None:
    with klient() as c:
        pocet = zajisti_ciselnik(c, lambda z: _uprav(id_ulohy, log=z))
    _uprav(id_ulohy, hotovo=pocet, celkem=max(pocet, 1))


def _uloha_vyhledat(id_ulohy: int, parametry: dict[str, Any]) -> None:
    limit = int(parametry.get("limit") or 200)
    zadane = parametry.get("nace") or []
    _uprav(id_ulohy, celkem=limit)

    def rekni(zprava: str) -> None:
        _uprav(id_ulohy, log=zprava)

    ulozeno = 0
    with klient() as c:
        if zadane:
            zajisti_ciselnik(c, rekni)
        with session() as conn:
            kody = ciselniky.rozbal(conn, zadane) if zadane else []
        if zadane:
            if not kody:
                rekni(f"Pro zadání {', '.join(zadane)} jsem nenašel žádný pětimístný "
                      "kód NACE. Zkuste obor vybrat ze seznamu.")
                _uprav(id_ulohy, celkem=0)
                return
            rekni(f"Obor {', '.join(zadane)} odpovídá {len(kody)} kódům NACE.")
        rekni(f"Hledám v ARESu, nejvýše {limit} firem.")

        for zaznam in ares.vyhledat(
            nace=kody or None,
            kraje_nuts=parametry.get("kraje") or None,
            limit=limit,
            klient_=c,
            log=rekni,
        ):
            ico = str(zaznam.get("ico") or "").zfill(8)
            res = ares.res_detail(ico, klient_=c) if parametry.get("velikost", True) else None
            firma = ares.na_firmu(zaznam, res)
            with session() as conn:
                uloz_firmu(conn, firma)
            ulozeno += 1
            if ulozeno % 10 == 0:
                _uprav(id_ulohy, hotovo=ulozeno)

    _uprav(id_ulohy, hotovo=ulozeno, celkem=max(ulozeno, 1))
    if ulozeno:
        rekni(f"Hotovo: uloženo {ulozeno} firem. Najdete je ve Vyhledávání.")
    else:
        rekni("ARES nevrátil žádnou firmu. Zkuste širší obor, jiný kraj, nebo "
              "se podívejte do Diagnostiky, co registr odpovídá.")


def _uloha_obohatit(id_ulohy: int, parametry: dict[str, Any]) -> None:
    icos: list[str] = parametry.get("icos") or []
    kroky = [k for k in parametry.get("kroky", KROKY) if k in KROKY]
    _uprav(id_ulohy, celkem=len(icos), log=f"Obohacuji {len(icos)} firem: {', '.join(kroky)}.")

    with klient() as c:
        for poradi, ico in enumerate(icos, start=1):
            try:
                _obohat_jednu(ico, kroky, c)
            except Exception as chyba:
                _uprav(id_ulohy, log=f"  {ico}: chyba {type(chyba).__name__}: {chyba}")
            _uprav(id_ulohy, hotovo=poradi)
    _uprav(id_ulohy, log="Hotovo.")


def _obohat_jednu(ico: str, kroky: list[str], c: Any) -> None:
    with session() as conn:
        radek = conn.execute("SELECT nazev FROM firma WHERE ico=?", (ico,)).fetchone()
        nazev = radek["nazev"] if radek else ""
        stavajici_web = conn.execute("SELECT url FROM web WHERE ico=?", (ico,)).fetchone()

    if "statutari" in kroky:
        data = vr.stahni_vr(ico, klient_=c)
        if data:
            with session() as conn:
                uloz_osoby(conn, vr.osoby(data, ico))

    if "dph" in kroky:
        stav = dph.zjisti(ico, klient_=c)
        with session() as conn:
            uloz_priznak(conn, ico, "platce_dph", stav.get("platce_dph", "neznamo"),
                         "Registr plátců DPH (ADIS)", stav.get("source_url"))
            uloz_priznak(conn, ico, "nespolehlivy_platce",
                         stav.get("nespolehlivy_platce", "neznamo"),
                         "Registr plátců DPH (ADIS)", stav.get("source_url"))

    url = stavajici_web["url"] if stavajici_web else None
    if "web" in kroky and not url and nazev:
        nalez = web_discovery.najdi_web(ico, nazev, klient_=c)
        if nalez:
            with session() as conn:
                uloz_web(conn, nalez)
            url = str(nalez["url"])

    if "kontakty" in kroky and url:
        with session() as conn:
            uloz_kontakty(conn, contacts.stahni_kontakty(ico, url, klient_=c))

    if "hlidac" in kroky and hlidac.je_zapnuty():
        souhrn = hlidac.smlouvy_souhrn(ico, klient_=c)
        if souhrn and "smluv_celkem" in souhrn:
            with session() as conn:
                uloz_priznak(conn, ico, "smlouvy_se_statem", str(souhrn["smluv_celkem"]),
                             "Hlídač státu", souhrn.get("source_url"))
