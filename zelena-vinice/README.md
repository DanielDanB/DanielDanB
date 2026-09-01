# Zelená Vinice — Framer code component

`ZelenaViniceSite.tsx` (repo root) is the whole restaurant page as one Framer
code component. Everything visible is a property control; nobody using it needs
to open the file.

## Getting it into Framer

1. In a Framer project: **Assets → Code → New code file**, name it
   `ZelenaViniceSite`.
2. Delete the placeholder contents and paste the whole of
   `ZelenaViniceSite.tsx`.
3. Drag the component onto a page and set its frame to **Fill** width and
   **Fit content** height.

The first field in the properties panel is **Version**. If a setting you expect
is missing, read that field first — it says which build Framer actually loaded.
A code file with an error keeps serving the previous working build, so a stale
version marker is the answer to most "my change did nothing" moments.

## The panel

| Group | What it holds |
|---|---|
| 🎨 Colors | Five ready palettes, plus your own colours on top of any of them |
| 🖋️ Type & spacing | Web fonts, heading/body family, content width, section spacing, corner radius, frosted glass |
| 🔝 Header | Name, nav links, button, sticky behaviour, menu button |
| ☰ Slide-out menu | Heading and the icon links inside the drawer |
| 🖼️ Hero | Photo **or video**, headline, text, two buttons, height, overlay, parallax |
| 🍽️ Menu | Categories, each with a photo, an icon and its own list of dishes |
| 📖 About | Heading, paragraphs, photo or icon |
| 📸 Gallery | Tiles, each a photo or an icon |
| 📍 Find us | Address, hours, phone, transport, and the map |
| 📅 Reservations | A contact box, a form, a booking widget, or a button |
| 🔗 Social links | Instagram, Facebook, TikTok and the rest, and where they appear |
| 🍪 Cookie bar | Off by default; switch it on and it remembers each visitor's answer |
| 🦶 Footer | Name, contact line, links, small print |

Every section has a **Show** switch, so the same component can be one page or
just the parts you want.

### Colours

Pick a palette from **Theme** and the whole page follows — buttons, headings,
prices, borders, glows, the map tint, the hero overlay.

**Your own colours sit on top of the theme.** Under the theme picker there are
ten colour fields, each with a checkbox. Tick one, choose a colour, and only
that colour changes; everything you leave unticked keeps following the theme.
So you can take **Cellar**, set just the accent to your own gold, and switching
later to **Midnight** moves the whole page while your gold stays. Set all ten
and nothing is left of the theme — that is what **Custom** was for, and it
still works the same way.

Everything else is derived: button hover and active states, borders, shadows,
glows, the map tint, the frosted panels, and the dark wash over the hero photo
— including the headline, the eyebrow chip and the outlined button sitting on
it. Those never have to be set by hand, and they always agree with the colours
you did pick.

If you want the hero wash a particular colour anyway, 🖼️ Hero → **Overlay** has
a *Pick my own* setting that opens a picker. Left on *Follow theme*, it takes
the theme's darkest brand colour and carries it most of the way to black.

**Ignore my colors** puts the theme back in one click, without unticking each
field — your picks stay stored, so switching it off brings them back.

### Menu categories and dishes

Each category is a row under 🍽️ Menu → **Categories**. Open one and it has its
own **Dishes** list. The caption under a category name ("6 dishes") counts
itself unless you type something in **Caption**. Clicking a category on the page
opens its dishes in a panel.

Icons come from a dropdown of 35 food and navigation glyphs, drawn inline — no
icon font is loaded, so they render offline and take the palette colour. Brand
marks live in their own dropdown under 🔗 Social links, so you are not
scrolling past twenty logos to find a cheese. A category with a photo hides
its icon.

### The map

**From address** builds a Google Maps embed from the address you typed; no
account or key needed. **Pasted embed** takes whatever you copy from Google
Maps' *Share → Embed a map* — paste the entire `<iframe …>` snippet, it pulls
the `src` out. **No map** drops the frame and lets the details span the card.

