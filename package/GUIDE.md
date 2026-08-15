# ABC LAB — Setup Guide

A studio website template that ships in two forms: a Framer code component you
edit visually, and a standalone HTML page you can host anywhere. Both render
the same design.

---

## 1. What's in the package

| Folder / file | What it is |
| --- | --- |
| `AbcLabSite.tsx` | The Framer code component. This is the editable version. |
| `abclab-mockup.html` | The full site as one standalone HTML file. Open it in any browser or upload it to any host. |
| `photos/` | Nine product photos. Six studio shots, plus three with the background already removed. |
| `og-image.png` | The picture shown when the site is shared on social media. Upload it next to the HTML file. |
| `GUIDE.md` | This guide. |

You need a Framer account to use the `.tsx` file. The `.html` file needs
nothing at all — it runs on its own.

---

## 2. Framer setup

1. Open your Framer project.
2. In the Assets panel, click **+ → Code File**, and name it `AbcLabSite`.
3. Delete the placeholder code, then paste in the whole contents of
   `AbcLabSite.tsx` and save.
4. Drag the component from the Assets panel onto your canvas.
5. Set its width to **Fill** and height to **Fit** so it stretches to the frame.
6. Everything is now edited from the properties panel on the right.

### If the panel looks empty

Select the component itself, not the frame around it. The controls only appear
when the component instance is selected.

---

## 3. How the controls are organised

The properties panel is split into thirteen numbered groups, in the order the
sections appear on the page:

```
① Navbar          ⑧ Materials
② Global Style    ⑨ Portfolio
③ Hero            ⑩ Testimonials
④ Stats           ⑪ FAQ
⑤ About           ⑫ Contact
⑥ Services        ⑬ Footer
⑦ Process
```

Twelve of them start with a **Show Section** switch. Turn a section off and it
disappears from the page — nothing else shifts or breaks. A three-page brochure
site and a full twelve-section site come from the same component.

---

## 4. Photo sizes

Every image control in the panel states the size it wants, so you don't have to
come back here. For reference:

| Where | Recommended | Notes |
| --- | --- | --- |
| Logo (① Navbar) | 600 × 120 px | PNG, transparent. Shown up to 220 × 42 px. |
| Hero photos (③ Hero) | 1000 × 1000 px | PNG or WebP, transparent, so it floats. |
| About image (⑤ About) | 1200 × 780 px | Landscape. Leave empty for the spool. |
| Service icons (⑥ Services) | 128 × 128 px | PNG or SVG, transparent. |
| Portfolio photos (⑨ Portfolio) | 1200 × 1200 px | Used in the grid and the pop-up. |

These are roughly twice the size the photo is shown at, which keeps it sharp on
phones and high-resolution laptops. Bigger than this only makes the page slower.

Empty photo slots show the recommended size right on the canvas while you work,
so you can see what is still missing at a glance.

---

## 5. Colour

Open **② Global Style**. Every colour on the page comes from this one group:
accent, secondary accent, text, muted text, page background, card background,
borders, and the ambient purple tint behind the hero.

Change **Accent Color** alone and the whole site follows — buttons, links,
gradients, icons, timeline, and focus rings all derive from it.

**↺ Reset Colors** puts every colour back to the original palette. Framer does
not let a component rewrite its own settings, so the reset works by switch:
flip it on, the original palette returns, flip it off to keep editing.

---

## 6. Logo

In **① Navbar**, either type your name into **Logo Text**, or upload an image
into **Logo Image**. When an image is present it replaces the text. Set **Logo
Height** to match your artwork — the width follows automatically.

---

## 7. Hero photos

**③ Hero** holds the photos that fade into one another beside the headline.
Add or remove them in the list, and set:

- **Photo Width / Height** — how large the photo is drawn, up to 1600 px. It
  still shrinks to fit a phone screen.
- **Autoplay** — whether the photos change on their own
- **Autoplay Speed** — seconds per photo

### Remove Background

The photos float on the page rather than sitting in a box, so a photo that
still has its studio backdrop shows as a grey rectangle. Each photo in the list
has a **Remove Background** switch that lifts that backdrop away for you — no
other tool needed.

It works by finding whatever connects to the edges of the frame and stays close
to the colour there, which covers the usual case: an object photographed on a
seamless white, grey or single-colour sweep. A busy background, a room, or an
outdoor shot cannot be separated that way, and such a photo is simply left as
it is rather than damaged.

**Cut-out Strength** tunes it. Raise it if a rim of backdrop is left around the
object; lower it if part of the object disappears. The default suits most
studio shots.

Three photos that are already cut out are in `photos/`, so you can see the
intended look straight away.

---

## 8. Service icons

**⑥ Services** is a repeatable list. Each card has a title, a text, and an icon.

For the icon you have two options:

- **Built-in Icon** — pick one of seven: 3D printer, CAD design, prototype tag,
  manufacturing, 3D scanner, wrench, consulting.
- **Custom Icon** — upload your own image. This is how you move the template to
  another trade: a fork and knife for a restaurant, a brake disc for a garage,
  a camera for a studio.

An uploaded icon keeps its own colours by default. Turn on **Recolor Icons** to
repaint all custom icons in one colour, set just below. Recolouring reads the
icon's shape from its background, so it works with transparent icons and with
icons on a plain solid background alike.

---

## 9. Portfolio

**⑨ Portfolio** is a list of projects. Each one has a photo, a title, a
description, and **three spec rows you name yourself**.

