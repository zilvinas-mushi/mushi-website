import type { CSSProperties } from "react";
import { Img } from "./Img";
import { LazyImg } from "./CreativeCard";
import { CoverflowRail } from "./CoverflowRail";
import { ArrowDisc } from "./Sections";
import { CASE_STUDIES_PAGE } from "@/lib/content";
import { BOOKING_URL, CASE_STUDIES_CALL_ID, CASE_STUDIES_RAILS_ID } from "@/lib/site";

/**
 * /case-studies, section by section. design/CASE-STUDIES.md is the spec and
 * holds every number below with the Figma node it came from.
 *
 * TWO RULES THE WHOLE FILE FOLLOWS
 *
 * 1. Desktop lengths are the frame's px divided by 16, in rem — the page
 *    scale (globals.css). `r()` does the division so the number in the source
 *    is still the number on the artboard. Phone lengths are the 375 artboard's
 *    px, as px.
 *
 * 2. The page is the frame minus its top 54px on desktop, and plus 11px on
 *    the phone, because the header is the shared one and its bar ends at 102
 *    and 84 where the frame's ends at 156 and 73. Every y below is already in
 *    PAGE space; the frame value is in the spec.
 */

const r = (px: number) => `${px / 16}rem`;

/* --------------------------------------------------------------- field --- */

/**
 * A floating icon. `d` / `p` are [x, y, w, h] in page px for the desktop and
 * the phone — x measured from whichever edge `anchor` names. The two the
 * frame cuts with its own edge (Sintra, RHEA) are pinned to the WINDOW's
 * edge, so the cut is always the screen's; the rest ride the centred
 * composition with the cards.
 */
type Floater = {
  name: string;
  d: [number, number, number, number];
  dAnchor: "centre" | "left" | "right";
  p: [number, number, number, number];
  pAnchor: "left" | "right";
  /** Above the fold on a 1080-tall desktop — joins the paint gate. */
  eager?: boolean;
};

const FLOATERS: Floater[] = [
  // Figma's own 4x exports of each group (2026-10-04), cut to their ink. The
  // boxes are that ink's, in page px. RHEA's phone file is still the composed
  // one — its export was not in the batch.
  { name: "layers", d: [206, 948, 155, 138], dAnchor: "centre", p: [0, 489, 64, 109], pAnchor: "left", eager: true },
  { name: "f", d: [1599, 874, 193, 143], dAnchor: "centre", p: [0, 1065, 98, 100], pAnchor: "left", eager: true },
  { name: "pb", d: [1395, 1075, 200, 141], dAnchor: "centre", p: [0, 861, 60, 98], pAnchor: "right", eager: true },
  { name: "sintra", d: [-14.75, 1145, 275, 243], dAnchor: "left", p: [0, 435, 85.5, 95], pAnchor: "right" },
  { name: "sc", d: [1546, 1258, 259, 233], dAnchor: "centre", p: [0, 1160, 53, 82], pAnchor: "right" },
  { name: "orange", d: [144.5, 1471.5, 178, 130], dAnchor: "centre", p: [54.5, 743.5, 108, 97], pAnchor: "left" },
  { name: "rhea", d: [0, 1536, 159, 167], dAnchor: "right", p: [0, 320, 74, 91], pAnchor: "left" },
];

function floaterStyle(f: Floater): CSSProperties {
  const [dx, dy, dw, dh] = f.d;
  const [px, py, pw, ph] = f.p;
  return {
    // Desktop: from the centre line (frame x − 960) or from a window edge.
    "--dx":
      f.dAnchor === "centre" ? `calc(50% + ${r(dx - 960)})` : f.dAnchor === "left" ? r(dx) : "auto",
    "--dr": f.dAnchor === "right" ? r(dx) : "auto",
    "--dy": r(dy),
    "--dw": r(dw),
    "--dh": r(dh),
    "--px": f.pAnchor === "left" ? `${px}px` : "auto",
    "--pr": f.pAnchor === "right" ? `${px}px` : "auto",
    "--py": `${py}px`,
    "--pw": `${pw}px`,
    "--ph": `${ph}px`,
  } as CSSProperties;
}

