import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs"
const FILE = "file://" + process.env.SD + "/zelenavinice-mockup.html"
const b = await chromium.launch()
let fails = 0
const ok = (c, m) => { if (!c) { fails++; console.log("  FAIL " + m) } }

for (const [w, h, tag] of [[1440, 900, "desktop"], [390, 844, "phone"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs = []; p.on("pageerror", e => errs.push(e.message))
  await p.goto(FILE); await p.waitForTimeout(900)
  const r = await p.evaluate(() => {
    const root = document.querySelector(".zv-root:not(.zv-portal)")
    return {
      cls: root.className,
      styled: getComputedStyle(root.querySelector(".zv-btn")).backgroundColor,
      overflow: document.body.scrollWidth - document.documentElement.clientWidth,
      sections: [...document.querySelectorAll("[data-zv-section]")].map(s => s.getAttribute("data-zv-section")),
      cats: document.querySelectorAll("[data-zv-cat]").length,
      logo: !!document.querySelector(".zv-header .zv-logo"),
      height: Math.round(document.body.scrollHeight),
    }
  })
  ok(r.overflow <= 0, `[${tag}] page overflow ${r.overflow}`)
  ok(r.styled !== "rgba(0, 0, 0, 0)", `[${tag}] stylesheet applied`)
  ok(r.sections.length >= 5, `[${tag}] sections ${r.sections.join(",")}`)
  ok(r.cats > 0, `[${tag}] category tiles ${r.cats}`)
  ok(r.height > 2000, `[${tag}] page height ${r.height}`)
  ok(tag !== "phone" || r.cls.includes("w-xs"), `[${tag}] width class ${r.cls}`)

  // menu link scrolls
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.evaluate(() => {
    const a = [...document.querySelectorAll(".zv-header a, .zv-hero a")]
      .find(x => (x.getAttribute("href") || "") === "#menu")
    if (a) a.click()
  }); await p.waitForTimeout(900)
  ok(await p.evaluate(() => window.pageYOffset) > 100, `[${tag}] in-page link scrolls`)

  // dish modal
  await p.evaluate(() => document.querySelector("[data-zv-cat]").click())
  await p.waitForTimeout(700)
  const modal = await p.evaluate(() => {
    const m = document.querySelector(".zv-modal")
    if (!m) return null
    const r = m.getBoundingClientRect()
    return { open: m.classList.contains("zv-in"), items: m.querySelectorAll(".zv-modal-item").length,
             icons: m.querySelectorAll(".zv-modal-item svg").length, w: Math.round(r.width),
             price: !!m.querySelector(".zv-m-price") }
  })
  ok(modal && modal.open, `[${tag}] modal opens`)
  ok(modal && modal.items > 0, `[${tag}] modal lists dishes (${modal && modal.items})`)
  ok(modal && modal.icons > 0, `[${tag}] dish icons render`)
  ok(modal && modal.price, `[${tag}] prices render`)
  await p.screenshot({ path: `${process.env.SD}/m-${tag}-modal.png` })
  await p.keyboard.press("Escape"); await p.waitForTimeout(600)
  ok(await p.evaluate(() => !document.querySelector(".zv-modal")), `[${tag}] Escape closes the modal`)

  // drawer
  await p.evaluate(() => document.querySelector(".zv-burger").click())
  await p.waitForTimeout(700)
  const drawer = await p.evaluate(() => {
    const d = document.querySelector(".zv-drawer")
    return d ? { in: d.classList.contains("zv-in"), links: d.querySelectorAll("a").length,
                 right: Math.round(d.getBoundingClientRect().right) } : null
  })
  ok(drawer && drawer.in, `[${tag}] drawer opens`)
  ok(drawer && drawer.links > 0, `[${tag}] drawer links`)
  const after = await p.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth)
  ok(after <= 0, `[${tag}] open drawer does not widen the page (${after})`)
  await p.screenshot({ path: `${process.env.SD}/m-${tag}-drawer.png` })
  await p.evaluate(() => document.querySelector(".zv-scrim").click()); await p.waitForTimeout(600)
  ok(await p.evaluate(() => !document.querySelector(".zv-drawer")), `[${tag}] scrim closes the drawer`)
  ok(errs.length === 0, `[${tag}] page errors: ` + errs.join(" | "))
  await p.close()
}

// the no-script path must still show the whole page
const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
await p.goto(FILE); await p.waitForTimeout(500)
const nojs = await p.evaluate(() => ({
  height: Math.round(document.body.scrollHeight),
  hidden: [...document.querySelectorAll(".zv-root:not(.zv-portal) section, .zv-root:not(.zv-portal) header, .zv-root:not(.zv-portal) footer")]
    .filter(el => el.getBoundingClientRect().height < 5).length,
  burger: getComputedStyle(document.querySelector(".zv-burger")).display,
  links: document.querySelectorAll(".zv-nav a").length,
}))
ok(nojs.height > 2000, `no-script page height ${nojs.height}`)
ok(nojs.hidden === 0, `no-script hidden blocks ${nojs.hidden}`)
ok(nojs.burger === "none", `no-script burger hidden (${nojs.burger})`)
ok(nojs.links > 0, "no-script nav links present")
await p.screenshot({ path: `${process.env.SD}/m-nojs.png`, fullPage: false })
await ctx.close()

console.log(fails ? `\n${fails} failing check(s)` : "\nmockup checks passed")
await b.close(); process.exit(fails ? 1 : 0)
