import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs"
const b = await chromium.launch()
const read = async (url) => {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(url); await p.waitForTimeout(1400)
  const r = await p.evaluate(() => {
    const root = document.querySelector(".zv-root:not(.zv-portal)")
    const pick = (sel) => { const el = root.querySelector(sel); if (!el) return null
      const b = el.getBoundingClientRect(); const cs = getComputedStyle(el)
      return { w: Math.round(b.width), h: Math.round(b.height), color: cs.color, bg: cs.backgroundColor, font: cs.fontFamily.split(",")[0] } }
    return {
      height: Math.round(root.getBoundingClientRect().height),
      sections: root.querySelectorAll("[data-zv-section]").length,
      cats: root.querySelectorAll(".zv-cat-card").length,
      gallery: root.querySelectorAll(".zv-gal-item").length,
      header: pick(".zv-header"), hero: pick(".zv-hero-card"),
      btn: pick(".zv-btn"), logo: pick(".zv-logo"), footer: pick(".zv-footer"),
      text: (root.innerText || "").replace(/\s+/g, " ").trim().length,
    }
  })
  await p.close(); return r
}
const a = await read("file://" + process.env.SD + "/zv2.html")      // the component
const c = await read("file://" + process.env.SD + "/zelenavinice-mockup.html")  // the mockup
let fails = 0
const near = (x, y, tol, m) => { if (Math.abs(x - y) > tol) { fails++; console.log(`  FAIL ${m}: component ${x} vs mockup ${y}`) } }
const same = (x, y, m) => { if (JSON.stringify(x) !== JSON.stringify(y)) { fails++; console.log(`  FAIL ${m}: ${JSON.stringify(x)} vs ${JSON.stringify(y)}`) } }
near(a.height, c.height, 4, "page height")
same(a.sections, c.sections, "section count")
same(a.cats, c.cats, "menu categories")
same(a.gallery, c.gallery, "gallery items")
same(a.header, c.header, "header box")
same(a.hero, c.hero, "hero card")
same(a.btn, c.btn, "primary button")
same(a.logo, c.logo, "logo box")
same(a.footer, c.footer, "footer box")
near(a.text, c.text, 2, "visible text length")
console.log("component:", JSON.stringify(a))
console.log("mockup   :", JSON.stringify(c))
console.log(fails ? `\n${fails} difference(s)` : "\nmockup matches the component")
await b.close(); process.exit(fails ? 1 : 0)
