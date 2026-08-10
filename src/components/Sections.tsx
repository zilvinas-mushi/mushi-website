import { Img } from "./Img";
import { TrustBadges } from "./TrustBadges";
import { CreativesRail } from "./CreativesRail";
import {
  HERO,
  HERO_FLOATERS,
  SOCIAL_PROOF,
  CREATIVES,
  CASE_STUDIES,
  TESTIMONIALS,
  FINAL_CTA,
} from "@/lib/content";
import { BOOKING_ANCHOR, BOOKING_URL } from "@/lib/site";

const SHELL = "mx-auto w-full max-w-[1200px] px-5";

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
  // Measured from Figma nodes 3803:1672/1673 (primary) and 3803:1583/1584
  // (secondary): 67px tall, 15px radius, Poppins SemiBold 24px. The frame is
  // 1921px wide, so values are scaled ~0.75 for a 1440 viewport.
  const base =
    "inline-flex h-[44px] items-center justify-center rounded-[15px] px-5 text-[14px] font-semibold uppercase leading-none transition-all duration-150 hover:-translate-y-[1px] md:h-[48px] md:px-6 md:text-[18px] lg:h-[56px] lg:px-8 lg:text-[24px]";
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
 * and cannot carry the tile colour. Trustpilot-style: square corners, and the
 * star runs nearly edge to edge rather than floating small in the middle.
 */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <span
      className="inline-flex gap-1"
      role="img"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="flex size-[22px] items-center justify-center bg-[#7c54b5]"
        >
          <svg viewBox="0 0 24 24" className="size-[17px] fill-white">
            <path d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9L12 2.6z" />
          </svg>
        </span>
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
      {/*
        Platform marks — THREE nested layers, which is what gives them depth:

          outer   large translucent frosted tile, hairline edge, cast shadow
          middle  a second inset tile in a slightly DIFFERENT tone (~76%) —
                  not the same value as the outer; that difference is the
                  whole effect and reads as a bevel
          logo    the brand mark itself (~52%), its own rounded tile

        Two layers looked flat and one looked pasted on. The doubled square is
        the detail that makes them sit in the scene.

        z-[3] puts these above the stat panels: in the design the Instagram
        mark overlaps the left-hand panel, so the icons win.

        Decorative, so aria-hidden with empty alt. Hidden below lg, where there
        is no room beside the headline.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
      >
        {HERO_FLOATERS.map((f) => (
          <span
            key={f.name}
            className={`absolute ${f.pos} flex items-center justify-center rounded-[28px] border border-white/[0.06] bg-white/[0.025] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-[6px]`}
            style={{
              transform: `rotate(${f.rotate})`,
              width: f.size,
              height: f.size,
            }}
          >
            {/* The inner tile is LIGHTER than the outer, not darker — that is
                what lifts the logo forward. Having it darker inverted the
                bevel and made the stack read as a hole. */}
            <span
              className="flex items-center justify-center rounded-[21px] border border-white/[0.10] bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
              style={{
                width: Math.round(f.size * 0.76),
                height: Math.round(f.size * 0.76),
              }}
            >
              <Img
                src={f.image}
                alt=""
                width={Math.round(f.size * 0.52)}
                className="rounded-[13px] shadow-[0_6px_14px_-5px_rgba(0,0,0,0.75)]"
              />
            </span>
          </span>
        ))}
      </div>

      <div className={`${SHELL} relative pb-14 pt-5 text-center md:pt-20`}>
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
          a white core and back — gives the rolled-edge look of the reference,
          and the halo lives in a box-shadow OUTSIDE the shape so the edge
          itself stays sharp. The earlier blurred white fill destroyed the
          silhouette entirely.
        */}
        <span className="mb-7 inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#c3b2e9_0%,#ffffff_38%,#ffffff_62%,#bfa9e6_100%)] px-5 py-2 shadow-[0_0_30px_10px_rgba(140,106,226,0.35)] md:px-7 md:py-3">
          <span className="text-[14px] font-medium text-black md:text-[20px]">
            {HERO.eyebrow}
          </span>
        </span>

        {/* The only <h1> on the page. */}
        <h1
          id="hero-heading"
          className="mx-auto max-w-4xl text-balance text-[32px] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[80px]"
        >
          {HERO.heading}
        </h1>

        <p className="mx-auto mt-6 max-w-[680px] text-pretty text-[16px] font-normal leading-[1.33] text-white md:text-[30px] md:leading-[40px]">
          {HERO.sub}
        </p>

        {/* `isolate` keeps the glow's -z-10 inside this row's stacking
            context — without it the glow would drop behind .hero-bg's
            background and vanish. */}
        <div className="relative isolate mt-10 flex items-center justify-center gap-2.5 sm:gap-4">
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
    // Deep bottom padding on purpose: it gives the hero's violet ramp a long
    // run of near-black to dissolve into before the next section starts, which
    // is what makes the handover read as a fade rather than a stop. With a
    // short tail the gradient had to resolve too fast and the join showed.
    <section aria-labelledby="proof-heading" className="relative pb-48 pt-2">
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
            className="h-[21px] w-auto"
          />
          <h2
            id="proof-heading"
            className="whitespace-nowrap text-center text-[14px] font-normal text-white md:text-[15px] md:font-medium"
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
            className="h-[21px] w-auto -scale-x-100"
          />
        </div>

        {/* Official client logotypes from /public/logos. Each keeps its own
            viewBox width so relative sizing matches the design; only
            "we interiors" has no supplied SVG and falls back to text. */}
        <div className="mx-auto mt-10 max-w-3xl space-y-4 md:space-y-6">
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
                      className="h-[19px] w-auto opacity-95 md:h-[26px]"
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

          {/* The heading asks a question; this pill is the answer. Violet
              pill with a circular arrow badge, as in the design. */}
          <a
            href={BOOKING_URL}
            // Figma 3803:1218: the pill is 143x60 with a 45x45 circle inset
            // 7px from the right — 107x45 with a 34px circle at 1440.
            className="group inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] pl-5 pr-[6px] text-[20px] font-semibold text-white md:h-[58px] md:pl-7 md:pr-2 md:text-[30px] transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]"
          >
            {CREATIVES.cta}
            <span className="flex size-[34px] items-center justify-center rounded-full bg-[#141318] text-white transition-colors md:size-[42px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                className="size-5 stroke-current md:size-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </span>
          </a>
        </div>

        {/* Finite carousel with auto-drift, a progress timeline and prev/next
            controls — see CreativesRail. The design's progress line implies a
            carousel, not the endless duplicated marquee that was here. */}
        <div className="mt-10">
          <CreativesRail />
        </div>
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
                <h3 className="mt-4 whitespace-pre-line text-[30px] font-medium leading-[1.25] text-white md:mt-5">
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
    <article className="rounded-[18px] bg-[#161519] p-7">
      {/* Title and avatar share the top row; the avatar is right-aligned. */}
      <div className="flex items-start justify-between gap-5">
        <h3 className="text-[19px] font-semibold leading-snug text-white">
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
          <p key={i} className="text-[14px] leading-relaxed text-white/65">
            {para}
          </p>
        ))}
      </div>

      <footer className="mt-6 text-[13px] text-white/40">
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
        <h2
          id="testimonials-heading"
          className="text-[22px] font-semibold leading-tight tracking-tight md:text-[48px]"
        >
          {TESTIMONIALS.heading}
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
            <summary className="group/pill absolute inset-x-0 bottom-2 z-10 mx-auto flex w-fit cursor-pointer list-none items-center gap-2.5 rounded-[var(--radius-pill)] md:gap-4 border border-white/10 bg-[#1b1a1f] py-2.5 pl-3 pr-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)] transition-colors duration-150 hover:bg-white group-open:static group-open:mt-8 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="flex -space-x-3">
                {items
                  .filter((t) => t.avatar)
                  .slice(0, 3)
                  .map((t) => (
                    <Img
                      key={t.title}
                      src={t.avatar as string}
                      alt=""
                      width={34}
                      className="size-[34px] rounded-full object-cover ring-2 ring-[#1b1a1f]"
                    />
                  ))}
              </span>

              <span className="whitespace-nowrap text-[15px] font-medium text-white transition-colors group-hover/pill:text-black">
                {TESTIMONIALS.trustLine}
              </span>

              <span aria-hidden="true" className="h-5 w-px bg-white/15 transition-colors group-hover/pill:bg-black/20" />

              {/* Phones drop the "View More" label so the pill stays one line
                  — avatars, trust line, divider, the +/− disc — per the phone
                  design. The label returns from md up. */}
              <span className="flex items-center gap-2.5 text-[15px] font-medium text-white transition-colors group-hover/pill:text-black">
                <span className="hidden md:inline md:group-open:hidden">{TESTIMONIALS.moreLabel}</span>
                <span className="hidden md:group-open:inline">View Less</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-[16px] leading-none text-black transition-colors group-hover/pill:bg-black group-hover/pill:text-white">
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
      <div className="cta-card relative mx-auto min-h-[320px] w-[345px] max-w-full overflow-hidden rounded-[24px] border border-transparent px-6 py-8 text-center md:min-h-0 md:w-full md:max-w-[1200px] md:border-[#8a5cf6]/45 md:py-20">
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
