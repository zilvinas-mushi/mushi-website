import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap.
 *
 * `output: 'export'` prerenders this to /sitemap.xml at build time — no server
 * involved. Add entries here as real routes appear; the home page is currently
 * the only one.
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
  ];
}
