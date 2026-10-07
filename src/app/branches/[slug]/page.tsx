import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getBranch, getBranches } from "@/services/branches";
import { getPackagesPage } from "@/services/packages";
import { pageMetadata } from "@/lib/metadata";
import { BranchBanner } from "@/components/branches/branch-banner";
import { BranchContact } from "@/components/branches/branch-contact";
import { PaginatedPackages } from "@/components/packages/paginated-packages";

/** One page for every branch: a new branch from the admin panel needs no new code. */
export async function generateStaticParams() {
  const branches = await getBranches();
  return branches.map((branch) => ({ slug: branch.slug }));
}

export async function generateMetadata({ params }: PageProps<"/branches/[slug]">): Promise<Metadata> {
  const branch = await getBranch((await params).slug);
  if (!branch) notFound();
  return pageMetadata({
    title: `${branch.name} branch packages`,
    description: branch.description,
    path: `/branches/${branch.slug}`,
    image: branch.banner,
    seo: branch.seo,
  });
}

export default async function BranchPage({ params }: PageProps<"/branches/[slug]">) {
  const branch = await getBranch((await params).slug);
  if (!branch) notFound();

  const [firstPage, branches] = await Promise.all([getPackagesPage({ branch: branch.slug, page: 1, pageSize: 9 }), getBranches()]);
  const others = branches.filter((other) => other.slug !== branch.slug);

  return (
    <>
      <BranchBanner branch={branch} />

      <section aria-labelledby="branch-packages" className="shell pt-16 lg:pt-24">
        <div data-reveal className="max-w-2xl">
          <h2 id="branch-packages" className="type-display text-4xl text-navy md:text-5xl">
            Tour packages
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            {firstPage.total} {firstPage.total === 1 ? "trip" : "trips"} from our {branch.name} office. Open one for the day-by-day plan
            and a PDF to keep.
          </p>
        </div>
        {firstPage.total > 0 ? (
          <div className="mt-12 lg:mt-16">
            <PaginatedPackages initial={firstPage} filter={{ branch: branch.slug }} />
          </div>
        ) : (
          <p className="leaf-md mt-12 bg-paper p-8 text-muted ring-1 ring-line">
            New trips from this branch are on the way. Contact the office below for current options.
          </p>
        )}
      </section>

      <BranchContact branch={branch} />

      {others.length > 0 && (
        <nav aria-label="Other branches" className="shell mt-12 mb-24 lg:mb-32">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/branches/${other.slug}`} className="group inline-flex items-center gap-2 font-semibold text-navy hover:text-cobalt">
                  Booking from {other.name}? See the {other.name} branch
                  <ArrowRight aria-hidden weight="bold" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
