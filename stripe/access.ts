/**
 * HOW THE TESTS AND THE SYNC SCRIPT REACH STRIPE, and the rule that makes the
 * CI step a gate rather than a suggestion (docs/features/0001-stripe-pricing).
 *
 * Pure: it is handed the environment and what the Stripe CLI reported, and
 * decides. `tests/stripe.access.test.ts` is its specification.
 */

export type Mode = "test" | "live";

/**
 * THE ONE STRIPE ACCOUNT THIS CATALOG BELONGS TO (Mushi, MB). Not a secret —
 * it is in every Dashboard URL and inside every publishable key — and pinned
 * here because the CLI can be logged in to several accounts, and an empty
 * account that is the WRONG account looks exactly like one waiting for
 * `apply`.
 */
export const STRIPE_ACCOUNT = "acct_1Q7Da8026uErRlIm";

/** What `stripe whoami` reported, or null when the CLI is absent or logged out. */
export type CliLogin = { accountId: string; modes: readonly Mode[] };

export type Access =
  | { via: "key"; key: string }
  | { via: "cli"; accountId: string }
  | { via: "none"; reason: string };

/**
 * Restricted keys only ever reach CI, one per mode. There is deliberately no
 * variable for a key that can WRITE to live: that one write is made by a
 * person, through the CLI login.
 */
export const KEY_VARIABLE: Record<Mode, string> = {
  test: "STRIPE_TEST_KEY",
  live: "STRIPE_LIVE_READONLY_KEY",
};

type Env = Record<string, string | undefined>;

export function resolveAccess(mode: Mode, env: Env, cli: CliLogin | null): Access {
  const variable = KEY_VARIABLE[mode];
  const key = env[variable]?.trim();

  if (key) {
    // A live key in the test slot would run the payment tests against real
    // customers. The prefix is checked here, before a single request; the
    // message names the variable and never the key.
    if (!new RegExp(`^(?:sk|rk)_${mode}_`).test(key)) {
      throw new Error(`${variable} is not a ${mode}-mode key (it must start rk_${mode}_ or sk_${mode}_).`);
    }
    return { via: "key", key };
  }

  if (env.CI) {
    // The one skip CI is allowed: GitHub gives a fork's pull request no
    // secrets, so the workflow sets this to the literal "false" for those and
    // for nothing else. Any other value — unset, empty, "true" — fails, so
    // deleting the line from the workflow makes the gate stricter, not looser.
    if (env.STRIPE_KEYS_REQUIRED === "false") {
      return { via: "none", reason: "pull request from a fork: GitHub does not expose secrets to it" };
    }
    throw new Error(
      `${variable} is not set. On CI a missing Stripe key fails the run: ` +
        `a payment check that passes without its key is not a check. ` +
        `Add the secret in the repository's Actions settings.`,
    );
  }

  if (!cli) {
    return { via: "none", reason: `no ${variable} and no Stripe CLI login (run \`stripe login\`)` };
  }
  if (cli.accountId !== STRIPE_ACCOUNT) {
    throw new Error(
      `The Stripe CLI is logged in to ${cli.accountId}; this repo's catalog belongs to ${STRIPE_ACCOUNT}. ` +
        `Run \`stripe switch ${STRIPE_ACCOUNT}\` and try again.`,
    );
  }
  if (!cli.modes.includes(mode)) {
    return { via: "none", reason: `the Stripe CLI login is not authorised for ${mode} mode` };
  }
  return { via: "cli", accountId: cli.accountId };
}
