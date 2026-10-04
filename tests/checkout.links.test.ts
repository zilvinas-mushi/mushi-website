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
import { CHECKOUT_SESSION_URL, STRIPE_PUBLISHABLE_KEYS, dueToday, usd } from "@/lib/checkout";
import { TEMPLATES_PAGE } from "@/lib/content";
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
  const pay = read("src/components/StripePay.tsx");

  it("pays in place: step one leads to the payment step, which mounts Stripe's fields", () => {
    expect(sheet).toMatch(/onClick=\{goPay\}/);
    expect(sheet).toContain("<StripePay");
    expect(pay).toContain("initCheckoutElementsSdk");
    expect(pay).toContain("createPaymentElement");
  });

  it("has no card input of its own: a card number is only ever typed into Stripe's fields", () => {
    for (const source of [sheet, pay]) {
      expect(source).not.toMatch(/autoComplete="cc-(number|exp|csc)"/);
    }
  });

  it("asks the webapp for the session of the chosen plan, by lookup key", () => {
    expect(pay).toContain("fetch(CHECKOUT_SESSION_URL");
    expect(pay).toContain("JSON.stringify({ plan: planFor(planId).lookupKey })");
  });

  it("loads Stripe.js when the sheet is opened, never with the page", () => {
    expect(pay).toContain('import("@stripe/stripe-js")');
    expect(pay).not.toMatch(/^import \{[^}]*loadStripe[^}]*\} from "@stripe\/stripe-js"/m);
    expect(sheet).not.toContain("@stripe/stripe-js");
    // The preload hangs on the sheet's open(), which only a click or #buy calls.
    expect(sheet).toMatch(/const open = \(\) => \{[\s\S]{0,260}preloadStripe\(\);/);
  });

  it("says what is wrong once: Stripe's per-field line is collapsed, the sheet's alert speaks", () => {
    expect(pay).toContain('".Error": { fontSize: "0px", lineHeight: "0px", margin: "0px", marginTop: "-4px", padding: "0px", opacity: "0" }');
    expect(pay).toContain('role="alert"');
  });

  it("rings the field in use, not the whole card block", () => {
    expect(pay).toMatch(/"\.Input:focus": \{ boxShadow: `inset 0 0 0 \$\{desktop \? "1\.25px" : "2px"\} #8b6ad6` \}/);
    expect(pay).not.toContain("setFocused");
  });

  it("keeps the email field dark when the browser autofills it", () => {
    expect(sheet).toContain("autofill:shadow-[inset_0_0_0_1000px_#222222]");
    expect(sheet).toContain("autofill:[-webkit-text-fill-color:#ffffff]");
  });

  it("checks the email itself and says so in the sheet, not in the browser's bubble", () => {
    expect(pay).toContain("<form onSubmit={onSubmit} noValidate>");
    expect(pay).toContain('setError("Please enter your email.");');
    expect(pay).toContain('setError("Enter a valid email address.");');
    expect(pay).not.toMatch(/name="email"\s+required/);
  });

  it("can always be paid: Stripe's hosted page is the fallback and the Pay with Link target", () => {
    expect(sheet).toContain("const hosted = checkoutUrl(plan.id as PlanId);");
    expect(sheet).toMatch(/<a\s+href=\{hosted\}/);
    expect(sheet).toContain("fallbackHref={(email) => checkoutUrl(plan.id as PlanId, undefined, email || undefined)}");
    expect(pay).toContain('if (stateNow.current === "unavailable") {');
    expect(pay).toContain("window.location.href = fallbackHref(email);");
  });

  it("loads the payment step behind the plan step, and leaves nothing dead while it does", () => {
    // Rendered with the sheet, not when Buy is pressed: hidden, inert, sized.
    expect(sheet).toContain('{step === "plan" && (');
    expect(sheet).toContain('inert={step === "plan"}');
    // Submit is never disabled for loading — it holds the press instead.
    expect(pay).toContain("disabled={busy}");
    expect(pay).not.toContain('disabled={state === "loading"');
    expect(pay).toContain("await settledOnce.current;");
    // A press on the stand-in fields is honoured when Stripe's arrive.
    expect(pay).toContain('if (next === "ready" && wantsFocus.current) element?.focus();');
  });

  it("shows three card fields and nothing else: no country selector, mandate line or Link sign-up", () => {
    expect(pay).toContain('terms: { card: "never" }');
    expect(pay).toContain('fields: { billingDetails: { address: { country: where ? "never" : "auto" } } }');
    expect(pay).toContain('wallets: { link: "never" }');
  });

  it("supplies the billing country itself, from Cloudflare's report of where the visitor is", () => {
    expect(pay).toContain('fetch("/cdn-cgi/trace"');
    expect(pay).toContain("{ billingAddress: { address: { country: country.current } } }");
  });

  it("opens Pay with Link in its own small window, and falls back to the plain link if that is blocked", () => {
    expect(sheet).toMatch(/window\.open\(hosted, "mushi-checkout", `popup,/);
    expect(sheet).toContain("if (popup) e.preventDefault();");
  });

  it("never waits for ever: a stalled load gives way to the hosted page within a limit", () => {
    expect(pay).toMatch(/const LOAD_LIMIT_MS = 12_000;/);
    expect(pay).toMatch(/window\.setTimeout\(\(\) => \{[\s\S]{0,160}settle\("unavailable"\);[\s\S]{0,20}\}, LOAD_LIMIT_MS\)/);
  });

  it("shows what is charged today, not the per-month figure", () => {
    expect(sheet).toContain("const due = dueToday(plan.id as PlanId);");
    expect(sheet).toContain("{due.price}");
    expect(sheet).not.toMatch(/totalLabel[\s\S]{0,900}\{plan\.price\}/);
  });

  it("opens by itself on /templates#buy, once the page has finished painting", () => {
    expect(sheet).toContain('export const BUY_HASH = "#buy";');
    expect(sheet).toContain("if (window.location.hash !== BUY_HASH) return;");
    expect(sheet).toMatch(/attributeFilter: \["data-ready"\]/);
  });

  it("no longer hands the purchase to the webapp", () => {
    expect(sheet).not.toContain("?plan=");
  });
});

describe("the in-sheet checkout's configuration", () => {
  it("has a publishable key for each mode, and nothing but publishable keys", () => {
    expect(STRIPE_PUBLISHABLE_KEYS.test).toMatch(/^pk_test_[A-Za-z0-9]{90,}$/);
    expect(STRIPE_PUBLISHABLE_KEYS.live).toMatch(/^pk_live_[A-Za-z0-9]{90,}$/);
  });

  it("both keys belong to the one Stripe account", () => {
    // A Stripe key carries its account's id after the mode.
    expect(STRIPE_PUBLISHABLE_KEYS.test).toContain("_51Q7Da8026uErRlIm");
    expect(STRIPE_PUBLISHABLE_KEYS.live).toContain("_51Q7Da8026uErRlIm");
  });

  it("asks the webapp for sessions unless a build points it elsewhere", () => {
    expect(CHECKOUT_SESSION_URL).toBe("https://app.mushi.agency/api/checkout/session");
  });

  it.each([
    ["1-month", "$10", null],
    ["3-months", "$24", "$30"],
    ["12-months", "$60", "$120"],
  ] as const)("%s is due %s today, against %s at the monthly price", (planId, price, was) => {
    expect(dueToday(planId)).toEqual({ price, was });
  });

  it.each(PLANS)("$id: what is due today is the catalog's charge, and its discount is the pill's", (plan) => {
    const due = dueToday(plan.id);
    expect(due.price).toBe(usd(plan.amount));
    const shown = TEMPLATES_PAGE.plans.options.find((o) => o.id === plan.id);
    const was = due.was ? Number(due.was.slice(1)) * 100 : plan.amount;
    const pct = ((was - plan.amount) * 100) / was;
    expect(shown?.off ?? null).toBe(pct > 0 ? `-${pct}% OFF` : null);
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

  it("hands a payment made in the small window back to the tab that opened it", () => {
    expect(page).toContain('window.name==="mushi-checkout"&&window.opener');
    expect(page).toContain("window.opener.location.href=location.href;window.close()");
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
