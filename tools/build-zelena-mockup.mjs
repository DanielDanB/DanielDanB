/**
 * Generates zelenavinice-mockup.html from ZelenaViniceSite.tsx.
 *
 * Two hand-written copies of one design drift apart within a week, so the
 * standalone page is rendered from the component itself: the same markup
 * through react-dom/server, the same stylesheet constant, the same defaults.
 * Only the behaviour is rewritten — React's drawer, dish modal and parallax
 * become a few dozen lines of plain JavaScript at the bottom of the file.
 *
 *   node tools/build-zelena-mockup.mjs
 *
 * Photographs are passed in, and a local file is embedded as a data URI so the
 * page stays one self-contained file:
 *
 *   ZV_HERO=photos/carbonara.jpg ZV_HERO_OVERLAY=0.55 node tools/build-zelena-mockup.mjs
 *   ZV_PHOTOS='{"about":"photos/room.jpg","gallery":["a.jpg","b.jpg"]}' …
 *
 * See framer-tests/README.md for the sandbox this runs in (esbuild plus a
 * stub `framer` package) and for the checks that follow.
 */
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import fs from "fs"
import path from "path"

const build = process.env.ZV_BUILD || "./run/zv-page.mjs"
const mod = await import(build)
const {
    default: Site,
    CSS,
    DEFAULTS,
    ROOT,
    Icon,
    SocialRow,
    ICON_PATHS,
    resolveColors,
    buildVars,
    list,
} = mod

const OUT = process.env.ZV_OUT || "zelenavinice-mockup.html"

/* ------------------------------------------------------------- photos -- */
const MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
    ".svg": "image/svg+xml",
}

/** A URL is left alone; a file on disk is inlined, so the page travels whole. */
function photo(value) {
    if (!value) return ""
    if (/^(https?:|data:)/.test(value)) return value
    const file = path.resolve(value)
    if (!fs.existsSync(file)) {
        console.warn(`  photo not found, slot left empty: ${value}`)
        return ""
    }
    const type = MIME[path.extname(file).toLowerCase()]
    if (!type) {
        console.warn(`  unknown image type, slot left empty: ${value}`)
        return ""
    }
    const bytes = fs.readFileSync(file)
    console.log(`  ${path.basename(file)}  ${(bytes.length / 1024).toFixed(0)} kB inlined`)
    return `data:${type};base64,${bytes.toString("base64")}`
}

const extra = process.env.ZV_PHOTOS ? JSON.parse(process.env.ZV_PHOTOS) : {}
const photos = {
    hero: photo(process.env.ZV_HERO || extra.hero),
    about: photo(extra.about),
    gallery: list(extra.gallery, []).map(photo).filter(Boolean),
    categories: list(extra.categories, []).map(photo),
}

/* A photograph usually wants a lighter veil than the empty gradient does. */
const heroOverlay = process.env.ZV_HERO_OVERLAY
    ? Number(process.env.ZV_HERO_OVERLAY)
    : null

const props = {
    hero: photos.hero
        ? {
              image: photos.hero,
              ...(heroOverlay !== null && !Number.isNaN(heroOverlay)
                  ? { overlay: heroOverlay }
                  : {}),
          }
        : undefined,
    about: photos.about ? { image: photos.about } : undefined,
    gallery: photos.gallery.length
        ? {
              items: list(DEFAULTS.gallery.items, []).map((item, i) => ({
                  ...item,
                  image: photos.gallery[i] || item.image,
              })),
          }
        : undefined,
    menu: photos.categories.length
        ? {
              categories: list(DEFAULTS.menu.categories, []).map((cat, i) => ({
                  ...cat,
                  photo: photos.categories[i] || cat.photo,
              })),
          }
        : undefined,
}

/* ---------------------------------------------------------------- page -- */
const page = renderToStaticMarkup(React.createElement(Site, props))

