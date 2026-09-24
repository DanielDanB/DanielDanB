import * as React from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// ---------------------------------------------------------------------------
// SONAD engineering — celý web jako jedna Framer code komponenta.
//
// Styl je převzatý z jednosouborového HTML (sonad-jednosouborovy-fix.html),
// barvy, tvary boxů a tlačítek jdou z panelu vlastností přes CSS proměnné,
// breakpointy se řídí šířkou komponenty (ne okna), takže sedí i v rámech
// Framer breakpointů.
// ---------------------------------------------------------------------------

const COMPONENT_VERSION = "v1 · SONAD"
const STYLE_ID = "sonad-site-style"
const ROOT = "sonad-root"

/* ------------------------------------------------------------------ */
/* Barvy                                                               */
/* ------------------------------------------------------------------ */

function parseColor(input: any) {
    if (typeof input !== "string") return null
    const value = input.trim()
    const hex = value.match(/^#([0-9a-f]{3,8})$/i)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
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

/** Stejná barva s jinou průhledností; u design tokenu přes color-mix. */
function withAlpha(color: string, alpha: number) {
    const c = parseColor(color)
    if (!c) return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`
    const a = Math.max(0, Math.min(1, c.a * alpha))
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+a.toFixed(3)})`
}

/** Ztmavení (amount 0–1) — z hlavní barvy se dopočítá tmavší odstín pro hover. */
function darken(color: string, amount: number) {
    const c = parseColor(color)
    if (!c) return `color-mix(in srgb, ${color} ${Math.round((1 - amount) * 100)}%, black)`
    const k = 1 - amount
    const h = (n: number) => Math.round(n * k).toString(16).padStart(2, "0")
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`
}

function isDarkColor(color: string) {
    const c = parseColor(color)
    if (!c) return false
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255 < 0.45
}

/* ------------------------------------------------------------------ */
/* Palety                                                              */
/* ------------------------------------------------------------------ */

const PALETTES: Record<string, any> = {
    sonad: {
        brand: "#d0202a", ink: "#15181d", ink2: "#5b6169", ink3: "#8b919a",
        bg: "#f6f7f9", bg2: "#eef0f4", surface: "#ffffff", glow: "#5d84c4", buttonText: "#ffffff",
    },
    steel: {
        brand: "#1f5fbf", ink: "#131820", ink2: "#56606d", ink3: "#8a929d",
        bg: "#f5f7fa", bg2: "#eaeef4", surface: "#ffffff", glow: "#7fb0e8", buttonText: "#ffffff",
    },
    forest: {
        brand: "#1f7a4d", ink: "#141a17", ink2: "#56615b", ink3: "#88928c",
        bg: "#f5f8f6", bg2: "#e9efeb", surface: "#ffffff", glow: "#8fbf6a", buttonText: "#ffffff",
    },
    amber: {
        brand: "#e0661b", ink: "#1b1814", ink2: "#645b52", ink3: "#978d83",
        bg: "#faf7f4", bg2: "#f1ebe4", surface: "#ffffff", glow: "#e3b04b", buttonText: "#ffffff",
    },
    graphite: {
        brand: "#ec3a44", ink: "#f2f3f5", ink2: "#aab0b9", ink3: "#7d838c",
        bg: "#0f1115", bg2: "#181b21", surface: "#20242c", glow: "#3d5a8a", buttonText: "#ffffff",
    },
}

/* ------------------------------------------------------------------ */
/* Stylopis                                                            */
/* ------------------------------------------------------------------ */

function prefixSelector(selector: string, scope: string) {
    return selector
        .split(",")
        .map((part) => {
            const s = part.trim()
            if (!s || s.startsWith(scope)) return s
            return `${scope} ${s}`
        })
        .join(", ")
}

/** Každý selektor dostane prefix kořenové třídy, aby styly neutekly do projektu. */
function scopeCSS(input: string, scope: string) {
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
                out += (inKeyframes ? selector : prefixSelector(selector, scope)) + " {"
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

function resolveColors(colors: any) {
    const c = { ...DEFAULTS.colors, ...(colors || {}) }
    const preset = c.palette && c.palette !== "custom" ? PALETTES[c.palette] : null
    const p = preset ? { ...preset } : c
    const brand = p.brand || DEFAULTS.colors.brand
    return {
        brand,
        brandDeep:
            !preset && c.brandDeepAuto === false && c.brandDeep ? c.brandDeep : darken(brand, 0.21),
        ink: p.ink, ink2: p.ink2, ink3: p.ink3,
        bg: p.bg, bg2: p.bg2, surface: p.surface,
        glow: p.glow, buttonText: p.buttonText,
    }
}

function globalCSS(c: any, sh: any, ty: any, fx: any) {
    const dark = isDarkColor(c.bg)
    const S = (a: number) => withAlpha(c.surface, a)
    // bílé odlesky na skle; na tmavém podkladu jen náznak
    const H = (a: number) => withAlpha("#ffffff", dark ? a * 0.14 : a)
    const I = (a: number) => withAlpha(c.ink, a)
    const B = (a: number) => withAlpha(c.brand, a)
    const BD = (a: number) => withAlpha(c.brandDeep, a)
    const shadowRGB = dark ? "0,0,0" : "16,20,28"
    const k = sh.shadow / 100
    const SH = (a: number) => `rgba(${shadowRGB},${+(Math.min(1, a * k * (dark ? 1.6 : 1))).toFixed(3)})`

    const rLg = sh.boxRadius
    const rMd = Math.round(rLg * 0.73)
    const rSm = Math.round(rLg * 0.47)
    const rBtn =
        sh.buttonShape === "pill" ? 999 : sh.buttonShape === "square" ? 0 : sh.buttonRadius
    const rIco = sh.iconShape === "circle" ? "50%" : sh.iconShape === "square" ? "4px" : `${Math.round(Math.max(4, rLg * 0.5))}px`
    const blur = sh.glassBlur

    let boxRules = ""
    if (sh.boxStyle === "solid") {
        boxRules = `
  .glass{position:relative;background:${c.surface};border:1px solid ${I(0.08)};
    box-shadow:var(--shadow-m);border-radius:var(--r-lg);isolation:isolate}
  .glass::before,.glass::after{display:none}`
    } else if (sh.boxStyle === "outline") {
        boxRules = `
  .glass{position:relative;background:transparent;border:1.5px solid ${I(0.14)};
    box-shadow:none;border-radius:var(--r-lg);isolation:isolate}
  .glass::before,.glass::after{display:none}
  .fact.glass{background:${S(0.35)};border-color:${H(0.7)}}`
    } else {
        boxRules = `
  .glass{
    position:relative;
    background:linear-gradient(150deg,${S(0.8)},${S(0.55)} 46%,${S(0.66)});
    -webkit-backdrop-filter:blur(${blur}px) saturate(185%);
    backdrop-filter:blur(${blur}px) saturate(185%);
    border:1px solid ${S(0.75)};
    box-shadow:var(--shadow-m), inset 0 1px 0 ${H(0.95)}, inset 0 -1px 0 ${H(0.35)};
    border-radius:var(--r-lg);
    isolation:isolate;
  }
  .glass::before{
    content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
    background:linear-gradient(140deg,${H(0.98)},${H(0)} 32%,${H(0)} 66%,${H(0.75)});
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor;mask-composite:exclude;
  }
  .glass::after{
    content:"";position:absolute;left:0;right:0;top:0;height:46%;border-radius:inherit;pointer-events:none;
    background:linear-gradient(180deg,${H(0.55)},${H(0)});
    opacity:.75;mix-blend-mode:screen;
  }
  .open-card::after,.media::after,.snimek::after,.mapa::after{display:none}
  @supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
    .glass{background:${S(0.93)}}
  }`
    }

    const primaryBtn =
        sh.primaryStyle === "outline"
            ? `.btn-primary{background:transparent;color:var(--brand);border:1.5px solid var(--brand);box-shadow:none}
  .btn-primary:hover{background:var(--brand);color:var(--btn-text)}`
            : `.btn-primary{background:var(--brand);color:var(--btn-text);box-shadow:0 2px 6px ${B(0.25)},0 16px 34px -16px ${B(0.65)}}
  .btn-primary:hover{background:var(--brand-deep);box-shadow:0 4px 10px ${B(0.28)},0 24px 44px -18px ${B(0.7)}}`

    const ghostBtn =
        sh.secondaryStyle === "outline"
            ? `.btn-ghost{background:transparent;border:1.5px solid ${I(0.22)};color:var(--ink)}
  .btn-ghost:hover{border-color:var(--ink)}`
            : sh.secondaryStyle === "solid"
              ? `.btn-ghost{background:${c.surface};border-color:${I(0.08)};color:var(--ink);box-shadow:var(--shadow-s)}
  .btn-ghost:hover{box-shadow:var(--shadow-m)}`
              : `.btn-ghost{
    background:linear-gradient(160deg,${S(0.85)},${S(0.6)});
    -webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);
    border-color:${S(0.8)};color:var(--ink);box-shadow:var(--shadow-s),inset 0 1px 0 ${H(0.9)};
  }
  .btn-ghost:hover{box-shadow:var(--shadow-m),inset 0 1px 0 ${H(0.9)}}`

    const pad = sh.buttonSize / 100
    const tScale = ty.titleScale / 100
    const W = `.${ROOT}`

    return `
  ${ty.googleFont ? `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(ty.googleFont).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap');` : ""}
  ${W}{
    --brand:${c.brand};
    --brand-deep:${c.brandDeep};
    --brand-soft:${B(0.1)};
    --btn-text:${c.buttonText};
    --ink:${c.ink};
    --ink-2:${c.ink2};
    --ink-3:${c.ink3};
    --line:${I(0.1)};
    --bg:${c.bg};
    --bg-2:${c.bg2};
    --surface:${c.surface};
    --r-lg:${rLg}px; --r-md:${rMd}px; --r-sm:${rSm}px; --r-btn:${rBtn}px; --r-ico:${rIco};
    --shadow-s:0 1px 2px ${SH(0.05)}, 0 6px 18px -8px ${SH(0.16)};
    --shadow-m:0 2px 6px ${SH(0.05)}, 0 22px 50px -24px ${SH(0.3)};
    --shadow-l:0 3px 10px ${SH(0.06)}, 0 50px 90px -40px ${SH(0.38)};
    --pad:clamp(20px,5vw,40px);
    --maxw:${ty.contentWidth}px;
    --section:clamp(${Math.round(76 * fx.spacing / 100)}px,${(11 * fx.spacing / 100).toFixed(2)}vw,${Math.round(150 * fx.spacing / 100)}px);
    --font:${ty.googleFont ? `"${ty.googleFont}",` : ""}${ty.fontFamily};
    --hw:${ty.headingWeight};
    --ease:cubic-bezier(.22,.61,.36,1);
    --ease-soft:cubic-bezier(.33,1,.68,1);

    position:relative;isolation:isolate;width:100%;height:auto;
    /* clip, ne hidden: hidden by z komponenty udělal scrollovací box a Framer by ji ořízl */
    overflow-x:clip;overflow-y:visible;
    margin:0;font-family:var(--font);color:var(--ink);background:var(--bg);
    font-size:clamp(16px,.42vw + 15px,17.5px);line-height:1.6;
    letter-spacing:-.011em;
    -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
    -webkit-text-size-adjust:100%;
  }
  *,*::before,*::after{box-sizing:border-box}
  img,svg{max-width:100%;display:block}
  a{color:inherit;text-decoration:none}
  h1,h2,h3,h4{margin:0;font-weight:var(--hw);letter-spacing:-.028em;line-height:1.08;text-wrap:balance}
  p{margin:0;text-wrap:pretty}
  ul,ol{margin:0;padding:0;list-style:none}
  dl,dd{margin:0}
  figure{margin:0}
  address{font-style:normal}
  button{font-family:inherit}
  :focus-visible{outline:2.5px solid var(--brand);outline-offset:3px;border-radius:6px}
  [id]{scroll-margin-top:96px}
  .accent{color:var(--brand)}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

  .aura{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
  ${W}.is-canvas .aura{position:absolute}
  .aura::before,.aura::after{content:"";position:absolute;border-radius:50%;filter:blur(90px)}
  .aura::before{width:60vw;height:60vw;left:-18vw;top:-22vw;background:radial-gradient(circle at 40% 40%,${B(0.1)},transparent 68%)}
  .aura::after{width:62vw;height:62vw;right:-22vw;top:36vh;background:radial-gradient(circle at 50% 50%,${withAlpha(c.glow, 0.14)},transparent 66%)}
  .aura i{position:absolute;inset:0;background:
    radial-gradient(70% 40% at 50% 104%,${H(0.9)},transparent 70%),
    linear-gradient(180deg,${H(0.65)},transparent 34%)}

  ${boxRules}

  .wrap{width:min(100% - 2*var(--pad),var(--maxw));margin-inline:auto;position:relative}
  section{padding-block:var(--section);position:relative}
  .eyebrow{
    display:inline-flex;align-items:center;gap:12px;
    font-size:clamp(.95rem,1.1vw,1.1rem);font-weight:650;
    letter-spacing:.07em;text-transform:uppercase;color:var(--brand);margin-bottom:24px;
  }
  .eyebrow::before{content:"";width:30px;height:2px;background:currentColor;border-radius:2px;opacity:.65}
  h2.title{font-size:calc(${tScale} * clamp(2rem,4.6vw,3.5rem))}
  .lede{margin-top:20px;max-width:58ch;color:var(--ink-2);font-size:clamp(1.02rem,1.2vw,1.2rem);line-height:1.62}

  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:9px;
    padding:${Math.round(14 * pad)}px ${Math.round(26 * pad)}px;border-radius:var(--r-btn);font-size:.97rem;font-weight:560;
    letter-spacing:-.01em;border:1px solid transparent;cursor:pointer;
    transition:transform .35s var(--ease),box-shadow .35s var(--ease),background .25s,color .25s,border-color .25s;
    will-change:transform;
  }
  .btn:hover{transform:translateY(-2px)}
  .btn:active{transform:translateY(0) scale(.985)}
  ${primaryBtn}
  ${ghostBtn}
  .btn .arw{transition:transform .35s var(--ease)}
  .btn:hover .arw{transform:translateX(4px)}
  .link-arrow{display:inline-flex;align-items:center;gap:7px;color:var(--brand);font-weight:560;font-size:.97rem}
  .link-arrow svg{transition:transform .35s var(--ease)}
  .link-arrow:hover svg{transform:translateX(4px)}

  /* ---------------- záhlaví ---------------- */
  .hdr{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px var(--pad);transition:padding .45s var(--ease)}
  ${W}.is-canvas .hdr,${W}.hdr-static .hdr{position:absolute}
  .hdr.slim{padding-top:8px}
  .nav{
    width:min(100%,var(--maxw));margin-inline:auto;display:flex;align-items:center;gap:18px;
    padding:9px 10px 9px 20px;border-radius:clamp(16px,1.5vw,20px);
    transition:background .6s var(--ease),box-shadow .6s var(--ease),border-color .6s var(--ease);
    background:linear-gradient(150deg,${S(0.55)},${S(0.34)});
    border:1px solid ${S(0.55)};box-shadow:0 1px 2px ${SH(0.04)};
    -webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);
  }
  .hdr.slim .nav{
    background:linear-gradient(150deg,${S(0.68)},${S(0.46)});
    border-color:${S(0.68)};box-shadow:var(--shadow-s),inset 0 1px 0 ${H(0.7)};
  }
  .brand{display:flex;align-items:center;margin-right:auto;flex-shrink:0}
  .brand img{width:auto;display:block}
  .wordmark{display:inline-flex;align-items:baseline;gap:.28em;line-height:1;white-space:nowrap}
  .wordmark b{font-weight:900;letter-spacing:-.02em;color:var(--brand);font-size:1.45em;text-transform:uppercase}
  .wordmark span{font-weight:400;color:var(--ink);font-size:1.05em;letter-spacing:-.01em}
  .menu{display:flex;align-items:center;gap:2px}
  .menu a{
    padding:9px 15px;border-radius:var(--r-btn);font-size:.93rem;font-weight:520;color:var(--ink-2);
    transition:color .25s,background .25s;white-space:nowrap;
  }
  .menu a:hover{color:var(--ink);background:${I(0.05)}}
  .menu a.here{color:var(--ink);background:${I(0.06)};font-weight:560}
  .nav .btn.desk.here{box-shadow:0 0 0 4px var(--brand-soft),0 16px 34px -16px ${B(0.65)}}
  .sheet a.here:not(.btn){color:var(--brand)}
  .nav .btn{padding:${Math.round(11 * pad)}px ${Math.round(20 * pad)}px;font-size:.9rem}

  .langsw{position:relative;flex-shrink:0}
  .langsw-toggle{
    display:inline-flex;align-items:center;gap:7px;
    padding:9px 13px;border:0;border-radius:var(--r-btn);cursor:pointer;
    background:${I(0.05)};color:var(--ink);
    font-size:.85rem;font-weight:600;letter-spacing:.01em;transition:background .25s;
  }
  .langsw-toggle:hover{background:${I(0.09)}}
  .langsw-sipka{width:12px;height:12px;flex-shrink:0;transition:transform .3s var(--ease)}
  .langsw.open .langsw-sipka{transform:rotate(180deg)}
  .langsw-menu{
    position:absolute;top:calc(100% + 8px);right:0;min-width:168px;padding:6px;
    border-radius:var(--r-md);z-index:20;
    background:linear-gradient(150deg,${S(0.97)},${S(0.9)});
    border:1px solid ${S(0.9)};box-shadow:var(--shadow-l);
    -webkit-backdrop-filter:blur(24px) saturate(185%);backdrop-filter:blur(24px) saturate(185%);
    opacity:0;transform:translateY(-8px) scale(.96);pointer-events:none;
    transition:opacity .22s var(--ease),transform .28s var(--ease);
  }
  .langsw.open .langsw-menu{opacity:1;transform:none;pointer-events:auto}
  .langsw-menu a{
    display:flex;align-items:center;gap:9px;width:100%;padding:10px 12px;border-radius:var(--r-sm);
    color:var(--ink-2);font-size:.92rem;font-weight:540;transition:background .2s,color .2s;
  }
  .langsw-menu a:hover{background:${I(0.06)};color:var(--ink)}
  .langsw-menu a.on{color:var(--brand);font-weight:650}
  .langsw-sheet{display:flex;flex-wrap:wrap;gap:6px;padding:12px 16px 16px}
  .langsw-sheet a{
    display:inline-flex !important;align-items:center;justify-content:center;gap:6px;border-top:0 !important;
    flex:1 1 auto;padding:9px 12px !important;border-radius:var(--r-btn) !important;font-size:.86rem !important;font-weight:560;
    color:var(--ink-2) !important;background:${I(0.05)};
  }
  .langsw-sheet a.on{background:var(--brand);color:var(--btn-text) !important}
  .vlajka{font-size:1.05em;line-height:1}

  .burger{display:none;width:44px;height:44px;border:0;background:transparent;border-radius:50%;cursor:pointer;align-items:center;justify-content:center}
  .burger span{display:block;width:19px;height:1.8px;background:var(--ink);border-radius:2px;position:relative;transition:transform .4s var(--ease),opacity .25s}
  .burger span::before,.burger span::after{content:"";position:absolute;left:0;width:19px;height:1.8px;background:var(--ink);border-radius:2px;transition:transform .4s var(--ease)}
  .burger span::before{top:-6px}.burger span::after{top:6px}
  ${W}.menu-open .burger span{transform:rotate(45deg)}
  ${W}.menu-open .burger span::before{transform:translateY(6px) rotate(-90deg)}
  ${W}.menu-open .burger span::after{opacity:0}

  .sheet{display:none}
  ${W}.w-lg .menu,${W}.w-lg .nav .btn.desk,${W}.w-lg .langsw:not(.langsw-sheet){display:none}
  ${W}.w-lg .burger{display:flex}
  ${W}.w-lg .sheet{
    display:block;position:fixed;top:74px;left:var(--pad);right:var(--pad);z-index:99;padding:16px;border-radius:var(--r-md);
    opacity:0;transform:translateY(-14px) scale(.97);pointer-events:none;
    transition:opacity .4s var(--ease),transform .5s var(--ease);
    background:linear-gradient(150deg,${S(0.96)},${S(0.9)});border-color:${S(0.9)};
    max-height:calc(100vh - 96px);overflow-y:auto;
  }
  ${W}.w-lg.is-canvas .sheet,${W}.w-lg.hdr-static .sheet{position:absolute}
  ${W}.w-lg.menu-open .sheet{opacity:1;transform:none;pointer-events:auto}
  ${W}.w-lg .sheet a{display:block;padding:15px 16px;border-radius:var(--r-sm);font-size:1.04rem;font-weight:540;color:var(--ink)}
  ${W}.w-lg .sheet > a+a{border-top:1px solid var(--line)}
  ${W}.w-lg .sheet a.btn{
    display:flex;width:100%;margin-top:12px;border-top:0;padding:16px 22px;
    font-size:1rem;font-weight:560;border-radius:var(--r-btn);
  }
  ${W}.w-lg .sheet a.btn-primary{color:var(--btn-text)}
  ${W}.w-lg .sheet a.btn-primary.btn{${sh.primaryStyle === "outline" ? "color:var(--brand)" : ""}}

  /* ---------------- úvod ---------------- */
  .hero{padding-top:clamp(118px,15vw,168px);padding-bottom:clamp(40px,6vw,70px)}
  ${W}:not(.w-lg) .hero-grid{display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(32px,4vw,64px);align-items:center}
  ${W}:not(.w-lg) .hero-grid .hero-stage{margin-top:0}
  ${W}:not(.w-lg) .hero h1{font-size:calc(${tScale} * clamp(2.6rem,4.4vw,4.4rem))}
  ${W}:not(.w-lg) .hero .lede{max-width:46ch}
  .hero h1{font-size:calc(${tScale} * clamp(2.6rem,7vw,5.2rem));letter-spacing:-.04em;line-height:1.02;font-weight:calc(var(--hw) + 40)}
  .hero .lede{margin-top:26px;font-size:clamp(1.06rem,1.5vw,1.32rem);max-width:54ch}
  .hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:38px}
  .hero-stage{margin-top:clamp(36px,5vw,60px)}
  .hero-stage .shot{position:relative;aspect-ratio:1/1;width:100%;max-width:620px;margin-inline:auto}
  .hero-stage.framed .shot{border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-l);background:var(--bg-2)}
  .slide{
    position:absolute;inset:0;margin:0;
    opacity:0;transform:scale(1.04) translate3d(0,8px,0);
    transition:opacity .7s var(--ease-soft),transform .9s var(--ease-soft);
    will-change:opacity,transform;
  }
  .slide.on{opacity:1;transform:none}
  .slide > img,.slide > video,.slide > iframe,.slide > .ph{position:absolute;inset:0;width:100%;height:100%;border:0}
  .hero-stage.cutout .slide > img,.hero-stage.cutout .slide > video{
    object-fit:contain;
    filter:drop-shadow(0 30px 38px ${SH(0.18)}) drop-shadow(0 6px 12px ${SH(0.09)});
  }
  .hero-stage.cutout .slide > .ph{border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-m)}
  .hero-stage.framed .slide > img,.hero-stage.framed .slide > video{object-fit:cover}
  .dots{display:flex;justify-content:center;gap:8px;margin-top:clamp(14px,1.6vw,22px)}
  .dots button{
    width:30px;height:5px;border-radius:99px;border:0;padding:0;cursor:pointer;
    background:${I(0.16)};transition:background .35s var(--ease),transform .35s var(--ease);
  }
  .dots button:hover{background:${I(0.3)}}
  .dots button[aria-selected="true"]{background:var(--brand);transform:scaleX(1.18)}

  /* ---------------- zástupné obrázky ---------------- */
  .ph{position:relative;width:100%;height:100%;display:block;overflow:hidden;
    background:
      linear-gradient(${I(0.05)} 1px,transparent 1px) 0 0/40px 40px,
      linear-gradient(90deg,${I(0.05)} 1px,transparent 1px) 0 0/40px 40px,
      radial-gradient(90% 90% at 28% 18%,${H(0.9)},transparent 70%),
      linear-gradient(135deg,var(--bg),var(--bg-2));}
  .ph svg{position:absolute;inset:0;width:100%;height:100%;max-width:none}
  .ph svg g{stroke:var(--ink-3);stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
  .ph svg .k{stroke:var(--brand);stroke-width:3;fill:none;stroke-linecap:round}
  .ph svg .kf{fill:var(--brand);stroke:none}
  .ph-hint{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:2;
    padding:5px 10px;border-radius:8px;background:${withAlpha(c.ink, 0.78)};color:${c.bg};
    font-size:11px;font-weight:600;letter-spacing:0;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis}

  /* ---------------- sekční video ---------------- */
  .sec-bgvideo{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;container-type:size}
  .sec-bgvideo video,.sec-bgvideo iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}
  /* iframe neumí object-fit: 16:9 přehrávač se zvětší tak, aby sekci celou zakryl */
  .sec-bgvideo iframe{inset:auto;left:50%;top:50%;width:max(100cqw,177.78cqh);height:max(100cqh,56.25cqw);transform:translate(-50%,-50%)}
  .sec-bgvideo i{position:absolute;inset:0;background:var(--bg)}
  .has-bgvideo{isolation:isolate;overflow:hidden}
  .sec-video{margin-top:clamp(36px,4.5vw,58px);padding:clamp(8px,.9vw,12px);border-radius:var(--r-lg)}
  .sec-video .box{position:relative;aspect-ratio:16/9;border-radius:calc(var(--r-lg) - 6px);overflow:hidden;background:var(--bg-2)}
  .sec-video video,.sec-video iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}

  /* ---------------- O nás ---------------- */
  .onas{position:relative;overflow:hidden;isolation:isolate}
  .onas-rok{
    position:absolute;right:-2vw;top:clamp(40px,6vw,90px);z-index:-1;pointer-events:none;
    font-size:clamp(9rem,26vw,24rem);font-weight:800;letter-spacing:-.06em;line-height:.8;
    color:transparent;-webkit-text-stroke:1.5px ${B(0.13)};
    transform:translate3d(0,var(--rok,0px),0);will-change:transform;user-select:none;
  }
  .onas-nadpis .slovo{display:inline-block}
  ${W}.anim .onas-nadpis .slovo{
    opacity:0;transform:translate3d(0,.45em,0) rotate(1.5deg);
    transition:opacity .5s var(--ease-soft),transform .6s var(--ease-soft);
    transition-delay:calc(var(--n) * 55ms);
  }
  ${W}.anim .onas.vidno .onas-nadpis .slovo{opacity:1;transform:none}
  .onas-grid{
    display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
    gap:clamp(30px,5vw,80px);align-items:center;margin-top:clamp(36px,4.5vw,60px);
  }
  ${W}.w-md .onas-grid{grid-template-columns:1fr}
  .onas-lead{font-size:clamp(1.12rem,1.45vw,1.38rem);line-height:1.6;color:var(--ink);letter-spacing:-.018em;font-weight:450}
  .onas-lead.drop::first-letter{font-size:3.1em;font-weight:700;color:var(--brand);float:left;line-height:.84;margin:.07em .12em 0 0}
  .onas-body{margin-top:20px;color:var(--ink-2);font-size:clamp(1rem,1.05vw,1.07rem);line-height:1.72}
  .onas-lead b,.onas-lead strong{color:var(--brand);font-weight:640}
  ${W}.anim .onas-odkryt{opacity:0;transform:translate3d(0,16px,0);
    transition:opacity .55s var(--ease-soft) var(--d),transform .65s var(--ease-soft) var(--d)}
  ${W}.anim .onas.vidno .onas-odkryt{opacity:1;transform:none}

  .milniky{
    position:relative;display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:18px;
    margin-top:clamp(34px,4vw,50px);padding:30px 0 0;list-style:none;
  }
  .milniky::before,.milniky::after{content:"";position:absolute;left:7px;right:7px;top:7px;height:2px;border-radius:2px;z-index:0}
  .milniky::before{background:${I(0.1)}}
  .milniky::after{background:linear-gradient(90deg,var(--brand),var(--brand-deep));transform-origin:left center}
  ${W}.anim .milniky::after{transform:scaleX(0);transition:transform .85s var(--ease-soft) .2s}
  ${W}.anim .onas.osa .milniky::after{transform:scaleX(1)}
  .milniky li{position:relative;z-index:1;display:grid;gap:6px;align-content:start}
  .milniky li::before{
    content:"";position:absolute;left:0;top:-30px;width:16px;height:16px;border-radius:50%;
    background:var(--surface);border:2.5px solid var(--brand);box-shadow:0 0 0 5px var(--brand-soft);
  }
  ${W}.anim .milniky li{opacity:0;transform:translateY(14px);
    transition:opacity .5s var(--ease-soft),transform .55s var(--ease-soft);
    transition-delay:calc(.25s + var(--n) * .18s)}
  ${W}.anim .milniky li::before{transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1);
    transition-delay:calc(.25s + var(--n) * .18s)}
  ${W}.anim .onas.osa .milniky li{opacity:1;transform:none}
  ${W}.anim .onas.osa .milniky li::before{transform:scale(1)}
  .milnik-rok{font-size:clamp(1.3rem,1.8vw,1.6rem);font-weight:700;letter-spacing:-.035em;color:var(--ink)}
  .milnik-text{font-size:.92rem;line-height:1.5;color:var(--ink-2)}
  ${W}.w-sm .milniky{grid-template-columns:1fr;padding-top:0;padding-left:34px;gap:22px}
  ${W}.w-sm .milniky::before,${W}.w-sm .milniky::after{left:7px;right:auto;top:6px;bottom:6px;width:2px;height:auto}
  ${W}.w-sm .milniky::after{transform-origin:center top}
  ${W}.anim.w-sm .milniky::after{transform:scaleY(0)}
  ${W}.anim.w-sm .onas.osa .milniky::after{transform:scaleY(1)}
  ${W}.w-sm .milniky li::before{left:-34px;top:4px}

  .onas-media{position:relative;display:grid;justify-items:center;padding:28px 0}
  ${W}.anim .onas .video-frame{
    clip-path:inset(9% 9% 9% 9% round var(--r-lg));transform:scale(.96);opacity:.35;
    transition:clip-path .85s var(--ease-soft) .05s,transform .85s var(--ease-soft) .05s,opacity .6s ease .05s;
  }
  ${W}.anim .onas.vidno .video-frame{clip-path:inset(0 0 0 0 round var(--r-lg));transform:none;opacity:1}
  ${W}.w-sm .onas .video-frame{max-width:270px}
  ${W}.w-sm .onas-rok{top:clamp(24px,6vw,40px);right:-5vw;font-size:clamp(6.5rem,34vw,9rem);-webkit-text-stroke-width:1.2px}
  ${W}:not(.w-md) .onas{padding-block:clamp(92px,12.5vh,140px) clamp(36px,7vh,100px)}
  ${W}:not(.w-md) .onas > .wrap{
    display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto auto auto;
    column-gap:clamp(36px,5.5vw,90px);align-items:start;
  }
  ${W}:not(.w-md) .onas-grid{display:contents}
  ${W}:not(.w-md) .onas .eyebrow{grid-column:1;grid-row:1;justify-self:start;margin-bottom:clamp(12px,2.4vh,24px)}
  ${W}:not(.w-md) .onas-nadpis{grid-column:1;grid-row:2;font-size:calc(${tScale} * clamp(2rem,min(4.2vw,7.2vh),3.5rem))}
  ${W}:not(.w-md) .onas-text{grid-column:1;grid-row:3;margin-top:clamp(16px,3.4vh,40px)}
  ${W}:not(.w-md) .onas-media{grid-column:2;grid-row:1 / 4;align-self:center;padding:0}
  ${W}:not(.w-md) .onas .sec-video{grid-column:1 / -1;grid-row:4}
  ${W}:not(.w-md) .onas .video-frame{width:auto;max-width:none;height:clamp(340px,calc(100vh - 190px),640px)}
  ${W}.w-md .onas .video-frame{max-height:72vh;width:auto;max-width:100%}
  .video-frame{
    position:relative;width:100%;max-width:360px;aspect-ratio:var(--ar,300/566);
    border-radius:var(--r-lg);overflow:hidden;background:var(--bg-2);box-shadow:var(--shadow-m);
  }
  .video-frame video,.video-frame iframe,.video-frame img,.video-frame .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;border:0;background:var(--bg-2)}

  /* ---------------- čísla ---------------- */
  .stats{
    position:relative;overflow:hidden;isolation:isolate;
    padding-block:clamp(46px,6vw,86px);margin-block:clamp(10px,2vw,26px);
    -webkit-mask-image:linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);
    mask-image:linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);
  }
  .stats-bg{position:absolute;left:0;right:0;top:-32%;bottom:-32%;z-index:-1;overflow:hidden;background:var(--bg-2)}
  .stats-bg img,.stats-bg video{
    width:100%;height:100%;object-fit:cover;filter:saturate(.4) contrast(1.04);
    transform:translate3d(0,var(--posun,0px),0);will-change:transform;max-width:none;
  }
  .stats-bg .tint{
    position:absolute;inset:0;
    background:
      linear-gradient(118deg,${B(0.62)},${BD(0.44)} 52%,${B(0.58)}),
      linear-gradient(180deg,${withAlpha(c.bg, 0.42)},${withAlpha(c.bg, 0.3)});
  }
  .facts{display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:clamp(16px,2.4vw,34px)}
  .fact{padding:clamp(24px,2.4vw,32px) clamp(20px,2.2vw,28px);border-radius:var(--r-md)}
  .fact.glass{background:linear-gradient(150deg,${S(0.52)},${S(0.34)} 46%,${S(0.44)});border-color:${S(0.62)}}
  .fact dt{font-size:clamp(1.9rem,3.4vw,2.9rem);overflow-wrap:break-word;font-weight:700;letter-spacing:-.045em;line-height:1;font-variant-numeric:tabular-nums}
  .fact dd{margin:10px 0 0;color:var(--ink);font-size:.95rem;line-height:1.45;font-weight:540}
  ${W}.w-md .facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${W}.w-sm .stats{padding-block:clamp(36px,9vw,56px)}
  ${W}.w-sm .fact{padding:20px 18px}
  ${W}.w-sm .fact dd{font-size:.88rem}
  ${W}.w-xxs .facts{grid-template-columns:1fr}
  .stats + section{padding-top:clamp(44px,7vw,96px)}

  /* ---------------- karty služeb ---------------- */
  .grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,1.8vw,22px);margin-top:clamp(40px,5vw,62px)}
  .card{
    padding:clamp(26px,2.6vw,34px);border-radius:var(--r-md);display:flex;flex-direction:column;gap:12px;
    transition:transform .55s var(--ease),box-shadow .55s var(--ease);
  }
  .card:hover{transform:translateY(-5px);box-shadow:var(--shadow-l),inset 0 1px 0 ${H(0.95)}}
  .card h3{font-size:1.2rem;font-weight:620;letter-spacing:-.024em}
  .card p{color:var(--ink-2);font-size:.97rem;line-height:1.58}
  .ico{
    width:48px;height:48px;border-radius:var(--r-ico);display:grid;place-items:center;margin-bottom:6px;
    background:linear-gradient(160deg,${c.surface},${S(0.55)});border:1px solid ${S(0.9)};
    box-shadow:0 8px 18px -12px ${SH(0.5)};color:var(--brand);
  }
  .ico svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
  .cards{align-items:start;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr))}
  ${W}.w-lg .cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${W}.w-sm .cards{grid-template-columns:1fr}
  .slot{position:relative}
  .card.open-card{
    position:absolute;top:0;left:0;right:0;padding:0;overflow:hidden;
    display:grid;grid-template-rows:auto auto 0fr;gap:0;
    transition:grid-template-rows .55s var(--ease),transform .5s var(--ease),box-shadow .5s var(--ease);
  }
  .card-media{margin:0;overflow:hidden;background:var(--bg-2);position:relative;aspect-ratio:16/10}
  .card-media > img,.card-media > video,.card-media > iframe,.card-media > .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0;transition:transform 1s var(--ease-soft)}
  .card-media.vyrez{background:linear-gradient(160deg,var(--bg),var(--bg-2) 60%,var(--bg-2))}
  .card-media.vyrez > img{object-fit:contain;padding:clamp(8px,1.4vw,16px)}
  .card-body{padding:clamp(20px,2.2vw,28px);display:flex;flex-direction:column;gap:10px}
  .card-more{overflow:hidden;min-height:0}
  .card-more-in{
    padding:20px clamp(20px,2.2vw,28px) clamp(22px,2.4vw,28px);
    display:flex;flex-direction:column;gap:16px;
    border-top:1px solid var(--line);margin-top:2px;
    opacity:0;transform:translateY(8px);transition:opacity .4s ease .1s,transform .45s var(--ease) .1s;
  }
  .mini{display:grid;gap:9px}
  .mini li{position:relative;padding-left:22px;font-size:.92rem;color:var(--ink-2);line-height:1.5}
  .mini li::before{content:"";position:absolute;left:0;top:.55em;width:7px;height:7px;border-radius:50%;background:var(--brand);opacity:.85}
  .thumbs{display:grid;grid-template-columns:repeat(var(--n,2),1fr);gap:10px}
  .thumb{position:relative;height:92px;border-radius:calc(var(--r-sm) - 2px);overflow:hidden;background:var(--bg-2);border:1px solid ${S(0.7)};padding:0;cursor:zoom-in}
  .thumb.fit{background:linear-gradient(160deg,var(--bg),var(--bg-2))}
  .thumbs.tri .thumb{height:clamp(110px,9vw,140px)}
  .thumb > img,.thumb > .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .thumb.fit > img{object-fit:contain;padding:6px}
  .card-toggle{
    position:absolute;right:14px;bottom:14px;width:40px;height:40px;border-radius:var(--r-ico);
    display:grid;place-items:center;cursor:pointer;color:var(--brand);
    background:${S(0.72)};border:1px solid ${S(0.85)};
    -webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);
    box-shadow:0 8px 20px -12px ${SH(0.6)};z-index:2;
    transition:transform .45s var(--ease),background .3s,color .3s;
  }
  .card-toggle svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}
  .card.open-card.is-open{grid-template-rows:auto auto 1fr;z-index:20;transform:translateY(-5px);box-shadow:var(--shadow-l),inset 0 1px 0 ${H(0.95)}}
  .card.open-card.is-open .card-more-in{opacity:1;transform:none}
  .card.open-card.is-open .card-media > img{transform:scale(1.04)}
  .card.open-card.is-open .card-toggle{transform:rotate(135deg);background:var(--brand);color:var(--btn-text);border-color:transparent}
  @media (hover:hover){
    .card.open-card:hover{grid-template-rows:auto auto 1fr;z-index:20;transform:translateY(-5px);box-shadow:var(--shadow-l),inset 0 1px 0 ${H(0.95)}}
    .card.open-card:hover .card-more-in{opacity:1;transform:none}
    .card.open-card:hover .card-media > img{transform:scale(1.04)}
    .card.open-card:hover .card-toggle{transform:rotate(135deg);background:var(--brand);color:var(--btn-text);border-color:transparent}
  }
  .card.open-card:focus-within{grid-template-rows:auto auto 1fr;z-index:20;box-shadow:var(--shadow-l)}
  .card.open-card:focus-within .card-more-in{opacity:1;transform:none}
  ${W}.w-sm .thumb{height:80px}
  ${W}.w-sm .card-toggle{width:38px;height:38px;right:12px;bottom:12px}

  /* ---------------- dělené sekce ---------------- */
  .split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,64px);align-items:center}
  .split.rev > .media{order:-1}
  ${W}.w-md .split{grid-template-columns:1fr}
  ${W}.w-md .split.rev > .media{order:0}
  .media{padding:clamp(9px,1.1vw,13px);border-radius:var(--r-lg)}
  .media .shot{position:relative;border-radius:calc(var(--r-lg) - 6px);overflow:hidden;background:var(--bg-2);height:clamp(240px,34vw,460px)}
  .media .shot > img,.media .shot > video,.media .shot > iframe,.media .shot > .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}
  .checks{margin-top:28px;display:grid;gap:13px}
  .checks li{display:flex;gap:13px;align-items:flex-start;color:var(--ink-2);font-size:1rem;line-height:1.5}
  .checks li b{color:var(--ink);font-weight:620}
  .checks svg{flex:0 0 21px;width:21px;height:21px;margin-top:2px;stroke:var(--brand);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .tech{display:flex;flex-wrap:wrap;gap:10px;margin-top:34px}
  .tech li{
    padding:11px 19px;border-radius:var(--r-btn);font-size:.94rem;font-weight:520;color:var(--ink);
    background:${S(0.72)};border:1px solid ${S(0.85)};box-shadow:var(--shadow-s);
    -webkit-backdrop-filter:blur(14px) saturate(170%);backdrop-filter:blur(14px) saturate(170%);
    transition:transform .4s var(--ease),box-shadow .4s var(--ease);
  }
  .tech li:hover{transform:translateY(-3px);box-shadow:var(--shadow-m)}

  /* ---------------- postup ---------------- */
  .flow{position:relative;max-width:760px;margin:clamp(44px,5vw,66px) auto 0;padding-left:64px;
        display:flex;flex-direction:column;gap:clamp(22px,2.6vw,34px);list-style:none}
  .flow::before,.flow::after{content:"";position:absolute;left:19px;width:2px;border-radius:2px;z-index:0}
  .flow::before{top:var(--line-top,28px);height:var(--line-h,0px);background:${I(0.11)}}
  .flow::after{top:var(--line-top,28px);height:var(--progress,0px);background:linear-gradient(180deg,var(--brand),var(--brand-deep));
               box-shadow:0 0 14px ${B(0.35)};opacity:0;transition:opacity .3s ease}
  .flow.live::after{opacity:1}
  .step{position:relative;z-index:2}
  .step .num{
    position:absolute;left:-64px;top:50%;transform:translateY(-50%);
    width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:.92rem;font-weight:640;letter-spacing:-.02em;color:var(--brand);
    background:${S(0.92)};border:1.5px solid ${I(0.12)};
    box-shadow:0 6px 14px -10px ${SH(0.5)};overflow:visible;
    transition:background .35s var(--ease),border-color .35s var(--ease),color .35s var(--ease),transform .4s var(--ease),box-shadow .4s var(--ease);
  }
  .step .num.on{
    background:linear-gradient(145deg,var(--brand),var(--brand-deep));border-color:transparent;color:var(--btn-text);
    transform:translateY(-50%) scale(1.09);box-shadow:0 10px 24px -8px ${B(0.6)};
  }
  .step .card{padding:clamp(18px,2vw,24px) clamp(20px,2.2vw,28px);border-radius:var(--r-md);gap:6px;transform-origin:left center}
  .step .card:hover{transform:none}
  ${W}.anim .step .card{opacity:0;will-change:transform,opacity;transform:translateX(-12px) scaleX(.62) scaleY(.78);transition:opacity .3s ease}
  ${W}.anim .step .card.open{opacity:1;animation:sonadStepOpen .6s var(--ease-soft) forwards}
  .step .card h3{font-size:1.06rem;font-weight:620;letter-spacing:-.022em}
  .step .card p{font-size:.94rem;color:var(--ink-2);line-height:1.55}
  @keyframes sonadStepOpen{
    0%{transform:translateX(-12px) scaleX(.62) scaleY(.78)}
    55%{transform:translateX(0) scaleX(1.025) scaleY(.98)}
    100%{transform:none}
  }
  .spark{
    position:absolute;top:50%;left:50%;width:5px;height:5px;border-radius:50%;
    pointer-events:none;opacity:0;transform:translate(-50%,-50%);z-index:5;
    background:currentColor;box-shadow:0 0 6px currentColor;
    animation:sonadSpark .75s var(--ease) forwards;
  }
  @keyframes sonadSpark{
    0%{opacity:.9;transform:translate(-50%,-50%) rotate(var(--a)) translateX(2px) scale(1)}
    70%{opacity:.7}
    100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateX(var(--d)) scale(.2)}
  }
  ${W}.w-xs .flow{padding-left:54px}
  ${W}.w-xs .flow::before,${W}.w-xs .flow::after{left:16px}
  ${W}.w-xs .step .num{left:-54px;width:34px;height:34px;font-size:.85rem}

  /* ---------------- galerie ---------------- */
  .pas{position:relative;margin-top:clamp(36px,4.5vw,58px)}
  .pas-stopa{
    display:flex;gap:clamp(12px,1.6vw,20px);overflow-x:auto;scroll-behavior:smooth;
    scroll-snap-type:x mandatory;padding:6px 2px 10px;scrollbar-width:none;-ms-overflow-style:none;
  }
  .pas-stopa::-webkit-scrollbar{display:none}
  .snimek{
    flex:0 0 clamp(250px,30vw,400px);margin:0;scroll-snap-align:start;
    padding:clamp(8px,.9vw,11px);border-radius:var(--r-lg);position:relative;
    transition:transform .5s var(--ease),box-shadow .5s var(--ease);
  }
  .snimek:hover{transform:translateY(-5px);box-shadow:var(--shadow-l),inset 0 1px 0 ${H(0.95)}}
  .snimek .box{position:relative;width:100%;height:clamp(200px,23vw,290px);border-radius:calc(var(--r-lg) - 6px);overflow:hidden;background:var(--bg-2)}
  .snimek .box > img,.snimek .box > video,.snimek .box > iframe,.snimek .box > .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}
  .snimek figcaption{
    position:absolute;left:clamp(16px,1.6vw,20px);bottom:clamp(16px,1.6vw,20px);
    padding:8px 15px;border-radius:var(--r-btn);font-size:.83rem;font-weight:540;color:var(--ink);
    background:${S(0.72)};border:1px solid ${S(0.8)};
    -webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);
    box-shadow:0 8px 20px -12px ${SH(0.5)};
  }
  .pas-sipka{
    position:absolute;top:50%;transform:translateY(-50%);z-index:3;
    width:50px;height:50px;border-radius:var(--r-ico);cursor:pointer;display:grid;place-items:center;
    color:var(--ink);background:${S(0.84)};border:1px solid ${S(0.9)};
    -webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);
    box-shadow:var(--shadow-m);transition:transform .35s var(--ease),background .25s,color .25s,opacity .3s;
  }
  .pas-sipka svg{width:21px;height:21px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  .pas-sipka.vlevo{left:clamp(-6px,-.6vw,0px)}
  .pas-sipka.vpravo{right:clamp(-6px,-.6vw,0px)}
  .pas-sipka:hover{background:var(--brand);color:var(--btn-text);border-color:transparent;transform:translateY(-50%) scale(1.06)}
  .pas-sipka[disabled]{opacity:0;pointer-events:none}
  ${W}.w-sm .snimek{flex-basis:78%}
  ${W}.w-sm .pas-sipka{width:44px;height:44px}

  /* ---------------- kontakt ---------------- */
  .rychle{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
  .podnadpis{font-size:clamp(1.15rem,1.5vw,1.4rem);font-weight:640;letter-spacing:-.025em;margin:clamp(40px,4.5vw,64px) 0 clamp(18px,2vw,26px)}
  .lide{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.8vw,22px)}
  ${W}.w-md .lide{grid-template-columns:repeat(2,minmax(0,1fr))}
  ${W}.w-xs .lide{grid-template-columns:1fr}
  .osoba{padding:clamp(20px,2.2vw,26px);border-radius:var(--r-md);display:grid;gap:4px;align-content:start}
  .osoba h4{font-size:1.06rem;font-weight:640;letter-spacing:-.022em;margin:0}
  .osoba .role{color:var(--ink-3);font-size:.88rem;margin-bottom:12px}
  .spojeni{display:flex;align-items:center;gap:9px;padding:5px 0;font-size:.96rem;color:var(--ink-2);transition:color .25s;word-break:break-word}
  .spojeni svg{flex:0 0 17px;width:17px;height:17px;stroke:var(--brand);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .spojeni:hover{color:var(--brand)}
  .udaje{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:clamp(14px,1.8vw,22px)}
  .udaj{padding:clamp(22px,2.4vw,30px);border-radius:var(--r-md);display:grid;gap:8px;align-content:start}
  .udaj h4{font-size:1.06rem;font-weight:640;letter-spacing:-.022em;margin:2px 0}
  .udaj address{color:var(--ink-2);font-size:.99rem;line-height:1.6}
  .udaj address strong{color:var(--ink);font-weight:600}
  .note{display:block;font-size:.82rem;color:var(--ink-3);line-height:1.5}
  .velky-mail{font-size:clamp(1.05rem,1.3vw,1.2rem);font-weight:620;letter-spacing:-.02em;color:var(--brand);word-break:break-word}
  .velky-mail:hover{color:var(--brand-deep)}
  .socky{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
  .socky a{
    width:44px;height:44px;border-radius:var(--r-ico);display:grid;place-items:center;color:var(--brand);
    background:${S(0.72)};border:1px solid ${S(0.85)};box-shadow:0 8px 18px -12px ${SH(0.5)};
    transition:transform .35s var(--ease),background .25s,color .25s,border-color .25s;
  }
  .socky a.empty{opacity:.35;outline:1.5px dashed var(--ink-3)}
  .socky svg{width:21px;height:21px}
  .socky a:hover{transform:translateY(-3px);background:var(--brand);color:var(--btn-text);border-color:transparent}
  .hodiny{margin:4px 0 0;display:grid;gap:2px}
  .den{display:flex;justify-content:space-between;gap:12px;padding:6px 10px;border-radius:9px;font-size:.95rem;color:var(--ink-2)}
  .den dd{font-variant-numeric:tabular-nums;white-space:nowrap}
  .den.dnes{background:var(--brand-soft);color:var(--ink);font-weight:600}
  .den.dnes dt::after{content:" · " attr(data-dnes);color:var(--brand);font-weight:600}

  .mapa{position:relative;margin-top:clamp(28px,3.4vw,44px);padding:clamp(8px,.9vw,12px);border-radius:var(--r-lg);overflow:hidden}
  .mapa iframe{display:block;width:100%;border:0;border-radius:calc(var(--r-lg) - 6px);background:linear-gradient(160deg,var(--bg),var(--bg-2))}
  .mapa-nadech{position:absolute;inset:clamp(8px,.9vw,12px);border-radius:calc(var(--r-lg) - 6px);pointer-events:none;z-index:1}
  .mapa-adresa{
    position:absolute;left:clamp(18px,2vw,26px);top:clamp(18px,2vw,26px);z-index:3;
    display:grid;gap:2px;padding:14px 18px;border-radius:var(--r-sm);
    font-size:.9rem;color:var(--ink-2);line-height:1.45;max-width:min(320px,70%);
  }
  .mapa-adresa strong{color:var(--ink);font-weight:620;font-size:.96rem;letter-spacing:-.015em}
  .mapa-odkaz{position:absolute;right:clamp(18px,2vw,26px);bottom:clamp(18px,2vw,26px);padding:11px 18px;font-size:.9rem;z-index:3}
  .mapa-prazdna{display:grid;place-items:center;height:240px;color:var(--ink-3);font-size:.92rem;text-align:center;padding:20px}

  /* ---------------- patička ---------------- */
  footer{padding:clamp(48px,6vw,78px) 0 34px;border-top:1px solid var(--line);position:relative}
  .foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1.15fr .8fr;gap:clamp(26px,3.4vw,52px)}
  ${W}.w-lg .foot-grid{grid-template-columns:1fr 1fr}
  ${W}.w-sm .foot-grid{grid-template-columns:1fr;gap:34px}
  .foot-col h3{font-size:.79rem;text-transform:uppercase;letter-spacing:.1em;color:var(--ink-3);font-weight:620;margin-bottom:16px}
  .foot-brand .brand{margin-bottom:16px}
  .foot-brand p{color:var(--ink-2);font-size:.95rem;line-height:1.6;max-width:42ch}
  .foot-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
  .foot-cta .btn{padding:${Math.round(12 * pad)}px ${Math.round(20 * pad)}px;font-size:.92rem}
  .foot-brand .socky{margin-top:20px}
  .foot-col address{font-size:.97rem;line-height:1.65;color:var(--ink-2)}
  .foot-col address strong{color:var(--ink);font-weight:600}
  .foot-dl{margin:18px 0 0;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:.88rem}
  .foot-dl dt{color:var(--ink-3);font-weight:600}
  .foot-dl dd{color:var(--ink-2)}
  .foot-people{display:grid;gap:18px}
  .foot-people li{display:flex;flex-direction:column;gap:2px;font-size:.95rem}
  .foot-people .who{font-weight:600;color:var(--ink);letter-spacing:-.015em}
  .foot-people .role{font-size:.83rem;color:var(--ink-3)}
  .foot-people a{color:var(--ink-2);width:fit-content;transition:color .25s}
  .foot-people a:hover{color:var(--brand)}
  .foot-nav{display:flex;flex-direction:column;gap:2px}
  .foot-nav a{padding:5px 0;font-size:.95rem;color:var(--ink-2);width:fit-content;transition:color .25s}
  .foot-nav a:hover{color:var(--brand)}
  .copy{margin-top:clamp(34px,4vw,52px);padding-top:24px;border-top:1px solid var(--line);
        font-size:.84rem;color:var(--ink-3);display:flex;flex-wrap:wrap;gap:6px 20px;align-items:center}
  .copy a:hover{color:var(--brand)}

  /* ---------------- zvětšení fotky ---------------- */
  .lupa{
    position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:clamp(16px,4vw,52px);
    background:${withAlpha(c.bg2, 0.72)};
    -webkit-backdrop-filter:blur(26px) saturate(180%);backdrop-filter:blur(26px) saturate(180%);
    animation:sonadFade .3s var(--ease);
  }
  @keyframes sonadFade{from{opacity:0}to{opacity:1}}
  .lupa figure{max-width:min(1100px,100%);max-height:100%;display:grid;gap:14px;justify-items:center}
  .lupa img{
    max-width:100%;max-height:calc(100vh - clamp(90px,14vw,170px));width:auto;height:auto;object-fit:contain;
    border-radius:var(--r-md);filter:drop-shadow(0 30px 44px ${SH(0.28)}) drop-shadow(0 6px 12px ${SH(0.12)});
  }
  .lupa figcaption{font-size:.92rem;color:var(--ink-2);text-align:center;max-width:64ch;line-height:1.5}
  .lupa-zavrit{
    position:absolute;top:clamp(14px,2.4vw,26px);right:clamp(14px,2.4vw,26px);
    width:46px;height:46px;border-radius:50%;border:1px solid ${S(0.8)};cursor:pointer;
    display:grid;place-items:center;color:var(--ink);background:${S(0.8)};box-shadow:var(--shadow-m);
    transition:transform .35s var(--ease),background .25s,color .25s;
  }
  .lupa-zavrit svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}
  .lupa-zavrit:hover{transform:scale(1.07);background:var(--brand);color:var(--btn-text);border-color:transparent}

  /* ---------------- postupné objevování ---------------- */
  ${W}.anim .rv{opacity:0;transform:translate3d(0,18px,0);
      transition:opacity .55s var(--ease-soft),transform .65s var(--ease-soft);
      transition-delay:calc(var(--i,0)*60ms)}
  ${W}.anim .rv.in{opacity:1;transform:none}
  ${W}.anim .hero .rv{animation:sonadIntro .6s var(--ease-soft) both;animation-delay:calc(var(--i,0)*60ms)}
  @keyframes sonadIntro{from{opacity:0;transform:translate3d(0,18px,0)}to{opacity:1;transform:none}}
  ${W}.w-sm .hero h1 br,${W}.w-sm h2.title br{display:none}

  @media (prefers-reduced-motion:reduce){
    ${W}.anim .rv,${W}.anim .onas-nadpis .slovo,${W}.anim .milniky li,${W}.anim .milniky li::before,
    ${W}.anim .milniky::after,${W}.anim .onas .video-frame,${W}.anim .onas-odkryt,${W}.anim .step .card{
      opacity:1;transform:none;filter:none;clip-path:none;transition:none;animation:none}
    .slide{transition:opacity .3s ease;transform:none}
    .btn:hover,.card:hover,.tech li:hover,.snimek:hover{transform:none}
    .onas-rok,.stats-bg img{transform:none}
    .spark{display:none}
    .pas-stopa{scroll-behavior:auto}
  }
`
}

/* ------------------------------------------------------------------ */
/* Pomocníci                                                            */
/* ------------------------------------------------------------------ */

const useIsoLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

const imgSrc = (img: any): string => (typeof img === "string" ? img : img?.src || "")

const isVideoUrl = (u: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u || "")

/** YouTube / Vimeo odkaz → embed, který hraje ztlumeně ve smyčce. */
function embedUrl(link?: string, controls = false): string | null {
    if (!link) return null
    const yt = link.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
    if (yt)
        return controls
            ? `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`
            : `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&modestbranding=1&playsinline=1`
    const vm = link.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (vm)
        return controls
            ? `https://player.vimeo.com/video/${vm[1]}?title=0&byline=0`
            : `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1`
    return null
}

