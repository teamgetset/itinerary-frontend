import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { getDestination, getDestinations } from "@/services/destinations";
import { DestinationHub } from "@/components/destinations/destination-hub";

/** One page per destination; a destination added in the admin gets its page without code changes. */
export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.filter((destination) => destination.packageCount > 0).map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const destination = await getDestination((await params).slug);
  if (!destination) return {};
  return pageMetadata({
    title: `${destination.name} holiday packages`,
    description: `${destination.summary} Day-by-day itineraries, hotels and prices for every GETSET trip to ${destination.name}.`,
    path: `/destinations/${destination.slug}`,
    image: destination.hero,
    seo: destination.seo,
  });
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  return <DestinationHub slug={(await params).slug} />;
}
