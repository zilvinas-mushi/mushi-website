import type { CSSProperties } from "react";
import { HERO_PANELS } from "@/lib/content";
import { Img } from "./Img";

/**
 * Stat panels drifting in from the hero's left and right edges.
 *
 * In the design these are cropped by the viewport — only about half of each
 * panel is ever visible — so they are pinned half a card past the edge and
 * allowed to be clipped by the hero's own overflow-hidden. That crop is the
 * effect, not an accident.
 *
 * All four panels are the SAME card: same fill, border, rule, icon and meter.
 * Only the copy and the position differ.
 *
 * ## Sizing
 *
 * Same one-property scheme as SiteHeader: every number below is quoted at the
 * design's 1920 reference and driven from `--k`, which is 100px there.
 *
 *   card   500 x 200, radius 30, 3px border -> 5k x 2k, 0.3k, 0.03k
 *   title  25px                             -> 0.25k
 *   line 1 20px / line 2 15px               -> 0.20k / 0.15k
 *   icon   38 box on a 56 disc              -> 0.38k / 0.56k
 *   meter  22 bars of 14 x 32, radius 5     -> 0.14k x 0.32k, 0.05k
 *
 * The 66px floor is where a card is 330 wide — the size it was built at before
 * these measurements arrived, and about as small as the 15px line can go and
 * stay legible. It only bites below 1267px, and the panels are hidden below xl
 * (1280) anyway, where they would collide with the headline.
 */
const SCALE = { "--k": "clamp(66px, 5.2083vw, 100px)" } as CSSProperties;

/**
 * Bar count.
 *
 * 22 is not a guess: at the design's 14px bar and 6px gap, 22 bars measure
 * 22x14 + 21x6 = 434, which is exactly the card's content width
 * (500 - 2x3 border - 2x30 padding). The row is laid out with justify-between
 * rather than a fixed gap so it keeps spanning the full width if the padding
 * is ever corrected.
 */
const METER_BARS = 22;

/** The rightmost five read as "filled"; see design/TOKENS.md. */
const METER_LIT = 5;

/** The "filled" fill, shared by the lit meter bars and the lit chart columns. */
const LIT = "rgba(255,255,255,0.2)";
const UNLIT = "#222222";

/**
 * Panel 2's column chart: five 20-wide columns, radius 5, on a shared
 * baseline. Heights are design px, so the box is as tall as the tallest (95).
 *
 * The alternating fill is the design's, not a gradient: columns 1, 3 and 5 are
 * white at 20% and columns 2 and 4 are flat #222222 — the same two fills the
 * level meter uses.
 */
const CHART_COLUMNS = [
  { h: 32, fill: LIT },
  { h: 67, fill: UNLIT },
  { h: 60, fill: LIT },
  { h: 95, fill: UNLIT },
  { h: 80, fill: LIT },
];

/** Tallest column — the chart box's height. */
const CHART_HEIGHT = Math.max(...CHART_COLUMNS.map((c) => c.h));

