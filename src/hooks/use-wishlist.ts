import { useSyncExternalStore } from "react";
import type { WishlistItem } from "@/types";

/*
 * Wishlist lives in localStorage until user accounts exist.
 * ponytail: device-only storage; sync to the wishlist API on sign-in once the backend lands.
 */
const STORAGE_KEY = "getset:wishlist";
const EMPTY: WishlistItem[] = [];
/** Distinct identity, so callers can tell "not read from storage yet" apart from "empty". */
const SERVER_SNAPSHOT: WishlistItem[] = [];
const listeners = new Set<() => void>();
let cache: WishlistItem[] | undefined;

const isItem = (value: unknown): value is WishlistItem =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as WishlistItem).packageSlug === "string" &&
  typeof (value as WishlistItem).addedAt === "string";

/** Storage is user-editable, so anything malformed is dropped rather than trusted. */
export function parseWishlist(raw: string | null): WishlistItem[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return EMPTY;
    const seen = new Set<string>();
    return data.filter((item): item is WishlistItem => {
      if (!isItem(item) || seen.has(item.packageSlug)) return false;
      seen.add(item.packageSlug);
      return true;
    });
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  if (cache === undefined) {
    try {
      cache = parseWishlist(localStorage.getItem(STORAGE_KEY));
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other open tabs in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = undefined;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(items: WishlistItem[]) {
  cache = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or full storage: the list still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const has = (slug: string) => items.some((item) => item.packageSlug === slug);
  const toggle = (slug: string) =>
    save(
      has(slug)
        ? items.filter((item) => item.packageSlug !== slug)
        : [...items, { packageSlug: slug, addedAt: new Date().toISOString() }],
    );
  return { items, has, toggle, ready: items !== SERVER_SNAPSHOT };
}
