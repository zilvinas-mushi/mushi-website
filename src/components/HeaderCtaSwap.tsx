"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CTA_FILL, type HeaderCta } from "./headerCta";

/**
 * The /templates header CTA: "Login" at the top of the page, "Buy Now" once
 * the visitor is reading the sales sections — driven by scroll position, in
 * both directions (client 2026-09-12).
 *
 * The swap is scroll-LINKED, not a toggle: progress runs from 0 to 1 as the
 * viewport's midline travels from the top of the section named by `startId`
 * (Difference) to the top of the one named by `endId` (Process). Buy Now
 * slides IN FROM THE TOP over that stretch, pushing Login out below; past
 * Process it is fully Buy Now until the end of the page, and scrolling back
 * up runs the same ramp in reverse until Login is back at the hero.
 *
 * Construction: a clipped box the size of the header CTA holding a 200%-tall
 * column — Buy Now in the top half, Login in the bottom — translated between
 * -50% (Login) and 0 (Buy Now). Both faces are real links with the shared
 * CTA_FILL liveries, so each still inverts its own colours on hover
 * (CLAUDE.md); the hidden face is aria-hidden and out of the tab order.
 *
 * No JS, no swap: before hydration this renders Login exactly where the
 * static button was, which is also the correct state at the top of the page.
 */
export function HeaderCtaSwap({
  from,
  to,
  startId,
  endId,
  className,
  style,
}: {
  from: HeaderCta;
  to: HeaderCta;
  /** id of an element inside the section where the swap STARTS (0%). */
  startId: string;
  /** id of an element inside the section where the swap COMPLETES (100%). */
  endId: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [p, setP] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const start = document.getElementById(startId)?.closest("section");
    const end = document.getElementById(endId)?.closest("section");
    if (!start || !end) return;

    const update = () => {
      raf.current = 0;
      // The viewport's midline: the swap begins as Difference reaches it and
      // completes as Process does, so the button always matches what the
      // visitor is actually looking at.
      const line = window.innerHeight / 2;
      const a = start.getBoundingClientRect().top;
      const b = end.getBoundingClientRect().top;
      const prog = b === a ? (a <= line ? 1 : 0) : (line - a) / (b - a);
      setP(Math.min(1, Math.max(0, prog)));
    };
    const schedule = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [startId, endId]);

  const showingTo = p >= 0.5;
  const face =
    "flex h-1/2 w-full items-center justify-center font-semibold leading-none transition-all duration-300 ease-out";

  return (
    <span
      className={`relative block overflow-hidden rounded-[calc(var(--u)*0.15)] ${className ?? ""}`}
      style={style}
    >
      <span
        className="absolute left-0 top-0 block h-[200%] w-full"
        style={{ transform: `translateY(${-(1 - p) * 50}%)` }}
      >
        <a
          href={to.href}
          aria-hidden={!showingTo}
          tabIndex={showingTo ? 0 : -1}
          className={`${face} ${CTA_FILL[to.variant ?? "purple"]}`}
        >
          {to.label}
        </a>
        <a
          href={from.href}
          aria-hidden={showingTo}
          tabIndex={showingTo ? -1 : 0}
          className={`${face} ${CTA_FILL[from.variant ?? "light"]}`}
        >
          {from.label}
        </a>
      </span>
    </span>
  );
}
