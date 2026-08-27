import { FOOTER } from "@/lib/content";
import {
  BOOKING_URL,
  CONTACT_EMAIL,
  NEWSLETTER_ACTION,
  SITE_NAME,
  SOCIALS,
} from "@/lib/site";

/**
 * The social row's artwork, EXPORTED — Figma node `4134:653`, one 246 x 46
 * group holding four 46 x 46 tiles at x 0 / 67 / 133 / 200. Its paths are
 * copied verbatim; nothing here is drawn by hand, because hand-drawn brand
 * marks are wrong in ways that only show at size.
 *
 * The group is split into four so each tile can be its own link with its own
 * hover, and the split costs no coordinate maths: every mark keeps the group's
 * ORIGINAL coordinates and gets a viewBox windowed onto its own tile
 * ("133 0 46 46" and so on). The tile itself is a CSS box, not the export's
 * rect, so the inversion is a background change rather than a second asset.
 *
 * Facebook is the one mark with a knockout: a white disc with the "f" cut out
 * of it in the TILE's colour, which is why that part reads `--tile` rather
 * than `currentColor`. Both swap on hover, so the letter stays legible either
 * way round.
 */
type Mark = {
  view: string;
  /** Height as a share of the TILE, so the glyph keeps its own aspect ratio at
      whatever size the tile is. Width follows from the viewBox. */
  h: string;
  parts: ({ d: string; knockout?: boolean } | { circle: [number, number, number] })[];
};

const SOCIAL_MARKS: Record<string, Mark> = {
  Instagram: {
    view: "0 0 28 28",
    h: "h-[66.667%]",
    parts: [
      { d: "M20.693 0H6.90702C3.09841 0 0 3.23603 0 7.21383V20.3862C0 24.364 3.09841 27.6 6.90702 27.6H20.693C24.5016 27.6 27.6 24.364 27.6 20.3862V7.21383C27.6 3.23603 24.5016 0 20.693 0ZM2.43658 7.21383C2.43658 4.63967 4.44235 2.54479 6.90702 2.54479H20.693C23.1577 2.54479 25.1634 4.63967 25.1634 7.21383V20.3862C25.1634 22.9603 23.1577 25.0552 20.693 25.0552H6.90702C4.44235 25.0552 2.43658 22.9603 2.43658 20.3862V7.21383Z" },
      { d: "M13.8026 20.509C17.3443 20.509 20.2273 17.4996 20.2273 13.7989C20.2273 10.0983 17.3459 7.08887 13.8026 7.08887C10.2594 7.08887 7.37793 10.0983 7.37793 13.7989C7.37793 17.4996 10.2594 20.509 13.8026 20.509ZM13.8026 9.63529C16.002 9.63529 17.7908 11.5036 17.7908 13.8006C17.7908 16.0976 16.002 17.9659 13.8026 17.9659C11.6033 17.9659 9.81451 16.0976 9.81451 13.8006C9.81451 11.5036 11.6033 9.63529 13.8026 9.63529Z" },
      { d: "M20.8213 8.17251C21.775 8.17251 22.5523 7.3623 22.5523 6.3646C22.5523 5.36689 21.7765 4.55664 20.8213 4.55664C19.866 4.55664 19.0902 5.36689 19.0902 6.3646C19.0902 7.3623 19.866 8.17251 20.8213 8.17251Z" },
    ],
  },
  LinkedIn: {
    view: "0 0 24 23",
    h: "h-[54.762%]",
    parts: [
      { d: "M5.40001 23H0.299995V7.61875H5.40001V23ZM2.85 5.4625C1.2 5.4625 0 4.3125 0 2.73125C0 1.15 1.35 0 2.85 0C4.5 0 5.7 1.15 5.7 2.73125C5.7 4.3125 4.5 5.4625 2.85 5.4625ZM24 23H18.9V14.6625C18.9 12.2188 17.85 11.5 16.35 11.5C14.85 11.5 13.35 12.65 13.35 14.8062V23H8.25V7.61875H13.05V9.775C13.5 8.76875 15.3 7.1875 17.85 7.1875C20.7 7.1875 23.7 8.76875 23.7 13.5125V23H24Z" },
    ],
  },
  TikTok: {
    view: "0 0 23 28",
    h: "h-[66.667%]",
    parts: [
      { d: "M23 6.77975V11.6058C22.2003 11.5234 21.1613 11.3318 20.0119 10.8877C18.511 10.3075 17.3939 9.51423 16.6621 8.9V18.6541L16.6435 18.6237C16.6553 18.8171 16.6621 19.0141 16.6621 19.2128C16.6621 24.0568 12.9253 28 8.33107 28C3.73684 28 0 24.0568 0 19.2128C0 14.3689 3.73684 10.4239 8.33107 10.4239C8.78098 10.4239 9.22242 10.4615 9.65366 10.5349V15.2911C9.23939 15.1353 8.79457 15.0512 8.33107 15.0512C6.1562 15.0512 4.3854 16.9171 4.3854 19.2128C4.3854 21.5086 6.1562 23.3745 8.33107 23.3745C10.5059 23.3745 12.2767 21.5068 12.2767 19.2128C12.2767 19.1269 12.275 19.0409 12.2699 18.955V0H16.8421C16.8591 0.408288 16.8744 0.820177 16.8913 1.22847C16.9219 2.03251 17.1935 2.80433 17.6672 3.43646C18.2224 4.17962 19.0424 5.04272 20.1935 5.73215C21.2716 6.37503 22.2835 6.65261 23 6.78334V6.77975Z" },
    ],
  },
  Facebook: {
    view: "0 0 28 28",
    h: "h-[66.667%]",
    parts: [
      { circle: [13.8, 13.8, 13.8] },
      { d: "M15.6798 9.7827V13.0253H19.3191L18.7428 17.3934H15.6798V27.4572C15.0656 27.5511 14.4373 27.6001 13.7996 27.6001C13.0634 27.6001 12.3404 27.5354 11.6364 27.4103V17.3934H8.28003V13.0253H11.6364V9.05783C11.6364 6.59638 13.4466 4.6001 15.6807 4.6001V4.60219C15.6873 4.60219 15.693 4.6001 15.6996 4.6001H19.32V8.3778H16.9544C16.2513 8.3778 15.6807 9.00672 15.6807 9.78166L15.6798 9.7827Z", knockout: true },
    ],
  },
};

