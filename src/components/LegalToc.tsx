"use client";

import { useEffect, useRef } from "react";
import { sectionId } from "@/lib/legal";

/**
 * The table of contents' rail: one hollow dot per section on a vertical
 * line, and a white disc that TRAVELS the line with the reader (Žilvinas
 * 2026-10-10: "it kind of connects on the side while you scroll and then
 * that white thing also starts to scroll down as well"). The sidebar itself
 * is sticky (LegalPage), so the rail stays beside the text the whole way.
 *
 * The disc's place is the reader's place: a third of the way down the window
 * is "the line being read", and the disc sits on the dot whose heading has
 * just crossed it, sliding on towards the next in proportion to how far
 * through the section that line is. It starts ON the first dot — that is
 * what the server renders, so the first paint is the finished state
 * (CLAUDE.md) — and it rests on the last once the last heading has crossed.
 *
 * Driven by a scroll listener and a transform, no React state: at the frames
 * a scroll produces, a re-render per pixel would be the expensive way to
 * move 13px. The hollow dots stay put underneath it.
 *
 * Numbers in rem: the desktop scale is 16 design px to the rem (globals.css).
 * The rail is desktop-only — the phone frames have no sidebar.
 */
export function LegalToc({ titles }: { titles: readonly string[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const disc = discRef.current;
    if (!list || !disc) return;
    const headings = titles
      .map((_, i) => document.getElementById(sectionId(i)))
      .filter((el): el is HTMLElement => el !== null);
    const dots = [...list.querySelectorAll<HTMLElement>("[data-dot]")];
    if (headings.length < 2 || dots.length !== headings.length) return;

    let frame = 0;
    const place = () => {
      frame = 0;
      const line = window.scrollY + window.innerHeight / 3;
      // Document positions, so a sticky sidebar's own movement cannot
      // feed back into the reading.
      const tops = headings.map((el) => el.getBoundingClientRect().top + window.scrollY);
      let i = 0;
      while (i < tops.length - 1 && tops[i + 1] <= line) i++;
      const span = i < tops.length - 1 ? tops[i + 1] - tops[i] : 0;
      const t = span > 0 ? Math.min(1, Math.max(0, (line - tops[i]) / span)) : 0;
      // Dots are positioned inside the list, so their offsets are rail
      // offsets whatever the sidebar is doing.
      const listTop = list.getBoundingClientRect().top;
      const y = (d: HTMLElement) => d.getBoundingClientRect().top - listTop;
      const from = y(dots[i]);
      const to = i < dots.length - 1 ? y(dots[i + 1]) : from;
      disc.style.transform = `translateY(${from + (to - from) * t}px)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
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
      {/* The line: a 1px hairline (a physical pixel, so px) down the dots'
          centre, from the first dot's centre to the last's. */}
      <span
        aria-hidden="true"
        className="absolute left-[0.375rem] top-[0.5625rem] bottom-[0.5625rem] w-px bg-white"
      />
      {/* The travelling disc, drawn over the first dot until the script
          moves it. Its box is the first dot's box, translated. */}
      <span
        ref={discRef}
        aria-hidden="true"
        className="absolute left-0 top-0 size-[0.8125rem] rounded-full bg-white"
      />
      {titles.map((title, i) => (
        <li key={title} className="relative pl-[1.5rem]">
          <span
            data-dot=""
            aria-hidden="true"
            className="absolute left-0 top-[0.15625rem] size-[0.8125rem] rounded-full border border-white bg-black"
          />
          <a
            href={`#${sectionId(i)}`}
            className="block text-[1.125rem] font-medium leading-[1.125rem] text-white"
          >
            {i + 1}. {title}
          </a>
        </li>
      ))}
    </ol>
  );
}
