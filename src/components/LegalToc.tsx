"use client";

import { useEffect, useRef } from "react";
import { sectionId } from "@/lib/legal";

/**
 * The table of contents' rail, and how it follows the reader.
 *
 * The frames draw a vertical line with a hollow dot per section and the
 * current one filled. Live, the rail is a PROGRESS LINE: a white fill runs
 * down the line to the reader's place in the text, each dot lights as the
 * fill reaches it and dims again if the reader goes back up, and the dot of
 * the section being read grows a little with a soft halo while its title
 * comes up to full white. The first cut moved a white disc along the line
 * and it slid half over the rings — "not up to par … take inspiration from
 * Apple" (Žilvinas 2026-10-10). Nothing overlaps now: the line fills, the
 * dots change state.
 *
 * The reader's place is a third of the way down the window: the fill ends
 * at the dot of the last heading above that line, carried on towards the
 * next in proportion to how far through the section the line is. The fill
 * does not jump to that place — it eases there, closing a fifth of the
 * remaining distance each frame — so a flick of the wheel reads as a glide,
 * not a snap, the way Apple's scroll-driven marks move.
 *
 * A CLICK ON AN ENTRY scrolls the page there itself, on one ease-in-out
 * curve over 0.6 to 1.1 seconds by distance, and for that ride the fill is
 * pinned to the page's position frame for frame — no lag behind the
 * browser's own smooth scroll, which was quick and linear and left the
 * rail catching up ("the animation must be much much smoother", same day).
 * The hash still goes into the address bar, without the jump a hash
 * navigation would make. Reduced motion jumps, as the browser would.
 *
 * Server-rendered state is the finished state: fill 0, first dot current.
 * Driven by a scroll listener and direct style writes, no React state —
 * one re-render per scrolled pixel would be the expensive way to move a
 * line. Numbers in rem: 16 design px to the rem at the 1920 frame. The
 * rail is desktop-only, as the phone frames have no sidebar.
 */

/** Where a section's heading lands when scrolled to: under the floating
    header by the same margin the heading's scroll-margin keeps. */
