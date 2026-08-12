#!/usr/bin/env python3
"""Make a case-study export's flat plate transparent, keeping its own edges.

Figma exports the case-study `Mask group` nodes as OPAQUE images: the device
sits on a flat plate (#1e1e1e on three, pure black on we-interiors-v2) because
the coloured gradient behind it lives on the frame, not in the mask. That is
why the cards needed a mix-blend-screen wash to get any colour — and why the
wash lit the device up along with the plate.

Keying the plate to alpha puts the gradient behind the device where it
belongs. The trap is HOW. A binary key — plate in, everything else out —
throws away the antialiasing the export already has and leaves a stair-step,
which is then unfixable by feathering, blurring, or polygon straightening
(all tried; all trade one artefact for a worse one).

The exports are not actually missing that antialiasing. Measuring the share of
boundary pixels that have a graded neighbour, part plate and part device:

    breezit 99.2%   holo 99.5%   eany 100%   we-interiors-v2 73.5%

So the edge is already there and only has to be READ rather than redrawn.
Alpha therefore comes from how far a pixel sits from the plate colour, applied
only in a narrow band around the plate so the device's interior is untouched:

    on the plate            alpha 0
    within a few px of it   alpha ramps with distance from the plate colour
    everywhere else         alpha 255

That reproduces the export's own soft edge exactly. we-interiors is the one
export with a genuinely hard outline, and it stays hard — nothing here can
invent detail that was never rendered.

Two exports need more than that, hence the flags:

  --silhouette A.webp,B.webp
                Take the outline from clean device mockups instead of from the
                export. Needed where the export has a baked DROP SHADOW: it is
                painted onto the plate at values BELOW the plate (5-6 against
                eany's 30), so no plate key removes it, and it shows over the
                gradient as a stepped black blob. It cannot be keyed by
                brightness either — the phones' own dark bottom bezels sit at
                exactly those values, so erasing the shadow punches holes in
                the devices and keeping the bezels keeps the shadow.

                The mockups know where the device ends. Each registers onto
                the export as a plain rotation + scale + translation (SIFT +
                partial affine; eany's two phones come back independently at
                scale 0.794 and 60 degrees, which is what confirms the fit),
                so their real antialiased alpha becomes the silhouette while
                every visible pixel still comes from the export. The shadow
                falls outside that silhouette and is gone by construction.

  --straighten N
                Approximate the silhouette as a polygon with tolerance N and
                re-rasterise it 4x supersampled. For we-interiors, whose
                outline has no antialiasing to read, this snaps the staircase
                back onto the straight lines it was rasterised from. N must
                EXCEED the step size or it just traces the steps: its risers
                are ~8px, so 10 works and 3 does not.

    python3 scripts/key-case-artwork.py case-holo.webp case-holo-cut.webp
    python3 scripts/key-case-artwork.py case-eany.webp case-eany-cut.webp --dark
    python3 scripts/key-case-artwork.py case-we-interiors-v2.webp \\
        case-we-interiors-cut.webp --straighten 10

Remember to add the output to src/lib/image-sizes.json — Img throws without it.
"""

import sys
from collections import Counter, deque

import cv2
import numpy as np
from PIL import Image

TOL = 5  # what counts as "the plate itself"
BAND = 3  # px around the plate where alpha is read rather than assumed
RAMP = 28  # distance from plate colour at which a pixel is fully opaque
SUPERSAMPLE = 4  # --straighten only: the antialiasing that export lacks
INSET = 1  # --straighten only: px pulled inside the original silhouette
BLEED = 6  # --straighten only: px of device colour pushed out under the edge


def detect_plate(px, w, h):
    """Most common colour around the frame edge.

    Not hardcoded: three exports use #1e1e1e, we-interiors-v2 is pure black.
    """
    edge = Counter()
    for x in range(w):
        edge[px[x, 0]] += 1
        edge[px[x, h - 1]] += 1
    for y in range(h):
        edge[px[0, y]] += 1
        edge[px[w - 1, y]] += 1
    return edge.most_common(1)[0][0]


