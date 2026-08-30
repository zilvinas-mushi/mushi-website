"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/content";
import { BOOKING_URL, CREATIVES_CTA_ID, FINAL_CTA_ID, SITE_NAME } from "@/lib/site";

/**
 * Which drawer row reads as selected.
 *
 * mushi-app derives this from the pathname; here every nav target is an anchor
 * on one page, so there is no route to compare against. Until a scroll-spy
 * exists the design's selected row is pinned to the first entry — the same
 * "one row is always lit" shape the app has, rather than a drawer where
 * nothing is selected until you scroll.
 */
const ACTIVE_NAV = "Agency";

/**
 * The phone's CTA label, which is NOT the desktop bar's "Book a Call" — the
 * artboard sets this one as SCHEDULE A CALL and both spellings are in
 * design/COPY.md. One string, used by the drawer and by the bar's own button,
 * so the two can never disagree.
 */
const PHONE_CTA = "Schedule a Call";

/**
 * The violet fill, and the white it inverts to.
 *
 * The header CTA's three Figma stops verbatim. At 117.51deg the gradient line
 * across a 345 x 52 box is 330 long and almost entirely horizontal, so the
 * light pools at the LEFT edge and the last third sits flat at #6E54B5 —
 * which is what the artboard shows for both of these buttons.
 *
 * Per CLAUDE.md the hover state repeats all THREE stop positions in white
 * rather than being a flat colour: a 2-stop hover against a 3-stop rest cannot
 * interpolate, so the fill would snap instead of cross-fading.
 */
const VIOLET_CTA =
  "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] active:text-[#6e54b5]";

/** 52 tall, radius 7, 17px semibold caps — the drawer's row box. */
const CTA_BOX =
  "flex h-[3.25rem] items-center justify-center rounded-[0.4375rem] text-[1.0625rem] font-semibold uppercase";

/**
 * Three bars that become one.
 *
 * NO FADE (designer, 2026-08-30). The outer two used to go `opacity-0` on the
 * way in, which made the open state a single bar because the other two had
 * been erased. They now only travel: 0.625rem is exactly the 0.4375 gap plus
 * the 0.1875 bar, so each outer bar lands ON the middle one and the three
 * genuinely merge into the one rule the artboard draws. Nothing disappears —
 * it stacks — which is also why the move has to stay exact. Change the gap or
 * the bar height and this number changes with them, or the open state is
 * three bars with a seam in it.
 *
 * `transition-transform`, not `transition-all`: with the opacity gone there is
 * nothing else on these spans worth animating, and naming the property keeps a
 * later colour or width change from acquiring a 400ms lag by accident.
 */
function MenuIcon({ open }: { open: boolean }) {
  // 250ms. 200 was too quick to read as travel — the icon just changed — but
  // the 400 that fixed that overshot and the menu felt slow to answer a tap
  // (Žilvinas 2026-08-30, twice). 250 is the merge still legible as a merge
  // over 10px, without the icon becoming something you wait for.
  const bar =
    "block h-[0.1875rem] w-[1.875rem] rounded-full bg-white transition-transform duration-[250ms] ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden="true" className="flex flex-col items-end gap-[0.4375rem]">
      <span className={`${bar} ${open ? "translate-y-[0.625rem]" : ""}`} />
      <span className={bar} />
      <span className={`${bar} ${open ? "-translate-y-[0.625rem]" : ""}`} />
    </span>
  );
}

