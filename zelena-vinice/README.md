# Zelená Vinice — Framer code component

`ZelenaViniceSite.tsx` (repo root) is the whole restaurant page as one Framer
code component. Everything visible is a property control; nobody using it needs
to open the file.

## Getting it into Framer

1. In a Framer project: **Assets → Code → New code file**, name it
   `ZelenaViniceSite`.
2. Delete the placeholder contents and paste the whole of
   `ZelenaViniceSite.tsx`.
3. Drag the component onto a page and set its frame to **Fill** width and
   **Fit content** height.

The first field in the properties panel is **Version**. If a setting you expect
is missing, read that field first — it says which build Framer actually loaded.
A code file with an error keeps serving the previous working build, so a stale
version marker is the answer to most "my change did nothing" moments.

## The panel

| Group | What it holds |
|---|---|
| 🎨 Colors | Five ready palettes plus **Custom colors**; soft background glows |
| 🖋️ Type & spacing | Web fonts, heading/body family, content width, section spacing, corner radius, frosted glass |
| 🔝 Header | Name, nav links, button, sticky behaviour, menu button |
| ☰ Slide-out menu | Heading and the icon links inside the drawer |
| 🖼️ Hero | Photo **or video**, headline, text, two buttons, height, overlay colour and strength, parallax |
| 🍽️ Menu | Categories, each with a photo, an icon and its own list of dishes |
| 📖 About | Heading, paragraphs, photo or icon |
| 📸 Gallery | Tiles, each a photo or an icon |
| 📍 Find us | Address, hours, phone, transport, and the map |
| 📅 Reservations | Field labels, guest options, and what pressing Send does |
| 🦶 Footer | Name, contact line, links, small print |

Every section has a **Show** switch, so the same component can be one page or
just the parts you want.

### Colours

Pick a palette from **Theme** and the whole page follows — buttons, headings,
prices, borders, glows, the map tint, the hero overlay. Choose **Custom colors**
to open the individual pickers; everything else is derived from them, so a
hover state or a shadow never has to be set by hand.

### Menu categories and dishes

Each category is a row under 🍽️ Menu → **Categories**. Open one and it has its
own **Dishes** list. The caption under a category name ("6 dishes") counts
itself unless you type something in **Caption**. Clicking a category on the page
opens its dishes in a panel.

Icons come from a dropdown of 35 food and navigation glyphs, drawn inline — no
icon font is loaded, so they render offline and take the palette colour. A
category with a photo hides its icon.

### The map

**From address** builds a Google Maps embed from the address you typed; no
account or key needed. **Pasted embed** takes whatever you copy from Google
Maps' *Share → Embed a map* — paste the entire `<iframe …>` snippet, it pulls
the `src` out. **No map** drops the frame and lets the details span the card.

The tint is applied over the frame in `color` blend mode, so the map follows the
palette while staying interactive. Google's own controls and branding are
theirs, not the component's.

### Reservations

- **Show a thank-you** — the form validates and shows the message. No network
  request, nothing to set up. This is the default.
- **Send to my form service** — posts the fields as JSON to a hosted endpoint
  (Formspree and friends). Paste the endpoint; the error text is what a visitor
  sees if the service is down.
- **Link to a booking page** — replaces the form with one button pointing at
  OpenTable, Cal.com, or whatever you use.

Framer's canvas does not send the request; test this in Preview or on the
published site.

## Photos

`photos/` holds the images from the original mockup, ready to upload into the
Image controls:

| File | Where it goes |
|---|---|
| `hero-spaghetti-bolognese.jpg` | 🖼️ Hero → Photo |
| `menu-01-starters.webp` | 🍽️ Menu → Starters → Photo |
| `menu-02-soups.webp` | Soups |
| `menu-03-salads.webp` | Salads |
| `menu-04-main-plate.webp` | Pasta and Steaks |

With no photos at all the page still looks finished — every empty slot falls
back to a tinted tile with its icon.

## `zelena-vinice-mockup.html`

The static HTML the component was ported from, kept for reference. The Framer
build follows it closely; it differs in three deliberate places:

- the muted greys and the price gold were darkened slightly so body text clears
  4.5:1 contrast;
- stacked on a phone, the hero becomes one dark panel instead of the original's
  light one, where the headline and the paragraph were close to unreadable;
- the hero section no longer reserves 90vh, so the page is a little tighter
  above the menu — Framer sizes the component from its content instead.

## If something looks wrong in Framer

**The page is cut off at the bottom** — the frame around the component has a
fixed height. Set it to **Fit content** on that breakpoint. The component itself
uses `overflow-x: clip`, never `hidden`, so it does not clip its own content.

**A setting is missing from the panel** — check the Version field first.

**The layout is desktop-shaped inside a narrow frame** — it should not be: the
breakpoints read the component's own width through a ResizeObserver, not the
window's. If it happens, the frame is wider than it looks.
