# Case Studies page — spec

`/case-studies`. Everything below was read off Figma on 2026-10-04 through the
desktop app's local MCP server (`http://127.0.0.1:3845/mcp`). That server did
**not** enforce the 6-calls-a-month cap the remote one does, so the page was
read in full; nothing here should need a second trip.

## Source of truth

Figma file `cHPZeWJ00RoH44yy1AkW9P`, page `🌞 - WEB: Case Studies` (`3803:5230`).

| Node | What | Size |
| --- | --- | --- |
| `5293:73` | `Case studies - desktop` — header to the Static Ads rail | 1920 × 4131 |
| `5293:74` | `Case studies - mobile` — header to the end of Ready To Scale | 375 × 3769 |
| `4548:5691` | desktop "Ready To Scale?" heading (loose, below the frame) | y 4254 |
| `4548:5486` + `4548:5342` | desktop left card: frame + collage | 585 × 525 |
| `4814:167` | desktop right card | 585 × 525 |
| `4933:2388` | phone: both Ready To Scale cards | 345 × 633 |
| `4477:1024` / `4626:614…` | footer — already built, see SECTIONS.md | |

All coordinates below are **frame coordinates**: x from the frame's left edge,
y from its top. The loose desktop nodes share the desktop frame's origin.

## Two deliberate departures from the frame

Both are the site's standing rules, not new decisions (CLAUDE.md, globals.css):

1. **The header is the shared one.** Figma draws the bar 100 tall at y 56–156;
   the live bar is the 80% bar every page wears, sticky 22 from the top, so its
   bottom edge is at 102. The page is therefore the frame **with its top 54px
   cropped**: bar bottoms coincide and everything below the bar is where the
   frame puts it. On the phone the live bar ends at 84 against the frame's 73,
   so the phone page is the frame **pushed down 11px**.
2. **Desktop is rem.** 1rem = 16 design px at 1920 and scales with the window
   (clamped 10.5–16px). Every desktop number below is written as `px / 16` rem.
   Phones (< 768) are the 375 artboard in px, fluid in width only.

## Page outline

```
<header>                      shared SiteHeader, active="/case-studies"
<main>
  <section>  hero             h1 "Case Studies" + the four case cards
  <section>  video ads        h2 + cover-flow rail
  <section>  landing pages    h2 + cover-flow rail
  <section>  static ads       h2 + cover-flow rail
  <section>  ready to scale   h2 + two offer cards
<footer>                      shared SiteFooter
```

## Hero field

Desktop field is 1920 × 1839 (frame y 0–1839), then black. Phone field is
375 × 1433, then black.

Layers, bottom to top (desktop ids):

| Layer | Node | Notes |
| --- | --- | --- |
| black → `#161220` | `4643:1736` | 1671 tall |
| diagonal shapes, both sides | `4643:1738` | clipped at y 40 |
| edge vignettes | `4643:1758/1759` | 148 wide |
| violet diamond gradient | `4643:1760` | y 156–1839 |
| bottom fade | `4643:1761` | y 1693–1839, to black 35% |
| blurred light | `4643:1855` | y 869–1839, layer blur 20.4 |
| floating icons ×7 | see below | above the cards in z, never overlapping them |

Shipped as: one baked **field** (every soft layer — `case-studies/field.webp`,
`case-studies/field-phone.webp`), the two **shape** sprites pinned to the
window's edges, and one sprite per **floating icon**. The Sintra and RHEA
icons, which the frame cuts with its own edge, are pinned to the window's edge
too; the other five ride the centred composition.

Floating icons (desktop bbox in frame coords → phone bbox):

| Icon | Desktop node | Phone node |
| --- | --- | --- |
| white layered mark, round | `4646:2178` | `4646:2183` |
| "F" swoosh tile | `4643:2100` | `4646:2194` |
| PB tile (blurred) | `4643:2109` | `4646:2188` |
| Sintra tile (cut by the left edge) | `4644:2135` | `4646:2191` |
| SC coin | `4645:2155` + `4933:2390` | `4646:2174` |
| orange mark (blurred) | `4646:2179` | `4646:2180` |
| RHEA tile (cut by the right edge) | `4646:2173` | `4646:2199` |

On the phone they sit **behind** the cards and only show in the gutters.

## Heading

"Case Studies" — the page's only `<h1>`. Poppins SemiBold, white, centred.
Desktop 80/80, line centre at y 264.5. Phone 30/30, centre at y 131.

