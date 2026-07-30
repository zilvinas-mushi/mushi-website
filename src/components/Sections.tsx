import { Img } from "./Img";
import {
  HERO,
  SOCIAL_PROOF,
  CREATIVES,
  CASE_STUDIES,
  TESTIMONIALS,
  FINAL_CTA,
} from "@/lib/content";
import { BOOKING_URL } from "@/lib/site";

const SHELL = "mx-auto w-full max-w-[1200px] px-5";

function Pill({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90";
  const style =
    variant === "primary"
      ? "bg-accent text-white"
      : "border border-white/20 bg-white/5 text-white";
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

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Decorative purple glow — the design uses gradient washes behind the
          hero. Kept out of the a11y tree. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]"
      />

      <div className={`${SHELL} relative pb-16 pt-20 text-center md:pb-24 md:pt-28`}>
        <p className="mb-5 inline-block rounded-[var(--radius-pill)] border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
          {HERO.eyebrow}
        </p>

        {/* The only <h1> on the page. */}
        <h1
          id="hero-heading"
          className="mx-auto max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[80px]"
        >
          {HERO.heading}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-white/70 sm:text-lg">
          {HERO.sub}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Pill href={BOOKING_URL}>{HERO.primaryCta}</Pill>
          <Pill href="#case-studies" variant="ghost">
            {HERO.secondaryCta}
          </Pill>
        </div>

        {/*
          The design's hero visual is a composite — a dashboard mockup with
          floating stat cards layered over it. The flat Figma export split it
          into unusable fragments (masks and empty device frames), and no
          single asset represents it.

          Rather than show a wrong image in the most prominent slot, the hero
          runs on type, chips and the gradient wash. To restore it: export that
          node from Figma as one flattened image (1 get_screenshot call) and
          drop it in here with priority.
        */}
        <ul className="mx-auto mt-14 flex max-w-4xl flex-wrap justify-center gap-2">
          {HERO.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-[var(--radius-pill)] border border-white/10 bg-surface px-3.5 py-1.5 text-xs text-white/60"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- social proof --- */

export function SocialProof() {
  return (
    <section aria-labelledby="proof-heading" className="border-y border-white/5 bg-bg-alt py-14">
      <div className={SHELL}>
        <h2 id="proof-heading" className="text-center text-sm text-white/50">
          {SOCIAL_PROOF.headline}
        </h2>

        {/* Wordmarks are text, not images — no official client logo SVGs were
            supplied. See design/TOKENS.md "Client logotypes". */}
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {SOCIAL_PROOF.brands.map((brand) => (
            <li key={brand} className="text-lg font-medium text-white/40">
              {brand}
            </li>
          ))}
        </ul>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {SOCIAL_PROOF.awards.map((award) => (
            <li
              key={award.name}
              className="rounded-[var(--radius-card)] border border-white/10 bg-surface px-4 py-2.5 text-center"
            >
              <span className="block text-xs font-medium text-white/80">{award.name}</span>
              <span className="block text-[11px] text-muted">{award.detail}</span>
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

        {/* CSS scroll-snap, not a JS carousel — must work without hydration. */}
        <ul className="scroll-row mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {CREATIVES.items.map((item) => (
            <li
              key={item.title}
              className="w-[240px] shrink-0 snap-start sm:w-[280px]"
            >
              <article>
                <Img
                  src={item.image}
                  alt={`${item.title} for ${item.brand}`}
                  className="h-auto w-full rounded-[var(--radius-card)] border border-white/10 object-cover"
                />
                <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
                <p className="mt-1 text-xs text-muted">{item.brand}</p>
              </article>
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
    <section aria-labelledby="cta-heading" className="px-5 pb-24 pt-8">
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
