# Costoff Clarity & Change – Website

Statische Website für costoff.de, deployt über GitHub Pages (`.github/workflows/deploy.yml`).

- `src/` – Seiten als Fragmente (`index`, `leistungen`, `ueber-mich`, `impressum`, `datenschutz`) plus gemeinsame Bausteine (`_head`, `_header`, `_footer`).
- `assets/` – `site.css`, `site.js`, lokal eingebundene Schriften (`fonts/`) und Bilder.
- `scripts/build.sh` – baut `_site/` (vollständige HTML-Dokumente, `noindex` bis zum Livegang).

Lokal bauen und ansehen:

```sh
./scripts/build.sh
python3 -m http.server -d _site 8000
```

Formular: In `src/index.html` beim Formular `data-access-key` mit dem Web3Forms-Schlüssel füllen, sobald er vorliegt. Ohne Schlüssel zeigt das Formular einen Hinweis und versendet nichts.
