/**
 * THE CHECKOUT GATE. One promise the plan sheet makes, checked in a real
 * browser rather than taken on trust (Žilvinas 2026-10-05, after "Buy is
 * instant" had been true only for the plan the sheet opens on: "you said
 * it's fixed" — "how to make sure that the tests do not fail anymore?").
 * `npm test` reads the sheet's SOURCE, and the source read fine while a
 * buyer who picked another plan waited for Stripe to be built again.
 *
 *   NOTHING FROM STRIPE FOR A READER (Žilvinas 2026-10-10, "templates page
 *   is super super slow"): a visitor arrives on /templates and moves, and
 *   for the next few seconds no frame of Stripe's is in the page and no
 *   session is asked of the webapp. Every plan's payment step used to be
 *   built at that first move — 13 iframes and 11 MB behind a page the
 *   visitor was reading.
 *
 *   THE RISE IS SMOOTH, AND SO ARE THE FIRST SECONDS (Žilvinas 2026-10-10,
 *   "a VERY VERY BUG when popup was going upwards", then "when you open a
 *   popup and try to quickly do the actions"): the sheet is opened on a CPU
 *   throttled 4x, a row is picked at 300, 700 and 1100ms and Buy pressed at
 *   1500, and no frame of the rise may take longer than RISE_FRAME_MS, no
 *   frame of the whole sequence longer than ACT_FRAME_MS, and at most one
 *   over RISE_FRAME_MS — Stripe.js being evaluated, once, in an idle moment.
 *   The first Stripe build used to start in the same breath as the rise, and
 *   a pick during the rise used to start that plan's at once; both stalled
 *   the sheet for 160–200ms under a buyer's hand.
 *
 *   BUY IS INSTANT ON EVERY PLAN. The visitor opens the sheet; its three
 *   payment steps are built in turn while it is up. Then, for each plan,
 *   at a laptop's width and a phone's: the sheet is opened, the plan is
 *   picked and Buy is pressed, and
 *     - the payment step is up within MAX_MS of the press;
 *     - Buy never held for it (no spinner);
 *     - the step on stage is that plan's own;
 *     - no plan's payment form was built again along the way;
 *     - the focus ring on its card fields is the shaped one — round only at
 *       the block's own corners (it fell back to Stripe's plain ring on every
 *       plan, unnoticed, when the fields began loading ahead of the session:
 *       2026-10-06).
 *   And once, on the laptop: the window is narrowed to a phone's width with
 *   the payment step up, and widened again. The card fields are still the
 *   shaped ones both times — Stripe's fields used to stay the size of the
 *   window the sheet was built in, under the other width's seams
 *   (2026-10-06).
 *   And once at each width, IN EUROS (docs/features/0002-local-currency):
 *   /templates?currency=eur shows every plan figure in euros and not one in
 *   dollars, on the page, in the sheet and on the payment step, and every
 *   session the sheet asks the webapp for names the euro — what is shown
 *   is what is charged.
 *
 * IT IS THE REAL THING: the webapp makes real Checkout Sessions and Stripe
 * draws its real fields, because the wait this guards against is theirs. The
 * webapp only answers the production origin, so the export is served to the
 * browser AS https://mushi.agency — every request for that origin is answered
 * from ./out and everything else goes to the network. Nothing is paid and no
 * key is needed; an unused session expires at Stripe within a day.
 *
 * So it can fail for a reason no commit caused — the webapp or Stripe not
 * answering. That is said in as many words, and it is still a failure:
 * "could not check" must never read as "checked".
 *
 *   npm run checkout:check                      build first: reads ./out
 *   npm run checkout:check -- --url https://mushi.agency     the live site
 *
 * Shares this folder's dependencies with check.mjs (`npm ci --prefix
 * tools/page-quality`) and needs a Chrome the same way. Plain JavaScript on
 * purpose: nothing type-checks this folder.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The origin the webapp and Stripe's Link know this site by. */
const ORIGIN = "https://mushi.agency";
const PAGE = "/templates";
/**
 * The plan step takes 170ms to slide out (STEP_OUT_MS) and the payment step
 * is swapped in behind it — 172-184ms measured. A step that has to be built
 * first takes 600ms and up.
 */
