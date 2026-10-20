import { itineraryPdf } from "../itinerary-pdf";

/* The same itinerary PDF without the GETSET logo and name (see ../itinerary-pdf.tsx). */
export const dynamic = "force-static";
export const revalidate = 3600;
export const generateStaticParams = async () => [];

export async function GET(_request: Request, { params }: RouteContext<"/packages/[slug]/itinerary-without-logo.pdf">) {
  return itineraryPdf((await params).slug, false);
}
