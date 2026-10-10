/**
 * The checkout hand-off (2026-10-04, the launch): every Buy on the sheet goes
 * to that plan's Stripe Payment Link, and Stripe sends the buyer back to the
 * Thank You page. No network — what each link SELLS is checked against Stripe
 * separately (`docs/features/0001-stripe-pricing/PLAN.md`, Deferred).
 *
 * The "live" expectations are what stop a build with a missing live link
 * from shipping a Buy button that goes nowhere.
 */
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CHECKOUT_SESSION_URL, STRIPE_PUBLISHABLE_KEYS, dueToday, usd } from "@/lib/checkout";
import { TEMPLATES_PAGE } from "@/lib/content";
import { CHECKOUT_HOST, PAYMENT_LINKS, PLANS, THANK_YOU_PATH, checkoutUrl } from "@/lib/pricing";

const read = (path: string) => readFileSync(path, "utf8");

describe("payment links", () => {
  it("there is one pair for every plan and for nothing else", () => {
    expect(Object.keys(PAYMENT_LINKS).sort()).toEqual(PLANS.map((p) => p.id).sort());
  });

  it.each(PLANS)("$id has a test-mode link on Mushi's checkout domain", (plan) => {
    const url = new URL(PAYMENT_LINKS[plan.id].test);
    expect(url.origin).toBe(`https://${CHECKOUT_HOST}`);
    expect(url.pathname).toMatch(/^\/b\/test_[A-Za-z0-9]+$/);
  });

  it.each(PLANS)("$id has a LIVE link, and it is not a test one", (plan) => {
    const { live } = PAYMENT_LINKS[plan.id];
    const url = new URL(live);
    expect(url.origin).toBe(`https://${CHECKOUT_HOST}`);
    expect(url.pathname).toMatch(/^\/b\/[A-Za-z0-9]+$/);
    expect(live).not.toMatch(/\/test_/);
  });

  it("no two plans share a link", () => {
    const all = PLANS.flatMap((p) => [PAYMENT_LINKS[p.id].test, PAYMENT_LINKS[p.id].live]);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("checkoutUrl", () => {
  it("is the plan's link in the mode asked for", () => {
    expect(checkoutUrl("3-months", "test")).toBe(PAYMENT_LINKS["3-months"].test);
    expect(checkoutUrl("3-months", "live")).toBe(PAYMENT_LINKS["3-months"].live);
  });

  it("is live unless the build asks for test mode", () => {
    expect(checkoutUrl("12-months")).toBe(PAYMENT_LINKS["12-months"].live);
  });

  it("carries the buyer's email to Stripe, encoded", () => {
    expect(checkoutUrl("1-month", "test", "a+b@example.com")).toBe(
      `${PAYMENT_LINKS["1-month"].test}?prefilled_email=a%2Bb%40example.com`,
    );
  });
});

describe("the plan sheet", () => {
  const sheet = read("src/components/PlanSheet.tsx");
  const pay = read("src/components/StripePay.tsx");

  it("pays in place: step one leads to the payment step, which mounts Stripe's fields", () => {
    expect(sheet).toMatch(/onClick=\{goPay\}/);
    expect(sheet).toContain("<StripePay");
    expect(pay).toContain("initCheckoutElementsSdk");
    expect(pay).toContain("createPaymentElement");
  });

  it("has no card input of its own: a card number is only ever typed into Stripe's fields", () => {
    for (const source of [sheet, pay]) {
      expect(source).not.toMatch(/autoComplete="cc-(number|exp|csc)"/);
    }
  });

  it("asks the webapp for the session of the chosen plan, by lookup key", () => {
    const lib = read("src/lib/checkout.ts");
    expect(lib).toContain("fetch(CHECKOUT_SESSION_URL");
    // ...and, for a buyer the page placed in a local currency, that currency (tests/local-currency.test.ts).
    expect(lib).toContain("JSON.stringify({ plan: planFor(planId).lookupKey, ...(currencyOnPage() === CURRENCY ? {} : { currency: currencyOnPage() }) })");
    // The payment step pays for the session of ITS plan, and Stripe is
    // handed it as a promise so the fields load alongside it.
    expect(pay).toContain("const secret = checkoutSession(planId);");
    expect(pay).toContain("clientSecret: secret,");
  });

  it("asks for every plan's session as the sheet opens, the chosen one first", () => {
    expect(sheet).toContain("if (mounted) prepareCheckoutSessions(planId as PlanId);");
  });

  it("loads Stripe.js for a person, never with the page", () => {
    expect(pay).toContain('import("@stripe/stripe-js")');
    expect(pay).not.toMatch(/^import \{[^}]*loadStripe[^}]*\} from "@stripe\/stripe-js"/m);
    expect(sheet).not.toContain("@stripe/stripe-js");
    // The preload hangs on the sheet's open() — after the rise, with the
    // first step's build (2026-10-10, the hitch a third of the way up)...
    expect(sheet).toMatch(/const afterRise = \(\) => \{\s+preloadStripe\(\);\s+setBuilt\(/);
    expect(sheet).toContain("else riseTimer.current = window.setTimeout(afterRise, OPEN_MS);");
    // ...and on intent only for a mouse, whose hover comes well before the click.
    expect(sheet).toContain('if (e.type === "pointerover" && (e as PointerEvent).pointerType === "mouse") preloadStripe();');
    // ...and the sheet is otherwise built only at real input: a page that
    // has merely loaded, or been scrolled by a script, prepares nothing.
    expect(sheet).toContain('const signs = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;');
    expect(sheet).toContain("if (!mounted && !prepared) return null;");
    expect(sheet).not.toMatch(/const signs = \[[^\]]*"(scroll|load)"/);
  });

  it("is inert and unannounced while it waits off stage", () => {
    expect(sheet).toContain("inert={!mounted}");
    expect(sheet).toContain("aria-hidden={mounted ? undefined : true}");
  });

  it("says what is wrong once: Stripe's per-field line is collapsed, the sheet's alert speaks", () => {
    expect(pay).toContain('".Error": { fontSize: "0px", lineHeight: "0px", margin: "0px", marginTop: "-4px", padding: "0px", opacity: "0" }');
    expect(pay).toContain('role="alert"');
  });

  it("rings the field in use, not the whole card block", () => {
    expect(pay).toContain('".Input:focus": { boxShadow: `inset 0 0 0 ${drawn} #8b6ad6` }');
    // ...in the block's shape: Stripe's ring is square and thick, and the
    // sheet's three masks leave only the band the ring should be.
    expect(pay).toContain('const drawn = shaped ? (desktop ? "5px" : "6px") : ring;');
    // Number, expiry, security code — and the ZIP Stripe adds for a US buyer.
    expect(pay.match(/border-\[6px\] border-\[#222222\]/g)).toHaveLength(4);
    expect(pay).toContain("[2, 3].find((n) => Math.abs(tall - (n * (desktop ? 35 : 45) + (n - 1) * 2 + 8)) <= 1)");
    expect(pay).not.toContain("setFocused");
  });

  it("keeps every edge of the ring the sheet's own: Stripe's fields run under the seams", () => {
    // 2026-10-06: the ring's top was a pixel short wherever Stripe's frame
    // and the sheet's masks snapped to the screen differently.
    expect(pay).toContain("const OVERSCAN = 1;");
    expect(pay).toContain("gridRowSpacing: `${2 - 2 * over}px`");
    expect(pay).toContain('<div className={shaped ? "-m-px flow-root" : "flow-root"}>');
  });

  it("asks Stripe for rows Safari will not make taller", () => {
    // WebKit gives a text field no line shorter than its font's own (1.5em
    // for Poppins); a 17 or 23px line came out 21 and 27 and every row 4px
    // taller on an iPhone (2026-10-06).
    expect(pay).toContain('lineHeight: desktop ? "23px" : "29px"');
    expect(pay).toContain("padding: desktop ? `${6 + over}px ${14 + over}px` : `${8 + over}px ${16 + over}px`");
  });

  it("draws Stripe's frames larger with a transform, and lets no zoom reach them", () => {
    // WebKit lays out an iframe under CSS zoom at the unzoomed width: on a
    // desktop Safari and every iPad the fields were one clipped row
    // (2026-10-06).
    // (In a class, that is; the notes still say what it used to be.)
    expect(pay).not.toMatch(/className=.*\[zoom:\d/);
    expect(pay.match(/md:\[zoom:var\(--unfit,1\)\]/g)).toHaveLength(2);
    expect(pay).toContain("md:[scale:calc(1.6*var(--fit,1))]");
    expect(pay).toContain("md:[scale:calc(1.24*var(--fit,1))]");
    expect(sheet).toContain('style={{ zoom: fit, "--fit": fit, "--unfit": 1 / fit } as React.CSSProperties}');
  });

  it("follows the window across the breakpoint, and never keeps the plain ring for good", () => {
    expect(pay).toContain('wide.addEventListener("change", onWidth);');
    expect(pay).toContain("checkout.changeAppearance(appearance(desktop, shapedNow));");
    expect(pay).toContain("if (fits === shapedNow) return;");
  });

  it("keeps the email field dark when the browser autofills it", () => {
    expect(sheet).toContain("autofill:shadow-[inset_0_0_0_1000px_#222222]");
    expect(sheet).toContain("autofill:[-webkit-text-fill-color:#ffffff]");
  });

  it("checks the email itself and says so in the sheet, not in the browser's bubble", () => {
    expect(pay).toContain("<form onSubmit={onSubmit} noValidate>");
    expect(pay).toContain('setError("Please enter your email address.");');
    expect(pay).toContain('setError("Please enter a valid email address.");');
    expect(pay).not.toMatch(/name="email"\s+required/);
  });

  it("can always be paid: Stripe's hosted page is the fallback and the Pay with Link target", () => {
    expect(sheet).toContain("const hosted = checkoutUrl(o.id as PlanId);");
    expect(sheet).toMatch(/<a\s+href=\{hosted\}/);
    expect(sheet).toContain("fallbackHref={(email) => checkoutUrl(o.id as PlanId, undefined, email || undefined)}");
    expect(pay).toContain('if (stateNow.current === "unavailable") {');
    expect(pay).toContain("window.location.href = fallbackHref(email);");
  });

  it("loads the payment step behind the plan step, and leaves nothing dead while it does", () => {
    // Rendered with the sheet, not when Buy is pressed: hidden, inert, sized.
    expect(sheet).toContain('{step === "plan" && (');
    expect(sheet).toContain('inert={step === "plan"}');
    // Submit is never disabled for loading — it holds the press instead.
    expect(pay).toContain("disabled={busy}");
    expect(pay).not.toContain('disabled={state === "loading"');
    expect(pay).toContain("await settledOnce.current;");
    // Buy holds for a step that is still loading, with a ceiling.
    expect(sheet).toContain("if (!pay.current[planId]?.ready) {");
    expect(sheet).toContain("holdTimer.current = window.setTimeout(showPay, HOLD_MS);");
    expect(pay).toContain('presentable.current?.(true, "ready")');
    expect(pay).toContain('presentable.current?.(true, "unavailable")');
    // A press on the stand-in fields is honoured when Stripe's arrive.
    expect(pay).toContain('if (next === "ready" && wantsFocus.current) element?.focus();');
  });

  it("builds nothing from Stripe until the sheet is opened, then one plan's step at a time", () => {
    // 2026-10-10: all three steps built at the first pointer move were 13
    // iframes, 11 MB and close to five seconds of CPU behind a page the
    // visitor was merely reading. Only the plans in `built` have a step...
    expect(sheet).toContain("const [built, setBuilt] = useState<PlanId[]>([]);");
    expect(sheet).toMatch(/\{c\.options\.filter\(\(o\) => built\.includes\(o\.id as PlanId\)\)\.map\(\(o\) => \{\s+const on = o\.id === plan\.id;/);
    // ...the chosen plan's goes in when the sheet opens, never before...
    expect(sheet).toContain("const steps = b.length ? b : [chosen];");
    expect(sheet).not.toMatch(/setBuilt\([^)]*\)[^\n]*\n[^\n]*setPrepared\(true\);\s*\}/);
    // ...a pick builds its plan's step at once...
    expect(sheet).toContain("if (!built.includes(id as PlanId)) setBuilt([...built, id as PlanId]);");
    // ...and each step that settles starts the next, one at a time, while
    // the sheet is up — never behind a page the buyer has gone back to.
    expect(sheet).toContain("const next = ok && shown ? nextToBuild(built, pay.current) : undefined;");
    expect(sheet).toContain("if (built.some((id) => !steps[id]?.ready)) return undefined;");
  });

  it("keeps a payment step for every plan it has built: picking another plan builds nothing again", () => {
    // One StripePay per built plan, each paying for its own plan...
    expect(sheet).toContain("planId={o.id as PlanId}");
    // ...and none of them keyed by the CHOSEN plan, which is what threw the
    // finished step away each time the choice changed.
    expect(sheet).toContain("key={`${o.id}:${attempt}`}");
    expect(sheet).not.toContain("key={`${plan.id}");
    // The ones not chosen are off stage but keep their size, for Stripe.
    expect(sheet).toContain('className={on ? undefined : "pointer-events-none absolute inset-x-0 top-0 opacity-0"}');
    expect(sheet).toContain("inert={!on}");
    // Buy goes by the chosen plan's word, and only that plan's ends a hold.
    expect(sheet).toContain("if (ok && on && held.current && step === \"plan\") showPay();");
  });

  it("is held to it in a real browser on every push: the checkout gate is a CI step that cannot be skipped", () => {
    const workflow = read(".github/workflows/ci.yml");
    expect(read("package.json")).toContain('"checkout:check": "node tools/page-quality/checkout.mjs"');
    expect(workflow).toMatch(/^\s+run: npm run checkout:check$/m);
    expect(workflow).not.toMatch(/^\s*continue-on-error:/m);
  });

  it("shows three card fields and nothing else: no country selector, mandate line or Link sign-up", () => {
    expect(pay).toContain('terms: { card: "never" }');
    expect(pay).toContain('fields: { billingDetails: { address: { country: where ? "never" : "auto" } } }');
    expect(pay).toContain('wallets: { link: "never", applePay: "never", googlePay: "never" }');
  });

  it("supplies the billing country itself, from Cloudflare's report of where the visitor is", () => {
    expect(pay).toContain('fetch("/cdn-cgi/trace"');
    expect(pay).toContain("{ billingAddress: { address: { country: country.current } } }");
  });

  it("opens Pay with Link in its own small window, and falls back to the plain link if that is blocked", () => {
    expect(sheet).toMatch(/window\.open\(hosted, "mushi-checkout", `popup,/);
    expect(sheet).toContain("if (popup) e.preventDefault();");
  });

  it("never waits for ever: a stalled load gives way to the hosted page within a limit", () => {
    expect(pay).toMatch(/const LOAD_LIMIT_MS = 12_000;/);
    expect(pay).toMatch(/window\.setTimeout\(\(\) => \{[\s\S]{0,160}settle\("unavailable"\);[\s\S]{0,20}\}, LOAD_LIMIT_MS\)/);
  });

  it("shows what is charged today, not the per-month figure", () => {
    expect(sheet).toContain("const due = dueToday(plan.id as PlanId);");
    expect(sheet).toContain("{due.price}");
    expect(sheet).not.toMatch(/totalLabel[\s\S]{0,900}\{plan\.price\}/);
  });

  it("opens by itself on /templates#buy, once the page has finished painting", () => {
    expect(sheet).toContain('export const BUY_HASH = "#buy";');
    expect(sheet).toContain("if (window.location.hash !== BUY_HASH) return;");
    expect(sheet).toMatch(/attributeFilter: \["data-ready"\]/);
  });

  it("no longer hands the purchase to the webapp", () => {
    expect(sheet).not.toContain("?plan=");
  });
});

describe("the in-sheet checkout's configuration", () => {
  it("has a publishable key for each mode, and nothing but publishable keys", () => {
    expect(STRIPE_PUBLISHABLE_KEYS.test).toMatch(/^pk_test_[A-Za-z0-9]{90,}$/);
    expect(STRIPE_PUBLISHABLE_KEYS.live).toMatch(/^pk_live_[A-Za-z0-9]{90,}$/);
  });

  it("both keys belong to the one Stripe account", () => {
    // A Stripe key carries its account's id after the mode.
    expect(STRIPE_PUBLISHABLE_KEYS.test).toContain("_51Q7Da8026uErRlIm");
    expect(STRIPE_PUBLISHABLE_KEYS.live).toContain("_51Q7Da8026uErRlIm");
  });

  it("asks the webapp for sessions unless a build points it elsewhere", () => {
    expect(CHECKOUT_SESSION_URL).toBe("https://app.mushi.agency/api/checkout/session");
  });

  it.each([
    ["1-month", "$10", null],
    ["3-months", "$24", "$30"],
    ["12-months", "$60", "$120"],
  ] as const)("%s is due %s today, against %s at the monthly price", (planId, price, was) => {
    expect(dueToday(planId)).toEqual({ price, was });
  });

  it.each(PLANS)("$id: what is due today is the catalog's charge, and its discount is the pill's", (plan) => {
    const due = dueToday(plan.id);
    expect(due.price).toBe(usd(plan.amount));
    const shown = TEMPLATES_PAGE.plans.options.find((o) => o.id === plan.id);
    const was = due.was ? Number(due.was.slice(1)) * 100 : plan.amount;
    const pct = ((was - plan.amount) * 100) / was;
    expect(shown?.off ?? null).toBe(pct > 0 ? `-${pct}% OFF` : null);
  });
});

describe("the Thank You page", () => {
  const page = read("src/app/thank-you/page.tsx");

  it("lives where Stripe is told to send the buyer", () => {
    expect(THANK_YOU_PATH).toBe("/thank-you");
  });

  it("is not indexed, not in the sitemap, and disallowed for crawlers", () => {
    expect(page).toContain("robots: { index: false, follow: false }");
    expect(read("src/app/sitemap.ts")).not.toContain("thank-you");
    expect(read("src/app/robots.ts")).toContain('disallow: "/thank-you"');
  });

  it("hands a payment made in the small window back to the tab that opened it", () => {
    expect(page).toContain('window.name==="mushi-checkout"&&window.opener');
    expect(page).toContain("window.opener.location.href=location.href;window.close()");
  });

  it("sends away anyone who did not arrive from a Stripe checkout", () => {
    expect(page).toContain('location.replace("/templates")');
    const guard = /if\(!(\/.+\/)\.test\(location\.search\)\)/.exec(page)?.[1];
    expect(guard).toBeDefined();
    const pattern = new RegExp((guard as string).slice(1, -1));
    expect(pattern.test("?session_id=cs_live_a1B2c3")).toBe(true);
    expect(pattern.test("?utm=x&session_id=cs_test_a1B2c3")).toBe(true);
    expect(pattern.test("")).toBe(false);
    expect(pattern.test("?session_id=")).toBe(false);
    expect(pattern.test("?session_id=hello")).toBe(false);
  });

  it("tells the buyer the three things they need, and where to look if the email is missing", () => {
    expect(page).toContain("same email address you used when buying");
    expect(page).toContain("6-digit code");
    expect(page).toContain("Check your spam folder");
    expect(page).toContain("href={`${APP_URL}/login`}");
  });
});

describe("checkoutSession", () => {
  type Call = { url: string; init: RequestInit };
  const answer = (secret: string) => ({ ok: true, status: 200, json: async () => ({ clientSecret: secret }) }) as Response;

  async function fresh(respond: (call: Call, n: number) => Promise<Response>) {
    const calls: Call[] = [];
    vi.resetModules();
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return respond({ url, init }, calls.length);
    });
    const lib = await import("@/lib/checkout");
    return { lib, calls };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("asks once per plan and hands the same session back", async () => {
    const { lib, calls } = await fresh(async (_, n) => answer(`secret_${n}`));
    const first = lib.checkoutSession("3-months");
    expect(lib.checkoutSession("3-months")).toBe(first);
    expect(await first).toBe("secret_1");
    expect(await lib.checkoutSession("12-months")).toBe("secret_2");
    expect(calls).toHaveLength(2);
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ plan: "templates_3_months" });
  });

  it("is a request a browser sends without a preflight: POST, a string body, no headers", async () => {
    const { lib, calls } = await fresh(async () => answer("s"));
    await lib.checkoutSession("1-month");
    expect(calls[0].url).toBe(lib.CHECKOUT_SESSION_URL);
    expect(calls[0].init.method).toBe("POST");
    expect(typeof calls[0].init.body).toBe("string");
    expect(calls[0].init.headers).toBeUndefined();
  });

  it("does not keep a failure: the next ask goes to the webapp again", async () => {
    const { lib, calls } = await fresh(async (_, n) => (n === 1 ? ({ ok: false, status: 503 } as Response) : answer("second")));
    await expect(lib.checkoutSession("1-month")).rejects.toThrow("503");
    expect(await lib.checkoutSession("1-month")).toBe("second");
    expect(calls).toHaveLength(2);
  });

  it("asks afresh once a session has been kept for half an hour", async () => {
    vi.useFakeTimers();
    const { lib, calls } = await fresh(async (_, n) => answer(`secret_${n}`));
    await lib.checkoutSession("1-month");
    vi.advanceTimersByTime(31 * 60_000);
    expect(await lib.checkoutSession("1-month")).toBe("secret_2");
    expect(calls).toHaveLength(2);
  });

  it("wakes the webapp once, with a GET that creates nothing", async () => {
    const { lib, calls } = await fresh(async () => ({ ok: true, status: 204 }) as Response);
    lib.wakeCheckout();
    lib.wakeCheckout();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(lib.CHECKOUT_SESSION_URL);
    expect(calls[0].init.method).toBeUndefined();
    expect(calls[0].init.body).toBeUndefined();
    // Never a CORS request: it must not be able to fail in a buyer's console.
    expect(calls[0].init.mode).toBe("no-cors");
  });

  it("prepares the chosen plan first, then the others", async () => {
    const { lib, calls } = await fresh(async (_, n) => answer(`secret_${n}`));
    lib.prepareCheckoutSessions("3-months");
    expect(calls).toHaveLength(1);
    await lib.checkoutSession("3-months");
    await Promise.resolve();
    expect(calls.map((c) => JSON.parse(String(c.init.body)).plan)).toEqual([
      "templates_3_months",
      "templates_1_month",
      "templates_12_months",
    ]);
  });
});
