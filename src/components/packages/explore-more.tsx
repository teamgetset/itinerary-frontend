import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary } from "@/types";
import { button } from "@/components/ui/button";
import { PackageCard } from "./package-card";
import { CARD_SIZES } from "./package-grid";

/** End-of-page suggestions: a swipeable rail up to laptop widths, a four-up grid from xl. */
export function ExploreMore({ packages }: { packages: PackageSummary[] }) {
  if (packages.length === 0) return null;

  return (
    <section aria-labelledby="explore-more-title" className="mt-24 border-t border-line bg-paper py-20 lg:mt-32 lg:py-24">
      <div className="shell">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 id="explore-more-title" className="type-display text-4xl text-navy md:text-5xl">
              Explore more packages
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">You may also like these trips.</p>
          </div>
          <Link href="/packages" className={button({ variant: "outline" })}>
            Explore packages
            <ArrowRight aria-hidden weight="bold" className="size-4" />
          </Link>
        </div>

        <ul className="-mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:-mx-8 md:scroll-px-8 md:px-8 xl:mx-0 xl:grid xl:grid-cols-4 xl:gap-6 xl:overflow-visible xl:px-0 xl:pb-0">
          {packages.map((pkg) => (
            <li key={pkg.slug} className="flex w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[30%] xl:w-auto">
              <PackageCard pkg={pkg} sizes={CARD_SIZES} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