const MAX_MS = 400;
/** How long the three payment steps may take to load, in turn, once the sheet is open. */
const LOAD_MS = 25_000;
/** How long a reader's pointer move is watched for anything of Stripe's. */
const READER_MS = 4000;
/**
 * THE SPEED BUDGET FOR A READER (Žilvinas 2026-10-10, "add in the pipeline
 * the speed"): in those seconds after the pointer moves, the page may talk
 * to nothing but its own origin and the webapp's wake call, and every
 * renderer process together — the page's and any frame's — may be busy for
 * at most this long. The three Stripe checkouts that used to be built there
 * were 4.7s of CPU on a laptop; the page by itself is under 50ms, and a CI
 * runner is allowed to be many times slower than that.
 */
const READER_CPU_MS = 1500;
/**
 * THE RISE'S BUDGET: the longest a frame may take while the sheet comes up
 * (OPEN_MS, 560ms), on a CPU throttled 4x. A clean rise is 9–18ms a frame
 * there; the stall this guards against was 170–200ms. Headless Chrome draws
 * the desktop's backdrop blur in software, which costs it 40–50ms frames
 * that a real GPU does not have, so the bar sits well above those.
 */
const RISE_FRAME_MS = 100;
const RISE_MS = 600;
/** The longest any frame may take while a buyer acts in the first seconds, and how long that is watched. */
const ACT_FRAME_MS = 250;
const ACT_MS = 2600;
/**
 * THE FRAME BUDGETS ARE IN THIS LAPTOP'S MILLISECONDS. A CI runner under
 * the same 4x throttle is three times slower again, and Stripe.js's one
 * evaluation came to 533ms there against 130 here (2026-10-10, the first
 * run). So the machine is measured first — a fixed workload, timed under
 * the throttle — and every budget is scaled by how much slower than this
 * laptop it is. REF_MS is that workload here (perf/ref.mjs: 37ms, 4x).
 */
const REF_MS = 37;
/**
 * From the fields being in to the step calling itself presentable: 350ms for
 * Stripe's frame to stop moving and up to 1500 for the Link button's answer
 * (StripePay.tsx).
 */
const PRESENTABLE_MS = 2000;
/** The sheet's rise and fall, and a little (OPEN_MS in PlanSheet.tsx). */
const SHEET_MS = 800;
/** Stripe redrawing its fields for another width, and the sheet reading the result. */
const REDRAW_MS = 2500;
/** Under the sheet's md breakpoint (768). */
const NARROW = 421;
/** The local currency the euro pass asks for, and its symbol (pricing.ts, LOCAL_CURRENCIES; money.ts). */
const EURO = { query: "?currency=eur", symbol: "€", code: "eur" };

