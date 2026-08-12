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
  const base =
    "inline-flex h-[44px] items-center justify-center rounded-[15px] px-5 text-[14px] font-semibold uppercase leading-none transition-all duration-300 ease-out hover:-translate-y-[1px] md:h-[48px] md:px-6 md:text-[18px] md:h-[calc(var(--hero-u)*0.67)] md:rounded-[calc(var(--hero-u)*0.15)] md:px-[calc(var(--hero-u)*0.32)] md:text-[length:calc(var(--hero-u)*0.24)]";
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
        "text-white bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] shadow-[0_8px_26px_-10px_rgba(110,84,181,0.95)] hover:bg-[linear-gradient(147deg,#fff_8%,#fff_42%,#fff_93%)] hover:text-[#6e54b5] hover:shadow-[0_8px_26px_-12px_rgba(255,255,255,0.45)]"
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
          className="size-[35px] shrink-0"
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
      <div className={`${SHELL} relative pb-14 pt-5 text-center md:pb-[calc(var(--hero-u)*0.56)] md:pt-[calc(var(--hero-u)*0.8)]`}>
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

          45 FLAT, not 0.45u. --hero-u only reaches 100 when the window is BOTH
          1920 wide and ~1042 tall (it is capped at 9.6vh so the hero never
          scrolls), so on a real 1920x1080 screen u is ~95 and the pill measured
          43, not 45. Since this is checked against Figma with a ruler, the
          literal number wins here. See the note on the type size below.

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

          THE TYPE AND PADDING ARE PINNED TOO, and they have to be. Once the
          box is a literal 45, a font-size that still scales off --hero-u would
          shrink the type inside a fixed-height pill on any smaller window —
          the proportions the design specifies would only be right at 1920.
          Height, type and inset are one decision: all three literal, or all
          three in u. So this is Poppins Medium 20 everywhere from md up, with
          the 28 inset that makes the copy measure Figma's 417.

          This is the ONE element on the page that opts out of the hero's
          scaling. It is small enough that it reads fine at a fixed size in a
          short window, which is not true of the headline or the stat panels —
          do not take this as a precedent for them.

          The text classes stay on THIS element: the ring is sized in `em` and
          reads its font-size from here.
        */}
        <span className="eyebrow-pill mb-7 inline-flex h-[34px] items-center justify-center rounded-[50px] px-5 text-[14px] font-medium text-black md:mb-[calc(var(--hero-u)*0.28)] md:h-[45px] md:rounded-[50px] md:px-7 md:text-[20px]">
          {HERO.eyebrow}
        </span>

        {/* The only <h1> on the page. Poppins SemiBold 80 with letter-spacing
            0 — it carried `tracking-tight` (-0.025em), which at 80px pulled
            two full pixels out of every gap. Nothing above it sets tracking, so
            dropping the class leaves it at 0 rather than needing an override. */}
        {/*
          Poppins SemiBold 80 / 80 line-height, straight from Figma.

          Literal px, not 0.8u, matching the eyebrow's 45: --hero-u is capped by
          9.6vh as well as by 5.2083vw, so it only reaches 100 on a window that
          is BOTH 1920 wide and ~1042 tall. 0.8u was rendering 63 on a 1512
          screen, not 80.

          `leading-[1]` IS the 80 line-height (80/80). It was 1.08.

          The "massive" note was about the HEADER BAR, not this — see the
          scale note in SiteHeader.tsx. Do not shrink this to match it.
        */}
        <h1
          id="hero-heading"
          className="mx-auto max-w-4xl text-balance text-[32px] font-semibold leading-[1] sm:text-[48px] md:text-[80px]"
        >
          {HERO.heading}
        </h1>

        {/* Poppins Regular 30 / 40 line-height, letter-spacing 0 — already the
            case from md up, and nothing above sets tracking. Below md it steps
            down to 16, which the phone pass still has to confirm.

            THE BREAK IS AUTHORED (see HERO_SUB_LINES). The browser was ending
            line one on "and"; a hard <br> is the only thing that guarantees the
            design's break at every width and while the fallback face is still
            showing.

            `md:max-w-none` goes with it. At 680 the second line is wider than
            the box at 30px type, so it would simply re-wrap and the <br> would
            have bought nothing. With the break authored there is no wrapping
            left to constrain — SHELL's 1380 column is the only limit needed.

            The <br> is md-and-up only. Below that the design is a different
            frame with its own break, so the phone keeps flowing inside 680.
            Note the trailing space: it is what keeps the two lines a normal
            sentence once the <br> is display:none, and CSS drops it at the
            start of a line when the break IS active, so it costs nothing. */}
        <p className="mx-auto mt-6 max-w-[680px] text-pretty text-[16px] font-normal leading-[1.33] text-white md:mt-[calc(var(--hero-u)*0.24)] md:max-w-none md:text-[length:calc(var(--hero-u)*0.3)] md:leading-[calc(var(--hero-u)*0.4)]">
          {HERO.subLines[0]}
          <br className="hidden md:inline" />{" "}
          {HERO.subLines[1]}
        </p>

        {/* `isolate` keeps the glow's -z-10 inside this row's stacking
            context — without it the glow would drop behind .hero-bg's
            background and vanish. */}
        <div className="relative isolate mt-10 flex items-center justify-center gap-2.5 sm:gap-4 md:mt-[calc(var(--hero-u)*0.4)]">
          <span
            aria-hidden="true"
            className="cta-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
          />
          <Pill href={BOOKING_URL}>{HERO.primaryCta}</Pill>
          <Pill href="#case-studies" variant="dark">
            {HERO.secondaryCta}
          </Pill>
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
    <section aria-labelledby="proof-heading" className="relative pb-48 pt-2 md:pb-[calc(var(--hero-u)*0.6)] md:pt-[calc(var(--hero-u)*0.08)]">
      <div className={SHELL}>
        {/* Rule-and-sparkle divider from the design. */}
        {/* The design's own divider ornament — a gradient line running into a
            four-pointed star — flanks the headline, mirrored on the left. */}
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/creatives/icons/divider-left.svg"
            alt=""
            width={161}
            height={21}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="h-[21px] w-auto md:h-[calc(var(--hero-u)*0.21)]"
          />
          {/* Poppins Regular 20 at every width — it was 14 stepping up to 15
              Medium, so both the size and the weight were off. */}
          <h2
            id="proof-heading"
            className="whitespace-nowrap text-center text-[20px] font-normal text-white md:text-[length:calc(var(--hero-u)*0.2)]"
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
            className="h-[21px] w-auto -scale-x-100 md:h-[calc(var(--hero-u)*0.21)]"
          />
        </div>

        {/* Official client logotypes from /public/logos. Each keeps its own
            viewBox width so relative sizing matches the design; only
            "we interiors" has no supplied SVG and falls back to text. */}
        <div className="mx-auto mt-10 max-w-3xl space-y-4 md:mt-[calc(var(--hero-u)*0.4)] md:space-y-[calc(var(--hero-u)*0.24)]">
          {/*
            The design stacks the brands as a centred pyramid — four, three,
            two, one — not a width-driven wrap, which broke rows in different
            places at every viewport. The order in content.ts already matches
            the design's reading order.
          */}
          {[[0, 4], [4, 7], [7, 9], [9, 10]].map(([from, to]) => (
            <ul
              key={from}
              className="flex flex-nowrap items-center justify-center gap-x-6 md:gap-x-12"
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
                      className="h-[19px] w-auto opacity-95 md:h-[calc(var(--hero-u)*0.26)]"
                    />
                  ) : (
                    <span className="text-[22px] font-medium tracking-tight text-white/90">
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
    <section id="templates" aria-labelledby="creatives-heading" className="py-20">
      <div className={SHELL}>
        <div className="flex items-center justify-between gap-6">
          <h2
            id="creatives-heading"
            className="text-[24px] font-semibold tracking-tight md:text-[48px]"
          >
            {CREATIVES.heading}
          </h2>

          {/*
            The heading asks a question; this pill is the answer.

            Desktop is measured, not eyeballed: 143 x 60, radius 30 on all four
            corners, a 45x45 #222222 disc inset 7.5px from the right edge (the
            same inset as the 7.5px it gets top and bottom from 60 - 45), and
            exactly 18px between the end of "Yes" and the start of the disc.
            `justify-end` is what holds both of those at once — the content is
            packed against the right edge, so the 18px gap and the 7.5px inset
            are both literal and the leftover space falls on the left of "Yes"
            instead of being a padding value that has to be kept in sync with
            the text's width.

            The fill is the header's "Book a Call" gradient verbatim so the two
            CTAs read as the same button. Hover inverts fill and text per
            CLAUDE.md, keeping a gradient on both states so it cross-fades; the
            disc stays dark through the inversion so the arrow never disappears
            against the white fill.
          */}
          <a
            href={BOOKING_URL}
            className="group inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-5 pr-[6px] text-[20px] font-semibold leading-none text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] md:h-[60px] md:w-[143px] md:justify-end md:gap-[18px] md:rounded-[30px] md:pl-0 md:pr-[7.5px] md:text-[30px] md:font-normal"
          >
            {CREATIVES.cta}
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#222222] text-white md:size-[45px]">
              {/* ~/Documents/arrow icon.svg, inlined. Its 17-unit viewBox is
                  the 15-unit arrow plus the 1-unit stroke overhang on each
                  side, so the box has to render at 17 for the drawn arrow to
                  measure the 15 it is specified at. Rendering the box itself
                  at 15 shrank the arrow to 13.2. */}
              <svg
                viewBox="0 0 17 17"
                fill="none"
                className="size-[13px] stroke-current md:size-[17px]"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M0.999888 15.9999L15.9998 1M15.9998 14.1708L15.9998 1L2.82898 1" />
              </svg>
            </span>
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
      <div className="mt-10">
        <CreativesRail />
      </div>
    </section>
  );
}

/* -------------------------------------------------------- case studies --- */

export function CaseStudies() {
  return (
    <section id="case-studies" aria-labelledby="cases-heading" className="py-20">
      <div className={SHELL}>
        <h2
          id="cases-heading"
          className="text-[24px] font-semibold tracking-tight md:text-[48px]"
        >
          {CASE_STUDIES.heading}
        </h2>

        {/*
          Two columns, with the right one pushed down so the cards stagger
          rather than sitting in level rows. That offset is the design's
          rhythm — an aligned grid reads as a table by comparison.
        */}
        {/*
          TWO INDEPENDENT COLUMNS, not a 2-column grid.

          A grid was wrong here and no gap value could have fixed it: grid rows
          span both columns, so every row is as tall as its TALLEST cell. With
          the right column pushed down 150px to stagger it, that offset inflated
          the shared row height and the left column inherited the slack as dead
          space under its tags — the huge gaps in the report. Setting `gap-y`
          only changed the small part of the distance that was actually gap.

          As two flex columns each card sits directly under the one above it, so
          the 45 IS the whole distance from a card's tag row to the next card's
          top edge. The stagger is then just a top margin on the right column.

          Cards alternate L, R, L, R to keep the design's reading order — the
          same reason TestimonialColumns splits its list by index rather than
          using CSS multicol.
        */}
        <div className="mt-12 grid gap-x-10 sm:grid-cols-2">
          {[0, 1].map((col) => (
            <ul
              key={col}
              className={`flex flex-col gap-8 md:gap-[45px] ${
                // Figma puts the left column at y 2461/3358 and the right at
                // 2611/3508 — a 150px drop, not the ~88px guessed before.
                col === 1 ? "sm:mt-[150px]" : ""
              }`}
            >
              {CASE_STUDIES.items
                .filter((_, i) => i % 2 === col)
                .map((item) => (
            <li
              key={item.brand}
            >
              <article className="relative flex h-full flex-col">
                {/* 680x680 Mask group filling its column — a square, not a
                    letterboxed crop. The mockup exports transparent, and the
                    coloured light lives INSIDE the card, washing the area
                    behind the device — orange, purple, blue, yellow per
                    brand — over the card's own dark gradient. */}
                <div
                  className="fade-border relative aspect-square overflow-hidden rounded-[18px]"
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
                      className="absolute left-6 top-5 z-10 h-[24px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    />
                  <Img
                    src={item.image}
                    alt={`${item.brand} campaign work by Mushi`}
                    className="size-full object-cover object-center"
                  />
                  {/* The exports are OPAQUE — Figma baked their dark
                      backgrounds in — so the brand colour is screen-blended
                      over the image: it lights the dark areas behind the
                      device and leaves the bright screenshot faces alone. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 mix-blend-screen"
                    // Each brand's wash has its own position and strength,
                    // tuned to the reference: Breezit hugs the top-left,
                    // Holo spreads broad, eany sits low by the phones,
                    // we interiors centres behind the laptop.
                    style={{ background: item.glow }}
                  />
                </div>

                {/* Poppins Medium 30 from md up — it was 22. On phones Holo's
                    line still runs 2px larger than the other three cards' — a
                    deliberate emphasis, not drift — but from md every card's
                    result line is the same 30. */}
                <h3
                  className={`mt-4 font-medium leading-[1.25] text-white md:mt-5 md:text-[30px] ${
                    item.brand === "Holo" ? "text-[22px]" : "text-[20px]"
                  }`}
                >
                  {item.result}
                </h3>

                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      /* 20 from md up, per Figma. The 10px base is the PHONE
                         value and stays — 20 in a phone card would wrap the
                         tag row onto several lines. Desktop only, deliberately:
                         do not collapse these two into one size. */
                      className="rounded-[6px] bg-white/[0.08] px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/55 md:text-[20px]"
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

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS.items)[number] }) {
  return (
    /* #181818 at radius 20, both from Figma. The fill was #161519, an
       eyeballed near-black. NOTE this is NOT the same grey as the
       "Trusted by 100+ brands" pill below the grid, which is #222222 — the two
       were briefly conflated. Card is darker than the control sitting on it. */
    <article className="rounded-[20px] bg-[#181818] p-7">
      {/* Title and avatar share the top row; the avatar is right-aligned. */}
      <div className="flex items-start justify-between gap-5">
        <h3 className="text-[30px] font-semibold leading-snug text-white">
          {t.title}
        </h3>
        {/* 80 x 80, per Figma — photo and initials disc alike. It was 52, which
            is what made the 35px initials look oversized: the type was right
            and the circle around it was three quarters the size it should be.
            Change the two together, never one on its own. */}
        {t.avatar ? (
          <Img
            src={t.avatar}
            alt=""
            width={80}
            className="size-[80px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-[80px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[35px] font-medium leading-none"
          >
            {t.initials}
          </span>
        )}
      </div>

      <div className="mt-3">
        <Stars />
      </div>

      <div className="mt-4 space-y-4">
        {t.body.map((para, i) => (
          <p key={i} className="text-[21px] font-normal leading-relaxed text-white/50">
            {para}
          </p>
        ))}
      </div>

      <footer className="mt-6 text-[21px] font-light text-white/40">
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
 */
function TestimonialColumns({
  list,
  flip = false,
}: {
  list: readonly (typeof TESTIMONIALS.items)[number][];
  flip?: boolean;
}) {
  const L: (typeof TESTIMONIALS.items)[number][] = [];
  const R: (typeof TESTIMONIALS.items)[number][] = [];
  list.forEach((t, i) => ((i % 2 === 0) !== flip ? L : R).push(t));
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-6">
        {L.map((t) => (
          <TestimonialCard key={t.title} t={t} />
        ))}
      </div>
      <div className="space-y-6">
        {R.map((t) => (
          <TestimonialCard key={t.title} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const { items } = TESTIMONIALS;

  return (
    <section id="agency" aria-labelledby="testimonials-heading" className="py-20">
      <div className={SHELL}>
        {/* 48/48 from the design — line-height equals the size, so the two
            sentences sit tight on top of each other. Each sentence is its own
            block rather than a <br>, so the break survives any wrapping. */}
        <h2
          id="testimonials-heading"
          className="text-[22px] font-semibold leading-tight tracking-tight md:text-[48px] md:leading-[48px]"
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
        <div className="testi-wrap relative mt-12">
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
              className="testi-fade pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-b from-transparent to-[var(--bg)]"
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
            <summary className="group/pill absolute inset-x-0 bottom-2 z-10 mx-auto flex w-fit cursor-pointer list-none items-center justify-center gap-2.5 rounded-[var(--radius-pill)] border border-white/10 bg-[#222222] py-2.5 pl-3 pr-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)] group-open:static group-open:mt-8 md:h-[62px] md:w-[594px] md:gap-4 md:py-0 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="flex -space-x-3">
                {items
                  .filter((t) => t.avatar)
                  .slice(0, 3)
                  .map((t) => (
                    <Img
                      key={t.title}
                      src={t.avatar as string}
                      alt=""
                      width={40}
                      className="size-[40px] rounded-full object-cover ring-2 ring-[#222222]"
                    />
                  ))}
              </span>

              <span className="whitespace-nowrap text-[15px] font-medium leading-[30px] text-white md:text-[21px]">
                {TESTIMONIALS.trustLine}
              </span>

              {/* #FFFFFF at 50%, per Figma. */}
              <span aria-hidden="true" className="h-5 w-px bg-white/50 md:h-[30px]" />

              {/* Phones drop the "View More" label so the pill stays one line
                  — avatars, trust line, divider, the +/− disc — per the phone
                  design. The label returns from md up. */}
              {/* The one thing that reacts to hover, and only barely: a short
                  fade on this cluster. The label and the disc move together
                  because they read as a single affordance. */}
              <span className="flex items-center gap-2.5 text-[15px] font-medium leading-[30px] text-white transition-opacity duration-500 ease-out group-hover/pill:opacity-70 md:text-[21px]">
                <span className="hidden md:inline md:group-open:hidden">{TESTIMONIALS.moreLabel}</span>
                <span className="hidden md:group-open:inline">View Less</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black md:size-[30px] md:text-[18px]">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden leading-none group-open:inline">−</span>
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
      className="scroll-mt-28 px-[15px] pb-24 pt-8 md:px-5"
    >
      {/*
        Phone frame: 345x320 card on a light-to-dark wash (see .cta-card).

        Desktop is the measured card: 1380 x 842 — the full content column
        wide (see lib/layout.ts) and a FIXED height rather than a padding
        budget. The design gives the panel's box, and letting the type set the
        height drifts it by tens of pixels every time the copy changes.

        The content block is centred in it, which leaves 272 above and below.
        The reference has it about 9px above centre; that is inside the error
        of reading a screenshot, so it does not earn a hardcoded offset.
      */}
      <div className="cta-card relative mx-auto flex min-h-[320px] w-[345px] max-w-full items-center justify-center overflow-hidden rounded-[24px] border border-transparent px-6 py-8 text-center md:h-[842px] md:min-h-0 md:w-full md:max-w-[1380px] md:border-[#8a5cf6]/45 md:px-5 md:py-0">
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
            className="text-[22px] font-semibold leading-[22px] tracking-tight md:text-[55px] md:leading-[55px]"
          >
            {FINAL_CTA.headingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {/* 24/30 Regular, white at 50%. mt-6 is the measured 24 from the
              heading's last line box. */}
          <p className="mt-6 text-[14px] font-normal leading-[19px] text-white/50 md:text-[24px] md:leading-[30px]">
            {FINAL_CTA.subLines.map((line) => (
              <span key={line} className="block">
                {line}
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-11 md:gap-[28px]">
            {/*
              The creatives "Yes" pill's fill verbatim — the header's "Book a
              Call" gradient — so every primary CTA on the page reads as the
              same button. 60 tall, radius 36, label Poppins 26, and a 40x40
              #222222 disc inset 10 from the right edge, which is the same 10
              it gets top and bottom from 60 - 40.

              Hover inverts fill and text per CLAUDE.md, keeping a gradient on
              both states so the fill cross-fades instead of snapping; the disc
              stays #222222 through the inversion so the arrow never
              disappears against the white.
            */}
            <a
              href={BOOKING_URL}
              className="group inline-flex h-[45px] items-center gap-2 rounded-full bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-6 pr-[6px] text-[16px] font-normal text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] md:h-[60px] md:gap-[15px] md:rounded-[36px] md:pl-[25px] md:pr-[10px] md:text-[26px]"
            >
              {FINAL_CTA.cta}
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#222222] text-white md:size-[40px]">
                {/* The house arrow (see the creatives pill): a 15-unit arrow
                    in a 17-unit viewBox, the extra unit each side being the
                    stroke's overhang. So the box has to render at 17/15 of the
                    size the arrow is specified at — 14 x 17/15 = 15.87 here.
                    Rendering the box itself at 14 would draw a 12.4 arrow. */}
                <svg
                  viewBox="0 0 17 17"
                  fill="none"
                  className="size-[13px] stroke-current md:size-[15.87px]"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M0.999888 15.9999L15.9998 1M15.9998 14.1708L15.9998 1L2.82898 1" />
                </svg>
              </span>
            </a>

            {/* Flat white at 20% over the card — no border and no tinted fill
                of its own. Same 60 tall and radius 36 as the primary, label
                Poppins Regular 26. */}
            <span className="inline-flex h-[45px] items-center rounded-full bg-white/20 px-6 text-[16px] font-normal text-white md:h-[60px] md:rounded-[36px] md:px-[28px] md:text-[26px]">
              {FINAL_CTA.scarcity}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
