import { FOOTER } from "@/lib/content";
import { BOOKING_URL, SITE_NAME, SOCIALS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-bg-alt">
      <div className="mx-auto w-full max-w-[86.25rem] px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="text-lg font-medium">{FOOTER.giftHeading}</p>

            {/*
              The design shows an email capture here. No provider has been
              chosen and there is no server to post to, so the input is
              deliberately omitted — a form that silently discards submissions
              is worse than none, because visitors believe they subscribed.

              To enable: wrap this in a <form action="<provider hosted URL>"
              method="post"> with an email input. Nothing else changes.
              See design/SECTIONS.md.
            */}
            <p className="mt-2 max-w-xs text-sm text-muted">
              Newsletter coming soon. In the meantime, grab a slot and we&rsquo;ll talk
              through your account.
            </p>
            <a
              href={BOOKING_URL}
              className="mt-5 inline-flex rounded-[var(--radius-pill)] bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {FOOTER.giftCta}
            </a>

            <p className="mt-8 text-xs text-dim">
              Trustpilot {FOOTER.trustpilot.score} · {FOOTER.trustpilot.reviews}
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER.columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {col.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-dim">{FOOTER.copyright}</p>
          <ul className="flex items-center gap-5">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="text-xs text-white/60 transition-colors hover:text-white"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {s.label}
                  <span className="sr-only"> — {SITE_NAME} on {s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
