/**
 * The comparison between Stripe and the catalog, and the rule that the sync
 * only ever CREATES. No network: the snapshots are hand-built price and
 * product objects, each one wrong in exactly one way.
 *
 * What is really in Stripe is checked in `stripe.catalog.test.ts`; what this
 * file proves is that a wrong price would be NOTICED, which cannot be staged
 * against the real account without leaving wrong prices in it.
 */
import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { CURRENCY, PLANS, TEMPLATES_PRODUCT, type Plan } from "@/lib/pricing";
import { CatalogMismatchError, applyCatalog, diffCatalog, type Snapshot } from "../stripe/catalog.ts";

const [monthly, quarterly, yearly] = PLANS;

function product(over: Partial<Stripe.Product> = {}): Stripe.Product {
  return {
    id: TEMPLATES_PRODUCT.id,
    object: "product",
    active: true,
    name: TEMPLATES_PRODUCT.name,
    livemode: false,
    metadata: { managed_by: "mushi-website" },
    ...over,
  } as Stripe.Product;
}

function price(plan: Plan, over: Partial<Stripe.Price> = {}): Stripe.Price {
  return {
    id: `price_${plan.lookupKey}`,
    object: "price",
    active: true,
    billing_scheme: "per_unit",
    currency: CURRENCY,
    custom_unit_amount: null,
    livemode: false,
    lookup_key: plan.lookupKey,
    metadata: { plan_id: plan.id, managed_by: "mushi-website" },
    nickname: null,
    product: TEMPLATES_PRODUCT.id,
    recurring: {
      interval: plan.interval,
      interval_count: plan.intervalCount,
      meter: null,
      trial_period_days: null,
      usage_type: "licensed",
    },
    tax_behavior: "unspecified",
    tiers_mode: null,
    transform_quantity: null,
    type: "recurring",
    unit_amount: plan.amount,
    unit_amount_decimal: String(plan.amount),
    ...over,
  } as Stripe.Price;
}

function option(unitAmount: number): Stripe.Price.CurrencyOptions {
  return { custom_unit_amount: null, tax_behavior: "unspecified", unit_amount: unitAmount } as Stripe.Price.CurrencyOptions;
}

/** A snapshot of Stripe holding exactly the catalog. */
function complete(): Snapshot {
  const prices = PLANS.map((p) => price(p));
  return { product: product(), keyed: prices, onProduct: prices };
}

/** The complete snapshot with one plan's price replaced. */
function withPrice(plan: Plan, over: Partial<Stripe.Price>): Snapshot {
  const prices = PLANS.map((p) => (p === plan ? price(p, over) : price(p)));
  return { product: product(), keyed: prices, onProduct: prices };
}

