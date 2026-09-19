import { Fragment, type CSSProperties } from "react";
import { BgFallback, Img } from "./Img";
import { Logo } from "./Logo";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL, BOOKING_URL, TEMPLATES_HERO_CTA_ID, TEMPLATES_SCRATCH_CARD_ID } from "@/lib/site";

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
// mt 17 on the phone: the artboard's gap from the eyebrow row's bottom edge to
// the heading's text box (Žilvinas 2026-09-18, measured 16 x 17 under
// SHOWCASE; the eyebrow and title are one recipe, so every section takes it).
// It was 23 against the old 18-tall eyebrow; the rules are 21 tall now.
const SECTION_TITLE =
  "mt-[17px] text-balance text-center text-[36px] font-semibold leading-9 md:mt-4 md:text-wrap md:text-[48px] md:leading-tight md:tracking-tight";

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

      {/* 38, not 40: the phone artboard puts 46 between the header bar's
          bottom edge and the badge, and the bar's own 12px bottom inset (the
          shell's pb-2 plus its rounding) is part of that measurement. */}
      <div className={`${SHELL} relative z-[1] pt-[2.375rem] text-center md:pt-[44px]`}>
        {/* Gradient-ringed chip, not the home hero's frosted white pill. Ring
            and text share ONE purple-to-salmon gradient, sampled from the
            zoomed badge reference (2026-09-03) — the ring via the
            --agb-gradient override, the text via background-clip. */}
        <span
          className="tpl-badge animated-gradient-border inline-flex items-center rounded-[50px] bg-[#0d0a14]/80 px-5 py-2"
          // Radius 50, and a 2-weight stroke ON THE PHONE (.tpl-badge in
          // globals.css — the desktop reference keeps the ring's 1px). Figma
          // calls the stroke "Outside"; the ring is masked INSIDE the box
          // here, which on a pill this size is the same picture and keeps the
          // badge's own width honest.
          style={{ "--agb-gradient": BADGE_GRADIENT } as React.CSSProperties}
        >
          <span
            // Poppins Medium 15 on the phone (artboard 2026-09-06); the
            // desktop reference is its own 14.
            className="tpl-badge-text bg-clip-text text-[15px] font-medium tracking-[0.02em] text-transparent md:text-[14px]"
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
          className="mx-auto mt-6 max-w-[1000px] text-balance text-[28px] font-semibold leading-none sm:text-[38px] md:mt-4 md:max-w-[680px] lg:text-[56px] lg:leading-[60px]"
        >
          {TEMPLATES_PAGE.heading}
        </h1>

        {/* Header-CTA sizing rather than the home hero's pill — the reference
            shows a compact rounded-rect button. Hover inverts its own two
            colours, gradient layer kept in both states (CLAUDE.md). */}
        <a
          id={TEMPLATES_HERO_CTA_ID}
          href={APP_URL}
          // Per "Rectangle 83" (2026-09-09): the light spreads across the
          // WHOLE diagonal — a18ade top-left flowing to 6e54b5 bottom-right,
          // lifted a step brighter as asked. Sharper 8px corners stay.
          //
          // The hover repeats ALL FOUR of those stop positions in white
          // (CLAUDE.md): a 2-stop white against a 4-stop violet cannot
          // interpolate, so the fill jumped instead of cross-fading — which
          // read as the invert having been dropped altogether.
          className="group mt-[1.875rem] md:!mt-5 inline-flex h-[54px] items-center gap-2.5 rounded-[8px] bg-[linear-gradient(104deg,#ab95e3_0%,#8a64c6_45%,#7a5ec0_100%)] px-7 text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(110,84,181,0.9)] transition-all duration-150 hover:bg-[linear-gradient(104deg,#fff_0%,#fff_45%,#fff_100%)] hover:text-[#6e54b5] md:mt-8 md:h-[56px] md:px-8 md:text-[19px]"
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
            className="size-[14px] shrink-0 md:h-[13px] md:w-[15px]"
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
/**
 * The eyebrow's own fill, sampled from the supplied "INSIDE.png" export
 * (2026-09-07): violet #a167c4 through orchid into pink #ce76a6, Poppins
 * Regular 30. The desktop rules and diamonds carry the ramp's end colours;
 * the phone keeps its exported rule artwork.
 */
const EYEBROW_GRADIENT =
  "linear-gradient(90deg,#7858b8 0%,#ab6bc7 30%,#cc76be 60%,#cf7680 100%)";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    // gap-3: 12px between the rules and the word (client 2026-09-10).
    <div className="flex items-center justify-center gap-3">
      {/* PHONES GET THE ARTBOARD'S OWN RULES (Žilvinas 2026-09-06): a line
          that fades from black into the star's colour, with a four-pointed
          star ON its inner end. Since 2026-09-18 ("both of these to improve
          the quality") they are the client's own VECTOR exports — "Left side
          of process.svg" 126 x 21 and "right side star of process title.svg"
          127 x 21, a gradient <line> and a star <path>, nothing rasterised —
          replacing the PNG-derived WebPs that went soft at 3x DPR. Real
          vectors, so they ship as SVG at their natural size, the way Konvert's
          logo does; the one-pixel width asymmetry is the exports' own. */}
      <EyebrowRule src="eyebrow-left.svg" width={126} />

      {/* The DESKTOP's own exported rules too (2026-09-10): black fading
          into the ramp's end colour with a chunky star on the inner tip —
          purple star left, rose star right — replacing the CSS hairline
          and ✦ glyph pair. */}
      <Img
        src="templates/eyebrow-rule-left.webp"
        alt=""
        width={161}
        className="hidden md:block"
      />
      {/* Poppins Regular 18 on the phone (artboard 2026-09-06), 30 at the
          desktop reference. */}
      {/* Figma panel 2026-09-07: Poppins Regular 30 over an 80 line height
          at the desktop reference; the phone keeps its artboard's 18. */}
      <p
        className="bg-clip-text text-[18px] font-normal uppercase leading-none text-transparent md:text-[30px]"
        style={{ backgroundImage: EYEBROW_GRADIENT }}
      >
        {children}
      </p>
      <Img
        src="templates/eyebrow-rule-right.webp"
        alt=""
        width={160}
        className="hidden md:block"
      />

      <EyebrowRule src="eyebrow-right.svg" width={127} />
    </div>
  );
}

/**
 * One phone eyebrow rule, as a raw <img> since Img sizes from the WebP table
 * and these are vectors. Below the fold like everything after the hero, so
 * the URL rides in data-src for the observer (see Img's note) with the
 * <noscript> twin carrying a real src.
 *
 * shrink-0: the row is 126 + 12 + PROCESS + 12 + 127, a hair over the 360
 * content box, and without it the rules were the flex items that gave way —
 * 115 wide and 19 tall instead of the artboard's 127 x 21. The word cannot
 * shrink, so the row overhangs the padding by a couple of px each side,
 * centred; body clips sideways overflow, so nothing can scroll to it.
 */
function EyebrowRule({ src, width }: { src: string; width: number }) {
  const url = `/images/templates/${src}`;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-src={url} alt="" width={width} height={21} loading="lazy" decoding="async" className="shrink-0 md:hidden" />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" width={width} height={21} loading="lazy" decoding="async" className="shrink-0 md:hidden" />
      </noscript>
    </>
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
      {/* The space STAYS in the text — desktop needs it, since its break is
          hidden, and on the phone a trailing space before a <br> collapses.
          A trimEnd here once glued "premium creatives" into one word. */}
      {text.slice(0, at)}
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
      {/* The space after the comma STAYS in the text — desktop hides the
          break, and a leading space collapses after a <br> on the phone.
          Slicing it out glued "Launch,Hard" together. */}
      {text.slice(0, at + 1)}
      <br className="md:hidden" />
      {text.slice(at + 1)}
    </>
  );
}

