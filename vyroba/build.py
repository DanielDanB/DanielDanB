#!/usr/bin/env python3
"""Sestaví jednosouborovou aplikaci: src/app.html + src/app.js + data.json -> prehled-zakazek.html"""
import io, json, os
here = os.path.dirname(os.path.abspath(__file__))
html = io.open(os.path.join(here, 'src/app.html'), encoding='utf-8').read()
js   = io.open(os.path.join(here, 'src/app.js'), encoding='utf-8').read()
data = io.open(os.path.join(here, 'data.json'), encoding='utf-8').read()
# obsah <script type="application/json"> nesmí obsahovat "</"
data = data.replace('</', '<\\/')
out = html.replace('__DATA__', data).replace('__APP__', js)
dest = os.path.join(here, 'prehled-zakazek.html')
io.open(dest, 'w', encoding='utf-8').write(out)
print('%s  (%.1f MB, %d zakázek)' % (dest, len(out.encode()) / 1e6, len(json.loads(io.open(os.path.join(here,'data.json'),encoding='utf-8').read()))))
