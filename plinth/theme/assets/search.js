/* ==========================================================================
   PLINTH — search.js
   Full-screen search overlay backed by Shopify's predictive search API.
   Recent searches are stored in the shopper's browser; everything else —
   products, collections, pages — comes from Shopify.
   ========================================================================== */

(function () {
  'use strict';

  const Plinth = window.Plinth || {};
  const utils = Plinth.utils;
  const RECENT_KEY = 'plinth:recent-searches';

  class SearchOverlay extends Plinth.DialogElement {
    connectedCallback() {
      super.connectedCallback();

      this.input = this.querySelector('[data-search-input]');
      this.results = this.querySelector('[data-search-results]');
      this.idle = this.querySelector('[data-search-idle]');
      this.sectionId = this.dataset.sectionId;
      this.abort = null;

      this.renderRecent();

      if (this.input) {
        this.input.addEventListener(
          'input',
          utils.debounce(() => this.search(this.input.value.trim()), 220)
        );

        this.input.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.results?.querySelector('a')?.focus();
          }
        });
      }

      this.querySelector('form')?.addEventListener('submit', () => {
        this.remember(this.input.value.trim());
      });

      this.addEventListener('click', (event) => {
        const term = event.target.closest('[data-search-term]');
        if (term) {
          event.preventDefault();
          this.input.value = term.dataset.searchTerm;
          this.input.focus();
          this.search(term.dataset.searchTerm);
          return;
        }

        if (event.target.closest('[data-clear-recent]')) {
          utils.storage.set(RECENT_KEY, []);
          this.renderRecent();
        }
      });

      this.addEventListener('dialog:open', () => {
        this.renderRecent();
        setTimeout(() => this.input?.focus(), 60);
      });
    }

    search(term) {
      if (term.length < 2) {
        this.showIdle(true);
        return;
      }

      this.showIdle(false);
      this.setBusy(true);

      // A new keystroke invalidates the request in flight.
      if (this.abort) this.abort.abort();
      this.abort = new AbortController();

      const params = new URLSearchParams({
        q: term,
        'resources[limit]': this.dataset.limit || 6,
        'resources[type]': this.dataset.types || 'product',
        section_id: this.sectionId,
      });

      fetch(`${Plinth.routes.predictive_search_url}?${params}`, { signal: this.abort.signal })
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const source = doc.querySelector('[data-search-results]');
          if (source) this.results.innerHTML = source.innerHTML;
        })
        .catch((error) => {
          if (error.name !== 'AbortError') this.results.innerHTML = '';
        })
        .finally(() => this.setBusy(false));
    }

    setBusy(busy) {
      this.results?.setAttribute('aria-busy', String(busy));
      this.classList.toggle('is-searching', busy);
    }

    showIdle(show) {
      if (this.idle) this.idle.hidden = !show;
      if (this.results) this.results.hidden = show;
    }

    remember(term) {
      if (!term) return;
      const items = utils.storage.get(RECENT_KEY, []).filter((item) => item !== term);
      items.unshift(term);
      utils.storage.set(RECENT_KEY, items.slice(0, 6));
    }

    renderRecent() {
      const list = this.querySelector('[data-recent-searches]');
      if (!list) return;

      const items = utils.storage.get(RECENT_KEY, []);
      const wrapper = list.closest('[data-recent-wrapper]') || list;
      wrapper.hidden = items.length === 0;

      list.innerHTML = items
        .map(
          (term) =>
            `<button type="button" class="chip" data-search-term="${term.replace(/"/g, '&quot;')}">${term}</button>`
        )
        .join('');
    }
  }

  customElements.define('search-overlay', SearchOverlay);
})();
