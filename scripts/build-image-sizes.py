#!/usr/bin/env python3
"""Regenerate src/lib/image-sizes.json from the real files in public/images.

Img reads this to bake width/height into every <img>, so it has to describe
the bytes actually on disk: a stale entry re-introduces the layout shift the
whole table exists to prevent. Run it after anything resizes an export.
"""
import json
import os
from PIL import Image

ROOT = "public/images"
OUT = "src/lib/image-sizes.json"
EXT = (".webp", ".png", ".jpg", ".jpeg", ".avif")

# Recursive, and keyed by the path Img is given: /templates keeps its stills in
# a subdirectory, and a flat listdir silently dropped every one of them.
sizes = {}
for dirpath, _, files in os.walk(ROOT):
    for name in files:
        if not name.lower().endswith(EXT):
            continue
        full = os.path.join(dirpath, name)
        key = os.path.relpath(full, ROOT)
        with Image.open(full) as im:
            sizes[key] = {"w": im.width, "h": im.height}
sizes = dict(sorted(sizes.items()))

with open(OUT, "w") as f:
    json.dump(sizes, f, indent=2)
    f.write("\n")
print(f"{OUT}: {len(sizes)} images")
