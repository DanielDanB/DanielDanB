# ARCHIZEN — architecture studio template

One design, shipped twice:

| File | What it is |
| --- | --- |
| `archizen-mockup.html` | The whole site as a single self-contained file. Photos are inlined, so it works from a USB stick, an email attachment or any static host. |
| `ArchizenSite.tsx` | The same site as one Framer code component, with every text, photo, colour and section wired to the properties panel. |
| `photos/archizen/` | The placeholder photographs, as separate JPEGs. |

Both render the same page. The stylesheet is written once, in the HTML, and
rewritten mechanically into the component by `tools/archizen/scope-css.py` — so
a change to the look is made in one place, not two.

## Using it in Framer

1. In your Framer project open the **Assets** panel → **Code** → **New file**.
2. Paste the whole of `ArchizenSite.tsx` in and save.
3. Drag the component onto a page and set its width to **Fill**.

The component sizes its own height, so leave height on **Auto**.

The panel is a table of contents — the numbered groups run in the order the
sections appear on the page:

```
① Sidebar        ⑧ Process
② Global Style   ⑨ Services
③ Hero           ⑩ Details
④ Manifesto      ⑪ Awards
⑤ Selected Work  ⑫ Testimonials
⑥ Numbers        ⑬ Contact
⑦ Studio         ⑭ Footer
```

Every content section has a **Show Section** switch. Turn one off and the page
closes its own gap — a three-section brochure site and the full fourteen work
from the same file.

### Colours

**② Global Style → Accent** is the only colour most people need to change. The
reading-progress line, the active menu link, hovered rows, the counters, the
award years and the send button all follow it.

Framer stores control values on the component you placed on the canvas, and a
component cannot write to its own properties — so there is no button in the code
that can clear what you typed. **Colors → Original palette** ignores those
fields and hides them; switching back to **My colors** brings your last colours
with it. For a genuine reset, delete the component from the canvas and drag a
fresh one out of Assets: a new instance has nothing stored, so every default
applies.

### Photographs

Sizes are written into the control titles. In short:

| Where | Size |
| --- | --- |
| Hero tiles | 1400 × 1000 px |
| Projects, service hover previews | 1600 × 900 px |
| Studio | 1000 × 1400 px (portrait) |
| Details strip | 1200 × 1200 px |

While you work on the canvas, an empty photo draws a dashed slot with its
expected size written in it. Those slots never appear on the published site.

**Photos → Black and white** in ② Global Style renders every photograph
greyscale whatever you upload, so a set of mixed images still looks like one
commission. The map has its own switch.

The photographs that ship with this template are placeholders. Replace them with
the studio's own work before publishing.

### The contact form

Framer will not deliver a form posted from inside a code component, so ⑬ Contact
offers two routes:

- **Leave Form Endpoint empty** — the button opens the visitor's own mail app
  with the message filled in. Nothing to set up, but the visitor has to press
  send a second time.
- **Paste a form-relay address** (Formspree, Basin, Getform) — the message is
  sent in the background and the visitor sees the thank-you without leaving the
  page. If the relay fails, it falls back to the mail app rather than doing
  nothing.

A hidden honeypot field catches the bots that fill in every input they find.

## Using the HTML version

Open `archizen-mockup.html` in a browser, or upload it anywhere that serves
static files. To edit it, search for the text you want to change — the markup is
in plain sections in the order they appear.

The form near the bottom of the file works the same way as the Framer one. To
use a relay, set `ENDPOINT` in the script at the end of the file:

```js
var ENDPOINT = "https://formspree.io/f/yourid";
var MAILTO   = "studio@archizen.com";
```

**On a phone, do not tap the file in the Files app.** That opens a preview, and
previews do not run scripts. The page is built so that everything is still
visible and usable without JavaScript — the menu becomes a row of links, the
form becomes a plain mail form, nothing is hidden — but for the scroll effects
open it in a real browser (iPhone: share → Open in Safari).

## Rebuilding

The photographs are generated, so the set can be regenerated or extended:

```bash
python3 tools/archizen/render-photos.py     # rewrites photos/archizen/*.jpg
node tools/archizen/build-mockup.mjs        # inlines them into archizen-mockup.html
python3 tools/archizen/scope-css.py tools/archizen/mockup.src.html > /tmp/arz.css
                                            # the component's stylesheet, scoped
```

`tools/archizen/mockup.src.html` is the source of the HTML page; the file at the
repository root is the built, self-contained copy. Edit the source, then run the
build.
