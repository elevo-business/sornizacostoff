# Costoff Clarity & Change – Konzept-Onepager

Konzeptentwurf für den Relaunch von costoff.de.

- `index.html` – Onepager als Seitenfragment (Head-Tags und Styles, danach das Markup).
- `assets/` – Logo und Fotos von der bestehenden Website, für das Web komprimiert.
- `scripts/build.sh` – baut daraus `_site/` mit vollständigem HTML-Dokument (`noindex`, damit das Konzept nicht mit costoff.de konkurriert).
- `.github/workflows/deploy.yml` – deployt `_site/` bei jedem Push auf GitHub Pages.

Lokal bauen und ansehen:

```sh
./scripts/build.sh
python3 -m http.server -d _site 8000
```

Paketnamen und Texte sind Vorschläge. Das Anfrageformular ist noch nicht angebunden.