export function TemplatesProcess() {
  const p = TEMPLATES_PAGE.process;
  return (
    // pt 61: the artboard's gap from the Difference card's bottom edge to the
    // top of the eyebrow row (Žilvinas 2026-09-18, measured 51 x 61). The row
    // is the 21-tall rules now, so the gap lands on their box, not on a text
    // line the stars used to overhang.
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
        {/* FLUID EVERYWHERE (client 2026-09-13, per their reference shot):
            three equal columns with 12px gutters in an 1128 cap — at the cap
            each square is (1128 - 24) / 3 = 368, the reference's own card
            size, and below it the squares just shrink. The earlier fixed
            421.75 columns are GONE: they were wider than SHELL and, when the
            merge dropped the column rule but kept the cards' forced height,
            the aspect-square cards overflowed their columns and swallowed
            the gaps entirely. No fixed sizes means no overflow mode. */}
        {/* mt 30 on the phone: the artboard's gap from the heading's text
            box to the first card (Žilvinas 2026-09-18, "in here only 30" —
            it had been 37, and read as too loose beside the 61 above). */}
        <ol className="mx-auto mt-[30px] grid max-w-none gap-[15px] md:mt-10 md:max-w-[1160px] md:grid-cols-3 md:gap-2.5">
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
                /* Per "Group 166" (2026-09-07): a solid black outer disc
                   with a #191919 inner one at 71% and a white right arrow —
                   the phone join's own construction turned sideways. */
                <span
                  aria-hidden="true"
                  // 52 outer / 40 inner / 21-wide arrow — one step smaller than the
                  // earlier 64/50/26, per the client's reference (2026-09-13).
                  // -left-[32px] keeps it centred on the 12px gutter: 26 + 6.
                  className="absolute -left-[31px] top-1/2 z-10 hidden size-[52px] -translate-y-1/2 items-center justify-center rounded-full bg-black md:flex"
                >
                  <span className="flex size-[40px] items-center justify-center rounded-full bg-[#222222]">
                    {/* The supplied arrow ("arrrr.png", 2026-09-11), traced:
                        90 x 70 with a full-width shaft and a chevron nearly
                        the full height — 45° arms, round caps, stroke 10.
                        Wider and deeper-headed than the 24-box glyph it
                        replaces. */}
                    <svg
                      viewBox="0 0 90 70"
                      fill="none"
                      strokeWidth="10"
                      className="h-[16px] w-[21px] stroke-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 35h77M55 5l30 30-30 30"
                      />
                    </svg>
                  </span>
                </span>
              )}
              <article
                // SQUARE with a 25 radius on the phone — 345 x 345 at the
                // artboard's 375, but written as an aspect ratio rather than
                // a fixed 345: below md the card is as wide as the viewport
                // leaves it, and a card that stayed 345 TALL while growing
                // wider ran its own artwork out of the bottom. The desktop
                // cards take their height from the grid row and keep the 20.
                // aspect-square at EVERY width (2026-09-12): the shot is
                // absolute (full-bleed to the bottom), so it no longer gives
                // the card intrinsic height — without the aspect the cards
                // collapse to their text. No fixed height either (2026-09-13):
                // the square takes the column's width, whatever it is.
                className="relative flex aspect-square flex-col overflow-hidden rounded-[25px] p-5 md:rounded-[20px] md:p-6"
                // The design's own gradient panel (2026-09-04), with the
                // sampled CSS gradient behind it as a loading fallback.
                // DEFERRED (see BgFallback / paint-gate-script.ts): the URL
                // lives in data-bg, not in a property the browser can fetch
                // from. `var(--bg, none)` keeps the gradient painting while
                // the artwork is still nothing — the fallback this pair was
                // always meant to be.
                data-bg={`url(/images/templates/${s.card})`}
                style={{
                  backgroundImage: `var(--bg, none), ${s.gradient}`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* STEP ONE: Poppins Medium 18, caps, white at 50%, and no
                    tracking — the desktop reference's own 12/semibold/0.08em
                    is a different label at a different size. 7 to the title
                    below it, which is SemiBold 26 in full white. */}
                <p className="relative z-[1] text-[18px] font-medium uppercase leading-none text-white/50 md:text-[20px] md:font-medium md:leading-normal md:tracking-[0.02em] md:text-white/55">
                  {s.step}
                </p>
                {/* 2, not the 7 the artboard's own guide reports: that 7 is
                    measured between text BOXES, and both boxes here already
                    carry leading-none padding of their own. 2 is what makes
                    the white space match the reference (Žilvinas 2026-09-06,
                    twice). */}
                {/* ONE LINE at every width (client 2026-09-12): at 30px,
                    "Customize in Canva" measures a narrow fluid card's full
                    content width and wraps on some renderers. 26px in the
                    fluid band, the reference's 30 from 1160 up — where the
                    grid is at its 1128 cap and the 368 squares leave room;
                    nowrap as the backstop. The `!` is the
                    min-[...]-sorts-before-md: quirk. */}
                <h3 className="relative z-[1] mt-[2px] text-[26px] font-semibold leading-none text-white md:mt-1 md:whitespace-nowrap md:text-[26px] md:leading-tight min-[1160px]:text-[30px]!">
                  {s.title}
                </h3>
                {/* Negative margins run the visual to the card's edges; the
                    chip floats over its faded bottom. */}
                {/* Where the artboard supplies the card as ONE flattened
                    render, that render IS the card — on EVERY size since the
                    client's 2026-09-07 exports (it lies under the type at
                    full bleed); the crop-based shot below serves only steps
                    without one. Figma's blur-and-fade over the screenshot
                    came out close but never identical in CSS. */}
                {/* desktopShot (client 2026-09-12): the flattened render is
                    the PHONE's card only, and the desktop uses the inline
                    crop shot below — cut to the same size and position as
                    step one's, so the two pictures align. */}
                {"phoneCard" in s && s.phoneCard ? (
                  <Img
                    src={s.phoneCard}
                    alt={s.alt}
                    className={`absolute inset-0 h-full w-full object-cover ${
                      "desktopShot" in s && s.desktopShot ? "md:hidden" : ""
                    }`}
                  />
                ) : null}
                {/* FULL BLEED TO THE CARD'S BOTTOM (client 2026-09-12, per
                    their reference shot): the visual runs edge to edge and
                    down under the chip, object-cover from the top, so no
                    card gradient shows beneath it. The dimming at the
                    shots' edges is baked into the exports; .process-shot's
                    CSS mask is phone-only now. */}
                <div
                  className={`relative -mx-5 -mb-5 mt-3 flex-1 overflow-hidden md:-mx-6 md:-mb-6 md:mt-[2px] ${
                    "phoneCard" in s && s.phoneCard
                      ? "desktopShot" in s && s.desktopShot
                        ? "hidden md:block"
                        : "hidden"
                      : ""
                  }`}
                >
                  <Img
                    src={s.image}
                    alt={s.alt}
                    className="process-shot absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>
                {/* THE CHIP HANGS OFF THE CARD, not off the visual. The card
                    is a fixed 345 on the phone and the shot is wider than the
                    space left for it, so it runs past the bottom and the
                    card's overflow-hidden crops it — which is the artboard's
                    own crop, but it took the chip with it when the chip was
                    positioned against the visual.

                    20 off the card's bottom edge, 15 either side of the
                    label, radius 50, Poppins Medium 14. */}
                {/* NO SHADOW under the chip (2026-09-18, the client's boss:
                    Figma has none, the web had one). The pill sits flat on
                    the step's artwork. */}
                <span className="absolute bottom-5 left-5 rounded-[50px] bg-white px-[15px] py-1.5 text-[14px] font-medium leading-none text-black md:bottom-5 md:left-6 md:px-[14px] md:py-2 md:text-[16px] md:font-medium">
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
        {/* Row gap halved to 15 (client 2026-09-11), from the reference's 30. */}
        {/* mt 33 on the phone (Žilvinas 2026-09-18): the artboard measured
            28 from the heading's text box to the first question, and 37 from
            its ink; 28 read tight on the page and he settled on 33. It had
            been 65. */}
        <div className="mx-auto mt-[33px] max-w-[880px] space-y-3 md:mt-12 md:max-w-[1080px] md:space-y-[15px]">
          {f.items.map((item) => (
            <details key={item.q} className="disclosure group rounded-[14px] bg-[#1b1b1b] md:rounded-[17px] md:bg-[#222222]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-[17px] text-[16px] font-medium text-white md:px-6 md:py-[19px] md:text-[18px] md:font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                {/* The design's own chevron (Vector 528.svg, 2026-09-06): an
                    18 x 11 path at weight 2, drawn at 22 x 11 — the artboard
                    reads about a third bigger than the 16 x 8 it was first
                    given (Žilvinas 2026-09-06). */}
                <svg
                  viewBox="0 0 18 11"
                  fill="none"
                  strokeWidth="2"
                  // Turns on the panel's own 480ms curve (see .disclosure in
                  // globals.css) — at 150 it flipped long before the answer
                  // had finished arriving.
                  className="h-[11px] w-[22px] shrink-0 stroke-white transition-transform duration-[480ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-open:rotate-180 md:h-[18px] md:w-[18px]"
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
        {/* mt 33 on the phone (Žilvinas 2026-09-18, "a bit smaller"): the
            artboard measures 28 box-to-box here as it does for the FAQ, and
            33 is where he settled that one, so the two match. It had been 37. */}
        <div className="mx-auto mt-[33px] max-w-[880px] rounded-[20px] bg-[#141414] p-[15px] pb-[25px] md:mt-12 md:max-w-[1080px] md:rounded-[16px] md:bg-[#111111] md:p-8">
          {/* 15 between the phone cards, card to card (Žilvinas
              2026-09-11, Figma). Urte's portrait is drawn smaller instead
              (see phoneImageH in content.ts) so her hair stays inside her
              own card rather than rising into Noah's. */}
          <div className="grid gap-[15px] sm:grid-cols-2 sm:gap-4">
            {t.people.map((p) => (
              <div
                key={p.name}
                // NO overflow-hidden (client 2026-09-13, third pass): the reference
                // keeps the HAIR rising over the row's top edge, so the row
                // cannot clip. The plate carries the row's own left radius and
                // the photos are narrower than the plate, so nothing square
                // crosses the rounded corners.
                // sm+ takes its proportions from the supplied card export —
                // 2316 x 718 — rather than from a portrait height, so both
                // cards are the shape the design draws them. `relative`
                // because that export is laid over the whole card.
                className="relative flex h-[121px] items-center gap-4 rounded-[14px] bg-[#1b1b1b] sm:h-auto sm:aspect-[2316/718] sm:gap-5"
              >
                {/* On sm+ the founder keeps the built plate — at the export's
                    scale, 184 x the card's full height, which is the same
                    1.19 the 150 x 126 pair had, so nothing inside it moves.
                    A cardImage person has no plate to build: the cell is a
                    spacer as wide as the portrait runs in the export (42.2%
                    of the card), and the gap-5 after it puts the name where
                    the export leaves room for it. */}
                <span
                  className={`relative h-full w-[113px] shrink-0 sm:h-full ${
                    "cardImage" in p && p.cardImage ? "sm:w-[42.2%]" : "sm:w-[184px]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    // 65 wide with 15 on its left corners on the phone: the
                    // plate is narrower than the photo's cell and the picture
                    // laps over its right edge, which is the artboard's own
                    // construction.
                    className={`team-portrait-fade absolute inset-y-0 left-0 w-[65px] overflow-hidden rounded-l-[15px] sm:inset-0 sm:w-auto sm:rounded-l-[14px] ${
                      "cardImage" in p && p.cardImage ? "sm:hidden" : ""
                    }`}
                    // Every colour here goes through a custom property, and
                    // none of them is set as a plain declaration: an inline
                    // `background` or `color` beats the class that the
                    // breakpoint switches, so the phone's ramp never landed.
                    style={
                      {
                        "--plate-desktop": p.backdrop,
                        "--plate-top": p.plate[0],
                        "--plate-bottom": p.plate[1],
                      } as CSSProperties
                    }
                  />
                  {/* Bottom-anchored and taller than the card, so the hair
                      pops over the top edge as in the design. */}
                  {/* From sm up the box is the plate's own width.

                      Only the bottom-left corner is rounded, and it is on the
                      IMG: that corner is the one piece of evidence in the
                      reference that the photo is inside the plate rather than
                      laid over it. The top is left alone — the hair has to
                      clear the card there. The phone keeps its centred,
                      wider-than-the-cell picture. */}
                  <span className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 sm:left-0 sm:translate-x-0">
                    {/* PHONE ONLY where cardImage is set: that person's
                        desktop is the flattened export below, and this cut is
                        centred in a narrower cell and laps over both its
                        edges, which is the phone's own signed-off
                        composition.

                        Everyone else draws this same file on both: the
                        portrait spans the FULL width of its plate rather than
                        being centred in it. The crops are taller than they are
                        wide, so a height-driven fit left a purple sliver
                        between the plate's left edge and the shoulder — the
                        "cut off" Žilvinas saw against Figma, where the jacket
                        reaches the rounded corner. Width-driven, it is
                        flush. */}
                    <Img
                      src={p.image}
                      alt={`${p.name}, ${p.role} at Mushi`}
                      className={`team-photo mx-auto h-[var(--portrait-h)] w-auto max-w-none ${
                        "cardImage" in p && p.cardImage
                          ? "sm:hidden"
                          : "sm:h-auto sm:w-full sm:rounded-bl-[14px]"
                      }`}
                      style={{ "--portrait-h": `${"phoneImageH" in p ? p.phoneImageH : 135}px` } as CSSProperties}
                      // The photo and the plate behind it read as one object;
                      // a native drag peels the cut-out off its card as a
                      // ghost (Žilvinas 2026-09-13).
                      draggable={false}
                    />
                  </span>
                </span>
                {/* THE SUPPLIED CARD, VERBATIM (Žilvinas 2026-09-13: "either
                    reuse this OR replicate it 1 to 1"). Plate, portrait and
                    the #1b1b1b behind them are already composited in the
                    export, so on sm+ it is laid over the whole row and the
                    markup contributes nothing to the picture — there is
                    nothing left to get wrong by eye.

                    Its BOTTOM edge is the card's bottom edge and it is anchored
                    there: the hair rising past the top is the part of the file
                    that sits outside the card, and the row does not clip, so
                    it overhangs exactly as the export draws it. The card's own
                    rounded-[14px] is the radius the export was cut at, so the
                    two corners agree.

                    Empty alt: it is decorative here. The name and role beside
                    it already say who this is, and the phone's <img> carries
                    the portrait's own alt text. */}
                {"cardImage" in p && p.cardImage ? (
                  <Img
                    src={p.cardImage}
                    alt=""
                    className="pointer-events-none absolute bottom-0 left-0 hidden h-auto w-full sm:block"
                    sizes="(min-width: 1024px) 500px, 50vw"
                    draggable={false}
                  />
                ) : null}
                <div className="relative min-w-0 pr-4">
                  <p className="truncate text-[20px] font-semibold leading-tight text-white md:text-[28px]">
                    {p.name}
                  </p>
                  <p
                    className="role-gradient mt-0.5 text-[16px] font-normal leading-tight md:text-[15px] md:font-medium"
                    style={
                      {
                        "--role-color": p.color,
                        "--role-gradient": p.roleGradient,
                      } as CSSProperties
                    }
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
                {/* 4 on the phone, 2 tighter than it was (Žilvinas
                    2026-09-11: "a very bit smaller"). */}
                <p className="mt-1 text-[14px] font-normal leading-normal text-white/90 md:mt-1.5 md:text-[18px] md:leading-relaxed">
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
  // PHONE marks are the design's own 4x exports (Žilvinas 2026-09-11 — the
  // earlier files drew soft), drawn at a quarter of their pixels, which is
  // the artboard's size for each. The desktop keeps the files it was signed
  // off with.
  if (name === "Kandy") {
    return (
      <>
        <Img src="templates/cmp-kandy-phone.webp" alt={name} width={44} className="md:hidden" />
        <Img src="templates/cmp-kandy.webp" alt={name} width={54} className="hidden md:block" />
      </>
    );
  }
  if (name === "CreativeOS") {
    return (
      <>
        <Img src="templates/cmp-creativeos-icon-phone.webp" alt={name} width={27} className="md:hidden" />
        <Img
          src="templates/cmp-creativeos-icon.webp"
          alt=""
          width={40}
          className="-mr-2.5 hidden md:block"
        />
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
      {/* Icon only on the phone — the column is ~60 wide there and the
          artboard shows the mark alone. */}
      {/* The 4x export ("3rd logo.png") is the white square alone — the
          star Figma draws inside it is a separate layer that did not come
          with it, so it is laid back on top: a concave four-point star at
          half the square, in the table's own near-black. */}
      <span className="relative size-[20px] md:hidden">
        <Img src="templates/cmp-konvert-icon-phone.webp" alt={name} width={20} className="size-[20px] object-contain" />
        <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute inset-0 size-full">
          <path fill="#141414" d="M10 5Q10.6 9.4 15 10Q10.6 10.6 10 15Q9.4 10.6 5 10Q9.4 9.4 10 5Z" />
        </svg>
      </span>
      <Img
        src="templates/cmp-konvert-icon.webp"
        alt=""
        width={22}
        className="hidden rounded-[6px] md:block"
      />
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
  // THE DESIGN'S OWN MARKS, inline (Žilvinas 2026-09-18, "check mark
  // icon.svg" 15 x 13 and "cross icon.svg" 13 x 13): one round-capped path
  // each at stroke 2, pasted verbatim, replacing the 40 x 33 and 32 x 32
  // bitmaps that drew soft at 3x. The phone shows them at the files' own
  // size; the desktop keeps the 20 / 15 widths it had, with the stroke
  // scaled back so the line stays 2px on screen.
  return v ? (
    <span role="img" aria-label="Yes">
      <svg
        aria-hidden="true"
        viewBox="0 0 15 13"
        fill="none"
        className="h-auto w-[15px] stroke-white stroke-2 md:w-[20px] md:stroke-[1.5]"
      >
        <path strokeLinecap="round" d="M1 6.65217L6.15517 11L14 1" />
      </svg>
    </span>
  ) : (
    <span role="img" aria-label="No">
      <svg
        aria-hidden="true"
        viewBox="0 0 13 13"
        fill="none"
        className="h-auto w-[13px] stroke-[#ff5b5b] stroke-2 md:w-[15px] md:stroke-[1.73]"
      >
        <path strokeLinecap="round" d="M1 1L12 12M1 12L12 1" />
      </svg>
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

        {/* PHONE COLUMNS are the artboard's own (Žilvinas 2026-09-11): 115
            label / 68 Mushi / 54 per competitor, 345 in all, written as fr so
            they hold their proportion at every phone width. The plate is the
            Mushi column exactly, not 2 wider each side.

            THE PHONE TABLE IS THE SAME GRID, SHORTER (artboard 2026-09-06):
            44 header over 40 rows instead of 72 over 56, and NO CTA row —
            the phone puts "Get Mushi" under the table as a full-width button
            rather than inside the purple column's foot.

            Both row templates ride on custom properties because the row COUNT
            comes from the copy: a template literal in a class name is not
            something Tailwind can see, and an inline style would beat any
            md: class trying to override it. */}
        <div
          className="mx-auto mt-[37px] grid max-w-[880px] md:max-w-[1080px] grid-cols-[minmax(0,115fr)_minmax(0,68fr)_repeat(3,minmax(0,54fr))] grid-rows-[var(--cmp-rows)] gap-y-1.5 md:gap-y-2 md:mt-12 md:grid-cols-[minmax(0,1.7fr)_repeat(4,minmax(0,1fr))] md:grid-rows-[var(--cmp-rows-md)]"
          style={
            {
              "--cmp-rows": `44px repeat(${c.rows.length}, 48px)`,
              "--cmp-rows-md": `72px repeat(${c.rows.length}, 56px) 76px`,
            } as CSSProperties
          }
        >
          <div
            aria-hidden="true"
            // md:mx-1.5 (6px INSET), not the old md:-mx-2.5 overhang: ~32px
            // slimmer plate per the client's reference (2026-09-12). The
            // artwork maps its card onto this box, so the box is the width.
            className="pointer-events-none relative z-[1] col-start-2 row-start-1 row-end-[var(--plate-end)] md:mx-1.5 md:row-end-[var(--plate-end-md)]"
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
                backgroundImage: "var(--bg, none)",
                backgroundSize: "100% 100%",
              }}
              data-bg="url(/images/templates/compare-card.webp)"
            />
          </div>

          <span className="z-10 col-start-2 row-start-1 self-center justify-self-center">
            {/* The wordmark as TYPE on the phone, not the raster: Dutch801
                is already loaded for the header, and a live font beats any
                export at this size. The desktop keeps the artwork, which is
                the version its column was measured against. */}
            <Logo className="-translate-x-[0.33px] text-[20px] md:hidden" />
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
              // No CreativeOS nudge any more (client 2026-09-12): the 22px
              // shift made CreativeOS↔Kandy visibly tighter than
              // Kandy↔Konvert, and the slimmer plate clears the glow anyway.
              className="z-10 row-start-1 flex items-center gap-1.5 self-center justify-self-center"
              style={{ gridColumnStart: i + 3 }}
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
                      backgroundImage: "var(--bg, none)",
                      backgroundSize: "100% 100%",
                    }}
                      data-bg="url(/images/templates/cmp-row-band.webp)"
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
            className="z-10 col-start-2 hidden self-center justify-self-center whitespace-nowrap rounded-full md:inline-flex bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] px-3 py-2.5 text-[12px] font-semibold leading-none text-black transition-all duration-150 hover:bg-[linear-gradient(147deg,#000_0%,#000_100%)] hover:text-white md:px-5 md:text-[14px]"
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

/**
 * The plan card's list icons, INLINE SVG (Žilvinas 2026-09-11: "best
 * quality", stroke "the same as the text").
 *
 * Six of the seven are THE DESIGN'S OWN FILES (Žilvinas 2026-09-18, "replace
 * the icons according to its name which matches its title"): 16-grid
 * outlines at stroke 1.5 with round ends, one path each, pasted verbatim —
 * the viewBox is the file's own, the 0.75 inset it carries is the stroke's
 * half width. Drawn at 16 on the phone they are exactly the artboard's; the
 * desktop's 22 slot scales the grid up and thins the stroke back to ~1.5px.
 * Target is still Hugeicons' Target02 on its 24 grid, since no file came for
 * that row.
 */
const ACCESS_ICONS: Record<string, { viewBox: string; d: string[] }> = {
  // "500 winner static templates icon.svg"
  "icon-layers": {
    viewBox: "0 0 16 15",
    d: [
      "M0.75 7.25L7.49956 10.4023C7.59139 10.4452 7.6373 10.4667 7.68546 10.4751C7.72811 10.4826 7.77189 10.4826 7.81454 10.4751C7.8627 10.4667 7.90861 10.4452 8.00044 10.4023L14.75 7.25M0.75 10.5193L7.49956 13.6716C7.59139 13.7145 7.6373 13.736 7.68546 13.7444C7.72811 13.7519 7.77189 13.7519 7.81454 13.7444C7.8627 13.736 7.90861 13.7145 8.00044 13.6716L14.75 10.5193M0.75 3.98071L7.49956 0.828377C7.59139 0.78549 7.6373 0.764046 7.68546 0.755606C7.72811 0.748131 7.77189 0.748131 7.81454 0.755606C7.8627 0.764046 7.90861 0.78549 8.00044 0.828377L14.75 3.98071L8.00044 7.13303C7.90861 7.17592 7.8627 7.19737 7.81454 7.20581C7.77189 7.21328 7.72811 7.21328 7.68546 7.20581C7.6373 7.19737 7.59139 7.17592 7.49956 7.13303L0.75 3.98071Z",
    ],
  },
  // "50+ new templates month icon.svg"
  "icon-sparkles": {
    viewBox: "0 0 16 16",
    d: [
      "M12.3 4.95V1.45M3.2 14.05V10.55M10.55 3.2H14.05M1.45 12.3H4.95M3.9 0.75L3.35088 1.84824C3.16504 2.21993 3.07212 2.40577 2.94798 2.56681C2.83783 2.70971 2.70971 2.83783 2.56681 2.94798C2.40577 3.07212 2.21993 3.16504 1.84824 3.35088L0.75 3.9L1.84824 4.44912C2.21993 4.63496 2.40577 4.72788 2.56681 4.85202C2.70972 4.96217 2.83783 5.09028 2.94798 5.23319C3.07212 5.39423 3.16504 5.58007 3.35088 5.95176L3.9 7.05L4.44912 5.95176C4.63496 5.58007 4.72788 5.39423 4.85202 5.23319C4.96217 5.09028 5.09028 4.96217 5.23319 4.85202C5.39423 4.72788 5.58007 4.63496 5.95176 4.44912L7.05 3.9L5.95176 3.35088C5.58007 3.16504 5.39423 3.07212 5.23319 2.94798C5.09028 2.83783 4.96217 2.70972 4.85202 2.56681C4.72788 2.40577 4.63496 2.21993 4.44912 1.84824L3.9 0.75ZM11.25 7.75L10.5842 9.08157C10.3984 9.45326 10.3054 9.6391 10.1813 9.80015C10.0712 9.94305 9.94305 10.0712 9.80015 10.1813C9.6391 10.3054 9.45326 10.3984 9.08158 10.5842L7.75 11.25L9.08158 11.9158C9.45326 12.1016 9.6391 12.1946 9.80015 12.3187C9.94305 12.4288 10.0712 12.557 10.1813 12.6999C10.3054 12.8609 10.3984 13.0467 10.5842 13.4184L11.25 14.75L11.9158 13.4184C12.1016 13.0467 12.1946 12.8609 12.3187 12.6999C12.4288 12.557 12.557 12.4288 12.6999 12.3187C12.8609 12.1946 13.0467 12.1016 13.4184 11.9158L14.75 11.25L13.4184 10.5842C13.0467 10.3984 12.8609 10.3054 12.6999 10.1813C12.557 10.0712 12.4288 9.94305 12.3187 9.80015C12.1946 9.6391 12.1016 9.45326 11.9158 9.08158L11.25 7.75Z",
    ],
  },
  // "14-day money-back guaruanntee icon.svg"
  "icon-card": {
    viewBox: "0 0 16 13",
    d: [
      "M10.55 10.2833L11.95 11.75L14.75 8.81667M14.75 4.41667H0.75M14.75 5.88333V3.09667C14.75 2.27526 14.75 1.86455 14.5974 1.55082C14.4632 1.27484 14.249 1.05047 13.9856 0.909858C13.6861 0.75 13.2941 0.75 12.51 0.75H2.99C2.20593 0.75 1.81389 0.75 1.51441 0.909857C1.25099 1.05047 1.03681 1.27484 0.902591 1.55081C0.75 1.86455 0.75 2.27526 0.75 3.09667V8.67C0.75 9.49141 0.75 9.90211 0.902591 10.2159C1.03681 10.4918 1.25099 10.7162 1.51441 10.8568C1.81389 11.0167 2.20593 11.0167 2.99 11.0167H7.75",
    ],
  },
  // "customer support icon.svg"
  "icon-headset": {
    viewBox: "0 0 16 14",
    d: [
      "M14.75 10.0833V7.41667C14.75 3.73477 11.616 0.75 7.75 0.75C3.88401 0.75 0.75 3.73477 0.75 7.41667V10.0833M4.6 12.75C3.6335 12.75 2.85 12.0038 2.85 11.0833V9.08333C2.85 8.16286 3.6335 7.41667 4.6 7.41667C5.5665 7.41667 6.35 8.16286 6.35 9.08333V11.0833C6.35 12.0038 5.5665 12.75 4.6 12.75ZM10.9 12.75C9.9335 12.75 9.15 12.0038 9.15 11.0833V9.08333C9.15 8.16286 9.9335 7.41667 10.9 7.41667C11.8665 7.41667 12.65 8.16286 12.65 9.08333V11.0833C12.65 12.0038 11.8665 12.75 10.9 12.75Z",
    ],
  },
  // No file was supplied for "5 industries covered"; Hugeicons' Target02
  // stays, on its 24 grid.
  "icon-target": {
    viewBox: "0 0 24 24",
    d: [
      "M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7",
      "M14 2.20004C13.3538 2.06886 12.6849 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.3151 21.9311 10.6462 21.8 10",
      "M12.0303 11.9625L16.5832 7.4096M19.7404 4.34462L19.1872 2.35748C19.0853 2.03011 18.6914 1.89965 18.4259 2.11662C16.9898 3.29018 15.4254 4.87091 16.703 7.36419C19.2771 8.56455 20.7466 6.94584 21.8733 5.5853C22.0975 5.3146 21.9623 4.90767 21.6247 4.81005L19.7404 4.34462Z",
    ],
  },
  // "wrench icon.svg"
  "icon-tools": {
    viewBox: "0 0 16 16",
    d: [
      "M3.55 3.67867L6.7 6.97342M3.55 3.67867H1.45L0.75 1.48217L1.45 0.75L3.55 1.48217V3.67867ZM12.8313 1.29255L10.992 3.2164C10.7147 3.50635 10.5761 3.65133 10.5242 3.8185C10.4785 3.96555 10.4785 4.12396 10.5242 4.27101C10.5761 4.43818 10.7147 4.58316 10.992 4.87311L11.158 5.04682C11.4353 5.33677 11.5739 5.48175 11.7337 5.53606C11.8743 5.58384 12.0257 5.58384 12.1663 5.53606C12.3261 5.48175 12.4647 5.33677 12.742 5.04682L14.4625 3.24722C14.6478 3.71886 14.75 4.23541 14.75 4.77692C14.75 7.00093 13.0263 8.80384 10.9 8.80384C10.6437 8.80384 10.3932 8.77764 10.1508 8.72765C9.81053 8.65745 9.64038 8.62235 9.53723 8.6331C9.42757 8.64453 9.37352 8.66173 9.27636 8.71612C9.18496 8.76728 9.09328 8.86317 8.90992 9.05496L3.9 14.2951C3.3201 14.9016 2.3799 14.9016 1.8 14.2951C1.2201 13.6885 1.2201 12.7051 1.8 12.0986L6.80992 6.85845C6.99328 6.66667 7.08496 6.57077 7.13387 6.47518C7.18587 6.37354 7.20231 6.31701 7.21324 6.20231C7.22352 6.09442 7.18996 5.91645 7.12285 5.56052C7.07505 5.30705 7.05 5.04505 7.05 4.77692C7.05 2.55291 8.7737 0.75 10.9 0.75C11.6039 0.75 12.2636 0.947556 12.8313 1.29255ZM7.75004 10.2681L11.6 14.295C12.1799 14.9016 13.1201 14.9016 13.7 14.295C14.2799 13.6885 14.2799 12.7051 13.7 12.0985L10.5327 8.78576C10.3085 8.76356 10.0899 8.72126 9.87855 8.66058C9.60621 8.5824 9.30746 8.63915 9.10776 8.84802L7.75004 10.2681Z",
    ],
  },
  // "secure checkpoint icon.svg"
  "icon-shield": {
    viewBox: "0 0 14 16",
    d: [
      "M4.5 7.42124L6 8.83584L9.375 5.65299M12.75 7.77489C12.75 11.2466 8.73453 13.7717 7.27349 14.5755C7.10745 14.6668 7.02443 14.7125 6.90726 14.7362C6.81633 14.7546 6.68367 14.7546 6.59274 14.7362C6.47557 14.7125 6.39255 14.6668 6.22651 14.5755C4.76547 13.7717 0.75 11.2466 0.75 7.77489V4.39231C0.75 3.82681 0.75 3.54407 0.84807 3.30102C0.934706 3.08631 1.07549 2.89473 1.25824 2.74284C1.46512 2.5709 1.74585 2.47162 2.3073 2.27306L6.32865 0.850913C6.48457 0.795771 6.56253 0.7682 6.64274 0.757271C6.71388 0.747576 6.78612 0.747576 6.85726 0.757271C6.93747 0.7682 7.01543 0.795771 7.17135 0.850913L11.1927 2.27306C11.7542 2.47162 12.0349 2.5709 12.2418 2.74284C12.4245 2.89473 12.5653 3.08631 12.6519 3.30102C12.75 3.54407 12.75 3.82681 12.75 4.39231V7.77489Z",
    ],
  },
};

function AccessIcon({ name }: { name: string }) {
  const icon = ACCESS_ICONS[name];
  if (!icon) {
    return <Img src={`templates/${name}.webp`} alt="" width={22} className="shrink-0" />;
  }
  // PHONE: a 16 slot, the glyph at its file's own width inside it (the
  // files are 16 wide or 14, and 13 to 16 tall — a 16-tall viewBox height
  // is NOT forced, so the guarantee card stays 16 x 13 rather than being
  // stretched). Stroke is the file's 1.5 on its 16 grid, i.e. 1.5px at 16 —
  // Poppins Regular's stem at 16px. Desktop scales the slot to 22 and takes
  // the stroke to 1.1 grid units so it is still ~1.5px on screen. The 24-grid
  // target keeps the old 2 / 1.5 pair, which is ~1.3px at either size.
  const grid16 = !icon.viewBox.endsWith(" 24 24");
  return (
    <span className="grid size-[16px] shrink-0 place-items-center md:size-[22px]">
      <svg
        aria-hidden="true"
        viewBox={icon.viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          grid16
            ? "h-auto w-[16px] max-h-[16px] stroke-[1.5] md:w-[22px] md:max-h-[22px] md:stroke-[1.1]"
            : "size-[16px] stroke-2 md:size-[22px] md:stroke-[1.5]"
        }
      >
        {icon.d.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
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

        <div className="mx-auto mt-[37px] grid max-w-[980px] gap-5 md:mt-12 md:max-w-[1080px] md:grid-cols-2 md:gap-6">
          {/* From scratch. */}
          <article
            id={TEMPLATES_SCRATCH_CARD_ID}
            className="flex flex-col rounded-[15px] bg-[#111111] bg-cover bg-center p-6 md:rounded-[20px] md:p-7"
            style={{ backgroundImage: "var(--bg, none)" }}
            data-bg="url(/images/templates/access-card-dark.webp)"
          >
            <header className="flex items-center gap-3.5">
              {/* 35 square on the phone (artboard 2026-09-06), 44 on the
                  desktop reference. */}
              {/* NOT ONE BAKED 96px FILE ANY MORE (Žilvinas 2026-09-11):
                  that drew soft on a 3x phone. The square is CSS — the old
                  file's own 135deg gradient, sampled — and the emoji is a
                  separate high-res glyph (the supplied 181px 😔) at Figma's
                  64% of the square. Radius is Figma's 6.4 on a 64.33 square,
                  i.e. 10%, which holds at 35 and 53 alike.

                  53 on desktop, not the earlier 44 (client 2026-09-12): at
                  53 the tile exactly spans the 27/20 text block beside it,
                  so the title's top and the caption's bottom line up with
                  the tile's edges, as the reference card has it. */}
              <span className="grid size-[35px] shrink-0 place-items-center rounded-[10%] bg-[linear-gradient(135deg,#d57e80_0%,#b45455_50%,#b45455_100%)] md:size-[53px]">
                {/* 70%, not the sunglasses' 64 (client 2026-09-13): this
                    face is round where 😎 runs edge to edge, so at equal
                    canvas widths it read smaller. */}
                <Img
                  src="templates/access-emoji-bad-glyph.webp"
                  alt=""
                  width={28}
                  className="h-auto w-[70%]"
                />
              </span>
              {/* Centred on the square as it stands: measured, the title's
                  cap top to the caption's baseline sits dead on the square's
                  middle (Žilvinas 2026-09-11 asked; no nudge needed). */}
              <div>
                {/* Phone: SemiBold 16 with the caption Regular 16 at 50%
                    white directly under it (artboard 2026-09-06). Desktop:
                    27 SemiBold over a 20 Regular caption, measured off the
                    client's reference card (2026-09-12) — the earlier 32.01
                    wrapped "Ad creation with templates" onto two lines. */}
                <h3 className="text-[16px] font-semibold leading-tight text-white md:text-[27px]">
                  {a.scratch.title}
                </h3>
                <p className="text-[16px] font-normal leading-tight text-white/50 md:text-[20px] md:text-white/45">
                  {a.scratch.sub}
                </p>
              </div>
            </header>
            {/* PHONE SPACING off the artboard (Žilvinas 2026-09-18, measured
                24 x 22 and 24 x 25): 22 from the header to the figure's line
                box and 25 from it to the list. The plan card below takes the
                same two numbers ("do the same gapping"). Desktop untouched.
                The unit is "/year" with no space — the slash sits against
                the word, as the artboard sets it — and 5 off the figure
                (Žilvinas 2026-09-19, "add like 3 pixels" to the 2). */}
            <p className="mt-[22px] flex items-baseline gap-[5px] md:mt-7 md:gap-1.5">
              <span className="bg-[linear-gradient(180deg,#dd898b_0%,#c5696a_55%,#b65556_100%)] bg-clip-text text-[40px] font-semibold leading-none text-transparent md:text-[44px]">
                {a.scratch.figure}
              </span>
              {/* SemiBold 20, no tracking, and tight to the figure — the
                  slash is part of the price, not a separate label. */}
              {/* 3 below the figure's baseline on the phone, as Figma sets
                  it (Žilvinas 2026-09-11) — sharing the baseline read high. */}
              <span className="translate-y-[3px] text-[20px] font-semibold tracking-normal text-[#c5696a] md:translate-y-0 md:text-[16px] md:font-medium">
                {a.scratch.unit}
              </span>
            </p>
            {/* space-y 13 on the phone: 18 was "a bit bigger, like 7-8
                pixels" over the old 10 (Žilvinas 2026-09-18), then 3 lower
                and 2 lower again against the artboard (2026-09-19) — a 16
                line box plus 13 is a 29 row pitch. The plan card's list below
                takes the same, so the two keep one pitch. */}
            <ul className="mt-[25px] flex-1 space-y-[13px] md:mt-6 md:space-y-3">
              {a.scratch.items.map((item) => (
                <li key={item} className="flex items-center gap-[5px] text-[16px] font-normal leading-none text-white/90 md:gap-2.5 md:text-[20px] md:leading-normal">
                  {/* gap 5 on the phone (Žilvinas 2026-09-18, "bigger by 1-2
                      pixels"): the 13 cross sits 1.5 inside its 16 slot, so
                      5 puts ~6.5 of air between the cross and the text
                      against the artboard's 7. The plan card's rows take the
                      same gap, so both lists still start their text on one
                      line. */}
                  {/* The design's own cross ("cross icon.svg", supplied
                      2026-09-11) — its path and its 3.84 stroke verbatim,
                      square 23 viewBox so it cannot stretch. Drawn at 13,
                      a touch over the text's cap height (Žilvinas asked for
                      "a little bit" bigger than 11; 18 on desktop), centred in a
                      22 slot: the same slot as the plan card's icons, so
                      both lists share one row pitch (32) and one text
                      start (Žilvinas 2026-09-11). */}
                  <span className="grid size-[16px] shrink-0 place-items-center md:size-[22px]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 23 23"
                      fill="none"
                      className="size-[13px] stroke-white md:size-[18px]"
                      strokeWidth="3.84168"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.9209 1.9209L1.9209 20.9209M1.9209 1.9209L20.9209 20.9209"
                      />
                    </svg>
                  </span>
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
              className="mt-6 flex h-[60px] w-full items-center justify-center rounded-[15px] border-2 border-white bg-[image:var(--bg,none)] bg-cover text-[20px] font-normal uppercase tracking-normal text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black md:mt-8 md:rounded-[12px] md:border md:text-[24px] md:tracking-[0.06em]"
              data-bg="url(/images/templates/access-btn-dark.webp)"
            >
              {a.scratch.cta}
            </a>
          </article>

          {/* With templates — the highlighted plan. */}
          <article
            // No flat md:border any more (client 2026-09-12): the reference
            // card's frame is the phone's bottom-lit gradient ring at every
            // width — .access-card-ring now applies above md too.
            className="access-card-ring relative flex flex-col rounded-[15px] md:rounded-[20px] bg-[#131017] bg-cover bg-center p-6 shadow-[0_30px_80px_-30px_rgba(110,84,181,0.5)] md:p-7"
            style={{ backgroundImage: "var(--bg, none)" }}
            data-bg="url(/images/templates/access-card-purple.webp)"
          >
            <header className="flex items-center gap-3.5">
              {/* Same build as the scratch card's square: CSS gradient
                  sampled off the old file, 10% radius, and the supplied
                  99px 😎 ("cool glasses icon.png"). 53 on desktop to span
                  the 27/20 text block, like the card beside it. */}
              <span className="grid size-[35px] shrink-0 place-items-center rounded-[10%] bg-[linear-gradient(135deg,#9a7ed5_0%,#7a53b5_50%,#7a53b5_100%)] md:size-[53px]">
                <Img
                  src="templates/access-emoji-good-glyph.webp"
                  alt=""
                  width={28}
                  className="h-auto w-[64%]"
                />
              </span>
              <div>
                {/* Same reference sizes as the dark card's header. */}
                <h3 className="text-[16px] font-semibold leading-tight text-white md:text-[27px]">
                  {a.templates.title}
                </h3>
                {/* One line on the phone, as the artboard has it — at 16 it
                    only just fits beside the 35 emoji, and wrapping it put
                    "month." alone under the sentence. */}
                <p className="whitespace-nowrap text-[16px] font-normal leading-tight text-white/50 md:whitespace-normal md:text-[20px] md:text-white/45">
                  {a.templates.sub}
                </p>
              </div>
            </header>
            <p className="mt-[22px] flex items-center gap-3 md:mt-7">
              {/* The figure and its unit share a BASELINE; the chip beside
                  them centres on the row. Centring all three put "/month"
                  halfway up the 40 and left the chip riding high. */}
              <span className="flex shrink-0 items-baseline gap-[5px] whitespace-nowrap md:gap-1.5">
                <span className="bg-[linear-gradient(180deg,#a08ade_0%,#9275ce_50%,#7f56b6_100%)] bg-clip-text text-[40px] font-semibold leading-none text-transparent md:text-[44px]">
                  {a.templates.figure}
                </span>
                {/* 1.5 below the figure's baseline on the phone (Figma). */}
                <span className="translate-y-[1.5px] text-[20px] font-semibold tracking-normal text-[#9b79e2] md:translate-y-0 md:text-[16px] md:font-medium">
                  {a.templates.unit}
                </span>
              </span>
              {/* 149 x 34 on the phone (Žilvinas 2026-09-11, Figma), label
                  Regular 16 with NO tracking — the 0.04em it carried is
                  what made it 172 wide. 16 either side of ~117 of type is
                  the 149. Desktop keeps its own tracked 18. */}
              <span className="ml-auto flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full bg-[#232323] px-4 text-[16px] font-normal uppercase tracking-normal text-white md:h-auto md:px-6 md:py-3 md:text-[18px] md:tracking-[0.04em]">
                {a.templates.chip}
              </span>
            </p>
            <ul className="mt-[25px] flex-1 space-y-[13px] md:mt-6 md:space-y-3">
              {a.templates.items.map((item) => (
                <li key={item.label} className="flex items-center gap-[5px] text-[16px] font-normal leading-none text-white/90 md:gap-2.5 md:text-[20px] md:leading-normal">
                  <AccessIcon name={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
            <a
              href={APP_URL}
              className="mt-6 flex h-[60px] w-full items-center justify-center rounded-[15px] bg-[image:var(--bg,none)] bg-cover text-[20px] font-semibold uppercase tracking-normal text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] md:mt-8 md:rounded-[12px] md:text-[24px] md:tracking-[0.06em]"
              data-bg="url(/images/templates/access-btn-purple.webp)"
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
          // md:pr-[18px]: measured off the built page, the purple card's
          // BUY NOW fill ends ~18px in from the container edge (its p-7 is
          // offset by the card ring's inner geometry), and the CTA's right
          // edge aligns to THAT, not to a theoretical 28 (client 2026-09-12).
          className="relative mx-auto mt-5 flex h-[150px] max-w-[980px] md:max-w-[1080px] flex-col items-start justify-center gap-4 rounded-[18px] bg-[image:var(--bg,none)] bg-cover bg-center p-5 sm:flex-row sm:items-center md:mt-6 md:h-auto md:justify-start md:overflow-hidden md:bg-[image:var(--bg-md,none),linear-gradient(100deg,#1c1426_0%,#150f1e_45%,#0d0a12_100%)] md:pl-6 md:pr-[18px]"
          data-bg="url(/images/templates/access-banner-phone.webp)"
          data-bg-md="url(/images/templates/access-rays.webp)"
        >
          <div className="flex items-center gap-3.5">
            {/* Built like the two card squares (Žilvinas 2026-09-11): the
                old SVG drew 🤩 as a raster inside a <pattern>, soft at any
                size. Its own gradient and 6.4-on-64.33 radius (10%) in CSS,
                the supplied 112px 🤩 on top at the SVG's 70%. */}
            <span className="grid size-[44px] shrink-0 place-items-center rounded-[10%] bg-[linear-gradient(135deg,#4c4c4c_0%,#0a0a0a_40%,#333333_100%)]">
              <Img
                src="templates/access-banner-emoji-glyph.webp"
                alt=""
                width={31}
                className="h-auto w-[70%]"
              />
            </span>
            <div>
              {/* Phone: 16/16 SemiBold, title ALONE — the artboard drops
                  the caption there, where the title already wraps to two
                  lines. Desktop: the Figma panel's own 32.01 SemiBold over
                  23.61 Regular (client 2026-09-07). */}
              <p className="text-[16px] font-semibold leading-4 text-white md:text-[24px] md:leading-tight">
                <BreakBefore text={a.banner.title} word="creatives" />
              </p>
              <p className="hidden text-[13px] font-normal text-white/45 md:block md:text-[17px] md:leading-snug">{a.banner.sub}</p>
            </div>
          </div>
          <a
            href={BOOKING_URL}
            // #000, not the #100d16 it had — a purple-black that read blue
            // against the banner (Žilvinas 2026-09-11; Figma fill 000000).
            // 305 x 50 on the phone, i.e. the banner's full content width.
            // The gradient layer stays so the hover still cross-fades.
            className="discovery-ring group inline-flex h-[50px] w-full items-center gap-2.5 rounded-[100px] bg-[linear-gradient(147deg,#000_0%,#000_100%)] pl-[17px] pr-5 md:pl-2 text-[15px] font-semibold uppercase tracking-[0.05em] text-white transition-all duration-150 hover:bg-[linear-gradient(147deg,#fff_0%,#fff_100%)] hover:text-black sm:ml-auto sm:w-auto md:h-[46px] md:border md:border-white/70"
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
    // md:pb-14, half the page's usual 28: the Access header under this
    // section sits higher (client 2026-09-12).
    <section aria-labelledby="showcase-heading" className="pt-[60px] md:pb-14 md:pt-0">
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
          tile row.
          PHONE: Figma's 37 is from the heading's BASELINE to the first ad's
          top edge (Žilvinas 2026-09-11), not box to box. The baseline sits
          ~5 above the 36px line box's bottom, so the rows start 32 under
          it. ShowcaseRows is the phone's animated strips; the flat wall
          below is the desktop's.
          DESKTOP: -104 per the client's reference crop (2026-09-12): the
          heading laps onto the wall's black top region and clears the first
          white tile by ~58px. NOT the old -180 — the current wall export
          starts with tiles at its very top edge (no empty black band), and
          -180 buried "1 cent = 1 design" behind the middle tile. */}
      <div aria-hidden="true" className="mt-[32px] md:-mt-[104px] md:-mb-16">
        <ShowcaseRows />
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
 * The phone showcase — PHONE ONLY (Žilvinas 2026-09-11). Two strips of
 * 170 x 170 ads, radius 10, 15 apart both ways; the upper drifts RIGHT and
 * the lower LEFT, forever — the hero's strips in the other directions
 * (.tile-drift in globals.css). This replaces the phone's baked wall image.
 *
 * The first three of each row are the artboard's, in its order and at its
 * positions: Oura cut by the left edge, Gadzhi, Huel cut by the right on top;
 * the skincare ad showing only its right edge, Plenny, Gymshark underneath.
 * The rest are the desktop wall's other fully visible ads, split between the
 * two rows, so a loop is 5 on top and 6 below.
 *
 * Every tile is cut from the walls themselves — the desktop's 2400 export at
 * ~384 a tile, Gadzhi and Plenny from the phone wall at ~510 — which is more
 * resolution than the 300 exports in the supplied set.
 *
 * Positions are anchored to the centre, as the hero strips are, so the
 * artboard's slice of each tile holds at every phone width. Both rows are
 * laid out one whole set further left than the artboard: identical on
 * screen, since the sets repeat, and it keeps both edges covered through
 * the loop at up to 767 wide. Three sets per strip for the same reason.
 */
const SHOWCASE_ROWS = [
  {
    // Artboard at 375: Oura's left edge at -40, i.e. centre - 227.5.
    left: -227.5,
    drift: "right",
    tiles: ["oura", "gadzhi", "huel", "tea", "lanolips"],
  },
  {
    // Skincare's left edge at -140, i.e. centre - 327.5.
    left: -327.5,
    drift: "left",
    tiles: ["skincare", "plenny", "gymshark", "pilot", "olipop", "mom"],
  },
] as const;

/** 170 tile + 15 gutter. */
const SHOWCASE_PITCH = 185;

function ShowcaseRows() {
  return (
    // data-defer-group: the rows drift sideways without end, so their tiles
    // load as one block when the wall comes into range rather than each as it
    // happens to cross the viewport — see paint-gate-script.ts.
    <div data-defer-group="" className="relative h-[355px] overflow-hidden md:hidden">
      {SHOWCASE_ROWS.map((row, r) => {
        const set = row.tiles.length * SHOWCASE_PITCH;
        return (
          <div
            key={row.drift}
            className={`tile-drift absolute flex gap-[15px] ${row.drift === "right" ? "tile-drift-reverse" : ""}`}
            style={
              {
                top: r * SHOWCASE_PITCH,
                left: `calc(50% + ${row.left - set}px)`,
                "--drift-set": `${set}px`,
                // The hero's ~25px/s.
                "--drift-duration": `${set / 25}s`,
              } as React.CSSProperties
            }
          >
            {[...row.tiles, ...row.tiles, ...row.tiles].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="block size-[170px] shrink-0 overflow-hidden rounded-[10px]"
              >
                <Img
                  src={`templates/showcase-tile-${name}.webp`}
                  alt=""
                  width={170}
                  className="size-full object-cover"
                />
              </span>
            ))}
          </div>
        );
      })}
    </div>
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
  // Poppins MEDIUM at every size (client 2026-09-11) — the desktop semibold
  // is gone. 36 on the phone, 40 above md; the monthly card's number is its
  // own 48 — see below.
  //
  // The "shiny" fill, sampled from the client's reference glyph ("ytdf.png",
  // 2026-09-11): a lavender #A08ADD highlight in the TOP-LEFT corner melting
  // into the base violet by 40% of the 135° diagonal — the light sits at the
  // start, where the old ramp put it at the end. The drop-shadow (not
  // text-shadow: the glyphs are gradient-clipped, so the filter shadows the
  // painted pixels) lifts the numbers off the dark cards.
  const SHINE =
    "bg-[linear-gradient(135deg,#a08add_0%,#7c54b5_40%,#7155b5_100%)] bg-clip-text text-transparent drop-shadow-[0_5px_12px_rgba(0,0,0,0.45)]";
  const BIG = `${SHINE} text-[36px] font-medium leading-none md:text-[40px]`;
  const SMALL = `${SHINE} text-[24px] font-medium leading-none`;
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
        <div className="mx-auto mt-[37px] grid max-w-[1080px] grid-cols-2 gap-[15px] md:mt-12 md:grid-cols-[1fr_1fr_1.074fr] md:grid-rows-[243px_241px] md:gap-[15px]">
          {/* 24/7 support — the baked art carries the memoji cluster and the
              "Need help?" bubble, so only the headline renders as text.
              PHONE has its own art (Žilvinas 2026-09-11): 660 x 476, exactly
              4x the 165 x 119 card, supplied already dimmed — so the 45%
              black this card used to lay over the desktop art is gone. */}
          <article
            // md:bg oversized 108.6% and pinned right (client 2026-09-13): the
            // art's baked "Need help?" pill sat 28px right of the headline's
            // inset; sliding the art left puts the pill's left edge on the
            // same 24px line as "24/7", as the reference card has it.
            className={`${CARD} flex h-[119px] flex-col items-center justify-center bg-[image:var(--bg,none)] p-4 text-center md:h-auto md:min-h-[210px] md:items-start md:justify-start md:bg-[image:var(--bg-md,none)] md:bg-no-repeat md:bg-[length:108.6%_auto] md:bg-[position:right_center] md:p-6 md:text-left`}
            data-bg="url(/images/templates/inside-support-phone.webp)"
            data-bg-md="url(/images/templates/inside-support.webp)"
          >
            <p className="relative">
              <span className={BIG}>{s.support.big}</span>
              <span className={`${SMALL} block md:mt-1`}>{s.support.small}</span>
            </p>
          </article>

          {/* 5 industries — chip rows baked into the background art. Same
              phone treatment as the support card: its own 4x, pre-dimmed. */}
          <article
            className={`${CARD} flex h-[119px] flex-col items-center justify-center bg-[image:var(--bg,none)] p-4 text-center md:h-auto md:min-h-[210px] md:items-stretch md:justify-end md:bg-[image:var(--bg-md,none)] md:p-6 md:text-left`}
            data-bg="url(/images/templates/inside-industries-phone.webp)"
            data-bg-md="url(/images/templates/inside-industries.webp)"
          >
            <p className="relative">
              <span className={BIG}>{s.industries.big}</span>
              <span className={`${SMALL} block md:mt-1`}>{s.industries.small}</span>
            </p>
          </article>

          {/* Trustpilot, spanning under both cards. Wordmark is styled text —
              see the note on TEMPLATES_PAGE.inside. */}
          <article
            className={`${CARD} col-span-2 flex flex-col items-center justify-center text-center md:h-[241px]`}
          >
            {/* The laurel export as a mask painted with the design grey —
                the artwork itself is black, invisible on this card. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[#221f26]"
              // Deferred like the backgrounds: a mask-image is fetched as
              // eagerly as any other CSS url(), and this card is six screens
              // down. var(--bg, none) is the same handle the script sets.
              data-bg="url(/images/templates/laurel-mask.webp)"
              style={{
                WebkitMaskImage: "var(--bg, none)",
                maskImage: "var(--bg, none)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            {/* gap 5 between the tiles on the phone (Žilvinas 2026-09-18,
                off the artboard); the desktop keeps its 6. */}
            <span
              className="relative inline-flex gap-[5px] md:gap-1.5"
              role="img"
              aria-label="5 out of 5 stars"
            >
              {/* ONE BAKED TILE per star (client 2026-09-13): the square
                  and the notched Trustpilot star cut as one 121px tile from
                  the client's reference — the old 42px star webp drew soft
                  and its notch never survived the downscale. */}
              {Array.from({ length: 5 }, (_, i) => (
                <Img
                  key={i}
                  src="templates/trustpilot-star-tile.webp"
                  alt=""
                  width={26}
                  className="size-[14px] md:size-[26px]"
                />
              ))}
            </span>
            {/* THE WHOLE LOCKUP AS ONE FILE. Star and wordmark used to be
                two elements aligned against each other, which is a fight the
                design never asked for: the mark is a licensed lockup with
                its own spacing, and the file already has it. Since
                2026-09-19 it is the client's "trustpilot logo.png" (3088 x
                820, "such a better quality"), cropped to its ink and shipped
                as an 800-wide LOSSLESS WebP — white on alpha compresses to
                9 KB, and lossy ringing on a white edge is the whole problem
                it replaces. Same file for the phone and the desktop. The
                source clips the p's descender flush at its bottom edge; that
                is in the file as supplied. */}
            {/* 126 WIDE on the phone (Žilvinas 2026-09-18, "trustpilot should
                be 126 x 34"). The artboard's 126 x 34 frame is the lockup's
                box with empty top inside it; the file here is cropped to the
                ink, 292 x 60, so 126 wide is 26 tall and sits 8 under the
                stars, where the frame's ink sits. It had been set by HEIGHT
                (h-34 with w-auto), which made it 165 wide, a third bigger
                than the artboard, and then nudged up 6 to compensate — that
                nudge is gone with the cause. */}
            <Img
              src="templates/trustpilot-lockup.webp"
              alt="Trustpilot"
              width={126}
              className="relative mt-2 h-auto w-[126px] md:mt-3 md:h-[33px] md:w-auto"
            />
            <p className={`${SMALL} relative mt-1 md:mt-2 md:!text-[20px]`}>{s.reviews.caption}</p>
          </article>

          {/* 50+ new templates monthly — the dimmed collage is the baked
              background, anchored to the card's bottom like the design.
              PHONE has its own art (Žilvinas 2026-09-11), cropped off its
              drop shadow to the 345 x 222 card at 4x. Its fade to black is
              in the art, so the gradient that used to be laid over it here
              is gone. */}
          <article
            className={`${CARD} col-span-2 flex h-[222px] flex-col items-center bg-[image:var(--bg,none)] pt-7 text-center md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:h-auto md:min-h-[360px] md:items-stretch md:bg-[image:var(--bg-md,none)] md:pt-6 md:text-left`}
            data-bg="url(/images/templates/inside-monthly-phone.webp)"
            data-bg-md="url(/images/templates/inside-monthly.webp)"
            style={{ backgroundPosition: "center bottom" }}
          >
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
        <div className="mx-auto mt-[37px] grid max-w-[1080px] gap-[27px] md:mt-12 md:grid-cols-2 md:gap-[125px]">
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
            style={{ backgroundImage: "var(--bg, none)" }}
            data-bg="url(/images/templates/diff-card-dark.webp)"
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
              {/* PHONE: the art hard-cuts the ads on the left and the lid on
                  the right; the export is cropped to exactly those two cuts
                  and drawn edge to edge, so they land on the card's own edges
                  instead of as a visible line 14px inside it. The bin fades
                  out at the bottom in the art itself, so the card's bottom
                  edge cuts only the fade. 59 from the top puts the green ad
                  ~80 down, clear of the chips.

                  BOTH CUTS COME FROM ONE MASTER NOW (Žilvinas 2026-09-18,
                  "bin with an ad.png", 2520 x 3107, "the highest quality"):
                  each was registered against it by template match (0.92 and
                  0.93) and turned out to be the master less its empty top —
                  237 rows for this one, 292 for the desktop's — so they are
                  re-cut from it at the same windows and nothing moved. The
                  phone's is 1380 wide, 4x its 345 span, from a source that
                  had 2.1x the pixels of the Siuksline.png export it replaces;
                  alpha_quality 90 keeps the bottom fade within one level. */}
              <span className="absolute inset-x-0 top-[59px] block md:hidden">
                <Img src="templates/diff-trashcan-phone.webp" alt="" className="w-full" />
              </span>
              {/* DESKTOP, run 5% past each edge. Re-supplied 2026-09-11 ("bin
                  with an ad.png"): the same composition at twice the
                  resolution, with a transparent ground instead of a baked
                  dark one — cropped to register 1:1 with the file it
                  replaces, so the placement did not move. Re-cut 2026-09-18
                  from the master at 2000 wide (was 1800 at 1.4x fewer source
                  pixels); see the phone note above. */}
              <span className="absolute left-[-5%] top-[8%] hidden w-[110%] md:block">
                <Img src="templates/diff-trashcan-v2.webp" alt="" className="w-full" />
              </span>
            </div>
            {/* Poppins 16/16 on the phone, 24 at md. The lead is MEDIUM at
                every size (client 2026-09-11) — the earlier desktop bold is
                gone. Letter spacing stays at 0%. md:leading-[21px]: measured
                off the client's reference crop (2026-09-11) — a 27.5px line
                pitch at their ~1.3x screen scale is 21 CSS px on the 24px
                face, tighter than even leading-none. */}
            <p className="relative z-10 mt-auto text-[16px] font-medium leading-4 text-white md:text-[24px] md:leading-[21px]">
              {d.bad.lead}{" "}
              <span className="font-normal text-white/50">{d.bad.rest}</span>
            </p>
          </article>

          {/* Mushi. justify-between: chip top, ad centred, caption pinned to
              the bottom so both cards' captions align. */}
          <article className="flex flex-col overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_95%_75%_at_50%_38%,#9a81d6_0%,#7b54b5_80%)] px-6 pb-[18px] pt-5 md:h-auto md:rounded-[24px] md:p-7">
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
                {/* TWO FILES, one mark. The phone draws it 14 tall inside the
                    26 pill (with the 7 gutters, the artboard's 62 x 26), and
                    a height set on the export as supplied would spend most of
                    that on its ~45% transparent margin — so the phone gets a
                    copy trimmed to the ink. The desktop keeps the file it was
                    signed off with, at its own 68. */}
                <Img
                  src="templates/diff-mushi-mark-phone.webp"
                  alt="Mushi"
                  width={47}
                  className="h-[14px] w-auto md:hidden"
                />
                <Img
                  src="templates/diff-mushi-mark.webp"
                  alt="Mushi"
                  width={68}
                  className="hidden md:block"
                />
              </span>
            </div>
            {/* Full width of the caption below it, and the card grows to
                carry it (Žilvinas 2026-09-11). This card used to be a fixed
                453 with the ad object-contained inside, which only fits at the
                345 artboard; anything wider letterboxed the ad and left it
                narrower than the text — 18 short at 390, 59 at 430. Height
                now follows width: 455 at the artboard, a couple of px over. */}
            <Img
              src="templates/diff-ad-good.webp"
              alt={d.good.alt}
              className="mt-[13px] h-auto w-full md:mt-5"
            />
            {/* Same treatment as the card beside it: medium at every size,
                same measured 21px leading above md. */}
            <p className="mt-6 text-[16px] font-medium leading-4 text-white md:text-[24px] md:leading-[21px]">
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
 * Category tiles beside the window: ~190px dark tiles with a soft radial
 * glow, label on top, the supplied emoji artwork at 100px beneath. Since
 * 2026-09-09 the two rows are marquees — the top row drifts RIGHT, the
 * bottom LEFT — instead of the earlier static scatter. z-0 puts them UNDER
 * the MacBook (z-1) so they slide behind the device; the wrapper's
 * overflow-hidden supplies the viewport-edge cuts. Decorative, so
 * aria-hidden; hidden below xl.
 *
 * Same seamless-loop construction as the creatives marquee: the track holds
 * two identical halves and marquee-x slides exactly one half. Each half is
 * the 5-tile set three times over (15 × 220px = 3300px), wider than any
 * viewport, so the loop point can never show inside the clip.
 */
function CategoryTileRow({
  row,
  reverse,
  offset = 0,
}: {
  /** Which of the two rows this is; the CSS carries their positions. */
  row: "top" | "bottom";
  reverse?: boolean;
  /* Rotates the set so the two rows never sit label-above-same-label at
     load, before the drift has separated them. */
  offset?: number;
}) {
  const set = [
    ...TEMPLATES_PAGE.categories.slice(offset),
    ...TEMPLATES_PAGE.categories.slice(0, offset),
  ];
  const half = Array.from({ length: 3 }, () => set).flat();
  return (
    <div
      className={`tile-marquee-track hero-tile-row hero-tile-row--${row} absolute left-0${reverse ? " tile-marquee-track--reverse" : ""}`}
    >
      {[0, 1].map((h) => (
        <div key={h} className="hero-tile-set flex">
          {half.map((c, i) => (
            <span
              key={`${c.label}-${i}`}
              className="hero-tile flex flex-col items-center bg-[radial-gradient(circle_at_50%_42%,#3a3a3a_0%,#1c1c1c_58%,#101010_100%)] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]"
            >
              {/* Roboto Black per the supplied FASHION.png sample; tight
                  tracking to match its near-touching letters. */}
              <span className="hero-tile-label font-tile font-black uppercase tracking-[-0.01em] text-white">
                {c.label}
              </span>
              {/* priority, for the reason on the phone field below: the
                  tiles are part of the hero, not of the scroll. */}
              <Img src={c.image} alt="" width={84} className="hero-tile-art" priority="gate" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function CategoryTiles() {
  return (
    <div
      aria-hidden="true"
      // lg, not the earlier xl: scaled displays commonly land a maximised
      // window a few CSS px UNDER 1280 (the client's sits at ~1272), where
      // xl made the rows vanish entirely (client 2026-09-12).
      //
      // THE FIELD IS THE DEVICE'S OWN BOX, not the section's. It renders
      // inside AppWindow's wrapper — inset-y-0 so it is exactly as tall as
      // the MacBook, and w-screen off the centre line so the rows still run
      // clear across the viewport. hero-tile-field makes it a SIZE container,
      // so 100cqh below IS the device's height.
      className="hero-tile-field pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-screen -translate-x-1/2 overflow-hidden lg:block"
    >
      {/* CENTRED ON THE PICTURE OF THE COMPUTER (client 2026-09-13), and
          sized between the artboard's own 230 and what the device can hold —
          both rules live in .hero-tile-row in globals.css, which is also
          where the reasoning is written down. The device sizes itself off the
          height left under the text (`(100svh - 444px) * 1.6` on AppWindow),
          so anything pinned to the section — or, before that, to fixed
          pixels — drifted up the device as the window got shorter and on a
          15" Mac ran out of the bottom of the hero altogether. */}
      <CategoryTileRow row="top" reverse />
      <CategoryTileRow row="bottom" offset={2} />
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
    // ONE SCREEN (client 2026-09-10): from md up the device's width is
    // capped by the HEIGHT still free under the text block — 100svh minus
    // header + badge + title + CTA (~330px) times the artwork's 1.6 aspect —
    // so the hero always ends above the fold, on any screen. The 1010px cap
    // still rules on tall monitors.
    <div
      className="relative z-[1] mx-auto mt-[30px] w-full max-w-[1010px] px-4 md:mt-6 md:[width:min(100%,calc((100svh-444px)*1.6))]"
    >
      <PhoneTiles />
      <CategoryTiles />

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

          2x (538 across a 269 box), down from 3x on 2026-09-13, and NO -sm
          companion. The 3x file was 134 KB and this is the ONE image the
          paint gate holds the whole first screen for, so it was a third of
          everything the page had to load before it was allowed to show
          anything — and PageSpeed measures its Largest Contentful Paint over
          exactly that budget. 66 KB now.

          What that costs: 3x was not about resolution but about
          supersampling. A DPR-3 phone drew 807 real pixels 1:1 and a DPR-2
          one downsampled 807 to 538, which is sharper than drawing a 538 file
          straight. At 2x both draw 538 — still exactly retina for the 269
          box, and checked against the old export at DPR 3 before the swap.
          The file is a Lanczos downsample of the 3x master, not a re-export
          of anything softer.

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
      {/* NO ROUNDED CLIP, NO SCALE on the MacBook (Žilvinas 2026-09-05: "as
          the mac screenshot attached — not you added some stupid corners").

          The master draws the device frame and the screen's own corners
          itself. Wrapping it in `overflow-hidden rounded-[22px]` added a
          SECOND set at a different radius, and the `scale-[1.02]` that pushed
          the artwork's own bezel out past that clip is what made the two
          visibly disagree. The image goes in as it comes.

          The file is the supplied master ("Macbook 1.png", re-supplied
          2026-09-05) at 5200 x 3256, straight down to 2400 x 1503 and
          nothing else done to it.

          ONE <picture>, NOT TWO BREAKPOINT-HIDDEN <img>s. `hidden md:block`
          hides an image; it does not stop the browser fetching it. Both were
          eager, so a phone pulled the 397 KB MacBook at high priority, never
          painted a pixel of it, and the paint gate sat waiting on it before
          it would show the phone hero — the single biggest number on the
          phone's clock. As a <picture> the browser takes the matching entry
          and only that one.

          The two devices are the same element now, so the classes fork at md
          instead of the markup: 269 wide and centred below, full width with
          the deep drop shadow above. `relative z-[1]` at both ends — the tile
          field beside it is a positioned z-0 layer inside this same wrapper,
          and a positioned element paints over in-flow content whatever the
          order, so the device has to be positioned to stay on top of it. */}
      <Img
        src="templates/hero-phone.webp"
        alt="The Mushi template library: ad templates with industry and sort filters"
        width={269}
        alternate={{ src: "templates/hero-macbook.webp", media: "(min-width: 768px)" }}
        className="relative z-[1] mx-auto -mb-px w-[269px] max-w-full md:mb-0 md:w-full md:max-w-none md:drop-shadow-[0_50px_140px_rgba(0,0,0,0.95)]"
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
/*
 * THEY DRIFT (Žilvinas 2026-09-11): the upper row left, the lower row right,
 * on an infinite loop — see .tile-drift in globals.css. Each row renders its
 * five tiles three times and moves exactly one set (755) per loop, so the
 * artboard's composition above is what every loop starts and ends on.
 *
 * The right-moving row is laid out one set further left than its artboard
 * position (TILE_SET below): a strip that starts where the artboard has it
 * and moves right would open a gap at the left edge within seconds. Shifting
 * by a whole set changes nothing on screen, because the sets are identical.
 */
const PHONE_TILE_ROWS = [
  { top: 100, left: -385, drift: "left", tiles: ["Beauty", "Drink", "Fashion", "Beauty", "Food"] },
  { top: 252, left: -330, drift: "right", tiles: ["Food", "Fashion", "Beauty", "Food", "Drink"] },
] as const;

/** One set of five tiles: 5 x (131 + 20). Must match @keyframes tile-drift. */
const TILE_SET = 755;

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
  // tile's size and draws visibly soft. They are flattened to WebP instead
  // (the same pass scripts/svg-raster-to-webp.py does for the award badges),
  // which is both sharper and a tenth of the bytes. CreativeOS's is the
  // client's own "Creative OS ogo.svg" (2026-09-18, "highest quality as it
  // can be" — and PHONE ONLY, the desktop chip stays its SVG export):
  // scripts/svg-pattern-composite.py at 4x and LOSSLESS, since the 3x lossy
  // cut rang round the letters at 3x DPR.
  Konvert: { src: "logo-konvert.svg", w: 67, svg: true },
  Kandy: { src: "logo-kandy.webp", w: 45 },
  CreativeOS: { src: "logo-creativeos.webp", w: 100 },
};

function BrandChips({ brands }: { brands: readonly string[] }) {
  return (
    <>
      <ul className="relative z-10 flex flex-nowrap items-center justify-center gap-[15px] md:hidden">
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
                  // data-src, like every other below-fold picture: this is
                  // the one raw <img> on the page (Img sizes from the webp
                  // table and this is a vector), so it opts in by hand. The
                  // 16 KB was landing before the first screen had painted.
                  data-src={`/images/templates/${logo.src}`}
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

      {/* THE DESKTOP ROW IS UNTOUCHED (the phone work of 2026-09-06 was
          explicitly phone-only): 36-tall chips, Konvert set in Satoshi beside
          its own blue mark, the other two as the chip-*.svg exports. */}
      <ul className="relative z-10 hidden flex-wrap items-center justify-center gap-2.5 md:flex">
        {brands.map((brand) => (
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
    </>
  );
}

function PhoneTiles() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-visible md:hidden">
      {PHONE_TILE_ROWS.map((row) => (
        <div
          key={row.top}
          className={`tile-drift absolute flex gap-5 ${row.drift === "right" ? "tile-drift-reverse" : ""}`}
          style={{
            top: row.top,
            left: `calc(50% + ${row.left - (row.drift === "right" ? TILE_SET : 0)}px)`,
          }}
        >
          {[...row.tiles, ...row.tiles, ...row.tiles].map((label, i) => {
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
                  {/* priority: these five glyphs are ON the first screen —
                      the drifting field beside the device — so they are
                      gated with it rather than deferred to the observer.
                      Five files, ~47 KB between them, and each tile is the
                      same file over again. */}
                  <Img src={cat.image} alt="" width={58} priority="gate" />
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * THE NO-JAVASCRIPT TWIN OF THIS PAGE'S DEFERRED BACKGROUNDS.
 *
 * Every card, band and panel artwork below the fold keeps its URL in
 * `data-bg` rather than in a property the browser can fetch from, and the
 * inline script moves it into `--bg` as the element comes into range (see
 * src/lib/paint-gate-script.ts). That is 900 KB the phone no longer spends
 * before the first screen is allowed to paint.
 *
 * With JavaScript off nothing ever moves it, so this renders the rules that
 * do it unconditionally. They match on the data attribute, so no element
 * needs an id and nothing here can point at the wrong box — but a NEW
 * deferred background does have to be added to this list, or it simply will
 * not appear for a visitor without JavaScript.
 *
 * Renders nothing at all when JavaScript is on.
 */
export function TemplatesBgFallbacks() {
  const files = [
    "process-card-1.webp",
    "process-card-2.webp",
    "process-card-3.webp",
    "compare-card.webp",
    "cmp-row-band.webp",
    "access-card-dark.webp",
    "access-btn-dark.webp",
    "access-card-purple.webp",
    "access-btn-purple.webp",
    "access-banner-phone.webp",
    "diff-card-dark.webp",
    "inside-support-phone.webp",
    "inside-industries-phone.webp",
    "inside-monthly-phone.webp",
  ];
  // The desktop twins, which the class only uses above md.
  const wide = [
    "access-rays.webp",
    "inside-support.webp",
    "inside-industries.webp",
    "inside-monthly.webp",
  ];
  return (
    <>
      {files.map((f) => (
        <BgFallback key={f} bg={`url(/images/templates/${f})`} />
      ))}
      {wide.map((f) => (
        <BgFallback key={f} bg="" md={`url(/images/templates/${f})`} />
      ))}
      {/* The laurel behind the Trustpilot card is a MASK, not a fill. */}
      <BgFallback bg="url(/images/templates/laurel-mask.webp)" mask />
    </>
  );
}
