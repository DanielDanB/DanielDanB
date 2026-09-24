# SONAD — Framer komponenta

`SonadSite.tsx` je celý web SONAD engineering (převedený ze souboru
`sonad-jednosouborovy-fix.html`) jako jedna Framer code komponenta. Všechno
se upravuje v pravém panelu vlastností, do kódu není třeba sahat.

## Vložení do Framer

1. Ve Frameru: **Assets → Code → + → New Code File**, pojmenuj ho `SonadSite`.
2. Smaž vzorový obsah, vlož celý obsah `SonadSite.tsx` a ulož (Ctrl/Cmd + S).
3. Přetáhni komponentu na stránku. Vpravo nastav **Width: Fill** a
   **Height: Fit content**.
4. První pole v panelu je **Verze**. Když nějaké nastavení nevidíš, nejdřív
   se podívej na ni: pokud neukazuje `v2 · SONAD`, Framer nenačetl nový kód
   (například kvůli chybě v souboru).

## Fotky

Framer neumí načíst fotky z tohoto repozitáře, proto se nahrávají v panelu.
Místo chybějící fotky se ukáže technická kresba v barvě značky a v editoru
i doporučený rozměr.

Fotky vytažené z HTML leží ve složce `photos/`:

| Soubor | Kam v panelu |
| --- | --- |
| `logo-sonad.webp` | ⑤ Záhlaví → Logo |
| `hero-1…4-*.webp` | ⑥ Úvod → Fotky (4 položky) |
| `sluzba-3d-mereni.webp` + `…-nahled-1…3` | ⑦ Služby → karta „3D měření“ → Fotka a Náhled 1–3 |
| `sluzba-svarovani.webp` | ⑦ Služby → karta „Svařování“ → Fotka |
| `o-nas-video-nahled.webp` | ⑨ O nás → Náhled videa |
| `cisla-pozadi.webp` | ⑩ Pás s čísly → Fotka pozadí |

Video ze sekce O nás (`assets/video/sonad.mp4`) v HTML souboru vložené není.
Nahraj ho v ⑨ O nás → 🎬 Video (soubor).

## Co se kde upravuje

| Skupina | Co v ní je |
| --- | --- |
| ① 🎨 Barvy | hotové palety (SONAD červená, ocelová modrá, lesní zelená, jantarová, tmavá Grafit) nebo vlastní barvy. Z hlavní barvy se dopočítají tlačítka, ikony, časová osa, nádech mapy i pásu s čísly |
| ② 🔷 Tvary | styl boxů (sklo / plné / obrys), zaoblení boxů, rozmazání skla, stíny, tvar tlačítek (kapsle / zaoblené / hranaté), velikost tlačítek, styl hlavního a vedlejšího tlačítka, tvar ikon |
| ③ 🖋️ Písmo | Google Font, tučnost a velikost nadpisů, šířka obsahu |
| ④ ✨ Efekty | animace, záře v pozadí, paralaxa, dopočítávání čísel, mezery mezi sekcemi |
| ⑤ Záhlaví | logo, položky menu, tlačítko Kontakt, přepínač jazyků |
| ⑥–⑬ Sekce | texty, fotky, seznamy (karty, kroky, lidé, milníky…), vypínač „Zobrazit sekci“ |
| ⑧ Sekce text + fotka | Jednoúčelové stroje, Lokomotivy, Výroba, 3D měření. Další přidáš tlačítkem +, pozici určuje „Umístění“ |
| ⑬ Kontakt | texty, tlačítka, adresy (provozovna, fakturace, poptávky) |
| ⑭ 👥 Lidé | kontaktní osoby: jméno, pozice, telefon, e-mail |
| ⑮ 🕒 Otevírací doba | dny a časy, dnešní den se na webu zvýrazní |
| ⑯ 🌐 Sociální sítě | Facebook, Instagram, LinkedIn, YouTube, X, TikTok, WhatsApp, e-mail, web |
| ⑰ 🗺️ Mapa | adresa nebo vložený kód z Google Maps, přiblížení, výška, odbarvení, nádech barvou značky, štítek, tlačítko |
| ⑱ Patička | texty, kontakty, rozcestník, copyright |

### Značky v textech

- `*slovo*` — slovo v barvě značky (např. „od *konstrukce*“)
- `**slovo**` — tučně
- `|` nebo Enter — nový řádek v nadpisu
- V polích **Body**, **Odrážky** a **Štítky** odděluj položky svislou čarou `|`

### Video v každé sekci

Každá sekce (Úvod, Služby, O nás, Postup, Galerie, Kontakt) má pole
**🎬 Video (soubor)** a **🎬 Video (odkaz)**. Odkaz může vést na YouTube,
Vimeo nebo přímo na `.mp4`. Pole **Video jako** určuje, jestli video poběží
jako **pozadí sekce** (se zakrytím, aby šel číst text), nebo jako **blok pod
obsahem** s ovládáním.

Video jde vložit i místo fotky: u fotek v úvodu, u karet služeb, v galerii,
v sekcích text + fotka, v pásu s čísly a u videa v O nás.

Ve Frameru nejde nahrát soubor do položky seznamu, proto se u karet, galerie
a sekcí text + fotka video zadává odkazem. Soubor nahraj do Frameru
(Assets) a zkopíruj jeho adresu, nebo použij YouTube či Vimeo.

## Zvětšení fotek

Fotky v úvodu a v galerii se po kliknutí zvětší přes celou obrazovku, mezi
fotkami se přechází šipkami (i na klávesnici), Escape okno zavře. Vypíná se
přepínačem **Zvětšení fotky kliknutím** v ⑥ Úvod a ⑫ Galerie. Náhledy
v kartách služeb se zvětšují také.

## Animace

Animace (odkrývání boxů, osa v O nás, dopočítávání čísel, postup zakázky)
běží jen v náhledu (Preview) a na publikovaném webu. V editoru je stránka
záměrně bez animací, aby šla upravovat. Osa v O nás se rozjede, až když
je na obrazovce vidět.

## Jazyky

Přepínač jazyků vede na odkazy (`/`, `/en`, `/pl`, `/de`). Překlady se ve
Frameru dělají přes **Locales**: přidej jazyky, na každé verzi stránky přepiš
texty v panelu a u odpovídajícího jazyka zapni **Aktuální**. Nechceš-li
jazyky, vypni **Přepínač jazyků**.

## Rozdíly proti HTML

- Stránka při doscrollování na sekci O nás nezamyká scroll. Uvnitř Frameru by
  to bojovalo s jeho vlastním scrollováním, animace odkrytí zůstala.
- Barvy loga: nahrané logo má černý text „engineering“. Na tmavé paletě
  Grafit ho proto nahraď světlou verzí, nebo nech textové logo.
- Mapa a videa z YouTube/Vimeo se v editoru načtou jen v náhledu (Preview)
  a na publikovaném webu.
