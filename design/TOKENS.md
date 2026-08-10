# Design tokens — mushi.agency

Extracted from Figma file `cHPZeWJ00RoH44yy1AkW9P`, frame `Desktop Home`
(node `3843:28`, 1921 × 7426), on 2026-07-28.

> **Read this before writing styles.** These are the real measured values from
> the design, not guesses. The Figma source is a flat, absolutely-positioned
> mockup (336 absolute elements, 0 semantic tags), so it cannot be transcribed
> directly — it is a *visual reference*. Structure is hand-built; these tokens
> are what keep the hand-built version faithful.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `--surface` | `#222222` | Dominant card / panel background (most used) |
| `--bg` | `#181818` | Page background |
| `--bg-alt` | `#191919` | Secondary background band |
| `--accent-purple` | `#6E54B5` | Primary CTA ("Book a Call", buttons) |
| `--accent-sage` | `#6A806A` | Secondary accent / tags |
| `--text-muted` | `#808080` | Body secondary text |
| `--text-dim` | `#9E9E9E` | Captions, dates, meta |
| `--paper` | `#ECECEC` | Light section background |
| `--paper-bright` | `#FDFDFD` | Light cards on light sections |
| `--sand` | `#D6CFC3` | Warm neutral accent |

Text on dark surfaces is white/near-white. The design uses **57 gradient
fills** — mostly purple glows behind the hero and the final CTA panel. Treat
gradients as decorative; never put text contrast at their mercy.

## Type

**Families**
- **Poppins** — Regular (400), Medium (500), SemiBold (600). This is the
  **entire site face**: body, UI, and every heading including the hero.
  Load via `next/font/google`; it self-hosts at build time, which keeps the
  static export free of runtime requests.
- **Wonderkids** — **not a Mushi font.** It appears exactly twice, both times
  rendering the single word "Holo" (nodes `3803:1632` at 33.132px and
  `3803:3227` at 52.809px). It is the client Holo's own brand face. Do **not**
  license or load it — see "Client logotypes" below.

Verified headline fonts:

| Element | Font | Size |
| --- | --- | --- |
| Hero `Your Path to $100M.` | Poppins SemiBold | 80px |
| `Want Creatives This Premium?` | Poppins SemiBold | 48px |
| `Not Just Pretty, but Profitable.` | Poppins SemiBold | 48px |

**Scale** (measured occurrences in the frame)

| px | Weight seen | Role |
| --- | --- | --- |
| 80 | SemiBold | Hero headline ("Your Path to $100M.") |
| 48 | SemiBold | Section headings |
| 30 | SemiBold / Medium | Sub-section headings (most frequent size) |
| 28 | Medium | Card titles |
| 24–25 | Medium | Large body / stat figures |
| 20 | Medium | Lead paragraph |
| 18 | Regular | Body |
| 16 | Regular | Body small (most frequent body size) |
| 15 | Regular | Card body |
| 14 | Regular | Meta, dates, tags |

Weight frequency across the frame: Medium ×17, SemiBold ×13, Regular ×10.

The two odd sizes (`33.132px`, `52.809px`) are the Holo wordmark, not steps in
the scale. **Do not** add them.

## Client logotypes

In Figma the "Holo" logotype is a masked icon image plus the word "Holo" set as
live text in Holo's own font. Client marks must ship as **images**, never as
text in a licensed third-party face — that would mean licensing a font to
render someone else's trademark.

Preferred: obtain the client's official SVG logo.
Interim: set "Holo" in Poppins SemiBold and treat it as a known visual
deviation. Same rule for Sintra, Unive, Breezit, eany, we interiors, Xaviera.

## Interaction — hover inversion

Every button **inverts its own two colours** on hover: foreground and
background trade places.

| Resting | Hover |
| --- | --- |
| purple background, white text | white background, purple text (`#6e54b5`) |
| white background (`#ECECEC`), black text | black background, white text |

This is an inversion, not a swap between two buttons, and not a
lighten/darken. Two rules follow from it:

1. **Always transition it.** A snap between inverted schemes is jarring at
   this contrast; `transition-all duration-150` is the house setting.
2. **Keep a gradient background layer in both states.** The primary CTA rests
   on a gradient, so its hover state must also be a gradient (a flat white
   expressed as `linear-gradient(147deg,#fff,#fff)`) — otherwise the browser
   cannot interpolate between a gradient and a solid colour and the fill
   jumps while the text fades.

## Radius

| px | Count | Use |
| --- | --- | --- |
| 15 | 48 | Default for cards, images, panels — **the house radius** |
| 5 | 30 | Small chips, tags, inline badges |
| 100 | 11 | Pills — buttons, "15 MINUTE FIT-CHECK" style CTAs |
| 20 | 8 | Large panels |
| 16 | 3 | Occasional card |
| 30 / 50 / 10 | 2 / 2 / 1 | One-offs; prefer the values above |

When in doubt use **15px**. Pills use **100px**.

## Layout

- Design frame width **1921px**; treat **1440px** as the desktop reference and
  cap content around **1200–1280px** with generous gutters.
