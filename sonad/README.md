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
* Sekce **Postup zakázky** je svislá osa sedmi kroků: jak scrollujete, čára se plní červenou,
  kolečka se rozsvěcují (s krátkou jiskrou) a karty se rozbalují pružným pohybem. Při scrollu
  zpět se animace vrací, takže se dá přehrát znovu. Text kroků upravíte přímo v `<ol class="flow">`.

## Co je potřeba doplnit

1. **Fotky.** V `assets/photos/` jsou zatím technické náhrady. Skutečné fotky nahrajte
   pod stejnými názvy (klidně jako `.jpg`) a v `index.html` upravte příponu v `src`.
   Doporučené rozměry: hero 2000×1200 px, ostatní 1400×1100 px, komprimované na < 300 kB.
   Popisky v `alt` a `figcaption` prosím upravte podle toho, co na fotce opravdu je.
2. **Logo.** Zatím je vysázené textově (`SONAD` + `engineering` v hlavičce a patičce).
   Skutečné logo stačí vložit místo `<span class="mark">` jako `<img src="assets/logo.svg" …>`.
3. **Formulář.** Bez serveru: odeslání otevře poštovní program s předvyplněnou zprávou
   na `info@sonad.cz`. Až bude na hostingu PHP nebo formulářová služba, stačí ve funkci
   `form.addEventListener('submit', …)` v `index.html` nahradit `window.location.href`
   za `fetch()` na váš endpoint.
4. **Texty** vycházejí z dosavadního webu sonad.cz — projděte je prosím a doplňte, co
   chybí (konkrétní reference, obory zákazníků, strojový park).

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
