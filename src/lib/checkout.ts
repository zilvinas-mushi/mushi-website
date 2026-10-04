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
