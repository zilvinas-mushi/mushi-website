import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CanvasTint } from "@/components/CanvasTint";
import { PaintGate } from "@/components/PaintGate";
import { PAINT_GATE_SCRIPT } from "@/lib/paint-gate-script";
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
  // NOT preloaded. next/font emits its `<link rel="preload" as="font">` tags
  // at the very top of the head, so on a bandwidth-limited connection the
  // fonts take the pipe ahead of everything the first screen is actually
  // waiting on. That used to be the stylesheet (measured on the live site
  // over Slow 4G: five Poppins subsets and Dutch801 ran 636ms to ~1940ms
  // while the render-blocking CSS did not land until 2073ms, FCP 2275ms).
  // The CSS is inlined now (next.config.ts), so the thing they would now
  // queue in front of is the hero artwork — and measured both ways, over
  // real Slow-4G throttling, preloading them changed neither page's score.
  //
  // With the CSS in the HTML the faces are discovered as soon as the document
  // is parsed anyway, so there is no hop left to save.
  preload: false,
});

/**
 * Inter Bold — ONLY the /templates hero category-tile labels. The artboard's
 * own face (Žilvinas 2026-09-19, off the Figma inspector: Inter Bold 25,
 * 0% letter spacing), replacing the Roboto Black that had been matched by
 * eye against a PNG sample. Single weight.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  // Decorative labels on one page, hidden below lg — same reasoning as the
  // other faces: never ahead of the stylesheet.
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
  // Not preloaded, for the reason set out on Poppins above.
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
    // size that does not exist makes crawlers drop the card.
    //
    // JPEG, not the WebP the rest of the site uses: LinkedIn and iMessage
    // still refuse WebP share cards and fall back to no image at all.
    images: [
      {
        url: abs(OG_IMAGE),
        width: 2400,
        height: 1260,
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
      className={`${poppins.variable} ${dutch801.variable} ${satoshi.variable} ${inter.variable} h-full antialiased`}
    >
      {/*
        NO BACKGROUND ON `body` — it is set in globals.css, and it is not the
        page's colour. It is the colour iOS stretches into view when you
        rubber-band past an end, and CanvasTint moves it as you scroll. The
        page's own black is on the wrapper below, which is opaque and covers
        the whole document, so body's is never seen except in the overscroll.
      */}
      <body className="min-h-full flex flex-col font-sans text-white">
        {/* THE PAINT GATE'S ENGINE, first thing in the document and inline.
            It has to run before React exists: gated behind hydration it could
            not start until ~370 KB of bundle had landed, which on a Slow-4G
            phone is most of the page's Largest Contentful Paint. Under a
            kilobyte, build-time constant, no user input. See
            src/lib/paint-gate-script.ts. */}
        <script dangerouslySetInnerHTML={{ __html: PAINT_GATE_SCRIPT }} />
        <script
          type="application/ld+json"
          // Static, build-time constant — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/*
          NOTHING PAINTS HALF-BUILT. The paint gate's veil (below the shell)
          covers the page in its own black until <html> carries `data-ready`,
          then fades out over the finished first screen. So the first thing a
          visitor sees is either the finished first screen or an empty black
          page — never the site mid-assembly. See PaintGate.tsx and the gate
          block in globals.css.

          The <noscript> below is the escape hatch, and it is a <style> rather
          than anything conditional because there is no server here to decide:
          with JavaScript off nothing will ever set `data-ready`, so the page
          would stay hidden forever. This reveals it immediately instead, which
          is exactly the behaviour the site had before the gate existed.
        */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".paint-veil{display:none!important}",
            }}
          />
        </noscript>
        {/* flex-1 and the same column as body, so `main`'s own flex-1 still
            pushes the footer to the bottom on a short page. */}
        {/* The gate's veil: the page's black over the finished-or-not first
            screen, fading out once <html> carries data-ready. See the gate
            block in globals.css for why it is a cover and not a fade-in.
            FIRST IN THE BODY, before the shell: on a slow connection the
            parser paints what it has as it goes, and a veil that came after
            the content would arrive after the content had shown. It is
            position: fixed, so its place in the DOM costs nothing. */}
        <div className="paint-veil" aria-hidden="true" />
        <div className="page-shell flex min-h-full flex-1 flex-col bg-bg">
          {children}
        </div>
        <PaintGate />
        <CanvasTint />
      </body>
    </html>
  );
}
