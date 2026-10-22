import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CurrencyProvider, Price } from "@/components/currency/currency";
import { parseWishlist } from "@/hooks/use-wishlist";
import { formatCurrency, formatCurrencyCode, fillTemplate, formatPlace, formatClock } from "./format";
import { GOOGLE_REVIEWS_SHOWN, PLACEHOLDER, toDestination, toGoogleTestimonials, toHotels, toIncludedActivity, toSummary, toTimelineItem, type SummaryDto } from "./mappers";
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
  assert.equal(toSummary({ ...dto, currency: "INR", startingPrice: { INR: 36900 } }).currency, "INR", "the branch's currency, from the API");
  assert.equal(card.currency, "INR", "an API older than prices per branch: the first currency it has a price in");
});

test("prices show in the package's currency only; experiences in every currency they have; nothing converted", () => {
  const currencies = [
    { code: "INR", symbol: "₹", name: "Indian rupee", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", name: "UAE dirham", locale: "en-AE" },
  ];
  const price = (props: Parameters<typeof Price>[0]) => renderToStaticMarkup(createElement(CurrencyProvider, { currencies } as ComponentProps<typeof CurrencyProvider>, createElement(Price, props)));
  const both = { INR: 101500, AED: 2450 };
  const dubai = price({ prices: both, currency: "AED", before: "From " });
  assert.match(dubai, /From .*د\.إ.*2,450/);
  assert.doesNotMatch(dubai, /₹|1,01,500/, "a Dubai package never shows rupees, even if old INR prices are still stored");
  assert.match(price({ prices: both, currency: "INR" }), /₹.*1,01,500/, "Indian digit grouping for INR");
  assert.equal(price({ prices: { INR: 3000 }, currency: "AED", before: "From " }), "<span>On request</span>", "no price in its currency: on request, never another currency");
  const experience = price({ prices: { INR: 2000, AED: 90 }, before: "from " });
  assert.match(experience, /₹.*2,000.* · .*د\.إ.*90/, "experiences, which no branch prices, show every currency");
  assert.match(price({ prices: { AED: 90 } }), /د\.إ.*90/);
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
  assert.equal(formatPlace({ slug: "g", name: "Georgia", kind: "country", country, summary: "", about: [], hero: PLACEHOLDER, facts: [] }), "Georgia");
  assert.equal(formatPlace({ slug: "d", name: "Dubai", kind: "place", country: { code: "AE", name: "United Arab Emirates" }, summary: "", about: [], hero: PLACEHOLDER, facts: [] }), "Dubai, United Arab Emirates");
});

test("a destination's description becomes the paragraphs of its About section; none when empty", () => {
  const dto = { slug: "egypt", name: "Egypt", kind: "COUNTRY" as const, country: { code: "EG", name: "Egypt" }, shortDescription: "Pyramids.", heroImage: null, facts: [], seo: { title: null, description: null, canonicalUrl: null, ogTitle: null, ogDescription: null, ogImage: null, noindex: false } };
  assert.deepEqual(toDestination({ ...dto, description: "Cairo and Giza.\n\n  Luxor and the Nile.  \n\n\n" }).about, ["Cairo and Giza.", "Luxor and the Nile."]);
  assert.deepEqual(toDestination({ ...dto, description: "One paragraph,\nwith a line break." }).about, ["One paragraph,\nwith a line break."]);
  assert.deepEqual(toDestination({ ...dto, description: "" }).about, []);
  assert.deepEqual(toDestination(dto).about, [], "an API response without a description");
  assert.equal(toDestination(dto).summary, "Pyramids.");
});

test("Google reviews become review cards: as Google gives them, credited and linked to their profile", () => {
  const dubai = { title: "GETSET Tours & Travels", mapsUri: "https://maps.google.com/?cid=1", averageRating: 4.8, totalReviewCount: 3 };
  const review = (id: string, extra = {}) => ({ id, author: `Guest ${id}`, photoUrl: null, rating: 5, text: `Words ${id}`, createTime: "2026-03-24T10:00:00Z", location: dubai.title, ...extra });
  const cards = toGoogleTestimonials({
    enabled: true,
    locations: [dubai],
    reviews: [review("a", { photoUrl: "https://lh3.googleusercontent.com/a/x", rating: 3 }), review("anon", { author: null }), review("silent", { text: "  " })],
  });
  assert.deepEqual(cards[0], {
    id: "google-a",
    customerName: "Guest a",
    profile: "",
    image: "https://lh3.googleusercontent.com/a/x",
    rating: 3,
    review: "Words a",
    place: "",
    source: { name: "Google", url: dubai.mapsUri, date: "2026-03-24" },
  });
  assert.equal(cards[1].customerName, "A Google user", "anonymous reviewers stay anonymous");
  assert.equal(cards.length, 2, "ratings without words have nothing to quote");
  const many = toGoogleTestimonials({ enabled: true, locations: [dubai], reviews: Array.from({ length: 80 }, (_, i) => review(`r${i}`)) });
  assert.equal(many.length, GOOGLE_REVIEWS_SHOWN);
  assert.equal(many[0].id, "google-r0", "newest first, as the API sends them");
  const calicut = { title: "GETSET Calicut", mapsUri: "https://maps.google.com/?cid=2", averageRating: 4.5, totalReviewCount: 1 };
  const two = toGoogleTestimonials({ enabled: true, locations: [dubai, calicut], reviews: [review("c", { location: calicut.title })] });
  assert.deepEqual([two[0].profile, two[0].source?.url], ["GETSET Calicut", calicut.mapsUri], "with several profiles, each card names and links its own");
});
