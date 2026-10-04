import { Img } from "./Img";
import { CaseGallery } from "./CaseGallery";
import { Broken } from "./CaseStudySections";
import { ArrowDisc } from "./Sections";
import { CASE_STUDY_CALL, CASE_STUDY_DETAILS, type CaseStudySlug } from "@/lib/content";
import { BOOKING_URL, CASE_STUDY_CALL_ID, CASE_STUDY_HERO_CTA_ID } from "@/lib/site";

/**
 * /case-studies/<slug>, section by section. design/CASE-STUDIES.md ("Detail
 * page") is the spec and holds every number below with its Figma node.
 *
 * The same two rules as CaseStudySections: desktop lengths are the frame's px
 * over 16, in rem; phone lengths are the 375 artboard's px. And the page is
 * the frame minus its top 38px on desktop and plus 11 on the phone, because
 * the header is the shared one — its bar ends at 102 and 84 where this
 * frame's ends at 140 and 73.
 */

/**
 * "Book a Call", the rectangular one (radius 15 / 10, no disc). Not an arrow
 * pill, so it inverts like every plain button: violet with a white label to
 * white with a violet label, three stops on both states so it cross-fades
 * (CLAUDE.md). The stops and angle are the file's.
 */
const BOOK =
  "flex items-center justify-center bg-[linear-gradient(149.68deg,#a08ade_8.06%,#7c54b5_42.01%,#6e54b5_93.22%)] font-semibold uppercase leading-none text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(149.68deg,#fff_8.06%,#fff_42.01%,#fff_93.22%)] hover:text-[#6e54b5]";

/**
 * The play mark over the hero still: the file's own three layers — a 50%
 * violet disc that blurs what is behind it, a lit inner disc, the triangle —
 * as one drawing in its 63-unit box, 63 on the phone and 91 on desktop.
 *
 * It is a MARK, not a control: the file has no film for it to play. When one
 * is supplied this becomes the button that starts it.
 */
function PlayMark() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 size-[63px] -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-[5px] md:size-[5.6875rem]"
    >
      <svg viewBox="0 0 63 63" fill="none" className="size-full">
        <circle cx="31.5" cy="31.5" r="31.5" fill="#7054B4" fillOpacity="0.5" />
        <ellipse cx="31.5" cy="31.8462" rx="25.9615" ry="26.3077" fill="url(#csd-play)" fillOpacity="0.9" />
        <path
          d="M23.5385 21.7469C23.5385 20.3479 23.5385 19.6483 23.8348 19.2627C24.0928 18.9268 24.4873 18.7189 24.9143 18.6938C25.4044 18.665 25.9954 19.053 27.1776 19.8291L42.5609 29.9283C43.5376 30.5695 44.026 30.8902 44.1962 31.2943C44.345 31.6476 44.345 32.0447 44.1962 32.398C44.026 32.8021 43.5376 33.1228 42.5609 33.764L27.1776 43.8632C25.9954 44.6393 25.4044 45.0273 24.9143 44.9985C24.4873 44.9734 24.0928 44.7655 23.8348 44.4296C23.5385 44.044 23.5385 43.3444 23.5385 41.9454V21.7469Z"
          fill="#fff"
        />
        <defs>
          <radialGradient
            id="csd-play"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(31.5 31.8462) rotate(90) scale(26.3077 25.9615)"
          >
            <stop stopColor="#9A81D7" />
            <stop offset="1" stopColor="#6F54B5" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- hero --- */

