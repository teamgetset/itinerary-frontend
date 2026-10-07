import { cache } from "react";
import type { Destination } from "@/types";
import { fetchApi } from "@/lib/api";
import { toDestination, type DestinationDto } from "@/lib/mappers";

/** A destination with its add-on experiences (for destination pages). */
export const getDestination = cache(async (slug: string): Promise<Destination | null> => {
  const result = await fetchApi<DestinationDto>(`/destinations/${encodeURIComponent(slug)}`, { tags: ["catalog"] });
  return result ? toDestination(result.data) : null;
});

export const getDestinations = cache(async (): Promise<(Destination & { packageCount: number })[]> => {
  const result = await fetchApi<(DestinationDto & { packageCount: number })[]>("/destinations", { tags: ["catalog"] });
  return (result?.data ?? []).map((dto) => ({ ...toDestination(dto), packageCount: dto.packageCount }));
});
