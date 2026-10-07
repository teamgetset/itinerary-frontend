import assert from "node:assert/strict";
import { test } from "node:test";
import { parseWishlist } from "@/hooks/use-wishlist";
import { formatCurrency, formatCurrencyCode, fillTemplate, formatPlace, formatClock } from "./format";
import { staysFromItinerary } from "./itinerary";
import { PLACEHOLDER, toSummary, type SummaryDto } from "./mappers";
import { describeTravellers, tripTotals } from "./pricing";

const prices = {
  ADULT: { INR: 54999, AED: 2450 },
  CHILD: { INR: 39999, AED: 1800 },
  INFANT: { INR: 8999 },
};

test("trip totals: each traveller at their own rate, per currency; incomplete currencies left out", () => {
  assert.deepEqual(tripTotals(prices, { adults: 2, children: 1, infants: 0 }), { INR: 149997, AED: 6700 });
  // No infant price in AED: AED is not offered for a party with an infant, rather than shown too low.
  assert.deepEqual(tripTotals(prices, { adults: 2, children: 1, infants: 1 }), { INR: 158996 });
  assert.equal(describeTravellers({ adults: 2, children: 1, infants: 1 }), "2 adults, 1 child, 1 infant");
  assert.equal(describeTravellers({ adults: 1, children: 2, infants: 0 }), "1 adult, 2 children");
});

test("currency formatting uses each currency's symbol and grouping", () => {
  assert.equal(formatCurrency(101500, { symbol: "₹", locale: "en-IN" }), "₹1,01,500");
  assert.equal(formatCurrency(2450, { symbol: "د.إ", locale: "en-AE" }), "د.إ2,450");
  assert.equal(formatCurrencyCode(2450, { code: "AED", locale: "en-AE" }), "AED 2,450");
  assert.equal(formatClock("09:05"), "9:05 AM");
  assert.equal(formatClock("19:30"), "7:30 PM");
  assert.equal(fillTemplate("Hi GETSET {branch}, about {package}.", { branch: "Dubai", package: "Bali" }), "Hi GETSET Dubai, about Bali.");
});

test("API package summaries map to cards; a removed photo falls back to the placeholder", () => {
  const dto: SummaryDto = {
    slug: "bali",
    title: "Bali Island Escape",
    shortDescription: "Rice terraces.",
    category: null,
    branch: { slug: "calicut", name: "Calicut", airport: { code: "CCJ", city: "Calicut" } },
    destination: { slug: "bali", name: "Bali", kind: "PLACE", country: { code: "ID", name: "Indonesia" } },
    duration: { days: 6, nights: 5 },
    arrival: { code: "DPS", city: "Denpasar" },
    heroImage: null,
    startingPrice: { INR: 36900, AED: 1605 },
    keywords: ["islands"],
  };
  const card = toSummary(dto);
  assert.equal(card.cover, PLACEHOLDER);
  assert.deepEqual(card.route, { from: [{ code: "CCJ", city: "Calicut" }], to: { code: "DPS", city: "Denpasar" } });
  assert.equal(card.category, "Holiday");
  assert.equal(card.destinationName, "Bali");
});

test("wishlist storage drops anything malformed", () => {
  const item = { packageSlug: "bali", addedAt: "2026-10-01T00:00:00.000Z" };
  assert.deepEqual(parseWishlist(JSON.stringify([item, { packageSlug: 3 }, null, "x"])), [item]);
  assert.deepEqual(parseWishlist("{not json"), []);
  assert.deepEqual(parseWishlist(JSON.stringify({ packageSlug: "bali" })), []);
  assert.deepEqual(parseWishlist(null), []);
});

test("stays come from consecutive nights in the itinerary", () => {
  const stays = staysFromItinerary([
    { day: 1, title: "", description: "", stay: "Tbilisi", timeline: [] },
    { day: 2, title: "", description: "", stay: "Tbilisi", timeline: [] },
    { day: 3, title: "", description: "", stay: "Kazbegi", timeline: [] },
    { day: 4, title: "", description: "", timeline: [] },
  ]);
  assert.deepEqual(stays, [{ city: "Tbilisi", nights: 2 }, { city: "Kazbegi", nights: 1 }]);
});

test("places read naturally", () => {
  const country = { code: "GE", name: "Georgia" };
  assert.equal(formatPlace({ slug: "g", name: "Georgia", kind: "country", country, summary: "", hero: PLACEHOLDER, facts: [] }), "Georgia");
  assert.equal(formatPlace({ slug: "d", name: "Dubai", kind: "place", country: { code: "AE", name: "United Arab Emirates" }, summary: "", hero: PLACEHOLDER, facts: [] }), "Dubai, United Arab Emirates");
});
