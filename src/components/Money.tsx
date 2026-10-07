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
          {marked(inCurrency(children, currency), SYMBOL[currency])}
        </span>
      ))}
    </>
  );
}

/**
 * A CURRENCY WITH NO SIGN OF ITS OWN — "CHF 60" — set as a small code beside
 * the figure, the way a sign sits: at full size the three letters are the
 * width of two more digits, and "CHF 10 CHF 8" broke the plan rows and the
 * "Total due today" line in two. The code is 55% of the figure's size, bold
 * so it keeps its weight, and a narrow no-break space from the number so the
 * two never part. A one-character sign is left as it is.
 */
function marked(text: string, symbol: string): React.ReactNode {
  const code = symbol.trim();
  if (code.length < 2) return text;
  const parts = text.split(symbol);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          {/* inline-block: a struck price's line is then drawn across the
              code at the figure's height, not at the small text's own. */}
          <span className="inline-block text-[0.55em] font-semibold">{code}</span>
          {"\u202f"}
        </>
      )}
      {part}
    </Fragment>
  ));
}
