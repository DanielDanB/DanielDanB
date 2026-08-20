# Mockups, listing panels and scroll videos

Everything here is rendered from the real page in a headless browser rather than
drawn. That is not purity: a mockup drawn to look like the product drifts from it
within a week, and a buyer who spots the difference has been misled.

## Contents

- [Device frames](#device-frames)
- [Listing panels](#listing-panels)
- [Scroll videos](#scroll-videos)
- [The clock problem](#the-clock-problem)
- [ffmpeg without ffmpeg](#ffmpeg-without-ffmpeg)
- [Sizes worth knowing](#sizes-worth-knowing)

## Device frames

Screenshot the page, then set the image into a frame built in CSS — a browser
window (rounded corners, chrome bar, three dots, a pill with the domain) or a
phone (dark bezel, rounded screen, island, home indicator). Render the whole
scene in Chromium at `deviceScaleFactor: 1.5` or `2`.

Two things must be settled before a full-page capture, or the shot shows a
half-built page:

- **Scroll-driven reveals never fire.** When the viewport is the height of the
  whole page, nothing ever crosses into view. Force the end state:
  `.fade-in, .reveal { opacity: 1 !important; transform: none !important }`, and
  add whatever class the JavaScript would have added.
- **Third-party embeds cannot load** without network access. A Google Maps iframe
  records as a blank rectangle. Swap it for a drawn SVG placeholder for the
  capture only, and take the brand tint off — a tint meant for a full-colour map
  doubles up on a pale placeholder.

Trim the transparent margin off a device render before laying it out, or it
floats in the middle of its box:

```python
im = Image.open(src)
bbox = im.getbbox()
if bbox: im = im.crop(bbox)
```

## Listing panels

The layout that sells a template: a left column carrying the pitch, and the right
side showing it running on real devices.

Left column, top to bottom — logo lockup, a small mono kicker
(`FRAMER TEMPLATE`), a two-line headline with the second line in the accent
colour, one short paragraph, four features each with an icon tile, and a
highlight pill at the bottom. Right side — a laptop with the desktop screenshot
and a phone overlapping its lower right. A thin band across the bottom with a
one-line caption and a row of device icons.

One panel per section of the site, each headline naming what that section does,
gives a listing that walks a buyer through the whole product. Screenshot each
section scrolled so its heading sits just under the sticky navbar — that is the
framing a visitor actually sees.

Watch for animations that open progressively on scroll. A timeline whose cards
expand one at a time photographs as a row of empty stubs when caught at the top
of the section. Force them all open for the capture.

### Two mistakes that cost a re-render

**`%%` in an f-string.** If the page template uses `%`-formatting, its CSS
percentages are escaped as `%%`. Body strings built with f-strings must use a
single `%`, or `width: 46%%` reaches the browser and is silently ignored — the
column then shrinks to its content and the layout looks wrong for no visible
reason.

**A canvas that does not fit the content.** `html, body { overflow: hidden }`
means an over-long page is cropped rather than scrolled, and the overflow check
reports clean. Either measure and size the canvas to the content, or capture with
`fullPage: true` and let the page grow — and if you do the latter, drop
`background-attachment: fixed`, which paints the gradient only over the first
viewport and leaves white below.

## Scroll videos

Record the page scrolling top to bottom, then composite it into a device frame.

Step the scroll yourself, one frame at a time, rather than recording a live
scroll — a live scroll drops frames and fights the browser's own smooth
scrolling. Ease in and out, and hold still for a beat at each end:

```js
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const y = Math.round(max * ease(i / (scrollFrames - 1)))
await page.evaluate((y) => window.scrollTo(0, y), y)
const buf = await page.screenshot({ type: "jpeg", quality: 95 })
```

**Frames, not seconds, is the unit that matters.** Smoothness is pixels moved per
frame. Roughly 4 px per frame at 60 fps reads as smooth; 8 px per frame at 30 fps
judders and, worse, starves the encoder — a full-frame scroll changes every pixel,
so a thrifty `-crf` produces visible mush. Use `-crf 18` and give the scroll
enough frames.

Composite in four layers so the footage sits inside the device rather than on top
of it: background, device body, footage, then the few pieces that belong in front
of the screen (a phone's island and home indicator, and the rounded screen
corners). Bake the corner slivers into the front layer by sampling them from the
finished background — masking every frame with `alphamerge` costs a full RGBA pass
per frame for a handful of pixels, and turns a 20-second encode into a 20-minute
one.

**`-shortest` does not reach inside a filtergraph.** `overlay` with a looping
still image as its first input keeps emitting frames forever after the footage
ends. The encode never finishes and the file grows without limit. Put
`shortest=1` on the overlay itself, and pass `-frames:v <count>` as a second
guard.

## The clock problem

This is the subtle one, and it silently ruins a recording.

Capture runs far slower than real time — a screenshot takes something like a
quarter of a second but represents 1/60 s of finished video, a factor of roughly
fifteen. Anything the page times against the wall clock therefore races past
between two frames and never lands in the video:

- a hero cross-fade on a 4-second interval flickers past in half a second
- a reveal transition is already finished by the next frame
- a particle burst that lives 800 ms is simply never photographed

Put the page on a slowed clock. Measure the real cost of a frame first rather
than assuming it — machines differ, and the factor has to be right:

```js
const scale = measuredSecondsPerFrame * fps

// setTimeout/setInterval — must be installed before the page's own scripts run
await page.addInitScript((scale) => {
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window)
  window.setTimeout = (fn, d, ...a) => st(fn, (d || 0) * scale, ...a)
  window.setInterval = (fn, d, ...a) => si(fn, (d || 0) * scale, ...a)
}, scale)

// CSS animations and transitions run off a separate timeline
const cdp = await page.context().newCDPSession(page)
await cdp.send("Animation.enable")
await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / scale })
```

Both halves are needed. The CDP call alone leaves a particle that JavaScript
removes after 900 ms being deleted long before its slowed animation has played.

For something you want exact control over — a hero cross-fade timed to the video
rather than merely slowed — stop the page's own timer and drive it per frame
instead, counting in output frames:

```js
const phase = Math.max(0, i - startFrames)
const cur = Math.floor(phase / HOLD) % photos.length
const into = phase % HOLD
const raw = into > HOLD - FADE ? (into - (HOLD - FADE)) / FADE : 0
const k = raw * raw * (3 - 2 * raw)          // ease, don't ramp linearly
```

Stop the page's interval through its own API where one exists — this hero pauses
on hover, so `wrap.dispatchEvent(new MouseEvent("mouseenter"))` is cleaner than
reaching into its internals.

## ffmpeg without ffmpeg

A sandbox often has no ffmpeg. Playwright ships one, but it is built with almost
everything disabled — VP8/WebM only, no H.264. `pip install imageio-ffmpeg` gets
a full static build with `libx264`:

```python
import imageio_ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
```

## Sizes worth knowing

| Where | Size | Notes |
| --- | --- | --- |
| Etsy listing image | 2000 × 2000 px | Square; 3000 × 2000 also renders well |
| Etsy listing video | 5–15 s, ≤ 100 MB | Muted on playback — never rely on audio |
| Listing panel | 3000 × 2000 px | 3:2 suits Etsy, Gumroad and a site hero alike |
| Desktop capture | 1440 × 900 @2× | The frame a laptop actually shows |
| Phone capture | 390 × 844 @3× | |
| Social share image | 1200 × 630 px | |

Produce two cuts of every video: a long one at full length for a site or
portfolio, and a short one at double speed for Etsy's 15-second ceiling. Both come
from the same frames — play them at 60 fps and at 120 fps input against a 60 fps
output.
