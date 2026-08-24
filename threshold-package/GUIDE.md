# THRESHOLD — Setup Guide

A premium real-estate website, shipped twice: as a Framer code component you edit
from the properties panel, and as a single standalone HTML file you can upload
anywhere.

This guide walks the panel top to bottom. Nothing here needs code.

---

## 1. What's in the package

| File | What it is |
| --- | --- |
| `ThresholdSite.tsx` | The Framer component. One file, pasted into a code file. |
| `threshold-mockup.html` | The same site as one self-contained file. No build step. |
| `START-HERE.pdf` | Two ways to get it into Framer, one of them a single click. |
| `Full guide.pdf` | This document. |
| `og-image.png` | Social share card, 1200 × 630. |

A Framer duplicate link comes with the download. Open it and the finished project
lands in your own account with everything already placed.

---

## 2. Framer setup

Assets panel → **+ → Code File** → name it `ThresholdSite` → paste the whole of
`ThresholdSite.tsx` over the placeholder → save → drag it onto the canvas.

### Making it responsive

Select the placed component and set:

- Width: **Fill**
- Height: **Auto**

If Fill is greyed out, the code file did not save cleanly. Re-paste it and save
again.

### If the panel looks empty

Click the component itself on the canvas, not the frame around it. The controls
live on the component.

---

## 3. How the controls are organised

Fifteen groups, numbered in the order the sections appear on the page.

| Group | What it holds |
| --- | --- |
| ① Navbar | Logo, brand name, menu links, the button on the right |
| ② Global Style | The whole palette, glass strength, corner radius |
| ③ Hero | Photograph or video, headline, two buttons, three chips |
| ④ Trust Bar | Four numbers under the hero |
| ⑤ Home Page Headings | Featured and Catalogue headings |
| ⑥ Listings | Every property: price, size, photos, description, plan |
| ⑦ Rooms | Every room of every property |
| ⑧ Floor Areas | Floor areas and outside measurements |
| ⑨ Photos | The gallery on each property page |
| ⑩ Map Pins | What is nearby: paste a Google link or fill it in by hand |
| ⑪ Property Page Wording | Every heading on a property page |
| ⑫ Agent | Your name, photo, licence, phone, email, statistics |
| ⑬ Reviews | The testimonial carousel |
| ⑭ Contact | The dark call-to-action band |
| ⑮ Footer | Address, small print |

Every group carries a line under its name saying what it covers, and every
content section has a **Show Section** switch. Turn one off and the page closes
its own gap — no empty band, no leftover heading.

### Fields you will not see

A field that cannot apply to what you are editing is not shown. A plot of land
is not asked for bedrooms or a floor plan; an apartment is not asked for a lot;
the drawn stand-in disappears the moment you put a real photograph above it. So
a listing row is fifteen or so fields rather than thirty-four, and the rest are
one switch away:

| Switch | Where | Reveals |
| --- | --- | --- |
| **More Settings** | ⑥ Listings, per property | Price note, terrace, stories, footprint, year, HERS, badge colour, video tour, the four spare gallery slots, the drawn stand-in |
| **Plan Position** | ⑦ Rooms, per room | Plan X / Y / Width / Depth — needed only where the listing is set to *Build from my rooms* |
| **Place It Myself** | ⑩ Map Pins, per pin | Across and Down. Off, the pins are spread around the property for you |

None of them changes the page. They only decide how much of the panel you are
looking at.

---

## 4. Your first ten minutes

1. **⑫ Agent** — your name, role, licence number, phone, email, portrait.
2. **① Navbar** — brand name and the line under it. Upload a logo if you have one.
3. **⑥ Listings** — open the first property and change Title, Neighborhood, Price.
4. **③ Hero** — headline and the photograph behind it.

That is the site recognisably yours. Everything below is refinement.

---

## 5. Listings — the heart of it

⑥ Listings → **Properties** is a list you grow. Each row is one property and
carries everything about it.

**Money and measurements.** Price, Price Note, Bedrooms, Bathrooms, Interior,
Lot, Terrace, Stories, Year Built, HERS Index. A zero hides the row rather than
printing a zero — Lot at 0 simply does not appear.

**Building Width and Building Depth** add a *Footprint* line beside the other
facts. Both at 0 hides it.

**Status Badge** is the pill on the card — *New to market*, *In escrow*, *Available
Oct 1*, whatever you sell. **Badge Dot** colours the dot beside it.

**In Featured Grid** decides whether the property also appears in the editorial
grid higher up the page. The first five marked appear there.

**Cover Photo** is the card image and the photograph behind the property page.
Recommended 1600 × 1000 px.

