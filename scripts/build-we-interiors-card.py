#!/usr/bin/env python3
"""Build the we-interiors card artwork from the clean laptop mockup.

we-interiors is the one case study that cannot be keyed out of its Figma
export: alone among the four, its outline was rasterised with no antialiasing
(73% of boundary pixels are a hard step, against 99-100% on the others), so
cutting it out always leaves a saw edge along the lid.

It does not need keying, because a clean mockup of the same laptop exists —
supplied by Žilvinas, with real alpha and a transparent screen. Its device
bounding box is within a few px of the export's (x 79-679 / y 72-673 against
x 72-679 / y 72-679), i.e. the SAME laptop at the SAME scale, so it drops
straight in at 1:1 with no repositioning and the card keeps its composition.

All this does is map the flat we-interiors page into that transparent screen.

    python3 scripts/build-we-interiors-card.py

Writes public/images/case-we-interiors-macbook.webp.
"""

import cv2
import numpy as np
from PIL import Image

# Žilvinas's clean render, copied into the repo so this is reproducible.
# NOT 12-macbook-pro-mockup-space-black1.webp, which is a different render at
# a different angle and does not match the export.
MOCKUP = "public/images/macbook-clean.webp"
PAGE = "public/images/rectangle161125747.webp"
OUT = "public/images/case-we-interiors-macbook.webp"
SIZE = 680  # match the export's canvas so the card is unchanged

# The mockup canvas is 680x674 — six px shorter than the card — and its device
# runs to the right edge already. So it is dropped six px DOWN and not moved
# sideways at all, which puts the laptop hard against both the bottom and the
# right the way the export had it. An earlier version shifted it 7px left to
# match bounding boxes and that is exactly what opened a gap down each of
# those two edges.
OFFSET = (0, 6)

# The camera notch hangs into the top of the screen, so a page mapped to the
# full screen rectangle has its header swallowed by it — "we interiors" was
# hidden. The page is padded at the top (replicating its own first row, which
# is flat header background) to push the content clear of the notch.
NOTCH_CLEARANCE = 70  # page px


