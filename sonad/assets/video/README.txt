sonad.mp4 — video ze sekce O nás.

Aktuální soubor je originál z telefonu: H.264 + AAC, 3,6 s, 6,6 MB.
Přehraje se ve všech běžných prohlížečích, ale na tu délku je hodně velký —
při načtení stránky na mobilních datech to je znát.

Doporučení: překódovat na zhruba 1–2 MB, zvuk může jít úplně pryč (video
běží ztlumené ve smyčce). Například:

  ffmpeg -i sonad.mp4 -an -vf "scale=-2:1080" -c:v libx264 -crf 28 -preset slow \
         -movflags +faststart sonad-web.mp4

Přehrává se ztlumeně, ve smyčce a bez ovládacích prvků. Spustí se, až když
sekce najede do obrazu, a zastaví se, jakmile z něj zmizí.

Náhledový obrázek (vidět, než se video načte) je v atributu poster u <video>
v index.html — assets/photos/video-nahled.webp.
