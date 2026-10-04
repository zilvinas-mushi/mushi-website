/**
 * The two guards between this repo and a mistaken write, with no network and
 * no CLI: `readOnly`, which every live client the tests hold is wrapped in,
 * and the Stripe CLI transport, which is how the one real live write is made.
 * The CLI is replaced by a recorder that answers the way the real one does
 * (`--show-headers` prints the exchange on stderr; the body is on stdout).
 */
import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { cliFetch, type Exec, type Ran } from "../stripe/cli-fetch.ts";
import { readOnly } from "../stripe/client.ts";

const ACCOUNT = "acct_1Q7Da8026uErRlIm";

describe("readOnly", () => {
  function recorder() {
    const sent: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const send: typeof fetch = async (input, init) => {
      sent.push([input, init]);
      return new Response("{}", { status: 200 });
    };
    return { sent, send };
  }

  it("passes a GET through untouched", async () => {
    const { sent, send } = recorder();
    const response = await readOnly(send)("https://api.stripe.com/v1/prices", { method: "GET" });
    expect(response.status).toBe(200);
    expect(sent).toEqual([["https://api.stripe.com/v1/prices", { method: "GET" }]]);
  });

  it("treats a request with no method as the GET it is", async () => {
    const { sent, send } = recorder();
    await readOnly(send)("https://api.stripe.com/v1/prices");
    expect(sent).toHaveLength(1);
  });

  it.each(["POST", "DELETE", "PUT", "PATCH", "post"])("refuses %s before it is sent", async (method) => {
    const { sent, send } = recorder();
    await expect(readOnly(send)("https://api.stripe.com/v1/prices", { method })).rejects.toThrow(/read-only: refused/);
    expect(sent).toEqual([]);
  });

  it("refuses a Request object that carries its own POST", async () => {
    const { sent, send } = recorder();
    const request = new Request("https://api.stripe.com/v1/customers", { method: "POST", body: "name=x" });
    await expect(readOnly(send)(request)).rejects.toThrow(/read-only: refused POST/);
    expect(sent).toEqual([]);
  });

  it("stops the SDK itself from creating anything", async () => {
    const { sent, send } = recorder();
    const stripe = new Stripe("not-a-key", { httpClient: Stripe.createFetchHttpClient(readOnly(send)), maxNetworkRetries: 0 });
    await expect(stripe.customers.create({ name: "nobody" })).rejects.toThrow();
    expect(sent).toEqual([]);
  });
});

/** A stand-in for the Stripe CLI: records every invocation and answers as the real one prints. */
function fakeCli(answer: (args: string[]) => Partial<Ran> & { status?: number; body?: unknown; livemode?: boolean; account?: string }) {
  const calls: string[][] = [];
  const exec: Exec = async (args) => {
    calls.push(args);
    if (args[0] === "switch") return { stdout: "", stderr: "", exit: 0 };
    const a = answer(args);
    const live = a.livemode ?? args.includes("--live");
    return {
      exit: a.exit ?? 0,
      stdout: a.stdout ?? JSON.stringify(a.body ?? {}),
      stderr:
        a.stderr ??
        [
          `> ${args[0].toUpperCase()} https://api.stripe.com${args[1]}`,
          `> Stripe-Context: ${a.account ?? ACCOUNT}`,
          `> Stripe-Livemode: ${live}`,
          `< HTTP ${a.status ?? 200}`,
          `< Request-Id: req_123`,
        ].join("\n"),
    };
  };
  /** The API requests only, without the mode switches around them. */
  const requests = () => calls.filter((c) => c[0] !== "switch");
  return { exec, calls, requests };
}

const form = { "content-type": "application/x-www-form-urlencoded" };

