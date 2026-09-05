import { FOOTER } from "@/lib/content";
import { BOOKING_URL, SITE_NAME, SOCIALS } from "@/lib/site";

/** Social glyphs for the contact column's icon discs. */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="size-[17px] stroke-current">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" className="size-[16px] fill-current">
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.03-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" className="size-[16px] fill-current">
      <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 11-1.59-2.39V9.84a5.76 5.76 0 00-.94-.08 5.66 5.66 0 105.66 5.66V9.35a7.35 7.35 0 004.29 1.38V7.64a4.3 4.3 0 01-3.27-1.82z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" className="size-[16px] fill-current">
      <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.87.24-1.46 1.49-1.46h1.29V4.95c-.63-.07-1.26-.1-1.9-.1-2.4 0-4.05 1.47-4.05 4.16V11H8v3h2.35v7z" />
    </svg>
  ),
};

/**
 * Footer, rebuilt to the 2026-09-03 design: mystery-gift capture, Products /
 * Company / Contact columns with social discs, and the legal bar.
 *
 * The design's email input is deliberately omitted until an email provider
 * exists (design/SECTIONS.md — a capture that discards submissions is worse
 * than none). To enable it: wrap the CTA row in
 * `<form action="<provider hosted URL>" method="post">`, add
 * `<input type="email" name="email" placeholder={FOOTER.emailPlaceholder}>`
 * beside the button, and point the button at type="submit" instead of
 * BOOKING_URL. Nothing else changes.
 */
export function SiteFooter() {
  return (
    <footer className="bg-[#121114]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_0.9fr_1.2fr] md:gap-8">
          <div>
            <h2 className="text-[17px] font-semibold text-white">
              {FOOTER.giftHeading}
            </h2>
            {/* Same purple pill and hover inversion as every primary CTA. */}
            <a
              href={BOOKING_URL}
              className="mt-4 inline-flex h-[42px] items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#a08ade_8%,#7c54b5_42%,#6e54b5_93%)] px-6 text-[14px] font-medium text-white transition-all duration-150 hover:bg-[linear-gradient(140deg,#fff_0%,#fff_100%)] hover:text-[#6e54b5]"
            >
              {FOOTER.giftCta}
            </a>
            <p className="mt-5 flex items-center gap-1.5 text-[14px] text-white">
              <svg
                viewBox="0 0 24 24"
                className="size-[16px] fill-[#6e54b5]"
                aria-hidden="true"
              >
                <path d="M12 2.6l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.6l6.6-.9L12 2.6z" />
              </svg>
              Trustpilot <strong className="font-semibold">{FOOTER.trustpilot.score}</strong>
            </p>
          </div>

          {FOOTER.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
              {FOOTER.contact.title}
            </h2>
            <p className="mt-4">
              <a
                href={`mailto:${FOOTER.contact.email}`}
                className="text-[14px] text-white/55 transition-colors hover:text-white"
              >
                {FOOTER.contact.email}
              </a>
            </p>
            <ul className="mt-5 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`${SITE_NAME} on ${s.label}`}
                    className="flex size-9 items-center justify-center rounded-full bg-[#222222] text-white transition-colors duration-150 hover:bg-white hover:text-black"
                  >
                    {SOCIAL_ICONS[s.label]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[12px] text-white/40">{FOOTER.copyright}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[12px] text-white/45 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
