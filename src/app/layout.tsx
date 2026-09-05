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
  src: "./fonts/Dutch801-Roman.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
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
