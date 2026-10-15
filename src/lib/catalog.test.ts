import assert from "node:assert/strict";
import { test } from "node:test";
import { parseWishlist } from "@/hooks/use-wishlist";
import { formatCurrency, formatCurrencyCode, fillTemplate, formatPlace, formatClock } from "./format";
import { PLACEHOLDER, toHotels, toIncludedActivity, toSummary, toTimelineItem, type SummaryDto } from "./mappers";
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

test("timeline steps carry their type and their linked catalogue activity; the step's own words win", () => {
  const step = { time: "16:30", title: "Dune drive", description: null, location: null };
  const image = { id: "m1", url: "https://res.cloudinary.com/demo/image/upload/safari.jpg", alt: "", focalPoint: "center 30%" };
  const safari = { slug: "desert-safari", name: "Desert Safari", description: "Dune drive, camel ride and a barbecue dinner.", location: "Lahbab desert", image };

  assert.deepEqual(toTimelineItem({ ...step, type: "ACTIVITY", activity: safari }), {
    ...step,
    location: "Lahbab desert",
    type: "ACTIVITY",
    activity: { name: "Desert Safari", description: "Dune drive, camel ride and a barbecue dinner.", photo: { src: image.url, alt: "Desert Safari", position: "center 30%" } },
  });
  assert.equal(toTimelineItem({ ...step, location: "Camp Al Khayma", type: "ACTIVITY", activity: safari }).location, "Camp Al Khayma", "own location first");
  assert.deepEqual(toTimelineItem({ ...step, type: "ACTIVITY", activity: { ...safari, description: "", location: null, image: null } }).activity, { name: "Desert Safari" });
  // Unlinked steps are as before; a type this site does not know shows as "Other".
  assert.deepEqual(toTimelineItem({ ...step, type: "TRANSFER", activity: null }), { ...step, type: "TRANSFER" });
  assert.deepEqual(toTimelineItem({ ...step, type: "TRANSFER" }), { ...step, type: "TRANSFER" }, "an API without the link field");
  assert.equal(toTimelineItem({ ...step, type: "HELICOPTER" }).type, "OTHER");
});

test("Where you stay: only hotels saved and marked Included, with just the details entered; no fallback", () => {
  const row = { name: "Atlantis The Palm", starCategory: 5, location: "Palm Jumeirah, Dubai", nights: null, roomType: null, mealPlan: null, isDefault: true };
  assert.deepEqual(toHotels([]), [], "nothing saved: no section");
  assert.deepEqual(toHotels([{ ...row, isDefault: false }]), [], "an alternative is not a stay");
  assert.deepEqual(toHotels([{ ...row, name: "  " }]), [], "a hotel without a name is not valid");
  assert.deepEqual(toHotels([row]), [{ city: "Palm Jumeirah, Dubai", name: "Atlantis The Palm", category: "5-star" }]);
  assert.deepEqual(toHotels([{ ...row, starCategory: null, nights: 3, roomType: "Ocean suite", mealPlan: "Half board" }]), [
    { city: "Palm Jumeirah, Dubai", nights: 3, name: "Atlantis The Palm", roomType: "Ocean suite", mealPlan: "Half board" },
  ]);
});

test("included experiences keep only the details entered; the photo's alt text falls back to the name", () => {
  const image = { id: "m1", url: "https://res.cloudinary.com/demo/image/upload/dhow.jpg", alt: "", focalPoint: null };
  assert.deepEqual(
    toIncludedActivity({ slug: "dhow-cruise", name: "Dhow Cruise", description: "Dinner on a dhow.", location: "Dubai Marina", image }),
    { name: "Dhow Cruise", description: "Dinner on a dhow.", location: "Dubai Marina", photo: { src: image.url, alt: "Dhow Cruise" } },
  );
  assert.deepEqual(toIncludedActivity({ slug: "garden", name: "Miracle Garden", description: "", location: null, image: null }), { name: "Miracle Garden" });
  assert.deepEqual(toIncludedActivity({ slug: "garden", name: "Miracle Garden", description: "", image: null }), { name: "Miracle Garden" }, "an API without location");
});

test("places read naturally", () => {
  const country = { code: "GE", name: "Georgia" };
  assert.equal(formatPlace({ slug: "g", name: "Georgia", kind: "country", country, summary: "", hero: PLACEHOLDER, facts: [] }), "Georgia");
  assert.equal(formatPlace({ slug: "d", name: "Dubai", kind: "place", country: { code: "AE", name: "United Arab Emirates" }, summary: "", hero: PLACEHOLDER, facts: [] }), "Dubai, United Arab Emirates");
});
