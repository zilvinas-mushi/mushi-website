/**
 * THE VIOLET CALL-TO-ACTION, one fill for every button that wears it.
 *
 * The header CTA's three Figma stops verbatim. At 117.51deg the gradient line
 * across a 345 x 47 box is 330 long and almost entirely horizontal, so the
 * light pools at the LEFT edge and the last third sits flat at #6E54B5 —
 * which is what the artboard shows for each of these buttons.
 *
 * It inverts to white on hover like every button (CLAUDE.md) — and on TAP
 * (Žilvinas 2026-09-25, "inversion on click"): a phone has no hover, so the
 * same swap rides on :active. The hover repeats all THREE stop positions in
 * white rather than being a flat colour: a 2-stop hover against a 3-stop
 * rest cannot interpolate, so the fill would snap instead of cross-fading.
 *
 * ONE SIZE ON THE PHONE (Noah 2026-10-17, after Žilvinas: "what trips me
 * off — different violet call to action button sizes on phone"): the bar's
 * Redeem 50% Off, the comparison table's and the Access card's Buy Now and
 * the plan sheet's Buy all take this fill and the plan sheet's box — 47.35
 * tall, a 10 corner, full width. Each keeps its own label: caps or not, and
 * the size in px, were left as they are, on purpose. So the box is PHONE_CTA
 * and the label is the caller's.
 */
export const VIOLET_FILL =
  "bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] active:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] active:text-[#6e54b5]";

/** The phone box, in px at the design's 375: the plan sheet's Buy, which the others were matched to. */
export const PHONE_CTA_HEIGHT_PX = 47.35;
export const PHONE_CTA_RADIUS_PX = 10;

/** The same box as Tailwind classes, for a button whose size is not set by a page. */
export const PHONE_CTA_BOX = "flex h-[47.35px] w-full items-center justify-center rounded-[10px]";
