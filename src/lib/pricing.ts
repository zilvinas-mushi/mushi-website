/**
 * WHAT MUSHI CHARGES. The single source of truth for billing
 * (docs/features/0001-stripe-pricing).
 *
 * `content.ts` holds the strings a visitor reads ("$8", "-20% OFF", "Billed
 * every 3 months"); this file holds what Stripe is told to charge. The two
 * are held together by `tests/pricing.parity.test.ts`, and this file is held
 * to Stripe — test mode and live — by `tests/stripe.catalog.test.ts`. Change
 * a number here without the other two and CI goes red.
 *
 * PURE DATA, NO IMPORTS: the sync script runs this file under plain Node, and
 * nothing here may pull the site in after it.
 *
 * A PRICE IS IMMUTABLE IN STRIPE. Amount, currency and interval cannot be
 * edited once created, so "changing a price" means a NEW price that takes
 * over the lookup key, with the old one archived by a person. The sync script
 * (`npm run stripe:apply`) only ever creates; an existing price that differs
 * from this file is an error it reports and refuses to touch.
 */

/** ISO 4217, lower case, as Stripe writes it. Every price on the site is in dollars. */
export const CURRENCY = "usd";

/**
 * ONE PRODUCT for the three plans: they are billing variants of the same
 * thing — access to the template library — not three tiers. The id is chosen
 * rather than generated so that test mode and live hold the same one.
 * `name` is what the customer reads on the checkout page, receipt and invoice.
 */
export const TEMPLATES_PRODUCT = {
  id: "mushi_templates",
  name: "Mushi Templates",
} as const;

export type PlanId = "1-month" | "3-months" | "12-months";

export type Plan = {
  /** The site's plan id: `content.ts`, `data-plan`, the `?plan=` hand-off to the webapp. */
  id: PlanId;
  /**
   * How code finds the price. Price ids differ between test mode and live;
   * lookup keys do not, so nothing in the repo ever names a `price_…` id.
   */
  lookupKey: string;
  /** Charged each period, in cents. */
  amount: number;
  interval: "month" | "year";
  intervalCount: number;
};

export const PLANS: readonly Plan[] = [
  { id: "1-month", lookupKey: "templates_1_month", amount: 1000, interval: "month", intervalCount: 1 },
  { id: "3-months", lookupKey: "templates_3_months", amount: 2400, interval: "month", intervalCount: 3 },
  { id: "12-months", lookupKey: "templates_12_months", amount: 6000, interval: "year", intervalCount: 1 },
];

/** The length of one billing period in months — what the per-month figure divides by. */
export function monthsIn(plan: Pick<Plan, "interval" | "intervalCount">): number {
  return plan.interval === "year" ? plan.intervalCount * 12 : plan.intervalCount;
}

/**
 * THE HOST STRIPE SERVES MUSHI'S CHECKOUT ON — the account's custom domain
 * (Stripe Dashboard → Settings → Custom domains; a CNAME to Stripe's hosted
 * checkout, 2026-10-04). Payment Links and Checkout Sessions both live on
 * it, in test mode and live, so the buyer never sees buy.stripe.com. It is
 * an account setting: if the domain changes there, this is the one line to
 * change here, and `npm test` holds Stripe to it.
 */
export const CHECKOUT_HOST = "pay.mushi.agency";

/** A Payment Link's address from its id — `test_…` in test mode. */
const paymentLink = (id: string) => `https://${CHECKOUT_HOST}/b/${id}`;

/**
 * WHERE EACH PLAN IS PAID FOR: a Stripe Payment Link, hosted by Stripe, so
 * the card never touches this site and no server is needed (2026-10-04, the
 * launch). One link per plan and per mode; each sells exactly that plan's
 * price and sends the buyer to `THANK_YOU_PATH` afterwards.
 *
 * These are URLs, not secrets — anyone who presses Buy sees them. They are
 * created in Stripe by hand (`scripts/stripe-live-payment-links.sh` for
 * live), because creating one is the moment real money can be taken.
 *
 * The sheet's own card fields return when the webapp can hand it a session
 * (PRD, Phase 3); until then this is the checkout.
 */
export const PAYMENT_LINKS: Record<PlanId, { test: string; live: string }> = {
  "1-month": {
    test: paymentLink("test_14A00bdtYcxrdYL4jEafS00"),
    live: paymentLink("14A00bdtYcxrdYL4jEafS00"),
  },
  "3-months": {
    test: paymentLink("test_fZu9AL3TodBvaMzaI2afS01"),
    live: paymentLink("fZu9AL3TodBvaMzaI2afS01"),
  },
  "12-months": {
    test: paymentLink("test_6oU28jahM1SNbQD9DYafS02"),
    live: paymentLink("6oU28jahM1SNbQD9DYafS02"),
  },
};

/** Where Stripe sends the buyer after paying; it appends `?session_id=cs_…`. */
export const THANK_YOU_PATH = "/thank-you";

/**
 * Live unless the build says otherwise. `NEXT_PUBLIC_STRIPE_MODE=test` is for
 * a preview deployment or a local run, where a Buy button must not charge.
 */
export const STRIPE_MODE: "test" | "live" = process.env.NEXT_PUBLIC_STRIPE_MODE === "test" ? "test" : "live";

/** The checkout address for a plan, with the buyer's email filled in when known. */
export function checkoutUrl(planId: PlanId, mode: "test" | "live" = STRIPE_MODE, email?: string): string {
  const link = PAYMENT_LINKS[planId][mode];
  return email ? `${link}?prefilled_email=${encodeURIComponent(email)}` : link;
}