/** Z vloženého <iframe …> vytáhne src — to je to, co lidi reálně zkopírují. */
function iframeSrc(input?: string) {
    if (!input) return ""
    const m = input.match(/src=["']([^"']+)["']/i)
    return (m ? m[1] : input).trim().replace(/&amp;/g, "&")
}

const tel = (phone: string) => "tel:" + (phone || "").replace(/[^\d+]/g, "")

/** Seznam z textu: položky oddělené svislou čarou | nebo novým řádkem. */
const splitList = (s?: string) =>
    (s || "")
        .split(/\n|\|/)
        .map((x) => x.trim())
        .filter(Boolean)

/**
 * Text s jednoduchým značením:
 *   *slovo*    → zvýrazněné barvou značky
 *   **slovo**  → tučně
 *   | nebo Enter → nový řádek
 */
function rich(text?: string, breaks = true): React.ReactNode {
    if (!text) return null
    const lines = breaks ? String(text).split(/\n|\|/) : [String(text)]
    return lines.map((line, li) => (
        <React.Fragment key={li}>
            {li > 0 && <>{" "}<br /></>}
            {inline(line.trim())}
        </React.Fragment>
    ))
}
function inline(line: string): React.ReactNode[] {
    const out: React.ReactNode[] = []
    const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
    let last = 0
    let m: RegExpExecArray | null
    let k = 0
    while ((m = re.exec(line))) {
        if (m.index > last) out.push(line.slice(last, m.index))
        if (m[1] !== undefined) out.push(<b key={k++}>{m[1]}</b>)
        else out.push(<span className="accent" key={k++}>{m[2]}</span>)
        last = m.index + m[0].length
    }
    if (last < line.length) out.push(line.slice(last))
    return out
}

