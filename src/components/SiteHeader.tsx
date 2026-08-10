import type { CSSProperties } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { MobileHeader } from "./MobileHeader";
import { NAV } from "@/lib/content";
import { BOOKING_URL, SITE_NAME } from "@/lib/site";

/**
 * Floating rounded header bar.
 *
 * ## Sizing
 *
 * Every measurement in this bar is quoted at the design's 1920-wide reference
 * viewport and driven from ONE custom property, `--u`, which equals 100px
 * there. Multiply by the design number / 100 and the whole bar scales as a
 * unit — no per-property breakpoint tables, no drift between the box and the
 * type inside it.
 *
 *   bar    1386 x 100   -> 13.86u x 1u
 *   logo    150 x 45    -> 1.5u x 0.45u
 *   nav      28px       -> 0.28u
 *   CTA     242 x 70    -> 2.42u x 0.70u, 30px label -> 0.30u
 *
 * `clamp(53.1px, 5.2083vw, 100px)`: 5.2083vw is exactly 100px at 1920 and the
 * bar tracks the viewport below that; the 100px ceiling stops it growing on
 * wider monitors, and the 53.1px floor is where the bar is 736px wide — the
 * space left inside the 16px page gutters at the md breakpoint (768px), which
 * is the narrowest viewport this header is shown at.
 *
 * Below md the bar hands over to MobileHeader, which carries mushi-app's
 * animated hamburger-and-drawer so both properties share one motion.
 */

/** 100px at 1920 wide; see the sizing note above. */
const SCALE = { "--u": "clamp(53.1px, 5.2083vw, 100px)" } as CSSProperties;

export function SiteHeader() {
  return (
    <>
      {/* Phone header with mushi-app's drawer motion; hidden from md up. */}
      <MobileHeader />

      <header
        className="sticky top-[22px] z-50 hidden px-4 md:block"
        style={SCALE}
      >
        <nav
          aria-label="Primary"
          // Single flex row with justify-between so every gap is equal —
          // wordmark, the three links and the CTA all distribute together. The
          // bar is a FIXED 13.86u x 1u box, not a max-width, because the design
          // specifies both dimensions; the free space inside it is what
          // justify-between spreads.
          //
          // Padding: 0.15u right and top/bottom, which is exactly the inset
          // that leaves the 0.70u-tall CTA centred in the 1u bar. The left side
          // gets 0.30u so the wordmark is not jammed against the corner radius.
          // The 15px radius scales with `--u` like everything else here.
          // Commit 8b07942 found this independently at the old fixed 1440
          // scale: a flat 15 rounded a third of the CTA's height and read as a
          // half-pill against the reference. 0.15u is 15 at 1920 and 11 at
          // 1440, which is the value that commit landed on.
          className="mx-auto flex items-center justify-between rounded-[calc(var(--u)*0.15)] bg-[#181818]"
          style={{
            width: "calc(var(--u) * 13.86)",
            // Belt and braces: the 53.1px floor on `--u` is set so the bar is
            // 736px at the 768px breakpoint, which is exactly the space inside
            // the gutters. This stops any future change to that floor from
            // pushing the bar out past them.
            maxWidth: "100%",
            height: "var(--u)",
            paddingLeft: "calc(var(--u) * 0.3)",
            paddingRight: "calc(var(--u) * 0.15)",
          }}
        >
          <Link href="/" aria-label={`${SITE_NAME} home`} className="flex shrink-0 items-center">
            {/*
              Figma 3803:1570: the wordmark measures 150 x 45. It is live text,
              so that box is not set on the element — it is produced by the font
              size, which is derived from Dutch801's own hmtx/glyf tables rather
              than guessed:

                "Mushi" is 2.646em of ink as drawn; the Logo's `tracking-tight`
                (-0.025em) closes four gaps, leaving 2.546em. 150 / 2.546 =
                58.9px -> 0.59u. The ink is then 0.737em = 43.4 tall inside the
                45 box, which is the line box, not the glyphs.

              Do not tighten the tracking further to stretch the ink to a full
              45 tall: M and u carry only 0.040em of sidebearing between them,
              so anything past about -0.030em collides them.
            */}
            <Logo className="text-[length:calc(var(--u)*0.59)]" />
          </Link>

          {/* `contents` dissolves the list box so the three links become direct
              flex children of the bar and share its even distribution, while the
              markup stays a real list for assistive tech. */}
          <ul className="contents">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  // Figma 3803:1571/1572/1573: Poppins SemiBold 28px = 0.28u.
                  className="text-[length:calc(var(--u)*0.28)] font-semibold uppercase leading-none tracking-[0.01em] text-white/85 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/*
            Figma 3803:1569 (box) + 3803:1574 (label): 242 x 70, radius 15,
            30px Poppins SemiBold.

            The fill is transcribed from the Figma gradient handles rather than
            eyeballed. Figma puts the gradient line on the 242x70 box starting
            50px right of and 40px above the top-left corner — local (50, -40) —
            and ending just above the bottom-right corner at (242, 60). CSS
            takes an angle and stops along its OWN gradient line, which is
            normalised to the box, so the handles are re-projected onto it:

              direction (192, 100)          -> 117.51deg
              handle   0% at local (50,-40) -> 10.47% along the CSS line
              handle  40%                   -> 45.54%
              handle 100% at local (242,60) -> 98.13%

            Both the angle and the percentages are relative, so this stays
            correct at every `--u` as long as the box keeps its 242:70 ratio.

            Hover inverts fill and text per the rule in CLAUDE.md — a gradient
            stays on both states so the fill cross-fades instead of snapping.
          */}
          <a
            href={BOOKING_URL}
            className="inline-flex shrink-0 items-center justify-center rounded-[calc(var(--u)*0.15)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] font-semibold leading-none text-white transition-all duration-150 hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_98.13%)] hover:text-[#6e54b5]"
            style={{
              width: "calc(var(--u) * 2.42)",
              height: "calc(var(--u) * 0.7)",
              fontSize: "calc(var(--u) * 0.3)",
            }}
          >
            Book a Call
          </a>
        </nav>
      </header>
    </>
  );
}
