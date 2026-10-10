import { Fragment } from "react";
import { LOCAL_CURRENCIES } from "@/lib/pricing";
import { SYMBOL, inCurrency } from "@/lib/money";

/**
 * A plan figure, in every currency the plan is sold in: the dollar string
 * as written in content.ts and, beside it, the same figure in each local
 * currency. globals.css shows the one <html data-currency> names and hides
 * the rest (see money.ts). Wrap the WHOLE string — "SAVE $60", "$24 total"
 * — so the symbol changes in place.
 */
export function Money({ children }: { children: string }) {
  return (
    <>
      <span data-money="usd">{children}</span>
      {LOCAL_CURRENCIES.map((currency) => (
        <span key={currency} data-money={currency}>
          {withCode(inCurrency(children, currency), SYMBOL[currency])}
        </span>
      ))}
    </>
  );
}

/**
 * A CURRENCY WRITTEN AS A CODE IS SET SMALLER THAN ITS FIGURE (2026-10-10,
 * the francs): "CHF 10" at the figure's own size is twice the width of
 * "$10", and in the plan rows that pushed "12-months" onto two lines. So
 * the code goes in a span of its own, which globals.css (.money-code) sets
 * at 0.6em — the way a price tag writes it — and the figure keeps its
 * size. A sign ($, €, £) is left in the run as it is. The space after the
 * code is unbreakable: the code and its figure are one word.
 */
function withCode(text: string, symbol: string) {
  if (!symbol.endsWith(" ")) return text;
  const code = symbol.trim();
  const parts = text.split(symbol);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          <span className="money-code">{code}</span>
          {"\u00a0"}
        </>
      )}
      {part}
    </Fragment>
  ));
}
