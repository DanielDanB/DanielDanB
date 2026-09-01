# Zelená Vinice — Setup Guide

Your site arrives ready, as a Framer Remix link — one click and it is in your
account, with nothing to copy and no code to touch. It also ships as a
standalone HTML page you can host anywhere. Both render the same design.

---

## 1. What's in the package

| Folder / file | What it is |
| --- | --- |
| `ZelenaViniceSite.tsx` | The Framer code component. You do not need this if you opened your link — it is here for putting the site into a Framer project you already have. |
| `zelena-vinice-mockup.html` | The full site as one standalone HTML file. Open it in any browser or upload it to any host. |
| `photos/` | The five photographs from the demo — one hero shot and four dishes. |
| **START HERE.pdf** | Your Remix link — one click and the site is in your Framer account. Read this first. |
| **Full guide.pdf** | This guide. |

You need a Framer account to use the `.tsx` file. The `.html` file needs
nothing at all — it runs on its own.

---

## 2. Getting your site — the Remix link

**Your site arrives ready.** The link in **START HERE.pdf** opens it straight
into your Framer account — the component already placed, every section filled
in, the photographs in place. There is no code to copy, and this is the route
the template is built around.

Everything from there is done in the properties panel on the right, and the
rest of this guide is about that panel.

### If you already have a Framer project

The steps below are only for the other case: putting the component into a
Framer project you have already built. If you opened your link, skip to
section 3.

1. Open your Framer project.
2. In the Assets panel, click **+ → Code File**, and name it `ZelenaViniceSite`.
3. Delete the placeholder code, then paste in the whole contents of
   `ZelenaViniceSite.tsx` and save.
4. Drag the component from the Assets panel onto your canvas.
5. Set its width to **Fill**. Height is handled by the component itself and
   shows as **Fit** — leave it.
6. Everything is now edited from the properties panel on the right.

### If the panel looks empty

Select the component itself, not the frame around it. The controls only appear
when the component instance is selected.

### If a setting you expect is missing

The first field in the panel is **Version**. It should read `v11 · multi-line
fields`. If it shows something older, you are looking at an older build of the
component — which can only happen on the manual route above, where a code file
with an error keeps serving the last working one. Paste the file again and
save.

---

## 3. How the controls are organised

The properties panel is split into twelve groups, in the order the sections
appear on the page:

```
🎨 Colors           📸 Gallery
🖋️ Type & spacing   📍 Find us
🔝 Header           📅 Reservations
☰ Slide-out menu    🔗 Social links
🖼️ Hero             🍪 Cookie bar
🍽️ Menu             🦶 Footer
📖 About
```

Every content section starts with a **Show** switch. Turn a section off and it
disappears from the page — nothing else shifts or breaks. A one-page card for a
bistro and a full seven-section site come from the same component.

---

## 4. Writing more than one line in a field

**This is the one thing worth knowing before you start.**

Framer's properties panel commits some multi-line fields the moment you press
Enter, instead of inserting a line break. Opening hours and addresses then sit
stubbornly on one line however hard you lean on the key.

**Type a `|` where you want the break.**

```
Mon–Thu 11:00–23:00|Fri–Sat 11:00–24:00|Sun 11:00–22:00
```

renders as

```
Mon–Thu 11:00–23:00
Fri–Sat 11:00–24:00
Sun 11:00–22:00
```

A real line break still works wherever the field lets you make one. The two
mean exactly the same thing and you can mix them freely.

This works in five places:

| Where | What a `\|` does |
| --- | --- |
| 📍 Find us → **Address** | new line |
| 📍 Find us → **Opening hours** | new line |
| 📅 Reservations → **Hours** | new line |
| 🖼️ Hero → **Headline** | new line |
| 📖 About → **Text** | new paragraph |

Nothing else splits the text. Commas and semicolons are ordinary punctuation,
so `Národní 15, 110 00 Praha` stays on one line, and a sentence with a
semicolon in it stays one sentence. Spaces around the `|` are tidied up, and an
accidental `||` does not leave a gap.

