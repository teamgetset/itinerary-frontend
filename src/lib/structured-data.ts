import type { Branch, SiteContent, TourPackage } from "@/types";
import { siteConfig } from "@/config/site";

const absolute = (path: string) => new URL(path, siteConfig.url).toString();
const organizationId = absolute("/#organization");

export function organizationJsonLd(branches: Branch[], content: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absolute("/icon.png"),
    email: content.contact.email,
    sameAs: content.social.map((link) => link.href),
    department: branches.map((branch) => ({
      "@type": "TravelAgency",
      name: `${siteConfig.name}, ${branch.name}`,
      telephone: branch.phone,
      ...(branch.mapUrl && { hasMap: branch.mapUrl }),
      image: absolute(branch.photo.src),
      address: {
        "@type": "PostalAddress",
        streetAddress: branch.addressLines.slice(0, -1).join(", "),
        addressLocality: branch.name,
        addressCountry: branch.country.code,
      },
    })),
  };
}

export function tripJsonLd(pkg: TourPackage) {
  const url = absolute(`/packages/${pkg.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.tagline,
    url,
    image: absolute(pkg.cover.src),
    itinerary: {
      "@type": "ItemList",
      itemListElement: pkg.itinerary.map((day) => ({
        "@type": "ListItem",
        position: day.day,
        name: `Day ${day.day}: ${day.title}`,
        description: day.description,
      })),
    },
    // One offer per currency: each is an official price, not a conversion.
    offers: Object.entries(pkg.startingPrice).map(([currency, price]) => ({
      "@type": "Offer",
      url,
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    })),
    provider: { "@id": organizationId },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
