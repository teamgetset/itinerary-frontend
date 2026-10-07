/*
 * The GETSET API. Server code reads through `fetchApi` (cached, tagged, refreshed when the admin publishes);
 * browser code calls the public endpoints directly through `browserApi` (paging, search, enquiries).
 */

/** Browser-facing API origin. `.origin` drops a trailing slash, so paths never double up. */
export const PUBLIC_API_URL = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").origin;

/** Server-to-server origin; can be an internal address. Falls back to the public one. */
const SERVER_API_URL = process.env.GETSET_API_URL ? new URL(process.env.GETSET_API_URL).origin : PUBLIC_API_URL;

/** A slow API fails the request instead of holding a page render or a spinner open. */
const TIMEOUT_MS = 10_000;

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
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...(options.fresh ? { cache: "no-store" as const } : { cache: "force-cache" as const, next: { tags: options.tags, revalidate: 3600 } }),
  }).catch((error: unknown) => {
    throw new ApiUnavailableError(`GETSET API unreachable at ${SERVER_API_URL}: ${(error as Error).message}`);
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiUnavailableError(`GETSET API ${response.status} for ${path}`);
  const json = await response.json();
  return { data: json.data as T, meta: json.meta };
}

/**
 * For page extras (reviews, slides, suggestions): if the API fails, the section is left out and the rest
 * of the page still renders. Core content (settings, the package itself) should fail loudly instead.
 */
export function orEmpty<T>(read: Promise<T[]>, what: string): Promise<T[]> {
  return read.catch((error: unknown) => {
    console.error(`GETSET API: ${what} unavailable, section hidden.`, error);
    return [];
  });
}

type ApiResult<T> =
  | { success: true; data: T; meta?: ApiPage<T>["meta"] }
  | { success: false; error: { code: string; message: string; details?: { path: string; message: string }[] } };

/** Public API call from the browser. Returns the parsed envelope, success or not; never throws (offline, CORS, timeout). */
export async function browserApi<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await fetch(`${PUBLIC_API_URL}/api/public${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), ...init }).catch(() => null);
  const json = (await response?.json().catch(() => null)) as ApiResult<T> | null | undefined;
  return json ?? { success: false, error: { code: "NETWORK", message: "We could not reach GETSET. Please try again." } };
}
