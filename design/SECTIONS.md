# Page structure — Home

The build spec. Figma gives a flat mockup; this file is the semantic plan that
replaces it. Follow this rather than transcribing Figma coordinates.

## Why the Figma output can't be used directly

`get_design_context` on `Desktop Home` returned:

```
absolute-positioned elements : 336
flex containers              :  91
grid containers              :   0
semantic tags (section/h1/…) :   0
```

The frame was created by wrapping loose, scattered layers, so Figma had no
auto-layout to infer from and emitted fixed pixel coordinates at 1921px wide.
Shipping that would mean a non-responsive page with no landmarks — a direct
violation of the SEO rules in CLAUDE.md. Use it for **colour, imagery and
proportion only**.

## Document outline

Exactly one `<h1>`. Every section is a `<section>` with an accessible name.

```
<header>            site nav + primary CTA
<main>
  <section>  hero            → h1 "Premium Ads for $1M to $100M Brands."
  <section>  social proof    → h2 (visually hidden if needed)
  <section>  creatives       → h2 "Want Creatives This Premium?"
  <section>  case studies    → h2 "Not Just Pretty, but Profitable."
  <section>  testimonials    → h2 "Reputation is everything. Ours is flawless."
  <section>  final CTA       → h2 "You scrolled so far. You want this. Trust us."
</main>
<footer>            gift capture, PRODUCTS/COMPANY/CONTACT, socials, legal bar
```

Heading levels must not skip. Card titles inside a section are `<h3>`.

## Section notes

**Header** — sticky. Links: Agency, Case Studies, Templates. `Book a Call` is
the primary CTA (`--accent-purple`, pill radius 100px). Mobile: hamburger.

**Hero** — the only eager-loaded imagery on the page. Headline at 80px desktop,
scaling down on mobile. Floating proof chips are decorative; mark them
`aria-hidden` if they duplicate content, otherwise give them real text.

**Social proof** — brand logotypes (SVG, in `public/images/`) plus the line
"110+ brands enhanced their ads with Mushi". Logos are `<img>` with explicit
dimensions, not CSS backgrounds, so they stay in the accessibility tree.

**Creatives** — horizontally scrollable card row with prev/next controls.
Must work without JS for the static export: use CSS scroll-snap and progressive
enhancement. Do **not** reach for a carousel library.

**Case studies** — 2×2 grid on desktop, single column on mobile. Each card:
screenshot, result line, tag chips (radius 5px). Three of the four brands are
unconfirmed — see COPY.md.

**Testimonials** — masonry-ish grid of quote cards. Each: title, 5 stars,
body, date · name · country. "View More" reveals the rest; keep all items in
the DOM so they are crawlable, and toggle with CSS/details rather than fetching.

**Final CTA** — full-width panel with purple gradient. Repeats the fit-check
CTA and the scarcity line.

**Footer — desktop.** Pulled from Figma node **`4167:280`** ("Footer desktop",
1920 × 425) on 2026-08-19 and implemented in `src/components/SiteFooter.tsx`.
Every number below is the export's own, so **this section replaces the earlier
screenshot reading** — that pass was close but wrong in six places, listed at
the end. COPY.md carries the strings.

The column heads read PRODUCTS · COMPANY · CONTACT, the gift line is "Want a
mystery gift?", and the legal links live in the bottom bar. The older
PRODUCT/LEGAL/COMPANY split is gone.

### Type

All of it Poppins. The export gives centre lines, not boxes, so the build sets
`leading-none` and derives each gap as `centre distance − (size a + size b) / 2`.

| Role | Size | Weight | Colour |
| --- | --- | --- | --- |
| "Want a mystery gift?" | 26 | Medium | white |
| Column heads | 26 | Medium | white |
| Column links, the address | 21 | Regular | `#808080` |
| Placeholder | 21 | Regular | white 50% |
| "Redeem" | 24 | Medium | white |
| "Trustpilot" | 20 | Regular | white |
| The score "4.9" | 24 | SemiBold | white |
| Copyright | 18 | Regular | white 50% |
| Legal links | 18 | Regular | `#808080` |

### Boxes

| Part | Node | Size at 1920 |
| --- | --- | --- |
| The band | `4134:616` | 1920 × 425, `#121212` |
| Email field | `4134:619` | 284 × 60, radius 10, `#222222`, no border, text inset 22 |
| Field → button | | 15 |
| Redeem button | `4134:621` | 143 × 60, radius 10, **flat** `#6E54B5` |
| Trustpilot star | `4134:637` | 27.37 square, `#6E54B5`, then 5.5 to the word, 6 to the score |
| Social group | `4134:653` | 246 × 46 — four 46 tiles, radius 10, `#222222`, at x 0 / 67 / 133 / 200 |
| Rule | `4134:634` | 1px `#808080`, 1380 wide |

