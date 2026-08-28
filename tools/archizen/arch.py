"""
Procedural architectural placeholder photographs.

Every scene is built the same way: a graded sky, a few building volumes drawn as
perspective quads with window grids mapped onto them, a ground plane, then the
atmosphere that makes it read as a photograph rather than a diagram — haze,
bloom around the light source, vignette and film grain.
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance

# ---------------------------------------------------------------- helpers

def lerp(a, b, t):
    return a + (b - a) * t

def mix(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))

def shade(c, f):
    return tuple(max(0, min(255, int(round(v * f)))) for v in c)

def quad_point(q, u, v):
    """Bilinear point inside a quad given as [tl, tr, br, bl]."""
    tl, tr, br, bl = q
    top = (lerp(tl[0], tr[0], u), lerp(tl[1], tr[1], u))
    bot = (lerp(bl[0], br[0], u), lerp(bl[1], br[1], u))
    return (lerp(top[0], bot[0], v), lerp(top[1], bot[1], v))

def sub_quad(q, u0, v0, u1, v1):
    return [quad_point(q, u0, v0), quad_point(q, u1, v0),
            quad_point(q, u1, v1), quad_point(q, u0, v1)]

def vgrad(size, top, bottom, power=1.0):
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        t = (y / max(1, h - 1)) ** power
        px[0, y] = mix(top, bottom, t)
    return img.resize(size, Image.BILINEAR)

def face_gradient(draw_on, quad, c_left, c_right, steps=64):
    """Paint a quad with a horizontal gradient, strip by strip."""
    d = ImageDraw.Draw(draw_on)
    for i in range(steps):
        u0, u1 = i / steps, (i + 1) / steps + 0.002
        d.polygon(sub_quad(quad, u0, 0.0, min(1.0, u1), 1.0),
                  fill=mix(c_left, c_right, (i + 0.5) / steps))

# ---------------------------------------------------------------- palettes

SKIES = {
    "dusk":     [((28, 38, 66), (196, 148, 122)), ((22, 30, 54), (232, 176, 128))],
    "clear":    [((58, 118, 186), (186, 214, 236)), ((44, 104, 176), (208, 226, 240))],
    "overcast": [((176, 182, 188), (216, 219, 222)), ((156, 164, 172), (206, 210, 214))],
    "warm":     [((120, 146, 170), (226, 214, 196)), ((104, 132, 162), (238, 224, 200))],
}

def sky(size, kind, rnd):
    top, bottom = rnd.choice(SKIES[kind])
    img = vgrad(size, top, bottom, power=1.6)
    # a soft sun, low and off to one side
    w, h = size
    sun = Image.new("RGB", size, (0, 0, 0))
    sd = ImageDraw.Draw(sun)
    sx, sy = rnd.uniform(0.15, 0.85) * w, rnd.uniform(0.12, 0.45) * h
    r = w * rnd.uniform(0.18, 0.32)
    sd.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(255, 236, 206))
    sun = sun.filter(ImageFilter.GaussianBlur(w * 0.09))
    strength = 0.5 if kind in ("dusk", "warm") else 0.3
    img = ImageChops.add(img, sun.point(lambda v: int(v * strength)))
    # thin cloud banding
    clouds = Image.new("L", (w // 6, h // 6), 0)
    cd = ImageDraw.Draw(clouds)
    for _ in range(rnd.randint(3, 7)):
        cy = rnd.uniform(0.05, 0.55) * clouds.height
        cw = rnd.uniform(0.3, 0.9) * clouds.width
        cx = rnd.uniform(-0.1, 0.9) * clouds.width
        ch = rnd.uniform(0.02, 0.06) * clouds.height
        cd.ellipse([cx, cy, cx + cw, cy + ch], fill=rnd.randint(40, 110))
    clouds = clouds.resize(size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(w * 0.02))
    img = Image.composite(Image.new("RGB", size, (255, 255, 255)), img, clouds.point(lambda v: v // 2))
    return img

CONCRETE = [(196, 192, 186), (172, 168, 162), (150, 147, 142), (208, 205, 199)]
WHITE    = [(238, 238, 236), (226, 226, 224), (214, 214, 211)]
DARK     = [(64, 66, 70), (48, 50, 54), (82, 84, 88)]
WOOD     = [(176, 132, 84), (150, 108, 66)]

# ---------------------------------------------------------------- volumes

def windows(img, quad, cols, rows, glass, glow, rnd, inset=0.14, banded=False):
    d = ImageDraw.Draw(img, "RGBA")
    for r in range(rows):
        for c in range(cols):
            u0 = (c + inset) / cols
            u1 = (c + 1 - inset) / cols
            v0 = (r + (0.02 if banded else 0.22)) / rows
            v1 = (r + (0.98 if banded else 0.82)) / rows
            lit = rnd.random() < glow
            base = mix(glass, (255, 214, 158), 0.75) if lit else glass
            base = shade(base, rnd.uniform(0.86, 1.12))
            d.polygon(sub_quad(quad, u0, v0, u1, v1), fill=base + (255,))
            # a highlight along the top of each pane
            d.polygon(sub_quad(quad, u0, v0, u1, v0 + (v1 - v0) * 0.22),
                      fill=shade(base, 1.25) + (140,))

def volume(img, x0, x1, y_top, y_base, vanish, rnd, kind="concrete",
           cols=6, rows=8, glow=0.0, band=False):
    """A box seen from one corner: a wide front face and a receding side face."""
    pal = {"concrete": CONCRETE, "white": WHITE, "dark": DARK}[kind]
    body = rnd.choice(pal)
    front = [(x0, y_top), (x1, y_top), (x1, y_base), (x0, y_base)]
    face_gradient(img, front, shade(body, 1.06), shade(body, 0.9))
    glass = (96, 116, 132) if kind != "dark" else (58, 70, 82)
    windows(img, front, cols, rows, glass, glow, rnd, banded=band)
    # side face receding towards the vanishing point
    depth = (vanish[0] - x1) * rnd.uniform(0.16, 0.3)
    if abs(depth) > 4:
        sx = x1 + depth
        sy_t = lerp(y_top, vanish[1], 0.22)
        sy_b = lerp(y_base, vanish[1], 0.22)
        side = [(x1, y_top), (sx, sy_t), (sx, sy_b), (x1, y_base)]
        face_gradient(img, side, shade(body, 0.72), shade(body, 0.56))
        windows(img, side, max(2, cols // 3), rows, shade(glass, 0.7), glow * 0.7, rnd, banded=band)
    # parapet line
    ImageDraw.Draw(img, "RGBA").line(front[:2], fill=shade(body, 1.3) + (200,), width=max(1, img.width // 500))

def ground(img, horizon, rnd, tone=(122, 122, 124)):
    w, h = img.size
    strip = vgrad((w, int(h - horizon) + 1), shade(tone, 0.9), shade(tone, 1.25), power=0.7)
    img.paste(strip, (0, int(horizon)))
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(rnd.randint(2, 5)):
        y = rnd.uniform(horizon + 6, h)
        d.line([(0, y), (w, y + rnd.uniform(-10, 10))], fill=(255, 255, 255, 22),
               width=max(1, int(h * 0.004)))

# ---------------------------------------------------------------- scenes

def scene_tower(size, rnd, kind="clear"):
    w, h = size
    img = sky(size, kind, rnd)
    horizon = h * rnd.uniform(0.84, 0.93)
    ground(img, horizon, rnd)
    vanish = (w * rnd.uniform(0.2, 0.8), horizon)
    # a back rank of hazier volumes
    for _ in range(rnd.randint(2, 4)):
        x0 = rnd.uniform(-0.15, 0.9) * w
        bw = rnd.uniform(0.22, 0.5) * w
        volume(img, x0, x0 + bw, rnd.uniform(0.04, 0.36) * h, horizon, vanish, rnd,
               kind=rnd.choice(["concrete", "white", "dark"]),
               cols=rnd.randint(4, 9), rows=rnd.randint(8, 16), glow=0.18)
    back = img.filter(ImageFilter.GaussianBlur(w * 0.003))
    img = Image.blend(img, back, 0.6)
    # the subject, close and sharp
    bw = rnd.uniform(0.52, 0.74) * w
    x0 = rnd.uniform(-0.06, 0.34) * w
    volume(img, x0, x0 + bw, rnd.uniform(-0.06, 0.08) * h, horizon + h * 0.02, vanish, rnd,
           kind=rnd.choice(["white", "concrete", "dark"]),
           cols=rnd.randint(5, 8), rows=rnd.randint(9, 15),
           glow=0.3 if kind == "dusk" else 0.08, band=rnd.random() < 0.5)
    return img

def scene_pavilion(size, rnd, kind="warm"):
    """A low, wide volume: a glazed ground floor under a heavy cantilevered roof."""
    w, h = size
    img = sky(size, kind, rnd)
    horizon = h * rnd.uniform(0.74, 0.82)
    ground(img, horizon, rnd, tone=(112, 110, 107))
    d = ImageDraw.Draw(img, "RGBA")
    top = h * rnd.uniform(0.3, 0.42)
    base = horizon + h * 0.02
    x0, x1 = w * rnd.uniform(-0.04, 0.06), w * rnd.uniform(0.84, 1.04)
    body = rnd.choice(CONCRETE)
    roof_h = (base - top) * rnd.uniform(0.22, 0.32)
    glass_top = top + roof_h
    # the recessed glazed ground floor
    glassq = [(x0, glass_top), (x1, glass_top - h * 0.004), (x1, base), (x0, base)]
    face_gradient(img, glassq, (40, 46, 54), (26, 31, 38))
    bays = rnd.randint(7, 12)
    for i in range(bays):
        u0, u1 = (i + 0.04) / bays, (i + 0.96) / bays
        pane = sub_quad(glassq, u0, 0.06, u1, 0.97)
        warm = rnd.random() < 0.7
        tone = mix((52, 58, 66), (226, 186, 132), 0.72 if warm else 0.12)
        d.polygon(pane, fill=shade(tone, rnd.uniform(0.8, 1.15)) + (255,))
        # what stands behind the glass, as vague dark shapes
        if rnd.random() < 0.5:
            inner = sub_quad(glassq, u0 + 0.2 / bays, 0.45, u1 - 0.2 / bays, 0.97)
            d.polygon(inner, fill=(30, 30, 32, 130))
        d.polygon(sub_quad(glassq, u0, 0.06, u1, 0.2), fill=(255, 255, 255, 40))
        d.line([pane[0], pane[3]], fill=(20, 22, 26, 220), width=max(1, w // 500))
    # roof slab, cantilevered past the glass on both sides
    over = w * 0.035
    roof = [(x0 - over, top), (x1 + over, top - h * 0.008),
            (x1 + over, glass_top), (x0 - over, glass_top)]
    face_gradient(img, roof, shade(body, 1.14), shade(body, 0.88))
    d.line([roof[3], roof[2]], fill=shade(body, 0.55) + (255,), width=max(2, w // 320))
    d.line([roof[0], roof[1]], fill=shade(body, 1.3) + (255,), width=max(1, w // 500))
    # soffit shadow under the overhang
    d.polygon([(x0 - over, glass_top), (x1 + over, glass_top),
               (x1 + over, glass_top + h * 0.02), (x0 - over, glass_top + h * 0.02)],
              fill=(0, 0, 0, 90))
    # columns, evenly spaced
    ncol = rnd.randint(3, 6)
    for i in range(ncol):
        cx = lerp(x0 + w * 0.06, x1 - w * 0.06, i / max(1, ncol - 1))
        cw = w * 0.009
        d.rectangle([cx, glass_top, cx + cw, base], fill=shade(body, 0.78) + (255,))
        d.line([(cx + cw, glass_top), (cx + cw, base)], fill=(0, 0, 0, 90),
               width=max(1, w // 600))
    # reflection of the building in the wet plaza
    strip = img.crop((0, int(glass_top), w, int(base)))
    refl = strip.transpose(Image.FLIP_TOP_BOTTOM).resize(
        (w, max(2, int((base - glass_top) * 0.45))), Image.BILINEAR)
    refl = refl.filter(ImageFilter.GaussianBlur(w * 0.004))
    img.paste(Image.blend(img.crop((0, int(base), w, int(base) + refl.height)), refl, 0.35),
              (0, int(base)))
    # trees at the edges: a trunk and a layered canopy
    for _ in range(rnd.randint(1, 2)):
        tx = rnd.choice([rnd.uniform(-0.02, 0.12), rnd.uniform(0.88, 1.02)]) * w
        canopy = Image.new("RGBA", size, (0, 0, 0, 0))
        cd = ImageDraw.Draw(canopy)
        cd.line([(tx, h * 0.1), (tx + rnd.uniform(-0.02, 0.02) * w, base)],
                fill=(34, 34, 30, 210), width=max(2, int(w * 0.012)))
        for _ in range(rnd.randint(40, 70)):
            r = rnd.uniform(0.015, 0.05) * w
            px = tx + rnd.gauss(0, 0.07 * w)
            py = rnd.gauss(h * 0.12, h * 0.12)
            cd.ellipse([px - r, py - r * 0.7, px + r, py + r * 0.7], fill=(40, 46, 38, 200))
        canopy = canopy.filter(ImageFilter.GaussianBlur(w * 0.006))
        img = Image.alpha_composite(img.convert("RGBA"), canopy).convert("RGB")
    return img

def scene_interior(size, rnd, kind=None):
    """A hall in one-point perspective: light falls in from the far end and
    washes back off the floor."""
    w, h = size
    wall = rnd.choice([(198, 194, 188), (216, 214, 210), (166, 164, 160)])
    img = Image.new("RGB", size, shade(wall, 0.85))
    d = ImageDraw.Draw(img, "RGBA")
    vx, vy = w * rnd.uniform(0.4, 0.6), h * rnd.uniform(0.46, 0.56)
    ow = w * rnd.uniform(0.08, 0.16)
    oh = h * rnd.uniform(0.14, 0.26)
    far = [(vx - ow, vy - oh), (vx + ow, vy - oh), (vx + ow, vy + oh), (vx - ow, vy + oh)]
    corners = [(0, 0), (w, 0), (w, h), (0, h)]
    faces = [
        ([corners[0], far[0], far[3], corners[3]], 0.46, 0.74),   # left wall
        ([far[1], corners[1], corners[2], far[2]], 0.78, 0.5),    # right wall
        ([corners[0], corners[1], far[1], far[0]], 0.9, 0.62),    # ceiling
        ([far[3], far[2], corners[2], corners[3]], 0.86, 0.44),   # floor
    ]
    for quad, f_near, f_far in faces:
        face_gradient(img, quad, shade(wall, f_near), shade(wall, f_far))
    # bays down both walls, spaced by perspective
    for side, (a0, b0, a1, b1) in enumerate(
            [(corners[0], corners[3], far[0], far[3]), (corners[1], corners[2], far[1], far[2])]):
        t = 0.0
        for i in range(1, 10):
            t = 1 - (0.82 ** i)
            a = (lerp(a0[0], a1[0], t), lerp(a0[1], a1[1], t))
            b = (lerp(b0[0], b1[0], t), lerp(b0[1], b1[1], t))
            ink = 70 if side == 0 else 45
            d.line([a, b], fill=(0, 0, 0, ink), width=max(1, int(w * 0.004 * (1 - t)) + 1))
            # a slot of daylight in every other bay on the left
            if side == 0 and i % 2 == 1 and i < 8:
                t2 = 1 - (0.82 ** (i + 1))
                a2 = (lerp(a0[0], a1[0], t2), lerp(a0[1], a1[1], t2))
                b2 = (lerp(b0[0], b1[0], t2), lerp(b0[1], b1[1], t2))
                d.polygon([a, a2, (b2[0], lerp(b2[1], a2[1], 0.35)),
                           (b[0], lerp(b[1], a[1], 0.35))], fill=(255, 248, 232, 90))
    # ceiling ribs
    for i in range(1, 9):
        t = 1 - (0.84 ** i)
        a = (lerp(corners[0][0], far[0][0], t), lerp(corners[0][1], far[0][1], t))
        b = (lerp(corners[1][0], far[1][0], t), lerp(corners[1][1], far[1][1], t))
        d.line([a, b], fill=(0, 0, 0, 55), width=max(1, int(w * 0.005 * (1 - t)) + 1))
    # the opening itself, and the light it throws down the floor
    d.rectangle([far[0], far[2]], fill=(248, 244, 234, 255))
    for m in range(1, 3):
        mx = lerp(far[0][0], far[1][0], m / 3)
        d.line([(mx, far[0][1]), (mx, far[2][1])], fill=(120, 122, 124, 200),
               width=max(1, w // 500))
    pool = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(pool).polygon(
        [far[3], far[2], (lerp(far[2][0], w, 0.6), h), (lerp(far[3][0], 0, 0.6), h)],
        fill=(255, 250, 238, 120))
    pool = pool.filter(ImageFilter.GaussianBlur(w * 0.02))
    img = Image.alpha_composite(img.convert("RGBA"), pool).convert("RGB")
    glow = Image.new("RGB", size, (0, 0, 0))
    ImageDraw.Draw(glow).rectangle([far[0], far[2]], fill=(255, 246, 230))
    glow = glow.filter(ImageFilter.GaussianBlur(w * 0.05))
    img = ImageChops.add(img, glow.point(lambda v: int(v * 0.4)))
    # a stair running across the near half
    if rnd.random() < 0.65:
        y = h * rnd.uniform(0.66, 0.8)
        steps = rnd.randint(6, 10)
        d2 = ImageDraw.Draw(img, "RGBA")
        for i in range(steps):
            yy = y + i * h * 0.028
            xa = lerp(0, vx * 0.7, i / steps)
            xb = lerp(w, vx * 1.25, i / steps)
            d2.line([(xa, yy), (xb, yy - h * 0.012)], fill=(255, 255, 255, 70),
                    width=max(1, w // 420))
            d2.line([(xa, yy + h * 0.006), (xb, yy - h * 0.006)], fill=(0, 0, 0, 60),
                    width=max(1, w // 600))
    return img

def scene_facade(size, rnd, kind=None):
    """Straight-on facade study: a regular grid of bays, raking light, deep reveals."""
    w, h = size
    body = rnd.choice(CONCRETE + WHITE)
    img = vgrad(size, shade(body, 1.1), shade(body, 0.84), power=1.2)
    d = ImageDraw.Draw(img, "RGBA")
    cols, rows = rnd.randint(4, 8), rnd.randint(4, 7)
    pad_x = w * rnd.uniform(0.02, 0.06)
    pad_y = h * rnd.uniform(0.02, 0.06)
    cw = (w - pad_x * 2) / cols
    ch = (h - pad_y * 2) / rows
    glass = (38, 44, 52)
    slab = rnd.random() < 0.55        # horizontal floor slabs between bands
    fins = rnd.random() < 0.45        # vertical fins in front of the glass
    iw = cw * rnd.uniform(0.72, 0.9)
    ih = ch * rnd.uniform(0.5, 0.72)
    for r in range(rows):
        # one voided bay per building, full height of its row
        void_c = rnd.randrange(cols) if rnd.random() < 0.18 else -1
        for c in range(cols):
            x = pad_x + c * cw + (cw - iw) / 2
            y = pad_y + r * ch + (ch - ih) / 2
            if c == void_c:
                d.rectangle([x, pad_y + r * ch, x + iw, pad_y + (r + 1) * ch],
                            fill=(20, 22, 26, 255))
                continue
            lit = rnd.random() < 0.2
            fill = mix(glass, (255, 214, 158), 0.75) if lit else glass
            fill = shade(fill, rnd.uniform(0.88, 1.14))
            d.rectangle([x, y, x + iw, y + ih], fill=fill + (255,))
            # sky reflected in the upper part of the pane
            d.rectangle([x, y, x + iw, y + ih * 0.34],
                        fill=shade(mix(fill, (168, 186, 202), 0.5), 1.0) + (210,))
            # the reveal: light on one edge, shadow on the other
            d.line([(x, y), (x, y + ih)], fill=(0, 0, 0, 90), width=max(1, w // 340))
            d.line([(x + iw, y), (x + iw, y + ih)], fill=(255, 255, 255, 70), width=max(1, w // 400))
            d.line([(x, y), (x + iw, y)], fill=(0, 0, 0, 120), width=max(1, w // 260))
            # mullions
            for m in range(1, rnd.randint(2, 4)):
                mx = x + iw * m / 4
                d.line([(mx, y), (mx, y + ih)], fill=(0, 0, 0, 60), width=max(1, w // 600))
        if slab:
            sy = pad_y + (r + 1) * ch - ch * 0.06
            d.rectangle([0, sy, w, sy + ch * 0.06], fill=shade(body, 1.16) + (255,))
            d.line([(0, sy + ch * 0.06), (w, sy + ch * 0.06)], fill=(0, 0, 0, 70),
                   width=max(1, w // 500))
    if fins:
        for c in range(cols * 2):
            fx = pad_x + c * cw / 2
            d.rectangle([fx, 0, fx + w * 0.006, h], fill=shade(body, 1.2) + (235,))
            d.line([(fx + w * 0.006, 0), (fx + w * 0.006, h)], fill=(0, 0, 0, 60),
                   width=max(1, w // 600))
    # a hard diagonal of sunlight across the whole wall
    shadow = Image.new("L", size, 0)
    ImageDraw.Draw(shadow).polygon(
        [(0, h * rnd.uniform(0.15, 0.55)), (w, h * rnd.uniform(-0.15, 0.25)), (w, h), (0, h)],
        fill=rnd.randint(80, 130))
    shadow = shadow.filter(ImageFilter.GaussianBlur(w * 0.006))
    img = Image.composite(Image.new("RGB", size, (16, 18, 22)), img, shadow)
    return img

SCENES = [scene_tower, scene_pavilion, scene_interior, scene_facade]

# ---------------------------------------------------------------- finishing

def photograph(img, rnd, mono=False):
    w, h = img.size
    # vignette
    vig = Image.new("L", (w, h), 0)
    ImageDraw.Draw(vig).ellipse([-w * 0.25, -h * 0.3, w * 1.25, h * 1.3], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(w * 0.08))
    img = Image.composite(img, ImageEnhance.Brightness(img).enhance(0.66), vig)
    # grain
    noise = Image.effect_noise((w, h), 14).convert("L")
    img = Image.blend(img, Image.merge("RGB", (noise, noise, noise)), 0.045)
    img = ImageEnhance.Contrast(img).enhance(rnd.uniform(1.06, 1.16))
    img = ImageEnhance.Color(img).enhance(0.0 if mono else rnd.uniform(0.72, 0.95))
    return img

def make(path, size, seed, scene=None, kind="clear", mono=False):
    rnd = random.Random(seed)
    fn = scene or rnd.choice(SCENES)
    img = fn(size, rnd, kind)
    img = photograph(img, rnd, mono)
    img.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    return path