/**
 * How far the bar's Schedule a Call button is out, 0 to 1.
 *
 * TIED TO THE SCROLL, NOT TRIGGERED BY IT (Žilvinas 2026-08-30). This was a
 * boolean and a 500ms transition: you crossed a line and the button then
 * played its own little animation afterwards, on its own clock, whatever your
 * finger was doing. It is a POSITION now rather than an event — the button is
 * out exactly as far as you have scrolled, and goes back in if you scroll
 * back, frame for frame with the page.
 *
 * TWO EDGES, one at each end of the page's middle, and each is now a RANGE
 * rather than a threshold:
 *
 *   - It comes out over exactly the scroll it takes the creatives "Yes" pill
 *     to disappear under the bar: nothing when the pill's top touches the
 *     bar's bottom edge, all the way out when the pill's own bottom does. One
 *     goes in as the other comes out, which is the swap the design asks for
 *     and reads as one movement rather than two.
 *   - It goes back in over the scroll it takes the final card's "15 Minute
 *     Fit-Check" pill to arrive: untouched when that pill's top touches the
 *     bottom of the screen, fully back in once the pill is entirely on screen.
 *     From there down the page is already asking in a pill of its own, and a
 *     second identical button pinned to the top of the screen asks twice.
 *
 * THE TRAVEL OF EACH RANGE IS THE PILL'S OWN HEIGHT, the only number here that
 * is not invented. It also keeps both movements near 1:1 with the finger — 42
 * of scroll for 52 of button — so the CTA reads as being carried by the page
 * rather than as something the page set off.
 *
 * MEASURED FROM THE PILLS, NOT A SCROLL DISTANCE. A hard `scrollY > n` would
 * be a number that silently goes wrong every time anything above the creatives
 * section changes height — and the hero alone changes height with the
 * viewport, the copy and the font that happens to be loaded. The range is the
 * elements the design names, so it moves with them.
 *
 * The "Yes" edge measures against the BAR'S OWN MEASURED BOTTOM rather than
 * the top of the window: the bar floats over the page, so a pill at y = 20 is
 * already behind it. Measured off the element, not parsed out of --header-h —
 * that property is a plain custom property, so getPropertyValue hands back the
 * SPECIFIED token stream rather than a resolved length ("92px" on a phone, but
 * the literal string "clamp(42.48px, 4.16664vw, 80px)" from md up, which
 * parseFloat turns into NaN). The element already knows its own height.
 *
 * The fit-check edge measures against the bottom of the window instead, and
 * deliberately: the two ask different questions — has this gone under the bar,
 * versus has this arrived at all — and the bar is nowhere near that edge.
 *
 * IT WRITES A CUSTOM PROPERTY, NOT REACT STATE. This runs on every scroll
 * frame, and re-rendering the header sixty times a second to move one box
 * would be absurd; the number goes straight onto the node and the transform
 * stays in CSS. The one thing that IS state is whether the button is out far
 * enough to be worth offering to a screen reader or the tab key, which changes
 * twice in a page.
 *
 * The scroll listener replaces two IntersectionObservers, and loses nothing:
 * an observer reports crossings, and a crossing is exactly the thing this no
 * longer wants to know. It also quietly fixes an edge those had — a jump that
 * lands past the pill without it ever touching the viewport (an anchor from
 * the drawer) crosses no threshold, fires no callback, and used to leave the
 * button in the wrong place until the next crossing. A measurement per frame
 * has no such state to get stuck in.
 */
function useCtaTravel(
  barRef: RefObject<HTMLDivElement | null>,
  ctaRef: RefObject<HTMLDivElement | null>,
) {
  const [reachable, setReachable] = useState(false);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const yesPill = document.getElementById(CREATIVES_CTA_ID);
    const finalPill = document.getElementById(FINAL_CTA_ID);

    let frame = 0;
    let last = -1;

    const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

    // Arrow consts rather than `function` declarations: a hoisted declaration
    // could in principle run before the `if (!cta) return` above, so TS will
    // not carry that narrowing into one and `cta` reads as possibly null.
    const measure = () => {
      frame = 0;

      // Re-read rather than measured once on mount: the bar's height is a
      // media query away from changing, and this is a rect being taken on a
      // frame that is already being spent.
      const barBottom = barRef.current?.getBoundingClientRect().bottom ?? 0;

      let out = 0;

      if (yesPill) {
        const r = yesPill.getBoundingClientRect();
        // `|| 1` guards the divide, not the layout: a zero-height rect means
        // the pill is display:none, and 0/0 puts NaN into the transform, which
        // freezes the button wherever it happened to be.
        out = clamp01((barBottom - r.top) / (r.height || 1));
      }

      if (finalPill) {
        const r = finalPill.getBoundingClientRect();
        // The clamp at 1 is also what holds the button IN for everything below
        // the pill: once the fit-check has scrolled off the top this only
        // grows, so the CTA cannot reappear over the footer after the page has
        // finished asking.
        out *= 1 - clamp01((window.innerHeight - r.top) / (r.height || 1));
      }

      if (out === last) return;
      last = out;
      cta.style.setProperty("--cta-out", String(out));
      // Two values, so React bails out of the re-render on every frame that
      // does not cross the line.
      setReachable(out > 0.5);
    };

    const onScroll = () => {
      // Coalesced to one measurement per frame: a passive listener still fires
      // more often than the page paints, on a trackpad or a fast flick.
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [barRef, ctaRef]);

  return reachable;
}

