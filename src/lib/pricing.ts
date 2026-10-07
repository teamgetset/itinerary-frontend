import type { PriceTable, Prices, TravellerType } from "@/types";

/*
 * Traveller pricing for instant feedback while someone adjusts the steppers. The rule matches the API's
 * pricing service (POST /api/public/pricing/quote), which is what enquiries are estimated with:
 * each traveller pays the official price for their age group, in the chosen currency.
 */

export const TRAVELLER_TYPES = [
  { type: "adults", priceType: "ADULT", label: "Adults", one: "adult", ages: "12+ years", min: 1 },
  { type: "children", priceType: "CHILD", label: "Children", one: "child", ages: "2–11 years", min: 0 },
  { type: "infants", priceType: "INFANT", label: "Infants", one: "infant", ages: "under 2 years", min: 0 },
] as const satisfies readonly { type: string; priceType: TravellerType; label: string; one: string; ages: string; min: number }[];

export type TravellerGroup = (typeof TRAVELLER_TYPES)[number]["type"];
export type Travellers = Record<TravellerGroup, number>;

/**
 * Total per currency: (adult x adults) + (child x children) + (infant x infants).
 * A currency is left out when a needed price is missing, so the site never shows a partial total.
 */
export function tripTotals(prices: PriceTable, travellers: Travellers): Prices {
  const currencies = new Set(Object.values(prices).flatMap((byCurrency) => Object.keys(byCurrency)));
  const totals: Prices = {};
  for (const code of currencies) {
    let total = 0;
    let complete = true;
    for (const { type, priceType } of TRAVELLER_TYPES) {
      if (travellers[type] === 0) continue;
      const price = prices[priceType][code];
      if (price === undefined) complete = false;
      else total += price * travellers[type];
    }
    if (complete) totals[code] = Math.round(total * 100) / 100;
  }
  return totals;
}

/** "2 adults, 1 child". Leaves out the age groups nobody is in. */
export function describeTravellers(travellers: Travellers): string {
  return TRAVELLER_TYPES.filter(({ type }) => travellers[type] > 0)
    .map(({ type, label, one }) => `${travellers[type]} ${travellers[type] === 1 ? one : label.toLowerCase()}`)
    .join(", ");
}
