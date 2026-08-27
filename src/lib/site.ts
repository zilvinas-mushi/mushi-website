/**
 * Canonical site constants.
 *
 * SITE_URL is the production origin, not the current deploy target. Open Graph
 * images must be absolute URLs (see CLAUDE.md), and a pages.dev URL baked into
 * metadata would leak into shares once the custom domain is attached.
 */
export const SITE_URL = "https://mushi.agency";

export const SITE_NAME = "Mushi";

/**
 * The hero eyebrow, verbatim — it is the <title>'s second half and the OG
 * title, so the two have to say the same thing. Revised with the rest of the
 * hero on 2026-08-26; it read "Growth Partner for eCom & AI brands".
 */
export const SITE_TAGLINE = "Creative Partner for eCom & AI brands";

/**
 * The hero sub plus the social-proof line, which is what a search result and a
 * share card should read as. Revised 2026-08-26 with the hero copy.
 */
export const SITE_DESCRIPTION =
  "Weekly research, scripting, creator sourcing, editing, and angle testing for Meta, TikTok, and YouTube ads. 110+ brands enhanced their ads with Mushi.";

/** Absolute URL helper — OG tags and JSON-LD both require absolute paths. */
export const abs = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Booking destination for every fit-check CTA.
 *
 * There is no server, so scheduling has to be an external link or embed
 * (CLAUDE.md). This is the real scheduler — iClosed's "Introduction Call", 30
 * minutes — and every CTA on the site reads from here: the header's Book a
 * Call, the hero's fit-check, the creatives "Yes", the final card's pill and
 * the footer's Redeem. One line changes all of them.
 */
export const BOOKING_URL = "https://app.iclosed.io/e/mushi/introduction";

/**
 * Anchor the booking CTAs land on until BOOKING_URL points at a real
 * scheduler. Without this they target a non-existent #book-a-call and clicking
 * them does nothing.
 */
export const BOOKING_ANCHOR = "book-a-call";

/**
 * DOM id on the creatives section's "Yes" pill.
 *
 * A CONSTANT rather than a literal in two files because it is a contract
 * between components that never import each other: Sections.tsx puts it on the
 * pill and MobileHeader.tsx watches for it to leave the top of the screen,
 * which is what reveals the phone header's Schedule a Call button. A typo on
 * either side is a button that silently never appears.
 */
export const CREATIVES_CTA_ID = "creatives-yes";

/**
 * Order is the footer's, left to right — Instagram, LinkedIn, TikTok, Facebook
 * (design reference 2026-08-19). layout.tsx also feeds this to the
 * Organization schema's `sameAs`, where order carries no meaning.
 */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/mushi.agency" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mushiagency/" },
  { label: "TikTok", href: "https://www.tiktok.com/@mushi.agency" },
  { label: "Facebook", href: "https://www.facebook.com/mushi.agency" },
] as const;

/** The address in the footer's CONTACT column. */
export const CONTACT_EMAIL = "support@mushi.agency";

/**
 * Where the footer's "mystery gift" capture posts.
 *
 * There is no server (CLAUDE.md), so this must be an email provider's own
 * hosted form endpoint — Mailchimp, ConvertKit, Beehiiv, Loops. Until one is
 * chosen this stays null and the footer renders the same control as a link to
 * the booking anchor instead of a submit button, so nobody can type an address
 * into a form that would silently drop it. Set the URL and it becomes a real
 * POST with no other change. See design/SECTIONS.md.
 */
export const NEWSLETTER_ACTION: string | null = null;

/**
 * The webapp. It is a separate repo (CLAUDE.md) — this site only links to it.
 *
 * NOTHING LINKS HERE RIGHT NOW. The phone drawer's "Buy now" and "Login" rows
 * were the only two consumers and the 2026-08-26 redesign drops both — the
 * drawer is the three nav rows and Schedule a Call, nothing else. Kept
 * exported rather than deleted: the URLs are the answer to "where does the app
 * live", and re-deriving them is the expensive half of putting either row
 * back.
 */
export const APP_URL = "https://app.mushi.agency";
export const APP_BUY_URL = `${APP_URL}/templates`;
export const APP_LOGIN_URL = `${APP_URL}/login`;
