"use client";

import { createContext, use, useId, useState, type ComponentProps, type ReactNode } from "react";
import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import type { PriceTable } from "@/types";
import { formatCurrency, formatCurrencyCode } from "@/lib/format";
import { TRAVELLER_TYPES, describeTravellers, tripTotals, type TravellerGroup, type Travellers } from "@/lib/pricing";
import { EnquiryButton } from "@/components/branches/enquiry-button";
import { CurrencyToggle, Price, activeCurrency, useCurrencies } from "@/components/currency/currency";

/** Most travellers of one age group the selector allows. Bigger groups enquire. */
const MAX = 9;

const stepButton =
  "grid size-10 shrink-0 place-items-center rounded-full text-navy ring-1 ring-line transition-colors hover:bg-frost aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-transparent";

interface Trip {
  prices: PriceTable;
  travellers: Travellers;
  setTravellers: (travellers: Travellers) => void;
}

const TripContext = createContext<Trip | null>(null);

export function useTrip() {
  const trip = use(TripContext);
  if (!trip) throw new Error("Traveller pricing must be inside <TravellersProvider>.");
  return trip;
}

/** Holds the traveller counts shared by the selector, the mobile total, WhatsApp and the enquiry form. */
export function TravellersProvider({ prices, children }: { prices: PriceTable; children: ReactNode }) {
  // Prices are per person on twin sharing, so start with a pair.
  const [travellers, setTravellers] = useState<Travellers>({ adults: 2, children: 0, infants: 0 });
  return <TripContext value={{ prices, travellers, setTravellers }}>{children}</TripContext>;
}

/** Steppers for adults, children and infants, with the total for the whole party in every currency. */
export function TravellerSelector() {
  const { prices, travellers, setTravellers } = useTrip();
  const { currencies, defaultCurrency } = useCurrencies();
  const id = useId();
  const [announcement, setAnnouncement] = useState("");
  const party = describeTravellers(travellers);
  const totals = tripTotals(prices, travellers);

  const change = (type: TravellerGroup, by: number) => {
    const next = { ...travellers, [type]: travellers[type] + by };
    setTravellers(next);
    // Announced in the currency on show, at the moment of the change.
    const code = activeCurrency(defaultCurrency);
    const currency = currencies.find((c) => c.code === code);
    const total = tripTotals(prices, next)[code];
    setAnnouncement(`${describeTravellers(next)}: ${total !== undefined && currency ? `estimated total ${formatCurrency(total, currency)}` : "price on request"}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="type-label text-muted">Travellers</p>
        <CurrencyToggle />
      </div>
      <div className="mt-2 divide-y divide-line">
        {TRAVELLER_TYPES.map(({ type, priceType, label, one, ages, min }) => {
          const count = travellers[type];
          // aria-disabled, not disabled, so keyboard focus stays on the button at the limit.
          const atMin = count <= min;
          const atMax = count >= MAX;
          return (
            <div key={type} role="group" aria-labelledby={`${id}-${type}`} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p id={`${id}-${type}`} className="font-semibold text-navy">
                  {label} <span className="ml-0.5 text-sm font-normal text-muted">{ages}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  <Price prices={prices[priceType]} /> each
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Remove one ${one}`}
                  aria-disabled={atMin}
                  onClick={() => !atMin && change(type, -1)}
                  className={stepButton}
                >
                  <Minus aria-hidden weight="bold" className="size-4" />
                </button>
                <span className="w-8 text-center text-lg font-semibold text-navy">{count}</span>
                <button
                  type="button"
                  aria-label={`Add one ${one}`}
                  aria-disabled={atMax}
                  onClick={() => !atMax && change(type, 1)}
                  className={stepButton}
                >
                  <Plus aria-hidden weight="bold" className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-line pt-5">
        <p className="type-label text-muted">Estimated total</p>
        <p className="type-display mt-1.5 text-[2.5rem] text-navy">
          <Price prices={totals} />
        </p>
        <p className="mt-1 text-sm text-muted">{party}, twin sharing, land only</p>
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

/** Compact total, for the mobile booking bar. */
export function TripTotal() {
  const { prices, travellers } = useTrip();
  const count = travellers.adults + travellers.children + travellers.infants;
  return (
    <p className="text-xs whitespace-nowrap text-muted">
      Total for {count} {count === 1 ? "traveller" : "travellers"}
      <Price prices={tripTotals(prices, travellers)} className="block text-lg font-semibold text-navy" />
    </p>
  );
}

/**
 * WhatsApp enquiry carrying the chosen travellers and the estimate. One link per currency; the stylesheet
 * shows the one for the currency on display, so the message always matches the price the visitor sees.
 */
export function TripEnquiryButton({ message, branch, ...props }: ComponentProps<typeof EnquiryButton>) {
  const { prices, travellers } = useTrip();
  const { currencies } = useCurrencies();
  const party = describeTravellers(travellers);
  if (!branch.whatsapp) return <EnquiryButton branch={branch} message={message} {...props} />;
  const totals = tripTotals(prices, travellers);
  return (
    <>
      {currencies.map((currency) => {
        const total = totals[currency.code];
        const estimate = total === undefined ? "" : ` (estimated total ${formatCurrencyCode(total, currency)})`;
        return (
          <span key={currency.code} data-price={currency.code} className="contents">
            <EnquiryButton branch={branch} message={`${message} Travellers: ${party}${estimate}.`} {...props} />
          </span>
        );
      })}
    </>
  );
}
