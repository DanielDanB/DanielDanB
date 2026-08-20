import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// ---------------------------------------------------------------------------
// ŠERO — photography portfolio, as one Framer code component.
//
// The stylesheet below is the HTML version's, scoped under .sero-root so it
// cannot leak into the Framer editor's own page, with the palette rewritten
// onto custom properties so ② Global Style reaches every rule.
// ---------------------------------------------------------------------------

const FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&display=swap');"

const CSS = `  
  .sero-root *{box-sizing:border-box;}
  .sero-root{scroll-behavior:smooth;}
  .sero-root{
    margin:0; background:var(--black); color:var(--white);
    font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
    overflow-wrap:break-word;
    word-break:break-word;
  }
  .sero-root ::selection{background:var(--white); color:var(--black);}
  .sero-root a{color:inherit; text-decoration:none;}
  .sero-root img{display:block; max-width:100%;}

  .sero-root .eyebrow{
    font-family:'Inter', sans-serif; font-size:0.72rem;
    letter-spacing:0.22em; text-transform:uppercase; color:var(--gray-300);
  }
  .sero-root h1, .sero-root h2, .sero-root h3{ font-family:var(--heading-font); font-weight:500; margin:0; letter-spacing:-0.01em; }

  .sero-root .grain{
    position:fixed; inset:-10%; z-index:60; pointer-events:none;
    opacity:0.05; mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }

  .sero-root .glass{
    background:linear-gradient(155deg, var(--glass-fill-strong), var(--glass-fill) 60%);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    border:1px solid var(--glass-border);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -12px 24px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.35);
  }
  .sero-root .glass-btn{
    position:relative; display:inline-flex; align-items:center; gap:0.5rem;
    padding:0.9rem 1.7rem; border-radius:999px; font-size:0.86rem; font-weight:500;
    color:var(--white); cursor:pointer; overflow:hidden; isolation:isolate;
    transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
  }
  .sero-root .glass-btn::before{
    content:""; position:absolute; inset:0;
    background:linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 48%, transparent 66%);
    transform:translateX(-120%); transition: transform 0.7s var(--ease); z-index:1; pointer-events:none;
  }
  .sero-root .glass-btn:hover::before{ transform:translateX(120%); }
  .sero-root .glass-btn:hover{ transform:translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 14px 34px rgba(0,0,0,0.4); }
  .sero-root .glass-btn span{ position:relative; z-index:2; }
  .sero-root .glass-btn.solid{ background:var(--white); color:var(--black); border-color:var(--white); }
  .sero-root .glass-btn.solid::before{ background:linear-gradient(120deg, transparent 30%, rgba(0,0,0,0.18) 48%, transparent 66%); }

  .sero-root .nav{
    position:fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding-top:1.3rem; padding-bottom:1.3rem;
    padding-left:calc(max(1.35rem, 5vw) + 3px); padding-right:max(1.35rem, 5vw);
    border-bottom:1px solid transparent;
    transition: background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease;
  }
  .sero-root .nav.scrolled{
    background:rgb(var(--bg-rgb) / 0.55);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    border-bottom-color: var(--glass-border);
  }
  .sero-root .brand{ display:flex; align-items:center; gap:0.65rem; }
  .sero-root .aperture{ width:22px; height:22px; transition: transform 0.6s var(--ease); }
  .sero-root .brand:hover .aperture{ transform:rotate(45deg); }
  .sero-root .brand-name{ font-family:'Inter', sans-serif; font-style:normal; font-weight:500; font-size:1.25rem; }
  .sero-root .brand-sub{ font-family:'Inter', sans-serif; font-size:0.65rem; color:var(--gray-300); letter-spacing:0.1em; margin-left:0.5rem; }

  .sero-root .nav-links{ list-style:none; display:flex; align-items:center; gap:2.1rem; margin:0; padding:0; }
  .sero-root .nav-links a:not(.glass-btn){ font-size:0.88rem; color:var(--gray-100); position:relative; transition:color 0.3s ease; }
  .sero-root .nav-links a:not(.glass-btn)::after{
    content:""; position:absolute; left:0; bottom:-5px; width:0; height:1px; background:var(--white);
    transition:width 0.35s var(--ease);
  }
  .sero-root .nav-links a:not(.glass-btn):hover{ color:var(--white); }
  .sero-root .nav-links a:not(.glass-btn):hover::after{ width:100%; }

  .sero-root .menu-toggle{
    display:none; width:42px; height:42px; border-radius:50%;
    border:1px solid var(--glass-border); background:var(--glass-fill);
    align-items:center; justify-content:center; cursor:pointer;
  }
  .sero-root .menu-toggle span{ display:block; width:16px; height:1px; background:var(--white); position:relative; }
  .sero-root .menu-toggle span::before, .sero-root .menu-toggle span::after{
    content:""; position:absolute; left:0; width:16px; height:1px; background:var(--white); transition: transform 0.3s ease;
  }
  .sero-root .menu-toggle span::before{ top:-5px; } .sero-root .menu-toggle span::after{ top:5px; }

  .sero-root .mobile-menu{
    position:fixed; inset:0; background:rgb(var(--bg-rgb) / 0.92);
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    z-index:99; display:flex; flex-direction:column; align-items:flex-start; justify-content:center;
    gap:1.4rem; padding-left:calc(max(1.5rem, 8vw) + 3px); padding-right:max(1.5rem, 8vw); opacity:0; visibility:hidden; transition: opacity 0.4s ease;
  }
  .sero-root .mobile-menu.open{ opacity:1; visibility:visible; }
  .sero-root .mobile-menu a{ font-family:'Inter', sans-serif; font-size:3rem; display:flex; align-items:baseline; gap:0.8rem; }
  .sero-root .mobile-menu a .idx{ font-family:'Inter', sans-serif; font-size:0.9rem; color:var(--gray-500); }

  .sero-root .hero{
    position:relative; height:100svh; min-height:600px; width:100%; overflow:hidden; background:var(--black);
    perspective:1400px;
  }
  .sero-root .leporelo{
    position:absolute; inset:0; display:flex; width:100%; height:100%;
    transform-style:preserve-3d;
  }
  .sero-root .panel{
    position:relative; flex:1 1 0; min-width:0; overflow:hidden;
    transition: flex-grow 0.8s var(--ease), transform 0.8s var(--ease);
    transform-origin:center center;
  }
  .sero-root .panel img{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    filter:grayscale(1) contrast(1.12) brightness(0.8);
    transform:scale(1.1); transition: filter 0.8s var(--ease), transform 0.9s var(--ease);
  }
  .sero-root .panel img.contain{
    object-fit:contain; background:var(--black); transform:scale(1);
  }
  .sero-root .panel::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(180deg, rgb(var(--bg-rgb) / 0.1) 0%, rgb(var(--bg-rgb) / 0.65) 100%);
  }
  .sero-root .panel::before{
    content:""; position:absolute; inset:0; z-index:2;
    box-shadow: inset 10px 0 18px -14px rgba(0,0,0,0.9), inset -10px 0 18px -14px rgba(0,0,0,0.9);
    pointer-events:none;
  }
  .sero-root .panel.active img{ filter:grayscale(1) contrast(1.22) brightness(1.03); transform:scale(1.04); }
  .sero-root .panel-meta{
    position:absolute; left:1.1rem; bottom:1.2rem; right:1.1rem; z-index:3;
    display:flex; align-items:baseline; gap:0.6rem;
    font-family:'Inter', sans-serif; font-size:0.7rem; color:var(--gray-100);
    opacity:0; transform:translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease;
    white-space:nowrap; overflow:hidden;
  }
  .sero-root .panel.active .panel-meta{ opacity:1; transform:translateY(0); }
  .sero-root .panel-meta .num{ color:var(--gray-300); }

  .sero-root .blend-wordmark{
    position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
    font-family:var(--display-font); font-weight:900;
    font-size:clamp(5.5rem, 21vw, 15rem); letter-spacing:-0.03em;
    color:#fff; mix-blend-mode:difference; z-index:4;
    pointer-events:none; white-space:nowrap; user-select:none;
  }

  .sero-root .hero-tag{
    position:absolute; left:calc(max(1.35rem, 5vw) + 3px); bottom:2.4rem; z-index:5;
    display:flex; flex-direction:column; gap:0.7rem;
    padding:1.1rem 1.4rem; border-radius:14px; max-width:340px;
  }
  .sero-root .hero-tag p{ margin:0; font-family:'Inter', sans-serif; font-style:normal; font-size:1.05rem; color:var(--white); }

  .sero-root .swipe-hint{
    display:none;
    position:absolute; left:50%; bottom:1.1rem; transform:translateX(-50%); z-index:5;
    font-family:'Inter', sans-serif; font-size:0.62rem; letter-spacing:0.14em;
    color:var(--gray-300); align-items:center; gap:0.4rem;
  }
  .sero-root .swipe-hint svg{ width:13px; height:13px; animation:swipeMove 1.6s ease-in-out infinite; }
  @keyframes swipeMove{ 0%,100%{ transform:translateX(0); opacity:0.5; } 50%{ transform:translateX(4px); opacity:1; } }

  .sero-root .hero-cta{ position:absolute; right:max(1.35rem, 5vw); bottom:2.4rem; z-index:5; }

  .sero-root .viewfinder{
    position:fixed; width:78px; height:78px; z-index:70; pointer-events:none;
    transform:translate(-50%,-50%); opacity:0; transition:opacity 0.25s ease;
  }
  .sero-root .viewfinder .corner{ position:absolute; width:16px; height:16px; border-color:rgb(var(--fg-rgb) / 0.85); }
  .sero-root .viewfinder .tl{ top:0; left:0; border-top:1.5px solid; border-left:1.5px solid; }
  .sero-root .viewfinder .tr{ top:0; right:0; border-top:1.5px solid; border-right:1.5px solid; }
  .sero-root .viewfinder .bl{ bottom:0; left:0; border-bottom:1.5px solid; border-left:1.5px solid; }
  .sero-root .viewfinder .br{ bottom:0; right:0; border-bottom:1.5px solid; border-right:1.5px solid; }
  .sero-root .viewfinder .exif{
    position:absolute; top:calc(100% + 10px); left:50%; transform:translateX(-50%);
    font-family:'Inter', sans-serif; font-size:0.62rem; letter-spacing:0.06em;
    color:rgb(var(--fg-rgb) / 0.85); white-space:nowrap;
  }

  .sero-root .marquee-strip{
    position:relative; z-index:2; background:var(--black);
    border-top:1px solid var(--gray-700); border-bottom:1px solid var(--gray-700);
    padding:1rem 0; overflow:hidden; white-space:nowrap;
  }
  .sero-root .marquee-track{
    display:inline-block; padding-left:100%;
    font-family:'Inter', sans-serif; font-size:0.85rem; letter-spacing:0.16em;
    color:var(--gray-300); animation: marquee var(--marquee-duration, 26s) linear infinite;
  }
  @keyframes marquee{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

  .sero-root main{ position:relative; z-index:2; background:var(--black); }
  .sero-root .wrap{ max-width:1220px; margin:0 auto; padding-left:calc(max(1.35rem, 5vw) + 3px); padding-right:max(1.35rem, 5vw); }

  .sero-root .section-head{
    display:flex; justify-content:space-between; align-items:flex-end; gap:2rem;
    margin-bottom:3.4rem; padding-bottom:1.6rem; border-bottom:1px solid var(--gray-700);
  }
  .sero-root .section-head h2{ font-size:clamp(2.4rem, 5.4vw, 4.4rem); line-height:1; }
  .sero-root .section-head .idx{
    font-family:'Inter', sans-serif; font-size:0.85rem; color:var(--gray-500);
    display:block; margin-bottom:0.8rem;
  }
  .sero-root .section-head .count{ font-family:'Inter', sans-serif; font-size:0.8rem; color:var(--gray-500); white-space:nowrap; }

  .sero-root .gallery-section{ padding:7rem 0 6rem; }
  .sero-root .carousel-viewport{
    overflow:hidden; width:100%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, black 4%, black 96%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, black 4%, black 96%, transparent 100%);
    padding:9rem 0;
    margin:-7rem 0;
  }
  .sero-root .carousel-track{
    display:flex; gap:1.1rem; width:max-content;
    animation: carouselScroll var(--carousel-duration, 34s) linear infinite;
  }
  .sero-root .carousel-track.paused{ animation-play-state:paused; }
  @keyframes carouselScroll{
    from{ transform:translateX(0); }
    to{ transform:translateX(-50%); }
  }
  .sero-root .carousel-item{
    position:relative; flex:0 0 auto;
    width:270px; height:340px;
    border-radius:16px; overflow:hidden;
    transform:scale(1);
    transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease), border-radius 0.5s var(--ease), z-index 0s;
    z-index:1;
  }
  .sero-root .carousel-item img{
    width:100%; height:100%; object-fit:cover;
    filter:grayscale(1) contrast(1.1) brightness(0.88);
    transform:scale(1.05);
    transition: transform 0.6s var(--ease), filter 0.4s ease;
  }
  .sero-root .carousel-item::before{
    content:""; position:absolute; inset:0;
    background:linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.6) 100%);
    opacity:0.6; transition:opacity 0.4s ease;
  }
  .sero-root .carousel-item.hovered{
    box-shadow:0 20px 40px rgba(0,0,0,0.5);
  }
  .sero-root .carousel-item.hovered img{
    transform:scale(1.1);
    filter:grayscale(1) contrast(1.15) brightness(0.98);
  }
  .sero-root .carousel-item.hovered::before{ opacity:0.5; }
  .sero-root .carousel-item{ cursor:pointer; }
  .sero-root .carousel-caption{
    position:absolute; left:0.85rem; bottom:0.8rem; right:0.85rem;
    font-family:'Inter', sans-serif; font-size:0.66rem; color:var(--gray-100);
    opacity:0; transform:translateY(6px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    text-shadow:0 2px 10px rgba(0,0,0,0.6);
  }
  .sero-root .carousel-item.hovered .carousel-caption{ opacity:1; transform:translateY(0); }

  .sero-root .carousel-lightbox-overlay{
    position:fixed; inset:0; z-index:200;
    background:rgb(var(--bg-rgb) / 0.88); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    opacity:0; visibility:hidden; pointer-events:none;
    transition: opacity 0.35s var(--ease), visibility 0.35s var(--ease);
  }
  .sero-root .carousel-lightbox-overlay.open{ opacity:1; visibility:visible; pointer-events:auto; }
  .sero-root .carousel-lightbox-img{
    max-width:min(88vw, 640px); max-height:80vh; width:auto; height:auto;
    border-radius:16px; object-fit:contain;
    filter:grayscale(1) contrast(1.15) brightness(1.02);
    box-shadow:0 50px 100px rgba(0,0,0,0.6);
    transform:scale(0.92); transition: transform 0.35s var(--ease);
  }
  .sero-root .carousel-lightbox-overlay.open .carousel-lightbox-img{ transform:scale(1); }
  .sero-root .carousel-lightbox-caption{
    position:absolute; left:50%; bottom:8vh; transform:translateX(-50%);
    font-family:'Inter', sans-serif; font-size:0.78rem; color:var(--gray-100);
    text-shadow:0 2px 10px rgba(0,0,0,0.6); white-space:nowrap;
  }
  .sero-root .carousel-lightbox-close{
    position:absolute; top:1.6rem; right:max(1.6rem, 4vw);
    width:44px; height:44px; border-radius:50%;
    background:var(--glass-fill-strong); border:1px solid var(--glass-border);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:var(--white);
  }
  .sero-root .carousel-lightbox-close svg{ width:18px; height:18px; }

  .sero-root .pricing-section{ padding:7rem 0; border-top:1px solid var(--gray-700); }
  .sero-root .pricing-grid{
    display:grid; grid-template-columns:repeat(3, 1fr); gap:1.2rem; margin-top:3rem;
  }
  .sero-root .price-card{
    border-radius:0; padding:0; background:none; border:none; box-shadow:none; backdrop-filter:none;
    display:flex; flex-direction:column;
    transition: transform 0.4s var(--ease);
  }
  .sero-root .price-card:hover{ transform:translateY(-6px); }
  .sero-root .price-media{
    position:relative; aspect-ratio:4/3; overflow:hidden;
    border-radius:18px;
    border:1px solid var(--glass-border);
    box-shadow:0 18px 34px rgba(0,0,0,0.35);
  }
  .sero-root .price-media img{
    width:100%; height:100%; object-fit:cover;
    filter:grayscale(1) contrast(1.1) brightness(0.95);
    transform:scale(1.04);
    transition: transform 0.6s var(--ease), filter 0.4s ease;
  }
  .sero-root .price-card:hover .price-media img{ transform:scale(1.1); filter:grayscale(1) contrast(1.16) brightness(1); }
  .sero-root .price-body{ display:flex; flex-direction:column; gap:0.7rem; padding:1.6rem 0.2rem 0; flex:1; }
  .sero-root .price-card .p-num{
    font-family:'Inter', sans-serif; font-size:0.68rem; color:var(--gray-500); letter-spacing:0.14em;
  }
  .sero-root .price-card h3{ font-size:1.35rem; margin-top:0.1rem; }
  .sero-root .price-card p{ color:var(--gray-100); font-size:0.9rem; line-height:1.5; flex:1; }
  .sero-root .price-card .p-price{
    font-family:'Inter', sans-serif; font-style:normal; font-weight:600; font-size:1.8rem; color:var(--white);
    margin-top:0.2rem;
  }
  .sero-root .price-card .p-price span{ font-family:'Inter', sans-serif; font-style:normal; font-size:0.7rem; color:var(--gray-300); margin-left:0.4rem; }
  .sero-root .price-card.featured .price-media{ border-color:rgb(var(--fg-rgb) / 0.35); }

  .sero-root .about-section{ padding:6rem 0; border-top:1px solid var(--gray-700); }
  .sero-root .about-grid{ display:grid; grid-template-columns:0.8fr 1.2fr; gap:4.5rem; align-items:center; }
  .sero-root .about-image{ position:relative; border-radius:6px; overflow:hidden; aspect-ratio:4/5; }
  .sero-root .about-image img{
    position:absolute; top:-18%; left:0; width:100%; height:136%; object-fit:cover;
    filter:grayscale(1) contrast(1.1) brightness(0.95);
    will-change:transform;
    transition: transform 0.05s linear;
  }
  .sero-root .about-quote{
    font-family:'Inter', sans-serif; font-style:normal; font-weight:400;
    font-size:clamp(1.8rem,3vw,2.7rem); line-height:1.15; margin:0.6rem 0 1.6rem; max-width:560px;
  }
  .sero-root .about-text p{ color:var(--gray-100); line-height:1.75; font-size:1.02rem; max-width:520px; }
  .sero-root .about-meta{
    display:flex; flex-wrap:wrap; gap:1.6rem 2.4rem; margin-top:2.2rem; padding-top:1.6rem; border-top:1px solid var(--gray-700);
    font-family:'Inter', sans-serif; font-size:0.78rem; color:var(--gray-300);
  }
  .sero-root .about-meta strong{ display:block; color:var(--white); font-size:1.4rem; font-family:'Inter',sans-serif; font-weight:500; }

  .sero-root .contact-section{ position:relative; padding:7rem 0 8rem; overflow:hidden; }

  .sero-root .film-stage{ position:relative; }
  .sero-root .film-spool{
    position:absolute; right:-6px; top:50%; transform:translateY(-50%);
    width:60px; height:60px; border-radius:50%; z-index:3;
    background: radial-gradient(circle at 34% 32%, rgb(var(--fg-rgb) / 0.3), rgba(21,19,16,0.92) 70%);
    border:1px solid rgb(var(--fg-rgb) / 0.25);
    box-shadow: 0 12px 26px rgba(0,0,0,0.55);
  }
  .sero-root .film-spool::before{ content:""; position:absolute; inset:13px; border-radius:50%; border:1px solid rgb(var(--fg-rgb) / 0.28); }
  .sero-root .film-spool::after{ content:""; position:absolute; inset:25px; border-radius:50%; background:rgb(var(--bg-rgb) / 0.85); }

  .sero-root .film-wrap{
    position:relative;
    border-radius:28px;
    overflow:hidden;
  }
  .sero-root .film-frame{
    position:relative;
    overflow:hidden;
    background:linear-gradient(155deg, rgba(21,19,16,0.18), rgba(21,19,16,0.06) 60%);
    backdrop-filter: blur(5px) saturate(150%);
    -webkit-backdrop-filter: blur(5px) saturate(150%);
    border:1px solid rgb(var(--fg-rgb) / 0.14);
    border-radius:28px;
    padding:0;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 30px 70px rgba(0,0,0,0.5);
    clip-path: inset(0 0 0 100%);
    transition: clip-path 1.2s cubic-bezier(.16,.84,.44,1);
  }
  .sero-root .film-frame.unrolled{
    clip-path: inset(0 0 0 0%);
  }
  .sero-root .contact-bg{
    position:absolute; inset:0; z-index:-1;
    background-size:cover; background-position:center 55%;
    filter:grayscale(1) contrast(1.05) brightness(0.88);
  }
  .sero-root .contact-bg::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(180deg, rgb(var(--bg-rgb) / 0.12) 0%, rgb(var(--bg-rgb) / 0.02) 40%, rgb(var(--bg-rgb) / 0.18) 100%);
  }
  .sero-root .film-label-row{
    display:flex; align-items:center; justify-content:space-between;
    padding:0.7rem 1.6rem;
    font-family:'Inter', sans-serif; font-size:0.62rem; letter-spacing:0.16em;
    color:var(--gray-100); text-transform:uppercase;
    text-shadow:0 1px 6px rgba(0,0,0,0.6);
  }
  .sero-root .film-label-row .frame-no::before{ content:"▵ "; color:var(--gray-300); }
  .sero-root .perf-strip{
    height:22px;
    background-image: radial-gradient(circle, var(--black) 0 5px, transparent 5.5px);
    background-size:28px 22px;
    background-repeat:repeat-x;
    background-position:14px center;
    position:relative;
  }
  .sero-root .perf-strip::before, .sero-root .perf-strip::after{
    content:""; position:absolute; left:0; right:0; height:1px;
    background:rgba(255,255,255,0.08);
  }
  .sero-root .perf-strip::before{ top:0; } .sero-root .perf-strip::after{ bottom:0; }

  .sero-root .contact-card{ border-radius:0; padding:clamp(2.6rem, 6vw, 5.5rem) clamp(1.6rem, 6vw, 5rem); text-align:center; display:flex; flex-direction:column; align-items:center; }
  .sero-root .film-frame .glass{ border-top:none; border-bottom:none; box-shadow:none; background:linear-gradient(155deg, rgb(var(--fg-rgb) / 0.1), rgb(var(--fg-rgb) / 0.03) 60%); }
  .sero-root .contact-card h2{ font-size:clamp(2.2rem, 5vw, 3.8rem); max-width:680px; line-height:1.06; text-shadow:0 2px 16px rgba(0,0,0,0.5); }
  .sero-root .contact-card p{ color:var(--gray-100); margin:1.3rem 0 2.2rem; font-size:1rem; text-shadow:0 1px 10px rgba(0,0,0,0.5); }
  .sero-root .contact-links{
    display:flex; gap:0.4rem; flex-wrap:wrap; justify-content:center; margin-top:1.8rem;
    background:rgb(var(--bg-rgb) / 0.55);
    border:1px solid rgb(var(--fg-rgb) / 0.12);
    border-radius:14px;
    padding:0.9rem 1.2rem;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .sero-root .contact-links a{
    font-family:'Inter', sans-serif; font-size:0.8rem; color:var(--gray-100);
    border-bottom:1px solid transparent; transition: color 0.3s ease, border-color 0.3s ease;
    padding:0.2rem 0.6rem;
  }
  .sero-root .contact-links a:hover{ color:var(--white); border-color:var(--white); }

  .sero-root footer{
    padding:2.4rem 0 3rem; display:flex; justify-content:space-between; align-items:center;
    font-family:'Inter', sans-serif; font-size:0.72rem; color:var(--gray-500);
    border-top:1px solid var(--gray-700);
  }

  @media (max-width: 900px){
    .sero-root .about-grid{ grid-template-columns:1fr; gap:2.5rem; }
    .sero-root .about-image{ max-width:340px; }
    .sero-root .carousel-item{ width:220px; height:280px; }
    .sero-root .blend-wordmark{ font-size:clamp(4rem,26vw,9rem); }
    .sero-root .pricing-grid{ grid-template-columns:1fr; }
  }
  @media (max-width: 700px){
    .sero-root .nav-links{
      position:fixed; inset:0; flex-direction:column; justify-content:center;
      background:rgb(var(--bg-rgb) / 0.92); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px);
      opacity:0; visibility:hidden; transition:opacity 0.4s ease; gap:2.2rem; z-index:99;
    }
    .sero-root .nav-links.open{ opacity:1; visibility:visible; }
    .sero-root .nav-links a:not(.glass-btn){ font-family:'Inter',sans-serif; font-size:1.8rem; }
    .sero-root .menu-toggle{ display:flex; }
    .sero-root .nav .glass-btn.solid{ display:none; }
    .sero-root .brand-sub{ display:none; }

    .sero-root .leporelo{
      flex-direction:row;
      overflow-x:auto;
      overflow-y:hidden;
      scroll-snap-type:x mandatory;
      scroll-padding-left:0;
      -webkit-overflow-scrolling:touch;
      scrollbar-width:none;
    }
    .sero-root .leporelo::-webkit-scrollbar{ display:none; }
    .sero-root .panel{
      flex:0 0 92%;
      scroll-snap-align:start;
      transform:none !important;
    }
    .sero-root .panel img{ filter:grayscale(1) contrast(1.15) brightness(0.95); transform:scale(1); }
    .sero-root .panel-meta{ opacity:1; transform:translateY(0); }
    .sero-root .panel::before{ box-shadow: inset 8px 0 14px -10px rgba(0,0,0,0.9), inset -8px 0 14px -10px rgba(0,0,0,0.9); }

    .sero-root .blend-wordmark{ top:22%; font-size:clamp(3rem,15vw,5.5rem); }
    .sero-root .hero-tag{ left:calc(max(1.35rem, 6vw) + 3px); right:max(1.35rem, 6vw); max-width:none; bottom:6.4rem; }
    .sero-root .hero-cta{ right:max(1.35rem, 6vw); bottom:2.2rem; }
    .sero-root .swipe-hint{ display:flex; }
    .sero-root .viewfinder{ display:none; }

    .sero-root .carousel-item{ width:190px; height:240px; }
    .sero-root .carousel-track{ animation-duration:calc(var(--carousel-duration, 34s) * 0.76); }
    .sero-root .carousel-item.hovered{
      transform:scale(1) !important; border-radius:16px !important; z-index:1 !important; box-shadow:none !important;
    }
    .sero-root .carousel-item.hovered img{ transform:scale(1.05) !important; filter:grayscale(1) contrast(1.1) brightness(0.88) !important; }
    .sero-root .carousel-item.hovered::before{ opacity:0.6 !important; }
    .sero-root .carousel-item.hovered .carousel-caption{ opacity:0 !important; transform:translateY(6px) !important; }
    .sero-root .section-head{ flex-direction:column; align-items:flex-start; gap:0.6rem; }

    .sero-root .wrap{ padding-left:1.4rem; padding-right:1.4rem; }
  }

  @media (prefers-reduced-motion: reduce){
    .sero-root *{ transition-duration:0.01ms !important; animation-duration:0.01ms !important; scroll-behavior:auto !important; }
    .sero-root .film-frame{ clip-path:none !important; }
    .sero-root .carousel-track{ animation-play-state:paused !important; }
  }
`

