#!/usr/bin/env python3
"""
Normaliser SVG-ikoner: beskjær til motivets faktiske bounding box.

Kildefilene (TOBBs forkjøpsrett-illustrasjoner) er forfattet i en fast
1920×1080-ramme med selve motivet sentrert i en liten del av lerretet. Brukt
som de er blir ikonene bittesmå. Dette skriptet laster hver SVG i headless
Chromium, leser ekte getBBox(), og skriver en ny versjon der viewBox er satt
til motivets boks (+ litt luft) og den faste width/height er fjernet (så den
skalerer fritt i CSS).

Output: public/forkjopsrett/icons/<slug>.svg + icons-manifest (slug -> navn).

Kjør:  python3 scripts/normalize-svg-icons.py
Krever: Python playwright (samme som scripts/qa-shots.py).
"""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

SRC = Path(
    "/Users/asbjorngronli/Library/CloudStorage/GoogleDrive-asbjorn@superponni.no/"
    "Delte disker/Superponni/02 Prosjekter/TOBB/REDE/Rede 2026/"
    "Digital scrollytelling/Forkjøpsrett/02 SVG-illustrasjoner/"
    "TOBB illustrasjoner forkjøpsrett"
)
OUT = Path(__file__).resolve().parent.parent / "public" / "forkjopsrett" / "icons"

PAD_RATIO = 0.05  # luft rundt motivet, andel av største dimensjon


def slugify(name: str) -> str:
    s = name.lower()
    s = (s.replace("æ", "ae").replace("ø", "o").replace("å", "a"))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def rewrite_svg(svg_text: str, bbox: dict) -> str:
    pad = PAD_RATIO * max(bbox["width"], bbox["height"])
    x = bbox["x"] - pad
    y = bbox["y"] - pad
    w = bbox["width"] + 2 * pad
    h = bbox["height"] + 2 * pad
    new_vb = f'viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}"'

    # Finn åpnings-<svg ...>-taggen og rydd width/height/viewBox/preserveAspectRatio
    m = re.search(r"<svg\b[^>]*>", svg_text, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        raise ValueError("Fant ingen <svg>-tagg")
    tag = m.group(0)
    tag = re.sub(r'\s+width="[^"]*"', "", tag)
    tag = re.sub(r'\s+height="[^"]*"', "", tag)
    tag = re.sub(r'\s+viewBox="[^"]*"', "", tag, flags=re.IGNORECASE)
    tag = re.sub(r'\s+preserveAspectRatio="[^"]*"', "", tag, flags=re.IGNORECASE)
    tag = tag[:-1].rstrip() + f' {new_vb} preserveAspectRatio="xMidYMid meet">'
    return svg_text[: m.start()] + tag + svg_text[m.end():]


def main():
    files = sorted(p for p in SRC.glob("*.svg"))
    if not files:
        print(f"Fant ingen SVG i {SRC}", file=sys.stderr)
        sys.exit(1)

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        for f in files:
            text = f.read_text(encoding="utf-8")
            page.set_content(text, wait_until="load")
            bbox = page.eval_on_selector(
                "svg",
                "el => { const b = el.getBBox(); "
                "return {x:b.x, y:b.y, width:b.width, height:b.height}; }",
            )
            if not bbox or bbox["width"] <= 0 or bbox["height"] <= 0:
                print(f"  ! hoppet over (tom bbox): {f.name}")
                continue
            slug = slugify(f.stem)
            out_text = rewrite_svg(text, bbox)
            (OUT / f"{slug}.svg").write_text(out_text, encoding="utf-8")
            manifest[slug] = f.stem
            print(
                f"  {f.stem:24s} -> {slug:20s} "
                f"bbox {bbox['width']:.0f}x{bbox['height']:.0f}"
            )
        browser.close()

    (OUT / "icons.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nFerdig: {len(manifest)} ikoner -> {OUT}")
    print(f"Manifest: {OUT / 'icons.json'}")


if __name__ == "__main__":
    main()
