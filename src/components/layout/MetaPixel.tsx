"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { startPixel, trackPageView } from "@/lib/meta-pixel";

/**
 * Arms the Meta Pixel on every page and counts a client-side navigation as
 * a page view. Everything about WHEN the script loads, and who is not
 * tracked, is in src/lib/meta-pixel.ts — this only calls it.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      startPixel();
      return;
    }
    trackPageView();
  }, [pathname]);

  return null;
}
