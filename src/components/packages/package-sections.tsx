import Image from "next/image";
import { Bed, Star, Ticket } from "@phosphor-icons/react/dist/ssr";
import type { TourPackage } from "@/types";
import { formatDate } from "@/lib/format";

/*
 * Package page sections fed by optional data. Each renders nothing when its data is missing,
 * so the admin panel can fill them in package by package.
 */

export const sectionClass = "border-t border-line pt-12 mt-14 first:mt-0 first:border-t-0 first:pt-0";
export const headingClass = "type-display text-3xl text-navy md:text-[2.5rem]";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** Only the hotels saved for the package (see toHotels); without any, the whole section is left out. */
export function StaysSection({ pkg }: { pkg: TourPackage }) {
  const stays = pkg.hotels ?? [];
  if (stays.length === 0) return null;

  return (
    <section aria-labelledby="stays" className={sectionClass}>
      <h2 id="stays" className={headingClass}>
        Where you stay
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {stays.map((stay, index) => {
          // Only what was entered: no empty parts, no placeholders.
          const details = [stay.city, stay.nights && plural(stay.nights, "night"), stay.category, stay.roomType, stay.mealPlan].filter(Boolean);
          return (
            <li key={`${stay.name}-${index}`} className="leaf-md flex items-start gap-4 bg-paper p-5 ring-1 ring-line">
              <Bed aria-hidden weight="bold" className="mt-0.5 size-5 shrink-0 text-cobalt" />
              <span>
                <span className="block font-semibold text-navy">{stay.name}</span>
                {details.length > 0 && <span className="mt-1 block text-sm text-muted">{details.join(", ")}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The experiences included in the package (its Activities tab in the admin); left out when there are none. */
export function ActivitiesSection({ pkg }: { pkg: TourPackage }) {
  if (pkg.activities.length === 0) return null;

  return (
    <section aria-labelledby="experiences" className={sectionClass}>
      <h2 id="experiences" className={headingClass}>
        Experiences included
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {pkg.activities.map((activity, index) => (
          <li key={`${activity.name}-${index}`} className="leaf-md flex items-start gap-4 bg-paper p-5 ring-1 ring-line">
            {activity.photo ? (
              <Image
                src={activity.photo.src}
                alt={activity.photo.alt}
                width={80}
                height={80}
                style={{ objectPosition: activity.photo.position }}
                className="leaf-xs size-16 shrink-0 object-cover sm:size-20"
              />
            ) : (
              <span aria-hidden className="leaf-xs grid size-16 shrink-0 place-items-center bg-frost text-cobalt sm:size-20">
                <Ticket weight="bold" className="size-6" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block font-semibold text-navy">{activity.name}</span>
              {activity.location && <span className="mt-1 block text-sm text-muted">{activity.location}</span>}
              {activity.description && <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-ink">{activity.description}</span>}
            </span>
          </li>
        ))}
      </ul>
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
              {review.source && ` · ${review.source} review`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
