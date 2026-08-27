/* ==========================================================================
   PLINTH — product.js
   Variant selection, media gallery, sticky add-to-cart, quick add and
   quick view.

   Variant state is derived from Shopify's own product JSON, and every price
   or availability change is re-rendered by the Section Rendering API so
   currency formatting, discounts and inventory come from the platform.
   ========================================================================== */

(function () {
  'use strict';

  const Plinth = window.Plinth || {};

  /* ------------------------------------------------------------------ */
  /* Variant picker                                                     */
  /* ------------------------------------------------------------------ */

  class VariantPicker extends HTMLElement {
    connectedCallback() {
      const data = this.querySelector('[data-variants]');
      if (!data) return;

      this.variants = JSON.parse(data.textContent);
      this.sectionId = this.dataset.sectionId;
      this.productUrl = this.dataset.url;
      this.updateUrl = this.dataset.updateUrl !== 'false';

      this.addEventListener('change', this.onChange.bind(this));
      this.syncAvailability();
    }

    /** Selected option values, in Shopify's option order. */
    get selection() {
      return Array.from(this.querySelectorAll('[data-option-index]')).map((group) => {
        const checked = group.querySelector('input:checked');
        if (checked) return checked.value;
        const select = group.querySelector('select');
        return select ? select.value : null;
      });
    }

    get current() {
      const selection = this.selection;
      return this.variants.find((variant) =>
        variant.options.every((option, index) => option === selection[index])
      );
    }

    onChange() {
      const variant = this.current;
      this.syncAvailability();
      this.syncLabels();

      if (!variant) {
        this.setUnavailable();
        return;
      }

      this.setInput(variant.id);
      if (this.updateUrl) {
        window.history.replaceState({}, '', `${this.productUrl}?variant=${variant.id}`);
      }

      this.showMedia(variant.featured_media ? variant.featured_media.id : null);
      this.renderSection(variant.id);

      this.dispatchEvent(
        new CustomEvent('variant:change', { bubbles: true, detail: { variant } })
      );
    }

    setInput(id) {
      document.querySelectorAll(`[data-variant-input][data-section="${this.sectionId}"]`).forEach((input) => {
        input.value = id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    /** Echo the chosen value beside the option name ("Colour — Clay"). */
    syncLabels() {
      this.querySelectorAll('[data-option-index]').forEach((group) => {
        const output = group.querySelector('[data-option-value]');
        if (!output) return;
        const checked = group.querySelector('input:checked');
        output.textContent = checked ? checked.value : group.querySelector('select')?.value || '';
      });
    }

    /**
     * Disable combinations Shopify has no variant for, one option level at a
     * time. Sold-out sizes stay visible and struck through — hiding them
     * makes shoppers think the size was never made.
     */
    syncAvailability() {
      const groups = Array.from(this.querySelectorAll('[data-option-index]'));
      const selection = this.selection;

      groups.forEach((group, index) => {
        group.querySelectorAll('input').forEach((input) => {
          const candidate = selection.slice();
          candidate[index] = input.value;

          const match = this.variants.find((variant) =>
            variant.options.every((option, i) => (i === index || i < index ? option === candidate[i] : true))
          );

          const available = this.variants.some(
            (variant) =>
              variant.available &&
              variant.options.every((option, i) => (i === index ? option === input.value : option === candidate[i]))
          );

          input.disabled = !match;
          input.closest('.variant__option')?.classList.toggle('is-unavailable', !available);
        });
      });
    }

    setUnavailable() {
      const button = document.querySelector(`[data-add-to-cart][data-section="${this.sectionId}"]`);
      if (!button) return;
      button.setAttribute('aria-disabled', 'true');
      const label = button.querySelector('[data-add-to-cart-text]');
      if (label) label.textContent = Plinth.t('unavailable', 'Unavailable');
    }

    /** Scroll the gallery to the media Shopify associated with this variant. */
    showMedia(mediaId) {
      if (!mediaId) return;
      const gallery = document.querySelector(`media-gallery[data-section="${this.sectionId}"]`);
      if (gallery) gallery.select(String(mediaId));
    }

    /** Re-render price, SKU, inventory and buy buttons from Shopify. */
    renderSection(variantId) {
      const url = `${this.productUrl}?variant=${variantId}&section_id=${this.sectionId}`;

      fetch(url)
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          ['[data-variant-price]', '[data-variant-inventory]', '[data-variant-sku]', '[data-variant-buttons]'].forEach(
            (selector) => {
              const source = doc.querySelector(`${selector}[data-section="${this.sectionId}"]`);
              const target = document.querySelector(`${selector}[data-section="${this.sectionId}"]`);
              if (source && target) target.innerHTML = source.innerHTML;
            }
          );
        })
        .catch(() => {
          /* Leave the last good render in place rather than blanking it. */
        });
    }
  }

  customElements.define('variant-picker', VariantPicker);

  /* ------------------------------------------------------------------ */
  /* Media gallery                                                      */
  /* ------------------------------------------------------------------ */

  class MediaGallery extends HTMLElement {
    connectedCallback() {
      this.stage = this.querySelector('[data-gallery-stage]');
      this.frames = Array.from(this.querySelectorAll('[data-media-id]'));
      this.thumbs = Array.from(this.querySelectorAll('[data-thumb]'));
      this.dots = Array.from(this.querySelectorAll('[data-dot]'));

      this.thumbs.forEach((thumb) =>
        thumb.addEventListener('click', () => this.select(thumb.dataset.thumb))
      );

      if (this.dataset.zoom === 'true') this.initZoom();
      this.initLightbox();
      this.watchScroll();
    }

    select(mediaId) {
      const frame = this.frames.find((f) => f.dataset.mediaId === String(mediaId));
      if (!frame) return;

      this.setCurrent(mediaId);

      const mobile = window.matchMedia('(max-width: 749px)').matches;
      if (mobile) {
        this.stage.scrollTo({ left: frame.offsetLeft - this.stage.offsetLeft, behavior: 'smooth' });
      } else {
        const top = frame.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72) - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }

    setCurrent(mediaId) {
      this.thumbs.forEach((thumb) =>
        thumb.setAttribute('aria-current', String(thumb.dataset.thumb === String(mediaId)))
      );
      this.dots.forEach((dot) =>
        dot.setAttribute('aria-current', String(dot.dataset.dot === String(mediaId)))
      );
    }

    /** On phones the stage is a snap carousel; keep the dots in step. */
    watchScroll() {
      if (!this.stage || !this.dots.length) return;

      this.stage.addEventListener(
        'scroll',
        Plinth.utils.onFrame(() => {
          const center = this.stage.scrollLeft + this.stage.clientWidth / 2;
          let closest = this.frames[0];
          let distance = Infinity;

          this.frames.forEach((frame) => {
            const frameCenter = frame.offsetLeft + frame.clientWidth / 2;
            const delta = Math.abs(frameCenter - center);
            if (delta < distance) {
              distance = delta;
              closest = frame;
            }
          });

          if (closest) this.setCurrent(closest.dataset.mediaId);
        }),
        { passive: true }
      );
    }

    /** Click to zoom, pointer position sets the transform origin. */
    initZoom() {
      this.querySelectorAll('[data-zoomable]').forEach((frame) => {
        frame.addEventListener('click', () => {
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

    initLightbox() {
      const lightbox = this.querySelector('[data-lightbox]');
      if (!lightbox) return;

      this.querySelectorAll('[data-lightbox-open]').forEach((button) =>
        button.addEventListener('click', () => lightbox.open(button))
      );
    }
  }

  customElements.define('media-gallery', MediaGallery);

  /* ------------------------------------------------------------------ */
  /* Sticky add-to-cart bar                                             */
  /* ------------------------------------------------------------------ */

  class StickyAtc extends HTMLElement {
    connectedCallback() {
      const anchor = document.querySelector(this.dataset.watch || '[data-buy-box]');
      if (!anchor || !('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Show only once the real buy box has scrolled past, never before.
          const past = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
          this.classList.toggle('is-visible', past);
        },
        { threshold: 0 }
      );

      observer.observe(anchor);

      document.addEventListener('variant:change', (event) => {
        const price = this.querySelector('[data-sticky-price]');
        if (price && event.detail?.variant) {
          price.textContent = Plinth.utils.money(event.detail.variant.price);
        }
      });
    }
  }

  customElements.define('sticky-atc', StickyAtc);

  /* ------------------------------------------------------------------ */
  /* Quick add / quick view                                             */
  /* ------------------------------------------------------------------ */

  class QuickAdd extends HTMLElement {
    connectedCallback() {
      this.button = this.querySelector('button');
      if (!this.button) return;

      this.button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Single-variant products skip the modal entirely — one tap, done.
        if (this.dataset.variantId) {
          this.addDirect();
        } else {
          this.openQuickView();
        }
      });
    }

    addDirect() {
      const formData = new FormData();
      formData.append('id', this.dataset.variantId);
      formData.append('quantity', 1);

      this.button.classList.add('is-loading');

      Plinth.cart
        .add(formData)
        .then((data) => {
          document.dispatchEvent(new CustomEvent('cart:added', { detail: data }));
          Plinth.toast(Plinth.t('added', 'Added to cart'));
        })
        .catch((error) => Plinth.toast(error.message || Plinth.t('error', 'Something went wrong.'), { error: true }))
        .finally(() => this.button.classList.remove('is-loading'));
    }

    openQuickView() {
      const modal = document.getElementById('quick-view');
      if (!modal) {
        window.location.href = this.dataset.url;
        return;
      }

      const body = modal.querySelector('[data-quick-view-body]');
      body.innerHTML = modal.querySelector('template[data-skeleton]')?.innerHTML || '';
      modal.open(this.button);

      fetch(`${this.dataset.url}?section_id=quick-view`)
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const content = doc.querySelector('[data-quick-view-content]');
          if (content) body.innerHTML = content.outerHTML;
        })
        .catch(() => {
          window.location.href = this.dataset.url;
        });
    }
  }

  customElements.define('quick-add', QuickAdd);

  /* ------------------------------------------------------------------ */
  /* Share                                                              */
  /* ------------------------------------------------------------------ */

  class ShareButton extends HTMLElement {
    connectedCallback() {
      const button = this.querySelector('button');
      if (!button) return;

      button.addEventListener('click', async () => {
        const url = this.dataset.url || window.location.href;

        if (navigator.share) {
          try {
            await navigator.share({ title: document.title, url });
            return;
          } catch (e) {
            if (e.name === 'AbortError') return;
          }
        }

        try {
          await navigator.clipboard.writeText(url);
          Plinth.toast(Plinth.t('copied', 'Link copied'));
        } catch (e) {
          Plinth.toast(url);
        }
      });
    }
  }

  customElements.define('share-button', ShareButton);
})();
