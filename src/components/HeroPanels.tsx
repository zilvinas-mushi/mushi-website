import { HERO_PANELS } from "@/lib/content";

/**
 * Stat panels drifting in from the hero's left and right edges.
 *
 * In the design these are cropped by the viewport — only part of each panel is
 * ever visible — so they are pinned past the edge with a negative offset and
 * allowed to be clipped by the hero's own overflow-hidden. That crop is the
 * effect, not an accident.
 *
 * Hidden below xl: at narrower widths they would either collide with the
 * headline or be cropped to a meaningless sliver.
 */
export function HeroPanels() {
  return (
    // z-[2]: above the grid and rays, below the platform icons — in the design
    // the Instagram and TikTok marks sit ON TOP of these panels. Relying on DOM
    // order alone was fragile, since backdrop-filter here opens its own
    // stacking context.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] hidden xl:block"
    >
      {HERO_PANELS.map((p, i) => (
        <article
          key={`${p.side}-${i}`}
          className={`absolute w-[310px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-[2px] ${
            p.side === "left" ? "left-[-96px]" : "right-[-96px]"
          }`}
          style={{ top: p.top, transform: `rotate(${p.rotate})` }}
        >
          <h3 className="text-[17px] font-semibold leading-tight text-white/95">
            {p.title}
          </h3>

          {/* Hairline rule under the title, as in the design. */}
          <span className="mt-2.5 block h-px w-full bg-white/15" />

          <div className="mt-2.5 flex items-start justify-between gap-3">
            <ul className="space-y-0.5">
              {p.lines.map((line) => (
                <li key={line} className="text-[12px] leading-snug text-white/55">
                  {line}
                </li>
              ))}
            </ul>
            {p.emoji && (
              <span className="shrink-0 text-[21px] leading-none">{p.emoji}</span>
            )}
          </div>

          {/* Two readouts, matching the design: the score panel uses a
              level meter of many thin segments filling left to right, the
              analysis panel a few tall columns. */}
          {p.meter > 0 ? (
            <div className="mt-3.5 flex h-[26px] items-stretch gap-[3px]">
              {Array.from({ length: p.meter }, (_, j) => (
                <span
                  key={j}
                  className="flex-1 rounded-[2px]"
                  style={{
                    background: `rgba(255,255,255,${0.07 + (j / p.meter) * 0.2})`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3.5 flex h-[52px] items-end gap-2.5">
              {p.bars.map((h, j) => (
                <span
                  key={j}
                  className="flex-1 rounded-[4px] bg-gradient-to-t from-white/10 to-white/30"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          )}
        </article>
      ))}

      {/*
        Right edge, from the reference: a revenue stat card up top and a
        "Trending Video" list card below, both cropped by the viewport like
        the left panels. These are unique one-offs, so they live here rather
        than being forced into the meter/bars data shape.
      */}
      <article className="absolute right-[-84px] top-[14%] w-[300px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-[2px] [transform:rotate(7deg)]">
        <div className="flex items-center justify-between">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-4 stroke-white/85">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[12px] font-medium text-white/70">
            +2
          </span>
        </div>
        <p className="mt-3 text-[12px] leading-snug text-white/55">
          Total Revenue (last 7 days)
        </p>
        <p className="mt-1 text-[30px] font-semibold leading-none tracking-tight text-white">
          $6,240.28
        </p>
      </article>

      <article className="absolute bottom-[10%] right-[-84px] w-[300px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-[2px] [transform:rotate(-6deg)]">
        <h3 className="text-[17px] font-semibold leading-tight text-white/95">
          Trending Video
        </h3>
        <span className="mt-2.5 block h-px w-full bg-white/15" />
        <ul className="mt-3 space-y-2.5">
          {["Video 1", "Video 2", "Video 3"].map((v, i) => (
            <li key={v} className="flex items-center gap-3">
              <span className="h-9 w-14 shrink-0 rounded-[8px] bg-white/10" />
              <span className="flex-1 text-[13px] text-white/70">{v}</span>
              <span className="text-[11px] text-white/40">{["12K", "8K", "4K"][i]}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
