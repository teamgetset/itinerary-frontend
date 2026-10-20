import { itineraryPdf } from "../itinerary-pdf";

/* The itinerary PDF made from the package page, with the GETSET logo (see ../itinerary-pdf.tsx). */
export const dynamic = "force-static";
export const revalidate = 3600;
export const generateStaticParams = async () => [];

export async function GET(_request: Request, { params }: RouteContext<"/packages/[slug]/itinerary.pdf">) {
  return itineraryPdf((await params).slug, true);
}
