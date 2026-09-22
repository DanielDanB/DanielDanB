# sonad.cz — nový web

Jednostránkový web pro **SONAD engineering s.r.o.** (Liberec). Čistý HTML + CSS + trocha
JavaScriptu, žádný build, žádné závislosti. Nasazení = nahrát obsah složky na hosting.

```
sonad/
├── index.html          celý web (styly i skript jsou uvnitř)
├── assets/photos/      obrázky sekcí (zatím dočasné náhrady)
└── README.md
```

## Design

* Inspirace apple.com: vzdušná sazba, velké nadpisy, hodně bílého místa, systémové písmo
  (na Macu/iPhonu se vykreslí v SF Pro, na Windows v Segoe UI).
* **Liquid glass** — plovoucí lišta menu, karty, panely s fotkami a kontaktní box jsou
  z poloprůhledného skla s rozostřením pozadí, jemným lomem světla po hraně a odleskem.
* Světlá paleta, **červená z loga** je jediná výrazná barva a používá se střídmě
  (tlačítka, nadpisové akcenty, ikony).
* Boxy s fotkami se **postupně objevují** při scrollování (fade + posun + doostření),
  s odstupňovaným zpožděním. Kdo má v systému zapnuté omezení pohybu
  (`prefers-reduced-motion`), uvidí vše rovnou bez animací.
* Plně responzivní: jeden layout od 320 px do velkých monitorů, na mobilu vysouvací menu.
* Navigace drží rozcestník z dosavadního sonad.cz (Úvod, Služby, Jednoúčelové stroje, Postup,
  Výroba, 3D měření, Kontakt), jen seřazený podle pořadí sekcí na stránce. Položka sekce,
  kterou zrovna čtete, se podbarví. Ve vysouvacím menu jsou navíc Z dílny a O nás.
* Sekce **O nás** má text firmy vlevo a vpravo video na výšku, které běží ztlumeně ve smyčce
  bez ovládacích prvků — spustí se, až když sekce najede do obrazu, a zastaví se, jakmile
  z něj zmizí. Rám se po načtení přizpůsobí skutečnému poměru stran videa. Soubor je
  v `assets/video/sonad.mp4`, poznámky k němu v `assets/video/README.txt`.
* Nad sekcí **Postup zakázky** je **pás s čísly** — čtyři průsvitné skleněné boxy nad fotkou ze soustružny,
  kterou přes ně prosvítá červený filtr. Fotka se při scrollování posouvá pomaleji než stránka
  (paralaxa, celkem 70 px; rozsah se mění v konstantě `ROZSAH` ve skriptu). Okraje pásu se
  rozplývají do pozadí. Čísla naběhnou od nuly za dvě sekundy; při zapnutém omezení pohybu
  se vypíšou rovnou a paralaxa se vypne. Hodnoty se mění v `<dt data-do="…">`, kde `data-za`
  je přípona za číslem a `data-tisice="1"` zapne oddělovač tisíců.
* Pořadí sekcí: Úvod → Naše služby → Jednoúčelové stroje → O nás → čísla → Postup zakázky →
  Výroba → 3D měření → Z dílny → Kontakt.
* **Zvětšení obrázku** — náhledy v rozbalených kartách sekce Naše služby se dají kliknutím
  (nebo Enterem, jsou fokusovatelné) otevřít ve vyskakovacím okně přes celou obrazovku
  s rozostřeným pozadím. Nikde jinde na webu se fotky nezvětšují; okruh se mění v proměnné
  `vyber` ve skriptu. Zavírá se křížkem,
  klávesou Esc i klikem mimo obrázek; popisek pod zvětšeninou se bere z `alt`.
* Patička má rozepsané kontakty: sídlo, IČO, lidé s přímými spojeními a celý rozcestník.
* Hero má na širokých displejích dva sloupce — text vlevo, galerie vpravo, aby byla vidět hned
  bez scrollování. Fotky stojí volně na stránce bez rámu, jen s měkkým stínem.
  Pod 1080 px se galerie přesune pod text.
* **Galerie v hero** střídá čtyři fotky po třech sekundách prolnutím s jemným přiblížením
  a doostřením. Zastaví se při najetí myší, při práci s tečkami pod fotkou i když je panel
  prohlížeče skrytý; tečkami se dá přepínat ručně. Při zapnutém omezení pohybu se nepřepíná
  sama a ovládá se jen tečkami. Další fotku přidáte zkopírováním jednoho `<figure class="slide">`.
