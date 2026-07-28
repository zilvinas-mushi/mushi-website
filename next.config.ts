import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export -> emits `out/`. There is no server in production.
  output: "export",
  images: {
    // next/image optimization requires a server; disable it for static export.
    unoptimized: true,
  },
};

export default nextConfig;
