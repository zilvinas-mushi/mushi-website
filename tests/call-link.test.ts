/**
 * THE SITE'S OWN ADDRESS FOR A CALL (Žilvinas 2026-10-07): the FAQ says
 * "www.mushi.agency/call" and links to /call, which Cloudflare sends on to the
 * scheduler. The copy, the link and the redirect are held together here.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TEMPLATES_PAGE } from "@/lib/content";
import { BOOKING_URL, CALL_ADDRESS, CALL_PATH } from "@/lib/site";

describe("the call address", () => {
  it("is the one the FAQ answer gives, and the old /schedule is gone", () => {
    const answers = TEMPLATES_PAGE.faq.items.map((item) => item.a).join("\n");
    expect(answers).toContain(`book a call with us here: ${CALL_ADDRESS}.`);
    expect(answers).not.toContain("/schedule");
    expect(CALL_ADDRESS).toBe(`www.mushi.agency${CALL_PATH}`);
  });

  it("is a link in the answer, to the site's own path", () => {
    const sections = readFileSync("src/components/TemplateSections.tsx", "utf8");
    expect(sections).toContain("{linkedAnswer(item.a)}");
    expect(sections).toContain("<a href={CALL_PATH}");
  });

  it("is sent on to the scheduler by Cloudflare, temporarily", () => {
    const redirects = readFileSync("public/_redirects", "utf8");
    expect(redirects).toMatch(new RegExp(`^${CALL_PATH}\\s+${BOOKING_URL.replace(/[.\\/]/g, "\\$&")}\\s+302$`, "m"));
  });
});