Each row is a pair: a label and a value. A print shop writes
`Print Time / 6 h`. A furniture maker writes `Wood / Oak`. A photographer
writes `Location / Prague`. Leave a value blank and that row disappears from
the pop-up.

Each project also has a **Remove Background** switch, the same one as in the
hero. Turn it on and the studio backdrop is lifted away so the product sits
cleanly on the card instead of showing a grey rectangle inside it.
**Cut-out Strength** tunes it for the whole section.

Clicking a project opens a pop-up with arrows to move between projects.

---

## 10. Video

Three sections take a video instead of a picture: **③ Hero**, **⑤ About** and
**⑨ Portfolio**. Each has the same two controls.

**Video File** — upload an mp4, webm or mov. It plays muted and on a loop, so
it behaves like part of the layout rather than something to press play on. Keep
it short and under about 10 MB; a long video makes the whole page slow.

**Video Link** — or paste a YouTube or Vimeo address and it is embedded
instead. Used only when no file is uploaded.

Where the video appears:

| Section | What it replaces |
| --- | --- |
| ③ Hero | The rotating photos |
| ⑤ About | The image and the spool animation |
| ⑨ Portfolio | Nothing — it sits under the project carousel |

Leave both empty and the section behaves exactly as before.

---

## 11. Contact and map

**⑫ Contact** holds the email address, phone, and street address, plus the map.
The three labels above them — **Email Label**, **Phone Label**, **Address
Label** — are editable too, so the section works in any language.

Type a **real address** into **Map Address** — a street and city, not a Google
Maps link. The pin places itself. **Map Tint Color** and **Map Tint Strength**
wash the map in your brand colour, and **Recolor Base Map** drops it to
greyscale first so the tint reads cleanly.

### The enquiry form

**Form Sends To** decides what happens when a visitor presses the button.

**Visitor's mail app** (the default) opens their own email program with the
message already written. Nothing to set up, no account anywhere — but the
visitor has to press send a second time in their mail app, and some of them
won't.

**Formspree** posts the enquiry straight to your inbox. The visitor sees a
thank-you and never leaves the page. Framer cannot receive a form from inside a
code component, so the form hands it to Formspree, which forwards it to you.
The free tier covers a small site.

Setting it up takes about two minutes:

1. Sign up at **formspree.io** and create a new form.
2. Open the form's **Integration** tab. It shows an address like
   `https://formspree.io/f/xxxxxxx` — that last part is your form's ID.
3. Copy the whole address, `https://` included.
4. In Framer, select the component, open **⑫ Contact**, set
   **Form Sends To** to **Formspree**. A **Formspree URL** field appears —
   paste the address there.
5. Publish the site and send yourself a test enquiry.

Two things to expect on that first test. Formspree usually asks you to confirm
your email address, so the first message may arrive as a confirmation link
rather than the enquiry itself — click it once and you're done. And test on the
published site rather than the editor preview: the form posts to another
domain, and previews inside editors sometimes block that.

**Email Subject** sets the subject line you'll see in your inbox. Something
like "Website enquiry" makes it easy to filter.

**Success Text** and **Error Text** are what the visitor reads afterwards. A
hidden field catches bots: anything that fills it in is dropped silently, so
you get fewer junk enquiries without a captcha.

If the endpoint is left empty, the form quietly falls back to the mail app, so
it never ends up doing nothing.

---

## 12. The HTML version

`abclab-mockup.html` is the same site as one self-contained file. Fonts,
images, styles, and scripts are all inside it — there is nothing to link and
nothing to install.

Use it to:

- show a client the design before they buy
- host the site on plain shared hosting, or on Netlify, Vercel, or GitHub Pages
- edit the design by hand if you prefer code to a visual editor

To publish it, rename the file to `index.html` and upload it. That's the whole
deployment.

### Before you publish it

Near the top of the file are the tags that decide how the page looks when
someone shares the link. Two of them hold a placeholder domain:

```html
<meta property="og:url" content="https://abclab.cz/">
<meta property="og:image" content="https://abclab.cz/og-image.png">
```

Change both to your own domain, and upload `og-image.png` alongside
`index.html`. Also update the `<title>` and the `description` tag to your own
business — that is the text search engines show.

To change the text, open the file in any text editor and search for the words
you want to replace. To change a colour, look for the `:root` block near the
top — every colour is a variable there.

The HTML version has the same working form. Search the file for
`var CONTACT_FORM` and fill in the endpoint:

```js
var CONTACT_FORM = {
  email: 'you@yourbusiness.com',
  endpoint: 'https://formspree.io/f/xxxxxxx',
  subject: 'New enquiry from the website',
  errorText: "That didn't send. Please try again, or email us directly."
};
```

Leave `endpoint` empty and it opens the visitor's mail app instead, exactly
like the Framer version.

---

## 13. Moving the template to another business

Nothing in the layout is specific to 3D printing. The route is always the same:

1. **② Global Style** — set the accent colour to the new brand.
2. **① Navbar** — swap the logo.
3. **⑥ Services** — upload icons that fit the trade.
4. **⑨ Portfolio** — new photos, and rename the three spec rows to the
   measurements that matter in that trade.
5. Switch off any section the business doesn't need.

A bakery, a garage, a dental practice, and a furniture workshop all come out of
this same file.

---

## 14. Notes

- The map is a Google Maps embed. It needs an internet connection, so it stays
  blank in offline previews and loads normally on a live page.
- Photos are embedded directly in the HTML file, which is why it is large. That
  is the trade for it being self-contained.
- The site respects the visitor's reduced-motion setting: animations stop, and
  the rotating hero holds on the first photo.
