"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CTA_FILL, type HeaderCta } from "./headerCta";

/**
 * The /templates header CTA: "Login" at the top of the page, "Buy Now" once
 * the visitor is reading the sales sections — driven by scroll position, in
 * both directions (client 2026-09-12).
 *
 * Progress runs from 0 to 1 as the viewport's midline travels from the top
 * of the section named by `startId` to the top of the one named by `endId`.
 * Buy Now slides IN FROM THE TOP, pushing Login out below, and the same run
 * reverses on the way back up. When `startId` and `endId` name the SAME
 * section — /templates passes Difference twice (Žilvinas 2026-09-25, "buy
 * now when I move to difference") — progress is a clean 0-or-1 toggle at
 * the midline, and the transition on the column is what turns that flip
 * into a slide instead of a snap: 700ms ease-in-out (Žilvinas 2026-09-25,
 * "smoother, not so fast" — it was 300ms ease-out), still completing while
 * the visitor is at the Difference section.
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
  /**
   * NO SLIDE ON ARRIVAL (Žilvinas 2026-09-26, "when you refresh the page
   * the animation runs again from Login to Buy Now"): a reload halfway down
   * the page lands in the Buy Now state, and the column must be drawn
   * there, not slide there. The transition is only put on the column once
   * the first measurement has painted — and it is TAKEN OFF AGAIN for any
   * JUMP (same day, "sometimes it still happens"): Chrome restores a
   * reload's scroll position late, once the deferred artwork below has
   * laid out, and that restore is a scroll event like any other. So a
   * change of more than half a screen between two measurements — a
   * restore, a hash, a Home/End key — is drawn where it lands, and only
   * scrolling of a human's pace slides the column. lastY is the
   * position the previous measurement was made at.
   */
  const [live, setLive] = useState(false);
  const lastY = useRef(0);
  const arm = useRef(0);

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
      const y = window.scrollY;
      const jump = Math.abs(y - lastY.current) > window.innerHeight / 2;
      lastY.current = y;
      if (jump) {
        // Both states land in one render: the new position, drawn without
        // the transition. Two frames later the transition is back on.
        setLive(false);
        cancelAnimationFrame(arm.current);
        arm.current = requestAnimationFrame(() => {
          arm.current = requestAnimationFrame(() => setLive(true));
        });
      }
      setP(Math.min(1, Math.max(0, prog)));
    };
    const schedule = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update);
    };

    lastY.current = window.scrollY;
    update();
    // Two frames: the first paints the measured state, the second turns
    // the transition on for everything after it.
    arm.current = requestAnimationFrame(() => {
      arm.current = requestAnimationFrame(() => setLive(true));
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf.current) cancelAnimationFrame(raf.current);
      cancelAnimationFrame(arm.current);
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
        className={`absolute left-0 top-0 block h-[200%] w-full ${live ? "transition-transform duration-700 ease-in-out" : ""}`}
        style={{ transform: `translateY(${-(1 - p) * 50}%)` }}
      >
        <a
          href={to.href}
          data-plan={to.sheet ? "" : undefined}
          aria-hidden={!showingTo}
          tabIndex={showingTo ? 0 : -1}
          className={`${face} ${CTA_FILL[to.variant ?? "purple"]}`}
        >
          {to.label}
        </a>
        <a
          href={from.href}
          data-plan={from.sheet ? "" : undefined}
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
