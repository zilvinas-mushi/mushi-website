import { Fragment } from "react";
import { Img } from "./Img";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL, BOOKING_URL } from "@/lib/site";

const SHELL = "mx-auto w-full max-w-[1200px] px-5";

/**
 * The hero badge's gradient, shared by its ring and its text so they read as
 * one piece. Stops sampled from the zoomed badge reference: purple through
 * orchid into salmon.
 */
const BADGE_GRADIENT =
  "linear-gradient(90deg,#7b5bbd 0%,#cc77d1 52%,#d0777b 100%)";

/**
 * /templates hero — badge, headline, CTA, then the app-window mockup with
 * floating category tiles either side. Built from the supplied screenshot of
 * the Templates design; the colour burst behind it lives in globals.css
 * (.tpl-burst) on the wrapper in page.tsx, same split as the home hero.
 */
export function TemplatesHero() {
  return (
    <section aria-labelledby="templates-heading" className="relative">

      <div className={`${SHELL} relative z-[1] pt-10 text-center md:pt-[clamp(32px,7svh,80px)]`}>
        {/* Gradient-ringed chip, not the home hero's frosted white pill. Ring
            and text share ONE purple-to-salmon gradient, sampled from the
            zoomed badge reference (2026-09-03) — the ring via the
            --agb-gradient override, the text via background-clip. */}
        <span
          className="animated-gradient-border inline-flex items-center rounded-full bg-[#0d0a14]/80 px-5 py-2"
          style={{ "--agb-gradient": BADGE_GRADIENT } as React.CSSProperties}
        >
          <span
            className="bg-clip-text text-[12px] font-medium tracking-[0.02em] text-transparent md:text-[14px]"
            style={{ backgroundImage: BADGE_GRADIENT }}
          >
            {TEMPLATES_PAGE.badge}
          </span>
        </span>

        {/* The only <h1> on the page. Figma typography panel (2026-09-03,
            confirmed by Žilvinas 2026-09-05): Poppins SemiBold 80/80
            (leading 1.0), 0% letter spacing, centred — so no tracking-tight,
            and 80 at the 1920 reference.

            THE DESKTOP SIZE IS FLUID, NOT A BREAKPOINT LADDER. It was
            28 / 44 / 56, which never reached the drawn 80 at any width: the
            ladder topped out at 56 and stayed there from 1024 to 2560. 4.1667vw
            IS 80 at 1920 — the same "one 1920 number, expressed as a
            proportion" the home page uses for its own 80px h1 (see --hero-w in
            globals.css) — and it scales down through 60 at 1440 rather than
            stepping. The 44 floor holds the old size where the column is
            narrowest; the 80 ceiling stops it growing past the drawn size on
            wider monitors.

            The gap above is 40 (Žilvinas 2026-09-05); it was 24. Same fluid
            treatment, and 2.0833vw is 40 at 1920.

            max-w rises with it: at 80px the first line measures past 1000, and
            the cap was re-wrapping the line the design keeps whole.

            NO `text-balance` — the break is authored in
            TEMPLATES_PAGE.headingLines, after "Shortcut". Balance equalises
            the two lines and lands after "Shortcut to" instead, and it moves
            with the window. Below sm the two lines are still allowed to wrap
            further; the <br> only guarantees that ONE break is always there. */}
        <h1
          id="templates-heading"
          className="mx-auto mt-6 max-w-[1240px] text-[28px] font-semibold leading-none sm:text-[44px] md:mt-[clamp(24px,2.0833vw,40px)] lg:text-[clamp(44px,4.1667vw,80px)]"
        >
          {TEMPLATES_PAGE.headingLines[0]}
          <br />
          {TEMPLATES_PAGE.headingLines[1]}
        </h1>

        {/* THE BUTTON IS MEASURED, NOT SIZED BY ITS LABEL (Žilvinas
            2026-09-05): 385 x 96 with a 15 radius at the 1920 reference. It
            was header-CTA sized — 56 tall, 8 radius, width whatever the words
            came to — which is a different object from the one on the artboard.

            Width is now EXPLICIT and the label centred inside it, so the box
            is the design's box whatever the copy does; padding-driven width
            was the reason it could never be 385.

            All four numbers ride the same 1920 proportion as the headline
            above (96 = 5vw, 385 = 20.052vw, 15 = 0.78vw, label 30 = 1.5625vw),
            with floors at the old phone values so nothing below md changes.
            The label size is the one number the artboard did not give — 30 is
            the scale step that fits the 96-tall box; correct it if the file
            says otherwise.

            The gap above is 70, up from 32.

            Hover still inverts its own two colours with the gradient layer
            kept in both states (CLAUDE.md). Per the button reference
            (2026-09-03) the highlight stays pinned to the LEFT edge and is
            dead by mid-button — the house 140deg ramp lit the whole top-left
            half too brightly here. */}
        <a
          href={APP_URL}
          className="group mt-8 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[8px] bg-[linear-gradient(120deg,#a08ade_0%,#8764c1_22%,#7b54b5_48%,#6e54b5_100%)] px-7 text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(110,84,181,0.9)] transition-all duration-150 hover:bg-[linear-gradient(120deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] md:mt-[clamp(32px,3.6458vw,70px)] md:h-[clamp(56px,5vw,96px)] md:w-[clamp(230px,20.052vw,385px)] md:gap-[clamp(10px,0.833vw,16px)] md:rounded-[clamp(8px,0.78vw,15px)] md:px-0 md:text-[clamp(19px,1.5625vw,30px)]"
        >
          {TEMPLATES_PAGE.cta}
          {/* The design's own dart glyph ("Icon.png", supplied 2026-09-03),
              applied as a mask painted with currentColor so it inverts with
              the button's hover — the raw white PNG would stay white on the
              white hover fill. Per its Figma vector panel the glyph is a
              16.71x18.92 path with a centred 3px stroke rotated -90deg,
              which renders 21.9x19.7 at 1x; sized two steps down from that
              per the button reference. */}
          <span
            aria-hidden="true"
            /* Grows with the label rather than staying at its phone size —
               a 15-wide dart beside 30px type in a 96-tall button read as a
               speck. 24 x 21 at 1920 keeps the glyph's own 21.9:19.7 ratio. */
            className="inline-block h-[13px] w-[15px] bg-current md:h-[clamp(13px,1.094vw,21px)] md:w-[clamp(15px,1.25vw,24px)]"
            style={{
              WebkitMaskImage: "url(/images/templates/cta-arrow.png)",
              maskImage: "url(/images/templates/cta-arrow.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </a>
      </div>

      <AppWindow />
    </section>
  );
}

/**
 * Rule-and-diamond eyebrow shared by every /templates section: gradient
 * hairlines running into small four-pointed stars either side of the label.
 * Label typography per its Figma panel (2026-09-03): Poppins Regular 30px,
 * 0% letter spacing, centred — filled with the hero badge's
 * purple-to-salmon gradient, per the client's palette instruction.
 */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        aria-hidden="true"
        className="h-px w-16 bg-gradient-to-r from-transparent via-[#7b5bbd] to-[#d0777b] md:w-28"
      />
      <span aria-hidden="true" className="text-[13px] leading-none text-[#cc77d1]">
        ✦
      </span>
      <p
        className="bg-clip-text text-[20px] font-normal uppercase leading-none text-transparent md:text-[30px]"
        style={{ backgroundImage: BADGE_GRADIENT }}
      >
        {children}
      </p>
      <span aria-hidden="true" className="text-[13px] leading-none text-[#cc77d1]">
        ✦
      </span>
      <span
        aria-hidden="true"
        className="h-px w-16 bg-gradient-to-l from-transparent via-[#7b5bbd] to-[#d0777b] md:w-28"
      />
    </div>
  );
}

