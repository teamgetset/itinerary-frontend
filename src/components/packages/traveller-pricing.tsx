"use client";

import { createContext, use, useId, useState, type ComponentProps, type ReactNode } from "react";
import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import type { PriceTable } from "@/types";
import { formatCurrency, formatCurrencyCode } from "@/lib/format";
import { TRAVELLER_TYPES, describeTravellers, tripTotals, type TravellerGroup, type Travellers } from "@/lib/pricing";
import { EnquiryButton } from "@/components/branches/enquiry-button";
import { Price, useCurrencies } from "@/components/currency/currency";

/** Most travellers of one age group the selector allows. Bigger groups enquire. */
const MAX = 9;

const stepButton =
  "grid size-10 shrink-0 place-items-center rounded-full text-navy ring-1 ring-line transition-colors hover:bg-frost aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-transparent";

interface Trip {
  prices: PriceTable;
  /** The package's currency (its branch's): the one every total and message is in. */
  currency: string;
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
export function TravellersProvider({ prices, currency, children }: { prices: PriceTable; currency: string; children: ReactNode }) {
  // Prices are per person on twin sharing, so start with a pair.
  const [travellers, setTravellers] = useState<Travellers>({ adults: 2, children: 0, infants: 0 });
  return <TripContext value={{ prices, currency, travellers, setTravellers }}>{children}</TripContext>;
}

/** Steppers for adults, children and infants, with the total for the whole party in the package's currency. */
export function TravellerSelector() {
  const { prices, currency, travellers, setTravellers } = useTrip();
  const format = useCurrencies().find((c) => c.code === currency);
  const id = useId();
  const [announcement, setAnnouncement] = useState("");
  const party = describeTravellers(travellers);
  const totals = tripTotals(prices, travellers);

  const change = (type: TravellerGroup, by: number) => {
    const next = { ...travellers, [type]: travellers[type] + by };
    setTravellers(next);
    // Announced at the moment of the change.
    const total = tripTotals(prices, next)[currency];
    setAnnouncement(`${describeTravellers(next)}: ${total !== undefined && format ? `estimated total ${formatCurrency(total, format)}` : "price on request"}`);
  };

  return (
    <div>
      <p className="type-label text-muted">Travellers</p>
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
                  <Price prices={prices[priceType]} currency={currency} after=" each" />
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
          <Price prices={totals} currency={currency} />
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
  const { prices, currency, travellers } = useTrip();
  const count = travellers.adults + travellers.children + travellers.infants;
  return (
    <p className="text-xs whitespace-nowrap text-muted">
      Total for {count} {count === 1 ? "traveller" : "travellers"}
      <Price prices={tripTotals(prices, travellers)} currency={currency} className="block text-lg font-semibold text-navy" />
    </p>
  );
}

/** WhatsApp enquiry carrying the chosen travellers and the estimate, in the package's currency as shown on the page. */
export function TripEnquiryButton({ message, branch, ...props }: ComponentProps<typeof EnquiryButton>) {
  const { prices, currency, travellers } = useTrip();
  const format = useCurrencies().find((c) => c.code === currency);
  if (!branch.whatsapp) return <EnquiryButton branch={branch} message={message} {...props} />;
  const total = tripTotals(prices, travellers)[currency];
  const estimate = total === undefined || !format ? "" : ` (estimated total ${formatCurrencyCode(total, format)})`;
  return <EnquiryButton branch={branch} message={`${message} Travellers: ${describeTravellers(travellers)}${estimate}.`} {...props} />;
}
