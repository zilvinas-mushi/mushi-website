/**
 * A PRICE IN THE VISITOR'S OWN CURRENCY (docs/features/0002-local-currency;
 * Žilvinas 2026-10-06: "same $5 and €5 — so that people feel the product is
 * meant for them, not another part of the world").
 *
 * THE SAME NUMBER, ANOTHER SYMBOL. Every plan costs the same figure in each
 * currency it is sold in (pricing.ts, `local`; tests/pricing.parity.test.ts
 * holds it to that), so a dollar string from content.ts becomes the euro
 * one by changing its symbol and nothing else. That is what lets the page be
 * rendered once, with every currency in it, and the right one shown.
 *
 * WHICH CURRENCY is decided before the first paint, by the inline head
 * script (paint-gate-script.ts): `?currency=eur` for the visit, else the
 * browser's time zone. It is written on <html> as `data-currency`, and
 * globals.css shows the matching `data-money` span and hides the others —
 * no JavaScript swaps a figure after it is on screen, and with no
 * JavaScript at all the page is in dollars. The checkout reads the same
 * attribute (checkout.ts) so what is charged is what was shown.
 */
import { CURRENCY, LOCAL_CURRENCIES, type Currency } from "@/lib/pricing";

export const SYMBOL: Record<Currency, string> = { usd: "$", eur: "€" };

/** A dollar string from content.ts ("$24 total", "SAVE $60") in another currency. */
export function inCurrency(text: string, currency: Currency): string {
  return text.replace(/\$/g, SYMBOL[currency]);
}

/** "$10", or "$7.50" when the cents are not zero; "€10" in euros. */
export function money(minor: number, currency: Currency = CURRENCY): string {
  const figure = minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2);
  return `${SYMBOL[currency]}${figure}`;
}

/** The currency this page was painted in — the head script's word, or dollars. */
export function currencyOnPage(): Currency {
  if (typeof document === "undefined") return CURRENCY;
  const set = document.documentElement.getAttribute("data-currency");
  return (LOCAL_CURRENCIES as readonly string[]).includes(set ?? "") ? (set as Currency) : CURRENCY;
}
