import * as React from "react"
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { addPropertyControls, ControlType } from "framer"

/* ===========================================================================
   PLINTH — editorial storefront, as one Framer code component.

   The whole page is driven from the properties panel: palette, typography,
   layout, every section and every product. Nobody using this needs to open
   the code.

   The stylesheet is the Plinth theme's, reduced to the sections this page
   renders and rewritten as a function of the settings, then scoped under
   .plinth-root so it cannot reach the rest of the Framer project.
   =========================================================================== */

const COMPONENT_VERSION = "v1 · storefront"
const STYLE_ID = "plinth-shop-style"
const ROOT = "plinth-root"

const FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300..700&display=swap');"

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function parseColor(input) {
    if (typeof input !== "string") return null
    const value = input.trim()

    const hex = value.match(/^#([0-9a-f]{3,8})$/i)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4) {
            h = h
                .split("")
                .map((c) => c + c)
                .join("")
        }
        if (h.length !== 6 && h.length !== 8) return null
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
        }
    }

    const rgb = value.match(
        /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)$/i
    )
    if (rgb) {
        const alpha =
            rgb[4] === undefined
                ? 1
                : rgb[4].endsWith("%")
                  ? parseFloat(rgb[4]) / 100
                  : parseFloat(rgb[4])
        return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: alpha }
    }
    return null
}

