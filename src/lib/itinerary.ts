import type { Hotel, ItineraryDay } from "@/types";

/** Consecutive nights in the same place, in order: the stays implied by a day-by-day plan. */
export function staysFromItinerary(days: ItineraryDay[]): Hotel[] {
  const stays: Hotel[] = [];
  for (const day of days) {
    if (!day.stay) continue;
    const last = stays.at(-1);
    if (last?.city === day.stay) last.nights += 1;
    else stays.push({ city: day.stay, nights: 1 });
  }
  return stays;
}
