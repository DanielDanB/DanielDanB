/* ==========================================================================
   PLINTH demo — artwork.js
   The demo ships without photography on purpose: a template that shows one
   industry's stock photos reads as that industry's template. These are
   line-drawn objects on tinted grounds — enough to judge the layout, neutral
   enough to imagine any catalogue in their place.
   ========================================================================== */

const GROUNDS = ['#EAE6DE', '#E4DED2', '#DFD9CD', '#E8E1D6', '#E1E4DF', '#EDE5E0', '#E6E2DA', '#DDDDD6'];

/* Each drawing is a set of paths inside a 400 × 500 stage. */
const SHAPES = {
  vessel: `
    <path d="M176 66 h48 v32 c28 16 40 40 40 70 v130 c0 42-30 72-64 72s-64-30-64-72V168c0-30 12-54 40-70z" />
    <path d="M176 98 h48" />
    <ellipse cx="200" cy="66" rx="24" ry="7" />`,
  lamp: `
    <path d="M118 214 L156 108 h88 l38 106 z" />
    <path d="M118 214 h164" />
    <path d="M200 214 v168" />
    <path d="M146 396 c0-14 24-22 54-22s54 8 54 22z" />
    <path d="M136 396 h128" />`,
  chair: `
    <path d="M124 118 h152 v122 h-152 z" />
    <path d="M112 262 h176 v20 h-176 z" />
    <path d="M130 282 l-16 132" />
    <path d="M270 282 l16 132" />
    <path d="M150 282 v104" /><path d="M250 282 v104" />
    <path d="M150 342 h100" />`,
  bottle: `
    <path d="M176 62 h48 v66 c30 22 44 56 44 96 v148 c0 24-18 40-68 40s-68-16-68-40V224c0-40 14-74 44-96z" />
    <path d="M172 100 h56" />
    <path d="M148 262 h104" /><path d="M148 322 h104" />`,
  bag: `
    <path d="M110 176 h180 l22 232 h-224 z" />
    <path d="M158 176 c0-46 18-70 42-70s42 24 42 70" />
    <path d="M110 216 h180" />`,
  clock: `
    <circle cx="200" cy="212" r="104" />
    <circle cx="200" cy="212" r="84" />
    <path d="M200 212 V152" /><path d="M200 212 l44 26" />
    <path d="M158 314 l-22 96 h128 l-22-96" />`,
  stool: `
    <ellipse cx="200" cy="176" rx="104" ry="30" />
    <path d="M96 176 v14 c0 16 46 30 104 30s104-14 104-30v-14" />
    <path d="M118 214 l-8 178" /><path d="M282 214 l8 178" /><path d="M200 222 v170" />
    <path d="M126 320 c48 18 100 18 148 0" />`,
  bowl: `
    <path d="M84 200 h232 c0 92-52 154-116 154S84 292 84 200z" />
    <ellipse cx="200" cy="200" rx="116" ry="26" />
    <path d="M200 354 v34" />
    <path d="M150 388 h100" />`,
};

const SHAPE_KEYS = Object.keys(SHAPES);

/**
 * Build one product image.
 * @param {number} seed  stable per product so a card never changes on re-render
 * @param {number} shift 0 for the main image, 1 for the hover image
 */
function artwork(seed, shift = 0) {
  const shape = SHAPES[SHAPE_KEYS[(seed + shift * 3) % SHAPE_KEYS.length]];
  const ground = GROUNDS[(seed * 3 + shift * 5) % GROUNDS.length];
  const scale = shift ? 0.82 : 1;
  const horizon = shift ? 430 : 408;

  return `
    <svg class="artwork" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="500" fill="${ground}"/>
      <line x1="0" y1="${horizon}" x2="400" y2="${horizon}" stroke="#14140F" stroke-opacity="0.14" stroke-width="1"/>
      <g transform="translate(200 ${250 - 250 * scale + (shift ? 14 : 0)}) scale(${scale}) translate(-200 0)"
         fill="none" stroke="#14140F" stroke-opacity="0.72" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round">
        ${shape}
      </g>
    </svg>`;
}

/** Wide artwork for heroes and banners. */
function scene(seed = 0) {
  const ground = GROUNDS[seed % GROUNDS.length];
  return `
    <svg class="artwork" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="1200" height="800" fill="${ground}"/>
      <line x1="0" y1="596" x2="1200" y2="596" stroke="#14140F" stroke-opacity="0.14"/>
      <g fill="none" stroke="#14140F" stroke-opacity="0.72" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <g transform="translate(160 120) scale(1.16)">${SHAPES.vessel}</g>
        <g transform="translate(560 330) scale(0.78)">${SHAPES.bowl}</g>
        <g transform="translate(800 96) scale(1.28)">${SHAPES.lamp}</g>
      </g>
    </svg>`;
}

function portrait(seed = 0) {
  const ground = GROUNDS[(seed + 2) % GROUNDS.length];
  return `
    <svg class="artwork" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="1000" fill="${ground}"/>
      <line x1="0" y1="812" x2="800" y2="812" stroke="#14140F" stroke-opacity="0.14"/>
      <g fill="none" stroke="#14140F" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <g transform="translate(200 300) scale(1.05)">${SHAPES.chair}</g>
      </g>
    </svg>`;
}

/** Ink-ground variant: light strokes on a dark field, for promotional bands
    where a scrim over light artwork would only turn the section grey. */
function sceneDark() {
  return `
    <svg class="artwork" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="1200" height="700" fill="#14140F"/>
      <line x1="0" y1="560" x2="1200" y2="560" stroke="#F4F1EC" stroke-opacity="0.18"/>
      <g fill="none" stroke="#F4F1EC" stroke-opacity="0.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <g transform="translate(60 120) scale(0.9)">${SHAPES.vessel}</g>
        <g transform="translate(300 230) scale(0.62)">${SHAPES.bowl}</g>
        <g transform="translate(700 200) scale(0.7)">${SHAPES.stool}</g>
        <g transform="translate(930 96) scale(1.02)">${SHAPES.lamp}</g>
      </g>
    </svg>`;
}
