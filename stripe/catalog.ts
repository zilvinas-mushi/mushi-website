/**
 * STRIPE AGAINST THE CATALOG (docs/features/0001-stripe-pricing).
 *
 * `readCatalog` fetches, `diffCatalog` compares, `applyCatalog` creates what
 * is missing. Three rules, each pinned by `tests/stripe.diff.test.ts`:
 *
 * 1. IT ONLY EVER CREATES. Nothing here updates, archives, deletes or moves a
 *    lookup key. A price that exists and differs from `pricing.ts` is a
 *    PROBLEM, reported for a person to resolve — there may be subscribers on
 *    it, and what happens to them is not a script's decision.
 * 2. ANY PROBLEM STOPS EVERYTHING. With one mismatch outstanding, not even an
 *    unrelated missing price is created: a half-right catalog is the state in
 *    which mistakes get charged.
 * 3. THE MODE IS CHECKED, NOT ASSUMED. Every object Stripe returns says
 *    whether it is live; one that disagrees with the mode asked for is a
 *    problem like any other.
 */
import type Stripe from "stripe";
import { CURRENCY, PLANS, TEMPLATES_PRODUCT, type Plan } from "../src/lib/pricing.ts";
import type { Mode } from "./access.ts";

/** Stamped on everything the script creates, so the Dashboard shows where it came from. */
const MANAGED_BY = "mushi-website";

export type Snapshot = {
  product: Stripe.Product | null;
  /** Every price answering to one of the catalog's lookup keys, active or not. */
  keyed: Stripe.Price[];
  /** Every ACTIVE price on the product, whatever its lookup key. */
  onProduct: Stripe.Price[];
};

export type CatalogDiff = {
  missingProduct: boolean;
  missingPlans: Plan[];
  /** Things that exist and are wrong. Never fixed automatically. */
  problems: string[];
};

export class CatalogMismatchError extends Error {
  readonly problems: string[];
  constructor(mode: Mode, problems: string[]) {
    super(
      `Stripe ${mode} mode does not match src/lib/pricing.ts, and nothing was written:\n` +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
    this.name = "CatalogMismatchError";
    this.problems = problems;
  }
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "resource_missing";
}

export async function readCatalog(stripe: Stripe): Promise<Snapshot> {
  let product: Stripe.Product | null;
  try {
    product = await stripe.products.retrieve(TEMPLATES_PRODUCT.id);
  } catch (error) {
    // Only "no such product" means absent. Anything else — a network failure,
    // a key without permission — must not be mistaken for an empty account,
    // because an empty account is what `apply` writes into.
    if (!isMissing(error)) throw error;
    product = null;
  }

  // `currency_options` is one of the few things that CAN be edited on an
  // existing price, and Stripe only returns it when asked.
  const expand = ["data.currency_options"];
  // No `active` filter on this one: an archived price still holding a lookup
  // key has to be seen, or `apply` would try to create a second.
  const keyed = await stripe.prices.list({ lookup_keys: PLANS.map((p) => p.lookupKey), limit: 100, expand });
  const onProduct = product
    ? await stripe.prices.list({ product: TEMPLATES_PRODUCT.id, active: true, limit: 100, expand })
    : null;
  if (keyed.has_more || onProduct?.has_more) {
    throw new Error("More than 100 prices to inspect — far more than a three-plan catalog should ever have. Look in the Dashboard.");
  }
  return { product, keyed: keyed.data, onProduct: onProduct?.data ?? [] };
}

const show = (value: unknown) => JSON.stringify(value) ?? String(value);

export function diffCatalog(snapshot: Snapshot, mode: Mode): CatalogDiff {
  const problems: string[] = [];
  const live = mode === "live";

  /** Records a problem unless `actual` is exactly `expected`. */
  const must = (what: string, field: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) problems.push(`${what}: ${field} is ${show(actual)}, the catalog says ${show(expected)}`);
  };

  const { product } = snapshot;
  if (product) {
    const what = `product ${TEMPLATES_PRODUCT.id}`;
    must(what, "livemode", product.livemode, live);
    must(what, "active", product.active, true);
    must(what, "name", product.name, TEMPLATES_PRODUCT.name);
  } else if (snapshot.keyed.length > 0) {
    problems.push(
      `product ${TEMPLATES_PRODUCT.id} does not exist, yet prices answer to the catalog's lookup keys: ` +
        snapshot.keyed.map((p) => `${p.lookup_key} (${p.id})`).join(", "),
    );
  }

