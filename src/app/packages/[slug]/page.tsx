import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDuration, fillTemplate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { getAllPackageSummaries, getPackage, getRecommendations } from "@/services/packages";
import { getSettings } from "@/services/settings";
import { PackageView } from "@/components/packages/package-view";

export async function generateStaticParams() {
  const packages = await getAllPackageSummaries();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const pkg = await getPackage((await params).slug);
  if (!pkg) return {};
  return pageMetadata({
    title: pkg.title,
    description: `${pkg.tagline} ${formatDuration(pkg.duration)}, with a downloadable day-by-day itinerary.`,
    path: `/packages/${pkg.slug}`,
    image: pkg.cover,
    seo: pkg.seo,
  });
}

export default async function PackagePage({ params }: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const [pkg, suggestions, { content }] = await Promise.all([getPackage(slug), getRecommendations(slug), getSettings()]);
  if (!pkg) notFound();
  const enquiry = fillTemplate(content.enquiry.whatsappTemplate, { branch: pkg.branch.name, package: pkg.title });
  return <PackageView pkg={pkg} suggestions={suggestions} enquiry={enquiry} />;
}
