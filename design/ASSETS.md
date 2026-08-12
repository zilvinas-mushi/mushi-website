# Asset inventory

92 assets exported from Figma frame `Desktop Home` (node `3843:28`) on 2026-07-28,
then optimized. All live in `public/images/`.

**Figma asset URLs expire ~7 days after export.** These files are the durable copy —
re-exporting costs Figma MCP calls, and the budget is 6/month. Do not delete them.

## `hero-light.webp` — hand-exported 2026-08-12, not part of the 92

The hero's entire lighting group: the top-left source, the diagonal shafts, the
vignette and the centre pool, in one RGBA image. Exported from the Figma UI (no
MCP call spent) with the tile layer hidden. Used by `.hero-light`.

This is the export the first attempt lacked. `effects-layer.webp` is the same
group flattened *with* the tiles, which is why it came back a featureless purple
blur with no rays in it — a note in `globals.css` blamed the technique when the
asset was the problem. If you need to redo this: **hide the tiles, export the
light alone, and export at 4x.**

- Source `~/Documents/Tiles background.png` at 4x, 10080 x 7124. The frame is the
  inner **7680 x 4320 at offset (1200, 1200)**; everything outside that is the
  group's blur bounds — a noise staircase and offset rounded-rect ghosts. Crop
  it off. (A 1x export of the same group put the frame at 1920x1080 offset
  300,300 — the bleed scales with the export.)
- Shipped at **1920 x 1080, q90, 260 KB**, Lanczos from the 4x crop. The 16:1
  downsample averages away the export's dither and is why this is clean where
  the first pass was not.
- **Do not shrink it on the strength of an error metric.** A 768px version
  measured identically — error is genuinely flat from 1920 down to 384 because
  the layer is pure blur — and looked bad in use, because the metric was
  computed at 1920 while a retina display stretches this across ~4000 device
  pixels. Banding is not the constraint either: steps between plateaus are ~1
  level, max 2.
- Corners are opaque black and the centre is alpha 37 — the vignette and the
  tile show-through are both baked in. Composite it normally, no blend mode.
- **The centre light is already in it.** Figma keeps that ellipse as a separate
  layer (`~/Documents/Center light.png`) but it is composited into this export;
  adding it on top too washes the middle out to lavender. If it is ever wanted
  alone it is a plain CSS gradient — a farthest-side ellipse centred in the
  frame, solid `#2D1940` to r=10.5% then linear to zero at the edge, which
  rebuilds the PNG to within 1.8/255 at its worst pixel. Not worth shipping.
- **It goes behind HeroPanels and HeroFloaters.** Figma stacks the lighting
  group above them and that version was built — it does read better for depth —
  but the dark corners swallowed the platform marks and the ad panels, which are
  the things the hero exists to show. Putting it back on top needs a mask with
  holes cut for those elements, not a flat z-bump.

The tiles stay in CSS and must not become a raster: their 215px pitch is fixed
regardless of viewport, and `background-position: center 171.5px` is what lands
`.cta-tile` on a column instead of a gutter. See `.hero-grid`.

## `hero-light-mobile.webp` — hand-exported 2026-08-12

The phone frame's lighting group, same idea as the desktop file. Used by
`.hero-light` inside `@media (max-width: 767px)`. The desktop image cannot be
reused: it is a 16:9 frame, and stretched into a tall hero its vignette closes
in from the sides and chokes the copy.

- Source `~/Documents/Mobile lightning.png`, 1724 x 3608. **The frame is only
  the left 1500 x 3608** (= 375 x 902 at 4x); the right 224px is transparent
  spill. Find the edge from the ALPHA profile, not brightness: alpha is a clean
  U centred on x=750 and falls off a cliff at x=1499.
- That spill contains loud magenta/blue speckle, which looks alarming in a
  viewer but is **entirely in pixels with alpha 0** — 194 stray magenta pixels
  land inside the crop and every one is invisible. Nothing to repair. Do zero
  the RGB of fully-transparent pixels before encoding, so lossy WebP cannot
  bleed that garbage inward as a halo.
- Shipped at **640 x 1539, 175 KB**, q88 with a 1.2px pre-blur. Heavier per
  pixel than the desktop file because the phone export carries visible grain,
  which is exactly what lossy WebP cannot compress.
- Error is flat from 750px down to 432px. **540px halves the weight for no
  measurable loss** if mobile bytes ever matter more than the safety margin.

## Largest images

