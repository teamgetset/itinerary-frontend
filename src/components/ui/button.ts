/**
 * Button styles as a class builder, so links, anchors and buttons share one look.
 * Rule: one label per intent across the site ("Explore packages", "Chat on WhatsApp", "Download itinerary").
 */
const base =
  "inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap font-semibold transition-[background-color,color,border-color,translate] duration-300 ease-glide active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-sun text-night hover:bg-sun-deep",
  secondary: "bg-navy text-white hover:bg-cobalt",
  outline: "border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-white",
  /** Over photography: frosted, readable on light and dark images. */
  glass: "border border-white/55 bg-white/10 text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-night",
} as const;

const sizes = {
  md: "h-12 px-6 text-[0.95rem] leaf-sm",
  lg: "h-14 px-7 text-base leaf-sm",
} as const;

export type ButtonVariant = keyof typeof variants;

export function button({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

/** Round 44px icon button: the one shape exception to the leaf rule. */
export const iconButton =
  "relative grid size-11 shrink-0 place-items-center rounded-full text-navy transition-colors duration-300 hover:bg-frost";
