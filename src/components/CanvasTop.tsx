"use client";

import { useEffect } from "react";

/**
 * Overrides the CANVAS colour at the TOP of the document — the band iOS
 * stretches into view when you rubber-band past the first screen.
 *
 * The default lives on `body` in globals.css and is #1C1927, sampled from the
 * HOME hero's first rows, where the field is lit violet at the very top. That
 * is the wrong colour on /templates: its hero opens on the black wedge of the
 * angular field, so overscrolling there dragged a violet-grey slab in above a
 * black page (Žilvinas 2026-09-06).
 *
 * It is a custom property rather than a second colour rule because the canvas
 * has to keep working with CanvasTint, which swaps `body`'s background to the
 * footer's grey at the other end of the page: one declaration, two overrides,
 * and no ordering to get wrong.
 *
 * Set on the ELEMENT rather than in a stylesheet so it lands per page without
 * a route-aware layout, and removed on unmount so a client-side navigation
 * back to home takes its own colour again.
 */
export function CanvasTop({ color }: { color: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--canvas-top", color);
    return () => {
      root.style.removeProperty("--canvas-top");
    };
  }, [color]);

  return null;
}
