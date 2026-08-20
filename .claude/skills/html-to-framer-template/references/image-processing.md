# Recolouring icons and lifting backgrounds off photos

Both jobs run on a `<canvas>` in the browser, so the same code serves the Framer
component and the standalone HTML. Neither needs a server or a library.

## Contents

- [Why a CSS mask does not work](#why-a-css-mask-does-not-work)
- [Recolouring an uploaded icon](#recolouring-an-uploaded-icon)
- [Lifting a studio backdrop off a photo](#lifting-a-studio-backdrop-off-a-photo)
- [Wiring it into a component](#wiring-it-into-a-component)
- [What to tell the buyer](#what-to-tell-the-buyer)

## Why a CSS mask does not work

The obvious approach to "make this uploaded icon match the accent colour" is
`mask-image: url(icon.png)` over a coloured box. A mask reads the **alpha**
channel. Buyers upload PNGs exported from anywhere — white background, coloured
background, a screenshot — and those are fully opaque, so the mask passes the
entire rectangle and the icon renders as a solid coloured square.

The user reports "there's just a purple square where my icon should be." Believe
them; it is not a caching problem.

The fix is to derive the shape from the pixels: whatever differs from the
background colour is the icon.

## Recolouring an uploaded icon

```js
function recolorIconToDataUrl(img, color) {
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  if (!w || !h) return null

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)

  let data
  try {
    data = ctx.getImageData(0, 0, w, h)
  } catch {
    return null            // cross-origin image; leave it as it is
  }
  const px = data.data

  // Sample the corners. If they are already transparent the icon has a real
  // alpha channel and can be painted through directly.
  const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4]
  const transparentCorners = corners.filter((i) => px[i + 3] < 8).length
  if (transparentCorners < 3) {
    // Opaque background: treat distance from the corner colour as coverage.
    const br = px[corners[0]], bg = px[corners[0] + 1], bb = px[corners[0] + 2]
    for (let i = 0; i < px.length; i += 4) {
      const d = Math.abs(px[i] - br) + Math.abs(px[i + 1] - bg) + Math.abs(px[i + 2] - bb)
      px[i + 3] = Math.min(255, Math.round((d / 120) * 255))
    }
    ctx.putImageData(data, 0, 0)
  }

  // Paint the colour through whatever alpha we now have.
  ctx.globalCompositeOperation = "source-in"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = "source-over"

  return canvas.toDataURL("image/png")
}
```

The corner check matters. A transparent SVG or PNG must not go through the
distance calculation — its background is already alpha 0, and the calculation
would eat the icon's own light areas.

Threshold 120 out of a possible 765 suits flat icon artwork. Softer artwork wants
a higher number; if the icon comes out with a halo, raise it.

## Lifting a studio backdrop off a photo

Product photos on a seamless white or grey sweep look wrong when the design floats
the photo on the page — the buyer sees a grey rectangle. Flood-fill inward from
the frame edges and clear everything that stays close to the edge colour.

Only what *connects to the edge* is removed, which is what protects a white
highlight in the middle of the object:

```js
function cutOutBackground(img, tolerance = 32) {
  const w = img.naturalWidth, h = img.naturalHeight
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)

  let data
  try { data = ctx.getImageData(0, 0, w, h) } catch { return null }
  const px = data.data

  // Average the frame edge to get the backdrop colour.
  let r = 0, g = 0, b = 0, n = 0
  const sample = (x, y) => { const i = (y * w + x) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; n++ }
  for (let x = 0; x < w; x += 2) { sample(x, 0); sample(x, h - 1) }
  for (let y = 0; y < h; y += 2) { sample(0, y); sample(w - 1, y) }
  r /= n; g /= n; b /= n

  const tol = tolerance * 3
  const seen = new Uint8Array(w * h)
  const stack = []
  for (let x = 0; x < w; x++) { stack.push(x, 0, x, h - 1) }
  for (let y = 0; y < h; y++) { stack.push(0, y, w - 1, y) }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop()
    if (x < 0 || y < 0 || x >= w || y >= h) continue
    const p = y * w + x
    if (seen[p]) continue
    const i = p * 4
    const d = Math.abs(px[i] - r) + Math.abs(px[i + 1] - g) + Math.abs(px[i + 2] - b)
    if (d > tol) continue
    seen[p] = 1
    px[i + 3] = 0
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1)
  }

  // Feather the boundary so the cut-out does not look like scissors work.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x
      if (seen[p]) continue
      let cleared = 0
      if (seen[p - 1]) cleared++
      if (seen[p + 1]) cleared++
      if (seen[p - w]) cleared++
      if (seen[p + w]) cleared++
      if (cleared) px[p * 4 + 3] = Math.round(255 * (1 - cleared / 6))
    }
  }

  ctx.putImageData(data, 0, 0)
  return canvas.toDataURL("image/png")
}
```

An iterative stack rather than recursion — a 2000 × 2000 photo overflows the call
stack immediately.

This handles the case it is meant for: an object shot on a seamless single-colour
sweep. A busy background, a room, an outdoor shot cannot be separated this way.
Detect nothing, change nothing — returning the photo untouched is far better than
returning a damaged one.

## Wiring it into a component

Run it in an effect, hold the result in state, fall back to the original while it
works or if it fails:

```tsx
function useCutout(src?: string, enabled?: boolean, tolerance = 32) {
  const [out, setOut] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (!src || !enabled) { setOut(undefined); return }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (cancelled) return
      const url = cutOutBackground(img, tolerance)
      if (url) setOut(url)
    }
    img.src = src
    return () => { cancelled = true }
  }, [src, enabled, tolerance])

  return out || src
}
```

Expose it as a per-photo `Remove Background` switch plus one section-wide
`Cut-out Strength` number. Per-photo because a set of photos is rarely uniform;
one strength because a second slider per photo is a panel nobody reads.

In the HTML version there is no panel, so just run it on load for the images that
need it — or better, ship the photos already cut out and keep the code path for
whatever the buyer adds.

## What to tell the buyer

Be straight about the limits in the guide, because a tool that silently fails on
half of their photos reads as broken:

> It works by finding whatever connects to the edges of the frame and stays close
> to the colour there, which covers the usual case: an object photographed on a
> seamless white, grey or single-colour sweep. A busy background, a room, or an
> outdoor shot cannot be separated that way, and such a photo is simply left as it
> is rather than damaged.
>
> **Cut-out Strength** tunes it. Raise it if a rim of backdrop is left around the
> object; lower it if part of the object disappears.

Ship two or three already-cut-out photos in the download so the intended look is
visible before they upload anything.
