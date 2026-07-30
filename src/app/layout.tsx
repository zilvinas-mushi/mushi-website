import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
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
  weight: ["400", "500", "600", "700"],
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    // Absolute URL: required by CLAUDE.md, and relative OG images are ignored
    // by most crawlers. Dimensions are the file's real size — declaring a
    // 1200x630 that does not exist makes crawlers drop the card.
    //
    // TODO(og): this is the Mushi logo, not a designed share image. It is the
    // only Mushi-owned graphic in the export — every other candidate is a
    // client's screenshot, which must not be published as Mushi's share card.
    // Commission a proper 1200x630 and swap it in here.
    images: [
      {
        url: abs("/images/logo-without-bg-white102.webp"),
        width: 672,
        height: 199,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [abs("/images/logo-without-bg-white102.webp")],
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
      logo: abs("/images/logo-without-bg-white102.webp"),
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
      className={`${poppins.variable} ${dutch801.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg font-sans text-white">
        <script
          type="application/ld+json"
          // Static, build-time constant — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
