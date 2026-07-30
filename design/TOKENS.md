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

## Open questions

- Client logo SVGs (Holo especially) — see "Client logotypes".
- Exact spacing between sections is eyeballed from the screenshot, not measured.
