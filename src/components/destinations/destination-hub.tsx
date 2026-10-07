import Image from "next/image";
import { notFound } from "next/navigation";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { whatsappLink } from "@/config/site";
import { getDestination } from "@/services/destinations";
import { getPackagesByDestination, getPackagesPage } from "@/services/packages";
import { getSettings } from "@/services/settings";
import { Price } from "@/components/currency/currency";
import { button } from "@/components/ui/button";
import { bannerFrame, bannerHeight } from "@/components/shared/banner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ExploreMore } from "@/components/packages/explore-more";
import { PackageFeature } from "@/components/packages/package-feature";

/** Landing page for a destination: its facts, every package going there, and bookable add-ons. */
export async function DestinationHub({ slug }: { slug: string }) {
  const destination = await getDestination(slug);
  if (!destination) notFound();
  const path = `/destinations/${destination.slug}`;

  const [packages, others, { content }] = await Promise.all([
    getPackagesByDestination(slug),
    getPackagesPage({ page: 1, pageSize: 12 }),
    getSettings(),
  ]);
  const suggestions = others.items.filter((pkg) => pkg.destinationName !== destination.name).slice(0, 4);

  return (
    <>
      <div className="shell pt-6 lg:pt-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: destination.name, path },
          ]}
        />

        <section className={`${bannerFrame} ${bannerHeight} mt-6 items-end lg:mt-8`}>
          <Image
            src={destination.hero.src}
            alt={destination.hero.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1440px) 1344px, (min-width: 1024px) 100vw, (min-width: 640px) 120vw, 160vw"
            style={{ objectPosition: destination.hero.position }}
            className="-z-10 animate-settle object-cover"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-night/85 via-night/30 to-night/0" />
          <div className="p-6 text-white sm:p-10 lg:p-14">
            <h1 className="type-display animate-rise text-[clamp(3.5rem,15vw,9rem)] leading-[0.92]">{destination.name}</h1>
            <p className="mt-4 max-w-xl animate-rise text-lg leading-relaxed text-white/90 [animation-delay:100ms] sm:text-xl">
              {destination.summary}
            </p>
          </div>
        </section>

        <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {destination.facts.map((fact) => (
            <div key={fact.label} className="border-l-2 border-sun pl-5">
              <dt className="type-label text-muted">{fact.label}</dt>
              <dd className="mt-2 leading-relaxed text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="destination-packages" className="shell mt-20 lg:mt-28">
        <h2 id="destination-packages" data-reveal className="type-display text-4xl text-navy md:text-5xl">
          {destination.name} packages
        </h2>
        <div className="mt-12 space-y-16 lg:mt-16 lg:space-y-24">
          {packages.length ? (
            packages.map((pkg) => <PackageFeature key={pkg.slug} pkg={pkg} />)
          ) : (
            <p className="leaf-md bg-paper p-8 text-muted ring-1 ring-line">New trips to {destination.name} are on the way.</p>
          )}
        </div>
      </section>

      {destination.experiences && destination.experiences.length > 0 && (
        <section aria-labelledby="experiences" className="shell mt-24 lg:mt-32">
          <div data-reveal className="max-w-2xl">
            <h2 id="experiences" className="type-display text-4xl text-navy md:text-5xl">
              Add an experience
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Book any of these on their own or add them to a package. Prices are per person.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destination.experiences.map((experience) => (
              <li
                key={experience.name}
                data-reveal
                className="leaf-md flex items-center justify-between gap-6 bg-paper px-6 py-5 ring-1 ring-line"
              >
                <span className="font-medium text-ink">{experience.name}</span>
                <span className="shrink-0 text-sm text-muted">
                  from <Price prices={experience.prices} className="font-semibold text-navy" />
                </span>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink(content.contact.whatsapp, `Hi GETSET, I'd like to book an experience in ${destination.name}.`)}
            target="_blank"
            rel="noreferrer"
            className={button({ variant: "outline", className: "mt-10" })}
          >
            <WhatsappLogo aria-hidden weight="bold" className="size-5" />
            Chat on WhatsApp
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </section>
      )}

      <ExploreMore packages={suggestions} />
    </>
  );
}
