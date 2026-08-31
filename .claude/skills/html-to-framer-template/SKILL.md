---
name: html-to-framer-template
description: >
  Turn a standalone HTML page into a Framer code component that a non-coder edits
  entirely from the properties panel, and keep the HTML and Framer versions in
  visual lockstep so a template can be sold as both. Use this whenever the work
  touches a Framer code component, addPropertyControls, ControlType, a .tsx that
  gets pasted into Framer, an HTML mockup that has to match a Framer build, or a
  website template being prepared for sale on Etsy, Gumroad or Creative Market.
  Use it as well for the Framer-specific traps that eat a whole afternoon
  otherwise: Fill greyed out on a placed component, a defaultValue that refuses
  to change on an instance already on the canvas, an uploaded icon rendering as a
  solid coloured square, a contact form that cannot post from inside a component,
  a downloaded HTML file that shows a blank page on a phone, a modal or drawer
  that lands halfway down the published page, a cookie bar that flashes on every
  visit for someone who already accepted.
---

# Selling one design as both an HTML page and a Framer component

The product is a design that a buyer rebrands. It ships twice: as a single
self-contained `.html` file they can upload anywhere, and as a `.tsx` code
component they drop into Framer and edit visually. Both must render the same
site. That constraint drives almost every decision below.

## Order of work

Build in the HTML first, then port. The HTML file has no build step, no editor
to reload, and no property panel to wire up, so a design idea takes a minute to
try instead of ten. Once it looks right, port it to the component and give every
value that a buyer might want to change its own control.

Going the other way — designing in Framer and back-porting to HTML — means every
experiment costs a round-trip through the Framer editor. Avoid it.

When the user reports a bug, ask yourself which of the two files it lives in.
"The button does nothing" in the HTML and in Framer are usually different bugs
with different causes, and fixing one does not fix the other.

## Shape of the component

One default-exported function, one big props interface, and property controls
grouped in the order the sections appear on the page. Number the groups so the
panel reads as a table of contents:

```
① Navbar          ⑧ Materials
② Global Style    ⑨ Portfolio
③ Hero            ⑩ Testimonials
④ Stats           ⑪ FAQ
⑤ About           ⑫ Contact
⑥ Services        ⑬ Footer
⑦ Process
```

Give every content section a `Show Section` boolean. A buyer who runs a
three-page brochure site and one who wants all twelve sections then work from the
same file, and the page closes its own gaps. This is the single feature that
makes a template feel worth paying for, because it removes the fear of deleting
something.

Derive every colour on the page from one accent colour. Change accent, and
buttons, links, gradients, icons, timeline and focus rings all follow. Buyers
judge a template in the first two minutes by whether one colour change makes it
theirs.

## The Framer traps

These are not in the documentation in a form that helps. Each one below cost a
full round-trip with a confused user.

### Fill is greyed out on the placed component

Framer reads layout support from a **block comment** directly above the export.
Line comments are ignored, silently, and the component is then treated as fixed
size:

```tsx
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 3000
 */
export default function Site(props: Props) { ... }
```

`// @framerSupportedLayoutWidth any` does nothing. Use `auto` for height when the
component sizes itself, and give the root element `width: 100%`.

### A control default will not change on the canvas

Framer stores control values **on the placed instance**, not in the code. Editing
or deleting a `defaultValue` changes nothing for a component the user already
dragged onto the canvas — their stored value keeps winning, and the user reports
that your fix did not work.

Adding a *new* control does apply its default, because the instance has nothing
stored for a name it has never seen. So when a default genuinely has to change,
introduce a new prop rather than editing the old one:

```tsx
// existing instances have no stored value for this name, so the default lands
customIconFollowAccent: { type: ControlType.Boolean, title: "Match Accent Color",
                          defaultValue: true, hidden: (p) => !p.recolorIcons }
```

A component also cannot write to its own props, so a "reset to defaults" button
is impossible — nothing in the code can clear what the user typed into a field.
The best available shape is a two-state Enum meaning "ignore those fields",
paired with `hidden`, so the stale values are not on screen contradicting what
the page renders:

```tsx
palette: {
    type: ControlType.Enum, title: "Colors",
    options: ["custom", "original"], optionTitles: ["My colors", "Original palette"],
    defaultValue: "custom", displaySegmentedControl: true,
},
background: {
    type: ControlType.Color, title: "Background", defaultValue: DEFAULT_BG,
    hidden: (p: StyleGroup) => (p.palette || "custom") === "original",
},
```

```tsx
const useOriginal = (globalStyle.palette || "custom") === "original"
const bg = useOriginal ? DEFAULT_BG : globalStyle.background || DEFAULT_BG
```

