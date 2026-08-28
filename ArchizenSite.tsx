import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// ---------------------------------------------------------------------------
// ARCHIZEN — architecture studio, as one Framer code component.
//
// The stylesheet below is the standalone HTML version's, rewritten under
// .arz-root so it cannot leak into the Framer editor's own page. Colours,
// fonts and photo treatment are custom properties, so ② Global Style reaches
// every rule without a second set of styles existing anywhere.
//
// .arz-anim is added on the published site: it holds every reveal in its
// starting position until the observer fires. On the canvas the root carries
// .arz-static instead, so the page you edit is the page at rest, fully visible.
// ---------------------------------------------------------------------------

const FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');"

const CSS = `
.arz-root {
  --desk:#eceae6; --sheet:#ffffff; --ink:#14140f; --muted:#77746c; --dim:#a5a19a; --line:#e4e1db; --accent:#a6613d; --accent-soft:rgba(166,97,61,0.12); --sidebar-w:250px; --gutter:clamp(1.4rem, 3.4vw, 3.6rem); --frame:clamp(0px, 2.2vw, 28px); --radius:3px; --ease:cubic-bezier(0.16,1,0.3,1); --ease-soft:cubic-bezier(0.4,0,0.2,1); --head:'Space Grotesk', 'Helvetica Neue', Arial, sans-serif; --body:'Inter', system-ui, sans-serif; --photo-filter:none;
}
.arz-root * {
  box-sizing:border-box;
}
.arz-root {
  scroll-behavior:smooth;
}
.arz-root {
  margin:0; background:var(--desk); color:var(--ink); font-family:var(--body); font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.arz-root img {
  display:block; max-width:100%;
}
.arz-root a {
  color:inherit; text-decoration:none;
}
.arz-root button {
  font:inherit; color:inherit; background:none; border:0; cursor:pointer;
}
.arz-root ::selection {
  background:var(--ink); color:var(--sheet);
}
.arz-root h1, .arz-root h2, .arz-root h3, .arz-root h4 {
  font-family:var(--head); font-weight:400; margin:0; letter-spacing:-0.02em; line-height:1.02;
}
.arz-root p {
  margin:0;
}
.arz-root .eyebrow {
  font-family:var(--body); font-size:0.66rem; font-weight:500; letter-spacing:0.28em; text-transform:uppercase; color:var(--dim);
}
.arz-root .lede {
  font-size:clamp(1.02rem,1.35vw,1.28rem); line-height:1.62; color:var(--muted); font-weight:300;
}
.arz-root .display {
  font-size:clamp(2.4rem,6.4vw,5.4rem); line-height:0.98; letter-spacing:-0.035em;
}
.arz-root .h2 {
  font-size:clamp(1.9rem,4vw,3.4rem); line-height:1.02; letter-spacing:-0.03em;
}
.arz-root .h3 {
  font-size:clamp(1.25rem,1.9vw,1.7rem); letter-spacing:-0.02em;
}
.arz-root .mono {
  font-family:var(--body); font-size:0.7rem; letter-spacing:0.16em; text-transform:uppercase; color:var(--dim); font-variant-numeric:tabular-nums;
}
.arz-root .rule {
  height:1px; background:var(--line); width:100%;
}
.arz-root .desk {
  padding:var(--frame);
}
.arz-root .sheet {
  background:var(--sheet); min-height:100vh; position:relative; box-shadow:0 1px 2px rgba(20,20,15,0.04), 0 18px 60px -30px rgba(20,20,15,0.28); border-radius:var(--radius);
}
.arz-root .shell {
  display:flex; align-items:flex-start;
}
.arz-root .sidebar {
  position:sticky; top:0; align-self:flex-start; flex:0 0 var(--sidebar-w); width:var(--sidebar-w); height:100vh; max-height:100vh; display:flex; flex-direction:column; justify-content:space-between; padding:clamp(1.6rem,2.4vw,2.4rem) clamp(1.2rem,1.8vw,2rem); border-right:1px solid var(--line); z-index:40; background:var(--sheet);
}
.arz-root .brand {
  display:block;
}
.arz-root .brand-name {
  font-family:var(--head); font-weight:700; font-size:1.06rem; letter-spacing:0.24em; text-transform:uppercase; line-height:1;
}
.arz-root .brand-sub {
  display:block; margin-top:0.55rem; font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--dim);
}
.arz-root .side-nav {
  display:flex; flex-direction:column; gap:0.15rem; margin:0; padding:0; list-style:none;
}
.arz-root .side-nav a {
  position:relative; display:inline-block; padding:0.34rem 0; font-size:0.86rem; color:var(--muted); width:max-content; transition:color 0.4s var(--ease-soft), transform 0.5s var(--ease);
}
.arz-root .side-nav a::after {
  content:""; position:absolute; left:0; bottom:0.22rem; height:1px; width:0; background:var(--ink); transition:width 0.5s var(--ease);
}
.arz-root .side-nav a:hover {
  color:var(--ink); transform:translateX(3px);
}
.arz-root .side-nav a:hover::after {
  width:100%;
}
.arz-root .side-nav a.active {
  color:var(--ink);
}
.arz-root .side-nav a.active::after {
  width:100%; background:var(--accent);
}
.arz-root .side-foot {
  display:flex; flex-direction:column; gap:1.1rem;
}
.arz-root .side-meta {
  font-size:0.7rem; color:var(--dim); line-height:1.7;
}
.arz-root .socials {
  display:flex; gap:0.85rem; align-items:center;
}
.arz-root .socials a {
  width:26px; height:26px; display:grid; place-items:center; border-radius:50%; color:var(--muted); border:1px solid transparent; transition:color 0.35s ease, border-color 0.35s ease, transform 0.45s var(--ease);
}
.arz-root .socials a:hover {
  color:var(--ink); border-color:var(--line); transform:translateY(-2px);
}
.arz-root .socials svg {
  width:14px; height:14px; fill:currentColor;
}
.arz-root .progress {
  position:absolute; left:-1px; top:0; width:2px; background:var(--accent); height:0; transition:height 0.15s linear; opacity:0.9;
}
.arz-root .topbar {
  display:none; position:sticky; top:0; z-index:60; align-items:center; justify-content:space-between; padding:0.95rem var(--gutter); background:rgba(255,255,255,0.86); backdrop-filter:blur(14px) saturate(140%); -webkit-backdrop-filter:blur(14px) saturate(140%); border-bottom:1px solid var(--line);
}
.arz-root .burger {
  width:34px; height:34px; display:grid; place-items:center;
}
.arz-root .nojs-links {
  display:none; gap:1.1rem;
}
.arz-root .nojs-links a {
  font-size:0.78rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);
}
.arz-root.arz-static .nojs-links {
  display:flex;
}
.arz-root.arz-static .burger {
  display:none;
}
.arz-root.arz-static .topbar {
  gap:1.2rem; flex-wrap:wrap;
}
.arz-root .burger span {
  display:block; width:19px; height:1px; background:var(--ink); position:relative;
}
.arz-root .burger span::before, .arz-root .burger span::after {
  content:""; position:absolute; left:0; width:19px; height:1px; background:var(--ink); transition:transform 0.35s var(--ease), top 0.35s var(--ease);
}
.arz-root .burger span::before {
  top:-6px;
}
.arz-root .burger span::after {
  top:6px;
}
.arz-root .sheet-menu {
  position:fixed; inset:0; z-index:90; background:var(--sheet); display:flex; flex-direction:column; justify-content:center; gap:0.2rem; padding:var(--gutter); opacity:0; visibility:hidden; transition:opacity 0.45s var(--ease-soft), visibility 0.45s;
}
.arz-root .sheet-menu.open {
  opacity:1; visibility:visible;
}
.arz-root .sheet-menu a {
  font-family:var(--head); font-size:clamp(1.9rem,9vw,3rem); letter-spacing:-0.03em; padding:0.28rem 0; display:flex; align-items:baseline; gap:0.8rem; border-bottom:1px solid var(--line);
}
.arz-root .sheet-menu a .idx {
  font-family:var(--body); font-size:0.7rem; color:var(--dim); letter-spacing:0.16em;
}
.arz-root .sheet-menu .close {
  position:absolute; top:1rem; right:var(--gutter); font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase;
}
.arz-root .main {
  flex:1 1 auto; min-width:0;
}
.arz-root section {
  position:relative;
}
.arz-root .pad {
  padding:clamp(4.5rem,9vw,9.5rem) var(--gutter);
}
.arz-root .pad-tight {
  padding:clamp(3rem,6vw,6rem) var(--gutter);
}
.arz-root [id] {
  scroll-margin-top:1rem;
}
.arz-root .project[id] {
  scroll-margin-top:clamp(1rem,4vw,3rem);
}
.arz-root.arz-anim .reveal {
  opacity:0; transform:translateY(26px); transition:opacity 0.9s var(--ease-soft), transform 1.1s var(--ease);
}
.arz-root.arz-anim .reveal.in {
  opacity:1; transform:none;
}
.arz-root.arz-static .reveal {
  opacity:1; transform:none;
}
.arz-root.arz-anim .reveal-line {
  overflow:hidden;
}
.arz-root.arz-anim .reveal-line > * {
  display:block; transform:translateY(105%); transition:transform 1.05s var(--ease);
}
.arz-root.arz-anim .reveal-line.in > * {
  transform:none;
}
.arz-root.arz-static .reveal-line > * {
  transform:none;
}
.arz-root .figure {
  position:relative; overflow:hidden; background:var(--line); border-radius:var(--radius);
}
.arz-root .figure img {
  width:100%; height:100%; object-fit:cover; filter:var(--photo-filter);
}
.arz-root.arz-anim .figure .curtain {
  position:absolute; inset:0; background:var(--sheet); transform-origin:bottom; transition:transform 1.15s var(--ease); z-index:2;
}
.arz-root.arz-anim .figure.in .curtain {
  transform:scaleY(0);
}
.arz-root.arz-anim .figure img {
  transform:scale(1.16); transition:transform 1.6s var(--ease);
}
.arz-root.arz-anim .figure.in img {
  transform:scale(1);
}
.arz-root.arz-static .figure .curtain {
  display:none;
}
.arz-root .hero {
  padding:clamp(1rem,1.6vw,1.6rem); height:calc(100svh - 2 * var(--frame)); min-height:560px; display:flex; flex-direction:column;
}
.arz-root .hero-head {
  display:flex; flex-wrap:wrap; gap:1rem 2rem; align-items:flex-end; justify-content:space-between; padding:clamp(1rem,2vw,1.6rem) clamp(0.6rem,1vw,1rem) clamp(1.4rem,2.4vw,2rem);
}
.arz-root .hero-head h1 {
  font-size:clamp(1.5rem,2.6vw,2.3rem); max-width:22ch; letter-spacing:-0.03em; line-height:1.06;
}
.arz-root .hero-head .meta {
  display:flex; gap:clamp(1.2rem,3vw,3rem); flex-wrap:wrap;
}
.arz-root .hero-grid {
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(2,minmax(0,1fr)); gap:clamp(0.5rem,0.9vw,0.9rem); flex:1 1 auto; min-height:0;
}
.arz-root .tile-wrap {
  min-height:0; height:100%;
}
.arz-root .tile {
  position:relative; overflow:hidden; border-radius:var(--radius); height:100%; min-height:0; background:var(--line); display:block;
}
.arz-root .tile img {
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:var(--photo-filter); transition:transform 1.4s var(--ease), filter 0.6s ease; will-change:transform;
}
.arz-root .tile:hover img {
  transform:scale(1.06);
}
.arz-root .tile::after {
  content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(12,12,10,0.62) 0%, rgba(12,12,10,0.16) 34%, transparent 62%); opacity:0.9; transition:opacity 0.6s ease;
}
.arz-root .tile:hover::after {
  opacity:1;
}
.arz-root .tile-label {
  position:absolute; left:clamp(0.9rem,1.6vw,1.5rem); bottom:clamp(0.85rem,1.5vw,1.4rem); right:clamp(0.9rem,1.6vw,1.5rem); z-index:3; color:#fff; display:flex; align-items:flex-end; justify-content:space-between; gap:1rem;
}
.arz-root .tile-label .name {
  font-family:var(--head); font-weight:500; font-size:clamp(0.95rem,1.35vw,1.22rem); letter-spacing:-0.01em; transform:translateY(0); transition:transform 0.6s var(--ease);
}
.arz-root .tile-label .place {
  font-size:0.68rem; letter-spacing:0.16em; text-transform:uppercase; opacity:0; transform:translateY(8px); transition:opacity 0.5s ease, transform 0.6s var(--ease); color:rgba(255,255,255,0.82);
}
.arz-root .tile:hover .tile-label .name {
  transform:translateY(-3px);
}
.arz-root .tile:hover .tile-label .place {
  opacity:1; transform:none;
}
.arz-root .tile .idx {
  position:absolute; top:clamp(0.8rem,1.4vw,1.3rem); left:clamp(0.9rem,1.6vw,1.5rem); z-index:3; font-size:0.66rem; letter-spacing:0.2em; color:rgba(255,255,255,0.72);
}
.arz-root.arz-anim .tile {
  clip-path:inset(0 0 100% 0); transition:clip-path 1.2s var(--ease);
}
.arz-root.arz-anim .tile-wrap.in .tile {
  clip-path:inset(0 0 0 0);
}
.arz-root.arz-static .tile {
  clip-path:none;
}
.arz-root .scroll-cue {
  display:flex; align-items:center; gap:0.7rem; padding:clamp(1.2rem,2vw,1.8rem) clamp(0.6rem,1vw,1rem) 0.4rem; color:var(--dim); font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase;
}
.arz-root .scroll-cue .bar {
  width:46px; height:1px; background:var(--line); position:relative; overflow:hidden;
}
.arz-root .scroll-cue .bar::after {
  content:""; position:absolute; inset:0; background:var(--accent); transform:translateX(-100%); animation:arz-cue 2.6s var(--ease) infinite;
}
@keyframes arz-cue {
  0% {
    transform:translateX(-100%);
  }
  55% {
    transform:translateX(0);
  }
  100% {
    transform:translateX(100%);
  }
}
.arz-root .statement {
  border-top:1px solid var(--line);
}
.arz-root .statement .words {
  font-family:var(--head); font-size:clamp(1.6rem,3.5vw,3rem); line-height:1.18; letter-spacing:-0.03em; max-width:22ch;
}
.arz-root .statement .words span {
  display:inline-block; opacity:0.16; transition:opacity 0.6s var(--ease-soft), transform 0.7s var(--ease);
}
.arz-root .statement .words span.lit {
  opacity:1;
}
.arz-root.arz-static .statement .words span {
  opacity:1;
}
.arz-root .statement-grid {
  display:grid; grid-template-columns:minmax(0,1fr) minmax(0,0.62fr); gap:clamp(2rem,5vw,5rem); align-items:start;
}
.arz-root .statement-side {
  display:flex; flex-direction:column; gap:1.6rem;
}
.arz-root .sign {
  font-family:'Instrument Serif', Georgia, serif; font-style:italic; font-size:1.5rem; color:var(--ink);
}
.arz-root .work-head {
  display:flex; justify-content:space-between; align-items:flex-end; gap:2rem; flex-wrap:wrap; margin-bottom:clamp(2rem,4vw,3.4rem);
}
.arz-root .project {
  position:relative; padding-top:clamp(1.6rem,3vw,2.6rem); margin-bottom:clamp(3rem,7vw,7rem); border-top:1px solid var(--line);
}
.arz-root .project-top {
  display:flex; justify-content:space-between; align-items:flex-start; gap:1.5rem; margin-bottom:clamp(1.2rem,2.4vw,2rem); flex-wrap:wrap;
}
.arz-root .project h3 {
  font-size:clamp(1.6rem,3vw,2.6rem);
}
.arz-root .project .tags {
  display:flex; gap:1.4rem; flex-wrap:wrap;
}
.arz-root .project-figure {
  position:relative; overflow:hidden; border-radius:var(--radius); aspect-ratio:16/9; background:var(--line);
}
.arz-root .project-figure img {
  width:100%; height:118%; object-fit:cover; filter:var(--photo-filter); will-change:transform;
}
.arz-root .project-body {
  display:grid; grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr); gap:clamp(1.5rem,4vw,4rem); margin-top:clamp(1.2rem,2.4vw,2rem); align-items:start;
}
.arz-root .spec {
  display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:1.2rem 1.6rem;
}
.arz-root .spec .k {
  font-size:0.64rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--dim); display:block; margin-bottom:0.3rem;
}
.arz-root .spec .v {
  font-size:0.92rem;
}
.arz-root .link-more {
  display:inline-flex; align-items:center; gap:0.6rem; margin-top:1.4rem; font-size:0.78rem; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink); padding-bottom:0.35rem; border-bottom:1px solid var(--ink); transition:gap 0.45s var(--ease), color 0.35s ease, border-color 0.35s ease;
}
.arz-root .link-more:hover {
  gap:1.1rem; color:var(--accent); border-color:var(--accent);
}
.arz-root .numbers {
  background:var(--ink); color:var(--sheet); border-radius:var(--radius);
}
.arz-root .numbers .grid {
  display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:clamp(1.6rem,3vw,3rem);
}
.arz-root .numbers .n {
  font-family:var(--head); font-size:clamp(2.4rem,5vw,4rem); letter-spacing:-0.04em; line-height:1;
}
.arz-root .numbers .n span {
  color:var(--accent);
}
.arz-root .numbers .k {
  margin-top:0.7rem; font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.55);
}
.arz-root .studio-grid {
  display:grid; grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr); gap:clamp(2rem,5vw,5rem); align-items:start;
}
.arz-root .studio-figure {
  aspect-ratio:3/4;
}
.arz-root .studio-figure img {
  height:114%;
}
.arz-root .studio-text > * + * {
  margin-top:1.5rem;
}
.arz-root .bullets {
  display:flex; flex-direction:column; gap:0.9rem; margin-top:2rem;
}
.arz-root .bullets li {
  display:flex; gap:0.9rem; align-items:baseline; list-style:none; font-size:0.95rem; color:var(--muted);
}
.arz-root .bullets ul {
  margin:0; padding:0;
}
.arz-root .bullets .dot {
  width:5px; height:5px; border-radius:50%; background:var(--accent); flex:0 0 auto; transform:translateY(-2px);
}
.arz-root .process-grid {
  display:grid; grid-template-columns:minmax(0,0.7fr) minmax(0,1.3fr); gap:clamp(2rem,5vw,5rem); align-items:start;
}
.arz-root .process-sticky {
  position:sticky; top:clamp(2rem,12vh,7rem);
}
.arz-root .step {
  border-top:1px solid var(--line); padding:clamp(1.4rem,2.6vw,2.2rem) 0; display:grid; grid-template-columns:auto 1fr; gap:clamp(1rem,2.4vw,2.4rem); transition:opacity 0.6s var(--ease-soft);
}
.arz-root.arz-anim .step {
  opacity:0.35;
}
.arz-root.arz-anim .step.lit {
  opacity:1;
}
.arz-root.arz-static .step {
  opacity:1;
}
.arz-root .step .num {
  font-family:var(--head); font-size:0.8rem; color:var(--accent); letter-spacing:0.1em; padding-top:0.35rem;
}
.arz-root .step h4 {
  font-size:clamp(1.15rem,1.8vw,1.5rem); margin-bottom:0.6rem;
}
.arz-root .step p {
  color:var(--muted); font-size:0.95rem; font-weight:300;
}
.arz-root .svc {
  border-top:1px solid var(--line);
}
.arz-root .svc-row {
  display:grid; grid-template-columns:auto minmax(0,0.8fr) clamp(130px,14vw,200px) minmax(0,28ch); align-items:center; gap:clamp(1rem,2.4vw,2.6rem); padding:clamp(1.4rem,2.8vw,2.4rem) 0; border-bottom:1px solid var(--line); position:relative; cursor:pointer;
}
.arz-root .svc-row .title {
  font-family:var(--head); font-size:clamp(1.3rem,2.6vw,2.2rem); letter-spacing:-0.02em; transition:transform 0.6s var(--ease), color 0.4s ease;
}
.arz-root .svc-row .no {
  font-size:0.66rem; letter-spacing:0.2em; color:var(--dim); align-self:center;
}
.arz-root .svc-row .desc {
  color:var(--muted); font-size:0.9rem; font-weight:300;
}
.arz-root .svc-row:hover .title {
  transform:translateX(10px); color:var(--accent);
}
.arz-root .svc-row::before {
  content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px; background:var(--accent); transform:scaleX(0); transform-origin:left; transition:transform 0.7s var(--ease);
}
.arz-root .svc-row:hover::before {
  transform:scaleX(1);
}
.arz-root .svc-shot {
  position:relative; overflow:hidden; border-radius:var(--radius); height:clamp(56px,5.4vw,82px); align-self:center;
}
.arz-root .svc-shot img {
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:var(--photo-filter); transform:translateX(-104%); opacity:0; transition:transform 0.85s var(--ease), opacity 0.45s var(--ease-soft);
}
.arz-root .svc-row:hover .svc-shot img, .arz-root .svc-row:focus-within .svc-shot img {
  transform:translateX(0); opacity:1;
}
.arz-root .rail-wrap {
  overflow:hidden; padding-bottom:clamp(2rem,4vw,4rem);
}
.arz-root .rail {
  display:flex; gap:clamp(0.8rem,1.6vw,1.4rem); will-change:transform;
}
.arz-root .rail-item {
  flex:0 0 clamp(230px,26vw,360px);
}
.arz-root .rail-item .figure {
  aspect-ratio:1/1;
}
.arz-root .rail-item .cap {
  display:flex; justify-content:space-between; gap:1rem; margin-top:0.8rem;
}
.arz-root .award {
  display:grid; grid-template-columns:auto 1fr auto; gap:clamp(1rem,3vw,3rem); padding:clamp(1rem,1.8vw,1.5rem) 0; border-bottom:1px solid var(--line); align-items:baseline;
}
.arz-root .award .yr {
  font-variant-numeric:tabular-nums; color:var(--accent); font-size:0.82rem; letter-spacing:0.1em; display:inline-block; min-width:4ch;
}
.arz-root .award .what {
  font-family:var(--head); font-size:clamp(1rem,1.5vw,1.25rem);
}
.arz-root .award .where {
  font-size:0.8rem; color:var(--dim); text-align:right;
}
.arz-root .marquee {
  overflow:hidden; border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:clamp(1rem,2vw,1.6rem) 0; margin-top:clamp(2rem,4vw,3.5rem);
}
.arz-root .marquee-track {
  display:flex; gap:3.5rem; width:max-content; animation:arz-slide var(--marquee-speed,34s) linear infinite;
}
.arz-root .marquee span {
  font-family:var(--head); font-size:clamp(1rem,1.6vw,1.35rem); color:var(--dim); white-space:nowrap; letter-spacing:-0.01em;
}
@keyframes arz-slide {
  to {
    transform:translateX(-50%);
  }
}
.arz-root .marquee:hover .marquee-track {
  animation-play-state:paused;
}
.arz-root .quotes {
  border-top:1px solid var(--line);
}
.arz-root .quote {
  display:none;
}
.arz-root .quote.on {
  display:block;
}
.arz-root .quote blockquote {
  margin:0; font-family:'Instrument Serif', Georgia, serif; font-size:clamp(1.4rem,3.2vw,2.5rem); line-height:1.24; letter-spacing:-0.01em; max-width:24ch;
}
.arz-root .quote .who {
  margin-top:1.6rem; font-size:0.82rem; color:var(--muted);
}
.arz-root .quote .who b {
  font-weight:500; color:var(--ink);
}
.arz-root .dots {
  display:flex; gap:0.6rem; margin-top:2.2rem;
}
.arz-root .dots button {
  width:26px; height:2px; background:var(--line); transition:background 0.4s ease;
}
.arz-root .dots button.on {
  background:var(--accent);
}
.arz-root .contact-grid {
  display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:clamp(2rem,5vw,5rem); align-items:start;
}
.arz-root .field {
  position:relative; margin-bottom:1.6rem;
}
.arz-root .field input, .arz-root .field textarea {
  width:100%; background:transparent; border:0; border-bottom:1px solid var(--line); padding:0.85rem 0; font:inherit; font-size:0.95rem; color:var(--ink); outline:none; transition:border-color 0.4s ease;
}
.arz-root .field textarea {
  resize:vertical; min-height:110px;
}
.arz-root .field label {
  position:absolute; left:0; top:0.85rem; font-size:0.95rem; color:var(--dim); pointer-events:none; transition:transform 0.4s var(--ease), font-size 0.4s var(--ease), color 0.4s ease; transform-origin:left top;
}
.arz-root .field input:focus, .arz-root .field textarea:focus {
  border-color:var(--ink);
}
.arz-root .field input:focus + label, .arz-root .field textarea:focus + label, .arz-root .field input:not(:placeholder-shown) + label, .arz-root .field textarea:not(:placeholder-shown) + label {
  transform:translateY(-1.35rem) scale(0.72); color:var(--muted);
}
.arz-root .hp {
  position:absolute; left:-9999px; opacity:0; height:0; width:0;
}
.arz-root .btn {
  display:inline-flex; align-items:center; gap:0.8rem; padding:0.95rem 1.9rem; background:var(--ink); color:var(--sheet); border-radius:999px; font-size:0.8rem; letter-spacing:0.16em; text-transform:uppercase; position:relative; overflow:hidden; transition:transform 0.5s var(--ease), background 0.4s ease;
}
.arz-root .btn span {
  position:relative; z-index:2;
}
.arz-root .btn::before {
  content:""; position:absolute; inset:0; background:var(--accent); transform:translateY(101%); transition:transform 0.55s var(--ease); z-index:1;
}
.arz-root .btn:hover::before {
  transform:translateY(0);
}
.arz-root .btn:hover {
  transform:translateY(-2px);
}
.arz-root .sent {
  display:none; align-items:center; gap:0.7rem; color:var(--accent); font-size:0.9rem; margin-top:1rem;
}
.arz-root .sent.on {
  display:flex;
}
.arz-root .contact-info {
  display:flex; flex-direction:column; gap:clamp(1.4rem,2.6vw,2.2rem);
}
.arz-root .info-row .k {
  font-size:0.64rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--dim); display:block; margin-bottom:0.45rem;
}
.arz-root .info-row .v {
  font-size:1rem; line-height:1.6;
}
.arz-root .info-row a:hover {
  color:var(--accent);
}
.arz-root .map {
  width:100%; aspect-ratio:16/10; border:0; border-radius:var(--radius); filter:grayscale(1) contrast(1.06); background:var(--line);
}
.arz-root .footer {
  border-top:1px solid var(--line); padding:clamp(3rem,6vw,5rem) var(--gutter) clamp(1.6rem,3vw,2.4rem);
}
.arz-root .footer-word {
  font-family:var(--head); font-weight:700; letter-spacing:0.02em; line-height:0.86; font-size:clamp(3rem,13vw,11rem); color:var(--ink); white-space:nowrap; transform-origin:left bottom;
}
.arz-root .footer-bottom {
  display:flex; justify-content:space-between; align-items:center; gap:1.5rem; flex-wrap:wrap; margin-top:clamp(2rem,4vw,3rem); padding-top:1.4rem; border-top:1px solid var(--line);
}
.arz-root .to-top {
  display:inline-flex; align-items:center; gap:0.6rem; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); transition:color 0.35s ease;
}
.arz-root .to-top:hover {
  color:var(--ink);
}
.arz-root .grain {
  position:fixed; inset:-10%; z-index:200; pointer-events:none; opacity:0.04; mix-blend-mode:multiply; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}
@media (max-width:1100px) {
  .arz-root {
    --sidebar-w:210px;
  }
  .arz-root .statement-grid, .arz-root .studio-grid, .arz-root .process-grid, .arz-root .contact-grid, .arz-root .project-body {
    grid-template-columns:1fr;
  }
  .arz-root .process-sticky {
    position:static;
  }
}
@media (max-width:860px) {
  .arz-root {
    --frame:0px; --radius:0px;
  }
  .arz-root .sidebar {
    display:none;
  }
  .arz-root .topbar {
    display:flex;
  }
  .arz-root .hero {
    height:auto; min-height:0;
  }
  .arz-root .hero-grid {
    grid-template-columns:1fr; grid-template-rows:none; min-height:0;
  }
  .arz-root .tile-wrap {
    height:auto;
  }
  .arz-root .tile {
    aspect-ratio:3/2; height:auto;
  }
  .arz-root .svc-row {
    grid-template-columns:auto minmax(0,1fr) 64px;
  }
  .arz-root .svc-shot {
    height:48px;
  }
  .arz-root .svc-shot img {
    transform:translateX(0); opacity:1;
  }
  .arz-root .svc-row .desc {
    display:none;
  }
  .arz-root .award {
    grid-template-columns:auto 1fr;
  }
  .arz-root .award .where {
    grid-column:2; text-align:left;
  }
  .arz-root .rail-item {
    flex:0 0 74vw;
  }
}
@media (prefers-reduced-motion:reduce) {
  .arz-root {
    scroll-behavior:auto;
  }
  .arz-root *, .arz-root *::before, .arz-root *::after {
    animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important;
  }
  .arz-root.arz-anim .reveal, .arz-root.arz-anim .reveal-line > *, .arz-root.arz-anim .tile, .arz-root.arz-anim .figure img {
    opacity:1 !important; transform:none !important; clip-path:none !important;
  }
}
`

