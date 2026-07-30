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

## Interaction rules
- **Buttons invert their own colours on hover.** Foreground and background
  trade places — they do NOT swap schemes with a neighbouring button, and they
  do not merely lighten or darken.
  - purple background + white text → white background + purple text
  - white background + black text → black background + white text
  Applies to every button on the site, including the header CTA. Always
  transition the change so it cross-fades rather than snapping; keep a
  gradient background layer on both states so the fill can animate.

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