The tint is applied over the frame in `color` blend mode, so the map follows the
palette while staying interactive. Google's own controls and branding are
theirs, not the component's.

### Reservations

**Booking** decides what the section actually does:

- **Phone & e-mail — no form** — two tiles a visitor taps to call or write,
  with your hours underneath. Nothing to set up, nothing that can fail. This is
  the default.
- **Form — show a thank-you** — the form validates and shows the message. No
  network request either, but note that it does not send anything anywhere.
- **Form — send to my form service** — posts the fields as JSON to a hosted
  endpoint (Formspree and friends). Paste the endpoint; the error text is what
  a visitor sees if the service is down.
- **Booking widget — paste the code** — Tablein, OpenTable, Bookio, Restu or
  anything else that hands you an embed snippet.
- **Cal.com calendar** — the real booking calendar, embedded in the page.
- **Button to a booking page** — one button pointing at OpenTable, Bookio, or
  whatever you already use.

The form fields disappear from the panel in the modes that do not use them, so
you only ever see the settings that apply.

Framer's canvas does not send the request; test this in Preview or on the
published site.

### The contact box

The shipped default, and the one most small restaurants actually want: no form,
just the phone number and the e-mail address as two large tiles. On a phone the
tiles stack and each one is a single tap — `tel:` opens the dialler, `mailto:`
opens the mail app.

**Phone** and **Hours** fall back to whatever is already filled in under 📍 Find
us, so the same number does not have to be typed twice. Type something into
these fields only when the booking line differs from the one in the footer.
Clearing **E-mail** hides that tile and the phone tile spans the card; with
neither set, the panel tells you what is missing rather than rendering an empty
box.

**Small print** is the line underneath — the place for a minimum group size, a
deposit rule, or the hours the phone is answered.

### Tablein and other booking widgets

Set **Booking** to *Booking widget — paste the code* and paste in whatever your
reservation system gives you. In Tablein that snippet lives under **Widget
integration** in your account; other systems call it "embed code" or "HTML
code". Paste the whole thing, exactly as copied — both shapes work: a bare
`<iframe>`, and a `<script>` that builds the widget itself.

- **Widget height** stops the box collapsing while the widget loads. If the
  snippet sets its own height, that wins; this is the floor.
- **If it cannot load** — your booking page address. When the widget does not
  appear, the visitor gets a button pointing there instead of an empty box, so
  a blocked script never costs you the reservation. Worth filling in.

Nothing is fetched until you paste something, and on the Framer canvas you see
a placeholder — like the calendar, the widget only runs in Preview and on the
published site.

Two things to know. **The code you paste runs on your site**, the same as any
"custom HTML" block in Wix or Squarespace — paste only what your booking
provider gave you. And a snippet that uses the very old `document.write` cannot
work when it is inserted after the page has loaded; if a provider hands you one
of those, ask them for the iframe version instead.

Whether the widget itself can be recoloured is your provider's business, not
this component's — Tablein has its own widget styling settings, and the card it
sits in follows your palette either way.

### Cal.com

Set **Booking** to *Cal.com calendar* and paste your event link into **Cal.com
link**. Either form works — `yourname/dinner-table`, or the whole
`https://cal.com/yourname/dinner-table` address copied from the browser bar;
the extra parts are stripped.

- **Calendar layout** — month, week, or the column view.
- **Calendar language** — pin it (`cs`, `en`, `de`) so the calendar matches the
  site. Leave it empty and it follows each visitor's browser.
- **Hide event details** — drops Cal's own title and duration block when the
  page already says all that.
- **If it cannot load** — the label on the button shown when the embed does not
  arrive.
- **Self-hosted Cal address / embed script** — only for a Cal instance you run
  yourself. Leave both empty for cal.com.

The calendar takes the site's palette: buttons, text, borders and background
are handed to Cal, and a dark theme puts the calendar in dark mode too. It is
worth knowing which parts are not the component's to control — the free plan's
"Cal.com" badge inside the widget, the booking limits, the confirmation e-mail
wording — those belong to your Cal account.

