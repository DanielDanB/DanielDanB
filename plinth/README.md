# Plinth — an editorial commerce theme for Shopify

A plinth is what you put a valuable object on. This theme is the plinth; the
merchant's product is the object. Everything in the visual language recedes so
the product advances.

Plinth is a complete Shopify Online Store 2.0 theme, not a mockup. It installs
into a real store, reads real products, and hands checkout to Shopify.

---

## What is in this folder

| Path | What it is |
| --- | --- |
| `theme/` | The Shopify theme. Zip the **contents** of this folder and upload it to Shopify. |
| `demo/plinth-demo.html` | A standalone clickable preview. Open it in any browser — no store, no server, no install. |
| `demo/src/` | Sources for the preview only. Not part of the theme. |
| `framer/` | The same storefront as a Framer code component, edited entirely from Framer's properties panel. |
| `docs/` | Install guide, customization reference, Shopify setup, developer notes. |
| `build-demo.sh` | Rebuilds the preview from the theme's own stylesheets. |
| `LISTING.md` | Product description copy for a marketplace listing. |

The preview inlines `base.css`, `components.css` and `sections.css` **verbatim
from the theme**, so what a buyer previews and what they install cannot drift
apart. Only the demo's placeholder catalogue and its control panel are
preview-only.

---

## The design in one page

**Concept.** Editorial commerce. The store reads like a well-set printed
catalogue — a numbered index, hairline rules, generous margins, tabular
figures — rather than a feed of floating shadowed cards.

**The signature.** The *ledger grid*: products divided by 1px rules on a
continuous grid, never boxed in cards. It is what makes Plinth read as *not a
Shopify theme* at a glance, and it flatters ceramics, denim, audio, coffee and
jewellery equally.

**Three recurring motifs.**
- **The index rail** — `01 — FEATURED` over a hairline, in tracked small caps.
- **The seam** — asymmetric splits where type crosses the image edge.
- **The ledger** — rules and tabular figures for anything countable: price,
  stock, free-shipping progress, review distribution.

**Restraint.** Near-zero corner radius. No drop shadows in the default preset.
One accent colour, used with discipline. Motion is short, eased, and mostly
masks and rules — and stops entirely for visitors who ask their device to
reduce motion.

---

## Niche

Deliberately open. Nothing in the theme assumes a category. Two settings —
**Palette preset** and **Type personality** — take the same store from a warm
ceramics shop to a dark audio brand to a bright activewear label without
touching a file.

---

## Requirements

- A Shopify plan that allows custom themes (any paid plan)
- Shopify Online Store 2.0 (every store since 2021)
- No apps required. No paid dependencies. No build step.

---

## Quick start

1. Zip the **contents** of `theme/` (so `layout/`, `sections/`, `assets/`… are
   at the top level of the zip).
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
3. **Customize** → set your logo, palette and type in **Theme settings**.
4. Follow `docs/SHOPIFY-SETUP.md` for menus, filters and swatches.

Full instructions: [`docs/INSTALL.md`](docs/INSTALL.md).
