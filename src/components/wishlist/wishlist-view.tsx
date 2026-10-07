"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary } from "@/types";
import { useWishlist } from "@/hooks/use-wishlist";
import { browserApi } from "@/lib/api";
import { toSummary, type SummaryDto } from "@/lib/mappers";
import { button } from "@/components/ui/button";
import { PackageCard } from "@/components/packages/package-card";
import { CARD_SIZES } from "@/components/packages/package-grid";

const grid = "grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** Saved packages, loaded from the API by slug. Trips no longer on sale simply do not appear. */
export function WishlistView() {
  const { items, ready } = useWishlist();
  const [fetched, setFetched] = useState<PackageSummary[] | null>(null);

  // Cards stay listed until the visitor leaves the page: un-saving one keeps keyboard focus
  // on its heart and lets a second tap undo it. So fetch by the listed set, which only grows.
  const [listed, setListed] = useState<string[]>([]);
  const added = items.map((item) => item.packageSlug).filter((slug) => !listed.includes(slug));
  if (added.length > 0) setListed([...listed, ...added]);
  const slugs = [...listed].sort().join(",");

  useEffect(() => {
    if (!ready || !slugs) return;
    let current = true;
    browserApi<SummaryDto[]>(`/packages?slugs=${encodeURIComponent(slugs)}&pageSize=48`).then((response) => {
      if (current) setFetched(response.success ? response.data.map(toSummary) : []);
    });
    return () => {
      current = false;
    };
  }, [ready, slugs]);
  // Nothing saved means nothing to fetch.
  const packages = slugs ? fetched : [];

  // Storage is only readable in the browser: hold the layout with placeholders until it is.
  if (!ready || packages === null) {
    return (
      <ul aria-hidden className={grid}>
        {[0, 1, 2].map((key) => (
          <li key={key} className="leaf-md aspect-[4/3] animate-pulse bg-frost sm:aspect-[4/5]" />
        ))}
      </ul>
    );
  }

  const cards = listed.flatMap((slug) => packages.find((pkg) => pkg.slug === slug) ?? []);
  const savedCount = cards.filter((pkg) => items.some((item) => item.packageSlug === pkg.slug)).length;

  if (cards.length === 0) {
    return (
      <div className="leaf-lg flex flex-col items-center bg-paper px-6 py-20 text-center ring-1 ring-line">
        <span className="grid size-16 place-items-center rounded-full bg-sun text-night">
          <Heart aria-hidden weight="bold" className="size-7" />
        </span>
        <h2 className="type-display mt-6 text-3xl text-navy">Nothing saved yet</h2>
        <p className="mt-3 max-w-sm leading-relaxed text-muted">
          Tap the heart on any package to keep it here while you compare trips.
        </p>
        <Link href="/packages" className={button({ className: "mt-8" })}>
          Explore packages
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-10 text-muted" aria-live="polite">
        {savedCount} saved {savedCount === 1 ? "package" : "packages"}, kept on this device.
        {savedCount < cards.length && " Removed trips stay listed until you leave this page."}
      </p>
      <ul className={grid}>
        {cards.map((pkg) => (
          <li key={pkg.slug} className="flex">
            <PackageCard pkg={pkg} heading="h2" sizes={CARD_SIZES} />
          </li>
        ))}
      </ul>
    </>
  );
}
