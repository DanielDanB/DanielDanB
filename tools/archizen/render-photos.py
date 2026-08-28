import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arch

# Default straight into the folder both the mockup build and the Framer
# component read from, so a regenerated set needs no copying about.
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", os.path.join(HERE, "..", "..", "photos", "archizen"))
os.makedirs(OUT, exist_ok=True)

L = (1400, 1000)      # landscape tiles
W = (1600, 900)       # wide banners
P = (1000, 1400)      # portrait
S = (1200, 1200)      # square

JOBS = [
    # hero grid — the four tiles from the reference layout
    ("hero-01", L, 41, arch.scene_pavilion, "warm"),
    ("hero-02", L, 12, arch.scene_tower,    "clear"),
    ("hero-03", L, 73, arch.scene_interior, None),
    ("hero-04", L, 58, arch.scene_facade,   None),
    # selected work
    ("work-01", W, 91, arch.scene_tower,    "dusk"),
    ("work-02", W, 24, arch.scene_facade,   None),
    ("work-03", W, 66, arch.scene_pavilion, "overcast"),
    ("work-04", W, 33, arch.scene_interior, None),
    ("work-05", W, 88, arch.scene_tower,    "clear"),
    ("work-06", W, 17, arch.scene_facade,   None),
    # studio / about
    ("studio-01", P, 105, arch.scene_interior, None),
    ("studio-02", S, 119, arch.scene_facade,   None),
    # process / detail strip
    ("detail-01", S, 131, arch.scene_facade,   None),
    ("detail-02", S, 142, arch.scene_interior, None),
    ("detail-03", S, 153, arch.scene_pavilion, "warm"),
]

for name, size, seed, fn, kind in JOBS:
    p = os.path.join(OUT, name + ".jpg")
    arch.make(p, size, seed=seed, scene=fn, kind=kind or "clear")
    print(name, os.path.getsize(p) // 1024, "kB")
