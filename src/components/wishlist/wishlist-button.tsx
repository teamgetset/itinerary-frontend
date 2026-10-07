"use client";

import { Heart } from "@phosphor-icons/react/dist/ssr";
import { useWishlist } from "@/hooks/use-wishlist";

const tones = {
  /** Floating over a photo. */
  overlay: "bg-white/90 shadow-sm backdrop-blur hover:bg-white",
  /** Sitting on a card or page surface. */
  plain: "border border-line bg-paper hover:border-navy/40",
} as const;

export function WishlistButton({
  slug,
  title,
  tone = "overlay",
  className = "",
}: {
  slug: string;
  title: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={`Save ${title} to wishlist`}
      className={`grid size-11 shrink-0 place-items-center rounded-full text-navy transition-colors duration-300 ${
        saved ? "border-sun bg-sun hover:bg-sun-deep" : tones[tone]
      } ${className}`}
    >
      <Heart aria-hidden weight={saved ? "fill" : "bold"} className={`size-5 ${saved ? "animate-pop" : ""}`} />
    </button>
  );
}
