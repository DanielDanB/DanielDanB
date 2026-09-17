"""Testovaci prostredi. DB se nastavuje pred prvnim importem app.*, protoze
app.config cte promenne prostredi uz pri importu."""
import os
import tempfile

_docasny = tempfile.mkdtemp(prefix="prospector-test-")
os.environ["PROSPECTOR_DATA_DIR"] = _docasny
os.environ["PROSPECTOR_DB"] = os.path.join(_docasny, "test.sqlite3")

import pytest  # noqa: E402

from app.db import init_db, session  # noqa: E402
from app.storage import uloz_firmu, uloz_kontakty, uloz_osoby, uloz_priznak, uloz_web  # noqa: E402


@pytest.fixture()
def conn():
    init_db()
    with session() as c:
        for tabulka in ("kontakt", "osoba", "web", "priznak", "blacklist", "firma", "uloha"):
            c.execute(f"DELETE FROM {tabulka}")
        c.commit()
        yield c


@pytest.fixture()
def naplnena(conn):
    uloz_firmu(conn, {"ico": "00000001", "nazev": "Alfa CNC s.r.o.", "kraj_kod": "CZ064",
                      "kraj": "Jihomoravský kraj", "obec": "Brno", "nace_hlavni": "2562",
                      "nace_vse": ["2562"], "velikost_min": 25, "velikost_max": 49,
                      "velikost_text": "25 - 49", "aktivni": 1})
    uloz_firmu(conn, {"ico": "00000002", "nazev": "Beta Velkoobchod a.s.", "kraj_kod": "CZ010",
                      "kraj": "Hlavní město Praha", "nace_hlavni": "4649",
                      "nace_vse": ["4649", "4690"], "velikost_min": 6, "velikost_max": 9,
                      "velikost_text": "6 - 9", "aktivni": 1})
    uloz_priznak(conn, "00000001", "platce_dph", "ano", "ADIS")
    uloz_priznak(conn, "00000002", "nespolehlivy_platce", "ano", "ADIS")
    uloz_web(conn, {"ico": "00000001", "url": "https://alfa.cz", "domena": "alfa.cz",
                    "overeno_ico": 1, "metoda": "odhad domény + ověření IČO"})
    uloz_kontakty(conn, [{"ico": "00000001", "typ": "email", "hodnota": "nakup@alfa.cz",
                          "role": "nakup", "zdroj": "web firmy",
                          "source_url": "https://alfa.cz/kontakty"}])
    uloz_osoby(conn, [{"ico": "00000001", "jmeno": "Jan Novák", "funkce": "jednatel",
                       "organ": "jednatelé", "zdroj": "ARES/VR", "source_url": "https://x"}])
    # Bez commitu by fixtura drzela zapisovy zamek a pozadavky aplikace by cekaly.
    conn.commit()
    return conn
