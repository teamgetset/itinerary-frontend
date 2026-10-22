"use client";

import { Fragment, createContext, use, type ReactNode } from "react";
import type { Currency, Prices } from "@/types";
import { formatAmount } from "@/lib/format";

/*
 * Prices are shown in the currency they are set in, never converted and never switched by the visitor: a package's
 * prices are in its branch's currency (Dubai AED, Calicut INR). The provider only carries the site's currencies
 * (symbol, digit grouping) for formatting.
 */

const CurrencyContext = createContext<Currency[] | null>(null);

export function CurrencyProvider({ currencies, children }: { currencies: Currency[]; children: ReactNode }) {
  return <CurrencyContext value={currencies}>{children}</CurrencyContext>;
}

export function useCurrencies() {
  const value = use(CurrencyContext);
  if (!value) throw new Error("Wrap the app in <CurrencyProvider>.");
  return value;
}

/** Words around a price ("From ", " each"), styled like the text the price sits in. */
const PRICE_WORDS = "text-sm font-normal text-muted";

/**
 * A price, in `currency` (a package's: its branch's). Without `currency`, every currency it has an amount in, joined
 * with " · ": for add-on experiences, which no branch prices. A missing price reads "On request" (or `missing`), and
 * the words around it (`before`, `after`) appear only next to an actual amount, so a package without a price never
 * reads "From On request". The symbol is bidi-isolated so right-to-left symbols (د.إ) sit correctly before the number.
 */
export function Price({
  prices,
  currency,
  className,
  before,
  after,
  missing = "On request",
}: {
  prices: Prices;
  currency?: string;
  className?: string;
  before?: string;
  after?: string;
  missing?: string;
}) {
  const shown = useCurrencies().filter((c) => (!currency || c.code === currency) && prices[c.code] !== undefined);
  if (!shown.length) return <span className={className}>{missing}</span>;
  return (
    <span className={className}>
      {before && <span className={PRICE_WORDS}>{before}</span>}
      {shown.map((c, index) => (
        <Fragment key={c.code}>
          {index > 0 && <span className={PRICE_WORDS}> · </span>}
          <bdi>{c.symbol}</bdi>
          {formatAmount(prices[c.code]!, c)}
        </Fragment>
      ))}
      {after && <span className={PRICE_WORDS}>{after}</span>}
    </span>
  );
}
