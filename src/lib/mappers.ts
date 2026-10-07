import type {
  Branch,
  Destination,
  Meal,
  PackageSummary,
  Photo,
  PriceTable,
  Prices,
  Seo,
  Testimonial,
  TourPackage,
} from "@/types";

/*
 * API responses -> UI types. Pure functions, used by server services and browser code alike.
 * The API shapes below are the parts of the public API this site reads (see docs/API.md).
 */

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
    hotel: { name: string } | null;
    activities: { time: string | null; title: string; description: string | null; location: string | null }[];
  }[];
  inclusions: { title: string }[];
  exclusions: { title: string }[];
  hotels: { name: string; starCategory: number | null; location: string; nights: number; isDefault: boolean }[];
  prices: PriceTable;
  importantInfo: string[];
  terms: string[];
  destination: DestinationDto;
  branch: BranchDto;
  reviews: { customerName: string; rating: number; review: string; source: { date: string | null } | null }[];
  pdf: { withLogoUrl: string; withoutLogoUrl: string };
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

const MEALS: Record<string, Meal> = { BREAKFAST: "Breakfast", LUNCH: "Lunch", DINNER: "Dinner" };

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
    hero: photo(dto.heroImage),
    facts: dto.facts,
    ...(dto.experiences && { experiences: dto.experiences }),
    seo: seo(dto.seo),
  };
}

export function toPackage(dto: DetailDto): TourPackage {
  const summary = toSummary(dto);
  const hotels = dto.hotels.filter((hotel) => hotel.isDefault);
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
      ...(day.hotel && { hotel: day.hotel.name }),
      ...(day.meals.length && { meals: day.meals.map((meal) => MEALS[meal]!) }),
      timeline: day.activities,
    })),
    inclusions: dto.inclusions.map((item) => item.title),
    exclusions: dto.exclusions.map((item) => item.title),
    ...(hotels.length && {
      hotels: hotels.map((hotel) => ({
        city: hotel.location,
        nights: hotel.nights,
        name: hotel.name,
        ...(hotel.starCategory && { category: `${hotel.starCategory}-star` }),
      })),
    }),
    importantInfo: dto.importantInfo,
    terms: dto.terms,
    reviews: dto.reviews.map((review) => ({
      author: review.customerName,
      rating: review.rating,
      quote: review.review,
      ...(review.source?.date && { date: review.source.date }),
    })),
    pdf: dto.pdf,
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