/** Nadpis rozložený na slova pro animaci „slovo po slově“. */
function wordsTitle(text?: string) {
    let n = 0
    return String(text || "")
        .split(/\n|\|/)
        .map((line, li) => (
            <React.Fragment key={li}>
                {li > 0 && <>{" "}<br /></>}
                {line
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((w, wi) => {
                        const acc = /^\*[^*]+\*$/.test(w)
                        const word = acc ? w.slice(1, -1) : w
                        const node = (
                            <span
                                key={wi}
                                className={"slovo" + (acc ? " accent" : "")}
                                style={{ ["--n" as any]: n++ }}
                            >
                                {word}
                            </span>
                        )
                        return (
                            <React.Fragment key={wi}>
                                {wi > 0 && " "}
                                {node}
                            </React.Fragment>
                        )
                    })}
            </React.Fragment>
        ))
}

/* ------------------------------------------------------------------ */
/* Ikony                                                               */
/* ------------------------------------------------------------------ */

const Arrow = ({ size = 16 }: any) => (
    <svg className="arw" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
)
const Check = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
)
const PhoneIco = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" /></svg>
)
const MailIco = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 7l9 6 9-6" /></svg>
)
const PinIco = () => (
    <svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
)
const DocIco = () => (
    <svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
)
const ClockIco = () => (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
)

