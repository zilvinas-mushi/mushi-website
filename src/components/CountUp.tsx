"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up to itself the first time it scrolls into view
 * (Žilvinas 2026-09-26, "that cool animation for prices, the way the best
 * brands do it — don't make it look scammy"). The restraint is the point:
 * ONCE, 1.1s on an ease-out that spends most of its time near the final
 * value, no bouncing past it, no flicker of random digits, and the width
 * held steady with tabular figures so nothing around it shifts.
 *
 * `value` is the finished string — "24/7", "-520 hours", "$5", "50+ NEW".
 * The first run of digits is what counts; everything around it (the sign,
 * the "$", the "/7", the " hours") is printed as-is from the start.
 *
 * FINISHED-LOOKING FROM THE FIRST PAINT (CLAUDE.md): the server renders the
 * final value, and the count only starts when the element ENTERS the
 * viewport — an element that is already on screen when the script runs
 * (a reload halfway down the page) keeps its final value and never
 * animates, so a visitor never sees a number correct itself. Reduced
 * motion turns it off entirely.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const m = /^([^0-9]*?)([0-9][0-9,]*)([^]*)$/.exec(value);
  const target = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const [shown, setShown] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    // Already on screen: leave it be.
    if (r.bottom > 0 && r.top < vh) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done.current) return;
        done.current = true;
        io.disconnect();
        const t0 = performance.now();
        const ms = 1100;
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          const eased = 1 - Math.pow(1 - t, 4);
          setShown(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
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
  return (
    <span ref={ref} className={className}>
      {m[1]}
      <span className="tabular-nums">{shown.toLocaleString("en-US")}</span>
      {m[3]}
    </span>
  );
}
