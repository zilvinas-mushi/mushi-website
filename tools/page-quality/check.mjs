/**
 * THE PAGE-QUALITY GATE. Two promises the site makes, checked on the built
 * export rather than taken on trust (Žilvinas 2026-10-05, after both were
 * measured by hand: "can you add this to the pipeline tests?"):
 *
 *   1. SPEED    Lighthouse's mobile performance score — the number Google's
 *               PageSpeed shows — is above MIN_SCORE on every page. The
 *               median of RUNS runs, because one run wanders by a few points.
 *
 *   2. PICTURES A visitor never sees an unloaded picture, nor a card that is
 *               waiting for one. Each page is opened on a throttled line and
 *               scrolled from top to bottom, a screen at a time, from the
 *               instant it is revealed — the reader who does not wait. At
 *               every stop, anything on screen that is a picture, or a card
 *               (article, li, figure) with a picture in it, has to be either
 *               fully loaded or not shown at all. Afterwards nothing may
 *               still be held back.
 *
 * They pull against each other — fetch less and the score rises, fetch late
 * and the pictures pop in — which is why they are checked together.
 *
 *   npm run pages:check                         build first: reads ./out
 *   npm run pages:check -- --url https://mushi.agency     the live site
 *   npm run pages:check -- --only speed         or: --only pictures
 *
 * ITS DEPENDENCIES ARE ITS OWN (this folder's package.json), installed with
 * `npm ci --prefix tools/page-quality`. Lighthouse brings ~180 MB and two
 * dozen advisories in tooling it never uses here; in the site's package.json
 * that would be in every Cloudflare build and every `npm audit`.
 *
 * It needs a Chrome: CHROME_PATH, or the usual places on macOS and Linux.
 * GitHub's ubuntu runners ship one.
 *
 * Plain JavaScript on purpose: nothing type-checks this folder, so a type
 * error here can never fail the deploy.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createSecureServer } from "node:http2";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

/** The pages Google indexes and visitors land on. */
const PAGES = ["/", "/templates", "/case-studies", "/legal/privacy-policy"];
/** "Above 90" (Žilvinas). The score is an integer, so 90 itself is a fail. */
const MIN_SCORE = 90;
const RUNS = Number(process.env.LH_RUNS ?? 3);

/** The reader's window in the scroll test: a laptop and a phone. */
const WINDOWS = [
  { name: "desktop", width: 1512, height: 860, deviceScaleFactor: 1, isMobile: false },
  { name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];
/** A decent connection, not a fast one: 10 Mbit/s down, 60ms of latency. */
const LINE = { offline: false, latency: 60, downloadThroughput: (10 * 1e6) / 8, uploadThroughput: (5 * 1e6) / 8 };
/** How long everything may take to finish arriving once the bottom is reached. */
const SETTLE_MS = 30_000;

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const OUT = join(ROOT, "out");

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const only = flag("--only");
const remote = flag("--url")?.replace(/\/$/, "");
if (only && only !== "speed" && only !== "pictures") {
  console.error(`--only takes "speed" or "pictures", not "${only}"`);
  process.exit(2);
}

/* ------------------------------------------------------------ the site --- */

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".xml": "application/xml",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".txt", ".svg", ".xml"]);

/**
 * A certificate for 127.0.0.1 that lives as long as this run, so the export
 * can be served over HTTP/2 — browsers only speak it over TLS. Made by the
 * system's openssl; null if there is none, and the run falls back to
 * HTTP/1.1 and says so.
 */
