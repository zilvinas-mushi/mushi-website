"use client";

import { useRef, useState } from "react";
import { Img } from "./Img";

/**
 * The stills at the foot of a case study.
 *
 * Desktop: three in a row, nothing to do. Phone: the same three as a strip
 * that scrolls sideways inside the card, bleeding off its right edge, with the
 * frame's 3px line under it as the progress — white for the part travelled.
 *
 * The line is drawn 21.1% white at rest (the frame's own gradient stop), so
 * that is where it starts, and it fills the remaining 78.9% as the strip is
 * dragged to its end. It is rendered at 21.1% on the server too: nothing
 * corrects itself on hydration (CLAUDE.md).
 */
const REST = 21.1;

export function CaseGallery({ items }: { items: readonly { src: string; alt: string }[] }) {
  const strip = useRef<HTMLUListElement>(null);
  const [fill, setFill] = useState(REST);

  return (
    <>
      <ul
        ref={strip}
        role="list"
        onScroll={() => {
          const el = strip.current;
          if (!el) return;
          const max = el.scrollWidth - el.clientWidth;
          setFill(REST + (100 - REST) * (max > 0 ? Math.min(1, el.scrollLeft / max) : 0));
        }}
        className="csd-strip mt-[26px] flex gap-[14px] overflow-x-auto pl-[20px] pr-[20px] md:mt-[2.65625rem] md:gap-[1.1875rem] md:overflow-visible md:pl-[1.875rem] md:pr-0"
      >
        {items.map((item) => (
          <li
            key={item.src}
            className="h-[316px] w-[197px] shrink-0 snap-start overflow-hidden rounded-[15px] bg-[#d9d9d9] md:h-[29.375rem] md:w-[18.3125rem] md:rounded-[0.9375rem]"
          >
            <Img
              src={item.src}
              alt={item.alt}
              sizes="(min-width: 768px) 15vw, 197px"
              className="size-full object-cover"
              draggable={false}
            />
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="mx-[20px] mt-[17.5px] h-[3px] overflow-hidden rounded-full bg-[#3e3e3e] md:hidden"
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${fill}%` }} />
      </div>
    </>
  );
}
