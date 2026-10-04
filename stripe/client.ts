/**
 * The Stripe SDK client for one mode. Used by the sync script and the tests;
 * NEVER imported by anything under `src/` — this site has no server and the
 * SDK must not reach the static export.
 */
import Stripe from "stripe";
import type { Access, Mode } from "./access.ts";
import { cliFetch } from "./cli-fetch.ts";

// The SDK insists on a key; through the CLI the CLI authenticates and this is
// never sent anywhere.
const NO_KEY = "authenticated-by-the-stripe-cli";

/**
 * Lets reads through and refuses everything else BEFORE it is sent. The live
 * client the tests hold is wrapped in this whatever its key allows: a test
 * must not be able to write to live even by mistake.
 */
export function readOnly(send: typeof fetch): typeof fetch {
  return async (input, init) => {
    // A Request object carries its own method; with no `init` that is the one that counts.
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    if (method !== "GET") {
      throw new Error(`This Stripe client is read-only: refused ${method} ${String(input instanceof Request ? input.url : input)}`);
    }
    return send(input, init);
  };
}

export function stripeClient(
  mode: Mode,
  access: Exclude<Access, { via: "none" }>,
  options: { readOnly?: boolean } = {},
): Stripe {
  let send: typeof fetch = access.via === "key" ? fetch : cliFetch(mode, access.accountId);
  if (options.readOnly) send = readOnly(send);
  return new Stripe(access.via === "key" ? access.key : NO_KEY, {
    httpClient: Stripe.createFetchHttpClient(send),
    telemetry: false,
    // Through the CLI a failure is the CLI saying why — wrong mode, logged
    // out — and repeating it three times helps nobody. Over HTTPS the SDK's
    // default retries stay, each with its own idempotency key.
    ...(access.via === "cli" ? { maxNetworkRetries: 0 } : {}),
  });
}