/** Sociální sítě — plné ikony (fill) i obrysové (stroke). */
const SOCIAL: Record<string, { label: string; el: React.ReactNode }> = {
    facebook: {
        label: "Facebook",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V7c0-.8.2-1.2 1.4-1.2H17V3.1c-.3 0-1.2-.1-2.3-.1-2.4 0-4 1.4-4 4.1v1.4H8V12h2.7v9h3.2v-9h2.7l.4-3.5H14z" /></svg>,
    },
    instagram: {
        label: "Instagram",
        el: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5.2" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></svg>,
    },
    linkedin: {
        label: "LinkedIn",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.5h4V21H3V9.5zm7 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05C21.6 9.05 22 11.3 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4V9.5z" /></svg>,
    },
    youtube: {
        label: "YouTube",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z" /></svg>,
    },
    x: {
        label: "X",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>,
    },
    tiktok: {
        label: "TikTok",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.3v13.2a2.9 2.9 0 11-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 106.3 6.3V8.6a7.9 7.9 0 004.4 1.3V6.6a4.6 4.6 0 01-4.4-4.6z" /></svg>,
    },
    whatsapp: {
        label: "WhatsApp",
        el: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.5-.3z" /></svg>,
    },
    email: { label: "E-mail", el: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 7l9 6 9-6" /></svg> },
    web: {
        label: "Web",
        el: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>,
    },
}

/* ------------------------------------------------------------------ */
/* Zástupné kresby (převzaté z HTML) — barva značky se propisuje       */
/* ------------------------------------------------------------------ */

const DRAWINGS: Record<string, { vb: string; body: string }> = {
    design: { vb: "0 0 800 500", body: `<g><path d="M150 400V130h330l120 120v150"/><path d="M480 130v120h120"/><path d="M210 300h200M210 350h140"/><path d="M120 400h560"/><circle cx="560" cy="330" r="36"/><path d="M560 294v72M524 330h72"/></g><path class="k" d="M210 250h150"/>` },
    machine: { vb: "0 0 800 640", body: `<g><rect x="150" y="360" width="500" height="180" rx="10"/><rect x="215" y="150" width="370" height="210" rx="10"/><path d="M400 150V70M330 70h140"/><circle cx="400" cy="255" r="62"/><circle cx="400" cy="255" r="26"/><path d="M180 540v60M620 540v60M150 600h100M570 600h100"/></g><path class="k" d="M338 255h-42M504 255h42"/>` },
    fixture: { vb: "0 0 800 640", body: `<g><rect x="130" y="300" width="540" height="240" rx="12"/><path d="M130 380h540M250 300v240M420 300v240"/><circle cx="190" cy="340" r="14"/><circle cx="330" cy="340" r="14"/><path d="M470 320h150M470 360h110"/><path d="M200 170l90 90 90-90 90 90 90-90"/><path d="M110 540v50h580v-50"/></g><circle class="kf" cx="560" cy="340" r="14"/>` },
    assembly: { vb: "0 0 800 500", body: `<g><rect x="180" y="200" width="200" height="150" rx="10"/><rect x="420" y="260" width="200" height="150" rx="10"/><path d="M380 275h40M600 200l60-60M660 140h-50M660 140v50"/><circle cx="280" cy="275" r="28"/><circle cx="520" cy="335" r="28"/><path d="M120 430h560"/></g><path class="k" d="M380 275h40"/>` },
    workshop: { vb: "0 0 800 640", body: `<g><rect x="160" y="200" width="480" height="330" rx="14"/><path d="M160 290h480M240 200v330"/><path d="M300 350h260M300 410h180M300 470h220"/><circle cx="200" cy="245" r="10"/></g><rect class="kf" x="300" y="340" width="120" height="20" rx="10" opacity=".85"/>` },
    measure: { vb: "0 0 800 500", body: `<g><circle cx="400" cy="270" r="130"/><circle cx="400" cy="270" r="76"/><circle cx="400" cy="270" r="26"/><path d="M400 140v-50M400 400v50M270 270h-50M530 270h50"/><path d="M308 178l-34-34M492 178l34-34M308 362l-34 34M492 362l34 34"/></g><circle class="kf" cx="400" cy="270" r="10"/>` },
    milling: { vb: "0 0 800 640", body: `<g><path d="M170 520h460M200 520V250h400v270"/><path d="M200 330h400M200 420h400"/><circle cx="300" cy="290" r="18"/><circle cx="300" cy="375" r="18"/><circle cx="300" cy="470" r="18"/><path d="M380 285h180M380 375h140M380 470h180"/><path d="M400 250V140h210v110"/></g><path class="k" d="M400 140h210"/>` },
    turning: { vb: "0 0 800 640", body: `<g><circle cx="400" cy="345" r="185"/><circle cx="400" cy="345" r="120"/><circle cx="400" cy="345" r="42"/><path d="M400 160v-60M400 590v60M215 345h-60M585 345h60"/><path d="M270 215l-45-45M530 215l45-45M270 475l-45 45M530 475l45 45"/></g><circle class="kf" cx="400" cy="345" r="14"/>` },
    weld: { vb: "0 0 800 640", body: `<g><path d="M120 500h560"/><path d="M200 500V260l200-110 200 110v240"/><path d="M200 320h400M400 150v350"/><circle cx="300" cy="410" r="30"/><circle cx="500" cy="410" r="30"/></g><path class="k" d="M200 260l200-110 200 110"/>` },
    roll: { vb: "0 0 800 500", body: `<g><circle cx="250" cy="180" r="52"/><circle cx="550" cy="180" r="52"/><circle cx="400" cy="360" r="52"/><path d="M150 260q250 160 500 0"/><path d="M120 420h560"/></g><path class="k" d="M150 260q250 160 500 0"/>` },
    print: { vb: "0 0 800 500", body: `<g><rect x="180" y="120" width="440" height="60" rx="8"/><path d="M400 180v70"/><path d="M340 250h120l-30 60h-60z"/><path d="M250 420h300M250 420l150-80 150 80"/><path d="M400 340v80"/></g><path class="k" d="M370 310h60"/>` },
    laser: { vb: "0 0 800 500", body: `<g><rect x="280" y="110" width="240" height="90" rx="10"/><path d="M400 200v80"/><rect x="180" y="330" width="440" height="100" rx="10"/><path d="M250 380h90M380 380h60M480 380h90"/></g><path class="k" d="M400 200v80"/><circle class="kf" cx="400" cy="300" r="9"/>` },
    loco: { vb: "0 0 800 640", body: `<g><path d="M150 420h500"/><circle cx="290" cy="420" r="95"/><circle cx="290" cy="420" r="46"/><circle cx="290" cy="420" r="10"/><circle cx="530" cy="420" r="95"/><circle cx="530" cy="420" r="46"/><circle cx="530" cy="420" r="10"/><path d="M290 420l90-30M530 420l-90-30"/><path d="M110 420v-90h580v90"/><path d="M150 330h500v-60a20 20 0 00-20-20H170a20 20 0 00-20 20z"/><path d="M180 520v40M400 520v40M620 520v40"/></g><path class="k" d="M290 420l90-30"/>` },
}

const onCanvasNow = () => RenderTarget.current() === RenderTarget.canvas

function Placeholder({ name, hint }: { name: string; hint?: string }) {
    const d = DRAWINGS[name] || DRAWINGS.machine
    return (
        <span className="ph" aria-hidden="true">
            <svg viewBox={d.vb} preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: d.body }} />
            {hint && onCanvasNow() && <span className="ph-hint">{hint}</span>}
        </span>
    )
}

/**
 * Jeden slot na fotku NEBO video. Pořadí: nahrané video → odkaz na .mp4 →
 * YouTube/Vimeo → fotka (i fotka, do které někdo vložil .mp4) → zástupná kresba.
 */
function Media({ image, videoFile, videoLink, poster, alt, ph, hint, controls = false, eager = false }: any) {
    const img = imgSrc(image)
    const file = imgSrc(videoFile)
    const link = (videoLink || "").trim()
    const direct = file || (isVideoUrl(link) ? link : "") || (isVideoUrl(img) ? img : "")
    if (direct) {
        return (
            <video
                src={direct}
                poster={imgSrc(poster) || undefined}
                autoPlay={!controls}
                muted={!controls}
                loop={!controls}
                controls={controls}
                playsInline
                preload="metadata"
                aria-label={alt}
            />
        )
    }
    const emb = embedUrl(link, controls)
    if (emb) {
        return (
            <iframe
                src={emb}
                title={alt || "Video"}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
            />
        )
    }
    if (img) return <img src={img} alt={alt || ""} loading={eager ? "eager" : "lazy"} decoding="async" />
    return <Placeholder name={ph} hint={hint} />
}

/** Video pro každou sekci: pozadí sekce, nebo samostatný blok pod obsahem. */
function sectionVideo(g: any) {
    const has = !!(imgSrc(g?.videoFile) || (g?.videoLink || "").trim())
    return { has, mode: g?.videoMode || "background", g }
}
function SectionBgVideo({ v }: any) {
    if (!v.has || v.mode !== "background") return null
    const g = v.g
    return (
        <div className="sec-bgvideo" aria-hidden="true">
            <Media videoFile={g.videoFile} videoLink={g.videoLink} poster={g.videoPoster} alt="" />
            <i style={{ opacity: (g.videoOverlay ?? 70) / 100 }} />
        </div>
    )
}
function SectionBlockVideo({ v, boxClass }: any) {
    if (!v.has || v.mode !== "block") return null
    const g = v.g
    return (
        <div className={`sec-video ${boxClass} rv`}>
            <div className="box">
                <Media videoFile={g.videoFile} videoLink={g.videoLink} poster={g.videoPoster} alt={g.videoTitle || "Video"} controls={g.videoControls !== false} />
            </div>
        </div>
    )
}

