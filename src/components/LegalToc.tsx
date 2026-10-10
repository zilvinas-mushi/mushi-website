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
 * Server-rendered state is the finished state: fill 0, first dot current.
 * Driven by a scroll listener and direct style writes, no React state —
 * one re-render per scrolled pixel would be the expensive way to move a
 * line. Numbers in rem: 16 design px to the rem at the 1920 frame. The
 * rail is desktop-only, as the phone frames have no sidebar.
 */
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
      shown = reduced || Math.abs(gap) < 0.5 ? target : shown + gap * 0.2;
      fill.style.height = `${Math.max(0, shown)}px`;
      read();
      if (Math.abs(target - shown) >= 0.5) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      read();
      if (!frame) frame = requestAnimationFrame(draw);
    };
    // First placement is immediate: a reload mid-page must not start the
    // fill at the top and send it gliding down.
    read();
    shown = target;
    fill.style.height = `${Math.max(0, shown)}px`;
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
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