describe("the Stripe CLI transport", () => {
  it("carries a GET's query as one -d per parameter, with no --live in test mode", async () => {
    const cli = fakeCli(() => ({ body: { object: "list", data: [] } }));
    await cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices?lookup_keys[0]=templates_1_month&limit=100", {
      method: "GET",
      headers: { "stripe-version": "2026-09-30.endive" },
    });
    expect(cli.requests()).toEqual([
      ["get", "/v1/prices", "--show-headers", "-d", "lookup_keys[0]=templates_1_month", "-d", "limit=100", "--stripe-version", "2026-09-30.endive"],
    ]);
  });

  it("carries a POST's form body, its idempotency key and --confirm", async () => {
    const cli = fakeCli(() => ({ body: { id: "price_1", livemode: false } }));
    await cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: { ...form, "idempotency-key": "key-1" },
      body: "currency=usd&unit_amount=2400&recurring[interval]=month&metadata[note]=a%3Db%20%26%20c",
    });
    expect(cli.requests()).toEqual([
      [
        "post", "/v1/prices", "--show-headers",
        "-d", "currency=usd", "-d", "unit_amount=2400", "-d", "recurring[interval]=month", "-d", "metadata[note]=a=b & c",
        "--idempotency", "key-1", "--confirm",
      ],
    ]);
  });

  it("adds --live to a live request, switches the session to live for it and back to test after", async () => {
    const cli = fakeCli(() => ({ body: { id: "prod_1", livemode: true } }));
    await cliFetch("live", ACCOUNT, cli.exec)("https://api.stripe.com/v1/products/mushi_templates", { method: "GET" });
    expect(cli.calls).toEqual([
      ["switch", ACCOUNT, "--live"],
      ["get", "/v1/products/mushi_templates", "--show-headers", "--live"],
      ["switch", ACCOUNT],
    ]);
  });

  it("switches back to test even when the live request fails", async () => {
    const cli = fakeCli(() => ({ stderr: "You're in a sandbox. Remove --live to run the command.", stdout: "", exit: 1 }));
    await expect(
      cliFetch("live", ACCOUNT, cli.exec)("https://api.stripe.com/v1/products", { method: "POST", headers: form, body: "name=x" }),
    ).rejects.toThrow(/did not reach the API/);
    expect(cli.calls.at(-1)).toEqual(["switch", ACCOUNT]);
  });

  it("hands the SDK Stripe's own status and error, so a missing product reads as resource_missing", async () => {
    const cli = fakeCli(() => ({
      status: 404,
      body: { error: { type: "invalid_request_error", code: "resource_missing", message: "No such product: 'mushi_templates'" } },
    }));
    const stripe = new Stripe("not-a-key", {
      httpClient: Stripe.createFetchHttpClient(cliFetch("test", ACCOUNT, cli.exec)),
      maxNetworkRetries: 0,
    });
    await expect(stripe.products.retrieve("mushi_templates")).rejects.toMatchObject({ code: "resource_missing", statusCode: 404 });
  });

  it("throws the CLI's own words when the request never left", async () => {
    const cli = fakeCli(() => ({ stderr: "You're in live mode. Add --live to run the command.", stdout: "", exit: 1 }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" })).rejects.toThrow(
      /did not reach the API[\s\S]*You're in live mode/,
    );
  });

  it("reads the LAST status line, as after a token refresh", async () => {
    const cli = fakeCli(() => ({ stderr: "< HTTP 401\n> GET again\n< HTTP 200", body: { object: "list", data: [] } }));
    const response = await cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" });
    expect(response.status).toBe(200);
  });

  it("throws rather than hand the SDK a status with no JSON", async () => {
    const cli = fakeCli(() => ({ status: 401, stdout: "", exit: 1 }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" })).rejects.toThrow(
      /HTTP 401 and no JSON/,
    );
  });

  it("STOPS when a test-mode request comes back with a live object", async () => {
    const cli = fakeCli(() => ({ livemode: false, body: { id: "prod_1", livemode: true } }));
    await expect(
      cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/products", { method: "POST", headers: form, body: "name=x" }),
    ).rejects.toThrow(/STOP.*OTHER mode/);
  });

  it("STOPS when any object in a list is from the other mode", async () => {
    const cli = fakeCli(() => ({ body: { object: "list", data: [{ id: "a", livemode: false }, { id: "b", livemode: true }] } }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" })).rejects.toThrow(/STOP/);
  });

  it("STOPS when the CLI says it sent the request to the other mode", async () => {
    const cli = fakeCli(() => ({ livemode: true, body: {} }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" })).rejects.toThrow(
      /STOP.*sent it to the OTHER mode/,
    );
  });

  it("STOPS when the CLI says it sent the request to another account", async () => {
    const cli = fakeCli(() => ({ account: "acct_1SomeoneElse", body: {} }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", { method: "GET" })).rejects.toThrow(
      /STOP.*sent it to acct_1SomeoneElse/,
    );
  });

  it.each<[string, RequestInit]>([
    ["a JSON body", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }],
    ["a Stripe-Account header", { method: "GET", headers: { "stripe-account": "acct_other" } }],
    ["a Stripe-Context header", { method: "GET", headers: { "stripe-context": "acct_other" } }],
    ["a PUT", { method: "PUT" }],
    ["a parameter whose name contains =", { method: "POST", headers: form, body: "metadata%5Ba%3Db%5D=v" }],
  ])("refuses to carry %s, without calling the CLI", async (_what, init) => {
    const cli = fakeCli(() => ({ body: {} }));
    await expect(cliFetch("test", ACCOUNT, cli.exec)("https://api.stripe.com/v1/prices", init)).rejects.toThrow(/Stripe CLI transport/);
    expect(cli.requests()).toEqual([]);
  });
});
