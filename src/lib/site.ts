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
 * The hero eyebrow, verbatim. Nothing in metadata reads this any more — the
 * <title> and the OG title are SITE_TITLE below. Revised with the rest of the
 * hero on 2026-08-26; it read "Growth Partner for eCom & AI brands".
 */
export const SITE_TAGLINE = "Creative Partner for eCom & AI brands";

/**
 * The <title> and OG title, WHOLE — not a fragment something else prefixes
 * with the brand. It leads with the search term and puts "Mushi" last after a
 * pipe, which is the shape a result gets clicked in: the promise is read
 * first, the name is what it is attributed to. Set 2026-08-30, replacing
 * `${SITE_NAME} — ${SITE_TAGLINE}`.
 *
 * The dollar figures are the qualifier, so leave them as digits — "one to a
 * hundred million" reads as prose and stops scanning.
 */
export const SITE_TITLE = "Premium Ads for $1M to $100M Brands | Mushi";

/**
 * The share card and the tab icon, both cropped from one 3000x3000 master:
 * the wordmark in white on the brand's purple gradient.
 *
 * TWO exports of the same picture. Crawlers letterbox or centre-crop whatever
 * they are given, and a card is the one place the mark should not be guessed
 * at, so the 1.91:1 that Slack, X, Facebook and LinkedIn all render is cut
 * here rather than by them. The square is second — iMessage and WhatsApp
 * prefer it, and a client that wants 1:1 takes the one that already is.
 */
export const OG_IMAGE = "/images/og-mushi-wide.jpg";
export const OG_IMAGE_SQUARE = "/images/og-mushi.jpg";

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
 * DOM id on the final card's "15 Minute Fit-Check" pill.
 *
 * The other end of the same contract as CREATIVES_CTA_ID: the "Yes" pill
 * leaving the top of the screen is what BRINGS the phone header's Schedule a
 * Call button down, and this pill arriving from the bottom is what sends it
 * back up. Past this point the page is already asking for the booking in a
 * 60-tall pill of its own, and a second identical CTA stuck to the top of the
 * screen is asking twice.
 */
export const FINAL_CTA_ID = "final-fit-check";

/**
 * DOM id on the footer's plate.
 *
 * Another contract between components that never import each other:
 * SiteFooter puts it on the `<footer>` and CanvasTint watches for it to come
 * on screen, which is what turns the rubber-band colour from black to the
 * plate's own grey. See CanvasTint for why that cannot be CSS.
 */
export const FOOTER_PLATE_ID = "footer-plate";

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
