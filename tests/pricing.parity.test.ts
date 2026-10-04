/**
 * Layer A — the site's copy and the billing catalog say the same thing.
 *
 * `src/lib/pricing.ts` is what Stripe charges; `src/lib/content.ts` is what a
 * visitor reads. Every figure in the copy is recomputed here from the catalog
 * and compared as a string, so changing either file alone fails (PRD AC3).
 * No network.
 */
import { describe, expect, it } from "vitest";
import { TEMPLATES_PAGE } from "@/lib/content";
import { CURRENCY, PLANS, TEMPLATES_PRODUCT, monthsIn, type Plan } from "@/lib/pricing";

const copy = TEMPLATES_PAGE.plans;

/** "$10", or "$7.50" when the cents are not zero. */
function usd(cents: number): string {
  if (!Number.isInteger(cents)) throw new Error(`not a whole number of cents: ${cents}`);
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

/** The undiscounted monthly price every "was" and every percentage is measured against. */
const base = PLANS.find((p) => monthsIn(p) === 1);
if (!base) throw new Error("the catalog has no 1-month plan to measure discounts against");

const perMonth = (p: Plan) => p.amount / monthsIn(p);
// In whole cents throughout: (1 - 8 / 10) * 100 is 19.999999999999996 in floating point.
const percentOff = (p: Plan) => {
  const undiscounted = base.amount * monthsIn(p);
  return ((undiscounted - p.amount) * 100) / undiscounted;
};
const cheapest = PLANS.reduce((a, b) => (perMonth(b) < perMonth(a) ? b : a));

function billingLine(p: Plan): string {
  if (p.interval === "year" && p.intervalCount === 1) return "Billed yearly";
  if (p.interval === "month" && p.intervalCount === 1) return "Billed monthly";
  if (p.interval === "month") return `Billed every ${p.intervalCount} months`;
  throw new Error(`no billing sentence for ${p.interval} x ${p.intervalCount}`);
}

// Which plans carry the SAVE badge is a design decision; what the badge SAYS
// is arithmetic and is checked.
const SAVE_BADGE: ReadonlyArray<Plan["id"]> = ["12-months"];

describe("the catalog itself", () => {
  it("bills in US dollars, as every price on the site is written", () => {
    expect(CURRENCY).toBe("usd");
  });

  it("names the product a customer sees on the receipt", () => {
    expect(TEMPLATES_PRODUCT).toEqual({ id: "mushi_templates", name: "Mushi Templates" });
  });

  it("holds the three plans at $10 a month, $24 a quarter and $60 a year", () => {
    expect(PLANS.map((p) => [p.id, p.amount, p.interval, p.intervalCount])).toEqual([
      ["1-month", 1000, "month", 1],
      ["3-months", 2400, "month", 3],
      ["12-months", 6000, "year", 1],
    ]);
  });

  it("gives every plan its own id and its own lookup key", () => {
    expect(new Set(PLANS.map((p) => p.id)).size).toBe(PLANS.length);
    expect(new Set(PLANS.map((p) => p.lookupKey)).size).toBe(PLANS.length);
  });

  it.each(PLANS)("$id has a lookup key Stripe accepts and a human can read", (p) => {
    expect(p.lookupKey).toMatch(/^templates_[a-z0-9_]+$/);
  });

  it.each(PLANS)("$id charges a positive whole number of cents that divides evenly by month", (p) => {
    expect(Number.isInteger(p.amount)).toBe(true);
    expect(p.amount).toBeGreaterThan(0);
    expect(Number.isInteger(perMonth(p))).toBe(true);
  });
});

describe("the Pick your plan sheet", () => {
  it("offers exactly the catalog's plans, in the catalog's order", () => {
    expect(copy.options.map((o) => o.id)).toEqual(PLANS.map((p) => p.id));
  });

  it("opens on the plan the page advertises: the cheapest per month", () => {
    expect(copy.defaultId).toBe(cheapest.id);
  });

  it("labels the per-month price as per month", () => {
    expect(copy.perMonth).toBe("/month");
  });

  describe.each(PLANS)("$id", (plan) => {
    const shown = copy.options.find((o) => o.id === plan.id);
    if (!shown) throw new Error(`the sheet has no option for ${plan.id}`);
    const months = monthsIn(plan);

    it("is named for its length", () => {
      expect(shown.name).toBe(`${months}-month${months === 1 ? "" : "s"}`);
    });

    it("shows the per-month price: the charge divided by its months", () => {
      expect(shown.price).toBe(usd(perMonth(plan)));
    });

    it("shows the total that is actually charged each period", () => {
      expect(shown.total).toBe(`${usd(plan.amount)} total`);
    });

    it("describes the billing interval Stripe will use", () => {
      expect(shown.billing).toBe(billingLine(plan));
    });

    it("strikes through the 1-month price only when it is cheaper than that", () => {
      expect(shown.was).toBe(perMonth(plan) < base.amount ? usd(base.amount) : null);
    });

    it("claims the percentage it really saves", () => {
      const pct = percentOff(plan);
      expect(Number.isInteger(pct)).toBe(true);
      expect(shown.off).toBe(pct > 0 ? `-${pct}% OFF` : null);
    });

    it("claims the dollars it really saves over paying monthly", () => {
      const saved = base.amount * months - plan.amount;
      expect(shown.save).toBe(SAVE_BADGE.includes(plan.id) ? `SAVE ${usd(saved)}` : null);
    });
  });
});

describe("the same prices elsewhere on /templates", () => {
  it("the Access card shows the cheapest per-month price", () => {
    expect(TEMPLATES_PAGE.access.templates.figure).toBe(usd(perMonth(cheapest)));
    expect(TEMPLATES_PAGE.access.templates.unit).toBe(copy.perMonth);
  });

  it("the Access card's discount chip is that plan's real discount", () => {
    expect(TEMPLATES_PAGE.access.templates.chip).toBe(`${percentOff(cheapest)}% Discount`);
  });

  it("the comparison table's Lowest Starting Price is the cheapest per-month price", () => {
    const row = TEMPLATES_PAGE.comparison.rows.find((r) => r.label === "Lowest Starting Price");
    expect(row?.mushi).toBe(usd(perMonth(cheapest)));
  });

  it("the phone header's offer is the largest discount there really is", () => {
    const largest = Math.max(...PLANS.map(percentOff));
    expect(TEMPLATES_PAGE.mobileCta).toBe(`Redeem ${largest}% Off`);
  });

  it("the Showcase's cents-per-design is the cheapest month divided by the templates it buys", () => {
    const templates = Number(/^(\d+)\+ static templates$/.exec(copy.includes)?.[1]);
    expect(templates).toBe(500);
    const cents = perMonth(cheapest) / templates;
    expect(TEMPLATES_PAGE.showcase.heading).toBe(`${cents} cent = 1 design`);
  });
});
