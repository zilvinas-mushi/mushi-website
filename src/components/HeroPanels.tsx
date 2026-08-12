import type { CSSProperties } from "react";
import { HERO_PANELS, type HeroPanel } from "@/lib/content";
import { Img } from "./Img";

/**
 * Stat panels drifting in from the hero's left and right edges.
 *
 * In the design these are cropped by the viewport — only about half of each
 * panel is ever visible — so they are pinned half a card past the edge and
 * allowed to be clipped by the hero's own overflow-hidden. That crop is the
 * effect, not an accident.
 *
 * All four share the CHROME — fill, border, radius, the 24/24 vertical inset
 * and the 2px divider. What sits inside does not: each has its own body
 * component below, picked by `p.variant`.
 *
 *   stat      panels 1 and 2 — title, two lines, an aside, sometimes a meter
 *   revenue   panel 3 — arrow disc, a label over a figure, a badge
 *   trending  panel 4 — icon and title, then a horizontal bar chart
 *
 * ## Sizing
 *
 * Same one-property scheme as SiteHeader: every number is quoted at the
 * design's 1920 reference and driven from `--k`, which is 100px there.
 *
 *   card   500 x 200, radius 30, 3px border -> 5k x 2k, 0.3k, 0.03k
 *   title  25px                             -> 0.25k
 *
 * Per-panel numbers live in design/TOKENS.md rather than here, because they
 * differ far more than they agree.
 *
 * The clamp itself is --hero-u on :root, shared with the platform tiles in
 * Sections.tsx. Its 66px floor is where a card is 330 wide — about as small as
 * the 15px line can go and stay legible. That only bites below 1267px, and the
 * panels are hidden below xl (1280) anyway.
 */
const SCALE = { "--k": "var(--hero-u)" } as CSSProperties;

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
          className="absolute flex flex-col rounded-[calc(var(--k)*0.3)] border-solid border-[#222222] bg-[#181818]"
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
              ? { left: `calc(var(--k) * ${-(p.edgeOffset ?? 2)})` }
              : { right: `calc(var(--k) * ${-(p.edgeOffset ?? 2)})` }),
            transform: `rotate(${p.rotate})`,
          }}
        >
          {p.variant === "revenue" ? (
            <RevenueBody p={p} />
          ) : p.variant === "trending" ? (
            <TrendingBody p={p} />
          ) : (
            <StatBody p={p} />
          )}
        </article>
      ))}
    </div>
  );
}

/** Panels 1 and 2: title, divider, two lines, an aside, sometimes a meter. */
function StatBody({ p }: { p: Extract<HeroPanel, { variant: "stat" }> }) {
  return (
    <>
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
    </>
  );
}

/**
 * Panel 3: an arrow in a disc, then a small label over a large figure with a
 * badge beside it. No title and no divider — it shares only the card chrome.
 */