- The mockup has no auto-layout, so there is no reliable spacing scale to
  extract. Use a consistent 4px-based rhythm (4 / 8 / 12 / 16 / 24 / 32 / 48 /
  64 / 96) and match the screenshot visually.
- Mobile was deliberately **not** pulled from Figma (call budget — see
  [ASSETS.md](ASSETS.md) and the memory note on the 6-calls/month limit).
  Sections stack in the same order; build mobile-first with Tailwind
  breakpoints and check against the mobile artboard in Figma by eye.

## Header bar

Measured off the Figma frame at its **1920** reference width (supplied by
Žilvinas, 2026-08-10) — not derived from the 1440 scale used elsewhere on this
page. Implemented in `src/components/SiteHeader.tsx`, which drives all of it
from one custom property `--u` that equals 100px at 1920.

| Part | Size at 1920 | In `--u` |
| --- | --- | --- |
| Bar | 1386 × 100, radius 15, fill `#181818` | 13.86u × 1u |
| Wordmark | 150 × 45 | 1.5u × 0.45u |
| Nav links | Poppins SemiBold 28px | 0.28u |
| CTA box | 242 × 70, radius 15 | 2.42u × 0.70u |
| CTA label | Poppins SemiBold 30px, "Book a Call" | 0.30u |

The 70-tall CTA in a 100-tall bar fixes the bar's vertical padding at 15px, so
the CTA is inset equally top, bottom and right.

