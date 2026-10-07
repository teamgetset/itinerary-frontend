"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import type { Testimonial } from "@/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { TestimonialCard } from "./testimonial-card";

/** Pixels per second: slow enough to read a card as it passes. */
const SPEED = 28;
/** After a swipe, drag, wheel or key press, wait this long before drifting again. */
const RESUME_AFTER_MS = 3000;

/**
 * Ambient, endlessly looping row of reviews. It moves a real scroll container rather than a CSS transform,
 * so touch, trackpad and keyboard scrolling all work, and the drift picks up wherever the visitor left it.
 * The list is rendered twice; when the first copy has scrolled past, the position jumps back by exactly one copy.
 * Pauses on hover, focus, interaction, the pause button, when off screen, and entirely under reduced motion.
 */
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const auto = !reduced && items.length > 1;

  useEffect(() => {
    const el = scroller.current;
    if (!el || !auto || paused) return;

    const copy = () => {
      const start = el.querySelector<HTMLElement>("[data-copy='a']");
      const repeat = el.querySelector<HTMLElement>("[data-copy='b']");
      return start && repeat ? repeat.offsetLeft - start.offsetLeft : 0;
    };
    let period = copy();
    let position = el.scrollLeft;
    let last = 0;
    let holdUntil = 0;
    let hovering = false;
    let focused = false;
    let visible = true;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 50) : 0;
      last = now;
      if (!hovering && !focused && visible && now > holdUntil) {
        position += (SPEED * elapsed) / 1000;
      } else {
        position = el.scrollLeft; // follow any manual scrolling
      }
      if (period > 0 && position >= period) position -= period;
      el.scrollLeft = position;
      frame = requestAnimationFrame(tick);
    };

    const hold = () => (holdUntil = performance.now() + RESUME_AFTER_MS);
    const onEnter = (event: PointerEvent) => event.pointerType === "mouse" && (hovering = true);
    const onLeave = () => (hovering = false);
    const onFocusIn = () => (focused = true);
    const onFocusOut = (event: FocusEvent) => (focused = el.contains(event.relatedTarget as Node));
    const onResize = () => (period = copy());

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", hold);
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("wheel", hold, { passive: true });
    el.addEventListener("keydown", hold);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    const resize = new ResizeObserver(onResize);
    resize.observe(el);
    const onScreen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    onScreen.observe(el);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("wheel", hold);
      el.removeEventListener("keydown", hold);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      resize.disconnect();
      onScreen.disconnect();
    };
  }, [auto, paused]);

  return (
    <div>
      <div
        ref={scroller}
        role="region"
        aria-label="Traveller reviews, scrollable"
        tabIndex={0}
        className="overflow-x-auto py-4 [scrollbar-width:none] [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] focus-visible:outline-offset-[-4px] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max gap-5 px-5 md:gap-6 md:px-8">
          {items.map((testimonial, i) => (
            <div key={testimonial.id} data-copy={i === 0 ? "a" : undefined} className="flex">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
          {/* Second copy for the seamless loop: hidden from assistive tech and keyboard. */}
          {auto &&
            items.map((testimonial, i) => (
              <div key={`${testimonial.id}-repeat`} data-copy={i === 0 ? "b" : undefined} aria-hidden inert className="flex">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
        </div>
      </div>

      {auto && (
        <div className="shell mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-navy transition-colors hover:bg-frost"
          >
            {paused ? <Play aria-hidden weight="fill" className="size-4" /> : <Pause aria-hidden weight="fill" className="size-4" />}
            {paused ? "Play reviews" : "Pause reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
