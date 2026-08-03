"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/content";
import { BOOKING_URL, SITE_NAME } from "@/lib/site";

/**
 * Phone header, ported from mushi-app's components/app/mobile-header so both
 * properties share one motion: the hamburger's outer bars fade/slide into the
 * middle one while the drawer is open, and the drawer floats over the page
 * below the bar rather than pushing content down.
 *
 * Marketing-site adaptations: the avatar becomes the violet call button from
 * the design (this site has no accounts), the drawer lists the marketing nav,
 * and — since these are same-page anchor links, where the pathname never
 * changes — the drawer closes on link tap instead of on route change.
 */
function MenuIcon({ open }: { open: boolean }) {
  const bar =
    "block h-[2.5px] w-6 rounded-full bg-white transition-all duration-200";
  return (
    <span aria-hidden="true" className="flex flex-col items-center gap-[5px]">
      <span className={`${bar} ${open ? "translate-y-[7.5px] opacity-0" : ""}`} />
      <span className={bar} />
      <span className={`${bar} ${open ? "-translate-y-[7.5px] opacity-0" : ""}`} />
    </span>
  );
}

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
        <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl bg-[#181818] px-3 py-2.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-xl transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MenuIcon open={open} />
          </button>

          <Link
            href="/"
            aria-label={`${SITE_NAME} home`}
            className="justify-self-center"
          >
            <Logo className="text-[34px]" />
          </Link>

          {/* Violet call button where the webapp keeps its avatar. */}
          <a
            href={BOOKING_URL}
            aria-label="Book a call"
            className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] transition hover:brightness-110"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.9"
              className="size-[22px] stroke-white"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.6 4h2.1c.5 0 .9.3 1 .8l.7 2.7c.1.4 0 .9-.4 1.1l-1.3 1a12.3 12.3 0 0 0 5.7 5.7l1-1.3c.2-.4.7-.5 1.1-.4l2.7.7c.5.1.8.5.8 1v2.1c0 .6-.5 1.1-1.1 1.1A16.4 16.4 0 0 1 5.5 5.1C5.5 4.5 6 4 6.6 4z"
              />
              <path strokeLinecap="round" d="M14.5 5.5a4.6 4.6 0 0 1 4 4M15 2.6a7.6 7.6 0 0 1 6.4 6.4" />
            </svg>
          </a>
        </header>

        {open && (
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-full z-50 mt-2 flex flex-col gap-2 rounded-2xl bg-[#181818] p-2 shadow-2xl"
          >
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex h-[52px] items-center justify-center gap-2.5 rounded-[12px] text-[17px] font-semibold uppercase text-white transition hover:bg-[#222222]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