describe("diffCatalog", () => {
  it("finds nothing to do and nothing wrong when Stripe holds the catalog", () => {
    expect(diffCatalog(complete(), "test")).toEqual({ missingProduct: false, missingPlans: [], problems: [] });
  });

  it("accepts the dollar amount restated in currency_options, which is how Stripe returns it when expanded", () => {
    const diff = diffCatalog(withPrice(quarterly, { currency_options: { usd: option(2400) } }), "test");
    expect(diff).toEqual({ missingProduct: false, missingPlans: [], problems: [] });
  });

  it("an empty account is missing everything and has nothing wrong", () => {
    expect(diffCatalog({ product: null, keyed: [], onProduct: [] }, "test")).toEqual({
      missingProduct: true,
      missingPlans: [...PLANS],
      problems: [],
    });
  });

  it("reports only the plan whose price is absent", () => {
    const prices = [price(monthly), price(yearly)];
    const diff = diffCatalog({ product: product(), keyed: prices, onProduct: prices }, "test");
    expect(diff.missingPlans).toEqual([quarterly]);
    expect(diff.problems).toEqual([]);
  });

  it.each<[string, Partial<Stripe.Price>, RegExp]>([
    ["a different amount", { unit_amount: 2500 }, /templates_3_months.*unit_amount is 2500.*2400/],
    ["a different currency", { currency: "eur" }, /templates_3_months.*currency is "eur".*"usd"/],
    ["a one-off price", { type: "one_time", recurring: null }, /templates_3_months.*type is "one_time".*"recurring"/],
    ["an archived price", { active: false }, /templates_3_months.*active is false/],
    ["another product's price", { product: "prod_other" }, /templates_3_months.*product is "prod_other"/],
    ["a tiered price", { billing_scheme: "tiered" }, /templates_3_months.*billing_scheme is "tiered"/],
    ["a tax behaviour nobody decided", { tax_behavior: "exclusive" }, /templates_3_months.*tax_behavior is "exclusive"/],
    ["a pay-what-you-want price", { custom_unit_amount: { maximum: null, minimum: 100, preset: null } }, /templates_3_months.*custom_unit_amount/],
    ["a price sold in packs", { transform_quantity: { divide_by: 3, round: "up" } }, /templates_3_months.*transform_quantity/],
    ["a price tagged for another plan", { metadata: { plan_id: "1-month", managed_by: "mushi-website" } }, /templates_3_months.*metadata\.plan_id is "1-month"/],
    ["a euro amount added in the Dashboard", { currency_options: { usd: option(2400), eur: option(2200) } }, /templates_3_months.*eur amount \(2200\)/],
    ["a dollar amount changed through currency_options", { currency_options: { usd: option(2500) } }, /templates_3_months.*currency_options\.usd\.unit_amount is 2500.*2400/],
  ])("notices %s", (_what, over, message) => {
    const diff = diffCatalog(withPrice(quarterly, over), "test");
    expect(diff.problems).toHaveLength(1);
    expect(diff.problems[0]).toMatch(message);
    expect(diff.missingPlans).toEqual([]);
  });

  it.each<[string, Partial<Stripe.Price.Recurring>, RegExp]>([
    ["billing monthly instead of quarterly", { interval_count: 1 }, /interval_count is 1.*3/],
    ["billing every 3 years", { interval: "year" }, /interval is "year".*"month"/],
    ["metered usage", { usage_type: "metered" }, /usage_type is "metered"/],
    ["a free trial", { trial_period_days: 14 }, /trial_period_days is 14/],
  ])("notices %s", (_what, over, message) => {
    const recurring = { ...price(quarterly).recurring, ...over } as Stripe.Price.Recurring;
    const diff = diffCatalog(withPrice(quarterly, { recurring }), "test");
    expect(diff.problems).toHaveLength(1);
    expect(diff.problems[0]).toMatch(message);
  });

  it("notices a price that is in the other mode", () => {
    const diff = diffCatalog(complete(), "live");
    expect(diff.problems).toContainEqual(expect.stringMatching(/product mushi_templates.*livemode is false.*true/));
    expect(diff.problems.filter((p) => /price templates_/.test(p))).toHaveLength(PLANS.length);
  });

  it("notices an active price on the product that the catalog does not know", () => {
    const stray = price(monthly, { id: "price_stray", lookup_key: null, unit_amount: 100 });
    const snap = complete();
    const diff = diffCatalog({ ...snap, onProduct: [...snap.onProduct, stray] }, "test");
    expect(diff.problems).toEqual([expect.stringMatching(/price_stray.*not in the catalog/)]);
  });

  it("notices two prices answering to one lookup key", () => {
    const snap = complete();
    const twin = price(monthly, { id: "price_twin" });
    const diff = diffCatalog({ ...snap, keyed: [...snap.keyed, twin] }, "test");
    expect(diff.problems).toContainEqual(expect.stringMatching(/templates_1_month.*2 prices/));
  });

  it("notices an archived or renamed product", () => {
    const snap = complete();
    expect(diffCatalog({ ...snap, product: product({ active: false }) }, "test").problems).toEqual([
      expect.stringMatching(/product mushi_templates.*active is false/),
    ]);
    expect(diffCatalog({ ...snap, product: product({ name: "Templates" }) }, "test").problems).toEqual([
      expect.stringMatching(/product mushi_templates.*name is "Templates".*"Mushi Templates"/),
    ]);
  });

  it("notices prices that exist while their product does not", () => {
    const prices = PLANS.map((p) => price(p));
    const diff = diffCatalog({ product: null, keyed: prices, onProduct: [] }, "test");
    expect(diff.missingProduct).toBe(true);
    expect(diff.problems).toContainEqual(expect.stringMatching(/product mushi_templates does not exist.*templates_1_month/));
  });
});

/**
 * A stand-in for the Stripe client at the boundary. It serves a snapshot,
 * filters the way the real API does, and records every write it is asked for,
 * storing each one FROM ITS PARAMETERS — so what `apply` reads back is what it
 * actually sent, not what the catalog says.
 */
