import Image from "next/image";
import type { Branch } from "@/types";
import { bannerFrame, bannerHeight } from "@/components/shared/banner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

const scrim = {
  background:
    "radial-gradient(ellipse 80% 55% at 50% 52%, rgb(0 33 66 / 0.6), rgb(0 33 66 / 0.35) 55%, rgb(0 33 66 / 0.1) 100%), rgb(0 33 66 / 0.15)",
};

/** Branch banner: in the page container like every other banner, with the home hero's centred title. */
export function BranchBanner({ branch }: { branch: Branch }) {
  const count = branch.packageCount;
  return (
    <div className="shell pt-6 lg:pt-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: `${branch.name} branch`, path: `/branches/${branch.slug}` },
        ]}
      />
      <section
        aria-labelledby="branch-title"
        className={`${bannerFrame} ${bannerHeight} on-dark mt-6 items-center lg:mt-8`}
      >
        <Image
          src={branch.banner.src}
          alt={branch.banner.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1440px) 1344px, (min-width: 1024px) 100vw, (min-width: 640px) 120vw, 160vw"
          style={{ objectPosition: branch.banner.position }}
          className="-z-20 animate-settle object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10" style={scrim} />

        <div className="flex w-full flex-col items-center px-6 py-12 text-center text-white [text-shadow:0_2px_24px_rgb(0_33_66/0.5)] sm:px-10">
          <p className="leaf-xs type-label inline-flex animate-rise items-center gap-2 bg-sun px-3 py-1.5 text-night [text-shadow:none]">
            {branch.airport && (
              <>
                {branch.airport.code}
                <span aria-hidden>·</span>
              </>
            )}
            {count} {count === 1 ? "package" : "packages"}
          </p>
          <h1
            id="branch-title"
            className="type-display mt-6 animate-rise text-[clamp(2.75rem,8vw,6rem)] [animation-delay:80ms]"
          >
            {branch.name} branch
          </h1>
          <p className="mt-5 max-w-2xl animate-rise text-lg leading-relaxed text-white/90 [animation-delay:160ms] xl:text-xl">
            {branch.description}
          </p>
        </div>
      </section>
    </div>
  );
}
