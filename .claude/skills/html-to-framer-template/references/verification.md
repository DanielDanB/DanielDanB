# Seeing the component actually render

Framer is a hosted editor, so there is no local preview. Without a harness the
only way to check a change is to ask the user to paste the file into Framer and
report back — a round-trip measured in hours, and they are the one who pays for
your mistake.

The harness bundles the real `.tsx` against a stub `framer` package and renders
it in headless Chromium. It takes a couple of minutes to set up and pays for
itself the first time it catches a CSS specificity accident.

## Contents

- [Setting up](#setting-up)
- [Rendering a screenshot](#rendering-a-screenshot)
- [Reading the property controls back out](#reading-the-property-controls-back-out)
- [Traps in the harness itself](#traps-in-the-harness-itself)
- [What to check, beyond "it renders"](#what-to-check-beyond-it-renders)

## Setting up

```bash
scripts/setup_harness.sh /path/to/sandbox /path/to/Component.tsx
```

It creates the sandbox, installs React, react-dom, esbuild, `@types/react` and
Playwright, writes the stub `framer` package, and copies the component in.

It writes a `shoot.js` and a `probe.js` alongside, so the loop is three commands.
Sandboxes usually ship a browser rather than letting npm download one; point
Playwright at it with `PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium` if the
launch fails.

The stub is three lines of substance:

```js
export const ControlType = new Proxy({}, { get: (t, k) => String(k) })
export function addPropertyControls(c, controls) { globalThis.__CONTROLS__ = controls }
export const RenderTarget = { current: () => "preview", canvas: "canvas", preview: "preview" }
```

`ControlType` as a Proxy means any member access returns its own name, so the
component's control definitions evaluate without needing the real enum. Stashing
the controls on `globalThis` is what makes them readable later. Switch
`RenderTarget.current()` to `"canvas"` to check the canvas-only branches.

Install `@types/react`. Without it, TypeScript reports a stream of phantom errors
about `key` props and JSX intrinsics that hide the two or three real ones — a
callback ref that returns a value instead of `void` is the classic case, and it
is invisible in the noise.

## Rendering a screenshot

Write an entry that supplies whatever props the section under test needs. Props
you omit fall back to the component's own defaults, which is usually what you
want:

```tsx
// entry.tsx
import React from "react"
import { createRoot } from "react-dom/client"
import Site from "./Component"

const props: any = {
  showPortfolio: true,
  items: (window as any).__OPTS__?.photos?.map((src: string, i: number) => ({
    portfolioImage: { src },
    portfolioTitle: "Project " + (i + 1),
  })) ?? [],
}
createRoot(document.getElementById("root")!).render(<Site {...props} />)
```

```bash
npx esbuild entry.tsx --bundle --outfile=bundle.js \
  --loader:.tsx=tsx --define:process.env.NODE_ENV='"production"'
```

```js
// shoot.js
const { chromium } = require("playwright")
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const errs = []
  p.on("pageerror", (e) => errs.push(e.message))
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()))
  await p.goto("file://" + __dirname + "/index.html")
  await p.waitForTimeout(800)
  await p.screenshot({ path: "out.png", fullPage: true })
  console.log(errs.length ? errs : "clean")
  await b.close()
})()
```

Then **look at the screenshot**. That is the point of the exercise. A diff can be
read as correct and still produce a white rectangle where a photo should be.

## Reading the property controls back out

The most common Framer bug is a control that does not exist, is named differently
than you think, or carries a stale default. The stub captures them:

```tsx
// probe.tsx
import "./Component"
```

```bash
npx esbuild probe.tsx --bundle --outfile=probe.js --loader:.tsx=tsx
node -e "
  require('./probe.js');
  const c = globalThis.__CONTROLS__;
  for (const [k, v] of Object.entries(c))
    console.log(k.padEnd(28), v.type.padEnd(10), JSON.stringify(v.defaultValue ?? '').slice(0, 40));
"
```

Use it to confirm a new control landed with the default you intended, and that
you have not shipped two controls whose `hidden` predicates contradict each other
so neither ever shows.

## Traps in the harness itself

**A test page with no viewport meta lays out at 980 px.** Under mobile emulation
Chromium falls back to a 980 px layout width when the page does not declare
`<meta name="viewport" content="width=device-width, initial-scale=1">`. You then
measure a 980 px modal on a 390 px screen and chase a bug that does not exist.
Put the meta tag in the harness page.

**`npm install` prunes the stub.** The hand-made `node_modules/framer` is not in
`package.json`, so any later install deletes it. Recreate it after every install
— `setup_harness.sh` is idempotent, so just run it again.

**Errors go to two channels.** Listen for both `pageerror` and console errors.
React logs a great deal through `console.error` that never becomes an exception.

## What to check, beyond "it renders"

**The resting state, not only the state after the interaction.** A thank-you
message that is meant to be hidden until submit, a modal before it opens, an
accordion before it is tapped. A `.form-sent { display: flex }` rule beating the
`hidden` attribute passes every test that only asserts the after-state. Assert
both, and add `[hidden] { display: none !important }` to the stylesheet.

**With JavaScript disabled.** `browser.newContext({ javaScriptEnabled: false })`.
This is how buyers open a downloaded `.html` in a phone's file preview, and it is
the difference between a working page and a white screen.

**With a `<base href>` injected.** Some hosts add one, and it breaks every
`#anchor` link on the page — buttons look alive and do nothing. Reproduce it by
injecting the tag before load.

**Scroll the page the way the page allows.** A stylesheet with
`html { scroll-behavior: smooth }` turns every `window.scrollTo` into an
animation. A probe that jumps 400 px and waits 120 ms then never actually
arrives, so scroll-driven reveals stay unfired and you conclude a section is
broken when it is fine. Pass `behavior: "instant"` explicitly:

```js
await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y)
```

This one is nasty because it produces a *false positive* — you go hunting for a
bug that only exists in the harness. If a reveal looks dead, confirm against the
original page before changing anything.

**Pixel sampling for colour questions.** When the question is "is this actually
transparent" or "did the accent reach this element", read the pixels rather than
squinting:

```python
from PIL import Image
im = Image.open("out.png").convert("RGBA")
print(im.getpixel((120, 340)))
```

**Both breakpoints.** Render at 1440 × 900 and at 390 × 844 with `isMobile: true`
and `hasTouch: true`. Most of the reported bugs in this kind of template are
mobile-only, because that is the layout that gets least attention while building.
