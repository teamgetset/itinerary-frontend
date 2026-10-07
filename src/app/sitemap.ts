import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getBranches } from "@/services/branches";
import { getDestinations } from "@/services/destinations";
import { getAllPackageSummaries } from "@/services/packages";

/** Built from the API: new branches, destinations and packages appear here without code changes. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, branches, destinations] = await Promise.all([getAllPackageSummaries(), getBranches(), getDestinations()]);
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    ...branches.map((branch) => ({ url: url(`/branches/${branch.slug}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...destinations
      .filter((destination) => destination.packageCount > 0 && !destination.seo?.noindex)
      .map((destination) => ({ url: url(`/destinations/${destination.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: url("/packages"), changeFrequency: "weekly", priority: 0.8 },
    ...packages.map((pkg) => ({ url: url(`/packages/${pkg.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
