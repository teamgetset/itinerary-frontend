import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { formatDuration } from "@/lib/format";
import { Price } from "@/components/currency/currency";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { RouteLine } from "./route-line";
import { OPEN_PACKAGE, OPEN_PACKAGE_MORPH } from "./view-transitions";

/** Wide package row for destination pages: photo left, the essentials and top highlights right. */
export function PackageFeature({ pkg }: { pkg: TourPackage }) {
  return (
    <article data-reveal className="group relative grid items-center gap-6 md:grid-cols-12 md:gap-10">
      <div className="relative md:col-span-7">
        <ViewTransition name={`package-${pkg.slug}`} share={OPEN_PACKAGE_MORPH} default="none">
          <div className="leaf-lg relative aspect-[4/3] overflow-hidden bg-frost lg:aspect-[16/10]">
            <Image
              src={pkg.cover.src}
              alt={pkg.cover.alt}
              fill
              sizes="(min-width: 1440px) 780px, (min-width: 768px) 56vw, 100vw"
              style={{ objectPosition: pkg.cover.position }}
              className="object-cover transition-transform duration-[1.2s] ease-glide group-hover:scale-[1.035]"
            />
          </div>
        </ViewTransition>
        <WishlistButton slug={pkg.slug} title={pkg.title} className="absolute top-4 right-4 z-10" />
      </div>

      <div className="md:col-span-5">
        <RouteLine code={pkg.route.to.code} city={pkg.route.to.city} />
        <h3 className="type-display mt-5 text-3xl text-navy lg:text-[2.5rem]">
          <Link
            href={`/packages/${pkg.slug}`}
            transitionTypes={[OPEN_PACKAGE]}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-8 focus-visible:after:outline-cobalt after:leaf-lg"
          >
            {pkg.title}
          </Link>
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-muted">{pkg.tagline}</p>
        <ul className="mt-6 space-y-2.5">
          {pkg.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight} className="flex gap-3 text-ink">
              <Check aria-hidden weight="bold" className="mt-1 size-4 shrink-0 text-cobalt" />
              {highlight}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-end justify-between gap-4 border-t border-line pt-5">
          <p className="text-sm text-muted">
            {formatDuration(pkg.duration)}
            <span className="mt-1 block">
              From <Price prices={pkg.startingPrice} className="text-xl font-semibold text-navy" />
            </span>
          </p>
          <span
            aria-hidden
            className="leaf-sm grid size-12 place-items-center bg-navy text-white transition-colors duration-300 group-hover:bg-sun group-hover:text-night"
          >
            <ArrowRight weight="bold" className="size-5" />
          </span>
        </div>
      </div>
    </article>
  );
}
