import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The payment tests (docs/features/0001-stripe-pricing). Nothing here is part
// of the site: `next build` never reads this file and the export gains nothing
// from it.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // One file at a time. Without a key the Stripe calls go through the CLI,
    // whose session is in one mode at a time for the whole machine; two files
    // in two processes would switch it under each other.
    fileParallelism: false,
    // A Stripe call through the CLI is a process spawn plus a round trip; the
    // test-clock renewals set their own, longer, limit.
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
