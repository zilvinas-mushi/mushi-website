"use client";

import { useEffect, useRef, useState } from "react";
import { CREATIVES } from "@/lib/content";
import { CreativeCard } from "./CreativeCard";

/**
 * The creatives rail: an endless, transform-driven carousel.
 *
 * Why transform and not scrollLeft: scrollLeft is quantised to whole pixels,
 * so a 40px/s drift becomes alternating 0px and 1px steps each frame —
 * visible judder that no easing can fix. The track instead translates by a
 * float offset on the compositor, which is sub-pixel smooth, and the same
 * offset drives the drift, the arrow glides and pointer dragging, all wrapped
 * modulo one set-width over a duplicated card list so the loop is endless and
 * seamless in both directions.
 *
 * Before hydration the container is a plain overflow-x scroller, so the rail
 * is still usable without JavaScript — just finite and unanimated.
 * prefers-reduced-motion keeps it that way permanently.
 */
export function CreativesRail() {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [progress, setProgress] = useState(0);

  const offset = useRef(0);
  const paused = useRef(false);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const anim = useRef<{ from: number; to: number; t0: number } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Deferred a frame: flipping to the transform-driven mode synchronously
    // inside the effect trips react-hooks/set-state-in-effect.
    const enable = requestAnimationFrame(() => setEnhanced(true));

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last = performance.now();
    const DRIFT = 40; // px/s
    const EASE_MS = 750;
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const setW = track.scrollWidth / 2;

      if (anim.current) {
        const { from, to, t0 } = anim.current;
        const t = Math.min((now - t0) / EASE_MS, 1);
        offset.current = from + (to - from) * ease(t);
        if (t >= 1) anim.current = null;
      } else if (!paused.current && !drag.current) {
        offset.current += DRIFT * dt;
      }

      // Endless wrap: the two halves of the track are identical, so jumping
      // by one set-width lands on the same pixels.
      if (setW > 0) {
        offset.current = ((offset.current % setW) + setW) % setW;
        track.style.transform = `translate3d(${-offset.current}px,0,0)`;
        setProgress(offset.current / setW);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(enable);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    anim.current = {
      from: offset.current,
      to: offset.current + dir * 320,
      t0: performance.now(),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enhanced) return;
    drag.current = { x: e.clientX, start: offset.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    offset.current = drag.current.start - (e.clientX - drag.current.x);
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <div
        ref={viewRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`-mx-5 px-5 ${
          enhanced
            ? "cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
            : "scroll-row overflow-x-auto"
        }`}
      >
        <ul ref={trackRef} className="flex w-max gap-4 pb-4 will-change-transform sm:gap-5">
          {CREATIVES.items.map((item) => (
            <li key={`a-${item.handle}-${item.caption}`} className="flex">
              <CreativeCard item={item} />
            </li>
          ))}
          {/* Second copy makes the wrap seamless; hidden from screen readers
              so each creative is announced once. */}
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
      </div>

      {/* Timeline row: loop progress left, prev/next discs right. */}
      <div className="mt-6 flex items-center gap-8">
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${Math.max(3, progress * 100)}%` }}
          />
        </div>

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