/**
 * The Trustpilot star — Figma node `4134:637`, exported at 27.3684 square and
 * filled #6E54B5. It is the same glyph the testimonials rating uses, drawn the
 * other way round: there a white star is knocked out of a violet tile, here the
 * star itself is the violet. The path is the export's, verbatim.
 */
function TrustStar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 23 23"
      className="size-[1.4165rem] shrink-0 md:size-[1.7105rem]"
    >
      <path
        d="M11.3322 17.2834L16.2564 15.9649L18.3137 22.6645L11.3322 17.2834ZM22.6645 8.6239H13.9967L11.3322 0L8.66781 8.6239H0L7.0152 13.9693L4.35077 22.5932L11.366 17.2478L15.683 13.9693L22.6645 8.6239Z"
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
  "inline-flex h-11 w-full shrink-0 items-center justify-center rounded-[0.625rem] bg-[linear-gradient(90deg,#6e54b5_0%,#6e54b5_100%)] text-[1rem] font-medium text-white transition-all duration-300 ease-out hover:bg-[linear-gradient(90deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5] md:h-[3.75rem] md:w-[8.9375rem] md:text-[1.5rem]";
// BOTH frames fill it FLAT #6E54B5 — the phone artboard at 293 x 44, the
// desktop node `4134:621` at 143 x 60, whose export writes that fill as a
// "gradient" carrying the one colour at both stops. So the rest state is that
// colour written as a two-stop gradient: a gradient on both states is what lets
// the hover inversion cross-fade rather than snap (CLAUDE.md). The site-wide
// three-stop violet does NOT belong here — this button is drawn flat.

/**
 * Column links, the address and the legal row. #808080 (= --text-muted) on BOTH
 * frames — an earlier desktop pass read them as #9E9E9E off the screenshot; the
 * Figma nodes say #808080, and the two are indistinguishable in a JPEG.
 */
