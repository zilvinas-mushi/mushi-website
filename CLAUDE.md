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

## SEO is a priority
- One <h1> per page. Semantic sectioning elements.
- `metadata` export with absolute OG image URLs.
- JSON-LD Organization + WebSite schema.
- app/sitemap.ts and app/robots.ts.

## Deployment
Cloudflare Pages, git-based. Build command `npx next build`,
output directory `out`.

## Related
The webapp at app.mushi.agency is a separate repo. Nothing in this repo
should try to share code with it.

@AGENTS.md
