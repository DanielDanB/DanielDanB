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

Two things are forced before a full-page capture, in `/tmp` build scripts:
scroll-driven reveals never fire when the viewport is the height of the whole
page, and the embedded Google map cannot load without network access, so the
map panel is replaced with a placeholder for the capture only.
