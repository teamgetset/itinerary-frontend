import { cache } from "react";
import type { Testimonial } from "@/types";
import { fetchApi, orEmpty } from "@/lib/api";
import { toGoogleTestimonials, toTestimonial, type GoogleReviewsDto, type TestimonialDto } from "@/lib/mappers";

/** Published reviews in the admin's order. Fifty is plenty for the carousel. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const read = fetchApi<TestimonialDto[]>("/testimonials?pageSize=50", { tags: ["testimonials"] }).then((result) => result?.data ?? []);
  return (await orEmpty(read, "testimonials")).map(toTestimonial);
});

/**
 * Reviews from GETSET's Google Business Profiles (read by the API), with each profile's rating and total as Google
 * gives them. Empty when they are not connected or the API cannot be reached: the rest of the page still renders.
 */
export const getGoogleReviews = cache(async () => {
  const dto = await fetchApi<GoogleReviewsDto>("/google-reviews", { tags: ["testimonials"] })
    .then((result) => result?.data ?? null)
    .catch((error: unknown) => {
      console.error("GETSET API: Google reviews unavailable, left out.", error);
      return null;
    });
  if (!dto?.enabled) return { reviews: [], profiles: [] };
  return {
    reviews: toGoogleTestimonials(dto),
    profiles: dto.locations.filter((location) => location.totalReviewCount > 0),
  };
});