---

## 5. Colour

Open **🎨 Colors**. **Theme** carries five complete palettes:

| Theme | Feel |
| --- | --- |
| Garden | The green and gold of the demo. The default. |
| Cellar | Dark, warm, candle-lit. |
| Terracotta | Clay, rust and cream. |
| Linen | Muted green-grey, quiet and formal. |
| Midnight | Deep blue with a brass accent. |

### Your own colours sit on top of the theme

Under the theme picker are ten colour fields, each with a checkbox. Tick one,
choose a colour, and **only that colour changes** — everything you leave
unticked keeps following the theme.

So you can take **Cellar**, set the accent to your own gold, and later switch
to **Midnight**: the whole page moves, your gold stays. Set all ten and nothing
is left of the theme.

Everything else is derived and never has to be set by hand: button hover and
active states, borders, shadows, the glow behind the page, the tint on the map,
the frosted panels, the wash over the hero photograph, and the gradient under
each menu tile's name.

**Ignore my colors** puts the theme back in one click without unticking each
field. Your picks stay stored — switch it off and they return.

---

## 6. Type & spacing

**🖋️ Type & spacing** holds the two typefaces, the content width, the spacing
between sections, the corner radius, and the frosted-glass effect.

The fonts load from Google Fonts through the **Fonts URL** field. To use
different typefaces, pick them on fonts.google.com, copy the URL from the embed
snippet into that field, and write the family names into **Heading font** and
**Body font**. Turn **Load web fonts** off if you would rather use fonts you
have already added to your Framer project.

**Frosted glass** switches the translucent panels to solid ones. Worth trying if
the page feels busy, or if you are printing screenshots.

---

## 7. Header and the slide-out menu

**🔝 Header** holds the restaurant name — split into two fields so the second
word takes the accent colour — the navigation links, the button, and two
switches: whether the header stays on top as you scroll, and whether the menu
button appears.

Links understand two kinds of address. `#menu`, `#about`, `#gallery`,
`#location`, `#reserve` and `#top` scroll to that section of the page; anything
starting with `http` opens as an ordinary link.

**☰ Slide-out menu** is the panel behind the menu button, with its own list of
links, each with an icon from a dropdown of 35.

On a phone the navigation links hide and the menu button takes over, which is
why the slide-out list is worth filling in even if you do not use it on
desktop.

---

## 8. Hero

**🖼️ Hero** takes a **Photo** or a **Video** — the video wins if both are set,
and plays muted on a loop. Then the eyebrow, the headline, the paragraph and
two buttons.

**Overlay** decides the dark wash over the photograph that keeps the writing
readable. Left on **Follow theme** it is mixed from the palette, so it repaints
when you change theme. Choose **Pick my own** to set it by hand.

**Overlay strength** is how dark that wash is: lower it for a dark photograph,
raise it for a bright one. **Blur behind text** softens the picture under the
words. **Parallax** drifts the photograph as the page scrolls.

On a phone the hero stacks: the photograph on top, the writing below it on a
dark panel.

---

## 9. Menu

**🍽️ Menu → Categories** is the list of tiles. Each tile is its photograph, with
the category name over the bottom-left corner. Tapping one opens a panel with
every dish in it.

Each category has:

- **Name** — what appears on the tile
- **Photo** — fills the whole tile
- **Icon (no photo)** — used when there is no photograph
- **Caption** — the small line under the name. Empty by default; type
  something ("6 dishes", "seasonal") and it appears.
- **Dishes** — its own list, opened from the same row

A category with no photograph is not left looking unfinished: it becomes a pale
tinted card with its icon and the name in your title colour.

Each dish has a name, a description, a price, an icon from the same dropdown,
and an optional **Card tint** if you want to mark one out.

The dish panel takes almost the whole screen on a phone and uses a larger type
scale than the desktop one — a menu is read at arm's length. It scrolls inside
itself, so a category with twenty dishes fits as happily as one with four.

