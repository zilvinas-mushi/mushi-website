/**
 * `fetch`, IMPLEMENTED ON THE STRIPE CLI — so that a developer's machine needs
 * no API key on disk. The official SDK makes every request; this only carries
 * it, as `stripe get|post|delete <path> -d key=value …`, using the login the
 * CLI already holds. CI never comes through here: there a key is required
 * (see `access.ts`).
 *
 * THE CLI'S SESSION IS IN ONE MODE AT A TIME, machine-wide. A request for the
 * other mode is REFUSED by the CLI rather than redirected ("You're in a
 * sandbox. Remove --live…"), which is the property that matters: a test-mode
 * write can not land in live by accident. It also means requests have to take
 * turns — hence the queue — and that a live request switches the session to
 * live, runs, and switches it back, so the session always rests in test mode.
 *
 * THAT REFUSAL HAS ONE HOLE, closed here: a `STRIPE_API_KEY` in the shell
 * overrides the CLI's login, its mode check and its account all at once. The
 * CLI is therefore never handed that variable, and every exchange is checked
 * afterwards — the mode and account the CLI says it sent, and the `livemode`
 * of what came back — so a request that went anywhere but where it was meant
 * to stops the run instead of being built upon.
 */
import { execFile, execFileSync } from "node:child_process";
import type { CliLogin, Mode } from "./access.ts";

export type Ran = { stdout: string; stderr: string; exit: number };
/** Runs the CLI with these arguments. Replaceable, so the transport can be tested without a CLI. */
export type Exec = (args: string[], signal?: AbortSignal) => Promise<Ran>;

/** The environment the CLI runs in: ours, minus the one variable that would override its login. */
function cliEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.STRIPE_API_KEY;
  return env;
}

function run(args: string[], signal?: AbortSignal): Promise<Ran> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "stripe",
      args,
      // The SDK's own timeout arrives as `signal`; the hard limit is for a CLI
      // that stops to ask a question nobody is there to answer.
      { env: cliEnv(), maxBuffer: 64 * 1024 * 1024, timeout: 120_000, signal },
      (error, stdout, stderr) => {
        // A numeric code is the CLI's exit status, read by the caller along
        // with its output. Anything else — not installed, timed out, aborted —
        // is a failure to run it at all.
        if (error && typeof error.code !== "number") return reject(error);
        resolve({ stdout, stderr, exit: error ? Number(error.code) : 0 });
      },
    );
    child.stdin?.end();
  });
}

/**
 * What the CLI is logged in to; null when it is not installed or not logged
 * in. An answer that cannot be understood THROWS: reading it as "not logged
 * in" would quietly skip every Stripe test on a developer's machine.
 */
