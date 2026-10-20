import type {
  ActivityType,
  Branch,
  Destination,
  Hotel,
  IncludedActivity,
  ItineraryPdf,
  Meal,
  PackageSummary,
  Photo,
  PriceTable,
  Prices,
  Seo,
  Testimonial,
  TimelineItem,
  TourPackage,
} from "@/types";
import { ACTIVITY_TYPE_LABELS } from "./itinerary";

/*
 * API responses -> UI types. Pure functions, used by server services and browser code alike.
 * The API shapes below are the parts of the public API this site reads (see docs/API.md).
 */

/** One step of an itinerary day, as the API sends it. */
export interface TimelineDto {
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  type: string;
  /** The linked catalogue activity; missing from an API older than this field. */
  activity?: { slug: string; name: string; description: string; location: string | null; image: ImageDto | null } | null;
}

export interface ImageDto {
  id: string;
  url: string;
  alt: string;
  focalPoint: string | null;
}

interface SeoDto {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: ImageDto | null;
  noindex: boolean;
}

export interface SummaryDto {
  slug: string;
  title: string;
  shortDescription: string;
  category: { slug: string; name: string } | null;
  branch: { slug: string; name: string; airport: { code: string; city: string } | null };
  destination: { slug: string; name: string; kind: "COUNTRY" | "PLACE"; country: { code: string; name: string } };
  duration: { days: number; nights: number };
  arrival: { code: string; city: string } | null;
  heroImage: ImageDto | null;
  startingPrice: Prices;
  keywords: string[];
}

export interface BranchDto {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  bannerImage: ImageDto | null;
  thumbnailImage: ImageDto | null;
  addressLines: string[];
  city: string;
  country: { code: string; name: string };
  airport: { code: string; city: string } | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  mapUrl: string | null;
  packageCount?: number;
  seo: SeoDto;
}

export interface DestinationDto {
  slug: string;
  name: string;
  kind: "COUNTRY" | "PLACE";
  country: { code: string; name: string };
  shortDescription: string;
  /** Paragraphs separated by blank lines. */
  description?: string;
  heroImage: ImageDto | null;
  facts: { label: string; value: string }[];
  experiences?: { name: string; prices: Prices }[];
  seo: SeoDto;
}

export interface DetailDto extends SummaryDto {
  overview: string[];
  bestTime: string | null;
  gallery: ImageDto[];
  highlights: { title: string }[];
  itinerary: {
    dayNumber: number;
    title: string;
    description: string;
    stay: string | null;
    meals: ("BREAKFAST" | "LUNCH" | "DINNER")[];
    hotel: { name: string; starCategory: number | null; location: string } | null;
    image: ImageDto | null;
    activities: TimelineDto[];
  }[];
  inclusions: { title: string }[];
  exclusions: { title: string }[];
  hotels: { name: string; starCategory: number | null; location: string; nights: number | null; roomType: string | null; mealPlan: string | null; isDefault: boolean }[];
  /** The package's included experiences; location is missing from an API older than it. */
  activities?: { slug: string; name: string; description: string; location?: string | null; image: ImageDto | null }[];
  prices: PriceTable;
  /** Missing from an API older than "Good to know". */
  goodToKnow?: { title: string; description: string | null }[];
  importantInfo: string[];
  terms: string[];
  destination: DestinationDto;
  branch: BranchDto;
  reviews: { customerName: string; rating: number; review: string; source: { date: string | null } | null }[];
  pdf: ItineraryPdf | null;
  /** Missing from an API older than the second version. */
  pdfWithoutLogo?: ItineraryPdf | null;
  seo: SeoDto;
}

export interface TestimonialDto {
  id: string;
  customerName: string;
  profile: string;
  image: ImageDto | null;
  rating: number;
  review: string;
  place: string;
  source: { name: string; url: string | null; date: string | null } | null;
}

/** Shown when an image has been removed in the admin, so a page never breaks over a missing photo. */
export const PLACEHOLDER: Photo = { src: "/images/placeholder.jpg", alt: "" };

export const photo = (image: ImageDto | null | undefined, fallback: Photo = PLACEHOLDER): Photo =>
  image ? { src: image.url, alt: image.alt, ...(image.focalPoint && { position: image.focalPoint }) } : fallback;

const seo = (dto: SeoDto): Seo => ({ ...dto, ogImage: dto.ogImage ? photo(dto.ogImage) : null });

/** A hotel's star rating as shown on the page, e.g. "4-star". */
const stars = (starCategory: number | null) => (starCategory ? { category: `${starCategory}-star` } : {});

const MEALS: Record<string, Meal> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", DINNER: "Dinner" };

/**
 * An itinerary step for the timeline. The step's own words always win; a linked catalogue activity adds its photo, and
 * its location and description where the step has none. A type this site does not know shows as "Other" (no icon).
 */
export function toTimelineItem(entry: TimelineDto): TimelineItem {
  const linked = entry.activity;
  return {
    time: entry.time,
    title: entry.title,
    description: entry.description,
    location: entry.location || linked?.location || null,
    type: entry.type in ACTIVITY_TYPE_LABELS ? (entry.type as ActivityType) : "OTHER",
    ...(linked && {
      activity: {
        name: linked.name,
        ...(linked.description && { description: linked.description }),
        ...(linked.image && { photo: { ...photo(linked.image), alt: linked.image.alt || linked.name } }),
      },
    }),
  };
}

