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
  <section>  hero            → h1 "Your Path to $100M."
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

They are declared in `fr`, not rem. Two reasons, and the second is the
important one:

1. Below the ~1260 crossover the shell is capped by the window rather than by
   86.25rem (globals.css). Fixed columns leave the last one narrower than the
   social row's 246 and the fourth tile hangs off the side of the page.
2. `SHELL` puts a 20 gutter **inside** its 1380, so the site's real content box
   is 1340. In `fr` the stops land at 580 / 883 / 1089 — the design's
   proportions inside the site's actual column. That 2.9% compression is
   deliberate: the alternative is a footer whose text starts 20 left of every
   section above it, which reads as a mistake at a glance.

The bottom bar is its own two-region grid, `599fr 781fr`, with the legal links
`justify-between` inside the second. That is what holds **both** of the design's
alignments at once — type does not compress with the column, so a fixed 48 gap
could only keep one end flush. Here the gaps absorb the difference.

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
