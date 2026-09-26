"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { BoltGlyph, LinkMark, LockGlyph, ShieldGlyph } from "./plan-sheet-glyphs";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL } from "@/lib/site";

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
 * IT RISES FROM THE BOTTOM, see OPEN_MS, the backdrop fading with it; it
 * is mounted only while open (and for the time it takes to leave),
 * so a closed sheet is nothing in the DOM. Escape and the backdrop dismiss
 * it, and the page behind it does not scroll.
 *
 * STRIPE IS NOT WIRED YET (2026-09-25). The card fields are Stripe's job —
 * a Payment Element needs a client secret from the webapp, which does not
 * expose one yet (PRD, Architecture). Until it does the fields are
 * disabled, and both Pay with Link and Submit payment send the visitor to
 * the webapp with the plan in the query string. A field that took card
 * numbers into nothing would be worse than none.
 */
/**
 * The rise: 560ms on a sheet curve — fast off the bottom, then a long,
 * decelerating settle (cubic-bezier(0.32, 0.72, 0, 1), the curve iOS
 * sheets use). A flat ease-out over 400 read as a pop (Žilvinas
 * 2026-09-25, "smoother"). The backdrop fades on the same clock.
 */
const OPEN_MS = 560;

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

/** A payment field: 45 tall, #222222, Regular 18, placeholder at 50% white. */
const FIELD =
  "h-[45px] w-full bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b6ad6] md:h-[56px] md:px-[22px] md:text-[22px]";

