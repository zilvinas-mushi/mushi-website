import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  TemplatesAccess,
  TemplatesBgFallbacks,
  TemplatesComparison,
  TemplatesDifference,
  TemplatesFaq,
  TemplatesHero,
  TemplatesInside,
  TemplatesProcess,
  TemplatesShowcase,
  TemplatesTeam,
} from "@/components/TemplateSections";
import { TEMPLATES_PAGE } from "@/lib/content";
import { APP_URL, SITE_NAME, SITE_TAGLINE, TEMPLATES_HERO_CTA_ID, TEMPLATES_SCRATCH_CARD_ID, abs } from "@/lib/site";

const DESCRIPTION =
  "Plug-and-play ad templates from the team behind 110+ brands' creatives. Your 8-minute shortcut to high-ROAS ads — fashion, beauty, food, health and drink niches covered.";

export const metadata: Metadata = {
  title: "Templates",
  description: DESCRIPTION,
  alternates: { canonical: "/templates" },
  openGraph: {
    type: "website",
    url: abs("/templates"),
    siteName: SITE_NAME,
    title: `Templates — ${SITE_NAME}`,
    description: DESCRIPTION,
    locale: "en_US",
    // Same interim share image as the home page — see the TODO(og) in
    // layout.tsx. Swap both together when the designed 1200x630 lands.
    images: [
      {
        url: abs("/images/logo-without-bg-white102.webp"),
        width: 672,
        height: 199,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
};

/**
 * FAQ rich-result schema. The same Q&A pairs the visible accordions render —
 * keep them in sync by construction, both reading TEMPLATES_PAGE.faq.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TEMPLATES_PAGE.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * /templates — marketing page for the webapp's template library.
 *
 * Built from the supplied screenshot of the Templates design (design/COPY.md
 * "Templates page"); no Figma call was spent. Same wrapper trick as the home
 * page: the dark field and colour burst run behind the floating header via
 * the negative margin, so the page reads as one surface.
 */
export default function Templates() {
  return (
    <>
      {/* THE OVERSCROLL COLOUR, server-rendered. The canvas — the band iOS
          drags in past the top — is `body`'s background (see the canvas note
          in globals.css), and its default is sampled from the HOME hero's lit
          violet first rows. This page opens on black.

          A <style> in the page rather than the effect this started as: an
          effect only lands after hydration, so a refresh painted the violet
          first and you could catch it by pulling down immediately. A style
          tag renders with the route and leaves with it. */}
      <style
        dangerouslySetInnerHTML={{ __html: "body{--canvas-top:#000000}" }}
      />
      {/* THE FIRST SCREEN'S FOUR FILES, DISCOVERABLE IN THE HTML.
          React hoists these into <head>, so they are on the wire while the
          stylesheet is still parsing rather than after it.

          The burst is the LCP element and it is a CSS BACKGROUND: nothing
          points at it until the 20 KB stylesheet has been fetched and parsed,
          which Lighthouse reports as "request is not discoverable in the
          initial document" and which costs the whole width of that hop. The
          device beside it is the other half of the same screen and the paint
          gate waits on both.

          `media` on every one of them, because the phone and the desktop draw
          DIFFERENT artwork: an unconditional preload would hand each device
          the other's files at high priority — the mistake that was already
          costing the phone 397 KB before the hero became one <picture>. A
          preload whose media does not match is never fetched.

          Keep these four in step with .tpl-bg (globals.css) and with the
          hero <picture> (TemplateSections). A preload for a file nothing
          then uses is a warning in the console and pure waste on the wire. */}
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-burst-phone.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-burst.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-phone.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-macbook.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <SiteHeader
        cta={{ label: TEMPLATES_PAGE.login, href: APP_URL, variant: "light" }}
        // The header CTA turns into the purple Buy Now as the visitor scrolls
        // into the sales pitch (client 2026-09-12): the swap ramps in from
        // the top of the Difference section, completes at Process, holds to
        // the end of the page, and reverses on the way back up.
        ctaSwap={{
          to: {
            label: TEMPLATES_PAGE.access.templates.cta,
            href: APP_URL,
            variant: "purple",
          },
          startId: "difference-heading",
          endId: "process-heading",
        }}
        // The phone bar's sliding offer. It rides out as the hero's own CTA
        // goes under the bar, and back up as the "Ad creation from scratch"
        // card reaches it. Home's 52 box, with no stroke (Žilvinas
        // 2026-09-11) — the design's 45 read as a different button from the
        // Schedule a Call it stands in for. 20px label per the design.
        mobileCta={{
          label: TEMPLATES_PAGE.mobileCta,
          href: APP_URL,
          fromId: TEMPLATES_HERO_CTA_ID,
          untilId: TEMPLATES_SCRATCH_CARD_ID,
          untilAtButton: true,
          // Back out at "Note from The Team" (Žilvinas 2026-09-11), and out
          // from there to the footer. The heading's own id, set in
          // TemplateSections — rename one, rename both.
          againId: "team-heading",
          labelPx: 20,
          radiusPx: 5,
        }}
        active="/templates"
      />
      {/* The <noscript> rules for this page's deferred background artwork —
          see TemplatesBgFallbacks. Nothing renders with JavaScript on. */}
      <TemplatesBgFallbacks />
      <main className="flex-1">
        {/* No bottom padding: the burst artwork (see .tpl-bg) must end
            exactly where the MacBook image does — nothing colour-washed
            below it. */}
        {/* data-await-bg: the burst is a CSS background and it IS this page's
            first screen, so the paint gate holds until it has decoded. Same
            reasoning as .hero-light on the home page. */}
        <div
          data-await-bg=""
          className="tpl-bg relative -mt-[82px] overflow-hidden pt-[82px]"
        >
          <TemplatesHero />
        </div>

        <TemplatesDifference />
        <TemplatesProcess />
        <TemplatesInside />
        <TemplatesShowcase />
        <TemplatesAccess />
        <TemplatesComparison />
        <TemplatesTeam />
        <TemplatesFaq />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Static, build-time constant — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
