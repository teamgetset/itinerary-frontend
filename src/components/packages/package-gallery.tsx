import Image from "next/image";
import { ViewTransition } from "react";
import type { TourPackage } from "@/types";
import { OPEN_PACKAGE_MORPH } from "./view-transitions";

/** Cover photo (the morph target for package cards) plus a row of supporting shots. */
export function PackageGallery({ pkg }: { pkg: TourPackage }) {
  return (
    <div>
      <ViewTransition name={`package-${pkg.slug}`} share={OPEN_PACKAGE_MORPH} default="none">
        <div className="leaf-lg relative aspect-[4/3] overflow-hidden bg-frost sm:aspect-[16/10]">
          <Image
            src={pkg.cover.src}
            alt={pkg.cover.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1440px) 900px, (min-width: 1024px) 62vw, 112vw"
            style={{ objectPosition: pkg.cover.position }}
            className="object-cover"
          />
        </div>
      </ViewTransition>

      {pkg.gallery.length > 0 && (
        <ul className="-mx-5 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {pkg.gallery.map((photo) => (
            <li key={photo.src} className="leaf-md relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden bg-frost sm:w-auto">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 36vw, 88vw"
                style={{ objectPosition: photo.position }}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
