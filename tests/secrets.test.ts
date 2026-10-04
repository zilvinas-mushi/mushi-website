/**
 * Layer A — no Stripe secret is in the repository.
 *
 * A committed key is the commonest way a payment account is taken over, and
 * this repo is public. Every file git would track is scanned for anything
 * shaped like a secret key, a restricted key or a webhook signing secret.
 * Publishable keys (`pk_…`) are meant to be public and are not matched.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Built from pieces so that this file is not itself a match. No word boundary
// in front: `MY_sk_live_…` and `%20sk_live_…` are leaks too.
const SECRET = new RegExp(`(?:(?:sk|rk)_(?:org_)?(?:test|live)|whsec)_[A-Za-z0-9]{10,}`);

const BINARY = /\.(?:webp|png|jpe?g|gif|avif|ico|woff2?|ttf|otf|mp4|webm|mov|pdf|zip|gz)$/i;

/** Tracked files plus new ones not yet committed — everything a `git add -A` would take. */
function candidateFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\0").filter((f) => f && !BINARY.test(f));
}

function isFile(path: string): boolean {
  // A tracked file deleted in the working tree is still listed by git.
  return statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;
}

describe("Stripe secrets", () => {
  it("the scan recognises each kind of secret it is looking for", () => {
    const tail = "A1b2C3d4E5f6G7h8";
    for (const prefix of ["sk_live_", "sk_test_", "rk_live_", "rk_test_", "sk_org_live_", "whsec_"]) {
      expect(SECRET.test(`KEY=${prefix}${tail}`)).toBe(true);
      expect(SECRET.test(`MY_${prefix}${tail}`)).toBe(true);
    }
    expect(SECRET.test(`NEXT_PUBLIC_KEY=pk_live_${tail}`)).toBe(false);
  });

  it("finds files to scan", () => {
    expect(candidateFiles()).toContain("src/lib/pricing.ts");
  });

  it("none is in any file git would track", () => {
    const leaks = candidateFiles()
      .filter(isFile)
      .filter((f) => SECRET.test(readFileSync(f, "utf8")));
    expect(leaks).toEqual([]);
  });
});

/**
 * PRD AC6, the half that can be checked without a build: the site has no
 * server, so the Stripe SDK — which needs a secret key — and the sync tooling
 * must never be imported by anything that ships. (The other half, that the
 * built `out/` holds no secret and no call to Stripe's API, is a CI step.)
 */
describe("the site's own code", () => {
  const SERVER_SIDE = /(?:from|import|require\()\s*["'](?:stripe|(?:\.\.\/)+(?:stripe|scripts|tests)\/[^"']*)["']/;
  const shipped = () => candidateFiles().filter((f) => f.startsWith("src/") && /\.(?:ts|tsx|js|jsx|mjs)$/.test(f) && isFile(f));

  it("the scan recognises the imports it is looking for", () => {
    expect(SERVER_SIDE.test(`import Stripe from "stripe";`)).toBe(true);
    expect(SERVER_SIDE.test(`import { applyCatalog } from "../../stripe/catalog.ts";`)).toBe(true);
    expect(SERVER_SIDE.test(`const s = require("stripe")`)).toBe(true);
    // The browser library takes a publishable key and is allowed.
    expect(SERVER_SIDE.test(`import { loadStripe } from "@stripe/stripe-js";`)).toBe(false);
    expect(SERVER_SIDE.test(`import { PLANS } from "@/lib/pricing";`)).toBe(false);
  });

  it("finds the site's files", () => {
    expect(shipped()).toContain("src/lib/pricing.ts");
    expect(shipped().length).toBeGreaterThan(10);
  });

  it("never imports the Stripe SDK or the sync tooling", () => {
    const offenders = shipped().filter((f) => SERVER_SIDE.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
