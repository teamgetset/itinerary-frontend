import { ArrowDown, ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { SiteContent } from "@/types";
import { button } from "@/components/ui/button";
import { bannerFrame, bannerHeight } from "@/components/shared/banner";
import { HeroSlideshow, type HeroSlide } from "./hero-slideshow";

/*
 * Keeps white type readable on any photo without dulling it: a soft pool of shade behind the
 * centred copy, a deeper fade at the bottom for the slideshow controls, and a light overall tint.
 */
const scrim = {
  background:
    "radial-gradient(ellipse 90% 44% at 50% 47%, rgb(0 33 66 / 0.62), rgb(0 33 66 / 0.42) 50%, rgb(0 33 66 / 0) 100%), linear-gradient(to top, rgb(0 33 66 / 0.62), rgb(0 33 66 / 0) 32%), rgb(0 33 66 / 0.2)",
};

const external = (href: string) => /^https?:\/\//.test(href);

/** Full-screen destination banner: slideshow behind, one centred composition in front. Copy comes from the admin. */
export function HomeHero({ slides, copy }: { slides: HeroSlide[]; copy: SiteContent["home.hero"] }) {
  const secondary = copy.secondaryCta;
  return (
    // Same container, frame and height as the branch and destination banners.
    <div className="shell pt-3 md:pt-5">
      <section
        aria-labelledby="hero-title"
        className={`${bannerFrame} ${bannerHeight} group/hero on-dark items-center`}
      >
        {/* The copy layer lets drags and swipes through to the photos; only the buttons take clicks. */}
        {slides.length > 0 && <HeroSlideshow slides={slides} />}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={scrim} />

        <div className="pointer-events-none relative z-20 flex w-full flex-col items-center px-6 pt-10 pb-20 text-center sm:pt-12 sm:pb-24 text-white [text-shadow:0_2px_24px_rgb(0_33_66/0.5)] lg:px-10">
          {copy.eyebrow && (
            <p className="leaf-xs type-label inline-flex animate-rise bg-sun px-3 py-1.5 text-night [text-shadow:none]">{copy.eyebrow}</p>
          )}
          {/*
            One line from 640px up. The line is 13.5em wide and the frame sits inside the page gutters,
            so the size tracks the viewport (6.3vw) and stops at 5.75rem. Phones wrap to two.
          */}
          <h1
            id="hero-title"
            className="type-display mt-6 animate-rise text-[clamp(2.25rem,6.3vw,5.75rem)] [animation-delay:80ms] sm:mt-7"
          >
            {copy.heading}
          </h1>
          {copy.description && (
            <p className="mt-5 max-w-[24rem] animate-rise text-lg leading-relaxed text-white/90 [animation-delay:160ms] sm:max-w-none xl:text-xl">
              {copy.description}
            </p>
          )}
          <div className="pointer-events-auto mt-7 flex w-full max-w-xs animate-rise flex-col gap-3 sm:mt-9 [animation-delay:240ms] sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <a href={copy.primaryCta.href} className={button({ size: "lg" })}>
              {copy.primaryCta.label}
              {copy.primaryCta.href.startsWith("#") ? (
                <ArrowDown aria-hidden weight="bold" className="size-4" />
              ) : (
                <ArrowRight aria-hidden weight="bold" className="size-4" />
              )}
            </a>
            {secondary && (
              <a
                href={secondary.href}
                {...(external(secondary.href) && { target: "_blank", rel: "noreferrer" })}
                className={button({ variant: "glass", size: "lg" })}
              >
                {secondary.href.includes("wa.me") && <WhatsappLogo aria-hidden weight="bold" className="size-5" />}
                {secondary.label}
                {external(secondary.href) && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
