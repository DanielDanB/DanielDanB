# Přehled zakázek — aplikace nad sešitem PREHLED_ZAKAZEK_NOVY.xlsx

Provozní evidence zakázek Obrobny a Svařovny.

Běží dvěma způsoby: jako **jeden HTML soubor** otevřený dvojklikem (nic se neinstaluje,
data zůstávají v tom prohlížeči), nebo **na serveru**, kde data i přílohy sdílí celý tým.
Instalace serveru je v [`server/README.md`](server/README.md) — na Windows dvojklik na
`spustit-windows.bat`, na Linuxu jedna služba pro systemd. Instaluje se **jen na jeden
počítač**, ostatní otevřou jeho adresu v prohlížeči; změna uložená na jednom se ostatním
objeví sama do 15 vteřin.

## Soubory

| soubor | obsah |
|---|---|
| `prehled-zakazek.html` | **hotová aplikace** — otevřít v prohlížeči |
| `data.json` | 4 724 zakázek z let 2017–2026 vytažených z Excelu |
| `etl.py` | znovu vytáhne data z `.xlsx` (`python3 etl.py cesta/k/sesitu.xlsx`) |
| `src/app.html` | kostra stránky, styly, motiv (světlý / tmavý) |
| `src/app.js` | logika — filtry, harmonogram, kanban, analýzy, editace |
| `build.py` | sestaví `prehled-zakazek.html` ze `src/` a `data.json` |
| `server/` | server pro provoz ve firmě + mezikrok na ARES — viz `server/README.md` |

Po úpravě `src/` spusťte `python3 build.py`.

## Co aplikace přebírá z Excelu

- **Data ze všech ročních listů** (2017–2026). Starší listy mají méně sloupců, tabulka je
  podle zvoleného roku sama přizpůsobuje.
- **Číselníky z listu `Support`** — stavy, střediska, zodpovědné osoby, předčíslí zakázek, priority.
  Jsou editovatelné v sekci *Číselníky*.
- **Podmíněné formátování** — barvy středisek, zelené/červené odlišení dodávek podle
  požadovaného termínu, zvýraznění zakázek po termínu.
- **Harmonogram z listu `Plan`** v podobě skutečného Ganttova diagramu — viz níže.
- **Automatické číslo zakázky** ve tvaru `XX-NNN/RR` při zakládání nové zakázky.

## Co přidává navíc

- Přehledová obrazovka s ukazateli (rozpracováno, po termínu, dodrženo termínů, průběžná doba).
- Fulltext přes název, číslo, objednávku, zadavatele i fakturu; řazení kliknutím na záhlaví.
- Kanban se změnou stavu přetažením karty.
- Analýza napříč roky — počty zakázek, dodržení termínů, průběžná doba, nejčastější zadavatelé.
- Export do CSV (středník, UTF-8 — Excel jej otevře přímo) a záloha/obnova celé evidence v JSON.
- Tlačítka **zpět / vpřed** (i `Alt+←` a `Alt+→`) procházejí předchozí pohledy včetně filtrů.
- Tlačítko **Uložit** (`Ctrl+S`); dokud jsou změny neuložené, svítí u něj tečka.
- **Hotové zakázky jako samostatná složka.** Jakmile zakázka dostane stav *Hotovo*, zmizí
  z rozpracovaných a objeví se zde. Teprve tady se zadává číslo faktury, zaškrtává
  *Vyfakturováno* a přikládá sken. Rozpracované zakázky ani formulář nové zakázky
  o fakturách nevědí. V nabídce svítí počet zakázek čekajících na fakturaci.
- **Přílohy u zakázky** — objednávku lze přetáhnout do detailu nebo vybrat z počítače,
  fakturu pak u hotové zakázky. Zobrazí se náhledem přímo v detailu, otevřít je lze
  i v novém okně (↗) nebo stáhnout. V seznamu se u takové zakázky objeví sponka.
- **Předčíslí zakázky se vybírá ze seznamu** už při zakládání, včetně vysvětlivky, komu patří.
  V *Číselníky → Předčíslí zakázek* je legenda, do které si kolegové dopisují, která zkratka
  patří které firmě nebo účelu.
- **Zákazníci a ARES.** V číselnících se firma založí zadáním IČO a načtením z registru ARES
  (přes mezikrok ve složce `server/`), nebo ručně. Seznam je řazený abecedně a nabízí se u zakázky, takže se ARES nemusí volat
  pokaždé; u nové zakázky lze firmu doplnit tlačítkem *+ ARES*.
- **Potvrzení objednávky** pro zákazníka — tlačítko v detailu zakázky otevře hotový
  tiskový dokument A4 (dodavatel, odběratel, předmět, pracnost, plán, potvrzený termín,
  podpisy) připravený k tisku nebo uložení do PDF.
- **Odhad hodin** rozdělený na obrobnu a svařovnu, zadává se u každé zakázky včetně nové.
  Hodiny se počítají do měsíce požadovaného termínu; měsíční součet i rozdělení mezi
  střediska jsou v ukazatelích na přehledu a v grafu *Kapacita v hodinách* po měsících.