### Grid

The columns are the export's own x positions: 270 / 869 / 1182 / 1395 on a
1920 frame, i.e. **0 / 599 / 912 / 1125** from the content edge, so widths
**599 / 313 / 213 / 255**. The legal cluster starts on the 599 stop and its last
label ends at 1650 — the column's right edge.

They are declared in `fr`, so they hold that ratio at any width: below the
~1260 crossover the shell is capped by the window rather than by 86.25rem
(globals.css), and fixed columns would leave the last one narrower than the
social row's 246 with the fourth tile hanging off the side of the page.

**The footer does not use `SHELL`.** Every section above puts a 20 gutter
*inside* its 1380, so its text runs 290..1630 — 1340 of content. This frame does
not: it runs 270..1650, the full 1380, and its 1380-wide rule proves it. Forcing
it into SHELL compressed every horizontal stop by 1340/1380 = 2.9%, which showed
up as the legal row's gaps landing at 42.2 instead of 48. The box is therefore
`86.25rem + 2 * var(--gutter)` wide with the gutter as padding: 1380 of content,
and the gutter still protecting the window edge below the crossover.

That also lines the footer up with the **header bar** rather than with the
section text — the bar is a fixed 1386 at 1920 (`SiteHeader`), i.e. 267..1653,
so the design's footer sits 3px inside it. The two agree; it is the sections in
between that are inset.

### Rows built on stops, not gaps

The trust row and the legal row both place their items on the export's own x
positions rather than spacing them:

| Row | Stops from the content edge |
| --- | --- |
| Trustpilot | star 0 · "Trustpilot" 32.89 · the score 134 |
| Legal | 599 · 770 · 994 · 1164, in tracks of 171 / 224 / 170 / 216 |

This matters because **Figma's text boxes are wider than the rendered
advances** — its box for "Trustpilot" is 95.1 where Poppins sets it 92.3, about
2.8 of trailing air the glyphs do not fill. Measure a gap from the box edge and
the next item lands ~2.6 right of the design; measure from the ink and the box
numbers stop agreeing. Stops sidestep it: every item starts exactly where the
design starts it, and the leftover shows up in the gaps instead (the legal row
renders 49.5 / 48.6 / 50.1 against the design's 48 / 48 / 49, with its last
label ending on 1378.9 against 1380).

The legal links carry `whitespace-nowrap`. The last track is the tightest — 216
for a label that sets 214.9 — and a wrap there is not a small error: it doubles
the row and takes the whole footer from 425 to 443.

### Line height

Figma reports each text layer's height as its **ink** box, not its line box:
21px Regular comes back 15 tall, 26px Medium 19, 18px 13, 24px 17 — all ≈0.71em,
which is Poppins' cap height. So the export's `top` values are cap-box centres.

The build sets `leading-none` everywhere, making each box exactly its font-size
tall, and centres that on the design's number. Measured against the real font
(canvas `TextMetrics`), the ink centre then sits **0.15–0.49px above** the line
box centre at 1920 scale — so centring the line box puts the ink within half a
pixel of the design. That is why gaps derived by subtracting box edges disagree
with the design while the centres match exactly: an inline element's rect is the
font's em box (~1.39em in Poppins), which is neither the line box nor the ink.

### Two things that differ between the frames

Not variants of one value — the artboards genuinely disagree, so both are stored
and each frame renders its own (`src/lib/content.ts`):

| | Phone `4167:278` | Desktop `4167:280` |
| --- | --- | --- |
| First column head | PRODUCT | **PRODUCTS** (node `4134:627`) |
| Legal order | Money-Back · Terms · Refund · Privacy | Privacy · Terms · Refund · Money-Back |
| Copyright | "Copyright 2026, All Rights Reserved" | "Copyright © 2026 All Rights Reserved" |
| Address colour | `#8E8E8E` | `#808080` |

Everything else was checked element by element against the export — every font
size, weight and colour in the desktop footer matches it — so this table is the
complete list, not a sample. The social marks are the one thing shared: the
supplied vectors sit 30.67 tall in a 46 tile where the desktop group has them
30, a 2% difference that is not worth a second copy of the artwork.

The desktop order is not an inference: it is that node's x positions, 869 / 1040
/ 1264 / 1434, and the reference screenshot reads the same way. Both orders index
the SAME link objects, so copy and href changes land in both.

### Vertical rhythm

Centre lines from the export: heads at 74.5 · field top 109 (60 tall) · star
top 191 · **rule at 281.25** · bottom bar centre 353.5 · bottom edge **425**.
Link rows step 48 (128.5, 176.5). The built footer measures 425.2 with its bar
centred on 353.7 — that agreement is the check on the whole stack.

