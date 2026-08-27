import { Img } from "./Img";
import { TrustBadges } from "./TrustBadges";
import { CreativesRail } from "./CreativesRail";
import {
  HERO,
  SOCIAL_PROOF,
  CREATIVES,
  CASE_STUDIES,
  TESTIMONIALS,
  FINAL_CTA,
} from "@/lib/content";
import { BOOKING_ANCHOR, BOOKING_URL } from "@/lib/site";
import { SHELL } from "@/lib/layout";

/**
 * CTA pill. Label is uppercased with tracking to match the design — the
 * buttons read as small-caps chips, not sentence-case links.
 */
/**
 * The disc at the right-hand end of a primary CTA, and the two things it does
 * on hover.
 *
 * ## The inversion
 *
 * These CTAs do NOT invert the way every other button on the site does — they
 * do not go white. The purple and the disc's grey trade places instead: on
 * hover the whole button takes the disc's #222222 and the disc takes the
 * button's violet, so the same two colours are still on screen in the same
 * amounts, just swapped (Noah 2026-08-19; recorded in CLAUDE.md as the second
 * exception to the inversion rule). The label and the arrow stay white
 * throughout, which is what keeps both readable at both ends of the swap.
 *
 * BOTH fills are three-stop gradients at the same three positions, even the
 * flat greys. A two-stop fill against a three-stop one cannot interpolate and
 * the browser snaps at the halfway point no matter what the transition says —
 * the same trap the rest of this file's hover states document.
 *
 * ## The arrow
 *
 * On hover the arrow leaves along its own diagonal and a second one arrives
 * from behind it. Two copies of the same glyph in one grid cell: the first
 * starts at rest and exits up-and-right, the second starts down-and-left and
 * lands at rest. 180% of the box carries each one clear of a disc that is
 * barely wider than the glyph, and `overflow-hidden` on the disc is what makes
 * them appear and disappear at its edge rather than beyond it.
 *
 * The incoming one is held back 75ms so the two read as a relay rather than as
 * one arrow sliding across.
 */
function ArrowDisc({
  disc,
  arrow,
  viewBox,
  strokeWidth,
}: {
  disc: string;
  arrow: string;
  viewBox: string;
  strokeWidth: number;
}) {
  const glyph = (
    <path d="M0.999888 15.9999L15.9998 1M15.9998 14.1708L15.9998 1L2.82898 1" />
  );
  const shared = `${arrow} col-start-1 row-start-1 stroke-current transition-transform duration-300 ease-out`;
  return (
    <span
      className={`${disc} relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(117.51deg,#222222_10.47%,#222222_45.54%,#222222_98.13%)] text-white transition-all duration-300 ease-out group-hover:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)]`}
    >
      <svg
        viewBox={viewBox}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${shared} group-hover:-translate-y-[180%] group-hover:translate-x-[180%]`}
      >
        {glyph}
      </svg>
      <svg
        viewBox={viewBox}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${shared} -translate-x-[180%] translate-y-[180%] delay-75 group-hover:translate-x-0 group-hover:translate-y-0`}
      >
        {glyph}
      </svg>
    </span>
  );
}

function Pill({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "dark";
}) {
  // Measured from Figma nodes 3803:1672/1673 (primary) and 3803:1583/1584:
  // 67px tall, 15px radius, Poppins SemiBold 24px on desktop.
  //
  // The radius scales with --hero-u like the height does. Left at a flat 15 it
  // was 22% of the button's height at 1920 and 30% at 1440 — reading as a
  // half-pill as the button shrank. Commit 8b07942 found the same thing on the
  // header CTA independently. The height was
  // 56 here — the old 0.75 scale-down for a 1440 viewport — and is now the
  // design's 67 at lg. Below lg it still steps down; that is the phone pass.
  // Phone radius is 10, not the desktop 15 (Žilvinas 2026-08-25): at 44 tall
  // the same 15 read as a half-pill on a button a third the desktop width.
  //
  // 10 EITHER SIDE OF THE LABEL on phones, same day — so the button is the
  // words plus 20 and nothing more. It was 20 a side, which on a 375 screen
  // spent a tenth of the width on air. Desktop keeps its measured
  // 0.32u padding.
  const base =
    "inline-flex h-[calc(var(--pu)*44)] items-center justify-center rounded-[0.625rem] px-[0.625rem] text-[length:calc(var(--pu)*14)] font-semibold uppercase leading-none transition-all duration-300 ease-out hover:-translate-y-[1px] md:h-[3rem] md:px-6 md:text-[1.125rem] md:h-[calc(var(--hero-u)*0.67)] md:rounded-[calc(var(--hero-u)*0.15)] md:px-[calc(var(--hero-u)*0.32)] md:text-[length:calc(var(--hero-u)*0.24)]";
  // Each CTA inverts its own two colours on hover — foreground and background
  // trade places. Purple-on-white becomes white-on-purple; white-on-black
  // becomes black-on-white. Both keep a gradient background layer throughout
  // so the change cross-fades rather than snapping.
  //
  // THE TWO GRADIENTS MUST HAVE THE SAME STOP COUNT AND THE SAME STOP
  // POSITIONS, or the browser cannot interpolate between them and the fill
  // jumps at the halfway point no matter what `transition` says. The primary's
  // hover state used to be a 2-stop `#fff 0% -> #fff 100%` against a 3-stop
  // rest state at 8/42/93 — which is exactly why this button snapped while the
  // dark variant below (2 stops both sides) always cross-faded correctly.
  // Repeating the SAME percentages in white is what makes it animate.
  const style =
    variant === "primary"
      ? // purple bg / white text  ->  white bg / purple text
        "text-white bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] shadow-[0_0.5rem_1.625rem_-0.625rem_rgba(110,84,181,0.95)] hover:bg-[linear-gradient(147deg,#fff_8%,#fff_42%,#fff_93%)] hover:text-[#6e54b5] hover:shadow-[0_0.5rem_1.625rem_-0.75rem_rgba(255,255,255,0.45)]"
      : // white bg / black text  ->  black bg / white text
        "bg-[linear-gradient(147deg,#ececec_0%,#ececec_100%)] text-black hover:bg-[linear-gradient(147deg,#000_0%,#000_100%)] hover:text-white";
  return (
    <a href={href} className={`${base} ${style}`}>
      {children}
    </a>
  );
}

/**
 * Rating as filled violet tiles, each holding a white star — the design's
 * treatment, not bare ★ glyphs, which render inconsistently across platforms
 * and cannot carry the tile colour.
 *
 * Tile and star are the `star-x2.svg` asset inlined verbatim: a 35 × 35 box
 * filled #6E54B5 with the Trustpilot-style star notched out of it in white,
 * running edge to edge. Inlined rather than <img> so the five tiles cost no
 * requests and the geometry stays exact at any rendered size.
 *
 * RENDERED AT 35, the asset's own size. It was drawn at 22 — the artwork was
 * transcribed at full size but then scaled down in CSS, so the tiles read as
 * small chips rather than the rating block the design uses.
 */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <span
      className="inline-flex gap-1"
      role="img"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 35 35"
          /* 18 on phones, 35 from md up. The artwork is drawn at 35, so the
             phone value is a scale-down, not a different asset. */
          className="size-[1.125rem] shrink-0 md:size-[2.1875rem]"
        >
          <rect width="35" height="35" fill="#6E54B5" />
          <path
            d="M17.5 24.0645L22.9315 22.6101L25.2009 30L17.5 24.0645ZM30 14.5126H20.439L17.5 5L14.561 14.5126H5L12.7381 20.4088L9.7991 29.9214L17.5372 24.0252L22.2991 20.4088L30 14.5126Z"
            fill="white"
          />
        </svg>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- hero --- */