## Case cards

Order on both breakpoints: Holo, Breezit, eany, we interiors.

Copy (the body line is the same placeholder on all four in the file):

| Brand | Result | Tag (desktop only) |
| --- | --- | --- |
| Holo | From $0k/month to $117k/month in 7 months. | AI FOR MARKETING |
| Breezit | Generated 700 sales calls & 1500 leads in 8 months. | AI FOR SALES |
| eany | Helped find 3 evergreen ads for 8 figure company. | B2B MARKETPLACE |
| we interiors | From $13k/month to $75k/month in 3 months. | FURNITURE RETAIL |

Body: "Capturing demand from day 1 and helping scale Holo into the largest AI
content tool." Button: "Read full story".

### Desktop (pitch 361: tops at 343, 704, 1065, 1426)

- Tile plate `#181818` 287 × 341 r25 at x 458. Inside it, inset 7, the
  gradient tile 273 × 327 r20, and the artwork, which **breaks out** of the
  tile to the left and top (Holo's mask is 307 × 353 at 431,324).
- Tag chip `#181818` r10, h 46, centred on the tile (x 601.5), 13 above the
  tile's bottom edge. Poppins Medium 22, `#9E9E9E`. Widths 233 / 171 / 231 / 221.
- Text plate `#181818` 697 × 341 r25 at x 765 (20 right of the tile plate).
  - logo at +30, +32 (Holo wordmark box 103 × 32; Breezit 127 × 31; eany
    135 × 37; we interiors 191 × 36)
  - result: Poppins Medium 32/40 white, top +93, two lines
  - body: Poppins Regular 24/32, white 50%, top +186, width 568
  - button: 209 × 44 r22.5 `#363636`, top +267; label Poppins Medium 20 at
    +15; disc 32 `#181818` inset 7 from the right; chevron 8 × 14, stroke 3

### Phone (pitch 314: tops at 167, 481, 795, 1109)

- One plate `#181818` 345 × 299 r20 at x 15.
- Gradient tile 101 × 285 r17 at the plate's right, inset 7. The artwork's
  mask is 183 × 285 — it breaks out 82px to the LEFT, over the text side.
- No tag chip.
- logo at +20, +20 (Holo 36px wordmark; Breezit 95 × 23; eany 99 × 27;
  we interiors 139 × 26)
- result: Poppins Medium 20/24, top +67, three lines
- body: Poppins Regular 14/20, white 50%, top +149, width 174
- button: 197 × 44 r22.5 `#363636`, top +236; label Medium 18 at +18; disc 32
  inset 6 from the right

Tile gradients (radial, per brand): Holo violet `#8E43C7 → #BC94C1 → #453080 →
#000`; Breezit `#C5611E → #000`; eany `#47B19C → #3C6488 → #38405B → #000`;
we interiors `#43450A → #685429 → #000`. They are baked into the artwork.

## Rails (Video Ads / Landing Pages / Static Ads)

Each is a cover-flow: the centre card at full size and opacity, neighbours
stepping down in size and opacity, a `#181818` plate behind the centre, the
title straddling the plate's top edge, two round arrows under the centre card.
Card = `#343434` frame r25 with the image inset 5–7 and r20 (phone: r20 / r17,
inset 4–5). Frame coords:

**Desktop — Video Ads** (plate 646 × 678 at 642,1999; title 55/80 centre y 1999.5)

| Slot | Frame x,y w×h | Image opacity | Shadow |
| --- | --- | --- | --- |
| centre | 783,2049 354×578 | 1 | 0 4 50 21 black |
| ±1 | 458,2085 311×506 · 1151,2084 311×508 | .75 | 0 4 50 27 |
| ±2 | 180,2122 264×432 · 1476,2124 263×428 | .5 | 0 4 50 27 |
| ±3 | −50,2161 216×354 · 1753,2161 216×354 | .35 | none |

Mute badge on each card, bottom-right: `rgba(79,79,79,.5)` round, 40 (centre),
33, 27, 24. Arrows: 65 `#343434` circles at x 883 and 972, y 2644.

**Desktop — Landing Pages** (plate 646 × 525 at 642,2819; title centre y 2819.5)

| Slot | Frame | Opacity |
| --- | --- | --- |
| centre | 575,2869 752×425 (shadow 0 4 50 21) | 1 |
| ±1 | −67,2904 629×355 · 1340,2904 629×355 | .75 |

Screenshots are cropped from the top. Arrows at y 3311.

**Desktop — Static Ads** (plate 646 × 596 at 642,3486; title centre y 3486.5)

| Slot | Frame | Opacity |
| --- | --- | --- |
| centre | 712,3536 496² (shadow 0 4 50 27) | 1 |
| ±1 | 267,3568 431² · 1222,3568 431² (shadow 0 4 50 27) | .75 |
| ±2 | −116,3599 369² · 1667,3599 369² | .5 |

Arrows at y 4049.

**Phone** (all three): plate 305 wide r15 at x 35; title 30/24, its centre 1px
above the plate's top; centre card 250 wide at x 63 (shadow 0 4 30 17), side
cards 222 wide at x −169 and 323 (shadow 0 4 25 0, image .75); arrows 48 at
x 130 and 198. Video/Landing: plate 478 tall, centre 250 × 408, sides 222 × 362.
Static: plate 320, centre 250², sides 222². Plate tops 1503 / 2060 / 2618;
card tops +35; arrow tops 1957 / 2514 / 2914. No mute badge.

**The films play.** Only the centre card, only while the rail is on screen:
muted, looping, fading in over its poster; the centre card is the sound
toggle and the mute badge is its state (`CoverflowRail.tsx`). Films and the
extra statics were supplied 2026-10-04 — see ASSETS.md. The rails hold more
than the frame draws (11 films, 13 statics); the frame's own cards sit in the
middle in its order, so the rest state is still the frame.

Rail order as drawn, left to right (centre in bold):

- Video: red-X, bride POV, dog "Real results", **Holo**, "In 15 minutes",
  Celemi mask, "Overpaying"
- Landing: Sintra pick-your-plan, **Sintra home**, Axiometa — each has a
  desktop and a phone screenshot
- Static: Spacegoods, Bluechew, **Hey Bud**, Lucky Time, towels

## Ready To Scale?

Heading Poppins SemiBold, centred: desktop 80/80 centre y 4282.5; phone 30/30
centre y 3037 (frame coords, phone frame).

Two cards. Desktop 585 × 525 at x 362 and 973, y 4361. Phone 345 × 309 at
x 15, y 3073 and 3397. Each is a 9px (phone 5–6px) frame with a violet glow
rising from its bottom edge, around the artwork (r20 / r17).

| | Left | Right |
| --- | --- | --- |
| title | 500+ High-ROAS Static Templates | Premium Static & Video Ads |
| button | BUY NOW — white pill, black disc | BOOK A CALL — violet pill, black disc |
| below | three feature rows | five avatars, green dot + "Now Booking New Projects" |

Desktop: title Poppins Medium 50/50 at +44, +59; button h 57 r30 at +44, +180
(204 / 246 wide), label SemiBold 24, disc 45 inset 6; feature rows at +376,
+416, +456 (icon 25, text Regular 20 at +78); avatars 60 at +380, pitch 39;
dot 15 + text Regular 20 at +461.

Phone: title Medium 24/26 at +25, +35; button h 42 (147 / 178 wide), label
SemiBold 18, disc 32; rows at +213, +239, +264 (text Regular 16 at +49);
avatars 35, pitch 23, at +221; dot 10 + text 16 at +269.

Feature rows: 50+ new templates monthly · 24/7 customer support · Editable in
Canva.

## How the artwork was made

Figma's MCP screenshots are 1× only, so nothing shipped is a screenshot. The
artwork is composed from the file's own source images (saved at their original
resolution) and then **checked against Figma's 1× render of the same node**:

- Case-card artwork: rendered at 3× from Figma's generated layout. Two phone
  cards (Holo, we interiors) came out with the wrong rotation in that layout —
  the same rotation-sign trap as elsewhere — so those two were registered onto
  Figma's render (SIFT + RANSAC) and re-composed from the source at 3×.
- Field: every blurred layer, at 2× (phone 3×).
- Floating icons and the Ready To Scale artwork: Figma's own 4x exports,
  supplied by Žilvinas, because the generated layout loses their image
  transforms. The card art is the frame plus the collage export at the
  frame's 9 (phone 5) inset; the phone's five avatars are their own exports,
  leftmost on top. The desktop right card is the whole-card export with its
  title, button and status line replaced by the text-free background export
  of the same card (the two agree to within 1/255 where they overlap), so the
  avatars and frame are Figma's pixels and the copy is real text.

## Detail page — `/case-studies/<slug>`

**Built, audited against the frames, and held back** (Žilvinas 2026-10-04:
the page is not ready and its article is placeholder copy). The route lives in
`src/app/case-studies/_[slug]/` — a private folder Next does not build. To
ship: rename it to `[slug]`, give the Holo card its `href`, add the URL to
`sitemap.ts`.

One page per entry in `CASE_STUDY_DETAILS` (`src/lib/content.ts`). Only Holo
is drawn, so only Holo has an entry.

