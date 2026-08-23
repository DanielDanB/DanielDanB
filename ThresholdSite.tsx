import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

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
  --nav-dark-fg:#f4f2ec;
  --nav-dark-link:rgba(244,242,236,0.88);
  --nav-dark-link-hover:#ffffff;
  --nav-dark-sub:rgba(244,242,236,0.70);
  --nav-dark-cta-bg:var(--btn-dark-fill);
  --nav-dark-cta-fg:var(--btn-dark-ink);
  --glass-rgb:255,255,255;
  --night-rgb:18,20,24;

  --glass:rgba(255,255,255,0.55);
  --glass-strong:rgba(255,255,255,0.72);
  --glass-quiet:rgba(255,255,255,0.38);
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
  color:#f2f0ea;
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
  background:rgba(var(--nav-rgb),0.34);
  border:1px solid rgba(255,255,255,0.42);
  -webkit-backdrop-filter:blur(18px) saturate(1.6);
  backdrop-filter:blur(18px) saturate(1.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 40px -26px rgba(21,22,26,0.5);
  transition:background var(--t) var(--ease), box-shadow var(--t) var(--ease),
             border-color var(--t) var(--ease), height var(--t) var(--ease);
}
.thr-root .site-header.is-scrolled .nav{
  background:rgba(var(--nav-rgb),0.72);
  border-color:rgba(255,255,255,0.8);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 46px -28px rgba(21,22,26,0.55);
}
.thr-root .site-header.on-dark .nav{
  /* Floating over the dark hero the pill follows the dark-section colour
     rather than the navbar tint, or a light tint would land under light text. */
  background:rgba(var(--nav-dark-rgb),0.50);
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
  color:#fff;
}
.thr-root .hero__card .eyebrow{color:var(--champagne-soft); display:block; margin-bottom:22px;}
.thr-root .hero h1{color:#fff; margin-bottom:22px; text-wrap:balance;}
.thr-root .hero__sub{
  color:rgba(255,255,255,0.88); font-weight:300;
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
  color:#fff; font-size:0.82rem;
}
.thr-root .hero__chip b{font-weight:500;}
.thr-root .hero__chip .mono{color:var(--champagne-soft); font-size:0.72rem; letter-spacing:0.1em;}

.thr-root .scroll-hint{
  position:absolute; left:50%; bottom:22px; transform:translateX(-50%);
  z-index:2; display:flex; flex-direction:column; align-items:center; gap:10px;
  color:rgba(255,255,255,0.78);
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
  color:#fff; white-space:nowrap;
}
.thr-root .tag--solid{background:rgba(20,21,25,0.62); border-color:rgba(255,255,255,0.16);}
.thr-root .tag--accent{background:rgba(var(--champagne-rgb),0.86); border-color:rgba(255,255,255,0.30); color:#fff;}
.thr-root .tag--plan{margin-left:auto;}
.thr-root .tag__dot{width:6px; height:6px; border-radius:50%; background:#7ecb9a; flex:none;}
.thr-root .tag__dot--amber{background:#e2b25c;}
.thr-root .tag__dot--slate{background:#a9adb6;}

.thr-root .prop-card__over{
  position:absolute; left:16px; right:16px; bottom:16px;
  display:flex; align-items:flex-end; justify-content:space-between; gap:14px;
  color:#fff; pointer-events:none;
}
.thr-root .prop-card__loc{
  font-family:'IBM Plex Mono',monospace; font-size:0.66rem;
  letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.78);
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
  color:#fff; font-size:0.8rem;
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
  background-color:rgba(var(--glass-rgb),0.46);
  background-image:
    linear-gradient(166deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.06) 44%, rgba(255,255,255,0) 62%),
    radial-gradient(130% 105% at 8% -30%, rgba(255,255,255,0.5), transparent 62%);
  -webkit-backdrop-filter:blur(30px) saturate(1.9);
  backdrop-filter:blur(30px) saturate(1.9);
  border:1px solid rgba(255,255,255,0.6);
  border-top-color:rgba(255,255,255,0.85);
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
  border-radius:999px; font-size:0.82rem; background:rgba(var(--glass-rgb),0.6);
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
    background-color:rgba(var(--glass-rgb),0.72);
    border-color:rgba(255,255,255,0.78);
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
  .thr-root .filters.is-stuck.is-open{background-color:rgba(var(--glass-rgb),0.66);}
  .thr-root .filters.is-stuck.is-open .filters__more{grid-template-rows:1fr;}
  .thr-root .filters.is-stuck.is-open .filters__more-inner{opacity:1;}
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
  border:1px solid var(--line); background:rgba(var(--glass-rgb),0.5);
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
  border:1px solid var(--line); background:rgba(var(--glass-rgb),0.5);
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
  color:#fff;
}
.thr-root .agent__badge .mono{font-size:0.66rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.72);}
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
  border:1px solid var(--line); background:rgba(var(--glass-rgb),0.5);
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
  border:1px solid var(--line); background:rgba(var(--glass-rgb),0.5);
  transition:background var(--t) var(--ease), border-color var(--t) var(--ease), transform var(--t) var(--ease);
}
.thr-root .round-btn:hover{background:var(--paper); border-color:var(--ink); transform:translateY(-2px);}
.thr-root .round-btn svg{width:16px; height:16px;}
.thr-root .round-btn[disabled]{opacity:0.35; pointer-events:none;}

/* ==========================================================================
   Dark CTA + footer
   ========================================================================== */

.thr-root .dark-sec{
  position:relative; background:var(--night); color:#f2f0ea; overflow:hidden;
  border-radius:var(--r-xl);
}
.thr-root .dark-sec::before{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(700px 420px at 82% 6%, rgba(var(--champagne-rgb),0.20), transparent 60%),
    radial-gradient(620px 400px at 8% 92%, rgba(120,140,170,0.16), transparent 62%);
}
.thr-root .cta{position:relative; padding:clamp(52px,8vw,110px) clamp(24px,5vw,80px); text-align:center;}
.thr-root .cta h2{color:#fff; margin-bottom:22px; text-wrap:balance;}
.thr-root .cta p{color:rgba(242,240,234,0.66); font-weight:300; max-width:52ch; margin:0 auto 34px; font-size:clamp(1rem,1.2vw,1.1rem);}
.thr-root .cta__btns{display:flex; gap:12px; justify-content:center; flex-wrap:wrap;}
.thr-root .cta__cards{
  display:grid; grid-template-columns:repeat(3,1fr); gap:14px;
  margin-top:clamp(38px,5vw,62px); text-align:left;
}
.thr-root .cta__card{border-radius:var(--r-md); padding:22px;}
.thr-root .cta__card .mono{font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--champagne-soft);}
.thr-root .cta__card b{display:block; margin:12px 0 8px; font-weight:400; font-size:1.02rem; letter-spacing:-0.02em;}
.thr-root .cta__card span{font-size:0.84rem; color:rgba(242,240,234,0.58); line-height:1.55;}

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
  background:rgba(var(--glass-rgb),0.62);
  border:1px solid rgba(255,255,255,0.8);
  -webkit-backdrop-filter:blur(16px) saturate(1.5);
  backdrop-filter:blur(16px) saturate(1.5);
  box-shadow:var(--sh-1);
  transition:transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .map-chip:hover, .thr-root .map-chip.is-active{transform:translateY(-2px); background:rgba(var(--glass-rgb),0.9);}
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
  color:#fff;
}
.thr-root .detail-hero h1{font-size:clamp(2.1rem,4.6vw,4.1rem); color:#fff; margin:16px 0 14px; text-wrap:balance;}
.thr-root .detail-hero__loc{display:flex; align-items:center; gap:10px; color:rgba(255,255,255,0.8); font-size:0.92rem;}
.thr-root .detail-hero__loc svg{width:15px; height:15px; color:var(--champagne-soft);}
.thr-root .detail-hero__tags{display:flex; gap:8px; flex-wrap:wrap;}
.thr-root .detail-hero__side{display:flex; flex-direction:column; gap:10px; align-items:flex-end;}
.thr-root .back-btn{
  position:absolute; top:calc(var(--nav-h) + 34px); left:var(--gut); z-index:5;
  display:inline-flex; align-items:center; gap:9px;
  padding:11px 18px; border-radius:999px; font-size:0.82rem; color:#fff;
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
  min-width:24px; padding:3px 8px; border-radius:6px; color:#fff;
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
  border-radius:var(--r-sm); background:rgba(var(--glass-rgb),0.5);
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
  color:#fff; font-size:0.72rem;
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
  padding:18px clamp(14px,3vw,28px); color:rgba(255,255,255,0.8);
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
  color:#fff; transition:background var(--t) var(--ease), transform var(--t) var(--ease);
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
  color:#fff; transition:background var(--t) var(--ease);
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
  font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:#fff;
  background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.26);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
}