/**
 * Hero content only — the violet field and grid live on the wrapper in
 * page.tsx so they run continuously behind the floating header. Giving this
 * section its own background made the top of the page read as a separate band.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className={`${SHELL} relative pb-[calc(var(--pu)*56)] pt-[calc(var(--pu)*20)] text-center md:pb-[calc(var(--hero-u)*0.56)] md:pt-[calc(var(--hero-u)*0.8)]`}>
        {/*
          Figma nodes 3803:1591/1593/1594: a frosted white pill — a blurred
          white fill under a 50px-radius container — carrying BLACK Poppins
          Medium text at 20px. 417x45 at 1921 wide, so ~34px tall and 15px text
          at 1440.

          This is NOT the animated gradient badge from mushi-app's done-for-you
          page; that one was ported here by mistake. The marketing design uses
          a different treatment.
        */}
        {/*
          The fill and the #6E54B5 loop live on .eyebrow-pill in globals.css —
          see the note there for why the ring is inset shadows rather than a
          gradient. What is here is only geometry.

          HEIGHT IS EXPLICIT, not padding plus a line-box. The pill is 45 tall
          in Figma; padding-derived it came out around 54, because the default
          line-height added half a line above and below the 20px type. That
          extra 9px is the "too bulky" — the pill was a fifth taller than the
          design and the type sat in a slab of white rather than a band.

          0.45 of --hero-w, NOT a flat 45. It was pinned so a ruler on a
          1920x1080 screen would read 45 rather than the ~43 that u's 9.6vh cap
          gives — a fair complaint about u, but the wrong fix: it bought two
          pixels at one window size and cost the hero its proportions at every
          other. A pinned pill in a hero that scales is a pill that grows
          relative to everything around it as the window narrows (Žilvinas
          2026-08-15).

          --hero-w is u without the height cap, so 1920 still measures 45 AND
          1440 measures 34. See the note beside it in globals.css; the rest of
          the page scales the same way in rem.

          `h` + `items-center` also makes the height independent of the font's
          metrics, so a fallback face while Poppins loads cannot resize it.

          WIDTH IS NOT SET. Figma says 417, but that is just what the copy
          happens to measure at 20px — pinning it would clip or gap the moment
          the wording changes or a fallback face is showing, and it cannot work
          on a phone at all. Padding drives it instead, so 417 falls out on its
          own at the reference size.

          Radius is the design's 50, written out rather than `rounded-full`.
          At 45 tall the browser clamps it to a pill either way, but the number
          is the one from the file and survives any change of height.

          Height, type and inset are ONE decision — all three literal or all
          three in u — and they are all in u: 0.45u tall, Poppins Medium 0.2u,
          0.28u inset, which is Figma's 45 / 20 / 28 at 1920 and the same
          proportion at every width below it. Mixing them is what would shrink
          the type inside a fixed-height pill.

          The text classes stay on THIS element: the ring is sized in `em` and
          reads its font-size from here.
        */}
        <span className="eyebrow-pill mb-[calc(var(--pu)*28)] inline-flex h-[calc(var(--pu)*34)] items-center justify-center rounded-[3.125rem] px-5 text-[length:calc(var(--pu)*14)] font-medium text-black md:mb-[calc(var(--hero-u)*0.28)] md:h-[calc(var(--hero-w)*0.45)] md:rounded-[calc(var(--hero-w)*0.5)] md:px-[calc(var(--hero-w)*0.28)] md:text-[length:calc(var(--hero-w)*0.2)]">
          {HERO.eyebrow}
        </span>

        {/* The only <h1> on the page. Poppins SemiBold 80 with letter-spacing
            0 — it carried `tracking-tight` (-0.025em), which at 80px pulled
            two full pixels out of every gap. Nothing above it sets tracking, so
            dropping the class leaves it at 0 rather than needing an override. */}
        {/*
          Poppins SemiBold 80 / 80 line-height, straight from Figma — as 0.8
          of --hero-w, so 80 at 1920 and 63 at 1512.

          It was a literal 80 because 0.8u rendered 63 at 1512 and that read as
          a bug. Two separate things were tangled there: u's HEIGHT cap, which
          did shrink the headline for no reason a wide-but-short window cares
          about, and its WIDTH term, which is simply correct — 1512 is 79% of
          the reference, so 80px there is a headline a fifth too big for its
          column, and that is what pushed the awards row and the next section
          down the page. w keeps the width term and drops the height one.

          `leading-[1]` IS the 80 line-height (80/80). It was 1.08.

          The "massive" note was about the HEADER BAR, not this — see the
          scale note in SiteHeader.tsx. Do not shrink this to match it.
        */}
        <h1
          id="hero-heading"
          // Poppins SemiBold 32 on phones, per Žilvinas 2026-08-11 and again
          // 2026-08-20. The old sm:text-6xl step jumped it to 60px between 640
          // and 767px — still phone width — so 32 holds all the way to md.
          //
          // Outside --pu, deliberately. Everything else above the fold shrinks
          // with the viewport's HEIGHT so the block always fits one screen (see
          // the note on --pu in globals.css); the headline is the one thing
          // that does not. It is the page's first statement, so a short window
          // may now spend a few pixels more than it has rather than quietly
          // setting the headline at 22.
          //
          // It is no longer a FLAT 32, because the headline is no longer short
          // enough for one (2026-08-26). "$1M to $100M Brands." measures 10.73
          // times its font-size — 343.4px at 32 — against a 345px column at the
          // 375 artboard. It fits by 1.6px there and not at all at 360, where
          // it took the authored break to three lines and put "Brands." on a
          // line of its own.
          //
          // So the phone size is the COLUMN divided by that ratio, capped at
          // the artboard's 32. The 11 is the measured 10.73 plus a ~2.5%
          // cushion, which is what buys the line its margin back at 375 and
          // covers the fallback face still being up before Poppins lands. 32
          // returns at 382 wide and holds from there to md, so every modern
          // handset (390 and up) is unchanged; only 375 and below scale, and
          // they scale rather than re-wrap.
          //
          // --gutter, not a literal 30: the column is the viewport less both
          // gutters, and this has to move if that does.
          //
          // Desktop is 0.8u — Figma's 80 at 1920, in proportion below it.
          // leading-[1] is Figma's 80/80; the phone keeps 1.08.
          //
          // NO `text-balance`. The headline is two lines now, and balance
          // equalises them — it lands on "Premium Ads for $1M / to $100M
          // Brands.", splitting the range. The break is authored instead
          // (HERO.headingLines), so it is the frame's break at every width.
          //
          // max-w-4xl is gone with it: at 0.8w the second line measures wider
          // than 56rem near the reference width, so the cap would have
          // re-wrapped the line the <br> exists to hold. The lines are their
          // own width limit now.
          className="mx-auto text-[length:min(2rem,calc((100vw-var(--gutter)*2)/11))] font-semibold leading-[1.08] md:text-[length:calc(var(--hero-w)*0.8)] md:leading-[1]"
        >
          {HERO.headingLines[0]}
          <br />
          {HERO.headingLines[1]}
        </h1>

        {/* Poppins Regular 30 / 40 line-height, letter-spacing 0 — already the
            case from md up, and nothing above sets tracking. Below md it is
            Poppins Regular 16 on a flat 20 line.

            BOTH BREAKS ARE AUTHORED (see HERO_SUB_PARTS): two lines from md
            up, THREE on every phone. The browser gets neither right on its
            own — it ended the desktop line one on "and", and a 375-wide
            viewport pulls "pages," up onto phone line one, which is the
            design's line two. A hard <br> per frame is the only thing that
            holds either break at every width and while the fallback face is
            still showing.

            The two <br>s are mutually exclusive: `md:hidden` for the phone's
            two, `hidden md:inline` for the desktop's one, around parts cut at
            every point either frame breaks at.

            `md:max-w-none` goes with the desktop one: at 680 the second line
            is wider than the box at 30px type, so it would re-wrap and the
            <br> would have bought nothing.

            Note the trailing space after each <br> — it keeps the parts a
            normal sentence while that break is display:none, and CSS drops it
            at the start of a line when the break IS active, so it costs
            nothing.

            SIZE, LEADING AND THE GAP ABOVE ARE ALL FLAT PX ON THE PHONE —
            16 / 20, and mt-3 for the design's 12 under the headline (Žilvinas
            2026-08-25). Deliberately outside --pu, like the headline above:
            the phone unit shrinks the first screen to fit short viewports, and
            through it a 725-tall window rendered the sub at 14.3/17.9 and the
            gap at 10.7. The headline is already a flat 32, so the block under
            it is quoted the same way or the two drift apart on exactly the
            windows --pu exists for. Desktop keeps its measured --hero-u
            scaling. */}
        <p className="mx-auto mt-3 max-w-[42.5rem] text-[1rem] font-normal leading-[20px] text-white md:mt-[calc(var(--hero-u)*0.24)] md:max-w-none md:text-[length:calc(var(--hero-u)*0.3)] md:leading-[calc(var(--hero-u)*0.4)]">
          {HERO.subParts.a}
          <br className="md:hidden" />{" "}
          {HERO.subParts.b}
          <br className="hidden md:inline" />{" "}
          {HERO.subParts.c}
          <br className="md:hidden" />{" "}
          {HERO.subParts.d}
        </p>

        {/* `isolate` keeps the glow's -z-10 inside this row's stacking
            context — without it the glow would drop behind .hero-bg's
            background and vanish.

            25 under the sub on phones (Žilvinas 2026-08-25), flat like the
            block above it — see the note on the sub for why the phone side of
            this stack is no longer quoted through --pu. */}
        <div className="relative isolate mt-[25px] flex items-center justify-center gap-2.5 sm:gap-4 md:mt-[calc(var(--hero-u)*0.4)]">
          <span
            aria-hidden="true"
            className="cta-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
          />
          <Pill href={BOOKING_URL}>{HERO.primaryCta}</Pill>
          {/* Behind a flag rather than deleted — see HERO.secondaryCtaEnabled.
              It used to point at #case-studies, which is not what this button
              is for anyway. */}
          {HERO.secondaryCtaEnabled ? (
            <Pill href="#case-studies" variant="dark">
              {HERO.secondaryCta}
            </Pill>
          ) : null}
        </div>

        {/* Real badge artwork and laurel sprigs, ported from mushi-app rather
            than the hand-rolled text boxes this used to render. */}
        <TrustBadges />

        {/*
          The design's hero visual is a composite — a dashboard mockup with
          floating stat cards (HERO.chips) layered around it. The flat Figma
          export split it into unusable fragments: alpha masks and empty device
          frames, with no single asset representing the whole.

          The chips are deliberately not rendered as a plain list here. They
          only make sense pinned around that artwork; free-floating they read
          as stray tags. To restore the section: export the hero node from
          Figma as one flattened image (1 get_screenshot call), drop it in with
          `priority`, and position the chips over it.
        */}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- social proof --- */

