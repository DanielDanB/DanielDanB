"""Pravidla, ktera rozhoduji, co smi do databaze.

Klicove rozhodnuti: u emailu jedeme na WHITELIST, ne na blacklist. Ulozime jen
adresy, jejichz vsechny casti jsou ve slovniku obecnych firemnich nazvu
(info, nakup, recepce, ...). Cokoliv jineho - vcetne jmennych adres typu
jan.novak@firma.cz - zahazujeme. Obecna firemni adresa neni osobni udaj,
takze se tim drzime mimo rezim GDPR pro osobni udaje.

Whitelist je prisnejsi nez nutne a nechame si tim ujit cast kontaktu. To je
zamer: falesne odmitnuti stoji jeden lead, falesne prijeti stoji pruser.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

ROLE_NAKUP = "nakup"
ROLE_OBCHOD = "obchod"
ROLE_VEDENI = "vedeni"
ROLE_RECEPCE = "recepce"
ROLE_OBECNY = "obecny"

# Token -> role. Poradi roli pri vyhodnoceni urcuje ROLE_PRIORITA nize.
GENERIC_TOKENY: dict[str, str] = {
    # nakup
    "nakup": ROLE_NAKUP, "nakupy": ROLE_NAKUP, "nakupci": ROLE_NAKUP,
    "poptavka": ROLE_NAKUP, "poptavky": ROLE_NAKUP, "objednavka": ROLE_NAKUP,
    "objednavky": ROLE_NAKUP, "zasobovani": ROLE_NAKUP, "sklad": ROLE_NAKUP,
    "purchasing": ROLE_NAKUP, "procurement": ROLE_NAKUP, "purchase": ROLE_NAKUP,
    "orders": ROLE_NAKUP, "order": ROLE_NAKUP, "supply": ROLE_NAKUP,
    # obchod
    "obchod": ROLE_OBCHOD, "obchodni": ROLE_OBCHOD, "prodej": ROLE_OBCHOD,
    "sales": ROLE_OBCHOD, "business": ROLE_OBCHOD, "commerce": ROLE_OBCHOD,
    # vedeni
    "reditel": ROLE_VEDENI, "reditelstvi": ROLE_VEDENI, "jednatel": ROLE_VEDENI,
    "vedeni": ROLE_VEDENI, "management": ROLE_VEDENI, "director": ROLE_VEDENI,
    "ceo": ROLE_VEDENI, "majitel": ROLE_VEDENI,
    # recepce / sekretariat
    "recepce": ROLE_RECEPCE, "reception": ROLE_RECEPCE, "sekretariat": ROLE_RECEPCE,
    "asistentka": ROLE_RECEPCE, "office": ROLE_RECEPCE, "kancelar": ROLE_RECEPCE,
    "ustredna": ROLE_RECEPCE, "podatelna": ROLE_RECEPCE, "spojovatelka": ROLE_RECEPCE,
    # obecne
    "info": ROLE_OBECNY, "mail": ROLE_OBECNY, "email": ROLE_OBECNY,
    "kontakt": ROLE_OBECNY, "kontakty": ROLE_OBECNY, "contact": ROLE_OBECNY,
    "firma": ROLE_OBECNY, "spolecnost": ROLE_OBECNY, "post": ROLE_OBECNY,
    "posta": ROLE_OBECNY, "dotazy": ROLE_OBECNY, "hello": ROLE_OBECNY,
    "servis": ROLE_OBECNY, "service": ROLE_OBECNY, "podpora": ROLE_OBECNY,
    "support": ROLE_OBECNY, "zakaznici": ROLE_OBECNY, "zakaznik": ROLE_OBECNY,
    "centrala": ROLE_OBECNY, "hq": ROLE_OBECNY, "company": ROLE_OBECNY,
}

# Neutralni pritezky, ktere same o sobe roli nenesou, ale nejsou ani jmenem:
# pobocky, jazykove mutace, cislovani.
NEUTRALNI_TOKENY: frozenset[str] = frozenset({
    "cz", "sk", "eu", "com", "cesko", "ceska", "czech", "praha", "prague",
    "brno", "ostrava", "plzen", "liberec", "olomouc", "zlin", "pardubice",
    "hradec", "budejovice", "jihlava", "karlovy", "vary", "usti", "opava",
    "oddeleni", "dept", "department", "pobocka", "centrum", "cr", "sro",
})

ROLE_PRIORITA = [ROLE_NAKUP, ROLE_VEDENI, ROLE_OBCHOD, ROLE_RECEPCE, ROLE_OBECNY]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
# Soubory v HTML (@2x.png, sprite@3x.jpg) chytne emailovy regex taky.
NEEMAIL_PRIPONY = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js")

TEL_RE = re.compile(r"(?:\+?420[\s\-]?)?(?:\d[\s\-]?){9}")


def bez_diakritiky(text: str) -> str:
    rozlozeno = unicodedata.normalize("NFKD", text)
    return "".join(z for z in rozlozeno if not unicodedata.combining(z))


@dataclass(frozen=True)
class Verdikt:
    prijmout: bool
    role: str | None = None
    duvod: str = ""


def posud_email(raw: str) -> Verdikt:
    """Rozhodne, jestli je adresa obecna firemni, a priradi ji roli."""
    if not raw:
        return Verdikt(False, duvod="prazdne")
    email = raw.strip().lower().removeprefix("mailto:").split("?", 1)[0].strip(" .,;:<>()[]\"'")
    if email.count("@") != 1:
        return Verdikt(False, duvod="neni email")
    local, _, domena = email.partition("@")
    if domena.endswith(NEEMAIL_PRIPONY) or local.endswith(NEEMAIL_PRIPONY):
        return Verdikt(False, duvod="nazev souboru, ne email")
    if not re.fullmatch(r"[a-z0-9.\-]+\.[a-z]{2,}", domena):
        return Verdikt(False, duvod="podezrela domena")
    if not local:
        return Verdikt(False, duvod="prazdna cast pred zavinacem")

    tokeny = [t for t in re.split(r"[._\-+]+", bez_diakritiky(local)) if t]
    if not tokeny:
        return Verdikt(False, duvod="nelze rozlozit")

    nalezene_role: list[str] = []
    for token in tokeny:
        if token.isdigit():
            continue
        # "nakup2" / "info24" - cislo na konci je porad tyz token
        holy = token.rstrip("0123456789")
        if holy in GENERIC_TOKENY:
            nalezene_role.append(GENERIC_TOKENY[holy])
            continue
        if holy in NEUTRALNI_TOKENY:
            continue
        return Verdikt(False, duvod=f"neobecna cast '{token}' - nejspis jmenna adresa")

    if not nalezene_role:
        return Verdikt(False, duvod="zadna obecna cast")
    for role in ROLE_PRIORITA:
        if role in nalezene_role:
            return Verdikt(True, role=role, duvod="obecna firemni adresa")
    return Verdikt(True, role=ROLE_OBECNY, duvod="obecna firemni adresa")


def najdi_emaily(text: str) -> list[tuple[str, str]]:
    """Vrati [(email, role)] - jen ty, ktere prosly whitelistem."""
    vysledek: dict[str, str] = {}
    for nalez in EMAIL_RE.findall(text or ""):
        verdikt = posud_email(nalez)
        if verdikt.prijmout and verdikt.role:
            vysledek.setdefault(nalez.strip().lower(), verdikt.role)
    return sorted(vysledek.items())


def normalizuj_telefon(raw: str) -> str | None:
    """Ceske cislo na +420XXXXXXXXX. Cokoliv jineho zahodime."""
    cislice = re.sub(r"[^\d+]", "", raw or "")
    if cislice.startswith("00420"):
        cislice = "+420" + cislice[5:]
    elif cislice.startswith("420") and len(cislice) == 12:
        cislice = "+" + cislice
    if cislice.startswith("+420"):
        zbytek = cislice[4:]
        return f"+420{zbytek}" if len(zbytek) == 9 and zbytek.isdigit() else None
    holy = cislice.lstrip("+")
    if len(holy) == 9 and holy.isdigit() and holy[0] in "234567":
        return f"+420{holy}"
    return None


def najdi_telefony(text: str) -> list[str]:
    nalezene: dict[str, None] = {}
    for nalez in TEL_RE.findall(text or ""):
        cislo = normalizuj_telefon(nalez)
        if cislo:
            nalezene.setdefault(cislo, None)
    return list(nalezene)
