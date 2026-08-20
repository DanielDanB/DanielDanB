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
  a downloaded HTML file that shows a blank page on a phone.
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
is impossible. Implement it as a switch the user flips on and then off:

```tsx
const resolvedAccent = useDefaultColors ? DEFAULT_ACCENT : accentColor || DEFAULT_ACCENT
```

### An uploaded icon renders as a solid coloured square

The instinct is a CSS mask. A mask needs an alpha channel, and buyers upload PNGs
with a white or coloured background, so the whole square gets painted. Derive the
shape from the pixels instead — sample the corner, treat colour distance from it
as alpha, then paint through with `globalCompositeOperation = "source-in"`.
Full code in `references/image-processing.md`.

The same file covers lifting a studio backdrop off a product photo (flood fill
inward from the frame edges), which is what makes hero and portfolio images float
on the page instead of showing a grey rectangle.

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