const DEFAULTS = {
    bg: "#080807",
    nearBg: "#111110",
    fg: "#f2f0e9",
    gray100: "#cfccc2",
    gray300: "#98958c",
    gray500: "#666359",
    gray700: "#2c2b26",
}

const DISPLAY_FONTS: Record<string, string> = {
    fraunces: "'Fraunces', Georgia, serif",
    inter: "'Inter', system-ui, sans-serif",
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Framer hands an Image control back as a string or as { src }. */
function imgSrc(value: any): string | undefined {
    if (!value) return undefined
    return typeof value === "string" ? value : value.src
}

function hexToRgbTriplet(hex: string, fallback: string): string {
    const clean = (hex || fallback).replace("#", "").trim()
    const full =
        clean.length === 3
            ? clean
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : clean
    const n = parseInt(full.slice(0, 6), 16)
    if (Number.isNaN(n)) return hexToRgbTriplet(fallback, "000000")
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

const onCanvas = () => RenderTarget.current() === RenderTarget.canvas

/**
 * An empty image slot draws its own expected size while you work, so the
 * missing photos are visible at a glance and nobody has to look up the
 * dimensions in a guide. It never renders on the published site.
 */
function Slot({ label, radius = 8 }: { label: string; radius?: number }) {
    if (!onCanvas()) return null
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                padding: "0.6rem",
                border: "1px dashed rgb(var(--fg-rgb) / 0.35)",
                borderRadius: radius,
                background: "rgb(var(--fg-rgb) / 0.04)",
                color: "rgb(var(--fg-rgb) / 0.55)",
                font: "500 11px/1.4 'Inter', system-ui, sans-serif",
                letterSpacing: "0.06em",
                pointerEvents: "none",
            }}
        >
            {label}
        </div>
    )
}

