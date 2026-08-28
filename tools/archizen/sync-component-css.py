#!/usr/bin/env python3
"""Rewrite the stylesheet inside ArchizenSite.tsx from the HTML source.

The two products must render the same page, so the CSS is written once — in
tools/archizen/mockup.src.html — and pushed into the component from here:

    python3 tools/archizen/sync-component-css.py

Run it after every change to the mockup's <style> block.
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SRC = os.path.join(HERE, "mockup.src.html")
TSX = os.path.join(ROOT, "ArchizenSite.tsx")

css = subprocess.run(
    [sys.executable, os.path.join(HERE, "scope-css.py"), SRC],
    capture_output=True, text=True, check=True,
).stdout.rstrip()

tsx = open(TSX).read()
start = tsx.index("const CSS = `")
open_at = start + len("const CSS = `")
end = tsx.index("`", open_at)
tsx = tsx[:open_at] + "\n" + css + "\n" + tsx[end:]
open(TSX, "w").write(tsx)
print(f"stylesheet synced: {css.count(chr(10)) + 1} lines into {os.path.basename(TSX)}")
