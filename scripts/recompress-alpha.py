#!/usr/bin/env python3
"""Re-encode a WebP whose weight is all in its alpha channel.

The hero's lighting exports are a near-black RGB plane carrying a vignette in
alpha. Pillow writes alpha LOSSLESSLY by default, so hero-light-mobile.webp
was 175 KB of which the colour was 4.5 KB — the other 170 KB was a lossless
gradient. It is also a `background-image` on an element in the first viewport,
so the browser fetches it at high priority, ahead of everything the hero's own
headline is waiting on.

alpha_quality=80 is the setting, and it is not a judgement call: measured
against the original channel the largest error anywhere in the image is ONE
level out of 255, with an RMS of 0.6. That matters here because the note in
globals.css is right that this layer is where banding would show — its
plateaus are ~1 level apart. Going further is where it starts to cost: 70
drops the file to 18 KB but moves pixels by up to 10 levels.

Prints the error so the claim can be re-checked rather than trusted.
"""
import io
import math
import os
import sys
from PIL import Image, ImageChops

ALPHA_QUALITY = 80
QUALITY = 90


def recompress(path: str) -> None:
    src = Image.open(path).convert("RGBA")
    before = os.path.getsize(path)

    buf = io.BytesIO()
    src.save(buf, "WEBP", quality=QUALITY, method=6, alpha_quality=ALPHA_QUALITY)

    out = Image.open(io.BytesIO(buf.getvalue())).convert("RGBA")
    diff = ImageChops.difference(src.getchannel("A"), out.getchannel("A"))
    hist = diff.histogram()
    rms = math.sqrt(sum(i * i * c for i, c in enumerate(hist)) / sum(hist))

    open(path, "wb").write(buf.getvalue())
    print(
        f"{path}: {before/1024:.0f}K -> {len(buf.getvalue())/1024:.0f}K  "
        f"alpha rms {rms:.2f}, max {diff.getextrema()[1]}"
    )


if __name__ == "__main__":
    for p in sys.argv[1:]:
        recompress(p)
