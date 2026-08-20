"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/content";
import {
  APP_BUY_URL,
  APP_LOGIN_URL,
  BOOKING_URL,
  SITE_NAME,
} from "@/lib/site";

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

function MenuIcon({ open }: { open: boolean }) {
  const bar =
    "block h-[0.1875rem] w-[1.875rem] rounded-full bg-white transition-all duration-200";
  return (
    <span aria-hidden="true" className="flex flex-col items-start gap-[0.4375rem]">
      <span className={`${bar} ${open ? "translate-y-[0.625rem] opacity-0" : ""}`} />
      <span className={bar} />
      <span className={`${bar} ${open ? "-translate-y-[0.625rem] opacity-0" : ""}`} />
    </span>
  );
}

/**
 * Phone header, ported from mushi-app's components/app/mobile-header so both
 * properties share one motion: the hamburger's outer bars fade/slide into the
 * middle one while the drawer is open, and the drawer floats over the page
 * below the bar rather than pushing content down.
 *
 * Marketing-site adaptations: the avatar becomes the violet call button from
 * the design (this site has no accounts), the drawer lists the marketing nav
 * under it and closes the three CTAs the mobile artboard puts there, and —
 * since these are same-page anchor links, where the pathname never changes —
 * the drawer closes on link tap instead of on route change.
 */
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={shellRef}
      className="sticky top-0 z-50 px-4 pb-2 pt-3 md:hidden"
    >
      {/* relative: the drawer is absolutely positioned against this box so it
          overlays the page instead of taking up layout space. */}
      <div className="relative">
        {/* Radius 5, straight off the Figma frame (345 x 58, corner 5) — not
            the 16 this was ported with. The drawer below carries the same 5:
            fitting the artboard's corner arc gives ~12px at that screenshot's
            2.61x scale for both boxes. */}
        <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-[0.3125rem] bg-[#181818] px-4 py-3">
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

          <Link
            href="/"
            aria-label={`${SITE_NAME} home`}
            className="justify-self-center"
          >
            <Logo className="text-[2.375rem]" />
          </Link>

          {/* Violet call button where the webapp keeps its avatar. */}
          <a
            href={BOOKING_URL}
            aria-label="Book a call"
            className="grid h-12 w-12 place-items-center rounded-[0.4375rem] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(140deg,#fff_8%,#fff_42%,#fff_93%)] hover:text-[#6e54b5] active:bg-[linear-gradient(140deg,#fff_8%,#fff_42%,#fff_93%)] active:text-[#6e54b5]"
          >
            <svg viewBox="0 0 23 23" fill="none" strokeWidth="2" className="size-[1.5rem] stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.12 5.00006C14.0967 5.19063 14.9944 5.66832 15.698 6.372C16.4017 7.07567 16.8794 7.97333 17.07 8.95006M13.12 1.00006C15.1492 1.2255 17.0416 2.13424 18.4862 3.57707C19.9309 5.0199 20.842 6.91107 21.07 8.94006M9.29695 12.8631C8.09537 11.6616 7.14659 10.3029 6.45059 8.85329C6.39072 8.7286 6.36079 8.66626 6.33779 8.58736C6.25607 8.30701 6.31477 7.96275 6.48478 7.72532C6.53262 7.65851 6.58978 7.60135 6.70409 7.48704C7.0537 7.13744 7.2285 6.96263 7.34278 6.78685C7.77378 6.12396 7.77378 5.26938 7.34279 4.60649C7.2285 4.43071 7.0537 4.25591 6.70409 3.90631L6.50922 3.71144C5.97778 3.17999 5.71206 2.91427 5.42668 2.76993C4.85912 2.48286 4.18885 2.48286 3.62129 2.76993C3.33591 2.91427 3.07019 3.17999 2.53874 3.71144L2.38111 3.86907C1.85149 4.39869 1.58668 4.66351 1.38443 5.02354C1.16001 5.42304 0.998645 6.04353 1.00001 6.50176C1.00124 6.9147 1.08134 7.19693 1.24155 7.76137C2.10252 10.7948 3.72699 13.6571 6.11497 16.0451C8.50295 18.4331 11.3653 20.0576 14.3987 20.9185C14.9632 21.0787 15.2454 21.1588 15.6583 21.1601C16.1165 21.1614 16.737 21.0001 17.1365 20.7757C17.4966 20.5734 17.7614 20.3086 18.291 19.779L18.4486 19.6213C18.9801 19.0899 19.2458 18.8242 19.3902 18.5388C19.6772 17.9712 19.6772 17.301 19.3902 16.7334C19.2458 16.448 18.9801 16.1823 18.4486 15.6509L18.2538 15.456C17.9042 15.1064 17.7294 14.9316 17.5536 14.8173C16.8907 14.3863 16.0361 14.3863 15.3732 14.8173C15.1975 14.9316 15.0226 15.1064 14.673 15.456C14.5587 15.5703 14.5016 15.6275 14.4348 15.6753C14.1973 15.8453 13.8531 15.904 13.5727 15.8223C13.4938 15.7993 13.4315 15.7694 13.3068 15.7095C11.8572 15.0135 10.4985 14.0647 9.29695 12.8631Z" />
            </svg>
          </a>
        </header>

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
                    className="flex h-[3.25rem] cursor-default select-none items-center justify-center rounded-[0.4375rem] text-[1.0625rem] font-semibold uppercase text-white/40"
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
                  className={`flex h-[3.25rem] items-center justify-center rounded-[0.4375rem] text-[1.0625rem] font-semibold uppercase transition ${
                    active
                      ? "bg-[#222222] text-white"
                      : "text-white/70 hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/*
              The artboard's CTA block: a half-and-half Buy now / Login row,
              then the agency call across the full width. Same 52 / 12 box as
              the nav rows above, so the whole drawer is one rhythm.

              Every one of them inverts on hover per CLAUDE.md — foreground and
              background trade places, with a gradient kept on both states of
              the violet button so the fill cross-fades rather than snapping.
            */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={APP_BUY_URL}
                onClick={() => setOpen(false)}
                // The violet is the artboard's own fill, not the header CTA's: same three
                // Figma stops (#A08ADE / #7C54B5 / #6E54B5) but this button is 157 x 50,
                // so the handle projects onto a different line. Fitting the rendered
                // button pixel-by-pixel puts it at 137deg with the stops at 7 / 33 / 71
                // percent — the last third of the box sits flat at #6E54B5, which is what
                // makes the light pool in the top-left corner rather than crossing the
                // whole face. The header's 117.51deg numbers are for its 242 x 70 box.
                className="flex h-[3.25rem] items-center justify-center rounded-[0.4375rem] bg-[linear-gradient(137deg,#a08ade_7%,#7c54b5_33%,#6e54b5_71%)] text-[1.0625rem] font-semibold uppercase text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(137deg,#fff_7%,#fff_33%,#fff_71%)] hover:text-[#6e54b5]"
              >
                Buy now
              </a>
              <a
                href={APP_LOGIN_URL}
                onClick={() => setOpen(false)}
                className="flex h-[3.25rem] items-center justify-center rounded-[0.4375rem] border border-white bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] text-[1.0625rem] font-semibold uppercase text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-black"
              >
                Login
              </a>
            </div>

            <a
              href={BOOKING_URL}
              onClick={() => setOpen(false)}
              // corner-lit-ring, not a border: the artboard paints this stroke
              // white only at the top-left and bottom-right corners and lets it
              // fade out across the middle of every edge. See globals.css.
              className="corner-lit-ring flex h-[3.25rem] items-center justify-center rounded-[0.4375rem] bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] text-[1.0625rem] font-semibold uppercase text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-black"
            >
              Book an agency call
            </a>
          </nav>
        )}
      </div>
    </div>
  );
}
