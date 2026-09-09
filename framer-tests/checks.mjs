import { renderToStaticMarkup } from "react-dom/server"
import React from "react"
import Site, { globalCSS, sectionCSS, scopeCSS, DEFAULTS, resolveColors, THEMES } from "./run/build.mjs"

let fails = 0
const ok = (cond, msg) => { if (!cond) { fails++; console.log("  FAIL " + msg) } }

// 1. renders with no props at all, and with sections switched off
const bare = renderToStaticMarkup(React.createElement(Site))
ok(bare.includes("act-root"), "renders bare")
ok(bare.includes("ALEX") || bare.includes("Alex"), "renders brand")
const off = renderToStaticMarkup(React.createElement(Site, {
  hero: { show: false }, gallery: { show: false }, process: { show: false },
}))
ok(off.length > 200, "renders with sections off")
const custom = renderToStaticMarkup(React.createElement(Site, {
  colors: { preset: "custom", ink: "#101010", paper: "#fff", accent: "#ff0055" },
  motion: { cursor: false, grain: false, indicator: false, smooth: false },
  nav: { items: [{ label: "Start", target: "cta" }] },
}))
ok(custom.includes("act-root") && !custom.includes("cursor-dot"), "renders with motion switched off")

// 2. panel integrity
const controls = Site.propertyControls
ok(controls && Object.keys(controls).length > 8, "controls present")
const walk = (map, path = "") => {
  for (const [key, c] of Object.entries(map)) {
    const where = path + key
    if (!c.title && key !== "control") { fails++; console.log("  FAIL no title: " + where) }
    if (c.hidden) {
      for (const arg of [undefined, null, {}]) {
        try { c.hidden(arg) } catch (e) { fails++; console.log(`  FAIL hidden(${String(arg)}) throws: ${where}`) }
      }
    }
    if (c.options && c.optionTitles) ok(c.options.length === c.optionTitles.length, "enum lengths " + where)
    if (c.controls) walk(c.controls, where + ".")
    if (c.control && c.control.controls) walk(c.control.controls, where + "[].")
  }
}
walk(controls)

// 3. every theme defines every colour the palette reads
const base = Object.keys(resolveColors({ ...DEFAULTS.colors, preset: "custom" }))
for (const [name, preset] of Object.entries(THEMES)) {
  if (!preset) continue
  const keys = Object.keys(resolveColors({ ...DEFAULTS.colors, ...preset, preset: "custom" }))
  ok(base.every(k => keys.includes(k)), "theme complete: " + name)
  for (const need of ["ink", "paper", "accent"]) ok(preset[need], `${name} defines ${need}`)
}

// 4. the stylesheet is scoped and keyframes survive
const css = scopeCSS(globalCSS(resolveColors(DEFAULTS.colors), DEFAULTS.type) + sectionCSS(resolveColors(DEFAULTS.colors), DEFAULTS.type), ".act-root")
const selectors = css.split("{").slice(0, -1).map(s => s.split("}").pop().trim()).filter(Boolean)
for (const sel of selectors) {
  if (sel.startsWith("@") || /^\d/.test(sel) || sel === "from" || sel === "to") continue
  for (const part of sel.split(",")) {
    if (part.trim() && !part.trim().startsWith(".act-root")) { fails++; console.log("  FAIL unscoped: " + part.trim()) }
  }
}
ok(css.includes("@keyframes actGrain"), "keyframes kept")
ok(!/overflow-x:\s*hidden/.test(css), "no overflow-x hidden")

// 5. panel labels stay in one language (no stray diacritics)
const strings = []
const collect = (map) => { for (const c of Object.values(map)) {
  if (c.title) strings.push(c.title)
  if (c.optionTitles) strings.push(...c.optionTitles)
  if (typeof c.defaultValue === "string") strings.push(c.defaultValue)
  if (c.controls) collect(c.controls)
  if (c.control && c.control.controls) collect(c.control.controls)
} }
collect(controls)
for (const s of strings) if (/[ěščřžýáíéúůťďňĚŠČŘŽÝÁÍÉÚŮ]/.test(s)) { fails++; console.log("  FAIL non-English label: " + s) }

console.log(fails ? `\n${fails} failing check(s)` : "\nall checks passed")
process.exit(fails ? 1 : 0)
