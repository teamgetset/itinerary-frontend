import type { Metadata } from "next";
import { fillTemplate } from "@/lib/format";
import { getPackagePreview } from "@/services/packages";
import { getSettings } from "@/services/settings";
import { PackageView } from "@/components/packages/package-view";

/* Admin preview of a draft (or live) package, through a signed link that expires after an hour. Never indexed or cached. */

export const metadata: Metadata = { title: "Package preview", robots: { index: false, follow: false } };

export default async function PackagePreviewPage({ params, searchParams }: PageProps<"/preview/packages/[id]">) {
  const { id } = await params;
  const { token } = await searchParams;
  const pkg = typeof token === "string" ? await getPackagePreview(id, token) : null;

  if (!pkg) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="type-display text-4xl text-navy">This preview link has expired</h1>
        <p className="mt-4 text-muted">Open the package in the admin and choose Preview again for a fresh link.</p>
      </div>
    );
  }
  const { content } = await getSettings();
  const enquiry = fillTemplate(content.enquiry.whatsappTemplate, { branch: pkg.branch.name, package: pkg.title });
  return <PackageView pkg={pkg} suggestions={[]} enquiry={enquiry} previewStatus={pkg.status} />;
}