const LINK =
  "text-muted transition-colors duration-200 hover:text-white";

/**
 * A footer entry renders as a LINK only if it has somewhere to go.
 *
 * Everything in the legal group, plus 500+ Static Templates and Case Studies,
 * is a page that does not exist yet (see content.ts). Those render as plain
 * text with NO hover transition — the hover is the thing that promises
 * something will happen when you click, so removing it is most of the signal —
 * and no pointer, out of the tab order, `aria-disabled` for screen readers.
 * They keep the same muted colour as a resting link rather than dimming
 * further: this footer is already at 60% and a second knock-down would read as
 * broken rather than as pending.
 */
function FooterLink({
  href,
  className = "",
  children,
}: {
  href: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`text-muted cursor-default select-none ${className}`}
      >
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={`${LINK} ${className}`}>
      {children}
    </a>
  );
}

/**
 * One footer link group: the head, then its links.
 *
 * TWO COLUMNS ON THE PHONE, ONE FROM md UP. The 2026-08-28 artboard sets the
 * links in a pair of columns under each head — "500+ Static Templates" beside
 * "Agency Services", "Money-Back Guarantee" beside "Refund Policy" — where the
 * earlier one ran a single centred list.
 *
 * The second column's stop is 213 of the 345 content column, measured off the
 * artboard and the SAME for every group: LEGAL's right column starts exactly
 * where PRODUCT's does, so it is a tab stop rather than the width of whatever
 * happens to sit in the left column. Expressed as `fr` for the reason the
 * desktop columns are — the ratio holds at any column width, and the phone's
 * is the window's below 375.
 *
 * COLUMN-MAJOR, which is what makes the order right without a second array.
 * The artboard reads Money-Back / Terms down the left and Refund / Privacy
 * down the right, and FOOTER.legal is already in that order (it is the phone's
 * own sequence — desktop has its own). Row-major would interleave the two and
 * put Terms opposite Money-Back. `grid-flow-col` with the row count pinned to
 * ceil(n / 2) fills down-then-across for any length: 2 links land side by
 * side, 4 land as two rows of two, 1 sits alone.
 *
 * The row template is an inline style because it is computed per group. It is
 * inert from md up, where the list is `display: block` and spaced by
 * `space-y` — the same single stack it has always been there.
 */
