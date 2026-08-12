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
          // THREE COLUMNS: logo | links | CTA, with the outer two as equal
          // 1fr. That is what puts the link group on the bar's true centre.
          //
          // It was one flex row with justify-between, which spreads the free
          // space equally across the four gaps — NOT the same thing. That only
          // centres the middle group if the logo and the CTA are the same
          // width, and they are not (1.5u vs 2.42u), and the bar's padding is
          // deliberately asymmetric too (0.3u left, 0.15u right). Measured in
          // the browser at 1512 wide, the group's centre sat 29.6px LEFT of the
          // bar's. Equal gaps, off-centre group — which is what read as "not
          // centred".
          //
          // Grid rather than an absolutely-positioned centred list: the links
          // stay in normal flow, so they cannot ride over the logo or the CTA
          // if the copy grows or the bar gets narrow. The two 1fr columns have
          // ~250px to fill ~190px of content at every width down to the md
          // floor, so they stay equal and the middle column stays centred.
          //
          // The bar is a FIXED 13.86u x 1u box, not a max-width, because the
          // design specifies both dimensions.
          //
          // THE INSETS ARE MARGINS ON THE LOGO AND CTA, NOT PADDING ON THE BAR,
          // and that is load-bearing for the centring above. A grid centres its
          // middle column in the CONTENT box; padding of 0.3u left and 0.15u
          // right moves that box's centre (0.3 - 0.15) / 2 = 0.075u right of
          // the bar's own centre, which measured as a 5.9px residual error
          // after the switch to grid. Hanging the same insets off the outer two
          // items instead makes the content box the border box, so the middle
          // column centres on the bar itself. Do not move them back.
          //
          // The values are unchanged: 0.15u on the right, which is exactly the
          // inset that leaves the 0.70u-tall CTA centred in the 1u bar, and
          // 0.30u on the left so the wordmark is not jammed into the radius.
          // The 15px radius scales with `--u` like everything else here.
          // Commit 8b07942 found this independently at the old fixed 1440
          // scale: a flat 15 rounded a third of the CTA's height and read as a
          // half-pill against the reference. 0.15u is 15 at 1920 and 11 at
          // 1440, which is the value that commit landed on.
          className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center rounded-[calc(var(--u)*0.15)] bg-[#181818]"
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
          <Link href="/" aria-label={`${SITE_NAME} home`} className="ml-[calc(var(--u)*0.3)] flex shrink-0 items-center justify-self-start">
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
              <li key={item.label} className="flex">
                <a
                  href={item.href}
                  // Figma 3803:1571/1572/1573: Poppins SemiBold 28px = 0.28u.
                  className="cap-centered text-[length:calc(var(--u)*0.28)] font-semibold uppercase leading-none tracking-[0.01em] text-white/85 transition-colors hover:text-white"
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
            className="mr-[calc(var(--u)*0.15)] inline-flex shrink-0 items-center justify-center justify-self-end rounded-[calc(var(--u)*0.15)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] font-semibold leading-none text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5]"
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
