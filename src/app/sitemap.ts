import type { MetadataRoute } from "next";
import { LEGAL_DOCS, legalHref } from "@/lib/legal";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap.
 *
 * `output: 'export'` prerenders this to /sitemap.xml at build time — no server
 * involved. Add entries here as real routes appear.
 */
/**
 * Required under `output: 'export'`. Metadata routes default to dynamic
 * evaluation, which has no meaning without a server — the build fails
 * outright unless this is declared.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-07-28"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified: new Date("2026-10-04"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: new Date("2026-09-02"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // The three legal documents, one entry each; their dates are the
    // "Last updated" each one shows (src/lib/legal.ts).
    ...LEGAL_DOCS.map((doc) => ({
      url: `${SITE_URL}${legalHref(doc)}`,
      lastModified: new Date(`${doc.updated} UTC`),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
