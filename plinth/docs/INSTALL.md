# Installing Plinth

Twenty minutes, no code.

## 1. Make the zip

Shopify expects the theme folders at the **top level** of the zip — not inside
a wrapper folder.

**macOS / Linux**

```bash
cd theme
zip -r ../plinth.zip . -x ".*" -x "__MACOSX"
```

**Windows**

Open the `theme` folder, select all the folders inside it (`assets`, `config`,
`layout`, `locales`, `sections`, `snippets`, `templates`), right-click →
*Send to → Compressed (zipped) folder*.

A correct zip opens to show `assets/`, `config/`, `layout/`… straight away. If
it opens to show a single `theme` folder, Shopify will reject it.

## 2. Upload

Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.

Shopify adds it as an unpublished theme. Click **Customize** to open the theme
editor. Nothing is live until you press **Publish**, so you can set the whole
store up privately first.

## 3. First five minutes

In **Theme settings** (the gear icon at the bottom of the editor sidebar):

1. **Brand** — upload your logo, or type a wordmark. Set the favicon.
2. **Colors** — pick a palette preset, or choose *Custom* and set the nine
   colours to your brand.
3. **Typography** — choose *Editorial* (serif headlines) or *Modern* (grotesk
   headlines). This one control changes the personality of the whole store.
4. **Layout** — page width, section spacing, corner radius.

## 4. Next twenty minutes

- **Navigation.** Shopify admin → Content → Menus. Build `main-menu`. Nested
  menu items become the mega menu automatically (see `SHOPIFY-SETUP.md`).
- **Homepage.** In the editor, click any section to edit it, drag to reorder,
  or **Add section** for more. Every homepage section is optional.
- **Filters.** Install Shopify's free *Search & Discovery* app and add the
  filters you want. Plinth renders them, including colour swatches.
- **Free shipping meter.** Theme settings → Cart → set the threshold to match
  the rate you created in Settings → Shipping.

## 5. Publish

**Online Store → Themes → Actions → Publish** on the Plinth card.

## Updating later

Upload the new zip as a second theme, re-apply your settings, preview, then
publish. Never overwrite a live theme you have customized.

## If something looks wrong

| Symptom | Cause |
| --- | --- |
| Upload rejected | The zip has a wrapper folder. Re-zip from *inside* `theme/`. |
| Homepage is empty | The theme is installed but no template was applied. Open Customize → the default `index` template loads automatically. |
| No products anywhere | The sections point at collections that do not exist yet. Pick your collections in each section's settings. |
| Filters missing | Storefront filters come from the Search & Discovery app. Install it and add filters. |
| Swatches are grey circles | The colour option values are not recognised CSS colours. Set real swatches in Settings → Products → Options. |
