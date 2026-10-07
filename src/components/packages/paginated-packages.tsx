"use client";

import { useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary, Paged } from "@/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { browserApi } from "@/lib/api";
import { toSummary, type SummaryDto } from "@/lib/mappers";
import { PackageCard } from "./package-card";

/** Three columns from lg, so a page of six is two full rows. */
const SIZES = "(min-width: 1280px) 820px, (min-width: 1024px) 57vw, (min-width: 640px) 87vw, 104vw";

const pageButton =
  "leaf-xs grid h-11 min-w-11 place-items-center px-3 text-sm font-semibold transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40";

/**
 * Package grid with numbered pages. The first page arrives with the HTML (fast, indexable); later pages
 * come from the API as they are opened, and are kept once loaded. `filter` narrows the list (e.g. a branch).
 */
export function PaginatedPackages({ initial, filter = {} }: { initial: Paged<PackageSummary>; filter?: Record<string, string> }) {
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<Record<number, PackageSummary[]>>({ 1: initial.items });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { pageSize, total, totalPages: pages } = initial;
  const first = (page - 1) * pageSize;
  const visible = loaded[page] ?? [];

  const goTo = async (target: number) => {
    if (target < 1 || target > pages || target === page || loading) return;
    if (!loaded[target]) {
      setLoading(true);
      const params = new URLSearchParams({ ...filter, page: String(target), pageSize: String(pageSize) });
      const response = await browserApi<SummaryDto[]>(`/packages?${params}`);
      setLoading(false);
      if (!response.success) {
        setError("Those packages could not be loaded. Please try again.");
        return;
      }
      setError(null);
      setLoaded((current) => ({ ...current, [target]: response.data.map(toSummary) }));
    }
    setPage(target);
    // Coming from the controls under the grid: bring the first row back into view.
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <div ref={top} aria-busy={loading}>
      <ul key={page} className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((pkg, i) => (
          <li key={pkg.slug} className="flex animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
            <PackageCard pkg={pkg} sizes={SIZES} />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="sr-only">
        Page {page} of {pages}: packages {first + 1} to {first + visible.length} of {total}
      </p>
      {error && (
        <p role="alert" className="mt-6 text-sm text-danger">
          {error}
        </p>
      )}

      {pages > 1 && (
        <nav aria-label="Package pages" className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            Showing {first + 1} to {first + visible.length} of {total} packages
          </p>
          <ul className="flex items-center gap-2">
            <li>
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className={`${pageButton} text-navy ring-1 ring-line hover:bg-frost`}
              >
                <CaretLeft aria-hidden weight="bold" className="size-4" />
              </button>
            </li>
            {Array.from({ length: pages }, (_, i) => i + 1).map((number) => (
              <li key={number}>
                <button
                  type="button"
                  onClick={() => goTo(number)}
                  aria-current={number === page ? "page" : undefined}
                  aria-label={`Page ${number}`}
                  className={`${pageButton} ${
                    number === page ? "bg-navy text-white" : "text-navy ring-1 ring-line hover:bg-frost"
                  }`}
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page === pages}
                aria-label="Next page"
                className={`${pageButton} text-navy ring-1 ring-line hover:bg-frost`}
              >
                <CaretRight aria-hidden weight="bold" className="size-4" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
