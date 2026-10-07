import { Airplane } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { formatDuration } from "@/lib/format";
import { DownloadItineraryButton } from "@/components/itinerary/download-itinerary-button";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { ShareButton } from "@/components/shared/share-button";
import { EnquiryDialog } from "./enquiry-dialog";
import { TravellerSelector, TripEnquiryButton } from "./traveller-pricing";

/** Tear line with notches, drawn in the page colour so the card reads as a ticket stub. */
function Perforation() {
  return (
    <div aria-hidden className="relative mx-(--pad) border-t-2 border-dashed border-line">
      <span className="absolute top-1/2 left-[calc(var(--pad)*-1)] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mist ring-1 ring-line [clip-path:inset(0_0_0_50%)]" />
      <span className="absolute top-1/2 right-[calc(var(--pad)*-1)] size-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-mist ring-1 ring-line [clip-path:inset(0_50%_0_0)]" />
    </div>
  );
}

/**
 * Package summary styled as a boarding pass: route, key facts, traveller pricing and the itinerary download.
 * Needs a <TravellersProvider> above it.
 */
export function BoardingPass({
  pkg,
  enquiry,
}: {
  pkg: TourPackage;
  /** Opening line of the WhatsApp enquiry. */
  enquiry: string;
}) {
  const { from, to } = pkg.route;
  const { branch } = pkg;

  return (
    <section
      aria-label="Trip summary"
      className="leaf-lg bg-paper ring-1 ring-line [--pad:1.5rem] sm:[--pad:2rem] lg:[--pad:1.5rem] 2xl:[--pad:2rem]"
    >
      <div className="flex items-start justify-between gap-4 p-(--pad)">
        <div>
          <p className="type-label text-muted">From</p>
          <p className="type-code mt-2 text-[1.75rem] text-navy">{from.map((airport) => airport.code).join(" / ") || branch.name}</p>
          <p className="mt-1.5 text-sm text-muted">{from.map((airport) => airport.city).join(" or ") || "Departure city"}</p>
        </div>
        <div aria-hidden className="mt-9 flex flex-1 items-center gap-2 text-cobalt">
          <span className="h-px flex-1 border-t-2 border-dashed border-cobalt/35" />
          <Airplane weight="fill" className="size-5 rotate-90" />
        </div>
        <div className="text-right">
          <p className="type-label text-muted">To</p>
          <p className="type-code mt-2 text-[1.75rem] text-navy">{to.code}</p>
          <p className="mt-1.5 text-sm text-muted">{to.city}</p>
        </div>
      </div>

      <Perforation />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 p-(--pad)">
        <div>
          <dt className="type-label text-muted">Duration</dt>
          <dd className="mt-1.5 font-semibold text-navy">{formatDuration(pkg.duration)}</dd>
        </div>
        <div>
          <dt className="type-label text-muted">Best time</dt>
          <dd className="mt-1.5 font-semibold text-navy">{pkg.bestTime ?? "All year"}</dd>
        </div>
      </dl>

      <Perforation />

      <div className="p-(--pad) pt-[calc(var(--pad)-0.75rem)]">
        <TravellerSelector />
      </div>

      <Perforation />

      <div className="p-(--pad)">
        <DownloadItineraryButton pdf={pkg.pdf} />
        {/* Below 400px the contact button gets its own row, with share and save under it. */}
        <div className="mt-4 flex flex-wrap gap-3">
          <TripEnquiryButton branch={branch} message={enquiry} className="flex-1 max-[400px]:basis-full" />
          <ShareButton title={pkg.title} />
          <WishlistButton slug={pkg.slug} title={pkg.title} tone="plain" className="size-12" />
        </div>
        <EnquiryDialog packageSlug={pkg.slug} packageTitle={pkg.title} branchName={branch.name} />
      </div>
    </section>
  );
}
