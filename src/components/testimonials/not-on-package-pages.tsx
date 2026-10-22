"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Leaves the site-wide reviews band off package pages (and their admin previews): a package page shows only the
 * reviews linked to that package, in its own Reviews section.
 */
export function NotOnPackagePages({ children }: { children: ReactNode }) {
  return /^\/(preview\/)?packages\/[^/]+/.test(usePathname()) ? null : children;
}