function fakeStripe(
  snapshot: Snapshot,
  mode: "test" | "live" = "test",
  behave: { readFails?: Error; hasMore?: boolean; storesAmountAs?: number } = {},
) {
  const state = { ...snapshot, keyed: [...snapshot.keyed], onProduct: [...snapshot.onProduct] };
  const writes: Array<{ kind: "product" | "price"; params: Record<string, unknown>; options: unknown }> = [];
  const reads: Stripe.PriceListParams[] = [];
  const client = {
    products: {
      retrieve: async (id: string) => {
        if (behave.readFails) throw behave.readFails;
        if (!state.product || state.product.id !== id) {
          throw Object.assign(new Error(`No such product: '${id}'`), { code: "resource_missing" });
        }
        return state.product;
      },
      create: async (params: Stripe.ProductCreateParams, options?: Stripe.RequestOptions) => {
        writes.push({ kind: "product", params: { ...params }, options });
        if (state.product) throw Object.assign(new Error(`Product already exists.`), { code: "resource_already_exists" });
        state.product = product({ id: params.id, name: params.name, livemode: mode === "live", metadata: params.metadata as Stripe.Metadata });
        return state.product;
      },
    },
    prices: {
      list: async (params: Stripe.PriceListParams) => {
        reads.push(params);
        const active = (p: Stripe.Price) => params.active === undefined || p.active === params.active;
        return {
          object: "list",
          has_more: behave.hasMore ?? false,
          data: params.lookup_keys
            ? state.keyed.filter((p) => params.lookup_keys?.includes(p.lookup_key ?? "") && active(p))
            : state.onProduct.filter((p) => p.product === params.product && active(p)),
        };
      },
      create: async (params: Stripe.PriceCreateParams, options?: Stripe.RequestOptions) => {
        writes.push({ kind: "price", params: { ...params }, options });
        if (state.keyed.some((p) => p.lookup_key === params.lookup_key)) {
          throw Object.assign(new Error("A price already uses this lookup key."), { code: "resource_already_exists" });
        }
        const made = {
          id: `price_made_${writes.length}`,
          object: "price",
          active: true,
          billing_scheme: "per_unit",
          currency: params.currency,
          custom_unit_amount: null,
          livemode: mode === "live",
          lookup_key: params.lookup_key ?? null,
          metadata: params.metadata ?? {},
          nickname: params.nickname ?? null,
          product: params.product,
          recurring: params.recurring
            ? {
                interval: params.recurring.interval,
                interval_count: params.recurring.interval_count ?? 1,
                meter: null,
                trial_period_days: null,
                usage_type: "licensed",
              }
            : null,
          tax_behavior: params.tax_behavior ?? "unspecified",
          tiers_mode: null,
          transform_quantity: null,
          type: params.recurring ? "recurring" : "one_time",
          unit_amount: behave.storesAmountAs ?? params.unit_amount ?? null,
        } as Stripe.Price;
        state.keyed.push(made);
        state.onProduct.push(made);
        return made;
      },
    },
  };
  return { client: client as unknown as Stripe, writes, reads };
}

