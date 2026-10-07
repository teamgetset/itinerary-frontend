import { Bed, Star } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { formatDate } from "@/lib/format";
import { staysFromItinerary } from "@/lib/itinerary";

/*
 * Package page sections fed by optional data. Each renders nothing when its data is missing,
 * so the admin panel can fill them in package by package.
 */

export const sectionClass = "border-t border-line pt-12 mt-14 first:mt-0 first:border-t-0 first:pt-0";
export const headingClass = "type-display text-3xl text-navy md:text-[2.5rem]";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function StaysSection({ pkg }: { pkg: TourPackage }) {
  const stays = pkg.hotels ?? staysFromItinerary(pkg.itinerary);
  if (stays.length === 0) return null;

  return (
    <section aria-labelledby="stays" className={sectionClass}>
      <h2 id="stays" className={headingClass}>
        Where you stay
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {stays.map((stay, index) => (
          <li key={`${stay.city}-${index}`} className="leaf-md flex items-start gap-4 bg-paper p-5 ring-1 ring-line">
            <Bed aria-hidden weight="bold" className="mt-0.5 size-5 shrink-0 text-cobalt" />
            <span>
              <span className="block font-semibold text-navy">{stay.name ?? stay.city}</span>
              <span className="mt-1 block text-sm text-muted">
                {[stay.name ? stay.city : null, plural(stay.nights, "night"), stay.category].filter(Boolean).join(", ")}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {!pkg.hotels && <p className="mt-5 text-sm text-muted">We confirm hotel names when you book.</p>}
    </section>
  );
}

export function ReviewsSection({ pkg }: { pkg: TourPackage }) {
  if (!pkg.reviews?.length) return null;

  return (
    <section aria-labelledby="reviews" className={sectionClass}>
      <h2 id="reviews" className={headingClass}>
        Reviews
      </h2>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {pkg.reviews.map((review) => (
          <li key={`${review.author}-${review.quote.slice(0, 20)}`} className="leaf-md bg-paper p-6 ring-1 ring-line">
            <p className="flex items-center gap-0.5 text-sun-deep">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} aria-hidden weight={i < review.rating ? "fill" : "regular"} className="size-4" />
              ))}
              <span className="ml-2 text-sm font-semibold text-ink">{review.rating} out of 5</span>
            </p>
            <blockquote className="mt-4 leading-relaxed text-ink">“{review.quote}”</blockquote>
            <p className="mt-4 text-sm text-muted">
              {review.author}
              {review.date && `, ${formatDate(review.date)}`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
