# The legal pages — `/legal/privacy-policy`, `/legal/terms-and-conditions`, `/legal/refund-policy`

Built 2026-10-10 from the Figma page **"WEB: Legal"** (canvas `3803:7658`)
over the desktop app's local MCP server (`http://127.0.0.1:3845/mcp`, see
README). Three documents, one page: the layout is `src/components/legal/LegalPage.tsx`,
the words are `src/lib/legal.ts`. Change the layout once and all three follow.

## Nodes (verified 2026-10-10)

| Node | Frame | Size |
| --- | --- | --- |
| `5547:114` | Privacy policy — desktop | 1920 × 10205 |
| `5547:115` | privacy policy — mobile | 376 × 11865 |
| `5547:117` | Teams & conditions — desktop (sic) | 1922 × 11454 |
| `5547:118` | Terms & conditions — mobile | 375 × 13384 |
| `5547:120` | Refund policy — desktop | 1922 × 4560 |
| `5547:121` | Refund policy — mobile | 375 × 5127 |

Each desktop frame is followed by a separate "Footer desktop" frame
(`5510:1061`, `5525:1657`, `5529:2248`) — the existing `SiteFooter`, not
rebuilt. The frames have no auto-layout; every number below is read off the
absolute positions. The Privacy desktop frame sits 2px left of the other two
(header bar at 267 against 269); the numbers below are the Refund/Terms ones.

## Desktop (1920)

**Hero** `0–392`: image `hf_20260915_203715_270919df-409e-4787-b47b-acb3be184cdd`
(a 2816 × 1584 PNG, the violet panel with the grid squares), drawn at
107.47% × 243.04% of the 1920 × 392 box, offset −3.85% / −62.75% — i.e. the
master's region (101, 409)–(2721, 1061) squashed non-uniformly into the band.
That crop is `public/images/legal-hero.webp` (2560 × 523, stretched with
`object-fit: fill`). Title SemiBold 70/80 centred, top 191. "Last updated: …"
Regular 24/20 centred, top 290. The header bar floats over it at y 30.

**Sidebar** at x 269:
- "Legal" SemiBold 28, centre y 502 (top 481 at the normal 42 line).
- Three rows, 44 tall, from y 538: icon 24 at x 284 (`lock-01`, `file-06`,
  `refresh-cw-05` — Untitled UI, stroke 2), label Medium 20 at x 318. The
  current document is a white 307 × 44 pill, radius 10, black type and icon.
- "Table of contents" SemiBold 28, centre y 723.
- The rail: 13px dots at x 289 (first at y 768), a 1px white line at x 295
  from the first dot down to the last; the current section's dot filled
  white, the rest black with a white ring. Items Medium 18 at x 313, 44 apart,
  62 when a title wraps to two 18px lines. "1. Who We Are" — the number is
  part of the text.

**Text column** x 732, width 905, starting at y 484 (92 under the hero):
- Body Regular 22/32 at 75% white.
- Clause number ("1.1.") Medium 24, white, in the same line.
- Section heading SemiBold 40 (normal line, 60), its number starting 12 left
  of the column (x 720); one line, in a box up to 981 wide.
- Sub-heading ("3.1 Automatically collected information:") Medium 26/32 white
  at x 703 (privacy frame; 2 left of its column); what follows it at x 748,
  18 in. Bullets are "• " with the wrapped lines hanging two spaces in.
- Rhythm: paragraphs 30 apart; a heading 42 under the paragraph before it
  and 27 over the one after. Lettered "(a) …" runs come after one blank line
  with a four-space hanging indent.
- The last paragraph ends 150 above the footer.

## Phone (375)

Hero `0–196`: the same master at 301.97% × 245.52% of a 328 × 196 box
(offset −10.52% / −63.4%) **mirrored horizontally** — the panel's left third,
flipped — plus a 47px strip of a second copy on the left. Shipped as
`legal-hero-phone.webp` (750 × 392), the whole 375 from one crop. Title
SemiBold 30/30 top 102; date Regular 15/20 top 143. No sidebar, no table of
contents.

Text at x 35, width 325 (15 from the right edge), from y 288 (privacy/terms;
the refund frame floats its intro at 254). Body Regular 16/25 at 75% white;
clause number Medium 18; section heading SemiBold 23/28; paragraphs 30 apart,
headings 38 under / 36 over. The frame boxes are hand-placed and these are
the modal values. The footer follows 60 under the last line.

## The hero, remade (2026-10-10)

The frames' raster was soft (Žilvinas: "make this quality max … or remake
it, as clear as possible"; of the live page, "tragic!!!"), so
`src/components/legal/LegalHero.tsx` draws it as vector in the 1920 × 392 design
space, and both crops above are windows on that one scene (the phone's is
`viewBox -2 0 684 388`, mirrored). The two WebP crops are gone. What was
read off the master:

- **The grid**: pitch 94.65 master px (24 columns from x 275 to 2452, 8
  rows from y 433), i.e. cells 69.36 × 56.42 in the band. 42 cells are
  drawn, found by their fill (a few percent of white over the gradient,
  judged against the cell's own surroundings) with the bottom row — washed
  out by the glow — read by eye off the enhanced foot. Stroke white at 20%,
  fill white at 7%, 1px `vector-effect: non-scaling-stroke`.
- **The gradient**: sampled down a square-free column, 17 stops, `#000010`
  at the top through `#160a3a` at mid to `#e0c8f9` at the foot.
- **The edge glows**: a lavender light 99 design px in from each side,
  falling 1 → .62 → .38 → .24 → .16 → .09 → .055 → .03 → 0 at 11px steps
  (the master's profile at mid height), masked 0.15 at the top to 1 at the
  foot, plus a whiter layer over the lower half.

`src/lib/legal-hero-data.ts` holds the cells and the stops; the numbers
above are the way to regenerate it.

**app.mushi.agency does not render these pages.** Its auth screens' Terms
and Privacy links, and its old `/terms` and `/privacy` routes, go to the
pages here (Žilvinas 2026-10-10: "those buttons should just redirect to
mushi.agency"). The documents are written once, in `src/lib/legal.ts`.

## Copy

Verbatim from the frames, with Figma's manual line wraps removed. Noted
deviations, both in `legal.ts`:
- Terms section 11 is titled "Out Intellectual Property" in the file
  (`5527:1821`); the page says "Our".
- Privacy "2. Scope" has, under "2.1 This policy covers:", the SAME three
  bullets as 3.1 (nodes `5506:608` / `5504:477`) — a copy-paste placeholder
  in the file. Reproduced as drawn; it needs real Scope copy from Žilvinas.
- Privacy's contents list reads "How We Use You Data" and "How long We Keep
  Data" where the headings read "Your" and "Long"; the page uses the headings.

Dates shown: Privacy 5 October 2026, Terms 6 October 2026, Refund 7 October
2026.
