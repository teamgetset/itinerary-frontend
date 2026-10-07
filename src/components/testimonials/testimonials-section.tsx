import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getSettings } from "@/services/settings";
import { getTestimonials } from "@/services/testimonials";
import { TestimonialCarousel } from "./testimonial-carousel";

/** Site-wide reviews band, rendered once in the root layout just above the footer. */
export async function TestimonialsSection() {
  const [testimonials, { content }] = await Promise.all([getTestimonials(), getSettings()]);
  if (testimonials.length === 0) return null;
  const copy = content.testimonials;
  // Link to the reviews' source (e.g. Google) when the reviews come from one place.
  const sourceUrl = testimonials[0]?.source?.url;
  const sourceName = testimonials[0]?.source?.name;

  return (
    <section aria-labelledby="testimonials-title" className="overflow-hidden border-t border-line bg-frost/60 py-20 lg:py-28">
      <div data-reveal className="shell flex flex-col items-center text-center">
        <h2 id="testimonials-title" className="type-display text-4xl text-navy md:text-5xl">
          {copy.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{copy.description}</p>
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
