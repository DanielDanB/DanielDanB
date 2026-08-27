/* ==========================================================================
   PLINTH demo — demo.js
   Drives the standalone preview. This file exists only so the template can be
   viewed without a Shopify store; in the theme itself every one of these
   interactions is Liquid plus the theme's own web components, and every
   number below comes from Shopify.
   ========================================================================== */

/* ---------------------------------------------------------------- icons -- */

const ICON = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5" stroke-linecap="round"/>',
  cart: '<path d="M4.5 7.5h15l-1.2 12.2a1 1 0 0 1-1 .8H6.7a1 1 0 0 1-1-.8L4.5 7.5Z" stroke-linejoin="round"/><path d="M9 9.5V6a3 3 0 0 1 6 0v3.5" stroke-linecap="round"/>',
  user: '<circle cx="12" cy="8.5" r="3.75"/><path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" stroke-linecap="round"/>',
  heart: '<path d="M12 20.2 4.9 13.4a4.4 4.4 0 0 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 0 1 6.2 6.2L12 20.2Z" stroke-linejoin="round"/>',
  menu: '<path d="M3.5 7.5h17M3.5 12h17M3.5 16.5h17" stroke-linecap="round"/>',
  close: '<path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/>',
  down: '<path d="m5 9 7 7 7-7" stroke-linecap="round" stroke-linejoin="round"/>',
  left: '<path d="m15 4-7 8 7 8" stroke-linecap="round" stroke-linejoin="round"/>',
  right: '<path d="m9 4 7 8-7 8" stroke-linecap="round" stroke-linejoin="round"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke-linecap="round"/>',
  minus: '<path d="M5 12h14" stroke-linecap="round"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round"/>',
  truck: '<path d="M2.75 6.75h11v10h-11z"/><path d="M13.75 10.25h4l3.5 3.25v3.25h-7.5z"/><circle cx="7" cy="18.25" r="1.75"/><circle cx="17" cy="18.25" r="1.75"/>',
  ret: '<path d="M4 12a8 8 0 1 1 2.6 5.9" stroke-linecap="round"/><path d="M3.5 7.5v4.2h4.2" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M12 3.2 5 5.9v5.4c0 4.2 2.8 7.6 7 9.5 4.2-1.9 7-5.3 7-9.5V5.9L12 3.2Z" stroke-linejoin="round"/><path d="m9 12 2.2 2.2L15.5 10" stroke-linecap="round" stroke-linejoin="round"/>',
  leaf: '<path d="M20 4c0 9-5.5 14-12 14a5.5 5.5 0 0 1 0-11c4 0 6-3 12-3Z" stroke-linejoin="round"/><path d="M4 20c3-5 7-8 12-9.5" stroke-linecap="round"/>',
  filter: '<path d="M4 7h16M7 12h10M10 17h4" stroke-linecap="round"/>',
  expand: '<path d="M9 4.5H4.5V9M15 4.5H19.5V9M9 19.5H4.5V15M15 19.5H19.5V15" stroke-linecap="round" stroke-linejoin="round"/>',
  ruler: '<path d="M3.5 9.5h17v5h-17z"/><path d="M7.5 9.5v2.5M11 9.5v3.5M14.5 9.5v2.5M18 9.5v3.5" stroke-linecap="round"/>',
};

const FILLED = { star: '<path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z"/>' };