const WINDOWS = [
  { name: "desktop", width: 1512, height: 860, deviceScaleFactor: 1, isMobile: false },
  { name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const OUT = join(ROOT, "out");

const args = process.argv.slice(2);
const urlAt = args.indexOf("--url");
const remote = urlAt === -1 ? undefined : args[urlAt + 1]?.replace(/\/$/, "");

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

/** The export's answer to a request for the production origin. */
function fromExport(pathname) {
  // Cloudflare's own report of where the visitor is; the sheet asks it for
  // the billing country (StripePay.tsx).
  if (pathname.startsWith("/cdn-cgi/")) return { status: 200, contentType: "text/plain", body: "loc=US\n" };
  const path = normalize(decodeURIComponent(pathname));
  const candidates = path.endsWith("/") ? [join(OUT, path, "index.html")] : [join(OUT, path), join(OUT, `${path}.html`)];
  const file = candidates.find((candidate) => candidate.startsWith(OUT) && existsSync(candidate) && statSync(candidate).isFile());
  if (!file) return { status: 404, contentType: "text/plain", body: "Not found" };
  return { status: 200, contentType: TYPES[extname(file)] ?? "application/octet-stream", body: readFileSync(file) };
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

/* ----------------------------------------------------------------- buy --- */

/**
 * Main-thread busy time, in ms, summed over EVERY renderer process in a
 * trace — the page's and each cross-origin frame's. The page's own process
 * is not the measure: a desktop browser runs Stripe's frames out of
 * process, and the page looked idle while three of them were loading.
 */
function busyMs({ traceEvents }) {
  const threads = new Map();
  for (const event of traceEvents) if (event.ph === "M" && event.name === "thread_name") threads.set(`${event.pid}:${event.tid}`, event.args.name);
  let total = 0;
  for (const event of traceEvents) {
    if (event.ph !== "X" || !event.dur || threads.get(`${event.pid}:${event.tid}`) !== "CrRendererMain") continue;
    if (event.name !== "ThreadControllerImpl::RunTask" && event.name !== "RunTask") continue;
    total += event.dur / 1000;
  }
  return Math.round(total);
}

const pause = (ms) => new Promise((done) => setTimeout(done, ms));

/** In the page: how the three payment steps stand. */
function paymentSteps() {
  const forms = [...document.querySelectorAll('[role="dialog"] form')];
  return forms.map((form) => {
    // The card block says it is busy while Stripe draws; it is gone
    // altogether when the load has failed and the one-line fallback stands.
    const block = form.querySelector("[aria-busy]");
    return !block ? "failed" : block.getAttribute("aria-busy") === "false" ? "ready" : "loading";
  });
}

/** In the page: pick the plan, press Buy, and report how step two came. */
function pickAndBuy(index, giveUpMs) {
  const dialog = document.querySelector('[role="dialog"]');
  const radio = dialog.querySelectorAll('[role="radio"]')[index];
  // "12-months", past the row's SAVE badge.
  const name = radio.innerText.split("\n").find((line) => /^\d+-month/i.test(line.trim()))?.trim() ?? `plan ${index + 1}`;
  radio.click();
  // A buyer is never quicker than this between the two presses.
  return new Promise((done) => setTimeout(done, 60)).then(
    () =>
      new Promise((done) => {
        const buy = dialog.querySelector('[role="radiogroup"] + button');
        let held = false;
        const start = performance.now();
        const finish = (ms) => {
          seen.disconnect();
          clearTimeout(limit);
          const forms = [...dialog.querySelectorAll("form")];
          done({
            name,
            ms,
            held,
            // The step on stage is the one that is not inert.
            onStage: forms.findIndex((form) => !form.parentElement.inert),
            rebuilt: forms.filter((form) => !form.dataset.kept).length,
            // Said by the card block itself (StripePay.tsx).
            ring: forms.find((form) => !form.parentElement.inert)?.querySelector("[data-ring]")?.dataset.ring,
          });
        };
        const seen = new MutationObserver(() => {
          if (buy.getAttribute("aria-busy")) held = true;
          if (!dialog.querySelector('[role="radiogroup"]')) finish(Math.round(performance.now() - start));
        });
        seen.observe(dialog, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-busy"] });
        const limit = setTimeout(() => finish(null), giveUpMs);
        buy.click();
        if (buy.getAttribute("aria-busy")) held = true;
      }),
  );
}

async function buy(browser, window) {
  const failures = [];
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport(window);
    if (!remote) {
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.origin === ORIGIN) void request.respond(fromExport(url.pathname)).catch(() => {});
        else void request.continue().catch(() => {});
      });
    }
    await page.goto(`${remote ?? ORIGIN}${PAGE}`, { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"), { timeout: 30_000 });

    // The first sign of a person: the sheet is put in the DOM off stage from
    // here — and nothing of Stripe's with it.
    const sessionsAsked = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).pathname.endsWith("/checkout/session")) sessionsAsked.push(request.url());
    });
    const strangers = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin !== ORIGIN && !url.pathname.endsWith("/checkout/session")) strangers.push(url.host);
    });
    await page.tracing.start({ categories: ["toplevel"] });
    await page.mouse.move(200, 200);
    await page.mouse.move(230, 260, { steps: 4 });
    await page.keyboard.press("Shift");
    await pause(READER_MS);
    const cpuMs = busyMs(JSON.parse(Buffer.from(await page.tracing.stop()).toString("utf8")));
    const forReader = await page.evaluate(() => ({
      frames: [...document.querySelectorAll("iframe")].map((frame) => new URL(frame.src || "about:blank", location.href).host).filter((host) => /stripe/.test(host)),
      steps: document.querySelectorAll('[role="dialog"] form').length,
    }));
    const readerProblems = [];
    if (forReader.frames.length) readerProblems.push(`${forReader.frames.length} frame(s) of Stripe's in the page (${[...new Set(forReader.frames)].join(", ")})`);
    if (forReader.steps) readerProblems.push(`${forReader.steps} payment step(s) built`);
    if (sessionsAsked.length) readerProblems.push(`${sessionsAsked.length} session(s) asked of the webapp`);
    if (strangers.length) readerProblems.push(`${strangers.length} request(s) to ${[...new Set(strangers)].join(", ")}`);
    if (cpuMs > READER_CPU_MS) readerProblems.push(`${cpuMs}ms of CPU across every renderer process, over ${READER_CPU_MS}`);
    console.log(`  ${readerProblems.length ? "FAIL" : "pass"}  ${window.name.padEnd(8)} a reader     ${readerProblems.length ? readerProblems.join("; ") : `nothing from Stripe, ${cpuMs}ms of CPU`}`);
    for (const problem of readerProblems) failures.push(`${window.name}, a reader who has moved but not opened the sheet: ${problem}`);

    // The sheet is opened on a slow CPU and a buyer acts at once, every
    // frame timed; then it is opened again and its three steps are built
    // in turn while it is up.
    await page.emulateCPUThrottling(4);
    const machine = await page.evaluate(() => {
      const once = () => {
        const t = performance.now();
        let x = 1;
        for (let i = 0; i < 2_000_000; i++) x = (x * 1103515245 + 12345) & 0x7fffffff;
        return performance.now() - t + (x > 1e12 ? 1 : 0);
      };
      return [once(), once(), once(), once(), once()].sort((a, b) => a - b)[2];
    });
    const scale = Math.max(1, machine / REF_MS);
    const budget = (ms) => Math.round(ms * scale);
    const act = await page.evaluate(
      async ({ riseMs, actMs, slowMs }) => {
        const frames = [];
        const t0 = performance.now();
        let last = t0;
        let stop = false;
        const tick = (t) => {
          frames.push({ ms: t - last, at: t - t0 });
          last = t;
          if (!stop) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        const at = (ms) => new Promise((done) => setTimeout(done, Math.max(0, ms - (performance.now() - t0))));
        const dialog = () => document.querySelector('[role="dialog"]');
        document.querySelector("a[data-plan]").click();
        // A buyer in a hurry: three rows, then Buy.
        await at(300); dialog().querySelectorAll('[role="radio"]')[0].click();
        await at(700); dialog().querySelectorAll('[role="radio"]')[1].click();
        await at(1100); dialog().querySelectorAll('[role="radio"]')[2].click();
        await at(1500); dialog().querySelector('[role="radiogroup"] + button').click();
        await at(actMs);
        stop = true;
        const longest = (list) => list.reduce((a, f) => (f.ms > a.ms ? f : a), { ms: 0, at: 0 });
        const rise = longest(frames.filter((f) => f.at <= riseMs));
        const all = longest(frames);
        return { frames: frames.length, rise: Math.round(rise.ms), riseAt: Math.round(rise.at), worst: Math.round(all.ms), worstAt: Math.round(all.at), slow: frames.filter((f) => f.ms > slowMs).length };
      },
      { riseMs: RISE_MS, actMs: ACT_MS, slowMs: budget(RISE_FRAME_MS) },
    );
    await page.emulateCPUThrottling(1);
    // The sheet is on the payment step, or holding for it: back to the top.
    await page.keyboard.press("Escape");
    await pause(SHEET_MS);
    await page.evaluate(() => document.querySelector("a[data-plan]").click());
    const actProblems = [];
    if (act.rise > budget(RISE_FRAME_MS)) actProblems.push(`a ${act.rise}ms frame ${act.riseAt}ms into the rise, over ${budget(RISE_FRAME_MS)}`);
    if (act.worst > budget(ACT_FRAME_MS)) actProblems.push(`a ${act.worst}ms frame at ${act.worstAt}ms, over ${budget(ACT_FRAME_MS)}`);
    if (act.slow > 1) actProblems.push(`${act.slow} frames over ${budget(RISE_FRAME_MS)}ms in the first ${ACT_MS}ms, more than Stripe.js's one`);
    const machineNote = scale > 1 ? ` (this machine is ${scale.toFixed(1)}x slower than the laptop the budgets were set on; budgets scaled)` : "";
    console.log(`  ${actProblems.length ? "FAIL" : "pass"}  ${window.name.padEnd(8)} acting fast  ${actProblems.length ? actProblems.join("; ") : `${act.frames} frames, the rise's longest ${act.rise}ms, the longest ${act.worst}ms at ${act.worstAt}ms`}${machineNote}`);
    for (const problem of actProblems) failures.push(`${window.name}, opening the sheet and acting at once on a 4x-throttled CPU: ${problem}`);
    const deadline = Date.now() + LOAD_MS;
    let steps = [];
    while (Date.now() < deadline) {
      steps = await page.evaluate(paymentSteps);
      if (steps.length === 3 && steps.every((step) => step !== "loading")) break;
      await pause(100);
    }
    if (!steps.length) {
      return [...failures, `${window.name}: no payment step was built once the sheet was opened — nothing was checked`];
    }
    if (steps.length < 3 || steps.some((step) => step !== "ready")) {
      return [
        ...failures,
        `${window.name}: the payment steps did not load (${steps.join(", ")}) — the webapp or Stripe did not answer, so nothing was checked`,
      ];
    }
    await pause(PRESENTABLE_MS);
    await page.keyboard.press("Escape");
    await pause(SHEET_MS);
    // Every form is marked; one that is built again comes back without it.
    await page.evaluate(() => {
      for (const form of document.querySelectorAll('[role="dialog"] form')) form.dataset.kept = "1";
    });

    // Every plan on the sheet, whether or not it has a step of its own.
    const plans = await page.evaluate(() => document.querySelectorAll('[role="dialog"] [role="radio"]').length);
    for (let index = 0; index < plans; index++) {
      await page.evaluate(() => document.querySelector("a[data-plan]").click());
      await pause(SHEET_MS);
      const result = await page.evaluate(pickAndBuy, index, 6000);
      const problems = [];
      if (result.ms === null) problems.push("the payment step never came");
      else if (result.ms > MAX_MS) problems.push(`the payment step took ${result.ms}ms, over ${MAX_MS}`);
      if (result.held) problems.push("Buy held with a spinner");
      if (result.onStage !== index) problems.push(`the step on stage is plan ${result.onStage + 1}'s`);
      if (result.rebuilt) problems.push(`${result.rebuilt} payment form(s) were built again`);
      if (result.ring !== "shaped") problems.push(`the card fields' focus ring is ${result.ring ?? "missing"}, not the shaped one`);
      console.log(
        `  ${problems.length ? "FAIL" : "pass"}  ${window.name.padEnd(8)} ${result.name.padEnd(12)} ${result.ms === null ? "—" : `${result.ms}ms`}`,
      );
      for (const problem of problems) failures.push(`${window.name}, ${result.name}: ${problem}`);
      await page.keyboard.press("Escape");
      await pause(SHEET_MS);
    }

    // The window changes width under the payment step. (Not `isMobile`:
    // changing that reloads the page, and a reload is not what is checked.)
    if (!window.isMobile && plans) {
      await page.evaluate(() => document.querySelector("a[data-plan]").click());
      await pause(SHEET_MS);
      await page.evaluate(pickAndBuy, 0, 6000);
      for (const [name, width] of [
        [`narrowed to ${NARROW}`, NARROW],
        [`widened to ${window.width}`, window.width],
      ]) {
        await page.setViewport({ ...window, width });
        await pause(REDRAW_MS);
        const ring = await page.evaluate(
          () =>
            [...document.querySelectorAll('[role="dialog"] form')]
              .find((form) => !form.parentElement.inert)
              ?.querySelector("[data-ring]")?.dataset.ring,
        );
        console.log(`  ${ring === "shaped" ? "pass" : "FAIL"}  ${window.name.padEnd(8)} ${name}`);
        if (ring !== "shaped") {
          failures.push(`${window.name}, ${name}: the card fields did not follow the window — their ring is ${ring ?? "missing"}, not the shaped one`);
        }
      }
      await page.keyboard.press("Escape");
      await pause(SHEET_MS);
    }
  } finally {
    await context.close().catch(() => {});
  }
  return failures;
}