def screen_quad(rgba):
    """Corners of the mockup's transparent screen — the hole not connected
    to the border."""
    h, w = rgba.shape[:2]
    transparent = (rgba[:, :, 3] < 8).astype(np.uint8)
    outside = transparent.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for seed in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if outside[seed[1], seed[0]]:
            cv2.floodFill(outside, mask, seed, 2)
    hole = ((transparent == 1) & (outside != 2)).astype(np.uint8)

    contours, _ = cv2.findContours(hole, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    biggest = max(contours, key=cv2.contourArea).reshape(-1, 2).astype(np.float32)

    peri = cv2.arcLength(biggest.reshape(-1, 1, 2), True)
    rough = None
    for eps in np.arange(0.005, 0.15, 0.005):
        approx = cv2.approxPolyDP(biggest.reshape(-1, 1, 2), eps * peri, True)
        if len(approx) == 4:
            rough = approx.reshape(4, 2).astype(np.float32)
            break
    if rough is None:
        raise SystemExit("could not reduce the screen to four corners")

    # approxPolyDP lands its corners ON the screen's rounded arcs, so the quad
    # is inset from the real rectangle and covers only ~96% of the hole. The
    # missing slivers are exactly the gap that shows along the screen edges.
    # Recover the true corners instead: fit a line to each SIDE using only the
    # contour points near its middle — away from the arcs — then intersect
    # neighbouring sides.
    lines = []
    for i in range(4):
        a, b = rough[i], rough[(i + 1) % 4]
        along = b - a
        length = np.linalg.norm(along)
        along = along / length
        rel = biggest - a
        t = rel @ along
        perp = np.abs(rel[:, 0] * -along[1] + rel[:, 1] * along[0])
        near = (t > 0.15 * length) & (t < 0.85 * length) & (perp < 6)
        pts = biggest[near]
        if len(pts) < 10:
            pts = np.array([a, b], np.float32)
        vx, vy, x0, y0 = cv2.fitLine(pts, cv2.DIST_L2, 0, 0.01, 0.01).ravel()
        lines.append((float(vx), float(vy), float(x0), float(y0)))

    corners = []
    for i in range(4):
        vx1, vy1, x1, y1 = lines[i - 1]
        vx2, vy2, x2, y2 = lines[i]
        det = vx1 * (-vy2) - (-vy1) * vx2
        if abs(det) < 1e-9:
            corners.append(rough[i])
            continue
        dx, dy = x2 - x1, y2 - y1
        s = (vx2 * dy - vy2 * dx) / det
        corners.append([x1 + vx1 * s, y1 + vy1 * s])
    # Push the corners a hair outward so the page overfills and the hole mask
    # does the shaping. Without this the screen's rounded arcs stay uncovered
    # and show as nicks of background along the edges.
    quad = np.array(corners, np.float32)
    centre = quad.mean(axis=0)
    quad = centre + (quad - centre) * 1.02
    return quad, hole


def order_landscape(pts):
    """Order a landscape screen's corners tl, tr, br, bl.

    Landscape, so the LONG pair of opposite edges is top and bottom — the
    opposite of a phone, where the short pair is.
    """
    centre = pts.mean(axis=0)
    cyc = pts[np.argsort(np.arctan2(pts[:, 1] - centre[1], pts[:, 0] - centre[0]))]
    edge = [np.linalg.norm(cyc[(i + 1) % 4] - cyc[i]) for i in range(4)]
    start = 0 if edge[0] + edge[2] > edge[1] + edge[3] else 1
    top = min(
        [start, start + 2],
        key=lambda i: (cyc[i % 4][1] + cyc[(i + 1) % 4][1]) / 2,
    )
    a, b = cyc[top % 4], cyc[(top + 1) % 4]
    # Walk the cycle for the far corners; picking them by distance from tr is
    # wrong on a sheared quad, where the diagonal is shorter than the side.
    if a[0] <= b[0]:
        return np.array(
            [a, b, cyc[(top + 2) % 4], cyc[(top + 3) % 4]], dtype=np.float32
        )
    return np.array(
        [b, a, cyc[(top - 1) % 4], cyc[(top - 2) % 4]], dtype=np.float32
    )


def main():
    mock = np.asarray(Image.open(MOCKUP).convert("RGBA"))
    mh, mw = mock.shape[:2]
    quad, hole = screen_quad(mock)
    quad = order_landscape(quad)

    page = cv2.cvtColor(cv2.imread(PAGE, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGBA)
    page = cv2.copyMakeBorder(
        page, NOTCH_CLEARANCE, 0, 0, 0, cv2.BORDER_REPLICATE
    )
    ph, pw = page.shape[:2]

    # Crop the page to the screen's own aspect instead of stretching it in.
    top = np.linalg.norm(quad[1] - quad[0])
    side = np.linalg.norm(quad[3] - quad[0])
    keep = min(ph, int(pw * side / top))
    page = page[:keep]

    src = np.float32([[0, 0], [pw, 0], [pw, keep], [0, keep]])
    screen = cv2.warpPerspective(
        page,
        cv2.getPerspectiveTransform(src, quad),
        (mw, mh),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )
    # Clip to the hole so the page never spills past the bezel.
    screen[:, :, 3] = (screen[:, :, 3] * hole).astype(np.uint8)

    layer = Image.new("RGBA", (mw, mh), (0, 0, 0, 0))
    layer.alpha_composite(Image.fromarray(screen))
    layer.alpha_composite(Image.fromarray(mock))

    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(layer, dest=(max(0, OFFSET[0]), max(0, OFFSET[1])),
                           source=(max(0, -OFFSET[0]), max(0, -OFFSET[1])))
    canvas.save(OUT, "WEBP", quality=92, method=6)
    print(f"{OUT.split('/')[-1]}: {SIZE}x{SIZE}, clean laptop, page {pw}x{keep} in screen")


if __name__ == "__main__":
    main()
