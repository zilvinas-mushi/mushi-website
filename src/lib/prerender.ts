/**
 * THE WEBAPP'S LOGIN PAGE IS DRAWN BEFORE IT IS ASKED FOR (Žilvinas
 * 2026-10-10, "there shouldn't be any loading when one pressed log in").
 * Login leaves this site for app.mushi.agency, and a leave is a load: the
 * bounce from "/" to /login, the webapp's own render, its fonts — a third
 * of a second on a good line and more on a cold one, during which the
 * visitor looks at this page with the browser's spinner going.
 *
 * So the browser is asked to render that page AHEAD, in the background,
 * with speculation rules: on a desktop while the pointer rests on a Login
 * button (the document rule in layout.tsx, "moderate": 200ms of hover, or
 * a press), and on a phone the moment the drawer opens (the rule this
 * module adds, "immediate"), because a finger's tap gives no warning. The
 * click then only swaps the drawn page in. The webapp says it may be
 * rendered this way (its Supports-Loading-Mode header on the login page
 * and the bounce to it); a browser without speculation rules, or a
 * visitor the webapp knows and sends to their dashboard instead, simply
 * loads the page on the click as before.
 *
 * Buy buttons link to the webapp too and are left out ([data-plan]): they
 * open the plan sheet, not the webapp.
 */
import { APP_URL } from "@/lib/site";

/**
 * The rule in the document, for a pointer resting on a Login button. PREFETCH
 * AS WELL AS PRERENDER: a prerender is refused in more places than a fetch
 * — a low-end device, memory pressure, Data Saver, DevTools open — and
 * Chrome does not fall back on its own. The prefetch rule has the page's
 * bytes here either way, so the click starts from a document already in
 * hand (seen 2026-10-10: under DevTools the prerender was refused and the
 * click used the prefetched response, PrefetchResponseUsed).
 */
const LOGIN_LINKS = {
  source: "document",
  where: { and: [{ href_matches: `${APP_URL}/*` }, { not: { selector_matches: "[data-plan]" } }] },
  eagerness: "moderate",
} as const;
export const LOGIN_SPECULATION_RULES = { prefetch: [LOGIN_LINKS], prerender: [LOGIN_LINKS] } as const;

let asked = false;

/** Render the login page now — the drawer is open, and Login is one tap away. */
export function prerenderLogin(): void {
  if (asked || typeof document === "undefined" || !HTMLScriptElement.supports?.("speculationrules")) return;
  asked = true;
  const rules = document.createElement("script");
  rules.type = "speculationrules";
  const now = { urls: [`${APP_URL}/`], eagerness: "immediate" };
  rules.textContent = JSON.stringify({ prefetch: [now], prerender: [now] });
  document.head.appendChild(rules);
}
