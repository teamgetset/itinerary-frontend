import Image from "next/image";
import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import type { Branch } from "@/types";
import { button } from "@/components/ui/button";
import { EnquiryButton } from "./enquiry-button";

/** The office behind a branch catalogue: photo, address, contacts and the ways to reach it. */
export function BranchContact({ branch }: { branch: Branch }) {
  return (
    <section aria-labelledby="branch-office" className="shell mt-24 lg:mt-32">
      <div data-reveal className="leaf-lg grid overflow-hidden bg-paper ring-1 ring-line lg:grid-cols-12">
        <div className="relative aspect-[16/9] bg-frost lg:col-span-5 lg:aspect-auto">
          <Image
            src={branch.photo.src}
            alt={branch.photo.alt}
            fill
            sizes="(min-width: 1024px) 660px, 100vw"
            style={{ objectPosition: branch.photo.position }}
            className="object-cover"
          />
        </div>

        <div className="p-6 sm:p-10 lg:col-span-7 lg:p-14">
          {branch.airport && (
            <p aria-hidden className="type-code text-5xl text-navy">
              {branch.airport.code}
            </p>
          )}
          <h2 id="branch-office" className="type-display mt-4 text-3xl text-navy md:text-[2.5rem]">
            Plan with the {branch.name} office
          </h2>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">{branch.summary}</p>

          <ul className="mt-8 grid gap-5 text-ink sm:grid-cols-2">
            <li className="flex gap-3">
              <MapPin aria-hidden weight="bold" className="mt-0.5 size-5 shrink-0 text-cobalt" />
              <address className="not-italic">
                {branch.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="space-y-3">
              <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-cobalt">
                <Phone aria-hidden weight="bold" className="size-5 shrink-0 text-cobalt" />
                {branch.phone}
              </a>
              {branch.email && (
                <a href={`mailto:${branch.email}`} className="flex items-center gap-3 hover:text-cobalt">
                  <EnvelopeSimple aria-hidden weight="bold" className="size-5 shrink-0 text-cobalt" />
                  {branch.email}
                </a>
              )}
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <EnquiryButton
              branch={branch}
              variant="secondary"
              message={`Hi GETSET ${branch.name}, I'd like help planning a holiday.`}
            />
            {branch.mapUrl && (
              <a href={branch.mapUrl} target="_blank" rel="noreferrer" className={button({ variant: "outline" })}>
                Get directions
                <span className="sr-only">to the {branch.name} office (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
