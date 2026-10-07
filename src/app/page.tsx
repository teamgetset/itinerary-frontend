import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { organizationJsonLd } from "@/lib/structured-data";
import { getBranches } from "@/services/branches";
import { getHeroSlides } from "@/services/hero";
import { getPackagesPage } from "@/services/packages";
import { getSettings } from "@/services/settings";
import { HomeHero } from "@/components/hero/home-hero";
import { BranchCards } from "@/components/branches/branch-cards";
import { PaginatedPackages } from "@/components/packages/paginated-packages";
import { JsonLd } from "@/components/shared/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const slides = await getHeroSlides();
  return pageMetadata({ description: siteConfig.description, path: "/", image: slides[0]?.photo });
}

export default async function HomePage() {
  const [{ content }, slides, branches, firstPage] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getBranches(),
    getPackagesPage({ page: 1, pageSize: 6 }),
  ]);
  const packagesCopy = content["home.packages"];

  return (
    <>
      <HomeHero slides={slides} copy={content["home.hero"]} />
      <BranchCards branches={branches} copy={content["home.branches"]} />

      {firstPage.total > 0 && (
        <section id="packages" aria-labelledby="packages-title" className="shell pb-20 lg:pb-28">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <h2 id="packages-title" className="type-display text-4xl text-navy md:text-5xl">
              {packagesCopy.heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{packagesCopy.description}</p>
          </div>
          <div className="mt-12 lg:mt-16">
            <PaginatedPackages initial={firstPage} />
          </div>
        </section>
      )}
      <JsonLd data={organizationJsonLd(branches, content)} />
    </>
  );
}
