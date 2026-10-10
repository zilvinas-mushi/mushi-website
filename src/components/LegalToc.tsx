"use client";

import { useEffect, useState } from "react";
import { sectionId } from "@/lib/legal";

/**
 * The table of contents' rail: one dot per section on a vertical line, the
 * current section's dot filled white, the rest black with a white ring —
 * the Figma frames' sidebar (design/LEGAL.md).
 *
 * WHICH DOT IS FILLED is the only moving part. The frames draw the first one
 * filled, and that is what this renders on the server, so the first paint IS
 * the finished state (CLAUDE.md: nothing reveals or corrects itself a frame
 * later). After hydration an IntersectionObserver moves the fill to whichever
 * section's heading was last to cross the upper third of the viewport, so a
 * reader halfway down Terms sees "11." lit rather than "1." forever.
 *
 * Numbers in rem: the desktop scale is 16 design px to the rem (globals.css).
 * The rail is desktop-only — the phone frames have no sidebar.
 */
export function LegalToc({ titles }: { titles: readonly string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const headings = titles
      .map((_, i) => document.getElementById(sectionId(i)))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // The section in view is the last heading above the line a third of the
    // way down the window. Recomputed on every crossing of that line.
    const pick = () => {
      const line = window.innerHeight / 3;
      let index = 0;
      headings.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) index = i;
      });
      setCurrent(index);
    };
    const observer = new IntersectionObserver(pick, {
      rootMargin: "-33.333% 0px -66.666% 0px",
      threshold: 0,
    });
    headings.forEach((el) => observer.observe(el));
    pick();
    return () => observer.disconnect();
  }, [titles]);

  return (
    <ol className="relative mt-[1.375rem] ml-[1.25rem] flex flex-col gap-[1.625rem]">
      {/* The line: a 1px hairline (a physical pixel, so px) down the dots'
          centre, from the first dot's centre to the last's. */}
      <span
        aria-hidden="true"
        className="absolute left-[0.375rem] top-[0.5625rem] bottom-[0.5625rem] w-px bg-white"
      />
      {titles.map((title, i) => (
        <li key={title} className="relative pl-[1.5rem]">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-[0.15625rem] size-[0.8125rem] rounded-full border border-white transition-colors duration-200 ${
              i === current ? "bg-white" : "bg-black"
            }`}
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
