import Image from "next/image";
import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import type { Testimonial } from "@/types";
import { formatMonth } from "@/lib/format";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/**
 * A review styled as a ticket stub, like the package boarding pass: who, rating, a tear line, then the words.
 * Identity first, the review dominant, place and source as quiet context.
 */
export function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <figure className="leaf-lg relative flex w-[min(82vw,22rem)] shrink-0 flex-col bg-paper p-6 ring-1 ring-line transition-[translate,box-shadow] duration-500 ease-glide hover:-translate-y-1 hover:shadow-[0_24px_40px_-28px_rgb(0_33_66/0.45)] sm:p-7">
      <span aria-hidden className="type-display pointer-events-none absolute top-4 right-6 text-[5rem] leading-none text-sun">
        “
      </span>

      <figcaption className="flex items-center gap-4 pr-10">
        {t.image ? (
          <Image src={t.image} alt="" width={56} height={56} className="leaf-sm size-14 shrink-0 object-cover" />
        ) : (
          <span aria-hidden className="leaf-sm type-code grid size-14 shrink-0 place-items-center bg-navy text-lg text-sun">
            {initials(t.customerName)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-navy">{t.customerName}</span>
          <span className="block truncate text-sm text-muted">{t.profile}</span>
        </span>
      </figcaption>

      <p className="mt-5 flex items-center gap-2">
        <span aria-hidden className="flex gap-0.5 text-sun-deep">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} weight={i < t.rating ? "fill" : "regular"} className="size-4" />
          ))}
        </span>
        <span className="text-sm font-semibold text-ink">{t.rating.toFixed(1)}</span>
        <span className="sr-only">out of 5 stars</span>
      </p>

      <span aria-hidden className="my-5 border-t-2 border-dashed border-line" />

      <blockquote className="line-clamp-6 flex-1 leading-relaxed text-ink">“{t.review}”</blockquote>

      <p className="mt-6 flex items-center justify-between gap-3 text-sm text-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin aria-hidden weight="fill" className="size-4 shrink-0 text-cobalt" />
          <span className="truncate">{t.place}</span>
        </span>
        {t.source && (
          <span className="shrink-0">
            {t.source.name} review{t.source.date && `, ${formatMonth(t.source.date)}`}
          </span>
        )}
      </p>
    </figure>
  );
}
