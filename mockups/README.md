# ABC LAB mockups

Device mockups rendered from `abclab-mockup.html`. The screenshots are real
browser captures of the page, set into browser and phone frames.

| File | What it shows | Capture |
| --- | --- | --- |
| `abclab-combo.png` | Desktop and mobile together | 1440×900 + 390×844 |
| `abclab-desktop.png` | Desktop, above the fold | 1440×900 @2x |
| `abclab-mobile.png` | Mobile, above the fold | 390×844 @3x |
| `abclab-mobile-trio.png` | Services, hero and portfolio | 390×844 @3x |
| `abclab-desktop-full.png` | Desktop, whole page | 1440×6631 |
| `abclab-mobile-full.png` | Mobile, whole page | 390×8263 |
| `showcase.html` | Presentation page for all six | — |

## `presentation/`

Finished marketing panels, with the English copy baked in. These are the ones
to put in a listing or a portfolio — the files above are the raw device renders
they are built from.

| File | Size | What it says |
| --- | --- | --- |
| `01-overview.png` | 3600×2250 | *A studio website you can rebrand in an afternoon.* Badges: fully editable in Framer, fully responsive, HTML mockup included, setup guide included. Desktop and phone together. |
| `02-responsive.png` | 3600×2250 | *One layout. Every screen.* How the page reflows from 1440 px down to 390 px, over three phones. |
| `03-framer.png` | 3600×1560 | *Thirteen panels. No code to touch.* Every properties-panel group named, with a phone alongside. |
| `04-included.png` | 3600×1950 | *Four files. No subscriptions.* Framer duplicate link, `AbcLabSite.tsx`, `abclab-mockup.html`, and the two PDF guides — each with its filename. |
| `05-desktop-complete.png` | 2400×9813 | *Every section, end to end.* The whole desktop page in a browser frame, hero to footer. |

All five are rendered at 1.5× (05 at 1×, since it is already 9813 px tall) and
share one visual system: Archivo for the headlines, IBM Plex Mono for the
labels, and the site's own accent purple.

## Notes on the captures

Two things are forced before a full-page capture, in `/tmp` build scripts:
scroll-driven reveals never fire when the viewport is the height of the whole
page, and the embedded Google map cannot load without network access, so the
map panel is replaced with a placeholder for the capture only.
