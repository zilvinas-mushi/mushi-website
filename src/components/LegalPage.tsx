import type { ReactNode } from "react";
import { LegalHero } from "./LegalHero";
import { LegalToc } from "./LegalToc";
import {
  LEGAL_DOCS,
  legalHref,
  sectionId,
  type LegalBlock,
  type LegalDoc,
} from "@/lib/legal";

/**
 * ONE PAGE FOR THE THREE LEGAL DOCUMENTS (Žilvinas 2026-10-10: "as these
 * pages are the same make like one page with parameters"). The document is
 * the parameter — src/lib/legal.ts — and everything about how it looks is
 * here, so a change to this file changes Privacy, Terms and Refund together.
 *
 * Built from the six Figma frames on "WEB: Legal" (design/LEGAL.md): a hero
 * band with the title and the date, then on desktop a sidebar — the Legal nav
 * with the current document as a white pill, and the table of contents on its
 * dotted rail — beside the 905-wide text column; on the phone the text alone.
 *
 * Desktop numbers are in rem, 16 design px to the rem at 1920 (globals.css);
 * the phone's are px at the 375 frame. Vertical rhythm, measured off the
 * Refund frames: paragraphs 30 apart, a section heading 42 below the last
 * paragraph and 27 above its first (phone: 38 and 36), the body starting 92
 * under the hero on both.
 */

/* ---- type ---- */

const BODY =
  "text-[16px] leading-[25px] text-white/75 md:text-[1.375rem] md:leading-[2rem]";
/** The clause number: Medium, white, one size up from the body. */
const NUM = "font-medium leading-none text-white text-[18px] md:text-[1.5rem]";
/** Blocks in a section, and clauses in a run, are 30 apart on both frames. */
const GAP = "flex flex-col gap-[30px] md:gap-[1.875rem]";

/* ---- inline links ---- */

const LINK_RE = /(https?:\/\/[^\s,)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

/**
 * Email addresses and URLs in the copy become links. Figma draws them as
 * plain text (bar one), so they keep the body's colour and only show their
 * underline on hover — a reader who wants support@mushi.agency can tap it.
 */
function rich(text: string): ReactNode[] {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const href = part.includes("@") ? `mailto:${part}` : part;
    return (
      <a
        key={i}
        href={href}
        className="underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-current"
      >
        {part}
      </a>
    );
  });
}