const ApertureMark = () => (
    <svg
        className="aperture"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 L15 9 L9 9 Z" />
        <path d="M22 12 L15 15 L15 9 Z" />
        <path d="M12 22 L9 15 L15 15 Z" />
        <path d="M2 12 L9 9 L9 15 Z" />
    </svg>
)

// ---------------------------------------------------------------------------
// prop groups
// ---------------------------------------------------------------------------

interface NavbarGroup {
    showNavbar?: boolean
    showMark?: boolean
    brandName?: string
    brandSub?: string
    links?: { label?: string; href?: string }[]
    ctaLabel?: string
    ctaHref?: string
}

interface StyleGroup {
    resetColors?: boolean
    background?: string
    textColor?: string
    mutedColor?: string
    dimColor?: string
    lineColor?: string
    glassStrength?: number
    displayFont?: string
    headingFont?: string
    grain?: boolean
}

interface HeroGroup {
    showHero?: boolean
    panels?: { panelImage?: any; panelLabel?: string }[]
    wordmark?: string
    eyebrow?: string
    tagline?: string
    ctaLabel?: string
    ctaHref?: string
    swipeHint?: string
    showViewfinder?: boolean
    isoValue?: string
}

interface MarqueeGroup {
    showMarquee?: boolean
    marqueeText?: string
    marqueeSpeed?: number
}

