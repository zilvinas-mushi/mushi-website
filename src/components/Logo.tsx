/**
 * Mushi wordmark — ported verbatim from mushi-app so the mark is identical on
 * both properties.
 *
 * Set in Dutch801 Rm WGL4 BT (Roman / 400), wired up as the `font-serif` token
 * in globals.css. Dutch801 ships a single Roman weight, so the wordmark keeps
 * its natural weight — adding font-medium/bold would make the browser
 * synthesise a faux bold.
 *
 * ## Why the -0.0376em nudge
 *
 * The wordmark rendered 2.2px LOW in the 100px header bar. `items-center`
 * centres the BOX; Dutch801's ascent (1.056em) and descent (0.271em) sit
 * lopsided around the ink, so the box centre is not the ink centre.
 *
 * The nav labels next to it solve this with `cap-centered`
 * (`text-box: trim-both cap alphabetic`). That does NOT work here, and it was
 * tried: it made the error WORSE, 2.2px -> 8.6px. Two reasons, both specific
 * to this font and this word. Dutch801 is a local TTF with no usable OS/2 cap
 * height, so `text-box-edge: cap` falls back to the ascent; and "Mushi" has an
 * `h` ascender and the dot of the `i` standing above cap height anyway, so a
 * cap-line trim would cut above the ink even if the metric were there.
 *
 * So the offset is MEASURED instead of derived. The glyphs were rasterised to
 * a canvas to find the real ink: 0.7225em above the baseline, 0.0125em below
 * (the round letters' overshoot). That puts the ink centre 0.0376em below the
 * box centre, which is what is corrected here.
 *
 * It is in `em`, so it holds at every --u and in MobileHeader's 38px too — a
 * px nudge would only be right at one width. Remeasure if the face ever
 * changes; nothing about this number is derivable from the CSS.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex -translate-y-[0.0376em] items-baseline font-serif leading-none tracking-tight text-white ${
        className ?? "text-5xl"
      }`}
    >
      Mushi
    </span>
  );
}