export function cliLogin(): CliLogin | null {
  let out: string;
  try {
    out = execFileSync("stripe", ["whoami", "--format", "json"], {
      encoding: "utf8",
      env: cliEnv(),
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
  let who: { account_id?: unknown; authorized_accounts?: unknown };
  try {
    who = JSON.parse(out);
  } catch {
    throw new Error(`\`stripe whoami --format json\` did not print JSON:\n${out.trim()}`);
  }
  const accounts = Array.isArray(who.authorized_accounts) ? (who.authorized_accounts as Array<{ id?: unknown; modes?: unknown }>) : [];
  const account = accounts.find((a) => a.id === who.account_id);
  if (typeof who.account_id !== "string" || !account || !Array.isArray(account.modes)) {
    throw new Error(`\`stripe whoami --format json\` has a shape this repo does not know:\n${out.trim()}`);
  }
  return { accountId: who.account_id, modes: account.modes.filter((m): m is Mode => m === "test" || m === "live") };
}

// One request at a time, in the order asked.
let queue: Promise<unknown> = Promise.resolve();
function inTurn<T>(job: () => Promise<T>): Promise<T> {
  const mine = queue.then(job, job);
  queue = mine.catch(() => undefined);
  return mine;
}

let restingInTest = false;
/** Set while the session is switched to live; the account to switch back to test for. */
let liveWindow: string | null = null;
let exitHooked = false;

/**
 * `finally` does not run on Ctrl-C. Without this, an interrupted live request
 * would leave the developer's CLI in live mode for whatever they type next.
 */
function hookExit(): void {
  if (exitHooked) return;
  exitHooked = true;
  const restore = () => {
    if (!liveWindow) return;
    try {
      execFileSync("stripe", ["switch", liveWindow], { env: cliEnv(), stdio: "ignore", timeout: 30_000 });
    } catch {
      console.error(`\nThe Stripe CLI may still be in LIVE mode. Run: stripe switch ${liveWindow}\n`);
    }
    liveWindow = null;
  };
  process.on("exit", restore);
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.once(signal, () => {
      restore();
      process.exit(1);
    });
  }
}

async function switchTo(mode: Mode, accountId: string, exec: Exec): Promise<void> {
  const ran = await exec(["switch", accountId, ...(mode === "live" ? ["--live"] : [])]);
  if (ran.exit !== 0) {
    throw new Error(`The Stripe CLI could not switch to ${mode} mode:\n${(ran.stderr || ran.stdout).trim()}`);
  }
}

function inMode<T>(mode: Mode, accountId: string, exec: Exec, job: () => Promise<T>): Promise<T> {
  return inTurn(async () => {
    if (mode === "test") {
      if (!restingInTest) {
        await switchTo("test", accountId, exec);
        restingInTest = true;
      }
      return job();
    }
    hookExit();
    liveWindow = accountId;
    restingInTest = false;
    try {
      await switchTo("live", accountId, exec);
      return await job();
    } finally {
      await switchTo("test", accountId, exec);
      restingInTest = true;
      liveWindow = null;
    }
  });
}

/** Throws unless every object in a response is in the mode that was asked for. */
function assertMode(body: unknown, mode: Mode, what: string): void {
  const wrong = (value: unknown) =>
    typeof value === "object" && value !== null && typeof (value as { livemode?: unknown }).livemode === "boolean"
      ? (value as { livemode: boolean }).livemode !== (mode === "live")
      : false;
  const items = typeof body === "object" && body !== null && Array.isArray((body as { data?: unknown }).data)
    ? (body as { data: unknown[] }).data
    : [];
  if (wrong(body) || items.some(wrong)) {
    throw new Error(`STOP: ${what} was asked of ${mode} mode and the response is from the OTHER mode. Nothing further was sent.`);
  }
}

export function cliFetch(mode: Mode, accountId: string, exec: Exec = run): typeof fetch {
  return async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const method = (init?.method ?? "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const what = `${method} ${url.pathname}`;

    if (method !== "GET" && method !== "POST" && method !== "DELETE") {
      throw new Error(`The Stripe CLI transport does not carry ${method} requests.`);
    }
    if (init?.body != null && (typeof init.body !== "string" || !/form-urlencoded/.test(headers.get("content-type") ?? ""))) {
      throw new Error(`The Stripe CLI transport carries form-encoded bodies only (${what}).`);
    }
    // Both would point the request at another account; neither can be passed on faithfully.
    for (const header of ["stripe-account", "stripe-context"]) {
      if (headers.has(header)) throw new Error(`The Stripe CLI transport does not carry the ${header} header (${what}).`);
    }

    // The SDK has already flattened the parameters (`recurring[interval]=month`);
    // they pass through as they are, one `-d` each. The CLI splits each on its
    // FIRST `=`, so a name containing one would be cut short.
    const fields = [...url.searchParams, ...new URLSearchParams(init?.body ?? "")];
    const args = [method.toLowerCase(), url.pathname, "--show-headers"];
    for (const [name, value] of fields) {
      if (name.includes("=")) throw new Error(`The Stripe CLI transport cannot send a parameter named ${JSON.stringify(name)}.`);
      args.push("-d", `${name}=${value}`);
    }
    const version = headers.get("stripe-version");
    const idempotencyKey = headers.get("idempotency-key");
    if (version) args.push("--stripe-version", version);
    if (idempotencyKey && method === "POST") args.push("--idempotency", idempotencyKey);
    // Without this the CLI stops to ask before a live write or any delete.
    if (method !== "GET") args.push("--confirm");
    if (mode === "live") args.push("--live");

    const ran = await inMode(mode, accountId, exec, () => exec(args, init?.signal ?? undefined));
    const said = (ran.stderr || ran.stdout).trim();

    // `--show-headers` prints the exchange on stderr. No status line means the
    // request never left — wrong mode, logged out, no network — and the CLI's
    // own words say which. The LAST one: a token refresh shows two.
    const statuses = [...ran.stderr.matchAll(/^< HTTP (\d{3})/gm)];
    if (statuses.length === 0) throw new Error(`The Stripe CLI did not reach the API for ${what} (${mode} mode):\n${said}`);
    const status = Number(statuses[statuses.length - 1][1]);

    // What the CLI says it sent, checked against what was meant.
    const sentMode = /^> Stripe-Livemode: (true|false)/im.exec(ran.stderr)?.[1];
    const sentAccount = /^> Stripe-Context: (\S+)/im.exec(ran.stderr)?.[1];
    if (sentMode !== undefined && (sentMode === "true") !== (mode === "live")) {
      throw new Error(`STOP: ${what} was meant for ${mode} mode and the Stripe CLI sent it to the OTHER mode.`);
    }
    if (sentAccount !== undefined && sentAccount !== accountId) {
      throw new Error(`STOP: ${what} was meant for ${accountId} and the Stripe CLI sent it to ${sentAccount}.`);
    }

    let body: unknown;
    try {
      body = JSON.parse(ran.stdout);
    } catch {
      throw new Error(`The Stripe CLI answered ${what} with HTTP ${status} and no JSON (exit ${ran.exit}):\n${said}`);
    }
    assertMode(body, mode, what);

    const requestId = /^< Request-Id: (\S+)/im.exec(ran.stderr)?.[1];
    return new Response(ran.stdout, {
      status,
      headers: { "content-type": "application/json", ...(requestId ? { "request-id": requestId } : {}) },
    });
  };
}
