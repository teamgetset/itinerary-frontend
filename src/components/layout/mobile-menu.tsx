"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Heart, List, Phone, User, X } from "@phosphor-icons/react/dist/ssr";
import type { Branch, NavLink } from "@/types";
import { siteConfig } from "@/config/site";
import { iconButton } from "@/components/ui/button";
import { CurrencyToggle } from "@/components/currency/currency";
import { Logo } from "./logo";
import { isActive } from "./nav-links";

export function MobileMenu({ links, branches }: { links: NavLink[]; branches: Pick<Branch, "slug" | "name" | "phone">[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-label="Open menu"
        className={`${iconButton} md:hidden`}
      >
        <List aria-hidden weight="bold" className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-mist p-0 text-ink backdrop:bg-transparent"
      >
        <div className="flex min-h-full flex-col pb-8">
          <div className="shell flex h-16 items-center justify-between">
            <Link href="/" onClick={close} aria-label={`${siteConfig.name}, home`}>
              <Logo />
            </Link>
            <button type="button" onClick={close} aria-label="Close menu" className={iconButton}>
              <X aria-hidden weight="bold" className="size-6" />
            </button>
          </div>

          <nav aria-label="Main" className="shell mt-10">
            <ul>
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="group type-display flex items-center justify-between border-b border-line py-5 text-[2.5rem] text-navy aria-[current=page]:text-cobalt"
                  >
                    {item.label}
                    <span aria-hidden className="leaf-xs hidden h-2 w-8 bg-sun group-aria-[current=page]:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shell mt-8 flex items-center justify-between gap-4">
            <p className="type-label text-muted">Show prices in</p>
            <CurrencyToggle />
          </div>

          <div className="shell mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/wishlist"
              onClick={close}
              className="leaf-sm flex items-center gap-3 bg-paper px-4 py-4 font-semibold text-navy ring-1 ring-line"
            >
              <Heart aria-hidden weight="bold" className="size-5" /> Wishlist
            </Link>
            <Link
              href="/account"
              onClick={close}
              className="leaf-sm flex items-center gap-3 bg-paper px-4 py-4 font-semibold text-navy ring-1 ring-line"
            >
              <User aria-hidden weight="bold" className="size-5" /> Account
            </Link>
          </div>

          <ul className="shell mt-auto space-y-3 pt-10">
            {branches.map((branch) => (
              <li key={branch.slug}>
                <a
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-between gap-4 text-sm text-muted"
                >
                  <span>{branch.name} office</span>
                  <span className="flex items-center gap-2 font-semibold text-navy">
                    <Phone aria-hidden weight="bold" className="size-4" />
                    {branch.phone}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