interface GalleryGroup {
    showGallery?: boolean
    indexLabel?: string
    heading?: string
    countLabel?: string
    items?: { itemImage?: any; caption?: string }[]
    scrollSpeed?: number
    enableLightbox?: boolean
}

interface PricingGroup {
    showPricing?: boolean
    indexLabel?: string
    heading?: string
    countLabel?: string
    cards?: {
        cardImage?: any
        cardNumber?: string
        cardTitle?: string
        cardText?: string
        cardPrice?: string
        cardUnit?: string
        featured?: boolean
    }[]
}

interface AboutGroup {
    showAbout?: boolean
    aboutImage?: any
    indexLabel?: string
    quote?: string
    body?: string
    metaItems?: { metaValue?: string; metaLabel?: string }[]
    parallax?: boolean
}

interface ContactGroup {
    showContact?: boolean
    backgroundImage?: any
    filmLabelLeft?: string
    frameNumber?: string
    filmLabelBottomLeft?: string
    filmLabelBottomRight?: string
    indexLabel?: string
    heading?: string
    subheading?: string
    body?: string
    buttonLabel?: string
    email?: string
    phone?: string
    unrollOnScroll?: boolean
}

interface FooterGroup {
    showFooter?: boolean
    leftText?: string
    rightText?: string
}

