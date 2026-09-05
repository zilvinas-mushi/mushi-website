"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREATIVES } from "@/lib/content";
import { RAIL_GUTTER, SHELL } from "@/lib/layout";
import { CreativeCard } from "./CreativeCard";

/**
 * Spring stiffness in rad/s. The spring is critically damped, so the rail
 * eases into AND out of every move and never overshoots or wobbles; ~11
 * settles a one-card step in a bit over a third of a second.
 *
 * A spring rather than a fixed-duration tween because clicks arrive faster
 * than moves finish. A tween restarted mid-flight has to pick a new start
 * point, which throws away the speed the rail already had and shows up as a
 * hitch on every second click. A spring just gets a new target and keeps its
 * velocity, so a burst of clicks reads as one continuous accelerating glide.
 */
const OMEGA = 11;

/** The progress line never fully empties — this is its length at card one. */
const PROGRESS_FLOOR = 0.03;

/**
 * The creatives rail: a finite, arrow-driven carousel.
 *
 * ON A POINTER, THE ARROWS ARE THE ONLY WAY TO MOVE IT. Dragging was
 * deliberately removed: the rail is meant to be stepped through card by card,
 * in the order the design lays them out, and a drag lets the viewer stop
 * halfway between two cards or skim past several without ever seeing them. The
 * discs advance exactly one card, so every creative gets its turn in the
 * intended sequence.
 *
 * ON A PHONE IT SWIPES (Žilvinas 2026-08-25). Below md the rail hands the
 * offset back to the browser: a real overflow-x scroller with scroll-snap, so
 * a thumb flick moves it with the platform's own momentum and rubber-banding
 * and every card still comes to rest on its own edge. Nothing here tries to
 * reimplement that from pointer events — a JS drag on a touch screen fights
 * the compositor, loses the vertical-scroll handoff, and gets none of the
 * momentum for free. The arrows stay, and in this mode they call scrollBy
 * instead of the spring; the progress line reads scrollLeft back rather than
 * driving it.
 *
 * The desktop path is untouched by any of that — it is still the clipped,
 * transform-driven track, and the spring below is driven only by arrow clicks
 * there. There is no flick/momentum handling in it because there is no gesture
 * to carry speed over from.
 *
 * Nothing moves on its own either; there is no autoplay. It runs from the
 * first card to the last and stops there, with no wrap, so the arrow that
 * would push past an end is disabled while the rail sits at that end. Both
 * discs share one enabled treatment and one disabled treatment, so their look
 * is always a readout of where the rail actually is rather than a fixed
 * decoration.
 *
 * EVERYTHING THAT MOVES IS WRITTEN IMPERATIVELY, and this is the whole reason
 * the motion holds together. The track's transform, the progress line's scale
 * and the spring all update inside one rAF callback that never touches React
 * state. Re-rendering per frame meant React reconciling every card in the rail
 * sixty times a second while the compositor was mid-glide, and a progress bar
 * animating its own width on a separate 100ms timer on top of that — three
 * clocks for one movement, which is what made the cards and the line look like
 * they were arriving at different times. React is now told only when a disc
 * flips between enabled and disabled, which is twice per traversal.
 *
 * Why transform and not scrollLeft: scrollLeft is quantised to whole pixels,
 * so a spring's long tail becomes alternating 0px and 1px steps — visible
 * judder that no easing can fix. Transform interpolates on the compositor in
 * float, so the tail stays smooth all the way into the stop.
 *
 * Before hydration the container is a plain overflow-x scroller, so the rail
 * is still usable without JavaScript — just unanimated. prefers-reduced-motion
 * keeps the carousel fully working but cuts the travel to an instant jump.
 */
