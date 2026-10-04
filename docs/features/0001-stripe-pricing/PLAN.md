# 0001 — Stripe pricing · PLAN

- **PRD:** [`PRD.md`](./PRD.md) (canonical text in the linked doc)
- **Updated:** 2026-10-04

## Approach

`src/lib/pricing.ts` states what is billed. `stripe/catalog.ts` compares that
with Stripe and creates what is missing — it never edits, archives or deletes.
Vitest holds the site copy, the catalog and Stripe to each other.

Nothing in `stripe/`, `scripts/` or `tests/` is imported by the app, so the
static export gains no code and no key. `stripe` and `vitest` are
devDependencies.

**Two transports, one client.** Everything talks to Stripe through the
official SDK. With `STRIPE_TEST_KEY` / `STRIPE_LIVE_READONLY_KEY` set (CI) the
SDK makes ordinary HTTPS calls. With no key set (a developer's machine) the
SDK's fetch is routed through the logged-in Stripe CLI, so nobody keeps a key
on disk. CI can never take the CLI path: there a missing key is a failure.

## File Structure

| Path | Change |
| ---- | ------ |
| `src/lib/pricing.ts` | new — product, plans, lookup keys, amounts, intervals |
| `stripe/client.ts` | new — SDK client for a mode, from a key or the CLI; mode guard |
| `stripe/cli-fetch.ts` | new — `fetch` implemented on the Stripe CLI |
| `stripe/catalog.ts` | new — `inspectCatalog`, `applyCatalog` |
| `scripts/stripe-catalog.ts` | new — `check` / `apply` [`--live`] |
| `tests/pricing.parity.test.ts` | new — layer A |
| `tests/secrets.test.ts` | new — layer A, no secret-shaped strings in tracked files; nothing under `src/` imports the SDK |
| `tests/stripe.client.test.ts` | new — the read-only guard and the CLI transport, no network |
| `tests/stripe.gate.test.ts` | new — CI with no keys exits non-zero; the workflow step cannot be skipped |
| `tests/stripe.catalog.test.ts` | new — layers B and C, catalog in each mode |
| `tests/stripe.payments.test.ts` | new — layer B, real test-mode payments |
| `tests/helpers/stripe.ts` | new — the client for a mode, or the reason to skip |
| `stripe/access.ts` | new — key vs CLI login, and the rule that a missing key fails on CI |
| `tests/stripe.access.test.ts` | new — that rule |
| `tests/stripe.diff.test.ts` | new — the comparison and the creates-only rule, no network |
| `vitest.config.mts` | new |
| `package.json` | edit — `test`, `stripe:check`, `stripe:apply`; devDependencies |
| `tsconfig.json` | edit — excludes `tests/`, `stripe/`, `scripts/`, so a type error in a test cannot fail the Cloudflare build |
| `tsconfig.tools.json` | new — type-checks those, with `allowImportingTsExtensions` (Node runs the script's `.ts` directly) |
| `.github/workflows/ci.yml` | edit — the gate, and the daily run |

## Phases

### Phase 1 — Catalog and parity (layer A)

- [x] `tests/pricing.parity.test.ts` written first and seen to fail.
- [x] `src/lib/pricing.ts`.
- [x] `tests/secrets.test.ts`.
- [x] `vitest.config.mts`, `npm test`.

### Phase 2 — Sync script and the catalog in test mode

Depends on Phase 1.

- [x] `tests/stripe.catalog.test.ts` written first; fails because test mode is empty.
- [x] `stripe/cli-fetch.ts`, `stripe/client.ts`, `stripe/catalog.ts`, `scripts/stripe-catalog.ts`.
- [x] `npm run stripe:apply` in test mode; `npm run stripe:check` clean.
- [x] `apply` a second time creates nothing (AC4).

### Phase 3 — Real payments in test mode (layer B)

Depends on Phase 2.

- [x] `tests/stripe.payments.test.ts`: first invoice, renewal by test clock,
      declined card, Checkout Session, cleanup.

### Phase 4 — Live catalog (layer C)

Depends on Phase 3 being green. **Outward-facing: one live write.**

- [x] `npm run stripe:apply -- --live`; `npm run stripe:check -- --live` clean.
- [x] Layer C green.
- [x] No customer, charge or subscription in live (AC7).

### Phase 5 — CI gate

Depends on Phase 4.

- [x] `ci.yml`: `npm test` in the `check` job, the missing-key rule, the daily run.
- [x] `STRIPE_TEST_KEY` and `STRIPE_LIVE_READONLY_KEY` set in GitHub (needs the
      two restricted keys from the Dashboard — only a person can create them).
- [x] First run on main green (52e1499, run 37214339081, 2026-10-04: all 185 tests ran with both keys, none skipped).

## Traceability

| Id | Test | Tier |
| -- | ---- | ---- |
| AC1 | `stripe.catalog.test.ts` › each mode › product / each plan / no strays | Stripe test + live (read-only) |
| AC2 | whole suite | all |
| AC3 | `pricing.parity.test.ts` (every figure derived from the catalog and compared with the copy) | no network |
| AC4 | `stripe.catalog.test.ts` › running apply again creates nothing; `stripe.diff.test.ts` › applyCatalog | Stripe test + no network |
| AC5 | `stripe.access.test.ts` › on CI (the rule); `stripe.gate.test.ts` (a real run with no keys exits 1; the step has no `if:` or `continue-on-error`) | no network |
| AC6 | `secrets.test.ts` (no secret in tracked files; nothing in `src/` imports the SDK or the tooling) + the CI step "The export carries no Stripe secret" over `out/` | no network |
| AC7 | rollout check, not a standing test (it stops being true the day checkout opens): live held 0 customers, subscriptions, charges, payment intents, invoices and checkout sessions before and after `apply --live` on 2026-10-04. The tests' live client refuses every non-GET (`stripe/client.ts` `readOnly`). | Stripe live (read-only) |

## Smoke Scenarios

1. `npm run stripe:check` — passed 2026-10-04: product + 3 prices, 0 differences.
2. `npm run stripe:check -- --live` — passed 2026-10-04: same, `livemode: true`, 0 differences.
3. `npx next build`, then the export check exactly as `ci.yml` runs it — passed 2026-10-04: no secret-shaped string and no `api.stripe.com` in `out/`; `out/templates.html` still links to `app.mushi.agency`.

## Deferred work

- The two GitHub secrets (Phase 5) wait on restricted keys from the Dashboard.
  When they are added as Actions secrets, add them as Dependabot secrets too,
  or a Dependabot pull request will always be red.
- Everything in the PRD's Risks table, including risk 7: the payment step's
  "Total due today" shows the per-month figure, not the charge.
- [deferred] A declined RENEWAL (subscription goes `past_due`) is not tested.
  What happens then is Stripe's retry settings plus the app's webhook — it
  belongs with Phase 2, where access is taken away.
- [deferred] GitHub disables scheduled workflows on a repo with no activity for
  60 days; the daily drift check would stop without a sound. Fine while the
  repo is pushed to weekly; revisit if it goes quiet.
- [deferred] The red gate marks the commit but does not stop Cloudflare Pages
  (PRD risk 3).

## Launch addendum (2026-10-04, evening)

Checkout went live the same day, ahead of the PRD's Phase 3, through Stripe
Payment Links (`PAYMENT_LINKS` in `src/lib/pricing.ts`): the sheet's Buy goes
to the plan's link and Stripe returns the buyer to `/thank-you`. The webapp
shipped a minimal webhook (account + library on a paid checkout) at the same
time; the full feature is `mushi-app/docs/features/0006-purchase-creates-account`.

Verified by hand against Stripe, both modes: three active links, each selling
exactly one of the catalog prices (lookup key, amount, interval, quantity 1),
each redirecting to `https://mushi.agency/thank-you?session_id={CHECKOUT_SESSION_ID}`.
`tests/checkout.links.test.ts` pins the links, the sheet's hand-off and the
Thank You page offline.

- [deferred] The same check against Stripe in CI. It needs **Payment Links:
  Read** added to both CI keys; until then a link edited in the Dashboard (its
  price, its redirect) is not noticed by the daily run.
- [deferred] `/thank-you` only checks that a `session_id` is present. Asking
  the webapp whether that session was paid waits on 0006's status endpoint.
- [deferred] The account-created email, access ending with the subscription,
  and VAT — all in 0006 or the PRD's Risks.

## Review record (2026-10-04)

Two fresh-context reviews, both read-only: a code review with a silent-failure
hunt (16 findings) and a test-integrity audit. Fixed: the `STRIPE_API_KEY`
override of the CLI's mode check; no pinned account; live apply without
preview or confirmation; no switch back to test mode on Ctrl-C; the CLI
transport could not time out; `currency_options` unwatched; the export grep
passing when `out/` is missing; schedule and push sharing a concurrency group;
transport errors retried and hidden; fixed idempotency keys; transport edge
cases; `cliLogin` reading every failure as "logged out"; the renewal test's
month-end arithmetic (it would have gone falsely red on 2026-10-31); test
clocks leaking when setup throws; unpinned copy (`mobileCta`, `defaultId`,
`perMonth`, the Showcase heading); the unread `readCatalog` error path; the
untested `readOnly` guard and CLI transport. 21 of 21 hand-run mutants of the
figures and guards are killed by the offline tests.
