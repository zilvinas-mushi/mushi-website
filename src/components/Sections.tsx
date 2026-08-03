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
    "inline-flex h-[50px] items-center justify-center rounded-[15px] px-7 text-[18px] font-semibold uppercase leading-none transition-all duration-150 hover:-translate-y-[1px]";
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
          className="flex size-[22px] items-center justify-center rounded-[4px] bg-[#7c54b5]"
        >
          <svg viewBox="0 0 24 24" className="size-[13px] fill-white">
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

      <div className={`${SHELL} relative pb-14 pt-14 text-center md:pt-20`}>
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
        <span className="mb-7 inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#c3b2e9_0%,#ffffff_38%,#ffffff_62%,#bfa9e6_100%)] px-7 py-2.5 shadow-[0_0_30px_10px_rgba(140,106,226,0.35)]">
          <span className="text-[15px] font-semibold text-black md:text-[16px]">
            {HERO.eyebrow}
          </span>
        </span>

        {/* The only <h1> on the page. */}
        <h1
          id="hero-heading"
          className="mx-auto max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[80px]"
        >
          {HERO.heading}
        </h1>

        <p className="mx-auto mt-6 max-w-[620px] text-pretty text-base leading-relaxed text-white sm:text-lg">
          {HERO.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
            className="whitespace-nowrap text-center text-[15px] font-medium text-white"
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
        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-7">
          {SOCIAL_PROOF.brands.map((brand) => (
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
                  className="h-[25px] w-auto opacity-90 transition-opacity hover:opacity-100"
                />
              ) : (
                <span className="text-[22px] font-medium tracking-tight text-white/90">
                  {brand.name}
                </span>
              )}
            </li>
          ))}
        </ul>
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
            className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {CREATIVES.heading}
          </h2>

          {/* The heading asks a question; this pill is the answer. Violet
              pill with a circular arrow badge, as in the design. */}
          <a
            href={BOOKING_URL}
            // Figma 3803:1218: the pill is 143x60 with a 45x45 circle inset
            // 7px from the right — 107x45 with a 34px circle at 1440.
            className="group inline-flex h-[45px] shrink-0 items-center gap-2 rounded-[var(--radius-pill)] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] pl-5 pr-[6px] text-[18px] font-semibold text-white transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]"
          >
            {CREATIVES.cta}
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
          className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
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
                  className="relative aspect-square overflow-hidden rounded-[18px]"
                  style={{
                    background: `radial-gradient(ellipse 100% 80% at 38% 10%, ${item.glow}59 0%, ${item.glow}1f 42%, transparent 68%), ${item.bg}`,
                  }}
                >
                  {/* Brand mark inside the artwork, top-left — the same logo
                      artwork as the brand strip, not a text stand-in.
                      we interiors has no supplied logo and stays text. */}
                  {item.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/logos/${item.logo}`}
                      alt={item.brand}
                      width={item.logoW}
                      height={25}
                      loading="lazy"
                      decoding="async"
                      className="absolute left-6 top-5 z-10 h-[24px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    />
                  ) : (
                    <span className="absolute left-6 top-5 z-10 text-[19px] font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      {item.brand}
                    </span>
                  )}
                  <Img
                    src={item.image}
                    alt={`${item.brand} campaign work by Mushi`}
                    className="size-full object-cover object-center"
                  />
                </div>

                <h3 className="mt-4 text-[15px] font-medium leading-snug text-white">
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
    <article className="mb-6 break-inside-avoid rounded-[18px] bg-[#161519] p-7">
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

export function Testimonials() {
  const { items, visibleCount } = TESTIMONIALS;
  const shown = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);

  return (
    <section id="agency" aria-labelledby="testimonials-heading" className="py-20">
      <div className={SHELL}>
        <h2
          id="testimonials-heading"
          className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
        >
          {TESTIMONIALS.heading}
        </h2>

        {/*
          Two columns of quote cards. Every quote stays in the DOM so crawlers
          see all of them — the disclosure only reveals what is visually
          clipped, it does not fetch anything.
        */}
        <details className="group relative mt-12">
          <div className="columns-1 gap-6 md:columns-2">
            {shown.map((t) => (
              <TestimonialCard key={t.title} t={t} />
            ))}
          </div>

          {/* Clipped tail: the remaining quotes are cropped to a sliver and
              faded out, which is what the floating pill sits over. */}
          <div className="relative max-h-[210px] overflow-hidden group-open:max-h-none">
            <div className="columns-1 gap-6 md:columns-2">
              {hidden.map((t) => (
                <TestimonialCard key={t.title} t={t} />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[210px] bg-gradient-to-b from-transparent to-[var(--bg)] group-open:hidden"
            />
          </div>

          {/* Floating pill straddling the fade: avatar stack, trust line, and
              the disclosure toggle. */}
          <summary className="absolute inset-x-0 bottom-0 z-10 mx-auto flex w-fit cursor-pointer list-none items-center gap-4 rounded-[var(--radius-pill)] border border-white/10 bg-[#1b1a1f] py-2.5 pl-3 pr-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)] group-open:static group-open:mt-8 [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="flex -space-x-3">
              {TESTIMONIALS.items
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

            <span className="text-[15px] font-medium text-white">
              {TESTIMONIALS.trustLine}
            </span>

            <span aria-hidden="true" className="h-5 w-px bg-white/15" />

            <span className="flex items-center gap-2.5 text-[15px] font-medium text-white/85">
              <span className="group-open:hidden">{TESTIMONIALS.moreLabel}</span>
              <span className="hidden group-open:inline">View Less</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[16px] leading-none">
                <span className="group-open:hidden">+</span>
                <span className="hidden leading-none group-open:inline">−</span>
              </span>
            </span>
          </summary>
        </details>
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
      className="scroll-mt-28 px-5 pb-24 pt-8"
    >
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[20px] border border-white/10 bg-bg-alt px-6 py-20 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[120px]"
        />
        <div className="relative">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {FINAL_CTA.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-sm text-white/70">
            {FINAL_CTA.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Pill href={BOOKING_URL}>{FINAL_CTA.cta}</Pill>
            <span className="rounded-[var(--radius-pill)] border border-white/15 px-5 py-3 text-xs text-white/60">
              {FINAL_CTA.scarcity}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
