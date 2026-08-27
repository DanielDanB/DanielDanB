# Shopify setup

What to configure inside Shopify so the theme has real data to render. None of
this is theme-specific — it is how Shopify stores work — but it is the fastest
route from "installed" to "looks like the demo".

---

## Navigation and the mega menu

**Content → Menus → Main menu.**

The mega menu is built from menu structure, not from theme settings:

- A top-level item with **no children** renders as a plain link.
- A top-level item with **children** renders as a dropdown.
- A top-level item whose children **have their own children** renders as a
  full-width mega menu, one column per child.

```
Shop                       ← top level
├── Objects                ← becomes a mega menu column heading
│   ├── Vessels
│   ├── Serving
│   └── Storage
└── Lighting
    ├── Table
    └── Floor
```

To put an image in a mega menu: theme editor → Header → **Add block → Mega menu
image**, then type the top-level item's title exactly (`Shop`) and pick an
image.

---

## Filters

Install Shopify's free **Search & Discovery** app, then
*Search & Discovery → Filters*. Add filters for availability, price, and any
product options or metafields you want.

Plinth renders whatever you add:
- A filter whose name contains *colour* or *color* renders as **swatches**.
- **Price** renders as a from/to pair.
- Everything else renders as a checkbox list with counts.

Filter values with a count of zero are disabled rather than hidden, so shoppers
can see what exists before learning it is unavailable.

---

## Colour swatches

**Settings → Products → Options.** Set a swatch (a colour or an image) for each
value of your Colour option. Shopify then serves the swatch to the theme and it
appears on product cards, the product page and the filters.

Without swatches configured, the theme falls back to reading the value name as
a CSS colour, so `Sand`, `Olive` and `Slate` still render something sensible.
Configuring them properly is better.

---

## Free shipping meter

Two halves that must agree:

1. **Settings → Shipping and delivery** — create a rate that is free above a
   threshold.
2. **Theme settings → Cart** — enter the same number in *Free shipping
   threshold* (numbers only, in your store currency).

The theme only draws the meter. Shopify decides what shipping actually costs.

---

## Reviews and ratings

Plinth reads the two metafields most review apps write:

- `reviews.rating`
- `reviews.rating_count`

Install any review app that writes them (Shopify's own Product Reviews, Judge.me,
Okendo, Loox, Yotpo and others do) and stars appear on cards and product pages
automatically. Until then, no stars are shown — a new store never displays
empty ratings.

The review app's full widget goes in a **Custom Liquid** block on the product
page.

---

## Specification table

Create a product metafield:

- Namespace and key: `custom.specifications`
- Type: **List of single line text** pairs, or a JSON list of two-item lists

Fill it per product and the product page renders a specification ledger. Leave
it empty and the section does not appear.

---

## Recommendations

The "You may also like" section uses Shopify's own product recommendation
engine, which learns from real order history. It needs no configuration and
improves as you take orders.

---

## Customer accounts

**Settings → Customer accounts.** Plinth includes styled login, register,
account, order history, addresses, password reset and account activation pages.
If you turn customer accounts off, the theme hides the account link.

---

## Markets, currencies and languages

**Settings → Markets.** Once configured, the country and language pickers
appear in the footer automatically. All prices come from Shopify, so they are
correct per market without any theme change.

---

## Before you launch

- [ ] Menus built (`main-menu`, `footer`)
- [ ] Filters added in Search & Discovery
- [ ] Colour swatches set in Settings → Products → Options
- [ ] Free shipping threshold matches the shipping rate
- [ ] Policies written (Settings → Policies) — they populate the footer links
- [ ] Favicon and social sharing image uploaded
- [ ] A test order placed end to end