export function HeroPanels() {
  return (
    // z-[2]: above the grid and rays, below the platform icons — in the design
    // the Instagram and TikTok marks sit ON TOP of these panels. Relying on DOM
    // order alone was fragile, since backdrop-filter here opens its own
    // stacking context.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] hidden xl:block"
      style={SCALE}
    >
      {HERO_PANELS.map((p, i) => (
        <article
          key={`${p.side}-${i}`}
          className="absolute flex flex-col rounded-[calc(var(--k)*0.3)] border-solid border-[#222222] bg-[#181818] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)]"
          style={{
            width: "calc(var(--k) * 5)",
            height: "calc(var(--k) * 2)",
            borderWidth: "calc(var(--k) * 0.03)",
            /*
              24 from the card's EDGE to the title, and to the meter at the
              bottom. Preflight puts every element in `border-box`, so the 3px
              border draws inside the 500 x 200 rather than adding to it — which
              is what "inner border" asks for, and why the padding here is 21
              and not 24: 3 border + 21 padding = the 24 that was measured.

              The 30 sides are still an inference, not a measurement — see the
              22-bar fit in design/TOKENS.md.
            */
            padding: "calc(var(--k) * 0.21) calc(var(--k) * 0.3)",
            top: p.top,
            /*
              200 of the card's 500 hangs off the edge, leaving 300 visible.
              That number is measured, not eyeballed: the reference crops the
              three lines to "Score", "ched 10M+ Views" and "ed to be
              Excellent". Reading the hidden substrings' advance widths out of
              the Poppins Medium woff2 (169.8 / 168.3 / 165.7px at 25 / 20 /
              15px), adding the 33px inset (3 border + 30 padding), and solving
              each against the card's -5.09159deg rotation gives -197.9,
              -201.3 and -201.2. Three independent lines agreeing on -200 is
              what makes it trustworthy.
            */
            ...(p.side === "left"
              ? { left: "calc(var(--k) * -2)" }
              : { right: "calc(var(--k) * -2)" }),
            transform: `rotate(${p.rotate})`,
          }}
        >
          <h3
            className="font-medium leading-tight text-white"
            style={{ fontSize: "calc(var(--k) * 0.25)" }}
          >
            {p.title}
          </h3>

          {/* The divider: 2px of solid #9D9D9D at full opacity. Scaled with
              `--k` like the 3px card border, so it stays proportional. */}
          <span
            className="block w-full bg-[#9d9d9d]"
            style={{ height: "calc(var(--k) * 0.02)", marginTop: "calc(var(--k) * 0.1)" }}
          />

          {/*
            Bottom group. `mt-auto` hugs it to the bottom padding, so the meter
            lands exactly 24 from the card's edge and the row exactly 14 above
            it — both fixed, whatever the type metrics do. The leftover slack
            therefore collects between the rule and this group, which is the
            least conspicuous place for it and the only gap here that is not a
            supplied measurement.
          */}
          <div className="mt-auto">
          <div
            className={`flex justify-between ${
              p.linesFromBottom === undefined ? "items-center" : "items-end"
            }`}
            style={{ gap: "calc(var(--k) * 0.2)" }}
          >
            {/*
              Both lines are Poppins Medium; the sizes and the gap between them
              are per-panel, since panel 1 runs 20/15 at a 4 gap and panel 2
              runs 15/15 at 32.

              `linesFromBottom` is measured from the card's EDGE, while this
              block sits inside the 24 bottom inset — hence the subtraction.
              Panel 2's 40 therefore lifts the lines 16 off the row's baseline.
            */}
            <div
              className="min-w-0"
              style={
                p.linesFromBottom === undefined
                  ? undefined
                  : { marginBottom: `calc(var(--k) * ${(p.linesFromBottom - 24) / 100})` }
              }
            >
              {p.lines.map((line, j) => (
                <p
                  key={line.text}
                  className="font-medium leading-snug text-white"
                  style={{
                    fontSize: `calc(var(--k) * ${line.size / 100})`,
                    ...(j > 0 ? { marginTop: `calc(var(--k) * ${p.lineGap / 100})` } : {}),
                  }}
                >
                  {line.text}
                </p>
              ))}
            </div>

            {p.aside === "icon" ? (
              /*
                A 35 x 35 icon dead-centre in a 50 x 50 disc.

                The icon is sized by its own box, not by a font size, so the
                centring is exact geometry rather than a function of some emoji
                font's ascent and descent — that is what kept it sitting low.

                Note the icon carries NO rotation of its own. The -5.09159deg in
                the supplied Figma node is the CARD's rotation, baked into the
                child on export; applying it here as well double-rotated it.
              */
              <span
                className="grid shrink-0 place-items-center rounded-full bg-[#222222]"
                style={{ width: "calc(var(--k) * 0.5)", height: "calc(var(--k) * 0.5)" }}
              >
                <span
                  className="block"
                  style={{ width: "calc(var(--k) * 0.35)", height: "calc(var(--k) * 0.35)" }}
                >
                  <Img src="emoji-sunglasses.png" alt="" width={35} className="h-full w-full" />
                </span>
              </span>
            ) : (
              /*
                Column chart, panel 2's version of the icon slot. It sits
                BESIDE the lines rather than along the bottom — in the
                reference the columns share the lines' vertical band and
                nothing runs under the text, which is also why this panel
                carries no level meter.

                TODO(spec): the 10px gap between columns is the one number here
                still eyeballed. Everything else is measured.
              */
              <span
                className="flex shrink-0 items-end"
                style={{
                  height: `calc(var(--k) * ${CHART_HEIGHT / 100})`,
                  gap: "calc(var(--k) * 0.1)",
                }}
              >
                {CHART_COLUMNS.map((col, j) => (
                  <span
                    key={j}
                    className="block rounded-[calc(var(--k)*0.05)]"
                    style={{
                      width: "calc(var(--k) * 0.2)",
                      height: `calc(var(--k) * ${col.h / 100})`,
                      background: col.fill,
                    }}
                  />
                ))}
              </span>
            )}
          </div>

          {p.meter && (
            /* Level meter, 14 below the second line. */
            <div
              className="flex items-stretch justify-between"
              style={{
                marginTop: "calc(var(--k) * 0.14)",
                height: "calc(var(--k) * 0.32)",
              }}
            >
              {Array.from({ length: METER_BARS }, (_, j) => (
                <span
                  key={j}
                  className="rounded-[calc(var(--k)*0.05)]"
                  style={{
                    width: "calc(var(--k) * 0.14)",
                    background: j >= METER_BARS - METER_LIT ? LIT : UNLIT,
                  }}
                />
              ))}
            </div>
          )}
          </div>
        </article>
      ))}
    </div>
  );
}
