import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/metadata";
import { getBranches } from "@/services/branches";
import { getAllPackageSummaries } from "@/services/packages";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PackageGrid } from "@/components/packages/package-grid";

export async function generateMetadata(): Promise<Metadata> {
  const packages = await getAllPackageSummaries();
  return pageMetadata({
    title: "All tour packages",
    description: `Every GETSET holiday package, grouped by the branch that sells it: ${packages.length} trips, each with a day-by-day itinerary to download.`,
    path: "/packages",
    image: packages[0]?.cover,
  });
}

/** Every package, grouped by the branch that sells it, so catalogues never mix. */
export default async function PackagesPage() {
  const [packages, branches] = await Promise.all([getAllPackageSummaries(), getBranches()]);

  return (
    <div className="shell pt-6 pb-20 lg:pt-10 lg:pb-28">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Packages", path: "/packages" },
        ]}
      />
      <h1 className="type-display mt-6 text-[clamp(2.5rem,8vw,4rem)] text-navy lg:mt-8">All tour packages</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        {packages.length} trips from our {branches.length === 1 ? "branch" : `${branches.length} branches`}, each with a day-by-day
        itinerary to download.
      </p>

      {branches.map((branch) => {
        const branchPackages = packages.filter((pkg) => pkg.branchSlug === branch.slug);
        if (branchPackages.length === 0) return null;
        return (
          <section key={branch.slug} aria-labelledby={`branch-${branch.slug}`} className="mt-16 lg:mt-24">
            <div data-reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
              <div className="max-w-2xl">
                <h2 id={`branch-${branch.slug}`} className="type-display text-3xl text-navy md:text-[2.5rem]">
                  {branch.name} branch
                </h2>
                <p className="mt-3 leading-relaxed text-muted">{branch.description}</p>
              </div>
              <Link
                href={`/branches/${branch.slug}`}
                className="group inline-flex items-center gap-2 font-semibold text-navy hover:text-cobalt"
              >
                Visit the {branch.name} branch
                <ArrowRight aria-hidden weight="bold" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <PackageGrid packages={branchPackages} stagger className="mt-10" />
          </section>
        );
      })}
    </div>
  );
}
