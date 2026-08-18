import { FOOTER } from "@/lib/content";
import { SHELL } from "@/lib/layout";
import {
  BOOKING_URL,
  CONTACT_EMAIL,
  NEWSLETTER_ACTION,
  SITE_NAME,
  SOCIALS,
} from "@/lib/site";

/**
 * The four brand marks, each a single 24-unit path drawn in `currentColor` so
 * the tile's hover inversion carries them without a second asset. Inlined
 * rather than shipped as files: four <img> requests for four 25px glyphs is
 * four more round trips than the markup costs.
 *
 * Keyed by the SOCIALS label, so the row's ORDER lives in site.ts (the design's
 * left-to-right: Instagram, LinkedIn, TikTok, Facebook) and only the artwork
 * lives here.
 */
const SOCIAL_MARKS: Record<string, string> = {
  Instagram:
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4 2.209 0 4 1.79 4 4 0 2.209-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  LinkedIn:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  TikTok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  Facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
};

/**
 * The Trustpilot star — `star-x2.svg`'s star path, WITHOUT that asset's #6E54B5
 * backing square. The rating block in the testimonials is violet tiles with the
 * star knocked out white; the footer draws the same geometry the other way
 * round, a violet star on the page's black. Same path, so the two can never
 * drift into being different stars.
 */
function TrustStar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 35 35"
      className="size-[1.4165rem] shrink-0 md:size-[1.3125rem]"
    >
      <path
        d="M17.5 24.0645L22.9315 22.6101L25.2009 30L17.5 24.0645ZM30 14.5126H20.439L17.5 5L14.561 14.5126H5L12.7381 20.4088L9.7991 29.9214L17.5372 24.0252L22.2991 20.4088L30 14.5126Z"
        fill="#6E54B5"
      />
    </svg>
  );
}

/* One class list, two elements: the capture's control is a submit button once
   an email provider exists and a link to the booking anchor until then, and
   the design does not distinguish them. 138 x 52, radius 8, label 24 Medium.

   It inverts on hover like every other button on the site (CLAUDE.md), keeping
   a gradient on both states so the fill cross-fades instead of snapping — the
   hover repeats the rest state's three stop positions in white. */
const REDEEM =
  "inline-flex h-11 w-full shrink-0 items-center justify-center rounded-[0.625rem] bg-[linear-gradient(90deg,#6e54b5_0%,#6e54b5_100%)] text-[1rem] font-medium text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(90deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] md:h-[3.25rem] md:w-[8.625rem] md:rounded-[0.5rem] md:bg-[linear-gradient(117.51deg,#a08ade_10.47%,#7c54b5_45.54%,#6e54b5_98.13%)] md:text-[1.5rem] md:hover:bg-[linear-gradient(117.51deg,#fff_10.47%,#fff_45.54%,#fff_98.13%)]";
// Phone: the artboard fills it FLAT #6E54B5 at 293 x 44 / radius 10, so the
// rest state is that one colour written as a two-stop gradient — a gradient on
// both states is what lets the hover inversion cross-fade (CLAUDE.md). Desktop
// keeps the site-wide three-stop violet.

/** Column links and the legal row share their resting colour and hover. */
/* Phone links are #808080 (= --text-muted) and desktop's are #9E9E9E. */
const LINK =
  "text-muted transition-colors duration-200 hover:text-white md:text-dim";

