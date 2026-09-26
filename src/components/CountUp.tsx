"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up to itself the first time it scrolls into view
 * (Žilvinas 2026-09-26, "that cool animation for prices, the way the best
 * brands do it — don't make it look scammy", then "premium and subtle,
 * improve a little more"). The restraint is the point:
 *
 * - ONCE, 1.4s on an exponential ease-out: the number covers most of its
 *   distance in the first third and spends the rest settling, with no
 *   overshoot and no flicker of random digits.
 * - The whole figure fades up 6px into place as it starts (700ms), so the
 *   count reads as the number arriving, not a counter running.
 * - SMALL NUMBERS DO NOT COUNT. 0-1-2-3-4-5 in a second is a slot machine;
 *   anything under 20 only gets the fade-up.
 * - Tabular figures hold the width, so nothing around it shifts.
 *
 * `value` is the finished string — "24/7", "-520 hours", "$5", "50+ NEW".
 * The first run of digits is what counts; everything around it (the sign,
 * the "$", the "/7", the " hours") is printed as-is from the start.
 *
 * FINISHED-LOOKING OR INVISIBLE (CLAUDE.md): the server renders the final
 * value in place. On the client, an element already on screen keeps it and
 * never animates (a reload halfway down the page never shows a number
 * correcting itself); one still below the fold is hidden until it enters
 * the viewport, and arrives with the fade-up. Reduced motion turns it all
 * off.
 */
const COUNT_FROM = 20;

export function CountUp({ value, className }: { value: string; className?: string }) {
  const m = /^([^0-9]*?)([0-9][0-9,]*)([^]*)$/.exec(value);
  const target = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const [shown, setShown] = useState(target);
  const [phase, setPhase] = useState<"done" | "armed" | "running">("done");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    // Already on screen: leave it be.
    if (r.bottom > 0 && r.top < window.innerHeight) return;

    let raf = 0;
    setPhase("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const counts = target >= COUNT_FROM;
        setShown(counts ? 0 : target);
        setPhase("running");
        if (!counts) return;
        const t0 = performance.now();
        const ms = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setShown(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  if (!m) return <span className={className}>{value}</span>;
  const reveal =
    phase === "armed"
      ? "translate-y-[6px] opacity-0"
      : phase === "running"
        ? "translate-y-0 opacity-100 transition-[opacity,translate] duration-700 ease-out"
        : "";
  return (
    <span ref={ref} className={`inline-block ${reveal} ${className ?? ""}`}>
      {m[1]}
      <span className="tabular-nums">{shown.toLocaleString("en-US")}</span>
      {m[3]}
    </span>
  );
}
