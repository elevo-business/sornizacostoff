"""Assemble the static site into _site/.

Each page in src/ is a fragment: <title> and <meta> tags, then a `<!-- body -->` marker,
then the page markup. Shared partials (_head, _header, _footer) are wrapped around it.
"""
import pathlib, re, shutil, sys

root = pathlib.Path(__file__).resolve().parent.parent
src, out = root / "src", root / "_site"
if out.exists():
    shutil.rmtree(out)
out.mkdir()
shutil.copytree(root / "assets", out / "assets")

head = (src / "_head.html").read_text()
header = (src / "_header.html").read_text()
footer = (src / "_footer.html").read_text()

pages = sorted(p for p in src.glob("*.html") if not p.name.startswith("_"))
for page in pages:
    text = page.read_text()
    if "<!-- body -->" not in text:
        sys.exit(f"build: {page.name} has no <!-- body --> marker")
    page_head, body = text.split("<!-- body -->", 1)
    name = page.stem
    nav = header
    if name in ("leistungen", "ueber-mich"):
        nav = nav.replace(f'data-nav="{name}"', f'data-nav="{name}" aria-current="page"')
    html = (
        "<!doctype html>\n<html lang=\"de\">\n<head>\n" + head + page_head.strip() + "\n</head>\n"
        f"<body data-page=\"{name}\">\n" + nav + body.strip() + "\n" + footer + "</body>\n</html>\n"
    )
    (out / page.name).write_text(html)
    print(f"build: {page.name} ({len(html)} bytes)")

(out / ".nojekyll").touch()