export function SiteFooter() {
  return (
    /*
      DESKTOP GEOMETRY, measured off the reference screenshot (Žilvinas
      2026-08-19) and converted to design px against the 1920 frame — the shot
      is 1366 wide, so 1366/1920 = 0.7115 is the scale, confirmed by its content
      starting at 191 (= the design's 270 side margin) and the column measuring
      973 (= 1380, i.e. SHELL).

      Every number below is therefore a 1920 number in rem, per the scale note
      in globals.css: 1rem is 16 design px on desktop.

        69 to the first baseline row · 56 to the bottom edge
        divider 64 under the columns, bottom bar 56 under the divider

      Type was solved rather than eyeballed: each string's measured width was
      divided by its own advance width in the real Poppins at 100px. Five
      strings in the bottom bar agree on 18, four column links agree on 21, and
      the three column titles land at 25.1-26.1. That agreement is what makes
      these sizes trustworthy rather than a reading off a screenshot.
    */
    <footer className="bg-bg">
      <div
        className={`${SHELL} pb-[3.25rem] pt-12 md:pb-[3.5rem] md:pt-[4.3125rem]`}
      >
        {/*
          Four columns, and their widths ARE their measured x positions: the
          gift block starts on the column's left edge, PRODUCTS 592 in, COMPANY
          904, CONTACT 1112, and the last one runs to the column's right edge —
          so the four measure 592 / 312 / 208 / 268, which is the design's own
          tab stops rather than a gap-based approximation of them.

          They are `fr`, not rem. As fixed rem the first three come to 1112 and
          the last takes what is left, which is 1380 only while the shell is a
          full 1380 — below the ~1260 crossover the shell is capped by the
          window instead (globals.css), the remainder falls under the social
          row's 240 and the fourth tile hangs off the side of the page. In `fr`
          the four keep their ratio at any shell width and nothing overflows.

          Below md it is the PHONE ARTBOARD, one-to-one: Figma
          `cHPZeWJ00RoH44yy1AkW9P`, node `4167:278` ("Footer phone"), 375 x 977
          on #121212. One centred 293 column with a 41 gutter, and every gap
          below is derived from that frame — see design/SECTIONS.md, which
          holds the measurements so they never have to cost another MCP call.

          The frame positions its type absolutely, so its numbers are
          CENTRE-to-CENTRE. They are rebuilt here with `leading-none`, which
          makes a text box exactly its own font-size tall, so a gap is
          `centre_distance - (size_a + size_b) / 2`. That is where the odd
          values come from: they are derived, not eyeballed.
        */}
        <div className="mx-auto grid w-full max-w-[18.3125rem] gap-[2.84375rem] text-center md:mx-0 md:max-w-none md:grid-cols-[592fr_312fr_208fr_268fr] md:gap-0 md:text-left">
          <div>
            <h2 className="text-[1.375rem] font-medium leading-none md:text-[1.5rem] md:font-semibold md:leading-[1.5rem]">
              {FOOTER.giftHeading}
            </h2>

            {/*
              The capture. 285 x 52 input, 16, then the 138 x 52 button — 439
              across, which is what the reference measures from the column's
              left edge to the button's right.

              With no provider chosen (site.ts) there is nowhere to post, so the
              form carries no action and the control is a LINK to the booking
              anchor. It looks identical; it just cannot swallow an address. Set
              NEWSLETTER_ACTION and the same markup becomes a real POST.
            */}
            <form
              action={NEWSLETTER_ACTION ?? undefined}
              method={NEWSLETTER_ACTION ? "post" : undefined}
              target={NEWSLETTER_ACTION ? "_blank" : undefined}
              className="mt-4 flex flex-col items-stretch gap-[0.625rem] md:mt-8 md:flex-row md:items-center md:gap-4"
            >
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={FOOTER.emailPlaceholder}
                /* Transparent on the page's black with a single hairline
                   edge — the reference shows no fill inside the box, only its
                   outline. min-w-0 so the phone's flex row can shrink it. */
                className="h-11 w-full min-w-0 rounded-[0.625rem] border border-transparent bg-[#222222] px-[0.9375rem] text-[1rem] text-white outline-none transition-colors duration-200 placeholder:text-white/50 focus:border-white/45 md:h-[3.25rem] md:w-[17.8125rem] md:flex-none md:rounded-[0.5rem] md:border-white/20 md:bg-transparent md:px-[1.375rem] md:text-[1.25rem] md:placeholder:text-muted"
              />
              {NEWSLETTER_ACTION ? (
                <button type="submit" className={REDEEM}>
                  {FOOTER.emailCta}
                </button>
              ) : (
                <a href={BOOKING_URL} className={REDEEM}>
                  {FOOTER.emailCta}
                </a>
              )}
            </form>

            {/* 28 under the input. The star is 21, then 8, then "Trustpilot" at
                20 Regular, then 14 to the score at 21 SemiBold. */}
            {/* leading-none so the row is exactly as tall as the star, 21.
                Left to the score's own 1.5 line-height it stands 31.5 tall,
                which is what pushed the rule 10 below its measured 291. */}
            <p className="mt-[1.125rem] flex items-center justify-center gap-2.5 leading-none md:mt-7 md:justify-start md:gap-[0.5rem]">
              <TrustStar />
              <span className="text-[1rem] md:text-[1.25rem]">
                {FOOTER.trustpilot.label}
              </span>
              <span className="ml-[0.3125rem] text-[1.375rem] font-semibold md:ml-[0.375rem] md:text-[1.3125rem]">
                {FOOTER.trustpilot.score}
              </span>
            </p>
          </div>

          {/* PRODUCTS and COMPANY. Titles 25 SemiBold uppercase, 32 to the
              first link, then a 48 row pitch (21 on 27 leading). */}
          {FOOTER.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[1.125rem] font-medium uppercase leading-none md:text-[1.5625rem] md:font-semibold md:leading-[1.5625rem]">
                {col.title}
              </h2>
              <ul className="mt-[1.59375rem] space-y-[1.3125rem] leading-none md:mt-8">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={`${LINK} text-[1rem] leading-none md:text-[1.3125rem] md:leading-[1.6875rem]`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Phone only: the artboard makes the legal links a LEGAL group in
              the column stack, between COMPANY and CONTACT. Desktop keeps them
              in the bottom bar (see below) — same array, two placements. */}
          <nav aria-label="Legal" className="md:hidden">
            <h2 className="text-[1.125rem] font-medium uppercase leading-none">
              Legal
            </h2>
            <ul className="mt-[1.59375rem] space-y-[1.3125rem] leading-none">
              {FOOTER.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`${LINK} text-[1rem] leading-none`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CONTACT — the address on the same row as the other columns' first
              link, then the social row 32 under it. */}
          <div>
            <h2 className="text-[1.125rem] font-medium uppercase leading-none md:text-[1.5625rem] md:font-semibold md:leading-[1.5625rem]">
              {FOOTER.contactTitle}
            </h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`${LINK} mt-[1.53125rem] block text-[1.125rem] leading-none md:mt-8 md:text-[1.3125rem] md:leading-[1.6875rem]`}
            >
              {CONTACT_EMAIL}
            </a>

            {/* 42 tiles on #222222, radius 12, 24 apart, each holding a 25
                glyph. They invert on hover like the site's buttons: the tile
                goes white and the mark takes the tile's own #222222, so the
                glyph never disappears into the fill. */}
            <ul className="mt-[3.25rem] flex items-center justify-center gap-5 md:mt-8 md:justify-start md:gap-6">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`${SITE_NAME} on ${s.label}`}
                    className="flex size-[2.625rem] items-center justify-center rounded-[0.75rem] bg-[#222222] text-white transition-colors duration-300 ease-out hover:bg-white hover:text-[#222222]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="size-[1.5625rem]"
                    >
                      <path d={SOCIAL_MARKS[s.label]} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The rule runs the full content column. A hairline stays in physical
            px — it is the one kind of length the page's rem scale must not
            touch (globals.css). */}
        {/* No rule on the phone: the artboard runs the copyright straight
            under the social row, 23 below it, with nothing drawn between. */}
        <div className="mt-[1.4375rem] border-t-0 pt-0 md:mt-16 md:border-t md:border-white/20 md:pt-[3.5rem]">
          <div className="flex flex-col gap-5 text-center text-[0.875rem] md:flex-row md:items-center md:justify-between md:gap-8 md:text-left md:text-[1.125rem]">
            <p className="leading-none text-white/50 md:leading-normal md:text-muted">
              {FOOTER.copyright}
            </p>
            {/* Right-aligned cluster with a 45 gap. At 18 the four labels plus
                three gaps come to 768, which puts the cluster's left edge
                within 20 of the PRODUCTS column — the reference has them
                flush, and that agreement is the check on the gap. */}
            {/* Desktop only. On the phone the same links are a LEGAL group up
                with the other columns, which is where the artboard puts them —
                rendered as a second node rather than reordered with CSS
                because the two sit in different containers. The hidden one is
                display:none, so only ever one is in the a11y tree. */}
            <nav aria-label="Legal" className="hidden md:block">
              <ul className="flex flex-wrap gap-x-6 gap-y-3 md:gap-x-[2.8125rem]">
                {FOOTER.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={LINK}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