function throwawayCertificate() {
  const dir = mkdtempSync(join(tmpdir(), "page-quality-"));
  try {
    execFileSync(
      "openssl",
      ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1", "-keyout", join(dir, "key.pem"), "-out", join(dir, "cert.pem")],
      { stdio: "ignore" },
    );
    return { key: readFileSync(join(dir, "key.pem")), cert: readFileSync(join(dir, "cert.pem")) };
  } catch {
    return null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * The export, served the way Cloudflare Pages serves it, because the score
 * is worked out from what crosses a simulated line and how:
 *
 *   - /templates is out/templates.html;
 *   - text is compressed with Brotli — uncompressed JavaScript would fail a
 *     page that is fine;
 *   - over HTTP/2, one connection for everything. Over HTTP/1.1 Lighthouse
 *     charges a handshake for each of six connections and queues the rest
 *     behind them: the same export scored 89-92 that way and 98-99 live.
 */
function serve() {
  const packed = new Map();
  const find = (path) => {
    const clean = normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, "");
    const base = join(OUT, clean);
    if (!base.startsWith(OUT)) return null;
    for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
  };
  const tls = throwawayCertificate();
  if (!tls) console.warn("  (no openssl: serving over HTTP/1.1, scores will read a few points low)");
  const handler = (req, res) => {
    const file = find(new URL(req.url ?? "/", "http://x").pathname);
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain" }).end("not found");
      return;
    }
    const ext = extname(file);
    const headers = { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "public, max-age=600" };
    let body = readFileSync(file);
    if (COMPRESSIBLE.has(ext)) {
      const accepts = String(req.headers["accept-encoding"] ?? "");
      const encoding = accepts.includes("br") ? "br" : accepts.includes("gzip") ? "gzip" : null;
      if (encoding) {
        const key = `${encoding}:${file}`;
        if (!packed.has(key)) packed.set(key, encoding === "br" ? brotliCompressSync(body) : gzipSync(body));
        body = packed.get(key);
        headers["content-encoding"] = encoding;
        headers.vary = "accept-encoding";
      }
    }
    res.writeHead(200, headers).end(body);
  };
  // maxSessionMemory: on a throttled line a whole page of pictures sits in
  // the session's send queue at once, and Node's default 10 MB cap answered
  // that by killing streams (ERR_HTTP2_PROTOCOL_ERROR in the browser) — a
  // failure of this server, reported as the site's.
  const server = tls ? createSecureServer({ ...tls, allowHTTP1: true, maxSessionMemory: 512 }, handler) : createServer(handler);
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done({ server, origin: `${tls ? "https" : "http"}://127.0.0.1:${server.address().port}` })));
}

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error("No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.");
  return found;
}