/**
 * Phone header, ported from mushi-app's components/app/mobile-header so both
 * properties share one motion: the hamburger's outer bars slide onto the middle
 * one while the drawer is open — stacking into the single rule the artboard
 * draws, rather than fading out behind it, see MenuIcon — and the drawer floats
 * over the page below the bar rather than pushing content down.
 *
 * REDESIGNED 2026-08-26 (Žilvinas). What changed from the port:
 *
 *   - The bar is wordmark LEFT, menu button RIGHT. It was menu / wordmark /
 *     call-button across three columns.
 *   - The violet phone-icon button is gone from the bar. The CTA it stood for
 *     is now a full-width button BELOW the bar, and only past the "Yes" pill.
 *   - The drawer is the three nav rows and one Schedule a Call button. The
 *     half-and-half "Buy now" / "Login" row into the webapp is dropped, and so
 *     is the separate "Book an agency call" beneath it. APP_BUY_URL and
 *     APP_LOGIN_URL are still exported from site.ts if either comes back.
 *
 * Since these are same-page anchor links, where the pathname never changes,
 * the drawer closes on link tap instead of on route change.
 */
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaReachable = useCtaTravel(shellRef, ctaRef);

  // THE DRAWER DOES NOT MOVE THE CTA (Žilvinas 2026-08-30). Opening the menu
  // used to send the bar's button back up, because the drawer carries its own
  // copy and two identical buttons 8px apart is one too many. But the drawer
  // opens at exactly the CTA's own `top-full mt-2`, is opaque #181818, is four
  // rows tall and sits at z-50 — it already COVERS the button completely. So
  // the button was animating out from behind something that had just hidden
  // it, which is the "off" thing you see on tap: two movements where the
  // drawer's arrival is the only one anybody can follow.
  //
  // It stays put now, and `open` only takes it out of the tab order and the
  // accessibility tree, so nothing behind the drawer can be reached.
  const ctaOffered = ctaReachable && !open;

  // Tap-outside and Escape both dismiss the drawer — it floats over the page,
  // so there is no other affordance to close it besides the button itself.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocPointer(e: PointerEvent) {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDocPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDocPointer);
    };
  }, [open]);

  return (
    <div ref={shellRef} className="sticky top-0 z-50 px-4 pb-2 pt-3 md:hidden">
      {/* relative: the drawer AND the bar's CTA are absolutely positioned
          against this box so they overlay the page instead of taking up layout
          space. That matters more than it looks — this div is in normal flow
          and the hero is pulled up by exactly its height (--header-h, 92 on
          phones), so a button that occupied flow space here would shove the
          whole page down by 60px the moment it appeared. */}
      <div className="relative">
        {/* Radius 5, straight off the Figma frame (345 x 58, corner 5) — not
            the 16 this was ported with. The drawer below carries the same 5:
            fitting the artboard's corner arc gives ~12px at that screenshot's
            2.61x scale for both boxes. */}
        {/* `relative z-20` so the CTA below can slide UNDER it rather than
            across it. The bar is opaque #181818 and 72 tall against the CTA's
            52 + 8 gap, so the hidden position is fully covered — which is what
            lets the hidden state be a pure slide with no fade propping it up. */}
        <header className="relative z-20 flex items-center justify-between overflow-hidden rounded-[0.3125rem] bg-[#181818] px-4 py-3">
          <Link href="/" aria-label={`${SITE_NAME} home`}>
            <Logo className="text-[2.375rem]" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-12 w-12 place-items-center rounded-xl transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MenuIcon open={open} />
          </button>
        </header>

        {/*
          The bar's own CTA. Always mounted: it has no discrete states left to
          mount on, it has a position, and it is at rest at both ends of it.

          IT RIDES OUT OF THE BAR AND BACK INTO IT. `--cta-out` is 0 when the
          button is parked and 1 when it is out, written by useCtaTravel on
          each scroll frame; 3.75rem is the whole travel, the 3.25rem box plus
          the 0.5rem gap it stands below the bar. So at 0 the button sits
          exactly inside the bar's own footprint — the bar is opaque #181818
          and 72 tall against that 60 — and there is nothing to fade: a slide
          that also fades reads as a fade, and behind an opaque bar the fade
          was never load-bearing anyway.

          NO TRANSITION, deliberately. The button's position IS the scroll
          position, so a duration here would be the button lagging behind the
          finger and then catching up — the exact "it plays its own animation"
          quality this replaced.

          THE TRANSFORM LIVES ON THIS WRAPPER, not on the <a>. VIOLET_CTA
          carries its own `transition-all duration-300` for the hover invert,
          and it would happily transition a translate that is supposed to be
          instantaneous. One element per movement, and neither can take the
          other's.

          `pointer-events-none` alone would leave it tabbable and readable to a
          screen reader while it is parked or covered by the drawer, so that
          state also carries aria-hidden and takes the link out of the tab
          order.
        */}
        <div
          ref={ctaRef}
          aria-hidden={!ctaOffered}
          style={{ translate: "0 calc((var(--cta-out, 0) - 1) * 3.75rem)" }}
          className={`absolute inset-x-0 top-full z-10 mt-2 ${
            ctaOffered ? "" : "pointer-events-none"
          }`}
        >
          <a
            href={BOOKING_URL}
            tabIndex={ctaOffered ? undefined : -1}
            className={`w-full ${CTA_BOX} ${VIOLET_CTA}`}
          >
            {PHONE_CTA}
          </a>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-full z-50 mt-2 flex flex-col gap-2.5 rounded-[0.3125rem] bg-[#181818] p-2.5 shadow-2xl"
          >
            {NAV.map((item) => {
              const active = item.label === ACTIVE_NAV;
              // No href means the page does not exist yet — half strength, no
              // hover, no pointer, not focusable. Same treatment as the
              // desktop bar; see the note on NAV in content.ts.
              if (!item.href) {
                return (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    className={`${CTA_BOX} cursor-default select-none text-white/40`}
                  >
                    {item.label}
                  </span>
                );
              }
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "true" : undefined}
                  // 52 tall / 17px semibold, selected row on a #222 plate — the
                  // same shape mushi-app's drawer has. The radius is NOT the
                  // app's 12: Figma reports 7 on the drawer's boxes, and fitting
                  // the artboard's corner curve agrees (an 18px arc at the
                  // screenshot's 2.61x scale). Unselected rows sit at 70% white,
                  // which is the grey the artboard shows beside the lit row.
                  className={`${CTA_BOX} transition ${
                    active
                      ? "bg-[#222222] text-white"
                      : "text-white/70 hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Same box and same fill as the bar's button above, so the CTA
                does not change shape depending on which one you are looking
                at. It inverts on hover per CLAUDE.md. */}
            <a href={BOOKING_URL} onClick={() => setOpen(false)} className={`${CTA_BOX} ${VIOLET_CTA}`}>
              {PHONE_CTA}
            </a>
          </nav>
        )}
      </div>
    </div>
  );
}
