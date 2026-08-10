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

> **⚠️ This node is GONE as of 2026-08-07.** `get_metadata` on `3843:28` returns
> "node ID was not found in the file", and listing the file's pages returns
> exactly one: `1748:21` "INSPIRATION: Unorganized" — a moodboard of ~300 loose
> reference images, not the home page. The design page was renamed, moved to
> another file, or deleted.
>
> **Do not spend further calls hunting for it in this file** — three were burned
> confirming the above. The next session needs a fresh `figma.com/design/...`
> URL *with a `node-id`* from Žilvinas pointing at the current desktop frame.
> When that arrives, update the three lines above and delete this block.

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
