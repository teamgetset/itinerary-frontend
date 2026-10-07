"use client";

import Link from "next/link";
import { button } from "@/components/ui/button";
import "./globals.css";

/** Last resort when even the layout (header, footer, settings) can't load, e.g. the API is down for an uncached page. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-mist px-6 text-center font-sans text-ink">
        <title>Something went wrong | GETSET Tours & Travels</title>
        <main>
          <h1 className="type-display text-[clamp(2.25rem,7vw,4rem)] text-navy">GETSET is taking a moment.</h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">
            We couldn&apos;t load this page. Please try again shortly.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={retry} className={button({ size: "lg" })}>
              Try again
            </button>
            <Link href="/" className={button({ variant: "outline", size: "lg" })}>
              Go to the home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
