/**
 * PRD AC5, end to end: on CI, with the Stripe keys missing, the run goes RED.
 *
 * `stripe.access.test.ts` pins the rule; this pins that the rule is actually
 * wired to the test run — by starting a second Vitest with `CI=true` and no
 * keys and reading its exit status — and that the workflow step cannot be
 * told to ignore the result. No network: the child fails before any request.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** A child Vitest over the Stripe files, in an environment that holds nothing but what is passed. */
function runStripeTests(env: Record<string, string>) {
  return spawnSync(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "tests/stripe.catalog.test.ts", "tests/stripe.payments.test.ts"],
    { encoding: "utf8", env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env }, timeout: 120_000 },
  );
}

describe("on CI with no Stripe keys", () => {
  it("the run fails, and says which key is missing", () => {
    const child = runStripeTests({ CI: "true" });
    expect(child.status).toBe(1);
    expect(child.stdout + child.stderr).toMatch(/STRIPE_TEST_KEY is not set/);
  });

  it("no Stripe test is counted as passed", () => {
    const child = runStripeTests({ CI: "true" });
    expect(child.stdout + child.stderr).not.toMatch(/\d+ passed/);
  });

  it("a fork's pull request is the one case that skips, and it reports them as skipped, not passed", () => {
    const child = runStripeTests({ CI: "true", STRIPE_KEYS_REQUIRED: "false" });
    const out = child.stdout + child.stderr;
    expect(child.status).toBe(0);
    expect(out).toMatch(/SKIPPED — Stripe test-mode tests did not run: pull request from a fork/);
    expect(out).toMatch(/\d+ skipped/);
    expect(out).not.toMatch(/Tests\s+\d+ passed/);
  });
});

describe("the workflow step", () => {
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const start = workflow.indexOf("- name: Payment tests");
  // Up to the next step.
  const step = workflow.slice(start, workflow.indexOf("\n      - ", start + 1));

  it("exists and runs the whole suite", () => {
    expect(start).toBeGreaterThan(-1);
    expect(step).toMatch(/^\s+run: npm test$/m);
  });

  it("cannot be skipped or have its failure ignored", () => {
    expect(step).not.toMatch(/^\s+if:/m);
    // As a key, anywhere in the file; the comments mention it by name.
    expect(workflow).not.toMatch(/^\s*continue-on-error:/m);
  });

  it("passes both keys, and tells the tests they are on CI", () => {
    expect(step).toContain("STRIPE_TEST_KEY: ${{ secrets.STRIPE_TEST_KEY }}");
    expect(step).toContain("STRIPE_LIVE_READONLY_KEY: ${{ secrets.STRIPE_LIVE_READONLY_KEY }}");
    expect(step).toMatch(/^\s+CI: "true"$/m);
  });

  it("only ever relaxes the missing-key rule for a pull request from another repository", () => {
    expect(step).toContain(
      "STRIPE_KEYS_REQUIRED: ${{ github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository }}",
    );
  });
});
