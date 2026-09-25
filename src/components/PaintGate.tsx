"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * THE PAINT GATE. Nothing is shown until the first screen is actually ready
 * to be seen.
 *
 * The rule it enforces (CLAUDE.md, "Nothing paints half-built"): a visitor
 * must never watch the page assemble itself — no headline on flat black while
 * the hero's lighting is still on the wire, no unstyled type swapping to
 * Poppins, no tiles fading in one at a time. Either the screen is finished or
 * it is the page's own ground colour with nothing on it.
 *
 * ## How it holds
 *
 * A fixed `.paint-veil` in the page's own black covers the page until
 * `<html>` carries `data-ready` (globals.css). That is a CSS rule in the
 * render-blocking stylesheet, so it is up at the FIRST paint — there is no
 * frame in which content shows through. The content underneath paints at
 * full opacity from the start (which is what the browser's paint timing
 * records); the veil then fades out over it, which is where the hero fades
 * up from anyway, so the gate has no colour of its own and reads as nothing.
 *
 * No spinner, no logo, no progress bar. A hold this short (it is the tail of
 * the load the visitor was already waiting through) is invisible; a spinner
 * appearing and leaving is not.
 *
 * ## What it waits for
 *
 * Everything the first screen is made of, and nothing below it:
 *
 *   - `document.fonts.ready` — every face the page has actually asked for.
 *     None of them preload (see layout.tsx), so this is also what guarantees
 *     the headline is never painted in the fallback and re-painted in Poppins.
 *   - every non-lazy `<img>` in the document, `decode()`d — not merely
 *     loaded. A decoded image paints in the frame we reveal; a loaded one may
 *     still pop a frame later.
 *   - the CSS artwork behind the hero, which no `<img>` covers. Mark those
 *     elements `data-await-bg` and this reads their computed
 *     `background-image` and decodes each URL. The browser dedupes against
 *     the fetch the stylesheet already started, so this costs one cache hit.
 *
 * Elements with no boxes (`display: none` at this breakpoint — the phone
 * hides .hero-light's desktop twin, the floaters, the tile field) are
 * skipped: their backgrounds are never fetched, so waiting on one would hang
 * the gate on bytes this device will never spend. Lazy images are skipped for
 * the same reason — they are below the fold and have not started.
 *
 * ## What it will not do
 *
 * Hold the page hostage. `TIMEOUT_MS` opens the gate regardless — a dead CDN,
 * a font that 404s, a decode that throws on some browser we have not seen
 * must degrade to "the old behaviour", never to a black page. Every wait is
 * `.catch()`ed to nothing for the same reason, and a visitor with JavaScript
 * off never sees the gate at all (the `<noscript>` override in layout.tsx).
 */

/**
 * ## Where it runs
 *
 * NOT HERE, on the first paint. The waiting and the reveal are an inline
 * <head> script (src/lib/paint-gate-script.ts) so that they start while the
 * HTML is still arriving. Inside this component they could not start until
 * the bundle had been fetched, parsed and hydrated — on a simulated Slow-4G
 * phone that held the reveal, and with it Largest Contentful Paint, at 7.2s
 * on a page whose hero had been decoded since 1.4s.
 *
 * What is left here is the ROUTE CHANGE. The inline script hangs its engine
 * off `window.__mushiGate`; this calls it again whenever the pathname
 * changes, with the shorter ceiling. The ceilings, the waits and the reveal
 * all live in that one file — do not grow a second copy here.
 */
declare global {
  interface Window {
    /** The inline gate's engine — `true` on a first paint, `false` on a nav. */
    __mushiGate?: (firstPaint: boolean) => void;
    /** Load every deferred image and background inside one element at once. */
    __mushiLoadGroup?: (el: Element) => void;
  }
}

export function PaintGate() {
  // The gate re-arms on every route change. /templates links back to the home
  // page, and a client-side navigation is exactly where this is easiest to get
  // wrong: the new route's DOM commits instantly while its hero artwork is
  // still on the wire, so without this you would land on the home page with an
  // unlit hero and watch the light arrive. The layout does not remount across
  // routes, so nothing but this dependency would re-run it.
  const pathname = usePathname();
  // The first pathname this sees is the one the inline script already gated;
  // re-arming for it would hide a finished screen and fade it back in.
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.__mushiGate?.(false);
  }, [pathname]);

  return null;
}