/* --------------------------------------------------------------- speed --- */

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Lighthouse's default run is PageSpeed's mobile run: a mid-range phone on Slow 4G. */
async function speed(browser, lighthouse, base) {
  const failures = [];
  for (const path of PAGES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const page = await browser.newPage();
      try {
        const result = await lighthouse(base + path, { onlyCategories: ["performance"], logLevel: "error", output: "json" }, undefined, page);
        const lhr = result?.lhr;
        const score = lhr?.categories?.performance?.score;
        if (typeof score !== "number") throw new Error(lhr?.runtimeError?.message ?? "Lighthouse returned no score");
        const ms = (id) => lhr.audits[id]?.numericValue ?? NaN;
        runs.push({ score: Math.round(score * 100), lcp: ms("largest-contentful-paint"), tbt: ms("total-blocking-time"), cls: ms("cumulative-layout-shift") });
      } finally {
        await page.close().catch(() => {});
      }
    }
    const score = median(runs.map((r) => r.score));
    const ok = score > MIN_SCORE;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${path.padEnd(14)} ${String(score).padStart(3)}  (runs ${runs.map((r) => r.score).join(", ")})` +
        `  LCP ${(median(runs.map((r) => r.lcp)) / 1000).toFixed(2)}s  TBT ${Math.round(median(runs.map((r) => r.tbt)))}ms  CLS ${median(runs.map((r) => r.cls)).toFixed(3)}`,
    );
    if (!ok) failures.push(`${path}: mobile performance ${score}, has to be above ${MIN_SCORE}`);
  }
  return failures;
}

/* ------------------------------------------------------------ pictures --- */

/**
 * Runs in the page: what is on screen right now that should not be, then one
 * step down. "Shown" means no ancestor hides it — that is exactly how the
 * site keeps a waiting card out of sight (data-hold, data-bg; globals.css).
 */
function lookAndStep() {
  const shown = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const style = getComputedStyle(n);
      if (style.opacity === "0" || style.visibility === "hidden" || style.display === "none") return false;
    }
    return true;
  };
  const onScreen = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const loaded = (img) => Boolean(img.currentSrc || img.getAttribute("src")) && img.complete && img.naturalWidth > 0;
  const name = (img) => (img.getAttribute("data-src") || img.currentSrc || img.getAttribute("src") || "(no src)").split("/").pop();

  const found = [];
  for (const img of document.images) {
    if (onScreen(img) && !loaded(img) && shown(img)) found.push(`picture on screen, not loaded: ${name(img)}`);
  }
  for (const card of document.querySelectorAll("article, li, figure")) {
    if (!onScreen(card) || !shown(card)) continue;
    for (const img of card.querySelectorAll("img")) {
      // Its own pictures only, and only the ones this breakpoint draws.
      if (!img.getClientRects().length || img.closest("article, li, figure") !== card) continue;
      if (!loaded(img)) {
        found.push(`card shown without its picture: ${name(img)}`);
        break;
      }
    }
  }
  const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  scrollBy(0, Math.round(innerHeight * 0.8));
  return { found, atEnd };
}

async function pictures(browser, base) {
  const failures = [];
  for (const path of PAGES) {
    for (const win of WINDOWS) {
      const page = await browser.newPage();
      try {
        await page.setViewport(win);
        const cdp = await page.createCDPSession();
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", LINE);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const dropped = [];
        page.on("requestfailed", (request) => {
          const why = request.failure()?.errorText ?? "failed";
          // Aborted is the browser changing its mind (a rail swapping its
          // video, a picture re-chosen), not a request that went wrong.
          if (why !== "net::ERR_ABORTED") dropped.push(`${request.url().split("/").pop()} (${why})`);
        });
        page.on("response", (response) => {
          if (response.status() >= 400) dropped.push(`${response.url().split("/").pop()} (HTTP ${response.status()})`);
        });

        await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 60_000 });
        // The paint gate lifts the veil by setting data-ready; until then
        // there is nothing to see, loaded or not.
        await page.waitForFunction(() => document.documentElement?.hasAttribute("data-ready"), { timeout: 30_000 });

        const seen = new Map();
        let steps = 0;
        for (; steps < 400; steps++) {
          const { found, atEnd } = await page.evaluate(lookAndStep);
          for (const what of found) seen.set(what, (seen.get(what) ?? 0) + 1);
          if (atEnd) break;
          await new Promise((r) => setTimeout(r, 120));
        }

        // Nothing may be left waiting once the line has gone quiet.
        const held = await page
          .waitForFunction(
            () => {
              const rendered = (el) => el.getClientRects().length > 0;
              const waiting = [...document.querySelectorAll("[data-hold], [data-bg-wait], img[data-src-wait], img[data-src], [data-bg]")].filter(rendered);
              return waiting.length === 0;
            },
            { timeout: SETTLE_MS, polling: 500 },
          )
          .then(() => 0)
          .catch(() =>
            page.evaluate(() => [...document.querySelectorAll("[data-hold], [data-bg-wait], img[data-src-wait], img[data-src], [data-bg]")].filter((el) => el.getClientRects().length > 0).length),
          );

        const label = `${path} (${win.name})`;
        const problems = [...seen.keys()];
        if (held) problems.push(`${held} element(s) still held back ${SETTLE_MS / 1000}s after reaching the bottom`);
        if (errors.length) problems.push(`page error: ${errors[0]}`);
        // A request that failed is a broken picture or a broken test server;
        // either way the result above cannot be trusted, so it is a failure.
        if (dropped.length) problems.push(`${dropped.length} request(s) failed, e.g. ${dropped.slice(0, 3).join(", ")}`);
        console.log(`  ${problems.length ? "FAIL" : "pass"}  ${label.padEnd(26)} ${steps + 1} stops`);
        for (const problem of problems.slice(0, 12)) console.log(`          ${problem}`);
        if (problems.length > 12) console.log(`          … and ${problems.length - 12} more`);
        for (const problem of problems) failures.push(`${label}: ${problem}`);
      } finally {
        await page.close().catch(() => {});
      }
    }
  }
  return failures;
}

/* ----------------------------------------------------------------- run --- */

let puppeteer;
let lighthouse;
try {
  puppeteer = (await import("puppeteer-core")).default;
  lighthouse = (await import("lighthouse")).default;
} catch {
  console.error("The page-quality gate's own dependencies are not installed.\nRun:  npm ci --prefix tools/page-quality");
  process.exit(2);
}

if (!remote && !existsSync(join(OUT, "index.html"))) {
  console.error("out/ does not exist — nothing to check. Run `npx next build` first, or pass --url.");
  process.exit(2);
}

const local = remote ? null : await serve();
const base = remote ?? local.origin;
const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  // GitHub's runners do not allow Chrome's sandbox (unprivileged user
  // namespaces are restricted there); it is this site's own pages either way.
  // --ignore-certificate-errors is for the throwaway certificate above and
  // nothing else: this browser only ever opens this site.
  args: [...(remote ? [] : ["--ignore-certificate-errors"]), ...(process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : [])],
});

const failures = [];
try {
  console.log(`Page quality — ${remote ?? "the export in out/"}`);
  if (only !== "pictures") {
    console.log(`\nSpeed: Lighthouse mobile performance above ${MIN_SCORE}, median of ${RUNS}`);
    failures.push(...(await speed(browser, lighthouse, base)));
  }
  if (only !== "speed") {
    console.log("\nPictures: nothing unloaded on screen while scrolling straight down a 10 Mbit/s line");
    failures.push(...(await pictures(browser, base)));
  }
} finally {
  await browser.close().catch(() => {});
  local?.server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nAll good.");
