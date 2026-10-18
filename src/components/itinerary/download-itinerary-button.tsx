import { DownloadSimple, FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { ItineraryPdf } from "@/types";
import { button, type ButtonVariant } from "@/components/ui/button";

/*
 * The itinerary PDFs uploaded by the GETSET team, downloaded through the API (which streams them from private storage):
 * with the logo and, when uploaded, without it. With both, the customer chooses; with one, it is a single button.
 * A package without any offers the PDF made from its page instead (`generated`); where there is none either (admin
 * previews of drafts), a plain "not available yet" state instead of a dead link.
 */

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

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
    </a>
  );
}

export function DownloadItineraryButton({
  pdf,
  pdfWithoutLogo,
  generated,
  compact = false,
  className = "",
}: {
  pdf: ItineraryPdf | null;
  pdfWithoutLogo: ItineraryPdf | null;
  /** The PDF made from the package page (app/packages/[slug]/itinerary.pdf), used when none is uploaded. */
  generated?: string;
  /** One short button (the version with the logo when there is one), for tight spots like the mobile booking bar. */
  compact?: boolean;
  className?: string;
}) {
  const only = pdf ?? pdfWithoutLogo;

  if (compact) {
    const href = only?.url ?? generated;
    return href ? (
      <a href={href} aria-label="Download itinerary (PDF)" className={button({ className })}>
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

  if (!only && generated) {
    return (
      <div className={className}>
        <a href={generated} className={button({ size: "lg", className: "w-full" })}>
          <DownloadSimple aria-hidden weight="bold" className="size-5" />
          Download itinerary (PDF)
        </a>
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <FilePdf aria-hidden weight="bold" className="size-4" />
          Day-by-day plan, prices and inclusions
        </p>
      </div>
    );
  }

  if (!only) {
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

  if (pdf && pdfWithoutLogo) {
    return (
      <div className={className}>
        <div className="grid gap-3">
          <PdfButton href={pdf.url} label="PDF with logo" variant="primary" />
          <PdfButton href={pdfWithoutLogo.url} label="PDF without logo" variant="outline" />
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <FilePdf aria-hidden weight="bold" className="size-4" />
          Same itinerary in both · {size(pdf.sizeBytes)} and {size(pdfWithoutLogo.sizeBytes)}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <a href={only.url} className={button({ size: "lg", className: "w-full" })}>
        <DownloadSimple aria-hidden weight="bold" className="size-5" />
        Download itinerary (PDF)
      </a>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <FilePdf aria-hidden weight="bold" className="size-4" />
        PDF{pdf ? "" : " without logo"}, {size(only.sizeBytes)}
      </p>
    </div>
  );
}
