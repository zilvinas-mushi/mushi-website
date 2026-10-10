"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { BoltGlyph, LinkMark, ShieldGlyph } from "./plan-sheet-glyphs";
import { Money } from "./Money";
import { TEMPLATES_PAGE } from "@/lib/content";
import { STEP_OUT_MS, StripePay, preloadStripe } from "./StripePay";
import { checkoutSession, dueToday, prepareCheckoutSessions, wakeCheckout } from "@/lib/checkout";
import { checkoutUrl, type PlanId } from "@/lib/pricing";
import Link from "next/link";

/**
 * The purchase sheet (Žilvinas 2026-09-25, from the two supplied frames;
 * PRD: "PRD: /templates purchase sheet (phone)"). Any link on /templates
 * that carries `data-plan` — the hero CTA, the bar's Redeem button, the
 * drawer's Buy Now, the table's and the Access card's Buy Now — opens it
 * instead of leaving. With JavaScript off those links still go straight to
 * the webapp as before, since the href is untouched.
 *
 * IT IS NOT PHONE-ONLY ANY MORE (same day, "where is the popup"): it was
 * gated to below md, so every desktop Buy Now simply left for the webapp
 * and no popup ever appeared. Now it opens at every width — a bottom sheet
 * on phones, a centred dialog from md up.
 *
 * TWO STEPS: pick a plan, then pay. Step one is the 547-wide frame scaled to
 * the phone's 375 (0.6856); step two is its frame at 1:1.
 *
 * ONE LISTENER ON THE DOCUMENT rather than an onClick on every link: the
 * sections are server components and would each have to become client
 * components to hold a handler. The attribute is the contract.
 *
 * IT RISES FROM THE BOTTOM, see OPEN_MS, the backdrop fading with it.
 * Escape and the backdrop dismiss it, and the page behind it does not scroll.
 *
 * THE SHEET IS IN THE DOM BEFORE IT IS ASKED FOR (Žilvinas 2026-10-05, on
 * the hold after Buy: "can we make it instant???"): put there off stage,
 * inert and unseen, at the first sign of a person on the page (see
 * `prepared`), so opening it is only the rise. Before that first sign — a
 * crawler, a visitor who never moves — it is nothing in the DOM.
 *
 * NOTHING FROM STRIPE UNTIL IT IS OPENED (Žilvinas 2026-10-10, "templates
 * page is super super slow ... dont preload all plans"). The payment steps
 * used to be built off stage at that first sign too, all three of them:
 * 13 iframes, 11 MB and close to five seconds of CPU, behind a page the
 * visitor was merely reading. Now a step is built only once the sheet is
 * open — the chosen plan's first, each step that is presentable starting
 * the next, a pick jumping the queue (see `built`) — so by the time a buyer
 * has read the plans every step is there and Buy is only the step change,
 * while a reader who never opens the sheet is never asked to pay for it.
 *
 * STRIPE IS WIRED (2026-10-04). Step two pays in place: the card fields are
 * Stripe's own, mounted by StripePay from a session the webapp creates
 * (lib/checkout.ts). "Pay with Link" opens the same plan on Stripe's hosted
 * page, which is also where Submit falls back to if the fields cannot load.
 */
/**
 * The rise: 560ms on a sheet curve — fast off the bottom, then a long,
 * decelerating settle (cubic-bezier(0.32, 0.72, 0, 1), the curve iOS
 * sheets use). A flat ease-out over 400 read as a pop (Žilvinas
 * 2026-09-25, "smoother"). The backdrop fades on the same clock.
 */
const OPEN_MS = 560;
/** How long Buy may hold for the payment step before showing it as it is. */
const HOLD_MS = 4000;
/** How old a prepared payment step may be before opening the sheet builds it again. */
const STALE_MS = 6 * 60 * 60_000;

/** The address that opens the sheet on arrival: `/templates#buy`. The webapp links to it. */
export const BUY_HASH = "#buy";

/**
 * THE QUEUE: the next plan whose payment step is to be built — once every
 * step built so far has settled, presentable or given up, and in the order
 * the plans are listed. One at a time, so the sheet never has three of
 * Stripe's checkouts loading over each other, and never while the sheet is
 * closed (the callers check): a buyer who left it is reading the page
 * again, and nothing may load behind them.
 */
/**
 * WHEN THE SHEET IS QUIET (Žilvinas 2026-10-10, "when you open a popup and
 * try to quickly do the actions"): a Stripe build is never started while
 * the sheet is animating — the rise, the fall, the step change — and only
 * in an idle moment after that, so a row picked or a Buy pressed in those
 * first seconds is answered before Stripe.js is evaluated or a frame of
 * Stripe's is created (35ms and more of main thread each, 160ms on a slow
 * CPU; measured landing mid-rise when a row was picked at 300ms). `until`
 * is when the current animation ends; the idle callback runs within
 * IDLE_MS regardless, so a build is never put off for good by a restless
 * pointer. Safari has no requestIdleCallback and gets the next tick.
 */
const IDLE_MS = 1500;
/** How long after the last scroll the page counts as still — a build under a scrolling reader is the lag this all exists to prevent. */
const SCROLL_QUIET_MS = 300;
function whenQuiet(until: number, fn: () => void): void {
  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => fn(), { timeout: IDLE_MS });
    else window.setTimeout(fn, 50);
  };
  const wait = until - Date.now();
  if (wait > 0) window.setTimeout(idle, wait);
  else idle();
}

function nextToBuild(built: readonly PlanId[], steps: Record<string, { ready: boolean }>): PlanId | undefined {
  if (built.some((id) => !steps[id]?.ready)) return undefined;
  return TEMPLATES_PAGE.plans.options.map((o) => o.id as PlanId).find((id) => !built.includes(id));
}

/**
 * The struck-through old price, in the frame's red ramp: #DE8A8B at 0%,
 * #B55456 from 40%, running top-left to bottom-right (the inspector's
 * handles, Žilvinas 2026-09-25 — about 30° below horizontal, which is
 * 120deg in CSS).
 */
const WAS =
  "bg-[linear-gradient(120deg,#de8a8b_0%,#b55456_40%,#b55456_100%)] bg-clip-text text-transparent line-through decoration-[#c9666a]";

/**
 * The violet button, inverting to white on hover like every button — and on
 * TAP (Žilvinas 2026-09-25, "inversion on click"): a phone has no hover, so
 * the same swap rides on :active, the way the bar's CTA already does.
 */
