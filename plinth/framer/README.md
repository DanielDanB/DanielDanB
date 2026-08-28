# Plinth for Framer

`PlinthShop.tsx` is the Plinth storefront as a single Framer code component.
The whole page — palette, typography, layout, every section and every product —
is edited from Framer's properties panel. Nobody using it needs to open the
code.

## Installing

1. In Framer: **Assets → Code → New code file**, name it `PlinthShop`.
2. Delete the sample code, paste the whole of `PlinthShop.tsx`, save.
3. Drag **PlinthShop** from the Assets panel onto a page.
4. Set the frame to **Fill** width and **Fit content** height.

The first field in the panel is **Version**. If a setting you expect is
missing, check that field first: it shows `v1 · storefront` only when Framer
has actually loaded this build. A code file with an error keeps serving the
last one that compiled.

## What the panel gives you

| Group | Controls |
| --- | --- |
| 🎨 Colors | Four palette presets, or Custom for all ten colours |
| 🖋️ Typography | Editorial serif ↔ Modern grotesk, fonts, size, tracking, case |
| 📐 Layout | Width, spacing, radius, surfaces, button shape, section numbers, motion |
| 📣 Announcement bar | Text, link, colour |
| 🧭 Header | Logo, wordmark, which icons show, cart count |
| 🧭 Menu links / Mega menu links | Repeatable rows; a shared column name becomes a mega-menu column |
| 🖼️ Hero | Split or full bleed, image **or video**, headings, two buttons, the bottom rail |
| ➰ Trust marquee | Repeatable statements with icons, loop speed |
| 🛍️ Products | Grid style, columns, and a repeatable product list |
| 🗂️ Categories | Mosaic tiles — the first is the tall one |
| 📖 Brand story | Image with overlapping inset, copy, repeatable figures |
| 🔥 Promo banner | Full-bleed image or video, copy, repeatable details |
| ⭐ Reviews | Aggregate score plus a repeatable wall of quotes |
| 📰 Journal | Repeatable posts |
| ✉️ Newsletter | Copy plus an optional form endpoint |
| 🔻 Footer | Brand text, socials, repeatable link columns |

Every section has a **Show** switch, so the page can be as short or as long as
the brand needs.

## How it relates to the Shopify theme

The Framer component is the **storefront page**. Framer has no cart or
checkout, so each product links out to its Shopify product page and Shopify
keeps the cart, stock, prices and payment. That combination — a Framer landing
page in front of a Shopify store — is what most small brands actually run.

The visual language is the same as `plinth/theme`: the same palette tokens, the
same ledger grid, the same index rail and seam hero. A store using both reads
as one brand.

If you want the whole shop inside Shopify instead, use `plinth/theme` and
ignore this file.

## Things worth knowing

**Images.** Every image slot is optional. An empty one shows a quiet
placeholder label rather than a broken box, so the component looks deliberate
the moment it lands on the canvas.

**Video.** The hero and promo banner each take a video as well as an image, and
the video wins. A `.mp4` URL pasted into an image field also works. Videos are
muted and looped, because browsers block autoplay with sound.

**Swatches** are a comma-separated list per product (`#E9E4DA, #B0745C`), which
beats four colour pickers on every row.

**Mega menu and footer columns** are flat arrays with a `Column` field. Rows
sharing a column name become one column — Framer arrays cannot nest, and this
is the way round it.

**Newsletter.** With **Form endpoint** empty, the form sends nothing anywhere
and just shows the thank-you message. Paste a Formspree, Mailchimp or Shopify
form URL to make it live. Nothing is requested from any third party until you
configure it.

**Fonts.** Fraunces and Archivo load from Google Fonts by default. Turn off
**Load Google Fonts** if you would rather serve them from Framer's own font
settings, or if you have set different families in the two font fields.

**Responsiveness** follows the component's own width, not the browser window,
because Framer renders it in frames of any size. The breakpoints are 1100,
820 and 560px of component width.

## If something does not appear

- Check the **Version** field first.
- If the page looks cut off at the bottom, the frame around the component is
  set to a fixed height. Set it to **Fit content** on that breakpoint.
- If a whole panel group is missing, Framer dropped it because a `hidden`
  callback threw. Every callback in this file defaults its parameter and uses
  optional chaining, so this should not happen — but that is what it means.

## Verified

Checked with a headless browser before shipping:

- compiles, and renders with **no props at all** and in every section mode
- 189 property controls: all titled, all with defaults, every `hidden`
  callback survives `undefined`, `null` and `{}`
- zero horizontal overflow at 1600, 1440, 1024, 820, 560, 390 and 320px
- `overflow-y` stays `visible`, and root height matches content within 1px, so
  Framer's auto-height keeps working
- the mobile drawer mounts only while open and does not widen the published
  page
- all four palettes clear 4.5:1 on body text and button labels

Not verified: behaviour inside the real Framer editor, which cannot be
automated from here. Paste it in and check the Version field.
