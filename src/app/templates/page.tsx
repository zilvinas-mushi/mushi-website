import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PlanSheet } from "@/components/PlanSheet";
import {
  TemplatesAccess,
  TemplatesBgFallbacks,
  TemplatesComparison,
  TemplatesDifference,
  TemplatesFaq,
  TemplatesHero,
  TemplatesInside,
  TemplatesProcess,
  TemplatesShowcase,
  TemplatesTeam,
} from "@/components/TemplateSections";
import { TEMPLATES_PAGE } from "@/lib/content";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_URL, BOOKING_URL, SITE_NAME, SITE_TAGLINE, TEMPLATES_HERO_CTA_ID, TEMPLATES_SCRATCH_CARD_ID, abs } from "@/lib/site";

/**
 * hero-burst-phone.webp, read at BUILD time — this is a server component in
 * a static export, so this runs once on the build machine and the base64
 * lands in the HTML. See the <style> in the head below.
 */
const HERO_BURST_PHONE_B64 = readFileSync(
  join(process.cwd(), "public/images/templates/hero-burst-phone.webp"),
).toString("base64");

const DESCRIPTION =
  "Plug-and-play ad templates from the team behind 110+ brands' creatives. Your 8-minute shortcut to high-ROAS ads — fashion, beauty, food, health and drink niches covered.";

