import { Bed, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import type { ItineraryDay } from "@/types";
import { formatClock } from "@/lib/format";

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
            {day.timeline.length > 0 && (
              <ol className="mt-4 space-y-2 border-l-2 border-dotted border-line pl-4">
                {day.timeline.map((item, i) => (
                  <li key={`${item.time}-${i}`} className="relative text-ink">
                    <span aria-hidden className="absolute top-2 -left-[1.3rem] size-2.5 rounded-full border-2 border-cobalt bg-paper" />
                    {item.time && <span className="mr-2 font-semibold whitespace-nowrap text-cobalt">{formatClock(item.time)}</span>}
                    {item.title}
                    {item.location && <span className="text-muted">, {item.location}</span>}
                    {item.description && <span className="block text-sm text-muted">{item.description}</span>}
                  </li>
                ))}
              </ol>
            )}
            {(day.stay || day.hotel || day.meals) && (
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
                {(day.hotel || day.stay) && (
                  <span className="flex items-center gap-2">
                    <Bed aria-hidden weight="bold" className="size-4 text-cobalt" />
                    {day.hotel ? `Overnight at ${day.hotel}` : `Overnight in ${day.stay}`}
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