export function SocialProof() {
  return (
    // Sits inside the same violet wrapper as the hero, so no background of its
    // own — it previously re-declared a gradient that did not line up with the
    // hero's, which showed as a visible seam.
    // Bottom padding gives the hero's violet ramp a run of near-black to
    // dissolve into before the next section starts, so the handover reads as a
    // fade rather than a stop. It scales with --hero-u at md+ rather than
    // sitting at a flat 192: it is empty space, but the stat panels are
    // positioned as a percentage of this whole field, so a fixed tail pushed
    // them further down the page the smaller the window got.
    // On phones that tail was 192px, and the next section adds 80 on top of
    // it — nearly 270px of empty screen between the logo strip and "Want
    // Creatives This Premium?". Halved to 96; the ramp still has room to
    // dissolve. Desktop keeps its --hero-u scaling.
    <section aria-labelledby="proof-heading" className="relative pb-[calc(var(--pu)*37.5)] pt-[calc(var(--pu)*8)] md:pb-[calc(var(--hero-u)*0.6)] md:pt-[calc(var(--hero-u)*0.08)]">
      <div className={SHELL}>
        {/* Rule-and-sparkle divider from the design. */}
        {/* The design's own divider ornament — a gradient line running into a
            four-pointed star — flanks the headline, mirrored on the left. */}
        {/* On the phone this row alone breaks out of SHELL's 20px gutter, so
            the two ornaments run to the screen edges instead of stopping at
            the content column. It also hands them the 40px they need to show
            the star at full size beside the headline. */}
        <div className="-mx-[var(--gutter)] flex items-center justify-center gap-2 md:mx-0 md:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/creatives/icons/divider-left.svg"
            alt=""
            width={161}
            height={21}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            // On the phone there is no room for all 161 of the ornament, so the
            // box flexes into the space the headline leaves and object-cover
            // crops the fading tail of the line off its open end. The star sits
            // at the headline end of the artwork, so it survives at full size —
            // scaling the whole SVG down instead shrank it to a speck.
            className="h-[calc(var(--pu)*21)] min-w-0 flex-1 object-cover object-right md:h-[calc(var(--hero-u)*0.21)] md:w-auto md:flex-none"
          />
          {/* Poppins Regular — 20 from md up, 14 on the phone so the line still
              fits on one row at 375. The dividers flanking it flex into
              whatever width is left over. */}
          <h2
            id="proof-heading"
            className="whitespace-nowrap text-center text-[length:calc(var(--pu)*14)] font-normal text-white md:text-[length:calc(var(--hero-u)*0.2)]"
          >
            {SOCIAL_PROOF.headline}
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/creatives/icons/divider.svg"
            alt=""
            width={161}
            height={21}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="h-[calc(var(--pu)*21)] min-w-0 flex-1 -scale-x-100 object-cover object-right md:h-[calc(var(--hero-u)*0.21)] md:w-auto md:flex-none"
          />
        </div>

        {/* Official client logotypes from /public/logos. Each keeps its own
            viewBox width so relative sizing matches the design; only
            "we interiors" has no supplied SVG and falls back to text. */}
        <div className="mx-auto mt-[calc(var(--pu)*40)] max-w-3xl space-y-[calc(var(--pu)*16)] md:mt-[calc(var(--hero-u)*0.4)] md:space-y-[calc(var(--hero-u)*0.24)]">
          {/*
            The design stacks the brands as a centred pyramid — four, three,
            two, one — not a width-driven wrap, which broke rows in different
            places at every viewport. The order in content.ts already matches
            the design's reading order.
          */}
          {[[0, 4], [4, 7], [7, 9], [9, 10]].map(([from, to]) => (
            <ul
              key={from}
              // 20 between marks on the phone, not 24: the first row is
              // Sintra + superior care.pet + Holo + we interiors, which at 24
              // left 5px of slack in the 345 column — no room to draw the
              // two-line lockup at the size it needs. Desktop is unchanged.
              className="flex flex-nowrap items-center justify-center gap-x-5 md:gap-x-12"
            >
              {SOCIAL_PROOF.brands.slice(from, to).map((brand) => (
                <li key={brand.name} className="flex items-center">
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/logos/${brand.logo}`}
                      alt={brand.name}
                      width={brand.w}
                      height={brand.h}
                      loading="lazy"
                      decoding="async"
                      className={`w-auto opacity-95 ${
                        "tall" in brand && brand.tall
                          ? "h-[calc(var(--pu)*24)] md:h-[calc(var(--hero-u)*0.325)]"
                          : "h-[calc(var(--pu)*19)] md:h-[calc(var(--hero-u)*0.26)]"
                      }`}
                    />
                  ) : (
                    <span className="text-[length:calc(var(--pu)*22)] font-medium tracking-tight text-white/90">
                      {brand.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- creatives --- */

export function Creatives() {
  return (
    <section id="templates" aria-labelledby="creatives-heading" className="py-[2.34375rem] md:py-20">
      <div className={SHELL}>
        <div className="flex items-center justify-between gap-6">
          <h2
            id="creatives-heading"
            // 24/24 on the phone, straight off the design — the default 1.5
            // body leading pushed the two lines apart. Desktop keeps the
            // inherited 1.5 it was already rendering with.
            //
            // cap-centered so the row's `items-center` centres the "Yes" pill
            // on the LETTERS rather than on the line box: the box carries
            // ascent above the caps and descent below the last baseline, and
            // this headline puts ink in neither (no g/y/p), so the pill was
            // riding low against the two lines. Safe here for that same
            // reason — nothing in the copy descends.
            className="cap-centered text-[1.5rem] font-semibold leading-[1.5rem] tracking-tight md:text-[3rem] md:leading-normal"
          >
            {CREATIVES.heading}
          </h2>

          {/*
            The heading asks a question; this pill is the answer.

            Desktop is measured, not eyeballed: 143 x 60, radius 30 on all four
            corners, a 45x45 #222222 disc inset 7.5px from the right edge (the
            same inset as the 7.5px it gets top and bottom from 60 - 45), and
            18px between the end of "Yes" and the start of the disc, which is
            Figma's own figure. It was briefly opened to 24 because the word
            read as leaning on the disc; that space has to come from somewhere
            in a fixed 143 box, and where it came from was the left of "Yes" —
            which is what then read as the word being jammed against the pill's
            left edge (Noah 2026-08-19). At 18 the leftover on the left is 25.5.
            `justify-end` is what holds both of those at once — the content is
            packed against the right edge, so the 18px gap and the 7.5px inset
            are both literal and the leftover space falls on the left of "Yes"
            instead of being a padding value that has to be kept in sync with
            the text's width.

            The fill is the header's "Book a Call" gradient verbatim so the two
            CTAs read as the same button. Hover swaps the violet with the disc's
            grey rather than going white — see ArrowDisc, which carries the
            whole behaviour including the arrow relay.
          */}
          <a
            href={BOOKING_URL}
            // mr-3 on phones only: at the shell's 20px gutter the pill read as
            // jammed into the right edge, so it is pulled in a little. Desktop
            // keeps the measured alignment.
            //
            // THE PHONE PILL IS MEASURED TOO, as of 2026-08-25: 100 x 42,
            // radius 100 (which is --radius-pill already), 15 between "Yes"
            // and the disc, and the 34 disc inset 4 from the right — the same
            // 4 it gets top and bottom from 42 - 34.
            //
            // It used to have no fixed width: pl-5 + text + gap + disc + pr,
            // so the left padding was a number of its own and the leftover
            // fell wherever the word happened to end. `justify-end` with a
            // fixed 100 is the desktop's arrangement at the phone's size —
            // content packed right, so the 15 and the 4 are literal and the
            // remaining ~12 lands to the left of "Yes" instead of being a
            // second padding value to keep in sync with the word's width.
            //
            // The hover gradient repeats the rest state's THREE stop positions
            // in white. A 2-stop hover against a 3-stop rest cannot interpolate,
            // so the fill snapped no matter what the transition said.
            className="group mr-3 inline-flex h-[2.625rem] w-[6.25rem] shrink-0 items-center justify-end gap-[0.9375rem] rounded-[var(--radius-pill)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pr-1 text-[1.25rem] font-normal leading-none text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#222222_10.47%,#222222_45.54%,#222222_98.13%)] md:mr-0 md:h-[3.75rem] md:w-[8.9375rem] md:gap-[1.125rem] md:rounded-[1.875rem] md:pr-[0.46875rem] md:text-[1.875rem]"
          >
            {CREATIVES.cta}
            {/* ~/Documents/arrow icon.svg, inlined in ArrowDisc. The path
                draws a 15-unit arrow; the viewBox has to add the stroke's
                overhang on every side or the ends clip, so at stroke 3 it is
                15 + 1.5 + 1.5 = 18 offset to -0.5. The rendered size carries
                the same 18/15 factor, which is why it is 18px and not 15 —
                rendering the box at 15 shrinks the drawn arrow instead. Stroke
                3, not the original 2: the design's arrow is the bold weight. */}
            <ArrowDisc
              disc="size-[2.125rem] md:size-[2.8125rem]"
              arrow="size-[0.86rem] md:size-[1.125rem]"
              viewBox="-0.5 -0.5 18 18"
              strokeWidth={3}
            />
          </a>
        </div>
      </div>

      {/*
        The rail is deliberately OUTSIDE the shell. It clips at the screen
        edges, not the 1200px column, so a card that leaves the view travels
        the full width of the display rather than vanishing into a margin two
        hundred pixels short of it. It re-establishes the column's left edge
        with its own padding, so the first card still starts directly under the
        "W" of the heading. See CreativesRail.
      */}
      {/* 26 between the heading and the rail on phones, per the artboard.
          Desktop keeps its 40. */}
      <div className="mt-[1.625rem] md:mt-10">
        <CreativesRail />
      </div>
    </section>
  );
}

/* -------------------------------------------------------- case studies --- */

export function CaseStudies() {
  return (
    <section id="case-studies" aria-labelledby="cases-heading" className="py-[2.34375rem] md:py-20">
      <div className={SHELL}>
        <h2
          id="cases-heading"
          // 24/24 on the phone, same as the creatives headline — the default
          // 1.5 body leading spread the two lines. Desktop keeps the inherited
          // 1.5. No cap-centered here: this copy has descenders (the comma,
          // the J), which that utility clips out of the box.
          className="text-[1.5rem] font-semibold leading-[1.5rem] tracking-tight md:text-[3rem] md:leading-normal"
        >
          {/* Authored break, phone only — see CASE_STUDIES.headingLines. The
              trailing space keeps the two halves one sentence once the <br> is
              display:none, and CSS drops it at the head of a line while the
              break is active, so it costs nothing either way. */}
          {CASE_STUDIES.headingLines[0]}
          <br className="md:hidden" />{" "}
          {CASE_STUDIES.headingLines[1]}
        </h2>

        {/*
          Two columns, with the right one pushed down so the cards stagger
          rather than sitting in level rows. That offset is the design's
          rhythm — an aligned grid reads as a table by comparison.

          Each column is its OWN list rather than a two-column grid. A grid
          sizes each row to its tallest cell, so the right column's 140px drop
          was silently inflating the left column's vertical gap to 138px —
          the spacing could not be set, only fought. Separate columns make the
          70px between a card's badges and the next card's artwork exact.
        */}
        {/*
          TWO INDEPENDENT COLUMNS, not a 2-column grid — and that distinction
          is load-bearing. Grid rows span both columns, so every row is as tall
          as its TALLEST cell; with the right column pushed down to stagger it,
          that offset inflated the shared row height and the left column
          inherited the slack as dead space under its tags. No gap value can fix
          that, because most of the distance was not gap.

          Gap is 40 on phones — measured off the phone artboard, tag row to
          the next card's top edge — 70 in the 640-767 band this was tuned at,
          and 45 from md up, which is the design's desktop figure for the same
          distance.
        */}
        <div className="case-columns mt-[1.625rem] flex flex-col gap-y-[2.5rem] sm:gap-y-0 sm:flex-row sm:gap-x-[1.125rem] md:mt-12">
          {[0, 1].map((col) => (
            <ul
              key={col}
              // Explicit: below sm this <ul> is display:contents (globals.css),
              // which drops the implicit list role in some engines.
              role="list"
              className={`flex flex-1 flex-col gap-y-[2.5rem] sm:gap-y-[4.375rem] md:gap-y-[2.8125rem] ${
                col === 1 ? "sm:mt-[8.75rem]" : ""
              }`}
            >
              {CASE_STUDIES.items.filter((_, i) => i % 2 === col).map((item) => (
            /* A container, so the headline can size itself off THIS CARD's
               width rather than the window's — see the note on the h3. */
            <li
              key={item.brand}
              // The phone's reading order. Inert on desktop — see the note on
              // CASE_STUDIES.phoneOrder in content.ts.
              style={{ order: item.phoneOrder }}
              className="@container"
            >
              <article className="relative flex h-full flex-col">
                {/* 680x680 Mask group filling its column — a square, not a
                    letterboxed crop. The mockup exports transparent, and the
                    coloured light lives INSIDE the card, washing the area
                    behind the device — orange, purple, blue, yellow per
                    brand — over the card's own dark gradient. */}
                <div
                  className="fade-border relative aspect-square overflow-hidden rounded-[1.125rem]"
                  style={{ background: item.bg }}
                >
                  {/* Brand mark inside the artwork, top-left — the same logo
                      artwork as the brand strip, not a text stand-in.
                      we interiors has no supplied logo and stays text. */}
                  {/* Every case study now carries its real logotype, so the old
                      text fallback became dead code the type checker rightly
                      rejected. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                      src={`/logos/${item.logo}`}
                      alt={item.brand}
                      width={item.logoW}
                      height={25}
                      loading="lazy"
                      decoding="async"
                      // Desktop carries the artboard's logo, which is a good
                      // deal bigger than the phone's and sits further off the
                      // corner: 3.25rem is ~39px at 1440 against the 18 this
                      // used to draw, and the inset goes 18/15 -> 30/30
                      // (Noah 2026-08-19). The phone keeps its own smaller
                      // mark — the card there is 343 wide, not 600.
                      className="absolute left-6 top-5 z-10 h-[1.5rem] w-auto drop-shadow-[0_2px_0.5rem_rgba(0,0,0,0.6)] md:left-10 md:top-10 md:h-[3.25rem]"
                    />
                  <Img
                    src={item.image}
                    alt={`${item.brand} campaign work by Mushi`}
                    className="size-full object-cover object-center"
                  />
                  {/* Nothing sits over the artwork. Figma bakes a flat plate
                      into these exports, and an earlier build screen-blended
                      the brand colour on top to get any colour back — which
                      lit the device up along with the plate. All four are now
                      keyed to real alpha, so the gradient is simply behind
                      them and the devices are untouched. */}
                </div>

                {/* Poppins Medium 30 at every width, per Žilvinas 2026-08-11.
                    `whitespace-pre-line` is what makes the \n in each result
                    bind: the break sits at a fixed word in the copy deck, so
                    it must land there at any card width rather than falling
                    wherever the line happens to run out.

                    TWO LINES, ALWAYS — that is the design, and the authored \n
                    only guarantees the SECOND break. The first segment still
                    has to fit on one line, and when it does not the card gets
                    a third (reported twice: 2026-08-15).

                    The page scale alone cannot promise that. It is clamped at
                    both ends (globals.css) and the card is half a column, so
                    there are bands — 640-768, where the two-column split has
                    already happened but the desktop scale has not started, and
                    the narrowest phones — where the card is proportionally
                    narrower than the type. So the size is bounded by the CARD
                    instead of the window: 5.7cqi.

                    Where that number comes from, measured rather than tuned:
                    the longest segment in the deck ("From $13k/month to
                    $75k/month") is 16.64 times its own font-size wide, so it
                    fits while font <= 6.01% of the card. 5.7 leaves ~5% for a
                    fallback face's wider metrics and for copy edits.

                    min() means it is a CEILING, not a replacement: at 1920 the
                    card is 678 and 5.7cqi is 38.6, so the design's 30 wins.
                    It only engages below a ~526 card, which no desktop width
                    reaches. Nothing changes at the reference. */}
                {/* Phone size is 18, NOT the deck's 20 — a deliberate break
                    from Figma (Žilvinas 2026-08-19). At 20 it sits only 4px
                    under the section heading's 24 and the two read as the same
                    level, so the heading stopped announcing the section. 18
                    puts the result at 0.75 of the heading; desktop already
                    runs 30 against 48, which is 0.625. */}
                <h3 className="mt-4 whitespace-pre-line text-[length:min(1.125rem,5.7cqi)] font-medium leading-[1.25] text-white md:mt-5 md:text-[length:min(1.875rem,5.7cqi)]">
                  {item.result}
                </h3>

                {/* Žilvinas 2026-08-11: Poppins Regular 20 / #9E9E9E on
                    #191919, always caps. 20 at EVERY width — asked for twice,
                    so it is deliberately not stepped down on phones. The fill
                    and text colour are literal rather than white-at-an-opacity,
                    so they no longer shift with whatever sits behind. */}
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[0.375rem] bg-[#191919] px-2.5 py-1 text-[0.875rem] font-normal uppercase tracking-wide text-[#9e9e9e] md:px-3.5 md:py-1.5 md:text-[1.25rem]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- testimonials --- */

function TestimonialCard({
  t,
  style,
}: {
  t: (typeof TESTIMONIALS.items)[number];
  /** Carries the phone reading order — see TestimonialColumns. */
  style?: React.CSSProperties;
}) {
  return (
    /* #181818 at radius 20, both from Figma. The fill was #161519, an
       eyeballed near-black. NOTE this is NOT the same grey as the
       "Trusted by 100+ brands" pill below the grid, which is #222222 — the two
       were briefly conflated. Card is darker than the control sitting on it. */
    /* Phone padding is the artboard's, and it is not uniform: 20 left and
       right (the desktop 28 left the stars and the quote too far in on a 375
       screen), 28 on top, and 35 under the byline — the same 35 that sits
       between the quote and the byline, so the footer reads as its own band
       rather than as the end of the last paragraph. Desktop stays even. */
    <article style={style} className="rounded-[1.25rem] bg-[#181818] px-5 pb-[2.1875rem] pt-7 md:p-7">
      {/* TITLE AND STARS ARE ONE COLUMN, with the avatar beside them.
          The stars used to be a sibling BELOW this row, which made the space
          under the title depend on the avatar: the row is as tall as its
          tallest item, and at 40 the avatar beats a one-line 16px title by 24
          — so single-line titles got a visibly bigger gap than a title that
          wrapped to two lines. Kovger's looked right only because his wraps.
          Inside the column the gap is whatever mt-3 says, every time. */}
      <div className="flex items-start justify-between gap-5">
        <div>
        {/* 16/16 on the phone — the line-height equals the size, so a title
            that wraps sits as a tight two-line block. 30 from md up. */}
        <h3 className="text-[1rem] font-semibold leading-4 text-white md:text-[1.875rem] md:leading-snug">
          {t.title}
          </h3>
          {/* 15 to the stars on the phone, off the artboard; desktop keeps
             its 12.

             `flex` is load-bearing, not cosmetic. The stars are an inline-flex
             span, so as the only thing on a LINE this box was 24.5 tall for
             18px of artwork — the row's line-height, with the slack hanging
             below the stars. That slack then added itself to whatever margin
             came next, which is why the gap under the stars measured 22.5
             against a 16 margin. As a flex container there is no line box and
             both gaps are exactly what they say. */}
          <div className="mt-[0.9375rem] flex md:mt-3">
            <Stars />
          </div>
        </div>
        {/* 80 x 80, per Figma — photo and initials disc alike. It was 52, which
            is what made the 35px initials look oversized: the type was right
            and the circle around it was three quarters the size it should be.
            Change the two together, never one on its own. */}
        {t.avatar ? (
          <Img
            src={t.avatar}
            alt=""
            width={80}
            className="size-[2.5rem] shrink-0 rounded-full object-cover md:size-[5rem]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-[2.5rem] shrink-0 items-center justify-center rounded-full bg-white/10 text-[1.125rem] font-medium leading-none md:size-[5rem] md:text-[2.1875rem]"
          >
            {t.initials}
          </span>
        )}
      </div>

      {/* Phone rhythm is tighter than desktop's throughout this card: 12 to
          the quote, 12 between paragraphs and 16 to the byline. The md values
          are the design's and are unchanged. */}
      {/* 15 from the stars to the quote on the phone — the SAME 15 that sits
         above the stars (Žilvinas 2026-08-25), so the row is evenly spaced
         between the title and the quote rather than sitting closer to the
         title. It was 20. Both are true numbers now that the stars' line box
         is gone (see above). Desktop keeps 16, and the 12 BETWEEN paragraphs
         is unchanged. */}
      <div className="mt-[0.9375rem] space-y-3 md:mt-4 md:space-y-4">
        {t.body.map((para, i) => (
          <p key={i} className="text-[0.875rem] font-normal leading-relaxed text-white/50 md:text-[1.3125rem]">
            {para}
          </p>
        ))}
      </div>

      {/* 35 under the quote on the phone, off the artboard — it was 16, and
          the byline read as part of the last paragraph rather than a footer.
          Desktop keeps its 24.

          The byline is a touch dimmer than the quote from md up; on the phone
          the design puts both at 50%. */}
      <footer className="mt-[2.1875rem] text-[0.875rem] font-light text-white/50 md:mt-6 md:text-[1.3125rem] md:text-white/40">
        <time dateTime={t.iso}>{t.date}</time>
        {"  •  "}
        <span>{t.author}</span>
        {"  •  "}
        {t.country}
      </footer>
    </article>
  );
}

/**
 * Cards run one-after-the-other, alternating columns — L, R, L, R — as in the
 * design. CSS multicol fills the whole first column before the second, which
 * is not the design's order. `flip` continues the global alternation into the
 * hidden set so an odd shown-count does not restart the pattern on the left.
 *
 * ON A PHONE THERE IS ONLY ONE COLUMN, and it reads in `items` order —
 * Kovger, Skomra, Želnytė, ... (Žilvinas 2026-08-25). That is NOT what
 * stacking the two column <div>s gives: they concatenate, so the whole left
 * column came first and the phone read Kovger, Želnytė, Juzėnas, Semetaitė,
 * THEN Skomra — the alternation, which only means anything while there are two
 * columns to alternate between, flattened into a shuffle.
 *
 * The fix is `display: contents` on the two columns below md, which dissolves
 * them so all seven cards become items of the one-column grid, plus each
 * card's own index as its CSS `order` to put them back in reading order. The
 * DOM stays exactly as desktop needs it — one list, no duplicated cards.
 *
 * `md:space-y-6` rather than `space-y-6`: while the columns are dissolved the
 * grid's own `gap-6` spaces the cards, and a margin on top of that would
 * double the gap for every card after the first in each column.
 */
function TestimonialColumns({
  list,
  flip = false,
}: {
  list: readonly (typeof TESTIMONIALS.items)[number][];
  flip?: boolean;
}) {
  type Placed = { t: (typeof TESTIMONIALS.items)[number]; i: number };
  const L: Placed[] = [];
  const R: Placed[] = [];
  list.forEach((t, i) => ((i % 2 === 0) !== flip ? L : R).push({ t, i }));
  const column = (cards: Placed[]) => (
    <div className="contents md:block md:space-y-6">
      {cards.map(({ t, i }) => (
        // `order` only applies to a flex/grid item, so it is live exactly
        // while the wrapper above is `display: contents` and inert from md up.
        <TestimonialCard key={t.title} t={t} style={{ order: i }} />
      ))}
    </div>
  );
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {column(L)}
      {column(R)}
    </div>
  );
}

export function Testimonials() {
  const { items } = TESTIMONIALS;

  return (
    <section id="agency" aria-labelledby="testimonials-heading" className="py-[2.34375rem] md:py-20">
      <div className={SHELL}>
        {/* 48/48 from the design — line-height equals the size, so the two
            sentences sit tight on top of each other. Each sentence is its own
            block rather than a <br>, so the break survives any wrapping. */}
        <h2
          id="testimonials-heading"
          // 22 on a flat 22 line on the phone (Žilvinas 2026-08-25) — the two
          // sentences sit tight on top of each other, the same size-equals-
          // leading the desktop 48/48 uses. `leading-tight` was 1.25, i.e.
          // 27.5, which opened a gap between them the artboard does not have.
          className="text-[1.375rem] font-semibold leading-[1.375rem] tracking-tight md:text-[3rem] md:leading-[3rem]"
        >
          {TESTIMONIALS.headingLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        {/*
          ALL cards render once, in two continuous alternating columns. The
          collapsed state is just a clip: the container is height-limited with
          a fade at its bottom edge and the trust pill floating over it.
          Opening the disclosure lifts the clip via :has().

          This replaces a visible-set + preview-set structure whose two
          stacked grids could not interleave heights — a short right column in
          the first grid left a block of dead space before the second began.
          One continuous flow has no seam, and no duplicated cards either.
        */}
        {/* The open state is wired in globals.css (.testi-wrap :has rules) so
            the height and the fade can TRANSITION. As Tailwind variants they
            could only toggle `max-h-none` / `hidden`, which are both discrete —
            the reveal snapped in one frame. */}
        <div className="testi-wrap relative mt-[1.625rem] md:mt-12">
          {/*
            The collapsed height is tuned so the first card in each column is
            whole and the second is cut near its middle — two full cards and
            two halves before the pill is pressed. Cards are content-sized, so
            these are measured values, not a formula: each one is the midpoint
            of the left column's second card at that breakpoint, which also
            clears the tallest first card there. Below lg the grid is one
            column, so it reads as one full card and a half.

            Re-measure if the testimonial copy changes — the numbers come from
            the text's own wrapping.
          */}
          {/* Heights and overflow live on .testi-clip in globals.css now — they
              have to sit beside the transition that animates them. */}
          <div className="testi-clip relative">
            <TestimonialColumns list={items} />
            <div
              aria-hidden="true"
              className="testi-fade pointer-events-none absolute inset-x-0 bottom-0 h-[12.5rem] bg-gradient-to-b from-transparent to-[var(--bg)]"
            />
          </div>

          <details className="group">
            {/*
              594 × 62 from the design, fixed from md up so the pill matches
              the measured box rather than hugging its content. Phones keep the
              content-width pill — 594 would overflow a 375 viewport.

              Figma's three fills for this control, verbatim: #222222 for the
              pill, #FFFFFF for the type, #FFFFFF at 50% for the divider. The
              pill was #1b1a1f and the divider white/15, both eyeballed.

              NO COLOUR INVERSION ON HOVER — a deliberate exception to the rule
              in CLAUDE.md, recorded there too. Every other button on the site
              trades its foreground and background on hover; this one does not,
              because at 594 wide it is a section control rather than a call to
              action and flipping that much area to white flashes the whole
              block. Only the "View More" cluster responds, and only by a small
              fade. Do not reinstate `hover:bg-white` here.
            */}
            {/*
              THE PILL NEVER CHANGES POSITIONING SCHEME. It used to flip from
              `absolute` to `static` on open, which is a discrete change no
              transition can touch: at t=0 it teleported ~100px — over the fade
              one frame, below the block the next — and the eye read the whole
              reveal as a jump followed by a slide.

              It is absolute in both states, anchored to the BOTTOM of
              .testi-wrap, and the room it needs when open comes from that
              wrapper's padding-bottom, which animates on the same curve and
              duration as the clip's height (globals.css). The pill therefore
              rides the growth continuously and lands exactly where
              `static + mt-8` used to put it: --pill-h + 2.5rem of padding, less
              the 0.5rem it sits above the wrapper's edge.

              Its height is explicit at every width, not just from md, because
              that padding is calculated from it: 48 on the phone (the
              artboard's 293 x 48) and the desktop's own 3.875rem above md.
              --pill-h in globals.css carries the same two values.
            */}
            <summary className="group/pill absolute inset-x-0 bottom-2 z-10 mx-auto flex h-12 w-fit cursor-pointer list-none items-center justify-center gap-2.5 rounded-[var(--radius-pill)] bg-[#222222] py-0 pl-3 pr-3 shadow-[0_1.25rem_3.125rem_-1rem_rgba(0,0,0,0.9)] md:h-[3.875rem] md:w-[37.125rem] md:gap-4 [&::-webkit-details-marker]:hidden">
              {/* Named in TESTIMONIALS.pillAvatars, not sliced off the top of
                  `items` — see the note there. */}
              <span aria-hidden="true" className="flex -space-x-3">
                {TESTIMONIALS.pillAvatars.map((author) => {
                  const t = items.find((i) => i.author === author);
                  return t?.avatar ? (
                    <Img
                      key={author}
                      src={t.avatar}
                      alt=""
                      width={40}
                      // 28 on the phone, off the artboard; the 2.5rem returns
                      // from md, where the root scale makes it 30.
                      className="size-7 rounded-full object-cover ring-2 ring-[#222222] md:size-[2.5rem]"
                    />
                  ) : null;
                })}
              </span>

              <span className="whitespace-nowrap text-[0.9375rem] font-medium leading-[1.875rem] text-white md:text-[1.3125rem]">
                {TESTIMONIALS.trustLine}
              </span>

              {/* #FFFFFF at 50%, per Figma. */}
              <span aria-hidden="true" className="h-5 w-px bg-white/50 md:h-[1.875rem]" />

              {/* Phones drop the "View More" label so the pill stays one line
                  — avatars, trust line, divider, the +/− disc — per the phone
                  design. The label returns from md up. */}
              {/* The one thing that reacts to hover, and only barely: a short
                  fade on this cluster. The label and the disc move together
                  because they read as a single affordance. */}
              <span className="flex items-center gap-2.5 text-[0.9375rem] font-medium leading-[1.875rem] text-white transition-opacity duration-500 ease-out group-hover/pill:opacity-70 md:text-[1.3125rem]">
                {/* Both labels and both glyphs are always in the DOM, stacked
                    in one grid cell and cross-faded. Swapping `hidden` for
                    `inline` is discrete — the word and the sign changed in a
                    single frame while the block was still travelling, which is
                    the other half of what made this control feel abrupt.
                    Stacking also keeps the pill's width off the label, so
                    nothing reflows mid-transition. */}
                <span className="hidden md:grid">
                  <span className="col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-500 ease-out group-open:opacity-0">
                    {TESTIMONIALS.moreLabel}
                  </span>
                  <span className="col-start-1 row-start-1 whitespace-nowrap opacity-0 transition-opacity duration-500 ease-out group-open:opacity-100">
                    View Less
                  </span>
                </span>
                {/* DRAWN, not typed. The glyphs were the characters "+" and
                    "−", which put the sign wherever the font's metrics happen
                    to place it in the line box — off-centre in the disc, at
                    the font's own weight, with square ends. This is the
                    artboard's mark: 12 x 12, 2px strokes, round caps, and dead
                    centre because the SVG box is what the grid centres.

                    size-3 is 12px on the phone and 9 above md, where the root
                    scales to 12px — the same fraction of the disc at both. */}
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-black md:size-[1.875rem]">
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    className="col-start-1 row-start-1 size-3 transition-opacity duration-500 ease-out group-open:opacity-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 1.5v9M1.5 6h9" />
                  </svg>
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    className="col-start-1 row-start-1 size-3 opacity-0 transition-opacity duration-500 ease-out group-open:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M1.5 6h9" />
                  </svg>
                </span>
              </span>
            </summary>
          </details>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- final cta --- */

export function FinalCta() {
  return (
    // Carries the booking anchor so every "Book a Call" / fit-check CTA lands
    // somewhere real until BOOKING_URL points at an external scheduler.
    <section
      id={BOOKING_ANCHOR}
      aria-labelledby="cta-heading"
      // EQUAL AIR EITHER SIDE OF THE CARD on desktop, and a little more of it
      // (Noah 2026-08-19). It measured 90 above and 72 below at 1440, which is
      // what read as the top being bigger.
      //
      // The two are not symmetrical to write, because only the lower one is
      // this section's alone: below the card there is just pb, while above it
      // there is the testimonials' own 60 of bottom padding plus the 8 the
      // trust pill floats above its block. So 108 of air is pb-36 below, and
      // 3.3333rem on top of 60 + 8 above. Phones keep the artboard's own
      // spacing until that frame is done.
      className="scroll-mt-28 pb-24 pt-8 md:pb-36 md:pt-[3.3333rem]"
    >
      {/*
        IN THE SHELL, like every other section. It used to carry its own
        `px-5` + `md:max-w-[1380px]`, which was the same thing as the shell
        only while the column was a flat 1380. Now that the column is a
        proportion of the window (lib/layout.ts), a hardcoded 1380 here made
        this card wider than everything above it — it visibly overhung the
        testimonials on both sides. Read the width from SHELL so the two can
        never disagree again.
      */}
      <div className={SHELL}>
      {/*
        Phone frame: 345x320 card on a light-to-dark wash (see .cta-card).

        Desktop is the measured card: 1380 x 842. The height is expressed as
        that RATIO rather than a flat 842, for the same reason as the width —
        at a 1087-wide column an 842 card is proportionally far taller than the
        design's, and the copy would sit in a slab of empty space. An aspect
        ratio still gives the panel a box the type cannot drift, which is the
        point of not letting the content set the height.

        The content block is centred in it. The reference has it about 9px
        above centre; that is inside the error of reading a screenshot, so it
        does not earn a hardcoded offset.
      */}
      <div className="cta-card relative mx-auto flex h-[20rem] w-[21.5625rem] max-w-full items-center justify-center overflow-hidden rounded-[0.9375rem] border border-transparent px-6 text-center md:h-auto md:w-full md:aspect-[1380/842] md:rounded-[1.5rem] md:border-[#8a5cf6]/45 md:px-5">
        {/* No centre glow: the design's card is black through the middle,
            with its only light rising from the bottom edge (see .cta-card). */}
        {/* The streaks live in the card background itself now — the design's
            own exported artwork (cta-streaks.svg) — replacing the hand-drawn
            stand-in curves that used to sit here. */}
        <div className="relative">
          {/* 55/55 — line-height equals the size, so the two lines sit tight
              on each other, same treatment as the testimonials heading. The
              design breaks after "You scrolled so far."; each line is its own
              block rather than a <br>, so the break survives any wrapping. */}
          <h2
            id="cta-heading"
            className="text-[1.375rem] font-semibold leading-[1.375rem] tracking-tight md:text-[3.4375rem] md:leading-[3.4375rem]"
          >
            {FINAL_CTA.headingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {/* 24/30 Regular, white at 50%. mt-6 is the measured 24 from the
              heading's last line box.

              Phone leading is 15 on 14 — tighter than the type is tall, so the
              three lines read as one block against the heading above them
              rather than as three separate sentences. The phone gap to the
              heading is 25, and it is quoted separately from the desktop 24
              because the two were only ever the same by coincidence. */}
          <p className="mt-[1.5625rem] text-[0.875rem] font-normal leading-[0.9375rem] text-white/50 md:mt-6 md:text-[1.5rem] md:leading-[1.875rem]">
            {/* Three lines on the phone, one sentence each. From md up the
                first two go inline and share a line, which is the reference's
                desktop break — the trailing space only shows once they do. */}
            {FINAL_CTA.subLines.map((line, i) => (
              <span key={line} className={i < 2 ? "block md:inline" : "block"}>
                {line}
                {i === 0 ? " " : ""}
              </span>
            ))}
          </p>

          {/*
            44 below the sub and 28 between the pills are read off the
            reference, not supplied — treat them as close, not exact. Same for
            the pills' horizontal insets, which are checked rather than
            guessed: Poppins Regular 26 sets "15 Minute Fit-Check" 251.5 wide
            and "2/10 client spots left for 2026" 366.5 (advance widths from
            the woff2 `hmtx`), so 25 + text + 15 + 40 disc + 10 comes to 341.5
            and 28 + text + 28 to 422.5 — against the ~342 and ~422 the
            reference measures.
          */}
          {/* 24 from the sub to the first pill on phones, per the artboard —
              the 32 that stood here left the two CTAs floating away from the
              copy they answer. Desktop keeps its measured 44. */}
          {/* Phones stack the two pills in a centred column; each is sized by
              its own label, so the fit-check pill comes out a little narrower
              than the scarcity line, which is the artboard. Stretching both to
              one width was tried and is wrong — it blows the CTA out to the
              longest string on the card. From md up they go back to a centred
              wrapping row. */}
          <div className="mt-6 flex flex-col items-center gap-3 md:mt-11 md:flex-row md:flex-wrap md:justify-center md:gap-[1.75rem]">
            {/*
              The creatives "Yes" pill's fill verbatim — the header's "Book a
              Call" gradient — so every primary CTA on the page reads as the
              same button. 60 tall, radius 36, label Poppins 26, and a 40x40
              #222222 disc inset 10 from the right edge, which is the same 10
              it gets top and bottom from 60 - 40.

              Hover swaps the violet with the disc's grey rather than going
              white, and the arrow flies out and is replaced — see ArrowDisc.
            */}
            <a
              href={BOOKING_URL}
              // Hover repeats the rest state's three stop positions in white so
              // the fill can interpolate instead of snapping at the halfway point.
              className="group inline-flex h-[2.625rem] items-center gap-[0.9375rem] rounded-[2.25rem] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-6 pr-[0.375rem] text-[1rem] font-normal text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#222222_10.47%,#222222_45.54%,#222222_98.13%)] md:h-[3.75rem] md:gap-[0.9375rem] md:pl-[1.5625rem] md:pr-[0.625rem] md:text-[1.625rem]"
            >
              {FINAL_CTA.cta}
              {/* 30 across on the phone, 15 after the label, inset 6 from the
                  pill's right edge — the same 6 it gets top and bottom from
                  42 - 30. The pill is content-sized, so those three numbers
                  are all there is to its width. */}
              {/* The house arrow (see the creatives pill): a 15-unit arrow in
                  a 17-unit viewBox, the extra unit each side being the
                  stroke's overhang. So the box has to render at 17/15 of the
                  size the arrow is specified at — the phone's 10 x 10 arrow
                  needs an 11.33 box, desktop's 14 needs 15.87. Rendering the
                  box at the arrow's own size draws it 12% short.

                  Same disc, same swap and same arrow relay as the creatives
                  "Yes" pill, which is what was asked for. */}
              <ArrowDisc
                disc="size-[1.875rem] md:size-[2.5rem]"
                arrow="size-[0.70833rem] md:size-[0.991875rem]"
                viewBox="0 0 17 17"
                strokeWidth={2}
              />
            </a>

            {/* Flat white at 20% over the card — no border and no tinted fill
                of its own. Same 60 tall and radius 36 as the primary, label
                Poppins Regular 26. */}
            <span className="inline-flex h-[2.625rem] items-center justify-center rounded-full bg-white/20 px-6 text-[1rem] font-normal text-white md:h-[3.75rem] md:rounded-[2.25rem] md:px-[1.75rem] md:text-[1.625rem]">
              {FINAL_CTA.scarcity}
            </span>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
