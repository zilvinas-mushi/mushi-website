import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export -> emits `out/`. There is no server in production.
  output: "export",
  images: {
    // next/image optimization requires a server; disable it for static export.
    unoptimized: true,
  },
  experimental: {
    /* THE STYLESHEET TRAVELS WITH THE HTML. It is render-blocking by
       definition and it is 20 KB over the wire, so as a <link> it costs a
       whole extra round trip before anything can paint — Lighthouse put that
       at 150ms on the desktop and 450ms on a Slow-4G phone, and every font
       the page uses is discovered only once it has parsed, which puts that
       hop in front of them too.

       Inlined, the styles arrive with the document. The trade the flag's own
       docs name is caching for repeat visitors, and it is the right way round
       here: this is a marketing site whose visitors arrive once, from an ad,
       on a phone. */
    inlineCss: true,
  },
};

export default nextConfig;
