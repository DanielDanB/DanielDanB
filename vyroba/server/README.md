# Instalace na váš počítač nebo server

> **Instaluje se jen na jeden počítač.** Ostatní si neinstalují nic — otevřou si
> v prohlížeči adresu toho počítače a vidí stejná data. Když někdo uloží změnu,
> ostatním naskočí sama do 15 vteřin.

Aplikace umí běžet dvěma způsoby. **Server** je ten, který chcete, jakmile s evidencí
pracuje víc lidí — data i přílohy leží na jednom místě a všichni vidí totéž.

| | soubor v počítači | server |
|---|---|---|
| Instalace | žádná, stačí dvojklik | Node.js + spuštění jednoho souboru |
| Kdo instaluje | každý sám | jen jeden počítač, ostatní nic |
| Data | jen v tom jednom prohlížeči | společná pro všechny |
| Změna od kolegy | nevidí se | naskočí sama do 15 s |
| Přílohy | jen v tom jednom prohlížeči | společné, na disku serveru |
| ARES | přes veřejný mezikrok | přes váš server |
| Zálohy | ruční přes *Záloha (JSON)* | automaticky při každém uložení |

## Co server dělá

Jeden soubor `server.js`, **bez jediné knihovny navíc**, obsluhuje všechno:

| adresa | k čemu je |
|---|---|
| `GET /` | samotná aplikace |
| `GET /api/zakazky` | společná data |
| `PUT /api/zakazky` | uložení dat (předtím vždy záloha) |
| `POST /api/soubory` | nahrání přílohy |
| `GET /api/soubory/{id}` | stažení přílohy |
| `DELETE /api/soubory/{id}` | smazání přílohy |
| `GET /api/zakazky/verze` | číslo verze dat — na to se ptají otevřené prohlížeče |
| `GET /api/ares/{IČO}` | mezikrok na ARES |

Aplikace otevřená z tohoto serveru se **připojí sama** — adresu API ani ARESu nikam
nevyplňujete, jen se objeví hlášení *Připojeno k serveru*.

## Proč to není jen složka na sdíleném disku

Aplikace samotná je jeden HTML soubor — ten na `S:` položit lze a každý si ho otevře.
Jenže **prohlížeč nesmí zapisovat do souborů na disku.** Když si ho otevře pět lidí,
každý má svoje data ve svém prohlížeči a navzájem o sobě nevědí.

Aby změna od jednoho byla vidět u ostatních, musí data držet něco, co umí zapisovat —
a to je ten server. Není to volba pro parádu, je to jediná cesta ke sdílené evidenci.

**Sdílený disk se přesto použije, jen jinak:** na `S:` položíte spouštěcího zástupce,
který kolegům aplikaci otevře. Vyrobí ho `vytvorit-zastupce.bat`. Kolegové pak mají
na `S:` „spouštěcí aplikaci" přesně jak jsou zvyklí, a přitom vidí společná data.

> Samotné soubory aplikace na `S:` nedávejte. Služba běží pod účtem `SYSTEM`
> a ten se na síťové disky nedostane — nenaběhla by. Aplikace i data patří
> na disk toho stroje, kde služba běží.

## Instalace na Windows Server

1. Nainstalujte **Node.js** z <https://nodejs.org> — verzi **LTS**, při instalaci
   nechte vše předvyplněné.
2. Zkopírujte složku `vyroba` na server, třeba do `C:\vyroba`.
3. Ve složce `vyroba\server` klepněte pravým tlačítkem na
   **`nainstalovat-sluzbu.bat`** → **Spustit jako správce**.
4. Instalátor se zeptá na dvě věci — u obou stačí zmáčknout Enter:
   - **Port** — Enter nechá 8080. Napíšete-li `80`, kolegům bude stačit
     adresa bez čísla za dvojtečkou.
   - **Složka na sdíleném disku** — sem napište třeba `S:\Vyroba` a zástupce
     pro kolegy tam vznikne sám. Enter tenhle krok přeskočí.

Žádnou příkazovou řádku nepotřebujete.

Hotovo. Instalátor sám:

- ověří, že je Node.js nainstalovaný a že máte práva správce,
- založí úlohu **PrehledZakazek**, která startuje **po zapnutí serveru**
  pod účtem `SYSTEM` — bez přihlášení, bez otevřeného okna,
- povolí port v bráně firewall pro firemní a privátní síť,
- server spustí, počká, až odpoví, a **vypíše adresy pro kolegy**.

Jiný port: `nainstalovat-sluzbu.bat 80` — pak se kolegům píše jen `http://server`
bez čísla za dvojtečkou.

Na zadané složce vznikne **Prehled zakazek.url**. Kolegové na něj poklepou a aplikace
se jim otevře v prohlížeči — nic si neinstalují, zástupce si můžou přetáhnout na plochu.

Zapomněli jste na to při instalaci? Poklepejte na **`vytvorit-zastupce.bat`** —
zeptá se na složku stejně a zástupce vyrobí dodatečně.

> Kdo chce, může instalátoru obojí předat rovnou:
> `nainstalovat-sluzbu.bat 8080 "S:\Vyroba"`. Pak se na nic neptá.
> Není to nutné, poklepání stačí.

Zrušení: **`odinstalovat-sluzbu.bat`** jako správce. Data zůstanou.

| Chci | Jak |
|---|---|
| vidět, jestli běží | dvojklik na **`stav-sluzby.bat`** |
| přečíst výpis | `server\data\server.log` |
| restartovat | `schtasks /end /tn PrehledZakazek` a pak `/run` |
| vidět úlohu ručně | Plánovač úloh → `PrehledZakazek` |

