# LBC LAB mockups

Device mockups rendered from `lbclab-mockup.html`. The screenshots are real
browser captures of the page, set into browser and phone frames.

| File | What it shows | Capture |
| --- | --- | --- |
| `lbclab-combo.png` | Desktop and mobile together | 1440×900 + 390×844 |
| `lbclab-desktop.png` | Desktop, above the fold | 1440×900 @2x |
| `lbclab-mobile.png` | Mobile, above the fold | 390×844 @3x |
| `lbclab-mobile-trio.png` | Services, hero and portfolio | 390×844 @3x |
| `lbclab-desktop-full.png` | Desktop, whole page | 1440×6631 |
| `lbclab-mobile-full.png` | Mobile, whole page | 390×8263 |
| `showcase.html` | Presentation page for all six | — |

Two things are forced before a full-page capture, in `/tmp` build scripts:
scroll-driven reveals never fire when the viewport is the height of the whole
page, and the embedded Google map cannot load without network access, so the
map panel is replaced with a placeholder for the capture only.
