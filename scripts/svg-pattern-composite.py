#!/usr/bin/env python3
"""Flatten a multi-rect Figma raster-in-SVG export into one lossless WebP.

svg-raster-to-webp.py handles the single-<pattern> case (badges, avatars). The
competitor logos are the same trick with MORE THAN ONE rect: CreativeOS is one
1916x316 PNG sliced into an icon rect and a wordmark rect, each with its own
<use> matrix, laid over an optional white rounded pill. Chrome rasterises each
pattern at the rect's CSS size and draws it soft, and the lossy 3x flatten that
replaced it on the phone showed ringing round the letters at 3x DPR.

This reproduces the SVG's composition — every <rect>, in document order, either
as a solid fill or as the crop of the bitmap its pattern's matrix selects — at
an integer SCALE of the SVG's own canvas, and writes it LOSSLESS. The source
bitmap is the ceiling on quality; nothing here resamples it more than once.

    python3 scripts/svg-pattern-composite.py in.svg out.webp 4
"""
import base64
import io
import re
import sys

from PIL import Image, ImageDraw

RECT = re.compile(r"<rect\b([^>]*)/>")
ATTR = re.compile(r'([\w:-]+)="([^"]*)"')
PATTERN = re.compile(
    r'<pattern id="([^"]+)"[^>]*>\s*<use [^>]*transform="matrix\(([-0-9.e]+) 0 0 ([-0-9.e]+) ([-0-9.e]+) ([-0-9.e]+)\)"'
)
DATA = re.compile(r"base64,([A-Za-z0-9+/=]+)")


def main(src: str, dest: str, scale: int) -> None:
    svg = open(src).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    W, H = round(vb[2] * scale), round(vb[3] * scale)
    bitmap = Image.open(io.BytesIO(base64.b64decode(DATA.search(svg).group(1)))).convert("RGBA")
    patterns = {m.group(1): tuple(float(g) for g in m.groups()[1:]) for m in PATTERN.finditer(svg)}

    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for m in RECT.finditer(svg):
        a = dict(ATTR.findall(m.group(1)))
        x, y = float(a.get("x", 0)) * scale, float(a.get("y", 0)) * scale
        w, h = float(a["width"]) * scale, float(a["height"]) * scale
        fill = a.get("fill", "")
        ref = re.match(r"url\(#(.+)\)", fill)
        if ref:
            sx, sy, tx, ty = patterns[ref.group(1)]
            box = (-tx / sx, -ty / sy, (1 - tx) / sx, (1 - ty) / sy)
            # Crop in the bitmap's own pixels, then ONE resample to the rect.
            crop = bitmap.crop(tuple(round(v) for v in box))
            tile = crop.resize((round(w), round(h)), Image.LANCZOS)
            out.alpha_composite(tile, (round(x), round(y)))
        else:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(layer).rounded_rectangle(
                (x, y, x + w, y + h), radius=float(a.get("rx", 0)) * scale, fill=fill
            )
            out.alpha_composite(layer)

    out.save(dest, "WEBP", lossless=True, quality=100, method=6)
    print(f"{src} -> {dest}  {out.size}  {len(open(dest, 'rb').read()) / 1024:.1f}K")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4)
