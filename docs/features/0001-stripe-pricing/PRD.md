---
status: testing
created: 2026-10-04
last-updated: 2026-10-04
last-updated-by: Zilvinas Aleksa
---

# 0001 — Stripe pricing · PRD

The PRD itself is the shared doc, so that it can be commented on:
<https://claude.ai/code/artifact/ab0e9724-a024-4191-9426-97b830aaf523>

This file carries only what `/implement-prd` reads from disk: the status above,
the acceptance criteria by id, and the smoke scenarios. If the two ever
disagree, the doc wins and this file is the one to correct.

## Scope

Phase 1 of the doc: the catalog in Stripe test and live mode, the tests, the CI
gate. **No live money is taken.** Checkout (Phase 3) and entitlement plus
purchase-only accounts and the account-created email (Phase 2, in mushi-app)
are separate PRDs.

## Acceptance Criteria

- **AC1** — Test and live each hold product `mushi_templates` with exactly
  three active prices: 1000, 2400 and 6000 cents USD, recurring every month,
  every 3 months and every year.
- **AC2** — `npm test` passes locally with all three layers (parity, test-mode
  payments, live catalog).
- **AC3** — Changing any plan figure in `content.ts` alone, or in `pricing.ts`
  alone, fails the suite.
- **AC4** — Running `apply` a second time creates nothing.
- **AC5** — CI is red when a Stripe key is missing on main.
- **AC6** — The built site carries no Stripe code or key in `out/`.
- **AC7** — No charge, customer or subscription exists in live mode after
  rollout.

## Smoke Scenarios

1. **Catalog, test mode** — `npm run stripe:check` reports the product and the
   three prices with their amounts and intervals, and zero differences.
2. **Catalog, live mode** — `npm run stripe:check -- --live` reports the same,
   with `livemode: true`.
3. **The site is untouched** — `npx next build` succeeds, `/templates` in
   `out/` still renders "Pick your plan" markup's Buy links to
   `https://app.mushi.agency`, and `out/` contains no `sk_`, `rk_` or `whsec_`
   string and no `stripe` SDK code.

## Deferred & Risks

See "Risks and open decisions" in the doc: VAT, USD settlement, how hard the
gate is, subscription vs ownership in the app, the sheet's promises, the
statement descriptor.
