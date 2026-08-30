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
  // 400ms, up from 200 (Žilvinas 2026-08-30). At 200 over 10px the bars did
  // not read as travelling — the icon just changed. The slower move is what
  // makes the merge legible as a merge.
  const bar =
    "block h-[0.1875rem] w-[1.875rem] rounded-full bg-white transition-transform duration-[400ms] ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden="true" className="flex flex-col items-end gap-[0.4375rem]">
      <span className={`${bar} ${open ? "translate-y-[0.625rem]" : ""}`} />
      <span className={bar} />
      <span className={`${bar} ${open ? "-translate-y-[0.625rem]" : ""}`} />
    </span>
  );
}

/**
 * When the bar's Schedule a Call button should be down.
 *
 * TWO EDGES, one at each end of the page's middle. It comes down once the
 * creatives "Yes" pill has gone under the header — the CTA is not a permanent
 * fixture of the bar, it arrives when the reader has been shown enough to be
 * worth asking — and it goes back up the moment the final card's "15 Minute
 * Fit-Check" pill comes on screen, because from there down the page is already
 * asking in a pill of its own and a second identical button pinned to the top
 * of the screen is asking twice (Žilvinas 2026-08-26, 2026-08-30). Both edges
 * are reversible: scroll back up and the button comes back down.
 *
 * WATCHES THE PILLS, NOT A SCROLL DISTANCE. A hard `scrollY > n` would be a
 * number that silently goes wrong every time anything above the creatives
 * section changes height — and the hero alone changes height with the
 * viewport, the copy and the font that happens to be loaded. The threshold is
 * the element the design names, so it moves with it.
 *
 * The "Yes" root is inset by the BAR'S OWN MEASURED HEIGHT so "past" means
 * "under the bar" rather than "past the top of the window": the bar floats over
 * the page, so a pill at y = 20 is already hidden behind it and reads as
 * passed. The fit-check root is NOT inset — see the note on that observer.
 *
 * Measured off the element, not read back from --header-h. That property is a
 * plain custom property, so getPropertyValue hands back the SPECIFIED token
 * stream rather than a resolved length — "92px" on a phone, but the literal
 * string "clamp(42.48px, 4.16664vw, 80px)" from md up, which parseFloat turns
 * into NaN. It happens not to matter today (the bar is hidden from md up, and
 * the phone value is a bare 92px) but it is a parse that works by luck, and
 * the element already knows its own height.
 *
 * IntersectionObserver rather than a scroll listener: it fires once per
 * crossing instead of on every frame of the scroll, and it delivers an initial
 * callback on observe, so a page loaded already scrolled past the pill (a
 * refresh mid-page, a link to #templates) gets the right state without a
 * separate measurement path.
 */
function useBarCtaDown(barRef: RefObject<HTMLDivElement | null>) {
  const [passedYes, setPassedYes] = useState(false);
  const [reachedFinal, setReachedFinal] = useState(false);

  useEffect(() => {
    const yesPill = document.getElementById(CREATIVES_CTA_ID);
    const finalPill = document.getElementById(FINAL_CTA_ID);
    const observers: IntersectionObserver[] = [];

    // 0 from md up, where the bar is display:none — the fallback covers that,
    // and nothing is watching there anyway.
    const headerH = Math.round(barRef.current?.getBoundingClientRect().height ?? 0) || 92;

    if (yesPill) {
      const io = new IntersectionObserver(
        ([entry]) => {
          // Left the root by the TOP, not merely left it — scrolling the pill
          // off the bottom of the screen is not passing it.
          //
          // Compared against headerH, not 0. `boundingClientRect` is in raw
          // viewport coordinates while the root has been inset from the top by
          // the bar's height, and mixing the two leaves a band the width of
          // the bar where the pill has left the root but its rect has not yet
          // crossed zero — and no further callback is coming to correct it,
          // because the observer only fires on crossings of the INSET root.
          // The button simply never appeared.
          setPassedYes(!entry.isIntersecting && entry.boundingClientRect.bottom <= headerH);
        },
        { rootMargin: `-${headerH}px 0px 0px 0px`, threshold: 0 },
      );
      io.observe(yesPill);
      observers.push(io);
    }

    if (finalPill) {
      // The PLAIN viewport, not inset by the bar. The two observers measure
      // deliberately different things: the one above asks whether an element
      // has gone under the bar, this one asks whether an element has arrived
      // at all — and "starts showing up" is the pill crossing the BOTTOM edge
      // of the screen, which the header is nowhere near.
      const io = new IntersectionObserver(
        ([entry]) => {
          // `bottom <= 0` holds the button up for everything BELOW the pill
          // too. Once the fit-check has scrolled off the top the reader is in
          // the footer, which asks a third time on its own; letting the button
          // drop back down there is the CTA reappearing after the page has
          // finished, which is not what hiding it meant.
          setReachedFinal(entry.isIntersecting || entry.boundingClientRect.bottom <= 0);
        },
        { threshold: 0 },
      );
      io.observe(finalPill);
      observers.push(io);
    }

    return () => observers.forEach((io) => io.disconnect());
  }, [barRef]);

  return passedYes && !reachedFinal;
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
  const ctaDown = useBarCtaDown(shellRef);

  // The drawer carries its own copy of the CTA, so the bar's would be a second
  // identical button 8px above it.
  const showBarCta = ctaDown && !open;

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
          The bar's own CTA. Always mounted so it can travel in BOTH directions
          — mounting it on `showBarCta` would pop it in and then unmount it
          mid-transition on the way back up.

          IT SLIDES OUT OF THE BAR AND BACK INTO IT (Žilvinas 2026-08-30). It
          used to cross-fade with a 6px nudge, which at 300ms over 6px is a
          fade with a rumour of movement in it — mid-scroll the button simply
          materialised. The hidden position is now the full 60 it stands below
          the bar (52 tall + the 8 gap), so the button is genuinely parked
          behind the bar and rides out from under its bottom edge. No opacity
          in it at all: a slide that also fades reads as a fade, and the bar it
          hides behind is opaque, so the fade was never load-bearing.

          THE TRANSFORM LIVES ON A WRAPPER, not on the <a>. VIOLET_CTA carries
          its own `transition-all duration-300` for the hover invert, and a
          second duration on the same element is a fight decided by stylesheet
          order rather than by class order — the slide would silently inherit
          the hover's timing. One element per animation, and neither can take
          the other's.

          `pointer-events-none` alone would leave it tabbable and readable to a
          screen reader while it is parked, so the hidden state also carries
          aria-hidden and takes the link out of the tab order.
        */}
        <div
          aria-hidden={!showBarCta}
          className={`absolute inset-x-0 top-full z-10 mt-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            showBarCta ? "translate-y-0" : "pointer-events-none -translate-y-[3.75rem]"
          }`}
        >
          <a
            href={BOOKING_URL}
            tabIndex={showBarCta ? undefined : -1}
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
