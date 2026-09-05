#!/usr/bin/env python3
"""Generate the responsive pair for an image of each responsive image pair.

Two files per image, not a ladder: `<name>.webp` is the retina master and
`<name>-sm.webp` is the one a 1x-to-2x phone actually needs. Anything more
granular is invisible on the wire — the pair already covers the whole range
the site renders these at.

Run from the repo root. Sources are read from git HEAD where the working copy
has already been downscaled, so re-running is idempotent and never resamples
an image twice.

    python3 scripts/build-responsive-images.py <name>.webp:<master>:<small> ...
"""
import io
import os
import subprocess
import sys

# The commit whose exports are the untouched Figma masters. Resampling the
# working copy would compound the loss every time this is re-run.
REF = os.environ.get("MASTER_REF", "HEAD")
from PIL import Image


def source(path: str) -> Image.Image:
    """The largest version available: git HEAD if it is bigger, else the file."""
    disk = Image.open(path)
    try:
        blob = subprocess.check_output(["git", "show", f"{REF}:{path}"], stderr=subprocess.DEVNULL)
        head = Image.open(io.BytesIO(blob))
        return head if head.width > disk.width else disk
    except subprocess.CalledProcessError:
        return disk


def emit(im: Image.Image, path: str, width: int, quality: int) -> None:
    h = round(im.height * width / im.width)
    im.resize((width, h), Image.LANCZOS).save(path, "WEBP", quality=quality, method=6)
    print(f"  {path:52s} {width}x{h}  {os.path.getsize(path)/1024:6.1f}K")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        name, master, small = arg.split(":")
        path = f"public/images/{name}"
        im = source(path)
        # Follow the master's own mode. The case-study mockups export
        # transparent and are keyed to real alpha (Sections.tsx) — flattening
        # those to RGB puts a black plate behind every device — while the ad
        # creatives are opaque photographs that would only pay for a channel
        # nothing reads.
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
        print(name, f"(source {im.width}px)")
        emit(im, path.replace(".webp", "-sm.webp"), int(small), 78)
        emit(im, path, int(master), 82)