export function CaseStudyHero({ slug }: { slug: CaseStudySlug }) {
  const study = CASE_STUDY_DETAILS[slug];
  return (
    <section
      aria-labelledby="csd-heading"
      className="csd-fit relative px-[var(--gutter)] pb-[15px] pt-[30px] md:mx-auto md:h-[33.5625rem] md:w-[86.25rem] md:px-0 md:pb-0 md:pt-[11.0625rem]"
    >
      <p className="text-[16px] font-medium leading-[30px] text-[#8b8b8b] md:text-[1.375rem] md:leading-[1.875rem]">
        {study.eyebrow}
      </p>
      <h1
        id="csd-heading"
        className="mt-[6px] whitespace-nowrap text-[30px] font-semibold leading-[32px] text-white md:mt-[1rem] md:text-[3rem] md:leading-[3.4375rem]"
      >
        <Broken text={study.title} lines={study.titleLines} />
      </h1>
      <p className="mt-[11px] whitespace-nowrap text-[16px] font-medium leading-[20px] text-white/50 md:mt-[0.71875rem] md:text-[1.625rem] md:leading-[2rem]">
        <Broken text={study.sub} lines={study.subLines} />
      </p>

      {/* The still. In flow under the copy on the phone; on desktop it is the
          right half of the hero, 700 in from the column's edge. */}
      <div className="relative mt-[21px] aspect-[345/194] w-full overflow-hidden rounded-[15px] md:absolute md:left-[43.75rem] md:top-[6.375rem] md:mt-0 md:aspect-auto md:h-[23.9375rem] md:w-[42.5rem] md:rounded-[1.25rem]">
        <Img
          src={study.thumb}
          alt={study.thumbAlt}
          // The first screen's own picture — the paint gate waits for it.
          priority="gate"
          sizes="(min-width: 768px) 36vw, 92vw"
          className="size-full object-cover"
        />
        <PlayMark />
      </div>

      {/* Phone only — the desktop's Book a Call is the card beside the story. */}
      <a
        href={BOOKING_URL}
        // Watched by the phone header: this leaving is what brings its
        // Schedule a Call out. See CASE_STUDY_HERO_CTA_ID.
        id={CASE_STUDY_HERO_CTA_ID}
        className={`${BOOK} mt-[10px] h-[44px] rounded-[10px] pt-[2px] text-[18px] md:hidden`}
      >
        {CASE_STUDY_CALL.cta}
      </a>
    </section>
  );
}

/* ---------------------------------------------------------------- body --- */

const LABEL =
  "ml-[20px] text-[16px] font-medium uppercase leading-[30px] text-[#8d8d8d] md:ml-[1.875rem] md:text-[1.5rem] md:leading-[1.875rem]";
/**
 * THE COPY'S RIGHT MARGINS ARE A FEW PX WIDER THAN THE FRAME'S, ON PURPOSE.
 *
 * Figma sets Poppins up to 0.7% wider than the browser does (line by line, so
 * it is the two renderers' spacing, not a size), and a handful of lines that
 * just fail to fit in Figma just fit here — which moved a break and, on the
 * phone, dropped a whole line from two blocks. Narrowing the measure by 6–7
 * design px on desktop and 2–3 on the phone puts every one of the article's
 * 62 desktop and 91 phone line breaks where the frame has them; each value
 * sits in the middle of the range that does (lists 4–8 and paragraphs 3.5–12
 * on desktop, 3 and 1.5–2.5 on the phone), checked line by line against
 * Figma's own render of each text block.
 */
const COPY = "text-[16px] font-normal leading-[20px] text-white md:text-[1.5rem] md:leading-[2rem]";

