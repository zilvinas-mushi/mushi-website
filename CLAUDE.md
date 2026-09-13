# Mushi marketing site

Static marketing site for mushi.agency. Deployed to Cloudflare Pages.

## Hard constraints
- Next.js with `output: 'export'`. There is NO server.
- Never add: API routes, route handlers, server actions, middleware
  (in Next 16 the `middleware.ts` convention is deprecated and renamed to
  `proxy.ts` — neither is allowed), `getServerSideProps`, ISR, or Supabase.
- If a feature seems to need a server, use a third-party endpoint instead
  (email capture goes to an email provider, scheduling is an embed).
- next/image optimization is off. Use explicit width/height, WebP sources,
  lazy-load below the fold, eager-load the hero.

## Nothing paints half-built
**A visitor must never watch this site assemble itself.** No headline on flat
black while the hero's lighting is still on the wire, no fallback face swapping
to Poppins, no artwork appearing a layer at a time. Until the first screen is
finished, what is on screen is the page's own black and nothing else.

The mechanism is the **paint gate**: `PaintGate.tsx` plus the gate block in
`globals.css`. `.page-shell`'s children are `opacity: 0` until `<html>` carries
`data-ready`, and the gate sets it once fonts, every eager `<img>` (decoded,
not merely loaded) and every `[data-await-bg]` CSS artwork are ready — then the
page cross-fades in over 400ms.

When you build anything new:
- Artwork that is a **CSS background** above the fold gets `data-await-bg` on
  its element. An `<img>` needs nothing — eager ones are picked up
  automatically, lazy ones are below the fold and must stay out of the gate.
- **Never widen the gate to below-fold assets.** The rail's 23 creatives, the
  videos, the case studies: those arrive as you scroll and have their own
  posters and placeholders. Gating on them would hold a blank page on the
  strength of bytes nobody has asked for yet.
- **Anything that animates or reveals on its own** (shaders, canvases, video
  first frames, scroll-driven fades) must start in its finished-looking state
  or stay invisible. Never a visible default that corrects itself a frame
  later.
- The gate's failure mode is **"shows early", never "never shows"**: the 4s
  timeout, the `.catch()` on every wait and the `<noscript>` override are all
  load-bearing. Do not remove one without replacing what it guarantees.
- This applies to **every page**, not just the home page — a new route's first
  screen is gated the same way or it is not finished.

## Interaction rules
- **Buttons invert their own colours on hover.** Foreground and background
  trade places — they do NOT swap schemes with a neighbouring button, and they
  do not merely lighten or darken.
  - purple background + white text → white background + purple text
  - white background + black text → black background + white text
  Applies to every button on the site, including the header CTA. Always
  transition the change so it cross-fades rather than snapping; keep a
  gradient background layer on both states so the fill can animate.
- **One exception: the "Trusted by 100+ brands" pill** in the testimonials
  section does NOT invert. At 594 × 62 it is a section control rather than a
  call to action, and flipping that much area to white flashes the whole block.
  Only its "View More" cluster reacts, and only with a small opacity fade.
- **A second exception: the two arrow pills** — the creatives "Yes" and the
  final card's "15 Minute Fit-Check". They do not go white. The violet and the
  arrow disc's #222222 trade places instead: on hover the button takes the
  disc's grey and the disc takes the button's violet, so the same two colours
  are still on screen in the same amounts, just swapped. Label and arrow stay
  white at both ends. Both pills also fly the arrow out along its diagonal and
  bring a second one in from behind it. All of it lives in one component —
  `ArrowDisc` in `Sections.tsx` — so the two can never drift apart.

## SEO is a priority
- One <h1> per page. Semantic sectioning elements.
- `metadata` export with absolute OG image URLs.
- JSON-LD Organization + WebSite schema.
- app/sitemap.ts and app/robots.ts.

## Design
**The design system already exists in `~/Projects/mushi-app`.** Check there
before writing any component. It has the real fonts (Dutch801 wordmark),
brand tokens, the floating header recipe, `TrustBadges`, `Logo`, and the
`animated-gradient-border` utility. Port from it rather than reimplementing
by eye — several things here were rebuilt wrong before that repo was checked.
Anything with a `<form action={...}>` or a `lib/supabase` import cannot come
across: no server here.

Read `design/README.md` before building any UI. It holds the measured tokens,
the semantic page outline, the authoritative copy deck, and the asset
inventory — everything the Figma file would tell you.

Figma access is capped at **6 MCP calls per month** on this account. Do not
spend one to re-read something `design/` already answers. If you do spend one,
write the findings back into `design/` in the same commit.

## Deployment
Cloudflare Pages, git-based. Build command `npx next build`,
output directory `out`.

## Related
The webapp at app.mushi.agency is a separate repo. Nothing in this repo
should try to share code with it.

@AGENTS.md