/**
 * The hotels for "Where you stay": only those saved in the package's Hotels tab with a hotel chosen and marked
 * "Included", with just the details entered. No fallback: without one, the page has no such section.
 */
export function toHotels(rows: DetailDto["hotels"]): Hotel[] {
  return rows
    .filter((hotel) => hotel.isDefault && hotel.name?.trim())
    .map((hotel) => ({
      city: hotel.location,
      ...(hotel.nights && { nights: hotel.nights }),
      name: hotel.name,
      ...stars(hotel.starCategory),
      ...(hotel.roomType && { roomType: hotel.roomType }),
      ...(hotel.mealPlan && { mealPlan: hotel.mealPlan }),
    }));
}

/** An included experience with only the details entered in the catalogue; its photo's alt text falls back to its name. */
export function toIncludedActivity(activity: NonNullable<DetailDto["activities"]>[number]): IncludedActivity {
  return {
    name: activity.name,
    ...(activity.description && { description: activity.description }),
    ...(activity.location && { location: activity.location }),
    ...(activity.image && { photo: { ...photo(activity.image), alt: activity.image.alt || activity.name } }),
  };
}

export function toSummary(dto: SummaryDto): PackageSummary {
  return {
    slug: dto.slug,
    title: dto.title,
    category: dto.category?.name ?? "Holiday",
    branchSlug: dto.branch.slug,
    tagline: dto.shortDescription,
    duration: dto.duration,
    startingPrice: dto.startingPrice,
    cover: photo(dto.heroImage),
    route: {
      from: dto.branch.airport ? [dto.branch.airport] : [],
      to: dto.arrival ?? { code: dto.destination.country.code, city: dto.destination.name },
    },
    keywords: dto.keywords,
    destinationName: dto.destination.name,
  };
}

export function toBranch(dto: BranchDto): Branch {
  return {
    slug: dto.slug,
    name: dto.name,
    country: dto.country,
    airport: dto.airport,
    description: dto.shortDescription,
    banner: photo(dto.bannerImage, photo(dto.thumbnailImage)),
    summary: dto.description,
    addressLines: dto.addressLines,
    phone: dto.phone,
    ...(dto.email && { email: dto.email }),
    ...(dto.whatsapp && { whatsapp: dto.whatsapp }),
    ...(dto.mapUrl && { mapUrl: dto.mapUrl }),
    photo: photo(dto.thumbnailImage, photo(dto.bannerImage)),
    packageCount: dto.packageCount ?? 0,
    seo: seo(dto.seo),
  };
}

export function toDestination(dto: DestinationDto): Destination {
  return {
    slug: dto.slug,
    name: dto.name,
    kind: dto.kind === "COUNTRY" ? "country" : "place",
    country: dto.country,
    summary: dto.shortDescription,
    about: (dto.description ?? "").split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    hero: photo(dto.heroImage),
    facts: dto.facts,
    ...(dto.experiences && { experiences: dto.experiences }),
    seo: seo(dto.seo),
  };
}

export function toPackage(dto: DetailDto): TourPackage {
  const summary = toSummary(dto);
  const hotels = toHotels(dto.hotels);
  return {
    ...summary,
    branch: toBranch(dto.branch),
    destination: toDestination(dto.destination),
    prices: dto.prices,
    bestTime: dto.bestTime,
    gallery: dto.gallery.map((image) => photo(image)),
    overview: dto.overview,
    highlights: dto.highlights.map((item) => item.title),
    itinerary: dto.itinerary.map((day) => ({
      day: day.dayNumber,
      title: day.title,
      description: day.description,
      ...(day.stay && { stay: day.stay }),
      ...(day.hotel && {
        hotel: { name: day.hotel.name, ...(day.hotel.location && { city: day.hotel.location }), ...stars(day.hotel.starCategory) },
      }),
      ...(day.meals.length && { meals: day.meals.map((meal) => MEALS[meal]!) }),
      ...(day.image && { photo: photo(day.image) }),
      timeline: day.activities.map(toTimelineItem),
    })),
    inclusions: dto.inclusions.map((item) => item.title),
    exclusions: dto.exclusions.map((item) => item.title),
    ...(hotels.length && { hotels }),
    activities: (dto.activities ?? []).map(toIncludedActivity),
    goodToKnow: (dto.goodToKnow ?? []).map(({ title, description }) => ({ title, ...(description && { description }) })),
    importantInfo: dto.importantInfo,
    terms: dto.terms,
    reviews: dto.reviews.map((review) => ({
      author: review.customerName,
      rating: review.rating,
      quote: review.review,
      ...(review.source?.date && { date: review.source.date }),
    })),
    pdf: dto.pdf,
    pdfWithoutLogo: dto.pdfWithoutLogo ?? null,
    seo: seo(dto.seo),
  };
}

export function toTestimonial(dto: TestimonialDto): Testimonial {
  return {
    id: dto.id,
    customerName: dto.customerName,
    profile: dto.profile,
    ...(dto.image && { image: dto.image.url }),
    rating: dto.rating,
    review: dto.review,
    place: dto.place,
    source: dto.source,
  };
}
