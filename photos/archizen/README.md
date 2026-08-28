# Placeholder photographs

These are generated, not photographed — procedural architectural scenes
(towers, pavilions, interiors, façade studies) rendered by
`tools/archizen/render-photos.py`. They exist so the template has something to
show; replace them with the studio's own work before publishing.

Sizes match the control titles in the Framer component:

- `hero-0*.jpg` — 1400 × 1000, the four tiles on the first screen
- `work-0*.jpg` — 1600 × 900, Selected Work and the service hover previews
- `studio-01.jpg` — 1000 × 1400, the portrait beside the studio text
- `detail-0*.jpg`, `studio-02.jpg` — 1200 × 1200, the sideways details strip

To regenerate with different seeds, edit the `JOBS` table in
`tools/archizen/render-photos.py` and run it; then rebuild the standalone page
with `node tools/archizen/build-mockup.mjs`.
