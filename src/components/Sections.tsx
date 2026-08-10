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
          className="mx-auto max-w-4xl text-balance text-[32px] font-semibold leading-[1.08] sm:text-6xl md:text-[length:calc(var(--hero-u)*0.8)]"
        >
          {HERO.heading}
        </h1>

        {/* Poppins Regular 30 / 40 line-height, letter-spacing 0 — already the
            case from md up, and nothing above sets tracking. Below md it steps
            down to 16, which the phone pass still has to confirm. */}
        <p className="mx-auto mt-6 max-w-[680px] text-pretty text-[16px] font-normal leading-[1.33] text-white md:mt-[calc(var(--hero-u)*0.24)] md:text-[length:calc(var(--hero-u)*0.3)] md:leading-[calc(var(--hero-u)*0.4)]">
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
            className="group inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] pl-5 pr-[6px] text-[20px] font-semibold leading-none text-white transition-all duration-150 hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_98.13%)] hover:text-[#6e54b5] md:h-[60px] md:w-[143px] md:justify-end md:gap-[18px] md:rounded-[30px] md:pl-0 md:pr-[7.5px] md:text-[30px] md:font-normal"
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
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {CASE_STUDIES.items.map((item, i) => (
            <li
              key={item.brand}
              // Figma puts the left column at y 2461/3358 and the right at
              // 2611/3508 — a 150px drop, not the ~88px guessed before.
              className={i % 2 === 1 ? "sm:mt-[150px]" : undefined}
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

                {/* On phones Holo's revenue line runs 2px larger than the
                    other three cards' — a deliberate emphasis, not drift. */}
                <h3
                  className={`mt-4 font-medium leading-[1.25] text-white md:mt-5 md:text-[22px] ${
                    item.brand === "Holo" ? "text-[22px]" : "text-[20px]"
                  }`}
                >
                  {item.result}
                </h3>

                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[6px] bg-white/[0.08] px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/55"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
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
        <h3 className="text-[30px] font-semibold leading-snug text-white">
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
        <div className="relative mt-12 [&:has(details[open])_.testi-clip]:max-h-none [&:has(details[open])_.testi-fade]:hidden">
          <div className="testi-clip relative max-h-[540px] overflow-hidden">
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
      {/* Phone frame: 345x320 card on a light-to-dark wash (see .cta-card);
          desktop keeps the dark artwork treatment and full width. */}
      <div className="cta-card relative mx-auto min-h-[320px] w-[345px] max-w-full overflow-hidden rounded-[24px] border border-transparent px-6 py-8 text-center md:min-h-0 md:w-full md:max-w-[1380px] md:border-[#8a5cf6]/45 md:py-20">
        {/* No centre glow: the design's card is black through the middle,
            with its only light rising from the bottom edge (see .cta-card). */}
        {/* The streaks live in the card background itself now — the design's
            own exported artwork (cta-streaks.svg) — replacing the hand-drawn
            stand-in curves that used to sit here. */}
        <div className="relative">
          <h2
            id="cta-heading"
            className="mx-auto max-w-3xl text-balance text-[22px] font-semibold leading-[22px] tracking-tight sm:text-[55px] sm:leading-[55px]"
          >
            {FINAL_CTA.heading}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[14px] font-normal leading-[19px] text-white/50 sm:text-[24px] sm:leading-[30px]">
            {FINAL_CTA.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* Same treatment as the creatives "Yes" pill — rounded-full,
                sentence case, arrow disc — with the house hover inversion. */}
            <a
              href={BOOKING_URL}
              className="group inline-flex h-[45px] items-center gap-2 rounded-full bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] pl-6 pr-[6px] text-[16px] font-normal text-white transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] sm:text-[20px]"
            >
              {FINAL_CTA.cta}
              <span className="flex size-[34px] items-center justify-center rounded-full bg-[#141318] text-white transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  className="size-4 stroke-current"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
                </svg>
              </span>
            </a>
            <span className="inline-flex h-[45px] items-center rounded-full border border-white/15 bg-[#17151d]/80 px-6 text-[16px] font-normal text-white/75 sm:text-[20px]">
              {FINAL_CTA.scarcity}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
