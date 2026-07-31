import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
        */}
        <div className="hero-bg relative -mt-[82px] overflow-hidden pt-[82px]">
          <div
            aria-hidden="true"
            className="hero-grid pointer-events-none absolute inset-0"
          />
          {/* Light-streak burst, over the tiles so it lights them rather than
              sitting behind. Decorative only. */}
          <div
            aria-hidden="true"
            className="hero-rays pointer-events-none absolute inset-0"
          />
          <Hero />
          <SocialProof />
        </div>

        <Creatives />
        <CaseStudies />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
