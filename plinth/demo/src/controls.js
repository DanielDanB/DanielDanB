/* ==========================================================================
   PLINTH demo — controls.js
   The floating panel is preview-only scaffolding. Each control here maps to a
   real setting in Theme settings: palette preset, type personality, corner
   radius and surface style. Changing them proves the whole design system runs
   off a handful of tokens rather than hardcoded values.
   ========================================================================== */

const PALETTES = {
  ink: {
    label: 'Ink & Chalk',
    tokens: {
      '--c-bg': '#F4F1EC', '--c-surface': '#FFFFFF', '--c-sunken': '#EAE6DE',
      '--c-text': '#14140F', '--c-muted': '#6E6A61', '--c-border': '#DCD6CB',
      '--c-primary': '#14140F', '--c-on-primary': '#F4F1EC', '--c-accent': '#C2452D', '--c-success': '#3F6B4E',
    },
  },
  midnight: {
    label: 'Midnight',
    tokens: {
      '--c-bg': '#101215', '--c-surface': '#171A1E', '--c-sunken': '#1D2126',
      '--c-text': '#F2F1EE', '--c-muted': '#9A9C9F', '--c-border': '#2B3036',
      '--c-primary': '#F2F1EE', '--c-on-primary': '#101215', '--c-accent': '#D8A24A', '--c-success': '#6FB08A',
    },
  },
  clay: {
    label: 'Bone & Clay',
    tokens: {
      '--c-bg': '#FBF8F4', '--c-surface': '#FFFFFF', '--c-sunken': '#F0E7DE',
      '--c-text': '#2B2320', '--c-muted': '#7C6E66', '--c-border': '#E3D8CD',
      '--c-primary': '#2B2320', '--c-on-primary': '#FBF8F4', '--c-accent': '#A2604A', '--c-success': '#5C7A63',
    },
  },
  slate: {
    label: 'Slate & Citrus',
    tokens: {
      '--c-bg': '#F5F6F5', '--c-surface': '#FFFFFF', '--c-sunken': '#E7EAE9',
      '--c-text': '#191D1C', '--c-muted': '#69706E', '--c-border': '#D5DAD8',
      '--c-primary': '#191D1C', '--c-on-primary': '#F5F6F5', '--c-accent': '#B8CF3C', '--c-success': '#3F6B4E',
    },
  },
};

function applyPalette(key) {
  const palette = PALETTES[key];
  Object.entries(palette.tokens).forEach(([token, value]) =>
    document.documentElement.style.setProperty(token, value)
  );
  document.querySelectorAll('[data-palette]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.palette === key))
  );
}

function applyType(mode) {
  document.body.classList.toggle('type-modern', mode === 'modern');
  document.body.classList.toggle('type-editorial', mode === 'editorial');
  document.documentElement.style.setProperty(
    '--font-display',
    mode === 'modern'
      ? '"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif'
      : '"Fraunces", "Iowan Old Style", Georgia, serif'
  );
  document.querySelectorAll('[data-type]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.type === mode))
  );
}

function applyShape(mode) {
  document.documentElement.style.setProperty('--radius', mode === 'soft' ? '10px' : '2px');
  document.querySelectorAll('[data-shape]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.shape === mode))
  );
}

function applySurface(mode) {
  document.body.classList.toggle('surface-raised', mode === 'raised');
  document.querySelectorAll('[data-surface]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.surface === mode))
  );
}

function buildControls() {
  const panel = document.createElement('div');
  panel.className = 'controls';
  panel.innerHTML = `
    <div class="cluster" style="justify-content:space-between">
      <span class="label">Try the settings</span>
      <button type="button" class="icon-btn" data-controls-close aria-label="Hide controls">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div class="controls__group">
      <span class="label label--muted">Palette</span>
      <div class="controls__row">
        ${Object.entries(PALETTES)
          .map(
            ([key, p]) => `<button type="button" class="controls__swatch" data-palette="${key}" title="${p.label}" aria-label="${p.label}" aria-pressed="${key === 'ink'}">
              <span style="background:${p.tokens['--c-bg']}"></span><span style="background:${p.tokens['--c-accent']}"></span>
              <span style="background:${p.tokens['--c-sunken']}"></span><span style="background:${p.tokens['--c-text']}"></span>
            </button>`
          )
          .join('')}
      </div>
    </div>

    <div class="controls__group">
      <span class="label label--muted">Type personality</span>
      <div class="controls__seg">
        <button type="button" data-type="editorial" aria-pressed="true">Editorial</button>
        <button type="button" data-type="modern" aria-pressed="false">Modern</button>
      </div>
    </div>

    <div class="controls__group">
      <span class="label label--muted">Corners</span>
      <div class="controls__seg">
        <button type="button" data-shape="square" aria-pressed="true">Square</button>
        <button type="button" data-shape="soft" aria-pressed="false">Soft</button>
      </div>
    </div>

    <div class="controls__group">
      <span class="label label--muted">Surfaces</span>
      <div class="controls__seg">
        <button type="button" data-surface="hairline" aria-pressed="true">Hairline</button>
        <button type="button" data-surface="raised" aria-pressed="false">Raised</button>
      </div>
    </div>

    <p class="controls__note">Preview only. In the installed theme these are checkboxes and colour pickers in Shopify's theme editor.</p>`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'controls__toggle';
  toggle.textContent = 'Try the settings';

  document.body.append(panel, toggle);

  const open = () => { panel.classList.add('is-open'); toggle.classList.add('is-hidden'); };
  const close = () => { panel.classList.remove('is-open'); toggle.classList.remove('is-hidden'); };

  toggle.addEventListener('click', open);
  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-controls-close]')) return close();
    const palette = event.target.closest('[data-palette]');
    if (palette) return applyPalette(palette.dataset.palette);
    const type = event.target.closest('[data-type]');
    if (type) return applyType(type.dataset.type);
    const shape = event.target.closest('[data-shape]');
    if (shape) return applyShape(shape.dataset.shape);
    const surface = event.target.closest('[data-surface]');
    if (surface) return applySurface(surface.dataset.surface);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildControls();

  /* Fill the two pieces of demo chrome that need generated artwork. */
  const feature = document.querySelector('[data-feature-media]');
  if (feature) feature.innerHTML = artwork(9, 0);

  const searchFeatured = document.querySelector('[data-search-featured]');
  if (searchFeatured) {
    searchFeatured.innerHTML =
      '<span class="label label--muted">Popular right now</span>' +
      '<div class="ledger ledger--4 ledger--loose" style="margin-top:var(--s-4)">' +
      CATALOGUE.slice(0, 4).map((p, i) => productCard(p, i)).join('') +
      '</div>';
  }
});
