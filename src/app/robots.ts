import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Required under `output: 'export'` — see the note in sitemap.ts. */
export const dynamic = "force-static";

/** Prerendered to /robots.txt at build time. */
export default function robots(): MetadataRoute.Robots {
  return {
    // /thank-you is where a buyer lands after paying; it is not content.
    rules: [{ userAgent: "*", allow: "/", disallow: "/thank-you" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
