import { cache } from "react";
import type { PackageSummary, Paged, TourPackage } from "@/types";
import { fetchApi } from "@/lib/api";
import { toPackage, toSummary, type DetailDto, type SummaryDto } from "@/lib/mappers";

/*
 * Package reads for pages. Filtering, sorting and paging happen in the API, so pages only ever
 * receive the packages they show.
 */

export interface PackageQuery {
  page?: number;
  pageSize?: number;
  branch?: string;
  destination?: string;
  sort?: "recommended" | "price-asc" | "price-desc" | "newest";
}

const queryString = (query: PackageQuery) =>
  new URLSearchParams(Object.entries(query).flatMap(([key, value]) => (value === undefined ? [] : [[key, String(value)]]))).toString();

export const getPackagesPage = cache(async (query: PackageQuery = {}): Promise<Paged<PackageSummary>> => {
  const result = await fetchApi<SummaryDto[]>(`/packages?${queryString(query)}`, { tags: ["catalog"] });
  const meta = result?.meta ?? { page: 1, pageSize: query.pageSize ?? 12, total: 0, totalPages: 1 };
  return { items: (result?.data ?? []).map(toSummary), ...meta };
});

/** Every published package (for the sitemap, static paths and the all-packages page). */
export const getAllPackageSummaries = cache(async (query: Omit<PackageQuery, "page" | "pageSize"> = {}) => {
  const first = await getPackagesPage({ ...query, page: 1, pageSize: 48 });
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => getPackagesPage({ ...query, page: i + 2, pageSize: 48 })),
  );
  return [first, ...rest].flatMap((page) => page.items);
});

export const getPackage = cache(async (slug: string): Promise<TourPackage | null> => {
  const result = await fetchApi<DetailDto>(`/packages/${encodeURIComponent(slug)}`, { tags: ["catalog"] });
  return result ? toPackage(result.data) : null;
});

/** Trips to suggest after this one: other destinations, same branch first (decided by the API). */
export const getRecommendations = cache(async (slug: string, limit = 4): Promise<PackageSummary[]> => {
  const result = await fetchApi<SummaryDto[]>(`/packages/${encodeURIComponent(slug)}/recommendations?limit=${limit}`, { tags: ["catalog"] });
  return (result?.data ?? []).map(toSummary);
});

/** Full packages to one destination, for destination pages. */
export async function getPackagesByDestination(destination: string): Promise<TourPackage[]> {
  const summaries = await getAllPackageSummaries({ destination });
  const packages = await Promise.all(summaries.map((summary) => getPackage(summary.slug)));
  return packages.filter((pkg): pkg is TourPackage => !!pkg);
}

/** A draft or live package through a signed admin preview link. Never cached. */
export async function getPackagePreview(id: string, token: string): Promise<(TourPackage & { status: string }) | null> {
  const result = await fetchApi<DetailDto & { status: string }>(
    `/preview/packages/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`,
    { tags: [], fresh: true },
  ).catch(() => null);
  return result ? { ...toPackage(result.data), status: result.data.status } : null;
}
