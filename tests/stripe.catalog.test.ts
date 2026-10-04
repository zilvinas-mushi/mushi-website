/**
 * Layers B and C — Stripe really holds the catalog, in test mode and in live.
 *
 * Every assertion here is made against objects fetched from Stripe and
 * compared, field by field, with `src/lib/pricing.ts`. Live is read-only: the
 * client refuses anything but a GET before it is sent. This is also the test
 * that notices a price edited by hand in the Dashboard, which is why CI runs
 * it daily and not only on a push.
 */
import type Stripe from "stripe";
import { beforeAll, describe, expect, it } from "vitest";
import { CURRENCY, PLANS, TEMPLATES_PRODUCT } from "@/lib/pricing";
import { applyCatalog, diffCatalog, readCatalog, type Snapshot } from "../stripe/catalog.ts";
import { connect } from "./helpers/stripe.ts";

describe.each(["test", "live"] as const)("Stripe %s mode", (mode) => {
  const connection = connect(mode);
  const live = mode === "live";

  describe.skipIf(connection.skip)("holds the catalog", () => {
    const stripe = connection.stripe as Stripe;
    let snapshot: Snapshot;

    beforeAll(async () => {
      snapshot = await readCatalog(stripe);
    });

    it("has the product, active, under the name a customer is shown", () => {
      expect(snapshot.product).toMatchObject({
        id: TEMPLATES_PRODUCT.id,
        name: TEMPLATES_PRODUCT.name,
        active: true,
        livemode: live,
      });
    });

    it.each(PLANS)("$id: exactly one price answers to $lookupKey, and it charges what the catalog says", (plan) => {
      const found = snapshot.keyed.filter((p) => p.lookup_key === plan.lookupKey);
      expect(found).toHaveLength(1);
      expect(found[0]).toMatchObject({
        active: true,
        livemode: live,
        product: TEMPLATES_PRODUCT.id,
        currency: CURRENCY,
        unit_amount: plan.amount,
        type: "recurring",
        billing_scheme: "per_unit",
        tax_behavior: "unspecified",
        custom_unit_amount: null,
        transform_quantity: null,
        recurring: {
          interval: plan.interval,
          interval_count: plan.intervalCount,
          usage_type: "licensed",
        },
        metadata: { plan_id: plan.id },
      });
    });

    it("has those three active prices on the product and no others", () => {
      expect(snapshot.onProduct.map((p) => p.lookup_key).sort()).toEqual(PLANS.map((p) => p.lookupKey).sort());
    });

    it("differs from the catalog in nothing", () => {
      expect(diffCatalog(snapshot, mode)).toEqual({ missingProduct: false, missingPlans: [], problems: [] });
    });

    // Test mode only, and declared only there rather than skipped in live: a
    // skipped test in this suite should always mean something was not checked.
    // The live client here cannot write, and must not.
    if (mode === "test") {
      it("running apply again creates nothing", async () => {
        // apply is only called on a catalog already known to be complete, so
        // this can never be the thing that quietly repairs a broken one.
        expect(diffCatalog(snapshot, mode)).toEqual({ missingProduct: false, missingPlans: [], problems: [] });
        const result = await applyCatalog(stripe, mode);
        expect(result.created).toEqual([]);
        // And not only by its own account of it: the same price ids are
        // there afterwards, no more and no fewer.
        const after = await readCatalog(stripe);
        const ids = (prices: typeof snapshot.keyed) => prices.map((p) => p.id).sort();
        expect(ids(after.keyed)).toEqual(ids(snapshot.keyed));
        expect(ids(after.onProduct)).toEqual(ids(snapshot.onProduct));
      });
    }
  });
});