---

## 10. About and Gallery

**📖 About** is a heading, the text, and either a photograph or an icon.
Separate the paragraphs with a `|` (see section 4).

**📸 Gallery** is a list of tiles, each either a photograph or an icon. Add and
remove rows freely — the grid closes up around whatever is there.

---

## 11. Find us

**📍 Find us** holds the restaurant name, the address, the opening hours, the
phone number and a line about getting there. Remember the `|` for the address
and the hours.

**Map** offers three routes:

- **From address** builds a Google Maps embed from what you type into **Map
  address** — no account and no API key. It falls back to the address above if
  you leave it empty. **Zoom** and **Map language** tune it.
- **Pasted embed** takes whatever you copy from Google Maps' *Share → Embed a
  map*. Paste the entire `<iframe …>` snippet; the address inside it is found
  for you.
- **No map** drops the frame and lets the details span the card.

**Tint map** washes the map in your palette so it belongs to the page. Google's
own controls and branding are theirs, not the component's.

---

## 12. Reservations

**📅 Reservations** is a contact box, not a form: the phone number and the
e-mail address as two large tiles, with the opening hours underneath and a line
of small print below that.

On a phone the tiles stack and each one is a single tap — `tel:` opens the
dialler, `mailto:` opens the mail app.

There is nothing to set up and nothing that can fail: no endpoint, no account,
no third-party script, and no form that thanks a guest for a reservation it
never sent.

**Phone** and **Hours** fall back to whatever is filled in under 📍 Find us, so
the same number does not have to be typed twice. Fill these in only when the
booking line differs from the one in the footer. Clearing **E-mail** hides that
tile and the phone spans the card.

**Small print** is the line underneath — the place for a minimum group size, a
deposit rule, or the hours the phone is answered.

---

## 13. Social links

**🔗 Social links → Profiles** is a list. Each row is a network, a name, and an
address. **An empty address hides that icon**, so clearing the URL is how you
remove one you do not use.

The **Network** dropdown carries twenty marks — Instagram, Facebook, TikTok,
YouTube, X, Threads, Pinterest, LinkedIn, WhatsApp, Messenger, Telegram,
Snapchat, Spotify, Google — plus a star for a reviews link, a map, a globe for
your own site, and an e-mail glyph (use a `mailto:` address with that one).

For a service without a mark of its own — TripAdvisor, Yelp, a delivery partner
— upload your logo into **Own logo** and it replaces the icon.

**Look** gives four styles: soft tinted tiles, solid in the button colour,
outlined, or plain icons. Three switches decide where the row appears: **In
header** (hidden automatically on phones, where the header has no room), **In
footer**, and **In slide-out menu**, which is the one people actually find on a
phone.

---

## 14. Cookie bar

**🍪 Cookie bar** is **off out of the box**. With it off the page never touches
browser storage at all. Switch **Show** on when you want it.

You set the heading, the text, both button labels and a link to your privacy
page. **Position** puts it bottom centre, bottom left or bottom right; on a
phone it always spans the width and stacks the buttons.

Once a visitor answers, the choice is remembered and the bar does not come back
— which is a nuisance while you are styling it, so **Always show (styling)**
keeps it on screen. Turn that off before publishing. On the Framer canvas the
bar stays hidden unless that switch is on, so it never sits over the design
while you work.

**Saved under** is the name the answer is stored under. Change it — say to
`cookie-consent-2` — and everyone is asked again, which is what you want after
the policy changes.

### What it does and does not do

The bar **records a choice; it does not block anything**, and the component
itself loads no analytics or tracking of any kind. If you add tracking later,
gate it on the answer:

```js
// "accepted", "declined", or null if nobody has answered
localStorage.getItem("cookie-consent")

window.addEventListener("cookie-consent", (e) => {
  if (e.detail.choice === "accepted") startAnalytics()
})
```

