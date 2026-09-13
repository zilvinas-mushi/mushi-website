"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
 * The shell is `opacity: 0` in CSS until `<html>` carries `data-ready`
 * (globals.css). That is a CSS rule in the render-blocking stylesheet, so it
 * applies at the FIRST paint — there is no frame in which content is visible
 * and then hidden. What stays on screen meanwhile is layout.tsx's opaque
 * `bg-bg` wrapper: the page's own black, which is where the hero fades up
 * from anyway, so the gate has no colour of its own and reads as nothing.
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
 * The ceiling on the hold. 4s is past the 95th percentile of the measured
 * Slow-4G first load (FCP 2275ms with everything on the wire) and still
 * inside the window where a visitor reads a blank tab as "loading" rather
 * than as "broken".
 */
const TIMEOUT_MS = 4000;

/**
 * The same ceiling for a route change. Much shorter, because by then the
 * fonts are in, the runtime is warm and next/link has prefetched the route —
 * all that can still be outstanding is the new page's own artwork. A visitor
 * who has already seen one screen reads a long hold as the click not having
 * registered.
 */
const NAV_TIMEOUT_MS = 1500;

export function PaintGate() {
  // The gate re-arms on every route change. /templates links back to the home
  // page, and a client-side navigation is exactly where this is easiest to get
  // wrong: the new route's DOM commits instantly while its hero artwork is
  // still on the wire, so without this you would land on the home page with an
  // unlit hero and watch the light arrive. The layout does not remount across
  // routes, so nothing but this dependency would re-run it.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    // Re-arm. A no-op on first mount (the attribute has never been set) and
    // the point of the exercise on every route change after it. The closed
    // state carries `transition: none`, so this hides instantly rather than
    // fading the old page out — what is wanted is the new page arriving, not
    // the old one leaving.
    const isFirstPaint = !root.hasAttribute("data-ready");
    delete root.dataset.ready;

    let opened = false;
    let revealed = false;
    const timers: number[] = [];

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      root.dataset.ready = "";
    };

    const open = () => {
      if (opened) return;
      opened = true;

      // A HIDDEN TAB GETS NO FRAMES. Chrome suspends requestAnimationFrame
      // entirely in a background tab, so a page opened in one (cmd-click, a
      // restored session, a link opened in the background) would sit gated
      // until it was looked at — and the failsafe below would be suspended
      // with it. Measured here: rAF did not fire once in a full second in a
      // hidden tab. Nothing needs easing in where nobody is watching, so this
      // reveals outright and the fade is skipped.
      if (document.visibilityState === "hidden") {
        reveal();
        return;
      }

      // Two frames: the first lets the browser commit the decoded artwork,
      // the second flips the attribute so the fade starts from a finished
      // picture rather than racing the last paint.
      requestAnimationFrame(() => requestAnimationFrame(reveal));
      // And a timer behind them, because the tab can be hidden between the
      // check above and the frame that never comes. `reveal` is idempotent —
      // whichever arrives first wins and the other is a no-op.
      timers.push(window.setTimeout(reveal, 150));
    };

    timers.push(
      window.setTimeout(open, isFirstPaint ? TIMEOUT_MS : NAV_TIMEOUT_MS),
    );

    /**
     * Ready to be painted: DECODED if this browser will decode it, and
     * otherwise merely arrived.
     *
     * `decode()` is the better signal — it resolves only when the bitmap is
     * ready, so the reveal cannot catch a frame where the pixels are not
     * there yet. But it does NOT resolve in a hidden tab: Chrome defers the
     * decode until the document is visible, so a page opened in a background
     * tab hung on every one of these and only ever opened on the timeout
     * (measured here: no resolution in 3.5s on a hidden tab, instant when
     * visible). The load event fires either way, so the two are raced. In a
     * hidden tab that means "the bytes are in", which is the most that can be
     * known there — and the browser decodes before it paints anyway, so
     * nothing half-drawn can reach a visitor who switches to the tab later.
     */
    const painted = (img: HTMLImageElement): Promise<unknown> => {
      const arrived = img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
      return Promise.race([img.decode().catch(() => {}), arrived]);
    };

    const waits: Promise<unknown>[] = [];

    if (document.fonts) waits.push(document.fonts.ready.catch(() => {}));

    for (const img of Array.from(document.images)) {
      if (img.loading === "lazy") continue;
      waits.push(painted(img));
    }

    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>("[data-await-bg]"),
    )) {
      // No boxes means display:none somewhere up the tree, which means the
      // background is never fetched. Waiting on it would never resolve.
      if (!el.getClientRects().length) continue;
      const layers = getComputedStyle(el).backgroundImage;
      for (const match of layers.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
        const url = match[2];
        if (!url || url.startsWith("data:")) continue;
        const probe = new Image();
        probe.src = url;
        waits.push(painted(probe));
      }
    }

    Promise.all(waits).then(open);

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
