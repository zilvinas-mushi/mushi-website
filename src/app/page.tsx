import { SiteHeader } from "@/components/SiteHeader";
import { HeroPanels } from "@/components/HeroPanels";
import { HeroFloaters } from "@/components/HeroFloaters";
import {
  Hero,
  SocialProof,
  Creatives,
  CaseStudies,
  Testimonials,
  FinalCta,
} from "@/components/Sections";

/**
 * Home page.
 *
 * Structure follows design/SECTIONS.md rather than the Figma export: the
 * frame has no auto-layout, so Figma emitted absolutely-positioned pixels
 * with no landmarks. This is the semantic equivalent.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/*
          One violet field covering the hero and brand strip, pulled up behind
          the sticky header so the page reads as a single surface. The header
          is a floating bar with no background of its own; previously each
          section declared its own gradient and the mismatches showed as seams.

          The negative margin equals the header's height, and the matching
          padding puts the content back where it belongs.

          Both come from --header-h (globals.css) rather than a literal. This
          was hardcoded to 82px, which matched the old 74px-tall bar; once the
          bar grew to the design's 100 the field started 18px down the page and
          the shortfall showed as a black band across the top. Anything pinned
          to the header's height has to move with it.
        */}
        <div
          className="hero-bg relative overflow-hidden"
          style={{
            marginTop: "calc(var(--header-h) * -1)",
            paddingTop: "var(--header-h)",
          }}
        >
          <div
            aria-hidden="true"
            className="hero-grid pointer-events-none absolute inset-0"
          />
          {/* The centre light, over the tiles. Unmasked, so it does not pick up
              the grid's bottom fade. */}
          <div
            aria-hidden="true"
            className="hero-light pointer-events-none absolute inset-0"
          />
          {/* The broad top-left source, over the vignette so it can add light
              back. See .hero-glow — it must stay below .hero-rays. */}
          <div
            aria-hidden="true"
            className="hero-glow pointer-events-none absolute inset-0"
          />
          {/* Light-streak burst, over the tiles so it lights them rather than
              sitting behind. Decorative only. */}
          <div
            aria-hidden="true"
            className="hero-rays pointer-events-none absolute inset-0"
          />
          <HeroPanels />
          {/* Mounted against the whole field, not the hero section: the lower
              two tiles sit below the section's bottom edge. */}
          <HeroFloaters />
          <Hero />
          <SocialProof />
        </div>

        <Creatives />
        <CaseStudies />
        <Testimonials />
        <FinalCta />
      </main>
      {/* Footer intentionally removed — a new one is being designed. The
          SiteFooter component stays in the repo for when it returns. */}
    </>
  );
}