def plate_region(px, w, h, plate, include_darker=False):
    """Flood the plate inward from the frame.

    Flood fill rather than a global colour key, so the device's own dark
    bezel and any dark artwork inside its screen survive — neither is
    connected to the border.
    """

    def is_plate(p):
        if include_darker:
            return all(p[i] <= plate[i] + TOL for i in range(3))
        return all(abs(p[i] - plate[i]) <= TOL for i in range(3))

    seen = np.zeros((h, w), bool)
    q = deque()

    def push(x, y):
        if not seen[y, x] and is_plate(px[x, y]):
            seen[y, x] = True
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                push(nx, ny)
    return seen


def straighten(on_plate, im, w, h, eps):
    """Rebuild the alpha from straight lines, for outlines with no AA to read.

    Also bleeds device colour outward first: the straightened edge necessarily
    runs outside the staircase in places, and the only colour there is plate,
    which would ring the device in a dark fringe. The result is then inset a
    couple of px so the visible edge lands on real device pixels rather than
    on bled ones — without that, the bleed reproduces the staircase as a grey
    stepped band just inside the new edge.
    """
    solid = (~on_plate).astype(np.uint8)
    contours, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    kept = [c for c in contours if cv2.contourArea(c) >= 500]

    big = np.zeros((h * SUPERSAMPLE, w * SUPERSAMPLE), np.uint8)
    verts = 0
    for c in kept:
        poly = cv2.approxPolyDP(c, eps, True)
        verts += len(poly)
        cv2.fillPoly(big, [(poly * SUPERSAMPLE).astype(np.int32)], 255)
    k = 2 * INSET * SUPERSAMPLE + 1
    big = cv2.erode(big, np.ones((k, k), np.uint8))
    alpha = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(float)

    bled = im.copy()
    bp = bled.load()
    unfilled = on_plate.copy()
    front = [(x, y) for y in range(h) for x in range(w) if not on_plate[y, x]]
    for _ in range(BLEED):
        nxt = []
        for x, y in front:
            for dx, dy in (
                (1, 0), (-1, 0), (0, 1), (0, -1),
                (1, 1), (1, -1), (-1, 1), (-1, -1),
            ):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and unfilled[ny, nx]:
                    unfilled[ny, nx] = False
                    bp[nx, ny] = bp[x, y]
                    nxt.append((nx, ny))
        front = nxt
    return alpha, bled, verts


def solid_alpha(mock):
    """A mockup's alpha with its screen hole filled — the device's outline."""
    a = mock[:, :, 3].copy()
    transparent = (a < 8).astype(np.uint8)
    outside = transparent.copy()
    h, w = a.shape
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for seed in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if outside[seed[1], seed[0]]:
            cv2.floodFill(outside, mask, seed, 2)
    a[(transparent == 1) & (outside != 2)] = 255
    return a.astype(np.float32)


def mockup_silhouette(mockups, im, plate, w, h):
    """Alpha from clean mockups registered onto the export.

    The export tells us the colours; the mockups tell us where the device
    ends. Registration is a partial affine — rotation, uniform scale and
    translation — because the export placed these very images.
    """
    export = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
    sift = cv2.SIFT_create(nfeatures=12000)
    ke, de = sift.detectAndCompute(export, None)

    alpha = np.zeros((h, w), np.float32)
    for name in mockups:
        mock = cv2.imread(f"public/images/{name}", cv2.IMREAD_UNCHANGED)
        mock = cv2.cvtColor(mock, cv2.COLOR_BGRA2RGBA)
        a = mock[:, :, 3:4].astype(np.float32) / 255
        flat = (mock[:, :, :3] * a + np.array(plate, np.uint8) * (1 - a)).astype(np.uint8)

        km, dm = sift.detectAndCompute(cv2.cvtColor(flat, cv2.COLOR_RGB2GRAY), None)
        pairs = cv2.BFMatcher().knnMatch(dm, de, k=2)
        good = [p for p, q in pairs if p.distance < 0.75 * q.distance]
        src = np.float32([km[g.queryIdx].pt for g in good]).reshape(-1, 1, 2)
        dst = np.float32([ke[g.trainIdx].pt for g in good]).reshape(-1, 1, 2)
        M, inl = cv2.estimateAffinePartial2D(
            src, dst, method=cv2.RANSAC, ransacReprojThreshold=3.0, maxIters=20000
        )
        if M is None or inl.sum() < 6:
            raise SystemExit(f"{name}: did not register onto the export")
        scale = float(np.hypot(M[0, 0], M[1, 0]))
        angle = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
        placed = cv2.warpAffine(
            solid_alpha(mock), M, (w, h), flags=cv2.INTER_LANCZOS4,
            borderMode=cv2.BORDER_CONSTANT, borderValue=0,
        )
        alpha = np.maximum(alpha, np.clip(placed, 0, 255))
        print(f"    {name}: scale {scale:.3f}, {angle:.1f}deg, {int(inl.sum())} inliers")
    return alpha


