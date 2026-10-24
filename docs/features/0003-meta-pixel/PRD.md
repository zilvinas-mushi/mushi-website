---
status: testing
created: 2026-10-24
last-updated: 2026-10-24
last-updated-by: Zilvinas Aleksa
---

# 0003 — Meta Pixel and Conversions API · PRD

Draft, from Noah's list of 2026-10-23 ("liko tik Meta Pixel"). Not yet agreed:
the open decisions at the end need Žilvinas before `/implement-prd` reads this.

## What was asked

Pixel ID `1264043475248995`, dataset "Mushi" (Žilvinas invited to it). Four
events, each sent **twice** — by the browser pixel and by the Conversions API
(CAPI) from a server — with the **same `event_id`**, so that Meta deduplicates:

| Event | When | Where it can be known |
| --- | --- | --- |
| `Schedule` | a call is booked | Calendly only (the booking happens on their page) |
| `AddToCart` | the "Pick your plan" sheet opens | the site, browser |
| `InitiateCheckout` | Buy now is pressed with an email | the site, browser (Stripe's hosted page takes the email — see D2) |
| `Purchase` | the **first** payment, not renewals | the webapp's Stripe webhook, and `/thank-you?session_id=…` |

## The two constraints this site puts on it

1. **mushi.agency has no server** (CLAUDE.md). CAPI needs an access token
   that must never reach the bundle, so every CAPI call is made by the webapp
   (app.mushi.agency), which already receives the Stripe webhook. The site
   sends the browser half, and for the browser-known events it also POSTs the
   event (`event_name`, `event_id`, `event_time`, `fbp`/`fbc` cookies, the
   page URL, hashed email if there is one) to a small relay on the webapp,
   which forwards it to CAPI. The relay is a mushi-app PRD (its #3).
2. **Nothing paints half-built and the page never lags** (CLAUDE.md). The
   pixel script (~100 KB) is loaded after the paint veil has lifted and the
   below-fold pictures are through, never in `<head>`; it must not move the
   Lighthouse mobile score under 90 (`npm run pages:check` holds it). The
   `fbq` queue stub goes in first so events fired before the script arrives
   are not lost.

## How each event is fired

- **`event_id`**: `crypto.randomUUID()` in the browser for the three browser
  events, sent with both halves. For `Purchase` the id is the Stripe Checkout
  Session id (`cs_…`) — the webhook has it, `/thank-you` has it in the URL, so
  the two halves meet without talking to each other.
- **`AddToCart`** — in `PlanSheet` where it opens (`root.setAttribute("data-sheet")`),
  once per open; `content_ids` = the three plan lookup keys, `currency` the
  sheet's, `value` the chosen plan's amount.
- **`InitiateCheckout`** — in the sheet's Buy press, before the Payment Link
  is followed; `content_ids` = the chosen plan, `value`, `currency`. Email:
  see D2.
- **`Purchase`** — server half from the webapp's webhook on
  `checkout.session.completed` (`mode: subscription`, first invoice only —
  `invoice.billing_reason === "subscription_create"`, never `subscription_cycle`),
  with the buyer's hashed email, `value`, `currency`, `event_id = session id`.
  Browser half on `/thank-you` from the `session_id` in the URL, same id,
  `value`/`currency` from… see D3.
- **`Schedule`** — Calendly's "invitee.created" webhook → the webapp → CAPI
  (server only, no browser half, so no `event_id` pairing needed); OR the
  Calendly embed on our page with its `calendly.event_scheduled` postMessage
  for the browser half. See D1.

## Acceptance Criteria

- **AC1** — Meta Events Manager "Test events" shows each of the four events
  once, with "Deduplicated" on the three that have two halves, when the
  flow is run against the live site with the test event code.
- **AC2** — `out/` carries the pixel ID and nothing else of Meta's: no access
  token, no dataset secret (`npm test` greps the export, like the Stripe gate).
- **AC3** — Lighthouse mobile on `/`, `/templates`, `/case-studies` stays
  above 90 with the pixel loading (`npm run pages:check`).
- **AC4** — A renewal invoice in Stripe test mode produces no `Purchase`.
- **AC5** — The pixel does not load, and nothing is sent, when the visitor
  has Global Privacy Control on, or the consent decision says no (D4).
- **AC6** — `Purchase` for one checkout session arrives at Meta with the
  same `event_id` from both halves (webhook log + browser network log).

## Decisions taken (2026-10-24, "add it there and merge")

- **D1 Schedule** — Calendly's `invitee.created` webhook → the webapp
  (`/api/calendly/webhook`) → CAPI. Server-only. Needs the subscription made
  by a person (mushi-app `docs/features/0007-meta-pixel`).
- **D2** — InitiateCheckout carries the email, hashed: the sheet's own
  payment step has it before Stripe does.
- **D3** — Purchase on `/thank-you` carries the value remembered from Buy in
  the same browser (`sessionStorage`); the server half always has it.
- **D4 Consent** — no banner. The pixel is skipped for Global Privacy Control,
  Do Not Track and automated browsers; everyone else, EU included, is
  tracked. **This is a legal call that stands open.**
- **D5** — `META_CAPI_TOKEN` in the webapp's Vercel env, set by Žilvinas.

## Where it lives

`src/lib/meta-pixel.ts` (the loader, the events, who is not tracked),
`layout/MetaPixel.tsx` (armed on every page), `checkout/PlanSheet.tsx`
(AddToCart), `checkout/StripePay.tsx` (InitiateCheckout),
`thank-you/PurchasePixel.tsx` (Purchase), `lib/checkout.ts` (the click's
cookies onto the session). The script loads after the paint gate and an idle
moment; `npm run pages:check` measures the page with it.

## Smoke Scenarios

1. Open the sheet on `/templates` → `AddToCart` in Test events, deduplicated.
2. Press Buy, pay with `4242…` in test mode → `InitiateCheckout` then
   `Purchase` (one each, deduplicated); `/thank-you` sends the browser half.
3. Trigger a renewal (Stripe test clock) → no `Purchase`.
4. Book a test call → `Schedule` once.
5. GPC on → no pixel script in the network log.