export const metadata: Metadata = {
  title: "Templates",
  description: DESCRIPTION,
  alternates: { canonical: "/templates" },
  openGraph: {
    type: "website",
    url: abs("/templates"),
    siteName: SITE_NAME,
    title: `Templates — ${SITE_NAME}`,
    description: DESCRIPTION,
    locale: "en_US",
    // Same interim share image as the home page — see the TODO(og) in
    // layout.tsx. Swap both together when the designed 1200x630 lands.
    images: [
      {
        url: abs("/images/logo-without-bg-white102.webp"),
        width: 672,
        height: 199,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
};

/**
 * FAQ rich-result schema. The same Q&A pairs the visible accordions render —
 * keep them in sync by construction, both reading TEMPLATES_PAGE.faq.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TEMPLATES_PAGE.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/**
 * /templates — marketing page for the webapp's template library.
 *
 * Built from the supplied screenshot of the Templates design (design/COPY.md
 * "Templates page"); no Figma call was spent. Same wrapper trick as the home
 * page: the dark field and colour burst run behind the floating header via
 * the negative margin, so the page reads as one surface.
 */
export default function Templates() {
  return (
    <>
      {/* THE OVERSCROLL COLOUR, server-rendered. The canvas — the band iOS
          drags in past the top — is `body`'s background (see the canvas note
          in globals.css), and its default is sampled from the HOME hero's lit
          violet first rows. This page opens on black.

          A <style> in the page rather than the effect this started as: an
          effect only lands after hydration, so a refresh painted the violet
          first and you could catch it by pulling down immediately. A style
          tag renders with the route and leaves with it. */}
      <style
        dangerouslySetInnerHTML={{ __html: "body{--canvas-top:#000000}" }}
      />
      {/* THE FIRST SCREEN'S FOUR FILES, DISCOVERABLE IN THE HTML.
          React hoists these into <head>, so they are on the wire while the
          stylesheet is still parsing rather than after it.

          The burst is the LCP element and it is a CSS BACKGROUND: nothing
          points at it until the 20 KB stylesheet has been fetched and parsed,
          which Lighthouse reports as "request is not discoverable in the
          initial document" and which costs the whole width of that hop. The
          device beside it is the other half of the same screen and the paint
          gate waits on both.

          `media` on every one of them, because the phone and the desktop draw
          DIFFERENT artwork: an unconditional preload would hand each device
          the other's files at high priority — the mistake that was already
          costing the phone 397 KB before the hero became one <picture>. A
          preload whose media does not match is never fetched.

          Keep these four in step with .tpl-bg (globals.css) and with the
          hero <picture> (TemplateSections). A preload for a file nothing
          then uses is a warning in the console and pure waste on the wire. */}
      {/* THE PHONE BURST IS INLINE (2026-09-25). It is the phone's Largest
          Contentful Paint element — the angular field behind the hero — and
          as a 15 KB file it was landing after everything else in flight, so
          PageSpeed simulated its paint at 3.6–3.9s on a page whose first
          screen was otherwise ready at 1.2. As a data URI in this <style> it
          arrives with the document: no request, nothing to wait for, and the
          gate skips data: URLs. 20 KB of base64 on this page's HTML only —
          not on the home page, which is why it is here and not in
          globals.css. The rule sets background-image alone, so the position
          and size stay the ones globals.css measured off the artboard; the
          desktop keeps its own file and preload below. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media (max-width:767px){.tpl-bg{background-image:url("data:image/webp;base64,${HERO_BURST_PHONE_B64}")}}`,
        }}
      />
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-burst.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      {/* The same srcset the <img> carries, or the browser would preload one
          file and then fetch the other. */}
      <link
        rel="preload"
        as="image"
        imageSrcSet="/images/templates/hero-phone-sm.webp 538w, /images/templates/hero-phone.webp 807w"
        imageSizes="269px"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/templates/hero-macbook.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <SiteHeader
        cta={{ label: TEMPLATES_PAGE.login, href: APP_URL, variant: "light" }}
        // The header CTA turns into the purple Buy Now the moment the
        // visitor reaches the Difference section (Žilvinas 2026-09-25 —
        // previously it ramped from Difference to Process, so it was still
        // half Login through the whole comparison). start and end name the
        // SAME section: HeaderCtaSwap treats that as a toggle at the
        // viewport's midline and slides between the faces, in both
        // directions.
        ctaSwap={{
          to: {
            label: TEMPLATES_PAGE.access.templates.cta,
            href: APP_URL,
            variant: "purple",
            // Opens the plan sheet, like every other Buy Now (Žilvinas
            // 2026-09-25 — it used to leave for the webapp on desktop).
            sheet: true,
          },
          startId: "difference-heading",
          endId: "difference-heading",
        }}
        // The phone bar's sliding offer. It rides out as the hero's own CTA
        // goes under the bar, and back up as the "Ad creation from scratch"
        // card reaches it. Home's 52 box, with no stroke (Žilvinas
        // 2026-09-11) — the design's 45 read as a different button from the
        // Schedule a Call it stands in for. 20px label per the design.
        mobileCta={{
          label: TEMPLATES_PAGE.mobileCta,
          href: APP_URL,
          fromId: TEMPLATES_HERO_CTA_ID,
          untilId: TEMPLATES_SCRATCH_CARD_ID,
          untilAtButton: true,
          // Back out at "Note from The Team" (Žilvinas 2026-09-11), and out
          // from there to the footer. The heading's own id, set in
          // TemplateSections — rename one, rename both.
          againId: "team-heading",
          labelPx: 20,
          radiusPx: 5,
          sheet: true,
        }}
        // The phone DRAWER, /templates only (Žilvinas 2026-09-25): under the
        // nav rows a half-and-half Buy Now / Login into the webapp, then a
        // full-width Book an Agency Call. Home keeps its single Schedule a
        // Call and the desktop bar is untouched.
        mobileDrawer={{
          primary: { label: TEMPLATES_PAGE.access.templates.cta, href: APP_URL, sheet: true },
          secondary: { label: TEMPLATES_PAGE.login, href: APP_URL },
          wide: { label: TEMPLATES_PAGE.agencyCall, href: BOOKING_URL },
        }}
        active="/templates"
      />
      {/* The <noscript> rules for this page's deferred background artwork —
          see TemplatesBgFallbacks. Nothing renders with JavaScript on. */}
      <TemplatesBgFallbacks />
      {/* The Pick-your-plan sheet, every width; every data-plan link opens it. */}
      <PlanSheet />
      <main className="flex-1">
        {/* EXACTLY ONE SCREEN from md up (Žilvinas 2026-09-19): h-[100svh]
            and a flex column, so the hero ends on the fold on every desktop
            — Air, Pro, an external display, Arc with its sidebar — and the
            next section's black never shows above it. The device inside
            sizes itself to the height left under the text (AppWindow). The
            720 floor is for windows too short to hold the hero at all; there
            it scrolls rather than shrinking the device to a stamp. */}
        {/* data-await-bg: the burst is a CSS background and it IS this page's
            first screen, so the paint gate holds until it has decoded. Same
            reasoning as .hero-light on the home page. */}
        <div
          data-await-bg=""
          // The pull-up under the header is --header-h from md up, as on the
          // home page: the desktop bar is 63 in flow at 1512, not the phone
          // header's 82, and the 19px difference had the hero's box starting
          // above the page — which came out of its bottom edge.
          className="tpl-bg relative -mt-[82px] overflow-hidden pt-[82px] md:-mt-[var(--header-h)] md:flex md:h-[100svh] md:min-h-[720px] md:flex-col md:pt-[var(--header-h)]"
        >
          <TemplatesHero />
        </div>

        <TemplatesDifference />
        <TemplatesProcess />
        <TemplatesInside />
        <TemplatesShowcase />
        <TemplatesAccess />
        <TemplatesComparison />
        <TemplatesTeam />
        <TemplatesFaq />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Static, build-time constant — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
