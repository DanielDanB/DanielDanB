"""Webove UI. Bezi lokalne, bez prihlasovani - neni urcene na verejny internet."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import BASE_DIR
from app.db import KRAJE, init_db, session
from app.enrich import KROKY, zaloz_ulohu
from app.export import do_csv, do_xlsx
from app.filters import Filtr, hledej, spocitej
from app.sources.hlidac import je_zapnuty as hlidac_zapnuty
from app.storage import firma as nacti_firmu
from app.storage import pridej_na_blacklist

@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


app = FastAPI(title="Prospector", docs_url=None, redoc_url=None, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "app" / "static"), name="static")
sablony = Jinja2Templates(directory=str(BASE_DIR / "app" / "templates"))

POPIS_PRIZNAKU = {
    "platce_dph": "Plátce DPH",
    "nespolehlivy_platce": "Nespolehlivý plátce",
    "smlouvy_se_statem": "Smluv se státem",
}
POPIS_ROLE = {
    "nakup": "nákup", "obchod": "obchod", "vedeni": "vedení",
    "recepce": "recepce", "obecny": "obecný",
}
sablony.env.globals["popis_priznaku"] = lambda k: POPIS_PRIZNAKU.get(k, k.replace("_", " "))
sablony.env.globals["popis_role"] = lambda r: POPIS_ROLE.get(r or "", r or "–")

# Casto pouzivane oddily CZ-NACE jako napoveda ve formulari.
NACE_NAPOVEDA = [
    ("10", "Výroba potravin"), ("13", "Výroba textilií"), ("16", "Zpracování dřeva"),
    ("20", "Výroba chemických látek"), ("22", "Výroba plastů a pryže"),
    ("23", "Výroba skla a stavebních hmot"), ("24", "Výroba a hutní zpracování kovů"),
    ("25", "Výroba kovových konstrukcí a výrobků"), ("26", "Elektronika a optika"),
    ("27", "Výroba elektrických zařízení"), ("28", "Výroba strojů a zařízení"),
    ("29", "Výroba motorových vozidel"), ("31", "Výroba nábytku"),
    ("33", "Opravy a instalace strojů"), ("41", "Pozemní stavitelství"),
    ("43", "Specializované stavební činnosti"), ("45", "Prodej a opravy vozidel"),
    ("46", "Velkoobchod"), ("47", "Maloobchod"), ("49", "Pozemní doprava"),
    ("52", "Skladování a podpůrné činnosti v dopravě"), ("55", "Ubytování"),
    ("56", "Stravování a pohostinství"), ("62", "IT služby"),
    ("68", "Činnosti v oblasti nemovitostí"), ("71", "Architektura a inženýrství"),
    ("81", "Úklid a správa budov"), ("86", "Zdravotní péče"),
]


def _filtr_z_parametru(p: dict[str, Any]) -> Filtr:
    def cislo(klic: str) -> int | None:
        hodnota = (p.get(klic) or "").strip() if isinstance(p.get(klic), str) else p.get(klic)
        try:
            return int(hodnota) if hodnota not in (None, "") else None
        except (TypeError, ValueError):
            return None

    def prepinac(klic: str) -> bool:
        return str(p.get(klic, "")).lower() in ("1", "true", "on", "ano")

    nace = [c.strip() for c in (p.get("nace") or "").replace(";", ",").split(",") if c.strip()]
    kraje = p.get("kraje") or []
    if isinstance(kraje, str):
        kraje = [k for k in kraje.split(",") if k]
    return Filtr(
        nace=nace,
        kraje=list(kraje),
        zamestnanci_min=cislo("zamestnanci_min"),
        zamestnanci_max=cislo("zamestnanci_max"),
        platce_dph=prepinac("platce_dph"),
        vyloucit_nespolehlive=prepinac("vyloucit_nespolehlive"),
        jen_s_webem=prepinac("jen_s_webem"),
        jen_s_kontaktem=prepinac("jen_s_kontaktem"),
        nazev=(p.get("nazev") or "").strip(),
        razeni=p.get("razeni") or "nazev",
        limit=cislo("limit") or 200,
    )


def _parametry(request: Request) -> dict[str, Any]:
    data = dict(request.query_params)
    data["kraje"] = request.query_params.getlist("kraje")
    return data


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> Any:
    parametry = _parametry(request)
    # Prvni navsteva bez parametru: nezasrtavat rovnou vsechno, ale rozumny vychozi stav
    if not request.query_params:
        parametry["vyloucit_nespolehlive"] = "on"
    filtr = _filtr_z_parametru(parametry)
    with session() as conn:
        vysledky = hledej(conn, filtr)
        celkem = spocitej(conn, filtr)
        v_databazi = int(conn.execute("SELECT COUNT(*) FROM firma").fetchone()[0])
        ulohy = [dict(r) for r in conn.execute(
            "SELECT * FROM uloha ORDER BY id DESC LIMIT 5")]
    return sablony.TemplateResponse(request, "index.html", {
        "vysledky": vysledky, "celkem": celkem, "v_databazi": v_databazi,
        "filtr": filtr, "kraje": KRAJE, "nace_napoveda": NACE_NAPOVEDA,
        "ulohy": ulohy, "kroky": KROKY, "hlidac": hlidac_zapnuty(),
        "dotaz": request.url.query,
    })


@app.post("/vyhledat")
def vyhledat(
    nace: str = Form(""),
    kraje: list[str] = Form(default=[]),
    limit: int = Form(200),
) -> RedirectResponse:
    seznam_nace = [c.strip() for c in nace.replace(";", ",").split(",") if c.strip()]
    zaloz_ulohu("vyhledat", {
        "nace": seznam_nace, "kraje": kraje, "limit": max(1, min(limit, 5000)),
    })
    return RedirectResponse("/ulohy", status_code=303)


@app.post("/obohatit")
async def obohatit(request: Request) -> RedirectResponse:
    formular = await request.form()
    parametry = {k: v for k, v in formular.items()}
    parametry["kraje"] = formular.getlist("kraje")
    kroky = formular.getlist("kroky") or list(KROKY)
    filtr = _filtr_z_parametru(parametry)
    filtr.limit = min(filtr.limit, 2000)
    with session() as conn:
        icos = [r["ico"] for r in hledej(conn, filtr)]
    zaloz_ulohu("obohatit", {"icos": icos, "kroky": kroky})
    return RedirectResponse("/ulohy", status_code=303)


@app.get("/ulohy", response_class=HTMLResponse)
def ulohy(request: Request) -> Any:
    with session() as conn:
        seznam = [dict(r) for r in conn.execute("SELECT * FROM uloha ORDER BY id DESC LIMIT 30")]
    return sablony.TemplateResponse(request, "ulohy.html", {"ulohy": seznam})


@app.get("/api/ulohy")
def api_ulohy() -> list[dict[str, Any]]:
    with session() as conn:
        return [dict(r) for r in conn.execute(
            "SELECT id, druh, stav, hotovo, celkem FROM uloha ORDER BY id DESC LIMIT 30")]


@app.get("/firma/{ico}", response_class=HTMLResponse)
def detail_firmy(request: Request, ico: str) -> Any:
    with session() as conn:
        data = nacti_firmu(conn, ico)
    if data is None:
        return HTMLResponse("<h1>Firma nenalezena</h1>", status_code=404)
    return sablony.TemplateResponse(request, "firma.html", {"f": data})


@app.post("/blacklist")
def blacklist(hodnota: str = Form(...), druh: str = Form("email"),
              duvod: str = Form("opt-out"), zpet: str = Form("/")) -> RedirectResponse:
    with session() as conn:
        pridej_na_blacklist(conn, hodnota, druh, duvod)
    return RedirectResponse(zpet, status_code=303)


@app.get("/export.csv")
def export_csv(request: Request) -> Response:
    filtr = _filtr_z_parametru(_parametry(request))
    filtr.limit = min(filtr.limit, 10000)
    with session() as conn:
        obsah = do_csv(conn, filtr)
    return Response(obsah, media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": 'attachment; filename="prospekty.csv"'})


@app.get("/export.xlsx")
def export_xlsx(request: Request) -> Response:
    filtr = _filtr_z_parametru(_parametry(request))
    filtr.limit = min(filtr.limit, 10000)
    with session() as conn:
        obsah = do_xlsx(conn, filtr)
    return Response(
        obsah,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="prospekty.xlsx"'},
    )