const DEFAULTS = {
    desk: "#eceae6",
    sheet: "#ffffff",
    ink: "#14140f",
    muted: "#77746c",
    dim: "#a5a19a",
    line: "#e4e1db",
    accent: "#a6613d",
}

const HEAD_FONTS: Record<string, string> = {
    grotesk: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
    serif: "'Instrument Serif', Georgia, serif",
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

/** A colour the buyer picked can arrive as hex, rgb() or rgba(); the soft
 *  accent behind hover states needs it as translucent rgba either way. */
function toRgba(color: string, alpha: number, fallback: string): string {
    const c = (color || fallback).trim()
    const hex = c.replace("#", "")
    if (/^[0-9a-f]{3}$/i.test(hex) || /^[0-9a-f]{6}$/i.test(hex)) {
        const full =
            hex.length === 3
                ? hex
                      .split("")
                      .map((h) => h + h)
                      .join("")
                : hex
        const n = parseInt(full, 16)
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
    }
    const m = c.match(/rgba?\(([^)]+)\)/i)
    if (m) {
        const parts = m[1].split(",").map((p) => p.trim())
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
    }
    return toRgba(fallback, alpha, "#000000")
}

/** A street address, not a Maps link — Google places the pin from the query. */
function mapUrl(address?: string, zoom?: number): string | null {
    if (!address || !address.trim()) return null
    return `https://www.google.com/maps?q=${encodeURIComponent(
        address.trim()
    )}&z=${zoom || 14}&output=embed`
}

