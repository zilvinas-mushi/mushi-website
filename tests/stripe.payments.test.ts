/**
 * Layer B — a card is really charged the right amount, on the right schedule.
 *
 * Stripe TEST mode, real API calls, Stripe's own test cards; no money moves
 * and nothing here can reach live (the client for `"test"` is refused a live
 * key before it makes a request). For each plan a customer subscribes and the
 * first invoice is checked; then a Stripe test clock is advanced past the end
 * of the period and the RENEWAL is checked — that second invoice is what
 * proves "Billed every 3 months" is a schedule and not a label.
 *
 * Every customer lives on its own test clock, and deleting the clock deletes
 * the customer, its subscription and its invoices. A run that is killed
 * half-way (a cancelled CI job) cannot clean up after itself, so each run
 * starts by sweeping clocks an earlier one left behind. The Checkout Sessions
 * are expired rather than deleted — Stripe keeps those.
 */
import type Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CHECKOUT_HOST, CURRENCY, PLANS, TEMPLATES_PRODUCT, monthsIn, type Plan, type PlanId, LOCAL_CURRENCIES } from "@/lib/pricing";
import { connect } from "./helpers/stripe.ts";

const connection = connect("test");

const TAG = { created_by: "mushi-website payment tests" };

/** Stripe's calendar arithmetic: the same day and time N months on, clamped to the month's last day. */
function addMonths(unixSeconds: number, months: number): number {
  const from = new Date(unixSeconds * 1000);
  const to = new Date(from);
  to.setUTCDate(1);
  to.setUTCMonth(from.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() + 1, 0)).getUTCDate();
  to.setUTCDate(Math.min(from.getUTCDate(), lastDay));
  return Math.floor(to.getTime() / 1000);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function priceIdFor(stripe: Stripe, plan: Plan): Promise<string> {
  const { data } = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 2 });
  if (data.length !== 1) throw new Error(`${data.length} active prices answer to ${plan.lookupKey}; expected 1`);
  return data[0].id;
}

const CLOCK_NAME = "mushi-website tests: ";

/**
 * A customer on a fresh test clock, with one of Stripe's test cards as its
 * default. The clock's id is handed to `created` the moment it exists, so it
 * is cleaned up even if the very next call throws.
 */
async function customerWithCard(stripe: Stripe, label: string, card: string, created: (clockId: string) => void) {
  const clock = await stripe.testHelpers.testClocks.create({
    frozen_time: Math.floor(Date.now() / 1000),
    name: `${CLOCK_NAME}${label}`,
  });
  created(clock.id);
  const customer = await stripe.customers.create({
    test_clock: clock.id,
    name: `Payment test (${label})`,
    email: `payment-test-${label}@example.com`,
    metadata: TAG,
  });
  const card_ = await stripe.paymentMethods.attach(card, { customer: customer.id });
  return { clock, customer, paymentMethod: card_.id };
}

/** Deletes this suite's clocks that are more than an hour old: debris from a run that was killed. */
async function sweepStaleClocks(stripe: Stripe): Promise<void> {
  const hourAgo = Math.floor(Date.now() / 1000) - 3600;
  const { data } = await stripe.testHelpers.testClocks.list({ limit: 100 });
  const stale = data.filter((c) => c.name?.startsWith(CLOCK_NAME) && c.created < hourAgo && c.status !== "advancing");
  await Promise.all(stale.map((c) => stripe.testHelpers.testClocks.del(c.id)));
}

async function waitUntilReady(stripe: Stripe, clockId: string): Promise<void> {
  const deadline = Date.now() + 240_000;
  for (;;) {
    const clock = await stripe.testHelpers.testClocks.retrieve(clockId);
    if (clock.status === "ready") return;
    if (clock.status !== "advancing") throw new Error(`test clock ${clockId} is ${clock.status}`);
    if (Date.now() > deadline) throw new Error(`test clock ${clockId} was still advancing after 4 minutes`);
    await sleep(2500);
  }
}

type Run = {
  priceId: string;
  first: { subscription: Stripe.Subscription; invoice: Stripe.Invoice };
  renewed: { subscription: Stripe.Subscription; invoices: Stripe.Invoice[] };
  cancelled: Stripe.Subscription;
};