/** Same colour at a different alpha; falls back for Framer design tokens. */
function withAlpha(color, alpha) {
    const c = parseColor(color)
    if (!c) {
        return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
    }
    const a = Math.max(0, Math.min(1, c.a * alpha))
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+a.toFixed(3)})`
}

/** Blend two colours; used for the derived tints the palette does not expose. */
function mix(a, b, amount) {
    const ca = parseColor(a)
    const cb = parseColor(b)
    if (!ca || !cb) {
        return `color-mix(in srgb, ${a} ${Math.round((1 - amount) * 100)}%, ${b})`
    }
    const t = Math.max(0, Math.min(1, amount))
    const ch = (x, y) => Math.round(x + (y - x) * t)
    return `rgb(${ch(ca.r, cb.r)}, ${ch(ca.g, cb.g)}, ${ch(ca.b, cb.b)})`
}

/** Relative luminance, so the theme can decide light-on-dark for itself. */
function luminance(color) {
    const c = parseColor(color)
    if (!c) return 1
    const f = (v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
}

const isDark = (color) => luminance(color) < 0.4

/* ------------------------------------------------------------------ */
/* Stylesheet scoping                                                  */
/* ------------------------------------------------------------------ */

function prefixSelector(selector, scope) {
    return selector
        .split(",")
        .map((part) => {
            const s = part.trim()
            if (!s || s.startsWith(scope)) return s
            return `${scope} ${s}`
        })
        .join(", ")
}

/**
 * Prefixes every selector with the root class. Comments are stripped first —
 * a comma inside one splits the selector list and silently kills the rule —
 * and @keyframes bodies are left alone, because `0%` is not a selector.
 */
function scopeCSS(input, scope) {
    const css = input.replace(/\/\*[\s\S]*?\*\//g, "")
    let out = ""
    let buffer = ""
    let depth = 0
    let inKeyframes = false
    let keyframeDepth = 0

    for (const ch of css) {
        if (ch === "{") {
            const selector = buffer.trim()
            buffer = ""
            if (selector.startsWith("@")) {
                if (/^@keyframes/i.test(selector)) {
                    inKeyframes = true
                    keyframeDepth = depth
                }
                out += selector + " {"
            } else {
                out +=
                    (inKeyframes
                        ? selector
                        : prefixSelector(selector, scope)) + " {"
            }
            depth++
        } else if (ch === "}") {
            depth--
            if (inKeyframes && depth === keyframeDepth) inKeyframes = false
            out += buffer + "}"
            buffer = ""
        } else {
            buffer += ch
        }
    }
    return out + buffer
}

/* ------------------------------------------------------------------ */
/* Palettes                                                            */
/* ------------------------------------------------------------------ */

/**
 * Each preset defines every colour the stylesheet reads, so switching preset
 * can never leave a half-repainted page.
 */
const PALETTES = {
    ink: {
        background: "#F4F1EC",
        surface: "#FFFFFF",
        sunken: "#EAE6DE",
        text: "#14140F",
        muted: "#6E6A61",
        border: "#DCD6CB",
        primary: "#14140F",
        onPrimary: "#F4F1EC",
        accent: "#C2452D",
        success: "#3F6B4E",
    },
    midnight: {
        background: "#101215",
        surface: "#171A1E",
        sunken: "#1D2126",
        text: "#F2F1EE",
        muted: "#9A9C9F",
        border: "#2B3036",
        primary: "#F2F1EE",
        onPrimary: "#101215",
        accent: "#D8A24A",
        success: "#6FB08A",
    },
    clay: {
        background: "#FBF8F4",
        surface: "#FFFFFF",
        sunken: "#F0E7DE",
        text: "#2B2320",
        muted: "#7C6E66",
        border: "#E3D8CD",
        primary: "#2B2320",
        onPrimary: "#FBF8F4",
        accent: "#A2604A",
        success: "#5C7A63",
    },
    slate: {
        background: "#F5F6F5",
        surface: "#FFFFFF",
        sunken: "#E7EAE9",
        text: "#191D1C",
        muted: "#69706E",
        border: "#D5DAD8",
        primary: "#191D1C",
        onPrimary: "#F5F6F5",
        accent: "#6F8F3F",
        success: "#3F6B4E",
    },
}

/** A preset wins over the individual pickers, so it is obvious what drives the page. */
function resolveColors(colors) {
    const preset = colors.preset || "ink"
    if (preset !== "custom" && PALETTES[preset]) {
        return { ...PALETTES[preset], preset }
    }
    return { ...PALETTES.ink, ...colors, preset }
}

/* ------------------------------------------------------------------ */
/* Stylesheet                                                          */
/* ------------------------------------------------------------------ */

const globalCSS = (c, t, l) => {
    const display =
        t.personality === "modern"
            ? `${t.uiFont}`
            : `${t.displayFont}`
    const displayWeight = t.personality === "modern" ? 600 : 400
    const radius = `${l.radius}px`
    const gap = l.spacing
    const darkGround = isDark(c.background)

    /* Tints the palette does not expose, derived so they always agree. */
    const borderStrong = mix(c.border, c.text, 0.45)
    const textSoft = mix(c.text, c.background, 0.28)
    const scrim = withAlpha(darkGround ? "#000000" : "#14140F", 0.55)
    const shadow = l.surfaceStyle === "raised"
        ? `0 1px 2px ${withAlpha(c.text, 0.05)}, 0 14px 34px -20px ${withAlpha(c.text, 0.28)}`
        : "none"

    return `
  .${ROOT}, .${ROOT} * { box-sizing: border-box; }
  .${ROOT} h1, .${ROOT} h2, .${ROOT} h3, .${ROOT} h4,
  .${ROOT} p, .${ROOT} figure, .${ROOT} blockquote, .${ROOT} ul, .${ROOT} ol { margin: 0; padding: 0; }
  .${ROOT} ul, .${ROOT} ol { list-style: none; }

  .${ROOT} {
    --bg: ${c.background};
    --surface: ${c.surface};
    --sunken: ${c.sunken};
    --text: ${c.text};
    --muted: ${c.muted};
    --border: ${c.border};
    --border-strong: ${borderStrong};
    --text-soft: ${textSoft};
    --primary: ${c.primary};
    --on-primary: ${c.onPrimary};
    --accent: ${c.accent};
    --success: ${c.success};
    --radius: ${radius};
    --shadow: ${shadow};
    --page: ${l.contentWidth}px;
    --gutter: clamp(20px, 4vw, 48px);
    --gap: ${gap}px;
    --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
    --font-ui: ${t.uiFont};
    --font-display: ${display};

    background: var(--bg);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: ${t.baseSize}px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    position: relative;
    width: 100%;
    height: auto;
    /* clip, not hidden: "hidden" would make overflow-y compute to auto, which
       clips the page and hides height changes from Framer's auto-height. */
    overflow-x: clip;
    overflow-y: visible;
    overflow-wrap: break-word;
  }

  .${ROOT} a { color: inherit; text-decoration: none; }
  .${ROOT} img, .${ROOT} video, .${ROOT} svg { display: block; max-width: 100%; }
  .${ROOT} button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  .${ROOT} :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .${ROOT} ::selection { background: var(--accent); color: var(--on-primary); }

  /* ---------- type ---------- */
  .h-display, h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-weight: ${displayWeight};
    line-height: 1.08;
    letter-spacing: ${t.tracking / 100}em;
    text-transform: ${t.headingCase};
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 40;
    text-wrap: balance;
  }
  h1 { font-size: calc(clamp(2.4rem, 3.4vw + 1.3rem, 4.2rem) * ${t.headingScale / 100}); }
  h2 { font-size: calc(clamp(1.9rem, 2.1vw + 1.2rem, 3rem) * ${t.headingScale / 100}); }
  h3 { font-size: calc(clamp(1.4rem, 1vw + 1.1rem, 1.9rem) * ${t.headingScale / 100}); }
  h4 { font-size: calc(clamp(1.15rem, 0.5vw + 1rem, 1.4rem) * ${t.headingScale / 100}); line-height: 1.3; }

  .label {
    font-family: var(--font-ui);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    line-height: 1.2;
    font-variation-settings: normal;
  }
  .label--muted { color: var(--muted); }
  .label--accent { color: var(--accent); }
  .lede { font-size: 1.0625rem; line-height: 1.5; color: var(--text-soft); max-width: 46ch; }
  .muted { color: var(--muted); }
  .tabular { font-variant-numeric: tabular-nums; }

  /* ---------- layout ---------- */
  .wrap { width: min(var(--page), 100% - var(--gutter) * 2); margin-inline: auto; }
  .section { padding-block: var(--gap); }
  .section--tight { padding-block: calc(var(--gap) * 0.7); }
  .section--sunken { background: var(--sunken); }
  .rule { height: 1px; background: var(--border); }

  /* The index rail: a numbered label over a hairline. */
  .head { display: grid; gap: 16px; margin-bottom: 40px; }
  .head__index {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 12px; border-bottom: 1px solid var(--border);
  }
  .head__num { color: var(--accent); font-variant-numeric: tabular-nums; }
  .head__spacer { flex: 1; }
  .head__row { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
  .head__title { max-width: 20ch; }
  .head__body { max-width: 44ch; color: var(--muted); font-size: 0.9375rem; }

  /* ---------- buttons ---------- */
  .btn {
    position: relative; display: inline-flex; align-items: center; justify-content: center;
    gap: 8px; min-height: 48px; padding: 12px 30px;
    border: 1px solid var(--primary); border-radius: ${l.buttonShape === "pill" ? "999px" : l.buttonShape === "soft" ? "8px" : radius};
    background: var(--primary); color: var(--on-primary);
    font-family: var(--font-ui); font-size: 0.8125rem; font-weight: 500;
    letter-spacing: ${l.buttonUppercase ? "0.14em" : "0.01em"};
    text-transform: ${l.buttonUppercase ? "uppercase" : "none"};
    text-align: center; overflow: hidden;
    transition: color 280ms var(--ease), border-color 280ms var(--ease), background-color 280ms var(--ease);
  }
  .btn > span { position: relative; z-index: 1; }
  .btn::before {
    content: ""; position: absolute; inset: 0; background: var(--accent);
    transform: scaleY(0); transform-origin: bottom;
    transition: transform 280ms cubic-bezier(0.65, 0, 0.35, 1); z-index: 0;
  }
  .btn:hover::before, .btn:focus-visible::before { transform: scaleY(1); }
  .btn--secondary { background: transparent; color: var(--text); border-color: var(--border-strong); }
  .btn--secondary::before { background: var(--primary); }
  .btn--secondary:hover { color: var(--on-primary); border-color: var(--primary); }
  .btn--accent { background: var(--accent); border-color: var(--accent); color: var(--on-primary); }
  .btn--accent::before { background: var(--primary); }
  .btn--sm { min-height: 40px; padding: 8px 18px; font-size: 0.6875rem; }
  .btn--full { width: 100%; }

  .link { position: relative; display: inline-block; padding-bottom: 2px; }
  .link::after {
    content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px;
    background: currentColor; transform-origin: right; transform: scaleX(1);
    transition: transform 280ms var(--ease);
  }
  .link:hover::after { transform-origin: left; animation: sweep 280ms var(--ease); }
  @keyframes sweep {
    0% { transform: scaleX(1); transform-origin: right; }
    49% { transform: scaleX(0); transform-origin: right; }
    50% { transform: scaleX(0); transform-origin: left; }
    100% { transform: scaleX(1); transform-origin: left; }
  }

  .icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: var(--radius); color: var(--text);
    transition: background-color 140ms var(--ease), color 140ms var(--ease);
  }
  .icon-btn:hover { background: var(--sunken); }

  /* ---------- announcement ---------- */
  .announce {
    background: var(--primary); color: var(--on-primary);
    font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .announce--accent { background: var(--accent); color: var(--on-primary); }
  .announce--sunken { background: var(--sunken); color: var(--text); border-bottom: 1px solid var(--border); }
  .announce__inner {
    display: flex; align-items: center; justify-content: center; gap: 16px;
    min-height: 40px; padding: 8px var(--gutter); text-align: center;
  }
  .announce a { text-decoration: underline; text-underline-offset: 0.25em; }

  /* ---------- header ---------- */
  .header {
    position: sticky; top: 0; z-index: 40;
    background: var(--bg); border-bottom: 1px solid var(--border);
  }
  .header__inner {
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px;
    min-height: 72px; width: min(var(--page), 100% - var(--gutter) * 2); margin-inline: auto;
  }
  .header__nav { justify-self: start; display: flex; align-items: center; gap: 24px; }
  .header__brand { justify-self: center; }
  .header__actions { justify-self: end; display: flex; align-items: center; gap: 4px; }
  .logo {
    display: block; font-family: var(--font-display); font-size: 1.25rem;
    letter-spacing: 0.24em; text-transform: uppercase; line-height: 1; white-space: nowrap;
    font-weight: ${displayWeight};
  }
  .logo img { width: ${l.logoWidth}px; height: auto; }
  .nav { display: flex; align-items: center; gap: 24px; }
  .nav__item { position: relative; }
  .nav__link {
    display: inline-flex; align-items: center; gap: 6px; height: 72px;
    font-size: 0.8125rem; letter-spacing: 0.04em; position: relative;
  }
  .nav__link::after {
    content: ""; position: absolute; left: 0; bottom: 24px; width: 100%; height: 1px;
    background: currentColor; transform: scaleX(0); transform-origin: left;
    transition: transform 280ms var(--ease);
  }
  .nav__item:hover .nav__link::after { transform: scaleX(1); }
  .nav__chev { width: 9px; opacity: 0.6; transition: transform 140ms var(--ease); }
  .nav__item:hover .nav__chev { transform: rotate(180deg); }

  .mega {
    position: absolute; left: 50%; top: 100%; transform: translate(-50%, -8px);
    min-width: min(620px, calc(100% - 32px)); max-width: calc(100vw - 32px);
    background: var(--bg); border: 1px solid var(--border);
    box-shadow: 0 24px 60px -28px ${withAlpha(c.text, 0.34)};
    opacity: 0; visibility: hidden; padding: 32px;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px;
    transition: opacity 240ms var(--ease), transform 240ms var(--ease), visibility 240ms;
  }
  .nav__item:hover .mega, .nav__item:focus-within .mega {
    opacity: 1; visibility: visible; transform: translate(-50%, 0);
  }
  .mega__title { padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid var(--border); display: block; }
  .mega__list { display: grid; gap: 8px; }
  .mega__list a { font-size: 0.9375rem; color: var(--text-soft); transition: color 140ms var(--ease), transform 140ms var(--ease); }
  .mega__list a:hover { color: var(--accent); transform: translateX(3px); }

  .count {
    position: absolute; top: 4px; right: 2px; min-width: 17px; height: 17px; padding: 0 4px;
    display: grid; place-items: center; background: var(--accent); color: var(--on-primary);
    border-radius: 999px; font-size: 10px; font-weight: 600; line-height: 1;
  }
  .header__action { position: relative; }
  .burger { display: none; }

  /* ---------- mobile drawer ---------- */
  .backdrop {
    position: fixed; inset: 0; z-index: 90; background: ${scrim};
    opacity: 0; transition: opacity 280ms var(--ease); border: 0;
  }
  .backdrop.active { opacity: 1; }
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 91;
    width: min(420px, 100vw); background: var(--bg); border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    transform: translateX(101%); transition: transform 400ms var(--ease);
  }
  .drawer.active { transform: translateX(0); }
  .drawer__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid var(--border);
  }
  .drawer__body { flex: 1; overflow-y: auto; padding-bottom: 32px; }
  .drawer__link {
    display: block; padding: 16px 24px; border-bottom: 1px solid var(--border);
    font-family: var(--font-display); font-size: 1.3rem; font-weight: ${displayWeight};
    letter-spacing: ${t.tracking / 100}em;
  }
  .drawer__sub { display: block; padding: 10px 24px; font-size: 0.9375rem; color: var(--text-soft); }
  .drawer__foot { padding: 24px; display: grid; gap: 12px; }

  /* ---------- hero ---------- */
  .hero { position: relative; display: grid; grid-template-columns: 0.85fr 1.15fr; min-height: clamp(520px, 74vh, 860px); }
  .hero--full { grid-template-columns: 1fr; }
  .hero__pane {
    position: relative; z-index: 2; display: flex; align-items: center;
    padding: 88px clamp(24px, 5vw, 96px);
  }
  .hero__content { display: grid; gap: 20px; max-width: 32ch; }
  .hero__body { color: var(--text-soft); max-width: 38ch; }
  .hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; width: max-content; max-width: min(100%, 540px); }
  .hero__media { position: relative; overflow: hidden; background: var(--sunken); }
  .hero__media img, .hero__media video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hero--full .hero__media { grid-area: 1 / 1; }
  .hero--full .hero__pane { grid-area: 1 / 1; align-items: flex-end; }
  .hero--full .hero__title, .hero--full .hero__body, .hero--full .label { color: #fff; }
  .hero--full .hero__media::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,20,15,0.66), rgba(20,20,15,0.08) 62%);
  }
  .hero__rail {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 4;
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding: 14px clamp(24px, 5vw, 96px);
    border-top: 1px solid ${withAlpha(c.text, 0.16)};
  }
  .hero--full .hero__rail { border-top-color: rgba(255,255,255,0.24); color: #fff; }

  /* ---------- marquee ---------- */
  .marquee { overflow: hidden; border-block: 1px solid var(--border); padding-block: 16px; }
  .marquee__track { display: flex; width: max-content; animation: marquee var(--speed, 42s) linear infinite; }
  .marquee:hover .marquee__track { animation-play-state: paused; }
  .marquee__group { display: flex; align-items: center; gap: 64px; padding-right: 64px; }
  .marquee__item { display: inline-flex; align-items: center; gap: 12px; white-space: nowrap; color: var(--text-soft); }
  @keyframes marquee { to { transform: translateX(-50%); } }

  /* ---------- the ledger grid ---------- */
  .ledger {
    display: grid; grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
    gap: 1px; background: var(--border); border-block: 1px solid var(--border);
  }
  /* Set as classes rather than an inline custom property: an inline value
     outranks the breakpoint rules below and would keep a phone at 4 columns. */
  .ledger--c2 { --cols: 2; }
  .ledger--c3 { --cols: 3; }
  .ledger--c4 { --cols: 4; }
  .ledger--c5 { --cols: 5; }
  .ledger > * { background: var(--bg); padding: 16px; }
  .ledger--loose { gap: 32px 20px; background: transparent; border: 0; }
  .ledger--loose > * { padding: 0; }

  .card { position: relative; display: flex; flex-direction: column; gap: 12px; }
  .card__media {
    position: relative; display: block; overflow: hidden; border-radius: var(--radius);
    background: var(--sunken); aspect-ratio: 4 / 5; box-shadow: var(--shadow);
  }
  .card__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 600ms var(--ease), transform 900ms var(--ease); }
  .card__media .alt { opacity: 0; }
  .card:hover .alt { opacity: 1; }
  .card:hover .main.has-alt { opacity: 0; }
  .card:hover .card__media img { transform: scale(1.04); }
  /* An unconfigured instance should read as "put an image here", not broken. */
  .ph, .card__ph {
    position: absolute; inset: 0; display: grid; place-items: center;
    color: var(--muted); font-size: 0.6875rem; letter-spacing: 0.14em;
    text-transform: uppercase; text-align: center; padding: 12px;
  }
  .tile .ph { color: rgba(255, 255, 255, 0.72); }
  .promo__media .ph { color: rgba(255, 255, 255, 0.5); }
  .card__body { display: grid; gap: 8px; }
  .card__title { font-family: var(--font-ui); font-size: 0.9375rem; font-weight: 500; letter-spacing: 0; text-transform: none; line-height: 1.3; }
  .card__title a::after { content: ""; position: absolute; inset: 0; z-index: 1; }
  /* A price, its strikethrough and a row of swatches have a combined
     min-content width wider than a two-up column on a 320px frame, and flex
     does not wrap unless told to. */
  .card__meta { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 12px; flex-wrap: wrap; }
  .card__cta { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 3; opacity: 0; transform: translateY(8px); transition: opacity 280ms var(--ease), transform 280ms var(--ease); }
  .card:hover .card__cta, .card:focus-within .card__cta { opacity: 1; transform: none; }
  .card__cta .btn { background: var(--bg); color: var(--text); border-color: var(--bg); }

  .price { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; font-size: 0.9375rem; font-variant-numeric: tabular-nums; }
  .price s { color: var(--muted); text-decoration-thickness: 1px; font-size: 0.9em; }
  .price--sale .price__now { color: var(--accent); }

  .badge {
    display: inline-flex; align-items: center; height: 22px; padding: 0 8px;
    background: var(--primary); color: var(--on-primary); border-radius: ${l.radius > 2 ? "4px" : "1px"};
    font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; white-space: nowrap;
  }
  .badge--sale { background: var(--accent); }
  .badge--new { background: transparent; color: var(--text); border: 1px solid var(--text); }
  .badge--soldout { background: var(--sunken); color: var(--muted); }
  .badge-stack { position: absolute; top: 12px; left: 12px; display: grid; gap: 4px; justify-items: start; z-index: 2; pointer-events: none; }

  .stars { display: inline-flex; gap: 2px; color: var(--accent); }
  .stars .off { color: var(--border-strong); }
  .rating { display: inline-flex; align-items: center; gap: 8px; }
  .rating__count { font-size: 0.6875rem; color: var(--muted); }
  .swatches { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
  .swatch { display: inline-block; width: 15px; height: 15px; border-radius: 50%; border: 1px solid var(--border-strong); }

  /* ---------- mosaic ---------- */
  .mosaic { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; }
  .tile { position: relative; display: block; overflow: hidden; border-radius: var(--radius); background: var(--sunken); color: #fff; aspect-ratio: 3 / 4; }
  .mosaic > .tile:first-child { aspect-ratio: auto; min-height: 380px; }
  .tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 900ms var(--ease); }
  .tile:hover img { transform: scale(1.05); }
  .tile::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(20,20,15,0.6), transparent 56%); }
  .tile__body { position: absolute; inset: auto 0 0; z-index: 2; display: grid; gap: 8px; padding: 24px; }
  .tile__cta { display: inline-flex; align-items: center; gap: 8px; font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase; }

  /* ---------- editorial ---------- */
  .editorial { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 96px); align-items: center; }
  .editorial--reverse .editorial__media { order: 2; }
  .editorial__media { position: relative; }
  .editorial__media .frame { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--sunken); aspect-ratio: 4 / 5; }
  .editorial__media .frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .editorial__inset { position: absolute; right: -8%; bottom: -8%; width: 42%; border: 6px solid var(--bg); border-radius: var(--radius); overflow: hidden; }
  .editorial__inset .frame { aspect-ratio: 1 / 1; }
  .editorial__body { display: grid; gap: 20px; max-width: 46ch; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 20px; border-top: 1px solid var(--border); }
  .stat { display: grid; gap: 4px; }
  .stat__value { font-family: var(--font-display); font-size: 1.9rem; line-height: 1; font-weight: ${displayWeight}; font-variant-numeric: tabular-nums; }

  /* ---------- promo ---------- */
  .promo { position: relative; display: grid; place-items: center; min-height: clamp(340px, 44vw, 600px); overflow: hidden; color: #fff; text-align: center; }
  .promo__media { position: absolute; inset: 0; background: var(--primary); }
  .promo__media img, .promo__media video { width: 100%; height: 100%; object-fit: cover; }
  .promo__media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(20,20,15,0.2), rgba(20,20,15,0.6)); }
  .promo__body { position: relative; z-index: 2; display: grid; gap: 16px; justify-items: center; padding: 64px var(--gutter); max-width: min(62ch, 100%); }
  .promo__ledger { display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.24); flex-wrap: wrap; justify-content: center; }
  .promo__item { display: grid; gap: 4px; text-align: center; }
  .promo__value { font-family: var(--font-display); font-size: 1.4rem; font-weight: ${displayWeight}; font-variant-numeric: tabular-nums; }

  /* ---------- reviews ---------- */
  .reviews-summary { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; padding-bottom: 24px; }
  .reviews-summary__score { font-family: var(--font-display); font-size: 3rem; line-height: 1; font-weight: ${displayWeight}; }
  .wall { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border-block: 1px solid var(--border); }
  .review { display: grid; gap: 16px; align-content: start; padding: clamp(24px, 3vw, 48px); background: var(--bg); }
  .review__quote { font-family: var(--font-display); font-size: 1.0625rem; line-height: 1.35; letter-spacing: ${t.tracking / 100}em; font-weight: ${displayWeight}; }
  .review__foot { display: flex; align-items: center; gap: 12px; margin-top: auto; }
  .review__avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: var(--sunken); flex: none; }
  .review__name { font-size: 0.8125rem; font-weight: 500; }
  .review__meta { font-size: 0.6875rem; color: var(--muted); display: inline-flex; align-items: center; gap: 4px; }

  /* ---------- journal ---------- */
  .journal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .post { display: grid; gap: 16px; }
  .post .frame { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--sunken); aspect-ratio: 4 / 3; }
  .post .frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 900ms var(--ease); }
  .post:hover .frame img { transform: scale(1.04); }
  .post__meta { display: flex; gap: 12px; color: var(--muted); }
  .post__title { transition: color 140ms var(--ease); }
  .post:hover .post__title { color: var(--accent); }
  .post__excerpt { color: var(--text-soft); font-size: 0.9375rem; }

  /* ---------- newsletter ---------- */
  .newsletter { display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: clamp(32px, 6vw, 96px); }
  .newsletter__body { display: grid; gap: 16px; max-width: 40ch; }
  .newsletter__row { display: flex; gap: 12px; align-items: flex-end; }
  .newsletter__media .frame { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--sunken); aspect-ratio: 5 / 4; }
  .newsletter__media .frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .field { position: relative; display: block; flex: 1; }
  .field input {
    width: 100%; min-height: 48px; padding: 22px 12px 8px; background: transparent;
    border: 0; border-bottom: 1px solid var(--border-strong); border-radius: 0;
    font: inherit; font-size: 0.9375rem; color: var(--text);
    transition: border-color 280ms var(--ease);
  }
  .field input:focus { outline: none; border-bottom-color: var(--accent); }
  .field span {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--muted); font-size: 0.9375rem; pointer-events: none;
    transition: transform 280ms var(--ease), font-size 280ms var(--ease), letter-spacing 280ms var(--ease);
  }
  .field input:focus + span, .field input:not(:placeholder-shown) + span {
    transform: translateY(-150%); font-size: 0.6875rem; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .note { font-size: 0.6875rem; color: var(--muted); }
  .form-status { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--success); }

  /* ---------- footer ---------- */
  .footer { border-top: 1px solid var(--border); }
  .footer__top { display: grid; grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr)); gap: 64px; padding-block: 80px 64px; }
  .footer__brand { display: grid; gap: 16px; align-content: start; max-width: 34ch; }
  .footer__col-title { margin-bottom: 16px; display: block; }
  .footer__list { display: grid; gap: 8px; }
  .footer__list a { font-size: 0.9375rem; color: var(--text-soft); transition: color 140ms var(--ease); }
  .footer__list a:hover { color: var(--accent); }
  .footer__bottom {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    padding-block: 20px; border-top: 1px solid var(--border); font-size: 0.6875rem; color: var(--muted);
  }
  .socials { display: flex; gap: 8px; }
  .socials a { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: var(--radius); transition: border-color 140ms var(--ease), color 140ms var(--ease); }
  .socials a:hover { border-color: var(--text); color: var(--accent); }
  .cluster { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }

  /* ---------- reveal ---------- */
  .reveal { opacity: 0; transform: translateY(18px); transition: opacity 620ms var(--ease), transform 620ms var(--ease); }
  .reveal.in { opacity: 1; transform: none; }

  /* ==================================================================
     Breakpoints follow the component's own width, not the window's —
     Framer renders this in frames of any width.
     ================================================================== */

  .${ROOT}.w-md .ledger--c4, .${ROOT}.w-md .ledger--c5 { --cols: 3; }
  .${ROOT}.w-md .footer__top { grid-template-columns: 1fr 1fr 1fr; }
  .${ROOT}.w-md .footer__brand { grid-column: 1 / -1; max-width: none; }
  .${ROOT}.w-md .wall { grid-template-columns: 1fr 1fr; }

  .${ROOT}.w-sm .header__nav { gap: 0; }
  .${ROOT}.w-sm .nav { display: none; }
  .${ROOT}.w-sm .burger { display: inline-flex; }
  .${ROOT}.w-sm .header__inner { grid-template-columns: auto 1fr auto; min-height: 60px; }
  .${ROOT}.w-sm .nav__link { height: 60px; }
  .${ROOT}.w-sm .hero { grid-template-columns: 1fr; min-height: 0; }
  .${ROOT}.w-sm .hero__media { aspect-ratio: 4 / 3; }
  .${ROOT}.w-sm .hero--full .hero__media { aspect-ratio: auto; }
  .${ROOT}.w-sm .hero--full .hero__pane { min-height: 60vh; }
  .${ROOT}.w-sm .hero__pane { padding-block: 56px; }
  .${ROOT}.w-sm .hero__actions { width: 100%; max-width: none; }
  .${ROOT}.w-sm .hero__rail { flex-wrap: wrap; gap: 8px 16px; }
  .${ROOT}.w-sm .hero__actions .btn { flex: 1 1 200px; }
  .${ROOT}.w-sm .mosaic { grid-template-columns: 1fr 1fr; }
  .${ROOT}.w-sm .mosaic > .tile:first-child { grid-column: 1 / -1; aspect-ratio: 16 / 9; min-height: 0; }
  .${ROOT}.w-sm .editorial { grid-template-columns: 1fr; }
  .${ROOT}.w-sm .editorial--reverse .editorial__media { order: 0; }
  .${ROOT}.w-sm .editorial__inset { display: none; }
  .${ROOT}.w-sm .newsletter { grid-template-columns: 1fr; }
  .${ROOT}.w-sm .newsletter__media { display: none; }
  .${ROOT}.w-sm .journal { grid-template-columns: 1fr 1fr; }
  .${ROOT}.w-sm .journal > *:last-child { display: none; }
  .${ROOT}.w-sm .footer__top { grid-template-columns: 1fr 1fr; gap: 32px; padding-block: 56px 40px; }
  .${ROOT}.w-sm .head__row { align-items: flex-start; }

  .${ROOT}.w-sm .ledger--c3, .${ROOT}.w-sm .ledger--c4, .${ROOT}.w-sm .ledger--c5 { --cols: 2; }
  .${ROOT}.w-xs .ledger { --cols: 2; }
  .${ROOT}.w-xs .ledger > * { padding: 12px; }
  .${ROOT}.w-xs .card__cta { position: static; opacity: 1; transform: none; padding-top: 4px; }
  .${ROOT}.w-xs .card__cta .btn { border-color: var(--border-strong); }
  .${ROOT}.w-xs .wall { grid-template-columns: 1fr; }
  .${ROOT}.w-xs .journal { grid-template-columns: 1fr; }
  .${ROOT}.w-xs .journal > *:last-child { display: grid; }
  .${ROOT}.w-xs .mosaic { grid-template-columns: 1fr; }
  .${ROOT}.w-xs .mosaic > .tile:first-child { aspect-ratio: 4 / 3; }
  .${ROOT}.w-xs .stats { grid-template-columns: 1fr 1fr; }
  .${ROOT}.w-xs .footer__bottom { flex-direction: column; align-items: flex-start; }
  .${ROOT}.w-xs .promo__ledger { gap: 16px; }
  .${ROOT}.w-xs .hide-xs { display: none; }
  .${ROOT}.w-xs .icon-btn { width: 38px; height: 38px; }
  .${ROOT}.w-xs .header__inner { gap: 8px; }

  @media (prefers-reduced-motion: reduce) {
    .${ROOT} *, .${ROOT} *::before, .${ROOT} *::after {
      animation-duration: 0.001ms !important; transition-duration: 0.001ms !important;
    }
    .reveal { opacity: 1; transform: none; }
    .marquee__track { animation: none; }
  }
