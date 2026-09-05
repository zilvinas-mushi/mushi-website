import Link from "next/link";
import { Logo } from "./Logo";
import { MobileHeader } from "./MobileHeader";
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
 * Below md the bar hands over to MobileHeader, which carries mushi-app's
 * animated hamburger-and-drawer so both properties share one motion.
 */
/**
 * Header CTA override. The default is the home page's purple "Book a Call";
 * /templates swaps in a light "Login" pointing at the webapp, per its design.
 * Each variant still inverts its OWN two colours on hover (CLAUDE.md):
 * purple/white trade places, and light's white/black trade places.
 */
export type HeaderCta = {
  label: string;
  href: string;
  variant?: "purple" | "light";
};

const CTA_STYLES = {
  purple:
    "bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] text-white hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]",
  light:
    "bg-[linear-gradient(140deg,#fdfdfd_0%,#ececec_100%)] text-black hover:bg-[linear-gradient(140deg,#000_0%,#000_100%)] hover:text-white",
} as const;

export function SiteHeader({
  cta,
  active,
}: {
  cta?: HeaderCta;
  /**
   * href of the NAV item for the page being viewed (e.g. "/templates") —
   * that link renders at full brightness so the visitor can see where they
   * are. Home leaves it unset: its links are same-page anchors.
   */
  active?: string;
}) {
  const label = cta?.label ?? "Book a Call";
  const href = cta?.href ?? BOOKING_URL;
  const variant = cta?.variant ?? "purple";
  return (
    <>
      {/* Phone header with mushi-app's drawer motion; hidden from md up. */}
      <MobileHeader cta={cta} active={active} />

      {/* Figma node 3803:1568: a genuinely floating bar, ~14% clear each
          side, scaled 0.75 for 1440. Hidden below md. */}
      <header className="sticky top-[22px] z-50 hidden px-4 md:block">
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
          <Logo className="text-[30px] md:text-[38px]" />
        </Link>

        {/* `contents` dissolves the list box so the three links become direct
            flex children of the bar and share its even distribution, while the
            markup stays a real list for assistive tech. */}
        <ul className="hidden md:contents">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                aria-current={item.href === active ? "page" : undefined}
                // Figma 3803:1571/1572/1573: Poppins SemiBold 28px at 1921
                // wide -> 21px at 1440. This was set at 14px, which made the
                // whole bar read as a small utility nav rather than the design.
                // The current page's item sits at full white and its siblings
                // drop to 70% so the difference registers; with no active item
                // (home) everything keeps the ported 85%.
                className={`text-[17px] font-semibold uppercase tracking-[0.01em] transition-colors lg:text-[21px] ${
                  item.href === active
                    ? "text-white"
                    : active
                      ? "text-white/70 hover:text-white"
                      : "text-white/85 hover:text-white"
                }`}
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
            href={href}
            // Figma 3803:1569 (box) + 3803:1574 (label): 70x242 with 30px
            // Poppins SemiBold at 1921 wide -> 52x182 with 22px text at 1440.
            // The label was previously 15px, which left the button looking
            // empty — the type has to scale with the box, not stay small.
            // The 15px Figma radius scales with the box too: 15 * 0.75 ≈ 11.
            // Copied unscaled it rounded a third of the button's height and
            // read as a half-pill next to the reference.
            className={`inline-flex h-[52px] min-w-[182px] items-center justify-center rounded-[11px] px-6 text-[19px] font-semibold leading-none transition-all duration-150 lg:text-[22px] ${CTA_STYLES[variant]}`}
          >
            {label}
          </a>
        </div>
      </nav>
      </header>
    </>
  );
}