Say plainly in the `description` that switching back brings the old colours with
it, and that a true wipe means deleting the instance and dragging a fresh one out
of Assets — a new instance has nothing stored, so every default applies. Users do
ask for a real reset button; the honest answer is that Framer owns those stored
values, not the component.

### An uploaded icon renders as a solid coloured square

The instinct is a CSS mask. A mask needs an alpha channel, and buyers upload PNGs
with a white or coloured background, so the whole square gets painted. Derive the
shape from the pixels instead — sample the corner, treat colour distance from it
as alpha, then paint through with `globalCompositeOperation = "source-in"`.
Full code in `references/image-processing.md`.

The same file covers lifting a studio backdrop off a product photo (flood fill
inward from the frame edges), which is what makes hero and portfolio images float
on the page instead of showing a grey rectangle.

### A modal, drawer or cookie bar lands in the wrong place

Framer's published page sits inside a **transformed** wrapper, and a transform
makes that element the containing block for `position: fixed` descendants. So
"fixed" stops meaning the viewport and starts meaning the whole page:

- a modal at `top: 50%` lands halfway down a 4000 px page, usually off screen —
  the backdrop covers everything, so the symptom is a dimmed page with no
  dialog in it;
- a scrim at `inset: 0` shades the entire page rather than the viewport;
- a drawer parked off-canvas at `right: -100%` is not clipped by any ancestor's
  overflow, so it becomes real horizontal overflow and the published page ends
  up twice the viewport width.

Render every fixed layer through a portal onto `document.body`, in a wrapper
that carries the root class and the palette so the scoped CSS still reaches it:

```tsx
{host && createPortal(
    <div className={`${ROOT} zv-portal ${widthClass}`} style={vars}>
        {drawer}{modal}{cookieBar}
    </div>, host)}
```
```css
.root.portal { position: static; width: 0; height: 0; background: none;
               overflow: visible; }
```

Then mount the drawer only while it is open and slide it with a transform
rather than parking it off-screen, and add the `active` class inside a double
`requestAnimationFrame` so the closed state paints first and the transition
actually runs.

This is invisible in a plain test page. Reproduce it by wrapping the component
in `transform: translateZ(0)` and asserting, with the page **scrolled**, that
the drawer's `top` is still 0 and the modal's rectangle still intersects the
viewport. Scrolled is the whole point: unscrolled, a broken one looks perfect.

### The cookie bar

**Ship it switched off.** A template that greets its buyer with a consent
banner they did not ask for reads as broken, and a bar that appears before any
analytics exist is worse than no bar at all. `defaultValue: false` on the group's
`Show`, and every other field in the group `hidden` until it is on.

Four things then decide whether it feels finished:

- **Read the stored choice in a layout effect, and render nothing on the first
  pass.** Reading `localStorage` during render throws on the server and, in the
  browser, means the bar paints before the stored answer is known — so someone
  who accepted last week sees it flash on every page load. First render returns
  nothing, the effect decides before paint.
- **Guard every storage access.** Private-mode Safari and a browser set to
  block site data throw on `getItem` as well as `setItem`. Treat a throw as "no
  answer yet": the bar returns next visit, which is the safe direction to fail.
- **Hide it on the canvas unless a styling switch is on.** A fixed bar over the
  design is a nuisance to edit around, and once it is accepted there is no way
  to bring it back — a `RenderTarget.canvas` check plus an "Always show
  (styling)" boolean solves both halves.
- **Expose the storage key as a control.** Changing it is how the buyer asks
  everyone again after the policy changes, and it is the only mechanism they
  have for that.

Be straight about the boundary, in the guide and to the user: a bar records a
choice, it does not block anything, and shipping one is not compliance. What the
component can honestly offer is the choice in a place the buyer's own code can
read it — a known `localStorage` key, plus a `CustomEvent` on `window` when it
changes, so a tracking snippet added later can gate on it. Do not tell them it
makes the site GDPR-compliant; tell them where the switch is.

Make declining as easy as accepting: both buttons on the same row, comparable
in size, no "manage preferences" maze between the visitor and no. A test can
hold that honest — compare the two buttons' rendered areas.

### The contact form cannot post

Framer will not deliver a form submitted from inside a code component. Offer two
routes and default to the one that needs no account:

- `mailto:` — opens the visitor's own mail app, nothing to set up, but the
  visitor has to press send a second time and some won't.
- A form relay (Formspree and equivalents) — `fetch` POST to an endpoint the
  buyer pastes in, visitor sees a thank-you and never leaves the page.