const VIOLET =
  "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] active:text-[#6e54b5]";

/**
 * A payment field: 45 tall, #222222, Regular 18, placeholder at 50% white.
 * The `autofill:` pair keeps it that way when the browser fills the email in:
 * Chrome paints an autofilled field pale blue with dark text, which beside
 * Stripe's dark card fields looked like a different form (Žilvinas 2026-10-04).
 */
const FIELD =
  "h-[45px] w-full bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50 outline-none [color-scheme:dark] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b6ad6] autofill:shadow-[inset_0_0_0_1000px_#222222] autofill:[-webkit-text-fill-color:#ffffff] md:h-[56px] md:px-[22px] md:text-[22px]";

/**
 * ONE PLAN'S PAYMENT STEP: StripePay in the sheet's clothes, on stage or
 * standing under the chosen one. Its own component so that it holds still:
 * its props are the plan, whether it is on, and one function that never
 * changes (`report`), so the sheet's own state — a step change, a hold, the
 * queue — re-renders nothing in here. Only a pick of this plan or another
 * does, and that is a change of `on` alone.
 */
function PlanStep({
  planId,
  on,
  onPresentable,
}: {
  planId: PlanId;
  on: boolean;
  onPresentable: (id: PlanId, ok: boolean, state?: "ready" | "unavailable") => void;
}) {
  const c = TEMPLATES_PAGE.plans;
  const hosted = checkoutUrl(planId);
  return (
    <div
      className={on ? undefined : "pointer-events-none absolute inset-x-0 top-0 opacity-0"}
      inert={!on}
      aria-hidden={on ? undefined : true}
    >
      <StripePay
        planId={planId}
        fallbackHref={(email) => checkoutUrl(planId, undefined, email || undefined)}
        // Stripe Link, in its own green: this one opens the plan on
        // Stripe's hosted page, and stands in until Stripe's own Link
        // button (which opens Link in a small window) is ready.
        linkFallback={
          <a
            href={hosted}
            // IN ITS OWN SMALL WINDOW (Žilvinas 2026-10-04, as on
            // Sintra's checkout), not by taking this page away: the
            // sheet stays where it is behind it. A blocked popup falls
            // through to the plain link. /thank-you hands the result
            // back to this tab and closes the window.
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              const w = 480;
              const h = 760;
              const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - w) / 2));
              const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - h) / 2));
              const popup = window.open(hosted, "mushi-checkout", `popup,width=${w},height=${h},left=${left},top=${top}`);
              if (popup) e.preventDefault();
            }}
            className="flex h-[50px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-[#00da62] text-[18px] font-medium leading-none text-black transition-opacity duration-150 hover:opacity-90 md:h-[62px] md:gap-[8px] md:rounded-[15px] md:text-[25px]"
          >
            {/* Medium 18 and the client's 61 x 21 mark (Žilvinas 2026-09-25). */}
            {c.pay.payWith}
            <LinkMark className="h-[21px] w-[61px] md:h-[29px] md:w-[84px]" />
          </a>
        }
        divider={
          <>
            {/* "or": Poppins Regular 20, #909090 (Žilvinas 2026-09-25). */}
            {/* 11 between the rules and the word (Žilvinas 2026-09-25, the 11 x 9 spacer; it was 13). */}
            <div className="mt-[20px] flex items-center gap-[11px] text-[20px] leading-none text-[#909090] md:mt-[24px] md:h-[32px] md:gap-[16px] md:text-[24px]">
              {/* 2 weight (Žilvinas 2026-09-25, the frame's 326 x 0 line). */}
              <span className="h-[2px] flex-1 bg-white/25" />
              {c.pay.or}
              <span className="h-[2px] flex-1 bg-white/25" />
            </div>

            {/* Medium 20, 25 under the rule — the inspector's 14 x 25 spacer
                (Žilvinas 2026-09-25; the message said 28, the spacer 25). */}
            <p className="mt-[25px] text-[20px] font-medium leading-none text-white md:mt-[14px] md:text-[26px]">{c.pay.cardInfo}</p>
          </>
        }
        onPresentable={(ok, state) => onPresentable(planId, ok, state)}
        labels={{ email: c.pay.email, submit: c.pay.submit }}
        fieldClass={FIELD}
        submitClass={VIOLET}
      />
    </div>
  );
}