const onCanvas = () => RenderTarget.current() === RenderTarget.canvas

/**
 * An empty image slot draws its own expected size while you work, so a missing
 * photograph is visible at a glance and nobody has to look the dimensions up in
 * a guide. It never renders on the published site.
 */
function Slot({ label }: { label: string }) {
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
                border: "1px dashed rgba(20,20,15,0.28)",
                borderRadius: 3,
                background: "rgba(20,20,15,0.035)",
                color: "rgba(20,20,15,0.5)",
                font: "500 11px/1.4 'Inter', system-ui, sans-serif",
                letterSpacing: "0.06em",
                pointerEvents: "none",
                zIndex: 4,
            }}
        >
            {label}
        </div>
    )
}

const SOCIAL_PATHS: Record<string, string> = {
    facebook:
        "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.11V9.9H7.6V13h2.7v8h3.2z",
    x: "M17.5 3h3l-6.6 7.5L21.7 21h-5.9l-4.2-5.5L6.6 21H3.5l7-8-6.8-10h6l3.8 5.1L17.5 3zm-1.1 16.2h1.7L8.3 4.7H6.5l9.9 14.5z",
    instagram:
        "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.55.21.95.47 1.36.88.41.41.67.81.88 1.36.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2-.21.55-.47.95-.88 1.36-.41.41-.81.67-1.36.88-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42a3.7 3.7 0 01-1.36-.88 3.7 3.7 0 01-.88-1.36c-.17-.4-.37-1-.42-2.2C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.21-.55.47-.95.88-1.36.41-.41.81-.67 1.36-.88.4-.17 1-.37 2.2-.42C8.4 2.21 8.8 2.2 12 2.2zm0 3.24A6.56 6.56 0 1018.56 12 6.56 6.56 0 0012 5.44zm0 10.82A4.26 4.26 0 1116.26 12 4.26 4.26 0 0112 16.26zm8.35-11.08a1.53 1.53 0 11-1.53-1.53 1.53 1.53 0 011.53 1.53z",
    linkedin:
        "M6.94 8.5H3.8V21h3.14V8.5zM5.37 3A1.82 1.82 0 103.55 4.82 1.82 1.82 0 005.37 3zM21 14.1c0-3.36-1.8-4.92-4.2-4.92a3.62 3.62 0 00-3.28 1.8h-.05V8.5H10.4V21h3.14v-6.19c0-1.63.31-3.2 2.33-3.2s2 1.85 2 3.3V21H21z",
    pinterest:
        "M12 2a10 10 0 00-3.65 19.3 9.6 9.6 0 01.07-2.86c.18-.78 1.18-5 1.18-5a3.6 3.6 0 01-.3-1.48c0-1.39.8-2.42 1.8-2.42a1.25 1.25 0 011.26 1.4c0 .85-.55 2.13-.83 3.31a1.44 1.44 0 001.47 1.8c1.77 0 3.13-1.86 3.13-4.55a3.92 3.92 0 00-4.15-4.04 4.3 4.3 0 00-4.48 4.31 3.86 3.86 0 00.74 2.27.3.3 0 01.07.28c-.08.32-.26 1-.29 1.15s-.15.23-.35.14c-1.3-.6-2.11-2.5-2.11-4.03 0-3.28 2.38-6.29 6.87-6.29a6.1 6.1 0 016.41 6c0 3.58-2.26 6.47-5.4 6.47a2.78 2.78 0 01-2.38-1.2l-.65 2.47a11.6 11.6 0 01-1.3 2.73A10 10 0 1012 2z",
    behance:
        "M9.1 6.5c1.9 0 3.2 1 3.2 2.7a2.2 2.2 0 01-1.5 2.2 2.5 2.5 0 011.9 2.6c0 2.1-1.7 3.1-3.7 3.1H2V6.5h7.1zm-.5 4.1c.8 0 1.3-.4 1.3-1.1s-.5-1.1-1.3-1.1H4.6v2.2h4zm.2 4.6c.9 0 1.5-.4 1.5-1.2s-.6-1.2-1.5-1.2H4.6v2.4h4.2zM19 9.6c2.2 0 3.6 1.6 3.6 4v.6h-5.5a1.8 1.8 0 002 1.7 1.6 1.6 0 001.5-.8h2a3.5 3.5 0 01-3.6 2.5 3.9 3.9 0 01-4-4.1 3.9 3.9 0 014-3.9zm1.5 3.2A1.6 1.6 0 0019 11.2a1.7 1.7 0 00-1.8 1.6h3.3zM21.7 7.2h-5.2v1.4h5.2z",
}

