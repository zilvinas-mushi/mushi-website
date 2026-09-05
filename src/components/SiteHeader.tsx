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

/**
 * 100px at 1920 wide; see the sizing note above.
 *
 * The clamp itself lives on :root as --header-u, because the page needs it too:
 * the hero field is pulled up by the header's flow height, and duplicating the
 * number there is exactly how it went stale and left a black band at the top.
 */
const SCALE = { "--u": "var(--header-u)" } as CSSProperties;

/**
 * Header CTA override. The default is the home page's violet "Book a Call";
 * /templates swaps in a light "Login" pointing at the webapp, per its design.
 * Each variant still inverts its OWN two colours on hover (CLAUDE.md).
 */
export type HeaderCta = {
  label: string;
  href: string;
  variant?: "purple" | "light";
};

const CTA_FILL = {
  purple:
    "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5]",
  light:
    "bg-[linear-gradient(117.51deg,#fdfdfd_10.47%,#ececec_98.13%)] text-black hover:bg-[linear-gradient(117.51deg,#000_10.47%,#000_98.13%)] hover:text-white",
} as const;

export function SiteHeader({
  cta,
  active,
}: {
  cta?: HeaderCta;
  /**
   * href of the NAV item for the page being viewed (e.g. "/templates") —
   * that link renders at full white and its siblings drop to 70% so the
   * visitor can see where they are. Unset on home, whose links keep 85%.
   */
  active?: string;
}) {
  return (
    <>
      {/* Phone header with mushi-app's drawer motion; hidden from md up. */}
      <MobileHeader />

      <header
        className="sticky top-[1.375rem] z-50 hidden px-4 md:block"
        style={SCALE}
      >
        <nav
          aria-label="Primary"
          // EQUAL OUTER GAPS, which is what the reference actually shows and
          // what was asked for (Noah 2026-08-19): the space between the
          // wordmark and AGENCY reads the same as the space between TEMPLATES
          // and Book a Call.
          //
          // That is NOT the same thing as centring the link group, and the two
          // cannot both be true here — a centred group only leaves equal outer
          // gaps when the logo and the CTA are the same width, and they are
          // 1.5u against 2.42u. The grid below used to centre the group and
          // let the outer gaps fall where they may; `justify-between` on three
          // children does the opposite, splitting the free space into exactly
          // two equal parts. The middle group therefore sits a little right of
          // the bar's centre, by half the difference in the outer items'
          // widths, exactly as it does in Figma.
          //
          // The insets stay margins on the logo and the CTA rather than
          // padding on the bar (see below); with justify-between they are what
          // the equal gaps are measured from.
          //
          // The links stay in normal flow rather than being absolutely centred,
          // so they cannot ride over the logo or the CTA if the copy grows or
          // the bar gets narrow.
          //
          // The bar is a FIXED 13.86u x 1u box, not a max-width, because the
          // design specifies both dimensions.
          //
          // THE INSETS ARE MARGINS ON THE LOGO AND CTA, NOT PADDING ON THE BAR.
          // With justify-between the two equal gaps are measured from the
          // items themselves, so hanging the insets off the items is what makes
          // "the gap either side of the link group" a real, measurable thing
          // rather than a number that also has the bar's padding folded into
          // one end of it. Do not move them back onto the bar.
          //
          // The values are unchanged: 0.15u on the right, which is exactly the
          // inset that leaves the 0.70u-tall CTA centred in the 1u bar, and
          // 0.30u on the left so the wordmark is not jammed into the radius.
          // The 15px radius scales with `--u` like everything else here.
          // Commit 8b07942 found this independently at the old fixed 1440
          // scale: a flat 15 rounded a third of the CTA's height and read as a
          // half-pill against the reference. 0.15u is 15 at 1920 and 11 at
          // 1440, which is the value that commit landed on.
          className="mx-auto flex items-center justify-between rounded-[calc(var(--u)*0.15)] bg-[#181818]"
          style={{
            /*
              Back to the design's own 13.86u, so the ENTIRE bar — width,
              height and type — sits at one scale. With u at 80 (globals.css)
              that is 1109 wide at 1920, i.e. the same 80% as everything else.

              It was briefly pinned to the original 1386 while only the height
              came down, to keep the bar aligned with the 1380 content column.
              That alignment is not worth a bar that reads too wide for its
              height; one uniform scale is both simpler and what was asked for.

              maxWidth below still guards the gutters at the md breakpoint.
            */
            width: "calc(var(--u) * 13.86)",
            // Belt and braces: the 53.1px floor on `--u` is set so the bar is
            // 736px at the 768px breakpoint, which is exactly the space inside
            // the gutters. This stops any future change to that floor from
            // pushing the bar out past them.
            maxWidth: "100%",
            height: "var(--u)",
          }}
        >
          <Link href="/" aria-label={`${SITE_NAME} home`} className="ml-[calc(var(--u)*0.3)] flex shrink-0 items-center">
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

          {/* A real box now, not `contents`. It used to dissolve itself so the
              three links became direct flex children and joined the bar's
              justify-between distribution — which is exactly what pulled the
              group off-centre. As the grid's middle column it is centred as a
              unit instead.

              1.19u is the gap justify-between was producing, kept deliberately
              so this change only MOVES the group and does not respace it. It is
              a constant in u, not a coincidence of one viewport: every part of
              this bar (width, padding, logo, type, CTA) is expressed in u, so
              the leftover space was always the same fraction of it. */}
          <ul className="flex items-center gap-[calc(var(--u)*1.19)]">
            {NAV.map((item) => (
              // `flex` is load-bearing — it fixes the labels sitting ~1px high.
              //
              // As a plain block, the <li> lays out a LINE box, and a line box
              // is sized by the strut (the li's own inherited 16px/1.5 font)
              // unioned with the inline <a> inside it. The strut contributes
              // 6.4px of descender space below the baseline; the 28px UPPERCASE
              // label has no descender ink to put there. So the box grew
              // downward while the ink did not, `items-center` centred that
              // taller box, and the letters were left above true centre.
              //
              // Making the <li> a flex container blockifies the <a> and stops
              // any strut being generated, so the box is exactly the label's
              // own line box. Poppins then centres itself: its ascent minus
              // descent (1.05 - 0.35em) equals its cap height (0.7em), so with
              // `leading-none` the cap-to-baseline ink lands dead centre.
              //
              // Do NOT "fix" this with a top/bottom nudge — the error scales
              // with --u, so a fixed px offset is only right at one width.
              // Figma 3803:1571/1572/1573: Poppins SemiBold 28px = 0.28u.
              //
              // An entry with no href is a page that does not exist yet. It
              // renders as TEXT, not as a link: half strength, no hover, no
              // pointer, and out of the tab order — so it reads as "not yet"
              // rather than as a link that silently does nothing. `aria-
              // disabled` says the same thing to a screen reader.
              <li key={item.label} className="flex">
                {item.href ? (
                  <a
                    href={item.href}
                    aria-current={item.href === active ? "page" : undefined}
                    className={`cap-centered text-[length:calc(var(--u)*0.28)] font-semibold uppercase leading-none tracking-[0.01em] transition-colors ${
                      item.href === active
                        ? "text-white"
                        : active
                          ? "text-white/70 hover:text-white"
                          : "text-white/85 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="cap-centered cursor-default select-none text-[length:calc(var(--u)*0.28)] font-semibold uppercase leading-none tracking-[0.01em] text-white/40"
                  >
                    {item.label}
                  </span>
                )}
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
            href={cta?.href ?? BOOKING_URL}
            className={`mr-[calc(var(--u)*0.15)] inline-flex shrink-0 items-center justify-center rounded-[calc(var(--u)*0.15)] font-semibold leading-none transition-all duration-300 ease-out ${CTA_FILL[cta?.variant ?? "purple"]}`}
            style={{
              width: "calc(var(--u) * 2.42)",
              height: "calc(var(--u) * 0.7)",
              fontSize: "calc(var(--u) * 0.3)",
            }}
          >
            {cta?.label ?? "Book a Call"}
          </a>
        </nav>
      </header>
    </>
  );
}
