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

## Instalace na Windows Server

1. Nainstalujte **Node.js** z <https://nodejs.org> — verzi **LTS**, při instalaci
   nechte vše předvyplněné.
2. Zkopírujte složku `vyroba` na server, třeba do `C:\vyroba`.
3. Ve složce `vyroba\server` klepněte pravým tlačítkem na
   **`nainstalovat-sluzbu.bat`** → **Spustit jako správce**.

Hotovo. Instalátor sám:

- ověří, že je Node.js nainstalovaný a že máte práva správce,
- založí úlohu **PrehledZakazek**, která startuje **po zapnutí serveru**
  pod účtem `SYSTEM` — bez přihlášení, bez otevřeného okna,
- povolí port v bráně firewall pro firemní a privátní síť,
- server spustí, počká, až odpoví, a **vypíše adresy pro kolegy**.

Jiný port: `nainstalovat-sluzbu.bat 80` — pak se kolegům píše jen `http://server`
bez čísla za dvojtečkou.

Zrušení: **`odinstalovat-sluzbu.bat`** jako správce. Data zůstanou.

| Chci | Kde |
|---|---|
| vidět, jestli běží | Plánovač úloh → úloha `PrehledZakazek` |
| přečíst výpis | `server\data\server.log` |
| restartovat | `schtasks /end /tn PrehledZakazek` a `/run` |

Spadne-li server (výpadek proudu, chyba), obálka služby ho **do 10 sekund
zvedne znovu**.

> `spustit-windows.bat` zůstává pro rychlé vyzkoušení — otevře okno, které
> musí zůstat otevřené. Pro provoz na serveru použijte službu.

## Instalace na Linux

Ve složce `vyroba/server`:

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
