/**
 * The gate's own rule (PRD AC5): on CI a missing Stripe key FAILS the run.
 *
 * A check that quietly skips when its secret is deleted is not a check. The
 * only skip CI allows is the one it cannot avoid — a pull request from a fork,
 * which GitHub never hands secrets to — and the workflow has to say so
 * explicitly. No network.
 */
import { describe, expect, it } from "vitest";
import { STRIPE_ACCOUNT, resolveAccess } from "../stripe/access.ts";

// Assembled at run time so the repository's own secret scan does not trip on it.
const testKey = ["rk", "test", "51Q7Da8026uErRlImAbCdEf"].join("_");
const liveKey = ["rk", "live", "51Q7Da8026uErRlImAbCdEf"].join("_");
const cli = { accountId: STRIPE_ACCOUNT, modes: ["test", "live"] as const };

describe("on CI", () => {
  it("uses the test key for test mode", () => {
    expect(resolveAccess("test", { CI: "true", STRIPE_TEST_KEY: testKey }, null)).toEqual({
      via: "key",
      key: testKey,
    });
  });

  it("uses the read-only live key for live mode", () => {
    expect(resolveAccess("live", { CI: "true", STRIPE_LIVE_READONLY_KEY: liveKey }, null)).toEqual({
      via: "key",
      key: liveKey,
    });
  });

  it("fails when the test key is missing", () => {
    expect(() => resolveAccess("test", { CI: "true" }, null)).toThrow(/STRIPE_TEST_KEY is not set/);
  });

  it("fails when the live key is missing", () => {
    expect(() => resolveAccess("live", { CI: "true" }, null)).toThrow(/STRIPE_LIVE_READONLY_KEY is not set/);
  });

  it("fails when the key is set but empty, as a deleted GitHub secret is", () => {
    expect(() => resolveAccess("test", { CI: "true", STRIPE_TEST_KEY: "" }, null)).toThrow(/STRIPE_TEST_KEY is not set/);
  });

  it("never falls back to a CLI login, even if one exists", () => {
    expect(() => resolveAccess("test", { CI: "true" }, cli)).toThrow(/STRIPE_TEST_KEY is not set/);
  });

  it("skips only when the workflow says secrets cannot exist: a pull request from a fork", () => {
    expect(resolveAccess("test", { CI: "true", STRIPE_KEYS_REQUIRED: "false" }, null)).toEqual({
      via: "none",
      reason: expect.stringMatching(/fork/),
    });
  });

  it.each(["", "true", "False", "FALSE", "0", "no", " false"])("still fails when that switch is %j", (value) => {
    expect(() => resolveAccess("test", { CI: "true", STRIPE_KEYS_REQUIRED: value }, null)).toThrow(/is not set/);
  });

  it.each(["   ", "\n", "\t"])("fails when the key is only whitespace (%j)", (blank) => {
    expect(() => resolveAccess("test", { CI: "true", STRIPE_TEST_KEY: blank }, null)).toThrow(/STRIPE_TEST_KEY is not set/);
  });

  it("accepts a key pasted with a trailing newline, and uses it without the newline", () => {
    expect(resolveAccess("test", { CI: "true", STRIPE_TEST_KEY: `${testKey}\n` }, null)).toEqual({ via: "key", key: testKey });
  });
});

describe("a key in the wrong mode", () => {
  it("a live key is refused as the test key", () => {
    expect(() => resolveAccess("test", { STRIPE_TEST_KEY: liveKey }, null)).toThrow(/not a test-mode key/);
  });

  it("a test key is refused as the live key", () => {
    expect(() => resolveAccess("live", { STRIPE_LIVE_READONLY_KEY: testKey }, null)).toThrow(/not a live-mode key/);
  });

  it("a publishable key is refused", () => {
    const publishable = ["pk", "test", "51Q7Da8026uErRlImAbCdEf"].join("_");
    expect(() => resolveAccess("test", { STRIPE_TEST_KEY: publishable }, null)).toThrow(/not a test-mode key/);
  });

  it("the refusal does not print the key", () => {
    expect(() => resolveAccess("test", { STRIPE_TEST_KEY: liveKey }, null)).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining(liveKey) }),
    );
  });
});

describe("on a developer's machine", () => {
  it("prefers a key when one is set", () => {
    expect(resolveAccess("test", { STRIPE_TEST_KEY: testKey }, cli)).toEqual({ via: "key", key: testKey });
  });

  it("uses the Stripe CLI login when there is no key", () => {
    expect(resolveAccess("test", {}, cli)).toEqual({ via: "cli", accountId: STRIPE_ACCOUNT });
  });

  it("skips, with the reason, when the CLI is not logged in", () => {
    expect(resolveAccess("test", {}, null)).toEqual({
      via: "none",
      reason: expect.stringMatching(/stripe login/),
    });
  });

  it("skips live when the CLI login was authorised for test mode only", () => {
    expect(resolveAccess("live", {}, { accountId: STRIPE_ACCOUNT, modes: ["test"] })).toEqual({
      via: "none",
      reason: expect.stringMatching(/live/),
    });
  });

  it("refuses a CLI login for any other Stripe account, in either mode", () => {
    // An empty account that is the wrong account looks exactly like one
    // waiting for `apply`.
    const other = { accountId: "acct_1SomeoneElse", modes: ["test", "live"] as const };
    expect(() => resolveAccess("test", {}, other)).toThrow(/logged in to acct_1SomeoneElse.*belongs to acct_1Q7Da8026uErRlIm/);
    expect(() => resolveAccess("live", {}, other)).toThrow(/logged in to acct_1SomeoneElse/);
  });

  it("the pinned account is Mushi's", () => {
    expect(STRIPE_ACCOUNT).toBe("acct_1Q7Da8026uErRlIm");
  });
});
