"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Appearance,
  StripeCheckoutExpressCheckoutElement,
  StripeCheckoutLoadActionsSuccess,
  StripePaymentElement,
} from "@stripe/stripe-js";
import { CHECKOUT_SESSION_URL, STRIPE_PUBLISHABLE_KEY, planFor } from "@/lib/checkout";
import type { PlanId } from "@/lib/pricing";

/**
 * THE PAYMENT STEP'S WORKING PART (2026-10-04): Stripe's card fields, the
 * email and the Submit button. See `lib/checkout.ts` for how it is wired.
 *
 * THE CARD FIELDS ARE STRIPE'S IFRAMES, styled to the sheet's own field
 * (#222222, Poppins, the violet focus ring). The inputs that stood here
 * before took digits and sent them nowhere; a card number may only ever be
 * typed into Stripe's own fields.
 *
 * NOTHING LOADS UNTIL THIS MOUNTS. Stripe.js and the session are fetched when
 * the buyer reaches the payment step, never with the page — the first screen
 * owes them nothing (CLAUDE.md, the paint gate).
 *
 * IT CANNOT STRAND A BUYER. If the webapp or Stripe.js cannot be reached the
 * fields give way to one line saying so, and Submit goes to the plan's
 * Stripe-hosted page (`fallbackHref`) with the email carried over.
 */

// The sheet's field, in Stripe's vocabulary. Kept in step with FIELD in
// PlanSheet.tsx: #222222, white text, placeholder at 50%, the 8b6ad6 ring.
const APPEARANCE: Appearance = {
  theme: "night",
  labels: "floating",
  variables: {
    colorPrimary: "#8b6ad6",
    colorBackground: "#222222",
    colorText: "#ffffff",
    colorTextPlaceholder: "rgba(255,255,255,0.5)",
    colorDanger: "#de8a8b",
    fontFamily: "Poppins, system-ui, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "10px",
    gridRowSpacing: "3px",
    gridColumnSpacing: "3px",
  },
  rules: {
    ".Input": { border: "1px solid transparent", boxShadow: "none", backgroundColor: "#222222" },
    ".Input:focus": { border: "1px solid #8b6ad6", boxShadow: "0 0 0 1px #8b6ad6" },
    ".Label": { color: "rgba(255,255,255,0.5)" },
    ".Error": { color: "#de8a8b" },
  },
};

// Stripe's iframe cannot see the page's self-hosted Poppins; it loads its own.
const FONTS = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" }];

type State = "loading" | "ready" | "unavailable";

/**
 * THE BUYER'S COUNTRY, WITHOUT ASKING FOR IT. Stripe will not confirm a card
 * payment with no billing country, and the sheet shows no country field
 * (Žilvinas 2026-10-04: card number, expiry, security code — "this info
 * should be enough"). So it is taken from where the request comes from:
 * Cloudflare, which serves this site, reports the visitor's country at
 * /cdn-cgi/trace — the same guess Stripe's own country selector opens on.
 * Off Cloudflare (a local run) the browser's language region stands in.
 *
 * null means neither source knew, and the country field is shown after all:
 * a field too many beats a payment that cannot go through.
 *
 * This is a location guess, good for a card payment. If VAT is ever charged
 * on these plans the country has to be ASKED for — see the PRD's Risks.
 */
async function buyerCountry(): Promise<string | null> {
  try {
    const response = await fetch("/cdn-cgi/trace", { cache: "no-store" });
    const loc = response.ok ? /^loc=([A-Z]{2})$/m.exec(await response.text())?.[1] : undefined;
    // XX is "unknown" and T1 is Tor; neither is a country.
    if (loc && loc !== "XX" && loc !== "T1") return loc;
  } catch {
    // Not on Cloudflare, or offline: fall through to the browser's region.
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = /[-_]([A-Za-z]{2})$/.exec(tag)?.[1];
    if (region) return region.toUpperCase();
  }
  return null;
}