| Node | What | Size |
| --- | --- | --- |
| `5294:293` | `Case study page - desktop` | 1920 × 3977 |
| `5294:294` | `Case study - mobile` | 375 × 4371 |

Header rule as above, with this frame's own numbers: its bar ends at 140
(phone 73), so the page is the frame **minus 38** on desktop and **plus 11**
on the phone.

### Hero

Field 655 tall (phone 598): the violet image `image 438`, turned 180°, **at
88% over black** (phone 97%) with the dot pattern over it. The opacity is not
in the exported image — it was measured off Figma's render and is baked into
`detail-field.webp` / `detail-field-phone.webp`.

| | Desktop | Phone |
| --- | --- | --- |
| eyebrow "HOLO • CASE STUDY" | Medium 22/30 `#8B8B8B`, x 270, line top 295 | Medium 16/30, x 15, top 111 |
| h1 | SemiBold 48/55, top 341, 2 lines | SemiBold 30/32, top 147, 3 lines |
| sub | Medium 26/32 white 50%, top 462.5, 2 lines | Medium 16/20, top 254, 3 lines |
| still | 680 × 383 r20 at 970,220 | 345 × 194 r15 at 15,335 |
| play mark | 91, centred on the still | 63 |
| Book a Call | — | 345 × 44 r10 at 15,539, SemiBold 18 |

### Body — `#080808` from the hero down

Desktop: call card 383 × 425 r25 at 270,710 and the article 977 × 2712 r25 at
673,710 (20 apart). Phone: article 345 × 2573 r20 at 15,613, then the call
card 345 × 360 r20 at 15,3218.

Article rhythm (desktop / phone): 28.5 / 11 above the first label; label
Medium 24/30 (16/30) `#8D8D8D` at 30 (20) in; 21 / 7 to the copy; copy Regular
24/32 (16/20) white; 36 / 17 to the next label. Paragraphs start 33 (20) in,
bullets' text 51 (35) in. Gallery 42.5 / 26 under the last block: three
293 × 470 r15, 19 apart (phone: 197 × 316, 14 apart, a sideways strip with the
3px progress line 19 under it); 30 / 18.5 of card under that.

The phone frame has no "THE GOAL" label — the slot for it is there (the
spacing is the same as every other section's), so it is rendered.

**The copy's right margin is 6–7px (phone 2–3px) wider than the frame's.**
Figma sets Poppins up to 0.7% wider than the browser; without the correction
three line breaks moved and two phone blocks lost a line. With it all 62
desktop and 91 phone lines break where the frame breaks them — see the note on
`COPY` in `CaseStudyDetail.tsx`.

Call card: artwork baked (`detail-call*.webp`: the purple panel, the phone,
the fade). Desktop — button 283 × 57 r15 at +50,+219, SemiBold 26; green dot
12 + "2/10 spots left for 2026" Medium 18 at +79,+291; "Prefer Email?"
SemiBold 20 and the address Regular 18 `#808080` (tracking −3%) at +30; disc
43 `#363636` at +310,+352. Phone — button 255 × 44 r10 at +45,+190, SemiBold
18; spots Medium 16 at +90 (no dot); email pair at +73; disc 39 at +286,+299.

Under the card: 112 of `#080808`, then 18 of black, then the footer (phone:
60, then the footer).

## Open

- **The detail page's article is placeholder copy.** In the file the Holo page
  carries another client's write-up (an email programme for a supplement
  brand). It is shipped verbatim; replace it in `CASE_STUDY_DETAILS`.
- **The hero's play mark does not play.** The file has a still and no film.
- **No "Read full story" pill is drawn** (Žilvinas 2026-10-04) — there is no
  page to read yet. A card with no `href` leaves the pill out and centres its
  copy in the plate (down 33.5 on desktop, 27.5 on the phone); give a card an
  `href` and it returns to the frame's layout, pill included.

- The phone frame draws no mute badge. The films have sound, so the phone's
  centre card carries the home rail's badge; the side cards carry none.
