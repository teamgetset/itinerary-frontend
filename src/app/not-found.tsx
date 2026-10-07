import type { Metadata } from "next";
import Link from "next/link";
import { button } from "@/components/ui/button";
import { RouteLine } from "@/components/packages/route-line";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70dvh] flex-col justify-center py-20">
      <RouteLine code="404" className="max-w-xs" />
      <h1 className="type-display mt-8 text-[clamp(2.5rem,8vw,4.5rem)] text-navy">We can&apos;t find that page.</h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
        The link may be old, or the trip may have moved. Every current package is one click away.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/packages" className={button({ size: "lg" })}>
          Explore packages
        </Link>
        <Link href="/" className={button({ variant: "outline", size: "lg" })}>
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
