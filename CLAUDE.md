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

The mechanism is the **paint gate**: `src/lib/paint-gate-script.ts`, an inline
`<head>` script, plus the gate block in `globals.css`. A fixed `.paint-veil`
in the page's own black covers the page until `<html>` carries `data-ready`,
and the gate sets it once fonts, every eager `<img>` (decoded, not merely
loaded) and every `[data-await-bg]` CSS artwork are ready — then the veil
fades out over 400ms. It is a cover over painted content, NOT content fading
in from `opacity: 0`: Chrome only records First/Largest Contentful Paint for
a fade-in once the fade has finished, which billed the whole 400ms to LCP.
It is INLINE and not a component for a reason: inside React it could not
start until the bundle had hydrated, which put the reveal — and Largest
Contentful Paint with it — seconds behind the artwork it was waiting for.
`PaintGate.tsx` is now only the thing that re-arms it on a route change.

The same script owns the other half of the bargain: **below the fold, nothing
is fetched until the first screen is done — and then all of it is, in order,
before anyone scrolls to it.** `loading="lazy"` does not deliver the first part
(Chrome's threshold runs to ~8000px on a slow connection) and a CSS background
cannot ask for it at all, so the URL is kept out of anything the browser will
fetch from — `data-src` on an image, `data-bg` + `background-image: var(--bg,
none)` on a background. Once the cross-fade has ended the script walks the
page top to bottom and loads every one, six at a time, each decoded before
the next (`warm()`); an IntersectionObserver lets whatever the reader gets
near jump the queue. Save-Data and 2G visitors keep the observer alone.

**A reader must never see an unloaded picture, or a card that is waiting for
one** (Žilvinas 2026-10-04: "either don't show anything when pictures are not
loaded or load everything beforehand", then "once I am in the page I can't
see, as a user, an unloaded image" — both halves are done). Pre-loading makes
the gap short; hiding makes it invisible:
- an element with `data-bg` is invisible, words and all, until its artwork
  and the pictures inside it have arrived and decoded, then fades in whole —
  so a deferred background belongs on the CARD, not on a layer inside it;
- every `article`, `li` and `figure` with a deferred `<img>` in it is held
  the same way by the script (`data-hold`), so **a card with pictures must be
  one of those three elements**;
- a deferred `<img>` in no card is simply not drawn until it has decoded.
**On a reload the first screen is wherever the browser restores the scroll
to**, not the top (Chrome before DOMContentLoaded, Safari after `load`). The
gate sweeps the viewport twice — when it starts and again just before the veil
lifts — and waits for every deferred picture in it until it is actually shown;
a zero-margin observer loads whatever is on screen from the start.

Do not leave a picture to `loading="lazy"` with a real `src`: nothing holds
it. The ceiling on every hold is 12s (`HOLD_MS`), for a line that has stalled.

When you build anything new:
- Artwork that is a **CSS background** above the fold gets `data-await-bg` on
  its element. An `<img>` needs nothing — eager (`priority`) ones are picked up
  automatically and lazy ones stay out of the gate.
- Artwork **below** the fold is deferred, and `Img` does it for you. A raw
  `<img>`, a `background-image` or a `mask-image` you write by hand does not:
  give it `data-src` / `data-bg` and add its no-JavaScript rule to
  `TemplatesBgFallbacks`, or it is on the wire before the first screen is.
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

## The page-quality gate
`npm run pages:check` (after `npx next build`; first time,
`npm ci --prefix tools/page-quality`) holds the built export to two things at
once, and CI runs it on every push:
- **Lighthouse mobile performance above 90** on `/`, `/templates` and
  `/case-studies` — the PageSpeed number, median of three runs.
- **No unloaded picture on screen, ever**: each page is scrolled top to bottom
  from the instant it is revealed, on a throttled line, at a laptop's width
  and a phone's.

They pull against each other — fetch less and the score rises, fetch late and
pictures pop in — so a change to images, loading or the paint gate is not
done until both pass. Never buy either by lowering image quality. A new page
goes into `PAGES` in `tools/page-quality/check.mjs`. `-- --url
https://mushi.agency` runs it against the live site.

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
  final card's "30 Minute Fit-Check". They do not go white. The violet and the
  arrow disc's #222222 trade places instead: on hover the button takes the
  disc's grey and the disc takes the button's violet, so the same two colours
  are still on screen in the same amounts, just swapped. Label and arrow stay
  white at both ends. Both pills also fly the arrow out along its diagonal and
  bring a second one in from behind it. All of it lives in one component —
  `ArrowDisc` in `Sections.tsx` — so the two can never drift apart.

## Payments
**What Mushi charges lives in one file, `src/lib/pricing.ts`.** Stripe is held
to it in test mode and live, and `content.ts` is held to it too — change a
price in one place only and `npm test` goes red. PRD and plan:
`docs/features/0001-stripe-pricing/`.

- **A Stripe price is immutable.** Changing one means a new price in
  `pricing.ts` taking over the lookup key; the old one is archived by a
  person. `npm run stripe:apply` only ever creates, and stops at the first
  thing that differs.
- **Code names lookup keys, never `price_…` ids** — ids differ between test
  and live.
- **Live is written by a person, on purpose:** `npm run stripe:apply -- --live`
  shows what it would create and does nothing without `--yes`. It goes through
  the Stripe CLI login for the account pinned in `stripe/access.ts`; there is
  no key that can write the catalog, and CI holds none that can move money.
- **Nothing under `src/` may import `stripe`, `stripe/`, `scripts/` or
  `tests/`.** The SDK needs a secret key and this site has no server. Only a
  publishable key may ever reach the bundle.
- **Checkout is live since 2026-10-04, through Stripe Payment Links** — one
  per plan and per mode, in `PAYMENT_LINKS` (`src/lib/pricing.ts`). The plan
  sheet's Buy goes to the chosen plan's link; Stripe hosts the payment and
  returns the buyer to `/thank-you`. The webapp's webhook creates the account
  from Stripe's notice of the payment. A live link is created by a person
  (`scripts/stripe-live-payment-links.sh`), never by a build or by CI.
- **`/thank-you` grants nothing.** It is static, unindexed, and bounces
  anyone without a `session_id`. Never make access depend on it.
- The sheet's own payment step (card fields) is unreachable until the webapp
  can hand it a Stripe session (PRD, Phase 3).
- `npm test` runs everything; without a key it uses the Stripe CLI login. On
  CI a missing key fails the run — never make that a skip.
- **Buy is instant on every plan, and `npm run checkout:check` is what says
  so** (after `npx next build`; CI runs it on every push). A real browser opens
  the sheet, picks each plan and presses Buy: the payment step is up within
  400ms, Buy never holds, no plan's Stripe form is built again. `npm test`
  only reads the sheet's source — it stayed green while a buyer who changed
  plan waited for Stripe a second time (2026-10-05). A change to
  `PlanSheet.tsx`, `StripePay.tsx` or `lib/checkout.ts` is not done until this
  passes. Each plan keeps its own `StripePay`, built off stage; never key one
  by the chosen plan. `-- --url https://mushi.agency` checks the live site.

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
