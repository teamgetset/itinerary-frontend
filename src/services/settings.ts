import { cache } from "react";
import type { Settings } from "@/types";
import { ApiUnavailableError, fetchApi } from "@/lib/api";

/** Currencies and site-wide content (hero copy, navigation, contact, defaults). One request per render. */
export const getSettings = cache(async (): Promise<Settings> => {
  const result = await fetchApi<Settings>("/settings", { tags: ["content", "catalog"] });
  if (!result) throw new ApiUnavailableError("GETSET API returned no settings");
  return result.data;
});
