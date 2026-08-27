/* ==========================================================================
   PLINTH — theme.js
   Core behaviour. Everything is a native custom element so markup stays
   declarative and Liquid stays readable. No framework, no dependencies.

   Global config (money format, routes, strings) is written by theme.liquid
   into window.Plinth before this file runs.
   ========================================================================== */

(function () {
  'use strict';

  const Plinth = (window.Plinth = window.Plinth || {});
  const root = document.documentElement;

  root.classList.add('js');
  root.classList.remove('no-js');

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */

  const utils = (Plinth.utils = {
    /** Debounce, used by search-as-you-type and resize handlers. */
    debounce(fn, wait = 250) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    /** rAF throttle for scroll handlers. */
    onFrame(fn) {
      let ticking = false;
      return function (...args) {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      };
    },

    /**
     * Format cents using the shop's money format string.
     * Mirrors Shopify's own {{ price | money }} output closely enough for
     * client-side updates; server-rendered prices remain the source of truth.
     */
    money(cents, format) {
      const fmt = format || Plinth.moneyFormat || '${{amount}}';
      const value = Number(cents || 0) / 100;

      const withDelimiters = (num, precision, thousands, decimal) => {
        const parts = num.toFixed(precision).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
        return parts.join(decimal);
      };

      return fmt.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => {
        switch (name) {
          case 'amount':
            return withDelimiters(value, 2, ',', '.');
          case 'amount_no_decimals':
            return withDelimiters(value, 0, ',', '.');
          case 'amount_with_comma_separator':
            return withDelimiters(value, 2, '.', ',');
          case 'amount_no_decimals_with_comma_separator':
            return withDelimiters(value, 0, '.', ',');
          case 'amount_with_apostrophe_separator':
            return withDelimiters(value, 2, "'", '.');
          default:
            return withDelimiters(value, 2, ',', '.');
        }
      });
    },

    /** Elements that can hold focus inside a dialog. */
    focusables(scope) {
      return Array.from(
        scope.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    },

    /** Locks page scroll without the layout shifting as the bar disappears. */
    lockScroll(lock) {
      const body = document.body;
      if (lock) {
        const width = window.innerWidth - root.clientWidth;
        body.style.setProperty('--scrollbar-width', width + 'px');
        body.style.paddingRight = width ? width + 'px' : '';
        body.classList.add('is-locked');
      } else {
        body.classList.remove('is-locked');
        body.style.paddingRight = '';
      }
    },

    /** Replace an element's content with the same node from fetched HTML. */
    replaceFrom(html, selector, target) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const source = doc.querySelector(selector);
      const dest = target || document.querySelector(selector);
      if (!source || !dest) return null;
      dest.innerHTML = source.innerHTML;
      return dest;
    },

    storage: {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          /* Private browsing, quota — silently degrade. */
        }
      },
    },
  });

  Plinth.t = (key, fallback) => (Plinth.strings && Plinth.strings[key]) || fallback || key;

  /* ------------------------------------------------------------------ */
  /* Toast notifications                                                */
  /* ------------------------------------------------------------------ */

  Plinth.toast = function (message, options = {}) {
    let region = document.querySelector('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }

    const el = document.createElement('div');
    el.className = 'toast' + (options.error ? ' toast--error' : '');

    const body = document.createElement('span');
    body.className = 'toast__body';
    body.textContent = message;
    el.appendChild(body);

    if (options.actionLabel && options.onAction) {
      const action = document.createElement('button');
      action.className = 'toast__action';
      action.type = 'button';
      action.textContent = options.actionLabel;
      action.addEventListener('click', () => {
        options.onAction();
        dismiss();
      });
      el.appendChild(action);
    }

    region.appendChild(el);

    const dismiss = () => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };

    setTimeout(dismiss, options.duration || 4200);
    return el;
  };

  /* ------------------------------------------------------------------ */
  /* Dialog base — shared by drawers, modals, the search overlay        */
  /* ------------------------------------------------------------------ */

  /** Every open dialog registers here so the scroll lock is released once,
      and only once, after the last one closes. */
  const openDialogs = (Plinth.openDialogs = new Set());

  class DialogElement extends HTMLElement {
    connectedCallback() {
      this.panel = this.querySelector('[data-dialog-panel]') || this;
      this.overlay = this.querySelector('[data-dialog-overlay]');
      this.opener = null;

      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-dialog-close]')) {
          event.preventDefault();
          this.close();
        }
      });

      if (this.overlay) this.overlay.addEventListener('click', () => this.close());

      this.onKeydown = this.onKeydown.bind(this);

      // Any control anywhere can open this dialog by id.
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest(`[data-dialog-open="${this.id}"]`);
        if (!trigger) return;
        event.preventDefault();
        this.open(trigger);
      });
    }

    get isOpen() {
      return this.hasAttribute('open');
    }

    open(opener) {
      if (this.isOpen) return;
      this.opener = opener || document.activeElement;
      this.setAttribute('open', '');
      openDialogs.add(this);
      this.panel.classList.add('is-open');
      if (this.overlay) this.overlay.classList.add('is-open');
      utils.lockScroll(true);
      document.addEventListener('keydown', this.onKeydown);

      // Wait for the transition to start before moving focus, so screen
      // readers announce the panel rather than the page behind it.
      requestAnimationFrame(() => {
        const target = this.querySelector('[data-dialog-focus]') || utils.focusables(this)[0];
        if (target) target.focus();
      });

      this.dispatchEvent(new CustomEvent('dialog:open', { bubbles: true }));
    }

    close() {
      if (!this.isOpen) return;
      this.removeAttribute('open');
      openDialogs.delete(this);
      this.panel.classList.remove('is-open');
      if (this.overlay) this.overlay.classList.remove('is-open');
      document.removeEventListener('keydown', this.onKeydown);

      // Only release the scroll lock once the last dialog has closed.
      if (openDialogs.size === 0) utils.lockScroll(false);

      if (this.opener && document.contains(this.opener)) this.opener.focus();
      this.dispatchEvent(new CustomEvent('dialog:close', { bubbles: true }));
    }

    toggle(opener) {
      this.isOpen ? this.close() : this.open(opener);
    }

    onKeydown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.close();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = utils.focusables(this);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  Plinth.DialogElement = DialogElement;
  customElements.define('x-drawer', class extends DialogElement {});
  customElements.define('x-modal', class extends DialogElement {});

  /* ------------------------------------------------------------------ */
  /* Header — sticky, hide on scroll down, reveal on scroll up          */
  /* ------------------------------------------------------------------ */

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.lastY = window.scrollY;
      this.threshold = 140;
      this.setHeightVar();

      this.onScroll = utils.onFrame(this.handleScroll.bind(this));
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', utils.debounce(() => this.setHeightVar(), 150));

      this.initMenus();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
    }

    setHeightVar() {
      const header = this.querySelector('.header');
      if (header) root.style.setProperty('--header-height', header.offsetHeight + 'px');
    }

    handleScroll() {
      const y = window.scrollY;
      this.classList.toggle('is-stuck', y > 8);

      // Never hide the header while a menu or dialog is open.
      const busy = this.classList.contains('is-open') || document.body.classList.contains('is-locked');
      const hide = !busy && y > this.threshold && y > this.lastY;
      this.classList.toggle('is-hidden', hide);
      this.lastY = y;
    }

    /** Mega menus and dropdowns: hover on pointer devices, click always. */
    initMenus() {
      const items = this.querySelectorAll('[data-menu]');
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      items.forEach((item) => {
        const trigger = item.querySelector('[data-menu-trigger]');
        const panel = item.querySelector('[data-menu-panel]');
        if (!trigger || !panel) return;

        const open = () => {
          this.closeMenus(item);
          trigger.setAttribute('aria-expanded', 'true');
          panel.classList.add('is-open');
          this.classList.add('is-open');
        };

        const close = () => {
          trigger.setAttribute('aria-expanded', 'false');
          panel.classList.remove('is-open');
          if (!this.querySelector('[aria-expanded="true"][data-menu-trigger]')) {
            this.classList.remove('is-open');
          }
        };

        item._closeMenu = close;

        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
        });

        if (canHover) {
          item.addEventListener('pointerenter', open);
          item.addEventListener('pointerleave', close);
        }

        item.addEventListener('focusout', (event) => {
          if (!item.contains(event.relatedTarget)) close();
        });
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.closeMenus();
      });
    }

    closeMenus(except) {
      this.querySelectorAll('[data-menu]').forEach((item) => {
        if (item !== except && item._closeMenu) item._closeMenu();
      });
    }
  }

  customElements.define('site-header', SiteHeader);

  /* ------------------------------------------------------------------ */
  /* Announcement bar                                                   */
  /* ------------------------------------------------------------------ */

  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('.announcement__slide'));
      if (this.slides.length < 2) return;

      this.index = 0;
      this.interval = Number(this.dataset.interval || 5000);

      this.querySelectorAll('[data-announcement-prev]').forEach((b) =>
        b.addEventListener('click', () => this.go(this.index - 1))
      );
      this.querySelectorAll('[data-announcement-next]').forEach((b) =>
        b.addEventListener('click', () => this.go(this.index + 1))
      );

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.play();

      this.addEventListener('pointerenter', () => this.pause());
      this.addEventListener('pointerleave', () => this.play());
      this.addEventListener('focusin', () => this.pause());
    }

    play() {
      this.pause();
      this.timer = setInterval(() => this.go(this.index + 1), this.interval);
    }

    pause() {
      clearInterval(this.timer);
    }

    go(next) {
      const total = this.slides.length;
      this.index = (next + total) % total;
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === this.index);
        slide.setAttribute('aria-hidden', i === this.index ? 'false' : 'true');
      });
    }
  }

  customElements.define('announcement-bar', AnnouncementBar);

  /* ------------------------------------------------------------------ */
  /* Mobile navigation                                                  */
  /* ------------------------------------------------------------------ */

  class MobileNav extends DialogElement {
    connectedCallback() {
      super.connectedCallback();

      this.querySelectorAll('.mobile-nav__toggle').forEach((toggle) => {
        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
        });
      });
    }
  }

  customElements.define('mobile-nav', MobileNav);

  /* ------------------------------------------------------------------ */
  /* Quantity stepper                                                   */
  /* ------------------------------------------------------------------ */

  class QuantityInput extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      if (!this.input) return;

      this.querySelectorAll('[data-qty-step]').forEach((button) => {
        button.addEventListener('click', () => {
          const step = Number(button.dataset.qtyStep);
          this.input.value = Math.max(this.min, Number(this.input.value || 1) + step);
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
          this.syncDisabled();
        });
      });

      this.input.addEventListener('change', () => {
        if (Number(this.input.value) < this.min) this.input.value = this.min;
        this.syncDisabled();
      });

      this.syncDisabled();
    }

    get min() {
      return Number(this.input.min || 1);
    }

    syncDisabled() {
      const minus = this.querySelector('[data-qty-step="-1"]');
      if (minus) minus.disabled = Number(this.input.value) <= this.min;
    }
  }

  customElements.define('quantity-input', QuantityInput);

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                      */
  /* ------------------------------------------------------------------ */

  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-media');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Hero parallax — 6% drift, transform only                           */
  /* ------------------------------------------------------------------ */

  function initParallax() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = utils.onFrame(() => {
      layers.forEach((layer) => {
        const rect = layer.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const strength = Number(layer.dataset.parallax || 6);
        layer.style.transform = `translate3d(0, ${(progress * strength).toFixed(2)}%, 0) scale(1.08)`;
      });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Wishlist — browser-local, no app required                          */
  /* ------------------------------------------------------------------ */

  const WISHLIST_KEY = 'plinth:wishlist';

  const wishlist = (Plinth.wishlist = {
    all() {
      return utils.storage.get(WISHLIST_KEY, []);
    },
    has(handle) {
      return this.all().includes(handle);
    },
    toggle(handle) {
      const items = this.all();
      const index = items.indexOf(handle);
      index === -1 ? items.push(handle) : items.splice(index, 1);
      utils.storage.set(WISHLIST_KEY, items);
      document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { items } }));
      return index === -1;
    },
  });

  class WishlistButton extends HTMLElement {
    connectedCallback() {
      this.button = this.querySelector('button') || this;
      this.handle = this.dataset.handle;
      this.sync();

      this.button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = wishlist.toggle(this.handle);
        this.sync();
        Plinth.toast(
          added ? Plinth.t('wishlistAdded', 'Saved to wishlist') : Plinth.t('wishlistRemoved', 'Removed from wishlist')
        );
      });

      document.addEventListener('wishlist:change', () => this.sync());
    }

    sync() {
      const active = wishlist.has(this.handle);
      this.button.classList.toggle('is-active', active);
      this.button.setAttribute('aria-pressed', String(active));
    }
  }

  customElements.define('wishlist-button', WishlistButton);

  function syncWishlistCount() {
    const count = wishlist.all().length;
    document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  document.addEventListener('wishlist:change', syncWishlistCount);

  /* ------------------------------------------------------------------ */
  /* Recently viewed — records here, rendered by Shopify's search API   */
  /* ------------------------------------------------------------------ */

  const RECENT_KEY = 'plinth:recently-viewed';

  Plinth.recordView = function (id) {
    if (!id) return;
    let items = utils.storage.get(RECENT_KEY, []).filter((item) => item !== id);
    items.unshift(id);
    utils.storage.set(RECENT_KEY, items.slice(0, 12));
  };

  class RecentlyViewed extends HTMLElement {
    connectedCallback() {
      const exclude = this.dataset.excludeId;
      const limit = Number(this.dataset.limit || 4);
      const ids = utils.storage
        .get(RECENT_KEY, [])
        .filter((id) => String(id) !== String(exclude))
        .slice(0, limit);

      if (!ids.length) return;

      // Shopify's search endpoint renders real product cards from real data.
      const query = ids.map((id) => `id:${id}`).join(' OR ');
      const url = `${Plinth.routes.search_url}?q=${encodeURIComponent(query)}&type=product&section_id=${this.dataset.sectionId}`;

      fetch(url)
        .then((response) => (response.ok ? response.text() : Promise.reject(response)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const results = doc.querySelector('[data-recently-viewed-results]');
          if (!results || !results.children.length) return;
          this.querySelector('[data-recently-viewed-results]').innerHTML = results.innerHTML;
          this.hidden = false;
          initReveal();
        })
        .catch(() => {
          /* Recently viewed is a nicety; never let it break the page. */
        });
    }
  }

  customElements.define('recently-viewed', RecentlyViewed);

  /* ------------------------------------------------------------------ */
  /* Tabs                                                               */
  /* ------------------------------------------------------------------ */

  class TabGroup extends HTMLElement {
    connectedCallback() {
      this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
      this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));

      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(index));
        tab.addEventListener('keydown', (event) => {
          const map = { ArrowRight: 1, ArrowLeft: -1 };
          if (!(event.key in map)) return;
          event.preventDefault();
          const next = (index + map[event.key] + this.tabs.length) % this.tabs.length;
          this.select(next);
          this.tabs[next].focus();
        });
      });
    }

    select(index) {
      this.tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      this.panels.forEach((panel, i) => {
        panel.hidden = i !== index;
      });
    }
  }

  customElements.define('tab-group', TabGroup);

  /* ------------------------------------------------------------------ */
  /* Marquee — duplicates its own content so the loop is seamless       */
  /* ------------------------------------------------------------------ */

  class MarqueeRow extends HTMLElement {
    connectedCallback() {
      const track = this.querySelector('.marquee__track');
      const group = this.querySelector('.marquee__group');
      if (!track || !group || track.children.length > 1) return;
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  }

  customElements.define('marquee-row', MarqueeRow);

  /* ------------------------------------------------------------------ */
  /* Newsletter popup — once per visitor, dismissible, never on mobile  */
  /* first load                                                          */
  /* ------------------------------------------------------------------ */

  class NewsletterPopup extends DialogElement {
    connectedCallback() {
      super.connectedCallback();
      const key = 'plinth:popup-seen';
      if (utils.storage.get(key, false) || window.Shopify?.designMode) return;

      const delay = Number(this.dataset.delay || 6) * 1000;
      this.timer = setTimeout(() => {
        this.open();
        utils.storage.set(key, true);
      }, delay);

      this.addEventListener('dialog:close', () => utils.storage.set(key, true));
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
    }
  }

  customElements.define('newsletter-popup', NewsletterPopup);

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */

  function boot() {
    initReveal();
    initParallax();
    syncWishlistCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // The theme editor re-renders sections without a page load.
  document.addEventListener('shopify:section:load', boot);
  Plinth.initReveal = initReveal;
})();
