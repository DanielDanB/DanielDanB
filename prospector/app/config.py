"""Centralni konfigurace. Vse je prepsatelne promennymi prostredi."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("PROSPECTOR_DATA_DIR", BASE_DIR / "data"))
DB_PATH = Path(os.environ.get("PROSPECTOR_DB", DATA_DIR / "prospector.sqlite3"))

# Kontaktni adresa v User-Agent. Slusnost i prakticka nutnost - spravci webu
# podle ni poznaji, kdo je stahuje, a muzou se ozvat misto toho, aby nas zabanovali.
OPERATOR_CONTACT = os.environ.get("PROSPECTOR_CONTACT", "prospector@example.com")
USER_AGENT = f"ProspectorBot/1.0 (+kontakt: {OPERATOR_CONTACT})"

# Rate limiting. ARES sam uvadi jako hranici zneuziti ~500 dotazu/min; drzime se
# hluboko pod ni. U cizich webu jdeme jeste pomaleji - jsou to male servery.
ARES_DELAY_S = float(os.environ.get("PROSPECTOR_ARES_DELAY", "0.35"))
WEB_DELAY_S = float(os.environ.get("PROSPECTOR_WEB_DELAY", "1.5"))
HTTP_TIMEOUT_S = float(os.environ.get("PROSPECTOR_TIMEOUT", "20"))

ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest"
DPH_WSDL_ENDPOINT = "https://adisrws.mfcr.cz/adistc/axis2/services/rozhraniCRPDPH.rozhraniCRPDPHSOAP"
ISIR_WS_ENDPOINT = "https://isir.justice.cz/isir_public_ws/services/IsirWsPublicService"
HLIDAC_BASE = "https://www.hlidacstatu.cz/api/v2"
HLIDAC_TOKEN = os.environ.get("HLIDAC_TOKEN", "")

# Maximalni pocet stranek, ktere u jedne firmy stahneme pri hledani kontaktu.
MAX_PAGES_PER_SITE = int(os.environ.get("PROSPECTOR_MAX_PAGES", "6"))
MAX_PAGE_BYTES = 2_000_000

DATA_DIR.mkdir(parents=True, exist_ok=True)
