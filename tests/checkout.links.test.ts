/**
 * The checkout hand-off (2026-10-04, the launch): every Buy on the sheet goes
 * to that plan's Stripe Payment Link, and Stripe sends the buyer back to the
 * Thank You page. No network — what each link SELLS is checked against Stripe
 * separately (`docs/features/0001-stripe-pricing/PLAN.md`, Deferred).
 *
 * The "live" expectations are what stop a build with a missing live link
 * from shipping a Buy button that goes nowhere.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAYMENT_LINKS, PLANS, THANK_YOU_PATH, checkoutUrl } from "@/lib/pricing";

const read = (path: string) => readFileSync(path, "utf8");

describe("payment links", () => {
  it("there is one pair for every plan and for nothing else", () => {
    expect(Object.keys(PAYMENT_LINKS).sort()).toEqual(PLANS.map((p) => p.id).sort());
  });

  it.each(PLANS)("$id has a test-mode link on Stripe's checkout domain", (plan) => {
    expect(PAYMENT_LINKS[plan.id].test).toMatch(/^https:\/\/buy\.stripe\.com\/test_[A-Za-z0-9]+$/);
  });

  it.each(PLANS)("$id has a LIVE link, and it is not a test one", (plan) => {
    const { live } = PAYMENT_LINKS[plan.id];
    expect(live).toMatch(/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/);
    expect(live).not.toMatch(/\/test_/);
  });

  it("no two plans share a link", () => {
    const all = PLANS.flatMap((p) => [PAYMENT_LINKS[p.id].test, PAYMENT_LINKS[p.id].live]);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("checkoutUrl", () => {
  it("is the plan's link in the mode asked for", () => {
    expect(checkoutUrl("3-months", "test")).toBe(PAYMENT_LINKS["3-months"].test);
    expect(checkoutUrl("3-months", "live")).toBe(PAYMENT_LINKS["3-months"].live);
  });

  it("is live unless the build asks for test mode", () => {
    expect(checkoutUrl("12-months")).toBe(PAYMENT_LINKS["12-months"].live);
  });

  it("carries the buyer's email to Stripe, encoded", () => {
    expect(checkoutUrl("1-month", "test", "a+b@example.com")).toBe(
      `${PAYMENT_LINKS["1-month"].test}?prefilled_email=a%2Bb%40example.com`,
    );
  });
});

describe("the plan sheet", () => {
  const sheet = read("src/components/PlanSheet.tsx");

  it("sends Buy to Stripe's checkout for the chosen plan", () => {
    expect(sheet).toContain("const checkout = checkoutUrl(plan.id as PlanId);");
    expect(sheet).toMatch(/<a\s+href=\{checkout\}/);
  });

  it("no longer hands the purchase to the webapp", () => {
    expect(sheet).not.toContain("?plan=");
  });
});

describe("the Thank You page", () => {
  const page = read("src/app/thank-you/page.tsx");

  it("lives where Stripe is told to send the buyer", () => {
    expect(THANK_YOU_PATH).toBe("/thank-you");
  });

  it("is not indexed, not in the sitemap, and disallowed for crawlers", () => {
    expect(page).toContain("robots: { index: false, follow: false }");
    expect(read("src/app/sitemap.ts")).not.toContain("thank-you");
    expect(read("src/app/robots.ts")).toContain('disallow: "/thank-you"');
  });

  it("sends away anyone who did not arrive from a Stripe checkout", () => {
    expect(page).toContain('location.replace("/templates")');
    const guard = /if\(!(\/.+\/)\.test\(location\.search\)\)/.exec(page)?.[1];
    expect(guard).toBeDefined();
    const pattern = new RegExp((guard as string).slice(1, -1));
    expect(pattern.test("?session_id=cs_live_a1B2c3")).toBe(true);
    expect(pattern.test("?utm=x&session_id=cs_test_a1B2c3")).toBe(true);
    expect(pattern.test("")).toBe(false);
    expect(pattern.test("?session_id=")).toBe(false);
    expect(pattern.test("?session_id=hello")).toBe(false);
  });

  it("tells the buyer the three things they need, and where to look if the email is missing", () => {
    expect(page).toContain("same email address you used when buying");
    expect(page).toContain("6-digit access code");
    expect(page).toContain("Check your spam folder");
    expect(page).toContain("href={`${APP_URL}/login`}");
  });
});