describe("applyCatalog", () => {
  it("creates the product and all three prices in an empty account, exactly as the catalog states them", async () => {
    const { client, writes } = fakeStripe({ product: null, keyed: [], onProduct: [] });
    const result = await applyCatalog(client, "test");

    expect(writes.map((w) => w.kind)).toEqual(["product", "price", "price", "price"]);
    expect(writes[0].params).toEqual({
      id: "mushi_templates",
      name: "Mushi Templates",
      metadata: { managed_by: "mushi-website" },
    });
    expect(writes.slice(1).map((w) => w.params)).toEqual([
      {
        product: "mushi_templates", currency: "usd", unit_amount: 1000,
        recurring: { interval: "month", interval_count: 1 },
        lookup_key: "templates_1_month", nickname: "Templates, 1-month",
        metadata: { plan_id: "1-month", managed_by: "mushi-website" },
      },
      {
        product: "mushi_templates", currency: "usd", unit_amount: 2400,
        recurring: { interval: "month", interval_count: 3 },
        lookup_key: "templates_3_months", nickname: "Templates, 3-months",
        metadata: { plan_id: "3-months", managed_by: "mushi-website" },
      },
      {
        product: "mushi_templates", currency: "usd", unit_amount: 6000,
        recurring: { interval: "year", interval_count: 1 },
        lookup_key: "templates_12_months", nickname: "Templates, 12-months",
        metadata: { plan_id: "12-months", managed_by: "mushi-website" },
      },
    ]);
    expect(result.created).toEqual([
      "product mushi_templates",
      "price templates_1_month",
      "price templates_3_months",
      "price templates_12_months",
    ]);
  });

  it("never sends tax_behavior or transfer_lookup_key: the first is undecided, the second would take a key from a live price", async () => {
    const { client, writes } = fakeStripe({ product: null, keyed: [], onProduct: [] });
    await applyCatalog(client, "test");
    for (const w of writes) {
      expect(w.params).not.toHaveProperty("tax_behavior");
      expect(w.params).not.toHaveProperty("transfer_lookup_key");
    }
  });

  it("sets no idempotency key of its own, which would replay a create for an object deleted since", async () => {
    const { client, writes } = fakeStripe({ product: null, keyed: [], onProduct: [] });
    await applyCatalog(client, "test");
    expect(writes.map((w) => w.options)).toEqual([undefined, undefined, undefined, undefined]);
  });

  it("looks prices up by lookup key WITHOUT an active filter, and asks for currency_options", async () => {
    const { client, reads } = fakeStripe(complete());
    await applyCatalog(client, "test");
    expect(reads[0]).toEqual({
      lookup_keys: ["templates_1_month", "templates_3_months", "templates_12_months"],
      limit: 100,
      expand: ["data.currency_options"],
    });
    expect(reads[1]).toEqual({ product: "mushi_templates", active: true, limit: 100, expand: ["data.currency_options"] });
  });

  it("does not mistake a failed read for an empty account", async () => {
    // A key without permission, a network failure: anything but "no such
    // product" has to stop apply, because an empty account is what it fills.
    const denied = Object.assign(new Error("This key cannot read products."), { code: "permission_denied", statusCode: 403 });
    const { client, writes } = fakeStripe({ product: null, keyed: [], onProduct: [] }, "test", { readFails: denied });
    await expect(applyCatalog(client, "test")).rejects.toBe(denied);
    expect(writes).toEqual([]);
  });

  it("stops at an archived price that still holds a lookup key, rather than creating a second", async () => {
    const archived = price(quarterly, { active: false });
    const active = [price(monthly), price(yearly)];
    const { client, writes } = fakeStripe({ product: product(), keyed: [...active, archived], onProduct: active });
    await expect(applyCatalog(client, "test")).rejects.toThrow(/templates_3_months.*active is false/);
    expect(writes).toEqual([]);
  });

  it("stops when there are more prices than it can see in one page", async () => {
    const { client, writes } = fakeStripe(complete(), "test", { hasMore: true });
    await expect(applyCatalog(client, "test")).rejects.toThrow(/More than 100 prices/);
    expect(writes).toEqual([]);
  });

  it("fails when what Stripe stored is not what the catalog says", async () => {
    // The read-back after writing: a create that "succeeded" with another
    // amount must not be reported as done.
    const { client } = fakeStripe({ product: null, keyed: [], onProduct: [] }, "test", { storesAmountAs: 999 });
    const attempt = applyCatalog(client, "test");
    await expect(attempt).rejects.toBeInstanceOf(CatalogMismatchError);
    await expect(attempt).rejects.toThrow(/unit_amount is 999, the catalog says 1000/);
  });

  it("creates only what is missing", async () => {
    const prices = [price(monthly), price(yearly)];
    const { client, writes } = fakeStripe({ product: product(), keyed: prices, onProduct: prices });
    const result = await applyCatalog(client, "test");
    expect(writes.map((w) => w.params.lookup_key)).toEqual(["templates_3_months"]);
    expect(result.created).toEqual(["price templates_3_months"]);
  });

  it("creates nothing when Stripe already holds the catalog", async () => {
    const { client, writes } = fakeStripe(complete());
    const result = await applyCatalog(client, "test");
    expect(writes).toEqual([]);
    expect(result.created).toEqual([]);
  });

  it("refuses to write anything at all when one existing price differs", async () => {
    // The yearly price is missing AND the quarterly one is wrong: the missing
    // one must NOT be created while a mismatch is unresolved.
    const prices = [price(monthly), price(quarterly, { unit_amount: 2500 })];
    const { client, writes } = fakeStripe({ product: product(), keyed: prices, onProduct: prices });

    const attempt = applyCatalog(client, "test");
    await expect(attempt).rejects.toBeInstanceOf(CatalogMismatchError);
    await expect(attempt).rejects.toThrow(/unit_amount is 2500/);
    expect(writes).toEqual([]);
  });

  it("refuses when the client is in the other mode", async () => {
    const { client, writes } = fakeStripe(complete(), "test");
    await expect(applyCatalog(client, "live")).rejects.toThrow(/livemode is false/);
    expect(writes).toEqual([]);
  });

  it("stops after the product when an empty account turns out to be the other mode", async () => {
    // Nothing in an empty account says which mode it is; the first object
    // created does. No price may follow a product that landed in the wrong one.
    const { client, writes } = fakeStripe({ product: null, keyed: [], onProduct: [] }, "test");
    await expect(applyCatalog(client, "live")).rejects.toThrow(/asked for live.*created.*test/i);
    expect(writes.map((w) => w.kind)).toEqual(["product"]);
  });
});
