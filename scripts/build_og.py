#!/usr/bin/env python3
"""Render 1200x627 Open Graph cards into /og: the home portrait and each project's cover.

Each card reuses the asset the site already shows (img/gen/<slug>.jpg for projects,
img/portrait.jpg for the home hero), fitted on the site background and drawn with the
same Google Sans label as the on-page .pcover, so link previews match the page.
Requires Google Chrome (override with $CHROME) and Pillow.
"""
from __future__ import annotations

import html
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "og"
sys.path.insert(0, str(ROOT / "scripts"))

from project_pages import PROJECTS  # noqa: E402

WIDTH, HEIGHT = 1200, 627
BG = "#000"
PAD = 24
COVER_H = HEIGHT - 2 * PAD
COVER_W = round(COVER_H * 16 / 9)
# .pcover on desktop is 840px wide with a 24px radius and a 48px label.
SCALE = COVER_W / 840
GRAIN = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>"
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>"
    "<feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/></filter>"
    "<rect width='100%' height='100%' filter='url(%23n)'/></svg>"
)

BASE_CSS = f"""
@font-face {{ font-family: "Google Sans"; src: url("{(ROOT / 'assets/fonts/GoogleSans-Latin.woff2').as_uri()}") format("woff2"); font-weight: 100 900; }}
html, body {{ margin: 0; width: {WIDTH}px; height: {HEIGHT}px; overflow: hidden; background: {BG}; }}
body {{ display: grid; place-items: center; }}
"""


def project_card(slug: str, name: str) -> str:
    cover = (ROOT / "img" / "gen" / f"{slug}.jpg").as_uri()
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{BASE_CSS}
.pcover {{ position: relative; overflow: hidden; width: {COVER_W}px; height: {COVER_H}px; border-radius: {24 * SCALE:.1f}px; isolation: isolate; background: #0b0b0b; }}
.bg {{ position: absolute; inset: -4%; background: url("{cover}") center / cover; }}
.pcover::after {{ content: ""; position: absolute; inset: 0; z-index: 1; background-image: url("{GRAIN}"); opacity: .12; mix-blend-mode: overlay; }}
.plogo {{ position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; font: 600 {48 * SCALE:.1f}px/1 "Google Sans", sans-serif; letter-spacing: -0.035em; color: #fff; text-shadow: 0 2px 28px rgba(15, 20, 45, .22); }}
</style></head><body><div class="pcover"><div class="bg"></div><span class="plogo">{html.escape(name)}</span></div></body></html>"""


def home_card() -> str:
    portrait = (ROOT / "img" / "portrait.jpg").as_uri()
    # Same #hero-key filter as the home hero: crushes the portrait's near-black backdrop into the page black.
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{BASE_CSS}
img {{ display: block; height: {HEIGHT}px; width: auto; filter: url("#hero-key"); }}
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="hero-key" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.15" intercept="-0.064"/><feFuncG type="linear" slope="1.15" intercept="-0.064"/><feFuncB type="linear" slope="1.15" intercept="-0.064"/></feComponentTransfer></filter></svg>
<img src="{portrait}" alt=""></body></html>"""


def render(page: str, dest: Path, chrome: str, tmp: Path) -> None:
    src = tmp / f"{dest.stem}.html"
    png = tmp / f"{dest.stem}.png"
    src.write_text(page, encoding="utf-8")
    subprocess.run(
        [
            chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
            "--allow-file-access-from-files", "--force-device-scale-factor=1",
            f"--user-data-dir={tmp / 'profile'}",
            f"--window-size={WIDTH},{HEIGHT}", "--virtual-time-budget=3000",
            f"--screenshot={png}", src.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    with Image.open(png) as im:
        im = im.convert("RGB")
        if im.size != (WIDTH, HEIGHT):
            raise SystemExit(f"{dest.name}: Chrome rendered {im.size}, expected {(WIDTH, HEIGHT)}")
        im.save(dest, "JPEG", quality=88, optimize=True, progressive=True)


def main() -> None:
    chrome = os.environ.get("CHROME") or next(
        (p for p in map(shutil.which, ("google-chrome-stable", "chromium", "google-chrome")) if p), None
    )
    if not chrome:
        raise SystemExit("Google Chrome not found; set $CHROME")
    OUT.mkdir(exist_ok=True)
    cards = {"home": home_card()} | {p["slug"]: project_card(p["slug"], p["name"]) for p in PROJECTS}
    with tempfile.TemporaryDirectory() as tmp:
        for key, page in cards.items():
            render(page, OUT / f"{key}.jpg", chrome, Path(tmp))
            print(f"og/{key}.jpg")


if __name__ == "__main__":
    main()
