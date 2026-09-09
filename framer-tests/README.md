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
