/**
 * Page geometry, in one place because more than one component needs it.
 *
 * The design leaves a 270px margin either side at 1920, so the content column
 * is 1380 — not the 1200 this used to cap at. The narrower column was starving
 * the testimonial cards: at 21px body text they wrapped to so many lines that
 * the collapsed grid cut cards through the middle.
 *
 * Every section's content sits in a 1380px column with a `--gutter` side
 * margin — 15px on phones, the design's measured 20 from md up. Most
 * components get that by wrapping their content in `SHELL`. The creatives rail
 * cannot: it has to clip at the screen edges so cards travel the full width of
 * the display, while still *starting* on the column's left edge so the first
 * card lines up with the heading above it. `RAIL_GUTTER` is that same left
 * edge expressed as a padding a full-bleed child can apply to itself.
 *
 * The `100%` resolves against the padded element's containing block, so this
 * is only correct on an element whose parent spans the viewport.
 */
export const SHELL = "mx-auto w-full max-w-[1380px] px-[var(--gutter)]";

/**
 * Distance from the viewport edge to the shell's content edge.
 *
 * Both sides read `--gutter` (globals.css: 15px on phones, 20 from md up) so
 * the rail cannot drift out of step with the shell at any breakpoint.
 */
export const RAIL_GUTTER =
  "max(var(--gutter), calc((100% - 1380px) / 2 + var(--gutter)))";
