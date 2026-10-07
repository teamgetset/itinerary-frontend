import Link from "next/link";
import { User } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { getBranches } from "@/services/branches";
import { getSettings } from "@/services/settings";
import { iconButton } from "@/components/ui/button";
import { CurrencyToggle } from "@/components/currency/currency";
import { SearchDialog } from "@/components/search/search-dialog";
import { WishlistLink } from "@/components/wishlist/wishlist-link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

/* z-index scale: header 40. Dialogs use the browser top layer and need none. */
export async function SiteHeader() {
  const [branches, { content }] = await Promise.all([getBranches(), getSettings()]);
  const links = content.navigation.header;

  return (
    <header data-elevate className="sticky top-0 z-40 border-b border-transparent bg-mist/90 backdrop-blur-lg">
      <div className="shell grid h-16 grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_auto_1fr] lg:h-[4.5rem]">
        <Link href="/" aria-label={`${siteConfig.name}, home`} className="justify-self-start">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks links={links} />
        </nav>

        <div className="flex items-center gap-0.5 justify-self-end">
          {/* Phones switch currency in the menu (and on package pages): the header has no room. */}
          <CurrencyToggle className="mr-2 hidden sm:flex" />
          <SearchDialog />
          <WishlistLink />
          <Link href="/account" aria-label="Account" className={`${iconButton} hidden sm:grid`}>
            <User aria-hidden weight="bold" className="size-[1.375rem]" />
          </Link>
          <MobileMenu links={links} branches={branches.map(({ slug, name, phone }) => ({ slug, name, phone }))} />
        </div>
      </div>
    </header>
  );
}
