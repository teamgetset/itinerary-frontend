"use client";

import Link from "next/link";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import { useWishlist } from "@/hooks/use-wishlist";
import { iconButton } from "@/components/ui/button";

/** Header link with a live count of saved packages. */
export function WishlistLink() {
  const { items } = useWishlist();
  const count = items.length;

  return (
    <Link href="/wishlist" className={iconButton} aria-label={count ? `Wishlist, ${count} saved` : "Wishlist"}>
      <Heart aria-hidden weight="bold" className="size-[1.375rem]" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-sun px-1 text-[0.6875rem] font-bold text-night"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
