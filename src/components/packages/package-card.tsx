import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary } from "@/types";
import { formatDuration } from "@/lib/format";
import { Price } from "@/components/currency/currency";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { RouteLine } from "./route-line";
import { OPEN_PACKAGE, OPEN_PACKAGE_MORPH } from "./view-transitions";

/**
 * Package card. The title link stretches over the whole card; the wishlist button sits above it,
 * so both stay separate, valid interactive elements.
 * The photo shares a view-transition name with the package page hero, so it morphs on navigation.
 * Works in server and client trees.
 */
export function PackageCard({
  pkg,
  sizes,
  heading: Heading = "h3",
}: {
  pkg: PackageSummary;
  sizes: string;
  heading?: "h2" | "h3";
}) {
  return (
    <article className="group relative flex w-full flex-col">
      <div className="relative">
        <ViewTransition name={`package-${pkg.slug}`} share={OPEN_PACKAGE_MORPH} default="none">
          <div className="leaf-md relative aspect-[4/3] overflow-hidden bg-frost transition-[translate,box-shadow] duration-500 ease-glide group-hover:-translate-y-1 group-hover:shadow-[0_28px_44px_-26px_rgb(0_33_66/0.55)] sm:aspect-[4/5]">
            <Image
              src={pkg.cover.src}
              alt={pkg.cover.alt}
              fill
              sizes={sizes}
              style={{ objectPosition: pkg.cover.position }}
              className="object-cover transition-transform duration-[1.2s] ease-glide group-hover:scale-[1.045]"
            />
          </div>
        </ViewTransition>
        <WishlistButton slug={pkg.slug} title={pkg.title} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <RouteLine code={pkg.route.to.code} city={pkg.route.to.city} />
        <p className="mt-3 text-sm font-medium text-cobalt">
          {pkg.destinationName} · {pkg.category}
        </p>
        <Heading className="mt-1 text-xl font-semibold tracking-tight text-navy">
          <Link
            href={`/packages/${pkg.slug}`}
            transitionTypes={[OPEN_PACKAGE]}
            className="outline-none after:leaf-md after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-cobalt"
          >
            {pkg.title}
          </Link>
        </Heading>
        <p className="mt-1.5 line-clamp-2 leading-relaxed text-muted">{pkg.tagline}</p>
        <p className="mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-4 text-sm text-muted">
          <span>{formatDuration(pkg.duration)}</span>
          <span>
            From <Price prices={pkg.startingPrice} className="text-base font-semibold text-navy" />
          </span>
        </p>
        {/* Visual cue only: the title link already covers the whole card. */}
        <p aria-hidden className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-navy">
          View package
          <ArrowRight weight="bold" className="size-4 transition-transform duration-500 ease-glide group-hover:translate-x-1.5" />
        </p>
      </div>
    </article>
  );
}