export function CreativesRail() {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  /**
   * Phone mode: the browser owns the offset. Mirrored into a ref because
   * `paint` runs on scroll and inside rAF, where reading the state variable
   * would close over a stale value.
   */
  const [native, setNative] = useState(false);
  const nativeRef = useRef(false);

  // The rail starts against its left end, so that is the state the server
  // renders: prev already disabled, next live. After mount these are derived
  // from the real position — but only written when they actually change, so a
  // glide costs at most one render instead of one per frame.
  const [ends, setEnds] = useState({ start: true, end: false });
  const endsRef = useRef(ends);

  const pos = useRef(0);
  const vel = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);
  const snap = useRef(false);

  const maxOffset = () => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return 0;
    return Math.max(0, track.scrollWidth - view.clientWidth);
  };

  /** The one place the DOM is written. Reads pos.current, paints, nothing else. */
  const paint = useCallback(() => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return;
    const max = maxOffset();
    // Phone: READ the offset the browser already has. Desktop: write our own.
    // Everything below this line — the progress line, the two discs — is the
    // same readout of the same number either way, which is why the swipe mode
    // needed no second copy of it.
    const at = nativeRef.current ? view.scrollLeft : pos.current;

    if (!nativeRef.current) track.style.transform = `translate3d(${-at}px,0,0)`;

    // scaleX, not width: a width change is layout on every frame, a scale is a
    // compositor transform on the same frame budget as the track itself. That
    // is what keeps the line pinned to the cards instead of trailing them.
    if (fillRef.current) {
      const p = max > 0 ? at / max : 1;
      fillRef.current.style.transform = `scaleX(${
        PROGRESS_FLOOR + (1 - PROGRESS_FLOOR) * p
      })`;
    }

    // Half-pixel tolerance: the spring lands on a float, and an offset of
    // max - 0.2 is the end as far as anyone looking at it is concerned.
    const next = { start: at <= 0.5, end: at >= max - 0.5 };
    if (next.start !== endsRef.current.start || next.end !== endsRef.current.end) {
      endsRef.current = next;
      setEnds(next);
    }
  }, []);

  /**
   * Critically damped spring, integrated semi-implicitly. Idempotent: calling
   * it while it is already running is a no-op, so a retarget mid-flight simply
   * moves the goalposts under a loop that never stopped.
   */
  const run = useCallback(() => {
    if (raf.current) return;
    let last = performance.now();

    const frame = (now: number) => {
      // Clamped so a backgrounded tab returning does not integrate one giant
      // step and fling the rail across the screen.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const d = target.current - pos.current;
      vel.current += (OMEGA * OMEGA * d - 2 * OMEGA * vel.current) * dt;
      pos.current += vel.current * dt;

      // A critically damped spring approaches without ever arriving, so it is
      // retired once it is inside half a pixel and slow enough to be done.
      if (Math.abs(target.current - pos.current) < 0.5 && Math.abs(vel.current) < 2) {
        pos.current = target.current;
        vel.current = 0;
        raf.current = 0;
        paint();
        return;
      }

      paint();
      raf.current = requestAnimationFrame(frame);
    };

    raf.current = requestAnimationFrame(frame);
  }, [paint]);

  /** Move to an absolute offset, clamped to the rail's two ends. */
  const goTo = useCallback(
    (to: number) => {
      target.current = Math.min(Math.max(to, 0), maxOffset());
      if (snap.current) {
        pos.current = target.current;
        vel.current = 0;
        paint();
        return;
      }
      run();
    },
    [paint, run],
  );

  /**
   * ARM THE WHOLE RAIL AT ONCE, two viewports out.
   *
   * The cards ship `loading="lazy"` so React does not put a
   * `<link rel="preload" as="image">` for all twenty-three of them in the
   * document head, ahead of the stylesheet the hero's headline is blocked on.
   * But lazy on its own is not what this rail needs either: it is a marquee,
   * so a card is always arriving from the right, and the browser's own
   * lookahead only reaches the next 1250px of it — the rest pop in blank
   * mid-glide, which is exactly what the eager version existed to prevent.
   *
   * So: lazy in the markup, and the moment the section is within two
   * viewports every image in it is flipped to eager in one DOM pass. No
   * re-render (twenty cards' worth of React for an attribute would be its own
   * cost), no head preloads, and the rail is fully painted before anyone
   * reaches it.
   */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const load = () => {
      for (const img of view.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
        img.loading = "eager";
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[entries.length - 1].isIntersecting) return;
        io.disconnect();
        load();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(view);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    snap.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * Swap between the swipe scroller and the transform track, and hand the
     * current offset across so the rail does not jump when a phone is turned
     * on its side.
     *
     * The handover has to be explicit in BOTH directions: a transform left on
     * the track would slide it out from under its own scrollbar, and a
     * scrollLeft left on the view would offset a track that is also being
     * translated — either way the rail ends up somewhere neither mode meant.
     */
    const phone = window.matchMedia("(max-width: 767px)");
    const applyMode = () => {
      const view = viewRef.current;
      const track = trackRef.current;
      if (!view || !track) return;
      nativeRef.current = phone.matches;
      setNative(phone.matches);

      if (phone.matches) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
        vel.current = 0;
        track.style.transform = "";
        view.scrollLeft = pos.current;
      } else {
        pos.current = view.scrollLeft;
        target.current = pos.current;
        view.scrollLeft = 0;
      }
      paint();
    };

    // Deferred a frame: flipping to the transform-driven mode synchronously
    // inside the effect trips react-hooks/set-state-in-effect.
    const enable = requestAnimationFrame(() => {
      setEnhanced(true);
      applyMode();
    });
    phone.addEventListener("change", applyMode);

    // Phone mode's only input. rAF-throttled because `paint` measures the
    // track, and a forced reflow per scroll event is exactly what makes a
    // momentum flick stutter.
    let ticking = 0;
    const onScroll = () => {
      if (ticking) return;
      ticking = requestAnimationFrame(() => {
        ticking = 0;
        paint();
      });
    };
    viewRef.current?.addEventListener("scroll", onScroll, { passive: true });

    // Card art loads lazily and the shell is fluid, so the track's width is
    // not final at mount. Re-clamping on every size change keeps the rail
    // inside its ends and refreshes which arrows are live.
    const ro = new ResizeObserver(() => {
      // In phone mode the browser clamps its own scrollLeft, so there is
      // nothing to re-clamp — only the readout to refresh.
      if (!nativeRef.current) {
        const max = maxOffset();
        target.current = Math.min(target.current, max);
        pos.current = Math.min(pos.current, max);
      }
      paint();
    });
    if (trackRef.current) ro.observe(trackRef.current);
    if (viewRef.current) ro.observe(viewRef.current);

    const view = viewRef.current;
    return () => {
      cancelAnimationFrame(enable);
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(ticking);
      phone.removeEventListener("change", applyMode);
      view?.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [paint]);

  /** One card plus one gap — the rail advances card by card, never half a card. */
  const cardStep = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 320;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  // Steps from the TARGET, not from the current position, so three quick
  // clicks advance three cards instead of collapsing into one and a half.
  //
  // In phone mode the browser is the one moving, so the step goes through
  // scrollBy — which is relative to where the scroller actually IS, and lands
  // on a snap point because the step is exactly one card plus one gap.
  const nudge = (dir: 1 | -1) => {
    const view = viewRef.current;
    if (nativeRef.current && view) {
      view.scrollBy({
        left: dir * cardStep(),
        behavior: snap.current ? "auto" : "smooth",
      });
      return;
    }
    goTo(target.current + dir * cardStep());
  };

  // Module-constant data, so the cards are built once. Without this every
  // enabled/disabled flip would reconcile the whole rail.
  const cards = useMemo(
    () =>
      CREATIVES.items.map((item) => (
        <li key={`${item.handle}-${item.caption}`} className="flex snap-start">
          <CreativeCard item={item} />
        </li>
      )),
    [],
  );

  // One enabled look and one disabled look, shared by both discs — the only
  // thing that differs between them is which end they are held against.
  // 75 across from md up. The discs were 48 while the gap between them was set
  // to the design's 50 — so the space read wider than the buttons and the pair
  // looked sparse. Derived from the Figma crop: the 50-unit measurement spans
  // ~78px there, i.e. a scale of 1.56, and each disc spans ~117px = ~75 units.
  // Disc and gap are ONE setting; changing either alone breaks the ratio again.
  // `size-12` (48) stays as the phone value.
  const ARROW =
    "flex size-12 items-center justify-center rounded-full bg-white/25 text-white transition-[background-color,color,transform] duration-200 ease-out hover:bg-white hover:text-black active:scale-90 disabled:pointer-events-none disabled:bg-white/[0.06] disabled:text-white/25 md:size-[4.6875rem]";

  return (
    <div>
      {/* Full-bleed: the clip box is the screen, so cards cross the entire
          display instead of disappearing at the column's edge. */}
      {/* No pointer handlers and no grab cursor — `overflow-hidden` is what
          makes the arrows the only way through once JS is up. Note the two
          modes: before hydration this is a plain overflow-x scroller so the
          rail is not a dead box without JavaScript, and the moment React takes
          over it becomes the clipped, transform-driven track. */}
      {/* Two modes, and the pre-hydration render is the same box as the phone
          one: a plain snap scroller, so the rail is never a dead box without
          JavaScript and a phone simply keeps it. Only a pointer viewport swaps
          to the clipped, transform-driven track once React takes over.

          `scroll-pl` puts the snap positions on the CONTENT column rather than
          the screen edge — the track's own left gutter is padding, so without
          it every card would come to rest a gutter to the left of where the
          heading above it starts. `overscroll-x-contain` keeps a flick that
          runs off the end from turning into a browser back-swipe. */}
      <div
        ref={viewRef}
        style={{ scrollPaddingLeft: RAIL_GUTTER }}
        className={
          enhanced && !native
            ? "overflow-hidden"
            : "scroll-row snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
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
          {cards}
        </ul>
      </div>

      {/* Timeline row: travel from first card to last on the left, prev/next
          discs on the right. Back inside the column, so it lines up with the
          heading and the first card. */}
      <div className={`${SHELL} mt-6 flex items-center gap-8`}>
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
          {/* Scaled from the left on the same frame as the track — no width
              animation, no transition, no second clock. */}
          <div
            ref={fillRef}
            className="h-full w-full origin-left rounded-full bg-white will-change-transform"
            style={{ transform: `scaleX(${PROGRESS_FLOOR})` }}
          />
        </div>

        {/* 50 between the two discs from md up, per Figma. `gap-3` is the phone
            value and stays — 50 between them on a 375 viewport would push the
            pair off the progress line. */}
        <div className="flex items-center gap-3 md:gap-[3.125rem]">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={ends.start}
            aria-label="Previous creatives"
            className={ARROW}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-6 stroke-current md:size-[2.375rem]" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={ends.end}
            aria-label="Next creatives"
            className={ARROW}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-6 stroke-current md:size-[2.375rem]" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
