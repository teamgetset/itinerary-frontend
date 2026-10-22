/**
 * Domain types used by the UI. Services (src/services) build them from the GETSET API's responses,
 * so components never depend on the API's exact shape.
 */

/** A currency the site shows prices in. Managed in the admin (code, symbol, digit grouping). */
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  /** e.g. "en-IN" groups 101500 as 1,01,500. */
  locale: string;
}

/** Official amounts by currency code, e.g. { INR: 26900, AED: 1170 }. Set per currency in the admin; never converted. */
export type Prices = Record<string, number>;

export type TravellerType = "ADULT" | "CHILD" | "INFANT";

/** Price per traveller type and currency. */
export type PriceTable = Record<TravellerType, Prices>;

/** An uploaded itinerary PDF, downloaded through the API. */
export interface ItineraryPdf {
  url: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface Photo {
  src: string;
  alt: string;
  /** Focal point as a CSS object-position, for photos whose subject is off-centre. Defaults to the centre. */
  position?: string;
}

export interface Airport {
  /** IATA code, e.g. "DXB". */
  code: string;
  city: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface Country {
  /** ISO 3166-1 alpha-2, e.g. "AE". */
  code: string;
  name: string;
}

export interface Seo {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: Photo | null;
  noindex: boolean;
}

export interface Destination {
  slug: string;
  name: string;
  /** A whole country (Georgia), or a place within one (Dubai, Bali). */
  kind: "country" | "place";
  country: Country;
  summary: string;
  /** The admin's longer introduction ("About the destination"), in paragraphs; empty when none is written. */
  about: string[];
  hero: Photo;
  /** Travel facts shown on hub and package pages: currency, visa, flight time. */
  facts: Fact[];
  /** Add-on experiences, priced per person (destination pages only). */
  experiences?: { name: string; prices: Prices }[];
  seo?: Seo;
}

export type Meal = "Breakfast" | "Lunch" | "Dinner";

/** The kind of itinerary step, chosen in the admin; it sets the step's icon. "OTHER" has none. */
export type ActivityType = "ARRIVAL" | "TRANSFER" | "CHECK_IN" | "SIGHTSEEING" | "ACTIVITY" | "MEAL" | "FREE_TIME" | "CHECK_OUT" | "DEPARTURE" | "OTHER";

/** A timed entry in a day's plan, e.g. 10:30 Airport pickup. */
export interface TimelineItem {
  /** "10:30", local time. */
  time: string | null;
  title: string;
  description: string | null;
  /** The step's own location, else its linked catalogue activity's. */
  location: string | null;
  type: ActivityType;
  /** The catalogue activity the step is linked to in the admin (only while it is switched on there). */
  activity?: { name: string; description?: string; photo?: Photo };
}

/** A catalogue experience included in a package, e.g. a desert safari. */
export interface IncludedActivity {
  name: string;
  description?: string;
  location?: string;
  photo?: Photo;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  /** Where the night is spent. Omitted on the departure day. */
  stay?: string;
  /** The hotel for that night, when one is chosen in the admin. */
  hotel?: { name: string; city?: string; category?: string };
  meals?: Meal[];
  /** The day's photo, when one is set in the admin. */
  photo?: Photo;
  timeline: TimelineItem[];
}

export interface Hotel {
  city: string;
  /** Left out when the admin did not enter it. */
  nights?: number;
  /** Property name, once confirmed. */
  name?: string;
  /** e.g. "4-star". */
  category?: string;
  /** e.g. "Deluxe room", "Half board": shown only when entered in the admin. */
  roomType?: string;
  mealPlan?: string;
}

export interface Review {
  author: string;
  /** 1 to 5. */
  rating: number;
  quote: string;
  /** ISO date. */
  date?: string;
  /** Where it was left, e.g. "Google". */
  source?: string;
}

export interface Branch {
  slug: string;
  name: string;
  country: Country;
  airport: Airport | null;
  /** What this branch's catalogue offers, shown on its card and page. */
  description: string;
  /** Large image for the branch card and branch page banner. */
  banner: Photo;
  /** About the office itself, shown with the contact details. */
  summary: string;
  addressLines: string[];
  phone: string;
  email?: string;
  /** International number without "+", used for wa.me links. */
  whatsapp?: string;
  mapUrl?: string;
  photo: Photo;
  packageCount: number;
  seo?: Seo;
}

export interface TourPackage {
  slug: string;
  title: string;
  /** Slug of the branch that sells this package. Each package belongs to exactly one branch. */
  branchSlug: string;
  branch: Branch;
  /** Short trip type shown on cards, e.g. "Family", "Honeymoon". */
  category: string;
  destination: Destination;
  tagline: string;
  duration: { days: number; nights: number };
  /** The one currency its prices are in and shown in: its branch's (Dubai AED, Calicut INR). */
  currency: string;
  /** Per traveller type (adult 12+, child 2-11, infant under 2), in `currency`. */
  prices: PriceTable;
  /** Adult price in `currency`: the "From" price on cards. */
  startingPrice: Prices;
  route: { from: Airport[]; to: Airport };
  bestTime: string | null;
  cover: Photo;
  gallery: Photo[];
  overview: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  /** Free-text keywords that help search, e.g. "honeymoon", "skiing". */
  keywords: string[];
  /** Hotels saved in the admin's Hotels tab (chosen and marked "Included"). Without them there is no "Where you stay". */
  hotels?: Hotel[];
  /** Practical tips for this trip, shown under "Good to know" after the destination's travel facts. */
  goodToKnow: { title: string; description?: string }[];
  /** The notes for every package, then this package's own. */
  importantInfo: string[];
  terms: string[];
  reviews: Review[];
  /** Experiences included in the package (its Activities tab in the admin), in the admin's order. */
  activities: IncludedActivity[];
  /** The uploaded itinerary PDF with the GETSET logo; null when the package has none yet. */
  pdf: ItineraryPdf | null;
  /** The same itinerary without the logo; null when it has not been uploaded. */
  pdfWithoutLogo: ItineraryPdf | null;
  seo: Seo;
}

/** The light shape sent to client components (cards, search, wishlist). */
export type PackageSummary = Pick<
  TourPackage,
  "slug" | "title" | "category" | "branchSlug" | "tagline" | "duration" | "currency" | "startingPrice" | "cover" | "route" | "keywords"
> & { destinationName: string };

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** A customer review shown site-wide. Comes from a real, attributable source. */
export interface Testimonial {
  id: string;
  customerName: string;
  /** Short descriptor, e.g. "Malaysia holiday" or "Visit visa". */
  profile: string;
  /** Photo URL, only with the customer's permission. Without it the card shows a monogram. */
  image?: string;
  /** 1 to 5. */
  rating: number;
  review: string;
  /** Where the trip or service took place. */
  place: string;
  source: { name: string; url: string | null; date: string | null } | null;
}

export interface NavLink {
  label: string;
  href: string;
}

/** Site-wide content edited in the admin's Global content page. */
export interface SiteContent {
  "home.hero": { eyebrow: string; heading: string; description: string; primaryCta: NavLink; secondaryCta: NavLink | null };
  "home.branches": { heading: string; description: string };
  "home.packages": { heading: string; description: string };
  testimonials: { enabled: boolean; heading: string; description: string };
  navigation: { header: NavLink[]; footer: NavLink[] };
  contact: { email: string; whatsapp: string };
  social: { network: string; label: string; href: string }[];
  footer: { tagline: string; legalName: string };
  "package.defaults": { importantInfo: string[]; terms: string[] };
  enquiry: { whatsappTemplate: string };
}

export interface Settings {
  defaultCurrency: string;
  currencies: Currency[];
  content: SiteContent;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface WishlistItem {
  packageSlug: string;
  /** ISO timestamp. */
  addedAt: string;
}
