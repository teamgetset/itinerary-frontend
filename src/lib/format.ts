import type { Currency, Destination, TourPackage } from "@/types";

/** 54999 -> "54,999"; 101500 in en-IN -> "1,01,500". */
export const formatAmount = (amount: number, currency: Pick<Currency, "locale">) =>
  new Intl.NumberFormat(currency.locale, { maximumFractionDigits: 2 }).format(amount);

/** "₹54,999" or "د.إ2,450", using the symbol and digit grouping set for the currency in the admin. */
export const formatCurrency = (amount: number, currency: Pick<Currency, "symbol" | "locale">) =>
  `${currency.symbol}${formatAmount(amount, currency)}`;

/** For plain-text messages (WhatsApp), where a code reads more clearly than a symbol: "AED 2,450". */
export const formatCurrencyCode = (amount: number, currency: Pick<Currency, "code" | "locale">) =>
  `${currency.code} ${formatAmount(amount, currency)}`;

export function formatDuration({ days, nights }: TourPackage["duration"]) {
  return `${days} days, ${nights} nights`;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

/** "Bali, Indonesia" for places, just "Georgia" for whole countries. */
export function formatPlace(destination: Destination) {
  return destination.kind === "country" ? destination.country.name : `${destination.name}, ${destination.country.name}`;
}

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/** "Feb 2025". */
export function formatMonth(iso: string) {
  return monthFormat.format(new Date(iso));
}

/** "10:30" -> "10:30 AM". */
export function formatClock(time: string) {
  const [hours, minutes] = time.split(":").map(Number) as [number, number];
  return `${((hours + 11) % 12) + 1}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

/** Fills {branch} and {package} in the admin's WhatsApp message template. */
export const fillTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
