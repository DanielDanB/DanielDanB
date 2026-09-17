"""Nejdulezitejsi testy v projektu: hlidaji, ze se do DB nedostane jmenna adresa."""
import pytest

from app.compliance import najdi_emaily, najdi_telefony, normalizuj_telefon, posud_email

PRIJATELNE = [
    ("info@firma.cz", "obecny"), ("nakup@firma.cz", "nakup"),
    ("objednavky@firma.cz", "nakup"), ("purchasing@firma.cz", "nakup"),
    ("obchod@firma.cz", "obchod"), ("sales@firma.cz", "obchod"),
    ("recepce@firma.cz", "recepce"), ("sekretariat@firma.cz", "recepce"),
    ("reditel@firma.cz", "vedeni"), ("NAKUP2@Firma.CZ", "nakup"),
    ("obchod.praha@firma.cz", "obchod"), ("info-cz@firma.cz", "obecny"),
    ("nakup_sklad@firma.cz", "nakup"),
]

ODMITNUTE = [
    "jan.novak@firma.cz", "j.novak@firma.cz", "novak@firma.cz", "petr@firma.cz",
    "jan.novak.ml@firma.cz", "pavel_dvorak@firma.cz", "info@2x.png", "neco",
    "@firma.cz", "info@", "", "jana@firma.cz",
]


@pytest.mark.parametrize("email,role", PRIJATELNE)
def test_obecne_adresy_prijmeme(email, role):
    verdikt = posud_email(email)
    assert verdikt.prijmout, f"{email} mel projit: {verdikt.duvod}"
    assert verdikt.role == role


@pytest.mark.parametrize("email", ODMITNUTE)
def test_jmenne_a_nevalidni_adresy_odmitneme(email):
    assert not posud_email(email).prijmout, f"{email} nemel projit"


def test_nakup_ma_prednost_pred_obecnym():
    # "info.nakup@" chceme videt jako nakupni kontakt, ne jako obecny
    assert posud_email("info.nakup@firma.cz").role == "nakup"


def test_najdi_emaily_filtruje_text():
    text = "Napište na info@a.cz, nákup: nakup@a.cz, jednatel jan.novak@a.cz"
    assert najdi_emaily(text) == [("info@a.cz", "obecny"), ("nakup@a.cz", "nakup")]


@pytest.mark.parametrize("vstup,cekano", [
    ("+420 604 123 456", "+420604123456"),
    ("604123456", "+420604123456"),
    ("00420 604 123 456", "+420604123456"),
    ("+421 604 123 456", None),
    ("123", None),
])
def test_telefony(vstup, cekano):
    assert normalizuj_telefon(vstup) == cekano


def test_najdi_telefony_deduplikuje():
    assert najdi_telefony("tel +420604123456 a taky 604 123 456") == ["+420604123456"]
