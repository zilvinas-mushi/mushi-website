/**
 * How a test file gets its Stripe client — or learns that it has to skip.
 *
 * On CI this THROWS when the key is missing (see `stripe/access.ts`), which
 * fails the file at collection: the gate does not skip. On a developer's
 * machine it falls back to the Stripe CLI login, and skips, loudly, only when
 * there is neither.
 */
import type Stripe from "stripe";
import { resolveAccess, type CliLogin, type Mode } from "../../stripe/access.ts";
import { cliLogin } from "../../stripe/cli-fetch.ts";
import { stripeClient } from "../../stripe/client.ts";

let login: CliLogin | null | undefined;

export type Connection = { stripe: Stripe; skip: false } | { stripe: null; skip: string };

export function connect(mode: Mode): Connection {
  // The CLI is not consulted on CI at all: a runner must never succeed on a
  // login that happens to be lying around.
  if (login === undefined) login = process.env.CI ? null : cliLogin();

  const access = resolveAccess(mode, process.env, login);
  if (access.via === "none") {
    console.warn(`\n  SKIPPED — Stripe ${mode}-mode tests did not run: ${access.reason}\n`);
    return { stripe: null, skip: access.reason };
  }
  // Tests never write to live, whatever the key or login would allow.
  return { stripe: stripeClient(mode, access, { readOnly: mode === "live" }), skip: false };
}
