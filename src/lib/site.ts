/**
 * Canonical site constants.
 *
 * SITE_URL is the production origin, not the current deploy target. Open Graph
 * images must be absolute URLs (see CLAUDE.md), and a pages.dev URL baked into
 * metadata would leak into shares once the custom domain is attached.
 */
export const SITE_URL = "https://mushi.agency";

export const SITE_NAME = "Mushi";

export const SITE_TAGLINE = "Growth Partner for eCom & AI brands";

export const SITE_DESCRIPTION =
  "Paid ads, banger creatives, landing pages, and strategy - all led by us, under one roof. 110+ brands enhanced their ads with Mushi.";

/** Absolute URL helper — OG tags and JSON-LD both require absolute paths. */
export const abs = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Booking destination for every fit-check CTA.
 *
 * There is no server, so scheduling has to be an external link or embed
 * (CLAUDE.md). Point this at the real scheduler when it exists; every CTA
 * reads from here so it is a one-line change.
 */
export const BOOKING_URL = "#book-a-call";

/**
 * Anchor the booking CTAs land on until BOOKING_URL points at a real
 * scheduler. Without this they target a non-existent #book-a-call and clicking
 * them does nothing.
 */
export const BOOKING_ANCHOR = "book-a-call";

/**
 * Order is the footer's, left to right — Instagram, LinkedIn, TikTok, Facebook
 * (design reference 2026-08-19). layout.tsx also feeds this to the
 * Organization schema's `sameAs`, where order carries no meaning.
 */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/mushi.agency" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mushi-agency" },
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
 * The phone drawer's "Buy now" and "Login" both land there: buying a template
 * and signing in are app concerns, and there is no server here to host either.
 */
export const APP_URL = "https://app.mushi.agency";
export const APP_BUY_URL = `${APP_URL}/templates`;
export const APP_LOGIN_URL = `${APP_URL}/login`;