**Nothing is fetched until the link is filled in.** With the field empty the
page never contacts cal.com at all, and the panel says what to add.

**On the Framer canvas you see a placeholder, not the calendar.** The embed
only runs in Preview and on the published site, so test it there. If the script
never arrives — an ad blocker, a strict content policy — the visitor gets a
button straight to your Cal.com page instead of an empty box.

The heading and subheading are ordinary text fields; the default subtitle
mentions a form, so change it when you switch to the calendar.

### Social links

Add a row under 🔗 **Social links** → **Profiles**. Each row is a network, a
name (used as the link's label for screen readers and the hover tooltip) and an
address. **An empty address hides that icon**, so clearing the URL is how you
remove one you do not use.

The **Network** dropdown carries twenty marks — Instagram, Facebook, TikTok,
YouTube, X, Threads, Pinterest, LinkedIn, WhatsApp, Messenger, Telegram,
Snapchat, Spotify, Google — plus a star for a reviews link, a map, a globe for
your own site, and an e-mail glyph (use a `mailto:` address with that one).
For anything without a mark of its own — TripAdvisor, Yelp, a delivery partner
— upload your logo into **Own logo** and it replaces the icon.

**Look** gives four styles: soft tinted tiles, solid in the button colour,
outlined, or plain icons. The icons take the palette either way.

Three switches decide where the row appears: **In header** (hidden
automatically on phones, where the header has no room), **In footer**, and
**In slide-out menu** — which is the one people actually find on a phone, so it
is on by default.

### The cookie bar

**It is off out of the box** — switch on 🍪 **Cookie bar** → *Show* when you
actually want it. With it off the page never touches browser storage at all.

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

Be clear on what this does and does not do. The bar **records a choice; it does
not block anything**, and the component itself loads no analytics or tracking
of any kind. If you add tracking later, gate it on the answer:

```js
// the stored answer: "accepted", "declined", or null if nobody has answered
localStorage.getItem("cookie-consent")

// and it fires the moment someone clicks
window.addEventListener("cookie-consent", (e) => {
  if (e.detail.choice === "accepted") startAnalytics()
})
```

Shipping a bar is not the same as being compliant — what makes a site lawful is
not loading the trackers until consent exists, and saying in your privacy page
what you collect. The bar gives you the switch; wiring it up is yours.

## Photos

`photos/` holds the images from the original mockup, ready to upload into the
Image controls:

| File | Where it goes |
|---|---|
| `hero-spaghetti-bolognese.jpg` | 🖼️ Hero → Photo |
| `menu-01-starters.webp` | 🍽️ Menu → Starters → Photo |
| `menu-02-soups.webp` | Soups |
| `menu-03-salads.webp` | Salads |
| `menu-04-main-plate.webp` | Pasta and Steaks |

With no photos at all the page still looks finished — every empty slot falls
back to a tinted tile with its icon.

## `zelena-vinice-mockup.html`

The static HTML the component was ported from, kept for reference. The Framer
build follows it closely; it differs in three deliberate places:

- the muted greys and the price gold were darkened slightly so body text clears
  4.5:1 contrast;
- stacked on a phone, the hero becomes one dark panel instead of the original's
  light one, where the headline and the paragraph were close to unreadable;
- the hero section no longer reserves 90vh, so the page is a little tighter
  above the menu — Framer sizes the component from its content instead.

## If something looks wrong in Framer

**The page is cut off at the bottom** — the frame around the component has a
fixed height. Set it to **Fit content** on that breakpoint. The component itself
uses `overflow-x: clip`, never `hidden`, so it does not clip its own content.

**A setting is missing from the panel** — check the Version field first.

**The layout is desktop-shaped inside a narrow frame** — it should not be: the
breakpoints read the component's own width through a ResizeObserver, not the
window's. If it happens, the frame is wider than it looks.