**Description** takes as many paragraphs as you like — one blank line starts a new
one.

**Features** is a comma-separated list: *Heat pump, Triple glazing, Radiant
floors*. Each becomes a tile. Empty hides the section.

### Units

The template ships in square feet, feet and inches, and US dollars. Those are
formatting, not fields: change the numbers and the labels follow. To sell in
metric you would edit the code — see section 15.

---

## 6. Rooms

⑦ Rooms is one long list of every room of every property. Framer will not put a
list inside a list, which is why rooms cannot sit under their property. Each row
names its property by **Belongs To Listing** — its position in ⑥ Listings, 1 being the
first.

A row opens on its **Room Name**, so a list of fifty rows is still readable, and
dragging the rows sets the order they appear in on the page.

Each room carries: Area, Width, Length, Ceiling, Facing (the compass), Floor,
Windows, Flooring, a Note, and a Photo of its own.

**Facing** is what drives the little compass in the room detail. **Floor** is a
free text field — *1st Floor*, *Penthouse*, *Garden Level* — and rooms that share
one are grouped together.

A room with no photo of its own borrows, in order, the gallery photos you
uploaded for that property. Only when those run out does it fall back to the
drawn stand-in.

---

## 7. Floors

⑧ Floor Areas is the same shape: one row per floor, with Belongs To Listing, Floor Area, Width,
Depth and a Note. They appear under **Floor by floor** on the property page.

Name a floor exactly as its rooms name it in ⑦ Rooms and this list also fixes the
order of the level tabs on a drawn plan.

---

## 8. Photos

⑨ Photos is the gallery on each property page. One row per photograph, opening on
its **Photo Name** — the caption shown on the image and in the lightbox.

The property's own Cover Photo opens the gallery; these follow it in the order you
drag them into. Recommended size 1600 × 1000 px.

Leave the image empty and a drawn stand-in is used, chosen by the **Drawn
Stand-in** menu on the row. That is how the Framer component ships: every
listing image is drawn, so the code file stays small enough for Framer to save
and your own photographs are the only ones it ever loads. The standalone HTML
carries fifteen real photographs instead, on six of its eight listings, to show
what the same layout looks like filled in.

---

## 9. Where it is, and what is nearby

### Which map

**Map**, at the top of ⑩ Map Pins, picks one of three.

| | What you get | What it costs you |
| --- | --- | --- |
| **Drawn** | The map this component draws itself, carrying your pins and your colours | Nothing. No key, no account, no requests |
| **Google** | A real Google map of the address, in an iframe | Nothing either — but it comes in Google's colours, with Google's own markers, not yours |
| **Google, styled** | A real Google map coloured from ② Global Style, marked with the same pins the drawn map uses | Your own Google Maps API key |

For the third one you need a key from Google Cloud with the **Maps JavaScript
API** enabled, and the **Geocoding API** as well if your listings have an
Address but no Map Position. Paste it into **Google Maps API Key**.

Two things worth knowing before you do:

- A key in a web page is readable by anyone who views the source. Restrict it
  to your own domain in the Google console before you publish.
- Google's pricing and quotas are between you and Google. This template only
  calls the API; it does not change what Google charges for it.

Leave the key empty and the drawn map is used, so a half-finished setup never
shows an empty box. The same is true if the key is wrong or the script is
blocked: the drawn map is underneath the whole time and simply stays visible.
On the Framer canvas the drawn map is always used, so editing the page never
spends your quota.

**Map ID** is optional. A Map ID carries its own styling, set in Google's
console, and Google will not accept a Map ID and a style list together — so
filling it in turns off the colouring taken from ② Global Style.

**Zoom** is 15 for a neighbourhood, 17 for a street, 12 for a whole town.

### The note under the map

**Note Under The Map** puts a line beneath it, and left empty it writes itself
to match the map above:

- on the drawn map — *This map is for orientation — it shows what is nearby and
  how far, not exact positions. Every place on it opens in Google Maps.*
- on a real Google map it drops the orientation half, because the positions are
  exact there.

Type into **Note** and yours is used whatever the map is. Switch it off if you
would rather not have it.

It also follows the fallback: choose *Google, styled*, leave the key empty, and
the drawn map appears — so the note goes back to saying the map is for
orientation. It cannot end up claiming exact positions on a map that has none.

A pin only appears on a real Google map if it has coordinates, which means a
long Google link in its row. Pins without one still appear in the list of
chips under the map.

---

### The property

Two fields in ⑥ Listings put a property on the map.

**Address** is the one everybody fills in. It shows under the neighbourhood on
the map card, and the property's own pin becomes a link that searches Google
Maps for it.