function RevenueBody({ p }: { p: Extract<HeroPanel, { variant: "revenue" }> }) {
  return (
    <>
      {/*
        27 x 27 arrow centred in a 60 x 60 disc. `self-start` matters: a
        flex column stretches its children across, which would have pulled
        the disc to the full card width.

        The disc is 60 here against panel 1's 50 — the design's own
        inconsistency, not a mistake to normalise away.
      */}
      <span
        className="grid shrink-0 self-start place-items-center rounded-full bg-[#222222]"
        style={{ width: "calc(var(--k) * 0.6)", height: "calc(var(--k) * 0.6)" }}
      >
        {/*
          The supplied node is a 38 x 28 viewBox, so it is drawn into a 27 x 27
          box under the default `xMidYMid meet` rather than stretched to fill
          it: scaling to fit keeps the arrow's proportions and its round stroke
          caps circular.

          The viewBox is built around the arrow's SHAFT MIDPOINT, not its
          bounding box — that is the whole trick, and centring on the bounding
          box is why this read wrong twice.

          The eye takes a line-art arrow's centre to be the middle of its long
          stroke. Its bounding box disagrees: the arrowhead's lower barb reaches
          about 5 units further down than the shaft does, which drags the box
          down, so centring the BOX pushes the arrow 1.88px UP on screen.

          The two agree exactly in x (both 18.8535), so only y moves. The box
          below is symmetric about the shaft midpoint (18.8535, 10.971) and
          sized to still contain every bit of ink — the four path points
          expanded by the 2 stroke radius, y 0.000..27.197 — so nothing clips.
        */}
        <svg
          viewBox="0.0005 -5.2543 37.7060 32.4512"
          fill="none"
          aria-hidden="true"
          /*
            Sized so the ARROW is 27, not its box. In a 27 x 27 box the
            artwork's 1.386:1 aspect left it 27 wide but only 19.5 tall — the
            box was square, the arrow was not, and `meet` letterboxed the
            difference. Scaling until the short side reaches 27 makes it
            37.4 x 27.0, which still clears the 60 disc (diagonal 46.2).

            The two numbers below are the shaft-centred viewBox at that scale,
            so the centring above is untouched.
          */
          style={{
            width: "calc(var(--k) * 0.374336)",
            height: "calc(var(--k) * 0.322167)",
          }}
        >
          <path
            d="M35.7065 2.0004L2.00052 19.9422M7.25522 2.72631L2.00052 19.9422L19.2164 25.1969"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* `amountFromBottom` is measured from the card's EDGE and this block
          sits inside the 24 bottom inset, so the two differ by that inset —
          the same arrangement panel 2's `linesFromBottom` uses. */}
      <div
        className="mt-auto"
        style={{
          marginBottom: `calc(var(--k) * ${(p.amountFromBottom - 24) / 100})`,
        }}
      >
        <p
          className="font-medium leading-snug text-white"
          style={{ fontSize: "calc(var(--k) * 0.15)" }}
        >
          {p.label}
        </p>

        {/*
          The badge sits immediately AFTER the figure, not at the far edge.
          `justify-between` put 156px of air between them — the figure is 208
          wide in a 434 content box — which parked the badge on the card's right
          edge, exactly the part a right-side panel crops off-screen.
        */}
        {/* `items-center`, not `items-end`. The badge is 30 tall against a 43
            figure, so bottom-aligning them dropped it 13 below the figure's
            optical middle and it read as hanging off the number rather than
            sitting beside it. The figure is the taller item either way, so it
            still sets the row's height and `amountFromBottom` is unaffected —
            only the badge moves. */}
        <div className="flex items-center" style={{ gap: "calc(var(--k) * 0.1)" }}>
          {/* `leading-none` so the box hugs the figure: `amountFromBottom` is
              measured to the text's box, and a looser line-height would put
              half-leading between the digits and that edge. */}
          <p
            className="font-medium leading-none text-white"
            style={{ fontSize: "calc(var(--k) * 0.43)" }}
          >
            {p.amount}
          </p>

          {/* 50 x 30, Poppins Regular 25. TODO(spec): the 10 radius is still
              eyeballed. */}
          <span
            className="grid shrink-0 place-items-center rounded-[calc(var(--k)*0.1)] bg-[#222222] font-normal leading-none text-white"
            style={{
              width: "calc(var(--k) * 0.5)",
              height: "calc(var(--k) * 0.3)",
              fontSize: "calc(var(--k) * 0.25)",
            }}
          >
            {p.badge}
          </span>
        </div>
      </div>
    </>
  );
}

/** Panel 4's plot area, design px. Row 2's bar spans it exactly. */
const PLOT_W = 137;
/**
 * Each axis label sits in a 34 x 12 box. Four of them nearly fill PLOT_W.
 *
 * The type is 15px, larger than the 12 box — both numbers are as supplied, and
 * the box is what positions the label and its gridline, not what clips it. The
 * text is centred, so it overflows about 1.5px each way.
 */
const TICK_W = 34;
const TICK_H = 12;
const TICK_FONT = 15;
/** Bar height and the plot's height: three 12s with two 18 gaps. */
const BAR_H = 12;
const PLOT_H = 3 * BAR_H + 2 * 18;

/**
 * Centre of tick `i` within the plot, design px.
 *
 * THE AXIS SPANS THE PLOT: tick 0 sits at x=0, the last at x=PLOT_W. So the
 * first gridline lands exactly on the bars' left edge and the last on the end
 * of row 2's full-width bar, which is what puts the bars and the stripes on one
 * rhythm.
 *
 * It used to be `i * (PLOT_W - TICK_W) / (count - 1) + TICK_W / 2` — the four
 * 34-wide LABEL BOXES laid out justify-between, with the gridlines hung off
 * their centres. That inset the whole axis by half a label box (17px) at each
 * end, so the first stripe fell 17px INSIDE the bars' start and every bar
 * crossed the stripes off-beat. The label box is for typesetting the number;
 * it should never have set where the axis begins.
 *
 * Consequence worth knowing: the outer labels now overhang the plot by about
 * half their box, "0" to the left and "8K" to the right. That is normal axis
 * behaviour — the number is centred on the value it marks — and it is why the
 * labels are positioned absolutely rather than laid out in a flex row.
 */
const tickCentre = (i: number, count: number) => (i * PLOT_W) / (count - 1);

