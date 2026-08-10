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
    "inline-flex h-[44px] items-center justify-center rounded-[15px] px-5 text-[14px] font-semibold uppercase leading-none transition-all duration-150 hover:-translate-y-[1px] md:h-[48px] md:px-6 md:text-[18px] md:h-[calc(var(--hero-u)*0.67)] md:rounded-[calc(var(--hero-u)*0.15)] md:px-[calc(var(--hero-u)*0.32)] md:text-[length:calc(var(--hero-u)*0.24)]";
  // Each CTA inverts its own two colours on hover — foreground and background
  // trade places. Purple-on-white becomes white-on-purple; white-on-black
  // becomes black-on-white. Both keep a gradient background layer throughout
  // so the change cross-fades rather than snapping.
  const style =
    variant === "primary"
      ? // purple bg / white text  ->  white bg / purple text
        "text-white bg-[linear-gradient(147deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] shadow-[0_8px_26px_-10px_rgba(110,84,181,0.95)] hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] hover:shadow-[0_8px_26px_-12px_rgba(255,255,255,0.45)]"
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
          className="size-[22px] shrink-0"
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
          Crisp pill, not a blur cloud: a vertical gradient — lavender rim into
          a white core and back — gives the rolled-edge look of the reference.

          It throws NOTHING outwards. The glow was a 30px-blur, 10px-spread
          box-shadow in lavender, which bled a halo onto the tiles behind it;
          it is now `inset`, so the only radiance is #6E54B5 creeping a little
          way in from the rim.
        */}
        <span className="mb-7 inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#c3b2e9_0%,#ffffff_38%,#ffffff_62%,#bfa9e6_100%)] px-5 py-2 shadow-[inset_0_0_12px_rgba(110,84,181,0.5)] md:mb-[calc(var(--hero-u)*0.28)] md:px-[calc(var(--hero-u)*0.28)] md:py-[calc(var(--hero-u)*0.12)]">
          <span className="text-[14px] font-medium text-black md:text-[length:calc(var(--hero-u)*0.2)]">
            {HERO.eyebrow}
          </span>
        </span>

        {/* The only <h1> on the page. Poppins SemiBold 80 with letter-spacing
            0 — it carried `tracking-tight` (-0.025em), which at 80px pulled
            two full pixels out of every gap. Nothing above it sets tracking, so
            dropping the class leaves it at 0 rather than needing an override. */}
        <h1
          id="hero-heading"
          // Poppins SemiBold 32 on phones, per Žilvinas 2026-08-11. The old
          // sm:text-6xl step jumped it to 60px between 640 and 767px — still
          // phone width — so 32 now holds all the way to md.
          className="mx-auto max-w-4xl text-balance text-[32px] font-semibold leading-[1.08] md:text-[length:calc(var(--hero-u)*0.8)]"
        >
          {HERO.heading}
        </h1>

        {/* Poppins Regular 30 / 40 line-height, letter-spacing 0 — already the
            case from md up, and nothing above sets tracking. Below md it steps
            down to 16, which the phone pass still has to confirm. */}
        {/* Phones: Poppins Regular 16 on a flat 20px line — Žilvinas
            2026-08-11. Desktop keeps its measured --hero-u scaling. */}
        <p className="mx-auto mt-6 max-w-[680px] text-pretty text-[16px] font-normal leading-[20px] text-white md:mt-[calc(var(--hero-u)*0.24)] md:text-[length:calc(var(--hero-u)*0.3)] md:leading-[calc(var(--hero-u)*0.4)]">
          {HERO.sub}
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
    // On phones that tail was 192px, and the next section adds 80 on top of
    // it — nearly 270px of empty screen between the logo strip and "Want
    // Creatives This Premium?". Halved to 96; the ramp still has room to
    // dissolve. Desktop keeps its --hero-u scaling.
    <section aria-labelledby="proof-heading" className="relative pb-[37.5px] pt-2 md:pb-[calc(var(--hero-u)*0.6)] md:pt-[calc(var(--hero-u)*0.08)]">
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
            className="h-[21px] min-w-0 flex-1 object-cover object-right md:h-[calc(var(--hero-u)*0.21)] md:w-auto md:flex-none"
          />
          {/* Poppins Regular — 20 from md up, 14 on the phone so the line still
              fits on one row at 375. The dividers flanking it flex into
              whatever width is left over. */}
          <h2
            id="proof-heading"
            className="whitespace-nowrap text-center text-[14px] font-normal text-white md:text-[length:calc(var(--hero-u)*0.2)]"
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
            className="h-[21px] min-w-0 flex-1 -scale-x-100 object-cover object-right md:h-[calc(var(--hero-u)*0.21)] md:w-auto md:flex-none"
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
    <section id="templates" aria-labelledby="creatives-heading" className="py-[37.5px] md:py-20">
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
            // mr-3 on phones only: at the shell's 20px gutter the pill read as
            // jammed into the right edge, so it is pulled in a little. Desktop
            // keeps the measured alignment.
            className="group mr-3 inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-5 pr-[6px] text-[20px] font-normal leading-none text-white transition-all duration-150 hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_98.13%)] hover:text-[#6e54b5] md:mr-0 md:h-[60px] md:w-[143px] md:justify-end md:gap-[18px] md:rounded-[30px] md:pl-0 md:pr-[7.5px] md:text-[30px]"
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
    <section id="case-studies" aria-labelledby="cases-heading" className="py-[37.5px] md:py-20">
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

          Each column is its OWN list rather than a two-column grid. A grid
          sizes each row to its tallest cell, so the right column's 140px drop
          was silently inflating the left column's vertical gap to 138px —
          the spacing could not be set, only fought. Separate columns make the
          70px between a card's badges and the next card's artwork exact.
        */}
        <div className="mt-12 flex flex-col gap-y-[70px] sm:flex-row sm:gap-x-[18px] sm:gap-y-0">
          {[0, 1].map((col) => (
            <ul
              key={col}
              className={`flex flex-1 flex-col gap-y-[70px] ${
                col === 1 ? "sm:mt-[140px]" : ""
              }`}
            >
              {CASE_STUDIES.items.filter((_, i) => i % 2 === col).map((item) => (
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
                    wherever the line happens to run out. */}
                <h3 className="mt-4 whitespace-pre-line text-[20px] font-medium leading-[1.25] text-white md:mt-5 md:text-[30px]">
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
                      className="rounded-[6px] bg-[#191919] px-3.5 py-1.5 text-[20px] font-normal uppercase tracking-wide text-[#9e9e9e]"
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
    <article className="rounded-[20px] bg-[#161519] p-7">
      {/* Title and avatar share the top row; the avatar is right-aligned. */}
      <div className="flex items-start justify-between gap-5">
        {/* 16/16 on the phone — the line-height equals the size, so a title
            that wraps sits as a tight two-line block. 30 from md up. */}
        <h3 className="text-[16px] font-semibold leading-4 text-white md:text-[30px] md:leading-snug">
          {t.title}
        </h3>
        {t.avatar ? (
          <Img
            src={t.avatar}
            alt=""
            width={52}
            className="size-[52px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-medium"
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
          <p key={i} className="text-[14px] font-normal leading-relaxed text-white/50 md:text-[21px]">
            {para}
          </p>
        ))}
      </div>

      {/* The byline is a touch dimmer than the quote from md up; on the phone
          the design puts both at 50%. */}
      <footer className="mt-6 text-[14px] font-light text-white/50 md:text-[21px] md:text-white/40">
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
    <section id="agency" aria-labelledby="testimonials-heading" className="py-[37.5px] md:py-20">
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
        <div className="relative mt-12 [&:has(details[open])_.testi-clip]:max-h-none [&:has(details[open])_.testi-fade]:hidden">
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
          <div className="testi-clip relative max-h-[1170px] overflow-hidden lg:max-h-[840px] xl:max-h-[740px]">
            <TestimonialColumns list={items} />
            <div
              aria-hidden="true"
              className="testi-fade pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-b from-transparent to-[var(--bg)]"
            />
          </div>

          <details className="group">
            {/* 594 × 62 from the design, fixed from md up so the pill matches
                the measured box rather than hugging its content. Phones keep
                the content-width pill — 594 would overflow a 375 viewport. */}
            <summary className="group/pill absolute inset-x-0 bottom-2 z-10 mx-auto flex w-fit cursor-pointer list-none items-center justify-center gap-2.5 rounded-[var(--radius-pill)] border border-white/10 bg-[#1b1a1f] py-2.5 pl-3 pr-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)] transition-colors duration-150 hover:bg-white group-open:static group-open:mt-8 md:h-[62px] md:w-[594px] md:gap-4 md:py-0 [&::-webkit-details-marker]:hidden">
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
                      className="size-[40px] rounded-full object-cover ring-2 ring-[#1b1a1f]"
                    />
                  ))}
              </span>

              <span className="whitespace-nowrap text-[15px] font-medium leading-[30px] text-white transition-colors group-hover/pill:text-black md:text-[21px]">
                {TESTIMONIALS.trustLine}
              </span>

              <span aria-hidden="true" className="h-5 w-px bg-white/15 transition-colors group-hover/pill:bg-black/20 md:h-[30px]" />

              {/* Phones drop the "View More" label so the pill stays one line
                  — avatars, trust line, divider, the +/− disc — per the phone
                  design. The label returns from md up. */}
              <span className="flex items-center gap-2.5 text-[15px] font-medium leading-[30px] text-white transition-colors group-hover/pill:text-black md:text-[21px]">
                <span className="hidden md:inline md:group-open:hidden">{TESTIMONIALS.moreLabel}</span>
                <span className="hidden md:group-open:inline">View Less</span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black transition-colors group-hover/pill:bg-black group-hover/pill:text-white md:size-[30px] md:text-[18px]">
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
      <div className="cta-card relative mx-auto flex h-[320px] w-[345px] max-w-full items-center justify-center overflow-hidden rounded-[15px] border border-transparent px-6 text-center md:h-[842px] md:w-full md:max-w-[1380px] md:rounded-[24px] md:border-[#8a5cf6]/45 md:px-5">
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
              className="group inline-flex h-[42px] items-center gap-2 rounded-[36px] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-6 pr-[6px] text-[16px] font-normal text-white transition-all duration-150 hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_98.13%)] hover:text-[#6e54b5] md:h-[60px] md:gap-[15px] md:pl-[25px] md:pr-[10px] md:text-[26px]"
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
