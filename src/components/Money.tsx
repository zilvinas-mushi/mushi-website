import { LOCAL_CURRENCIES } from "@/lib/pricing";
import { inCurrency } from "@/lib/money";

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
          {inCurrency(children, currency)}
        </span>
      ))}
    </>
  );
}
