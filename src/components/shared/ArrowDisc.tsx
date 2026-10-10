import { bookingTarget } from "@/lib/site";

/**
 * CTA pill. Label is uppercased with tracking to match the design — the
 * buttons read as small-caps chips, not sentence-case links.
 */
/**
 * The disc at the right-hand end of a primary CTA, and the two things it does
 * on hover.
 *
 * ## The inversion
 *
 * These CTAs do NOT invert the way every other button on the site does — they
 * do not go white. The purple and the disc's grey trade places instead: on
 * hover the whole button takes the disc's #222222 and the disc takes the
 * button's violet, so the same two colours are still on screen in the same
 * amounts, just swapped (Noah 2026-08-19; recorded in CLAUDE.md as the second
 * exception to the inversion rule). The label and the arrow stay white
 * throughout, which is what keeps both readable at both ends of the swap.
 *
 * BOTH fills are three-stop gradients at the same three positions, even the
 * flat greys. A two-stop fill against a three-stop one cannot interpolate and
 * the browser snaps at the halfway point no matter what the transition says —
 * the same trap the rest of this file's hover states document.
 *
 * ## The arrow
 *
 * On hover the arrow leaves along its own diagonal and a second one arrives
 * from behind it. Two copies of the same glyph in one grid cell: the first
 * starts at rest and exits up-and-right, the second starts down-and-left and
 * lands at rest. 180% of the box carries each one clear of a disc that is
 * barely wider than the glyph, and `overflow-hidden` on the disc is what makes
 * them appear and disappear at its edge rather than beyond it.
 *
 * The incoming one is held back 75ms so the two read as a relay rather than as
 * one arrow sliding across.
 *
 * THE CALLER'S viewBox MUST CLEAR THE STROKE BY MORE THAN THE STROKE'S OWN
 * OVERHANG. An svg clips to its viewport, and at the arrowhead the round join
 * is a circle whose top and right sit exactly on that overhang — a curve
 * tangent to the clip edge, so it runs almost parallel to it and sheds a wide
 * flat where a perpendicular edge would lose a sliver. Half a unit of air each
 * side is what keeps the tip round; the rendered size has to carry the same
 * factor or the arrow just draws smaller.
 */
/**
 * `tone` is the disc's two fills, rest and hover. The default is the pair the
 * two home pills wear — #222222, trading with the pill's violet. /case-studies
 * draws the same pill with a BLACK disc ("black"), and a white pill whose
 * black disc inverts to white with a black arrow ("invert"). Every pair keeps
 * the three stop positions, so each still cross-fades.
 */
const DISC_TONE = {
  grey: "bg-[linear-gradient(117.51deg,#222222_10.47%,#222222_45.54%,#222222_98.13%)] text-white group-hover:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] group-active:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)]",
  black:
    "bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] text-white group-hover:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] group-active:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)]",
  invert:
    "bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] text-white group-hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] group-hover:text-black group-active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] group-active:text-black",
  // The case study's mail disc: #363636 with a white arrow, inverting to white
  // with a #363636 arrow.
  mail: "bg-[linear-gradient(117.51deg,#363636_10.47%,#363636_45.54%,#363636_98.13%)] text-white group-hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] group-hover:text-[#363636] group-active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] group-active:text-[#363636]",
} as const;

export function ArrowDisc({
  disc,
  arrow,
  viewBox,
  strokeWidth,
  tone = "grey",
}: {
  disc: string;
  arrow: string;
  viewBox: string;
  strokeWidth: number;
  tone?: keyof typeof DISC_TONE;
}) {
  const glyph = (
    <path d="M0.999888 15.9999L15.9998 1M15.9998 14.1708L15.9998 1L2.82898 1" />
  );
  const shared = `${arrow} col-start-1 row-start-1 stroke-current transition-transform duration-300 ease-out`;
  return (
    <span
      className={`${disc} relative grid shrink-0 place-items-center overflow-hidden rounded-full transition-all duration-300 ease-out ${DISC_TONE[tone]}`}
    >
      <svg
        viewBox={viewBox}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${shared} group-hover:-translate-y-[180%] group-hover:translate-x-[180%] group-active:-translate-y-[180%] group-active:translate-x-[180%]`}
      >
        {glyph}
      </svg>
      <svg
        viewBox={viewBox}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${shared} -translate-x-[180%] translate-y-[180%] delay-75 group-hover:translate-x-0 group-hover:translate-y-0 group-active:translate-x-0 group-active:translate-y-0`}
      >
        {glyph}
      </svg>
    </span>
  );
}