export function PlanSheet() {
  const c = TEMPLATES_PAGE.plans;
  const [mounted, setMounted] = useState(false);
  /**
   * In the DOM, off stage: true from the first sign of a person (or the
   * first open) and for good. `mounted` still means what it did — open, or
   * on its way out — and is what the scroll lock and the keys go by.
   */
  const [prepared, setPrepared] = useState(false);
  const preparedAt = useRef(0);
  /** Bumped to build the payment steps afresh: see open(). */
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState<"plan" | "pay">("plan");
  const [planId, setPlanId] = useState<string>(c.defaultId);
  const closeTimer = useRef(0);
  /** When the sheet's current animation ends — nothing of Stripe's starts before it (whenQuiet). */
  const quietAt = useRef(0);
  /** Open, as of the last open() or close(): a build scheduled for a sheet that has since closed is dropped. */
  const openRef = useRef(false);
  /** The chosen plan, for the build scheduled at open(): a row picked during the rise is the one built first. */
  const planRef = useRef<PlanId>(c.defaultId as PlanId);
  /** Whether the first build has been scheduled since the sheet opened; a pick before that leaves it to the schedule. */
  const scheduled = useRef(false);
  /** When the page last scrolled: a build on hover waits for the page to be still (SCROLL_QUIET_MS). */
  const lastScroll = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  /**
   * STEP ONE TO STEP TWO IS A HAND-OFF, NOT A CUT (Žilvinas 2026-09-26,
   * "after the first step, going to buy should properly do a transition"):
   * the plan step slides out to the left as it fades (260ms), the panel's
   * height glides to the payment step's on the sheet curve, and the
   * payment step slides in from the right. stepIn is false while a step
   * is off stage; the direction comes from which step is current.
   */
  const [stepIn, setStepIn] = useState(true);
  const stepTimer = useRef(0);
  /**
   * THE PAYMENT STEP IS SHOWN ONCE, FINISHED (Žilvinas 2026-10-04, the card
   * fields swapping in after the step was already up: "no reloads, just one
   * time load of this"). The step loads behind the plan step from the moment
   * the sheet opens, so it is nearly always ready when Buy is pressed. When
   * it is not — a fast press, a slow network — Buy HOLDS: the button shows
   * it is working and the step comes in when StripePay says it is
   * presentable, with nothing in it still arriving. HOLD_MS is the ceiling;
   * past it the step is shown as it is, stand-in fields and all, because a
   * buyer must never be stuck on a button.
   */
  /**
   * EVERY PLAN HAS ITS OWN PAYMENT STEP, AND ALL OF THEM ARE KEPT (Žilvinas
   * 2026-10-05, after "instant" turned out to hold only for the plan the
   * sheet opens on: "if prices change I think there is a reload"). There
   * was: one step, keyed by the plan, so picking another plan threw away
   * the finished one and built Stripe's checkout and fields again — and Buy
   * held for it, 0.6s here and longer from further away. Now each plan's
   * step is built once and stays; picking a plan only changes which one is
   * on stage. This is each plan's word on whether its step is presentable,
   * or has failed to load.
   */
  const pay = useRef<Record<string, { ready: boolean; failed: boolean }>>({});
  /**
   * A STEP'S WORD REACHES THE SHEET THROUGH ONE STABLE FUNCTION (2026-10-10):
   * a callback made afresh each render was a new prop for every PlanStep on
   * every state change, and so Buy — a change of `step` — re-rendered all
   * three steps' forms, 100–150ms on a 4x CPU, under the step change. The
   * handler below is kept current in an effect; the function the steps hold
   * never changes, so a step re-renders only when its own plan is picked.
   */
  const presentable = useRef<(id: PlanId, ok: boolean, state?: "ready" | "unavailable") => void>(() => {});
  const report = useCallback((id: PlanId, ok: boolean, state?: "ready" | "unavailable") => presentable.current(id, ok, state), []);
  /**
   * THE PLANS WHOSE PAYMENT STEPS ARE BUILT, in the order they were asked
   * for; empty until the sheet is first opened (see the note at the top).
   * The chosen plan goes in at open(), a pick goes in at once, and the
   * queue below adds the next plan each time every step so far has
   * settled — one at a time, so the sheet never has three of Stripe's
   * checkouts loading over each other.
   */
  const [built, setBuilt] = useState<PlanId[]>([]);
  const holdTimer = useRef(0);
  const [holding, setHolding] = useState(false);
  /** Buy has been pressed and is waiting for the chosen plan's step. */
  const held = useRef(false);
  /**
   * Desktop only: the step's frame (650 for the plan, 763 for payment)
   * zoomed down just enough to clear the viewport, 1 whenever it fits.
   * Zoom rather than transform so the layout box shrinks with it.
   */
  const [fit, setFit] = useState(1);

  // A MOUSE RESTING ON A BUY BUTTON IS A BUYER (Žilvinas 2026-10-10, on the
  // first screen: "when pressing buy now there is loading"). With every
  // build moved behind the rise, a buyer who opened the sheet and pressed
  // Buy at once was held for the step — a second and more — and the step
  // then came in while Stripe's frame was still settling. A hover comes
  // well before the click, on a page that is still, so for a mouse the
  // CHOSEN plan's step is built then: the sheet is put in the DOM off
  // stage, its session asked for, and the one step scheduled for the next
  // quiet, idle moment — never while the page scrolls. One plan, not three;
  // the others follow once the sheet is open. A finger gets no warning
  // before its tap and keeps the rise-first order.
  const hover = useEffectEvent(() => {
    if (built.length) return;
    if (!preparedAt.current) preparedAt.current = Date.now();
    setPrepared(true);
    checkoutSession(planId as PlanId).catch(() => {});
    whenQuiet(Math.max(quietAt.current, lastScroll.current + SCROLL_QUIET_MS), () => {
      scheduled.current = true;
      setBuilt((b) => (b.length ? b : [planRef.current]));
    });
  });

  // AN EFFECT EVENT, not a plain closure: it is called from listeners bound
  // once, at mount, and this way it still reads the latest choice of plan
  // and the steps built so far.
  const open = useEffectEvent(() => {
    window.clearTimeout(closeTimer.current);
    // THE RISE STARTS FROM A FORCED LAYOUT, not from a frame or two of
    // waiting (Žilvinas 2026-09-26, "there should be animation for that
    // popup, both desktop and mobile"): flushSync commits the panel at
    // 100% down right here, reading its box makes the browser compute that
    // before-change style, and only then is it flipped to 0, so the
    // transition has a start to run from. Two requestAnimationFrames did
    // this before, and on iOS they were not always two frames apart, which
    // left the sheet snapping into place.
    window.clearTimeout(stepTimer.current);
    window.clearTimeout(holdTimer.current);
    // The steps' word is NOT reset here any more: they were prepared before
    // this, and their word that they are presentable may already have come.
    // What is built afresh is a step that could not load — the line may be
    // back — and ones prepared so long ago that their sessions are near
    // their end (Stripe keeps one a day).
    const failed = Object.values(pay.current).some((p) => p.failed);
    const stale = failed || (preparedAt.current > 0 && Date.now() - preparedAt.current > STALE_MS);
    if (stale || !preparedAt.current) preparedAt.current = Date.now();
    if (stale) pay.current = {};
    held.current = false;
    openRef.current = true;
    flushSync(() => {
      setHolding(false);
      setStep("plan");
      setStepIn(true);
      setPrepared(true);
      if (stale) {
        setAttempt((n) => n + 1);
        setBuilt([]);
      }
      setMounted(true);
    });
    // THE RISE COMES FIRST, STRIPE AFTER IT (Žilvinas 2026-10-10, "a VERY
    // VERY BUG when popup was going upwards"): the first step used to be
    // built in the same breath as the sheet was shown, and Stripe.js being
    // evaluated and its frames created stalled the rise for 200ms on a
    // throttled CPU — a visible hitch a third of the way up. Now nothing of
    // Stripe's starts until the panel has settled and the thread is idle
    // (whenQuiet): the chosen plan's step — the one chosen by then, should
    // a row be picked during the rise — or the queue carrying on where it
    // stopped. A buyer quicker than that is held by Buy, as before. With
    // reduced motion there is no rise.
    quietAt.current = Date.now() + (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : OPEN_MS);
    scheduled.current = false;
    whenQuiet(quietAt.current, () => {
      if (!openRef.current) return;
      scheduled.current = true;
      preloadStripe();
      setBuilt((b) => {
        const steps = b.length ? b : [planRef.current];
        const next = nextToBuild(steps, pay.current);
        return next ? [...steps, next] : steps;
      });
    });
    if (panelRef.current) {
      panelRef.current.style.height = "";
      panelRef.current.style.transition = "";
    }
    void panelRef.current?.getBoundingClientRect();
    setShown(true);
  });
  const goPay = () => {
    if (held.current) return;
    if (!pay.current[planId]?.ready) {
      held.current = true;
      setHolding(true);
      holdTimer.current = window.setTimeout(showPay, HOLD_MS);
      return;
    }
    showPay();
  };
  // Another plan picked while Buy was holding for the last one: the hold is
  // dropped with the plan it was for, and Buy is there to be pressed again.
  const pick = (id: string) => {
    if (held.current) {
      held.current = false;
      window.clearTimeout(holdTimer.current);
      setHolding(false);
    }
    setPlanId(id);
    planRef.current = id as PlanId;
    // Its step is next, ahead of the queue, in case Buy follows — in the
    // next quiet moment, never under the pick itself. Before the first
    // build is scheduled it is simply the plan that build starts with.
    if (scheduled.current && !built.includes(id as PlanId)) {
      whenQuiet(quietAt.current, () => setBuilt((b) => (b.includes(id as PlanId) ? b : [...b, id as PlanId])));
    }
  };
  const showPay = () => {
    held.current = false;
    window.clearTimeout(holdTimer.current);
    setHolding(false);
    const panel = panelRef.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep("pay");
      return;
    }
    setStepIn(false);
    // The step change — the slide out, the height, the slide in — is an
    // animation on the main thread; nothing of Stripe's starts under it.
    quietAt.current = Date.now() + STEP_OUT_MS + 500;
    window.clearTimeout(stepTimer.current);
    stepTimer.current = window.setTimeout(() => {
      // The plan step is off stage. Pin the panel at its height, swap the
      // step in (still off stage, to the right), measure where the height
      // wants to be, then let both run: the height on the sheet curve, the
      // step's own fade and slide on the step's transition.
      const h0 = panel.offsetHeight;
      panel.style.height = `${h0}px`;
      flushSync(() => setStep("pay"));
      panel.style.height = "";
      const h1 = panel.offsetHeight;
      panel.style.height = `${h0}px`;
      void panel.offsetHeight;
      panel.style.transition = "height 480ms cubic-bezier(0.32, 0.72, 0, 1)";
      panel.style.height = `${h1}px`;
      setStepIn(true);
      stepTimer.current = window.setTimeout(() => {
        panel.style.height = "";
        panel.style.transition = "";
      }, 500);
    }, STEP_OUT_MS);
  };
  const close = () => {
    openRef.current = false;
    window.clearTimeout(stepTimer.current);
    window.clearTimeout(holdTimer.current);
    held.current = false;
    setHolding(false);
    setShown(false);
    closeTimer.current = window.setTimeout(() => setMounted(false), OPEN_MS);
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element).closest?.("a[data-plan]");
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      open();
    }
    // THE WEBAPP IS WOKEN ON INTENT, a moment before the click: the pointer
    // arriving on a Buy button, a finger landing on it, or focus reaching
    // it. For a MOUSE, Stripe.js and the chosen plan's step as well (see
    // hover): a hover comes well before the click, on a page that is still.
    // A finger's touchstart is 100ms before the tap, which put that work in
    // the middle of the rise (2026-10-10); a touch or a key gets Stripe.js
    // after the rise, from open(), and only its session is asked for here.
    // Still never with the page — a visitor who goes nowhere near a Buy
    // button fetches nothing from Stripe.
    function onIntent(e: Event) {
      if (!(e.target as Element).closest?.("a[data-plan]")) return;
      wakeCheckout();
      if (e.type === "pointerover" && (e as PointerEvent).pointerType === "mouse") {
        preloadStripe();
        hover();
      }
    }
    const onScroll = () => {
      lastScroll.current = Date.now();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("touchstart", onIntent);
      document.removeEventListener("focusin", onIntent);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // THE WEBAPP IS WOKEN ONCE THE PAGE IS DONE WITH ITS OWN LOADING — three
  // seconds after the load event, which is past the first screen and past
  // the moment the paint gate starts on the rest (lib/checkout.ts on why).
  // Sooner if a Buy button is approached first: see onIntent above.
  useEffect(() => {
    let timer = 0;
    const later = () => {
      timer = window.setTimeout(wakeCheckout, 3000);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", later);
    };
  }, []);

  // ARRIVING AT /templates#buy OPENS THE SHEET (Žilvinas 2026-10-04): it is
  // where the webapp's "Create an Account" sends someone who has no account —
  // they came to buy, so they land on the plans rather than on the hero. It
  // waits for the paint gate, so the sheet rises over a finished page and
  // never over the veil; the gate's own 4s limit bounds the wait.
  useEffect(() => {
    if (window.location.hash !== BUY_HASH) return;
    const root = document.documentElement;
    let opened = false;
    const whenReady = () => {
      if (opened || !root.hasAttribute("data-ready")) return;
      opened = true;
      seen.disconnect();
      // THE HASH IS SPENT ONCE IT HAS OPENED THE SHEET (Žilvinas 2026-10-05,
      // "once you are in this popup view with #, you cannot leave it"): left
      // in the address, every reload and every Back to this page raised the
      // sheet again over someone who had already closed it. It is taken out
      // in place — no new history entry, Next's own state kept.
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      open();
    };
    const seen = new MutationObserver(whenReady);
    seen.observe(root, { attributes: true, attributeFilter: ["data-ready"] });
    // Already painted (a navigation inside the site): the next frame, not
    // this effect's own body.
    const frame = requestAnimationFrame(whenReady);
    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // EVERY PLAN'S SESSION IS ASKED FOR AS THE SHEET OPENS, the chosen one
  // first (lib/checkout.ts) — and usually before that, by each plan's own
  // payment step as it is built off stage. Asking twice costs nothing: a
  // session already asked for is the one handed back.
  useEffect(() => {
    if (mounted) prepareCheckoutSessions(planId as PlanId);
  }, [mounted, planId]);

  // THE FIRST SIGN OF A PERSON — a pointer moving, a finger landing, a key,
  // a wheel — and the sheet is put together off stage (see the note at the
  // top). Real input only: a page that is merely loaded, or scrolled by a
  // script, prepares nothing, so a crawler and Lighthouse fetch nothing from
  // Stripe and no session is made for them. Not before the page has
  // finished its own loading, and not at all for a visitor who has asked
  // for less data or is on a 2G line — they get it when they open it.
  useEffect(() => {
    if (prepared) return;
    const line = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (line && (line.saveData || /2g/.test(line.effectiveType ?? ""))) return;
    const signs = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
    const go = () => {
      if (!preparedAt.current) preparedAt.current = Date.now();
      setPrepared(true);
    };
    const seen = () => {
      for (const sign of signs) window.removeEventListener(sign, seen);
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    };
    for (const sign of signs) window.addEventListener(sign, seen, { passive: true });
    return () => {
      for (const sign of signs) window.removeEventListener(sign, seen);
      window.removeEventListener("load", go);
    };
  }, [prepared]);

  useEffect(() => {
    if (!mounted && !prepared) return;
    const size = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const frame = step === "plan" ? 650 : 763;
      setFit(desktop ? Math.min(1, (window.innerHeight - 24) / frame) : 1);
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
    // Sized off stage as well: Stripe lays its fields out by the width it
    // is given, and a zoom that changed as the sheet opened would have it
    // lay them out twice.
  }, [mounted, prepared, step]);

  // THE PAGE BEHIND DOES NOT SCROLL — by swallowing the wheel, touch and
  // key scrolling, NOT overflow:hidden on the body (Žilvinas 2026-09-25,
  // "the menu shows up instantly when you leave"): <html> clips overflow-x,
  // so a hidden overflow on <body> made the BODY the scroll container and
  // the sticky header lost the viewport — it sat at its flow position,
  // off screen, the whole time the sheet was open and snapped back the
  // instant the lock came off. Scrolling inside the sheet's own panel is
  // still allowed when it has somewhere to go (the phone).
  //
  // AND THE ROOT IS HELD STILL AS WELL (Žilvinas 2026-10-07, "you can scroll
  // background with the popup?? what?"). Swallowing the events was not
  // enough once the payment step was Stripe's: a wheel over its card fields
  // lands in Stripe's iframe, which this document never hears about, and
  // the scroll chains out of the frame into the page. So while the sheet is
  // open <html> — the viewport's scroller, which sticky still answers to;
  // the trouble above was overflow on BODY — is given overflow hidden, and
  // a scroll that chains out of a frame finds nowhere to go. The scrollbar
  // it takes away is paid for with padding, so nothing shifts. Touch has
  // its own cure: touch-action on the frames' boxes (StripePay).
  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
    const root = document.documentElement;
    // THE PAGE'S OWN ANIMATIONS HOLD STILL UNDER THE SHEET (2026-10-10): the
    // hero's tile rows, the drifting tiles and the gradient rings tick on
    // the main thread every frame — a trace of an open sheet showed 500
    // style recalculations from them in a few seconds — behind a backdrop
    // that blurs them past recognition. globals.css pauses them while
    // <html> carries this.
    root.setAttribute("data-sheet", "");
    const gutter = window.innerWidth - root.clientWidth;
    const was = { overflowY: root.style.overflowY, paddingRight: document.body.style.paddingRight };
    root.style.overflowY = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    const inPanel = (t: EventTarget | null) =>
      !!panel && t instanceof Node && panel.contains(t) && panel.scrollHeight > panel.clientHeight;
    const block = (e: Event) => {
      if (!inPanel(e.target)) e.preventDefault();
    };
    const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      const t = e.target as HTMLElement | null;
      const typing = t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement;
      const pressing = t instanceof HTMLButtonElement || t instanceof HTMLAnchorElement;
      if (scrollKeys.has(e.key) && !typing && !pressing && !inPanel(t)) e.preventDefault();
    }
    document.addEventListener("wheel", block, { passive: false });
    document.addEventListener("touchmove", block, { passive: false });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("wheel", block);
      document.removeEventListener("touchmove", block);
      document.removeEventListener("keydown", onKey);
      root.style.overflowY = was.overflowY;
      document.body.style.paddingRight = was.paddingRight;
      root.removeAttribute("data-sheet");
    };
  }, [mounted]);

  useEffect(() => {
    presentable.current = (id, ok, state) => {
      pay.current[id] = { ready: ok, failed: state === "unavailable" };
      // One settled: the queue takes the next plan — in the next quiet
      // moment, and only while the sheet is up ON THE PLAN STEP, where
      // another plan can still be picked. A buyer on the payment step is
      // typing an email; mounting a step there (30–45ms of style and
      // layout, more on a slow CPU) is a hitch under their hands for a plan
      // they can no longer choose. A sheet closed and opened again picks
      // the queue up.
      if (ok && shown && step === "plan") {
        whenQuiet(quietAt.current, () => {
          if (!openRef.current) return;
          setBuilt((b) => {
            const next = nextToBuild(b, pay.current);
            return next ? [...b, next] : b;
          });
        });
      }
      // Buy was pressed and has been waiting for exactly this.
      if (ok && id === planId && held.current && step === "plan") showPay();
    };
  });

  if (!mounted && !prepared) return null;

  const plan = c.options.find((o) => o.id === planId) ?? c.options[0];
  // STEP TWO PAYS IN PLACE (2026-10-04): Stripe's own card fields, mounted in
  // the sheet by StripePay. `hosted` is the same plan on Stripe's own page —
  // where "Pay with Link" goes, and where Submit falls back to if the fields
  // cannot load, so there is always a way to pay.
  const due = dueToday(plan.id as PlanId);
  const motion =
    // `translate`, not `transform`: Tailwind's translate-y-* utilities set
    // the CSS translate property, so a transition on transform never ran
    // and the sheet SNAPPED into place at both widths (Žilvinas
    // 2026-09-26, "there should be animation for that popup"). Only the
    // backdrop's opacity had been fading.
    "transition-[translate,opacity] duration-[560ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[translate] motion-reduce:transition-none";

  return (
    // DESKTOP GETS IT TOO (Žilvinas 2026-09-25, "where is the popup" —
    // pressing Buy Now on a desktop just left for the webapp): the same
    // two steps, as a CENTRED dialog from md up instead of a bottom sheet,
    // on the artboard's own widths — 394 for the plan step, 776 for the
    // payment frame. Below md nothing changes: it still rises from the
    // bottom edge, full width.
    <div
      // A BOTTOM SHEET ON THE DESKTOP AS WELL (Žilvinas 2026-09-25, "it's
      // not a popup, even for desktop it comes from the bottom"): anchored
      // to the bottom edge, centred across, top corners round.
      // OFF STAGE it is inert, unannounced and untouchable: the panel is
      // already below the bottom edge (translate-y-full) and the backdrop
      // is not drawn at all, so there is nothing to see or to press.
      className={`fixed inset-0 z-[100] md:flex md:items-end md:justify-center md:px-6 ${mounted ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-sheet-title"
      aria-hidden={mounted ? undefined : true}
      inert={!mounted}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 bg-black/60 md:backdrop-blur-[9px] ${motion} ${shown ? "opacity-100" : "opacity-0"} ${mounted ? "" : "invisible"}`}
      />
      <div
        // The md: half overrides the sheet geometry wholesale — static in
        // the centring flex row, its own width, all four corners round,
        // and the rise-from-the-bottom transform traded for a fade and a
        // small scale, which is what a centred dialog wants.
        // IT RISES FROM BELOW ON THE DESKTOP TOO (Žilvinas 2026-09-25,
        // "instead of popup it should come from below"): the same 560ms
        // sheet curve carries it up from under the viewport to the centre.
        // It was a fade with a small scale.
        //
        // THE PLAN STEP IS THE 546.5 x 650 FRAME AT 1:1 (Žilvinas
        // 2026-09-25, "it's larger in size"): the phone step is that frame
        // at 0.6856, so from md the step is simply zoomed back by 1/0.6856
        // — every row, price and the Regular 20 "Every plan includes" line
        // land on the artboard's numbers without a second set of them.
        // FOCUSING A FIELD MADE SUBMIT JUMP (Žilvinas 2026-09-25): the 763
        // frame was taller than the viewport minus its margins, so the panel
        // scrolled and every focus scrolled it. Now the step is ZOOMED to
        // fit the height (see fit), so the panel never scrolls on a desktop.
        // 40 PAST THE BOTTOM EDGE on the phone (Žilvinas 2026-09-26, "there
        // shouldn't be any gap between Safari's bottom bar and the popup"):
        // the panel hangs 40 below the viewport, its bottom padding grown
        // by the same 40, so whatever iOS does with the toolbar and the
        // fixed box's bottom edge, the sheet's own black is what meets it.
        // The viewport clips the overhang. From md the panel is static in
        // the centring flex, so bottom and the padding are reset there.
        className={`absolute inset-x-0 -bottom-[40px] max-h-[calc(100dvh+16px)] overflow-y-auto rounded-t-[14px] bg-[#181818] pb-[calc(max(27px,env(safe-area-inset-bottom))+40px)] overscroll-contain md:static md:overflow-visible md:rounded-t-[20px] md:shadow-[0_24px_80px_rgba(0,0,0,0.6)] ${
          step === "plan" ? "md:w-[547px] md:pb-0" : "md:w-[776px] md:pb-6"
        } ${motion} ${shown ? "translate-y-0" : "translate-y-full"}`}
        // --fit and --unfit: for the boxes that hold Stripe's frames, which
        // no zoom may reach (StripePay, the scaled box).
        style={{ zoom: fit, "--fit": fit, "--unfit": 1 / fit } as React.CSSProperties}
        ref={panelRef}
      >
        <div
          // Out is quick and small — 170ms, 6px, easing in — and in is
          // calm and a little longer — 380ms, 14px, on the sheet curve
          // (Žilvinas 2026-09-26, "premium and subtle, a little more").
          className={`relative motion-reduce:transition-none ${
            stepIn
              ? "translate-x-0 opacity-100 transition-[opacity,translate] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              : step === "plan"
                ? "-translate-x-[6px] opacity-0 transition-[opacity,translate] duration-[170ms] ease-in"
                : "translate-x-[14px] opacity-0"
          }`}
        >
        {step === "plan" && (
          // 24 from the sheet's top to the title and 24 from the title to
          // the first row; 15 between rows (Žilvinas 2026-09-25, off the
          // artboard's spacers).
          <div className="px-6 pt-6 md:pb-[16px] md:[zoom:1.4586]">
            {/* SemiBold 20 off the inspector (Žilvinas 2026-09-25). */}
            <h2 id="plan-sheet-title" className="text-center text-[20px] font-semibold leading-none text-white">
              {c.title}
            </h2>

            <div className="mt-6 flex flex-col gap-[15px]" role="radiogroup" aria-label={c.title}>
              {c.options.map((o) => {
                const on = o.id === planId;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(o.id)}
                    // THE SELECTED ROW, off the inspector (Žilvinas 2026-09-25,
                    // fourth pass, with the 3 x 5 spacer): the row keeps its
                    // full #222222 plate, the same 327 x 78 at radius 14 as
                    // the others, and INSIDE it, 3 in on every side, sits a
                    // box at radius 15 filled #2A2431 with a 2px stroke on
                    // its inside edge, ramping #A08ADD to #7054B4 left to
                    // right. So the plate shows as a 3 band around the
                    // stroke, and the slot — and the 15 between rows — does
                    // not move. Content padding is the same in both states.
                    // When on, the plate is the inspector's 327.65 x 78.59 at
                    // radius 17 with a 4px inside stroke of #252525 over a
                    // #303030 fill; the stroked box 3 inside covers everything
                    // but that stroke, so the band around it is #252525.
                    className={`relative h-[78px] w-full text-left ${
                      on ? "rounded-[17px] bg-[#252525]" : "rounded-[14px] bg-[#222222]"
                    }`}
                  >
                    {on && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-[3px] rounded-[15px] border-2 border-transparent"
                        // Inline, not an arbitrary class: a two-layer background
                        // with box keywords does not survive Tailwind's parser.
                        // The fill as the inspector lists it (Žilvinas 2026-09-25,
                        // "this should be the background"): #2A2431 at 100% over
                        // #000000 at 50%, top layer first as Figma stacks them —
                        // the opaque #2A2431 is what shows. Then the stroke ramp
                        // on the border box.
                        style={{
                          background:
                            "linear-gradient(#2a2431,#2a2431) padding-box, linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)) padding-box, linear-gradient(90deg,#a08add,#7054b4) border-box",
                        }}
                      />
                    )}
                    {o.save && (
                      <span
                        // 74 x 20, radius 5, SemiBold 12, centred on the box's
                        // stroke line: 10 above it and 10 below, which is 7.5
                        // above the plate (Žilvinas 2026-09-25, off the
                        // inspector, "much down").
                        // pl/pb 1: optical centring (Žilvinas 2026-09-25, "should be centred
                        // both horizontally and vertically") — the box is centred to the
                        // sub-pixel, but Poppins' $ and 0 lean the word left and low.
                        // 74 is the width for "SAVE $60"; "SAVE CHF 60" is wider, so
                        // the pill grows from it rather than cutting the figure.
                        className="absolute -top-[7.5px] left-[41px] z-[1] flex h-[20px] min-w-[74px] items-center justify-center whitespace-nowrap rounded-[5px] bg-white px-[6px] pb-[1px] pl-[7px] text-center text-[12px] font-semibold leading-none text-black"
                      >
                        <Money>{o.save}</Money>
                      </span>
                    )}
                    <span className="relative flex h-full w-full items-center gap-3 px-4">
                      {/* The radio, off the inspector (Žilvinas 2026-09-25):
                          a 23.67 disc, #464646 at rest; when on, a 2px white
                          ring on the row's #2A2431 with a 14.2 white dot. */}
                      <span
                        aria-hidden="true"
                        className={`grid size-[23.67px] shrink-0 place-items-center rounded-full ${
                          on ? "border-2 border-white bg-[#2a2431]" : "bg-[#464646]"
                        }`}
                      >
                        {on && <span className="size-[14.2px] rounded-full bg-white" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        {/* SemiBold 20 off the inspector (Žilvinas 2026-09-25). */}
                        <span className="text-[20px] font-semibold leading-none text-white">{o.name}</span>
                        <span className="text-[14px] leading-none text-white/45"><Money>{o.total}</Money></span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-[3px]">
                        <span className="flex items-baseline gap-2">
                          {/* SemiBold 32 off the inspector (Žilvinas 2026-09-25); the
                              struck price at 24, its proportion in the frame. */}
                          {o.was && <span className={`text-[24px] font-semibold leading-none ${WAS}`}><Money>{o.was}</Money></span>}
                          <span className="text-[32px] font-semibold leading-none text-white"><Money>{o.price}</Money></span>
                        </span>
                        {/* SemiBold 14 off the inspector (Žilvinas 2026-09-25). */}
                        <span className="text-[14px] font-semibold leading-none text-white/45">{c.perMonth}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={goPay}
              // Poppins Medium, 18 for the label and 14 for "/month" at 50%
              // white, off the inspector (Žilvinas 2026-09-25). The 50% is
              // an opacity rather than a colour so it still inverts with the
              // button on hover.
              aria-busy={holding || undefined}
              className={`mt-5 flex h-[47.35px] w-full items-center justify-center rounded-[10px] text-[18px] font-medium ${VIOLET} ${holding ? "cursor-wait" : ""}`}
            >
              {/* One inline run: as separate items of this flex row the
                  space between the words and the figure would be dropped. */}
              <span>
                {c.ctaPrefix} <Money>{plan.price}</Money>
              </span>
              <span className="text-[14px] font-medium opacity-50">{c.perMonth}</span>
              {/* Holding for the payment step — see payReady. In
                  currentColor, so it inverts with the button. */}
              {holding && (
                <span aria-hidden="true" className="ml-2.5 size-[14px] shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </button>

            {/* Poppins Regular 14, white at 50%, the whole line — label,
                glyph and "500+ static templates" alike (Žilvinas 2026-09-25). */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[14px] leading-none text-white/50">
              {c.includesLabel}
              {/* The client's "stacked icon.svg" (Žilvinas 2026-09-25), its
                  path verbatim, at the inspector's 11.36 → 11.5 square. Its
                  #8B8B8B stroke is the line's own 50% white here. */}
              <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[11.5px]" aria-hidden="true">
                <path d="M0.75 6.43153L6.22854 9.18692C6.30307 9.22441 6.34034 9.24315 6.37943 9.25053C6.41405 9.25706 6.44958 9.25706 6.4842 9.25053C6.52329 9.24315 6.56056 9.22441 6.6351 9.18692L12.1136 6.43153M0.75 9.28916L6.22854 12.0445C6.30307 12.082 6.34034 12.1008 6.37943 12.1082C6.41405 12.1147 6.44958 12.1147 6.4842 12.1082C6.52329 12.1008 6.56056 12.082 6.6351 12.0445L12.1136 9.28916M0.75 3.5739L6.22854 0.818508C6.30307 0.781021 6.34034 0.762277 6.37943 0.7549C6.41405 0.748367 6.44958 0.748367 6.4842 0.7549C6.52329 0.762277 6.56056 0.781021 6.6351 0.818508L12.1136 3.5739L6.6351 6.32929C6.56056 6.36678 6.52329 6.38552 6.4842 6.3929C6.44958 6.39943 6.41405 6.39943 6.37943 6.3929C6.34034 6.38552 6.30307 6.36678 6.22854 6.32929L0.75 3.5739Z" />
              </svg>
              {c.includes}
            </p>
          </div>
        )}
        {/* THE PAYMENT STEP IS IN THE SHEET FROM THE MOMENT IT OPENS
            (Žilvinas 2026-10-04, "this is where sales are lost, because it
            loads long"). It used to be rendered when Buy was pressed, and
            only then did the session, Stripe's checkout and its card fields
            start — 1.5s on a good day, during which the fields were a
            picture of fields that could not be clicked and Submit was dead.

            Now it is rendered behind the plan step and loads while the
            buyer is reading the plans, so pressing Buy only has to SHOW it.
            Behind means: out of flow, see-through, inert, and clipped to the
            plan step's own box so it adds nothing to the panel's height or
            scroll — but NOT display:none and not a zero-height box, because
            Stripe will not draw into a box with no size and a browser does
            not render an iframe that is clipped away entirely. It is given
            the width it will have (the panel's on a phone, the 776 frame on
            a desktop), since Stripe arranges its fields by width.

            EVERY PLAN'S IN TURN, not only the chosen one's — see `built`.
            A different plan picked on step one is usually already loading
            beside the first and is put on stage in its place; one that is
            not starts the moment it is picked. The webapp's endpoint only
            creates a Stripe session, which costs nothing and expires. */}
        <div
          className={step === "plan" ? "pointer-events-none absolute inset-0 overflow-hidden opacity-0" : undefined}
          inert={step === "plan"}
          aria-hidden={step === "plan" ? true : undefined}
        >
          <div className={`px-[25px] pt-[22px] md:px-[31px] md:pt-[35px] ${step === "plan" ? "md:w-[776px]" : ""}`}>
            {/* Summary: the billing line with the discount pill, then the
                total with the struck old price. */}
            {/* "Billed yearly" is pinned to the TOTAL, not the pill: 7 above
                the label's cap (Žilvinas 2026-09-25, the 7 x 7 spacer). The
                pill keeps its own 22 from the top; the billing line is
                positioned off the row below. Its box bottom is 2 under the
                row's top: the label's cap starts 9 under the row's top (6 of
                centring in the 32 row, 3 of Poppins' ascent), and 9 - 7 = 2.
                An empty span keeps the pill on the right. */}
            <div className="flex justify-end">
              {plan.off && (
                <span className="flex h-5 items-center rounded-[5px] bg-white px-3 text-[12px] font-semibold leading-none text-black md:h-[26px] md:w-[101px] md:justify-center md:px-0 md:text-[16px]">
                  {plan.off}
                </span>
              )}
            </div>
            {/* ONE LINE (Žilvinas 2026-09-25): the label, the struck price
                and the price are centred on each other — the struck $10 on
                the middle of the $5, and "Total due today" on that same
                middle. The row's top is 11 under the -50% pill, and 11
                between the struck price and the price. */}
            {/* 6 from the pill to the $5's cap (Žilvinas 2026-09-25, the 4 x 6
                spacer): the 32px box's cap starts ~2 under its top, so 4. */}
            <div className="relative mt-[4px] flex items-center justify-between md:mt-[5px]">
              <span className="absolute bottom-[calc(100%-2px)] left-0 text-[13px] leading-none text-white/45 md:bottom-[calc(100%+2px)] md:text-[18px]">{plan.billing}</span>
              {/* SemiBold 20 off the inspector (Žilvinas 2026-09-25). */}
              <h2 id={step === "pay" ? "plan-sheet-title" : undefined} className="text-[20px] font-semibold leading-none text-white md:text-[29px]">
                {c.pay.totalLabel}
              </h2>
              <span className="flex items-center gap-[11px]">
                {/* SemiBold 32 and 24, off the inspector (Žilvinas 2026-09-25). */}
                {/* WHAT IS CHARGED TODAY — the whole period, $60 for the year —
                    not the per-month $5 the plan rows show (2026-10-04). The
                    struck figure is the same months at the 1-month price. */}
                {due.was && <span className={`text-[24px] font-semibold leading-none md:text-[32px] ${WAS}`}><Money>{due.was}</Money></span>}
                <span className="text-[32px] font-semibold leading-none text-white md:text-[44px]"><Money>{due.price}</Money></span>
              </span>
            </div>

            {/* The card fields, the email and Submit: Stripe's own fields in
                the sheet's clothes — see StripePay. ONE FOR EACH PLAN THAT
                HAS BEEN ASKED FOR (`built`: the chosen plan at open, then
                the rest one at a time), each paying for its own plan's
                session, and only the chosen plan's on stage. The others
                stand under it exactly as the whole step stands behind step
                one: out of flow, see-through and inert, but at their full
                size, because Stripe will not draw into a box that has none.
                They are never unmounted for a change of plan — only
                `attempt` builds them again. */}
            <div className="relative">
              {c.options.filter((o) => built.includes(o.id as PlanId)).map((o) => (
                <PlanStep key={`${o.id}:${attempt}`} planId={o.id as PlanId} on={o.id === plan.id} onPresentable={report} />
              ))}
            </div>

            <p className="mt-[19px] flex items-center justify-center gap-[22px] text-[12px] leading-none text-white/60 md:mt-[16px] md:gap-[40px] md:text-[17px]">
              <span className="flex items-center gap-[6px]">
                <BoltGlyph className="size-[18.4px] text-[#8b8b8b] md:size-[24px]" />
                {c.pay.cancel}
              </span>
              <span className="flex items-center gap-[6px]">
                <ShieldGlyph className="size-[18.4px] text-[#8b8b8b] md:size-[24px]" />
                {c.pay.moneyBack}
              </span>
            </p>

            {/* The four badges as the frame's own band, cut lossless at 4x. */}
            {/* THE BADGES ARE ONE SVG (Žilvinas 2026-09-25, "improve these to
                the maximum"): the frame's own 24..352 x 507..553 band, kept
                as vectors — Verified by Visa and PCI DSS are the frame's
                paths; Mastercard ID Check is the vector from SVG Repo
                (svgrepo.com/svg/508702), laid out at the frame's geometry
                with the wordmark in white; McAfee SECURE is the frame's
                771-wide raster (12x the 62 it draws at) with SECURE painted
                white in the pixels — NOT through the frame's pattern-fill
                and alpha mask, which WebKit tiled with a cut right edge
                (Žilvinas 2026-09-25, "the right part is janky"). No vector
                of that lockup exists to take. A raw <img> since Img sizes
                from the WebP table; the sheet mounts on demand, so a plain
                src is fine. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/templates/pay-badges.svg"
              alt={c.pay.badgesAlt}
              width={328}
              height={46}
              decoding="async"
              // THE DESKTOP BAND IS 477 WIDE, centred (Žilvinas 2026-09-25, "the
              // logos are smaller in here", off the supplied 776 frame: Visa
              // starts at 150 and McAfee ends at 627). Full width at 776 blew
              // them up to a row of billboards.
              className="mt-[5px] h-auto w-full md:mt-[10px] md:w-[477px] md:mx-auto"
            />

            {/* Regular 12 on a 16 line, the full 326 (Žilvinas 2026-09-25). */}
            <p className="mt-[5px] text-center text-[12px] leading-[16px] text-white/45 md:mt-[14px] md:text-[17px] md:leading-[24px]">
              {c.pay.legalPrefix}{" "}
              <Link href="/legal/terms-and-conditions" className="text-white/70 underline underline-offset-2">
                {c.pay.terms}
              </Link>{" "}
              {c.pay.and}{" "}
              <Link href="/legal/privacy-policy" className="text-white/70 underline underline-offset-2">
                {c.pay.privacy}
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
