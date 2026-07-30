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
        <Hero />
        <SocialProof />
        <Creatives />
        <CaseStudies />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
