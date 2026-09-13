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
| Trustpilot row | "Trustpilot" **16 Regular**, the score **22 SemiBold**, all three CENTRED on one axis rather than sharing a baseline (the frame's score box is 35 x 17 at an 80% line height — a 22 cap band centred in a 17 box; sharing a baseline instead lifts the number 2 and the star reads low beside it), and **5** between all three boxes — star → word → score. The frame's star-plus-word group measures **106.42** = 22.66 star + 5 + the word, which is what proves the 5 is box-to-box. It was 10 and 15. |
| Copyright | Poppins **Regular 14**, centred, **20** under the social tiles |
| Plate bottom | **20** under the copyright |
| Title → first link | **25** — his direct read of the box gap, and it supersedes the 20 derived from the frame's 38 cap-top pitch. The two differ because Figma's text boxes are not font-size tall the way `leading-none` makes ours. Applies to CONTACT → the address as well. |
| Link → link | **20** (36 cap-top to cap-top) |
| Group → group | **40** — his read of the box gap, like the 25 above. (Derived off the frame's cap-top pitch it came to 36; same box-vs-glyph discrepancy.) |

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

---

# Page structure — Templates (`/templates`)

Built 2026-09-02 from a supplied screenshot (see the Templates section of
COPY.md), not from Figma. Components live in
`src/components/TemplateSections.tsx`; the colour-burst background is
`.tpl-bg` / `.tpl-burst` in globals.css.

```
<header>            shared SiteHeader, CTA overridden to "Login" -> app.mushi.agency
<main>
  <section>  hero   → h1 "Your 8-Minute Shortcut to High-ROAS Ads"
                      badge chip, CTA "Take the Shortcut" -> app.mushi.agency
                      app-window mockup (aria-hidden) + category tiles (aria-hidden)
</main>             no footer, same as home
```

Notes:

- The app-window mockup is chrome + a 5-column grid of the home rail's
  creatives as 480x600 thumbnails (`public/images/templates/`, generated with
  sharp — regenerate via a crop at 4:5, quality 74, `position: attention`).
  Five columns at every width: it depicts a desktop app scaling as one object.
- Category tiles are emoji stand-ins, aria-hidden, hidden below xl, cropped by
  the viewport edge on purpose (same idiom as the home hero's stat panels).
- The header CTA override is `SiteHeader`'s `cta` prop; both variants keep the
  hover self-inversion rule from CLAUDE.md.
- NAV anchors became root-relative ("/#agency") so the shared header works
  from this page.

## Section — Difference (added 2026-09-03)

`TemplatesDifference` in TemplateSections.tsx, rendered after the hero
wrapper on the plain page background:

```
<section>  difference  → h2 "Not just another Template Library"
                         two comparison cards (competitors vs Mushi)
```

- Card visuals are crops from the reference screenshot; each crop's edges
  carry a sliver of card background, so the CSS card fills are matched to
  sampled values (#101010 / #7b54b5 with a #9a81d6 glow) and must move
  together with the images.
- The dark card's crop is masked to transparent at the bottom and the caption
  pulled up over the fade — reproducing the reference's caption-over-the-can
  layering without baking text into the raster.

## Section — Process (added 2026-09-03)

`TemplatesProcess` in TemplateSections.tsx, after Difference. An `<ol>` of
three gradient cards (gradients sampled from the reference, stored in
content.ts) with `.process-shot`-masked screenshot crops bleeding to the card
edges, a white chip over each visual, and black arrow discs pinned between
cards from md up (hidden when stacked on phones). Shares the
rule-and-diamond `SectionEyebrow` with Difference.

## Section — Inside (added 2026-09-03)

`TemplatesInside` in TemplateSections.tsx, after Process. Bento grid
(md: `1fr 1fr 1.2fr`, right card spans both rows, Trustpilot spans cols 1–2;
phones stack). No raster crops — memoji circles are emoji, industry chips
reuse TEMPLATES_PAGE.categories (deduped), laurel sprigs are inline SVG
ellipses, and the collage reuses the templates/tpl-*.webp thumbs.

## Section — Showcase (added 2026-09-03)

`TemplatesShowcase` in TemplateSections.tsx, after Inside. Heading in the
shell; the wall itself is full-bleed: a centred flex row of fixed-width
shrink-0 columns (per-column `marginTop` stagger from content.ts) inside an
overflow-hidden, fixed-height container — the viewport crops the edge
columns and the container crops the bottom, with a short mask fade so the
cut reads as intentional. Wall assets: `templates/wall-*.webp` (400x711,
sharp crops of the home-rail creatives; regenerate like the tpl-* thumbs).

### Showcase revision (2026-09-03, later)

Wall tiles replaced with the reference's own ads (`templates/show-*.webp`
crops) at the client's request. Layout reworked: four full columns stay
centred with overflow-crop; the design's edge FRAGMENTS are separate
absolute columns pinned flush to the viewport edges (square corners on the
cut side, hidden below md). The `wall-*.webp` crops were deleted.

## Section — Access (added 2026-09-03)

`TemplatesAccess` in TemplateSections.tsx, after Showcase — the page's
closing pricing block. Two comparison cards (dark #111 vs purple-ringed
plan with the .cta-card-style bottom glow) and the done-for-you banner
bridging to the agency. All CSS/emoji/inline-SVG; benefit-list glyphs live
in the AccessIcon map. Every button keeps the hover self-inversion rule,
including the outlined card CTA (transparent/white → white/black).

## Section — Comparison (added 2026-09-03)

`TemplatesComparison` in TemplateSections.tsx, after Access. One CSS grid
with explicit placement: full-width banded rows at z-0 (odd rows, #121212),
the purple Mushi column card spanning all rows above them (negative side
margins make it wider than its track), content at z-10, row-major DOM order.
Values come typed from content.ts (string = score/price, boolean = ✓/✕).

## Section — Team (added 2026-09-03)

`TemplatesTeam` in TemplateSections.tsx, after Comparison — the page's
closing section. One #141414 panel: two #1b1b1b person cards (88px portrait
crop + name + coloured role) over three h3-labelled paragraphs.

## Section — FAQ (added 2026-09-03)

`TemplatesFaq` in TemplateSections.tsx, after Team (last before the footer).
Native <details>/<summary> accordions — no JS, answers stay in the DOM for
crawlers (house pattern from the home testimonials). The page also emits
FAQPage JSON-LD built from the same TEMPLATES_PAGE.faq data, so the schema
and visible content cannot drift apart.

### Hero + eyebrow revision (2026-09-03, final artwork pass)

- Hero background = the supplied "Mask group" burst artwork verbatim
  (templates/hero-burst.webp, cover from top); the wrapper has no bottom
  padding so the background ends exactly at the MacBook's bottom edge.
- MacBook at max-w-[1010px] (~980px at 1440, per the final reference).
- Category tiles: 190px, radial-grey fill, supplied emoji artwork at 100px,
  UNDER the MacBook, centre-anchored via calc(50% - Npx) — wider screens
  reveal the outer Food and Drink tiles; 1440 clips them entirely.
- Every section eyebrow (SectionEyebrow) is now Poppins Regular 30px, 0%
  tracking, filled with the hero badge's purple->salmon gradient, per its
  Figma typography panel.

### Showcase revision 2 (2026-09-04)

The wall now ships as the design's own baked composition
(`templates/showcase-wall.webp`, from "showcase.png" 7680x5084) rendered as
one full-bleed image — stagger, edge cuts and black field are in the
artwork. The CSS column system (.tpl-wall*), the `show-*` tile crops and the
per-column content data were all removed.

### Process + Inside asset pass (2026-09-04)

- Process cards: the three gradient panels ship as real exports
  (`process-card-*.webp`), with the sampled CSS gradients kept as loading
  fallbacks. Step VISUALS are still the low-res screenshot crops — real
  exports for those remain wanted.
- Inside cards: memoji cluster + "Need help?" bubble, industry chip rows,
  and the dimmed collage are baked card backgrounds (`inside-*.webp`); the
  laurel is the real artwork applied as a CSS mask painted #221f26
  (`laurel-mask.webp`) so it reads on the dark card. The CSS-built emoji
  circles, chip rows, collage (and the `tpl-*` crops it used) were removed.

### Team portrait pass (2026-09-13)

The desktop portraits were height-driven (160 tall inside a 180-wide plate).
The crops are taller than wide (Noah 516x540, Urtė 549x520), so 160 tall is
only ~153 wide and the picture sat centred with ~13 of bare plate on either
side — the left one read as the shoulder being cut off short of the rounded
corner, which Figma does not show (Žilvinas 2026-09-13).

Now width-driven: the plate is 150 and the portrait spans it (`sm:w-full
sm:h-auto`), so the jacket reaches the corner. 150, not the old 180, because
filling 180 makes Noah 188 tall — a 62 pop over a 126 card, which clears the
outer panel's 32 pad and pushes his hair outside the panel. At 150 the pop is
31, which is what the artboard reads.

Desktop plate ramps were also the lighter pair (#8168d0/#4f3694 and
#c98a8c/#96494c); they now use the same stops the phone already had from the
Figma fill panel (#6e54b5 → #30254f, #d07678 → #4f2f30), so the plate no
longer changes colour across the sm–md band.

### Hero tile field goes proportional (2026-09-13)

The device already sizes itself off the height left under the text
(`(100svh - 444px) * 1.6` on AppWindow), but the category tiles were fixed at
410 / 600 / 160. On a short window — a 15" Mac with a bookmarks bar is the
case the client hit — the device shrank while the tiles stayed, so the lower
row ran out of the bottom of the section and the next section's black painted
over it.

The tile layer is now a size container (`.hero-tile-field`) and every number
in it is a share of the section's own height in `cqh`: rows at 44.37 / 64.94,
tile 17.32, gap 3.25, radius 2.81, label 1.73, emoji 9.09. Those are the old
pixel values over 924 — the section's height when the MacBook is at its 978
cap, which is the signed-off reference — so at that height they resolve back
to 410 / 600 / 160 / 30 / 26 / 16 / 84 exactly and come down together below
it. The lower row ends at 82.25cqh, so it cannot reach the section's bottom
edge at any window size.

cqh rather than a transform: `scale()` needs a unitless factor and CSS cannot
divide one length by another to produce one.

### Team portrait pass 2 (2026-09-13, same day)

Two corrections once the portraits filled their plates:

- `.team-photo`'s right-edge fade starts at 72%, which was fine when the
  picture sat narrow inside its cell but now lands in the middle of it — it
  was taking Urtė's right shoulder off into the card's black. From sm up the
  fade is 90% → 100%: enough to take the hard edge off the crop line, not
  enough to touch her.
- She sits further right in her plate than Noah does in his (Figma crop): a
  band of salmon runs down her left before her hair starts, where his jacket
  goes straight into the corner. `desktopShiftX: 32` on her entry only; the
  phone is untouched.

### Hero tile field, second pass (2026-09-13)

Centred on the DEVICE, not on the section (client 2026-09-13: "make those two
lines go in the middle of the computer picture"). The field renders inside
AppWindow's wrapper — `inset-y-0` so it is exactly the MacBook's height,
`w-screen` off the centre line so the rows still cross the viewport — and is
the size container. Shares of the device's 612 at the cap: rows 21.4 / 52.45,
tile 26.14, gutter 4.9, radius 4.25, label 2.61, emoji 13.73. The pair spans
57.2% of the height, so 21.4 is what centres it, at every window size.

The MacBook img takes `relative z-[1]`: the field is a positioned z-0 layer in
the same wrapper and would otherwise paint over in-flow content.

### Team portraits, third pass (2026-09-13)

The pictures are INSIDE the plate, and the reference proves it with the
rounded bottom-left corner (client, with the Figma crops). From sm up the
portrait box is pinned to the plate's left and right edges, so `desktopShiftX`
insets the left edge and draws the person NARROWER instead of pushing them out
over the card, and the img carries `rounded-bl-[14px]`. Only that corner: the
hair still has to clear the card at the top. Urtė's inset is the client's
measured 11, not the 32 first eyeballed from a screenshot.

### Hero tile size (2026-09-13, fourth pass)

The tile is `min(10.9vw, 35cqh)`. The vw term carries the artboard's
230-over-1920 down a notch: the ratio read straight off the artboard (11.98vw)
landed at 181 on the client's 1512 and they called it too big, so this puts it
at 165 there and 210 on a 1920 — between the old fixed 160 and the artboard's
own figure (client: "originally they were 230x230, scale them down
proportionally", then "a little bit too big now"). 35cqh is the ceiling — the pair plus its
gutter is 2.1875 tiles, which at 35 is 76.6% of the device's height, leaving a
margin above and below at any window size. A short window hits the ceiling
first, which is the case that used to run the lower row out of the hero; a
roomy one hits the vw and the tiles come up to the artboard's size instead of
staying at the 160 they were pinned to (client: "at 100% on a Mac they seem a
little bit small").

Everything else is a ratio of the tile, from the artboard's own 160: gutter
30, radius 26, top pad 20, label-to-art 8, label 16, art 84. The custom
properties sit on the ROW, not on the field — a container query unit used on
the container itself measures against that container's ancestor.

### Urtė is slid, not inset (2026-09-13, fourth pass)

Insetting her box drew her smaller than Noah; the reference has the two of
them at one size, she simply starts a little further in. The box is the
plate's full width with its left edge moved by `desktopShiftX`, so the 11 she
runs over on the right lands inside the picture's own 90–100% fade.

### Urtė reaches the edge (2026-09-13, fifth pass)

The remaining gap was in the asset, not the layout: see team-urte-v3 in
ASSETS.md. With the tighter cut she reaches the plate's left edge the way Noah
does, and `desktopShiftX` goes back to 0 — the 11 was only ever compensating
for the empty margin.