function LinkGroup({
  title,
  titleDesktop,
  links,
  className = "",
}: {
  title: string;
  titleDesktop: string;
  links: readonly { label: string; href: string | null }[];
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="text-[1.125rem] font-medium uppercase leading-none md:text-[1.625rem] md:leading-[1.625rem]">
        {/* One head per frame — PRODUCT on the phone, PRODUCTS on the desktop
            (see content.ts). The hidden one is display:none, so only ever one
            is in the a11y tree and only one supplies the accessible name. */}
        <span className="md:hidden">{title}</span>
        <span className="hidden md:inline">{titleDesktop}</span>
      </h2>
      <ul
        style={{ gridTemplateRows: `repeat(${Math.ceil(links.length / 2)}, auto)` }}
        className="mt-5 grid grid-flow-col grid-cols-[215fr_130fr] gap-y-5 leading-none md:mt-[1.90625rem] md:block md:space-y-[1.6875rem]"
      >
        {links.map((link) => (
          <li key={link.label}>
            {/* nowrap for the reason the desktop legal row has it: the right
                column is 130 for a label that sets ~122, and the margin is
                thinner still while the fallback face is up before Poppins
                lands. A wrap there is not a small error — the row doubles in
                height and every group below it moves down by 16. */}
            <FooterLink
              href={link.href}
              className="whitespace-nowrap text-[1rem] leading-none md:text-[1.3125rem] md:leading-none"
            >
              {link.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    /*
      DESKTOP GEOMETRY, measured off the reference screenshot (Žilvinas
      2026-08-19) and converted to design px against the 1920 frame — the shot
      is 1366 wide, so 1366/1920 = 0.7115 is the scale, confirmed by its content
      starting at 191 (= the design's 270 side margin) and the column measuring
      973 (= 1380, the design's content column).

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
    /* #121212 on BOTH frames — the phone artboard's plate, and desktop node
       `4134:616`, a 1920 x 425 rect behind the whole footer. A shade off the
       page's black, which is what separates it from the CTA section above. */
    <footer className="bg-[#121212]">
      <div
        /*
          NOT `SHELL`. Every section above puts a 20 gutter INSIDE its 1380, so
          its text runs 290..1630 — 1340 of content. The footer's frame does
          not: node `4167:280` runs its content 270..1650, the full 1380, and
          the rule is 1380 wide to prove it. Squeezing it into SHELL compressed
          every horizontal stop by 1340/1380 = 2.9%, which is what put the
          legal row's gaps at 42.2 instead of 48.

          So the box is SHELL's, plus the gutter back: `86.25rem + 2 * gutter`
          outside, 1380 of content inside. That also lines the footer up with
          the HEADER BAR rather than with the section text — the bar is a fixed
          1386 at 1920 (SiteHeader), i.e. 267..1653, so the design's own footer
          sits 3px inside it. The 20 gutter stays on the padding, so below the
          crossover the content still cannot touch the window edge.
        */
        className="mx-auto w-full max-w-[calc(86.25rem+2*var(--gutter))] px-[var(--gutter)] pb-[3.25rem] pt-[2.4375rem] md:pb-[3.90625rem] md:pt-[3.84375rem]"
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
        {/*
          THE PHONE COLUMN IS THE PAGE'S, not the footer's own (Žilvinas
          2026-08-28). It used to be a centred 293 inside a 41 gutter, which is
          what the earlier artboard drew; the new one runs the content to the
          site's 15 gutter like every other section, so the field, the button
          and the link stops all gain 26 of width. Nothing here sets that width
          any more — the wrapper's `px-[var(--gutter)]` is the whole story.

          Left-aligned, too. Only the gift block, the social row and the
          copyright stay centred; the four link groups set from the column's
          left edge.
        */}
        <div className="grid w-full gap-9 md:grid-cols-[599fr_313fr_213fr_255fr] md:gap-0">
          <div className="text-center md:text-left">
            {/* Behind FOOTER.giftEnabled — see content.ts. The whole capture
                is kept, not deleted, so bringing it back is one boolean. */}
            {FOOTER.giftEnabled ? (
              <>
            <h2 className="text-[1.375rem] font-medium leading-none md:text-[1.625rem] md:leading-[1.625rem]">
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
              className="mt-4 flex flex-col items-stretch gap-[0.625rem] md:mt-[1.34375rem] md:flex-row md:items-center md:gap-[0.9375rem]"
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
                /* Node `4134:619`: 284 x 60, radius 10, filled #222222 —
                   the same tone as the social tiles, and with no border at
                   all. The placeholder is 21 at white 50%, inset 22 from the
                   left (the export puts its text box at 292 against the
                   field's 270). min-w-0 so the phone's row can shrink it. */
                className="h-11 w-full min-w-0 rounded-[0.625rem] border border-transparent bg-[#222222] px-[0.9375rem] text-[1rem] text-white outline-none transition-colors duration-200 placeholder:text-white/50 focus:border-white/45 md:h-[3.75rem] md:w-[17.75rem] md:flex-none md:px-[1.375rem] md:text-[1.3125rem]"
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
              </>
            ) : null}

            {/* 22 under the field. The star is 27.37 on the column's own
                left edge, then 5.5 to "Trustpilot" at 20 Regular, then 6 to
                the score at 24 SemiBold — all of them the export's own x
                positions differenced, not spacing read off a picture. */}
            {/* leading-none so the row is exactly as tall as the star, 21.
                Left to the score's own 1.5 line-height it stands 31.5 tall,
                which is what pushed the rule 10 below its measured 291. */}
            {/*
              Desktop is a grid on the export's own x stops — star at 0,
              "Trustpilot" at 32.89, the score at 134 — rather than three gaps.
              Gaps put the score 2.6 right of where the design has it, because
              Figma's text box for "Trustpilot" is 95.1 wide where the rendered
              advance is 92.3: the box carries ~2.8 of trailing air the glyphs
              do not fill, so measuring a gap from the box's edge and measuring
              it from the ink are two different numbers. Stops sidestep that —
              each element starts exactly where the design starts it, whatever
              the type does in between. Same technique as the columns above.
            */}
            <p className={`${FOOTER.giftEnabled ? "mt-[1.125rem] md:mt-[1.375rem]" : ""} flex items-center justify-center gap-2.5 leading-none md:grid md:grid-cols-[2.0556rem_6.3194rem_auto] md:items-center md:justify-start md:gap-0`}>
              <TrustStar />
              <span className="text-[1rem] md:text-[1.25rem]">
                {FOOTER.trustpilot.label}
              </span>
              <span className="ml-[0.3125rem] text-[1.375rem] font-semibold md:ml-0 md:text-[1.5rem]">
                {FOOTER.trustpilot.score}
              </span>
            </p>
          </div>

          {/* PRODUCT, then LEGAL, then COMPANY — the phone artboard's order.
              LEGAL sits BETWEEN the two on the phone and is display:none from
              md up, where the same links are the bottom bar's cluster instead
              (see below). Because it never renders at md, moving it here does
              not shift the desktop grid: a display:none child is not a grid
              item, so the four columns above still line up with the four
              blocks that remain. */}
          <LinkGroup
            title={FOOTER.columns[0].title}
            titleDesktop={FOOTER.columns[0].titleDesktop}
            links={FOOTER.columns[0].links}
          />
          <LinkGroup
            title="Legal"
            titleDesktop="Legal"
            links={FOOTER.legal}
            className="md:hidden"
          />
          <LinkGroup
            title={FOOTER.columns[1].title}
            titleDesktop={FOOTER.columns[1].titleDesktop}
            links={FOOTER.columns[1].links}
          />

          {/* CONTACT — the address on the same row as the other columns' first
              link, then the social row 32 under it. */}
          <div>
            <h2 className="text-[1.125rem] font-medium uppercase leading-none md:text-[1.625rem] md:leading-[1.625rem]">
              {FOOTER.contactTitle}
            </h2>
            <a
              /* #8E8E8E on the phone — two levels lighter than the column
                 links' #808080, which is the artboard's own distinction, so
                 this one cannot share LINK's colour. */
              href={`mailto:${CONTACT_EMAIL}`}
              /* The phone artboard sets the address #8E8E8E, a step lighter
                 than its column links; the DESKTOP node `4134:617` sets it
                 #808080, the same as everything else in its columns. Two
                 frames, two values — hence the md: override rather than one
                 shared colour. */
              className={`text-[#8e8e8e] transition-colors duration-200 hover:text-white md:text-muted mt-5 block text-[1.125rem] leading-none md:mt-[1.90625rem] md:text-[1.3125rem] md:leading-none`}
            >
              {CONTACT_EMAIL}
            </a>

            {/* DESKTOP node `4134:653`: 46 tiles, radius 10, #222222, pitch
                67 — 20.67 between them, which is what makes the row 246
                across, and no stroke.

                THE PHONE IS ITS OWN TILE (Žilvinas 2026-08-28): 50 square,
                radius 12, the same #222222 fill, plus a 1px inside stroke
                running #222222 to #666666 down the tile — `.tile-ring` in
                globals.css. The ring is switched off from md up, where the
                desktop node draws none; if that frame gained the same stroke,
                delete the `md:[&::before]:hidden` and the two agree again.

                All four marks are white, and they invert on hover like the
                site's buttons: the tile goes white and the mark takes the
                tile's own #222222, so no glyph disappears into its fill.
                `--tile` carries that second colour into Facebook's knockout. */}
            <ul className="mt-[3.25rem] flex items-center justify-center gap-5 md:mt-[1.9375rem] md:justify-start md:gap-[1.29167rem]">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`${SITE_NAME} on ${s.label}`}
                    className="tile-ring flex size-[3.125rem] items-center justify-center rounded-[0.75rem] bg-[#222222] text-white transition-colors duration-300 ease-out [--tile:#222222] hover:bg-white hover:text-[#222222] hover:[--tile:#fff] md:size-[2.875rem] md:rounded-[0.625rem] md:[&::before]:hidden"
                  >
                    <svg
                      viewBox={SOCIAL_MARKS[s.label].view}
                      fill="currentColor"
                      aria-hidden="true"
                      /* The supplied logos are the GLYPH ONLY, at their own
                         aspect ratios — the tile is the CSS box around them,
                         so the mark is sized off the tile's height and its
                         width follows from the viewBox. */
                      className={`w-auto ${SOCIAL_MARKS[s.label].h}`}
                    >
                      {SOCIAL_MARKS[s.label].parts.map((part, i) =>
                        "circle" in part ? (
                          <circle
                            key={i}
                            cx={part.circle[0]}
                            cy={part.circle[1]}
                            r={part.circle[2]}
                          />
                        ) : (
                          <path
                            key={i}
                            d={part.d}
                            fill={part.knockout ? "var(--tile)" : "currentColor"}
                          />
                        ),
                      )}
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
        <div className="mt-[1.4375rem] border-t-0 pt-0 md:mt-[3.93rem] md:border-t md:border-[#808080] md:pt-[3.890625rem]">
          {/* Desktop is two regions, not a flex row with a gap: the
              copyright on the column's left edge and the legal cluster running
              from the PRODUCTS stop (599) to the right edge (1380), i.e. 781
              wide. Splitting it that way is what lets `justify-between` hold
              BOTH of the design's alignments at once — the four labels are set
              in type, which does not compress with the column, so a fixed 48
              gap can only keep one end flush. Here the gaps absorb it. */}
          <div className="flex flex-col gap-5 text-center text-[0.875rem] md:grid md:grid-cols-[599fr_781fr] md:items-center md:gap-0 md:text-left md:text-[1.125rem]">
            <p className="leading-none text-white/50 md:leading-none">
              {/* One line per frame — the strings differ (see content.ts).
                  Only one is ever in the a11y tree: the other is
                  display:none, not merely invisible. */}
              <span className="md:hidden">{FOOTER.copyright}</span>
              <span className="hidden md:inline">{FOOTER.copyrightDesktop}</span>
            </p>
            {/* Right-aligned cluster with a 48 gap — the export's four x
                positions difference to 48 / 48 / 49, and its last label ends
                at 1650, the column's right edge, which is what right alignment
                reproduces. The cluster's left edge then lands on 599, i.e.
                under PRODUCTS, exactly as the design has it. */}
            {/* Desktop only. On the phone the same links are a LEGAL group up
                with the other columns, which is where the artboard puts them —
                rendered as a second node rather than reordered with CSS
                because the two sit in different containers. The hidden one is
                display:none, so only ever one is in the a11y tree. */}
            <nav aria-label="Legal" className="hidden md:block">
              {/* leading-none on the LIST, not just on the links: an <li>'s own
                  strut sets its line box, so links set solo still sat in 27
                  tall rows and pushed the bar's centre 4.7 low. */}
              {/* The export's four stops — 599 / 770 / 994 / 1164 from the
                  content edge, so widths 171 / 224 / 170 / 216 inside this
                  781-wide region. Positioning each label rather than spacing
                  them is what makes the row exact: rendered advances are a
                  few px narrower than Figma's text boxes, so any single gap
                  value lands one end right and the other end wrong. */}
              <ul className="grid grid-cols-[171fr_224fr_170fr_216fr] leading-none">
                {FOOTER.legalDesktop.map((link) => (
                  <li key={link.label}>
                    {/* leading-none, so the bar is exactly its own 18 tall.
                        Left at the browser's 1.5 it stood 27, which pushed
                        both this row's centre and the footer's bottom edge 9
                        below the design's 353.5 and 425.

                        nowrap because the last stop is the tightest: 216 of
                        track for a label that sets 214.9. A wrap there is not
                        a small error — it doubles the row and takes the whole
                        footer to 443. */}
                    <FooterLink
                      href={link.href}
                      className="whitespace-nowrap leading-none"
                    >
                      {link.label}
                    </FooterLink>
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