Fall back to `mailto:` when the endpoint field is empty, so a half-configured
template never silently does nothing. Add a hidden honeypot field and drop
anything that fills it.

### The HTML file is blank on a phone

Tapping an `.html` in a phone's Files app opens a *preview*, and previews do not
run scripts. Any content revealed by JavaScript is then invisible — the buyer
sees a white page and asks for a refund.

Gate reveal animations on a class that JavaScript itself adds, so the no-script
path shows everything:

```html
<script>document.documentElement.className += " js";</script>
```
```css
.js .fade-in { opacity: 0; transform: translateY(20px); }
html:not(.js) .fade-in { opacity: 1; transform: none; }
```

Also give the no-script path a usable shape: menu as a plain row of links,
carousels as swipeable rows, accordions shown open, and the form replaced by a
mailto link. Then say plainly in the guide that the full experience needs a real
browser (iPhone: share → Open in Safari).

Test it by actually disabling JavaScript, not by reasoning about it.

### A section animates in on scroll and never appears

An element cannot be its own IntersectionObserver target when its resting state
gives it no area. `clip-path: inset(0 0 0 100%)`, `transform: scaleX(0)`,
`height: 0` — all of them mean the observer computes an empty intersection
rectangle, reports `isIntersecting: false` forever, and the class that would
reveal the element is never added. The section is then invisible on the live
site, permanently, with no error anywhere.

Observe an unclipped wrapper instead:

```tsx
// the frame itself starts clipped to zero width, so watch its parent
const io = new IntersectionObserver(...)
io.observe(wrapperRef.current)
```

This one is easy to carry over from a hand-written HTML page without noticing,
because it is invisible in the source and only shows up when you actually look
at the rendered section.

### In-page anchors go nowhere

Artifact hosts and some CMS previews inject `<base href>`, which makes `#contact`
resolve against another URL — the button looks alive and does nothing. Handle
in-page links with a delegated click handler and `scroll-margin-top` on the
targets rather than relying on native anchor behaviour.

## Guiding the buyer inside the panel

The buyer never reads the guide first. Put the answer where the question is
asked:

- State the recommended pixel size in the control title itself:
  `title: "Hero Photos — 1000 × 1000 px"`.
- Draw an empty image slot on the canvas with its expected size written in it,
  using `RenderTarget.current() === RenderTarget.canvas` so it never appears on
  the published site.
- Name spec fields generically. Three rows the buyer labels themselves
  (`Print Time / 6 h`, `Wood / Oak`, `Location / Prague`) is what lets one
  template serve a workshop, a joiner and a photographer.

## Verify before saying it works

A component that compiles is not a component that renders. Do not report a visual
fix as done on the strength of reading the diff — the CSS specificity accidents
in this kind of file are exactly the sort that look correct in source.

Bundle the real `.tsx` against a stub `framer` package, render it in a headless
browser, and look at the result. `scripts/setup_harness.sh` builds the sandbox;
`references/verification.md` covers the whole loop, including reading
`addPropertyControls` back out to check a control actually exists with the
default you think it has.

Two traps in the harness itself:

- A test page without `<meta name="viewport">` lays out at 980 px under mobile
  emulation, so every measurement is nonsense.
- `npm install` prunes the hand-made `node_modules/framer` stub. Recreate it
  after every install.

When checking a state that is supposed to be hidden — a thank-you message before
submit, a modal before it opens — assert the resting state too, not only the
state after the interaction. A `display:flex` rule beating the `hidden` attribute
looks fine in every test that only checks the after.

## Reference files

Read these as the task needs them rather than upfront.

| File | Read it when |
| --- | --- |
| `references/framer-controls.md` | Wiring the properties panel: control types, conditional `hidden`, repeatable lists, file uploads, canvas-only hints |
| `references/image-processing.md` | Icon recolouring or background removal, in either the component or the HTML |
| `references/verification.md` | Setting up the bundle-and-render harness, or reading property controls back out |
| `references/listing-assets.md` | Producing device mockups, listing panels or scroll videos of the finished site |

## Packaging for sale

What the buyer downloads:

- a one-click Framer duplicate link (File → Copy Remix link in the Framer project)
- the `.tsx`, for dropping into a project they already have
- the standalone `.html`
- the guide, **as PDF** — buyers do not know what a `.md` file is
- the photos, including versions with the background already removed

The remix link lets anyone holding it copy the whole project, so it belongs only
in the paid download — never in a public repository and never in the listing.
Protection is simply not distributing it; if it leaks, generate a new one. The
public demo in the listing should be the published Framer URL or a static host,
which visitors can view but not edit.
