import Link from "next/link";
import { Img } from "./Img";
import { NAV } from "@/lib/content";
import { BOOKING_URL, SITE_NAME } from "@/lib/site";

/**
 * Sticky site header.
 *
 * The mobile menu is a <details> element rather than React state: this is a
 * static export, and a disclosure that works before (or entirely without)
 * hydration is more robust than one that needs JS to open.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-4"
      >
        {/* The Mushi wordmark is a serif logotype, not Poppins — rendering it
            as text got the typeface wrong, so the real asset is used. */}
        <Link href="/" className="shrink-0" aria-label={`${SITE_NAME} — home`}>
          <Img
            src="logo-without-bg-white102.webp"
            alt={SITE_NAME}
            width={92}
            priority
            className="h-auto w-[92px]"
          />
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                // Figma: Poppins SemiBold 28px at 1921 wide -> ~21px at 1440.
                className="text-[15px] font-semibold uppercase tracking-[0.02em] text-white/80 transition-colors hover:text-white lg:text-[17px]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Matches the hero's primary CTA, one step smaller. */}
          <a
            href={BOOKING_URL}
            // Same gradient and 15px radius as the hero primary, one size down.
            className="inline-flex h-[42px] items-center rounded-[15px] bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] px-5 text-[15px] font-semibold leading-none text-white shadow-[0_6px_18px_-8px_rgba(110,84,181,0.9)] transition-all hover:brightness-110"
          >
            Book a Call
          </a>

          <details className="relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[var(--radius-chip)] border border-white/15 [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ☰
              </span>
            </summary>
            <ul className="absolute right-0 mt-2 w-52 rounded-[var(--radius-card)] border border-white/10 bg-surface p-2 shadow-xl">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="block rounded-[var(--radius-chip)] px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
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
