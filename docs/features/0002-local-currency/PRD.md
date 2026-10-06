---
status: draft
created: 2026-10-06
last-updated: 2026-10-06
last-updated-by: Zilvinas Aleksa
---

# 0002 — Prices in the buyer's own currency · PRD

**Draft, not started. Nothing here is built.** It is waiting on the three
decisions at the end.

## Why

Mushi is to be sold in the USA and in the EU. A visitor from Germany who sees
"$5" reads a product made for somewhere else. The idea (2026-10-06): show and
charge **the same number in the visitor's currency** — $5 in the USA, €5 in
Germany — "so that people feel the product is meant for them". The amounts
are not converted: 10 / 8 / 5 a month in every currency.

## The one rule

**What is shown is what is charged.** A page that says €5 and a card
statement that says $5 is a complaint and a chargeback. So this is not a
change of symbol on the site; it is a second set of prices in Stripe, and the
site, the webapp and Stripe have to agree on the currency for every buyer.

## How it would work

1. **Stripe.** Each of the three plans gets its amount in each extra
   currency — 1000 / 2400 / 6000 minor units — under the same lookup key.
   `src/lib/pricing.ts` lists them and `npm test` holds Stripe to it in test
   mode and live, as it does for USD today. Live is written by a person.
   *To settle first, in test mode:* whether Stripe lets currencies be added
   to the existing prices, or whether new prices have to take over the
   lookup keys (a price is otherwise immutable).
2. **Which currency a visitor gets** is decided on the site, once, before
   anything is painted — from the browser's time zone (Europe/Berlin → EUR),
   because that is known instantly. The country Cloudflare reports only
   arrives after a request, and a price that changes from $5 to €5 on screen
   is exactly what "nothing paints half-built" forbids. `?currency=eur` (and
   `usd`, …) overrides it for the visit: that is how it is tested and how a
   region is "switched" without a VPN.
3. **The site** shows that currency everywhere a plan figure appears: the
   plan rows, their totals and struck prices, "SAVE 60", Buy, "Total due
   today", and the "$5" in the page's own copy. Search engines keep USD.
4. **The charge.** The site sends the currency with the plan; the webapp
   (separate repo) creates the Checkout Session in it, from an allow-list.
   The Payment Links — the fallback and the Link stand-in — must land in the
   same currency; to be verified, because Stripe picks theirs by location and
   the site picks by time zone.

## Acceptance Criteria

- **AC1** — Test and live hold every plan at the same amount in every
  currency in scope, and `npm test` fails if any one differs from
  `pricing.ts`.
- **AC2** — With `?currency=eur`, every plan figure on `/templates` and in
  the sheet reads in euros, and no figure on the page is seen to change
  after the first paint.
- **AC3** — The session the webapp creates is in the currency the sheet
  showed; a test-mode payment in each currency shows that currency and
  amount on the Stripe payment.
- **AC4** — A visitor in none of the supported regions sees and pays USD,
  exactly as today.
- **AC5** — Existing subscribers are untouched: they renew in the currency
  and at the amount they signed up with.
- **AC6** — `npm run checkout:check` passes in every currency: Buy is still
  instant on every plan.

## Smoke Scenarios

1. **Germany** — open `/templates?currency=eur`: €5 in the copy, €10 / €8 /
   €5 in the rows, "Total due today €60" for the year; pay with a test card;
   Stripe shows €60.00.
2. **USA** — no parameter, US time zone: everything as it is today, in $.
3. **The fallback** — with the webapp unreachable, Submit lands on Stripe's
   hosted page in the same currency the sheet showed.

## Decisions needed before this starts

- **D1 — Which currencies.** EUR for the euro area is the ask. GBP (UK) and
  CHF (Switzerland) were mentioned earlier the same day; each is the same
  work again in Stripe and one more column in the tests. Recommended: EUR
  first, the mechanism built so the others are a line each.
- **D2 — VAT.** A consumer in the EU is owed a price that includes VAT. At
  €5 that is €4.20 to Mushi in Germany and less elsewhere, where $5 from the
  USA is $5. Either that is accepted, or EU prices are not the same number.
  (Already an open risk in 0001.)
- **D3 — The webapp.** Its session endpoint has to take a currency. That is
  work in the other repository and has to ship first or together.

## Not in this

Translating the site. Different amounts per market. Converting at an
exchange rate (Stripe can do that on its own; it would show €4.6-something,
which is the opposite of the idea).