/**
 * How long the fields may take to appear before the sheet stops waiting and
 * offers Stripe's hosted page instead. Without a limit, a stalled request for
 * Stripe.js leaves Submit disabled for good — seen on staging, 2026-10-04.
 */
const LOAD_LIMIT_MS = 12_000;

export function StripePay({
  planId,
  fallbackHref,
  linkFallback,
  divider,
  labels,
  fieldClass,
  submitClass,
  submitIcon,
}: {
  planId: PlanId;
  /** The plan's Stripe-hosted checkout, given the email — where Submit goes if this cannot load. */
  fallbackHref: (email: string) => string;
  /**
   * The sheet's own green "Pay with Link" button, to Stripe's hosted page. It
   * stands until Stripe's Link button is ready and stays if Link is not on
   * offer, so the slot is never empty.
   */
  linkFallback: React.ReactNode;
  /** The "or" rule and the "Card information" label between the Link button and the card fields. */
  divider: React.ReactNode;
  labels: { email: string; submit: string };
  fieldClass: string;
  submitClass: string;
  submitIcon: React.ReactNode;
}) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const linkMount = useRef<HTMLDivElement>(null);
  const actions = useRef<StripeCheckoutLoadActionsSuccess | null>(null);
  const country = useRef<string | null>(null);

  useEffect(() => {
    let gone = false;
    let settled = false;
    let element: StripePaymentElement | null = null;
    let express: StripeCheckoutExpressCheckoutElement | null = null;

    // Whichever comes first decides it: the fields are ready, something
    // failed, or the wait ran out.
    const settle = (next: State) => {
      if (gone || settled) return;
      settled = true;
      window.clearTimeout(limit);
      setState(next);
    };
    const limit = window.setTimeout(() => {
      console.error("[checkout] the in-sheet payment form did not load in time");
      settle("unavailable");
    }, LOAD_LIMIT_MS);

    (async () => {
      const [{ loadStripe }, response, where] = await Promise.all([
        import("@stripe/stripe-js"),
        fetch(CHECKOUT_SESSION_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan: planFor(planId).lookupKey }),
        }),
        buyerCountry(),
      ]);
      country.current = where;
      if (!response.ok) throw new Error(`the webapp answered ${response.status}`);
      const { clientSecret } = (await response.json()) as { clientSecret?: string };
      if (!clientSecret) throw new Error("the webapp sent no client secret");

      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe) throw new Error("Stripe.js did not load");
      const checkout = stripe.initCheckoutElementsSdk({
        clientSecret,
        elementsOptions: { appearance: APPEARANCE, fonts: FONTS },
      });
      const loaded = await checkout.loadActions();
      if (loaded.type !== "success") throw new Error(loaded.error.message);
      // Too late — the sheet has already given up and shown the fallback, or
      // the buyer has left the step.
      if (gone || settled || !mount.current) return;

      // THREE FIELDS AND NOTHING ELSE (Žilvinas 2026-10-04, "this info should
      // be enough"): card number, expiry, security code. No country selector
      // (see buyerCountry), no mandate line, no Link sign-up block — the sheet
      // has its own email field, its own legal line and its own Link button.
      element = checkout.createPaymentElement({
        layout: "tabs",
        terms: { card: "never" },
        fields: { billingDetails: { address: { country: where ? "never" : "auto" } } },
        wallets: { link: "never" },
      });
      element.on("ready", () => settle("ready"));
      element.on("loaderror", () => settle("unavailable"));
      element.mount(mount.current);
      actions.current = loaded.actions;

      // LINK OPENS IN ITS OWN SMALL WINDOW (Žilvinas 2026-10-04, as on
      // Sintra's checkout) rather than taking the whole page to Stripe: that
      // is Stripe's own Link button, which replaces the sheet's green one
      // once it is ready. Card wallets are left out — the slot is one button.
      if (linkMount.current) {
        express = checkout.createExpressCheckoutElement({
          buttonHeight: 50,
          buttonTheme: {},
          buttonType: {},
          layout: { maxColumns: 1, maxRows: 1, overflow: "never" },
          paymentMethodOrder: ["link"],
          paymentMethods: {
            link: "auto",
            applePay: "never",
            googlePay: "never",
            amazonPay: "never",
            paypal: "never",
            klarna: "never",
          },
        });
        express.on("ready", (event) => {
          if (!gone) setLink(Boolean(event.availablePaymentMethods?.link));
        });
        express.on("confirm", (event) => {
          void loaded.actions.confirm({ expressCheckoutConfirmEvent: event }).then((result) => {
            if (!gone && result.type === "error") setError(result.error.message);
          });
        });
        express.mount(linkMount.current);
      }
    })().catch((reason: unknown) => {
      console.error("[checkout] the in-sheet payment form could not load:", reason);
      settle("unavailable");
    });

    return () => {
      gone = true;
      window.clearTimeout(limit);
      actions.current = null;
      element?.destroy();
      express?.destroy();
    };
  }, [planId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    if (state === "unavailable") {
      window.location.href = fallbackHref(email);
      return;
    }
    const checkout = actions.current;
    if (state !== "ready" || !checkout || busy) return;

    setBusy(true);
    setError(null);
    try {
      const withEmail = await checkout.updateEmail(email);
      if (withEmail.type === "error") {
        setError(withEmail.error.message);
        return;
      }
      const result = await checkout.confirm(
        country.current ? { billingAddress: { address: { country: country.current } } } : undefined,
      );
      // On success Stripe is already taking the browser to the Thank You page.
      if (result.type === "error") setError(result.error.message);
    } catch (reason) {
      console.error("[checkout] payment could not be confirmed:", reason);
      setError("Something went wrong and you were not charged. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {/* The Link slot: the sheet's own button until Stripe's is ready, and
          for good if Link is not on offer. Stripe's is mounted from the start
          (it needs a box to draw into) and simply kept out of sight. */}
      <div className="relative mt-[17px] md:mt-[19px]">
        {!link && linkFallback}
        {/* Out of sight, not out of layout: Stripe will not draw its button
            into a box that has no size. */}
        <div ref={linkMount} className={link ? "" : "pointer-events-none absolute inset-x-0 top-0 opacity-0"} aria-hidden={!link} />
      </div>
      {divider}
      {state === "unavailable" ? (
        <p className="mt-[13px] rounded-[10px] bg-[#222222] px-4 py-3 text-[14px] leading-snug text-white/70 md:rounded-[15px] md:text-[17px]">
          Card details are entered on Stripe&rsquo;s secure page. Enter your email and continue.
        </p>
      ) : (
        // The block holds the fields' height in the sheet's own grey while
        // Stripe draws them, so nothing below it moves when they arrive.
        <div
          // The height is held only while Stripe draws: once the fields are
          // in, the block is exactly as tall as they are.
          className={`mt-[13px] rounded-[10px] md:rounded-[15px] ${state === "loading" ? "min-h-[56px] bg-[#222222]" : ""}`}
          aria-busy={state === "loading"}
        >
          <div ref={mount} />
        </div>
      )}

      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder={labels.email}
        className={`${fieldClass} mt-[22px] rounded-[10px] md:mt-[28px] md:rounded-[15px]`}
      />

      {error && (
        <p role="alert" className="mt-3 text-[14px] leading-snug text-[#de8a8b] md:text-[17px]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading" || busy}
        className={`mt-[27px] flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[10px] text-[16px] font-semibold disabled:cursor-wait disabled:opacity-60 md:mt-[34px] md:h-[62px] md:gap-[14px] md:rounded-[15px] md:text-[24px] md:font-medium ${submitClass}`}
      >
        {submitIcon}
        {labels.submit}
      </button>
    </form>
  );
}