Watch the `<li>` strut: `leading-none` on a link alone does not shrink its row,
because the list item's own line-height sets the line box. The legal row stood
27 tall instead of 18 and pushed both the bar's centre and the footer's bottom
edge 9 low until `leading-none` went on the `<ul>`.

### What the screenshot pass got wrong

Kept as a record of how far a careful reading of a JPEG actually gets — close
enough to look right, wrong in every value that matters:

| | Read off the shot | Figma |
| --- | --- | --- |
| Band | the page's black | `#121212` |
| Heads / gift line | 25 / 24 SemiBold | **26 Medium**, both |
| Field | 285 × 52, radius 8, transparent + a white-20% border | 284 × 60, radius 10, filled `#222222` |
| Button | 138 × 52, the three-stop house gradient | 143 × 60, **flat** `#6E54B5` |
| Link colour | `#9E9E9E` | `#808080` |
| Rule | white at 20%, y 291 | `#808080`, y 281.25 |
| Social tiles | 42, radius 12, gap 24 | 46, radius 10, gap 20.67 |

The type sizes solved from advance widths held up better than the boxes: 18 and
21 were exact, 25-for-26 and 24-for-26 the only misses.

Two more were found only after the first Figma pass, by measuring the built
footer's **gaps** rather than its positions: the legal row was 42.2 where the
design says 48 (the SHELL compression above), and the score sat 2.6 right of its
stop (the text-box-vs-advance gap above). Positions agreeing does not prove gaps
agree — check both.

### The capture still has no provider

**No email provider has been chosen** (still true 2026-08-19), and there is no
server to post to. A form that silently discards submissions is worse than no
form: visitors believe they subscribed and never hear back.

So the design's field and button are both rendered — the design has them, and
this is a 1:1 — but with `NEWSLETTER_ACTION` (`src/lib/site.ts`) still null the
form carries no `action` and the Redeem control is a **link to the booking
anchor** rather than a submit button. Identical to look at; it simply cannot
swallow an address.

Set `NEWSLETTER_ACTION` to the provider's own hosted form URL (Mailchimp /
ConvertKit / Beehiiv / Loops) and the same markup becomes a real POST with no
other edit. Never point it at a local endpoint.

## Footer — the phone artboard, measured

Figma `cHPZeWJ00RoH44yy1AkW9P`, node **`4167:278`** ("Footer phone"), 375 x 977
on **#121212**. Pulled 2026-08-19 with one `get_design_context` call — these
numbers exist so the next session does not have to spend another (budget is
6/month, CLAUDE.md). The desktop side of `SiteFooter` is measured separately,
off a reference screenshot; there is still no desktop footer FRAME in the file.

One centred **293** column, i.e. a **41** gutter at 375. Everything is centred,
including the link lists.

### Revised 2026-08-28 (Žilvinas, from the updated frame)

The block below supersedes the 293-column geometry above and the table rows it
names. Everything else on that table still stands.

The first four numbers are HIS, read off the frame; the rest are derived from
the same screenshot by scale — the plate measures 898 screenshot px for the
375 frame, so 1 design px is 2.395, and his 15 gutter comes back as 15.4 on
that scale, which is what makes the others trustworthy.

| | |
|---|---|
| Side gutter | **15** — the site's own `--gutter`, not the footer's old 41. The content column is **345**. |
| Plate top → first block | **39** (his `pt`; the mystery-gift capture above it is off, so this is the gap to whatever leads) |
| Social tile | **50** square, radius **12**, fill **#222222**, plus a **1px inside stroke**: linear, top to bottom, **#222222 0% → #666666 100%** |
| Social glyphs | all **white** |
| Link groups | **left-aligned**, and each is TWO columns. The second starts at **215** of the 345 — the same stop for every group, so it is a tab stop, not the width of what happens to sit left of it. |
| Group order | PRODUCT · **LEGAL** · COMPANY · CONTACT — legal moves up between the first two |
| Legal fill | column-major: Money-Back / Terms down the left, Refund / Privacy down the right. `FOOTER.legal` is already in that order. |
| Type | the white heads are Poppins **Medium 18**; ALL the small grey type — column links and the address alike — is Poppins **Regular 15**. The address was 18 on the earlier frame. |
| Trustpilot row | "Trustpilot" **16 Regular**, the score **22 SemiBold**, and **5** between all three boxes — star → word → score. The frame's star-plus-word group measures **106.42** = 22.66 star + 5 + the word, which is what proves the 5 is box-to-box. It was 10 and 15. |
| Copyright | Poppins **Regular 14**, centred, **20** under the social tiles |
| Plate bottom | **20** under the copyright |
| Title → first link | **25** — his direct read of the box gap, and it supersedes the 20 derived from the frame's 38 cap-top pitch. The two differ because Figma's text boxes are not font-size tall the way `leading-none` makes ours. Applies to CONTACT → the address as well. |
| Link → link | **20** (36 cap-top to cap-top) |
| Group → group | **36** (52 from the last link's cap-top to the next title's) |

