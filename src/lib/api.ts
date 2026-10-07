/*
 * The GETSET API. Server code reads through `fetchApi` (cached, tagged, refreshed when the admin publishes);
 * browser code calls the public endpoints directly through `browserApi` (paging, search, enquiries).
 */

/** Browser-facing API origin. */
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server-to-server origin; can be an internal address. Falls back to the public one. */
const SERVER_API_URL = process.env.GETSET_API_URL ?? PUBLIC_API_URL;

/** Cache tags the API asks this site to refresh after changes (see app/api/revalidate). */
export type CacheTag = "catalog" | "testimonials" | "hero" | "content";

export interface ApiPage<T> {
  data: T;
  meta?: { page: number; pageSize: number; total: number; totalPages: number };
}

export class ApiUnavailableError extends Error {}

/**
 * Cached read for server components. Content is kept until the API says it changed (tag refresh),
 * with an hourly safety refresh. 404 returns null.
 */
export async function fetchApi<T>(path: string, options: { tags: CacheTag[]; fresh?: boolean }): Promise<ApiPage<T> | null> {
  const response = await fetch(`${SERVER_API_URL}/api/public${path}`, {
    ...(options.fresh ? { cache: "no-store" as const } : { cache: "force-cache" as const, next: { tags: options.tags, revalidate: 3600 } }),
  }).catch((error: unknown) => {
    throw new ApiUnavailableError(`GETSET API unreachable at ${SERVER_API_URL}: ${(error as Error).message}`);
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiUnavailableError(`GETSET API ${response.status} for ${path}`);
  const json = await response.json();
  return { data: json.data as T, meta: json.meta };
}

/** Public API call from the browser. Returns the parsed envelope, success or not. */
export async function browserApi<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PUBLIC_API_URL}/api/public${path}`, init);
  const json = (await response.json().catch(() => null)) as
    | { success: true; data: T; meta?: ApiPage<T>["meta"] }
    | { success: false; error: { code: string; message: string; details?: { path: string; message: string }[] } }
    | null;
  return json ?? { success: false as const, error: { code: "NETWORK", message: "We could not reach GETSET. Please try again." } };
}