These dominate page weight — lazy-load any that sit below the fold, and give every
`<img>` explicit `width`/`height` (next/image optimization is off).

| file | KB |
| --- | --- |
| `rectangle161125111.webp` | 855.6 |
| `deividas-kovger2.webp` | 169.1 |
| `rectangle161125747.webp` | 168.3 |
| `rectangle161125765.webp` | 60.8 |
| `untitled2.webp` | 58.3 |
| `rectangle161125751.webp` | 56.5 |
| `rectangle161125764.webp` | 55.3 |
| `iphone21.webp` | 51.7 |
| `juste-semetaite1.webp` | 51.0 |
| `image239.webp` | 48.4 |
| `iphone11.webp` | 43.5 |
| `screenshot202604071536181.webp` | 41.8 |
| `image141.webp` | 37.9 |
| `12-macbook-pro-mockup-space-black1.webp` | 36.1 |
| `image139.webp` | 31.9 |

## Naming

Figma layer names were machine-generated (`imgRectangle161125747`), so filenames are
kebab-cased versions of those. They are **not** semantic. `design/assets.json` maps
each file back to its original Figma layer name for traceability.

As sections get built, rename files to something meaningful and update
`design/assets.json` in the same commit.

## Full list

| file | type | KB | Figma layer |
| --- | --- | --- | --- |
| `06-macbook-pro-mockup-space-black2.webp` | webp | 24.1 | `img06MacbookProMockupSpaceBlack2` |
| `12-macbook-pro-mockup-space-black1.webp` | webp | 36.1 | `img12MacbookProMockupSpaceBlack1` |
| `3-dapp-icon-mockup-qobrand1.webp` | webp | 19.7 | `img3DAppIconMockupQobrand1` |
| `3-dapp-icon-mockup-qobrand2.webp` | webp | 16.9 | `img3DAppIconMockupQobrand2` |
| `3-dapp-icon-mockup-qobrand3.webp` | webp | 19.3 | `img3DAppIconMockupQobrand3` |
| `akvile-zelnyte1.webp` | webp | 26.0 | `imgAkvileZelnyte1` |
| `deividas-kovger1.svg` | svg | 0.2 | `imgDeividasKovger1` |
| `deividas-kovger2.webp` | webp | 169.1 | `imgDeividasKovger2` |
| `ellipse192.svg` | svg | 0.2 | `imgEllipse192` |
| `ellipse198.svg` | svg | 0.2 | `imgEllipse198` |
| `ellipse2.svg` | svg | 0.2 | `imgEllipse2` |
| `ellipse201.svg` | svg | 0.2 | `imgEllipse201` |
| `ellipse3.svg` | svg | 0.2 | `imgEllipse3` |
| `ellipse54.svg` | svg | 0.2 | `imgEllipse54` |
| `erika-zakareviciute1.webp` | webp | 20.9 | `imgErikaZakareviciute1` |
| `group.svg` | svg | 6.7 | `imgGroup` |
| `group1.svg` | svg | 0.3 | `imgGroup1` |
| `group156.svg` | svg | 1.0 | `imgGroup156` |
| `group1707479581.svg` | svg | 1.0 | `imgGroup1707479581` |
| `group1707479587.svg` | svg | 7.9 | `imgGroup1707479587` |
| `group1707479591.svg` | svg | 6.6 | `imgGroup1707479591` |
| `group1707479592.svg` | svg | 8.7 | `imgGroup1707479592` |
| `group2.svg` | svg | 3.4 | `imgGroup2` |
| `hana-skomra-budre1.webp` | webp | 16.5 | `imgHanaSkomraBudre1` |
| `icon.svg` | svg | 0.3 | `imgIcon` |
| `icon1.svg` | svg | 0.3 | `imgIcon1` |
| `icon2.svg` | svg | 0.3 | `imgIcon2` |
| `icon3.svg` | svg | 0.3 | `imgIcon3` |
| `icon4.svg` | svg | 0.4 | `imgIcon4` |
| `image139.webp` | webp | 31.9 | `imgImage139` |
| `image140.webp` | webp | 9.3 | `imgImage140` |
| `image141.webp` | webp | 37.9 | `imgImage141` |
| `image143.webp` | webp | 28.8 | `imgImage143` |
| `image154.svg` | svg | 0.2 | `imgImage154` |
| `image155.webp` | webp | 6.9 | `imgImage155` |
| `image239.webp` | webp | 48.4 | `imgImage239` |
| `image240.svg` | svg | 2.1 | `imgImage240` |
| `image271.webp` | webp | 3.6 | `imgImage271` |
| `image272.webp` | webp | 5.1 | `imgImage272` |
| `image274.webp` | webp | 1.6 | `imgImage274` |
| `image276.webp` | webp | 7.5 | `imgImage276` |
| `image29.webp` | webp | 5.4 | `imgImage29` |
| `image293.webp` | webp | 20.9 | `imgImage293` |
| `image42.webp` | webp | 16.5 | `imgImage42` |
| `image43.webp` | webp | 27.5 | `imgImage43` |
| `image44.webp` | webp | 25.0 | `imgImage44` |
| `image45.webp` | webp | 8.1 | `imgImage45` |
| `iphone11.webp` | webp | 43.5 | `imgIphone11` |
| `iphone21.webp` | webp | 51.7 | `imgIphone21` |
| `iphone-front1.webp` | webp | 27.8 | `imgIphoneFront1` |
| `juste-semetaite1.webp` | webp | 51.0 | `imgJusteSemetaite1` |
| `line11.svg` | svg | 0.2 | `imgLine11` |
| `line20.svg` | svg | 0.2 | `imgLine20` |
| `line213.svg` | svg | 0.3 | `imgLine213` |
| `line214.svg` | svg | 0.3 | `imgLine214` |
| `line215.svg` | svg | 0.3 | `imgLine215` |
| `line218.svg` | svg | 0.5 | `imgLine218` |
| `line234.svg` | svg | 0.2 | `imgLine234` |
| `logo-without-bg-white102.webp` | webp | 4.2 | `imgLogoWithoutBgWhite102` |
| `mask-group.svg` | svg | 18.8 | `imgMaskGroup` |
| `rectangle157.svg` | svg | 0.2 | `imgRectangle157` |
| `rectangle161.svg` | svg | 0.2 | `imgRectangle161` |
| `rectangle161124919.webp` | webp | 1.2 | `imgRectangle161124919` |
| `rectangle161124920.webp` | webp | 1.0 | `imgRectangle161124920` |
| `rectangle161124921.webp` | webp | 1.1 | `imgRectangle161124921` |
| `rectangle161124922.webp` | webp | 0.6 | `imgRectangle161124922` |
| `rectangle161125111.webp` | webp | 855.6 | `imgRectangle161125111` |
| `rectangle161125184.svg` | svg | 0.2 | `imgRectangle161125184` |
| `rectangle161125186.webp` | webp | 3.5 | `imgRectangle161125186` |
| `rectangle161125192.webp` | webp | 3.8 | `imgRectangle161125192` |
| `rectangle161125747.webp` | webp | 168.3 | `imgRectangle161125747` |
| `rectangle161125751.webp` | webp | 56.5 | `imgRectangle161125751` |
| `rectangle161125752.webp` | webp | 2.7 | `imgRectangle161125752` |
| `rectangle161125753.webp` | webp | 5.8 | `imgRectangle161125753` |
| `rectangle161125754.webp` | webp | 4.5 | `imgRectangle161125754` |
| `rectangle161125763.svg` | svg | 0.4 | `imgRectangle161125763` |
| `rectangle161125764.webp` | webp | 55.3 | `imgRectangle161125764` |
| `rectangle161125765.webp` | webp | 60.8 | `imgRectangle161125765` |
| `rectangle161126030.svg` | svg | 0.5 | `imgRectangle161126030` |
| `rectangle482.svg` | svg | 0.5 | `imgRectangle482` |
| `screenshot202604071536181.webp` | webp | 41.8 | `imgScreenshot202604071536181` |
| `star-x2.svg` | svg | 0.4 | `imgStarX2` |
| `star-x3.svg` | svg | 0.4 | `imgStarX3` |
| `star-x4.svg` | svg | 0.4 | `imgStarX4` |
| `star-x5.svg` | svg | 0.4 | `imgStarX5` |
| `star-x6.svg` | svg | 0.4 | `imgStarX6` |
| `star-x7.svg` | svg | 0.4 | `imgStarX7` |
| `untitled2.webp` | webp | 58.3 | `imgUntitled2` |
| `vector.svg` | svg | 4.8 | `imgVector` |
| `vector1.svg` | svg | 2.5 | `imgVector1` |
| `vector2.svg` | svg | 2.5 | `imgVector2` |
| `vector4.svg` | svg | 2.5 | `imgVector4` |