/* --------------------------------------------------------------- euros --- */

/** In the page: every plan figure that is on screen, and whether a dollar one is among them. */
function figuresOnScreen() {
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== "none";
  };
  const figures = [...document.querySelectorAll("[data-money]")].filter(shown).map((el) => el.textContent.trim());
  return { currency: document.documentElement.getAttribute("data-currency"), figures: [...new Set(figures)] };
}

async function inEuros(browser, window) {
  const failures = [];
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const sessions = [];
  try {
    await page.setViewport(window);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (request.method() === "POST" && url.pathname.endsWith("/checkout/session")) sessions.push(request.postData() ?? "");
      if (!remote && url.origin === ORIGIN) void request.respond(fromExport(url.pathname)).catch(() => {});
      else void request.continue().catch(() => {});
    });
    await page.goto(`${remote ?? ORIGIN}${PAGE}${EURO.query}`, { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"), { timeout: 30_000 });
    const onPage = await page.evaluate(figuresOnScreen);
    await page.mouse.move(200, 200);
    await page.mouse.move(230, 260, { steps: 4 });
    await page.evaluate(() => document.querySelector("a[data-plan]").click());
    // The steps are built once the sheet is open; every plan's session is asked for then.
    const deadline = Date.now() + LOAD_MS;
    let steps = [];
    while (Date.now() < deadline) {
      steps = await page.evaluate(paymentSteps);
      if (steps.length === 3 && steps.every((step) => step !== "loading")) break;
      await pause(100);
    }
    const inSheet = await page.evaluate(figuresOnScreen);
    await page.evaluate(pickAndBuy, 0, 6000);
    await pause(SHEET_MS);
    const onStep = await page.evaluate(figuresOnScreen);
    const problems = [];
    for (const [where, seen] of [["the page", onPage], ["the sheet", inSheet], ["the payment step", onStep]]) {
      if (seen.currency !== EURO.code) problems.push(`${where}: <html> names ${seen.currency ?? "no currency"}, not ${EURO.code}`);
      const dollars = seen.figures.filter((f) => f.includes("$"));
      if (dollars.length) problems.push(`${where}: in dollars — ${dollars.join(", ")}`);
      const euros = seen.figures.filter((f) => f.includes(EURO.symbol));
      if (!euros.length) problems.push(`${where}: no figure in euros on screen`);
    }
    const asked = [...new Set(sessions)];
    if (!asked.length) problems.push("no session was asked of the webapp");
    for (const body of asked) {
      let parsed = null;
      try { parsed = JSON.parse(body); } catch { /* reported below */ }
      if (parsed?.currency !== EURO.code) problems.push(`a session was asked for without the euro: ${body}`);
    }
    console.log(`  ${problems.length ? "FAIL" : "pass"}  ${window.name.padEnd(8)} in euros     ${inSheet.figures.filter((f) => f.includes(EURO.symbol)).slice(0, 4).join(" ")}`);
    for (const problem of problems) failures.push(`${window.name}, in euros: ${problem}`);
  } finally {
    await context.close().catch(() => {});
  }
  return failures;
}

