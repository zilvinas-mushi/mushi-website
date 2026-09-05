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
 * THE COLUMN IS 1380 DESIGN PIXELS — expressed in the page's own scale unit,
 * so it is the design's column at every width rather than at one width.
 *
 * 86.25rem IS 1380: 1rem is 16 design px on desktop (see the scale note in
 * globals.css), so this tracks the type and the boxes exactly. That equality is
 * the whole point — column and contents move together or the contents look
 * wrong for the column.
 *
 * It used to be `w-[71.875%] max-w-[1380px]`, which is 1380/1920 as a
 * percentage of the WINDOW. That agrees with the scale — while the scale is a
 * pure function of the window. It is not: the root font-size clamps at 10.5px
 * so copy stays legible on a small laptop, and below that crossover (~1260) the
 * column kept shrinking while the contents stopped:
 *
 *   1920   column 1380   scale 1.000   contents/column  in proportion
 *   1440   column 1035   scale 0.750   in proportion
 *   1260   column  906   scale 0.656   in proportion (the crossover)
 *   1100   column  791   scale 0.656   contents 14.5% oversized  <- the bug
 *
 * That 14.5% is what read as "the arrows, the chips, the CTA buttons and the
 * cards are all massive" (Žilvinas 2026-08-15). Nothing was wrong with any of
 * those elements; every one of them was being measured against a column that
 * had shrunk past them. In rem the two cannot come apart.
 *
 *   1920   column 1380   margin 270 each side   (the design, exactly)
 *   1512   column 1087   margin 213
 *   1280   column  920   margin 180
 *   1100   column  906   margin  97   (margins give way, not the contents)
 *
 * Above 1920 the root font-size is capped at 16px, so 86.25rem stops at a flat
 * 1380 and wider monitors get wider margins — which is what the old
 * `max-w-[1380px]` did, now falling out of the same expression instead of
 * needing its own.
 *
 * Phones are unaffected: below 768 the root is 16px, so 86.25rem is 1380 and
 * `w-full` wins on any phone.
 */
export const SHELL = "mx-auto w-full max-w-[86.25rem] px-[var(--gutter)]";

/**
 * Distance from the viewport edge to the shell's content edge.
 *
 * Both sides read `--gutter` (globals.css: 15px on phones, 20 from md up) so
 * the rail cannot drift out of step with the shell at any breakpoint.
 */
export const RAIL_GUTTER =
  "max(var(--gutter), calc((100% - min(86.25rem, 100%)) / 2 + var(--gutter)))";