export function Pill({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "dark";
}) {
  // Measured from Figma nodes 3803:1672/1673 (primary) and 3803:1583/1584:
  // 67px tall, 15px radius, Poppins SemiBold 24px on desktop.
  //
  // The radius scales with --hero-u like the height does. Left at a flat 15 it
  // was 22% of the button's height at 1920 and 30% at 1440 — reading as a
  // half-pill as the button shrank. Commit 8b07942 found the same thing on the
  // header CTA independently. The height was
  // 56 here — the old 0.75 scale-down for a 1440 viewport — and is now the
  // design's 67 at lg. Below lg it still steps down; that is the phone pass.
  // Phone radius is 10, not the desktop 15 (Žilvinas 2026-08-25): at 44 tall
  // the same 15 read as a half-pill on a button a third the desktop width.
  //
  // 10 EITHER SIDE OF THE LABEL on phones, same day — so the button is the
  // words plus 20 and nothing more. It was 20 a side, which on a 375 screen
  // spent a tenth of the width on air. Desktop keeps its measured
  // 0.32u padding.
  //
  // FLAT 44 / 14 ON THE PHONE (Žilvinas 2026-09-25, "why did it become so
  // small — it should be 44 in height, 14 semibold"). Both were quoted
  // through --pu, which shrinks the first screen to fit short viewports, and
  // on an iPhone with Safari's bars showing (~700svh) that made the button
  // 38 tall with a 12px label. Outside --pu now, like the headline, the sub
  // and the gap above — the button is the design's own size on every phone
  // and only the spacing gives.
  const base =
    "inline-flex h-[44px] items-center justify-center rounded-[0.625rem] px-[0.625rem] text-[14px] font-semibold uppercase leading-none transition-all duration-300 ease-out hover:-translate-y-[1px] md:h-[3rem] md:px-6 md:text-[1.125rem] md:h-[calc(var(--hero-u)*0.67)] md:rounded-[calc(var(--hero-u)*0.15)] md:px-[calc(var(--hero-u)*0.32)] md:text-[length:calc(var(--hero-u)*0.24)]";
  // Each CTA inverts its own two colours on hover — foreground and background
  // trade places. Purple-on-white becomes white-on-purple; white-on-black
  // becomes black-on-white. Both keep a gradient background layer throughout
  // so the change cross-fades rather than snapping.
  //
  // THE TWO GRADIENTS MUST HAVE THE SAME STOP COUNT AND THE SAME STOP
  // POSITIONS, or the browser cannot interpolate between them and the fill
  // jumps at the halfway point no matter what `transition` says. The primary's
  // hover state used to be a 2-stop `#fff 0% -> #fff 100%` against a 3-stop
  // rest state at 8/42/93 — which is exactly why this button snapped while the
  // dark variant below (2 stops both sides) always cross-faded correctly.
  // Repeating the SAME percentages in white is what makes it animate.
  const style =
    variant === "primary"
      ? // purple bg / white text  ->  white bg / purple text
        "text-white bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] shadow-[0_0.5rem_1.625rem_-0.625rem_rgba(110,84,181,0.95)] hover:bg-[linear-gradient(147deg,#fff_8%,#fff_42%,#fff_93%)] hover:text-[#6e54b5] hover:shadow-[0_0.5rem_1.625rem_-0.75rem_rgba(255,255,255,0.45)] active:bg-[linear-gradient(147deg,#fff_8%,#fff_42%,#fff_93%)] active:text-[#6e54b5] active:shadow-[0_0.5rem_1.625rem_-0.75rem_rgba(255,255,255,0.45)]"
      : // white bg / black text  ->  black bg / white text
        "bg-[linear-gradient(147deg,#ececec_0%,#ececec_100%)] text-black hover:bg-[linear-gradient(147deg,#000_0%,#000_100%)] hover:text-white active:bg-[linear-gradient(147deg,#000_0%,#000_100%)] active:text-white";
  return (
    <a href={href} {...bookingTarget(href)} className={`${base} ${style}`}>
      {children}
    </a>
  );
}
