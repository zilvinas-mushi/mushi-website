/**
 * EVERY LINK OPENS IN THE TAB IT WAS PRESSED IN (Noah 2026-10-20). The
 * calendar links opened a new tab from 2026-10-10 to 2026-10-23; the helper
 * that decided it stays spread on every anchor that can carry the booking
 * URL, so the decision is one line in site.ts either way. Held two ways: the
 * helper opens nothing in a new tab, and every such anchor still spreads it.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BOOKING_URL, CALL_PATH, bookingTarget } from "@/lib/site";

describe("links that open the calendar", () => {
  it("open in the same tab, like every other link", () => {
    expect(bookingTarget(BOOKING_URL)).toEqual({});
    expect(bookingTarget(CALL_PATH)).toEqual({});
    expect(bookingTarget("/")).toEqual({});
    expect(bookingTarget("/templates")).toEqual({});
    expect(bookingTarget(undefined)).toEqual({});
  });

  it("every anchor that can carry the booking URL spreads the helper", () => {
    const files = [
      "src/components/shared/ArrowDisc.tsx",
      "src/components/home/HomeSections.tsx",
      "src/components/layout/SiteHeader.tsx",
      "src/components/layout/HeaderCtaSwap.tsx",
      "src/components/layout/MobileHeader.tsx",
      "src/components/layout/SiteFooter.tsx",
      "src/components/case-studies/CaseStudyDetail.tsx",
      "src/components/case-studies/CaseStudySections.tsx",
      "src/components/templates/TemplateSections.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      // Each <a href={X} …> whose X is the booking URL, /call, the Pill's
      // href, or a CTA prop that may hold it, has {...bookingTarget(X)}
      // right after it. Nav rows (item.href) are the site's own routes.
      const anchors = [...source.matchAll(/<a\s+href=\{([^}]+)\}([^>]*)>/g)];
      const risky = anchors.filter(([, href]) =>
        /BOOKING_URL|CALL_PATH|^(cta\??|to|from|drawer\.wide)\.href\b/.test(href.trim()) ||
        // The Pill's own href: the hero and the 404 hand it the booking URL.
        (href.trim() === "href" && file === "src/components/shared/ArrowDisc.tsx"),
      );
      expect(risky.length, `${file} has no booking anchors to check`).toBeGreaterThan(0);
      for (const [whole, href, rest] of risky) {
        expect(rest, `${file}: ${whole.slice(0, 80)}`).toContain(`{...bookingTarget(${href.trim()})}`);
      }
    }
  });
});
