"use client";

import { useEffect, useRef, useState } from "react";
import { CREATIVES } from "@/lib/content";
import { CreativeCard } from "./CreativeCard";

/**
 * The creatives rail: an endless carousel. The card list renders twice and
 * every navigation mode — the slow auto-drift, the arrow buttons, and manual
 * scrolling — wraps by teleporting exactly one set-width while the content on
 * screen is pixel-identical, so the loop point is invisible and the rail
 * never ends in either direction.
 *
 * Client component, but it degrades: without JavaScript the list is still a
 * native overflow-x scroller, just finite. No server involvement anywhere.
 *
 * Auto-drift pauses while the visitor hovers, focuses into, or touches the
 * rail, and never runs at all under prefers-reduced-motion.
 */
export function CreativesRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const animRef = useRef(false);
  // Float accumulator: at 24px/s the per-frame step (~0.4px) rounds back to
  // zero forever if written straight into integer scrollLeft.
  const posRef = useRef(0);
  const [progress, setProgress] = useState(0);

  /** Width of ONE card set = half the duplicated track. */
  const setWidth = () => {
    const el = railRef.current;
    return el ? el.scrollWidth / 2 : 0;
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    // 40px/s: lively but readable. 24 read as almost static once the arrows
    // took over navigation; the old pure marquee ran ~58 and felt right, so
    // this sits between them. One number to tune.
    const DRIFT = 40; // px/s

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (pausedRef.current || animRef.current) {
        posRef.current = el.scrollLeft;
      } else {
        const setW = setWidth();
        posRef.current += DRIFT * dt;
        // Seam: one full set scrolled past — snap back by exactly a set.
        if (setW > 0 && posRef.current >= setW) posRef.current -= setW;
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
    const setW = setWidth();
    // Manual scrolling wraps too — but never mid arrow-animation.
    if (!animRef.current && setW > 0) {
      if (el.scrollLeft >= setW) el.scrollLeft -= setW;
    }
    setProgress(setW > 0 ? (el.scrollLeft % setW) / setW : 0);
  };

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el === null || animRef.current) return;
    const STEP = 320;
    const setW = setWidth();
    let from = el.scrollLeft;
    // Teleport by one identical set first when the step would leave the
    // buffer — the jump lands on the same pixels, so it cannot be seen.
    if (dir < 0 && from < STEP) {
      from += setW;
      el.scrollLeft = from;
    } else if (dir > 0 && from > setW) {
      from -= setW;
      el.scrollLeft = from;
    }
    const to = from + dir * STEP;
    const D = 750;
    const t0 = performance.now();
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    animRef.current = true;
    const step = (now: number) => {
      const t = Math.min((now - t0) / D, 1);
      el.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        const w = setWidth();
        if (w > 0 && el.scrollLeft >= w) el.scrollLeft -= w;
        posRef.current = el.scrollLeft;
        animRef.current = false;
      }
    };
    requestAnimationFrame(step);
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
          <li key={`a-${item.handle}-${item.caption}`} className="flex">
            <CreativeCard item={item} />
          </li>
        ))}
        {/* Second copy makes the wrap seamless; hidden from screen readers so
            each creative is announced once. */}
        {CREATIVES.items.map((item) => (
          <li
            key={`b-${item.handle}-${item.caption}`}
            className="flex"
            aria-hidden="true"
          >
            <CreativeCard item={item} />
          </li>
        ))}
      </ul>

      {/* Timeline row: loop progress left, prev/next discs right. */}
      <div className="mt-6 flex items-center gap-8">
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-150 ease-linear"
            style={{ width: `${Math.max(3, progress * 100)}%` }}
          />
        </div>

        {/* Prev is the quiet one; next is highlighted — the design leads the
            eye toward "forward". */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Previous creatives"
            className="flex size-12 items-center justify-center rounded-full bg-white/[0.08] text-white/60 transition-colors hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-6 stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Next creatives"
            className="flex size-12 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white hover:text-black"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-6 stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
