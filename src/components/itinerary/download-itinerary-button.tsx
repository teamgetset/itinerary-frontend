import { DownloadSimple, FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { button } from "@/components/ui/button";

type Pdf = TourPackage["pdf"];

/*
 * The itinerary PDF uploaded by the GETSET team, downloaded through the API (which streams it from private storage).
 * A package without one shows a plain "not available yet" state instead of a dead link.
 */

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

export function DownloadItineraryButton({
  pdf,
  compact = false,
  className = "",
}: {
  pdf: Pdf;
  /** A short button, for tight spots like the mobile booking bar. */
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return pdf ? (
      // Cross-origin: the API's Content-Disposition header makes this a download.
      <a href={pdf.url} aria-label="Download itinerary (PDF)" className={button({ className })}>
        <DownloadSimple aria-hidden weight="bold" className="size-5" />
        Itinerary PDF
      </a>
    ) : (
      <span className={button({ variant: "outline", className: `pointer-events-none opacity-60 ${className}` })}>
        <FilePdf aria-hidden weight="bold" className="size-5" />
        <span>
          <span className="sr-only">Itinerary </span>PDF not available
        </span>
      </span>
    );
  }

  if (!pdf) {
    return (
      <div className={className}>
        <p className="flex items-start gap-3 rounded-xl border border-line px-4 py-3.5 text-sm text-muted">
          <FilePdf aria-hidden weight="bold" className="mt-0.5 size-5 shrink-0 text-navy" />
          <span>
            <span className="block font-semibold text-navy">Itinerary PDF not available yet</span>
            Ask us below for the full day-by-day plan.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <a href={pdf.url} className={button({ size: "lg", className: "w-full" })}>
        <DownloadSimple aria-hidden weight="bold" className="size-5" />
        Download itinerary (PDF)
      </a>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <FilePdf aria-hidden weight="bold" className="size-4" />
        PDF, {size(pdf.sizeBytes)}
      </p>
    </div>
  );
}
