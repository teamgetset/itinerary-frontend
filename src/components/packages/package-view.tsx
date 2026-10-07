import { Check, X } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary, TourPackage } from "@/types";
import { formatPlace } from "@/lib/format";
import { tripJsonLd } from "@/lib/structured-data";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { StickyPanel } from "@/components/shared/sticky-panel";
import { BoardingPass } from "./boarding-pass";
import { ExploreMore } from "./explore-more";
import { PackageGallery } from "./package-gallery";
import { TravellersProvider, TripTotal } from "./traveller-pricing";
import { DownloadItineraryButton } from "@/components/itinerary/download-itinerary-button";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { ReviewsSection, StaysSection, headingClass, sectionClass } from "./package-sections";

/**
 * The whole package page. Shared by the live page (/packages/[slug]) and the admin's draft preview
 * (/preview/packages/[id]), so a preview shows exactly what will be published.
 */
export function PackageView({
  pkg,
  suggestions,
  enquiry,
  previewStatus,
}: {
  pkg: TourPackage;
  suggestions: PackageSummary[];
  /** Opening line of the WhatsApp enquiry, from the admin's template. */
  enquiry: string;
  /** Set on admin previews: the package's status, shown in a banner. */
  previewStatus?: string;
}) {
  const preview = previewStatus !== undefined;
  const branch = pkg.branch;
  return (
    <>
      {/* Traveller counts are shared by the boarding pass and the mobile booking bar. */}
      <TravellersProvider prices={pkg.prices}>
        {preview && (
          <p role="status" className="bg-sun px-4 py-2.5 text-center text-sm font-semibold text-night">
            Preview{previewStatus === "PUBLISHED" ? "" : ` of a ${previewStatus.toLowerCase()} package`}: this link is private and expires in an hour.
          </p>
        )}
        <div className="relative">
          <div className="shell pt-6 lg:pt-10">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: `${branch.name} branch`, path: `/branches/${branch.slug}` },
                { name: pkg.title, path: `/packages/${pkg.slug}` },
              ]}
            />
          </div>

          {/*
            DOM order (title, gallery, summary, details) is the mobile order.
            On desktop the summary becomes a sticky sidebar that starts level with the title,
            so the price and the itinerary download stay in reach while reading.
          */}
          <div className="shell mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10 2xl:gap-x-12">
            <header className="lg:col-span-7 lg:row-start-1 2xl:col-span-8">
              <p className="font-medium text-cobalt">
                {formatPlace(pkg.destination)} · {pkg.category}
              </p>
              <h1 className="type-display mt-3 text-[clamp(2.25rem,8vw,3.75rem)] text-navy">{pkg.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{pkg.tagline}</p>
            </header>

            <div className="lg:col-span-7 lg:row-start-2 2xl:col-span-8">
              <PackageGallery pkg={pkg} />
            </div>

            <aside className="lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 2xl:col-span-4 2xl:col-start-9">
              <StickyPanel>
                <BoardingPass pkg={pkg} enquiry={enquiry} />
              </StickyPanel>
            </aside>

            <div className="mt-6 lg:col-span-7 lg:row-start-3 2xl:col-span-8">
              <section aria-labelledby="overview" className={sectionClass}>
                <h2 id="overview" className={headingClass}>
                  Overview
                </h2>
                <div className="mt-6 max-w-[65ch] space-y-4 text-lg leading-relaxed text-ink">
                  {pkg.overview.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {pkg.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-ink">
                      <span className="leaf-xs mt-0.5 grid size-6 shrink-0 place-items-center bg-sun text-night">
                        <Check aria-hidden weight="bold" className="size-3.5" />
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="itinerary" className={sectionClass}>
                <h2 id="itinerary" className={headingClass}>
                  Day by day
                </h2>
                <div className="mt-10">
                  <ItineraryTimeline days={pkg.itinerary} />
                </div>
              </section>

              <StaysSection pkg={pkg} />

              <section aria-labelledby="included" className={sectionClass}>
                <h2 id="included" className={headingClass}>
                  What&apos;s included
                </h2>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div className="leaf-md bg-paper p-6 ring-1 ring-line sm:p-8">
                    <h3 className="font-semibold text-navy">Included</h3>
                    <ul className="mt-5 space-y-3.5">
                      {pkg.inclusions.map((item) => (
                        <li key={item} className="flex gap-3 text-ink">
                          <Check aria-hidden weight="bold" className="mt-1 size-4 shrink-0 text-cobalt" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="leaf-md p-6 ring-1 ring-line sm:p-8">
                    <h3 className="font-semibold text-navy">Not included</h3>
                    <ul className="mt-5 space-y-3.5">
                      {pkg.exclusions.map((item) => (
                        <li key={item} className="flex gap-3 text-muted">
                          <X aria-hidden weight="bold" className="mt-1 size-4 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section aria-labelledby="good-to-know" className={sectionClass}>
                <h2 id="good-to-know" className={headingClass}>
                  Good to know
                </h2>
                <dl className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  {pkg.destination.facts.map((fact) => (
                    <div key={fact.label} className="border-l-2 border-sun pl-5">
                      <dt className="type-label text-muted">{fact.label}</dt>
                      <dd className="mt-2 leading-relaxed text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                {pkg.importantInfo && pkg.importantInfo.length > 0 && (
                  <>
                    <h3 className="mt-12 font-semibold text-navy">Important information</h3>
                    <ul className="mt-4 space-y-3 text-ink">
                      {pkg.importantInfo.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="leaf-xs mt-2 size-2 shrink-0 bg-sun" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {pkg.terms && pkg.terms.length > 0 && (
                  <details className="group leaf-md mt-10 bg-paper ring-1 ring-line">
                    <summary className="cursor-pointer px-6 py-4 font-semibold text-navy">Terms and conditions</summary>
                    <ul className="space-y-2 px-6 pb-6 text-sm leading-relaxed text-muted">
                      {pkg.terms.map((term) => (
                        <li key={term}>{term}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>

              <ReviewsSection pkg={pkg} />
            </div>
          </div>

          {/* Mobile booking bar. Sticks to the viewport bottom while the trip content is on screen. */}
          <div className="sticky bottom-0 z-30 mt-12 border-t border-line bg-paper/95 backdrop-blur-lg lg:hidden">
            <div className="shell flex items-center justify-between gap-4 py-3">
              <TripTotal />
              <DownloadItineraryButton pdf={pkg.pdf} compact />
            </div>
          </div>
        </div>
      </TravellersProvider>

      <ExploreMore packages={suggestions} />
      {!preview && <JsonLd data={tripJsonLd(pkg)} />}
    </>
  );
}
