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

## Instalace na Windows

1. Nainstalujte **Node.js** z <https://nodejs.org> — verzi **LTS**, při instalaci
   nechte vše předvyplněné.
2. Zkopírujte celou složku `vyroba` třeba do `C:\vyroba`.
3. Ve složce `vyroba\server` spusťte dvojklikem **`spustit-windows.bat`**.
4. Otevřete prohlížeč na **<http://localhost:8080>**.

Okno s černým výpisem nechte otevřené — zavřením okna server skončí.

**Aby se spouštěl sám po zapnutí počítače:** stiskněte `Win+R`, napište `shell:startup`
a do složky, která se otevře, vložte zástupce na `spustit-windows.bat`.

**Aby se dostali i kolegové:** zjistěte adresu počítače příkazem `ipconfig` (řádek
*IPv4 Address*, např. `192.168.1.40`) a kolegům dejte `http://192.168.1.40:8080`.
Windows se poprvé zeptá, jestli povolit Node.js v síti — povolte pro **firemní síť**.

## Instalace na Linux

```bash
sudo apt install nodejs            # Node 18 nebo novější
sudo mkdir -p /opt/vyroba
sudo cp -r vyroba/* /opt/vyroba/
sudo cp /opt/vyroba/server/vyroba.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now vyroba
systemctl status vyroba
```

Aplikace pak běží na portu 8080, data v `/var/lib/vyroba`.

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
