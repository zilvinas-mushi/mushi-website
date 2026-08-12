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
/**
 * THE COLUMN IS A PROPORTION, not a fixed 1380, and that is what makes the
 * sections cut at the same place as the Figma frame at every window size.
 *
 * 1380 of 1920 is 71.875%, leaving 14.06% of margin on each side. Capped at
 * 1380px it is unchanged at the reference width, but below it the margins now
 * scale with the window instead of collapsing:
 *
 *   1920   column 1380   margin 270 each side   (the design, exactly)
 *   1512   column 1087   margin 213
 *   1280   column  920   margin 180
 *
 * It used to be a flat `max-w-[1380px]`, so at 1512 the column still took 1380
 * and left only 66px each side — 91% of the window, against the design's 72%.
 * That is why the sections read as oversized live and why the artwork ran
 * almost edge to edge: nothing was wrong with the cards, the column around them
 * was too wide.
 *
 * Phones keep `w-full`; the percentage only applies from md up, where there is
 * enough width for a margin to be worth having.
 */
export const SHELL =
  "mx-auto w-full max-w-[1380px] px-[var(--gutter)] md:w-[71.875%]";

/**
 * Distance from the viewport edge to the shell's content edge.
 *
 * Both sides read `--gutter` (globals.css: 15px on phones, 20 from md up) so
 * the rail cannot drift out of step with the shell at any breakpoint.
 */
export const RAIL_GUTTER =
  "max(var(--gutter), calc((100% - min(1380px, 71.875%)) / 2 + var(--gutter)))";
