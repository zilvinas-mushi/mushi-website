"use client";

import { useEffect, useRef, useState } from "react";
import { CREATIVES } from "@/lib/content";
import { CreativeCard } from "./CreativeCard";

/**
 * The creatives rail: a finite, hand-scrollable strip with a slow auto-drift,
 * a progress line and prev/next controls — the design shows a timeline with
 * arrow buttons under the cards, which implies a carousel, not an endless
 * marquee.
 *
 * Client component, but it degrades: with JavaScript unavailable the list is
 * still a native overflow-x scroller with momentum, just without the drift or
 * the controls doing anything. No server involvement anywhere.
 *
 * Auto-drift pauses while the visitor hovers, focuses into, or touches the
 * rail, and never runs at all under prefers-reduced-motion.
 */
export function CreativesRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  // Float accumulator for the drift. scrollLeft rounds to whole pixels, so at
  // 24px/s the per-frame step (~0.4px) would round back to zero forever —
  // the position has to accumulate here and only then be written out.
  const posRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    const DRIFT = 24; // px/s — a slow creep; the arrows do the real driving

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (pausedRef.current) {
        // While the visitor drives (hover, touch, buttons), track their
        // position instead of fighting it.
        posRef.current = el.scrollLeft;
      } else {
        const max = el.scrollWidth - el.clientWidth;
        posRef.current =
          posRef.current >= max - 1 ? 0 : posRef.current + DRIFT * dt;
        el.scrollLeft = posRef.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onScroll = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    // Pause the drift while the smooth scroll animates — a drift write in the
    // same frame would cancel it — then resync and resume.
    pausedRef.current = true;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
    window.setTimeout(() => {
      posRef.current = el.scrollLeft;
      pausedRef.current = false;
    }, 700);
  };

  const pause = (v: boolean) => {
    pausedRef.current = v;
  };

  return (
    <div
      onPointerEnter={() => pause(true)}
      onPointerLeave={() => pause(false)}
      onTouchStart={() => pause(true)}
      onFocus={() => pause(true)}
      onBlur={() => pause(false)}
    >
      <ul
        ref={railRef}
        onScroll={onScroll}
        className="scroll-row -mx-5 flex gap-4 overflow-x-auto px-5 pb-4 sm:gap-5"
      >
        {CREATIVES.items.map((item) => (
          <li key={`${item.handle}-${item.caption}`} className="flex">
            <CreativeCard item={item} />
          </li>
        ))}
      </ul>

      {/* Timeline row: progress line left, prev/next discs right. */}
      <div className="mt-6 flex items-center gap-8">
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Previous creatives"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-4 stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Next creatives"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="size-4 stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
