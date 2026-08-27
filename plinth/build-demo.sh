#!/usr/bin/env bash
# Build the standalone preview from the theme's own stylesheets.
#
# The demo shares base.css, components.css and sections.css with the Shopify
# theme verbatim, so the preview and the installed store can never drift
# apart visually. Only demo.css and the demo scripts are preview-only.
#
# Usage: ./build-demo.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME="$ROOT/theme"
SRC="$ROOT/demo/src"
OUT="$ROOT/demo/plinth-demo.html"

{
  cat <<'HEAD'
<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Plinth — an editorial commerce theme for Shopify</title>
<meta name="description" content="Preview of Plinth, a premium Shopify theme. Editorial layouts, a hairline product grid, cart drawer, instant search and a design system that rebrands from nine colours.">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300..700&display=swap">
<style>
HEAD

  cat "$THEME/assets/base.css"
  cat "$THEME/assets/components.css"
  cat "$THEME/assets/sections.css"
  cat "$SRC/demo.css"

  cat <<'MID'
</style>
</head>
<body class="type-editorial surface-hairline buttons-square animate-hover motion-standard">
MID

  cat "$SRC/shell.html"

  echo '<script>'
  cat "$SRC/artwork.js"
  cat "$SRC/data.js"
  cat "$SRC/demo.js"
  cat "$SRC/controls.js"
  cat <<'TAIL'
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');
TAIL
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > "$OUT"

printf 'Built %s (%s)\n' "$OUT" "$(du -h "$OUT" | cut -f1)"
