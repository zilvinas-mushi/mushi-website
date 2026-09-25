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

/** The struck-through old price, in the frame's red ramp. */
const WAS =
  "bg-[linear-gradient(112deg,#de8a8b_0%,#b55456_40%,#b55456_100%)] bg-clip-text text-transparent line-through decoration-[#c9666a]";

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
          <div className="px-6 pt-7">
            <h2 id="plan-sheet-title" className="text-center text-[19px] font-semibold leading-none text-white">
              {c.title}
            </h2>

            <div className="mt-[22px] flex flex-col gap-[14px]" role="radiogroup" aria-label={c.title}>
              {c.options.map((o) => {
                const on = o.id === planId;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPlanId(o.id)}
                    // The selected row's 2px ring ramps #A08ADD to #7054B4
                    // left to right: two backgrounds, the fill on the
                    // padding box and the ramp on the border box, with a
                    // transparent border between them.
                    className={`relative flex h-[78px] w-full items-center gap-3 rounded-[14px] px-4 text-left transition-colors duration-200 ${
                      on ? "border-2 border-transparent" : "bg-[#222222]"
                    }`}
                    // Inline, not an arbitrary class: a two-layer background
                    // with box keywords does not survive Tailwind's parser.
                    style={
                      on
                        ? { background: "linear-gradient(#2a2431,#2a2431) padding-box, linear-gradient(90deg,#a08add,#7054b4) border-box" }
                        : undefined
                    }
                  >
                    {o.save && (
                      <span className="absolute -top-[9px] left-[41px] flex h-[18px] items-center rounded-[3.4px] bg-white px-2 text-[11px] font-semibold leading-none text-black">
                        {o.save}
                      </span>
                    )}
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
                      <span className="text-[18px] font-semibold leading-none text-white">{o.name}</span>
                      <span className="text-[12.5px] leading-none text-white/45">{o.total}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-[3px]">
                      <span className="flex items-baseline gap-2">
                        {o.was && <span className={`text-[20px] font-semibold leading-none ${WAS}`}>{o.was}</span>}
                        <span className="text-[26px] font-semibold leading-none text-white">{o.price}</span>
                      </span>
                      <span className="text-[12px] font-semibold leading-none text-white/45">{c.perMonth}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep("pay")}
              className={`mt-5 flex h-[47px] w-full items-center justify-center rounded-[10px] text-[18px] font-semibold ${VIOLET}`}
            >
              {c.ctaPrefix} {plan.price}
              <span className="text-[13px] font-semibold opacity-70">{c.perMonth}</span>
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] leading-none text-white/45">
              {c.includesLabel}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="size-[14px] text-white" aria-hidden="true">
                <path d="M8 2 2 5.2 8 8.4l6-3.2L8 2Z" />
                <path d="m2 8.2 6 3.2 6-3.2" />
                <path d="m2 11.2 6 3.2 6-3.2" />
              </svg>
              <span className="text-white">{c.includes}</span>
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
            <div className="mt-[3px] flex items-center justify-between">
              <h2 id="plan-sheet-title" className="text-[18px] font-semibold leading-none text-white">
                {c.pay.totalLabel}
              </h2>
              <span className="flex items-baseline gap-[10px]">
                {plan.was && <span className={`text-[22px] font-semibold leading-none ${WAS}`}>{plan.was}</span>}
                <span className="text-[34px] font-semibold leading-none text-white">{plan.price}</span>
              </span>
            </div>

            {/* Stripe Link, in its own green. Until Stripe is wired this
                goes to the webapp like Submit does. */}
            <a
              href={checkout}
              className="mt-[17px] flex h-[50px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-[#00da62] text-[16px] font-semibold leading-none text-black transition-opacity duration-150 hover:opacity-90"
            >
              {c.pay.payWith}
              <LinkMark className="h-[22px] w-auto" />
            </a>

            {/* "or": Poppins Regular 20, #909090 (Žilvinas 2026-09-25). */}
            <div className="mt-[20px] flex items-center gap-4 text-[20px] leading-none text-[#909090]">
              <span className="h-px flex-1 bg-white/25" />
              {c.pay.or}
              <span className="h-px flex-1 bg-white/25" />
            </div>

            <p className="mt-[16px] text-[17px] font-semibold leading-none text-white">{c.pay.cardInfo}</p>

            {/* The field group: one #222222 block with a 3px #181818 seam
                between the card number and the MM/YY | CVV pair. Disabled
                until Stripe's own iframes take their place. */}
            <fieldset disabled className="mt-[13px] flex flex-col gap-[2px]" aria-describedby="plan-sheet-note">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder={c.pay.cardNumber}
                className="h-[45px] w-full rounded-t-[10px] bg-[#222222] px-4 text-[15px] text-white placeholder:text-white/40"
              />
              <div className="grid grid-cols-2 gap-[2px]">
                <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder={c.pay.expiry} className="h-[45px] rounded-bl-[10px] bg-[#222222] px-4 text-[15px] text-white placeholder:text-white/40" />
                <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder={c.pay.cvv} className="h-[45px] rounded-br-[10px] bg-[#222222] px-4 text-[15px] text-white placeholder:text-white/40" />
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder={c.pay.email}
                className="mt-[20px] h-[45px] w-full rounded-[10px] bg-[#222222] px-4 text-[15px] text-white placeholder:text-white/40"
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
                <BoltGlyph className="h-[15px] w-auto text-[#8b8b8b]" />
                {c.pay.cancel}
              </span>
              <span className="flex items-center gap-[6px]">
                <ShieldGlyph className="h-[15px] w-auto text-[#8b8b8b]" />
                {c.pay.moneyBack}
              </span>
            </p>

            {/* The four badges as the frame's own band, cut lossless at 4x. */}
            {/* The band is the frame's own 24..352 x 507..553, so it sits
                where the frame has it: 5 under the line, the legal 5 under it. */}
            <Img src="templates/pay-badges.webp" alt={c.pay.badgesAlt} width={328} className="mt-[5px] h-auto w-full" />

            {/* 262 wide, centred: the frame's block, which breaks after
                "Terms and". */}
            <p className="mx-auto mt-[5px] max-w-[262px] text-center text-[11px] leading-[15px] text-white/45">
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
