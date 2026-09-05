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
 * The templates product lives in the separate webapp (see CLAUDE.md —
 * nothing is shared with it, we only link out). Both the /templates page CTA
 * and its header "Login" button point here.
 */
export const APP_URL = "https://app.mushi.agency";

/** Order matters: the footer's icon discs render in this sequence. */
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/mushi.agency" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mushi-agency" },
  { label: "TikTok", href: "https://www.tiktok.com/@mushi.agency" },
  { label: "Facebook", href: "https://www.facebook.com/mushi.agency" },
] as const;