**Map Position** is optional and it is what makes the rest of this section work.
Open the property in Google Maps, copy what is in the browser's address bar, and
paste it here. You can also just type the two numbers — `34.0470, -118.5300`.

> A shortened `maps.app.goo.gl/…` link is only a redirect and carries no
> coordinates, so it cannot be read. Use the long link from the address bar, or
> the two numbers.

### The places around it

⑩ Map Pins is one row per place, up to ten per property: **Place**, **Belongs To
Listing**, **Distance**, an **Icon** from twenty-eight, and a **Google Maps
Link**.

There are two ways to fill a row in, and you can mix them freely across the same
map.

**By link.** Paste the long Google Maps link for the place. If the listing has a
Map Position, that is all you have to do — the pin is put on the map in its true
direction from the property, and the **Distance** is worked out and filled in for
you. Anything you type into Distance yourself wins over the calculated one.

**By hand.** Type the Place and the Distance, pick the Icon, and leave the link
empty or paste a short one. The pin is placed for you, spread around the
property with the others. Turn on **Place It Myself** and you set **Across** and
**Down** exactly, in per cent.

The map is a drawn orientation map, not a satellite photograph — it shows which
way things lie and how far, not street names. Two places on the same block are
the same dot at that scale, so pins that land on top of each other are nudged
apart; the distances stay exact either way.

In ⑪ Property Page Wording you can turn the links off entirely, and set a town to
add to any search that has no link of its own.

The demo ships with addresses but no Map Positions, so its pins are the spread
ones. Paste a link into one and you will see it move.

---

## 10. Floor plans — three ways

Set **Drawn Plan** on the property.

**None.** The floor-plan section becomes the room measurements alone, laid out as
text boxes across the full width. Always readable, nothing to draw.

**Build from my rooms.** A clickable plan, drawn to scale from two numbers on each
room in ⑦ Rooms: **Plan X** and **Plan Y**, in feet from the top-left corner of
that floor. Plan Width and Plan Depth default to the room's own Width and Length,
so most rooms need only the two positions. Leave every position at 0 and the rooms
are tiled into rows for you to nudge from. Floors come from each room's Floor
field and become the level tabs.

**Two-storey demo.** The built-in drawing used by the demo villa. Its room shapes
are fixed geometry, so it cannot follow your own rooms — room 1 takes the first
shape, room 2 the second.

### Or upload a drawing

**Floor Plan Drawing** on the property takes a picture of your own plan. It fills
the same stage, with the same pan and zoom, and the rooms are listed beside it as
text. An uploaded drawing wins over any of the three modes above.

---

## 11. Video

**③ Hero** takes **Hero Video** — an uploaded mp4, webm or mov — or **Hero Video
Link**. It plays muted on a loop with the photograph as its poster. Keep an
uploaded file under about 10 MB; a phone downloads it too.

**⑥ Listings → Video Tour** is a per-property address. Framer allows no upload
field inside a list, so this one is a link:

| What you paste | What happens |
| --- | --- |
| YouTube or Vimeo link | An embedded player |
| A direct `.mp4` or `.webm` | Plays inline on the page |
| Anything else | A button that opens it in a new tab |

A property with a tour also gets a *Video tour* tag on its page.

---

## 12. Colour

② Global Style. Change one field and everything that derives from it follows.

| Field | What it paints |
| --- | --- |
| Accent | Eyebrows, tags, glows, map pins, the compass |
| Page | The paper behind everything |
| Text | Headings and the main body |
| Secondary Text | Ledes, descriptions, the values in the fact tables |
| Small Text | The little labels under a number — Layout, Interior, Lot — and the captions. Darken this one if they read too faintly on your background |
| Text On Dark | Every word on a dark section or over the hero photograph |
| Cards | Solid panels: property cards, reviews |
| Glass | The frosted panels: summary bar, filter bar, side card, floor plan |
| Navbar | The floating pill at the top |
| Buttons / Button Text | Solid buttons |
| Borders | Hairlines: table rows, outlined buttons, tiles |
| Dark Sections | The contact band and the pill over the hero |

Two switches decide what happens on dark backgrounds, and they exist because a
dark button on a dark hero cannot be read:

- **Buttons On Dark** — *Reversed* (default) swaps the fill and the text there.
  *Same* keeps your fill everywhere; pick it when your colour is light enough.
- **Navbar Over Hero** — *Dark* (default) keeps the dark pill over the hero
  photograph. *Same* carries your navbar colour up there and puts the text back
  to the page's own ink.

