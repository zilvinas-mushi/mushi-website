"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Appearance,
  StripeCheckoutExpressCheckoutElement,
  StripeCheckoutLoadActionsSuccess,
  StripePaymentElement,
} from "@stripe/stripe-js";
import { CHECKOUT_SESSION_URL, STRIPE_PUBLISHABLE_KEY, checkoutSession } from "@/lib/checkout";
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
 * NOTHING LOADS UNTIL THIS MOUNTS, AND IT MOUNTS WITH THE SHEET — behind the
 * plan step, one of these for each plan, so the session, Stripe's checkout
 * and its fields load while the buyer is choosing a plan and are simply
 * there when Buy is pressed, whichever plan it is (PlanSheet.tsx). Never with the page: the first screen owes them nothing
 * (CLAUDE.md, the paint gate).
 *
 * NOTHING HERE IS DEAD WHILE IT LOADS (Žilvinas 2026-10-04, "you cannot
 * select card parts", "it did not let me press Complete purchase"). If the
 * buyer does get here first — a fast click, a slow network — a press on the
 * stand-in fields is remembered and the real field takes focus the moment it
 * is in, and Submit is never disabled for loading: it holds the press and
 * carries on once the fields are ready.
 *
 * IT CANNOT STRAND A BUYER. If the webapp or Stripe.js cannot be reached the
 * fields give way to one line saying so, and Submit goes to the plan's
 * Stripe-hosted page (`fallbackHref`) with the email carried over.
 */

// The sheet's field, in Stripe's vocabulary. Kept in step with FIELD in
// PlanSheet.tsx: #222222, white text, placeholder at 50%, the 8b6ad6 ring.
/**
 * THE DESKTOP FIELDS ARE DRAWN AT 1.6x (the scaled box round the mount,
 * below), so what is given to Stripe there is the frame's field divided by
 * 1.6: 14px type for the frame's 22, a 35px field for its 56.
 */
/**
 * EVERY EDGE OF THE RING IS THE SHEET'S, NONE OF THEM STRIPE'S (Žilvinas
 * 2026-10-06, "the top seems to be cut"). The ring's inner edge was always
 * the sheet's mask, but its outer edge was the edge of Stripe's field — and
 * the two are drawn by different documents, each snapped to the screen's
 * pixels on its own. Where they disagreed by a pixel the ring lost it: on a
 * 1x screen the expiry's and the security code's top edge was 1px against 2
 * on the other three sides, and on a short window the number's was 5 over 3.
 *
 * So while the ring is shaped, each of Stripe's fields is this much LARGER
 * than the cell the buyer sees, on every side: the gaps between the fields
 * are closed (2px less this, twice), the padding is grown to match so nothing
 * inside a field moves, and the mount box hangs out of the block by the same
 * amount (the -m-px beside it). The extra is under the sheet's seams and
 * outside the block's clip, so what bounds the ring is the seam or the clip
 * on one side and the mask on the other — one document, one pixel grid.
 * It is 1 because the seams are 2: the fields then meet under the middle of
 * each seam.
 */
const OVERSCAN = 1;

function appearance(desktop: boolean, shaped: boolean): Appearance {
  // The ring as the buyer sees it, and as Stripe is asked to draw it — see
  // the note on .Input:focus.
  const ring = desktop ? "1.25px" : "2px";
  // Thick enough to fill the masks' rounded corners after the OVERSCAN has
  // taken its share: the curve reaches 3.6 into a desktop field (2.7 on a
  // phone) and at 4 the ring stopped at 3, leaving a nick in each corner.
  const drawn = shaped ? (desktop ? "5px" : "6px") : ring;
  const over = shaped ? OVERSCAN : 0;
  return {
    theme: "night",
    // THE FRAME'S FIELDS HAVE PLACEHOLDERS AND NO LABELS (Žilvinas 2026-10-04,
    // off the Figma frame): "1234 1234 1234 1234", "MM / YY", "CVC". Stripe
    // only shows those placeholders in its "above" label mode, so the labels
    // are kept and collapsed to nothing below.
    labels: "above",
    variables: {
      colorPrimary: "#8b6ad6",
      colorBackground: "#222222",
      colorText: "#ffffff",
      colorTextPlaceholder: "rgba(255,255,255,0.5)",
      colorDanger: "#de8a8b",
      fontFamily: "Poppins, system-ui, sans-serif",
      fontSizeBase: desktop ? "14px" : "18px",
      // ONE BLOCK WITH SEAMS: fields 2px apart inside a rounded box. The
      // seams are drawn by the sheet (see the mount box); the fields carry
      // the block's corner radius themselves, for the focus ring below.
      borderRadius: "0px",
      gridRowSpacing: `${2 - 2 * over}px`,
      gridColumnSpacing: `${2 - 2 * over}px`,
    },
    rules: {
      ".Input": {
        border: "0",
        boxShadow: "none",
        backgroundColor: "#222222",
        // Square when the ring is shaped by the sheet (see .Input:focus);
        // otherwise the block's radius: 10 on a phone, 15 on desktop (÷1.6).
        borderRadius: shaped ? "0px" : desktop ? "9.375px" : "10px",
        // A ROW IS 35 TALL ON DESKTOP AND 45 ON A PHONE, AND THE LINE IS
        // TALLER THAN POPPINS' OWN (Žilvinas 2026-10-06, "it's very bad for
        // phone"). The rows were 17 + 2x9 and 23 + 2x11. WebKit will not give
        // a text field a line shorter than its font's natural one — 1.5em
        // for Poppins, 21 and 27 — so in Safari, which is every browser on
        // an iPhone, each row came out 4px taller: the seams and the masks
        // sat 4px off the fields and the ring fell back to the plain one.
        // 23 + 2x6 and 29 + 2x8 are the same rows, with the line clear of
        // the font's at any zoom; the text sits where it did.
        padding: desktop ? `${6 + over}px ${14 + over}px` : `${8 + over}px ${16 + over}px`,
        lineHeight: desktop ? "23px" : "29px",
      },
      // THE RING IS ON THE FIELD IN USE, NOT ON THE BLOCK (Žilvinas
      // 2026-10-04, "why the selection is for all combined section"), AND IT
      // TAKES THE BLOCK'S SHAPE (same day, off the frame: "selection should
      // look like this"): round only where the field meets the block's own
      // corner — the number's two top corners, the expiry's bottom left, the
      // security code's bottom right — and square everywhere else.
      //
      // Stripe offers no way to style one field differently from the next,
      // and does not say which field has focus. So Stripe draws a ring that
      // is square and TOO THICK on whichever field is in use, and the sheet
      // lays a fixed frame of the field's own grey over each field (the
      // masks beside the seams, below) that covers everything but the 2px
      // band the ring should be — with the rounding the frame shows. With
      // no ring under it a mask is grey on grey and cannot be seen.
      //
      // `shaped` is off when the country field has to be shown: the masks
      // only know the three card fields, so that case keeps the plain ring
      // with the block's radius on every corner.
      ".Input:focus": { boxShadow: `inset 0 0 0 ${drawn} #8b6ad6` },
      // A field Stripe has refused wears the same ring in the error colour.
      // WHAT is wrong is said once, by the sheet's own line under the button
      // — Stripe's line under each field is collapsed, like its labels: two
      // voices saying the same thing in two styles looked broken.
      ".Input--invalid": { color: "#de8a8b", boxShadow: `inset 0 0 0 ${drawn} rgba(222,138,139,0.6)` },
      ".Label": { fontSize: "0px", lineHeight: "0px", margin: "0", padding: "0", opacity: "0" },
      // The -4px takes back the 4px Stripe still leaves above a collapsed
      // error line, so a refused field does not push the row under it down
      // and off the seams.
      ".Error": { fontSize: "0px", lineHeight: "0px", margin: "0px", marginTop: "-4px", padding: "0px", opacity: "0" },
    },
  };
}

// Stripe's iframe cannot see the page's self-hosted Poppins; it loads its own.
const FONTS = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" }];

type State = "loading" | "ready" | "unavailable";

/**
 * Stripe.js, fetched once. `preloadStripe` is called when the sheet OPENS
 * (Žilvinas 2026-10-04, "this one loads just after some time"), so that by
 * the time the buyer has picked a plan and reached the payment step the
 * script is already here. Still never with the page itself.
 */
let stripeJs: Promise<import("@stripe/stripe-js").Stripe | null> | null = null;
function getStripe() {
  stripeJs ??= import("@stripe/stripe-js").then(({ loadStripe }) => loadStripe(STRIPE_PUBLISHABLE_KEY));
  return stripeJs;
}
/**
 * The webapp is dialled on the same intent, so the request for a session does
 * not open with a DNS lookup and a TLS handshake. (Not Stripe's API as well:
 * that is called from Stripe's own frames, and a browser keeps a frame's
 * connections apart from the page's.)
 */
let dialled = false;
function preconnect(): void {
  if (dialled) return;
  dialled = true;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = new URL(CHECKOUT_SESSION_URL, window.location.href).origin;
  // The session request carries no credentials, so it rides the anonymous pool.
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}
export function preloadStripe(): void {
  preconnect();
  getStripe().catch(() => {
    // A failed preload is not an error yet; the payment step will try again
    // and fall back to Stripe's hosted page if it still cannot load.
    stripeJs = null;
  });
}

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
async function findBuyerCountry(): Promise<string | null> {
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
/** Asked once for the page: every plan's payment step wants the same answer. */
let whereOnce: Promise<string | null> | null = null;
function buyerCountry(): Promise<string | null> {
  whereOnce ??= findBuyerCountry();
  return whereOnce;
}

/**
 * How long the fields may take to appear before the sheet stops waiting and
 * offers Stripe's hosted page instead. Without a limit, a stalled request for
 * Stripe.js leaves Submit disabled for good — seen on staging, 2026-10-04.
 */
const LOAD_LIMIT_MS = 12_000;
/**
 * How long the finished card fields wait for the Link button to say whether
 * it is coming, before the step is shown with the sheet's own green button.
 * Measured on production: Stripe's button reports within a second of the
 * fields.
 */
const LINK_WAIT_MS = 1500;
/** How long the plan step takes to slide out before the payment step is on stage. */
export const STEP_OUT_MS = 170;

/** Let the main thread draw a frame and answer input before carrying on. */
function yieldToMain(): Promise<void> {
  const s = (window as Window & { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return s?.yield ? s.yield() : new Promise((resolve) => setTimeout(resolve, 0));
}

export function StripePay({
  planId,
  fallbackHref,
  linkFallback,
  divider,
  labels,
  fieldClass,
  submitClass,
  onPresentable,
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
  /**
   * Told `false` when a load starts and `true` when the step can be shown
   * without anything in it still arriving: Stripe's fields are in and their
   * box has stopped moving, or the load has failed and the one-line fallback
   * stands in their place. The sheet holds the step back until then.
   */
  onPresentable?: (ok: boolean, state?: "ready" | "unavailable") => void;
}) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const linkMount = useRef<HTMLDivElement>(null);
  const actions = useRef<StripeCheckoutLoadActionsSuccess | null>(null);
  const country = useRef<string | null>(null);
  // What the load has come to, for code that outlives a render (a Submit
  // that is waiting for it), and the promise such code waits on.
  const stateNow = useRef<State>("loading");
  const settledOnce = useRef<Promise<void>>(Promise.resolve());
  // The buyer pressed the stand-in fields before Stripe's were in.
  const [wanted, setWanted] = useState(false);
  // The ring is shaped by the sheet's masks — see appearance().
  const [shaped, setShaped] = useState(true);
  // Stripe has put a ZIP row under the card's three fields — see checkShape.
  const [zip, setZip] = useState(false);
  const ruler = useRef<HTMLDivElement>(null);
  const fields = useRef<HTMLDivElement>(null);
  // A scaled box keeps its unscaled height in the layout, so the block is
  // told how tall the fields are and does the multiplying itself (--rows,
  // on the layer below). See the note on the scaled box.
  useEffect(() => {
    const box = fields.current;
    if (!box || !("ResizeObserver" in window)) return;
    const watch = new ResizeObserver(() => box.parentElement?.style.setProperty("--rows", String(box.offsetHeight)));
    watch.observe(box);
    return () => watch.disconnect();
  }, []);
  const presentable = useRef(onPresentable);
  useEffect(() => {
    presentable.current = onPresentable;
  }, [onPresentable]);
  const wantsFocus = useRef(false);

  useEffect(() => {
    let gone = false;
    let settled = false;
    let element: StripePaymentElement | null = null;
    let express: StripeCheckoutExpressCheckoutElement | null = null;
    let shapeWatch: ResizeObserver | null = null;
    let shapeTimer = 0;
    let rechecks: number[] = [];
    let unwatchWidth = () => {};
    let presentTimer = 0;
    let linkTimer = 0;
    // The Link button has answered — it is here, or it is not coming.
    let linkKnown = () => {};
    const linkAnswered = new Promise<void>((resolve) => (linkKnown = resolve));
    presentable.current?.(false);

    let release = () => {};
    stateNow.current = "loading";
    settledOnce.current = new Promise<void>((resolve) => (release = resolve));

    // Whichever comes first decides it: the fields are ready, something
    // failed, or the wait ran out.
    const settle = (next: State) => {
      if (gone || settled) return;
      settled = true;
      window.clearTimeout(limit);
      stateNow.current = next;
      setState(next);
      release();
      // The press the stand-in took is honoured now.
      if (next === "ready" && wantsFocus.current) element?.focus();
      wantsFocus.current = false;
      // Stripe glides its iframe to its final height for a moment after it
      // reports ready (measured: settled inside 300ms), and everything under
      // the fields moves with it. The step is presentable once that is over
      // — AND ONCE THE LINK SLOT IS SETTLED TOO: the step is shown once,
      // finished, and Stripe's Link button taking the stand-in's place after
      // the step is up is exactly the swap that rule forbids. LINK_WAIT_MS
      // bounds it; past that the stand-in is what the step is shown with.
      presentTimer = window.setTimeout(
        () => {
          if (next !== "ready") return presentable.current?.(true, "unavailable");
          linkTimer = window.setTimeout(linkKnown, LINK_WAIT_MS);
          void linkAnswered.then(() => {
            window.clearTimeout(linkTimer);
            if (!gone) presentable.current?.(true, "ready");
          });
        },
        // 350 is how long the frame takes to stop moving. A held press does
        // not show the step for another STEP_OUT_MS — the plan step slides
        // out first (PlanSheet's showPay) — so the word is given that much
        // sooner and the step still arrives on the 350. With reduced motion
        // there is no slide, and the whole 350 is waited here.
        next === "ready" ? 350 - (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : STEP_OUT_MS) : 0,
      );
    };
    const limit = window.setTimeout(() => {
      console.error("[checkout] the in-sheet payment form did not load in time");
      settle("unavailable");
    }, LOAD_LIMIT_MS);

    (async () => {
      // NOTHING HERE WAITS ITS TURN (Noah 2026-10-05, on the hold after Buy:
      // "way quicker than this" — and the main market is the USA, a further
      // hop from everything). It used to be a relay: the session from the
      // webapp, THEN Stripe's own start-up call with it, THEN the fields'
      // frames — 700 + 450 + 300ms, each waiting for the last. Stripe takes
      // the client secret as a promise, so the frames are created and start
      // loading the moment Stripe.js is here, alongside the session they
      // will show; and the session itself was asked for when the sheet
      // opened (checkoutSession, lib/checkout.ts), for every plan.
      const secret = checkoutSession(planId);
      // Judged below, where it is awaited; this only keeps a failure from
      // being reported twice, as an unhandled rejection.
      secret.catch(() => {});
      const [stripe, where] = await Promise.all([getStripe(), buyerCountry()]);
      country.current = where;
      if (!gone) setShaped(Boolean(where));
      // Where Stripe will ask for a ZIP, as far as can be told before it
      // does; checkShape has the last word.
      if (!gone) setZip(where === "US");

      if (!stripe) throw new Error("Stripe.js did not load");
      // Too late — the sheet has already given up and shown the fallback, or
      // the buyer has left the step.
      if (gone || settled || !mount.current) return;
      const wide = window.matchMedia("(min-width: 768px)");
      let desktop = wide.matches;
      const checkout = stripe.initCheckoutElementsSdk({
        clientSecret: secret,
        elementsOptions: {
          appearance: appearance(desktop, Boolean(where)),
          fonts: FONTS,
        },
      });
      // READY IS BOTH: the fields drawn, and the session's actions in hand —
      // Submit needs the second, and the frames now arrive without it.
      let fieldsIn = false;
      let actionsIn = false;
      const ready = () => {
        if (fieldsIn && actionsIn) settle("ready");
      };

      // THREE FIELDS AND NOTHING ELSE (Žilvinas 2026-10-04, "this info should
      // be enough"): card number, expiry, security code — and, for a buyer
      // in the United States, the ZIP that Stripe adds on its own account
      // (see checkShape; taking it away is a payments decision, not a
      // styling one: it is what a US card is checked against). No country selector
      // (see buyerCountry), no mandate line, no Link sign-up block — the sheet
      // has its own email field, its own legal line and its own Link button.
      element = checkout.createPaymentElement({
        layout: "tabs",
        terms: { card: "never" },
        fields: { billingDetails: { address: { country: where ? "never" : "auto" } } },
        // No wallets either (2026-10-10): left on "auto", the fields probed
        // Google Pay for every plan — a frame and 1.5 MB of pay.google.com
        // each — to decide whether to show a tab the sheet has no room for.
        wallets: { link: "never", applePay: "never", googlePay: "never" },
      });
      // THE MASKS ARE ONLY RIGHT IF STRIPE LAID THE FIELDS OUT AS EXPECTED:
      // the number over the expiry and the security code, in rows of the
      // height asked for. That is Stripe's decision (it arranges by the
      // width it measures), and it cannot be read from inside the iframe —
      // but it shows in the iframe's height: two rows and the seam between
      // them, the 4px the iframe keeps round itself, and the OVERSCAN while
      // the ring is shaped. If it is anything else, the ring goes back to
      // the plain one Stripe draws by itself, which is right in any
      // arrangement. Stripe glides the iframe to its height, so this is
      // asked once the height has stopped moving, and again whenever it
      // moves later.
      //
      // AND NOT BEFORE THE FIELDS ARE IN. The frames are created ahead of
      // the session now, so the iframe can stand 2px tall for longer than
      // the 250ms below; judged then, every plan lost its shaped ring for
      // good (Žilvinas 2026-10-06, off Noah's screenshot: all four corners
      // of the expiry's ring round).
      //
      // AND NEVER FOR GOOD. It used to stop watching at the first misfit, so
      // one look at a frame Stripe had not finished redrawing — it takes its
      // time over a change of appearance — cost the shaped ring until the
      // sheet was built again. Now the plain ring is judged the same way,
      // and gives way to the shaped one as soon as the rows are the ones
      // expected.
      //
      // TWO ROWS, OR THREE WITH A ZIP (2026-10-06; CI had been saying so
      // since the gate first asked about the ring, and it runs in the USA).
      // For a buyer Stripe places in the United States — the main market —
      // it adds a ZIP field under the expiry and the security code: it
      // checks a US card against its postcode. The masks knew two rows, so
      // every US buyer got the plain ring, a seam down the middle of the ZIP
      // field and none above it. The block now has both arrangements, and
      // which one Stripe chose is read off the same height.
      let shapedNow = Boolean(where);
      let zipNow = where === "US";
      const checkShape = () => {
        const box = mount.current;
        // What 1px of the fields comes to on screen: the box is scaled.
        const scale = (ruler.current?.getBoundingClientRect().height ?? 0) / 100;
        if (gone || !fieldsIn || !actionsIn || !box || !scale) return;
        const tall = box.getBoundingClientRect().height / scale - (shapedNow ? 2 * OVERSCAN : 0);
        // n rows, the seams between them, and the 4px the iframe keeps round itself.
        const rows = where ? [2, 3].find((n) => Math.abs(tall - (n * (desktop ? 35 : 45) + (n - 1) * 2 + 8)) <= 1) : undefined;
        const fits = rows !== undefined;
        if (fits && zipNow !== (rows === 3)) {
          zipNow = rows === 3;
          setZip(zipNow);
        }
        if (fits === shapedNow) return;
        shapedNow = fits;
        setShaped(fits);
        checkout.changeAppearance(appearance(desktop, fits));
      };
      const shapeSoon = () => {
        window.clearTimeout(shapeTimer);
        shapeTimer = window.setTimeout(checkShape, 250);
      };
      // AND AGAIN, A FEW TIMES, WITHOUT BEING ASKED. The check runs 250ms
      // after the frame last moved — but a frame can pause mid-glide for
      // longer than that, be judged there, and then settle without another
      // resize to prompt a second look; CI saw two plans of three stay plain
      // that way (2026-10-07, US runner). So after the fields are in it is
      // asked once more at each of these, whatever the frame has done.
      const recheckLater = () => {
        for (const timer of rechecks) window.clearTimeout(timer);
        rechecks = [800, 2000, 4500].map((ms) => window.setTimeout(() => shapeWatch && shapeSoon(), ms));
      };
      if (where && "ResizeObserver" in window) {
        shapeWatch = new ResizeObserver(shapeSoon);
        shapeWatch.observe(mount.current);
      }
      // THE FIELDS FOLLOW THE WINDOW ACROSS THE BREAKPOINT (Žilvinas
      // 2026-10-06, "on mobile its completely fucked"). Which fields Stripe
      // is asked for — the phone's, or the desktop's that are drawn at 1.6x —
      // was decided once, here, while the zoom, the seams and the masks are
      // CSS and change with the window. A sheet built wide and then narrowed
      // (a window dragged in, a tablet turned) kept the desktop's 35px rows
      // at 1x under the phone's 45px seams. Now Stripe is told, and the ring
      // starts over as the shaped one.
      const onWidth = () => {
        if (gone) return;
        desktop = wide.matches;
        shapedNow = Boolean(where);
        setShaped(shapedNow);
        checkout.changeAppearance(appearance(desktop, shapedNow));
        if (shapeWatch) shapeSoon();
        recheckLater();
      };
      wide.addEventListener("change", onWidth);
      unwatchWidth = () => wide.removeEventListener("change", onWidth);
      element.on("ready", () => {
        fieldsIn = true;
        ready();
        // The height may already be the final one, with no resize to come.
        if (shapeWatch) shapeSoon();
        recheckLater();
      });
      element.on("loaderror", () => settle("unavailable"));
      element.mount(mount.current);
      // The Link button's frames in a task of their own (2026-10-10): the
      // card fields' frames above and these together were one long task,
      // and a buyer acting in the sheet while a step builds behind it felt
      // it. A yield between them halves it.
      await yieldToMain();
      if (gone || settled) return;

      // LINK OPENS IN ITS OWN SMALL WINDOW (Žilvinas 2026-10-04, as on
      // Sintra's checkout) rather than taking the whole page to Stripe: that
      // is Stripe's own Link button, which replaces the sheet's green one
      // once it is ready. Card wallets are left out — the slot is one button.
      if (linkMount.current) {
        express = checkout.createExpressCheckoutElement({
          buttonHeight: 50,
          buttonTheme: {},
          buttonType: {},
          // maxRows 0, "as many rows as it takes": the only value Stripe
          // accepts overflow "never" with. It was 1, which Stripe.js throws
          // on — inside the element, so nothing here saw it: the button never
          // reported ready and the sheet's stand-in stayed for good, sending
          // every Link buyer through the hosted page first (2026-10-05).
          layout: { maxColumns: 1, maxRows: 0, overflow: "never" },
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
          linkKnown();
        });
        express.on("loaderror", linkKnown);
        express.on("confirm", (event) => {
          // Stripe's button cannot be pressed before the session is in, so
          // the actions are here by the time this fires.
          void actions.current?.confirm({ expressCheckoutConfirmEvent: event }).then((result) => {
            if (!gone && result.type === "error") setError(result.error.message);
          });
        });
        express.mount(linkMount.current);
      }

      // The webapp's answer, and then Stripe's. A failure of either lands in
      // the catch below and the sheet offers the hosted page instead.
      await secret;
      const loaded = await checkout.loadActions();
      if (loaded.type !== "success") throw new Error(loaded.error.message);
      if (gone) return;
      actions.current = loaded.actions;
      actionsIn = true;
      ready();
      if (shapeWatch) shapeSoon();
    })().catch((reason: unknown) => {
      console.error("[checkout] the in-sheet payment form could not load:", reason);
      settle("unavailable");
    });

    return () => {
      gone = true;
      window.clearTimeout(limit);
      window.clearTimeout(shapeTimer);
      for (const timer of rechecks) window.clearTimeout(timer);
      window.clearTimeout(presentTimer);
      window.clearTimeout(linkTimer);
      shapeWatch?.disconnect();
      unwatchWidth();
      // Nobody is left waiting on a load that has been abandoned.
      release();
      actions.current = null;
      element?.destroy();
      express?.destroy();
    };
  }, [planId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    // The sheet's own message — not the browser's
    // "Please fill in this field" bubble (Žilvinas 2026-10-04).
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (busy) return;
    // PRESSED BEFORE THE FIELDS WERE IN: the press is held, not refused. The
    // button shows it is working, and this carries on when the load settles
    // one way or the other (LOAD_LIMIT_MS bounds it).
    if (stateNow.current === "loading") {
      setBusy(true);
      setError(null);
      await settledOnce.current;
    }
    if (stateNow.current === "unavailable") {
      window.location.href = fallbackHref(email);
      return;
    }
    const checkout = actions.current;
    if (stateNow.current !== "ready" || !checkout) {
      setBusy(false);
      return;
    }

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
    <form onSubmit={onSubmit} noValidate>
      {/* The Link slot: the sheet's own button until Stripe's is ready, and
          for good if Link is not on offer. Stripe's is mounted from the start
          (it needs a box to draw into) and simply kept out of sight. */}
      <div className="relative mt-[17px] md:mt-[19px]">
        {!link && linkFallback}
        {/* Out of sight, not out of layout: Stripe will not draw its button
            into a box that has no size — or into one that clips it to
            nothing, hence the min-height beside the overflow.

            THE STAND-IN'S BOX, so the swap moves nothing: 50 tall and radius
            10 on a phone, 62 and 15 from md up. Stripe's button stops at 55
            and takes its corners from the card fields' appearance (square),
            so on desktop it is drawn at 1.24x — 50 as 62 — and this box's
            own rounded corners clip it. Stripe keeps a 4px margin round its
            iframe outside the box, which the clip takes off too. Scaled the
            way the card fields are, and for the same reason: see there. */}
        <div
          className={`h-[50px] overflow-hidden rounded-[10px] md:h-[62px] md:rounded-[15px] ${link ? "" : "pointer-events-none absolute inset-x-0 top-0 opacity-0"}`}
          aria-hidden={!link}
        >
          <div
            ref={linkMount}
            // touch-none: a finger panning over Stripe's frame must not scroll
            // the page behind the sheet (PlanSheet, the lock).
            className="stripe-grow min-h-[50px] touch-none [--grow:1.24]"
          />
        </div>
      </div>
      {divider}
      {state === "unavailable" ? (
        <p className="mt-[13px] rounded-[10px] bg-[#222222] px-4 py-3 text-[14px] leading-snug text-white/70 md:rounded-[15px] md:text-[17px]">
          Card details are entered on Stripe&rsquo;s secure page. Enter your email and continue.
        </p>
      ) : (
        // The block holds the fields' height in the sheet's own grey while
        // Stripe draws them, so nothing below it moves when they arrive.
        // THE FRAME'S ARRANGEMENT: the number across the top, MM/YY and CVC
        // side by side under it, one block with rounded outer corners. Stripe
        // arranges its card fields by the WIDTH it is given — stacked like
        // this when narrow, all in one row when wide — so from md up it is
        // given a phone's width and drawn at 1.6x (the scaled box below).
        // The rounded corners are this block's; the fields inside are square.
        <div
          // The height is held only while Stripe draws: once the fields are
          // in, the block is exactly as tall as they are.
          className="relative mt-[13px] overflow-hidden rounded-[10px] md:rounded-[15px]"
          aria-busy={state === "loading"}
          // For the checkout gate (tools/page-quality/checkout.mjs).
          data-ring={shaped ? "shaped" : "plain"}
          data-rows={zip ? 3 : 2}
        >
          {/* THE FIELDS ARE THERE FROM THE FIRST FRAME (Žilvinas 2026-10-04):
              while Stripe draws its own, this stand-in holds their exact
              shape and placeholders, and is lifted off when they are ready —
              nothing appears late and nothing below it moves. */}
          {/* A PRESS ON IT IS KEPT: the number row takes the field's ring at
              once and Stripe's own field takes focus when it arrives, so a
              buyer quicker than the load does not meet a dead picture. */}
          {state === "loading" && (
            <div
              aria-hidden="true"
              onPointerDown={() => {
                wantsFocus.current = true;
                setWanted(true);
              }}
              className="flex cursor-text flex-col gap-[2px] text-[18px] leading-[23px] text-white/50 md:gap-[3.2px] md:text-[22.4px] md:leading-[27.2px]"
            >
              <div className={`rounded-t-[10px] bg-[#222222] px-4 py-[11px] md:rounded-t-[15px] md:px-[22.4px] md:py-[14.4px] ${wanted ? "shadow-[inset_0_0_0_2px_#8b6ad6]" : ""}`}>1234 1234 1234 1234</div>
              <div className="grid grid-cols-2 gap-[2px] md:gap-[3.2px]">
                <div className="bg-[#222222] px-4 py-[11px] md:px-[22.4px] md:py-[14.4px]">MM / YY</div>
                <div className="bg-[#222222] px-4 py-[11px] md:px-[22.4px] md:py-[14.4px]">CVC</div>
              </div>
              {/* Stripe's ZIP field and its own placeholder, where it will ask for one. */}
              {zip && <div className="bg-[#222222] px-4 py-[11px] md:px-[22.4px] md:py-[14.4px]">12345</div>}
            </div>
          )}
          {/* Stripe draws underneath the stand-in, out of flow, until ready.
              From md up this layer is as tall as the scaled fields: --rows is
              their own height, kept by the observer above. */}
          <div className={`relative md:h-[calc(var(--rows,72)*1.6px)] ${state === "loading" ? "pointer-events-none absolute inset-x-0 top-0 opacity-0" : ""}`}>
            {/* THE SCALED BOX: 1/1.6 of the block's width, drawn at 1.6x from
                its top left corner, so Stripe sees a phone's width and lays
                the fields out for one.

                HOW IT IS GROWN IS THE BROWSER'S (.stripe-grow, globals.css):
                `zoom` everywhere but WebKit, a transform there. Zoom lays the
                frame out at the small width and DRAWS it at the large one,
                so Stripe's vector icons and type are as sharp as the sheet's
                — a transform scales a picture the frame drew at 1x, and the
                card brands came out soft (Žilvinas 2026-10-10, "why these
                icons look blurred?"). WebKit cannot have the zoom (Žilvinas
                2026-10-06, "did you fix it?" — of desktop Safari): it draws
                what is inside an iframe at the zoom of the box but lays it
                out at the UNZOOMED width, so Stripe saw 727px, put the three
                fields in one row and drew it 1.6x too wide — the security
                code was off the edge. So there, and on every iPad, it stays
                the transform, with the sheet's own fit zoom (`fit`,
                PlanSheet) undone by --unfit and folded into the scale. */}
            <div
              ref={fields}
              // touch-none: see the Link slot.
              className="stripe-grow relative flow-root touch-none bg-[#222222] [--grow:1.6]"
            >
              {/* Out of the block by OVERSCAN on every side while the ring is
                  shaped — see the note there. A flow-root of its own, or its
                  margin and Stripe's -4px would collapse into one; the one
                  round it keeps both inside, so the box's top edge is the
                  first row's. */}
              <div className={shaped ? "-m-px flow-root" : "flow-root"}>
                <div ref={mount} />
              </div>
              {/* 100 of the fields' own pixels, for the fit check to read the
                  scale off. */}
              <div ref={ruler} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 h-[100px] w-0" />
            </div>
            {/* THE SEAMS. Stripe's fields meet under them (OVERSCAN), so the
                2px gaps between the fields are these two lines in the sheet's
                colour. They and the masks are in the SHEET's pixels, outside
                the scaled box — whose every edge is soft — so from md up each
                number is the phone's idea times 1.6: a row is 45 tall on a
                phone and 56 here. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[45px] h-[2px] bg-[#181818] md:top-[56px] md:h-[3.2px]" />
            {/* Between the expiry and the security code: one row tall, so it
                stops above a ZIP row when there is one. */}
            <div aria-hidden="true" className="pointer-events-none absolute left-[calc(50%-1px)] top-[47px] h-[45px] w-[2px] bg-[#181818] md:left-[calc(50%-1.6px)] md:top-[59.2px] md:h-[56px] md:w-[3.2px]" />
            {zip && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[92px] h-[2px] bg-[#181818] md:top-[115.2px] md:h-[3.2px]" />}
            {/* THE RING'S SHAPE — see .Input:focus in appearance(). One frame
                per field, in the field's grey, sitting one ring-width inside
                it: number, expiry, security code, and the ZIP when Stripe
                asks for one. Each is rounded only at the block's own corner,
                by the block's radius less the ring — so with a ZIP row under
                them the expiry and the security code are square all round,
                and the block's two bottom corners are the ZIP's. */}
            {shaped && (
              <>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-[2px] top-[2px] h-[41px] rounded-t-[8px] border-[6px] border-[#222222] md:h-[52px] md:rounded-t-[13px] md:border-[9.6px]" />
                <div aria-hidden="true" className={`pointer-events-none absolute left-[2px] right-[calc(50%+3px)] top-[49px] h-[41px] border-[6px] border-[#222222] md:right-[calc(50%+3.6px)] md:top-[61.2px] md:h-[52px] md:border-[9.6px] ${zip ? "" : "rounded-bl-[8px] md:rounded-bl-[13px]"}`} />
                <div aria-hidden="true" className={`pointer-events-none absolute left-[calc(50%+3px)] right-[2px] top-[49px] h-[41px] border-[6px] border-[#222222] md:left-[calc(50%+3.6px)] md:top-[61.2px] md:h-[52px] md:border-[9.6px] ${zip ? "" : "rounded-br-[8px] md:rounded-br-[13px]"}`} />
                {zip && <div aria-hidden="true" className="pointer-events-none absolute inset-x-[2px] top-[96px] h-[41px] rounded-b-[8px] border-[6px] border-[#222222] md:top-[120.4px] md:h-[52px] md:rounded-b-[13px] md:border-[9.6px]" />}
              </>
            )}
          </div>
        </div>
      )}

      <input
        type="email"
        name="email"
        autoComplete="email"
        aria-invalid={error ? true : undefined}
        onInput={() => error && setError(null)}
        placeholder={labels.email}
        className={`${fieldClass} mt-[22px] rounded-[10px] md:mt-[28px] md:rounded-[15px]`}
      />

      <button
        type="submit"
        // Disabled only while a press is being worked on — never for
        // loading, which would make it a button that does nothing.
        disabled={busy}
        className={`mt-[27px] flex h-[50px] w-full items-center justify-center rounded-[10px] text-[18px] font-medium disabled:cursor-wait disabled:opacity-60 md:mt-[34px] md:h-[62px] md:rounded-[15px] md:text-[24px] md:font-medium ${submitClass}`}
      >
        {labels.submit}
      </button>

      {/* WHAT IS WRONG, UNDER THE BUTTON (Žilvinas 2026-10-04, off the
          reference: "error message should be below button one to one as in
          picture"): one centred red line, no box, between Submit and the
          promises under it. It was a tinted alert box above the button. */}
      {error && (
        <p role="alert" className="mb-[-3px] mt-[14px] text-center text-[13px] leading-[18px] text-[#e25555] md:mb-0 md:mt-[18px] md:text-[17px] md:leading-[24px]">
          {error}
        </p>
      )}
    </form>
  );
}
