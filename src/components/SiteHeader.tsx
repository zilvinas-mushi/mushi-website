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
        // Single flex row with justify-between so every gap is equal —
        // wordmark, the three links and the CTA all distribute together. The
        // previous 3-column grid centred the nav as a block, which made the
        // wordmark-to-nav and nav-to-CTA gaps differ from the gaps between the
        // links themselves.
        className="mx-auto flex max-w-[1040px] items-center justify-between rounded-[15px] bg-[#181818] p-[11px] pl-5"
      >
        <Link href="/" aria-label={`${SITE_NAME} home`} className="shrink-0">
          {/* Figma 3803:1570: the wordmark box is 150x45 at 1921 -> ~112x34
              at 1440, which Dutch801 hits at roughly 34px. */}
          <Logo className="text-[28px] md:text-[34px]" />
        </Link>

        {/* `contents` dissolves the list box so the three links become direct
            flex children of the bar and share its even distribution, while the
            markup stays a real list for assistive tech. */}
        <ul className="hidden md:contents">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                // Figma 3803:1571/1572/1573: Poppins SemiBold 28px at 1921
                // wide -> 21px at 1440. This was set at 14px, which made the
                // whole bar read as a small utility nav rather than the design.
                className="text-[17px] font-semibold uppercase tracking-[0.01em] text-white/85 transition-colors hover:text-white lg:text-[21px]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          {/* Same gradient, 15px radius and hover inversion as the hero
              primary CTA — see the hover rule in CLAUDE.md. */}
          <a
            href={BOOKING_URL}
            // Figma 3803:1569 (box) + 3803:1574 (label): 70x242 with 30px
            // Poppins SemiBold at 1921 wide -> 52x182 with 22px text at 1440.
            // The label was previously 15px, which left the button looking
            // empty — the type has to scale with the box, not stay small.
            className="inline-flex h-[52px] min-w-[182px] items-center justify-center rounded-[15px] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] px-6 text-[19px] font-semibold leading-none text-white transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] lg:text-[22px]"
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
