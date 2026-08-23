import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/* The demo photographs. Two companion code files, because Framer will not
   save one file long enough to hold the component and all of them. */
import {
    HERO_PHOTO_WIDE,
    PHOTO_VILLALIV,
    PHOTO_PORCHEXT,
    PHOTO_CHALETDUSK,
    PHOTO_BEAMROOM,
    PHOTO_ORANGEROOM,
    PHOTO_BRICKHOME,
    PHOTO_STUDIORM
} from "./ThresholdPhotosA"
import {
    HERO_PHOTO_TALL,
    PHOTO_VILLAEXT,
    PHOTO_GREYLIV,
    PHOTO_SHINGLEEXT,
    PHOTO_VILLAPOOL,
    PHOTO_TANSOFA,
    PHOTO_LOFTROOM,
    PHOTO_LOTVIEW,
    PHOTO_BOARDRM
} from "./ThresholdPhotosB"

// ---------------------------------------------------------------------------
// THRESHOLD — a real-estate site as one Framer code component.
//
// The page is produced by the same string builders the standalone HTML uses,
// injected once and then wired up by an effect. That is deliberate: the two
// products have to render identically, and one set of builders is the only way
// to keep them that way. Everything a buyer edits arrives as props, is turned
// into the data model below, and the builders run again.
//
// The stylesheet is the HTML file's, scoped under .thr-root so it cannot leak
// into the Framer editor's own page, with the palette on custom properties so
// ② Global Style reaches every rule.
// ---------------------------------------------------------------------------

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`

const CSS = `/* ==========================================================================
   THRESHOLD — design tokens
   ========================================================================== */

.thr-root{
  /* Surfaces — warm, paper-like */
  --bone:#f6f5f2;
  --paper:#fbfaf8;
  --mist:#eceae4;
  --line:#e2dfd8;

  /* Ink */
  --ink:#15161a;
  --graphite:#2a2c32;
  --slate:#5d6068;
  --muted:#8b8e96;
  /* Light text on the dark sections and over the hero photograph. */
  --on-dark:#f2f0ea;
  --on-dark-rgb:242,240,234;
  /* Multipliers the Glass and Navbar Opacity sliders drive. Every frosted
     alpha in this file is written as calc(base * multiplier), so one number
     moves all of them together instead of only the three below. */
  --glass-a:1;
  --nav-a:1;

  /* Dark surfaces */
  --night:#121317;
  --night-2:#1a1c21;

  /* Accent — champagne, used sparingly */
  --champagne:#b08d57;
  --champagne-soft:#c9a97a;
  --champagne-rgb:176,141,87;
  --champagne-wash:rgba(var(--champagne-rgb),0.10);

  /* Glass */
  /* Repainted from the properties panel in the Framer build; these are the
     shipped values, and the ones the standalone page keeps. */
  --btn-fill:var(--ink);
  --btn-ink:var(--bone);
  --nav-rgb:255,255,255;
  /* the pair a solid button uses on a dark section — reversed by default so it
     stays readable there; the panel can point both at the light-side pair */
  --btn-dark-fill:var(--btn-ink);
  --btn-dark-ink:var(--btn-fill);
  /* the navbar while it floats over the dark hero. Its own set, so the panel
     can either keep the dark treatment or carry the navbar colour up there. */
  --nav-dark-rgb:var(--night-rgb);
  --nav-dark-bd:rgba(255,255,255,0.18);
  --nav-dark-fg:var(--on-dark);
  --nav-dark-link:rgba(var(--on-dark-rgb),0.88);
  --nav-dark-link-hover:var(--on-dark);
  --nav-dark-sub:rgba(var(--on-dark-rgb),0.70);
  --nav-dark-cta-bg:var(--btn-dark-fill);
  --nav-dark-cta-fg:var(--btn-dark-ink);
  --glass-rgb:255,255,255;
  --night-rgb:18,20,24;

  --glass:rgba(var(--glass-rgb),calc(0.55 * var(--glass-a)));
  --glass-strong:rgba(var(--glass-rgb),calc(0.72 * var(--glass-a)));
  --glass-quiet:rgba(var(--glass-rgb),calc(0.38 * var(--glass-a)));
  --glass-border:rgba(255,255,255,0.68);
  --glass-edge:rgba(255,255,255,0.85);
  --glass-dark:rgba(255,255,255,0.06);
  --glass-dark-border:rgba(255,255,255,0.12);
  --blur:22px;

  /* Shadows — soft, low, wide */
  --sh-1:0 1px 2px rgba(21,22,26,0.04), 0 8px 24px -16px rgba(21,22,26,0.22);
  --sh-2:0 2px 6px rgba(21,22,26,0.05), 0 24px 60px -34px rgba(21,22,26,0.40);
  --sh-3:0 4px 12px rgba(21,22,26,0.06), 0 44px 96px -46px rgba(21,22,26,0.52);
  --sh-glow:0 0 0 1px rgba(var(--champagne-rgb),0.28), 0 30px 70px -34px rgba(21,22,26,0.5);

  /* Radii */
  --r-xs:12px;
  --r-sm:16px;
  --r-md:22px;
  --r-lg:30px;
  --r-xl:40px;

  /* Motion */
  --ease:cubic-bezier(0.22,1,0.36,1);
  --ease-soft:cubic-bezier(0.4,0,0.2,1);
  --t-fast:220ms;
  --t:420ms;
  --t-slow:680ms;
  --t-collapse:700ms;

  /* Layout */
  --gut:clamp(20px,4vw,64px);
  --maxw:1360px;
  --nav-h:74px;
}

.thr-root *, .thr-root *::before, .thr-root *::after{box-sizing:border-box;}

.thr-root{-webkit-text-size-adjust:100%;}
.thr-root:focus-within{scroll-behavior:smooth;}

.thr-root{
  position:relative;
  margin:0;
  background:var(--bone);
  color:var(--ink);
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:16px;
  line-height:1.55;
  font-weight:400;
  letter-spacing:-0.006em;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  overflow-x:clip;
  overflow-wrap:break-word;
}
.thr-root.is-locked{overflow:hidden;}

/* Ambient light — two very soft washes fixed behind everything */

.thr-root::before{
  content:"";
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(900px 620px at 88% -8%, rgba(var(--champagne-rgb),0.16), transparent 62%),
    radial-gradient(760px 560px at 4% 12%, rgba(150,163,182,0.13), transparent 60%),
    radial-gradient(1100px 700px at 50% 108%, rgba(var(--champagne-rgb),0.09), transparent 65%);
}

/* Very fine grain — keeps large flat areas from banding */

.thr-root::after{
  content:"";
  position:absolute; inset:-20%; z-index:400; pointer-events:none;
  opacity:0.30; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.32'/></svg>");
}

.thr-root img, .thr-root svg, .thr-root video{display:block; max-width:100%;}
.thr-root img{background:var(--mist);}
.thr-root a{color:inherit; text-decoration:none;}
.thr-root button{font:inherit; color:inherit; background:none; border:0; margin:0; padding:0; cursor:pointer;}
.thr-root input, .thr-root select{font:inherit; color:inherit;}
.thr-root ::selection{background:var(--ink); color:var(--bone);}

/* ==========================================================================
   Typography
   ========================================================================== */

.thr-root h1, .thr-root h2, .thr-root h3, .thr-root h4{margin:0; font-weight:300; letter-spacing:-0.035em; line-height:1.02;}
.thr-root h1{font-size:clamp(2.6rem,6.6vw,6rem);}
.thr-root h2{font-size:clamp(2rem,4.4vw,3.9rem); line-height:1.04;}
.thr-root h3{font-size:clamp(1.3rem,2vw,1.85rem); letter-spacing:-0.028em; line-height:1.12;}
.thr-root p{margin:0;}

.thr-root .eyebrow{
  font-family:'IBM Plex Mono',ui-monospace,monospace;
  font-size:0.68rem; font-weight:400;
  letter-spacing:0.24em; text-transform:uppercase;
  color:var(--champagne);
}
.thr-root .eyebrow--quiet{color:var(--muted);}
.thr-root .lede{
  font-size:clamp(1.02rem,1.35vw,1.22rem);
  line-height:1.62; color:var(--slate); font-weight:300;
  letter-spacing:-0.012em;
  max-width:56ch;
}
.thr-root .mono{font-family:'IBM Plex Mono',ui-monospace,monospace; font-variant-numeric:tabular-nums;}
.thr-root .sr-only{
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0;
}

/* ==========================================================================
   Layout helpers
   ========================================================================== */

.thr-root .wrap{width:100%; max-width:var(--maxw); margin:0 auto; padding-inline:var(--gut);}
.thr-root .section{padding-block:clamp(72px,10vw,148px);}
.thr-root .section--tight{padding-block:clamp(56px,7vw,104px);}
.thr-root .sec-head{display:flex; align-items:flex-end; justify-content:space-between; gap:32px; flex-wrap:wrap; margin-bottom:clamp(32px,4.5vw,60px);}
.thr-root .sec-head__text{max-width:min(100%,780px);}
.thr-root .sec-head .eyebrow{display:block; margin-bottom:18px;}
.thr-root .sec-head h2{margin-bottom:20px;}
.thr-root .rule{height:1px; background:var(--line); border:0; margin:0;}

/* ==========================================================================
   Glass primitives
   ========================================================================== */

.thr-root .glass{
  background:var(--glass);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(1.7);
  backdrop-filter:blur(var(--blur)) saturate(1.7);
  border:1px solid var(--glass-border);
  box-shadow:inset 0 1px 0 var(--glass-edge), var(--sh-2);
}
.thr-root .glass--quiet{background:var(--glass-quiet);}
.thr-root .glass--strong{background:var(--glass-strong);}
.thr-root .glass--dark{
  background:var(--glass-dark);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(1.4);
  backdrop-filter:blur(var(--blur)) saturate(1.4);
  border:1px solid var(--glass-dark-border);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.10), 0 30px 70px -40px rgba(0,0,0,0.9);
  color:var(--on-dark);
}

/* ==========================================================================
   Buttons
   ========================================================================== */

.thr-root .btn{
  /* one place to repaint every solid button */
  --btn-bg:var(--btn-fill); --btn-fg:var(--btn-ink); --btn-bd:transparent;
  position:relative; display:inline-flex; align-items:center; gap:10px;
  padding:14px 26px; border-radius:999px;
  background:var(--btn-bg); color:var(--btn-fg);
  border:1px solid var(--btn-bd);
  font-size:0.9rem; font-weight:500; letter-spacing:-0.012em;
  white-space:nowrap; cursor:pointer;
  transition:transform var(--t) var(--ease), box-shadow var(--t) var(--ease),
             background var(--t-fast) var(--ease-soft), color var(--t-fast) var(--ease-soft);
  will-change:transform;
}
.thr-root .btn:hover{box-shadow:var(--sh-2);}
.thr-root .btn:active{transform:scale(0.98) translate(var(--mx,0),var(--my,0));}
.thr-root .btn__arrow{
  width:16px; height:16px; flex:none;
  transition:transform var(--t) var(--ease);
}
.thr-root .btn:hover .btn__arrow{transform:translateX(4px);}
.thr-root .btn--ghost{
  --btn-bg:var(--glass); --btn-fg:var(--ink); --btn-bd:var(--glass-border);
  -webkit-backdrop-filter:blur(18px) saturate(1.6);
  backdrop-filter:blur(18px) saturate(1.6);
  box-shadow:inset 0 1px 0 var(--glass-edge), var(--sh-1);
}
.thr-root .btn--ghost:hover{--btn-bg:var(--glass-strong);}
.thr-root .btn--line{--btn-bg:transparent; --btn-fg:var(--ink); --btn-bd:var(--line);}
.thr-root .btn--line:hover{--btn-bd:var(--ink);}

/* On a dark section the button is the buyer's pair the other way round, so
   picking blue on white gives white on blue here rather than a fixed cream. */

.thr-root .btn--on-dark{--btn-bg:var(--btn-dark-fill); --btn-fg:var(--btn-dark-ink);}
.thr-root .btn--on-dark-ghost{
  --btn-bg:rgba(255,255,255,0.07); --btn-fg:#f2f0ea; --btn-bd:rgba(255,255,255,0.20);
  -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px);
}
.thr-root .btn--on-dark-ghost:hover{--btn-bg:rgba(255,255,255,0.13);}
.thr-root .btn--sm{padding:10px 18px; font-size:0.82rem;}
.thr-root .btn--lg{padding:17px 32px; font-size:0.95rem;}

/* Magnetic buttons get a translate from JS via --mx/--my */

.thr-root .magnetic{transform:translate(var(--mx,0),var(--my,0));}

/* Focus — one visible treatment everywhere */

.thr-root :where(a, .thr-root button, .thr-root input, .thr-root select, .thr-root [tabindex]):focus-visible{
  outline:2px solid var(--champagne);
  outline-offset:3px;
  border-radius:6px;
}
.thr-root .fp-room:focus-visible{outline-offset:0;}

/* ==========================================================================
   Scroll reveal
   ========================================================================== */

.thr-root .reveal{opacity:1; transform:none;}
.thr-root.js .reveal{
  opacity:0; transform:translateY(22px);
  transition:opacity var(--t-slow) var(--ease), transform var(--t-slow) var(--ease);
  transition-delay:var(--d,0ms);
}
.thr-root.js .reveal.is-in{opacity:1; transform:none;}

@media (prefers-reduced-motion:reduce){
  .thr-root:focus-within{scroll-behavior:auto;}
  .thr-root *, .thr-root *::before, .thr-root *::after{
    animation-duration:0.01ms !important; animation-iteration-count:1 !important;
    transition-duration:0.01ms !important; scroll-behavior:auto !important;
  }
  .thr-root .reveal{opacity:1; transform:none;}
}

/* ==========================================================================
   Header — floating glass pill
   ========================================================================== */

.thr-root .site-header{
  position:fixed; inset:14px 0 auto; z-index:200;
  display:flex; justify-content:center;
  padding-inline:var(--gut);
  pointer-events:none;
  transition:transform var(--t) var(--ease);
}
.thr-root .site-header.is-hidden{transform:translateY(-140%);}
.thr-root .nav{
  pointer-events:auto;
  width:100%; max-width:var(--maxw);
  display:flex; align-items:center; gap:20px;
  height:var(--nav-h);
  padding:0 12px 0 22px;
  border-radius:999px;
  background:rgba(var(--nav-rgb),calc(0.34 * var(--nav-a)));
  border:1px solid rgba(255,255,255,0.42);
  -webkit-backdrop-filter:blur(18px) saturate(1.6);
  backdrop-filter:blur(18px) saturate(1.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 40px -26px rgba(21,22,26,0.5);
  transition:background var(--t) var(--ease), box-shadow var(--t) var(--ease),
             border-color var(--t) var(--ease), height var(--t) var(--ease);
}
.thr-root .site-header.is-scrolled .nav{
  background:rgba(var(--nav-rgb),calc(0.72 * var(--nav-a)));
  border-color:rgba(var(--on-dark-rgb),0.8);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 46px -28px rgba(21,22,26,0.55);
}
.thr-root .site-header.on-dark .nav{
  /* Floating over the dark hero the pill follows the dark-section colour
     rather than the navbar tint, or a light tint would land under light text. */
  background:rgba(var(--nav-dark-rgb),calc(0.50 * var(--nav-a)));
  border-color:var(--nav-dark-bd);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 44px -30px rgba(0,0,0,0.8);
  color:var(--nav-dark-fg);
}
.thr-root .site-header.on-dark .nav__link{color:var(--nav-dark-link);}
.thr-root .site-header.on-dark .nav__link:hover, .thr-root .site-header.on-dark .nav__link.is-active{color:var(--nav-dark-link-hover);}
.thr-root .site-header.on-dark .nav__link::after{background:var(--champagne-soft);}
.thr-root .site-header.on-dark .brand__mark{background:var(--nav-dark-cta-bg); color:var(--nav-dark-cta-fg);}
.thr-root .site-header.on-dark .btn--cta{--btn-bg:var(--nav-dark-cta-bg); --btn-fg:var(--nav-dark-cta-fg);}
.thr-root .site-header.on-dark .burger span{background:var(--nav-dark-fg);}

.thr-root .brand{display:flex; align-items:center; gap:11px; flex:none;}
.thr-root .brand__mark{
  width:32px; height:32px; border-radius:9px; flex:none;
  background:var(--ink); color:var(--bone);
  display:grid; place-items:center;
  transition:transform var(--t) var(--ease), background var(--t) var(--ease), color var(--t) var(--ease);
}
.thr-root .brand:hover .brand__mark{transform:rotate(-6deg) scale(1.06);}

/* An uploaded logo replaces the drawn mark. A second file can be given for
   the header while it floats over the dark hero, where a dark logo would
   disappear; without one the same file is used on both. */

.thr-root .brand__logo{
  display:block; height:var(--logo-h,34px); width:auto;
  max-width:min(240px,44vw); object-fit:contain; flex:none;
  transition:opacity var(--t) var(--ease);
}
.thr-root .brand__logo--dark{display:none;}
.thr-root .site-header.on-dark .brand__logo--light{display:none;}
.thr-root .site-header.on-dark .brand__logo--dark{display:block;}
.thr-root .brand__mark svg{width:17px; height:17px;}
.thr-root .brand__name{
  font-size:1.02rem; font-weight:500; letter-spacing:0.20em;
  text-transform:uppercase; line-height:1;
}
.thr-root .brand__sub{
  display:block; font-family:'IBM Plex Mono',monospace;
  font-size:0.55rem; letter-spacing:0.20em; text-transform:uppercase;
  color:var(--muted); margin-top:4px;
}
.thr-root .site-header.on-dark .brand__sub{color:var(--nav-dark-sub);}

.thr-root .nav__links{display:flex; align-items:center; gap:4px; margin-inline:auto;}
.thr-root .nav__link{
  position:relative; padding:9px 14px; border-radius:999px;
  font-size:0.88rem; font-weight:400; color:var(--slate);
  transition:color var(--t-fast) var(--ease-soft);
}
.thr-root .nav__link:hover, .thr-root .nav__link.is-active{color:var(--ink);}
.thr-root .nav__link::after{
  content:""; position:absolute; left:14px; right:14px; bottom:4px; height:1px;
  background:var(--champagne); transform:scaleX(0); transform-origin:left;
  transition:transform var(--t) var(--ease);
}
.thr-root .nav__link:hover::after, .thr-root .nav__link.is-active::after{transform:scaleX(1);}
.thr-root .nav__cta{flex:none; display:flex; align-items:center; gap:8px;}
.thr-root .btn--cta{padding:12px 22px; font-size:0.85rem;}

.thr-root .burger{
  display:none; width:46px; height:46px; border-radius:999px;
  align-items:center; justify-content:center; flex-direction:column; gap:5px;
  flex:none;
}
.thr-root .burger span{
  display:block; width:19px; height:1.4px; background:var(--ink); border-radius:2px;
  transition:transform var(--t) var(--ease), opacity var(--t-fast) var(--ease-soft), width var(--t) var(--ease);
}
.thr-root .burger.is-open span:nth-child(1){transform:translateY(6.4px) rotate(45deg);}
.thr-root .burger.is-open span:nth-child(2){opacity:0; width:0;}
.thr-root .burger.is-open span:nth-child(3){transform:translateY(-6.4px) rotate(-45deg);}

/* Mobile sheet menu */

.thr-root .mobile-menu{
  position:fixed; inset:0; z-index:190;
  display:flex; flex-direction:column; justify-content:flex-end;
  padding:16px; pointer-events:none;
}
.thr-root .mobile-menu__scrim{
  position:absolute; inset:0; background:rgba(18,19,23,0.36);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
  opacity:0; transition:opacity var(--t) var(--ease);
}
.thr-root .mobile-menu__panel{
  position:relative; border-radius:var(--r-lg); padding:22px 20px 26px;
  transform:translateY(16px) scale(0.98); opacity:0;
  transition:transform var(--t) var(--ease), opacity var(--t) var(--ease);
}
.thr-root .mobile-menu.is-open{pointer-events:auto;}
.thr-root .mobile-menu.is-open .mobile-menu__scrim{opacity:1;}
.thr-root .mobile-menu.is-open .mobile-menu__panel{transform:none; opacity:1;}
.thr-root .mobile-menu__link{
  display:flex; align-items:center; justify-content:space-between;
  padding:15px 6px; font-size:1.28rem; font-weight:300; letter-spacing:-0.03em;
  border-bottom:1px solid rgba(21,22,26,0.07);
}
.thr-root .mobile-menu__link:last-of-type{border-bottom:0;}
.thr-root .mobile-menu__link .mono{font-size:0.66rem; color:var(--muted); letter-spacing:0.14em;}
.thr-root .mobile-menu__foot{margin-top:18px; display:grid; gap:10px;}
.thr-root .mobile-menu__foot .btn{justify-content:center;}

/* ==========================================================================
   Hero
   ========================================================================== */

.thr-root .hero{
  position:relative; min-height:100svh; min-height:100vh;
  display:flex; align-items:flex-end;
  padding-bottom:clamp(38px,6vw,74px);
  overflow:hidden;
  isolation:isolate;
}
.thr-root .hero__media{position:absolute; inset:-8% 0 -8%; z-index:-2; will-change:transform;}
.thr-root .hero__media picture, .thr-root .detail-hero__media picture{display:block; width:100%; height:100%;}
.thr-root .hero__media img, .thr-root .hero__media svg{width:100%; height:100%; object-fit:cover;}
.thr-root .hero__scrim{
  position:absolute; inset:0; z-index:-1; pointer-events:none;
  background:
    linear-gradient(to top, rgba(12,13,16,0.76) 0%, rgba(12,13,16,0.34) 36%, rgba(12,13,16,0.10) 62%, rgba(12,13,16,0.42) 100%),
    linear-gradient(102deg, rgba(12,13,16,0.62) 0%, rgba(12,13,16,0.28) 44%, transparent 72%);
}
.thr-root .hero__inner{
  position:relative; width:100%; max-width:var(--maxw); margin:0 auto;
  padding-inline:var(--gut);
  display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:end; gap:34px;
}
.thr-root .hero__card{
  max-width:min(720px,100%);
  border-radius:var(--r-xl);
  padding:clamp(28px,3.4vw,46px);
  background:rgba(14,16,20,0.34);
  border:1px solid rgba(255,255,255,0.20);
  -webkit-backdrop-filter:blur(26px) saturate(1.4);
  backdrop-filter:blur(26px) saturate(1.4);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.22), 0 40px 90px -50px rgba(0,0,0,0.9);
  color:var(--on-dark);
}
.thr-root .hero__card .eyebrow{color:var(--champagne-soft); display:block; margin-bottom:22px;}
.thr-root .hero h1{color:var(--on-dark); margin-bottom:22px; text-wrap:balance;}
.thr-root .hero__sub{
  color:rgba(var(--on-dark-rgb),0.88); font-weight:300;
  font-size:clamp(1rem,1.3vw,1.16rem); line-height:1.6; max-width:48ch;
  margin-bottom:32px;
}
.thr-root .hero__cta{display:flex; flex-wrap:wrap; gap:12px;}
.thr-root .hero__aside{
  display:flex; flex-direction:column; gap:10px; align-items:flex-end;
  padding-bottom:6px;
}
.thr-root .hero__chip{
  display:flex; align-items:center; gap:12px;
  padding:12px 18px; border-radius:999px;
  background:rgba(14,16,20,0.40);
  border:1px solid rgba(255,255,255,0.18);
  -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px);
  color:var(--on-dark); font-size:0.82rem;
}
.thr-root .hero__chip b{font-weight:500;}
.thr-root .hero__chip .mono{color:var(--champagne-soft); font-size:0.72rem; letter-spacing:0.1em;}

.thr-root .scroll-hint{
  position:absolute; left:50%; bottom:22px; transform:translateX(-50%);
  z-index:2; display:flex; flex-direction:column; align-items:center; gap:10px;
  color:rgba(var(--on-dark-rgb),0.78);
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem;
  letter-spacing:0.24em; text-transform:uppercase;
}
.thr-root .scroll-hint__rail{
  width:1px; height:52px; background:linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
  position:relative; overflow:hidden;
}
.thr-root .scroll-hint__rail::after{
  content:""; position:absolute; left:0; top:-40%; width:1px; height:40%;
  background:#fff; animation:railDrop 2.4s var(--ease) infinite;
}
@keyframes railDrop{0%{top:-40%;opacity:0;}25%{opacity:1;}100%{top:100%;opacity:0;}}

/* Trust strip under hero */

.thr-root .trust{
  display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1px;
  background:var(--line); border-radius:var(--r-md); overflow:hidden;
  border:1px solid var(--line);
}
.thr-root .trust__item{background:var(--paper); padding:26px 24px;}
.thr-root .trust__n{font-size:clamp(1.6rem,2.6vw,2.3rem); font-weight:300; letter-spacing:-0.04em; line-height:1;}
.thr-root .trust__n span{color:var(--champagne); font-size:0.6em;}
.thr-root .trust__l{margin-top:10px; font-size:0.78rem; color:var(--muted); letter-spacing:0.02em;}

/* ==========================================================================
   Property cards
   ========================================================================== */

.thr-root .grid-props{
  display:grid; gap:clamp(18px,2vw,30px);
  grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
  /* Equal rows, so a two-line note on one listing does not leave its
     neighbours short. The row still grows if the content genuinely needs it. */
  grid-auto-rows:1fr;
  align-items:stretch;
}

/* The featured grid is editorial — a wide lead card beside smaller ones —
   so it keeps content-sized rows. Equal rows belong to the uniform catalogue. */

.thr-root .grid-props--featured{grid-template-columns:repeat(6,1fr); grid-auto-rows:auto; align-items:start;}
.thr-root .grid-props--featured > .prop-card:nth-child(1){grid-column:span 4;}
.thr-root .grid-props--featured > .prop-card:nth-child(2){grid-column:span 2;}
.thr-root .grid-props--featured > .prop-card:nth-child(3){grid-column:span 2;}
.thr-root .grid-props--featured > .prop-card:nth-child(4){grid-column:span 2;}
.thr-root .grid-props--featured > .prop-card:nth-child(5){grid-column:span 2;}

.thr-root .prop-card{
  position:relative; display:flex; flex-direction:column; width:100%; text-align:left;
  border-radius:var(--r-lg); overflow:hidden;
  background:var(--paper);
  box-shadow:var(--sh-1);
  transition:transform var(--t) var(--ease), box-shadow var(--t) var(--ease);
  cursor:pointer;
}
.thr-root .prop-card:hover{transform:translateY(-5px); box-shadow:var(--sh-3);}
.thr-root .prop-card__media{
  position:relative; aspect-ratio:4/3; overflow:hidden; background:var(--mist);
}
.thr-root .grid-props--featured > .prop-card:nth-child(1) .prop-card__media{aspect-ratio:16/10;}
.thr-root .prop-card__media img{
  width:100%; height:100%; object-fit:cover;
  transition:transform 900ms var(--ease), filter var(--t) var(--ease);
}
.thr-root .prop-card:hover .prop-card__media img{transform:scale(1.055);}
.thr-root .prop-card__shade{
  position:absolute; inset:0;
  background:linear-gradient(to top, rgba(12,13,16,0.62), rgba(12,13,16,0.06) 46%, transparent 70%);
  opacity:0.9; transition:opacity var(--t) var(--ease);
}
.thr-root .prop-card__tags{
  position:absolute; top:16px; left:16px; right:16px;
  display:flex; gap:8px; flex-wrap:wrap; align-items:flex-start;
}
.thr-root .tag{
  display:inline-flex; align-items:center; gap:7px;
  padding:7px 13px; border-radius:999px;
  font-family:'IBM Plex Mono',monospace; font-size:0.62rem;
  letter-spacing:0.14em; text-transform:uppercase;
  background:rgba(255,255,255,0.20);
  border:1px solid rgba(255,255,255,0.30);
  -webkit-backdrop-filter:blur(14px) saturate(1.4);
  backdrop-filter:blur(14px) saturate(1.4);
  color:var(--on-dark); white-space:nowrap;
}
.thr-root .tag--solid{background:rgba(20,21,25,0.62); border-color:rgba(var(--on-dark-rgb),0.16);}
.thr-root .tag--accent{background:rgba(var(--champagne-rgb),0.86); border-color:rgba(var(--on-dark-rgb),0.30); color:var(--on-dark);}
.thr-root .tag--plan{margin-left:auto;}
.thr-root .tag__dot{width:6px; height:6px; border-radius:50%; background:#7ecb9a; flex:none;}
.thr-root .tag__dot--amber{background:#e2b25c;}
.thr-root .tag__dot--slate{background:#a9adb6;}

.thr-root .prop-card__over{
  position:absolute; left:16px; right:16px; bottom:16px;
  display:flex; align-items:flex-end; justify-content:space-between; gap:14px;
  color:var(--on-dark); pointer-events:none;
}
.thr-root .prop-card__loc{
  font-family:'IBM Plex Mono',monospace; font-size:0.66rem;
  letter-spacing:0.16em; text-transform:uppercase; color:rgba(var(--on-dark-rgb),0.78);
}
.thr-root .prop-card__title{
  font-size:clamp(1.24rem,1.7vw,1.6rem); font-weight:300;
  letter-spacing:-0.032em; margin-top:8px; line-height:1.1;
}
.thr-root .prop-card__view{
  flex:none; width:46px; height:46px; border-radius:999px;
  display:grid; place-items:center;
  background:rgba(255,255,255,0.16);
  border:1px solid rgba(255,255,255,0.3);
  -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
  opacity:0; transform:translate(6px,6px) scale(0.9);
  transition:opacity var(--t) var(--ease), transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .prop-card:hover .prop-card__view, .thr-root .prop-card:focus-visible .prop-card__view{opacity:1; transform:none;}
.thr-root .prop-card__view svg{width:16px; height:16px;}
.thr-root .prop-card__reveal{
  position:absolute; left:16px; right:16px; bottom:16px;
  padding:14px 18px; border-radius:var(--r-sm);
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  background:rgba(255,255,255,0.16);
  border:1px solid rgba(255,255,255,0.26);
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
  backdrop-filter:blur(20px) saturate(1.5);
  color:var(--on-dark); font-size:0.8rem;
  opacity:0; transform:translateY(10px);
  transition:opacity var(--t) var(--ease), transform var(--t) var(--ease);
  pointer-events:none;
}
.thr-root .prop-card:hover .prop-card__reveal, .thr-root .prop-card:focus-visible .prop-card__reveal{opacity:1; transform:none;}
.thr-root .prop-card:hover .prop-card__over, .thr-root .prop-card:focus-visible .prop-card__over{opacity:0; transform:translateY(-8px);}
.thr-root .prop-card__over{transition:opacity var(--t) var(--ease), transform var(--t) var(--ease);}
.thr-root .prop-card__reveal .mono{font-size:0.68rem; letter-spacing:0.12em; text-transform:uppercase;}

.thr-root .prop-card__media{flex:none;}
.thr-root .prop-card__body{
  flex:1; padding:20px 22px 22px;
  display:flex; align-items:flex-start; justify-content:space-between; gap:18px;
}
.thr-root .prop-card__price{font-size:clamp(1.1rem,1.4vw,1.32rem); font-weight:400; letter-spacing:-0.026em;}
.thr-root .prop-card__price small{display:block; font-size:0.68rem; color:var(--muted); font-weight:400; letter-spacing:0.06em; margin-top:5px;}
.thr-root .prop-card__specs{display:flex; gap:16px; flex-wrap:wrap; justify-content:flex-end;}
.thr-root .spec{text-align:right;}
.thr-root .spec__v{font-family:'IBM Plex Mono',monospace; font-size:0.9rem; letter-spacing:-0.01em;}
.thr-root .spec__l{font-size:0.66rem; color:var(--muted); margin-top:3px; letter-spacing:0.04em;}

/* ==========================================================================
   Filter bar
   ========================================================================== */

.thr-root .filters{
  position:sticky; top:calc(var(--nav-h) + 24px); z-index:60;
  border-radius:var(--r-lg); padding:16px;
  margin-bottom:clamp(26px,3vw,40px);
  /* Liquid glass: a tinted pane, a heavier blur than the flat glass helper
     uses, and two fixed gradient layers that read as a specular sheen across
     the top-left. Only background-COLOR transitions, so the sheen holds
     steady while the pane deepens as it sticks. */
  background-color:rgba(var(--glass-rgb),calc(0.46 * var(--glass-a)));
  background-image:
    linear-gradient(166deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.06) 44%, rgba(255,255,255,0) 62%),
    radial-gradient(130% 105% at 8% -30%, rgba(255,255,255,0.5), transparent 62%);
  -webkit-backdrop-filter:blur(30px) saturate(1.9);
  backdrop-filter:blur(30px) saturate(1.9);
  border:1px solid rgba(255,255,255,0.6);
  border-top-color:rgba(var(--on-dark-rgb),0.85);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -1px 0 rgba(255,255,255,0.32),
    0 1px 2px rgba(21,22,26,0.04),
    0 22px 52px -30px rgba(21,22,26,0.44);
  transition:padding var(--t-collapse) var(--ease-soft),
             background-color var(--t-collapse) var(--ease-soft),
             box-shadow var(--t-collapse) var(--ease-soft),
             border-radius var(--t-collapse) var(--ease-soft),
             border-color var(--t-collapse) var(--ease-soft);
}

/* The lower half of the panel collapses by animating grid-template-rows from
   1fr to 0fr — height:auto cannot be interpolated, display:none even less so,
   and this is the one trick that shrinks real content smoothly. */

.thr-root .filters__more{
  display:grid;
  grid-template-rows:1fr;
  transition:grid-template-rows var(--t-collapse) var(--ease-soft);
}
.thr-root .filters__more-inner{
  overflow:hidden; min-height:0;
  transition:opacity calc(var(--t-collapse) * 0.55) var(--ease-soft) calc(var(--t-collapse) * 0.3);
}
.thr-root .filters__more-inner > .filters__row--adv{
  margin-top:14px; padding-top:14px; border-top:1px solid rgba(21,22,26,0.07);
}

/* the compact summary is always in the flow, just folded to nothing */

.thr-root .filters__compact{
  display:inline-flex; align-items:center; gap:9px; flex:none; margin-left:auto;
  max-width:0; opacity:0; padding:9px 0; border:1px solid transparent;
  overflow:hidden; white-space:nowrap; pointer-events:none;
  border-radius:999px; font-size:0.82rem; background:rgba(var(--glass-rgb),calc(0.6 * var(--glass-a)));
  transition:max-width var(--t-collapse) var(--ease-soft),
             opacity calc(var(--t-collapse) * 0.5) var(--ease-soft),
             padding var(--t-collapse) var(--ease-soft),
             border-color var(--t-fast) var(--ease-soft),
             background var(--t-fast) var(--ease-soft);
}

/* Sticky only exists on wider screens, so the collapsed state does too. */
@media (min-width:961px){
  /* Once it sticks it stops being a translucent panel floating over the cards:
     it turns opaque, folds down to a single row, and keeps the rest one click
     away. */


  .thr-root .filters.is-stuck{
    padding:10px 14px;
    border-radius:999px;
    /* Still glass once it sticks — just a deeper pane, so the cards sliding
       underneath stay a suggestion rather than a distraction. */
    background-color:rgba(var(--glass-rgb),calc(0.72 * var(--glass-a)));
    border-color:rgba(var(--on-dark-rgb),0.78);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.95),
      inset 0 -1px 0 rgba(255,255,255,0.4),
      0 2px 8px rgba(21,22,26,0.06),
      0 20px 44px -26px rgba(21,22,26,0.5);
  }
  .thr-root .filters.is-stuck .filters__more{grid-template-rows:0fr;}
  .thr-root .filters.is-stuck .filters__more-inner{
    opacity:0;
    transition:opacity calc(var(--t-collapse) * 0.4) var(--ease-soft) 0ms;
  }
  .thr-root .filters.is-stuck .filters__compact{
    max-width:320px; opacity:1; padding:9px 16px;
    border-color:var(--line); pointer-events:auto;
  }
  .thr-root .filters.is-stuck.is-open{padding:16px; border-radius:var(--r-lg);}
  .thr-root .filters.is-stuck.is-open{background-color:rgba(var(--glass-rgb),calc(0.66 * var(--glass-a)));}
  .thr-root .filters.is-stuck.is-open .filters__more{grid-template-rows:1fr;}
  .thr-root .filters.is-stuck.is-open .filters__more-inner{opacity:1;}
}

/* Below that width the bar never sticks, so the compact pill never opens. It
   was still in the flow though — 40 px tall, 2 px wide, and margin-left:auto
   pushing it onto a line of its own, which is the empty band that showed
   under the type chips on a phone. */
@media (max-width:960px){
  .thr-root .filters__compact{display:none;}
}
.thr-root .filters__compact:hover{border-color:var(--ink);}
.thr-root .filters__compact b{font-weight:500;}
.thr-root .filters__compact svg{width:13px; height:13px; flex:none; transition:transform var(--t-collapse) var(--ease);}
.thr-root .filters.is-open .filters__compact svg{transform:rotate(180deg);}

/* the sticky sentinel: zero-height marker just above the bar */

.thr-root .filters-sentinel{height:1px; margin:0;}
.thr-root .filters__row{display:flex; flex-wrap:wrap; gap:12px; align-items:center;}
/* Only where the bar actually sticks: the always-visible row stays on one
   line, because a re-wrap mid-collapse makes the panel's height jump instead
   of glide. On phones the bar never sticks, so it wraps as before. */
@media (min-width:961px){
  .thr-root .filters__row--top{flex-wrap:nowrap; min-height:47px;}
  .thr-root .filters__row--top .chips{flex-wrap:nowrap; overflow:hidden;}
}
.thr-root .filters__row + .filters__row{margin-top:14px; padding-top:14px; border-top:1px solid rgba(21,22,26,0.07);}
.thr-root .filters__more .filters__row + .filters__row{margin-top:0; padding-top:0; border-top:0;}
.thr-root .seg{
  display:inline-flex; padding:4px; border-radius:999px; gap:2px;
  background:rgba(21,22,26,0.05); flex:none;
}
.thr-root .seg__btn{
  padding:9px 18px; border-radius:999px; font-size:0.84rem; color:var(--slate);
  transition:background var(--t) var(--ease), color var(--t-fast) var(--ease-soft), box-shadow var(--t) var(--ease);
}
.thr-root .seg__btn.is-active{background:var(--paper); color:var(--ink); box-shadow:var(--sh-1);}
.thr-root .chips{display:flex; flex-wrap:wrap; gap:7px;}
.thr-root .chip{
  padding:8px 15px; border-radius:999px; font-size:0.8rem; color:var(--slate);
  border:1px solid var(--line); background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a)));
  transition:border-color var(--t-fast) var(--ease-soft), color var(--t-fast) var(--ease-soft),
             background var(--t-fast) var(--ease-soft), transform var(--t) var(--ease);
}
.thr-root .chip:hover{border-color:var(--muted); color:var(--ink);}
.thr-root .chip.is-active{background:var(--ink); border-color:var(--ink); color:var(--bone);}
.thr-root .chip .mono{font-size:0.68rem; opacity:0.6; margin-left:6px;}
.thr-root .f-label{
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem;
  letter-spacing:0.2em; text-transform:uppercase; color:var(--muted);
  margin-right:2px; flex:none;
}
.thr-root .f-group{display:flex; align-items:center; gap:10px; flex-wrap:wrap;}
.thr-root .f-sep{width:1px; align-self:stretch; background:rgba(21,22,26,0.08); margin-inline:4px;}
.thr-root .f-select{
  appearance:none; -webkit-appearance:none;
  padding:9px 34px 9px 15px; border-radius:999px;
  border:1px solid var(--line); background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a)));
  font-size:0.8rem; color:var(--ink); cursor:pointer;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b8e96' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>");
  background-repeat:no-repeat; background-position:right 12px center; background-size:13px;
  transition:border-color var(--t-fast) var(--ease-soft);
}
.thr-root .f-select:hover{border-color:var(--muted);}

/* Dual range slider */

.thr-root .range{position:relative; width:min(280px,60vw); height:34px; display:flex; align-items:center; flex:none;}
.thr-root .range{overflow:hidden;}
.thr-root .range__track{position:absolute; left:0; right:0; height:3px; border-radius:3px; background:rgba(21,22,26,0.12);}
.thr-root .range__fill{position:absolute; height:3px; max-width:100%; border-radius:3px; background:var(--ink);}
.thr-root .range input[type=range]{
  position:absolute; left:0; width:100%; margin:0; pointer-events:none;
  appearance:none; -webkit-appearance:none; background:none; height:34px;
}
.thr-root .range input[type=range]::-webkit-slider-thumb{
  pointer-events:auto; appearance:none; -webkit-appearance:none;
  width:18px; height:18px; border-radius:50%;
  background:var(--paper); border:1px solid var(--line);
  box-shadow:var(--sh-1); cursor:grab;
  transition:transform var(--t) var(--ease), box-shadow var(--t) var(--ease);
}
.thr-root .range input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.14); box-shadow:var(--sh-2);}
.thr-root .range input[type=range]::-moz-range-thumb{
  pointer-events:auto; width:18px; height:18px; border-radius:50%;
  background:var(--paper); border:1px solid var(--line); box-shadow:var(--sh-1); cursor:grab;
}
.thr-root .range__val{
  font-family:'IBM Plex Mono',monospace; font-size:0.74rem; white-space:nowrap;
  color:var(--ink);
}
.thr-root .filters__foot{
  display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
  margin-top:14px; padding-top:14px; border-top:1px solid rgba(21,22,26,0.07);
}
.thr-root .filters__count{font-size:0.82rem; color:var(--slate);}
.thr-root .filters__count b{font-weight:500; color:var(--ink);}
.thr-root .link-quiet{
  font-size:0.8rem; color:var(--muted); border-bottom:1px solid transparent; padding-bottom:1px;
  transition:color var(--t-fast) var(--ease-soft), border-color var(--t-fast) var(--ease-soft);
}
.thr-root .link-quiet:hover{color:var(--ink); border-color:var(--ink);}
.thr-root .empty-state{
  padding:64px 24px; text-align:center; border-radius:var(--r-lg);
  border:1px dashed var(--line); color:var(--muted);
}

/* ==========================================================================
   Agent
   ========================================================================== */

.thr-root .agent{display:grid; grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr); gap:clamp(28px,5vw,72px); align-items:center;}
.thr-root .agent__media{
  position:relative; border-radius:var(--r-xl); overflow:hidden;
  aspect-ratio:4/5; background:var(--mist); box-shadow:var(--sh-2);
}
.thr-root .agent__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .agent__media::after{content:""; position:absolute; inset:auto 0 0; height:46%; background:linear-gradient(to top, rgba(14,15,18,0.62), transparent); pointer-events:none;}
.thr-root .agent__badge{
  position:absolute; left:18px; right:18px; bottom:18px;
  border-radius:var(--r-md); padding:16px 18px;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  background:rgba(255,255,255,0.18);
  border:1px solid rgba(255,255,255,0.28);
  -webkit-backdrop-filter:blur(22px) saturate(1.5);
  backdrop-filter:blur(22px) saturate(1.5);
  color:var(--on-dark);
}
.thr-root .agent__badge .mono{font-size:0.66rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(var(--on-dark-rgb),0.72);}
.thr-root .agent__quote{
  font-size:clamp(1.5rem,2.9vw,2.5rem); font-weight:300; letter-spacing:-0.034em;
  line-height:1.16; margin-bottom:26px; text-wrap:balance;
}
.thr-root .agent__quote em{font-style:normal; color:var(--champagne);}
.thr-root .agent__stats{display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin:30px 0;}
.thr-root .agent__stat{padding:18px 0; border-top:1px solid var(--line);}
.thr-root .agent__stat b{display:block; font-size:clamp(1.5rem,2.4vw,2.1rem); font-weight:300; letter-spacing:-0.04em; line-height:1;}
.thr-root .agent__stat > span{display:block; margin-top:8px; font-size:0.76rem; color:var(--muted);}
.thr-root .agent__contact{display:flex; flex-wrap:wrap; gap:10px; align-items:center;}
.thr-root .contact-pill{
  display:inline-flex; align-items:center; gap:10px;
  padding:11px 18px; border-radius:999px;
  border:1px solid var(--line); background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a)));
  font-size:0.85rem;
  transition:border-color var(--t-fast) var(--ease-soft), transform var(--t) var(--ease);
}
.thr-root .contact-pill:hover{border-color:var(--ink); transform:translateY(-2px);}
.thr-root .contact-pill svg{width:15px; height:15px; color:var(--champagne); flex:none;}
.thr-root .stars{display:inline-flex; gap:3px; color:var(--champagne);}
.thr-root .stars svg{width:14px; height:14px;}

/* ==========================================================================
   Testimonials
   ========================================================================== */

.thr-root .tsm{position:relative;}
.thr-root .tsm__rail{
  display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory;
  padding:6px 6px 22px; margin:-6px -6px 0;
  scrollbar-width:none; -ms-overflow-style:none;
  cursor:grab;
}
.thr-root .tsm__rail::-webkit-scrollbar{display:none;}
.thr-root .tsm__rail.is-dragging{cursor:grabbing; scroll-snap-type:none;}
.thr-root .tsm__card{
  flex:0 0 min(460px,84vw); scroll-snap-align:start;
  border-radius:var(--r-lg); padding:clamp(26px,3vw,38px);
  display:flex; flex-direction:column; gap:20px;
}
.thr-root .tsm__quote{margin:0; font-size:clamp(1.06rem,1.5vw,1.28rem); font-weight:300; line-height:1.5; letter-spacing:-0.022em;}
.thr-root .tsm__mark{width:26px; height:26px; color:var(--champagne); opacity:0.8;}
.thr-root .tsm__foot{margin-top:auto; display:flex; align-items:center; justify-content:space-between; gap:14px;}
.thr-root .tsm__who b{display:block; font-weight:500; font-size:0.92rem;}
.thr-root .tsm__who span{display:block; font-size:0.74rem; color:var(--muted); margin-top:3px;}
.thr-root .tsm__nav{display:flex; gap:8px;}
.thr-root .round-btn{
  width:46px; height:46px; border-radius:999px; display:grid; place-items:center;
  border:1px solid var(--line); background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a)));
  transition:background var(--t) var(--ease), border-color var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .round-btn:hover{background:var(--paper); border-color:var(--ink); transform:translateY(-2px);}
.thr-root .round-btn svg{width:16px; height:16px;}
.thr-root .round-btn[disabled]{opacity:0.35; pointer-events:none;}

/* ==========================================================================
   Dark CTA + footer
   ========================================================================== */

.thr-root .dark-sec{
  position:relative; background:var(--night); color:var(--on-dark); overflow:hidden;
  border-radius:var(--r-xl);
}
.thr-root .dark-sec::before{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(700px 420px at 82% 6%, rgba(var(--champagne-rgb),0.20), transparent 60%),
    radial-gradient(620px 400px at 8% 92%, rgba(120,140,170,0.16), transparent 62%);
}
.thr-root .cta{position:relative; padding:clamp(52px,8vw,110px) clamp(24px,5vw,80px); text-align:center;}
.thr-root .cta h2{color:var(--on-dark); margin-bottom:22px; text-wrap:balance;}
.thr-root .cta p{color:rgba(var(--on-dark-rgb),0.66); font-weight:300; max-width:52ch; margin:0 auto 34px; font-size:clamp(1rem,1.2vw,1.1rem);}
.thr-root .cta__btns{display:flex; gap:12px; justify-content:center; flex-wrap:wrap;}
.thr-root .cta__cards{
  display:grid; grid-template-columns:repeat(3,1fr); gap:14px;
  margin-top:clamp(38px,5vw,62px); text-align:left;
}
.thr-root .cta__card{border-radius:var(--r-md); padding:22px;}
.thr-root .cta__card .mono{font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--champagne-soft);}
.thr-root .cta__card b{display:block; margin:12px 0 8px; font-weight:400; font-size:1.02rem; letter-spacing:-0.02em;}
.thr-root .cta__card span{font-size:0.84rem; color:rgba(var(--on-dark-rgb),0.58); line-height:1.55;}

.thr-root .site-footer{padding:clamp(48px,6vw,80px) 0 34px;}
.thr-root .footer__top{display:grid; grid-template-columns:1.4fr repeat(3,1fr); gap:34px; padding-bottom:44px;}
.thr-root .footer__brand .brand__name{font-size:1.2rem;}
.thr-root .footer__blurb{margin-top:18px; color:var(--slate); font-size:0.9rem; font-weight:300; max-width:34ch;}
.thr-root .footer__col h4{font-family:'IBM Plex Mono',monospace; font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:16px; font-weight:400;}
.thr-root .footer__col a, .thr-root .footer__col p{display:block; font-size:0.88rem; color:var(--slate); padding:6px 0; transition:color var(--t-fast) var(--ease-soft);}
.thr-root .footer__col a:hover{color:var(--ink);}
.thr-root .footer__bot{
  display:flex; justify-content:space-between; gap:18px; flex-wrap:wrap;
  padding-top:26px; border-top:1px solid var(--line);
  font-size:0.76rem; color:var(--muted);
}

/* ==========================================================================
   Location map
   ========================================================================== */

.thr-root .map-wrap{
  position:relative; border-radius:var(--r-lg); overflow:hidden;
  background:linear-gradient(160deg,#f2f1ec,#e8e6df);
  border:1px solid var(--line); box-shadow:var(--sh-1);
  aspect-ratio:16/10;
}
.thr-root .map-wrap svg{width:100%; height:100%;}
.thr-root .map-pin{cursor:pointer;}
.thr-root .map-pin circle.hit{fill:transparent;}
.thr-root .map-pin__dot{transition:r 300ms var(--ease), fill 300ms var(--ease);}
.thr-root .map-pin__ring{opacity:0; transition:opacity 300ms var(--ease), r 300ms var(--ease);}
.thr-root .map-pin:hover .map-pin__ring, .thr-root .map-pin:focus-visible .map-pin__ring, .thr-root .map-pin.is-active .map-pin__ring{opacity:1;}
.thr-root .map-legend{
  position:absolute; left:14px; bottom:14px; right:14px;
  display:flex; gap:8px; flex-wrap:wrap;
}

/* Floor-by-floor areas, under the fact table. Two lines per floor: name and
   area on the first, what is on it and its outside measurements on the
   second, so a long note never squeezes the number it belongs to. */

.thr-root .floors{margin-top:clamp(24px,3vw,34px);}
.thr-root .floors .eyebrow{display:block; margin-bottom:12px;}
.thr-root .floors__row{
  display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 16px;
  align-items:baseline; padding:13px 0; border-bottom:1px solid rgba(21,22,26,0.07);
}
.thr-root .floors__row:first-child{border-top:1px solid rgba(21,22,26,0.07);}
.thr-root .floors__name{font-size:0.96rem; letter-spacing:-0.018em;}
.thr-root .floors__area{
  font-family:'IBM Plex Mono',monospace; font-size:0.84rem; text-align:right; white-space:nowrap;
}
.thr-root .floors__note{font-size:0.78rem; color:var(--muted); line-height:1.5;}
.thr-root .floors__dim{
  font-family:'IBM Plex Mono',monospace; font-size:0.72rem; color:var(--muted);
  text-align:right; white-space:nowrap;
}

/* Video: a tour on a property page, and the film behind the hero */

.thr-root .video-frame{
  position:relative; aspect-ratio:16/9; border-radius:var(--r-lg); overflow:hidden;
  background:var(--mist);
}
.thr-root .video-frame iframe, .thr-root .video-frame video{
  position:absolute; inset:0; width:100%; height:100%; border:0; display:block;
  object-fit:cover; background:#000;
}
.thr-root .video-frame--link{display:grid; place-items:center; aspect-ratio:21/9;}
.thr-root .hero__video{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:block;
}

.thr-root .map-chip{
  /* a chip is a <button> when it only highlights its pin and an <a> when it
     opens Google Maps; both have to look the same */
  display:inline-flex; align-items:center; gap:8px; text-align:left;
  padding:8px 13px; border-radius:999px; font-size:0.74rem;
  background:rgba(var(--glass-rgb),calc(0.62 * var(--glass-a)));
  border:1px solid rgba(255,255,255,0.8);
  -webkit-backdrop-filter:blur(16px) saturate(1.5);
  backdrop-filter:blur(16px) saturate(1.5);
  box-shadow:var(--sh-1);
  transition:transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .map-chip:hover, .thr-root .map-chip.is-active{transform:translateY(-2px); background:rgba(var(--glass-rgb),calc(0.9 * var(--glass-a)));}
.thr-root .map-chip .mono{color:var(--muted); font-size:0.68rem;}
.thr-root .map-chip__dot{width:7px; height:7px; border-radius:50%; background:var(--champagne); flex:none;}
.thr-root .map-card{
  position:absolute; top:14px; left:14px;
  border-radius:var(--r-md); padding:16px 18px; max-width:260px;
}
.thr-root .map-card .mono{font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--champagne);}
.thr-root .map-card b{display:block; margin:8px 0 6px; font-weight:400; font-size:1.05rem; letter-spacing:-0.02em;}
.thr-root .map-card span{font-size:0.82rem; color:var(--slate);}

/* ==========================================================================
   Views / page transition
   ========================================================================== */

.thr-root .view{
  transition:opacity 340ms var(--ease), transform 340ms var(--ease), filter 340ms var(--ease);
}
.thr-root .view[hidden]{display:none !important;}
.thr-root .view.is-leaving{opacity:0; transform:translateY(-10px) scale(0.994); filter:blur(2px);}
.thr-root .view.is-entering{opacity:0; transform:translateY(14px);}

/* ==========================================================================
   Property detail
   ========================================================================== */

.thr-root .detail-hero{
  position:relative; min-height:min(76svh,760px);
  display:flex; align-items:flex-end; overflow:hidden;
  padding-bottom:clamp(28px,4vw,54px);
  isolation:isolate;
}
.thr-root .detail-hero__media{position:absolute; inset:-6% 0; z-index:-2; will-change:transform;}
.thr-root .detail-hero__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .detail-hero__scrim{
  position:absolute; inset:0; z-index:-1;
  background:linear-gradient(to top, rgba(12,13,16,0.80) 0%, rgba(12,13,16,0.30) 40%, rgba(12,13,16,0.10) 66%, rgba(12,13,16,0.34) 100%);
}
.thr-root .detail-hero__inner{
  width:100%; max-width:var(--maxw); margin:0 auto; padding-inline:var(--gut);
  display:flex; align-items:flex-end; justify-content:space-between; gap:28px; flex-wrap:wrap;
  color:var(--on-dark);
}
.thr-root .detail-hero h1{font-size:clamp(2.1rem,4.6vw,4.1rem); color:var(--on-dark); margin:16px 0 14px; text-wrap:balance;}
.thr-root .detail-hero__loc{display:flex; align-items:center; gap:10px; color:rgba(var(--on-dark-rgb),0.8); font-size:0.92rem;}
.thr-root .detail-hero__loc svg{width:15px; height:15px; color:var(--champagne-soft);}
.thr-root .detail-hero__tags{display:flex; gap:8px; flex-wrap:wrap;}
.thr-root .detail-hero__side{display:flex; flex-direction:column; gap:10px; align-items:flex-end;}
.thr-root .back-btn{
  position:absolute; top:calc(var(--nav-h) + 34px); left:var(--gut); z-index:5;
  display:inline-flex; align-items:center; gap:9px;
  padding:11px 18px; border-radius:999px; font-size:0.82rem; color:var(--on-dark);
  background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22);
  -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
  transition:background var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .back-btn:hover{background:rgba(255,255,255,0.22); transform:translateX(-3px);}
.thr-root .back-btn svg{width:15px; height:15px;}

/* Sticky summary */

.thr-root .summary{
  position:sticky; top:calc(var(--nav-h) + 22px); z-index:70;
  margin-top:-38px; border-radius:var(--r-lg);
  display:grid; grid-template-columns:repeat(5,minmax(0,1fr));
  overflow:hidden;
}
.thr-root .summary__cell{
  padding:20px 22px; text-align:center;
  border-right:1px solid rgba(21,22,26,0.07);
}
.thr-root .summary__cell:last-child{border-right:0;}
.thr-root .summary__cell b{
  display:block; font-family:'IBM Plex Mono',monospace;
  font-size:clamp(0.95rem,1.5vw,1.22rem); font-weight:500; letter-spacing:-0.02em; white-space:nowrap;
}
.thr-root .summary__cell span{display:block; margin-top:7px; font-size:0.7rem; color:var(--muted); letter-spacing:0.05em;}
.thr-root .summary__cell--accent b{color:var(--champagne);}

.thr-root .detail-grid{display:grid; grid-template-columns:minmax(0,1.55fr) minmax(0,1fr); gap:clamp(28px,4vw,64px); align-items:start;}
.thr-root .desc p + p{margin-top:16px;}
.thr-root .desc p{color:var(--slate); font-weight:300; font-size:1.02rem; line-height:1.68;}
.thr-root .dl{display:grid; grid-template-columns:repeat(2,1fr); gap:0; margin-top:30px;}
.thr-root .dl__row{padding:14px 0; border-top:1px solid var(--line); display:flex; justify-content:space-between; gap:14px; align-items:baseline;}
.thr-root .dl__row:nth-child(odd){padding-right:22px;}
.thr-root .dl__row:nth-child(even){padding-left:22px;}
.thr-root .dl__k{font-size:0.82rem; color:var(--muted);}
.thr-root .dl__v{font-family:'IBM Plex Mono',monospace; font-size:0.85rem; text-align:right;}
.thr-root .energy{
  display:inline-flex; align-items:center; justify-content:center;
  min-width:24px; padding:3px 8px; border-radius:6px; color:var(--on-dark);
  font-family:'IBM Plex Mono',monospace; font-size:0.76rem;
}

.thr-root .side-card{border-radius:var(--r-lg); padding:26px; position:sticky; top:calc(var(--nav-h) + 130px);}
.thr-root .side-card__agent{display:flex; align-items:center; gap:14px; padding-bottom:18px; border-bottom:1px solid rgba(21,22,26,0.08);}
.thr-root .side-card__avatar{width:54px; height:54px; border-radius:50%; overflow:hidden; flex:none; background:var(--mist);}
.thr-root .side-card__avatar img{width:100%; height:100%; object-fit:cover;}
.thr-root .side-card__agent b{display:block; font-weight:500; font-size:0.98rem;}
.thr-root .side-card__agent span{display:block; font-size:0.76rem; color:var(--muted); margin-top:3px;}
.thr-root .side-card__price{padding:20px 0; border-bottom:1px solid rgba(21,22,26,0.08);}
.thr-root .side-card__price b{display:block; font-size:clamp(1.4rem,2.2vw,1.9rem); font-weight:300; letter-spacing:-0.038em;}
.thr-root .side-card__price span{display:block; font-size:0.76rem; color:var(--muted); margin-top:6px;}
.thr-root .side-card__btns{display:grid; gap:9px; margin-top:20px;}
.thr-root .side-card__btns .btn{justify-content:center;}
.thr-root .side-card__note{margin-top:16px; font-size:0.74rem; color:var(--muted); text-align:center; line-height:1.5;}

/* Features */

.thr-root .features{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:10px;}
.thr-root .feature{
  display:flex; align-items:center; gap:11px; padding:14px 16px;
  border-radius:var(--r-sm); background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a)));
  border:1px solid var(--line); font-size:0.86rem;
  transition:border-color var(--t) var(--ease), transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .feature:hover{border-color:rgba(var(--champagne-rgb),0.5); transform:translateY(-2px); background:var(--paper);}
.thr-root .feature svg{width:16px; height:16px; color:var(--champagne); flex:none;}

/* ==========================================================================
   Gallery + lightbox
   ========================================================================== */

.thr-root .gallery{display:grid; grid-template-columns:repeat(6,1fr); gap:clamp(8px,1vw,14px);}
.thr-root .gal{
  position:relative; overflow:hidden; border-radius:var(--r-md);
  background:var(--mist); cursor:zoom-in; grid-column:span 2; aspect-ratio:4/3;
}
.thr-root .gal:nth-child(1){grid-column:span 4; aspect-ratio:16/10;}
.thr-root .gal:nth-child(2){grid-column:span 2; aspect-ratio:4/5;}
.thr-root .gal:nth-child(6){grid-column:span 3; aspect-ratio:16/9;}
.thr-root .gal:nth-child(7){grid-column:span 3; aspect-ratio:16/9;}
.thr-root .gal img{width:100%; height:100%; object-fit:cover; transition:transform 900ms var(--ease);}
.thr-root .gal:hover img{transform:scale(1.05);}
.thr-root .gal__cap{
  position:absolute; left:12px; bottom:12px;
  padding:7px 13px; border-radius:999px;
  background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.26);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  color:var(--on-dark); font-size:0.72rem;
  opacity:0; transform:translateY(6px);
  transition:opacity var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .gal:hover .gal__cap, .thr-root .gal:focus-visible .gal__cap{opacity:1; transform:none;}

.thr-root .lightbox{
  position:fixed; inset:0; z-index:300; display:flex; flex-direction:column;
  background:rgba(10,11,14,0.86);
  -webkit-backdrop-filter:blur(22px); backdrop-filter:blur(22px);
  opacity:0; pointer-events:none;
  transition:opacity 300ms var(--ease);
}
.thr-root .lightbox.is-open{opacity:1; pointer-events:auto;}
.thr-root .lightbox__bar{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:18px clamp(14px,3vw,28px); color:rgba(var(--on-dark-rgb),0.8);
}
.thr-root .lightbox__counter{font-family:'IBM Plex Mono',monospace; font-size:0.78rem; letter-spacing:0.1em;}
.thr-root .lightbox__stage{
  flex:1; position:relative; display:flex; align-items:center; justify-content:center;
  padding:0 clamp(14px,4vw,68px); min-height:0;
}
.thr-root .lightbox__img{
  max-width:100%; max-height:100%; object-fit:contain;
  border-radius:var(--r-md); box-shadow:0 50px 120px -40px rgba(0,0,0,0.9);
  transition:opacity 240ms var(--ease), transform 240ms var(--ease);
}
.thr-root .lightbox__arrow{
  position:absolute; top:50%; transform:translateY(-50%);
  width:52px; height:52px; border-radius:999px; display:grid; place-items:center;
  background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.18);
  -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
  color:var(--on-dark); transition:background var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .lightbox__arrow:hover{background:rgba(255,255,255,0.22);}
.thr-root .lightbox__arrow--prev{left:clamp(8px,2vw,22px);}
.thr-root .lightbox__arrow--next{right:clamp(8px,2vw,22px);}
.thr-root .lightbox__arrow svg{width:18px; height:18px;}
.thr-root .lightbox__thumbs{
  display:flex; gap:9px; overflow-x:auto; padding:18px clamp(14px,3vw,28px) 24px;
  scrollbar-width:none;
}
.thr-root .lightbox__thumbs::-webkit-scrollbar{display:none;}
.thr-root .lightbox__thumb{
  flex:none; width:88px; aspect-ratio:4/3; border-radius:10px; overflow:hidden;
  opacity:0.42; border:1px solid transparent;
  transition:opacity var(--t) var(--ease), border-color var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .lightbox__thumb.is-active{opacity:1; border-color:var(--champagne-soft); transform:translateY(-3px);}
.thr-root .lightbox__thumb img{width:100%; height:100%; object-fit:cover;}
.thr-root .icon-btn{
  width:44px; height:44px; border-radius:999px; display:grid; place-items:center;
  background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.18);
  color:var(--on-dark); transition:background var(--t) var(--ease);
}
.thr-root .icon-btn:hover{background:rgba(255,255,255,0.2);}
.thr-root .icon-btn svg{width:16px; height:16px;}

/* ==========================================================================
   Room explorer — cards
   ========================================================================== */

.thr-root .rooms-grid{
  display:grid; gap:clamp(12px,1.4vw,18px);
  grid-template-columns:repeat(auto-fill,minmax(230px,1fr));
}
.thr-root .room-card{
  position:relative; text-align:left; width:100%;
  border-radius:var(--r-md); overflow:hidden; cursor:pointer;
  background:var(--glass);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(1.7);
  backdrop-filter:blur(var(--blur)) saturate(1.7);
  border:1px solid var(--glass-border);
  box-shadow:inset 0 1px 0 var(--glass-edge), var(--sh-1);
  transition:transform var(--t) var(--ease), box-shadow var(--t) var(--ease),
             border-color var(--t) var(--ease), background var(--t) var(--ease);
  will-change:transform;
}
.thr-root .room-card:hover, .thr-root .room-card.is-active{
  transform:scale(1.02);
  background:var(--glass-strong);
  border-color:rgba(var(--champagne-rgb),0.62);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), var(--sh-glow);
  z-index:2;
}
.thr-root .room-card__head{display:flex; align-items:baseline; justify-content:space-between; gap:10px; padding:16px 18px 12px;}
.thr-root .room-card__no{
  font-family:'IBM Plex Mono',monospace; font-size:0.7rem; letter-spacing:0.16em;
  color:var(--champagne);
}
.thr-root .room-card__area{font-family:'IBM Plex Mono',monospace; font-size:0.78rem; color:var(--slate);}
.thr-root .room-card__name{
  display:block;
  padding:0 18px 14px; font-size:1.06rem; font-weight:400; letter-spacing:-0.026em;
  line-height:1.2;
}
.thr-root .room-card__media{display:block; position:relative; aspect-ratio:16/10; overflow:hidden; background:var(--mist);}
.thr-root .room-card__media img{width:100%; height:100%; object-fit:cover; transition:transform 800ms var(--ease);}
.thr-root .room-card:hover .room-card__media img, .thr-root .room-card.is-active .room-card__media img{transform:scale(1.06);}
.thr-root .room-card__meta{
  position:absolute; left:10px; right:10px; bottom:10px;
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  opacity:0; transform:translateY(8px);
  transition:opacity var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .room-card:hover .room-card__meta, .thr-root .room-card.is-active .room-card__meta{opacity:1; transform:none;}
.thr-root .room-card__pill{
  padding:6px 11px; border-radius:999px; font-family:'IBM Plex Mono',monospace;
  font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--on-dark);
  background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.26);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
}

/* Floating room popover */

.thr-root .popover{
  position:fixed; z-index:250; width:308px; pointer-events:none;
  border-radius:var(--r-md); overflow:hidden;
  background:rgba(var(--glass-rgb),calc(0.62 * var(--glass-a)));
  -webkit-backdrop-filter:blur(30px) saturate(1.8);
  backdrop-filter:blur(30px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.75);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), 0 34px 80px -34px rgba(21,22,26,0.55);
  opacity:0; transform:translateY(8px) scale(0.985);
  transition:opacity 240ms var(--ease), transform 240ms var(--ease);
}
.thr-root .popover.is-open{opacity:1; transform:none;}
.thr-root .popover__media{position:relative; aspect-ratio:16/9; background:var(--mist);}
.thr-root .popover__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .popover__no{
  position:absolute; top:10px; left:10px;
  padding:5px 10px; border-radius:8px;
  background:rgba(20,21,25,0.62); color:var(--on-dark);
  font-family:'IBM Plex Mono',monospace; font-size:0.62rem; letter-spacing:0.14em;
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
}
.thr-root .popover__body{padding:16px 18px 18px;}
.thr-root .popover__title{display:flex; align-items:baseline; justify-content:space-between; gap:12px;}
.thr-root .popover__title h4{
  font-size:0.72rem; font-weight:500; letter-spacing:0.16em; text-transform:uppercase;
  font-family:'IBM Plex Mono',monospace;
}
.thr-root .popover__area{font-size:1.32rem; font-weight:300; letter-spacing:-0.036em; margin:8px 0 2px;}
.thr-root .popover__dims{font-family:'IBM Plex Mono',monospace; font-size:0.76rem; color:var(--slate);}
.thr-root .popover__specs{
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px 14px;
  margin-top:14px; padding-top:14px; border-top:1px solid rgba(21,22,26,0.09);
}
.thr-root .popover__spec{display:flex; align-items:center; gap:8px; font-size:0.76rem; color:var(--slate); min-width:0;}
.thr-root .popover__spec svg{width:13px; height:13px; color:var(--champagne); flex:none;}
.thr-root .popover__spec span{overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.thr-root .popover__desc{
  margin-top:14px; font-size:0.8rem; line-height:1.5; color:var(--slate); font-weight:300;
}
.thr-root .popover__foot{
  margin-top:14px; padding-top:12px; border-top:1px solid rgba(21,22,26,0.09);
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  font-family:'IBM Plex Mono',monospace; font-size:0.62rem; letter-spacing:0.14em;
  text-transform:uppercase; color:var(--muted);
}

/* Compass */

.thr-root .compass{width:52px; height:52px; flex:none;}
.thr-root .compass__needle{transition:transform 480ms var(--ease); transform-origin:26px 26px;}
.thr-root .compass--sm{width:38px; height:38px;}
.thr-root .compass--sm .compass__needle{transform-origin:19px 19px;}

/* ==========================================================================
   Floor plan
   ========================================================================== */

.thr-root .plan{
  display:grid; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);
  gap:clamp(16px,2vw,26px); align-items:stretch;
}
.thr-root .plan__stage{
  position:relative; border-radius:var(--r-lg); overflow:hidden;
  background:
    linear-gradient(150deg, rgba(255,255,255,0.7), rgba(255,255,255,0.34)),
    radial-gradient(700px 420px at 30% 0%, rgba(var(--champagne-rgb),0.14), transparent 62%);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(1.6);
  backdrop-filter:blur(var(--blur)) saturate(1.6);
  border:1px solid var(--glass-border);
  box-shadow:inset 0 1px 0 var(--glass-edge), var(--sh-2);
  min-height:420px;
  /* pan-y keeps the page scrollable when a finger lands on the plan;
     horizontal drags still pan it, and the +/− buttons do the zooming */
  touch-action:pan-y pinch-zoom;
}
.thr-root .plan__grid{
  position:absolute; inset:0; pointer-events:none; opacity:0.5;
  background-image:
    linear-gradient(rgba(21,22,26,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(21,22,26,0.045) 1px, transparent 1px);
  background-size:34px 34px;
  -webkit-mask-image:radial-gradient(circle at 50% 50%, #000 30%, transparent 78%);
  mask-image:radial-gradient(circle at 50% 50%, #000 30%, transparent 78%);
}
.thr-root .plan__svg{width:100%; height:100%; display:block; cursor:grab;}
.thr-root .plan__svg.is-panning{cursor:grabbing;}

/* An uploaded drawing takes the same stage as the built-in plan: same pan,
   same zoom, no hotspots to hover. */

.thr-root .plan__img{width:100%; height:100%; display:grid; place-items:center; cursor:grab; overflow:hidden;}
.thr-root .plan__img.is-panning{cursor:grabbing;}
.thr-root .plan__img .plan__zoomer{width:100%; height:100%; display:grid; place-items:center; padding:44px 18px 46px;}
.thr-root .plan__img img{max-width:100%; max-height:100%; object-fit:contain; border-radius:8px;
  background:#fff; box-shadow:0 18px 44px -30px rgba(21,22,26,0.5);}
.thr-root .plan__zoomer{transition:transform 320ms var(--ease);}
.thr-root .plan__zoomer.no-anim{transition:none;}
.thr-root .fp-outline{fill:rgba(255,255,255,0.42); stroke:var(--graphite); stroke-width:5; stroke-linejoin:round;}
.thr-root .fp-outline--terrace{fill:rgba(var(--champagne-rgb),0.10); stroke:var(--champagne); stroke-width:2.5; stroke-dasharray:10 8;}
.thr-root .fp-room{cursor:pointer; outline:none;}
.thr-root .fp-room__shape{
  fill:rgba(255,255,255,0.30); stroke:var(--graphite); stroke-width:2.5; stroke-linejoin:round;
  transition:fill 300ms var(--ease), stroke 300ms var(--ease);
}

/* A plan laid out from the rooms has no outline polygon behind it, so the
   room walls carry the drawing on their own. */

.thr-root .fp-room__shape--wall{stroke-width:4;}
.thr-root .fp-room:hover .fp-room__shape, .thr-root .fp-room.is-active .fp-room__shape, .thr-root .fp-room:focus-visible .fp-room__shape{
  fill:rgba(var(--champagne-rgb),0.24); stroke:var(--champagne);
}
.thr-root .fp-room:focus-visible .fp-room__shape{stroke-width:4; stroke-dasharray:none;}
.thr-root .fp-room__label{
  font-family:'IBM Plex Mono',monospace; font-size:13px; fill:var(--slate);
  text-anchor:middle; pointer-events:none;
  transition:fill 300ms var(--ease), opacity 300ms var(--ease);
}
.thr-root .fp-room__name{
  font-family:'Inter',sans-serif; font-size:15px; font-weight:400; fill:var(--graphite);
  text-anchor:middle; pointer-events:none; letter-spacing:-0.01em;
}
.thr-root .fp-room:hover .fp-room__name, .thr-root .fp-room.is-active .fp-room__name{fill:var(--ink);}
.thr-root .fp-room__no{
  font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.12em;
  fill:var(--champagne); text-anchor:middle; pointer-events:none;
}
.thr-root .fp-room__ori{
  font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.14em;
  fill:var(--muted); text-anchor:middle; pointer-events:none;
  opacity:0; transition:opacity 300ms var(--ease);
}
.thr-root .fp-room:hover .fp-room__ori, .thr-root .fp-room.is-active .fp-room__ori, .thr-root .fp-room:focus-visible .fp-room__ori{opacity:1;}
.thr-root .fp-door{stroke:var(--muted); stroke-width:2; fill:none; opacity:0.55; pointer-events:none;}
.thr-root .fp-window{stroke:var(--champagne); stroke-width:4; stroke-linecap:round; opacity:0.75; pointer-events:none;}
.thr-root .fp-stairs{stroke:var(--muted); stroke-width:1.6; fill:none; opacity:0.6; pointer-events:none;}
.thr-root .fp-north{pointer-events:none;}

.thr-root .plan__bar{
  position:absolute; top:14px; left:14px; right:14px; z-index:3;
  display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;
  pointer-events:none;
}
.thr-root .plan__bar > *{pointer-events:auto;}
.thr-root .levels{display:inline-flex; padding:4px; border-radius:999px; gap:2px; background:rgba(var(--glass-rgb),calc(0.55 * var(--glass-a))); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .levels__btn{padding:8px 15px; border-radius:999px; font-size:0.78rem; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .levels__btn.is-active{background:var(--ink); color:var(--bone);}
.thr-root .zoomer{display:inline-flex; gap:4px; padding:4px; border-radius:999px; background:rgba(var(--glass-rgb),calc(0.55 * var(--glass-a))); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .zoomer button{width:34px; height:34px; border-radius:999px; display:grid; place-items:center; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .zoomer button:hover{background:rgba(21,22,26,0.06); color:var(--ink);}
.thr-root .zoomer svg{width:15px; height:15px;}
.thr-root .plan__hint{
  position:absolute; left:14px; bottom:14px; z-index:3;
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem; letter-spacing:0.16em;
  text-transform:uppercase; color:var(--muted);
  padding:8px 13px; border-radius:999px;
  background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a))); border:1px solid rgba(255,255,255,0.66);
  -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
}

/* Plan side panel */

.thr-root .plan__panel{
  border-radius:var(--r-lg); padding:24px; display:flex; flex-direction:column;
  min-height:100%;
}

/* Without any drawing the text boxes are the section, so they spread out
   instead of sitting in a narrow side column. */

.thr-root .plan--list-only{grid-template-columns:minmax(0,1fr);}
.thr-root .plan--list-only .plan__panel{padding:clamp(20px,2.4vw,30px);}
.thr-root .plan--list-only .plan__floor{display:grid; gap:9px;
  grid-template-columns:repeat(auto-fill,minmax(240px,1fr));}
.thr-root .plan--list-only .plan__floor-name{grid-column:1/-1;}

/* The text boxes that stand in for hovering an uploaded drawing */

.thr-root .plan__list{display:flex; flex-direction:column; gap:16px;}
.thr-root .plan__list .eyebrow{display:block;}
.thr-root .plan__floor{display:flex; flex-direction:column; gap:6px;}
.thr-root .plan__floor-name{
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem; letter-spacing:0.16em;
  text-transform:uppercase; color:var(--muted); padding:2px 0 4px;
}
.thr-root .plan__row{
  /* two lines, explicitly placed: name and area on the first, dimensions
     under them, with the room number spanning both. Auto-placement puts the
     area under the number instead, which reads as a different room. */
  display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:2px 12px;
  align-items:baseline; width:100%; text-align:left;
  padding:11px 14px; border-radius:var(--r-sm);
  background:rgba(var(--glass-rgb),calc(0.5 * var(--glass-a))); border:1px solid var(--line);
  transition:border-color var(--t) var(--ease), background var(--t) var(--ease),
             transform var(--t) var(--ease);
}
.thr-root .plan__row:hover{background:rgba(var(--glass-rgb),calc(0.78 * var(--glass-a))); border-color:rgba(var(--champagne-rgb),0.6); transform:translateX(2px);}
.thr-root .plan__row-no{
  grid-column:1; grid-row:1;
  font-family:'IBM Plex Mono',monospace; font-size:0.66rem; letter-spacing:0.14em; color:var(--champagne);
}
.thr-root .plan__row-name{grid-column:2; grid-row:1; font-size:0.92rem; letter-spacing:-0.018em; min-width:0;}
.thr-root .plan__row-area{
  grid-column:3; grid-row:1; text-align:right;
  font-family:'IBM Plex Mono',monospace; font-size:0.74rem; color:var(--slate); white-space:nowrap;
}
.thr-root .plan__row-dim{
  grid-column:2/4; grid-row:2;
  font-family:'IBM Plex Mono',monospace; font-size:0.68rem;
  color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.thr-root .plan__list-note{font-size:0.74rem; line-height:1.6; color:var(--muted); margin-top:2px;}
.thr-root .plan__panel-empty{margin:auto 0; text-align:center; color:var(--muted); padding:26px 6px;}
.thr-root .plan__panel-empty svg{width:34px; height:34px; margin:0 auto 16px; color:var(--champagne); opacity:0.65;}
.thr-root .plan__panel-empty p{font-size:0.86rem; line-height:1.6; font-weight:300;}
.thr-root .rp{display:flex; flex-direction:column; gap:18px; animation:rpIn 420ms var(--ease);}
@keyframes rpIn{from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:none;}}
.thr-root .rp__media{position:relative; border-radius:var(--r-sm); overflow:hidden; aspect-ratio:16/10; background:var(--mist);}
.thr-root .rp__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .rp__head{display:flex; align-items:flex-start; justify-content:space-between; gap:14px;}
.thr-root .rp__no{font-family:'IBM Plex Mono',monospace; font-size:0.66rem; letter-spacing:0.18em; color:var(--champagne);}
.thr-root .rp__name{font-size:1.5rem; font-weight:300; letter-spacing:-0.036em; margin-top:8px; line-height:1.1;}
.thr-root .rp__area{font-family:'IBM Plex Mono',monospace; font-size:1.02rem; margin-top:10px;}
.thr-root .rp__specs{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1px; background:rgba(21,22,26,0.08); border-radius:var(--r-sm); overflow:hidden;}
.thr-root .rp__spec{background:rgba(var(--glass-rgb),calc(0.62 * var(--glass-a))); padding:13px 14px;}
.thr-root .rp__spec dt{font-size:0.64rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); font-family:'IBM Plex Mono',monospace;}
.thr-root .rp__spec dd{margin:6px 0 0; font-size:0.86rem;}
.thr-root .rp__desc{font-size:0.88rem; line-height:1.6; color:var(--slate); font-weight:300;}
.thr-root .rp__foot{margin-top:auto; padding-top:6px;}
.thr-root .rp__foot .btn{width:100%; justify-content:center;}

/* ==========================================================================
   Room detail — modal (desktop) / bottom sheet (mobile)
   ========================================================================== */

.thr-root .sheet{
  position:fixed; inset:0; z-index:280; display:flex; align-items:center; justify-content:center;
  padding:clamp(14px,3vw,44px);
  pointer-events:none;
}
.thr-root .sheet__scrim{
  position:absolute; inset:0; background:rgba(14,15,18,0.44);
  -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
  opacity:0; transition:opacity 320ms var(--ease);
}
.thr-root .sheet__panel{
  position:relative; width:min(1000px,100%); max-height:100%; overflow:hidden;
  border-radius:var(--r-xl);
  background:rgba(255,255,255,0.72);
  -webkit-backdrop-filter:blur(34px) saturate(1.8);
  backdrop-filter:blur(34px) saturate(1.8);
  border:1px solid rgba(255,255,255,0.8);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), 0 60px 130px -50px rgba(21,22,26,0.7);
  display:flex; flex-direction:column;
  transform:translateY(24px) scale(0.985); opacity:0;
  transition:transform 380ms var(--ease), opacity 320ms var(--ease);
}
.thr-root .sheet.is-open{pointer-events:auto;}
.thr-root .sheet.is-open .sheet__scrim{opacity:1;}
.thr-root .sheet.is-open .sheet__panel{transform:none; opacity:1;}
.thr-root .sheet__handle{display:none;}
.thr-root .sheet__close{position:absolute; top:14px; right:14px; z-index:4;}
.thr-root .sheet__close.icon-btn{background:rgba(20,21,25,0.42); border-color:rgba(var(--on-dark-rgb),0.2);}
.thr-root .sheet__scroll{overflow-y:auto; -webkit-overflow-scrolling:touch;}
.thr-root .rd{display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);}
.thr-root .rd__media{position:relative; background:var(--mist); min-height:280px;}
.thr-root .rd__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .rd__badge{
  position:absolute; left:16px; top:16px;
  padding:7px 13px; border-radius:999px;
  background:rgba(20,21,25,0.55); color:var(--on-dark);
  font-family:'IBM Plex Mono',monospace; font-size:0.64rem; letter-spacing:0.16em;
  -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
}
.thr-root .rd__body{padding:clamp(22px,2.6vw,34px);}
.thr-root .rd__eyebrow{display:flex; align-items:center; gap:10px; margin-bottom:14px;}
.thr-root .rd h3{font-size:clamp(1.6rem,2.6vw,2.2rem); margin-bottom:10px;}
.thr-root .rd__area{font-family:'IBM Plex Mono',monospace; font-size:1.1rem; color:var(--champagne);}
.thr-root .rd__specs{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 20px; margin:22px 0;}
.thr-root .rd__spec{padding:13px 0; border-top:1px solid rgba(21,22,26,0.10); display:flex; justify-content:space-between; gap:12px; align-items:baseline;}
.thr-root .rd__spec dt{font-size:0.78rem; color:var(--muted);}
.thr-root .rd__spec dd{margin:0; font-family:'IBM Plex Mono',monospace; font-size:0.84rem; text-align:right;}
.thr-root .rd__desc{font-size:0.95rem; line-height:1.65; color:var(--slate); font-weight:300;}
.thr-root .rd__nav{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid rgba(21,22,26,0.10);}
.thr-root .rd__nav-label{font-family:'IBM Plex Mono',monospace; font-size:0.66rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted);}
.thr-root .rd__compass{display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:var(--r-sm); background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.7);}
.thr-root .rd__compass b{display:block; font-size:0.92rem; font-weight:400;}
.thr-root .rd__compass span{display:block; font-size:0.7rem; color:var(--muted); margin-top:3px; font-family:'IBM Plex Mono',monospace; letter-spacing:0.12em;}

/* No-script notice — only ever shown when scripts did not run */

.thr-root .noscript-note{
  display:none;
  position:relative; z-index:210;
  margin:0; padding:14px 18px;
  background:var(--night); color:var(--on-dark);
  font-size:0.84rem; line-height:1.5; text-align:center;
}
.thr-root .noscript-note strong{font-weight:500;}
.thr-root .noscript-note em{font-style:normal; color:var(--champagne-soft);}

/* Toast */

.thr-root .toast{
  position:fixed; left:50%; bottom:26px; transform:translate(-50%,20px);
  z-index:320; padding:13px 20px; border-radius:999px;
  background:rgba(20,21,25,0.86); color:var(--on-dark); font-size:0.85rem;
  -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
  box-shadow:var(--sh-3); opacity:0; pointer-events:none;
  transition:opacity 300ms var(--ease), transform 300ms var(--ease);
}
.thr-root .toast.is-on{opacity:1; transform:translate(-50%,0);}

/* Related properties */

.thr-root .related{display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(14px,1.6vw,24px); grid-auto-rows:1fr; align-items:stretch;}

/* ==========================================================================
   Responsive
   ========================================================================== */
@media (max-width:1180px){
  .thr-root .grid-props--featured{grid-template-columns:repeat(4,1fr);}
  .thr-root .grid-props--featured > .prop-card:nth-child(1){grid-column:span 4;}
  .thr-root .grid-props--featured > .prop-card:nth-child(n+2){grid-column:span 2;}
  .thr-root .plan{grid-template-columns:minmax(0,1fr);}
  .thr-root .plan__panel{min-height:0;}
  .thr-root .detail-grid{grid-template-columns:minmax(0,1fr);}
  .thr-root .side-card{position:static;}
  .thr-root .agent{grid-template-columns:minmax(0,1fr);}
  .thr-root .agent__media{max-width:520px; aspect-ratio:4/3.4;}
}
@media (max-width:960px){
  .thr-root{--nav-h:64px;}
  .thr-root .nav__links{display:none;}
  .thr-root .nav{padding-right:8px;}
  .thr-root .burger{display:flex;}
  .thr-root .nav__cta .btn--cta{display:none;}
  .thr-root .hero__inner{grid-template-columns:minmax(0,1fr);}
  .thr-root .hero__aside{flex-direction:row; flex-wrap:wrap; align-items:flex-start; justify-content:flex-start;}
  .thr-root .trust{grid-template-columns:repeat(2,1fr);}
  .thr-root .summary{grid-template-columns:repeat(3,1fr);}
  .thr-root .summary__cell:nth-child(3){border-right:0;}
  .thr-root .cta__cards{grid-template-columns:1fr;}
  .thr-root .footer__top{grid-template-columns:1fr 1fr; gap:28px;}
  .thr-root .related{grid-template-columns:1fr;}
  .thr-root .rd{grid-template-columns:minmax(0,1fr);}
  .thr-root .rd__media{aspect-ratio:16/10; min-height:0;}
  .thr-root .gallery{grid-template-columns:repeat(4,1fr);}
  .thr-root .gal, .thr-root .gal:nth-child(6), .thr-root .gal:nth-child(7){grid-column:span 2; aspect-ratio:4/3;}
  .thr-root .gal:nth-child(1){grid-column:span 4; aspect-ratio:16/10;}
  .thr-root .gal:nth-child(2){aspect-ratio:4/3;}
  .thr-root .filters{position:static;}
  .thr-root .f-sep{display:none;}
  .thr-root .filters__row{gap:10px;}
  .thr-root .dl{grid-template-columns:1fr;}
  .thr-root .dl__row:nth-child(odd), .thr-root .dl__row:nth-child(even){padding-inline:0;}
}
@media (max-width:720px){
  .thr-root .grid-props, .thr-root .grid-props--featured{grid-template-columns:minmax(0,1fr) !important;}
  .thr-root .grid-props--featured > .prop-card{grid-column:span 1 !important;}
  .thr-root .grid-props--featured > .prop-card:nth-child(1) .prop-card__media{aspect-ratio:4/3;}
  .thr-root .agent__stats{grid-template-columns:1fr; gap:0;}
  .thr-root .prop-card__body{flex-direction:column; align-items:flex-start; gap:14px;}
  .thr-root .prop-card__specs{justify-content:flex-start;}
  .thr-root .spec{text-align:left;}
  .thr-root .footer__top{grid-template-columns:1fr;}
  .thr-root .detail-hero{min-height:66svh;}
  .thr-root .summary{grid-template-columns:repeat(2,1fr); margin-top:-24px;}
  .thr-root .summary__cell{border-bottom:1px solid rgba(21,22,26,0.07); padding:16px 14px;}
  .thr-root .summary__cell:nth-child(2n){border-right:0;}
  .thr-root .summary__cell:last-child{grid-column:span 2; border-bottom:0;}
  .thr-root .gallery{grid-template-columns:repeat(2,1fr);}
  .thr-root .gal, .thr-root .gal:nth-child(2), .thr-root .gal:nth-child(6), .thr-root .gal:nth-child(7){grid-column:span 1; aspect-ratio:1/1;}
  .thr-root .gal:nth-child(1){grid-column:span 2; aspect-ratio:16/11;}
  .thr-root .rooms-grid{grid-template-columns:repeat(auto-fill,minmax(155px,1fr));}
  .thr-root .room-card__name{font-size:0.95rem;}

/* A phone has no hover, so the orientation and floor pills are permanently
     visible — and at this card width they wrapped into a stack that swallowed
     the photograph. Below the image they keep every value and read cleanly. */


  .thr-root .room-card__meta{
    position:static; display:flex; flex-wrap:wrap; gap:4px 12px;
    padding:9px 16px 13px; opacity:1; transform:none;
  }
  .thr-root .room-card__pill{
    padding:0; border:0; background:none; color:var(--slate);
    -webkit-backdrop-filter:none; backdrop-filter:none;
    font-size:0.58rem; letter-spacing:0.11em;
  }
  .thr-root .plan__stage{min-height:360px;}
  .thr-root .plan__stage #planHost{inset:56px 6px 50px !important;}
  .thr-root .plan__hint{font-size:0.55rem; letter-spacing:0.12em;}
  .thr-root .rp__specs{grid-template-columns:1fr;}
  .thr-root .lightbox__thumbs{padding-bottom:18px;}
  .thr-root .lightbox__thumb{width:64px;}

/* Bottom sheet on phones */


  .thr-root .sheet{padding:0; align-items:flex-end;}
  .thr-root .sheet__panel{
    width:100%; max-height:92svh; border-radius:26px 26px 0 0;
    background:rgba(250,249,246,0.94);
    transform:translateY(100%); transition:transform 420ms var(--ease), opacity 260ms var(--ease);
  }
  .thr-root .sheet.is-open .sheet__panel{transform:translateY(var(--drag,0px));}
  .thr-root .sheet__panel.is-dragging{transition:none;}
  .thr-root .sheet__handle{
    display:block; width:44px; height:4px; border-radius:99px;
    background:rgba(21,22,26,0.18); margin:10px auto 4px; flex:none;
    position:relative; z-index:5;
  }
  .thr-root .sheet__grab{position:absolute; top:0; left:0; right:0; height:64px; z-index:3; touch-action:none;}
  .thr-root .sheet__close{top:74px;}
  /* The pin chips are an overlay on the map. On a phone the map is only about
     220 px tall and ten of them wrap into six rows, so they climbed over the
     neighbourhood card. One swipeable row instead, and a squarer map to sit
     it in. */
  .thr-root .map-wrap{aspect-ratio:1/1;}
  .thr-root .map-legend{
    flex-wrap:nowrap; overflow-x:auto; overscroll-behavior-x:contain;
    scrollbar-width:none; -ms-overflow-style:none;
    padding-bottom:2px; left:12px; right:12px; bottom:12px;
  }
  .thr-root .map-legend::-webkit-scrollbar{display:none;}
  .thr-root .map-chip{flex:none;}
  .thr-root .map-card{max-width:min(64%,208px); top:12px; left:12px; padding:11px 13px;}
  .thr-root .map-card b{margin:6px 0 4px; font-size:0.94rem;}
  .thr-root .map-card span{font-size:0.72rem;}
  .thr-root .rd__specs{grid-template-columns:1fr;}
}
@media (max-width:720px){
  /* The hero card used to fill a phone screen and slide under the navbar.
     The three chips repeat the trust strip directly below, so they go. */


  .thr-root .hero{min-height:88svh; min-height:88vh;}
  .thr-root .hero__aside{display:none;}
  .thr-root .hero__card{padding:24px 20px;}
  .thr-root .hero h1{font-size:clamp(2rem,9.4vw,2.9rem); margin-bottom:16px;}
  .thr-root .hero__card .eyebrow{margin-bottom:14px; font-size:0.6rem;}
  .thr-root .hero__sub{font-size:0.95rem; margin-bottom:22px;}
  .thr-root .hero__cta .btn{flex:1 1 auto; justify-content:center;}
  .thr-root .detail-hero__side{display:none;}
  .thr-root .detail-hero h1{margin:12px 0 10px;}
  .thr-root .detail-hero__loc{font-size:0.84rem;}
}
@media (max-width:420px){
  .thr-root .hero__card{padding:22px 18px;}
  .thr-root .btn{padding:13px 20px;}
}

/* Touch devices: hover reveals must not stick */
@media (hover:none){
  .thr-root .prop-card__view, .thr-root .prop-card__reveal, .thr-root .gal__cap, .thr-root .room-card__meta{opacity:1; transform:none;}
  .thr-root .prop-card__reveal{display:none;}
  .thr-root .prop-card__over{opacity:1 !important; transform:none !important;}
  .thr-root .popover{display:none;}
  .thr-root .tsm__rail{cursor:default;}
}
@media (max-width:1023px){
  .thr-root .popover{display:none;}
}`

// ---------------------------------------------------------------------------
// Scenery — every photograph the buyer has not supplied is drawn here, as an
// SVG scene built from a short spec. Uploading an image replaces it.
// ---------------------------------------------------------------------------
const Scenery = (function () {
  const cache = new Map();

  const LIGHT = {
    dusk:    { sky: ["#20293b", "#3f4763", "#8a6f75", "#d99f74"], sun: "#ffcf9e", sunY: 0.94, hills: ["#252c3b", "#2f3746", "#3b4351"], ground: "#2c313c", glass: "#ffcb87", glassOp: 0.92, warm: 0.5 },
    evening: { sky: ["#2c3448", "#525a72", "#a2807d", "#e0ab7d"], sun: "#ffd9ac", sunY: 0.88,  hills: ["#2b3240", "#39404e", "#464e5c"], ground: "#3a3f48", glass: "#ffd399", glassOp: 0.85, warm: 0.45 },
    day:     { sky: ["#7c9dc4", "#a9c2da", "#d6e2ec", "#eef2f5"], sun: "#ffffff", sunY: 0.30,  hills: ["#6f7d76", "#829086", "#95a199"], ground: "#93a186", glass: "#dbe7f0", glassOp: 0.55, warm: 0.1 },
    morning: { sky: ["#9fb6ca", "#c6d3da", "#e8e2d6", "#f6efe3"], sun: "#fff2dc", sunY: 0.52, hills: ["#78837f", "#8b948d", "#9ea69c"], ground: "#9aa389", glass: "#f2e2c6", glassOp: 0.6,  warm: 0.28 },
    winter:  { sky: ["#8a99ab", "#b3bfc9", "#d9dee2", "#eff1f2"], sun: "#ffffff", sunY: 0.44, hills: ["#8d949a", "#a2a8ac", "#b8bcbe"], ground: "#dfe1e0", glass: "#dfe8ee", glassOp: 0.5,  warm: 0.05 }
  };

  function ridge(r, y, amp, w, steps) {
    let d = "M0," + y, x = 0;
    const step = w / steps;
    let cur = y;
    for (let i = 1; i <= steps; i++) {
      x = step * i;
      const next = y + (r() - 0.5) * amp;
      d += " Q" + (x - step / 2) + "," + (cur - amp * 0.35 * r()) + " " + x + "," + next;
      cur = next;
    }
    return d + " L" + w + ",1000 L0,1000 Z";
  }

  function tree(x, y, h, w, fill, op) {
    return '<g opacity="' + op + '" fill="' + fill + '">' +
      '<rect x="' + (x - w * 0.035) + '" y="' + (y - h * 0.34) + '" width="' + w * 0.07 + '" height="' + h * 0.36 + '" rx="2"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - h * 0.62) + '" rx="' + w * 0.5 + '" ry="' + h * 0.42 + '"/>' +
      '<ellipse cx="' + (x - w * 0.3) + '" cy="' + (y - h * 0.45) + '" rx="' + w * 0.34 + '" ry="' + h * 0.26 + '"/>' +
      '<ellipse cx="' + (x + w * 0.28) + '" cy="' + (y - h * 0.48) + '" rx="' + w * 0.3 + '" ry="' + h * 0.24 + '"/></g>';
  }

  function conifer(x, y, h, w, fill, op) {
    let s = '<g opacity="' + op + '" fill="' + fill + '">';
    for (let i = 0; i < 3; i++) {
      const t = y - h * (0.34 + i * 0.24), bw = w * (1 - i * 0.22);
      s += '<path d="M' + x + ',' + (t - h * 0.4) + ' L' + (x + bw / 2) + ',' + t + ' L' + (x - bw / 2) + ',' + t + ' Z"/>';
    }
    return s + '</g>';
  }

  /* --- glazing: a mullioned window wall ------------------------------ */
  function glazing(x, y, w, h, cols, rows, L, lit) {
    const gw = w / cols, gh = h / rows;
    let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#glassGrad)"/>';
    if (lit) s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + L.glass + '" opacity="' + (L.glassOp * 0.55) + '"/>';
    for (let c = 1; c < cols; c++) s += '<rect x="' + (x + gw * c - 1.6) + '" y="' + y + '" width="3.2" height="' + h + '" fill="#22262c" opacity="0.85"/>';
    for (let rr = 1; rr < rows; rr++) s += '<rect x="' + x + '" y="' + (y + gh * rr - 1.6) + '" width="' + w + '" height="3.2" fill="#22262c" opacity="0.85"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#1b1f24" stroke-width="3.4"/>';
    s += '<path d="M' + x + ',' + (y + h) + ' L' + (x + w * 0.55) + ',' + y + ' L' + (x + w * 0.78) + ',' + y + ' L' + (x + w * 0.22) + ',' + (y + h) + ' Z" fill="#ffffff" opacity="0.10"/>';
    return s;
  }

  /* --- EXTERIOR ------------------------------------------------------ */
  function exterior(spec) {
    const r = rng(hash(spec.seed || "x")), L = LIGHT[spec.t] || LIGHT.evening;
    const W = 1600, H = 1000, hz = 620, base = 680;
    const lit = spec.t === "dusk" || spec.t === "evening";
    let s = "";

    /* sky */
    s += '<rect width="' + W + '" height="' + (hz + 4) + '" fill="url(#sky)"/>';
    s += '<circle cx="' + (W * (0.24 + r() * 0.5)) + '" cy="' + (hz * L.sunY) + '" r="' + (H * 0.42) + '" fill="url(#sun)"/>';
    for (let i = 0; i < 5; i++) {
      s += '<ellipse cx="' + (r() * W) + '" cy="' + (70 + r() * 300) + '" rx="' + (240 + r() * 420) + '" ry="' + (14 + r() * 26) + '" fill="#ffffff" opacity="' + (0.04 + r() * 0.09) + '"/>';
    }
    /* hills, three depths */
    s += '<path d="' + ridge(r, hz - 150, 96, W, 5) + '" fill="' + L.hills[0] + '" opacity="0.45"/>';
    s += '<path d="' + ridge(r, hz - 74, 64, W, 6) + '" fill="' + L.hills[1] + '" opacity="0.62"/>';
    s += '<path d="' + ridge(r, hz - 16, 34, W, 7) + '" fill="' + L.hills[2] + '" opacity="0.85"/>';
    /* haze band along the horizon */
    s += '<rect x="0" y="' + (hz - 140) + '" width="' + W + '" height="170" fill="url(#haze)"/>';
    /* ground */
    s += '<rect x="0" y="' + hz + '" width="' + W + '" height="' + (H - hz) + '" fill="url(#ground)"/>';

    const v = spec.v;
    if (v === "land") {
      s += '<path d="M180,700 L980,662 L1500,830 L520,960 Z" fill="#ffffff" opacity="0.10" stroke="#f4f1e8" stroke-width="3" stroke-dasharray="16 12"/>';
      [[180, 700], [980, 662], [1500, 830], [520, 960]].forEach(function (q) {
        s += '<rect x="' + (q[0] - 3) + '" y="' + (q[1] - 34) + '" width="6" height="34" fill="#f4f1e8" opacity="0.8"/>';
      });
      for (let i = 0; i < 30; i++) s += '<ellipse cx="' + (r() * W) + '" cy="' + (hz + 20 + r() * (H - hz - 30)) + '" rx="' + (16 + r() * 30) + '" ry="' + (3 + r() * 5) + '" fill="#ffffff" opacity="' + (0.03 + r() * 0.05) + '"/>';
      s += conifer(150, hz + 30, 230, 118, L.hills[0], 0.85);
      s += conifer(258, hz + 48, 168, 90, L.hills[0], 0.8);
      s += tree(1420, hz + 44, 220, 200, L.hills[0], 0.8);
    } else if (v === "penthouse") {
      for (let i = 0; i < 30; i++) {
        const bw2 = 40 + r() * 110, bh2 = 60 + r() * 240, bx2 = r() * W;
        s += '<rect x="' + bx2 + '" y="' + (hz - bh2) + '" width="' + bw2 + '" height="' + bh2 + '" fill="' + L.hills[1] + '" opacity="' + (0.30 + r() * 0.4) + '"/>';
        if (lit) for (let k = 0; k < 7; k++) s += '<rect x="' + (bx2 + 6 + r() * (bw2 - 14)) + '" y="' + (hz - bh2 + 10 + r() * (bh2 - 22)) + '" width="6" height="5" fill="' + L.glass + '" opacity="' + (0.35 + r() * 0.5) + '"/>';
      }
      s += '<rect x="0" y="' + (hz + 40) + '" width="' + W + '" height="' + (H - hz - 40) + '" fill="#6f6a63"/>';
      s += '<rect x="0" y="' + (hz + 40) + '" width="' + W + '" height="' + (H - hz - 40) + '" fill="url(#deck)"/>';
      for (let i = 0; i < 22; i++) s += '<rect x="' + (i * (W / 22)) + '" y="' + (hz + 40) + '" width="2" height="' + (H - hz - 40) + '" fill="#000" opacity="0.10"/>';
      s += '<rect x="0" y="' + (hz + 26) + '" width="' + W + '" height="14" fill="#1e2126" opacity="0.7"/>';
      s += '<rect x="0" y="' + (hz - 150) + '" width="' + W + '" height="176" fill="#cfe0ea" opacity="0.16"/>';
      for (let i = 0; i <= 8; i++) s += '<rect x="' + (i * (W / 8) - 3) + '" y="' + (hz - 150) + '" width="6" height="176" fill="#20242a" opacity="0.55"/>';
      s += '<rect x="0" y="' + (hz - 154) + '" width="' + W + '" height="8" rx="4" fill="#2a2e34" opacity="0.85"/>';
      s += '<g opacity="0.92" fill="#2b2f35"><rect x="1010" y="330" width="12" height="330"/><rect x="1520" y="330" width="12" height="330"/><rect x="990" y="322" width="552" height="12" rx="4"/>';
      for (let i = 0; i < 9; i++) s += '<rect x="' + (1020 + i * 58) + '" y="334" width="7" height="118" opacity="0.5"/>';
      s += '</g>';
      s += '<g fill="#3a3f47" opacity="0.95"><rect x="170" y="770" width="450" height="92" rx="18"/><rect x="170" y="718" width="450" height="64" rx="16" opacity="0.8"/><rect x="670" y="806" width="190" height="56" rx="12" opacity="0.7"/></g>';
      s += '<g fill="#c7a97c" opacity="0.5"><rect x="204" y="732" width="126" height="42" rx="10"/><rect x="352" y="732" width="126" height="42" rx="10"/></g>';
      s += '<g fill="#4a5346" opacity="0.9"><rect x="1180" y="760" width="120" height="110" rx="8"/><ellipse cx="1240" cy="720" rx="86" ry="70"/></g>';
    } else if (v === "villa") {
      const bx = 300, bw = 880;
      s += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (base + 24) + '" rx="' + (bw * 0.72) + '" ry="34" fill="#000" opacity="0.16"/>';
      s += '<rect x="' + bx + '" y="470" width="' + bw + '" height="210" fill="#efece6"/>';
      s += '<rect x="' + bx + '" y="470" width="' + bw + '" height="210" fill="url(#facade)"/>';
      s += '<rect x="600" y="300" width="640" height="170" fill="#3a3d42"/>';
      for (let i = 0; i < 18; i++) s += '<rect x="' + (600 + i * (640 / 18)) + '" y="300" width="2" height="170" fill="#000" opacity="0.18"/>';
      s += '<rect x="570" y="282" width="700" height="20" rx="3" fill="#2c2f34"/>';
      s += '<rect x="264" y="452" width="954" height="20" rx="3" fill="#2c2f34"/>';
      s += glazing(340, 500, 460, 170, 4, 2, L, lit);
      s += glazing(840, 510, 240, 160, 2, 2, L, lit);
      s += glazing(640, 330, 480, 100, 4, 1, L, lit);
      s += '<rect x="1096" y="588" width="74" height="92" fill="#23262b"/>';
      s += '<rect x="1090" y="582" width="86" height="8" rx="3" fill="#2c2f34"/>';
    } else if (v === "house") {
      const bx = 380, bw = 840;
      s += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (base + 20) + '" rx="' + (bw * 0.7) + '" ry="30" fill="#000" opacity="0.14"/>';
      s += '<path d="M' + (bx - 46) + ',470 L' + (bx + bw / 2) + ',248 L' + (bx + bw + 46) + ',470 Z" fill="#33373d"/>';
      s += '<rect x="' + bx + '" y="462" width="' + bw + '" height="218" fill="#f0ede7"/>';
      s += '<rect x="' + bx + '" y="462" width="' + bw + '" height="218" fill="url(#facade)"/>';
      s += glazing(bx + 60, 500, 190, 120, 2, 2, L, lit);
      s += glazing(bx + 300, 500, 190, 120, 2, 2, L, lit);
      s += '<rect x="' + (bx + 610) + '" y="556" width="104" height="124" fill="#2a2d33"/>';
      s += '<rect x="' + (bx + 600) + '" y="546" width="124" height="10" rx="4" fill="#3a3e44"/>';
      s += '<rect x="' + (bx + bw * 0.7) + '" y="300" width="44" height="120" fill="#3a3e44"/>';
    } else if (v === "historic") {
      const bx = 360, bw = 880;
      s += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (base + 18) + '" rx="' + (bw * 0.68) + '" ry="28" fill="#000" opacity="0.14"/>';
      s += '<path d="M330,412 L500,292 L1100,292 L1270,412 Z" fill="#4a4139"/>';
      for (let i = 0; i < 3; i++) s += '<rect x="' + (560 + i * 220) + '" y="316" width="70" height="46" rx="6" fill="#6a6055"/>';
      s += '<rect x="' + bx + '" y="406" width="' + bw + '" height="274" fill="#e9e2d5"/>';
      s += '<rect x="' + bx + '" y="406" width="' + bw + '" height="274" fill="url(#facade)"/>';
      s += '<rect x="' + (bx - 16) + '" y="398" width="' + (bw + 32) + '" height="16" fill="#d9d1c2"/>';
      s += '<rect x="' + (bx - 8) + '" y="548" width="' + (bw + 16) + '" height="9" fill="#d9d1c2"/>';
      for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
        const wx2 = bx + 56 + i * 164, wy2 = row ? 572 : 428;
        s += '<path d="M' + wx2 + ',' + (wy2 + 96) + ' L' + wx2 + ',' + (wy2 + 28) + ' A32,32 0 0 1 ' + (wx2 + 64) + ',' + (wy2 + 28) + ' L' + (wx2 + 64) + ',' + (wy2 + 96) + ' Z" fill="' + (lit ? L.glass : "#5d6672") + '" opacity="' + (lit ? 0.82 : 0.5) + '" stroke="#cfc6b5" stroke-width="5"/>';
      }
      s += '<rect x="' + (bx + bw / 2 - 46) + '" y="574" width="92" height="106" rx="46" fill="#3c342c"/>';
    } else { /* block */
      const bx = 380, bw = 840;
      s += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (base + 16) + '" rx="' + (bw * 0.68) + '" ry="26" fill="#000" opacity="0.13"/>';
      s += '<rect x="' + bx + '" y="250" width="' + bw + '" height="430" fill="#eae7e0"/>';
      s += '<rect x="' + bx + '" y="250" width="' + bw + '" height="430" fill="url(#facade)"/>';
      s += '<rect x="' + (bx - 14) + '" y="236" width="' + (bw + 28) + '" height="16" rx="3" fill="#cfcabf"/>';
      for (let row = 0; row < 3; row++) {
        const wy2 = 288 + row * 132;
        s += glazing(bx + 54, wy2, 300, 86, 3, 1, L, lit && r() > 0.35);
        s += glazing(bx + 470, wy2, 300, 86, 3, 1, L, lit && r() > 0.35);
        s += '<rect x="' + (bx + 36) + '" y="' + (wy2 + 96) + '" width="' + (bw - 72) + '" height="8" rx="4" fill="#c9c4ba"/>';
        s += '<rect x="' + (bx + 36) + '" y="' + (wy2 + 58) + '" width="' + (bw - 72) + '" height="46" fill="#cfe0ea" opacity="0.16"/>';
      }
      s += '<rect x="' + (bx + bw / 2 - 52) + '" y="580" width="104" height="100" fill="#2f3339"/>';
    }

    /* garden ground: terrace, pool, planting */
    if (v === "villa" || v === "house") {
      s += '<rect x="200" y="678" width="1220" height="110" fill="#d9d4c9" opacity="0.5"/>';
      s += '<rect x="140" y="800" width="880" height="140" rx="10" fill="url(#water)"/>';
      s += '<rect x="140" y="800" width="880" height="140" rx="10" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.22"/>';
      for (let i = 0; i < 6; i++) s += '<rect x="' + (170 + r() * 560) + '" y="' + (816 + i * 20) + '" width="' + (70 + r() * 220) + '" height="3" rx="2" fill="#fff" opacity="' + (0.08 + r() * 0.14) + '"/>';
      s += '<g fill="#3f4a3c" opacity="0.6"><ellipse cx="1180" cy="820" rx="130" ry="26"/><ellipse cx="1360" cy="860" rx="150" ry="30"/></g>';
    }
    if (v !== "penthouse") {
      s += conifer(126, hz + 26, 280, 136, L.hills[0], 0.9);
      s += conifer(230, hz + 12, 190, 96, L.hills[0], 0.72);
      s += tree(1490, hz + 60, 330, 280, L.hills[0], 0.85);
      s += tree(72, hz + 96, 210, 190, L.hills[1], 0.55);
    }

    /* foreground: a dark out-of-focus band anchors the frame */
    s += '<path d="M0,930 Q400,880 760,932 T1600,900 L1600,1000 L0,1000 Z" fill="#14161a" opacity="0.22"/>';

    /* A phone crops a 16:10 frame into a close-up of one window. The portrait
       variant re-frames the same drawing with more sky above and more ground
       below, so `cover` on a tall box still shows the whole house. */
    if (spec.tall) return wrapTall(defs(L, spec), s, L);
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#vig)"/>';
    return wrap(W, H, defs(L, spec), s);
  }

  function wrapTall(d, body, L) {
    const VW = 1000, VH = 1250, k = VW / 1600, dh = 1000 * k, top = (VH - dh) / 2;
    /* the sky gradient starts on a flat colour and the ground ends on one,
       so the extended bands above and below join without a seam */
    let s = '<rect width="' + VW + '" height="' + (top + 2) + '" fill="' + L.sky[0] + '"/>';
    s += '<g transform="translate(0,' + top + ') scale(' + k + ')">' + body + '</g>';
    s += '<rect y="' + (top + dh - 2) + '" width="' + VW + '" height="' + (VH - top - dh + 2) + '" fill="#1e2128"/>';
    s += '<rect width="' + VW + '" height="' + VH + '" fill="url(#vig)"/>';
    return wrap(VW, VH, d, s);
  }

  /* --- INTERIOR ------------------------------------------------------ */
  const ROOMLOOK = {
    living:  { wall: "#e4ddd0", floor: ["#c09763", "#8e6c3c", "#6d5029"], accent: "#31363d", warm: 0.38 },
    kitchen: { wall: "#e2ddd2", floor: ["#c2bbaf", "#98928a", "#77726c"], accent: "#272b31", warm: 0.30 },
    bedroom: { wall: "#e1d8c9", floor: ["#bd9663", "#8c6b3d", "#6a5029"], accent: "#3f382e", warm: 0.46 },
    kids:    { wall: "#e3ded4", floor: ["#c6a473", "#957544", "#71592f"], accent: "#4c5a60", warm: 0.36 },
    bath:    { wall: "#dcdcd8", floor: ["#cbc7be", "#a09c94", "#7d7a74"], accent: "#31363c", warm: 0.20 },
    study:   { wall: "#ded9cd", floor: ["#b99760", "#8a6b3c", "#674f2b"], accent: "#2b3037", warm: 0.32 },
    hall:    { wall: "#e2ded4", floor: ["#c4beb3", "#9a948b", "#787369"], accent: "#262a30", warm: 0.26 },
    tech:    { wall: "#dcdcd9", floor: ["#bdbbb5", "#97958f", "#767470"], accent: "#42464c", warm: 0.12 },
    stairs:  { wall: "#e3ded4", floor: ["#bf9764", "#8d6c3e", "#6b5029"], accent: "#2b2f35", warm: 0.32 },
    office:  { wall: "#e0ddd4", floor: ["#c0bcb2", "#96928a", "#75726c"], accent: "#272b31", warm: 0.22 },
    attic:   { wall: "#e2dcd0", floor: ["#bf9764", "#8d6c3e", "#6b5029"], accent: "#353941", warm: 0.40 }
  };

  function interior(spec) {
    const r = rng(hash(spec.seed || "i")), W = 1600, H = 1000;
    const K0 = ROOMLOOK[spec.v] || ROOMLOOK.living;
    const K = { wall: K0.wall, floor: K0.floor, accent: K0.accent, warm: Math.max(0.05, Math.min(0.6, K0.warm + (r() - 0.5) * 0.16)) };
    const outside = spec.out || "garden";
    let s = "";
    const fy = 672;                 /* floor line */
    const wx1 = 140, wx2 = 1460;    /* back wall */

    /* side walls + ceiling in soft perspective */
    s += '<rect width="' + W + '" height="' + H + '" fill="' + K.wall + '"/>';
    const cy0 = 96;
    s += '<path d="M0,0 L' + wx1 + ',' + cy0 + ' L' + wx1 + ',' + fy + ' L0,' + (H - 40) + ' Z" fill="#000" opacity="0.08"/>';
    s += '<path d="M' + W + ',0 L' + wx2 + ',' + cy0 + ' L' + wx2 + ',' + fy + ' L' + W + ',' + (H - 40) + ' Z" fill="#000" opacity="0.05"/>';
    s += '<path d="M0,0 L' + wx1 + ',' + cy0 + ' L' + wx2 + ',' + cy0 + ' L' + W + ',0 Z" fill="#ffffff" opacity="0.26"/>';
    s += '<rect x="' + wx1 + '" y="' + cy0 + '" width="' + (wx2 - wx1) + '" height="' + (fy - cy0) + '" fill="' + K.wall + '"/>';
    s += '<rect x="' + wx1 + '" y="' + cy0 + '" width="' + (wx2 - wx1) + '" height="' + (fy - cy0) + '" fill="url(#wallGrad)"/>';

    /* floor */
    s += '<path d="M0,' + (H - 40) + ' L' + wx1 + ',' + fy + ' L' + wx2 + ',' + fy + ' L' + W + ',' + (H - 40) + ' L' + W + ',' + H + ' L0,' + H + ' Z" fill="url(#floorGrad)"/>';
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      s += '<path d="M' + (wx1 + (wx2 - wx1) * t) + ',' + fy + ' L' + (W * t) + ',' + H + '" stroke="#000" stroke-width="2" opacity="0.06"/>';
    }
    for (let i = 1; i < 5; i++) { const y = fy + (H - fy) * (i / 5); s += '<path d="M0,' + y + ' L' + W + ',' + y + '" stroke="#000" stroke-width="1.5" opacity="0.05"/>'; }

    /* window wall */
    const wide = spec.v === "living" || spec.v === "kitchen" || spec.v === "attic";
    const winW = spec.v === "bath" || spec.v === "tech" ? 300 : (wx2 - wx1) * (spec.v === "kids" || spec.v === "study" ? 0.44 : wide ? 0.62 : 0.52);
    const winX = spec.win === "left" ? wx1 + 70 : wx1 + ((wx2 - wx1) - winW) * (0.42 + r() * 0.3);
    const winY = 150, winH = fy - winY - (spec.v === "living" || spec.v === "kitchen" ? 0 : 74);
    s += '<rect x="' + winX + '" y="' + winY + '" width="' + winW + '" height="' + winH + '" fill="url(#' + (outside === "city" ? "outCity" : outside === "forest" ? "outForest" : "outGarden") + ')"/>';
    if (outside !== "city") {
      s += '<g opacity="0.5">' + tree(winX + winW * 0.24, winY + winH * 0.94, winH * 0.7, winW * 0.4, "#6f7d6b", 0.9) + conifer(winX + winW * 0.74, winY + winH * 0.96, winH * 0.8, winW * 0.3, "#5d6a5c", 0.85) + '</g>';
    } else {
      for (let i = 0; i < 12; i++) s += '<rect x="' + (winX + r() * winW) + '" y="' + (winY + winH * (0.4 + r() * 0.4)) + '" width="' + (20 + r() * 46) + '" height="' + (winH * (0.2 + r() * 0.4)) + '" fill="#8e9aa6" opacity="0.5"/>';
    }
    const cols = winW > 500 ? 4 : 2;
    for (let c = 1; c < cols; c++) s += '<rect x="' + (winX + (winW / cols) * c - 4) + '" y="' + winY + '" width="8" height="' + winH + '" fill="#2b2f35"/>';
    s += '<rect x="' + winX + '" y="' + winY + '" width="' + winW + '" height="' + winH + '" fill="none" stroke="#2b2f35" stroke-width="10"/>';
    s += '<rect x="' + winX + '" y="' + winY + '" width="' + winW + '" height="' + winH + '" fill="url(#glassSheen)" opacity="0.5"/>';

    /* light shaft across the floor */
    s += '<path d="M' + winX + ',' + fy + ' L' + (winX + winW) + ',' + fy + ' L' + (winX + winW * 1.6) + ',' + H + ' L' + (winX - winW * 0.5) + ',' + H + ' Z" fill="url(#shaft)"/>';

    /* furniture */
    const A = K.accent;
    const g = (body) => '<g>' + body + '</g>';
    if (spec.v === "living") {
      s += '<ellipse cx="760" cy="900" rx="620" ry="140" fill="#b9ab93" opacity="0.42"/>';
      s += g('<rect x="300" y="726" width="800" height="160" rx="30" fill="' + A + '"/><rect x="300" y="650" width="800" height="96" rx="26" fill="' + A + '" opacity="0.82"/><rect x="272" y="712" width="70" height="172" rx="24" fill="' + A + '" opacity="0.9"/><rect x="1058" y="712" width="70" height="172" rx="24" fill="' + A + '" opacity="0.9"/>');
      s += '<g fill="#c7a97c" opacity="0.55"><rect x="360" y="658" width="150" height="74" rx="16"/><rect x="540" y="658" width="150" height="74" rx="16"/></g>';
      s += '<rect x="1180" y="806" width="330" height="30" rx="12" fill="#7d6a4f"/><rect x="1204" y="836" width="18" height="84" fill="#7d6a4f"/><rect x="1468" y="836" width="18" height="84" fill="#7d6a4f"/>';
      s += '<rect x="1256" y="742" width="160" height="64" rx="10" fill="#2a2e34" opacity="0.5"/>';
      s += '<ellipse cx="700" cy="960" rx="440" ry="70" fill="#8f7f66" opacity="0.28"/>';
    } else if (spec.v === "kitchen") {
      s += '<rect x="' + (wx1 + 40) + '" y="300" width="360" height="200" rx="6" fill="#2f3339" opacity="0.9"/>';
      for (let i = 1; i < 3; i++) s += '<rect x="' + (wx1 + 40 + i * 120) + '" y="300" width="3" height="200" fill="#000" opacity="0.3"/>';
      s += '<rect x="' + (wx1 + 40) + '" y="520" width="360" height="110" fill="#d8d3c8"/>';
      s += '<rect x="380" y="690" width="740" height="40" rx="8" fill="#2b2f35"/><rect x="400" y="730" width="700" height="170" fill="#e3ded4"/>';
      for (let i = 1; i < 4; i++) s += '<rect x="' + (400 + i * 175) + '" y="730" width="4" height="170" fill="#000" opacity="0.12"/>';
      s += '<g stroke="#2b2f35" stroke-width="7" fill="none"><path d="M700,560 v-190"/><path d="M900,560 v-190"/></g>';
      s += '<circle cx="700" cy="560" r="42" fill="#f6efe0" opacity="0.9"/><circle cx="900" cy="560" r="42" fill="#f6efe0" opacity="0.9"/>';
      s += '<rect x="1180" y="470" width="220" height="330" rx="10" fill="#b9b5ad" opacity="0.85"/>';
    } else if (spec.v === "bedroom" || spec.v === "kids" || spec.v === "attic") {
      const bw = spec.v === "kids" ? 520 : 740, bx = 780 - bw / 2;
      s += '<ellipse cx="780" cy="930" rx="' + (bw * 0.9) + '" ry="130" fill="#b9ab93" opacity="0.38"/>';
      s += '<rect x="' + bx + '" y="622" width="' + bw + '" height="76" rx="16" fill="#cfc7b8"/>';
      s += '<rect x="' + bx + '" y="690" width="' + bw + '" height="210" rx="20" fill="#f2efe8"/>';
      s += '<rect x="' + bx + '" y="690" width="' + bw + '" height="72" rx="18" fill="#e6e1d6"/>';
      s += '<rect x="' + (bx + 34) + '" y="650" width="' + (bw * 0.36) + '" height="68" rx="16" fill="#fff" opacity="0.95"/>';
      s += '<rect x="' + (bx + bw * 0.56) + '" y="650" width="' + (bw * 0.36) + '" height="68" rx="16" fill="#fff" opacity="0.95"/>';
      s += '<rect x="' + bx + '" y="846" width="' + bw + '" height="54" rx="12" fill="' + A + '" opacity="0.5"/>';
      s += '<rect x="' + (bx - 150) + '" y="770" width="116" height="104" rx="12" fill="#7d6a4f"/>';
      s += '<rect x="' + (bx + bw + 34) + '" y="770" width="116" height="104" rx="12" fill="#7d6a4f"/>';
      s += '<circle cx="' + (bx - 92) + '" cy="722" r="30" fill="#f4ead6"/><circle cx="' + (bx + bw + 92) + '" cy="722" r="30" fill="#f4ead6"/>';
      if (spec.v !== "kids") s += '<rect x="' + (bx + bw * 0.2) + '" y="300" width="' + (bw * 0.6) + '" height="8" fill="#c7a97c" opacity="0.5"/>';
    } else if (spec.v === "bath") {
      s += '<rect x="' + (wx1 + 40) + '" y="' + (fy - 260) + '" width="420" height="260" rx="16" fill="#f3f1ec"/>';
      s += '<rect x="' + (wx1 + 40) + '" y="' + (fy - 260) + '" width="420" height="60" rx="16" fill="#e2ded6"/>';
      s += '<rect x="620" y="560" width="480" height="140" rx="46" fill="#f7f6f3"/><rect x="620" y="690" width="480" height="40" rx="14" fill="#e0dcd4"/>';
      s += '<path d="M1180,300 h240 v330 h-240 z" fill="#cfe0ea" opacity="0.28"/><path d="M1180,300 h240 v330 h-240 z" fill="none" stroke="#2b2f35" stroke-width="7"/>';
      s += '<rect x="1290" y="330" width="6" height="270" fill="#2b2f35" opacity="0.6"/>';
      s += '<g stroke="#8d8b86" stroke-width="6" fill="none"><path d="M860,540 v-60 h60"/></g>';
      s += '<rect x="' + (wx1 + 120) + '" y="240" width="260" height="150" rx="8" fill="#dfe6ea" opacity="0.7" stroke="#c6c2b9" stroke-width="6"/>';
    } else if (spec.v === "study" || spec.v === "office") {
      s += '<rect x="480" y="660" width="640" height="26" rx="8" fill="#7d6a4f"/>';
      s += '<rect x="510" y="686" width="18" height="180" fill="#7d6a4f"/><rect x="1072" y="686" width="18" height="180" fill="#7d6a4f"/>';
      s += '<rect x="700" y="580" width="200" height="80" rx="8" fill="#2b2f35"/><rect x="770" y="660" width="60" height="14" fill="#2b2f35"/>';
      s += '<rect x="1160" y="' + (fy - 300) + '" width="260" height="300" fill="#e6e1d7"/>';
      for (let i = 0; i < 4; i++) s += '<rect x="1160" y="' + (fy - 300 + i * 75) + '" width="260" height="8" fill="#7d6a4f" opacity="0.8"/>';
      for (let i = 0; i < 16; i++) s += '<rect x="' + (1176 + (i % 8) * 30) + '" y="' + (fy - 292 + Math.floor(i / 8) * 150) + '" width="' + (12 + r() * 10) + '" height="' + (44 + r() * 18) + '" fill="' + ["#a4907a", "#7f8a90", "#b6a68d", "#5f6a72"][Math.floor(r() * 4)] + '" opacity="0.85"/>';
      s += '<rect x="560" y="700" width="120" height="160" rx="16" fill="' + A + '" opacity="0.9"/>';
    } else if (spec.v === "hall" || spec.v === "stairs") {
      s += '<rect x="' + (wx1 + 60) + '" y="' + (fy - 330) + '" width="200" height="330" fill="#e5e0d6"/>';
      s += '<rect x="' + (wx1 + 60) + '" y="' + (fy - 330) + '" width="200" height="330" fill="none" stroke="#cbc5b9" stroke-width="5"/>';
      if (spec.v === "stairs") {
        for (let i = 0; i < 9; i++) {
          const sx = 780 + i * 62, sy = fy - i * 46;
          s += '<rect x="' + sx + '" y="' + (sy - 46) + '" width="62" height="14" fill="#a9885c"/><rect x="' + sx + '" y="' + (sy - 32) + '" width="62" height="32" fill="#c8a87c" opacity="0.6"/>';
        }
        s += '<path d="M780,' + (fy - 40) + ' L1340,' + (fy - 460) + '" stroke="#2b2f35" stroke-width="8" fill="none"/>';
      } else {
        s += '<rect x="820" y="640" width="420" height="30" rx="8" fill="#7d6a4f"/><rect x="840" y="670" width="14" height="190" fill="#7d6a4f"/><rect x="1206" y="670" width="14" height="190" fill="#7d6a4f"/>';
        s += '<circle cx="1030" cy="420" r="90" fill="none" stroke="#c7a97c" stroke-width="8" opacity="0.7"/>';
      }
    } else if (spec.v === "tech") {
      s += '<rect x="' + (wx1 + 80) + '" y="' + (fy - 300) + '" width="230" height="300" rx="10" fill="#dcdad5" stroke="#bdbab3" stroke-width="5"/>';
      s += '<rect x="' + (wx1 + 360) + '" y="' + (fy - 220) + '" width="150" height="220" rx="10" fill="#cfd4d8" stroke="#b3b8bc" stroke-width="5"/>';
      s += '<g stroke="#9aa0a6" stroke-width="10" fill="none" opacity="0.8"><path d="M' + (wx1 + 120) + ',300 h420"/><path d="M' + (wx1 + 120) + ',340 h300"/></g>';
      s += '<rect x="900" y="' + (fy - 160) + '" width="300" height="160" rx="8" fill="#e2e0da" stroke="#c3c0b9" stroke-width="5"/>';
    }

    /* framed art, pendant light, ambient */
    if (spec.v !== "tech" && spec.v !== "bath" && spec.v !== "kitchen") {
      const ax = wx1 + 90 + r() * 60, aw = 150 + r() * 70, ah = aw * (1.1 + r() * 0.4);
      s += '<rect x="' + ax + '" y="' + (240 + r() * 40) + '" width="' + aw + '" height="' + ah + '" fill="#f4f1e9" stroke="#c8c2b5" stroke-width="6"/>';
      s += '<rect x="' + (ax + 16) + '" y="' + (256 + r() * 40) + '" width="' + (aw - 32) + '" height="' + (ah - 32) + '" fill="' + ["#cbb99c", "#a9b3ab", "#bfae95", "#9aa3ae"][Math.floor(r() * 4)] + '" opacity="0.75"/>';
    }
    if (spec.v === "living" || spec.v === "kitchen" || spec.v === "hall") {
      const lx = spec.v === "kitchen" ? 800 : 640;
      s += '<line x1="' + lx + '" y1="150" x2="' + lx + '" y2="330" stroke="#2b2f35" stroke-width="4"/>';
      s += '<path d="M' + (lx - 54) + ',390 L' + (lx + 54) + ',390 L' + (lx + 34) + ',330 L' + (lx - 34) + ',330 Z" fill="#2b2f35"/>';
      s += '<ellipse cx="' + lx + '" cy="392" rx="54" ry="12" fill="#ffe7bd" opacity="0.85"/>';
      s += '<ellipse cx="' + lx + '" cy="440" rx="130" ry="60" fill="#ffe7bd" opacity="0.14"/>';
    }
    if (spec.v !== "tech" && spec.v !== "bath") {
      const px = spec.v === "kitchen" ? 1440 : 1400;
      s += '<rect x="' + (px - 40) + '" y="800" width="80" height="90" rx="10" fill="#b9a887"/>';
      s += '<g fill="#5f6f57" opacity="0.9"><ellipse cx="' + px + '" cy="720" rx="70" ry="90"/><ellipse cx="' + (px - 54) + '" cy="760" rx="46" ry="66"/><ellipse cx="' + (px + 52) + '" cy="754" rx="44" ry="62"/></g>';
    }
    s += '<rect x="0" y="' + (fy - 6) + '" width="' + W + '" height="46" fill="#000" opacity="0.10"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#warmLight)"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#grade)"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#vig)"/>';
    return wrap(W, H, defsInterior(K, spec), s);
  }

  /* --- PORTRAIT ------------------------------------------------------ */
  function portrait(spec) {
    const W = 900, H = 1200;
    /* An editorial portrait: a figure read as a silhouette against a bright
       window. No facial detail — the light does the work. */
    let s = '<rect width="' + W + '" height="' + H + '" fill="url(#room)"/>';
    /* window */
    const wx = 430, wy = 130, ww = 400, wh = 780;
    s += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" fill="url(#daylight)"/>';
    s += '<g opacity="0.28" fill="#8d9b86">' +
         '<ellipse cx="' + (wx + 120) + '" cy="' + (wy + wh * 0.62) + '" rx="130" ry="180"/>' +
         '<ellipse cx="' + (wx + 320) + '" cy="' + (wy + wh * 0.7) + '" rx="110" ry="150"/></g>';
    s += '<rect x="' + (wx + ww / 2 - 5) + '" y="' + wy + '" width="10" height="' + wh + '" fill="#202226" opacity="0.8"/>';
    s += '<rect x="' + wx + '" y="' + (wy + wh * 0.42) + '" width="' + ww + '" height="10" fill="#202226" opacity="0.8"/>';
    s += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" fill="none" stroke="#1c1e22" stroke-width="14"/>';
    /* light spill on the floor + wall */
    s += '<path d="M' + wx + ',' + (wy + wh) + ' L' + (wx + ww) + ',' + (wy + wh) + ' L' + (wx + ww + 150) + ',' + H + ' L' + (wx - 260) + ',' + H + ' Z" fill="url(#spill)"/>';
    s += '<rect x="0" y="' + (H - 240) + '" width="' + W + '" height="240" fill="#241f1a" opacity="0.5"/>';
    /* figure — dark silhouette, three-quarter turn */
    s += '<g fill="#191a1e">' +
      '<path d="M120,1200 C120,980 150,880 232,832 C286,800 330,792 356,792 C382,792 430,802 476,832 C556,884 580,980 580,1200 Z"/>' +
      '<ellipse cx="352" cy="700" rx="86" ry="102"/>' +
      '<path d="M318,772 h72 v70 h-72 z"/>' +
      '<path d="M164,1200 C168,1010 196,918 250,876 L250,1200 Z" opacity="0.6"/>' +
      '</g>';
    /* rim light along the window side of the figure */
    s += '<g fill="none" stroke="#e7c99a" stroke-width="7" opacity="0.75" stroke-linecap="round">' +
      '<path d="M420,824 C500,880 546,986 556,1130"/>' +
      '<path d="M402,626 C446,654 454,708 428,760"/></g>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#warmLight)"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#vig)"/>';
    const d = '<defs>' +
      '<linearGradient id="room" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#42392f"/><stop offset="0.55" stop-color="#2e2822"/><stop offset="1" stop-color="#1e1a17"/></linearGradient>' +
      '<linearGradient id="daylight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf3e4"/><stop offset="0.46" stop-color="#f2e6cf"/><stop offset="0.48" stop-color="#dcdfcd"/><stop offset="1" stop-color="#b9c2ab"/></linearGradient>' +
      '<linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeccb" stop-opacity="0.34"/><stop offset="1" stop-color="#ffeccb" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="warmLight" cx="0.62" cy="0.34" r="0.72"><stop offset="0" stop-color="#ffe9c4" stop-opacity="0.30"/><stop offset="1" stop-color="#ffe9c4" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="vig" cx="0.46" cy="0.44" r="0.8"><stop offset="0.44" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#100e0c" stop-opacity="0.62"/></radialGradient>' +
      '</defs>';
    return wrap(W, H, d, s);
  }

  /* --- defs ---------------------------------------------------------- */
  function defs(L, spec) {
    return '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + L.sky[0] + '"/><stop offset="0.42" stop-color="' + L.sky[1] + '"/>' +
        '<stop offset="0.74" stop-color="' + L.sky[2] + '"/><stop offset="1" stop-color="' + L.sky[3] + '"/></linearGradient>' +
      '<radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="' + L.sun + '" stop-opacity="0.85"/><stop offset="0.45" stop-color="' + L.sun + '" stop-opacity="0.28"/><stop offset="1" stop-color="' + L.sun + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + L.ground + '"/><stop offset="1" stop-color="#1e2128"/></linearGradient>' +
      '<linearGradient id="facade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.42"/><stop offset="0.6" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#000000" stop-opacity="0.22"/></linearGradient>' +
      '<linearGradient id="glassGrad" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#2c3540" stop-opacity="0.92"/><stop offset="1" stop-color="#4d5a66" stop-opacity="0.86"/></linearGradient>' +
      '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e8fa0"/><stop offset="1" stop-color="#3c5566"/></linearGradient>' +
      '<linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a97c" stop-opacity="0.75"/><stop offset="1" stop-color="#7a6448" stop-opacity="0.9"/></linearGradient>' +
      '<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="' + (L.sun) + '" stop-opacity="0"/><stop offset="0.62" stop-color="' + L.sun + '" stop-opacity="' + (0.05 + L.warm * 0.16) + '"/><stop offset="1" stop-color="' + L.sun + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="vig" cx="0.5" cy="0.44" r="0.8"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#101216" stop-opacity="0.42"/></radialGradient>' +
      '</defs>';
  }

  function defsInterior(K, spec) {
    return '<defs>' +
      '<linearGradient id="wallGrad" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/><stop offset="0.55" stop-color="#000000" stop-opacity="0.04"/><stop offset="1" stop-color="#000000" stop-opacity="0.20"/></linearGradient>' +
      '<linearGradient id="floorGrad" x1="0" y1="0" x2="0.18" y2="1"><stop offset="0" stop-color="' + K.floor[0] + '"/><stop offset="0.5" stop-color="' + K.floor[1] + '"/><stop offset="1" stop-color="' + (K.floor[2] || K.floor[1]) + '"/></linearGradient>' +
      '<linearGradient id="grade" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#ffca7e" stop-opacity="0.13"/><stop offset="0.55" stop-color="#ffca7e" stop-opacity="0"/><stop offset="1" stop-color="#22303f" stop-opacity="0.18"/></linearGradient>' +
      '<linearGradient id="outGarden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ee"/><stop offset="0.46" stop-color="#f2f0e2"/><stop offset="0.5" stop-color="#b7c4a6"/><stop offset="1" stop-color="#7f9070"/></linearGradient>' +
      '<linearGradient id="outForest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f6ee"/><stop offset="0.38" stop-color="#dfe4d6"/><stop offset="0.42" stop-color="#8fa085"/><stop offset="1" stop-color="#5a6b52"/></linearGradient>' +
      '<linearGradient id="outCity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfaf6"/><stop offset="0.5" stop-color="#eef1f3"/><stop offset="0.54" stop-color="#bcc6cd"/><stop offset="1" stop-color="#98a4ad"/></linearGradient>' +
      '<linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/><stop offset="0.4" stop-color="#ffffff" stop-opacity="0.04"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.16"/></linearGradient>' +
      '<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2dc" stop-opacity="' + (0.18 + K.warm * 0.22) + '"/><stop offset="1" stop-color="#fff6e4" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="warmLight" cx="0.44" cy="0.26" r="0.72"><stop offset="0" stop-color="#ffd9a4" stop-opacity="' + (0.07 + K.warm * 0.13) + '"/><stop offset="1" stop-color="#ffd9a4" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="vig" cx="0.5" cy="0.48" r="0.76"><stop offset="0.44" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#171410" stop-opacity="0.44"/></radialGradient>' +
      '</defs>';
  }

  function wrap(w, h, d, body) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice">' + d + body + '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  return function scene(spec) {
    const key = JSON.stringify(spec);
    if (cache.has(key)) return cache.get(key);
    let out;
    if (spec.k === "portrait") out = portrait(spec);
    else if (spec.k === "interior") out = interior(spec);
    else out = exterior(spec);
    cache.set(key, out);
    return out;
  };
})();

// ---------------------------------------------------------------------------
// Utilities, shared with the HTML build
// ---------------------------------------------------------------------------
/* Queries are scoped to the mounted root, never to the whole document: a
   Framer page may hold more than one instance of this component. */
let ROOT: any = null
const $ = (s: string, r?: any) => (r || ROOT || document).querySelector(s)
const $$ = (s: string, r?: any) =>
    Array.prototype.slice.call((r || ROOT || document).querySelectorAll(s))
/* Framer renders published pages on the server first, where there is no window
   at all, so these are asked for defensively. The browser loads its own copy of
   this module and gets the real answers before any of it is used. */
const mq = (q: string) =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q).matches : false;
const reduceMotion = mq("(prefers-reduced-motion: reduce)");
const canHover = mq("(hover: hover) and (pointer: fine)");

const usd = n => "$" + new Intl.NumberFormat("en-US").format(n);
const num = (n, d) => new Intl.NumberFormat("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }).format(n);
const sqft = n => num(n) + " sq ft";
/* Feet as a US listing writes them: 23.36 -> 23'4" */
function ftIn(ft) {
  const whole = Math.floor(ft);
  const inches = Math.round((ft - whole) * 12);
  return (inches === 12 ? whole + 1 : whole) + "'" + (inches === 12 ? 0 : inches) + '"';
}
const dims = r => ftIn(r.width) + " × " + ftIn(r.length);
/* Bedrooms and baths, the way a listing states them */
function dispo(p) {
  if (!p.beds && !p.baths) return "—";
  if (!p.beds) return p.baths + " bath";
  return p.beds + " bed · " + p.baths + " bath";
}
const pad2 = n => String(n).padStart(2, "0");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* The builders below read these three. The effect assigns them right before it
   renders, so a page holding two instances still draws each from its own props. */
let PROPERTIES: any[] = []
let AGENT: any = {}
let TESTIMONIALS: any[] = []
let SHOW: any = {}
/* Every heading on a property page. The fallbacks are the shipped copy; the
   effect overwrites DETAIL_LABELS from ⑨ Detail Page before it renders, and a
   field the buyer clears falls back rather than leaving a blank heading.
   {type} becomes apartment, suite or house, whichever the listing is. */
const DETAIL_LABEL_FALLBACK = {
  videoEyebrow:     "Video",
  videoHeading:     "Walk through it\non film.",
  galleryEyebrow:   "Gallery",
  galleryHeading:   "Take a look inside.",
  roomsEyebrow:     "Explore the {type}",
  roomsHeading:     "Every room,\ndown to the inch.",
  roomsLede:        "Hover a room and its exact area, dimensions, compass orientation, ceiling height and flooring appear. Click to open the full detail.",
  planEyebrow:      "Floor plan",
  planHeading:      "The whole layout,\nwired to every room.",
  planHeadingList:  "The whole layout,\nroom by room.",
  featuresEyebrow:  "Features",
  featuresHeading:  "What comes with it.",
  locationEyebrow:  "Location",
  locationHeading:  "Where you would live.",
  similarEyebrow:   "Similar properties",
  similarHeading:   "You might also like.",
}
let DETAIL_LABELS: any = {}
/* Whether a pin opens Google Maps, and the town or region added to the search
   so "Post office" does not land on the other side of the country. */
let MAP_LINKS = true
let MAP_REGION = ""

/* Compass points — one place that defines both the label and the angle */
const ORI = {
  N:  { code: "N",  label: "North",     deg: 0   },
  NE: { code: "NE", label: "Northeast", deg: 45  },
  E:  { code: "E",  label: "East",      deg: 90  },
  SE: { code: "SE", label: "Southeast", deg: 135 },
  S:  { code: "S",  label: "South",     deg: 180 },
  SW: { code: "SW", label: "Southwest", deg: 225 },
  W:  { code: "W",  label: "West",      deg: 270 },
  NW: { code: "NW", label: "Northwest", deg: 315 }
};

/* An uploaded photograph always wins; the drawn scene is what fills the gap. */
function mkRoom(o: any) {
  o.orientation = ORI[o.ori] || ORI.S;
  if (o.ceilingHeight == null) o.ceilingHeight = 9.0;
  o.level = o.level || "l1";
  o.image = o.image || Scenery(o.img);
  return o;
}
function mkProperty(p: any) {
  p.rooms = (p.rooms || []).map(mkRoom);
  p.images = (p.images || []).map(im => ({
    src: im.src || Scenery(im.spec), spec: im.spec, caption: im.caption, uploaded: !!im.src
  }));
  p.cover = p.images.length ? p.images[0].src : "";
  return p;
}


/* ---------------------------------------------------------------------------
   Floor plans. Polygons are geometry, not copy — there is no sane way to draw
   them in a properties panel — so the two demo plans live here and a listing
   picks one by name. Rooms map to polygons in order: room 1 to the first
   polygon, room 2 to the second. Extra rooms beyond the polygon count still
   appear as cards, they simply have no shape on the plan.
   --------------------------------------------------------------------------- */
const rect = (x1: number, y1: number, x2: number, y2: number) =>
    [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]

/* ---------- a plan laid out from the rooms themselves -------------
   The alternative to uploading a drawing: each room carries its position and
   size in feet, floors come from the Floor field, and the plan is drawn to
   scale from that. Rooms nobody has placed yet are tiled into rows, so the
   plan reads as a plan from the first click and the owner nudges from there. */
const PLAN_UPF = 14   /* svg units per foot */
const PLAN_PAD = 40

function buildRoomPlan(rooms: any[], floorOrder?: string[]) {
  const order: string[] = [], byFloor: any = {}
  ;(rooms || []).forEach(function (r: any) {
    const name = r.floor || "Floor"
    if (!byFloor[name]) { byFloor[name] = []; order.push(name) }
    byFloor[name].push(r)
  })
  /* A measured floor list decides the order of the tabs; anything it does not
     mention keeps its place at the end. */
  if (floorOrder && floorOrder.length) {
    order.sort(function (a, b) {
      const ia = floorOrder.indexOf(a), ib = floorOrder.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
  }

  const plan: any = { unitsPerFoot: PLAN_UPF, levels: [] }
  order.forEach(function (name, li) {
    const id = "g" + li
    const sized = byFloor[name].map(function (r: any) {
      return {
        room: r,
        w: +r.planW || +r.width || 0,
        h: +r.planH || +r.length || 0,
        x: +r.planX || 0,
        y: +r.planY || 0,
      }
    }).filter((s: any) => s.w > 0 && s.h > 0)
    if (!sized.length) return

    if (!sized.some((s: any) => s.x > 0 || s.y > 0)) {
      /* wrap at roughly the width of a square of the same total area */
      const total = sized.reduce((a: number, s: any) => a + s.w * s.h, 0)
      const wrapAt = Math.max(24, Math.sqrt(total) * 1.3)
      let cx = 0, cy = 0, rowH = 0
      sized.forEach(function (s: any) {
        if (cx > 0 && cx + s.w > wrapAt) { cx = 0; cy += rowH; rowH = 0 }
        s.x = cx; s.y = cy; cx += s.w; rowH = Math.max(rowH, s.h)
      })
    }

    let maxX = 0, maxY = 0
    sized.forEach(function (s: any) { maxX = Math.max(maxX, s.x + s.w); maxY = Math.max(maxY, s.y + s.h) })
    const at = (v: number) => Math.round(PLAN_PAD + v * PLAN_UPF)
    sized.forEach(function (s: any) {
      s.room.level = id
      s.room.polygon = rect(at(s.x), at(s.y), at(s.x + s.w), at(s.y + s.h))
      s.room.labelAt = null
    })
    plan.levels.push({
      id: id, label: name, walls: true,
      viewBox: "0 0 " + (at(maxX) + PLAN_PAD + 60) + " " + (at(maxY) + PLAN_PAD + 46),
      outline: [],
    })
  })
  return plan.levels.length ? plan : null
}

const FLOOR_PLANS: any = {
  villa: {
    unitsPerFoot: 15.24,
    levels: [
      { id: "l1", label: "1st Floor", viewBox: "0 0 700 546",
        outline: [rect(40, 40, 610, 486)],
        windows: [[80,486,180,486],[200,486,300,486],[320,486,386,486],[40,240,40,330],[40,70,40,155],[90,40,200,40],[290,40,370,40],[610,70,610,150],[430,486,520,486],[540,486,590,486],[610,320,610,430],[610,200,610,255]],
        doors:   [[396,300,"v"],[396,120,"v"],[268,120,"h"],[500,271,"h"],[500,185,"h"]],
        entry:   [610, 160, 610, 184],
        stairs:  { x: 402, y: 190, w: 202, h: 76, steps: 6, dir: "up" }
      },
      { id: "l2", label: "2nd Floor", viewBox: "0 0 700 546",
        outline: [rect(40, 40, 610, 370)],
        terrace: rect(40, 376, 610, 486),
        windows: [[340,370,450,370],[480,370,580,370],[610,200,610,320],[70,370,210,370],[40,200,40,300],[610,70,610,140],[80,40,200,40]],
        doors:   [[305,260,"v"],[242,260,"v"],[420,110,"v"],[300,169,"h"]],
        stairs:  { x: 250, y: 60, w: 78, h: 100, steps: 6, dir: "down" }
      }
    ]
  }
  /* There was a generated single-floor plan here. A whole apartment squeezed
     into one drawing put its labels outside the rooms and read worse than no
     plan at all, so it is gone: a listing either uses the two-storey demo, or
     the owner's own drawing goes in Floor Plan Drawing, or the section is the
     room text boxes alone. A stored "penthouse" value now finds nothing here
     and falls through to the last of those. */
}

/* which polygon and level each room of a plan takes, in order */
const PLAN_SLOTS: any = {
  villa: [
    ["l1", rect(396, 40, 610, 185), null],
    ["l1", rect(40, 185, 396, 486), null],
    ["l1", rect(396, 271, 610, 486), null],
    ["l1", rect(40, 40, 268, 185), null],
    ["l2", rect(305, 169, 610, 370), null],
    ["l2", rect(420, 40, 610, 169), null],
    ["l2", rect(40, 169, 242, 370), null],
    ["l1", rect(268, 40, 396, 185), null],
    ["l1", rect(396, 185, 610, 271), null],
    ["l2", rect(40, 40, 242, 169), null],
    ["l2", [[242,40],[420,40],[420,169],[305,169],[305,370],[242,370]], [331, 112]],
    ["l2", rect(40, 376, 610, 486), null]
  ]
}

// ---------------------------------------------------------------------------
// Icons and the string builders that draw the page
// ---------------------------------------------------------------------------
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  arrowUR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 15 6-6 6 6-6 6z" transform="translate(3 -6)"/><path d="M2.5 16.5 16.5 2.5l5 5-14 14z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/></svg>',
  height: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="m8 6 4-3 4 3"/><path d="m8 18 4 3 4-3"/></svg>',
  window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/></svg>',
  floor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M6 20v-5h5v5"/><path d="M13 20V9h5v11"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/></svg>',
  compassI: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  plank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="5" rx="1"/><rect x="3" y="14" width="18" height="5" rx="1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 5C6.5 6.6 4.6 9.4 4.6 12.6c0 3.5 2 5.9 4.7 5.9 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.4 0-.9.1-1 .1.3-1.7 1.9-3.6 3.9-4.6L9.5 5Zm9 0c-3 1.6-4.9 4.4-4.9 7.6 0 3.5 2 5.9 4.7 5.9 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.4 0-.9.1-1 .1.3-1.7 1.9-3.6 3.9-4.6L18.5 5Z"/></svg>',
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-4.6-3l-1.6-4a1.5 1.5 0 0 1 2.5-1.5L9 14"/></svg>'
};

const POI_ICON = {
  home:        "M4 11 12 4l8 7v9h-6v-5h-4v5H4z",
  city:        "M3 21V9l6-4 6 4v12M9 21v-4h4v4M17 21V12h4v9",
  school:      "M12 4 3 9l9 5 9-5-9-5ZM7 12v5c0 1 2.5 2.5 5 2.5S17 18 17 17v-5",
  kindergarten:"M5 20h14M7 20V9l5-4 5 4v11M10 20v-4h4v4",
  shop:        "M4 8h16l-1 12H5L4 8Zm4 0V6a4 4 0 0 1 8 0v2",
  market:      "M4 9h16l-1 11H5L4 9Zm2 0 2-5h8l2 5M9 13h6",
  post:        "M3 6h18v12H3zM3 7l9 6 9-6",
  police:      "M12 3 4 6v6c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6l-8-3Zm0 6v4m-2-2h4",
  hospital:    "M4 7h16v13H4zM10 3h4v4h-4zM12 11v6m-3-3h6",
  pharmacy:    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8m-4-4h8",
  restaurant:  "M7 3v8m0 0a3 3 0 0 0 3-3V3M7 11v10M17 3c-1.5 2-2 4-2 6s.5 3 2 3v9",
  food:        "M7 3v8m0 0a3 3 0 0 0 3-3V3M7 11v10M17 3c-1.5 2-2 4-2 6s.5 3 2 3v9",
  cafe:        "M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a2.5 2.5 0 0 1 0 5h-2M6 3v2M10 3v2M14 3v2",
  park:        "M12 3 6 13h12L12 3Zm0 6-4 7h8l-4-7Zm0 7v5",
  nature:      "M12 3 6 13h12L12 3Zm0 6-4 7h8l-4-7Zm0 7v5",
  playground:  "M4 20 8 5M12 20 8 5M8 8h9M17 5v15M14 14h6",
  gym:         "M4 9v6M8 6v12M16 6v12M20 9v6M8 12h8",
  bank:        "M12 3l9 5H3zM5 10v9M9 10v9M15 10v9M19 10v9M3 21h18",
  transport:   "M6 4h12v11H6zM6 15l-1 4M18 15l1 4M8 8h8",
  train:       "M6 4h12v11H6zM6 15l-1 4M18 15l1 4M8 8h8",
  bus:         "M4 5h16v10H4zM4 15v3h3v-3M17 15v3h3v-3M8 9h8M6 5V3h12v2",
  metro:       "M12 3 5 9v8h14V9l-7-6ZM5 21h14M9 12h6",
  parking:     "M5 4h14v16H5zM10 8h3a2 2 0 0 1 0 4h-3v4",
  fuel:        "M5 20V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v15M4 20h11M13 9h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-2-2",
  church:      "M12 3v4M10 5h4M6 21V11l6-4 6 4v10M10 21v-5h4v5",
  library:     "M4 5h6v14H4zM10 5h5v14h-5zM16 6l3.5 13",
  cinema:      "M4 6h16v12H4zM4 10h16M8 6v4M12 6v4M16 6v4",
  office:      "M4 21V4h10v17M14 9h6v12M7 8h3M7 12h3M7 16h3M17 13h1M17 17h1",
  hotel:       "M4 20V8h16v12M4 14h16M8 11h2M6 8V5h12v3",
  beach:       "M3 20h18M12 20V9M12 9c-4 0-7 2-8 4h16c-1-2-4-4-8-4Z",
  airport:     "M2 12 22 5l-7 20-3-8-8-3z"
};

function compassSVG(deg, size) {
  const s = size || 52, cls = s < 45 ? "compass compass--sm" : "compass";
  const c = s / 2, r = c - 4;
  let ticks = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 - 90) * Math.PI / 180;
    const inner = i % 2 === 0 ? r - 5 : r - 3.5;
    ticks += '<line x1="' + (c + Math.cos(a) * inner) + '" y1="' + (c + Math.sin(a) * inner) + '" x2="' + (c + Math.cos(a) * r) + '" y2="' + (c + Math.sin(a) * r) + '" stroke="rgba(21,22,26,0.22)" stroke-width="1"/>';
  }
  return '<svg class="' + cls + '" viewBox="0 0 ' + s + ' ' + s + '" role="img" aria-hidden="true" style="width:' + s + 'px;height:' + s + 'px">' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="rgba(255,255,255,0.5)" stroke="rgba(21,22,26,0.14)"/>' + ticks +
    '<text x="' + c + '" y="' + (c - r + 8) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="' + (s * 0.17) + '" fill="rgba(21,22,26,0.42)">N</text>' +
    '<g class="compass__needle" style="transform-origin:' + c + 'px ' + c + 'px; transform:rotate(' + deg + 'deg)">' +
      '<path d="M' + c + ',' + (c - r + 6) + ' L' + (c + 4.5) + ',' + (c + 2) + ' L' + c + ',' + (c - 1) + ' L' + (c - 4.5) + ',' + (c + 2) + ' Z" fill="#b08d57"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="1.8" fill="#15161a"/>' +
    '</g></svg>';
}

/* Hero imagery: portrait crop for phones, wide crop everywhere else. */
/* Takes either a gallery entry ({ src, spec }) or a bare stand-in spec. A real
   photograph wins over the drawing, and one file serves both crops — cropping
   someone's own photo to a phone-shaped frame is the browser's job here, not
   ours. */
/* ---------- video ------------------------------------------------
   A property's tour arrives as an address rather than a file, because
   ControlType.File cannot live inside a list in Framer. A YouTube or Vimeo
   link becomes an embed, a direct .mp4 plays inline, and anything else is
   offered as a button rather than guessed at. The hero, not being in a list,
   takes a real upload. */
function videoSource(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  const yt = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/.exec(u);
  if (yt) return { kind: "embed", src: "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0" };
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(u);
  if (vm) return { kind: "embed", src: "https://player.vimeo.com/video/" + vm[1] };
  if (/^data:video\//i.test(u) || /\.(mp4|webm|ogv|m4v|mov)(\?|#|$)/i.test(u)) return { kind: "file", src: u };
  return { kind: "link", src: u };
}

function videoFrameHTML(url, poster, label) {
  const v = videoSource(url);
  if (!v) return "";
  if (v.kind === "embed") {
    return '<div class="video-frame glass reveal"><iframe src="' + esc(v.src) + '" title="' + esc(label) +
      '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
  }
  if (v.kind === "file") {
    return '<div class="video-frame glass reveal"><video src="' + esc(v.src) + '" controls playsinline preload="metadata"' +
      (poster ? ' poster="' + esc(poster) + '"' : "") + '></video></div>';
  }
  return '<div class="video-frame video-frame--link glass reveal">' +
    '<a class="btn magnetic" href="' + esc(v.src) + '" target="_blank" rel="noopener">' + esc(label) + " " +
    ICON.arrow.replace("<svg", '<svg class="btn__arrow"') + '</a></div>';
}

function heroPicture(image, alt) {
  if (image && image.uploaded && image.src) {
    return '<picture><img src="' + image.src + '" alt="' + esc(alt) + '"></picture>';
  }
  const spec = image && image.spec ? image.spec : image;
  const wide = Scenery(spec);
  const tall = Scenery(Object.assign({}, spec, { tall: true }));
  return '<picture>' +
    '<source media="(max-width:720px)" srcset="' + tall + '">' +
    '<img src="' + wide + '" alt="' + esc(alt) + '">' +
  '</picture>';
}

/* Observers are registered here so the effect can disconnect every one of them
   when the instance re-renders. */
let ALL_OBSERVERS: any[] = []
const OBS = (o: any) => { ALL_OBSERVERS.push(o); return o }

/* ---------- scroll reveal ---------------------------------------- */
let revealObserver = null;
function observeReveals(root) {
  const nodes = $$(".reveal:not(.is-in)", root || document);
  if (reduceMotion || !("IntersectionObserver" in window)) { nodes.forEach(n => n.classList.add("is-in")); return; }
  if (!revealObserver) {
    revealObserver = OBS(new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const siblings = Array.prototype.slice.call(e.target.parentNode.children).filter(n => n.classList.contains("reveal"));
        const i = Math.min(siblings.indexOf(e.target), 6);
        e.target.style.setProperty("--d", (i > 0 ? i * 70 : 0) + "ms");
        e.target.classList.add("is-in");
        revealObserver.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }));
  }
  nodes.forEach(n => revealObserver.observe(n));
}

const fmtPrice = p => p.mode === "rent" ? usd(p.price) + " / month" : usd(p.price);
const shortPrice = p => p.mode === "rent" ? usd(p.price) + "/mo" : (p.price >= 1e6 ? "$" + num(p.price / 1e6, 2).replace(/0$/, "").replace(/\.$/, "") + "M" : usd(p.price));
const toneClass = t => t === "green" ? "" : t === "amber" ? " tag__dot--amber" : " tag__dot--slate";

function propertyCard(p) {
  const specs = [];
  if (p.beds || p.baths) specs.push({ v: dispo(p), l: "Layout" });
  if (p.totalArea) specs.push({ v: sqft(p.totalArea), l: "Interior" });
  if (p.lotArea) specs.push({ v: sqft(p.lotArea), l: "Lot" });
  if (p.terraceArea) specs.push({ v: sqft(p.terraceArea), l: "Terrace" });
  const roomCount = p.rooms.length;

  return '<a class="prop-card reveal" href="#/property/' + p.slug + '" data-slug="' + p.slug + '" aria-label="' + esc(p.title + ", " + p.location + ", " + fmtPrice(p)) + '">' +
    '<div class="prop-card__media">' +
      '<img src="' + p.cover + '" alt="' + esc(p.title + " — " + p.location) + '" loading="lazy" decoding="async">' +
      '<div class="prop-card__shade"></div>' +
      '<div class="prop-card__tags">' +
        '<span class="tag"><span class="tag__dot' + toneClass(p.statusTone) + '"></span>' + esc(p.status) + '</span>' +
        '<span class="tag tag--solid">' + esc(p.type) + '</span>' +
        (p.floorPlan ? '<span class="tag tag--accent tag--plan">Interactive plan</span>' : "") +
      '</div>' +
      '<div class="prop-card__over">' +
        '<div><div class="prop-card__loc">' + esc(p.location) + '</div><div class="prop-card__title">' + esc(p.title) + '</div></div>' +
        '<span class="prop-card__view" aria-hidden="true">' + ICON.arrowUR + '</span>' +
      '</div>' +
      '<div class="prop-card__reveal" aria-hidden="true">' +
        '<span class="mono">' + (roomCount ? pad2(roomCount) + " rooms" : "Land") + '</span>' +
        '<span>View property ' + ICON.arrowUR.replace("<svg", '<svg style="display:inline-block;width:13px;height:13px;vertical-align:-2px"') + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="prop-card__body">' +
      '<div class="prop-card__price">' + esc(fmtPrice(p)) + '<small>' + esc(p.locationNote) + '</small></div>' +
      '<div class="prop-card__specs">' + specs.map(s => '<div class="spec"><div class="spec__v">' + esc(s.v) + '</div><div class="spec__l">' + esc(s.l) + '</div></div>').join("") + '</div>' +
    '</div>' +
  '</a>';
}

function renderFeatured() {
  const grid = $("#featuredGrid");
  if (!grid) return;
  const list = PROPERTIES.filter(p => p.featured).slice(0, 5);
  grid.innerHTML = list.map(propertyCard).join("");
  observeReveals(grid);
}

function renderTestimonials() {
  const rail = $("#tsmRail");
  if (!rail) return;
  rail.innerHTML = TESTIMONIALS.map(function (t) {
    return '<figure class="tsm__card glass">' +
      '<span class="tsm__mark" aria-hidden="true">' + ICON.quote + '</span>' +
      '<blockquote class="tsm__quote">„' + esc(t.quote) + '“</blockquote>' +
      '<figcaption class="tsm__foot">' +
        '<div class="tsm__who"><b>' + esc(t.who) + '</b><span>' + esc(t.where) + '</span></div>' +
        '<span class="stars" aria-label="Rated ' + t.stars + " out of 5" + '">' + Array(t.stars).fill('<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>').join("") + '</span>' +
      '</figcaption></figure>';
  }).join("");
}

function centroid(poly) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i], p2 = poly[(i + 1) % poly.length];
    const f = p1[0] * p2[1] - p2[0] * p1[1];
    a += f; cx += (p1[0] + p2[0]) * f; cy += (p1[1] + p2[1]) * f;
  }
  a *= 0.5;
  return a === 0 ? [poly[0][0], poly[0][1]] : [cx / (6 * a), cy / (6 * a)];
}
const pts = poly => poly.map(p => p[0] + "," + p[1]).join(" ");
const samePoly = (a, b) => !!a && !!b && pts(a) === pts(b);

function floorPlanSVG(property, levelId) {
  const level = property.floorPlan.levels.filter(l => l.id === levelId)[0];
  const rooms = property.rooms.filter(r => r.level === levelId && r.polygon);
  const vb = level.viewBox.split(" ").map(Number);
  let s = '<svg class="plan__svg" id="planSvg" viewBox="' + level.viewBox + '" role="group" aria-label="Interactive floor plan — ' + esc(level.label) + '">';
  s += '<g class="plan__zoomer" id="planZoomer">';

  /* outline + terrace */
  level.outline.forEach(o => { s += '<polygon class="fp-outline" points="' + pts(o) + '"/>'; });
  if (level.terrace) s += '<polygon class="fp-outline fp-outline--terrace" points="' + pts(level.terrace) + '"/>';

  /* stairs sit under the room fills so a label never collides with them */
  if (level.stairs) {
    const st = level.stairs, step = st.h / st.steps;
    for (let i = 0; i <= st.steps; i++) s += '<line class="fp-stairs" x1="' + st.x + '" y1="' + (st.y + i * step) + '" x2="' + (st.x + st.w) + '" y2="' + (st.y + i * step) + '"/>';
    s += '<line class="fp-stairs" x1="' + (st.x + st.w / 2) + '" y1="' + (st.y + 4) + '" x2="' + (st.x + st.w / 2) + '" y2="' + (st.y + st.h - 4) + '" stroke-dasharray="4 4"/>';
  }

  /* rooms */
  rooms.forEach(function (r) {
    const c = r.labelAt || centroid(r.polygon);
    const xs = r.polygon.map(q => q[0]), ys = r.polygon.map(q => q[1]);
    const bw = Math.max.apply(null, xs) - Math.min.apply(null, xs);
    const bh = Math.max.apply(null, ys) - Math.min.apply(null, ys);
    /* A room-built plan has no outline polygon, so the rooms carry the walls.
       And with no terrace polygon to compare against, a missing ceiling is
       what marks a room as outdoors. */
    const isTerrace = samePoly(r.polygon, level.terrace) || (level.walls && !r.ceilingHeight);
    /* narrow rooms get a smaller label; very narrow ones drop the name */
    const nameSize = bw < 150 ? 11.5 : bw < 210 ? 13 : 15;
    const showName = bw > 96 && bh > 62;
    const showOri = bw > 150 && bh > 110;
    s += '<g class="fp-room" data-room="' + r.id + '" tabindex="0" role="button" ' +
         'aria-label="' + esc(r.name + ", " + sqft(r.area) + ", facing " + r.orientation.label) + '">' +
      '<polygon class="fp-room__shape' + (level.walls ? " fp-room__shape--wall" : "") + '" points="' + pts(r.polygon) + '"' + (isTerrace ? ' style="fill:rgba(var(--champagne-rgb),0.14);stroke-dasharray:10 8"' : "") + '/>' +
      '<text class="fp-room__no" x="' + c[0] + '" y="' + (c[1] - (showName ? 26 : 6)) + '">' + pad2(r.no) + '</text>' +
      (showName ? '<text class="fp-room__name" x="' + c[0] + '" y="' + (c[1] - 4) + '" style="font-size:' + nameSize + 'px">' + esc(r.name) + '</text>' : "") +
      '<text class="fp-room__label" x="' + c[0] + '" y="' + (c[1] + (showName ? 20 : 16)) + '" style="font-size:' + (bw < 150 ? 11 : 13) + 'px">' + num(r.area) + ' sq ft</text>' +
      (showOri ? '<text class="fp-room__ori" x="' + c[0] + '" y="' + (c[1] + 40) + '">' + esc(r.orientation.label.toUpperCase()) + '</text>' : "") +
    '</g>';
  });

  /* windows / doors / entry / stairs */
  (level.windows || []).forEach(w => { s += '<line class="fp-window" x1="' + w[0] + '" y1="' + w[1] + '" x2="' + w[2] + '" y2="' + w[3] + '"/>'; });
  (level.doors || []).forEach(function (d) {
    const x = d[0], y = d[1], horiz = d[2] === "h", L = 34;
    s += horiz
      ? '<path class="fp-door" d="M' + x + ',' + y + ' h' + L + ' a' + L + ',' + L + ' 0 0 1 -' + L + ',' + L + '"/>'
      : '<path class="fp-door" d="M' + x + ',' + y + ' v' + L + ' a' + L + ',' + L + ' 0 0 0 ' + L + ',-' + L + '"/>';
  });
  if (level.entry) {
    s += '<line class="fp-door" x1="' + level.entry[0] + '" y1="' + level.entry[1] + '" x2="' + level.entry[2] + '" y2="' + level.entry[3] + '" stroke="#b08d57" stroke-width="6" opacity="0.9"/>';
    const eLeft = level.entry[0] < vb[2] / 2;
    s += '<text class="fp-room__ori" style="opacity:1;text-anchor:' + (eLeft ? "start" : "end") + '" x="' + (eLeft ? 16 : vb[2] - 16) + '" y="' + (level.entry[1] + 18) + '">ENTRY</text>';
  }

  /* north arrow + scale bar */
  const nx = vb[2] - 42, ny = 74;
  s += '<g class="fp-north" transform="translate(' + nx + ',' + ny + ')">' +
    '<circle r="24" fill="rgba(255,255,255,0.5)" stroke="rgba(21,22,26,0.12)"/>' +
    '<path d="M0,-17 L5.5,4 L0,0.5 L-5.5,4 Z" fill="#b08d57"/>' +
    '<text y="-24" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="rgba(21,22,26,0.5)">N</text></g>';
  /* Right-aligned: the hover hint sits in the bottom-left corner of the stage
     and a left-aligned bar runs straight through it. */
  const sb = property.floorPlan.unitsPerFoot * 20, by = vb[3] - 24;   /* a 20 ft bar */
  const sx2 = vb[2] - 62, sx1 = sx2 - sb;
  s += '<g class="fp-north"><line x1="' + sx1 + '" y1="' + by + '" x2="' + sx2 + '" y2="' + by + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<line x1="' + sx1 + '" y1="' + (by - 5) + '" x2="' + sx1 + '" y2="' + (by + 5) + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<line x1="' + sx2 + '" y1="' + (by - 5) + '" x2="' + sx2 + '" y2="' + (by + 5) + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<text x="' + (sx2 + 10) + '" y="' + (by + 4) + '" font-family="IBM Plex Mono, monospace" font-size="12" fill="rgba(21,22,26,0.45)">20 ft</text></g>';

  s += '</g></svg>';
  return s;
}

function roomPanelHTML(r) {
  return '<div class="rp">' +
    '<div class="rp__media"><img src="' + r.image + '" alt="' + esc(r.name) + '" loading="lazy" decoding="async"></div>' +
    '<div class="rp__head"><div>' +
      '<div class="rp__no">Room ' + pad2(r.no) + '</div>' +
      '<div class="rp__name">' + esc(r.name) + '</div>' +
      '<div class="rp__area">' + sqft(r.area) + ' · ' + dims(r) + '</div>' +
    '</div>' + compassSVG(r.orientation.deg, 52) + '</div>' +
    '<dl class="rp__specs">' +
      '<div class="rp__spec"><dt>Facing</dt><dd>' + esc(r.orientation.label) + '</dd></div>' +
      '<div class="rp__spec"><dt>Floor</dt><dd>' + esc(r.floor) + '</dd></div>' +
      '<div class="rp__spec"><dt>Ceiling</dt><dd>' + (r.ceilingHeight ? ftIn(r.ceilingHeight) : "—") + '</dd></div>' +
      '<div class="rp__spec"><dt>Windows</dt><dd>' + esc(r.windows) + '</dd></div>' +
      '<div class="rp__spec" style="grid-column:span 2"><dt>Flooring</dt><dd>' + esc(r.flooring) + '</dd></div>' +
    '</dl>' +
    '<p class="rp__desc">' + esc(r.description) + '</p>' +
    '<div class="rp__foot"><button class="btn btn--line" data-open-room="' + r.id + '">Open room detail ' + ICON.arrow.replace("<svg", '<svg class="btn__arrow"') + '</button></div>' +
  '</div>';
}

function popoverHTML(r) {
  return '<div class="popover__media"><img src="' + r.image + '" alt=""><span class="popover__no">' + pad2(r.no) + '</span></div>' +
    '<div class="popover__body">' +
      '<div class="popover__title"><h4>' + esc(r.name) + '</h4>' + compassSVG(r.orientation.deg, 38) + '</div>' +
      '<div class="popover__area">' + sqft(r.area) + '</div>' +
      '<div class="popover__dims">' + dims(r) + '</div>' +
      '<div class="popover__specs">' +
        '<span class="popover__spec">' + ICON.compassI + '<span>' + esc(r.orientation.label) + '</span></span>' +
        '<span class="popover__spec">' + ICON.layers + '<span>' + esc(r.floor) + '</span></span>' +
        '<span class="popover__spec">' + ICON.height + '<span>' + (r.ceilingHeight ? ftIn(r.ceilingHeight) + " ceiling" : "—") + '</span></span>' +
        '<span class="popover__spec">' + ICON.window + '<span>' + esc(r.windows) + '</span></span>' +
        '<span class="popover__spec" style="grid-column:span 2">' + ICON.plank + '<span>' + esc(r.flooring) + '</span></span>' +
      '</div>' +
      '<p class="popover__desc">' + esc(r.description) + '</p>' +
      '<div class="popover__foot"><span>Room ' + pad2(r.no) + '</span><span>Click for detail</span></div>' +
    '</div>';
}

function roomDetailHTML(r, p) {
  const idx = p.rooms.indexOf(r);
  const prev = p.rooms[(idx - 1 + p.rooms.length) % p.rooms.length];
  const next = p.rooms[(idx + 1) % p.rooms.length];
  return '<div class="rd">' +
    '<div class="rd__media"><img src="' + r.image + '" alt="' + esc(r.name + " — " + p.title) + '"><span class="rd__badge">Room ' + pad2(r.no) + ' / ' + pad2(p.rooms.length) + '</span></div>' +
    '<div class="rd__body">' +
      '<div class="rd__eyebrow"><span class="eyebrow">' + esc(p.title) + '</span></div>' +
      '<h3 id="sheetTitle">' + esc(r.name) + '</h3>' +
      '<div class="rd__area">' + sqft(r.area) + ' · ' + dims(r) + '</div>' +
      '<div class="rd__compass" style="margin-top:20px">' + compassSVG(r.orientation.deg, 52) +
        '<div><b>' + esc(r.orientation.label) + '</b><span>Facing ' + esc(r.orientation.code) + '</span></div></div>' +
      '<dl class="rd__specs">' +
        '<div class="rd__spec"><dt>Area</dt><dd>' + sqft(r.area) + '</dd></div>' +
        '<div class="rd__spec"><dt>Dimensions</dt><dd>' + dims(r) + '</dd></div>' +
        '<div class="rd__spec"><dt>Floor</dt><dd>' + esc(r.floor) + '</dd></div>' +
        '<div class="rd__spec"><dt>Ceiling</dt><dd>' + (r.ceilingHeight ? ftIn(r.ceilingHeight) : "—") + '</dd></div>' +
        '<div class="rd__spec"><dt>Windows</dt><dd>' + esc(r.windows) + '</dd></div>' +
        '<div class="rd__spec"><dt>Flooring</dt><dd>' + esc(r.flooring) + '</dd></div>' +
      '</dl>' +
      '<p class="rd__desc">' + esc(r.description) + '</p>' +
      '<div class="rd__nav">' +
        '<button class="round-btn" data-open-room="' + prev.id + '" aria-label="Previous room: ' + esc(prev.name) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
        '<span class="rd__nav-label">' + pad2(r.no) + ' / ' + pad2(p.rooms.length) + ' rooms</span>' +
        '<button class="round-btn" data-open-room="' + next.id + '" aria-label="Next room: ' + esc(next.name) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>' +
      '</div>' +
    '</div></div>';
}

/* "Where is that, actually?" — a pin can hand the reader over to Google Maps,
   searching for the place near this property rather than guessing a pin's real
   coordinates, which nobody wants to look up for six shops. */
function mapsHref(p, m) {
  /* A link pasted straight from Google Maps beats anything we can guess. */
  if (m.href) return m.href;
  const q = [m.n, p.location, MAP_REGION].filter(Boolean).join(", ");
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}

function mapSVG(p) {
  const W = 1000, H = 620, r = rng(hash(p.id));
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Orientation map of the area — ' + esc(p.location) + '">';
  s += '<defs><linearGradient id="mapPark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3cdb8"/><stop offset="1" stop-color="#aebaa2"/></linearGradient></defs>';
  s += '<rect width="' + W + '" height="' + H + '" fill="#f1efe9"/>';
  /* park + water */
  s += '<path d="M700,40 q140,60 150,190 q10,120 -110,150 q-120,30 -150,-90 q-30,-120 110,-250 Z" fill="url(#mapPark)" opacity="0.55"/>';
  s += '<path d="M-20,470 q160,-50 300,10 q150,60 320,-10 q160,-64 420,-4" fill="none" stroke="#a8bcc6" stroke-width="18" opacity="0.55" stroke-linecap="round"/>';
  /* blocks */
  for (let i = 0; i < 26; i++) {
    const x = 40 + r() * (W - 140), y = 40 + r() * (H - 140);
    s += '<rect x="' + x + '" y="' + y + '" width="' + (40 + r() * 90) + '" height="' + (30 + r() * 70) + '" rx="4" fill="#e2ded5" stroke="#d7d2c7" stroke-width="1.5" opacity="0.85"/>';
  }
  /* roads */
  const roads = ["M0,300 H1000", "M0,180 H1000", "M0,430 H1000", "M240,0 V620", "M520,0 V620", "M780,0 V620", "M0,60 L1000,120"];
  roads.forEach(function (d, i) {
    s += '<path d="' + d + '" stroke="#ffffff" stroke-width="' + (i < 3 ? 18 : 12) + '" fill="none" opacity="0.9"/>';
    s += '<path d="' + d + '" stroke="#e6e2d9" stroke-width="' + (i < 3 ? 20 : 14) + '" fill="none" opacity="0.5"/>';
  });
  /* markers */
  p.poi.forEach(function (m) {
    const x = W * m.x / 100, y = H * m.y / 100, home = m.kind === "home";
    const link = !home && MAP_LINKS;
    s += '<' + (link ? 'a href="' + esc(mapsHref(p, m)) + '" target="_blank" rel="noopener"' : "g") +
      ' class="map-pin" data-poi="' + m.id + '" tabindex="0" role="button" aria-label="' +
      esc(m.n + (m.d ? ", " + m.d : "") + (link ? " — open in Google Maps" : "")) + '">' +
      '<circle class="hit" cx="' + x + '" cy="' + y + '" r="34"/>' +
      '<circle class="map-pin__ring" cx="' + x + '" cy="' + y + '" r="' + (home ? 34 : 28) + '" style="fill:rgba(var(--champagne-rgb),0.16);stroke:rgba(var(--champagne-rgb),0.5)"/>' +
      '<circle class="map-pin__dot" cx="' + x + '" cy="' + y + '" r="' + (home ? 22 : 17) + '" fill="' + (home ? "#15161a" : "rgba(255,255,255,0.86)") + '" stroke="' + (home ? "#b08d57" : "rgba(21,22,26,0.14)") + '" stroke-width="' + (home ? 2.5 : 1.4) + '"/>' +
      '<path d="' + (POI_ICON[m.kind] || POI_ICON.city) + '" transform="translate(' + (x - (home ? 12 : 9)) + ',' + (y - (home ? 12 : 9)) + ') scale(' + (home ? 1 : 0.76) + ')" fill="none" stroke="' + (home ? "#f6f5f2" : "#5d6068") + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
    (link ? "</a>" : "</g>");
  });
  return s + '</svg>';
}

/* ---------- Property detail view --------------------------------- */
function renderDetail(p) {
  const L = Object.assign({}, DETAIL_LABEL_FALLBACK, DETAIL_LABELS);
  const kind = p.type === "Apartment" ? "apartment" : p.type === "Commercial" ? "suite" : "house";
  /* Three kinds of plan: the built-in interactive drawing, a drawing the
     owner uploaded, and none at all. The room text boxes are there in all
     three, because the measurements are the part a buyer actually reads. */
  const hasPlan = !!p.floorPlan || !!p.planImage || p.rooms.length > 0;
  const summary = [];
  if (p.totalArea) summary.push({ v: sqft(p.totalArea), l: p.type === "Land" ? "Buildable area" : "Interior" });
  if (p.beds || p.baths) summary.push({ v: dispo(p), l: "Layout" });
  if (p.floors) summary.push({ v: String(p.floors), l: p.floors === 1 ? "Story" : "Stories" });
  if (p.terraceArea) summary.push({ v: sqft(p.terraceArea), l: "Terrace" });
  if (p.lotArea) summary.push({ v: sqft(p.lotArea), l: "Lot" });
  summary.push({ v: shortPrice(p), l: "Price", accent: true });

  /* HERS: lower is better, and a new build lands well under 60 */
  const hers = p.energyRating;
  const energyColor = !hers ? "#8b8e96" : hers <= 45 ? "#3f8f5f" : hers <= 60 ? "#7d9c4a" : hers <= 80 ? "#c39a3f" : "#bb5b3c";

  const facts = [
    ["Property type", p.type],
    ["Offered", p.mode === "sale" ? "For sale" : "For rent"],
    ["Layout", dispo(p)],
    ["Interior", p.totalArea ? sqft(p.totalArea) : "—"],
    ["Lot size", p.lotArea ? sqft(p.lotArea) : "—"],
    ["Stories", p.floors ? String(p.floors) : "—"],
    ["Year built", p.yearBuilt ? String(p.yearBuilt) : "—"],
    ["Rooms", p.rooms.length ? String(p.rooms.length) : "—"]
  ];
  if (p.footprintW && p.footprintD) facts.splice(5, 0, ["Footprint", ftIn(p.footprintW) + " × " + ftIn(p.footprintD)]);

  const related = PROPERTIES.filter(x => x.id !== p.id).slice(0, 3);

  let html = "";

  /* hero */
  html += '<section class="detail-hero">' +
    '<div class="detail-hero__media" id="detailHeroMedia">' + heroPicture(p.images[0], p.title + " — " + p.location) + '</div>' +
    '<div class="detail-hero__scrim"></div>' +
    '<a class="back-btn" href="#/" data-route="/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg> Back to listings</a>' +
    '<div class="detail-hero__inner">' +
      '<div>' +
        '<div class="detail-hero__tags">' +
          '<span class="tag"><span class="tag__dot' + toneClass(p.statusTone) + '"></span>' + esc(p.status) + '</span>' +
          '<span class="tag tag--solid">' + esc(p.type) + '</span>' +
          '<span class="tag tag--solid">' + (p.mode === "sale" ? "For sale" : "For rent") + '</span>' +
          (p.floorPlan ? '<span class="tag tag--accent">Interactive floor plan</span>' : p.planImage ? '<span class="tag tag--accent">Floor plan</span>' : "") +
          (p.videoLink ? '<span class="tag tag--solid">Video tour</span>' : "") +
        '</div>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<p class="detail-hero__loc">' + ICON.pin + esc(p.location) + ' · ' + esc(p.locationNote) + '</p>' +
      '</div>' +
      '<div class="detail-hero__side">' +
        '<span class="hero__chip"><span class="mono">Price</span> <b>' + esc(fmtPrice(p)) + '</b></span>' +
      '</div>' +
    '</div></section>';

  /* summary */
  html += '<div class="wrap"><div class="summary glass glass--strong">' +
    summary.map(c => '<div class="summary__cell' + (c.accent ? " summary__cell--accent" : "") + '"><b>' + esc(c.v) + '</b><span>' + esc(c.l) + '</span></div>').join("") +
    '</div></div>';

  /* description + side card */
  html += '<section class="section section--tight"><div class="wrap"><div class="detail-grid">' +
    '<div class="reveal">' +
      '<span class="eyebrow">About this property</span>' +
      '<h2 style="margin:18px 0 26px">' + esc(p.title) + '<br>' + esc(p.location) + '</h2>' +
      '<div class="desc">' + p.description.map(d => "<p>" + esc(d) + "</p>").join("") + '</div>' +
      '<div class="dl">' + facts.map(f => '<div class="dl__row"><span class="dl__k">' + esc(f[0]) + '</span><span class="dl__v">' + esc(f[1]) + '</span></div>').join("") +
        '<div class="dl__row"><span class="dl__k">Energy rating</span><span class="dl__v">' + (hers ? '<span class="energy" style="background:' + energyColor + '">HERS ' + hers + '</span>' : "—") + '</span></div>' +
      '</div>' +
      /* Floor by floor, when the owner has measured them */
      (p.levels.length
        ? '<div class="floors">' +
            '<span class="eyebrow eyebrow--quiet">Floor by floor</span>' +
            '<div class="floors__list">' + p.levels.map(f =>
              '<div class="floors__row">' +
                '<span class="floors__name">' + esc(f.name) + '</span>' +
                '<span class="floors__area">' + (f.area ? sqft(f.area) : "—") + '</span>' +
                '<span class="floors__note">' + esc(f.note) + '</span>' +
                '<span class="floors__dim">' + (f.width && f.depth ? ftIn(f.width) + " \u00d7 " + ftIn(f.depth) : "") + '</span>' +
              '</div>').join("") +
            '</div>' +
          '</div>'
        : "") +
    '</div>' +
    '<aside class="side-card glass reveal">' +
      '<div class="side-card__agent">' +
        '<span class="side-card__avatar"><img src="' + AGENT.photo + '" alt="' + esc(AGENT.name) + '"></span>' +
        '<span><b>' + esc(AGENT.name) + '</b><span>' + esc(AGENT.role) + '</span></span>' +
      '</div>' +
      '<div class="side-card__price"><b>' + esc(fmtPrice(p)) + '</b><span>' + esc(p.priceNote || (p.mode === "sale" ? "Commission and escrow included" : "Deposit equal to two months")) + '</span></div>' +
      '<div class="side-card__btns">' +
        '<a class="btn magnetic" href="' + AGENT.phoneHref + '">Book a showing ' + ICON.arrow.replace("<svg", '<svg class="btn__arrow"') + '</a>' +
        '<a class="btn btn--line" href="mailto:' + AGENT.email + '?subject=' + encodeURIComponent("Question — " + p.title + ", " + p.location) + '">Email a question</a>' +
      '</div>' +
      '<p class="side-card__note">' + esc(AGENT.phone) + ' · ' + esc(AGENT.email) + '<br>' + esc(AGENT.license) + ' — usually replies within two hours.</p>' +
    '</aside>' +
  '</div></div></section>';

  /* gallery */
  html += '<section class="section section--tight"><div class="wrap">' +
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.galleryEyebrow) + '</span><h2>' + br(L.galleryHeading) + '</h2></div>' +
    '<span class="mono" style="font-size:0.72rem;color:var(--muted);letter-spacing:0.14em">' + pad2(p.images.length) + ' PHOTOGRAPHS</span></div>' +
    '<div class="gallery reveal" id="gallery">' +
      p.images.map((im, i) => '<button class="gal" data-gal="' + i + '" aria-label="Open photograph: ' + esc(im.caption) + '">' +
        '<img src="' + im.src + '" alt="' + esc(im.caption) + '" loading="lazy" decoding="async">' +
        '<span class="gal__cap">' + esc(im.caption) + '</span></button>').join("") +
    '</div></div></section>';

  /* video tour */
  if (p.videoLink) {
    html += '<section class="section section--tight" id="videotour"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.videoEyebrow) + '</span>' +
      '<h2>' + br(L.videoHeading) + '</h2></div></div>' +
      videoFrameHTML(p.videoLink, p.images.length ? p.images[0].src : "", "Watch the video tour") +
    '</div></section>';
  }

  /* rooms */
  if (p.rooms.length) {
    html += '<section class="section" id="rooms"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text">' +
        '<span class="eyebrow">' + esc(L.roomsEyebrow.replace("{type}", kind)) + '</span>' +
        '<h2>' + br(L.roomsHeading) + '</h2>' +
        '<p class="lede">' + esc(L.roomsLede) + '</p>' +
      '</div></div>' +
      '<div class="rooms-grid reveal" id="roomsGrid">' + p.rooms.map(roomCardHTML).join("") + '</div>' +
    '</div></section>';
  }

  /* floor plan — three states:
       a built-in interactive drawing, a drawing the owner uploaded, or no
       drawing at all. The room text boxes are there in all three, because the
       measurements are the part a buyer actually reads. */
  if (hasPlan) {
    const drawn = !p.planImage && !!p.floorPlan;
    const stage = drawn || !!p.planImage;
    const levels = drawn ? p.floorPlan.levels : [];
    html += '<section class="section section--tight" id="floorplan"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.planEyebrow) + '</span>' +
      '<h2>' + br(drawn ? L.planHeading : L.planHeadingList) + '</h2></div>' +
      '<span class="mono" style="font-size:0.72rem;color:var(--muted);letter-spacing:0.14em">' +
        (drawn ? "DRAWN TO SCALE" : stage ? "OWNER&rsquo;S DRAWING" : "MEASURED") + '</span></div>' +
      '<div class="plan reveal' + (stage ? "" : " plan--list-only") + '">' +
        (stage ?
        '<div class="plan__stage" id="planStage">' +
          '<span class="plan__grid" aria-hidden="true"></span>' +
          '<div class="plan__bar">' +
            (!drawn ? '<span aria-hidden="true"></span>' :
             levels.length > 1 ? '<div class="levels" id="planLevels" role="tablist" aria-label="Floors">' +
              levels.map((l, i) => '<button class="levels__btn' + (i === 0 ? " is-active" : "") + '" role="tab" aria-selected="' + (i === 0) + '" data-level="' + l.id + '">' + esc(l.label) + '</button>').join("") +
            '</div>' : '<span class="plan__hint" style="position:static">' + esc(levels[0].label) + '</span>') +
            '<div class="zoomer">' +
              '<button data-zoom="out" aria-label="Zoom out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 12h14"/></svg></button>' +
              '<button data-zoom="reset" aria-label="Reset zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 20v-5h5"/></svg></button>' +
              '<button data-zoom="in" aria-label="Zoom in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
            '</div>' +
          '</div>' +
          '<div id="planHost" style="position:absolute;inset:0"></div>' +
          '<span class="plan__hint">' + (!drawn ? "Drag to pan &middot; scroll to zoom" : canHover ? "Hover a room &middot; drag to pan &middot; scroll to zoom" : "Tap a room") + '</span>' +
        '</div>' : "") +
        '<div class="plan__panel glass" id="planPanel">' + (stage ? "" : planListHTML(p)) + '</div>' +
      '</div>' +
    '</div></section>';
  }

  /* features */
  if (p.features.length) {
    html += '<section class="section section--tight"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.featuresEyebrow) + '</span><h2>' + br(L.featuresHeading) + '</h2></div></div>' +
      '<div class="features reveal">' + p.features.map(f => '<span class="feature">' + ICON.check + esc(f) + '</span>').join("") + '</div>' +
    '</div></section>';
  }

  /* location */
  html += '<section class="section" id="location"><div class="wrap">' +
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.locationEyebrow) + '</span>' +
    '<h2>' + br(L.locationHeading) + '</h2><p class="lede">' + esc(p.locationNote) + '</p></div></div>' +
    '<div class="map-wrap reveal" id="mapWrap">' + mapSVG(p) +
      '<div class="map-card glass"><span class="mono">Neighborhood</span><b>' + esc(p.location) + '</b><span>' + esc(p.locationNote) + '</span></div>' +
      '<div class="map-legend">' + p.poi.filter(m => m.kind !== "home").map(m =>
        (MAP_LINKS
          ? '<a class="map-chip" href="' + esc(mapsHref(p, m)) + '" target="_blank" rel="noopener" data-poi-chip="' + m.id + '">'
          : '<button class="map-chip" data-poi-chip="' + m.id + '">') +
        '<span class="map-chip__dot"></span>' + esc(m.n) + ' <span class="mono">' + esc(m.d) + '</span>' +
        (MAP_LINKS ? "</a>" : "</button>")).join("") +
      '</div>' +
    '</div></div></section>';

  /* agent CTA */
  html += '<section class="section section--tight"><div class="wrap"><div class="dark-sec reveal"><div class="cta">' +
    '<span class="eyebrow">Showings</span>' +
    '<h2 style="margin-top:18px">Want to walk it<br>in person?</h2>' +
    '<p>Showings run outside office hours too. Call or write — I usually reply within two hours.</p>' +
    '<div class="cta__btns">' +
      '<a class="btn btn--on-dark magnetic" href="' + AGENT.phoneHref + '">Call ' + esc(AGENT.phone) + '</a>' +
      '<a class="btn btn--on-dark-ghost magnetic" href="mailto:' + AGENT.email + '?subject=' + encodeURIComponent("Showing — " + p.title) + '">Book a showing</a>' +
    '</div></div></div></div></section>';

  /* related */
  html += '<section class="section section--tight"><div class="wrap">' +
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">' + esc(L.similarEyebrow) + '</span><h2>' + br(L.similarHeading) + '</h2></div>' +
    '<a class="btn btn--line magnetic" href="#/" data-route="/">All listings</a></div>' +
    '<div class="related">' + related.map(propertyCard).join("") + '</div>' +
  '</div></section>';

  return html;
}

/* An uploaded drawing carries no room coordinates, so nothing on it can be
   hovered, and with no drawing at all there is nothing to hover either. The
   panel then holds what the hover would have said: every room as a text row,
   grouped by floor, each one opening the full detail. */
function planListHTML(p) {
  const floors = [];
  p.rooms.forEach(function (r) {
    let g = floors.filter(f => f.name === r.floor)[0];
    if (!g) { g = { name: r.floor, rooms: [] }; floors.push(g); }
    g.rooms.push(r);
  });
  return '<div class="plan__list">' +
    '<span class="eyebrow eyebrow--quiet">Rooms on the plan</span>' +
    floors.map(function (f) {
      return '<div class="plan__floor">' +
        '<span class="plan__floor-name">' + esc(f.name) + '</span>' +
        f.rooms.map(function (r) {
          return '<button class="plan__row" data-open-room="' + r.id + '">' +
            '<span class="plan__row-no">' + pad2(r.no) + '</span>' +
            '<span class="plan__row-name">' + esc(r.name) + '</span>' +
            '<span class="plan__row-dim">' + dims(r) + '</span>' +
            '<span class="plan__row-area">' + num(r.area) + ' sq ft</span>' +
          '</button>';
        }).join("") +
      '</div>';
    }).join("") +
    '<p class="plan__list-note">Areas and dimensions as measured. Open a room for its orientation, ceiling height, flooring and photograph.</p>' +
  '</div>';
}

function roomCardHTML(r) {
  return '<button class="room-card" data-room="' + r.id + '" aria-label="' + esc(r.name + ", " + sqft(r.area) + ", facing " + r.orientation.label) + '">' +
    '<span class="room-card__head"><span class="room-card__no">' + pad2(r.no) + '</span><span class="room-card__area">' + num(r.area) + ' sq ft</span></span>' +
    '<span class="room-card__name">' + esc(r.name) + '</span>' +
    '<span class="room-card__media"><img src="' + r.image + '" alt="' + esc(r.name) + '" loading="lazy" decoding="async"></span>' +
    /* A sibling of the photograph, not a child of it: on wide screens it is
       positioned over the image, and on a phone — where these pills are
       always on — it drops below it instead of covering the room. */
    '<span class="room-card__meta">' +
      '<span class="room-card__pill">' + esc(r.orientation.code) + ' · ' + dims(r) + '</span>' +
      '<span class="room-card__pill">' + esc(r.floor) + '</span>' +
    '</span></button>';
}


// ---------------------------------------------------------------------------
// Defaults. The panel ships filled in — an empty component looks broken, and a
// buyer rewrites an example far more readily than they invent one.
// ---------------------------------------------------------------------------

/* The demo photographs. WebP, inlined so the component carries its own
   example. Anything a buyer uploads in the panel wins over these. */

const DEFAULT_AGENT = { name: "Adam Marsh", role: "Real Estate Agent \u00b7 Los Angeles", license: "DRE #02145879", phone: "+1 (310) 555-0148", email: "adam@thresholdrealty.com", sold: 214, years: 12, rating: 4.9 }

const DEFAULT_LISTINGS: any[] = [
    { title: "Modern Villa", location: "Pacific Palisades", locationNote: "Quiet canyon street, 600 ft from the trailhead", type: "Villa", mode: "sale", price: 3950000, priceNote: "", beds: 3, baths: 2, interior: 2002, lot: 13347, terrace: 0, floors: 2, footprintW: 43.9, footprintD: 29.3, yearBuilt: 2021, energyRating: 38, status: "New to market", statusTone: "green", featured: true, scene: "villa", sceneTime: "dusk", seed: "villa-1", plan: "villa", photo: PHOTO_VILLAEXT, description: "Built in 2021 on a lot that falls away to the southwest \u2014 and the whole house answers that view. The living space opens to the garden through three full-height sliders, the kitchen keeps its own south light, and the upper floor steps back so a covered roof terrace sits above the living room.\n\nConstruction is steel and stone with triple glazing, balanced ventilation with heat recovery, and a ground-source heat pump. Radiant floors run through every room, cooling covers the upper floor, and the envelope is insulated well past code \u2014 the house runs on about $780 a year.\n\nThe 13,347 sq ft lot is fenced and planted, with mature pines along the north edge. The approach is from the east and covered parking for two cars is part of the structure.", features: "Ground-source heat pump, Heat-recovery ventilation, Triple glazing, Radiant floors, Upper-floor cooling, Fireplace, 284 sq ft roof terrace, 2-car covered parking, 7.2 kW solar array, Drip irrigation, Automatic gate, Fiber internet", nearby: "Palisades Village \u2014 1.4 mi \u2014 city\nMarquez Charter Elem. \u2014 0.4 mi \u2014 school\nRalphs supermarket \u2014 1.1 mi \u2014 market\nPharmacy on Sunset \u2014 1.1 mi \u2014 pharmacy\nPost office \u2014 1.3 mi \u2014 post\nRestaurants on Sunset \u2014 0.7 mi \u2014 restaurant\nTemescal Canyon trails \u2014 600 ft \u2014 park\nMetro bus, PCH \u2014 0.3 mi \u2014 bus", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "villa-liv", caption: "Living room", image: PHOTO_GREYLIV },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "villa-kit", caption: "Kitchen and dining" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "villa-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "villa-bath", caption: "Bathroom" },
        { k: "exterior", v: "villa", out: "", t: "morning", seed: "villa-2", caption: "Garden and pool in the morning", image: PHOTO_VILLAPOOL },
        { k: "interior", v: "study", out: "forest", t: "", seed: "villa-stu", caption: "Study" },
        { k: "exterior", v: "villa", out: "", t: "winter", seed: "villa-3", caption: "The house in January" }
    ], rooms: [
        { name: "Entry Hall", area: 133, width: 14.04, length: 9.51, ceiling: 9.35, ori: "E", floor: "1st Floor", windows: "1 narrow window beside the door", flooring: "Large-format porcelain", roomText: "A full-length closet wall and a bench under the window. Morning light comes straight in from the east.", scene: "hall", sceneOut: "garden", sceneT: "", seed: "v-hala" },
        { name: "Living Room", area: 461, width: 23.36, length: 19.75, ceiling: 9.35, ori: "SW", floor: "1st Floor", windows: "3 full-height sliders", flooring: "White oak", roomText: "The main room of the house. Afternoon and evening light, direct access to the terrace and garden, fireplace on the north wall.", scene: "living", sceneOut: "garden", sceneT: "", seed: "v-obyv", roomPhoto: PHOTO_GREYLIV },
        { name: "Kitchen", area: 198, width: 14.04, length: 14.11, ceiling: 9.35, ori: "S", floor: "1st Floor", windows: "2 windows", flooring: "Large-format porcelain", roomText: "Island kitchen with a dining table for six. Open to the living room but with its own south window above the run.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "v-kuch" },
        { name: "Study", area: 142, width: 14.96, length: 9.51, ceiling: 9.35, ori: "W", floor: "1st Floor", windows: "1 picture window", flooring: "White oak", roomText: "A separate study looking into the pines. Wired for data, and a pocket door closes it off.", scene: "study", sceneOut: "forest", sceneT: "", seed: "v-prac" },
        { name: "Primary Bedroom", area: 265, width: 20.01, length: 13.22, ceiling: 9.35, ori: "SE", floor: "2nd Floor", windows: "2 picture windows", flooring: "White oak", roomText: "A quiet bedroom with morning light and a view over the garden. Walk-in closet and direct access to the bathroom.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "v-master" },
        { name: "Bathroom", area: 105, width: 12.47, length: 8.46, ceiling: 8.86, ori: "E", floor: "2nd Floor", windows: "1 window", flooring: "Micro-cement", roomText: "Freestanding tub under the window, separate shower and a double vanity. Radiant floor.", scene: "bath", sceneOut: "garden", sceneT: "", seed: "v-koup" },
        { name: "Second Bedroom", area: 175, width: 13.29, length: 13.19, ceiling: 9.35, ori: "S", floor: "2nd Floor", windows: "2 windows", flooring: "White oak", roomText: "A bright room opening onto the roof terrace. Framing is in place to split it into two smaller rooms.", scene: "kids", sceneOut: "garden", sceneT: "", seed: "v-detsky" },
        { name: "Utility Room", area: 80, width: 8.4, length: 9.51, ceiling: 8.86, ori: "N", floor: "1st Floor", windows: "1 window", flooring: "Epoxy", roomText: "Heat pump, ventilation unit, buffer tank and room for a washer and dryer.", scene: "tech", sceneOut: "garden", sceneT: "", seed: "v-tech" },
        { name: "Stair", area: 80, width: 14.04, length: 5.64, ceiling: 18.21, ori: "E", floor: "1st Floor", windows: "1 tall window", flooring: "Oak and steel", roomText: "A cantilevered stair with oak treads and a steel guard wall, lit by a two-storey window.", scene: "stairs", sceneOut: "garden", sceneT: "", seed: "v-scho" },
        { name: "Guest Room", area: 112, width: 13.29, length: 8.46, ceiling: 8.86, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "White oak", roomText: "A smaller room for guests or a second study, with a closet across the full wall.", scene: "attic", sceneOut: "forest", sceneT: "", seed: "v-host" },
        { name: "Upper Hall and Stair", area: 153, width: 11.65, length: 13.19, ceiling: 8.86, ori: "N", floor: "2nd Floor", windows: "no windows, skylight", flooring: "White oak", roomText: "A skylit hall with built-in storage, separating the sleeping side from the guest room.", scene: "hall", sceneOut: "garden", sceneT: "", seed: "v-chod" },
        { name: "Roof Terrace", area: 284, width: 37.4, length: 7.61, ceiling: 0, ori: "S", floor: "2nd Floor", windows: "\u2014", flooring: "Thermally modified ash", roomText: "A covered terrace above the living room facing due south. It holds its warmth morning and evening.", scene: "terrace", sceneOut: "", sceneT: "evening", seed: "v-terasa" }
    ] },
    { title: "Penthouse with Terrace", location: "West Hollywood", locationNote: "Top floor, city and hills on three sides", type: "Apartment", mode: "sale", price: 4750000, priceNote: "", beds: 2, baths: 2, interior: 1765, lot: 0, terrace: 667, floors: 1, footprintW: 45.93, footprintD: 38.38, yearBuilt: 2019, energyRating: 44, status: "By appointment", statusTone: "amber", featured: true, scene: "penthouse", sceneTime: "dusk", seed: "ph-1", plan: "rooms", videoLink: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", description: "The entire top floor of a small building above Santa Monica Boulevard. A 667 sq ft terrace wraps the south side, looking over the city to the hills \u2014 and since the building is the tallest on its block, nothing looks back.\n\nThe interior was drawn by a studio that added exactly one material: oak. Custom kitchen with a single slab counter, built-in closets in every room, zoned air conditioning, motorized shades and a wired smart panel. Two parking spaces and a storage room come with it.", features: "667 sq ft terrace, City and hill views, Zoned A/C, Smart wiring, Custom kitchen, Motorized shades, 2 parking spaces, 86 sq ft storage, Private elevator entry, Stone bathroom", nearby: "Sunset Strip \u2014 0.5 mi\nWest Hollywood Elem. \u2014 0.6 mi\nShops and caf\u00e9s \u2014 350 ft\nRestaurants \u2014 400 ft\nRunyon Canyon \u2014 1.3 mi\nMetro line, Santa Monica Bl. \u2014 0.2 mi", gallery: [
        { k: "interior", v: "living", out: "city", t: "", seed: "ph-liv", caption: "Living space", image: PHOTO_TANSOFA },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "ph-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "ph-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "ph-bath", caption: "Bathroom" },
        { k: "exterior", v: "penthouse", out: "", t: "morning", seed: "ph-2", caption: "Morning from the terrace" }
    ], rooms: [
        { name: "Living and Kitchen", area: 665, width: 28.54, length: 23.29, ceiling: 10.17, planX: 0, planY: 15.09, ori: "SW", floor: "Penthouse", windows: "3 sliding walls to the terrace", flooring: "Oak plank", roomText: "One room for cooking, eating and sitting. Three sliding walls pocket into the structure, so the whole south side opens.", scene: "living", sceneOut: "city", sceneT: "", seed: "ph-r1", roomPhoto: PHOTO_TANSOFA },
        { name: "Primary Bedroom", area: 257, width: 17.39, length: 14.76, ceiling: 10.17, planX: 28.54, planY: 23.62, ori: "SE", floor: "Penthouse", windows: "2 picture windows", flooring: "Oak plank", roomText: "Opens onto the terrace and catches the morning sun. Built-in closets run the length of the wall.", scene: "bedroom", sceneOut: "city", sceneT: "", seed: "ph-r2" },
        { name: "Primary Bathroom", area: 149, width: 17.39, length: 8.53, ceiling: 9.84, planX: 28.54, planY: 15.09, ori: "E", floor: "Penthouse", windows: "1 window", flooring: "Stone", roomText: "Tub and walk-in shower, a double vanity cut from one slab, radiant floor.", scene: "bath", sceneOut: "city", sceneT: "", seed: "ph-r3" },
        { name: "Second Bedroom", area: 198, width: 13.12, length: 15.09, ceiling: 10.17, planX: 0, planY: 0, ori: "NW", floor: "Penthouse", windows: "1 picture window", flooring: "Oak plank", roomText: "A second bedroom with steady northwest light, equally good as a guest room.", scene: "attic", sceneOut: "city", sceneT: "", seed: "ph-r4" },
        { name: "Walk-in Closet", area: 109, width: 7.22, length: 15.09, ceiling: 9.84, planX: 13.12, planY: 0, ori: "N", floor: "Penthouse", windows: "no windows", flooring: "Oak plank", roomText: "A walk-through closet built to measure, with a mirrored wall and an island.", scene: "hall", sceneOut: "city", sceneT: "", seed: "ph-r5" },
        { name: "Entry Hall", area: 149, width: 9.84, length: 15.09, ceiling: 9.84, planX: 20.34, planY: 0, ori: "N", floor: "Penthouse", windows: "no windows", flooring: "Stone", roomText: "You arrive straight from an elevator that serves this floor only. Built-in storage walls.", scene: "hall", sceneOut: "city", sceneT: "", seed: "ph-r6" },
        { name: "Study", area: 149, width: 9.84, length: 15.09, ceiling: 10.17, planX: 30.18, planY: 0, ori: "NE", floor: "Penthouse", windows: "1 window", flooring: "Oak plank", roomText: "A study that closes off, with north light that holds steady through the day.", scene: "study", sceneOut: "city", sceneT: "", seed: "ph-r7" },
        { name: "Second Bath", area: 89, width: 5.91, length: 15.09, ceiling: 9.84, planX: 40.02, planY: 0, ori: "E", floor: "Penthouse", windows: "1 window", flooring: "Stone", roomText: "A second bathroom with a shower and a separate powder room for guests.", scene: "bath", sceneOut: "city", sceneT: "", seed: "ph-r8" },
        { name: "Terrace", area: 667, width: 45.93, length: 14.53, ceiling: 0, planX: 0, planY: 38.38, ori: "S", floor: "Penthouse", windows: "\u2014", flooring: "Thermally modified wood", roomText: "A terrace along the whole south side. Pergola over the dining end, irrigated planters, low evening lighting.", scene: "terrace", sceneOut: "", sceneT: "dusk", seed: "ph-r9" }
    ] },
    { title: "Warehouse Loft", location: "Arts District", locationNote: "1927 brick warehouse, converted in 2020", type: "Apartment", mode: "sale", price: 1395000, priceNote: "", beds: 2, baths: 2, interior: 1480, lot: 0, terrace: 194, floors: 1, footprintW: 47.2, footprintD: 33.5, yearBuilt: 1927, energyRating: 58, status: "In escrow \u2014 backups welcome", statusTone: "amber", featured: true, scene: "block", sceneTime: "morning", seed: "byt-1", plan: "none", description: "The top floor of a brick warehouse two blocks off Traction Avenue, converted in 2020. The timber trusses stayed exposed, new insulation went in between them, and the steel windows face southeast over the rail yard.\n\nFully rewired and replumbed during the conversion, with a new elevator and a seismically retrofitted shell. A storage cage comes with the unit, and a parking space in the courtyard is available to buy.", features: "Exposed timber trusses, 194 sq ft terrace, New elevator, Storage cage, Steel factory windows, Custom kitchen, Courtyard parking, Low HOA dues", nearby: "Downtown core \u2014 1.2 mi\nNinth Street Elementary \u2014 0.8 mi\nGrocery and market \u2014 0.4 mi\nCoffee and restaurants \u2014 150 ft\nLA River path \u2014 0.6 mi\nMetro A Line \u2014 0.5 mi", gallery: [
        { k: "interior", v: "attic", out: "city", t: "", seed: "byt-liv", caption: "Living space under the trusses", image: PHOTO_LOFTROOM },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "byt-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "byt-bed", caption: "Bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "byt-bath", caption: "Bathroom" },
        { k: "exterior", v: "block", out: "", t: "dusk", seed: "byt-2", caption: "Evening over the rooftops" }
    ], rooms: [
        { name: "Living and Kitchen", area: 592, width: 28.2, length: 21, ceiling: 11.15, ori: "SE", floor: "4th Floor", windows: "4 steel windows", flooring: "Oak plank", roomText: "One open volume under the trusses with a door to the terrace. The morning sun crosses the whole room.", scene: "attic", sceneOut: "city", sceneT: "", seed: "b-r1", roomPhoto: PHOTO_LOFTROOM },
        { name: "Primary Bedroom", area: 279, width: 18, length: 15.5, ceiling: 9.5, ori: "SW", floor: "4th Floor", windows: "2 steel windows", flooring: "Oak plank", roomText: "A quiet bedroom over the courtyard, with blackout shades and a built-in closet.", scene: "bedroom", sceneOut: "city", sceneT: "", seed: "b-r2" },
        { name: "Second Bedroom", area: 221, width: 14.5, length: 15.25, ceiling: 9.5, ori: "SW", floor: "4th Floor", windows: "1 steel window", flooring: "Oak plank", roomText: "A smaller room with a high ceiling and one exposed truss.", scene: "kids", sceneOut: "city", sceneT: "", seed: "b-r3" },
        { name: "Bathroom", area: 148, width: 12.3, length: 12, ceiling: 8.5, ori: "N", floor: "4th Floor", windows: "1 skylight", flooring: "Stone-look tile", roomText: "Tub under the skylight, walk-in shower, and laundry in its own alcove.", scene: "bath", sceneOut: "city", sceneT: "", seed: "b-r4" },
        { name: "Entry", area: 106, width: 16, length: 6.6, ceiling: 8.5, ori: "N", floor: "4th Floor", windows: "no windows", flooring: "Oak plank", roomText: "An entry hall with a closet wall running its full length.", scene: "hall", sceneOut: "city", sceneT: "", seed: "b-r5" },
        { name: "Terrace", area: 194, width: 19.7, length: 9.8, ceiling: 0, ori: "SE", floor: "4th Floor", windows: "\u2014", flooring: "Wood deck", roomText: "A terrace between the parapets, in sun from morning to mid-afternoon, with downtown on the skyline.", scene: "terrace", sceneOut: "", sceneT: "morning", seed: "b-r6" }
    ] },
    { title: "Family Home with Garden", location: "Sherman Oaks", locationNote: "Quiet street, garden facing south", type: "House", mode: "sale", price: 2150000, priceNote: "", beds: 4, baths: 3, interior: 2530, lot: 7320, terrace: 0, floors: 2, footprintW: 38.4, footprintD: 33.6, yearBuilt: 1998, energyRating: 71, status: "Move-in ready", statusTone: "green", featured: true, scene: "house", sceneTime: "morning", seed: "dum-1", photo: PHOTO_PORCHEXT, plan: "none", description: "A solid late-nineties house south of Ventura, kept up year on year and re-insulated in 2018. The layout is the familiar one and it works: living space downstairs, three rooms and a study upstairs.\n\nThe 7,320 sq ft lot is flat, fenced and planted with citrus. A detached garage and a workshop come with it.", features: "Re-insulated 2018, New roof 2019, Central heat and air, Fireplace with insert, Detached garage, Workshop, Drip irrigation, Citrus trees", nearby: "Ventura Boulevard \u2014 0.6 mi\nRiverside Drive Charter \u2014 0.4 mi\nSupermarket \u2014 0.5 mi\nRestaurants \u2014 0.6 mi\nSepulveda Basin \u2014 1.9 mi\nMetro bus, US-101 \u2014 0.8 mi", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "dum-liv", caption: "Living room", image: PHOTO_VILLALIV },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "dum-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "dum-bed", caption: "Primary bedroom" },
        { k: "exterior", v: "house", out: "", t: "evening", seed: "dum-2", caption: "From the street", image: PHOTO_BRICKHOME },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "dum-bath", caption: "Bathroom" }
    ], rooms: [
        { name: "Living Room", area: 338, width: 20.3, length: 16.6, ceiling: 8.5, ori: "S", floor: "1st Floor", windows: "2 windows and a patio door", flooring: "Oak", roomText: "A generous living room with a fireplace and a door to the south patio.", scene: "living", sceneOut: "garden", sceneT: "", seed: "d-r1", roomPhoto: PHOTO_VILLALIV },
        { name: "Kitchen and Dining", area: 213, width: 14.8, length: 14.4, ceiling: 8.5, ori: "E", floor: "1st Floor", windows: "2 windows", flooring: "Tile", roomText: "Room for a full-size table, with morning light from the east.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "d-r2" },
        { name: "Primary Bedroom", area: 189, width: 14.4, length: 13.1, ceiling: 8.4, ori: "SW", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "Afternoon sun and a built-in closet.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "d-r3" },
        { name: "Bedroom", area: 153, width: 11.6, length: 13.1, ceiling: 8.4, ori: "S", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A bright room looking over the garden.", scene: "kids", sceneOut: "garden", sceneT: "", seed: "d-r4" },
        { name: "Bedroom / Study", area: 138, width: 10.5, length: 13.1, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A smaller room with steady north light, used today as an office.", scene: "study", sceneOut: "forest", sceneT: "", seed: "d-r5" },
        { name: "Bathroom", area: 90, width: 9.2, length: 9.8, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Tile", roomText: "Tub and shower, remodelled in 2020.", scene: "bath", sceneOut: "garden", sceneT: "", seed: "d-r6" }
    ] },
    { title: "1923 Spanish Revival", location: "Hancock Park", locationNote: "Original 1923 house, restored 2017\u20132019", type: "House", mode: "sale", price: 4600000, priceNote: "", beds: 5, baths: 4, interior: 4180, lot: 9800, terrace: 0, floors: 3, footprintW: 52.5, footprintD: 39.8, yearBuilt: 1923, energyRating: 84, status: "Fully restored", statusTone: "slate", featured: true, scene: "historic", sceneTime: "morning", seed: "his-1", plan: "none", photo: PHOTO_SHINGLEEXT, description: "A 1923 Spanish Revival on a tree-lined street, restored between 2017 and 2019 with a light hand. The barrel-vaulted entry, the oak stair and the panelled doors survived and were repaired rather than replaced.\n\nThree floors, usable as one large family house or split into two separate units \u2014 the utilities are already run for it.", features: "Original barrel vaults, Restored oak stair, Panelled doors, Tiled fireplace, 9,800 sq ft lot, Two-unit potential, New systems throughout, Attic ready to finish", nearby: "Larchmont Village \u2014 0.5 mi\nThird Street Elementary \u2014 0.7 mi\nShops on Larchmont \u2014 0.4 mi\nRestaurants and bars \u2014 0.4 mi\nWilshire Country Club \u2014 0.6 mi\nMetro bus, Wilshire \u2014 0.3 mi", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "his-liv", caption: "Front room", image: PHOTO_BEAMROOM },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "his-kit", caption: "Kitchen" },
        { k: "interior", v: "stairs", out: "garden", t: "", seed: "his-sta", caption: "The original stair" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "his-bed", caption: "Bedroom" },
        { k: "exterior", v: "historic", out: "", t: "dusk", seed: "his-2", caption: "The house at dusk", image: PHOTO_CHALETDUSK }
    ], rooms: [
        { name: "Front Room", area: 497, width: 25.3, length: 19.7, ceiling: 11.8, ori: "SE", floor: "2nd Floor", windows: "4 casement windows", flooring: "Original oak", roomText: "A formal room with an eleven-foot ceiling, plaster cornice and a tiled fireplace.", scene: "living", sceneOut: "garden", sceneT: "", seed: "h-r1", roomPhoto: PHOTO_BEAMROOM },
        { name: "Kitchen and Dining", area: 306, width: 19, length: 16.1, ceiling: 11.8, ori: "SW", floor: "2nd Floor", windows: "3 casement windows", flooring: "Terracotta", roomText: "A kitchen built to fit the house, with a table for ten.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "h-r2" },
        { name: "Primary Bedroom", area: 267, width: 17.1, length: 15.6, ceiling: 11.2, ori: "SE", floor: "3rd Floor", windows: "2 casement windows", flooring: "Oak", roomText: "Looks over the courtyard and has its own bathroom.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "h-r3" },
        { name: "Library and Study", area: 211, width: 15.1, length: 14, ceiling: 11.2, ori: "N", floor: "3rd Floor", windows: "2 casement windows", flooring: "Oak", roomText: "Floor-to-ceiling shelves and quiet north light.", scene: "study", sceneOut: "garden", sceneT: "", seed: "h-r4" },
        { name: "Stair Hall", area: 349, width: 14.8, length: 23.6, ceiling: 11.8, ori: "W", floor: "1st Floor", windows: "leaded window", flooring: "Tiled treads", roomText: "The original oak stair with its restored rail and a leaded window at the landing.", scene: "stairs", sceneOut: "garden", sceneT: "", seed: "h-r5" },
        { name: "Vaulted Room", area: 243, width: 17.4, length: 14, ceiling: 12.8, ori: "E", floor: "1st Floor", windows: "2 windows", flooring: "Brick", roomText: "A ground-floor room under the original barrel vault, used as a studio. Its own door to the street.", scene: "hall", sceneOut: "garden", sceneT: "", seed: "h-r6" }
    ] },
    { title: "Hillside Building Lot", location: "Topanga", locationNote: "South-facing slope, canyon views", type: "Land", mode: "sale", price: 985000, priceNote: "", beds: 0, baths: 0, interior: 0, lot: 34500, terrace: 0, floors: 0, yearBuilt: 0, energyRating: 0, status: "Utilities at the line", statusTone: "green", featured: false, scene: "land", sceneTime: "morning", seed: "poz-1", photo: PHOTO_LOTVIEW, plan: "none", description: "A 34,500 sq ft parcel on a south-facing slope above the canyon road, close to level at the building pad and falling away below. Canyon and ridge views, and only low-density building around it.\n\nPower, water and sewer are all at the property line, and a graded road runs to the pad. Zoning allows a single-family residence.", features: "Utilities at the line, South-facing slope, Graded access road, Zoned single-family, Canyon views, No neighbours above", nearby: "Topanga village \u2014 1.2 mi\nTopanga Elementary \u2014 1.8 mi\nMarket \u2014 1.3 mi\nCanyon restaurants \u2014 0.9 mi\nTopanga State Park \u2014 0.3 mi\nMetro bus, Topanga Cyn. \u2014 0.7 mi", gallery: [
        { k: "exterior", v: "land", out: "", t: "evening", seed: "poz-2", caption: "Late afternoon" },
        { k: "exterior", v: "land", out: "", t: "winter", seed: "poz-3", caption: "Winter access" },
        { k: "exterior", v: "land", out: "", t: "day", seed: "poz-4", caption: "The surroundings" }
    ], rooms: [] },
    { title: "Designer Apartment", location: "Silver Lake", locationNote: "Furnished, available now", type: "Apartment", mode: "rent", price: 4800, priceNote: "/ month plus utilities", beds: 2, baths: 1, interior: 940, lot: 0, terrace: 0, floors: 1, footprintW: 34.1, footprintD: 26.9, yearBuilt: 2016, energyRating: 47, status: "Available Oct 1", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kri-1", plan: "none", description: "A fully furnished apartment in a low-energy building, two years after an interior remodel. Most of the furniture was made to measure and stays with the lease.\n\nA parking space and a storage locker are included. Twelve-month lease with the option to renew; deposit equal to two months.", features: "Fully furnished, Parking space, Storage locker, 65 sq ft balcony, Dishwasher and laundry, Fiber internet, Pets considered", nearby: "Sunset Junction \u2014 0.4 mi \u2014 city\nIvanhoe Elementary \u2014 0.5 mi \u2014 school\nGrocery \u2014 0.3 mi \u2014 shop\nCaf\u00e9s and bistros \u2014 300 ft \u2014 cafe\nPolice station \u2014 0.9 mi \u2014 police\nGym \u2014 0.4 mi \u2014 gym\nSilver Lake Reservoir \u2014 0.6 mi \u2014 park\nMetro bus, Sunset \u2014 350 ft \u2014 bus", gallery: [
        { k: "interior", v: "living", out: "city", t: "", seed: "kri-liv", caption: "Living room", image: PHOTO_ORANGEROOM },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "kri-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "kri-bed", caption: "Bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "kri-bath", caption: "Bathroom" }
    ], rooms: [
        { name: "Living and Kitchen", area: 321, width: 20.3, length: 15.75, ceiling: 8.86, ori: "SW", floor: "3rd Floor", windows: "2 windows and a balcony door", flooring: "Oak-look vinyl", roomText: "An open room with a custom kitchen run and a door to the balcony.", scene: "living", sceneOut: "city", sceneT: "", seed: "k-r1", roomPhoto: PHOTO_ORANGEROOM },
        { name: "Bedroom", area: 177, width: 13.45, length: 13.1, ceiling: 8.86, ori: "SE", floor: "3rd Floor", windows: "1 window", flooring: "Oak-look vinyl", roomText: "A bedroom with a built-in closet and blackout shades.", scene: "bedroom", sceneOut: "city", sceneT: "", seed: "k-r2" },
        { name: "Second Bedroom", area: 129, width: 10.8, length: 11.9, ceiling: 8.86, ori: "SE", floor: "3rd Floor", windows: "1 window", flooring: "Oak-look vinyl", roomText: "A smaller room, currently set up as an office.", scene: "kids", sceneOut: "city", sceneT: "", seed: "k-r3" },
        { name: "Bathroom", area: 67, width: 7.2, length: 9.25, ceiling: 8.53, ori: "N", floor: "3rd Floor", windows: "no window, vented", flooring: "Tile", roomText: "Walk-in shower, washer and dryer, wall-hung toilet.", scene: "bath", sceneOut: "city", sceneT: "", seed: "k-r4" },
        { name: "Entry", area: 60, width: 9.2, length: 6.55, ceiling: 8.53, ori: "N", floor: "3rd Floor", windows: "no windows", flooring: "Tile", roomText: "An entry with a built-in coat closet.", scene: "hall", sceneOut: "city", sceneT: "", seed: "k-r5" },
        { name: "Balcony", area: 65, width: 9.85, length: 6.55, ceiling: 0, ori: "SW", floor: "3rd Floor", windows: "\u2014", flooring: "Tile", roomText: "Afternoon sun, room for two chairs and a table.", scene: "terrace", sceneOut: "", sceneT: "day", seed: "k-r6" }
    ] },
    { title: "Creative Office Suite", location: "Culver City", locationNote: "Second floor, private entrance", type: "Commercial", mode: "rent", price: 9400, priceNote: "/ month plus CAM", beds: 0, baths: 2, interior: 1780, lot: 0, terrace: 0, floors: 1, footprintW: 49.2, footprintD: 32.8, yearBuilt: 2008, energyRating: 62, status: "Available now", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kom-1", plan: "none", description: "A second-floor suite two blocks from the Expo line, refreshed in 2023. Five closable offices, a conference room, a kitchen and its own restrooms.\n\nTwo parking spaces in the courtyard, a staffed lobby and common-area cleaning are included. The floor can also be leased in halves.", features: "5 closable offices, Conference room, Zoned A/C, 2 parking spaces, Staffed lobby, 1 Gb/s fiber, Private kitchen, Divisible floor plate", nearby: "Downtown Culver City \u2014 0.3 mi\nWest LA College \u2014 1.4 mi\nPlatform and shops \u2014 0.4 mi\nLunch spots \u2014 100 ft\nBallona Creek path \u2014 0.7 mi\nMetro E Line \u2014 0.3 mi", gallery: [
        { k: "interior", v: "office", out: "city", t: "", seed: "kom-off", caption: "Open plan", image: PHOTO_STUDIORM },
        { k: "interior", v: "study", out: "city", t: "", seed: "kom-mtg", caption: "Conference room", image: PHOTO_BOARDRM },
        { k: "interior", v: "hall", out: "city", t: "", seed: "kom-hall", caption: "Entry corridor" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "kom-kit", caption: "Kitchen" }
    ], rooms: [
        { name: "Open Plan", area: 413, width: 26.25, length: 15.75, ceiling: 9.84, ori: "SE", floor: "2nd Floor", windows: "4 windows", flooring: "Contract carpet", roomText: "The main work floor for ten people, with acoustic ceilings and dimmable lighting.", scene: "office", sceneOut: "city", sceneT: "", seed: "o-r1", roomPhoto: PHOTO_STUDIORM },
        { name: "Conference Room", area: 243, width: 17.4, length: 14, ceiling: 9.84, ori: "S", floor: "2nd Floor", windows: "2 windows", flooring: "Contract carpet", roomText: "Seats twelve, with a wall display and acoustic panels.", scene: "study", sceneOut: "city", sceneT: "", seed: "o-r2", roomPhoto: PHOTO_BOARDRM },
        { name: "Principal's Office", area: 181, width: 13.8, length: 13.1, ceiling: 9.84, ori: "SW", floor: "2nd Floor", windows: "1 window", flooring: "Vinyl plank", roomText: "A private office with afternoon light and its own storage.", scene: "office", sceneOut: "city", sceneT: "", seed: "o-r3" },
        { name: "Kitchen", area: 121, width: 10.5, length: 11.5, ceiling: 9.84, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Tile", roomText: "Seating for six, a dishwasher and an espresso machine.", scene: "kitchen", sceneOut: "city", sceneT: "", seed: "o-r4" },
        { name: "Reception and Corridor", area: 198, width: 20, length: 9.9, ceiling: 9.84, ori: "N", floor: "2nd Floor", windows: "no windows", flooring: "Tile", roomText: "The arrival area, with room for a desk and a waiting zone.", scene: "hall", sceneOut: "city", sceneT: "", seed: "o-r5" }
    ] }
]

const DEFAULT_ABOUT_TEXT =
    "Twelve years on the Los Angeles residential market. I photograph, measure and write up every property myself — because buyers don't decide from a listing, they decide from whether they can picture living in the space."

const DEFAULT_CTA_CARDS = [
    { kicker: "Valuation", title: "A price within 48 hours", text: "A walk-through in person, comparables that actually closed nearby, one clear number." },
    { kicker: "Presentation", title: "Photography, floor plan, video", text: "A professional photographer, every room measured, and an interactive plan like the one on this site." },
    { kicker: "Sale", title: "You sign, I handle the rest", text: "Marketing, showings, negotiation, escrow and the handover. All in one place." },
]

/* The two lists Framer could not hold inside a listing, flattened out of the
   demo data so a freshly placed component still shows a full detail page. */
const DEFAULT_ROOMS: any[] = DEFAULT_LISTINGS.reduce((acc: any[], l: any, i: number) => {
    (l.rooms || []).forEach((r: any) => {
        acc.push({
            property: i + 1, name: r.name, area: r.area, width: r.width, length: r.length,
            ceiling: r.ceiling, ori: r.ori, floor: r.floor, windows: r.windows,
            flooring: r.flooring, roomText: r.roomText, scene: r.scene, sceneOut: r.sceneOut,
            roomPhoto: r.roomPhoto,
            planX: r.planX || 0, planY: r.planY || 0,
        })
    })
    return acc
}, [])

/* The demo properties measured floor by floor. Areas add up to each listing's
   Interior, so the two never contradict each other on the page. */
const DEFAULT_FLOORS: any[] = [
    { property: 1, name: "1st Floor", area: 1074, width: 43.9, depth: 29.3, note: "Living space, kitchen and study" },
    { property: 1, name: "2nd Floor", area: 928, width: 37.4, depth: 24.3, note: "Bedrooms, bathroom and roof terrace" },
    { property: 2, name: "Penthouse", area: 1765, width: 45.93, depth: 38.38, note: "The whole top floor" },
    { property: 3, name: "4th Floor", area: 1480, width: 47.2, depth: 33.5, note: "One open volume under the trusses" },
    { property: 4, name: "1st Floor", area: 1290, width: 38.4, depth: 33.6, note: "Living room, kitchen and utility" },
    { property: 4, name: "2nd Floor", area: 1240, width: 38.4, depth: 32.3, note: "Three bedrooms and a bathroom" },
    { property: 5, name: "1st Floor", area: 2090, width: 52.5, depth: 39.8, note: "Reception rooms and kitchen" },
    { property: 5, name: "2nd Floor", area: 2090, width: 52.5, depth: 39.8, note: "Bedrooms and bathrooms" },
    { property: 7, name: "3rd Floor", area: 915, width: 34.1, depth: 26.9, note: "" },
    { property: 8, name: "2nd Floor", area: 1615, width: 49.2, depth: 32.8, note: "" },
]

/* The demo pins, flattened out of the Nearby lines so the new list arrives
   filled in rather than empty. */
const DEFAULT_PINS: any[] = DEFAULT_LISTINGS.reduce((acc: any[], l: any, i: number) => {
    parseNearbyLines(l.nearby).forEach((m: any) => {
        acc.push({ property: i + 1, n: m.n, d: m.d, kind: m.kind || "city", href: "", x: 0, y: 0 })
    })
    return acc
}, [])

const DEFAULT_PHOTOS: any[] = DEFAULT_LISTINGS.reduce((acc: any[], l: any, i: number) => {
    (l.gallery || []).forEach((g: any) => {
        acc.push({ property: i + 1, caption: g.caption, v: g.v, out: g.out, t: g.t || "", image: g.image })
    })
    return acc
}, [])

const DEFAULT_REVIEWS: any[] = [
    { quote: "The whole process was remarkably professional. The house was presented better than we could have pictured it \u2014 the floor plan with every room measured convinced our buyer before he ever drove out.", who: "Jane & Peter", where: "Sold a villa, Pacific Palisades", stars: 5 },
    { quote: "We looked for a year. Adam sent us three listings and the second one was ours. First time I felt an agent was actually listening to what we needed.", who: "Martin H.", where: "Bought a house, Sherman Oaks", stars: 5 },
    { quote: "We sold eight percent above another brokerage's estimate. And not one unpleasant phone call \u2014 he handled all of it.", who: "Clara S.", where: "Sold a loft, Arts District", stars: 5 },
    { quote: "What I value is that he never oversells. He told us the things we did not want to hear, and that is why we made the right call.", who: "The Novak family", where: "Bought a penthouse, West Hollywood", stars: 5 },
    { quote: "A 1923 house is its own kind of problem and Adam understood it. He found the buyer who had been waiting two years for exactly that.", who: "Paul M., AIA", where: "Sold a house, Hancock Park", stars: 5 }
]

// ---------------------------------------------------------------------------
// Page templates. `e` escapes, `br` keeps a single line break as <br>, so a
// buyer can control where a headline wraps without being able to inject markup.
// ---------------------------------------------------------------------------
const br = (s: string) => esc(s || "").replace(/\n/g, "<br>")
const e = esc

const HOUSE_MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.2 12 5l8 7.2"/><path d="M6.6 11.4V19h10.8v-7.6"/><path d="M10.2 19v-4.2h3.6V19"/></svg>'

/* Header and footer share one brand block. An uploaded logo replaces the drawn
   mark; a second file for the dark hero is optional, and without one the same
   logo is used over both. */
function brandHTML(M: any) {
  const logo = M.logo, dark = M.logoDark
  const mark = logo
    ? '<img class="brand__logo' + (dark ? " brand__logo--light" : "") + '" src="' + e(logo) + '" alt="' + e(M.brandName) + '">' +
      (dark ? '<img class="brand__logo brand__logo--dark" src="' + e(dark) + '" alt="" aria-hidden="true">' : "")
    : '<span class="brand__mark" aria-hidden="true">' + HOUSE_MARK + '</span>'
  const words = (!logo || M.brandTextWithLogo)
    ? '<span><span class="brand__name">' + e(M.brandName) + '</span><span class="brand__sub">' + e(M.brandSub) + '</span></span>'
    : ""
  return '<a class="brand" href="#/" data-route="/">' + mark + words + '</a>'
}

function headerHTML(M: any) { return `<header class="site-header" id="header">
  <nav class="nav" aria-label="Main navigation">
    ${brandHTML(M)}

    <div class="nav__links">
      ${M.navLinks.map(l => `<a class="nav__link" href="#${e(l.target)}">${e(l.label)}</a>`).join("")}
    </div>

    <div class="nav__cta">
      <a class="btn btn--cta magnetic" href="#${e(M.navCtaTarget)}">${e(M.navCta)}</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</header>

<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
  <div class="mobile-menu__scrim" data-close-menu></div>
  <div class="mobile-menu__panel glass glass--strong" role="dialog" aria-modal="true" aria-label="Menu">
    ${M.navLinks.map((l, i) => `<a class="mobile-menu__link" href="#${e(l.target)}">${e(l.label)} <span class="mono">${pad2(i + 1)}</span></a>`).join("")}
    <div class="mobile-menu__foot">
      <a class="btn" href="#${e(M.navCtaTarget)}">${e(M.navCta)}</a>
      <a class="btn btn--line" href="${e(M.agent.phoneHref)}">${e(M.agent.phone)}</a>
    </div>
  </div>
</div>

` }

function homeHTML(M: any) { return `<div class="view" id="viewHome">

  <!-- HERO -->
  ${M.show.hero ? `<section class="hero" id="hero">
    <div class="hero__media" id="heroMedia" aria-hidden="true"></div>
    <div class="hero__scrim"></div>

    <div class="hero__inner">
      <div class="hero__card">
        <span class="eyebrow">${e(M.hero.eyebrow)}</span>
        <h1>${br(M.hero.headline)}</h1>
        <p class="hero__sub">${e(M.hero.sub)}</p>
        <div class="hero__cta">
          <a class="btn btn--on-dark magnetic" href="#${e(M.hero.ctaTarget)}">
            ${e(M.hero.ctaLabel)}
            <svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </a>
          <a class="btn btn--on-dark-ghost magnetic" href="#${e(M.hero.cta2Target)}">${e(M.hero.cta2Label)}</a>
        </div>
      </div>

      <div class="hero__aside">
        ${M.hero.chips.map((c, i) => `<div class="hero__chip"><span class="mono">${pad2(i + 1)}</span> <b>${e(c.value)}</b> ${e(c.label)}</div>`).join("")}
      </div>
    </div>

    <div class="scroll-hint" aria-hidden="true">
      <span class="scroll-hint__rail"></span>
      ${e(M.hero.scrollLabel)}
    </div>
  </section>` : ""}

  <!-- TRUST -->
  ${M.show.trust ? `<section class="section section--tight">
    <div class="wrap">
      <div class="trust reveal">
        ${M.trust.map(t => `<div class="trust__item"><div class="trust__n">${e(t.value)}<span>${e(t.suffix)}</span></div><div class="trust__l">${e(t.label)}</div></div>`).join("")}
      </div>
    </div>
  </section>` : ""}

  <!-- FEATURED -->
  ${M.show.featured ? `<section class="section" id="featured">
    <div class="wrap">
      <div class="sec-head reveal">
        <div class="sec-head__text">
          <span class="eyebrow">${e(M.featured.eyebrow)}</span>
          <h2>${br(M.featured.heading)}</h2>
          <p class="lede">${e(M.featured.lede)}</p>
        </div>
        <a class="btn btn--line magnetic" href="#listings">
          ${e(M.featured.linkLabel)}
          <svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
        </a>
      </div>
      <div class="grid-props grid-props--featured" id="featuredGrid"></div>
    </div>
  </section>` : ""}

  <!-- CATALOGUE -->
  ${M.show.catalogue ? `<section class="section" id="listings">
    <div class="wrap">
      <div class="sec-head reveal">
        <div class="sec-head__text">
          <span class="eyebrow">${e(M.catalogue.eyebrow)}</span>
          <h2>${br(M.catalogue.heading)}</h2>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filters-sentinel" id="filtersSentinel" aria-hidden="true"></div>
      <div class="filters glass reveal" id="filters" role="search" aria-label="Property filters">
        <div class="filters__row filters__row--top">
          <div class="seg" id="segMode" role="tablist" aria-label="Buy or rent">
            <button class="seg__btn is-active" role="tab" aria-selected="true" data-mode="all">All</button>
            <button class="seg__btn" role="tab" aria-selected="false" data-mode="sale">Buy</button>
            <button class="seg__btn" role="tab" aria-selected="false" data-mode="rent">Rent</button>
          </div>
          <div class="f-sep" aria-hidden="true"></div>
          <div class="f-group">
            <span class="f-label">Type</span>
            <div class="chips" id="chipsType"></div>
          </div>
          <button class="filters__compact" id="filtersToggle" aria-expanded="false" aria-controls="filters">
            <b id="filtersCompactCount">8</b> results · Filters
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div class="filters__more" id="filtersMore"><div class="filters__more-inner">
        <div class="filters__row filters__row--adv">
          <div class="f-group">
            <span class="f-label">Area</span>
            <select class="f-select" id="selLocation" aria-label="Neighborhood"></select>
            <select class="f-select" id="selSort" aria-label="Sort by">
              <option value="new">Newest</option>
              <option value="price-asc">Price — low to high</option>
              <option value="price-desc">Price — high to low</option>
              <option value="area-desc">Size — largest first</option>
            </select>
          </div>
          <div class="f-sep" aria-hidden="true"></div>
          <div class="f-group">
            <span class="f-label">Beds</span>
            <div class="chips" id="chipsDisp"></div>
          </div>
          <div class="f-sep" aria-hidden="true"></div>
          <div class="f-group">
            <span class="f-label">Price</span>
            <div class="range" id="rangePrice">
              <span class="range__track"></span><span class="range__fill" id="priceFill"></span>
              <input type="range" id="priceMin" min="0" max="20" value="0" step="1" aria-label="Minimum price">
              <input type="range" id="priceMax" min="0" max="20" value="20" step="1" aria-label="Maximum price">
            </div>
            <span class="range__val" id="priceVal">any price</span>
          </div>
          <div class="f-sep" aria-hidden="true"></div>
          <div class="f-group">
            <span class="f-label">Size from</span>
            <div class="range" style="width:min(190px,44vw)">
              <span class="range__track"></span><span class="range__fill" id="areaFill"></span>
              <input type="range" id="areaMin" min="0" max="4000" value="0" step="100" aria-label="Minimum interior size">
            </div>
            <span class="range__val" id="areaVal">any size</span>
          </div>
          <div class="f-sep" aria-hidden="true"></div>
          <label class="chip" style="cursor:pointer; display:inline-flex; align-items:center; gap:8px;">
            <input type="checkbox" id="chkLot" style="accent-color:var(--ink);"> With a lot
          </label>
        </div>

        <div class="filters__foot">
          <p class="filters__count" id="filterCount"></p>
          <button class="link-quiet" id="resetFilters">Clear filters</button>
        </div>
        </div></div>
      </div>

      <div class="grid-props" id="catalogGrid"></div>
    </div>
  </section>` : ""}

  <!-- AGENT -->
  ${M.show.about ? `<section class="section" id="about">
    <div class="wrap">
      <div class="agent">
        <div class="agent__media reveal" id="agentMedia">
<div class="agent__badge">
            <div>
              <span class="mono">Agent</span>
              <div style="font-size:1.05rem; margin-top:6px;">${e(M.agent.name)}</div>
            </div>
            <span class="stars" aria-label="Rated 4.9 out of 5">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.9 7 .6-5.3 4.7 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.5l7-.6z"/></svg>
            </span>
          </div>
        </div>

        <div class="reveal" style="--d:120ms">
          <span class="eyebrow">${e(M.about.eyebrow)}</span>
          <h2 class="agent__quote" style="margin-top:18px;">${br(M.about.quote)}</h2>
          <p class="lede">${e(M.about.text)}</p>

          <div class="agent__stats">
            ${M.about.stats.map(s => `<div class="agent__stat"><b>${e(s.value)}</b><span>${e(s.label)}</span></div>`).join("")}
          </div>

          <div class="agent__contact">
            <a class="btn magnetic" href="#contact">
              ${e(M.about.ctaLabel)}
              <svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
            <a class="contact-pill" href="${e(M.agent.phoneHref)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>
              ${e(M.agent.phone)}
            </a>
            <a class="contact-pill" href="mailto:${e(M.agent.email)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>
              ${e(M.agent.email)}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>` : ""}

  <!-- TESTIMONIALS -->
  ${M.show.reviews ? `<section class="section" id="reviews">
    <div class="wrap">
      <div class="sec-head reveal">
        <div class="sec-head__text">
          <span class="eyebrow">${e(M.reviews.eyebrow)}</span>
          <h2>${br(M.reviews.heading)}</h2>
        </div>
        <div class="tsm__nav">
          <button class="round-btn" id="tsmPrev" aria-label="Previous review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="round-btn" id="tsmNext" aria-label="Next review">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
      <div class="tsm">
        <div class="tsm__rail" id="tsmRail"></div>
      </div>
    </div>
  </section>` : ""}

  <!-- CONTACT CTA -->
  ${M.show.contact ? `<section class="section" id="contact">
    <div class="wrap">
      <div class="dark-sec reveal">
        <div class="cta">
          <span class="eyebrow">${e(M.cta.eyebrow)}</span>
          <h2 style="margin-top:20px;">${br(M.cta.heading)}</h2>
          <p>${e(M.cta.text)}</p>
          <div class="cta__btns">
            <a class="btn btn--on-dark magnetic" href="mailto:${e(M.agent.email)}?subject=${encodeURIComponent(M.cta.primaryLabel)}">
              ${e(M.cta.primaryLabel)}
              <svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
            <a class="btn btn--on-dark-ghost magnetic" href="${e(M.agent.phoneHref)}">${e(M.cta.secondaryLabel)}</a>
          </div>

          <div class="cta__cards">
            ${M.cta.cards.map((c, i) => `<div class="cta__card glass--dark">
              <span class="mono">${pad2(i + 1)} — ${e(c.kicker)}</span>
              <b>${e(c.title)}</b>
              <span>${e(c.text)}</span>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  </section>` : ""}
</div>

` }

function footerHTML(M: any) { return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        ${brandHTML(M)}
        <p class="footer__blurb">${e(M.footer.blurb)}</p>
      </div>
      <div class="footer__col">
        <h4>Listings</h4>
        <a href="#for-sale">Buy</a>
        <a href="#for-rent">Rent</a>
        <a href="#listings">All properties</a>
      </div>
      <div class="footer__col">
        <h4>Agent</h4>
        <a href="#about">About</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">List your home</a>
      </div>
      <div class="footer__col">
        <h4>Contact</h4>
        <a href="${e(M.agent.phoneHref)}">${e(M.agent.phone)}</a>
        <a href="mailto:${e(M.agent.email)}">${e(M.agent.email)}</a>
        <p>${e(M.footer.address)}</p>
      </div>
    </div>
    <div class="footer__bot">
      <span>${e(M.footer.left)}</span>
      <span class="mono">${e(M.footer.right)}</span>
    </div>
  </div>
</footer>

` }

function overlaysHTML() { return `<div class="popover" id="popover" role="tooltip" aria-hidden="true"></div>

<div class="sheet" id="sheet" aria-hidden="true">
  <div class="sheet__scrim" data-close-sheet></div>
  <div class="sheet__panel" id="sheetPanel" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
    <div class="sheet__grab" id="sheetGrab" aria-hidden="true"></div>
    <span class="sheet__handle" aria-hidden="true"></span>
    <button class="icon-btn sheet__close" data-close-sheet aria-label="Close room detail">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="sheet__scroll" id="sheetBody"></div>
  </div>
</div>

<div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Photo gallery">
  <div class="lightbox__bar">
    <span class="lightbox__counter" id="lbCounter">01 / 08</span>
    <span class="lightbox__counter" id="lbCaption" style="color:rgba(var(--on-dark-rgb),0.55)"></span>
    <button class="icon-btn" id="lbClose" aria-label="Close gallery">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="lightbox__stage" id="lbStage">
    <button class="lightbox__arrow lightbox__arrow--prev" id="lbPrev" aria-label="Previous photograph">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <img class="lightbox__img" id="lbImg" alt="">
    <button class="lightbox__arrow lightbox__arrow--next" id="lbNext" aria-label="Next photograph">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
    </button>
  </div>
  <div class="lightbox__thumbs" id="lbThumbs"></div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

` }

// ---------------------------------------------------------------------------
// From panel values to the data model the builders above expect
// ---------------------------------------------------------------------------
const imgSrc = (v: any) => (typeof v === "string" ? v : (v && v.src) || "")

/* The stylesheet is scoped to .thr-root, so it cannot reach <body>; the sheet
   and the lightbox lock the page from here instead. */
let scrollLocks = 0
function lockScroll(on: boolean) {
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1))
    document.body.style.overflow = scrollLocks > 0 ? "hidden" : ""
}
const listOf = (s: string) =>
    String(s || "").split(",").map(x => x.trim()).filter(Boolean)

/* "Palisades Village — 1.4 mi" per line, dropped onto the map's fixed pins */
/* Where an unplaced pin lands, and the icon it takes if the line does not name
   one. Ten slots, spread so a full set never overlaps the house in the middle. */
const PIN_LAYOUT = [
    { id: "poi1", kind: "city", x: 24, y: 22 },
    { id: "poi2", kind: "school", x: 66, y: 34 },
    { id: "poi3", kind: "shop", x: 30, y: 68 },
    { id: "poi4", kind: "restaurant", x: 71, y: 66 },
    { id: "poi5", kind: "park", x: 82, y: 18 },
    { id: "poi6", kind: "transport", x: 42, y: 78 },
    { id: "poi7", kind: "post", x: 14, y: 44 },
    { id: "poi8", kind: "pharmacy", x: 88, y: 46 },
    { id: "poi9", kind: "gym", x: 58, y: 12 },
    { id: "poi10", kind: "parking", x: 20, y: 88 },
]

/* Framer cannot nest one Array control inside another, and it drops any key an
   array item has no control for. Rooms and gallery photos therefore live in
   their own top-level lists, each row naming the property it belongs to by its
   position in ⑥ Listings. Written as a nested array they were silently thrown
   away, and the detail page came up with no rooms and an empty gallery. */
function rowsFor(rows: any[], idx: number): any[] {
    return (rows || []).filter((r: any) => {
        const n = r && r.property == null ? 1 : Math.round(+r.property)
        return (isFinite(n) && n > 0 ? n : 1) === idx + 1
    })
}

/* The older way of writing pins: Place — distance — icon — x,y on one line.
   Still read for any property that has no rows in ⑩ Map Pins. */
function parseNearbyLines(text: any): any[] {
    return String(text || "")
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => {
            const parts = line.split("—")
            const at = /^\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*$/.exec(parts[3] || "")
            return {
                n: (parts[0] || line).trim(),
                d: (parts[1] || "").trim(),
                kind: (parts[2] || "").trim().toLowerCase(),
                x: at ? parseFloat(at[1]) : 0,
                y: at ? parseFloat(at[2]) : 0,
                href: "",
            }
        })
}

function buildProperties(items: any[], roomRows?: any[], photoRows?: any[], floorRows?: any[], pinRows?: any[]): any[] {
    const list = items && items.length ? items : DEFAULT_LISTINGS
    const hasRoomRows = !!(roomRows && roomRows.length)
    const hasPhotoRows = !!(photoRows && photoRows.length)
    const hasFloorRows = !!(floorRows && floorRows.length)
    const hasPinRows = !!(pinRows && pinRows.length)
    return list.map((it: any, idx: number) => {
        const slots = PLAN_SLOTS[it.plan] || null
        const seed = it.seed || "listing-" + idx
        const uploads = [it.photo, it.photo2, it.photo3, it.photo4, it.photo5]
            .map(imgSrc)
            .filter(Boolean)

        /* The Photos list wins when it has anything to say about this listing;
           otherwise fall back to whatever the listing carries itself, which is
           how the built-in demo data and the standalone HTML build feed it. */
        const galleryRows = hasPhotoRows ? rowsFor(photoRows, idx) : (it.gallery || [])
        const gallery = galleryRows.map((g: any, i: number) => {
            const gv = g.v || "living"
            const outdoor = OUTDOOR_GALLERY_SCENES.indexOf(gv) >= 0 || gv === "terrace"
            return {
                spec: {
                    k: g.k || (outdoor ? "exterior" : "interior"),
                    v: gv === "terrace" ? "penthouse" : gv,
                    out: g.out || "garden",
                    t: g.t || undefined,
                    seed: g.seed || seed + "-g" + i,
                },
                caption: g.caption || "",
                outdoor: outdoor,
                src: imgSrc(g.image) || uploads[i + 1] || "",
            }
        })
        const cover = {
            spec: { k: "exterior", v: it.scene || "villa", t: it.sceneTime || "dusk", seed },
            caption: it.title || "",
            src: uploads[0] || "",
        }

        /* Real photographs from the gallery stand in for any room that has none
           of its own, in the order they were added. The cover is the building
           and so is any outdoor shot, and a photograph a room already carries
           is never handed to a second room. */
        const roomSource = hasRoomRows ? rowsFor(roomRows, idx) : (it.rooms || [])
        const claimed: any = {}
        roomSource.forEach((r: any) => {
            const c = imgSrc(r.roomPhoto)
            if (c) claimed[c] = true
        })
        const spare = gallery
            .filter((g: any) => !g.outdoor)
            .map((g: any) => g.src)
            .filter((src: string) => src && !claimed[src])
        let nextSpare = 0

        const rooms = roomSource.map((r: any, i: number) => {
            const slot = slots && slots[i]
            let photo = imgSrc(r.roomPhoto)
            if (!photo && nextSpare < spare.length) photo = spare[nextSpare++]
            return {
                id: "p" + idx + "-r" + i,
                no: i + 1,
                name: r.name || "Room " + (i + 1),
                area: +r.area || 0,
                width: +r.width || 0,
                length: +r.length || 0,
                ceilingHeight: r.ceiling == null ? 9 : +r.ceiling,
                ori: r.ori || "S",
                floor: r.floor || "1st Floor",
                windows: r.windows || "—",
                flooring: r.flooring || "—",
                description: r.roomText || "",
                image: photo,
                img: OUTDOOR_ROOM_SCENES.indexOf(r.scene) >= 0
                    ? { k: "exterior", v: "penthouse", t: r.sceneT || "evening", seed: r.seed || "p" + idx + "r" + i }
                    : { k: "interior", v: r.scene || "living", out: r.sceneOut || "garden", t: r.sceneT || undefined, seed: r.seed || "p" + idx + "r" + i },
                level: slot ? slot[0] : "l1",
                polygon: slot ? slot[1] : null,
                labelAt: slot ? slot[2] : null,
                /* read by buildRoomPlan when the listing draws its own plan */
                planX: +r.planX || 0,
                planY: +r.planY || 0,
                planW: +r.planW || 0,
                planH: +r.planH || 0,
            }
        })

        /* Floors the owner has measured. They also fix the order of the level
           tabs on a plan built from the rooms, which otherwise follows
           whichever floor a room happened to mention first. */
        const levels = (hasFloorRows ? rowsFor(floorRows, idx) : (it.levels || [])).map((f: any) => ({
            name: f.name || "Floor",
            area: +f.area || 0,
            width: +f.width || 0,
            depth: +f.depth || 0,
            note: f.note || "",
        }))

        /* One row per place, each with its own Google Maps link. A property
           with no rows falls back to the older Nearby lines on the listing, so
           nothing typed there is lost. */
        const poi: any[] = [{ id: "home", n: it.title || "This property", d: "", x: 50, y: 50, kind: "home" }]
        const pinsHere = hasPinRows ? rowsFor(pinRows, idx) : []
        const source = pinsHere.length ? pinsHere : parseNearbyLines(it.nearby)
        source.slice(0, PIN_LAYOUT.length).forEach((m: any, i: number) => {
            const clamp = (v: number) => Math.max(4, Math.min(96, v))
            const kind = String(m.kind || "").toLowerCase()
            const x = +m.x || 0, y = +m.y || 0
            poi.push({
                id: PIN_LAYOUT[i].id,
                n: m.n || "",
                d: m.d || "",
                href: String(m.href || "").trim(),
                /* 0,0 means "wherever the next free slot is" — nobody places a
                   pin in the very corner, and it saves a second switch. */
                x: x ? clamp(x) : PIN_LAYOUT[i].x,
                y: y ? clamp(y) : PIN_LAYOUT[i].y,
                kind: POI_ICON[kind] && kind !== "home" ? kind : PIN_LAYOUT[i].kind,
            })
        })

        return mkProperty({
            id: "p" + idx,
            slug: "p" + idx,
            title: it.title || "Untitled listing",
            type: it.type || "House",
            mode: it.mode === "rent" ? "rent" : "sale",
            location: it.location || "",
            locationNote: it.locationNote || "",
            price: +it.price || 0,
            priceNote: it.priceNote || "",
            beds: +it.beds || 0,
            baths: +it.baths || 0,
            totalArea: +it.interior || 0,
            lotArea: +it.lot || 0,
            terraceArea: +it.terrace || 0,
            floors: +it.floors || 0,
            yearBuilt: +it.yearBuilt || 0,
            energyRating: +it.energyRating || 0,
            status: it.status || "",
            statusTone: it.statusTone || "green",
            featured: it.featured !== false,
            description: String(it.description || "").split(/\n\s*\n/).filter(Boolean),
            features: listOf(it.features),
            images: [cover].concat(gallery),
            /* "rooms" draws the plan from the rooms' own positions; the named
               plans are the built-in demo geometry. */
            footprintW: +it.footprintW || 0,
            footprintD: +it.footprintD || 0,
            levels: levels,
            floorPlan: it.plan === "rooms" ? buildRoomPlan(rooms, levels.map(f => f.name)) : (FLOOR_PLANS[it.plan] || null),
            planImage: imgSrc(it.planImage) || "",
            videoLink: String(it.videoLink || "").trim(),
            rooms: rooms,
            poi: poi,
        })
    })
}

// ---------------------------------------------------------------------------
// Interaction. Every line below ran at load time in the HTML build; here it is
// one function the effect calls once the markup is on the page, and everything
// it registers is recorded so a re-render can take it off again.
// ---------------------------------------------------------------------------
function createApp(root: any) {
  ROOT = root
  const bin: any[] = []
  const recorder = (target: any) => ({
    addEventListener(type: string, fn: any, opts?: any) {
      target.addEventListener(type, fn, opts)
      bin.push([target, type, fn, opts])
    },
  })
  const doc = recorder(document)
  const win = recorder(window)


  /* ---------- toast ------------------------------------------------- */
  let toastT = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2600);
  }

  /* ---------- header ------------------------------------------------ */
  (function header() {
    const el = $("#header"), burger = $("#burger"), menu = $("#mobileMenu");
    if (!el || !burger || !menu) return;
    let last = 0;
    function onScroll() {
      const y = window.scrollY;
      el.classList.toggle("is-scrolled", y > 24);
      /* dark nav while a dark hero sits behind it */
      const hero = $(".hero:not([hidden])") || $(".detail-hero");
      const heroVisible = hero && hero.getBoundingClientRect().bottom > 120;
      el.classList.toggle("on-dark", !!heroVisible);
      el.classList.toggle("is-hidden", y > last && y > 320 && !menu.classList.contains("is-open"));
      last = y;
    }
    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onScroll);
    onScroll();

    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      lockScroll(open);
    }
    burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    menu.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-menu]") || e.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });

    /* active section in nav */
    const links = $$(".nav__link");
    if ("IntersectionObserver" in window) {
      const io = OBS(new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
        });
      }, { rootMargin: "-45% 0px -50% 0px" }));
      ["listings", "about", "reviews", "contact"].forEach(function (id) { const n = document.getElementById(id); if (n) io.observe(n); });
    }
  })();

  /* ---------- magnetic buttons + smooth anchors --------------------- */
  function bindMagnetic(root) {
    if (!canHover || reduceMotion) return;
    $$(".magnetic", root || document).forEach(function (b) {
      if (b.dataset.mag) return;
      b.dataset.mag = "1";
      b.addEventListener("pointermove", function (e) {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(2) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(2) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* ---------- hero parallax ---------------------------------------- */
  (function parallax() {
    if (reduceMotion) return;
    let ticking = false;
    function run() {
      ticking = false;
      const y = window.scrollY;
      const hm = $("#heroMedia"), dm = $("#detailHeroMedia");
      if (hm && y < window.innerHeight * 1.2) hm.style.transform = "translate3d(0," + (y * 0.22).toFixed(1) + "px,0) scale(1.04)";
      if (dm && y < window.innerHeight * 1.2) dm.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0) scale(1.03)";
    }
    win.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  })();

  /* ---------- catalogue filters ------------------------------------ */
  const PRICE_STEPS = [0, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 12, Infinity]; /* $ millions */
  const F = { mode: "all", types: [], beds: [], location: "all", priceMin: 0, priceMax: 20, areaMin: 0, lot: false, sort: "new" };

  const TYPES = ["Apartment", "House", "Villa", "Land", "Commercial"];
  const BEDS = [1, 2, 3, 4, 5];

  function buildFilterUI() {
    if (!$("#chipsType")) return;
    $("#chipsType").innerHTML = TYPES.map(function (t) {
      const n = PROPERTIES.filter(p => p.type === t).length;
      return '<button class="chip" data-type="' + t + '">' + t + '<span class="mono">' + n + '</span></button>';
    }).join("");
    $("#chipsDisp").innerHTML = BEDS.map(b => '<button class="chip" data-beds="' + b + '">' + b + (b === 5 ? "+ bed" : " bed") + '</button>').join("");
    const locs = PROPERTIES.map(p => p.location).filter((v, i, a) => a.indexOf(v) === i).sort();
    $("#selLocation").innerHTML = '<option value="all">All neighborhoods</option>' + locs.map(l => '<option value="' + esc(l) + '">' + esc(l) + '</option>').join("");
  }

  function priceLabel() {
    const a = PRICE_STEPS[F.priceMin], b = PRICE_STEPS[F.priceMax];
    if (F.priceMin === 0 && F.priceMax === 20) return "any price";
    const f = v => v === Infinity ? "∞" : (v >= 1 ? "$" + num(v, v % 1 ? 2 : 0).replace(/0$/, "") + "M" : "$" + num(v * 1000) + "K");
    return f(a) + " — " + f(b);
  }

  function applyFilters() {
    const grid = $("#catalogGrid");
    if (!grid) return;
    let list = PROPERTIES.filter(function (p) {
      if (F.mode !== "all" && p.mode !== F.mode) return false;
      if (F.types.length && F.types.indexOf(p.type) < 0) return false;
      if (F.beds.length && F.beds.indexOf(Math.min(p.beds, 5)) < 0) return false;
      if (F.location !== "all" && p.location !== F.location) return false;
      if (F.lot && !p.lotArea) return false;
      if (F.areaMin && (p.totalArea || p.lotArea) < F.areaMin) return false;
      /* the price range is a sale-price scale, so rentals sit outside it */
      if (p.mode === "sale") {
        const mil = p.price / 1e6, lo = PRICE_STEPS[F.priceMin], hi = PRICE_STEPS[F.priceMax];
        if (mil < lo || mil > hi) return false;
      }
      return true;
    });
    if (F.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (F.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (F.sort === "area-desc") list.sort((a, b) => (b.totalArea || b.lotArea) - (a.totalArea || a.lotArea));

    grid.innerHTML = list.length ? list.map(propertyCard).join("")
      : '<div class="empty-state" style="grid-column:1/-1"><p>No property matches these filters.</p><button class="link-quiet" id="resetInline" style="margin-top:12px">Clear filters</button></div>';
      const count = $("#filterCount");
    if (count) count.innerHTML = "Showing <b>" + list.length + "</b> of " + PROPERTIES.length + " properties";
      const compact = $("#filtersCompactCount");
    if (compact) compact.textContent = String(list.length);
    observeReveals(grid);
    bindMagnetic(grid);
    const ri = $("#resetInline"); if (ri) ri.addEventListener("click", resetFilters);
  }

  function syncRanges() {
    if (!$("#priceFill")) return;
    const a = Math.min(F.priceMin, F.priceMax), b = Math.max(F.priceMin, F.priceMax);
    /* Percentages come off each input's own max, so changing a range's bounds
       can never leave the fill bar running off down the page again. */
    const pMax = +$("#priceMax").max;
    $("#priceFill").style.left = (a / pMax * 100) + "%";
    $("#priceFill").style.width = ((b - a) / pMax * 100) + "%";
    $("#priceVal").textContent = priceLabel();
    const aMax = +$("#areaMin").max;
    $("#areaFill").style.left = "0%";
    $("#areaFill").style.width = Math.min(100, F.areaMin / aMax * 100) + "%";
    $("#areaVal").textContent = F.areaMin ? num(F.areaMin) + " sq ft" : "any size";
  }

  function resetFilters() {
    if (!$("#segMode")) return;
    F.mode = "all"; F.types = []; F.beds = []; F.location = "all";
    F.priceMin = 0; F.priceMax = 20; F.areaMin = 0; F.lot = false; F.sort = "new";
    $$("#segMode .seg__btn").forEach(b => { const on = b.dataset.mode === "all"; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", String(on)); });
    $$("#chipsType .chip, #chipsDisp .chip").forEach(c => c.classList.remove("is-active"));
    $("#selLocation").value = "all"; $("#selSort").value = "new";
    $("#priceMin").value = 0; $("#priceMax").value = 20; $("#areaMin").value = 0; $("#chkLot").checked = false;
    syncRanges(); applyFilters();
  }

  function bindFilters() {
    if (!$("#segMode")) return;
    $$("#segMode .seg__btn").forEach(function (b) {
      b.addEventListener("click", function () {
        F.mode = b.dataset.mode;
        $$("#segMode .seg__btn").forEach(x => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
        applyFilters();
      });
    });
    $("#chipsType").addEventListener("click", function (e) {
      const c = e.target.closest("[data-type]"); if (!c) return;
      const t = c.dataset.type, i = F.types.indexOf(t);
      if (i < 0) F.types.push(t); else F.types.splice(i, 1);
      c.classList.toggle("is-active", i < 0); applyFilters();
    });
    $("#chipsDisp").addEventListener("click", function (e) {
      const c = e.target.closest("[data-beds]"); if (!c) return;
      const n = +c.dataset.beds, i = F.beds.indexOf(n);
      if (i < 0) F.beds.push(n); else F.beds.splice(i, 1);
      c.classList.toggle("is-active", i < 0); applyFilters();
    });
    $("#selLocation").addEventListener("change", function () { F.location = this.value; applyFilters(); });
    $("#selSort").addEventListener("change", function () { F.sort = this.value; applyFilters(); });
    $("#priceMin").addEventListener("input", function () { F.priceMin = Math.min(+this.value, F.priceMax); this.value = F.priceMin; syncRanges(); applyFilters(); });
    $("#priceMax").addEventListener("input", function () { F.priceMax = Math.max(+this.value, F.priceMin); this.value = F.priceMax; syncRanges(); applyFilters(); });
    $("#areaMin").addEventListener("input", function () { F.areaMin = +this.value; syncRanges(); applyFilters(); });
    $("#chkLot").addEventListener("change", function () { F.lot = this.checked; applyFilters(); });
    $("#resetFilters").addEventListener("click", resetFilters);

    /* A sticky panel that keeps its full height sits on top of the cards the
       whole way down the catalogue. Watch a sentinel just above it: the moment
       the bar sticks, collapse it to one row until the reader asks for more. */
    const bar = $("#filters"), toggle = $("#filtersToggle");
    toggle.addEventListener("click", function () {
      const open = bar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    /* An IntersectionObserver looks like the right tool here and is the wrong
       one: a fast flick, or a jump to the #listings anchor, can carry the
       one-pixel sentinel from below the viewport to above it inside a single
       frame. No threshold is crossed, no callback fires, and the bar stays
       full height on top of the cards — which is exactly the complaint. So
       read the sentinel's position directly, once per frame, while scrolling. */
    const sentinel = $("#filtersSentinel");
    if (sentinel) {
      let queued = false;
      const measure = function () {
        queued = false;
        /* Sticky is a wide-screen behaviour; below that the bar sits in the
           flow and must never be found collapsed. */
        if (getComputedStyle(bar).position !== "sticky") {
          bar.classList.remove("is-stuck", "is-open");
          toggle.setAttribute("aria-expanded", "false");
          return;
        }
        const line = parseFloat(getComputedStyle(bar).top) || 0;
        const stuck = sentinel.getBoundingClientRect().top < line - 0.5;
        if (stuck === bar.classList.contains("is-stuck")) return;
        bar.classList.toggle("is-stuck", stuck);
        if (!stuck) { bar.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
      };
      const onScroll = function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(measure);
      };
      win.addEventListener("scroll", onScroll, { passive: true });
      win.addEventListener("resize", onScroll);
      measure();
    }
  }

  /* ---------- testimonials carousel -------------------------------- */
  (function carousel() {
    const rail = $("#tsmRail");
    if (!rail || !$("#tsmPrev")) return;
    const step = () => Math.min(rail.clientWidth * 0.8, 480);
    $("#tsmPrev").addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
    $("#tsmNext").addEventListener("click", () => rail.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
    let down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft;
      rail.classList.add("is-dragging"); rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener("pointermove", function (e) {
      if (!down) return;
      const d = e.clientX - sx; moved = Math.abs(d);
      rail.scrollLeft = sl - d;
    });
    ["pointerup", "pointercancel"].forEach(t => rail.addEventListener(t, function () { down = false; rail.classList.remove("is-dragging"); }));
    rail.addEventListener("click", function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    function upd() {
      $("#tsmPrev").disabled = rail.scrollLeft < 8;
      $("#tsmNext").disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8;
    }
    rail.addEventListener("scroll", upd, { passive: true });
    win.addEventListener("resize", upd);
    setTimeout(upd, 60);
  })();

  /* ---------- room interaction (cards + floor plan + popover) ------- */
  const State = { property: null, level: null, room: null, gallery: [], galIndex: 0 };

  const popover = $("#popover");
  let popoverHideT = null;

  function showPopover(room, anchor) {
    if (!canHover || window.innerWidth < 1024) return;
    clearTimeout(popoverHideT);
    popover.innerHTML = popoverHTML(room);
    popover.setAttribute("aria-hidden", "false");
    popover.classList.add("is-open");
    positionPopover(anchor);
  }
  function positionPopover(anchor) {
    const r = anchor.getBoundingClientRect();
    const pw = popover.offsetWidth || 308, ph = popover.offsetHeight || 380;
    const gap = 14;
    let x = r.right + gap;
    if (x + pw > window.innerWidth - 12) x = r.left - pw - gap;
    if (x < 12) x = Math.min(Math.max(12, r.left), window.innerWidth - pw - 12);
    let y = r.top + r.height / 2 - ph / 2;
    y = Math.max(12, Math.min(y, window.innerHeight - ph - 12));
    popover.style.left = Math.round(x) + "px";
    popover.style.top = Math.round(y) + "px";
  }
  function hidePopover() {
    popover.classList.remove("is-open");
    popover.setAttribute("aria-hidden", "true");
    popoverHideT = setTimeout(() => { popover.innerHTML = ""; }, 260);
  }

  function findRoom(id) { return State.property ? State.property.rooms.filter(r => r.id === id)[0] : null; }

  function setActiveRoom(id, anchor) {
    State.room = id;
    $$("[data-room]").forEach(n => n.classList.toggle("is-active", n.dataset.room === id));
    const room = findRoom(id);
    const panel = $("#planPanel");
    if (room && panel && room.polygon) panel.innerHTML = roomPanelHTML(room);
    if (room && anchor) showPopover(room, anchor);
  }
  function clearActiveRoom() {
    State.room = null;
    $$("[data-room].is-active").forEach(n => n.classList.remove("is-active"));
    hidePopover();
  }

  function planEmptyHTML() {
    return '<div class="plan__panel-empty">' + ICON.hand +
      '<p>Hover a room on the plan, or one of the cards above.<br>Its exact dimensions, compass orientation and photograph appear here.</p></div>';
  }

  /* ---------- floor plan: level switch, zoom, pan ------------------- */
  const Plan = { k: 1, x: 0, y: 0, host: null, zoomer: null, svg: null };

  function mountPlan(levelId) {
    const p = State.property;
    if (!p || !p.floorPlan) return;
    State.level = levelId;
    Plan.host = $("#planHost");
    Plan.host.innerHTML = floorPlanSVG(p, levelId);
    Plan.svg = $("#planSvg");
    Plan.zoomer = $("#planZoomer");
    Plan.k = 1; Plan.x = 0; Plan.y = 0;
    applyPlanTransform(true);
    const panel = $("#planPanel");
    if (panel) panel.innerHTML = planEmptyHTML();
    bindPlanEvents();
  }

  /* The uploaded-drawing path. Same stage, same pan and zoom, no hotspots. */
  function mountPlanImage(p) {
    Plan.host = $("#planHost");
    if (!Plan.host) return;
    Plan.host.innerHTML =
      '<div class="plan__img" id="planSvg">' +
        '<div class="plan__zoomer" id="planZoomer">' +
          '<img src="' + p.planImage + '" alt="Floor plan of ' + esc(p.title) + '" decoding="async">' +
        '</div>' +
      '</div>';
    Plan.svg = $("#planSvg");
    Plan.zoomer = $("#planZoomer");
    Plan.k = 1; Plan.x = 0; Plan.y = 0;
    applyPlanTransform(true);
    const panel = $("#planPanel");
    if (panel) panel.innerHTML = p.rooms.length ? planListHTML(p) : planEmptyHTML();
    bindPlanEvents();
  }

  function applyPlanTransform(noAnim) {
    if (!Plan.zoomer) return;
    Plan.zoomer.classList.toggle("no-anim", !!noAnim);
    Plan.zoomer.style.transform = "translate(" + Plan.x + "px," + Plan.y + "px) scale(" + Plan.k + ")";
    if (noAnim) requestAnimationFrame(() => Plan.zoomer && Plan.zoomer.classList.remove("no-anim"));
  }
  function zoomBy(factor, cx, cy) {
    const k = Math.min(3.2, Math.max(0.7, Plan.k * factor));
    if (cx == null) { Plan.x = Plan.x * (k / Plan.k); Plan.y = Plan.y * (k / Plan.k); }
    else {
      Plan.x = cx - (cx - Plan.x) * (k / Plan.k);
      Plan.y = cy - (cy - Plan.y) * (k / Plan.k);
    }
    Plan.k = k;
    applyPlanTransform();
  }
  function svgPoint(e) {
    const svg = Plan.svg; if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    /* An uploaded drawing sits in a plain <div>, which has no viewBox to map
       through — its own pixels are the coordinate system. */
    if (!svg.viewBox) return { x: e.clientX - r.left, y: e.clientY - r.top };
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(r.width / vb.width, r.height / vb.height);
    const ox = (r.width - vb.width * scale) / 2, oy = (r.height - vb.height * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  }

  function bindPlanEvents() {
    const svg = Plan.svg; if (!svg) return;
    let down = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = 0;

    function onMove(e) {
      if (!down) return;
      const p = svgPoint(e);
      Plan.x = ox + (p.x - sx) * Plan.k; Plan.y = oy + (p.y - sy) * Plan.k;
      moved = Math.max(moved, Math.abs(p.x - sx) + Math.abs(p.y - sy));
      applyPlanTransform(true);
    }
    function onUp() {
      if (!down) return;
      down = false; svg.classList.remove("is-panning");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    }
    svg.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      down = true; moved = 0;
      const p = svgPoint(e); sx = p.x; sy = p.y; ox = Plan.x; oy = Plan.y;
      svg.classList.add("is-panning");
      /* deliberately no setPointerCapture: it would retarget the click away
         from the room group and the room detail would never open */
      win.addEventListener("pointermove", onMove);
      win.addEventListener("pointerup", onUp);
      win.addEventListener("pointercancel", onUp);
    });
    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      const p = svgPoint(e);
      zoomBy(e.deltaY < 0 ? 1.14 : 1 / 1.14, p.x, p.y);
    }, { passive: false });

    $$(".fp-room", svg).forEach(function (g) {
      g.addEventListener("pointerenter", function () { if (!down) setActiveRoom(g.dataset.room, g); });
      g.addEventListener("pointerleave", function () { if (State.room === g.dataset.room) hidePopover(); });
      g.addEventListener("focus", function () { setActiveRoom(g.dataset.room, g); });
      g.addEventListener("blur", hidePopover);
      g.addEventListener("click", function (e) { if (moved < 6) { e.preventDefault(); openRoom(g.dataset.room); } });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openRoom(g.dataset.room); }
      });
    });
  }

  /* ---------- room detail sheet ------------------------------------ */
  const sheet = $("#sheet"), sheetPanel = $("#sheetPanel"), sheetBody = $("#sheetBody");
  let sheetReturnFocus = null;

  function openRoom(id) {
    const r = findRoom(id); if (!r) return;
    sheetBody.innerHTML = roomDetailHTML(r, State.property);
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    lockScroll(true);
    sheetPanel.style.setProperty("--drag", "0px");
    sheetReturnFocus = document.activeElement;
    hidePopover();
    setTimeout(() => { const b = $(".sheet__close", sheet); if (b) b.focus(); }, 60);
  }
  function closeSheet() {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    lockScroll(false);
    if (sheetReturnFocus && sheetReturnFocus.focus) sheetReturnFocus.focus();
    setTimeout(() => { if (!sheet.classList.contains("is-open")) sheetBody.innerHTML = ""; }, 420);
  }
  sheet.addEventListener("click", function (e) {
    if (e.target.closest("[data-close-sheet]")) { closeSheet(); return; }
    const nav = e.target.closest("[data-open-room]");
    if (nav) openRoom(nav.dataset.openRoom);
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet.classList.contains("is-open")) closeSheet();
    if (!sheet.classList.contains("is-open")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const btns = $$("[data-open-room]", sheetBody);
      if (btns.length === 2) openRoom(e.key === "ArrowRight" ? btns[1].dataset.openRoom : btns[0].dataset.openRoom);
    }
  });
  /* drag-to-dismiss on phones */
  (function sheetDrag() {
    const grab = $("#sheetGrab");
    let sy = 0, dragging = false, dy = 0;
    grab.addEventListener("pointerdown", function (e) {
      if (window.innerWidth > 720) return;
      dragging = true; sy = e.clientY; dy = 0;
      sheetPanel.classList.add("is-dragging"); grab.setPointerCapture(e.pointerId);
    });
    grab.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - sy);
      sheetPanel.style.setProperty("--drag", dy + "px");
    });
    ["pointerup", "pointercancel"].forEach(t => grab.addEventListener(t, function () {
      if (!dragging) return;
      dragging = false; sheetPanel.classList.remove("is-dragging");
      if (dy > 110) { sheetPanel.style.setProperty("--drag", "0px"); closeSheet(); }
      else sheetPanel.style.setProperty("--drag", "0px");
    }));
  })();

  /* ---------- lightbox --------------------------------------------- */
  const LB = { el: $("#lightbox"), img: $("#lbImg"), i: 0, items: [] };
  function openLightbox(i) {
    LB.items = State.property ? State.property.images : [];
    if (!LB.items.length) return;
    LB.i = i;
    $("#lbThumbs").innerHTML = LB.items.map((im, n) => '<button class="lightbox__thumb" data-lb="' + n + '" aria-label="Photograph ' + (n + 1) + '"><img src="' + im.src + '" alt=""></button>').join("");
    LB.el.classList.add("is-open");
    LB.el.setAttribute("aria-hidden", "false");
    lockScroll(true);
    paintLightbox();
    $("#lbClose").focus();
  }
  function paintLightbox() {
    const im = LB.items[LB.i];
    LB.img.style.opacity = "0";
    setTimeout(function () {
      LB.img.src = im.src; LB.img.alt = im.caption;
      LB.img.style.opacity = "1";
    }, reduceMotion ? 0 : 130);
    $("#lbCounter").textContent = pad2(LB.i + 1) + " / " + pad2(LB.items.length);
    $("#lbCaption").textContent = im.caption;
    $$("#lbThumbs .lightbox__thumb").forEach((t, n) => t.classList.toggle("is-active", n === LB.i));
    const active = $("#lbThumbs .is-active");
    if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }
  function stepLightbox(d) { LB.i = (LB.i + d + LB.items.length) % LB.items.length; paintLightbox(); }
  function closeLightbox() {
    LB.el.classList.remove("is-open");
    LB.el.setAttribute("aria-hidden", "true");
    lockScroll(false);
  }
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => stepLightbox(-1));
  $("#lbNext").addEventListener("click", () => stepLightbox(1));
  $("#lbThumbs").addEventListener("click", function (e) {
    const t = e.target.closest("[data-lb]"); if (!t) return;
    LB.i = +t.dataset.lb; paintLightbox();
  });
  $("#lbStage").addEventListener("click", function (e) { if (e.target === this) closeLightbox(); });
  doc.addEventListener("keydown", function (e) {
    if (!LB.el.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "ArrowLeft") stepLightbox(-1);
  });
  (function lbSwipe() {
    let sx = 0, sy = 0, on = false;
    const st = $("#lbStage");
    st.addEventListener("touchstart", function (e) { on = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    st.addEventListener("touchend", function (e) {
      if (!on) return; on = false;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
      else if (dy > 80) closeLightbox();
    }, { passive: true });
  })();

  /* ---------- detail view wiring ------------------------------------ */
  function bindDetail(p) {
    const view = $("#viewDetail");
    observeReveals(view);
    bindMagnetic(view);

    /* room cards */
    $$(".room-card", view).forEach(function (card) {
      const id = card.dataset.room;
      card.addEventListener("pointerenter", () => setActiveRoom(id, card));
      card.addEventListener("pointerleave", () => { if (State.room === id) hidePopover(); });
      card.addEventListener("focus", () => setActiveRoom(id, card));
      card.addEventListener("blur", hidePopover);
      card.addEventListener("click", () => openRoom(id));
    });

    /* gallery */
    const gal = $("#gallery", view);
    if (gal) gal.addEventListener("click", function (e) {
      const b = e.target.closest("[data-gal]"); if (b) openLightbox(+b.dataset.gal);
    });

    /* floor plan — the room rows open a room in every state, drawing or not */
    const planPanel = $("#planPanel", view);
    if (planPanel) planPanel.addEventListener("click", function (e) {
      const b = e.target.closest("[data-open-room]"); if (b) openRoom(b.dataset.openRoom);
    });

    if (p.planImage) {
      mountPlanImage(p);
      const stage = $("#planStage", view);
      if (stage) stage.addEventListener("click", function (e) {
        const z = e.target.closest("[data-zoom]"); if (!z) return;
        if (z.dataset.zoom === "in") zoomBy(1.25);
        else if (z.dataset.zoom === "out") zoomBy(1 / 1.25);
        else { Plan.k = 1; Plan.x = 0; Plan.y = 0; applyPlanTransform(); }
      });
    } else if (p.floorPlan) {
      mountPlan(p.floorPlan.levels[0].id);
      const levels = $("#planLevels");
      if (levels) levels.addEventListener("click", function (e) {
        const b = e.target.closest("[data-level]"); if (!b) return;
        $$(".levels__btn", levels).forEach(x => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
        clearActiveRoom();
        mountPlan(b.dataset.level);
      });
      const stage = $("#planStage", view);
      stage.addEventListener("click", function (e) {
        const z = e.target.closest("[data-zoom]"); if (!z) return;
        if (z.dataset.zoom === "in") zoomBy(1.25);
        else if (z.dataset.zoom === "out") zoomBy(1 / 1.25);
        else { Plan.k = 1; Plan.x = 0; Plan.y = 0; applyPlanTransform(); }
      });
      stage.addEventListener("pointerleave", hidePopover);
    }

    /* map */
    const mapWrap = $("#mapWrap", view);
    if (mapWrap) {
      const setPoi = function (id, on) {
        const pin = mapWrap.querySelector('[data-poi="' + id + '"]');
        const chip = mapWrap.querySelector('[data-poi-chip="' + id + '"]');
        if (pin) pin.classList.toggle("is-active", on);
        if (chip) chip.classList.toggle("is-active", on);
      };
      $$("[data-poi]", mapWrap).forEach(function (pin) {
        pin.addEventListener("pointerenter", () => setPoi(pin.dataset.poi, true));
        pin.addEventListener("pointerleave", () => setPoi(pin.dataset.poi, false));
        pin.addEventListener("focus", () => setPoi(pin.dataset.poi, true));
        pin.addEventListener("blur", () => setPoi(pin.dataset.poi, false));
      });
      $$("[data-poi-chip]", mapWrap).forEach(function (chip) {
        chip.addEventListener("pointerenter", () => setPoi(chip.dataset.poiChip, true));
        chip.addEventListener("pointerleave", () => setPoi(chip.dataset.poiChip, false));
        chip.addEventListener("focus", () => setPoi(chip.dataset.poiChip, true));
        chip.addEventListener("blur", () => setPoi(chip.dataset.poiChip, false));
      });
    }
  }

  /* ---------- router ------------------------------------------------ */
  const viewHome = $("#viewHome"), viewDetail = $("#viewDetail");
  if (!viewHome || !viewDetail) return function () {};
  let homeScroll = 0;

  function fadeSwap(hideEl, showEl, after) {
    if (reduceMotion) { hideEl.hidden = true; showEl.hidden = false; after && after(); return; }
    hideEl.classList.add("is-leaving");
    setTimeout(function () {
      hideEl.hidden = true;
      hideEl.classList.remove("is-leaving");
      showEl.hidden = false;
      showEl.classList.add("is-entering");
      after && after();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { showEl.classList.remove("is-entering"); });
      });
    }, 240);
  }

  function openDetailBySlug(slug) {
    const p = PROPERTIES.filter(x => x.slug === slug)[0];
    if (!p) { goHome(null); return; }
    if (State.property && State.property.slug === slug && !viewDetail.hidden) return;
    if (!viewDetail.hidden) { /* detail → detail */
      State.property = p; clearActiveRoom(); closeSheet();
      viewDetail.innerHTML = renderDetail(p);
      window.scrollTo(0, 0);
      bindDetail(p);
        return;
    }
    homeScroll = window.scrollY;
    State.property = p;
    clearActiveRoom();
    fadeSwap(viewHome, viewDetail, function () {
      viewDetail.innerHTML = renderDetail(p);
      window.scrollTo(0, 0);
      bindDetail(p);
    });
  }

  function goHome(scrollToId) {
    const wasDetail = !viewDetail.hidden;
    const finish = function () {
      if (scrollToId) {
        const t = document.getElementById(scrollToId);
        if (t) { setTimeout(() => t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), 40); return; }
      }
      window.scrollTo(0, wasDetail ? homeScroll : window.scrollY);
    };
    if (!wasDetail) { finish(); return; }
    clearActiveRoom(); closeSheet(); closeLightbox();
    State.property = null;
    fadeSwap(viewDetail, viewHome, function () { viewDetail.innerHTML = ""; finish(); });
  }

  /* navigation stays internal — a component has no business owning the URL */

  /* in-page anchors: let the router handle everything with a hash */
  /* In-page links are handled here rather than natively: a Framer page or a CMS
     preview can inject <base href>, which makes "#contact" resolve against another
     URL, and the button then looks alive while doing nothing. */
  root.addEventListener("click", function (e) {
    const card = e.target.closest("[data-slug]");
    if (card) { e.preventDefault(); openDetailBySlug(card.dataset.slug); return; }
    if (e.target.closest('[data-route="/"]')) { e.preventDefault(); goHome(null); return; }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    e.preventDefault();
    if (id === "for-sale" || id === "for-rent") {
      goHome("listings");
      const btn = $('#segMode [data-mode="' + (id === "for-sale" ? "sale" : "rent") + '"]');
      if (btn) btn.click();
      return;
    }
    goHome(id);
  });

  /* The markup builder has already placed the hero photograph, the agent
     portrait and the year, so boot only has the wiring left to do. */
  function boot() {
    buildFilterUI();
    bindFilters();
    syncRanges();
    renderFeatured();
    applyFilters();
    renderTestimonials();
    observeReveals();
    bindMagnetic();
    win.addEventListener("resize", function () {
      if (State.room && popover.classList.contains("is-open")) hidePopover();
    }, { passive: true });
    win.addEventListener("scroll", function () {
      if (popover.classList.contains("is-open")) hidePopover();
    }, { passive: true });
  }

  boot()
  return function destroy() {
    bin.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts))
    ALL_OBSERVERS.forEach(o => o.disconnect())
    ALL_OBSERVERS = []
    revealObserver = null
    if (scrollLocks > 0) { scrollLocks = 0; document.body.style.overflow = "" }
    ROOT = null
  }
}

// ---------------------------------------------------------------------------
// prop groups
// ---------------------------------------------------------------------------
interface NavbarGroup {
    showNavbar?: boolean
    logo?: any
    logoDark?: any
    logoHeight?: number
    brandTextWithLogo?: boolean
    brandName?: string
    brandSub?: string
    links?: { label?: string; target?: string }[]
    ctaLabel?: string
    ctaTarget?: string
}
interface StyleGroup {
    palette?: string
    accent?: string
    background?: string
    ink?: string
    cardColor?: string
    glassTint?: string
    navTint?: string
    buttonFill?: string
    buttonText?: string
    buttonOnDark?: string
    navOnDark?: string
    lineColor?: string
    darkSurface?: string
    slate?: string
    mutedText?: string
    onDark?: string
    glassStrength?: number
    navStrength?: number
    radius?: number
}
interface HeroGroup {
    showHero?: boolean
    photo?: any
    photoMobile?: any
    video?: any
    videoLink?: string
    eyebrow?: string
    headline?: string
    sub?: string
    ctaLabel?: string
    ctaTarget?: string
    cta2Label?: string
    cta2Target?: string
    scrollLabel?: string
    chips?: { value?: string; label?: string }[]
}
interface TrustGroup {
    showTrust?: boolean
    items?: { value?: string; suffix?: string; label?: string }[]
}
interface SectionsGroup {
    showFeatured?: boolean
    featuredEyebrow?: string
    featuredHeading?: string
    featuredLede?: string
    featuredLinkLabel?: string
    showCatalogue?: boolean
    catalogueEyebrow?: string
    catalogueHeading?: string
}
interface ListingsGroup {
    items?: any[]
}
interface RoomsGroup {
    items?: any[]
}
interface PhotosGroup {
    items?: any[]
}
interface LevelsGroup {
    items?: any[]
}
interface PinsGroup {
    items?: any[]
}
interface DetailGroup {
    mapLinks?: boolean
    mapRegion?: string
    videoEyebrow?: string
    videoHeading?: string
    galleryEyebrow?: string
    galleryHeading?: string
    roomsEyebrow?: string
    roomsHeading?: string
    roomsLede?: string
    planEyebrow?: string
    planHeading?: string
    planHeadingList?: string
    featuresEyebrow?: string
    featuresHeading?: string
    locationEyebrow?: string
    locationHeading?: string
    similarEyebrow?: string
    similarHeading?: string
}
interface AboutGroup {
    showAbout?: boolean
    eyebrow?: string
    quote?: string
    text?: string
    portrait?: any
    ctaLabel?: string
    stats?: { value?: string; label?: string }[]
    agentName?: string
    agentRole?: string
    agentLicense?: string
    agentPhone?: string
    agentEmail?: string
}
interface ReviewsGroup {
    showReviews?: boolean
    eyebrow?: string
    heading?: string
    items?: { quote?: string; who?: string; where?: string; stars?: number }[]
}
interface ContactGroup {
    showContact?: boolean
    eyebrow?: string
    heading?: string
    text?: string
    primaryLabel?: string
    secondaryLabel?: string
    cards?: { kicker?: string; title?: string; text?: string }[]
}
interface FooterGroup {
    showFooter?: boolean
    blurb?: string
    address?: string
    left?: string
    right?: string
}
interface Props {
    navbar?: NavbarGroup
    globalStyle?: StyleGroup
    hero?: HeroGroup
    trust?: TrustGroup
    sections?: SectionsGroup
    listings?: ListingsGroup
    rooms?: RoomsGroup
    photos?: PhotosGroup
    levels?: LevelsGroup
    pins?: PinsGroup
    detail?: DetailGroup
    about?: AboutGroup
    reviews?: ReviewsGroup
    contact?: ContactGroup
    footer?: FooterGroup
    style?: React.CSSProperties
}

const DEFAULTS = {
    accent: "#b08d57",
    bg: "#f6f5f2",
    ink: "#15161a",
    slate: "#5d6068",
    muted: "#8b8e96",
    onDark: "#f2f0ea",
    night: "#121317",
    card: "#fbfaf8",
    glass: "#ffffff",
    nav: "#ffffff",
    line: "#e2dfd8",
}

/* "#b08d57" -> "176,141,87", so one accent can feed rgba() everywhere */
/* The panel's colour fields do not all hand back a plain hex. Framer returns
   rgb() and rgba() strings, eight-digit hex, and a shared colour style as
   var(--token-…, rgb(…)). Reading only #rrggbb meant every tint built from a
   triplet — the navbar, the frosted panels, the accent washes — quietly kept
   its default while the field showed the new colour. */
/* Framer hands the component a freshly built props object on every render, so
   memoising the model on `props` never hit and the effect tore the whole page
   down and rebuilt it — on a canvas pan, a selection, and dozens of times a
   second while a colour picker is being dragged. That is the flicker. Compare
   the content instead: a cheap fingerprint that walks the props, shortening
   the data URIs so a hero photograph costs a few dozen characters rather than
   a megabyte. Colours are deliberately left out of it — they ride on custom
   properties and never need the markup rebuilt. */
function fingerprint(v: any, depth?: number): string {
    const d = depth || 0
    if (v == null) return "~"
    const t = typeof v
    if (t === "string") return v.length > 64 ? v.length + ":" + v.slice(0, 48) : v
    if (t === "number" || t === "boolean") return String(v)
    if (d > 6) return "\u2026"
    if (Array.isArray(v)) return "[" + v.map(x => fingerprint(x, d + 1)).join("|") + "]"
    if (t === "object") {
        const keys = Object.keys(v).sort()
        let out = "{"
        for (let i = 0; i < keys.length; i++) out += keys[i] + ":" + fingerprint(v[keys[i]], d + 1) + ","
        return out + "}"
    }
    return "?"
}

function rgbTriplet(color: string, fallback: string): string {
    let c = String(color || "").trim()

    /* var(--token-1234, rgb(29, 78, 216)) — the fallback inside is the colour */
    const token = /^var\(\s*--[^,]+,\s*(.+)\)$/i.exec(c)
    if (token) c = token[1].trim()

    const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c)
    if (fn) {
        const clamp = (v: string) => Math.max(0, Math.min(255, Math.round(parseFloat(v))))
        return [clamp(fn[1]), clamp(fn[2]), clamp(fn[3])].join(",")
    }

    const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(c)
    if (hex) {
        let v = hex[1]
        if (v.length === 3 || v.length === 4) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
        else v = v.slice(0, 6)
        const n = parseInt(v, 16)
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",")
    }

    /* Anything else — a named colour, hsl(), something new — is handed to the
       browser to resolve, once, rather than guessed at. */
    if (c && typeof document !== "undefined") {
        const probe = document.createElement("span")
        probe.style.color = c
        if (probe.style.color) {
            document.body.appendChild(probe)
            const out = getComputedStyle(probe).color
            document.body.removeChild(probe)
            const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(out)
            if (m) return m[1] + "," + m[2] + "," + m[3]
        }
    }
    return fallback === color ? "176,141,87" : rgbTriplet(fallback, fallback)
}

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 6400
 */
export default function ThresholdSite(props: Props) {
    const nav = props.navbar || {}
    const gs = props.globalStyle || {}
    const hero = props.hero || {}
    const trust = props.trust || {}
    const sec = props.sections || {}
    const listings = props.listings || {}
    const roomList = props.rooms || {}
    const photoList = props.photos || {}
    const levelList = props.levels || {}
    const pinList = props.pins || {}
    const detail = props.detail || {}
    const about = props.about || {}
    const reviews = props.reviews || {}
    const contact = props.contact || {}
    const footer = props.footer || {}

    const hostRef = React.useRef<HTMLDivElement>(null)
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const listingCount = (listings.items || DEFAULT_LISTINGS).length

    // Framer stores control values on the placed instance and gives a component
    // no way to write its own props, so nothing here can wipe what the user
    // typed into the colour fields. "Original" therefore means "ignore those
    // fields", and the fields are hidden while it is selected so the panel never
    // shows one colour while the page renders another.
    const reset = (gs.palette || "custom") === "original"
    const pick = (v: any, d: string) => (reset ? d : v || d)
    const accent = pick(gs.accent, DEFAULTS.accent)
    const bg = pick(gs.background, DEFAULTS.bg)
    const ink = pick(gs.ink, DEFAULTS.ink)
    const night = pick(gs.darkSurface, DEFAULTS.night)
    const card = pick(gs.cardColor, DEFAULTS.card)
    const glassTint = pick(gs.glassTint, DEFAULTS.glass)
    const navTint = pick(gs.navTint, DEFAULTS.nav)
    const line = pick(gs.lineColor, DEFAULTS.line)
    const btnFill = pick(gs.buttonFill, ink)
    const btnText = pick(gs.buttonText, bg)
    const slate = pick(gs.slate, DEFAULTS.slate)
    const muted = pick(gs.mutedText, DEFAULTS.muted)
    const onDark = pick(gs.onDark, DEFAULTS.onDark)
    const onDarkRgb = rgbTriplet(onDark, DEFAULTS.onDark)
    const glass = gs.glassStrength === undefined ? 100 : gs.glassStrength
    const navA = gs.navStrength === undefined ? 100 : gs.navStrength
    const radius = gs.radius === undefined ? 30 : gs.radius
    const glassRgb = rgbTriplet(glassTint, DEFAULTS.glass)
    const darkSame = gs.buttonOnDark === "same" && !reset
    /* Over the hero the navbar is a dark pill by default, because a light tint
       would land under light text. "Same" carries the navbar colour up there
       and puts the text back to the page's own ink. */
    const navSame = gs.navOnDark === "same" && !reset
    const navRgb = rgbTriplet(navTint, DEFAULTS.nav)

    const rootVars = {
        "--champagne": accent,
        "--champagne-rgb": rgbTriplet(accent, DEFAULTS.accent),
        "--champagne-soft": `rgba(${rgbTriplet(accent, DEFAULTS.accent)},0.72)`,
        "--champagne-wash": `rgba(${rgbTriplet(accent, DEFAULTS.accent)},0.10)`,
        "--bone": bg,
        "--ink": ink,
        "--slate": slate,
        "--muted": muted,
        "--on-dark": onDark,
        "--on-dark-rgb": onDarkRgb,
        "--night": night,
        "--paper": card,
        "--line": line,
        "--btn-fill": btnFill,
        "--btn-ink": btnText,
        /* On a dark section a dark button disappears, so by default the pair
           is reversed there. "Same" points it back at the light-side pair. */
        "--btn-dark-fill": darkSame ? btnFill : btnText,
        "--btn-dark-ink": darkSame ? btnText : btnFill,
        "--glass-rgb": glassRgb,
        "--nav-rgb": navRgb,
        "--nav-dark-rgb": navSame ? navRgb : rgbTriplet(night, DEFAULTS.night),
        "--nav-dark-bd": navSame ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.18)",
        "--nav-dark-fg": navSame ? ink : onDark,
        "--nav-dark-link": navSame ? "var(--slate)" : `rgba(${onDarkRgb},0.88)`,
        "--nav-dark-link-hover": navSame ? ink : onDark,
        "--nav-dark-sub": navSame ? "var(--muted)" : `rgba(${onDarkRgb},0.70)`,
        "--nav-dark-cta-bg": navSame ? btnFill : (darkSame ? btnFill : btnText),
        "--nav-dark-cta-fg": navSame ? btnText : (darkSame ? btnText : btnFill),
        "--night-rgb": rgbTriplet(night, DEFAULTS.night),
        /* Every frosted alpha in the stylesheet is calc(base * multiplier),
           so these two numbers move all of them — the navbar included, which
           is what the Glass slider used to miss. */
        "--glass-a": (glass / 100).toFixed(3),
        "--nav-a": (navA / 100).toFixed(3),
        "--logo-h": (nav.logoHeight === undefined ? 34 : nav.logoHeight) + "px",
        "--r-lg": radius + "px",
        "--r-xl": Math.round(radius * 1.33) + "px",
        width: "100%",
        ...props.style,
    } as React.CSSProperties

    /* Panel values become the same model the HTML build feeds its builders.
       Keyed on the content alone, so repainting does not rebuild the page. */
    const contentKey = fingerprint([
        nav, hero, trust, sec, listings, roomList, photoList, levelList, pinList,
        detail, about, reviews, contact, footer,
    ])
    const model = React.useMemo(() => {
        const agent = {
            name: about.agentName || DEFAULT_AGENT.name,
            role: about.agentRole || DEFAULT_AGENT.role,
            license: about.agentLicense || DEFAULT_AGENT.license,
            phone: about.agentPhone || DEFAULT_AGENT.phone,
            phoneHref: "tel:" + String(about.agentPhone || DEFAULT_AGENT.phone).replace(/[^\d+]/g, ""),
            email: about.agentEmail || DEFAULT_AGENT.email,
            photo: imgSrc(about.portrait) || Scenery({ k: "portrait", seed: "agent" }),
        }
        const navLinks =
            nav.links && nav.links.length
                ? nav.links.map(l => ({ label: l.label || "", target: l.target || "listings" }))
                : [
                      { label: "Listings", target: "listings" },
                      { label: "Buy", target: "for-sale" },
                      { label: "Rent", target: "for-rent" },
                      { label: "About", target: "about" },
                      { label: "Reviews", target: "reviews" },
                      { label: "Contact", target: "contact" },
                  ]
        return {
            brandName: nav.brandName || "Threshold",
            brandSub: nav.brandSub || "Los Angeles",
            logo: imgSrc(nav.logo) || "",
            logoDark: imgSrc(nav.logoDark) || "",
            brandTextWithLogo: nav.brandTextWithLogo === true,
            navLinks,
            navCta: nav.ctaLabel || "List your home",
            navCtaTarget: nav.ctaTarget || "contact",
            agent,
            hero: {
                eyebrow: hero.eyebrow || "Real Estate • Los Angeles",
                headline: hero.headline || "Homes that\ncarry a story.",
                sub: hero.sub || "Premium properties presented with attention to detail, space and real value.",
                ctaLabel: hero.ctaLabel || "Browse listings",
                ctaTarget: hero.ctaTarget || "listings",
                cta2Label: hero.cta2Label || "How I work",
                cta2Target: hero.cta2Target || "about",
                scrollLabel: hero.scrollLabel || "Scroll",
                chips:
                    hero.chips && hero.chips.length
                        ? hero.chips
                        : [
                              { value: "214", label: "homes sold" },
                              { value: "12 years", label: "across LA" },
                              { value: "4.9/5", label: "client rating" },
                          ],
                wide: imgSrc(hero.photo) || HERO_PHOTO_WIDE,
                tall: imgSrc(hero.photoMobile) || imgSrc(hero.photo) || HERO_PHOTO_TALL,
                /* ControlType.File hands back the same shape as Image */
                video: imgSrc(hero.video) || String(hero.videoLink || "").trim(),
            },
            trust:
                trust.items && trust.items.length
                    ? trust.items
                    : [
                          { value: "214", suffix: "+", label: "Homes sold" },
                          { value: "38 ", suffix: "days", label: "Average time on market" },
                          { value: "104", suffix: "%", label: "Of asking price, on average" },
                          { value: "4.9", suffix: "/5", label: "Client rating" },
                      ],
            featured: {
                eyebrow: sec.featuredEyebrow || "Featured properties",
                heading: sec.featuredHeading || "Places worth\nseeing in person.",
                lede: sec.featuredLede || "Five homes I consider the most interesting on the Los Angeles market right now.",
                linkLabel: sec.featuredLinkLabel || "All listings",
            },
            catalogue: {
                eyebrow: sec.catalogueEyebrow || "Catalogue",
                heading: sec.catalogueHeading || "Find the place where\nyour next chapter begins.",
            },
            about: {
                eyebrow: about.eyebrow || "About",
                quote: about.quote || "I don't just sell houses.\nI help people find their next place.",
                text: about.text || DEFAULT_ABOUT_TEXT,
                ctaLabel: about.ctaLabel || "Book a consultation",
                stats:
                    about.stats && about.stats.length
                        ? about.stats
                        : [
                              { value: "214", label: "Homes sold" },
                              { value: "12", label: "Years on the market" },
                              { value: "4.9", label: "Client rating" },
                          ],
            },
            reviews: {
                eyebrow: reviews.eyebrow || "Reviews",
                heading: reviews.heading || "What people say\nonce they've moved.",
            },
            cta: {
                eyebrow: contact.eyebrow || "Contact",
                heading: contact.heading || "Have a home\nyou want to sell?",
                text: contact.text || "I handle the presentation, the marketing and the whole sale — from the first measurement to handing over the keys.",
                primaryLabel: contact.primaryLabel || "List your home",
                secondaryLabel: contact.secondaryLabel || "Call the agent",
                cards:
                    contact.cards && contact.cards.length
                        ? contact.cards
                        : DEFAULT_CTA_CARDS,
            },
            footer: {
                blurb: footer.blurb || "Premium homes across Los Angeles. The place where your next chapter begins.",
                address: footer.address || "8236 Beverly Blvd, Los Angeles",
                left: footer.left || "© " + new Date().getFullYear() + " Threshold Realty",
                right: footer.right || "Demo presentation · Fictional listings and contact details",
            },
            properties: buildProperties(
                listings.items as any[], roomList.items as any[], photoList.items as any[],
                levelList.items as any[], pinList.items as any[]),
            /* An empty field falls back to the shipped heading rather than
               leaving a section with no title at all. */
            mapLinks: detail.mapLinks !== false,
            mapRegion: detail.mapRegion || "",
            detailLabels: (function () {
                const out: any = {}
                Object.keys(DETAIL_LABEL_FALLBACK).forEach(k => {
                    const v = (detail as any)[k]
                    if (typeof v === "string" && v.trim()) out[k] = v
                })
                return out
            })(),
            reviewItems: (reviews.items && reviews.items.length ? reviews.items : DEFAULT_REVIEWS) as any[],
            show: {
                nav: nav.showNavbar !== false,
                hero: hero.showHero !== false,
                trust: trust.showTrust !== false,
                featured: sec.showFeatured !== false,
                catalogue: sec.showCatalogue !== false,
                about: about.showAbout !== false,
                reviews: reviews.showReviews !== false,
                contact: contact.showContact !== false,
                footer: footer.showFooter !== false,
            },
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentKey])

    /* Build the page, drop it in, wire it up. Rebuilt whenever the panel
       changes, which is exactly what makes the canvas feel live. */
    React.useEffect(() => {
        const host = hostRef.current
        if (!host) return
        PROPERTIES = model.properties
        AGENT = model.agent
        TESTIMONIALS = model.reviewItems
        SHOW = model.show
        DETAIL_LABELS = model.detailLabels
        MAP_LINKS = model.mapLinks
        MAP_REGION = model.mapRegion
        host.innerHTML =
            (model.show.nav ? headerHTML(model) : "") +
            '<main id="main">' +
            homeHTML(model) +
            '<div class="view" id="viewDetail" hidden></div>' +
            "</main>" +
            (model.show.footer ? footerHTML(model) : "") +
            overlaysHTML()
        const heroMedia = host.querySelector("#heroMedia")
        if (heroMedia) {
            /* The photograph is always there: it is the poster while the film
               loads, and the whole hero when there is no film. */
            const film = videoSource(model.hero.video)
            heroMedia.innerHTML =
                "<picture>" +
                '<source media="(max-width:720px)" srcset="' + esc(model.hero.tall) + '">' +
                '<img src="' + esc(model.hero.wide) + '" alt="' + esc(model.hero.eyebrow) + '">' +
                "</picture>" +
                (film && film.kind === "file"
                    ? '<video class="hero__video" src="' + esc(film.src) + '" poster="' + esc(model.hero.wide) +
                      '" autoplay muted loop playsinline preload="metadata"></video>'
                    : film && film.kind === "embed"
                    ? '<iframe class="hero__video" src="' + esc(film.src +
                      (film.src.indexOf("?") < 0 ? "?" : "&") +
                      "autoplay=1&mute=1&muted=1&loop=1&controls=0&playsinline=1&background=1") +
                      '" title="" tabindex="-1" allow="autoplay; encrypted-media" frameborder="0"></iframe>'
                    : "")
        }
        const agentMedia = host.querySelector("#agentMedia")
        if (agentMedia) {
            agentMedia.insertAdjacentHTML(
                "afterbegin",
                '<img src="' + esc(model.agent.photo) + '" alt="' + esc(model.agent.name) + '">'
            )
        }
        const destroy = createApp(host)
        return () => {
            destroy()
            host.innerHTML = ""
        }
    }, [model])

    return (
        <div className="thr-root js" style={rootVars}>
            <style>{FONT_IMPORT + CSS}</style>
            <div ref={hostRef} />
            {onCanvas && listingCount === 0 && (
                <div
                    style={{
                        border: "1px dashed #bbb", margin: 24, padding: 40, borderRadius: 12,
                        display: "grid", placeItems: "center", color: "#888", fontSize: 13,
                        textAlign: "center", fontFamily: "Inter, sans-serif",
                    }}
                >
                    ⑥ Listings is empty — add at least one property, or the catalogue
                    renders as an empty grid.
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// The panel. Groups are numbered so it reads as a table of contents, and they
// run in the order the sections appear on the page.
// ---------------------------------------------------------------------------
const ORI_OPTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
const ORI_TITLES = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"]
const SCENE_OPTIONS = ["villa", "house", "historic", "block", "penthouse", "land"]
const SCENE_TITLES = ["Modern villa", "Family house", "Period house", "Apartment block", "Rooftop", "Empty land"]
const ROOM_SCENE_OPTIONS = ["living", "kitchen", "bedroom", "kids", "bath", "study", "hall", "stairs", "office", "attic", "tech", "terrace"]
const ROOM_SCENE_TITLES = ["Living room", "Kitchen", "Bedroom", "Child's room", "Bathroom", "Study", "Hall", "Stair", "Office", "Attic room", "Utility", "Terrace / balcony"]
const PIN_ICON_OPTIONS = ["city", "shop", "market", "post", "police", "school", "kindergarten", "hospital", "pharmacy", "restaurant", "cafe", "park", "playground", "gym", "bank", "transport", "train", "bus", "metro", "parking", "fuel", "church", "library", "cinema", "office", "hotel", "beach", "airport"]
const PIN_ICON_TITLES = ["Town centre", "Shop", "Supermarket", "Post office", "Police", "School", "Kindergarten", "Hospital", "Pharmacy", "Restaurant", "Café", "Park", "Playground", "Gym", "Bank", "Tram", "Train", "Bus", "Metro", "Parking", "Petrol station", "Church", "Library", "Cinema", "Offices", "Hotel", "Beach", "Airport"]
const GALLERY_SCENE_OPTIONS = ROOM_SCENE_OPTIONS.concat(SCENE_OPTIONS)
const GALLERY_SCENE_TITLES = ROOM_SCENE_TITLES.concat(SCENE_TITLES.map(t => t + " (outside)"))
// A terrace is not a room with a ceiling, so its stand-in is drawn as an
// outdoor scene rather than an interior — see buildProperties.
const OUTDOOR_ROOM_SCENES = ["terrace", "penthouse", "balcony"]
// Gallery stand-ins name a whole building rather than a room, so they are
// drawn as exteriors when the row does not say which kind it is.
const OUTDOOR_GALLERY_SCENES = ["villa", "house", "historic", "block", "penthouse", "land"]

addPropertyControls(ThresholdSite, {
    navbar: {
        type: ControlType.Object,
        title: "① Navbar",
        controls: {
            showNavbar: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            logo: {
                type: ControlType.Image, title: "Logo",
                description: "Replaces the drawn house mark, in the header and the footer. A transparent PNG or an SVG about 600 × 160 px sits best.",
            },
            logoDark: {
                type: ControlType.Image, title: "Logo — Light Version",
                description: "Used only while the header floats over the dark hero, where a dark logo disappears. Leave empty to use the same file on both.",
            },
            logoHeight: {
                type: ControlType.Number, title: "Logo Height", min: 16, max: 72, step: 1,
                defaultValue: 34, unit: "px",
            },
            brandTextWithLogo: {
                type: ControlType.Boolean, title: "Name Beside Logo", defaultValue: false,
                enabledTitle: "Show", disabledTitle: "Hide",
                description: "Whether the name and its line stay next to an uploaded logo. Without a logo they always show.",
            },
            brandName: { type: ControlType.String, title: "Brand", defaultValue: "Threshold" },
            brandSub: { type: ControlType.String, title: "Brand Line 2", defaultValue: "Los Angeles" },
            links: {
                type: ControlType.Array,
                title: "Menu",
                control: {
                    type: ControlType.Object,
                    controls: {
                        label: { type: ControlType.String, title: "Label", defaultValue: "Listings" },
                        target: {
                            type: ControlType.String, title: "Section id", defaultValue: "listings",
                            description: "listings · for-sale · for-rent · about · reviews · contact",
                        },
                    },
                },
                defaultValue: [
                    { label: "Listings", target: "listings" },
                    { label: "Buy", target: "for-sale" },
                    { label: "Rent", target: "for-rent" },
                    { label: "About", target: "about" },
                    { label: "Reviews", target: "reviews" },
                    { label: "Contact", target: "contact" },
                ],
            },
            ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "List your home" },
            ctaTarget: { type: ControlType.String, title: "Button Target", defaultValue: "contact" },
        },
    },

    globalStyle: {
        type: ControlType.Object,
        title: "② Global Style",
        controls: {
            palette: {
                type: ControlType.Enum,
                title: "Colors",
                options: ["custom", "original"],
                optionTitles: ["My colors", "Original palette"],
                defaultValue: "custom",
                displaySegmentedControl: true,
                description:
                    "Switching to the original palette ignores the fields below — it cannot erase them. For a clean slate, delete this instance and drag a fresh one out of Assets.",
            },
            accent: {
                type: ControlType.Color, title: "Accent", defaultValue: DEFAULTS.accent,
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            background: {
                type: ControlType.Color, title: "Page", defaultValue: DEFAULTS.bg,
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            ink: {
                type: ControlType.Color, title: "Text", defaultValue: DEFAULTS.ink,
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            slate: {
                type: ControlType.Color, title: "Secondary Text", defaultValue: DEFAULTS.slate,
                description: "Body copy, ledes, the values in the fact tables.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            mutedText: {
                type: ControlType.Color, title: "Small Text", defaultValue: DEFAULTS.muted,
                description: "The little labels under a number \u2014 Layout, Interior, Lot, the captions and the eyebrow counts. Darken this one if they read too faintly.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            onDark: {
                type: ControlType.Color, title: "Text On Dark", defaultValue: DEFAULTS.onDark,
                description: "Every word that sits on a dark section or over the hero photograph.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            cardColor: {
                type: ControlType.Color, title: "Cards", defaultValue: DEFAULTS.card,
                description: "The solid panels: property cards, reviews, the dark-section insets.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            glassTint: {
                type: ControlType.Color, title: "Glass", defaultValue: DEFAULTS.glass,
                description: "What the frosted panels are tinted with — the summary bar, the filter bar, the side card, the floor plan.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            navTint: {
                type: ControlType.Color, title: "Navbar", defaultValue: DEFAULTS.nav,
                description: "The floating pill at the top. It stays translucent, so this tints it rather than filling it.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            navOnDark: {
                type: ControlType.Enum, title: "Navbar Over Hero",
                options: ["dark", "same"], optionTitles: ["Dark", "Same"],
                defaultValue: "dark", displaySegmentedControl: true,
                description:
                    "While the navbar floats over the hero photograph it is a dark pill with light text, which is why the colour above seems to do nothing up there. Same carries your navbar colour over the hero too and puts the text back to the page's own — pick it when your tint is light.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            buttonFill: {
                type: ControlType.Color, title: "Buttons", defaultValue: DEFAULTS.ink,
                description: "Solid buttons. Outlined and glass ones follow Text and Glass.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            buttonText: {
                type: ControlType.Color, title: "Button Text", defaultValue: DEFAULTS.bg,
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            buttonOnDark: {
                type: ControlType.Enum, title: "Buttons On Dark",
                options: ["invert", "same"], optionTitles: ["Reversed", "Same"],
                defaultValue: "invert", displaySegmentedControl: true,
                description:
                    "On the hero and the dark sections a dark button would vanish, so the fill and the text swap places there. Same keeps your fill everywhere — pick it when your button colour is light enough to read on dark.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            lineColor: {
                type: ControlType.Color, title: "Borders", defaultValue: DEFAULTS.line,
                description: "Hairlines: table rows, outlined buttons, feature tiles.",
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            darkSurface: {
                type: ControlType.Color, title: "Dark Sections", defaultValue: DEFAULTS.night,
                hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
            },
            glassStrength: {
                type: ControlType.Number, title: "Glass", min: 40, max: 140, step: 5,
                defaultValue: 100, unit: "%",
                description: "How opaque the frosted panels are.",
            },
            navStrength: {
                type: ControlType.Number, title: "Navbar Opacity", min: 20, max: 140, step: 5,
                defaultValue: 100, unit: "%",
                description: "How much of the page shows through the floating pill. Separate from Glass so the navbar can be solid while the panels stay frosted.",
            },
            radius: {
                type: ControlType.Number, title: "Corner Radius", min: 0, max: 48, step: 1,
                defaultValue: 30, unit: "px",
            },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "③ Hero",
        controls: {
            showHero: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            photo: {
                type: ControlType.Image,
                title: "Photo — 1600 × 900 px",
                description: "Landscape crop, used from 721 px up.",
            },
            video: {
                type: ControlType.File, title: "Hero Video",
                allowedFileTypes: ["mp4", "webm", "mov"],
                description: "Plays muted on a loop behind the hero, with the photo as its poster. Keep it under about 10 MB — a phone downloads it too.",
            },
            videoLink: {
                type: ControlType.String, title: "Hero Video Link", defaultValue: "",
                placeholder: "YouTube, Vimeo or .mp4 address",
                description: "Used when no file is uploaded above.",
            },
            photoMobile: {
                type: ControlType.Image,
                title: "Photo, Portrait — 800 × 1000 px",
                description: "A 16:9 photo turns into a close-up on a phone. Leave empty to reuse the landscape one.",
            },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Real Estate • Los Angeles" },
            headline: {
                type: ControlType.String, title: "Headline", displayTextArea: true,
                defaultValue: "Homes that\ncarry a story.",
                description: "A line break here becomes a line break on the page.",
            },
            sub: {
                type: ControlType.String, title: "Subheading", displayTextArea: true,
                defaultValue: "Premium properties presented with attention to detail, space and real value.",
            },
            ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "Browse listings" },
            ctaTarget: { type: ControlType.String, title: "Button Target", defaultValue: "listings" },
            cta2Label: { type: ControlType.String, title: "Second Button", defaultValue: "How I work" },
            cta2Target: { type: ControlType.String, title: "Second Target", defaultValue: "about" },
            scrollLabel: { type: ControlType.String, title: "Scroll Hint", defaultValue: "Scroll" },
            chips: {
                type: ControlType.Array,
                title: "Corner Badges",
                control: {
                    type: ControlType.Object,
                    controls: {
                        value: { type: ControlType.String, title: "Figure", defaultValue: "214" },
                        label: { type: ControlType.String, title: "Label", defaultValue: "homes sold" },
                    },
                },
                defaultValue: [
                    { value: "214", label: "homes sold" },
                    { value: "12 years", label: "across LA" },
                    { value: "4.9/5", label: "client rating" },
                ],
            },
        },
    },

    trust: {
        type: ControlType.Object,
        title: "④ Trust Bar",
        controls: {
            showTrust: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            items: {
                type: ControlType.Array,
                title: "Figures",
                control: {
                    type: ControlType.Object,
                    controls: {
                        value: { type: ControlType.String, title: "Figure", defaultValue: "214" },
                        suffix: { type: ControlType.String, title: "Suffix", defaultValue: "+" },
                        label: { type: ControlType.String, title: "Label", defaultValue: "Homes sold" },
                    },
                },
                defaultValue: [
                    { value: "214", suffix: "+", label: "Homes sold" },
                    { value: "38 ", suffix: "days", label: "Average time on market" },
                    { value: "104", suffix: "%", label: "Of asking price, on average" },
                    { value: "4.9", suffix: "/5", label: "Client rating" },
                ],
            },
        },
    },

    sections: {
        type: ControlType.Object,
        title: "⑤ Section Headings",
        controls: {
            showFeatured: { type: ControlType.Boolean, title: "Show Featured", defaultValue: true },
            featuredEyebrow: { type: ControlType.String, title: "Featured Eyebrow", defaultValue: "Featured properties" },
            featuredHeading: {
                type: ControlType.String, title: "Featured Heading", displayTextArea: true,
                defaultValue: "Places worth\nseeing in person.",
            },
            featuredLede: {
                type: ControlType.String, title: "Featured Text", displayTextArea: true,
                defaultValue: "Five homes I consider the most interesting on the Los Angeles market right now.",
            },
            featuredLinkLabel: { type: ControlType.String, title: "Featured Link", defaultValue: "All listings" },
            showCatalogue: { type: ControlType.Boolean, title: "Show Catalogue", defaultValue: true },
            catalogueEyebrow: { type: ControlType.String, title: "Catalogue Eyebrow", defaultValue: "Catalogue" },
            catalogueHeading: {
                type: ControlType.String, title: "Catalogue Heading", displayTextArea: true,
                defaultValue: "Find the place where\nyour next chapter begins.",
            },
        },
    },

    listings: {
        type: ControlType.Object,
        title: "⑥ Listings",
        controls: {
            items: {
                type: ControlType.Array,
                title: "Properties",
                description:
                    "Every card, the catalogue and the detail page come from this list. A listing marked Featured also appears in the Featured grid — the first five do.",
                control: {
                    type: ControlType.Object,
                    controls: {
                        title: { type: ControlType.String, title: "Title", defaultValue: "Modern Villa" },
                        location: { type: ControlType.String, title: "Neighborhood", defaultValue: "Pacific Palisades" },
                        locationNote: { type: ControlType.String, title: "One-line Note", defaultValue: "Quiet canyon street" },
                        mode: {
                            type: ControlType.Enum, title: "Offered", options: ["sale", "rent"],
                            optionTitles: ["For sale", "For rent"], defaultValue: "sale", displaySegmentedControl: true,
                        },
                        type: {
                            type: ControlType.Enum, title: "Type",
                            options: ["Apartment", "House", "Villa", "Land", "Commercial"],
                            defaultValue: "Villa",
                        },
                        price: { type: ControlType.Number, title: "Price", min: 0, max: 100000000, step: 1000, defaultValue: 3950000 },
                        priceNote: { type: ControlType.String, title: "Price Note", defaultValue: "" },
                        beds: { type: ControlType.Number, title: "Bedrooms", min: 0, max: 20, step: 1, defaultValue: 3 },
                        baths: { type: ControlType.Number, title: "Bathrooms", min: 0, max: 20, step: 1, defaultValue: 2 },
                        interior: { type: ControlType.Number, title: "Interior", min: 0, max: 40000, step: 10, defaultValue: 2002, unit: "sq ft" },
                        lot: { type: ControlType.Number, title: "Lot", min: 0, max: 400000, step: 10, defaultValue: 0, unit: "sq ft" },
                        terrace: { type: ControlType.Number, title: "Terrace", min: 0, max: 10000, step: 10, defaultValue: 0, unit: "sq ft" },
                        floors: { type: ControlType.Number, title: "Stories", min: 0, max: 10, step: 1, defaultValue: 2 },
                        footprintW: {
                            type: ControlType.Number, title: "Building Width", min: 0, max: 500, step: 0.01, defaultValue: 0, unit: "ft",
                            description: "Outside measurements of the building. Both set shows a Footprint row on the detail page; 0 hides it.",
                        },
                        footprintD: {
                            type: ControlType.Number, title: "Building Depth", min: 0, max: 500, step: 0.01, defaultValue: 0, unit: "ft",
                        },
                        yearBuilt: { type: ControlType.Number, title: "Year Built", min: 0, max: 2100, step: 1, defaultValue: 2021 },
                        energyRating: {
                            type: ControlType.Number, title: "HERS Index", min: 0, max: 150, step: 1, defaultValue: 38,
                            description: "Lower is better. 0 hides the row.",
                        },
                        status: { type: ControlType.String, title: "Status Badge", defaultValue: "New to market" },
                        statusTone: {
                            type: ControlType.Enum, title: "Badge Dot", options: ["green", "amber", "slate"],
                            optionTitles: ["Green", "Amber", "Grey"], defaultValue: "green",
                        },
                        featured: { type: ControlType.Boolean, title: "In Featured Grid", defaultValue: true },
                        photo: { type: ControlType.Image, title: "Cover Photo — 1600 × 1000 px" },
                        photo2: { type: ControlType.Image, title: "Gallery 2" },
                        photo3: { type: ControlType.Image, title: "Gallery 3" },
                        photo4: { type: ControlType.Image, title: "Gallery 4" },
                        photo5: { type: ControlType.Image, title: "Gallery 5" },
                        scene: {
                            type: ControlType.Enum, title: "Drawn Stand-in",
                            options: SCENE_OPTIONS, optionTitles: SCENE_TITLES, defaultValue: "villa",
                            description: "Used for any photo slot you leave empty.",
                        },
                        sceneTime: {
                            type: ControlType.Enum, title: "Stand-in Light",
                            options: ["dusk", "evening", "morning", "day", "winter"],
                            optionTitles: ["Dusk", "Evening", "Morning", "Midday", "Winter"], defaultValue: "dusk",
                        },
                        description: {
                            type: ControlType.String, title: "Description", displayTextArea: true,
                            defaultValue: "One paragraph per blank line.",
                        },
                        features: {
                            type: ControlType.String, title: "Features — What Comes With It", displayTextArea: true,
                            defaultValue: "Heat pump, Triple glazing, Radiant floors",
                            description:
                                "The tiles in this property's Features section. Separate them with commas: Heat pump, Triple glazing, Radiant floors. Empty hides the section.",
                        },
                        nearby: {
                            type: ControlType.String, title: "Nearby (older way)", displayTextArea: true,
                            defaultValue: "Village — 1.4 mi\nSchool — 0.4 mi",
                            description:
                                "Use ⑩ Map Pins instead — a row per place, with an icon you pick and its own Google Maps link. This field is read only for a property that has no rows there. One per line: Place — distance — icon — x,y.",
                        },
                        videoLink: {
                            type: ControlType.String, title: "Video Tour", defaultValue: "",
                            placeholder: "YouTube, Vimeo or .mp4 address",
                            description:
                                "A tour of this property, shown as its own section on the detail page and marked with a Video tour tag. A file cannot be uploaded here — Framer allows no upload field inside a list — so paste the address of the video instead.",
                        },
                        planImage: {
                            type: ControlType.Image,
                            title: "Floor Plan Drawing",
                            description:
                                "Your own plan, as a picture. It takes the whole stage — pan and zoom included — with the rooms listed beside it. Leave it empty and the section is the room list alone.",
                        },
                        plan: {
                            type: ControlType.Enum, title: "Drawn Plan",
                            options: ["none", "rooms", "villa"],
                            optionTitles: ["None — room list only", "Build from my rooms", "Two-storey demo"],
                            defaultValue: "none",
                            description:
                                "Build from my rooms draws a clickable plan to scale from Plan X / Plan Y on each room in ⑦ Rooms — floors come from each room's Floor field. Leave every position at 0 and the rooms are tiled for you to nudge. A Floor Plan Drawing above wins over this.",
                        },
                    },
                },
                defaultValue: DEFAULT_LISTINGS,
            },
        },
    },

    rooms: {
        type: ControlType.Object,
        title: "⑦ Rooms",
        controls: {
            items: {
                type: ControlType.Array,
                title: "Rooms",
                description:
                    "Every room of every property, in one list — this is where the Entry Hall, Living Room and the rest are named. Property № is the listing's position in ⑥ Listings, 1 being the first. Drag the rows to set the order they appear in on the page.",
                control: {
                    type: ControlType.Object,
                    controls: {
                        /* Name first: it is the field the list is read by, and
                           the one you look for when reordering the rows. */
                        name: { type: ControlType.String, title: "Room Name", defaultValue: "Living Room" },
                        property: {
                            type: ControlType.Number, title: "Property №", min: 1, max: 200, step: 1, defaultValue: 1,
                            description: "Position in ⑥ Listings.",
                        },
                        area: { type: ControlType.Number, title: "Area", min: 0, max: 5000, step: 1, defaultValue: 461, unit: "sq ft" },
                        width: { type: ControlType.Number, title: "Width", min: 0, max: 200, step: 0.01, defaultValue: 23.36, unit: "ft" },
                        length: { type: ControlType.Number, title: "Length", min: 0, max: 200, step: 0.01, defaultValue: 19.75, unit: "ft" },
                        ceiling: { type: ControlType.Number, title: "Ceiling", min: 0, max: 40, step: 0.01, defaultValue: 9.35, unit: "ft" },
                        ori: { type: ControlType.Enum, title: "Facing", options: ORI_OPTIONS, optionTitles: ORI_TITLES, defaultValue: "SW" },
                        floor: { type: ControlType.String, title: "Floor", defaultValue: "1st Floor" },
                        windows: { type: ControlType.String, title: "Windows", defaultValue: "2 windows" },
                        flooring: { type: ControlType.String, title: "Flooring", defaultValue: "White oak" },
                        roomText: { type: ControlType.String, title: "Note", defaultValue: "" },
                        roomPhoto: { type: ControlType.Image, title: "Photo — 1600 × 1000 px" },
                        planX: {
                            type: ControlType.Number, title: "Plan X", min: 0, max: 400, step: 0.01, defaultValue: 0, unit: "ft",
                            description: "Only for a listing set to Build from my rooms: how far from the left edge of that floor this room starts.",
                        },
                        planY: {
                            type: ControlType.Number, title: "Plan Y", min: 0, max: 400, step: 0.01, defaultValue: 0, unit: "ft",
                            description: "…and how far down from the top edge.",
                        },
                        planW: {
                            type: ControlType.Number, title: "Plan Width", min: 0, max: 400, step: 0.01, defaultValue: 0, unit: "ft",
                            description: "0 uses Width above. Set it only where the room is not a plain rectangle of its own measurements.",
                        },
                        planH: {
                            type: ControlType.Number, title: "Plan Depth", min: 0, max: 400, step: 0.01, defaultValue: 0, unit: "ft",
                            description: "0 uses Length above.",
                        },
                        scene: {
                            type: ControlType.Enum, title: "Drawn Stand-in",
                            options: ROOM_SCENE_OPTIONS, optionTitles: ROOM_SCENE_TITLES, defaultValue: "living",
                            description: "Used when you leave the photo empty.",
                        },
                        sceneOut: {
                            type: ControlType.Enum, title: "View Out",
                            options: ["garden", "city", "forest"],
                            optionTitles: ["Garden", "City", "Trees"], defaultValue: "garden",
                        },
                    },
                },
                defaultValue: DEFAULT_ROOMS,
            },
        },
    },

    levels: {
        type: ControlType.Object,
        title: "⑧ Floors",
        controls: {
            items: {
                type: ControlType.Array,
                title: "Floors",
                description:
                    "How big each floor is, listed under Floor by floor on the property page. Property № is the listing's position in ⑥ Listings. Name a floor exactly as the rooms of that floor name it in ⑦ Rooms and this list also sets the order of the tabs on a plan built from the rooms.",
                control: {
                    type: ControlType.Object,
                    controls: {
                        name: { type: ControlType.String, title: "Floor Name", defaultValue: "1st Floor" },
                        property: {
                            type: ControlType.Number, title: "Property №", min: 1, max: 200, step: 1, defaultValue: 1,
                            description: "Position in ⑥ Listings.",
                        },
                        area: { type: ControlType.Number, title: "Floor Area", min: 0, max: 40000, step: 1, defaultValue: 0, unit: "sq ft" },
                        width: { type: ControlType.Number, title: "Width", min: 0, max: 500, step: 0.01, defaultValue: 0, unit: "ft" },
                        depth: { type: ControlType.Number, title: "Depth", min: 0, max: 500, step: 0.01, defaultValue: 0, unit: "ft" },
                        note: {
                            type: ControlType.String, title: "Note", defaultValue: "",
                            placeholder: "Living space and kitchen",
                        },
                    },
                },
                defaultValue: DEFAULT_FLOORS,
            },
        },
    },

    photos: {
        type: ControlType.Object,
        title: "⑨ Photos",
        controls: {
            items: {
                type: ControlType.Array,
                title: "Gallery Photos",
                description:
                    "The gallery on each detail page, and the name shown on each photo. Property № is the listing's position in ⑥ Listings. The listing's own Cover Photo opens the gallery; these follow it in the order you drag them into. A photo with no room of its own also fills the next room card that has no photo.",
                control: {
                    type: ControlType.Object,
                    controls: {
                        /* Caption first: it names the row, and it is the label
                           that shows on the photo and in the lightbox. */
                        caption: { type: ControlType.String, title: "Photo Name", defaultValue: "Living room" },
                        property: {
                            type: ControlType.Number, title: "Property №", min: 1, max: 200, step: 1, defaultValue: 1,
                            description: "Position in ⑥ Listings.",
                        },
                        image: { type: ControlType.Image, title: "Photo — 1600 × 1000 px" },
                        v: {
                            type: ControlType.Enum, title: "Drawn Stand-in",
                            options: GALLERY_SCENE_OPTIONS, optionTitles: GALLERY_SCENE_TITLES, defaultValue: "living",
                            description: "Used when you leave the photo empty.",
                        },
                        out: {
                            type: ControlType.Enum, title: "View Out",
                            options: ["garden", "city", "forest"],
                            optionTitles: ["Garden", "City", "Trees"], defaultValue: "garden",
                        },
                        t: {
                            type: ControlType.Enum, title: "Stand-in Light",
                            options: ["", "dusk", "evening", "morning", "day", "winter"],
                            optionTitles: ["Default", "Dusk", "Evening", "Morning", "Midday", "Winter"],
                            defaultValue: "",
                        },
                    },
                },
                defaultValue: DEFAULT_PHOTOS,
            },
        },
    },

    pins: {
        type: ControlType.Object,
        title: "⑩ Map Pins",
        controls: {
            items: {
                type: ControlType.Array,
                title: "Nearby Places",
                description:
                    "One row per place on the map, up to ten per property. Property № is the listing's position in ⑥ Listings. Open the place in Google Maps, press Share, Copy link, and paste it into Google Maps Link — the pin and its chip then open exactly that place.",
                control: {
                    type: ControlType.Object,
                    controls: {
                        n: { type: ControlType.String, title: "Place", defaultValue: "Supermarket" },
                        property: {
                            type: ControlType.Number, title: "Property №", min: 1, max: 200, step: 1, defaultValue: 1,
                            description: "Position in ⑥ Listings.",
                        },
                        d: { type: ControlType.String, title: "Distance", defaultValue: "0.4 mi" },
                        kind: {
                            type: ControlType.Enum, title: "Icon",
                            options: PIN_ICON_OPTIONS, optionTitles: PIN_ICON_TITLES, defaultValue: "market",
                        },
                        href: {
                            type: ControlType.String, title: "Google Maps Link", defaultValue: "",
                            placeholder: "https://maps.app.goo.gl/…",
                            description: "Leave empty and the pin searches Google Maps for this place near the property.",
                        },
                        x: {
                            type: ControlType.Number, title: "Across", min: 0, max: 100, step: 1, defaultValue: 0, unit: "%",
                            description: "Where the pin sits on the map, from the left. Leave both at 0 to have it placed for you.",
                        },
                        y: {
                            type: ControlType.Number, title: "Down", min: 0, max: 100, step: 1, defaultValue: 0, unit: "%",
                        },
                    },
                },
                defaultValue: DEFAULT_PINS,
            },
        },
    },

    detail: {
        type: ControlType.Object,
        title: "⑪ Detail Page",
        description:
            "The headings on a property page — the page you land on after clicking a listing. Clear a field to bring the original back.",
        controls: {
            mapLinks: {
                type: ControlType.Boolean, title: "Pins Open Google Maps", defaultValue: true,
                enabledTitle: "Yes", disabledTitle: "No",
                description: "A pin and its chip open a Google Maps search for that place near the property, in a new tab.",
            },
            mapRegion: {
                type: ControlType.String, title: "Add To Map Search", defaultValue: "",
                placeholder: "Los Angeles, CA",
                description: "Appended to the search so a common name lands in the right town.",
            },
            videoEyebrow: { type: ControlType.String, title: "Video Label", defaultValue: "Video" },
            videoHeading: {
                type: ControlType.String, title: "Video Heading", displayTextArea: true,
                defaultValue: "Walk through it\non film.",
            },
            galleryEyebrow: { type: ControlType.String, title: "Gallery Label", defaultValue: "Gallery" },
            galleryHeading: {
                type: ControlType.String, title: "Gallery Heading", displayTextArea: true,
                defaultValue: "Take a look inside.",
            },
            roomsEyebrow: {
                type: ControlType.String, title: "Rooms Label", defaultValue: "Explore the {type}",
                description: "{type} becomes apartment, suite or house, following the listing's Type.",
            },
            roomsHeading: {
                type: ControlType.String, title: "Rooms Heading", displayTextArea: true,
                defaultValue: "Every room,\ndown to the inch.",
                description: "A line break here is a line break on the page.",
            },
            roomsLede: {
                type: ControlType.String, title: "Rooms Text", displayTextArea: true,
                defaultValue: "Hover a room and its exact area, dimensions, compass orientation, ceiling height and flooring appear. Click to open the full detail.",
            },
            planEyebrow: { type: ControlType.String, title: "Floor Plan Label", defaultValue: "Floor plan" },
            planHeading: {
                type: ControlType.String, title: "Floor Plan Heading", displayTextArea: true,
                defaultValue: "The whole layout,\nwired to every room.",
                description: "Shown where there is a drawing to click.",
            },
            planHeadingList: {
                type: ControlType.String, title: "Room List Heading", displayTextArea: true,
                defaultValue: "The whole layout,\nroom by room.",
                description: "Shown where the section is the room text boxes alone.",
            },
            featuresEyebrow: { type: ControlType.String, title: "Features Label", defaultValue: "Features" },
            featuresHeading: {
                type: ControlType.String, title: "Features Heading", displayTextArea: true,
                defaultValue: "What comes with it.",
            },
            locationEyebrow: { type: ControlType.String, title: "Location Label", defaultValue: "Location" },
            locationHeading: {
                type: ControlType.String, title: "Location Heading", displayTextArea: true,
                defaultValue: "Where you would live.",
            },
            similarEyebrow: { type: ControlType.String, title: "Similar Label", defaultValue: "Similar properties" },
            similarHeading: {
                type: ControlType.String, title: "Similar Heading", displayTextArea: true,
                defaultValue: "You might also like.",
            },
        },
    },

    about: {
        type: ControlType.Object,
        title: "⑫ Agent",
        controls: {
            showAbout: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            portrait: { type: ControlType.Image, title: "Portrait — 900 × 1200 px" },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "About" },
            quote: {
                type: ControlType.String, title: "Headline", displayTextArea: true,
                defaultValue: "I don't just sell houses.\nI help people find their next place.",
            },
            text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: DEFAULT_ABOUT_TEXT },
            ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "Book a consultation" },
            stats: {
                type: ControlType.Array,
                title: "Figures",
                control: {
                    type: ControlType.Object,
                    controls: {
                        value: { type: ControlType.String, title: "Figure", defaultValue: "214" },
                        label: { type: ControlType.String, title: "Label", defaultValue: "Homes sold" },
                    },
                },
                defaultValue: [
                    { value: "214", label: "Homes sold" },
                    { value: "12", label: "Years on the market" },
                    { value: "4.9", label: "Client rating" },
                ],
            },
            agentName: { type: ControlType.String, title: "Name", defaultValue: DEFAULT_AGENT.name },
            agentRole: { type: ControlType.String, title: "Role", defaultValue: DEFAULT_AGENT.role },
            agentLicense: { type: ControlType.String, title: "License", defaultValue: DEFAULT_AGENT.license },
            agentPhone: { type: ControlType.String, title: "Phone", defaultValue: DEFAULT_AGENT.phone },
            agentEmail: { type: ControlType.String, title: "Email", defaultValue: DEFAULT_AGENT.email },
        },
    },

    reviews: {
        type: ControlType.Object,
        title: "⑬ Reviews",
        controls: {
            showReviews: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Reviews" },
            heading: {
                type: ControlType.String, title: "Heading", displayTextArea: true,
                defaultValue: "What people say\nonce they've moved.",
            },
            items: {
                type: ControlType.Array,
                title: "Quotes",
                control: {
                    type: ControlType.Object,
                    controls: {
                        quote: { type: ControlType.String, title: "Quote", defaultValue: "" },
                        who: { type: ControlType.String, title: "Name", defaultValue: "" },
                        where: { type: ControlType.String, title: "Detail", defaultValue: "" },
                        stars: { type: ControlType.Number, title: "Stars", min: 1, max: 5, step: 1, defaultValue: 5 },
                    },
                },
                defaultValue: DEFAULT_REVIEWS,
            },
        },
    },

    contact: {
        type: ControlType.Object,
        title: "⑭ Contact",
        controls: {
            showContact: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Contact" },
            heading: {
                type: ControlType.String, title: "Heading", displayTextArea: true,
                defaultValue: "Have a home\nyou want to sell?",
            },
            text: {
                type: ControlType.String, title: "Text", displayTextArea: true,
                defaultValue: "I handle the presentation, the marketing and the whole sale — from the first measurement to handing over the keys.",
            },
            primaryLabel: {
                type: ControlType.String, title: "Button", defaultValue: "List your home",
                description: "Opens the visitor's mail app addressed to the agent — nothing to set up, and Framer will not deliver a form posted from inside a code component.",
            },
            secondaryLabel: { type: ControlType.String, title: "Second Button", defaultValue: "Call the agent" },
            cards: {
                type: ControlType.Array,
                title: "Steps",
                control: {
                    type: ControlType.Object,
                    controls: {
                        kicker: { type: ControlType.String, title: "Kicker", defaultValue: "Valuation" },
                        title: { type: ControlType.String, title: "Title", defaultValue: "A price within 48 hours" },
                        text: { type: ControlType.String, title: "Text", defaultValue: "" },
                    },
                },
                defaultValue: DEFAULT_CTA_CARDS,
            },
        },
    },

    footer: {
        type: ControlType.Object,
        title: "⑮ Footer",
        controls: {
            showFooter: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            blurb: {
                type: ControlType.String, title: "Blurb", displayTextArea: true,
                defaultValue: "Premium homes across Los Angeles. The place where your next chapter begins.",
            },
            address: { type: ControlType.String, title: "Address", defaultValue: "8236 Beverly Blvd, Los Angeles" },
            left: { type: ControlType.String, title: "Left Text", defaultValue: "© 2026 Threshold Realty" },
            right: { type: ControlType.String, title: "Right Text", defaultValue: "Demo presentation · Fictional listings and contact details" },
        },
    },
})
