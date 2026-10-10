import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PlanSheet } from "@/components/checkout/PlanSheet";
import {
  CaseStudiesFieldArt,
  CaseStudiesHero,
  CaseStudiesRails,
  ReadyToScale,
} from "@/components/case-studies/CaseStudySections";
import { CASE_STUDIES_PAGE } from "@/lib/content";
import {
  BOOKING_URL,
  CASE_STUDIES_CALL_ID,
  CASE_STUDIES_RAILS_ID,
  OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  abs,
} from "@/lib/site";

const DESCRIPTION =
  "How Mushi's ads perform: Holo from $0k to $117k a month in 7 months, 700 sales calls for Breezit, evergreen ads for an 8-figure marketplace — plus the video ads, landing pages and static ads behind the numbers.";

export const metadata: Metadata = {
  title: "Case Studies",
  description: DESCRIPTION,
  alternates: { canonical: "/case-studies" },
  openGraph: {
    type: "website",
    url: abs("/case-studies"),
    siteName: SITE_NAME,
    title: `Case Studies — ${SITE_NAME}`,
    description: DESCRIPTION,
    locale: "en_US",
    // The same share card as the home page. JPEG, not WebP: Slack, LinkedIn
    // and iMessage refuse WebP cards and show nothing at all.
    images: [
      {
        url: abs(OG_IMAGE),
        width: 2400,
        height: 1260,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
};

/**
 * Where the page sits in the site, and what is on it. The cards are an
 * ItemList so each brand's result is attached to its name — the same pairs
 * the visible cards render, both reading CASE_STUDIES_PAGE.cards.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Case Studies", item: abs("/case-studies") },
      ],
    },
    {
      "@type": "CollectionPage",
      name: `Case Studies — ${SITE_NAME}`,
      url: abs("/case-studies"),
      description: DESCRIPTION,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: CASE_STUDIES_PAGE.cards.map((card, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${card.brand}: ${card.result}`,
        })),
      },
    },
  ],
};

/**
 * /case-studies — the four client results, then the work itself by format.
 *
 * Built from the two Figma frames recorded in design/CASE-STUDIES.md. Same
 * wrapper trick as the other pages: the field runs behind the floating header
 * via the negative margin, so the page reads as one surface.
 */
export default function CaseStudies() {
  return (
    <>
      {/* THE OVERSCROLL COLOUR, server-rendered — see the same tag on
          /templates. The canvas default is the home hero's lit violet; this
          field opens on black. */}
      <style dangerouslySetInnerHTML={{ __html: "body{--canvas-top:#000000}" }} />
      {/* The field is a CSS background and it is this page's first screen:
          nothing points at it until the stylesheet has parsed, so it is named
          here. `media` on both, because each device draws its own file and a
          preload whose media does not match is never fetched. Keep these in
          step with .cs-field (globals.css). */}
      <link
        rel="preload"
        as="image"
        href="/images/case-studies/field.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/case-studies/field-phone.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <SiteHeader
        active="/case-studies"
        // The phone bar's sliding Schedule a Call. Home's button, on this
        // page's landmarks: out once the cards have gone under the bar and
        // the rails begin, back in as the Ready To Scale card's own Book a
        // Call pill arrives — the page is asking for the booking itself by
        // then.
        mobileCta={{
          label: "Schedule a Call",
          href: BOOKING_URL,
          fromId: CASE_STUDIES_RAILS_ID,
          untilId: CASE_STUDIES_CALL_ID,
        }}
      />
      <main className="flex-1 bg-black">
        {/* data-await-bg: the field is a CSS background, so the paint gate
            has to be told to wait for it. The shapes, the icons on the first
            screen and the first three cards' artwork are eager <img>s and are
            picked up on their own. */}
        <div
          data-await-bg=""
          className="cs-field relative overflow-hidden"
          style={{
            marginTop: "calc(var(--header-h) * -1)",
            paddingTop: "var(--header-h)",
          }}
        >
          <CaseStudiesFieldArt />
          <CaseStudiesHero />
        </div>

        <CaseStudiesRails />
        <ReadyToScale />
      </main>
      {/* The Pick-your-plan sheet: the Ready To Scale card's Buy Now opens it
          here, the same one /templates has. Renders nothing until then. */}
      <PlanSheet />
      <SiteFooter />
      <script
        type="application/ld+json"
        // Static, build-time constant — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