**Glass Opacity** sets how opaque every frosted panel is, from 40% to 140% — the
summary bar, the filter bar, the side card, the floor plan controls, the map
chips. **Navbar Opacity** does the same for the floating pill on its own, so
the navbar can be solid while the panels stay frosted, or the other way round.
Below about 50% the page reads straight through them, which suits a quiet
background and fights a busy one. **Corner Radius** runs from square to very
round.

Between them, Text, Secondary Text, Small Text and Text On Dark cover every
word on the page — there is no colour left hard-coded in the stylesheet.

**Colors: Original palette** ignores the fields and puts the shipped scheme back.
It cannot erase what you typed — a Framer component cannot write to its own
props — so switching back to *My colors* brings your values with it. For a true
clean slate, delete the instance and drag a fresh one out of Assets.

---

## 13. Logo

① Navbar → **Logo** replaces the drawn house mark, in the header and the footer.
A transparent PNG or an SVG around 600 × 160 px sits best. **Logo Height** sets
how tall it draws.

While the header floats over the hero photograph it is dark, and a dark logo
disappears against it. **Logo — Light Version** takes a second file used only up
there. Leave it empty and the same file is used in both places.

**Name Beside Logo** decides whether the brand name stays next to an uploaded
logo. Without a logo the name always shows.

---

## 14. The rest of the page

**④ Trust Bar** — four numbers under the hero. Value, suffix, label.

**⑤ Home Page Headings** — the Featured and Catalogue headings on the home page.

**⑪ Property Page Wording** — every heading on a property page: gallery, video, rooms,
floor plan, features, location, similar properties. Clear a field and the shipped
wording comes back rather than leaving a section untitled. In the rooms label,
`{type}` becomes *apartment*, *suite* or *house*, following the listing's Type —
replace the whole thing if you are writing in another language.

**⑬ Reviews** — quote, name, where, stars. The carousel drags and swipes.

**⑭ Contact** — the dark band. Two buttons, three cards beside them.

**⑮ Footer** — blurb, address, small print.

---

## 15. The HTML version

`threshold-mockup.html` is the same site in one file. Rename it to `index.html`
and upload it to any host — Netlify, Vercel, a cPanel folder, an S3 bucket.
Nothing else is needed.

Editing it means editing the file. Open it in a text editor and look for the
section marked `2. DATA LAYER` — the properties are plain objects there, in the
same shape the panel produces:

```js
{
  title: "Modern Villa",
  location: "Pacific Palisades",
  price: 3950000,
  beds: 3, baths: 2,
  ...
}
```

Change the words and the numbers, save, reload. Everything else in the file —
the layout, the interactions, the images — reads from that data.

### Opening it on a phone

Tapping the file in a phone's Files app opens a *preview*, and previews do not run
scripts. The page is built to survive that: the cards, the hero and the
testimonials are baked into the file, so a preview shows the site rather than a
white screen. The interactive parts — the filter bar, the floor plan, the lightbox
— need a real browser. On iPhone: share → Open in Safari.

### Before you publish it

Change the title and description in the `<head>`, and replace `og-image.png` with
your own if you have one. The demo agent — *Adam Marsh*, the phone number and the
licence — is invented. The number is in the 555-01xx range reserved for fiction,
so it belongs to nobody, but leaving it on a live site would still be odd.

---

## 16. Notes and limits

**Framer will not nest a list inside a list.** That is why rooms, floors, photos
and map pins live in their own groups rather than under each property, and why
each of them names its property by number.

**No upload field can live inside a list.** Room photos and gallery photos can be
uploaded because those are their own lists; a per-property video cannot, which is
why it takes an address.

**The contact form is a mail link.** Pressing it opens the visitor's own mail app
with the subject filled in. There is no server, no form service and no monthly
fee — and nothing to break.

**Every image is inside the file.** The component draws its listing scenes from
a short specification and carries one photograph, the hero. The standalone HTML
carries fifteen photographs as well. Either way the site makes no image request
of its own and there is no photo folder to sort through. Upload your own in the
panel and the placeholder is replaced — the card, the detail page, the gallery
and the room card all follow the one upload.

**Where the HTML's photographs live.** One `PHOTOS` table near the top of the
script, each entry a data URI. Swap a value for your own — a data URI or an
ordinary URL both work — or delete the entry and the drawn scene returns.

**Reduced motion is respected.** A visitor whose system asks for less movement
gets the site without the parallax and the reveals.

---

## Support

Everything in this guide is demonstrated by the demo content that ships with the
template. If a control does not do what this document says, the fastest fix is
usually to delete the placed instance and drag a fresh one out of Assets — Framer
keeps stored values on the instance, and a stale one can outlive a change.
