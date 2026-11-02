# SONAD Nabídky – V19

Jednosouborová aplikace na tvorbu nabídek (`SONAD_Nabidky_V19.html`), otevírá se přímo v prohlížeči.

## Co je nového oproti V18
- **Modernizovaný vzhled** – font Inter, nový sidebar, lepivá horní lišta, jemnější karty, tabulky a tlačítka, plynulé přechody, lepší tmavý režim a mobil. Všechna ID, třídy a funkce zůstaly beze změny (ukládání stránky, historie, PDF, ceník, ARES…).
- **🧊 Spočítat ze STEPu** – nové tlačítko v menu a nová záložka v okně AI:
  - STEP se zpracuje lokálně v prohlížeči (OpenCascade přes `occt-import-js`, při prvním použití se stáhne ~8 MB, pak je v cache). Soubor se nikam neodesílá.
  - Změří rozměry, objem, povrch, hmotnost, typ dílu (rotační / prizmatický / deskový), díry (průměr, hloubka), čepy/osazení a rádiusy; u sestav lze vybrat jednotlivý díl (stejné díly se seskupí).
  - 3D náhled modelu (otáčení, zoom, pohledy ISO / shora / zepředu).
  - **Spočítat ze STEPu** – okamžitý výpočet bez AI: polotovar (normalizovaná kulatina / deska / přířez), kg materiálu, strojní časy podle materiálu, děr, složitosti, tolerance a počtu kusů; korekční koeficient se ukládá.
  - **Zpřesnit přes AI** – pošle Claude změřenou geometrii + náhled modelu a využije výukové příklady.
  - Výsledek se vloží jako nový výrobek včetně materiálu v kg a operací; opravy časů se ukládají jako výukové příklady.
- **Opravy AI modulu** – sazby se berou ze skutečného Ceníku (dříve se omylem použily pevné hodnoty), správné párování operací (Frézka × CNC frézka), čtení odpovědi aktuálních modelů, model `claude-opus-5-5` se záložními modely.

## Databáze oprav (učení)
- **✏️ Opravit & naučit AI** – u každé operace jde změnit stroj (např. soustruh → frézka), čas, přidat/smazat operaci; dále materiál, typ a rozměry polotovaru (hmotnost se přepočítá).
- Každá oprava se uloží do **databáze oprav** spolu s „otiskem“ dílu (tvar, rozměry, objem, plochy, díry, materiál), původním odhadem a tím, co se z opravy dá naučit: poměr skutečný/odhadnutý čas, stroj, typ polotovaru, přídavek, přídavné operace.
- Při výpočtu nového dílu ze STEPu se najdou nejpodobnější opravené díly a převezme se z nich stroj, polotovar, přídavek, přídavné operace (u velmi podobných) a časový koeficient (vážený průměr až 5 sousedů). Co bylo převzato, je vidět v náhledu („🧠 Poučeno z …“). Učení lze vypnout zaškrtávátkem.
- AI dostává nejpodobnější opravy jako příklady (včetně původního odhadu i skutečnosti).
- Databáze je v prohlížeči (localStorage, max. 500 záznamů); v Nastavení AI → Databáze oprav jde **exportovat/importovat** (JSON) – např. pro sdílení mezi kolegy nebo zálohu.

## Vlastní materiály z Ceníku
- Okno „Přidat materiál“ má navíc **hustotu** a **obrobitelnost** (konstrukční / nástrojová / kalená ocel, nerez, titan, litina, hliník, bronz, plast) – předvyplní se podle názvu.
- Vlastní materiály v kg se objeví ve výpočtu ze STEPu (hmotnost podle hustoty, časy podle obrobitelnosti), v opravném okně i v záložce výkresu (nabídka v poli Materiál); AI dostává seznam materiálů z ceníku a vložený výrobek dostane správný materiál a cenu.
- Starší vlastní materiály bez hustoty: hustota a obrobitelnost se odhadnou z názvu.
