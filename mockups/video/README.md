# ABC LAB scroll videos

The site scrolling top to bottom, in a browser window and in a phone, rendered
from `abclab-mockup.html`. Nothing is animated by hand — the page is loaded in a
real browser and the scroll position is stepped one frame at a time, so the
sticky navbar, the reveals, the timeline and the carousels all behave exactly as
they do for a visitor.

| File | Size | Length | For |
| --- | --- | --- | --- |
| `abclab-desktop-scroll.mp4` | 1920×1200 | 30 s | Website, portfolio, YouTube, Instagram feed |
| `abclab-desktop-scroll-short.mp4` | 1920×1200 | 15 s | Etsy listing video (5–15 s limit) |
| `abclab-mobile-scroll.mp4` | 1080×1350 | 30 s | Website, portfolio, social |
| `abclab-mobile-scroll-short.mp4` | 1080×1350 | 15 s | Etsy listing video |

The short cuts are the same 900 frames played at 60 fps rather than 30, so they
run at half the length without dropping a single frame or stuttering.

## Timing

The scroll covers the whole page over 27 seconds, easing in at the top and out
at the bottom, with a beat of stillness at each end. That works out at about
eight pixels per frame — slow enough to read a heading as it goes past.

The hero photos are cross-faded on the video's own clock, not the browser's:
each holds for 75 frames (2.5 s) and fades over 26 (0.9 s). Left to itself the
page swaps them on a four-second wall-clock timer, which is far faster than the
capture runs, so in the finished video they would flick past.

No audio track. Etsy mutes listing videos anyway, and a silent file avoids the
"no sound" complaints.

## How they were made

1. `video_capture.js` — Playwright loads the page at 1440×900 (desktop) and
   390×844 (phone), then writes one JPEG per frame while easing the scroll
   position from top to bottom. Stepping the scroll ourselves keeps the motion
   perfectly even; recording a live scroll drops frames.
2. `video_frames.js` — renders the browser window and the phone as separate
   layers: a base the footage sits on, and an overlay for the parts that belong
   in front of the screen (the phone's island and home indicator, and the
   rounded screen corners).
3. `video_encode.py` — ffmpeg lays the footage between those two layers and
   encodes to H.264.

The Google Maps embed cannot load without network access, so it is replaced by a
drawn placeholder for the recording only. Everything else is the real page.
