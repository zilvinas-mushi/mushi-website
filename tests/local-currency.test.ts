/**
 * PRICES IN THE VISITOR'S OWN CURRENCY (docs/features/0002-local-currency).
 * What the site shows is what Stripe charges, so the pieces that carry a
 * currency are held to each other here: the catalog (the same number in
 * every currency), the head script that names the visitor's currency before
 * the first paint, the CSS that shows one figure and hides the rest, the
 * markup that renders every figure in every currency, and the request that
 * tells the webapp which currency to charge. No network.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Money } from "@/components/Money";
import { SYMBOL, inCurrency, money } from "@/lib/money";
import { CURRENCY_ZONES, PAINT_GATE_SCRIPT } from "@/lib/paint-gate-script";
import { CURRENCY, LOCAL_CURRENCIES, PLANS, amountIn } from "@/lib/pricing";

const read = (path: string) => readFileSync(path, "utf8");

describe("the catalog", () => {
  it("sells every plan in at least one local currency", () => {
    expect(LOCAL_CURRENCIES.length).toBeGreaterThan(0);
    expect(LOCAL_CURRENCIES).not.toContain(CURRENCY);
  });

  it.each(LOCAL_CURRENCIES)("charges the SAME NUMBER in %s as in dollars, for every plan — the rule the page's symbol swap rests on", (currency) => {
    for (const plan of PLANS) {
      expect(plan.local[currency]).toBe(plan.amount);
      expect(amountIn(plan, currency)).toBe(plan.amount);
    }
  });

  it("has a symbol for every currency it sells in", () => {
    for (const currency of [CURRENCY, ...LOCAL_CURRENCIES] as const) expect(SYMBOL[currency]).toMatch(/^(\S|[A-Z]{3} )$/);
  });

  it("writes a figure the way content.ts does", () => {
    expect(money(1000)).toBe("$10");
    expect(money(750)).toBe("$7.50");
    expect(money(6000, "eur")).toBe("€60");
    expect(money(6000, "gbp")).toBe("£60");
    expect(money(6000, "chf")).toBe("CHF 60");
    expect(inCurrency("SAVE $60", "eur")).toBe("SAVE €60");
    expect(inCurrency("$24 total", "chf")).toBe("CHF 24 total");
    expect(inCurrency("$24 total", "usd")).toBe("$24 total");
  });
});

describe("the head script", () => {
  it("is still valid JavaScript — a syntax error there leaves the page blank for good", () => {
    expect(() => new Function(PAINT_GATE_SCRIPT)).not.toThrow();
  });

  it("names only a currency the catalog sells in, from the query, the session or the time zone", () => {
    expect(PAINT_GATE_SCRIPT).toContain(`var sold=${JSON.stringify([CURRENCY, ...LOCAL_CURRENCIES])}`);
    expect(PAINT_GATE_SCRIPT).toContain("currency=([a-z]{3})");
    expect(PAINT_GATE_SCRIPT).toContain("ss.getItem('currency')");
    expect(PAINT_GATE_SCRIPT).toContain("Intl.DateTimeFormat().resolvedOptions().timeZone");
    expect(PAINT_GATE_SCRIPT).toContain("root.setAttribute('data-currency',c)");
    // Every local currency has its zones, with the slashes escaped inside the regex literal.
    expect(CURRENCY_ZONES.map(([c]) => c)).toEqual([...LOCAL_CURRENCIES]);
    for (const currency of LOCAL_CURRENCIES) expect(PAINT_GATE_SCRIPT).toContain(`.test(tz))c='${currency}';`);
    expect(PAINT_GATE_SCRIPT).toContain("Europe\\/(");
    expect(PAINT_GATE_SCRIPT).not.toMatch(/Europe\/\(/);
    // Liechtenstein is on the franc; the Channel Islands on the pound.
    expect(CURRENCY_ZONES.find(([c]) => c === "chf")?.[1].join()).toContain("Vaduz");
    expect(CURRENCY_ZONES.find(([c]) => c === "eur")?.[1].join()).not.toContain("Vaduz");
    expect(CURRENCY_ZONES.find(([c]) => c === "gbp")?.[1].join()).toContain("Jersey");
  });
});

describe("the page", () => {
  const css = read("src/app/globals.css");

  it("shows one figure and hides the others, by the currency on <html>", () => {
    expect(css).toContain('[data-money]:not([data-money="usd"]) {\n  display: none;\n}');
    for (const currency of LOCAL_CURRENCIES) {
      expect(css).toContain(`html[data-currency="${currency}"] [data-money="usd"] {\n  display: none;\n}`);
      expect(css).toContain(`html[data-currency="${currency}"] [data-money="${currency}"] {\n  display: inline;\n}`);
    }
  });

  it("renders a figure in every currency, the dollar one first", () => {
    const html = renderToStaticMarkup(createElement(Money, null, "SAVE $60"));
    expect(html).toContain('<span data-money="usd">SAVE $60</span><span data-money="eur">SAVE €60</span><span data-money="gbp">SAVE £60</span>');
    // A code with no sign of its own is set small beside the figure, joined by a narrow no-break space.
    expect(html).toContain('<span data-money="chf">SAVE <span class="inline-block text-[0.55em] font-semibold">CHF</span>\u202f60</span>');
    expect(html.match(/data-money=/g)).toHaveLength(1 + LOCAL_CURRENCIES.length);
  });

  it("sends every plan figure through <Money>", () => {
    const sheet = read("src/components/PlanSheet.tsx");
    for (const figure of ["o.save", "o.total", "o.was", "o.price", "plan.price", "due.was", "due.price"]) {
      expect(sheet).toContain(`<Money>{${figure}}</Money>`);
      expect(sheet).not.toMatch(new RegExp(`[^>]\\{${figure.replace(".", "\\.")}\\}`));
    }
    const sections = read("src/components/TemplateSections.tsx");
    expect(sections).toContain("<Money>{a.templates.figure}</Money>");
    expect(sections).toContain('{mushi && v.includes("$") ? <Money>{v}</Money> : v}');
  });
});

describe("the charge", () => {
  it("asks the webapp for the session in the currency the page was painted in, and names no currency for dollars", () => {
    const lib = read("src/lib/checkout.ts");
    expect(lib).toContain("...(currencyOnPage() === CURRENCY ? {} : { currency: currencyOnPage() })");
  });
});