/** Číslo, které se při odkrytí dopočítá od nuly. */
function CountUp({ value, prefix, suffix, thousands, run }: any) {
    const target = Number(value) || 0
    const fmt = (n: number) => (thousands ? n.toLocaleString("cs-CZ") : String(n))
    const [n, setN] = useState(target)
    const started = useRef(false)
    useEffect(() => {
        if (!run || started.current) {
            if (!run) setN(target)
            return
        }
        started.current = true
        let raf = 0
        let t0: number | null = null
        const step = (t: number) => {
            if (t0 === null) t0 = t
            const p = Math.min(1, (t - t0) / 1300)
            const e = 1 - Math.pow(1 - p, 3)
            setN(Math.round(target * e))
            if (p < 1) raf = requestAnimationFrame(step)
        }
        setN(0)
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [run, target])
    return (
        <>
            {prefix}
            {fmt(n)}
            {suffix}
        </>
    )
}

/* ------------------------------------------------------------------ */
/* Výchozí hodnoty                                                     */
/* ------------------------------------------------------------------ */

const DEFAULTS: any = {
    colors: {
        palette: "custom",
        ...PALETTES.sonad,
        brandDeepAuto: true,
        brandDeep: "#a4161e",
    },
    shapes: {
        boxStyle: "glass",
        boxRadius: 30,
        glassBlur: 26,
        shadow: 100,
        buttonShape: "pill",
        buttonRadius: 12,
        buttonSize: 100,
        primaryStyle: "filled",
        secondaryStyle: "glass",
        iconShape: "rounded",
    },
    type: {
        fontFamily:
            '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Inter,Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif',
        googleFont: "",
        headingWeight: 640,
        titleScale: 100,
        contentWidth: 1180,
    },
    effects: {
        animations: true,
        aura: true,
        parallax: true,
        countUp: true,
        spacing: 100,
    },
}

const merge = (d: any, v: any) => ({ ...d, ...(v || {}) })

/* ------------------------------------------------------------------ */
/* Komponenta                                                          */
/* ------------------------------------------------------------------ */

const CARD_PH = ["design", "assembly", "measure", "measure", "weld", "roll", "print", "laser"]
const THUMB_PH = ["machine", "fixture", "workshop", "milling", "turning", "weld"]
const GALLERY_PH = ["fixture", "workshop", "turning", "weld", "fixture", "milling"]
const FEATURE_PH = ["machine", "loco", "milling", "turning"]

/**
 * Framer čte tyto anotace jen přímo nad exportovanou komponentou.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 6000
 * @framerDisableUnlink
 */
export default function SonadSite(props: any) {
    const rootRef = useRef<HTMLDivElement>(null)
    const onCanvas = onCanvasNow()

    const colors = useMemo(() => resolveColors(props.colors), [props.colors])
    const shapes = merge(DEFAULTS.shapes, props.shapes)
    const type = merge(DEFAULTS.type, props.type)
    const fx = merge(DEFAULTS.effects, props.effects)

    const header = props.header || {}
    const hero = props.hero || {}
    const services = props.services || {}
    const features = props.features || {}
    const about = props.about || {}
    const stats = props.stats || {}
    const process = props.process || {}
    const gallery = props.gallery || {}
    const contact = props.contact || {}
    const map = props.map || {}
    const footer = props.footer || {}

    const animOn = fx.animations !== false && !onCanvas
    const reduce =
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false

    /* --- stylopis --- */
    const css = useMemo(
        () => scopeCSS(globalCSS(colors, shapes, type, fx), `.${ROOT}`),
        [JSON.stringify(colors), JSON.stringify(shapes), JSON.stringify(type), JSON.stringify(fx)]
    )
    useIsoLayoutEffect(() => {
        let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
        if (!el) {
            el = document.createElement("style")
            el.id = STYLE_ID
            document.head.appendChild(el)
        }
        el.textContent = css
    }, [css])

    /* --- šířka komponenty → třídy breakpointů --- */
    const [widthClass, setWidthClass] = useState("")
    useIsoLayoutEffect(() => {
        const el = rootRef.current
        if (!el) return
        const apply = (w: number) => {
            if (!w) return
            const c: string[] = []
            if (w <= 1080) c.push("w-lg")
            if (w <= 900) c.push("w-md")
            if (w <= 640) c.push("w-sm")
            if (w <= 560) c.push("w-xs")
            if (w <= 380) c.push("w-xxs")
            const next = c.join(" ")
            setWidthClass((prev) => (prev === next ? prev : next))
        }
        apply(el.offsetWidth)
        if (typeof ResizeObserver === "undefined") {
            const on = () => apply(el.offsetWidth)
            window.addEventListener("resize", on)
            return () => window.removeEventListener("resize", on)
        }
        const ro = new ResizeObserver((e) => apply(e[0].contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    /* --- animace se zapnou až po načtení, bez skriptu je vidět všechno --- */
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const anim = animOn && mounted && !reduce

    /* --- záhlaví ztmavne po odscrollování --- */
    const [slim, setSlim] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)
    const [active, setActive] = useState("#top")

    const menuItems: any[] = Array.isArray(header.menu) ? header.menu : []

    useEffect(() => {
        if (onCanvas) return
        let raf = 0
        const on = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                setSlim(window.scrollY > 4)
                // podbarví se položka menu sekce, kterou zrovna čtete
                const line = window.innerHeight * 0.34
                const links = [...menuItems.map((m) => m?.link), header.ctaLink].filter(
                    (l) => typeof l === "string" && l.startsWith("#")
                )
                let cur = "#top"
                let best = -Infinity
                for (const l of links) {
                    if (l === "#top") continue
                    const el = document.getElementById(l.slice(1))
                    if (!el) continue
                    const top = el.getBoundingClientRect().top
                    if (top <= line && top > best) {
                        best = top
                        cur = l
                    }
                }
                setActive(cur)
            })
        }
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        on()
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            cancelAnimationFrame(raf)
        }
    }, [onCanvas, JSON.stringify(menuItems), header.ctaLink])

    /* --- Escape zavře menu, jazyky i zvětšenou fotku --- */
    const [lupa, setLupa] = useState<any>(null)
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            setMenuOpen(false)
            setLangOpen(false)
            setLupa(null)
            setOpenCard(-1)
        }
        const click = (e: MouseEvent) => {
            const t = e.target as HTMLElement
            if (!t?.closest) return
            if (!t.closest(".langsw")) setLangOpen(false)
            if (!t.closest(".sheet") && !t.closest(".burger")) setMenuOpen(false)
            if (!t.closest(".cards .slot")) setOpenCard(-1)
        }
        document.addEventListener("keydown", key)
        document.addEventListener("click", click)
        return () => {
            document.removeEventListener("keydown", key)
            document.removeEventListener("click", click)
        }
    }, [])
    useEffect(() => {
        if (!lupa || typeof document === "undefined") return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [lupa])

    /* --- odkazy na kotvy (#kontakt) řeší skript, ne prohlížeč ---
       Některé hostingy vkládají <base href>, se kterým by #odkaz vedl jinam. */
    const onRootClick = (e: React.MouseEvent) => {
        const a = (e.target as HTMLElement).closest?.("a") as HTMLAnchorElement | null
        if (!a) return
        const href = a.getAttribute("href") || ""
        if (!href.startsWith("#") || href.length < 2) return
        e.preventDefault()
        setMenuOpen(false)
        if (onCanvas) return
        const smooth = reduce ? "auto" : "smooth"
        if (href === "#top") {
            const top = (rootRef.current?.getBoundingClientRect().top || 0) + window.scrollY
            window.scrollTo({ top, behavior: smooth as ScrollBehavior })
            return
        }
        const el = document.getElementById(href.slice(1))
        if (el) el.scrollIntoView({ behavior: smooth as ScrollBehavior, block: "start" })
    }

    /* --- postupné objevování boxů --- */
    const contentKey = [
        (services.cards || []).length,
        (features.items || []).length,
        (process.steps || []).length,
        (gallery.items || []).length,
        (contact.people || []).length,
        (stats.facts || []).length,
    ].join(",")
    useEffect(() => {
        const root = rootRef.current
        if (!root || !anim) return
        const items = Array.from(root.querySelectorAll(".rv:not(.in)"))
        if (!("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("in"))
            return
        }
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("in")
                        io.unobserve(e.target)
                    }
                }),
            { rootMargin: "0px 0px -5% 0px", threshold: 0 }
        )
        items.forEach((el) => io.observe(el))
        requestAnimationFrame(() =>
            items.forEach((el) => {
                if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("in")
            })
        )
        return () => io.disconnect()
    }, [anim, contentKey])

    /* --- úvod: střídání fotek --- */
    const slides: any[] = Array.isArray(hero.slides) ? hero.slides : []
    const [slide, setSlide] = useState(0)
    const [slidePaused, setSlidePaused] = useState(false)
    useEffect(() => {
        if (slides.length < 2 || slidePaused || reduce || onCanvas) return
        const ms = Math.max(1, hero.interval ?? 3) * 1000
        const t = setInterval(() => setSlide((i) => (i + 1) % slides.length), ms)
        const vis = () => document.hidden && clearInterval(t)
        document.addEventListener("visibilitychange", vis)
        return () => {
            clearInterval(t)
            document.removeEventListener("visibilitychange", vis)
        }
    }, [slides.length, slidePaused, hero.interval, onCanvas])
    const curSlide = slides.length ? slide % slides.length : 0

    /* --- služby: rozbalovací karty, místo drží výšku zavřené karty --- */
    const [openCard, setOpenCard] = useState(-1)
    const cardsRef = useRef<HTMLDivElement>(null)
    const cards: any[] = Array.isArray(services.cards) ? services.cards : []
    useIsoLayoutEffect(() => {
        const box = cardsRef.current
        if (!box) return
        const slots = Array.from(box.querySelectorAll<HTMLElement>(".slot"))
        const measure = () =>
            slots.forEach((slot) => {
                const card = slot.firstElementChild as HTMLElement
                if (!card) return
                const media = card.children[0] as HTMLElement
                const body = card.children[1] as HTMLElement
                const h = (media?.offsetHeight || 0) + (body?.offsetHeight || 0) + 2
                slot.style.height = h + "px"
            })
        measure()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(measure)
        slots.forEach((s) => {
            const card = s.firstElementChild as HTMLElement
            if (card?.children[0]) ro.observe(card.children[0])
            if (card?.children[1]) ro.observe(card.children[1])
        })
        return () => ro.disconnect()
    }, [cards.length, widthClass])

    /* --- O nás: odkrytí a paralaxa letopočtu --- */
    const aboutRef = useRef<HTMLElement>(null)
    const yearRef = useRef<HTMLDivElement>(null)
    const aboutVideoRef = useRef<HTMLDivElement>(null)
    const [aboutSeen, setAboutSeen] = useState(false)
    const [axisSeen, setAxisSeen] = useState(false)
    useEffect(() => {
        const sec = aboutRef.current
        if (!sec || !anim) return
        const io = new IntersectionObserver(
            (z) => {
                if (z[0].isIntersecting) {
                    io.disconnect()
                    setAboutSeen(true)
                    setTimeout(() => setAxisSeen(true), 150)
                }
            },
            { threshold: 0, rootMargin: "0px 0px -35% 0px" }
        )
        io.observe(sec)
        return () => io.disconnect()
    }, [anim, about.show])
    useEffect(() => {
        const sec = aboutRef.current
        const rok = yearRef.current
        if (!sec || !rok || onCanvas || reduce || fx.parallax === false) return
        let raf = 0
        const posun = () => {
            raf = 0
            const r = sec.getBoundingClientRect()
            if (r.bottom < 0 || r.top > window.innerHeight) return
            const p = (window.innerHeight - r.top) / (window.innerHeight + r.height)
            rok.style.setProperty("--rok", ((p - 0.5) * -220).toFixed(1) + "px")
        }
        const on = () => {
            if (!raf) raf = requestAnimationFrame(posun)
        }
        window.addEventListener("scroll", on, { passive: true })
        posun()
        return () => {
            window.removeEventListener("scroll", on)
            cancelAnimationFrame(raf)
        }
    }, [onCanvas, fx.parallax, about.show])
    // video v O nás: přehrává se jen když je vidět; rám převezme poměr stran videa
    useEffect(() => {
        const frame = aboutVideoRef.current
        const video = frame?.querySelector("video")
        if (!frame || !video) return
        const meta = () => {
            if (video.videoWidth && video.videoHeight)
                frame.style.setProperty("--ar", `${video.videoWidth} / ${video.videoHeight}`)
        }
        video.addEventListener("loadedmetadata", meta)
        meta()
        if (!("IntersectionObserver" in window)) return
        const io = new IntersectionObserver(
            (z) =>
                z.forEach((e) => {
                    if (e.isIntersecting) video.play()?.catch?.(() => {})
                    else video.pause()
                }),
            { threshold: 0.25 }
        )
        io.observe(video)
        return () => {
            io.disconnect()
            video.removeEventListener("loadedmetadata", meta)
        }
    }, [imgSrc(about.videoFile), about.videoLink, about.show])

    /* --- čísla: paralaxa pozadí a dopočítávání --- */
    const statsRef = useRef<HTMLElement>(null)
    const statsBgRef = useRef<HTMLDivElement>(null)
    const [statsSeen, setStatsSeen] = useState(false)
    useEffect(() => {
        const sec = statsRef.current
        if (!sec) return
        if (onCanvas || !("IntersectionObserver" in window)) return
        const io = new IntersectionObserver(
            (z) => {
                if (z[0].isIntersecting) {
                    io.disconnect()
                    setStatsSeen(true)
                }
            },
            { threshold: 0.2 }
        )
        io.observe(sec)
        return () => io.disconnect()
    }, [onCanvas, stats.show])
    useEffect(() => {
        const sec = statsRef.current
        const bg = statsBgRef.current?.firstElementChild as HTMLElement | null
        if (!sec || !bg || onCanvas || reduce || fx.parallax === false) return
        let raf = 0
        const posun = () => {
            raf = 0
            const r = sec.getBoundingClientRect()
            if (r.bottom < 0 || r.top > window.innerHeight) return
            const p = ((window.innerHeight - r.top) / (window.innerHeight + r.height)) * 2 - 1
            bg.style.setProperty("--posun", (-p * 170).toFixed(1) + "px")
        }
        const on = () => {
            if (!raf) raf = requestAnimationFrame(posun)
        }
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        posun()
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            cancelAnimationFrame(raf)
        }
    }, [onCanvas, fx.parallax, stats.show, imgSrc(stats.image)])

    /* --- postup zakázky: osa se plní podle scrollu --- */
    const flowRef = useRef<HTMLOListElement>(null)
    const steps: any[] = Array.isArray(process.steps) ? process.steps : []
    useEffect(() => {
        const flow = flowRef.current
        if (!flow) return
        const nums = Array.from(flow.querySelectorAll<HTMLElement>(".num"))
        if (!nums.length) return
        const geometry = () => {
            const box = flow.getBoundingClientRect()
            const fr = nums[0].getBoundingClientRect()
            const lr = nums[nums.length - 1].getBoundingClientRect()
            flow.style.setProperty("--line-top", fr.top + fr.height / 2 - box.top + "px")
            flow.style.setProperty("--line-h", lr.top - fr.top + "px")
            return { fr, lr }
        }
        const allOn = () => {
            nums.forEach((n) => {
                n.classList.add("on")
                n.parentElement?.querySelector(".card")?.classList.add("open")
            })
            const { fr, lr } = geometry()
            flow.classList.add("live")
            flow.style.setProperty("--progress", lr.top - fr.top + "px")
        }
        if (onCanvas || reduce || fx.animations === false) {
            allOn()
            const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(allOn) : null
            ro?.observe(flow)
            return () => ro?.disconnect()
        }
        const spark = (num: HTMLElement) => {
            if (num.dataset.sparked) return
            num.dataset.sparked = "1"
            const cols = ["var(--brand)", "var(--brand-deep)", withAlpha(colors.brand, 0.45), "var(--ink-3)"]
            for (let i = 0; i < 10; i++) {
                const el = document.createElement("span")
                el.className = "spark"
                el.style.setProperty("--a", 36 * i + (Math.random() * 16 - 8) + "deg")
                el.style.setProperty("--d", 22 + Math.random() * 16 + "px")
                el.style.color = cols[i % cols.length]
                el.style.animationDelay = Math.random() * 0.07 + "s"
                num.appendChild(el)
                setTimeout(() => el.remove(), 900)
            }
        }
        const update = () => {
            const trigger = window.innerHeight * 0.75
            nums.forEach((num) => {
                const r = num.getBoundingClientRect()
                const card = num.parentElement?.querySelector(".card")
                if (r.top + r.height / 2 < trigger) {
                    if (!num.classList.contains("on")) spark(num)
                    num.classList.add("on")
                    card?.classList.add("open")
                } else {
                    num.classList.remove("on")
                    delete num.dataset.sparked
                    card?.classList.remove("open")
                }
            })
            const { fr, lr } = geometry()
            const start = fr.top + fr.height / 2
            const end = lr.top + lr.height / 2
            const fill = Math.max(0, Math.min(trigger - start, end - start))
            flow.classList.toggle("live", fill > 0)
            flow.style.setProperty("--progress", fill + "px")
        }
        let raf = 0
        const on = () => {
            if (!raf)
                raf = requestAnimationFrame(() => {
                    raf = 0
                    update()
                })
        }
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        update()
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            cancelAnimationFrame(raf)
        }
    }, [steps.length, onCanvas, fx.animations, widthClass, colors.brand, process.show])

    /* --- galerie: pás se šipkami --- */
    const pasRef = useRef<HTMLDivElement>(null)
    const [pasEdge, setPasEdge] = useState({ l: true, r: false })
    const galItems: any[] = Array.isArray(gallery.items) ? gallery.items : []
    useEffect(() => {
        const s = pasRef.current
        if (!s) return
        const stav = () => {
            const max = s.scrollWidth - s.clientWidth - 2
            setPasEdge({ l: s.scrollLeft <= 2, r: s.scrollLeft >= max })
        }
        s.addEventListener("scroll", stav, { passive: true })
        window.addEventListener("resize", stav)
        stav()
        const t = setTimeout(stav, 400)
        return () => {
            s.removeEventListener("scroll", stav)
            window.removeEventListener("resize", stav)
            clearTimeout(t)
        }
    }, [galItems.length, widthClass, gallery.show])
    const pasPosun = (dir: number) => {
        const s = pasRef.current
        if (!s) return
        const first = s.querySelector(".snimek") as HTMLElement | null
        const gap = parseFloat(getComputedStyle(s).columnGap || "0") || 0
        const step = first ? first.getBoundingClientRect().width + gap : s.clientWidth
        s.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" })
    }

    /* --- otevírací doba: dnešní den (až v prohlížeči, ať nesedí vedle serveru) --- */
    const [today, setToday] = useState(-1)
    useEffect(() => setToday(new Date().getDay()), [])
    const [year, setYear] = useState(2026)
    useEffect(() => setYear(new Date().getFullYear()), [])

    /* ------------------------------------------------------------ */
    /* Vykreslení                                                   */
    /* ------------------------------------------------------------ */

    const boxClass = "glass"
    const logo = imgSrc(header.logo)
    const Brand = ({ h }: { h: number }) =>
        logo ? (
            <img src={logo} alt={header.logoAlt || header.logoText1 || "Logo"} style={{ height: h }} />
        ) : (
            <span className="wordmark" style={{ fontSize: Math.round(h * 0.52) }}>
                <b>{header.logoText1 ?? "SONAD"}</b>
                {header.logoText2 ? <span>{header.logoText2}</span> : null}
            </span>
        )

    const langs: any[] = Array.isArray(header.languages) ? header.languages : []
    const curLang = langs.find((l) => l?.current) || langs[0]
    const showLangs = header.showLanguages !== false && langs.length > 1

    const heroVid = sectionVideo(hero)
    const servVid = sectionVideo(services)
    const aboutVid = sectionVideo({
        videoFile: about.sectionVideoFile,
        videoLink: about.sectionVideoLink,
        videoPoster: about.sectionVideoPoster,
        videoMode: about.sectionVideoMode,
        videoOverlay: about.sectionVideoOverlay,
        videoControls: about.sectionVideoControls,
    })
    const procVid = sectionVideo(process)
    const galVid = sectionVideo(gallery)
    const contVid = sectionVideo(contact)
    const statsVideo = imgSrc(stats.videoFile) || (stats.videoLink || "").trim()

    const feat: any[] = Array.isArray(features.items) ? features.items : []

    const renderFeature = (f: any, i: number) => {
        if (!f || f.show === false) return null
        const checks = splitList(f.checks)
        const tags = splitList(f.tags)
        const bg = (f.bgVideoLink || "").trim()
        return (
            <section
                key={"f" + i}
                id={f.anchor || undefined}
                className={bg ? "has-bgvideo" : undefined}
            >
                {bg && (
                    <div className="sec-bgvideo" aria-hidden="true">
                        <Media videoLink={bg} alt="" />
                        <i style={{ opacity: (f.bgOverlay ?? 70) / 100 }} />
                    </div>
                )}
                <div className={"wrap split" + (f.reverse ? " rev" : "")}>
                    <div>
                        {f.eyebrow && <span className="eyebrow rv">{f.eyebrow}</span>}
                        <h2 className="title rv" style={{ ["--i" as any]: 1 }}>{rich(f.title)}</h2>
                        {f.lede && <p className="lede rv" style={{ ["--i" as any]: 2 }}>{rich(f.lede, false)}</p>}
                        {checks.length > 0 && (
                            <ul className="checks rv" style={{ ["--i" as any]: 3 }}>
                                {checks.map((c, k) => (
                                    <li key={k}><Check /><span>{inline(c)}</span></li>
                                ))}
                            </ul>
                        )}
                        {tags.length > 0 && (
                            <ul className="tech rv" style={{ ["--i" as any]: 3 }}>
                                {tags.map((t, k) => <li key={k}>{t}</li>)}
                            </ul>
                        )}
                        {f.lede2 && <p className="lede rv" style={{ ["--i" as any]: 4, marginTop: 28 }}>{rich(f.lede2, false)}</p>}
                        {f.linkLabel && (
                            <p style={{ marginTop: 30 }} className="rv">
                                <a className="link-arrow" href={f.linkUrl || "#kontakt"}>
                                    <span>{f.linkLabel}</span> <Arrow />
                                </a>
                            </p>
                        )}
                    </div>
                    <div className={`media ${boxClass} rv`} style={{ ["--i" as any]: 2 }}>
                        <div className="shot">
                            <Media image={f.image} videoLink={f.videoLink} alt={f.alt || f.eyebrow} ph={FEATURE_PH[i % FEATURE_PH.length]} hint="Fotka 1200 × 900 px nebo video" />
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    const featuresAt = (place: string) =>
        features.show === false ? null : feat.map((f, i) => ((f?.placement || "afterServices") === place ? renderFeature(f, i) : null))

    const socials: any[] = (Array.isArray(contact.socials) ? contact.socials : []).filter(
        (s: any) => s && (s.url || onCanvas)
    )
    const Socials = ({ className = "socky" }: any) =>
        socials.length ? (
            <div className={className}>
                {socials.map((s, i) => {
                    const net = SOCIAL[s.network] || SOCIAL.web
                    const href = s.network === "email" && s.url && !s.url.startsWith("mailto:") ? "mailto:" + s.url : s.url
                    return (
                        <a
                            key={i}
                            href={href || "#"}
                            target={s.network === "email" ? undefined : "_blank"}
                            rel="noopener"
                            aria-label={s.label || net.label}
                            className={s.url ? undefined : "empty"}
                            title={s.url ? s.label || net.label : `${net.label} — doplň odkaz v panelu`}
                        >
                            {net.el}
                        </a>
                    )
                })}
            </div>
        ) : null

    // mapa
    const mapAddress = (map.address || "").trim()
    const mapSrc =
        map.mode === "embed"
            ? iframeSrc(map.embed)
            : mapAddress
              ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=${map.zoom ?? 16}&hl=${map.lang || "cs"}&output=embed`
              : ""
    const mapOpenUrl = map.mode === "embed" ? map.openUrl || "" : mapAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}` : ""

    const rootClass = [
        ROOT,
        widthClass,
        onCanvas ? "is-canvas" : "",
        anim ? "anim" : "",
        menuOpen ? "menu-open" : "",
        header.sticky === false ? "hdr-static" : "",
    ]
        .filter(Boolean)
        .join(" ")

    const people: any[] = Array.isArray(contact.people) ? contact.people : []
    const hours: any[] = Array.isArray(contact.hours) ? contact.hours : []
    const facts: any[] = Array.isArray(stats.facts) ? stats.facts : []
    const miles: any[] = Array.isArray(about.milestones) ? about.milestones : []
    const footPeople: any[] = Array.isArray(footer.people) ? footer.people : []
    const footNav: any[] = Array.isArray(footer.nav) ? footer.nav : []
    const footRows: any[] = Array.isArray(footer.rows) ? footer.rows : []

    const aboutVideo = imgSrc(about.videoFile) || (about.videoLink || "").trim()

    return (
        <div className={rootClass} ref={rootRef} style={props.style} onClick={onRootClick}>
            {fx.aura !== false && <div className="aura" aria-hidden="true"><i /></div>}

            {/* ============ ZÁHLAVÍ ============ */}
            {header.show !== false && (
                <>
                    <header className={"hdr" + (slim ? " slim" : "")}>
                        <div className="nav">
                            <a className="brand" href="#top" aria-label={(header.logoText1 || "") + " — domů"}>
                                <Brand h={header.logoHeight ?? 32} />
                            </a>
                            <nav className="menu" aria-label="Hlavní navigace">
                                {menuItems
                                    .filter((m) => m && m.desktop !== false)
                                    .map((m, i) => (
                                        <a key={i} href={m.link} className={active === m.link ? "here" : undefined}>
                                            {m.label}
                                        </a>
                                    ))}
                            </nav>
                            {showLangs && (
                                <div className={"langsw" + (langOpen ? " open" : "")}>
                                    <button
                                        type="button"
                                        className="langsw-toggle"
                                        aria-haspopup="listbox"
                                        aria-expanded={langOpen}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setLangOpen((o) => !o)
                                        }}
                                    >
                                        <span className="vlajka" aria-hidden="true">{curLang?.flag}</span>
                                        <span>{curLang?.code}</span>
                                        <svg className="langsw-sipka" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                                    </button>
                                    <div className="langsw-menu" role="listbox">
                                        {langs.map((l, i) => (
                                            <a key={i} href={l.link || "#"} className={l === curLang ? "on" : undefined} role="option" aria-selected={l === curLang}>
                                                <span className="vlajka" aria-hidden="true">{l.flag}</span> {l.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {header.ctaLabel && (
                                <a className={"btn btn-primary desk" + (active === header.ctaLink ? " here" : "")} href={header.ctaLink || "#kontakt"}>
                                    {header.ctaLabel}
                                </a>
                            )}
                            <button
                                className="burger"
                                aria-label="Menu"
                                aria-expanded={menuOpen}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setMenuOpen((o) => !o)
                                }}
                            >
                                <span />
                            </button>
                        </div>
                    </header>
                    <div className={`sheet ${boxClass}`}>
                        {showLangs && (
                            <div className="langsw langsw-sheet" role="group">
                                {langs.map((l, i) => (
                                    <a key={i} href={l.link || "#"} className={l === curLang ? "on" : undefined}>
                                        <span className="vlajka" aria-hidden="true">{l.flag}</span> {l.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        {menuItems.filter(Boolean).map((m, i) => (
                            <a key={i} href={m.link} className={active === m.link ? "here" : undefined}>
                                {m.label}
                            </a>
                        ))}
                        {header.ctaLabel && (
                            <a className="btn btn-primary" href={header.ctaLink || "#kontakt"}>
                                {header.ctaLabel}
                            </a>
                        )}
                    </div>
                </>
            )}

            <main>
                <span id="top" />

                {/* ============ ÚVOD ============ */}
                {hero.show !== false && (
                    <section className={"hero" + (heroVid.has && heroVid.mode === "background" ? " has-bgvideo" : "")}>
                        <SectionBgVideo v={heroVid} />
                        <div className="wrap hero-grid">
                            <div className="hero-text">
                                <h1 className="rv" style={{ ["--i" as any]: 1 }}>{rich(hero.title)}</h1>
                                {hero.lede && <p className="lede rv" style={{ ["--i" as any]: 2 }}>{rich(hero.lede, false)}</p>}
                                <div className="hero-cta rv" style={{ ["--i" as any]: 3 }}>
                                    {hero.cta1Label && (
                                        <a className="btn btn-primary" href={hero.cta1Link || "#kontakt"}>
                                            <span>{hero.cta1Label}</span> <Arrow />
                                        </a>
                                    )}
                                    {hero.cta2Label && (
                                        <a className="btn btn-ghost" href={hero.cta2Link || "#"}>
                                            {hero.cta2Label}
                                        </a>
                                    )}
                                </div>
                            </div>
                            {slides.length > 0 && (
                                <div className={`hero-stage rv ${hero.photoStyle === "framed" ? "framed" : "cutout"}`} style={{ ["--i" as any]: 4 }}>
                                    <div
                                        className="shot"
                                        aria-roledescription="galerie"
                                        onPointerEnter={() => setSlidePaused(true)}
                                        onPointerLeave={() => setSlidePaused(false)}
                                    >
                                        {slides.map((s, i) => (
                                            <figure key={i} className={"slide" + (i === curSlide ? " on" : "")} aria-hidden={i !== curSlide}>
                                                <Media image={s?.image} videoLink={s?.videoLink} alt={s?.alt} ph={THUMB_PH[i % THUMB_PH.length]} hint="Fotka 1200 × 1200 px (ideálně bez pozadí)" eager={i === 0} />
                                            </figure>
                                        ))}
                                    </div>
                                    {slides.length > 1 && (
                                        <div className="dots" role="tablist" aria-label="Přepnout fotku">
                                            {slides.map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    role="tab"
                                                    aria-label={"Fotka " + (i + 1)}
                                                    aria-selected={i === curSlide}
                                                    onClick={() => setSlide(i)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="wrap"><SectionBlockVideo v={heroVid} boxClass={boxClass} /></div>
                    </section>
                )}

                {/* ============ SLUŽBY ============ */}
                {services.show !== false && (
                    <section id={services.anchor || "sluzby"} className={servVid.has && servVid.mode === "background" ? "has-bgvideo" : undefined}>
                        <SectionBgVideo v={servVid} />
                        <div className="wrap">
                            {services.eyebrow && <span className="eyebrow rv">{services.eyebrow}</span>}
                            <h2 className="title rv">{rich(services.title)}</h2>
                            {services.lede && <p className="lede rv" style={{ ["--i" as any]: 1 }}>{rich(services.lede, false)}</p>}
                            <div className="grid-2 cards" ref={cardsRef} style={{ ["--cols" as any]: services.columns ?? 3 }}>
                                {cards.map((c, i) => {
                                    if (!c) return null
                                    const bullets = splitList(c.bullets)
                                    const thumbs = [c.thumb1, c.thumb2, c.thumb3].map(imgSrc)
                                    const shown = thumbs.filter(Boolean)
                                    const nThumbs = shown.length || (c.showThumbs === false ? 0 : 2)
                                    const isOpen = openCard === i
                                    return (
                                        <div key={i} className="slot rv" style={{ ["--i" as any]: (i % 4) + 1 }}>
                                            <article className={`card ${boxClass} open-card` + (isOpen ? " is-open" : "")}>
                                                <figure className={"card-media" + (c.fit === "contain" ? " vyrez" : "")}>
                                                    <Media image={c.image} videoLink={c.videoLink} alt={c.title} ph={CARD_PH[i % CARD_PH.length]} hint="Fotka 1600 × 1000 px" />
                                                    <button
                                                        className="card-toggle"
                                                        type="button"
                                                        aria-expanded={isOpen}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setOpenCard(isOpen ? -1 : i)
                                                        }}
                                                    >
                                                        <span className="sr">Více o službě {c.title}</span>
                                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                                                    </button>
                                                </figure>
                                                <div className="card-body">
                                                    <h3>{c.title}</h3>
                                                    {c.text && <p>{c.text}</p>}
                                                </div>
                                                <div className="card-more">
                                                    <div className="card-more-in">
                                                        {bullets.length > 0 && (
                                                            <ul className="mini">
                                                                {bullets.map((b, k) => <li key={k}>{inline(b)}</li>)}
                                                            </ul>
                                                        )}
                                                        {nThumbs > 0 && (
                                                            <div className={"thumbs" + (nThumbs === 3 ? " tri" : "")} style={{ ["--n" as any]: nThumbs }}>
                                                                {(shown.length ? shown : [null, null]).map((t, k) => (
                                                                    <button
                                                                        key={k}
                                                                        type="button"
                                                                        className={"thumb" + (c.fit === "contain" ? " fit" : "")}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            if (t) setLupa({ src: t, alt: c.title })
                                                                        }}
                                                                        aria-label={t ? `Zvětšit fotku — ${c.title}` : "Náhled"}
                                                                    >
                                                                        {t ? <img src={t} alt={c.title} loading="lazy" /> : <Placeholder name={THUMB_PH[(i * 2 + k) % THUMB_PH.length]} />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {c.ctaLabel && (
                                                            <a className="link-arrow" href={c.ctaLink || "#kontakt"}>
                                                                <span>{c.ctaLabel}</span> <Arrow />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        </div>
                                    )
                                })}
                            </div>
                            <SectionBlockVideo v={servVid} boxClass={boxClass} />
                        </div>
                    </section>
                )}

                {featuresAt("afterServices")}

                {/* ============ O NÁS ============ */}
                {about.show !== false && (
                    <section
                        id={about.anchor || "onas"}
                        ref={aboutRef as any}
                        className={"onas" + (aboutSeen || !anim ? " vidno" : "") + (axisSeen || !anim ? " osa" : "") + (aboutVid.has && aboutVid.mode === "background" ? " has-bgvideo" : "")}
                    >
                        <SectionBgVideo v={aboutVid} />
                        {about.bigYear && (
                            <div className="onas-rok" ref={yearRef} aria-hidden="true">
                                <span>{about.bigYear}</span>
                            </div>
                        )}
                        <div className="wrap">
                            {about.eyebrow && <span className="eyebrow rv">{about.eyebrow}</span>}
                            <h2 className="title onas-nadpis">{wordsTitle(about.title)}</h2>
                            <div className="onas-grid">
                                <div className="onas-text">
                                    {about.lead && (
                                        <p className={"onas-lead onas-odkryt" + (about.dropCap !== false ? " drop" : "")} style={{ ["--d" as any]: ".15s" }}>
                                            {rich(about.lead, false)}
                                        </p>
                                    )}
                                    {about.body && (
                                        <p className="onas-body onas-odkryt" style={{ ["--d" as any]: ".25s" }}>
                                            {rich(about.body, false)}
                                        </p>
                                    )}
                                    {miles.length > 0 && (
                                        <ol className="milniky" aria-label="Milníky" style={{ ["--cols" as any]: Math.min(miles.length, 4) }}>
                                            {miles.map((m, i) => (
                                                <li key={i} style={{ ["--n" as any]: i }}>
                                                    <span className="milnik-rok">{m?.year}</span>
                                                    <span className="milnik-text">{m?.text}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                                {about.showVideo !== false && (
                                    <div className="onas-media">
                                        <div className="video-frame" ref={aboutVideoRef} style={{ ["--ar" as any]: about.ratio || "300 / 566" }}>
                                            {aboutVideo ? (
                                                <Media videoFile={about.videoFile} videoLink={about.videoLink} poster={about.poster} alt={about.videoAlt} />
                                            ) : imgSrc(about.poster) ? (
                                                <img src={imgSrc(about.poster)} alt={about.videoAlt || ""} loading="lazy" />
                                            ) : (
                                                <Placeholder name="machine" hint="Video na výšku (mp4) nebo YouTube" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SectionBlockVideo v={aboutVid} boxClass={boxClass} />
                        </div>
                    </section>
                )}

                {/* ============ ČÍSLA ============ */}
                {stats.show !== false && facts.length > 0 && (
                    <section className="stats" ref={statsRef as any} aria-label={stats.label || "V číslech"}>
                        <div className="stats-bg" ref={statsBgRef} aria-hidden="true">
                            {statsVideo ? (
                                <Media videoFile={stats.videoFile} videoLink={stats.videoLink} alt="" />
                            ) : imgSrc(stats.image) ? (
                                <img src={imgSrc(stats.image)} alt="" loading="lazy" />
                            ) : (
                                <span />
                            )}
                            {stats.tint !== false && <div className="tint" style={{ opacity: (stats.tintStrength ?? 100) / 100 }} />}
                        </div>
                        <div className="wrap">
                            <dl className="facts" style={{ ["--cols" as any]: Math.min(facts.length, 4) }}>
                                {facts.map((f, i) => (
                                    <div key={i} className={`fact ${boxClass} rv`} style={{ ["--i" as any]: i + 1 }}>
                                        <dt>
                                            {fx.countUp !== false && !reduce && !onCanvas ? (
                                                <CountUp value={f?.value} prefix={f?.prefix} suffix={f?.suffix} thousands={f?.thousands} run={statsSeen} />
                                            ) : (
                                                <>
                                                    {f?.prefix}
                                                    {f?.thousands ? Number(f?.value || 0).toLocaleString("cs-CZ") : f?.value}
                                                    {f?.suffix}
                                                </>
                                            )}
                                        </dt>
                                        <dd>{f?.label}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>
                )}

                {/* ============ POSTUP ============ */}
                {process.show !== false && (
                    <section id={process.anchor || "postup"} className={procVid.has && procVid.mode === "background" ? "has-bgvideo" : undefined}>
                        <SectionBgVideo v={procVid} />
                        <div className="wrap">
                            {process.eyebrow && <span className="eyebrow rv">{process.eyebrow}</span>}
                            <h2 className="title rv" style={{ ["--i" as any]: 1 }}>{rich(process.title)}</h2>
                            {process.lede && <p className="lede rv" style={{ ["--i" as any]: 2 }}>{rich(process.lede, false)}</p>}
                            <ol className="flow" ref={flowRef}>
                                {steps.map((s, i) => (
                                    <li key={i} className="step">
                                        <span className="num" aria-hidden="true">{i + 1}</span>
                                        <div className={`card ${boxClass}`}>
                                            <h3>{s?.title}</h3>
                                            {s?.text && <p>{s.text}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <SectionBlockVideo v={procVid} boxClass={boxClass} />
                        </div>
                    </section>
                )}

                {featuresAt("afterProcess")}

                {/* ============ GALERIE ============ */}
                {gallery.show !== false && (
                    <section id={gallery.anchor || "galerie"} className={galVid.has && galVid.mode === "background" ? "has-bgvideo" : undefined}>
                        <SectionBgVideo v={galVid} />
                        <div className="wrap">
                            {gallery.eyebrow && <span className="eyebrow rv">{gallery.eyebrow}</span>}
                            <h2 className="title rv" style={{ ["--i" as any]: 1 }}>{rich(gallery.title)}</h2>
                            <div className="pas">
                                <div className="pas-stopa" ref={pasRef} tabIndex={0} role="group" aria-label="Fotky, posouvá se šipkami"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowLeft") { e.preventDefault(); pasPosun(-1) }
                                        if (e.key === "ArrowRight") { e.preventDefault(); pasPosun(1) }
                                    }}>
                                    {galItems.map((g, i) => (
                                        <figure key={i} className={`snimek ${boxClass}`}>
                                            <div className="box">
                                                <Media image={g?.image} videoLink={g?.videoLink} alt={g?.caption} ph={GALLERY_PH[i % GALLERY_PH.length]} hint="Fotka 1000 × 800 px nebo video" />
                                            </div>
                                            {g?.caption && <figcaption>{g.caption}</figcaption>}
                                        </figure>
                                    ))}
                                </div>
                                <button className="pas-sipka vlevo" type="button" aria-label="Předchozí" disabled={pasEdge.l} onClick={() => pasPosun(-1)}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                                </button>
                                <button className="pas-sipka vpravo" type="button" aria-label="Další" disabled={pasEdge.r} onClick={() => pasPosun(1)}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            <SectionBlockVideo v={galVid} boxClass={boxClass} />
                        </div>
                    </section>
                )}

                {featuresAt("afterGallery")}

                {/* ============ KONTAKT ============ */}
                {contact.show !== false && (
                    <section id={contact.anchor || "kontakt"} className={contVid.has && contVid.mode === "background" ? "has-bgvideo" : undefined}>
                        <SectionBgVideo v={contVid} />
                        <div className="wrap">
                            {contact.eyebrow && <span className="eyebrow rv">{contact.eyebrow}</span>}
                            <h2 className="title rv" style={{ ["--i" as any]: 1 }}>{rich(contact.title)}</h2>
                            {contact.lede && <p className="lede rv" style={{ ["--i" as any]: 2 }}>{rich(contact.lede, false)}</p>}
                            {(contact.callLabel || contact.mailLabel) && (
                                <div className="rychle rv" style={{ ["--i" as any]: 3 }}>
                                    {contact.callLabel && <a className="btn btn-primary" href={tel(contact.phone)}>{contact.callLabel}</a>}
                                    {contact.mailLabel && <a className="btn btn-ghost" href={"mailto:" + (contact.email || "")}>{contact.mailLabel}</a>}
                                </div>
                            )}

                            {people.length > 0 && (
                                <>
                                    {contact.peopleHeading && <h3 className="podnadpis rv">{contact.peopleHeading}</h3>}
                                    <div className="lide">
                                        {people.map((p, i) => (
                                            <article key={i} className={`osoba ${boxClass} rv`} style={{ ["--i" as any]: (i % 3) + 1 }}>
                                                <h4>{p?.name}</h4>
                                                {p?.role && <p className="role">{p.role}</p>}
                                                {p?.phone && <a className="spojeni" href={tel(p.phone)}><PhoneIco />{p.phone}</a>}
                                                {p?.email && <a className="spojeni" href={"mailto:" + p.email}><MailIco />{p.email}</a>}
                                            </article>
                                        ))}
                                    </div>
                                </>
                            )}

                            {contact.infoHeading && <h3 className="podnadpis rv">{contact.infoHeading}</h3>}
                            <div className="udaje">
                                {contact.showAddress !== false && (
                                    <article className={`udaj ${boxClass} rv`} style={{ ["--i" as any]: 1 }}>
                                        <span className="ico"><PinIco /></span>
                                        <h4>{contact.addressTitle}</h4>
                                        <address>{rich(contact.address)}</address>
                                        {contact.addressNote && <p className="note">{contact.addressNote}</p>}
                                    </article>
                                )}
                                {contact.showBilling !== false && (
                                    <article className={`udaj ${boxClass} rv`} style={{ ["--i" as any]: 2 }}>
                                        <span className="ico"><DocIco /></span>
                                        <h4>{contact.billingTitle}</h4>
                                        <address>
                                            {contact.company && <><strong>{contact.company}</strong><br /></>}
                                            {rich(contact.billing)}
                                        </address>
                                        {contact.billingNote && <p className="note">{contact.billingNote}</p>}
                                    </article>
                                )}
                                {contact.showInquiry !== false && (
                                    <article className={`udaj ${boxClass} rv`} style={{ ["--i" as any]: 3 }}>
                                        <span className="ico"><MailIco /></span>
                                        <h4>{contact.inquiryTitle}</h4>
                                        {contact.email && <a className="velky-mail" href={"mailto:" + contact.email}>{contact.email}</a>}
                                        {contact.inquiryNote && <p className="note">{contact.inquiryNote}</p>}
                                        <Socials />
                                    </article>
                                )}
                                {contact.showHours !== false && hours.length > 0 && (
                                    <article className={`udaj ${boxClass} rv`} style={{ ["--i" as any]: 4 }}>
                                        <span className="ico"><ClockIco /></span>
                                        <h4>{contact.hoursTitle}</h4>
                                        <dl className="hodiny">
                                            {hours.map((h, i) => {
                                                const wd = h?.weekday === undefined || h?.weekday === "none" ? -2 : Number(h.weekday)
                                                return (
                                                    <div key={i} className={"den" + (wd === today ? " dnes" : "")}>
                                                        <dt data-dnes={contact.todayLabel || "dnes"}>{h?.day}</dt>
                                                        <dd>{h?.hours}</dd>
                                                    </div>
                                                )
                                            })}
                                        </dl>
                                    </article>
                                )}
                            </div>

                            {/* mapa */}
                            {map.show !== false && (
                                <div className={`mapa ${boxClass} rv`}>
                                    {mapSrc ? (
                                        <>
                                            <iframe
                                                src={mapSrc}
                                                title={"Mapa — " + (map.labelText || mapAddress)}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                style={{
                                                    height: map.height ?? 400,
                                                    filter: `grayscale(${(map.grayscale ?? 82) / 100}) contrast(1.06) brightness(1.04)`,
                                                }}
                                            />
                                            {map.tint !== false && (
                                                <div
                                                    className="mapa-nadech"
                                                    aria-hidden="true"
                                                    style={{
                                                        background: `linear-gradient(150deg,${withAlpha(colors.brand, 0.34)},${withAlpha(colors.brand, 0.24)} 55%,${withAlpha(colors.brand, 0.32)})`,
                                                        mixBlendMode: (map.blend || "multiply") as any,
                                                        opacity: (map.tintStrength ?? 100) / 100,
                                                    }}
                                                />
                                            )}
                                            {map.showLabel !== false && (map.labelTitle || map.labelText) && (
                                                <div className={`mapa-adresa ${boxClass}`}>
                                                    {map.labelTitle && <strong>{map.labelTitle}</strong>}
                                                    {map.labelText}
                                                </div>
                                            )}
                                            {map.buttonLabel && mapOpenUrl && (
                                                <a className="mapa-odkaz btn btn-ghost" href={mapOpenUrl} target="_blank" rel="noopener">
                                                    <span>{map.buttonLabel}</span>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        onCanvas && <div className="mapa-prazdna">Mapa: vyplň adresu v panelu ⑪ Mapa</div>
                                    )}
                                </div>
                            )}
                            <SectionBlockVideo v={contVid} boxClass={boxClass} />
                        </div>
                    </section>
                )}
            </main>

            {/* ============ PATIČKA ============ */}
            {footer.show !== false && (
                <footer>
                    <div className="wrap">
                        <div className="foot-grid">
                            <div className="foot-col foot-brand">
                                <a className="brand" href="#top" aria-label="Nahoru">
                                    <Brand h={footer.logoHeight ?? 40} />
                                </a>
                                {footer.text && <p>{rich(footer.text, false)}</p>}
                                <div className="foot-cta">
                                    {footer.cta1Label && <a className="btn btn-primary" href={footer.cta1Link || "#"}>{footer.cta1Label}</a>}
                                    {footer.cta2Label && <a className="btn btn-ghost" href={footer.cta2Link || "#"}>{footer.cta2Label}</a>}
                                </div>
                                {footer.showSocials !== false && <Socials />}
                            </div>
                            <div className="foot-col">
                                {footer.col1Title && <h3>{footer.col1Title}</h3>}
                                <address>
                                    {footer.company && <><strong>{footer.company}</strong><br /></>}
                                    {rich(footer.address)}
                                </address>
                                {footRows.length > 0 && (
                                    <dl className="foot-dl">
                                        {footRows.map((r, i) => (
                                            <React.Fragment key={i}>
                                                <dt>{r?.label}</dt>
                                                <dd>{r?.value}</dd>
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                )}
                            </div>
                            <div className="foot-col">
                                {footer.col2Title && <h3>{footer.col2Title}</h3>}
                                <ul className="foot-people">
                                    {footPeople.map((p, i) => (
                                        <li key={i}>
                                            <span className="who">{p?.name}</span>
                                            {p?.role && <span className="role">{p.role}</span>}
                                            {p?.phone && <a href={tel(p.phone)}>{p.phone}</a>}
                                            {p?.email && <a href={"mailto:" + p.email}>{p.email}</a>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="foot-col">
                                {footer.col3Title && <h3>{footer.col3Title}</h3>}
                                <nav className="foot-nav" aria-label="Patička">
                                    {footNav.map((l, i) => (
                                        <a key={i} href={l?.link}>{l?.label}</a>
                                    ))}
                                </nav>
                            </div>
                        </div>
                        <div className="copy">
                            <span>{(footer.copyright || "© {year}").replace("{year}", String(year))}</span>
                            {footer.rights && <span>{footer.rights}</span>}
                            {footer.privacyLabel && <a href={footer.privacyLink || "#"}>{footer.privacyLabel}</a>}
                        </div>
                    </div>
                </footer>
            )}

            {/* zvětšená fotka */}
            {lupa && (
                <div className="lupa" role="dialog" aria-modal="true" aria-label="Zvětšený obrázek" onClick={(e) => {
                    const t = e.target as HTMLElement
                    if (t.classList.contains("lupa") || t.tagName === "FIGURE") setLupa(null)
                }}>
                    <button className="lupa-zavrit" type="button" aria-label="Zavřít" onClick={() => setLupa(null)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                    <figure>
                        <img src={lupa.src} alt={lupa.alt || ""} />
                        {lupa.alt && <figcaption>{lupa.alt}</figcaption>}
                    </figure>
                </div>
            )}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Panel vlastností                                                    */
/* ------------------------------------------------------------------ */

const T = ControlType

/**
 * Video do libovolné sekce: nahraný soubor nebo odkaz (YouTube, Vimeo, .mp4),
 * zobrazený jako pozadí sekce, nebo jako samostatný blok pod obsahem.
 */
function videoControls(prefix = "") {
    const k = (n: string) => (prefix ? prefix + n[0].toUpperCase() + n.slice(1) : n)
    const has = (p: any = {}) => !imgSrc(p?.[k("videoFile")]) && !(p?.[k("videoLink")] || "").trim()
    return {
        [k("videoFile")]: {
            type: T.File,
            title: prefix ? "🎬 Video sekce (soubor)" : "🎬 Video (soubor)",
            allowedFileTypes: ["mp4", "webm", "mov"],
            description: "Nahraj MP4. Hraje ztlumeně ve smyčce. Ideálně do 10 MB.",
        },
        [k("videoLink")]: {
            type: T.String,
            title: prefix ? "🎬 Video sekce (odkaz)" : "🎬 Video (odkaz)",
            defaultValue: "",
            placeholder: "YouTube, Vimeo nebo odkaz na .mp4",
        },
        [k("videoMode")]: {
            type: T.Enum,
            title: "Video jako",
            options: ["background", "block"],
            optionTitles: ["Pozadí sekce", "Blok pod obsahem"],
            defaultValue: "background",
            displaySegmentedControl: true,
            hidden: has,
        },
        [k("videoOverlay")]: {
            type: T.Number,
            title: "Zakrytí videa",
            min: 0, max: 100, step: 5, unit: "%", defaultValue: 70,
            description: "Barva pozadí přes video, aby šel číst text.",
            hidden: (p: any = {}) => has(p) || (p?.[k("videoMode")] || "background") !== "background",
        },
        [k("videoControls")]: {
            type: T.Boolean,
            title: "Ovládání videa",
            defaultValue: true,
            enabledTitle: "Ano", disabledTitle: "Ne (smyčka)",
            hidden: (p: any = {}) => has(p) || (p?.[k("videoMode")] || "background") !== "block",
        },
        [k("videoPoster")]: {
            type: T.Image,
            title: "Náhled videa",
            hidden: has,
        },
    }
}

const showCtl = { type: T.Boolean, title: "Zobrazit sekci", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" }

const hiddenPreset = (p: any = {}) => (p?.palette || "custom") !== "custom"

addPropertyControls(SonadSite, {
    version: { type: T.String, title: "Verze", defaultValue: COMPONENT_VERSION },

    /* ① Barvy */
    colors: {
        type: T.Object,
        title: "① 🎨 Barvy",
        controls: {
            palette: {
                type: T.Enum,
                title: "Paleta",
                options: ["custom", "sonad", "steel", "forest", "amber", "graphite"],
                optionTitles: ["Vlastní barvy", "SONAD červená", "Ocelová modrá", "Lesní zelená", "Jantarová", "Grafit (tmavá)"],
                defaultValue: "custom",
                description: "Hotová paleta přepíše barvy níže. „Vlastní barvy“ vrátí tvoje nastavení.",
            },
            brand: { type: T.Color, title: "Hlavní barva", defaultValue: PALETTES.sonad.brand, hidden: hiddenPreset },
            brandDeepAuto: { type: T.Boolean, title: "Tmavší odstín", defaultValue: true, enabledTitle: "Auto", disabledTitle: "Ručně", hidden: hiddenPreset },
            brandDeep: { type: T.Color, title: "Tmavší odstín", defaultValue: "#a4161e", hidden: (p: any = {}) => hiddenPreset(p) || p?.brandDeepAuto !== false },
            buttonText: { type: T.Color, title: "Text na tlačítku", defaultValue: PALETTES.sonad.buttonText, hidden: hiddenPreset },
            ink: { type: T.Color, title: "Text", defaultValue: PALETTES.sonad.ink, hidden: hiddenPreset },
            ink2: { type: T.Color, title: "Text vedlejší", defaultValue: PALETTES.sonad.ink2, hidden: hiddenPreset },
            ink3: { type: T.Color, title: "Text popisky", defaultValue: PALETTES.sonad.ink3, hidden: hiddenPreset },
            bg: { type: T.Color, title: "Pozadí", defaultValue: PALETTES.sonad.bg, hidden: hiddenPreset },
            bg2: { type: T.Color, title: "Pozadí 2", defaultValue: PALETTES.sonad.bg2, hidden: hiddenPreset },
            surface: { type: T.Color, title: "Barva boxů", defaultValue: PALETTES.sonad.surface, hidden: hiddenPreset },
            glow: { type: T.Color, title: "Druhá záře", defaultValue: PALETTES.sonad.glow, hidden: hiddenPreset },
        },
    },

    /* ② Tvary */
    shapes: {
        type: T.Object,
        title: "② 🔷 Tvary boxů a tlačítek",
        controls: {
            boxStyle: {
                type: T.Enum, title: "Styl boxů",
                options: ["glass", "solid", "outline"],
                optionTitles: ["Sklo", "Plné", "Obrys"],
                defaultValue: "glass", displaySegmentedControl: true,
            },
            boxRadius: { type: T.Number, title: "Zaoblení boxů", min: 0, max: 48, step: 1, unit: "px", defaultValue: 30 },
            glassBlur: { type: T.Number, title: "Rozmazání skla", min: 0, max: 50, step: 1, unit: "px", defaultValue: 26, hidden: (p: any = {}) => (p?.boxStyle || "glass") !== "glass" },
            shadow: { type: T.Number, title: "Síla stínů", min: 0, max: 200, step: 10, unit: "%", defaultValue: 100 },
            buttonShape: {
                type: T.Enum, title: "Tvar tlačítek",
                options: ["pill", "rounded", "square"],
                optionTitles: ["Kapsle", "Zaoblené", "Hranaté"],
                defaultValue: "pill", displaySegmentedControl: true,
            },
            buttonRadius: { type: T.Number, title: "Zaoblení tlačítek", min: 0, max: 30, step: 1, unit: "px", defaultValue: 12, hidden: (p: any = {}) => p?.buttonShape !== "rounded" },
            buttonSize: { type: T.Number, title: "Velikost tlačítek", min: 70, max: 140, step: 5, unit: "%", defaultValue: 100 },
            primaryStyle: {
                type: T.Enum, title: "Hlavní tlačítko",
                options: ["filled", "outline"], optionTitles: ["Plné", "Obrys"],
                defaultValue: "filled", displaySegmentedControl: true,
            },
            secondaryStyle: {
                type: T.Enum, title: "Vedlejší tlačítko",
                options: ["glass", "solid", "outline"], optionTitles: ["Sklo", "Plné", "Obrys"],
                defaultValue: "glass", displaySegmentedControl: true,
            },
            iconShape: {
                type: T.Enum, title: "Tvar ikon",
                options: ["rounded", "circle", "square"], optionTitles: ["Zaoblené", "Kruh", "Hranaté"],
                defaultValue: "rounded", displaySegmentedControl: true,
            },
        },
    },

    /* ③ Písmo a efekty */
    type: {
        type: T.Object,
        title: "③ 🖋️ Písmo",
        controls: {
            googleFont: { type: T.String, title: "Google Font", defaultValue: "", placeholder: "např. Inter, Manrope, Outfit", description: "Prázdné = systémové písmo jako v původním webu." },
            fontFamily: { type: T.String, title: "Záložní písma", defaultValue: DEFAULTS.type.fontFamily },
            headingWeight: { type: T.Number, title: "Tučnost nadpisů", min: 400, max: 800, step: 20, defaultValue: 640 },
            titleScale: { type: T.Number, title: "Velikost nadpisů", min: 70, max: 130, step: 5, unit: "%", defaultValue: 100 },
            contentWidth: { type: T.Number, title: "Šířka obsahu", min: 900, max: 1600, step: 10, unit: "px", defaultValue: 1180 },
        },
    },
    effects: {
        type: T.Object,
        title: "④ ✨ Efekty",
        controls: {
            animations: { type: T.Boolean, title: "Animace při scrollu", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            aura: { type: T.Boolean, title: "Světelná záře v pozadí", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            parallax: { type: T.Boolean, title: "Paralaxa", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            countUp: { type: T.Boolean, title: "Dopočítávání čísel", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            spacing: { type: T.Number, title: "Mezery mezi sekcemi", min: 50, max: 150, step: 5, unit: "%", defaultValue: 100 },
        },
    },

    /* ⑤ Záhlaví */
    header: {
        type: T.Object,
        title: "⑤ Záhlaví a menu",
        controls: {
            show: showCtl,
            sticky: { type: T.Boolean, title: "Přichycené nahoře", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            logo: { type: T.Image, title: "Logo — PNG/SVG 1200 × 220 px", description: "Soubor sonad/photos/logo-sonad.webp. Bez loga se ukáže textové logo níže." },
            logoText1: { type: T.String, title: "Text loga (tučně)", defaultValue: "SONAD" },
            logoText2: { type: T.String, title: "Text loga (za tím)", defaultValue: "engineering" },
            logoHeight: { type: T.Number, title: "Výška loga", min: 16, max: 80, step: 1, unit: "px", defaultValue: 32 },
            menu: {
                type: T.Array,
                title: "Položky menu",
                control: {
                    type: T.Object,
                    controls: {
                        label: { type: T.String, title: "Text", defaultValue: "Odkaz" },
                        link: { type: T.String, title: "Odkaz", defaultValue: "#kontakt", placeholder: "#kontakt nebo https://…" },
                        desktop: { type: T.Boolean, title: "Na počítači", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Jen mobil" },
                    },
                },
                defaultValue: [
                    { label: "Úvod", link: "#top", desktop: true },
                    { label: "Služby", link: "#sluzby", desktop: true },
                    { label: "Jednoúčelové stroje", link: "#stroje", desktop: true },
                    { label: "Lokomotivy", link: "#lokomotivy", desktop: true },
                    { label: "Postup", link: "#postup", desktop: true },
                    { label: "Výroba", link: "#vyroba", desktop: true },
                    { label: "3D měření", link: "#mereni", desktop: true },
                    { label: "Z dílny", link: "#galerie", desktop: false },
                    { label: "O nás", link: "#onas", desktop: false },
                ],
            },
            ctaLabel: { type: T.String, title: "Tlačítko", defaultValue: "Kontakt" },
            ctaLink: { type: T.String, title: "Tlačítko — odkaz", defaultValue: "#kontakt" },
            showLanguages: { type: T.Boolean, title: "Přepínač jazyků", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            languages: {
                type: T.Array,
                title: "Jazyky",
                description: "Každý jazyk vede na svou verzi stránky (Framer → Locales).",
                hidden: (p: any = {}) => p?.showLanguages === false,
                control: {
                    type: T.Object,
                    controls: {
                        flag: { type: T.String, title: "Vlajka", defaultValue: "🇨🇿" },
                        code: { type: T.String, title: "Kód", defaultValue: "CS" },
                        label: { type: T.String, title: "Název", defaultValue: "Čeština" },
                        link: { type: T.String, title: "Odkaz", defaultValue: "/" },
                        current: { type: T.Boolean, title: "Aktuální", defaultValue: false },
                    },
                },
                defaultValue: [
                    { flag: "🇨🇿", code: "CS", label: "Čeština", link: "/", current: true },
                    { flag: "🇬🇧", code: "EN", label: "English", link: "/en", current: false },
                    { flag: "🇵🇱", code: "PL", label: "Polski", link: "/pl", current: false },
                    { flag: "🇩🇪", code: "DE", label: "Deutsch", link: "/de", current: false },
                ],
            },
        },
    },

    /* ⑥ Úvod */
    hero: {
        type: T.Object,
        title: "⑥ Úvod",
        controls: {
            show: showCtl,
            title: {
                type: T.String, title: "Nadpis", displayTextArea: true,
                defaultValue: "Jednoúčelové stroje\nod *konstrukce*\naž po předání.",
                description: "*slovo* = barva značky, **slovo** = tučně, Enter nebo | = nový řádek.",
            },
            lede: {
                type: T.String, title: "Podnadpis", displayTextArea: true,
                defaultValue: "Navrhneme, vyrobíme, smontujeme a oživíme stroj přesně pro váš díl a vaši linku. Konstrukce, obrobna, zámečnictví i montáž jsou pod jednou střechou — od prvního náčrtu po servisní dokumentaci.",
            },
            cta1Label: { type: T.String, title: "Tlačítko 1", defaultValue: "Nezávazná poptávka" },
            cta1Link: { type: T.String, title: "Tlačítko 1 — odkaz", defaultValue: "#kontakt" },
            cta2Label: { type: T.String, title: "Tlačítko 2", defaultValue: "Výrobní možnosti" },
            cta2Link: { type: T.String, title: "Tlačítko 2 — odkaz", defaultValue: "#vyroba" },
            photoStyle: {
                type: T.Enum, title: "Fotky",
                options: ["cutout", "framed"], optionTitles: ["Bez pozadí", "V rámu"],
                defaultValue: "cutout", displaySegmentedControl: true,
            },
            interval: { type: T.Number, title: "Střídání po", min: 1, max: 15, step: 0.5, unit: "s", defaultValue: 3 },
            slides: {
                type: T.Array,
                title: "Fotky — 1200 × 1200 px",
                control: {
                    type: T.Object,
                    controls: {
                        image: { type: T.Image, title: "Fotka" },
                        videoLink: { type: T.String, title: "Nebo video (odkaz)", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
                        alt: { type: T.String, title: "Popis", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { alt: "Jednoúčelový manipulátor s lineárními osami" },
                    { alt: "Montážní přípravek s upínkami a lineárním vedením" },
                    { alt: "Kontrolní přípravek s ruční upínkou" },
                    { alt: "Obrobené díly připravené k expedici" },
                ],
            },
            ...videoControls(),
        },
    },

    /* ⑦ Služby */
    services: {
        type: T.Object,
        title: "⑦ Služby",
        controls: {
            show: showCtl,
            anchor: { type: T.String, title: "ID kotvy", defaultValue: "sluzby" },
            eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "" },
            title: { type: T.String, title: "Nadpis", defaultValue: "Naše služby" },
            lede: {
                type: T.String, title: "Úvodní text", displayTextArea: true,
                defaultValue: "Většina zakázek u nás projde celou cestou: od zadání a konstrukce přes obrábění a svařence až po montáž a zprovoznění u zákazníka.",
            },
            columns: { type: T.Number, title: "Sloupců", min: 2, max: 4, step: 1, displayStepper: true, defaultValue: 3 },
            cards: {
                type: T.Array,
                title: "Karty",
                control: {
                    type: T.Object,
                    controls: {
                        title: { type: T.String, title: "Název", defaultValue: "Služba" },
                        text: { type: T.String, title: "Krátký text", defaultValue: "" },
                        bullets: { type: T.String, title: "Body (odděl | )", defaultValue: "", placeholder: "První | Druhý | Třetí" },
                        image: { type: T.Image, title: "Fotka — 1600 × 1000 px" },
                        videoLink: { type: T.String, title: "Nebo video (odkaz)", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
                        fit: {
                            type: T.Enum, title: "Fotka", options: ["cover", "contain"], optionTitles: ["Vyplnit", "Celá (bez pozadí)"],
                            defaultValue: "cover", displaySegmentedControl: true,
                        },
                        thumb1: { type: T.Image, title: "Náhled 1" },
                        thumb2: { type: T.Image, title: "Náhled 2" },
                        thumb3: { type: T.Image, title: "Náhled 3" },
                        showThumbs: { type: T.Boolean, title: "Prázdné náhledy", defaultValue: true, enabledTitle: "Kresba", disabledTitle: "Skrýt" },
                        ctaLabel: { type: T.String, title: "Odkaz — text", defaultValue: "Poptat" },
                        ctaLink: { type: T.String, title: "Odkaz", defaultValue: "#kontakt" },
                    },
                },
                defaultValue: [
                    { title: "Design a konstrukce", text: "Návrh řešení, 3D model a výkresová dokumentace ještě před první třískou.", bullets: "Návrh strojního zařízení na základě požadavků | Výkresová dokumentace schváleného návrhu | Dokumentace v papírové i elektronické podobě včetně CAD modelů", fit: "cover", showThumbs: true, ctaLabel: "Poptat konstrukci", ctaLink: "#kontakt" },
                    { title: "Výroba a montáž", text: "Od jednotlivých dílů po smontovaný a oživený celek připravený k předání.", bullets: "Stavba jednoúčelových strojů a přípravků | Montáž a předání | Programování, zapojení elektro i pneumatických obvodů | Dodání příslušné servisní dokumentace", fit: "cover", showThumbs: true, ctaLabel: "Poptat výrobu a montáž", ctaLink: "#kontakt" },
                    { title: "3D měření", text: "Přenosný 3D měřicí přístroj použijeme i přímo u výrobní linky.", bullets: "Kompaktní skenování mobilním 3D skenerem pro širokou škálu aplikací | Skenování a sondování", fit: "contain", showThumbs: true, ctaLabel: "Poptat 3D měření", ctaLink: "#kontakt" },
                    { title: "Obrábění", text: "CNC frézování, soustružení a broušení kusově i v sérii.", bullets: "CNC 3osé, 5osé a konvenční frézování | CNC a konvenční soustružení | Broušení", fit: "cover", showThumbs: true, ctaLabel: "Poptat obrábění", ctaLink: "#kontakt" },
                    { title: "Svařování", text: "Svařované konstrukce a rámy, ve spolupráci s Kovospol s.r.o. i rozměrné celky.", bullets: "Metody svařování: MAG, MIG, TIG | Laserové svařování do tloušťky 5 mm | Svařované materiály: ocel, nerezová ocel, hliník", fit: "contain", showThumbs: true, ctaLabel: "Poptat svařování", ctaLink: "#kontakt" },
                    { title: "Zakružování", text: "Zakružování plechů a profilů do oblouků a válcových tvarů.", bullets: "Do síly plechu 7 mm | Pracovní délka 1 550 mm | Průměr válců 130 mm | Od průměru 195 mm", fit: "cover", showThumbs: true, ctaLabel: "Poptat zakružování", ctaLink: "#kontakt" },
                    { title: "3D tisk", text: "Rychlé prototypy a plastové díly dřív, než se sáhne po kovu.", bullets: "Technologie FDM/FFF | Maximální tisková plocha 350 × 320 × 325 mm | Reverzní inženýring pomocí 3D skenování | Tisknuté materiály: PLA, PETG, TPU, ABS, ASA, PVA, PET, PA, PC a Carbon", fit: "cover", showThumbs: true, ctaLabel: "Poptat 3D tisk", ctaLink: "#kontakt" },
                    { title: "Laserové značení", text: "Trvalé značení dílů — popisy, čísla i datové kódy.", bullets: "Popisy, výrobní čísla a loga přímo do materiálu | Datové kódy pro dohledatelnost dílů | Značení dílů z naší výroby i dodaných kusů", fit: "cover", showThumbs: true, ctaLabel: "Poptat laserové značení", ctaLink: "#kontakt" },
                ],
            },
            ...videoControls(),
        },
    },

    /* ⑧ Tematické sekce (text + fotka) */
    features: {
        type: T.Object,
        title: "⑧ Sekce text + fotka",
        controls: {
            show: { ...showCtl, title: "Zobrazit sekce" },
            items: {
                type: T.Array,
                title: "Sekce",
                control: {
                    type: T.Object,
                    controls: {
                        show: { type: T.Boolean, title: "Zobrazit", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
                        placement: {
                            type: T.Enum, title: "Umístění",
                            options: ["afterServices", "afterProcess", "afterGallery"],
                            optionTitles: ["Za službami", "Za postupem", "Za galerií"],
                            defaultValue: "afterServices",
                        },
                        anchor: { type: T.String, title: "ID kotvy", defaultValue: "", placeholder: "např. stroje" },
                        reverse: { type: T.Boolean, title: "Fotka", defaultValue: false, enabledTitle: "Vlevo", disabledTitle: "Vpravo" },
                        eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "" },
                        title: { type: T.String, title: "Nadpis (| = nový řádek)", defaultValue: "Nadpis" },
                        lede: { type: T.String, title: "Text", defaultValue: "" },
                        checks: { type: T.String, title: "Odrážky (odděl | )", defaultValue: "", placeholder: "**Tučně** — zbytek | Další" },
                        tags: { type: T.String, title: "Štítky (odděl | )", defaultValue: "" },
                        lede2: { type: T.String, title: "Text pod štítky", defaultValue: "" },
                        linkLabel: { type: T.String, title: "Odkaz — text", defaultValue: "" },
                        linkUrl: { type: T.String, title: "Odkaz", defaultValue: "#kontakt" },
                        image: { type: T.Image, title: "Fotka — 1200 × 900 px" },
                        videoLink: { type: T.String, title: "Nebo video místo fotky", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
                        alt: { type: T.String, title: "Popis fotky", defaultValue: "" },
                        bgVideoLink: { type: T.String, title: "🎬 Video na pozadí", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
                        bgOverlay: {
                            type: T.Number, title: "Zakrytí videa", min: 0, max: 100, step: 5, unit: "%", defaultValue: 70,
                            hidden: (p: any = {}) => !(p?.bgVideoLink || "").trim(),
                        },
                    },
                },
                defaultValue: [
                    {
                        show: true, placement: "afterServices", anchor: "stroje", reverse: false,
                        eyebrow: "Jednoúčelové stroje", title: "Jeden dodavatel | od zadání po předání.",
                        lede: "Zabýváme se konstrukcí a stavbou jednoúčelových strojů a přípravků od jejich návrhu přes výrobu a montáž až po konečné zpracování a dodání. Nemusíte koordinovat pět firem.",
                        checks: "**Konstrukce a návrh** — 3D model, výkresová dokumentace, konzultace řešení | **Výroba dílů** — CNC frézování, soustružení, broušení, svařence | **Montáž a oživení** — programování, elektrické a pneumatické rozvody | **Předání** — servisní dokumentace, zaškolení obsluhy, následný servis",
                        tags: "", lede2: "", linkLabel: "Popište nám svoji operaci", linkUrl: "#kontakt",
                        videoLink: "", alt: "Jednoúčelový stroj při montáži", bgVideoLink: "", bgOverlay: 70,
                    },
                    {
                        show: true, placement: "afterServices", anchor: "lokomotivy", reverse: true,
                        eyebrow: "Renovace parních lokomotiv", title: "Řemeslo, které se | dnes už málokde umí.",
                        lede: "Zabýváme se repasí součástí parních lokomotiv, jako jsou armatury, injektory, odkalovače, kompresory typu D a P. Dále provádíme opravy lokomotivních rozvodů, ložisek ojnic, spojnic i náprav včetně případné nové výroby ložiskových pánví.",
                        checks: "Broušení kulis, křižákových pravítek a pístních tyčí | Výroba pístních kroužků, ucpávek a vedení pístnic | Výroba nových součástí dle poškozeného či opotřebeného kusu jako vzoru | Opravy v souladu s předpisy V19, V20/8, V43",
                        tags: "", lede2: "", linkLabel: "", linkUrl: "#kontakt",
                        videoLink: "", alt: "Renovace součástí parních lokomotiv", bgVideoLink: "", bgOverlay: 70,
                    },
                    {
                        show: true, placement: "afterProcess", anchor: "vyroba", reverse: true,
                        eyebrow: "Výrobní možnosti", title: "Obrobna, zámečnictví | a svařovna pod jednou střechou.",
                        lede: "Zvládáme kusovou i sériovou výrobu. Zámečnická dílna úzce spolupracuje s firmou Kovospol s.r.o., díky čemuž zajistíme i komplexní svařence a zpracování plechu.",
                        checks: "",
                        tags: "CNC frézování | Soustružení | Broušení | Svařování | Zámečnictví | Zpracování plechu | Montáž | Kompletace",
                        lede2: "Ve spolupráci s partnery zajistíme tepelné zpracování (kalení, nitridace) i povrchové úpravy — práškové lakování, zinkování, černění, eloxování — až po kompletní dodání zakázky.",
                        linkLabel: "", linkUrl: "#kontakt",
                        videoLink: "", alt: "CNC frézování ve výrobní hale", bgVideoLink: "", bgOverlay: 70,
                    },
                    {
                        show: true, placement: "afterProcess", anchor: "mereni", reverse: false,
                        eyebrow: "3D měření", title: "Měříme tam, | kde díl vzniká.",
                        lede: "Přenosný 3D souřadnicový měřicí přístroj použijeme přímo u výrobní linky — nebo kdekoliv jinde, kde je potřeba měřit. Optické i dotykové měření v jednom systému.",
                        checks: "Měřicí rozsah od drobného dílu po velké sestavy | Kontrola prvního kusu i výstupní kontrola série | Protokol o měření jako podklad pro reklamace i nápravu",
                        tags: "", lede2: "", linkLabel: "", linkUrl: "#kontakt",
                        videoLink: "", alt: "3D měření dílu", bgVideoLink: "", bgOverlay: 70,
                    },
                ],
            },
        },
    },

    /* ⑨ O nás */
    about: {
        type: T.Object,
        title: "⑨ O nás",
        controls: {
            show: showCtl,
            anchor: { type: T.String, title: "ID kotvy", defaultValue: "onas" },
            eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "O nás" },
            title: { type: T.String, title: "Nadpis", displayTextArea: true, defaultValue: "Přes třicet let\nu jednoho řemesla." },
            bigYear: { type: T.String, title: "Velký letopočet v pozadí", defaultValue: "1991" },
            lead: {
                type: T.String, title: "Hlavní odstavec", displayTextArea: true,
                defaultValue: "Sdružení Sonad působí na trhu již od roku 1991 jako soukromá nástrojařská dílna, jejíž hlavním výrobním programem byla výroba součástí pro textilní stroje, které postupem času nahrazuje automobilový průmysl. Od roku 2017 vystupujeme pod novým názvem **SONAD engineering s.r.o.** s výrobními prostory v areálu bývalé Textilany v Liberci-Radčicích.",
            },
            dropCap: { type: T.Boolean, title: "Velké první písmeno", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            body: {
                type: T.String, title: "Druhý odstavec", displayTextArea: true,
                defaultValue: "Naše firma se zabývá stavbou jednoúčelových strojů a přípravků od jejich návrhu přes výrobu, montáž po finální zpracování a předání. Zároveň se věnujeme jednotlivým zakázkám v oblasti třískového obrábění, broušení a svařování dle zadané výrobní dokumentace. Naše zámečnická dílna úzce spolupracuje s firmou Kovospol s.r.o., díky čemuž jsme schopni zajistit komplexní výrobu svařovaných konstrukcí a přípravků včetně oblasti zpracování plechů.",
            },
            milestones: {
                type: T.Array,
                title: "Milníky",
                control: {
                    type: T.Object,
                    controls: {
                        year: { type: T.String, title: "Rok", defaultValue: "2000" },
                        text: { type: T.String, title: "Text", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { year: "1991", text: "Soukromá nástrojařská dílna, součásti pro textilní stroje" },
                    { year: "Postupně", text: "Hlavním oborem se stává automobilový průmysl" },
                    { year: "2017", text: "SONAD engineering s.r.o. v areálu bývalé Textilany" },
                ],
            },
            showVideo: { type: T.Boolean, title: "Video vedle textu", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            videoFile: {
                type: T.File, title: "🎬 Video (soubor)", allowedFileTypes: ["mp4", "webm", "mov"],
                description: "Video na výšku, hraje ztlumeně jen když je vidět.",
                hidden: (p: any = {}) => p?.showVideo === false,
            },
            videoLink: { type: T.String, title: "🎬 Video (odkaz)", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4", hidden: (p: any = {}) => p?.showVideo === false },
            poster: { type: T.Image, title: "Náhled videa", description: "sonad/photos/o-nas-video-nahled.webp", hidden: (p: any = {}) => p?.showVideo === false },
            ratio: { type: T.String, title: "Poměr stran rámu", defaultValue: "300 / 566", description: "U nahraného videa se nastaví samo.", hidden: (p: any = {}) => p?.showVideo === false },
            videoAlt: { type: T.String, title: "Popis videa", defaultValue: "Záběr z výroby — jednoúčelový stroj v chodu", hidden: (p: any = {}) => p?.showVideo === false },
            ...videoControls("section"),
        },
    },

    /* ⑩ Čísla */
    stats: {
        type: T.Object,
        title: "⑩ Pás s čísly",
        controls: {
            show: showCtl,
            image: { type: T.Image, title: "Fotka pozadí — 1920 × 1440 px", description: "sonad/photos/cisla-pozadi.webp" },
            videoFile: { type: T.File, title: "🎬 Video pozadí (soubor)", allowedFileTypes: ["mp4", "webm", "mov"] },
            videoLink: { type: T.String, title: "🎬 Video pozadí (odkaz)", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
            tint: { type: T.Boolean, title: "Nádech barvou značky", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            tintStrength: { type: T.Number, title: "Síla nádechu", min: 0, max: 100, step: 5, unit: "%", defaultValue: 100, hidden: (p: any = {}) => p?.tint === false },
            label: { type: T.String, title: "Popis pro čtečky", defaultValue: "SONAD engineering v číslech" },
            facts: {
                type: T.Array,
                title: "Čísla",
                control: {
                    type: T.Object,
                    controls: {
                        value: { type: T.Number, title: "Číslo", defaultValue: 100, min: 0, max: 1000000, step: 1 },
                        prefix: { type: T.String, title: "Před číslem", defaultValue: "" },
                        suffix: { type: T.String, title: "Za číslem", defaultValue: "" },
                        thousands: { type: T.Boolean, title: "Mezera v tisících", defaultValue: false, enabledTitle: "4 000", disabledTitle: "4000" },
                        label: { type: T.String, title: "Popisek", defaultValue: "Popisek" },
                    },
                },
                defaultValue: [
                    { value: 1991, prefix: "", suffix: "", thousands: false, label: "Rok založení firmy" },
                    { value: 18, prefix: "", suffix: "", thousands: false, label: "Zaměstnanců" },
                    { value: 4000, prefix: "", suffix: "+", thousands: true, label: "Realizovaných projektů" },
                    { value: 200, prefix: "", suffix: " t", thousands: false, label: "Zpracované oceli" },
                ],
            },
        },
    },

    /* ⑪ Postup */
    process: {
        type: T.Object,
        title: "⑪ Postup zakázky",
        controls: {
            show: showCtl,
            anchor: { type: T.String, title: "ID kotvy", defaultValue: "postup" },
            eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "Jak to probíhá" },
            title: { type: T.String, title: "Nadpis", displayTextArea: true, defaultValue: "Od poptávky\nk hotovému stroji." },
            lede: { type: T.String, title: "Úvodní text", displayTextArea: true, defaultValue: "Sedm kroků, kterými u nás projde každá zakázka. U každého víte, co se děje a co od vás potřebujeme." },
            steps: {
                type: T.Array,
                title: "Kroky",
                control: {
                    type: T.Object,
                    controls: {
                        title: { type: T.String, title: "Název", defaultValue: "Krok" },
                        text: { type: T.String, title: "Text", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { title: "Poptávka", text: "Pošlete popis operace, výkres, model nebo jen fotku dílu. Ozveme se do dvou pracovních dnů." },
                    { title: "Konzultace a nabídka", text: "Probereme takt, přesnost a obsluhu, navrhneme technické řešení a pošleme cenovou nabídku s termínem." },
                    { title: "Konstrukce", text: "Zpracujeme 3D model a výkresovou dokumentaci. Řešení odsouhlasíte dřív, než se cokoliv vyrobí." },
                    { title: "Výroba dílů", text: "CNC frézování, soustružení, broušení a svařence u nás v dílně. Tepelné zpracování a povrchové úpravy v kooperaci." },
                    { title: "Montáž a oživení", text: "Sestavení stroje, programování, elektrické a pneumatické rozvody. Stroj si u nás zkusíte na svých dílech." },
                    { title: "Kontrola a 3D měření", text: "Proměříme klíčové rozměry a přesnost, k zakázce dostanete protokol o měření." },
                    { title: "Předání a servis", text: "Doprava, instalace u vás, zaškolení obsluhy a servisní dokumentace. Dál jsme k dispozici pro servis a úpravy." },
                ],
            },
            ...videoControls(),
        },
    },

    /* ⑫ Galerie */
    gallery: {
        type: T.Object,
        title: "⑫ Galerie „Z dílny“",
        controls: {
            show: showCtl,
            anchor: { type: T.String, title: "ID kotvy", defaultValue: "galerie" },
            eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "Z dílny" },
            title: { type: T.String, title: "Nadpis", displayTextArea: true, defaultValue: "Stroje, přípravky a díly,\nkteré u nás vznikly." },
            items: {
                type: T.Array,
                title: "Fotky a videa — 1000 × 800 px",
                control: {
                    type: T.Object,
                    controls: {
                        image: { type: T.Image, title: "Fotka" },
                        videoLink: { type: T.String, title: "Nebo video (odkaz)", defaultValue: "", placeholder: "YouTube, Vimeo nebo .mp4" },
                        caption: { type: T.String, title: "Popisek", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { caption: "Montážní přípravek" },
                    { caption: "Dílna v Radčicích" },
                    { caption: "Soustružení a broušení" },
                    { caption: "Svařenec rámu" },
                    { caption: "Zámečnická výroba" },
                ],
            },
            ...videoControls(),
        },
    },

    /* ⑬ Kontakt */
    contact: {
        type: T.Object,
        title: "⑬ Kontakt a sociální sítě",
        controls: {
            show: showCtl,
            anchor: { type: T.String, title: "ID kotvy", defaultValue: "kontakt" },
            eyebrow: { type: T.String, title: "Nadtitulek", defaultValue: "Kontakt" },
            title: { type: T.String, title: "Nadpis", displayTextArea: true, defaultValue: "Pošlete nám zadání.\nOzveme se s návrhem." },
            lede: { type: T.String, title: "Úvodní text", displayTextArea: true, defaultValue: "Stačí popis operace, výkres nebo fotka dílu. Ozvěte se přímo tomu, koho se věc týká — nebo napište na obecnou adresu a my to předáme dál." },
            phone: { type: T.String, title: "Hlavní telefon", defaultValue: "+420 603 462 881" },
            email: { type: T.String, title: "Hlavní e-mail", defaultValue: "info@sonad.cz" },
            callLabel: { type: T.String, title: "Tlačítko Zavolat", defaultValue: "Zavolat" },
            mailLabel: { type: T.String, title: "Tlačítko E-mail", defaultValue: "Napsat e-mail" },
            peopleHeading: { type: T.String, title: "Nadpis lidí", defaultValue: "Vedení společnosti" },
            people: {
                type: T.Array,
                title: "Lidé",
                control: {
                    type: T.Object,
                    controls: {
                        name: { type: T.String, title: "Jméno", defaultValue: "Jméno Příjmení" },
                        role: { type: T.String, title: "Pozice", defaultValue: "" },
                        phone: { type: T.String, title: "Telefon", defaultValue: "" },
                        email: { type: T.String, title: "E-mail", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { name: "Vilém Bartoň", role: "jednatel společnosti", phone: "+420 603 462 881", email: "v.barton@sonad.cz" },
                    { name: "Daniel Bartoň", role: "vedoucí svařovny", phone: "+420 773 113 389", email: "d.barton@sonad.cz" },
                    { name: "Ing. Martin Holub", role: "konstrukce, projektový vedoucí", phone: "+420 777 878 906", email: "m.holub@sonad.cz" },
                    { name: "Miroslav Škvor", role: "konstrukce", phone: "+420 774 021 302", email: "m.skvor@sonad.cz" },
                    { name: "Tomáš Goč", role: "3D měření", phone: "+420 602 475 162", email: "t.goc@sonad.cz" },
                    { name: "Adriana Němcová", role: "asistentka, finance", phone: "+420 777 709 781", email: "a.nemcova@sonad.cz" },
                ],
            },
            infoHeading: { type: T.String, title: "Nadpis údajů", defaultValue: "Adresy a poptávky" },
            showAddress: { type: T.Boolean, title: "Box: Provozovna", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            addressTitle: { type: T.String, title: "Provozovna — nadpis", defaultValue: "Adresa provozovny", hidden: (p: any = {}) => p?.showAddress === false },
            address: { type: T.String, title: "Provozovna — adresa", displayTextArea: true, defaultValue: "Hejnická 66\n460 01 Liberec XXXII – Radčice", hidden: (p: any = {}) => p?.showAddress === false },
            addressNote: { type: T.String, title: "Provozovna — poznámka", defaultValue: "Areál bývalé Textilany", hidden: (p: any = {}) => p?.showAddress === false },
            showBilling: { type: T.Boolean, title: "Box: Fakturace", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            billingTitle: { type: T.String, title: "Fakturace — nadpis", defaultValue: "Fakturační adresa", hidden: (p: any = {}) => p?.showBilling === false },
            company: { type: T.String, title: "Fakturace — firma", defaultValue: "SONAD engineering s.r.o.", hidden: (p: any = {}) => p?.showBilling === false },
            billing: { type: T.String, title: "Fakturace — adresa", displayTextArea: true, defaultValue: "Hejnická 66, 460 01 Liberec", hidden: (p: any = {}) => p?.showBilling === false },
            billingNote: { type: T.String, title: "Fakturace — poznámka", defaultValue: "IČO 05935318", hidden: (p: any = {}) => p?.showBilling === false },
            showInquiry: { type: T.Boolean, title: "Box: Poptávky + sítě", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            inquiryTitle: { type: T.String, title: "Poptávky — nadpis", defaultValue: "Poptávky", hidden: (p: any = {}) => p?.showInquiry === false },
            inquiryNote: { type: T.String, title: "Poptávky — poznámka", defaultValue: "Ozveme se do dvou pracovních dnů.", hidden: (p: any = {}) => p?.showInquiry === false },
            socials: {
                type: T.Array,
                title: "Sociální sítě",
                description: "Síť bez odkazu se na webu nezobrazí (v editoru je vidět čárkovaně).",
                control: {
                    type: T.Object,
                    controls: {
                        network: {
                            type: T.Enum, title: "Síť",
                            options: ["facebook", "instagram", "linkedin", "youtube", "x", "tiktok", "whatsapp", "email", "web"],
                            optionTitles: ["Facebook", "Instagram", "LinkedIn", "YouTube", "X (Twitter)", "TikTok", "WhatsApp", "E-mail", "Web"],
                            defaultValue: "facebook",
                        },
                        url: { type: T.String, title: "Odkaz", defaultValue: "", placeholder: "https://…" },
                        label: { type: T.String, title: "Popis (nepovinné)", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { network: "facebook", url: "https://www.facebook.com/people/SONAD-engineering/100057255828664/", label: "" },
                    { network: "instagram", url: "", label: "" },
                ],
            },
            showHours: { type: T.Boolean, title: "Box: Otevírací doba", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            hoursTitle: { type: T.String, title: "Otevírací doba — nadpis", defaultValue: "Otevírací doba", hidden: (p: any = {}) => p?.showHours === false },
            todayLabel: { type: T.String, title: "Označení dneška", defaultValue: "dnes", hidden: (p: any = {}) => p?.showHours === false },
            hours: {
                type: T.Array,
                title: "Dny",
                hidden: (p: any = {}) => p?.showHours === false,
                control: {
                    type: T.Object,
                    controls: {
                        day: { type: T.String, title: "Den", defaultValue: "Pondělí" },
                        hours: { type: T.String, title: "Čas", defaultValue: "07:00 – 16:00" },
                        weekday: {
                            type: T.Enum, title: "Zvýraznit dnes",
                            options: ["1", "2", "3", "4", "5", "6", "0", "none"],
                            optionTitles: ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle", "Nezvýrazňovat"],
                            defaultValue: "1",
                        },
                    },
                },
                defaultValue: [
                    { day: "Pondělí", hours: "07:00 – 16:00", weekday: "1" },
                    { day: "Úterý", hours: "07:00 – 16:00", weekday: "2" },
                    { day: "Středa", hours: "07:00 – 16:00", weekday: "3" },
                    { day: "Čtvrtek", hours: "07:00 – 16:00", weekday: "4" },
                    { day: "Pátek", hours: "07:00 – 16:00", weekday: "5" },
                ],
            },
            ...videoControls(),
        },
    },

    /* ⑭ Mapa */
    map: {
        type: T.Object,
        title: "⑭ 🗺️ Mapa",
        controls: {
            show: { ...showCtl, title: "Zobrazit mapu" },
            mode: {
                type: T.Enum, title: "Zdroj",
                options: ["address", "embed"], optionTitles: ["Adresa", "Vložený odkaz"],
                defaultValue: "address", displaySegmentedControl: true,
            },
            address: { type: T.String, title: "Adresa", defaultValue: "Hejnická 66, 460 01 Liberec", hidden: (p: any = {}) => p?.mode === "embed" },
            zoom: { type: T.Number, title: "Přiblížení", min: 3, max: 20, step: 1, defaultValue: 16, hidden: (p: any = {}) => p?.mode === "embed" },
            lang: { type: T.String, title: "Jazyk mapy", defaultValue: "cs", hidden: (p: any = {}) => p?.mode === "embed" },
            embed: {
                type: T.String, title: "Odkaz / <iframe>", defaultValue: "",
                placeholder: "Google Maps → Sdílet → Vložit mapu",
                description: "Stačí vložit celý kód <iframe …>, adresa se z něj vytáhne sama.",
                hidden: (p: any = {}) => p?.mode !== "embed",
            },
            openUrl: { type: T.String, title: "Odkaz „Otevřít v Mapách“", defaultValue: "", hidden: (p: any = {}) => p?.mode !== "embed" },
            height: { type: T.Number, title: "Výška", min: 200, max: 800, step: 10, unit: "px", defaultValue: 420 },
            grayscale: { type: T.Number, title: "Odbarvení", min: 0, max: 100, step: 5, unit: "%", defaultValue: 82 },
            tint: { type: T.Boolean, title: "Nádech barvou značky", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            tintStrength: { type: T.Number, title: "Síla nádechu", min: 0, max: 100, step: 5, unit: "%", defaultValue: 100, hidden: (p: any = {}) => p?.tint === false },
            blend: {
                type: T.Enum, title: "Režim nádechu",
                options: ["multiply", "color", "soft-light"], optionTitles: ["Násobit", "Barva", "Měkké světlo"],
                defaultValue: "multiply",
                hidden: (p: any = {}) => p?.tint === false,
            },
            showLabel: { type: T.Boolean, title: "Štítek s adresou", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            labelTitle: { type: T.String, title: "Štítek — nadpis", defaultValue: "SONAD engineering s.r.o.", hidden: (p: any = {}) => p?.showLabel === false },
            labelText: { type: T.String, title: "Štítek — text", defaultValue: "Hejnická 66, 460 01 Liberec XXXII – Radčice", hidden: (p: any = {}) => p?.showLabel === false },
            buttonLabel: { type: T.String, title: "Tlačítko", defaultValue: "Otevřít v Mapách" },
        },
    },

    /* ⑮ Patička */
    footer: {
        type: T.Object,
        title: "⑮ Patička",
        controls: {
            show: showCtl,
            logoHeight: { type: T.Number, title: "Výška loga", min: 16, max: 90, step: 1, unit: "px", defaultValue: 40 },
            text: { type: T.String, title: "Popis", displayTextArea: true, defaultValue: "Konstrukce a stavba jednoúčelových strojů a přípravků — od návrhu přes výrobu a montáž až po konečné zpracování a dodání. V Liberci od roku 1991." },
            cta1Label: { type: T.String, title: "Tlačítko 1", defaultValue: "Napsat nám" },
            cta1Link: { type: T.String, title: "Tlačítko 1 — odkaz", defaultValue: "mailto:info@sonad.cz" },
            cta2Label: { type: T.String, title: "Tlačítko 2", defaultValue: "+420 603 462 881" },
            cta2Link: { type: T.String, title: "Tlačítko 2 — odkaz", defaultValue: "tel:+420603462881" },
            showSocials: { type: T.Boolean, title: "Sociální sítě", defaultValue: true, enabledTitle: "Ano", disabledTitle: "Ne" },
            col1Title: { type: T.String, title: "Sloupec 1 — nadpis", defaultValue: "Sídlo a provozovna" },
            company: { type: T.String, title: "Firma", defaultValue: "SONAD engineering s.r.o." },
            address: { type: T.String, title: "Adresa", displayTextArea: true, defaultValue: "Hejnická 66\n460 01 Liberec XXXII – Radčice" },
            rows: {
                type: T.Array,
                title: "Údaje",
                control: {
                    type: T.Object,
                    controls: {
                        label: { type: T.String, title: "Popisek", defaultValue: "IČO" },
                        value: { type: T.String, title: "Hodnota", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { label: "IČO", value: "05935318" },
                    { label: "Zápis", value: "obchodní rejstřík, Krajský soud v Ústí nad Labem" },
                    { label: "Provoz", value: "areál bývalé Textilany" },
                ],
            },
            col2Title: { type: T.String, title: "Sloupec 2 — nadpis", defaultValue: "Kontakty" },
            people: {
                type: T.Array,
                title: "Kontakty",
                control: {
                    type: T.Object,
                    controls: {
                        name: { type: T.String, title: "Jméno", defaultValue: "" },
                        role: { type: T.String, title: "Pozice", defaultValue: "" },
                        phone: { type: T.String, title: "Telefon", defaultValue: "" },
                        email: { type: T.String, title: "E-mail", defaultValue: "" },
                    },
                },
                defaultValue: [
                    { name: "Vilém Bartoň", role: "jednatel", phone: "+420 603 462 881", email: "v.barton@sonad.cz" },
                    { name: "Adriana Němcová", role: "asistentka, finance", phone: "+420 777 709 781", email: "a.nemcova@sonad.cz" },
                    { name: "Obecné dotazy a poptávky", role: "", phone: "", email: "info@sonad.cz" },
                ],
            },
            col3Title: { type: T.String, title: "Sloupec 3 — nadpis", defaultValue: "Rozcestník" },
            nav: {
                type: T.Array,
                title: "Odkazy",
                control: {
                    type: T.Object,
                    controls: {
                        label: { type: T.String, title: "Text", defaultValue: "Odkaz" },
                        link: { type: T.String, title: "Odkaz", defaultValue: "#top" },
                    },
                },
                defaultValue: [
                    { label: "Úvod", link: "#top" },
                    { label: "Služby", link: "#sluzby" },
                    { label: "Jednoúčelové stroje", link: "#stroje" },
                    { label: "Renovace lokomotiv", link: "#lokomotivy" },
                    { label: "Postup zakázky", link: "#postup" },
                    { label: "Výroba", link: "#vyroba" },
                    { label: "3D měření", link: "#mereni" },
                    { label: "Z dílny", link: "#galerie" },
                    { label: "O nás", link: "#onas" },
                    { label: "Kontakt", link: "#kontakt" },
                ],
            },
            copyright: { type: T.String, title: "Copyright", defaultValue: "© {year} SONAD engineering s.r.o.", description: "{year} se nahradí aktuálním rokem." },
            rights: { type: T.String, title: "Práva", defaultValue: "Všechna práva vyhrazena" },
            privacyLabel: { type: T.String, title: "Odkaz GDPR — text", defaultValue: "Zpracování osobních údajů" },
            privacyLink: { type: T.String, title: "Odkaz GDPR", defaultValue: "/osobni-udaje" },
        },
    },
})