function icon(name, size = 20) {
  if (FILLED[name]) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILLED[name]}</svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${ICON[name]}</svg>`;
}

const stars = (rating, size = 12) =>
  `<span class="rating__stars" aria-hidden="true">${[1, 2, 3, 4, 5]
    .map((i) => `<span class="${i > Math.round(rating) ? 'rating__star--empty' : ''}">${icon('star', size)}</span>`)
    .join('')}</span>`;

/* ----------------------------------------------------------------- state - */

const state = {
  cart: [],
  wishlist: new Set(),
  recent: [],
  filters: { colours: new Set(), sizes: new Set(), inStock: false, max: null },
  sort: 'featured',
  shown: 6,
};

const FREE_SHIPPING = 15000;
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/* --------------------------------------------------------------- toasts -- */

function toast(message, error) {
  const region = $('.toast-region');
  const el = document.createElement('div');
  el.className = 'toast' + (error ? ' toast--error' : '');
  el.innerHTML = `<span class="toast__body">${message}</span>`;
  region.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove());
  }, 3400);
}

/* ------------------------------------------------------------ components - */

function priceHtml(product, extraClass = '') {
  const sale = product.compareAt && product.compareAt > product.price;
  const pct = sale ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;
  return `<span class="price tabular ${sale ? 'price--on-sale' : ''} ${extraClass}">
    <span class="price__current">${money(product.price)}</span>
    ${sale ? `<s class="price__compare">${money(product.compareAt)}</s><span class="price__save">Save ${pct}%</span>` : ''}
  </span>`;
}

function badgeHtml(product) {
  if (product.stock === 0) return '<span class="badge badge--sold-out">Sold out</span>';
  if (product.compareAt) return '<span class="badge badge--sale">Sale</span>';
  if (product.tag === 'New') return '<span class="badge badge--new">New</span>';
  if (product.tag) return `<span class="badge badge--new">${product.tag}</span>`;
  return '';
}

function productCard(product, index = 0) {
  const saved = state.wishlist.has(product.handle);
  return `
    <article class="card">
      <a class="card__media media media--portrait" href="#/products/${product.handle}" tabindex="-1" aria-hidden="true">
        <span class="card__img card__img--main">${artwork(product.seed, 0)}</span>
        <span class="card__img card__img--alt">${artwork(product.seed, 1)}</span>
      </a>

      <div class="badge-stack">${badgeHtml(product)}</div>

      <button type="button" class="card__wishlist ${saved ? 'is-active' : ''}" data-wish="${product.handle}"
        aria-pressed="${saved}" aria-label="Save ${product.title} to wishlist">${icon('heart', 16)}</button>

      ${
        product.stock > 0
          ? `<div class="card__actions">
              <button type="button" class="btn btn--sm btn--full" data-quick="${product.handle}">
                <span>${product.colours.length > 1 || product.sizes.length ? 'Quick view' : 'Quick add'}</span>
              </button>
            </div>`
          : ''
      }

      <div class="card__body">
        <h3 class="card__title"><a href="#/products/${product.handle}">${product.title}</a></h3>
        <span class="rating">${stars(product.rating)}<span class="rating__count">(${product.reviews})</span></span>
        <div class="card__meta">
          ${priceHtml(product)}
          <span class="swatches">
            ${product.colours
              .slice(0, 4)
              .map((c) => `<span class="swatch" style="--swatch:${c.hex}" title="${c.name}"></span>`)
              .join('')}
          </span>
        </div>
      </div>
    </article>`;
}

function sectionHead({ index, eyebrow, heading, body, linkLabel, linkHref }) {
  return `
    <div class="section-head reveal">
      <div class="section-head__index">
        ${index ? `<span class="label section-head__num">${index}</span>` : ''}
        <span class="label">${eyebrow}</span>
        <span class="section-head__index-spacer"></span>
        ${linkLabel ? `<a class="label link hide-mobile" href="${linkHref}">${linkLabel}</a>` : ''}
      </div>
      ${
        heading || body
          ? `<div class="section-head__row">
              ${heading ? `<h2 class="section-head__title">${heading}</h2>` : ''}
              ${body ? `<div class="section-head__body">${body}</div>` : ''}
            </div>`
          : ''
      }
    </div>`;
}

/* ------------------------------------------------------------------ home - */

function viewHome() {
  const featured = CATALOGUE.slice(0, 8);
  const best = CATALOGUE.slice(3, 7);

  return `
    <section class="hero hero--seam hero--split-40">
      <div class="hero__pane">
        <div class="hero__content">
          <span class="label label--accent reveal">Autumn release</span>
          <h2 class="hero__title reveal" style="--reveal-delay:60ms">Objects worth keeping</h2>
          <p class="hero__body reveal" style="--reveal-delay:120ms">A small collection, made in limited runs and finished by hand.</p>
          <div class="hero__actions reveal" style="--reveal-delay:180ms">
            <a class="btn btn--primary" href="#/collections/objects"><span>Shop the collection</span></a>
            <a class="btn btn--secondary" href="#/collections/furniture"><span>Our story</span></a>
          </div>
        </div>
      </div>
      <div class="hero__media reveal-media">${scene(0)}</div>
      <div class="hero__rail">
        <span class="hero__rail-item label">Autumn 2026 — release 04</span>
        <span class="hero__rail-item label hide-mobile">12 makers · 4 workshops</span>
        <span class="hero__rail-item label">Shipping worldwide</span>
      </div>
    </section>

    <div class="marquee label">
      <div class="marquee__track">
        ${[0, 1]
          .map(
            () => `<div class="marquee__group">
              <span class="marquee__item">${icon('truck', 16)} Free shipping over €150</span>
              <span class="marquee__item">${icon('ret', 16)} 30-day returns</span>
              <span class="marquee__item">${icon('shield', 16)} Secure checkout</span>
              <span class="marquee__item">${icon('leaf', 16)} Made in small runs</span>
              <span class="marquee__item">${icon('star', 16)} Rated 4.9 by 2,431 customers</span>
            </div>`
          )
          .join('')}
      </div>
    </div>

    <section class="section">
      <div class="page-wrap">
        ${sectionHead({ index: '01', eyebrow: 'Featured', heading: "This season's shortlist", linkLabel: 'View all', linkHref: '#/collections/objects' })}
        <div class="ledger ledger--4">
          ${featured.map((p, i) => `<div class="reveal" style="--reveal-delay:${(i % 4) * 60}ms">${productCard(p, i)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-wrap">
        ${sectionHead({ index: '02', eyebrow: 'Categories', heading: 'Where to start' })}
        <div class="mosaic">
          ${COLLECTIONS.slice(0, 3)
            .map(
              (c, i) => `
            <a class="tile reveal-media" href="#/collections/${c.handle}">
              ${i === 0 ? portrait(i) : artwork(i + 4, 0)}
              <div class="tile__body">
                <h3 class="tile__title">${c.title}</h3>
                <span class="tile__cta">Shop ${icon('arrow', 14)}</span>
              </div>
            </a>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section--sunken">
      <div class="page-wrap">
        <div class="editorial">
          <div class="editorial__media reveal">
            <div class="media reveal-media">${portrait(3)}</div>
            <div class="editorial__inset"><div class="media">${artwork(2, 1)}</div></div>
          </div>
          <div class="editorial__body reveal" style="--reveal-delay:90ms">
            <span class="label label--accent">Our story</span>
            <h2>Made slowly, on purpose</h2>
            <div class="rte">
              <p>We work with a handful of makers and keep our runs small. It means we sell out sometimes, and it means every piece leaves the studio checked by someone who knows what it should feel like.</p>
            </div>
            <div><a class="btn btn--secondary" href="#/collections/furniture"><span>Read more</span></a></div>
            <div class="editorial__stats">
              <div class="stat"><span class="stat__value tabular">12</span><span class="label stat__label">Makers</span></div>
              <div class="stat"><span class="stat__value tabular">4.9</span><span class="label stat__label">Average rating</span></div>
              <div class="stat"><span class="stat__value tabular">30</span><span class="label stat__label">Day returns</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="promo">
      <div class="promo__media">${sceneDark()}</div>
      <div class="promo__body reveal">
        <span class="label">Limited release</span>
        <h2 class="h1">The winter capsule</h2>
        <p class="lede">Forty pieces. Once they are gone, they are gone.</p>
        <a class="btn btn--accent" href="#/collections/lighting"><span>Shop the capsule</span></a>
        <div class="promo__ledger">
          <div class="promo__ledger-item"><span class="promo__ledger-value">40</span><span class="label">Pieces</span></div>
          <div class="promo__ledger-item"><span class="promo__ledger-value">1</span><span class="label">Release</span></div>
          <div class="promo__ledger-item"><span class="promo__ledger-value">03</span><span class="label">Makers</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-wrap">
        ${sectionHead({ index: '03', eyebrow: 'Best sellers', heading: 'What people keep coming back for', linkLabel: 'View all', linkHref: '#/collections/objects' })}
        <div class="ledger ledger--4 ledger--loose">
          ${best.map((p, i) => `<div class="reveal" style="--reveal-delay:${i * 60}ms">${productCard(p, i)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-wrap">
        ${sectionHead({ index: '04', eyebrow: 'Customers', heading: 'What people tell us' })}
        <div class="reviews-summary reveal">
          <span class="reviews-summary__score tabular">4.9</span>
          ${stars(5, 14)}
          <span class="label label--muted">From 2,431 reviews</span>
        </div>
      </div>
      <div class="reviews-wall">
        ${REVIEWS.map(
          (r, i) => `
          <blockquote class="review reveal" style="--reveal-delay:${i * 80}ms">
            ${stars(r.r)}
            <p class="review__quote">${r.q}</p>
            <footer class="review__foot">
              <div>
                <div class="review__name">${r.n}</div>
                <div class="review__meta"><span class="review__verified">${icon('check', 12)} ${r.m}</span></div>
              </div>
            </footer>
          </blockquote>`
        ).join('')}
      </div>
    </section>

    <section class="section">
      <div class="page-wrap">
        ${sectionHead({ index: '05', eyebrow: 'Journal', heading: 'Notes from the studio', linkLabel: 'All posts', linkHref: '#/' })}
        <div class="journal">
          ${JOURNAL.map(
            (a, i) => `
            <a class="article-card reveal" href="#/">
              <div class="media media--landscape reveal-media">${artwork(i + 5, 1)}</div>
              <div class="stack--sm">
                <div class="article-card__meta label label--muted"><span>${a.d}</span><span>Studio</span></div>
                <h3 class="article-card__title">${a.t}</h3>
                <p class="article-card__excerpt">${a.x}</p>
              </div>
            </a>`
          ).join('')}
        </div>
      </div>
    </section>

    <section class="section section--sunken">
      <div class="page-wrap">
        <div class="newsletter">
          <div class="newsletter__body reveal">
            <span class="label label--accent">Keep in touch</span>
            <h2>First look, twice a month</h2>
            <p class="text-muted">New arrivals, restocks and the occasional studio note. No noise.</p>
            <form class="newsletter__form" data-newsletter>
              <div class="newsletter__row">
                <label class="field">
                  <input class="field__input" type="email" placeholder=" " required>
                  <span class="field__label">Email address</span>
                </label>
                <button type="submit" class="btn btn--primary"><span>Subscribe</span></button>
              </div>
              <p class="newsletter__note">Unsubscribe any time.</p>
            </form>
          </div>
          <div class="newsletter__media reveal-media"><div class="media">${artwork(7, 0)}</div></div>
        </div>
      </div>
    </section>`;
}

/* ------------------------------------------------------------ collection - */

function filteredProducts(handle) {
  let list = CATALOGUE.filter((p) => handle === 'all' || p.collection === handle);

  if (state.filters.colours.size) {
    list = list.filter((p) => p.colours.some((c) => state.filters.colours.has(c.name)));
  }
  if (state.filters.sizes.size) {
    list = list.filter((p) => p.sizes.some((s) => state.filters.sizes.has(s)));
  }
  if (state.filters.inStock) list = list.filter((p) => p.stock > 0);
  if (state.filters.max) list = list.filter((p) => p.price <= state.filters.max * 100);

  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'title-asc': (a, b) => a.title.localeCompare(b.title),
    best: (a, b) => b.reviews - a.reviews,
  };
  if (sorters[state.sort]) list = list.slice().sort(sorters[state.sort]);

  return list;
}

function facetsHtml() {
  const activeChips = [
    ...[...state.filters.colours].map((c) => ({ label: c, kind: 'colour', value: c })),
    ...[...state.filters.sizes].map((s) => ({ label: s, kind: 'size', value: s })),
    ...(state.filters.inStock ? [{ label: 'In stock only', kind: 'stock', value: '1' }] : []),
    ...(state.filters.max ? [{ label: `Up to €${state.filters.max}`, kind: 'price', value: '1' }] : []),
  ];

  return `
    <div class="facets" data-facets>
      <details class="facet" open>
        <summary class="facet__summary">Colour ${icon('down', 14)}</summary>
        <div class="facet__swatches">
          ${COLOURS.map(
            (c) => `<label class="facet-swatch" title="${c.name}">
              <input type="checkbox" data-facet="colour" value="${c.name}" ${state.filters.colours.has(c.name) ? 'checked' : ''}>
              <span class="facet-swatch__dot" style="--swatch:${c.hex}"></span>
              <span class="visually-hidden">${c.name}</span>
            </label>`
          ).join('')}
        </div>
      </details>

      <details class="facet" open>
        <summary class="facet__summary">Size ${icon('down', 14)}</summary>
        <div class="facet__list">
          ${SIZES.map(
            (s) => `<label class="checkbox">
              <input type="checkbox" data-facet="size" value="${s}" ${state.filters.sizes.has(s) ? 'checked' : ''}>
              <span class="checkbox__box" aria-hidden="true"></span>
              <span>${s}</span>
              <span class="facet__count">${CATALOGUE.filter((p) => p.sizes.includes(s)).length}</span>
            </label>`
          ).join('')}
        </div>
      </details>

      <details class="facet" open>
        <summary class="facet__summary">Price ${icon('down', 14)}</summary>
        <div class="facet__price">
          <label class="field field--boxed">
            <input class="field__input" type="number" data-facet="price" placeholder=" " value="${state.filters.max || ''}" min="0">
            <span class="field__label">Up to</span>
          </label>
        </div>
      </details>

      <details class="facet" open>
        <summary class="facet__summary">Availability ${icon('down', 14)}</summary>
        <div class="facet__list">
          <label class="checkbox">
            <input type="checkbox" data-facet="stock" ${state.filters.inStock ? 'checked' : ''}>
            <span class="checkbox__box" aria-hidden="true"></span>
            <span>In stock only</span>
          </label>
        </div>
      </details>
    </div>

    <div class="active-filters">
      ${activeChips
        .map((c) => `<button type="button" class="chip" data-clear-facet="${c.kind}" data-value="${c.value}">${c.label} ${icon('close', 10)}</button>`)
        .join('')}
      ${activeChips.length > 1 ? '<button type="button" class="chip" data-clear-facet="all">Clear all</button>' : ''}
    </div>`;
}

function viewCollection(handle) {
  const meta = COLLECTIONS.find((c) => c.handle === handle) || { title: 'All products', blurb: '' };
  const list = filteredProducts(handle);
  const shown = list.slice(0, state.shown);

  return `
    <div class="page-wrap">
      <div style="padding-top:var(--s-5)">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span class="breadcrumbs__sep">/</span><span aria-current="page">${meta.title}</span>
        </nav>
      </div>

      <header class="collection-head">
        <div class="collection-head__inner">
          <span class="label label--accent">Collection</span>
          <h1>${meta.title}</h1>
          <div class="collection-head__desc">${meta.blurb}</div>
        </div>
      </header>

      <div class="collection-bar">
        <div class="collection-bar__left">
          <button type="button" class="btn btn--ghost btn--sm hide-desktop" data-open="filters">${icon('filter', 16)}<span>Filter</span></button>
          <span class="label label--muted">${list.length} products</span>
        </div>
        <div class="collection-bar__right">
          <div class="select">
            <label class="visually-hidden" for="sort">Sort by</label>
            <select id="sort" data-sort>
              <option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="best" ${state.sort === 'best' ? 'selected' : ''}>Best selling</option>
              <option value="title-asc" ${state.sort === 'title-asc' ? 'selected' : ''}>Alphabetically, A–Z</option>
              <option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Price, low to high</option>
              <option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Price, high to low</option>
            </select>
            <span class="select__chevron">${icon('down', 12)}</span>
          </div>
        </div>
      </div>

      <div class="collection-layout">
        <aside class="facets-desktop" aria-label="Filter">${facetsHtml()}</aside>

        <div class="collection-results">
          ${
            shown.length
              ? `<div class="ledger ledger--3">
                  ${shown.map((p, i) => `<div class="reveal" style="--reveal-delay:${(i % 3) * 50}ms">${productCard(p, i)}</div>`).join('')}
                </div>
                ${
                  state.shown < list.length
                    ? `<div class="load-more">
                        <div class="load-more__track"><div class="load-more__fill" style="--progress:${(shown.length / list.length) * 100}%"></div></div>
                        <span class="load-more__count">${shown.length} of ${list.length} products</span>
                        <button type="button" class="btn btn--secondary" data-load-more><span>Load more</span></button>
                      </div>`
                    : ''
                }`
              : `<div class="collection-empty">
                  <h2 class="h4">No products match these filters.</h2>
                  <button type="button" class="btn btn--secondary" data-clear-facet="all"><span>Clear all filters</span></button>
                </div>`
          }
        </div>
      </div>
    </div>`;
}

/* --------------------------------------------------------------- product - */

const selection = { colour: null, size: null, qty: 1 };

function stockHtml(product) {
  if (product.stock === 0) return '<div class="stock stock--out"><p class="stock__row"><span class="stock__dot"></span>Out of stock</p></div>';
  if (product.stock <= 10) {
    return `<div class="stock stock--low">
      <p class="stock__row"><span class="stock__dot"></span>Only ${product.stock} left</p>
      <div class="stock__track"><div class="stock__fill" style="--progress:${(product.stock / 10) * 100}%"></div></div>
    </div>`;
  }
  return '<div class="stock"><p class="stock__row"><span class="stock__dot"></span>In stock</p></div>';
}

function variantHtml(product) {
  const colours = `
    <fieldset class="variant">
      <div class="variant__head"><legend class="label">Colour</legend><span class="variant__value">${selection.colour}</span></div>
      <div class="variant__options">
        ${product.colours
          .map(
            (c, i) => `<div class="variant__option">
              <input type="radio" name="colour" id="colour-${i}" value="${c.name}" ${selection.colour === c.name ? 'checked' : ''} data-variant="colour">
              <label class="variant__swatch" for="colour-${i}" style="--swatch:${c.hex}"><span class="visually-hidden">${c.name}</span></label>
            </div>`
          )
          .join('')}
      </div>
    </fieldset>`;

  const sizes = product.sizes.length
    ? `<fieldset class="variant">
        <div class="variant__head">
          <legend class="label">Size</legend>
          <button type="button" class="variant__value link" data-open="size-guide">Size guide</button>
        </div>
        <div class="variant__options">
          ${product.sizes
            .map(
              (s, i) => `<div class="variant__option">
                <input type="radio" name="size" id="size-${i}" value="${s}" ${selection.size === s ? 'checked' : ''}
                  ${i === 2 && product.stock < 5 ? 'disabled' : ''} data-variant="size">
                <label class="variant__pill" for="size-${i}">${s}</label>
              </div>`
            )
            .join('')}
        </div>
      </fieldset>`
    : '';

  return `<div class="stack--lg">${colours}${sizes}</div>`;
}

function viewProduct(handle) {
  const product = CATALOGUE.find((p) => p.handle === handle) || CATALOGUE[0];
  selection.colour = product.colours[0].name;
  selection.size = product.sizes[0] || null;
  selection.qty = 1;

  state.recent = [product.handle, ...state.recent.filter((h) => h !== product.handle)].slice(0, 8);

  const related = CATALOGUE.filter((p) => p.collection === product.collection && p.handle !== product.handle).slice(0, 4);
  const recent = state.recent.slice(1, 5).map((h) => CATALOGUE.find((p) => p.handle === h)).filter(Boolean);
  const media = [0, 1, 2].map((i) => artwork(product.seed, i % 2));

  return `
    <div class="page-wrap">
      <div style="padding-top:var(--s-5)">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span class="breadcrumbs__sep">/</span>
          <a href="#/collections/${product.collection}">${(COLLECTIONS.find((c) => c.handle === product.collection) || {}).title || 'Shop'}</a>
          <span class="breadcrumbs__sep">/</span><span aria-current="page">${product.title}</span>
        </nav>
      </div>

      <div class="product">
        <div class="gallery">
          <div class="gallery__thumbs no-scrollbar" role="list">
            ${media
              .map(
                (m, i) => `<button type="button" role="listitem" class="gallery__thumb" data-thumb="${i}" aria-current="${i === 0}">${m}</button>`
              )
              .join('')}
          </div>
          <div class="gallery__stage" data-stage>
            ${media.map((m, i) => `<div class="gallery__frame" data-frame="${i}" data-zoomable>${m}
              ${i === 0 ? `<button type="button" class="icon-btn gallery__expand hide-mobile" data-open="lightbox"><span class="visually-hidden">Open full screen gallery</span>${icon('expand', 16)}</button>` : ''}
            </div>`).join('')}
          </div>
          <div class="gallery__dots hide-desktop">
            ${media.map((_, i) => `<span class="gallery__dot" data-dot="${i}" aria-current="${i === 0}"></span>`).join('')}
          </div>
        </div>

        <div class="product-info">
          <div class="product-info__head">
            <span class="label label--muted">${product.vendor}</span>
            <h1 class="product-info__title">${product.title}</h1>
            <span class="rating">${stars(product.rating)}<span class="rating__count">${product.rating} · ${product.reviews} reviews</span></span>
          </div>

          <div class="product-info__price">
            ${priceHtml(product)}
            <p class="text-sm text-muted" style="margin-top:var(--s-2)">Tax included. Shipping calculated at checkout.</p>
          </div>

          ${stockHtml(product)}

          <div class="product-info__desc">${product.description}</div>

          ${variantHtml(product)}

          <div class="buy-box" data-buy-box>
            <div class="buy-box__row">
              <div class="qty">
                <button type="button" class="qty__btn" data-qty="-1" aria-label="Decrease quantity">${icon('minus', 14)}</button>
                <input class="qty__field tabular" type="number" value="1" min="1" aria-label="Quantity" data-qty-field>
                <button type="button" class="qty__btn" data-qty="1" aria-label="Increase quantity">${icon('plus', 14)}</button>
              </div>
              <div style="flex:1; display:grid; gap:var(--s-3)">
                <button type="button" class="btn btn--primary btn--full" data-add="${product.handle}" ${product.stock === 0 ? 'disabled aria-disabled="true"' : ''}>
                  <span>${product.stock === 0 ? 'Sold out' : 'Add to cart'}</span>
                </button>
                ${product.stock ? '<button type="button" class="btn btn--secondary btn--full" data-buy-now><span>Buy it now</span></button>' : ''}
              </div>
            </div>
            <button type="button" class="btn btn--ghost btn--sm" style="padding-left:0; justify-self:start" data-wish="${product.handle}">
              ${icon('heart', 16)}<span>Save to wishlist</span>
            </button>
          </div>

          <div class="assurance">
            <p class="assurance__item">${icon('truck', 16)}<span>Free shipping over €150 · dispatched within one working day</span></p>
            <p class="assurance__item">${icon('ret', 16)}<span>30 days to change your mind, return label included</span></p>
            <p class="assurance__item">${icon('shield', 16)}<span>Secure checkout with Shop Pay, Apple Pay and cards</span></p>
          </div>

          <div class="accordion">
            <details class="accordion__item" open>
              <summary class="accordion__summary">Details <span class="accordion__icon"></span></summary>
              <div class="accordion__panel">${product.description} Each piece is stamped underneath with the year it was made.</div>
            </details>
            <details class="accordion__item">
              <summary class="accordion__summary">Shipping <span class="accordion__icon"></span></summary>
              <div class="accordion__panel">Tracked delivery on every order. Europe 2–4 working days, rest of world 5–9. Duties calculated at checkout.</div>
            </details>
            <details class="accordion__item">
              <summary class="accordion__summary">Returns <span class="accordion__icon"></span></summary>
              <div class="accordion__panel">Thirty days, unused and in original packaging. We pay for the label on faulty items.</div>
            </details>
          </div>

          <p class="text-sm text-muted">SKU: PL-${1000 + product.seed}-${(selection.colour || '').slice(0, 2).toUpperCase()}</p>
        </div>
      </div>

      <section class="section section--tight">
        <h2 class="h3" style="margin-bottom:var(--s-5)">Specifications</h2>
        <div class="specs">
          ${product.specs.map(([k, v]) => `<div class="specs__row"><div class="specs__key">${k}</div><div class="specs__value">${v}</div></div>`).join('')}
        </div>
      </section>

      <section class="section section--tight">
        ${sectionHead({ index: '01', eyebrow: 'Reviews', heading: `${product.rating} out of 5` })}
        <div class="grid grid--2" style="gap:var(--s-8)">
          <div class="review-bars">
            ${[5, 4, 3, 2, 1]
              .map((n) => {
                const pct = n === 5 ? 82 : n === 4 ? 13 : n === 3 ? 3 : 1;
                return `<div class="review-bar"><span>${n} star</span><span class="review-bar__track"><span class="review-bar__fill" style="--progress:${pct}%"></span></span><span class="tabular">${pct}%</span></div>`;
              })
              .join('')}
          </div>
          <div class="review-list">
            ${REVIEWS.slice(0, 2)
              .map(
                (r) => `<div class="review-item">
                  <div class="review-item__head">${stars(r.r)}<span class="text-sm text-muted">${r.m}</span></div>
                  <p>${r.q}</p>
                  <span class="text-sm text-muted">${r.n}</span>
                </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      ${
        related.length
          ? `<section class="section section--tight">
              ${sectionHead({ index: '02', eyebrow: 'Recommended', heading: 'You may also like' })}
              <div class="ledger ledger--4">${related.map((p, i) => `<div class="reveal">${productCard(p, i)}</div>`).join('')}</div>
            </section>`
          : ''
      }

      ${
        recent.length
          ? `<section class="section section--tight">
              ${sectionHead({ index: '03', eyebrow: 'Your history', heading: 'Recently viewed' })}
              <div class="ledger ledger--4">${recent.map((p, i) => `<div class="reveal">${productCard(p, i)}</div>`).join('')}</div>
            </section>`
          : ''
      }
    </div>

    <div class="sticky-atc" data-sticky>
      <div class="sticky-atc__inner">
        <div class="sticky-atc__media">${artwork(product.seed, 0)}</div>
        <div class="sticky-atc__body">
          <span class="sticky-atc__title">${product.title}</span>
          <span class="text-sm text-muted tabular">${money(product.price)}</span>
        </div>
        <div class="sticky-atc__actions">
          <button type="button" class="btn btn--primary" data-add="${product.handle}"><span>Add to cart</span></button>
        </div>
      </div>
    </div>`;
}

/* ------------------------------------------------------------------ cart - */

const cartTotal = () => state.cart.reduce((sum, line) => sum + line.product.price * line.qty, 0);
const cartCount = () => state.cart.reduce((sum, line) => sum + line.qty, 0);

function renderCart() {
  const drawer = $('#cart-drawer');
  const total = cartTotal();
  const remaining = Math.max(0, FREE_SHIPPING - total);
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100);

  drawer.innerHTML = `
    <div class="drawer__head">
      <span class="label">Cart${cartCount() ? ` · ${cartCount()} items` : ''}</span>
      <button type="button" class="icon-btn" data-close><span class="visually-hidden">Close</span>${icon('close', 18)}</button>
    </div>

    ${
      state.cart.length === 0
        ? `<div class="drawer__body">
            <div class="cart-drawer__empty">
              <h2 class="h4">Your cart is empty</h2>
              <p class="text-muted text-sm">Start with a collection, or search for something you have in mind.</p>
              <a class="btn btn--primary" href="#/collections/objects" data-close><span>Continue shopping</span></a>
            </div>
          </div>`
        : `<div class="ship-meter ${remaining === 0 ? 'is-complete' : ''}">
            <p class="ship-meter__text">${remaining ? `You are <strong>${money(remaining)}</strong> away from free shipping` : 'Free shipping unlocked'}</p>
            <div class="ship-meter__track"><div class="ship-meter__fill" style="--progress:${progress}%"></div></div>
          </div>

          <div class="drawer__body">
            <div class="cart-items">
              ${state.cart
                .map(
                  (line, i) => `
                <div class="cart-item" data-line="${i}">
                  <a class="cart-item__media" href="#/products/${line.product.handle}" tabindex="-1" aria-hidden="true">${artwork(line.product.seed, 0)}</a>
                  <div class="cart-item__body">
                    <div class="cart-item__top">
                      <a class="cart-item__title" href="#/products/${line.product.handle}">${line.product.title}</a>
                      <span class="tabular text-sm">${money(line.product.price * line.qty)}</span>
                    </div>
                    <p class="cart-item__options">${[line.colour, line.size].filter(Boolean).join(' / ') || 'Default'}</p>
                    <div class="cart-item__foot">
                      <div class="qty qty--sm">
                        <button type="button" class="qty__btn" data-line-qty="-1" aria-label="Decrease quantity">${icon('minus', 12)}</button>
                        <input class="qty__field tabular" type="number" value="${line.qty}" min="1" aria-label="Quantity" readonly>
                        <button type="button" class="qty__btn" data-line-qty="1" aria-label="Increase quantity">${icon('plus', 12)}</button>
                      </div>
                      <button type="button" class="cart-item__remove" data-line-remove>Remove</button>
                    </div>
                  </div>
                </div>`
                )
                .join('')}
            </div>

            <div class="cart-recs">
              <span class="label label--muted">Pairs well with</span>
              <div class="cart-recs__list">
                ${CATALOGUE.filter((p) => !state.cart.some((l) => l.product.handle === p.handle))
                  .slice(0, 2)
                  .map(
                    (p) => `<div class="card-row">
                      <a class="card-row__media" href="#/products/${p.handle}" tabindex="-1" aria-hidden="true">${artwork(p.seed, 0)}</a>
                      <div class="card-row__body">
                        <a class="card-row__title" href="#/products/${p.handle}">${p.title}</a>
                        ${priceHtml(p)}
                        <div style="margin-top:var(--s-2)"><button type="button" class="btn btn--sm btn--secondary" data-add="${p.handle}">Quick add</button></div>
                      </div>
                    </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <div class="drawer__foot stack">
            <div class="cart-foot__row">
              <span class="cart-foot__total">Subtotal</span>
              <span class="cart-foot__total tabular">${money(total)}</span>
            </div>
            <p class="text-sm text-muted">Taxes and shipping calculated at checkout.</p>
            <button type="button" class="btn btn--primary btn--full btn--lg" data-checkout><span>Checkout</span></button>
            <div class="rte text-sm text-center"><p>Secure checkout. Free returns within 30 days.</p></div>
          </div>`
    }`;

  const bubble = $('[data-cart-count]');
  bubble.textContent = cartCount();
  bubble.hidden = cartCount() === 0;
  if (cartCount()) {
    bubble.classList.remove('is-bumped');
    void bubble.offsetWidth;
    bubble.classList.add('is-bumped');
  }
}

function addToCart(handle, opts = {}) {
  const product = CATALOGUE.find((p) => p.handle === handle);
  if (!product || product.stock === 0) return;

  const colour = opts.colour || product.colours[0].name;
  const size = opts.size || product.sizes[0] || null;
  const qty = opts.qty || 1;

  const existing = state.cart.find((l) => l.product.handle === handle && l.colour === colour && l.size === size);
  if (existing) existing.qty += qty;
  else state.cart.push({ product, colour, size, qty });

  renderCart();
  openDialog('cart-drawer');
  toast('Added to cart');
}

/* ---------------------------------------------------------------- search - */

function renderSearch(term) {
  const results = $('[data-search-results]');
  const idle = $('[data-search-idle]');

  if (term.trim().length < 2) {
    idle.hidden = false;
    results.hidden = true;
    return;
  }

  idle.hidden = true;
  results.hidden = false;

  const q = term.trim().toLowerCase();
  const hits = CATALOGUE.filter((p) => p.title.toLowerCase().includes(q) || p.collection.includes(q));
  const cols = COLLECTIONS.filter((c) => c.title.toLowerCase().includes(q));

  results.innerHTML = `
    <div class="search-results">
      <div class="search-aside">
        ${
          cols.length
            ? `<div><span class="label label--muted">Collections</span>
                <div class="stack--sm" style="margin-top:var(--s-3)">
                  ${cols.map((c) => `<a class="link" href="#/collections/${c.handle}" data-close>${c.title}</a>`).join('')}
                </div></div>`
            : ''
        }
        <a class="btn btn--secondary btn--sm" href="#/collections/all" data-close><span>View all results</span></a>
      </div>
      <div>
        ${
          hits.length
            ? `<span class="label label--muted">Products</span>
               <div class="ledger ledger--4 ledger--loose" style="margin-top:var(--s-4)">
                 ${hits.slice(0, 8).map((p, i) => productCard(p, i)).join('')}
               </div>`
            : `<div class="search-empty">
                 <h2 class="h4">No results for “${term}”</h2>
                 <p class="text-muted">Check the spelling, or try a broader term.</p>
               </div>`
        }
      </div>
    </div>`;
}

/* --------------------------------------------------------------- dialogs - */

const openStack = new Set();

function openDialog(id, opener) {
  const el = document.getElementById(id);
  if (!el || openStack.has(el)) return;

  el.classList.add('is-open');
  el.setAttribute('open', '');
  el._opener = opener || document.activeElement;
  openStack.add(el);

  const overlay = el.dataset.overlay ? $(el.dataset.overlay) : $('.overlay');
  if (overlay && !el.classList.contains('search-overlay') && !el.classList.contains('lightbox')) overlay.classList.add('is-open');

  document.body.classList.add('is-locked');
  requestAnimationFrame(() => {
    const focusTarget = $('[data-dialog-focus]', el) || $('button, a, input', el);
    if (focusTarget) focusTarget.focus();
  });
}

function closeDialog(el) {
  if (!el || !openStack.has(el)) return;
  el.classList.remove('is-open');
  el.removeAttribute('open');
  openStack.delete(el);
  if (!openStack.size) {
    document.body.classList.remove('is-locked');
    $('.overlay').classList.remove('is-open');
  }
  if (el._opener && document.contains(el._opener)) el._opener.focus();
}

function closeAll() {
  Array.from(openStack).forEach(closeDialog);
}

/* ----------------------------------------------------------------- boot -- */

let revealObserver;

function initReveal(scope = document) {
  const targets = $$('.reveal, .reveal-media', scope);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
  }
  targets.forEach((el) => revealObserver.observe(el));
}

function initGallery() {
  const stage = $('[data-stage]');
  if (!stage) return;

  const setCurrent = (index) => {
    $$('[data-thumb]').forEach((t) => t.setAttribute('aria-current', String(Number(t.dataset.thumb) === index)));
    $$('[data-dot]').forEach((d) => d.setAttribute('aria-current', String(Number(d.dataset.dot) === index)));
  };

  $$('[data-thumb]').forEach((thumb) =>
    thumb.addEventListener('click', () => {
      const index = Number(thumb.dataset.thumb);
      const frame = $(`[data-frame="${index}"]`);
      setCurrent(index);
      if (window.matchMedia('(max-width: 749px)').matches) {
        stage.scrollTo({ left: frame.offsetLeft - stage.offsetLeft, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: frame.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
      }
    })
  );

  stage.addEventListener(
    'scroll',
    () => {
      const centre = stage.scrollLeft + stage.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      $$('[data-frame]', stage).forEach((frame, i) => {
        const d = Math.abs(frame.offsetLeft + frame.clientWidth / 2 - centre);
        if (d < dist) { dist = d; best = i; }
      });
      setCurrent(best);
    },
    { passive: true }
  );

  $$('[data-zoomable]').forEach((frame) => {
    frame.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      if (window.matchMedia('(max-width: 749px)').matches) return;
      frame.classList.toggle('is-zoomed');
      frame.style.cursor = frame.classList.contains('is-zoomed') ? 'zoom-out' : 'zoom-in';
    });
    frame.addEventListener('mousemove', (event) => {
      if (!frame.classList.contains('is-zoomed')) return;
      const rect = frame.getBoundingClientRect();
      frame.style.setProperty('--zoom-x', ((event.clientX - rect.left) / rect.width) * 100 + '%');
      frame.style.setProperty('--zoom-y', ((event.clientY - rect.top) / rect.height) * 100 + '%');
    });
    frame.addEventListener('mouseleave', () => {
      frame.classList.remove('is-zoomed');
      frame.style.cursor = '';
    });
  });
}

function initStickyAtc() {
  const bar = $('[data-sticky]');
  const anchor = $('[data-buy-box]');
  if (!bar || !anchor) return;

  new IntersectionObserver(
    ([entry]) => bar.classList.toggle('is-visible', entry.boundingClientRect.top < 0 && !entry.isIntersecting),
    { threshold: 0 }
  ).observe(anchor);
}

/* ---------------------------------------------------------------- router - */

function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const view = $('#view');

  if (hash.startsWith('/products/')) {
    view.innerHTML = viewProduct(hash.split('/')[2]);
  } else if (hash.startsWith('/collections/')) {
    state.shown = 6;
    view.innerHTML = viewCollection(hash.split('/')[2]);
  } else {
    view.innerHTML = viewHome();
  }

  window.scrollTo({ top: 0 });
  initReveal(view);
  initGallery();
  initStickyAtc();
  closeAll();
}

function rerenderCollection() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash.startsWith('/collections/')) return;
  const scroll = window.scrollY;
  $('#view').innerHTML = viewCollection(hash.split('/')[2]);
  window.scrollTo({ top: scroll });
  initReveal($('#view'));
}

