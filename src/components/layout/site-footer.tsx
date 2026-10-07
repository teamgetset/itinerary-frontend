import Link from "next/link";
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  Phone,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { getBranches } from "@/services/branches";
import { getSettings } from "@/services/settings";
import { Logo } from "./logo";

const linkClass = "text-white/75 transition-colors hover:text-sun";
const SOCIAL_ICONS = { instagram: InstagramLogo, linkedin: LinkedinLogo, facebook: FacebookLogo, youtube: YoutubeLogo, x: XLogo, tiktok: TiktokLogo };

export async function SiteFooter() {
  const [branches, { content }] = await Promise.all([getBranches(), getSettings()]);

  return (
    <footer className="on-dark bg-night text-sm text-white/75">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Link href="/" aria-label={`${siteConfig.name}, home`} className="inline-block">
            <Logo tone="white" />
          </Link>
          <p className="mt-6 max-w-xs leading-relaxed">{content.footer.tagline}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-3">
          <div>
            <h2 className="type-label text-white">Explore</h2>
            <ul className="mt-5 space-y-3">
              {content.navigation.footer.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="type-label text-white">Your trips</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/wishlist" className={linkClass}>
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className={linkClass}>
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="grid gap-8 sm:grid-cols-2 md:col-span-2 lg:col-span-5">
          {branches.map((branch) => (
            <div key={branch.slug}>
              <h2 className="type-label text-white">{branch.name} office</h2>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className={`${linkClass} flex items-center gap-2 whitespace-nowrap`}>
                    <Phone aria-hidden weight="bold" className="size-4 shrink-0" />
                    {branch.phone}
                  </a>
                </li>
                {branch.email && (
                  <li>
                    <a href={`mailto:${branch.email}`} className={`${linkClass} flex items-center gap-2 whitespace-nowrap`}>
                      <EnvelopeSimple aria-hidden weight="bold" className="size-4 shrink-0" />
                      {branch.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {content.footer.legalName}
          </p>
          <ul className="flex items-center gap-1">
            {content.social.map((link) => {
              const Icon = SOCIAL_ICONS[link.network as keyof typeof SOCIAL_ICONS] ?? InstagramLogo;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label} (opens in a new tab)`}
                    className="grid size-11 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-sun"
                  >
                    <Icon aria-hidden weight="bold" className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
