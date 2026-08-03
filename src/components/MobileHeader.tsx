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
    "block h-[3px] w-[30px] rounded-full bg-white transition-all duration-200";
  return (
    <span aria-hidden="true" className="flex flex-col items-start gap-[7px]">
      <span className={`${bar} ${open ? "translate-y-[10px] opacity-0" : ""}`} />
      <span className={bar} />
      <span className={`${bar} ${open ? "-translate-y-[10px] opacity-0" : ""}`} />
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
        <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-2xl bg-[#181818] px-4 py-3">
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
            <Logo className="text-[38px]" />
          </Link>

          {/* Violet call button where the webapp keeps its avatar. */}
          <a
            href={BOOKING_URL}
            aria-label="Book a call"
            className="grid h-12 w-12 place-items-center rounded-[12px] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] transition hover:brightness-110"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/creatives/icons/phone.svg"
              alt=""
              width={23}
              height={23}
              loading="eager"
              decoding="async"
              className="size-[24px]"
              aria-hidden="true"
            />
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