const SocialIcon = ({ network }: { network: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={SOCIAL_PATHS[network] || SOCIAL_PATHS.instagram} />
    </svg>
)

// ---------------------------------------------------------------------------
// props
// ---------------------------------------------------------------------------

interface LinkItem { label?: string; href?: string }
interface SocialItem { network?: string; url?: string }
interface TileItem { image?: any; name?: string; place?: string; href?: string }
interface ProjectItem {
    kicker?: string; title?: string; location?: string; year?: string; area?: string
    image?: any; text?: string
    k1?: string; v1?: string; k2?: string; v2?: string
    k3?: string; v3?: string; k4?: string; v4?: string
    linkLabel?: string; linkHref?: string
}
interface NumberItem { value?: number; label?: string }
interface StepItem { title?: string; text?: string }
interface ServiceItem { title?: string; text?: string; image?: any }
interface DetailItem { image?: any; caption?: string; place?: string }
interface AwardItem { year?: string; what?: string; where?: string }
interface QuoteItem { text?: string; name?: string; role?: string }

interface StyleGroup {
    palette?: string
    desk?: string; sheet?: string; ink?: string; muted?: string
    dim?: string; line?: string; accent?: string
    headingFont?: string; photoMode?: string
    grain?: boolean; framed?: boolean; corner?: number; sidebarWidth?: number
}

interface Props {
    sidebar?: any
    globalStyle?: StyleGroup
    hero?: any
    manifesto?: any
    work?: any
    numbers?: any
    studio?: any
    process?: any
    services?: any
    details?: any
    awards?: any
    quotes?: any
    contact?: any
    footer?: any
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 6400
 */
export default function ArchizenSite(props: Props) {
    const side = props.sidebar || {}
    const gs = props.globalStyle || {}
    const hero = props.hero || {}
    const manifesto = props.manifesto || {}
    const work = props.work || {}
    const numbers = props.numbers || {}
    const studio = props.studio || {}
    const process = props.process || {}
    const services = props.services || {}
    const details = props.details || {}
    const awards = props.awards || {}
    const quotes = props.quotes || {}
    const contact = props.contact || {}
    const footer = props.footer || {}

    const canvas = onCanvas()

    // Framer stores control values on the placed instance and gives a component
    // no way to write its own props, so nothing here can wipe what the buyer
    // typed into the colour fields. "Original palette" therefore means "ignore
    // those fields", and the fields are hidden while it is chosen so the panel
    // never shows one colour while the page renders another.
    const original = (gs.palette || "custom") === "original"
    const pick = (v: string | undefined, d: string) => (original ? d : v || d)
    const accent = pick(gs.accent, DEFAULTS.accent)

    const rootStyle = {
        "--desk": pick(gs.desk, DEFAULTS.desk),
        "--sheet": pick(gs.sheet, DEFAULTS.sheet),
        "--ink": pick(gs.ink, DEFAULTS.ink),
        "--muted": pick(gs.muted, DEFAULTS.muted),
        "--dim": pick(gs.dim, DEFAULTS.dim),
        "--line": pick(gs.line, DEFAULTS.line),
        "--accent": accent,
        "--accent-soft": toRgba(accent, 0.12, DEFAULTS.accent),
        "--head": HEAD_FONTS[gs.headingFont || "grotesk"] || HEAD_FONTS.grotesk,
        "--photo-filter":
            (gs.photoMode || "color") === "mono" ? "grayscale(1) contrast(1.04)" : "none",
        "--frame": gs.framed === false ? "0px" : "clamp(0px, 2.2vw, 28px)",
        "--radius": `${gs.corner === undefined ? 3 : gs.corner}px`,
        "--sidebar-w": `${gs.sidebarWidth || 250}px`,
        "--marquee-speed": `${awards.marqueeSpeed || 34}s`,
        width: "100%",
        ...props.style,
    } as React.CSSProperties

    // ---- content -----------------------------------------------------------
    const navLinks: LinkItem[] = side.links && side.links.length ? side.links : []
    const socials: SocialItem[] = side.socials && side.socials.length ? side.socials : []
    const tiles: TileItem[] = hero.tiles && hero.tiles.length ? hero.tiles : []
    const projects: ProjectItem[] = work.projects && work.projects.length ? work.projects : []
    const stats: NumberItem[] = numbers.items && numbers.items.length ? numbers.items : []
    const bullets: { text?: string }[] = studio.bullets && studio.bullets.length ? studio.bullets : []
    const steps: StepItem[] = process.steps && process.steps.length ? process.steps : []
    const svcItems: ServiceItem[] = services.items && services.items.length ? services.items : []
    const railItems: DetailItem[] = details.items && details.items.length ? details.items : []
    const awardItems: AwardItem[] = awards.items && awards.items.length ? awards.items : []
    const marqueeWords: { word?: string }[] =
        awards.marquee && awards.marquee.length ? awards.marquee : []
    const quoteItems: QuoteItem[] = quotes.items && quotes.items.length ? quotes.items : []

    const words = String(manifesto.text || "").trim().split(/\s+/).filter(Boolean)

    // ---- state -------------------------------------------------------------
    const rootRef = React.useRef<HTMLDivElement>(null)
    const formRef = React.useRef<HTMLFormElement>(null)
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [quoteAt, setQuoteAt] = React.useState(0)
    const [sent, setSent] = React.useState(false)

    // ---- the scroll engine -------------------------------------------------
    // One effect owns every scroll-driven state on the page: reveals, parallax,
    // the manifesto lighting word by word, the process steps, the counters, the
    // sideways details rail, the reading progress and the active menu link.
    React.useEffect(() => {
        const root = rootRef.current
        if (!root || canvas) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel))

        // Anything that starts clipped is watched through its wrapper, because
        // an element with no area never reports itself as intersecting and
        // would stay hidden on the live site for ever.
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return
                    e.target.classList.add("in")
                    io.unobserve(e.target)
                })
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        )
        q<HTMLElement>(".reveal, .reveal-line, .figure, .tile-wrap").forEach((el) => {
            // Stagger by where the element sits in its own list, so a row of
            // awards arrives one after another instead of in a rhythm set by
            // whatever else the page happens to reveal.
            const among = Array.prototype.indexOf.call(el.parentElement?.children || [], el)
            el.style.transitionDelay = (Math.max(0, among) % 6) * 80 + "ms"
            io.observe(el)
        })

        const counterIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return
                    const el = e.target as HTMLElement
                    counterIo.unobserve(el)
                    const to = parseFloat(el.dataset.count || "0") || 0
                    if (reduce) {
                        el.textContent = String(to)
                        return
                    }
                    const start = performance.now()
                    const dur = parseFloat(el.dataset.countMs || "") || 1400
                    const tick = (now: number) => {
                        const p = Math.min(1, (now - start) / dur)
                        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))))
                        if (p < 1) requestAnimationFrame(tick)
                    }
                    requestAnimationFrame(tick)
                })
            },
            { threshold: 0.4 }
        )
        q<HTMLElement>("[data-count]").forEach((c) => counterIo.observe(c))

        const navAnchors = q<HTMLAnchorElement>(".side-nav a")
        const sectionIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return
                    navAnchors.forEach((a) =>
                        a.classList.toggle(
                            "active",
                            a.getAttribute("data-target") === e.target.id
                        )
                    )
                })
            },
            { rootMargin: "-45% 0px -50% 0px" }
        )
        navAnchors.forEach((a) => {
            const id = a.getAttribute("data-target")
            const el = id ? root.querySelector("#" + id) : null
            if (el) sectionIo.observe(el)
        })

        const parallax = q<HTMLElement>("[data-parallax]")
        const rail = root.querySelector<HTMLElement>(".rail")
        const railWrap = root.querySelector<HTMLElement>(".rail-wrap")
        const footWord = root.querySelector<HTMLElement>(".footer-word")
        const progress = root.querySelector<HTMLElement>(".progress")
        const wordSpans = q<HTMLElement>(".words span")
        const wordsBox = root.querySelector<HTMLElement>(".words")
        const stepEls = q<HTMLElement>(".step")

        let ticking = false
        const frame = () => {
            ticking = false
            const vh = window.innerHeight

            if (!reduce) {
                parallax.forEach((el) => {
                    const r = el.getBoundingClientRect()
                    if (r.bottom < -200 || r.top > vh + 200) return
                    const mid = (r.top + r.height / 2 - vh / 2) / vh
                    const amt = parseFloat(el.dataset.parallax || "0.1") || 0.1
                    el.style.transform = `translate3d(0, ${(mid * amt * -100).toFixed(2)}px, 0)`
                })

                // the details rail runs sideways while its section crosses the screen
                if (rail && railWrap) {
                    const rw = railWrap.getBoundingClientRect()
                    if (rw.bottom > 0 && rw.top < vh) {
                        const span = rail.scrollWidth - railWrap.clientWidth
                        if (span > 0) {
                            const t = Math.max(0, Math.min(1, (vh - rw.top) / (vh + rw.height)))
                            rail.style.transform = `translate3d(${(-t * span).toFixed(1)}px, 0, 0)`
                        }
                    }
                }

                if (footWord) {
                    const fr = footWord.getBoundingClientRect()
                    if (fr.top < vh && fr.bottom > 0) {
                        const f = Math.max(0, Math.min(1, (vh - fr.top) / vh))
                        footWord.style.transform = `scale(${(0.94 + f * 0.06).toFixed(3)})`
                        footWord.style.opacity = (0.35 + f * 0.65).toFixed(2)
                    }
                }
            }

            if (progress) {
                const h = document.documentElement.scrollHeight - vh
                progress.style.height = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%"
            }

            if (wordsBox && wordSpans.length) {
                const r = wordsBox.getBoundingClientRect()
                const t = Math.max(
                    0,
                    Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.28))
                )
                const lit = Math.round(t * wordSpans.length)
                wordSpans.forEach((s, i) => s.classList.toggle("lit", i < lit))
            }

            const line = vh * 0.62
            stepEls.forEach((s) => {
                const r = s.getBoundingClientRect()
                s.classList.toggle("lit", r.top < line && r.bottom > 0)
            })
        }
        const onScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(frame)
            }
        }
        frame()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            io.disconnect()
            counterIo.disconnect()
            sectionIo.disconnect()
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [
        canvas,
        tiles.length,
        projects.length,
        stats.length,
        steps.length,
        railItems.length,
        awardItems.length,
        words.length,
        hero.showHero,
        work.showSection,
        numbers.showSection,
        studio.showSection,
        process.showSection,
        details.showSection,
        awards.showSection,
        contact.showSection,
        footer.showSection,
    ])

    // Hero tiles answer the pointer, the way a model does when you lean over it.
    React.useEffect(() => {
        const root = rootRef.current
        if (!root || canvas) return
        if (!window.matchMedia("(pointer:fine)").matches) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const tileEls = Array.from(root.querySelectorAll<HTMLElement>(".tile[data-tilt]"))
        const offs: Array<() => void> = []
        tileEls.forEach((tile) => {
            const img = tile.querySelector<HTMLElement>("img")
            if (!img) return
            const move = (ev: PointerEvent) => {
                const r = tile.getBoundingClientRect()
                const x = (ev.clientX - r.left) / r.width - 0.5
                const y = (ev.clientY - r.top) / r.height - 0.5
                img.style.transform = `scale(1.07) translate3d(${(-x * 14).toFixed(1)}px, ${(
                    -y * 14
                ).toFixed(1)}px, 0)`
            }
            const leave = () => {
                img.style.transform = ""
            }
            tile.addEventListener("pointermove", move)
            tile.addEventListener("pointerleave", leave)
            offs.push(() => {
                tile.removeEventListener("pointermove", move)
                tile.removeEventListener("pointerleave", leave)
            })
        })
        return () => offs.forEach((off) => off())
    }, [canvas, tiles.length, hero.showHero])

    // The quotes turn themselves over; clicking a marker restarts the clock.
    React.useEffect(() => {
        if (canvas || quotes.autoRotate === false || quoteItems.length < 2) return
        const every = Math.max(2, quotes.interval || 7) * 1000
        const id = window.setInterval(
            () => setQuoteAt((n) => (n + 1) % quoteItems.length),
            every
        )
        return () => window.clearInterval(id)
    }, [canvas, quotes.autoRotate, quotes.interval, quoteItems.length, quoteAt])

    // A host page with a <base href> makes every "#section" resolve against
    // another URL, so in-page links look alive and do nothing. Scroll by hand.
    const goTo = (e: React.MouseEvent, href?: string) => {
        setMenuOpen(false)
        if (!href || href.charAt(0) !== "#") return
        const el = rootRef.current?.querySelector(href)
        if (!el) return
        e.preventDefault()
        el.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    // Framer will not deliver a form posted from inside a code component, so
    // the message either goes through a relay endpoint the buyer pastes in or
    // it opens the visitor's own mail app. Empty endpoint must never mean
    // "silently does nothing".
    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const form = formRef.current
        if (!form) return
        const data = new FormData(form)
        if (String(data.get("company") || "")) return // honeypot: a bot filled it in
        const payload = {
            name: String(data.get("name") || "").trim(),
            email: String(data.get("email") || "").trim(),
            location: String(data.get("location") || "").trim(),
            message: String(data.get("message") || "").trim(),
        }
        if (!payload.name || !payload.email || !payload.message) {
            Array.from(form.querySelectorAll<HTMLInputElement>("input,textarea")).forEach((f) => {
                if (f.required && !f.value.trim()) f.style.borderBottomColor = "var(--accent)"
            })
            return
        }
        const mail = () => {
            const body = `Name: ${payload.name}\nEmail: ${payload.email}\nLocation: ${payload.location}\n\n${payload.message}`
            window.location.href = `mailto:${contact.email || "studio@archizen.com"}?subject=${encodeURIComponent(
                (contact.mailSubject || "Project enquiry") + " — " + payload.name
            )}&body=${encodeURIComponent(body)}`
        }
        if (contact.endpoint) {
            fetch(contact.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            })
                .then(() => {
                    setSent(true)
                    form.reset()
                })
                .catch(() => mail())
        } else {
            mail()
            setSent(true)
            form.reset()
        }
    }

    const mapSrc = mapUrl(contact.mapAddress, contact.mapZoom)

    // ---- render ------------------------------------------------------------
    return (
        <div
            ref={rootRef}
            className={"arz-root " + (canvas ? "arz-static" : "arz-anim")}
            style={rootStyle}
        >
            <style>{FONT_IMPORT + CSS}</style>
            {gs.grain !== false && <div className="grain" aria-hidden="true" />}

            <div className="desk">
                <div className="sheet">
                    {/* the bar that replaces the sidebar on a phone */}
                    <div className="topbar">
                        <a className="brand" href="#top" onClick={(e) => goTo(e, "#top")}>
                            <span className="brand-name">{side.brandName || "ARCHIZEN"}</span>
                        </a>
                        <button
                            className="burger"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}
                        >
                            <span />
                        </button>
                    </div>

                    <nav
                        className={"sheet-menu" + (menuOpen ? " open" : "")}
                        aria-hidden={menuOpen ? "false" : "true"}
                    >
                        <button className="close" onClick={() => setMenuOpen(false)}>
                            Close
                        </button>
                        {navLinks.map((l, i) => (
                            <a
                                key={i}
                                href={l.href || "#top"}
                                onClick={(e) => goTo(e, l.href)}
                            >
                                <span className="idx">{String(i + 1).padStart(2, "0")}</span>{" "}
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div className="shell" id="top">
                        {/* ① sidebar */}
                        <aside className="sidebar">
                            <div className="progress" />
                            <a className="brand" href="#top" onClick={(e) => goTo(e, "#top")}>
                                <span className="brand-name">{side.brandName || "ARCHIZEN"}</span>
                                {side.brandSub ? (
                                    <span className="brand-sub">{side.brandSub}</span>
                                ) : null}
                            </a>

                            <ul className="side-nav">
                                {navLinks.map((l, i) => (
                                    <li key={i}>
                                        <a
                                            href={l.href || "#top"}
                                            data-target={(l.href || "").replace("#", "")}
                                            onClick={(e) => goTo(e, l.href)}
                                        >
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            <div className="side-foot">
                                {(side.address || side.email) && (
                                    <div className="side-meta">
                                        {String(side.address || "")
                                            .split("\n")
                                            .map((line: string, i: number) => (
                                                <React.Fragment key={i}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        {side.email ? (
                                            <a href={`mailto:${side.email}`}>{side.email}</a>
                                        ) : null}
                                    </div>
                                )}
                                {socials.length > 0 && (
                                    <div className="socials">
                                        {socials.map((s, i) => (
                                            <a
                                                key={i}
                                                href={s.url || "#"}
                                                aria-label={s.network || "social"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <SocialIcon network={s.network || "instagram"} />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>

                        <main className="main">
                            {/* ③ hero */}
                            {hero.showHero !== false && (
                                <section
                                    className="hero"
                                    style={
                                        hero.fullHeight === false
                                            ? ({ height: "auto", minHeight: 0 } as React.CSSProperties)
                                            : undefined
                                    }
                                >
                                    <div className="hero-head">
                                        <h1 className="reveal-line">
                                            <span>{hero.headline}</span>
                                        </h1>
                                        <div className="meta">
                                            {hero.metaOneTitle ? (
                                                <div>
                                                    <span className="eyebrow">{hero.metaOneTitle}</span>
                                                    <div className="mono" style={{ marginTop: ".5rem" }}>
                                                        {hero.metaOneValue}
                                                    </div>
                                                </div>
                                            ) : null}
                                            {hero.metaTwoTitle ? (
                                                <div>
                                                    <span className="eyebrow">{hero.metaTwoTitle}</span>
                                                    <div className="mono" style={{ marginTop: ".5rem" }}>
                                                        {hero.metaTwoValue}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="hero-grid">
                                        {tiles.map((t, i) => {
                                            const src = imgSrc(t.image)
                                            return (
                                                <div className="tile-wrap" key={i}>
                                                    <a
                                                        className="tile"
                                                        data-tilt=""
                                                        href={t.href || "#project-" + (i + 1)}
                                                        onClick={(e) =>
                                                            goTo(e, t.href || "#project-" + (i + 1))
                                                        }
                                                    >
                                                        {src ? (
                                                            <img src={src} alt={t.name || ""} />
                                                        ) : (
                                                            <Slot label={`Hero photo ${i + 1} — 1400 × 1000 px`} />
                                                        )}
                                                        <span className="idx">
                                                            {String(i + 1).padStart(2, "0")}
                                                        </span>
                                                        <div className="tile-label">
                                                            <span className="name">{t.name}</span>
                                                            <span className="place">{t.place}</span>
                                                        </div>
                                                    </a>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {hero.cue ? (
                                        <div className="scroll-cue">
                                            <span className="bar" /> {hero.cue}
                                        </div>
                                    ) : null}
                                </section>
                            )}

                            {/* ④ manifesto */}
                            {manifesto.showSection !== false && (
                                <section className="statement pad" id="statement">
                                    <div className="statement-grid">
                                        <div>
                                            <span className="eyebrow">{manifesto.eyebrow}</span>
                                            <p className="words" style={{ marginTop: "1.8rem" }}>
                                                {words.map((w, i) => (
                                                    <React.Fragment key={i}>
                                                        <span>{w}</span>{" "}
                                                    </React.Fragment>
                                                ))}
                                            </p>
                                        </div>
                                        <div className="statement-side reveal">
                                            <div className="rule" />
                                            {manifesto.paragraphOne ? (
                                                <p className="lede">{manifesto.paragraphOne}</p>
                                            ) : null}
                                            {manifesto.paragraphTwo ? (
                                                <p className="lede">{manifesto.paragraphTwo}</p>
                                            ) : null}
                                            {manifesto.signature ? (
                                                <div>
                                                    <div className="sign">{manifesto.signature}</div>
                                                    <div className="mono" style={{ marginTop: ".4rem" }}>
                                                        {manifesto.signatureRole}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑤ selected work */}
                            {work.showSection !== false && (
                                <section className="pad" id="work">
                                    <div className="work-head">
                                        <div>
                                            <span className="eyebrow">{work.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {work.heading}
                                            </h2>
                                        </div>
                                        {work.intro ? (
                                            <p className="lede reveal" style={{ maxWidth: "30ch" }}>
                                                {work.intro}
                                            </p>
                                        ) : null}
                                    </div>

                                    {projects.map((p, i) => {
                                        const src = imgSrc(p.image)
                                        const specs = [
                                            [p.k1, p.v1],
                                            [p.k2, p.v2],
                                            [p.k3, p.v3],
                                            [p.k4, p.v4],
                                        ].filter((row) => row[0] || row[1])
                                        return (
                                            <article
                                                className="project"
                                                key={i}
                                                id={"project-" + (i + 1)}
                                                style={
                                                    i === projects.length - 1
                                                        ? { marginBottom: 0 }
                                                        : undefined
                                                }
                                            >
                                                <div className="project-top">
                                                    <div>
                                                        <span className="mono">{p.kicker}</span>
                                                        <h3
                                                            className="reveal-line"
                                                            style={{ marginTop: ".8rem" }}
                                                        >
                                                            <span>{p.title}</span>
                                                        </h3>
                                                    </div>
                                                    <div className="tags">
                                                        {p.location ? (
                                                            <span className="mono">{p.location}</span>
                                                        ) : null}
                                                        {p.year ? <span className="mono">{p.year}</span> : null}
                                                        {p.area ? <span className="mono">{p.area}</span> : null}
                                                    </div>
                                                </div>
                                                <div className="figure project-figure">
                                                    <span className="curtain" />
                                                    {src ? (
                                                        <img
                                                            src={src}
                                                            alt={p.title || ""}
                                                            data-parallax="0.12"
                                                        />
                                                    ) : (
                                                        <Slot label="Project photo — 1600 × 900 px" />
                                                    )}
                                                </div>
                                                <div className="project-body">
                                                    {p.text ? (
                                                        <p className="lede reveal">{p.text}</p>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <div className="reveal">
                                                        {specs.length > 0 && (
                                                            <div className="spec">
                                                                {specs.map((row, n) => (
                                                                    <div key={n}>
                                                                        <span className="k">{row[0]}</span>
                                                                        <span className="v">{row[1]}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {p.linkLabel ? (
                                                            <a
                                                                className="link-more"
                                                                href={p.linkHref || "#contact"}
                                                                onClick={(e) => goTo(e, p.linkHref)}
                                                            >
                                                                {p.linkLabel}{" "}
                                                                <span aria-hidden="true">→</span>
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </section>
                            )}

                            {/* ⑥ numbers */}
                            {numbers.showSection !== false && stats.length > 0 && (
                                <section className="pad-tight" style={{ paddingTop: 0 }}>
                                    <div className="numbers pad-tight">
                                        <div className="grid">
                                            {stats.map((s, i) => (
                                                <div className="reveal" key={i}>
                                                    <div className="n">
                                                        <span data-count={s.value || 0}>0</span>
                                                    </div>
                                                    <div className="k">{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑦ studio */}
                            {studio.showSection !== false && (
                                <section className="pad" id="studio" style={{ paddingTop: 0 }}>
                                    <div className="studio-grid">
                                        <div className="figure studio-figure reveal">
                                            <span className="curtain" />
                                            {imgSrc(studio.image) ? (
                                                <img
                                                    src={imgSrc(studio.image)}
                                                    alt={studio.headingOne || "Studio"}
                                                    data-parallax="0.1"
                                                />
                                            ) : (
                                                <Slot label="Studio photo — 1000 × 1400 px" />
                                            )}
                                        </div>
                                        <div className="studio-text">
                                            <span className="eyebrow">{studio.eyebrow}</span>
                                            <h2 className="h2 reveal-line" style={{ marginTop: "1.2rem" }}>
                                                <span>{studio.headingOne}</span>
                                            </h2>
                                            {studio.headingTwo ? (
                                                <h2 className="h2 reveal-line">
                                                    <span>{studio.headingTwo}</span>
                                                </h2>
                                            ) : null}
                                            {studio.paragraphOne ? (
                                                <p className="lede reveal">{studio.paragraphOne}</p>
                                            ) : null}
                                            {studio.paragraphTwo ? (
                                                <p className="lede reveal">{studio.paragraphTwo}</p>
                                            ) : null}
                                            {bullets.length > 0 && (
                                                <div className="bullets reveal">
                                                    <ul>
                                                        {bullets.map((b, i) => (
                                                            <li key={i}>
                                                                <span className="dot" /> {b.text}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑧ process */}
                            {process.showSection !== false && (
                                <section className="pad" id="process" style={{ paddingTop: 0 }}>
                                    <div className="process-grid">
                                        <div className="process-sticky">
                                            <span className="eyebrow">{process.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {process.heading}
                                            </h2>
                                            {process.intro ? (
                                                <p
                                                    className="lede reveal"
                                                    style={{ marginTop: "1.6rem", maxWidth: "32ch" }}
                                                >
                                                    {process.intro}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            {steps.map((s, i) => (
                                                <div className="step" key={i}>
                                                    <div className="num">
                                                        {String(i + 1).padStart(2, "0")}
                                                    </div>
                                                    <div>
                                                        <h4>{s.title}</h4>
                                                        <p>{s.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑨ services */}
                            {services.showSection !== false && (
                                <section className="pad" id="services" style={{ paddingTop: 0 }}>
                                    <div className="work-head">
                                        <div>
                                            <span className="eyebrow">{services.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {services.heading}
                                            </h2>
                                        </div>
                                        {services.hint ? (
                                            <p className="lede reveal" style={{ maxWidth: "28ch" }}>
                                                {services.hint}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="svc">
                                        {svcItems.map((s, i) => {
                                            const src = imgSrc(s.image)
                                            return (
                                                <div className="svc-row" key={i}>
                                                    <span className="no">
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                    <span className="title">{s.title}</span>
                                                    <span className="svc-shot">
                                                        {src ? <img src={src} alt="" /> : null}
                                                    </span>
                                                    <span className="desc">{s.text}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* ⑩ details */}
                            {details.showSection !== false && railItems.length > 0 && (
                                <section className="pad-tight" style={{ paddingTop: 0 }}>
                                    <div className="work-head">
                                        <div>
                                            <span className="eyebrow">{details.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {details.heading}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="rail-wrap">
                                        <div className="rail">
                                            {railItems.map((d, i) => (
                                                <div className="rail-item" key={i}>
                                                    <div className="figure">
                                                        <span className="curtain" />
                                                        {imgSrc(d.image) ? (
                                                            <img
                                                                src={imgSrc(d.image)}
                                                                alt={d.caption || ""}
                                                            />
                                                        ) : (
                                                            <Slot label="Detail — 1200 × 1200 px" />
                                                        )}
                                                    </div>
                                                    <div className="cap">
                                                        <span className="mono">{d.caption}</span>
                                                        <span className="mono">{d.place}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑪ awards */}
                            {awards.showSection !== false && (
                                <section className="pad" id="awards" style={{ paddingTop: 0 }}>
                                    <div className="work-head">
                                        <div>
                                            <span className="eyebrow">{awards.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {awards.heading}
                                            </h2>
                                        </div>
                                    </div>
                                    <div>
                                        {awardItems.map((a, i) => {
                                            // A plain year counts up from zero; anything
                                            // else (a range, a season) is left as written.
                                            const countable = /^\d{1,4}$/.test(
                                                String(a.year || "").trim()
                                            )
                                            return (
                                                <div className="award reveal" key={i}>
                                                    {countable ? (
                                                        <span
                                                            className="yr"
                                                            data-count={String(a.year).trim()}
                                                            data-count-ms="2000"
                                                        >
                                                            0
                                                        </span>
                                                    ) : (
                                                        <span className="yr">{a.year}</span>
                                                    )}
                                                    <span className="what">{a.what}</span>
                                                    <span className="where">{a.where}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {marqueeWords.length > 0 && (
                                        <div className="marquee">
                                            <div className="marquee-track">
                                                {marqueeWords.concat(marqueeWords).map((m, i) => (
                                                    <span key={i}>{m.word}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* ⑫ testimonials */}
                            {quotes.showSection !== false && quoteItems.length > 0 && (
                                <section className="quotes pad" style={{ paddingTop: 0 }}>
                                    <div
                                        className="pad-tight"
                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                    >
                                        <span className="eyebrow">{quotes.eyebrow}</span>
                                        <div style={{ marginTop: "1.8rem" }}>
                                            {quoteItems.map((qt, i) => (
                                                <div
                                                    className={"quote" + (i === quoteAt ? " on" : "")}
                                                    key={i}
                                                >
                                                    <blockquote>{qt.text}</blockquote>
                                                    <div className="who">
                                                        <b>{qt.name}</b>
                                                        {qt.role ? " · " + qt.role : ""}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {quoteItems.length > 1 && (
                                            <div className="dots">
                                                {quoteItems.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        aria-label={`Quote ${i + 1}`}
                                                        className={i === quoteAt ? "on" : ""}
                                                        onClick={() => setQuoteAt(i)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* ⑬ contact */}
                            {contact.showSection !== false && (
                                <section className="pad" id="contact" style={{ paddingTop: 0 }}>
                                    <div className="work-head">
                                        <div>
                                            <span className="eyebrow">{contact.eyebrow}</span>
                                            <h2 className="h2 reveal" style={{ marginTop: "1.2rem" }}>
                                                {contact.heading}
                                            </h2>
                                        </div>
                                        {contact.intro ? (
                                            <p className="lede reveal" style={{ maxWidth: "30ch" }}>
                                                {contact.intro}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="contact-grid">
                                        <form ref={formRef} onSubmit={submit} noValidate>
                                            <div className="field">
                                                <input name="name" placeholder=" " required />
                                                <label>{contact.nameLabel || "Your name"}</label>
                                            </div>
                                            <div className="field">
                                                <input
                                                    name="email"
                                                    type="email"
                                                    placeholder=" "
                                                    required
                                                />
                                                <label>{contact.emailLabel || "Email"}</label>
                                            </div>
                                            <div className="field">
                                                <input name="location" placeholder=" " />
                                                <label>
                                                    {contact.locationLabel || "Where is the project?"}
                                                </label>
                                            </div>
                                            <div className="field">
                                                <textarea name="message" placeholder=" " required />
                                                <label>
                                                    {contact.messageLabel || "What are you planning?"}
                                                </label>
                                            </div>
                                            <input
                                                className="hp"
                                                type="text"
                                                name="company"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                aria-hidden="true"
                                            />
                                            <button className="btn" type="submit">
                                                <span>{contact.buttonLabel || "Send enquiry"}</span>
                                            </button>
                                            <div className={"sent" + (sent ? " on" : "")}>
                                                {contact.thanksText ||
                                                    "Thank you — your message is on its way."}
                                            </div>
                                        </form>

                                        <div className="contact-info">
                                            {contact.addressTitle ? (
                                                <div className="info-row">
                                                    <span className="k">{contact.addressTitle}</span>
                                                    <span className="v">
                                                        {String(contact.address || "")
                                                            .split("\n")
                                                            .map((l: string, i: number) => (
                                                                <React.Fragment key={i}>
                                                                    {l}
                                                                    <br />
                                                                </React.Fragment>
                                                            ))}
                                                    </span>
                                                </div>
                                            ) : null}
                                            <div className="info-row">
                                                <span className="k">
                                                    {contact.reachTitle || "Talk to us"}
                                                </span>
                                                <span className="v">
                                                    <a href={`mailto:${contact.email || ""}`}>
                                                        {contact.email}
                                                    </a>
                                                    <br />
                                                    <a
                                                        href={`tel:${String(contact.phone || "").replace(
                                                            /\s/g,
                                                            ""
                                                        )}`}
                                                    >
                                                        {contact.phone}
                                                    </a>
                                                </span>
                                            </div>
                                            {contact.hours ? (
                                                <div className="info-row">
                                                    <span className="k">
                                                        {contact.hoursTitle || "Hours"}
                                                    </span>
                                                    <span className="v">
                                                        {String(contact.hours)
                                                            .split("\n")
                                                            .map((l: string, i: number) => (
                                                                <React.Fragment key={i}>
                                                                    {l}
                                                                    <br />
                                                                </React.Fragment>
                                                            ))}
                                                    </span>
                                                </div>
                                            ) : null}
                                            {contact.showMap !== false && mapSrc ? (
                                                <iframe
                                                    className="map"
                                                    loading="lazy"
                                                    title="Studio location"
                                                    src={mapSrc}
                                                    style={
                                                        contact.mapMono === false
                                                            ? { filter: "none" }
                                                            : undefined
                                                    }
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ⑭ footer */}
                            {footer.showSection !== false && (
                                <footer className="footer">
                                    <div className="footer-word">
                                        {footer.wordmark || side.brandName || "ARCHIZEN"}
                                    </div>
                                    <div className="footer-bottom">
                                        <span className="mono">{footer.leftText}</span>
                                        <span className="mono">{footer.rightText}</span>
                                        <a
                                            className="to-top"
                                            href="#top"
                                            onClick={(e) => goTo(e, "#top")}
                                        >
                                            {footer.topLabel || "Back to top"}{" "}
                                            <span aria-hidden="true">↑</span>
                                        </a>
                                    </div>
                                </footer>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// The panel reads as a table of contents: the numbered groups run down the page
// in the order their sections appear on it.
// ---------------------------------------------------------------------------

const hideColors = (p: StyleGroup) => (p.palette || "custom") === "original"

addPropertyControls(ArchizenSite, {
    sidebar: {
        type: ControlType.Object,
        title: "① Sidebar",
        controls: {
            brandName: {
                type: ControlType.String,
                title: "Studio Name",
                defaultValue: "ARCHIZEN",
            },
            brandSub: {
                type: ControlType.String,
                title: "Under the Name",
                defaultValue: "Architecture Studio",
            },
            links: {
                type: ControlType.Array,
                title: "Menu",
                control: {
                    type: ControlType.Object,
                    controls: {
                        label: { type: ControlType.String, title: "Label", defaultValue: "Projects" },
                        href: { type: ControlType.String, title: "Anchor", defaultValue: "#work" },
                    },
                },
                defaultValue: [
                    { label: "Home", href: "#top" },
                    { label: "Projects", href: "#work" },
                    { label: "Manifesto", href: "#statement" },
                    { label: "Studio", href: "#studio" },
                    { label: "Process", href: "#process" },
                    { label: "Services", href: "#services" },
                    { label: "Awards", href: "#awards" },
                    { label: "Contact", href: "#contact" },
                ],
                description:
                    "Anchors point at the sections of this page: #top, #work, #statement, #studio, #process, #services, #awards, #contact. The link of whichever section is on screen underlines itself.",
            },
            address: {
                type: ControlType.String,
                title: "Address",
                displayTextArea: true,
                defaultValue: "Studio Prague\nKampa Island 14",
            },
            email: {
                type: ControlType.String,
                title: "Email",
                defaultValue: "studio@archizen.com",
            },
            socials: {
                type: ControlType.Array,
                title: "Social Links",
                control: {
                    type: ControlType.Object,
                    controls: {
                        network: {
                            type: ControlType.Enum,
                            title: "Icon",
                            options: ["facebook", "x", "instagram", "linkedin", "pinterest", "behance"],
                            optionTitles: ["Facebook", "X", "Instagram", "LinkedIn", "Pinterest", "Behance"],
                            defaultValue: "instagram",
                        },
                        url: { type: ControlType.Link, title: "Address" },
                    },
                },
                defaultValue: [
                    { network: "facebook" },
                    { network: "x" },
                    { network: "instagram" },
                ],
            },
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
                    "Original palette puts the site back to how it shipped and hides the colour fields. Framer keeps control values on the placed component and gives the code no way to clear them, so switching back to My colors brings your last colours with it. To start the colours over from nothing, delete this component from the canvas and drag a fresh one out of the Assets panel.",
            },
            accent: {
                type: ControlType.Color,
                title: "Accent",
                defaultValue: DEFAULTS.accent,
                hidden: hideColors,
                description:
                    "One colour for the whole site: the reading-progress line, the active menu link, hovered rows, the counters, the award years and the send button.",
            },
            desk: { type: ControlType.Color, title: "Page Background", defaultValue: DEFAULTS.desk, hidden: hideColors },
            sheet: { type: ControlType.Color, title: "Sheet", defaultValue: DEFAULTS.sheet, hidden: hideColors },
            ink: { type: ControlType.Color, title: "Text", defaultValue: DEFAULTS.ink, hidden: hideColors },
            muted: { type: ControlType.Color, title: "Muted Text", defaultValue: DEFAULTS.muted, hidden: hideColors },
            dim: { type: ControlType.Color, title: "Dim Text", defaultValue: DEFAULTS.dim, hidden: hideColors },
            line: { type: ControlType.Color, title: "Lines", defaultValue: DEFAULTS.line, hidden: hideColors },
            headingFont: {
                type: ControlType.Enum,
                title: "Heading Font",
                options: ["grotesk", "serif", "inter"],
                optionTitles: ["Space Grotesk", "Instrument Serif", "Inter"],
                defaultValue: "grotesk",
            },
            photoMode: {
                type: ControlType.Enum,
                title: "Photos",
                options: ["color", "mono"],
                optionTitles: ["As uploaded", "Black and white"],
                defaultValue: "color",
                displaySegmentedControl: true,
                description:
                    "Black and white renders every photograph greyscale, whatever you upload — the hero tiles, the projects, the studio, the details and the service previews alike. The map has its own setting.",
            },
            framed: {
                type: ControlType.Boolean,
                title: "Framed Sheet",
                defaultValue: true,
                description:
                    "The site sits on the page background like a sheet of paper on a desk. Turn this off to let it run edge to edge.",
            },
            corner: { type: ControlType.Number, title: "Corner Radius", min: 0, max: 24, step: 1, defaultValue: 3 },
            sidebarWidth: {
                type: ControlType.Number,
                title: "Sidebar Width",
                min: 180,
                max: 360,
                step: 2,
                defaultValue: 250,
                description: "Below 860 px the sidebar becomes a top bar with a menu, whatever this says.",
            },
            grain: { type: ControlType.Boolean, title: "Paper Grain", defaultValue: true },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "③ Hero",
        controls: {
            showHero: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            headline: {
                type: ControlType.String,
                title: "Headline",
                displayTextArea: true,
                defaultValue: "Buildings that hold light, weather and time.",
            },
            metaOneTitle: { type: ControlType.String, title: "Label 1", defaultValue: "Studio" },
            metaOneValue: { type: ControlType.String, title: "Value 1", defaultValue: "Prague · Est. 2009" },
            metaTwoTitle: { type: ControlType.String, title: "Label 2", defaultValue: "Selected" },
            metaTwoValue: { type: ControlType.String, title: "Value 2", defaultValue: "2019 — 2026" },
            tiles: {
                type: ControlType.Array,
                title: "Photos — 1400 × 1000 px",
                control: {
                    type: ControlType.Object,
                    controls: {
                        image: { type: ControlType.Image, title: "Photo" },
                        name: { type: ControlType.String, title: "Project", defaultValue: "Kalmar Pavilion" },
                        place: { type: ControlType.String, title: "Place", defaultValue: "Öland, SE" },
                        href: {
                            type: ControlType.String,
                            title: "Anchor",
                            defaultValue: "#project-1",
                            description:
                                "#project-1 to #project-4 jump to that project in ⑤ Selected Work, in the order the projects are listed there. Leave it empty and the tile finds its own project by position.",
                        },
                    },
                },
                defaultValue: [
                    { name: "Kalmar Pavilion", place: "Öland, SE", href: "#project-1" },
                    { name: "Nord Residence", place: "Oslo, NO", href: "#project-2" },
                    { name: "Lumen Gallery", place: "Prague, CZ", href: "#project-3" },
                    { name: "Grid House", place: "Utrecht, NL", href: "#project-4" },
                ],
                description: "Four photographs fill the first screen as a two by two grid. Any other number still works — the grid keeps two columns and grows downwards.",
            },
            fullHeight: {
                type: ControlType.Boolean,
                title: "Fill the Screen",
                defaultValue: true,
                description: "On desktop the grid is sized so the whole hero ends exactly at the fold.",
            },
            cue: { type: ControlType.String, title: "Scroll Hint", defaultValue: "Scroll to enter" },
        },
    },

    manifesto: {
        type: ControlType.Object,
        title: "④ Manifesto",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Manifesto" },
            text: {
                type: ControlType.String,
                title: "Statement",
                displayTextArea: true,
                defaultValue:
                    "We build slowly, with few materials and a long view. Every plan begins with the ground it stands on and ends with the light that crosses it.",
                description: "The words light up one by one as the visitor scrolls through them.",
            },
            paragraphOne: {
                type: ControlType.String,
                title: "Paragraph 1",
                displayTextArea: true,
                defaultValue:
                    "Founded in Prague in 2009, ARCHIZEN works across housing, culture and adaptive reuse. We keep the studio small on purpose — eleven people, one workshop, one model bench — so that the hand that draws the detail is the hand that visits the site.",
            },
            paragraphTwo: {
                type: ControlType.String,
                title: "Paragraph 2",
                displayTextArea: true,
                defaultValue: "Concrete, oak, glass, brass. Four materials, honestly joined, are usually enough.",
            },
            signature: { type: ControlType.String, title: "Signed", defaultValue: "Marek Halász" },
            signatureRole: { type: ControlType.String, title: "Role", defaultValue: "Founding Partner" },
        },
    },

    work: {
        type: ControlType.Object,
        title: "⑤ Selected Work",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Selected Work" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Four buildings, four climates" },
            intro: {
                type: ControlType.String,
                title: "Intro",
                displayTextArea: true,
                defaultValue: "Each project is shown as it was built: the site first, the section second, the finish last.",
            },
            projects: {
                type: ControlType.Array,
                title: "Projects — 1600 × 900 px",
                control: {
                    type: ControlType.Object,
                    controls: {
                        kicker: { type: ControlType.String, title: "Kicker", defaultValue: "01 — Culture" },
                        title: { type: ControlType.String, title: "Name", defaultValue: "Kalmar Pavilion" },
                        location: { type: ControlType.String, title: "Place", defaultValue: "Öland, Sweden" },
                        year: { type: ControlType.String, title: "Year", defaultValue: "2024" },
                        area: { type: ControlType.String, title: "Size", defaultValue: "1 240 m²" },
                        image: { type: ControlType.Image, title: "Photo" },
                        text: { type: ControlType.String, title: "Description", displayTextArea: true },
                        k1: { type: ControlType.String, title: "Spec 1", defaultValue: "Client" },
                        v1: { type: ControlType.String, title: "Value 1" },
                        k2: { type: ControlType.String, title: "Spec 2", defaultValue: "Role" },
                        v2: { type: ControlType.String, title: "Value 2" },
                        k3: { type: ControlType.String, title: "Spec 3", defaultValue: "Structure" },
                        v3: { type: ControlType.String, title: "Value 3" },
                        k4: { type: ControlType.String, title: "Spec 4", defaultValue: "Status" },
                        v4: { type: ControlType.String, title: "Value 4" },
                        linkLabel: { type: ControlType.String, title: "Link Label", defaultValue: "View project" },
                        linkHref: { type: ControlType.String, title: "Link Anchor", defaultValue: "#contact" },
                    },
                },
                defaultValue: [
                    {
                        kicker: "01 — Culture", title: "Kalmar Pavilion", location: "Öland, Sweden",
                        year: "2024", area: "1 240 m²",
                        text: "A summer pavilion for a sculpture park, set low into the limestone so that the roof reads as a second horizon. Glass slides away on all four sides; in August the building is more or less a shadow with a floor.",
                        k1: "Client", v1: "Öland Sculpture Park", k2: "Role", v2: "Architect, Interior",
                        k3: "Structure", v3: "Cast concrete, oak", k4: "Status", v4: "Completed 2024",
                        linkLabel: "View project", linkHref: "#contact",
                    },
                    {
                        kicker: "02 — Housing", title: "Nord Residence", location: "Oslo, Norway",
                        year: "2023", area: "8 400 m²",
                        text: "Sixty-two apartments on a north-facing slope. Every flat is dual aspect, every stair is daylit, and the shared roof terrace is deliberately the best room in the building.",
                        k1: "Client", v1: "Fjord Bolig AS", k2: "Role", v2: "Architect, Landscape",
                        k3: "Structure", v3: "CLT, brick", k4: "Status", v4: "Completed 2023",
                        linkLabel: "View project", linkHref: "#contact",
                    },
                    {
                        kicker: "03 — Adaptive reuse", title: "Lumen Gallery", location: "Prague, Czechia",
                        year: "2022", area: "2 100 m²",
                        text: "A 1930s printing hall turned over to contemporary art. We kept the crane rail, opened the north lights, and added exactly one new element: a concrete stair that runs the length of the room.",
                        k1: "Client", v1: "Lumen Foundation", k2: "Role", v2: "Architect, Exhibition",
                        k3: "Structure", v3: "Existing steel, concrete", k4: "Status", v4: "Completed 2022",
                        linkLabel: "View project", linkHref: "#contact",
                    },
                    {
                        kicker: "04 — Private", title: "Grid House", location: "Utrecht, Netherlands",
                        year: "2021", area: "310 m²",
                        text: "A house for two painters, planned on a strict 1.2 metre grid so that every wall could later be moved by the people living there. Four years on, three of them have been.",
                        k1: "Client", v1: "Private", k2: "Role", v2: "Architect, Furniture",
                        k3: "Structure", v3: "Timber frame, lime", k4: "Status", v4: "Completed 2021",
                        linkLabel: "View project", linkHref: "#contact",
                    },
                ],
            },
        },
    },

    numbers: {
        type: ControlType.Object,
        title: "⑥ Numbers",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            items: {
                type: ControlType.Array,
                title: "Figures",
                control: {
                    type: ControlType.Object,
                    controls: {
                        value: { type: ControlType.Number, title: "Number", min: 0, max: 100000, step: 1, defaultValue: 17 },
                        label: { type: ControlType.String, title: "Label", defaultValue: "Years building" },
                    },
                },
                defaultValue: [
                    { value: 17, label: "Years building" },
                    { value: 86, label: "Projects completed" },
                    { value: 11, label: "People in the studio" },
                    { value: 9, label: "Awards received" },
                ],
                description: "Each figure counts up from zero the first time it reaches the screen.",
            },
        },
    },

    studio: {
        type: ControlType.Object,
        title: "⑦ Studio",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "The Studio" },
            headingOne: { type: ControlType.String, title: "Heading Line 1", defaultValue: "Eleven people," },
            headingTwo: { type: ControlType.String, title: "Heading Line 2", defaultValue: "one long table" },
            image: { type: ControlType.Image, title: "Photo — 1000 × 1400 px" },
            paragraphOne: {
                type: ControlType.String, title: "Paragraph 1", displayTextArea: true,
                defaultValue: "We are an architecture and interiors practice on Kampa Island, working across Central Europe and Scandinavia. Half the studio is in the office and half is usually on site; the model workshop in the basement is the part we would defend last.",
            },
            paragraphTwo: {
                type: ControlType.String, title: "Paragraph 2", displayTextArea: true,
                defaultValue: "We take on eight to ten projects a year. That number is a decision, not a limit — it is the most work we can do while keeping a partner on every site visit.",
            },
            bullets: {
                type: ControlType.Array,
                title: "Points",
                control: {
                    type: ControlType.Object,
                    controls: { text: { type: ControlType.String, title: "Point" } },
                },
                defaultValue: [
                    { text: "Full RIBA stages 0–7, or any part of them" },
                    { text: "In-house visualisation, models at 1:50 and 1:20" },
                    { text: "Passive-first: fabric before machinery, always" },
                    { text: "Post-occupancy visits at one and five years" },
                ],
            },
        },
    },

    process: {
        type: ControlType.Object,
        title: "⑧ Process",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "How we work" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "From the first walk to the last visit" },
            intro: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Six stages. The client is in the room for all of them." },
            steps: {
                type: ControlType.Array,
                title: "Stages",
                control: {
                    type: ControlType.Object,
                    controls: {
                        title: { type: ControlType.String, title: "Stage", defaultValue: "Walk the site" },
                        text: { type: ControlType.String, title: "What happens", displayTextArea: true },
                    },
                },
                defaultValue: [
                    { title: "Walk the site", text: "Before anything is drawn we spend a day on the ground, at two different hours, in whatever weather is going. Most of what follows is decided there." },
                    { title: "Brief & budget", text: "A short written brief and a cost plan that is honest about the parts nobody enjoys paying for — groundworks, insulation, the roof." },
                    { title: "Concept in models", text: "Three schemes at 1:200, built in card, photographed and priced. We meet around the table and one survives." },
                    { title: "Permission", text: "Drawings, reports and the conversations with the planning office that make them land. We handle the hearing." },
                    { title: "Detail & tender", text: "1:20 sections through every junction, a materials board you can hold, and a tender pack that contractors can actually price." },
                    { title: "On site", text: "Weekly visits, monthly valuations, one partner responsible from foundation to handover — and back again a year later." },
                ],
                description: "The stage nearest the middle of the screen is the one at full strength; the others step back.",
            },
        },
    },

    services: {
        type: ControlType.Object,
        title: "⑨ Services",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Services" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "What we can take on" },
            hint: { type: ControlType.String, title: "Intro", defaultValue: "Hover a line to see the work it produced." },
            items: {
                type: ControlType.Array,
                title: "Services — 1600 × 900 px",
                control: {
                    type: ControlType.Object,
                    controls: {
                        title: { type: ControlType.String, title: "Service", defaultValue: "Architecture" },
                        text: { type: ControlType.String, title: "Note", displayTextArea: true },
                        image: { type: ControlType.Image, title: "Hover Photo" },
                    },
                },
                defaultValue: [
                    { title: "Architecture", text: "New build and extension, from first sketch to the final site visit." },
                    { title: "Adaptive Reuse", text: "Old structures given a second working life, with the scars left visible." },
                    { title: "Interiors", text: "Rooms, joinery and lighting drawn to the millimetre and made nearby." },
                    { title: "Masterplanning", text: "Blocks, streets and the ground between them, tested at 1:500." },
                    { title: "Feasibility & Permits", text: "What a plot will carry, what it will cost, and what the office will allow." },
                ],
                description: "The photo slides in from the left and comes to rest after the name of the service. On a phone it simply sits in the row.",
            },
        },
    },

    details: {
        type: ControlType.Object,
        title: "⑩ Details",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Details" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Close up" },
            items: {
                type: ControlType.Array,
                title: "Photos — 1200 × 1200 px",
                control: {
                    type: ControlType.Object,
                    controls: {
                        image: { type: ControlType.Image, title: "Photo" },
                        caption: { type: ControlType.String, title: "Caption", defaultValue: "Facade study" },
                        place: { type: ControlType.String, title: "Place", defaultValue: "Oslo" },
                    },
                },
                defaultValue: [
                    { caption: "Facade study", place: "Oslo" },
                    { caption: "Stair hall", place: "Prague" },
                    { caption: "Glazed edge", place: "Öland" },
                    { caption: "Reveal & shadow", place: "Utrecht" },
                    { caption: "Window grid", place: "Utrecht" },
                ],
                description: "The strip travels sideways as the section crosses the screen, so add as many as you like.",
            },
        },
    },

    awards: {
        type: ControlType.Object,
        title: "⑪ Awards",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Recognition" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Awards & press" },
            items: {
                type: ControlType.Array,
                title: "Entries",
                control: {
                    type: ControlType.Object,
                    controls: {
                        year: {
                            type: ControlType.String,
                            title: "Year",
                            defaultValue: "2025",
                            description: "A plain year counts up from zero over two seconds as the row arrives. Anything else is shown as written.",
                        },
                        what: { type: ControlType.String, title: "Award", defaultValue: "Award name" },
                        where: { type: ControlType.String, title: "Project", defaultValue: "Project" },
                    },
                },
                defaultValue: [
                    { year: "2025", what: "Mies van der Rohe Award — Nomination", where: "Kalmar Pavilion" },
                    { year: "2024", what: "Czech Architecture Prize — Shortlist", where: "Lumen Gallery" },
                    { year: "2024", what: "Dezeen Awards — Housing Project of the Year", where: "Nord Residence" },
                    { year: "2023", what: "Nordic Timber Prize — Winner", where: "Nord Residence" },
                    { year: "2022", what: "Domus 100 — Practices to watch", where: "Studio" },
                    { year: "2021", what: "Wallpaper* Design Awards — Best New House", where: "Grid House" },
                ],
            },
            marquee: {
                type: ControlType.Array,
                title: "Published In",
                control: {
                    type: ControlType.Object,
                    controls: { word: { type: ControlType.String, title: "Name", defaultValue: "Dezeen" } },
                },
                defaultValue: [
                    { word: "Dezeen" }, { word: "Domus" }, { word: "Wallpaper*" }, { word: "Detail" },
                    { word: "A+U" }, { word: "Architectural Review" }, { word: "Divisare" }, { word: "Frame" },
                ],
                description: "The names run past in a loop and pause when the pointer rests on them.",
            },
            marqueeSpeed: {
                type: ControlType.Number, title: "Loop Seconds", min: 10, max: 120, step: 1, defaultValue: 34,
            },
        },
    },

    quotes: {
        type: ControlType.Object,
        title: "⑫ Testimonials",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Clients" },
            items: {
                type: ControlType.Array,
                title: "Quotes",
                control: {
                    type: ControlType.Object,
                    controls: {
                        text: { type: ControlType.String, title: "Quote", displayTextArea: true },
                        name: { type: ControlType.String, title: "Name", defaultValue: "Elin Sandberg" },
                        role: { type: ControlType.String, title: "Role", defaultValue: "Director" },
                    },
                },
                defaultValue: [
                    { text: "“They spent the first day on the site and the second explaining what it would cost. Nothing after that surprised us.”", name: "Elin Sandberg", role: "Director, Öland Sculpture Park" },
                    { text: "“Sixty-two flats and not one of them feels like a corridor. The stairs alone were worth the argument.”", name: "Henrik Dahl", role: "Fjord Bolig AS" },
                    { text: "“We asked for a gallery and were given a room that already knew what it was. They kept everything worth keeping.”", name: "Petra Novotná", role: "Lumen Foundation" },
                ],
            },
            autoRotate: { type: ControlType.Boolean, title: "Turn by Itself", defaultValue: true },
            interval: {
                type: ControlType.Number, title: "Every (seconds)", min: 2, max: 30, step: 1, defaultValue: 7,
                hidden: (p: any) => p.autoRotate === false,
            },
        },
    },

    contact: {
        type: ControlType.Object,
        title: "⑬ Contact",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Contact" },
            heading: { type: ControlType.String, title: "Heading", defaultValue: "Tell us about the site" },
            intro: {
                type: ControlType.String, title: "Intro", displayTextArea: true,
                defaultValue: "A location, a rough area and a date is enough to start. We answer within two working days.",
            },
            email: { type: ControlType.String, title: "Your Email", defaultValue: "studio@archizen.com" },
            endpoint: {
                type: ControlType.String,
                title: "Form Endpoint",
                placeholder: "https://formspree.io/f/…",
                description:
                    "Framer will not deliver a form posted from inside a code component. Paste a form-relay address (Formspree, Basin, Getform) and the message is sent in the background with a thank-you on the page. Leave it empty and the button opens the visitor's own mail app instead — nothing to set up, but they have to press send a second time.",
            },
            mailSubject: { type: ControlType.String, title: "Mail Subject", defaultValue: "Project enquiry" },
            nameLabel: { type: ControlType.String, title: "Field: Name", defaultValue: "Your name" },
            emailLabel: { type: ControlType.String, title: "Field: Email", defaultValue: "Email" },
            locationLabel: { type: ControlType.String, title: "Field: Place", defaultValue: "Where is the project?" },
            messageLabel: { type: ControlType.String, title: "Field: Message", defaultValue: "What are you planning?" },
            buttonLabel: { type: ControlType.String, title: "Button", defaultValue: "Send enquiry" },
            thanksText: {
                type: ControlType.String, title: "Thank You", displayTextArea: true,
                defaultValue: "Thank you — your message is on its way. We will reply within two working days.",
            },
            addressTitle: { type: ControlType.String, title: "Label: Address", defaultValue: "Studio" },
            address: {
                type: ControlType.String, title: "Address", displayTextArea: true,
                defaultValue: "Kampa Island 14\n118 00 Prague 1\nCzech Republic",
            },
            reachTitle: { type: ControlType.String, title: "Label: Contact", defaultValue: "Talk to us" },
            phone: { type: ControlType.String, title: "Phone", defaultValue: "+420 212 345 678" },
            hoursTitle: { type: ControlType.String, title: "Label: Hours", defaultValue: "Hours" },
            hours: {
                type: ControlType.String, title: "Hours", displayTextArea: true,
                defaultValue: "Monday to Friday, 9:00 — 18:00\nSite visits by arrangement",
            },
            showMap: { type: ControlType.Boolean, title: "Show Map", defaultValue: true },
            mapAddress: {
                type: ControlType.String, title: "Map Address", defaultValue: "Kampa Island, Prague",
                hidden: (p: any) => p.showMap === false,
                description: "A street address, not a Maps link — Google places the pin from what you type.",
            },
            mapZoom: {
                type: ControlType.Number, title: "Map Zoom", min: 3, max: 20, step: 1, defaultValue: 14,
                hidden: (p: any) => p.showMap === false,
            },
            mapMono: {
                type: ControlType.Boolean, title: "Grey Map", defaultValue: true,
                hidden: (p: any) => p.showMap === false,
            },
        },
    },

    footer: {
        type: ControlType.Object,
        title: "⑭ Footer",
        controls: {
            showSection: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
            wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: "ARCHIZEN" },
            leftText: { type: ControlType.String, title: "Left", defaultValue: "© 2026 ARCHIZEN Architecture Studio" },
            rightText: { type: ControlType.String, title: "Right", defaultValue: "Kampa Island 14, Prague" },
            topLabel: { type: ControlType.String, title: "Back to Top", defaultValue: "Back to top" },
        },
    },
})
