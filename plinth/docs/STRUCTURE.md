# Developer notes

For whoever opens the theme next — including you, in six months.

## Architecture in one line

Liquid renders markup from Shopify objects; native web components add
behaviour; three stylesheets hold a token-driven design system. No framework,
no build step, no dependencies.

## The split

| Belongs to the theme | Belongs to Shopify |
| --- | --- |
| Layout, typography, colour, motion | Products, variants, prices, compare-at prices |
| Component markup and behaviour | Inventory, availability |
| Section and block structure | Collections, storefront filters, sorting |
| Merchandising copy | Customers, orders, discounts |
| — | Cart mutation, checkout, payments, taxes, shipping |
| — | Search, predictive search, product recommendations |

There is no local product data anywhere in the theme. If a number is shown, a
Shopify object produced it.

## Files

```
assets/
  base.css          Tokens, reset, typography, layout, buttons, forms, motion
  components.css    Header, nav, drawers, product card, ledger grid, search, toast, footer
  sections.css      Hero, editorial, promo, reviews, product page, collection, cart, account
  theme.js          Dialogs, header, reveal, wishlist, recently viewed, toasts, tabs
  cart.js           /cart/*.js + Section Rendering API
  product.js        Variant picker, gallery, sticky ATC, quick add, quick view, share
  search.js         Predictive search overlay
  collection.js     Facets, sort, load more

config/             settings_schema.json (every merchant control), settings_data.json
layout/             theme.liquid, password.liquid
locales/            en.default.json (every storefront string)
sections/           35 sections, including header-group.json and footer-group.json
snippets/           27 reusable partials
templates/          JSON templates, including customers/
```

## Conventions

**CSS.** Everything is a custom property on `:root`, written by `theme.liquid`
from theme settings. Derived tints use `color-mix` so the editable palette
stays at nine values. Class names are BEM-ish: `.block`, `.block__element`,
`.block--modifier`. Component styles never hardcode a colour or a spacing
value.

**Liquid.** Markup lives in snippets; sections compose snippets and own the
`{% schema %}`. Snippets take explicit named arguments and document them in a
comment at the top. Nothing reaches for a global it was not handed, except the
page-level objects (`product`, `collection`, `cart`) inside `main-*` sections.

**JavaScript.** One custom element per behaviour, registered once, upgraded
wherever the markup appears — including inside content the Section Rendering
API swaps in. `Plinth.DialogElement` is the shared base for the cart drawer,
mobile nav, filter drawer, modals, lightbox and search overlay: it handles the
focus trap, Escape, scroll lock and focus restoration in one place.

## Section Rendering API

Every cart mutation posts to `/cart/*.js` and asks Shopify to re-render the
sections marked `data-cart-section`. The browser never calculates a total.

```
POST /cart/add.js
  sections=cart-drawer,cart-count
  sections_url=/current/path
→ { items: [...], sections: { "cart-drawer": "<html>", "cart-count": "<html>" } }
```

The same pattern drives variant changes (`?variant=…&section_id=…`), filtering
(`?filter.p.…&section_id=…`), load more, predictive search, quick view and
recently viewed. When the state that matters lives on the server, ask the
server to render it.

## Performance

- Three stylesheets, no CSS framework
- ~14KB of JavaScript across five files, all `defer`
- Responsive `srcset` + `sizes` on every image; first row eager with
  `fetchpriority="high"`, everything else lazy
- Explicit `width`/`height` on images so nothing shifts as they load
- Fonts loaded with `display=swap` and a real fallback stack
- No web font is required at all if you switch Font source to *Shopify fonts*

## Accessibility

Semantic landmarks and heading order · visible focus rings that are never
suppressed for keyboard users · focus trapped and restored around every dialog ·
`aria-expanded` / `aria-current` / `aria-pressed` on every stateful control ·
44px minimum touch targets · unavailable variants disabled rather than hidden ·
live regions for toasts and search results · `prefers-reduced-motion` honoured
globally · a skip link that actually works.

## SEO

`Product`, `Organization`, `WebSite` + `SearchAction`, and `BreadcrumbList`
structured data generated from Shopify objects · one `h1` per page · Open Graph
and Twitter tags · canonical URLs · breadcrumbs on product, collection and
article pages · alt text pulled from Shopify media, never invented.

## Extending it

**A new homepage section.** Copy the closest existing section, rename it, edit
the `{% schema %}`, and give it a `presets` entry so it appears in *Add
section*. Reuse `section-head`, `product-card` and the `ledger` grid rather
than writing new layout.

**A new palette preset.** Add a `when` branch to the `case` in `theme.liquid`
and an option in `settings_schema.json`. Ten lines.

**A third type personality.** Add the option, then set `--font-display` in the
same block. The rest of the type scale follows.

## Testing a change

```bash
shopify theme dev --store your-store.myshopify.com   # live reload
shopify theme check                                   # linter
./build-demo.sh                                       # rebuild the preview
```

`shopify theme check` should stay clean. The preview and the theme share
stylesheets, so a CSS change shows up in both.