  const missingPlans: Plan[] = [];
  for (const plan of PLANS) {
    const found = snapshot.keyed.filter((p) => p.lookup_key === plan.lookupKey);
    if (found.length === 0) {
      missingPlans.push(plan);
      continue;
    }
    if (found.length > 1) {
      problems.push(`price ${plan.lookupKey}: ${found.length} prices answer to this lookup key (${found.map((p) => p.id).join(", ")})`);
      continue;
    }
    const [price] = found;
    const what = `price ${plan.lookupKey} (${price.id})`;
    must(what, "livemode", price.livemode, live);
    must(what, "active", price.active, true);
    must(what, "product", typeof price.product === "string" ? price.product : price.product.id, TEMPLATES_PRODUCT.id);
    must(what, "currency", price.currency, CURRENCY);
    must(what, "unit_amount", price.unit_amount, plan.amount);
    must(what, "type", price.type, "recurring");
    must(what, "billing_scheme", price.billing_scheme, "per_unit");
    // Unset on purpose: it can be set once and never changed, and whether the
    // price includes VAT is not decided yet (PRD, Risks 1).
    must(what, "tax_behavior", price.tax_behavior, "unspecified");
    must(what, "custom_unit_amount", price.custom_unit_amount ?? null, null);
    must(what, "transform_quantity", price.transform_quantity ?? null, null);
    must(what, "metadata.plan_id", price.metadata?.plan_id, plan.id);
    // A second currency added in the Dashboard would charge some customers a
    // figure that is in no file here.
    for (const [currency, option] of Object.entries(price.currency_options ?? {})) {
      if (currency !== CURRENCY) {
        problems.push(`${what}: has a ${currency} amount (${option.unit_amount}) in currency_options, the catalog bills in ${CURRENCY} only`);
      } else {
        must(what, `currency_options.${currency}.unit_amount`, option.unit_amount, plan.amount);
      }
    }
    if (price.recurring) {
      must(what, "recurring.interval", price.recurring.interval, plan.interval);
      must(what, "recurring.interval_count", price.recurring.interval_count, plan.intervalCount);
      must(what, "recurring.usage_type", price.recurring.usage_type, "licensed");
      must(what, "recurring.trial_period_days", price.recurring.trial_period_days ?? null, null);
    }
  }

  const known = new Set(PLANS.map((p) => p.lookupKey));
  for (const price of snapshot.onProduct) {
    if (!price.lookup_key || !known.has(price.lookup_key)) {
      problems.push(
        `price ${price.id} is active on ${TEMPLATES_PRODUCT.id} but is not in the catalog ` +
          `(lookup key ${show(price.lookup_key)}, ${price.unit_amount} ${price.currency})`,
      );
    }
  }

  return { missingProduct: product === null, missingPlans, problems };
}

export async function inspectCatalog(stripe: Stripe, mode: Mode): Promise<{ snapshot: Snapshot; diff: CatalogDiff }> {
  const snapshot = await readCatalog(stripe);
  return { snapshot, diff: diffCatalog(snapshot, mode) };
}

export async function applyCatalog(stripe: Stripe, mode: Mode): Promise<{ created: string[]; diff: CatalogDiff }> {
  const before = await inspectCatalog(stripe, mode);
  if (before.diff.problems.length > 0) throw new CatalogMismatchError(mode, before.diff.problems);

  const created: string[] = [];

  if (before.diff.missingProduct) {
    // No idempotency key of our own on these creates. Stripe already refuses
    // a second product with this id and a second price with a lookup key in
    // use, so a repeat cannot duplicate anything — whereas a fixed key would
    // REPLAY yesterday's "created" for an object deleted since.
    const product = await stripe.products.create({
      id: TEMPLATES_PRODUCT.id,
      name: TEMPLATES_PRODUCT.name,
      metadata: { managed_by: MANAGED_BY },
    });
    created.push(`product ${product.id}`);
    // An empty account carries nothing that says which mode it is; this is
    // the first object that does. Stop before any price follows it.
    if (product.livemode !== (mode === "live")) {
      throw new Error(
        `Asked for ${mode} mode, but the product was created in ${product.livemode ? "live" : "test"} mode. ` +
          `Stopped before creating any price; archive ${product.id} there and check which key or login is in use.`,
      );
    }
  }

  for (const plan of before.diff.missingPlans) {
    const price = await stripe.prices.create({
      product: TEMPLATES_PRODUCT.id,
      currency: CURRENCY,
      unit_amount: plan.amount,
      recurring: { interval: plan.interval, interval_count: plan.intervalCount },
      lookup_key: plan.lookupKey,
      nickname: `Templates, ${plan.id}`,
      metadata: { plan_id: plan.id, managed_by: MANAGED_BY },
    });
    created.push(`price ${price.lookup_key}`);
  }

  // Read it all back: what was written has to be what the catalog says.
  const after = await inspectCatalog(stripe, mode);
  if (after.diff.problems.length > 0) throw new CatalogMismatchError(mode, after.diff.problems);
  if (after.diff.missingProduct || after.diff.missingPlans.length > 0) {
    throw new Error(`Stripe ${mode} mode is still incomplete after apply: ${show(after.diff)}`);
  }
  return { created, diff: after.diff };
}