Shipping a bar is not the same as being compliant. What makes a site lawful is
not loading the trackers until consent exists, and saying in your privacy page
what you collect. The bar gives you the switch; wiring it up is yours.

---

## 15. Photo sizes

| Where | Recommended | Notes |
| --- | --- | --- |
| Hero (🖼️ Hero) | 2000 × 1100 px | Landscape. Leave room on one side for the writing. |
| Menu tiles (🍽️ Menu) | 900 × 820 px | Nearly square. Cropped to fill the tile. |
| Gallery (📸 Gallery) | 900 × 500 px | Landscape. |
| About (📖 About) | 1200 × 780 px | Landscape. Leave empty for the icon. |
| Own social logo (🔗 Social) | 128 × 128 px | PNG or SVG, transparent. |

These are roughly twice the size the photo is shown at, which keeps it sharp on
phones and high-resolution laptops. Bigger than this only makes the page
slower.

The five photographs in `photos/` are the ones from the demo, ready to upload:
`hero-spaghetti-bolognese.jpg` for the hero, and `menu-01-starters.webp`
through `menu-04-main-plate.webp` for the first categories.

---

## 16. On a phone

The layout does not follow the browser window — it follows the width of the
component itself, measured as the page is drawn. That matters in Framer,
because a phone breakpoint on a wide canvas is still a narrow component in a
wide window, and an ordinary media query would give it the desktop layout.

What changes as it narrows:

- the navigation links give way to the menu button
- the header's social icons hide, where there is no room for them
- the hero stacks: photograph above, writing below on a dark panel
- the menu tiles go to one column
- the dish panel becomes nearly full-screen with larger type
- the contact tiles stack
- the cookie bar spans the width and stacks its buttons

---

## 17. The HTML version

`zelena-vinice-mockup.html` is the same site as one self-contained file. Fonts,
photographs, styles and scripts are all inside it — there is nothing to link
and nothing to install.

Use it to show a client the design before they commit, to host the site on
plain shared hosting or on Netlify, Vercel or GitHub Pages, or to edit the
design by hand if you prefer code to a visual editor.

To publish it, rename the file to `index.html` and upload it. That is the whole
deployment.

### Opening it on a phone

Tapping the file in a phone's Files app often opens a *preview* rather than a
browser, and those previews do not run scripts. For the full experience open
the file in a real browser. On iPhone: share icon → **Open in Safari**. On
Android: open it from Chrome rather than the file manager.

---

## 18. Moving the template to another restaurant

Nothing in the layout is specific to this one. The route is always the same:

1. **🎨 Colors** — pick the theme nearest the room, then override the one or two
   colours that are actually yours.
2. **🔝 Header** and **🦶 Footer** — the name, in two halves.
3. **🖼️ Hero** — one good photograph of a plate or the room.
4. **🍽️ Menu** — rename the categories, upload a photograph for each, and fill
   in the dishes.
5. **📍 Find us** and **📅 Reservations** — the address, the hours, the phone.
6. Switch off any section you do not need.

A bistro, a wine bar, a pizzeria and a hotel restaurant all come out of this
same file.

---

## 19. If something looks wrong in Framer

**The page is cut off at the bottom.** The frame around the component has a
fixed height. Set it to **Fit content** on that breakpoint. The component
itself never clips its own content.

**A setting is missing from the panel.** Check the **Version** field first — see
section 2.

**The layout is desktop-shaped inside a narrow frame.** It should not be: the
breakpoints read the component's own width. If it happens, the frame is wider
than it looks.

**Opening hours are all on one line.** Section 4 — use a `|`.

---

## 20. Notes

- The map is a Google Maps embed. It needs an internet connection, so it stays
  blank in offline previews and loads normally on a live page.
- The icons are drawn into the component rather than fetched from a font
  service, so they work offline and take your palette colour.
- The site respects the visitor's reduced-motion setting: transitions stop and
  the hero parallax holds still.
- Photographs are embedded directly in the HTML file, which is why it is large.
  That is the trade for it being self-contained.
