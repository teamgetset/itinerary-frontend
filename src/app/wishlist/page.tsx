import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <div className="shell py-12 lg:py-20">
      <h1 className="type-display text-[clamp(2.5rem,8vw,4rem)] text-navy">Your wishlist</h1>
      <div className="mt-8 lg:mt-10">
        <WishlistView />
      </div>
    </div>
  );
}