describe.skipIf(connection.skip)("a subscription in Stripe test mode", () => {
  const stripe = connection.stripe as Stripe;
  const clocks: string[] = [];
  const runs = new Map<PlanId, Run>();

  async function subscribeRenewCancel(plan: Plan): Promise<Run> {
    const priceId = await priceIdFor(stripe, plan);
    const { clock, customer, paymentMethod } = await customerWithCard(stripe, plan.id, "pm_card_visa", (id) => clocks.push(id));

    const created = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethod,
      metadata: TAG,
      expand: ["latest_invoice"],
    });
    const first = { subscription: created, invoice: created.latest_invoice as Stripe.Invoice };

    // Two days past the end of the period: the renewal invoice is drafted at
    // the boundary and only finalised and charged about an hour later.
    const periodEnd = created.items.data[0].current_period_end;
    await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: periodEnd + 2 * 24 * 3600 });
    await waitUntilReady(stripe, clock.id);

    const renewedSubscription = await stripe.subscriptions.retrieve(created.id);
    const invoices = await stripe.invoices.list({ subscription: created.id, limit: 10 });
    const cancelled = await stripe.subscriptions.cancel(created.id);

    return {
      priceId,
      first,
      // Oldest first: [0] is the sign-up invoice, [1] the renewal.
      renewed: { subscription: renewedSubscription, invoices: [...invoices.data].sort((a, b) => a.created - b.created) },
      cancelled,
    };
  }

  beforeAll(async () => {
    await sweepStaleClocks(stripe);
    // The three clocks advance side by side; each takes Stripe a while. All
    // three are left to finish before a failure is reported, so that cleanup
    // never deletes a clock another flow is still using.
    const done = await Promise.allSettled(PLANS.map(subscribeRenewCancel));
    const failed = done.find((d) => d.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
    done.forEach((d, i) => d.status === "fulfilled" && runs.set(PLANS[i].id, d.value));
  }, 600_000);

  afterAll(async () => {
    const results = await Promise.allSettled(clocks.map((id) => stripe.testHelpers.testClocks.del(id)));
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) throw new Error(`${failed.length} test clock(s) could not be deleted: ${JSON.stringify(failed)}`);
  }, 120_000);

  describe.each(PLANS)("$id", (plan) => {
    const run = () => runs.get(plan.id) as Run;

    it("subscribes to the catalog's price, on the catalog's product", () => {
      const item = run().first.subscription.items.data[0];
      expect(run().first.subscription.items.data).toHaveLength(1);
      expect(item.price).toMatchObject({
        lookup_key: plan.lookupKey,
        product: TEMPLATES_PRODUCT.id,
        unit_amount: plan.amount,
        currency: CURRENCY,
      });
      expect(item.quantity).toBe(1);
    });

    it("is active as soon as the card is charged", () => {
      expect(run().first.subscription.status).toBe("active");
    });

    it("charges exactly the plan's amount on the first invoice, with nothing added", () => {
      expect(run().first.invoice).toMatchObject({
        status: "paid",
        currency: CURRENCY,
        subtotal: plan.amount,
        total: plan.amount,
        amount_due: plan.amount,
        amount_paid: plan.amount,
        amount_remaining: 0,
        billing_reason: "subscription_create",
        livemode: false,
      });
    });

    it("sets the first period to exactly one billing interval", () => {
      const item = run().first.subscription.items.data[0];
      expect(item.current_period_end).toBe(addMonths(item.current_period_start, monthsIn(plan)));
    });

    it("renews at the end of the period for the same amount, as a second invoice", () => {
      const { invoices } = run().renewed;
      expect(invoices).toHaveLength(2);
      expect(invoices[0].id).toBe(run().first.invoice.id);
      expect(invoices[1].id).not.toBe(run().first.invoice.id);
      expect(invoices[1]).toMatchObject({
        status: "paid",
        currency: CURRENCY,
        subtotal: plan.amount,
        total: plan.amount,
        amount_due: plan.amount,
        amount_paid: plan.amount,
        amount_remaining: 0,
        billing_reason: "subscription_cycle",
      });
    });

    it("starts the second period where the first ended, one interval long again", () => {
      const first = run().first.subscription.items.data[0];
      const item = run().renewed.subscription.items.data[0];
      expect(run().renewed.subscription.status).toBe("active");
      expect(item.current_period_start).toBe(first.current_period_end);
      // Measured from the ORIGINAL start, not from the end of the first
      // period: Stripe keeps the day the subscription was anchored on, so one
      // bought on Jan 31 renews Feb 28 and then Mar 31 — not Mar 28.
      expect(item.current_period_end).toBe(addMonths(first.current_period_start, 2 * monthsIn(plan)));
    });

    it("can be cancelled", () => {
      expect(run().cancelled.status).toBe("canceled");
    });

    it("can be sold through Checkout, for the same total", async () => {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: run().priceId, quantity: 1 }],
        success_url: "https://mushi.agency/templates?checkout=success",
        cancel_url: "https://mushi.agency/templates",
        metadata: TAG,
      });
      // Closed straight away, then judged on what Stripe returned when it
      // was created — so a failed assertion is never hidden behind cleanup.
      const expired = await stripe.checkout.sessions.expire(session.id);
      expect(expired.status).toBe("expired");
      expect(session).toMatchObject({
        mode: "subscription",
        status: "open",
        currency: CURRENCY,
        amount_subtotal: plan.amount,
        amount_total: plan.amount,
        livemode: false,
      });
      // On the account's checkout domain (CHECKOUT_HOST, pricing.ts), and
      // THIS session's page there, not just somewhere on the host.
      const url = new URL(session.url ?? "");
      expect(url.origin).toBe(`https://${CHECKOUT_HOST}`);
      expect(url.pathname).toMatch(/^\/c\/pay\//);
      expect(url.pathname).toContain(session.id);
    });

    // THE SAME NUMBER IN EACH LOCAL CURRENCY (pricing.ts, LOCAL_CURRENCIES;
    // docs/features/0002-local-currency): a session asked for in that
    // currency charges the plan's local amount, not a conversion of the
    // dollar one. This is what the webapp does for a buyer the site has
    // placed in that currency.
    it.each(LOCAL_CURRENCIES)("can be sold through Checkout in %s, for the plan's own amount in it", async (currency) => {
      // The session's shape is the webapp's (mushi-app, lib/billing/checkout.ts):
      // the sheet's in-place card fields, with the currency named.
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ui_mode: "elements",
        currency,
        line_items: [{ price: run().priceId, quantity: 1 }],
        return_url: "https://mushi.agency/thank-you?session_id={CHECKOUT_SESSION_ID}",
        metadata: TAG,
      });
      const expired = await stripe.checkout.sessions.expire(session.id);
      expect(expired.status).toBe("expired");
      expect(session).toMatchObject({
        mode: "subscription",
        currency,
        amount_subtotal: plan.local[currency],
        amount_total: plan.local[currency],
        livemode: false,
      });
    });
  });

  describe("a card that is declined", () => {
    let subscription: Stripe.Subscription;

    beforeAll(async () => {
      const plan = PLANS[0];
      // Attaches without complaint; every charge against it fails.
      const { customer, paymentMethod } = await customerWithCard(stripe, "declined", "pm_card_chargeCustomerFail", (id) => clocks.push(id));
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: await priceIdFor(stripe, plan) }],
        default_payment_method: paymentMethod,
        metadata: TAG,
        expand: ["latest_invoice"],
      });
    });

    it("leaves the subscription incomplete, not active", () => {
      expect(subscription.status).toBe("incomplete");
    });

    it("collects nothing", () => {
      expect(subscription.latest_invoice).toMatchObject({
        status: "open",
        amount_paid: 0,
        amount_due: PLANS[0].amount,
        amount_remaining: PLANS[0].amount,
      });
    });
  });

  describe("a card that needs 3-D Secure", () => {
    let subscription: Stripe.Subscription;

    beforeAll(async () => {
      // The bank wants the customer to confirm, and nobody is there to do it.
      const { customer, paymentMethod } = await customerWithCard(stripe, "3ds", "pm_card_authenticationRequired", (id) => clocks.push(id));
      subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: await priceIdFor(stripe, PLANS[0]) }],
        default_payment_method: paymentMethod,
        metadata: TAG,
        expand: ["latest_invoice"],
      });
    });

    it("is not active until the customer has confirmed", () => {
      expect(subscription.status).toBe("incomplete");
    });

    it("collects nothing in the meantime", () => {
      expect(subscription.latest_invoice).toMatchObject({ status: "open", amount_paid: 0, amount_due: PLANS[0].amount });
    });
  });
});
