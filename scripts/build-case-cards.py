#!/usr/bin/env python3
"""Rebuild the case-study card artwork from Žilvinas's clean device renders.

Supersedes the keyed artwork for eany, holo and breezit. Those were cut out of
1000px Figma exports (scripts/key-case-artwork.py) driving a 650px slot — 1.5x,
i.e. soft at dpr 2 and mush at dpr 3. The screen copy on the devices is exactly
the detail that suffered.

The replacements are not loose mockups to be arranged by eye. Each is a crop of
its card's own 2720-square canvas, which registration against the old artwork
confirms rather than assumes: every piece comes back at scale 0.3676
(= 1000/2720) and rotation 0.00 degrees, i.e. pure translation at native size.
Backing the measured offsets out through the crops gives the PLACEMENT table
below, and framing is unchanged from the artwork it replaces.

Shadows are KEPT. The old exports had a drop shadow painted onto their opaque
plate at values darker than the plate, which is why keying could not remove it
and why the silhouette route (--silhouette) threw it away along with the plate.
These renders carry the shadow in real alpha instead, so it composites over the
card's gradient the way Figma shows it — and the contact shadow between the two
devices is what keeps them reading as one stacked group rather than two cutouts.

    python3 scripts/build-case-cards.py [eany|holo|breezit ...]

Remember to add outputs to src/lib/image-sizes.json — Img throws without them.
"""

import os
import sys

from PIL import Image

CANVAS = 2720  # the card canvas every render was cropped from
OUT_SIZE = 1950  # 650px slot at dpr 3, matching case-we-interiors-v4
QUALITY = 90

HOME = os.path.expanduser("~")

# name -> (output, [(source, x, y), ...] back to front)
PLACEMENT = {
    "eany": (
        "case-eany-v2.webp",
        [
            (f"{HOME}/Documents/eany io 2.png", 408, 0),  # hero view, behind
            (f"{HOME}/Documents/eany io 1.png", 0, 352),  # catalogue, in front
        ],
    ),
    "holo": (
        "case-holo-v2.webp",
        [
            (f"{HOME}/Documents/halo 2.png", 0, 240),  # workspace laptop, behind
            (f"{HOME}/Documents/Halo 1.png", 125, 816),  # phone, in front
        ],
    ),
    # One render, already the whole 2720 canvas — nothing to arrange.
    "breezit": ("case-breezit-v2.webp", [(f"{HOME}/Documents/breezit.png", 0, 0)]),
}


def build(name: str) -> None:
    out, layers = PLACEMENT[name]
    card = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    for path, x, y in layers:
        card.alpha_composite(Image.open(path).convert("RGBA"), (x, y))

    card = card.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    dest = f"public/images/{out}"
    card.save(dest, "WEBP", quality=QUALITY, method=6, exact=True)
    print(f"{dest}  {OUT_SIZE}x{OUT_SIZE}  {os.path.getsize(dest) / 1024:.0f} KB")


def main(argv: list[str]) -> int:
    for name in argv or PLACEMENT:
        build(name)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
