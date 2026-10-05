import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/Sections";
import { NOT_FOUND } from "@/lib/content";
import { SHELL } from "@/lib/layout";
import { BOOKING_URL } from "@/lib/site";

/**
 * THE 404 (Žilvinas 2026-10-05, on Next's own white-on-black "This page could
 * not be found.": "why is it so bad — make it Mushi-like"). The static export
 * writes this to out/404.html, which Cloudflare Pages serves, with a 404
 * status, for every address the site does not have.
 *
 * IT IS THE HOME HERO'S FIRST SCREEN with different words: the same lit tile
 * field behind the floating header, the eyebrow pill, the headline in the
 * hero's type, the hero's two buttons. Nothing is drawn for it — every class
 * below is the home page's, so it changes when the hero does.
 *
 * Not indexed. The root layout's canonical ("/") is taken off: this page is
 * served at any address, and none of them is the home page.
 */
export const metadata: Metadata = {
  title: NOT_FOUND.title,
  description: NOT_FOUND.sub,
  alternates: {},
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {/* The home page's field, pulled up behind the header the same way.
            A whole screen at every width: there is nothing under this block
            but the footer, and a short field would put it on the first
            screen. */}
        <div
          className="hero-bg relative flex min-h-svh flex-1 flex-col overflow-hidden"
          style={{
            marginTop: "calc(var(--header-h) * -1)",
            paddingTop: "var(--header-h)",
          }}
        >
          <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
          {/* A CSS background and the whole lighting of this screen, so the
              paint gate is told to wait for it — as on the home page. */}
          <div
            aria-hidden="true"
            data-await-bg=""
            className="hero-light pointer-events-none absolute inset-0"
          />
          <section
            aria-labelledby="not-found-heading"
            // Centred in what the header leaves, and lifted by half the
            // header's height so it sits on the SCREEN's centre, not on the
            // centre of the space under the bar.
            className={`${SHELL} relative flex flex-1 flex-col items-center justify-center pb-[calc(var(--header-h)+var(--pu)*28)] pt-[calc(var(--pu)*28)] text-center`}
          >
            {/* The hero's eyebrow pill, measure for measure. */}
            <span className="eyebrow-pill mb-[calc(var(--pu)*28)] inline-flex h-[calc(var(--pu)*34)] items-center justify-center rounded-[3.125rem] px-[calc(var(--pu)*14)] text-[length:calc(var(--pu)*14)] font-medium text-black md:mb-[calc(var(--hero-u)*0.28)] md:h-[calc(var(--hero-w)*0.45)] md:rounded-[calc(var(--hero-w)*0.5)] md:px-[calc(var(--hero-w)*0.28)] md:text-[length:calc(var(--hero-w)*0.2)]">
              {NOT_FOUND.eyebrow}
            </span>
            {/* The only <h1>. The hero's type — Poppins SemiBold, 80/80 at the
                1920 frame — and its authored break. */}
            <h1
              id="not-found-heading"
              className="mx-auto text-[length:min(2rem,calc((100vw-var(--gutter)*2)/11))] font-semibold leading-[1.08] md:text-[length:calc(var(--hero-w)*0.8)] md:leading-[1]"
            >
              {NOT_FOUND.headingLines[0]}
              <br />
              {NOT_FOUND.headingLines[1]}
            </h1>
            <p className="mx-auto mt-3 max-w-[42.5rem] text-[1rem] font-normal leading-[20px] text-white md:mt-[calc(var(--hero-u)*0.24)] md:max-w-none md:text-[length:calc(var(--hero-u)*0.3)] md:leading-[calc(var(--hero-u)*0.4)]">
              {NOT_FOUND.sub}
            </p>
            <div className="mt-[25px] flex items-center justify-center gap-2.5 sm:gap-4 md:mt-[calc(var(--hero-u)*0.4)]">
              <Pill href="/">{NOT_FOUND.primaryCta}</Pill>
              <Pill href={BOOKING_URL} variant="dark">
                {NOT_FOUND.secondaryCta}
              </Pill>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