/* ---- blocks ---- */

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p className={`${BODY} whitespace-pre-line`}>{rich(block.text)}</p>;
    case "clause":
      return (
        <div className={BODY}>
          <p>
            <span className={NUM}>{block.n}</span> {rich(block.text)}
          </p>
          {block.list && (
            // "(a) …" with the wrapped lines hanging under the text, as the
            // frame indents them, after one blank line.
            <ul className="mt-[25px] md:mt-[2rem]">
              {block.list.map((item) => (
                <li key={item} className="pl-[2.1em] -indent-[2.1em]">
                  {rich(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case "ul":
      return (
        <div className={BODY}>
          {block.label && <p>{block.label}</p>}
          <ul>
            {block.items.map((item) => (
              <li key={item} className="pl-[0.65em] -indent-[0.65em]">
                • {rich(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    case "sub":
      return (
        <div className={GAP}>
          {/* Medium 26 on 32, white — a step below the section heading. The
              frame sets it 2 design px LEFT of the body (703 against 730)
              and what follows it 18 to the right. */}
          <h3 className="text-[18px] font-medium leading-[25px] text-white md:-ml-[0.125rem] md:text-[1.625rem] md:leading-[2rem]">
            {block.n} {block.title}
          </h3>
          <div className={`${GAP} md:pl-[1.125rem]`}>
            {block.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        </div>
      );
  }
}

/* ---- the nav's icons: Figma's lock-01, file-06, refresh-cw-05, verbatim ---- */

const ICON_PATHS = {
  lock: "M17 10V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V10M12 14.5V16.5M8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.7202 10 16.8802 10 15.2 10H8.8C7.11984 10 6.27976 10 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21Z",
  file: "M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z",
  refresh:
    "M20.453 12.893C20.1752 15.5029 18.6964 17.9487 16.2494 19.3614C12.1839 21.7086 6.98539 20.3157 4.63818 16.2502L4.38818 15.8172M3.54613 11.107C3.82393 8.49711 5.30272 6.05138 7.74971 4.63862C11.8152 2.29141 17.0137 3.68434 19.3609 7.74983L19.6109 8.18285M3.49316 18.0661L4.22521 15.334L6.95727 16.0661M17.0424 7.93401L19.7744 8.66606L20.5065 5.93401",
} as const;

function NavIcon({ icon }: { icon: keyof typeof ICON_PATHS }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[1.5rem] shrink-0"
    >
      <path d={ICON_PATHS[icon]} />
    </svg>
  );
}

/* ---- the page ---- */

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const titles = doc.sections.map((s) => s.title);

  return (
    <main className="flex-1 bg-black">
      {/* THE HERO: the violet grid artwork, 392 tall at 1920 and 196 on the
          phone, with the title and the date centred on it. It runs up behind
          the floating header (the negative margin, as on every other page).
          The artwork is inline vector (LegalHero): nothing is fetched and
          nothing is soft, so the paint gate has only the fonts to wait for.
          Each device gets its own window on the scene — the phone's is the
          panel's left third, mirrored, as its frame crops it (design/LEGAL.md). */}
      <section
        className="relative h-[196px] overflow-hidden md:h-[24.5rem]"
        style={{ marginTop: "calc(var(--header-h) * -1)" }}
      >
        <LegalHero variant="desktop" className="absolute inset-0 hidden h-full w-full md:block" />
        <LegalHero variant="phone" className="absolute inset-0 h-full w-full md:hidden" />
        {/* SemiBold 70 on 80, centred, its top 191 down; the phone's 30 on 30
            at 102. The date is Regular 24 on 20 at 290 (phone 15 on 20 at 143). */}
        <h1 className="absolute inset-x-0 top-[102px] text-center text-[30px] font-semibold leading-[30px] text-white md:top-[11.9375rem] md:text-[4.375rem] md:leading-[5rem]">
          {doc.title}
        </h1>
        <p className="absolute inset-x-0 top-[143px] text-center text-[15px] leading-[20px] text-white md:top-[18.125rem] md:text-[1.5rem] md:leading-[1.25rem]">
          Last updated: {doc.updated}
        </p>
      </section>

      {/* THE BODY: 92 under the hero on both frames; on the phone 35 in from
          the left and 15 from the right, as drawn. Desktop is a two-column
          grid on a 1382-wide column (269 to 1651 at 1920 — the frames start
          the sidebar at 269, 1 inside the header bar's edge, so the shell's
          1340 would not do): the sidebar's column runs to the text column's
          left edge at 732, the text 905 wide. Below lg the sidebar is off and
          the text takes the phone's single column. */}
      <div className="mx-auto grid w-full max-w-[calc(86.375rem+2*var(--gutter))] grid-cols-1 px-[var(--gutter)] pt-[92px] pb-[60px] max-md:pl-[35px] max-md:pr-[15px] md:pt-[5.75rem] md:pb-[9.375rem] lg:grid-cols-[28.9375rem_minmax(0,56.5625rem)]">
        {/* The sidebar fills the row (no self-start) so the block that is
            sticky INSIDE it — the table of contents, below — has the whole
            text's height to stay pinned through. The Legal nav above it is
            not sticky: it scrolls away with the top of the page (Žilvinas
            2026-10-10: "don't stick Legal and those three buttons, just
            table of contents"). */}
        <aside className="hidden lg:block" aria-label="Legal documents">
          {/* "Legal", SemiBold 28, 3 up from the text column's top (481
              against 484); the pills 15 under it. */}
          <h2 className="-mt-[0.1875rem] text-[1.75rem] font-semibold leading-[2.625rem] text-white">
            Legal
          </h2>
          <nav className="mt-[0.9375rem]">
            <ul>
              {LEGAL_DOCS.map((d) => {
                const current = d.slug === doc.slug;
                return (
                  <li key={d.slug}>
                    {/* 307 x 44, radius 10, the icon 15 in and the label 49
                        in. The current one is the white pill with black type;
                        the others white on the page, and they take the pill
                        on hover so the three read as one control. */}
                    <a
                      href={legalHref(d)}
                      aria-current={current ? "page" : undefined}
                      className={`flex h-[2.75rem] w-[19.1875rem] items-center gap-[0.625rem] rounded-[0.625rem] pl-[0.9375rem] text-[1.25rem] font-medium leading-none transition-colors duration-200 ${
                        current ? "bg-white text-black" : "text-white hover:bg-white/10"
                      }`}
                    >
                      <NavIcon icon={d.icon} />
                      <span>{d.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* THE STICKY PART: the heading and the rail, 32 under the last
              pill at the top of the page and pinned 24 under the floating
              header once the page has scrolled past them. LegalToc squeezes
              the rail's gaps when the window is too short for every entry,
              so each can always be pressed (data-toc-sticky is how it finds
              the pin to measure from). */}
          <div
            data-toc-sticky=""
            className="sticky top-[calc(var(--header-h)+1.5rem)] mt-[2rem]"
          >
            <h2 className="text-[1.75rem] font-semibold leading-[2.625rem] text-white">
              Table of contents
            </h2>
            <LegalToc titles={titles} />
          </div>
        </aside>

        <article className={GAP}>
          {doc.intro.length > 0 && (
            <div className={GAP}>
              {doc.intro.map((text) => (
                <p key={text} className={BODY}>
                  {rich(text)}
                </p>
              ))}
            </div>
          )}
          {doc.sections.map((section, i) => (
            <section key={section.title} className={GAP}>
              {/* SemiBold 40 on 60 (its normal line), 42 above and 27 below
                  on desktop, 38 and 36 on the phone at 23 on 28. The frame
                  starts the number 12 left of the body's edge, and keeps the
                  title on one line in a box that may run past the column.
                  The margins are the gaps over and above the 30 the column
                  already keeps, so they are the measured gap less 30. */}
              <h2
                id={sectionId(i)}
                className="mt-[8px] mb-[6px] scroll-mt-[calc(var(--header-h)+1.5rem)] text-[23px] font-semibold leading-[28px] text-white md:mt-[0.75rem] md:-mb-[0.1875rem] md:-ml-[0.75rem] md:text-[2.5rem] md:leading-[3.75rem] lg:whitespace-nowrap"
              >
                {i + 1}. {section.title}
              </h2>
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
