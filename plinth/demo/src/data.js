/* ==========================================================================
   PLINTH demo — data.js
   Stand-in catalogue for the preview only. In the real theme every one of
   these values is read from Shopify: products, variants, prices, compare-at
   prices, inventory, collections and reviews.
   ========================================================================== */

const CURRENCY = { code: 'EUR', symbol: '€' };

const money = (cents) =>
  CURRENCY.symbol + (cents / 100).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLOURS = [
  { name: 'Chalk', hex: '#E9E4DA' },
  { name: 'Clay', hex: '#B0745C' },
  { name: 'Ink', hex: '#1B1B16' },
  { name: 'Moss', hex: '#5A6B52' },
  { name: 'Rust', hex: '#A44A2E' },
  { name: 'Slate', hex: '#6A7278' },
];

const SIZES = ['Small', 'Medium', 'Large'];

const PRODUCTS = [
  { t: 'Aro Carafe',        p: 8900,  c: 11500, cat: 'objects',   colours: [0, 1, 2], sizes: [],            r: 4.9, n: 128, stock: 6,  tag: 'Best seller' },
  { t: 'Halden Table Lamp', p: 24500, c: null,  cat: 'lighting',  colours: [0, 2, 5], sizes: [],            r: 4.8, n: 64,  stock: 22, tag: null },
  { t: 'Ostra Lounge Chair',p: 89000, c: null,  cat: 'furniture', colours: [3, 1, 5], sizes: [],            r: 5.0, n: 41,  stock: 3,  tag: 'Made to order' },
  { t: 'Sund Flask',        p: 6400,  c: 7900,  cat: 'objects',   colours: [0, 4],    sizes: SIZES,         r: 4.7, n: 212, stock: 48, tag: null },
  { t: 'Marka Weekend Bag', p: 32000, c: null,  cat: 'accessories', colours: [1, 2],  sizes: [],            r: 4.9, n: 87,  stock: 11, tag: 'New' },
  { t: 'Veld Wall Clock',   p: 15900, c: 19900, cat: 'objects',   colours: [2, 0],    sizes: [],            r: 4.6, n: 53,  stock: 9,  tag: null },
  { t: 'Fyra Stool',        p: 21000, c: null,  cat: 'furniture',  colours: [3, 0, 5], sizes: [],           r: 4.8, n: 38,  stock: 17, tag: null },
  { t: 'Rime Serving Bowl', p: 7200,  c: null,  cat: 'objects',   colours: [0, 4, 3], sizes: SIZES,         r: 4.9, n: 164, stock: 2,  tag: null },
  { t: 'Norr Pendant',      p: 27500, c: 33000, cat: 'lighting',  colours: [2, 5],    sizes: [],            r: 4.7, n: 29,  stock: 14, tag: null },
  { t: 'Bruk Tray',         p: 5400,  c: null,  cat: 'objects',   colours: [1, 3],    sizes: [],            r: 4.5, n: 96,  stock: 33, tag: 'New' },
  { t: 'Lyse Floor Lamp',   p: 41000, c: null,  cat: 'lighting',  colours: [0, 2],    sizes: [],            r: 4.9, n: 22,  stock: 0,  tag: null },
  { t: 'Kalv Side Table',   p: 34500, c: 39000, cat: 'furniture',  colours: [3, 1],   sizes: [],            r: 4.8, n: 45,  stock: 7,  tag: null },
];

const CATALOGUE = PRODUCTS.map((raw, i) => ({
  id: 1000 + i,
  handle: raw.t.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title: raw.t,
  vendor: 'Plinth Studio',
  price: raw.p,
  compareAt: raw.c,
  collection: raw.cat,
  colours: raw.colours.map((c) => COLOURS[c]),
  sizes: raw.sizes,
  rating: raw.r,
  reviews: raw.n,
  stock: raw.stock,
  tag: raw.tag,
  seed: i,
  description:
    'Turned in a workshop that has been running for three generations, then finished by hand. ' +
    'Small dimensional differences are part of the process rather than a fault in it.',
  specs: [
    ['Material', 'Stoneware, unglazed exterior'],
    ['Dimensions', '18 × 18 × 24 cm'],
    ['Weight', '1.4 kg'],
    ['Care', 'Dishwasher safe, avoid thermal shock'],
    ['Origin', 'Made in Portugal'],
  ],
}));

const COLLECTIONS = [
  { handle: 'objects', title: 'Objects', blurb: 'Everyday pieces, made to be used rather than displayed.' },
  { handle: 'lighting', title: 'Lighting', blurb: 'Warm, low and deliberately unfussy.' },
  { handle: 'furniture', title: 'Furniture', blurb: 'Built in small runs and meant to outlive the room it was bought for.' },
  { handle: 'accessories', title: 'Accessories', blurb: 'The things that travel with you.' },
];

const REVIEWS = [
  { q: 'It arrived beautifully packed and it is genuinely better in person. I have already ordered a second.', n: 'Marta L.', m: 'Verified buyer', r: 5 },
  { q: 'I asked a question at nine in the evening and had a real answer by morning. The piece itself has become the one I reach for.', n: 'Daniel R.', m: 'Verified buyer', r: 5 },
  { q: 'Third order this year. Nothing has worn badly, which I cannot say about anything else I bought online.', n: 'Yuki T.', m: 'Verified buyer', r: 5 },
];

const JOURNAL = [
  { t: 'Why we stopped running sales', d: '12 March', x: 'Discounting taught our customers to wait. Here is what we did instead, and what it cost us.' },
  { t: 'A day in the Alentejo workshop', d: '28 February', x: 'Four hundred kilometres south, eleven people, and a kiln that has not been cold since 1994.' },
  { t: 'How to care for unglazed stoneware', d: '9 February', x: 'It is more forgiving than it looks. Three habits will see a piece through a decade.' },
];
