/**
 * THE IN-SHEET CHECKOUT (2026-10-04; PRD, Phase 3). What the plan sheet's
 * payment step needs to show Stripe's own card fields in place.
 *
 * This site is a static export and holds no secret. It asks the webapp for a
 * Stripe Checkout Session (`CHECKOUT_SESSION_URL`) and receives only that
 * session's client secret, which lets the buyer's browser pay for that one
 * session. The card is typed into Stripe's iframes and never reaches this
 * site or the webapp. Paying grants nothing here either: the webapp's webhook
 * creates the account from Stripe's own notice.
 *
 * If the webapp cannot be reached the sheet falls back to the plan's Payment
 * Link (`PAYMENT_LINKS` in pricing.ts), so there is always a way to pay.
 */
import { PLANS, STRIPE_MODE, monthsIn, type Plan, type PlanId } from "@/lib/pricing";
import { APP_URL } from "@/lib/site";

/**
 * Publishable keys: public by design — they are in every page that loads
 * Stripe.js and can only start a payment to this account, never read or move
 * anything. One per Stripe mode.
 */
export const STRIPE_PUBLISHABLE_KEYS: Record<"test" | "live", string> = {
  test: "pk_test_51Q7Da8026uErRlImCNKJTxplUaXxj00v5P4g04bVEtWEgtJMIZrua3KbKypknJ1kL5lf7tC7CQgEtCKGkohjsq0a00etsYtpcd",
  live: "pk_live_51Q7Da8026uErRlIm0IiwjgSlolIzRwNFg8U7VoAppK0VFMeWtc6cGhi9VF6lMEXXBWVK9KATnbWRWd0KHo153eFl00FEo5T0Pb",
};

export const STRIPE_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEYS[STRIPE_MODE];

/**
 * Where the sheet asks for a session. `NEXT_PUBLIC_CHECKOUT_API` points a
 * local or preview build at a staging webapp; production uses the webapp.
 */
export const CHECKOUT_SESSION_URL = process.env.NEXT_PUBLIC_CHECKOUT_API || `${APP_URL}/api/checkout/session`;

/**
 * A SESSION PER PLAN, ASKED FOR AHEAD OF THE BUYER (Noah 2026-10-05, on the
 * hold after Buy: "way quicker than this"). The webapp takes the better part
 * of a second to answer — it has Stripe to ask — and that used to start when
 * the payment step mounted and START AGAIN each time another plan was picked.
 * Now the sheet asks the moment it opens: the chosen plan first, the others
 * behind it, so that by the time a plan is picked and Buy is pressed its
 * session is already here whichever plan it was.
 *
 * A session is only a place to pay: unused, it expires at Stripe within a day
 * and nothing is charged or granted. They are kept for half an hour — a sheet
 * reopened after that asks afresh — and a failure is not kept at all.
 *
 * NO content-type header, on purpose: a string body goes as text/plain, which
 * a browser sends across origins without the OPTIONS round trip that
 * application/json costs first. The webapp reads the body as JSON either way.
 */
const SESSION_KEPT_MS = 30 * 60_000;
const sessions = new Map<PlanId, { at: number; secret: Promise<string> }>();

export function checkoutSession(planId: PlanId): Promise<string> {
  const kept = sessions.get(planId);
  if (kept && Date.now() - kept.at < SESSION_KEPT_MS) return kept.secret;
  const secret = fetch(CHECKOUT_SESSION_URL, {
    method: "POST",
    body: JSON.stringify({ plan: planFor(planId).lookupKey }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`the webapp answered ${response.status}`);
    const { clientSecret } = (await response.json()) as { clientSecret?: string };
    if (!clientSecret) throw new Error("the webapp sent no client secret");
    return clientSecret;
  });
  const entry = { at: Date.now(), secret };
  sessions.set(planId, entry);
  secret.catch(() => {
    if (sessions.get(planId) === entry) sessions.delete(planId);
  });
  return secret;
}

/** The chosen plan's session first, then the rest — see checkoutSession. */
export function prepareCheckoutSessions(first: PlanId): void {
  const rest = () => {
    for (const plan of PLANS) if (plan.id !== first) checkoutSession(plan.id).catch(() => {});
  };
  checkoutSession(first).then(rest, rest);
}

/**
 * WAKING THE WEBAPP'S FUNCTION before anyone needs it. One that has not been
 * called for a while takes over a second to start, and the first buyer after
 * a quiet spell paid that on top of everything else. A page that can open the
 * sheet calls this once it has finished its own loading; the webapp answers
 * 204 and does nothing. Once per page, and a failure is nobody's problem.
 */
let woken = false;
export function wakeCheckout(): void {
  if (woken) return;
  woken = true;
  // no-cors: the answer is of no interest, and asked for this way the call
  // cannot fail on any origin — a preview, a local build, the page-quality
  // check — where a CORS refusal would be a failed request in the console.
  fetch(CHECKOUT_SESSION_URL, { mode: "no-cors", cache: "no-store" }).catch(() => {});
}

export function planFor(planId: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`no plan ${planId}`);
  return plan;
}

/** "$10", or "$7.50" when the cents are not zero. */
export function usd(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

/**
 * WHAT IS CHARGED TODAY, for the payment step's "Total due today" — the whole
 * period, not the per-month figure the plan rows advertise. `was` is what the
 * same months cost at the 1-month price, struck through when the plan is
 * cheaper than that: $120 against $60 for the year, which is the -50% the pill
 * beside it claims.
 */
export function dueToday(planId: PlanId): { price: string; was: string | null } {
  const plan = planFor(planId);
  const monthly = PLANS.find((p) => monthsIn(p) === 1);
  const undiscounted = monthly ? monthly.amount * monthsIn(plan) : plan.amount;
  return { price: usd(plan.amount), was: undiscounted > plan.amount ? usd(undiscounted) : null };
}
