---
status: draft
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

## Open decisions (Žilvinas)

- **D1 — Schedule**: webhook (server-only, needs a Calendly plan with
  webhooks — Standard or above) or the embed (changes how Book a Call works:
  the calendar opens on our page instead of Calendly's). The webhook is the
  smaller change to the site and the only one that cannot be faked.
- **D2 — "with an email"**: the sheet's own card fields are unreachable
  (CLAUDE.md), so Buy goes to Stripe's hosted page and the email is typed
  there, where we cannot see it. Either `InitiateCheckout` goes without the
  email (hashed email only on `Purchase`, from the webhook), or Stripe's
  `customer_email` is collected on our side first. Recommendation: without.
- **D3 — Purchase value on `/thank-you`**: the page is static and only has the
  session id. Either the browser half carries no value (Meta takes the value
  from the server half after dedup — it does, the server event wins), or
  `/thank-you` asks the webapp for the session's amount. Recommendation: no
  value in the browser half.
- **D4 — Consent**: EU visitors (Lithuania included) need consent before a
  Meta cookie is set. The site has no consent banner. Options: a banner;
  or fire only with Meta's Limited Data Use / no cookies for EU; or treat
  the dataset as US-only. This is a legal call, not a technical one.
- **D5 — Where the CAPI token lives**: webapp env (`META_CAPI_TOKEN`), set by
  Žilvinas through his `!` one-liners like the Resend key was.

## Smoke Scenarios

1. Open the sheet on `/templates` → `AddToCart` in Test events, deduplicated.
2. Press Buy, pay with `4242…` in test mode → `InitiateCheckout` then
   `Purchase` (one each, deduplicated); `/thank-you` sends the browser half.
3. Trigger a renewal (Stripe test clock) → no `Purchase`.
4. Book a test call → `Schedule` once.
5. GPC on → no pixel script in the network log.
