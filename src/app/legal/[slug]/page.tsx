import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LEGAL_DOCS, legalHref } from "@/lib/legal";
import { APP_URL, OG_IMAGE, SITE_NAME, SITE_TAGLINE, SITE_URL, abs } from "@/lib/site";

/**
 * /legal/privacy-policy, /legal/terms-and-conditions, /legal/refund-policy —
 * ONE route, the document as its parameter (src/lib/legal.ts), rendered by
 * LegalPage. Each is a plain static page in the export: there is no server to
 * render an unknown slug (CLAUDE.md), so anything not in LEGAL_DOCS is a 404
 * at build time, never a request.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => LEGAL_DOCS.find((doc) => doc.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = find(slug);
  if (!doc) return {};
  const path = legalHref(doc);
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: abs(path),
      siteName: SITE_NAME,
      title: `${doc.title} — ${SITE_NAME}`,
      description: doc.description,
      locale: "en_US",
      // The same share card as every other page. JPEG, not WebP: Slack,
      // LinkedIn and iMessage refuse WebP cards and show nothing at all.
      images: [
        { url: abs(OG_IMAGE), width: 2400, height: 1260, alt: `${SITE_NAME} — ${SITE_TAGLINE}` },
      ],
    },
  };
}

export default async function Legal({ params }: Props) {
  const { slug } = await params;
  const doc = find(slug);
  if (!doc) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: doc.title, item: abs(legalHref(doc)) },
        ],
      },
      {
        "@type": "WebPage",
        name: `${doc.title} — ${SITE_NAME}`,
        url: abs(legalHref(doc)),
        description: doc.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };

  return (
    <>
      {/* THE OVERSCROLL COLOUR, server-rendered — see the same tag on
          /templates. This page opens on the hero's near-black. */}
      <style dangerouslySetInnerHTML={{ __html: "body{--canvas-top:#000000}" }} />
      <script
        type="application/ld+json"
        // Build-time constant from legal.ts — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* The frames' header carries the light Login, as /templates does. */}
      <SiteHeader cta={{ label: "Login", href: APP_URL, variant: "light" }} />
      <LegalPage doc={doc} />
      <SiteFooter />
    </>
  );
}
