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
  --champagne-wash:rgba(176,141,87,0.10);

  /* Glass */
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
  --sh-glow:0 0 0 1px rgba(176,141,87,0.28), 0 30px 70px -34px rgba(21,22,26,0.5);

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
    radial-gradient(900px 620px at 88% -8%, rgba(201,169,122,0.16), transparent 62%),
    radial-gradient(760px 560px at 4% 12%, rgba(150,163,182,0.13), transparent 60%),
    radial-gradient(1100px 700px at 50% 108%, rgba(176,141,87,0.09), transparent 65%);
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
  --btn-bg:var(--ink); --btn-fg:var(--bone); --btn-bd:transparent;
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
.thr-root .btn--on-dark{--btn-bg:#f4f2ec; --btn-fg:var(--night);}
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
  background:rgba(255,255,255,0.34);
  border:1px solid rgba(255,255,255,0.42);
  -webkit-backdrop-filter:blur(18px) saturate(1.6);
  backdrop-filter:blur(18px) saturate(1.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 40px -26px rgba(21,22,26,0.5);
  transition:background var(--t) var(--ease), box-shadow var(--t) var(--ease),
             border-color var(--t) var(--ease), height var(--t) var(--ease);
}
.thr-root .site-header.is-scrolled .nav{
  background:rgba(255,255,255,0.72);
  border-color:rgba(255,255,255,0.8);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), 0 14px 46px -28px rgba(21,22,26,0.55);
}
.thr-root .site-header.on-dark .nav{
  background:rgba(18,20,24,0.50);
  border-color:rgba(255,255,255,0.18);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 44px -30px rgba(0,0,0,0.8);
  color:#f4f2ec;
}
.thr-root .site-header.on-dark .nav__link{color:rgba(244,242,236,0.88);}
.thr-root .site-header.on-dark .nav__link:hover, .thr-root .site-header.on-dark .nav__link.is-active{color:#fff;}
.thr-root .site-header.on-dark .nav__link::after{background:var(--champagne-soft);}
.thr-root .site-header.on-dark .brand__mark{background:#f4f2ec; color:var(--night);}
.thr-root .site-header.on-dark .btn--cta{background:#f4f2ec; color:var(--night);}
.thr-root .site-header.on-dark .burger span{background:#f4f2ec;}

.thr-root .brand{display:flex; align-items:center; gap:11px; flex:none;}
.thr-root .brand__mark{
  width:32px; height:32px; border-radius:9px; flex:none;
  background:var(--ink); color:var(--bone);
  display:grid; place-items:center;
  transition:transform var(--t) var(--ease), background var(--t) var(--ease), color var(--t) var(--ease);
}
.thr-root .brand:hover .brand__mark{transform:rotate(-6deg) scale(1.06);}
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
.thr-root .site-header.on-dark .brand__sub{color:rgba(244,242,236,0.70);}

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
.thr-root .tag--accent{background:rgba(176,141,87,0.86); border-color:rgba(255,255,255,0.30); color:#fff;}
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
  background-color:rgba(255,255,255,0.46);
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
  border-radius:999px; font-size:0.82rem; background:rgba(255,255,255,0.6);
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
    background-color:rgba(255,255,255,0.72);
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
  .thr-root .filters.is-stuck.is-open{background-color:rgba(255,255,255,0.66);}
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
  border:1px solid var(--line); background:rgba(255,255,255,0.5);
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
  border:1px solid var(--line); background:rgba(255,255,255,0.5);
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
  border:1px solid var(--line); background:rgba(255,255,255,0.5);
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
  border:1px solid var(--line); background:rgba(255,255,255,0.5);
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
    radial-gradient(700px 420px at 82% 6%, rgba(201,169,122,0.20), transparent 60%),
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
.thr-root .map-chip{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 13px; border-radius:999px; font-size:0.74rem;
  background:rgba(255,255,255,0.62);
  border:1px solid rgba(255,255,255,0.8);
  -webkit-backdrop-filter:blur(16px) saturate(1.5);
  backdrop-filter:blur(16px) saturate(1.5);
  box-shadow:var(--sh-1);
  transition:transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .map-chip:hover, .thr-root .map-chip.is-active{transform:translateY(-2px); background:rgba(255,255,255,0.9);}
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
  border-radius:var(--r-sm); background:rgba(255,255,255,0.5);
  border:1px solid var(--line); font-size:0.86rem;
  transition:border-color var(--t) var(--ease), transform var(--t) var(--ease), background var(--t) var(--ease);
}
.thr-root .feature:hover{border-color:rgba(176,141,87,0.5); transform:translateY(-2px); background:var(--paper);}
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
  border-color:rgba(201,169,122,0.62);
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
  background:rgba(255,255,255,0.62);
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
    radial-gradient(700px 420px at 30% 0%, rgba(201,169,122,0.14), transparent 62%);
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
.thr-root .plan__zoomer{transition:transform 320ms var(--ease);}
.thr-root .plan__zoomer.no-anim{transition:none;}
.thr-root .fp-outline{fill:rgba(255,255,255,0.42); stroke:var(--graphite); stroke-width:5; stroke-linejoin:round;}
.thr-root .fp-outline--terrace{fill:rgba(201,169,122,0.10); stroke:var(--champagne); stroke-width:2.5; stroke-dasharray:10 8;}
.thr-root .fp-room{cursor:pointer; outline:none;}
.thr-root .fp-room__shape{
  fill:rgba(255,255,255,0.30); stroke:var(--graphite); stroke-width:2.5; stroke-linejoin:round;
  transition:fill 300ms var(--ease), stroke 300ms var(--ease);
}
.thr-root .fp-room:hover .fp-room__shape, .thr-root .fp-room.is-active .fp-room__shape, .thr-root .fp-room:focus-visible .fp-room__shape{
  fill:rgba(176,141,87,0.24); stroke:var(--champagne);
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
.thr-root .levels{display:inline-flex; padding:4px; border-radius:999px; gap:2px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .levels__btn{padding:8px 15px; border-radius:999px; font-size:0.78rem; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .levels__btn.is-active{background:var(--ink); color:var(--bone);}
.thr-root .zoomer{display:inline-flex; gap:4px; padding:4px; border-radius:999px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); box-shadow:var(--sh-1);}
.thr-root .zoomer button{width:34px; height:34px; border-radius:999px; display:grid; place-items:center; color:var(--slate); transition:background var(--t) var(--ease), color var(--t) var(--ease);}
.thr-root .zoomer button:hover{background:rgba(21,22,26,0.06); color:var(--ink);}
.thr-root .zoomer svg{width:15px; height:15px;}
.thr-root .plan__hint{
  position:absolute; left:14px; bottom:14px; z-index:3;
  font-family:'IBM Plex Mono',monospace; font-size:0.6rem; letter-spacing:0.16em;
  text-transform:uppercase; color:var(--muted);
  padding:8px 13px; border-radius:999px;
  background:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.66);
  -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
}

/* Plan side panel */

.thr-root .plan__panel{
  border-radius:var(--r-lg); padding:24px; display:flex; flex-direction:column;
  min-height:100%;
}
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
.thr-root .rp__spec{background:rgba(255,255,255,0.62); padding:13px 14px;}
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
    src: im.src || Scenery(im.spec), spec: im.spec, caption: im.caption
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
  },
  penthouse: {
    unitsPerFoot: 15.24,
    levels: [
      { id: "l1", label: "Penthouse Level", viewBox: "0 0 830 920",
        outline: [rect(40, 40, 740, 625)],
        terrace: rect(40, 632, 740, 853),
        windows: [[90,625,220,625],[260,625,400,625],[520,625,660,625],[40,340,40,470],[740,450,740,570],[740,300,740,380],[90,40,210,40],[520,40,640,40],[740,110,740,200]],
        doors: [[475,500,"v"],[475,330,"v"],[350,150,"h"],[500,150,"h"],[240,150,"h"],[650,150,"h"]],
        entry: [40, 100, 40, 140]
      }
    ]
  }
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
  ],
  penthouse: [
    ["l1", rect(40, 270, 475, 625), null],
    ["l1", rect(475, 400, 740, 625), null],
    ["l1", rect(475, 270, 740, 400), null],
    ["l1", rect(40, 40, 240, 270), null],
    ["l1", rect(240, 40, 350, 270), null],
    ["l1", rect(350, 40, 500, 270), null],
    ["l1", rect(500, 40, 650, 270), null],
    ["l1", rect(650, 40, 740, 270), null],
    ["l1", rect(40, 632, 740, 853), null]
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
  home: "M4 11 12 4l8 7v9h-6v-5h-4v5H4z",
  city: "M3 21V9l6-4 6 4v12M9 21v-4h4v4M17 21V12h4v9",
  school: "M12 4 3 9l9 5 9-5-9-5ZM7 12v5c0 1 2.5 2.5 5 2.5S17 18 17 17v-5",
  shop: "M4 8h16l-1 12H5L4 8Zm4 0V6a4 4 0 0 1 8 0v2",
  food: "M7 3v8m0 0a3 3 0 0 0 3-3V3M7 11v10M17 3c-1.5 2-2 4-2 6s.5 3 2 3v9",
  nature: "M12 3 6 13h12L12 3Zm0 6-4 7h8l-4-7Zm0 7v5",
  transport: "M6 4h12v11H6zM6 15l-1 4M18 15l1 4M8 8h8"
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
function heroPicture(spec, alt) {
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
    const isTerrace = samePoly(r.polygon, level.terrace);
    /* narrow rooms get a smaller label; very narrow ones drop the name */
    const nameSize = bw < 150 ? 11.5 : bw < 210 ? 13 : 15;
    const showName = bw > 96 && bh > 62;
    const showOri = bw > 150 && bh > 110;
    s += '<g class="fp-room" data-room="' + r.id + '" tabindex="0" role="button" ' +
         'aria-label="' + esc(r.name + ", " + sqft(r.area) + ", facing " + r.orientation.label) + '">' +
      '<polygon class="fp-room__shape" points="' + pts(r.polygon) + '"' + (isTerrace ? ' style="fill:rgba(201,169,122,0.14);stroke-dasharray:10 8"' : "") + '/>' +
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
  const sb = property.floorPlan.unitsPerFoot * 20, by = vb[3] - 24;   /* a 20 ft bar */
  s += '<g class="fp-north"><line x1="40" y1="' + by + '" x2="' + (40 + sb) + '" y2="' + by + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<line x1="40" y1="' + (by - 5) + '" x2="40" y2="' + (by + 5) + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<line x1="' + (40 + sb) + '" y1="' + (by - 5) + '" x2="' + (40 + sb) + '" y2="' + (by + 5) + '" stroke="rgba(21,22,26,0.35)" stroke-width="2"/>' +
    '<text x="' + (40 + sb + 12) + '" y="' + (by + 4) + '" font-family="IBM Plex Mono, monospace" font-size="12" fill="rgba(21,22,26,0.45)">20 ft</text></g>';

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
    s += '<g class="map-pin" data-poi="' + m.id + '" tabindex="0" role="button" aria-label="' + esc(m.n + (m.d ? ", " + m.d : "")) + '">' +
      '<circle class="hit" cx="' + x + '" cy="' + y + '" r="34"/>' +
      '<circle class="map-pin__ring" cx="' + x + '" cy="' + y + '" r="' + (home ? 34 : 28) + '" fill="rgba(176,141,87,0.16)" stroke="rgba(176,141,87,0.5)"/>' +
      '<circle class="map-pin__dot" cx="' + x + '" cy="' + y + '" r="' + (home ? 22 : 17) + '" fill="' + (home ? "#15161a" : "rgba(255,255,255,0.86)") + '" stroke="' + (home ? "#b08d57" : "rgba(21,22,26,0.14)") + '" stroke-width="' + (home ? 2.5 : 1.4) + '"/>' +
      '<path d="' + POI_ICON[m.kind] + '" transform="translate(' + (x - (home ? 12 : 9)) + ',' + (y - (home ? 12 : 9)) + ') scale(' + (home ? 1 : 0.76) + ')" fill="none" stroke="' + (home ? "#f6f5f2" : "#5d6068") + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</g>';
  });
  return s + '</svg>';
}

/* ---------- Property detail view --------------------------------- */
function renderDetail(p) {
  const hasPlan = !!p.floorPlan;
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

  const related = PROPERTIES.filter(x => x.id !== p.id).slice(0, 3);

  let html = "";

  /* hero */
  html += '<section class="detail-hero">' +
    '<div class="detail-hero__media" id="detailHeroMedia">' + heroPicture(p.images[0].spec, p.title + " — " + p.location) + '</div>' +
    '<div class="detail-hero__scrim"></div>' +
    '<a class="back-btn" href="#/" data-route="/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg> Back to listings</a>' +
    '<div class="detail-hero__inner">' +
      '<div>' +
        '<div class="detail-hero__tags">' +
          '<span class="tag"><span class="tag__dot' + toneClass(p.statusTone) + '"></span>' + esc(p.status) + '</span>' +
          '<span class="tag tag--solid">' + esc(p.type) + '</span>' +
          '<span class="tag tag--solid">' + (p.mode === "sale" ? "For sale" : "For rent") + '</span>' +
          (hasPlan ? '<span class="tag tag--accent">Interactive floor plan</span>' : "") +
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
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">Gallery</span><h2>Take a look inside.</h2></div>' +
    '<span class="mono" style="font-size:0.72rem;color:var(--muted);letter-spacing:0.14em">' + pad2(p.images.length) + ' PHOTOGRAPHS</span></div>' +
    '<div class="gallery reveal" id="gallery">' +
      p.images.map((im, i) => '<button class="gal" data-gal="' + i + '" aria-label="Open photograph: ' + esc(im.caption) + '">' +
        '<img src="' + im.src + '" alt="' + esc(im.caption) + '" loading="lazy" decoding="async">' +
        '<span class="gal__cap">' + esc(im.caption) + '</span></button>').join("") +
    '</div></div></section>';

  /* rooms */
  if (p.rooms.length) {
    html += '<section class="section" id="rooms"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text">' +
        '<span class="eyebrow">Explore the ' + (p.type === "Apartment" ? "apartment" : p.type === "Commercial" ? "suite" : "house") + '</span>' +
        '<h2>Every room,<br>down to the inch.</h2>' +
        '<p class="lede">Hover a room and its exact area, dimensions, compass orientation, ceiling height and flooring appear. Click to open the full detail.</p>' +
      '</div></div>' +
      '<div class="rooms-grid reveal" id="roomsGrid">' + p.rooms.map(roomCardHTML).join("") + '</div>' +
    '</div></section>';
  }

  /* floor plan */
  if (hasPlan) {
    const levels = p.floorPlan.levels;
    html += '<section class="section section--tight" id="floorplan"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">Floor plan</span>' +
      '<h2>The whole layout,<br>wired to every room.</h2></div>' +
      '<span class="mono" style="font-size:0.72rem;color:var(--muted);letter-spacing:0.14em">DRAWN TO SCALE</span></div>' +
      '<div class="plan reveal">' +
        '<div class="plan__stage" id="planStage">' +
          '<span class="plan__grid" aria-hidden="true"></span>' +
          '<div class="plan__bar">' +
            (levels.length > 1 ? '<div class="levels" id="planLevels" role="tablist" aria-label="Floors">' +
              levels.map((l, i) => '<button class="levels__btn' + (i === 0 ? " is-active" : "") + '" role="tab" aria-selected="' + (i === 0) + '" data-level="' + l.id + '">' + esc(l.label) + '</button>').join("") +
            '</div>' : '<span class="plan__hint" style="position:static">' + esc(levels[0].label) + '</span>') +
            '<div class="zoomer">' +
              '<button data-zoom="out" aria-label="Zoom out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 12h14"/></svg></button>' +
              '<button data-zoom="reset" aria-label="Reset zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 20v-5h5"/></svg></button>' +
              '<button data-zoom="in" aria-label="Zoom in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
            '</div>' +
          '</div>' +
          '<div id="planHost" style="position:absolute;inset:0"></div>' +
          '<span class="plan__hint">' + (canHover ? "Hover a room · drag to pan · scroll to zoom" : "Tap a room") + '</span>' +
        '</div>' +
        '<div class="plan__panel glass" id="planPanel"></div>' +
      '</div>' +
    '</div></section>';
  }

  /* features */
  if (p.features.length) {
    html += '<section class="section section--tight"><div class="wrap">' +
      '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">Features</span><h2>What comes with it.</h2></div></div>' +
      '<div class="features reveal">' + p.features.map(f => '<span class="feature">' + ICON.check + esc(f) + '</span>').join("") + '</div>' +
    '</div></section>';
  }

  /* location */
  html += '<section class="section" id="location"><div class="wrap">' +
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">Location</span>' +
    '<h2>Where you would live.</h2><p class="lede">' + esc(p.locationNote) + '</p></div></div>' +
    '<div class="map-wrap reveal" id="mapWrap">' + mapSVG(p) +
      '<div class="map-card glass"><span class="mono">Neighborhood</span><b>' + esc(p.location) + '</b><span>' + esc(p.locationNote) + '</span></div>' +
      '<div class="map-legend">' + p.poi.filter(m => m.kind !== "home").map(m =>
        '<button class="map-chip" data-poi-chip="' + m.id + '"><span class="map-chip__dot"></span>' + esc(m.n) + ' <span class="mono">' + esc(m.d) + '</span></button>').join("") +
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
    '<div class="sec-head reveal"><div class="sec-head__text"><span class="eyebrow">Similar properties</span><h2>You might also like.</h2></div>' +
    '<a class="btn btn--line magnetic" href="#/" data-route="/">All listings</a></div>' +
    '<div class="related">' + related.map(propertyCard).join("") + '</div>' +
  '</div></section>';

  return html;
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

const DEFAULT_AGENT = { name: "Adam Marsh", role: "Real Estate Agent \u00b7 Los Angeles", license: "DRE #02145879", phone: "+1 (310) 555-0148", email: "adam@thresholdrealty.com", sold: 214, years: 12, rating: 4.9 }

const DEFAULT_LISTINGS: any[] = [
    { title: "Modern Villa", location: "Pacific Palisades", locationNote: "Quiet canyon street, 600 ft from the trailhead", type: "Villa", mode: "sale", price: 3950000, priceNote: "", beds: 3, baths: 2, interior: 2002, lot: 13347, terrace: 0, floors: 2, yearBuilt: 2021, energyRating: 38, status: "New to market", statusTone: "green", featured: true, scene: "villa", sceneTime: "dusk", seed: "villa-1", plan: "villa", description: "Built in 2021 on a lot that falls away to the southwest \u2014 and the whole house answers that view. The living space opens to the garden through three full-height sliders, the kitchen keeps its own south light, and the upper floor steps back so a covered roof terrace sits above the living room.\n\nConstruction is steel and stone with triple glazing, balanced ventilation with heat recovery, and a ground-source heat pump. Radiant floors run through every room, cooling covers the upper floor, and the envelope is insulated well past code \u2014 the house runs on about $780 a year.\n\nThe 13,347 sq ft lot is fenced and planted, with mature pines along the north edge. The approach is from the east and covered parking for two cars is part of the structure.", features: "Ground-source heat pump, Heat-recovery ventilation, Triple glazing, Radiant floors, Upper-floor cooling, Fireplace, 284 sq ft roof terrace, 2-car covered parking, 7.2 kW solar array, Drip irrigation, Automatic gate, Fiber internet", nearby: "Palisades Village \u2014 1.4 mi\nMarquez Charter Elem. \u2014 0.4 mi\nGrocery and pharmacy \u2014 1.1 mi\nRestaurants on Sunset \u2014 0.7 mi\nTemescal Canyon trails \u2014 600 ft\nMetro bus, PCH \u2014 0.3 mi", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "villa-liv", caption: "Living room" },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "villa-kit", caption: "Kitchen and dining" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "villa-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "villa-bath", caption: "Bathroom" },
        { k: "exterior", v: "villa", out: "", t: "morning", seed: "villa-2", caption: "Garden and pool in the morning" },
        { k: "interior", v: "study", out: "forest", t: "", seed: "villa-stu", caption: "Study" },
        { k: "exterior", v: "villa", out: "", t: "winter", seed: "villa-3", caption: "The house in January" }
    ], rooms: [
        { name: "Entry Hall", area: 133, width: 14.04, length: 9.51, ceiling: 9.35, ori: "E", floor: "1st Floor", windows: "1 narrow window beside the door", flooring: "Large-format porcelain", roomText: "A full-length closet wall and a bench under the window. Morning light comes straight in from the east.", scene: "hall", sceneOut: "garden", sceneT: "", seed: "v-hala" },
        { name: "Living Room", area: 461, width: 23.36, length: 19.75, ceiling: 9.35, ori: "SW", floor: "1st Floor", windows: "3 full-height sliders", flooring: "White oak", roomText: "The main room of the house. Afternoon and evening light, direct access to the terrace and garden, fireplace on the north wall.", scene: "living", sceneOut: "garden", sceneT: "", seed: "v-obyv" },
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
    { title: "Penthouse with Terrace", location: "West Hollywood", locationNote: "Top floor, city and hills on three sides", type: "Apartment", mode: "sale", price: 4750000, priceNote: "", beds: 2, baths: 2, interior: 1765, lot: 0, terrace: 667, floors: 1, yearBuilt: 2019, energyRating: 44, status: "By appointment", statusTone: "amber", featured: true, scene: "penthouse", sceneTime: "dusk", seed: "ph-1", plan: "penthouse", description: "The entire top floor of a small building above Santa Monica Boulevard. A 667 sq ft terrace wraps the south side, looking over the city to the hills \u2014 and since the building is the tallest on its block, nothing looks back.\n\nThe interior was drawn by a studio that added exactly one material: oak. Custom kitchen with a single slab counter, built-in closets in every room, zoned air conditioning, motorized shades and a wired smart panel. Two parking spaces and a storage room come with it.", features: "667 sq ft terrace, City and hill views, Zoned A/C, Smart wiring, Custom kitchen, Motorized shades, 2 parking spaces, 86 sq ft storage, Private elevator entry, Stone bathroom", nearby: "Sunset Strip \u2014 0.5 mi\nWest Hollywood Elem. \u2014 0.6 mi\nShops and caf\u00e9s \u2014 350 ft\nRestaurants \u2014 400 ft\nRunyon Canyon \u2014 1.3 mi\nMetro line, Santa Monica Bl. \u2014 0.2 mi", gallery: [
        { k: "interior", v: "living", out: "city", t: "", seed: "ph-liv", caption: "Living space" },
        { k: "interior", v: "kitchen", out: "city", t: "", seed: "ph-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "city", t: "", seed: "ph-bed", caption: "Primary bedroom" },
        { k: "interior", v: "bath", out: "city", t: "", seed: "ph-bath", caption: "Bathroom" },
        { k: "exterior", v: "penthouse", out: "", t: "morning", seed: "ph-2", caption: "Morning from the terrace" }
    ], rooms: [
        { name: "Living and Kitchen", area: 665, width: 28.54, length: 23.29, ceiling: 10.17, ori: "SW", floor: "Penthouse", windows: "3 sliding walls to the terrace", flooring: "Oak plank", roomText: "One room for cooking, eating and sitting. Three sliding walls pocket into the structure, so the whole south side opens.", scene: "living", sceneOut: "city", sceneT: "", seed: "ph-r1" },
        { name: "Primary Bedroom", area: 257, width: 17.39, length: 14.76, ceiling: 10.17, ori: "SE", floor: "Penthouse", windows: "2 picture windows", flooring: "Oak plank", roomText: "Opens onto the terrace and catches the morning sun. Built-in closets run the length of the wall.", scene: "bedroom", sceneOut: "city", sceneT: "", seed: "ph-r2" },
        { name: "Primary Bathroom", area: 149, width: 17.39, length: 8.53, ceiling: 9.84, ori: "E", floor: "Penthouse", windows: "1 window", flooring: "Stone", roomText: "Tub and walk-in shower, a double vanity cut from one slab, radiant floor.", scene: "bath", sceneOut: "city", sceneT: "", seed: "ph-r3" },
        { name: "Second Bedroom", area: 198, width: 13.12, length: 15.09, ceiling: 10.17, ori: "NW", floor: "Penthouse", windows: "1 picture window", flooring: "Oak plank", roomText: "A second bedroom with steady northwest light, equally good as a guest room.", scene: "attic", sceneOut: "city", sceneT: "", seed: "ph-r4" },
        { name: "Walk-in Closet", area: 109, width: 7.22, length: 15.09, ceiling: 9.84, ori: "N", floor: "Penthouse", windows: "no windows", flooring: "Oak plank", roomText: "A walk-through closet built to measure, with a mirrored wall and an island.", scene: "hall", sceneOut: "city", sceneT: "", seed: "ph-r5" },
        { name: "Entry Hall", area: 149, width: 9.84, length: 15.09, ceiling: 9.84, ori: "N", floor: "Penthouse", windows: "no windows", flooring: "Stone", roomText: "You arrive straight from an elevator that serves this floor only. Built-in storage walls.", scene: "hall", sceneOut: "city", sceneT: "", seed: "ph-r6" },
        { name: "Study", area: 149, width: 9.84, length: 15.09, ceiling: 10.17, ori: "NE", floor: "Penthouse", windows: "1 window", flooring: "Oak plank", roomText: "A study that closes off, with north light that holds steady through the day.", scene: "study", sceneOut: "city", sceneT: "", seed: "ph-r7" },
        { name: "Second Bath", area: 89, width: 5.91, length: 15.09, ceiling: 9.84, ori: "E", floor: "Penthouse", windows: "1 window", flooring: "Stone", roomText: "A second bathroom with a shower and a separate powder room for guests.", scene: "bath", sceneOut: "city", sceneT: "", seed: "ph-r8" },
        { name: "Terrace", area: 667, width: 45.93, length: 14.53, ceiling: 0, ori: "S", floor: "Penthouse", windows: "\u2014", flooring: "Thermally modified wood", roomText: "A terrace along the whole south side. Pergola over the dining end, irrigated planters, low evening lighting.", scene: "terrace", sceneOut: "", sceneT: "dusk", seed: "ph-r9" }
    ] },
    { title: "Warehouse Loft", location: "Arts District", locationNote: "1927 brick warehouse, converted in 2020", type: "Apartment", mode: "sale", price: 1395000, priceNote: "", beds: 2, baths: 2, interior: 1480, lot: 0, terrace: 194, floors: 1, yearBuilt: 1927, energyRating: 58, status: "In escrow \u2014 backups welcome", statusTone: "amber", featured: true, scene: "block", sceneTime: "morning", seed: "byt-1", plan: "none", description: "The top floor of a brick warehouse two blocks off Traction Avenue, converted in 2020. The timber trusses stayed exposed, new insulation went in between them, and the steel windows face southeast over the rail yard.\n\nFully rewired and replumbed during the conversion, with a new elevator and a seismically retrofitted shell. A storage cage comes with the unit, and a parking space in the courtyard is available to buy.", features: "Exposed timber trusses, 194 sq ft terrace, New elevator, Storage cage, Steel factory windows, Custom kitchen, Courtyard parking, Low HOA dues", nearby: "Downtown core \u2014 1.2 mi\nNinth Street Elementary \u2014 0.8 mi\nGrocery and market \u2014 0.4 mi\nCoffee and restaurants \u2014 150 ft\nLA River path \u2014 0.6 mi\nMetro A Line \u2014 0.5 mi", gallery: [
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
    { title: "Family Home with Garden", location: "Sherman Oaks", locationNote: "Quiet street, garden facing south", type: "House", mode: "sale", price: 2150000, priceNote: "", beds: 4, baths: 3, interior: 2530, lot: 7320, terrace: 0, floors: 2, yearBuilt: 1998, energyRating: 71, status: "Move-in ready", statusTone: "green", featured: true, scene: "house", sceneTime: "morning", seed: "dum-1", plan: "none", description: "A solid late-nineties house south of Ventura, kept up year on year and re-insulated in 2018. The layout is the familiar one and it works: living space downstairs, three rooms and a study upstairs.\n\nThe 7,320 sq ft lot is flat, fenced and planted with citrus. A detached garage and a workshop come with it.", features: "Re-insulated 2018, New roof 2019, Central heat and air, Fireplace with insert, Detached garage, Workshop, Drip irrigation, Citrus trees", nearby: "Ventura Boulevard \u2014 0.6 mi\nRiverside Drive Charter \u2014 0.4 mi\nSupermarket \u2014 0.5 mi\nRestaurants \u2014 0.6 mi\nSepulveda Basin \u2014 1.9 mi\nMetro bus, US-101 \u2014 0.8 mi", gallery: [
        { k: "interior", v: "living", out: "garden", t: "", seed: "dum-liv", caption: "Living room" },
        { k: "interior", v: "kitchen", out: "garden", t: "", seed: "dum-kit", caption: "Kitchen" },
        { k: "interior", v: "bedroom", out: "garden", t: "", seed: "dum-bed", caption: "Primary bedroom" },
        { k: "exterior", v: "house", out: "", t: "evening", seed: "dum-2", caption: "Late afternoon" },
        { k: "interior", v: "bath", out: "garden", t: "", seed: "dum-bath", caption: "Bathroom" }
    ], rooms: [
        { name: "Living Room", area: 338, width: 20.3, length: 16.6, ceiling: 8.5, ori: "S", floor: "1st Floor", windows: "2 windows and a patio door", flooring: "Oak", roomText: "A generous living room with a fireplace and a door to the south patio.", scene: "living", sceneOut: "garden", sceneT: "", seed: "d-r1" },
        { name: "Kitchen and Dining", area: 213, width: 14.8, length: 14.4, ceiling: 8.5, ori: "E", floor: "1st Floor", windows: "2 windows", flooring: "Tile", roomText: "Room for a full-size table, with morning light from the east.", scene: "kitchen", sceneOut: "garden", sceneT: "", seed: "d-r2" },
        { name: "Primary Bedroom", area: 189, width: 14.4, length: 13.1, ceiling: 8.4, ori: "SW", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "Afternoon sun and a built-in closet.", scene: "bedroom", sceneOut: "garden", sceneT: "", seed: "d-r3" },
        { name: "Bedroom", area: 153, width: 11.6, length: 13.1, ceiling: 8.4, ori: "S", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A bright room looking over the garden.", scene: "kids", sceneOut: "garden", sceneT: "", seed: "d-r4" },
        { name: "Bedroom / Study", area: 138, width: 10.5, length: 13.1, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Oak", roomText: "A smaller room with steady north light, used today as an office.", scene: "study", sceneOut: "forest", sceneT: "", seed: "d-r5" },
        { name: "Bathroom", area: 90, width: 9.2, length: 9.8, ceiling: 8.4, ori: "N", floor: "2nd Floor", windows: "1 window", flooring: "Tile", roomText: "Tub and shower, remodelled in 2020.", scene: "bath", sceneOut: "garden", sceneT: "", seed: "d-r6" }
    ] },
    { title: "1923 Spanish Revival", location: "Hancock Park", locationNote: "Original 1923 house, restored 2017\u20132019", type: "House", mode: "sale", price: 4600000, priceNote: "", beds: 5, baths: 4, interior: 4180, lot: 9800, terrace: 0, floors: 3, yearBuilt: 1923, energyRating: 84, status: "Fully restored", statusTone: "slate", featured: true, scene: "historic", sceneTime: "morning", seed: "his-1", plan: "none", description: "A 1923 Spanish Revival on a tree-lined street, restored between 2017 and 2019 with a light hand. The barrel-vaulted entry, the oak stair and the panelled doors survived and were repaired rather than replaced.\n\nThree floors, usable as one large family house or split into two separate units \u2014 the utilities are already run for it.", features: "Original barrel vaults, Restored oak stair, Panelled doors, Tiled fireplace, 9,800 sq ft lot, Two-unit potential, New systems throughout, Attic ready to finish", nearby: "Larchmont Village \u2014 0.5 mi\nThird Street Elementary \u2014 0.7 mi\nShops on Larchmont \u2014 0.4 mi\nRestaurants and bars \u2014 0.4 mi\nWilshire Country Club \u2014 0.6 mi\nMetro bus, Wilshire \u2014 0.3 mi", gallery: [
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
    { title: "Designer Apartment", location: "Silver Lake", locationNote: "Furnished, available now", type: "Apartment", mode: "rent", price: 4800, priceNote: "/ month plus utilities", beds: 2, baths: 1, interior: 940, lot: 0, terrace: 0, floors: 1, yearBuilt: 2016, energyRating: 47, status: "Available Oct 1", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kri-1", plan: "none", description: "A fully furnished apartment in a low-energy building, two years after an interior remodel. Most of the furniture was made to measure and stays with the lease.\n\nA parking space and a storage locker are included. Twelve-month lease with the option to renew; deposit equal to two months.", features: "Fully furnished, Parking space, Storage locker, 65 sq ft balcony, Dishwasher and laundry, Fiber internet, Pets considered", nearby: "Sunset Junction \u2014 0.4 mi\nIvanhoe Elementary \u2014 0.5 mi\nGrocery \u2014 0.3 mi\nCaf\u00e9s and bistros \u2014 300 ft\nSilver Lake Reservoir \u2014 0.6 mi\nMetro bus, Sunset \u2014 350 ft", gallery: [
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
    { title: "Creative Office Suite", location: "Culver City", locationNote: "Second floor, private entrance", type: "Commercial", mode: "rent", price: 9400, priceNote: "/ month plus CAM", beds: 0, baths: 2, interior: 1780, lot: 0, terrace: 0, floors: 1, yearBuilt: 2008, energyRating: 62, status: "Available now", statusTone: "green", featured: false, scene: "block", sceneTime: "day", seed: "kom-1", plan: "none", description: "A second-floor suite two blocks from the Expo line, refreshed in 2023. Five closable offices, a conference room, a kitchen and its own restrooms.\n\nTwo parking spaces in the courtyard, a staffed lobby and common-area cleaning are included. The floor can also be leased in halves.", features: "5 closable offices, Conference room, Zoned A/C, 2 parking spaces, Staffed lobby, 1 Gb/s fiber, Private kitchen, Divisible floor plate", nearby: "Downtown Culver City \u2014 0.3 mi\nWest LA College \u2014 1.4 mi\nPlatform and shops \u2014 0.4 mi\nLunch spots \u2014 100 ft\nBallona Creek path \u2014 0.7 mi\nMetro E Line \u2014 0.3 mi", gallery: [
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

function headerHTML(M: any) { return `<header class="site-header" id="header">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="#/" data-route="/">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.2 12 5l8 7.2"/><path d="M6.6 11.4V19h10.8v-7.6"/><path d="M10.2 19v-4.2h3.6V19"/></svg>
      </span>
      <span>
        <span class="brand__name">${e(M.brandName)}</span>
        <span class="brand__sub">${e(M.brandSub)}</span>
      </span>
    </a>

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
        <a class="brand" href="#/" data-route="/">
          <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.2 12 5l8 7.2"/><path d="M6.6 11.4V19h10.8v-7.6"/><path d="M10.2 19v-4.2h3.6V19"/></svg>
          </span>
          <span><span class="brand__name">${e(M.brandName)}</span><span class="brand__sub">${e(M.brandSub)}</span></span>
        </a>
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
const PIN_LAYOUT = [
    { id: "centre", kind: "city", x: 24, y: 22 },
    { id: "school", kind: "school", x: 66, y: 34 },
    { id: "shop", kind: "shop", x: 30, y: 68 },
    { id: "food", kind: "food", x: 71, y: 66 },
    { id: "nature", kind: "nature", x: 82, y: 18 },
    { id: "trans", kind: "transport", x: 42, y: 78 },
]

function buildProperties(items: any[]): any[] {
    return (items && items.length ? items : DEFAULT_LISTINGS).map((it: any, idx: number) => {
        const slots = PLAN_SLOTS[it.plan] || null
        const seed = it.seed || "listing-" + idx
        const uploads = [it.photo, it.photo2, it.photo3, it.photo4, it.photo5]
            .map(imgSrc)
            .filter(Boolean)

        const gallery = (it.gallery && it.gallery.length ? it.gallery : []).map((g: any, i: number) => ({
            spec: { k: g.k || "interior", v: g.v, out: g.out || "garden", t: g.t || undefined, seed: g.seed || seed + "-g" + i },
            caption: g.caption || "",
            src: uploads[i + 1] || "",
        }))
        const cover = {
            spec: { k: "exterior", v: it.scene || "villa", t: it.sceneTime || "dusk", seed },
            caption: it.title || "",
            src: uploads[0] || "",
        }

        const rooms = (it.rooms || []).map((r: any, i: number) => {
            const slot = slots && slots[i]
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
                image: imgSrc(r.roomPhoto),
                img: OUTDOOR_ROOM_SCENES.indexOf(r.scene) >= 0
                    ? { k: "exterior", v: "penthouse", t: r.sceneT || "evening", seed: r.seed || "p" + idx + "r" + i }
                    : { k: "interior", v: r.scene || "living", out: r.sceneOut || "garden", t: r.sceneT || undefined, seed: r.seed || "p" + idx + "r" + i },
                level: slot ? slot[0] : "l1",
                polygon: slot ? slot[1] : null,
                labelAt: slot ? slot[2] : null,
            }
        })

        const poi: any[] = [{ id: "home", n: it.title || "This property", d: "", x: 50, y: 50, kind: "home" }]
        String(it.nearby || "")
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean)
            .slice(0, PIN_LAYOUT.length)
            .forEach((line, i) => {
                const parts = line.split("—")
                poi.push({
                    id: PIN_LAYOUT[i].id,
                    n: (parts[0] || line).trim(),
                    d: (parts[1] || "").trim(),
                    x: PIN_LAYOUT[i].x,
                    y: PIN_LAYOUT[i].y,
                    kind: PIN_LAYOUT[i].kind,
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
            floorPlan: FLOOR_PLANS[it.plan] || null,
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

    /* floor plan */
    if (p.floorPlan) {
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
      const panel = $("#planPanel", view);
      panel.addEventListener("click", function (e) {
        const b = e.target.closest("[data-open-room]"); if (b) openRoom(b.dataset.openRoom);
      });
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
    darkSurface?: string
    glassStrength?: number
    radius?: number
}
interface HeroGroup {
    showHero?: boolean
    photo?: any
    photoMobile?: any
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
}

/* "#b08d57" -> "176,141,87", so one accent can feed rgba() everywhere */
function rgbTriplet(hex: string, fallback: string): string {
    const h = String(hex || "").trim()
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h)
    if (!m) return rgbTriplet(fallback, "176,141,87")
    let v = m[1]
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
    const n = parseInt(v, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",")
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
    const accent = reset ? DEFAULTS.accent : gs.accent || DEFAULTS.accent
    const bg = reset ? DEFAULTS.bg : gs.background || DEFAULTS.bg
    const ink = reset ? DEFAULTS.ink : gs.ink || DEFAULTS.ink
    const night = reset ? DEFAULTS.night : gs.darkSurface || DEFAULTS.night
    const glass = gs.glassStrength === undefined ? 100 : gs.glassStrength
    const radius = gs.radius === undefined ? 30 : gs.radius

    const rootVars = {
        "--champagne": accent,
        "--champagne-soft": `rgba(${rgbTriplet(accent, DEFAULTS.accent)},0.72)`,
        "--champagne-wash": `rgba(${rgbTriplet(accent, DEFAULTS.accent)},0.10)`,
        "--bone": bg,
        "--ink": ink,
        "--night": night,
        "--glass": `rgba(255,255,255,${(0.55 * glass / 100).toFixed(3)})`,
        "--glass-strong": `rgba(255,255,255,${(0.72 * glass / 100).toFixed(3)})`,
        "--glass-quiet": `rgba(255,255,255,${(0.38 * glass / 100).toFixed(3)})`,
        "--r-lg": radius + "px",
        "--r-xl": Math.round(radius * 1.33) + "px",
        width: "100%",
        ...props.style,
    } as React.CSSProperties

    /* Panel values become the same model the HTML build feeds its builders. */
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
            properties: buildProperties(listings.items as any[]),
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
    }, [props])

    /* Build the page, drop it in, wire it up. Rebuilt whenever the panel
       changes, which is exactly what makes the canvas feel live. */
    React.useEffect(() => {
        const host = hostRef.current
        if (!host) return
        PROPERTIES = model.properties
        AGENT = model.agent
        TESTIMONIALS = model.reviewItems
        SHOW = model.show
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
            heroMedia.innerHTML =
                "<picture>" +
                '<source media="(max-width:720px)" srcset="' + esc(model.hero.tall) + '">' +
                '<img src="' + esc(model.hero.wide) + '" alt="' + esc(model.hero.eyebrow) + '">' +
                "</picture>"
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
// A terrace is not a room with a ceiling, so its stand-in is drawn as an
// outdoor scene rather than an interior — see buildProperties.
const OUTDOOR_ROOM_SCENES = ["terrace", "penthouse", "balcony"]

addPropertyControls(ThresholdSite, {
    navbar: {
        type: ControlType.Object,
        title: "① Navbar",
        controls: {
            showNavbar: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
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
                            type: ControlType.String, title: "Features", displayTextArea: true,
                            defaultValue: "Heat pump, Triple glazing, Radiant floors",
                            description: "Comma separated.",
                        },
                        nearby: {
                            type: ControlType.String, title: "Nearby", displayTextArea: true,
                            defaultValue: "Village — 1.4 mi\nSchool — 0.4 mi",
                            description: "One per line, as Place — distance. Up to six, in map order.",
                        },
                        plan: {
                            type: ControlType.Enum, title: "Floor Plan",
                            options: ["none", "villa", "penthouse"],
                            optionTitles: ["No plan", "Two-storey demo", "Single-floor demo"],
                            defaultValue: "none",
                            description:
                                "Room shapes are geometry, so the two demo plans are built in. Rooms fill them in order — room 1 takes the first shape. Extra rooms still get a card.",
                        },
                        rooms: {
                            type: ControlType.Array,
                            title: "Rooms",
                            control: {
                                type: ControlType.Object,
                                controls: {
                                    name: { type: ControlType.String, title: "Name", defaultValue: "Living Room" },
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
                                    scene: {
                                        type: ControlType.Enum, title: "Drawn Stand-in",
                                        options: ROOM_SCENE_OPTIONS, optionTitles: ROOM_SCENE_TITLES, defaultValue: "living",
                                    },
                                    sceneOut: {
                                        type: ControlType.Enum, title: "View Out",
                                        options: ["garden", "city", "forest"],
                                        optionTitles: ["Garden", "City", "Trees"], defaultValue: "garden",
                                    },
                                },
                            },
                            defaultValue: [],
                        },
                    },
                },
                defaultValue: DEFAULT_LISTINGS,
            },
        },
    },

    about: {
        type: ControlType.Object,
        title: "⑦ Agent",
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
        title: "⑧ Reviews",
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
        title: "⑨ Contact",
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
        title: "⑩ Footer",
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