function headingTop(el: HTMLElement) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return el.getBoundingClientRect().top + window.scrollY - margin;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function LegalToc({ titles }: { titles: readonly string[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;
    const headings = titles
      .map((_, i) => document.getElementById(sectionId(i)))
      .filter((el): el is HTMLElement => el !== null);
    const items = [...list.querySelectorAll<HTMLLIElement>("li")];
    const dots = items.map((li) => li.querySelector<HTMLElement>("[data-dot]")!);
    if (headings.length < 2 || dots.length !== headings.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0; // the fill's end, in rail px
    let shown = 0; // where the fill is drawn right now
    let frame = 0;
    let ride = 0; // the click-scroll's own frame, while one runs

    // The dots' rail offsets, measured from the list so the sticky
    // sidebar's own travel cannot feed back in.
    const dotY = () => {
      const top = list.getBoundingClientRect().top;
      return dots.map((d) => {
        const r = d.getBoundingClientRect();
        return r.top - top + r.height / 2;
      });
    };

    const read = () => {
      const line = window.scrollY + window.innerHeight / 3;
      const tops = headings.map((el) => el.getBoundingClientRect().top + window.scrollY);
      let i = 0;
      while (i < tops.length - 1 && tops[i + 1] <= line) i++;
      const span = i < tops.length - 1 ? tops[i + 1] - tops[i] : 0;
      const t = span > 0 ? Math.min(1, Math.max(0, (line - tops[i]) / span)) : 0;
      const ys = dotY();
      const to = i < ys.length - 1 ? ys[i + 1] : ys[i];
      target = ys[i] + (to - ys[i]) * t - ys[0];
      // The dot being read is the one the fill has last passed; the fill
      // itself is where the eye is, so states follow the drawn fill.
      items.forEach((li, k) => {
        const reached = ys[k] - ys[0] <= shown + 0.5;
        li.dataset.state = k === i ? "current" : reached ? "done" : "next";
      });
    };

    const draw = () => {
      frame = 0;
      const gap = target - shown;
      // Pinned to the page during a click's ride: the page is already
      // moving on a curve, and a second ease on top would trail it.
      shown = reduced || ride || Math.abs(gap) < 0.5 ? target : shown + gap * 0.2;
      fill.style.height = `${Math.max(0, shown)}px`;
      read();
      if (Math.abs(target - shown) >= 0.5) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      read();
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // A click rides the page to the heading on one curve, and leaves the
    // hash in the address bar without the jump a hash change would make.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const k = items.findIndex((li) => li.contains(a));
      if (k < 0) return;
      e.preventDefault();
      const el = headings[k];
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const to = Math.min(max, Math.max(0, headingTop(el)));
      history.pushState(null, "", `#${el.id}`);
      if (reduced) {
        window.scrollTo({ top: to, behavior: "instant" });
        schedule();
        return;
      }
      const from = window.scrollY;
      const distance = Math.abs(to - from);
      // 0.6s for a hop to the next section, 1.1s across the whole page.
      const duration = Math.min(1100, Math.max(600, 400 + distance * 0.12));
      const start = performance.now();
      if (ride) cancelAnimationFrame(ride);
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        // "instant", or the page's own `scroll-behavior: smooth` would
        // re-ease every frame of this ride: a crawl, then a lunge.
        window.scrollTo({ top: from + (to - from) * easeInOut(p), behavior: "instant" });
        schedule();
        ride = p < 1 ? requestAnimationFrame(step) : 0;
      };
      ride = requestAnimationFrame(step);
    };

    // EVERY ENTRY FITS THE WINDOW, so each can be pressed (Žilvinas
    // 2026-10-10, Terms' twenty rows running off the foot of a laptop).
    // The rail's gap is the frame's 26 where there is room, and shrinks —
    // never below 6 — until the whole sticky block (heading, rail) fits
    // between its pin under the header and 24 off the window's foot.
    const sticky = list.closest<HTMLElement>("[data-toc-sticky]");
    const fit = () => {
      if (!sticky) return;
      list.style.gap = "";
      const pin = parseFloat(getComputedStyle(sticky).top) || 0;
      const room = window.innerHeight - pin - 24;
      const over = sticky.offsetHeight - room;
      if (over <= 0) return;
      const gap = parseFloat(getComputedStyle(list).gap) || 0;
      const n = items.length - 1;
      if (n <= 0) return;
      list.style.gap = `${Math.max(6, gap - over / n)}px`;
    };
    const onResize = () => {
      fit();
      schedule();
    };

    // First placement is immediate: a reload mid-page must not start the
    // fill at the top and send it gliding down.
    fit();
    read();
    shown = target;
    fill.style.height = `${Math.max(0, shown)}px`;
    read();
    list.addEventListener("click", onClick);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      list.style.gap = "";
      list.removeEventListener("click", onClick);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      if (ride) cancelAnimationFrame(ride);
    };
  }, [titles]);

  return (
    <ol ref={listRef} className="relative mt-[1.375rem] ml-[1.25rem] flex flex-col gap-[1.625rem]">
      {/* The line, from the first dot's centre to the last's: the frame's
          white hairline, dimmed to a track now that a fill runs along it. */}
      <span
        aria-hidden="true"
        className="absolute left-[0.375rem] top-[0.5625rem] bottom-[0.5625rem] w-px bg-white/25"
      />
      {/* The fill: white, down to the reader's place. Height is set by the
          script; it starts at nothing. */}
      <span
        ref={fillRef}
        aria-hidden="true"
        className="absolute left-[0.375rem] top-[0.5625rem] h-0 w-px bg-white"
      />
      {titles.map((title, i) => (
        <li
          key={title}
          data-state={i === 0 ? "current" : "next"}
          className="group relative pl-[1.5rem]"
        >
          {/* The dot: a ring on black until the fill reaches it, then white;
              the current one a touch larger with a soft halo. The change
              eases over 350ms on Apple's ease-out curve. */}
          <span
            data-dot=""
            aria-hidden="true"
            className="absolute left-0 top-[0.15625rem] size-[0.8125rem] rounded-full border border-white/60 bg-black transition-[background-color,border-color,transform,box-shadow] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=done]:border-white group-data-[state=done]:bg-white group-data-[state=current]:scale-[1.3] group-data-[state=current]:border-white group-data-[state=current]:bg-white group-data-[state=current]:shadow-[0_0_0_0.25rem_rgba(255,255,255,0.18)]"
          />
          <a
            href={`#${sectionId(i)}`}
            className="block text-[1.125rem] font-medium leading-[1.125rem] text-white/55 transition-colors duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=current]:text-white group-data-[state=done]:text-white/80 hover:text-white"
          >
            {i + 1}. {title}
          </a>
        </li>
      ))}
    </ol>
  );
}
