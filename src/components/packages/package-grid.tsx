import type { PackageSummary } from "@/types";
import { PackageCard } from "./package-card";

/** Rendered width of a 3:2 photo filling the card: about 1.9x the card width at 4:5, 1.1x at 4:3. */
export const CARD_SIZES = "(min-width: 1280px) 600px, (min-width: 1024px) 57vw, (min-width: 640px) 87vw, 104vw";

/** Responsive card grid. `stagger` drops alternate columns for an editorial rhythm (see .stagger-grid). */
export function PackageGrid({
  packages,
  stagger = false,
  heading = "h3",
  className = "",
}: {
  packages: PackageSummary[];
  stagger?: boolean;
  /** Card title level: h2 when the grid sits directly under the page h1. */
  heading?: "h2" | "h3";
  className?: string;
}) {
  return (
    <ul
      className={`grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${stagger ? "stagger-grid" : ""} ${className}`}
    >
      {packages.map((pkg) => (
        <li key={pkg.slug} data-reveal className="flex">
          <PackageCard pkg={pkg} sizes={CARD_SIZES} heading={heading} />
        </li>
      ))}
    </ul>
  );
}
