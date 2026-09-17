from app.sources.ares import KRAJE_ARES, NUTS_NA_ARES, na_firmu
from app.sources.contacts import _z_html, kontaktni_odkazy
from app.sources.dph import dic_z_ico, rozeber_odpoved
from app.sources.vr import osoby
from app.sources.web_discovery import kandidatni_domeny, obsahuje_ico

VR_VZOREK = {"zaznamy": [{"ico": "1", "statutarniOrgany": [{"nazevOrganu": "jednatelé",
    "clenoveOrganu": [
        {"fyzickaOsoba": {"jmeno": "Jan", "prijmeni": "Novák"},
         "clenstvi": {"nazevFunkce": "jednatel"}},
        {"fyzickaOsoba": {"jmeno": "Eva", "prijmeni": "Dvořáková"},
         "clenstvi": {"nazevFunkce": "jednatelka"}}]}]}]}


def test_vsech_14_kraju_ma_jedinecny_nuts_kod():
    assert len(KRAJE_ARES) == 14
    assert len(NUTS_NA_ARES) == 14


def test_prevod_ares_zaznamu_na_firmu():
    firma = na_firmu(
        {"ico": "1", "obchodniJmeno": "X s.r.o.", "czNace": ["4649"],
         "sidlo": {"kodKraje": 19, "nazevObce": "Praha", "psc": 11000}},
        {"kategoriePoctuPracovniku": "430"})
    assert firma["ico"] == "00000001"  # doplneni na 8 mist
    assert firma["kraj_kod"] == "CZ010"
    assert (firma["velikost_text"], firma["velikost_min"], firma["velikost_max"]) == ("25 - 49", 25, 49)


def test_zaniklou_firmu_oznacime_jako_neaktivni():
    firma = na_firmu({"ico": "1", "obchodniJmeno": "X", "datumZaniku": "2020-01-01"}, None)
    assert firma["aktivni"] == 0


def test_vr_priradi_kazdemu_cleni_jeho_vlastni_funkci():
    nalezene = {o["jmeno"]: o["funkce"] for o in osoby(VR_VZOREK, "1")}
    assert nalezene == {"Jan Novák": "jednatel", "Eva Dvořáková": "jednatelka"}


def test_vr_snese_jiny_tvar_schematu():
    alt = {"zaznamy": [{"statutarniOrgan": {"nazevOrganu": "představenstvo", "clenoveOrganu": [
        {"fyzickaOsoba": {"jmeno": "Alena", "prijmeni": "Krátká"}, "nazevFunkce": "předsedkyně"}]}}]}
    (osoba,) = osoby(alt, "1")
    assert (osoba["jmeno"], osoba["funkce"], osoba["organ"]) == \
        ("Alena Krátká", "předsedkyně", "představenstvo")


def test_kandidatni_domeny_odstrani_pravni_formu():
    domeny = kandidatni_domeny("Novák Trading s.r.o.")
    assert "novaktrading.cz" in domeny and "novak-trading.cz" in domeny
    assert not any("sro" in d for d in domeny)


def test_ico_na_webu_se_pozna_i_s_mezerami():
    assert obsahuje_ico("IČO: 270 74 358", "27074358")
    assert not obsahuje_ico("IČO: 12345678", "27074358")


def test_crawler_nesbira_odkazy_na_cizi_domeny():
    html = '<a href="/kontakty">Kontakty</a><a href="https://jinde.cz/kontakt">cizí</a>'
    assert kontaktni_odkazy(html, "https://firma.cz/") == ["https://firma.cz/kontakty"]


def test_z_html_zahodi_jmennou_adresu_a_najde_mailto():
    html = '<a href="mailto:nakup@firma.cz">poptávky</a><p>jan.novak@firma.cz</p>'
    emaily, _ = _z_html(html)
    assert emaily == [("nakup@firma.cz", "nakup")]


def test_dph_nenalezen_neznamena_ze_neni_platce():
    xml = ('<E xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/">'
           '<statusPlatceDPH nespolehlivyPlatce="NENALEZEN"/></E>')
    assert rozeber_odpoved(xml)["platce_dph"] == "ne_nebo_neznamo"
    assert rozeber_odpoved(xml)["nespolehlivy_platce"] == "neznamo"


def test_dph_rozpozna_nespolehliveho_platce():
    xml = ('<E xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/">'
           '<statusPlatceDPH nespolehlivyPlatce="ANO" cisloFu="001"/></E>')
    vysledek = rozeber_odpoved(xml)
    assert vysledek["platce_dph"] == "ano" and vysledek["nespolehlivy_platce"] == "ano"


def test_dph_snese_rozbitou_odpoved():
    assert rozeber_odpoved("<nedokoncene")["platce_dph"] == "neznamo"
    assert dic_z_ico("1234567") == "CZ01234567"
