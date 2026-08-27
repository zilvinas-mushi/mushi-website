"use client";

import { useEffect } from "react";
import { FOOTER_PLATE_ID } from "@/lib/site";

/**
 * Tints the CANVAS — the colour iOS stretches into view when you rubber-band
 * past either end of the page — to the footer's grey while the footer is on
 * screen, and back to black when it is not.
 *
 * WHY THIS CANNOT BE DONE IN CSS ALONE. WebKit does not paint the overscroll
 * area from `html`'s background the way the spec's canvas rules imply: it
 * derives ONE document background colour by blending html's with body's, and
 * an opaque body wins outright. Setting `html { background: #121212 }` did
 * nothing on an iPhone for exactly that reason — `body` was still opaque
 * black. The colour has to move on BODY.
 *
 * And there is only that one colour, for both ends at once. Black past the top
 * is right (the hero's ground, which .hero-light's vignette fades to) and grey
 * past the bottom is right (the footer plate continuing), so the only way to
 * have both is to change it as you scroll. Hence this.
 *
 * It is invisible to the page: `body`'s background never shows, because the
 * layout wraps everything in an opaque `bg-bg` div. Only the overscroll sees
 * it. That is what makes swapping it mid-scroll safe — nothing on screen can
 * flicker, because nothing on screen is painted by it.
 *
 * The footer is the trigger rather than a scroll distance, for the reason the
 * phone header's CTA uses the creatives pill: any threshold in pixels goes
 * silently wrong the next time something above it changes height. You can only
 * overscroll the bottom from the bottom, so "the footer is showing" is a
 * superset of the moment that matters, and the extra window costs nothing.
 *
 * No-JS and pre-hydration both leave it black, which is today's behaviour.
 */
export function CanvasTint() {
  useEffect(() => {
    const plate = document.getElementById(FOOTER_PLATE_ID);
    if (!plate) return;

    const root = document.documentElement;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) root.dataset.canvas = "footer";
        else delete root.dataset.canvas;
      },
      { threshold: 0 },
    );
    io.observe(plate);
    return () => {
      io.disconnect();
      delete root.dataset.canvas;
    };
  }, []);

  return null;
}
