"use client";

import { useEffect, useRef, useState } from "react";
import { Img } from "./Img";
import { BoltGlyph, LinkMark, LockGlyph, ShieldGlyph } from "./plan-sheet-glyphs";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL } from "@/lib/site";

/**
 * The PHONE's purchase sheet (Žilvinas 2026-09-25, from the two supplied
 * frames; PRD: "PRD: /templates purchase sheet (phone)"). Any link on
 * /templates that carries `data-plan` — the hero CTA, the bar's Redeem
 * button, the drawer's Buy Now, the table's and the Access card's Buy Now —
 * opens it instead of leaving, below md only; from md up, and with
 * JavaScript off, those links still go straight to the webapp as before,
 * since the href is untouched.
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

/** The violet button, inverting to white on hover like every button. */
const VIOLET =
  "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5]";

export function PlanSheet() {
  const c = TEMPLATES_PAGE.plans;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState<"plan" | "pay">("plan");
  const [planId, setPlanId] = useState<string>(c.defaultId);
  const closeTimer = useRef(0);

  const open = () => {
    window.clearTimeout(closeTimer.current);
    setStep("plan");
    setMounted(true);
    // Two frames so the panel's first paint is at translateY(100%) and the
    // transition has somewhere to go from — one frame is not always enough
    // for the browser to have laid it out.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const close = () => {
    setShown(false);
    closeTimer.current = window.setTimeout(() => setMounted(false), OPEN_MS);
  };

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    function onClick(e: MouseEvent) {
      if (!phone.matches) return;
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  const plan = c.options.find((o) => o.id === planId) ?? c.options[0];
  const checkout = `${APP_URL}/?plan=${plan.id}`;
  const motion =
    "transition-[transform,opacity] duration-[560ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform motion-reduce:transition-none";

  return (
    <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-labelledby="plan-sheet-title">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 bg-black/60 ${motion} ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[calc(100dvh-24px)] overflow-y-auto rounded-t-[14px] bg-[#181818] pb-[max(27px,env(safe-area-inset-bottom))] ${motion} ${
          shown ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {step === "plan" ? (
          // 24 from the sheet's top to the title and 24 from the title to
          // the first row; 15 between rows (Žilvinas 2026-09-25, off the
          // artboard's spacers).
          <div className="px-6 pt-6">
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
                        className="absolute -top-[7.5px] left-[41px] z-[1] flex h-[20px] w-[74px] items-center justify-center rounded-[5px] bg-white text-[12px] font-semibold leading-none text-black"
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
              onClick={() => setStep("pay")}
              // Poppins Medium, 18 for the label and 14 for "/month" at 50%
              // white, off the inspector (Žilvinas 2026-09-25). The 50% is
              // an opacity rather than a colour so it still inverts with the
              // button on hover.
              className={`mt-5 flex h-[47px] w-full items-center justify-center rounded-[10px] text-[18px] font-medium ${VIOLET}`}
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
            className="px-[25px] pt-[22px]"
            // Nothing submits here yet — see the note at the top.
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = checkout;
            }}
          >
            {/* Summary: the billing line with the discount pill, then the
                total with the struck old price. */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] leading-none text-white/45">{plan.billing}</span>
              {plan.off && (
                <span className="flex h-5 items-center rounded-[5px] bg-white px-3 text-[12px] font-semibold leading-none text-black">
                  {plan.off}
                </span>
              )}
            </div>
            {/* TIGHT under "Billed yearly" (Žilvinas 2026-09-25, twice: "max
                10", then "it must be smaller"): the row is centred on the
                32px price, whose box starts 7 above the 18px label's, so
                the row overlaps the billing line's box by 2 to put the
                label's cap about 6 under it — as close as it goes before
                the price's cap meets the pill above it. */}
            <div className="-mt-[2px] flex items-center justify-between">
              <h2 id="plan-sheet-title" className="text-[18px] font-semibold leading-none text-white">
                {c.pay.totalLabel}
              </h2>
              <span className="flex items-baseline gap-[10px]">
                {/* SemiBold 32 and 24, off the inspector (Žilvinas 2026-09-25). */}
                {plan.was && <span className={`text-[24px] font-semibold leading-none ${WAS}`}>{plan.was}</span>}
                <span className="text-[32px] font-semibold leading-none text-white">{plan.price}</span>
              </span>
            </div>

            {/* Stripe Link, in its own green. Until Stripe is wired this
                goes to the webapp like Submit does. */}
            <a
              href={checkout}
              className="mt-[17px] flex h-[50px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-[#00da62] text-[18px] font-medium leading-none text-black transition-opacity duration-150 hover:opacity-90"
            >
              {/* Medium 18 and the client's 61 x 21 mark (Žilvinas 2026-09-25). */}
              {c.pay.payWith}
              <LinkMark className="h-[21px] w-[61px]" />
            </a>

            {/* "or": Poppins Regular 20, #909090 (Žilvinas 2026-09-25). */}
            <div className="mt-[20px] flex items-center gap-4 text-[20px] leading-none text-[#909090]">
              {/* 2 weight (Žilvinas 2026-09-25, the frame's 326 x 0 line). */}
              <span className="h-[2px] flex-1 bg-white/25" />
              {c.pay.or}
              <span className="h-[2px] flex-1 bg-white/25" />
            </div>

            {/* Medium 20, 25 under the rule — the inspector's 14 x 25 spacer
                (Žilvinas 2026-09-25; the message said 28, the spacer 25). */}
            <p className="mt-[25px] text-[20px] font-medium leading-none text-white">{c.pay.cardInfo}</p>

            {/* The field group: one #222222 block with a 3px #181818 seam
                between the card number and the MM/YY | CVV pair. Disabled
                until Stripe's own iframes take their place. */}
            <fieldset disabled className="mt-[13px] flex flex-col gap-[2px]" aria-describedby="plan-sheet-note">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder={c.pay.cardNumber}
                // Regular 18, placeholders at 50% white (Žilvinas 2026-09-25).
                className="h-[45px] w-full rounded-t-[10px] bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50"
              />
              <div className="grid grid-cols-2 gap-[2px]">
                <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder={c.pay.expiry} className="h-[45px] rounded-bl-[10px] bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50" />
                <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder={c.pay.cvv} className="h-[45px] rounded-br-[10px] bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50" />
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder={c.pay.email}
                className="mt-[20px] h-[45px] w-full rounded-[10px] bg-[#222222] px-4 text-[18px] text-white placeholder:text-white/50"
              />
            </fieldset>
            <span id="plan-sheet-note" className="sr-only">
              Card payment opens on app.mushi.agency.
            </span>

            <button
              type="submit"
              className={`mt-[27px] flex h-[50px] w-full items-center justify-center gap-[10px] rounded-[10px] text-[16px] font-semibold ${VIOLET}`}
            >
              <LockGlyph className="h-[19px] w-auto" />
              {c.pay.submit}
            </button>

            <p className="mt-[19px] flex items-center justify-center gap-[22px] text-[12px] leading-none text-white/60">
              <span className="flex items-center gap-[6px]">
                <BoltGlyph className="size-[18.4px] text-[#8b8b8b]" />
                {c.pay.cancel}
              </span>
              <span className="flex items-center gap-[6px]">
                <ShieldGlyph className="size-[18.4px] text-[#8b8b8b]" />
                {c.pay.moneyBack}
              </span>
            </p>

            {/* The four badges as the frame's own band, cut lossless at 4x. */}
            {/* The band is the frame's own 24..352 x 507..553, so it sits
                where the frame has it: 5 under the line, the legal 5 under it. */}
            <Img src="templates/pay-badges.webp" alt={c.pay.badgesAlt} width={328} className="mt-[5px] h-auto w-full" />

            {/* Regular 12 on a 16 line, the full 326 (Žilvinas 2026-09-25). */}
            <p className="mt-[5px] text-center text-[12px] leading-[16px] text-white/45">
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
  );
}