/**
 * Everything in the hero field that is not the baked background: the two
 * angular shapes and the seven floating icons. Decorative, inert, and behind
 * the content.
 *
 * The shapes are pinned to the window's edges rather than to the centred
 * composition: the frame clips them with its own left and right edge, so on a
 * window wider than 1920 a centred copy would show that cut hanging in space.
 * They are desktop artwork — the phone frame has none.
 */
export function CaseStudiesFieldArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Img
        src="case-studies/shapes-left.webp"
        alt=""
        priority="gate"
        // Desktop-only artwork: a phone must not fetch it. See Img's skipOn.
        skipOn="(max-width: 767px)"
        className="absolute left-0 top-0 hidden h-[59.625rem] w-[24rem] max-w-none md:block"
      />
      <Img
        src="case-studies/shapes-right.webp"
        alt=""
        priority="gate"
        skipOn="(max-width: 767px)"
        className="absolute right-0 top-0 hidden h-[63rem] w-[20rem] max-w-none md:block"
      />
      {FLOATERS.map((f) => (
        <Img
          key={f.name}
          src={`case-studies/fl-${f.name}.webp`}
          alternate={{ src: `case-studies/fl-${f.name}-phone.webp`, media: "(max-width: 767px)" }}
          alt=""
          priority={f.eager ? "gate" : false}
          className="cs-floater"
          style={floaterStyle(f)}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- hero --- */

/**
 * The "Read full story" pill. Grey on rest; on hover it inverts its own two
 * colours like every button on the site (CLAUDE.md) — white fill, grey label
 * — with a flat gradient on both states so the fill cross-fades. The disc
 * keeps its #181818: it is the pill's ornament, not its fill.
 *
 * It is rendered only for a card that has somewhere to go. No card does yet,
 * so today none is drawn — a pill that does nothing reads as broken, and a
 * greyed-out one promises a page that is not there.
 */
function StoryButton({ href, brand }: { href: string; brand: string }) {
  const className =
    "group relative flex h-[44px] w-[197px] cursor-pointer items-center rounded-[22.5px] bg-[linear-gradient(#363636,#363636)] pl-[18px] text-[18px] font-medium leading-none text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(#fff,#fff)] hover:text-[#363636] active:bg-[linear-gradient(#fff,#fff)] active:text-[#363636] md:h-[2.75rem] md:w-[13.0625rem] md:rounded-[1.40625rem] md:pl-[0.9375rem] md:text-[1.25rem]";
  // The file's chevron: 8 x 14 drawn in an 11 x 17 box, stroke 3.
  const chevron =
    "col-start-1 row-start-1 h-[17px] w-[11px] transition-transform duration-300 ease-out md:h-[1.0625rem] md:w-[0.6875rem]";
  const glyph = (extra: string) => (
    <svg
      viewBox="0 0 11 17"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${chevron} ${extra}`}
    >
      <path d="M1.5 1.5L9.5 8.5L1.5 15.5" />
    </svg>
  );
  const inner = (
    <>
      {CASE_STUDIES_PAGE.storyCta}
      <span className="sr-only"> — {brand}</span>
      {/* THE SAME RELAY AS ArrowDisc (Sections.tsx), along this arrow's own
          axis: on hover the chevron leaves to the right and a second one
          arrives from the left, held back 75ms so the two read as a relay.
          `overflow-hidden` is what makes them appear and vanish at the
          disc's edge.

          The 2px of left padding seats the chevron 1px right of the disc's
          centre — an arrowhead centred on its box reads as sitting left. */}
      <span className="absolute right-[6px] top-[6px] grid size-[32px] place-items-center overflow-hidden rounded-full bg-[#181818] pl-[2px] text-white md:right-[0.4375rem] md:top-[0.375rem] md:size-[2rem] md:pl-[0.125rem]">
        {glyph("group-hover:translate-x-[250%] group-active:translate-x-[250%]")}
        {glyph("-translate-x-[250%] delay-75 group-hover:translate-x-0 group-active:translate-x-0")}
      </span>
    </>
  );
  return (
    <a href={href} className={className}>
      {inner}
    </a>
  );
}

/**
 * A sentence with two sets of authored line breaks — the phone's and the
 * desktop's — over ONE copy of the words, so nothing is in the DOM twice.
 * `lines` is words per line for each. Each break is a <br> that exists at one
 * breakpoint only (or at both, where the two agree); the space after it keeps
 * the words apart wherever that <br> is display:none, and costs nothing at
 * the head of a line where it is not.
 */
export function Broken({
  text,
  lines,
}: {
  text: string;
  lines: { desktop: readonly number[]; phone: readonly number[] };
}) {
  const ends = (counts: readonly number[]) => {
    const at = new Set<number>();
    let n = 0;
    for (const c of counts.slice(0, -1)) at.add((n += c));
    return at;
  };
  const d = ends(lines.desktop);
  const p = ends(lines.phone);
  return text.split(" ").map((word, i) => {
    const n = i + 1;
    const br =
      d.has(n) && p.has(n) ? "" : d.has(n) ? "hidden md:block" : p.has(n) ? "md:hidden" : null;
    return (
      <span key={i}>
        {word}
        {br === null ? null : <br className={br || undefined} />}{" "}
      </span>
    );
  });
}

export function CaseStudiesHero() {
  const { heading, body, cards } = CASE_STUDIES_PAGE;
  return (
    <section
      aria-labelledby="cs-heading"
      // Phone: 35 under the header's flow box puts the heading's line 43 below
      // the bar, the frame's own gap; desktop's 90.5 is the frame's 68.5.
      className="relative px-[var(--gutter)] pb-[25px] pt-[35px] md:px-0 md:pb-[4.5rem] md:pt-[5.65625rem]"
    >
      <h1
        id="cs-heading"
        className="text-center text-[30px] font-semibold leading-[30px] text-white md:text-[5rem] md:leading-[5rem]"
      >
        {heading}
      </h1>

      <ul
        role="list"
        className="mt-[21px] flex flex-col gap-[15px] md:mx-auto md:mt-[2.40625rem] md:w-[62.75rem] md:gap-[1.25rem]"
      >
        {cards.map((card, i) => {
          const [dl, dt, dw, dh] = card.art.desktop;
          const [pr, pt, pw, ph] = card.art.phone;
          return (
            <li
              key={card.brand}
              // PHONE: one #181818 plate, text left, artwork right. DESKTOP:
              // two plates — the 287 tile and the 697 text plate, 20 apart.
              className="relative h-[299px] rounded-[20px] bg-[#181818] md:grid md:h-[21.3125rem] md:grid-cols-[17.9375rem_43.5625rem] md:gap-x-[1.25rem] md:rounded-none md:bg-transparent"
            >
              <div className="pointer-events-none absolute inset-0 z-[2] md:pointer-events-auto md:relative md:inset-auto md:rounded-[1.5625rem] md:bg-[#181818]">
                <Img
                  src={card.image}
                  alternate={{ src: card.imagePhone, media: "(max-width: 767px)" }}
                  alt={`${card.brand} — work by Mushi`}
                  // The first three are on a desktop's first screen; the
                  // fourth is not on anyone's.
                  priority={i < 3 ? "gate" : false}
                  className="cs-art"
                  style={
                    {
                      "--dl": r(dl),
                      "--dt": r(dt),
                      "--dw": r(dw),
                      "--dh": r(dh),
                      "--pr": `${pr}px`,
                      "--pt": `${pt}px`,
                      "--pw": `${pw}px`,
                      "--ph": `${ph}px`,
                    } as CSSProperties
                  }
                />
                {/* The tag — desktop only; the phone frame has none. 13 above
                    the gradient tile's bottom edge, which is 20 above the
                    plate's. */}
                <span
                  // The frame's own chip width, not padding around the text:
                  // the browser sets Poppins Medium about 1% narrower than
                  // Figma does, and a hugging chip came out 2–3px short.
                  style={{ width: r(card.tagW) }}
                  className="absolute bottom-[1.25rem] left-1/2 z-[3] hidden h-[2.875rem] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-[0.625rem] bg-[#181818] text-[1.375rem] font-medium leading-none text-[#9e9e9e] md:flex"
                >
                  {card.tag}
                </span>
              </div>

              <article
                // WITHOUT THE PILL the copy is centred in the plate rather
                // than left sitting high with the pill's room empty under
                // it: logo-to-body is 204 of the phone's 299 and 210.5 of
                // the desktop's 341, so it moves down 27.5 and 33.5. With an
                // href the frame's own positions apply.
                className={`relative flex h-full flex-col items-start pl-[20px] md:rounded-[1.5625rem] md:bg-[#181818] md:pl-[1.875rem] ${
                  card.href ? "pt-[62.5px] md:pt-[5.28125rem]" : "pt-[90px] md:pt-[7.375rem]"
                }`}
                style={
                  {
                    "--csp": card.href ? "0px" : "27.5px",
                    "--csd": card.href ? "0rem" : "2.09375rem",
                    "--lpw": `${card.logo.phone[0]}px`,
                    "--lph": `${card.logo.phone[1]}px`,
                    "--lpt": `${card.logo.phone[2]}px`,
                    "--lpx": `${card.logo.phone[3]}px`,
                    "--ldw": r(card.logo.desktop[0]),
                    "--ldh": r(card.logo.desktop[1]),
                    "--ldt": r(card.logo.desktop[2]),
                    "--ldx": r(card.logo.desktop[3]),
                  } as CSSProperties
                }
              >
                {/* The first three marks are on the first screen, so they are
                    plain eager images and the paint gate waits for them; the
                    fourth is deferred like every other brand mark (LazyImg).
                    Deferring one that is already in view has the gate swap
                    its src in before React hydrates. */}
                {i < 3 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/logos/${card.logo.src}`}
                    alt={card.brand}
                    width={card.logo.w}
                    height={card.logo.h}
                    decoding="async"
                    className="cs-logo"
                  />
                ) : (
                  <LazyImg
                    src={`/logos/${card.logo.src}`}
                    alt={card.brand}
                    width={card.logo.w}
                    height={card.logo.h}
                    className="cs-logo"
                  />
                )}
                <h2 className="whitespace-nowrap text-[20px] font-medium leading-[24px] text-white md:text-[2rem] md:leading-[2.5rem]">
                  <Broken text={card.result} lines={card.lines} />
                </h2>
                <p className="mt-[9.5px] w-[174px] text-[14px] font-normal leading-[20px] text-white/50 md:mt-[0.9375rem] md:w-[35.5rem] md:text-[1.5rem] md:leading-[2rem]">
                  {body}
                </p>
                {/* 23.5, not the frame's 24.5: the body above is seated 1px low so
                    its ink lands on Figma's, and this takes that pixel back so
                    the pill stays on the frame's line. */}
                {card.href ? (
                  <div className="mt-[12px] md:mt-[1.46875rem]">
                    <StoryButton href={card.href} brand={card.brand} />
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------------- rails --- */

export function CaseStudiesRails() {
  const { video, landing, static: statics } = CASE_STUDIES_PAGE.rails;
  return (
    // The three rails, with the frame's own air between them: 136 from the
    // field to the first stage on desktop and 85 between stages; on the phone
    // 57 to the first title and 42–43 between.
    <div
      id={CASE_STUDIES_RAILS_ID}
      className="flex flex-col gap-[42px] pt-[57px] md:gap-[5.3125rem] md:pt-[8.5rem]"
    >
      <CoverflowRail kind="video" title={video.title} headingId="cs-video-heading" items={video.items} />
      <CoverflowRail kind="landing" title={landing.title} headingId="cs-landing-heading" items={landing.items} />
      {/* 43 above this one on the phone where the other gap is 42 — the
          frame's own; the wrapper's gap is 42, this is the odd pixel. */}
      <div className="pt-px md:pt-0">
        <CoverflowRail kind="static" title={statics.title} headingId="cs-static-heading" items={statics.items} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------ ready to scale --- */

/* Gutter to gutter on a phone, like the case cards above — 345 x 309 at the
   artboard's 375 and the same shape on a wider phone.

   EVERYTHING ON THE PHONE CARD IS IN --cu (Žilvinas 2026-10-04, "this seems
   out of place in mobile"): the artwork fills the card, so on a 430 phone the
   avatars baked into it sat 16% lower and ran into a status line still at its
   375 position. .cs-scale-card (globals.css) makes --cu "1px at 345 wide", so
   the words keep their place on the picture at every phone width. */
const CARD =
  "cs-scale-card relative aspect-[345/309] w-full md:aspect-auto md:h-[32.8125rem] md:w-[36.5625rem]";
/* Two lines of 24/26 (desktop 50/50). The frame's text box is shorter than
   its own two lines, so the box top it reports is not the first line's: the
   lines start 3 (desktop 7) above it. These are the LINE tops. */
const CARD_TITLE =
  "absolute left-[calc(var(--cu)*25)] text-[length:calc(var(--cu)*24)] font-medium leading-[calc(var(--cu)*26)] text-white md:top-[3.25rem] md:text-[3.125rem] md:leading-[3.125rem]";
/* Fixed width with the label and the disc pushed to the two ends, rather than
   padding + gap: the frame fixes the pill, the label's left edge and the
   disc's inset, and the space between them is whatever is left. */
const CARD_BUTTON =
  "group absolute left-[calc(var(--cu)*25)] flex h-[calc(var(--cu)*42)] items-center justify-between rounded-[calc(var(--cu)*30)] pl-[calc(var(--cu)*13)] pr-[calc(var(--cu)*5)] text-[length:calc(var(--cu)*18)] font-semibold uppercase leading-none transition-all duration-300 ease-out md:top-[11.25rem] md:h-[3.5625rem] md:rounded-[1.875rem] md:pl-[1.375rem] md:pr-[0.375rem] md:text-[1.5rem]";
/** The file's arrow: 15 drawn in an 18 box, stroke 3 — see ArrowDisc on the viewBox. */
const CARD_DISC = "size-[calc(var(--cu)*32)] md:size-[2.8125rem]";
const CARD_ARROW = "size-[calc(var(--cu)*15.2)] md:size-[1.1875rem]";

export function ReadyToScale() {
  const { heading, templates, agency } = CASE_STUDIES_PAGE.scale;
  return (
    <section
      aria-labelledby="cs-scale-heading"
      // 60 / 111.5 above the heading's line, 63 / 169 under the cards to the
      // footer's plate — the frames' own.
      className="px-[var(--gutter)] pb-[63px] pt-[60px] md:px-0 md:pb-[10.5625rem] md:pt-[6.96875rem]"
    >
      <h2
        id="cs-scale-heading"
        className="text-center text-[30px] font-semibold leading-[30px] text-white md:text-[5rem] md:leading-[5rem]"
      >
        {heading}
      </h2>

      <div className="cs-scale-pair mt-[21px] flex flex-col items-center gap-[15px] md:mt-[2.40625rem] md:flex-row md:justify-center md:gap-[1.625rem]">
        {/* 500+ templates → the Pick-your-plan sheet, in place (Žilvinas
            2026-10-04: "buy now should lead to the same popup as in
            templates"). data-plan is what PlanSheet listens for — the page
            mounts it. The href is where a modified click or a browser
            without JavaScript goes: /templates#buy, which opens the same
            sheet on arrival. It went to the webapp before. */}
        <article className={CARD}>
          <Img
            src="case-studies/scale-templates.webp"
            alternate={{ src: "case-studies/scale-templates-phone.webp", media: "(max-width: 767px)" }}
            alt=""
            className="absolute inset-0 size-full"
          />
          <h3 className={`${CARD_TITLE} top-[calc(var(--cu)*32)] md:left-[2.75rem]`}>
            {templates.titleLines[0]}
            <br />
            {templates.titleLines[1]}
          </h3>
          <a
            href="/templates#buy"
            data-plan
            // white fill / black label  ->  black fill / white label
            className={`${CARD_BUTTON} top-[calc(var(--cu)*106)] w-[calc(var(--cu)*147)] md:left-[2.75rem] bg-[linear-gradient(#fff,#fff)] text-black hover:bg-[linear-gradient(#000,#000)] hover:text-white active:bg-[linear-gradient(#000,#000)] active:text-white md:w-[12.75rem]`}
          >
            {templates.cta}
            <ArrowDisc
              disc={CARD_DISC}
              arrow={CARD_ARROW}
              viewBox="-1 -1 19 19"
              strokeWidth={3}
              tone="invert"
            />
          </a>
          <ul
            role="list"
            className="absolute left-[calc(var(--cu)*25)] top-[calc(var(--cu)*213)] flex flex-col gap-[calc(var(--cu)*9.5)] md:left-[2.75rem] md:top-[23.5rem] md:gap-[0.9375rem]"
          >
            {templates.items.map((item) => (
              <li
                key={item.label}
                className="flex h-[calc(var(--cu)*16)] items-center gap-[calc(var(--cu)*8)] text-[length:calc(var(--cu)*16)] font-normal leading-none text-white md:h-[1.5625rem] md:gap-[var(--gap)] md:text-[1.25rem]"
                style={{ "--w": r(item.w), "--gap": r(item.gap) } as CSSProperties}
              >
                {/* The svg is drawn to the outside of its stroke, a twentieth
                    wider than the box Figma reports for it — hence the
                    negative margin: the BOX is what the layout uses. */}
                <span className="grid h-[calc(var(--cu)*16)] w-[calc(var(--cu)*16)] shrink-0 place-items-center md:h-[1.5625rem] md:w-[var(--w)]">
                  <LazyImg
                    src={`/images/case-studies/${item.icon}.svg`}
                    alt=""
                    width={28}
                    height={28}
                    ariaHidden
                    className="h-[110%] w-[110%] max-w-none"
                  />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </article>

        {/* Done-for-you → the call. */}
        <article className={CARD}>
          <Img
            src="case-studies/scale-agency.webp"
            alternate={{ src: "case-studies/scale-agency-phone.webp", media: "(max-width: 767px)" }}
            alt=""
            className="absolute inset-0 size-full"
          />
          {/* The phone frame sets this card's title and pill 6.5 and 8 higher
              than the first card's. Desktop sets them level, but starts this
              card's text 43 in where the first card's starts 44. */}
          <h3 className={`${CARD_TITLE} top-[calc(var(--cu)*25.5)] md:left-[2.6875rem]`}>
            {agency.titleLines[0]}
            <br />
            {agency.titleLines[1]}
          </h3>
          <a
            href={BOOKING_URL}
            // Watched by the phone header: this pill arriving is what puts
            // its Schedule a Call button away. See CASE_STUDIES_CALL_ID.
            id={CASE_STUDIES_CALL_ID}
            // An arrow pill, so it swaps with its disc instead of going white
            // (CLAUDE.md, the second exception) — the disc here is the file's
            // black rather than #222222.
            className={`${CARD_BUTTON} top-[calc(var(--cu)*98)] w-[calc(var(--cu)*178)] md:left-[2.6875rem] bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] text-white hover:bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] active:bg-[linear-gradient(117.51deg,#000_10.47%,#000_45.54%,#000_98.13%)] md:w-[15.375rem]`}
          >
            {agency.cta}
            <ArrowDisc
              disc={CARD_DISC}
              arrow={CARD_ARROW}
              viewBox="-1 -1 19 19"
              strokeWidth={3}
              tone="black"
            />
          </a>
          <p className="absolute left-[calc(var(--cu)*25)] top-[calc(var(--cu)*269)] flex h-[calc(var(--cu)*10)] items-center gap-[calc(var(--cu)*8)] whitespace-nowrap text-[length:calc(var(--cu)*16)] font-normal leading-none text-white md:left-[2.6875rem] md:top-[28.8125rem] md:h-[0.9375rem] md:gap-[0.5625rem] md:text-[1.25rem]">
            <span className="size-[calc(var(--cu)*10)] shrink-0 rounded-full bg-[#248a2d] md:size-[0.9375rem]" />
            {agency.status}
          </p>
        </article>
      </div>
    </section>
  );
}
