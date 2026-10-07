"use client";

import { createContext, use, useSyncExternalStore, type ReactNode } from "react";
import type { Currency, Prices } from "@/types";
import { CURRENCY_STORAGE_KEY } from "@/lib/currency";
import { formatAmount } from "@/lib/format";

/*
 * Currency switching without re-rendering pages: every price is rendered in every currency, and the
 * stylesheet in the root layout shows only the one named by <html data-currency>. The choice is kept
 * in localStorage and applied by a tiny head script before the page paints, so static pages stay static
 * and nothing flashes.
 */

const CHANGE_EVENT = "getset:currency";

const CurrencyContext = createContext<{ currencies: Currency[]; defaultCurrency: string } | null>(null);

export function CurrencyProvider({ currencies, defaultCurrency, children }: { currencies: Currency[]; defaultCurrency: string; children: ReactNode }) {
  return <CurrencyContext value={{ currencies, defaultCurrency }}>{children}</CurrencyContext>;
}

export function useCurrencies() {
  const value = use(CurrencyContext);
  if (!value) throw new Error("Wrap the app in <CurrencyProvider>.");
  return value;
}

/** The currency on show right now. Use it for actions (enquiries); for display, use <Price>. */
export function activeCurrency(fallback: string) {
  return (typeof document !== "undefined" && document.documentElement.dataset.currency) || fallback;
}

export function useActiveCurrency() {
  const { defaultCurrency } = useCurrencies();
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(CHANGE_EVENT, onChange);
      window.addEventListener("storage", onChange);
      return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener("storage", onChange);
      };
    },
    () => activeCurrency(defaultCurrency),
    () => defaultCurrency,
  );
}

export function setActiveCurrency(code: string) {
  document.documentElement.dataset.currency = code;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * An amount in every currency; CSS shows the selected one. Missing prices read "On request".
 * The symbol is bidi-isolated so right-to-left symbols (د.إ) sit correctly before the number.
 */
export function Price({ prices, className }: { prices: Prices; className?: string }) {
  const { currencies } = useCurrencies();
  return (
    <span className={className}>
      {currencies.map((currency) => {
        const amount = prices[currency.code];
        return (
          <span key={currency.code} data-price={currency.code}>
            {amount === undefined ? (
              "On request"
            ) : (
              <>
                <bdi>{currency.symbol}</bdi>
                {formatAmount(amount, currency)}
              </>
            )}
          </span>
        );
      })}
    </span>
  );
}

/** The INR / AED switch in the header. */
export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currencies } = useCurrencies();
  const active = useActiveCurrency();
  if (currencies.length < 2) return null;
  return (
    <div role="group" aria-label="Currency" className={`flex rounded-full bg-paper p-0.5 ring-1 ring-line ${className}`}>
      {currencies.map((currency) => (
        <button
          key={currency.code}
          type="button"
          aria-pressed={active === currency.code}
          data-currency-option={currency.code}
          title={currency.name}
          onClick={() => setActiveCurrency(currency.code)}
          className="h-8 rounded-full px-2.5 text-xs font-bold tracking-wide text-muted transition-colors hover:text-navy sm:px-3"
        >
          {currency.code}
        </button>
      ))}
    </div>
  );
}