interface Props {
    navbar?: NavbarGroup
    globalStyle?: StyleGroup
    hero?: HeroGroup
    marquee?: MarqueeGroup
    gallery?: GalleryGroup
    pricing?: PricingGroup
    about?: AboutGroup
    contact?: ContactGroup
    footer?: FooterGroup
    style?: React.CSSProperties
}

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 5200
 */
export default function SeroSite(props: Props) {
    const nav = props.navbar || {}
    const gs = props.globalStyle || {}
    const hero = props.hero || {}
    const marquee = props.marquee || {}
    const gallery = props.gallery || {}
    const pricing = props.pricing || {}
    const about = props.about || {}
    const contact = props.contact || {}
    const footer = props.footer || {}

    // Framer will not let a component write its own props, so "reset" has to be
    // a switch the user flips on and then off again rather than a button.
    const reset = gs.resetColors === true
    const bg = reset ? DEFAULTS.bg : gs.background || DEFAULTS.bg
    const fg = reset ? DEFAULTS.fg : gs.textColor || DEFAULTS.fg
    const muted = reset ? DEFAULTS.gray300 : gs.mutedColor || DEFAULTS.gray300
    const dim = reset ? DEFAULTS.gray500 : gs.dimColor || DEFAULTS.gray500
    const line = reset ? DEFAULTS.gray700 : gs.lineColor || DEFAULTS.gray700
    const glass = gs.glassStrength === undefined ? 1 : gs.glassStrength

    const rootVars = {
        "--bg-rgb": hexToRgbTriplet(bg, DEFAULTS.bg),
        "--fg-rgb": hexToRgbTriplet(fg, DEFAULTS.fg),
        "--black": bg,
        "--near-black": reset ? DEFAULTS.nearBg : gs.background ? bg : DEFAULTS.nearBg,
        "--white": fg,
        "--gray-100": reset ? DEFAULTS.gray100 : gs.textColor ? fg : DEFAULTS.gray100,
        "--gray-300": muted,
        "--gray-500": dim,
        "--gray-700": line,
        "--glass-fill": `rgb(var(--fg-rgb) / ${(0.06 * glass).toFixed(3)})`,
        "--glass-fill-strong": `rgb(var(--fg-rgb) / ${(0.13 * glass).toFixed(3)})`,
        "--glass-border": `rgb(var(--fg-rgb) / ${(0.15 * glass).toFixed(3)})`,
        "--ease": "cubic-bezier(.16,.84,.44,1)",
        "--display-font": DISPLAY_FONTS[gs.displayFont || "fraunces"] || DISPLAY_FONTS.fraunces,
        "--heading-font": DISPLAY_FONTS[gs.headingFont || "inter"] || DISPLAY_FONTS.inter,
        "--marquee-duration": `${marquee.marqueeSpeed || 30}s`,
        "--carousel-duration": `${gallery.scrollSpeed || 34}s`,
        width: "100%",
        ...props.style,
    } as React.CSSProperties

    // ---- interaction state ------------------------------------------------
    const rootRef = React.useRef<HTMLDivElement>(null)
    const leporeloRef = React.useRef<HTMLDivElement>(null)
    const filmRef = React.useRef<HTMLDivElement>(null)
    const filmWrapRef = React.useRef<HTMLDivElement>(null)
    const aboutWrapRef = React.useRef<HTMLDivElement>(null)
    const aboutImgRef = React.useRef<HTMLImageElement>(null)

    const [scrolled, setScrolled] = React.useState(false)
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [unrolled, setUnrolled] = React.useState(false)
    const [finder, setFinder] = React.useState<{ x: number; y: number; on: boolean; exif: string }>(
        { x: 0, y: 0, on: false, exif: "" }
    )
    const [lightbox, setLightbox] = React.useState<{ src: string; caption: string } | null>(null)

    const canvas = onCanvas()

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    // Film frame unrolls when it comes into view.
    //
    // Watch the wrapper, not the frame. The frame starts at
    // clip-path: inset(0 0 0 100%), which clips it to zero area, and an element
    // with no area never reports as intersecting — so a frame observing itself
    // would wait forever and the whole contact card would stay invisible.
    React.useEffect(() => {
        const el = filmWrapRef.current
        if (!el || contact.unrollOnScroll === false || canvas) {
            setUnrolled(true)
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        setUnrolled(true)
                        io.unobserve(e.target)
                    }
                })
            },
            { threshold: 0.2 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [contact.unrollOnScroll, contact.showContact, canvas])

    // About image parallax.
    React.useEffect(() => {
        if (about.parallax === false || canvas) return
        const wrap = aboutWrapRef.current
        const img = aboutImgRef.current
        if (!wrap || !img) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        let ticking = false
        const update = () => {
            const rect = wrap.getBoundingClientRect()
            const vh = window.innerHeight || document.documentElement.clientHeight
            const progress = (rect.top - vh / 2 + rect.height / 2) / vh
            const offset = Math.max(-90, Math.min(90, progress * -180))
            img.style.transform = `translate3d(0, ${offset}px, 0)`
            ticking = false
        }
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update)
                ticking = true
            }
        }
        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", update)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", update)
        }
    }, [about.parallax, about.showAbout, canvas])

    React.useEffect(() => {
        if (!lightbox) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(null)
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [lightbox])

    // A host page with a <base href> makes every "#section" resolve against
    // another URL, so the links look alive and do nothing. Scroll by hand.
    const goTo = (e: React.MouseEvent, href?: string) => {
        setMenuOpen(false)
        if (!href || !href.startsWith("#")) return
        const el = rootRef.current?.querySelector(href)
        if (!el) return
        e.preventDefault()
        el.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    // ---- hero panel fan ---------------------------------------------------
    const isCompact = () => typeof window !== "undefined" && window.innerWidth <= 700

    const fanTo = (clientX: number) => {
        const el = leporeloRef.current
        if (!el || isCompact()) return
        const panels = Array.from(el.querySelectorAll<HTMLElement>(".panel"))
        if (!panels.length) return
        const rect = el.getBoundingClientRect()
        const x = clientX - rect.left
        const n = panels.length
        const sigma = (rect.width / n) * 0.6
        let bestIdx = 0
        let bestWeight = -1
        const weights = panels.map((_, i) => {
            const center = ((i + 0.5) / n) * rect.width
            const dist = Math.abs(x - center)
            const w = Math.exp(-Math.pow(dist / sigma, 2) * 1.15)
            if (w > bestWeight) {
                bestWeight = w
                bestIdx = i
            }
            return w
        })
        panels.forEach((panel, i) => {
            panel.style.flexGrow = (0.2 + weights[i] * 7).toFixed(3)
            const tilt = Math.max(-10, Math.min(10, (i - bestIdx) * 6))
            panel.style.transform = `rotateY(${tilt}deg)`
            panel.classList.toggle("active", i === bestIdx)
        })
    }

    const resetFan = () => {
        const el = leporeloRef.current
        if (!el) return
        el.querySelectorAll<HTMLElement>(".panel").forEach((p) => {
            p.style.flexGrow = "1"
            p.style.transform = "rotateY(0deg)"
            p.classList.remove("active")
        })
    }

    const apertures = ["f/1.8", "f/2.8", "f/4", "f/5.6"]
    const shutters = ["1/125s", "1/250s", "1/500s", "1/1000s"]

    const trackFinder = (e: React.PointerEvent) => {
        if (hero.showViewfinder === false || canvas) return
        if (typeof window === "undefined") return
        if (!window.matchMedia("(pointer: fine)").matches || isCompact()) return
        const idx =
            Math.floor((e.clientX / window.innerWidth) * apertures.length) % apertures.length
        setFinder({
            x: e.clientX,
            y: e.clientY,
            on: true,
            exif: `${apertures[idx]} · ${shutters[idx]} · ${hero.isoValue || "ISO 400"}`,
        })
    }
    const hideFinder = () => setFinder((f) => ({ ...f, on: false }))

    // ---- content ----------------------------------------------------------
    const navLinks = nav.links && nav.links.length ? nav.links : []
    const panels = hero.panels && hero.panels.length ? hero.panels : []
    const items = gallery.items && gallery.items.length ? gallery.items : []
    const cards = pricing.cards && pricing.cards.length ? pricing.cards : []
    const metaItems = about.metaItems && about.metaItems.length ? about.metaItems : []

    // The marquee and the carousel both animate to -50%, which only lines up
    // when the content is present exactly twice.
    const marqueeText = marquee.marqueeText || ""
    const doubled = items.concat(items)

    return (
        <div className="sero-root" ref={rootRef} style={rootVars}>
            <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT + CSS }} />

            {gs.grain !== false && <div className="grain" />}

            {nav.showNavbar !== false && (
                <nav className={"nav" + (scrolled ? " scrolled" : "")} id="nav">
                    <a href="#hero" className="brand" onClick={(e) => goTo(e, "#hero")}>
                        {nav.showMark !== false && <ApertureMark />}
                        <span className="brand-name">{nav.brandName}</span>
                        <span className="brand-sub">{nav.brandSub}</span>
                    </a>
                    <ul className={"nav-links" + (menuOpen ? " open" : "")}>
                        {navLinks.map((l, i) => (
                            <li key={i}>
                                <a href={l.href || "#"} onClick={(e) => goTo(e, l.href)}>
                                    {l.label}
                                </a>
                            </li>
                        ))}
                        {nav.ctaLabel && (
                            <li>
                                <a
                                    href={nav.ctaHref || "#kontakt"}
                                    className="glass-btn solid"
                                    onClick={(e) => goTo(e, nav.ctaHref)}
                                >
                                    <span>{nav.ctaLabel}</span>
                                </a>
                            </li>
                        )}
                    </ul>
                    <button
                        className="menu-toggle"
                        aria-label="Menu"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        <span />
                    </button>
                </nav>
            )}

            {hero.showHero !== false && (
                <section
                    className="hero"
                    id="hero"
                    onPointerMove={trackFinder}
                    onPointerLeave={hideFinder}
                >
                    <div
                        className="leporelo"
                        ref={leporeloRef}
                        onPointerMove={(e) => fanTo(e.clientX)}
                        onPointerLeave={resetFan}
                    >
                        {panels.map((p, i) => {
                            const src = imgSrc(p.panelImage)
                            return (
                                <div className="panel" key={i} data-index={i}>
                                    {src ? <img src={src} alt="" /> : <Slot label="1200 × 1600 px" radius={0} />}
                                    <div className="panel-meta">
                                        <span className="num">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span>{p.panelLabel}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {hero.wordmark && <h1 className="blend-wordmark">{hero.wordmark}</h1>}

                    <div className="hero-tag glass">
                        <span className="eyebrow">{hero.eyebrow}</span>
                        <p>{hero.tagline}</p>
                    </div>

                    {hero.ctaLabel && (
                        <a
                            href={hero.ctaHref || "#prace"}
                            className="glass-btn glass hero-cta"
                            onClick={(e) => goTo(e, hero.ctaHref)}
                        >
                            <span>{hero.ctaLabel}</span>
                        </a>
                    )}

                    {hero.swipeHint && (
                        <div className="swipe-hint">
                            <span>{hero.swipeHint}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </div>
                    )}
                </section>
            )}

            {hero.showViewfinder !== false && (
                <div
                    className="viewfinder"
                    style={{ left: finder.x, top: finder.y, opacity: finder.on ? 1 : 0 }}
                >
                    <div className="corner tl" />
                    <div className="corner tr" />
                    <div className="corner bl" />
                    <div className="corner br" />
                    <span className="exif">{finder.exif}</span>
                </div>
            )}

            {marquee.showMarquee !== false && marqueeText && (
                <div className="marquee-strip">
                    <div className="marquee-track">
                        {marqueeText}&nbsp;{marqueeText}&nbsp;
                    </div>
                </div>
            )}

            <div className={"mobile-menu" + (menuOpen ? " open" : "")}>
                {navLinks.map((l, i) => (
                    <a key={i} href={l.href || "#"} onClick={(e) => goTo(e, l.href)}>
                        <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                        {l.label}
                    </a>
                ))}
            </div>

            <main>
                {gallery.showGallery !== false && (
                    <section className="gallery-section wrap" id="prace">
                        <div className="section-head">
                            <div>
                                <span className="idx">{gallery.indexLabel}</span>
                                <h2>{gallery.heading}</h2>
                            </div>
                            <div className="count">{gallery.countLabel}</div>
                        </div>
                        <div
                            className="carousel-viewport"
                            onPointerMove={trackFinder}
                            onPointerLeave={hideFinder}
                        >
                            <div className="carousel-track">
                                {doubled.map((it, i) => {
                                    const src = imgSrc(it.itemImage)
                                    return (
                                        <div
                                            className="carousel-item"
                                            key={i}
                                            onClick={() =>
                                                gallery.enableLightbox !== false &&
                                                src &&
                                                setLightbox({
                                                    src,
                                                    caption: it.caption || "",
                                                })
                                            }
                                        >
                                            {src ? (
                                                <img src={src} alt={it.caption || ""} />
                                            ) : (
                                                <Slot label="800 × 1000 px" radius={16} />
                                            )}
                                            <div className="carousel-caption">{it.caption}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {lightbox && (
                    <div
                        className="carousel-lightbox-overlay open"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setLightbox(null)
                        }}
                    >
                        <div className="carousel-lightbox-close" onClick={() => setLightbox(null)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M5 5l14 14M19 5L5 19" />
                            </svg>
                        </div>
                        <img className="carousel-lightbox-img" src={lightbox.src} alt="" />
                        <div className="carousel-lightbox-caption">{lightbox.caption}</div>
                    </div>
                )}

                {pricing.showPricing !== false && (
                    <section className="pricing-section wrap" id="sluzby">
                        <div className="section-head">
                            <div>
                                <span className="idx">{pricing.indexLabel}</span>
                                <h2>{pricing.heading}</h2>
                            </div>
                            <div className="count">{pricing.countLabel}</div>
                        </div>
                        <div className="pricing-grid">
                            {cards.map((c, i) => {
                                const src = imgSrc(c.cardImage)
                                return (
                                    <div
                                        className={"price-card glass" + (c.featured ? " featured" : "")}
                                        key={i}
                                    >
                                        <div className="price-media">
                                            {src ? (
                                                <img src={src} alt="" />
                                            ) : (
                                                <Slot label="900 × 600 px" radius={18} />
                                            )}
                                        </div>
                                        <div className="price-body">
                                            <span className="p-num">{c.cardNumber}</span>
                                            <h3>{c.cardTitle}</h3>
                                            <p>{c.cardText}</p>
                                            <div className="p-price">
                                                {c.cardPrice}
                                                <span>{c.cardUnit}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {about.showAbout !== false && (
                    <section className="about-section wrap" id="o-mne">
                        <div className="about-grid">
                            <div className="about-image" ref={aboutWrapRef}>
                                {imgSrc(about.aboutImage) ? (
                                    <img ref={aboutImgRef} src={imgSrc(about.aboutImage)} alt="" />
                                ) : (
                                    <Slot label="1000 × 1300 px" radius={6} />
                                )}
                            </div>
                            <div className="about-text">
                                <span className="idx eyebrow">{about.indexLabel}</span>
                                <p className="about-quote">{about.quote}</p>
                                <p>{about.body}</p>
                                <div className="about-meta">
                                    {metaItems.map((m, i) => (
                                        <div key={i}>
                                            <strong>{m.metaValue}</strong>
                                            {m.metaLabel}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {contact.showContact !== false && (
                    <section className="contact-section wrap" id="kontakt">
                        <div className="film-wrap" ref={filmWrapRef}>
                            <div
                                className="contact-bg"
                                style={
                                    imgSrc(contact.backgroundImage)
                                        ? {
                                              backgroundImage: `url('${imgSrc(
                                                  contact.backgroundImage
                                              )}')`,
                                          }
                                        : undefined
                                }
                            />
                            <div
                                className={"film-frame" + (unrolled ? " unrolled" : "")}
                                ref={filmRef}
                            >
                                <div className="film-label-row">
                                    <span>{contact.filmLabelLeft}</span>
                                    <span className="frame-no">{contact.frameNumber}</span>
                                </div>
                                <div className="perf-strip" />
                                <div className="contact-card glass">
                                    <span className="idx eyebrow">{contact.indexLabel}</span>
                                    <h2 style={{ marginTop: "0.8rem" }}>
                                        {contact.heading}
                                        {contact.subheading ? (
                                            <>
                                                <br />
                                                {contact.subheading}
                                            </>
                                        ) : null}
                                    </h2>
                                    <p>{contact.body}</p>
                                    {contact.buttonLabel && (
                                        <a
                                            href={`mailto:${contact.email || ""}`}
                                            className="glass-btn solid"
                                        >
                                            <span>{contact.buttonLabel}</span>
                                        </a>
                                    )}
                                    <div className="contact-links">
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                        )}
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                                                {contact.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="perf-strip" />
                                <div className="film-label-row">
                                    <span>{contact.filmLabelBottomLeft}</span>
                                    <span className="frame-no">{contact.filmLabelBottomRight}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {footer.showFooter !== false && (
                    <footer className="wrap">
                        <span>{footer.leftText}</span>
                        <span>{footer.rightText}</span>
                    </footer>
                )}
            </main>
        </div>
    )
}

// ---------------------------------------------------------------------------
// property controls
// ---------------------------------------------------------------------------

addPropertyControls(SeroSite, {
    navbar: {
        type: ControlType.Object,
        title: "① Navbar",
        controls: {
            showNavbar: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            brandName: { type: ControlType.String, title: "Brand Name", defaultValue: "ŠERO" },
            brandSub: { type: ControlType.String, title: "Brand Subtitle", defaultValue: "FOTOGRAF" },
            showMark: { type: ControlType.Boolean, title: "Aperture Mark", defaultValue: true },
            links: {
                type: ControlType.Array,
                title: "Menu Links",
                control: {
                    type: ControlType.Object,
                    controls: {
                        label: { type: ControlType.String, title: "Label", defaultValue: "Práce" },
                        href: { type: ControlType.String, title: "Anchor", defaultValue: "#prace" },
                    },
                },
                defaultValue: [
                    { label: "Práce", href: "#prace" },
                    { label: "Služby", href: "#sluzby" },
                    { label: "O mně", href: "#o-mne" },
                    { label: "Kontakt", href: "#kontakt" },
                ],
            },
            ctaLabel: { type: ControlType.String, title: "Button Label", defaultValue: "Napsat" },
            ctaHref: { type: ControlType.String, title: "Button Anchor", defaultValue: "#kontakt" },
        },
    },

    globalStyle: {
        type: ControlType.Object,
        title: "② Global Style",
        controls: {
            resetColors: {
                type: ControlType.Boolean,
                title: "↺ Reset Colors",
                defaultValue: false,
                enabledTitle: "Restoring",
                disabledTitle: "Off",
                description:
                    "Flip on to bring the original palette back, then flip off to keep editing. A component cannot rewrite its own settings, so a reset has to work as a switch.",
            },
            background: { type: ControlType.Color, title: "Background", defaultValue: DEFAULTS.bg },
            textColor: { type: ControlType.Color, title: "Text", defaultValue: DEFAULTS.fg },
            mutedColor: { type: ControlType.Color, title: "Muted Text", defaultValue: DEFAULTS.gray300 },
            dimColor: { type: ControlType.Color, title: "Dim Text", defaultValue: DEFAULTS.gray500 },
            lineColor: { type: ControlType.Color, title: "Lines", defaultValue: DEFAULTS.gray700 },
            glassStrength: {
                type: ControlType.Number,
                title: "Glass Strength",
                min: 0,
                max: 3,
                step: 0.1,
                defaultValue: 1,
                description: "How visible the frosted panels are against the background.",
            },
            displayFont: {
                type: ControlType.Enum,
                title: "Wordmark Font",
                options: ["fraunces", "inter"],
                optionTitles: ["Fraunces (serif)", "Inter (sans)"],
                defaultValue: "fraunces",
                description: "The oversized name across the hero.",
            },
            headingFont: {
                type: ControlType.Enum,
                title: "Heading Font",
                options: ["inter", "fraunces"],
                optionTitles: ["Inter (sans)", "Fraunces (serif)"],
                defaultValue: "inter",
            },
            grain: { type: ControlType.Boolean, title: "Film Grain", defaultValue: true },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "③ Hero",
        controls: {
            showHero: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: "ŠERO" },
            eyebrow: {
                type: ControlType.String,
                title: "Eyebrow",
                defaultValue: "Fotografické portfolio",
            },
            tagline: { type: ControlType.String, title: "Tagline", defaultValue: "Světlo. Stín. Okamžik." },
            panels: {
                type: ControlType.Array,
                title: "Panels",
                control: {
                    type: ControlType.Object,
                    controls: {
                        panelImage: {
                            type: ControlType.Image,
                            title: "Photo",
                            description: "Recommended: 1200 × 1600 px, portrait. The panels fan out under the pointer.",
                        },
                        panelLabel: { type: ControlType.String, title: "Label", defaultValue: "Portrét" },
                    },
                },
                defaultValue: [
                    { panelLabel: "Portrét" },
                    { panelLabel: "Architektura" },
                    { panelLabel: "Krajina" },
                    { panelLabel: "Svatba" },
                    { panelLabel: "Divočina" },
                ],
            },
            ctaLabel: { type: ControlType.String, title: "Button Label", defaultValue: "Prohlédnout práci" },
            ctaHref: { type: ControlType.String, title: "Button Anchor", defaultValue: "#prace" },
            swipeHint: { type: ControlType.String, title: "Swipe Hint", defaultValue: "PROJEĎ PRSTEM" },
            showViewfinder: {
                type: ControlType.Boolean,
                title: "Viewfinder Cursor",
                defaultValue: true,
                description: "Replaces the pointer with camera framing marks on desktop.",
            },
            isoValue: { type: ControlType.String, title: "ISO Reading", defaultValue: "ISO 400" },
        },
    },

    marquee: {
        type: ControlType.Object,
        title: "④ Marquee",
        controls: {
            showMarquee: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            marqueeText: {
                type: ControlType.String,
                title: "Text",
                defaultValue: "PORTRÉT — KRAJINA — ULICE — ARCHITEKTURA — DETAIL —",
                description: "Repeated twice so the loop meets itself. End it with a dash.",
            },
            marqueeSpeed: {
                type: ControlType.Number,
                title: "Loop Seconds",
                min: 8,
                max: 90,
                step: 1,
                defaultValue: 30,
                unit: "s",
            },
        },
    },

    gallery: {
        type: ControlType.Object,
        title: "⑤ Gallery",
        controls: {
            showGallery: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            indexLabel: { type: ControlType.String, title: "Index Label", defaultValue: "— 02" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Vybraná práce" },
            countLabel: { type: ControlType.String, title: "Count Label", defaultValue: "08 fotografií" },
            items: {
                type: ControlType.Array,
                title: "Photos",
                control: {
                    type: ControlType.Object,
                    controls: {
                        itemImage: {
                            type: ControlType.Image,
                            title: "Photo",
                            description: "Recommended: 800 × 1000 px, portrait. Shown at 270 × 340 px.",
                        },
                        caption: {
                            type: ControlType.String,
                            title: "Caption",
                            defaultValue: "Portrét — Praha, 2025",
                        },
                    },
                },
                defaultValue: [
                    { caption: "Portrét — Praha, 2025" },
                    { caption: "Krajina — Šumava, 2024" },
                    { caption: "Portrét — Brno, 2025" },
                    { caption: "Krajina — Alpy, 2023" },
                    { caption: "Architektura — Vídeň, 2024" },
                    { caption: "Portrét — Ateliér, 2025" },
                    { caption: "Ulice — Praha, 2023" },
                    { caption: "Krajina — Sekvoje, 2024" },
                ],
            },
            scrollSpeed: {
                type: ControlType.Number,
                title: "Loop Seconds",
                min: 10,
                max: 120,
                step: 1,
                defaultValue: 34,
                unit: "s",
            },
            enableLightbox: {
                type: ControlType.Boolean,
                title: "Click to Enlarge",
                defaultValue: true,
            },
        },
    },

    pricing: {
        type: ControlType.Object,
        title: "⑥ Services & Pricing",
        controls: {
            showPricing: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            indexLabel: { type: ControlType.String, title: "Index Label", defaultValue: "— 03" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Služby a ceny" },
            countLabel: { type: ControlType.String, title: "Side Label", defaultValue: "Ceny od" },
            cards: {
                type: ControlType.Array,
                title: "Cards",
                control: {
                    type: ControlType.Object,
                    controls: {
                        cardImage: {
                            type: ControlType.Image,
                            title: "Photo",
                            description: "Recommended: 900 × 600 px, landscape 4:3.",
                        },
                        cardNumber: { type: ControlType.String, title: "Small Label", defaultValue: "01 / Portrét" },
                        cardTitle: { type: ControlType.String, title: "Title", defaultValue: "Portrétní focení" },
                        cardText: {
                            type: ControlType.String,
                            title: "Text",
                            displayTextArea: true,
                            defaultValue:
                                "Individuální nebo párové focení ve studiu i venku. 1–2 hodiny, výběr nejlepších záběrů, retuš zahrnuta.",
                        },
                        cardPrice: { type: ControlType.String, title: "Price", defaultValue: "2 500 Kč" },
                        cardUnit: { type: ControlType.String, title: "Price Unit", defaultValue: "/ session" },
                        featured: { type: ControlType.Boolean, title: "Highlight", defaultValue: false },
                    },
                },
                defaultValue: [
                    {
                        cardNumber: "01 / Portrét",
                        cardTitle: "Portrétní focení",
                        cardText:
                            "Individuální nebo párové focení ve studiu i venku. 1–2 hodiny, výběr nejlepších záběrů, retuš zahrnuta.",
                        cardPrice: "2 500 Kč",
                        cardUnit: "/ session",
                        featured: false,
                    },
                    {
                        cardNumber: "02 / Svatba",
                        cardTitle: "Svatební focení",
                        cardText:
                            "Celodenní doprovod, příprava, obřad i hostina. Kompletní editovaná galerie do 3 týdnů.",
                        cardPrice: "18 000 Kč",
                        cardUnit: "/ den",
                        featured: true,
                    },
                    {
                        cardNumber: "03 / Komerce",
                        cardTitle: "Komerční a produktová",
                        cardText:
                            "Fotografie pro web, sociální sítě nebo katalog. Cena dle rozsahu a počtu produktů/lokací.",
                        cardPrice: "od 4 000 Kč",
                        cardUnit: "/ den",
                        featured: false,
                    },
                ],
            },
        },
    },

    about: {
        type: ControlType.Object,
        title: "⑦ About",
        controls: {
            showAbout: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            aboutImage: {
                type: ControlType.Image,
                title: "Photo",
                description: "Recommended: 1000 × 1300 px, portrait 4:5. It drifts as the page scrolls.",
            },
            indexLabel: { type: ControlType.String, title: "Index Label", defaultValue: "— 04 / O mně" },
            quote: {
                type: ControlType.String,
                title: "Quote",
                displayTextArea: true,
                defaultValue: "„Hledám okamžik, kdy světlo řekne víc než barva.“",
            },
            body: {
                type: ControlType.String,
                title: "Text",
                displayTextArea: true,
                defaultValue:
                    "Fotím lidi a místa tak, jak je vidím ve chvíli, kdy na ně nikdo jiný nekouká — v přechodu mezi světlem a stínem, kde vzniká skutečný charakter.",
            },
            metaItems: {
                type: ControlType.Array,
                title: "Facts",
                control: {
                    type: ControlType.Object,
                    controls: {
                        metaValue: { type: ControlType.String, title: "Value", defaultValue: "2014" },
                        metaLabel: { type: ControlType.String, title: "Label", defaultValue: "od kdy fotím" },
                    },
                },
                defaultValue: [
                    { metaValue: "2014", metaLabel: "od kdy fotím" },
                    { metaValue: "120+", metaLabel: "klientských projektů" },
                    { metaValue: "CZ / EU", metaLabel: "k dispozici pro zakázky" },
                ],
            },
            parallax: { type: ControlType.Boolean, title: "Parallax", defaultValue: true },
        },
    },

    contact: {
        type: ControlType.Object,
        title: "⑧ Contact",
        controls: {
            showContact: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            backgroundImage: {
                type: ControlType.Image,
                title: "Background Photo",
                description: "Recommended: 1800 × 1200 px, landscape. Sits behind the film strip.",
            },
            indexLabel: { type: ControlType.String, title: "Index Label", defaultValue: "— 05 / Kontakt" },
            heading: {
                type: ControlType.String,
                title: "Heading Line 1",
                defaultValue: "Pojďme společně vytvořit",
            },
            subheading: {
                type: ControlType.String,
                title: "Heading Line 2",
                defaultValue: "něco nezapomenutelného.",
            },
            body: {
                type: ControlType.String,
                title: "Text",
                displayTextArea: true,
                defaultValue:
                    "Ať už jde o svatbu, portrét nebo redakční zakázku — ozvěte se a probereme detaily.",
            },
            buttonLabel: { type: ControlType.String, title: "Button Label", defaultValue: "Napsat e-mail" },
            email: { type: ControlType.String, title: "Email", defaultValue: "ahoj@sero-foto.cz" },
            phone: { type: ControlType.String, title: "Phone", defaultValue: "+420 601 234 567" },
            filmLabelLeft: {
                type: ControlType.String,
                title: "Film Label — Top Left",
                defaultValue: "ŠERO FILM · 400 · BW",
            },
            frameNumber: { type: ControlType.String, title: "Film Label — Top Right", defaultValue: "24A" },
            filmLabelBottomLeft: {
                type: ControlType.String,
                title: "Film Label — Bottom Left",
                defaultValue: "EXP. 2026",
            },
            filmLabelBottomRight: {
                type: ControlType.String,
                title: "Film Label — Bottom Right",
                defaultValue: "f/2.8 · 1/250s",
            },
            unrollOnScroll: {
                type: ControlType.Boolean,
                title: "Unroll on Scroll",
                defaultValue: true,
                description: "The film strip wipes open when it comes into view.",
            },
        },
    },

    footer: {
        type: ControlType.Object,
        title: "⑨ Footer",
        controls: {
            showFooter: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            leftText: {
                type: ControlType.String,
                title: "Left Text",
                defaultValue: "© 2026 ŠERO — všechna práva vyhrazena",
            },
            rightText: { type: ControlType.String, title: "Right Text", defaultValue: "Praha, ČR" },
        },
    },
})
