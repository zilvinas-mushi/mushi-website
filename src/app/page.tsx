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
        {/*
          THE FIELD OWNS THE FIRST SCREEN — min-h-svh from md up.

          Its CONTENT is proportional to the window's WIDTH (--hero-u), so its
          height follows the width: the hero measures about 9.75u, which is
          ~1083 at 1920 and ~940 at 1660. A window is only that tall in the
          same proportion if it is 16:9. Anything squarer — a 1660x1040 laptop,
          a 2560x1440 monitor — leaves the field short of the fold, and what
          fills the gap is the next section's heading peeking in on first load.

          Scaling the hero UP to fill a tall window is the wrong fix: the type
          would pass its drawn size and 1920 is the reference. So the field
          simply never ends above the fold, and the slack goes where the design
          already fades to black — the bottom of the ramp, below the logo
          strip. The hero's own rhythm from the header down is untouched.

          `svh`, not `vh`: on a phone `vh` is the tallest state, which leaves a
          gap under the field while the URL bar is showing. It is md-and-up
          anyway, where the two are the same, so this is only future-proofing
          if the rule ever moves down a breakpoint.
        */}
        <div
          className="hero-bg relative overflow-hidden md:min-h-svh"
          style={{
            marginTop: "calc(var(--header-h) * -1)",
            paddingTop: "var(--header-h)",
          }}
        >
          <div
            aria-hidden="true"
            className="hero-grid pointer-events-none absolute inset-0"
          />
          {/*
            The light sits BEHIND the artwork. One layer, not several: the
            export is the entire lighting group, centre pool included.
            Decorative and inert.

            It was tried on top, at z-4 above HeroPanels and HeroFloaters, which
            is how the group is stacked in Figma — the light there falls across
            the Instagram and TikTok marks rather than behind them. It is the
            more faithful stack and it does give the marks depth, but the price
            is that the vignette's dark corners swallow the very elements the
            hero is selling: the platform icons and the ad panels went nearly
            black wherever they sat away from the centre. Not worth it. If it
            comes back, the light needs a hole cut for the marks (a mask driven
            off their positions) rather than a flat z-bump.
          */}
          <div
            aria-hidden="true"
            className="hero-light pointer-events-none absolute inset-0"
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