**Wordmark font size.** The 150 × 45 box is a text layer, so it is reproduced
by picking the font size, not by setting a box. Dutch801 draws "Mushi" 2.646em
wide; `tracking-tight` (-0.025em) closes four gaps, leaving 2.546em, so
150 / 2.546 = **58.9px ≈ 0.59u**. The ink is then 0.737em = 43.4 tall — the 45
is the line box. Do not tighten tracking past about -0.030em to force the ink
to a full 45: M and u have only 0.040em of sidebearing between them and will
collide. (Metrics read from the TTF's `hmtx`/`glyf` tables.)

### CTA gradient

Three stops — `#A08ADE` 0%, `#7C54B5` 40%, `#6E54B5` 100% — on a Figma gradient
line whose handles sit **outside** the 242 × 70 box: it starts 50px right of
and 40px above the top-left corner, local `(50, -40)`, and ends just above the
bottom-right corner, local `(242, 60)`.

CSS takes an angle plus stops along its own gradient line, which is normalised
to the box, so the handles have to be re-projected onto it:

| Figma | CSS |
| --- | --- |
| direction `(192, 100)` | `117.51deg` |
| handle 0% at `(50, -40)` | `10.47%` |
| handle 40% | `45.54%` |
| handle 100% at `(242, 60)` | `98.13%` |

```
linear-gradient(117.51deg, #a08ade 10.47%, #7c54b5 45.54%, #6e54b5 98.13%)
```

Angle and percentages are both relative, so this holds at any scale provided
the box keeps its 242:70 ratio. The other buttons on the page still carry the
older eyeballed `linear-gradient(140deg, … 8% / 42% / 93%)` — bring them onto
this fill when their own Figma measurements arrive.

## Hero stat panel

The four "ads" cards drifting in from the hero's edges. **All four are the same
card** — same fill, border, rule, icon and meter; only the copy and position
change. Measured at 1920 (supplied by Žilvinas, 2026-08-10) and implemented in
`src/components/HeroPanels.tsx`, driven from one custom property `--k` that
equals 100px at 1920.

| Part | Size at 1920 | In `--k` |
| --- | --- | --- |
| Card | 500 × 200, radius 30 | 5k × 2k, 0.3k |
| Rotation | per panel — see below | |
| Fill | `#181818` | |
| Border | 3px `#222222` | 0.03k |
| Title | Poppins Medium 25px | 0.25k |
| Lines | Poppins Medium, size per panel | |
| Face icon | 35 × 35, centred on a 50 × 50 `#222222` disc | 0.35k / disc 0.5k |
| Divider | 2px `#9D9D9D`, 100% opacity | 0.02k |
| Inset, top and bottom | 24 from the card edge | 0.24k |
| Line 2 → meter | 14 | 0.14k |
| Meter bar | 14 × 32, radius 5 | 0.14k × 0.32k |

### Per panel

The chrome is shared; these differ.

| | 1 · Performance Score | 2 · Growth Performance Analysis |
| --- | --- | --- |
| Rotation (CSS) | −5.09159° | **+9.19°** |
| Line 1 | 20px | 15px |
| Line 2 | 15px | 15px |
| Line 1 → line 2 | 4 | **32** |
| Beside the lines | 35px icon on a 50px disc | column chart |
| Meter along the bottom | yes | no |

**Rotation signs are not interchangeable.** Figma reports rotation
counter-clockwise-positive; CSS and SVG are clockwise-positive. Panel 2 was
given as "−9.19" read off Figma's field, so it is `9.19deg` in CSS — the
opposite tilt to panel 1, which is confirmed by the reference (its top edge
runs down to the right, +495x/+78y ⇒ 8.96°). Panel 1's figure came from an SVG
export instead, so it carried across with its sign intact. When a rotation
arrives, always check it against the artwork before trusting the sign.

Panels 3 and 4 are still panel 1's shape carrying placeholder copy.

**Panel 2's column chart.** Five columns, all 20 wide, radius 5, on a shared
baseline; the box is as tall as the tallest, 95.

| # | Size | Fill |
| --- | --- | --- |
| 1 | 20 × 32 | `#FFFFFF` 20% |
| 2 | 20 × 67 | `#222222` |
| 3 | 20 × 60 | `#FFFFFF` 20% |
| 4 | 20 × 95 | `#222222` |
| 5 | 20 × 80 | `#FFFFFF` 20% |

Panel 2 also pins **line 2's bottom 40 from the card's bottom edge**. Its 95-tall
chart is taller than its 73.25 text block, so centring would leave the lines
floating; the lines are bottom-aligned and lifted 16 instead (40 measured from
the edge, less the 24 bottom inset).

Those are the same two fills the level meter uses, so they share the `LIT` /
`UNLIT` constants in `HeroPanels.tsx`. The only number here not measured is the
**10px gap** between columns, derived from the reference: the selected 20 × 32
column measures ~50px on screen, giving a 2.48× scale, against a ~75px pitch.

**The border is inner** and must stay that way: the card is 500 × 200 *including*
its 3px border, not 506 × 206. Tailwind's preflight puts everything in
`box-sizing: border-box`, so a plain `border-width` already draws inside the
box. It also means the CSS padding is **21**, not 24 — 3 border + 21 padding is
the 24 that was measured from the card's edge.

**Vertical rhythm.** Only three gaps are measured: 24 from the top edge to the
title, 14 from the second line to the meter, and 24 from the meter to the
bottom edge. The implementation pins all three by hugging the meter and the
text row to the bottom padding (`mt-auto`), so they hold whatever the type
metrics do; the ~10px of leftover slack collects between the divider and the
text row, which is the one gap here that is not a supplied number. The budget
closes at 141.4 used out of a 152 content box.

**Crop.** 200 of the card's 500 hangs off the viewport edge, leaving 300
visible. Measured, not eyeballed: the reference crops the three lines to
"Score", "ched 10M+ Views" and "ed to be Excellent". Reading the *hidden*
substrings' advance widths out of the Poppins Medium woff2 `hmtx` table gives
169.8 / 168.3 / 165.7px at 25 / 20 / 15px; add the 33px inset (3 border + 30
padding) and solve each against the −5.09159° rotation and you get −197.9,
−201.3 and −201.2. Three independent lines agreeing on **−200** is what makes
it trustworthy. The copy in `content.ts` is the **full** string in every case —
the mid-word cropping is the viewport, not the text.

Running the same solve on panel 2 — which crops to "rmance Analysis", "er" and
"sured", and tilts the other way — gives −205.0 / −208.6 / −209.8, so ≈ −208.
All four panels currently share −200, which shows about 8px (roughly one
character) more of panel 2 than the reference does. Whether the design really
offsets each panel separately is unconfirmed; split them if it starts to
matter.

**Meter.** 22 bars. That count is derived, not counted off a screenshot: at the
given 14px bar and the 6px gap the reference shows, 22 bars measure
22×14 + 21×6 = **434**, exactly the card's content width
(500 − 2×3 border − 2×30 padding). The row uses `justify-between` rather than a
fixed gap so it keeps spanning the full width if that padding is ever
corrected. The **rightmost five** bars are `#FFFFFF` at **20%** opacity (which
lands on ~`#464646` over the `#181818` fill); the remaining seventeen are
`#222222`.

**Face icon.** 35 × 35, centred in the 50 × 50 disc. Sized by its own box, not
by a font size, so the centring is exact geometry rather than a function of an
emoji font's ascent and descent — that is what kept an earlier text version
sitting low.

The icon carries **no rotation of its own**. The −5.09159° in the supplied
Figma node is the *card's* rotation, baked into the child on export; applying
it to the icon as well double-rotates it.

The artwork is `public/images/emoji-sunglasses.png` (160 × 160, 25.9 KB),
extracted from the `sbix` table of `/System/Library/Fonts/Apple Color
Emoji.ttc` — glyph U+1F60E, 160 ppem strike. The Figma node's own image was
160 × 160, which is exactly that strike, so this is the same artwork the design
was drawn from. Regenerate with `scripts/extract-emoji.js` if another emoji is
ever needed.

> **Lesson worth keeping.** The node's image arrived as inline base64 that was
> truncated in transit, and the PNG written from it had a first `IDAT` chunk
> declaring 16384 bytes with only 8604 left in the file and no `IEND`. It
> failed to decode silently, and `file` still reported a healthy
> "PNG 160×160 RGBA" because that only reads the header. **Header checks do not
> catch a truncated image — inflate the `IDAT` stream.** Prefer a real file
> export over pasted base64.

**Eyeballed, not measured** — replace when the Figma numbers arrive: the card's
30px padding (inferred from the 22-bar fit above) and the drop shadow.

## Open questions

- Client logo SVGs (Holo especially) — see "Client logotypes".
- Exact spacing between sections is eyeballed from the screenshot, not measured.
