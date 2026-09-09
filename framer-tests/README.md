# Checks for `CarterSite.tsx`

Framer-specific bugs — a group missing from the panel, a component that clips
its own bottom, an off-canvas element that widens the published page — do not
show up in code review. These two scripts measure them instead.

## Setup

```bash
mkdir -p run && cd run
npm init -y && npm i --silent esbuild react react-dom
mkdir -p node_modules/framer
cat > node_modules/framer/index.js <<'JS'
export function addPropertyControls(c, controls) { c.propertyControls = controls }
export const ControlType = new Proxy({}, { get: (_, k) => String(k) })
JS
echo '{ "name": "framer", "version": "0.0.0", "type": "module", "main": "index.js" }' > node_modules/framer/package.json

cp ../../CarterSite.tsx site.tsx
cp site.tsx test-component.tsx
printf '\nexport { globalCSS, sectionCSS, scopeCSS, DEFAULTS, resolveColors, THEMES }\n' >> test-component.tsx
./node_modules/.bin/esbuild test-component.tsx --bundle --format=esm --outfile=build.mjs \
  --loader:.tsx=tsx --packages=external
cd .. && node checks.mjs
```

`checks.mjs` asserts: the component renders with no props at all and with
sections switched off; every control has a title; every `hidden` callback
survives `undefined`, `null` and `{}` (a throw there drops the whole group from
the panel, silently); enum options and titles match; every theme defines every
colour; the stylesheet is fully scoped to `.act-root`, keeps its keyframes and
never uses `overflow-x: hidden`; and panel labels stay in one language.

## In a browser

```bash
cat > entry.jsx <<'JS'
import React from "react"
import { createRoot } from "react-dom/client"
import Site from "./site.tsx"
createRoot(document.getElementById("mount")).render(<Site />)
JS
cat > index.html <<'HTML'
<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#111;height:100%} #frame{transform:translateZ(0)}</style></head>
<body><div id="frame"><div id="mount"></div></div><script src="./app.js"></script></body></html>
HTML
./node_modules/.bin/esbuild entry.jsx --bundle --outfile=app.js --loader:.tsx=tsx \
  --jsx=automatic --define:process.env.NODE_ENV='"production"'
cd .. && SD=$PWD/run node browser.mjs
```

The wrapper's `translateZ(0)` reproduces Framer's transformed page wrapper —
that is what turns a stray fixed element into real page overflow.

`browser.mjs` measures, at four sizes, that the root never overflows, that
`overflow-y` stays `visible` (so Framer's auto-height keeps working), that the
canvas really scrolls, that the stylesheet reached the component, and that the
lifter reaches lockout at the end of the page.

## `zelena-logo-checks.mjs`

Covers the custom logo in `ZelenaViniceSite.tsx`: no image element until a logo
is uploaded, the uploaded mark rendering in both the header and the footer at
the height set in the panel, its `alt` derived from the name, the wordmark
standing aside unless "Keep the name too" is on, a nonsense height still
rendering something visible, and the new `hidden` callbacks surviving
`undefined`, `null`, `{}` and half-filled groups.

```bash
cd run
cp ../../ZelenaViniceSite.tsx zv.tsx
./node_modules/.bin/esbuild zv.tsx --bundle --format=esm --outfile=zv-build.mjs \
  --loader:.tsx=tsx --packages=external
cd .. && node zelena-logo-checks.mjs
```

The `framer` stub needs `RenderTarget` for this component:

```js
export const RenderTarget = { canvas: "CANVAS", export: "EXPORT",
  thumbnail: "THUMBNAIL", preview: "PREVIEW",
  current: () => "PREVIEW", hasRestrictions: () => false }
```

## The standalone page

`zelenavinice-mockup.html` is generated from the component, not written a
second time: `tools/build-zelena-mockup.mjs` renders the same markup through
`react-dom/server`, drops in the same `CSS` constant and the same palette
custom properties, and rewrites only the behaviour — drawer, dish modal,
in-page links and hero parallax — as plain JavaScript at the bottom of the file.

```bash
cd run
cp ../../ZelenaViniceSite.tsx zv-page.tsx
printf '\nexport { CSS, DEFAULTS, ROOT, Icon, SocialRow, ICON_PATHS, resolveColors, buildVars, list, merge }\n' >> zv-page.tsx
./node_modules/.bin/esbuild zv-page.tsx --bundle --format=esm --outfile=zv-page.mjs \
  --loader:.tsx=tsx --packages=external
cd .. && ZV_OUT=../zelenavinice-mockup.html node ../tools/build-zelena-mockup.mjs
```

`mockup-checks.mjs` opens the generated file at desktop and phone size and
asserts: the stylesheet applied, no horizontal overflow, the in-page links
scroll, the dish modal opens with its icons and prices and closes on Escape,
the drawer opens without widening the page and closes on the scrim — and, with
JavaScript disabled, that the whole page is still there and the burger is
hidden, because a phone's file preview does not run scripts.

`mockup-parity.mjs` opens the component and the generated page side by side and
compares page height, section and card counts, the header, hero, button, logo
and footer boxes, their colours and fonts, and the amount of visible text. They
should be identical; if they are not, the generator is out of date.
