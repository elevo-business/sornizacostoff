#!/usr/bin/env bash
# Builds the deployable site into _site/.
# index.html is authored as a page fragment (head tags + style, then body markup);
# this wraps it in a full HTML document for static hosting.
set -euo pipefail
cd "$(dirname "$0")/.."

out=_site
rm -rf "$out"
mkdir -p "$out"
cp -r assets "$out/"

split=$(grep -n '^</style>' index.html | head -1 | cut -d: -f1)
if [ -z "$split" ]; then
  echo "build: no closing </style> found in index.html" >&2
  exit 1
fi

{
  echo '<!doctype html>'
  echo '<html lang="de">'
  echo '<head>'
  echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  # Concept preview: keep it out of search results so it never competes with costoff.de.
  echo '<meta name="robots" content="noindex, nofollow">'
  echo '<link rel="icon" type="image/png" href="assets/logo.png">'
  head -n "$split" index.html
  echo '</head>'
  echo '<body>'
  tail -n +"$((split + 1))" index.html
  echo '</body>'
  echo '</html>'
} > "$out/index.html"

touch "$out/.nojekyll"
echo "build: wrote $out/index.html ($(wc -c < "$out/index.html") bytes)"