/* ------------------------------------------------------------- listeners - */

document.addEventListener('click', (event) => {
  const t = event.target;

  const opener = t.closest('[data-open]');
  if (opener) { event.preventDefault(); openDialog(opener.dataset.open, opener); return; }

  if (t.closest('[data-close]')) {
    const dialog = t.closest('.is-open');
    if (dialog) closeDialog(dialog);
    if (t.closest('a')) return;
    event.preventDefault();
    return;
  }

  if (t.closest('.overlay')) { closeAll(); return; }

  const add = t.closest('[data-add]');
  if (add) {
    event.preventDefault();
    addToCart(add.dataset.add, { colour: selection.colour, size: selection.size, qty: selection.qty });
    return;
  }

  const wish = t.closest('[data-wish]');
  if (wish) {
    event.preventDefault();
    const handle = wish.dataset.wish;
    const added = !state.wishlist.has(handle);
    added ? state.wishlist.add(handle) : state.wishlist.delete(handle);
    $$(`[data-wish="${handle}"]`).forEach((b) => {
      b.classList.toggle('is-active', added);
      b.setAttribute('aria-pressed', String(added));
    });
    const count = $('[data-wishlist-count]');
    count.textContent = state.wishlist.size;
    count.hidden = state.wishlist.size === 0;
    toast(added ? 'Saved to wishlist' : 'Removed from wishlist');
    return;
  }

  const quick = t.closest('[data-quick]');
  if (quick) {
    event.preventDefault();
    const product = CATALOGUE.find((p) => p.handle === quick.dataset.quick);
    if (product.colours.length === 1 && !product.sizes.length) { addToCart(product.handle); return; }
    $('[data-quick-view-body]').innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--s-6); padding:var(--s-6)">
        <div class="media media--portrait">${artwork(product.seed, 0)}</div>
        <div class="stack--lg">
          <div class="stack--sm">
            <h2 class="h3">${product.title}</h2>
            <span class="rating">${stars(product.rating)}<span class="rating__count">(${product.reviews})</span></span>
            ${priceHtml(product)}
          </div>
          <p class="text-muted text-sm">${product.description}</p>
          ${stockHtml(product)}
          <button type="button" class="btn btn--primary btn--full" data-add="${product.handle}"><span>Add to cart</span></button>
          <a class="link text-sm" href="#/products/${product.handle}" data-close>View full details</a>
        </div>
      </div>`;
    openDialog('quick-view', quick);
    return;
  }

  const step = t.closest('[data-qty]');
  if (step) {
    const field = $('[data-qty-field]');
    field.value = Math.max(1, Number(field.value) + Number(step.dataset.qty));
    selection.qty = Number(field.value);
    return;
  }

  const lineQty = t.closest('[data-line-qty]');
  if (lineQty) {
    const index = Number(lineQty.closest('[data-line]').dataset.line);
    state.cart[index].qty = Math.max(1, state.cart[index].qty + Number(lineQty.dataset.lineQty));
    renderCart();
    return;
  }

  if (t.closest('[data-line-remove]')) {
    const index = Number(t.closest('[data-line]').dataset.line);
    state.cart.splice(index, 1);
    renderCart();
    toast('Removed from cart');
    return;
  }

  if (t.closest('[data-checkout]')) {
    toast('Shopify handles checkout, payments, taxes and shipping from here.');
    return;
  }

  if (t.closest('[data-buy-now]')) {
    toast('Buy it now takes the shopper straight to Shopify checkout.');
    return;
  }

  if (t.closest('[data-load-more]')) {
    state.shown += 6;
    rerenderCollection();
    return;
  }

  const clear = t.closest('[data-clear-facet]');
  if (clear) {
    const kind = clear.dataset.clearFacet;
    if (kind === 'all') {
      state.filters = { colours: new Set(), sizes: new Set(), inStock: false, max: null };
    } else if (kind === 'colour') state.filters.colours.delete(clear.dataset.value);
    else if (kind === 'size') state.filters.sizes.delete(clear.dataset.value);
    else if (kind === 'stock') state.filters.inStock = false;
    else if (kind === 'price') state.filters.max = null;
    state.shown = 6;
    rerenderCollection();
    return;
  }

  const term = t.closest('[data-search-term]');
  if (term) {
    const input = $('[data-search-input]');
    input.value = term.dataset.searchTerm;
    input.focus();
    renderSearch(input.value);
  }
});

document.addEventListener('change', (event) => {
  const t = event.target;

  if (t.matches('[data-variant]')) {
    selection[t.dataset.variant] = t.value;
    const head = t.closest('.variant').querySelector('.variant__value');
    if (head && head.tagName !== 'BUTTON') head.textContent = t.value;
    return;
  }

  if (t.matches('[data-facet]')) {
    const kind = t.dataset.facet;
    if (kind === 'colour') t.checked ? state.filters.colours.add(t.value) : state.filters.colours.delete(t.value);
    if (kind === 'size') t.checked ? state.filters.sizes.add(t.value) : state.filters.sizes.delete(t.value);
    if (kind === 'stock') state.filters.inStock = t.checked;
    state.shown = 6;
    rerenderCollection();
    return;
  }

  if (t.matches('[data-sort]')) {
    state.sort = t.value;
    rerenderCollection();
  }
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-search-input]')) {
    clearTimeout(window._searchTimer);
    const value = event.target.value;
    window._searchTimer = setTimeout(() => renderSearch(value), 200);
  }

  if (event.target.matches('[data-facet="price"]')) {
    clearTimeout(window._priceTimer);
    const value = event.target.value;
    window._priceTimer = setTimeout(() => {
      state.filters.max = value ? Number(value) : null;
      state.shown = 6;
      rerenderCollection();
    }, 450);
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.matches('[data-newsletter]')) {
    event.preventDefault();
    event.target.innerHTML = '<p class="form-status">' + icon('check', 14) + ' Thank you. Check your inbox to confirm.</p>';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAll();
});

/* Mega menu on the demo header. */
document.addEventListener('DOMContentLoaded', () => {
  $$('[data-menu]').forEach((item) => {
    const trigger = $('[data-menu-trigger]', item);
    const panel = $('[data-menu-panel]', item);
    if (!trigger || !panel) return;

    const open = () => { trigger.setAttribute('aria-expanded', 'true'); panel.classList.add('is-open'); };
    const close = () => { trigger.setAttribute('aria-expanded', 'false'); panel.classList.remove('is-open'); };

    trigger.addEventListener('click', () => (trigger.getAttribute('aria-expanded') === 'true' ? close() : open()));
    item.addEventListener('pointerenter', open);
    item.addEventListener('pointerleave', close);
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) close(); });
  });

  /* Sticky header that steps aside on the way down. */
  const header = $('.header-wrap');
  let lastY = 0;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      header.classList.toggle('is-stuck', y > 8);
      header.classList.toggle('is-hidden', y > 140 && y > lastY && !document.body.classList.contains('is-locked'));
      lastY = y;
    },
    { passive: true }
  );

  renderCart();
  route();
});

window.addEventListener('hashchange', route);
