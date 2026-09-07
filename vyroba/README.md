# Přehled zakázek — aplikace nad sešitem PREHLED_ZAKAZEK_NOVY.xlsx

Provozní evidence zakázek Obrobny a Svařovny. Jeden HTML soubor, otevře se dvojklikem,
nepotřebuje server ani instalaci.

## Soubory

| soubor | obsah |
|---|---|
| `prehled-zakazek.html` | **hotová aplikace** — otevřít v prohlížeči |
| `data.json` | 4 715 zakázek z let 2017–2026 vytažených z Excelu |
| `src/app.html` | kostra stránky, styly, motiv (světlý / tmavý) |
| `src/app.js` | logika — filtry, harmonogram, kanban, analýzy, editace |
| `build.py` | sestaví `prehled-zakazek.html` ze `src/` a `data.json` |

Po úpravě `src/` spusťte `python3 build.py`.

## Co aplikace přebírá z Excelu

- **Data ze všech ročních listů** (2017–2026). Starší listy mají méně sloupců, tabulka je
  podle zvoleného roku sama přizpůsobuje.
- **Číselníky z listu `Support`** — stavy, střediska, zodpovědné osoby, předčíslí zakázek, priority.
  Jsou editovatelné v sekci *Číselníky*.
- **Podmíněné formátování** — barvy středisek, zelené/červené odlišení dodávek podle
  požadovaného termínu, zvýraznění zakázek po termínu.
- **Harmonogram z listu `Plan`** — dvojřádek plán / skutečnost po dnech měsíce.
  Plán postupně tmavne mezi milníky (objednávka → design → výroba → montáž → ladění → termín),
  milníky a požadovaný termín jsou nejtmavší; skutečnost je modrá, den dodání tmavý,
  překročený termín červený. Barvy odpovídají původním pravidlům v sešitu.
- **Automatické číslo zakázky** ve tvaru `XX-NNN/RR` při zakládání nové zakázky.

## Co přidává navíc

- Přehledová obrazovka s ukazateli (rozpracováno, po termínu, dodrženo termínů, průběžná doba).
- Fulltext přes název, číslo, objednávku, zadavatele i fakturu; řazení kliknutím na záhlaví.
- Kanban se změnou stavu přetažením karty.
- Analýza napříč roky — počty zakázek, dodržení termínů, průběžná doba, nejčastější zadavatelé.
- Export do CSV (středník, UTF-8 — Excel jej otevře přímo) a záloha/obnova celé evidence v JSON.

## Ukládání dat

Úpravy se ukládají do úložiště prohlížeče na daném počítači (`localStorage`).
Tlačítko *Vrátit na původní data z Excelu* v sekci Číselníky vrátí vše do výchozího stavu.

**Další krok:** společné úložiště, aby evidenci sdílelo více lidí najednou.
