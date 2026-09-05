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
<footer>            email capture, link columns, socials
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

**Footer** — the design shows a "Want a welcome gift?" email capture. **No email
provider has been chosen yet** (confirmed 2026-07-28), and there is no server to
post to.

A form that silently discards submissions is worse than no form: visitors
believe they subscribed and never hear back. So the input is **not** rendered
until a provider exists. The block keeps its layout and copy, with the CTA
pointing at the fit-check booking instead.

When a provider is picked (Mailchimp / ConvertKit / Beehiiv / Resend…), swap in
its hosted form action — a single `action=` URL on the form element. Everything
else is already in place. Never point it at a local endpoint.

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
- [ ] Choose the email provider for the footer capture
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