export function PlanSheet() {
  const c = TEMPLATES_PAGE.plans;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState<"plan" | "pay">("plan");
  const [planId, setPlanId] = useState<string>(c.defaultId);
  const closeTimer = useRef(0);
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
   * Desktop only: the step's frame (650 for the plan, 763 for payment)
   * zoomed down just enough to clear the viewport, 1 whenever it fits.
   * Zoom rather than transform so the layout box shrinks with it.
   */
  const [fit, setFit] = useState(1);

  const open = () => {
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
    flushSync(() => {
      setStep("plan");
      setStepIn(true);
      setMounted(true);
    });
    if (panelRef.current) {
      panelRef.current.style.height = "";
      panelRef.current.style.transition = "";
    }
    void panelRef.current?.getBoundingClientRect();
    setShown(true);
  };
  const goPay = () => {
    const panel = panelRef.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep("pay");
      return;
    }
    setStepIn(false);
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
    }, 170);
  };
  const close = () => {
    window.clearTimeout(stepTimer.current);
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
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const size = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const frame = step === "plan" ? 650 : 763;
      setFit(desktop ? Math.min(1, (window.innerHeight - 24) / frame) : 1);
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [mounted, step]);

  // THE PAGE BEHIND DOES NOT SCROLL — by swallowing the wheel, touch and
  // key scrolling, NOT overflow:hidden on the body (Žilvinas 2026-09-25,
  // "the menu shows up instantly when you leave"): <html> clips overflow-x,
  // so a hidden overflow on <body> made the BODY the scroll container and
  // the sticky header lost the viewport — it sat at its flow position,
  // off screen, the whole time the sheet was open and snapped back the
  // instant the lock came off. Scrolling inside the sheet's own panel is
  // still allowed when it has somewhere to go (the phone).
  useEffect(() => {
    if (!mounted) return;
    const panel = panelRef.current;
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
    };
  }, [mounted]);

  if (!mounted) return null;

  const plan = c.options.find((o) => o.id === planId) ?? c.options[0];
  const checkout = `${APP_URL}/?plan=${plan.id}`;
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
      className="fixed inset-0 z-[100] md:flex md:items-end md:justify-center md:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-sheet-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 bg-black/60 md:backdrop-blur-[9px] ${motion} ${shown ? "opacity-100" : "opacity-0"}`}
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
        style={{ zoom: fit }}
        ref={panelRef}
      >
        <div
          // Out is quick and small — 170ms, 6px, easing in — and in is
          // calm and a little longer — 380ms, 14px, on the sheet curve
          // (Žilvinas 2026-09-26, "premium and subtle, a little more").
          className={`motion-reduce:transition-none ${
            stepIn
              ? "translate-x-0 opacity-100 transition-[opacity,translate] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              : step === "plan"
                ? "-translate-x-[6px] opacity-0 transition-[opacity,translate] duration-[170ms] ease-in"
                : "translate-x-[14px] opacity-0"
          }`}
        >
        {step === "plan" ? (
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
                    onClick={() => setPlanId(o.id)}
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
                        className="absolute -top-[7.5px] left-[41px] z-[1] flex h-[20px] w-[74px] items-center justify-center rounded-[5px] bg-white pb-[1px] pl-[1px] text-center text-[12px] font-semibold leading-none text-black"
                      >
                        {o.save}
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
                        <span className="text-[14px] leading-none text-white/45">{o.total}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-[3px]">
                        <span className="flex items-baseline gap-2">
                          {/* SemiBold 32 off the inspector (Žilvinas 2026-09-25); the
                              struck price at 24, its proportion in the frame. */}
                          {o.was && <span className={`text-[24px] font-semibold leading-none ${WAS}`}>{o.was}</span>}
                          <span className="text-[32px] font-semibold leading-none text-white">{o.price}</span>
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
              className={`mt-5 flex h-[47.35px] w-full items-center justify-center rounded-[10px] text-[18px] font-medium ${VIOLET}`}
            >
              {c.ctaPrefix} {plan.price}
              <span className="text-[14px] font-medium opacity-50">{c.perMonth}</span>
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
        ) : (
          <form
            className="px-[25px] pt-[22px] md:px-[31px] md:pt-[35px]"
            // Nothing submits here yet — see the note at the top.
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.value.trim();
              window.location.href = email ? `${checkout}&email=${encodeURIComponent(email)}` : checkout;
            }}
          >
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
              <h2 id="plan-sheet-title" className="text-[20px] font-semibold leading-none text-white md:text-[29px]">
                {c.pay.totalLabel}
              </h2>
              <span className="flex items-center gap-[11px]">
                {/* SemiBold 32 and 24, off the inspector (Žilvinas 2026-09-25). */}
                {plan.was && <span className={`text-[24px] font-semibold leading-none md:text-[32px] ${WAS}`}>{plan.was}</span>}
                <span className="text-[32px] font-semibold leading-none text-white md:text-[44px]">{plan.price}</span>
              </span>
            </div>

            {/* Stripe Link, in its own green. Until Stripe is wired this
                goes to the webapp like Submit does. */}
            <a
              href={checkout}
              className="mt-[17px] flex h-[50px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-[#00da62] text-[18px] font-medium leading-none text-black transition-opacity duration-150 hover:opacity-90 md:mt-[19px] md:h-[62px] md:gap-[8px] md:rounded-[15px] md:text-[25px]"
            >
              {/* Medium 18 and the client's 61 x 21 mark (Žilvinas 2026-09-25). */}
              {c.pay.payWith}
              <LinkMark className="h-[21px] w-[61px] md:h-[29px] md:w-[84px]" />
            </a>

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

            {/* The field group: one #222222 block with a 3px #181818 seam
                between the card number and the MM/YY | CVV pair. Disabled
                until Stripe's own iframes take their place. */}
            {/* THE FIELDS TAKE INPUT (Žilvinas 2026-09-25, "why can't you
                type") and format as you go — digits in fours, MM/YY, a 3–4
                digit CVV. NOTHING IS SENT: with Stripe not wired there is
                nowhere safe to send a card number, so Submit carries only the
                plan and the email to the webapp and the card fields are left
                behind on this page. When the Payment Element lands these
                inputs become Stripe's iframes; see the PRD. */}
            {/* NO gap ON THESE BOXES (Žilvinas 2026-09-25, "the submit
                button keeps jumping"): password managers (NordPass here)
                inject their icon element INTO the focused field's parent,
                and a stray child in a flex column or a two-column grid is
                one more gap — 3px — so everything under it dropped on
                focus and rose on blur. The seams are margins on the fields
                instead, which an extra child cannot add to. */}
            <div role="group" className="mt-[13px] flex flex-col" aria-describedby="plan-sheet-note">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={19}
                placeholder={c.pay.cardNumber}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.value = el.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
                }}
                className={`${FIELD} rounded-t-[10px] md:rounded-t-[15px]`}
              />
              <div className="mt-[2px] grid grid-cols-2 gap-x-[2px] md:mt-[3px] md:gap-x-[3px]">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  placeholder={c.pay.expiry}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    const d = el.value.replace(/\D/g, "").slice(0, 4);
                    el.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
                  }}
                  className={`${FIELD} rounded-bl-[10px] md:rounded-bl-[15px]`}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  placeholder={c.pay.cvv}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.value = el.value.replace(/\D/g, "").slice(0, 4);
                  }}
                  className={`${FIELD} rounded-br-[10px] md:rounded-br-[15px]`}
                />
              </div>
              <input type="email" name="email" autoComplete="email" placeholder={c.pay.email} className={`${FIELD} mt-[22px] rounded-[10px] md:mt-[28px] md:rounded-[15px]`} />
            </div>
            <span id="plan-sheet-note" className="sr-only">
              Card payment is completed on app.mushi.agency.
            </span>

            <button
              type="submit"
              className={`mt-[27px] flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[10px] text-[16px] font-semibold md:mt-[34px] md:h-[62px] md:gap-[14px] md:rounded-[15px] md:text-[24px] md:font-medium ${VIOLET}`}
            >
              <LockGlyph className="h-[19px] w-auto md:h-[33px] md:[stroke-width:2.2]" />
              {c.pay.submit}
            </button>

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
              <a href={`${APP_URL}/terms`} className="text-white/70 underline underline-offset-2">
                {c.pay.terms}
              </a>{" "}
              {c.pay.and}{" "}
              <a href={`${APP_URL}/privacy`} className="text-white/70 underline underline-offset-2">
                {c.pay.privacy}
              </a>
            </p>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
