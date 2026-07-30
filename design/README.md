# Design library

Everything needed to build mushi.agency **without re-opening Figma**.

Figma access is capped at **6 MCP calls per month** on this account (View seat,
starter tier). One call has been spent extracting the home page. These files
exist so that budget never has to be spent re-discovering the same information —
by a future session, or by you.

| File | What it holds |
| --- | --- |
| [TOKENS.md](TOKENS.md) | Colours, type scale, weights, radii, layout rules — measured, not guessed |
| [SECTIONS.md](SECTIONS.md) | Semantic page outline and per-section build spec |
| [COPY.md](COPY.md) | Authoritative copy deck for the home page |
| [ASSETS.md](ASSETS.md) | Inventory of all 92 exported assets |
| `assets.json` | Machine-readable map: filename → original Figma layer |
| `../public/images/` | The assets themselves (2.16 MB, WebP + SVG) |

## Source of truth

- Figma file `cHPZeWJ00RoH44yy1AkW9P`, page "HOME PAGE: Agency Services"
- Frame `Desktop Home`, node `3843:28`, 1921 × 7426
- Extracted 2026-07-28

The frame was created by wrapping loose layers, so it has **no auto-layout**.
Figma therefore emits absolute pixel positions, which cannot be shipped. See
[SECTIONS.md](SECTIONS.md) for why and what to do instead.

## Rules

1. **Never re-export an asset that already exists here.** The Figma URLs expire
   after ~7 days; these local copies do not.
2. **Never spend a Figma call to re-read something these files already answer.**
   Check here first.
3. If you do spend a call, **write what you learn back into these files** in the
   same commit.
4. Copy changes go in [COPY.md](COPY.md) first, then into components.