function CallCard() {
  const { cta, spots, emailLabel, email } = CASE_STUDY_CALL;
  return (
    // The card is as wide as its column; what is in it is the frame's fixed
    // 345 (desktop 383) arrangement, centred, so nothing in it has to stretch.
    <div className="rounded-[20px] bg-[#181818] md:rounded-[1.5625rem]">
      <div className="relative mx-auto h-[360px] w-[345px] md:h-[26.5625rem] md:w-[23.9375rem]">
        <Img
          src="case-studies/detail-call.webp"
          alternate={{ src: "case-studies/detail-call-phone.webp", media: "(max-width: 767px)" }}
          alt=""
          className="absolute left-[20px] top-[-4px] h-[278px] w-[306px] max-w-none md:left-[1.75rem] md:top-[0.4375rem] md:h-[19.875rem] md:w-[20.4375rem]"
        />
        <a
          href={BOOKING_URL}
          // The other end of the phone header's contract.
          id={CASE_STUDY_CALL_ID}
          className={`${BOOK} absolute left-[45px] top-[190px] h-[44px] w-[255px] rounded-[10px] pt-[2px] text-[18px] md:left-[3.125rem] md:top-[13.6875rem] md:h-[3.5625rem] md:w-[17.6875rem] md:rounded-[0.9375rem] md:pt-[0.125rem] md:text-[1.625rem]`}
        >
          {cta}
        </a>
        {/* THE CARD'S TEXT SITS 1PX LOWER THAN ITS BOXES SAY, on desktop: the
            browser seats Poppins a pixel higher in its line than Figma does
            at these sizes, measured off Figma's render of this card. The
            button's 2px of top padding, and the 1px on the tops below, are
            that pixel — on the phone, the button and the spots line only. */}
        {/* Placed, not centred: dot at 79 and text at 98 on desktop (which is
            centred in Figma's metrics, and 2px off it in the browser's). The
            phone frame has no dot and starts the text 90 in. */}
        <p className="absolute left-[90px] top-[244px] flex h-[16px] items-center whitespace-nowrap text-[16px] font-medium leading-none text-white md:left-[4.9375rem] md:top-[18.09375rem] md:gap-[0.4375rem] md:text-[1.125rem]">
          <span className="hidden size-[0.75rem] place-items-center rounded-full bg-[#32b150]/50 md:grid">
            <span className="size-[0.5rem] rounded-full bg-[#32b150]" />
          </span>
          <span>
            {spots[0]} <span className="text-white/50">{spots[1]}</span>
          </span>
        </p>
        <a
          href={`mailto:${email}`}
          className="group absolute inset-x-0 top-[292px] block h-[52px] md:top-[21.4375rem] md:h-[3.875rem]"
        >
          <span className="absolute left-[73px] top-[6px] text-[18px] font-semibold leading-none text-white md:left-[1.875rem] md:top-[0.46875rem] md:text-[1.25rem]">
            {emailLabel}
          </span>
          <span className="absolute left-[72.5px] top-[29px] text-[16px] font-normal leading-none text-[#808080] md:left-[1.875rem] md:top-[2.21875rem] md:text-[1.125rem] md:tracking-[-0.03375rem]">
            {email}
          </span>
          {/* The same relay as every arrow disc on the site. The file's arrow
              is 15 (phone 13) at stroke 2, so the box is 18/15 of that. */}
          <span className="absolute left-[286px] top-[7px] md:left-[19.375rem] md:top-[0.5625rem]">
            <ArrowDisc
              disc="size-[39px] md:size-[2.6875rem]"
              arrow="size-[15.6px] md:size-[1.125rem]"
              viewBox="-0.5 -0.5 18 18"
              strokeWidth={2}
              tone="mail"
            />
          </span>
        </a>
      </div>
    </div>
  );
}

export function CaseStudyBody({ slug }: { slug: CaseStudySlug }) {
  const study = CASE_STUDY_DETAILS[slug];
  return (
    <div className="bg-[#080808] px-[var(--gutter)] pb-[60px] pt-[15px] md:px-0 md:pb-[7rem] md:pt-[3.4375rem]">
      <div className="csd-fit md:mx-auto md:grid md:w-[86.25rem] md:grid-cols-[23.9375rem_61.0625rem] md:items-start md:gap-x-[1.25rem]">
        {/* The story first in the document; the grid puts the call card to
            its left on desktop. */}
        <article className="overflow-hidden rounded-[20px] bg-[#181818] pb-[18.5px] pt-[11px] md:col-start-2 md:row-start-1 md:rounded-[1.5625rem] md:pb-[1.875rem] md:pt-[1.78125rem]">
          {study.sections.map((section, i) => (
            <section key={section.label} className={i ? "mt-[17px] md:mt-[2.25rem]" : undefined}>
              <h2 className={LABEL}>{section.label}</h2>
{"paragraphs" in section ? (
                <div className={`${COPY} ml-[20px] mr-[22px] mt-[7px] md:ml-[2.0625rem] md:mr-[2.3125rem] md:mt-[1.3125rem]`}>
                  {section.paragraphs.map((p, j) => (
                    // The frame separates paragraphs with one empty line.
                    <p key={j} className={j ? "mt-[20px] md:mt-[2rem]" : undefined}>
                      {p}
                    </p>
                  ))}
                </div>
              ) : (
                <ul className={`${COPY} ml-[11px] mr-[18px] mt-[7px] list-disc md:ml-[0.9375rem] md:mr-[2.25rem] md:mt-[1.3125rem]`}>
                  {section.items.map((item) => (
                    <li key={item} className="ms-[24px] md:ms-[2.25rem]">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <CaseGallery items={study.gallery} />
        </article>

        <aside className="mt-[32px] md:sticky md:top-[7.625rem] md:col-start-1 md:row-start-1 md:mt-0">
          <CallCard />
        </aside>
      </div>
    </div>
  );
}
