# Property controls cookbook

Everything the buyer can change is a control. The panel is the product — the
`.tsx` is just how it is delivered.

## Contents

- [Group headings](#group-headings)
- [The control types worth knowing](#the-control-types-worth-knowing)
- [Conditional controls](#conditional-controls)
- [Repeatable lists](#repeatable-lists)
- [File and image uploads](#file-and-image-uploads)
- [Canvas-only hints](#canvas-only-hints)
- [Colour that flows from one value](#colour-that-flows-from-one-value)
- [Video slots](#video-slots)
- [Defaults that will not budge](#defaults-that-will-not-budge)

## Group headings

`ControlType.Object` with nested `controls` is a real collapsible group in the
panel. Twelve or thirteen of them turn a wall of two hundred fields into a table
of contents the buyer can scan:

```tsx
addPropertyControls(Site, {
  navbar: {
    type: ControlType.Object,
    title: "① Navbar",
    controls: {
      showNavbar: { type: ControlType.Boolean, title: "Show Section", defaultValue: true },
      logoText:   { type: ControlType.String,  title: "Logo Text", defaultValue: "ABC LAB" },
      logoImage:  { type: ControlType.Image,   title: "Logo Image (optional, replaces logo text)",
                    description: "Recommended: 600 × 120 px, PNG with a transparent background." },
      logoHeight: { type: ControlType.Number,  title: "Logo Height", min: 16, max: 120,
                    defaultValue: 42, unit: "px" },
    },
  },
  globalStyle: { type: ControlType.Object, title: "② Global Style", controls: { ... } },
  hero:        { type: ControlType.Object, title: "③ Hero", controls: { ... } },
})
```

Number the titles. Framer renders the group titles as written, so `① Navbar`
through `⑬ Footer` reads as an ordered list and tells the buyer how many there
are before they start scrolling.

Ordering in the object is ordering in the panel. Keep it identical to the order
the sections appear on the page, so a buyer scrolling the panel and a buyer
scrolling the site are in the same place.

The component then receives one object per group rather than a flat prop list.
Give each group its own TypeScript interface — it keeps the destructuring at the
top of the component honest, and it is what makes the `hidden` predicates below
type-check.

## The control types worth knowing

| Type | Use for | Notes |
| --- | --- | --- |
| `String` | Headings, labels, button text | `displayTextArea: true` for paragraphs |
| `Number` | Sizes, speeds, strengths | Always set `min`, `max`, `unit`, `step` — an unbounded number field invites a broken layout |
| `Boolean` | Show Section, feature switches | `enabledTitle` / `disabledTitle` make the switch self-explanatory |
| `Color` | Every colour | Never hard-code a colour that appears more than once |
| `Enum` | Icon choice, form mode | Pair `options` with `optionTitles`; the buyer reads the titles |
| `Image` | Photos, logos, icons | Put the recommended size in the title |
| `File` | Video, custom icons | Constrain with `allowedFileTypes` |
| `Array` | Services, portfolio, FAQ, testimonials | See below |
| `Link` | Social and menu links | |

## Conditional controls

`hidden` lets a control appear only when it is relevant, which is what keeps a
thirteen-group panel from feeling like a cockpit:

```tsx
formEndpoint: {
  type: ControlType.String,
  title: "Formspree URL",
  defaultValue: "",
  hidden: (props: ContactGroup) => props.formMode !== "formspree",
  description: "From the form's Integration tab — https://formspree.io/f/xxxxxxx",
},
customIconColor: {
  type: ControlType.Color,
  title: "Icon Color",
  hidden: (props: ServicesGroup) => !props.recolorIcons || props.customIconFollowAccent !== false,
},
```

**Inside a group, `hidden` receives that group's props, not the component's.**
A predicate that reaches for a value living in another group gets `undefined` and
silently resolves the wrong way. If a control genuinely depends on something from
elsewhere, either move it into the same group or duplicate the switch — a control
that never appears is a support email you will have to answer.

Note `!== false` rather than `!`. A prop that has never been set on an existing
instance arrives as `undefined`, and `!undefined` is `true` — which shows the
control to exactly the users you meant to hide it from.

## Repeatable lists

An `Array` of `Object` is how a section becomes a list the buyer grows:

```tsx
services: {
  type: ControlType.Array,
  title: "Service Cards",
  control: {
    type: ControlType.Object,
    controls: {
      serviceTitle: { type: ControlType.String, title: "Title", defaultValue: "3D Printing" },
      serviceText:  { type: ControlType.String, title: "Text", displayTextArea: true },
      serviceIcon:  { type: ControlType.Enum, title: "Built-in Icon",
                      options: ["printer", "cad", "prototype", "manufacturing"],
                      optionTitles: ["3D Printer", "CAD Design", "Prototype", "Manufacturing"] },
      customIcon:   { type: ControlType.Image, title: "Custom Icon — 128 × 128 px" },
    },
  },
  defaultValue: [ /* three or four filled-in examples */ ],
}
```

Ship the list with real example entries. An empty array on first drop makes the
component look broken, and the buyer has nothing to edit *from* — most people
rewrite an example far more readily than they invent one.

For a portfolio, give each item three label/value pairs the buyer names
themselves rather than fixed fields. `Print Time / 6 h` for a workshop,
`Wood / Oak` for a joiner, `Location / Prague` for a photographer — same
component, three trades. Hide a row whose value is blank.

## File and image uploads

```tsx
heroVideo: {
  type: ControlType.File,
  title: "Video File",
  allowedFileTypes: ["mp4", "webm", "mov"],
  description: "Plays muted on a loop. Keep it under about 10 MB.",
}
```

**`ControlType.File` does not work inside a `ControlType.Array`.** Nest one in a
list item and that item's editor breaks — the *other* controls in the same item
stop working too, so the visible symptom is "I can't add a photo any more",
several fields away from the cause. Take the file upload out of the list and
accept an address instead:

```tsx
itemVideoLink: {
  type: ControlType.String, title: "Video Link", defaultValue: "",
  placeholder: "YouTube, Vimeo or .mp4 address",
}
```

Then branch on the address: a link ending in `.mp4`/`.webm` plays inline, a
YouTube or Vimeo link becomes an embed. `ControlType.Image` nests in an array
perfectly well; it is `File` specifically that does not.

`displayTextArea: true` is also ignored inside an array item — the field renders
as a single line. Harmless, but don't promise a text area there.

`ControlType.Image` yields either a string or an object with `.src` depending on
where it came from, so normalise before use:

```tsx
const src = typeof img === "string" ? img : img?.src
```

## Canvas-only hints

`RenderTarget` tells you whether the component is being drawn in the editor or on
the published site. Use it to leave notes for the buyer that visitors never see:

```tsx
import { RenderTarget } from "framer"

const onCanvas = RenderTarget.current() === RenderTarget.canvas

{!src && onCanvas && (
  <div style={{ border: "1px dashed #bbb", display: "grid", placeItems: "center",
                width: "100%", aspectRatio: "1", color: "#888", fontSize: 12 }}>
    Hero photo — 1000 × 1000 px, transparent PNG
  </div>
)}
```

An empty slot that states its own expected size removes most "what size should
the photo be?" questions before they are asked.

## Colour that flows from one value

Resolve once at the top of the component, then use the resolved value everywhere.
Nothing downstream should read the raw prop:

```tsx
const resolvedAccent = useDefaultColors ? DEFAULT_ACCENT : accentColor || DEFAULT_ACCENT
const iconColor = customIconFollowAccent === false
  ? customIconColor || resolvedAccent
  : resolvedAccent
```

Then feed CSS custom properties from the resolved values, so the stylesheet stays
readable and one change reaches every rule:

```tsx
<div style={{ "--accent": resolvedAccent, "--accent-soft": withAlpha(resolvedAccent, 0.12) }}>
```

## Video slots

Support both a file upload and a pasted link, with the file winning when both are
present:

```tsx
function embedUrl(link: string): string | null {
  const yt = link.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}`
  const vm = link.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1`
  return null
}
```

An uploaded video plays `muted autoPlay loop playsInline` so it reads as part of
the layout rather than something to press play on. `playsInline` matters — iOS
otherwise takes the video full-screen.

## Defaults that will not budge

Framer keeps control values on the placed instance. Changing a `defaultValue` in
code does not reach a component already on someone's canvas.

Symptom: the user says your fix did nothing, and a fresh drop of the component
behaves correctly.

Fix: add a control under a **new name**. The instance has nothing stored for a
name it has never seen, so the default applies. Keep the old prop readable if
existing users may have set it deliberately.

Same root cause: a component cannot write its own props, so "reset to defaults"
must be a switch the user turns on and then off again, not a button.
