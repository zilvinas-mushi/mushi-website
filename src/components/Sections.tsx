import { Img } from "./Img";
import { TrustBadges } from "./TrustBadges";
import { CreativeCard } from "./CreativeCard";
import {
  HERO,
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

function Stars({ count = 5 }: { count?: number }) {
  return (
    <span
      className="inline-flex gap-0.5 text-sage"
      role="img"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden="true">
          ★
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
      <div className={`${SHELL} relative pb-14 pt-14 text-center md:pt-20`}>
        {/* Animated gradient ring + panning gradient text, ported from
            mushi-app's done-for-you hero so both properties match. */}
        <span className="animated-gradient-border mb-7 inline-flex items-center rounded-full bg-brand/10 px-3 py-1.5 text-[13px] font-medium md:px-4 md:text-[17px]">
          <span className="animate-gradient-x bg-gradient-to-r from-violet-300 via-fuchsia-400 to-violet-300 bg-[length:200%_auto] bg-clip-text text-transparent">
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

        <p className="mx-auto mt-6 max-w-[620px] text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
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
    <section aria-labelledby="proof-heading" className="relative pb-24 pt-2">
      <div className={SHELL}>
        {/* Rule-and-sparkle divider from the design. */}
        <div className="flex items-center justify-center gap-4">
          <span aria-hidden="true" className="h-px max-w-[180px] flex-1 bg-white/10" />
          <h2
            id="proof-heading"
            className="whitespace-nowrap text-center text-[13px] text-white/70"
          >
            <span aria-hidden="true" className="mr-2">
              ✦
            </span>
            {SOCIAL_PROOF.headline}
            <span aria-hidden="true" className="ml-2">
              ✦
            </span>
          </h2>
          <span aria-hidden="true" className="h-px max-w-[180px] flex-1 bg-white/10" />
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
        <h2
          id="creatives-heading"
          className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          {CREATIVES.heading}
        </h2>

        {/*
          Horizontal rail. CSS scroll-snap with smooth scrolling, not a JS
          carousel — this is a static export and the rail must work unhydrated,
          which also means it keeps native trackpad and touch momentum rather
          than fighting it.

          The list bleeds to the viewport edge on small screens so the last
          card is visibly cut off, which is what signals "scrollable".
        */}
        <ul className="scroll-row -mr-5 mt-10 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto scroll-smooth pb-4 pr-5 sm:gap-5">
          {CREATIVES.items.map((item) => (
            <li key={`${item.handle}-${item.caption}`} className="flex">
              <CreativeCard item={item} />
            </li>
          ))}
        </ul>
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

        <ul className="mt-12 grid gap-8 sm:grid-cols-2">
          {CASE_STUDIES.items.map((item) => (
            <li key={item.brand}>
              <article className="flex h-full flex-col">
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-surface">
                  <span className="absolute left-5 top-4 z-10 text-lg font-medium text-white">
                    {item.brand}
                  </span>
                  <Img
                    src={item.image}
                    alt={`${item.brand} campaign work by Mushi`}
                    className="h-[260px] w-full object-cover object-top"
                  />
                </div>

                <h3 className="mt-4 text-sm font-medium leading-relaxed text-white/90">
                  {item.result}
                </h3>

                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[var(--radius-chip)] bg-white/10 px-2.5 py-1 text-[10px] tracking-wide text-white/60"
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
    <article className="mb-5 break-inside-avoid rounded-[var(--radius-card)] border border-white/10 bg-surface p-6">
      <h3 className="text-sm font-semibold">{t.title}</h3>
      <Stars />
      <div className="mt-3 space-y-3">
        {t.body.map((para, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-white/70">
            {para}
          </p>
        ))}
      </div>
      <footer className="mt-5 flex items-center gap-3">
        {t.avatar ? (
          <Img
            src={t.avatar}
            alt=""
            width={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-medium"
          >
            {t.initials}
          </span>
        )}
        <p className="text-[11px] text-dim">
          <time dateTime={t.iso}>{t.date}</time>
          {" · "}
          <span className="text-white/70">{t.author}</span>
          {" · "}
          {t.country}
        </p>
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
          className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          {TESTIMONIALS.heading}
        </h2>
        <p className="mt-3 text-sm text-muted">{TESTIMONIALS.trustLine}</p>

        <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {shown.map((t) => (
            <TestimonialCard key={t.title} t={t} />
          ))}
        </div>

        {/* Every quote stays in the DOM so crawlers see all of them; the
            disclosure only hides them visually. No JS required. */}
        {hidden.length > 0 && (
          <details className="group mt-2">
            <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-[var(--radius-pill)] border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{TESTIMONIALS.moreLabel}</span>
              <span className="hidden group-open:inline">View Less</span>
            </summary>
            <div className="mt-8 columns-1 gap-5 md:columns-2 lg:columns-3">
              {hidden.map((t) => (
                <TestimonialCard key={t.title} t={t} />
              ))}
            </div>
          </details>
        )}
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
