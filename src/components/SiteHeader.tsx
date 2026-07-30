import Link from "next/link";
import { Logo } from "./Logo";
import { NAV } from "@/lib/content";
import { BOOKING_URL, SITE_NAME } from "@/lib/site";

/**
 * Floating rounded header bar.
 *
 * Recipe ported from mushi-app's app/(app)/layout.tsx: sticky with a top and
 * side margin so the page surface and the bar's rounded corners stay visible,
 * and a 3-column grid so the nav is truly centred regardless of how wide the
 * logo and CTA are.
 *
 * The mobile menu is a <details> rather than React state — this is a static
 * export, and a disclosure that works before (or entirely without) hydration
 * is more robust than one that needs JS.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-4 z-50 mx-4 rounded-2xl bg-[#181818] px-5 py-[9px] md:top-[30px] md:mx-6 md:px-6">
      <nav
        aria-label="Primary"
        className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]"
      >
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="justify-self-start"
        >
          <Logo className="text-[28px] md:text-[34px]" />
        </Link>

        <ul className="hidden items-center gap-9 justify-self-center md:flex">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-[15px] font-semibold uppercase tracking-[0.02em] text-white/85 transition-colors hover:text-white lg:text-[17px]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 justify-self-end">
          {/* Same gradient and 15px radius as the hero primary CTA. */}
          <a
            href={BOOKING_URL}
            className="inline-flex h-[42px] items-center rounded-[15px] bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] px-5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_18px_-8px_rgba(110,84,181,0.9)] transition-all hover:brightness-110"
          >
            Book a Call
          </a>

          <details className="relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[12px] border border-white/15 [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ☰
              </span>
            </summary>
            <ul className="absolute right-0 mt-3 w-56 rounded-[15px] border border-white/10 bg-[#222222] p-2 shadow-xl">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="block rounded-[12px] px-3 py-2.5 text-[15px] font-semibold uppercase tracking-[0.02em] text-white/85 hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