def bleed_outward(im, keep, w, h, steps=6):
    """Push device colour into the plate so soft edges never sample it."""
    out = im.copy()
    op = out.load()
    unfilled = ~keep
    front = [(x, y) for y in range(h) for x in range(w) if keep[y, x]]
    for _ in range(steps):
        nxt = []
        for x, y in front:
            for dx, dy in (
                (1, 0), (-1, 0), (0, 1), (0, -1),
                (1, 1), (1, -1), (-1, 1), (-1, -1),
            ):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and unfilled[ny, nx]:
                    unfilled[ny, nx] = False
                    op[nx, ny] = op[x, y]
                    nxt.append((nx, ny))
        front = nxt
    return out


def key_plate(
    src_path: str, dst_path: str, dark=False, straighten_eps=None, mockups=None
) -> None:
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    rgb = np.asarray(im).astype(np.int16)

    plate = detect_plate(im.load(), w, h)
    on_plate = plate_region(im.load(), w, h, plate, dark)

    if mockups:
        alpha = mockup_silhouette(mockups, im, plate, w, h)
        bled = bleed_outward(im, alpha > 200, w, h)
        out = bled.convert("RGBA")
        out.putalpha(Image.fromarray(alpha.astype(np.uint8)))
        out.save(dst_path, "WEBP", quality=92, method=6)
        print(
            f"{dst_path.split('/')[-1]}: plate {plate}, {w}x{h},"
            f" outline from {len(mockups)} mockup(s),"
            f" {(alpha < 8).mean():.0%} transparent"
        )
        return

    if straighten_eps is not None:
        alpha, im, verts = straighten(on_plate, im, w, h, straighten_eps)
        out = im.convert("RGBA")
        out.putalpha(Image.fromarray(alpha.astype(np.uint8)))
        out.save(dst_path, "WEBP", quality=92, method=6)
        print(
            f"{dst_path.split('/')[-1]}: plate {plate}, {w}x{h},"
            f" {on_plate.mean():.0%} transparent,"
            f" outline straightened to {verts} vertices"
        )
        return

    # How far is each pixel from the plate colour?
    distance = np.abs(rgb - np.array(plate, np.int16)).max(axis=2)
    ramped = np.clip(distance * (255.0 / RAMP), 0, 255)

    # Widen the plate by BAND px; inside that band alpha is read from the
    # pixels, which is where the export keeps its antialiasing.
    band = on_plate.copy()
    for _ in range(BAND):
        grown = band.copy()
        grown[1:, :] |= band[:-1, :]
        grown[:-1, :] |= band[1:, :]
        grown[:, 1:] |= band[:, :-1]
        grown[:, :-1] |= band[:, 1:]
        band = grown

    alpha = np.full((h, w), 255.0)
    alpha[band] = ramped[band]
    alpha[on_plate] = 0.0

    out = im.convert("RGBA")
    out.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    out.save(dst_path, "WEBP", quality=92, method=6)

    soft = int(((alpha > 0) & (alpha < 255)).sum())
    print(
        f"{dst_path.split('/')[-1]}: plate {plate}, {w}x{h},"
        f" {on_plate.mean():.0%} transparent, {soft} px of soft edge"
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    dark = "--dark" in args
    if dark:
        args.remove("--dark")
    mockups = None
    if "--silhouette" in args:
        i = args.index("--silhouette")
        mockups = args[i + 1].split(",")
        del args[i : i + 2]
    eps = None
    if "--straighten" in args:
        i = args.index("--straighten")
        eps = float(args[i + 1])
        del args[i : i + 2]
    if len(args) != 2:
        sys.exit(__doc__)
    key_plate(f"public/images/{args[0]}", f"public/images/{args[1]}", dark, eps, mockups)