The gift block, the Trustpilot row, the social row and the copyright stay
CENTRED. Only the four link groups set from the column's left edge.

The right column is **130** for a label that sets ~122 ("Agency Services"), so
the links carry `whitespace-nowrap` — the same guard the desktop legal row has.
A wrap there is not cosmetic: the row doubles and every group below it drops 16.

The 50-tile and its stroke are the PHONE's. Desktop node `4134:653` still draws
46-squares at radius 10 with no stroke, so the ring is switched off from md up;
if that frame gained the same treatment, one class in `SiteFooter` turns it on.

The frame positions every string absolutely, so its numbers are CENTRE-to-CENTRE.
The build rebuilds them as flow with `leading-none`, which makes a text box
exactly its own font-size tall, so a gap is `centre_distance - (size_a + size_b)/2`.
**The lists need `leading-none` on the `<ul>`, not just the `<a>`** — the line
box is set by the block's strut, and with the strut at 1.5 the link pitch came
out 45 instead of 37.

| | |
|---|---|
| "Want a mystery gift?" | Poppins Medium 22, white, box top **48** |
| Email field | 293 x 44, radius 10, **#222222**, 16 Regular, placeholder white 50%, 15 left inset, top **85** |
| "Redeem" | 293 x 44, radius 10, flat **#6E54B5**, 16 Medium white, top **139** (10 under the field) |
| Trustpilot row | star 22.66 **#6E54B5**, ~10 gap, "Trustpilot" 16 Regular, ~15 gap, score 22 SemiBold — row top **201** |
| Group titles | 18 Medium white, upper-case: PRODUCT **279.5**, COMPANY **421.5**, LEGAL **526.5**, CONTACT **742.5** (centres) |
| Group links | 16 Regular **#808080**. Title→first link **42.5**, link→link **37**, last link→next title **62.5** (centres) |
| Contact address | 18 Regular **#8E8E8E** — deliberately NOT the links' #808080 — centre **785** |
| Socials | four 42-squares, radius 12 on #222222, **20** apart, row top **846** |
| Copyright | 14 Regular white 50%, centre **918**. **No rule above it** on the phone |
| Frame | ends at **977** |

Icons are the supplied vectors, not redrawn: `~/Documents/{instagram,linkedin,
tik tok,facebook} logo.svg` (28x28, 24x23, 23x28, 28x28) and `trustpilot
star.svg` (23 square, #6E54B5). They are inlined in `SiteFooter` with
`currentColor` so the tile's hover inversion carries the glyph, and sized by a
share of the TILE height so each keeps its own aspect ratio. Facebook is the one
with a knockout — a disc in `currentColor` with the "f" cut out of it in
`var(--tile)` — so the letter survives the inversion either way round.

The deck now matches the artboard verbatim (Žilvinas 2026-08-19): the group is
PRODUCT not PRODUCTS, the legal order is Money-Back / Terms / Refund / Privacy,
and the copyright reads "Copyright 2026, All Rights Reserved" — comma, no (c).
The desktop bottom bar renders the same `FOOTER.legal` array, so it took the
phone's order with it.

The legal links are rendered TWICE — a `md:hidden` group in the column stack for
the phone, and the `hidden md:block` cluster in the desktop bottom bar. They sit
in different containers, so CSS order cannot move one to the other; the hidden
copy is `display:none` and never reaches the a11y tree.

## Non-negotiables from CLAUDE.md

- `output: 'export'` — no server. No API routes, route handlers, server
  actions, `middleware.ts`/`proxy.ts`, `getServerSideProps`, ISR, or Supabase.
- next/image optimization is **off**. Every image needs explicit `width` and
  `height`, WebP source, `loading="lazy"` below the fold, `loading="eager"` +
  `fetchPriority="high"` for the hero.
- `metadata` export with **absolute** OG image URLs.
- JSON-LD: Organization + WebSite.
- `app/sitemap.ts` and `app/robots.ts`.

## Still to do

- [ ] Confirm the three unnamed case-study brands
- [ ] Client logo SVGs — Holo's wordmark is live text in Figma, not an asset
- [ ] Choose the email provider for the footer capture — set
      `NEWSLETTER_ACTION` in `src/lib/site.ts` and the form starts posting
- [ ] Mobile artboard was not pulled from Figma — verify breakpoints by eye
- [ ] Rename assets from machine names as sections are built
