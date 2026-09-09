import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * ALEX CARTER — a horizontal, cinematic personal-trainer site as one Framer
 * code component. Every colour, word, photograph and toggle is a panel
 * control; the code holds the design and the motion.
 *
 * Ported from carter-mockup.html. Three things had to change for Framer:
 *   · the page is not fixed to the window — the whole experience lives inside
 *     the component box, so nothing escapes its frame;
 *   · viewport units are replaced by --vpw / --vph, measured from the
 *     component itself, because a Framer frame is rarely the window;
 *   · breakpoints are width classes on the root, for the same reason.
 */

const COMPONENT_VERSION = "v1 · horizontal"
const STYLE_ID = "carter-site-style"
const ROOT = "act-root"

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

/** Same colour at a different alpha; falls back for design tokens. */
function withAlpha(color, alpha) {
    const c = parseColor(color)
    if (!c) {
        return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
    }
    const a = Math.max(0, Math.min(1, c.a * alpha))
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+a.toFixed(3)})`
}

/** Blend two colours; used to derive the charcoal plates from ink and paper. */
function mixColors(a, b, amount) {
    const ca = parseColor(a)
    const cb = parseColor(b)
    if (!ca || !cb) {
        return `color-mix(in srgb, ${a} ${Math.round((1 - amount) * 100)}%, ${b})`
    }
    const t = Math.max(0, Math.min(1, amount))
    return `rgb(${Math.round(ca.r + (cb.r - ca.r) * t)}, ${Math.round(
        ca.g + (cb.g - ca.g) * t
    )}, ${Math.round(ca.b + (cb.b - ca.b) * t)})`
}

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

function scopeCSS(input, scope) {
    // Comments first: a comma inside one would split the selector list.
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
/* Themes                                                              */
/* ------------------------------------------------------------------ */

const THEMES = {
    custom: null,
    midnight: { ink: "#0A0A0A", paper: "#EFEBE4", accent: "#C2A47E" },
    steel: { ink: "#0C0F12", paper: "#E8ECEF", accent: "#7FA6B8" },
    ember: { ink: "#0B0908", paper: "#F1EAE4", accent: "#C4603C" },
    chalk: { ink: "#14140F", paper: "#F4F1E8", accent: "#A8B072" },
}

function resolveColors(colors) {
    const preset = THEMES[colors.preset]
    const base = preset ? { ...colors, ...preset } : colors
    return {
        ...base,
        char: mixColors(base.ink, base.paper, 0.07),
        char2: mixColors(base.ink, base.paper, 0.11),
        paperDim: mixColors(base.paper, base.ink, 0.22),
        smoke: mixColors(base.paper, base.ink, 0.48),
        line: withAlpha(base.paper, 0.16),
    }
}

/* ------------------------------------------------------------------ */
/* Stylesheet                                                          */
/* ------------------------------------------------------------------ */

const globalCSS = (c, t) => `
.${ROOT} {
  --ink: ${c.ink};
  --paper: ${c.paper};
  --accent: ${c.accent};
  --char: ${c.char};
  --char-2: ${c.char2};
  --paper-dim: ${c.paperDim};
  --smoke: ${c.smoke};
  --line: ${c.line};
  --gut: clamp(20px, calc(var(--vpw) * 0.042), ${t.gutter}px);
  --radius: ${t.radius}px;
  --radius-s: ${Math.max(2, Math.round(t.radius * 0.65))}px;
  --h-hero: clamp(3.4rem, calc(var(--vpw) * 0.114), ${t.heroSize}rem);
  --h-1: clamp(2.8rem, calc(var(--vpw) * 0.082), 9rem);
  --h-2: clamp(2.2rem, calc(var(--vpw) * 0.054), 5.6rem);
  --body: clamp(0.95rem, calc(var(--vpw) * 0.0105), 1.12rem);
  --micro: clamp(0.62rem, calc(var(--vpw) * 0.0072), 0.76rem);
  --ease: cubic-bezier(.16,1,.3,1);
  --ease-io: cubic-bezier(.62,.05,.2,1);

  position: relative;
  width: 100%;
  /* clip, not hidden: "hidden" makes overflow-y compute to auto, which clips
     the component and hides height changes from Framer's auto-height. */
  overflow-x: clip;
  overflow-y: visible;
  background: var(--ink);
  color: var(--paper);
  font-family: ${t.fontBody};
  font-weight: 300;
  font-size: var(--body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.${ROOT} *, .${ROOT} *::before, .${ROOT} *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
h1, h2, h3, .display {
  font-family: ${t.fontDisplay};
  font-weight: 800;
  letter-spacing: -.045em;
  line-height: .86;
  text-transform: uppercase;
}
.serif { font-family: ${t.fontSerif}; font-style: italic; letter-spacing: 0; text-transform: none; font-weight: 400; }
.micro { font-size: var(--micro); letter-spacing: .22em; text-transform: uppercase; font-weight: 500; color: var(--smoke); }
.micro--paper { color: var(--paper); }
.idx { font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .18em; color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 6px; }

/* --- the canvas ------------------------------------------------- */
/* The stage clips the grain, the cursor and the menu, so nothing widens the
   published page. The root itself keeps overflow-y visible for auto-height. */
.stage { position: absolute; inset: 0; overflow: hidden; }
.scroller {
  position: absolute; inset: 0;
  display: flex; align-items: stretch;
  overflow-x: auto; overflow-y: hidden;
  scrollbar-width: none; -ms-overflow-style: none;
  overscroll-behavior-x: contain;
}
.scroller::-webkit-scrollbar { display: none; }
.sec {
  position: relative; flex: 0 0 auto; height: 100%;
  display: flex; align-items: center;
  padding: calc(var(--gut) * 1.9) var(--gut) calc(var(--gut) * 1.5);
  overflow: hidden;
}

/* --- reveal primitives ------------------------------------------ */
.rv { opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 1s var(--ease), transform 1.15s var(--ease); transition-delay: var(--d, 0ms); }
.fade { opacity: 0; transition: opacity 1.1s var(--ease); transition-delay: var(--d, 0ms); }
.rv-clip { clip-path: inset(0 100% 0 0 round var(--radius)); transition: clip-path 1.4s var(--ease-io); transition-delay: var(--d, 0ms); }
.is-in.rv, .is-in .rv { opacity: 1; transform: none; }
.is-in.fade, .is-in .fade { opacity: 1; }
.is-in.rv-clip, .is-in .rv-clip { clip-path: inset(0 0 0 0 round var(--radius)); }
.bleed.rv-clip { clip-path: inset(0 100% 0 0); }
.bleed.is-in.rv-clip { clip-path: inset(0 0 0 0); }
.w { display: inline-block; overflow: hidden; vertical-align: top; padding-right: .02em; }
.w > i { display: inline-block; font-style: inherit; transform: translate3d(0, 105%, 0); transition: transform 1.15s var(--ease); transition-delay: calc(var(--d, 0ms) + var(--i, 0) * 55ms); }
.is-in .w > i { transform: none; }

/* --- photographs -------------------------------------------------- */
.plate { position: relative; overflow: hidden; background: var(--char); isolation: isolate; border-radius: var(--radius); }
.plate.bleed { border-radius: 0; }
.plate::before {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(120% 90% at 22% 8%, ${withAlpha(c.accent, 0.22)}, transparent 58%),
    radial-gradient(90% 120% at 82% 96%, ${withAlpha(c.paper, 0.06)}, transparent 60%),
    linear-gradient(150deg, ${mixColors(c.ink, c.paper, 0.12)} 0%, ${mixColors(c.ink, c.paper, 0.05)} 46%, ${c.ink} 100%);
}
.plate::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(180deg, ${withAlpha(c.ink, 0.34)} 0%, transparent 34%, transparent 56%, ${withAlpha(c.ink, 0.52)} 100%);
}
.plate--t2::before { background: radial-gradient(100% 80% at 78% 12%, ${withAlpha(c.paper, 0.1)}, transparent 56%), linear-gradient(200deg, ${mixColors(c.ink, c.paper, 0.09)} 0%, ${c.ink} 62%, ${mixColors(c.ink, c.paper, 0.06)} 100%); }
.plate--t3::before { background: radial-gradient(80% 110% at 50% 100%, ${withAlpha(c.accent, 0.16)}, transparent 62%), linear-gradient(20deg, ${c.ink} 0%, ${mixColors(c.ink, c.paper, 0.1)} 100%); }
.plate--bw img, .plate--bw video { filter: grayscale(1) contrast(1.08); }
.plate img, .plate video {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: center; z-index: 2;
  opacity: 0; transform: scale(1.06);
  transition: opacity 1.2s var(--ease), transform 1.6s var(--ease);
}
.plate img.loaded, .plate video { opacity: 1; transform: scale(1); }
.plate .caption { position: absolute; left: 0; bottom: 0; z-index: 4; padding: 14px 16px; font-size: var(--micro); letter-spacing: .2em; text-transform: uppercase; color: ${withAlpha(c.paper, 0.62)}; }
@media (hover: hover) { .zoom:hover img, .zoom:hover video { transform: scale(1.05); } }

/* --- chrome ------------------------------------------------------- */
.chrome {
  position: absolute; top: 0; left: 0; right: 0; z-index: 40; pointer-events: none;
  display: flex; align-items: center; justify-content: space-between;
  padding: clamp(18px, calc(var(--vpw) * 0.024), 34px) var(--gut);
  mix-blend-mode: difference;
}
.chrome > * { pointer-events: auto; }
.brand { font-family: ${t.fontDisplay}; font-weight: 700; font-size: var(--micro); letter-spacing: .28em; text-transform: uppercase; color: #fff; }
.brand small { display: block; margin-top: 4px; font-weight: 400; letter-spacing: .18em; color: rgba(255,255,255,.55); font-size: calc(var(--micro) * .92); }
.menu-btn { font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .28em; text-transform: uppercase; color: #fff; display: flex; align-items: center; gap: 12px; }
.menu-btn .bars { display: inline-flex; flex-direction: column; gap: 4px; width: 22px; }
.menu-btn .bars span { height: 1px; background: #fff; transition: width .5s var(--ease); }
.menu-btn .bars span:last-child { width: 60%; margin-left: auto; }
@media (hover: hover) { .menu-btn:hover .bars span:last-child { width: 100%; } }

.hud {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 40; pointer-events: none;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
  padding: 0 var(--gut) clamp(16px, calc(var(--vpw) * 0.02), 26px);
}
.hud .count { font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .22em; color: var(--paper); opacity: .75; }
.hud .count b { font-weight: 600; color: var(--accent); }
.hud .label { font-size: var(--micro); letter-spacing: .22em; text-transform: uppercase; color: var(--smoke); text-align: right; }
.hud-right { display: flex; align-items: flex-end; gap: clamp(12px, calc(var(--vpw) * 0.016), 22px); }
.progress { position: absolute; left: 0; bottom: 0; z-index: 41; height: 1px; width: 100%; background: ${withAlpha(c.paper, 0.14)}; pointer-events: none; }
.progress i { display: block; height: 100%; width: 100%; background: var(--accent); transform: scaleX(0); transform-origin: 0 50%; }

/* --- the lifter --------------------------------------------------- */
.lifter { position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px; }
.lifter svg { width: clamp(84px, calc(var(--vpw) * 0.08), 118px); height: auto; display: block; filter: drop-shadow(0 3px 14px ${withAlpha(c.ink, 0.75)}); overflow: visible; }
.lifter line, .lifter path, .lifter circle, .lifter ellipse { stroke-linecap: round; fill: none; }
.lifter .near { stroke: var(--paper); opacity: .95; }
.lifter .far { stroke: var(--paper); opacity: .3; }
.lifter .head { fill: var(--paper); stroke: none; }
.lifter .pelvis { stroke-width: 11.5; }
.lifter .chest { stroke-width: 15; }
.lifter .hand { fill: var(--paper); stroke: none; }
.lifter .neck { stroke-width: 5.4; }
.lifter .thigh { stroke-width: 10.5; }
.lifter .shin { stroke-width: 7.6; }
.lifter .foot { stroke-width: 5.4; }
.lifter .upper { stroke-width: 6.6; }
.lifter .fore { stroke-width: 5.6; }
.lifter .matte circle, .lifter .matte line, .lifter .matte path { stroke: var(--ink); fill: var(--ink); }
.lifter .load { stroke: var(--paper); }
.lifter .disc { fill: var(--paper); stroke: none; }
.lifter .collar { fill: var(--ink); opacity: .5; stroke: none; }
.lifter .contact { fill: var(--paper); stroke: none; }
.lifter .ground { stroke: var(--paper); stroke-width: 1; opacity: .24; }
.lifter .cap { font-size: var(--micro); letter-spacing: .22em; text-transform: uppercase; color: var(--smoke); transition: opacity .6s var(--ease); }
.lifter.moved .cap { opacity: 0; }

/* --- grain -------------------------------------------------------- */
.grain {
  position: absolute; inset: -40%; z-index: 30; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: actGrain 6s steps(4) infinite;
  mix-blend-mode: overlay;
}
@keyframes actGrain {
  0% { transform: translate3d(0,0,0); } 25% { transform: translate3d(-4%,3%,0); }
  50% { transform: translate3d(3%,-4%,0); } 75% { transform: translate3d(-2%,-2%,0); }
  100% { transform: translate3d(0,0,0); }
}
`

const sectionCSS = (c, t) => `
/* 01 HERO */
.s-hero { padding: 0; align-items: stretch; }
.s-hero .plate { position: absolute; inset: 0 -10%; }
.s-hero .plate::after { background: linear-gradient(100deg, ${withAlpha(c.ink, 0.72)} 0%, ${withAlpha(c.ink, 0.3)} 42%, ${withAlpha(c.ink, 0.55)} 100%); }
.hero-inner { position: relative; z-index: 5; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: calc(var(--gut) * 2) var(--gut) clamp(96px, calc(var(--vph) * 0.13), 150px); }
.hero-title { font-size: var(--h-hero); max-width: 16ch; }
.hero-title em, .hero-title i.accent { font-style: normal; color: var(--accent); }
.hero-meta { display: flex; flex-wrap: wrap; gap: clamp(18px, calc(var(--vpw) * 0.04), 64px); margin-top: clamp(22px, calc(var(--vph) * 0.03), 40px); align-items: baseline; }
.hero-meta p { max-width: 34ch; color: var(--paper-dim); }
.hero-side { position: absolute; top: 50%; right: calc(var(--gut) * .55); z-index: 6; transform: translateY(-50%) rotate(90deg); transform-origin: 100% 50%; white-space: nowrap; }
.hint { position: absolute; right: var(--gut); bottom: clamp(96px, calc(var(--vph) * 0.14), 150px); z-index: 6; display: flex; align-items: center; gap: 14px; transition: opacity .6s var(--ease); }
.hint .line { width: clamp(44px, calc(var(--vpw) * 0.06), 92px); height: 1px; background: var(--paper); opacity: .5; transform-origin: 0 50%; animation: actHint 2.8s var(--ease-io) infinite; }
@keyframes actHint { 0% { transform: scaleX(.2); } 45% { transform: scaleX(1); } 100% { transform: scaleX(.2); } }

/* 02 PHILOSOPHY */
.s-philosophy { padding-right: 0; }
.s-philosophy .grid { position: relative; z-index: 2; width: 100%; height: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(28px, calc(var(--vpw) * 0.05), 90px); align-items: center; }
.col-text { display: flex; flex-direction: column; gap: clamp(20px, calc(var(--vph) * 0.03), 42px); }
.s-philosophy h2 { font-size: var(--h-1); max-width: 9ch; position: relative; z-index: 3; }
.s-philosophy p { max-width: 34ch; color: var(--paper-dim); }
.stack-head { display: flex; align-items: baseline; gap: 16px; }
.big-num { font-family: ${t.fontDisplay}; font-weight: 800; font-size: clamp(3rem, calc(var(--vpw) * 0.07), 7rem); line-height: .8; color: transparent; -webkit-text-stroke: 1px var(--accent); letter-spacing: -.04em; }
.s-philosophy .plate { height: min(calc(var(--vph) * 0.74), 760px); width: 100%; }

/* 03 ABOUT */
.s-about { align-items: stretch; padding: 0; }
.s-about .plate { position: absolute; top: 0; right: -6%; width: 78%; height: 100%; }
.s-about .float {
  position: relative; z-index: 5; align-self: center;
  width: min(calc(var(--vpw) * 0.46), 620px); margin-left: var(--gut);
  background: ${withAlpha(c.ink, 0.72)}; backdrop-filter: blur(14px);
  border-left: 1px solid var(--accent); border-radius: 0 var(--radius) var(--radius) 0;
  padding: clamp(26px, calc(var(--vpw) * 0.034), 52px);
}
.s-about h2 { font-size: var(--h-2); margin: 14px 0 18px; }
.s-about p { color: var(--paper-dim); max-width: 36ch; }
.pillars { list-style: none; margin-top: clamp(22px, calc(var(--vph) * 0.03), 40px); border-top: 1px solid var(--line); }
.pillars li { display: flex; gap: clamp(14px, calc(var(--vpw) * 0.02), 28px); align-items: baseline; padding: clamp(10px, calc(var(--vph) * 0.015), 18px) 0; border-bottom: 1px solid var(--line); }
.pillars li span { font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .18em; color: var(--accent); min-width: 2.4em; }
.pillars li strong { font-family: ${t.fontDisplay}; font-weight: 600; font-size: clamp(.92rem, calc(var(--vpw) * 0.0135), 1.22rem); letter-spacing: .02em; text-transform: uppercase; }

/* 04 SERVICES */
.s-services { padding-right: calc(var(--gut) * .5); flex-direction: column; align-items: stretch; justify-content: center; gap: clamp(18px, calc(var(--vph) * 0.03), 40px); }
.svc-head { display: flex; gap: 18px; align-items: baseline; flex: 0 0 auto; }
.panels { display: flex; gap: clamp(10px, calc(var(--vpw) * 0.012), 20px); width: 100%; flex: 1 1 auto; max-height: min(calc(var(--vph) * 0.7), 740px); align-items: stretch; }
.panel {
  position: relative; flex: 1 1 0; min-width: 0; overflow: hidden; border-radius: var(--radius);
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: clamp(18px, calc(var(--vpw) * 0.02), 34px);
  transition: flex-grow 1s var(--ease); color: var(--paper);
}
.panel .plate { position: absolute; inset: 0; z-index: 0; }
.panel .plate::after { background: linear-gradient(180deg, ${withAlpha(c.ink, 0.25)}, ${withAlpha(c.ink, 0.82)}); }
.panel > * { position: relative; z-index: 3; }
.panel .n { font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .2em; color: var(--accent); margin-bottom: auto; }
.panel h3 { font-size: clamp(1.35rem, calc(var(--vpw) * 0.021), 2.4rem); transition: transform .9s var(--ease); }
.panel p { margin-top: 14px; max-width: 30ch; color: var(--paper-dim); font-size: calc(var(--body) * .94); opacity: 0; transform: translate3d(0, 14px, 0); transition: opacity .8s var(--ease), transform .8s var(--ease); }
.panel .arw { position: absolute; top: clamp(18px, calc(var(--vpw) * 0.02), 34px); right: clamp(18px, calc(var(--vpw) * 0.02), 34px); z-index: 3; font-size: 1.1rem; color: var(--paper); transition: transform .7s var(--ease); }
@media (hover: hover) {
  .panels:hover .panel { flex-grow: .86; }
  .panels .panel:hover { flex-grow: 1.6; }
  .panel:hover h3 { transform: translate3d(0, -6px, 0); }
  .panel:hover p { opacity: 1; transform: none; }
  .panel:hover .arw { transform: translate3d(8px, -8px, 0); }
}
.panel:focus-within p { opacity: 1; transform: none; }

/* 05 THE PROCESS */
.s-process { align-items: center; padding-top: calc(var(--gut) * 2); }
.collage { position: relative; width: 100%; height: 100%; }
.collage h2 { position: absolute; left: 0; top: 30%; font-size: var(--h-1); z-index: 4; mix-blend-mode: difference; }
.collage figure { position: absolute; }
.collage .tag { position: absolute; z-index: 5; max-width: 26ch; }

/* 06 RESULTS */
.s-results { align-items: center; }
.quotes { display: flex; gap: clamp(50px, calc(var(--vpw) * 0.08), 150px); align-items: stretch; height: 100%; padding-top: clamp(40px, calc(var(--vph) * 0.07), 90px); }
.quote { display: flex; flex-direction: column; justify-content: center; max-width: min(calc(var(--vpw) * 0.46), 620px); position: relative; }
.quote .mark { font-family: ${t.fontSerif}; font-size: clamp(6rem, calc(var(--vpw) * 0.13), 16rem); line-height: .6; color: var(--accent); opacity: .28; margin-bottom: -.12em; }
.quote blockquote { font-family: ${t.fontDisplay}; font-weight: 700; letter-spacing: -.035em; line-height: .98; font-size: clamp(1.6rem, calc(var(--vpw) * 0.033), 3.4rem); text-transform: uppercase; }
.quote--lead blockquote { font-size: clamp(2rem, calc(var(--vpw) * 0.046), 4.8rem); }
.quote figcaption { margin-top: clamp(20px, calc(var(--vph) * 0.03), 38px); border-top: 1px solid var(--line); padding-top: 16px; }
.quote figcaption b { display: block; font-family: ${t.fontDisplay}; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; font-size: .95rem; }
.quote figcaption span { display: block; margin-top: 6px; }

/* 07 GALLERY */
.s-gallery { align-items: center; padding-top: calc(var(--gut) * 2); }
.gal { position: relative; width: 100%; height: 100%; }
.gal figure { position: absolute; }
.gal .lead { position: absolute; max-width: 22ch; z-index: 4; }

/* 08 STATEMENT */
.s-statement { background: var(--ink); justify-content: center; text-align: center; }
.s-statement .wrap { display: flex; flex-direction: column; align-items: center; gap: clamp(26px, calc(var(--vph) * 0.04), 54px); }
.s-statement h2 { font-size: clamp(3rem, calc(var(--vpw) * 0.105), 11rem); line-height: .82; }
.s-statement .lines { color: var(--paper-dim); max-width: 34ch; line-height: 1.8; }
.s-statement .rule { width: 1px; height: clamp(40px, calc(var(--vph) * 0.07), 90px); background: var(--accent); opacity: .6; }

/* 09 CTA */
.s-cta { padding: 0; align-items: stretch; }
.s-cta .plate { position: absolute; inset: 0 -10%; }
.s-cta .plate::after { background: linear-gradient(90deg, ${withAlpha(c.ink, 0.82)} 0%, ${withAlpha(c.ink, 0.34)} 60%, ${withAlpha(c.ink, 0.6)} 100%); }
.cta-inner { position: relative; z-index: 5; display: flex; flex-direction: column; justify-content: center; gap: clamp(24px, calc(var(--vph) * 0.036), 48px); padding: var(--gut); width: 100%; }
.s-cta h2 { font-size: var(--h-1); }
.btns { display: flex; flex-wrap: wrap; gap: clamp(12px, calc(var(--vpw) * 0.016), 22px); align-items: center; }
.btn {
  position: relative; display: inline-flex; align-items: center; gap: 14px;
  min-height: 56px; padding: 0 clamp(22px, calc(var(--vpw) * 0.024), 36px);
  font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .22em; text-transform: uppercase;
  border: 1px solid var(--paper); color: var(--paper);
  border-radius: var(--radius-s); overflow: hidden;
  transition: color .6s var(--ease), border-color .6s var(--ease);
  will-change: transform;
}
.btn i { display: inline-block; font-style: normal; transition: transform .6s var(--ease); }
.btn::before { content: ""; position: absolute; inset: 0; background: var(--paper); z-index: 0; transform: translate3d(0, 101%, 0); transition: transform .7s var(--ease); }
.btn > * { position: relative; z-index: 1; }
.btn--solid { background: var(--accent); border-color: var(--accent); color: var(--ink); }
@media (hover: hover) {
  .btn:hover { color: var(--ink); border-color: var(--paper); }
  .btn:hover::before { transform: none; }
  .btn:hover i { transform: translate3d(7px, 0, 0); }
}
.btn:focus-visible { color: var(--ink); }
.btn:focus-visible::before { transform: none; }

/* 10 FOOTER */
.s-footer { align-items: flex-end; background: var(--char); }
.foot { display: flex; flex-direction: column; gap: clamp(24px, calc(var(--vph) * 0.04), 54px); width: 100%; }
.foot h2 { font-size: clamp(2.2rem, calc(var(--vpw) * 0.056), 6rem); }
.foot .rows { display: flex; flex-wrap: wrap; gap: clamp(26px, calc(var(--vpw) * 0.05), 90px); align-items: flex-end; justify-content: space-between; border-top: 1px solid var(--line); padding-top: clamp(20px, calc(var(--vph) * 0.03), 34px); }
.foot .rows a { position: relative; }
.foot .rows a::after { content: ""; position: absolute; left: 0; bottom: -4px; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: 100% 50%; transition: transform .6s var(--ease); }
@media (hover: hover) { .foot .rows a:hover::after { transform: scaleX(1); transform-origin: 0 50%; } }
.foot dl { display: flex; flex-direction: column; gap: 8px; }
.foot dt { font-size: var(--micro); letter-spacing: .22em; text-transform: uppercase; color: var(--smoke); }
.foot dd { font-family: ${t.fontDisplay}; font-weight: 500; letter-spacing: .02em; }

/* --- full-screen menu --------------------------------------------- */
.overlay {
  position: absolute; inset: 0; z-index: 60; background: var(--ink);
  display: grid; grid-template-columns: 1.1fr .9fr;
  clip-path: inset(0 0 0 100%);
  transition: clip-path 1s var(--ease-io);
}
.overlay.open { clip-path: inset(0 0 0 0); }
.overlay .nav-side { display: flex; flex-direction: column; justify-content: center; padding: var(--gut); gap: clamp(4px, calc(var(--vph) * 0.01), 10px); }
.overlay ul { list-style: none; }
.overlay li { overflow: hidden; }
.overlay li button {
  display: flex; align-items: baseline; gap: clamp(14px, calc(var(--vpw) * 0.02), 30px);
  font-family: ${t.fontDisplay}; font-weight: 800; letter-spacing: -.04em; text-transform: uppercase;
  font-size: clamp(2rem, calc(var(--vpw) * 0.062), 5.4rem); line-height: 1.06; color: var(--paper);
  transform: translate3d(0, 105%, 0); opacity: 0; text-align: left;
  transition: transform .9s var(--ease), opacity .9s var(--ease), color .5s var(--ease);
  transition-delay: calc(var(--i, 0) * 60ms);
}
.overlay.open li button { transform: none; opacity: 1; }
.overlay li button em { font-style: normal; font-size: var(--micro); letter-spacing: .2em; color: var(--accent); font-weight: 600; }
@media (hover: hover) {
  .overlay ul:hover li button { color: ${withAlpha(c.paper, 0.32)}; }
  .overlay ul li button:hover { color: var(--paper); }
}
.overlay .preview { position: relative; overflow: hidden; margin: var(--gut) var(--gut) var(--gut) 0; border: 1px solid var(--line); border-radius: var(--radius); }
.overlay .preview .plate { position: absolute; inset: 0; opacity: 0; transition: opacity .8s var(--ease); }
.overlay .preview .plate.on { opacity: 1; }
.overlay .foot-note { display: flex; gap: clamp(18px, calc(var(--vpw) * 0.03), 46px); margin-top: clamp(28px, calc(var(--vph) * 0.05), 60px); flex-wrap: wrap; }
.overlay .close { position: absolute; top: clamp(18px, calc(var(--vpw) * 0.024), 34px); right: var(--gut); z-index: 3; font-family: ${t.fontDisplay}; font-weight: 600; font-size: var(--micro); letter-spacing: .28em; text-transform: uppercase; }

/* --- cursor -------------------------------------------------------- */
.cursor, .cursor-dot { position: absolute; top: 0; left: 0; z-index: 70; pointer-events: none; border-radius: 50%; opacity: 0; transition: opacity .4s var(--ease), width .5s var(--ease), height .5s var(--ease), background-color .5s var(--ease); }
.cursor { width: 38px; height: 38px; border: 1px solid ${withAlpha(c.paper, 0.55)}; display: grid; place-items: center; font-family: ${t.fontDisplay}; font-weight: 600; font-size: .52rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink); margin: -19px 0 0 -19px; mix-blend-mode: difference; }
.cursor span { opacity: 0; transition: opacity .35s var(--ease); }
.cursor-dot { width: 5px; height: 5px; background: var(--paper); margin: -2.5px 0 0 -2.5px; mix-blend-mode: difference; }
.cursor.live, .cursor-dot.live { opacity: 1; }
.cursor.big { width: 88px; height: 88px; margin: -44px 0 0 -44px; background: var(--paper); border-color: transparent; }
.cursor.big span { opacity: 1; }
.cursor.big + .cursor-dot { opacity: 0; }
@media (hover: none), (pointer: coarse) { .cursor, .cursor-dot { display: none; } }
.has-cursor .scroller, .has-cursor .scroller * { cursor: none; }

/* --- breakpoints follow the component, not the window -------------- */
.${ROOT}.w-md .overlay { grid-template-columns: 1fr; }
.${ROOT}.w-md .overlay .preview { display: none; }
.${ROOT}.w-md .s-philosophy .grid { grid-template-columns: 1fr .8fr; gap: 28px; }
.${ROOT}.w-md .s-about .plate { width: 62%; }
.${ROOT}.w-md .s-about .float { width: min(calc(var(--vpw) * 0.62), 540px); }

.${ROOT}.w-sm .sec { padding: calc(var(--gut) * 3.2) var(--gut) calc(var(--gut) * 3); }
.${ROOT}.w-sm .s-philosophy { padding-right: var(--gut); }
.${ROOT}.w-sm .micro, .${ROOT}.w-sm .hud .count, .${ROOT}.w-sm .idx { letter-spacing: .14em; overflow-wrap: anywhere; }
.${ROOT}.w-sm .s-philosophy .grid { grid-template-columns: 1fr; grid-auto-rows: min-content; align-content: center; gap: 24px; }
.${ROOT}.w-sm .s-philosophy .plate { height: calc(var(--vph) * 0.34); }
.${ROOT}.w-sm .s-about { padding: 0; }
.${ROOT}.w-sm .s-about .plate { width: 100%; right: 0; opacity: .5; }
.${ROOT}.w-sm .s-about .float { width: calc(var(--vpw) - var(--gut) * 2); margin: 0 var(--gut); background: ${withAlpha(c.ink, 0.62)}; }
.${ROOT}.w-sm .panels { max-height: calc(var(--vph) * 0.64); gap: 8px; }
.${ROOT}.w-sm .panel { flex: 0 0 calc(var(--vpw) * 0.72); padding: 20px; }
.${ROOT}.w-sm .panel p { opacity: 1; transform: none; }
.${ROOT}.w-sm .quotes { gap: 56px; }
.${ROOT}.w-sm .quote { max-width: calc(var(--vpw) * 0.78); }
.${ROOT}.w-sm .hero-side, .${ROOT}.w-sm .hint { display: none; }
.${ROOT}.w-sm .btn { width: 100%; justify-content: space-between; }
.${ROOT}.w-sm .btns { width: min(100%, 420px); }
.${ROOT}.w-xs .hud .label { display: none; }
.${ROOT}.w-short { --h-hero: clamp(1.9rem, calc(var(--vpw) * 0.064), 3.4rem); --h-1: clamp(1.7rem, calc(var(--vpw) * 0.056), 3rem); }
.${ROOT}.w-short .sec { padding: calc(var(--gut) * 1.9) var(--gut) calc(var(--gut) * 2.1); }
.${ROOT}.w-short .hud .label, .${ROOT}.w-short .lifter .cap { display: none; }
.${ROOT}.w-short .lifter svg { width: 64px; }

/* --- reduced motion ------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  .${ROOT} *, .${ROOT} *::before, .${ROOT} *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .grain { display: none; }
  .rv, .fade { opacity: 1; transform: none; }
  .rv-clip { clip-path: none; }
  .w > i { transform: none; }
  .plate img, .plate video { opacity: 1; transform: none; }
  .cursor, .cursor-dot { display: none; }
}
`

/* ------------------------------------------------------------------ */
/* Hooks and small parts                                               */
/* ------------------------------------------------------------------ */

const useIsomorphicLayoutEffect =
    typeof document !== "undefined" ? useLayoutEffect : useEffect

/**
 * The component measures itself: a Framer frame is rarely the window, so
 * breakpoints and every "viewport" unit come from this box, not from vw/vh.
 */
function useBox(ref) {
    const [box, setBox] = useState({ w: 1440, h: 900, cls: "" })

    useIsomorphicLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        const apply = (w, h) => {
            if (!w || !h) return
            const classes = []
            if (w <= 1100) classes.push("w-md")
            if (w <= 820) classes.push("w-sm")
            if (w <= 520) classes.push("w-xs")
            if (h <= 560) classes.push("w-short")
            const cls = classes.join(" ")
            setBox((prev) =>
                prev.w === w && prev.h === h && prev.cls === cls
                    ? prev
                    : { w, h, cls }
            )
        }

        apply(el.offsetWidth, el.offsetHeight)
        if (typeof ResizeObserver === "undefined") {
            const onResize = () => apply(el.offsetWidth, el.offsetHeight)
            window.addEventListener("resize", onResize)
            return () => window.removeEventListener("resize", onResize)
        }
        const observer = new ResizeObserver(() =>
            apply(el.offsetWidth, el.offsetHeight)
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    return box
}

/** Image or video in one slot; video wins, and a video URL in the image field works too. */
function Media({ image, video, alt }) {
    const src =
        video ||
        (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(image || "") ? image : null)
    if (src) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                aria-label={alt || ""}
            />
        )
    }
    if (!image) return null
    return <img src={image} alt={alt || ""} loading="lazy" decoding="async" />
}

/** A photograph in its frame: the cinematic fallback shows until one loads. */
function Plate({
    image,
    video,
    alt,
    caption,
    tone = "",
    className = "",
    style,
    speed,
    delay,
    zoom = true,
    bleed = false,
    reveal = true,
}) {
    const cls = [
        "plate",
        tone,
        bleed ? "bleed" : "",
        zoom ? "zoom" : "",
        reveal ? "rv-clip" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")
    return (
        <figure
            className={cls}
            style={{ ...(style || {}), ...(delay ? { "--d": delay } : {}) }}
            data-px={speed}
        >
            <Media image={image} video={video} alt={alt} />
            {caption ? <figcaption className="caption">{caption}</figcaption> : null}
        </figure>
    )
}

/** Headline split into words, each clipped by its own box. */
function Split({ text, tag: Tag = "h2", className = "", delay, style, speed }) {
    const parts = String(text || "").split(/\n/)
    let index = 0
    return (
        <Tag
            className={`split ${className}`.trim()}
            style={{ ...(style || {}), ...(delay ? { "--d": delay } : {}) }}
            data-px={speed}
        >
            {parts.map((line, li) => (
                <React.Fragment key={li}>
                    {li > 0 ? <br /> : null}
                    {line
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((word, wi) => (
                            <React.Fragment key={`${li}-${wi}`}>
                                <span className="w">
                                    <i style={{ "--i": index++ }}>{word}</i>
                                </span>{" "}
                            </React.Fragment>
                        ))}
                </React.Fragment>
            ))}
        </Tag>
    )
}

/* ------------------------------------------------------------------ */
/* The lifter: three key poses, blended by scroll progress             */
/* ------------------------------------------------------------------ */

const POSE = [
    {
        ankle: [60, 101], knee: [70, 81], hip: [50, 74.5], shoulder: [71.7, 63],
        head: [80.4, 55.8], elbow: [73, 78.5], wrist: [72, 94],
    },
    {
        ankle: [60, 101], knee: [64.8, 79.5], hip: [48.3, 66.7], shoulder: [66, 49],
        head: [72.8, 40.6], elbow: [68.5, 64], wrist: [69, 79],
    },
    {
        ankle: [60, 101], knee: [60, 79], hip: [58.5, 58], shoulder: [60, 34.5],
        head: [58.4, 24], elbow: [64.5, 49], wrist: [68, 64],
    },
]
const JOINTS = ["ankle", "knee", "hip", "shoulder", "head", "elbow", "wrist"]
const FAR_X = -1.8
const FAR_Y = 1.6

function Lifter({ caption }) {
    return (
        <div className="lifter">
            <svg viewBox="0 0 140 118" role="presentation" focusable="false">
                <ellipse className="contact" data-lf="contact" cx="72" cy="105.4" rx="10" ry="2.1" />
                <line className="ground" x1="8" y1="104.6" x2="132" y2="104.6" />
                <g className="far">
                    <line className="thigh" data-lf="farThigh" />
                    <line className="shin" data-lf="farShin" />
                    <line className="foot" data-lf="farFoot" />
                    <line className="upper" data-lf="farUpper" />
                    <line className="fore" data-lf="farFore" />
                </g>
                <g className="near">
                    <line className="thigh" data-lf="thigh" />
                    <line className="shin" data-lf="shin" />
                    <line className="foot" data-lf="foot" />
                    <line className="pelvis" data-lf="pelvis" />
                    <line className="chest" data-lf="chest" />
                    <line className="neck" data-lf="neck" />
                    <circle className="head" data-lf="head" r="5.9" />
                    <line className="upper" data-lf="upper" />
                    <line className="fore" data-lf="fore" />
                </g>
                <g className="matte">
                    <circle className="disc" data-lf="mdisc" r="11.7" />
                </g>
                <g className="load">
                    <circle className="disc" data-lf="disc" r="10" />
                    <circle className="collar" data-lf="collar" r="2.4" />
                </g>
                <circle className="hand" data-lf="hand" r="3" />
            </svg>
            {caption ? <span className="cap">{caption}</span> : null}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* The scroll engine                                                   */
/* ------------------------------------------------------------------ */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

/**
 * Wheel, keys and touch move the canvas horizontally; the same frame loop
 * drives parallax, the reveals, the progress line and the lifter.
 *
 * Reveals are measured rather than observed: an element mid clip-path reveal
 * reports a zero-area box, which stops IntersectionObserver from ever firing
 * for it.
 */
function useEngine(rootRef, apiRef, motionRef, layoutKey) {
    useEffect(() => {
        const motion = motionRef.current || {}
        const root = rootRef.current
        if (!root) return
        const scroller = root.querySelector(".scroller")
        if (!scroller) return

        const sections = Array.prototype.slice.call(
            scroller.querySelectorAll(".sec")
        )
        if (!sections.length) return

        const reduced =
            typeof window !== "undefined" && window.matchMedia
                ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
                : false
        const smooth = motion.smooth !== false && !reduced

        const hud = {
            num: root.querySelector('[data-hud="num"]'),
            total: root.querySelector('[data-hud="total"]'),
            label: root.querySelector('[data-hud="label"]'),
            bar: root.querySelector('[data-hud="bar"]'),
        }
        const hint = root.querySelector(".hint")
        const lifterBox = root.querySelector(".lifter")
        const lf = {}
        Array.prototype.forEach.call(
            root.querySelectorAll("[data-lf]"),
            (el) => {
                lf[el.getAttribute("data-lf")] = el
            }
        )

        if (hud.total) hud.total.textContent = pad(sections.length)

        /* ---- photographs fade in once they decode ------------------ */
        const media = Array.prototype.slice.call(
            root.querySelectorAll(".plate img")
        )
        const onLoad = (e) => e.target.classList.add("loaded")
        const onError = (e) => {
            e.target.style.display = "none"
        }
        media.forEach((img) => {
            if (img.complete && img.naturalWidth) img.classList.add("loaded")
            else {
                img.addEventListener("load", onLoad)
                img.addEventListener("error", onError)
            }
        })

        /* ---- measured reveals and parallax ------------------------- */
        const parallax = Array.prototype.slice
            .call(root.querySelectorAll("[data-px]"))
            .map((el) => ({
                el,
                speed: parseFloat(el.getAttribute("data-px")) || 0,
                base: 0,
                w: 0,
            }))
        const animated = Array.prototype.slice.call(
            root.querySelectorAll(".rv, .fade, .rv-clip, .split")
        )
        let revealQueue = []

        const pxScale = () =>
            (motion.parallax === false ? 0 : motion.parallaxAmount ?? 1) *
            (root.offsetWidth < 820 ? 0.4 : 1)

        function measure() {
            const sl = scroller.scrollLeft
            parallax.forEach((p) => {
                p.el.style.transform = ""
                const r = p.el.getBoundingClientRect()
                p.base = r.left + sl
                p.w = r.width
            })
            revealQueue = animated
                .filter((el) => !el.classList.contains("is-in"))
                .map((el) => ({
                    el,
                    x: el.getBoundingClientRect().left + sl,
                }))
            check()
            paint()
        }

        function check() {
            const sl = scroller.scrollLeft
            const vw = scroller.clientWidth
            for (let i = revealQueue.length - 1; i >= 0; i--) {
                if (revealQueue[i].x < sl + vw * 0.94) {
                    revealQueue[i].el.classList.add("is-in")
                    revealQueue.splice(i, 1)
                }
            }
        }

        function paint() {
            if (reduced) return
            const scale = pxScale()
            if (!scale) return
            const sl = scroller.scrollLeft
            const vw = scroller.clientWidth
            const half = vw / 2
            for (let i = 0; i < parallax.length; i++) {
                const p = parallax[i]
                const centre = p.base + p.w / 2 - sl
                if (centre < -vw || centre > vw * 2) continue
                p.el.style.transform = `translate3d(${(
                    (centre - half) *
                    p.speed *
                    scale
                ).toFixed(2)}px,0,0)`
            }
        }

        /* ---- the lifter -------------------------------------------- */
        const blend = (a, b, e) => [
            a[0] + (b[0] - a[0]) * e,
            a[1] + (b[1] - a[1]) * e,
        ]
        const setLine = (el, a, b, dx, dy) => {
            if (!el) return
            el.setAttribute("x1", (a[0] + dx).toFixed(1))
            el.setAttribute("y1", (a[1] + dy).toFixed(1))
            el.setAttribute("x2", (b[0] + dx).toFixed(1))
            el.setAttribute("y2", (b[1] + dy).toFixed(1))
        }

        function drawLift(p) {
            if (!lf.chest) return
            // One eased curve across both segments: the bar answers the first
            // turn of the wheel, then decelerates into lockout.
            const u = 1 - Math.pow(1 - p, 1.35)
            const seg = u < 0.5 ? 0 : 1
            const t = seg === 0 ? u / 0.5 : (u - 0.5) / 0.5
            const A = POSE[seg]
            const B = POSE[seg + 1]
            const j = {}
            for (const name of JOINTS) j[name] = blend(A[name], B[name], t)

            const foot = [
                [j.ankle[0] - 3, 102.4],
                [j.ankle[0] + 7.5, 102.4],
            ]
            setLine(lf.farThigh, j.hip, j.knee, FAR_X, FAR_Y)
            setLine(lf.farShin, j.knee, j.ankle, FAR_X, FAR_Y)
            setLine(lf.farFoot, foot[0], foot[1], FAR_X, FAR_Y * 0.4)
            setLine(lf.farUpper, j.shoulder, j.elbow, FAR_X, FAR_Y)
            setLine(lf.farFore, j.elbow, j.wrist, FAR_X, FAR_Y)
            setLine(lf.thigh, j.hip, j.knee, 0, 0)
            setLine(lf.shin, j.knee, j.ankle, 0, 0)
            setLine(lf.foot, foot[0], foot[1], 0, 0)
            const mid = blend(j.hip, j.shoulder, 0.52)
            setLine(lf.pelvis, j.hip, mid, 0, 0)
            setLine(lf.chest, mid, j.shoulder, 0, 0)
            setLine(lf.neck, j.shoulder, j.head, 0, 0)
            setLine(lf.upper, j.shoulder, j.elbow, 0, 0)
            setLine(lf.fore, j.elbow, j.wrist, 0, 0)
            if (lf.head) {
                lf.head.setAttribute("cx", j.head[0].toFixed(1))
                lf.head.setAttribute("cy", j.head[1].toFixed(1))
            }
            const centre = {
                cx: j.wrist[0].toFixed(1),
                cy: j.wrist[1].toFixed(1),
            }
            ;[lf.mdisc, lf.disc, lf.collar, lf.hand].forEach((el) => {
                if (!el) return
                el.setAttribute("cx", centre.cx)
                el.setAttribute("cy", centre.cy)
            })
            if (lf.contact) {
                lf.contact.setAttribute("cx", centre.cx)
                lf.contact.setAttribute("rx", (10 - p * 3).toFixed(1))
                lf.contact.setAttribute(
                    "opacity",
                    (0.2 * Math.max(0, 1 - p * 3.2)).toFixed(3)
                )
            }
            if (lifterBox) lifterBox.classList.toggle("moved", p > 0.004)
            if (hint) hint.style.opacity = p > 0.004 ? "0" : ""
        }

        /* The figure follows with a little inertia of its own, on its own
           frame loop, so it keeps moving where scroll events are throttled. */
        let liftTarget = 0
        let liftShown = 0
        let liftRAF = 0
        function liftLoop() {
            const d = liftTarget - liftShown
            if (Math.abs(d) < 0.0004) {
                liftShown = liftTarget
                drawLift(liftShown)
                liftRAF = 0
                return
            }
            liftShown += d * (reduced ? 1 : 0.16)
            drawLift(liftShown)
            liftRAF = requestAnimationFrame(liftLoop)
        }
        function setLift(p) {
            liftTarget = clamp(p, 0, 1)
            if (!liftRAF) liftRAF = requestAnimationFrame(liftLoop)
        }
        drawLift(0)

        /* ---- smoothing --------------------------------------------- */
        const maxScroll = () => scroller.scrollWidth - scroller.clientWidth
        let target = scroller.scrollLeft
        let current = target
        let running = false
        let touching = false
        let settleTimer = null

        function frame() {
            const diff = target - current
            if (Math.abs(diff) < 0.4) {
                current = target
                scroller.scrollLeft = Math.round(current)
                running = false
                return
            }
            current += diff * 0.11
            scroller.scrollLeft = current
            running = true
            requestAnimationFrame(frame)
        }
        function run() {
            if (!running) {
                running = true
                requestAnimationFrame(frame)
            }
        }
        function scrollTo(x, instant) {
            target = clamp(x, 0, maxScroll())
            if (instant || !smooth) {
                current = target
                scroller.scrollLeft = target
            } else run()
        }

        function sectionAt(x) {
            const mid = x + scroller.clientWidth / 2
            let found = sections[0]
            sections.forEach((s) => {
                if (s.offsetLeft <= mid) found = s
            })
            return found
        }

        function settle() {
            if (touching || !smooth || motion.snap === false) return
            const vw = scroller.clientWidth
            let best = null
            let bestD = Infinity
            sections.forEach((s) => {
                const d = Math.abs(s.offsetLeft - target)
                if (d < bestD) {
                    bestD = d
                    best = s
                }
            })
            // Only pulls when the reader already stopped near an edge, so
            // browsing never turns into a slideshow.
            if (best && bestD < vw * 0.22) scrollTo(best.offsetLeft)
        }

        const onWheel = (e) => {
            if (!smooth || touching || e.ctrlKey) return
            let d =
                Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
            if (e.deltaMode === 1) d *= 18
            else if (e.deltaMode === 2) d *= scroller.clientWidth
            e.preventDefault()
            target = clamp(target + d, 0, maxScroll())
            run()
            clearTimeout(settleTimer)
            settleTimer = setTimeout(settle, 170)
        }
        const onTouchStart = () => {
            touching = true
            running = false
        }
        const onTouchEnd = () => {
            touching = false
            target = current = scroller.scrollLeft
        }

        let ticking = false
        const onScroll = () => {
            if (!running) target = current = scroller.scrollLeft
            if (ticking) return
            ticking = true
            requestAnimationFrame(() => {
                ticking = false
                const m = maxScroll()
                const p = m > 0 ? scroller.scrollLeft / m : 0
                if (hud.bar) hud.bar.style.transform = `scaleX(${p.toFixed(4)})`
                const s = sectionAt(scroller.scrollLeft)
                const i = sections.indexOf(s) + 1
                if (hud.num && hud.num.textContent !== pad(i))
                    hud.num.textContent = pad(i)
                const label = s.getAttribute("data-label") || ""
                if (hud.label && hud.label.textContent !== label)
                    hud.label.textContent = label
                setLift(p)
                check()
                paint()
            })
        }

        function step(dir) {
            const vw = scroller.clientWidth
            const cur = sectionAt(target)
            const i = sections.indexOf(cur)
            if (cur.offsetWidth > vw * 1.25) {
                // Inside a wide editorial section, move by a screen at a time.
                let next = target + dir * vw * 0.9
                const edge =
                    dir > 0 ? cur.offsetLeft + cur.offsetWidth : cur.offsetLeft
                if (dir > 0 && next > edge - vw * 0.15) next = edge
                if (dir < 0 && next < cur.offsetLeft + vw * 0.15)
                    next = sections[Math.max(0, i - 1)].offsetLeft
                scrollTo(next)
                return
            }
            scrollTo(sections[clamp(i + dir, 0, sections.length - 1)].offsetLeft)
        }

        /* Keys act only while the component has the reader's attention, so a
           Framer page with other content keeps its own keyboard behaviour. */
        let engaged = false
        const onEnter = () => {
            engaged = true
        }
        const onLeave = () => {
            engaged = false
        }
        const onMove = () => {
            if (!engaged) engaged = true
        }
        const editable = (el) =>
            !!el &&
            (["input", "textarea", "select"].indexOf(
                (el.tagName || "").toLowerCase()
            ) > -1 ||
                el.isContentEditable)
        const onKey = (e) => {
            // Someone typing in a form on the same page keeps their arrow keys.
            if (editable(e.target) || editable(document.activeElement)) return
            if (!engaged && !root.contains(document.activeElement)) return
            if (root.querySelector(".overlay.open")) return
            switch (e.key) {
                case "ArrowRight":
                case "PageDown":
                    e.preventDefault()
                    step(1)
                    break
                case "ArrowLeft":
                case "PageUp":
                    e.preventDefault()
                    step(-1)
                    break
                case "Home":
                    e.preventDefault()
                    scrollTo(0)
                    break
                case "End":
                    e.preventDefault()
                    scrollTo(maxScroll())
                    break
            }
        }
        const onFocusIn = () => {
            requestAnimationFrame(() => {
                if (running) return
                target = current = scroller.scrollLeft
            })
        }

        scroller.addEventListener("wheel", onWheel, { passive: false })
        scroller.addEventListener("touchstart", onTouchStart, { passive: true })
        scroller.addEventListener("touchend", onTouchEnd, { passive: true })
        scroller.addEventListener("scroll", onScroll, { passive: true })
        root.addEventListener("mouseenter", onEnter)
        root.addEventListener("mousemove", onMove, { passive: true })
        root.addEventListener("mouseleave", onLeave)
        root.addEventListener("focusin", onFocusIn)
        window.addEventListener("keydown", onKey)

        const onResize = () => {
            measure()
            onScroll()
        }
        let ro
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(onResize)
            ro.observe(root)
        } else {
            window.addEventListener("resize", onResize)
        }

        // Hero is already on stage, so it reveals without waiting to be reached.
        Array.prototype.forEach.call(
            root.querySelectorAll(
                ".s-hero .rv, .s-hero .fade, .s-hero .rv-clip, .s-hero .split"
            ),
            (el) => el.classList.add("is-in")
        )
        measure()
        onScroll()
        if (document.fonts && document.fonts.ready)
            document.fonts.ready.then(measure).catch(() => {})

        apiRef.current = {
            goto(index) {
                const s = sections[clamp(index, 0, sections.length - 1)]
                if (s) requestAnimationFrame(() => scrollTo(s.offsetLeft))
            },
            gotoId(id) {
                const s = sections.find((el) => el.getAttribute("data-id") === id)
                if (s) requestAnimationFrame(() => scrollTo(s.offsetLeft))
            },
        }

        return () => {
            scroller.removeEventListener("wheel", onWheel)
            scroller.removeEventListener("touchstart", onTouchStart)
            scroller.removeEventListener("touchend", onTouchEnd)
            scroller.removeEventListener("scroll", onScroll)
            root.removeEventListener("mouseenter", onEnter)
            root.removeEventListener("mousemove", onMove)
            root.removeEventListener("mouseleave", onLeave)
            root.removeEventListener("focusin", onFocusIn)
            window.removeEventListener("keydown", onKey)
            window.removeEventListener("resize", onResize)
            media.forEach((img) => {
                img.removeEventListener("load", onLoad)
                img.removeEventListener("error", onError)
            })
            if (ro) ro.disconnect()
            if (liftRAF) cancelAnimationFrame(liftRAF)
            clearTimeout(settleTimer)
            apiRef.current = null
        }
    }, [rootRef, apiRef, motionRef, layoutKey])
}

const pad = (n) => (n < 10 ? "0" : "") + n

/** The custom cursor lives inside the component, so it never escapes its frame. */
function useCursor(rootRef, enabled) {
    useEffect(() => {
        const root = rootRef.current
        if (!root || !enabled) return
        if (
            typeof window === "undefined" ||
            !window.matchMedia ||
            !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return

        const ring = root.querySelector(".cursor")
        const dot = root.querySelector(".cursor-dot")
        const label = root.querySelector(".cursor span")
        if (!ring || !dot) return
        root.classList.add("has-cursor")

        let mx = 0
        let my = 0
        let cx = 0
        let cy = 0
        let dx = 0
        let dy = 0
        let raf = 0

        const move = (e) => {
            const r = root.getBoundingClientRect()
            mx = e.clientX - r.left
            my = e.clientY - r.top
            ring.classList.add("live")
            dot.classList.add("live")
            if (!raf) raf = requestAnimationFrame(loop)
        }
        const leave = () => {
            ring.classList.remove("live")
            dot.classList.remove("live")
        }
        function loop() {
            cx += (mx - cx) * 0.14
            cy += (my - cy) * 0.14
            dx += (mx - dx) * 0.42
            dy += (my - dy) * 0.42
            ring.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`
            dot.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`
            raf = requestAnimationFrame(loop)
        }
        const over = (e) => {
            const t = e.target
            const act = t.closest ? t.closest("a, button") : null
            const img = t.closest ? t.closest(".plate") : null
            if (act) {
                if (label)
                    label.textContent = act.closest(".overlay") ? "Go" : "Open"
                ring.classList.add("big")
            } else if (img) {
                if (label) label.textContent = "View"
                ring.classList.add("big")
            } else {
                ring.classList.remove("big")
            }
        }

        root.addEventListener("mousemove", move)
        root.addEventListener("mouseleave", leave)
        root.addEventListener("mouseover", over)
        return () => {
            root.classList.remove("has-cursor")
            root.removeEventListener("mousemove", move)
            root.removeEventListener("mouseleave", leave)
            root.removeEventListener("mouseover", over)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [rootRef, enabled])
}

/* ------------------------------------------------------------------ */
/* Editorial slots — where the loose photographs sit on the canvas      */
/* ------------------------------------------------------------------ */

const PROCESS_SLOTS = {
    wide: [
        { l: 26, t: 8, w: 22, h: 52, s: -0.1 },
        { l: 50, t: 34, w: 26, h: 58, s: 0.06 },
        { l: 78, t: 6, w: 18, h: 40, s: -0.14 },
        { l: 99, t: 44, w: 24, h: 46, s: 0.09 },
        { l: 126, t: 12, w: 20, h: 64, s: -0.07 },
    ],
    narrow: [
        { l: 10, t: 8, w: 44, h: 40, s: -0.06 },
        { l: 58, t: 36, w: 52, h: 48, s: 0.05 },
        { l: 116, t: 8, w: 40, h: 38, s: -0.08 },
        { l: 162, t: 40, w: 48, h: 44, s: 0.06 },
        { l: 216, t: 10, w: 44, h: 56, s: -0.05 },
    ],
}
const GALLERY_SLOTS = {
    wide: [
        { l: 0, t: 6, w: 26, h: 80, s: -0.06 },
        { l: 29, t: 30, w: 17, h: 44, s: 0.08 },
        { l: 49, t: 2, w: 30, h: 66, s: -0.11 },
        { l: 82, t: 38, w: 21, h: 52, s: 0.05 },
        { l: 106, t: 8, w: 24, h: 74, s: -0.08 },
        { l: 133, t: 26, w: 18, h: 40, s: 0.1 },
        { l: 154, t: 6, w: 28, h: 78, s: -0.05 },
    ],
    narrow: [
        { l: 0, t: 8, w: 56, h: 56, s: -0.05 },
        { l: 60, t: 34, w: 40, h: 44, s: 0.06 },
        { l: 104, t: 6, w: 62, h: 52, s: -0.07 },
        { l: 170, t: 36, w: 44, h: 48, s: 0.05 },
        { l: 218, t: 8, w: 52, h: 60, s: -0.06 },
        { l: 274, t: 34, w: 38, h: 40, s: 0.08 },
        { l: 316, t: 8, w: 58, h: 62, s: -0.04 },
    ],
}
const TAG_SLOT = { wide: { l: 100, t: 14 }, narrow: { l: 118, t: 56 } }
const LEAD_SLOT = { wide: { l: 29, t: 6 }, narrow: { l: 60, t: 6 } }

/** Slots repeat with an offset, so an array of any length still composes. */
function slotFor(table, index) {
    const base = table[index % table.length]
    const span = table.reduce((m, s) => Math.max(m, s.l + s.w), 0) + 8
    const lap = Math.floor(index / table.length)
    return { ...base, l: base.l + lap * span }
}
const spanOf = (table, count) => {
    let max = 0
    for (let i = 0; i < count; i++) {
        const s = slotFor(table, i)
        max = Math.max(max, s.l + s.w)
    }
    return max
}
const vw = (percent) => `calc(var(--vpw) * ${(percent / 100).toFixed(4)})`
const slotStyle = (s) => ({
    left: vw(s.l),
    top: `${s.t}%`,
    width: vw(s.w),
    height: `${s.h}%`,
})

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
    colors: {
        preset: "midnight",
        ink: "#0A0A0A",
        paper: "#EFEBE4",
        accent: "#C2A47E",
    },
    type: {
        fontDisplay: "'Archivo', Impact, system-ui, sans-serif",
        fontBody: "'Inter', system-ui, -apple-system, sans-serif",
        fontSerif: "'Instrument Serif', Georgia, serif",
        heroSize: 13,
        radius: 12,
        gutter: 76,
        heightMode: "viewport",
        heightPx: 900,
    },
    motion: {
        smooth: true,
        snap: true,
        parallax: true,
        parallaxAmount: 1,
        cursor: true,
        grain: true,
        grainAmount: 5.5,
        indicator: true,
        indicatorCaption: "Scroll",
    },
    nav: {
        brand: "Alex Carter",
        role: "Personal Trainer",
        menuLabel: "Menu",
        closeLabel: "Close",
        email: "hello@example.com",
        location: "London · New York · Dubai",
        instagram: "@alexcarter.training",
    },
    hero: {
        show: true,
        eyebrow: "Personal Training\nPerformance • Strength • Mindset",
        title: "Build your\nstrongest self.",
        accentWord: "strongest",
        paragraph:
            "Strength, performance and body transformation for people who are done starting over. London · New York · Dubai.",
        meta: "Est. 2014 — 400+ clients coached",
        side: "Chapter 01 — The Standard",
        hint: "Scroll",
        image: "",
        video: "",
        label: "Home",
    },
    philosophy: {
        show: true,
        index: "01",
        label: "Philosophy",
        title: "Train with purpose.",
        paragraph:
            "I help ambitious people build strength, confidence and discipline through intelligent, personalised training — not punishment, not guesswork.",
        meta: "Assessment · Programming · Progression",
        image: "",
        caption: "Studio session — Shoreditch",
    },
    about: {
        show: true,
        index: "02",
        label: "About",
        title: "More than\na workout.",
        paragraph:
            "Personal training designed around your body, your goals and your lifestyle. Every block is written for one person, then rewritten as they change.",
        image: "",
    },
    services: { show: true, index: "03", label: "Services" },
    process: {
        show: true,
        index: "04",
        label: "The Process",
        title: "The\nprocess.",
        paragraph:
            "Prepare. Train. Load. Recover. Repeat until it is no longer a project — it is simply how you live.",
    },
    results: { show: true, index: "05", label: "Results" },
    gallery: {
        show: true,
        index: "06",
        label: "Gallery",
        lead: "Eighteen months in the studio, shot as it happened.",
    },
    statement: {
        show: true,
        label: "Statement",
        title: "Your limits\nare not fixed.",
        lines: "Train intelligently.\nMove with intention.\nBecome harder to break.",
    },
    cta: {
        show: true,
        index: "07",
        label: "Contact",
        title: "Ready to start?",
        paragraph:
            "Tell me where you are now and where you want to be. First conversation is free, and honest.",
        primaryLabel: "Book a session",
        primaryHref: "mailto:hello@example.com",
        secondaryLabel: "View training programs",
        secondaryHref: "#services",
        image: "",
        video: "",
    },
    footer: {
        show: true,
        label: "Contact",
        title: "Train with\nAlex Carter.",
        instagramHref: "https://instagram.com/",
        copyright: "© 2026 Alex Carter",
    },
}

const DEFAULT_MENU = [
    { label: "Home", target: "hero", image: "" },
    { label: "About", target: "philosophy", image: "" },
    { label: "Services", target: "services", image: "" },
    { label: "Results", target: "results", image: "" },
    { label: "Gallery", target: "gallery", image: "" },
    { label: "Contact", target: "cta", image: "" },
]
const DEFAULT_PILLARS = [
    { number: "01", label: "Personalised programs" },
    { number: "02", label: "Performance training" },
    { number: "03", label: "Strength & conditioning" },
    { number: "04", label: "Accountability" },
]
const DEFAULT_PANELS = [
    {
        number: "01",
        title: "Personal\ntraining",
        text: "One-to-one sessions in a private studio. Technique, load and recovery managed session by session.",
        image: "",
        href: "#contact",
    },
    {
        number: "02",
        title: "Online\ncoaching",
        text: "A written program, weekly video review and direct access — wherever you train.",
        image: "",
        href: "#contact",
    },
    {
        number: "03",
        title: "Strength &\nconditioning",
        text: "Build a base that holds. Periodised strength work with conditioning that supports it.",
        image: "",
        href: "#contact",
    },
    {
        number: "04",
        title: "Performance\nprograms",
        text: "Sport-specific preparation: power, speed, resilience and a plan for the season.",
        image: "",
        href: "#contact",
    },
]
const DEFAULT_SHOTS = [
    { image: "", caption: "Preparation", bw: false },
    { image: "", caption: "Under the bar", bw: false },
    { image: "", caption: "Chalk", bw: true },
    { image: "", caption: "Recovery", bw: false },
    { image: "", caption: "Twelve weeks on", bw: false },
]
const DEFAULT_GALLERY = [
    { image: "", caption: "The floor, 06:10", bw: false },
    { image: "", caption: "", bw: true },
    { image: "", caption: "Pull day", bw: false },
    { image: "", caption: "", bw: false },
    { image: "", caption: "Conditioning", bw: false },
    { image: "", caption: "", bw: false },
    { image: "", caption: "Coaching the last rep", bw: false },
]
const DEFAULT_QUOTES = [
    {
        quote: "It didn’t just change my body. It changed how I show up.",
        name: "Maya R.",
        detail: "Founder · Strength & confidence · 14 months",
    },
    {
        quote: "Alex writes for the person in front of him. First time training has ever felt built for me.",
        name: "Daniel K.",
        detail: "Surgeon · Back to lifting after injury",
    },
    {
        quote: "Twelve weeks. Nine kilos down, and stronger in every single lift.",
        name: "Priya S.",
        detail: "Body transformation · Dubai",
    },
]

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
 * @framerIntrinsicHeight 900
 * @framerDisableUnlink
 */
export default function CarterSite(props) {
    const rootRef = useRef(null)
    const apiRef = useRef(null)
    const box = useBox(rootRef)
    const narrow = box.w <= 820

    const colors = resolveColors(merge(DEFAULTS.colors, props.colors))
    const type = merge(DEFAULTS.type, props.type)
    const motion = merge(DEFAULTS.motion, props.motion)
    const nav = merge(DEFAULTS.nav, props.nav)
    const hero = merge(DEFAULTS.hero, props.hero)
    const philosophy = merge(DEFAULTS.philosophy, props.philosophy)
    const about = merge(DEFAULTS.about, props.about)
    const services = merge(DEFAULTS.services, props.services)
    const process = merge(DEFAULTS.process, props.process)
    const results = merge(DEFAULTS.results, props.results)
    const gallery = merge(DEFAULTS.gallery, props.gallery)
    const statement = merge(DEFAULTS.statement, props.statement)
    const cta = merge(DEFAULTS.cta, props.cta)
    const footer = merge(DEFAULTS.footer, props.footer)

    const menu = list(nav.items, DEFAULT_MENU)
    const pillars = list(about.pillars, DEFAULT_PILLARS)
    const panels = list(services.panels, DEFAULT_PANELS)
    const shots = list(process.shots, DEFAULT_SHOTS)
    const quotes = list(results.quotes, DEFAULT_QUOTES)
    const gallerySlots = list(gallery.shots, DEFAULT_GALLERY)

    const [menuOpen, setMenuOpen] = useState(false)
    const [menuIn, setMenuIn] = useState(false)
    const [preview, setPreview] = useState(0)

    const css = useMemo(
        () =>
            scopeCSS(
                globalCSS(colors, type) + sectionCSS(colors, type),
                `.${ROOT}`
            ),
        [colors, type]
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

    /* ---- the sections, in order ---------------------------------- */
    const processTable = narrow ? PROCESS_SLOTS.narrow : PROCESS_SLOTS.wide
    const galleryTable = narrow ? GALLERY_SLOTS.narrow : GALLERY_SLOTS.wide
    const tagSlot = narrow ? TAG_SLOT.narrow : TAG_SLOT.wide
    const leadSlot = narrow ? LEAD_SLOT.narrow : LEAD_SLOT.wide

    const sections = []
    const add = (id, label, factor, node) =>
        sections.push({ id, label, factor, node })

    if (hero.show !== false) {
        const title = String(hero.title || "")
        add("hero", hero.label || "Home", 1, (
            <>
                <Plate
                    image={hero.image}
                    video={hero.video}
                    alt={`${nav.brand} — ${hero.label || "hero"}`}
                    className=""
                    bleed
                    speed={-0.06}
                    zoom={false}
                />
                <div className="hero-inner">
                    <p className="micro rv" style={{ "--d": "120ms" }}>
                        {String(hero.eyebrow || "")
                            .split("\n")
                            .map((line, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 ? <br /> : null}
                                    {line}
                                </React.Fragment>
                            ))}
                    </p>
                    <HeroTitle
                        text={title}
                        accentWord={hero.accentWord}
                        delay="180ms"
                    />
                    <div className="hero-meta">
                        <p className="rv" style={{ "--d": "620ms" }}>
                            {hero.paragraph}
                        </p>
                        <p className="micro rv" style={{ "--d": "740ms" }}>
                            {hero.meta}
                        </p>
                    </div>
                </div>
                {hero.side ? (
                    <p className="micro hero-side fade" style={{ "--d": "900ms" }}>
                        {hero.side}
                    </p>
                ) : null}
                {hero.hint ? (
                    <div className="hint rv" style={{ "--d": "1000ms" }} aria-hidden="true">
                        <span className="micro micro--paper">{hero.hint}</span>
                        <span className="line" />
                        <span className="micro micro--paper">→</span>
                    </div>
                ) : null}
            </>
        ))
    }

    if (philosophy.show !== false) {
        add("philosophy", philosophy.label || "Philosophy", 1, (
            <div className="grid">
                <div className="col-text" data-px="0.07">
                    <div className="stack-head">
                        <span className="big-num rv">{philosophy.index}</span>
                        <span className="micro rv" style={{ "--d": "80ms" }}>
                            {philosophy.label}
                        </span>
                    </div>
                    <Split text={philosophy.title} />
                    <p className="rv" style={{ "--d": "520ms" }}>
                        {philosophy.paragraph}
                    </p>
                    <p className="micro rv" style={{ "--d": "640ms" }}>
                        {philosophy.meta}
                    </p>
                </div>
                <Plate
                    image={philosophy.image}
                    video={philosophy.video}
                    alt={philosophy.caption || philosophy.label}
                    caption={philosophy.caption}
                    tone="plate--t2"
                    speed={-0.05}
                    delay="180ms"
                />
            </div>
        ))
    }

    if (about.show !== false) {
        add("about", about.label || "About", narrow ? 1 : 1.32, (
            <>
                <Plate
                    image={about.image}
                    video={about.video}
                    alt={about.title}
                    tone="plate--t3"
                    bleed
                    speed={-0.08}
                    zoom={false}
                />
                <div className="float" data-px="0.04">
                    <span className="micro rv">
                        {about.index} — {about.label}
                    </span>
                    <Split text={about.title} />
                    <p className="rv" style={{ "--d": "480ms" }}>
                        {about.paragraph}
                    </p>
                    <ul className="pillars">
                        {pillars.map((item, i) => (
                            <li
                                className="rv"
                                key={i}
                                style={{ "--d": `${560 + i * 100}ms` }}
                            >
                                <span>{item.number || pad(i + 1)}</span>
                                <strong>{item.label}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        ))
    }

    if (services.show !== false) {
        const factor = narrow ? panels.length * 0.75 + 0.16 : 1.52
        add("services", services.label || "Services", factor, (
            <>
                <div className="svc-head">
                    <span className="big-num rv">{services.index}</span>
                    <span className="micro rv" style={{ "--d": "80ms" }}>
                        {services.label}
                    </span>
                </div>
                <div className="panels">
                    {panels.map((panel, i) => (
                        <article
                            className="panel rv-clip"
                            key={i}
                            style={{ "--d": `${i * 120}ms` }}
                        >
                            <Plate
                                image={panel.image}
                                video={panel.video}
                                alt={String(panel.title || "").replace(/\n/g, " ")}
                                tone={["", "plate--t2", "plate--t3"][i % 3]}
                                zoom={false}
                                reveal={false}
                            />
                            <span className="n">{panel.number || pad(i + 1)}</span>
                            {panel.href ? (
                                <a
                                    className="arw"
                                    href={panel.href}
                                    aria-label={`More about ${String(panel.title || "").replace(/\n/g, " ")}`}
                                >
                                    ↗
                                </a>
                            ) : null}
                            <h3>
                                {String(panel.title || "")
                                    .split("\n")
                                    .map((line, k) => (
                                        <React.Fragment key={k}>
                                            {k > 0 ? <br /> : null}
                                            {line}
                                        </React.Fragment>
                                    ))}
                            </h3>
                            <p>{panel.text}</p>
                        </article>
                    ))}
                </div>
            </>
        ))
    }

    if (process.show !== false) {
        const span = Math.max(
            spanOf(processTable, shots.length),
            tagSlot.l + 30
        )
        add("process", process.label || "The Process", (span + 8) / 100, (
            <div className="collage">
                <Split text={process.title} speed={0.12} />
                {shots.map((shot, i) => {
                    const slot = slotFor(processTable, i)
                    return (
                        <Plate
                            key={i}
                            image={shot.image}
                            video={shot.video}
                            alt={shot.caption || `${process.label} ${i + 1}`}
                            caption={shot.caption}
                            tone={
                                shot.bw
                                    ? "plate--bw"
                                    : ["", "plate--t2", "plate--t3"][i % 3]
                            }
                            style={slotStyle(slot)}
                            speed={slot.s}
                        />
                    )
                })}
                <div
                    className="tag"
                    data-px="0.16"
                    style={{ left: vw(tagSlot.l), top: `${tagSlot.t}%` }}
                >
                    <p className="micro rv">
                        {process.index} — {process.label}
                    </p>
                    <p className="rv" style={{ "--d": "120ms" }}>
                        {process.paragraph}
                    </p>
                </div>
            </div>
        ))
    }

    if (results.show !== false) {
        const factor = narrow
            ? quotes.length * 0.86 + 0.2
            : quotes.length * 0.52 + 0.16
        add("results", results.label || "Results", factor, (
            <div className="quotes">
                {quotes.map((q, i) => (
                    <figure
                        className={`quote ${i === 0 ? "quote--lead" : ""}`}
                        key={i}
                        data-px={(0.06 - i * 0.04).toFixed(2)}
                    >
                        <span className="mark" aria-hidden="true">
                            “
                        </span>
                        {i === 0 ? (
                            <Split text={q.quote} tag="blockquote" />
                        ) : (
                            <blockquote className="rv" style={{ "--d": "120ms" }}>
                                {q.quote}
                            </blockquote>
                        )}
                        <figcaption className="rv" style={{ "--d": "280ms" }}>
                            <b>{q.name}</b>
                            <span className="micro">{q.detail}</span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        ))
    }

    if (gallery.show !== false) {
        const span = Math.max(
            spanOf(galleryTable, gallerySlots.length),
            leadSlot.l + 26
        )
        add("gallery", gallery.label || "Gallery", (span + 8) / 100, (
            <div className="gal">
                <div
                    className="lead"
                    data-px="0.10"
                    style={{ left: vw(leadSlot.l), top: `${leadSlot.t}%` }}
                >
                    <p className="micro rv">
                        {gallery.index} — {gallery.label}
                    </p>
                    <p className="rv" style={{ "--d": "120ms" }}>
                        {gallery.lead}
                    </p>
                </div>
                {gallerySlots.map((shot, i) => {
                    const slot = slotFor(galleryTable, i)
                    return (
                        <Plate
                            key={i}
                            image={shot.image}
                            video={shot.video}
                            alt={shot.caption || `${gallery.label} ${i + 1}`}
                            caption={shot.caption}
                            tone={
                                shot.bw
                                    ? "plate--bw"
                                    : ["", "plate--t2", "plate--t3"][i % 3]
                            }
                            style={slotStyle(slot)}
                            speed={slot.s}
                        />
                    )
                })}
            </div>
        ))
    }

    if (statement.show !== false) {
        add("statement", statement.label || "Statement", 1, (
            <div className="wrap">
                <Split text={statement.title} speed={0.04} />
                <span className="rule rv" style={{ "--d": "640ms" }} aria-hidden="true" />
                <p className="lines rv" style={{ "--d": "720ms" }}>
                    {String(statement.lines || "")
                        .split("\n")
                        .map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 ? <br /> : null}
                                {line}
                            </React.Fragment>
                        ))}
                </p>
            </div>
        ))
    }

    if (cta.show !== false) {
        add("cta", cta.label || "Contact", 1, (
            <>
                <Plate
                    image={cta.image}
                    video={cta.video}
                    alt={cta.title}
                    bleed
                    speed={-0.05}
                    zoom={false}
                />
                <div className="cta-inner">
                    <p className="micro rv">
                        {cta.index} — {cta.label}
                    </p>
                    <Split text={cta.title} />
                    <p className="rv" style={{ "--d": "520ms", maxWidth: "38ch" }}>
                        {cta.paragraph}
                    </p>
                    <div className="btns rv" style={{ "--d": "640ms" }}>
                        {cta.primaryLabel ? (
                            <a className="btn btn--solid" href={cta.primaryHref}>
                                <span>{cta.primaryLabel}</span>
                                <i aria-hidden="true">→</i>
                            </a>
                        ) : null}
                        {cta.secondaryLabel ? (
                            <a
                                className="btn"
                                href={cta.secondaryHref}
                                onClick={(e) => {
                                    if (
                                        String(cta.secondaryHref || "").startsWith("#") &&
                                        apiRef.current
                                    ) {
                                        e.preventDefault()
                                        apiRef.current.gotoId(
                                            String(cta.secondaryHref).slice(1)
                                        )
                                    }
                                }}
                            >
                                <span>{cta.secondaryLabel}</span>
                                <i aria-hidden="true">→</i>
                            </a>
                        ) : null}
                    </div>
                </div>
            </>
        ))
    }

    if (footer.show !== false) {
        add("footer", footer.label || "Contact", narrow ? 1 : 0.76, (
            <footer className="foot">
                <Split text={footer.title} />
                <div className="rows">
                    <dl className="rv">
                        <dt>Instagram</dt>
                        <dd>
                            <a href={footer.instagramHref} rel="noopener">
                                {nav.instagram}
                            </a>
                        </dd>
                    </dl>
                    <dl className="rv" style={{ "--d": "100ms" }}>
                        <dt>Email</dt>
                        <dd>
                            <a href={`mailto:${nav.email}`}>{nav.email}</a>
                        </dd>
                    </dl>
                    <dl className="rv" style={{ "--d": "200ms" }}>
                        <dt>Location</dt>
                        <dd>{nav.location}</dd>
                    </dl>
                    <p className="micro rv" style={{ "--d": "300ms" }}>
                        {footer.copyright}
                    </p>
                </div>
            </footer>
        ))
    }

    const layoutKey = `${sections.map((s) => s.id).join("|")}|${narrow}|${panels.length}|${shots.length}|${quotes.length}|${gallerySlots.length}|${menu.length}`

    const motionRef = useRef(motion)
    motionRef.current = motion
    const motionKey = JSON.stringify(motion)

    useEngine(rootRef, apiRef, motionRef, `${layoutKey}|${motionKey}`)
    useCursor(rootRef, motion.cursor !== false)

    /* Mounted first, then given the class, so the reveal actually animates. */
    const openMenu = useCallback(() => {
        setMenuOpen(true)
        requestAnimationFrame(() =>
            requestAnimationFrame(() => setMenuIn(true))
        )
    }, [])
    const closeMenu = useCallback(() => {
        setMenuIn(false)
        setTimeout(() => setMenuOpen(false), 700)
    }, [])

    useEffect(() => {
        if (!menuOpen) return
        const onKey = (e) => {
            if (e.key === "Escape") closeMenu()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [menuOpen, closeMenu])

    return (
        <div
            className={`${ROOT} ${box.cls}`.trim()}
            ref={rootRef}
            style={{
                ...(props.style || {}),
                "--vpw": `${box.w}px`,
                "--vph": `${box.h}px`,
                height:
                    type.heightMode === "fixed"
                        ? `${type.heightPx || 900}px`
                        : type.heightMode === "fill"
                          ? "100%"
                          : "100svh",
            }}
        >
            <div className="stage">
                <div className="scroller" tabIndex={-1}>
                    {sections.map((s) => (
                        <section
                            className={`sec s-${s.id}`}
                            key={s.id}
                            data-id={s.id}
                            data-label={s.label}
                            aria-label={s.label}
                            style={{ width: vw(s.factor * 100) }}
                        >
                            {s.node}
                        </section>
                    ))}
                </div>

                <header className="chrome">
                    <button
                        className="brand"
                        onClick={() => apiRef.current && apiRef.current.goto(0)}
                    >
                        {nav.brand}
                        <small>{nav.role}</small>
                    </button>
                    <button
                        className="menu-btn"
                        onClick={openMenu}
                        aria-expanded={menuOpen}
                    >
                        {nav.menuLabel}
                        <span className="bars" aria-hidden="true">
                            <span />
                            <span />
                        </span>
                    </button>
                </header>

                <div className="hud" aria-hidden="true">
                    <p className="count">
                        <b data-hud="num">01</b> / <span data-hud="total">01</span>
                    </p>
                    <div className="hud-right">
                        <p className="label" data-hud="label" />
                        {motion.indicator !== false ? (
                            <Lifter caption={motion.indicatorCaption} />
                        ) : null}
                    </div>
                </div>
                <div className="progress" aria-hidden="true">
                    <i data-hud="bar" />
                </div>

                {motion.grain !== false ? (
                    <div
                        className="grain"
                        aria-hidden="true"
                        style={{ opacity: (motion.grainAmount ?? 5.5) / 100 }}
                    />
                ) : null}

                {menuOpen ? (
                    <div
                        className={`overlay ${menuIn ? "open" : ""}`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={nav.menuLabel}
                    >
                        <button className="close" onClick={closeMenu}>
                            {nav.closeLabel} ×
                        </button>
                        <nav className="nav-side" aria-label="Primary">
                            <ul>
                                {menu.map((item, i) => (
                                    <li key={i}>
                                        <button
                                            style={{ "--i": i }}
                                            onMouseEnter={() => setPreview(i)}
                                            onFocus={() => setPreview(i)}
                                            onClick={() => {
                                                closeMenu()
                                                if (apiRef.current)
                                                    apiRef.current.gotoId(item.target)
                                            }}
                                        >
                                            <em>{pad(i + 1)}</em>
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="foot-note">
                                <p className="micro">{nav.email}</p>
                                <p className="micro">{nav.location}</p>
                                <p className="micro">{nav.instagram}</p>
                            </div>
                        </nav>
                        <div className="preview" aria-hidden="true">
                            {menu.map((item, i) => (
                                <figure
                                    className={`plate ${i === preview ? "on" : ""} ${
                                        ["", "plate--t2", "plate--t3"][i % 3]
                                    }`}
                                    key={i}
                                >
                                    <Media image={item.image} alt="" />
                                </figure>
                            ))}
                        </div>
                    </div>
                ) : null}

                {motion.cursor !== false ? (
                    <>
                        <div className="cursor" aria-hidden="true">
                            <span>View</span>
                        </div>
                        <div className="cursor-dot" aria-hidden="true" />
                    </>
                ) : null}
            </div>
        </div>
    )
}

/** The hero headline, with one word allowed to take the accent colour. */
function HeroTitle({ text, accentWord, delay }) {
    const word = String(accentWord || "").trim().toLowerCase()
    const lines = String(text || "").split("\n")
    let index = 0
    return (
        <h1 className="hero-title split" data-px="0.05" style={{ "--d": delay }}>
            {lines.map((line, li) => (
                <React.Fragment key={li}>
                    {li > 0 ? <br /> : null}
                    {line
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((w, wi) => {
                            const bare = w
                                .replace(/[^\p{L}\p{N}]/gu, "")
                                .toLowerCase()
                            return (
                                <React.Fragment key={`${li}-${wi}`}>
                                    <span className="w">
                                        <i
                                            className={
                                                word && bare === word
                                                    ? "accent"
                                                    : undefined
                                            }
                                            style={{ "--i": index++ }}
                                        >
                                            {w}
                                        </i>
                                    </span>{" "}
                                </React.Fragment>
                            )
                        })}
                </React.Fragment>
            ))}
        </h1>
    )
}

/* ------------------------------------------------------------------ */
/* Property controls                                                   */
/* ------------------------------------------------------------------ */

const showControl = (title = "Show section") => ({
    type: ControlType.Boolean,
    title,
    defaultValue: true,
})
const imageControl = (title = "Photograph") => ({
    type: ControlType.Image,
    title,
})
const videoControl = (title = "Video (wins over photo)") => ({
    type: ControlType.File,
    title,
    allowedFileTypes: ["mp4", "webm", "mov", "m4v"],
})

addPropertyControls(CarterSite, {
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
                options: ["custom", "midnight", "steel", "ember", "chalk"],
                optionTitles: [
                    "Custom colors",
                    "Midnight (brass)",
                    "Steel (cold blue)",
                    "Ember (warm red)",
                    "Chalk (olive)",
                ],
                defaultValue: DEFAULTS.colors.preset,
            },
            ink: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: DEFAULTS.colors.ink,
                hidden: (p = {}) => p?.preset !== "custom",
            },
            paper: {
                type: ControlType.Color,
                title: "Text",
                defaultValue: DEFAULTS.colors.paper,
                hidden: (p = {}) => p?.preset !== "custom",
            },
            accent: {
                type: ControlType.Color,
                title: "Accent",
                defaultValue: DEFAULTS.colors.accent,
                hidden: (p = {}) => p?.preset !== "custom",
            },
        },
    },

    type: {
        type: ControlType.Object,
        title: "🖋️ Appearance",
        controls: {
            fontDisplay: {
                type: ControlType.String,
                title: "Headline font",
                defaultValue: DEFAULTS.type.fontDisplay,
            },
            fontBody: {
                type: ControlType.String,
                title: "Body font",
                defaultValue: DEFAULTS.type.fontBody,
            },
            fontSerif: {
                type: ControlType.String,
                title: "Accent serif",
                defaultValue: DEFAULTS.type.fontSerif,
            },
            heroSize: {
                type: ControlType.Number,
                title: "Hero size (rem)",
                min: 4,
                max: 18,
                step: 0.5,
                defaultValue: DEFAULTS.type.heroSize,
            },
            radius: {
                type: ControlType.Number,
                title: "Corner radius",
                min: 0,
                max: 40,
                step: 1,
                defaultValue: DEFAULTS.type.radius,
            },
            gutter: {
                type: ControlType.Number,
                title: "Edge spacing",
                min: 20,
                max: 140,
                step: 2,
                defaultValue: DEFAULTS.type.gutter,
            },
            heightMode: {
                type: ControlType.Enum,
                title: "Height",
                options: ["viewport", "fill", "fixed"],
                optionTitles: ["Full screen", "Fill frame", "Fixed"],
                displaySegmentedControl: true,
                defaultValue: DEFAULTS.type.heightMode,
            },
            heightPx: {
                type: ControlType.Number,
                title: "Height (px)",
                min: 400,
                max: 1600,
                step: 10,
                defaultValue: DEFAULTS.type.heightPx,
                hidden: (p = {}) => p?.heightMode !== "fixed",
            },
        },
    },

    motion: {
        type: ControlType.Object,
        title: "🎬 Motion",
        controls: {
            smooth: {
                type: ControlType.Boolean,
                title: "Smooth scrolling",
                defaultValue: DEFAULTS.motion.smooth,
            },
            snap: {
                type: ControlType.Boolean,
                title: "Settle on frames",
                defaultValue: DEFAULTS.motion.snap,
                hidden: (p = {}) => p?.smooth === false,
            },
            parallax: {
                type: ControlType.Boolean,
                title: "Parallax",
                defaultValue: DEFAULTS.motion.parallax,
            },
            parallaxAmount: {
                type: ControlType.Number,
                title: "Parallax amount",
                min: 0.2,
                max: 2,
                step: 0.1,
                defaultValue: DEFAULTS.motion.parallaxAmount,
                hidden: (p = {}) => p?.parallax === false,
            },
            cursor: {
                type: ControlType.Boolean,
                title: "Custom cursor",
                defaultValue: DEFAULTS.motion.cursor,
            },
            grain: {
                type: ControlType.Boolean,
                title: "Film grain",
                defaultValue: DEFAULTS.motion.grain,
            },
            grainAmount: {
                type: ControlType.Number,
                title: "Grain strength",
                min: 0,
                max: 20,
                step: 0.5,
                defaultValue: DEFAULTS.motion.grainAmount,
                hidden: (p = {}) => p?.grain === false,
            },
            indicator: {
                type: ControlType.Boolean,
                title: "Lifter indicator",
                defaultValue: DEFAULTS.motion.indicator,
            },
            indicatorCaption: {
                type: ControlType.String,
                title: "Indicator caption",
                defaultValue: DEFAULTS.motion.indicatorCaption,
                hidden: (p = {}) => p?.indicator === false,
            },
        },
    },

    nav: {
        type: ControlType.Object,
        title: "🧭 Navigation",
        controls: {
            brand: {
                type: ControlType.String,
                title: "Trainer name",
                defaultValue: DEFAULTS.nav.brand,
            },
            role: {
                type: ControlType.String,
                title: "Role",
                defaultValue: DEFAULTS.nav.role,
            },
            menuLabel: {
                type: ControlType.String,
                title: "Menu label",
                defaultValue: DEFAULTS.nav.menuLabel,
            },
            closeLabel: {
                type: ControlType.String,
                title: "Close label",
                defaultValue: DEFAULTS.nav.closeLabel,
            },
            email: {
                type: ControlType.String,
                title: "Email",
                defaultValue: DEFAULTS.nav.email,
            },
            location: {
                type: ControlType.String,
                title: "Location",
                defaultValue: DEFAULTS.nav.location,
            },
            instagram: {
                type: ControlType.String,
                title: "Instagram handle",
                defaultValue: DEFAULTS.nav.instagram,
            },
            items: {
                type: ControlType.Array,
                title: "Menu items",
                defaultValue: DEFAULT_MENU,
                control: {
                    type: ControlType.Object,
                    controls: {
                        label: {
                            type: ControlType.String,
                            title: "Label",
                            defaultValue: "Home",
                        },
                        target: {
                            type: ControlType.Enum,
                            title: "Goes to",
                            options: [
                                "hero",
                                "philosophy",
                                "about",
                                "services",
                                "process",
                                "results",
                                "gallery",
                                "statement",
                                "cta",
                                "footer",
                            ],
                            optionTitles: [
                                "Hero",
                                "Philosophy",
                                "About",
                                "Services",
                                "The Process",
                                "Results",
                                "Gallery",
                                "Statement",
                                "Contact",
                                "Footer",
                            ],
                            defaultValue: "hero",
                        },
                        image: imageControl("Hover preview"),
                    },
                },
            },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "① Hero",
        controls: {
            show: showControl(),
            label: {
                type: ControlType.String,
                title: "Frame label",
                defaultValue: DEFAULTS.hero.label,
            },
            eyebrow: {
                type: ControlType.String,
                title: "Eyebrow",
                displayTextArea: true,
                defaultValue: DEFAULTS.hero.eyebrow,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.hero.title,
            },
            accentWord: {
                type: ControlType.String,
                title: "Accent word",
                placeholder: "One word from the headline",
                defaultValue: DEFAULTS.hero.accentWord,
            },
            paragraph: {
                type: ControlType.String,
                title: "Paragraph",
                displayTextArea: true,
                defaultValue: DEFAULTS.hero.paragraph,
            },
            meta: {
                type: ControlType.String,
                title: "Small print",
                defaultValue: DEFAULTS.hero.meta,
            },
            side: {
                type: ControlType.String,
                title: "Side label",
                defaultValue: DEFAULTS.hero.side,
            },
            hint: {
                type: ControlType.String,
                title: "Scroll hint",
                defaultValue: DEFAULTS.hero.hint,
            },
            image: imageControl(),
            video: videoControl(),
        },
    },

    philosophy: {
        type: ControlType.Object,
        title: "② Philosophy",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.philosophy.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.philosophy.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.philosophy.title,
            },
            paragraph: {
                type: ControlType.String,
                title: "Paragraph",
                displayTextArea: true,
                defaultValue: DEFAULTS.philosophy.paragraph,
            },
            meta: {
                type: ControlType.String,
                title: "Small print",
                defaultValue: DEFAULTS.philosophy.meta,
            },
            image: imageControl(),
            video: videoControl(),
            caption: {
                type: ControlType.String,
                title: "Photo caption",
                defaultValue: DEFAULTS.philosophy.caption,
            },
        },
    },

    about: {
        type: ControlType.Object,
        title: "③ About",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.about.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.about.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.about.title,
            },
            paragraph: {
                type: ControlType.String,
                title: "Paragraph",
                displayTextArea: true,
                defaultValue: DEFAULTS.about.paragraph,
            },
            image: imageControl(),
            video: videoControl(),
            pillars: {
                type: ControlType.Array,
                title: "What is included",
                defaultValue: DEFAULT_PILLARS,
                control: {
                    type: ControlType.Object,
                    controls: {
                        number: {
                            type: ControlType.String,
                            title: "Number",
                            defaultValue: "01",
                        },
                        label: {
                            type: ControlType.String,
                            title: "Label",
                            defaultValue: "Personalised programs",
                        },
                    },
                },
            },
        },
    },

    services: {
        type: ControlType.Object,
        title: "④ Services",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.services.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.services.label,
            },
            panels: {
                type: ControlType.Array,
                title: "Panels",
                defaultValue: DEFAULT_PANELS,
                control: {
                    type: ControlType.Object,
                    controls: {
                        number: {
                            type: ControlType.String,
                            title: "Number",
                            defaultValue: "01",
                        },
                        title: {
                            type: ControlType.String,
                            title: "Title",
                            displayTextArea: true,
                            defaultValue: "Personal\ntraining",
                        },
                        text: {
                            type: ControlType.String,
                            title: "Description",
                            displayTextArea: true,
                            defaultValue: "One-to-one sessions in a private studio.",
                        },
                        image: imageControl(),
                        video: videoControl(),
                        href: {
                            type: ControlType.String,
                            title: "Link",
                            defaultValue: "#contact",
                        },
                    },
                },
            },
        },
    },

    process: {
        type: ControlType.Object,
        title: "⑤ The Process",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.process.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.process.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.process.title,
            },
            paragraph: {
                type: ControlType.String,
                title: "Paragraph",
                displayTextArea: true,
                defaultValue: DEFAULTS.process.paragraph,
            },
            shots: {
                type: ControlType.Array,
                title: "Photographs",
                defaultValue: DEFAULT_SHOTS,
                control: {
                    type: ControlType.Object,
                    controls: {
                        image: imageControl(),
                        video: videoControl(),
                        caption: {
                            type: ControlType.String,
                            title: "Caption",
                            defaultValue: "",
                        },
                        bw: {
                            type: ControlType.Boolean,
                            title: "Black and white",
                            defaultValue: false,
                        },
                    },
                },
            },
        },
    },

    results: {
        type: ControlType.Object,
        title: "⑥ Results",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.results.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.results.label,
            },
            quotes: {
                type: ControlType.Array,
                title: "Testimonials",
                defaultValue: DEFAULT_QUOTES,
                control: {
                    type: ControlType.Object,
                    controls: {
                        quote: {
                            type: ControlType.String,
                            title: "Quote",
                            displayTextArea: true,
                            defaultValue: "It changed how I show up.",
                        },
                        name: {
                            type: ControlType.String,
                            title: "Client",
                            defaultValue: "Maya R.",
                        },
                        detail: {
                            type: ControlType.String,
                            title: "Goal or type",
                            defaultValue: "Strength & confidence",
                        },
                    },
                },
            },
        },
    },

    gallery: {
        type: ControlType.Object,
        title: "⑦ Gallery",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.gallery.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.gallery.label,
            },
            lead: {
                type: ControlType.String,
                title: "Intro line",
                displayTextArea: true,
                defaultValue: DEFAULTS.gallery.lead,
            },
            shots: {
                type: ControlType.Array,
                title: "Photographs",
                defaultValue: DEFAULT_GALLERY,
                control: {
                    type: ControlType.Object,
                    controls: {
                        image: imageControl(),
                        video: videoControl(),
                        caption: {
                            type: ControlType.String,
                            title: "Caption",
                            defaultValue: "",
                        },
                        bw: {
                            type: ControlType.Boolean,
                            title: "Black and white",
                            defaultValue: false,
                        },
                    },
                },
            },
        },
    },

    statement: {
        type: ControlType.Object,
        title: "⑧ Statement",
        controls: {
            show: showControl(),
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.statement.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.statement.title,
            },
            lines: {
                type: ControlType.String,
                title: "Lines",
                displayTextArea: true,
                defaultValue: DEFAULTS.statement.lines,
            },
        },
    },

    cta: {
        type: ControlType.Object,
        title: "⑨ Contact",
        controls: {
            show: showControl(),
            index: {
                type: ControlType.String,
                title: "Number",
                defaultValue: DEFAULTS.cta.index,
            },
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.cta.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.cta.title,
            },
            paragraph: {
                type: ControlType.String,
                title: "Paragraph",
                displayTextArea: true,
                defaultValue: DEFAULTS.cta.paragraph,
            },
            primaryLabel: {
                type: ControlType.String,
                title: "Button",
                defaultValue: DEFAULTS.cta.primaryLabel,
            },
            primaryHref: {
                type: ControlType.String,
                title: "Button link",
                defaultValue: DEFAULTS.cta.primaryHref,
            },
            secondaryLabel: {
                type: ControlType.String,
                title: "Second button",
                defaultValue: DEFAULTS.cta.secondaryLabel,
            },
            secondaryHref: {
                type: ControlType.String,
                title: "Second link",
                placeholder: "#services jumps to a frame",
                defaultValue: DEFAULTS.cta.secondaryHref,
            },
            image: imageControl(),
            video: videoControl(),
        },
    },

    footer: {
        type: ControlType.Object,
        title: "⑩ Footer",
        controls: {
            show: showControl(),
            label: {
                type: ControlType.String,
                title: "Label",
                defaultValue: DEFAULTS.footer.label,
            },
            title: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: DEFAULTS.footer.title,
            },
            instagramHref: {
                type: ControlType.String,
                title: "Instagram link",
                defaultValue: DEFAULTS.footer.instagramHref,
            },
            copyright: {
                type: ControlType.String,
                title: "Copyright",
                defaultValue: DEFAULTS.footer.copyright,
            },
        },
    },
})
