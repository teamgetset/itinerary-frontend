import { DownloadSimple, FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { button, type ButtonVariant } from "@/components/ui/button";

type Pdf = TourPackage["pdf"];

/*
 * The itinerary PDF in two prints, served by the API. It is generated from the package's data, so the file
 * always matches this page; after a change, the next download builds the new version.
 */

function PdfButton({ href, label, variant }: { href: string; label: string; variant: ButtonVariant }) {
  return (
    // Cross-origin: the API's Content-Disposition header makes this a download.
    <a href={href} className={button({ variant, size: "lg", className: "w-full" })}>
      <DownloadSimple aria-hidden weight="bold" className="size-5" />
      {/* "Download" is implied by the icon on the narrowest phones; screen readers always hear it. */}
      <span>
        <span className="max-[400px]:sr-only">Download </span>
        {label}
      </span>
      <span className="sr-only">(PDF)</span>
    </a>
  );
}

export function DownloadItineraryButton({
  pdf,
  compact = false,
  className = "",
}: {
  pdf: Pdf;
  /** One button (the print with the logo), for tight spots like the mobile booking bar. */
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <a href={pdf.withLogoUrl} className={button({ className })}>
        <DownloadSimple aria-hidden weight="bold" className="size-5" />
        <span>
          <span className="sr-only">Download </span>Itinerary PDF
        </span>
        <span className="sr-only">(with logo)</span>
      </a>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-3">
        <PdfButton href={pdf.withLogoUrl} label="PDF with logo" variant="primary" />
        <PdfButton href={pdf.withoutLogoUrl} label="PDF without logo" variant="outline" />
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <FilePdf aria-hidden weight="bold" className="size-4" />
        Same itinerary in both, always up to date with this page
      </p>
    </div>
  );
}
