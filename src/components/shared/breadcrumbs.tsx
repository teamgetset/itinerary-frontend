import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "./json-ld";

/** Visible trail plus matching BreadcrumbList data. The last item is the current page. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {current ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-navy">
                    {item.name}
                  </Link>
                  <CaretRight aria-hidden weight="bold" className="size-3" />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
