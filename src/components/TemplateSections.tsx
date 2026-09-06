import { Fragment, type CSSProperties } from "react";
import { Img } from "./Img";
import { Logo } from "./Logo";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL, BOOKING_URL, TEMPLATES_HERO_CTA_ID } from "@/lib/site";

// 15 either side on the phone (artboard 2026-09-06: the cards measure
// 345 inside a 375 frame); the desktop reference keeps its 20.
/**
 * Every section's h2, on the phone: Poppins SemiBold 36/36 with no tracking,
 * 23 under its eyebrow (artboard 2026-09-06 — the same pair everywhere, which
 * is why it is a constant rather than six copies), and 37 above whatever the
 * section puts under it.
 *
 * text-balance is what makes the two-line ones break where the artboard does
 * — "Best Deal on / The Market", not "Best Deal on The / Market" — by
 * minimising the longest line rather than filling the first. It is a phone
 * measure only; the desktop's 48 is laid out at a width where balancing would
 * start second-guessing breaks that are already right.
 */
const SECTION_TITLE =
  "mt-[23px] text-balance text-center text-[36px] font-semibold leading-9 md:mt-4 md:text-wrap md:text-[48px] md:leading-tight md:tracking-tight";

const SHELL = "mx-auto w-full max-w-[1200px] px-[15px] md:px-5";

/**
 * The hero badge's gradient, shared by its ring and its text so they read as
 * one piece. The three stops verbatim from Figma's fill panel (2026-09-06):
 * #6E54B5 / #CB76D0 / #D07678 at 0 / 50 / 100, linear and evenly spaced —
 * these replace values sampled by eye off a zoomed screenshot, which had the
 * midpoint at 52% and every stop a shade light.
 */
const BADGE_GRADIENT =
  "linear-gradient(90deg,#6e54b5 0%,#cb76d0 50%,#d07678 100%)";

/**
 * /templates hero — badge, headline, CTA, then the app-window mockup with
 * floating category tiles either side. Built from the supplied screenshot of
 * the Templates design; the colour burst behind it lives in globals.css
 * (.tpl-burst) on the wrapper in page.tsx, same split as the home hero.
 */
export function TemplatesHero() {
  return (
    <section aria-labelledby="templates-heading" className="relative">
      <CategoryTiles />

      {/* 38, not 40: the phone artboard puts 46 between the header bar's
          bottom edge and the badge, and the bar's own 12px bottom inset (the
          shell's pb-2 plus its rounding) is part of that measurement. */}
      <div className={`${SHELL} relative z-[1] pt-[2.375rem] text-center md:pt-20`}>
        {/* Gradient-ringed chip, not the home hero's frosted white pill. Ring
            and text share ONE purple-to-salmon gradient, sampled from the
            zoomed badge reference (2026-09-03) — the ring via the
            --agb-gradient override, the text via background-clip. */}
        <span
          className="animated-gradient-border inline-flex items-center rounded-[50px] bg-[#0d0a14]/80 px-5 py-2"
          // Radius 50 and a 2-weight stroke, per the phone artboard. Figma
          // calls the stroke "Outside"; the ring is masked INSIDE the box
          // here, which on a pill this size is the same picture and keeps the
          // badge's own width honest.
          style={
            {
              "--agb-gradient": BADGE_GRADIENT,
              "--agb-width": "2px",
            } as React.CSSProperties
          }
        >
          <span
            // Poppins Medium 15 on the phone (artboard 2026-09-06); the
            // desktop reference is its own 14.
            className="bg-clip-text text-[15px] font-medium tracking-[0.02em] text-transparent md:text-[14px]"
            style={{ backgroundImage: BADGE_GRADIENT }}
          >
            {TEMPLATES_PAGE.badge}
          </span>
        </span>

        {/* The only <h1> on the page. Figma typography panel (2026-09-03):
            Poppins SemiBold 80/80 (leading 1.0), 0% letter spacing, centred —
            so no tracking-tight, and 80px at the desktop reference width. */}
        <h1
          id="templates-heading"
          className="mx-auto mt-6 max-w-[1000px] text-balance text-[28px] font-semibold leading-none sm:text-[44px] lg:text-[56px]"
        >
          {TEMPLATES_PAGE.heading}
        </h1>

        {/* Header-CTA sizing rather than the home hero's pill — the reference
            shows a compact rounded-rect button. Hover inverts its own two
            colours, gradient layer kept in both states (CLAUDE.md). */}
        <a
          id={TEMPLATES_HERO_CTA_ID}
          href={APP_URL}
          // Per the button reference (2026-09-03): sharper 8px corners, and
          // the highlight pinned to the LEFT edge, dead by mid-button — the
          // house 140deg ramp lit the whole top-left half too brightly here.
          //
          // The hover repeats ALL FOUR of those stop positions in white
          // (CLAUDE.md): a 2-stop white against a 4-stop violet cannot
          // interpolate, so the fill jumped instead of cross-fading — which
          // read as the invert having been dropped altogether.
          className="group mt-[1.875rem] inline-flex h-[54px] items-center gap-2.5 rounded-[8px] bg-[linear-gradient(120deg,#a08ade_0%,#8764c1_22%,#7b54b5_48%,#6e54b5_100%)] px-7 text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(110,84,181,0.9)] transition-all duration-150 hover:bg-[linear-gradient(120deg,#fff_0%,#fff_22%,#fff_48%,#fff_100%)] hover:text-[#6e54b5] md:mt-8 md:h-[56px] md:px-8 md:text-[19px]"
        >
          {TEMPLATES_PAGE.cta}
          {/* The design's own arrow, from the supplied "arrow icon.svg"
              (2026-09-06) — its path verbatim, at the artboard's 14 square.
              The file's own viewBox is 16 x 15, so the glyph lands 14 x 13
              inside that box, which is the same 13/14 the artboard reports.

              Two changes to the file: `stroke` becomes currentColor, so the
              arrow inverts with the button's hover instead of staying white
              on white, and the fixed width/height give way to a class. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 15"
            fill="none"
            className="size-[14px] shrink-0"
          >
            <path
              d="M1.25293 2.08593C1.0626 1.63108 0.967435 1.40366 1.00923 1.2641C1.04547 1.14311 1.13552 1.0483 1.25054 1.01006C1.38322 0.965948 1.59961 1.06575 2.03241 1.26535L14.3147 6.92981C14.7054 7.10999 14.9008 7.20008 14.9606 7.32603C15.0125 7.43541 15.0125 7.5641 14.9606 7.67348C14.9008 7.79943 14.7054 7.88952 14.3147 8.0697L2.03241 13.7342C1.59961 13.9338 1.38321 14.0336 1.25054 13.9894C1.13552 13.9512 1.04547 13.8564 1.00923 13.7354C0.967435 13.5959 1.0626 13.3684 1.25293 12.9136L3.41344 7.7504C3.45208 7.65807 3.4714 7.61191 3.47903 7.56395C3.48579 7.52145 3.48579 7.47806 3.47903 7.43556C3.4714 7.38761 3.45208 7.34144 3.41344 7.24911L1.25293 2.08593Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
      {/* PHONES GET THE ARTBOARD'S OWN RULES (Žilvinas 2026-09-06): a line
          that fades from black into the star's colour, with a four-pointed
          star ON its inner end — supplied as "left line + star.png" and
          "right star + line.png". The CSS pair below draws a hairline and a
          text glyph, which is close at 30px and obviously not the same shape
          at 18.

          Both files are scaled by ONE factor (110 / the left file's 425), so
          the two stars come out the same size; that leaves the right rule at
          117, which is the asymmetry the exports themselves have. */}
      <Img src="templates/eyebrow-left.webp" alt="" width={110} className="md:hidden" />

      <span
        aria-hidden="true"
        className="hidden h-px w-16 bg-gradient-to-r from-transparent via-[#7b5bbd] to-[#d0777b] md:block md:w-28"
      />
      <span
        aria-hidden="true"
        className="hidden text-[13px] leading-none text-[#cc77d1] md:inline"
      >
        ✦
      </span>
      {/* Poppins Regular 18 on the phone (artboard 2026-09-06), 30 at the
          desktop reference. */}
      <p
        className="bg-clip-text text-[18px] font-normal uppercase leading-none text-transparent md:text-[30px]"
        style={{ backgroundImage: BADGE_GRADIENT }}
      >
        {children}
      </p>
      <span
        aria-hidden="true"
        className="hidden text-[13px] leading-none text-[#cc77d1] md:inline"
      >
        ✦
      </span>
      <span
        aria-hidden="true"
        className="hidden h-px w-16 bg-gradient-to-l from-transparent via-[#7b5bbd] to-[#d0777b] md:block md:w-28"
      />

      <Img src="templates/eyebrow-right.webp" alt="" width={117} className="md:hidden" />
    </div>
  );
}

