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
- **Poppins** — Regular (400), Medium (500), SemiBold (600). Body + UI.
  Load via `next/font/google`; it self-hosts at build time, which keeps the
  static export free of runtime requests.
- **Wonderkids** — display face used on the big headline. Commercial font, not
  on Google Fonts, not exported by Figma. See "Open questions" below.

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

Two odd sizes appear once each (`33.132px`, `52.809px`) — these are scaled
artboard artefacts, not intentional steps. **Do not** add them to the scale.

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

- **Wonderkids licence.** If the `.woff2`/`.otf` is available, wire it with
  `next/font/local` and set it as the display family. If not, headlines fall
  back to Poppins SemiBold — swap in one place (the font definition in
  `src/app/layout.tsx`) rather than per-component.
- Exact spacing between sections is eyeballed from the screenshot, not measured.
