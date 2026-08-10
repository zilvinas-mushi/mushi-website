"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CREATIVES } from "@/lib/content";
import { RAIL_GUTTER, SHELL } from "@/lib/layout";
import { CreativeCard } from "./CreativeCard";

/**
 * The creatives rail: a finite, arrow-driven carousel.
 *
 * Nothing moves on its own — the track only travels when the viewer asks it
 * to, via the prev/next discs or by dragging. It runs from the first card to
 * the last and stops there; there is no wrap, so the arrow that would push
 * past an end is disabled while the rail sits at that end. Both discs share
 * one enabled treatment and one disabled treatment, so their look is always a
 * readout of where the rail actually is rather than a fixed decoration.
 *
 * Why transform and not scrollLeft: scrollLeft is quantised to whole pixels,
 * so an eased glide becomes alternating 0px and 1px steps each frame — visible
 * judder that no easing can fix. The track instead translates by a float
 * offset on the compositor, which is sub-pixel smooth, and that one offset
 * drives the arrow glides, pointer dragging and the progress line alike.
 *
 * Before hydration the container is a plain overflow-x scroller, so the rail
 * is still usable without JavaScript — just unanimated. prefers-reduced-motion
 * keeps the carousel fully working but cuts the glide to an instant jump.
 */
export function CreativesRail() {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [progress, setProgress] = useState(0);

  // The rail starts against its left end, so that is the state the server
  // renders: prev already disabled, next live. Once mounted these are derived
  // from the real offset on every move.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const offset = useRef(0);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const anim = useRef<{ from: number; to: number; t0: number; ms: number } | null>(null);
  const raf = useRef(0);
  const easeMs = useRef(750);

  /**
   * The single writer for the rail's position. Everything — arrows, drag,
   * resize — goes through here, so the clamp, the transform, the progress line
   * and the two disabled flags can never disagree with each other.
   */
  const applyOffset = useCallback((next: number) => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return;

    const max = Math.max(0, track.scrollWidth - view.clientWidth);
    const at = Math.min(Math.max(next, 0), max);

    offset.current = at;
    track.style.transform = `translate3d(${-at}px,0,0)`;
    setProgress(max > 0 ? at / max : 1);
    // Half-pixel tolerance: the eased glide lands on a float, and an offset of
    // max - 0.2 is the end as far as anyone looking at it is concerned.
    setAtStart(at <= 0.5);
    setAtEnd(at >= max - 0.5);
  }, []);

  useEffect(() => {
    easeMs.current = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 750;

    // Deferred a frame: flipping to the transform-driven mode synchronously
    // inside the effect trips react-hooks/set-state-in-effect.
    const enable = requestAnimationFrame(() => {
      setEnhanced(true);
      applyOffset(offset.current);
    });

    // Card art loads lazily and the shell is fluid, so the track's width is
    // not final at mount. Re-applying on every size change re-clamps the
    // offset and refreshes which arrows are live.
    const ro = new ResizeObserver(() => applyOffset(offset.current));
    if (trackRef.current) ro.observe(trackRef.current);
    if (viewRef.current) ro.observe(viewRef.current);

    return () => {
      cancelAnimationFrame(enable);
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, [applyOffset]);

  /** One card plus one gap — the rail advances card by card, never half a card. */
  const step = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 320;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const nudge = (dir: 1 | -1) => {
    const ms = easeMs.current;
    const to = offset.current + dir * step();
    if (ms === 0) {
      applyOffset(to);
      return;
    }

    cancelAnimationFrame(raf.current);
    anim.current = { from: offset.current, to, t0: performance.now(), ms };

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const a = anim.current;
      if (!a) return;
      const t = Math.min((now - a.t0) / a.ms, 1);
      applyOffset(a.from + (a.to - a.from) * ease(t));
      if (t >= 1) {
        anim.current = null;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enhanced) return;
    // A drag overrides an in-flight glide rather than fighting it.
    cancelAnimationFrame(raf.current);
    anim.current = null;
    drag.current = { x: e.clientX, start: offset.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    applyOffset(d.start - (e.clientX - d.x));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  // One enabled look and one disabled look, shared by both discs — the only
  // thing that differs between them is which end they are held against.
  const ARROW =
    "flex size-12 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white hover:text-black disabled:pointer-events-none disabled:bg-white/[0.06] disabled:text-white/25";

  return (
    <div>
      {/* Full-bleed: the clip box is the screen, so cards cross the entire
          display instead of disappearing at the column's edge. */}
      <div
        ref={viewRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={
          enhanced
            ? "cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
            : "scroll-row overflow-x-auto"
        }
      >
        {/* The gutters put the track's two ends back on the shell's content
            edges: the first card starts under the heading, and the last one
            comes to rest level with the right edge of the "Yes" pill. They are
            padding on the track rather than the clip box, so they bound where
            the rail can travel to without narrowing what it travels across. */}
        <ul
          ref={trackRef}
          style={{ paddingLeft: RAIL_GUTTER, paddingRight: RAIL_GUTTER }}
          className="flex w-max gap-4 pb-4 will-change-transform sm:gap-5"
        >
          {CREATIVES.items.map((item) => (
            <li key={`${item.handle}-${item.caption}`} className="flex">
              <CreativeCard item={item} />
            </li>
          ))}
        </ul>
      </div>

      {/* Timeline row: travel from first card to last on the left, prev/next
          discs on the right. Back inside the column, so it lines up with the
          heading and the first card. */}
      <div className={`${SHELL} mt-6 flex items-center gap-8`}>
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-100"
            style={{ width: `${Math.max(3, progress * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Previous creatives"
            className={ARROW}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-6 stroke-current" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="Next creatives"
            className={ARROW}
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