/**
 * "Process" three-step section — pick a template, customize in Canva, test.
 * Step visuals are crops from the reference screenshot; each card's CSS
 * gradient is sampled from the same reference and the .process-shot mask
 * fades the crop's four edges into it, so the two read as one surface.
 */
/**
 * A heading that breaks at its comma ON THE PHONE only.
 *
 * "Quick to Launch, Hard to Miss" is two lines on the artboard, split exactly
 * there; at 36px in a 345 column the natural break falls after "Hard", which
 * leaves one word alone on the second line. The desktop reference is one line
 * and the <br> is display:none there, so nothing changes above md.
 */
/**
 * A heading that breaks before a given word ON THE PHONE only.
 *
 * The banner's line falls after "premium" on the artboard, which is neither
 * the natural wrap nor a comma — see BreakAtComma for the other case.
 */
function BreakBefore({ text, word }: { text: string; word: string }) {
  const at = text.indexOf(word);
  if (at < 1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at).trimEnd()}
      <br className="md:hidden" />
      {text.slice(at)}
    </>
  );
}

function BreakAtComma({ text }: { text: string }) {
  const at = text.indexOf(", ");
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at + 1)}
      <br className="md:hidden" />
      {text.slice(at + 2)}
    </>
  );
}

export function TemplatesProcess() {
  const p = TEMPLATES_PAGE.process;
  return (
    <section aria-labelledby="process-heading" className="pt-[61px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{p.eyebrow}</SectionEyebrow>

        <h2
          id="process-heading"
          className={SECTION_TITLE}
        >
          <BreakAtComma text={p.heading} />
        </h2>

        {/* A real ordered list — the arrows only draw what the markup already
            says. Discs are hidden on phones, where the cards stack. */}
        <ol className="mt-[37px] grid gap-[15px] md:mt-10 md:grid-cols-3 md:gap-2">
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative">
              {/* THE PHONE'S JOIN between two steps: a 66 black disc centred
                  on the 15 gap — so it laps onto both cards — carrying a 43
                  #181818 disc and a downward arrow, 13 x 17. The desktop's
                  own disc points RIGHT and sits in the column gutter; same
                  idea, different axis, so they stay separate elements rather
                  than one rotated by a breakpoint.

                  -7.5 then -translate-y-1/2 centres it on the GAP rather than
                  on the card's top edge, which is half a gap lower. */}
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[-7.5px] z-10 flex size-[66px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black md:hidden"
                >
                  <span className="flex size-[43px] items-center justify-center rounded-full bg-[#181818]">
                    <svg
                      viewBox="0 0 13 17"
                      fill="none"
                      className="h-[17px] w-[13px] stroke-white"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.5 1v15M1 10.5 6.5 16l5.5-5.5"
                      />
                    </svg>
                  </span>
                </span>
              )}
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
                // SQUARE with a 25 radius on the phone — 345 x 345 at the
                // artboard's 375, but written as an aspect ratio rather than
                // a fixed 345: below md the card is as wide as the viewport
                // leaves it, and a card that stayed 345 TALL while growing
                // wider ran its own artwork out of the bottom. The desktop
                // cards take their height from the grid row and keep the 20.
                className="relative flex aspect-square flex-col overflow-hidden rounded-[25px] p-5 md:aspect-auto md:h-full md:rounded-[20px] md:p-6"
                // The design's own gradient panel (2026-09-04), with the
                // sampled CSS gradient behind it as a loading fallback.
                style={{
                  backgroundImage: `url(/images/templates/${s.card}), ${s.gradient}`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* STEP ONE: Poppins Medium 18, caps, white at 50%, and no
                    tracking — the desktop reference's own 12/semibold/0.08em
                    is a different label at a different size. 7 to the title
                    below it, which is SemiBold 26 in full white. */}
                <p className="relative z-[1] text-[18px] font-medium uppercase leading-none text-white/50 md:text-[12px] md:font-semibold md:leading-normal md:tracking-[0.08em] md:text-white/60">
                  {s.step}
                </p>
                {/* 2, not the 7 the artboard's own guide reports: that 7 is
                    measured between text BOXES, and both boxes here already
                    carry leading-none padding of their own. 2 is what makes
                    the white space match the reference (Žilvinas 2026-09-06,
                    twice). */}
                <h3 className="relative z-[1] mt-[2px] text-[26px] font-semibold leading-none text-white md:mt-1 md:text-[22px] md:leading-tight">
                  {s.title}
                </h3>
                {/* Negative margins run the visual to the card's edges; the
                    chip floats over its faded bottom. */}
                {/* Where the artboard supplies the card as ONE flattened
                    render, that render IS the card on the phone: it lies
                    under the type at full bleed and the shot below is left to
                    the desktop. Figma's blur-and-fade over the screenshot
                    came out close but never identical in CSS. */}
                {"phoneCard" in s && s.phoneCard ? (
                  <Img
                    src={s.phoneCard}
                    alt={s.alt}
                    className="absolute inset-0 h-full w-full object-cover md:hidden"
                  />
                ) : null}
                <div
                  className={`relative -mx-5 -mb-5 mt-3 flex-1 md:-mx-6 md:-mb-6 ${
                    "phoneCard" in s && s.phoneCard ? "hidden md:block" : ""
                  }`}
                >
                  <Img src={s.image} alt={s.alt} className="process-shot w-full" />
                </div>
                {/* THE CHIP HANGS OFF THE CARD, not off the visual. The card
                    is a fixed 345 on the phone and the shot is wider than the
                    space left for it, so it runs past the bottom and the
                    card's overflow-hidden crops it — which is the artboard's
                    own crop, but it took the chip with it when the chip was
                    positioned against the visual.

                    20 off the card's bottom edge, 15 either side of the
                    label, radius 50, Poppins Medium 14. */}
                <span className="absolute bottom-5 left-5 rounded-[50px] bg-white px-[15px] py-1.5 text-[14px] font-medium leading-none text-black shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] md:bottom-10 md:left-6 md:px-3.5 md:text-[12px] md:font-semibold">
                  {s.chip}
                </span>
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
    // 60 from the team panel to the eyebrow (artboard 2026-09-06).
    // 60 under the last row to the footer, as above it (artboard
    // 2026-09-06).
    <section aria-labelledby="faq-heading" className="pb-[60px] pt-[60px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{f.eyebrow}</SectionEyebrow>
        <h2
          id="faq-heading"
          className={SECTION_TITLE}
        >
          {f.heading}
        </h2>

        {/* 65 under the title here, not the page's usual 37 (artboard
            2026-09-06). */}
        <div className="mx-auto mt-[65px] max-w-[880px] space-y-3 md:mt-12">
          {f.items.map((item) => (
            <details key={item.q} className="disclosure group rounded-[14px] bg-[#1b1b1b]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-[17px] text-[16px] font-medium text-white md:px-6 md:text-[15px] [&::-webkit-details-marker]:hidden">
                {item.q}
                {/* The design's own chevron (Vector 528.svg, 2026-09-06): an
                    18 x 11 path at weight 2, drawn at 22 x 11 — the artboard
                    reads about a third bigger than the 16 x 8 it was first
                    given (Žilvinas 2026-09-06). */}
                <svg
                  viewBox="0 0 18 11"
                  fill="none"
                  strokeWidth="2"
                  className="h-[11px] w-[22px] shrink-0 stroke-white transition-transform duration-150 group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" d="M1 1l8 8 8-8" />
                </svg>
              </summary>
              <p className="disclosure-body px-5 pb-5 text-[14px] leading-relaxed text-white/60 md:px-6 md:text-[15px]">
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
    // 60 from the Get Mushi button to the eyebrow (artboard 2026-09-06).
    <section aria-labelledby="team-heading" className="pt-[60px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{t.eyebrow}</SectionEyebrow>
        <h2
          id="team-heading"
          className={SECTION_TITLE}
        >
          {t.heading}
        </h2>

        {/* PHONE (artboard 2026-09-06): the two people STACK, each on a
            121-tall plate with a 113-wide portrait; the panel around them keeps
            its 20 radius but tightens to a 15 pad. Everything below md is the
            same markup the desktop uses — only the numbers change. */}
        <div className="mx-auto mt-[37px] max-w-[880px] rounded-[20px] bg-[#141414] p-[15px] pb-[25px] md:mt-12 md:p-8">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            {t.people.map((p) => (
              <div
                key={p.name}
                className="flex h-[121px] items-center gap-4 rounded-[14px] bg-[#1b1b1b] sm:h-auto sm:gap-5"
              >
                <span className="relative h-full w-[113px] shrink-0 sm:h-[126px] sm:w-[180px]">
                  <span
                    aria-hidden="true"
                    // 65 wide with 15 on its left corners on the phone: the
                    // plate is narrower than the photo's cell and the picture
                    // laps over its right edge, which is the artboard's own
                    // construction.
                    className="team-portrait-fade absolute inset-y-0 left-0 w-[65px] overflow-hidden rounded-l-[15px] sm:inset-0 sm:w-auto sm:rounded-l-[14px]"
                    style={{ background: p.backdrop }}
                  />
                  {/* Bottom-anchored and taller than the card, so the hair
                      pops over the top edge as in the design. */}
                  <span className="absolute bottom-0 left-1/2 w-full -translate-x-1/2">
                    <Img
                      src={p.image}
                      alt={`${p.name}, ${p.role} at Mushi`}
                      className="mx-auto h-[135px] w-auto max-w-none sm:h-[140px]"
                    />
                  </span>
                </span>
                <div className="min-w-0 pr-4">
                  <p className="truncate text-[20px] font-semibold leading-tight text-white md:text-[22px]">
                    {p.name}
                  </p>
                  <p
                    className="mt-0.5 bg-clip-text text-[16px] font-normal leading-tight text-transparent md:text-[15px] md:font-medium"
                    style={{ backgroundImage: p.roleGradient }}
                  >
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-5 md:mt-7 md:space-y-6">
            {t.notes.map((n) => (
              <div key={n.label}>
                {/* Medium 16 over Regular 14 at the font's own line height.
                    6 between them, not the 12 the artboard's guide reports —
                    that 12 is box to box, and the 14's own leading already
                    carries half of it. */}
                <h3 className="text-[16px] font-medium uppercase tracking-[0.08em] text-[#858585] md:text-[14px]">
                  {n.label}
                </h3>
                <p className="mt-1.5 text-[14px] font-normal leading-normal text-white/90 md:mt-1.5 md:text-[17px] md:leading-relaxed lg:text-[18px]">
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
      {/* Icon only on the phone — the column is ~60 wide there and the
          artboard shows the mark alone. */}
      <Img src="templates/cmp-konvert.webp" alt={name} width={82} className="hidden md:block" />
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
            ? "text-[20px] font-semibold text-white md:text-[21px]"
            : "text-[20px] font-semibold text-[#ff5b5b]"
        }
      >
        {v}
      </span>
    );
  }
  return v ? (
    <span role="img" aria-label="Yes">
      <Img src="templates/cmp-check.webp" alt="" width={20} className="w-[14px] md:w-[20px]" />
    </span>
  ) : (
    <span role="img" aria-label="No">
      <Img src="templates/cmp-x.webp" alt="" width={15} className="w-[11px] md:w-[15px]" />
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
    // 65 from the discovery banner to the eyebrow (artboard 2026-09-06).
    <section aria-labelledby="comparison-heading" className="pt-[65px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{c.eyebrow}</SectionEyebrow>
        <h2
          id="comparison-heading"
          className={SECTION_TITLE}
        >
          {c.heading}
        </h2>

        {/* THE PHONE TABLE IS THE SAME GRID, SHORTER (artboard 2026-09-06):
            44 header over 40 rows instead of 72 over 56, and NO CTA row —
            the phone puts "Get Mushi" under the table as a full-width button
            rather than inside the purple column's foot.

            Both row templates ride on custom properties because the row COUNT
            comes from the copy: a template literal in a class name is not
            something Tailwind can see, and an inline style would beat any
            md: class trying to override it. */}
        <div
          className="mx-auto mt-[37px] grid max-w-[880px] grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] grid-rows-[var(--cmp-rows)] gap-y-1.5 md:gap-y-2 md:mt-12 md:grid-cols-[minmax(0,1.7fr)_repeat(4,minmax(0,1fr))] md:grid-rows-[var(--cmp-rows-md)]"
          style={
            {
              "--cmp-rows": `44px repeat(${c.rows.length}, 48px)`,
              "--cmp-rows-md": `72px repeat(${c.rows.length}, 56px) 76px`,
            } as CSSProperties
          }
        >
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-[1] col-start-2 row-start-1 -mx-[2px] row-end-[var(--plate-end)] md:-mx-2.5 md:row-end-[var(--plate-end-md)]"
            style={
              {
                "--plate-end": String(lastRow),
                "--plate-end-md": String(lastRow + 1),
              } as CSSProperties
            }
          >
            {/* The asset's opaque card sits at 27.3-72.5% x / 13.3-86.6% y of
                its canvas — the rest is glow. Oversizing the layer by those
                fractions maps the card to the column and lets the glow spill
                past it, as the design intends. */}
            {/* PHONE: a plain rounded plate, 68 x 302 with a 10 radius —
                which laps 9 over the table at the top and 19 under it at the
                bottom, rather than sitting inside it, and carries the
                artboard's own glow (0/0/126.25 of #A08ADE at 65%). Its ramp is sampled
                from the artboard (a left-to-right #8A68C6 into #674BA9),
                which is a good deal more purple than the desktop card. The
                artwork below is a card floating in its own glow, and the
                oversize that maps it onto a desktop column throws it off a
                60-wide one — it read as a violet block sitting beside the
                values rather than under them. */}
            <span className="absolute inset-x-0 -top-[9px] -bottom-[19px] rounded-[10px] bg-[linear-gradient(167deg,#a08ade_0%,#7c54b5_40%,#6e54b5_100%)] shadow-[0_0_126px_rgba(160,138,222,0.65)] md:hidden" />
            <span
              className="absolute hidden md:block"
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
            {/* The wordmark as TYPE on the phone, not the raster: Dutch801
                is already loaded for the header, and a live font beats any
                export at this size. The desktop keeps the artwork, which is
                the version its column was measured against. */}
            <Logo className="text-[22px] md:hidden" />
            <Img
              src="templates/cmp-mushi.webp"
              alt="Mushi"
              width={82}
              className="hidden md:block md:w-[82px]"
            />
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
                  {/* PHONE: a plain 48-tall #111111 plate with a 10 radius,
                      full width (artboard 2026-09-06). The desktop's band is
                      a noise-glow artwork whose dark core is 91% x 41% of its
                      canvas; the oversize below maps that core onto the row. */}
                  <span className="absolute inset-0 rounded-[10px] bg-[#111111] md:hidden" />
                  <span
                    className="absolute hidden md:block"
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
                // 12/14 on the phone, balanced so each label breaks where the
                // artboard breaks it ("Trustpilot / Review Score", not
                // "Trustpilot Review / Score").
                className="z-10 col-start-1 self-center text-balance pl-3 text-[12px] leading-[14px] text-white/90 md:pl-5 md:text-[16px] md:leading-tight"
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

          {/* White pill on the card's foot; inverts to black on hover.
              DESKTOP ONLY — see the phone's own button below the grid. */}
          <a
            href={APP_URL}
            className="z-10 col-start-2 hidden self-center justify-self-center whitespace-nowrap rounded-full bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] px-3 py-2.5 text-[12px] font-semibold leading-none text-black transition-all duration-150 hover:bg-[linear-gradient(147deg,#000_0%,#000_100%)] hover:text-white md:block md:px-5 md:text-[14px]"
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

        {/* The phone's own CTA: 345 x 57, violet, full width under the
            table. 45 below the grid, which is 26 below the PURPLE COLUMN —
            the column hangs 19 past the last row, and that overhang is what
            the artboard measures from. It inverts like every other button (CLAUDE.md), with all
            three stops repeated in white so the fill cross-fades. */}
        <a
          href={APP_URL}
          className="mt-[45px] flex h-[57px] w-full items-center justify-center rounded-[15px] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-[20px] font-semibold text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)] hover:text-[#6e54b5] md:hidden"
        >
          {/* Set type here, not the masked label artwork the desktop pill
              uses: the phone's is Poppins SemiBold 20 (artboard 2026-09-06),
              and the mask is a fixed-width picture of a different size. */}
          {c.cta}
        </a>
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
    // 60 from the showcase wall to the eyebrow (artboard 2026-09-06).
    <section aria-labelledby="access-heading" className="pt-[60px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{a.eyebrow}</SectionEyebrow>
        <h2
          id="access-heading"
          className={SECTION_TITLE}
        >
          {a.heading}
        </h2>

        <div className="mx-auto mt-[37px] grid max-w-[980px] gap-5 md:mt-12 md:grid-cols-2 md:gap-6">
          {/* From scratch. */}
          <article
            className="flex flex-col rounded-[15px] bg-[#111111] bg-cover bg-center p-6 md:rounded-[20px] md:p-7"
            style={{ backgroundImage: "url(/images/templates/access-card-dark.webp)" }}
          >
            <header className="flex items-center gap-3.5">
              {/* 35 square on the phone (artboard 2026-09-06), 44 on the
                  desktop reference. */}
              <Img
                src="templates/access-emoji-bad.webp"
                alt=""
                width={44}
                className="size-[35px] rounded-[12px] md:size-[44px]"
              />
              <div>
                {/* SemiBold 16 with the caption Regular 16 at 50% white
                    directly under it (artboard 2026-09-06). */}
                <h3 className="text-[16px] font-semibold leading-tight text-white md:text-[17px]">
                  {a.scratch.title}
                </h3>
                <p className="text-[16px] font-normal leading-tight text-white/50 md:text-[13px] md:text-white/45">
                  {a.scratch.sub}
                </p>
              </div>
            </header>
            <p className="mt-7 flex items-baseline gap-0.5 md:gap-1.5">
              <span className="bg-[linear-gradient(180deg,#dd898b_0%,#c5696a_55%,#b65556_100%)] bg-clip-text text-[40px] font-semibold leading-none text-transparent md:text-[44px]">
                {a.scratch.figure}
              </span>
              {/* SemiBold 20, no tracking, and tight to the figure — the
                  slash is part of the price, not a separate label. */}
              <span className="text-[20px] font-semibold tracking-normal text-[#c5696a] md:text-[16px] md:font-medium">
                {a.scratch.unit}
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-[10px] md:space-y-3">
              {a.scratch.items.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-[16px] font-normal leading-none text-white/90 md:gap-2.5 md:text-[20px] md:leading-normal">
                  {/* The design's own cross (Icon.svg, 2026-09-06): a 12 x 11
                      stroke at weight 2 with round caps — chunkier than the
                      thin webp glyph, and drawn rather than rastered so it is
                      exact at the artboard's 10. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 11"
                    fill="none"
                    className="size-[10px] shrink-0 stroke-white md:size-[18px]"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 1 1 10M1 1l10 9" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            {/* Outlined button; inverts its own colours on hover like every
                other button (transparent/white -> white/black), with gradient
                layers in both states so the fill cross-fades. */}
            <a
              href={BOOKING_URL}
              // Phone: Regular 20 with no tracking, a 2 INSIDE stroke and a
              // 15 radius, 24 below the list (artboard 2026-09-06). The
              // desktop reference keeps its 24/1px/12.
              className="mt-6 flex h-[60px] w-full items-center justify-center rounded-[15px] border-2 border-white bg-[url(/images/templates/access-btn-dark.webp)] bg-cover text-[20px] font-normal uppercase tracking-normal text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black md:mt-8 md:rounded-[12px] md:border md:text-[24px] md:tracking-[0.06em]"
            >
              {a.scratch.cta}
            </a>
          </article>

          {/* With templates — the highlighted plan. */}
          <article
            className="access-card-ring relative flex flex-col rounded-[15px] border-0 md:rounded-[20px] bg-[#131017] bg-cover bg-center p-6 shadow-[0_30px_80px_-30px_rgba(110,84,181,0.5)] md:border md:border-[#8a5cf6]/50 md:p-7"
            style={{ backgroundImage: "url(/images/templates/access-card-purple.webp)" }}
          >
            <header className="flex items-center gap-3.5">
              <Img
                src="templates/access-emoji-good.webp"
                alt=""
                width={44}
                className="size-[35px] rounded-[12px] md:size-[44px]"
              />
              <div>
                <h3 className="text-[16px] font-semibold leading-tight text-white md:text-[17px]">
                  {a.templates.title}
                </h3>
                {/* One line on the phone, as the artboard has it — at 16 it
                    only just fits beside the 35 emoji, and wrapping it put
                    "month." alone under the sentence. */}
                <p className="whitespace-nowrap text-[16px] font-normal leading-tight text-white/50 md:whitespace-normal md:text-[13px] md:text-white/45">
                  {a.templates.sub}
                </p>
              </div>
            </header>
            <p className="mt-7 flex items-center gap-3">
              {/* The figure and its unit share a BASELINE; the chip beside
                  them centres on the row. Centring all three put "/month"
                  halfway up the 40 and left the chip riding high. */}
              <span className="flex shrink-0 items-baseline gap-0.5 whitespace-nowrap md:gap-1.5">
                <span className="bg-[linear-gradient(180deg,#a08ade_0%,#9275ce_50%,#7f56b6_100%)] bg-clip-text text-[40px] font-semibold leading-none text-transparent md:text-[44px]">
                  {a.templates.figure}
                </span>
                <span className="text-[20px] font-semibold tracking-normal text-[#9b79e2] md:text-[16px] md:font-medium">
                  {a.templates.unit}
                </span>
              </span>
              {/* 40 tall, label Regular 16 (Žilvinas 2026-09-06 — the 40 is
                  the chip's box, not its type). */}
              <span className="ml-auto flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-[#232323] px-6 text-[16px] font-normal uppercase tracking-[0.04em] text-white md:h-auto md:py-3 md:text-[18px]">
                {a.templates.chip}
              </span>
            </p>
            <ul className="mt-[15px] flex-1 space-y-[10px] md:mt-6 md:space-y-3">
              {a.templates.items.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-[16px] font-normal leading-none text-white/90 md:gap-2.5 md:text-[20px] md:leading-normal">
                  <AccessIcon name={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
            <a
              href={APP_URL}
              className="mt-6 flex h-[60px] w-full items-center justify-center rounded-[15px] bg-[url(/images/templates/access-btn-purple.webp)] bg-cover text-[20px] font-semibold uppercase tracking-normal text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] md:mt-8 md:rounded-[12px] md:text-[24px] md:tracking-[0.06em]"
            >
              {a.templates.cta}
            </a>
          </article>
        </div>

        {/* Done-for-you banner, bridging to the agency offer. */}
        <aside
          // The light hairs live INSIDE the banner: the swoosh artwork is the
          // top layer of the banner's own background stack.
          // 150 tall on the phone, on the artboard's own plate (its swoosh
          // hairs and rounded corners are baked in, so the box carries no
          // radius of its own there). The desktop keeps the rays layer over
          // its gradient.
          className="relative mx-auto mt-5 flex h-[150px] max-w-[980px] flex-col items-start justify-center gap-4 rounded-[18px] bg-[url(/images/templates/access-banner-phone.webp)] bg-cover bg-center p-5 sm:flex-row sm:items-center md:mt-6 md:h-auto md:justify-start md:overflow-hidden md:bg-[image:url(/images/templates/access-rays.webp),linear-gradient(100deg,#1c1426_0%,#150f1e_45%,#0d0a12_100%)] md:px-6"
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
              {/* 16/16 SemiBold, and the phone banner carries the title
                  ALONE — the artboard drops the caption there, where the
                  title already wraps to two lines. */}
              <p className="text-[16px] font-semibold leading-4 text-white">
                <BreakBefore text={a.banner.title} word="creatives" />
              </p>
              <p className="hidden text-[13px] text-white/45 md:block">{a.banner.sub}</p>
            </div>
          </div>
          <a
            href={BOOKING_URL}
            className="discovery-ring group inline-flex h-[46px] items-center gap-2.5 rounded-[100px] bg-[linear-gradient(147deg,#100d16_0%,#100d16_100%)] pl-[17px] pr-5 md:pl-2 text-[15px] font-semibold uppercase tracking-[0.05em] text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black sm:ml-auto md:border md:border-white/70"
          >
            <span className="flex size-[25px] items-center justify-center rounded-full bg-white text-black md:size-[32px]">
              {/* The design's own arrow (Icon.svg, re-supplied 2026-09-06):
                  a 13 x 13 path at weight 2, drawn at its own size inside a
                  25 disc — which is nearly the whole disc, as the artboard
                  has it. */}
              <svg
                viewBox="0 0 13 13"
                fill="none"
                strokeWidth="2"
                className="size-[13px] stroke-current md:size-[15px]"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.277 1l5.278 5.278-5.278 5.277M11.555 6.278H1"
                />
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
    // 60 from the monthly card to the eyebrow (artboard 2026-09-06).
    <section aria-labelledby="showcase-heading" className="pt-[60px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{s.eyebrow}</SectionEyebrow>
        <h2
          id="showcase-heading"
          className={`relative z-10 ${SECTION_TITLE}`}
        >
          {s.heading}
        </h2>
      </div>

      {/* Pulled up under the heading so it sits just above the wall's first
          tile row — the artwork's top region is empty black. */}
      <div aria-hidden="true" className="mt-[37px] md:-mt-16">
        {/* The phone gets its own crop of the wall (Mask group.png, supplied
            2026-09-06): the desktop file is a 2400-wide band that reduces to
            an unreadable strip at 375, and the artboard shows a taller,
            two-row version instead. */}
        <Img
          src="templates/showcase-wall-phone.webp"
          alt=""
          className="w-full md:hidden"
        />
        <Img
          src="templates/showcase-wall.webp"
          alt=""
          className="hidden w-full md:block"
        />
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
  // Poppins MEDIUM 36 for the numbers on the phone and 24 for the line under
  // them (artboard 2026-09-06); the desktop reference's 34/40 semibold stays
  // above md. The monthly card's number is its own 48 — see below.
  const BIG =
    "bg-[linear-gradient(100deg,#7150b5_0%,#8c68cf_60%,#a181e0_100%)] bg-clip-text text-[36px] font-medium leading-none text-transparent md:text-[40px] md:font-semibold";
  const SMALL =
    "bg-[linear-gradient(100deg,#7150b5_0%,#8c68cf_60%,#a181e0_100%)] bg-clip-text text-[24px] font-medium leading-none text-transparent";
  return (
    // 60 from the last step card to the eyebrow (artboard 2026-09-06).
    <section aria-labelledby="inside-heading" className="pt-[60px] md:pb-28 md:pt-0">
      <div className={SHELL}>
        <SectionEyebrow>{s.eyebrow}</SectionEyebrow>

        <h2
          id="inside-heading"
          className={SECTION_TITLE}
        >
          {s.heading}
        </h2>

        {/* Bento: two stacked rows on the left (support + industries over the
            wide reviews card), one tall card on the right spanning both. */}
        {/* PHONE: the two counters side by side at 165 x 119, then Trustpilot
            and the monthly card full width, 15 apart. Desktop keeps its own
            three-column bento. */}
        <div className="mx-auto mt-[37px] grid max-w-[1080px] grid-cols-2 gap-[15px] md:mt-12 md:grid-cols-[1fr_1fr_1.2fr] md:grid-rows-[auto_auto] md:gap-3">
          {/* 24/7 support — the baked art carries the memoji cluster and the
              "Need help?" bubble, so only the headline renders as text. */}
          <article
            className={`${CARD} flex h-[119px] flex-col items-center justify-center p-4 text-center md:h-auto md:min-h-[210px] md:items-start md:justify-start md:p-6 md:text-left`}
            style={{ backgroundImage: "url(/images/templates/inside-support.webp)" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/45 md:hidden"
            />
            <p className="relative">
              <span className={BIG}>{s.support.big}</span>
              <span className={`${SMALL} block md:mt-1`}>{s.support.small}</span>
            </p>
          </article>

          {/* 5 industries — chip rows baked into the background art. */}
          <article
            className={`${CARD} flex h-[119px] flex-col items-center justify-center p-4 text-center md:h-auto md:min-h-[210px] md:items-stretch md:justify-end md:p-6 md:text-left`}
            style={{ backgroundImage: "url(/images/templates/inside-industries.webp)" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/45 md:hidden"
            />
            <p className="relative">
              <span className={BIG}>{s.industries.big}</span>
              <span className={`${SMALL} block md:mt-1`}>{s.industries.small}</span>
            </p>
          </article>

          {/* Trustpilot, spanning under both cards. Wordmark is styled text —
              see the note on TEMPLATES_PAGE.inside. */}
          <article
            className={`${CARD} col-span-2 flex flex-col items-center justify-center text-center md:min-h-[190px]`}
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
                  className="flex size-[14px] items-center justify-center bg-[#7c54b5] md:size-[19px]"
                >
                  {/* The design's own star (image 130.svg, a raster in a
                      <pattern> — flattened, see BRAND_LOGOS), white on the
                      artboard's purple square. */}
                  <Img
                    src="templates/trustpilot-star.webp"
                    alt=""
                    width={11}
                    className="size-[11px] md:size-[14px]"
                  />
                </span>
              ))}
            </span>
            {/* THE WHOLE LOCKUP AS ONE FILE (Trustpilot.svg, supplied
                2026-09-06), 34 tall. Star and wordmark used to be two
                elements aligned against each other, which is a fight the
                design never asked for: the mark is a licensed lockup with
                its own spacing, and the file already has it. Flattened from
                Figma's raster-in-<pattern> the same way the brand chips are.
                */}
            <Img
              src="templates/trustpilot-lockup.webp"
              alt="Trustpilot"
              width={126}
              className="relative mt-1.5 h-[34px] w-auto md:mt-3 md:h-[26px]"
            />
            <p className={`${SMALL} relative mt-1 md:mt-2 md:!text-[20px]`}>{s.reviews.caption}</p>
          </article>

          {/* 50+ new templates monthly — the dimmed collage is the baked
              background, anchored to the card's bottom like the design. */}
          <article
            className={`${CARD} col-span-2 flex h-[222px] flex-col items-center pt-7 text-center md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:h-auto md:min-h-[360px] md:items-stretch md:pt-6 md:text-left`}
            style={{
              backgroundImage: "url(/images/templates/inside-monthly.webp)",
              backgroundPosition: "center bottom",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.68)_55%,rgba(0,0,0,0.4)_100%)] md:hidden"
            />
            <p className="relative">
              <span className={`${BIG} text-[48px] md:text-[40px]`}>{s.monthly.big}</span>
              <span className={`${SMALL} block md:mt-1`}>{s.monthly.small}</span>
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
    // 65 from the hero's cut to the eyebrow (artboard 2026-09-06).
    // 65 from the hero's cut to the eyebrow, and nothing under the cards —
    // the 61 to the next section is that section's own padding (artboard
    // 2026-09-06).
    <section aria-labelledby="difference-heading" className="pt-[65px] md:pb-28 md:pt-28">
      <div className={SHELL}>
        <SectionEyebrow>{d.eyebrow}</SectionEyebrow>

        {/* 37 under this one, where the rest of the page uses its section's
            own spacing; see SECTION_TITLE for the type. */}
        <h2 id="difference-heading" className={SECTION_TITLE}>
          {d.heading}
        </h2>

        {/* 27 between the cards on the phone, and each is 345 x 453 there —
            345 is the artboard's 375 less its 15 gutters, which is what SHELL
            already leaves. */}
        <div className="mx-auto mt-[37px] grid max-w-[1080px] gap-[27px] md:mt-12 md:grid-cols-2 md:gap-8">
          {/* Competitors. Card panel, trash composition and the Kandy /
              CreativeOS chips are the design's own exports (2026-09-03);
              only Konvert's chip remains drawn — no asset was supplied.
              The visuals are positioned against the card itself: the can
              bleeds past the card's bottom edge, the tilted ad tucks behind
              its rim, and the caption sits ON the picture, per the
              reference. The card takes its height from the Mushi card
              beside it (grid stretch). */}
          <article
            className="diff-card-ring relative flex h-[453px] flex-col overflow-hidden rounded-[20px] bg-[#101010] bg-cover bg-center px-6 pb-[18px] pt-5 md:h-auto md:min-h-[560px] md:rounded-[24px] md:p-7"
            style={{ backgroundImage: "url(/images/templates/diff-card-dark.webp)" }}
          >
            <BrandChips brands={d.bad.brands} />
            <div role="img" aria-label={d.bad.alt} className="absolute inset-0">
              {/* ONE IMAGE, NOT FOUR (Žilvinas 2026-09-05: "change the whole
                  trashcan to this — including everything trash that should
                  have been inside the bin as well").

                  It used to be a composition: the can behind, two ad cards on
                  top, then a bottom-aligned crop of the can's front wall over
                  their lower ends so they read as being inside it. The
                  supplied master already has the ads in the bin, so all of
                  that machinery — and the pixel-perfect registration it
                  depended on — is gone. diff-ad-add, diff-ad-bad and
                  diff-can-front are no longer rendered. */}
              {/* Smaller and lower on the phone: the artboard keeps the can
                  inside the card and leaves real air under the chip row,
                  where the desktop lets it run 5% past each edge and start
                  higher. */}
              <span className="absolute left-[4%] top-[15%] block w-[92%] md:left-[-5%] md:top-[8%] md:w-[110%]">
                <Img src="templates/diff-trashcan.webp" alt="" className="w-full" />
              </span>
            </div>
            {/* Poppins 16/16 on the phone, and the lead is MEDIUM there —
                bold at 16 over a photograph closes the counters up. The
                desktop reference keeps its 24/bold. */}
            <p className="relative z-10 mt-auto text-[16px] font-medium leading-4 text-white md:text-[24px] md:font-bold md:leading-tight">
              {d.bad.lead}{" "}
              <span className="font-normal text-white/50">{d.bad.rest}</span>
            </p>
          </article>

          {/* Mushi. justify-between: chip top, ad centred, caption pinned to
              the bottom so both cards' captions align. */}
          <article className="flex h-[453px] flex-col justify-between overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_95%_75%_at_50%_38%,#9a81d6_0%,#7b54b5_80%)] px-6 pb-[18px] pt-5 md:h-auto md:rounded-[24px] md:p-7">
            {/* White chip carrying the wordmark artwork — the design's one
                black rendering of the mark. */}
            {/* Same pill as the competitors' three on the phone — 26 tall,
                7 either side of the mark, radius 6 — 62 x 26 on the
                artboard. The mark is 20 of the pill's 26, not the 15 it was:
                at 15 the wordmark read as shrunken next to the competitors'
                logos, which sit at 13 to 18 in the same box. The desktop
                reference keeps its 36-tall pill. */}
            <div className="flex justify-center">
              <span className="flex h-[26px] items-center rounded-[6px] bg-white px-[7px] md:h-9 md:rounded-[10px] md:px-4">
                {/* 14 tall inside the 26 pill, which with the 7 gutters is
                    the artboard's 62 x 26. The file was trimmed to the
                    wordmark's ink (it shipped with ~45% transparent margin,
                    so a height set on the BOX drew a much smaller word); the
                    desktop's 53 is the old 68 less that margin. */}
                <Img
                  src="templates/diff-mushi-mark.webp"
                  alt="Mushi"
                  width={53}
                  className="h-[14px] w-auto md:h-auto md:w-[53px]"
                />
              </span>
            </div>
            {/* min-h-0 + object-contain: the card is a fixed 453 on the
                phone, so the ad has to fit the space the chip and the caption
                leave rather than overflow it. Desktop is height-free and the
                ad keeps its natural size there. */}
            <Img
              src="templates/diff-ad-good.webp"
              alt={d.good.alt}
              className="mx-auto mt-[13px] min-h-0 w-full flex-1 object-contain md:mt-5 md:flex-none"
            />
            {/* Same 16/16 medium as the card beside it on the phone. */}
            <p className="mt-6 text-[16px] font-medium leading-4 text-white md:text-[24px] md:font-bold md:leading-tight">
              {d.good.lead}{" "}
              {/* 50% white on the phone (artboard 2026-09-06); the desktop
                  reference's own 75 stays above md. */}
              <span className="font-normal text-white/50 md:text-white/75">{d.good.rest}</span>
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
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden xl:block"
    >
      {TEMPLATES_PAGE.categories.map((c, i) => (
        <span
          key={`${c.label}-${i}`}
          className={`absolute ${c.pos} flex h-[190px] w-[190px] flex-col items-center gap-2.5 rounded-[30px] bg-[radial-gradient(circle_at_50%_42%,#3a3a3a_0%,#1c1c1c_58%,#101010_100%)] pt-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]`}
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
    // The artboard puts 30 between the button and the device's top edge, and
    // the phone crop now starts AT that edge. The MacBook keeps its own mt-14.
    <div className="relative z-[1] mx-auto mt-[30px] w-full max-w-[1010px] px-4 md:mt-14">
      <PhoneTiles />

      {/* THE PHONE IS THE MOBILE HERO, not a shrunken MacBook (Žilvinas
          2026-09-06). The laptop's 2400px master reduces to a 358-wide strip
          on a phone, where the template grid inside it is unreadable; the
          artboard shows the app on a phone instead, at 269 x 564.

          The master is "Whole iphone with border.png" (re-supplied
          2026-09-06) — the same screen, with the device's own bezel and drop
          shadow, which the first export was missing. Cropped to the body plus
          ~40px of that shadow and shipped at 2x; the file's own 1516 x 2476
          is a 4x export no phone can show.

          IT ENDS ON A HARD CUT, not a fade: the crop stops through the MIDDLE
          of the Decline / Accept circles (master y 2008) and the page is
          black from there down, which is where the next section starts. The
          section's own overflow-hidden takes the burst and the tiles with it,
          so all three end on the same line.

          3x (807 across a 269 box), and NO -sm companion, deliberately. The
          2x export was soft next to Figma's own render: the device is only
          269 CSS wide, so 2x is 538 real pixels for a screenshot full of 10px
          UI text. Handing every phone the 3x file means a DPR-2 screen
          downsamples 807 to 538 rather than drawing a 538 file 1:1, and that
          supersample is most of the difference. The master carries 1114
          across the device, so even 3x is a downsample, not an upscale.

          -mb-px: the section's height lands on a fractional pixel (the type
          above it does), and when the browser rounds the two apart a single
          row of the burst shows UNDER the device before the black of the next
          section. The image is pulled one pixel past the section's own bottom
          and the section's overflow-hidden clips it, so the phone's last row
          is always the last row. It is a hard cut through solid black; there
          is nothing in that pixel to lose.

          NOTHING OUTSIDE THE DEVICE (Žilvinas 2026-09-06). The master's
          drop shadow is a flat 6% black over a large rectangle, which over a
          bright angular field draws a visible box however far it is
          feathered. The export is cropped to the silhouette and masked with
          the device's own rounded rect (radius 151 at 4x), so the file ends
          where the bezel does — 269 wide, the artboard's number.

*/}
      <Img
        src="templates/hero-phone.webp"
        alt="The Mushi template library on a phone: ad templates with industry and sort filters"
        width={269}
        className="relative z-[1] mx-auto -mb-px w-[269px] max-w-full md:hidden"
        priority
      />

      {/* NO ROUNDED CLIP, NO SCALE (Žilvinas 2026-09-05: "as the mac
          screenshot attached — not you added some stupid corners").

          The master draws the device frame and the screen's own corners
          itself. Wrapping it in `overflow-hidden rounded-[22px]` added a
          SECOND set at a different radius, and the `scale-[1.02]` that pushed
          the artwork's own bezel out past that clip is what made the two
          visibly disagree. The image goes in as it comes.

          The file is the supplied master ("Macbook 1.png", re-supplied
          2026-09-05) at 5200 x 3256, straight down to 2400 x 1503 and
          nothing else done to it. */}
      <Img
        src="templates/hero-macbook.webp"
        alt="The Mushi template library on a MacBook: a grid of ad templates with industry filters"
        className="hidden w-full drop-shadow-[0_50px_140px_rgba(0,0,0,0.95)] md:block"
        priority
      />
    </div>
  );
}

/**
 * The phone hero's category tiles — PHONE ONLY (Žilvinas 2026-09-06). The
 * desktop artboard has its own eight, at their own size and scattered
 * positions; see CategoryTiles.
 *
 * ONE STRIP PER ROW, both running clear across the viewport and under the
 * phone, which is drawn over them. Every measurement is the artboard's:
 * 131 x 130 tiles, radius 15, a 20 gutter between them, 22 between the rows,
 * and the second row offset 55 from the first — which is the whole trick.
 * With a 151 pitch and the phone 269 wide and centred, that offset is what
 * decides which slice of which tile shows either side of the device: row one
 * hands the left edge its DRINK tile and pokes the tail of BEAUTY out on the
 * right, row two shows the head of FASHION on the left and 89px of FOOD on
 * the right. Shift it and you are looking at different tiles.
 *
 * Vertically the first row starts 100 below the device's top edge (artboard,
 * 2026-09-06), which is also this block's top. Second row is one tile plus
 * the 22 gutter below it.
 *
 * Positions are anchored to the CENTRE, not to an edge: the phone is centred,
 * so the tiles have to be measured from the same line or the two drift apart
 * as the viewport changes. -385 puts the first tile a full pitch off-screen
 * on a phone, which is the one that appears as the screen gets wider (the
 * artboard's "before FASHION is FOOD").
 *
 * Decorative: aria-hidden, and no labels reach the accessibility tree — the
 * industries are named in the copy below.
 */
const PHONE_TILE_ROWS = [
  { top: 100, left: -385, tiles: ["Beauty", "Drink", "Fashion", "Beauty", "Food"] },
  { top: 252, left: -330, tiles: ["Food", "Fashion", "Beauty", "Food", "Drink"] },
] as const;

/**
 * The competitors' logos, as the design supplied them (2026-09-06): the three
 * vendors' own SVGs on white pills.
 *
 * ONE RULE FOR ALL THREE — pill 26 tall with a 6 gutter either side of the
 * logo at its natural size. That is not a guess: Konvert's file is 67 x 13,
 * and 67 + 12 is the 79 x 26 the artboard measures for its chip. The others
 * fall out of the same rule at 57 and 112.
 *
 * NOWRAP. The row is one line at every width the phone has — three pills and
 * two 15 gutters is 199, inside the card's content box — and wrapping it was
 * how the third chip used to drop onto a second row and shove the artwork
 * down. `min-w-0` on nothing here: the pills are fixed-width by their
 * contents and must not shrink, hence shrink-0.
 */
const BRAND_LOGOS: Record<string, { src: string; w: number; svg?: boolean }> = {
  // Konvert's file is a real vector path, so it stays an SVG. The other two
  // are Figma raster-in-<pattern> exports — a single PNG sliced by two <use>
  // transforms in CreativeOS's case — which Chrome rasterises at the pattern
  // tile's size and draws visibly soft. They are flattened to WebP at 3x
  // instead (the same pass scripts/svg-raster-to-webp.py does for the award
  // badges), which is both sharper and a tenth of the bytes.
  Konvert: { src: "logo-konvert.svg", w: 67, svg: true },
  Kandy: { src: "logo-kandy.webp", w: 45 },
  CreativeOS: { src: "logo-creativeos.webp", w: 100 },
};

function BrandChips({ brands }: { brands: readonly string[] }) {
  return (
    <ul className="relative z-10 flex flex-nowrap items-center justify-center gap-[15px]">
      {brands.map((brand) => {
        const logo = BRAND_LOGOS[brand];
        return (
          <li
            key={brand}
            className="flex h-[26px] shrink-0 items-center rounded-[6px] bg-white px-1.5"
          >
            {logo.svg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/images/templates/${logo.src}`}
                alt={brand}
                width={67}
                height={13}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <Img src={`templates/${logo.src}`} alt={brand} width={logo.w} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PhoneTiles() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-visible md:hidden">
      {PHONE_TILE_ROWS.map((row) => (
        <div
          key={row.top}
          className="absolute flex gap-5"
          style={{ top: row.top, left: `calc(50% + ${row.left}px)` }}
        >
          {row.tiles.map((label, i) => {
            const cat = TEMPLATES_PAGE.categories.find((c) => c.label === label)!;
            return (
              <span
                key={`${label}-${i}`}
                // Radial #393939 in the middle out to black at the rim, per
                // the artboard's fill panel — so the tile lifts off the page
                // in its centre and has no visible edge against the black.
                className="flex h-[130px] w-[131px] shrink-0 flex-col items-center rounded-[15px] bg-[radial-gradient(circle_at_50%_50%,#393939_0%,#000_100%)] px-2 pt-4"
              >
                <span className="text-[16px] font-semibold uppercase leading-none text-white">
                  {label}
                </span>
                {/* The icon hangs off the BOTTOM, 30 clear of it (artboard
                    2026-09-06), not off the label — the tiles read as a row
                    only if every glyph sits on the same line, and the labels
                    are one and two words. mt-auto takes up whatever the
                    label leaves above it. */}
                <span className="mt-auto mb-[30px] grid w-full place-items-center">
                  <Img src={cat.image} alt="" width={58} />
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
