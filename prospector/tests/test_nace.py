"""ARES přijímá NACE jen jako přesně pětimístné kódy. Tyhle testy hlídají,
že se na to nezapomene — dřív kvůli tomu vyhledávání tiše nevracelo nic."""
from fastapi.testclient import TestClient

from app.main import app
from app.sources.ares import vyhledat
from app.sources.ciselniky import _dvojice, mam_ciselnik, naseptavac, rozbal, uloz_nace

klient = TestClient(app)

CISELNIK = [("46", "Velkoobchod"), ("4649", "Velkoobchod s ostatními výrobky"),
            ("46490", "VO s ostatními výrobky pro domácnost"),
            ("46900", "Nespecializovaný velkoobchod"),
            ("25620", "Obrábění"), ("25610", "Povrchová úprava kovů")]


def test_ciselnik_se_rozparsuje_i_ze_zanorene_obalky():
    obalka = {"odpoved": {"polozky": [{"kod": "46490", "nazev": "VO"}]}}
    assert list(_dvojice(obalka)) == [("46490", "VO")]


def test_obor_se_rozbali_na_petimistne_kody(conn):
    uloz_nace(conn, CISELNIK)
    assert mam_ciselnik(conn) == 4
    assert rozbal(conn, ["46"]) == ["46490", "46900"]
    assert rozbal(conn, ["2562"]) == ["25620"]
    assert rozbal(conn, ["46490"]) == ["46490"]


def test_rozbaleni_nesmi_vracet_duplicity(conn):
    uloz_nace(conn, CISELNIK)
    assert rozbal(conn, ["46", "46490", "464"]) == ["46490", "46900"]


def test_bez_ciselniku_si_poradime_aspon_u_ctyrmistneho(conn):
    # Pětimístný kód bývá čtyřmístný plus jedna číslice, takže výčet dává smysl.
    assert rozbal(conn, ["9999"]) == [f"9999{i}" for i in range(10)]
    # U dvoumístného by výčet znamenal tisíc variant, to raději neděláme.
    assert rozbal(conn, ["99"]) == []


def test_ctyrmistny_kod_neprojde_tise(conn):
    hlasky: list[str] = []
    assert list(vyhledat(nace=["4649"], limit=5, log=hlasky.append)) == []
    assert any("pět číslic" in h for h in hlasky)
    assert any("pětimístné" in h for h in hlasky)


def test_naseptavac_hleda_v_kodu_i_v_nazvu(conn):
    uloz_nace(conn, CISELNIK)
    assert naseptavac(conn, "obráb") == [{"kod": "25620", "nazev": "Obrábění"}]
    assert {p["kod"] for p in naseptavac(conn, "464")} == {"4649", "46490"}


def test_api_naseptavace(naplnena):
    uloz_nace(naplnena, CISELNIK)
    naplnena.commit()
    odpoved = klient.get("/api/nace?q=velkoobchod")
    assert odpoved.status_code == 200
    # "46490" se jmenuje "VO s ostatními výrobky", slovo velkoobchod v názvu nemá
    assert {p["kod"] for p in odpoved.json()} == {"46", "4649", "46900"}


def test_prazdny_ciselnik_vrati_prazdno_ne_chybu(naplnena):
    assert klient.get("/api/nace?q=cokoliv").json() == []
