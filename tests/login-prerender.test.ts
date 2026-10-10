/**
 * LOGIN IS INSTANT (Žilvinas 2026-10-10, "there shouldn't be any loading
 * when one pressed log in"): the webapp's login page is rendered ahead by
 * the browser — on a desktop while the pointer rests on Login, on a phone
 * when the drawer opens — so the click only swaps it in. See
 * src/lib/prerender.ts; the webapp's side is its Supports-Loading-Mode
 * header (mushi-app, lib/supabase/proxy.ts).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGIN_SPECULATION_RULES } from "@/lib/prerender";
import { APP_URL } from "@/lib/site";

const read = (path: string) => readFileSync(path, "utf8");

describe("the login page is rendered ahead", () => {
  it("is asked for in every page's document, for a pointer resting on a Login button and no Buy button", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain('<link rel="preconnect" href={APP_URL} />');
    expect(layout).toContain('<script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOGIN_SPECULATION_RULES) }} />');
    const links = {
      source: "document",
      where: { and: [{ href_matches: `${APP_URL}/*` }, { not: { selector_matches: "[data-plan]" } }] },
      eagerness: "moderate",
    };
    // Prefetch as well as prerender: the fetch runs where a prerender is refused.
    expect(LOGIN_SPECULATION_RULES).toEqual({ prefetch: [links], prerender: [links] });
  });

  it("is asked for the moment the phone's drawer opens, since a tap gives no warning", () => {
    const header = read("src/components/MobileHeader.tsx");
    expect(header).toContain("if (!open) prerenderLogin();");
    const lib = read("src/lib/prerender.ts");
    expect(lib).toContain('rules.type = "speculationrules";');
    expect(lib).toContain("const now = { urls: [`${APP_URL}/`], eagerness: \"immediate\" };");
    expect(lib).toContain("JSON.stringify({ prefetch: [now], prerender: [now] })");
    // Once, and only where the browser knows the rules.
    expect(lib).toContain('if (asked || typeof document === "undefined" || !HTMLScriptElement.supports?.("speculationrules")) return;');
  });
});
