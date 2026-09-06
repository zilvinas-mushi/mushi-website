import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CanvasTint } from "@/components/CanvasTint";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TITLE,
  OG_IMAGE,
  OG_IMAGE_SQUARE,
  SOCIALS,
  abs,
} from "@/lib/site";

/**
 * Poppins is the entire site face — body, UI, and every heading including the
 * 80px hero. next/font self-hosts it at build time, so the static export makes
 * no runtime request to Google.
 *
 * Wonderkids appears in the Figma file but is the client Holo's brand font,
 * not ours. See design/TOKENS.md.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  // 300 is here for the testimonial meta line, which the design sets in Light.
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  // NOT preloaded, and this is the single biggest thing on the phone's clock.
  //
  // next/font emits its `<link rel="preload" as="font">` tags BEFORE the
  // stylesheet link in the head, so on a bandwidth-limited connection the
  // fonts get the pipe first. Measured on the live site over Slow 4G: five
  // Poppins subsets and Dutch801 started at 636ms and finished between 1898
  // and 1945ms, and the 16 KB stylesheet — which blocks rendering, and which
  // every one of those font files is only useful AFTER — did not land until
  // after 2073ms. First Contentful Paint was 2275ms on a page whose HTML had
  // arrived at 745ms. The hero sat black for a second and a half waiting for
  // fonts to get out of the way of the CSS.
  //
  // Dropping the preload costs the fonts one hop: they are discovered when
  // the stylesheet parses instead of when the HTML does. `display: "swap"`
  // plus next/font's metric-matched fallback means the headline paints on
  // time either way and swaps without moving, so the hop is invisible and
  // the stylesheet arrives about 1.3s sooner.
  preload: false,
});

/**
 * Serif display face for the "Mushi" wordmark — Dutch801 Rm WGL4 BT (Roman).
 * Same file and setup as the mushi-app webapp, so the mark is identical
 * across both properties. Single weight, so never apply font-bold to it:
 * the browser would synthesise a faux bold.
 *
 * NOTE: Dutch801 is a licensed Bitstream face. It is already in use on
 * app.mushi.agency; confirm the licence covers this second public domain.
 */
const dutch801 = localFont({
  variable: "--font-dutch801",
  // woff2, subset to Basic Latin: the supplied master is a 121 KB TTF, and it
  // is preloaded (it draws the wordmark in the header), so it was 72 KB on the
  // wire ahead of the first paint. The wordmark needs five glyphs; the subset
  // keeps all of ASCII and still lands at 15 KB. Regenerate with
  // `python3 -m fontTools.subset src/app/fonts/Dutch801-Roman.ttf
  //  --unicodes="U+0020-007E,U+00A0" --layout-features='*' --flavor=woff2
  //  --output-file=src/app/fonts/Dutch801-Roman.woff2` if the master changes.
  src: "./fonts/Dutch801-Roman.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  // Same reason as Poppins above: 15 KB of wordmark is not worth going ahead
  // of the stylesheet the whole page is blocked on.
  preload: false,
});

/**
 * Satoshi Variable — used ONLY for the Konvert competitor wordmark in the
 * /templates Difference section, per its Figma spec. Fontshare's free ITF
 * license; self-hosted so the static export makes no runtime request.
 */
const satoshi = localFont({
  variable: "--font-satoshi-v",
  src: "./fonts/Satoshi-Variable.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  // Declared here because the variable belongs on <html>, but it draws ONE
  // wordmark on /templates and nothing at all on the home page — where
  // next/font's default preload still put 42 KB of it on the wire at high
  // priority, ahead of the stylesheet the hero's headline is blocked on.
  // Without the preload it is fetched from the @font-face rule, on the page
  // that actually uses it.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // SITE_TITLE already ends in "| Mushi", so the template has to match its
    // separator — a page title reading "Pricing — Mushi" next to a home title
    // reading "... | Mushi" looks like two different sites.
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    // Absolute URL: required by CLAUDE.md, and relative OG images are ignored
    // by most crawlers. Dimensions are each file's real size — declaring a
    // 1200x630 that does not exist makes crawlers drop the card.
    //
    // JPEG, not the WebP the rest of the site uses: LinkedIn and iMessage
    // still refuse WebP share cards and fall back to no image at all.
    images: [
      {
        url: abs(OG_IMAGE),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
      {
        url: abs(OG_IMAGE_SQUARE),
        width: 1200,
        height: 1200,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // The wide crop only. X centre-crops a square to 1.91:1 itself, and it
    // does it without knowing where the wordmark sits.
    images: [abs(OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** Organization + WebSite schema, required by CLAUDE.md. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: abs(OG_IMAGE_SQUARE),
      sameAs: SOCIALS.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${dutch801.variable} ${satoshi.variable} h-full antialiased`}
    >
      {/*
        NO BACKGROUND ON `body` — it is set in globals.css, and it is not the
        page's colour. It is the colour iOS stretches into view when you
        rubber-band past an end, and CanvasTint moves it as you scroll. The
        page's own black is on the wrapper below, which is opaque and covers
        the whole document, so body's is never seen except in the overscroll.
      */}
      <body className="min-h-full flex flex-col font-sans text-white">
        <script
          type="application/ld+json"
          // Static, build-time constant — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* flex-1 and the same column as body, so `main`'s own flex-1 still
            pushes the footer to the bottom on a short page. */}
        <div className="flex min-h-full flex-1 flex-col bg-bg">{children}</div>
        <CanvasTint />
      </body>
    </html>
  );
}
