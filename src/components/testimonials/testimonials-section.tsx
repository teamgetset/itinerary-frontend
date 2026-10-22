import { ArrowUpRight, Star } from "@phosphor-icons/react/dist/ssr";
import { getSettings } from "@/services/settings";
import { getGoogleReviews, getTestimonials } from "@/services/testimonials";
import { TestimonialCarousel } from "./testimonial-carousel";

/**
 * Site-wide reviews band, rendered once in the root layout just above the footer (but not on package pages, which show
 * only their own reviews): the reviews entered in the admin, then those of GETSET's Google Business Profiles (newest
 * first), with each profile's rating and total as Google gives them and a link to the profile.
 */
export async function TestimonialsSection() {
  const [manual, google, { content }] = await Promise.all([getTestimonials(), getGoogleReviews(), getSettings()]);
  const testimonials = [...manual, ...google.reviews];
  if (testimonials.length === 0) return null;
  const copy = content.testimonials;
  // "Read all reviews" opens the Google profile once connected, else the source of the reviews entered in the admin.
  const googleUrl = google.profiles.find((profile) => profile.mapsUri)?.mapsUri;
  const sourceUrl = googleUrl ?? manual[0]?.source?.url;
  const sourceName = googleUrl ? "Google" : manual[0]?.source?.name;

  return (
    <section aria-labelledby="testimonials-title" className="overflow-hidden border-t border-line bg-frost/60 py-20 lg:py-28">
      <div data-reveal className="shell flex flex-col items-center text-center">
        <h2 id="testimonials-title" className="type-display text-4xl text-navy md:text-5xl">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{copy.description}</p>
        {google.profiles.length > 0 && (
          <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-sm text-muted">
            {google.profiles.map((profile, index) => (
              <li key={profile.mapsUri ?? index} className="flex items-center gap-1.5">
                <Star aria-hidden weight="fill" className="size-4 text-sun-deep" />
                <span>
                  {profile.averageRating !== null && (
                    <>
                      <span className="font-semibold text-ink">{profile.averageRating.toFixed(1)}</span>
                      <span className="sr-only"> out of 5</span> ·{" "}
                    </>
                  )}
                  {profile.totalReviewCount} {profile.totalReviewCount === 1 ? "review" : "reviews"} on Google
                  {google.profiles.length > 1 && profile.title && ` for ${profile.title}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        {sourceUrl && sourceName && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt hover:text-navy"
          >
            Read all reviews on {sourceName}
            <ArrowUpRight aria-hidden weight="bold" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <div className="mt-10 lg:mt-14">
        <TestimonialCarousel items={testimonials} />
      </div>
    </section>
  );
}
