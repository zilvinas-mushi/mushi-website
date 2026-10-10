import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CaseStudyBody, CaseStudyHero } from "@/components/case-studies/CaseStudyDetail";
import { CASE_STUDY_DETAILS, type CaseStudySlug } from "@/lib/content";
import {
  BOOKING_URL,
  CASE_STUDY_CALL_ID,
  CASE_STUDY_HERO_CTA_ID,
  OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  abs,
} from "@/lib/site";

/**
 * HELD BACK (Žilvinas 2026-10-04, "we don't have the page cooked for now").
 * This folder is `_[slug]`: the underscore makes it a private folder, which
 * Next does not route, so the page is not built, not linked and not in the
 * sitemap. A flag could not do it — under `output: 'export'` a dynamic route
 * whose generateStaticParams returns nothing fails the build. To ship it:
 * rename the folder to `[slug]`, give the Holo card its href (content.ts) and
 * add the URL to sitemap.ts.
 *
 * One page per entry in CASE_STUDY_DETAILS, and no others: there is no server
 * to render an unknown slug on demand (CLAUDE.md), so anything not listed
 * here is a 404 at build time rather than a request.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CASE_STUDY_DETAILS).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDY_DETAILS[slug as CaseStudySlug];
  const title = `${study.brand}: ${study.title.replace(/\.$/, "")}`;
  return {
    title,
    description: study.sub,
    alternates: { canonical: `/case-studies/${slug}` },
    openGraph: {
      type: "article",
      url: abs(`/case-studies/${slug}`),
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description: study.sub,
      locale: "en_US",
      // The same share card as the home page. JPEG, not WebP: Slack, LinkedIn
      // and iMessage refuse WebP cards and show nothing at all.
      images: [
        { url: abs(OG_IMAGE), width: 2400, height: 1260, alt: `${SITE_NAME} — ${SITE_TAGLINE}` },
      ],
    },
  };
}

/**
 * /case-studies/<slug> — one client's story.
 *
 * Built from the two Figma frames recorded in design/CASE-STUDIES.md ("Detail
 * page"). Same wrapper trick as the other pages: the field runs behind the
 * floating header via the negative margin.
 */
export default async function CaseStudy({ params }: Props) {
  const { slug: raw } = await params;
  const slug = raw as CaseStudySlug;
  const study = CASE_STUDY_DETAILS[slug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Case Studies", item: abs("/case-studies") },
          { "@type": "ListItem", position: 3, name: study.brand, item: abs(`/case-studies/${slug}`) },
        ],
      },
      {
        "@type": "Article",
        headline: study.title,
        description: study.sub,
        url: abs(`/case-studies/${slug}`),
        image: abs(`/images/${study.thumb}`),
        about: study.brand,
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      },
    ],
  };

  return (
    <>
      {/* THE OVERSCROLL COLOUR, server-rendered — see /templates. */}
      <style dangerouslySetInnerHTML={{ __html: "body{--canvas-top:#000000}" }} />
      {/* The field is a CSS background and it is the first screen: named here
          so it is on the wire before the stylesheet has parsed. Keep in step
          with .csd-field (globals.css). */}
      <link
        rel="preload"
        as="image"
        href="/images/case-studies/detail-field.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/case-studies/detail-field-phone.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <SiteHeader
        active="/case-studies"
        // The phone bar's sliding Schedule a Call: out once the hero's own
        // Book a Call has gone under the bar, back in as the call card's
        // button arrives.
        mobileCta={{
          label: "Schedule a Call",
          href: BOOKING_URL,
          fromId: CASE_STUDY_HERO_CTA_ID,
          untilId: CASE_STUDY_CALL_ID,
        }}
      />
      <main className="flex-1 bg-black">
        <div
          data-await-bg=""
          className="csd-field relative overflow-hidden"
          style={{
            marginTop: "calc(var(--header-h) * -1)",
            paddingTop: "var(--header-h)",
          }}
        >
          <CaseStudyHero slug={slug} />
        </div>
        <CaseStudyBody slug={slug} />
        {/* The frame leaves 18 of the page's own black between the #080808
            field and the footer on desktop. */}
        <div aria-hidden="true" className="hidden h-[1.125rem] md:block" />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Static, build-time constant — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