/**
 * "Process" three-step section — pick a template, customize in Canva, test.
 * Step visuals are crops from the reference screenshot; each card's CSS
 * gradient is sampled from the same reference and the .process-shot mask
 * fades the crop's four edges into it, so the two read as one surface.
 */
export function TemplatesProcess() {
  const p = TEMPLATES_PAGE.process;
  return (
    <section aria-labelledby="process-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{p.eyebrow}</SectionEyebrow>

        <h2
          id="process-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {p.heading}
        </h2>

        {/* A real ordered list — the arrows only draw what the markup already
            says. Discs are hidden on phones, where the cards stack. */}
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-2">
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -left-[26px] top-1/2 z-10 hidden size-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0d0c11] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] md:flex"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.4"
                    className="size-[20px] stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h13M13 6l6 6-6 6"
                    />
                  </svg>
                </span>
              )}
              <article
                className="flex h-full flex-col overflow-hidden rounded-[20px] p-5 md:p-6"
                // The design's own gradient panel (2026-09-04), with the
                // sampled CSS gradient behind it as a loading fallback.
                style={{
                  backgroundImage: `url(/images/templates/${s.card}), ${s.gradient}`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">
                  {s.step}
                </p>
                <h3 className="mt-1 text-[20px] font-semibold leading-tight text-white md:text-[22px]">
                  {s.title}
                </h3>
                {/* Negative margins run the visual to the card's edges; the
                    chip floats over its faded bottom. */}
                <div className="relative -mx-5 -mb-5 mt-3 flex-1 md:-mx-6 md:-mb-6">
                  <Img src={s.image} alt={s.alt} className="process-shot w-full" />
                  <span className="absolute bottom-4 left-5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold leading-none text-black shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] md:left-6">
                    {s.chip}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * FAQ — ten disclosure rows. Native <details>/<summary>, the house pattern
 * (see the home testimonials): every answer stays in the DOM for crawlers
 * and the section works with no JS. The reference shows the rows collapsed;
 * answers are drafted from this page's own claims (see content.ts).
 */
export function TemplatesFaq() {
  const f = TEMPLATES_PAGE.faq;
  return (
    <section aria-labelledby="faq-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{f.eyebrow}</SectionEyebrow>
        <h2
          id="faq-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {f.heading}
        </h2>

        <div className="mx-auto mt-12 max-w-[880px] space-y-3">
          {f.items.map((item) => (
            <details key={item.q} className="group rounded-[14px] bg-[#1b1b1b]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-[17px] text-[14px] font-medium text-white md:px-6 md:text-[15px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.2"
                  className="size-[18px] shrink-0 stroke-white transition-transform duration-150 group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-[14px] leading-relaxed text-white/60 md:px-6 md:text-[15px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * "Team" note — the founders' cards and three labelled paragraphs inside
 * one panel. Portraits are the design's own 88px crops shown at natural
 * size; everything else is text.
 */
export function TemplatesTeam() {
  const t = TEMPLATES_PAGE.team;
  return (
    <section aria-labelledby="team-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
        <h2
          id="team-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {t.heading}
        </h2>

        <div className="mx-auto mt-12 max-w-[880px] rounded-[20px] bg-[#141414] p-5 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {t.people.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-5 rounded-[14px] bg-[#1b1b1b]"
              >
                <span className="relative h-[126px] w-[180px] shrink-0">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden rounded-l-[14px]"
                    style={{ background: p.backdrop }}
                  />
                  {/* Bottom-anchored and taller than the card, so the hair
                      pops over the top edge as in the design. */}
                  <span className="absolute bottom-0 left-1/2 w-full -translate-x-1/2">
                    <Img
                      src={p.image}
                      alt={`${p.name}, ${p.role} at Mushi`}
                      className="mx-auto h-[140px] w-auto max-w-none"
                    />
                  </span>
                </span>
                <div className="min-w-0 pr-4">
                  <p className="truncate text-[20px] font-semibold text-white md:text-[22px]">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium" style={{ color: p.color }}>
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-6">
            {t.notes.map((n) => (
              <div key={n.label}>
                <h3 className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#858585]">
                  {n.label}
                </h3>
                <p className="mt-1.5 text-[17px] leading-relaxed text-white/90 md:text-[18px]">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Competitor marks for the comparison table — styled text and drawn glyphs,
 * not the brands' real logos (interim rule, TOKENS.md "Client logotypes").
 */
function CompetitorMark({ name }: { name: string }) {
  if (name === "Kandy") {
    return <Img src="templates/cmp-kandy.webp" alt={name} width={54} />;
  }
  if (name === "CreativeOS") {
    return (
      <>
        <Img src="templates/cmp-creativeos-icon.webp" alt="" width={40} className="-mr-2.5" />
        <Img
          src="templates/cmp-creativeos.webp"
          alt={name}
          width={104}
          className="hidden md:block"
        />
      </>
    );
  }
  return (
    <>
      <Img src="templates/cmp-konvert-icon.webp" alt="" width={22} className="rounded-[6px]" />
      <Img src="templates/cmp-konvert.webp" alt={name} width={82} />
    </>
  );
}

/** One table value: string as text, boolean as check / red cross. */
function CompareValue({ v, mushi }: { v: string | boolean; mushi?: boolean }) {
  if (typeof v === "string") {
    return (
      <span
        className={
          mushi
            ? "text-[18px] font-semibold text-white md:text-[21px]"
            : "text-[17px] font-semibold text-[#ff5b5b] md:text-[20px]"
        }
      >
        {v}
      </span>
    );
  }
  return v ? (
    <span role="img" aria-label="Yes">
      <Img src="templates/cmp-check.webp" alt="" width={20} />
    </span>
  ) : (
    <span role="img" aria-label="No">
      <Img src="templates/cmp-x.webp" alt="" width={15} />
    </span>
  );
}

/**
 * "Comparison" table — Mushi as a raised purple column over the row bands,
 * against three competitor template shops. One CSS grid with explicit
 * row/column placement: the banded row backgrounds span the full width at
 * z-0, the purple column card floats over them spanning every row (z-1,
 * slightly wider via negative margins), and all cell content sits above at
 * z-10. DOM order stays row-major, so the linear reading order is sensible.
 */
export function TemplatesComparison() {
  const c = TEMPLATES_PAGE.comparison;
  const lastRow = c.rows.length + 2;
  return (
    <section aria-labelledby="comparison-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{c.eyebrow}</SectionEyebrow>
        <h2
          id="comparison-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {c.heading}
        </h2>

        <div
          className="mx-auto mt-12 grid max-w-[880px] grid-cols-[minmax(0,1.7fr)_repeat(4,minmax(0,1fr))] gap-y-2"
          style={{ gridTemplateRows: `72px repeat(${c.rows.length}, 56px) 76px` }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-[1] col-start-2 row-start-1 -mx-1 md:-mx-2.5"
            style={{ gridRowEnd: lastRow + 1 }}
          >
            {/* The asset's opaque card sits at 27.3-72.5% x / 13.3-86.6% y of
                its canvas — the rest is glow. Oversizing the layer by those
                fractions maps the card to the column and lets the glow spill
                past it, as the design intends. */}
            <span
              className="absolute"
              style={{
                left: "-60.4%",
                right: "-60.8%",
                top: "-18.1%",
                bottom: "-18.3%",
                backgroundImage: "url(/images/templates/compare-card.webp)",
                backgroundSize: "100% 100%",
              }}
            />
          </div>

          <span className="z-10 col-start-2 row-start-1 self-center justify-self-center">
            <Img src="templates/cmp-mushi.webp" alt="Mushi" width={82} className="w-[56px] md:w-[82px]" />
          </span>
          {c.competitors.map((name, i) => (
            <span
              key={name}
              className="z-10 row-start-1 flex items-center gap-1.5 self-center justify-self-center"
              style={{
                gridColumnStart: i + 3,
                // Nudge CreativeOS right so its enlarged emblem clears the
                // purple column's glow.
                ...(name === "CreativeOS" ? { marginLeft: 22 } : {}),
              }}
            >
              <CompetitorMark name={name} />
            </span>
          ))}

          {c.rows.map((row, r) => (
            <Fragment key={row.label}>
              {r % 2 === 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none relative col-span-full"
                  style={{ gridRowStart: r + 2 }}
                >
                  {/* The band's dark core is 91% x 41% of its canvas; the
                      oversize maps the core to the row and lets the noise
                      glow breathe past it. */}
                  <span
                    className="absolute"
                    style={{
                      left: "-4.9%",
                      right: "-4.9%",
                      top: "-72.7%",
                      bottom: "-72.7%",
                      backgroundImage: "url(/images/templates/cmp-row-band.webp)",
                      backgroundSize: "100% 100%",
                    }}
                  />
                </div>
              )}
              <span
                className="z-10 col-start-1 self-center pl-3 text-[13px] leading-tight text-white/90 md:pl-5 md:text-[16px]"
                style={{ gridRowStart: r + 2 }}
              >
                {row.label}
              </span>
              <span
                className="z-10 col-start-2 self-center justify-self-center"
                style={{ gridRowStart: r + 2 }}
              >
                <CompareValue v={row.mushi} mushi />
              </span>
              {row.others.map((v, i) => (
                <span
                  key={i}
                  className="z-10 self-center justify-self-center"
                  style={{ gridRowStart: r + 2, gridColumnStart: i + 3 }}
                >
                  <CompareValue v={v} />
                </span>
              ))}
            </Fragment>
          ))}

          {/* White pill on the card's foot; inverts to black on hover. */}
          <a
            href={APP_URL}
            className="z-10 col-start-2 self-center justify-self-center whitespace-nowrap rounded-full bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] px-3 py-2.5 text-[12px] font-semibold leading-none text-black transition-all duration-150 hover:bg-[linear-gradient(147deg,#000_0%,#000_100%)] hover:text-white md:px-5 md:text-[14px]"
            style={{ gridRowStart: lastRow }}
          >
            {/* The supplied label artwork, masked with currentColor so it
                follows the pill's hover inversion (black -> white). */}
            <span
              aria-hidden="true"
              className="inline-block h-[14px] w-[87px] bg-current"
              style={{
                WebkitMaskImage: "url(/images/templates/cmp-get-mushi.webp)",
                maskImage: "url(/images/templates/cmp-get-mushi.webp)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            <span className="sr-only">{c.cta}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/** The supplied white icon artwork for the Access benefit list. */
function AccessIcon({ name }: { name: string }) {
  return (
    <Img src={`templates/${name}.webp`} alt="" width={22} className="shrink-0" />
  );
}

/**
 * "Access" pricing — the from-scratch pain card against the $5 template
 * plan, with the done-for-you banner bridging to the agency offer below.
 * Everything is text, emoji and inline SVG.
 */
export function TemplatesAccess() {
  const a = TEMPLATES_PAGE.access;
  return (
    <section aria-labelledby="access-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{a.eyebrow}</SectionEyebrow>
        <h2
          id="access-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {a.heading}
        </h2>

        <div className="mx-auto mt-12 grid max-w-[980px] gap-5 md:grid-cols-2 md:gap-6">
          {/* From scratch. */}
          <article
            className="flex flex-col rounded-[20px] bg-[#111111] bg-cover bg-center p-6 md:p-7"
            style={{ backgroundImage: "url(/images/templates/access-card-dark.webp)" }}
          >
            <header className="flex items-center gap-3.5">
              <Img src="templates/access-emoji-bad.webp" alt="" width={44} className="rounded-[12px]" />
              <div>
                <h3 className="text-[17px] font-semibold text-white">
                  {a.scratch.title}
                </h3>
                <p className="text-[13px] text-white/45">{a.scratch.sub}</p>
              </div>
            </header>
            <p className="mt-7">
              <span className="bg-[linear-gradient(180deg,#dd898b_0%,#c5696a_55%,#b65556_100%)] bg-clip-text text-[38px] font-semibold leading-none text-transparent md:text-[44px]">
                {a.scratch.figure}
              </span>{" "}
              <span className="text-[16px] font-medium text-[#c5696a]">
                {a.scratch.unit}
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {a.scratch.items.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[19px] text-white/90 md:text-[20px]">
                  <Img src="templates/icon-x.webp" alt="" width={18} className="shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            {/* Outlined button; inverts its own colours on hover like every
                other button (transparent/white -> white/black), with gradient
                layers in both states so the fill cross-fades. */}
            <a
              href={BOOKING_URL}
              className="mt-8 inline-flex h-[60px] items-center justify-center rounded-[12px] border border-white bg-[url(/images/templates/access-btn-dark.webp)] bg-cover text-[24px] font-normal uppercase tracking-[0.06em] text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black"
            >
              {a.scratch.cta}
            </a>
          </article>

          {/* With templates — the highlighted plan. */}
          <article
            className="flex flex-col rounded-[20px] border border-[#8a5cf6]/50 bg-[#131017] bg-cover bg-center p-6 shadow-[0_30px_80px_-30px_rgba(110,84,181,0.5)] md:p-7"
            style={{ backgroundImage: "url(/images/templates/access-card-purple.webp)" }}
          >
            <header className="flex items-center gap-3.5">
              <Img src="templates/access-emoji-good.webp" alt="" width={44} className="rounded-[12px]" />
              <div>
                <h3 className="text-[17px] font-semibold text-white">
                  {a.templates.title}
                </h3>
                <p className="text-[13px] text-white/45">{a.templates.sub}</p>
              </div>
            </header>
            <p className="mt-7 flex items-center gap-3">
              <span className="bg-[linear-gradient(180deg,#a08ade_0%,#9275ce_50%,#7f56b6_100%)] bg-clip-text text-[38px] font-semibold leading-none text-transparent md:text-[44px]">
                {a.templates.figure}
              </span>
              <span className="text-[16px] font-medium text-[#9b79e2]">
                {a.templates.unit}
              </span>
              <span className="ml-auto rounded-full bg-[#232323] px-6 py-3 text-[18px] font-normal uppercase tracking-[0.04em] text-white">
                {a.templates.chip}
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {a.templates.items.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-[19px] text-white/90 md:text-[20px]">
                  <AccessIcon name={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
            <a
              href={APP_URL}
              className="mt-8 inline-flex h-[60px] items-center justify-center rounded-[12px] bg-[url(/images/templates/access-btn-purple.webp)] bg-cover text-[24px] font-semibold uppercase tracking-[0.06em] text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]"
            >
              {a.templates.cta}
            </a>
          </article>
        </div>

        {/* Done-for-you banner, bridging to the agency offer. */}
        <aside
          // The light hairs live INSIDE the banner: the swoosh artwork is the
          // top layer of the banner's own background stack.
          className="relative mx-auto mt-5 flex max-w-[980px] flex-col items-start gap-4 overflow-hidden rounded-[18px] p-5 sm:flex-row sm:items-center md:mt-6 md:px-6"
          style={{
            backgroundImage:
              "url(/images/templates/access-rays.webp), linear-gradient(100deg,#1c1426 0%,#150f1e 45%,#0d0a12 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/templates/access-banner-emoji.svg"
              alt=""
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="rounded-[10px]"
            />
            <div>
              <p className="text-[16px] font-semibold text-white">{a.banner.title}</p>
              <p className="text-[13px] text-white/45">{a.banner.sub}</p>
            </div>
          </div>
          <a
            href={BOOKING_URL}
            className="group inline-flex h-[46px] items-center gap-2.5 rounded-full border border-white/70 bg-[linear-gradient(147deg,#100d16_0%,#100d16_100%)] pl-2 pr-5 text-[15px] font-semibold uppercase tracking-[0.05em] text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black sm:ml-auto"
          >
            <span className="flex size-[32px] items-center justify-center rounded-full bg-white text-black">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.4"
                className="size-[15px] stroke-current"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
            {a.banner.cta}
          </a>
        </aside>
      </div>

    </section>
  );
}

/**
 * "Showcase" masonry wall under "1 cent = 1 design" — the design's own
 * baked composition ("showcase.png", supplied 2026-09-04), shipped verbatim
 * as one full-bleed image: stagger, edge cuts and black field are all in
 * the artwork, replacing the CSS column system that reproduced it. The wall
 * is decorative imagery of third-party ads, so it stays aria-hidden.
 */
export function TemplatesShowcase() {
  const s = TEMPLATES_PAGE.showcase;
  return (
    <section aria-labelledby="showcase-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{s.eyebrow}</SectionEyebrow>
        <h2
          id="showcase-heading"
          className="relative z-10 mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {s.heading}
        </h2>
      </div>

      {/* Pulled up under the heading so it sits just above the wall's first
          tile row — the artwork's top region is empty black. */}
      <div aria-hidden="true" className="-mt-10 md:-mt-16">
        <Img src="templates/showcase-wall.webp" alt="" className="w-full" />
      </div>
    </section>
  );
}

/**
 * "Inside" bento — what comes with the library: support, industry coverage,
 * reviews, monthly drops. Card visuals are the design's own baked exports
 * (2026-09-04): memoji cluster + "Need help?" bubble, faded industry-chip
 * rows, and the dimmed template collage ship as card backgrounds; the
 * laurel artwork is a CSS mask painted in the design's faint grey so it
 * reads correctly on the dark card.
 */
export function TemplatesInside() {
  const s = TEMPLATES_PAGE.inside;
  const CARD = "relative overflow-hidden rounded-[18px] bg-[#121114] bg-cover bg-center p-6";
  const BIG = "bg-[linear-gradient(100deg,#7150b5_0%,#a68ede_70%,#c3b1ec_100%)] bg-clip-text text-[34px] font-semibold leading-none text-transparent md:text-[40px]";
  const SMALL = "bg-[linear-gradient(100deg,#7150b5_0%,#a68ede_70%,#c3b1ec_100%)] bg-clip-text text-[20px] font-medium text-transparent md:text-[24px]";
  return (
    <section aria-labelledby="inside-heading" className="pb-24 md:pb-28">
      <div className={SHELL}>
        <SectionEyebrow>{s.eyebrow}</SectionEyebrow>

        <h2
          id="inside-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {s.heading}
        </h2>

        {/* Bento: two stacked rows on the left (support + industries over the
            wide reviews card), one tall card on the right spanning both. */}
        <div className="mx-auto mt-12 grid max-w-[1080px] gap-3 md:grid-cols-[1fr_1fr_1.2fr] md:grid-rows-[auto_auto]">
          {/* 24/7 support — the baked art carries the memoji cluster and the
              "Need help?" bubble, so only the headline renders as text. */}
          <article
            className={`${CARD} min-h-[210px]`}
            style={{ backgroundImage: "url(/images/templates/inside-support.webp)" }}
          >
            <p className="relative">
              <span className={BIG}>{s.support.big}</span>
              <span className={`${SMALL} mt-1 block`}>{s.support.small}</span>
            </p>
          </article>

          {/* 5 industries — chip rows baked into the background art. */}
          <article
            className={`${CARD} flex min-h-[210px] flex-col justify-end`}
            style={{ backgroundImage: "url(/images/templates/inside-industries.webp)" }}
          >
            <p className="relative">
              <span className={BIG}>{s.industries.big}</span>
              <span className={`${SMALL} mt-1 block`}>{s.industries.small}</span>
            </p>
          </article>

          {/* Trustpilot, spanning under both cards. Wordmark is styled text —
              see the note on TEMPLATES_PAGE.inside. */}
          <article
            className={`${CARD} flex min-h-[190px] flex-col items-center justify-center text-center md:col-span-2`}
          >
            {/* The laurel export as a mask painted with the design grey —
                the artwork itself is black, invisible on this card. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[#221f26]"
              style={{
                WebkitMaskImage: "url(/images/templates/laurel-mask.webp)",
                maskImage: "url(/images/templates/laurel-mask.webp)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            <span
              className="relative inline-flex gap-1"
              role="img"
              aria-label="5 out of 5 stars"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="flex size-[19px] items-center justify-center bg-[#7c54b5]"
                >
                  <svg viewBox="0 0 24 24" className="size-[14px] fill-white">
                    <path d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9L12 2.6z" />
                  </svg>
                </span>
              ))}
            </span>
            <span className="relative mt-3 inline-flex items-center gap-1.5 text-[22px] font-semibold text-white">
              <svg viewBox="0 0 24 24" className="size-[20px] fill-white" aria-hidden="true">
                <path d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9L12 2.6z" />
              </svg>
              Trustpilot
            </span>
            <p className={`${SMALL} relative mt-2 !text-[20px]`}>{s.reviews.caption}</p>
          </article>

          {/* 50+ new templates monthly — the dimmed collage is the baked
              background, anchored to the card's bottom like the design. */}
          <article
            className={`${CARD} flex min-h-[360px] flex-col md:col-start-3 md:row-span-2 md:row-start-1`}
            style={{
              backgroundImage: "url(/images/templates/inside-monthly.webp)",
              backgroundPosition: "center bottom",
            }}
          >
            <p className="relative">
              <span className={BIG}>{s.monthly.big}</span>
              <span className={`${SMALL} mt-1 block`}>{s.monthly.small}</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/**
 * "Difference" comparison — competitors' template libraries (a trash can of
 * half-finished ads) against the same ad as a finished Mushi template. The
 * two visuals are crops from the reference screenshot; every edge of each
 * crop carries a sliver of its card's background, so the card fills below
 * are matched to the sampled values (#101010 dark, #7b54b5/#9a81d6 purple)
 * and must move with them.
 */
export function TemplatesDifference() {
  const d = TEMPLATES_PAGE.difference;
  return (
    <section aria-labelledby="difference-heading" className="pb-24 pt-24 md:pb-28 md:pt-28">
      <div className={SHELL}>
        <SectionEyebrow>{d.eyebrow}</SectionEyebrow>

        <h2
          id="difference-heading"
          className="mt-4 text-center text-[28px] font-semibold tracking-tight md:text-[48px]"
        >
          {d.heading}
        </h2>

        <div className="mx-auto mt-12 grid max-w-[1080px] gap-6 md:grid-cols-2 md:gap-8">
          {/* Competitors. Card panel, trash composition and the Kandy /
              CreativeOS chips are the design's own exports (2026-09-03);
              only Konvert's chip remains drawn — no asset was supplied.
              The visuals are positioned against the card itself: the can
              bleeds past the card's bottom edge, the tilted ad tucks behind
              its rim, and the caption sits ON the picture, per the
              reference. The card takes its height from the Mushi card
              beside it (grid stretch). */}
          <article
            className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[24px] bg-[#101010] bg-cover bg-center p-6 md:p-7"
            style={{ backgroundImage: "url(/images/templates/diff-card-dark.webp)" }}
          >
            <ul className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
              {d.bad.brands.map((brand) => (
                <li key={brand} className="flex items-center">
                  {brand === "Konvert" ? (
                    <span className="flex h-9 items-center gap-1.5 rounded-[10px] bg-white px-3 font-satoshi text-[16px] font-bold text-black">
                      <span
                        aria-hidden="true"
                        className="flex size-4 items-center justify-center rounded-[5px] bg-[#5b5bf0] text-[11px] font-bold leading-none text-white"
                      >
                        +
                      </span>
                      {brand}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/images/templates/chip-${brand.toLowerCase()}.svg`}
                      alt={brand}
                      width={brand === "Kandy" ? 79 : 155}
                      height={36}
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-auto"
                    />
                  )}
                </li>
              ))}
            </ul>
            <div role="img" aria-label={d.bad.alt} className="absolute inset-0">
              {/* The bin is split in two layers so the ads sit INSIDE it:
                  the full can renders first (its back rim behind the ads),
                  the ads go on top, and the can's front wall — a crop of the
                  same artwork from the near lip down, bottom-aligned so it
                  registers pixel-perfect — covers their lower ends. */}
              <span className="absolute left-[-5%] top-[21%] block w-[110%]">
                <Img src="templates/diff-trashcan.webp" alt="" className="w-full" />
              </span>
              {/* Small ADD-heading card peeking behind the big ad. */}
              <span className="absolute left-[5%] top-[36%] block w-[24%]">
                <Img src="templates/diff-ad-add.webp" alt="" className="w-full" />
              </span>
              <span className="absolute left-[10%] top-[13%] block w-[87%]">
                <Img src="templates/diff-ad-bad.webp" alt="" className="w-full" />
              </span>
              <span className="absolute left-[-5%] top-[21%] block aspect-[900/940] w-[110%]">
                <span className="absolute bottom-0 left-0 block w-full">
                  <Img src="templates/diff-can-front.webp" alt="" className="w-full" />
                </span>
              </span>
            </div>
            <p className="relative z-10 mt-auto text-[20px] font-bold leading-tight text-white md:text-[24px]">
              {d.bad.lead}{" "}
              <span className="font-normal text-white/50">{d.bad.rest}</span>
            </p>
          </article>

          {/* Mushi. justify-between: chip top, ad centred, caption pinned to
              the bottom so both cards' captions align. */}
          <article className="flex flex-col justify-between overflow-hidden rounded-[24px] bg-[radial-gradient(ellipse_95%_75%_at_50%_38%,#9a81d6_0%,#7b54b5_80%)] p-6 md:p-7">
            {/* White chip carrying the wordmark artwork — the design's one
                black rendering of the mark. */}
            <div className="flex justify-center">
              <span className="flex h-9 items-center rounded-[10px] bg-white px-4">
                <Img src="templates/diff-mushi-mark.webp" alt="Mushi" width={68} />
              </span>
            </div>
            <Img
              src="templates/diff-ad-good.webp"
              alt={d.good.alt}
              className="mx-auto mt-5 w-full"
            />
            <p className="mt-6 text-[20px] font-bold leading-tight text-white md:text-[24px]">
              {d.good.lead}{" "}
              <span className="font-normal text-white/75">{d.good.rest}</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/**
 * Category tiles beside the window, per the final hero reference: ~190px
 * dark tiles with a soft radial glow, label on top, the supplied emoji
 * artwork at 100px beneath. z-0 puts them UNDER the MacBook (z-1), as the
 * reference layers them; the wrapper's overflow-hidden supplies the
 * viewport-edge cuts. Decorative, so aria-hidden; hidden below xl.
 */
function CategoryTiles() {
  return (
    /* inset-0 of the MACHINE now, not of the section — see the note on
       TEMPLATES_PAGE.categories. */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden xl:block"
    >
      {TEMPLATES_PAGE.categories.map((c, i) => (
        <span
          key={`${c.label}-${i}`}
          /* 230 SQUARE, radius 30, and the fill is Figma's own two-stop radial
             — #393939 at 0% to #000000 at 100%, both at full opacity
             (Žilvinas 2026-09-05, read off the fill panel). It was 190 square
             with a three-stop grey ramp centred high at 42%, which made the
             tile smaller than the ones inside the MacBook screenshot beside
             it; they are meant to read as the same object.

             Expressed as a SHARE OF THE MACHINE'S WIDTH — 22.8% is 230
             against its 1010 reference — so the tile and the identical tiles
             printed inside the screenshot stay the same size as the machine
             resizes. A vw-based size drifted from them the moment the
             machine stopped being 1010 wide. */
          className={`absolute ${c.pos} flex aspect-square w-[22.8%] flex-col items-center gap-2.5 rounded-[30px] bg-[radial-gradient(circle_at_50%_50%,#393939_0%,#000000_100%)] pt-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]`}
        >
          <span className="text-[17px] font-semibold uppercase tracking-[0.02em] text-white">
            {c.label}
          </span>
          <Img src={c.image} alt="" width={100} />
        </span>
      ))}
    </div>
  );
}

/**
 * The MacBook mockup: the real artwork ("Macbook 1.png", supplied
 * 2026-09-03) replacing the CSS-built stand-in window — screen chrome, tabs,
 * template grid and filter bar are all baked into the image. Eager-loaded:
 * it is the page's hero visual (CLAUDE.md). The bottom edge is cut mid-tile
 * in the artwork itself, so the library reads as continuing past the fold.
 */
function AppWindow() {
  return (
    // max-w per the final hero reference: the MacBook spans ~980px at 1440,
    // which also closes the gap to the category tiles beside it.
    /* .tpl-machine is what makes the whole hero end above the fold — it sets
       this box's width from the height the block above it did not use. See
       the rule in globals.css. */
    <div className="tpl-machine relative z-[1] mx-auto mt-10 w-full max-w-[1010px] px-4 md:mt-[clamp(20px,5svh,56px)] md:max-w-none md:px-0">
      <CategoryTiles />
      {/* NO ROUNDED CLIP, NO SCALE (Žilvinas 2026-09-05: "as the mac
          screenshot attached — not you added some stupid corners").

          The master already draws the device frame and the screen's own
          corners. Wrapping it in `overflow-hidden rounded-[22px]` added a
          SECOND set of corners at a different radius, and the `scale-[1.02]`
          that pushed the artwork's own bezel out past that clip is what made
          the two sets visibly disagree. The image goes in as it comes. */}
      {/* relative z-[1] puts the machine ABOVE the tiles it now contains —
          the inner second-row pair is meant to slide under it. As static
          content it painted below every absolutely-positioned tile, which is
          the opposite of the reference. */}
      <Img
        src="templates/hero-macbook.webp"
        alt="The Mushi template library on a MacBook: a grid of ad templates with industry filters"
        className="relative z-[1] w-full"
        priority
      />
    </div>
  );
}
