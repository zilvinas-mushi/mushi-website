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

**Footer — desktop.** Measured off the reference screenshot supplied by
Žilvinas on 2026-08-19 (1366 wide, so 1366/1920 = 0.7115 to design px).
Implemented in `src/components/SiteFooter.tsx`. Its column heads read
PRODUCTS · COMPANY · CONTACT and the gift line is now "Want a **mystery**
gift?" — the older "welcome gift" wording and the PRODUCT/LEGAL/COMPANY split
below are superseded. COPY.md carries the current strings.

The scale reading is self-checking: the shot's content starts at 191 (the
design's 270 side margin) and its rule spans 973 (1380, i.e. the content
column). Both fall out of the same 0.7115.

### Type — solved, not eyeballed

Each string's measured width was divided by that same string's advance width in
the real Poppins at 100px (canvas `measureText`, all five weights loaded). The
clusters agree, and that agreement is what makes them trustworthy:

| Role | Strings measured | Solved | Taken as |
| --- | --- | --- | --- |
| Bottom bar — copyright + 4 legal links | 5 | 17.9–18.2 | **18** Regular |
| Column links + the contact address | 4 | 20.6–21.1 | **21** Regular |
| Column heads PRODUCTS/COMPANY/CONTACT | 3 | 25.1–26.1 | **25** SemiBold |
| "Want a mystery gift?" | 1 | 23.9 | **24** SemiBold |
| "Redeem" | 1 | ~24 | **24** Medium |
| Placeholder, "Trustpilot", the score | 3 | 19.1 / 19.5 / 20.7 | 20 / 20 / **21** |

### Boxes

| Part | Size at 1920 |
| --- | --- |
| Email input | 285 × 52, radius 8, transparent on a 1px white-20% edge |
| Input → button | 16 |
| Redeem button | 138 × 52, radius 8, the house CTA gradient |
| Trustpilot star | 21, `#6E54B5`, then 8 to the word, 14 to the score |
| Social tile | 42 × 42, radius 12, `#222222`, holding a 25 glyph |
| Tile pitch | 66 (42 + a 24 gap), four of them = 240 |
| Rule | 1px white at 20%, the full content column |

### Grid

The four columns are the design's own tab stops, not a gap: 0 / 592 / 904 /
1112 from the content edge, i.e. widths **592 / 312 / 208 / 268**.

They are declared in `fr`, not rem, for two reasons. Below the ~1260 crossover
the shell is capped by the window rather than by 86.25rem (globals.css), and
fixed columns leave the last one under the social row's 240 — the fourth tile
then hangs off the side of the page. And `SHELL` puts a 20 gutter *inside* its
1380, so the real content box is 1340: in `fr` the stops land at 575 / 878 /
1080, the design's proportions inside the site's actual column. That is a
deliberate 2.9% compression — the alternative is a footer whose text starts 20
left of every section above it, which reads as a mistake at a glance.

### Vertical rhythm

Top edge → 69 → the head row · input at 125 · trust row at 205 · rule at 291 ·
bottom bar 56 under it · 56 to the bottom edge. Total **429**, and the built
footer measures 431 — that agreement is the check on the whole stack.

### The capture still has no provider

**No email provider has been chosen** (still true 2026-08-19), and there is no
server to post to. A form that silently discards submissions is worse than no
form: visitors believe they subscribed and never hear back.

So the design's input and button are both rendered — the reference shows them,
and this is the desktop's 1:1 — but with `NEWSLETTER_ACTION` (`src/lib/site.ts`)
still null the form carries no `action` and the Redeem control is a **link to
the booking anchor** rather than a submit button. Identical to look at; it
simply cannot swallow an address.

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
| Contact address | 18 Regular **#8E8E8E**, centre **785** |
| Socials | four 42-squares, radius 12 on #222222, **20** apart, row top **846** |
| Copyright | 14 Regular white 50%, centre **918**. **No rule above it** on the phone |
| Frame | ends at **977** |

Two knowing differences from the artboard, both content rather than layout:

- The artboard's legal order is Money-Back / Terms / Refund / Privacy; the deck
  (`FOOTER.legal`) is the reverse-ish order the desktop bar uses. One array
  feeds both, so the phone group follows the deck.
- The artboard says PRODUCT, the deck says PRODUCTS.

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