/**
 * Where a bar of value `k` (thousands) ends, in design px across the plot.
 *
 * The axis is NOT linear: its labels run 0, 2K, 4K, 8K while the ticks sit at
 * equal spacing, so the last segment covers twice the value of the ones before
 * it. `k / max * PLOT_W` would therefore put every bar in the wrong place. The
 * value is interpolated between the two ticks it falls between instead.
 *
 * Values past the last tick extrapolate at the final segment's rate rather than
 * clamping — row 2 is 9K on an 8K axis and is supposed to run past the last
 * gridline, exactly as the Figma card shows it.
 */
function barX(k: number, ticks: string[]) {
  // "2K" -> 2. parseFloat stops at the K, which is all this needs.
  const values = ticks.map((t) => parseFloat(t));
  const last = values.length - 1;
  // The segment whose lower tick is the biggest one not above `k`, capped so an
  // out-of-range value extrapolates off the final segment instead of falling
  // out of the loop.
  let i = 0;
  while (i < last - 1 && values[i + 1] <= k) i += 1;

  const span = values[i + 1] - values[i];
  const t = span === 0 ? 0 : (k - values[i]) / span;
  const x0 = tickCentre(i, ticks.length);
  const x1 = tickCentre(i + 1, ticks.length);
  return x0 + t * (x1 - x0);
}

/**
 * Panel 4: an icon beside the title, the divider, then a horizontal bar chart.
 *
 * The labels and the bars are two `justify-between` columns of the same height
 * rather than three label+bar rows, because the dashed gridlines have to run
 * unbroken across all three — they belong to the plot, not to any one row. The
 * label boxes are therefore set to BAR_H so the two columns step in lockstep.
 */
