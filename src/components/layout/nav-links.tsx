"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/types";

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="group type-label relative inline-flex h-11 items-center px-4 text-xs text-navy"
          >
            {item.label}
            <span
              aria-hidden
              className="leaf-xs absolute inset-x-4 bottom-1.5 h-[3px] origin-left scale-x-0 bg-navy/25 transition-transform duration-500 ease-glide group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 group-aria-[current=page]:bg-sun"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
