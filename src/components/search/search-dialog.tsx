"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, MapPin, X } from "@phosphor-icons/react/dist/ssr";
import type { PackageSummary } from "@/types";
import { browserApi } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { toSummary, type ImageDto, type SummaryDto } from "@/lib/mappers";
import { iconButton } from "@/components/ui/button";
import { Price } from "@/components/currency/currency";

interface Results {
  packages: PackageSummary[];
  destinations: { slug: string; name: string; country: { name: string } }[];
}

const EMPTY: Results = { packages: [], destinations: [] };

/**
 * Site search in a native modal dialog (focus trap, Esc and inert background come free).
 * Opens with the header button, Cmd/Ctrl+K, or "/". Searches the API as you type; Enter opens the first package.
 */
export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const open = () => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        dialogRef.current?.showModal();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Debounced: one request after typing pauses; stale answers are ignored.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let current = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const response = await browserApi<{ packages: SummaryDto[]; destinations: Results["destinations"] & { heroImage: ImageDto | null }[] }>(
        `/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      if (!current) return;
      setSearching(false);
      setResults(response.success ? { packages: response.data.packages.map(toSummary), destinations: response.data.destinations } : EMPTY);
    }, 200);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const shown = query.trim() ? results : EMPTY;
  const count = shown.packages.length;

  return (
    <>
      <button type="button" onClick={open} aria-haspopup="dialog" className={`${iconButton} lg:flex lg:w-auto lg:gap-2 lg:px-4`}>
        <MagnifyingGlass aria-hidden weight="bold" className="size-[1.375rem] lg:size-5" />
        <span className="sr-only lg:not-sr-only lg:text-sm lg:font-medium">Search</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search packages"
        onClose={() => {
          setQuery("");
          setResults(EMPTY);
        }}
        onClick={(event) => event.target === event.currentTarget && close()}
        className="leaf-lg m-auto mt-[8vh] w-[min(40rem,calc(100%-1.5rem))] max-w-none overflow-hidden bg-paper p-0 text-ink shadow-[0_40px_80px_-30px_rgb(0_33_66/0.45)] backdrop:bg-night/45 backdrop:backdrop-blur-sm sm:mt-[12vh]"
      >
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (!shown.packages[0]) return;
            close();
            router.push(`/packages/${shown.packages[0].slug}`);
          }}
          className="flex items-center gap-3 border-b border-line py-2 pr-2 pl-5"
        >
          <label htmlFor="package-search" className="sr-only">
            Search packages
          </label>
          <MagnifyingGlass aria-hidden weight="bold" className="size-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            id="package-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Bali, honeymoon or snow"
            autoComplete="off"
            enterKeyHint="go"
            className="h-12 min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          <button type="button" onClick={close} aria-label="Close search" className={iconButton}>
            <X aria-hidden weight="bold" className="size-5" />
          </button>
        </form>

        <p aria-live="polite" className="sr-only">
          {query.trim() && !searching ? `${count} ${count === 1 ? "package" : "packages"} found` : ""}
        </p>

        {count > 0 || shown.destinations.length > 0 ? (
          <ul className="max-h-[min(60vh,32rem)] overflow-y-auto p-2">
            {shown.packages.map((pkg) => (
              <li key={pkg.slug}>
                <Link
                  href={`/packages/${pkg.slug}`}
                  onClick={close}
                  className="leaf-sm flex items-center gap-4 p-2.5 transition-colors hover:bg-mist focus-visible:bg-mist"
                >
                  <Image src={pkg.cover.src} alt="" width={64} height={64} className="leaf-xs size-14 shrink-0 object-cover sm:size-16" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-navy">{pkg.title}</span>
                    <span className="block truncate text-sm text-muted">
                      {pkg.destinationName}, {formatDuration(pkg.duration)}
                    </span>
                  </span>
                  <span className="hidden text-sm whitespace-nowrap text-muted sm:block">
                    From <Price prices={pkg.startingPrice} className="font-semibold text-navy" />
                  </span>
                </Link>
              </li>
            ))}
            {shown.destinations.map((destination) => (
              <li key={destination.slug}>
                <Link
                  href={`/destinations/${destination.slug}`}
                  onClick={close}
                  className="leaf-sm flex items-center gap-4 p-2.5 transition-colors hover:bg-mist focus-visible:bg-mist"
                >
                  <span className="leaf-xs grid size-14 shrink-0 place-items-center bg-frost text-cobalt sm:size-16">
                    <MapPin aria-hidden weight="bold" className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-navy">{destination.name}</span>
                    <span className="block truncate text-sm text-muted">Destination · {destination.country.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            {query.trim() && !searching ? (
              <>
                <p className="font-semibold text-navy">No packages match “{query}”.</p>
                <p className="mt-2 text-sm text-muted">Try a country, a city, or a word like “beach” or “family”.</p>
              </>
            ) : (
              <p className="text-sm text-muted">{searching ? "Searching…" : "Search every package by place, trip type or highlight."}</p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
