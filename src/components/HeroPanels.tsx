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
          className={`absolute w-[330px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[2px] ${
            p.side === "left" ? "left-[-96px]" : "right-[-96px]"
          }`}
          style={{ top: p.top, transform: `rotate(${p.rotate})` }}
        >
          <h3 className="text-[19px] font-semibold leading-tight text-white">
            {p.title}
          </h3>

          {/* Hairline rule under the title, as in the design. */}
          <span className="mt-2.5 block h-px w-full bg-white/15" />

          <div className="mt-2.5 flex items-start justify-between gap-3">
            <ul className="space-y-0.5">
              {p.lines.map((line) => (
                <li key={line} className="text-[13.5px] leading-snug text-white/60 first:text-white/85">
                  {line}
                </li>
              ))}
            </ul>
            {p.emoji && (
              <span className="shrink-0 text-[24px] leading-none">{p.emoji}</span>
            )}
          </div>

          {/* Two readouts, matching the design: the score panel uses a
              level meter of many thin segments filling left to right, the
              analysis panel a few tall columns. */}
          {p.meter > 0 ? (
            <div className="mt-4 flex h-[32px] items-stretch gap-[5px]">
              {Array.from({ length: p.meter }, (_, j) => (
                <span
                  key={j}
                  className="flex-1 rounded-[5px]"
                  style={{
                    background: `rgba(255,255,255,${0.09 + (j / p.meter) * 0.26})`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex h-[58px] items-end gap-2.5">
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
      <article className="absolute right-[-84px] top-[14%] w-[300px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[2px] [transform:rotate(7deg)]">
        <div className="flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.06]">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" className="size-[18px] stroke-white/90">
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

      {/*
        Trending Video — a real horizontal bar chart, as the reference shows:
        an icon tile beside the title, three labelled bars, dashed vertical
        gridlines at 0 / 2K / 4K / 8K with axis labels underneath. Everything
        is text and CSS, so it stays sharp at any zoom.
      */}
      <article className="absolute bottom-[10%] right-[-84px] w-[320px] rounded-[18px] border border-white/10 bg-[#221f2c]/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[2px] [transform:rotate(-6deg)]">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.06]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              className="size-[18px] stroke-white/90"
            >
              <path strokeLinecap="round" d="M7 17v-6M12 17V7M17 17v-4" />
            </svg>
          </span>
          <h3 className="text-[19px] font-semibold leading-tight text-white">
            Trending Video
          </h3>
        </div>

        {(() => {
          const ROWS = [
            { label: "Video 1", w: 62 },
            { label: "Video 2", w: 84 },
            { label: "Video 3", w: 38 },
          ];
          const TICKS = [
            { x: 0, t: "0" },
            { x: 33.3, t: "2K" },
            { x: 66.6, t: "4K" },
            { x: 96, t: "8K" },
          ];
          return (
            <div className="mt-4">
              <div className="grid grid-cols-[auto_1fr] items-stretch gap-x-3">
                <div className="flex flex-col justify-between">
                  {ROWS.map((r) => (
                    <span
                      key={r.label}
                      className="text-[13px] leading-[24px] text-white/75"
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
                <div className="relative">
                  {TICKS.map(({ x }) => (
                    <span
                      key={x}
                      aria-hidden="true"
                      className="absolute inset-y-0 border-l border-dashed border-white/15"
                      style={{ left: `${x}%` }}
                    />
                  ))}
                  <div className="relative flex h-full flex-col justify-between">
                    {ROWS.map((r) => (
                      <span key={r.label} className="flex h-[24px] items-center">
                        <span
                          className="block h-[13px] rounded-[4px] bg-white/[0.22]"
                          style={{ width: `${r.w}%` }}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3">
                <span aria-hidden="true" className="invisible text-[13px]">
                  Video 1
                </span>
                <div className="relative h-5">
                  {TICKS.map(({ x, t }) => (
                    <span
                      key={t}
                      className="absolute top-1 -translate-x-1/2 text-[11px] text-white/45"
                      style={{ left: `${x}%` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </article>
    </div>
  );
}