- Řádky jsou barevně odlišené: pruh vlevo podle stavu (zelená hotovo, modrá výroba,
  oranžová rozpracováno, červená po termínu) a střídavý podklad.

## Plán výroby

Jeden řádek na zakázku, ne dva řádky buněk jako v sešitu:

- **Pruh plánu** rozdělený na fáze mezi milníky (objednávka → design → výroba → montáž →
  ladění → termín), každá fáze o odstín tmavší. Najetím myší se ukáže, o kterou fázi jde.
- **Kosočtverec** = požadovaný termín; červený, pokud je překročený.
- **Tenký pruh pod plánem** = skutečnost od objednávky po dodání; část za termínem je
  červená, kolečko označuje den dodání.
- **Svislá čára** = dnešek, víkendy jsou podbarvené, měsíce oddělené.
- **Měřítko** dny / týdny / měsíce, tlačítko *Skočit na dnešek*.
- **Seskupení podle střediska** (obrobna, svařovna) do plaveckých drah.
- **Vytížení** pod diagramem — odhadované hodiny rozpočítané rovnoměrně na pracovní dny
  plánovaného okna, po dnech a rozdělené mezi střediska. Ukazuje, kdy se práce kupí.

## Kompletnost dat

Sešit má stovky sloučených buněk (jen list 2017 jich má 400) — u navazujících řádků jedné
zakázky je název, číslo i termíny uvedený jen v prvním řádku. `etl.py` sloučené oblasti
rozpouští do všech řádků, takže v aplikaci nezůstává žádná zakázka bez názvu.
Vynechány jsou pouze zcela prázdné řádky a pomocná legenda priorit na konci listu 2026.

## Dialogy

Aplikace nepoužívá `alert`, `confirm` ani `prompt` — vložené zobrazení stránky je umí
umlčet a tlačítko by pak tiše nic neudělalo. Všechna potvrzení a dotazy jsou vlastní okna.

Okna se **vrství**: každé si drží vlastní podklad a při zavření odebere jen ten svůj,
`Esc` zavírá vždy jen to vrchní. Obsah `#overlay` se nikdy nepřepisuje přes `innerHTML` —
okno pod ním by se překreslilo bez posluchačů událostí a zůstalo by viset.

## Ukládání dat

Bez nastaveného serveru se vše ukládá do úložiště prohlížeče (`localStorage`), přílohy do
`IndexedDB` téhož prohlížeče. Tlačítko *Vrátit na původní data z Excelu* v sekci Číselníky
vrátí evidenci do výchozího stavu.

### Napojení na váš server

Nejjednodušší cesta je použít `server/server.js` — aplikace otevřená z něj se **připojí sama**
a nic se nevyplňuje. Ukládá zakázky, přílohy i ARES a při každém uložení dělá zálohu.

Máte-li vlastní backend, stačí v *Číselníky → Uložení na server* vyplnit adresu API. Server
musí na téže adrese obsloužit dvě operace:

```
GET  /api/zakazky   ->  200  { "orders": [ … ], "dict": { … } }
PUT  /api/zakazky   <-  { "orders": [ … ], "dict": { … } }   ->  200
```

Je-li vyplněn token, posílá se v hlavičce `Authorization: Bearer <token>`.

**ARES:** načtení firmy podle IČO zkouší postupně tři cesty, první úspěšná vyhraje:

1. **ARES napřímo** z prohlížeče;
2. při jakémkoli selhání **`r.jina.ai`**, které doplní chybějící hlavičky CORS; odpověď
   občas přijde zabalená v markdownovém bloku, aplikace ji rozbalí;
3. **mezikrok na vašem serveru** — nepovinná záloha, adresa se vyplňuje
   v *Číselníky → Zákazníci*, hotový je ve složce `server/`.

První dva kroky jsou schválně napsané stejně jako v aplikaci SONAD, ze které postup pochází —
stejné pořadí, stejný tvar volání, stejné rozbalení markdownu. Limity 9 a 12 sekund hlídají
jen čekání, samotného dotazu se nedotýkají.

> **Aplikace musí běžet jako soubor u vás, ne ve sdíleném náhledu.** Vložené zobrazení
> stránky (náhled odkazu) zakazuje veškeré odchozí dotazy, takže ARES odtamtud nelze
> zavolat žádným kódem. Aplikace to pozná a místo obecné chyby to rovnou napíše.
> Stáhněte si `prehled-zakazek.html` a otevřete ho dvojklikem — přesně jako SONAD.
Tlačítko *Uložit* pak zapisuje na server, *Načíst data ze serveru* stáhne aktuální stav.

Jedna zakázka je plochý objekt s klíči `id, code, name, qty, status, center, owner,
requester, order, dateOrder, planDesign, planProd, planAssembly, planTuning, dateRequired,
dateDelivered, priority, invoice, year, files`. Data jsou ve formátu `RRRR-MM-DD`.

Přílohy jdou na server na `POST /api/soubory` (tělo = obsah souboru, název a typ v dotazu),
zpět se čtou z `GET /api/soubory/{id}` a ruší přes `DELETE`. Bez serveru zůstávají
v `IndexedDB` prohlížeče.
