/**
 * THE META PIXEL, AND ITS SERVER HALF (docs/features/0003-meta-pixel; Noah
 * 2026-10-23). Four events: PageView from the pixel alone; AddToCart when the
 * Pick-your-plan sheet opens, InitiateCheckout when Buy is pressed with an
 * email, Purchase on /thank-you — each of those fired here in the browser AND
 * posted to the webapp, which sends it on to Meta's Conversions API with the
 * same event_id, so Meta keeps one of the pair. The webapp adds the Purchase
 * from Stripe's webhook and the Schedule from Calendly's; this site has no
 * server and holds no token (CLAUDE.md).
 *
 * NOTHING PAINTS HALF-BUILT, AND THE PAGE NEVER LAGS (CLAUDE.md): the pixel's
 * script (~100 KB of Meta's) is not in <head> and not in the bundle. It is
 * asked for once the paint gate has lifted the veil (`data-ready` on <html>)
 * and the browser is idle, and the events fired before it arrives wait in
 * the standard `fbq` queue. The score gate (`npm run pages:check`) measures
 * the page with it.
 *
 * WHO IS NOT TRACKED: a visitor whose browser asks not to be (Global Privacy
 * Control, Do Not Track) gets no script, no cookie and no event; neither does
 * an automated browser (the CI gates open the sheet and press Buy hundreds of
 * times a week — none of that is a buyer).
 */
import { APP_URL } from "@/lib/site";

export const META_PIXEL_ID = "1264043475248995";

const SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

/** Where the server half goes: the webapp's relay, or a staging one for a preview build. */
export const META_RELAY_URL = process.env.NEXT_PUBLIC_META_RELAY || `${APP_URL}/api/meta/event`;

export type MetaEventName = "AddToCart" | "InitiateCheckout" | "Purchase";

export type MetaCustomData = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: "product";
  num_items?: number;
};

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Whether this browser may be tracked at all — see the file's head. */
export function trackingAllowed(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (n.globalPrivacyControl || n.doNotTrack === "1" || n.webdriver) return false;
  return true;
}

/** Meta's own queue stub: events called before the script arrives are replayed when it does. */
function fbq(): Fbq {
  if (window.fbq) return window.fbq;
  const f = function (...args: unknown[]) {
    if (f.callMethod) f.callMethod(...args);
    else f.queue.push(args);
  } as Fbq;
  f.queue = [];
  f.push = f;
  f.loaded = true;
  f.version = "2.0";
  window.fbq = f;
  if (!window._fbq) window._fbq = f;
  return f;
}

let started = false;

/**
 * Arms the pixel: init and PageView into the queue now, the script once the
 * first screen is finished and the browser idle. Called once, from the layout.
 */
export function startPixel(): void {
  if (started || !trackingAllowed()) return;
  started = true;
  const f = fbq();
  f("init", META_PIXEL_ID);
  f("track", "PageView");
  whenReady(() => idle(loadScript));
}

/** A client-side navigation is a new page view. */
export function trackPageView(): void {
  if (!started) return;
  fbq()("track", "PageView");
}

function whenReady(cb: () => void): void {
  const root = document.documentElement;
  if (root.hasAttribute("data-ready")) {
    cb();
    return;
  }
  const mo = new MutationObserver(() => {
    if (!root.hasAttribute("data-ready")) return;
    mo.disconnect();
    cb();
  });
  mo.observe(root, { attributes: true, attributeFilter: ["data-ready"] });
  // The gate's own ceiling is 4s; this is for a browser where it never sets.
  window.setTimeout(() => {
    mo.disconnect();
    cb();
  }, 8000);
}

let loading = false;
function idle(cb: () => void): void {
  if (loading) return;
  loading = true;
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(() => cb(), { timeout: 4000 });
  else w.setTimeout(cb, 1500);
}

function loadScript(): void {
  if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = SCRIPT_URL;
  document.head.appendChild(s);
}

function cookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** The click id: Meta's cookie, or the fbclid the ad put in the address. */
function fbc(): string | undefined {
  const set = cookie("_fbc");
  if (set) return set;
  const id = new URLSearchParams(window.location.search).get("fbclid");
  return id && /^[A-Za-z0-9_-]{1,200}$/.test(id) ? `fb.1.${Date.now()}.${id}` : undefined;
}

/** What the checkout session carries to the webhook's Purchase (lib/checkout.ts). */
export function attribution(): { fbp?: string; fbc?: string; page?: string } {
  if (!trackingAllowed()) return {};
  return { fbp: cookie("_fbp"), fbc: fbc(), page: window.location.href };
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Fires one event both ways. `eventId` is made here unless the caller has
 * the one the server half will use (the Purchase uses Stripe's session id).
 * The email, when there is one, goes hashed — never as typed.
 */
export async function track(
  name: MetaEventName,
  custom: MetaCustomData,
  opts: { eventId?: string; email?: string } = {},
): Promise<void> {
  if (!trackingAllowed()) return;
  const eventId = opts.eventId ?? crypto.randomUUID();
  fbq()("track", name, custom, { eventID: eventId });

  let em: string | undefined;
  try {
    if (opts.email) em = await sha256(opts.email);
  } catch {
    em = undefined;
  }
  const { fbp, fbc } = attribution();
  const body = JSON.stringify({
    event_name: name,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(em ? { em } : {}),
    custom_data: custom,
  });
  // A string body goes as text/plain, which crosses origins without a
  // preflight and which a beacon can carry out of a page that is leaving.
  try {
    if (navigator.sendBeacon?.(META_RELAY_URL, body)) return;
  } catch {
    // Fall through to fetch.
  }
  fetch(META_RELAY_URL, { method: "POST", body, keepalive: true }).catch(() => {});
}

/**
 * Remembered between Buy and the Thank You page, which only has the session
 * id in its address: what was bought, so its Purchase carries a value.
 */
const BOUGHT_KEY = "mushi:buying";
export type Bought = { content_ids: string[]; value: number; currency: string };

export function rememberBuying(b: Bought): void {
  try {
    sessionStorage.setItem(BOUGHT_KEY, JSON.stringify(b));
  } catch {
    // Storage off: the Purchase goes without a value; the server half has it.
  }
}

/**
 * The Purchase, from /thank-you?session_id=cs_…: once per session id, with
 * Stripe's id as the event id — the webhook's half carries the same one.
 */
export function trackPurchase(): void {
  const id = new URLSearchParams(window.location.search).get("session_id");
  if (!id || !/^cs_[A-Za-z0-9_]{8,}$/.test(id)) return;
  const doneKey = `mushi:purchased:${id}`;
  let bought: Partial<Bought> = {};
  try {
    if (sessionStorage.getItem(doneKey)) return;
    sessionStorage.setItem(doneKey, "1");
    bought = JSON.parse(sessionStorage.getItem(BOUGHT_KEY) ?? "{}") as Partial<Bought>;
  } catch {
    bought = {};
  }
  void track(
    "Purchase",
    {
      ...(typeof bought.value === "number" ? { value: bought.value } : {}),
      ...(typeof bought.currency === "string" ? { currency: bought.currency } : {}),
      ...(Array.isArray(bought.content_ids) ? { content_ids: bought.content_ids, content_type: "product" } : {}),
      num_items: 1,
    },
    { eventId: id },
  );
}
