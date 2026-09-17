# Prospector

Vyhledávání potenciálních zákazníků v ČR nad veřejnými daty. Běží lokálně,
nepoužívá žádná placená data ani placené API.

Filtruje firmy podle **oboru (CZ-NACE)**, **kraje** a **počtu zaměstnanců**,
dohledá jim **web** a **obecné firemní kontakty**, doplní **statutární orgán**
a **status plátce DPH**, a výběr vyexportuje do XLSX nebo CSV.

## Spuštění

Bez terminálu: ve složce `prospector` dvojklik na **spustit.bat** (Windows) nebo
**run.sh** (macOS/Linux). Spouštěč si sám připraví prostředí, doinstaluje
závislosti a otevře prohlížeč na <http://127.0.0.1:8000>. Když se příprava
nepovede, zahodí rozdělané prostředí a zkusí to ještě jednou.

Z terminálu:

```bash
cd prospector
./run.sh
```

**Při prvním spuštění klikněte v aplikaci na „Ověřit zdroje“** (viz
[Ověření](#ověření-zdrojů)). Totéž z terminálu: `.venv/bin/python -m app.overit`.

### Závislosti musí zůstat bez kompilace

`requirements.txt` uvádí jen minimální verze, ne přesné připnutí. Je to záměr:
připnutá verze nutí pip stavět balíček ze zdrojáků, když pro danou verzi Pythonu
neexistuje hotový, a na Windows to znamená „Microsoft Visual C++ 14.0 or greater
is required“. Ze stejného důvodu tu není `lxml` (HTML parsuje vestavěný
`html.parser`) ani `uvicorn[standard]`.

**Než přidáte další balíček, ověřte, že je čistý Python** nebo že má hotové
balíčky pro všechny běžné verze Pythonu. Je to zdaleka nejčastější důvod, proč
instalace u někoho spadne.

## Jak se to používá

1. **Načíst firmy z ARESu** – zadáte NACE (např. `46` pro celý velkoobchod),
   zaškrtnete kraje a kolik firem stáhnout. Běží na pozadí, průběh je v *Úlohách*.
2. **Vyfiltrovat** – obor, kraj, rozsah zaměstnanců, jen plátci DPH, jen s webem.
   Nespolehliví plátci DPH jsou ve výchozím stavu vyloučeni.
3. **Obohatit vyfiltrované** – statutáři, DPH, dohledání webu, stažení kontaktů.
   Tohle je pomalé záměrně (viz níže) – pár set firem trvá desítky minut.
4. **Exportovat** – XLSX má druhý list se zdrojem a datem u každého kontaktu.

Doporučený postup: nejdřív si filtrem zúžit výběr na pár set firem, a teprve
ten obohacovat. Obohacování sahá na cizí weby, takže nemá smysl ho pouštět
na tisíce firem, které stejně neoslovíte.

## Zdroje dat

| Zdroj | Co z něj je | Poznámka |
|---|---|---|
| ARES – ekonomické subjekty | IČO, název, adresa, kraj, CZ-NACE, datum vzniku | otevřená data |
| ARES – RES část | kategorie počtu zaměstnanců (pásmo) | u části firem nevyplněno |
| ARES – veřejný rejstřík | jednatelé, představenstvo, dozorčí rada | veřejný rejstřík |
| Registr plátců DPH (ADIS) | plátce DPH, nespolehlivý plátce | náhrada obratu |
| Web firmy | obecné e-maily a telefony | jen s respektem k robots.txt |
| Hlídač státu | počet smluv se státem | volitelné, vyžaduje `HLIDAC_TOKEN` |

### Co tu záměrně není

- **Roční obrat.** Není v žádném bezplatném strojově čitelném zdroji. Účetní
  závěrky ve sbírce listin jsou skenované PDF a zhruba polovina firem je
  nezveřejňuje. Místo obratu použijte kombinaci *pásmo zaměstnanců + plátce DPH*.
- **Jmenné kontakty na nákupčí.** Nejsou ve veřejných registrech a získat je
  zdarma legální cestou nelze. Co dostanete: jednatele ze rejstříku a obecnou
  nákupní adresu z webu (`nakup@`, `poptavky@`, `objednavky@`).
- **Scraping LinkedInu.** Porušuje jejich podmínky, není implementován.

## Právní mantinely

Aplikace je stavěná tak, aby vás držela na bezpečné straně:

- **Ukládají se jen obecné firemní adresy.** E-maily prochází whitelistem
  v `app/compliance.py` – uloží se pouze adresy, jejichž všechny části jsou ve
  slovníku obecných názvů (`info`, `nakup`, `recepce`, `obchod`, …). Jmenná
  adresa typu `jan.novak@firma.cz` se zahodí už při stahování. Obecná firemní
  adresa není osobní údaj, takže se tím vyhnete režimu GDPR pro osobní údaje.
  Whitelist je schválně přísnější, než by musel být.
- **U každého kontaktu se ukládá zdroj, URL a datum.** Na dotaz „odkud to máte“
  je to jediné, co se dá ukázat. Je to i v exportu.
- **Opt-out funguje zpětně.** Tlačítko *opt-out* u kontaktu ho smaže a zařadí na
  blacklist, takže se při dalším stahování nevrátí. Na blacklist jde i celá
  doména nebo celé IČO.
- **Respektuje se robots.txt** a mezi požadavky na tentýž server je prodleva
  (výchozí 1,5 s; ARES 0,35 s). Proto je obohacování pomalé – je to záměr.
- **Rozesílání e-mailů aplikace neumí a umět nebude.** Jen export. Rozesílání
  obchodních sdělení upravuje zákon č. 480/2004 Sb. (pokuta až 10 mil. Kč)
  a je to samostatné rozhodnutí, které má zůstat na vás.

Tohle není právní poradenství. Před ostrou kampaní si nechte postup posoudit.

## Ověření zdrojů

Aplikace vznikla v prostředí, ze kterého nebyly české státní servery dostupné.
Logika je napsaná podle dokumentace a je tolerantní k odchylkám, ale tvar
odpovědí ARESu a ADISu **nebyl ověřen proti živé službě**. Proto:

```bash
.venv/bin/python -m app.overit
```

Projde všechny zdroje a u každého řekne, jestli sedí – včetně toho, jestli
souhlasí číselník krajů a klíč s kategorií počtu zaměstnanců. Pokud něco
nesedí, vypíše, který soubor opravit. Konkrétně hlídané předpoklady:

- kódy krajů v `KRAJE_ARES` (`app/sources/ares.py`) odpovídají RUIAN číselníku,
- RES vrací kategorii počtu pracovníků pod klíčem `kategoriePoctuPracovniku`,
- DIČ jde odvodit jako `CZ` + IČO (u fyzických osob to nemusí platit – proto se
  odpověď „NENALEZEN“ ukládá jako *neznámo*, ne jako *není plátce*).

## Nastavení

Vše přes proměnné prostředí, nic není povinné:

| Proměnná | Výchozí | K čemu |
|---|---|---|
| `PROSPECTOR_CONTACT` | `prospector@example.com` | kontakt v User-Agent – **nastavte si vlastní** |
| `PROSPECTOR_WEB_DELAY` | `1.5` | prodleva mezi dotazy na cizí web (s) |
| `PROSPECTOR_ARES_DELAY` | `0.35` | prodleva mezi dotazy na ARES (s) |
| `PROSPECTOR_DB` | `data/prospector.sqlite3` | cesta k databázi |
| `HLIDAC_TOKEN` | – | zapne obohacení o smlouvy se státem |

Server poslouchá jen na `127.0.0.1` a nemá přihlašování – **není určený
k vystavení na internet.**

## Testy

```bash
.venv/bin/python -m pytest tests/ -q
```

Nejdůležitější je `tests/test_compliance.py` – hlídá, že se do databáze
nedostane jmenná e-mailová adresa. Pokud budete rozšiřovat whitelist, spusťte
ho vždycky.
