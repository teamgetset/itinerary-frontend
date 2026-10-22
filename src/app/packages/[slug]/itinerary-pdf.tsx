import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import { getPackage } from "@/services/packages";
import { getSettings } from "@/services/settings";
import { ItineraryDocument, type PdfPicture } from "@/components/itinerary/itinerary-document";

/*
 * The itinerary PDF made from the package page's content, offered for a version (with or without the logo) that has
 * not been uploaded in the admin. Served by itinerary.pdf and itinerary-without-logo.pdf: each is made on its first
 * download, then cached like the page, refreshed when the admin changes the catalogue, and hourly.
 */

/** Included in the deployed function by next.config.ts (outputFileTracingIncludes). */
const LOGO = join(process.cwd(), "src/assets/brand/getset-logo.png");

/**
 * A photo for the PDF, which takes JPEG or PNG: Cloudinary converts and downsizes it. Null when it cannot be loaded
 * (or is the local placeholder): the PDF is then made without it rather than not at all.
 */
async function picture(src: string | undefined, width: number): Promise<PdfPicture | null> {
  if (!src || !/^https?:\/\//.test(src)) return null;
  const url = src.includes("res.cloudinary.com/") ? src.replace("/image/upload/", `/image/upload/f_jpg,q_70,c_limit,w_${width}/`) : src;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    return { data: Buffer.from(await response.arrayBuffer()), format: type.includes("png") ? "png" : "jpg" };
  } catch {
    return null;
  }
}

/** The PDF download for a package; `withLogo` false leaves out the GETSET logo and name, nothing else. */
export async function itineraryPdf(slug: string, withLogo: boolean) {
  const [pkg, settings] = await Promise.all([getPackage(slug), getSettings()]);
  if (!pkg) return new Response("Package not found", { status: 404 });

  const [logo, hero, ...dayPhotos] = await Promise.all([
    withLogo ? readFile(LOGO).then((data): PdfPicture => ({ data, format: "png" })) : null,
    picture(pkg.cover.src, 1200),
    ...pkg.itinerary.map((day) => picture(day.photo?.src, 500)),
  ]);
  const pdf = await renderToBuffer(
    <ItineraryDocument
      pkg={pkg}
      currencies={settings.currencies.filter((currency) => currency.code === pkg.currency)}
      logo={logo}
      hero={hero}
      dayPhotos={dayPhotos}
      pageUrl={new URL(`/packages/${pkg.slug}`, siteConfig.url).href}
      asOf={formatDate(new Date().toISOString())}
    />,
  );
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pkg.slug}-itinerary${withLogo ? "" : "-without-logo"}.pdf"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