// The root carries the palette as inline custom properties; the portal layer
// (drawer, modal) sits outside it and needs the same ones.
const varsAttr = (page.match(/<div class="zv-root[^"]*" style="([^"]*)"/) || [])[1] || ""
const colors = resolveColors(DEFAULTS.colors)
const vars = buildVars(colors, DEFAULTS.type, DEFAULTS.hero)

/* -------------------------------------------------------------- drawer -- */
/* Rendered here rather than in the page, because the component mounts it only
   while it is open — a panel parked off-screen would widen the page. */
const drawerLinks = list(DEFAULTS.drawer.links, [])
const socialItems = list(DEFAULTS.social.items, [])
const drawer = renderToStaticMarkup(
    React.createElement(
        "nav",
        { className: "zv-drawer", id: "zv-drawer" },
        React.createElement(
            "div",
            { className: "zv-drawer-inner" },
            React.createElement(
                "button",
                {
                    type: "button",
                    className: "zv-drawer-close",
                    "data-zv-close": "drawer",
                    "aria-label": "Close menu",
                },
                "×"
            ),
            DEFAULTS.drawer.title
                ? React.createElement("h3", null, DEFAULTS.drawer.title)
                : null,
            React.createElement(
                "ul",
                { className: "zv-drawer-list" },
                drawerLinks.map((l, i) =>
                    React.createElement(
                        "li",
                        { key: i },
                        React.createElement(
                            "a",
                            { href: l.href || "#", "data-zv-link": "" },
                            React.createElement(Icon, { name: l.icon }),
                            React.createElement("span", null, l.label)
                        )
                    )
                )
            ),
            DEFAULTS.social.inDrawer !== false && socialItems.length
                ? React.createElement(
                      "div",
                      { className: "zv-drawer-social" },
                      DEFAULTS.social.title
                          ? React.createElement("h3", null, DEFAULTS.social.title)
                          : null,
                      React.createElement(SocialRow, {
                          items: socialItems,
                          style: DEFAULTS.social.style,
                      })
                  )
                : null
        )
    )
)

/* ---------------------------------------------------------------- data -- */
/* The dish modal is built in the browser from this, so the page carries one
   copy of the menu rather than one hidden modal per category. */
const data = {
    emptyLabel: DEFAULTS.menu.emptyLabel,
    categories: list(DEFAULTS.menu.categories, []).map((c) => ({
        name: c.name,
        icon: c.icon || "",
        dishes: list(c.dishes, []).map((d) => ({
            name: d.name,
            price: d.price,
            text: d.text,
            icon: d.icon || "",
            tint: d.tint || "",
        })),
    })),
    icons: ICON_PATHS,
    heroParallax: DEFAULTS.hero.parallax !== false,
}

const style = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ")

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<script>document.documentElement.className += " js";</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${DEFAULTS.header.logo} ${DEFAULTS.header.logoAccent} — ${DEFAULTS.hero.eyebrow}</title>
<meta name="description" content="${DEFAULTS.hero.text.replace(/\s+/g, " ").slice(0, 155)}">
<meta name="theme-color" content="${colors.background}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='${encodeURIComponent(colors.primary)}'/%3E%3Cpath d='M20 44c14-4 20-18 17-32-16 3-24 14-21 26l-6 10' stroke='%23ffffff' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<meta property="og:type" content="website">
<meta property="og:title" content="${DEFAULTS.header.logo} ${DEFAULTS.header.logoAccent}">
<meta property="og:description" content="${DEFAULTS.hero.title.replace(/\n/g, " ")}">
<!-- Replace both URLs below with your own domain once the site is live. -->
<meta property="og:url" content="https://example.com/">
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<!--
  EDITING THIS FILE
  · Text: change it straight in the markup below.
  · Photos: an empty slot draws a soft gradient. A picture is an <img> that
    carries the slot's own class — .zv-hero-media, .zv-about-media,
    .zv-cat-media img, .zv-gal-item img — so either paste one in, or rebuild
    with the photo embedded:
      ZV_HERO=photos/hero.jpg node tools/build-zelena-mockup.mjs
  · Colours, fonts and spacing: the custom properties on <div class="zv-root">
    at the top of <body> drive every rule in the stylesheet.
  This file is generated from ZelenaViniceSite.tsx by tools/build-zelena-mockup.mjs.
-->

<style>
@import url('${DEFAULTS.type.fontsUrl}');
html, body { margin: 0; padding: 0; background: ${colors.background}; }
/* Without scripting there is no drawer, and the header links are the menu. */
html:not(.js) .zv-burger { display: none; }
${CSS}
</style>
</head>
<body>
${page}

<div class="${ROOT} zv-portal" id="zv-portal" style="${style}"></div>
<template id="zv-drawer-template">${drawer}</template>
<script id="zv-data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>

<script>
(function () {
  "use strict";
  var root = document.querySelector(".${ROOT}:not(.zv-portal)");
  var portal = document.getElementById("zv-portal");
  var data = JSON.parse(document.getElementById("zv-data").textContent);
  if (!root || !portal) return;

  /* ---- breakpoints follow the page's own width, as in the component ---- */
  function applyWidth() {
    var w = root.offsetWidth;
    var cls = [];
    if (w <= 1024) cls.push("w-md");
    if (w <= 780) cls.push("w-sm");
    if (w <= 520) cls.push("w-xs");
    var next = cls.join(" ");
    root.className = "${ROOT} " + next;
    portal.className = "${ROOT} zv-portal" + (portal.classList.contains("zv-live") ? " zv-live" : "") + " " + next;
  }
  applyWidth();
  if (window.ResizeObserver) new ResizeObserver(applyWidth).observe(root);
  else window.addEventListener("resize", applyWidth);

  /* ---- in-page links, without relying on native anchors --------------- */
  var SECTIONS = ["top", "menu", "about", "gallery", "location", "reserve"];
  function goTo(key) {
    var el = root.querySelector('[data-zv-section="' + key + '"]');
    if (!el) return false;
    var header = root.querySelector(".zv-header.zv-sticky");
    var top = el.getBoundingClientRect().top + window.pageYOffset -
      (header ? header.getBoundingClientRect().height + 10 : 0);
    window.scrollTo({ top: key === "top" ? 0 : top, behavior: "smooth" });
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var hash = href.indexOf("#") === 0 ? href.slice(1) : "";
    if (!hash) return;
    var key = SECTIONS.indexOf(hash) > -1 ? hash : null;
    if (!key) return;
    e.preventDefault();
    closeDrawer();
    goTo(key);
  });

  /* ---- drawer: mounted only while open, so nothing widens the page ---- */
  var drawerTpl = document.getElementById("zv-drawer-template").innerHTML;
  var openEls = null;
  function closeDrawer() {
    if (!openEls) return;
    var els = openEls;
    openEls = null;
    els.forEach(function (el) { el.classList.remove("zv-in"); });
    setTimeout(function () {
      els.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
      if (!portal.children.length) portal.classList.remove("zv-live");
    }, 400);
  }
  function openDrawer() {
    if (openEls) return;
    var scrim = document.createElement("button");
    scrim.type = "button";
    scrim.className = "zv-scrim";
    scrim.setAttribute("aria-label", "Close menu");
    scrim.addEventListener("click", closeDrawer);
    var wrap = document.createElement("div");
    wrap.innerHTML = drawerTpl;
    var nav = wrap.firstElementChild;
    portal.classList.add("zv-live");
    portal.appendChild(scrim);
    portal.appendChild(nav);
    openEls = [scrim, nav];
    nav.querySelector("[data-zv-close]").addEventListener("click", closeDrawer);
    // Paint the closed state first, or the transition never runs.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrim.classList.add("zv-in");
        nav.classList.add("zv-in");
      });
    });
  }
  var burger = root.querySelector(".zv-burger");
  if (burger) burger.addEventListener("click", openDrawer);

  /* ---- dish modal, built from the menu data --------------------------- */
  function icon(name, cls) {
    var raw = (name || "").trim();
    if (!raw) return "";
    if (/^(https?:|data:|\\/|\\.\\/)/.test(raw) || /\\.(svg|png|jpe?g|gif|webp|avif)(\\?|#|$)/i.test(raw)) {
      return '<img class="zv-icon-img' + (cls ? " " + cls : "") + '" src="' + raw + '" alt="" aria-hidden="true">';
    }
    var d = data.icons[raw.replace(/^ph\\s+/, "").replace(/^ph-/, "")];
    if (!d) return '<span class="zv-icon-text' + (cls ? " " + cls : "") + '" aria-hidden="true">' + raw + "</span>";
    return '<svg class="zv-icon' + (cls ? " " + cls : "") + '" viewBox="0 0 1024 1024" ' +
      'fill="currentColor" focusable="false" aria-hidden="true">' +
      '<g transform="translate(0,960) scale(1,-1)"><path d="' + d + '"/></g></svg>';
  }
  var modalEls = null;
  function closeModal() {
    if (!modalEls) return;
    var els = modalEls;
    modalEls = null;
    els.forEach(function (el) { el.classList.remove("zv-in"); });
    setTimeout(function () {
      els.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
      if (!portal.children.length) portal.classList.remove("zv-live");
    }, 350);
  }
  function openModal(index) {
    if (modalEls) return;
    var cat = data.categories[index];
    if (!cat) return;
    var scrim = document.createElement("button");
    scrim.type = "button";
    scrim.className = "zv-modal-scrim";
    scrim.setAttribute("aria-label", "Close");
    scrim.addEventListener("click", closeModal);
    var modal = document.createElement("div");
    modal.className = "zv-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", cat.name);
    var items = cat.dishes.map(function (d) {
      return '<div class="zv-modal-item"' + (d.tint ? ' style="background:' + d.tint + '"' : "") + ">" +
        icon(d.icon, "zv-m-icon") +
        "<h4>" + d.name + "</h4>" +
        (d.text ? "<p>" + d.text + "</p>" : "") +
        (d.price ? '<div class="zv-m-price">' + d.price + "</div>" : "") +
        "</div>";
    }).join("");
    modal.innerHTML =
      '<div class="zv-modal-inner zv-glass">' +
      '<button type="button" class="zv-modal-close" data-zv-close="modal" aria-label="Close">×</button>' +
      '<div class="zv-modal-title">' + icon(cat.icon, "zv-modal-icon") + "<h2>" + cat.name + "</h2></div>" +
      (items ? '<div class="zv-modal-grid">' + items + "</div>"
             : '<p class="zv-modal-empty">' + data.emptyLabel + "</p>") +
      "</div>";
    portal.classList.add("zv-live");
    portal.appendChild(scrim);
    portal.appendChild(modal);
    modalEls = [scrim, modal];
    modal.querySelector("[data-zv-close]").addEventListener("click", closeModal);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrim.classList.add("zv-in");
        modal.classList.add("zv-in");
      });
    });
  }
  Array.prototype.forEach.call(root.querySelectorAll("[data-zv-cat]"), function (el) {
    el.addEventListener("click", function () { openModal(+el.getAttribute("data-zv-cat")); });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeDrawer();
    closeModal();
  });

  /* ---- hero parallax --------------------------------------------------- */
  var card = root.querySelector(".zv-hero-card");
  var media = card && card.querySelector(".zv-hero-media");
  if (media && data.heroParallax) {
    var update = function () {
      if (root.classList.contains("w-sm")) { media.style.transform = ""; return; }
      var rect = card.getBoundingClientRect();
      var offset = Math.max(-40, Math.min(-rect.top * 0.1, 40));
      media.style.transform = "scale(1.15) translateY(" + offset + "px)";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }
})();
</script>
</body>
</html>
`

fs.writeFileSync(path.resolve(OUT), html)
console.log(`${OUT}  ${(html.length / 1024).toFixed(0)} kB`)
