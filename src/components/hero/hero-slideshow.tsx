"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import type { Photo } from "@/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface HeroSlide {
  photo: Photo;
  /** Arrival airport code, shown in the caption. */
  code: string;
  title: string;
  href: string;
}

/*
 * The photo renders wider than the screen when the hero is taller than 3:2, so phones and
 * portrait tablets ask for a size based on height.
 */
const SIZES = "(max-width: 640px) 80vh, (max-aspect-ratio: 3/2) 150vh, 100vw";
/** A mouse drag longer than this share of the slide width moves to the neighbouring slide. */
const DRAG_THRESHOLD = 0.12;
/** Scrolling counts as finished after this long without a scroll event. */
const SETTLE_MS = 140;

/**
 * Destination slideshow behind the hero copy: a horizontal, snapping scroll track.
 *
 * Manual: touch swipe and trackpad scrolling are native (momentum included); mouse drag, the arrows,
 * the progress bars and the arrow keys move it too.
 * Automatic: timing lives in CSS. The active progress bar advances the slideshow when it finishes, so anything
 * that pauses the bar (pause button, keyboard focus in the hero, hovering the controls, a finger or mouse
 * on the photos) pauses the slideshow, and any manual move restarts the bar.
 * Loop: a copy of the first slide follows the last one. Landing on the copy jumps, invisibly, to the real first slide.
 * With reduced motion there is no auto-advance, zoom or animated scrolling.
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  // Slides are mounted as they come up, plus the next one, so the next photo is loaded before it slides in.
  const [mounted, setMounted] = useState(1);
  const reduced = useReducedMotion();

  const count = slides.length;
  const next = (index + 1) % count;
  if (next > mounted) setMounted(next);

  const auto = !reduced && count > 1;
  const current = slides[index];

  const scrollToSlide = (position: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: position * el.clientWidth, behavior: smooth && !reduced ? "smooth" : "instant" });
  };

  /** Forward from the last slide lands on the copy of the first, which keeps the motion going the same way. */
  const goNext = () => scrollToSlide(index === count - 1 ? count : index + 1);

  /** Back from the first slide: stand on the copy of it (identical picture), then move back to the last. */
  const goPrevious = () => {
    if (index > 0) return scrollToSlide(index - 1);
    scrollToSlide(count, false);
    requestAnimationFrame(() => scrollToSlide(count - 1));
  };

  const goTo = (target: number) => target !== index && scrollToSlide(target);

  // Follow the scroll position: which slide is showing, and the loop jump once movement settles.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let settleTimer = 0;
    let pointerDown = false;

    const onScroll = () => {
      const position = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(position % count);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!pointerDown && Math.round(el.scrollLeft / el.clientWidth) === count) el.scrollLeft = 0;
      }, SETTLE_MS);
    };

    // Mouse drag (touch and trackpads scroll natively).
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      setHolding(true);
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
      el.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragging) el.scrollLeft = startLeft - (event.clientX - startX);
    };
    const onPointerUp = (event: PointerEvent) => {
      pointerDown = false;
      setHolding(false);
      if (!dragging) return;
      dragging = false;
      const width = el.clientWidth;
      const from = Math.round(startLeft / width);
      const moved = startX - event.clientX;
      const target = moved > width * DRAG_THRESHOLD ? from + 1 : moved < -width * DRAG_THRESHOLD ? from - 1 : from;
      el.style.scrollSnapType = "";
      el.scrollTo({ left: Math.max(0, Math.min(count, target)) * width, behavior: reduced ? "instant" : "smooth" });
    };

    // Keep the current slide in place when the banner resizes.
    let lastWidth = el.clientWidth;
    const resize = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      el.scrollLeft = Math.round(el.scrollLeft / lastWidth) * el.clientWidth;
      lastWidth = el.clientWidth;
    });

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    resize.observe(el);
    return () => {
      window.clearTimeout(settleTimer);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      resize.disconnect();
    };
  }, [count, reduced]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") goNext();
    else if (event.key === "ArrowLeft") goPrevious();
    else return;
    event.preventDefault();
  };

  // The real slides, then a copy of the first for the loop.
  const frames = [...slides, slides[0]];

  return (
    <>
      <div
        ref={track}
        className="absolute inset-0 z-0 flex cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {frames.map((slide, i) => {
          const isCopy = i === count;
          const showing = i % count === index;
          const load = isCopy || i <= mounted || i === count - 1;
          return (
            <div
              key={isCopy ? `${slide.photo.src}-loop` : slide.photo.src}
              aria-hidden={isCopy || !showing}
              className="relative h-full w-full flex-none snap-start snap-always overflow-hidden"
            >
              {load && (
                <Image
                  src={slide.photo.src}
                  alt={isCopy ? "" : slide.photo.alt}
                  fill
                  draggable={false}
                  sizes={SIZES}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  style={{ objectPosition: slide.photo.position }}
                  className={`object-cover ${showing && !reduced ? "animate-hero-zoom" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div data-hero-controls className="absolute inset-x-0 bottom-0 z-30">
        <div className="flex items-center justify-between gap-4 px-5 pb-4 sm:px-8 sm:pb-6 lg:px-10">
          <Link
            key={current.href}
            href={current.href}
            className="group/caption flex min-w-0 animate-rise items-center gap-3 py-2 text-white"
          >
            <span aria-hidden className="type-code text-lg sm:text-xl">
              {current.code}
            </span>
            <span className="sr-only sm:not-sr-only sm:truncate sm:text-sm sm:font-medium sm:text-white/90">
              <span className="sr-only">View </span>
              {current.title}
            </span>
            <ArrowRight
              aria-hidden
              weight="bold"
              className="size-4 shrink-0 transition-transform duration-300 group-hover/caption:translate-x-1"
            />
          </Link>

          <div
            role="group"
            aria-label="Slideshow, use the arrow keys to move between photos"
            onKeyDown={onKeyDown}
            className="flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous photo"
              className="hidden size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 sm:grid"
            >
              <CaretLeft aria-hidden weight="bold" className="size-5" />
            </button>
            <ol className="flex items-center">
              {slides.map((slide, i) => (
                <li key={slide.href}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${slide.title}`}
                    aria-current={i === index ? "true" : undefined}
                    className="group/dot grid h-11 w-7 place-items-center sm:w-10"
                  >
                    <span className="block h-[3px] w-5 overflow-hidden rounded-full bg-white/35 transition-colors group-hover/dot:bg-white/60 sm:w-8">
                      {i === index && (
                        <span
                          key={index}
                          onAnimationEnd={auto ? goNext : undefined}
                          className={`block h-full origin-left bg-white ${
                            auto
                              ? `animate-hero-progress group-has-[:focus-visible]/hero:[animation-play-state:paused] [[data-hero-controls]:hover_&]:[animation-play-state:paused] ${
                                  paused || holding ? "[animation-play-state:paused]" : ""
                                }`
                              : ""
                          }`}
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="hidden size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 sm:grid"
            >
              <CaretRight aria-hidden weight="bold" className="size-5" />
            </button>
            {auto && (
              <button
                type="button"
                onClick={() => setPaused(!paused)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className="grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
              >
                {paused ? (
                  <Play aria-hidden weight="fill" className="size-4" />
                ) : (
                  <Pause aria-hidden weight="fill" className="size-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
