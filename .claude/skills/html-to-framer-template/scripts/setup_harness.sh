#!/usr/bin/env bash
# Build a sandbox where a Framer code component can actually be rendered.
#
#   setup_harness.sh <sandbox-dir> [component.tsx]
#
# Framer is a hosted editor with no local preview, so without this the only way
# to check a change is to ask someone to paste the file into Framer and report
# back. This bundles the real component against a stub `framer` package and
# renders it in headless Chromium instead.
#
# Safe to re-run: npm install prunes the hand-made stub, so the stub is written
# again on every run.
set -euo pipefail

SANDBOX="${1:?usage: setup_harness.sh <sandbox-dir> [component.tsx]}"
COMPONENT="${2:-}"

mkdir -p "$SANDBOX"
cd "$SANDBOX"

if [ ! -f package.json ]; then
  echo '{"name":"framer-harness","private":true,"version":"1.0.0"}' > package.json
fi

echo "installing dependencies..."
npm install --silent --no-audit --no-fund \
  react react-dom esbuild @types/react @types/react-dom playwright >/dev/null

# --- the stub `framer` package -------------------------------------------
# ControlType as a Proxy returns each member's own name, so the component's
# control definitions evaluate without the real enum. addPropertyControls
# stashes them on globalThis so a probe can read them back out.
mkdir -p node_modules/framer
cat > node_modules/framer/package.json <<'JSON'
{"name":"framer","version":"1.0.0","main":"index.js","types":"index.d.ts"}
JSON
cat > node_modules/framer/index.js <<'JS'
export const ControlType = new Proxy({}, { get: (t, k) => String(k) })
export function addPropertyControls(component, controls) { globalThis.__CONTROLS__ = controls }
export const RenderTarget = { current: () => globalThis.__RENDER_TARGET__ || "preview",
                              canvas: "canvas", preview: "preview", export: "export", thumbnail: "thumbnail" }
JS
cat > node_modules/framer/index.d.ts <<'DTS'
export declare const ControlType: any
export declare function addPropertyControls(...args: any[]): any
export declare const RenderTarget: any
DTS

# --- the page the bundle renders into ------------------------------------
# The viewport meta is not decoration: without it Chromium lays a page out at
# 980px under mobile emulation, and every measurement taken is nonsense.
cat > index.html <<'HTML'
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}</style>
<div id="root"></div>
<script src="bundle.js"></script>
HTML

# --- screenshot runner ----------------------------------------------------
cat > shoot.js <<'JS'
// shoot.js [out.png] [width] [height] [mobile]
const { chromium } = require("playwright")
const path = require("path")

const [out = "out.png", w = "1440", h = "900", mobile = ""] = process.argv.slice(2)
const isMobile = mobile === "mobile"

;(async () => {
  const exe = process.env.PLAYWRIGHT_CHROMIUM || undefined
  const browser = await chromium.launch(exe ? { executablePath: exe } : {})
  const page = await browser.newPage({
    viewport: { width: +w, height: +h },
    deviceScaleFactor: isMobile ? 3 : 2,
    isMobile,
    hasTouch: isMobile,
  })
  const errs = []
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message))
  page.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()))

  await page.goto("file://" + path.join(__dirname, "index.html"))
  await page.waitForTimeout(700)

  // Walk the page before shooting. Scroll-driven reveals never fire during a
  // full-page capture, because the viewport becomes the height of the whole
  // page and nothing ever crosses into view — sections that animate in would
  // photograph as blank.
  const max = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < max; y += Math.round(+h * 0.6)) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)

  await page.screenshot({ path: out, fullPage: true })

  console.log(errs.length ? errs.join("\n") : "clean")
  await browser.close()
})()
JS

# --- property control probe ----------------------------------------------
cat > probe.js <<'JS'
// node probe.js  — after: npx esbuild probe.tsx --bundle --outfile=probe-bundle.js --loader:.tsx=tsx
require("./probe-bundle.js")
const controls = globalThis.__CONTROLS__ || {}
const names = Object.keys(controls)
if (!names.length) { console.log("no controls captured — did addPropertyControls run?"); process.exit(1) }
for (const [k, v] of Object.entries(controls)) {
  const def = v.defaultValue === undefined ? "" : JSON.stringify(v.defaultValue).slice(0, 46)
  console.log(k.padEnd(30), String(v.type).padEnd(10), def)
}
console.log("\n" + names.length + " controls")
JS

if [ -n "$COMPONENT" ] && [ -f "$COMPONENT" ]; then
  cp "$COMPONENT" ./Component.tsx
  cat > probe.tsx <<'TSX'
import "./Component"
TSX
  cat > entry.tsx <<'TSX'
import React from "react"
import { createRoot } from "react-dom/client"
import Component from "./Component"

const W = window as any
;(globalThis as any).__RENDER_TARGET__ = W.__RT__ || "preview"

// Framer applies each control's defaultValue before rendering; the stub only
// captures the controls. Without this a component rendered with bare {} shows
// blank strings everywhere and looks broken for no reason. Rebuild the default
// props from the captured controls, then let anything passed in override them.
function defaultsFrom(controls: any): any {
    const out: any = {}
    for (const [key, c] of Object.entries<any>(controls || {})) {
        if (c && c.type === "Object" && c.controls) out[key] = defaultsFrom(c.controls)
        else if (c && c.defaultValue !== undefined) out[key] = c.defaultValue
    }
    return out
}

function merge(base: any, over: any): any {
    if (!over) return base
    const out = { ...base }
    for (const [k, v] of Object.entries<any>(over)) {
        out[k] =
            v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object"
                ? merge(base[k], v)
                : v
    }
    return out
}

// Set window.__PROPS__ before bundle.js to override anything for a given shot.
const props = merge(defaultsFrom((globalThis as any).__CONTROLS__), W.__PROPS__)
createRoot(document.getElementById("root")!).render(<Component {...props} />)
TSX
  echo "copied $(basename "$COMPONENT") -> Component.tsx"
fi

cat <<EOF

harness ready in $SANDBOX

  render:   npx esbuild entry.tsx --bundle --outfile=bundle.js --loader:.tsx=tsx \\
              --define:process.env.NODE_ENV='"production"' && node shoot.js out.png
  mobile:   node shoot.js mobile.png 390 844 mobile
  controls: npx esbuild probe.tsx --bundle --outfile=probe-bundle.js --loader:.tsx=tsx && node probe.js

If Playwright cannot find a browser (sandboxes usually ship one rather than
letting npm download it), point it at the existing binary:

  PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium node shoot.js out.png

Then look at the PNG. A component that compiles is not a component that renders.
EOF
