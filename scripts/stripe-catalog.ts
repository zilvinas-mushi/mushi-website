/**
 * Put the catalog (`src/lib/pricing.ts`) into Stripe, or check that it is there.
 *
 *   npm run stripe:check                    read-only, test mode
 *   npm run stripe:check -- --live          read-only, live
 *   npm run stripe:apply                    create what is missing, test mode
 *   npm run stripe:apply -- --live          show what WOULD be created in live
 *   npm run stripe:apply -- --live --yes    create it in LIVE
 *
 * Run by Node directly (it strips the types; Node 22.18+).
 *
 * `check` reaches Stripe with STRIPE_TEST_KEY / STRIPE_LIVE_READONLY_KEY when
 * set and through the Stripe CLI login otherwise, and cannot write either way.
 *
 * `apply` ONLY EVER GOES THROUGH THE CLI LOGIN, in both modes: there is no
 * variable for a key that can write the catalog, on purpose, and it refuses
 * to run on CI. The login has to be for the account pinned in
 * `stripe/access.ts`. A live apply also refuses until test mode already holds
 * the catalog — test first is enforced, not advised — and writes nothing
 * without `--yes`. Stripe prices can be archived but never deleted, so a
 * mistaken live create stays in the account for good.
 *
 * `apply` creates and nothing else — see `stripe/catalog.ts`. Exit status is
 * non-zero whenever Stripe and the catalog differ.
 */
import { PLANS, TEMPLATES_PRODUCT } from "../src/lib/pricing.ts";
import { KEY_VARIABLE, STRIPE_ACCOUNT, resolveAccess, type Mode } from "../stripe/access.ts";
import { applyCatalog, inspectCatalog, type CatalogDiff, type Snapshot } from "../stripe/catalog.ts";
import { cliLogin } from "../stripe/cli-fetch.ts";
import { stripeClient } from "../stripe/client.ts";

const [command, ...flags] = process.argv.slice(2);
const unknown = flags.filter((f) => f !== "--live" && f !== "--yes");
if ((command !== "check" && command !== "apply") || unknown.length > 0) {
  console.error("usage: stripe-catalog.ts check|apply [--live] [--yes]");
  process.exit(2);
}
const mode: Mode = flags.includes("--live") ? "live" : "test";
const confirmed = flags.includes("--yes");

function differences(diff: CatalogDiff): number {
  return diff.problems.length + diff.missingPlans.length + diff.missingOptions.length + (diff.missingProduct ? 1 : 0);
}

function report(of: Mode, snapshot: Snapshot, diff: CatalogDiff): void {
  const { product } = snapshot;
  console.log(`\nStripe ${of} mode, account ${STRIPE_ACCOUNT}`);
  console.log(
    product
      ? `  product ${product.id}  "${product.name}"  active: ${product.active}  livemode: ${product.livemode}`
      : `  product ${TEMPLATES_PRODUCT.id}  MISSING`,
  );
  for (const plan of PLANS) {
    const price = snapshot.keyed.find((p) => p.lookup_key === plan.lookupKey);
    console.log(
      price
        ? `  price   ${plan.lookupKey.padEnd(20)} ${price.id}  ${price.unit_amount} ${price.currency} ` +
            `every ${price.recurring?.interval_count} ${price.recurring?.interval}  ` +
            `active: ${price.active}  livemode: ${price.livemode}` +
            // The local amounts (pricing.ts, LOCAL_CURRENCIES), as Stripe holds them.
            Object.entries(price.currency_options ?? {})
              .filter(([c]) => c !== price.currency)
              .map(([c, o]) => `  ${o.unit_amount} ${c}`)
              .join("")
        : `  price   ${plan.lookupKey.padEnd(20)} MISSING`,
    );
  }
  for (const o of diff.missingOptions) console.log(`  MISSING ${o.currency} amount on price ${o.plan.lookupKey} (${o.amount})`);
  for (const problem of diff.problems) console.log(`  PROBLEM ${problem}`);
}

/** The client for a mode. `apply` is never given a key: only the CLI login may write the catalog. */
function clientFor(of: Mode, writes: boolean) {
  const env = writes ? { ...process.env, [KEY_VARIABLE.test]: undefined, [KEY_VARIABLE.live]: undefined } : process.env;
  const access = resolveAccess(of, env, env.CI ? null : cliLogin());
  if (access.via === "none") throw new Error(`Cannot reach Stripe ${of} mode: ${access.reason}`);
  return stripeClient(of, access, { readOnly: !writes });
}

async function main(): Promise<number> {
  if (command === "check") {
    const { snapshot, diff } = await inspectCatalog(clientFor(mode, false), mode);
    report(mode, snapshot, diff);
    const n = differences(diff);
    console.log(n === 0 ? "\n0 differences: Stripe holds the catalog.\n" : `\n${n} difference(s).\n`);
    return n === 0 ? 0 : 1;
  }

  if (process.env.CI) throw new Error("apply does not run on CI. The catalog is written by a person, through the Stripe CLI login.");

  if (mode === "live") {
    // Test first, enforced: live is only written once test mode already holds
    // exactly this catalog — which is also what the payment tests ran against.
    const test = await inspectCatalog(clientFor("test", false), "test");
    if (differences(test.diff) > 0) {
      report("test", test.snapshot, test.diff);
      throw new Error("Test mode does not hold the catalog yet. Run `npm run stripe:apply`, then `npm test`, then come back to live.");
    }
    const before = await inspectCatalog(clientFor("live", false), "live");
    report("live", before.snapshot, before.diff);
    const toCreate = [
      ...(before.diff.missingProduct ? [`product ${TEMPLATES_PRODUCT.id} "${TEMPLATES_PRODUCT.name}"`] : []),
      ...before.diff.missingPlans.map((p) => `price ${p.lookupKey}: ${p.amount} cents every ${p.intervalCount} ${p.interval}`),
      ...before.diff.missingOptions.map((o) => `${o.currency} amount on price ${o.plan.lookupKey}: ${o.amount}`),
    ];
    if (before.diff.problems.length === 0 && toCreate.length === 0) {
      console.log("\n0 differences: live already holds the catalog. Nothing to create.\n");
      return 0;
    }
    if (before.diff.problems.length === 0 && !confirmed) {
      console.log(`\nThis would create, in LIVE mode of ${STRIPE_ACCOUNT}:`);
      for (const line of toCreate) console.log(`  ${line}`);
      console.log("\nNothing was written. Prices cannot be deleted once created; re-run with --yes to create them.\n");
      return 2;
    }
  }

  console.log(`\nApplying the catalog to Stripe ${mode.toUpperCase()} mode of ${STRIPE_ACCOUNT} (creates only; never edits or deletes).`);
  const { created } = await applyCatalog(clientFor(mode, true), mode);
  console.log(created.length ? created.map((c) => `  created ${c}`).join("\n") : "  nothing to create");

  const after = await inspectCatalog(clientFor(mode, false), mode);
  report(mode, after.snapshot, after.diff);
  const n = differences(after.diff);
  console.log(n === 0 ? "\n0 differences: Stripe holds the catalog.\n" : `\n${n} difference(s).\n`);
  return n === 0 ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (error) {
  // The SDK wraps a transport failure and keeps what was actually said — the
  // Stripe CLI's own words, a refused write — in `detail`.
  const detail = (error as { detail?: unknown }).detail;
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  if (detail instanceof Error) console.error(detail.message);
  console.error("");
  process.exitCode = 1;
}
