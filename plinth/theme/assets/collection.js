/* ==========================================================================
   PLINTH — collection.js
   Filtering, sorting and load-more for collection and search results.

   Filters are Shopify storefront filters: the theme only assembles the query
   string and asks Shopify to re-render the section. Filter definitions,
   counts and results all come from the platform.
   ========================================================================== */

(function () {
  'use strict';

  const Plinth = window.Plinth || {};
  const utils = Plinth.utils;

  class FacetFilters extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.sectionId = this.dataset.sectionId;

      if (this.form) {
        // Checkboxes apply immediately; typed price fields wait for a pause.
        const applyDebounced = utils.debounce(() => this.apply(), 450);

        this.form.addEventListener('change', (event) => {
          if (event.target.type === 'number') return;
          this.apply();
        });

        this.form.addEventListener('input', (event) => {
          if (event.target.type === 'number') applyDebounced();
        });
      }

      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-remove-filter]');
        if (remove) {
          event.preventDefault();
          this.navigate(remove.getAttribute('href'));
        }
      });

      document.addEventListener('change', (event) => {
        const sort = event.target.closest('[data-sort]');
        if (!sort) return;
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', sort.value);
        url.searchParams.delete('page');
        this.navigate(url.toString());
      });
    }

    apply() {
      const params = new URLSearchParams(new FormData(this.form));
      // Drop empty values so the URL stays shareable and clean.
      const clean = new URLSearchParams();
      params.forEach((value, key) => {
        if (value !== '') clean.append(key, value);
      });
      this.navigate(`${window.location.pathname}?${clean.toString()}`);
    }

    navigate(url) {
      if (!url) return;
      this.setBusy(true);

      fetch(`${url}${url.includes('?') ? '&' : '?'}section_id=${this.sectionId}`)
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');

          ['[data-collection-results]', '[data-facets]', '[data-active-filters]', '[data-result-count]'].forEach(
            (selector) => {
              const source = doc.querySelector(selector);
              const target = document.querySelector(selector);
              if (source && target) target.innerHTML = source.innerHTML;
            }
          );

          window.history.replaceState({}, '', url);
          Plinth.initReveal?.();
          document.querySelector('[data-collection-results]')?.scrollIntoView({ block: 'nearest' });
        })
        .catch(() => {
          window.location.href = url;
        })
        .finally(() => this.setBusy(false));
    }

    setBusy(busy) {
      const results = document.querySelector('[data-collection-results]');
      if (results) {
        results.setAttribute('aria-busy', String(busy));
        results.style.opacity = busy ? '0.45' : '';
      }
    }
  }

  customElements.define('facet-filters', FacetFilters);

  /* ------------------------------------------------------------------ */
  /* Load more — appends the next page without losing scroll position   */
  /* ------------------------------------------------------------------ */

  class LoadMore extends HTMLElement {
    connectedCallback() {
      this.button = this.querySelector('button');
      if (!this.button) return;

      this.button.addEventListener('click', () => this.load());
    }

    load() {
      const next = this.dataset.nextUrl;
      if (!next) return;

      this.button.classList.add('is-loading');

      fetch(`${next}${next.includes('?') ? '&' : '?'}section_id=${this.dataset.sectionId}`)
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const grid = document.querySelector('[data-product-grid]');
          const incoming = doc.querySelector('[data-product-grid]');
          const control = doc.querySelector('load-more');

          if (grid && incoming) {
            Array.from(incoming.children).forEach((child) => grid.appendChild(child));
          }

          if (control && control.dataset.nextUrl) {
            this.dataset.nextUrl = control.dataset.nextUrl;
            const count = control.querySelector('[data-load-count]');
            if (count) this.querySelector('[data-load-count]').textContent = count.textContent;
            const fill = control.querySelector('.load-more__fill');
            if (fill) this.querySelector('.load-more__fill')?.setAttribute('style', fill.getAttribute('style') || '');
          } else {
            this.remove();
          }

          window.history.replaceState({}, '', next);
          Plinth.initReveal?.();
        })
        .catch(() => {
          window.location.href = next;
        })
        .finally(() => this.button.classList.remove('is-loading'));
    }
  }

  customElements.define('load-more', LoadMore);
})();
