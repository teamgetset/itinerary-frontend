"use client";

import Link from "next/link";
import { button } from "@/components/ui/button";
import { RouteLine } from "@/components/packages/route-line";

/** A page that could not load (usually the API is briefly unreachable). Header and footer stay in place. */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="shell flex min-h-[70dvh] flex-col justify-center py-20">
      <title>Something went wrong | GETSET Tours & Travels</title>
      <RouteLine code="!" className="max-w-xs" />
      <h1 className="type-display mt-8 text-[clamp(2.5rem,8vw,4.5rem)] text-navy">This page didn&apos;t load.</h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
        Something went wrong on our side. Please try again in a moment.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={retry} className={button({ size: "lg" })}>
          Try again
        </button>
        <Link href="/" className={button({ variant: "outline", size: "lg" })}>
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