/* Floating room popover */

.thr-root .popover{
  position:fixed; z-index:250; width:308px; pointer-events:none;
  border-radius:var(--r-md); overflow:hidden;
  background:rgba(var(--glass-rgb),0.62);
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
  background:rgba(20,21,25,0.62); color:#fff;
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
.thr-root .levels{display:inline-flex; padding:4px; border-radius:999px; gap:2px; background:rgba(var(--glass-rgb),0.55); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .levels__btn{padding:8px 15px; border-radius:999px; font-size:0.78rem; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .levels__btn.is-active{background:var(--ink); color:var(--bone);}
.thr-root .zoomer{display:inline-flex; gap:4px; padding:4px; border-radius:999px; background:rgba(var(--glass-rgb),0.55); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .zoomer button{width:34px; height:34px; border-radius:999px; display:grid; place-items:center; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .zoomer button:hover{background:rgba(21,22,26,0.06); color:var(--ink);}
.thr-root .zoomer svg{width:15px; height:15px;}
.thr-root .plan__hint{
  position:absolute; left:14px; bottom:14px; z-index:3;
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem; letter-spacing:0.16em;
  text-transform:uppercase; color:var(--muted);
  padding:8px 13px; border-radius:999px;
  background:rgba(var(--glass-rgb),0.5); border:1px solid rgba(255,255,255,0.66);
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
  background:rgba(var(--glass-rgb),0.5); border:1px solid var(--line);
  transition:border-color var(--t) var(--ease), background var(--t) var(--ease),
             transform var(--t) var(--ease);
}
.thr-root .plan__row:hover{background:rgba(var(--glass-rgb),0.78); border-color:rgba(var(--champagne-rgb),0.6); transform:translateX(2px);}
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
.thr-root .rp__spec{background:rgba(var(--glass-rgb),0.62); padding:13px 14px;}
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
.thr-root .sheet__close.icon-btn{background:rgba(20,21,25,0.42); border-color:rgba(255,255,255,0.2);}
.thr-root .sheet__scroll{overflow-y:auto; -webkit-overflow-scrolling:touch;}
.thr-root .rd{display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);}
.thr-root .rd__media{position:relative; background:var(--mist); min-height:280px;}
.thr-root .rd__media img{width:100%; height:100%; object-fit:cover;}
.thr-root .rd__badge{
  position:absolute; left:16px; top:16px;
  padding:7px 13px; border-radius:999px;
  background:rgba(20,21,25,0.55); color:#fff;
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
  background:var(--night); color:#f2f0ea;
  font-size:0.84rem; line-height:1.5; text-align:center;
}
.thr-root .noscript-note strong{font-weight:500;}
.thr-root .noscript-note em{font-style:normal; color:var(--champagne-soft);}

/* Toast */

.thr-root .toast{
  position:fixed; left:50%; bottom:26px; transform:translate(-50%,20px);
  z-index:320; padding:13px 20px; border-radius:999px;
  background:rgba(20,21,25,0.86); color:#f4f2ec; font-size:0.85rem;
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
const HERO_PHOTO_WIDE = "data:image/webp;base64,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"
const HERO_PHOTO_TALL = "data:image/webp;base64,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"

/* The three other demo photographs. WebP, inlined so the component carries
   its own example. Anything a buyer uploads in the panel wins over these. */
const PHOTO_PORCHEXT = "data:image/webp;base64,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"
const PHOTO_VILLALIV = "data:image/webp;base64,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"
const PHOTO_GREYLIV = "data:image/webp;base64,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"

const DEFAULT_AGENT = { name: "Adam Marsh", role: "Real Estate Agent \u00b7 Los Angeles", license: "DRE #02145879", phone: "+1 (310) 555-0148", email: "adam@thresholdrealty.com", sold: 214, years: 12, rating: 4.9 }

const DEFAULT_LISTINGS: any[] = [
    { title: "Modern Villa", location: "Pacific Palisades", locationNote: "Quiet canyon street, 600 ft from the trailhead", type: "Villa", mode: "sale", price: 3950000, priceNote: "", beds: 3, baths: 2, interior: 2002, lot: 13347, terrace: 0, floors: 2, footprintW: 43.9, footprintD: 29.3, yearBuilt: 2021, energyRating: 38, status: "New to market", statusTone: "green", featured: true, scene: "villa", sceneTime: "dusk", seed: "villa-1", plan: "villa", photo: HERO_PHOTO_WIDE, description: "Built in 2021 on a lot that falls away to the southwest \u2014 and the whole house answers that view. The living space opens to the garden through three full-height sliders, the kitchen keeps its own south light, and the upper floor steps back so a covered roof terrace sits above the living room.\n\nConstruction is steel and stone with triple glazing, balanced ventilation with heat recovery, and a ground-source heat pump. Radiant floors run through every room, cooling covers the upper floor, and the envelope is insulated well past code \u2014 the house runs on about $780 a year.\n\nThe 13,347 sq ft lot is fenced and planted, with mature pines along the north edge. The approach is from the east and covered parking for two cars is part of the structure.", features: "Ground-source heat pump, Heat-recovery ventilation, Triple glazing, Radiant floors, Upper-floor cooling, Fireplace, 284 sq ft roof terrace, 2-car covered parking, 7.2 kW solar array, Drip irrigation, Automatic gate, Fiber internet", nearby: "Palisades Village \u2014 1.4 mi \u2014 city\nMarquez Charter Elem. \u2014 0.4 mi \u2014 school\nRalphs supermarket \u2014 1.1 mi \u2014 market\nPharmacy on Sunset \u2014 1.1 mi \u2014 pharmacy\nPost office \u2014 1.3 mi \u2014 post\nRestaurants on Sunset \u2014 0.7 mi \u2014 restaurant\nTemescal Canyon trails \u2014 600 ft \u2014 park\nMetro bus, PCH \u2014 0.3 mi \u2014 bus", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "villa-liv", caption: "Living room", image: PHOTO_GREYLIV },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "villa-kit", caption: "Kitchen and dining" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "villa-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "villa-bath", caption: "Bathroom" },
        { k: "exterior", v: "villa", out: "", t: "morning", seed: "villa-2", caption: "Garden and pool in the morning" },
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
        { k: "interior", v: "living", out: "city", t: "", seed: "ph-liv", caption: "Living space" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "ph-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "ph-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "ph-bath", caption: "Bathroom" },
        { k: "exterior", v: "penthouse", out: "", t: "morning", seed: "ph-2", caption: "Morning from the terrace" }
    ], rooms: [
        { name: "Living and Kitchen", area: 665, width: 28.54, length: 23.29, ceiling: 10.17, planX: 0, planY: 15.09, ori: "SW", floor: "Penthouse", windows: "3 sliding walls to the terrace", flooring: "Oak plank", roomText: "One room for cooking, eating and sitting. Three sliding walls pocket into the structure, so the whole south side opens.", scene: "living", sceneOut: "city", sceneT: "", seed: "ph-r1" },
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
        { k: "interior", v: "attic", out: "city", t: "", seed: "byt-liv", caption: "Living space under the trusses" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "byt-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "byt-bed", caption: "Bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "byt-bath", caption: "Bathroom" },
        { k: "exterior", v: "block", out: "", t: "dusk", seed: "byt-2", caption: "Evening over the rooftops" }
    ], rooms: [
        { name: "Living and Kitchen", area: 592, width: 28.2, length: 21, ceiling: 11.15, ori: "SE", floor: "4th Floor", windows: "4 steel windows", flooring: "Oak plank", roomText: "One open volume under the trusses with a door to the terrace. The morning sun crosses the whole room.", scene: "attic", sceneOut: "city", sceneT: "", seed: "b-r1" },
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
        { k: "exterior", v: "house", out: "", t: "evening", seed: "dum-2", caption: "Late afternoon" },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "dum-bath", caption: "Bathroom" }
    ], rooms: [
        { name: "Living Room", area: 338, width: 20.3, length: 16.6, ceiling: 8.5, ori: "S", floor: "1st Floor", windows: "2 windows and a patio door", flooring: "Oak", roomText: "A generous living room with a fireplace and a door to the south patio.", scene: "living", sceneOut: "garden", sceneT: "", seed: "d-r1", roomPhoto: PHOTO_VILLALIV },
        { name: "Kitchen and Dining", area: 213, width: 14.8, length: 14.4, ceiling: 8.5, ori: "E", floor: "1st Floor", windows: "2 windows", flooring: "Tile", roomText: "Room for a full-size table, with morning light from the east.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "d-r2" },
        { name: "Primary Bedroom", area: 189, width: 14.4, length: 13.1, ceiling: 8.4, ori: "SW", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "Afternoon sun and a built-in closet.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "d-r3" },
        { name: "Bedroom", area: 153, width: 11.6, length: 13.1, ceiling: 8.4, ori: "S", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A bright room looking over the garden.", scene: "kids", sceneOut: "garden", sceneT: "", seed: "d-r4" },
        { name: "Bedroom / Study", area: 138, width: 10.5, length: 13.1, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A smaller room with steady north light, used today as an office.", scene: "study", sceneOut: "forest", sceneT: "", seed: "d-r5" },
        { name: "Bathroom", area: 90, width: 9.2, length: 9.8, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Tile", roomText: "Tub and shower, remodelled in 2020.", scene: "bath", sceneOut: "garden", sceneT: "", seed: "d-r6" }
    ] },
    { title: "1923 Spanish Revival", location: "Hancock Park", locationNote: "Original 1923 house, restored 2017\u20132019", type: "House", mode: "sale", price: 4600000, priceNote: "", beds: 5, baths: 4, interior: 4180, lot: 9800, terrace: 0, floors: 3, footprintW: 52.5, footprintD: 39.8, yearBuilt: 1923, energyRating: 84, status: "Fully restored", statusTone: "slate", featured: true, scene: "historic", sceneTime: "morning", seed: "his-1", plan: "none", description: "A 1923 Spanish Revival on a tree-lined street, restored between 2017 and 2019 with a light hand. The barrel-vaulted entry, the oak stair and the panelled doors survived and were repaired rather than replaced.\n\nThree floors, usable as one large family house or split into two separate units \u2014 the utilities are already run for it.", features: "Original barrel vaults, Restored oak stair, Panelled doors, Tiled fireplace, 9,800 sq ft lot, Two-unit potential, New systems throughout, Attic ready to finish", nearby: "Larchmont Village \u2014 0.5 mi\nThird Street Elementary \u2014 0.7 mi\nShops on Larchmont \u2014 0.4 mi\nRestaurants and bars \u2014 0.4 mi\nWilshire Country Club \u2014 0.6 mi\nMetro bus, Wilshire \u2014 0.3 mi", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "his-liv", caption: "Front room" },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "his-kit", caption: "Kitchen" },
        { k: "interior", v: "stairs", out: "garden", t: "", seed: "his-sta", caption: "The original stair" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "his-bed", caption: "Bedroom" },
        { k: "exterior", v: "historic", out: "", t: "dusk", seed: "his-2", caption: "The house at dusk" }
    ], rooms: [
        { name: "Front Room", area: 497, width: 25.3, length: 19.7, ceiling: 11.8, ori: "SE", floor: "2nd Floor", windows: "4 casement windows", flooring: "Original oak", roomText: "A formal room with an eleven-foot ceiling, plaster cornice and a tiled fireplace.", scene: "living", sceneOut: "garden", sceneT: "", seed: "h-r1" },
        { name: "Kitchen and Dining", area: 306, width: 19, length: 16.1, ceiling: 11.8, ori: "SW", floor: "2nd Floor", windows: "3 casement windows", flooring: "Terracotta", roomText: "A kitchen built to fit the house, with a table for ten.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "h-r2" },
        { name: "Primary Bedroom", area: 267, width: 17.1, length: 15.6, ceiling: 11.2, ori: "SE", floor: "3rd Floor", windows: "2 casement windows", flooring: "Oak", roomText: "Looks over the courtyard and has its own bathroom.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "h-r3" },
        { name: "Library and Study", area: 211, width: 15.1, length: 14, ceiling: 11.2, ori: "N", floor: "3rd Floor", windows: "2 casement windows", flooring: "Oak", roomText: "Floor-to-ceiling shelves and quiet north light.", scene: "study", sceneOut: "garden", sceneT: "", seed: "h-r4" },
        { name: "Stair Hall", area: 349, width: 14.8, length: 23.6, ceiling: 11.8, ori: "W", floor: "1st Floor", windows: "leaded window", flooring: "Tiled treads", roomText: "The original oak stair with its restored rail and a leaded window at the landing.", scene: "stairs", sceneOut: "garden", sceneT: "", seed: "h-r5" },
        { name: "Vaulted Room", area: 243, width: 17.4, length: 14, ceiling: 12.8, ori: "E", floor: "1st Floor", windows: "2 windows", flooring: "Brick", roomText: "A ground-floor room under the original barrel vault, used as a studio. Its own door to the street.", scene: "hall", sceneOut: "garden", sceneT: "", seed: "h-r6" }
    ] },
    { title: "Hillside Building Lot", location: "Topanga", locationNote: "South-facing slope, canyon views", type: "Land", mode: "sale", price: 985000, priceNote: "", beds: 0, baths: 0, interior: 0, lot: 34500, terrace: 0, floors: 0, yearBuilt: 0, energyRating: 0, status: "Utilities at the line", statusTone: "green", featured: false, scene: "land", sceneTime: "morning", seed: "poz-1", plan: "none", description: "A 34,500 sq ft parcel on a south-facing slope above the canyon road, close to level at the building pad and falling away below. Canyon and ridge views, and only low-density building around it.\n\nPower, water and sewer are all at the property line, and a graded road runs to the pad. Zoning allows a single-family residence.", features: "Utilities at the line, South-facing slope, Graded access road, Zoned single-family, Canyon views, No neighbours above", nearby: "Topanga village \u2014 1.2 mi\nTopanga Elementary \u2014 1.8 mi\nMarket \u2014 1.3 mi\nCanyon restaurants \u2014 0.9 mi\nTopanga State Park \u2014 0.3 mi\nMetro bus, Topanga Cyn. \u2014 0.7 mi", gallery: [
        { k: "exterior", v: "land", out: "", t: "evening", seed: "poz-2", caption: "Late afternoon" },
        { k: "exterior", v: "land", out: "", t: "winter", seed: "poz-3", caption: "Winter access" },
        { k: "exterior", v: "land", out: "", t: "day", seed: "poz-4", caption: "The surroundings" }
    ], rooms: [] },
    { title: "Designer Apartment", location: "Silver Lake", locationNote: "Furnished, available now", type: "Apartment", mode: "rent", price: 4800, priceNote: "/ month plus utilities", beds: 2, baths: 1, interior: 940, lot: 0, terrace: 0, floors: 1, footprintW: 34.1, footprintD: 26.9, yearBuilt: 2016, energyRating: 47, status: "Available Oct 1", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kri-1", plan: "none", description: "A fully furnished apartment in a low-energy building, two years after an interior remodel. Most of the furniture was made to measure and stays with the lease.\n\nA parking space and a storage locker are included. Twelve-month lease with the option to renew; deposit equal to two months.", features: "Fully furnished, Parking space, Storage locker, 65 sq ft balcony, Dishwasher and laundry, Fiber internet, Pets considered", nearby: "Sunset Junction \u2014 0.4 mi \u2014 city\nIvanhoe Elementary \u2014 0.5 mi \u2014 school\nGrocery \u2014 0.3 mi \u2014 shop\nCaf\u00e9s and bistros \u2014 300 ft \u2014 cafe\nPolice station \u2014 0.9 mi \u2014 police\nGym \u2014 0.4 mi \u2014 gym\nSilver Lake Reservoir \u2014 0.6 mi \u2014 park\nMetro bus, Sunset \u2014 350 ft \u2014 bus", gallery: [
        { k: "interior", v: "living", out: "city", t: "", seed: "kri-liv", caption: "Living room" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "kri-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "kri-bed", caption: "Bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "kri-bath", caption: "Bathroom" }
    ], rooms: [
        { name: "Living and Kitchen", area: 321, width: 20.3, length: 15.75, ceiling: 8.86, ori: "SW", floor: "3rd Floor", windows: "2 windows and a balcony door", flooring: "Oak-look vinyl", roomText: "An open room with a custom kitchen run and a door to the balcony.", scene: "living", sceneOut: "city", sceneT: "", seed: "k-r1" },
        { name: "Bedroom", area: 177, width: 13.45, length: 13.1, ceiling: 8.86, ori: "SE", floor: "3rd Floor", windows: "1 window", flooring: "Oak-look vinyl", roomText: "A bedroom with a built-in closet and blackout shades.", scene: "bedroom", sceneOut: "city", sceneT: "", seed: "k-r2" },
        { name: "Second Bedroom", area: 129, width: 10.8, length: 11.9, ceiling: 8.86, ori: "SE", floor: "3rd Floor", windows: "1 window", flooring: "Oak-look vinyl", roomText: "A smaller room, currently set up as an office.", scene: "kids", sceneOut: "city", sceneT: "", seed: "k-r3" },
        { name: "Bathroom", area: 67, width: 7.2, length: 9.25, ceiling: 8.53, ori: "N", floor: "3rd Floor", windows: "no window, vented", flooring: "Tile", roomText: "Walk-in shower, washer and dryer, wall-hung toilet.", scene: "bath", sceneOut: "city", sceneT: "", seed: "k-r4" },
        { name: "Entry", area: 60, width: 9.2, length: 6.55, ceiling: 8.53, ori: "N", floor: "3rd Floor", windows: "no windows", flooring: "Tile", roomText: "An entry with a built-in coat closet.", scene: "hall", sceneOut: "city", sceneT: "", seed: "k-r5" },
        { name: "Balcony", area: 65, width: 9.85, length: 6.55, ceiling: 0, ori: "SW", floor: "3rd Floor", windows: "\u2014", flooring: "Tile", roomText: "Afternoon sun, room for two chairs and a table.", scene: "terrace", sceneOut: "", sceneT: "day", seed: "k-r6" }
    ] },
    { title: "Creative Office Suite", location: "Culver City", locationNote: "Second floor, private entrance", type: "Commercial", mode: "rent", price: 9400, priceNote: "/ month plus CAM", beds: 0, baths: 2, interior: 1780, lot: 0, terrace: 0, floors: 1, footprintW: 49.2, footprintD: 32.8, yearBuilt: 2008, energyRating: 62, status: "Available now", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kom-1", plan: "none", description: "A second-floor suite two blocks from the Expo line, refreshed in 2023. Five closable offices, a conference room, a kitchen and its own restrooms.\n\nTwo parking spaces in the courtyard, a staffed lobby and common-area cleaning are included. The floor can also be leased in halves.", features: "5 closable offices, Conference room, Zoned A/C, 2 parking spaces, Staffed lobby, 1 Gb/s fiber, Private kitchen, Divisible floor plate", nearby: "Downtown Culver City \u2014 0.3 mi\nWest LA College \u2014 1.4 mi\nPlatform and shops \u2014 0.4 mi\nLunch spots \u2014 100 ft\nBallona Creek path \u2014 0.7 mi\nMetro E Line \u2014 0.3 mi", gallery: [
        { k: "interior", v: "office", out: "city", t: "", seed: "kom-off", caption: "Open plan" },
        { k: "interior", v: "study", out: "city", t: "", seed: "kom-mtg", caption: "Conference room" },
        { k: "interior", v: "hall", out: "city", t: "", seed: "kom-hall", caption: "Entry corridor" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "kom-kit", caption: "Kitchen" }
    ], rooms: [
        { name: "Open Plan", area: 413, width: 26.25, length: 15.75, ceiling: 9.84, ori: "SE", floor: "2nd Floor", windows: "4 windows", flooring: "Contract carpet", roomText: "The main work floor for ten people, with acoustic ceilings and dimmable lighting.", scene: "office", sceneOut: "city", sceneT: "", seed: "o-r1" },
        { name: "Conference Room", area: 243, width: 17.4, length: 14, ceiling: 9.84, ori: "S", floor: "2nd Floor", windows: "2 windows", flooring: "Contract carpet", roomText: "Seats twelve, with a wall display and acoustic panels.", scene: "study", sceneOut: "city", sceneT: "", seed: "o-r2" },
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
            <input type="checkbox" id="chkLot" style="accent-color:#15161a;"> With a lot
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
    <span class="lightbox__counter" id="lbCaption" style="color:rgba(255,255,255,0.55)"></span>
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
                src: imgSrc(g.image) || uploads[i + 1] || "",
            }
        })
        const cover = {
            spec: { k: "exterior", v: it.scene || "villa", t: it.sceneTime || "dusk", seed },
            caption: it.title || "",
            src: uploads[0] || "",
        }

        /* Real photographs from the gallery stand in for any room that has none
           of its own, in the order they were added. The cover is the building,
           so it stays out of it, and a photograph a room already carries is
           never handed to a second room. */
        const roomSource = hasRoomRows ? rowsFor(roomRows, idx) : (it.rooms || [])
        const claimed: any = {}
        roomSource.forEach((r: any) => {
            const c = imgSrc(r.roomPhoto)
            if (c) claimed[c] = true
        })
        const spare = gallery
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
    glassStrength?: number
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
    const glass = gs.glassStrength === undefined ? 100 : gs.glassStrength
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
        "--nav-dark-fg": navSame ? ink : "#f4f2ec",
        "--nav-dark-link": navSame ? "var(--slate)" : "rgba(244,242,236,0.88)",
        "--nav-dark-link-hover": navSame ? ink : "#ffffff",
        "--nav-dark-sub": navSame ? "var(--muted)" : "rgba(244,242,236,0.70)",
        "--nav-dark-cta-bg": navSame ? btnFill : (darkSame ? btnFill : btnText),
        "--nav-dark-cta-fg": navSame ? btnText : (darkSame ? btnText : btnFill),
        "--night-rgb": rgbTriplet(night, DEFAULTS.night),
        "--glass": `rgba(${glassRgb},${(0.55 * glass / 100).toFixed(3)})`,
        "--glass-strong": `rgba(${glassRgb},${(0.72 * glass / 100).toFixed(3)})`,
        "--glass-quiet": `rgba(${glassRgb},${(0.38 * glass / 100).toFixed(3)})`,
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
