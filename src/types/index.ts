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
  hero: Photo;
  /** Travel facts shown on hub and package pages: currency, visa, flight time. */
  facts: Fact[];
  /** Add-on experiences, priced per person (destination pages only). */
  experiences?: { name: string; prices: Prices }[];
  seo?: Seo;
}

export type Meal = "Breakfast" | "Lunch" | "Dinner";

/** A timed entry in a day's plan, e.g. 10:30 Airport pickup. */
export interface TimelineItem {
  /** "10:30", local time. */
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  /** Where the night is spent. Omitted on the departure day. */
  stay?: string;
  /** The hotel for that night, when set. */
  hotel?: string;
  meals?: Meal[];
  timeline: TimelineItem[];
}

export interface Hotel {
  city: string;
  nights: number;
  /** Property name, once confirmed. */
  name?: string;
  /** e.g. "4-star". */
  category?: string;
}

export interface Review {
  author: string;
  /** 1 to 5. */
  rating: number;
  quote: string;
  /** ISO date. */
  date?: string;
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
  /** Per traveller type (adult 12+, child 2-11, infant under 2), per currency. */
  prices: PriceTable;
  /** Adult price per currency: the "From" price on cards. */
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
  /** Confirmed hotels. Without them, the page lists stays derived from the itinerary. */
  hotels?: Hotel[];
  importantInfo: string[];
  terms: string[];
  reviews: Review[];
  /** The itinerary PDF in two prints, served by the API (always matching this content). */
  pdf: { withLogoUrl: string; withoutLogoUrl: string };
  seo: Seo;
}

/** The light shape sent to client components (cards, search, wishlist). */
export type PackageSummary = Pick<
  TourPackage,
  "slug" | "title" | "category" | "branchSlug" | "tagline" | "duration" | "startingPrice" | "cover" | "route" | "keywords"
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
