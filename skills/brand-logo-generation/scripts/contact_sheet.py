#!/usr/bin/env python3
"""Tile a round of generated logo candidates at the sizes a logo is actually seen.

Usage:
    python3 contact_sheet.py ROUND_DIR [--competitors DIR] [--out sheet.png]
                             [--sizes 16,32,64,256] [--mono]

ROUND_DIR holds the candidate PNGs for one round. Each candidate becomes a column;
each requested size becomes a row. Competitor marks, if given, are appended as extra
columns with a divider so distinctiveness can be judged side by side. --mono
converts everything to greyscale first, which is how candidates should be judged.

Requires Pillow:  python3 -m pip install pillow
"""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run: python3 -m pip install pillow")

EXTS = {".png", ".jpg", ".jpeg", ".webp"}
CELL = 272        # column width; largest size plus padding
PAD = 8
LABEL_H = 18


def load_images(folder: Path, mono: bool):
    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in EXTS)
    out = []
    for p in files:
        im = Image.open(p).convert("RGBA")
        bg = Image.new("RGBA", im.size, "white")
        bg.alpha_composite(im)
        im = bg.convert("L" if mono else "RGB")
        out.append((p.name, im))
    return out


def fit(im, size):
    im = im.copy()
    im.thumbnail((size, size), Image.LANCZOS)
    canvas = Image.new(im.mode, (size, size), "white")
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("round_dir", type=Path)
    ap.add_argument("--competitors", type=Path)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--sizes", default="16,32,64,256")
    ap.add_argument("--mono", action="store_true")
    a = ap.parse_args()

    sizes = [int(s) for s in a.sizes.split(",")]
    cands = load_images(a.round_dir, a.mono)
    if not cands:
        sys.exit(f"No images found in {a.round_dir}")
    comps = load_images(a.competitors, a.mono) if a.competitors else []
    cols = cands + comps
    mode = "L" if a.mono else "RGB"

    row_h = [max(s, 16) + PAD * 2 for s in sizes]
    width = PAD + len(cols) * (CELL + PAD) + (PAD * 3 if comps else 0)
    height = LABEL_H + sum(row_h) + PAD
    sheet = Image.new(mode, (width, height), "white")
    draw = ImageDraw.Draw(sheet)

    x = PAD
    for i, (name, im) in enumerate(cols):
        if comps and i == len(cands):
            draw.line([(x, 0), (x, height)], fill=128, width=2)
            x += PAD * 3
        draw.text((x, 2), name[:34], fill=0)
        y = LABEL_H
        for s, rh in zip(sizes, row_h):
            tile = fit(im, s)
            sheet.paste(tile, (x + (CELL - s) // 2, y + PAD))
            y += rh
        x += CELL + PAD

    y = LABEL_H
    for s, rh in zip(sizes, row_h):
        draw.text((2, y + PAD), f"{s}px", fill=96)
        y += rh

    out = a.out or a.round_dir / "contact-sheet.png"
    sheet.save(out)
    print(f"wrote {out}  ({len(cands)} candidates, {len(comps)} competitors, sizes {sizes})")


if __name__ == "__main__":
    main()
