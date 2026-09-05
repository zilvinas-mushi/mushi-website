#!/usr/bin/env python3
"""Flatten Figma's raster-in-SVG exports into plain WebP files.

Several exports from the Figma file are nominally SVG but carry a full-size
PNG inside a <pattern>: the three award badges are 2700x2000 photographs
wrapped in a 40x39 <svg>, which is ~170 KB each on the wire for a mark that
renders at 40 CSS px. The creator avatars do the same at 150x150 for a 32px
disc.

The pattern's <use> transform is what decides which part of the bitmap is
visible, so this reproduces it rather than just re-encoding the whole PNG:
the matrix maps source pixels into the rect's 0..1 object-bounding-box space,
and everything outside that unit square is cropped away by the pattern.

Run from the repo root; writes <name>.webp next to each source SVG.
"""
import base64
import io
import re
import sys
from PIL import Image, ImageDraw

MATRIX = re.compile(
    r"transform=\"matrix\(([-0-9.e]+) 0 0 ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)\)\""
)
SCALE = re.compile(r"transform=\"scale\(([-0-9.e]+)\s*([-0-9.e]+)?\)\"")
DATA = re.compile(r"base64,([A-Za-z0-9+/=]+)")
STROKE = re.compile(r"stroke=\"(#[0-9A-Fa-f]{3,8})\"")


def flatten(path: str, size: int) -> None:
    svg = open(path).read()
    raw = DATA.search(svg)
    mat = MATRIX.search(svg)
    scale = SCALE.search(svg)
    if not raw or not (mat or scale):
        sys.exit(f"{path}: not a raster-in-pattern SVG")

    if mat:
        sx, sy, tx, ty = (float(g) for g in mat.groups())
    else:
        sx = float(scale.group(1))
        sy = float(scale.group(2) or scale.group(1))
        tx = ty = 0.0
    src = Image.open(io.BytesIO(base64.b64decode(raw.group(1)))).convert("RGBA")

    # x' = sx * px + tx must land in [0, 1] to be inside the rect.
    box = (
        round(-tx / sx),
        round(-ty / sy),
        round((1 - tx) / sx),
        round((1 - ty) / sy),
    )
    out = src.crop(box).resize((size, size), Image.LANCZOS)

    # The avatar exports draw their own 1px ring on the rounded rect; the
    # bitmap alone would lose it, and the cards show these next to avatars
    # that already ship as WebP with the ring baked in.
    ring = STROKE.search(svg)
    if ring:
        w = max(1, round(size / 45))
        ImageDraw.Draw(out).ellipse(
            (w / 2, w / 2, size - w / 2 - 1, size - w / 2 - 1),
            outline=ring.group(1),
            width=w,
        )
    dest = path.rsplit(".", 1)[0] + ".webp"
    out.save(dest, "WEBP", quality=88, method=6)
    print(f"{path} -> {dest}  {out.size}  {len(open(dest,'rb').read())/1024:.1f}K")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        path, _, size = arg.partition(":")
        flatten(path, int(size or 192))