`stav-sluzby.bat` ukáže stav úlohy, jestli server na svém portu odpovídá,
a posledních 15 řádků výpisu — na jednu obrazovku vše, co potřebujete vědět.

Spadne-li server (chyba, restart Node), obálka služby ho **do 10 sekund
zvedne znovu**. Windows navíc úlohu při selhání sám opakuje.

### Na co jsem při psaní instalátoru myslel

- **Cesta k Node.js se zapíše natvrdo.** Účet `SYSTEM` nemusí mít `node` v `PATH`;
  instalátor si proto zjistí plnou cestu a uloží ji do `nastaveni.bat`.
- **Úloha se zakládá z XML, ne z příkazové řádky.** Obchází to potíže
  s uvozovkami a hlavně to umí vypnout tovární limit, který by úlohu
  po třech dnech běhu sám ukončil (`ExecutionTimeLimit PT0S`).
- **Soubory `.bat` jsou čistě ASCII**, aby na nich neztroskotala kódová
  stránka příkazového řádku.
- **Instalátor se po sobě dívá**: 30 vteřin zkouší, jestli server odpovídá,
  a buď vypíše adresy, nebo řekne, co selhalo a čím to nejspíš je.

> `spustit-windows.bat` zůstává pro rychlé vyzkoušení — otevře okno, které
> musí zůstat otevřené. Pro provoz na serveru použijte službu.

## Instalace na Linux

Nemáte-li Linux, tuhle část přeskočte. Ve složce `vyroba/server`:

```bash
sudo ./nainstalovat-linux.sh          # port 8080
sudo ./nainstalovat-linux.sh 80       # nebo jiný port
```

Skript zkontroluje Node.js (verzi 18 a vyšší), založí systémového uživatele
`vyroba`, nakopíruje aplikaci do `/opt/vyroba`, data nastaví do `/var/lib/vyroba`,
zaregistruje službu `vyroba.service`, spustí ji, ověří, že odpovídá, a vypíše
adresy pro kolegy.

```bash
systemctl status vyroba      # stav
journalctl -u vyroba -f      # živý výpis
sudo systemctl restart vyroba
```

Služba běží pod vlastním uživatelem bez práv navíc a zapisovat smí jen do
složky s daty.

## Nastavení

Vše přes proměnné prostředí, nic se nikde needituje:

| proměnná | výchozí | k čemu |
|---|---|---|
| `PORT` | `8080` | port, na kterém server naslouchá |
| `DATA_DIR` | `server/data` | kam se ukládají data a přílohy |
| `TOKEN` | prázdné | vyžadovat heslo (`Authorization: Bearer …`) |
| `ALLOW_ORIGIN` | `*` | odkud smí volat cizí stránka |

Na Windows se mění v `spustit-windows.bat` řádkem `set PORT=9000` před `node server.js`,
na Linuxu v `vyroba.service`.

## Když pracuje víc lidí najednou

Data mají číslo verze. Otevřené prohlížeče se každých 15 vteřin ptají jen na to číslo —
je to jeden krátký dotaz, ne stahování celé evidence. Změní-li se, prohlížeč si nová data
načte sám a napíše *Změny od kolegy načteny*. Má-li obsluha rozdělanou vlastní úpravu,
aplikace jí do ní nesahá a počká, až uloží.

Uloží-li dva lidé současně, druhý v pořadí dostane okno **Mezitím ukládal někdo jiný**
s volbou *Převzít jejich verzi* nebo *Přepsat mou verzí*. Server starší verzi sám od sebe
nepřijme, takže se nikdy nic nepřepíše potichu.

## Data a zálohy

```
server/data/
  zakazky.json          současný stav
  zalohy/               30 posledních uložení, s časem v názvu
  soubory/              přílohy, ke každé i popisný .json
```

Obnova ze zálohy = zastavit server, přepsat `zakazky.json` vybranou zálohou, spustit.
Zálohovat stačí celou složku `data`.

## Aktualizace aplikace

Přepište `prehled-zakazek.html` novou verzí a server restartujte. Data zůstanou —
leží ve složce `data`, ne v aplikaci.

## Ověření, že server jede

```bash
curl http://localhost:8080/api/zakazky | head -c 200     # data
curl http://localhost:8080/api/ares/25596641             # ARES
```

## Když něco nefunguje

**„node není příkaz"** — Node.js není nainstalovaný, nebo se po instalaci nerestartoval
příkazový řádek. Zavřete okno a spusťte `.bat` znovu.

**„EADDRINUSE"** — port 8080 už někdo zabral. Spusťte s jiným: `set PORT=8090` a znovu.

**Kolegové se nedostanou** — brána firewall. Na serveru povolte příchozí spojení na
zvolený port pro firemní síť.

**Aplikace se nepřipojila k serveru** — otevřeli jste soubor dvojklikem místo adresy
`http://…`. Server pozná jen ten druhý způsob.

---

## Samostatný mezikrok na ARES

Běží-li aplikace jen jako soubor a potřebujete přesto ARES přes vlastní server, je tu
`ares-proxy.js` (Node) a `ares-proxy.php` (PHP hosting) — dělá jen ten jeden úkol.
Adresu pak vyplníte v *Číselníky → Zákazníci → Mezikrok na ARES*.

```bash
node ares-proxy.js          # port 871
```

Při provozu celého serveru ho nepotřebujete, `server.js` mezikrok obsahuje.