function TrendingBody({ p }: { p: Extract<HeroPanel, { variant: "trending" }> }) {
  return (
    <>
      <div className="flex items-center" style={{ gap: "calc(var(--k) * 0.1)" }}>
        {/*
          28.5 x 28.5. The node's viewBox is square, so it scales without
          distortion — unlike panel 3's arrow.

          The +15deg undoes a rotation baked into the ARTWORK. Unlike panel 3's
          arrow, which Figma exported in local coordinates, this node came out
          with the card's -15 already applied: its outer square's edge sits at
          -15.00 from horizontal and all three bars at 15.00 from vertical, too
          exact to be anything else. Inheriting the card's -15 on top of that
          drew it at -30, twice the intended tilt.

          Note this counter-rotation tracks the ARTWORK, not the card. If the
          card's rotation changes the bake does not, so this stays 15.
        */}
        <svg
          viewBox="0 0 35 35"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
          style={{
            width: "calc(var(--k) * 0.285)",
            height: "calc(var(--k) * 0.285)",
            rotate: "15deg",
          }}
        >
          <path
            d="M11.6482 20.5245L13.2874 26.642M23.0637 14.1874L25.5224 23.3637M15.307 9.70902L19.4049 25.0028M14.6207 32.8415L27.4675 29.3992C30.0371 28.7107 31.3219 28.3664 32.1694 27.6034C32.9148 26.9322 33.4287 26.0422 33.6372 25.061C33.8743 23.9456 33.53 22.6608 32.8415 20.0912L29.3992 7.24436C28.7107 4.67475 28.3664 3.38995 27.6034 2.54249C26.9322 1.79704 26.0422 1.28321 25.061 1.07466C23.9456 0.83756 22.6608 1.18182 20.0912 1.87034L7.24436 5.31264C4.67475 6.00116 3.38995 6.34542 2.54249 7.10848C1.79704 7.77969 1.28321 8.66966 1.07466 9.65084C0.83756 10.7663 1.18182 12.0511 1.87034 14.6207L5.31264 27.4675C6.00116 30.0371 6.34542 31.3219 7.10848 32.1694C7.77969 32.9148 8.66966 33.4287 9.65084 33.6372C10.7663 33.8743 12.0511 33.53 14.6207 32.8415Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3
          className="font-medium leading-tight text-white"
          style={{ fontSize: "calc(var(--k) * 0.25)" }}
        >
          {p.title}
        </h3>
      </div>

      {/* Same divider as every other panel: 2px of solid #9D9D9D. */}
      <span
        className="block w-full bg-[#9d9d9d]"
        style={{ height: "calc(var(--k) * 0.02)", marginTop: "calc(var(--k) * 0.1)" }}
      />

      <div className="mt-auto">
        <div className="flex" style={{ gap: "calc(var(--k) * 0.12)" }}>
          <div
            className="flex flex-col justify-between"
            style={{ height: `calc(var(--k) * ${PLOT_H / 100})` }}
          >
            {p.rows.map((r) => (
              <span
                key={r.label}
                className="flex items-center whitespace-nowrap font-medium leading-none text-white"
                style={{
                  height: `calc(var(--k) * ${BAR_H / 100})`,
                  fontSize: "calc(var(--k) * 0.15)",
                }}
              >
                {r.label}
              </span>
            ))}
          </div>

          <div
            className="relative shrink-0"
            style={{
              width: `calc(var(--k) * ${PLOT_W / 100})`,
              height: `calc(var(--k) * ${PLOT_H / 100})`,
            }}
          >
            {/*
              Drawn as a repeating gradient, NOT `border-dashed`.

              Figma's stroke settings, exactly: #9D9D9D at 100%, weight 1,
              style Dashed, DASH 5 GAP 5. Hence the 0.05 / 0.10 stops — 5 on,
              5 off, a 10 period.

              CSS's `border-dashed` cannot express that: it derives its own
              pattern from the border width, so a 1px line came out a dotted
              hairline — far too fine, and at the 25% white it used to carry,
              far too faint. That is why they barely read as dashes at all.

              A gradient is the only way to state the dash length outright.

              NO -translate-x-1/2. Centring each line ON its tick put HALF of
              the first one at x = -0.5, outside the bars, so a hairline of it
              stayed visible down the left edge no matter how wide the bars got
              — the bars are supposed to bury that line completely. Left-edge
              alignment puts it at [0, 1], fully inside them.

              MIN 1px WIDE. `calc(var(--k) * 0.01)` alone is 0.76px at the
              panel's live scale, i.e. sub-pixel: each line then antialiases
              differently depending on where its fractional x lands, so the four
              rendered at visibly different weights — some crisp, some ghosted.
              The max() guarantees every line covers a whole device pixel and
              they all come out identical.
            */}
            {p.ticks.map((t, j) => (
              <span
                key={t}
                aria-hidden="true"
                className="absolute inset-y-0"
                style={{
                  left: `calc(var(--k) * ${tickCentre(j, p.ticks.length) / 100})`,
                  width: "max(1px, calc(var(--k) * 0.01))",
                  background:
                    "repeating-linear-gradient(to bottom, #9d9d9d 0, #9d9d9d calc(var(--k) * 0.05), transparent calc(var(--k) * 0.05), transparent calc(var(--k) * 0.1))",
                }}
              />
            ))}
            <div className="relative flex h-full flex-col justify-between">
              {p.rows.map((r) => (
                /* SQUARE ENDS — corner radius 0, per Figma. It was 5, the house
                   chip radius, applied here by default; on a 12-tall bar that
                   rounds a quarter of the height at each end and reads as a
                   lozenge. These are plot bars, not chips. */
                <span
                  key={r.label}
                  className="block"
                  style={{
                    width: `calc(var(--k) * ${barX(r.k, p.ticks) / 100})`,
                    height: `calc(var(--k) * ${BAR_H / 100})`,
                    background: UNLIT,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Axis. The invisible label reserves exactly the label column's width
            so the ticks stay under the plot without hardcoding that width. */}
        <div className="flex" style={{ gap: "calc(var(--k) * 0.12)" }}>
          <span
            aria-hidden="true"
            className="invisible whitespace-nowrap font-medium leading-none"
            style={{ fontSize: "calc(var(--k) * 0.15)" }}
          >
            {p.rows[0].label}
          </span>
          {/* Absolutely positioned on the SAME tickCentre() the gridlines use,
              so a label can never drift off its stripe. A justify-between flex
              row cannot do that once the axis spans the full plot: it would
              have to let the outer boxes hang past both edges, which flex will
              not do. */}
          <div
            className="relative shrink-0"
            style={{
              width: `calc(var(--k) * ${PLOT_W / 100})`,
              height: `calc(var(--k) * ${TICK_H / 100})`,
              marginTop: "calc(var(--k) * 0.06)",
            }}
          >
            {p.ticks.map((t, j) => (
              /* FULL WHITE. These were white/70 and read as half-faded next to
                 the row labels, which are solid. Nothing in the design dims
                 them — the 70% was doing the job the 25% on the gridlines
                 already does, and it made the numbers look like a mistake. */
              <span
                key={t}
                className="absolute grid -translate-x-1/2 place-items-center font-medium leading-none text-white"
                style={{
                  left: `calc(var(--k) * ${tickCentre(j, p.ticks.length) / 100})`,
                  width: `calc(var(--k) * ${TICK_W / 100})`,
                  height: `calc(var(--k) * ${TICK_H / 100})`,
                  fontSize: `calc(var(--k) * ${TICK_FONT / 100})`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
