import { Airplane } from "@phosphor-icons/react/dist/ssr";

/**
 * Signature motif, lifted from the logo's GT mark: a dashed trail, a plane, then the arrival code.
 * Inside a `group` (cards), the plane eases forward on hover. Without a city it is purely decorative.
 */
export function RouteLine({ code, city, className = "" }: { code: string; city?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-cobalt ${className}`} aria-hidden={city ? undefined : true}>
      <span aria-hidden className="h-px flex-1 border-t-2 border-dashed border-cobalt/35" />
      <Airplane
        aria-hidden
        weight="fill"
        className="size-5 shrink-0 rotate-90 transition-[translate] duration-500 ease-glide group-hover:translate-x-1.5"
      />
      <span aria-hidden className="type-code text-[1.65rem] text-navy">
        {code}
      </span>
      {city && <span className="sr-only">Arriving in {city}</span>}
    </div>
  );
}