`
}

/* ------------------------------------------------------------------ */
/* Hooks and small pieces                                              */
/* ------------------------------------------------------------------ */

const useIsomorphicLayoutEffect =
    typeof document !== "undefined" ? useLayoutEffect : useEffect

/** Breakpoint classes from the component's own width. */
function useWidthClass(ref) {
    const [widthClass, setWidthClass] = useState("")

    useIsomorphicLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        const apply = (width) => {
            if (!width) return
            const classes = []
            if (width <= 1100) classes.push("w-md")
            if (width <= 820) classes.push("w-sm")
            if (width <= 560) classes.push("w-xs")
            const next = classes.join(" ")
            setWidthClass((prev) => (prev === next ? prev : next))
        }

        apply(el.offsetWidth)
        if (typeof ResizeObserver === "undefined") {
            const onResize = () => apply(el.offsetWidth)
            window.addEventListener("resize", onResize)
            return () => window.removeEventListener("resize", onResize)
        }
        const observer = new ResizeObserver((entries) =>
            apply(entries[0].contentRect.width)
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    return widthClass
}

/** Reveals elements on scroll; everything is simply visible without support. */
function useReveal(ref, enabled, deps) {
    useIsomorphicLayoutEffect(() => {
        const root = ref.current
        if (!root) return
        const targets = Array.from(root.querySelectorAll(".reveal"))
        if (!targets.length) return

        const reduce =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        if (!enabled || reduce || typeof IntersectionObserver === "undefined") {
            targets.forEach((el) => el.classList.add("in"))
            return
        }

        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    entry.target.classList.add("in")
                    observer.unobserve(entry.target)
                }),
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        )
        targets.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, deps)
}

/** Image or video in one slot; a video URL pasted into an image field works too. */
function Media({ image, video, poster, alt, className, autoplay = true }) {
    const src =
        video ||
        (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(image || "") ? image : null)
    if (src) {
        return (
            <video
                className={className}
                src={src}
                poster={poster || undefined}
                autoPlay={autoplay}
                loop
                muted
                playsInline
                aria-label={alt || ""}
            />
        )
    }
    return image ? (
        <img className={className} src={image} alt={alt || ""} loading="lazy" />
    ) : null
}

const ICONS = {
    search: (
        <>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" strokeLinecap="round" />
        </>
    ),
    cart: (
        <>
            <path
                d="M4.5 7.5h15l-1.2 12.2a1 1 0 0 1-1 .8H6.7a1 1 0 0 1-1-.8L4.5 7.5Z"
                strokeLinejoin="round"
            />
            <path d="M9 9.5V6a3 3 0 0 1 6 0v3.5" strokeLinecap="round" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8.5" r="3.75" />
            <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" strokeLinecap="round" />
        </>
    ),
    heart: (
        <path
            d="M12 20.2 4.9 13.4a4.4 4.4 0 0 1 6.2-6.2l.9.9.9-.9a4.4 4.4 0 0 1 6.2 6.2L12 20.2Z"
            strokeLinejoin="round"
        />
    ),
    menu: <path d="M3.5 7.5h17M3.5 12h17M3.5 16.5h17" strokeLinecap="round" />,
    close: <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />,
    down: <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />,
    arrow: (
        <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    truck: (
        <>
            <path d="M2.75 6.75h11v10h-11z" />
            <path d="M13.75 10.25h4l3.5 3.25v3.25h-7.5z" />
            <circle cx="7" cy="18.25" r="1.75" />
            <circle cx="17" cy="18.25" r="1.75" />
        </>
    ),
    ret: (
        <>
            <path d="M4 12a8 8 0 1 1 2.6 5.9" strokeLinecap="round" />
            <path d="M3.5 7.5v4.2h4.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    shield: (
        <>
            <path
                d="M12 3.2 5 5.9v5.4c0 4.2 2.8 7.6 7 9.5 4.2-1.9 7-5.3 7-9.5V5.9L12 3.2Z"
                strokeLinejoin="round"
            />
            <path d="m9 12 2.2 2.2L15.5 10" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    leaf: (
        <>
            <path d="M20 4c0 9-5.5 14-12 14a5.5 5.5 0 0 1 0-11c4 0 6-3 12-3Z" strokeLinejoin="round" />
            <path d="M4 20c3-5 7-8 12-9.5" strokeLinecap="round" />
        </>
    ),
    check: (
        <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    ),
    gift: (
        <>
            <path d="M3.75 8.75h16.5v3.5H3.75zM5.25 12.25h13.5v8H5.25zM12 8.75v11.5" />
            <path
                d="M12 8.75S10.5 4 8.25 4a2 2 0 0 0 0 4.75M12 8.75S13.5 4 15.75 4a2 2 0 0 1 0 4.75"
                strokeLinecap="round"
            />
        </>
    ),
    instagram: (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="3.75" />
            <circle cx="16.9" cy="7.1" r="1" fill="currentColor" stroke="none" />
        </>
    ),
    pinterest: (
        <path
            d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.1-1.9 0-2.7l1.1-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.4l-.8 3.3c-.2.9.4 1.6 1.3 1.6 1.6 0 2.8-1.7 2.8-4.1 0-2.1-1.5-3.6-3.7-3.6a3.9 3.9 0 0 0-4 3.9c0 .8.3 1.6.7 2 .1.1.1.2.1.3l-.2.9c0 .2-.1.2-.3.1-1.2-.5-1.9-2.2-1.9-3.5 0-2.8 2-5.4 5.9-5.4 3.1 0 5.5 2.2 5.5 5.1 0 3.1-1.9 5.5-4.6 5.5-.9 0-1.8-.5-2.1-1l-.6 2.2c-.2.8-.7 1.8-1.1 2.4A9 9 0 1 0 12 3Z"
            fill="currentColor"
            stroke="none"
        />
    ),
    tiktok: (
        <path
            d="M14.4 3h2.5a5 5 0 0 0 4.1 4.2v2.5a7.6 7.6 0 0 1-4.1-1.3v6.2a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.6a3.4 3.4 0 1 0 2.5 3.2V3Z"
            fill="currentColor"
            stroke="none"
        />
    ),
    youtube: (
        <path
            d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"
            fill="currentColor"
            stroke="none"
        />
    ),
    star: (
        <path
            d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z"
            fill="currentColor"
            stroke="none"
        />
    ),
}

function Icon({ name, size = 20 }) {
    const path = ICONS[name]
    if (!path) return null
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            aria-hidden="true"
            focusable="false"
        >
            {path}
        </svg>
    )
}

/** Placeholder for an image slot nobody has filled in yet. */
function Ph({ label }) {
    return <span className="ph">{label}</span>
}

function Stars({ rating = 5, size = 12 }) {
    const rounded = Math.round(Number(rating) || 0)
    return (
        <span className="stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i > rounded ? "off" : undefined}>
                    <Icon name="star" size={size} />
                </span>
            ))}
        </span>
    )
}

/** "#E9E4DA, #B0745C" in one field beats four colour pickers per product. */
function parseSwatches(value) {
    if (!value || typeof value !== "string") return []
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
}

/** Groups a flat array of {column, label, link} rows into panel-editable columns. */
function groupByColumn(rows) {
    const out = []
    ;(rows || []).forEach((row) => {
        if (!row) return
        const key = (row.column || "").trim() || "—"
        let group = out.find((g) => g.title === key)
        if (!group) {
            group = { title: key, items: [] }
            out.push(group)
        }
        group.items.push(row)
    })
    return out
}

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_PRODUCTS = [
    { title: "Aro Carafe", price: "€89.00", comparePrice: "€115.00", badge: "sale", rating: 5, reviews: "128", swatches: "#E9E4DA, #B0745C, #1B1B16", link: "#" },
    { title: "Halden Table Lamp", price: "€245.00", comparePrice: "", badge: "none", rating: 5, reviews: "64", swatches: "#E9E4DA, #1B1B16, #6A7278", link: "#" },
    { title: "Ostra Lounge Chair", price: "€890.00", comparePrice: "", badge: "custom", badgeText: "Made to order", rating: 5, reviews: "41", swatches: "#5A6B52, #B0745C", link: "#" },
    { title: "Sund Flask", price: "€64.00", comparePrice: "€79.00", badge: "sale", rating: 5, reviews: "212", swatches: "#E9E4DA, #A44A2E", link: "#" },
    { title: "Marka Weekend Bag", price: "€320.00", comparePrice: "", badge: "new", rating: 5, reviews: "87", swatches: "#B0745C, #1B1B16", link: "#" },
    { title: "Veld Wall Clock", price: "€159.00", comparePrice: "€199.00", badge: "sale", rating: 5, reviews: "53", swatches: "#1B1B16, #E9E4DA", link: "#" },
    { title: "Fyra Stool", price: "€210.00", comparePrice: "", badge: "none", rating: 5, reviews: "38", swatches: "#5A6B52, #E9E4DA", link: "#" },
    { title: "Rime Serving Bowl", price: "€72.00", comparePrice: "", badge: "none", rating: 5, reviews: "164", swatches: "#E9E4DA, #A44A2E, #5A6B52", link: "#" },
]

const DEFAULT_NAV = [
    { label: "Shop", link: "#products", hasMega: true },
    { label: "All products", link: "#products", hasMega: false },
    { label: "Journal", link: "#journal", hasMega: false },
]

/* A flat array with a column name groups itself into mega-menu columns, which
   is the only way to nest a list inside a Framer array control. */
const DEFAULT_MEGA = [
    { column: "Objects", label: "All objects", link: "#" },
    { column: "Objects", label: "Vessels", link: "#" },
    { column: "Objects", label: "Serving", link: "#" },
    { column: "Lighting", label: "All lighting", link: "#" },
    { column: "Lighting", label: "Table", link: "#" },
    { column: "Lighting", label: "Floor", link: "#" },
    { column: "Furniture", label: "All furniture", link: "#" },
    { column: "Furniture", label: "Seating", link: "#" },
    { column: "Furniture", label: "Tables", link: "#" },
]

const DEFAULT_MARQUEE = [
    { text: "Free shipping over €150", icon: "truck" },
    { text: "30-day returns", icon: "ret" },
    { text: "Secure checkout", icon: "shield" },
    { text: "Made in small runs", icon: "leaf" },
    { text: "Rated 4.9 by 2,431 customers", icon: "star" },
]

const DEFAULT_CATEGORIES = [
    { title: "Objects", cta: "Shop", link: "#", image: "" },
    { title: "Lighting", cta: "Shop", link: "#", image: "" },
    { title: "Furniture", cta: "Shop", link: "#", image: "" },
]

const DEFAULT_STATS = [
    { value: "12", label: "Makers" },
    { value: "4.9", label: "Average rating" },
    { value: "30", label: "Day returns" },
]

const DEFAULT_PROMO_ITEMS = [
    { value: "40", label: "Pieces" },
    { value: "1", label: "Release" },
    { value: "03", label: "Makers" },
]

const DEFAULT_REVIEWS = [
    {
        quote: "It arrived beautifully packed and it is genuinely better in person. I have already ordered a second.",
        name: "Marta L.",
        meta: "Verified buyer",
        rating: 5,
        avatar: "",
    },
    {
        quote: "I asked a question at nine in the evening and had a real answer by morning. The piece itself has become the one I reach for.",
        name: "Daniel R.",
        meta: "Verified buyer",
        rating: 5,
        avatar: "",
    },
    {
        quote: "Third order this year. Nothing has worn badly, which I cannot say about anything else I bought online.",
        name: "Yuki T.",
        meta: "Verified buyer",
        rating: 5,
        avatar: "",
    },
]

const DEFAULT_JOURNAL = [
    { title: "Why we stopped running sales", date: "12 March", tag: "Studio", excerpt: "Discounting taught our customers to wait. Here is what we did instead.", image: "", link: "#" },
    { title: "A day in the Alentejo workshop", date: "28 February", tag: "Makers", excerpt: "Four hundred kilometres south, eleven people, and a kiln that has not been cold since 1994.", image: "", link: "#" },
    { title: "How to care for unglazed stoneware", date: "9 February", tag: "Care", excerpt: "It is more forgiving than it looks. Three habits will see a piece through a decade.", image: "", link: "#" },
]

const DEFAULT_FOOTER_LINKS = [
    { column: "Shop", label: "Objects", link: "#" },
    { column: "Shop", label: "Lighting", link: "#" },
    { column: "Shop", label: "Furniture", link: "#" },
    { column: "Help", label: "Shipping", link: "#" },
    { column: "Help", label: "Returns", link: "#" },
    { column: "Help", label: "Contact", link: "#" },
    { column: "Studio", label: "Our story", link: "#" },
    { column: "Studio", label: "Journal", link: "#" },
]

const DEFAULTS = {
    colors: {
        preset: "ink",
        background: PALETTES.ink.background,
        surface: PALETTES.ink.surface,
        sunken: PALETTES.ink.sunken,
        text: PALETTES.ink.text,
        muted: PALETTES.ink.muted,
        border: PALETTES.ink.border,
        primary: PALETTES.ink.primary,
        onPrimary: PALETTES.ink.onPrimary,
        accent: PALETTES.ink.accent,
        success: PALETTES.ink.success,
    },
    type: {
        personality: "editorial",
        displayFont: "'Fraunces', 'Iowan Old Style', Georgia, serif",
        uiFont: "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        loadFonts: true,
        baseSize: 16,
        headingScale: 100,
        tracking: -2,
        headingCase: "none",
    },
    layout: {
        contentWidth: 1440,
        spacing: 104,
        radius: 2,
        surfaceStyle: "hairline",
        buttonShape: "square",
        buttonUppercase: true,
        logoWidth: 130,
        showIndex: true,
        animate: true,
    },
    announcement: {
        show: true,
        text: "Complimentary shipping on orders over €150",
        link: "",
        tone: "primary",
    },
    header: {
        wordmark: "PLINTH",
        logo: "",
        cartLink: "#",
        accountLink: "#",
        wishlistLink: "#",
        cartCount: 0,
        showAccount: true,
        showWishlist: true,
        showSearch: true,
    },
    hero: {
        show: true,
        layout: "split",
        eyebrow: "Autumn release",
        heading: "Objects worth keeping",
        text: "A small collection, made in limited runs and finished by hand.",
        primaryLabel: "Shop the collection",
        primaryLink: "#products",
        secondaryLabel: "Our story",
        secondaryLink: "#story",
        image: "",
        video: "",
        railOne: "Autumn 2026 — release 04",
        railTwo: "12 makers · 4 workshops",
        railThree: "Shipping worldwide",
    },
    marquee: { show: true, speed: 42 },
    products: {
        show: true,
        index: "01",
        eyebrow: "Featured",
        heading: "This season's shortlist",
        linkLabel: "View all",
        linkHref: "#",
        columns: 4,
        style: "ledger",
        ctaLabel: "Quick view",
        showRating: true,
        showSwatches: true,
        showCta: true,
    },
    categories: {
        show: true,
        index: "02",
        eyebrow: "Categories",
        heading: "Where to start",
    },
    story: {
        show: true,
        eyebrow: "Our story",
        heading: "Made slowly, on purpose",
        text: "We work with a handful of makers and keep our runs small. It means we sell out sometimes, and it means every piece leaves the studio checked by someone who knows what it should feel like.",
        buttonLabel: "Read more",
        buttonLink: "#",
        image: "",
        insetImage: "",
        reverse: false,
        sunken: true,
    },
    promo: {
        show: true,
        eyebrow: "Limited release",
        heading: "The winter capsule",
        text: "Forty pieces. Once they are gone, they are gone.",
        buttonLabel: "Shop the capsule",
        buttonLink: "#",
        image: "",
        video: "",
    },
    reviews: {
        show: true,
        index: "04",
        eyebrow: "Customers",
        heading: "What people tell us",
        score: "4.9",
        scoreLabel: "From 2,431 reviews",
    },
    journal: {
        show: true,
        index: "05",
        eyebrow: "Journal",
        heading: "Notes from the studio",
        linkLabel: "All posts",
        linkHref: "#",
    },
    newsletter: {
        show: true,
        eyebrow: "Keep in touch",
        heading: "First look, twice a month",
        text: "New arrivals, restocks and the occasional studio note. No noise.",
        buttonLabel: "Subscribe",
        placeholder: "Email address",
        note: "Unsubscribe any time.",
        successText: "Thank you. Check your inbox to confirm.",
        endpoint: "",
        image: "",
        sunken: true,
    },
    footer: {
        show: true,
        text: "Considered goods, made in small runs and built to be kept.",
        copyright: "© 2026 Plinth",
        instagram: "",
        pinterest: "",
        tiktok: "",
        youtube: "",
        note: "Powered by Shopify",
    },
}

const merge = (defaults, value) => ({ ...defaults, ...(value || {}) })
const list = (value, fallback) =>
    Array.isArray(value) && value.length ? value : fallback

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Framer reads these annotations only when they sit directly above the
 * exported component.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 5200
 * @framerDisableUnlink
 */
export default function PlinthShop(props) {
    const rootRef = useRef(null)
    const widthClass = useWidthClass(rootRef)

    const [menuMounted, setMenuMounted] = useState(false)
    const [menuIn, setMenuIn] = useState(false)
    const [subscribed, setSubscribed] = useState(false)

    const colors = resolveColors(merge(DEFAULTS.colors, props.colors))
    const type = merge(DEFAULTS.type, props.type)
    const layout = merge(DEFAULTS.layout, props.layout)
    const announcement = merge(DEFAULTS.announcement, props.announcement)
    const header = merge(DEFAULTS.header, props.header)
    const hero = merge(DEFAULTS.hero, props.hero)
    const marquee = merge(DEFAULTS.marquee, props.marquee)
    const products = merge(DEFAULTS.products, props.products)
    const categories = merge(DEFAULTS.categories, props.categories)
    const story = merge(DEFAULTS.story, props.story)
    const promo = merge(DEFAULTS.promo, props.promo)
    const reviews = merge(DEFAULTS.reviews, props.reviews)
    const journal = merge(DEFAULTS.journal, props.journal)
    const newsletter = merge(DEFAULTS.newsletter, props.newsletter)
    const footer = merge(DEFAULTS.footer, props.footer)

    const navItems = list(props.navItems, DEFAULT_NAV)
    const megaLinks = list(props.megaLinks, DEFAULT_MEGA)
    const marqueeItems = list(props.marqueeItems, DEFAULT_MARQUEE)
    const productItems = list(props.productItems, DEFAULT_PRODUCTS)
    const categoryItems = list(props.categoryItems, DEFAULT_CATEGORIES)
    const statItems = list(props.statItems, DEFAULT_STATS)
    const promoItems = list(props.promoItems, DEFAULT_PROMO_ITEMS)
    const reviewItems = list(props.reviewItems, DEFAULT_REVIEWS)
    const journalItems = list(props.journalItems, DEFAULT_JOURNAL)
    const footerLinks = list(props.footerLinks, DEFAULT_FOOTER_LINKS)

    const css = useMemo(
        () =>
            (type.loadFonts === false ? "" : FONT_IMPORT + "\n") +
            scopeCSS(globalCSS(colors, type, layout), `.${ROOT}`),
        [colors, type, layout]
    )

    useIsomorphicLayoutEffect(() => {
        let el = document.getElementById(STYLE_ID)
        if (!el) {
            el = document.createElement("style")
            el.id = STYLE_ID
            document.head.appendChild(el)
        }
        el.textContent = css
    }, [css])

    useReveal(rootRef, layout.animate !== false, [
        css,
        productItems,
        reviewItems,
        journalItems,
        categoryItems,
    ])

    /* The drawer is mounted only while open. A fixed element parked off-screen
       escapes the root's overflow and widens the published page. */
    const openMenu = () => {
        setMenuMounted(true)
        requestAnimationFrame(() =>
            requestAnimationFrame(() => setMenuIn(true))
        )
    }
    const closeMenu = () => {
        setMenuIn(false)
        setTimeout(() => setMenuMounted(false), 400)
    }

    useEffect(() => {
        if (!menuMounted) return
        const onKey = (event) => {
            if (event.key === "Escape") closeMenu()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [menuMounted])

    const megaGroups = groupByColumn(megaLinks)
    const footerGroups = groupByColumn(footerLinks)
    const socials = [
        ["instagram", footer.instagram],
        ["pinterest", footer.pinterest],
        ["tiktok", footer.tiktok],
        ["youtube", footer.youtube],
    ].filter(([, url]) => !!url)

    const onSubscribe = (event) => {
        /* With no endpoint configured the component sends nothing anywhere. */
        if (!newsletter.endpoint) {
            event.preventDefault()
            setSubscribed(true)
        }
    }

    const Head = ({ index, eyebrow, heading, body, linkLabel, linkHref }) => (
        <div className="head reveal">
            {(layout.showIndex !== false || linkLabel) && (
                <div className="head__index">
                    {layout.showIndex !== false && index ? (
                        <span className="label head__num">{index}</span>
                    ) : null}
                    {eyebrow ? <span className="label">{eyebrow}</span> : null}
                    <span className="head__spacer" />
                    {linkLabel ? (
                        <a className="label link" href={linkHref || "#"}>
                            {linkLabel}
                        </a>
                    ) : null}
                </div>
            )}
            {(heading || body) && (
                <div className="head__row">
                    {heading ? <h2 className="head__title">{heading}</h2> : null}
                    {body ? <div className="head__body">{body}</div> : null}
                </div>
            )}
        </div>
    )

    const ProductCard = ({ item }) => {
        const sale = !!item.comparePrice
        const badge =
            item.badge === "custom"
                ? { cls: "badge--new", text: item.badgeText || "New" }
                : item.badge === "sale"
                  ? { cls: "badge--sale", text: "Sale" }
                  : item.badge === "new"
                    ? { cls: "badge--new", text: "New" }
                    : item.badge === "soldout"
                      ? { cls: "badge--soldout", text: "Sold out" }
                      : null
        const swatches = parseSwatches(item.swatches)

        return (
            <article className="card">
                <a
                    className="card__media"
                    href={item.link || "#"}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    {item.image ? (
                        <img
                            className={`main${item.imageHover ? " has-alt" : ""}`}
                            src={item.image}
                            alt=""
                            loading="lazy"
                        />
                    ) : (
                        <Ph label="Product image" />
                    )}
                    {item.imageHover ? (
                        <img className="alt" src={item.imageHover} alt="" loading="lazy" />
                    ) : null}
                </a>

                {badge ? (
                    <div className="badge-stack">
                        <span className={`badge ${badge.cls}`}>{badge.text}</span>
                    </div>
                ) : null}

                {products.showCta !== false && item.badge !== "soldout" ? (
                    <div className="card__cta">
                        <a className="btn btn--sm btn--full" href={item.link || "#"}>
                            <span>{products.ctaLabel}</span>
                        </a>
                    </div>
                ) : null}

                <div className="card__body">
                    <h3 className="card__title">
                        <a href={item.link || "#"}>{item.title}</a>
                    </h3>

                    {products.showRating !== false && item.rating ? (
                        <span className="rating">
                            <Stars rating={item.rating} />
                            {item.reviews ? (
                                <span className="rating__count">({item.reviews})</span>
                            ) : null}
                        </span>
                    ) : null}

                    <div className="card__meta">
                        <span className={`price tabular${sale ? " price--sale" : ""}`}>
                            <span className="price__now">{item.price}</span>
                            {sale ? <s>{item.comparePrice}</s> : null}
                        </span>

                        {products.showSwatches !== false && swatches.length ? (
                            <span className="swatches">
                                {swatches.map((hex, i) => (
                                    <span
                                        key={i}
                                        className="swatch"
                                        style={{ background: hex }}
                                        title={hex}
                                    />
                                ))}
                            </span>
                        ) : null}
                    </div>
                </div>
            </article>
        )
    }

    return (
        <div
            className={`${ROOT} ${widthClass}`.trim()}
            ref={rootRef}
            style={props.style}
        >
            {announcement.show !== false && announcement.text ? (
                <div className={`announce announce--${announcement.tone}`}>
                    <div className="announce__inner">
                        {announcement.link ? (
                            <a href={announcement.link}>{announcement.text}</a>
                        ) : (
                            <span>{announcement.text}</span>
                        )}
                    </div>
                </div>
            ) : null}

            <header className="header">
                <div className="header__inner">
                    <div className="header__nav">
                        <button
                            type="button"
                            className="icon-btn burger"
                            onClick={openMenu}
                            aria-label="Open menu"
                            aria-expanded={menuIn}
                        >
                            <Icon name="menu" />
                        </button>

                        <nav className="nav" aria-label="Main">
                            {navItems.map((item, i) => (
                                <div className="nav__item" key={i}>
                                    <a className="nav__link" href={item.link || "#"}>
                                        {item.label}
                                        {item.hasMega && megaGroups.length ? (
                                            <span className="nav__chev">
                                                <Icon name="down" size={9} />
                                            </span>
                                        ) : null}
                                    </a>

                                    {item.hasMega && megaGroups.length ? (
                                        <div className="mega">
                                            {megaGroups.map((group, gi) => (
                                                <div key={gi}>
                                                    <span className="label mega__title">
                                                        {group.title}
                                                    </span>
                                                    <div className="mega__list">
                                                        {group.items.map((row, ri) => (
                                                            <a key={ri} href={row.link || "#"}>
                                                                {row.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="header__brand">
                        <a className="logo" href="#top">
                            {header.logo ? (
                                <img src={header.logo} alt={header.wordmark || "Home"} />
                            ) : (
                                header.wordmark
                            )}
                        </a>
                    </div>

                    <div className="header__actions">
                        {header.showSearch !== false ? (
                            <button type="button" className="icon-btn" aria-label="Search">
                                <Icon name="search" />
                            </button>
                        ) : null}
                        {header.showWishlist !== false ? (
                            <a
                                className="icon-btn hide-xs"
                                href={header.wishlistLink || "#"}
                                aria-label="Wishlist"
                            >
                                <Icon name="heart" />
                            </a>
                        ) : null}
                        {header.showAccount !== false ? (
                            <a
                                className="icon-btn hide-xs"
                                href={header.accountLink || "#"}
                                aria-label="Account"
                            >
                                <Icon name="user" />
                            </a>
                        ) : null}
                        <a
                            className="icon-btn header__action"
                            href={header.cartLink || "#"}
                            aria-label="Cart"
                        >
                            <Icon name="cart" />
                            {Number(header.cartCount) > 0 ? (
                                <span className="count">{header.cartCount}</span>
                            ) : null}
                        </a>
                    </div>
                </div>
            </header>

            {menuMounted ? (
                <>
                    <button
                        type="button"
                        className={`backdrop${menuIn ? " active" : ""}`}
                        onClick={closeMenu}
                        aria-label="Close menu"
                    />
                    <nav
                        className={`drawer${menuIn ? " active" : ""}`}
                        aria-label="Menu"
                    >
                        <div className="drawer__head">
                            <span className="label">Menu</span>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={closeMenu}
                                aria-label="Close menu"
                            >
                                <Icon name="close" size={18} />
                            </button>
                        </div>
                        <div className="drawer__body">
                            {navItems.map((item, i) => (
                                <a
                                    key={i}
                                    className="drawer__link"
                                    href={item.link || "#"}
                                    onClick={closeMenu}
                                >
                                    {item.label}
                                </a>
                            ))}
                            {megaGroups.map((group, gi) => (
                                <div key={gi} style={{ paddingTop: 16 }}>
                                    <span
                                        className="label label--muted"
                                        style={{ padding: "0 24px" }}
                                    >
                                        {group.title}
                                    </span>
                                    {group.items.map((row, ri) => (
                                        <a
                                            key={ri}
                                            className="drawer__sub"
                                            href={row.link || "#"}
                                            onClick={closeMenu}
                                        >
                                            {row.label}
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="drawer__foot">
                            <a
                                className="btn btn--secondary btn--full"
                                href={header.accountLink || "#"}
                            >
                                <span>Account</span>
                            </a>
                        </div>
                    </nav>
                </>
            ) : null}

            {hero.show !== false ? (
                <section
                    className={`hero${hero.layout === "full" ? " hero--full" : ""}`}
                    id="top"
                >
                    {hero.layout !== "full" ? (
                        <div className="hero__pane">
                            <div className="hero__content">
                                {hero.eyebrow ? (
                                    <span className="label label--accent reveal">
                                        {hero.eyebrow}
                                    </span>
                                ) : null}
                                <h1 className="hero__title reveal">{hero.heading}</h1>
                                {hero.text ? (
                                    <p className="hero__body reveal">{hero.text}</p>
                                ) : null}
                                <div className="hero__actions reveal">
                                    {hero.primaryLabel ? (
                                        <a className="btn" href={hero.primaryLink || "#"}>
                                            <span>{hero.primaryLabel}</span>
                                        </a>
                                    ) : null}
                                    {hero.secondaryLabel ? (
                                        <a
                                            className="btn btn--secondary"
                                            href={hero.secondaryLink || "#"}
                                        >
                                            <span>{hero.secondaryLabel}</span>
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="hero__media">
                        <Media
                            image={hero.image}
                            video={hero.video}
                            alt={hero.heading}
                        />
                        {!hero.image && !hero.video ? <Ph label="Hero image" /> : null}
                    </div>

                    {hero.layout === "full" ? (
                        <div className="hero__pane">
                            <div className="hero__content">
                                {hero.eyebrow ? (
                                    <span className="label reveal">{hero.eyebrow}</span>
                                ) : null}
                                <h1 className="hero__title reveal">{hero.heading}</h1>
                                {hero.text ? (
                                    <p className="hero__body reveal">{hero.text}</p>
                                ) : null}
                                <div className="hero__actions reveal">
                                    {hero.primaryLabel ? (
                                        <a className="btn" href={hero.primaryLink || "#"}>
                                            <span>{hero.primaryLabel}</span>
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {(hero.railOne || hero.railTwo || hero.railThree) && (
                        <div className="hero__rail">
                            {hero.railOne ? (
                                <span className="label">{hero.railOne}</span>
                            ) : null}
                            {hero.railTwo ? (
                                <span className="label">{hero.railTwo}</span>
                            ) : null}
                            {hero.railThree ? (
                                <span className="label">{hero.railThree}</span>
                            ) : null}
                        </div>
                    )}
                </section>
            ) : null}

            {marquee.show !== false && marqueeItems.length ? (
                <div
                    className="marquee label"
                    style={{ ["--speed" as any]: `${marquee.speed}s` }}
                >
                    <div className="marquee__track">
                        {[0, 1].map((copy) => (
                            <div
                                className="marquee__group"
                                key={copy}
                                aria-hidden={copy === 1}
                            >
                                {marqueeItems.map((item, i) => (
                                    <span className="marquee__item" key={i}>
                                        {item.icon && item.icon !== "none" ? (
                                            <Icon name={item.icon} size={16} />
                                        ) : null}
                                        {item.text}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {products.show !== false ? (
                <section className="section" id="products">
                    <div className="wrap">
                        <Head
                            index={products.index}
                            eyebrow={products.eyebrow}
                            heading={products.heading}
                            linkLabel={products.linkLabel}
                            linkHref={products.linkHref}
                        />
                        <div
                            className={`ledger ledger--c${Math.min(5, Math.max(2, Number(products.columns) || 4))}${
                                products.style === "loose" ? " ledger--loose" : ""
                            }`}
                        >
                            {productItems.map((item, i) => (
                                <div
                                    className="reveal"
                                    key={i}
                                    style={{
                                        transitionDelay: `${(i % Number(products.columns || 4)) * 60}ms`,
                                    }}
                                >
                                    <ProductCard item={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {categories.show !== false && categoryItems.length ? (
                <section className="section">
                    <div className="wrap">
                        <Head
                            index={categories.index}
                            eyebrow={categories.eyebrow}
                            heading={categories.heading}
                        />
                        <div className="mosaic">
                            {categoryItems.map((item, i) => (
                                <a
                                    className="tile reveal"
                                    key={i}
                                    href={item.link || "#"}
                                >
                                    {item.image ? (
                                        <img src={item.image} alt="" loading="lazy" />
                                    ) : (
                                        <Ph label="Category image" />
                                    )}
                                    <div className="tile__body">
                                        <h3 className="tile__title">{item.title}</h3>
                                        <span className="tile__cta">
                                            {item.cta || "Shop"}
                                            <Icon name="arrow" size={14} />
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {story.show !== false ? (
                <section
                    className={`section${story.sunken !== false ? " section--sunken" : ""}`}
                    id="story"
                >
                    <div className="wrap">
                        <div
                            className={`editorial${story.reverse ? " editorial--reverse" : ""}`}
                        >
                            <div className="editorial__media reveal">
                                <div className="frame">
                                    {story.image ? (
                                        <img src={story.image} alt="" loading="lazy" />
                                    ) : (
                                        <Ph label="Story image" />
                                    )}
                                </div>
                                {story.insetImage ? (
                                    <div className="editorial__inset">
                                        <div className="frame">
                                            <img src={story.insetImage} alt="" loading="lazy" />
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="editorial__body reveal">
                                {story.eyebrow ? (
                                    <span className="label label--accent">
                                        {story.eyebrow}
                                    </span>
                                ) : null}
                                <h2>{story.heading}</h2>
                                {story.text ? (
                                    <p className="lede">{story.text}</p>
                                ) : null}
                                {story.buttonLabel ? (
                                    <div>
                                        <a
                                            className="btn btn--secondary"
                                            href={story.buttonLink || "#"}
                                        >
                                            <span>{story.buttonLabel}</span>
                                        </a>
                                    </div>
                                ) : null}
                                {statItems.length ? (
                                    <div className="stats">
                                        {statItems.map((stat, i) => (
                                            <div className="stat" key={i}>
                                                <span className="stat__value">
                                                    {stat.value}
                                                </span>
                                                <span className="label label--muted">
                                                    {stat.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            {promo.show !== false ? (
                <section className="promo">
                    <div className="promo__media">
                        <Media image={promo.image} video={promo.video} alt={promo.heading} />
                        {!promo.image && !promo.video ? <Ph label="Banner image" /> : null}
                    </div>
                    <div className="promo__body reveal">
                        {promo.eyebrow ? (
                            <span className="label">{promo.eyebrow}</span>
                        ) : null}
                        <h2>{promo.heading}</h2>
                        {promo.text ? <p className="lede">{promo.text}</p> : null}
                        {promo.buttonLabel ? (
                            <a className="btn btn--accent" href={promo.buttonLink || "#"}>
                                <span>{promo.buttonLabel}</span>
                            </a>
                        ) : null}
                        {promoItems.length ? (
                            <div className="promo__ledger">
                                {promoItems.map((item, i) => (
                                    <div className="promo__item" key={i}>
                                        <span className="promo__value">{item.value}</span>
                                        <span className="label">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            ) : null}

            {reviews.show !== false && reviewItems.length ? (
                <section className="section">
                    <div className="wrap">
                        <Head
                            index={reviews.index}
                            eyebrow={reviews.eyebrow}
                            heading={reviews.heading}
                        />
                        {reviews.score ? (
                            <div className="reviews-summary reveal">
                                <span className="reviews-summary__score tabular">
                                    {reviews.score}
                                </span>
                                <Stars rating={5} size={14} />
                                <span className="label label--muted">
                                    {reviews.scoreLabel}
                                </span>
                            </div>
                        ) : null}
                    </div>
                    <div className="wall">
                        {reviewItems.map((item, i) => (
                            <blockquote className="review reveal" key={i}>
                                {item.rating ? <Stars rating={item.rating} /> : null}
                                <p className="review__quote">{item.quote}</p>
                                <footer className="review__foot">
                                    {item.avatar ? (
                                        <img
                                            className="review__avatar"
                                            src={item.avatar}
                                            alt=""
                                            loading="lazy"
                                        />
                                    ) : null}
                                    <div>
                                        <div className="review__name">{item.name}</div>
                                        <div className="review__meta">
                                            <Icon name="check" size={12} />
                                            {item.meta}
                                        </div>
                                    </div>
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </section>
            ) : null}

            {journal.show !== false && journalItems.length ? (
                <section className="section" id="journal">
                    <div className="wrap">
                        <Head
                            index={journal.index}
                            eyebrow={journal.eyebrow}
                            heading={journal.heading}
                            linkLabel={journal.linkLabel}
                            linkHref={journal.linkHref}
                        />
                        <div className="journal">
                            {journalItems.map((item, i) => (
                                <a
                                    className="post reveal"
                                    key={i}
                                    href={item.link || "#"}
                                >
                                    <div className="frame">
                                        {item.image ? (
                                            <img src={item.image} alt="" loading="lazy" />
                                        ) : (
                                            <Ph label="Post image" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="post__meta label label--muted">
                                            <span>{item.date}</span>
                                            {item.tag ? <span>{item.tag}</span> : null}
                                        </div>
                                        <h3 className="post__title" style={{ marginTop: 8 }}>
                                            {item.title}
                                        </h3>
                                        {item.excerpt ? (
                                            <p className="post__excerpt" style={{ marginTop: 8 }}>
                                                {item.excerpt}
                                            </p>
                                        ) : null}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {newsletter.show !== false ? (
                <section
                    className={`section${newsletter.sunken !== false ? " section--sunken" : ""}`}
                >
                    <div className="wrap">
                        <div className="newsletter">
                            <div className="newsletter__body reveal">
                                {newsletter.eyebrow ? (
                                    <span className="label label--accent">
                                        {newsletter.eyebrow}
                                    </span>
                                ) : null}
                                <h2>{newsletter.heading}</h2>
                                {newsletter.text ? (
                                    <p className="muted">{newsletter.text}</p>
                                ) : null}

                                {subscribed ? (
                                    <p className="form-status">
                                        <Icon name="check" size={14} />
                                        {newsletter.successText}
                                    </p>
                                ) : (
                                    <form
                                        onSubmit={onSubscribe}
                                        action={newsletter.endpoint || undefined}
                                        method={newsletter.endpoint ? "post" : undefined}
                                        target={newsletter.endpoint ? "_blank" : undefined}
                                    >
                                        <div className="newsletter__row">
                                            <label className="field">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder=" "
                                                    required
                                                    autoComplete="email"
                                                />
                                                <span>{newsletter.placeholder}</span>
                                            </label>
                                            <button type="submit" className="btn">
                                                <span>{newsletter.buttonLabel}</span>
                                            </button>
                                        </div>
                                        {newsletter.note ? (
                                            <p className="note" style={{ marginTop: 12 }}>
                                                {newsletter.note}
                                            </p>
                                        ) : null}
                                    </form>
                                )}
                            </div>

                            <div className="newsletter__media reveal">
                                <div className="frame">
                                    {newsletter.image ? (
                                        <img src={newsletter.image} alt="" loading="lazy" />
                                    ) : (
                                        <Ph label="Newsletter image" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            {footer.show !== false ? (
                <footer className="footer">
                    <div className="wrap">
                        <div className="footer__top">
                            <div className="footer__brand">
                                <a className="logo" href="#top">
                                    {header.logo ? (
                                        <img src={header.logo} alt={header.wordmark || "Home"} />
                                    ) : (
                                        header.wordmark
                                    )}
                                </a>
                                {footer.text ? (
                                    <p className="muted" style={{ fontSize: "0.875rem" }}>
                                        {footer.text}
                                    </p>
                                ) : null}
                                {socials.length ? (
                                    <div className="socials">
                                        {socials.map(([name, url]) => (
                                            <a
                                                key={name}
                                                href={url}
                                                target="_blank"
                                                rel="noopener"
                                                aria-label={name}
                                            >
                                                <Icon name={name} size={16} />
                                            </a>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {footerGroups.map((group, i) => (
                                <div key={i}>
                                    <span className="label footer__col-title">
                                        {group.title}
                                    </span>
                                    <div className="footer__list">
                                        {group.items.map((row, ri) => (
                                            <a key={ri} href={row.link || "#"}>
                                                {row.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="footer__bottom">
                            <div className="cluster">
                                <span>{footer.copyright}</span>
                            </div>
                            <div className="cluster">
                                {footer.note ? (
                                    <span className="label label--muted">{footer.note}</span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </footer>
            ) : null}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Property controls                                                   */
/* ------------------------------------------------------------------ */

const ICON_OPTIONS = ["none", "truck", "ret", "shield", "leaf", "gift", "star"]
const ICON_TITLES = [
    "None",
    "Shipping",
    "Returns",
    "Secure",
    "Sustainable",
    "Gift",
    "Rating",
]

/* Framer passes the group's stored value, which is undefined for a group an
   existing instance has never had. A throw here makes Framer drop the whole
   group from the panel with no error anywhere, so every callback defaults its
   parameter and uses optional chaining. */
const notCustom = (p = {}) => (p?.preset || "ink") !== "custom"

addPropertyControls(PlinthShop, {
    /* Tells you at a glance whether Framer loaded this build. */
    version: {
        type: ControlType.String,
        title: "Version",
        defaultValue: COMPONENT_VERSION,
    },

    colors: {
        type: ControlType.Object,
        title: "🎨 Colors",
        controls: {
            preset: {
                type: ControlType.Enum,
                title: "Palette",
                options: ["ink", "midnight", "clay", "slate", "custom"],
                optionTitles: [
                    "Ink & Chalk",
                    "Midnight",
                    "Bone & Clay",
                    "Slate & Citrus",
                    "Custom colors",
                ],
                defaultValue: DEFAULTS.colors.preset,
            },
            background: { type: ControlType.Color, title: "Background", defaultValue: DEFAULTS.colors.background, hidden: notCustom },
            surface: { type: ControlType.Color, title: "Surface", defaultValue: DEFAULTS.colors.surface, hidden: notCustom },
            sunken: { type: ControlType.Color, title: "Sunken band", defaultValue: DEFAULTS.colors.sunken, hidden: notCustom },
            text: { type: ControlType.Color, title: "Text", defaultValue: DEFAULTS.colors.text, hidden: notCustom },
            muted: { type: ControlType.Color, title: "Muted text", defaultValue: DEFAULTS.colors.muted, hidden: notCustom },
            border: { type: ControlType.Color, title: "Hairline", defaultValue: DEFAULTS.colors.border, hidden: notCustom },
            primary: { type: ControlType.Color, title: "Buttons", defaultValue: DEFAULTS.colors.primary, hidden: notCustom },
            onPrimary: { type: ControlType.Color, title: "Text on buttons", defaultValue: DEFAULTS.colors.onPrimary, hidden: notCustom },
            accent: { type: ControlType.Color, title: "Accent", defaultValue: DEFAULTS.colors.accent, hidden: notCustom },
            success: { type: ControlType.Color, title: "Success", defaultValue: DEFAULTS.colors.success, hidden: notCustom },
        },
    },

    type: {
        type: ControlType.Object,
        title: "🖋️ Typography",
        controls: {
            personality: {
                type: ControlType.Enum,
                title: "Personality",
                options: ["editorial", "modern"],
                optionTitles: ["Editorial serif", "Modern grotesk"],
                defaultValue: DEFAULTS.type.personality,
                displaySegmentedControl: true,
                description:
                    "Editorial sets headlines in the display serif. Modern sets them in the grotesk. One control, two very different stores.",
            },
            displayFont: { type: ControlType.String, title: "Display font", defaultValue: DEFAULTS.type.displayFont },
            uiFont: { type: ControlType.String, title: "Text font", defaultValue: DEFAULTS.type.uiFont },
            loadFonts: {
                type: ControlType.Boolean,
                title: "Load Google Fonts",
                defaultValue: DEFAULTS.type.loadFonts,
                description:
                    "Turn off if you serve Fraunces and Archivo from Framer's own font settings, or use different families above.",
            },
            baseSize: { type: ControlType.Number, title: "Text size", min: 14, max: 19, step: 1, unit: "px", defaultValue: DEFAULTS.type.baseSize },
            headingScale: { type: ControlType.Number, title: "Heading size", min: 80, max: 130, step: 5, unit: "%", defaultValue: DEFAULTS.type.headingScale },
            tracking: { type: ControlType.Number, title: "Heading tracking", min: -4, max: 2, step: 1, unit: "%", defaultValue: DEFAULTS.type.tracking },
            headingCase: {
                type: ControlType.Enum,
                title: "Heading case",
                options: ["none", "uppercase"],
                optionTitles: ["As typed", "UPPERCASE"],
                defaultValue: DEFAULTS.type.headingCase,
                displaySegmentedControl: true,
            },
        },
    },

    layout: {
        type: ControlType.Object,
        title: "📐 Layout",
        controls: {
            contentWidth: { type: ControlType.Number, title: "Content width", min: 1000, max: 1800, step: 20, unit: "px", defaultValue: DEFAULTS.layout.contentWidth },
            spacing: { type: ControlType.Number, title: "Section spacing", min: 48, max: 180, step: 4, unit: "px", defaultValue: DEFAULTS.layout.spacing },
            radius: { type: ControlType.Number, title: "Corner radius", min: 0, max: 20, step: 1, unit: "px", defaultValue: DEFAULTS.layout.radius },
            surfaceStyle: {
                type: ControlType.Enum,
                title: "Surfaces",
                options: ["hairline", "raised"],
                optionTitles: ["Hairline", "Raised"],
                defaultValue: DEFAULTS.layout.surfaceStyle,
                displaySegmentedControl: true,
                description: "Hairline is the theme's signature: rules instead of shadows.",
            },
            buttonShape: {
                type: ControlType.Enum,
                title: "Button shape",
                options: ["square", "soft", "pill"],
                optionTitles: ["Square", "Soft", "Pill"],
                defaultValue: DEFAULTS.layout.buttonShape,
                displaySegmentedControl: true,
            },
            buttonUppercase: { type: ControlType.Boolean, title: "Uppercase buttons", defaultValue: DEFAULTS.layout.buttonUppercase },
            logoWidth: { type: ControlType.Number, title: "Logo width", min: 60, max: 260, step: 5, unit: "px", defaultValue: DEFAULTS.layout.logoWidth },
            showIndex: { type: ControlType.Boolean, title: "Section numbers", defaultValue: DEFAULTS.layout.showIndex },
            animate: { type: ControlType.Boolean, title: "Reveal on scroll", defaultValue: DEFAULTS.layout.animate },
        },
    },

    announcement: {
        type: ControlType.Object,
        title: "📣 Announcement bar",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.announcement.show },
            text: { type: ControlType.String, title: "Text", defaultValue: DEFAULTS.announcement.text, hidden: (p = {}) => p?.show === false },
            link: { type: ControlType.String, title: "Link", placeholder: "https://…", defaultValue: DEFAULTS.announcement.link, hidden: (p = {}) => p?.show === false },
            tone: {
                type: ControlType.Enum,
                title: "Colour",
                options: ["primary", "accent", "sunken"],
                optionTitles: ["Ink", "Accent", "Sunken"],
                defaultValue: DEFAULTS.announcement.tone,
                displaySegmentedControl: true,
                hidden: (p = {}) => p?.show === false,
            },
        },
    },

    header: {
        type: ControlType.Object,
        title: "🧭 Header",
        controls: {
            logo: { type: ControlType.Image, title: "Logo" },
            wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: DEFAULTS.header.wordmark, description: "Used when no logo image is set." },
            showSearch: { type: ControlType.Boolean, title: "Search icon", defaultValue: DEFAULTS.header.showSearch },
            showWishlist: { type: ControlType.Boolean, title: "Wishlist icon", defaultValue: DEFAULTS.header.showWishlist },
            wishlistLink: { type: ControlType.String, title: "Wishlist link", defaultValue: DEFAULTS.header.wishlistLink, hidden: (p = {}) => p?.showWishlist === false },
            showAccount: { type: ControlType.Boolean, title: "Account icon", defaultValue: DEFAULTS.header.showAccount },
            accountLink: { type: ControlType.String, title: "Account link", defaultValue: DEFAULTS.header.accountLink, hidden: (p = {}) => p?.showAccount === false },
            cartLink: { type: ControlType.String, title: "Cart link", defaultValue: DEFAULTS.header.cartLink },
            cartCount: { type: ControlType.Number, title: "Cart count", min: 0, max: 99, step: 1, displayStepper: true, defaultValue: DEFAULTS.header.cartCount },
        },
    },

    navItems: {
        type: ControlType.Array,
        title: "🧭 Menu links",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label", defaultValue: "Shop" },
                link: { type: ControlType.String, title: "Link", defaultValue: "#products" },
                hasMega: { type: ControlType.Boolean, title: "Opens mega menu", defaultValue: false },
            },
        },
        defaultValue: DEFAULT_NAV,
    },

    megaLinks: {
        type: ControlType.Array,
        title: "🧭 Mega menu links",
        description:
            "Rows sharing a column name become one column. Shown under any menu link with “Opens mega menu” switched on.",
        control: {
            type: ControlType.Object,
            controls: {
                column: { type: ControlType.String, title: "Column", defaultValue: "Objects" },
                label: { type: ControlType.String, title: "Label", defaultValue: "All objects" },
                link: { type: ControlType.String, title: "Link", defaultValue: "#" },
            },
        },
        defaultValue: DEFAULT_MEGA,
    },

    hero: {
        type: ControlType.Object,
        title: "🖼️ Hero",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.hero.show },
            layout: {
                type: ControlType.Enum,
                title: "Layout",
                options: ["split", "full"],
                optionTitles: ["Split", "Full bleed"],
                defaultValue: DEFAULTS.hero.layout,
                displaySegmentedControl: true,
                hidden: (p = {}) => p?.show === false,
            },
            image: { type: ControlType.Image, title: "Image", hidden: (p = {}) => p?.show === false },
            video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"], hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.hero.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.hero.heading, hidden: (p = {}) => p?.show === false },
            text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: DEFAULTS.hero.text, hidden: (p = {}) => p?.show === false },
            primaryLabel: { type: ControlType.String, title: "Button", defaultValue: DEFAULTS.hero.primaryLabel, hidden: (p = {}) => p?.show === false },
            primaryLink: { type: ControlType.String, title: "Button link", defaultValue: DEFAULTS.hero.primaryLink, hidden: (p = {}) => p?.show === false },
            secondaryLabel: { type: ControlType.String, title: "Second button", defaultValue: DEFAULTS.hero.secondaryLabel, hidden: (p = {}) => p?.show === false || p?.layout === "full" },
            secondaryLink: { type: ControlType.String, title: "Second link", defaultValue: DEFAULTS.hero.secondaryLink, hidden: (p = {}) => p?.show === false || p?.layout === "full" },
            railOne: { type: ControlType.String, title: "Rail left", defaultValue: DEFAULTS.hero.railOne, hidden: (p = {}) => p?.show === false },
            railTwo: { type: ControlType.String, title: "Rail centre", defaultValue: DEFAULTS.hero.railTwo, hidden: (p = {}) => p?.show === false },
            railThree: { type: ControlType.String, title: "Rail right", defaultValue: DEFAULTS.hero.railThree, hidden: (p = {}) => p?.show === false },
        },
    },

    marquee: {
        type: ControlType.Object,
        title: "➰ Trust marquee",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.marquee.show },
            speed: { type: ControlType.Number, title: "Loop duration", min: 20, max: 90, step: 2, unit: "s", defaultValue: DEFAULTS.marquee.speed, hidden: (p = {}) => p?.show === false },
        },
    },

    marqueeItems: {
        type: ControlType.Array,
        title: "➰ Marquee items",
        control: {
            type: ControlType.Object,
            controls: {
                text: { type: ControlType.String, title: "Text", defaultValue: "Free shipping over €150" },
                icon: { type: ControlType.Enum, title: "Icon", options: ICON_OPTIONS, optionTitles: ICON_TITLES, defaultValue: "truck" },
            },
        },
        defaultValue: DEFAULT_MARQUEE,
    },

    products: {
        type: ControlType.Object,
        title: "🛍️ Products",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.products.show },
            index: { type: ControlType.String, title: "Index number", defaultValue: DEFAULTS.products.index, hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.products.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.products.heading, hidden: (p = {}) => p?.show === false },
            linkLabel: { type: ControlType.String, title: "Link label", defaultValue: DEFAULTS.products.linkLabel, hidden: (p = {}) => p?.show === false },
            linkHref: { type: ControlType.String, title: "Link", defaultValue: DEFAULTS.products.linkHref, hidden: (p = {}) => p?.show === false },
            columns: { type: ControlType.Number, title: "Columns", min: 2, max: 5, step: 1, displayStepper: true, defaultValue: DEFAULTS.products.columns, hidden: (p = {}) => p?.show === false },
            style: {
                type: ControlType.Enum,
                title: "Grid",
                options: ["ledger", "loose"],
                optionTitles: ["Ledger", "Loose"],
                defaultValue: DEFAULTS.products.style,
                displaySegmentedControl: true,
                hidden: (p = {}) => p?.show === false,
                description: "Ledger divides products with hairlines — the theme's signature.",
            },
            showRating: { type: ControlType.Boolean, title: "Show ratings", defaultValue: DEFAULTS.products.showRating, hidden: (p = {}) => p?.show === false },
            showSwatches: { type: ControlType.Boolean, title: "Show swatches", defaultValue: DEFAULTS.products.showSwatches, hidden: (p = {}) => p?.show === false },
            showCta: { type: ControlType.Boolean, title: "Show hover button", defaultValue: DEFAULTS.products.showCta, hidden: (p = {}) => p?.show === false },
            ctaLabel: { type: ControlType.String, title: "Button label", defaultValue: DEFAULTS.products.ctaLabel, hidden: (p = {}) => p?.show === false || p?.showCta === false },
        },
    },

    productItems: {
        type: ControlType.Array,
        title: "🛍️ Product list",
        description:
            "Link each product to its Shopify page — Shopify keeps the cart, stock and checkout.",
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.Image, title: "Image" },
                imageHover: { type: ControlType.Image, title: "Hover image" },
                title: { type: ControlType.String, title: "Title", defaultValue: "Product name" },
                price: { type: ControlType.String, title: "Price", defaultValue: "€89.00" },
                comparePrice: { type: ControlType.String, title: "Was", placeholder: "€115.00", defaultValue: "" },
                badge: {
                    type: ControlType.Enum,
                    title: "Badge",
                    options: ["none", "sale", "new", "soldout", "custom"],
                    optionTitles: ["None", "Sale", "New", "Sold out", "Custom"],
                    defaultValue: "none",
                },
                badgeText: { type: ControlType.String, title: "Badge text", defaultValue: "Made to order", hidden: (p = {}) => p?.badge !== "custom" },
                rating: { type: ControlType.Number, title: "Rating", min: 0, max: 5, step: 1, displayStepper: true, defaultValue: 5 },
                reviews: { type: ControlType.String, title: "Review count", defaultValue: "128" },
                swatches: { type: ControlType.String, title: "Swatches", placeholder: "#E9E4DA, #B0745C", defaultValue: "", description: "Comma-separated colours." },
                link: { type: ControlType.String, title: "Link", defaultValue: "#" },
            },
        },
        defaultValue: DEFAULT_PRODUCTS,
    },

    categories: {
        type: ControlType.Object,
        title: "🗂️ Categories",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.categories.show },
            index: { type: ControlType.String, title: "Index number", defaultValue: DEFAULTS.categories.index, hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.categories.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.categories.heading, hidden: (p = {}) => p?.show === false },
        },
    },

    categoryItems: {
        type: ControlType.Array,
        title: "🗂️ Category tiles",
        description: "The first tile is the tall one.",
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.Image, title: "Image" },
                title: { type: ControlType.String, title: "Title", defaultValue: "Objects" },
                cta: { type: ControlType.String, title: "Link label", defaultValue: "Shop" },
                link: { type: ControlType.String, title: "Link", defaultValue: "#" },
            },
        },
        defaultValue: DEFAULT_CATEGORIES,
    },

    story: {
        type: ControlType.Object,
        title: "📖 Brand story",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.story.show },
            image: { type: ControlType.Image, title: "Image", hidden: (p = {}) => p?.show === false },
            insetImage: { type: ControlType.Image, title: "Inset image", hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.story.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.story.heading, hidden: (p = {}) => p?.show === false },
            text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: DEFAULTS.story.text, hidden: (p = {}) => p?.show === false },
            buttonLabel: { type: ControlType.String, title: "Button", defaultValue: DEFAULTS.story.buttonLabel, hidden: (p = {}) => p?.show === false },
            buttonLink: { type: ControlType.String, title: "Button link", defaultValue: DEFAULTS.story.buttonLink, hidden: (p = {}) => p?.show === false },
            reverse: { type: ControlType.Boolean, title: "Image on the right", defaultValue: DEFAULTS.story.reverse, hidden: (p = {}) => p?.show === false },
            sunken: { type: ControlType.Boolean, title: "Sunken background", defaultValue: DEFAULTS.story.sunken, hidden: (p = {}) => p?.show === false },
        },
    },

    statItems: {
        type: ControlType.Array,
        title: "📖 Story figures",
        control: {
            type: ControlType.Object,
            controls: {
                value: { type: ControlType.String, title: "Value", defaultValue: "12" },
                label: { type: ControlType.String, title: "Label", defaultValue: "Makers" },
            },
        },
        defaultValue: DEFAULT_STATS,
    },

    promo: {
        type: ControlType.Object,
        title: "🔥 Promo banner",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.promo.show },
            image: { type: ControlType.Image, title: "Background image", hidden: (p = {}) => p?.show === false },
            video: { type: ControlType.File, title: "Background video", allowedFileTypes: ["mp4", "webm", "mov"], hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.promo.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.promo.heading, hidden: (p = {}) => p?.show === false },
            text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: DEFAULTS.promo.text, hidden: (p = {}) => p?.show === false },
            buttonLabel: { type: ControlType.String, title: "Button", defaultValue: DEFAULTS.promo.buttonLabel, hidden: (p = {}) => p?.show === false },
            buttonLink: { type: ControlType.String, title: "Button link", defaultValue: DEFAULTS.promo.buttonLink, hidden: (p = {}) => p?.show === false },
        },
    },

    promoItems: {
        type: ControlType.Array,
        title: "🔥 Promo details",
        control: {
            type: ControlType.Object,
            controls: {
                value: { type: ControlType.String, title: "Value", defaultValue: "40" },
                label: { type: ControlType.String, title: "Label", defaultValue: "Pieces" },
            },
        },
        defaultValue: DEFAULT_PROMO_ITEMS,
    },

    reviews: {
        type: ControlType.Object,
        title: "⭐ Reviews",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.reviews.show },
            index: { type: ControlType.String, title: "Index number", defaultValue: DEFAULTS.reviews.index, hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.reviews.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.reviews.heading, hidden: (p = {}) => p?.show === false },
            score: { type: ControlType.String, title: "Score", defaultValue: DEFAULTS.reviews.score, hidden: (p = {}) => p?.show === false },
            scoreLabel: { type: ControlType.String, title: "Score label", defaultValue: DEFAULTS.reviews.scoreLabel, hidden: (p = {}) => p?.show === false },
        },
    },

    reviewItems: {
        type: ControlType.Array,
        title: "⭐ Review list",
        control: {
            type: ControlType.Object,
            controls: {
                quote: { type: ControlType.String, title: "Quote", displayTextArea: true, defaultValue: "Better in person than in the photographs." },
                name: { type: ControlType.String, title: "Name", defaultValue: "Marta L." },
                meta: { type: ControlType.String, title: "Meta", defaultValue: "Verified buyer" },
                rating: { type: ControlType.Number, title: "Rating", min: 0, max: 5, step: 1, displayStepper: true, defaultValue: 5 },
                avatar: { type: ControlType.Image, title: "Avatar" },
            },
        },
        defaultValue: DEFAULT_REVIEWS,
    },

    journal: {
        type: ControlType.Object,
        title: "📰 Journal",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.journal.show },
            index: { type: ControlType.String, title: "Index number", defaultValue: DEFAULTS.journal.index, hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.journal.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.journal.heading, hidden: (p = {}) => p?.show === false },
            linkLabel: { type: ControlType.String, title: "Link label", defaultValue: DEFAULTS.journal.linkLabel, hidden: (p = {}) => p?.show === false },
            linkHref: { type: ControlType.String, title: "Link", defaultValue: DEFAULTS.journal.linkHref, hidden: (p = {}) => p?.show === false },
        },
    },

    journalItems: {
        type: ControlType.Array,
        title: "📰 Journal posts",
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.Image, title: "Image" },
                title: { type: ControlType.String, title: "Title", defaultValue: "Notes from the studio" },
                date: { type: ControlType.String, title: "Date", defaultValue: "12 March" },
                tag: { type: ControlType.String, title: "Tag", defaultValue: "Studio" },
                excerpt: { type: ControlType.String, title: "Excerpt", displayTextArea: true, defaultValue: "" },
                link: { type: ControlType.String, title: "Link", defaultValue: "#" },
            },
        },
        defaultValue: DEFAULT_JOURNAL,
    },

    newsletter: {
        type: ControlType.Object,
        title: "✉️ Newsletter",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.newsletter.show },
            image: { type: ControlType.Image, title: "Image", hidden: (p = {}) => p?.show === false },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: DEFAULTS.newsletter.eyebrow, hidden: (p = {}) => p?.show === false },
            heading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.newsletter.heading, hidden: (p = {}) => p?.show === false },
            text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: DEFAULTS.newsletter.text, hidden: (p = {}) => p?.show === false },
            placeholder: { type: ControlType.String, title: "Field label", defaultValue: DEFAULTS.newsletter.placeholder, hidden: (p = {}) => p?.show === false },
            buttonLabel: { type: ControlType.String, title: "Button", defaultValue: DEFAULTS.newsletter.buttonLabel, hidden: (p = {}) => p?.show === false },
            note: { type: ControlType.String, title: "Small print", defaultValue: DEFAULTS.newsletter.note, hidden: (p = {}) => p?.show === false },
            endpoint: {
                type: ControlType.String,
                title: "Form endpoint",
                placeholder: "https://formspree.io/f/…",
                defaultValue: DEFAULTS.newsletter.endpoint,
                hidden: (p = {}) => p?.show === false,
                description:
                    "Paste a Formspree, Mailchimp or Shopify form URL. Left empty the form sends nothing anywhere and just shows the thank-you message.",
            },
            successText: { type: ControlType.String, title: "Thank you text", defaultValue: DEFAULTS.newsletter.successText, hidden: (p = {}) => p?.show === false },
            sunken: { type: ControlType.Boolean, title: "Sunken background", defaultValue: DEFAULTS.newsletter.sunken, hidden: (p = {}) => p?.show === false },
        },
    },

    footer: {
        type: ControlType.Object,
        title: "🔻 Footer",
        controls: {
            show: { type: ControlType.Boolean, title: "Show", defaultValue: DEFAULTS.footer.show },
            text: { type: ControlType.String, title: "Brand text", displayTextArea: true, defaultValue: DEFAULTS.footer.text, hidden: (p = {}) => p?.show === false },
            instagram: { type: ControlType.String, title: "Instagram", placeholder: "https://…", defaultValue: DEFAULTS.footer.instagram, hidden: (p = {}) => p?.show === false },
            pinterest: { type: ControlType.String, title: "Pinterest", placeholder: "https://…", defaultValue: DEFAULTS.footer.pinterest, hidden: (p = {}) => p?.show === false },
            tiktok: { type: ControlType.String, title: "TikTok", placeholder: "https://…", defaultValue: DEFAULTS.footer.tiktok, hidden: (p = {}) => p?.show === false },
            youtube: { type: ControlType.String, title: "YouTube", placeholder: "https://…", defaultValue: DEFAULTS.footer.youtube, hidden: (p = {}) => p?.show === false },
            copyright: { type: ControlType.String, title: "Copyright", defaultValue: DEFAULTS.footer.copyright, hidden: (p = {}) => p?.show === false },
            note: { type: ControlType.String, title: "Bottom note", defaultValue: DEFAULTS.footer.note, hidden: (p = {}) => p?.show === false },
        },
    },

    footerLinks: {
        type: ControlType.Array,
        title: "🔻 Footer links",
        description: "Rows sharing a column name become one column.",
        control: {
            type: ControlType.Object,
            controls: {
                column: { type: ControlType.String, title: "Column", defaultValue: "Shop" },
                label: { type: ControlType.String, title: "Label", defaultValue: "Objects" },
                link: { type: ControlType.String, title: "Link", defaultValue: "#" },
            },
        },
        defaultValue: DEFAULT_FOOTER_LINKS,
    },
})
