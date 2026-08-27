# Customizing Plinth

Everything below is a control in the Shopify theme editor. You never need to
open a file.

---

## Theme settings

### Brand
| Setting | Notes |
| --- | --- |
| Logo image | Any width; the theme scales it. SVG or PNG with transparency looks best. |
| Logo width | 60–260px. |
| Wordmark | Plain-text fallback used when no logo is set, so the store never ships with a broken image. |
| Favicon | Square PNG, 96px or larger. |
| Default social sharing image | Used when a page has no image of its own. |

### Colors

**Palette preset** switches the entire store from one dropdown:

| Preset | Reads as |
| --- | --- |
| Ink & Chalk *(default)* | Warm paper, ink text, vermillion accent. Editorial, neutral. |
| Midnight | Dark ground, warm brass accent. Jewellery, audio, spirits. |
| Bone & Clay | Soft warm neutrals, terracotta accent. Ceramics, skincare, home. |
| Slate & Citrus | Cool greys, sharp citrus accent. Technical, sport, outdoor. |

Choose **Custom** to use your own nine colours. That is the whole palette —
there is no tenth colour hidden in a stylesheet:

`Background · Surface · Sunken · Text · Muted text · Hairline border ·
Primary · Text on primary · Accent · In stock`

Everything else (hover tints, overlays, disabled states, skeleton loaders) is
derived from those with `color-mix`, so a rebrand is genuinely nine values.

### Typography

**Type personality** is the single biggest lever in the theme:

- **Editorial** — Fraunces display serif over Archivo. Warm, considered,
  gallery-adjacent.
- **Modern** — Archivo throughout. Direct, technical, contemporary.

**Font source**
- *Curated pairing* loads the theme's designed pairing from Google Fonts.
- *Shopify fonts* uses the two font pickers instead, if you would rather serve
  fonts from Shopify's CDN or you have a licensed family there.

Also: base text size, heading size, heading letter spacing, and heading case.

### Layout
Page width · section spacing · corner radius · surface style · section numbers.

**Surface style** is worth understanding. *Hairline* is the theme's signature:
rules instead of shadows, cards that are not boxes. *Raised* adds soft shadows
and fills product cards — a more conventional look, if that suits your brand
better.

**Show section numbers** toggles the `01 / 02 / 03` index marks.

### Buttons
Shape (square / soft / pill) and uppercase on or off.

### Product cards
Image shape · hover image swap · vendor · rating · colour swatches · quick add ·
quick view · wishlist · sale / sold out / new badges and the "new" window.

### Cart
Drawer or cart page · free shipping meter and threshold · order notes ·
discount field · in-cart recommendations · reassurance text.

### Product page
Sticky add-to-cart bar · image zoom · stock meter and its low-stock threshold ·
recently viewed.

### Search
Instant results · include collections · include blog posts · popular searches.

### Motion
Reveal on scroll · image hover motion · intensity. All motion switches off
automatically for visitors whose device asks to reduce motion — you do not have
to manage that.

### Social links
Instagram · TikTok · Pinterest · YouTube · Facebook. Only the ones you fill in
are rendered.

---

## Homepage sections

Add, remove and reorder these in the theme editor. Every one is optional.

| Section | Blocks | Notes |
| --- | --- | --- |
| **Hero** | Rail notes | Split (text beside image) or full-bleed (text over image). Accepts a video. Optional 6% parallax. |
| **Trust marquee** | Statements | One continuous line of tracked capitals. Pauses on hover. |
| **Featured collection** | — | Any collection, 2–12 products, 2–4 columns, ledger or loose grid. |
| **Category mosaic** | Category tiles | One tall tile beside two short, three equal, or four equal. |
| **Brand story** | Figures | Image with an overlapping inset, copy, and up to three figures. |
| **Promotional banner** | Details | Full-bleed image, one line, one action. |
| **Review wall** | Reviews | Aggregate score plus a wall of quotes. Replace with a review app's widget once you have one. |
| **Journal** | — | Latest three posts from a Shopify blog. |
| **Newsletter** | — | Posts to Shopify customers, tagged `newsletter`. |
| **Rich text** | Eyebrow, heading, text, button | A flexible band for anything else. |

---

## Product page blocks

The product page is built from reorderable blocks. Drag them into the order
your category needs — a ceramics shop and a denim brand want different things
near the top.

`Title · Price · Stock level · Short description · Variant picker · Size guide ·
Buy buttons · Reassurance · Accordion row (repeatable) · SKU · Share ·
Custom Liquid`

**Accordion rows** are repeatable: add one for Details, one for Shipping, one
for Returns, one for Care. Each can hold its own text, pull the product
description, or pull the content of a Shopify page — so you write your shipping
policy once and every product shows it.

**Custom Liquid** is where a review app's widget, a badge, or a subscription
app's snippet goes without editing theme files.

---

## What is *not* a setting

Deliberately. These are Shopify's job, and the theme reads them live:

products · variants · prices · compare-at prices · inventory · collections ·
filters · customers · orders · discounts · payments · shipping · taxes ·
checkout · search · product recommendations

If you find yourself wanting to type a price into the theme editor, something
has gone wrong. Put it in Shopify.
