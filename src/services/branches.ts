import { cache } from "react";
import type { Branch } from "@/types";
import { fetchApi } from "@/lib/api";
import { toBranch, type BranchDto } from "@/lib/mappers";

/** Active branches, in the admin's display order, with their published package counts. */
export const getBranches = cache(async (): Promise<Branch[]> => {
  const result = await fetchApi<BranchDto[]>("/branches", { tags: ["catalog"] });
  return (result?.data ?? []).map(toBranch);
});

export const getBranch = cache(async (slug: string): Promise<Branch | null> => {
  const result = await fetchApi<BranchDto>(`/branches/${encodeURIComponent(slug)}`, { tags: ["catalog"] });
  return result ? toBranch(result.data) : null;
});
