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
