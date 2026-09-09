import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs"
const b = await chromium.launch()
let fails = 0
for (const [w, h, tag] of [[1440, 900, "desktop"], [1024, 800, "tablet"], [390, 844, "phone"], [740, 360, "landscape"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs = []
  p.on("pageerror", e => errs.push(e.message))
  await p.goto("file://" + process.env.SD + "/index.html")
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => {
    const root = document.querySelector(".act-root")
    const cs = getComputedStyle(root)
    const rect = root.getBoundingClientRect()
    const sc = root.querySelector(".scroller")
    return {
      overflow: root.scrollWidth - root.clientWidth,
      overflowY: cs.overflowY,
      height: Math.round(rect.height),
      canvas: sc.scrollWidth - sc.clientWidth,
      sections: sc.querySelectorAll(".sec").length,
      styled: cs.backgroundColor,
      total: root.querySelector('[data-hud="total"]').textContent,
    }
  })
  // scroll to the end and back, then check the indicator followed
  await p.evaluate(() => { const s = document.querySelector(".scroller"); s.scrollLeft = s.scrollWidth })
  await p.waitForTimeout(1400)
  const lift = await p.evaluate(() => +document.querySelector('[data-lf="disc"]').getAttribute("cy"))
  await p.screenshot({ path: `${process.env.SD}/${tag}.png` })
  const ok = (c, m) => { if (!c) { fails++; console.log(`  FAIL [${tag}] ${m}`) } }
  ok(r.overflow === 0, `root overflow ${r.overflow}`)
  ok(r.overflowY === "visible", `overflow-y ${r.overflowY}`)
  ok(r.height > 300, `height ${r.height}`)
  ok(r.canvas > 100, `canvas not scrollable (${r.canvas})`)
  ok(r.styled !== "rgba(0, 0, 0, 0)", "stylesheet applied")
  ok(lift < 80, `lifter did not lift (bar y ${lift})`)
  ok(errs.length === 0, "page errors: " + errs.join(" | "))
  console.log(tag, JSON.stringify({ ...r, lift }))
  await p.close()
}
console.log(fails ? `\n${fails} failing check(s)` : "\nbrowser checks passed")
await b.close()
process.exit(fails ? 1 : 0)
