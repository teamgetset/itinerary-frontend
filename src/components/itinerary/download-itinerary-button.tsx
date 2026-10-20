import { DownloadSimple, FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { ItineraryPdf } from "@/types";
import { button, type ButtonVariant } from "@/components/ui/button";

/*
 * The itinerary download, in two versions: with the GETSET logo, and without it. Each version is the PDF uploaded by
 * the GETSET team when there is one (downloaded through the API, which streams it from private storage), otherwise
 * the PDF made from the package page (`generated`). Where neither exists (admin previews of drafts), a plain
 * "not available yet" state instead of a dead link.
 */

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

/** The PDFs made from the package page (app/packages/[slug]/itinerary.pdf and itinerary-without-logo.pdf). */
export interface GeneratedPdfs {
  withLogo: string;
  withoutLogo: string;
}

function PdfButton({ href, label, variant }: { href: string; label: string; variant: ButtonVariant }) {
  return (
    // The response's Content-Disposition header (the API's, or the generated PDF's) makes this a download.
    <a href={href} className={button({ variant, size: "lg", className: "w-full" })}>
      <DownloadSimple aria-hidden weight="bold" className="size-5" />
      {label}
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
  /** The PDFs made from the package page, used for a version that is not uploaded. */
  generated?: GeneratedPdfs;
  /** One short button (the version with the logo when there is one), for tight spots like the mobile booking bar. */
  compact?: boolean;
  className?: string;
}) {
  const withLogo = pdf?.url ?? generated?.withLogo;
  const withoutLogo = pdfWithoutLogo?.url ?? generated?.withoutLogo;

  if (compact) {
    const href = withLogo ?? withoutLogo;
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

  if (!withLogo && !withoutLogo) {
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
      <div className="grid gap-3">
        {withLogo && <PdfButton href={withLogo} label="Download itinerary (PDF)" variant="primary" />}
        {withoutLogo && <PdfButton href={withoutLogo} label="Download without logo" variant={withLogo ? "outline" : "primary"} />}
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <FilePdf aria-hidden weight="bold" className="size-4" />
        {pdf && pdfWithoutLogo ? `Same itinerary in both · ${size(pdf.sizeBytes)} and ${size(pdfWithoutLogo.sizeBytes)}` : "Day-by-day plan, prices and inclusions"}
      </p>
    </div>
  );
}
