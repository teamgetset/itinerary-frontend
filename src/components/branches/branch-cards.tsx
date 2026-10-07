import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Branch, SiteContent } from "@/types";

/**
 * First step of package discovery: each card opens one branch's own catalogue.
 * Works for any number of branches; the grid goes two-up from md.
 */
export function BranchCards({ branches, copy }: { branches: Branch[]; copy: SiteContent["home.branches"] }) {
  if (branches.length === 0) return null;
  return (
    <section id="branches" aria-labelledby="branches-title" className="shell py-20 lg:py-28">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <h2 id="branches-title" className="type-display text-4xl text-navy md:text-5xl">
          {copy.heading}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">{copy.description}</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:gap-8">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={`/branches/${branch.slug}`}
            data-reveal
            className="group leaf-lg on-dark relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden bg-night p-6 text-white sm:aspect-[5/4] sm:p-10 md:aspect-[4/5] lg:aspect-[6/5] lg:p-12"
          >
            <Image
              src={branch.banner.src}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              style={{ objectPosition: branch.banner.position }}
              className="-z-10 object-cover transition-transform duration-[1.4s] ease-glide group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-linear-to-t from-night/90 via-night/45 to-night/10 transition-opacity duration-700 group-hover:opacity-90"
            />

            {branch.airport && (
              <span aria-hidden className="type-code absolute top-6 left-6 text-2xl text-white/90 sm:top-10 sm:left-10 lg:left-12">
                {branch.airport.code}
              </span>
            )}

            <span className="block transition-transform duration-700 ease-glide group-hover:-translate-y-1.5">
              <span className="type-label text-sun">
                {branch.packageCount} {branch.packageCount === 1 ? "package" : "packages"}
              </span>
              <span className="type-display mt-3 block text-4xl sm:text-5xl lg:text-6xl">{branch.name} branch</span>
              <span className="mt-4 block max-w-md leading-relaxed text-white/85">{branch.description}</span>
              <span className="leaf-sm mt-7 inline-flex h-12 items-center gap-2.5 bg-sun px-6 font-semibold text-night transition-colors duration-300 group-hover:bg-sun-deep">
                Explore packages
                <ArrowRight
                  aria-hidden
                  weight="bold"
                  className="size-4 transition-transform duration-500 ease-glide group-hover:translate-x-1"
                />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
