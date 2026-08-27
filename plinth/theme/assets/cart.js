/* ==========================================================================
   PLINTH — cart.js
   Cart drawer, add-to-cart forms, line item editing.

   Every mutation goes through Shopify's /cart/*.js endpoints and asks the
   Section Rendering API to re-render the drawer, the header count and the
   cart page from Shopify's own state. Nothing about the cart is calculated
   in the browser — totals, discounts and availability stay authoritative.
   ========================================================================== */

(function () {
  'use strict';

  const Plinth = window.Plinth || {};
  const utils = Plinth.utils;
  const routes = Plinth.routes || {};

  /** Sections the theme asks Shopify to re-render after a cart mutation. */
  function sectionsToRender() {
    return Array.from(document.querySelectorAll('[data-cart-section]'))
      .map((el) => el.dataset.cartSection)
      .filter(Boolean);
  }

  function applySections(sections) {
    if (!sections) return;
    document.querySelectorAll('[data-cart-section]').forEach((el) => {
      const html = sections[el.dataset.cartSection];
      if (!html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const source = doc.querySelector(`[data-cart-section="${el.dataset.cartSection}"]`);
      if (source) el.innerHTML = source.innerHTML;
    });

    // The header bubble is hidden at zero; unhide it as soon as it has a count.
    document.querySelectorAll('.header__count[data-cart-section]').forEach((el) => {
      el.hidden = Number(el.textContent.trim()) === 0;
    });
  }

  function bumpCount() {
    document.querySelectorAll('.header__count').forEach((el) => {
      el.classList.remove('is-bumped');
      void el.offsetWidth; // restart the animation
      el.classList.add('is-bumped');
    });
  }

  const cart = (Plinth.cart = {
    /** POST /cart/add.js */
    add(formData) {
      formData.append('sections', sectionsToRender().join(','));
      formData.append('sections_url', window.location.pathname);

      return fetch(`${routes.cart_add_url}`, {
        method: 'POST',
        headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status) throw new Error(data.description || data.message);
          applySections(data.sections);
          bumpCount();
          document.dispatchEvent(new CustomEvent('cart:update', { detail: data }));
          return data;
        });
    },

    /** POST /cart/change.js — line is 1-based, as Shopify expects. */
    change(line, quantity) {
      return fetch(`${routes.cart_change_url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          line,
          quantity,
          sections: sectionsToRender(),
          sections_url: window.location.pathname,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          applySections(data.sections);
          document.dispatchEvent(new CustomEvent('cart:update', { detail: data }));
          return data;
        });
    },

    get() {
      return fetch(`${routes.cart_url}.js`).then((response) => response.json());
    },
  });

  /* ------------------------------------------------------------------ */
  /* Cart drawer                                                        */
  /* ------------------------------------------------------------------ */

  class CartDrawer extends Plinth.DialogElement {
    connectedCallback() {
      super.connectedCallback();

      // Opened automatically whenever a line is added, unless the merchant
      // chose the cart page instead.
      document.addEventListener('cart:added', () => {
        if (this.dataset.autoOpen !== 'false') this.open();
      });
    }
  }

  customElements.define('cart-drawer', CartDrawer);

  /* ------------------------------------------------------------------ */
  /* Add to cart form                                                   */
  /* ------------------------------------------------------------------ */

  class ProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;

      this.button = this.querySelector('[data-add-to-cart]');
      this.errorTarget = this.querySelector('[data-form-error]');
      this.form.addEventListener('submit', this.onSubmit.bind(this));
    }

    onSubmit(event) {
      // Without a cart drawer the browser's own POST is the better fallback.
      const drawer = document.querySelector('cart-drawer');
      if (!drawer && this.dataset.redirect !== 'false') return;

      event.preventDefault();
      if (this.button?.getAttribute('aria-disabled') === 'true') return;

      this.setLoading(true);
      this.setError('');

      Plinth.cart
        .add(new FormData(this.form))
        .then((data) => {
          const item = data.items ? data.items[0] : data;
          document.dispatchEvent(new CustomEvent('cart:added', { detail: item }));

          if (this.dataset.toast !== 'false') {
            Plinth.toast(Plinth.t('added', 'Added to cart'));
          }
        })
        .catch((error) => {
          this.setError(error.message || Plinth.t('error', 'Something went wrong. Please try again.'));
        })
        .finally(() => this.setLoading(false));
    }

    setLoading(loading) {
      if (!this.button) return;
      this.button.classList.toggle('is-loading', loading);
      this.button.setAttribute('aria-busy', String(loading));
    }

    setError(message) {
      if (!this.errorTarget) {
        if (message) Plinth.toast(message, { error: true });
        return;
      }
      this.errorTarget.textContent = message;
      this.errorTarget.hidden = !message;
    }
  }

  customElements.define('product-form', ProductForm);

  /* ------------------------------------------------------------------ */
  /* Line items — quantity, remove                                      */
  /* ------------------------------------------------------------------ */

  class CartItems extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        const input = event.target.closest('[data-line-quantity]');
        if (!input) return;
        this.update(input.closest('[data-line]'), Number(input.value));
      });

      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-line-remove]');
        if (!remove) return;
        event.preventDefault();
        this.update(remove.closest('[data-line]'), 0);
      });
    }

    update(row, quantity) {
      if (!row) return;
      const line = Number(row.dataset.line);
      row.classList.add('is-updating');

      Plinth.cart
        .change(line, quantity)
        .then(() => {
          if (quantity === 0) Plinth.toast(Plinth.t('removed', 'Removed from cart'));
        })
        .catch(() => {
          row.classList.remove('is-updating');
          Plinth.toast(Plinth.t('error', 'Something went wrong. Please try again.'), { error: true });
        });
    }
  }

  customElements.define('cart-items', CartItems);

  /* ------------------------------------------------------------------ */
  /* Free shipping meter                                                */
  /* ------------------------------------------------------------------ */

  class ShippingMeter extends HTMLElement {
    connectedCallback() {
      this.render(Number(this.dataset.total || 0));
      document.addEventListener('cart:update', (event) => {
        const total = event.detail?.total_price ?? event.detail?.items_subtotal_price;
        if (typeof total === 'number') this.render(total);
      });
    }

    render(total) {
      const threshold = Number(this.dataset.threshold || 0);
      if (!threshold) return;

      const remaining = Math.max(0, threshold - total);
      const progress = Math.min(100, (total / threshold) * 100);
      const fill = this.querySelector('.ship-meter__fill');
      const text = this.querySelector('.ship-meter__text');

      if (fill) fill.style.setProperty('--progress', progress + '%');
      this.classList.toggle('is-complete', remaining === 0);

      if (!text) return;
      text.innerHTML = remaining
        ? (this.dataset.messageProgress || '').replace('[amount]', `<strong>${utils.money(remaining)}</strong>`)
        : this.dataset.messageComplete || '';
    }
  }

  customElements.define('shipping-meter', ShippingMeter);

  /* ------------------------------------------------------------------ */
  /* Cart note — saved as the shopper types, not on a button press      */
  /* ------------------------------------------------------------------ */

  class CartNote extends HTMLElement {
    connectedCallback() {
      const field = this.querySelector('textarea');
      if (!field) return;

      field.addEventListener(
        'input',
        utils.debounce(() => {
          fetch(`${routes.cart_update_url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: field.value }),
          });
        }, 600)
      );
    }
  }

  customElements.define('cart-note', CartNote);
})();
