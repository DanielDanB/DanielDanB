from fastapi.testclient import TestClient

from app.main import app

klient = TestClient(app)


def test_uvodni_stranka_se_vykresli(naplnena):
    odpoved = klient.get("/")
    assert odpoved.status_code == 200
    assert "Alfa CNC s.r.o." in odpoved.text
    # vychozi stav vylucuje nespolehlive platce
    assert "Beta Velkoobchod" not in odpoved.text


def test_filtr_z_url_parametru_funguje(naplnena):
    assert "Alfa CNC" not in klient.get("/?kraje=CZ010").text
    assert "Alfa CNC" in klient.get("/?kraje=CZ064").text
    assert "Beta Velkoobchod" in klient.get("/?vyloucit_nespolehlive=").text


def test_detail_firmy_ukazuje_zdroj_kontaktu(naplnena):
    odpoved = klient.get("/firma/00000001")
    assert odpoved.status_code == 200
    assert "nakup@alfa.cz" in odpoved.text
    assert "https://alfa.cz/kontakty" in odpoved.text  # provenience je videt v UI
    assert "Jan Novák" in odpoved.text


def test_neznama_firma_vraci_404(naplnena):
    assert klient.get("/firma/99999999").status_code == 404


def test_opt_out_smaze_kontakt_a_zabrani_navratu(naplnena):
    odpoved = klient.post("/blacklist", data={"hodnota": "nakup@alfa.cz", "druh": "email",
                                              "zpet": "/"}, follow_redirects=False)
    assert odpoved.status_code == 303
    assert "nakup@alfa.cz" not in klient.get("/firma/00000001").text


def test_exporty_vraci_spravne_typy(naplnena):
    csv_ = klient.get("/export.csv?kraje=CZ064")
    assert csv_.status_code == 200 and "nakup@alfa.cz" in csv_.text
    xlsx = klient.get("/export.xlsx")
    assert xlsx.status_code == 200
    assert xlsx.content[:2] == b"PK"  # xlsx je zip
    assert "attachment" in xlsx.headers["content-disposition"]


def test_stranka_uloh_a_api(naplnena):
    assert klient.get("/ulohy").status_code == 200
    assert klient.get("/api/ulohy").json() == []