* Karty v sekci **Naše služby** (osm služeb, tři sloupce na širokých displejích)
  mají nahoře obrázek (poměr 16:10) a po najetí myší se rozevřou
  do většího skleněného panelu s odrážkami, dvěma náhledy a odkazem na poptávku. Na dotykových
  zařízeních slouží kolečko s „+“ v rohu obrázku, funguje i klávesnicí (Tab, Enter, Esc).
  Místo karty si drží výšku zavřeného stavu, takže se stránka při rozevírání nikam neposouvá.
* Sekce **Postup zakázky** je svislá osa sedmi kroků: jak scrollujete, čára se plní červenou,
  kolečka se rozsvěcují (s krátkou jiskrou) a karty se rozbalují pružným pohybem. Při scrollu
  zpět se čára plynule stahuje zpět k prvnímu kroku a nahoře zmizí úplně. Text kroků upravíte
  přímo v `<ol class="flow">`.

## Co je potřeba doplnit

1. **Fotky.** V hero galerii jsou už vaše skutečné fotky (`assets/photos/hero-*.webp`) —
   mají průhledné pozadí, takže stojí volně na stránce. Scéna je čtvercová a fotku do ní
   vepisuje celou, takže poměr stran nevadí.
   Další fotky do stejného stylu vyřízněte z pozadí a uložte jako WebP nebo PNG s průhledností.
   Zbytek `assets/photos/` jsou zatím technické náhrady. Skutečné fotky nahrajte
   pod stejnými názvy (klidně jako `.jpg`) a v `index.html` upravte příponu v `src`.
   Doporučené rozměry: hero 2000×1200 px, obrázky karet v sekci Naše služby 1600×1000 px
   (poměr 16:10, soubory `sluzba-*.svg`), ostatní 1400×1100 px, komprimované na < 300 kB.
   Popisky v `alt` a `figcaption` prosím upravte podle toho, co na fotce opravdu je.
2. **Logo** je v hlavičce i v patičce jako `assets/logo-sonad.webp` (vedle leží i `.png`
   pro případ, že by ho bylo potřeba jinde). Velikost se řídí výškou v CSS pravidle `.brand img`.
   Ikonka v záložce prohlížeče je zatím jen červený čtverec s „S“ — až budete mít logo ve verzi
   pro malou ikonu, vyměníme ji.
3. **Formulář.** Bez serveru: odeslání otevře poštovní program s předvyplněnou zprávou
   na `info@sonad.cz`. Až bude na hostingu PHP nebo formulářová služba, stačí ve funkci
   `form.addEventListener('submit', …)` v `index.html` nahradit `window.location.href`
   za `fetch()` na váš endpoint.
4. **Texty** vycházejí z dosavadního webu sonad.cz — projděte je prosím a doplňte, co
   chybí (konkrétní reference, obory zákazníků, strojový park).
5. **Odkaz na Instagram.** V kontaktu je ikona Instagramu zatím s prázdným odkazem (`href="#"`,
   označeno atributem `data-doplnit`). Doplňte adresu profilu, nebo ikonu smažte.
   Odkaz na Facebook míří na profil nalezený na internetu — ověřte, že je to ten váš.
6. **Jednotka u zpracované oceli.** V pásu je „200 t / Zpracované oceli“ — jednotku jsem
   doplnil já a záměrně neuvádím období. Pokud jde o roční objem, upravte popisek na
   „Zpracované oceli ročně“; pokud o jinou jednotku, přepište `data-za` u toho čísla.
7. **Kontakty v patičce.** Jméno, telefon a e-mail jednatele i adresa jsou z veřejných zdrojů.
   U adresy `a.nemcova@sonad.cz` jsem roli („administrativa a fakturace“) odhadl — opravte ji,
   ať sedí. Stejně tak doplňte další lidi, pokud mají mít na webu přímé spojení.
8. **Stránka o osobních údajích.** V patičce je odkaz na `osobniudaje.html`, jak ji má dnešní
   sonad.cz. V této složce ten soubor není — buď ho nasaďte vedle, nebo odkaz přesměrujte.

## Změna barev

Všechny barvy jsou na jednom místě, v bloku `:root` na začátku `<style>`:

```css
--brand:#d0202a;   /* červená z loga */
--ink:#15181d;     /* text */
--bg:#f6f7f9;      /* pozadí */
```

Přepsáním těchto hodnot se přebarví celý web.

## Kontrola

Web byl vykreslen a odzkoušen v Chromiu na 1440×900, 820×1180 a 390×844: bez vodorovného
přetečení, bez chyb v konzoli, všechny sekce se odkryjí při scrollu, mobilní menu se otevírá
i zavírá klávesou Esc, klikem mimo i po výběru položky.
