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

> **⚠️ The whole-page node `3843:28` is GONE as of 2026-08-07.**
> `get_metadata` on it returns "node ID was not found in the file", and three
> calls were burned confirming that. **Do not go hunting for it again.**
>
> The file itself is alive — Žilvinas has since supplied live node ids for the
> footer (below), so the page was reorganised rather than deleted. What a future
> session needs from him is a `figma.com/design/...` URL **with a `node-id`**
> for whatever frame it is about to build, not a search.

### Live nodes (supplied, verified)

| Node | What | Size | Pulled |
| --- | --- | --- | --- |
| `4167:280` | Footer desktop | 1920 × 425 | 2026-08-19 |
| `4167:278` | Footer phone | 375 × 977 | 2026-08-19 |

Both are in this same file. `4167:280`'s children are numbered `4134:6xx` — the
band `4134:616`, the field `4134:619`, the button `4134:621`, the rule
`4134:634`, the star `4134:637`, the social group `4134:653` — and those ids are
quoted at the point of use in `src/components/SiteFooter.tsx`.
[SECTIONS.md](SECTIONS.md) holds every number they gave up, so neither node has
to be read again.

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
