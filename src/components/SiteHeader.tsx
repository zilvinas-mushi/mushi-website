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
    // Figma node 3803:1568: bg #181818, 100px tall, 15px radius, 30px from the
    // top, and 1386px wide inside a 1921px frame — so it is a genuinely
    // floating bar with ~14% clear on each side, not a near-full-width strip.
    // Scaled ~0.75 for a 1440 viewport: max-width 1040, 15px inner padding.
    <header className="sticky top-4 z-50 px-4 md:top-[22px]">
      <nav
        aria-label="Primary"
        className="mx-auto grid max-w-[1040px] grid-cols-[1fr_auto] items-center gap-4 rounded-[15px] bg-[#181818] p-[11px] pl-5 md:grid-cols-[1fr_auto_1fr]"
      >
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="justify-self-start"
        >
          <Logo className="text-[26px] md:text-[32px]" />
        </Link>

        <ul className="hidden items-center gap-10 justify-self-center md:flex lg:gap-14">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-[14px] font-semibold uppercase tracking-[0.02em] text-white/85 transition-colors hover:text-white lg:text-[15px]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 justify-self-end">
          {/* Same gradient, 15px radius and hover inversion as the hero
              primary CTA — see the hover rule in CLAUDE.md. */}
          <a
            href={BOOKING_URL}
            // Figma 3803:1569: 70x242 at 1921 -> 52x182 at 1440, 15px radius,
            // gradient at 139.98deg. Inverts on hover like every other button.
            className="inline-flex h-[52px] min-w-[182px] items-center justify-center rounded-[15px] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] px-6 text-[15px] font-semibold leading-none text-white transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]"
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
