import Image from "next/image";
import {
  AirplaneLanding,
  AirplaneTakeoff,
  Bed,
  Binoculars,
  Coffee,
  ForkKnife,
  Key,
  SuitcaseRolling,
  Ticket,
  Van,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ActivityType, ItineraryDay, TimelineItem } from "@/types";
import { formatClock } from "@/lib/format";
import { ACTIVITY_TYPE_LABELS } from "@/lib/itinerary";

/** One icon per kind of step, in the timeline's ring. "Other" keeps the plain dot. */
const TYPE_ICONS: Partial<Record<ActivityType, Icon>> = {
  ARRIVAL: AirplaneLanding,
  TRANSFER: Van,
  CHECK_IN: Key,
  SIGHTSEEING: Binoculars,
  ACTIVITY: Ticket,
  MEAL: ForkKnife,
  FREE_TIME: Coffee,
  CHECK_OUT: SuitcaseRolling,
  DEPARTURE: AirplaneTakeoff,
};

/**
 * One step of a day. Its type shows as an icon on the dotted line (and is read out to screen readers); a linked
 * catalogue activity adds its photo, and its description when the step has none (kept to three lines).
 */
function TimelineStep({ item }: { item: TimelineItem }) {
  const TypeIcon = TYPE_ICONS[item.type];
  const description = item.description ?? item.activity?.description;
  return (
    <li className="relative flex items-start justify-between gap-4 text-ink">
      {TypeIcon ? (
        <span
          aria-hidden
          title={ACTIVITY_TYPE_LABELS[item.type]}
          className="absolute top-0 -left-[37px] grid size-6 place-items-center rounded-full border-2 border-cobalt bg-paper text-cobalt"
        >
          <TypeIcon weight="bold" className="size-3.5" />
        </span>
      ) : (
        <span aria-hidden className="absolute top-2 -left-[30px] size-2.5 rounded-full border-2 border-cobalt bg-paper" />
      )}
      <span className="min-w-0">
        {TypeIcon && <span className="sr-only">{ACTIVITY_TYPE_LABELS[item.type]}: </span>}
        {item.time && <span className="mr-2 font-semibold whitespace-nowrap text-cobalt">{formatClock(item.time)}</span>}
        {item.title}
        {item.location && <span className="text-muted">, {item.location}</span>}
        {description && <span className={`block text-sm text-muted ${item.description ? "" : "line-clamp-3"}`}>{description}</span>}
      </span>
      {item.activity?.photo && (
        <Image
          src={item.activity.photo.src}
          alt={item.activity.photo.alt}
          width={64}
          height={64}
          style={{ objectPosition: item.activity.photo.position }}
          className="leaf-xs size-14 shrink-0 object-cover sm:size-16"
        />
      )}
    </li>
  );
}

/** Day-by-day plan, joined by the same dashed route line used across the site. */
export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol>
      {days.map((day, index) => (
        <li key={day.day} data-reveal className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 pb-10 last:pb-0 sm:grid-cols-[4.5rem_1fr] sm:gap-x-7">
          {index < days.length - 1 && (
            <span
              aria-hidden
              className="absolute top-16 bottom-2 left-7 border-l-2 border-dashed border-cobalt/30 sm:top-20 sm:left-9"
            />
          )}
          <p className="leaf-sm flex size-14 flex-col items-center justify-center bg-navy text-white sm:size-[4.5rem]">
            <span className="type-label text-[0.5625rem] text-sun sm:text-[0.625rem]">Day</span>
            <span className="type-code text-xl sm:text-2xl">{String(day.day).padStart(2, "0")}</span>
          </p>
          <div className="pt-1 sm:pt-2">
            <h3 className="text-xl font-semibold tracking-tight text-navy">{day.title}</h3>
            {day.description && <p className="mt-2.5 max-w-[62ch] leading-relaxed text-muted">{day.description}</p>}
            {day.photo && (
              <div className="leaf-md relative mt-4 aspect-[4/3] max-w-xl overflow-hidden bg-frost sm:aspect-[16/10]">
                <Image
                  src={day.photo.src}
                  alt={day.photo.alt}
                  fill
                  sizes="(min-width: 640px) 36rem, calc(100vw - 7rem)"
                  style={{ objectPosition: day.photo.position }}
                  className="object-cover"
                />
              </div>
            )}
            {day.timeline.length > 0 && (
              <ol className="mt-4 space-y-2 border-l-2 border-dotted border-line pl-6">
                {day.timeline.map((item, i) => (
                  <TimelineStep key={`${item.time}-${i}`} item={item} />
                ))}
              </ol>
            )}
            {(day.stay || day.hotel || day.meals) && (
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
                {(day.hotel || day.stay) && (
                  <span className="flex items-center gap-2">
                    <Bed aria-hidden weight="bold" className="size-4 text-cobalt" />
                    {day.hotel ? `Overnight at ${day.hotel.name}` : `Overnight in ${day.stay}`}
                  </span>
                )}
                {day.meals && (
                  <span className="flex items-center gap-2">
                    <ForkKnife aria-hidden weight="bold" className="size-4 text-cobalt" />
                    {day.meals.join(", ")}
                  </span>
                )}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
