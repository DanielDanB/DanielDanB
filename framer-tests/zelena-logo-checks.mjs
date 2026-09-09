import { renderToStaticMarkup } from "react-dom/server"
import React from "react"
import Site from "./run/zv-build.mjs"

let fails = 0
const ok = (c, m) => { if (!c) { fails++; console.log("  FAIL " + m) } }

const bare = renderToStaticMarkup(React.createElement(Site))
ok(bare.includes("zv-logo"), "renders the wordmark")
ok(bare.includes("Zelená"), "wordmark text present by default")
ok(!bare.includes("zv-logo-mark"), "no image element when no logo uploaded")

const withLogo = renderToStaticMarkup(React.createElement(Site, {
  header: { logoImage: "https://example.com/logo.svg", logoHeight: 56 },
  footer: { logoImage: "https://example.com/logo.svg" },
}))
ok(withLogo.includes('class="zv-logo-mark"'), "logo image renders")
ok(withLogo.includes("height:56px"), "logo height applied")
ok(withLogo.includes('alt="Zelená Vinice"'), "logo alt derived from the name")
const marks = (withLogo.match(/zv-logo-mark/g) || []).length
ok(marks === 2, `logo in header and footer (found ${marks})`)
ok(!/zv-logo-name/.test(withLogo), "wordmark stands aside for the logo")

const both = renderToStaticMarkup(React.createElement(Site, {
  header: { logoImage: "x.png", logoShowText: true },
}))
ok(/zv-logo-mark[\s\S]*zv-logo-name/.test(both), "logo and name together when asked")

for (const bad of [0, null, undefined, "", "abc", -20]) {
  const odd = renderToStaticMarkup(React.createElement(Site, {
    header: { logoImage: "x.png", logoHeight: bad },
  }))
  const m = odd.match(/zv-logo-mark[^>]*height:(\d+)px/)
  ok(m && +m[1] >= 12, `a bad height (${JSON.stringify(bad)}) still renders a visible logo`)
}

// panel integrity, including the new controls
const walk = (map, path = "") => {
  for (const [key, c] of Object.entries(map)) {
    const where = path + key
    if (!c.title) { fails++; console.log("  FAIL no title: " + where) }
    if (c.hidden) for (const arg of [undefined, null, {}, { show: false }, { logoImage: "x" }]) {
      try { c.hidden(arg) } catch { fails++; console.log(`  FAIL hidden(${JSON.stringify(arg)}) throws: ${where}`) }
    }
    if (c.options && c.optionTitles) ok(c.options.length === c.optionTitles.length, "enum lengths " + where)
    if (c.controls) walk(c.controls, where + ".")
    if (c.control && c.control.controls) walk(c.control.controls, where + "[].")
  }
}
walk(Site.propertyControls)

// the new fields must actually be in the panel, in the right groups
for (const group of ["header", "footer"]) {
  const c = Site.propertyControls[group].controls
  for (const key of ["logoImage", "logoHeight", "logoShowText"]) ok(!!c[key], `${group}.${key} present`)
  ok(c.logoHeight.hidden({ logoImage: "" }) === true, `${group}: height hidden without a logo`)
  ok(c.logoHeight.hidden({ logoImage: "x" }) === false, `${group}: height shown with a logo`)
  ok(c.logo.hidden({ logoImage: "x" }) === true, `${group}: name hidden behind a logo`)
  ok(c.logo.hidden({ logoImage: "x", logoShowText: true }) === false, `${group}: name back when kept`)
  ok(c.logo.hidden({}) === false, `${group}: name shown with no logo`)
}
console.log(fails ? `\n${fails} failing check(s)` : "\nall checks passed")
process.exit(fails ? 1 : 0)