/* ----------------------------------------------------------------- run --- */

let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  console.error("The page-quality gate's own dependencies are not installed.\nRun:  npm ci --prefix tools/page-quality");
  process.exit(2);
}

if (!remote && !existsSync(join(OUT, "templates.html")) && !existsSync(join(OUT, "templates", "index.html"))) {
  console.error("out/ does not exist — nothing to check. Run `npx next build` first, or pass --url.");
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  // GitHub's runners do not allow Chrome's sandbox; see check.mjs.
  args: process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : [],
});

const failures = [];
try {
  console.log(`Checkout — ${remote ?? `the export in out/, served as ${ORIGIN}`}`);
  console.log(
    `\nNothing from Stripe for a reader who has not opened the sheet, and a smooth rise on a slow CPU. Buy: the payment step within ${MAX_MS}ms of the press on every plan, nothing held, nothing built again, the ring shaped — still shaped when the window changes width — and in euros when asked`,
  );
  for (const window of WINDOWS) {
    try {
      failures.push(...(await buy(browser, window)));
      failures.push(...(await inEuros(browser, window)));
    } catch (reason) {
      failures.push(`${window.name}: the check itself broke — ${reason instanceof Error ? reason.message : String(reason)}`);
    }
  }
} finally {
  await browser.close().catch(() => {});
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nAll good.");
