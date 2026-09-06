import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  TemplatesAccess,
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
import { APP_URL, SITE_NAME, SITE_TAGLINE, TEMPLATES_HERO_CTA_ID, abs } from "@/lib/site";

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
      <SiteHeader
        cta={{ label: TEMPLATES_PAGE.login, href: APP_URL, variant: "light" }}
        // The phone bar's sliding offer. It rides out as the hero's own CTA
        // goes under the bar, and stays out — this page has no closing pill of
        // its own to hand back to, unlike home's fit-check. 45 tall / 20px
        // label per the design; the width is whatever the bar's gutters leave.
        mobileCta={{
          label: TEMPLATES_PAGE.mobileCta,
          href: APP_URL,
          fromId: TEMPLATES_HERO_CTA_ID,
          heightPx: 45,
          labelPx: 20,
          radiusPx: 5,
          strokeColor: "#7c54b5",
        }}
        active="/templates"
      />
      <main className="flex-1">
        {/* No bottom padding: the burst artwork (see .tpl-bg) must end
            exactly where the MacBook image does — nothing colour-washed
            below it. */}
        <div className="tpl-bg relative -mt-[82px] overflow-hidden pt-[82px]">
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
