"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sticky sidebar panel (from lg). A panel taller than the screen scrolls with the page until its bottom
 * is in view, then sticks there, so the actions at its end stay reachable on short screens.
 */
export function StickyPanel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => el.style.setProperty("--panel-height", `${el.offsetHeight}px`));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="lg:sticky lg:top-[min(6rem,calc(100svh_-_var(--panel-height,0px)_-_1rem))]">
      {children}
    </div>
  );
}
