# Přehled zakázek — aplikace nad sešitem PREHLED_ZAKAZEK_NOVY.xlsx

Provozní evidence zakázek Obrobny a Svařovny. Jeden HTML soubor, otevře se dvojklikem,
nepotřebuje server ani instalaci.

## Soubory

| soubor | obsah |
|---|---|
| `prehled-zakazek.html` | **hotová aplikace** — otevřít v prohlížeči |
| `data.json` | 4 724 zakázek z let 2017–2026 vytažených z Excelu |
| `etl.py` | znovu vytáhne data z `.xlsx` (`python3 etl.py cesta/k/sesitu.xlsx`) |
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
- Tlačítka **zpět / vpřed** (i `Alt+←` a `Alt+→`) procházejí předchozí pohledy včetně filtrů.
- Tlačítko **Uložit** (`Ctrl+S`); dokud jsou změny neuložené, svítí u něj tečka.
- **Přílohy u zakázky** — faktury a objednávky lze přetáhnout do detailu zakázky nebo vybrat
  z počítače. V seznamu se u takové zakázky objeví sponka.
- Řádky jsou barevně odlišené: pruh vlevo podle stavu (zelená hotovo, modrá výroba,
  oranžová rozpracováno, červená po termínu) a střídavý podklad.

## Kompletnost dat

Sešit má stovky sloučených buněk (jen list 2017 jich má 400) — u navazujících řádků jedné
zakázky je název, číslo i termíny uvedený jen v prvním řádku. `etl.py` sloučené oblasti
rozpouští do všech řádků, takže v aplikaci nezůstává žádná zakázka bez názvu.
Vynechány jsou pouze zcela prázdné řádky a pomocná legenda priorit na konci listu 2026.

## Ukládání dat

Bez nastaveného serveru se vše ukládá do úložiště prohlížeče (`localStorage`), přílohy do
`IndexedDB` téhož prohlížeče. Tlačítko *Vrátit na původní data z Excelu* v sekci Číselníky
vrátí evidenci do výchozího stavu.

### Napojení na váš server

V sekci *Číselníky → Uložení na server* stačí vyplnit adresu API. Server musí na téže adrese
obsloužit dvě operace:

```
GET  /api/zakazky   ->  200  { "orders": [ … ], "dict": { … } }
PUT  /api/zakazky   <-  { "orders": [ … ], "dict": { … } }   ->  200
```

Je-li vyplněn token, posílá se v hlavičce `Authorization: Bearer <token>`.
Tlačítko *Uložit* pak zapisuje na server, *Načíst data ze serveru* stáhne aktuální stav.

Jedna zakázka je plochý objekt s klíči `id, code, name, qty, status, center, owner,
requester, order, dateOrder, planDesign, planProd, planAssembly, planTuning, dateRequired,
dateDelivered, priority, invoice, year, files`. Data jsou ve formátu `RRRR-MM-DD`.

**Zbývá dořešit:** přílohy se zatím posílají jen do prohlížeče. Až bude server hotový,
doplní se k němu koncový bod pro upload souborů (`POST /api/zakazky/{id}/soubory`).
